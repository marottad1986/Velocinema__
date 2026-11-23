// Colonna sonora del video lungo «Backrooms spiegato» (YOUTUBE.md, VIDEO-LUNGO.md): tutta nuova, strumenti campionati
// (VSCO-2 CE e VCSL, CC0). 75 bpm (battito 0,8 s, croma 0,4 s), Fa diesis minore (Fa#m · Re · Si minore · Do# settima),
// motivo inventato (Do#, Re, Do#, La · Si, La, Fa#, Mi#), nessun brano o tema del film.
// Passo avanti udibile (ASTICELLA.md): il colore del «centro commerciale vuoto», cioè un organo leggero e una marimba
// lontana, come una musica d'attesa che suona in stanze dove non c'è nessuno, sopra il ronzio vero dei neon (effetto
// registrato `ronzio_neon`), che resta come tappeto sotto tutto il Livello 0.
// Tre atti: COSA SONO LE BACKROOMS (organo, marimba, pianoforte rado come passi), LA STORIA DEL FILM (archi, pizzicati a
// crome, la fuga dal pirata a passo doppio, silenzio prima del colpo del cemento), IL FINALE SPIEGATO (arpa e campanelle
// sulle copie; il dettaglio che si apre in La maggiore sul colpo del cemento e resta fino alla chiusura, sospesa).
// T: inizio di ogni tratto e T.frase(id, n) = inizio della frase n (come Overlay16); gli eventi cadono sulla croma, gli
// stessi istanti delle scene in src/lunghi/backrooms-spiegato/ (Mondo.tsx, Pov.tsx).
import { rng } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';

export const strumenti = ['pianoforte_coda', 'arpa', 'glockenspiel', 'marimba', 'organo', 'violini', 'viole', 'celli', 'contrabbasso', 'violini_trem', 'celli_spicc', 'viole_spicc', 'contrabbasso_pizz', 'timpani', 'grancassa', 'piatto_sospeso'];
export const effetti = ['ronzio_neon', 'scatti', 'passaggio', 'disturbo', 'macchina_scrivere', 'pagine', 'campanello_negozio', 'colpi_legno', 'legno_cade', 'sibilo', 'ronzio_tesla', 'rombo'];
/** Sala media e spoglia: un ufficio vuoto con il soffitto basso. */
export const sala = { rt60: 2.2, brillo: 5200, predelay: 0.02, wet: 0.45 };

const BPM = 75;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const CROMA = BEAT / 2;
const snap = (t) => Math.round(t / BEAT) * BEAT;
const croma = (t) => Math.round(t / CROMA) * CROMA;

const drone = (mix, m, { t, dur, vel = 40, gain = 1, seed = 1 }) =>
  suona(mix, m < 40 ? 'contrabbasso' : 'celli', m, { t, dur, vel: vel + 14, gain: gain * 1.5, attack: 1.6, release: 2, rev: 0.6, seed });
const strings = (mix, m, { t, dur, vel = 40, pan = 0, gain = 1, att = 1, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev: 0.55, gain: gain * 1.4, attack: att, release: 1.4, seed });
const spic = (mix, m, { t, vel = 40, pan = 0, gain = 1 }) =>
  suona(mix, m < 55 ? 'celli_spicc' : 'viole_spicc', m, { t, dur: CROMA * 0.8, vel: vel * 1.7, pan, rev: 0.35, gain: gain * 2.6, release: 0.12 });
const piano = (mix, m, { t, dur, vel, pan = 0.1 }) =>
  suona(mix, 'pianoforte_coda', m, { t, dur: Math.min(dur, 4), vel: vel * 1.2, pan, rev: 0.6, gain: 1.4, release: 0.8 });
const harp = (mix, m, { t, vel = 40, pan = -0.2 }) =>
  suona(mix, 'arpa', m, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.6, gain: 0.9, release: 1.2 });
const bell = (mix, m, { t, vel = 44, pan = 0.25, gain = 1 }) =>
  suona(mix, 'glockenspiel', m < 79 ? m + 12 * Math.ceil((79 - m) / 12) : m, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.75, gain: gain * 0.28, release: 1.5 });
