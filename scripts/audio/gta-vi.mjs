// Colonna sonora originale di GTA VI (Videogiochi spiegati): richiama solo il GENERE synth anni '80 da lungomare
// notturno (basso che pulsa a crome, arpeggio che corre, batteria con il rullante largo, archi tenuti come un tappeto
// di sintetizzatori, un richiamo di tromba con la sordina), suonato con strumenti veri campionati (VSCO-2 CE e VCSL, CC0).
// Melodia e giro di accordi sono inventati qui (La minore · Fa · Do · Sol); niente temi, sigle, brani delle radio del
// gioco o musiche dei trailer (GIOCHI.md, «Musica»).
// Un solo tempo: 100 bpm su una griglia continua che parte a 4 s (fine della copertina). Sezioni per capitolo: groove pieno
// sulla mappa e su Vice City, mezzo passo per Jason e Lucia, tensione con il timpano e le sirene per il colpo che va storto,
// passo doppio del charleston per il Criminal Profile, crescendo per l'uscita, accordo maggiore nel finale.
// Effetti registrati agganciati agli eventi della mappa in src/scenes/gta-vi/Mappa.tsx e della copertina in Locandina.tsx.
import { rng } from './synth.mjs';
import { suona, archi, colpo, crescendo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte', 'contrabbasso_pizz', 'celli_pizz', 'violini_pizz', 'violini', 'viole', 'celli', 'contrabbasso',
  'tromba_sordina', 'glockenspiel', 'timpani', 'cassa', 'rullante', 'charleston', 'piatto_crash', 'piatto_sospeso'];
export const effetti = ['risacca', 'ronzio_neon', 'sirene', 'passaggio', 'scatti', 'monete', 'telo', 'serratura', 'giornale', 'onde'];
/** Sala media e lucida, con la coda lunga del rullante anni '80. */
export const sala = { rt60: 2.0, brillo: 7800, predelay: 0.02, wet: 0.42 };

const BPM = 100;
const BEAT = 60 / BPM;
const GRID = 4 * BEAT; // una battuta = 2,4 s
const G0 = 4;
const CROMA = BEAT / 2;
// le battute hanno una fase propria (4,6 s) che le avvicina agli inizi dei capitoli; battiti e crome restano su G0
const B0 = 4.6;
const snap = (t) => B0 + Math.round((t - B0) / GRID) * GRID;
const onBeat = (t) => G0 + Math.round((t - G0) / BEAT) * BEAT;

// ---------------------------------------------------------------- strumenti (campionati)

const pad = (mix, m, { t, dur, vel = 40, pan = 0, gain = 1, att = 0.8, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev: 0.6, gain: gain * 1.2, attack: att, release: 1.2, seed });
const bass = (mix, m, { t, vel = 60 }) => {
  suona(mix, 'contrabbasso_pizz', m < 28 ? m + 12 : m, { t, dur: CROMA * 0.9, vel: vel * 1.6, gain: 1.7, rev: 0.1, release: 0.1 });
  suona(mix, 'celli_pizz', m + 12, { t, dur: CROMA * 0.8, vel: vel * 1.2, gain: 0.5, pan: -0.15, rev: 0.15, release: 0.1 });
};
const arp = (mix, m, { t, vel = 40, pan = 0 }) => {
  suona(mix, 'violini_pizz', m, { t, dur: CROMA * 0.8, vel: vel * 1.5, gain: 0.45, pan, rev: 0.35, release: 0.15 });
  suona(mix, 'pianoforte', m + 12, { t, dur: CROMA * 0.7, vel: vel * 0.9, gain: 1.4, pan: -pan, rev: 0.45, release: 0.2 });
};
const lead = (mix, m, { t, dur, vel = 50 }) =>
  suona(mix, 'tromba_sordina', m, { t, dur, vel: vel * 1.3, gain: 0.55, pan: 0.1, rev: 0.6, attack: 0.02, release: 0.4 });
const bell = (mix, m, { t, vel = 46, pan = 0.2, gain = 1 }) =>
  suona(mix, 'glockenspiel', m < 79 ? m + 12 * Math.ceil((79 - m) / 12) : m, { t, dur: 1.6, vel: vel * 1.3, pan, rev: 0.6, gain: gain * 0.42, release: 1.2 });
