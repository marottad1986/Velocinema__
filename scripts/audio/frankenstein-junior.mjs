// Colonna sonora originale di Frankenstein Junior: valzer gotico per violino solo in Re minore (il "violino che
// calma la Creatura"), organo da castello, pizzicati in tre tempi, timpani per i temporali e un breve intermezzo
// swing con tip tap per lo spettacolo. Tema e armonie inventati qui; nessun brano o tema del film.
// Nel lieto fine il valzer passa in Re maggiore. Strumenti campionati (VSCO-2 CE); effetti registrati
// (archivio CC0, scripts/audio/effetti.mjs) agganciati agli eventi delle scene in src/scenes/frankenstein-junior/.
import { rng, drum, chalk } from './synth.mjs';
import { suona, colpo, crescendo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['violino_solo', 'organo', 'organo_pieno', 'violini_pizz', 'celli_pizz', 'contrabbasso_pizz', 'timpani', 'glockenspiel', 'gong', 'piatto_sospeso'];
export const effetti = ['tuono_classico', 'tuono_secco', 'tuono_forte', 'tuono_breve', 'scariche', 'scintille', 'ronzio_tesla', 'pioggia_vento',
  'telo', 'colpi_legno', 'vento_leggero', 'vento_raffiche', 'carro', 'lupo', 'colpi_cavi', 'nitriti', 'nitriti_paura', 'legno_cigolio', 'porta_sbatte',
  'vetri', 'metallo_colpi', 'fuoco', 'torcia', 'ceramica', 'fiammifero', 'applauso_breve', 'catene', 'sacchi', 'campane_festa'];
/** Sala del castello: pietra, coda lunga e scura. */
export const sala = { rt60: 2.9, brillo: 5000, predelay: 0.03, wet: 0.55 };

/** Un solo tempo per tutto il film (valzer a 104, swing dello spettacolo sugli stessi battiti). */
const BPM = 104;
const GRID = (3 * 60) / BPM;
const snap = (t) => Math.round(t / GRID) * GRID;

// ---------------------------------------------------------------- strumenti (campionati; firme come nella versione sintetica)

/** Violino solista con vibrato; slide non più usato (il campione ha già il suo attacco d'arco). */
const violin = (mix, m, { t, dur, vel = 60, pan = 0.15, rev = 0.45, gain = 1, seed = 1 }) =>
  suona(mix, 'violino_solo', m, { t, dur, vel: vel * 1.3, pan, rev, gain: gain * 1.2, attack: 0.03, release: 0.3, seed });

/** Organo da castello: registri dolci, da vel 50 il ripieno. */
const organ = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.6, gain = 1 }) =>
  suona(mix, vel >= 50 ? 'organo_pieno' : 'organo', m, { t, dur, vel, pan, rev, gain: gain * (vel >= 50 ? 0.6 : 1.2), attack: 0.05, release: 0.6 });

/** Pizzicato: contrabbasso, celli o violini secondo l'altezza. */
const pizz = (mix, m, { t, vel = 50, pan = 0, gain = 1 }) =>
  suona(mix, m < 40 ? 'contrabbasso_pizz' : m < 55 ? 'celli_pizz' : 'violini_pizz', m, { t, dur: 0.5, vel: vel * 1.5, pan, rev: 0.35, gain: gain * 1.8, release: 0.3 });

/** Timpano intonato (VCSL), un'ottava sopra la nota dello spartito (registro reale dei timpani). */
const timp = (mix, m, { t, vel = 60, gain = 1 }) =>
  suona(mix, 'timpani', m + 12, { t, dur: 1.4, vel: vel * 1.6, gain: gain * 1.0, rev: 0.45, release: 0.6, seed: m });

/** Campanella: glockenspiel. */
const bell = (mix, m, { t, vel = 50, pan = 0, gain = 1 }) =>
  suona(mix, 'glockenspiel', m - 12, { t, dur: 2.2, vel: vel * 1.3, pan, rev: 0.6, gain: gain * 0.45, release: 1.2 });

// ---------------------------------------------------------------- materiale musicale

