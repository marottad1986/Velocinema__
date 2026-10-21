// Colonna sonora originale di Shutter Island: tesa e discreta, Re minore, 90 bpm.
// Giro di accordi e livelli per sezione come in reference/shutter-island/score.js (nessun tema del film).
// Effetti agganciati agli istanti delle scene in src/scenes/shutter-island/*.tsx (secondi dall'inizio del capitolo).
import { note, drum, thunder, lockClick, metalThud, wind, whoosh, chalk, swell, thud, pop, crackle } from './synth.mjs';

const BPM = 90;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

const PROG = [['D3', 'F3', 'A3'], ['A#2', 'D3', 'F3'], ['G2', 'A#2', 'D3'], ['A2', 'C#3', 'E3']];
const ROOTS = ['D2', 'A#1', 'G1', 'A1'];
const ARP = [['A4', 'D5', 'F5', 'D5'], ['F4', 'A#4', 'D5', 'A#4'], ['D4', 'G4', 'A#4', 'G4'], ['E4', 'A4', 'C#5', 'A4']];

/** Pattern a ottavi su una battuta ('x' = colpo, 'o' = colpo leggero): chiama hit(t, forte). */
const steps = (pat, t0, hit) => [...pat].forEach((c, k) => c !== '.' && hit(t0 + (k * BAR) / pat.length, c === 'x'));

/** Una battuta di musica al livello indicato (0 tappeto, 1 arpeggio, 2 basso e ritmo, 3 contrappunto). */
const bar = (mix, t, i, level) => {
  PROG[i].forEach((n, k) => note(mix, 'pad', n, { t, dur: BAR, vel: 40 + level * 4, rev: 0.6, pan: (k - 1) * 0.3, gain: 0.5, seed: k + 1 }));
  if (level >= 1) {
    let j = 0;
    steps('x.x.x.x.', t, (tt) => note(mix, 'pluck', ARP[i][j++ % 4], { t: tt, dur: 1.2, vel: 40, pan: 0.2, rev: 0.35, gain: 0.45 }));
  }
  if (level >= 2) {
    steps('x..x..x.', t, (tt) => note(mix, 'bass', ROOTS[i], { t: tt, dur: BEAT * 1.2, vel: 66, rev: 0.05, gain: 0.7 }));
    steps('x.......', t, (tt) => drum(mix, 'kick', tt, 46));
    steps('....x...', t, (tt) => drum(mix, 'sidestick', tt, 46));
    steps('oxoxoxox', t, (tt, f) => drum(mix, 'shaker', tt, f ? 46 : 34));
  }
  if (level >= 3) {
    let j = 0;
    steps('.x.x.x.x', t, (tt) => note(mix, 'pluck', ARP[(i + 2) % 4][j++ % 4], { t: tt, dur: 1.0, vel: 34, pan: -0.25, rev: 0.4, gain: 0.45 }));
  }
};

/** Lavagna: righe di gesso scritte lettera per lettera (stessi tempi di Lavagna.tsx). */
const LAVAGNA_ROWS = [
  { s: 'EDWARD DANIELS', a: 3.6, b: 4.65 },
  { s: 'ANDREW LAEDDIS', a: 5.0, b: 6.3, anagram: true },
  { s: 'RACHEL SOLANDO', a: 6.45, b: 7.5 },
  { s: 'DOLORES CHANAL', a: 7.85, b: 9.15, anagram: true },
];

