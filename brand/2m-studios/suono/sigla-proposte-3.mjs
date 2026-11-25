// Terze prove per il marchio sonoro di «2M Studios» (editore, 25 nov 2026: «troppo da cartone animato, siamo una
// società seria»). Niente marimba né glockenspiel: suoni gravi e puliti, pochi elementi, molto spazio, un accordo che
// resta. Re maggiore con la nona (Re, La, Mi, Fa#): aperto e moderno, non solenne.
// node brand/2m-studios/suono/sigla-proposte-3.mjs → out/sigla-proposta-g.wav, -h.wav, -i.wav
import { mkdirSync } from 'node:fs';
import { suona, colpo, crescendo, compensa, scaricaCampioni } from '../../../scripts/audio/campioni.mjs';
import { createMix, writeWav } from '../../../scripts/audio/synth.mjs';
import { impulso, convolvi } from '../../../scripts/audio/sala.mjs';

const strumenti = ['pianoforte_coda', 'celli', 'contrabbasso', 'organo', 'timpani', 'grancassa', 'piatto_sospeso', 'charleston'];
const sala = { rt60: 2.8, brillo: 5200, predelay: 0.035, wet: 0.4 };

// Accordo: Re1 Re2 La2 Re3 Mi3 Fa#3 La3 (pianoforte), con violoncelli e contrabbassi sul Re, organo leggerissimo
const ACCORDO = [26, 38, 45, 50, 52, 54, 57];

function boato(mix, t, { gain = 1, seed = 1 } = {}) {
  colpo(mix, 'grancassa', 'bdrum_ff', { t, vel: 100, gain: 0.75 * gain, rev: 0.5, seed });
  colpo(mix, 'timpani', 'Timpani1_Hit_v4_rr1_Sum', { t, vel: 100, gain: 0.55 * gain, rev: 0.5, pitch: -2, seed: seed + 1 });
  suona(mix, 'pianoforte_coda', 26, { t, dur: 0.9, vel: 110, gain: 0.7 * gain, rev: 0.5, release: 1.0, seed: seed + 2 });
  suona(mix, 'pianoforte_coda', 38, { t: t + 0.004, dur: 0.9, vel: 100, gain: 0.5 * gain, rev: 0.5, release: 1.0, seed: seed + 3 });
}

function accordo(mix, t, { dur = 2.2, gain = 1 } = {}) {
  ACCORDO.forEach((m, j) => suona(mix, 'pianoforte_coda', m, { t: t + j * 0.012, dur, vel: m < 40 ? 100 : 82, gain: 0.55 * gain, pan: -0.35 + j * 0.11, rev: 0.6, release: 1.8, seed: 200 + j }));
  suona(mix, 'celli', 50, { t, dur, vel: 70, gain: 0.35 * gain, pan: -0.2, attack: 0.25, release: 1.2, rev: 0.6, seed: 220 });
  suona(mix, 'contrabbasso', 38, { t, dur, vel: 72, gain: 0.4 * gain, pan: 0.1, attack: 0.2, release: 1.2, rev: 0.6, seed: 221 });
  for (const [j, m] of [50, 57, 62].entries()) suona(mix, 'organo', m, { t, dur, vel: 45, gain: 0.05 * gain, pan: -0.3 + j * 0.3, attack: 0.4, release: 1.4, rev: 0.7, seed: 230 + j });
}

const PROPOSTE = {
  g: {
    nome: 'Due battiti',
    suona: (mix, t0) => {
      boato(mix, t0, { gain: 0.85, seed: 1 });
      boato(mix, t0 + 0.42, { gain: 1, seed: 11 });
      accordo(mix, t0 + 0.95, { dur: 2.0 });
    },
  },
  h: {
    nome: 'Ticchettio',
    suona: (mix, t0) => {
      // quattro tic d'orologio: pianoforte acutissimo e brevissimo, con un filo di charleston chiuso
      for (let k = 0; k < 4; k++) {
        const t = t0 + k * 0.25;
        suona(mix, 'pianoforte_coda', k % 2 ? 96 : 100, { t, dur: 0.05, vel: 70, gain: 0.32, pan: k % 2 ? 0.2 : -0.2, rev: 0.35, release: 0.08, seed: 300 + k });
        colpo(mix, 'charleston', 'v2', { t, vel: 100, gain: 0.1, pan: k % 2 ? 0.25 : -0.25, rev: 0.2, seed: 310 + k });
      }
      crescendo(mix, t0 + 1.25, 0.9, { gain: 0.32 });
      boato(mix, t0 + 1.25, { gain: 1, seed: 21 });
      accordo(mix, t0 + 1.25, { dur: 1.8 });
    },
  },
  i: {
    nome: 'Accordo',
    suona: (mix, t0) => {
      crescendo(mix, t0 + 1.1, 1.1, { gain: 0.38 });
      suona(mix, 'contrabbasso', 38, { t: t0 + 0.2, dur: 0.9, vel: 60, gain: 0.35, attack: 0.6, release: 0.1, rev: 0.5, seed: 400 });
      boato(mix, t0 + 1.1, { gain: 0.9, seed: 31 });
      accordo(mix, t0 + 1.1, { dur: 2.0, gain: 1.05 });
      // la firma: una sola nota acuta di pianoforte che resta
      suona(mix, 'pianoforte_coda', 81, { t: t0 + 1.75, dur: 1.4, vel: 88, gain: 0.5, pan: 0.15, rev: 0.7, release: 1.6, seed: 410 });
    },
  },
};

scaricaCampioni(strumenti);
mkdirSync('out', { recursive: true });
const ir = impulso(sala);
for (const [k, p] of Object.entries(PROPOSTE)) {
  const mix = createMix(3.6);
  compensa(mix);
  p.suona(mix, 0.1);
  const out = `out/sigla-proposta-${k}.wav`;
  writeWav(mix, out, { peakDb: -1.5, fadeIn: 0.002, fadeOut: 0.8, wet: sala.wet, riverbero: (ch, side) => convolvi(ch, ir[side]) });
  console.log(`${p.nome}: ${out}`);
}
