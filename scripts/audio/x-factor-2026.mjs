// Colonna sonora originale di X Factor 2026 (talent spiegati, recupero fino al Live 3), discreta sotto la voce.
// Orchestra e batteria campionate (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): batteria (cassa, rullante,
// charleston, tom, piatti), contrabbasso pizzicato, pianoforte a coda, ottoni (trombe, tromboni, corni), archi, timpani,
// glockenspiel. Carattere da varietà del giovedì sera, in Re maggiore (I–vi–IV–V), 4/4 a 120 bpm: una battuta = 2 s.
// Nei ballottaggi si passa a Si minore a metà passo, con il rullo dei timpani e gli archi in tremolo; sull'eliminazione
// l'accordo si ferma e la musica tace due battiti. TALENT.md: niente canzoni cantate in gara, niente sigla o jingle del
// programma, nessuna melodia delle cover: tutto è scritto qui.
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs) agganciati agli eventi delle scene in
// src/scenes/x-factor-2026/ e src/scenes/talent/ (stessi istanti: cue = inizio della frase, G = griglia delle scene).
import { suona, colpo, crescendo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'contrabbasso_pizz', 'contrabbasso', 'celli', 'viole', 'violini', 'violini_trem', 'celli_trem',
  'tromba', 'tromba_stacc', 'trombone', 'corno', 'glockenspiel', 'timpani', 'cassa', 'rullante', 'charleston', 'tom', 'piatto_crash', 'piatto_sospeso', 'grancassa_rullo'];
export const effetti = ['applauso', 'applauso_breve', 'passaggio', 'scatti'];
/** Studio televisivo: coda media, brillante. */
export const sala = { rt60: 1.5, brillo: 6800, predelay: 0.016, wet: 0.36 };

/** Un solo tempo per tutto il video (CLAUDE.md, «Musica»; TALENT.md: lo stesso per tutta la stagione). */
const BPM = 120;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

// Re maggiore: Re, Si minore, Sol, La (con la settima) — e Si minore per i ballottaggi: Si m, Sol, Mi m, Fa#
const MAG = [[38, 50, 54, 57, 62], [35, 50, 54, 59, 62], [31, 50, 55, 59, 62], [33, 49, 52, 57, 61]];
const MIN = [[35, 50, 54, 59, 62], [31, 50, 55, 59, 62], [28, 52, 55, 59, 64], [30, 49, 54, 58, 61]];

