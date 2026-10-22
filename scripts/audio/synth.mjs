// Piccolo sintetizzatore deterministico: strumenti, effetti sonori, riverbero e scrittura WAV.
// Nessun campione esterno: ogni suono è calcolato qui, con rumore da generatore a seme fisso,
// quindi lo stesso spartito produce sempre lo stesso file, bit per bit.
import { writeFileSync } from 'node:fs';

export const SR = 44100;
const TAU = Math.PI * 2;

/** Generatore pseudo-casuale a seme fisso (mulberry32), valori in [0, 1). */
export const rng = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
/** 'A#2' → frequenza in Hz (La4 = 440). */
export const hz = (name) => {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`Nota non valida: ${name}`);
  const midi = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) + 1) * 12;
  return 440 * 2 ** ((midi - 69) / 12);
};

const vamp = (vel) => (vel / 127) ** 1.6;

/** Volume degli effetti sonori rispetto alla musica (×2,5 ≈ +8 dB): devono sentirsi sopra la colonna sonora. */
export const FX = 2.5;
const lpCoef = (fc) => 1 - Math.exp((-TAU * fc) / SR);

/** Banco di mixaggio: bus asciutto e mandata al riverbero, in stereo. */
export const createMix = (seconds) => {
  const n = Math.ceil(seconds * SR);
  return { n, L: new Float32Array(n), R: new Float32Array(n), rL: new Float32Array(n), rR: new Float32Array(n) };
};

/**
 * Scrive un suono mono nel mix a partire da t (secondi). gen(i) restituisce il campione i-esimo
 * (i = 0 all'attacco) e viene chiamata per len campioni. pan in [-1, 1], rev = quota di mandata.
 */
export const put = (mix, t, len, gen, { gain = 1, pan = 0, rev = 0.2 } = {}) => {
  const s0 = Math.round(t * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < len; i++) {
    const k = s0 + i;
    if (k < 0) continue;
    if (k >= mix.n) break;
    const v = gen(i);
    mix.L[k] += v * gl;
    mix.R[k] += v * gr;
    mix.rL[k] += v * gl * rev;
    mix.rR[k] += v * gr * rev;
  }
};

// ---------------------------------------------------------------- strumenti

/** Tappeto: tre seghe leggermente scordate, filtrate, attacco e rilascio lenti. */
const pad = (f, dur, seed) => {
  const r = rng(seed);
  const det = [0.996, 1, 1.0045].map((d) => f * d);
  const ph = det.map(() => r());
  const att = 1.2, rel = 1.6;
  const a = lpCoef(f * 5);
  let lp = 0;
  return {
    len: Math.ceil((dur + rel) * SR),
    gen: (i) => {
      const t = i / SR;
      let s = 0;
      for (let k = 0; k < 3; k++) s += 2 * ((ph[k] + det[k] * t) % 1) - 1;
      lp += a * (s / 3 - lp);
      const env = Math.min(1, t / att) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / rel));
      return lp * env * (1 + 0.12 * Math.sin(TAU * 0.23 * t));
    },
  };
};

/** Basso: sinusoide con un po' di seconda armonica, decadimento morbido. */
const bass = (f, dur) => ({
  len: Math.ceil((dur + 0.4) * SR),
  gen: (i) => {
    const t = i / SR;
    const env = Math.min(1, t / 0.01) * Math.exp(-t / 0.55) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / 0.4));
    return (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * 2 * f * t)) * env;
  },
});

/** Corda pizzicata (Karplus-Strong) con eccitazione a seme fisso. */
const pluck = (f, dur, seed) => {
  const r = rng(seed);
  const N = Math.max(2, Math.round(SR / f));
  const buf = new Float32Array(N).map(() => r() * 2 - 1);
  let p = 0;
  return {
    len: Math.ceil(dur * SR),
    gen: (i) => {
      const nx = (p + 1) % N;
      const v = buf[p];
      buf[p] = 0.497 * (buf[p] + buf[nx]);
      p = nx;
      const t = i / SR;
      return v * Math.min(1, (dur - t) / 0.05);
    },
  };
};

