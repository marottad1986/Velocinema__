// Quinte prove per il marchio sonoro di «2M Studios» (editore, 25 nov 2026). Riferimenti scelti dall'editore: firme
// brevi e decise (stile Netflix / Prime Video), pulite e tecnologiche (Intel / Windows), orecchiabili (Mastercard /
// Spotify); suono «elettronico moderno» e «pop». Le librerie del progetto hanno solo strumenti acustici, quindi qui i
// suoni sono sintetizzati apposta (FM, onde a dente di sega filtrate, basso sinusoidale): un marchio sonoro, non la
// musica di un film. Melodie originali. Re maggiore, mai aggressivo.
// node brand/2m-studios/suono/sigla-proposte-5.mjs → out/sigla-proposta-m.wav, -n.wav, -o.wav, -p.wav
import { mkdirSync } from 'node:fs';
import { SR, createMix, put, writeWav } from '../../../scripts/audio/synth.mjs';
import { impulso, convolvi } from '../../../scripts/audio/sala.mjs';

const sala = { rt60: 1.8, brillo: 8000, predelay: 0.02, wet: 0.3 };
const f = (m) => 440 * 2 ** ((m - 69) / 12);
const TAU = Math.PI * 2;
let seme = 7;
const caso = () => ((seme = (seme * 16807) % 2147483647) / 2147483647) * 2 - 1;

