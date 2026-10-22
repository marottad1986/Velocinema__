// Strumenti campionati: VSCO-2 Community Edition (CC0, Versilian Studios), scaricati alla prima esecuzione
// in campioni/vsco/ (cartella ignorata da git) dal commit fissato in vsco.json, quindi il suono non cambia nel tempo.
// Suona le note con scelta del campione più vicino, dinamica per velocità, alternanza deterministica,
// cambio d'intonazione con interpolazione cubica e prolungamento delle note lunghe con dissolvenze incrociate.
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { readWav } from './wav.mjs';
import { SR, hz, rng } from './synth.mjs';

const INDICE = JSON.parse(readFileSync(new URL('./vsco.json', import.meta.url), 'utf8'));
const CACHE = 'campioni/vsco';

const percorso = (s, c) => `${CACHE}/${s.dir}/${c.f}`;

/** Scarica i campioni mancanti degli strumenti indicati (curl, presente anche in Windows 10+). */
export const scaricaCampioni = (ids) => {
  const mancanti = [];
  for (const id of ids) {
    const s = INDICE.strumenti[id];
    if (!s) throw new Error(`Strumento campionato sconosciuto: ${id}`);
    for (const c of s.campioni) if (!existsSync(percorso(s, c))) mancanti.push([s, c]);
  }
  if (!mancanti.length) return;
  console.log(`Scarico ${mancanti.length} campioni VSCO-2 CE in ${CACHE}/ (solo la prima volta)…`);
  for (const [s, c] of mancanti) {
    const dest = percorso(s, c);
    mkdirSync(dirname(dest), { recursive: true });
    const url = `https://raw.githubusercontent.com/${INDICE.repo}/${INDICE.commit}/${`${s.dir}/${c.f}`.split('/').map(encodeURIComponent).join('/')}`;
    const res = spawnSync('curl', ['-fsSL', '--retry', '3', '-o', dest, url], { stdio: 'inherit' });
    if (res.error) throw new Error(`curl non trovato: serve per scaricare i campioni (${res.error.message})`);
    if (res.status !== 0) throw new Error(`Download fallito: ${url}`);
  }
};

// ---------------------------------------------------------------- caricamento

const memoria = new Map();
const carica = (s, c) => {
  const p = percorso(s, c);
  if (!memoria.has(p)) {
    const w = readWav(p);
    if (w.sr !== SR) throw new Error(`Frequenza di campionamento non prevista (${w.sr}): ${p}`);
    const a = Math.round(c.inizio * SR);
    memoria.set(p, { L: w.L.subarray(a), R: w.R.subarray(a) });
  }
  return memoria.get(p);
};

/** Strati di dinamica dello strumento, dal più piano al più forte (ordinati per livello misurato). */
const stratiCache = new Map();
const strati = (id) => {
  if (!stratiCache.has(id)) {
    const s = INDICE.strumenti[id];
    const g = {};
    for (const c of s.campioni) (g[c.dyn] ??= []).push(c);
    const media = (cs) => cs.reduce((a, c) => a + c.db, 0) / cs.length;
    stratiCache.set(id, Object.values(g).sort((a, b) => media(a) - media(b)));
  }
  return stratiCache.get(id);
};

/** Guadagno che porta lo strato più forte dello strumento a -11 dB RMS: i gain dello spartito sono confrontabili. */
const RIF = -11;
const livello = (id) => {
  const s = INDICE.strumenti[id];
  const top = s.perc ? s.campioni : strati(id).at(-1);
  return 10 ** ((RIF - Math.max(...top.map((c) => c.db))) / 20);
};

const hermite = (x, i, f) => {
  const xm = x[i - 1] ?? 0, x0 = x[i] ?? 0, x1 = x[i + 1] ?? 0, x2 = x[i + 2] ?? 0;
  const c1 = 0.5 * (x1 - xm), c2 = xm - 2.5 * x0 + 2 * x1 - 0.5 * x2, c3 = 0.5 * (x2 - xm) + 1.5 * (x0 - x1);
  return ((c3 * f + c2) * f + c1) * f + x0;
};

/** Mix stereo: scrive due canali (già panoramici) nel bus asciutto e nella mandata al riverbero. */
const putStereo = (mix, t, len, gen, { gain = 1, pan = 0, rev = 0.2 }) => {
  const s0 = Math.round(t * SR);
  // bilanciamento a potenza costante che conserva l'immagine stereo del campione
  const gl = gain * Math.min(1, Math.SQRT2 * Math.cos(((pan + 1) * Math.PI) / 4));
  const gr = gain * Math.min(1, Math.SQRT2 * Math.sin(((pan + 1) * Math.PI) / 4));
  const o = [0, 0];
  for (let i = 0; i < len; i++) {
    const k = s0 + i;
    if (k < 0) continue;
    if (k >= mix.n) break;
    gen(i, o);
    const l = o[0] * gl, r = o[1] * gr;
    mix.L[k] += l; mix.R[k] += r;
    mix.rL[k] += l * rev; mix.rR[k] += r * rev;
  }
};