/** Vibrafono: parziali 1, 4, 10 con tremolo lento. */
const vibes = (f, dur) => ({
  len: Math.ceil(dur * SR),
  gen: (i) => {
    const t = i / SR;
    const s = Math.sin(TAU * f * t) * Math.exp(-t / (dur * 0.45)) + 0.25 * Math.sin(TAU * 4 * f * t) * Math.exp(-t / 0.35) + 0.08 * Math.sin(TAU * 10 * f * t) * Math.exp(-t / 0.08);
    return s * Math.min(1, t / 0.003) * (1 + 0.25 * Math.sin(TAU * 5.2 * t)) * Math.min(1, (dur - t) / 0.05);
  },
});

/** Piano elettrico (stile Rhodes): modulazione di fase con indice decrescente, campanella breve e tremolo lieve. */
const epiano = (f, dur) => {
  const rel = 0.25;
  return {
    len: Math.ceil((dur + rel) * SR),
    gen: (i) => {
      const t = i / SR;
      const idx = 1.6 * Math.exp(-t / 0.22) + 0.25;
      const tine = Math.sin(TAU * f * t + idx * Math.sin(TAU * f * t));
      const bell = 0.12 * Math.sin(TAU * 7 * f * t) * Math.exp(-t / 0.045);
      const env = Math.min(1, t / 0.004) * Math.exp(-t / 1.3) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / rel));
      return (tine + bell) * env * (1 + 0.08 * Math.sin(TAU * 4.6 * t));
    },
  };
};

/** Contrabbasso: fondamentale con armoniche, attacco di dito smorzato, decadimento corto. */
const upright = (f, dur, seed) => {
  const r = rng(seed);
  let lp = 0;
  const rel = 0.12;
  return {
    len: Math.ceil((dur + rel) * SR),
    gen: (i) => {
      const t = i / SR;
      lp += 0.08 * ((r() * 2 - 1) - lp);
      const env = Math.min(1, t / 0.008) * Math.exp(-t / 0.42) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / rel));
      const body = Math.sin(TAU * f * t) + 0.5 * Math.sin(TAU * 2 * f * t) * Math.exp(-t / 0.25) + 0.2 * Math.sin(TAU * 3 * f * t) * Math.exp(-t / 0.12);
      return (body + lp * Math.exp(-t / 0.02) * 1.5) * env;
    },
  };
};

const INSTRUMENTS = { pad, bass, pluck, vibes, epiano, upright };

/** Una nota: inst = nome strumento, t/dur in secondi, vel 0–127. */
export const note = (mix, inst, name, { t, dur, vel = 64, pan = 0, rev = 0.25, gain = 1, seed = 1 }) => {
  const f = typeof name === 'number' ? name : hz(name);
  const { len, gen } = INSTRUMENTS[inst](f, dur, seed + Math.round(t * 1000));
  put(mix, t, len, gen, { gain: gain * vamp(vel), pan, rev });
};

// ---------------------------------------------------------------- batteria leggera

