// Strumento di sviluppo: analizza copie locali di VSCO-2 Community Edition e di VCSL (stesso autore, CC0, più ampia:
// pianoforte a coda, timpani, batteria) e scrive scripts/audio/vsco.json
// (per ogni strumento: file, nota reale misurata, dinamica, inizio del suono, livello).
// Va rieseguito solo per aggiungere strumenti al catalogo qui sotto; il rendering usa vsco.json.
//   git clone https://github.com/sgossner/VSCO-2-CE.git <vsco>   (commit indicati in FONTI)
//   git clone https://github.com/sgossner/VCSL.git <vcsl>
//   node scripts/audio/vsco-indice.mjs <vsco> <vcsl>
import { readdirSync, writeFileSync } from 'node:fs';
import { readWav } from './wav.mjs';

/** Repository dei campioni, a commit fissato (il suono non cambia nel tempo). */
export const FONTI = {
  vsco: { repo: 'sgossner/VSCO-2-CE', commit: '440300901dfe9275fd84e0b7763af1f8443ae62e', licenza: 'CC0 (Versilian Studios / Sam Gossner, Ivy Audio / Simon Dalzell)' },
  vcsl: { repo: 'sgossner/VCSL', commit: 'c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e', licenza: 'CC0 (Versilian Studios / Sam Gossner)' },
};
/** Timpani VCSL: nota principale misurata sullo spettro (modo (1,1); l'autocorrelazione non la trova). */
const TIMPANI = { Timpani1: 41.6, Timpani2: 46.8, Timpani3: 49.5, Timpani4: 52.4, Timpani5: 54.5 };

/** id → cartella nel repository VSCO (e filtro facoltativo sul nome del file). Strumenti senza intonazione: perc. */
const CATALOGO = {
  violini: { dir: 'Strings/Violin Section/susVib' },
  viole: { dir: 'Strings/Viola Section/susvib' },
  celli: { dir: 'Strings/Cello Section/susvib' },
  contrabbasso: { dir: 'Strings/Solo Contrabass/SusNV' },
  violini_trem: { dir: 'Strings/Violin Section/Trem' },
  celli_trem: { dir: 'Strings/Cello Section/trem' },
  contrabbasso_pizz: { dir: 'Strings/Solo Contrabass/Pizz' },
  arpa: { dir: 'Strings/Harp' },
  pianoforte: { dir: 'Keys/Upright Piano', filter: /dyn[12]_/ , mappa: (f) => { const k = Number(/_(\d{3})\.wav$/.exec(f)[1]); return k === 44 ? 108 : 21 + 2 * k; } },
  glockenspiel: { dir: 'Percussion/Glock' },
  marimba: { dir: 'Percussion/Marimba' },
  violino_solo: { dir: 'Strings/Solo Violin/Arco Vib' },
  violini_pizz: { dir: 'Strings/Violin Section/Pizz' },
  celli_pizz: { dir: 'Strings/Cello Section/pizzT' },
  tromba_sordina: { dir: 'Brass/Trumpet/harmonM-sus' },
  tromba: { dir: 'Brass/Trumpet/sus' },
  tromba_stacc: { dir: 'Brass/Trumpet/stac' },
  corno: { dir: 'Brass/F Horn/sus' },
  corno_stacc: { dir: 'Brass/F Horn/stac' },
  trombone: { dir: 'Brass/Tenor Trombone/sus' },
  trombone_stacc: { dir: 'Brass/Tenor Trombone/stac' },
  celli_spicc: { dir: 'Strings/Cello Section/spic' },
  viole_spicc: { dir: 'Strings/Viola Section/spic' },
  // organo: i numeri nei nomi sono passi di 3 semitoni (36–96); l'autocorrelazione sbaglia ottava con i registri da 16'
  organo: { dir: 'Keys/Organ/Quiet', filter: /Man3/, mappa: (f) => numero(f) - 86 },
  organo_pedale: { dir: 'Keys/Organ/Quiet', filter: /Pedal/, mappa: (f) => numero(f) - 28 },
  organo_pieno: { dir: 'Keys/Organ/Loud', filter: /Man3/, mappa: (f) => numero(f) + 35 },
  grancassa: { dir: 'VSCO 1 Percussion/drums/bass', perc: true, filter: /^bdrum_(p|pp|ppp|mp|f|ff)[_ .]/ },
  grancassa_rullo: { dir: 'VSCO 1 Percussion/drums/bass', perc: true, filter: /^bdrum_roll/ },
  piatto_sospeso: { dir: 'VSCO 1 Percussion/varMetal/Cymbals/susp', perc: true },
  gong: { dir: 'VSCO 1 Percussion/varMetal/Gong', perc: true, filter: /^gong_hit_(p|pp|ppp|mp|mf|f)[_ .]/ },
  gong_graffio: { dir: 'VSCO 1 Percussion/varMetal/Gong', perc: true, filter: /^gong_scrape/ },
  // VCSL
  pianoforte_coda: { fonte: 'vcsl', dir: 'Chordophones/Zithers/Grand Piano, Steinway B/Sus' },
  timpani: { fonte: 'vcsl', dir: 'Membranophones/Struck Membranophones/Timpani 1/Hit', altezza: (f) => TIMPANI[f.split('_')[0]] },
  rullante: { fonte: 'vcsl', dir: 'Membranophones/Struck Membranophones/Snare Drum, Modern 1', perc: true, filter: /_Hit(NS|SN)_/ },
  cassa: { fonte: 'vcsl', dir: 'Membranophones/Struck Membranophones/Bass Drum 1', perc: true },
  charleston: { fonte: 'vcsl', dir: 'Idiophones/Struck Idiophones/Hi-Hat Cymbal', perc: true },
  tom: { fonte: 'vcsl', dir: 'Membranophones/Struck Membranophones/Tom 1/Stick', perc: true, filter: /_HitS_/ },
  piatto_crash: { fonte: 'vcsl', dir: 'Idiophones/Struck Idiophones/Clash Cymbals 1', perc: true, filter: /crash1_(pp|mp|mf|ff)/ },
};