const kick = (mix, t, vel = 60) => colpo(mix, 'cassa', vel > 55 ? 'v5' : 'v3', { t, vel: 100, gain: 0.85 * (vel / 60), rev: 0.08, seed: Math.round(t * 100) });
const snare = (mix, t, vel = 60) => colpo(mix, 'rullante', vel > 55 ? 'v6' : vel > 40 ? 'v5' : 'v4', { t, vel: 100, gain: 0.5 * (vel / 60), pan: 0.05, rev: 0.6, seed: Math.round(t * 100) });
const hat = (mix, t, vel = 40) => colpo(mix, 'charleston', vel > 45 ? 'v3' : 'v2', { t, vel: 100, gain: 0.24 * (vel / 50), pan: 0.3, rev: 0.12, seed: Math.round(t * 100) });
const crash = (mix, t, vel = 50) => colpo(mix, 'piatto_crash', vel > 60 ? 'ff' : 'mf', { t, vel: 100, gain: 0.3 * (vel / 60), pan: 0.35, rev: 0.35, dur: 2.5, release: 0.8 });
const timp = (mix, t, { vel = 100, gain = 0.7 } = {}) => colpo(mix, 'timpani', 'Timpani1_Hit_v2_rr1_Sum', { t, vel, gain, rev: 0.45 });

// ---------------------------------------------------------------- materiale musicale (inventato qui)

const MIN = [0, 3, 7], MAJ = [0, 4, 7];
// La minore · Fa · Do · Sol, una battuta ciascuno; nel finale Fa · Sol · La maggiore
const GIRO = [[57, MIN], [53, MAJ], [48, MAJ], [55, MAJ]];
const voicing = ([root, iv], lo) => iv.map((v) => { let m = root + v; while (m < lo) m += 12; while (m >= lo + 12) m -= 12; return m; }).sort((a, b) => a - b);
// il richiamo della tromba (due battute): Mi Sol La · Sol Mi Re · Do Re Mi · La
const HOOK = [[0, 76, 1], [1, 79, 1], [2, 81, 2], [4, 79, 1], [5, 76, 1], [6, 74, 2], [8, 72, 1], [9, 74, 1], [10, 76, 2], [12, 69, 4]];

