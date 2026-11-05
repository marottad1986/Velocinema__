// node scripts/strumenti/ascolta-voce.mjs <film> [--capitoli a,b] [--cartella <dir>] [--senza-trascrizione] [--rifai-trascrizione]
//   Misure per il revisore della voce, clip per clip (audio/<film>/NN_<id>):
//   - cadenza: durata del parlato, parole al secondo, accelerazione che servirà a npm run voce, pause lunghe;
//   - volume: loudness integrata (LUFS) e picco, per trovare clip più forti o più deboli delle altre;
//   - pronuncia: trascrive la clip con ElevenLabs Speech to Text (scribe) e la confronta parola per parola con il testo
//     mandato alla voce (JSON + "pronuncia"): le parole sentite diverse da quelle scritte sono le pronunce da ascoltare;
//     con i tempi delle parole dà anche il ritmo e la pausa dopo ogni frase.
//   Trascrizioni in cache in out/voce-tmp/trascrizioni/ (--rifai-trascrizione le rifà). Report anche in
//   out/revisione/<film>/voce.md.
//   La trascrizione richiede sulla chiave ElevenLabs il permesso «Speech to Text» (oltre a Text to Speech e Voices: read);
//   senza, lo script lo dice e fa solo le misure di cadenza e volume.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { duration, loadFilm, run, timeline } from '../audio/film.mjs';

const API = 'https://api.elevenlabs.io';
const TMP = 'out/voce-tmp';
const CACHE = `${TMP}/trascrizioni`;
const EXT = ['.wav', '.mp3', '.m4a', '.flac', '.ogg'];
const MARGIN = 0.1; // come scripts/voce.mjs
const MAX_PAUSE = 0.25;
const MAX_SPEEDUP = 1.25;

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const flag = (name) => args.includes(`--${name}`);
const slug = args.find((a, i) => !a.startsWith('--') && !(i > 0 && ['--capitoli', '--cartella'].includes(args[i - 1])));
if (!slug) {
  console.error('Uso: node scripts/strumenti/ascolta-voce.mjs <film> [--capitoli a,b] [--cartella <dir>] [--senza-trascrizione] [--rifai-trascrizione]');
  process.exit(1);
}
const dir = opt('cartella', `audio/${slug}`);
const soloCap = opt('capitoli')?.split(',');
const film = loadFilm(slug);
const spiegato = film.formato === 'spiegato';
const leggi = (testo) => Object.entries(film.pronuncia ?? {}).reduce((a, [da, a2]) => a.split(da).join(a2), testo);
mkdirSync(CACHE, { recursive: true });

