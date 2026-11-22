// Colonna sonora del video lungo «Donnie Darko spiegato» (YOUTUBE.md, VIDEO-LUNGO.md): tutto nuovo, nessun episodio riusato.
// Stessa famiglia sonora dello Short di Donnie Darko (scripts/audio/donnie-darko.mjs): pianoforte a coda sospeso, arpa,
// archi gravi e campanelle per le visioni (campionati, VSCO-2 CE e VCSL, CC0). 60 bpm: un battito al secondo, come il
// contatore dei 28 giorni in alto a destra, che ticchetta piano sotto la musica. Mi minore (Mi minore · Do maggiore
// settima · La minore · Si settima), motivo inventato (Si, Re, Mi, Si · Do, Si, Sol, Fa#), nessun brano o tema del film.
// Tre atti con tre colori: LA STORIA (arpeggi e motivo, il vortice e l'ultima notte a passo doppio), LE REGOLE DEL TEMPO
// (arpa e campanelle come pagine di un libro, il crollo con il piatto strisciato e il timpano, il domino a crome di
// pizzicato), IL FINALE SPIEGATO (gli archi tenuti, il Mi maggiore che si apre sul «mondo vero è salvo» e resta fino alla
// chiusura). Dopo ogni colpo forte (motore, auto, sparo, motore strappato) la musica tace almeno un battito.
// T: inizio di ogni tratto (s nel video lungo) e T.frase(id, n) = inizio della frase n del tratto (come Overlay16); gli
// eventi cadono sulla croma (0,5 s), gli stessi istanti delle scene in src/lunghi/donnie-darko-spiegato/Paese.tsx.
import { rng } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';

export const strumenti = ['pianoforte_coda', 'arpa', 'glockenspiel', 'violini', 'viole', 'celli', 'contrabbasso', 'violini_trem', 'celli_spicc', 'viole_spicc', 'contrabbasso_pizz', 'timpani', 'grancassa', 'piatto_sospeso'];
export const effetti = ['tuono_secco', 'scatti', 'metallo_schianto', 'rombo', 'pagine', 'onde', 'fuoco', 'fiammata', 'auto_epoca', 'colpi_cavi', 'pistola', 'vento_raffiche', 'aereo', 'metallo_colpi', 'passaggio'];
/** Sala grande e scura, notte di periferia (come lo Short). */
export const sala = { rt60: 2.8, brillo: 4800, predelay: 0.03, wet: 0.5 };

const BPM = 60;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const CROMA = BEAT / 2;
const snap = (t) => Math.round(t / BEAT) * BEAT;
const croma = (t) => Math.round(t / CROMA) * CROMA;

const drone = (mix, m, { t, dur, vel = 40, gain = 1, seed = 1 }) =>
  suona(mix, m < 40 ? 'contrabbasso' : 'celli', m, { t, dur, vel: vel + 14, gain: gain * 1.5, attack: 1.6, release: 2, rev: 0.6, seed });
const strings = (mix, m, { t, dur, vel = 40, pan = 0, gain = 1, att = 1, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev: 0.6, gain: gain * 1.4, attack: att, release: 1.4, seed });
const spic = (mix, m, { t, vel = 40, pan = 0, gain = 1 }) =>
  suona(mix, m < 55 ? 'celli_spicc' : 'viole_spicc', m, { t, dur: CROMA * 0.8, vel: vel * 1.7, pan, rev: 0.35, gain: gain * 2.6 * (m === 71 ? 0.35 : 1), release: 0.12 });
const piano = (mix, m, { t, dur, vel, pan = 0.1 }) =>
  suona(mix, 'pianoforte_coda', m, { t, dur: Math.min(dur, 4), vel: vel * 1.2, pan, rev: 0.6, gain: 1.4, release: 0.8 });
const harp = (mix, m, { t, vel = 40, pan = -0.2 }) =>
  suona(mix, 'arpa', m, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.6, gain: 0.9, release: 1.2 });
const bell = (mix, m, { t, vel = 44, pan = 0.25, gain = 1 }) =>
  suona(mix, 'glockenspiel', m < 79 ? m + 12 * Math.ceil((79 - m) / 12) : m, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.75, gain: gain * 0.28, release: 1.5 });
const pizz = (mix, m, { t, vel = 40, pan = -0.1 }) =>
  suona(mix, 'contrabbasso_pizz', m, { t, dur: BEAT, vel: vel * 1.5, pan, rev: 0.3, gain: 1.5, release: 0.25 });
