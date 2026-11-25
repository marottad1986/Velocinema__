// Prove per il nuovo marchio sonoro di «2M Studios» (editore, 25 nov 2026: «un suono molto più semplice e riconoscibile,
// non orchestrale»). Tre motivi originali di 5 note, 120 bpm (una croma = 0,25 s), marimba + glockenspiel, basso
// pizzicato e batteria leggera. Ogni nota farà comparire un pezzo del logo: 2, M gialla, M panna, STUDIOS, rimbalzo.
// node brand/2m-studios/suono/sigla-proposte.mjs → out/sigla-proposta-a.wav, -b.wav, -c.wav
import { mkdirSync } from 'node:fs';
import { suona, colpo, compensa, scaricaCampioni } from '../../../scripts/audio/campioni.mjs';
import { createMix, writeWav } from '../../../scripts/audio/synth.mjs';
import { impulso, convolvi } from '../../../scripts/audio/sala.mjs';

const strumenti = ['marimba', 'glockenspiel', 'pianoforte', 'contrabbasso_pizz', 'cassa', 'charleston', 'rullante', 'piatto_crash'];
const sala = { rt60: 1.1, brillo: 7000, predelay: 0.015, wet: 0.22 };
const C = 0.25; // croma

// Fa maggiore. Note MIDI: Fa4 = 65, La4 = 69, Do5 = 72, Mi5 = 76, Fa5 = 77, Sol5 = 79, La5 = 81
const PROPOSTE = {
  a: { nome: 'Salto', note: [[65, 0], [69, 1], [72, 2], [77, 3, 'lunga']] , coda: [81, 3.5] },
  b: { nome: 'Due-due', note: [[72, 0], [72, 1], [77, 2], [76, 3], [77, 4, 'lunga']] },
  c: { nome: 'Risposta', note: [[81, 0], [79, 1], [77, 2], [72, 3], [77, 4, 'lunga']] },
};

function suonaProposta(mix, p, t0 = 0) {
  const ultima = Math.max(...p.note.map(([, i]) => i));
  for (const [m, i, lunga] of p.note) {
    const t = t0 + i * C;
    const dur = lunga ? 1.1 : C * 0.95;
    suona(mix, 'marimba', m, { t, dur, vel: lunga ? 110 : 96, gain: 1.0, pan: -0.1, rev: 0.25, release: lunga ? 0.9 : 0.25, seed: i + 1 });
    suona(mix, 'glockenspiel', m + 12, { t, dur, vel: lunga ? 95 : 80, gain: 0.32, pan: 0.15, rev: 0.35, release: lunga ? 1.0 : 0.3, seed: i + 7 });
    if (lunga) suona(mix, 'pianoforte', m - 12, { t, dur: 1.1, vel: 85, gain: 0.45, rev: 0.3, release: 0.8, seed: 21 });
  }
  if (p.coda) suona(mix, 'glockenspiel', p.coda[0] + 12, { t: t0 + p.coda[1] * C, dur: 0.8, vel: 90, gain: 0.35, pan: 0.2, rev: 0.45, release: 0.9, seed: 31 });
  // basso pizzicato: Fa sul primo battito, Do sul secondo, Fa sulla nota lunga
  suona(mix, 'contrabbasso_pizz', 41, { t: t0, dur: 0.45, vel: 100, gain: 0.9, rev: 0.15, seed: 41 });
  suona(mix, 'contrabbasso_pizz', 48, { t: t0 + 2 * C, dur: 0.45, vel: 95, gain: 0.8, rev: 0.15, seed: 42 });
  suona(mix, 'contrabbasso_pizz', 41, { t: t0 + ultima * C, dur: 0.9, vel: 105, gain: 1.0, rev: 0.2, seed: 43 });
  // batteria leggera: cassa sui battiti, charleston in levare, rullante e piatto sulla nota lunga
  for (let k = 0; k <= ultima; k += 2) colpo(mix, 'cassa', 'v5', { t: t0 + k * C, vel: 100, gain: 0.7, rev: 0.1, seed: 50 + k });
  for (let k = 1; k < ultima; k += 2) colpo(mix, 'charleston', 'v3', { t: t0 + k * C, vel: 100, gain: 0.22, pan: 0.3, rev: 0.1, seed: 60 + k });
  colpo(mix, 'cassa', 'v5', { t: t0 + ultima * C, vel: 100, gain: 0.8, rev: 0.12, seed: 70 });
  colpo(mix, 'rullante', 'v5', { t: t0 + ultima * C, vel: 100, gain: 0.45, rev: 0.25, seed: 71 });
  colpo(mix, 'piatto_crash', 'mf', { t: t0 + ultima * C, vel: 100, gain: 0.18, rev: 0.3, seed: 72 });
}

scaricaCampioni(strumenti);
mkdirSync('out', { recursive: true });
const ir = impulso(sala);
for (const [k, p] of Object.entries(PROPOSTE)) {
  const mix = createMix(2.6);
  compensa(mix);
  suonaProposta(mix, p, 0.1);
  const out = `out/sigla-proposta-${k}.wav`;
  writeWav(mix, out, { peakDb: -2, fadeIn: 0.002, fadeOut: 0.5, wet: sala.wet, riverbero: (ch, side) => convolvi(ch, ir[side]) });
  console.log(`${p.nome}: ${out}`);
}
