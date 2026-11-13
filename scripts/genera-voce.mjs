// node scripts/genera-voce.mjs <film> [--capitolo <id>] [--rifai] [--prova]
//   Genera con ElevenLabs le clip della voce di un film (00_copertina, 01_<id>…, NN_finale) in audio/<film>/,
//   una chiamata per parte, con il testo del JSON (sottotitoli = voce) e la voce di scripts/audio/voce.json.
//   Le clip già presenti si saltano (--rifai le rigenera; --capitolo <id> ne fa una sola, anche "copertina" o "finale").
//   --prova: mostra testi e caratteri (= crediti) senza chiamare ElevenLabs.
// Altri comandi: node scripts/genera-voce.mjs --voci [nome] (voci dell'account), --modelli (modelli disponibili).
// Chiave (permessi: Text to Speech; Voices: read per cercare la voce per nome): variabile d'ambiente ELEVENLABS_API_KEY,
// oppure, nell'ambiente cloud, segreto di rete per api.elevenlabs.io con intestazione xi-api-key (la aggiunge il proxy).
// Dopo: npm run render -- <film> (se il video non c'è) e npm run voce -- <film> per montare e controllare i tempi.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { duration, loadFilm, timeline } from './audio/film.mjs';
import { lunghi, loadLungo, trattiLungo } from './lunghi/tempi.mjs';

const API = 'https://api.elevenlabs.io';
const CONFIG = 'scripts/audio/voce.json';
const TMP = 'out/voce-tmp';
const EXT = ['.wav', '.mp3', '.m4a', '.flac', '.ogg'];

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const flag = (name) => args.includes(`--${name}`);
const conf = JSON.parse(readFileSync(CONFIG, 'utf8'));

/** Chiamata all'API con curl (rispetta il proxy e c'è anche in Windows 10+); la chiave passa da stdin, non dagli argomenti. */
const api = (method, path, { body, out } = {}) => {
  // in locale la chiave viene da ELEVENLABS_API_KEY; nell'ambiente cloud la aggiunge il proxy (segreto di rete xi-api-key)
  const key = process.env.ELEVENLABS_API_KEY;
  mkdirSync(TMP, { recursive: true });
  const resp = out ?? `${TMP}/risposta.json`;
  const curlArgs = ['-sS', '-K', '-', '-X', method, '-o', resp, '-w', '%{http_code}', `${API}${path}`];
  if (body) {
    writeFileSync(`${TMP}/richiesta.json`, JSON.stringify(body));
    curlArgs.push('-H', 'Content-Type: application/json', '--data-binary', `@${TMP}/richiesta.json`);
  }
  const res = spawnSync('curl', curlArgs, { input: key ? `header = "xi-api-key: ${key}"\n` : '', encoding: 'utf8' });
  if (res.error) throw new Error(`curl non trovato (${res.error.message})`);
  const code = Number(res.stdout);
  if (res.status !== 0 || code !== 200) {
    const msg = existsSync(resp) ? readFileSync(resp, 'utf8').slice(0, 600) : res.stderr;
    if (out) rmSync(out, { force: true });
    console.error(`ElevenLabs ${method} ${path}: ${code || 'nessuna risposta'} ${msg.trim()}`);
    if (!code) console.error('  api.elevenlabs.io non raggiungibile: rete assente o dominio non consentito.');
    if (code === 401) console.error('  Chiave mancante o non valida: ELEVENLABS_API_KEY, o il segreto di rete xi-api-key per api.elevenlabs.io.');
    process.exit(1);
  }
  return out ? null : JSON.parse(readFileSync(resp, 'utf8'));
};

if (flag('voci')) {
  const cerca = opt('voci') ?? '';
  const { voices } = api('GET', `/v2/voices?page_size=100${cerca ? `&search=${encodeURIComponent(cerca)}` : ''}`);
  voices.forEach((v) => console.log(`${v.voice_id}  ${v.name}`));
  process.exit(0);
}
if (flag('modelli')) {
  api('GET', '/v1/models').forEach((m) => console.log(`${m.model_id.padEnd(28)} ${m.name}`));
  process.exit(0);
}