export default (mix, T) => {
  const film = loadFilm('gta-vi');
  const { segments } = timeline(film);
  const segs = Object.fromEntries(segments.map((s) => [s.id, s]));
  /** Inizio assoluto della frase n del capitolo, come subtitleTimes in ChapterOverlay.tsx. */
  const C = (id, n) => {
    const s = segs[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let cur = 0.15;
    for (let k = 0; k < n; k++) cur += (w[k] / tot) * (s.dur - 0.35);
    return s.start + cur;
  };
  /** Istante (assoluto) della frase n più d, sulla croma della griglia: gli stessi istanti degli eventi di Mappa.tsx. */
  const at = (id, n, d = 0) => G0 + Math.round((C(id, n) + d - G0) / CROMA) * CROMA;
  const R = rng(1919);
  let sid = 0;

  /**
   * Una sezione sulla griglia.
   * pad: archi tenuti · bass: basso a crome · arp: arpeggio a crome (doppio = semicrome) · kick/snare/hats: batteria
   * (half = a mezzo passo, hats2 = charleston a semicrome) · hook: richiamo della tromba · pausa: [a, b] niente ritmo
   */
  const sec = (from, to, o) => {
    from = from <= 0 ? B0 - Math.ceil(B0 / GRID) * GRID : snap(from); to = o.esatto ? to : snap(to);
    const tacet = (x) => x < 0 || (o.pausa && x >= o.pausa[0] && x < o.pausa[1]);
    sid++;
    for (let t = from, b = 0; t < to - 0.2; t += GRID, b++) {
      const ch = GIRO[b % 4];
      const v = voicing(ch, 57);
      const d = Math.min(GRID * 1.02, to - t + (o.code ?? 0));
      const tp = Math.max(0, t), dp = d - (tp - t);
      if (o.pad) v.forEach((m, j) => pad(mix, m, { t: tp + j * 0.03, dur: dp, vel: o.pad, gain: 0.5, pan: (j - 1) * 0.35, seed: sid * 7 + j + b }));
      if (o.pad && o.basso) pad(mix, ch[0] - 24, { t: tp, dur: dp, vel: o.pad, gain: 0.45, seed: sid + b });
      for (let k = 0; k < 8; k++) {
        const tk = t + k * CROMA;
        if (tk >= to - 0.05 || tacet(tk)) continue;
        if (o.bass) bass(mix, ch[0] - 24 + (k === 6 ? 12 : 0), { t: tk, vel: o.bass * (k % 2 ? 0.75 : 1) });
        if (o.arp) {
          const notes = [...v, v[0] + 12, v[2], v[1]];
          const n = o.doppio ? 2 : 1;
          for (let h = 0; h < n; h++) arp(mix, notes[(k * n + h) % notes.length] + 12, { t: tk + (h * CROMA) / 2, vel: o.arp * (k % 2 ? 0.8 : 1), pan: k % 2 ? 0.3 : -0.3 });
        }
        if (o.hats) { hat(mix, tk, o.hats * (k % 2 ? 0.7 : 1)); if (o.hats2) hat(mix, tk + CROMA / 2, o.hats * 0.55); }
      }
      for (let k = 0; k < 4; k++) {
        const tk = t + k * BEAT;
        if (tk >= to - 0.05 || tacet(tk)) continue;
        if (o.kick) { if (!o.half || k === 0) kick(mix, tk, o.kick); if (!o.half && k === 3 && b % 2) kick(mix, tk + CROMA, o.kick * 0.8); }
        if (o.snare && (o.half ? k === 2 : k % 2)) snare(mix, tk, o.snare);
      }
      if (o.hook && b % 4 === 0) for (const [c, m, len] of HOOK) {
        const tk = t + c * CROMA;
        if (tk >= to - 0.2 || tacet(tk) || R() > (o.keep ?? 1)) continue;
        lead(mix, m + (o.oct ?? 0), { t: tk, dur: len * CROMA * 0.95, vel: o.hook });
      }
    }
  };

  // ---- sezioni (inizi dei capitoli dal JSON, sulla griglia)
  sec(0, T.mappa, { pad: 42, bass: 46, arp: 34, hats: 26, code: 0.3, basso: true });
  sec(T.mappa, T.vicecity, { pad: 34, bass: 46, arp: 32, kick: 48, hats: 34, basso: true });
  sec(T.vicecity, T.coppia, { pad: 38, bass: 50, arp: 34, kick: 54, snare: 44, hats: 38, hook: 44 });
  sec(T.coppia, T.colpo, { pad: 32, bass: 34, arp: 26, kick: 38, snare: 30, hats: 26, half: true, keep: 0.7, hook: 36, oct: -12 });
  sec(T.colpo, T.insieme, { pad: 40, bass: 48, kick: 52, snare: 46, half: true, basso: true, pausa: [at('colpo', 0, 1.0), at('colpo', 0, 1.0) + BEAT] });
  sec(T.insieme, T.profilo, { pad: 34, bass: 44, arp: 30, kick: 48, snare: 38, hats: 34 });
  sec(T.profilo, T.personaggi, { pad: 34, bass: 50, arp: 34, doppio: true, kick: 54, snare: 44, hats: 36, hats2: true });
  sec(T.personaggi, T.satira, { pad: 36, bass: 48, arp: 32, kick: 50, snare: 42, hats: 34, hook: 42 });
  sec(T.satira, T.uscita, { pad: 34, bass: 50, arp: 34, kick: 54, snare: 44, hats: 38, hats2: true });
  sec(T.uscita, T.edizioni, { pad: 40, bass: 52, arp: 36, doppio: true, kick: 56, snare: 48, hats: 40, basso: true });
  // la domanda finale: resta solo il tappeto, sospeso sul Fa, con il timpano e l'anello rosso
  const Q = onBeat(at('edizioni', 3, 0.4));
  sec(T.edizioni, Q, { esatto: true, pad: 36, bass: 48, arp: 34, kick: 52, snare: 44, hats: 38, hook: 48 });
  [53, 57, 60, 64].forEach((m, j) => pad(mix, m, { t: Q, dur: T.finale - Q + 0.2, vel: 44, gain: 0.7, pan: (j - 1.5) * 0.3, att: 0.4, seed: 90 + j }));
  for (let t = Q; t < T.finale - 0.1; t += CROMA) bass(mix, 29, { t, vel: 34 });
  // finale: La maggiore pieno, con la tromba che chiude il richiamo sulla tonica
  const F = onBeat(T.finale);
  crash(mix, F, 54);
  kick(mix, F, 56);
  [33, 45, 57, 61, 64, 69].forEach((m, j) => pad(mix, m, { t: F, dur: 3.8, vel: 54, gain: 0.9, pan: (j - 2.5) * 0.2, att: 0.3, seed: 60 + j }));
  [[0, 76, 1], [1, 73, 1], [2, 69, 4]].forEach(([c, m, len]) => lead(mix, m, { t: F + BEAT + c * CROMA, dur: len * CROMA, vel: 46 }));
  [81, 85, 88].forEach((m, k) => bell(mix, m, { t: F + k * CROMA, vel: 40 }));
  for (let t = F; t < F + 3.2; t += CROMA) bass(mix, 33, { t, vel: 40 * (1 - (t - F) / 4) });
  // copertina: rullo che porta dentro il primo capitolo
  crescendo(mix, G0, 1.6, { gain: 0.28 });
  crash(mix, G0, 46);

  // ---------------------------------------------------------------- effetti (gli istanti degli eventi di Mappa.tsx)
  // copertina e finale: la risacca sul lungomare, il ronzio dell'insegna, le sirene lontane
  clip(mix, 'risacca', { t: 0, da: 2, durata: 4.6, gain: 0.3, fadeIn: 0.05, fadeOut: 1.2, largo: 1.5 });
  clip(mix, 'ronzio_neon', { t: 0, da: 2.5, durata: 4, gain: 0.1, fadeOut: 1, pan: 0.3 });
  clip(mix, 'sirene', { t: 0.6, da: 2, durata: 3.4, gain: 0.12, fadeIn: 1.2, fadeOut: 1.2, pan: 0.6 });
  clip(mix, 'risacca', { t: T.finale, da: 9, durata: 4, gain: 0.3, fadeIn: 0.6, fadeOut: 1.4, largo: 1.5 });
  // capitolo 1: la mappa che si disegna, gli spilli delle sei zone, il × 3
  clip(mix, 'passaggio', { t: at('mappa', 0, -0.3), da: 0.56, durata: 1.0, gain: 0.6, fadeOut: 0.3, rev: 0.3 });
  bell(mix, 81, { t: at('mappa', 0, 1.6) });
  bell(mix, 76, { t: at('mappa', 1, 0.3) });
  bell(mix, 72, { t: at('mappa', 1, 0.7) });
  [0.2, 0.7, 1.2].forEach((d, k) => bell(mix, [79, 81, 84][k], { t: at('mappa', 2, d), vel: 40 }));
  timp(mix, at('mappa', 3, 1.6), { vel: 100, gain: 0.55 });
  // capitolo 2: l'insegna che si accende, la cartolina, le foto con il flash, il cerchio
  clip(mix, 'ronzio_neon', { t: at('vicecity', 0, 0.1), da: 2.5, durata: 2.5, gain: 0.15, fadeOut: 0.8, pan: 0.3 });
  clip(mix, 'telo', { t: at('vicecity', 0, 0.3), da: 4.45, durata: 0.8, gain: 0.45, fadeOut: 0.2, rev: 0.3 });
  clip(mix, 'telo', { t: at('vicecity', 1, 0.1), da: 4.45, durata: 0.8, gain: 0.45, fadeOut: 0.2, rev: 0.3 });
  [0.3, 0.7, 1.1].forEach((d) => clip(mix, 'scatti', { t: at('vicecity', 1, d), da: 6.49, durata: 0.12, gain: 0.4, rev: 0.2 }));
  [76, 81, 84].forEach((m, k) => bell(mix, m, { t: at('vicecity', 2, 0.1) + k * CROMA / 2, vel: 38 }));
  // capitolo 3: Jason, Brian, il carcere che si apre, Lucia
  bell(mix, 79, { t: at('coppia', 0, 0.1) });
  bell(mix, 74, { t: at('coppia', 1, 0.1), vel: 38 });
  clip(mix, 'serratura', { t: at('coppia', 2, 0.8), da: 0.1, durata: 0.9, gain: 0.6, rev: 0.3 });
  bell(mix, 84, { t: at('coppia', 2, 0.4) });
  bell(mix, 77, { t: at('coppia', 3, 0.2), vel: 36 });
  // capitolo 4: la borsa dei soldi, «va storto!» (timpano e sirene, poi un battito di silenzio), il complotto, gli scudi
  clip(mix, 'monete', { t: at('colpo', 0, 0.6), da: 1.3, durata: 0.7, gain: 0.3, rev: 0.25 });
  timp(mix, at('colpo', 0, 1.0), { vel: 115, gain: 0.8 });
  clip(mix, 'sirene', { t: at('colpo', 0, 1.0), da: 4, durata: 3.6, gain: 0.12, fadeIn: 0.3, fadeOut: 1.2, pan: 0.4 });
  clip(mix, 'sirene', { t: at('colpo', 0, 1.0) + 3.3, da: 8, durata: 6.2, gain: 0.1, fadeIn: 0.5, fadeOut: 1.5, pan: 0.4 }); // l'allarme resta acceso fino a fine capitolo
  crash(mix, at('colpo', 1, 0.1), 58);
  timp(mix, at('colpo', 1, 0.6), { vel: 100, gain: 0.6 });
  [72, 76, 79].forEach((m, k) => bell(mix, m, { t: at('colpo', 2, 0.6) + k * CROMA / 2, vel: 36 }));
  [79, 84].forEach((m, k) => bell(mix, m, { t: at('colpo', 3, 0.2) + k * CROMA, vel: 40 }));
  // capitolo 5: lo scambio, le strade separate, il rapporto che cresce
  clip(mix, 'passaggio', { t: at('insieme', 0, 0.6), da: 0.56, durata: 0.8, gain: 0.6, fadeOut: 0.2, rev: 0.3 });
  [72, 74, 76, 79].forEach((m, k) => bell(mix, m, { t: at('insieme', 2, 0.4) + k * CROMA, vel: 34 }));
  // capitolo 6: il fascicolo, le barre, il mondo che reagisce, le icone del fisico
  clip(mix, 'giornale', { t: at('profilo', 0, 0.1), da: 0.85, durata: 0.7, gain: 0.3, rev: 0.2 });
  clip(mix, 'sirene', { t: at('profilo', 1, 0.6), da: 6, durata: 2.4, gain: 0.35, fadeIn: 0.3, fadeOut: 0.8, pan: -0.4 });
  [0.2, 0.5, 0.8].forEach((d, k) => bell(mix, [76, 79, 84][k], { t: at('profilo', 2, d), vel: 34 }));
  [0.2, 0.5].forEach((d, k) => bell(mix, [81, 88][k], { t: at('profilo', 3, d), vel: 34 }));
  // capitolo 7: i quattro personaggi
  [['personaggi', 0], ['personaggi', 1], ['personaggi', 2], ['personaggi', 3]].forEach(([id, n], k) => bell(mix, [76, 79, 81, 72][k], { t: at(id, n, 0.2), vel: 36 }));
  // capitolo 8: i telefoni (scatto), il giornale, la telecamera, il paracadute, il tuffo
  clip(mix, 'scatti', { t: at('satira', 0, 0.2), da: 6.49, durata: 0.1, gain: 0.4, rev: 0.2 });
  clip(mix, 'scatti', { t: at('satira', 1, 0.2), da: 6.49, durata: 0.1, gain: 0.4, rev: 0.2 });
  clip(mix, 'giornale', { t: at('satira', 1, 0.6), da: 0.85, durata: 0.7, gain: 0.3, rev: 0.2 });
  clip(mix, 'scatti', { t: at('satira', 2, 0.1), da: 12.68, durata: 0.15, gain: 0.4, rev: 0.25 });
  clip(mix, 'telo', { t: at('satira', 3, 0.1), da: 4.45, durata: 0.8, gain: 0.45, fadeOut: 0.3, rev: 0.3 });
  clip(mix, 'onde', { t: at('satira', 3, 0.9), da: 2, durata: 1.8, gain: 0.3, fadeOut: 0.6, largo: 1.2 });
  // capitolo 9: la data, il PC barrato, il download, la scatola che si apre
  bell(mix, 84, { t: at('uscita', 0, 0.1), vel: 44 });
  clip(mix, 'scatti', { t: at('uscita', 0, 1.4), da: 6.49, durata: 0.1, gain: 0.4, rev: 0.2 });
  clip(mix, 'passaggio', { t: at('uscita', 1, 0.3), da: 12.27, durata: 2.0, gain: 0.35, fadeIn: 0.3, fadeOut: 0.5, rev: 0.3 });
  clip(mix, 'scatti', { t: at('uscita', 2, 0.4), da: 12.68, durata: 0.15, gain: 0.4, rev: 0.25 });
  // capitolo 10: il pacco regalo che si apre, la moneta barrata, la domanda finale
  clip(mix, 'telo', { t: at('edizioni', 0, 0.8), da: 4.45, durata: 0.8, gain: 0.45, fadeOut: 0.2, rev: 0.3 });
  [76, 81, 84, 88].forEach((m, k) => bell(mix, m, { t: at('edizioni', 0, 0.8) + k * CROMA / 2, vel: 40 }));
  clip(mix, 'monete', { t: at('edizioni', 2, 0.1), da: 1.3, durata: 0.7, gain: 0.3, rev: 0.25 });
  timp(mix, at('edizioni', 3, 0.4), { vel: 90, gain: 0.5 });
};
