// Seconde prove per il marchio sonoro di «2M Studios» (editore, 25 nov 2026: «proviamo a dare più profondità»).
// Stesso spirito delle prime (5 note, semplice, non orchestrale) ma più pieno: accordi di pianoforte a coda,
// tappeto d'organo leggero, basso un'ottava sotto, cassa piena, stanza più grande ed eco tra destra e sinistra.
// node brand/2m-studios/suono/sigla-proposte-2.mjs → out/sigla-proposta-d.wav, -e.wav, -f.wav
import { mkdirSync } from 'node:fs';
import { suona, colpo, compensa, scaricaCampioni } from '../../../scripts/audio/campioni.mjs';
import { createMix, writeWav } from '../../../scripts/audio/synth.mjs';
import { impulso, convolvi } from '../../../scripts/audio/sala.mjs';

const strumenti = ['marimba', 'glockenspiel', 'pianoforte_coda', 'organo', 'contrabbasso_pizz', 'cassa', 'charleston', 'rullante', 'tom', 'piatto_crash'];
const sala = { rt60: 2.0, brillo: 6500, predelay: 0.03, wet: 0.34 };
const C = 0.25; // croma a 120 bpm

// Fa maggiore (Fa4 = 65). Accordi come note MIDI.
const FA = [53, 57, 60, 65], SIb = [53, 58, 62, 65], DO = [52, 55, 60, 64], REm = [50, 57, 62, 65];
const PROPOSTE = {
  d: {
    nome: 'Due-due profondo',
    note: [[72, 0], [72, 1], [77, 2], [76, 3], [77, 4, 'lunga']],
    accordi: [[0, FA, 2], [2, SIb, 2], [4, FA, 4]],
    bassi: [[0, 29], [2, 34], [4, 29]],
  },
  e: {
    nome: 'Arpeggio',
    note: [[72, 0], [77, 1], [81, 2], [79, 3], [77, 4, 'lunga']],
    accordi: [[0, FA, 1], [1, REm, 1], [2, SIb, 1], [3, DO, 1], [4, FA, 4]],
    bassi: [[0, 29], [1, 26], [2, 34], [3, 36], [4, 29]],
  },
  f: {
    nome: 'Eco',
    note: [[77, 0], [72, 1], [77, 2], [81, 3, 'lunga']],
    accordi: [[0, FA, 3], [3, SIb, 1.5], [4.5, FA, 4]],
    bassi: [[0, 29], [3, 34], [4.5, 29]],
    eco: true,
  },
};

function nota(mix, m, t, lunga, gainScala = 1, pan = 0, seed = 1) {
  const dur = lunga ? 1.2 : C * 0.95;
  suona(mix, 'marimba', m, { t, dur, vel: lunga ? 112 : 98, gain: 1.0 * gainScala, pan: pan - 0.08, rev: 0.3, release: lunga ? 1.0 : 0.3, seed });
  suona(mix, 'marimba', m - 12, { t, dur, vel: lunga ? 100 : 86, gain: 0.45 * gainScala, pan: pan + 0.1, rev: 0.3, release: lunga ? 1.0 : 0.3, seed: seed + 50 });
  suona(mix, 'glockenspiel', m + 12, { t, dur, vel: lunga ? 95 : 78, gain: 0.28 * gainScala, pan: pan + 0.2, rev: 0.45, release: lunga ? 1.2 : 0.35, seed: seed + 90 });
}

function suonaProposta(mix, p, t0 = 0) {
  const ultima = Math.max(...p.note.map(([, i]) => i));
  // melodia (con eco: due ripetizioni più deboli, una a destra e una a sinistra)
  for (const [m, i, lunga] of p.note) {
    const t = t0 + i * C;
    nota(mix, m, t, lunga, 1, 0, i + 1);
    if (p.eco && !lunga) {
      nota(mix, m, t + 1.5 * C, false, 0.32, 0.55, i + 11);
      nota(mix, m, t + 3 * C, false, 0.14, -0.55, i + 21);
    }
  }
  // accordi di pianoforte a coda: corpo armonico, morbidi
  for (const [i, acc, durC] of p.accordi) {
    acc.forEach((m, j) => suona(mix, 'pianoforte_coda', m, { t: t0 + i * C + j * 0.004, dur: durC * C, vel: 70, gain: 0.42, pan: -0.25 + j * 0.17, rev: 0.45, release: 0.9, seed: 100 + j }));
  }
  // tappeto d'organo leggero sotto tutto, per riempire
  const fine = t0 + (ultima + 4) * C;
  for (const [j, m] of [53, 60, 65].entries()) suona(mix, 'organo', m, { t: t0, dur: fine - t0, vel: 50, gain: 0.07, pan: -0.3 + j * 0.3, rev: 0.6, attack: 0.25, release: 0.9, seed: 120 + j });
  // basso: contrabbasso pizzicato un'ottava sotto
  for (const [i, m] of p.bassi) suona(mix, 'contrabbasso_pizz', m + 12, { t: t0 + i * C, dur: 0.6, vel: 105, gain: 1.0, rev: 0.18, release: 0.4, seed: 140 + i });
  // batteria: cassa piena sui battiti, charleston in levare, tom di passaggio, colpo finale con rullante e piatto
  for (let k = 0; k < ultima; k += 2) colpo(mix, 'cassa', 'v5', { t: t0 + k * C, vel: 100, gain: 0.85, rev: 0.12, seed: 160 + k });
  for (let k = 1; k < ultima; k += 2) colpo(mix, 'charleston', 'v3', { t: t0 + k * C, vel: 100, gain: 0.2, pan: 0.35, rev: 0.12, seed: 170 + k });
  colpo(mix, 'tom', 'v3', { t: t0 + (ultima - 0.5) * C, vel: 100, gain: 0.35, pan: -0.2, rev: 0.3, seed: 180 });
  const tf = t0 + ultima * C;
  colpo(mix, 'cassa', 'v5', { t: tf, vel: 100, gain: 1.0, rev: 0.15, seed: 190 });
  colpo(mix, 'rullante', 'v6', { t: tf, vel: 100, gain: 0.5, rev: 0.35, seed: 191 });
  colpo(mix, 'piatto_crash', 'mf', { t: tf, vel: 100, gain: 0.22, pan: 0.25, rev: 0.4, dur: 2, seed: 192 });
}

scaricaCampioni(strumenti);
mkdirSync('out', { recursive: true });
const ir = impulso(sala);
for (const [k, p] of Object.entries(PROPOSTE)) {
  const mix = createMix(3.0);
  compensa(mix);
  suonaProposta(mix, p, 0.1);
  const out = `out/sigla-proposta-${k}.wav`;
  writeWav(mix, out, { peakDb: -2, fadeIn: 0.002, fadeOut: 0.6, wet: sala.wet, riverbero: (ch, side) => convolvi(ch, ir[side]) });
  console.log(`${p.nome}: ${out}`);
}