// ---------------------------------------------------------------- note

/**
 * Suona una nota con uno strumento campionato.
 * nota: nome ('D3') o numero MIDI. t/dur in secondi; vel 0–127 sceglie lo strato di dinamica e il volume.
 * attack: dissolvenza d'entrata (archi che crescono); release: coda dopo dur (archi ~0,8 s; arpa/piano lasciano
 * suonare con release lungo); start: secondi di campione da saltare (attacco più morbido).
 */
export const suona = (mix, id, nota, { t, dur, vel = 64, pan = 0, rev = 0.3, gain = 1, attack = 0, release = 0.6, start = 0, seed = 1 }) => {
  const s = INDICE.strumenti[id];
  const midi = typeof nota === 'number' ? nota : Math.round(69 + 12 * Math.log2(hz(nota) / 440));
  const r = rng(seed * 7919 + Math.round(t * 1000) + midi * 31);
  const ss = strati(id);
  const strato = ss[Math.min(ss.length - 1, Math.floor((vel / 128) * ss.length))];
  // campione più vicino in altezza (a pari distanza, quello sopra: suona più naturale scendere che salire);
  // tra i campioni della stessa nota (ripetizioni) si sceglie con il seme
  const dist = (c) => Math.abs(c.midi - midi) + (c.midi < midi ? 0.1 : 0);
  const best = Math.min(...strato.map(dist));
  const cand = strato.filter((c) => dist(c) === best);
  const c = cand[Math.floor(r() * cand.length)];
  const { L, R } = carica(s, c);
  const ratio = 2 ** ((midi - c.midi - (c.cents ?? 0) / 100) / 12);
  // volume: lo strato porta già il suo timbro; la velocità rifinisce dentro lo strato
  const g = gain * livello(id) * (0.35 + 0.65 * (vel / 127)) ** 1.5;

  // prolungamento: oltre B si torna ad A con dissolvenza incrociata di X campioni (a potenza costante)
  const n = L.length;
  const X = Math.round(0.35 * SR);
  const B = n - Math.round(0.4 * SR);
  const A = Math.max(X + 1, Math.round(n * 0.3));
  const loop = B - A > 2 * X;
  const at = (ch, v) => {
    if (!loop || v < B - X) return v < n - 2 ? hermite(ch, Math.floor(v), v - Math.floor(v)) : 0;
    const w = v - (B - X), P = B - A;
    const u = w - Math.floor(w / P) * P;
    const pos = A - X + u;
    const a = hermite(ch, Math.floor(pos), pos - Math.floor(pos));
    if (u >= X) return a;
    const tail = B - X + u;
    const b = hermite(ch, Math.floor(tail), tail - Math.floor(tail));
    const k = (u / X) * (Math.PI / 2);
    return b * Math.cos(k) + a * Math.sin(k);
  };
  const s0 = start * SR;
  const fineNaturale = loop ? Infinity : (n - s0) / ratio / SR;
  const len = Math.ceil(Math.min(dur + release, fineNaturale) * SR);
  const atk = attack * SR, d = dur * SR, rel = Math.max(1, release * SR);
  putStereo(mix, t, len, (i, o) => {
    const v = s0 + i * ratio;
    let env = atk > 0 && i < atk ? Math.sin((i / atk) * (Math.PI / 2)) ** 2 : 1;
    if (i > d) env *= Math.max(0, 1 - (i - d) / rel) ** 2;
    o[0] = at(L, v) * env;
    o[1] = at(R, v) * env;
  }, { gain: g, pan, rev });
};

/**
 * Colpo di percussione campionata: file = inizio del nome del campione (es. 'bdrum_mp', 'gong_hit_p')
 * oppure dinamica; tra più campioni corrispondenti si sceglie con il seme. dur facoltativa (sfuma alla fine).
 */
export const colpo = (mix, id, file, { t, vel = 100, pan = 0, rev = 0.3, gain = 1, dur = Infinity, release = 0.5, pitch = 0, seed = 1 }) => {
  const s = INDICE.strumenti[id];
  const cand = s.campioni.filter((c) => c.f.startsWith(file) || c.dyn === file);
  if (!cand.length) throw new Error(`Nessun campione "${file}" in ${id}`);
  const r = rng(seed * 7919 + Math.round(t * 1000));
  const c = cand[Math.floor(r() * cand.length)];
  const { L, R } = carica(s, c);
  const ratio = 2 ** (pitch / 12);
  const len = Math.ceil(Math.min((L.length - 2) / ratio, (dur + release) * SR));
  const d = dur * SR, rel = release * SR;
  putStereo(mix, t, len, (i, o) => {
    const v = i * ratio, k = Math.floor(v);
    const env = i > d ? Math.max(0, 1 - (i - d) / rel) ** 2 : 1;
    o[0] = hermite(L, k, v - k) * env;
    o[1] = hermite(R, k, v - k) * env;
  }, { gain: gain * livello(id) * (vel / 127), pan, rev });
};
