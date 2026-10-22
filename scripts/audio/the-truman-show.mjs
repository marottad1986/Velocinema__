// Colonna sonora originale di The Truman Show: pianoforte, archi morbidi e celesta, discreta sotto la voce.
// Il tema (16 tempi, Do maggiore) è inventato qui: semplice e ottimista. Poi si incrina: modo minore, note
// mancanti, intonazione instabile e qualche nota sbagliata nei capitoli del sospetto; nero e burrascoso con
// padre e barca; infine torna pieno e luminoso (muro, inchino, finale). Nessun tema o pattern del film.
// Strumenti campionati (VSCO-2 CE); effetti registrati (archivio CC0, scripts/audio/effetti.mjs) agganciati ai
// sottotitoli (tempi in proporzione ai caratteri), come in La La Land.
import { rng, channelClick } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte', 'glockenspiel', 'violini', 'viole', 'celli', 'contrabbasso', 'grancassa'];
export const effetti = ['vetro_lastra', 'metallo_schianto', 'pioggia_dura', 'radio_sintonia', 'tuono_classico', 'tuono_secco', 'tuono_forte',
  'tuono_breve', 'vento_invernale', 'onde', 'colpi_cavi', 'porta_cigolio', 'applauso'];
/** Sala media e calda. */
export const sala = { rt60: 2.2, brillo: 7000, predelay: 0.025, wet: 0.5 };

// ---------------------------------------------------------------- strumenti (campionati; firme come nella versione sintetica)

/** Pianoforte verticale; cents = intonazione instabile del mondo che si incrina. */
const piano = (mix, m, { t, dur = 1.5, vel = 60, pan = 0, rev = 0.35, gain = 1, cents = 0 }) =>
  suona(mix, 'pianoforte', m, { t, dur: Math.min(dur, 4), vel: vel * 1.1, pan, rev, gain: gain * 6, cents, release: 0.45 });

/** Celesta: glockenspiel morbido, un'ottava sotto (il glockenspiel suona già due ottave sopra lo scritto). */
const celesta = (mix, m, { t, dur = 1.8, vel = 50, pan = 0.25, rev = 0.55, gain = 1, cents = 0 }) =>
  suona(mix, 'glockenspiel', m - 12, { t, dur, vel: vel * 0.9, pan, rev, gain: gain * 0.55, cents, release: 1.2 });

/** Archi: det (cent) diventa una stonatura deterministica della sezione; att = attacco. */
const strings = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.6, gain = 1, det = 6, att = 0.9, seed = 1 }) => {
  const r = rng(seed * 977 + Math.round(t * 1000) + m);
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev, gain: gain * 1.7, attack: att, release: 1.2, cents: det > 8 ? (r() * 2 - 1) * det : 0, seed });
};

/** Bordone grave: contrabbasso tenuto (un'ottava sopra se scende sotto il Mi grave). */
const drone = (mix, m, { t, dur, vel = 50, gain = 1, att = 1.5 }) =>
  suona(mix, 'contrabbasso', m < 28 ? m + 12 : m, { t, dur, vel: vel + 10, gain: gain * 1.8, attack: att, release: 1.5, rev: 0.4 });

// ---------------------------------------------------------------- materiale musicale

// tema: [tempo, nota MIDI, durata in tempi]; 4 battute in 4/4
const THEME = [
  [0, 76, 1], [1, 79, 1], [2, 81, 1.5], [3.5, 79, 0.5],
  [4, 76, 2], [6, 74, 1], [7, 72, 1],
  [8, 74, 1], [9, 76, 1], [10, 79, 1.5], [11.5, 81, 0.5],
  [12, 84, 2], [14, 83, 1], [15, 79, 1],
];
// accordi per battuta: radice (classe di altezza) e intervalli
const CH_MAJ = [{ pc: 0, iv: [0, 4, 7] }, { pc: 5, iv: [0, 4, 7] }, { pc: 9, iv: [0, 3, 7] }, { pc: 7, iv: [0, 4, 7] }];
const CH_MIN = [{ pc: 0, iv: [0, 3, 7] }, { pc: 8, iv: [0, 4, 7] }, { pc: 5, iv: [0, 3, 7] }, { pc: 7, iv: [0, 4, 7] }];
// modo minore: mi → mi bemolle, la → la bemolle
const toMinor = (m) => (m % 12 === 4 || m % 12 === 9 ? m - 1 : m);