export const drum = (mix, kind, t, vel = 50, seed = 1) => {
  const r = rng(seed + Math.round(t * 1000));
  const g = vamp(vel);
  if (kind === 'kick') {
    put(mix, t, Math.ceil(0.45 * SR), (i) => {
      const x = i / SR;
      // frequenza che scende da 120 a 45 Hz (fase integrata)
      return Math.sin(TAU * (45 * x + 75 * 0.04 * (1 - Math.exp(-x / 0.04)))) * Math.exp(-x / 0.18);
    }, { gain: g * 0.9, rev: 0.05 });
  } else if (kind === 'sidestick') {
    let lp = 0;
    put(mix, t, Math.ceil(0.08 * SR), (i) => {
      const x = i / SR;
      const n = r() * 2 - 1;
      lp += 0.35 * (n - lp);
      return ((n - lp) * 0.6 + 0.5 * Math.sin(TAU * 1650 * x)) * Math.exp(-x / 0.015);
    }, { gain: g * 0.5, pan: -0.15, rev: 0.3 });
  } else if (kind === 'shaker') {
    let lp = 0;
    put(mix, t, Math.ceil(0.07 * SR), (i) => {
      const x = i / SR;
      const n = r() * 2 - 1;
      lp += 0.6 * (n - lp);
      return (n - lp) * Math.min(1, x / 0.012) * Math.exp(-x / 0.02);
    }, { gain: g * 0.22, pan: 0.3, rev: 0.1 });
  } else if (kind === 'swish') {
    // spazzola trascinata sul rullante: rumore a banda alta con salita e discesa lente
    const f = svf();
    put(mix, t, Math.ceil(0.22 * SR), (i) => {
      const x = i / SR;
      return f(r() * 2 - 1, 4200, 0.35).band * Math.min(1, x / 0.05) * Math.exp(-x / 0.08);
    }, { gain: g * 0.9, pan: -0.1, rev: 0.12 });
  } else if (kind === 'brushtap') {
    // colpetto di spazzola sul piatto: rumore alto e brevissimo
    const f = svf();
    put(mix, t, Math.ceil(0.09 * SR), (i) => {
      const x = i / SR;
      return f(r() * 2 - 1, 7000, 0.4).high * Math.min(1, x / 0.004) * Math.exp(-x / 0.025);
    }, { gain: g * 0.4, pan: 0.3, rev: 0.12 });
  } else if (kind === 'softkick') {
    put(mix, t, Math.ceil(0.3 * SR), (i) => {
      const x = i / SR;
      return Math.sin(TAU * (55 * x + 40 * 0.03 * (1 - Math.exp(-x / 0.03)))) * Math.exp(-x / 0.1);
    }, { gain: g * 0.6, rev: 0.05 });
  }
};

// ---------------------------------------------------------------- filtri

/** Filtro a variabile di stato (Chamberlin): restituisce passa-basso, passa-banda, passa-alto. */
const svf = () => {
  let low = 0, band = 0;
  return (x, fc, q = 0.7) => {
    const f = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6)) / SR);
    low += f * band;
    const high = x - low - q * band;
    band += f * high;
    return { low, band, high };
  };
};

// ---------------------------------------------------------------- effetti sonori

/** Tuono dopo un lampo: schiocco alto e brontolio basso lungo. power 0–1. */
export const thunder = (mix, t, power = 1, seed = 7) => {
  const r = rng(seed + Math.round(t * 1000));
  const f1 = svf(), f2 = svf();
  let brown = 0;
  const wob = [r() * 6, r() * 6];
  put(mix, t + 0.12, Math.ceil(4.2 * SR), (i) => {
    const x = i / SR;
    const n = r() * 2 - 1;
    brown = 0.985 * brown + 0.06 * n;
    const crack = f1(n, 2600, 0.9).high * Math.exp(-x / 0.09) * 0.7;
    const rumble = f2(brown, 160 + 60 * Math.sin(x * 3 + wob[0]), 0.6).low * 3.2;
    const env = Math.min(1, x / 0.25) * Math.exp(-x / 1.4) * (0.75 + 0.25 * Math.sin(x * 9 + wob[1]));
    return crack + rumble * env;
  }, { gain: FX * 0.55 * power, pan: 0.1, rev: 0.5 });
};