// tema del valzer (Re minore, 3/4): [tempo, nota MIDI, durata in tempi]; 8 battute
const THEME = [
  [0, 69, 1], [1, 74, 1], [2, 77, 1],
  [3, 76, 2], [5, 74, 1],
  [6, 73, 1], [7, 76, 1], [8, 81, 1],
  [9, 79, 2], [11, 77, 1],
  [12, 77, 1], [13, 76, 1], [14, 74, 1],
  [15, 82, 1.5], [16.5, 81, 0.5], [17, 79, 1],
  [18, 77, 1], [19, 76, 1], [20, 73, 1],
  [21, 74, 3],
];
// accordi per battuta: radice (classe di altezza) e intervalli
const CH_MIN = [[2, [0, 3, 7]], [7, [0, 3, 7]], [9, [0, 4, 7]], [2, [0, 3, 7]], [10, [0, 4, 7]], [7, [0, 3, 7]], [9, [0, 4, 7]], [2, [0, 3, 7]]];
const CH_MAJ = [[2, [0, 4, 7]], [7, [0, 4, 7]], [9, [0, 4, 7]], [2, [0, 4, 7]], [11, [0, 3, 7]], [4, [0, 3, 7]], [9, [0, 4, 7]], [2, [0, 4, 7]]];
// Re maggiore: fa → fa diesis, si bemolle → si
const toMajor = (m) => (m % 12 === 5 || m % 12 === 10 ? m + 1 : m);