const pizz = (mix, m, { t, vel = 40, pan = -0.1 }) =>
  suona(mix, 'contrabbasso_pizz', m, { t, dur: BEAT, vel: vel * 1.5, pan, rev: 0.3, gain: 1.5, release: 0.25 });
/** L'organo d'attesa del centro commerciale vuoto: accordi lunghi, piano, un po' lontani. */
const organ = (mix, m, { t, dur, vel = 36, pan = 0 }) =>
  suona(mix, 'organo', m, { t, dur, vel: vel * 1.2, pan, rev: 0.7, gain: 0.55, attack: 0.5, release: 1.2 });
/** La marimba lontana (la musica che nessuno ascolta). */
const mar = (mix, m, { t, vel = 36, pan = 0.35 }) =>
  suona(mix, 'marimba', m, { t, dur: 1.2, vel: vel * 1.3, pan, rev: 0.8, gain: 0.7, release: 0.6 });
/** Timpano: v2 per i colpi leggeri, v4 (il forte di VCSL) per i colpi chiave (ERRORI.md). */
const timp = (mix, t, { vel = 100, gain = 0.8, pan = 0, forte = false } = {}) =>
  colpo(mix, 'timpani', forte ? 'Timpani1_Hit_v4_rr1_Sum' : 'Timpani1_Hit_v2_rr1_Sum', { t, vel, gain, pan, rev: 0.45 });
const swell = (mix, t, dur, { gain = 0.5 } = {}) => colpo(mix, 'piatto_sospeso', 'susp_FX_scrape_continuous', { t, dur, vel: 90, gain, release: 0.4, rev: 0.5, da: 2 });

// Fa# minore · Re · Si minore · Do# settima
const CHORDS = [[42, [0, 7, 12, 15, 19]], [38, [0, 7, 12, 16, 19]], [35, [0, 7, 12, 15, 19]], [37, [0, 4, 10, 16, 19]]];
// La maggiore · Re · Fa# minore · Mi (il dettaglio e la chiusura)
const MAJ = [[45, [0, 7, 12, 16, 19]], [38, [0, 7, 12, 16, 19]], [42, [0, 7, 12, 15, 19]], [40, [0, 7, 11, 16, 19]]];
const MOTIF = [[0, 73], [1, 74], [2, 73], [3, 69], [4, 71], [5, 69], [6, 66], [7, 65]];
const MOTIF_M = [[0, 73], [1, 76], [2, 73], [3, 69], [4, 71], [5, 74], [6, 73], [7, 69]];