// ---------------- suoni ----------------
/** Campanella FM limpida (stile «tecnologico»). */
const campanella = (mix, m, t, { dur = 1.4, gain = 0.32, pan = 0, rev = 0.45 } = {}) => {
  const fr = f(m), n = Math.round(dur * SR);
  put(mix, t, n, (i) => {
    const s = i / SR, env = Math.min(1, s / 0.003) * Math.exp(-s * 3.2), idx = 2.2 * Math.exp(-s * 6);
    return env * Math.sin(TAU * fr * s + idx * Math.sin(TAU * fr * 3.5 * s)) + 0.15 * env * Math.sin(TAU * fr * 2 * s);
  }, { gain, pan, rev });
};
/** Pianoforte elettrico FM (tine morbido). */
const epiano = (mix, m, t, { dur = 0.9, gain = 0.34, pan = 0, rev = 0.3 } = {}) => {
  const fr = f(m), n = Math.round((dur + 0.4) * SR);
  put(mix, t, n, (i) => {
    const s = i / SR, rel = s > dur ? Math.exp(-(s - dur) * 10) : 1;
    const env = Math.min(1, s / 0.004) * Math.exp(-s * 1.8) * rel, idx = 1.4 * Math.exp(-s * 4);
    const trem = 1 + 0.06 * Math.sin(TAU * 5 * s);
    return trem * env * (Math.sin(TAU * fr * s + idx * Math.sin(TAU * fr * s)) + 0.12 * Math.exp(-s * 25) * Math.sin(TAU * fr * 14 * s));
  }, { gain, pan, rev });
};
/** Pizzicato sintetico moderno: onda a dente di sega con «filtro» che si chiude in fretta. */
const pluck = (mix, m, t, { dur = 0.5, gain = 0.22, pan = 0, rev = 0.3, chiusura = 9 } = {}) => {
  const fr = f(m), n = Math.round((dur + 0.3) * SR);
  put(mix, t, n, (i) => {
    const s = i / SR, rel = s > dur ? Math.exp(-(s - dur) * 12) : 1, env = Math.min(1, s / 0.002) * Math.exp(-s * 4) * rel;
    let v = 0;
    for (let k = 1; k <= 14; k++) v += (Math.exp(-s * chiusura * k * 0.35) / k) * Math.sin(TAU * fr * k * s + k);
    return env * v;
  }, { gain, pan, rev });
};
/** Tappeto: denti di sega leggermente stonati tra loro, attacco lento, filtrati (poche armoniche). */
const tappeto = (mix, note, t, dur, { gain = 0.05, rev = 0.6 } = {}) => {
  note.forEach((m, j) => [-6, 6].forEach((cent, v) => {
    const fr = f(m) * 2 ** (cent / 1200), n = Math.round((dur + 0.6) * SR);
    put(mix, t, n, (i) => {
      const s = i / SR, env = Math.min(1, s / 0.45) * (s > dur ? Math.exp(-(s - dur) * 4) : 1);
      let x = 0;
      for (let k = 1; k <= 6; k++) x += Math.sin(TAU * fr * k * s + k * v) / (k * k);
      return env * x;
    }, { gain, pan: (v ? 0.4 : -0.4) * (j % 2 ? 1 : -1), rev });
  }));
};
/** Basso sinusoidale morbido (si sente come calore, non come colpo). */
const sub = (mix, m, t, dur, { gain = 0.35 } = {}) => {
  const fr = f(m), n = Math.round((dur + 0.3) * SR);
  put(mix, t, n, (i) => {
    const s = i / SR, env = Math.min(1, s / 0.02) * (s > dur ? Math.exp(-(s - dur) * 8) : Math.exp(-s * 0.8));
    return env * (Math.sin(TAU * fr * s) + 0.15 * Math.sin(TAU * fr * 2 * s));
  }, { gain, rev: 0.05 });
};
/** Cassa morbida: sinusoide che scende di tono, breve. */
const cassa = (mix, t, { gain = 0.45 } = {}) => {
  const n = Math.round(0.35 * SR);
  let ph = 0;
  put(mix, t, n, (i) => {
    const s = i / SR, fr = 48 + 70 * Math.exp(-s * 30);
    ph += TAU * fr / SR;
    return Math.exp(-s * 9) * Math.sin(ph);
  }, { gain, rev: 0.05 });
};
/** Battito di mani leggero: tre lampi di rumore ravvicinati, schiariti. */
const mani = (mix, t, { gain = 0.12, pan = 0.1 } = {}) => {
  const n = Math.round(0.25 * SR);
  let prec = 0;
  put(mix, t, n, (i) => {
    const s = i / SR, lampi = [0, 0.011, 0.022].reduce((a, d) => a + (s >= d ? Math.exp(-(s - d) * (d === 0.022 ? 22 : 120)) : 0), 0);
    const r = caso(), alto = r - prec;
    prec = r;
    return lampi * alto * 0.7;
  }, { gain, pan, rev: 0.35 });
};
/** Respiro che sale: rumore che cresce e si schiarisce, con un tono che sale piano. */
const respiro = (mix, tFine, dur, { gain = 0.08 } = {}) => {
  const n = Math.round(dur * SR);
  let lp = 0;
  put(mix, tFine - dur, n, (i) => {
    const s = i / SR, p = s / dur, a = Math.min(1, 0.04 + 0.96 * p * p);
    lp += (0.03 + 0.5 * p) * (caso() - lp);
    return a * (lp * 1.4 + 0.25 * Math.sin(TAU * (300 + 500 * p * p) * s));
  }, { gain, rev: 0.5 });
};

// Re maggiore con la nona; registro medio
const ACC = [62, 66, 69, 76];

