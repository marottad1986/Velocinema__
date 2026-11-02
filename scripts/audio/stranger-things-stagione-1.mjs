// Colonna sonora originale di Stranger Things, stagione 1, discreta sotto la voce.
// Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): archi gravi che pulsano a crome, pianoforte a
// coda e glockenspiel nel registro acuto, arpa, timpani, corni scuri. Niente sintetizzatori e nessun arpeggio che ricordi
// la sigla della serie: il motivo è inventato qui, in Mi minore e in 4/4 a 96 bpm (10 s = 4 battute: i capitoli cadono sul battere), un tema dell'amicizia di quattro note
// (si, mi, re, sol) che torna nei capitoli dei ragazzi e nel Natale in Sol maggiore. Il Sottosopra ha i suoi colori: archi
// in tremolo acuto, gong e corni bassi. Dopo ogni colpo forte la musica tace almeno un battito.
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs) agganciati alle frasi dei sottotitoli
// (tempi come in ChapterOverlay) e agli eventi delle scene in src/scenes/stranger-things-stagione-1/ (stesse formule,
// sulla stessa griglia: `G` qui = `griglia` nelle scene).
import { suona, colpo, crescendo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'violini', 'viole', 'celli', 'contrabbasso', 'violini_trem', 'celli_trem', 'contrabbasso_pizz',
  'violini_pizz', 'celli_spicc', 'arpa', 'glockenspiel', 'timpani', 'gong', 'corno', 'piatto_sospeso', 'grancassa'];
export const effetti = ['vento_leggero', 'vento_invernale', 'porta_sbatte', 'ronzio_neon', 'scariche', 'pioggia_dura', 'radio_sintonia', 'disturbo',
  'scatti', 'telo', 'risacca', 'colpi_legno', 'legno_cade', 'metallo_cade', 'metallo_colpi', 'fiammata', 'fuoco', 'vetri', 'esplosioni'];
/** Case di legno e scantinati: coda media, alte morbide. */
export const sala = { rt60: 2.2, brillo: 4600, predelay: 0.025, wet: 0.42 };

/** Un solo tempo per tutto il film (CLAUDE.md, «Musica»): i capitoli sospesi a metà passo, gli altri a passo pieno. */
const BPM = 96;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const CROMA = BEAT / 2;

// Accordi (Mi minore): Mi minore, Do, La minore, Si (con la terza maggiore che inquieta)
const CH = [[52, 55, 59], [48, 52, 55], [45, 48, 52], [47, 51, 54]];
// Sol maggiore per l'amicizia e il Natale: Sol, Re, Mi minore, Do
const CHM = [[43, 47, 50], [50, 54, 57], [52, 55, 59], [48, 52, 55]];
// Tema dell'amicizia: [tempo, nota MIDI, durata in tempi]
const TEMA = [[0, 71, 1], [1, 76, 1.5], [2.5, 74, 1.5], [4, 67, 3]];