export default (mix, T) => {
  const film = loadFilm('frankenstein-junior');
  const { segments } = timeline(film);
  const segs = Object.fromEntries(segments.map((s) => [s.id, s]));
  /** Inizio assoluto della frase n del capitolo, come subtitleTimes in ChapterOverlay.tsx. */
  const cue = (id, n) => {
    const s = segs[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let cur = 0.15;
    for (let k = 0; k < n; k++) cur += (w[k] / tot) * (s.dur - 0.35);
    return s.start + cur;
  };
  const C = cue;
  const BODY = 0.8;
  let sid = 0;

  /**
   * Valzer ciclico da `from` a `to` (agganciati alla battuta più vicina della griglia a 104 bpm).
   * vln: violino (livello) · keep: probabilità di ogni nota · oct: trasposizione · major: Re maggiore
   * oom: pizzicato in tre tempi (livello) · org: organo sostenuto (livello) · timp: timpano sul primo tempo
   */
  const waltz = (from, to, o) => {
    from = snap(from); to = snap(to);
    const beat = 60 / BPM, bar = 3 * beat, loop = 24 * beat;
    const R = rng(7000 + sid++ * 97);
    const chords = o.major ? CH_MAJ : CH_MIN;
    for (let L0 = from; L0 < to - 0.2; L0 += loop) {
      for (let b = 0; b < 8; b++) {
        const t = L0 + b * bar;
        if (t >= to - 0.25) break;
        const left = to - t;
        const [pc, iv] = chords[b];
        const root = 38 + pc;
        if (o.oom) {
          pizz(mix, root - 12, { t, vel: o.oom, gain: BODY, pan: -0.2 });
          [1, 2].forEach((k) => { if (k * beat < left - 0.1) iv.forEach((v, j) => pizz(mix, root + 12 + v, { t: t + k * beat, vel: o.oom * 0.7, gain: BODY * 0.7, pan: -0.1 + j * 0.15 })); });
        }
        if (o.org) iv.concat([12]).forEach((v, j) => organ(mix, root + v + (o.orgOct ?? 0), { t, dur: Math.min(bar * 1.02, left), vel: o.org, gain: BODY * 0.7, pan: (j - 1.5) * 0.25 }));
        if (o.timp && (b % 2 === 0 || o.timpAll)) timp(mix, 26 + (pc % 12 > 7 ? pc - 12 : pc), { t, vel: o.timp, gain: BODY });
      }
      if (!o.vln) continue;
      for (const [b, m0, d] of THEME) {
        const t = L0 + b * beat;
        if (t >= to - 0.2 || R() > o.keep) continue;
        const m = (o.major ? toMajor(m0) : m0) + (o.oct ?? 0);
        R(); // (era la scelta dello scivolando: si consuma comunque per non cambiare le note che seguono)
        violin(mix, m, { t, dur: Math.min(d * beat * 1.05, to - t), vel: o.vln * (0.9 + R() * 0.2), gain: BODY * 1.2, seed: sid });
      }
    }
  };

  /** Swing per lo spettacolo: contrabbasso camminante, spazzole e tip tap. */
  const swing = (from, to, { vel = 46 } = {}) => {
    from = snap(from); to = snap(to);
    const beat = 60 / BPM;
    const walk = [38, 41, 45, 46, 43, 46, 50, 48, 45, 41, 43, 44, 45, 44, 43, 41];
    let k = 0;
    for (let t = from; t < to - 0.1; t += beat, k++) {
      pizz(mix, walk[k % walk.length] - 12, { t, vel, gain: BODY * 1.2, pan: -0.2 });
      drum(mix, 'brushtap', t, vel * 0.8, 3);
      if (k % 2 === 1) drum(mix, 'swish', t, vel * 0.6, 5);
      drum(mix, 'sidestick', t + beat * 0.66, vel * 0.55, 9 + k);
      if (k % 4 === 3) [74, 77, 81].forEach((m, j) => organ(mix, m, { t: t + beat * 0.66, dur: 0.18, vel: vel * 0.8, gain: BODY * 0.5, pan: (j - 1) * 0.3, rev: 0.3 }));
    }
  };

  // ---- sezioni (tempi dai capitoli del JSON)
  // copertina: organo e timpani nel temporale
  waltz(0, T.lezione, { org: 46, timp: 58, timpAll: true });
  // lezione: valzer leggero e un po' pedante, pizzicati e violino
  waltz(T.lezione, T.stazione, { vln: 48, keep: 0.85, oom: 44 });
  // stazione: notte in montagna, violino sparso e organo basso
  waltz(T.stazione, T.castello, { vln: 40, keep: 0.6, org: 30, orgOct: -12, oom: 30 });
  // castello: tensione da film horror, organo e timpani; poi il violino "da solo" (cue 4)
  waltz(T.castello, C('castello', 4), { org: 40, timp: 50, oom: 28 });
  waltz(C('castello', 4) - 0.3, T.libreria, { vln: 52, keep: 1 });
  // libreria: mistero, poi entusiasmo crescente fino a "Si può fare!"
  waltz(T.libreria, C('libreria', 3), { org: 34, oom: 34, vln: 38, keep: 0.5 });
  waltz(C('libreria', 3), T.cervello, { org: 40, oom: 44, vln: 52, keep: 1, timp: 46 });
  // cervello: furtivo, pizzicati e organo grave
  waltz(T.cervello, T.creazione, { oom: 42, org: 30, orgOct: -12, vln: 36, keep: 0.4 });
  // creazione: organo pieno e timpani; silenzio quando la corrente muore; poi tutto a piena forza
  waltz(T.creazione, C('creazione', 3) + 0.5, { org: 50, timp: 58, timpAll: true, oom: 40 });
  waltz(C('creazione', 5), T.eremita, { org: 56, timp: 62, timpAll: true, vln: 58, keep: 1, oom: 46 });
  // eremita: il violino che calma (tema intero, dolce); poi pizzicati comici
  waltz(T.eremita, C('eremita', 3), { vln: 50, keep: 1, org: 26 });
  waltz(C('eremita', 3), T.teatro, { oom: 46, vln: 40, keep: 0.6 });
  // teatro: il violino porta in scena, poi swing con tip tap; l'esplosione interrompe tutto
  waltz(T.teatro, C('teatro', 2), { vln: 46, keep: 0.9, oom: 36 });
  swing(C('teatro', 2), C('teatro', 4), { vel: 50 });
  waltz(C('teatro', 4) + 0.4, T.elizabeth, { org: 44, timp: 56, timpAll: true });
  // elizabeth: valzer elegante, poi la tempesta; quando canta il tema torna in maggiore
  waltz(T.elizabeth, C('elizabeth', 2), { oom: 40, vln: 44, keep: 0.8 });
  waltz(C('elizabeth', 2), C('elizabeth', 3) + 0.3, { org: 46, timp: 56, timpAll: true });
  waltz(C('elizabeth', 3) + 0.3, T.assedio, { major: true, vln: 54, keep: 1, org: 30, oct: 12 });
  // assedio: marcia minacciosa di timpani, violino dalla torre, poi calma
  waltz(T.assedio, C('assedio', 3), { org: 44, timp: 60, timpAll: true, vln: 46, keep: 0.8 });
  waltz(C('assedio', 3), T.nozze, { vln: 42, keep: 0.7, org: 28, major: true });
  // nozze: valzer in Re maggiore, pieno e luminoso
  waltz(T.nozze, T.finale, { major: true, vln: 56, keep: 1, oom: 46, org: 30 });

  // finale: accordo di Re maggiore all'organo, violino che sale e campanelle
  const F = snap(T.finale); // sulla griglia, dove finisce l'ultima sezione
  [38, 50, 54, 57, 62, 66].forEach((m, j) => organ(mix, m, { t: F, dur: 3.3, vel: 50, gain: BODY * 0.8, pan: (j - 2.5) * 0.25 }));
  violin(mix, 74, { t: F + 0.1, dur: 1, vel: 54, gain: BODY * 1.2 });
  violin(mix, 78, { t: F + 1.1, dur: 1, vel: 54, gain: BODY * 1.2 });
  violin(mix, 81, { t: F + 2.1, dur: 1.6, vel: 58, gain: BODY * 1.2 });
  [86, 90, 93].forEach((m, j) => bell(mix, m, { t: F + 0.4 + j * 0.3, vel: 44, pan: -0.3 + j * 0.3 }));

  // ---------------------------------------------------------------- effetti sonori (tempi delle scene)
  /** Tuono dopo il lampo a t: prese diverse a rotazione. */
  const TUONI = [['tuono_classico', 0.98, 6], ['tuono_secco', 0.78, 5.5], ['tuono_forte', 0.55, 5], ['tuono_breve', 1.47, 2.6], ['tuono_forte', 7.45, 4.8]];
  let nt = 0;
  const tuono = (t, power, lp = 0) => {
    const [id, da, durata] = TUONI[nt++ % TUONI.length];
    clip(mix, id, { t: t + 0.15, da, durata, gain: 0.75 * power, lp, fadeIn: 0.03, fadeOut: 1.2, rev: 0.35, pan: 0.1 });
  };
  /** Tappeto stereo (pioggia, vento, fuoco, ronzio). */
  const bed = (id, t0, t1, da, gain, o = {}) => clip(mix, id, { t: t0, da, durata: t1 - t0, gain, fadeIn: 0.8, fadeOut: 0.8, largo: 3, rev: 0.12, ...o });
  /** Scarica elettrica breve (presa di scariche). */
  const scarica = (t0, t1, da, gain) => clip(mix, 'scariche', { t: t0, da, durata: t1 - t0, gain, fadeIn: 0.05, fadeOut: 0.3, rev: 0.25 });

  // copertina: due fulmini sul parafulmine (Locandina.tsx a 1,1 e 2,6 s)
  tuono(1.1, 0.8); tuono(2.6, 0.6);
  scarica(1.1, 1.7, 11.24, 0.5);
  bed('pioggia_vento', 0, T.lezione + 0.3, 1, 0.12);
  // lezione: gesso che scrive FRANKENSTIN, ritratto che gira, lettera che arriva
  for (let t = C('lezione', 2) - 0.2; t < C('lezione', 2) + 1.2; t += 0.09) chalk(mix, t, 36);
  chalk(mix, C('lezione', 2) + 1.3, 44); chalk(mix, C('lezione', 2) + 1.7, 44);
  clip(mix, 'telo', { t: C('lezione', 3) + 0.3 - 0.1, da: 4.57, durata: 0.8, gain: 0.25, fadeOut: 0.2, rev: 0.2 });
  clip(mix, 'telo', { t: C('lezione', 4) - 0.25, da: 12.85, durata: 0.8, gain: 0.25, fadeOut: 0.2, rev: 0.2, pan: 0.3 });
  clip(mix, 'colpi_legno', { t: C('lezione', 4) + 0.7, da: 5.18, durata: 0.15, gain: 0.25, rev: 0.25 });
  // stazione: vento, sobbalzo del carro, ululato
  bed('vento_leggero', T.stazione, T.castello, 0.5, 0.12, { fadeIn: 1.2, fadeOut: 1.2 });
  clip(mix, 'carro', { t: C('stazione', 3) + 0.05 - 0.55, da: 11.54, durata: 1.2, gain: 0.45, fadeOut: 0.4, rev: 0.2 });
  clip(mix, 'lupo', { t: C('stazione', 4) - 0.1, da: 1.25, durata: 3.2, gain: 0.45, fadeOut: 1, pan: 0.4, rev: 0.4 });
  // castello: due colpi di batacchio, tuoni e nitriti, pioggia
  clip(mix, 'colpi_cavi', { t: T.castello + 0.45 - 0.01, da: 0.5, durata: 0.5, gain: 0.7, fadeOut: 0.15, rev: 0.5 });
  clip(mix, 'colpi_cavi', { t: T.castello + 0.8 - 0.01, da: 2.68, durata: 0.5, gain: 0.6, fadeOut: 0.15, rev: 0.5 });
  tuono(C('castello', 1) + 0.15, 0.8); tuono(C('castello', 3) + 0.15, 0.6);
  clip(mix, 'nitriti_paura', { t: C('castello', 1) + 0.25, da: 0.7, durata: 1.4, gain: 0.45, fadeOut: 0.3, pan: 0.5, rev: 0.4 });
  clip(mix, 'nitriti', { t: C('castello', 3) + 0.25, da: 0.6, durata: 2.1, gain: 0.4, fadeOut: 0.4, pan: 0.6, rev: 0.4 });
  bed('pioggia_vento', T.castello, T.libreria, 32, 0.2);
  // libreria: si apre cigolando, si richiude di colpo, si riapre; rivelazione finale
  clip(mix, 'legno_cigolio', { t: C('libreria', 0) + 0.6, da: 2.85, durata: 1.0, gain: 0.45, fadeOut: 0.3, rev: 0.4 });
  clip(mix, 'porta_sbatte', { t: C('libreria', 1) + 0.33 - 0.5, da: 2.6, durata: 0.9, gain: 0.55, fadeOut: 0.3, rev: 0.4 });
  clip(mix, 'legno_cigolio', { t: C('libreria', 1) + 1.2, da: 0.25, durata: 0.9, gain: 0.4, fadeOut: 0.3, rev: 0.4 });
  crescendo(mix, C('libreria', 5), 2.2, { gain: 0.35 });
  clip(mix, 'ronzio_tesla', { t: C('libreria', 5), da: 5, durata: 1.0, gain: 0.3, fadeIn: 0.3, fadeOut: 0.3, rev: 0.2 });
  // cervello: tuono sul patibolo, barattolo in frantumi, rintocco per ABNORMAL
  tuono(C('cervello', 1) + 0.1, 0.7); tuono(C('cervello', 3) + 0.55, 0.45);
  clip(mix, 'vetri', { t: C('cervello', 3) + 0.55 - 0.36, da: 3.66, durata: 1.0, gain: 0.5, fadeOut: 0.3, rev: 0.3 });
  colpo(mix, 'gong', 'gong_hit_p', { t: C('cervello', 4) + 0.5, vel: 90, gain: 0.5, rev: 0.5, dur: 2.5, release: 0.8 });
  bed('pioggia_vento', T.cervello, T.creazione, 66, 0.14);
  // creazione: elettricità, tuoni, cinghie che saltano
  bed('scintille', T.creazione, C('creazione', 3) + 1.0, 1, 0.3, { fadeIn: 0.3, fadeOut: 0.3 });
  bed('scintille', C('creazione', 5), T.eremita + 0.2, 8, 0.35, { fadeIn: 0.3, fadeOut: 0.4 });
  tuono(C('creazione', 1) + 0.9, 0.8); tuono(C('creazione', 5), 1);
  [[0, 2.9], [0.08, 8.07], [0.16, 12.82]].forEach(([d, da], k) => clip(mix, 'metallo_colpi', { t: C('creazione', 5) - 0.25 + d, da, durata: 0.4, gain: 0.35 - k * 0.05, pan: -0.2 + k * 0.2, rev: 0.35 }));
  bed('pioggia_vento', T.creazione, T.eremita, 87.5, 0.18);
  // eremita: fuoco, tazza in frantumi, fiammifero
  bed('fuoco', T.eremita, T.teatro, 3, 0.25);
  clip(mix, 'ceramica', { t: C('eremita', 3) + 0.6 - 0.01, da: 3.95, durata: 1.4, gain: 0.5, fadeOut: 0.4, rev: 0.3 });
  clip(mix, 'fiammifero', { t: C('eremita', 4) - 0.15 - 0.08, da: 0.62, durata: 1.0, gain: 0.45, fadeOut: 0.4, rev: 0.2, pan: 0.3 });
  // teatro: applauso al sipario, esplosione del riflettore, catene
  clip(mix, 'applauso_breve', { t: C('teatro', 1), da: 4.5, durata: 2.4, gain: 0.35, fadeIn: 0.4, fadeOut: 0.8, rev: 0.3 });
  clip(mix, 'vetri', { t: C('teatro', 4) - 0.01, da: 1.48, durata: 1.1, gain: 0.6, fadeOut: 0.3, rev: 0.3 });
  scarica(C('teatro', 4), C('teatro', 4) + 0.8, 7.6, 0.5);
  tuono(C('teatro', 4), 0.5);
  [[0, 5.12], [0.15, 11.47], [0.3, 18.4], [0.45, 28.11]].forEach(([d, da], k) => clip(mix, 'catene', { t: C('teatro', 5) + 0.3 + d, da, durata: 0.35, gain: 0.35 - k * 0.05, pan: -0.2 + k * 0.15, rev: 0.35 }));
  // elizabeth: bagagli che cadono, cipria, finestra spalancata nella tempesta
  [[0, 6.4], [0.18, 7.72], [0.32, 8.77], [0.46, 10.6]].forEach(([d, da], k) => clip(mix, 'sacchi', { t: C('elizabeth', 0) + d + 0.42, da, durata: 0.5, gain: 0.4 - k * 0.04, pan: -0.15 + k * 0.1, rev: 0.25 }));
  clip(mix, 'telo', { t: C('elizabeth', 1) + 0.2, da: 8.45, durata: 0.8, gain: 0.2, fadeOut: 0.3, rev: 0.25, pan: -0.3 });
  tuono(C('elizabeth', 2), 0.9); tuono(C('elizabeth', 2) + 0.9, 0.6);
  bed('vento_raffiche', C('elizabeth', 2), T.assedio, 12, 0.3, { fadeIn: 0.5 });
  [0, 0.12].forEach((d, k) => clip(mix, 'colpi_legno', { t: C('elizabeth', 2) + 0.75 + d, da: k ? 12.55 : 3.53, durata: 0.5, gain: 0.4, fadeOut: 0.2, rev: 0.35 }));
  // assedio: torce che crepitano, scarica dal parafulmine, torce che si spengono
  bed('torcia', T.assedio, C('assedio', 3) + 1.2, 1.5, 0.2);
  tuono(C('assedio', 2) + 0.1, 0.9); tuono(C('assedio', 2) + 0.9, 0.7);
  scarica(C('assedio', 2) + 0.1, C('assedio', 2) + 1.6, 7.0, 0.55);
  // nozze: campane a festa, pagina del giornale, brillio delle fedi
  clip(mix, 'campane_festa', { t: C('nozze', 1), da: 0.04, durata: Math.min(6, T.finale - C('nozze', 1)), gain: 0.35, fadeOut: 1.5, largo: 2, rev: 0.3 });
  [74, 78, 81, 86].forEach((m, j) => bell(mix, m, { t: C('nozze', 1) + j * 0.22, vel: 46, pan: -0.3 + j * 0.2 }));
  clip(mix, 'telo', { t: C('nozze', 2) + 0.2, da: 13.0, durata: 0.6, gain: 0.18, fadeOut: 0.2, rev: 0.2 });
  bell(mix, 93, { t: C('nozze', 3), vel: 40, pan: 0.4 });
};
