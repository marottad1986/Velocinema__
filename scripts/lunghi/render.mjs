// node scripts/lunghi/render.mjs <slug> [--parte <id>] [--solo-audio] [--senza-video] [--capitoli] [--miniatura]
//   Video lungo orizzontale (VIDEO-LUNGO.md):
//   - out/<slug>-musica.wav: musica delle parti nuove (scripts/audio/<slug>.mjs) + musica intera di ogni episodio
//     (out/<episodio>-musica.wav, rigenerata), posata all'inizio del suo cartello: tutto sulla stessa griglia;
//   - out/<slug>.mp4: video 1920×1080 con la musica (--parte <id>: un tratto solo, out/<slug>--<id>.mp4);
//   - out/<slug>-voce.mp4: con la voce, se ci sono tutte le clip (episodi: audio/<episodio>/, parti nuove: audio/<slug>/).
//     Come npm run voce: silenzio ai bordi tolto, pause accorciate e accelerazione fino al 25% se una clip sfora, ducking;
//   - --capitoli: out/<slug>-capitoli.txt (capitoli YouTube da incollare nella descrizione);
//   - --miniatura: out/<slug>-miniatura.png (fotogramma 0, 1280×720, da caricare come miniatura).
//   --solo-audio: solo musica (e voce su un video già fatto); --senza-video: niente render, rifà solo audio e montaggio.
// Browser: REMOTION_BROWSER (in un ambiente cloud il Chromium installato).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { generaMusica } from '../musica.mjs';
import { createMix, writeWav } from '../audio/synth.mjs';
import { impulso, convolvi } from '../audio/sala.mjs';
import { scaricaCampioni } from '../audio/campioni.mjs';
import { scaricaEffetti } from '../audio/effetti.mjs';
import { duration, run } from '../audio/film.mjs';
import { durataLungo, episodiDi, inizioParti, loadLungo, lunghi, mmss, trattiLungo } from './tempi.mjs';

/** La voce e i sottotitoli dell'aggancio partono qui (fotogramma 0 = miniatura senza testo): come INIZIO_AGGANCIO in src/lunghi/Lungo.tsx. */
export const INIZIO_AGGANCIO = 0.4;
const FPS = 30;
/** Loudness comune della musica: ogni episodio era normalizzato da solo (picco −3 dB) e i livelli medi differiscono di
 *  diversi dB; nel lungo ogni pezzo si porta allo stesso livello integrato, così tra una stagione e l'altra non salta. */
const MUSICA_LUFS = -20;
const lufs = (file) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return Number(r.stderr.slice(r.stderr.lastIndexOf('Summary:')).match(/I:\s+(-?[\d.]+) LUFS/)?.[1]);
};

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const flag = (n) => args.includes(`--${n}`);
const slug = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1] === '--parte'));
if (!slug || !lunghi().includes(slug)) {
  console.error(`Uso: node scripts/lunghi/render.mjs <slug> [--parte <id>] [--solo-audio] [--capitoli] [--miniatura]\nVideo lunghi: ${lunghi().join(', ') || 'nessuno'}`);
  process.exit(1);
}
const L = loadLungo(slug);
const tr = trattiLungo(slug, L);
const END = durataLungo(tr);
mkdirSync('out', { recursive: true });

/** Inizio di ogni frase di un tratto (s nel video lungo), come Overlay16 / subtitleTimes. */
const frasi = (x) => {
  const inizio = x.tipo === 'aggancio' ? INIZIO_AGGANCIO : 0;
  const w = x.testo.map((l) => l.length + 6);
  const tot = w.reduce((a, b) => a + b, 0);
  const span = x.dur - inizio - 0.35;
  let cur = 0.15;
  return w.map((v) => { const s = x.start + inizio + cur; cur += (v / tot) * span; return s; });
};

// ---------------------------------------------------------------- capitoli YouTube
if (flag('capitoli')) {
  const ini = inizioParti(tr);
  const righe = L.parti.map((p) => `${mmss(ini.get(p))} ${p.capitolo_youtube}`);
  writeFileSync(`out/${slug}-capitoli.txt`, `${righe.join('\n')}\n`);
  console.log(`Capitoli YouTube (out/${slug}-capitoli.txt):\n${righe.join('\n')}`);
}