export default (mix, T) => {
  const { segments } = timeline(loadFilm('stranger-things-stagione-1'));
  const S = Object.fromEntries(segments.map((s) => [s.id, s]));
  /** Secondo d'inizio della frase n-esima del capitolo (come subtitleTimes in ChapterOverlay). */
  const cue = (id, n) => {
    const s = S[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let acc = 0.15;
    for (let k = 0; k < n; k++) acc += (w[k] / tot) * (s.dur - 0.35);
    return s.start + acc;
  };
  /** Griglia delle scene (griglia in SceneProps): istante assoluto arrotondato a 1/div di battito dalla fine della copertina. */
  const G = (t, div = 2) => T.capanno + Math.round((t - T.capanno) / (BEAT / div)) * (BEAT / div);
  /** Battuta della griglia più vicina all'istante t (inizi dei capitoli). */
  const B = (t) => T.capanno + Math.round((t - T.capanno) / BAR) * BAR;
  /** Battito più vicino (cambi dentro un capitolo). */
  const Q = (t) => G(t, 1);

  /** Archi tenuti sugli accordi, una battuta ciascuno (half: due battute). */
  const strings = (from, to, { half = false, vel = 46, gain = 0.4, bass = true, high = false, k0 = 0, chords = CH } = {}) => {
    const step = BAR * (half ? 2 : 1), a = { attack: 0.5, release: 1.2, rev: 0.55 };
    gain *= 1.9; // letto di archi ben presente: niente buchi sotto la voce
    for (let t = from, k = k0; t < to - 0.4; t += step, k++) {
      const d = Math.min(step, to - t), [r, m, f] = chords[k % 4];
      suona(mix, 'celli', r, { t, dur: d, vel, pan: -0.35, gain: gain * 1.1, ...a, seed: k });
      suona(mix, 'viole', m + 12, { t, dur: d, vel: vel - 4, pan: 0.15, gain: gain * 0.75, ...a, seed: k + 1 });
      suona(mix, 'viole', f + 12, { t, dur: d, vel: vel - 4, pan: 0.3, gain: gain * 0.65, ...a, seed: k + 2 });
      if (bass) suona(mix, 'contrabbasso', r - 12, { t, dur: d, vel: vel - 4, pan: -0.1, gain: gain * 0.9, ...a });
      if (high) suona(mix, 'violini', f + 24, { t, dur: d, vel: vel - 6, pan: -0.2, gain: gain * 0.5, attack: 0.7, release: 1.4, rev: 0.65 });
    }
  };
  /** Pulsazione degli archi gravi a crome sulla fondamentale (il cuore del racconto); half: a semiminime. */
  const pulse = (from, to, { vel = 50, gain = 0.3, k0 = 0, chords = CH, half = false } = {}) => {
    const step = half ? BEAT : CROMA;
    gain *= 1.4;
    for (let t = from, k = 0; t < to - 0.1; t += step, k++) {
      const r = chords[(Math.floor((k * step) / BAR) + k0) % 4][0];
      suona(mix, 'celli_spicc', r, { t, dur: step * 0.9, vel: vel + (k % 2 ? -6 : 0), pan: -0.2, gain, rev: 0.4, release: 0.2, seed: k });
    }
  };
  /** Tema dell'amicizia al pianoforte acuto (con il glockenspiel all'ottava); half: metà passo. */
  const tema = (from, to, { half = false, vel = 50, gain = 0.36, oct = 0, glk = 0.22 } = {}) => {
    const beat = BEAT * (half ? 2 : 1), loop = 8 * beat;
    for (let L = from; L < to - 0.3; L += loop) {
      for (const [b, m, d] of TEMA) {
        const t = L + b * beat;
        if (t >= to - 0.3) break;
        suona(mix, 'pianoforte_coda', m + oct, { t, dur: Math.min(d * beat, to - t), vel, pan: 0.15, rev: 0.55, gain, release: 1.1 });
        if (glk) suona(mix, 'glockenspiel', m + oct + 12, { t: t + 0.01, dur: 1, vel: vel - 14, pan: 0.3, rev: 0.6, gain: gain * glk, release: 1 });
      }
    }
  };
  /** Arpa a crome sull'accordo della battuta. */
  const harp = (from, to, { vel = 46, gain = 0.28, k0 = 0, chords = CH } = {}) => {
    for (let t = from, k = 0; t < to - 0.2; t += CROMA, k++) {
      const [r, m, f] = chords[(Math.floor(k / 8) + k0) % 4];
      suona(mix, 'arpa', [r + 12, f + 12, m + 12, r + 24, f + 12, m + 24, f + 24, m + 12][k % 8], { t, dur: 1.4, vel: vel - (k % 4) * 3, pan: -0.25 + (k % 8) * 0.07, rev: 0.55, gain, release: 1.1 });
    }
  };
  /** Il Sottosopra: tremolo acuto e grave a semitoni. */
  const trem = (t, dur, notes, { vel = 46, gain = 0.3 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel, pan: (j - (notes.length - 1) / 2) * 0.35, gain, attack: 0.5, release: 0.9, rev: 0.6, seed: j + 3 }));
  const timp = (t, m = 40, vel = 84, gain = 0.6) => suona(mix, 'timpani', m, { t, dur: 2, vel: Math.min(vel, 94), gain, rev: 0.5, release: 0.8, seed: Math.round(t * 10) });
  const gong = (t, gain = 0.3) => colpo(mix, 'gong', 'gong_hit_p', { t, vel: 70, rev: 0.6, gain, dur: 4, release: 1.2 });
  const glock = (t, m, gain = 0.16) => suona(mix, 'glockenspiel', m, { t, dur: 1.4, vel: 48, pan: 0.25, rev: 0.6, gain, release: 1.1 });
  const pizz = (t, m, gain = 0.3, vel = 58) => suona(mix, m < 60 ? 'contrabbasso_pizz' : 'violini_pizz', m, { t, dur: 0.6, vel, pan: 0, rev: 0.45, gain, release: 0.35 });
  const horn = (t, m, dur, gain = 0.3) => suona(mix, 'corno', m, { t, dur, vel: 54, gain, attack: 0.4, release: 1.2, rev: 0.6, pan: 0.2 });
  const roll = (t, dur, gain = 0.18) => crescendo(mix, t, dur, { gain });
  const wind = (t, durata, gain, da = 1) => clip(mix, 'vento_leggero', { t, da, durata, gain, fadeIn: 1, fadeOut: 1, largo: 4, rev: 0.1 });
  /** Istante relativo al capitolo → assoluto. */
  const at = (id, s) => S[id].start + s;
  const c = (id, n) => cue(id, n) - S[id].start;
  /** Natale comincia a metà battuta: il cambio cade sul primo battito dopo il taglio. */
  const NAT = Q(T.natale);

  // ---- copertina: il vento nel bosco, un Mi grave, la ruota della bici che gira (scatti) e tre note del glockenspiel
  wind(0, T.capanno + 0.5, 0.035);
  suona(mix, 'contrabbasso', 40, { t: 0.02, dur: 4, vel: 50, gain: 0.5, attack: 0.25, release: 1.2, rev: 0.6 });
  [52, 55, 59].forEach((m, j) => suona(mix, 'celli', m, { t: 0.4 + j * 0.25, dur: 3.4 - j * 0.25, vel: 44, pan: (j - 1) * 0.3, gain: 0.36, attack: 0.7, release: 1.2, rev: 0.6 }));
  clip(mix, 'scatti', { t: 0.3, da: 0.5, durata: 2.6, gain: 0.08, fadeIn: 0.2, fadeOut: 1.4, rev: 0.2, pan: -0.2 }); // Locandina.tsx: la ruota che gira
  [71, 76, 74].forEach((m, j) => glock(1.4 + j * BEAT, m, 0.13));

  // ---- capanno: la sera tranquilla (archi a metà passo, tema); la porta a zanzariera; la lampadina che sfarfalla e si spegne
  {
    const id = 'capanno';
    wind(T.capanno, B(T.laboratorio) - T.capanno, 0.03, 5);
    strings(B(T.capanno), Q(cue(id, 2)), { half: true, vel: 44, gain: 0.32 });
    tema(B(T.capanno), Q(cue(id, 2)), { half: true, vel: 46, gain: 0.3 });
    clip(mix, 'porta_sbatte', { t: G(at(id, c(id, 1) + 0.5)) - 0.03, da: 1.15, durata: 0.9, gain: 0.2, fadeOut: 0.4, rev: 0.35, pan: -0.45 }); // la zanzariera sbatte
    pizz(G(at(id, c(id, 1) + 0.5)), 40, 0.32);
    // terza frase: il ronzio della lampadina, tre scariche sugli sfarfallii, poi lo spegnimento
    const tOff = G(at(id, c(id, 2) + 2.1));
    clip(mix, 'ronzio_neon', { t: cue(id, 2), da: 1, durata: tOff - cue(id, 2), gain: 0.04, fadeIn: 0.4, fadeOut: 0.05, rev: 0.2, pan: 0.15 });
    [[0.3, 0.06], [0.9, 0.09], [1.4, 0.12]].forEach(([d, g]) => clip(mix, 'scariche', { t: G(at(id, c(id, 2) + d), 4) - 0.04, da: 1.2, durata: 0.25, gain: g, fadeOut: 0.08, rev: 0.25, pan: 0.15 }));
    pulse(Q(cue(id, 2)), tOff - 0.05, { vel: 52, gain: 0.3 });
    trem(Q(cue(id, 2)), tOff - Q(cue(id, 2)), [64, 65], { vel: 40, gain: 0.18 });
    timp(tOff, 40, 90, 0.55);
    gong(tOff + 0.02, 0.22);
    trem(tOff + BEAT, B(T.laboratorio) - tOff - BEAT, [88, 89], { vel: 40, gain: 0.16 }); // il bagliore freddo e le spore, dopo un battito
  }

  // ---- laboratorio: la pioggerella; le finestre che si accendono (arpa); le impronte (pizzicati); l'allarme e i riflettori
  {
    const id = 'laboratorio';
    clip(mix, 'pioggia_dura', { t: T.laboratorio, da: 2, durata: S[id].dur + 0.4, gain: 0.05, fadeIn: 0.8, fadeOut: 0.6, largo: 3, lp: 5000 });
    strings(B(T.laboratorio), Q(cue(id, 2)), { vel: 44, gain: 0.32, k0: 2 });
    [0, 1, 2].forEach((j) => suona(mix, 'arpa', [64, 67, 71][j], { t: G(at(id, 0.3 + j * BEAT), 2), dur: 2, vel: 50, pan: -0.2 + j * 0.2, rev: 0.6, gain: 0.3, release: 1.3 })); // Laboratorio.tsx: una fila di finestre alla volta
    for (let i = 0; i < 10; i++) pizz(G(at(id, c(id, 1) + 0.25), 2) + i * CROMA, [76, 74, 76, 74, 72, 71, 72, 71, 69, 67][i], 0.2, 52 - i); // le impronte, una per croma
    const tAlarm = G(at(id, c(id, 2) + 0.2));
    pulse(tAlarm, B(T.lucine), { vel: 58, gain: 0.34, k0: 3 });
    for (let t = tAlarm, k = 0; t < B(T.lucine) - 0.3; t += BEAT, k++) trem(t, BEAT, [k % 2 ? 76 : 77], { vel: 52, gain: 0.2 }); // l'allarme: due note che si alternano
    timp(tAlarm, 40, 92, 0.6);
    horn(tAlarm + 0.4, 47, 2.4, 0.3); // i riflettori si accendono
    horn(tAlarm + 0.4, 52, 2.4, 0.24);
  }

  // ---- lucine: il tema in penombra; l'onda di lucine (glockenspiel che sale); il buio; le lettere S-C-A-P-P-A una per croma
  {
    const id = 'lucine';
    strings(B(T.lucine), G(at(id, c(id, 2) + 0.4)) + 0.4, { half: true, vel: 42, gain: 0.3, k0: 1 });
    tema(B(T.lucine), Q(cue(id, 1)), { half: true, vel: 44, gain: 0.3, glk: 0 });
    const tWave = G(at(id, c(id, 1) + 0.3));
    [76, 79, 83, 86, 88, 91].forEach((m, j) => glock(tWave + (j * BEAT) / 4, m, 0.15)); // Lucine.tsx: l'onda da sinistra a destra
    clip(mix, 'ronzio_neon', { t: tWave, da: 3, durata: G(at(id, c(id, 2) + 0.4)) - tWave, gain: 0.04, fadeIn: 0.3, fadeOut: 0.1, rev: 0.2 });
    harp(Q(tWave), G(at(id, c(id, 2) + 0.4)), { vel: 44, gain: 0.24, k0: 1 });
    const tSpell = G(at(id, c(id, 2) + 1.4));
    trem(G(at(id, c(id, 2) + 0.4)), tSpell - G(at(id, c(id, 2) + 0.4)) + 6 * CROMA, [52, 64, 75], { vel: 44, gain: 0.3 });
    [83, 79, 76, 81, 81, 76].forEach((m, k) => { // S C A P P A
      glock(tSpell + k * CROMA, m, 0.2);
      pizz(tSpell + k * CROMA, 40, 0.24);
    });
    const tWord = tSpell + 6 * CROMA + 0.15;
    [[52, 'celli'], [59, 'viole'], [64, 'viole'], [71, 'violini'], [75, 'violini']].forEach(([m, s], j) =>
      suona(mix, s, m, { t: tWord, dur: B(T.scantinato) - tWord + 0.3, vel: 50, gain: 0.3, pan: (j - 2) * 0.2, attack: 0.15, release: 1, rev: 0.6 }));
    timp(tWord, 40, 76, 0.4);
  }

  // ---- scantinato: il tema dell'amicizia in Sol maggiore; i tre walkie-talkie; la torcia nella tenda; la porta che sbatte
  {
    const id = 'scantinato';
    pulse(B(T.scantinato), Q(cue(id, 2)), { vel: 46, gain: 0.24, chords: CHM, half: true });
    strings(B(T.scantinato), Q(cue(id, 2)), { vel: 44, gain: 0.3, chords: CHM });
    tema(B(T.scantinato), Q(cue(id, 2)), { vel: 48, gain: 0.32 });
    for (let i = 0; i < 3; i++) clip(mix, 'radio_sintonia', { t: G(at(id, c(id, 0) + 0.8 + i * 2 * CROMA), 2), da: [2.4, 3.0, 5.6][i], durata: 0.45, gain: 0.08, fadeOut: 0.15, rev: 0.15, pan: 0.2 + i * 0.15 }); // Scantinato.tsx: i walkie-talkie
    const tTorch = G(at(id, c(id, 1) + 0.8));
    clip(mix, 'scatti', { t: tTorch - 0.02, da: 0.98, durata: 0.2, gain: 0.18, fadeOut: 0.05, rev: 0.2, pan: -0.2 }); // la torcia si accende
    [55, 59, 62, 67].forEach((m, j) => suona(mix, 'arpa', m, { t: tTorch + j * 0.08, dur: 2, vel: 52, pan: -0.3 + j * 0.15, rev: 0.6, gain: 0.18, release: 1.3 }));
    const tSlam = G(at(id, c(id, 2) + 0.3));
    clip(mix, 'porta_sbatte', { t: tSlam - 0.1, da: 1.12, durata: 0.9, gain: 0.3, fadeOut: 0.5, rev: 0.4, pan: 0.4 }); // la porta in cima alle scale
    timp(tSlam, 40, 86, 0.5);
    // un battito di silenzio, poi gli oggetti che si alzano: tremolo acuto e glockenspiel sospeso
    const tLift = tSlam + 2 * CROMA;
    trem(tLift, B(T.cava) - tLift, [83, 84], { vel: 42, gain: 0.2 });
    [79, 83, 86].forEach((m, j) => glock(tLift + 0.3 + j * BEAT, m, 0.14));
    suona(mix, 'contrabbasso', 40, { t: tLift, dur: B(T.cava) - tLift, vel: 42, gain: 0.3, attack: 0.6, release: 0.8, rev: 0.6 });
  }

  // ---- cava: l'acqua e il vento; i fari sulla barella (corni); la torcia di Hopper (clic); lo squarcio (telo) e l'ovatta
  {
    const id = 'cava';
    wind(T.cava, S[id].dur, 0.025, 3);
    clip(mix, 'risacca', { t: T.cava, da: 4, durata: S[id].dur, gain: 0.025, fadeIn: 1, fadeOut: 1, lp: 1500 });
    strings(B(T.cava), Q(cue(id, 2)), { half: true, vel: 44, gain: 0.34, k0: 2 });
    horn(G(cue(id, 0) + 0.3), 40, 2.2, 0.28); // Cava.tsx: i fasci si fermano sulla barella
    horn(G(cue(id, 0) + 0.3), 47, 2.2, 0.22);
    const tTorch = G(at(id, c(id, 1) + 0.4));
    clip(mix, 'scatti', { t: tTorch - 0.02, da: 1.05, durata: 0.2, gain: 0.2, fadeOut: 0.05, rev: 0.2, pan: 0.35 }); // la torcia si accende
    pulse(Q(tTorch), G(at(id, c(id, 2) + 0.9)), { vel: 48, gain: 0.26, k0: 2 });
    const tRip = G(at(id, c(id, 2) + 0.9));
    clip(mix, 'telo', { t: tRip - 0.1, da: 0.2, durata: 0.9, gain: 0.25, fadeOut: 0.3, rev: 0.3 }); // il telo si squarcia
    pizz(tRip, 40, 0.38, 70);
    [83, 79, 76, 71].forEach((m, j) => glock(tRip + 0.3 + j * CROMA, m, 0.14)); // l'ovatta che vola
    strings(Q(tRip) + 2 * BEAT, B(T.piscina), { vel: 44, gain: 0.32, k0: 0 });
  }

  // ---- piscina: la festa ancora accesa (tema lontano); la luce della piscina si spegne; i cerchi sull'acqua; il lampo della macchina
  {
    const id = 'piscina';
    strings(B(T.piscina), G(at(id, c(id, 1) + 1.4)) - 0.05, { vel: 42, gain: 0.28, chords: CHM });
    tema(B(T.piscina), Q(cue(id, 1)), { vel: 42, gain: 0.26, oct: 12, glk: 0 });
    const tOut = G(at(id, c(id, 1) + 1.4));
    clip(mix, 'scariche', { t: tOut - 0.55, da: 1.2, durata: 0.2, gain: 0.06, fadeOut: 0.06, rev: 0.25 }); // lo sfarfallio
    clip(mix, 'scariche', { t: tOut - 0.04, da: 2.4, durata: 0.3, gain: 0.1, fadeOut: 0.1, rev: 0.25 }); // la luce si spegne
    timp(tOut, 40, 80, 0.45);
    trem(tOut + BEAT, cue(id, 2) - tOut - BEAT + 1, [52, 53, 76], { vel: 42, gain: 0.24 });
    for (let k = 0; k < 6; k++) suona(mix, 'arpa', [40, 47, 52, 55, 59, 64][k], { t: tOut + BEAT + k * 0.12, dur: 2, vel: 44, pan: -0.3 + k * 0.1, rev: 0.6, gain: 0.22, release: 1.2 }); // i cerchi
    const tFlash = G(at(id, c(id, 2) + 1.0));
    pulse(Q(cue(id, 2)), tFlash - 0.1, { vel: 50, gain: 0.26 });
    clip(mix, 'scatti', { t: tFlash - 0.03, da: 1, durata: 0.25, gain: 0.26, fadeOut: 0.08, rev: 0.25, pan: 0.35 }); // il lampo della macchina fotografica
    timp(tFlash, 45, 84, 0.5);
    strings(tFlash + BEAT, B(T.sottosopra), { vel: 44, gain: 0.32, k0: 1 });
    pulse(tFlash + BEAT, B(T.sottosopra), { vel: 50, gain: 0.26, k0: 1 });
  }

  // ---- sottosopra: il tabellone che si ribalta e i dadi; il mondo di sotto (gong, tremolo); la membrana (corni); la lucina di Will
  {
    const id = 'sottosopra';
    strings(B(T.sottosopra), Q(cue(id, 1)), { vel: 44, gain: 0.3, k0: 2 });
    const tFlip = G(at(id, c(id, 0) + 2.5));
    clip(mix, 'colpi_legno', { t: tFlip + 0.38, da: 1.4, durata: 0.35, gain: 0.2, rev: 0.3 }); // il tabellone ricade
    clip(mix, 'legno_cade', { t: tFlip + 0.73, da: 0, durata: 0.5, gain: 0.12, fadeOut: 0.2, rev: 0.3, pan: -0.3 }); // i dadi saltano
    [64, 67, 71].forEach((m, j) => pizz(tFlip + j * CROMA, m, 0.22));
    const tWorld = G(at(id, c(id, 1) + 0.4));
    gong(tWorld, 0.3);
    trem(tWorld, B(T.piscinetta) - tWorld + 0.6, [40, 41, 64, 88], { vel: 48, gain: 0.36 });
    [76, 77, 76, 75].forEach((m, j) => suona(mix, 'violini_trem', m, { t: tWorld + 0.4 + j * BEAT, dur: BEAT, vel: 46, gain: 0.16, attack: 0.1, release: 0.4, rev: 0.6 })); // la bussola impazzisce
    const tBulge = G(at(id, c(id, 2) + 0.2));
    horn(tBulge, 40, 2, 0.34); // la parete si gonfia
    horn(tBulge, 41, 2, 0.26);
    timp(tBulge, 40, 88, 0.5);
    const tWill = tBulge + 4 * CROMA;
    [71, 76].forEach((m, j) => glock(tWill + j * BEAT, m, 0.18)); // la lucina di Will: il tema, due note
    suona(mix, 'pianoforte_coda', 71, { t: tWill, dur: 2, vel: 44, gain: 0.28, rev: 0.6, release: 1.2 });
  }

  // ---- piscinetta: l'acqua salata (arpa a cerchi); la visione con la radio che gracchia e il tema fragile; lo squarcio del passaggio
  {
    const id = 'piscinetta';
    strings(B(T.piscinetta), G(at(id, c(id, 2) + 0.9)), { half: true, vel: 42, gain: 0.3, k0: 3 });
    harp(B(T.piscinetta), Q(cue(id, 1)), { vel: 42, gain: 0.22, k0: 2 });
    const tVision = G(at(id, c(id, 1) + 0.3));
    clip(mix, 'disturbo', { t: tVision, da: 2, durata: 2.4, gain: 0.05, fadeIn: 0.1, fadeOut: 1, rev: 0.2, pan: 0.4 }); // Piscinetta.tsx: la radio gracchia
    tema(tVision, G(at(id, c(id, 2) + 0.9)), { half: true, vel: 40, gain: 0.26, glk: 0.3 });
    const tGate = G(at(id, c(id, 2) + 0.9));
    gong(tGate, 0.32);
    timp(tGate, 40, 86, 0.5);
    trem(tGate + BEAT, B(T.trappola) - tGate - BEAT + 0.6, [40, 46, 52, 76, 82], { vel: 50, gain: 0.42 }); // lo squarcio: tritono grave e acuto
    horn(tGate + 0.3, 46, 2.4, 0.26);
  }

  // ---- trappola: l'attesa (pulsazione); le gocce di sangue; le lucine che sfarfallano; la membrana; la fiammata; il fuoco
  {
    const id = 'trappola';
    pulse(B(T.trappola), G(at(id, c(id, 2) + 1.5)) - 0.1, { vel: 50, gain: 0.32, half: true });
    strings(B(T.trappola), Q(cue(id, 2)), { vel: 42, gain: 0.34 });
    for (let k = 0; k < 3; k++) pizz(G(at(id, c(id, 1) + 0.5), 2) + k * CROMA, [79, 78, 77][k], 0.22, 60); // Trappola.tsx: le tre gocce
    const fl0 = G(cue(id, 1) + 1.4), fl1 = G(cue(id, 2) + 1.6);
    clip(mix, 'ronzio_neon', { t: fl0, da: 5, durata: fl1 - fl0, gain: 0.06, fadeIn: 0.2, fadeOut: 0.1, rev: 0.2, pan: -0.2 }); // le lucine sfarfallano
    trem(fl0, cue(id, 2) - fl0 + 0.1, [64, 65], { vel: 42, gain: 0.2 });
    const tBulge = G(cue(id, 2) + 0.1);
    trem(tBulge, G(at(id, c(id, 2) + 1.5)) - tBulge, [40, 41, 52, 53], { vel: 54, gain: 0.32 }); // la membrana e l'artiglio
    horn(tBulge + 0.6, 41, 1, 0.3);
    roll(G(at(id, c(id, 2) + 1.5)), 1.0, 0.2);
    const tFire = G(at(id, c(id, 2) + 1.5));
    clip(mix, 'metallo_colpi', { t: tFire - 0.03, da: 0.53, durata: 0.4, gain: 0.25, rev: 0.3 }); // la tagliola scatta
    clip(mix, 'fiammata', { t: tFire - 0.03, da: 0.22, durata: 1.6, gain: 0.3, fadeOut: 0.6, rev: 0.3 }); // la fiammata
    timp(tFire, 40, 104, 0.75);
    colpo(mix, 'grancassa', 'bdrum_f', { t: tFire, vel: 100, rev: 0.5, gain: 0.2, dur: 2, release: 0.6 });
    clip(mix, 'fuoco', { t: tFire + 0.3, da: 2, durata: B(T.aula) - 0.1 - tFire - 0.3, gain: 0.08, fadeIn: 0.3, fadeOut: 0.5, rev: 0.2 });
    strings(tFire + 2 * BEAT, B(T.aula), { vel: 40, gain: 0.26, k0: 3 }); // due battiti di silenzio, poi gli archi che calano
  }

  // ---- aula: le torce che frugano (pulsazione); le torce cadono; la luce del corridoio si spegne e la bava; le crepe; la cenere
  {
    const id = 'aula';
    pulse(B(T.aula), G(at(id, c(id, 0) + 2.8)) - 0.05, { vel: 56, gain: 0.32 });
    const tDrop = G(at(id, c(id, 0) + 2.8));
    strings(B(T.aula), tDrop - 0.05, { vel: 46, gain: 0.32, k0: 1 });
    strings(tDrop + BEAT, G(at(id, c(id, 1) + 0.4)) + 0.3, { vel: 46, gain: 0.32, k0: 2 });
    clip(mix, 'metallo_cade', { t: tDrop - 0.03, da: 0.64, durata: 0.9, gain: 0.25, fadeOut: 0.4, rev: 0.3, pan: 0.3 }); // Aula.tsx: le torce cadono
    timp(tDrop, 45, 88, 0.5);
    const tMon = G(at(id, c(id, 1) + 0.4));
    clip(mix, 'scariche', { t: tMon - 0.04, da: 2.4, durata: 0.25, gain: 0.08, fadeOut: 0.08, rev: 0.25, pan: 0.4 }); // la luce del corridoio si spegne
    trem(tMon + BEAT, G(at(id, c(id, 2) + 0.2)) - tMon - BEAT, [40, 41, 76, 77], { vel: 50, gain: 0.3 }); // la bava, i banchi che tremano
    for (let t = tMon + BEAT, k = 0; t < G(at(id, c(id, 2) + 0.2)) - 0.1; t += BEAT, k++) timp(t, 40, 60 + k * 4, 0.3);
    const tPin = G(at(id, c(id, 2) + 0.2));
    clip(mix, 'vetri', { t: tPin, da: 0.1, durata: 0.8, gain: 0.14, fadeOut: 0.3, rev: 0.35 }); // le crepe sulla lavagna
    horn(tPin, 40, 1.6, 0.34);
    horn(tPin, 46, 1.6, 0.28);
    roll(G(at(id, c(id, 2) + 1.8)), 1.2, 0.22);
    const tAsh = G(at(id, c(id, 2) + 1.8));
    clip(mix, 'esplosioni', { t: tAsh - 0.06, da: 3.2, durata: 2.2, gain: 0.1, fadeOut: 1, lp: 2500, rev: 0.4 }); // il lampo e la cenere
    timp(tAsh, 40, 110, 0.9);
    gong(tAsh + 0.02, 0.34);
    const q = tAsh + 2 * BEAT; // la cenere ricade: due battiti di silenzio, poi gli archi
    strings(q, NAT, { vel: 40, gain: 0.28, high: true, k0: 2 });
  }

  // ---- natale: la neve; Will a casa (il tema in Sol maggiore, finestre); la finestrella fredda del bagno; la lanterna e i waffle
  {
    const id = 'natale';
    clip(mix, 'vento_invernale', { t: T.natale, da: 4, durata: S[id].dur + 0.3, gain: 0.02, fadeIn: 1, fadeOut: 1, largo: 3, lp: 4000 });
    const tHome = G(at(id, c(id, 0) + 1.0));
    [71, 74, 79].forEach((m, k) => glock(tHome + k * CROMA, m, 0.16)); // Natale.tsx: le finestre si accendono
    strings(NAT, G(at(id, c(id, 1) + 1.6)), { vel: 46, gain: 0.32, chords: CHM });
    tema(Q(tHome), Q(cue(id, 1)), { vel: 48, gain: 0.32 });
    harp(Q(tHome), Q(cue(id, 1)), { vel: 44, gain: 0.22, chords: CHM });
    const tBath = G(at(id, c(id, 1) + 1.6));
    gong(tBath, 0.22); // la luce fredda del bagno
    trem(tBath, 1.6, [88, 89, 52, 53], { vel: 46, gain: 0.26 });
    strings(Q(tBath + 1.7), Q(cue(id, 2)), { vel: 40, gain: 0.26, k0: 2 });
    const tLamp = G(at(id, c(id, 2) + 0.4));
    [55, 59, 62, 67, 71].forEach((m, j) => suona(mix, 'arpa', m, { t: tLamp + j * 0.08, dur: 2.2, vel: 50, pan: -0.3 + j * 0.15, rev: 0.6, gain: 0.18, release: 1.3 })); // la lanterna
    for (let k = 0; k < 7; k++) pizz(tLamp + 2 * CROMA + k * CROMA, 43 + (k % 2) * 7, 0.18, 50 - k * 2); // gli stivali di Hopper
    tema(Q(tLamp) + 2 * BEAT, B(T.finale), { vel: 46, gain: 0.3, glk: 0.3 });
    // la domanda aperta: l'ultimo accordo resta sospeso (Mi minore con la nona)
    [[40, 'contrabbasso'], [52, 'celli'], [59, 'viole'], [66, 'violini']].forEach(([m, s], j) =>
      suona(mix, s, m, { t: Q(tLamp) + 2 * BEAT, dur: B(T.finale) - Q(tLamp) - 2 * BEAT + 0.4, vel: 44, gain: 0.3, pan: (j - 1.5) * 0.25, attack: 0.5, release: 1, rev: 0.6 }));
  }

  // ---- finale: un accordo di Sol maggiore aperto, l'arpa e l'ultima nota del tema
  const F = B(T.finale);
  [['contrabbasso', 31], ['celli', 43], ['viole', 55], ['viole', 59], ['violini', 62], ['violini', 71]].forEach(([s, n], k) =>
    suona(mix, s, n, { t: F, dur: T.END - F, vel: 52, pan: (k - 2.5) * 0.18, gain: 0.48, attack: 0.4, release: 1.6, rev: 0.6, seed: 30 + k }));
  [55, 59, 62, 67, 71, 74].forEach((m, j) => suona(mix, 'arpa', m, { t: F + j * BEAT / 3, dur: 2.4, vel: 50, pan: -0.3 + j * 0.12, rev: 0.6, gain: 0.28, release: 1.4 }));
  glock(F + 1.4, 79, 0.14);
};