const slug = args.find((a, i) => !a.startsWith('--') && !(i > 0 && ['--capitolo'].includes(args[i - 1])));
if (!slug) {
  console.error('Uso: node scripts/genera-voce.mjs <film> [--capitolo <id>] [--rifai] [--prova]');
  process.exit(1);
}
const dir = `audio/${slug}`;
const solo = opt('capitolo');
// video lunghi (VIDEO-LUNGO.md): solo le parti nuove (aggancio, capitoli nuovi, chiusura); le clip degli episodi si riusano
const lungo = lunghi().includes(slug);
const film = lungo ? loadLungo(slug) : loadFilm(slug);
// "pronuncia" nel JSON del film (facoltativo): parole da leggere in un altro modo, es. { "883": "otto otto tre" };
// cambia solo il testo mandato a ElevenLabs, i sottotitoli restano come sono
const leggi = (testo) => Object.entries(film.pronuncia ?? {}).reduce((a, [da, a2]) => a.split(da).join(a2), testo);
const segmenti = lungo
  ? trattiLungo(slug, film).filter((x) => x.voce?.dir === dir).map((x) => ({ id: x.id, dur: x.dur, testo: x.testo, base: x.voce.base }))
  : timeline(film).segments.map((s) => ({ ...s, base: `${String(s.n).padStart(2, '0')}_${s.id}` }));
const parts = segmenti
  .filter((s) => s.testo.length && (!solo || s.id === solo))
  .map((s) => ({ ...s, testo: leggi(s.testo.join(' ')) }));
if (!parts.length) {
  console.error(solo ? `Nessuna parte "${solo}" con testo voce in films/${slug}.json` : `Nessun testo voce in films/${slug}.json`);
  process.exit(1);
}
mkdirSync(dir, { recursive: true });
const esistente = (base) => readdirSync(dir).find((f) => EXT.some((e) => f === base + e));
const daFare = parts.filter((p) => flag('rifai') || solo || !esistente(p.base));
const caratteri = daFare.reduce((a, p) => a + p.testo.length, 0);

console.log(`Voce per ${slug}: ${daFare.length} clip da generare, ${caratteri} caratteri (circa ${caratteri} crediti).`);
if (flag('prova')) {
  daFare.forEach((p) => console.log(`  ${p.base.padEnd(16)} ${String(p.testo.length).padStart(4)}  ${p.testo}`));
  process.exit(0);
}

// ---- voce: voice_id dal file, altrimenti cercata per nome e salvata
if (!conf.voice_id) {
  const { voices } = api('GET', `/v2/voices?page_size=100&search=${encodeURIComponent(conf.nome)}`);
  const v = voices.find((x) => x.name.toLowerCase().startsWith(conf.nome.toLowerCase())) ?? voices[0];
  if (!v) {
    console.error(`Voce "${conf.nome}" non trovata nell'account: aggiungila dalla Voice Library o scrivi il voice_id in ${CONFIG}.`);
    process.exit(1);
  }
  conf.voice_id = v.voice_id;
  writeFileSync(CONFIG, `${JSON.stringify(conf, null, 2)}\n`);
  console.log(`  voce: ${v.name} (${v.voice_id}), salvata in ${CONFIG}`);
}

// ---- una chiamata per parte; ogni clip sostituisce quella con lo stesso nome
for (const p of daFare) {
  const dest = `${dir}/${p.base}.mp3`;
  api('POST', `/v1/text-to-speech/${conf.voice_id}?output_format=${conf.formato}`, {
    body: { text: p.testo, model_id: conf.modello, voice_settings: conf.impostazioni },
    out: `${TMP}/${p.base}.mp3`,
  });
  const vecchia = esistente(p.base);
  if (vecchia) rmSync(`${dir}/${vecchia}`);
  writeFileSync(dest, readFileSync(`${TMP}/${p.base}.mp3`));
  const len = duration(dest);
  const nota = len > p.dur ? `  più lunga del capitolo di ${(len - p.dur).toFixed(1)} s: npm run voce la accorcia (fino al 25%)` : '';
  console.log(`  ${p.base.padEnd(16)} ${len.toFixed(2).padStart(5)} s / ${p.dur} s${nota}`);
}
console.log(`\nClip in ${dir}. Ora: npm run voce -- ${slug} (con out/${slug}.mp4 già fatto da npm run render -- ${slug}).`);