// ---------------------------------------------------------------- miniatura
const remotion = (argv) => {
  const res = spawnSync('npx', ['remotion', ...argv], { stdio: 'inherit', shell: process.platform === 'win32' });
  if (res.status !== 0) process.exit(res.status ?? 1);
};
if (flag('miniatura')) {
  remotion(['still', 'src/lunghi/index.ts', slug, `out/${slug}-miniatura.png`, '--frame=0', '--scale=0.6666667']);
  console.log(`Miniatura: out/${slug}-miniatura.png`);
}
if ((flag('capitoli') || flag('miniatura')) && !flag('solo-audio') && !opt('parte') && args.filter((a) => a.startsWith('--')).every((a) => ['--capitoli', '--miniatura'].includes(a))) process.exit(0);

// ---------------------------------------------------------------- musica
const generaMusicaLunga = async () => {
  // parti nuove
  const scorePath = `scripts/audio/${slug}.mjs`;
  const { default: score, strumenti = [], effetti = [], sala } = await import(pathToFileURL(path.resolve(scorePath)).href);
  scaricaCampioni(strumenti);
  scaricaEffetti(effetti);
  const T = { END, frase: (id, n) => frasi(tr.find((x) => x.id === id))[n] };
  for (const x of tr) T[x.id] = x.start;
  const mix = createMix(END);
  score(mix, T);
  const nuove = `out/${slug}-nuove.wav`;
  const ir = sala && impulso(sala);
  writeWav(mix, nuove, { peakDb: -3, fadeOut: 2, ...(ir && { wet: sala.wet ?? 0.5, riverbero: (ch, side) => convolvi(ch, ir[side]) }) });
  // episodi: la loro musica intera, dall'inizio del cartello
  const ini = inizioParti(tr);
  const ep = [];
  for (const p of L.parti.filter((q) => q.tipo === 'episodio')) {
    const wav = await generaMusica(p.film);
    if (!wav) throw new Error(`Manca lo spartito di ${p.film}`);
    const t0 = ini.get(p);
    if (Math.abs((t0 * L.bpm) / 60 - Math.round((t0 * L.bpm) / 60)) > 1e-6) console.warn(`  ATTENZIONE ${p.film} entra a ${t0} s, fuori dal battito di ${L.bpm} bpm`);
    ep.push({ wav, t0 });
  }
  const out = `out/${slug}-musica.wav`;
  const FMT = 'aformat=sample_rates=44100:channel_layouts=stereo';
  const g = (f) => (MUSICA_LUFS - lufs(f)).toFixed(2);
  const gn = g(nuove);
  ep.forEach((e) => { e.g = g(e.wav); });
  console.log(`  livelli portati a ${MUSICA_LUFS} LUFS: parti nuove ${gn} dB, ${ep.map((e) => `${e.wav.slice(4, -11)} ${e.g} dB`).join(', ')}`);
  const parts = [`[0:a]${FMT},volume=${gn}dB[n]`, ...ep.map((e, i) => `[${i + 1}:a]${FMT},volume=${e.g}dB,adelay=${Math.round(e.t0 * 1000)}:all=1[e${i}]`)];
  parts.push(`[n]${ep.map((_, i) => `[e${i}]`).join('')}amix=inputs=${ep.length + 1}:duration=first:normalize=0,alimiter=limit=0.89,apad=whole_dur=${END}[a]`);
  run('ffmpeg', ['-y', '-v', 'error', '-i', nuove, ...ep.flatMap((e) => ['-i', e.wav]), '-filter_complex', parts.join(';'), '-map', '[a]', '-t', String(END), '-c:a', 'pcm_s16le', out]);
  console.log(`Musica: ${out}`);
  return out;
};

