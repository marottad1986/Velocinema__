import React from 'react';
import { clamp01, eio, eo, lerp, seg } from '../../lib/anim';
import { SANS } from '../../lib/fonts';
import { FxDefs } from '../../lib/fx';
import { Fog, Glow, Stars, flashAt } from '../../lib/elements';
import { Corridoio, neonAt } from '../../lib/liminale';
import { H, Motes16, W } from '../fx16';
import {
  ASYNC, Async, COPY, Cappello, stanzaDi, CasaForum, CasaMary, Cinema, Divano, Fessura, INK, L0, L1, L2, Livelli, Livello0, Mano, NIGHT, Negozio,
  PAPER, RED, Stanzetta, Studio, Terra, X, YEL, mix,
} from './Luoghi';
import { Anello, Cartello, Icona, ManoS, Nodo, Tag, cartW, tagW } from './Segni';
import { Pov, POV_SEGMENTI, type Finestra } from './Pov';

// Backrooms spiegato, video lungo YouTube (YOUTUBE.md §4): UN SOLO MONDO in cui la camera viaggia. Il mondo è una
// grande sezione, come una casa delle bambole tagliata: in superficie, di notte, la casa del forum, il negozio di mobili
// di Clark, lo studio di Mary, l'istituto Async e il cinema; sotto terra il Livello 0, infinito, a stanze gialle.
// Passo avanti (ASTICELLA.md): dalla sezione la camera ENTRA in una stanza e il disegno diventa un corridoio in
// prospettiva vera che la camera percorre (src/lib/liminale.tsx, Pov.tsx), e poi ne esce tornando alla sezione: due viste
// dello stesso mondo, senza stacchi (la finestra della stanza si allarga fino a riempire lo schermo).
// Personaggi = cerchi con un oggetto, mai figure (CLAUDE.md): Clark = cartellino del prezzo, Mary = taccuino, Naren =
// torcia, Phil = telecamera, Kat = cartellino col nome, Bobby = cuore, il pirata = solo il cappello, gli uomini di Async =
// maschera antigas. Copie = grigio; anello rosso = il nodo da capire; cartelli «LA REGOLA», «TEORIA».
// Tutto è funzione di T (secondi dall'inizio del lungo); gli eventi cadono sulla croma (75 bpm → 0,4 s), gli stessi istanti
// dello spartito scripts/audio/backrooms-spiegato.mjs.

import { CROMA, DUR, E, S, STARTS, TITOLI, capitoloDi, ev, g, inCap } from './Tempi';
export { CROMA, DUR, E, S, STARTS, ev, g, inCap };

const capOp = (T: number, id: string, a = S(id), b = E(id)) => seg(T, a, a + 0.3) * (1 - seg(T, b - 0.1, b + 0.4));

// ---------------------------------------------------------------------------------------------------------------- camera

/** Finestra 16:9 nel mondo (centro x, y e altezza): la camera la riempie con lo zoom 1080 / h. */
export const fin = (x: number, y: number, h = 250): Finestra => ({ x, y, h });
const zFin = (f: Finestra) => H / f.h;
type Key = [number, number, number, number, number?];
const K = (T: number, x: number, y: number, z: number, mv = 1.6): Key => [T, x, y, z, mv];
const KF = (T: number, f: Finestra, mv = 1.4): Key => [T, f.x, f.y, zFin(f), mv];
const Y0 = (L0.top + L0.bot) / 2; // centro del Livello 0

const SHOTS: Key[] = [
  // aggancio: dentro il corridoio (Pov), poi fuori: il mondo intero, il negozio e Async, il pirata e il cemento
  KF(0, POV_SEGMENTI[0].f, 0),
  K(ev('aggancio', 2, -0.4), 2700, 120, 0.5, 3.2),
  K(ev('aggancio', 3), 3400, -60, 0.6, 2.6),
  K(ev('aggancio', 4, -0.4), X.tavola + 200, Y0 - 20, 1.6, 2.0),
  K(E('aggancio') - 1.6, X.forum + 60, -170, 1.5, 2.0),
  // COSA SONO LE BACKROOMS
  K(ev('foto', 1), X.forum + 90, -150, 2.4, 2.2),
  KF(ev('foto', 3, -0.2), POV_SEGMENTI[1].f, 2.0),
  K(S('noclip') + 0.2, X.forum + 30, -60, 1.25, 1.8),
  K(ev('noclip', 1, 0.4), X.forum + 30, 40, 0.95, 2.2),
  K(ev('noclip', 3, -0.6), X.forum + 150, Y0 - 60, 1.3, 2.4),
  KF(E('noclip') - 0.8, POV_SEGMENTI[2].f, 1.6),
  K(ev('livello0', 2, 0.6), 1200, Y0, 0.9, 2.2),
  K(S('liminale') + 0.4, 760, Y0 - 30, 1.9, 2.4),
  K(ev('liminale', 1, 0.4), 1180, Y0 - 30, 1.9, 2.4),
  K(ev('liminale', 2), 1640, Y0 - 30, 1.9, 2.4),
  K(ev('liminale', 3), 1180, Y0 + 10, 1.25, 2.0),
  K(S('leggenda'), 2200, 520, 0.42, 3.0),
  K(ev('leggenda', 2), 2600, 820, 0.48, 2.6),
  K(ev('leggenda', 4, -0.4), 1100, -640, 0.75, 2.4),
  K(ev('oshkosh', 1), 1220, -660, 0.95, 2.2),
  K(ev('oshkosh', 2), 1380, -620, 0.9, 2.0),
  K(ev('oshkosh', 3, -0.2), X.negozio - 120, -250, 0.85, 2.4),
  K(S('parsons'), 1000, -260, 1.0, 2.4),
  K(ev('parsons', 2), 1000, 160, 0.6, 2.8),
  K(ev('parsons', 3), 1150, -230, 0.85, 2.4),
  K(S('async'), X.async - 80, 40, 0.95, 2.8),
  K(ev('async', 1, 0.8), X.anello + 60, 300, 0.85, 2.0),
  K(S('a24'), X.cinema, -230, 1.05, 2.8),
  K(ev('a24', 2), X.cinema - 40, -250, 1.35, 2.0),
  K(ev('a24', 3), 4900, 0, 0.42, 3.0),
  // LA STORIA DEL FILM
  K(S('cassetta'), X.monitor, 140, 2.2, 2.4),
  KF(ev('cassetta', 0, 1.4), POV_SEGMENTI[3].f, 2.0),
  K(ev('cassetta', 3), X.monitor - 60, 150, 1.6, 1.8),
  K(S('negozio'), X.negozio - 40, -230, 1.05, 2.6),
  K(ev('negozio', 2, -0.2), X.negozio - 540, -380, 1.25, 2.0),
  K(ev('negozio', 3), X.studio + 260, -170, 1.05, 2.6),
  K(S('fessura'), X.negozio + 260, 110, 1.6, 2.4),
  K(ev('fessura', 1), X.fessura - 60, 120, 2.2, 1.8),
  KF(ev('fessura', 2, -0.2), POV_SEGMENTI[4].f, 1.6),
  K(ev('fessura', 3, 1.0), X.fessura, 160, 1.15, 1.8),
  K(ev('fessura', 4), X.fessura + 600, 280, 0.62, 2.4),
  K(S('commessi'), X.fessura + 240, Y0 - 20, 1.2, 2.4),
  K(ev('commessi', 2), X.fessura + 420, Y0, 1.3, 2.0),
  K(ev('commessi', 4), X.kat - 60, Y0, 1.6, 2.0),
  K(S('mary'), X.studio + 200, -160, 1.3, 2.4),
  K(ev('mary', 1), 2900, 40, 0.55, 2.6),
  K(ev('mary', 2), X.kat - 80, Y0, 1.5, 2.2),
  K(S('tavola'), X.tavola, Y0 - 10, 1.3, 2.4),
  K(ev('tavola', 1), X.tavola + 40, Y0 + 10, 1.9, 2.0),
  K(ev('tavola', 3), X.tavola - 60, Y0, 1.5, 2.0),
  K(S('regola'), X.casaMary - 300, 250, 0.62, 2.6),
  K(ev('regola', 3), X.tavola + 600, Y0, 0.9, 2.4),
  K(S('uscita'), 3000, 620, 0.36, 2.6),
  K(ev('uscita', 1), X.fessura + 300, 220, 0.62, 2.4),
  K(ev('uscita', 3), 3300, Y0, 0.5, 2.2),
  K(S('pirata'), X.tavola, Y0 - 10, 1.4, 2.4),
  K(ev('pirata', 1, 0.4), X.tavola + 160, Y0 - 30, 1.15, 1.6),
  K(ev('pirata', 2), X.negozio + 200, -60, 0.48, 2.2),
  KF(ev('pirata', 3, 0.6), POV_SEGMENTI[5].f, 1.4),
  K(ev('cemento', 3), X.anello, 260, 0.85, 2.2),
  // la stanzetta degli interrogatori
  K(S('phil'), X.stanzetta + 50, 190, 1.6, 2.4),
  K(ev('phil', 1), X.monitor + 200, 150, 1.0, 2.2),
  K(ev('phil', 3), X.stanzetta + 50, 200, 1.8, 2.0),
  K(ev('phil', 4, 0.4), X.stanzetta + 50, 340, 0.9, 2.4),
  // IL FINALE SPIEGATO: il volo lungo le copie
  K(S('montaggio'), X.copiaNeg, Y0, 1.6, 2.0),
  K(ev('montaggio', 1), X.copiaStudio, Y0, 1.6, 2.4),
  K(ev('montaggio', 2), X.copiaStanza, Y0, 1.7, 2.4),
  K(ev('montaggio', 3), X.copiaStanza + 40, Y0 + 20, 2.6, 2.0),
  K(S('mostra'), X.stanzetta + 20, 320, 0.95, 2.4),
  K(ev('mostra', 2), 4000, 160, 0.42, 2.4),
  K(ev('mostra', 3), X.stanzetta + 20, 330, 0.9, 2.2),
  K(S('sorte'), 5200, 160, 0.62, 2.4),
  K(S('metafora'), 3300, Y0, 0.62, 2.4),
  K(ev('metafora', 2), X.tavola, Y0, 1.2, 2.0),
  K(ev('metafora', 3), 3300, Y0, 0.55, 2.0),
  KF(S('dettaglio') + 0.2, POV_SEGMENTI[6].f, 1.6),
  K(ev('dettaglio', 4), X.fessura + 200, 200, 0.7, 2.8),
  K(S('seguito'), X.fessura, 150, 1.2, 2.4),
  K(ev('seguito', 1), 4600, 260, 0.38, 3.0),
  // chiusura: il negozio e la fessura nella metà sinistra (la destra resta libera)
  K(S('chiusura'), X.negozio + 1000, 40, 0.62, 2.6),
  K(S('chiusura') + 3, X.negozio + 960, 60, 0.7, 16),
];
SHOTS.sort((a, b) => a[0] - b[0]);
import type { Cam } from './Tempi';
export type { Cam };
const lungo = (from: Cam, key: Key, T: number): Cam => {
  const [t1, x1, y1, z1, mv = 1.6] = key;
  const k = mv > 0 ? eio(seg(T, t1, t1 + mv)) : 1;
  return { x: lerp(from.x, x1, k), y: lerp(from.y, y1, k), z: Math.exp(lerp(Math.log(from.z), Math.log(z1), k)) };
};
// partenza di ogni movimento = dove si trova davvero la camera in quell'istante: nessuno scatto tra le inquadrature
const PARTENZE: Cam[] = [];
SHOTS.forEach((key, i) => {
  if (i === 0) { PARTENZE.push({ x: key[1], y: key[2], z: key[3] }); return; }
  PARTENZE.push(lungo(PARTENZE[i - 1], SHOTS[i - 1], key[0]));
});
export const camAt = (T: number): Cam => {
  let i = 0;
  while (i + 1 < SHOTS.length && SHOTS[i + 1][0] <= T) i++;
  const c = lungo(PARTENZE[i], SHOTS[i], T);
  // deriva lenta e continua (si spegne dentro le finestre, dove si muove il corridoio)
  const d = 1 - clamp01(povPieno(T, c));
  return { x: c.x + Math.sin(T * 0.21) * 8 * d / c.z, y: c.y + Math.sin(T * 0.17) * 5 * d / c.z, z: c.z * (1 + 0.012 * Math.sin(T * 0.35) * d) };
};
/** Quanto la finestra del corridoio riempie lo schermo (1 = tutto). */
const povPieno = (T: number, c: Cam) => {
  const s = POV_SEGMENTI.find((p) => T >= p.t0 && T < p.t1 + 3);
  return s ? clamp01((c.z * s.f.h) / H) : 0;
};
const toScreen = (c: Cam, x: number, y: number): [number, number] => [W / 2 + (x - c.x) * c.z, H / 2 + (y - c.y) * c.z];

