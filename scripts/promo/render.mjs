// node scripts/promo/render.mjs <slug> [--senza-video]
//   Short promozionale verticale (promo/<slug>.json, scena in src/promo/<slug>/):
//   - out/<slug>-musica.wav dallo spartito scripts/audio/<slug>.mjs (T[id] = inizio della parte, T.frase(id, n));
//   - out/<slug>.mp4: video 1080×1920 con la musica;
//   - out/<slug>-voce.mp4: con la voce (clip in audio/<slug>/, da node scripts/genera-voce.mjs <slug>), come npm run voce:
//     silenzio ai bordi tolto, pause accorciate e accelerazione fino al 25% se una clip sfora, ducking della musica.
// Browser: REMOTION_BROWSER (in un ambiente cloud il Chromium installato).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createMix, writeWav } from '../audio/synth.mjs';
import { impulso, convolvi } from '../audio/sala.mjs';
import { scaricaCampioni } from '../audio/campioni.mjs';
import { scaricaEffetti } from '../audio/effetti.mjs';
import { duration, run } from '../audio/film.mjs';
import { durataPromo, loadPromo, partiPromo, promo } from './tempi.mjs';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
if (!slug || !promo().includes(slug)) {
  console.error(`Uso: node scripts/promo/render.mjs <slug> [--senza-video]\nPromo: ${promo().join(', ') || 'nessuno'}`);
  process.exit(1);
}
const P = loadPromo(slug);
const parti = partiPromo(P);
const END = durataPromo(P);
mkdirSync('out', { recursive: true });

// ---------------------------------------------------------------- musica
const { default: score, strumenti = [], effetti = [], sala } = await import(pathToFileURL(path.resolve(`scripts/audio/${slug}.mjs`)).href);
scaricaCampioni(strumenti);
scaricaEffetti(effetti);
const T = { END, frase: (id, n) => parti.find((x) => x.id === id).frasi[n] };
for (const x of parti) T[x.id] = x.start;
const mix = createMix(END);
score(mix, T);
const musica = `out/${slug}-musica.wav`;
const ir = sala && impulso(sala);
writeWav(mix, musica, { peakDb: -3, fadeOut: 1.2, ...(ir && { wet: sala.wet ?? 0.5, riverbero: (ch, side) => convolvi(ch, ir[side]) }) });
console.log(`Musica: ${musica}`);

// ---------------------------------------------------------------- video
const video = `out/${slug}.mp4`;
if (!args.includes('--senza-video')) {
  const muto = `out/${slug}.muto.mp4`;
  const res = spawnSync('npx', ['remotion', 'render', 'src/promo/index.ts', slug, muto], { stdio: 'inherit', shell: process.platform === 'win32' });
  if (res.status !== 0) process.exit(res.status ?? 1);
  run('ffmpeg', ['-y', '-v', 'error', '-i', muto, '-i', musica, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', video]);
  rmSync(muto);
  console.log(`Video con musica: ${video}`);
}

// ---------------------------------------------------------------- voce
const MAX_SPEEDUP = 1.25, MAX_PAUSE = 0.25, MARGIN = 0.1;
const EXT = ['.wav', '.mp3', '.m4a', '.flac', '.ogg'];
const dir = `audio/${slug}`;
const TMP = 'out/voce-tmp/promo';
mkdirSync(TMP, { recursive: true });
const TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse';
const trova = (base) => existsSync(dir) && readdirSync(dir).find((f) => EXT.some((e) => f === base + e));
const mancano = parti.filter((x) => !trova(x.base));
if (mancano.length) { console.warn(`Voce non montata: mancano ${mancano.map((x) => `${dir}/${x.base}`).join(', ')}.`); process.exit(0); }
if (!existsSync(video)) { console.error(`Manca ${video}: prima il render senza --senza-video`); process.exit(1); }
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const clips = [];
const problemi = [];
for (const x of parti) {
  const src = `${dir}/${trova(x.base)}`;
  const room = x.start + x.dur - x.voceDa - MARGIN;
  let file = `${TMP}/${slug}_${x.base}.wav`;
  run('ffmpeg', ['-y', '-v', 'error', '-i', src, '-af', TRIM, '-ar', '48000', file]);
  if (duration(file) > room) {
    file = `${TMP}/${slug}_${x.base}-pause.wav`;
    run('ffmpeg', ['-y', '-v', 'error', '-i', src, '-af', `${TRIM},silenceremove=stop_periods=-1:stop_duration=${MAX_PAUSE}:stop_threshold=-40dB`, '-ar', '48000', file]);
  }
  const len = duration(file);
  const speed = len <= room ? 1 : len / room;
  if (speed > MAX_SPEEDUP) problemi.push(`  ${x.base}: ${len.toFixed(2)} s per ${room.toFixed(2)} s: accorciare, es. «${[...x.testo].sort((a, b) => words(b) - words(a))[0]}»`);
  clips.push({ x, file, len, speed, t: x.voceDa });
}
console.log('Voce:');
for (const c of clips) console.log(`  ${c.x.base.padEnd(16)} da ${c.t.toFixed(2).padStart(6)} s  ${c.len.toFixed(2).padStart(5)} s / ${(c.x.start + c.x.dur - c.t).toFixed(2)} s  ${c.speed === 1 ? 'naturale' : `+${((c.speed - 1) * 100).toFixed(1)}%`}`);
if (problemi.length) { console.error(`\nDa accorciare (niente montato):\n${problemi.join('\n')}`); process.exit(1); }
const FMT = 'aformat=sample_rates=48000:channel_layouts=stereo';
const parts = clips.map((c, i) => `[${i + 1}:a]${FMT}${c.speed > 1 ? `,atempo=${c.speed.toFixed(5)}` : ''},adelay=${Math.round(c.t * 1000)}:all=1[v${i}]`);
parts.push(`${clips.map((_, i) => `[v${i}]`).join('')}amix=inputs=${clips.length}:duration=longest:normalize=0,apad=whole_dur=${END},asplit=2[vc][sc]`);
parts.push(`[0:a]${FMT}[mus];[mus][sc]sidechaincompress=threshold=0.015:ratio=8:attack=20:release=450[duck];[duck][vc]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]`);
const out = `out/${slug}-voce.mp4`;
run('ffmpeg', ['-y', '-v', 'error', '-i', video, ...clips.flatMap((c) => ['-i', c.file]), '-filter_complex', parts.join(';'),
  '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(END), out]);
console.log(`\nVideo con voce: ${out}`);