/** Lucchetto che scatta: due click metallici ravvicinati. */
export const lockClick = (mix, t, vel = 70, seed = 11) => {
  const r = rng(seed + Math.round(t * 1000));
  for (const [dt, g] of [[0, 1], [0.085, 0.7]]) {
    const parts = [2150, 3420, 5230, 7100].map((f) => f * (0.97 + r() * 0.06));
    put(mix, t + dt, Math.ceil(0.25 * SR), (i) => {
      const x = i / SR;
      let s = 0;
      parts.forEach((f, k) => { s += Math.sin(TAU * f * x) * Math.exp(-x / (0.05 / (k + 1))) / (k + 1); });
      return (s + (r() * 2 - 1) * Math.exp(-x / 0.004) * 0.8) * g;
    }, { gain: FX * vamp(vel) * 0.45, pan: 0.15, rev: 0.25 });
  }
};

/** Oggetto di metallo che cade e batte (lucchetto, catena). */
export const metalThud = (mix, t, vel = 60, seed = 13) => {
  const r = rng(seed + Math.round(t * 1000));
  const parts = [310, 742, 1166, 1903];
  put(mix, t, Math.ceil(0.8 * SR), (i) => {
    const x = i / SR;
    let s = 0;
    parts.forEach((f, k) => { s += Math.sin(TAU * f * x) * Math.exp(-x / (0.35 / (k + 1))) * (k ? 0.5 : 1); });
    s += Math.sin(TAU * 70 * x) * Math.exp(-x / 0.06) * 1.2;
    return s * 0.5 + (r() * 2 - 1) * Math.exp(-x / 0.008) * 0.6;
  }, { gain: FX * vamp(vel) * 0.5, pan: 0.05, rev: 0.3 });
};

/** Vento: rumore in passa-banda con centro e volume che si muovono a raffiche. */
export const wind = (mix, t0, t1, { power = 1, fade = 1.5, center = 520, seed = 17, muffle = 1 } = {}) => {
  for (const [side, pan] of [[0, -0.6], [1, 0.6]]) {
    const r = rng(seed + side * 101 + Math.round(t0 * 1000));
    const f = svf(), f2 = svf();
    const ph = [r() * 6, r() * 6, r() * 6];
    const dur = t1 - t0;
    put(mix, t0, Math.ceil(dur * SR), (i) => {
      const x = i / SR;
      const gust = 0.55 + 0.25 * Math.sin(x * 0.9 + ph[0]) + 0.2 * Math.sin(x * 2.3 + ph[1]);
      const fc = center * (0.6 + 0.8 * gust) + 140 * Math.sin(x * 0.37 + ph[2]);
      const b = f((r() * 2 - 1), fc, 0.25).band;
      const out = muffle < 1 ? f2(b, 300 + 2000 * muffle, 0.7).low : b;
      const env = Math.min(1, x / fade, (dur - x) / fade);
      return out * gust * gust * env;
    }, { gain: FX * 0.38 * power, pan, rev: 0.15 });
  }
};

/** Folata breve: rumore il cui filtro sale e scende (cappello che vola, fiamme). */
export const whoosh = (mix, t, dur, { vel = 60, seed = 19, lo = 300, hi = 2400, pan = 0 } = {}) => {
  const r = rng(seed + Math.round(t * 1000));
  const f = svf();
  put(mix, t, Math.ceil(dur * SR), (i) => {
    const u = i / (dur * SR);
    const fc = lo + (hi - lo) * Math.sin(Math.PI * u) ** 2;
    return f(r() * 2 - 1, fc, 0.4).band * Math.sin(Math.PI * u) ** 1.5;
  }, { gain: FX * vamp(vel) * 0.8, pan, rev: 0.3 });
};

/** Gesso sulla lavagna: graffio brevissimo e acuto. */
export const chalk = (mix, t, vel = 40, seed = 23) => {
  const r = rng(seed + Math.round(t * 10000));
  const f = svf();
  const len = 0.035 + r() * 0.03;
  const fc = 2800 + r() * 1800;
  put(mix, t, Math.ceil(len * SR), (i) => {
    const x = i / SR;
    return f(r() * 2 - 1, fc, 0.15).band * Math.sin((Math.PI * x) / len) * (0.8 + 0.4 * Math.sin(TAU * 140 * x));
  }, { gain: FX * vamp(vel) * 0.7, pan: -0.25 + r() * 0.2, rev: 0.12 });
};