/**
 * Tiene un elemento (centro sullo schermo, mezza larghezza e mezza altezza in px) dentro le zone del 16:9 (QUALITA.md §10):
 * x 96–1824, sopra i sottotitoli (y ≤ 780), sotto il titolo del capitolo a sinistra (y ≥ 250 fin dove arriva il titolo).
 */
export const fitS = (T: number, x: number, y: number, hw: number, hh: number): [number, number] => {
  // un elemento del tutto fuori quadro (la camera è altrove) resta dov'è: si corregge solo ciò che si vede
  if (x + hw < 0 || x - hw > W || y + hh < 0 || y - hh > H) return [x, y];
  const cap = capitoloDi(T);
  const titoloFino = cap ? 96 + TITOLI[cap] * 31 + 40 : 0;
  let sx = Math.min(Math.max(x, 96 + hw), 1824 - hw);
  const top = cap && sx - hw < titoloFino ? 250 : 70;
  const bottom = T >= S('chiusura') ? 1000 : 780;
  const sy = Math.min(Math.max(y, top + hh), Math.max(top + hh, bottom - hh));
  if (T >= S('chiusura') && sx + hw > 1000) sx = 1000 - hw; // metà destra libera per la schermata finale
  return [sx, sy];
};

// ---------------------------------------------------------------------------------------------------------------- stati

const keys = (T: number, ks: [number, number, number?][]) => {
  const ord = [...ks].sort((p, q) => p[0] - q[0]);
  let v = ord[0][1];
  for (const [t0, val, mv = 1.2] of ord) if (T >= t0) v = lerp(v, val, eio(seg(T, t0, t0 + mv)));
  return v;
};
/** La fessura nel seminterrato: 0 chiusa, 1 aperta. */
const fessuraK = (T: number) => keys(T, [[0, 1], [ev('fessura', 1, -0.4), 0, 0.01], [ev('fessura', 1), 1, 0.8], [ev('seguito', 0), 0.15, 4], [S('chiusura'), 0.6, 2]]);
/** Luci del Livello 0 (buio a ondate). */
const buio0 = (T: number) => (x: number) => {
  let b = 0;
  // nella fuga dal pirata i neon si spengono uno dopo l'altro verso la camera
  if (T >= ev('pirata', 1) && T < S('phil')) b = Math.max(b, seg(T, ev('pirata', 1) + (x - X.tavola - 1600) / -900, ev('pirata', 1) + (x - X.tavola - 1600) / -900 + 0.3) * 0.85);
  if (inCap(T, 'mary')) b = Math.max(b, 0.9 * seg(T, ev('mary', 3, 0.4), ev('mary', 3, 0.7)) * (Math.abs(x - X.kat) < 900 ? 1 : 0.3));
  if (inCap(T, 'commessi')) b = Math.max(b, 0.4 * seg(T, ev('commessi', 2), ev('commessi', 2, 0.6)) * (x > X.fessura + 300 && x < X.fessura + 1400 ? 1 : 0));
  return b;
};

// ---------------------------------------------------------------------------------------------------------------- mondo