const PROPOSTE = {
  m: {
    nome: 'Accensione (elettronico)',
    suona: (mix, t0) => {
      respiro(mix, t0 + 0.7, 0.65);
      // due accordi brevi e decisi: il secondo più pieno e lungo
      for (const [t, dur, g] of [[t0 + 0.7, 0.22, 0.8], [t0 + 1.02, 1.4, 1]]) {
        ACC.forEach((m, j) => pluck(mix, m, t + j * 0.004, { dur, gain: 0.16 * g, pan: -0.3 + j * 0.2, chiusura: dur > 1 ? 4 : 9, rev: 0.4 }));
        sub(mix, 38, t, dur, { gain: 0.32 * g });
        cassa(mix, t, { gain: 0.38 * g });
      }
      tappeto(mix, [50, 57, 62, 66], t0 + 1.02, 1.5, { gain: 0.045 });
      campanella(mix, 81, t0 + 1.02, { gain: 0.16, dur: 1.6 });
    },
  },
  n: {
    nome: 'Luce (elettronico)',
    suona: (mix, t0) => {
      tappeto(mix, [50, 57, 62, 66], t0, 2.6, { gain: 0.04 });
      [[69, 0.1], [74, 0.35], [76, 0.6], [81, 0.85]].forEach(([m, d], i) => campanella(mix, m, t0 + d, { gain: 0.26 + i * 0.02, pan: -0.25 + i * 0.17, dur: 1.5 }));
      ACC.forEach((m, j) => campanella(mix, m, t0 + 1.2 + j * 0.02, { gain: 0.13, pan: -0.3 + j * 0.2, dur: 1.8 }));
      sub(mix, 38, t0 + 1.2, 1.4, { gain: 0.28 });
    },
  },
  o: {
    nome: 'Pop (senza battito di mani)',
    suona: (mix, t0) => {
      // melodia sincopata: Fa#4 La4 Si4 La4 … Re5 (lunga)
      const mel = [[66, 0, 0.2], [69, 0.25, 0.2], [71, 0.5, 0.35], [69, 0.875, 0.2], [74, 1.125, 1.2]];
      mel.forEach(([m, d, dur], i) => {
        epiano(mix, m, t0 + d, { dur, gain: 0.36, pan: 0.05 });
        pluck(mix, m + 12, t0 + d, { dur: Math.min(dur, 0.4), gain: 0.06, pan: 0.3, rev: 0.4 });
      });
      // accordi di pianoforte elettrico sotto: Re → Sol → Re
      [[0, [50, 54, 57], 0.45], [0.5, [50, 55, 59], 0.55], [1.125, [50, 54, 57, 62], 1.2]].forEach(([d, acc, dur]) =>
        acc.forEach((m, j) => epiano(mix, m, t0 + d + j * 0.006, { dur, gain: 0.14, pan: -0.25 + j * 0.15 })));
      sub(mix, 38, t0, 0.45, { gain: 0.3 });
      sub(mix, 43, t0 + 0.5, 0.55, { gain: 0.3 });
      sub(mix, 38, t0 + 1.125, 1.2, { gain: 0.34 });
      cassa(mix, t0, { gain: 0.32 });
      cassa(mix, t0 + 1.125, { gain: 0.36 });
    },
  },
  p: {
    nome: 'Pop due note',
    suona: (mix, t0) => {
      // motivo cortissimo: La4–Re5, La4–Mi5… Re5 lunga (la seconda volta sale un gradino in più)
      const mel = [[69, 0, 0.18], [74, 0.25, 0.3], [69, 0.625, 0.18], [76, 0.875, 0.3], [74, 1.125, 1.2]];
      mel.forEach(([m, d, dur], i) => {
        pluck(mix, m, t0 + d, { dur, gain: 0.22, pan: i % 2 ? 0.15 : -0.15, chiusura: dur > 1 ? 4 : 8 });
        epiano(mix, m - 12, t0 + d, { dur, gain: 0.12 });
      });
      tappeto(mix, [50, 57, 62, 66], t0 + 1.125, 1.3, { gain: 0.04 });
      sub(mix, 38, t0, 0.55, { gain: 0.28 });
      sub(mix, 38, t0 + 1.125, 1.2, { gain: 0.34 });
      cassa(mix, t0, { gain: 0.3 });
      cassa(mix, t0 + 1.125, { gain: 0.36 });
      mani(mix, t0 + 0.625, { gain: 0.1 });
    },
  },
};

mkdirSync('out', { recursive: true });
const ir = impulso(sala);
for (const [k, p] of Object.entries(PROPOSTE)) {
  const mix = createMix(3.0);
  p.suona(mix, 0.05);
  const out = `out/sigla-proposta-${k}.wav`;
  writeWav(mix, out, { peakDb: -2, fadeIn: 0.002, fadeOut: 0.7, wet: sala.wet, riverbero: (ch, side) => convolvi(ch, ir[side]) });
  console.log(`${p.nome}: ${out}`);
}