/** Risucchio crescente che prepara una rivelazione (rumore che sale). */
export const swell = (mix, tEnd, dur, { vel = 60, seed = 29 } = {}) => {
  const r = rng(seed + Math.round(tEnd * 1000));
  const f = svf();
  put(mix, tEnd - dur, Math.ceil(dur * SR), (i) => {
    const u = i / (dur * SR);
    return f(r() * 2 - 1, 300 + 3000 * u * u, 0.5).band * u ** 2.5;
  }, { gain: FX * vamp(vel) * 0.9, rev: 0.6 });
};

/** Colpo sordo: timbro sulla cartella, porta, oggetto che cade. */
export const thud = (mix, t, vel = 70, { seed = 31, bright = 1200 } = {}) => {
  const r = rng(seed + Math.round(t * 1000));
  let lp = 0;
  const a = lpCoef(bright);
  put(mix, t, Math.ceil(0.9 * SR), (i) => {
    const x = i / SR;
    const body = Math.sin(TAU * (42 * x + 60 * 0.05 * (1 - Math.exp(-x / 0.05)))) * Math.exp(-x / 0.22);
    lp += a * ((r() * 2 - 1) - lp);
    return body + lp * Math.exp(-x / 0.05) * 1.6;
  }, { gain: FX * vamp(vel) * 0.85, rev: 0.35 });
};

/** Piccolo "pop" (pillole, piastrella): sinusoide che scende di tono. */
export const pop = (mix, t, vel = 50, { pitch = 0, pan = 0 } = {}) => {
  const f0 = 900 * 2 ** (pitch / 12);
  put(mix, t, Math.ceil(0.12 * SR), (i) => {
    const x = i / SR;
    return Math.sin(TAU * (f0 * 0.5 * x + f0 * 0.5 * 0.02 * (1 - Math.exp(-x / 0.02)))) * Math.exp(-x / 0.03);
  }, { gain: FX * vamp(vel) * 0.5, pan, rev: 0.25 });
};

/** Fiamme: crepitio di piccoli schiocchi casuali (seme fisso). */
export const crackle = (mix, t0, t1, { vel = 40, seed = 37 } = {}) => {
  const r = rng(seed);
  for (let t = t0; t < t1; t += 0.03 + r() * 0.16) {
    const g = 0.3 + r() * 0.7;
    const pan = r() * 1.2 - 0.6;
    const f = svf();
    const fc = 1500 + r() * 3000;
    put(mix, t, Math.ceil(0.02 * SR), (i) => f(r() * 2 - 1, fc, 0.3).band * Math.exp(-i / (SR * 0.004)), { gain: FX * vamp(vel) * g, pan, rev: 0.1 });
  }
};

/** Clacson: due toni quasi quadrati e filtrati (accordo morbido). freqs in Hz. */
export const carHorn = (mix, t, freqs = [349.2, 440, 523.3], { vel = 50, dur = 0.55, pan = 0 } = {}) => {
  freqs.forEach((f, k) => {
    let lp = 0;
    const a = lpCoef(f * 3.2);
    put(mix, t + k * 0.012, Math.ceil((dur + 0.15) * SR), (i) => {
      const x = i / SR;
      const sq = Math.sin(TAU * f * x) > 0 ? 1 : -1;
      lp += a * (sq - lp);
      const env = Math.min(1, x / 0.02) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 0.15));
      return lp * env * (1 + 0.04 * Math.sin(TAU * 6 * x));
    }, { gain: FX * vamp(vel) * 0.28, pan: pan + (k - 1) * 0.1, rev: 0.3 });
  });
};