export const Mondo: React.FC<{ T: number; cam?: Cam; w?: number; h?: number; pulito?: boolean }> = ({ T, cam: cam0, w = W, h = H, pulito = false }) => {
  const cam = cam0 ?? camAt(T);
  const view = (f = 1, fy = f) => `translate(${w / 2} ${h / 2}) scale(${cam.z}) translate(${-cam.x * f} ${-cam.y * fy})`;
  const x0 = cam.x - w / 2 / cam.z - 400, x1 = cam.x + w / 2 / cam.z + 400;
  const flash = flashAt(T, [ev('cemento', 1, 0.8), ev('dettaglio', 3, 0.8)].filter((t) => T >= t - 0.05));
  const sc = (x: number, y: number) => toScreen(cam, x, y);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="br16" />
        <linearGradient id="br16-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#05060C" />
          <stop offset=".6" stopColor="#111426" />
          <stop offset="1" stopColor="#2A2436" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#br16-sky)" />
      <g transform={`translate(${-cam.x * 0.02 * cam.z} ${-cam.y * 0.02 * cam.z})`}>
        <Stars t={T} seed={2019} n={120} x={-200} y={-200} w={w + 400} h={h * 0.8} color="#E8E4F4" size={1.1} />
      </g>
      {/* città lontana (parallasse) */}
      <g transform={view(0.45, 0.6)}>
        {Array.from({ length: 40 }, (_, i) => {
          const bx = -1500 + i * 300, bh = 120 + ((i * 53) % 170);
          return (
            <g key={i}>
              <rect x={bx} y={-bh - 40} width={220} height={bh + 400} fill="#141626" />
              {Array.from({ length: 4 }, (_, k) => <rect key={k} x={bx + 30 + (k % 2) * 90} y={-bh + 10 + Math.floor(k / 2) * 50} width={40} height={24} fill="#3A3A52" opacity={(i + k) % 3 === 0 ? 0.9 : 0.25} />)}
            </g>
          );
        })}
      </g>
      <g transform={view()}>
        <Terra x0={x0} x1={x1} />
        {/* strada */}
        <rect x={x0} y={-14} width={x1 - x0} height={14} fill="#2A2A30" />
        <Livello0 T={T} x0={x0} x1={x1} buio={buio0(T)} rotto={inCap(T, 'pirata') || inCap(T, 'cemento') ? 0.8 : 0.15} />
        <Livelli T={T} x0={x0} x1={x1}
          k1={keys(T, [[0, 0], [ev('leggenda', 1, -0.2), 1, 1.2], [ev('leggenda', 4), 0.35, 1.2], [S('oshkosh'), 0], [S('uscita'), 1, 1.2], [ev('uscita', 1), 0, 1.2]])}
          k2={keys(T, [[0, 0], [ev('leggenda', 1, 0.6), 1, 1.2], [ev('leggenda', 4), 0.35, 1.2], [S('oshkosh'), 0], [S('uscita'), 1, 1.2], [ev('uscita', 1), 0, 1.2]])}
          croce={inCap(T, 'uscita') ? seg(T, ev('uscita', 0, 2.2), ev('uscita', 0, 2.8)) : 0} />
        {/* in superficie */}
        <CasaForum T={T} griglia={inCap(T, 'noclip') ? seg(T, ev('noclip', 1), ev('noclip', 1, 0.8)) * (1 - seg(T, E('noclip') - 1, E('noclip'))) : 0} />
        <Negozio T={T} fessura={fessuraK(T)} sfarfalla={inCap(T, 'fessura') ? 1 - seg(T, ev('fessura', 2), ev('fessura', 2, 1)) : 0.15}
          luci={keys(T, [[0, 0.75], [S('mary'), 0.35, 1], [S('tavola'), 0.75, 1]])} />
        <Studio T={T} spia={inCap(T, 'mary') ? 1 : 0} />
        <CasaMary k={keys(T, [[0, 0], [ev('negozio', 4), 1, 1], [S('fessura'), 0.35, 1.5], [S('regola'), 1, 1], [S('uscita'), 0.35, 1], [S('dettaglio'), 1, 1], [S('seguito'), 0.35, 1.5]])} />
        <Async T={T} anello={keys(T, [[0, 0.3], [ev('async', 1), 1, 0.8], [S('cassetta'), 0.3, 1.5], [ev('cemento', 3), 1, 0.8], [S('phil'), 0.3, 1.5], [S('sorte'), 1, 1], [S('metafora'), 0.3]])}
          tv={inCap(T, 'cassetta') ? 1 : 0} stanzetta={keys(T, [[0, 0.3], [S('phil'), 1, 1], [ev('phil', 4, 0.4), 0.4, 1.5], [S('mostra'), 1, 1], [S('sorte'), 0.6]])} />
        <Cinema T={T} on={keys(T, [[0, 0.3], [S('a24'), 1, 1.2], [S('cassetta'), 0.4, 1.5]])} />
        {/* le copie nel Livello 0 (il finale): il negozio, lo studio e la stanzetta, storti e grigi */}
        <Copie T={T} />
        <MondoCapitoli T={T} />
        {/* lampioni e cespugli scuri in primo piano sulla strada (parallasse) */}
        <g transform={`translate(${-cam.x * 0.25} 0)`} opacity={1 - seg(cam.y, -120, 60)}>
          {Array.from({ length: 30 }, (_, i) => {
            const bx = -1600 + i * 420 + ((i * 97) % 160);
            return (
              <g key={i} transform={`translate(${bx} 10)`}>
                <path d={`M-110 30 Q-110 -60 0 -70 Q110 -60 110 30 Z`} fill="#06070C" />
                {i % 4 === 0 && <g><path d="M60 0 V-210 Q60 -230 90 -230" stroke="#06070C" strokeWidth={10} fill="none" /><Glow id={`br16-lamp${i}`} x={96} y={-222} r={70} t={T} color="#F2D58A" amp={0.05} rate={1} opacity={0.35} /></g>}
              </g>
            );
          })}
        </g>
        <Fog id="br16-fog" t={T} y={L0.bot - 20} x={3500} rx={6000} ry={60} color="#E9DA8E" opacity={0.08} drift={400} speed={0.04} />
      </g>
      {/* il corridoio in prospettiva dentro la finestra della stanza (Pov.tsx) */}
      {w === W && <Pov T={T} cam={cam} pulito={pulito} />}
      {!pulito && <Schermo T={T} sc={sc} cam={cam} />}
      {/* ombra morbida dietro etichetta e titolo */}
      {!pulito && T >= S('foto') && T < S('chiusura') && (
        <>
          <defs>
            <radialGradient id="br16-tit" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(330 110) scale(860 200)">
              <stop offset="0" stopColor="#06060A" stopOpacity=".8" />
              <stop offset=".6" stopColor="#06060A" stopOpacity=".45" />
              <stop offset="1" stopColor="#06060A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={w} height={330} fill="url(#br16-tit)" />
        </>
      )}
      {w === W && <Motes16 T={T} color="#F4E9B8" k={0.6} />}
      {/* buio prima del colpo del cemento e del dettaglio (momenti clou) */}
      {!pulito && (() => {
        const clou = (t: number) => seg(T, t - 0.6, t + 0.1) * (1 - seg(T, t + 0.3, t + 1.4));
        const dk = Math.max(0.5 * clou(ev('cemento', 1, 0.8)), 0.45 * clou(ev('dettaglio', 3, 0.8)), 0.7 * seg(T, ev('cassetta', 2, 1.2), ev('cassetta', 2, 1.6)) * (1 - seg(T, ev('cassetta', 2, 2.4), ev('cassetta', 2, 3))));
        return dk > 0 ? <rect width={w} height={h} fill="#020203" opacity={0.85 * dk} /> : null;
      })()}
      {flash > 0 && <rect width={w} height={h} fill="#FFF6DA" opacity={0.4 * flash} />}
      <rect width={w} height={h} fill="#2A2410" opacity={0.08} />
      <rect width={w} height={h} fill="url(#br16-vig)" />
      <rect width={w} height={h} fill="url(#br16-grain)" opacity=".45" />
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------------------------- copie

const Copie: React.FC<{ T: number }> = ({ T }) => {
  const k = keys(T, [[0, 0], [ev('regola', 3), 0.7, 1.2], [S('uscita'), 0, 1], [ev('aggancio', 3), 0.6, 1], [S('foto'), 0, 0.5], [S('montaggio'), 1, 1], [S('seguito'), 0.4, 2]]);
  if (k <= 0.01) return null;
  const st = 0.6 + 0.4 * Math.sin(T * 0.8);
  const tremo = inCap(T, 'dettaglio') ? seg(T, ev('dettaglio', 2), ev('dettaglio', 2, 0.6)) * (1 - seg(T, ev('dettaglio', 4), ev('dettaglio', 4, 1))) : 0;
  const tx = tremo * Math.sin(T * 50) * 6;
  return (
    <g opacity={k} transform={`translate(${tx} 0)`}>
      {/* copia del negozio: divani storti e grigi */}
      <Divano x={X.copiaNeg - 120} y={L0.bot - 22} c="#9A8A6A" s={0.9} storto={st * 0.8} />
      <Divano x={X.copiaNeg + 120} y={L0.bot - 22} c="#8A8A7A" s={0.8} storto={-st * 0.7} />
      <Cappello x={X.copiaNeg + 20} y={L0.top + 70} s={0.6} rot={-14} c="#4A4650" />
      {/* copia dello studio: poltrona e segreteria storte */}
      <g transform={`translate(${X.copiaStudio} ${L0.bot - 22}) skewX(${-12 * st})`}>
        <Divano x={-60} y={0} c="#7A7488" s={0.7} />
        <rect x={60} y={-60} width={90} height={10} fill="#5A5048" stroke={INK} strokeWidth={3} />
        <rect x={74} y={-84} width={60} height={24} rx={4} fill="#3A3A40" stroke={INK} strokeWidth={3} />
      </g>
      {/* copia della stanzetta: la lampada e il tavolo, storti; sulla sedia il taccuino grigio di Mary */}
      <Stanzetta x={X.copiaStanza} y={L0.bot - 22} T={T} k={0.8} storto={st * 0.9} c="#E8D890" />
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------------- disegni nel mondo, capitolo per capitolo

/** Linea che si disegna nel mondo (tratteggio = passaggio, percorso dei passi). */
const Linea: React.FC<{ T: number; t0: number; d: string; id: string; color?: string; w?: number; dashed?: boolean; dur?: number; fade?: number }> = ({
  T, t0, d, id, color = YEL, w = 7, dashed = true, dur = 1, fade = 1,
}) => {
  if (T < t0 || fade <= 0) return null;
  const p = eo(seg(T, t0, t0 + dur));
  return (
    <g opacity={fade}>
      <mask id={id} maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="16000" height="7000"><path d={d} fill="none" stroke="#fff" strokeWidth={w + 16} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dashed ? `${w * 3} ${w * 2.2}` : undefined} strokeDashoffset={-T * 50} strokeLinecap="round" mask={`url(#${id})`} />
    </g>
  );
};

const MondoCapitoli: React.FC<{ T: number }> = ({ T }) => (
  <g>
    {/* noclip: il puntatore che cade attraverso il pavimento fino al Livello 0 */}
    {inCap(T, 'noclip') && (() => {
      const t0 = ev('noclip', 1, 0.6);
      const p = eio(seg(T, t0, ev('noclip', 3, 0.8)));
      const y = lerp(-60, Y0 + 40, p);
      return (
        <g opacity={capOp(T, 'noclip')}>
          <Linea T={T} t0={t0} d={`M${X.forum + 60} -60 V${Y0 + 40}`} id="br-noclip" dur={ev('noclip', 3, 0.8) - t0} />
          {T >= t0 - 0.4 && <g transform={`translate(${X.forum + 60} ${y}) rotate(${p * 200}) scale(1.3)`}><Icona k="utente" /></g>}
        </g>
      );
    })()}
    {/* liminale: tre stanze del Livello 0 diventano luoghi di passaggio vuoti */}
    {T >= S('liminale') && T < E('leggenda') && <Liminali T={T} />}
    {/* leggenda: pagine dell'enciclopedia dei fan attaccate ai muri; esploratori con la torcia */}
    {T >= ev('leggenda', 3, -0.2) && T < E('leggenda') + 0.5 && (
      <g opacity={capOp(T, 'leggenda', ev('leggenda', 3, -0.2))}>
        {Array.from({ length: 9 }, (_, i) => {
          const t0 = ev('leggenda', 3, i * 0.2);
          const px = 900 + i * 520, py = (i % 3 === 0 ? L0.top + 50 : i % 3 === 1 ? L1.top + 40 : L2.top + 20);
          return T < t0 ? null : (
            <g key={i} transform={`translate(${px} ${py}) rotate(${(i % 2 ? 6 : -5)}) scale(${eo(seg(T, t0, t0 + 0.3))})`}>
              <rect x={-60} y={0} width={120} height={150} fill="#F4F0E4" stroke={INK} strokeWidth={3} />
              <rect x={-48} y={14} width={60} height={12} fill="#3A6A9A" />
              {[40, 58, 76, 94, 112, 130].map((ly) => <path key={ly} d={`M-48 ${ly} H${30 - (ly % 3) * 14}`} stroke="#8A8478" strokeWidth={4} />)}
              <circle cx={0} cy={-2} r={7} fill={RED} stroke={INK} strokeWidth={2} />
            </g>
          );
        })}
      </g>
    )}
    {/* parsons: la videocassetta gigante nel cielo e il nastro che scende nel Livello 0 */}
    {T >= S('parsons') && T < E('parsons') + 0.5 && <Videocassetta T={T} />}
    {/* async: il passaggio aperto dall'anello verso il Livello 0, e gli esploratori che scendono */}
    {T >= ev('async', 1) && T < E('a24') + 0.5 && (
      <g opacity={capOp(T, 'async', ev('async', 1), E('a24'))}>
        <Linea T={T} t0={ev('async', 1, 0.4)} d={`M${X.anello} 250 V${L0.top + 40}`} id="br-async" w={10} />
        {T >= ev('async', 2) && [0, 1, 2].map((i) => {
          const p = seg(T, ev('async', 2, i * 0.8), ev('async', 2, i * 0.8 + 2.4));
          return p <= 0 ? null : <g key={i} transform={`translate(${X.anello + (p > 0.6 ? (p - 0.6) * 1200 : 0)} ${lerp(200, Y0 + 30, Math.min(1, p / 0.6))}) scale(0.7)`} opacity={1 - seg(p, 0.85, 1)}><circle r={34} fill="#241E10" stroke={ASYNC} strokeWidth={4} /><g transform="scale(0.7)"><Icona k="torcia" /></g></g>;
        })}
      </g>
    )}
    {/* fessura: il percorso di Clark dentro e fuori; la telecamera di Phil nel Livello 0 collegata ai monitor */}
    {inCap(T, 'fessura') && (
      <g opacity={capOp(T, 'fessura')}>
        <Linea T={T} t0={ev('fessura', 3, 0.6)} d={`M${X.fessura - 40} 160 Q${(X.fessura + X.studio) / 2} -260 ${X.studio - 40} -90`} id="br-racconta" color={PAPER} dur={1.4} />
        {T >= ev('fessura', 4, -0.2) && (
          <g>
            <Linea T={T} t0={ev('fessura', 4, 0.4)} d={`M${X.fessura + 700} ${L0.top + 40} Q${(X.fessura + X.monitor) / 2} ${L0.top - 120} ${X.monitor} 230`} id="br-phil" color={RED} dur={1.6} w={5} />
            <g transform={`translate(${X.fessura + 700} ${L0.top + 34}) scale(0.9)`}><Icona k="telecamera" T={T} /></g>
          </g>
        )}
      </g>
    )}
    {/* commessi: il muro che si alza tra Clark e Kat */}
    {T >= ev('commessi', 3) && T < E('mary') && (
      <g opacity={capOp(T, 'commessi', ev('commessi', 3), E('mary'))}>
        <rect x={X.fessura + 320} y={lerp(L0.bot, L0.top, eo(seg(T, ev('commessi', 3), ev('commessi', 3, 0.8))))} width={34} height={L0.bot - L0.top} fill="#B9A24C" stroke={INK} strokeWidth={4} />
      </g>
    )}
    {/* mary: il percorso dallo studio al negozio, alla fessura e giù */}
    {inCap(T, 'mary') && (
      <g opacity={capOp(T, 'mary')}>
        <Linea T={T} t0={ev('mary', 1)} d={`M${X.studio - 40} -60 Q${X.negozio + 900} -200 ${X.fessura} 120 L${X.fessura + 100} ${Y0} H${X.kat - 160}`} id="br-mary" color={PAPER} dur={3} />
      </g>
    )}
    {/* tavola: la sala da pranzo copiata, le tre copie bianche, il frigorifero */}
    {T >= S('tavola') - 0.5 && T < E('cemento') + 0.5 && <Tavola T={T} />}
    {/* regola: la casa di Mary che scende e diventa copie sempre più storte */}
    {inCap(T, 'regola') && (
      <g opacity={capOp(T, 'regola')}>
        {[0, 1, 2].map((i) => {
          const t0 = ev('regola', i === 0 ? 1 : 2, i === 2 ? 1.2 : 0.4);
          if (T < t0) return null;
          const p = eo(seg(T, t0, t0 + 1.4));
          return (
            <g key={i} transform={`translate(${lerp(X.casaMary, X.tavola + 500 + i * 420, p)} ${lerp(-10, L0.bot - 26, p)}) skewX(${(i + 1) * 8 * Math.sin(T * 0.9 + i)}) scale(${0.55 - i * 0.05})`}>
              <CasaMary k={1} vera={1} x={0} y={0} color={i === 0 ? '#E8DFC0' : i === 1 ? '#C8BE9A' : '#9A9278'} />
            </g>
          );
        })}
      </g>
    )}
    {/* uscita: il percorso dei passi che torna alla fessura */}
    {inCap(T, 'uscita') && (
      <g opacity={capOp(T, 'uscita')}>
        <Linea T={T} t0={ev('uscita', 2)} d={`M${X.copiaStudio} ${Y0 + 60} H${X.fessura + 120} Q${X.fessura + 40} ${Y0 - 40} ${X.fessura} 140`} id="br-uscita" w={12} dur={2} />
        {T >= ev('uscita', 3) && <Linea T={T} t0={ev('uscita', 3)} d={`M${X.copiaStudio} ${Y0 + 60} q-200 -80 -400 0 t-300 40 t-200 -60 t-400 30`} id="br-giro" color={RED} w={6} dur={2} />}
      </g>
    )}
    {/* pirata: il cappello gigante che arriva sotto il soffitto, le impronte della gamba di legno; il legame con l'insegna */}
    {T >= ev('pirata', 1, 0.4) && T < E('cemento') && (
      <g>
        {(() => {
          const p = eio(seg(T, ev('pirata', 1, 0.4), ev('pirata', 1, 2.4)));
          return (
            <g>
              <Cappello x={lerp(X.tavola + 900, X.tavola + 320, p)} y={L0.top + 40} s={1.5} rot={-6 + Math.sin(T * 3) * 4} />
              {Array.from({ length: 6 }, (_, k) => {
                const t0 = ev('pirata', 1, 0.4 + k * 0.4);
                return T < t0 ? null : <ellipse key={k} cx={X.tavola + 900 - k * 110} cy={L0.bot - 6} rx={16} ry={6} fill="#2A2210" opacity={0.8} />;
              })}
            </g>
          );
        })()}
        {inCap(T, 'pirata') && <Linea T={T} t0={ev('pirata', 2, 0.4)} d={`M${X.negozio - 400} -440 Q${X.negozio + 1600} -100 ${X.tavola + 320} ${L0.top + 20}`} id="br-copia" color={COPY} w={6} dur={1.6} />}
      </g>
    )}
    {/* cemento: gli uomini di Async portano Mary su dall'anello */}
    {T >= ev('cemento', 3, -0.2) && T < E('cemento') + 0.5 && (
      <g opacity={capOp(T, 'cemento', ev('cemento', 3, -0.2))}>
        <Linea T={T} t0={ev('cemento', 3)} d={`M${X.tavola + 300} ${Y0} H${X.anello - 60} V200`} id="br-porta" color={ASYNC} dur={2.2} />
      </g>
    )}
    {/* mostra e sorte: il legame tra la stanzetta vera e la copia */}
    {T >= ev('mostra', 1) && T < E('sorte') && (
      <g opacity={capOp(T, 'mostra', ev('mostra', 1), E('sorte'))}>
        <Linea T={T} t0={ev('mostra', 1, 0.3)} d={`M${X.stanzetta + 50} 230 V${L0.bot - 100}`} id="br-legame" color={COPY} w={8} dur={1.2} />
      </g>
    )}
    {/* sorte: le due strade */}
    {inCap(T, 'sorte') && (
      <g opacity={capOp(T, 'sorte')}>
        <Linea T={T} t0={ev('sorte', 1, 0.3)} d={`M${X.stanzetta - 100} 150 H${X.anello + 40} V${L0.top + 80}`} id="br-giu" color={RED} w={9} dur={1.6} />
        <Linea T={T} t0={ev('sorte', 2, 0.3)} d={`M${X.stanzetta + 200} 150 Q${X.stanzetta + 700} 40 ${X.cinema + 100} -60`} id="br-su" color={YEL} w={9} dur={1.6} />
      </g>
    )}
    {/* dettaglio: la casa di Mary disegnata a linee piene sopra il Livello 0 */}
    {inCap(T, 'dettaglio') && (
      <g opacity={capOp(T, 'dettaglio')}>
        <Linea T={T} t0={ev('dettaglio', 4)} d={`M${X.tavola + 150} ${Y0} H${X.fessura + 120} Q${X.fessura + 40} ${Y0 - 40} ${X.fessura} 140`} id="br-esce" w={12} dur={2.2} />
      </g>
    )}
    {/* seguito: una fessura nuova che si accende lontano */}
    {T >= ev('seguito', 1) && T < S('chiusura') + 1 && (
      <g opacity={capOp(T, 'seguito', ev('seguito', 1), S('chiusura') + 1)}>
        <Fessura x={6900} y={Y0} k={eo(seg(T, ev('seguito', 1, 0.6), ev('seguito', 1, 2)))} T={T} h={180} />
      </g>
    )}
  </g>
);

/** I luoghi di passaggio vuoti (spazi liminali) dentro tre stanze del Livello 0. */
const Liminali: React.FC<{ T: number }> = ({ T }) => {
  const k = capOp(T, 'liminale', ev('liminale', 1, -0.4), E('liminale') + 1);
  const b = 0.4 * seg(T, ev('liminale', 2, 0.4), ev('liminale', 2, 1.4));
  const y = L0.bot - 22;
  return (
    <g opacity={k}>
      {/* corridoio di scuola: armadietti */}
      <g transform={`translate(700 ${y})`}>
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}><rect x={-150 + i * 50} y={-170} width={46} height={170} fill={mix('#4A7A9A', '#1A2A34', b)} stroke={INK} strokeWidth={3} /><path d={`M${-138 + i * 50} -150 H${-116 + i * 50} M${-138 + i * 50} -140 H${-116 + i * 50}`} stroke={INK} strokeWidth={2} /></g>
        ))}
      </g>
      {/* piscina chiusa */}
      <g transform={`translate(1160 ${y})`}>
        <rect x={-170} y={-40} width={340} height={40} fill={mix('#5AB8C8', '#1A3A40', b)} stroke={INK} strokeWidth={3} />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-170 + i * 40} -40 V0`} stroke="#E8F4F4" strokeWidth={1.5} opacity={0.5} />)}
        <path d={`M120 -40 V-140 M150 -40 V-140 M120 -70 H150 M120 -100 H150`} stroke="#C8D0D4" strokeWidth={6} />
      </g>
      {/* centro commerciale all'alba: la scala mobile ferma */}
      <g transform={`translate(1620 ${y})`}>
        <path d="M-170 0 L30 -170 H100 V0 Z" fill={mix('#8A8A92', '#2A2A30', b)} stroke={INK} strokeWidth={4} />
        {/* i gradini */}
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-150 + i * 20} ${-17 - i * 17} h20 v17`} fill="none" stroke={mix('#C8C8D0', '#3A3A40', b)} strokeWidth={3} />)}
        {/* il corrimano nero con la fascia scura */}
        <path d="M-190 -40 L20 -222 Q40 -236 60 -222 H110" fill="none" stroke="#141418" strokeWidth={14} strokeLinecap="round" />
        <path d="M-180 -40 L-180 0 M110 -222 V0" stroke="#5A5A62" strokeWidth={8} />
        <rect x={110} y={-120} width={70} height={60} fill={mix('#E8C87A', '#3A3020', b)} stroke={INK} strokeWidth={3} />
      </g>
    </g>
  );
};

