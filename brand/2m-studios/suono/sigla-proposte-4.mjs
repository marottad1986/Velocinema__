// Quarte prove per il marchio sonoro di «2M Studios» (editore, 25 nov 2026: «non è un film horror, devi essere
// professionale ma non aggressivo»). Niente grancassa, timpani, piatti né note gravissime: pianoforte a coda morbido,
// melodia breve e luminosa, tappeto leggero di archi e organo che si apre piano. Re maggiore, registro medio-alto.
// node brand/2m-studios/suono/sigla-proposte-4.mjs → out/sigla-proposta-j.wav, -k.wav, -l.wav
import { mkdirSync } from 'node:fs';
import { suona, compensa, scaricaCampioni } from '../../../scripts/audio/campioni.mjs';
import { createMix, writeWav } from '../../../scripts/audio/synth.mjs';
import { impulso, convolvi } from '../../../scripts/audio/sala.mjs';

const strumenti = ['pianoforte_coda', 'violini', 'viole', 'celli', 'organo'];
const sala = { rt60: 2.0, brillo: 7000, predelay: 0.025, wet: 0.32 };

const piano = (mix, m, t, { dur = 0.5, vel = 72, gain = 0.6, pan = 0, seed = 1, release = 0.9 } = {}) =>
  suona(mix, 'pianoforte_coda', m, { t, dur, vel, gain, pan, rev: 0.45, release, seed });

/** Tappeto morbido: archi in pianissimo che si aprono lentamente, organo appena accennato. */
function tappeto(mix, t, dur, note, { gain = 1 } = {}) {
  const [b, ...sopra] = note;
  suona(mix, 'celli', b, { t, dur, vel: 55, gain: 0.22 * gain, pan: -0.2, attack: 0.6, release: 1.2, rev: 0.55, seed: 500 });
  sopra.forEach((m, j) => suona(mix, j === 0 ? 'viole' : 'violini', m, { t: t + j * 0.05, dur, vel: 50, gain: 0.16 * gain, pan: -0.15 + j * 0.2, attack: 0.7, release: 1.3, rev: 0.6, seed: 510 + j }));
  note.slice(1).forEach((m, j) => suona(mix, 'organo', m, { t, dur, vel: 40, gain: 0.035 * gain, pan: -0.3 + j * 0.3, attack: 0.8, release: 1.4, rev: 0.6, seed: 530 + j }));
}

/** Accordo di pianoforte che «sboccia»: note appena sfasate, piano. */
function sboccia(mix, t, note, { dur = 1.8, vel = 66, gain = 0.5 } = {}) {
  note.forEach((m, j) => piano(mix, m, t + j * 0.035, { dur, vel: vel - j * 2, gain, pan: -0.3 + j * 0.15, seed: 600 + j, release: 1.6 }));
}

// Re maggiore con la nona: Re3 La3 Mi4 Fa#4 La4
const ACCORDO = [50, 57, 64, 66, 69];

const PROPOSTE = {
  j: {
    nome: 'Firma',
    suona: (mix, t0) => {
      tappeto(mix, t0, 2.9, [50, 62, 66, 69]);
      [[62, 0], [66, 0.28], [69, 0.56], [74, 0.84]].forEach(([m, d], i) => piano(mix, m, t0 + 0.15 + d, { dur: 0.6, vel: 70 + i * 3, gain: 0.62, pan: -0.1 + i * 0.07, seed: 10 + i }));
      sboccia(mix, t0 + 1.25, ACCORDO, { dur: 1.7 });
      piano(mix, 78, t0 + 1.25, { dur: 1.6, vel: 70, gain: 0.45, pan: 0.15, seed: 20, release: 1.6 });
    },
  },
  k: {
    nome: 'Due note',
    suona: (mix, t0) => {
      tappeto(mix, t0, 2.9, [50, 62, 66, 69]);
      // l'intervallo «firma»: La4 → Re5, due volte (la seconda più piena), poi l'accordo
      piano(mix, 69, t0 + 0.15, { dur: 0.35, vel: 70, gain: 0.6, seed: 30 });
      piano(mix, 74, t0 + 0.45, { dur: 0.5, vel: 74, gain: 0.62, seed: 31 });
      piano(mix, 69, t0 + 0.95, { dur: 0.35, vel: 72, gain: 0.6, seed: 32 });
      piano(mix, 74, t0 + 1.25, { dur: 1.6, vel: 80, gain: 0.66, seed: 33, release: 1.6 });
      sboccia(mix, t0 + 1.25, [50, 57, 62, 66], { dur: 1.6, vel: 62 });
    },
  },
  l: {
    nome: 'Respiro',
    suona: (mix, t0) => {
      tappeto(mix, t0, 3.0, [50, 62, 66, 69], { gain: 1.2 });
      [[78, 0.3], [76, 0.55], [74, 0.8], [69, 1.05]].forEach(([m, d], i) => piano(mix, m, t0 + d, { dur: 0.45, vel: 68 + i * 2, gain: 0.6, pan: 0.12 - i * 0.06, seed: 40 + i }));
      piano(mix, 74, t0 + 1.4, { dur: 1.6, vel: 76, gain: 0.62, seed: 45, release: 1.6 });
      sboccia(mix, t0 + 1.4, ACCORDO, { dur: 1.6, vel: 60, gain: 0.45 });
    },
  },
};

scaricaCampioni(strumenti);
mkdirSync('out', { recursive: true });
const ir = impulso(sala);
for (const [k, p] of Object.entries(PROPOSTE)) {
  const mix = createMix(3.6);
  compensa(mix);
  p.suona(mix, 0.05);
  const out = `out/sigla-proposta-${k}.wav`;
  writeWav(mix, out, { peakDb: -2, fadeIn: 0.01, fadeOut: 0.9, wet: sala.wet, riverbero: (ch, side) => convolvi(ch, ir[side]) });
  console.log(`${p.nome}: ${out}`);
}
