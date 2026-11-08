// Misure automatiche sui fotogrammi di una scena (usate da scripts/pacchetto.mjs).
// Sono la parte della lista comune (QUALITA.md §10) che si verifica senza guardare: segnalano i difetti più frequenti
// trovati dal revisore immagini (metà bassa vuota, inquadratura vuota, niente che si muove, camera ferma, evento
// invisibile, copertina che parte dal nero o in dissolvenza, miniatura senza contrasto). Le soglie sono tarate sui film
// già approvati: un avviso va guardato nel fotogramma, non è un errore automatico.
import { spawnSync } from 'node:child_process';

// Analisi in scala di grigi a 270×480 (1/4 di 1080×1920): coordinate del video divise per 4.
const W = 270, H = 480, K = 4;

/** Legge un PNG come matrice di luminanze 0–255 (W×H). */
export const grigio = (file) => {
  const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-i', file, '-vf', `scale=${W}:${H}:flags=area,format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: W * H * 2 });
  if (r.status !== 0) throw new Error(`ffmpeg su ${file}: ${r.stderr}`);
  return r.stdout;
};

/** Righe del video da analizzare (coordinate 1080×1920), x 120–960 salvo diverso. */
const zona = (y0, y1, x0 = 0, x1 = 1080) => ({ x0: x0 / K, x1: x1 / K, y0: y0 / K, y1: y1 / K });
// Zone senza testi fissi: tra il titolo e i sottotitoli, e sotto i sottotitoli.
const SCENA = [zona(660, 1260), zona(1500, 1920)];
const pixel = (zone, f) => { for (const z of zone) for (let y = z.y0; y < z.y1; y++) for (let x = z.x0; x < z.x1; x++) f(y * W + x); };

/** Deviazione standard della luminanza: quanto la zona non è un campo uniforme. */
const dev = (g, zone) => {
  let n = 0, s = 0, s2 = 0;
  pixel(zone, (i) => { n++; s += g[i]; s2 += g[i] * g[i]; });
  return Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2));
};
/** Dettaglio: media dei salti di luminanza tra pixel vicini (contorni, texture). */
const dettaglio = (g, zone) => {
  let n = 0, s = 0;
  pixel(zone, (i) => { if (i % W < W - 1 && i + W < g.length) { n++; s += Math.abs(g[i] - g[i + 1]) + Math.abs(g[i] - g[i + W]); } });
  return s / n;
};
/** Quota di pixel (%) che cambiano di più di `soglia` livelli tra due fotogrammi. */
const cambio = (a, b, zone, soglia = 6) => {
  let n = 0, c = 0;
  pixel(zone, (i) => { n++; if (Math.abs(a[i] - b[i]) > soglia) c++; });
  return (100 * c) / n;
};
/** Distanza tra il 5° e il 98° percentile della luminanza: c'è un chiaro forte (il titolo) su un fondo scuro, o viceversa. */
const escursione = (g) => {
  const h = new Array(256).fill(0);
  for (const x of g) h[x]++;
  const p = (q) => { let a = 0; for (let i = 0; i < 256; i++) { a += h[i]; if (a >= q * g.length) return i; } return 255; };
  return p(0.98) - p(0.05);
};
const media = (g, zone) => { let n = 0, s = 0; pixel(zone, (i) => { n++; s += g[i]; }); return s / n; };

// Soglie (tarate sui film approvati, vedi QUALITA.md §10).
export const SOGLIE = {
  basso: 6,       // deviazione nella metà bassa (y 1500–1920): sotto, fascia uniforme = primo piano mancante
  centro: 4,      // dettaglio nella fascia degli oggetti chiave (y 660–1260): sotto, inquadratura vuota
  moto: 0.15,     // % di pixel che cambiano tra due fotogrammi consecutivi: sotto, niente si muove
  camera: 3,      // % di pixel cambiati tra inizio e fine capitolo: sotto, camera e scena ferme
  evento: 2,      // % di pixel cambiati attorno alla frase con il cambiamento più grande: sotto, nessun evento visibile
  copertinaNero: 15, // luminanza media del fotogramma 0: sotto, la copertina parte dal nero
  copertinaDiff: 25, // % di pixel cambiati tra fotogramma 0 e 1 s: sopra, la copertina entra in dissolvenza
  miniatura: 120, // escursione chiaro-scuro della copertina in miniatura (5°–98° percentile): sotto, si legge male in piccolo
};