/** La videocassetta gigante di Kane Parsons. */
const Videocassetta: React.FC<{ T: number }> = ({ T }) => {
  const k = capOp(T, 'parsons');
  const x = 960, y = -175; // appoggiata sulla strada, tra la casa del forum e il negozio
  const srot = eo(seg(T, ev('parsons', 1, 0.4), ev('parsons', 1, 1.6)));
  return (
    <g opacity={k}>
      <g transform={`translate(${x} ${y}) scale(${pop2(T, S('parsons'))})`}>
        <rect x={-260} y={-150} width={520} height={300} rx={20} fill="#1E2030" stroke={INK} strokeWidth={8} />
        <rect x={-200} y={-120} width={400} height={90} rx={8} fill="#E8E0C8" stroke={INK} strokeWidth={4} />
        <text y={-62} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={40} fill={INK} letterSpacing="4">FOUND FOOTAGE</text>
        {[-110, 110].map((cx) => (
          <g key={cx} transform={`translate(${cx} 60) rotate(${T * 180})`}>
            <circle r={52} fill="#3A3428" stroke="#E8E0C8" strokeWidth={5} />
            {[0, 60, 120].map((a) => <path key={a} d="M-44 0 H44" stroke="#E8E0C8" strokeWidth={4} transform={`rotate(${a})`} />)}
          </g>
        ))}
        <rect x={-150} y={110} width={300} height={30} fill="#0A0A10" />
      </g>
      {/* il nastro che si srotola e scende nel Livello 0 */}
      {srot > 0 && <path d={`M${x} ${y + 140} Q${x + 300} ${lerp(y + 140, -200, srot)} ${x - 100} ${lerp(y + 160, Y0, srot)}`} stroke="#3A3428" strokeWidth={14} fill="none" strokeLinecap="round" />}
      {/* le puntate della serie: cassette impilate */}
      {T >= ev('parsons', 3, 0.6) && Array.from({ length: 8 }, (_, i) => {
        const t0 = ev('parsons', 3, 0.6 + i * 0.15);
        return T < t0 ? null : <rect key={i} x={x + 340} y={y + 120 - i * 44} width={180} height={38} rx={5} fill={i % 2 ? '#2A2C40' : '#1E2030'} stroke={INK} strokeWidth={4} transform={`translate(0 ${(1 - eo(seg(T, t0, t0 + 0.3))) * -80})`} />;
      })}
    </g>
  );
};
const pop2 = (T: number, t0: number) => 0.85 + 0.15 * eo(seg(T, t0, t0 + 0.6));

