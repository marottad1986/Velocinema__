// Jingle della sigla «2M Studios» (src/sigla/Sigla.tsx), solo all'inizio dei video lunghi YouTube (mai nei trailer).
// Musica originale: Re maggiore, 120 bpm (un battito = 0,5 s), tre gesti come i loghi degli studi di cinema:
//  0,0–0,5  rullo della grancassa e piatto sospeso che crescono sotto la fessura di luce, archi gravi che si aprono
//  0,5      il 2: timpani, contrabbasso e tromboni sul Re (prima nota del motivo)
//  1,0      la M: corni sul La, la quinta sopra (seconda nota)
//  1,25     la M si stacca dal clone: arpa che sale per il Re maggiore
//  1,5      «STUDIOS» e il lampo: accordo pieno (tromboni, corni, trombe, archi in tremolo), timpani, piatto, glockenspiel
//  poi l'accordo si spegne con il logo (dissolvenza 2,75–3,25)
// Uso dentro uno spartito: suonaSigla(mix, t0) con t0 = inizio della sigla nel video; aggiungere `strumentiSigla` agli
// strumenti dello spartito. Da solo: node scripts/audio/sigla-2m-studios.mjs → out/sigla-2m-studios-musica.wav
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { suona, colpo, crescendo, compensa, scaricaCampioni } from './campioni.mjs';
import { createMix, writeWav } from './synth.mjs';
import { impulso, convolvi } from './sala.mjs';

export const strumentiSigla = ['trombone', 'corno', 'tromba', 'violini', 'violini_trem', 'celli', 'contrabbasso', 'arpa', 'glockenspiel',
  'timpani', 'grancassa_rullo', 'piatto_sospeso', 'piatto_crash'];
export const SIGLA_DURATA = 3.5;
// istanti uguali a SIGLA di src/sigla/Sigla.tsx
export const SIGLA = { fessura: 0, due: 0.5, clone: 1.0, stacco: 1.25, tutti: 1.5, buio: 2.75, fine: 3.25 };

export const suonaSigla = (mix, t0 = 0, { gain = 1 } = {}) => {
  const E = Object.fromEntries(Object.entries(SIGLA).map(([k, v]) => [k, t0 + v]));
  const g = gain;
  const brass = (t, dur, notes, vel, gg) => notes.forEach((m, j) =>
    suona(mix, m < 55 ? 'trombone' : m < 68 ? 'corno' : 'tromba', m, { t: t + j * 0.006, dur, vel, pan: -0.35 + j * 0.15, gain: gg * g, attack: 0.02, release: 0.7, rev: 0.5, seed: j + 3 }));
  const timp = (t, vel, gg) => colpo(mix, 'timpani', 'Timpani1_Hit_v4_rr1_Sum', { t, vel, gain: gg * g, rev: 0.5 });

  // ---- la fessura di luce: rullo e piatto che crescono, archi gravi sul Re
  colpo(mix, 'grancassa_rullo', 'bdrum_roll1', { t: E.fessura, vel: 90, gain: 0.35 * g, dur: E.due - E.fessura, release: 0.08, rev: 0.4 });
  crescendo(mix, E.due, E.due - E.fessura + 0.05, { gain: 0.3 * g });
  suona(mix, 'celli', 50, { t: E.fessura, dur: E.due - E.fessura, vel: 70, gain: 0.9 * g, attack: 0.35, release: 0.15, rev: 0.5 });
  suona(mix, 'contrabbasso', 38, { t: E.fessura, dur: E.due - E.fessura, vel: 70, gain: 0.9 * g, attack: 0.35, release: 0.15, rev: 0.5 });

  // ---- il 2: Re
  timp(E.due, 115, 0.9);
  suona(mix, 'contrabbasso', 38, { t: E.due, dur: 0.45, vel: 95, gain: 1.2 * g, attack: 0.01, release: 0.25, rev: 0.5 });
  brass(E.due, 0.42, [38 + 12, 45 + 12], 100, 0.75);

  // ---- la M: La, la quinta sopra
  timp(E.clone, 110, 0.85);
  brass(E.clone, 0.22, [57, 62, 69], 100, 0.65);
  suona(mix, 'celli', 45, { t: E.clone, dur: 0.45, vel: 85, gain: 1.0 * g, attack: 0.02, release: 0.2, rev: 0.5 });

  // ---- la M si stacca: arpa che sale per il Re maggiore fino all'accordo
  [62, 66, 69, 74, 78, 81].forEach((m, i) =>
    suona(mix, 'arpa', m, { t: E.stacco + i * 0.04, dur: 0.9, vel: 80, pan: -0.2 + i * 0.08, gain: 0.5 * g, release: 1.0, rev: 0.6, seed: i }));

  // ---- «STUDIOS» e il lampo: accordo pieno di Re maggiore
  const lungo = E.buio - E.tutti + 0.2;
  timp(E.tutti, 127, 1.0);
  colpo(mix, 'piatto_crash', 'mf', { t: E.tutti, vel: 100, gain: 0.32 * g, rev: 0.45, release: 1.2 });
  suona(mix, 'contrabbasso', 38, { t: E.tutti, dur: lungo, vel: 100, gain: 1.2 * g, attack: 0.01, release: 0.6, rev: 0.5 });
  suona(mix, 'celli', 50, { t: E.tutti, dur: lungo, vel: 95, gain: 1.0 * g, attack: 0.02, release: 0.6, rev: 0.5 });
  brass(E.tutti, lungo, [50, 57, 62, 66, 69, 74], 100, 0.4);
  [74, 78, 81].forEach((m, j) => suona(mix, 'violini_trem', m, { t: E.tutti, dur: lungo, vel: 90, pan: -0.2 + j * 0.2, gain: 0.7 * g, attack: 0.05, release: 0.6, rev: 0.6, seed: j }));
  // le lettere di STUDIOS: tre scintille del glockenspiel
  [86, 90, 93].forEach((m, i) => suona(mix, 'glockenspiel', m, { t: E.tutti + 0.06 + i * 0.125, dur: 1.4, vel: 80, pan: 0.3, gain: 0.32 * g, release: 1.2, rev: 0.7 }));
};

export default (mix) => {
  compensa(mix);
  suonaSigla(mix, 0);
};
export const strumenti = strumentiSigla;
export const sala = { rt60: 2.2, brillo: 6000, predelay: 0.025, wet: 0.42 };

/** Scrive la sigla da sola (con la sua sala) in un wav: i render dei lunghi e dei trailer la posano sopra la loro musica. */
export const scriviSigla = (out = 'out/sigla-2m-studios-musica.wav') => {
  scaricaCampioni(strumentiSigla);
  const mix = createMix(SIGLA_DURATA);
  compensa(mix);
  suonaSigla(mix, 0);
  mkdirSync('out', { recursive: true });
  const ir = impulso(sala);
  writeWav(mix, out, { peakDb: -3, fadeIn: 0.005, fadeOut: 0.45, wet: sala.wet, riverbero: (ch, side) => convolvi(ch, ir[side]) });
  return out;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(`Sigla: ${scriviSigla()}`);
