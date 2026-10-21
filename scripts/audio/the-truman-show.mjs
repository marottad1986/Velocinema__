// Colonna sonora originale di The Truman Show: pianoforte, archi morbidi e celesta, discreta sotto la voce.
// Il tema (16 tempi, Do maggiore) è inventato qui: semplice e ottimista. Poi si incrina: modo minore, note
// mancanti, intonazione instabile e qualche nota sbagliata nei capitoli del sospetto; nero e burrascoso con
// padre e barca; infine torna pieno e luminoso (muro, inchino, finale). Nessun tema o pattern del film.
// Effetti agganciati ai sottotitoli (tempi in proporzione ai caratteri), come in La La Land.
import { put, rng, drum, thunder, wind, metalThud, glassCrash, rainHiss, radioStatic, doorCreak, hollowBonk, applause, channelClick } from './synth.mjs';
import { loadFilm, timeline } from './film.mjs';

const TAU = Math.PI * 2;
const SR = 44100;
const mtof = (m, cents = 0) => 440 * 2 ** ((m - 69 + cents / 100) / 12);
const vamp = (v) => (v / 127) ** 1.6;

// ---------------------------------------------------------------- strumenti locali (via put)

/** Pianoforte: armoniche con decadimento più rapido in alto, martelletto morbido. */
const piano = (mix, m, { t, dur = 1.5, vel = 60, pan = 0, rev = 0.35, gain = 1, cents = 0 }) => {
  const f = mtof(m, cents);
  const tau = Math.max(0.5, 2.6 - m * 0.02) * Math.min(1.4, 0.6 + dur * 0.4);
  const len = Math.ceil((Math.min(dur, 4) + 0.5) * SR);
  const rel = 0.35;
  put(mix, t, len, (i) => {
    const x = i / SR;
    let s = 0;
    for (let h = 1; h <= 6; h++) {
      const fh = f * h * Math.sqrt(1 + 0.0004 * h * h);
      s += Math.sin(TAU * fh * x) * Math.exp(-x / (tau / (0.6 + h * 0.5))) / (h ** 1.15);
    }
    const hammer = Math.sin(TAU * f * 3 * x) * Math.exp(-x / 0.012) * 0.3;
    const env = Math.min(1, x / 0.003) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / rel));
    return (s + hammer) * env;
  }, { gain: gain * vamp(vel) * 0.55, pan, rev });
};

/** Celesta: sinusoide più parziali a campana, decadimento corto e brillante. */
const celesta = (mix, m, { t, dur = 1.8, vel = 50, pan = 0.25, rev = 0.55, gain = 1, cents = 0 }) => {
  const f = mtof(m, cents);
  put(mix, t, Math.ceil(dur * SR), (i) => {
    const x = i / SR;
    const s = Math.sin(TAU * f * x) * Math.exp(-x / (dur * 0.35)) + 0.3 * Math.sin(TAU * 2 * f * x) * Math.exp(-x / 0.35)
      + 0.18 * Math.sin(TAU * 5.4 * f * x) * Math.exp(-x / 0.1) + 0.06 * Math.sin(TAU * 8.9 * f * x) * Math.exp(-x / 0.04);
    return s * Math.min(1, x / 0.002) * Math.min(1, (dur - x) / 0.05);
  }, { gain: gain * vamp(vel) * 0.6, pan, rev });
};

/** Archi morbidi: tre seghe leggermente scordate, passa-basso, attacco lento e vibrato. */
const strings = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.6, gain = 1, det = 6, att = 0.9, bright = 3.5, seed = 1 }) => {
  const f = mtof(m);
  const r = rng(seed * 977 + Math.round(t * 1000) + m);
  const dets = [-det, 0, det].map((c) => f * 2 ** (c / 1200));
  const ph = dets.map(() => r());
  const vibPh = r() * 6;
  const rel = 1.2;
  const a = 1 - Math.exp((-TAU * f * bright) / SR);
  let lp = 0;
  put(mix, t, Math.ceil((dur + rel) * SR), (i) => {
    const x = i / SR;
    const vib = 1 + 0.003 * Math.sin(TAU * 5.1 * x + vibPh) * Math.min(1, x / 1.5);
    let s = 0;
    for (let k = 0; k < 3; k++) s += 2 * ((ph[k] + dets[k] * vib * x) % 1) - 1;
    lp += a * (s / 3 - lp);
    const env = Math.min(1, x / att) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / rel));
    return lp * env;
  }, { gain: gain * vamp(vel), pan, rev });
};