/** La sala da pranzo copiata nel Livello 0: tavola, quattro sedie, tre copie bianche informi, il frigorifero. */
const Tavola: React.FC<{ T: number }> = ({ T }) => {
  const k = capOp(T, 'tavola', S('tavola'), E('cemento'));
  const x = X.tavola, y = L0.bot - 22;
  const st = stanzaDi(x);
  const bx0 = st.x + 26, bx1 = st.x + st.w - 26; // il muro di fondo della stanza (Luoghi.tsx, Livello0)
  const bianco = eo(seg(T, ev('tavola', 1), ev('tavola', 1, 1)));
  const cola = seg(T, ev('tavola', 2), ev('tavola', 2, 3));
  return (
    <g opacity={k}>
      {/* carta da parati sbagliata (fiori, non righe), solo sul muro di fondo di questa stanza */}
      <rect x={bx0} y={L0.top + 30} width={bx1 - bx0} height={L0.bot - L0.top - 76} fill="#9A7A6A" />
      {Array.from({ length: Math.floor((bx1 - bx0) / 46) * 3 }, (_, i) => {
        const n = Math.floor((bx1 - bx0) / 46);
        return <circle key={i} cx={bx0 + 23 + (i % n) * 46} cy={L0.top + 60 + Math.floor(i / n) * 52} r={7} fill="#C89A8A" />;
      })}
      {/* frigorifero */}
      <rect x={x + 118} y={y - 150} width={56} height={150} rx={7} fill="#E8E4D8" stroke={INK} strokeWidth={4} />
      <path d={`M${x + 118} ${y - 98} H${x + 174} M${x + 165} ${y - 136} V${y - 112}`} stroke={INK} strokeWidth={3} />
      {/* tavola */}
      <rect x={x - 160} y={y - 70} width={226} height={13} fill="#7A5A3A" stroke={INK} strokeWidth={4} />
      <path d={`M${x - 150} ${y - 57} V${y} M${x + 56} ${y - 57} V${y}`} stroke={INK} strokeWidth={6} />
      {[-150, -94, -38].map((dx, i) => (
        <g key={i}>
          <ellipse cx={x + dx + 20} cy={y - 73} rx={13} ry={4} fill="#E8E4D8" stroke={INK} strokeWidth={2} />
          {/* sedia */}
          <path d={`M${x + dx + 4} ${y} V${y - 44} H${x + dx + 36} V${y} M${x + dx + 4} ${y - 44} V${y - 104}`} stroke={INK} strokeWidth={5} fill="none" />
          {/* la copia bianca: una massa bassa e larga, come cera colata sulla sedia (nessuna figura, mai più alta dello schienale) */}
          {bianco > 0 && (
            <path d={`M${x + dx - 2} ${y - 44} C${x + dx - 4} ${y - 44 - 30 * bianco} ${x + dx + 10} ${y - 44 - 40 * bianco} ${x + dx + 22} ${y - 44 - 34 * bianco} C${x + dx + 34} ${y - 44 - 44 * bianco} ${x + dx + 44} ${y - 44 - 22 * bianco} ${x + dx + 42} ${y - 44}
              C${x + dx + 41} ${y - 30 + 22 * cola} ${x + dx + 36} ${y - 26 + 26 * cola} ${x + dx + 33} ${y - 44 + 8} C${x + dx + 28} ${y - 30 + 12 * cola} ${x + dx + 22} ${y - 36} ${x + dx + 14} ${y - 40}
              C${x + dx + 8} ${y - 30 + 18 * cola} ${x + dx + 2} ${y - 32} ${x + dx - 2} ${y - 44} Z`}
              fill="#F2EFE6" stroke={INK} strokeWidth={3} opacity={bianco} />
          )}
        </g>
      ))}
      {/* la sedia di Mary, con la corda */}
      <path d={`M${x + 104} ${y} V${y - 44} H${x + 72} V${y} M${x + 104} ${y - 44} V${y - 104}`} stroke={INK} strokeWidth={5} fill="none" />
      {T < ev('pirata', 1) && <path d={`M${x + 70} ${y - 66} Q${x + 88} ${y - 56} ${x + 106} ${y - 66}`} stroke="#C8A86A" strokeWidth={5} fill="none" />}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------------- sopra lo schermo

/** Elementi a grandezza fissa sullo schermo, ancorati al mondo (personaggi, cartellini, cartelli, anelli). */
const Schermo: React.FC<{ T: number; sc: (x: number, y: number) => [number, number]; cam: Cam }> = ({ T, sc, cam }) => {
  const vis = (id: string, a = S(id), b = E(id)) => T >= a && T < b + 0.5;
  /** Punto del mondo sullo schermo, corretto con fit per un elemento hw × hh. */
  const at = (x: number, y: number, hw: number, hh: number) => fitS(T, ...sc(x, y), hw, hh);
  const nodo = (x: number, y: number, props: Omit<React.ComponentProps<typeof Nodo>, 'x' | 'y' | 'T'>) => {
    const [sx, sy] = at(x, y, 110, props.sub ? 110 : 90);
    return <Nodo T={T} x={sx} y={sy - 20} {...props} />;
  };
  const tag = (x: number, y: number, t0: number, text: string, opt: { until?: number; bg?: string; fg?: string; size?: number; rot?: number } = {}) => {
    const size = opt.size ?? 46;
    const [sx, sy] = at(x, y, tagW(text, size) / 2, size * 0.85);
    return <Tag T={T} t0={t0} x={sx} y={sy} text={text} {...opt} />;
  };
  const cart = (x: number, y: number, t0: number, head: string, text: string, until?: number, color?: string) => {
    const [sx, sy] = fitS(T, x, y, cartW(text) / 2, 85);
    return <Cartello T={T} t0={t0} x={sx} y={sy} head={head} text={text} until={until} color={color} />;
  };
  const mano = (x: number, y: number, t0: number, text: string, until?: number, size = 84, color?: string) => {
    const [sx, sy] = at(x, y, text.length * size * 0.24, size * 0.5);
    return <ManoS T={T} t0={t0} x={sx} y={sy + size * 0.3} text={text} size={size} until={until} color={color} />;
  };
  const ring = (x: number, y: number, r: number, on: number) => { const [sx, sy] = sc(x, y); return <Anello T={T} x={sx} y={sy} r={r} on={on} />; };
  const fermo = (x: number, y: number) => fitS(T, x, y, 200, 60);
  const dead = (t: number) => seg(T, t, t + 0.6);
  void cam;
  return (
    <g>
      {/* AGGANCIO: le tre promesse e il dettaglio (il pirata e il cemento, mostrati prima) */}
      {vis('aggancio', ev('aggancio', 2)) && T < S('foto') && (
        <g>
          {tag(X.negozio + 200, -560, ev('aggancio', 2, 0.6), 'IL FILM', { until: ev('aggancio', 4, -0.4) })}
          {tag(X.async, -420, ev('aggancio', 3, 0.4), 'IL FINALE', { until: ev('aggancio', 4, -0.4), bg: RED, fg: PAPER })}
          {nodo(X.tavola + 360, L0.top + 60, { t0: ev('aggancio', 4, 0.2), icon: 'cappello', fade: 1 - seg(T, E('aggancio') - 1.6, E('aggancio') - 1) })}
          {nodo(X.tavola + 60, Y0 + 50, { t0: ev('aggancio', 4, 0.8), icon: 'cemento', ring: 1, fade: 1 - seg(T, E('aggancio') - 1.6, E('aggancio') - 1) })}
          {(() => { const [sx, sy] = at(X.tavola + 60, Y0 + 50, 110, 90); return <Anello T={T} x={sx} y={sy - 20} r={86} on={seg(T, ev('aggancio', 4, 1.2), ev('aggancio', 4, 1.8)) * (1 - seg(T, E('aggancio') - 1.6, E('aggancio') - 1))} />; })()}
        </g>
      )}
      {/* FOTO */}
      {vis('foto') && (
        <g>
          {nodo(X.forum + 90, -260, { t0: S('foto') + 0.4, icon: 'utente', name: 'UTENTE ANONIMO', fade: capOp(T, 'foto', S('foto'), ev('foto', 2)) })}
          {tag(X.forum - 160, -380, ev('foto', 0, 1.2), '12 MAGGIO 2019', { until: ev('foto', 3, -0.4) })}
          {mano(X.forum + 400, -330, ev('foto', 1, 0.4), 'foto che mettono a disagio', ev('foto', 3, -0.4), 64)}
        </g>
      )}
      {/* NOCLIP */}
      {vis('noclip') && (
        <g>
          {tag(X.forum + 420, -200, ev('noclip', 1, 0.4), 'FUORI DALLA REALTÀ', { until: ev('noclip', 3) })}
          {tag(X.forum + 420, 60, ev('noclip', 2), 'NOCLIP', { size: 90, bg: '#8FE0A8', until: ev('noclip', 3, -0.2) })}
          {mano(X.forum + 420, 200, ev('noclip', 2, 0.8), 'attraverso i muri', ev('noclip', 3, -0.2), 70)}
        </g>
      )}
      {/* LIVELLO 0: le scritte nel corridoio sono in Pov.tsx; fuori, l'etichetta del livello */}
      {vis('livello0', ev('livello0', 2, 0.6)) && tag(1200, L0.top - 60, ev('livello0', 2, 1.2), 'LIVELLO 0', { size: 70 })}
      {/* LIMINALE */}
      {vis('liminale') && (
        <g>
          {tag(1150, L0.top - 90, ev('liminale', 1), 'SPAZIO LIMINALE', { size: 56 })}
          {mano(1640, L0.top - 90, ev('liminale', 1, 1.2), 'luoghi di passaggio', ev('liminale', 3), 62)}
          {mano(1150, L0.bot + 70, ev('liminale', 3, 0.4), 'qui non dovresti esserci', E('liminale'), 76, '#F28A7A')}
        </g>
      )}
      {/* LEGGENDA */}
      {vis('leggenda') && (
        <g>
          {tag(1500, L0.top - 60, S('leggenda') + 0.6, 'LIVELLO 0', { until: ev('leggenda', 4, -0.4) })}
          {tag(1700, L1.top - 50, ev('leggenda', 1, 0.2), 'LIVELLO 1 · PARCHEGGIO', { until: ev('leggenda', 4, -0.4) })}
          {tag(2300, L2.top - 50, ev('leggenda', 1, 1.0), 'LIVELLO 2 · TUNNEL', { until: ev('leggenda', 4, -0.4) })}
          {mano(3300, L1.top - 60, ev('leggenda', 2, 0.2), 'creature, regole, esploratori', ev('leggenda', 4, -0.4), 64)}
          {mano(1150, -360, ev('leggenda', 4, 0.6), 'dove è stata scattata?', E('leggenda'), 72)}
        </g>
      )}
      {/* la foto (polaroid gigante) dalla fine della leggenda a oshkosh */}
      {T >= ev('leggenda', 4) && T < E('oshkosh') + 0.5 && <Polaroid T={T} sc={sc} />}
      {/* OSHKOSH */}
      {vis('oshkosh') && (
        <g>
          {tag(1000, -950, ev('oshkosh', 1), 'RITROVATA NEL 2024', { until: ev('oshkosh', 3) })}
          {tag(1600, -330, ev('oshkosh', 2, 0.6), 'OSHKOSH · 2002', { bg: RED, fg: PAPER, until: ev('oshkosh', 3, 1) })}
          {tag(X.negozio + 380, -560, ev('oshkosh', 3, 1.4), 'UN NEGOZIO DI MOBILI', { until: E('oshkosh') })}
          {ring(X.negozio - 260, -512, 200, seg(T, ev('oshkosh', 3, 1.8), ev('oshkosh', 3, 2.4)) * capOp(T, 'oshkosh'))}
        </g>
      )}
      {/* PARSONS */}
      {vis('parsons') && (
        <g>
          {nodo(560, -330, { t0: S('parsons') + 0.6, icon: 'cassetta', name: 'KANE PARSONS', sub: '16 anni', fade: capOp(T, 'parsons') })}
          {tag(960, -420, ev('parsons', 0, 1.6), '7 GENNAIO 2022', { until: ev('parsons', 2) })}
          {tag(1480, -300, ev('parsons', 1, 0.6), '9 MINUTI · ANNI \'90', { until: ev('parsons', 2) })}
          {tag(1150, -470, ev('parsons', 3, 0.4), 'DECINE DI MILIONI DI VISTE', { bg: RED, fg: PAPER })}
          {mano(1650, -120, ev('parsons', 3, 1.6), 'diventa una serie', E('parsons'), 66)}
        </g>
      )}
      {/* ASYNC */}
      {vis('async') && (
        <g>
          {tag(X.async - 380, -120, S('async') + 0.6, 'ISTITUTO ASYNC', { bg: ASYNC })}
          {mano(X.async + 560, 90, ev('async', 1, 0.6), 'un passaggio, per caso', ev('async', 2, 0.6), 64)}
          {tag(X.anello + 560, Y0, ev('async', 2, 0.8), 'IN SEGRETO', { bg: RED, fg: PAPER })}
        </g>
      )}
      {/* A24 */}
      {vis('a24') && (
        <g>
          {tag(X.cinema - 300, -520, ev('a24', 0, 1.4), 'A24 · 2023', { until: ev('a24', 3) })}
          {tag(X.cinema + 330, -470, ev('a24', 1, 0.6), 'VANCOUVER · ESTATE 2025', { until: ev('a24', 3) })}
          {mano(X.cinema, -40, ev('a24', 1, 2), 'il suo primo film', ev('a24', 2, 0.8), 64)}
          {tag(X.async, -420, ev('a24', 3, 1.2), 'LO STESSO ASYNC', { bg: ASYNC })}
          {tag(X.negozio, -560, ev('a24', 3, 0.6), 'PERSONAGGI NUOVI')}
        </g>
      )}
      {/* CASSETTA: data e scritte sono nel televisore (Pov.tsx); fuori, il nome di Naren */}
      {vis('cassetta', ev('cassetta', 3)) && (
        <g>
          {nodo(X.monitor - 280, 60, { t0: ev('cassetta', 3, 0.2), icon: 'torcia', name: 'NAREN', sub: 'esploratore di Async', dead: dead(ev('cassetta', 3, 0.8)) })}
          {mano(X.monitor + 260, 30, ev('cassetta', 3, 1.2), 'si rischia la vita', E('cassetta'), 64, '#F28A7A')}
        </g>
      )}
      {/* NEGOZIO */}
      {vis('negozio') && (
        <g>
          {nodo(X.negozio + 200, -150, { t0: S('negozio') + 0.6, icon: 'prezzo', name: 'CLARK', sub: 'ex architetto', fade: capOp(T, 'negozio', S('negozio'), ev('negozio', 3, 0.6)) })}
          {mano(X.negozio + 520, -440, ev('negozio', 1, 0.6), 'come quello della foto!', ev('negozio', 3), 60)}
          {ring(X.negozio - 400, -436, 120, seg(T, ev('negozio', 2, 1.0), ev('negozio', 2, 1.6)) * (1 - seg(T, ev('negozio', 3), ev('negozio', 3, 0.4))))}
          {tag(X.negozio - 400, -300, ev('negozio', 2, 1.4), 'LA MASCOTTE: UN PIRATA', { until: ev('negozio', 3) })}
          {nodo(X.studio - 60, -150, { t0: ev('negozio', 3, 0.4), icon: 'taccuino', name: 'MARY', sub: 'la sua psicologa' })}
          {mano(X.casaMary, -340, ev('negozio', 4, 0.6), 'la casa demolita', E('negozio'), 64)}
        </g>
      )}
      {/* FESSURA */}
      {vis('fessura') && (
        <g>
          {mano(X.negozio + 200, -20, S('fessura') + 0.6, 'le luci sfarfallano', ev('fessura', 1), 64)}
          {tag(X.fessura, -20, ev('fessura', 1, 0.6), 'UNA FESSURA', { until: ev('fessura', 2) })}
          {nodo(X.fessura - 200, 120, { t0: ev('fessura', 3, 0.8), icon: 'prezzo', name: 'CLARK', fade: 1 - seg(T, ev('fessura', 4, -0.2), ev('fessura', 4, 0.3)) })}
          {nodo(X.fessura + 920, L0.top - 210, { t0: ev('fessura', 4, 1.0), icon: 'telecamera', name: 'PHIL', sub: 'scienziato di Async' })}
        </g>
      )}
      {/* COMMESSI */}
      {vis('commessi') && (() => {
        const p = eio(seg(T, S('commessi') + 0.2, S('commessi') + 2.4));
        const bx = X.fessura + lerp(100, 900, eio(seg(T, ev('commessi', 2), ev('commessi', 2, 1.4))));
        return (
          <g>
            {nodo(X.fessura + lerp(0, 220, p), Y0, { t0: S('commessi') + 0.2, icon: 'prezzo', name: 'CLARK', shake: seg(T, ev('commessi', 4), ev('commessi', 4, 0.5)), ring: inCap(T, 'commessi') && T > ev('commessi', 4) ? 1 : 0, color: RED })}
            {nodo(X.fessura + lerp(0, 440, p), Y0, { t0: ev('commessi', 1, 0.2), icon: 'nome', name: 'KAT', sub: 'la sua vice' })}
            {nodo(bx, Y0, { t0: ev('commessi', 1, 1.4), icon: 'cuore', name: 'BOBBY', sub: 'il fidanzato', dead: dead(ev('commessi', 2, 1.2)), fade: 1 - seg(T, ev('commessi', 3), ev('commessi', 3, 0.6)) })}
            {tag(X.fessura + 220, L0.top - 60, ev('commessi', 0, 1.8), 'IN CERCA DI PROVE', { until: ev('commessi', 2) })}
          </g>
        );
      })()}
      {/* MARY */}
      {vis('mary') && (
        <g>
          {mano(X.studio + 120, -330, S('mary') + 0.8, '«resterò laggiù»', ev('mary', 1, 1), 70)}
          {nodo(X.studio - 60, -150, { t0: S('mary') + 0.3, icon: 'taccuino', name: 'MARY', fade: 1 - seg(T, ev('mary', 1, 0.6), ev('mary', 1, 1)) })}
          {nodo(X.kat - 160, Y0, { t0: ev('mary', 2), icon: 'taccuino', name: 'MARY', fade: 1 - seg(T, ev('mary', 3, 0.8), ev('mary', 3, 1.4)) })}
          {nodo(X.kat - 420, Y0, { t0: ev('mary', 2, 0.4), icon: 'prezzo', name: 'CLARK', shake: 1, ring: 1, color: RED })}
        </g>
      )}
      {/* TAVOLA */}
      {vis('tavola') && (
        <g>
          {nodo(X.tavola + 110, Y0 - 130, { t0: S('tavola') + 0.6, icon: 'taccuino', name: 'MARY', sub: 'legata' })}
          {tag(X.tavola - 40, L0.top - 50, ev('tavola', 3), 'STILL LIFE · NATURE MORTE', { size: 44 })}
          {mano(X.tavola - 260, L0.top + 60, ev('tavola', 2, 0.6), 'copie da mangiare', ev('tavola', 3, 0.6), 60)}
          {nodo(X.tavola - 420, Y0, { t0: ev('tavola', 4, 0.2), icon: 'nome', name: 'KAT', dead: dead(ev('tavola', 4, 0.6)) })}
        </g>
      )}
      {/* REGOLA */}
      {vis('regola') && (
        <g>
          {(() => { const [x, y] = fermo(...sc(X.casaMary - 400, -420)); return <Cartello T={T} t0={S('regola') + 0.4} x={x} y={y} head="LA REGOLA" text="COPIANO I RICORDI, MALE" />; })()}
          {mano(X.tavola + 900, L0.top - 40, ev('regola', 2, 0.6), 'fotocopia di una fotocopia', ev('regola', 3, 0.6), 62)}
          {tag(X.tavola + 600, L0.bot + 70, ev('regola', 4), 'ANCHE LE PERSONE', { bg: COPY })}
        </g>
      )}
      {/* USCITA */}
      {vis('uscita') && (
        <g>
          {tag(3000, L1.top - 60, ev('uscita', 0, 2.6), 'UN SOLO LIVELLO', { bg: RED, fg: PAPER, until: ev('uscita', 1, 0.6) })}
          {tag(X.fessura + 300, -80, ev('uscita', 2, 0.6), 'SOLO DA DOVE SEI ENTRATO', { size: 44 })}
          {mano(3700, L0.bot + 90, ev('uscita', 3, 0.6), 'ritrovare la strada', E('uscita'), 66, '#F28A7A')}
        </g>
      )}
      {/* PIRATA */}
      {vis('pirata', S('pirata'), ev('pirata', 3, 0.6)) && (
        <g>
          {nodo(X.tavola + 110, Y0 - 120, { t0: S('pirata') + 0.3, icon: 'taccuino', name: 'MARY' })}
          {nodo(X.tavola - 140, Y0 - 40, { t0: S('pirata') + 0.5, icon: 'prezzo', name: 'CLARK', dead: dead(ev('pirata', 3, 0.2)) })}
          {mano(X.tavola - 260, L0.bot + 70, S('pirata') + 1, '«non ammetti mai i tuoi errori»', ev('pirata', 1), 56)}
          {tag(X.negozio + 700, -260, ev('pirata', 2, 0.8), 'UN\'ALTRA COPIA DI CLARK', { bg: COPY })}
        </g>
      )}
      {/* CEMENTO: il resto è nel corridoio (Pov.tsx) */}
      {vis('cemento', ev('cemento', 3)) && (
        <g>
          {nodo(X.anello + 240, 160, { t0: ev('cemento', 3, 0.2), icon: 'taccuino', name: 'MARY' })}
          {nodo(X.anello - 260, 160, { t0: ev('cemento', 3, 0.6), icon: 'maschera', name: 'ASYNC' })}
        </g>
      )}
      {/* PHIL */}
      {vis('phil') && (
        <g>
          {nodo(X.stanzetta - 70, 120, { t0: S('phil') + 0.4, icon: 'taccuino', name: 'MARY', fade: 1 - seg(T, ev('phil', 4, 0.4), ev('phil', 4, 1)) })}
          {nodo(X.stanzetta + 170, 120, { t0: S('phil') + 0.8, icon: 'telecamera', name: 'PHIL', fade: 1 - seg(T, ev('phil', 4, 0.4), ev('phil', 4, 1)) })}
          {tag(X.monitor + 200, -60, ev('phil', 1, 0.6), 'LA RICERCA PIÙ IMPORTANTE', { bg: ASYNC, until: ev('phil', 3) })}
          {tag(X.monitor + 200, 300, ev('phil', 2, 1.2), 'DAL 1990', { until: ev('phil', 3) })}
          {tag(X.stanzetta + 50, -60, ev('phil', 3, 1.2), '«NON DECIDO IO»', { bg: RED, fg: PAPER, until: ev('phil', 4, 0.4) })}
        </g>
      )}
      {/* MONTAGGIO */}
      {vis('montaggio') && (
        <g>
          {tag(X.copiaNeg, L0.top - 50, S('montaggio') + 0.4, 'IL NEGOZIO', { bg: COPY, until: ev('montaggio', 1) })}
          {tag(X.copiaStudio, L0.top - 50, ev('montaggio', 1, 0.4), 'LO STUDIO', { bg: COPY, until: ev('montaggio', 2) })}
          {tag(X.copiaStanza, L0.top - 50, ev('montaggio', 2, 0.4), 'LA STANZETTA', { bg: COPY })}
          {(() => {
            // la copia deforme di Mary: un taccuino grigio-bianco, storto, colato, posato sulla sedia (la voce dice «seduta»)
            const t0 = ev('montaggio', 3, 0.6);
            if (T < t0) return null;
            const [sx, sy] = sc(X.copiaStanza - 160, L0.bot - 86);
            const z = camAt(T).z;
            const k = eo(seg(T, t0, t0 + 0.6)) * capOp(T, 'montaggio');
            return (
              <g opacity={k}>
                <g transform={`translate(${sx} ${sy}) scale(${z * 1.1}) skewX(-14) rotate(9)`}><Icona k="taccuinoCopia" T={T} /></g>
                <text x={sx} y={sy + 70 * z} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={32} fill={PAPER} stroke={NIGHT} strokeWidth={7} paintOrder="stroke">COPIA DI MARY</text>
                <Anello T={T} x={sx} y={sy} r={46 * z + 30} on={seg(T, ev('montaggio', 3, 1.4), ev('montaggio', 3, 2)) * capOp(T, 'montaggio')} />
              </g>
            );
          })()}
        </g>
      )}
      {/* MOSTRA */}
      {vis('mostra') && (
        <g>
          {(() => { const [x, y] = fermo(1360, 330); return <Cartello T={T} t0={S('mostra') + 0.4} x={x} y={y} head="COSA MOSTRA IL FILM" text="ANCHE LEI È COPIATA" color={PAPER} />; })()}
          {nodo(X.stanzetta - 70, 120, { t0: S('mostra') + 0.6, icon: 'taccuino', name: 'MARY' })}
          {nodo(X.copiaStanza - 160, Y0 - 10, { t0: S('mostra') + 0.6, icon: 'taccuinoCopia', ghost: 1, name: 'COPIA' })}
          {nodo(X.negozio + 100, -150, { t0: ev('mostra', 2, 0.4), icon: 'prezzo', name: 'CLARK', fade: 1 - seg(T, ev('mostra', 3), ev('mostra', 3, 0.5)) })}
          {nodo(X.tavola + 320, L0.top + 60, { t0: ev('mostra', 2, 0.8), icon: 'cappello', ghost: 1, name: 'COPIA', fade: 1 - seg(T, ev('mostra', 3), ev('mostra', 3, 0.5)) })}
          {mano(X.stanzetta + 400, 420, ev('mostra', 3, 0.6), 'ricordano anche lei', E('mostra'), 66)}
        </g>
      )}
      {/* SORTE */}
      {vis('sorte') && (
        <g>
          {(() => { const [x, y] = fermo(640, 640); return <Cartello T={T} t0={S('sorte') + 0.4} x={x} y={y} head="DUE TEORIE" text="CHE FINE FA MARY?" color={RED} until={ev('sorte', 1, 0.8)} />; })()}
          {nodo(X.stanzetta + 50, 120, { t0: S('sorte') + 0.4, icon: 'taccuino', name: 'MARY', ring: 1 })}
          {tag(X.anello, L0.top + 120, ev('sorte', 1, 1.2), 'RIMANDATA LAGGIÙ', { bg: RED, fg: PAPER })}
          {tag(X.cinema - 300, -200, ev('sorte', 2, 1.2), 'SALVA', { bg: YEL })}
          {mano(X.stanzetta + 300, L0.bot + 90, ev('sorte', 3, 0.6), 'il regista non conferma', E('sorte'), 66)}
        </g>
      )}
      {/* METAFORA */}
      {vis('metafora') && <Metafora T={T} sc={sc} />}
      {/* DETTAGLIO */}
      {vis('dettaglio') && <Dettaglio T={T} sc={sc} fermo={fermo} />}
      {/* SEGUITO */}
      {vis('seguito') && (
        <g>
          {tag(X.fessura + 350, -260, S('seguito') + 1.2, 'ALTRO IN LAVORAZIONE', { until: ev('seguito', 1) })}
          {tag(6200, -400, ev('seguito', 1, 0.6), 'UN NUOVO FILM CON A24?', { until: ev('seguito', 2, 0.4) })}
          {nodo(6900, L0.top - 170, { t0: ev('seguito', 2, 0.4), icon: 'taccuino', name: 'MARY?', ring: 1 })}
        </g>
      )}
    </g>
  );
};

/** La polaroid gigante della foto, con la mappa degli Stati Uniti e la puntina rossa. */
const Polaroid: React.FC<{ T: number; sc: (x: number, y: number) => [number, number] }> = ({ T, sc }) => {
  const t0 = ev('leggenda', 4);
  const k = seg(T, t0, t0 + 0.4) * (1 - seg(T, ev('oshkosh', 3, -0.2), ev('oshkosh', 3, 0.4)));
  const [x, y] = sc(1150, -640);
  const z = camAt(T).z;
  const s = Math.min(1.6, Math.max(0.6, z * 1.05));
  const mappa = eo(seg(T, ev('oshkosh', 2, 0.2), ev('oshkosh', 2, 1)));
  const [mx, my] = sc(1650, -640);
  return (
    <g opacity={k}>
      <g transform={`translate(${x} ${y}) rotate(-5) scale(${s * (0.9 + 0.1 * eo(seg(T, t0, t0 + 0.5)))})`}>
        <rect x={-190} y={-170} width={380} height={380} fill="#F4F0E4" stroke={INK} strokeWidth={5} />
        <rect x={-165} y={-145} width={330} height={260} fill="#D8C46A" />
        {/* la stanza gialla in piccolo: pareti, neon, porta */}
        <path d="M-165 115 L-60 30 H60 L165 115 Z" fill="#9C8A45" />
        <path d="M-60 30 V-60 H60 V30" fill="#C8B45A" stroke="#8E7A30" strokeWidth={3} />
        <rect x={-20} y={-30} width={40} height={60} fill="#5E5124" />
        <path d="M-165 -145 L-60 -60 M165 -145 L60 -60" stroke="#8E7A30" strokeWidth={3} />
        <rect x={-30} y={-110} width={60} height={10} fill="#FFFBE6" />
        <circle cx={0} cy={-180} r={14} fill={RED} stroke={INK} strokeWidth={3} />
        {T >= ev('oshkosh', 2, 0.6) && <text y={180} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26} fill={INK}>2002 · lavori in corso</text>}
      </g>
      {mappa > 0 && (
        <g transform={`translate(${mx} ${my}) scale(${s * 0.9 * mappa})`} opacity={mappa}>
          {/* gli Stati Uniti, molto semplificati, con la puntina sul Wisconsin */}
          <path d="M-210 -60 L-120 -90 L40 -84 L120 -100 L170 -70 L200 -10 L150 40 L120 90 L70 70 L-20 80 L-110 60 L-190 20 Z" fill="#5A6A5A" stroke={INK} strokeWidth={5} />
          <circle cx={60} cy={-50} r={12} fill={RED} stroke={INK} strokeWidth={3} />
          <path d="M60 -50 V-110" stroke={INK} strokeWidth={4} />
          <text x={70} y={-120} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={30} fill={PAPER} stroke={NIGHT} strokeWidth={6} paintOrder="stroke">WISCONSIN</text>
        </g>
      )}
    </g>
  );
};

/** Le due letture della metafora: scatoloni di ricordi e un telefono che scorre. */
const Metafora: React.FC<{ T: number; sc: (x: number, y: number) => [number, number] }> = ({ T, sc }) => {
  const [cx, cy] = fitS(T, 1400, 330, 220, 85);
  const scat = eo(seg(T, ev('metafora', 1, 0.4), ev('metafora', 1, 1.4)));
  const tel = eo(seg(T, ev('metafora', 3, 0.2), ev('metafora', 3, 1)));
  const [bx, by] = sc(X.tavola - 500, L0.bot - 22);
  const z = camAt(T).z;
  return (
    <g>
      <Cartello T={T} t0={S('metafora') + 0.4} x={cx} y={cy} head="TEORIA" text="UNA METAFORA" color={RED} until={ev('metafora', 3)} />
      {scat > 0 && (
        <g transform={`translate(${bx} ${by}) scale(${z})`} opacity={scat * (1 - tel)}>
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i} transform={`translate(${(i % 4) * 110} ${-Math.floor(i / 4) * 80 - 70 + (1 - scat) * -200})`}>
              <rect x={0} y={0} width={100} height={70} fill="#A8844A" stroke={INK} strokeWidth={4} />
              <path d="M0 16 H100" stroke={INK} strokeWidth={3} />
              <text x={50} y={52} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={16} fill={INK}>RICORDI</text>
            </g>
          ))}
        </g>
      )}
      {T >= ev('metafora', 2) && <Nodo T={T} t0={ev('metafora', 2, 0.2)} x={fitS(T, ...sc(X.tavola, Y0), 110, 90)[0]} y={fitS(T, ...sc(X.tavola, Y0), 110, 90)[1] - 20} icon="prezzo" name="CLARK" dead={seg(T, ev('metafora', 2, 1), ev('metafora', 2, 1.6))} fade={1 - tel} />}
      {tel > 0 && (
        <g transform={`translate(800 460) scale(${0.75 + 0.5 * tel})`} opacity={tel}>
          <rect x={-170} y={-300} width={340} height={600} rx={44} fill="#141418" stroke={INK} strokeWidth={8} />
          <clipPath id="br-tel"><rect x={-150} y={-270} width={300} height={540} rx={24} /></clipPath>
          <g clipPath="url(#br-tel)">
            {Array.from({ length: 6 }, (_, i) => {
              const yy = ((i * 180 - T * 260) % 1080 + 1080) % 1080 - 540;
              return (
                <g key={i} transform={`translate(0 ${yy})`}>
                  <rect x={-150} y={0} width={300} height={170} fill={i % 2 ? '#D8C46A' : '#C8B45A'} />
                  <path d="M-150 170 L-50 90 H50 L150 170 Z" fill="#9C8A45" />
                  <rect x={-30} y={20} width={60} height={9} fill="#FFFBE6" />
                </g>
              );
            })}
          </g>
          <rect x={-40} y={-288} width={80} height={10} rx={5} fill="#2A2A30" />
        </g>
      )}
      {tel > 0 && <ManoS T={T} t0={ev('metafora', 3, 1)} x={1420} y={560} text="scorre all'infinito" size={70} />}
    </g>
  );
};