/** Insegna al neon che si accende: scatto, sfarfallio e ronzio a 100 Hz che si assesta. */
export const neonHum = (mix, t, dur = 4, { vel = 40, seed = 43 } = {}) => {
  const r = rng(seed + Math.round(t * 1000));
  const f = svf();
  const flick = [0, 0.09, 0.2, 0.26, 0.45].map((d) => d + r() * 0.03);
  put(mix, t, Math.ceil(dur * SR), (i) => {
    const x = i / SR;
    let on = 1;
    if (x < 0.55) on = flick.filter((d) => x > d).length % 2 === 1 ? 1 : 0.15;
    const buzz = Math.sin(TAU * 100 * x) + 0.6 * Math.sin(TAU * 200 * x) + 0.35 * Math.sin(TAU * 300 * x + 1) + 0.2 * Math.sin(TAU * 500 * x);
    const click = Math.exp(-x / 0.003) * (r() * 2 - 1) * 1.2 + (x > 0.2 && x < 0.2012 ? 1 : 0);
    const hiss = f(r() * 2 - 1, 6000, 0.5).high * 0.05;
    const env = Math.min(1, x / 0.01) * Math.min(1, (dur - x) / 1.2);
    return (buzz * 0.2 * on + hiss * on) * env + click;
  }, { gain: FX * vamp(vel) * 0.5, pan: 0.25, rev: 0.2 });
};

// ---------------------------------------------------------------- riverbero e uscita

/** Riverbero tipo Schroeder/Freeverb ridotto: 4 pettini + 2 passa-tutto per canale. */
const reverb = (input, offset, room = 0.84, damp = 0.3) => {
  const out = new Float32Array(input.length);
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ buf: new Float32Array(d + offset), p: 0, lp: 0 }));
  const aps = [556, 441].map((d) => ({ buf: new Float32Array(d + offset), p: 0 }));
  for (let i = 0; i < input.length; i++) {
    const x = input[i] * 0.3;
    let s = 0;
    for (const c of combs) {
      const y = c.buf[c.p];
      c.lp = y * (1 - damp) + c.lp * damp;
      c.buf[c.p] = x + c.lp * room;
      c.p = (c.p + 1) % c.buf.length;
      s += y;
    }
    for (const a of aps) {
      const y = a.buf[a.p];
      a.buf[a.p] = s + y * 0.5;
      a.p = (a.p + 1) % a.buf.length;
      s = y - s * 0.5;
    }
    out[i] = s;
  }
  return out;
};

/**
 * Chiude il mix: riverbero, dissolvenze, normalizzazione al picco (dBFS) e WAV 16 bit stereo.
 * Restituisce il picco prima della normalizzazione.
 */
export const writeWav = (mix, path, { peakDb = -3, fadeIn = 0.05, fadeOut = 2, wet = 0.9, riverbero } = {}) => {
  // riverbero: (canale, 0|1) → coda; se manca si usa il riverbero a pettini qui sopra
  const wl = riverbero ? riverbero(mix.rL, 0) : reverb(mix.rL, 0), wr = riverbero ? riverbero(mix.rR, 1) : reverb(mix.rR, 23);
  const L = new Float32Array(mix.n), R = new Float32Array(mix.n);
  let peak = 0;
  for (let i = 0; i < mix.n; i++) {
    const t = i / SR, rest = (mix.n - i) / SR;
    const env = Math.min(1, t / fadeIn, rest / fadeOut);
    L[i] = (mix.L[i] + wl[i] * wet) * env;
    R[i] = (mix.R[i] + wr[i] * wet) * env;
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  const g = peak > 0 ? 10 ** (peakDb / 20) / peak : 1;
  const data = Buffer.alloc(44 + mix.n * 4);
  data.write('RIFF', 0); data.writeUInt32LE(36 + mix.n * 4, 4); data.write('WAVE', 8);
  data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22);
  data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34);
  data.write('data', 36); data.writeUInt32LE(mix.n * 4, 40);
  const dither = rng(99);
  const q = (v) => Math.max(-32768, Math.min(32767, Math.round(v * g * 32767 + (dither() - dither()))));
  for (let i = 0; i < mix.n; i++) {
    data.writeInt16LE(q(L[i]), 44 + i * 4);
    data.writeInt16LE(q(R[i]), 46 + i * 4);
  }
  writeFileSync(path, data);
  return peak;
};