/**
 * Istanti da rendere per le misure di un capitolo: m (metà) e m + 1 fotogramma, inizio e fine,
 * e per ogni frase dalla seconda in poi poco prima e 1,2 s dopo (dove cadono gli eventi agganciati alla voce).
 */
export const istantiCapitolo = (c, cues, fps = 30) => {
  const fine = c.durata - 0.5, m = +(c.durata / 2).toFixed(2);
  const t = [1, fine, m, +(m + 1 / fps).toFixed(4)];
  cues.slice(1).forEach((s) => t.push(Math.max(0, +(s - 0.1).toFixed(2)), Math.min(c.durata - 0.1, +(s + 1.2).toFixed(2))));
  return [...new Set(t)];
};
export const istantiLocandina = () => [0, 1, 3];

/** Misure di un capitolo: f(sec) = matrice grigia del fotogramma a quel secondo. Restituisce valori e avvisi. */
export const misuraCapitolo = (c, cues, f) => {
  const fine = c.durata - 0.5, m = +(c.durata / 2).toFixed(2);
  const v = {
    basso: dev(f(m), [zona(1500, 1920)]),
    centro: dettaglio(f(m), [zona(660, 1260, 120, 960)]),
    moto: cambio(f(m), f(+(m + 1 / 30).toFixed(4)), SCENA, 3),
    camera: cambio(f(1), f(fine), SCENA),
    eventi: cues.slice(1).map((s) => cambio(f(Math.max(0, +(s - 0.1).toFixed(2))), f(Math.min(c.durata - 0.1, +(s + 1.2).toFixed(2))), SCENA)),
  };
  const A = [];
  if (v.basso < SOGLIE.basso) A.push(`metà bassa quasi uniforme (deviazione ${v.basso.toFixed(1)} < ${SOGLIE.basso}): manca un primo piano che tocca il bordo`);
  if (v.centro < SOGLIE.centro) A.push(`poco dettaglio tra y 660 e 1260 (${v.centro.toFixed(1)} < ${SOGLIE.centro}): inquadratura vuota o oggetto chiave mancante`);
  if (v.moto < SOGLIE.moto) A.push(`quasi niente si muove tra due fotogrammi vicini (${v.moto.toFixed(2)}% < ${SOGLIE.moto}%): mancano particelle o piccole animazioni`);
  if (v.camera < SOGLIE.camera) A.push(`immagine quasi uguale a inizio e fine (${v.camera.toFixed(1)}% < ${SOGLIE.camera}%): camera o parallasse non si vedono`);
  if (v.eventi.length && Math.max(...v.eventi) < SOGLIE.evento) A.push(`nessuna frase porta un cambiamento visibile (massimo ${Math.max(...v.eventi).toFixed(1)}% < ${SOGLIE.evento}%): evento invisibile?`);
  return { v, A };
};

/** Misure della copertina (miniatura e aggancio): fotogramma 0 completo, non scuro, contrastato in piccolo. */
export const misuraCopertina = (f) => {
  const tutto = [zona(0, 1920)];
  const v = { luce: media(f(0), tutto), entrata: cambio(f(0), f(1), tutto, 12), contrasto: escursione(f(0)), primi3: cambio(f(0), f(3), tutto) };
  const A = [];
  if (v.luce < SOGLIE.copertinaNero) A.push(`fotogramma 0 quasi nero (luminanza ${v.luce.toFixed(0)} < ${SOGLIE.copertinaNero}): la copertina deve essere completa dal primo fotogramma`);
  if (v.entrata > SOGLIE.copertinaDiff) A.push(`tra 0 e 1 s cambia ${v.entrata.toFixed(0)}% dell'immagine (> ${SOGLIE.copertinaDiff}%): la copertina entra in dissolvenza, il fotogramma 0 non è completo`);
  if (v.contrasto < SOGLIE.miniatura) A.push(`poco stacco tra chiari e scuri in miniatura (${v.contrasto.toFixed(0)} < ${SOGLIE.miniatura}): soggetto e titolo poco leggibili in piccolo`);
  return { v, A };
};