/** Il dettaglio: il pezzo di cemento in primo piano, il ricordo della casa che si accende dentro, il colpo. */
const Dettaglio: React.FC<{ T: number; sc: (x: number, y: number) => [number, number]; fermo: (x: number, y: number) => [number, number] }> = ({ T, fermo }) => {
  void eio;
  const t0 = S('dettaglio');
  const k = seg(T, t0 + 0.4, t0 + 1.2) * (1 - seg(T, ev('dettaglio', 3, 0.85), ev('dettaglio', 3, 1.1)));
  const casa = eo(seg(T, ev('dettaglio', 1, 0.4), ev('dettaglio', 1, 2)));
  const lancio = eio(seg(T, ev('dettaglio', 3, 0.2), ev('dettaglio', 3, 0.8)));
  const [cx, cy] = fermo(1460, 300);
  // il cappello è in fondo al corridoio (Pov.tsx, vistaDettaglio): il cemento ci arriva sopra
  const x = lerp(700, 982, lancio), y = lerp(560, 390, lancio);
  const s = lerp(1.9, 0.5, lancio) * (1 + 0.02 * Math.sin(T * 2));
  return (
    <g>
      <Cartello T={T} t0={t0 + 0.4} x={cx} y={cy} head="LA NOSTRA LETTURA" text="IL PEZZO DI CEMENTO" until={ev('dettaglio', 2, 0.4)} />
      {k > 0 && (
        <g opacity={k}>
          <Glow id="br-cem" x={x} y={y} r={260 * s} t={T} color="#F4E9B8" amp={0.06} rate={2} opacity={0.35} />
          <g transform={`translate(${x} ${y}) rotate(${lancio * 260 - 8}) scale(${s * 2.6})`}>
            <Icona k="cemento" />
            {casa > 0 && (
              <g transform="scale(0.11) translate(0 140)" opacity={casa}>
                <CasaMary k={1} vera={1} x={0} y={0} color="#FFF4C8" />
              </g>
            )}
          </g>
        </g>
      )}
      <Tag T={T} t0={ev('dettaglio', 1, 1.6)} x={700} y={790} text="IL SUO RICORDO" until={ev('dettaglio', 3)} />
      <ManoS T={T} t0={ev('dettaglio', 2, 0.4)} x={1420} y={700} text="i ricordi diventano trappole" size={62} until={ev('dettaglio', 3, -0.2)} />
      <ManoS T={T} t0={ev('dettaglio', 4, 1.0)} x={1380} y={300} text="affrontare i ricordi" size={84} />
    </g>
  );
};

export { neonAt, Mano, NIGHT, Icona as IconaPersonaggio };