export default (mix, T) => {
  const at = (id, n, d = 0) => croma(T.frase(id, n) + d);
  let sid = 0;

  /** Una sezione da `from` a `to`: drone · str · arp · harp · spic (doppio) · mel · bells · pizz · org · mar · pausa. */
  const sec = (from, to, o) => {
    // `esatto`: gli estremi agganciati a un evento (già sulla croma) non si arrotondano al battito (revisore musica)
    from = o.esatto ? from : snap(from); to = o.esatto ? to : snap(to);
    const R = rng(7000 + sid++ * 131);
    const ch = o.maj ? MAJ : CHORDS;
    const mot = o.maj ? MOTIF_M : MOTIF;
    const pause = o.pause ?? [];
    const tacet = (x) => pause.some(([a, b]) => x >= a && x < b);
    const tratti = () => {
      const out = [];
      let a = from;
      for (const [p0, p1] of [...pause].sort((x, y) => x[0] - y[0])) { if (p0 > a) out.push([a, Math.min(p0, to)]); a = Math.max(a, p1); }
      if (a < to) out.push([a, to]);
      return out.filter(([x, y]) => y - x > 0.6);
    };
    if (o.drone) {
      const ped = o.maj ? 33 : 30; // La o Fa# gravi
      tratti().forEach(([x, y], i) => {
        const coda = y >= to ? 0.4 : 0.05;
        drone(mix, ped, { t: x, dur: y - x + coda, vel: o.drone, gain: 0.7, seed: sid + i });
        drone(mix, ped + 12, { t: x, dur: y - x + coda, vel: o.drone * 0.8, gain: 0.5, seed: sid + 50 + i });
      });
    }
    // battute su una griglia assoluta: l'armonia non riparte a ogni capitolo
    for (let t = Math.floor(from / BAR) * BAR; t < to - 0.3; t += BAR) {
      const k = Math.round(t / BAR);
      const [root, iv] = ch[k % 4];
      const t0 = Math.max(t, from);
      const fine = Math.min(t + BAR * 1.02, to);
      // archi e organo spezzati nelle pause e chiusi 0,3 s prima (il rilascio non entra nel silenzio)
      const pezzi = () => {
        const segs = [];
        let a = t0;
        for (const [p0, p1] of [...pause].sort((x, y) => x[0] - y[0])) {
          if (p1 <= a || p0 >= fine) continue;
          if (p0 - 0.3 > a) segs.push([a, p0 - 0.3]);
          a = Math.max(a, p1);
        }
        if (a < fine) segs.push([a, fine]);
        return segs.filter(([x, y]) => y - x > 0.5);
      };
      if (o.str) pezzi().forEach(([x, y]) => [iv[1], iv[2], iv[3]].forEach((v, j) =>
        strings(mix, root + 12 + v, { t: x + j * 0.04, dur: y - x, vel: o.str, gain: 0.9, pan: (j - 1) * 0.35, seed: j + k, att: Math.min(1, (y - x) / 3) })));
      if (o.org) pezzi().forEach(([x, y]) => [iv[1], iv[2], iv[3]].forEach((v, j) =>
        organ(mix, root + 24 + v, { t: x + j * 0.03, dur: y - x, vel: o.org, pan: (j - 1) * 0.25 })));
      if (o.arp) for (let i = 0; i < 8 && t + i * CROMA < to - 0.05; i++) {
        const tt = t + i * CROMA;
        if (tt < from || tacet(tt)) continue;
        piano(mix, root + 12 + iv[[0, 1, 2, 3, 4, 3, 2, 1][i]], { t: tt, dur: CROMA * 1.6, vel: o.arp * (i % 4 === 0 ? 1 : 0.78), pan: -0.15 });
      }
      if (o.mar) for (let i = 0; i < 8 && t + i * CROMA < to - 0.05; i++) {
        const tt = t + i * CROMA;
        if (tt < from || tacet(tt) || [1, 3, 6].includes(i)) continue;
        mar(mix, root + 24 + iv[[2, 3, 4, 3, 2, 4, 3, 1][i]], { t: tt, vel: o.mar * (i % 4 === 0 ? 1 : 0.75) });
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

  // ---- istanti degli eventi (uguali a Mondo.tsx e Pov.tsx)
  const B2 = 2 * BEAT;
  const spegniAg = at('aggancio', 1, 2.2); // i neon si spengono dal fondo verso la camera
  const fuoriAg = at('aggancio', 2, -0.4); // la camera esce dalla stanza
  const neveVhs = at('cassetta', 2, 1.2); // l'attacco a Naren: neve e segnale perso
  const fuga = at('fessura', 3);
  const bobby = at('commessi', 2, 1.2);
  const buioMary = at('mary', 3, 0.4);
  const passiPirata = at('pirata', 1, 0.4);
  const attacc = at('cemento', 0, 0.8);
  const lancio = at('cemento', 1, 0.2);
  const COLPO = at('cemento', 1, 0.8); // il colpo del cemento (momento clou)
  const COLPO2 = at('dettaglio', 3, 0.8); // il colpo nel dettaglio: si apre il La maggiore
  const copiaMary = at('montaggio', 3, 1.4);

  // ---------------------------------------------------------------- aggancio
  sec(T.aggancio, fuoriAg, { esatto: true, drone: 30, mar: 30, org: 26, mel: 36, keep: 0.8, pause: [[spegniAg + 1.6, fuoriAg]] });
  sec(fuoriAg, T.foto, { esatto: true, drone: 34, str: 32, harp: 34, bells: 30, mel: 36 });
  // ---------------------------------------------------------------- COSA SONO LE BACKROOMS: il centro commerciale vuoto
  sec(T.foto, T.noclip, { drone: 30, org: 28, mar: 28, keep: 0.85 });
  sec(T.noclip, T.livello0, { drone: 32, org: 26, harp: 32, bells: 30 });
  sec(T.livello0, T.liminale, { drone: 34, org: 30, mar: 32, mel: 34, keep: 0.8 });
  sec(T.liminale, T.leggenda, { drone: 30, org: 32, mar: 34, mel: 32, keep: 0.7 });
  sec(T.leggenda, T.oshkosh, { drone: 38, str: 30, pizz: 30, org: 22 });
  sec(T.oshkosh, T.parsons, { drone: 32, harp: 34, mar: 28, bells: 30, mel: 34, keep: 0.8 });
  sec(T.parsons, T.async, { drone: 34, arp: 22, org: 24, mel: 30 });
  sec(T.async, T.a24, { drone: 40, str: 34, spic: 30 });
  sec(T.a24, T.cassetta, { drone: 34, str: 34, harp: 34, mel: 35, bells: 32 });
  // ---------------------------------------------------------------- LA STORIA DEL FILM
  sec(T.cassetta, T.negozio, { drone: 40, str: 30, pause: [[neveVhs - 1, neveVhs - 0.05], [neveVhs, neveVhs + B2]] });
  sec(T.negozio, T.fessura, { drone: 32, arp: 22, mar: 24, mel: 30, keep: 0.85 });
  sec(T.fessura, fuga, { esatto: true, drone: 38, str: 32, pizz: 30 });
  sec(fuga, T.commessi, { esatto: true, drone: 46, spic: 46, doppio: true, str: 40 });
  sec(T.commessi, T.mary, { drone: 40, str: 36, pizz: 34, pause: [[bobby - 0.05, bobby + BEAT]] });
  sec(T.mary, T.tavola, { drone: 38, str: 30, arp: 24, pause: [[buioMary, buioMary + B2]] });
  sec(T.tavola, T.regola, { drone: 34, harp: 30, bells: 32, mel: 32, keep: 0.8 });
  sec(T.regola, T.uscita, { drone: 34, harp: 34, org: 24, bells: 30 });
  sec(T.uscita, T.pirata, { drone: 34, str: 32, harp: 32, mel: 34 });
  sec(T.pirata, passiPirata, { esatto: true, drone: 40, str: 34 });
  sec(passiPirata, T.cemento, { esatto: true, drone: 44, spic: 42, doppio: true, str: 40 });
  sec(T.cemento, lancio, { esatto: true, drone: 44, spic: 44, doppio: true, str: 42, pause: [[attacc - 0.05, attacc + CROMA], [COLPO - BEAT, COLPO + B2]] });
  // il colpo: silenzio prima (dal lancio), colpo, un battito di silenzio dopo
  sec(COLPO + B2, T.phil, { esatto: true, drone: 36, str: 30, harp: 28 });
  sec(T.phil, T.montaggio, { drone: 38, str: 32, pizz: 28, org: 20 });
  // ---------------------------------------------------------------- IL FINALE SPIEGATO
  sec(T.montaggio, T.mostra, { drone: 40, spic: 36, str: 36, pause: [[copiaMary - 0.8, copiaMary - 0.05]] });
  sec(T.mostra, T.sorte, { drone: 34, harp: 34, bells: 32, mel: 34 });
  sec(T.sorte, T.metafora, { drone: 34, str: 30, harp: 30, mel: 32, keep: 0.8 });
  sec(T.metafora, T.dettaglio, { drone: 32, org: 28, mar: 32, keep: 0.8 });
  sec(T.dettaglio, COLPO2, { drone: 36, str: 34, harp: 30, pause: [[COLPO2 - 1.2, COLPO2]] });
  // il La maggiore si apre sul colpo del cemento (il cambio di carattere cade con l'evento visivo) e resta
  sec(COLPO2 + BEAT, T.seguito, { drone: 34, str: 38, harp: 36, mel: 38, bells: 32, maj: true });
  sec(T.seguito, T.chiusura, { drone: 30, str: 30, harp: 30, mel: 32, keep: 0.8, maj: true });
  sec(T.chiusura, T.END, { drone: 32, str: 36, harp: 34, mel: 36, org: 20, maj: true });

  // ---------------------------------------------------------------- tappeti
  // il ronzio dei neon: sotto tutto il primo atto e dentro i corridoi, sotto la musica
  // (il file dura 61 s: i tratti lunghi si fanno con prese da 24 s che si sovrappongono di 2 s)
  const ronzio = (t, dur, gain = 0.06) => {
    for (let x = 0; x < dur - 0.5; x += 22) {
      const d = Math.min(24, dur - x);
      clip(mix, 'ronzio_neon', { t: t + x, da: 3 + ((t + x) % 30), durata: d, gain, fadeIn: x === 0 ? 0.8 : 2, fadeOut: x + d >= dur - 0.01 ? 0.8 : 2, largo: 1.2 });
    }
  };
  ronzio(0, spegniAg + 1.6, 0.16);
  ronzio(at('foto', 2), T.leggenda - at('foto', 2), 0.10);
  ronzio(at('fessura', 2), fuga - at('fessura', 2), 0.07);
  ronzio(T.tavola, T.pirata - T.tavola, 0.05);
  ronzio(T.montaggio, T.dettaglio - T.montaggio, 0.05);

  // ---------------------------------------------------------------- effetti
  // i voli della camera da un luogo all'altro: un soffio all'inizio di ogni capitolo e nei passaggi delle finestre
  const volo = (t, mv, g = 0.12) => clip(mix, 'passaggio', { t, da: 0.56, durata: mv, gain: g, fadeIn: mv * 0.3, fadeOut: mv * 0.4, rev: 0.35 });
  for (const id of ['noclip', 'liminale', 'leggenda', 'oshkosh', 'parsons', 'async', 'a24', 'cassetta', 'negozio', 'fessura', 'commessi', 'mary', 'tavola', 'regola', 'uscita', 'pirata', 'phil', 'montaggio', 'mostra', 'sorte', 'metafora', 'dettaglio', 'seguito', 'chiusura']) volo(croma(T[id] - 0.2), 1.6, 0.1);
  for (const t of [at('aggancio', 2, 4.8), at('aggancio', 3, 4.2), at('aggancio', 4, 3.6), at('a24', 3), at('mary', 1), at('pirata', 2), at('seguito', 1), fuoriAg, at('foto', 3, -0.2), at('livello0', 2, 0.6), at('cassetta', 0, 1.4), at('fessura', 2, -0.2), at('pirata', 3, 0.6), at('montaggio', 1), at('montaggio', 2)]) volo(t, 1.4, 0.16);
  // aggancio: i neon che si spengono uno dopo l'altro, dal fondo verso di noi; le tre promesse; il cemento con l'anello
  for (let i = 0; i < 16; i++) clip(mix, 'scatti', { t: croma(spegniAg) - 0.12 + i * 0.12, da: 6.49, durata: 0.06, gain: 0.28 + i * 0.025, rev: 0.25, pan: 0.2 - i * 0.025 });
  timp(mix, croma(spegniAg + 1.6), { vel: 90, gain: 0.5 });
  bell(mix, 76, { t: at('aggancio', 2, 0.6), vel: 34 });
  bell(mix, 81, { t: at('aggancio', 3, 0.4), vel: 34 });
  timp(mix, at('aggancio', 4, 0.8), { vel: 100, gain: 0.6 });
  bell(mix, 73, { t: at('aggancio', 4, 1.2), vel: 36 });
  // foto: i messaggi del forum, la foto che arriva
  clip(mix, 'macchina_scrivere', { t: T.foto + 0.6, da: 1, durata: 1.8, gain: 0.12, fadeOut: 0.4, rev: 0.2, lp: 4000 });
  [73, 78, 81].forEach((m, k) => bell(mix, m, { t: at('foto', 2) + k * CROMA, vel: 34 }));
  // noclip: il pavimento che diventa griglia, la caduta (arpa che scende), l'arrivo nel Livello 0
  clip(mix, 'ronzio_tesla', { t: at('noclip', 1), da: 1, durata: 1.2, gain: 0.12, fadeIn: 0.2, fadeOut: 0.5 });
  [81, 78, 76, 73, 69, 66, 64, 61, 57, 54].forEach((m, k) => harp(mix, m, { t: at('noclip', 1, 0.6) + k * CROMA, vel: 34 }));
  bell(mix, 78, { t: at('noclip', 2), vel: 38 });
  timp(mix, at('noclip', 3, 0.8), { vel: 85, gain: 0.45 });
  // livello 0: il numero enorme, le tre Terre, il ronzio
  timp(mix, at('livello0', 0, 0.6), { vel: 95, gain: 0.55 });
  [0, 1, 2].forEach((i) => mar(mix, [66, 69, 73][i], { t: at('livello0', 0, 3.6) + i * CROMA, vel: 40 }));
  clip(mix, 'ronzio_neon', { t: at('livello0', 1, 1.6), da: 4, durata: 2, gain: 0.14, fadeIn: 0.2, fadeOut: 0.6 });
  // leggenda: i livelli che compaiono, le pagine dell'enciclopedia, la foto (domanda)
  timp(mix, at('leggenda', 1, -0.2), { vel: 90, gain: 0.5 });
  timp(mix, at('leggenda', 1, 0.6), { vel: 80, gain: 0.45 });
  clip(mix, 'pagine', { t: at('leggenda', 3), da: 1, durata: 1.6, gain: 0.25, fadeOut: 0.3, rev: 0.25 });
  bell(mix, 81, { t: at('leggenda', 4), vel: 38 });
  // oshkosh: 2024, la mappa e la puntina, il negozio di mobili (anello)
  bell(mix, 76, { t: at('oshkosh', 1), vel: 34 });
  pizz(mix, 42, { t: at('oshkosh', 2, 0.6), vel: 50 });
  timp(mix, at('oshkosh', 3, 1.8), { vel: 95, gain: 0.55 });
  // parsons: la cassetta inserita, il nastro che scende, le puntate impilate
  clip(mix, 'scatti', { t: T.parsons + 0.6, da: 2.1, durata: 0.5, gain: 0.35, rev: 0.2 });
  for (let i = 0; i < 8; i++) clip(mix, 'scatti', { t: at('parsons', 3, 0.6) + i * 0.15, da: 6.49, durata: 0.06, gain: 0.3, rev: 0.2, pan: 0.4 });
  // async: l'anello che si accende e apre il passaggio
  clip(mix, 'ronzio_tesla', { t: at('async', 1), da: 1, durata: 3, gain: 0.16, fadeIn: 0.6, fadeOut: 1 });
  swell(mix, at('async', 1) - 0.4, 1.6, { gain: 0.3 });
  timp(mix, at('async', 1, 1.2), { vel: 100, gain: 0.6 });
  // a24: l'insegna del cinema che si accende
  [69, 73, 76, 81].forEach((m, k) => bell(mix, m, { t: T.a24 + 0.4 + k * CROMA / 2, vel: 34 }));
  // cassetta: il fruscio della VHS, «aiuto», l'attacco (neve: silenzio, poi colpo e disturbo)
  clip(mix, 'disturbo', { t: T.cassetta + 1.4, da: 1, durata: Math.min(10.5, neveVhs - T.cassetta - 2.4), gain: 0.04, fadeIn: 0.6, fadeOut: 0.3 });
  timp(mix, neveVhs, { vel: 118, gain: 0.85, forte: true });
  clip(mix, 'disturbo', { t: neveVhs, da: 6, durata: Math.min(5.5, at('cassetta', 3) - neveVhs + 0.4), gain: 0.16, fadeOut: 0.5 });
  // negozio: il campanello del negozio di mobili, il cappello sull'insegna, la casa demolita
  clip(mix, 'campanello_negozio', { t: T.negozio + 0.4, da: 0.3, durata: 1.6, gain: 0.2, fadeOut: 0.5, rev: 0.3 });
  bell(mix, 78, { t: at('negozio', 2, 1.0), vel: 34 });
  [69, 66, 61].forEach((m, k) => harp(mix, m, { t: at('negozio', 4, 0.6) + k * CROMA, vel: 32 }));
  // fessura: le luci che sfarfallano, la fessura che brilla, le cose di Naren, la fuga, la telecamera di Phil
  for (const d of [0.3, 0.9, 1.1, 2.4, 2.5, 3.6]) clip(mix, 'scatti', { t: croma(T.fessura) + d, da: 6.49, durata: 0.06, gain: 0.3, rev: 0.25 });
  [78, 81, 85].forEach((m, k) => bell(mix, m, { t: at('fessura', 1, 0.6) + k * CROMA / 2, vel: 34 }));
  bell(mix, 73, { t: at('fessura', 2, 2.4), vel: 34 });
  timp(mix, fuga, { vel: 110, gain: 0.75, forte: true });
  clip(mix, 'scatti', { t: at('fessura', 4, 0.4), da: 2.1, durata: 0.4, gain: 0.3, rev: 0.2, pan: 0.5 });
  // commessi: Bobby trascinato via (poi un battito di silenzio), il muro che si alza
  clip(mix, 'passaggio', { t: at('commessi', 2), da: 0.56, durata: 1.2, gain: 0.22, fadeOut: 0.3, rev: 0.4 });
  timp(mix, bobby, { vel: 112, gain: 0.75, forte: true });
  clip(mix, 'colpi_legno', { t: at('commessi', 3, 0.6), da: 0.2, durata: 0.6, gain: 0.35, rev: 0.4 });
  // mary: la segreteria (scatto del nastro), il viaggio fino alla fessura, i neon che si spengono
  clip(mix, 'scatti', { t: T.mary + 0.4, da: 2.1, durata: 0.5, gain: 0.3, rev: 0.2, pan: -0.3 });
  for (let i = 0; i < 6; i++) clip(mix, 'scatti', { t: buioMary + i * 0.05, da: 6.49, durata: 0.06, gain: 0.35, rev: 0.3 });
  timp(mix, buioMary, { vel: 100, gain: 0.6 });
  // tavola: le copie bianche che compaiono, «Still Life», Kat
  [61, 66, 69].forEach((m, k) => bell(mix, m, { t: at('tavola', 1) + k * 0.4, vel: 30 }));
  timp(mix, at('tavola', 4, 0.6), { vel: 90, gain: 0.5 });
  // regola: la casa che scende e diventa copie sempre più storte (arpa che scende di un semitono)
  [[at('regola', 1, 0.4), 0], [at('regola', 2, 0.4), -1], [at('regola', 2, 1.2), -2]].forEach(([t, d]) => [73, 69, 66].forEach((m, k) => harp(mix, m + d, { t: t + k * CROMA, vel: 32 })));
  // uscita: i livelli della leggenda cancellati, la strada che torna alla fessura
  timp(mix, at('uscita', 0, 2.6), { vel: 95, gain: 0.55 });
  [54, 57, 61, 66, 69, 73, 78].forEach((m, k) => harp(mix, m, { t: at('uscita', 2) + k * CROMA / 2, vel: 34 }));
  // pirata: la frase di Mary, il cappello che arriva, i passi della gamba di legno, Clark ucciso
  for (let k = 0; k < 6; k++) clip(mix, 'colpi_legno', { t: passiPirata + k * CROMA, da: 0.27, durata: 0.22, gain: 0.25 + k * 0.05, rev: 0.4, lp: 2500 });
  for (let i = 0; i < 10; i++) clip(mix, 'scatti', { t: at('pirata', 1, 0.8) + i * CROMA / 2, da: 6.49, durata: 0.06, gain: 0.25, rev: 0.3 }); // i neon che si spengono a ondata
  timp(mix, at('pirata', 3, 0.2), { vel: 112, gain: 0.75, forte: true });
  // cemento (momento clou): l'attaccapanni che spezza la gamba, il lancio, il silenzio, il colpo, il gas
  clip(mix, 'legno_cade', { t: attacc, da: 0, durata: 1, gain: 0.5, fadeOut: 0.4, rev: 0.35 });
  clip(mix, 'colpi_legno', { t: attacc + 0.05, da: 0.27, durata: 0.25, gain: 0.4, rev: 0.3 });
  clip(mix, 'passaggio', { t: lancio, da: 0.56, durata: COLPO - lancio, gain: 0.2, fadeIn: 0.1, rev: 0.3 });
  timp(mix, COLPO, { vel: 127, gain: 1.2, forte: true });
  colpo(mix, 'grancassa', 'bdrum_ff', { t: COLPO, vel: 120, gain: 0.9, rev: 0.4 });
  clip(mix, 'rombo', { t: COLPO + 0.1, da: 3.6, durata: 2.4, gain: 0.12, fadeOut: 1.2, largo: 1.4 });
  clip(mix, 'sibilo', { t: at('cemento', 2, 0.4), da: 1, durata: 3, gain: 0.15, fadeIn: 0.4, fadeOut: 1, largo: 1.3 });
  bell(mix, 69, { t: at('cemento', 1, 2.4), vel: 34 }); // «ricordatelo!»
  // phil: la stanzetta, la ricerca, «non decido io»
  timp(mix, at('phil', 3, 1.2), { vel: 95, gain: 0.55 });
  bell(mix, 73, { t: at('phil', 4, 0.4), vel: 32 });
  // montaggio: un soffio per ogni luogo copiato; la copia di Mary (silenzio, colpo, campanella)
  timp(mix, copiaMary, { vel: 112, gain: 0.8, forte: true });
  bell(mix, 85, { t: copiaMary, vel: 40 });
  // mostra e sorte: il legame vero–copia, le due strade, il regista che non conferma
  [73, 78, 73].forEach((m, k) => bell(mix, m, { t: at('mostra', 1, 0.3) + k * CROMA, vel: 32 }));
  [66, 61, 57].forEach((m, k) => harp(mix, m, { t: at('sorte', 1, 0.3) + k * CROMA, vel: 34 }));
  [69, 73, 76].forEach((m, k) => harp(mix, m + 12, { t: at('sorte', 2, 0.3) + k * CROMA, vel: 34 }));
  // metafora: gli scatoloni, lo scorrere del telefono
  clip(mix, 'colpi_legno', { t: at('metafora', 1, 0.4), da: 0.2, durata: 0.5, gain: 0.15, rev: 0.3, lp: 2000 });
  for (let i = 0; i < 10; i++) clip(mix, 'scatti', { t: at('metafora', 3, 0.2) + i * 0.2, da: 6.49, durata: 0.05, gain: 0.2, rev: 0.2, pan: 0.3 });
  // dettaglio: la casa che si accende dentro il cemento (celesta di campanelle), le copie che tremano, il colpo
  [69, 73, 76, 81].forEach((m, k) => bell(mix, m, { t: at('dettaglio', 1, 0.4) + k * CROMA, vel: 36 }));
  swell(mix, COLPO2 - 3, 1.8, { gain: 0.35 });
  timp(mix, COLPO2, { vel: 124, gain: 1.0, forte: true });
  [69, 73, 76, 81, 85].forEach((m, k) => harp(mix, m, { t: COLPO2 + BEAT + k * CROMA / 2, vel: 36 }));
  // seguito: la fessura nuova che si accende lontano
  [81, 85, 88].forEach((m, k) => bell(mix, m, { t: at('seguito', 1, 0.6) + k * CROMA, vel: 32 }));
  // chiusura: i pulsanti, sospesa
  [76, 81, 85, 88].forEach((m, k) => bell(mix, m, { t: T.END - 6 + k * CROMA, vel: 32 }));
};