// ---------------------------------------------------------------- effetti aggiunti per The Truman Show
// (solo nuove esportazioni: i suoni sopra restano identici)

/** Vetro che si frantuma: schiocco di rumore alto e pioggia di schegge tintinnanti. */
export const glassCrash = (mix, t, vel = 80, seed = 53) => {
  const r = rng(seed + Math.round(t * 1000));
  const f = svf();
  put(mix, t, Math.ceil(0.9 * SR), (i) => {
    const x = i / SR;
    return f(r() * 2 - 1, 5200, 0.3).high * (Math.exp(-x / 0.05) + 0.35 * Math.exp(-x / 0.3));
  }, { gain: FX * vamp(vel) * 0.7, pan: 0.05, rev: 0.3 });
  for (let k = 0; k < 26; k++) {
    const dt = 0.01 + r() ** 1.6 * 0.9;
    const fr = 2400 + r() * 5200;
    const g = (0.15 + r() * 0.5) * (1 - dt / 1.1);
    const tau = 0.02 + r() * 0.07;
    put(mix, t + dt, Math.ceil(0.4 * SR), (i) => {
      const x = i / SR;
      return Math.sin(TAU * fr * x) * Math.exp(-x / tau) * Math.min(1, x / 0.0008);
    }, { gain: FX * vamp(vel) * g * 0.5, pan: r() * 1.4 - 0.7, rev: 0.3 });
  }
};

/** Pioggia: sibilo di rumore alto e stereo, con dissolvenza in entrata e in uscita. */
export const rainHiss = (mix, t0, t1, { power = 1, fade = 1.2, seed = 59 } = {}) => {
  for (const [side, pan] of [[0, -0.5], [1, 0.5]]) {
    const r = rng(seed + side * 131 + Math.round(t0 * 1000));
    const f = svf(), f2 = svf();
    const dur = t1 - t0;
    put(mix, t0, Math.ceil(dur * SR), (i) => {
      const x = i / SR;
      const n = r() * 2 - 1;
      const hiss = f(n, 6500, 0.35).band * 0.8 + f2(n, 2600, 0.5).band * 0.35;
      const drop = r() < 0.0009 ? (r() * 2 - 1) * 2.5 : 0;
      return (hiss * (0.8 + 0.2 * Math.sin(x * 0.7 + side)) + drop * 0.4) * Math.min(1, x / fade, (dur - x) / fade);
    }, { gain: FX * 0.34 * power, pan, rev: 0.2 });
  }
};

/** Radio non sintonizzata: rumore a banda media a raffiche, crepitii e un fischio di sintonia che scivola. */
export const radioStatic = (mix, t, dur = 1.6, { vel = 55, seed = 61, whistle = 1800 } = {}) => {
  const r = rng(seed + Math.round(t * 1000));
  const f = svf();
  let gate = 1, hold = 0;
  put(mix, t, Math.ceil(dur * SR), (i) => {
    const x = i / SR, u = x / dur;
    if (--hold <= 0) { gate = 0.35 + r() * 0.65; hold = Math.floor(SR * (0.004 + r() * 0.03)); }
    const n = r() * 2 - 1;
    const body = f(n, 2300 + 700 * Math.sin(x * 11), 0.4).band * gate;
    const tone = Math.sin(TAU * (whistle * x + 600 * Math.sin(Math.PI * u) * x)) * 0.05 * Math.sin(Math.PI * u) ** 2;
    const env = Math.min(1, x / 0.02, (dur - x) / 0.12);
    return (body * 0.9 + tone) * env;
  }, { gain: FX * vamp(vel) * 0.7, pan: -0.15, rev: 0.12 });
};