export default (mix, T) => {
  // ---- musica: sezioni allineate alla battuta più vicina all'inizio dei capitoli
  const B = (id) => Math.round(T[id] / BAR) * BAR;
  const sections = [
    [0, B('ospedale'), 0],
    [B('ospedale'), B('incendio'), 1],
    [B('incendio'), B('lavagna'), 2],
    [B('lavagna'), B('verita'), 3],
    [B('verita'), B('alba'), 1],
    [B('alba'), T.END - 4, 0],
  ];
  for (const [from, to, level] of sections) {
    for (let t = from, k = 0; t + BAR <= to + 1e-6; t += BAR, k++) bar(mix, t, k % 4, level);
  }
  // pedale grave di Re sotto tutto il film: tiene la tensione anche nei passaggi vuoti
  note(mix, 'pad', 'D2', { t: 0, dur: T.END - 3, vel: 34, rev: 0.4, gain: 0.35, seed: 9 });
  // finale: accordo pieno e arpeggio di campane che sale
  ['D3', 'F3', 'A3', 'D4'].forEach((n, k) => note(mix, 'pad', n, { t: T.END - 4, dur: 2.6, vel: 50, rev: 0.6, pan: (k - 1.5) * 0.25, gain: 0.5, seed: 20 + k }));
  ['D5', 'F5', 'A5', 'D6'].forEach((n, k) => note(mix, 'vibes', n, { t: T.END - 3.5 + k * 0.3, dur: 3, vel: 40 + k * 4, pan: -0.2, rev: 0.5, gain: 0.5 }));

  const at = (id, s) => T[id] + s;

  // ---- copertina: tempesta, lampo a 1,6 s, lucchetto aperto che dondola
  note(mix, 'vibes', 'D5', { t: 0.2, dur: 3, vel: 40, pan: -0.2, rev: 0.5, gain: 0.5 });
  wind(mix, 0, 4.6, { power: 0.5, fade: 0.8 });
  thunder(mix, 1.6, 0.9);
  lockClick(mix, 0.5, 34);

  // ---- ospedale: il lucchetto scatta (0,6), cade (1,0–1,45), il cancello si apre
  lockClick(mix, at('ospedale', 0.6), 72);
  metalThud(mix, at('ospedale', 1.45), 62);
  whoosh(mix, at('ospedale', 1.5), 3.6, { vel: 34, lo: 180, hi: 700 });

  // ---- cella: lucchetto che vibra, lampo a 3,0 e 7,8 (più debole)
  lockClick(mix, at('cella', 0.35), 50);
  thunder(mix, at('cella', 3.0), 1);
  thunder(mix, at('cella', 7.8), 0.7);

  // ---- biglietto: la piastrella si solleva
  thud(mix, at('biglietto', 0.75), 44, { bright: 2500 });
  pop(mix, at('biglietto', 1.85), 40, { pitch: -5 });

  // ---- studio: pillole che cadono, lampo a 4,6
  pop(mix, at('studio', 1.95), 45);
  pop(mix, at('studio', 2.15), 40, { pitch: 3, pan: 0.2 });
  pop(mix, at('studio', 2.35), 36, { pitch: 1, pan: -0.15 });
  thunder(mix, at('studio', 4.6), 0.6);

  // ---- incendio: crepitio del fuoco e fiammata
  crackle(mix, at('incendio', 0), at('incendio', 10), { vel: 34 });
  whoosh(mix, at('incendio', 7.6), 0.9, { vel: 56, lo: 200, hi: 1400 });

  // ---- uragano: vento forte, lampi a 3,0 e 7,2, il cappello vola via (5–8)
  wind(mix, at('uragano', -0.6), at('uragano', 10.4), { power: 1.15, center: 650 });
  thunder(mix, at('uragano', 3.0), 1);
  thunder(mix, at('uragano', 7.2), 0.7);
  whoosh(mix, at('uragano', 5.0), 3.0, { vel: 66, lo: 400, hi: 2600, pan: 0.4 });

  // ---- grotta: tempesta attutita fuori dall'apertura, lampi a 2,4 e 7,0, fuoco
  wind(mix, at('grotta', 0), at('grotta', 9), { power: 0.6, muffle: 0.25 });
  crackle(mix, at('grotta', 0), at('grotta', 9), { vel: 26, seed: 41 });
  thunder(mix, at('grotta', 2.4), 0.6);
  thunder(mix, at('grotta', 7.0), 0.45);

  // ---- lavagna: gesso lettera per lettera; gli anagrammi arrivano con un risucchio e una campana
  for (const row of LAVAGNA_ROWS) {
    [...row.s].forEach((c, i) => {
      if (c !== ' ') chalk(mix, at('lavagna', row.a + ((row.b - row.a) * i) / (row.s.length - 1)), row.anagram ? 44 : 36);
    });
    if (row.anagram) {
      swell(mix, at('lavagna', row.a), 1.2, { vel: 58 });
      note(mix, 'vibes', 'A5', { t: at('lavagna', row.b + 0.05), dur: 2.5, vel: 62, rev: 0.6, gain: 0.6 });
      note(mix, 'vibes', 'D6', { t: at('lavagna', row.b + 0.05), dur: 2.5, vel: 48, rev: 0.6, gain: 0.5, pan: 0.2 });
    }
  }
  thunder(mix, at('lavagna', 10.3), 0.9); // «Teddy non esiste»

  // ---- verità: il cappello cade (0,7–1,55), il timbro «Ultima prova» a 10,0
  whoosh(mix, at('verita', 0.7), 0.85, { vel: 36, lo: 300, hi: 1200 });
  thud(mix, at('verita', 1.55), 40, { bright: 900 });
  swell(mix, at('verita', 10.0), 0.6, { vel: 46 });
  thud(mix, at('verita', 10.0), 92);

  // ---- alba: brezza leggera dal mare
  wind(mix, at('alba', 0), T.END, { power: 0.3, center: 380, fade: 3 });
};