export default (mix, T) => {
  const { segments } = timeline(loadFilm('the-truman-show'));
  const seg = Object.fromEntries(segments.map((s) => [s.id, s]));
  /** Secondo d'inizio della frase n-esima del capitolo (tempi in proporzione ai caratteri). */
  const cue = (id, n) => {
    const s = seg[id];
    const tot = s.testo.reduce((a, x) => a + x.length, 0);
    let acc = 0;
    for (let k = 0; k < n; k++) acc += s.testo[k].length;
    return s.start + (s.dur * acc) / tot;
  };

  const BODY = 0.78; // il corpo musicale resta sotto agli effetti
  let sid = 0;

  /**
   * Suona il tema ciclicamente da `from` a `to`.
   * mode: 'maj' | 'min' | 'dark'. keep: probabilità di ogni nota. det: cent di instabilità. wrong: probabilità di nota sbagliata.
   * lh: pianoforte mano sinistra. cel: celesta in raddoppio. str: archi (livello). cluster: nota dissonante negli archi.
   * low: archi e basso un'ottava sotto. tr: tremolo di archi (tipo pulsazione). big: ottave al piano e raddoppi larghi.
   */
  const sec = (from, to, o) => {
    const beat = 60 / o.bpm, bar = 4 * beat, loop = 16 * beat;
    const R = rng(4000 + sid++ * 131);
    const minor = o.mode !== 'maj';
    const chords = minor ? CH_MIN : CH_MAJ;
    const vs = o.vs ?? 1;
    for (let L = from; L < to - 0.2; L += loop) {
      for (let b = 0; b < 4; b++) {
        const t = L + b * bar;
        if (t >= to - 0.3) break;
        const left = to - t;
        const ch = chords[b];
        const base = 48 + ch.pc - (o.low ? 12 : 0);
        if (o.str) {
          const notes = [...ch.iv.map((iv) => base + iv), base + 12 + ch.iv[2]];
          if (o.cluster) notes.push(base + 12 + 1); // seconda minore sopra la fondamentale: crepa
          notes.forEach((m, j) => strings(mix, m, {
            t: t + j * 0.04, dur: Math.min(bar * 1.05, left), vel: o.str * vs, gain: BODY * 0.8,
            pan: (j - 1.5) * 0.3, det: o.sdet ?? 6, att: o.att ?? 0.9, bright: o.mode === 'dark' ? 2.2 : 3.5, seed: j + 1,
          }));
        }
        if (o.lh) {
          const root = 36 + ch.pc - (o.low ? 12 : 0);
          if (R() < (o.lhp ?? 1)) piano(mix, root, { t, dur: beat * 3, vel: o.lh * vs, gain: BODY, rev: 0.4, pan: -0.15 });
          if (R() < (o.lhp ?? 1) * 0.8 && left > 2.5 * beat) piano(mix, root + ch.iv[2] + 12, { t: t + 2 * beat, dur: beat * 2, vel: o.lh * 0.8 * vs, gain: BODY, rev: 0.4, pan: -0.1 });
        }
        if (o.mode === 'dark') drone(mix, 24 + ch.pc, { t, dur: Math.min(bar * 1.05, left), vel: o.drone ?? 40, gain: BODY * 0.7 });
      }
      for (const [b, m0, d] of THEME) {
        if (!o.mel) break;
        const keep = R() < o.keep;
        const wrong = R() < (o.wrong ?? 0);
        const cents = (R() * 2 - 1) * (o.det ?? 0);
        const t = L + b * beat;
        if (!keep || t >= to - 0.15) continue;
        let m = (minor ? toMinor(m0) : m0) + (o.oct ?? 0);
        if (wrong) m += R() < 0.5 ? 1 : -1;
        const dur = Math.min(d * beat * (o.leg ?? 1.1), to - t);
        const vel = o.mel * (0.9 + R() * 0.2) * vs;
        piano(mix, m, { t, dur, vel, gain: BODY * 1.25, cents, pan: 0.05, rev: 0.4 });
        if (o.big) piano(mix, m - 12, { t, dur, vel: vel * 0.7, gain: BODY * 1.1, cents, pan: -0.1, rev: 0.4 });
        if (o.cel) celesta(mix, m + 12, { t: t + 0.005, dur: Math.min(2.4, d * beat + 1.2), vel: o.cel * vs, gain: BODY * 1.1, cents: cents * (o.celdet ?? 1.6) + (o.celoff ?? 0), pan: 0.3 });
      }
    }
  };

  // ---- sezioni (tempi dai capitoli del JSON)
  const C = (id, n) => cue(id, n);

  // copertina + seahaven: tema luminoso, pianoforte e celesta, archi leggeri
  sec(0, T.riflettore, { bpm: 86, mode: 'maj', keep: 1, mel: 54, lh: 46, cel: 44, str: 34, oct: 0, vs: 1, lhp: 1 });

  // riflettore: cielo sereno, poi il vetro cade e il tema si incrina
  sec(T.riflettore, C('riflettore', 1) + 0.6, { bpm: 86, mode: 'maj', keep: 0.85, mel: 52, lh: 42, cel: 40, str: 30 });
  sec(C('riflettore', 1) + 0.6, T.pioggia, { bpm: 66, mode: 'min', keep: 0.5, mel: 44, lh: 36, lhp: 0.7, cel: 38, str: 30, det: 28, celdet: 2.2, wrong: 0.15, cluster: true, sdet: 14, vs: 1 });

  // pioggia: sparso e freddo; si allarga la pioggia ("corretto l'errore"): maggiore finto, quasi sereno
  sec(T.pioggia, C('pioggia', 3), { bpm: 64, mode: 'min', keep: 0.5, mel: 40, lh: 34, lhp: 0.6, cel: 34, str: 26, det: 18, wrong: 0.08, vs: 1 });
  sec(C('pioggia', 3), T.radio, { bpm: 72, mode: 'maj', keep: 0.65, mel: 42, lh: 34, cel: 38, str: 28, det: 12, celoff: 18, wrong: 0.05, vs: 1 });

  // radio: tentennante; "la musica torna" a frase 3, poi di nuovo sospetto
  sec(T.radio, C('radio', 3), { bpm: 76, mode: 'min', keep: 0.45, mel: 40, lh: 34, lhp: 0.6, cel: 34, str: 28, det: 30, celdet: 2.2, wrong: 0.2, cluster: true, sdet: 16 });
  sec(C('radio', 3), C('radio', 4), { bpm: 90, mode: 'maj', keep: 0.9, mel: 52, lh: 42, cel: 44, str: 30, det: 4 });
  sec(C('radio', 4), T.padre, { bpm: 76, mode: 'min', keep: 0.4, mel: 40, lh: 34, lhp: 0.6, cel: 32, str: 30, det: 30, celdet: 2.4, wrong: 0.2, cluster: true, sdet: 16 });

  // padre: buio, bordone e archi gravi, pianoforte profondo; tema quasi sparito
  sec(T.padre, T.sylvia, { bpm: 54, mode: 'dark', keep: 0.18, mel: 34, oct: -12, lh: 44, lhp: 0.85, low: true, str: 40, sdet: 20, att: 1.4, cluster: true, drone: 46, det: 40, wrong: 0.2, vs: 1 });

  // sylvia: un ricordo caldo e dolce, tema lento ma maggiore, con malinconia
  sec(T.sylvia, T.figi, { bpm: 66, mode: 'maj', keep: 0.75, mel: 44, lh: 38, cel: 40, str: 36, att: 1.2, det: 2, leg: 1.3 });

  // figi: sospetto, sparso; si spezza ancora di più sul muro con l'aereo colpito (frase 3)
  sec(T.figi, C('figi', 3), { bpm: 78, mode: 'min', keep: 0.45, mel: 42, lh: 36, lhp: 0.7, cel: 36, str: 30, det: 26, wrong: 0.18, cluster: true, sdet: 14 });
  sec(C('figi', 3), T.fuga, { bpm: 80, mode: 'min', keep: 0.35, mel: 44, lh: 40, cel: 36, str: 36, det: 36, celdet: 2.4, wrong: 0.28, cluster: true, sdet: 20, att: 0.5 });

  // fuga: teso, più mosso, archi con cluster e pulsazione grave di pianoforte
  sec(T.fuga, T.barca, { bpm: 104, mode: 'min', keep: 0.35, mel: 46, lh: 46, lhp: 1, cel: 32, str: 38, det: 34, wrong: 0.3, cluster: true, sdet: 22, att: 0.5 });
  // pulsazione sorda: colpi di cassa leggera sul grave, a battere nervoso, stringendo verso la barca
  for (let t = T.fuga + 2.4; t < T.barca - 0.3; t += 60 / 104 * (t > T.barca - 4 ? 0.5 : 1)) colpo(mix, 'grancassa', 'bdrum_pp', { t, vel: 70 + 50 * ((t - T.fuga) / (T.barca - T.fuga)), gain: 0.7, rev: 0.3, seed: Math.round(t * 10) });

  // barca: tempesta; bordone, archi bassi, colpi sordi; solo alla fine ("Truman resiste") il tema risale
  sec(T.barca, C('barca', 5), { bpm: 60, mode: 'dark', keep: 0.12, mel: 38, oct: -12, lh: 54, lhp: 1, low: true, str: 46, sdet: 24, att: 0.6, cluster: true, drone: 52, det: 40, wrong: 0.25, vs: 1 });
  for (let t = C('barca', 2); t < C('barca', 5); t += 1.0) colpo(mix, 'grancassa', 'bdrum_mp', { t, vel: 100, gain: 0.8, rev: 0.35, seed: Math.round(t * 10) });
  sec(C('barca', 5), T.muro, { bpm: 70, mode: 'maj', keep: 0.7, mel: 48, lh: 44, cel: 40, str: 46, att: 0.6, det: 6, vs: 1 });

  // muro: calma, bolla di speranza; si allarga fino alla voce dal cielo
  sec(T.muro, C('muro', 2), { bpm: 72, mode: 'maj', keep: 0.6, mel: 40, lh: 34, cel: 38, str: 30, att: 1.2 });
  sec(C('muro', 2), C('muro', 3), { bpm: 70, mode: 'min', keep: 0.4, mel: 34, lh: 30, lhp: 0.5, cel: 32, str: 28, det: 12, cluster: true, sdet: 12 });
  sec(C('muro', 3), C('muro', 5), { bpm: 84, mode: 'maj', keep: 0.85, mel: 48, lh: 42, cel: 42, str: 42, att: 0.6, big: true });
  sec(C('muro', 5), T.inchino, { bpm: 76, mode: 'maj', keep: 0.9, mel: 52, lh: 46, cel: 46, str: 52, att: 0.5, big: true });

  // inchino: finale luminoso e ampio, tema pieno con raddoppi
  sec(T.inchino, C('inchino', 2), { bpm: 78, mode: 'maj', keep: 0.9, mel: 52, lh: 46, cel: 46, str: 50, att: 0.6, big: true });
  sec(C('inchino', 2), C('inchino', 5), { bpm: 90, mode: 'maj', keep: 1, mel: 60, lh: 52, cel: 52, str: 58, att: 0.5, big: true, oct: 0 });
  sec(C('inchino', 5), T.finale, { bpm: 90, mode: 'maj', keep: 0.5, mel: 40, lh: 34, cel: 40, str: 36, att: 0.5 });

  // finale: accordo di Do maggiore ampio, che sale e si scioglie
  const F = T.finale;
  [36, 43, 48, 52, 55, 59, 64, 67].forEach((m, j) => piano(mix, m, { t: F + j * 0.06, dur: 3.2, vel: 52, gain: BODY * 1.2, pan: -0.3 + j * 0.09, rev: 0.5 }));
  [48, 55, 59, 64, 67, 72].forEach((m, j) => strings(mix, m, { t: F, dur: 3, vel: 58, gain: BODY * 0.9, pan: (j - 2.5) * 0.25, det: 6, att: 0.4, seed: 20 + j }));
  [84, 88, 91, 95, 96].forEach((m, j) => celesta(mix, m, { t: F + 0.3 + j * 0.2, dur: 3.2, vel: 46, gain: BODY * 1.2, pan: -0.2 + j * 0.12, rev: 0.6 }));

  // ---------------------------------------------------------------- effetti sonori
  // riflettore (frase 1, "cade un riflettore"): lastra di vetro e schianto di metallo (impatto in Riflettore.tsx)
  clip(mix, 'vetro_lastra', { t: T.riflettore + 2.2 - 0.25, da: 1.85, durata: 4, gain: 0.4, fadeOut: 1.5, rev: 0.3 });
  clip(mix, 'metallo_schianto', { t: T.riflettore + 2.2 - 0.31, da: 0.05, durata: 1.4, gain: 0.4, fadeOut: 0.5, rev: 0.3, pan: 0.1 });
  // pioggia: scroscio che cade solo su Truman, si allarga a tutti (frase 3) e si spegne a fine capitolo
  clip(mix, 'pioggia_dura', { t: T.pioggia + 0.2, da: 5.4, durata: T.radio - 0.3 - T.pioggia, gain: 1.8, fadeIn: 1.2, fadeOut: 1.2, largo: 3, rev: 0.12 });
  // radio: tre sfrigolii di sintonia a frasi 0, 1, 2
  clip(mix, 'radio_sintonia', { t: C('radio', 0) + 0.3, da: 1.5, durata: 1.8, gain: 0.45, fadeIn: 0.03, fadeOut: 0.15, pan: -0.15, rev: 0.12 });
  clip(mix, 'radio_sintonia', { t: C('radio', 1) + 0.1, da: 15.6, durata: 1.2, gain: 0.35, fadeIn: 0.03, fadeOut: 0.15, pan: -0.15, rev: 0.12 });
  clip(mix, 'radio_sintonia', { t: C('radio', 2) + 0.1, da: 20.75, durata: 1.3, gain: 0.32, fadeIn: 0.03, fadeOut: 0.15, pan: -0.15, rev: 0.12 });
  /** Tuono dopo un lampo della scena a t. */
  const tuono = (t, id, da, durata, gain) => clip(mix, id, { t: t + 0.15, da, durata, gain, fadeIn: 0.03, fadeOut: 1.2, rev: 0.35, pan: 0.1 });
  // padre: due tuoni (lampi di Padre.tsx a 2,51 e 5,86 s)
  tuono(T.padre + 2.5, 'tuono_classico', 0.98, 3.4, 0.35);
  tuono(T.padre + 5.85, 'tuono_secco', 0.78, 4, 0.3);
  // barca: vento forte, onde e due tuoni (lampi di Barca.tsx a 7,82 e 8,9 s)
  clip(mix, 'vento_invernale', { t: C('barca', 3), da: 3, durata: C('barca', 5) + 2 - C('barca', 3), gain: 0.3, fadeIn: 1.5, fadeOut: 1.5, largo: 4, rev: 0.1 });
  clip(mix, 'onde', { t: T.barca, da: 2, durata: C('barca', 5) + 2 - T.barca, gain: 0.3, fadeIn: 1.5, fadeOut: 1.5, largo: 3, rev: 0.1 });
  tuono(T.barca + 7.82, 'tuono_forte', 0.55, 4, 0.9);
  tuono(T.barca + 8.9, 'tuono_breve', 1.47, 2.6, 0.7);
  // muro: colpo vuoto quando la prua urta il cielo dipinto; porta che si apre (si accende USCITA, Muro.tsx)
  clip(mix, 'colpi_cavi', { t: T.muro + 1.6 - 0.01, da: 3.4, durata: 0.6, gain: 0.8, fadeOut: 0.2, rev: 0.45 });
  clip(mix, 'porta_cigolio', { t: T.muro + 6.7, da: 10.68, durata: 1.8, gain: 0.4, fadeOut: 0.4, rev: 0.3, pan: 0.3 });
  // inchino: applauso che cresce (frase 4); scatto di canale (i televisori passano alla neve, Inchino.tsx)
  const ta = C('inchino', 4) + 0.2, da = Math.min(5, C('inchino', 5) - C('inchino', 4) + 0.6);
  clip(mix, 'applauso', { t: ta, da: 3, durata: da, gain: 0.6, fadeIn: da * 0.6, fadeOut: da * 0.35, largo: 2, rev: 0.3 });
  channelClick(mix, T.inchino + 8.3, 62);
};
