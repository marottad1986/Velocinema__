// Colonna sonora originale di Shutter Island: tesa e discreta, Re minore, 90 bpm.
// Giro di accordi e livelli per sezione come in reference/shutter-island/score.js (nessun tema del film).
// Orchestra d'archi, arpa, pianoforte e percussioni campionati (VSCO-2 CE, CC0: scripts/audio/campioni.mjs).
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs), gesso e risucchio sintetici.
// Effetti agganciati agli istanti delle scene in src/scenes/shutter-island/*.tsx (secondi dall'inizio del capitolo).
import { chalk, swell } from './synth.mjs';
import { suona, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';

export const strumenti = ['violini', 'viole', 'celli', 'contrabbasso', 'violini_trem', 'celli_trem', 'contrabbasso_pizz', 'arpa', 'pianoforte', 'glockenspiel', 'grancassa', 'gong', 'piatto_sospeso'];
export const effetti = ['tuono_classico', 'tuono_breve', 'tuono_secco', 'tuono_forte', 'tuono_lontano', 'pioggia_vento', 'vento_fischio', 'vento_invernale', 'vento_raffiche', 'vento_leggero', 'serratura', 'metallo_cade', 'cancello', 'colpi_legno', 'martelletto', 'tintinnio', 'fuoco', 'fiammata', 'telo', 'stoffa'];
/** Sala da concerto scura: coda lunga, alte smorzate. */
export const sala = { rt60: 2.8, brillo: 5500, predelay: 0.03, wet: 0.55 };

const BPM = 90;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

const PROG = [['D3', 'F3', 'A3'], ['A#2', 'D3', 'F3'], ['G2', 'A#2', 'D3'], ['A2', 'C#3', 'E3']];
const ROOTS = ['D2', 'A#1', 'G1', 'A1'];
const ARP = [['A4', 'D5', 'F5', 'D5'], ['F4', 'A#4', 'D5', 'A#4'], ['D4', 'G4', 'A#4', 'G4'], ['E4', 'A4', 'C#5', 'A4']];
/** Nota acuta tenuta dai violini (la voce più alta dell'accordo, due ottave sopra). */
const TOP = ['A4', 'F4', 'D4', 'E4'];

/** Pattern a ottavi su una battuta ('x' = colpo, 'o' = colpo leggero): chiama hit(t, forte). */
const steps = (pat, t0, hit) => [...pat].forEach((c, k) => c !== '.' && hit(t0 + (k * BAR) / pat.length, c === 'x'));

/** Piccolo scarto umano (±12 ms) e di dinamica, deterministico. */
const umano = (t, k) => {
  const x = Math.sin(t * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5;
};

/** Una battuta di musica al livello indicato (0 archi gravi, 1 arpa, 2 pizzicati e tremoli, 3 violini in tremolo). */
const bar = (mix, t, i, level) => {
  // archi tenuti: celli sulla fondamentale, viole sulle altre voci; legato con code che si sovrappongono
  const [a, b, c] = PROG[i];
  const archi = { attack: 0.35, release: 1.1, rev: 0.5 };
  suona(mix, 'celli', a, { t, dur: BAR, vel: 46 + level * 6, pan: -0.35, gain: 0.55, ...archi });
  suona(mix, 'viole', b, { t, dur: BAR, vel: 40 + level * 6, pan: 0.1, gain: 0.45, ...archi });
  suona(mix, 'viole', c, { t, dur: BAR, vel: 40 + level * 6, pan: 0.3, gain: 0.4, seed: 2, ...archi });
  suona(mix, 'contrabbasso', ROOTS[i], { t, dur: BAR, vel: 44 + level * 6, pan: -0.1, gain: 0.5, ...archi });
  if (level >= 1) {
    let j = 0;
    steps('x.x.x.x.', t, (tt) => {
      const u = umano(tt, j);
      suona(mix, 'arpa', ARP[i][j++ % 4], { t: tt + u * 0.024, dur: 1.4, vel: 58 + u * 16, pan: 0.35, rev: 0.45, gain: 0.5, release: 1.2 });
    });
    suona(mix, 'violini', TOP[i], { t, dur: BAR, vel: 30 + level * 4, pan: -0.2, gain: 0.28, attack: 0.8, release: 1.4, rev: 0.6 });
  }
  if (level >= 2) {
    steps('x..x..x.', t, (tt, f) => suona(mix, 'contrabbasso_pizz', ROOTS[i], { t: tt, dur: BEAT * 1.2, vel: f ? 90 : 70, pan: -0.05, rev: 0.25, gain: 0.7, release: 0.3 }));
    steps('x.......', t, (tt) => colpo(mix, 'grancassa', 'bdrum_mp', { t: tt, vel: 90, rev: 0.4, gain: 0.8 }));
    // inquietudine: tremolo dei celli sulla quinta, a metà battuta
    suona(mix, 'celli_trem', c, { t: t + BAR / 2, dur: BAR / 2, vel: 50, pan: -0.45, gain: 0.3, attack: 0.5, release: 0.6, rev: 0.5 });
  }
  if (level >= 3) {
    // violini in tremolo che ripetono l'arpeggio a mezze battute, un'ottava sopra
    ARP[(i + 2) % 4].slice(0, 2).forEach((n, k) =>
      suona(mix, 'violini_trem', n, { t: t + (k * BAR) / 2, dur: BAR / 2, vel: 54, pan: 0.45, gain: 0.3, attack: 0.15, release: 0.5, rev: 0.55 }));
    let j = 0;
    steps('.x.x.x.x', t, (tt) => suona(mix, 'arpa', ARP[(i + 2) % 4][j++ % 4], { t: tt, dur: 1.2, vel: 50, pan: -0.4, rev: 0.5, gain: 0.4, release: 1 }));
  }
};

/** Campana: pianoforte acuto raddoppiato dal glockenspiel lontano. */
const campana = (mix, n, t, vel, pan = -0.2) => {
  suona(mix, 'pianoforte', n, { t, dur: 3, vel, pan, rev: 0.6, gain: 0.55, release: 1.5 });
  suona(mix, 'glockenspiel', n, { t: t + 0.01, dur: 2.5, vel: vel * 0.6, pan: pan + 0.3, rev: 0.7, gain: 0.18, release: 1.5 });
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
  // pedale grave di Re sotto tutto il film (contrabbasso, ripreso con l'arco ogni quattro battute)
  for (let t = 0; t < T.END - 4; t += 4 * BAR) {
    suona(mix, 'contrabbasso', 'D2', { t, dur: Math.min(4 * BAR, T.END - 3 - t), vel: 40, pan: 0.15, gain: 0.35, attack: 0.6, release: 1.5, rev: 0.4, seed: 9 });
  }
  // finale: accordo pieno degli archi, gong lieve e arpeggio di campane che sale
  const fine = T.END - 4;
  [['contrabbasso', 'D2'], ['celli', 'D3'], ['viole', 'F3'], ['viole', 'A3'], ['violini', 'D4'], ['violini', 'A4']].forEach(([id, n], k) =>
    suona(mix, id, n, { t: fine, dur: 2.6, vel: 60, pan: (k - 2.5) * 0.2, gain: 0.45, attack: 0.3, release: 1.4, rev: 0.6, seed: 20 + k }));
  colpo(mix, 'gong', 'gong_hit_p', { t: fine, vel: 80, rev: 0.5, gain: 0.5, dur: 3.2, release: 0.8 });
  ['D5', 'F5', 'A5', 'D6'].forEach((n, k) => campana(mix, n, fine + 0.5 + k * 0.3, 56 + k * 8));

  const at = (id, s) => T[id] + s;

  /** Tuono dopo il lampo delle scene a t: lo schiocco della presa cade ~0,25 s dopo il lampo. */
  const TUONI = {
    classico: ['tuono_classico', 0.98, 6], forte: ['tuono_forte', 0.55, 5], forte2: ['tuono_forte', 7.45, 4.8], forte4: ['tuono_forte', 23.2, 2.4],
    secco: ['tuono_secco', 0.78, 5.5], breve: ['tuono_breve', 1.47, 2.6], lontano: ['tuono_lontano', 1.77, 6],
  };
  const tuono = (t, presa, gain, lp = 0) => {
    const [id, da, durata] = TUONI[presa];
    clip(mix, id, { t: t + 0.15, da, durata, gain, lp, fadeIn: 0.03, fadeOut: 1.2, rev: 0.35, pan: 0.1 });
  };
  /** Pioggia con vento: tappeto stereo; lp attutisce (dietro una finestra, dentro la grotta). */
  const pioggia = (t0, t1, da, gain, lp = 0) =>
    clip(mix, 'pioggia_vento', { t: t0, da, durata: t1 - t0, gain, lp, fadeIn: 0.8, fadeOut: 0.8, largo: 2.5, rev: 0.1 });

  // ---- copertina: tempesta, lampo a 1,6 s, lucchetto aperto che dondola
  campana(mix, 'D5', 0.2, 60);
  pioggia(0, 4.8, 1, 0.22);
  clip(mix, 'vento_fischio', { t: 0, da: 20, durata: 4.6, gain: 0.2, fadeIn: 0.6, fadeOut: 0.8, largo: 3 });
  tuono(1.6, 'classico', 0.8);
  clip(mix, 'serratura', { t: 0.5, da: 2.42, durata: 0.15, gain: 0.15, pan: 0.15, rev: 0.25 });

  // ---- ospedale: il lucchetto scatta (0,6), cade (1,0–1,45), il cancello si apre; pioggia
  pioggia(at('ospedale', -0.2), at('ospedale', 9.2), 32, 0.14);
  clip(mix, 'serratura', { t: at('ospedale', 0.6), da: 2.42, durata: 0.15, gain: 0.6, pan: 0.15, rev: 0.25 });
  clip(mix, 'serratura', { t: at('ospedale', 0.69), da: 2.91, durata: 0.25, gain: 0.45, pan: 0.15, rev: 0.25 });
  clip(mix, 'metallo_cade', { t: at('ospedale', 1.45) - 0.06, da: 0.62, durata: 1.8, gain: 0.4, fadeOut: 0.6, rev: 0.3 });
  clip(mix, 'cancello', { t: at('ospedale', 1.5), da: 2.85, durata: 3.6, gain: 0.35, fadeOut: 1, rev: 0.3, pan: -0.1 });

  // ---- cella: lucchetto che vibra, lampo a 3,0 e 7,8 (più debole); pioggia alla finestra
  pioggia(at('cella', 0), at('cella', 11.2), 0.5, 0.14, 900);
  clip(mix, 'serratura', { t: at('cella', 0.35), da: 13.6, durata: 0.3, gain: 0.3, pan: 0.15, rev: 0.25 });
  tuono(at('cella', 3.0), 'forte', 0.9);
  tuono(at('cella', 7.8), 'secco', 0.6);

  // ---- biglietto: la piastrella si solleva e si appoggia
  clip(mix, 'colpi_legno', { t: at('biglietto', 0.75), da: 1.4, durata: 0.4, gain: 0.25, rev: 0.3 });
  clip(mix, 'colpi_legno', { t: at('biglietto', 1.85), da: 5.74, durata: 0.35, gain: 0.15, rev: 0.3, pan: 0.1 });

  // ---- studio: pillole che cadono, lampo a 4,6; pioggia alla finestra
  pioggia(at('studio', 0), at('studio', 8.2), 66, 0.12, 900);
  clip(mix, 'tintinnio', { t: at('studio', 1.95), da: 0.16, durata: 0.3, gain: 0.3, rev: 0.25 });
  clip(mix, 'tintinnio', { t: at('studio', 2.15), da: 4.13, durata: 0.35, gain: 0.22, pan: 0.2, rev: 0.25 });
  clip(mix, 'tintinnio', { t: at('studio', 2.35), da: 3.21, durata: 0.45, gain: 0.18, pan: -0.15, rev: 0.25 });
  tuono(at('studio', 4.6), 'lontano', 0.5, 2500);

  // ---- incendio: fuoco che crepita e fiammata
  clip(mix, 'fuoco', { t: at('incendio', 0), da: 1, durata: 10, gain: 0.3, fadeIn: 0.5, fadeOut: 0.8, largo: 3, rev: 0.15 });
  clip(mix, 'fiammata', { t: at('incendio', 7.6), da: 0.2, durata: 1.4, gain: 0.6, fadeOut: 0.6, rev: 0.3 });

  // ---- uragano: vento forte e pioggia, lampi a 3,0 e 7,2, il cappello vola via (5–8)
  clip(mix, 'vento_invernale', { t: at('uragano', -0.6), da: 3, durata: 11, gain: 0.3, fadeIn: 0.8, fadeOut: 1, largo: 4, rev: 0.1 });
  pioggia(at('uragano', -0.3), at('uragano', 10.3), 36, 0.15);
  tuono(at('uragano', 3.0), 'forte2', 1);
  tuono(at('uragano', 7.2), 'breve', 0.7);
  clip(mix, 'stoffa', { t: at('uragano', 5.0), da: 15, durata: 3, gain: 0.45, fadeIn: 0.3, fadeOut: 0.8, pan: 0.4, rev: 0.2 });

  // ---- grotta: tempesta attutita fuori dall'apertura, lampi a 2,4 e 7,0, fuoco
  pioggia(at('grotta', 0), at('grotta', 9.2), 66.5, 0.15, 1500);
  clip(mix, 'vento_raffiche', { t: at('grotta', 0), da: 15, durata: 9, gain: 0.2, lp: 600, fadeIn: 0.6, fadeOut: 0.8, largo: 3 });
  clip(mix, 'fuoco', { t: at('grotta', 0), da: 12, durata: 9, gain: 0.15, fadeIn: 0.5, fadeOut: 0.8, largo: 3, rev: 0.2 });
  tuono(at('grotta', 2.4), 'classico', 0.6, 1200);
  tuono(at('grotta', 7.0), 'secco', 0.45, 1000);

  // ---- lavagna: gesso lettera per lettera; gli anagrammi arrivano con un risucchio e una campana; pioggia alla finestra
  pioggia(at('lavagna', 0), at('lavagna', 14.2), 32.5, 0.1, 900);
  for (const row of LAVAGNA_ROWS) {
    [...row.s].forEach((c, i) => {
      if (c !== ' ') chalk(mix, at('lavagna', row.a + ((row.b - row.a) * i) / (row.s.length - 1)), row.anagram ? 44 : 36);
    });
    if (row.anagram) {
      swell(mix, at('lavagna', row.a), 1.2, { vel: 58 });
      campana(mix, 'A5', at('lavagna', row.b + 0.05), 78);
      campana(mix, 'D6', at('lavagna', row.b + 0.06), 64, 0.2);
      colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: at('lavagna', row.a), vel: 70, rev: 0.4, gain: 0.35, dur: 1.2, release: 0.3 });
    }
  }
  tuono(at('lavagna', 10.3), 'forte4', 0.9); // «Teddy non esiste»

  // ---- verità: il cappello cade (0,7–1,55), il timbro «Ultima prova» a 10,0
  clip(mix, 'telo', { t: at('verita', 0.7), da: 8.45, durata: 0.75, gain: 0.25, fadeOut: 0.2, rev: 0.2 });
  clip(mix, 'colpi_legno', { t: at('verita', 1.55), da: 0.96, durata: 0.3, gain: 0.22, rev: 0.3 });
  swell(mix, at('verita', 10.0), 0.6, { vel: 46 });
  clip(mix, 'martelletto', { t: at('verita', 10.0) - 0.01, da: 2.24, durata: 0.7, gain: 0.95, fadeOut: 0.3, rev: 0.35 });

  // ---- alba: brezza leggera dal mare
  clip(mix, 'vento_leggero', { t: at('alba', 0), da: 0.2, durata: T.END - at('alba', 0), gain: 0.04, fadeIn: 2, fadeOut: 3, largo: 4 });
};