/** Porta che cigola: dente di sega a tono che sale e scende, a scatti, filtrato in formanti. */
export const doorCreak = (mix, t, dur = 1.8, { vel = 50, seed = 67 } = {}) => {
  const r = rng(seed + Math.round(t * 1000));
  const f = svf();
  let ph = 0;
  const wob = [r() * 6, r() * 6];
  put(mix, t, Math.ceil(dur * SR), (i) => {
    const x = i / SR, u = x / dur;
    const fr = 210 + 160 * Math.sin(Math.PI * u * 0.9) + 25 * Math.sin(x * 23 + wob[0]) + 18 * (r() - 0.5);
    ph = (ph + fr / SR) % 1;
    const saw = 2 * ph - 1;
    const stick = 0.55 + 0.45 * Math.sin(x * 47 + wob[1]) ** 2;
    const out = f(saw, 900 + 500 * Math.sin(Math.PI * u), 0.25).band * 2.2;
    return out * stick * Math.min(1, x / 0.05, (dur - x) / 0.25);
  }, { gain: FX * vamp(vel) * 0.55, pan: 0.3, rev: 0.3 });
};

/** Colpo vuoto su una superficie dipinta: toc di legno cavo e breve risonanza. */
export const hollowBonk = (mix, t, vel = 70, seed = 71) => {
  const r = rng(seed + Math.round(t * 1000));
  let lp = 0;
  put(mix, t, Math.ceil(0.7 * SR), (i) => {
    const x = i / SR;
    lp += 0.25 * ((r() * 2 - 1) - lp);
    const body = Math.sin(TAU * (118 * x + 40 * 0.03 * (1 - Math.exp(-x / 0.03)))) * Math.exp(-x / 0.12)
      + 0.45 * Math.sin(TAU * 236 * x) * Math.exp(-x / 0.08) + 0.25 * Math.sin(TAU * 410 * x) * Math.exp(-x / 0.05);
    return body + lp * Math.exp(-x / 0.012) * 1.1;
  }, { gain: FX * vamp(vel) * 0.8, pan: 0, rev: 0.45 });
};

/** Applauso lontano: tanti piccoli battiti casuali con densità e volume che crescono e poi calano. */
export const applause = (mix, t, dur = 5, { vel = 40, seed = 73 } = {}) => {
  const r = rng(seed + Math.round(t * 1000));
  for (const [side, pan] of [[0, -0.5], [1, 0.5]]) {
    for (let x = 0; x < dur;) {
      const u = x / dur;
      const env = Math.min(1, u / 0.6) ** 1.5 * Math.min(1, (1 - u) / 0.35);
      const gap = 0.012 + r() * 0.05 / (0.2 + env);
      x += gap;
      if (x >= dur) break;
      const f = svf();
      const fc = 1500 + r() * 2800;
      const len = 0.012 + r() * 0.012;
      put(mix, t + x, Math.ceil(len * SR * 3), (i) => f(r() * 2 - 1, fc, 0.5).band * Math.exp(-i / (SR * len)),
        { gain: FX * vamp(vel) * env * (0.3 + r() * 0.7) * 0.5, pan: pan + (r() - 0.5) * 0.5, rev: 0.4 });
    }
  }
};

/** Cambio di canale: scatto elettrico e breve lampo di rumore da televisore. */
export const channelClick = (mix, t, vel = 60, seed = 79) => {
  const r = rng(seed + Math.round(t * 1000));
  const f = svf();
  put(mix, t, Math.ceil(0.4 * SR), (i) => {
    const x = i / SR;
    const click = (r() * 2 - 1) * Math.exp(-x / 0.002) * 1.4;
    const burst = f(r() * 2 - 1, 3800, 0.3).band * Math.min(1, x / 0.004) * Math.exp(-x / 0.07) * 0.9;
    const thump = Math.sin(TAU * 90 * x) * Math.exp(-x / 0.03) * 0.6;
    return click + burst + thump;
  }, { gain: FX * vamp(vel) * 0.75, pan: 0.1, rev: 0.15 });
};