/** Bordone grave: sinusoide con seconda armonica, entra e esce lentamente. */
const drone = (mix, m, { t, dur, vel = 50, gain = 1, att = 1.5 }) => {
  const f = mtof(m);
  const rel = 1.5;
  put(mix, t, Math.ceil((dur + rel) * SR), (i) => {
    const x = i / SR;
    const env = Math.min(1, x / att) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / rel));
    return (Math.sin(TAU * f * x) + 0.4 * Math.sin(TAU * 2 * f * x + 0.5) + 0.15 * Math.sin(TAU * 3.01 * f * x)) * env * (1 + 0.15 * Math.sin(TAU * 0.3 * x));
  }, { gain: gain * vamp(vel), rev: 0.4 });
};

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
  for (let t = T.fuga + 2.4; t < T.barca - 0.3; t += 60 / 104 * (t > T.barca - 4 ? 0.5 : 1)) drum(mix, 'softkick', t, 30 + 12 * ((t - T.fuga) / (T.barca - T.fuga)), 7);

  // barca: tempesta; bordone, archi bassi, colpi sordi; solo alla fine ("Truman resiste") il tema risale
  sec(T.barca, C('barca', 5), { bpm: 60, mode: 'dark', keep: 0.12, mel: 38, oct: -12, lh: 54, lhp: 1, low: true, str: 46, sdet: 24, att: 0.6, cluster: true, drone: 52, det: 40, wrong: 0.25, vs: 1 });
  for (let t = C('barca', 2); t < C('barca', 5); t += 1.0) drum(mix, 'kick', t, 44, 9);
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
  // riflettore (frase 1, "cade un riflettore"): vetro che si rompe e colpo di metallo
  glassCrash(mix, T.riflettore + 2.2, 78); // impatto in Riflettore.tsx
  metalThud(mix, T.riflettore + 2.2, 62);
  // pioggia: scroscio dall'inizio della pioggia alla sua fine, che si allarga a tutti (frase 3) e si spegne a fine capitolo
  rainHiss(mix, T.pioggia + 0.2, T.radio - 0.1, { power: 0.5, fade: 1.2 });
  // radio: tre sfrigolii a frasi 0, 1, 2
  radioStatic(mix, C('radio', 0) + 0.3, 1.8, { vel: 56, whistle: 1700, seed: 61 });
  radioStatic(mix, C('radio', 1) + 0.1, 1.2, { vel: 46, whistle: 2300, seed: 62 });
  radioStatic(mix, C('radio', 2) + 0.1, 1.3, { vel: 42, whistle: 1300, seed: 63 });
  // padre: due tuoni (tempesta della frase 1, poi frase 4)
  thunder(mix, T.padre + 2.6, 0.7, 7); // lampi di Padre.tsx a 2,51 e 5,86 s
  thunder(mix, T.padre + 5.95, 0.5, 9);
  // barca: vento forte e due tuoni (frase 3 e frase 4)
  wind(mix, C('barca', 3), C('barca', 5) + 2, { power: 0.55, fade: 1.5, center: 480, seed: 17 });
  thunder(mix, T.barca + 7.9, 1, 11); // lampi di Barca.tsx a 7,82 e 8,9 s
  thunder(mix, T.barca + 9.0, 0.85, 13);
  // muro: toc vuoto quando la prua urta il cielo dipinto (frase 1); porta che si apre (frase 4)
  hollowBonk(mix, T.muro + 1.6, 72); // la prua buca il cielo (Muro.tsx)
  doorCreak(mix, T.muro + 6.7, 1.8, { vel: 52 }); // si accende USCITA
  // inchino: applauso morbido che cresce (frase 4); scatto di canale (frase 5)
  applause(mix, C('inchino', 4) + 0.2, Math.min(5, C('inchino', 5) - C('inchino', 4) + 0.6), { vel: 44 });
  channelClick(mix, T.inchino + 8.3, 62); // i televisori passano alla neve (Inchino.tsx)
};