const numero = (f) => Number(/_(\d{2,3})(?:_rr\d)?\.wav$/.exec(f)[1]);

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const etichetta = (f) => {
  const m = /(?:^|_)([A-G])(#|b)?(-?\d)(?=_|\.)/.exec(f);
  return m ? NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) + 1) * 12 : null;
};

/** Frequenza fondamentale (autocorrelazione normalizzata) su una finestra di 8192 campioni a partire da s0. */
const altezza = (x, sr, s0) => {
  const N = Math.min(8192, x.length - s0 - 2400);
  if (N < 2048) return null;
  const r = new Float64Array(2400);
  let mx = 0;
  for (let lag = 16; lag < 2400; lag++) {
    let s = 0, e1 = 0, e2 = 0;
    for (let i = 0; i < N; i += 2) { const a = x[s0 + i], b = x[s0 + i + lag]; s += a * b; e1 += a * a; e2 += b * b; }
    r[lag] = s / Math.sqrt(e1 * e2 + 1e-12);
    mx = Math.max(mx, r[lag]);
  }
  for (let lag = 17; lag < 2399; lag++) {
    if (r[lag] > 0.85 * mx && r[lag] >= r[lag - 1] && r[lag] >= r[lag + 1]) {
      // interpolazione parabolica del picco
      const d = (r[lag - 1] - r[lag + 1]) / (2 * (r[lag - 1] - 2 * r[lag] + r[lag + 1]) || 1);
      return { hz: sr / (lag + d), conf: mx };
    }
  }
  return null;
};

