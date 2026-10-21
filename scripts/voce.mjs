// npm run voce -- <film> [--cartella <dir>] [--video <file>] [--uscita <file>]
//   → out/<film>-voce.mp4: video di out/<film>.mp4 + voce, con la musica abbassata sotto la voce (ducking).
// Clip in audio/<film>/: 00_copertina, 01_<id>, 02_<id>… (wav, mp3, m4a, flac, ogg); facoltativa NN_finale.
// Ogni clip parte all'inizio del suo capitolo. Se è più lunga del capitolo viene accelerata (atempo, tono invariato)
// fino al 15%; oltre, lo script non monta nulla e indica la frase da accorciare.
import { existsSync, readdirSync } from 'node:fs';
import { duration, hasAudio, loadFilm, run, timeline } from './audio/film.mjs';

const MAX_SPEEDUP = 1.15;
const MARGIN = 0.1; // secondi di respiro prima del capitolo successivo
const EXT = ['.wav', '.mp3', '.m4a', '.flac', '.ogg'];

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const slug = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
if (!slug) {
  console.error('Uso: npm run voce -- <film> [--cartella audio/<film>] [--video out/<film>.mp4] [--uscita out/<film>-voce.mp4]');
  process.exit(1);
}
const dir = opt('cartella', `audio/${slug}`);
const video = opt('video', `out/${slug}.mp4`);
const out = opt('uscita', `out/${slug}-voce.mp4`);

const film = loadFilm(slug);
const { T, segments } = timeline(film);
if (!existsSync(video)) {
  console.error(`Manca ${video}: prima esegui npm run render -- ${slug}`);
  process.exit(1);
}
if (!existsSync(dir)) {
  console.error(`Manca la cartella delle clip ${dir}`);
  process.exit(1);
}

// ---- abbina le clip ai capitoli
const files = readdirSync(dir).filter((f) => EXT.some((e) => f.toLowerCase().endsWith(e)));
const used = new Set();
const clips = [];
for (const s of segments) {
  const base = `${String(s.n).padStart(2, '0')}_${s.id}`;
  const f = files.find((x) => x.slice(0, x.lastIndexOf('.')) === base);
  if (!f) {
    if (s.id !== 'finale') console.warn(`  manca ${base} (capitolo senza voce)`);
    continue;
  }
  used.add(f);
  clips.push({ ...s, base, file: `${dir}/${f}`, len: duration(`${dir}/${f}`) });
}
files.filter((f) => !used.has(f)).forEach((f) => console.warn(`  ignorata ${f}: il nome non corrisponde a nessun capitolo (NN_<id>)`));
if (!clips.length) {
  console.error(`Nessuna clip valida in ${dir}`);
  process.exit(1);
}

// ---- velocità di ogni clip; frase da accorciare se non basta il 15%
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const problems = [];
for (const c of clips) {
  const room = c.dur - MARGIN;
  c.speed = c.len <= room ? 1 : c.len / room;
  if (c.speed <= MAX_SPEEDUP) continue;
  const extra = c.len / MAX_SPEEDUP - room; // secondi da togliere (a velocità +15%)
  const total = c.testo.reduce((a, s) => a + words(s), 0);
  const wps = total / c.len; // ritmo reale della registrazione
  const cut = Math.max(1, Math.ceil(extra * MAX_SPEEDUP * wps));
  const longest = [...c.testo].sort((a, b) => words(b) - words(a))[0];
  problems.push(
    `  ${c.base}: dura ${c.len.toFixed(2)} s, il capitolo ${c.dur} s (servirebbe +${((c.speed - 1) * 100).toFixed(0)}%, massimo +15%).\n` +
      (longest
        ? `    Accorcia di circa ${cut} parol${cut === 1 ? 'a' : 'e'}, per esempio la frase più lunga: «${longest}»`
        : `    Togli circa ${extra.toFixed(1)} s di parlato.`),
  );
}

console.log(`Voce per ${slug} (${dir}):`);
for (const c of clips) {
  const v = c.speed === 1 ? 'naturale' : c.speed <= MAX_SPEEDUP ? `accelerata +${((c.speed - 1) * 100).toFixed(1)}%` : 'TROPPO LUNGA';
  console.log(`  ${c.base.padEnd(16)} da ${String(c.start).padStart(3)} s  clip ${c.len.toFixed(2).padStart(5)} s / capitolo ${String(c.dur).padStart(2)} s  ${v}`);
}
if (problems.length) {
  console.error(`\nDa accorciare (niente montato):\n${problems.join('\n')}`);
  process.exit(1);
}

// ---- montaggio con ffmpeg
const FMT = 'aformat=sample_rates=48000:channel_layouts=stereo';
const parts = clips.map((c, i) => {
  const tempo = c.speed > 1 ? `,atempo=${c.speed.toFixed(5)}` : '';
  const ms = Math.round(c.start * 1000);
  return `[${i + 1}:a]${FMT}${tempo},adelay=${ms}:all=1[v${i}]`;
});
const voci = clips.map((_, i) => `[v${i}]`).join('');
parts.push(`${voci}amix=inputs=${clips.length}:duration=longest:normalize=0,apad=whole_dur=${T.END}[voce]`);
if (hasAudio(video)) {
  // ducking: la voce comanda un compressore sulla musica, che scende di circa 12–15 dB mentre si parla
  parts.push(`[voce]asplit=2[vc][sc]`);
  parts.push(`[0:a]${FMT}[mus]`);
  parts.push(`[mus][sc]sidechaincompress=threshold=0.015:ratio=8:attack=20:release=450[duck]`);
  parts.push(`[duck][vc]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]`);
} else {
  console.warn(`  ${video} non ha audio: solo voce, senza musica (rigenera il video con npm run render -- ${slug}).`);
  parts.push(`[voce]alimiter=limit=0.95[a]`);
}
run('ffmpeg', ['-y', '-v', 'error', '-i', video, ...clips.flatMap((c) => ['-i', c.file]),
  '-filter_complex', parts.join(';'), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(T.END), out]);
console.log(`\nVideo con voce: ${out}`);
