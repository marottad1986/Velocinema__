// Riverbero a convoluzione: risposta all'impulso di una sala calcolata (prime riflessioni + coda diffusa
// che si scurisce col tempo, a seme fisso) e convoluzione FFT a blocchi uniformi.
import { SR, rng } from './synth.mjs';

/** FFT complessa radice 2 sul posto (n potenza di 2); inv = true per l'inversa (non normalizzata). */
const fft = (re, im, inv = false) => {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inv ? 2 : -2) * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    const half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < half; k++) {
        const a = i + k, b = a + half;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
};

/**
 * Risposta all'impulso stereo di una sala. rt60 = secondi per scendere di 60 dB; brillo = frequenza (Hz)
 * del passa-basso all'inizio della coda, che poi scende verso un terzo (le alte si spengono prima).
 */
export const impulso = ({ rt60 = 2.4, predelay = 0.022, brillo = 7000, seed = 5 } = {}) => {
  const len = Math.ceil((predelay + rt60 * 1.1) * SR);
  const out = [];
  for (const side of [0, 1]) {
    const r = rng(seed + side * 977);
    const h = new Float32Array(len);
    const p0 = Math.round(predelay * SR);
    // prime riflessioni: impulsi sparsi nei primi 80 ms, diversi a sinistra e a destra
    for (let k = 0; k < 14; k++) {
      const d = p0 + Math.round((0.004 + r() ** 1.4 * 0.075) * SR);
      if (d < len) h[d] += (r() < 0.5 ? -1 : 1) * (0.5 + 0.5 * r()) * 0.9 * Math.exp(-(d - p0) / SR / 0.06);
    }
    // coda diffusa: rumore con decadimento esponenziale e passa-basso che si chiude
    let lp1 = 0, lp2 = 0;
    for (let i = p0; i < len; i++) {
      const x = (i - p0) / SR;
      const fc = brillo * (0.33 + 0.67 * Math.exp(-x / (rt60 * 0.35)));
      const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
      lp1 += a * (r() * 2 - 1 - lp1);
      lp2 += a * (lp1 - lp2);
      const env = Math.exp((-6.9 * x) / rt60) * Math.min(1, x / 0.03);
      h[i] += lp2 * env * 1.6;
    }
    out.push(h);
  }
  // energia unitaria (media dei due canali)
  let e = 0;
  for (const h of out) for (let i = 0; i < h.length; i++) e += h[i] * h[i];
  const g = 1 / Math.sqrt(e / 2);
  for (const h of out) for (let i = 0; i < h.length; i++) h[i] *= g;
  return out;
};

/** Convoluzione di x con h (FFT a blocchi uniformi). Restituisce un array lungo quanto x. */
export const convolvi = (x, h, B = 8192) => {
  const N = 2 * B;
  const P = Math.ceil(h.length / B);
  const H = [];
  for (let p = 0; p < P; p++) {
    const re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < B && p * B + i < h.length; i++) re[i] = h[p * B + i];
    fft(re, im);
    H.push([re, im]);
  }
  const blocks = Math.ceil(x.length / B);
  const X = []; // spettri degli ultimi P blocchi d'ingresso (linea di ritardo in frequenza)
  const y = new Float32Array(x.length);
  const accR = new Float64Array(N), accI = new Float64Array(N);
  for (let j = 0; j < blocks + P; j++) {
    const re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < B; i++) re[i] = x[j * B + i] ?? 0;
    fft(re, im);
    X.unshift([re, im]);
    if (X.length > P) X.pop();
    accR.fill(0); accI.fill(0);
    for (let p = 0; p < X.length; p++) {
      const [xr, xi] = X[p], [hr, hi] = H[p];
      for (let k = 0; k < N; k++) {
        accR[k] += xr[k] * hr[k] - xi[k] * hi[k];
        accI[k] += xr[k] * hi[k] + xi[k] * hr[k];
      }
    }
    fft(accR, accI, true);
    for (let i = 0; i < N; i++) {
      const k = j * B + i;
      if (k < y.length) y[k] += accR[i] / N;
    }
  }
  return y;
};