const analizza = (path, { perc, nota, mappa }) => {
  const { sr, L, R } = readWav(path);
  const m = new Float32Array(L.length);
  let peak = 0;
  for (let i = 0; i < m.length; i++) { m[i] = (L[i] + R[i]) / 2; peak = Math.max(peak, Math.abs(m[i])); }
  // inizio: primo campione sopra -40 dB dal picco, meno 3 ms
  let inizio = 0;
  while (inizio < m.length && Math.abs(m[inizio]) < peak * 0.01) inizio++;
  inizio = Math.max(0, inizio - Math.round(0.003 * sr));
  // livello: RMS massimo su finestre da 100 ms
  const w = Math.round(0.1 * sr);
  let rms = 0;
  for (let s = inizio; s + w < m.length; s += w / 2) {
    let e = 0;
    for (let i = 0; i < w; i++) e += m[s + i] ** 2;
    rms = Math.max(rms, Math.sqrt(e / w));
  }
  const out = { inizio: +(inizio / sr).toFixed(4), durata: +(m.length / sr).toFixed(3), db: +(20 * Math.log10(rms + 1e-9)).toFixed(1) };
  if (sr !== 44100) out.sr = sr;
  if (perc) return out;
  const det = altezza(m, sr, inizio + Math.round(Math.min(0.6, (m.length - inizio) / sr * 0.25) * sr));
  const detMidi = det ? 69 + 12 * Math.log2(det.hz / 440) : null;
  let midi = nota;
  if (midi === null) {
    if (detMidi === null) throw new Error(`Né etichetta né intonazione: ${path}`);
    midi = Math.round(detMidi);
  } else if (detMidi !== null && !mappa) {
    // le etichette di ottava cambiano convenzione tra strumenti: si annota l'ottava misurata, poi vale la maggioranza
    const k = Math.round((detMidi - midi) / 12);
    if (Math.abs(detMidi - (midi + 12 * k)) < 0.6) out.ottava = k;
  }
  out.midi = midi;
  // scordatura: scarto dalla nota a meno di ottave (l'autocorrelazione a volte sbaglia ottava)
  const scarto = detMidi === null ? null : ((detMidi - midi + 6) % 12 + 12) % 12 - 6;
  if (scarto !== null && Math.abs(scarto) < 0.5 && det.conf > 0.9) out.cents = Math.round(scarto * 100);
  return out;
};

const dinamica = (f) => {
  // «F2» è la nota Fa, non la dinamica forte: la dinamica «f» non è mai seguita da un numero o da un diesis
  const m = /_(v\d|vl\d|dyn\d|ppp|pp|p|mp|mf|ff|fff|f(?![#\d]))(?=[_ .\d])/i.exec(f);
  return m ? m[1].toLowerCase() : 'unica';
};

const radici = { vsco: process.argv[2], vcsl: process.argv[3] };
if (!radici.vsco || !radici.vcsl) {
  console.error('Uso: node scripts/audio/vsco-indice.mjs <cartella VSCO-2-CE> <cartella VCSL>');
  process.exit(1);
}
const strumenti = {};
for (const [id, def] of Object.entries(CATALOGO)) {
  const fonte = def.fonte ?? 'vsco';
  const root = radici[fonte];
  const files = readdirSync(`${root}/${def.dir}`).filter((f) => /\.wav$/i.test(f) && (!def.filter || def.filter.test(f))).sort();
  strumenti[id] = {
    ...(fonte !== 'vsco' ? { fonte } : {}),
    dir: def.dir,
    ...(def.perc ? { perc: true } : {}),
    campioni: files.map((f) => {
      const alt = def.altezza?.(f);
      const nota = def.perc ? null : alt !== undefined ? Math.round(alt) : def.mappa ? def.mappa(f) : etichetta(f);
      const a = analizza(`${root}/${def.dir}/${f}`, { perc: def.perc, nota, mappa: !!def.mappa || alt !== undefined });
      a.etichetta = nota;
      if (def.mappa) a.midi = nota; // il pianoforte e l'organo hanno la mappa dei tasti esatta
      if (alt !== undefined) { a.midi = Math.round(alt); a.cents = Math.round((alt - a.midi) * 100); }
      return { f, dyn: dinamica(f), ...a };
    }),
  };
  // ottava: la convenzione di maggioranza dello strumento vale per tutti i suoi campioni
  const conta = {};
  for (const c of strumenti[id].campioni) if (c.ottava !== undefined) conta[c.ottava] = (conta[c.ottava] ?? 0) + 1;
  const k = Number(Object.entries(conta).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0);
  for (const c of strumenti[id].campioni) {
    if (!def.perc && !def.mappa && !def.altezza && c.etichetta !== null) c.midi = c.etichetta + 12 * k;
    delete c.ottava;
    delete c.etichetta;
  }
  console.log(`${id}: ${files.length} campioni`);
}
writeFileSync('scripts/audio/vsco.json', JSON.stringify({ ...FONTI.vsco, fonti: FONTI, strumenti }, null, 1) + '\n');