/** Timpano: v2 per i colpi leggeri, v4 (il forte di VCSL) per i colpi chiave (ERRORI.md). */
const timp = (mix, t, { vel = 100, gain = 0.8, pan = 0, forte = false } = {}) =>
  colpo(mix, 'timpani', forte ? 'Timpani1_Hit_v4_rr1_Sum' : 'Timpani1_Hit_v2_rr1_Sum', { t, vel, gain, pan, rev: 0.45 });
const swell = (mix, t, dur, { gain = 0.5 } = {}) => colpo(mix, 'piatto_sospeso', 'susp_FX_scrape_continuous', { t, dur, vel: 90, gain, release: 0.4, rev: 0.5, da: 2 });

const CHORDS = [[40, [0, 7, 12, 15, 19]], [36, [0, 7, 11, 16, 19]], [45, [0, 7, 12, 15, 19]], [47, [0, 4, 10, 15, 18]]];
const MAJ = [[40, [0, 7, 12, 16, 19]], [45, [0, 7, 12, 16, 19]], [44, [0, 7, 12, 15, 19]], [47, [0, 7, 10, 16, 19]]];
const MOTIF = [[0, 71], [1, 74], [2, 76], [3, 71], [4, 72], [5, 71], [6, 67], [7, 66]];
const MOTIF_M = [[0, 71], [1, 75], [2, 76], [3, 71], [4, 73], [5, 71], [6, 68], [7, 64]];
// LE REGOLE DEL TEMPO in La minore (La minore · Fa · Do · Mi settima), pedale di La: l'atto si sente diverso (revisore musica)
const CHORDS_LA = [[45, [0, 7, 12, 15, 19]], [41, [0, 7, 12, 16, 19]], [36, [0, 7, 12, 16, 19]], [40, [0, 4, 10, 16, 20]]];
const MOTIF_LA = [[0, 76], [1, 79], [2, 81], [3, 76], [4, 77], [5, 76], [6, 72], [7, 71]];