export default (mix, T) => {
  const { segments } = timeline(loadFilm('x-factor-2026'));
  const S = Object.fromEntries(segments.map((s) => [s.id, s]));
  const T0 = T['come-funziona'];
  /** Secondo d'inizio della frase n-esima del capitolo (come subtitleTimes in ChapterOverlay). */
  const cue = (id, n) => {
    const s = S[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let acc = 0.15;
    for (let k = 0; k < n; k++) acc += (w[k] / tot) * (s.dur - 0.35);
    return s.start + acc;
  };
  /** Come griglia() nelle scene: istante assoluto arrotondato a 1/div di battito (griglia dalla fine della copertina). */
  const G = (t, div = 2) => T0 + Math.round((t - T0) / (BEAT / div)) * (BEAT / div);
  /** Evento della scena: griglia(cues[n] + d) del capitolo id. */
  const E = (id, n, d = 0) => G(cue(id, n) + d);
  const B = (t) => T0 + Math.round((t - T0) / BAR) * BAR;

  // ---- batteria
  const hat = (t, vel = 40) => colpo(mix, 'charleston', vel > 45 ? 'v3' : 'v2', { t, vel: 100, gain: 0.2 * (vel / 50), pan: 0.3, rev: 0.1, seed: Math.round(t * 100) });
  const kick = (t, vel = 60) => colpo(mix, 'cassa', vel > 55 ? 'v5' : 'v3', { t, vel: 100, gain: 0.7 * (vel / 60), rev: 0.1, seed: Math.round(t * 100) });
  const snare = (t, vel = 50) => colpo(mix, 'rullante', vel > 55 ? 'v5' : 'v4', { t, vel: 100, gain: 0.38 * (vel / 60), pan: 0.05, rev: 0.2, seed: Math.round(t * 100) });
  const tom = (t, vel = 60, pitch = 0) => colpo(mix, 'tom', 'TomH_HitS_v3', { t, vel: 100, gain: 0.45 * (vel / 60), pan: -0.15, rev: 0.25, pitch, seed: Math.round(t * 100) });
  const crash = (t, gain = 0.22) => colpo(mix, 'piatto_crash', 'mf', { t, vel: 100, gain, pan: 0.2, rev: 0.3, dur: 2.5, release: 1 });
  const rullo = (t, dur, gain = 0.3) => colpo(mix, 'grancassa_rullo', 'bdrum_roll1', { t, vel: 90, gain, rev: 0.4, dur, release: 0.5 });
  const timp = (t, m = 35, vel = 90, gain = 0.55) => suona(mix, 'timpani', m, { t, dur: 2, vel, gain, rev: 0.4, release: 0.8, seed: Math.round(t * 10) });
  /** Groove da varietà: cassa sull'1 e sul 3, rullante sul 2 e sul 4, charleston in crome. half: metà passo (cassa sull'1). */
  const groove = (from, to, { vel = 44, half = false, snr = true } = {}) => {
    for (let t = from, k = 0; t < to - 0.05; t += BEAT / 2, k++) {
      hat(t, k % 2 ? vel - 12 : vel);
      if (half ? k % 8 === 0 : k % 4 === 0) kick(t, vel + 10);
      if (snr && (half ? k % 8 === 4 : k % 4 === 2)) snare(t, vel);
    }
  };

  // ---- armonia
  /** Basso pizzicato in crome sugli accordi (una battuta ciascuno). */
  const basso = (from, to, { ch = MAG, vel = 60, gain = 0.42, k0 = 0, half = false } = {}) => {
    const step = BEAT * (half ? 2 : 1) / 2;
    for (let t = from, k = 0; t < to - 0.1; t += step, k++) {
      const [r] = ch[(Math.floor((t - from) / BAR) + k0) % 4];
      const n = r + [0, 0, 12, 0, 7, 0, 12, 7][k % 8];
      suona(mix, 'contrabbasso_pizz', n, { t, dur: step, vel: vel - (k % 2) * 8, pan: -0.1, rev: 0.2, gain, release: 0.3, seed: k });
    }
  };
  /** Pianoforte: accordi ribattuti sul levare (stile varietà). */
  const piano = (from, to, { ch = MAG, vel = 50, gain = 0.3, k0 = 0, half = false } = {}) => {
    const step = BEAT * (half ? 2 : 1);
    for (let t = from, k = 0; t < to - 0.1; t += step, k++) {
      const [, ...v] = ch[(Math.floor((t - from) / BAR) + k0) % 4];
      const tt = t + (half ? 0 : BEAT / 2);
      if (tt >= to - 0.1) break;
      v.forEach((m, j) => suona(mix, 'pianoforte_coda', m + 12, { t: tt, dur: BEAT * 0.8, vel: vel - j * 2, pan: 0.15, rev: 0.3, gain: gain * 0.6, release: 0.4, seed: k + j }));
    }
  };
  /** Archi tenuti, una battuta per accordo. */
  const archi = (from, to, { ch = MAG, vel = 46, gain = 0.3, k0 = 0, half = false } = {}) => {
    const step = BAR * (half ? 2 : 1), a = { attack: 0.4, release: 1.1, rev: 0.45 };
    for (let t = from, k = k0; t < to - 0.4; t += step, k++) {
      const d = Math.min(step, to - t), [r, f, o, x] = ch[k % 4];
      suona(mix, 'contrabbasso', r + 12, { t, dur: d, vel: vel - 4, pan: -0.1, gain: gain * 0.8, ...a, seed: k });
      suona(mix, 'celli', f - 12, { t, dur: d, vel, pan: -0.3, gain, ...a, seed: k + 1 });
      suona(mix, 'viole', o, { t, dur: d, vel: vel - 4, pan: 0.2, gain: gain * 0.75, ...a, seed: k + 2 });
      suona(mix, 'violini', x + 12, { t, dur: d, vel: vel - 6, pan: 0.3, gain: gain * 0.55, attack: 0.5, release: 1.3, rev: 0.5 });
    }
  };
  const trem = (t, dur, notes, { gain = 0.24 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel: 66, pan: (j - (notes.length - 1) / 2) * 0.35, gain: gain * 0.75, attack: 0.4, release: 0.8, rev: 0.45, seed: j + 3 }));
  /** Colpo di ottoni (trombe, tromboni, corni) su un accordo. */
  const ottoni = (t, notes, { dur = BEAT, gain = 0.26, vel = 70 } = {}) => notes.forEach((m, j) => {
    const id = m < 55 ? 'trombone' : m < 66 ? 'corno' : 'tromba';
    suona(mix, id, m, { t, dur, vel, pan: -0.3 + j * 0.2, gain, attack: 0.02, release: 0.5, rev: 0.35, seed: j + Math.round(t * 10) });
  });
  const stacc = (t, m, gain = 0.2) => suona(mix, 'tromba_stacc', m, { t, dur: BEAT / 2, vel: 70, pan: 0.25, gain, release: 0.2, rev: 0.3 });
  const glock = (t, m, gain = 0.14) => suona(mix, 'glockenspiel', m, { t, dur: 1.2, vel: 50, pan: 0.25, rev: 0.5, gain, release: 1 });
  const applausi = (t, durata, gain = 0.1, breve = false) => clip(mix, breve ? 'applauso_breve' : 'applauso', { t, da: 1, durata, gain, fadeIn: 0.3, fadeOut: Math.min(1.2, durata / 2), rev: 0.15, largo: 3 });
  const scatto = (t, pan = 0, gain = 0.1) => clip(mix, 'scatti', { t: t - 0.03, da: 0.47, durata: 0.12, fadeOut: 0.03, gain, rev: 0.2, pan });
  /** Una sezione normale: groove, basso, piano. */
  const sezione = (from, to, opz = {}) => { groove(from, to, opz); basso(from, to, opz); piano(from, to, opz); };
  /** Una sezione di ballottaggio: Si minore a metà passo, cassa come un battito, archi in tremolo. */
  const tensione = (from, to) => {
    basso(from, to, { ch: MIN, half: true, vel: 56, gain: 0.38 });
    for (let t = from; t < to - 0.1; t += BEAT * 2) kick(t, 50);
    archi(from, to, { ch: MIN, vel: 44, gain: 0.26 });
  };

  // ---- copertina: colpo di ottoni e piatto al fotogramma 0 (l'aggancio), poi il rullo che porta al primo capitolo
  ottoni(0.02, [50, 57, 62, 66, 69], { dur: BEAT * 1.5, gain: 0.3, vel: 80 });
  crash(0.02, 0.26);
  kick(0.02, 70);
  applausi(0.3, 3.2, 0.06);
  for (let k = 0; k < 6; k++) stacc(BEAT * 2 + k * BEAT / 2, [62, 64, 66, 69, 71, 74][k], 0.16);
  rullo(T0 - 1.6, 1.6, 0.26);
  basso(T0 - BAR, T0, { vel: 54, gain: 0.34 });

  // ---- che cos'è: il palco si accende (piatto e applausi), il microfono dorato (glockenspiel), le poltrone una alla volta
  const cf = 'come-funziona';
  sezione(B(T[cf]), B(T.selezioni), { vel: 42 });
  archi(B(cue(cf, 2)), B(T.selezioni), { vel: 40, gain: 0.22 });
  crash(E(cf, 0, 0.1), 0.2); applausi(E(cf, 0, 0.1), 2.4, 0.07, true); // ComeFunziona.tsx: si accende il palco
  [74, 78, 81].forEach((m, j) => glock(E(cf, 1, 0.3) + j * BEAT / 2, m, 0.14)); // il microfono dorato della conduttrice
  for (let i = 0; i < 4; i++) { const t = G(cue(cf, 2) + 0.25 + i * 0.75); tom(t, 56, i); stacc(t, [62, 66, 69, 74][i], 0.16); } // le quattro poltrone
  ottoni(E(cf, 3, 0.2), [50, 57, 62, 66], { dur: BEAT * 2, gain: 0.2 }); // le luci delle squadre

  // ---- selezioni: i tre «SÌ», le quattro palette, le tre sedie, «12 AI LIVE»
  const sl = 'selezioni';
  basso(B(T[sl]), B(T.squadre), { half: true, vel: 54, gain: 0.36 });
  piano(B(T[sl]), B(T.squadre), { half: true, vel: 46, gain: 0.3 });
  archi(B(T[sl]), B(T.squadre), { half: true, vel: 38, gain: 0.18 });
  for (let t = B(T[sl]); t < B(T.squadre) - 0.1; t += BEAT) hat(t, 34);
  for (let i = 0; i < 3; i++) glock(E(sl, 0, 0.6) + i * 0.25, [76, 79, 83][i], 0.13); // Selezioni.tsx: tre sì su quattro
  for (let i = 0; i < 4; i++) { scatto(E(sl, 1, 0.5) + i * 0.18, -0.3 + i * 0.2, 0.08); stacc(E(sl, 1, 0.5) + i * 0.18, [69, 74, 78, 81][i], 0.14); } // le palette verdi
  for (let k = 0; k < 3; k++) { const t = E(sl, 2, 0.6) + k * 0.5; suona(mix, 'pianoforte_coda', [62, 66, 69][k], { t, dur: 1.5, vel: 56, gain: 0.3, rev: 0.4, release: 1 }); } // le tre sedie
  { const t = E(sl, 3, 0.4); ottoni(t, [50, 57, 62, 66, 69], { dur: BEAT * 2, gain: 0.26, vel: 76 }); crash(t, 0.18); kick(t, 64); } // 12 AI LIVE

  // ---- squadre: groove pieno, un colpo a ogni squadra e una nota a ogni asta che si accende
  const sq = 'squadre';
  sezione(B(T[sq]), B(T['regole-live']), { vel: 46 });
  archi(B(T[sq]), B(T['regole-live']), { vel: 40, gain: 0.2, half: true });
  for (let i = 0; i < 4; i++) {
    const tap = G(cue(sq, i)) - 0.25;
    if (i > 0) clip(mix, 'passaggio', { t: tap - 0.2, da: 0.1, durata: 0.8, gain: 0.05, fadeOut: 0.3, rev: 0.2, pan: 0.3 }); // Squadre.tsx: la camera passa alla squadra
    for (let k = 0; k < 3; k++) glock(G(cue(sq, i) + 0.9 + k * 0.95), [74, 78, 81, 86][(i + k) % 4], 0.12); // le aste si accendono
  }

  // ---- regole: i due turni, il televoto, il ballottaggio, il voto dei giudici e l'asta che si spegne
  const rl = 'regole-live';
  const rlV = E(rl, 3, 0.1);
  sezione(B(T[rl]), B(cue(rl, 2)), { vel: 40 });
  stacc(E(rl, 0, 0.3), 69, 0.18); stacc(E(rl, 0, 0.3) + 1.5, 74, 0.18); // RegoleLive.tsx: turno 1 e turno 2
  trem(E(rl, 1, 0.5), 1.4, [62, 66, 69], { gain: 0.16 }); // le barre del televoto
  [0, 1, 2].forEach((j) => glock(E(rl, 1, 0.1) + 1.6 + j * 0.1, 88, 0.1)); // la barra più corta lampeggia
  tensione(B(cue(rl, 2)), rlV + 1.5);
  rullo(E(rl, 2, 0.2), 1.0, 0.22); // le due aste avanti, sotto i fasci rossi
  for (let i = 0; i < 4; i++) { scatto(rlV + i * 0.3, -0.4 + i * 0.27, 0.08); tom(rlV + i * 0.3, 50, -2 + i); } // le quattro lampade
  timp(rlV + 1.5, 35, 96, 0.5); // l'asta si spegne
  archi(rlV + 1.5 + 2 * BEAT, B(T['live-1']) + 0.4, { vel: 40, gain: 0.2 });

  // ---- i tre ballottaggi (Ballottaggio.tsx): data e fasci rossi, i nomi, i quattro voti, l'eliminazione e chi resta
  const ballottaggio = (id, next) => {
    const tD = E(id, 0, 0.2);
    ottoni(tD, [47, 54, 59, 62], { dur: BEAT * 2, gain: 0.22, vel: 70 }); crash(tD, 0.14); // la data del Live
    tensione(B(T[id]), E(id, 3, 0.2));
    rullo(tD + 0.6, 0.8, 0.18); // i due fasci rossi
    suona(mix, 'pianoforte_coda', 71, { t: E(id, 1, 0.1), dur: 1.2, vel: 54, gain: 0.26, rev: 0.4 }); // la prima asta
    suona(mix, 'pianoforte_coda', 74, { t: E(id, 1, 0.1) + 1.2, dur: 1.2, vel: 54, gain: 0.26, rev: 0.4 }); // la seconda
    const tV = E(id, 2, 0.3);
    trem(tV - 0.2, 4 * 0.55 + 0.4, [47, 59, 71], { gain: 0.2 });
    for (let i = 0; i < 4; i++) { scatto(tV + i * 0.55, -0.45 + i * 0.3, 0.09); tom(tV + i * 0.55, 54, -3 + i); } // le lampade dei giudici
    const tF = E(id, 3, 0.2);
    timp(tF, 35, 104, 0.6); colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: tF - 1.2, vel: 90, gain: 0.16, rev: 0.4, dur: 1.3, release: 0.1 }); // l'asta si spegne
    const dopo = tF + 2 * BEAT; // due battiti di silenzio
    archi(dopo, next, { vel: 40, gain: 0.24, ch: MAG, k0: 1 });
    piano(dopo, next, { half: true, vel: 42, gain: 0.24, k0: 1 });
  };
  ballottaggio('live-1', B(T.ripescaggio) + 0.3);
  ballottaggio('live-2', B(T['live-3']) + 0.3);
  ballottaggio('live-3', B(T['chi-resta']) + 0.3);
  // live-3: la serata di vecchie canzoni, il jukebox si accende (Ballottaggio.tsx, frase 1)
  [62, 66, 69, 74].forEach((m, j) => suona(mix, 'pianoforte_coda', m + 12, { t: E('live-3', 0, 0.2) + j * BEAT / 2, dur: 0.4, vel: 50, gain: 0.18, rev: 0.3 }));

  // ---- ripescaggio: la sorpresa (fanfara), i due pass, la corsa del televoto, Teo Bok rientra
  const rp = 'ripescaggio';
  const rpV = E(rp, 3, 0.3);
  sezione(B(T[rp]), B(cue(rp, 2)), { vel: 44, k0: 0 });
  { const t = E(rp, 0, 0.6); ottoni(t, [50, 57, 62, 66, 69], { dur: BEAT, gain: 0.24 }); [81, 86, 90].forEach((m, j) => glock(t + 0.1 + j * BEAT / 2, m, 0.14)); } // Ripescaggio.tsx: RIPESCAGGIO
  clip(mix, 'passaggio', { t: E(rp, 1, 0.1), da: 0.1, durata: 1.0, gain: 0.06, fadeOut: 0.3, rev: 0.2, pan: -0.5 }); // entra Teo Bok
  clip(mix, 'passaggio', { t: E(rp, 1, 0.1) + 0.8, da: 0.1, durata: 1.0, gain: 0.06, fadeOut: 0.3, rev: 0.2, pan: 0.5 }); // entra Timothée Bonnardel
  groove(B(cue(rp, 2)), rpV - BEAT / 2, { vel: 40 });
  basso(B(cue(rp, 2)), rpV, { vel: 56, gain: 0.36 });
  trem(E(rp, 2, 0.7), rpV - E(rp, 2, 0.7), [62, 69, 74], { gain: 0.2 });
  crescendo(mix, rpV, 2.0, { gain: 0.18 }); // la corsa delle barre
  ottoni(rpV, [50, 57, 62, 66, 69], { dur: BEAT * 2, gain: 0.28, vel: 80 }); crash(rpV, 0.22); kick(rpV, 66); // vince Teo Bok
  applausi(rpV + 0.1, T['live-2'] - rpV - 0.3, 0.08);
  sezione(rpV + BAR, B(T['live-2']) + 0.2, { vel: 42 });
  glock(rpV + 1.0, 86, 0.14); // l'asta col pass al posto di Alice

  // ---- chi resta: il tabellone si accende riga per riga, i numeri delle squadre, il Live 4, «ESCONO IN 3»
  const cr = 'chi-resta';
  sezione(B(T[cr]), B(T.finale), { vel: 44 });
  archi(B(cue(cr, 2)), B(T.finale), { vel: 42, gain: 0.22 });
  for (let k = 0; k < 6; k++) glock(E(cr, 0, 0.1) + k * 0.24, [74, 76, 78, 81, 83, 86][k], 0.08); // Tabellone.tsx: le righe
  for (let i = 0; i < 4; i++) { const t = E(cr, 1, 0.2) + i * 0.6; tom(t, 56, i); stacc(t, [69, 69, 66, 66][i], 0.16); } // 3, 3, 2, 2
  suona(mix, 'pianoforte_coda', 74, { t: E(cr, 2, 0.2), dur: 1.5, vel: 56, gain: 0.26, rev: 0.4 }); // LIVE 4 · GIOVEDÌ 12 NOVEMBRE
  { const t = E(cr, 3, 0.5); rullo(t - 1.0, 1.0, 0.22); ottoni(t, [45, 52, 57, 61, 64], { dur: BEAT * 2, gain: 0.28, vel: 82 }); crash(t, 0.22); kick(t, 66); } // ESCONO IN 3

  // ---- finale: accordo pieno di Re, applausi
  const F = B(T.finale);
  ottoni(F, [50, 57, 62, 66, 69], { dur: BAR * 1.5, gain: 0.24, vel: 72 }); crash(F, 0.2); kick(F, 60);
  archi(F, T.END - 0.3, { vel: 44, gain: 0.26 });
  applausi(F + 0.2, T.END - F - 0.4, 0.07);
};