// ---- parole: confronto senza maiuscole, accenti finali, punteggiatura; apostrofi separano («dell'Oceano» → dell oceano)
const norm = (w) =>
  w
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]/gu, '');
const tokens = (s) =>
  s
    .replace(/[’']/g, "' ")
    .split(/[\s\-–—]+/)
    .map(norm)
    .filter(Boolean);
// parole per il ritmo, come le conta il progetto: ogni anno a quattro cifre vale 4 negli Spiegato semplice
const peso = (s) => s.split(/\s+/).filter(Boolean).reduce((a, w) => a + (spiegato && /^\d{4}\D*$/.test(w) ? 4 : 1), 0);

// ---- ffmpeg: clip senza silenzio ai bordi, pause, loudness
const TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse';
const ff = (argv) => spawnSync('ffmpeg', argv, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).stderr;
const pause = (file) => {
  const err = ff(['-hide_banner', '-i', file, '-af', 'silencedetect=noise=-40dB:d=0.18', '-f', 'null', '-']);
  const out = [];
  let s;
  for (const line of err.split('\n')) {
    const a = line.match(/silence_start: ([\d.]+)/);
    const b = line.match(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/);
    if (a) s = Number(a[1]);
    if (b && s !== undefined) out.push({ da: s, a: Number(b[1]), dur: Number(b[2]) });
  }
  return out;
};
const loudness = (file) => {
  const err = ff(['-hide_banner', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const sum = err.slice(err.lastIndexOf('Summary:'));
  return { lufs: Number(sum.match(/I:\s+(-?[\d.]+) LUFS/)?.[1]), picco: Number(sum.match(/Peak:\s+(-?[\d.]+) dBFS/)?.[1]) };
};

// ---- trascrizione con ElevenLabs (la chiave la mette il proxy nel cloud, o ELEVENLABS_API_KEY in locale)
let sttBloccata = flag('senza-trascrizione') ? 'esclusa con --senza-trascrizione' : null;
const trascrivi = (file, base) => {
  const cache = `${CACHE}/${slug}-${base}.json`;
  if (existsSync(cache) && !flag('rifai-trascrizione')) return JSON.parse(readFileSync(cache, 'utf8'));
  if (sttBloccata) return null;
  const key = process.env.ELEVENLABS_API_KEY;
  const resp = `${TMP}/stt-risposta.json`;
  const res = spawnSync(
    'curl',
    ['-sS', '-K', '-', '-X', 'POST', '-o', resp, '-w', '%{http_code}', `${API}/v1/speech-to-text`,
      '-F', 'model_id=scribe_v1', '-F', 'language_code=ita', '-F', 'timestamps_granularity=word',
      '-F', 'tag_audio_events=false', '-F', `file=@${file}`],
    { input: key ? `header = "xi-api-key: ${key}"\n` : '', encoding: 'utf8' },
  );
  const code = Number(res.stdout);
  if (code !== 200) {
    const msg = existsSync(resp) ? readFileSync(resp, 'utf8') : res.stderr;
    sttBloccata = /speech_to_text/.test(msg)
      ? 'la chiave ElevenLabs non ha il permesso «Speech to Text»: aggiungerlo alla chiave (sito ElevenLabs → API keys) per controllare la pronuncia'
      : `Speech to Text non disponibile (${code || 'nessuna risposta'}): ${msg.trim().slice(0, 200)}`;
    return null;
  }
  const json = JSON.parse(readFileSync(resp, 'utf8'));
  writeFileSync(cache, JSON.stringify(json));
  return json;
};

// ---- allineamento parola per parola (LCS) tra testo atteso e parole sentite
const allinea = (att, sen) => {
  const n = att.length;
  const m = sen.length;
  const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = att[i] === sen[j].w ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const map = new Array(n).fill(-1); // indice della parola sentita per ogni parola attesa
  const diff = [];
  let i = 0;
  let j = 0;
  let cur = null;
  const chiudi = () => {
    if (cur) diff.push(cur);
    cur = null;
  };
  while (i < n || j < m) {
    if (i < n && j < m && att[i] === sen[j].w) {
      chiudi();
      map[i++] = j++;
    } else {
      cur ??= { atteso: [], sentito: [], t: sen[Math.min(j, m - 1)]?.start ?? 0, i };
      if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) cur.sentito.push(sen[j++].raw);
      else cur.atteso.push(att[i++]);
    }
  }
  chiudi();
  return { map, diff };
};

// ---- clip
const files = existsSync(dir) ? readdirSync(dir) : [];
const righe = [];
const log = (s = '') => {
  console.log(s);
  righe.push(s);
};
const clips = [];
for (const s of timeline(film).segments) {
  if (!s.testo.length || (soloCap && !soloCap.includes(s.id))) continue;
  const base = `${String(s.n).padStart(2, '0')}_${s.id}`;
  const f = files.find((x) => x.slice(0, x.lastIndexOf('.')) === base && EXT.some((e) => x.toLowerCase().endsWith(e)));
  if (!f) {
    log(`manca ${dir}/${base}.* (nessuna clip)`);
    continue;
  }
  const src = `${dir}/${f}`;
  const trim = `${TMP}/ascolta-${base}.wav`;
  run('ffmpeg', ['-y', '-v', 'error', '-i', src, '-af', TRIM, '-ar', '48000', trim]);
  const len = duration(trim);
  let lenMont = len;
  if (len > s.dur - MARGIN) {
    const p2 = `${TMP}/ascolta-${base}-pause.wav`;
    run('ffmpeg', ['-y', '-v', 'error', '-i', src, '-af', `${TRIM},silenceremove=stop_periods=-1:stop_duration=${MAX_PAUSE}:stop_threshold=-40dB`, '-ar', '48000', p2]);
    lenMont = duration(p2);
  }
  const speed = lenMont <= s.dur - MARGIN ? 1 : lenMont / (s.dur - MARGIN);
  clips.push({ ...s, base, src, trim, len, speed, frasi: s.testo.map(leggi), pause: pause(trim), ...loudness(trim) });
}
if (!clips.length) {
  console.error(`Nessuna clip da ascoltare in ${dir}`);
  process.exit(1);
}
const medLufs = [...clips.map((c) => c.lufs)].sort((a, b) => a - b)[Math.floor(clips.length / 2)];

log(`# Voce di ${slug} (${dir})`);
log();
log('Riferimenti: circa 2,8 parole/s (frasi tra 2,2 e 3,4' + (spiegato ? '; Spiegato semplice: ≤ 3,4, meglio 3,1, anni a 4 cifre = 4 parole' : '') + '); accelerazione di npm run voce al massimo +25%;');
log('volume delle clip entro ±2 LU dalla mediana; pausa tra le frasi 0,2–0,9 s; nessuna pausa oltre 0,6 s a metà frase.');
log();
log('| clip | parlato | capitolo | accelerazione | parole/s | LUFS | picco | pause > 0,6 s |');
log('|---|---|---|---|---|---|---|---|');
for (const c of clips) {
  const parole = c.frasi.reduce((a, f) => a + peso(f), 0);
  c.wps = parole / c.len;
  const acc = c.speed === 1 ? 'nessuna' : `+${((c.speed - 1) * 100).toFixed(0)}%${c.speed > MAX_SPEEDUP ? ' TROPPO' : ''}`;
  const lunghe = c.pause.filter((p) => p.dur > 0.6).map((p) => `${p.da.toFixed(1)}s (${p.dur.toFixed(2)})`).join(', ') || '–';
  const vol = `${c.lufs.toFixed(1)}${Math.abs(c.lufs - medLufs) > 2 ? ' ⚠' : ''}`;
  const pk = `${c.picco.toFixed(1)}${c.picco > -1 ? ' ⚠' : ''}`;
  log(`| ${c.base} | ${c.len.toFixed(2)} s | ${c.dur} s | ${acc} | ${c.wps.toFixed(2)}${c.wps > 3.4 ? ' ⚠' : ''} | ${vol} | ${pk} | ${lunghe} |`);
}

// ---- pronuncia e ritmo frase per frase
log();
log('## Pronuncia e ritmo delle frasi');
for (const c of clips) {
  const stt = trascrivi(c.trim, c.base);
  if (!stt) continue;
  const sen = (stt.words ?? []).filter((w) => w.type === 'word').flatMap((w) => tokens(w.text).map((t) => ({ w: t, raw: w.text, start: w.start, end: w.end })));
  const att = [];
  const fraseDi = [];
  c.frasi.forEach((f, k) => tokens(f).forEach((t) => (att.push(t), fraseDi.push(k))));
  const { map, diff } = allinea(att, sen);
  log();
  log(`### ${c.base}`);
  if (!diff.length) log('- parole: tutte riconosciute come scritte');
  for (const d of diff) {
    const a = d.atteso.join(' ') || '(niente)';
    const s = d.sentito.join(' ') || '(niente)';
    const tipo = !d.atteso.length ? 'parola in più' : !d.sentito.length ? 'parola saltata' : 'sentito diverso';
    const num = /\d/.test(a + s) ? ' (numero: può essere solo come lo scrive la trascrizione)' : '';
    log(`- ${d.t.toFixed(1)} s, frase ${fraseDi[Math.min(d.i, fraseDi.length - 1)] + 1}: ${tipo}: scritto «${a}», sentito «${s}»${num}`);
  }
  // tempi di ogni frase dalle parole riconosciute
  c.frasi.forEach((f, k) => {
    const idx = map.filter((j, i) => fraseDi[i] === k && j >= 0);
    if (!idx.length) return log(`- frase ${k + 1}: nessuna parola riconosciuta`);
    const t0 = sen[idx[0]].start;
    const t1 = sen[idx[idx.length - 1]].end;
    const wps = peso(f) / Math.max(0.1, t1 - t0);
    const next = map.find((j, i) => fraseDi[i] === k + 1 && j >= 0);
    const dopo = next !== undefined ? sen[next].start - t1 : null;
    const interne = c.pause.filter((p) => p.da > t0 + 0.05 && p.a < t1 - 0.05 && p.dur > 0.6);
    const note = [
      wps > 3.4 ? 'veloce' : wps < 2.2 ? 'trascinata' : '',
      dopo !== null && dopo < 0.15 ? 'attaccata alla frase dopo' : '',
      dopo !== null && dopo > 0.9 ? 'pausa lunga dopo' : '',
      interne.length ? `pausa a metà frase a ${interne.map((p) => p.da.toFixed(1)).join(', ')} s` : '',
    ].filter(Boolean);
    log(`- frase ${k + 1}: ${t0.toFixed(1)}–${t1.toFixed(1)} s, ${wps.toFixed(2)} parole/s${dopo !== null ? `, pausa dopo ${dopo.toFixed(2)} s` : ''}${note.length ? ` ⚠ ${note.join('; ')}` : ''}`);
  });
}
if (sttBloccata) {
  log();
  log(`Pronuncia non controllata: ${sttBloccata}.`);
}
const rev = `out/revisione/${slug}`;
mkdirSync(rev, { recursive: true });
writeFileSync(`${rev}/voce.md`, `${righe.join('\n')}\n`);
console.log(`\nReport in ${rev}/voce.md`);