// ---------------------------------------------------------------- video
const parte = opt('parte');
const id = parte ? `${slug}--${parte}` : slug;
const video = `out/${id}.mp4`;
const musica = await generaMusicaLunga();
if (!flag('solo-audio') && !flag('senza-video')) {
  const muto = `out/${id}.muto.mp4`;
  remotion(['render', 'src/lunghi/index.ts', id, muto]);
  const from = parte ? tr.find((x) => x.id === parte)?.start : 0;
  if (from === undefined) { console.error(`Tratto "${parte}" non trovato`); process.exit(1); }
  run('ffmpeg', ['-y', '-v', 'error', '-i', muto, '-ss', String(from), '-i', musica, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', video]);
  rmSync(muto);
  console.log(`Video con musica: ${video}`);
}
if (parte) process.exit(0);

// ---------------------------------------------------------------- voce (come scripts/voce.mjs)
const MAX_SPEEDUP = 1.25, MAX_PAUSE = 0.25, MARGIN = 0.1;
const EXT = ['.wav', '.mp3', '.m4a', '.flac', '.ogg'];
const TMP = 'out/voce-tmp/lunghi';
mkdirSync(TMP, { recursive: true });
const TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse';
const trova = (v) => existsSync(v.dir) && readdirSync(v.dir).find((f) => EXT.some((e) => f === v.base + e));
const conVoce = tr.filter((x) => x.voce);
const mancano = conVoce.filter((x) => !trova(x.voce));
if (mancano.length) {
  console.warn(`Voce non montata: mancano ${mancano.length} clip (${mancano.map((x) => `${x.voce.dir}/${x.voce.base}`).join(', ')}).`);
  process.exit(0);
}
if (!existsSync(video)) { console.error(`Manca ${video}: prima il render senza --solo-audio`); process.exit(1); }
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const clips = [];
const problemi = [];
for (const x of conVoce) {
  const src = `${x.voce.dir}/${trova(x.voce)}`;
  const base = `${x.voce.dir.split('/').pop()}_${x.voce.base}`;
  const inizio = x.tipo === 'aggancio' ? INIZIO_AGGANCIO : 0;
  const room = x.dur - inizio - MARGIN;
  let file = `${TMP}/${base}.wav`;
  run('ffmpeg', ['-y', '-v', 'error', '-i', src, '-af', TRIM, '-ar', '48000', file]);
  if (duration(file) > room) {
    file = `${TMP}/${base}-pause.wav`;
    run('ffmpeg', ['-y', '-v', 'error', '-i', src, '-af', `${TRIM},silenceremove=stop_periods=-1:stop_duration=${MAX_PAUSE}:stop_threshold=-40dB`, '-ar', '48000', file]);
  }
  const len = duration(file);
  const speed = len <= room ? 1 : len / room;
  if (speed > MAX_SPEEDUP) {
    const longest = [...x.testo].sort((a, b) => words(b) - words(a))[0];
    problemi.push(`  ${base}: ${len.toFixed(2)} s per ${room.toFixed(2)} s (+${((speed - 1) * 100).toFixed(0)}%): accorciare, es. «${longest}»`);
  }
  clips.push({ x, base, file, len, speed, t: x.start + inizio });
}
console.log('Voce:');
for (const c of clips) console.log(`  ${c.base.padEnd(34)} da ${c.t.toFixed(1).padStart(6)} s  ${c.len.toFixed(2).padStart(5)} s / ${c.x.dur} s  ${c.speed === 1 ? 'naturale' : `+${((c.speed - 1) * 100).toFixed(1)}%`}`);
if (problemi.length) { console.error(`\nDa accorciare (niente montato):\n${problemi.join('\n')}`); process.exit(1); }
// montaggio in due passi (molte clip): prima la traccia voce, poi il ducking sulla musica del video
const FMT = 'aformat=sample_rates=48000:channel_layouts=stereo';
const voceWav = `${TMP}/${slug}-voce.wav`;
const parts = clips.map((c, i) => `[${i}:a]${FMT}${c.speed > 1 ? `,atempo=${c.speed.toFixed(5)}` : ''},adelay=${Math.round(c.t * 1000)}:all=1[v${i}]`);
parts.push(`${clips.map((_, i) => `[v${i}]`).join('')}amix=inputs=${clips.length}:duration=longest:normalize=0,apad=whole_dur=${END}[voce]`);
writeFileSync(`${TMP}/filtro.txt`, parts.join(';\n'));
run('ffmpeg', ['-y', '-v', 'error', ...clips.flatMap((c) => ['-i', c.file]), '-filter_complex_script', `${TMP}/filtro.txt`, '-map', '[voce]', '-t', String(END), voceWav]);
const out = `out/${slug}-voce.mp4`;
run('ffmpeg', ['-y', '-v', 'error', '-i', video, '-i', voceWav, '-filter_complex',
  `[1:a]${FMT},asplit=2[vc][sc];[0:a]${FMT}[mus];[mus][sc]sidechaincompress=threshold=0.015:ratio=8:attack=20:release=450[duck];[duck][vc]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]`,
  '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(END), out]);
console.log(`\nVideo con voce: ${out}  (${Math.round(END * FPS)} fotogrammi, ${mmss(END)})`);