export default (mix, T) => {
  const at = (id, n, d = 0) => croma(T.frase(id, n) + d);
  let sid = 0;

  /** Una sezione da `from` a `to` (vedi lo spartito dello Short): drone · str · arp · harp · spic (doppio) · mel · bells · pizz · pausa. */
  const sec = (from, to, o) => {
    from = snap(from); to = snap(to);
    const R = rng(9000 + sid++ * 131);
    const ch = o.maj ? MAJ : o.la ? CHORDS_LA : CHORDS;
    const mot = o.maj ? MOTIF_M : o.la ? MOTIF_LA : MOTIF;
    const pause = o.pause ?? [];
    const tacet = (x) => pause.some(([a, b]) => x >= a && x < b);
    if (o.drone) {
      // il pedale tace anche lui nelle pause (il battito di silenzio prima e dopo i colpi)
      const tratti = [];
      let a = from;
      for (const [p0, p1] of [...pause].sort((x, y) => x[0] - y[0])) { if (p0 > a) tratti.push([a, Math.min(p0, to)]); a = Math.max(a, p1); }
      if (a < to) tratti.push([a, to]);
      const ped = o.la ? 33 : 28;
      tratti.filter(([x, y]) => y - x > 0.6).forEach(([x, y], i) => {
        const coda = y >= to ? 0.4 : 0.05;
        drone(mix, ped, { t: x, dur: y - x + coda, vel: o.drone, gain: 0.7, seed: sid + i });
        drone(mix, ped + 12, { t: x, dur: y - x + coda, vel: o.drone * 0.8, gain: 0.5, seed: sid + 50 + i });
      });
    }
    // battute su una griglia assoluta (sfasamento 0): l'armonia non riparte a ogni capitolo
    for (let t = Math.floor(from / BAR) * BAR; t < to - 0.3; t += BAR) {
      const k = Math.round(t / BAR);
      const kk = k % 4;
      const [root, iv] = ch[kk];
      const t0 = Math.max(t, from);
      const d = Math.min(t + BAR * 1.02, to) - t0;
      if (o.str && !tacet(t0) && d > 0.5) [iv[1], iv[2], iv[3]].forEach((v, j) => strings(mix, root + 12 + v, { t: t0 + j * 0.04, dur: d, vel: o.str, gain: 0.9, pan: (j - 1) * 0.35, seed: j + k }));
      if (o.arp) for (let i = 0; i < 8 && t + i * CROMA < to - 0.05; i++) {
        const tt = t + i * CROMA;
        if (tt < from || tacet(tt)) continue;
        piano(mix, root + 12 + iv[[0, 1, 2, 3, 4, 3, 2, 1][i]], { t: tt, dur: CROMA * 1.6, vel: o.arp * (i % 4 === 0 ? 1 : 0.78), pan: -0.15 });
      }
      if (o.harp) for (let i = 0; i < 4 && t + i * BEAT < to - 0.05; i++) if (t + i * BEAT >= from && !tacet(t + i * BEAT)) harp(mix, root + 24 + iv[i % 5], { t: t + i * BEAT, vel: o.harp });
      if (o.pizz) for (let i = 0; i < 8 && t + i * CROMA < to - 0.05; i++) if (t + i * CROMA >= from && !tacet(t + i * CROMA)) pizz(mix, root + [0, 12, 7, 12][i % 4], { t: t + i * CROMA, vel: o.pizz * (i % 2 ? 0.7 : 1) });
      if (o.spic) {
        const step = o.doppio ? CROMA / 2 : CROMA;
        const notes = [root, root + iv[1], root + 12, root + iv[1]];
        for (let i = 0; t + i * step < Math.min(t + BAR, to) - 0.05; i++) {
          if (t + i * step < from || tacet(t + i * step)) continue;
          spic(mix, notes[i % 4] + 12, { t: t + i * step, vel: o.spic * (i % (o.doppio ? 4 : 2) === 0 ? 1 : 0.72), pan: i % 2 ? 0.25 : -0.25 });
        }
      }
      if (o.mel && k % 2 === 0) for (const [b, mm] of mot) {
        const tt = t + b * BEAT;
        if (tt < from || tt >= to - 0.2 || tacet(tt) || R() > (o.keep ?? 1)) continue;
        piano(mix, mm + (o.oct ?? 0), { t: tt, dur: BEAT * 1.4, vel: o.mel, pan: 0.15 });
        if (o.bells) bell(mix, mm + 12, { t: tt + 0.01, vel: o.bells, pan: 0.3 });
      }
    }
  };

  // ---- istanti degli eventi (uguali a Paese.tsx)
  const AG_HIT = 1.5;
  const CRASH = at('motore', 2, 0.6);
  const LETTO_HIT = at('letto', 2, 0.8);
  const RIDE_HIT = croma(T.salvi - 0.5);
  const fari = at('notte', 4, 0.8);
  const urto = at('sparo', 0, 0.4);
  const sparo = at('sparo', 4, 0.2);
  const tear = at('vortice', 2, 1.5);
  const rew = at('letto', 0, 0.3);
  const fuoco = at('gretchen', 2, 1.6);
  const SALVO = at('salvi', 2, 1.4);
  const B2 = 2 * BEAT;
  const maschera = at('gretchen', 1, 0.2);
  const volante = at('sparo', 1, 0.3);
  const agTear = at('aggancio', 2, 0.9);
  const buco = at('crollo', 0, 0.8);
  const BUCO_HIT = croma(buco + 3);
  const mamma = at('ritorno', 1, 0.6); // «È il motore della mamma»: il colpo di scena del finale

  // ---------------------------------------------------------------- aggancio
  sec(T.aggancio, T.coniglio, { drone: 34, harp: 34, mel: 40, bells: 30, pause: [[AG_HIT - 0.05, AG_HIT + B2], [agTear - 0.5, agTear + BEAT]] });
  // ---------------------------------------------------------------- LA STORIA
  sec(T.coniglio, T.motore, { drone: 32, arp: 28, mel: 38, keep: 0.85 });
  sec(T.motore, T.testa, { drone: 38, arp: 30, str: 30, pause: [[CRASH - 0.05, CRASH + B2]] });
  sec(T.testa, T.libro, { drone: 38, str: 26, harp: 32, mel: 34, keep: 0.8 });
  sec(T.libro, T.ordini, { drone: 34, harp: 36, mel: 40, bells: 30 });
  sec(T.ordini, T.gretchen, { drone: 40, spic: 32, str: 32, arp: 24 });
  sec(T.gretchen, T.notte, { drone: 42, arp: 30, str: 36, mel: 38, pause: [[maschera - 1, maschera - 0.05]] });
  sec(T.notte, T.sparo, { drone: 44, spic: 40, str: 38, doppio: false, pause: [[fari + 1, fari + 3]] });
  sec(T.sparo, T.vortice, { drone: 40, str: 36, harp: 34, bells: 34, pause: [[urto - 0.05, volante + 0.45], [sparo - 1, sparo + B2]] });
  sec(T.vortice, T.letto, { drone: 48, spic: 52, doppio: true, str: 50, arp: 30, pause: [[tear - 1, tear - 0.05], [tear, tear + 2]] });
  sec(T.letto, T.copia, { drone: 34, harp: 30, mel: 34, keep: 0.9, pause: [[LETTO_HIT - 0.05, LETTO_HIT + B2]] });
  // ---------------------------------------------------------------- LE REGOLE DEL TEMPO
  sec(T.copia, T.artefatto, { la: true, drone: 30, harp: 38, bells: 34, mel: 36 });
  sec(T.artefatto, T.crollo, { la: true, drone: 32, harp: 34, arp: 24 });
  sec(T.crollo, T.ricevitore, { la: true, drone: 46, str: 44, spic: 40, pause: [[BUCO_HIT - 1, BUCO_HIT - 0.05], [BUCO_HIT, BUCO_HIT + 2]] });
  sec(T.ricevitore, T.viventi, { la: true, drone: 36, harp: 38, mel: 38, bells: 40 });
  sec(T.viventi, T.morti, { la: true, drone: 36, pizz: 32, harp: 34 });
  sec(T.morti, T.trappola, { la: true, drone: 38, str: 34, harp: 34, bells: 34 });
  sec(T.trappola, T.porta, { la: true, drone: 44, str: 40, spic: 36 });
  // ---------------------------------------------------------------- IL FINALE SPIEGATO
  sec(T.porta, T.ritorno, { drone: 42, str: 44, arp: 30, mel: 36 });
  sec(T.ritorno, T.ride, { drone: 38, harp: 36, bells: 36, mel: 38, pause: [[mamma - 1, mamma + BEAT]] });
  sec(T.ride, T.salvi, { drone: 36, str: 26, harp: 30, mel: 32, keep: 0.8, pause: [[RIDE_HIT - 0.05, RIDE_HIT + BEAT]] });
  sec(T.salvi, SALVO, { drone: 34, str: 36, harp: 32, pause: [[SALVO - 1, SALVO]] });
  // il mondo vero è salvo: Mi maggiore aperto sul cartellino, fino alla fine
  sec(SALVO, T.aperto, { drone: 34, str: 40, harp: 36, mel: 38, bells: 32, maj: true });
  sec(T.aperto, T.ventotto, { drone: 30, str: 30, arp: 26, maj: true });
  sec(T.ventotto, T.seguito, { drone: 36, pizz: 32, spic: 26, maj: true });
  sec(T.seguito, T.gesto, { drone: 32, harp: 34, mel: 36, bells: 30, maj: true });
  sec(T.gesto, T.chiusura, { drone: 30, str: 34, arp: 26, mel: 34, bells: 32, maj: true });
  sec(T.chiusura, T.END, { drone: 34, str: 40, harp: 36, mel: 40, maj: true });

  // ---------------------------------------------------------------- effetti
  // il contatore: un ticchettio sommesso per battito, da quando compare a quando arriva a zero (vortice)
  for (let t = snap(at('coniglio', 4, 0.6)); t < tear - 1; t += t >= T.vortice ? (t >= tear - 2 ? CROMA / 2 : CROMA) : BEAT) {
    if ([CRASH, urto, sparo].some((h) => t > h - 1.1 && t < h + 2)) continue;
    clip(mix, 'scatti', { t, da: 6.49, durata: 0.06, gain: 0.26, rev: 0.15, pan: 0.4 });
  }
  // il motore che cade e sfonda il tetto (aggancio, capitolo 2, prima notte rifatta, la risata)
  for (const [h, d] of [[AG_HIT, 1.0], [CRASH, 0.9], [LETTO_HIT, 0.9], [RIDE_HIT, 0.9]]) {
    clip(mix, 'passaggio', { t: Math.max(0, h - d), da: 0.56, durata: d, gain: 0.3, fadeOut: 0.1, rev: 0.3 });
    clip(mix, 'metallo_schianto', { t: h, da: 0, durata: 1.4, gain: 0.55, fadeOut: 0.5, rev: 0.4 });
    timp(mix, h, { vel: 120, gain: 0.7, forte: true });
    clip(mix, 'rombo', { t: h + 0.2, da: 3.6, durata: 2.5, gain: 0.12, fadeOut: 1.2, largo: 1.5 });
  }
  clip(mix, 'vento_raffiche', { t: 0, da: 10, durata: 5, gain: 0.05, fadeIn: 0.2, fadeOut: 1.5, largo: 1.5 });
  // l'anticipazione nell'aggancio: il vortice, l'aereo, lo strappo
  clip(mix, 'vento_raffiche', { t: at('aggancio', 2, -0.8), da: 12, durata: 6, gain: 0.16, fadeIn: 0.8, fadeOut: 1.5, largo: 1.6 });
  clip(mix, 'aereo', { t: at('aggancio', 2, -0.8), da: 3, durata: 3.4, gain: 0.16, fadeIn: 0.5, fadeOut: 0.6, largo: 1.4 });
  clip(mix, 'metallo_colpi', { t: agTear, da: 0.54, durata: 0.4, gain: 0.8, rev: 0.4 });
  timp(mix, agTear, { vel: 110, gain: 0.7, forte: true });
  // i voli della camera da un luogo all'altro: un soffio di vento all'inizio di ogni capitolo (YOUTUBE.md §4)
  const volo = (t, mv, g = 0.12) => clip(mix, 'vento_raffiche', { t, da: 10 + (t % 30), durata: mv, gain: g, fadeIn: mv * 0.5, fadeOut: mv * 0.5, lp: 2500, largo: 1.6 });
  for (const id of ['coniglio', 'motore', 'testa', 'libro', 'ordini', 'gretchen', 'notte', 'vortice', 'letto', 'copia', 'artefatto', 'crollo', 'ricevitore', 'viventi', 'morti', 'trappola', 'porta', 'ritorno', 'ride', 'salvi', 'aperto', 'ventotto', 'seguito', 'gesto', 'chiusura']) volo(T[id] - 0.2, 2.4, ['copia', 'porta', 'chiusura'].includes(id) ? 0.16 : 0.11);
  for (const t of [at('libro', 2), at('gretchen', 2), at('gretchen', 3), at('viventi', 3), at('ritorno', 3)]) volo(t, 2.2, 0.1);
  // le tre promesse dell'aggancio e il gesto con il punto di domanda
  [0, 1, 2].forEach((i) => bell(mix, [76, 79, 83][i], { t: at('aggancio', 3, 0.2) + i, vel: 36 }));
  bell(mix, 71, { t: at('aggancio', 4, 0.2), vel: 34 });
  // capitolo 1: la voce (campanelle), Frank, i 28 giorni (timpano sordo)
  [83, 79, 76].forEach((m, k) => bell(mix, m, { t: at('coniglio', 2) + k * CROMA, vel: 36 }));
  timp(mix, at('coniglio', 3, 0.2), { vel: 85, gain: 0.45 }); // Frank compare
  timp(mix, at('coniglio', 4, 0.6), { vel: 90, gain: 0.55 });
  // capitolo 2: vigili del fuoco (nessuna sirena: solo il rombo), il punto di domanda
  bell(mix, 77, { t: at('motore', 4, 0.1), vel: 40 });
  // capitolo 4: il libro passa di mano
  clip(mix, 'pagine', { t: at('libro', 1, 0.4), da: 1, durata: 1.2, gain: 0.3, fadeOut: 0.3, rev: 0.25 });
  // capitolo 5: l'acqua nella scuola
  clip(mix, 'onde', { t: at('ordini', 1, 0.4), da: 4, durata: 3.5, gain: 0.14, fadeIn: 0.3, fadeOut: 1.2, largo: 1.4 });
  // capitolo 6: lo schermo, la casa che brucia, l'arresto
  bell(mix, 71, { t: maschera, vel: 34 });
  timp(mix, maschera + 0.5, { vel: 100, gain: 0.6 }); // la maschera tolta
  [64, 67, 71].forEach((m, k) => bell(mix, m + 12, { t: at('gretchen', 4, 1.4) + k * CROMA, vel: 32 })); // la mamma parte
  clip(mix, 'fiammata', { t: fuoco, da: 0.22, durata: 1.2, gain: 0.3, fadeOut: 0.4, rev: 0.3 });
  clip(mix, 'fuoco', { t: fuoco + 0.2, da: 2, durata: T.notte - fuoco, gain: 0.1, fadeIn: 0.5, fadeOut: 1.5, largo: 1.4 });
  timp(mix, at('gretchen', 4, 0.1), { vel: 95, gain: 0.55 });
  // capitolo 7: l'aereo della mamma passa lontano; l'auto che arriva
  clip(mix, 'aereo', { t: T.notte + 0.5, da: 3, durata: 5, gain: 0.08, fadeIn: 1, fadeOut: 1.5, largo: 1.6 });
  clip(mix, 'auto_epoca', { t: fari - 0.4, da: 17.5, durata: 1.7, gain: 0.15, fadeIn: 0.4, fadeOut: 0.3, rev: 0.25 });
  // capitolo 8: l'urto (poi silenzio), lo sparo (poi silenzio)
  clip(mix, 'colpi_cavi', { t: urto, da: 0.5, durata: 0.5, gain: 0.9, fadeOut: 0.2, rev: 0.3 });
  timp(mix, volante + 0.5, { vel: 105, gain: 0.65 }); // al volante c'è Frank
  timp(mix, urto, { vel: 115, gain: 0.8, forte: true });
  clip(mix, 'pistola', { t: sparo, da: 0.05, durata: 1.4, gain: 0.6, fadeOut: 0.6, rev: 0.4 });
  timp(mix, sparo, { vel: 125, gain: 0.9, forte: true });
  // capitolo 9: il vortice (vento e rombo), l'aereo, il motore strappato via (il colpo più forte), il motore che torna indietro
  clip(mix, 'vento_raffiche', { t: T.vortice, da: 10, durata: T.letto + 1 - T.vortice, gain: 0.2, fadeIn: 1.2, fadeOut: 1.2, largo: 1.6 });
  clip(mix, 'rombo', { t: at('vortice', 0, 0.3), da: 3.6, durata: 4, gain: 0.1, fadeIn: 1, fadeOut: 1.5, largo: 1.6 });
  clip(mix, 'aereo', { t: at('vortice', 2, -1), da: 3, durata: 4.4, gain: 0.18, fadeIn: 0.6, fadeOut: 0.8, largo: 1.4 });
  clip(mix, 'metallo_colpi', { t: tear, da: 0.54, durata: 0.4, gain: 1.2, rev: 0.4 });
  timp(mix, tear, { vel: 127, gain: 1.2, forte: true });
  clip(mix, 'passaggio', { t: tear + 0.5, da: 0.56, durata: 1.6, gain: 0.25, fadeOut: 0.5, rev: 0.4 });
  [79, 76, 71, 67, 64].forEach((m, k) => bell(mix, m, { t: at('vortice', 3, 0.3) + k * CROMA / 2, vel: 36 }));
  // i fulmini dentro il vortice (Paese.tsx, Vortice): un tuono secco e basso; quello vicino allo strappo più piano
  for (const [b, gn] of [[at('vortice', 0, 1.5), 0.13], [at('vortice', 2, 0.5), 0.08], [at('porta', 1), 0.13], [at('porta', 3, 0.5), 0.13]]) clip(mix, 'tuono_secco', { t: b + 0.15, da: 0.78, durata: 2.2, gain: gn, fadeIn: 0.03, fadeOut: 0.9, rev: 0.35, lp: 3000 });
  // il motore che scende piano sopra la camera in «ride»
  clip(mix, 'passaggio', { t: RIDE_HIT - 2.2, da: 13.1, durata: 1.4, gain: 0.12, fadeIn: 0.5, fadeOut: 0.3, rev: 0.35 });
  // capitolo 10: tutto si riavvolge (piatto e sibilo)
  swell(mix, rew - 0.2, 1.6, { gain: 0.4 });
  clip(mix, 'passaggio', { t: rew + 0.2, da: 13.1, durata: 1.4, gain: 0.2, fadeOut: 0.4, rev: 0.35 });
  bell(mix, 68, { t: at('letto', 4, 0.2), vel: 32 });
  // LE REGOLE: le pagine del libro, la copia che sale (arpa), il crollo, i poteri, il domino, il tratteggio, le sbarre
  clip(mix, 'pagine', { t: T.copia + 0.3, da: 1, durata: 1.4, gain: 0.3, fadeOut: 0.3, rev: 0.3 });
  [52, 55, 59, 64, 67, 71, 76].forEach((m, k) => harp(mix, m + 12, { t: at('copia', 1, 0.2) + k * CROMA / 2, vel: 36 }));
  bell(mix, 83, { t: at('artefatto', 1, 0.6), vel: 40 });
  swell(mix, buco, BUCO_HIT - 1 - buco, { gain: 0.45 });
  timp(mix, BUCO_HIT, { vel: 124, gain: 1.0, forte: true });
  clip(mix, 'rombo', { t: BUCO_HIT, da: 3.6, durata: 3, gain: 0.14, fadeOut: 1.4, largo: 1.5 });
  [0, 1, 2, 3, 4].forEach((i) => bell(mix, [64, 67, 71, 74, 62][i], { t: [at('ricevitore', 2, 0.3), at('ricevitore', 2, 1.0), at('ricevitore', 2, 1.8), at('ricevitore', 2, 2.4), at('ricevitore', 4)][i], vel: i === 4 ? 30 : 38 }));
  for (let i = 0; i < 18; i++) clip(mix, 'scatti', { t: at('viventi', 2, -0.3) + i * (CROMA / 3) + 0.25, da: 6.49, durata: 0.06, gain: 0.45, rev: 0.2, pan: -0.6 + i * 0.07 });
  [71, 76, 79].forEach((m, k) => bell(mix, m, { t: at('viventi', 3, 0.6) + k * CROMA, vel: 34 })); // la catena fino alla mamma
  [64, 67, 71, 74, 76, 79].forEach((m, k) => bell(mix, m, { t: at('morti', 2, 1.0) + k * CROMA / 2, vel: 34 }));
  [0, 1, 2].forEach((i) => clip(mix, 'metallo_colpi', { t: at('trappola', 1, 0.3) + i * CROMA, da: 0.54, durata: 0.3, gain: 0.5, rev: 0.4, pan: -0.3 + i * 0.3 }));
  // IL FINALE: la porta (il motore che attraversa), il cerchio che si chiude, le morti che si annullano, il saluto
  clip(mix, 'passaggio', { t: at('porta', 3), da: 0.56, durata: 2, gain: 0.25, fadeOut: 0.6, rev: 0.4 });
  [76, 71, 67, 64].forEach((m, k) => bell(mix, m, { t: at('ritorno', 3, 0.2) + k * CROMA, vel: 34 }));
  // il colpo di scena del finale: sale, un battito di silenzio, colpo (YOUTUBE.md §4)
  swell(mix, mamma - 3, 2, { gain: 0.35 });
  timp(mix, mamma, { vel: 118, gain: 0.9, forte: true });
  bell(mix, 83, { t: mamma, vel: 40 });
  clip(mix, 'passaggio', { t: mamma + 1, da: 0.56, durata: 1.4, gain: 0.2, fadeOut: 0.4, rev: 0.35 });
  [64, 68, 71, 76, 80].forEach((m, k) => harp(mix, m + 12, { t: at('salvi', 2, 0.2) + k * CROMA / 2, vel: 36 }));
  swell(mix, SALVO - 3, 2, { gain: 0.35 });
  timp(mix, SALVO, { vel: 115, gain: 0.85, forte: true });
  [76, 80, 83].forEach((m, k) => bell(mix, m, { t: at('gesto', 3) + k * CROMA, vel: 36 }));
  // le curiosità: i tre «28», il libro nuovo, «fine 2026?»
  [at('ventotto', 1, 0.3), at('ventotto', 2, 0.3), at('ventotto', 3, 0.1)].forEach((t) => pizz(mix, 40, { t, vel: 50 }));
  clip(mix, 'pagine', { t: T.seguito + 0.3, da: 1, durata: 1.2, gain: 0.25, fadeOut: 0.3, rev: 0.3 });
  bell(mix, 80, { t: at('seguito', 3, 0.2), vel: 34 });
  // i cartellini delle teorie
  bell(mix, 76, { t: at('aperto', 0, 0.6), vel: 32 });
  bell(mix, 79, { t: at('aperto', 1, 0.4), vel: 32 });
  [76, 80, 83, 88].forEach((m, k) => bell(mix, m, { t: T.END - 6 + k * CROMA, vel: 34 }));
};
