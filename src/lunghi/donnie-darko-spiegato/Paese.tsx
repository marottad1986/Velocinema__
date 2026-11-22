import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { FxDefs } from '../../lib/fx';
import { Fog, Glow, Lightning, Stars, flashAt } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import { H, Motes16, TopShade, W } from '../fx16';
import L from '../../../lunghi/donnie-darko-spiegato.json';
import {
  Aereo, Albero, COPY, Casa, CasaCunn, CasaNonna, Cinema, Collina, DARK, DIM, ENGINE, ENG_HIT, Fari, Golf, INK, Lampione, Motore, RED, Scuola,
  Strada, Studio, TIME, type Tav, mix, tavCopia, tavVera,
} from './Edifici';

// Donnie Darko spiegato, video lungo YouTube (YOUTUBE.md §4): UN SOLO MONDO in cui la camera viaggia da un atto all'altro.
// Il paese di notte, visto di lato come un grande plastico lungo 9 schermi: da sinistra il campo da golf, la casa dei
// Darko, lo studio della psicologa, la scuola, il cinema, la casa di Cunningham, la strada con la casa di Nonna Morte e la
// collina che guarda il paese. Sopra il paese, nel cielo, la COPIA (l'universo tangente): lo stesso paese in linee azzurre
// tratteggiate, che compare con le regole del libro. Il vortice si apre tra i due, sopra il centro del paese.
// Personaggi = cerchi con l'oggetto, mai figure (CLAUDE.md, formato Spiegato): Donnie = pantofole, Frank = orecchie da
// coniglio, Nonna Morte = libro, Cunningham = videocassetta, Gretchen = bicicletta, il professore = gesso, la psicologa =
// metronomo, i bulli = torcia, la mamma = valigia. Motore = l'unico oggetto arancione. Tratteggio giallo = viaggio nel
// tempo, anello rosso = il nodo da capire, cartellino pieno = colpo di scena, «LA REGOLA» e «TEORIA» come in YOUTUBE.md.
// Tutto è funzione di T (secondi dall'inizio del video lungo): ogni evento cade sulla croma (60 bpm → 0,5 s), gli stessi
// istanti dello spartito scripts/audio/donnie-darko-spiegato.mjs.

// ---------------------------------------------------------------------------------------------------------------- tempi

type Voce = { parlato: number; frasi: number[][] };
type Parte = { tipo: string; id: string; durata?: number; sottotitoli?: string[]; voce?: Voce; capitoli?: { id: string; durata: number; sottotitoli: string[]; voce?: Voce }[] };
export const STARTS: Record<string, number> = {};
export const DUR: Record<string, number> = {};
const CUES: Record<string, number[]> = {};
const INIZIO: Record<string, number> = { aggancio: 0.4, chiusura: 0.5 };
{
  let acc = 0;
  for (const p of L.parti as Parte[]) {
    const items = p.capitoli ?? [{ id: p.id, durata: p.durata!, sottotitoli: p.sottotitoli!, voce: p.voce }];
    for (const c of items) {
      const i0 = INIZIO[c.id] ?? 0;
      STARTS[c.id] = acc;
      DUR[c.id] = c.durata;
      // tempi veri delle frasi nella voce (ascolta-voce --scrivi-tempi), altrimenti in proporzione ai caratteri
      CUES[c.id] = c.voce && c.voce.frasi.length === c.sottotitoli.length
        ? c.voce.frasi.map(([a]) => acc + i0 + a)
        : subtitleTimes(c.sottotitoli, c.durata - i0).map(([a]) => acc + i0 + a);
      acc += c.durata;
    }
  }
  STARTS.fine = acc;
}
const CROMA = 0.5;
export const g = (s: number) => Math.round(s / CROMA) * CROMA;
/** Istante (sulla croma) della frase i del capitolo id, più d secondi. */
export const ev = (id: string, i: number, d = 0) => g(CUES[id][i] + d);
const S = (id: string) => STARTS[id];
const E = (id: string) => STARTS[id] + DUR[id];
const inCap = (T: number, id: string) => T >= S(id) && T < E(id);
const pop = (T: number, t0: number) => eob(seg(T, t0, t0 + 0.45), 1.7);

// ---------------------------------------------------------------------------------------------------------------- luoghi

export const GROUND = 700;
export const X = { golf: 0, casa: 1300, studio: 2450, scuola: 3600, cinema: 4800, cunn: 5950, nonna: 7150, collina: 8450 } as const;
export const COPY_DY = -1150; // la copia sta sopra il paese vero
export const VORTEX = [4400, -170] as const;
export const HIT = [X.casa + ENG_HIT[0], GROUND + ENG_HIT[1]] as const; // il punto del tetto dove si pianta il motore

// ---------------------------------------------------------------------------------------------------------------- camera

type Key = [number, number, number, number, number?]; // T, x, y, z, durata del movimento
const K = (T: number, x: number, y: number, z: number, mv = 1.6): Key => [T, x, y, z, mv];
const SHOTS: Key[] = [
  // aggancio: la miniatura (la casa a destra), il colpo, il paese, poi su nel cielo verso la prima notte
  K(0, 1020, 200, 1.18, 0),
  K(ev('aggancio', 1, -0.3), 1300, 300, 0.95, 2.0),
  // anticipazione del momento più forte (YOUTUBE.md §2): il vortice che strappa il motore all'aereo
  K(ev('aggancio', 2, -0.6), VORTEX[0] + 500, VORTEX[1] + 120, 0.62, 1.8),
  K(ev('aggancio', 2, 1.6), VORTEX[0] + 200, VORTEX[1] + 80, 0.78, 2.6),
  K(ev('aggancio', 3), 3950, 120, 0.55, 2.0),
  K(ev('aggancio', 4), 4300, 60, 0.62, 2.0),
  K(E('aggancio') - 2.2, X.casa + 40, 380, 0.9, 2.2),
  // LA STORIA
  K(S('coniglio') + 0.5, X.casa + 40, 430, 1.05, 3.0),
  K(ev('coniglio', 2), X.casa - 120, 470, 1.25, 2.2),
  K(ev('coniglio', 3), X.casa - 380, 470, 1.25, 1.8),
  K(ev('coniglio', 4), X.casa - 200, 380, 0.95, 1.6),
  K(S('motore'), X.golf + 80, 480, 1.15, 2.4),
  K(ev('motore', 1), X.casa + 120, 380, 1.05, 2.2),
  K(ev('motore', 3), X.casa + 150, 400, 1.35, 1.6),
  K(S('testa'), X.studio - 120, 420, 1.15, 2.4),
  K(ev('testa', 2), X.studio - 20, 430, 1.4, 1.8),
  K(ev('testa', 3), X.studio - 200, 380, 1.1, 1.6),
  K(S('libro'), X.scuola, 420, 1.0, 2.6),
  K(ev('libro', 2), X.nonna - 200, 420, 0.9, 4.2),
  K(ev('libro', 4), X.nonna, 440, 1.2, 1.6),
  K(S('ordini'), X.scuola + 60, 460, 1.05, 3.2),
  K(ev('ordini', 2), X.scuola + 420, 400, 1.0, 2.0),
  K(ev('ordini', 4), X.scuola + 600, 330, 1.2, 1.4),
  K(S('gretchen'), X.cinema, 220, 1.05, 2.4),
  K(ev('gretchen', 1), X.cinema, 120, 1.4, 1.6),
  K(ev('gretchen', 2), X.cinema + 600, 300, 0.75, 1.8),
  K(ev('gretchen', 3), X.cunn, 420, 1.0, 1.8),
  K(ev('gretchen', 4), X.cunn - 80, 330, 0.95, 1.6),
  K(S('notte'), 5600, 40, 0.5, 2.4),
  K(ev('notte', 2), X.nonna - 160, 420, 0.95, 3.0),
  K(ev('notte', 3), X.nonna + 60, 470, 1.25, 1.6),
  K(ev('notte', 4), X.nonna + 300, 480, 1.05, 1.4),
  K(S('sparo'), X.nonna + 300, 470, 1.0, 0.8),
  K(ev('sparo', 1), X.nonna + 360, 470, 1.0, 1.4),
  K(ev('sparo', 3), X.nonna + 300, 470, 1.1, 1.4),
  // lo sparo: la camera corre su Frank (momento clou)
  K(ev('sparo', 4, -0.7), X.nonna + 470, GROUND - 300, 1.9, 0.6),
  K(S('vortice'), VORTEX[0], 60, 0.62, 2.6),
  K(ev('vortice', 1), X.collina - 400, 360, 0.8, 2.6),
  // lo strappo del motore da vicino (momento clou)
  K(ev('vortice', 2, -0.4), VORTEX[0] + 900, VORTEX[1] + 60, 0.8, 1.6),
  K(ev('vortice', 3), 3000, -150, 0.42, 2.4),
  K(S('letto'), X.casa + 140, 380, 1.0, 2.0),
  K(ev('letto', 1), X.casa + 140, 440, 1.6, 2.0),
  K(ev('letto', 3), 3800, -480, 0.62, 3.0),
  // LE REGOLE: il cielo sopra il paese, con la copia
  K(S('copia'), VORTEX[0], -260, 0.5, 2.0),
  K(ev('copia', 1), VORTEX[0], -300, 0.36, 2.4),
  K(ev('copia', 2), 4300, -460, 0.3, 2.4),
  K(S('artefatto'), HIT[0] + 300, -300, 0.52, 2.4),
  K(ev('artefatto', 3), HIT[0] + 100, -700, 0.85, 1.6),
  // il buco nero da vicino (momento clou), poi indietro per vedere che tira giù anche il mondo vero
  K(S('crollo'), VORTEX[0], -760, 0.5, 2.2),
  K(ev('crollo', 1), 4400, -300, 0.3, 2.0),
  K(S('ricevitore'), 2800, -330, 0.6, 2.2),
  K(S('viventi'), 4300, 120, 0.3, 2.2),
  K(ev('viventi', 3), 6900, 120, 0.42, 2.2),
  K(S('morti'), 4030, 250, 0.21, 2.2),
  K(ev('morti', 3), 4030, 200, 0.21, 2.0),
  K(S('trappola'), X.nonna + 500, 120, 0.42, 2.2),
  K(ev('trappola', 3), X.nonna + 800, 120, 0.4, 2.0),
  // IL FINALE SPIEGATO
  K(S('porta'), VORTEX[0], -300, 0.3, 2.4),
  K(ev('porta', 1), 6000, -200, 0.3, 2.2),
  K(ev('porta', 3), 3800, -100, 0.28, 2.6),
  K(S('ritorno'), 4600, -40, 0.24, 2.2),
  K(ev('ritorno', 3), 3200, 20, 0.28, 2.4),
  K(S('ride'), X.casa + 140, 450, 1.25, 2.4),
  K(ev('ride', 1), X.casa + 160, 480, 2.1, 2.4),
  K(ev('ride', 3), X.casa + 140, 360, 1.3, 2.2),
  K(S('salvi'), 4200, -260, 0.22, 2.6),
  K(ev('salvi', 2), 4300, 120, 0.3, 2.4),
  // il gesto: inquadratura dedicata, la mamma davanti alla casa e Gretchen sulla strada
  K(S('gesto'), X.casa + 500, 470, 0.95, 2.6),
  K(ev('gesto', 2), X.casa + 640, 520, 1.15, 1.8),
  K(S('aperto'), 4200, -560, 0.24, 2.6),
  K(S('ventotto'), 4400, -250, 0.75, 2.4),
  K(S('seguito'), 4350, -230, 1.0, 2.2),
  // chiusura: la casa a sinistra, la metà destra libera per la schermata finale; lento avvicinamento
  K(S('chiusura'), X.casa + 700, 420, 0.8, 2.4),
  K(S('chiusura') + 3, X.casa + 650, 430, 0.95, 16),
];
SHOTS.sort((a, b) => a[0] - b[0]);
export type Cam = { x: number; y: number; z: number };
export const camAt = (T: number): Cam => {
  let i = 0;
  while (i + 1 < SHOTS.length && SHOTS[i + 1][0] <= T) i++;
  const [t1, x1, y1, z1, mv = 1.6] = SHOTS[i];
  const prev = SHOTS[Math.max(0, i - 1)];
  // il movimento parte da dove era arrivata la camera (anche se il movimento precedente non era finito)
  const from = i > 0 ? camRaw(prev, SHOTS[Math.max(0, i - 2)], t1) : { x: x1, y: y1, z: z1 };
  const k = mv > 0 ? eio(seg(T, t1, t1 + mv)) : 1;
  // zoom in scala logaritmica, così i grandi cambi di zoom non accelerano
  const z = Math.exp(lerp(Math.log(from.z), Math.log(z1), k));
  const drift = 1 + 0.018 * Math.sin((T - t1) * 0.35);
  return { x: lerp(from.x, x1, k) + Math.sin(T * 0.21) * 8, y: lerp(from.y, y1, k) + Math.sin(T * 0.17) * 5, z: z * drift };
};
function camRaw(key: Key, before: Key, T: number): Cam {
  const [t1, x1, y1, z1, mv = 1.6] = key;
  const k = mv > 0 ? eio(seg(T, t1, t1 + mv)) : 1;
  if (key === before) return { x: x1, y: y1, z: z1 };
  return { x: lerp(before[1], x1, k), y: lerp(before[2], y1, k), z: Math.exp(lerp(Math.log(before[3]), Math.log(z1), k)) };
}

// ---------------------------------------------------------------------------------------------------------------- stati

/** Interpola una serie di chiavi [T, valore] con passaggi morbidi di `mv` secondi. */
const keys = (T: number, ks: [number, number, number?][]) => {
  const ord = [...ks].sort((p, q) => p[0] - q[0]); // in ordine di tempo (i capitoli si possono riordinare nel JSON)
  let v = ord[0][1];
  for (const [t0, val, mv = 1.5] of ord) if (T >= t0) v = lerp(v, val, eio(seg(T, t0, t0 + mv)));
  return v;
};
/** Alba: 0 = notte, 1 = mattino. */
const alba = (T: number) => keys(T, [
  [0, 0], [ev('motore', 0), 0.35, 2], [S('testa'), 0.1], [S('libro'), 0.25], [S('ordini'), 0], [ev('vortice', 0), 0.85, 3],
  [ev('letto', 0, 0.3), 0, 1.5], [S('porta'), 0.8, 2], [S('ride'), 0, 2], [ev('salvi', 2), 0.9, 2.5], [S('gesto'), 1], [S('aperto'), 0.2, 2],
  [S('ventotto'), 0, 2], [S('chiusura'), 0.35, 2],
]);
/** Il motore nel tetto della casa vera. */
const crashAt = (T: number) => {
  if (T < S('coniglio')) return T >= AG_HIT ? 1 : 0; // nell'aggancio il colpo si vede subito
  if (T < CRASH) return 0;
  if (T < ev('letto', 0, 0.3)) return 1; // fino al riavvolgimento
  if (T < LETTO_HIT) return 0;
  if (T < S('copia')) return 1;
  if (T < S('salvi')) return T >= RIDE_HIT ? 1 : 0; // le regole: il mondo vero prima del 2 ottobre
  return 1;
};
const AG_HIT = 1.5;
const CRASH = ev('motore', 2, 0.6);
const LETTO_HIT = ev('letto', 2, 0.8);
const RIDE_HIT = E('ride') - 0.5;
/** L'acqua nella scuola e il fuoco a casa di Cunningham (tutto si riavvolge nell'ultimo capitolo della storia). */
const flood = (T: number) => (T < S('letto') ? eo(seg(T, ev('ordini', 1, 0.4), ev('ordini', 1, 3))) * (1 - 0.4 * seg(T, S('gretchen'), S('notte'))) : 1 - eio(seg(T, ev('letto', 0, 0.3), ev('letto', 0, 1.8))) && 0);
const fire = (T: number) => (T < S('letto') ? seg(T, ev('gretchen', 2, 1.6), ev('gretchen', 2, 2.6)) * (1 - seg(T, S('notte') + 1, S('notte') + 3)) : 0);
const burnt = (T: number) => (T < ev('letto', 0, 0.3) ? seg(T, ev('gretchen', 3), ev('gretchen', 4, 1)) : 0);

// ---------------------------------------------------------------------------------------------------------------- contatore

const DAY = 86400;
const FULL = 28 * DAY + 6 * 3600 + 42 * 60 + 12;
const remaining = (T: number): number | null => {
  const t0 = ev('coniglio', 4, 0.6);
  if (T < t0 || T >= ev('letto', 3)) return null;
  const jumps: [number, number][] = [
    [t0, FULL], [S('motore'), 27 * DAY + 20 * 3600 + 15 * 60], [S('testa'), 25 * DAY + 3 * 3600], [S('libro'), 22 * DAY + 9 * 3600],
    [S('ordini'), 16 * DAY + 2 * 3600], [S('gretchen'), 9 * DAY + 14 * 3600], [S('notte'), 6 * 3600 + 12 * 60], [S('sparo'), 2 * 3600 + 5 * 60],
  ];
  let base = FULL, from = t0;
  for (const [t, v] of jumps) if (T >= t) { base = v; from = t; }
  if (T >= S('vortice')) {
    const vz = ev('vortice', 2, 1.5);
    if (T >= vz) return Math.round(lerp(0, FULL, eio(seg(T, ev('letto', 0, 0.2), ev('letto', 0, 1.8)))));
    return Math.max(0, Math.round(lerp(47 * 60, 0, eio(seg(T, S('vortice'), vz)))));
  }
  return Math.max(0, base - Math.floor(T - from));
};
const fmt = (s: number) => {
  const d = Math.floor(s / DAY), h = Math.floor((s % DAY) / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d)}:${p(h)}:${p(m)}:${p(x)}`;
};
/** Il contatore dei 28 giorni, fisso in alto a destra (schermo), un secondo per battito. */
const Contatore: React.FC<{ T: number }> = ({ T }) => {
  const r = remaining(T);
  if (r === null) return null;
  const t0 = ev('coniglio', 4, 0.6);
  const a = eo(seg(T, t0, t0 + 0.4)) * (1 - seg(T, ev('letto', 3, -0.6), ev('letto', 3)));
  const urgent = r < 8 * 3600 && r > 0;
  const col = r === 0 ? RED : urgent ? ENGINE : INK;
  const s = 1 + 0.35 * (1 - eo(seg(T, t0, t0 + 0.6)));
  return (
    <g opacity={a} transform={`translate(1615 96) scale(${s * 1.2})`}>
      <rect x={-150} y={-34} width={300} height={68} rx={34} fill={DARK} opacity={0.8} />
      <rect x={-150} y={-34} width={300} height={68} rx={34} fill="none" stroke={col} strokeWidth={3} opacity={0.5 + 0.4 * (urgent ? Math.abs(Math.sin(T * Math.PI)) : 0)} />
      <g transform="translate(-112 0)" stroke={col} strokeWidth={3} fill="none" strokeLinejoin="round">
        <path d="M-11 -16 H11 M-11 16 H11 M-9 -16 Q-9 -3 0 0 Q9 -3 9 -16 M-9 16 Q-9 3 0 0 Q9 3 9 16" />
        <path d={`M-5 ${16 - 6 * (1 - r / FULL)} H5 L0 12 Z`} fill={col} stroke="none" />
      </g>
      <text x={22} y={12} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill={col} style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(r)}</text>
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------------- simboli

/** Icone degli oggetti-personaggio (centrate, circa 80 px). */
export const Icona: React.FC<{ k: string; T?: number }> = ({ k, T = 0 }) => {
  switch (k) {
    case 'pantofole': return (
      <g strokeLinejoin="round">
        {[-15, 15].map((x, i) => (
          <g key={x} transform={`translate(${x} ${i ? 4 : -2}) rotate(${i ? 8 : -8})`}>
            <path d="M-11 -26 Q0 -34 11 -26 L13 20 Q0 32 -13 20 Z" fill="#3F4C86" stroke={INK} strokeWidth={3.5} />
            <path d="M-12 -4 Q0 -14 12 -4 L13 8 Q0 0 -13 8 Z" fill="#5C6BB0" stroke={INK} strokeWidth={2.5} />
            <circle cx={0} cy={-2} r={3} fill={INK} />
          </g>
        ))}
      </g>
    );
    case 'orecchie': return (
      <g strokeLinejoin="round" strokeLinecap="round">
        <path d="M-16 6 Q-30 -30 -18 -40 Q-6 -36 -6 2" fill="#5A5F78" stroke={INK} strokeWidth={3.5} />
        <path d="M-15 -2 Q-22 -26 -16 -32 Q-10 -28 -11 -2" fill="#2A2D40" />
        <path d="M16 6 Q30 -30 18 -40 Q6 -36 6 2" fill="#5A5F78" stroke={INK} strokeWidth={3.5} />
        <path d="M15 -2 Q22 -26 16 -32 Q10 -28 11 -2" fill="#2A2D40" />
        <path d="M-30 22 Q0 -6 30 22" fill="none" stroke={INK} strokeWidth={6} />
      </g>
    );
    case 'libro': return (
      <g strokeLinejoin="round">
        <path d="M-30 -30 H26 Q32 -30 32 -24 V30 H-24 Q-30 30 -30 24 Z" fill="#5A3A2C" stroke={INK} strokeWidth={3.5} />
        <path d="M-24 30 V-30" stroke={INK} strokeWidth={2.5} />
        <path d="M-18 -22 H24 M-18 22 H24" stroke="#C9A85A" strokeWidth={2} />
        <path d="M-5 -13 H13 M-5 13 H13 M-3 -13 Q-3 -2 4 0 Q11 -2 11 -13 M-3 13 Q-3 2 4 0 Q11 2 11 13" stroke="#C9A85A" strokeWidth={2.5} fill="none" />
      </g>
    );
    case 'videocassetta': return (
      <g strokeLinejoin="round">
        <rect x={-36} y={-22} width={72} height={44} rx={4} fill="#25283A" stroke={INK} strokeWidth={3.5} />
        <rect x={-26} y={-16} width={52} height={16} rx={2} fill="#E8E0C8" />
        <path d="M-6 -11 q-4 -4 -6 0 q0 3 6 7 q6 -4 6 -7 q-2 -4 -6 0" fill={RED} />
        <circle cx={-14} cy={10} r={7} fill="none" stroke={INK} strokeWidth={2.5} />
        <circle cx={14} cy={10} r={7} fill="none" stroke={INK} strokeWidth={2.5} />
      </g>
    );
    case 'bicicletta': return (
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {[-20, 20].map((x) => (
          <g key={x} transform={`translate(${x} 10)`}>
            <circle r={15} stroke={INK} strokeWidth={3.5} />
            {[0, 60, 120].map((a) => <path key={a} d="M-13 0 H13" stroke={DIM} strokeWidth={1.5} transform={`rotate(${a + T * 90})`} />)}
          </g>
        ))}
        <path d="M-20 10 L-6 -10 H14 L20 10 M-6 -10 L2 10 L14 -10 M-8 -16 H-2 M14 -10 L12 -20 H20" stroke="#E86A9A" strokeWidth={3.5} />
      </g>
    );
    case 'gesso': return (
      <g strokeLinejoin="round">
        <rect x={-34} y={-26} width={68} height={46} rx={3} fill="#2A4A3A" stroke={INK} strokeWidth={3.5} />
        <path d="M-22 -10 q10 -10 20 0 t20 0 M-22 6 H8" stroke="#E8E0C8" strokeWidth={2.5} fill="none" />
        <rect x={-6} y={18} width={30} height={9} rx={4} fill="#F4F0E4" stroke={INK} strokeWidth={2.5} transform="rotate(-15 9 22)" />
      </g>
    );
    case 'metronomo': return (
      <g strokeLinejoin="round">
        <path d="M-22 28 L-10 -30 H10 L22 28 Z" fill="#8A5A3A" stroke={INK} strokeWidth={3.5} />
        <path d="M0 18 L0 -26" stroke="#F4F0E4" strokeWidth={3} transform={`rotate(${Math.sin(T * Math.PI) * 24} 0 18)`} />
        <rect x={-14} y={16} width={28} height={8} fill="#5A3A2A" />
      </g>
    );
    case 'torcia': return (
      <g strokeLinejoin="round">
        <path d="M-30 -8 H8 L20 -16 V16 L8 8 H-30 Z" fill="#4A4E66" stroke={INK} strokeWidth={3.5} />
        <path d="M22 -14 L44 -26 V26 L22 14 Z" fill="#FFF3C4" opacity={0.6} />
      </g>
    );
    case 'valigia': return (
      <g strokeLinejoin="round">
        <rect x={-30} y={-18} width={60} height={42} rx={6} fill="#7A4A3A" stroke={INK} strokeWidth={3.5} />
        <path d="M-10 -18 V-28 H10 V-18" fill="none" stroke={INK} strokeWidth={3.5} />
        <path d="M-30 0 H30" stroke="#C9A85A" strokeWidth={2.5} />
      </g>
    );
    default: return null;
  }
};

/** Cerchio-personaggio con l'oggetto e il nome scritto a mano. `s` = scala (si ingrandisce nelle vedute larghe). */
const Nodo: React.FC<{
  T: number; t0: number; x: number; y: number; icon: string; name?: string; sub?: string; s?: number; fade?: number; ring?: number; color?: string;
  dead?: number; ghost?: number; r?: number;
}> = ({ T, t0, x, y, icon, name, sub, s = 1, fade = 1, ring = 0, color = INK, dead = 0, ghost = 0, r = 54 }) => {
  if (T < t0 || fade <= 0) return null;
  const k = pop(T, t0);
  const hi = color === INK ? TIME : color;
  const stroke = ghost > 0.5 ? COPY : ring > 0.5 ? hi : color;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={seg(T, t0, t0 + 0.15) * fade}>
      <g transform={`scale(${k})`}>
        {ring > 0 && <Glow id={`dd16-n${icon}`} x={0} y={0} r={r * 2.4} t={T} color={hi} amp={0.1} rate={2.4} opacity={0.45 * Math.min(1, ring)} />}
        {ghost > 0 && <Glow id={`dd16-gh${icon}`} x={0} y={0} r={r * 2.2} t={T} color={COPY} amp={0.15} rate={3} opacity={0.5 * ghost} />}
        <circle r={r} fill={ghost > 0.5 ? 'rgba(60,80,160,0.55)' : '#1C2040'} stroke={stroke} strokeWidth={ring > 0.5 ? 7 : 4.5} />
        <circle r={r - 8} fill="none" stroke={DIM} strokeWidth={1.5} opacity={0.6} />
        <g transform={`scale(${r / 44})`} opacity={1 - 0.65 * dead}><Icona k={icon} T={T} /></g>
        {dead > 0 && <circle r={r} fill="#3A3E52" opacity={0.55 * dead} />}
      </g>
      {name && <text y={r + 40} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill={dead > 0.5 ? DIM : INK} stroke={DARK} strokeWidth={7} paintOrder="stroke" opacity={seg(T, t0 + 0.2, t0 + 0.5)}>{name}</text>}
      {sub && <text y={r + 76} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={34} fill={TIME} stroke={DARK} strokeWidth={7} paintOrder="stroke" opacity={seg(T, t0 + 0.35, t0 + 0.7)}>{sub}</text>}
    </g>
  );
};

/** Cartellino pieno: colpo di scena o parola chiave (o «LA REGOLA», «TEORIA»). */
const Tag: React.FC<{ T: number; t0: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number; until?: number; s?: number }> = ({
  T, t0, x, y, text, bg = TIME, fg = DARK, size = 40, rot = 0, until = 1e9, s: s0 = 1,
}) => {
  if (T < t0 || T > until + 0.5) return null;
  const s = zk(T) * s0; // s0 = grandezza relativa (1 = normale)
  const w = text.length * size * 0.6 + size;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(T, t0) * s})`} opacity={1 - seg(T, until, until + 0.5)}>
      <rect x={-w / 2 + 6} y={-size * 0.95 + 6} width={w} height={size * 1.6} rx={size * 0.3} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.3} fill={bg} />
      <text y={size * 0.33} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};
/** Cartello «LA REGOLA» / «TEORIA»: etichetta piccola sopra, testo grande sotto. */
const Cartello: React.FC<{ T: number; t0: number; x: number; y: number; head: string; text: string; s?: number; until?: number; color?: string }> = ({ T, t0, x, y, head, text, until = 1e9, color = TIME }) => {
  if (T < t0 || T > until + 0.5) return null;
  const s = zk(T) * 1.05;
  const w = Math.max(text.length * 30 + 80, 320);
  return (
    <g transform={`translate(${x} ${y}) scale(${pop(T, t0) * s})`} opacity={1 - seg(T, until, until + 0.5)}>
      <rect x={-w / 2 + 8} y={-52} width={w} height={124} rx={18} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={-60} width={w} height={124} rx={18} fill={DARK} stroke={color} strokeWidth={5} />
      <rect x={-w / 2 + 24} y={-80} width={head.length * 19 + 36} height={40} rx={10} fill={color} />
      <text x={-w / 2 + 42} y={-50} fontFamily={SANS} fontWeight={900} fontSize={26} letterSpacing="3" fill={DARK}>{head}</text>
      <text y={22} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={48} fill={INK}>{text}</text>
    </g>
  );
};
/** Anello rosso = il nodo da capire. */
const Anello: React.FC<{ T: number; x: number; y: number; r: number; on: number }> = ({ T, x, y, r, on }) => {
  if (on <= 0) return null;
  const k = eob(Math.min(1, on), 1.6);
  return (
    <g opacity={Math.min(1, on)}>
      <circle cx={x} cy={y} r={r * k} fill="none" stroke={RED} strokeWidth={9} strokeDasharray={`${r * 0.5} ${r * 0.18}`} strokeDashoffset={-T * 40} />
      <circle cx={x} cy={y} r={r * k + 14} fill="none" stroke={RED} strokeWidth={2.5} opacity={0.5} />
    </g>
  );
};
/** Scritta a mano. */
// Scritte, cartelli e simboli hanno una grandezza fissa SULLO SCHERMO (QUALITA.md §10: scritte grandi anche nelle
// vedute larghe), qualunque sia lo zoom della camera: la scala nel mondo è (px voluti) / zoom.
const zoomAt = (T: number) => camAt(T).z;
/** Scala dei simboli (nodi, tag, cartelli): 1,45 px sullo schermo per unità del disegno. */
export const nsAt = (z: number) => Math.min(6, Math.max(0.55, 1.45 / z));
const zk = (T: number) => nsAt(zoomAt(T));
const Mano: React.FC<{ T: number; t0: number; x: number; y: number; text: string; size?: number; color?: string; until?: number; anchor?: 'start' | 'middle' | 'end'; rot?: number }> = ({
  T, t0, x, y, text, size: size0 = 46, color = TIME, until = 1e9, anchor = 'middle', rot = 0,
}) => { const z = zoomAt(T); const size = Math.min(130, Math.max(70, size0 * 1.5)) / z; return (T < t0 || T > until + 0.5 ? null : (
  <text x={x} y={y} textAnchor={anchor} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} fontFamily={HAND} fontWeight={700} fontSize={size} fill={color} stroke={DARK} strokeWidth={size * 0.17} paintOrder="stroke"
    opacity={seg(T, t0, t0 + 0.4) * (1 - seg(T, until, until + 0.5))}>{text}</text>
)); };
/** Linea che si disegna (maschera); `dashed` gialla = viaggio nel tempo. */
const Linea: React.FC<{ T: number; t0: number; d: string; id: string; color?: string; w?: number; dashed?: boolean; dur?: number; fade?: number; flow?: boolean }> = ({
  T, t0, d, id, color = INK, w = 7, dashed = false, dur = 0.8, fade = 1, flow = true,
}) => {
  if (T < t0 || fade <= 0) return null;
  const p = eo(seg(T, t0, t0 + dur));
  return (
    <g opacity={fade}>
      <mask id={id} maskUnits="userSpaceOnUse" x="-3000" y="-4000" width="16000" height="9000"><path d={d} fill="none" stroke="#fff" strokeWidth={w + 14} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dashed ? `${w * 3} ${w * 2.2}` : undefined} strokeDashoffset={flow ? -T * 60 : 0} strokeLinecap="round" mask={`url(#${id})`} />
    </g>
  );
};
/** Punto lungo una curva quadratica. */
const qpt = (a: readonly [number, number], c: readonly [number, number], b: readonly [number, number], p: number) => [
  (1 - p) ** 2 * a[0] + 2 * (1 - p) * p * c[0] + p * p * b[0], (1 - p) ** 2 * a[1] + 2 * (1 - p) * p * c[1] + p * p * b[1],
] as const;

// ---------------------------------------------------------------------------------------------------------------- il paese

const rr = rng(1988);
const CASETTE = Array.from({ length: 46 }, (_, i) => ({ x: -900 + i * 225 + rr() * 60, w: 120 + rr() * 90, h: 70 + rr() * 90, lit: rr(), ph: rr() * 6 }));
const ALBERI = Array.from({ length: 40 }, (_, i) => ({ x: -700 + i * 245 + rr() * 90, h: 220 + rr() * 170, seed: 10 + i }));
const LAMPIONI = Array.from({ length: 14 }, (_, i) => -400 + i * 700);
const PRIMO = Array.from({ length: 34 }, (_, i) => ({ x: -1200 + i * 420 + rr() * 160, w: 90 + rr() * 120, h: 50 + rr() * 70, fence: rr() > 0.7 }));
const ERBA = Array.from({ length: 140 }, (_, i) => ({ x: -1200 + i * 78 + rr() * 30, h: 30 + rr() * 50, ph: rr() * 6 }));

/** Il paese intero (vero o copia) in coordinate del mondo. */
const Citta: React.FC<{ T: number; c: Tav; crash: number; flood: number; fire: number; burnt: number; cut?: number; nastro?: number; fari?: number; inBed?: number; lights?: number }> = ({
  T, c, crash, flood: fl, fire: fi, burnt: bu, cut = 0, nastro = 0, fari = 0, inBed = 0, lights = 1,
}) => (
  <g>
    {/* casette lontane sulla collina dietro (piano medio) */}
    <g opacity={c.ghost ? 0.5 : 1}>
      {CASETTE.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${GROUND - 120})`}>
          <path d={`M${-b.w / 2} 0 V${-b.h} L0 ${-b.h - 50} L${b.w / 2} ${-b.h} V0 Z`} fill={c.ghost ? 'none' : mix(c.wall2, '#101428', 0.55)} stroke={c.ghost ? c.ink : mix(c.ink, '#2A2E50', 0.6)} strokeWidth={3} />
          {b.lit > 0.45 && <rect x={-10} y={-b.h + 22} width={20} height={22} fill={c.ghost ? c.ink : c.win} opacity={(0.4 + 0.3 * Math.sin(T * 0.7 + b.ph)) * lights} />}
        </g>
      ))}
    </g>
    {/* prato dietro le case */}
    <path d={`M-1500 ${GROUND - 120} Q2000 ${GROUND - 170} 4500 ${GROUND - 130} T9800 ${GROUND - 120} V${GROUND + 10} H-1500 Z`} fill={c.ghost ? 'none' : c.grass} stroke={c.ghost ? c.ink : 'none'} strokeWidth={3} opacity={c.ghost ? 0.4 : 1} />
    {ALBERI.map((a, i) => <Albero key={i} x={a.x} y={GROUND - 40} h={a.h} c={c} seed={a.seed} T={T} />)}
    {/* i luoghi */}
    <g transform={`translate(${X.golf} ${GROUND})`}><Golf c={c} T={T} /></g>
    <g transform={`translate(${X.casa} ${GROUND})`}><Casa c={c} T={T} crash={crash} cut={cut} nastro={nastro} inBed={inBed} lights={lights} /></g>
    <g transform={`translate(${X.studio} ${GROUND})`}><Studio c={c} T={T} on={lights} /></g>
    <g transform={`translate(${X.scuola} ${GROUND})`}><Scuola c={c} T={T} flood={fl} lights={0.3 * lights} /></g>
    <g transform={`translate(${X.cinema} ${GROUND})`}><Cinema c={c} T={T} on={lights} /></g>
    <g transform={`translate(${X.cunn} ${GROUND})`}><CasaCunn c={c} T={T} fire={fi} burnt={bu} /></g>
    <g transform={`translate(${X.nonna} ${GROUND})`}><CasaNonna c={c} T={T} flick={0.4} /></g>
    <g transform={`translate(${X.collina} ${GROUND}) scale(-1 1)`}><Collina c={c} T={T} fari={fari} /></g>
    {/* strada e lampioni */}
    <Strada x0={-1500} x1={9800} y={GROUND} c={c} />
    {LAMPIONI.map((x) => <Lampione key={x} x={x} y={GROUND + 4} c={c} T={T} on={lights} />)}
    {/* erba in primo piano lungo la strada */}
    {!c.ghost && (
      <path d={ERBA.map((e) => `M${e.x} ${GROUND + 132} q${4 + Math.sin(T * 1.3 + e.ph) * 4} ${-e.h / 2} ${8 + Math.sin(T * 1.3 + e.ph) * 9} ${-e.h}`).join(' ')} fill="none" stroke={mix(c.grass, '#0A0E14', 0.2)} strokeWidth={6} strokeLinecap="round" />
    )}
    {!c.ghost && <rect x={-1500} y={GROUND + 128} width={11300} height={900} fill={mix(c.grass, '#080A12', 0.45)} />}
  </g>
);

// ---------------------------------------------------------------------------------------------------------------- il mondo

const COPIA_IN = ev('copia', 1, 0.2);
/** Quanto si vede la copia (universo tangente) nel cielo. */
const copiaVis = (T: number) => keys(T, [
  [0, 0], [ev('letto', 3, 0.5), 0.35, 2], [S('copia'), 0], [COPIA_IN, 1, 2.2], [S('viventi'), 0.35, 1.5], [S('morti'), 0.6, 1.5],
  [S('porta'), 1, 1.5], [ev('salvi', 0, 0.3), 0, 3], [S('aperto'), 0.5, 1.5], [S('ventotto'), 0, 1.5],
]);

/** w, h: formato (1920×1080 nel lungo, 1080×1920 nel trailer); pulito: solo il mondo, senza scritte, nodi e contatore. */
export const Mondo: React.FC<{ T: number; cam?: Cam; chiusura?: boolean; w?: number; h?: number; pulito?: boolean }> = ({ T, cam: cam0, w = W, h = H, pulito = false }) => {
  const cam = cam0 ?? camAt(T);
  const a = alba(T);
  const tv = tavVera(a);
  const vis = copiaVis(T);
  const crash = crashAt(T);
  const night = 1 - a;
  // ---- eventi
  const fall = (t0: number, d = 0.9) => seg(T, t0 - d, t0); // il motore che cade nell'ultimo tratto prima del colpo
  const hits = [AG_HIT, CRASH, LETTO_HIT, RIDE_HIT];
  const lastHit = hits.filter((h) => T >= h).slice(-1)[0] ?? -99;
  const flash = flashAt(T, [AG_HIT, CRASH, LETTO_HIT, ev('sparo', 4, 0.2)].filter((h) => T >= h - 0.05));
  const shake = Math.max(0, 1 - (T - lastHit) / 0.6) * (T - lastHit < 0.6 ? 1 : 0);
  const vort = keys(T, [[0, 0], [ev('aggancio', 2, -0.8), 1, 1.2], [ev('aggancio', 3, 0.5), 0, 1.5], [ev('vortice', 0, 0.2), 1, 2.5], [ev('letto', 0, 0.3), 0, 1.2], [S('porta'), 1, 2], [ev('salvi', 1), 0, 2.5]]);
  const ragLetto = ev('letto', 0, 0.3);
  // ---- trasformazione della camera
  const view = (f = 1, fy = f) => `translate(${w / 2 + Math.sin(T * 60) * 9 * shake} ${h / 2 + Math.cos(T * 55) * 7 * shake}) scale(${cam.z}) translate(${-cam.x * f} ${-cam.y * fy})`;
  const ns = nsAt(cam.z); // simboli a grandezza fissa sullo schermo

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="dd16" />
        <linearGradient id="dd16-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix('#070818', '#2A2A5A', a)} />
          <stop offset=".55" stopColor={mix('#15183A', '#7A5A8A', a)} />
          <stop offset="1" stopColor={mix('#2A2050', '#E8A27A', a)} />
        </linearGradient>
        <radialGradient id="dd16-hole">
          <stop offset="0" stopColor="#000" />
          <stop offset=".55" stopColor="#05040C" />
          <stop offset=".8" stopColor="#3A1A5A" stopOpacity=".7" />
          <stop offset="1" stopColor="#7FA6FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill="url(#dd16-sky)" />
      {/* stelle e luna (lontane: si muovono poco) */}
      <g opacity={night}>
        <Stars t={T} seed={1988} n={110} x={0} y={0} w={w} h={h} color="#EEF0F7" size={1.1} />
      </g>
      <g transform={`translate(${w - 360 - cam.x * 0.03} ${150 - cam.y * 0.04})`} opacity={0.3 + 0.7 * night}>
        <Glow id="dd16-moon" x={0} y={0} r={160} t={T} color="#DDE4FF" amp={0.03} rate={1} opacity={0.4} />
        <circle r={48} fill="#E8ECFA" />
        <circle cx={-14} cy={-8} r={9} fill="#C9D0EA" /><circle cx={12} cy={14} r={6} fill="#C9D0EA" />
      </g>
      {/* colline lontane (parallasse) */}
      <g transform={view(0.35, 0.55)}>
        <path d={`M-4000 ${GROUND - 60} Q-1000 ${GROUND - 330} 1600 ${GROUND - 220} T7000 ${GROUND - 260} T12000 ${GROUND - 200} V2400 H-4000 Z`} fill={mix('#10132A', '#5A4A6A', a)} />
        <path d={`M-4000 ${GROUND - 10} Q0 ${GROUND - 200} 3500 ${GROUND - 120} T12000 ${GROUND - 150} V2400 H-4000 Z`} fill={mix('#141833', '#6A5878', a)} />
      </g>

      <g transform={view()}>
        {/* ---- la copia: il paese in linee azzurre, nel cielo */}
        {vis > 0.01 && (
          <g transform={`translate(0 ${COPY_DY + (1 - Math.min(1, vis * 1.4)) * 300})`} opacity={vis} strokeDasharray="14 10">
            <Copia T={T} />
          </g>
        )}
        {/* ---- il vortice */}
        {vort > 0.01 && <Vortice T={T} k={vort} />}
        {/* ---- il paese vero */}
        <Citta T={T} c={tv} crash={crash} flood={flood(T)} fire={fire(T)} burnt={burnt(T)} cut={cutAt(T)} nastro={nastroAt(T)} fari={fariAt(T)} inBed={inCap(T, 'ride') || inCap(T, 'letto') ? 1 : 0} lights={keys(T, [[0, 1], [S('gesto'), 0.2, 1.5], [S('aperto'), 1, 1.5]])} />
        {/* ---- il motore che cade */}
        {[AG_HIT, CRASH, LETTO_HIT, RIDE_HIT].map((h, i) => {
          const d = i === 3 ? DUR.ride - 1.5 : 0.9;
          const p = i === 3 ? seg(T, S('ride') + 0.5, h) : i === 0 ? (T < h ? 0.5 : 1) : fall(h, d);
          if (p <= 0 || p >= 1) return null;
          // nell'aggancio il motore è già nella miniatura, appena sopra il tetto, e scende fino al colpo
          const q = i === 3 ? 0.35 * p + 0.65 * eio(seg(T, h - 0.9, h)) : i === 0 ? lerp(0.8, 1, seg(T, 0, h) ** 2) : p * p;
          const from = i === 0 ? [HIT[0] + 900, HIT[1] - 1100] as const : [VORTEX[0] - 1600, -900] as const;
          const x = lerp(from[0], HIT[0], q), y = lerp(from[1], HIT[1], q);
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${-28 + 30 * (1 - q)})`}>
              <path d={`M0 0 L${-220 - 200 * q} ${-260 - 260 * q}`} stroke={ENGINE} strokeWidth={26} strokeLinecap="round" opacity={0.25} />
              <path d={`M0 0 L${-140 - 120 * q} ${-170 - 160 * q}`} stroke="#FFE0A8" strokeWidth={10} strokeLinecap="round" opacity={0.5} />
              <g transform={`scale(${i === 0 ? 1.5 : 1.15})`}><Motore T={T} spin={2} glow={0.8} /></g>
            </g>
          );
        })}
        {/* polvere e schegge al colpo */}
        {hits.map((h, i) => T >= h && T < h + 2.2 ? <Polvere key={i} T={T - h} x={HIT[0]} y={HIT[1]} /> : null)}

        {/* ---- i capitoli */}
        {!pulito && <Storia T={T} ns={ns} />}
        {!pulito && <Regole T={T} ns={ns} />}
        {!pulito && <Finale T={T} ns={ns} />}
        {!pulito && <AggancioMondo T={T} ns={ns} />}
        {/* primo piano scuro: cespugli e staccionata davanti alla strada (si muovono più veloci: parallasse) */}
        <g transform={`translate(${-cam.x * 0.3} 0)`}>{PRIMO.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${GROUND + 180})`}>
            <path d={`M${-b.w} 60 Q${-b.w} ${-b.h} 0 ${-b.h * 1.1} Q${b.w} ${-b.h} ${b.w} 60 Z`} fill={mix('#05060C', '#1A1420', a)} />
            {b.fence && Array.from({ length: 6 }, (_, k) => <rect key={k} x={-b.w + k * (b.w / 3)} y={-b.h * 0.7} width={12} height={b.h} fill={mix('#06070E', '#1E1824', a)} />)}
          </g>
        ))}</g>
        {/* nebbia bassa */}
        <Fog id="dd16-fog1" t={T} y={GROUND + 60} x={2000} rx={2600} ry={90} color={mix('#8A90C0', '#E8C8B8', a)} opacity={0.16} drift={300} speed={0.05} />
        <Fog id="dd16-fog2" t={T} y={GROUND + 40} x={6600} rx={2800} ry={80} color={mix('#8A90C0', '#E8C8B8', a)} opacity={0.14} drift={300} speed={0.04} ph={2} />
      </g>

      {!pulito && T >= S('coniglio') && T < S('chiusura') && <TopShade id="dd16" color="#06070F" h={230} />}
      {!pulito && <Contatore T={T} />}
      {w === W && <Motes16 T={T} color="#EEF0F7" k={0.8} />}
      {/* un attimo di buio prima dello sparo e dello strappo del motore (momenti clou) */}
      {!pulito && (() => {
        const dk = Math.max(
          seg(T, ev('sparo', 4, -0.5), ev('sparo', 4, 0.15)) * (1 - seg(T, ev('sparo', 4, 0.25), ev('sparo', 4, 1.4))),
          0.6 * seg(T, ev('vortice', 2, 0.6), ev('vortice', 2, 1.4)) * (1 - seg(T, ev('vortice', 2, 1.5), ev('vortice', 2, 2.2))),
        );
        return dk > 0 ? <rect width={w} height={h} fill="#020208" opacity={0.78 * dk} /> : null;
      })()}
      {flash > 0 && <rect width={w} height={h} fill="#FFF3DA" opacity={0.35 * flash} />}
      {!pulito && T >= ragLetto && T < ragLetto + 1.6 && <Riavvolgi T={T - ragLetto} />}
      <rect width={w} height={h} fill={mix('#141830', '#3A2A40', a)} opacity={0.12} />
      <rect width={w} height={h} fill="url(#dd16-vig)" />
      <rect width={w} height={h} fill="url(#dd16-grain)" opacity=".5" />
    </svg>
  );
};

/** La copia del paese, in linee azzurre; con il crollo si incrina e si risucchia nel buco nero; con «salvi» si dissolve. */
const Copia: React.FC<{ T: number }> = ({ T }) => {
  const crack = keys(T, [[0, 0], [S('crollo'), 1, 1.5], [E('crollo') - 1.2, 0, 1.2]]);
  const hole = keys(T, [[0, 0], [ev('crollo', 0, 0.8), 1, 3], [E('crollo') - 1.2, 0, 1.2]]);
  const pull = hole;
  const cx = VORTEX[0];
  const cy = GROUND - 330;
  const dissolve = seg(T, ev('salvi', 0, 0.3), ev('salvi', 1, 1));
  return (
    <g>
      {/* la bolla tratteggiata che la contiene */}
      <rect x={-900} y={GROUND - 760} width={10500} height={980} rx={160} fill="rgba(127,166,255,0.04)" stroke={COPY} strokeWidth={8} strokeDasharray="40 26" strokeDashoffset={-T * 30} />
      <text x={2600} y={GROUND - 680} fontFamily={SANS} fontWeight={900} fontSize={80} letterSpacing="10" fill={COPY} strokeDasharray="none">LA COPIA · UNIVERSO TANGENTE</text>
      <g transform={`translate(${cx} ${cy}) scale(${1 - 0.25 * pull}) translate(${-cx} ${-cy})`} opacity={1 - dissolve}>
        <Citta T={T} c={tavCopia} crash={1} flood={0} fire={0} burnt={0} />
      </g>
      {/* crepe */}
      {crack > 0 && (
        <g stroke={COPY} strokeWidth={10} fill="none" strokeLinejoin="round" opacity={crack} strokeDasharray="none">
          {[[-400, 0], [1800, 1], [3200, 2], [5600, 3], [7400, 4]].map(([x, s]) => {
            const r = rng(50 + s);
            let d = `M${x} ${GROUND - 740}`;
            for (let i = 1; i <= 7; i++) d += ` L${x + (r() - 0.5) * 300} ${GROUND - 740 + i * 130}`;
            return <path key={x} d={d} pathLength={1} strokeDasharray={`${crack} 1`} />;
          })}
        </g>
      )}
      {/* il buco nero */}
      {hole > 0 && (
        <g transform={`translate(${cx} ${cy})`}>
          <circle r={900 * hole} fill="url(#dd16-hole)" />
          {Array.from({ length: 5 }, (_, i) => (
            <ellipse key={i} rx={(300 + i * 140) * hole} ry={(90 + i * 40) * hole} fill="none" stroke={i % 2 ? '#B8A0FF' : COPY} strokeWidth={6} opacity={0.5 - i * 0.07} transform={`rotate(${T * (40 - i * 6) + i * 30})`} strokeDasharray="60 40" />
          ))}
          <circle r={160 * hole} fill="#000" stroke="#B8A0FF" strokeWidth={6} />
        </g>
      )}
      {/* la dissoluzione: particelle che salgono */}
      {dissolve > 0 && dissolve < 1 && Array.from({ length: 90 }, (_, i) => {
        const r = rng(300 + i);
        const x = -600 + r() * 10000, y0 = GROUND - 700 + r() * 800;
        return <circle key={i} cx={x + Math.sin(T + i) * 20} cy={y0 - dissolve * (200 + r() * 500)} r={4 + r() * 8} fill={COPY} opacity={(1 - dissolve) * 0.8} strokeDasharray="none" />;
      })}
    </g>
  );
};

/** Il vortice di nuvole: spirale che gira, lampi dentro, luce viola e arancio. */
const Vortice: React.FC<{ T: number; k: number }> = ({ T, k }) => {
  const R = 620 * eo(Math.min(1, k));
  const bolts = [ev('vortice', 0, 1.5), ev('vortice', 2, 0.5), ev('porta', 1), ev('porta', 3, 0.5)];
  const fl = flashAt(T, bolts.filter((b) => T >= b));
  return (
    <g transform={`translate(${VORTEX[0]} ${VORTEX[1]})`} opacity={Math.min(1, k * 1.3)}>
      <Glow id="dd16-vg" x={0} y={0} r={R * 1.9} t={T} color="#B07AD8" amp={0.08} rate={1.5} opacity={0.5} />
      <Glow id="dd16-vg2" x={0} y={40} r={R * 1.2} t={T} color={ENGINE} amp={0.1} rate={2.2} opacity={0.25} />
      {/* nuvole a spirale: sbuffi che girano verso il centro, in una prospettiva schiacciata */}
      <g transform="scale(1 0.46)">
        {Array.from({ length: 120 }, (_, i) => {
          const arm = i % 3;
          const u = mod((i / 120) * 3 + T * 0.05, 1);
          const ang = arm * ((Math.PI * 2) / 3) + u * Math.PI * 3.2 + T * 0.35;
          const rad = R * (1.05 - u * 0.85);
          const col = [mix('#3A2E5A', '#8A6AA8', u), mix('#5A4A7A', '#E8B8A8', u), mix('#2A2448', '#B88AC8', u)][arm];
          return <circle key={i} cx={Math.cos(ang) * rad} cy={Math.sin(ang) * rad} r={(70 - u * 40) * (R / 620)} fill={col} opacity={0.55 + 0.35 * u} />;
        })}
        {[0, 1, 2].map((i) => (
          <circle key={i} r={R * (0.42 - i * 0.1)} fill="none" stroke={i === 2 ? '#FFE0A8' : '#C8B0E8'} strokeWidth={14 - i * 3} strokeDasharray="80 50" strokeDashoffset={-T * (120 + i * 60)} opacity={0.6} />
        ))}
      </g>
      <ellipse rx={R * 0.28} ry={R * 0.12} fill="#0A0818" stroke="#FFE0A8" strokeWidth={5} opacity={0.9} />
      <Lightning x={-60} y={-R * 0.3} h={R * 0.5} flash={fl} seed={9} width={10} />
      <Lightning x={120} y={-R * 0.25} h={R * 0.4} flash={fl * 0.7} seed={13} width={7} />
    </g>
  );
};

/** Polvere, tegole e scintille al colpo del motore. */
const Polvere: React.FC<{ T: number; x: number; y: number }> = ({ T, x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 16 }, (_, i) => {
      const r = rng(70 + i);
      const a = -Math.PI * (0.1 + r() * 0.8), v = 200 + r() * 400;
      const px = Math.cos(a) * v * T, py = Math.sin(a) * v * T + 500 * T * T;
      return i < 9
        ? <rect key={i} x={px} y={py} width={18} height={8} fill="#2A2E52" stroke={DARK} strokeWidth={2} transform={`rotate(${T * 400 * (r() - 0.5)} ${px} ${py})`} opacity={1 - T / 2.2} />
        : <circle key={i} cx={px} cy={py} r={4} fill="#FFE0A8" opacity={Math.max(0, 1 - T / 0.8)} />;
    })}
    <defs>
      <radialGradient id="dd16-dust"><stop offset="0" stopColor="#B8BEDA" stopOpacity=".8" /><stop offset=".6" stopColor="#9AA0C0" stopOpacity=".35" /><stop offset="1" stopColor="#9AA0C0" stopOpacity="0" /></radialGradient>
    </defs>
    {Array.from({ length: 9 }, (_, i) => (
      <circle key={`p${i}`} cx={(i - 4) * 46 * (1 + T * 1.4)} cy={-T * 70 - (i % 3) * 30} r={70 + T * 120} fill="url(#dd16-dust)" opacity={Math.max(0, 0.9 - T * 0.42)} />
    ))}
  </g>
);

/** Il riavvolgimento: righe orizzontali come un nastro che torna indietro. */
const Riavvolgi: React.FC<{ T: number }> = ({ T }) => {
  const o = Math.sin(Math.PI * Math.min(1, T / 1.6));
  return (
    <g opacity={o}>
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={0} y={mod(i * 130 + T * 900, H)} width={W} height={10 + (i % 3) * 8} fill="#EEF0F7" opacity={0.07} />)}
      <text x={W - 120} y={H - 140} textAnchor="end" fontFamily={SANS} fontWeight={900} fontSize={64} fill={TIME} opacity={0.8}>◀◀</text>
    </g>
  );
};

const cutAt = (T: number) => (inCap(T, 'letto') ? eo(seg(T, ev('letto', 1, -0.5), ev('letto', 1, 0.5))) * (1 - seg(T, ev('letto', 3), ev('letto', 3, 1))) : inCap(T, 'ride') ? eo(seg(T, S('ride') + 0.4, S('ride') + 1.4)) : 0);
const nastroAt = (T: number) => (inCap(T, 'motore') ? seg(T, ev('motore', 1), ev('motore', 1, 0.6)) : inCap(T, 'gesto') ? 1 : 0);
const fariAt = (T: number) => (inCap(T, 'vortice') ? seg(T, ev('vortice', 1), ev('vortice', 1, 0.8)) : 0);

// ---------------------------------------------------------------------------------------------------------------- AGGANCIO

const AggancioMondo: React.FC<{ T: number; ns: number }> = ({ T, ns }) => {
  if (T >= E('aggancio')) return null;
  const t2 = ev('aggancio', 1, 0.3), t3 = ev('aggancio', 2, 0.2), t4 = ev('aggancio', 3, 0.2), t5 = ev('aggancio', 4, 0.2);
  const out = seg(T, E('aggancio') - 2.2, E('aggancio') - 1.2);
  return (
    <g opacity={1 - out}>
      {/* il contatore dei 28 giorni già nella miniatura, sopra il tetto */}
      <g transform={`translate(${HIT[0] - 300} ${HIT[1] - 400})`} opacity={seg(T, t2, t2 + 0.4) * (1 - seg(T, t4 - 0.5, t4))}>
        <rect x={-190} y={-56} width={380} height={100} rx={20} fill={DARK} stroke={RED} strokeWidth={6} />
        <text y={20} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={64} letterSpacing="3" fill={RED}>28 GIORNI</text>
      </g>
      <Tag T={T} t0={t2} x={HIT[0] - 40} y={HIT[1] + 200} text="NESSUN AEREO L'HA PERSO" s={0.9} until={t4 - 0.5} />
      <Anello T={T} x={HIT[0]} y={HIT[1]} r={150} on={seg(T, t2, t2 + 0.5) * (1 - seg(T, t4 - 0.5, t4))} />
      <Mano T={T} t0={t3} x={VORTEX[0] + 100} y={VORTEX[1] + 420} text="da dove arriva?" size={74} until={t4 - 0.5} />
      {/* le tre promesse: la storia, le regole, il finale */}
      {[['LA STORIA', 3150, 'pantofole'], ['LE REGOLE DEL TEMPO', 3950, 'libro'], ['IL FINALE', 4750, 'orecchie']].map(([s, x, ic], i) => (
        <g key={s}>
          <Nodo T={T} t0={t4 + i * 0.8} x={x as number} y={-120} icon={ic as string} s={ns * 0.9} fade={1 - seg(T, t5 - 0.5, t5)} />
          <Tag T={T} t0={t4 + i * 0.8 + 0.2} x={x as number} y={120} text={s as string} s={0.6} until={t5 - 0.5} />
        </g>
      ))}
      <AereoMamma T={T} />
      {/* il motore strappato dal vortice (anticipazione): vola via lungo il tratteggio giallo */}
      {T >= ev('aggancio', 2, 0.9) && T < ev('aggancio', 3, 0.3) && (() => {
        const p = eio(seg(T, ev('aggancio', 2, 0.9), ev('aggancio', 3, 0.2)));
        const [mx, my] = qpt([VORTEX[0] + 100, VORTEX[1]], [VORTEX[0] - 500, VORTEX[1] - 500], [VORTEX[0] - 1400, VORTEX[1] + 100], p);
        return <g transform={`translate(${mx} ${my}) rotate(${T * 220}) scale(${ns * 0.9})`} opacity={1 - seg(T, ev('aggancio', 3, -0.3), ev('aggancio', 3, 0.2))}><Motore T={T} spin={3} glow={1} /></g>;
      })()}
      <Mano T={T} t0={ev('aggancio', 2, 1.3)} x={VORTEX[0] - 200} y={VORTEX[1] - 520} text="il motore sparisce…" size={56} until={ev('aggancio', 3)} />
      {/* il gesto dell'ultima scena: due saluti con un punto interrogativo */}
      {T >= t5 && (
        <g transform={`translate(4300 -40) scale(${ns * pop(T, t5)})`}>
          <Saluto x={-120} y={0} T={T} />
          <Saluto x={120} y={0} T={T} flip />
          <path d="M-60 0 Q0 -60 60 0" fill="none" stroke={COPY} strokeWidth={6} strokeDasharray="14 10" strokeDashoffset={-T * 40} />
          <text x={0} y={-90} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={90} fill={TIME} stroke={DARK} strokeWidth={10} paintOrder="stroke">?</text>
        </g>
      )}
    </g>
  );
};

/** Il saluto: un cerchio con un'onda (icona, nessuna mano disegnata). */
const Saluto: React.FC<{ x: number; y: number; T: number; flip?: boolean }> = ({ x, y, T, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <circle r={52} fill="#1C2040" stroke={TIME} strokeWidth={5} />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${-14 + i * 14} ${-22 + i * 2} q${10} ${12 + Math.sin(T * 6 + i) * 4} 0 ${26}`} fill="none" stroke={TIME} strokeWidth={6} strokeLinecap="round" opacity={0.5 + 0.5 * Math.abs(Math.sin(T * 6 + i))} />
    ))}
  </g>
);

// ---------------------------------------------------------------------------------------------------------------- LA STORIA

/** Posizione di Donnie (pantofole) capitolo per capitolo. */
const donnie = (T: number): [number, number] => {
  const k: [number, number, number][] = [
    [S('coniglio'), X.casa - 560, 380], [S('motore'), X.golf + 60, 330], [ev('motore', 1), X.casa - 380, 250], [S('testa'), X.studio - 520, 300],
    [S('libro'), X.scuola + 420, 250], [ev('libro', 2), X.nonna - 520, 260], [S('ordini'), X.scuola + 700, 200], [ev('ordini', 2), X.scuola + 820, 260],
    [S('gretchen'), X.cinema + 330, 240], [S('notte'), X.nonna - 430, 380], [S('sparo'), X.nonna - 160, 400], [S('vortice'), X.collina - 260, 160],
    [S('letto'), X.casa - 250, 280],
  ];
  let p: [number, number] = [k[0][1], k[0][2]];
  for (const [t0, x, y] of k) if (T >= t0) { const q = eio(seg(T, t0, t0 + 1.4)); p = [lerp(p[0], x, q), lerp(p[1], y, q)]; }
  return p;
};

const Storia: React.FC<{ T: number; ns: number }> = ({ T, ns }) => {
  if (T < S('coniglio') || T >= E('letto') + 0.5) return null;
  const [dx, dy] = donnie(T);
  const fadeAll = 1 - seg(T, E('letto') - 0.3, E('letto') + 0.3);
  const rew = ev('letto', 0, 0.3);
  const gDead = keys(T, [[0, 0], [ev('sparo', 0, 0.4), 1, 0.8], [rew, 0, 1.2]]);
  const fDead = keys(T, [[0, 0], [ev('sparo', 4, 0.4), 1, 0.6], [rew, 0, 1.2]]);
  const dDead = seg(T, LETTO_HIT, LETTO_HIT + 0.6);
  // i passi del sonnambulo: dalla porta al prato (prima notte) e poi verso il golf
  const passi = (x0: number, x1: number, t0: number, t1: number, id: string) => (
    <Linea T={T} t0={t0} id={id} d={`M${x0} ${GROUND + 40} C${(x0 + x1) / 2} ${GROUND + 80} ${(x0 + x1) / 2} ${GROUND + 20} ${x1} ${GROUND + 50}`} color="#9FB0FF" w={8} dashed dur={t1 - t0} fade={fadeAll * (1 - seg(T, S('testa'), S('testa') + 1))} />
  );
  return (
    <g opacity={fadeAll}>
      {/* ---- coniglio: la voce, i passi, Frank sul prato */}
      {passi(X.casa - 92, X.casa - 600, ev('coniglio', 2), ev('coniglio', 2, 2), 'dd16-p1')}
      {passi(X.casa - 600, X.golf + 120, S('motore'), S('motore') + 2, 'dd16-p2')}
      <Mano T={T} t0={ev('coniglio', 2)} x={X.casa - 200} y={GROUND - 520} text="una voce…" size={52} color="#B8C4FF" until={ev('coniglio', 3, 0.5)} />
      <Nodo T={T} t0={ev('coniglio', 1, 0.2)} x={dx} y={dy} icon="pantofole" name="Donnie" sub={T < S('motore') ? 'sonnambulo' : undefined} s={ns} dead={dDead} />
      {/* Frank: nelle visioni azzurro; vero (ragazzo) dalla notte dello sparo */}
      <Nodo T={T} t0={ev('coniglio', 3, 0.2)} x={frankPos(T)[0]} y={frankPos(T)[1]} icon="orecchie" name="Frank" sub={T < S('motore') ? 'lo vede solo lui' : T >= ev('sparo', 1) && T < ev('sparo', 3) ? 'il fidanzato della sorella' : undefined} s={ns} ghost={T < ev('sparo', 1) ? 1 : 0} dead={fDead}
        fade={T < S('motore') + 1 || inCap(T, 'testa') || inCap(T, 'ordini') || inCap(T, 'sparo') ? 1 : 0} />
      <Mano T={T} t0={ev('coniglio', 4, 0.4)} x={X.casa - 860} y={250} text="il mondo finirà" size={50} until={E('coniglio')} />

      {/* ---- motore */}
      <Tag T={T} t0={ev('motore', 4, 0.1)} x={HIT[0] + 40} y={HIT[1] - 230} text="NESSUN AEREO L'HA PERSO" until={E('motore') - 0.3} />
      <Anello T={T} x={HIT[0]} y={HIT[1]} r={130} on={seg(T, ev('motore', 4, 0.3), ev('motore', 4, 0.8)) * (1 - seg(T, E('motore') - 0.5, E('motore')))} />
      {/* le luci dei vigili del fuoco */}
      {inCap(T, 'motore') && T > ev('motore', 1) && (
        <g>
          <Glow id="dd16-vf1" x={X.casa + 420} y={GROUND - 40} r={260} t={T} color={Math.sin(T * 8) > 0 ? '#FF3A3A' : '#3A6AFF'} amp={0.2} rate={8} opacity={0.5} />
          <Mano T={T} t0={ev('motore', 1, 0.4)} x={X.casa + 560} y={GROUND - 260} text="vigili del fuoco" size={44} color="#FFB0A0" until={ev('motore', 3)} />
        </g>
      )}
      <Mano T={T} t0={ev('motore', 3)} x={X.casa + 140} y={GROUND - 80} text="il suo letto" size={44} until={ev('motore', 4)} />
      <Linea T={T} t0={ev('motore', 3)} id="dd16-letto" d={`M${X.casa + 140} ${GROUND - 120} L${X.casa + 132} ${GROUND - 190}`} color={TIME} w={6} fade={1 - seg(T, ev('motore', 4), ev('motore', 4, 0.4))} />

      {/* ---- testa: la psicologa e le visioni */}
      <Nodo T={T} t0={S('testa') + 0.8} x={X.studio + 380} y={300} icon="metronomo" name="la psicologa" s={ns} fade={inCap(T, 'testa') ? 1 : 0} />
      {inCap(T, 'testa') && [0, 1, 2].map((i) => {
        const t0 = ev('testa', 0, 0.2 + i * 0.5);
        const p = eo(seg(T, t0, t0 + 0.6));
        return T >= t0 ? <g key={i} transform={`translate(${dx + 90 + i * 70} ${dy - 80 - i * 60}) scale(${p * (0.6 + i * 0.25)})`} opacity={0.8}>
          <circle r={34} fill="rgba(127,166,255,0.25)" stroke={COPY} strokeWidth={4} strokeDasharray="10 7" />
          {i === 2 && <g transform="scale(.6)"><Icona k="orecchie" /></g>}
        </g> : null;
      })}
      <Mano T={T} t0={ev('testa', 2, 0.3)} x={X.studio - 60} y={GROUND - 210} text="allucinazione?" size={58} until={E('testa') - 0.2} rot={-4} />
      <Mano T={T} t0={ev('testa', 3, 0.2)} x={frankPos(T)[0]} y={frankPos(T)[1] - 110} text="viaggi nel tempo?" size={46} until={E('testa')} />

      {/* ---- libro: il professore, il libro che passa di mano, Nonna Morte */}
      <Nodo T={T} t0={S('libro') + 0.6} x={X.scuola - 360} y={230} icon="gesso" name="il professore" sub="di scienze" s={ns} fade={inCap(T, 'libro') && T < ev('libro', 2, 1.5) ? 1 : 0} />
      {inCap(T, 'libro') && (() => {
        const t0 = ev('libro', 1, 0.4), t1 = ev('libro', 1, 1.8);
        const p = eio(seg(T, t0, t1));
        const [bx, by] = qpt([X.scuola - 360, 230], [X.scuola, -80], [dx, dy], p);
        return T >= t0 && T < ev('libro', 4) ? <g transform={`translate(${bx} ${by - (p >= 1 ? 90 : 0)}) rotate(${(1 - p) * 360})`}><Icona k="libro" /></g> : null;
      })()}
      <Mano T={T} t0={ev('libro', 1, 1.8)} x={X.scuola + 250} y={170} text="La filosofia del viaggio nel tempo" size={46} until={ev('libro', 2, 1)} />
      <Nodo T={T} t0={ev('libro', 2, 1.2)} x={inCap(T, 'notte') ? X.nonna + 260 : X.nonna + 20} y={inCap(T, 'notte') ? 120 : 180} icon="libro" name="Nonna Morte" sub={inCap(T, 'libro') ? 'ex insegnante' : undefined} s={ns}
        fade={inCap(T, 'libro') ? 1 : inCap(T, 'notte') ? seg(T, ev('notte', 2), ev('notte', 2, 0.5)) * (1 - seg(T, ev('notte', 3, -0.5), ev('notte', 3))) : 0} />
      <Tag T={T} t0={ev('libro', 4, 0.2)} x={X.nonna + 20} y={-70} text="NONNA MORTE" bg={INK} until={E('libro') - 0.2} />

      {/* ---- ordini: la scuola allagata, Gretchen */}
      <Mano T={T} t0={ev('ordini', 0, 0.4)} x={X.scuola + 700} y={60} text="come in sogno" size={46} color="#B8C4FF" until={ev('ordini', 2)} />
      <Mano T={T} t0={ev('ordini', 1, 0.6)} x={X.scuola + 560} y={400} text="allaga la scuola" size={54} color="#A8D4FF" until={ev('ordini', 2, 0.5)} />
      <Tag T={T} t0={ev('ordini', 2, 0.2)} x={X.scuola} y={GROUND - 120} text="SCUOLA CHIUSA" bg={INK} rot={-4} until={E('ordini') - 0.3} />
      <Nodo T={T} t0={ev('ordini', 2, 0.6)} x={gretchenPos(T)[0]} y={gretchenPos(T)[1]} icon="bicicletta" name="Gretchen" sub={T < S('gretchen') ? 'la ragazza nuova' : undefined} s={ns} dead={gDead}
        fade={T < S('vortice') ? 1 : 1 - seg(T, S('vortice'), S('vortice') + 1) + seg(T, rew, rew + 1)} />
      <Mano T={T} t0={ev('ordini', 3, 0.3)} x={X.scuola + 760} y={110} text="scappata da un patrigno violento" size={42} color="#FFB0A0" until={ev('ordini', 4)} />
      <Linea T={T} t0={ev('ordini', 4, 0.2)} id="dd16-cuore" d={`M${X.scuola + 820} ${200} Q${X.scuola + 1000} ${40} ${X.scuola + 1180} ${200}`} color="#E86A9A" w={7} fade={inCap(T, 'ordini') ? 1 : 0} />
      <Mano T={T} t0={ev('ordini', 4, 0.6)} x={X.scuola + 1000} y={70} text="♥" size={70} color="#E86A9A" until={E('ordini')} />

      {/* ---- gretchen: il cinema, lo schermo con Frank senza maschera, la casa che brucia, l'arresto */}
      <Schermo T={T} />
      <Linea T={T} t0={ev('gretchen', 2, 0.2)} id="dd16-brucia" d={`M${X.cinema + 200} ${60} Q${X.cinema + 700} ${-160} ${X.cunn - 200} ${GROUND - 420}`} color={RED} w={8} dashed dur={1.2} fade={inCap(T, 'gretchen') ? 1 : 0} />
      <Mano T={T} t0={ev('gretchen', 2, 0.6)} x={X.cinema + 760} y={-140} text="brucia la casa" size={50} color="#FFB0A0" until={ev('gretchen', 3, 0.5)} />
      <Nodo T={T} t0={ev('gretchen', 2, 1.2)} x={X.cunn + 520} y={220} icon="videocassetta" name="Jim Cunningham" sub="vende corsi di felicità" s={ns} fade={inCap(T, 'gretchen') ? 1 : 0} dead={seg(T, ev('gretchen', 4), ev('gretchen', 4, 0.6))} />
      <Mano T={T} t0={ev('gretchen', 3, 0.5)} x={X.cunn - 420} y={170} text="prove di crimini gravi" size={44} color="#FFB0A0" until={ev('gretchen', 4, 0.5)} />
      <Tag T={T} t0={ev('gretchen', 4, 0.1)} x={X.cunn + 520} y={500} text="ARRESTATO" bg={RED} fg={INK} until={E('gretchen') - 0.2} />
      {/* e per questo la mamma parte per Los Angeles: la causa dell'aereo (revisore testi) */}
      <Nodo T={T} t0={ev('gretchen', 4, 1.4)} x={X.cunn - 520} y={230} icon="valigia" name="la mamma" sub="parte per Los Angeles" s={ns} fade={inCap(T, 'gretchen') ? 1 : 0} />
      <Linea T={T} t0={ev('gretchen', 4, 1.9)} id="dd16-la" d={`M${X.cunn - 420} ${170} Q${X.cunn - 100} ${-200} ${X.cunn + 400} ${-60}`} color={TIME} w={8} dashed dur={1} fade={inCap(T, 'gretchen') ? 1 : 0} />

      {/* ---- notte: l'aereo della mamma, Nonna Morte, i bulli, i fari */}
      <AereoMamma T={T} />
      {[0, 1].map((i) => (
        <Nodo key={i} T={T} t0={ev('notte', 3, 0.3 + i * 0.4)} x={X.nonna - 80 + i * 260} y={250} icon="torcia" name={i ? '' : 'due bulli'} s={ns * 0.85} fade={inCap(T, 'notte') || (inCap(T, 'sparo') && T < ev('sparo', 1)) ? 1 - seg(T, S('sparo') + 0.5, S('sparo') + 1.5) : 0} r={44} />
      ))}
      {inCap(T, 'notte') && T >= ev('notte', 4) && <Mano T={T} t0={ev('notte', 4)} x={X.nonna + 600} y={260} text="rissa!" size={60} color={RED} />}
      {(inCap(T, 'notte') || inCap(T, 'sparo')) && (() => {
        const t0 = ev('notte', 4, 0.8);
        const k = eo(seg(T, t0, ev('sparo', 0, 0.3)));
        if (T < t0) return null;
        return <Fari x={lerp(X.nonna + 1500, X.nonna + 330, k)} y={GROUND + 70} k={k} T={T} ears={seg(T, ev('sparo', 1, 0.2), ev('sparo', 1, 0.8))} />;
      })()}

      {/* ---- sparo */}
      <Cartello T={T} t0={ev('sparo', 0, 0.5)} x={X.nonna + 600} y={160} head="COLPO DI SCENA" text="GRETCHEN MUORE" color={RED} until={ev('sparo', 1, -0.2)} />
      <Cartello T={T} t0={ev('sparo', 1, 0.3)} x={X.nonna + 600} y={160} head="COLPO DI SCENA" text="AL VOLANTE C'È FRANK" color={RED} until={ev('sparo', 3)} />
      <Mano T={T} t0={ev('sparo', 2, 0.3)} x={X.nonna + 780} y={420} text="festa in maschera" size={50} until={ev('sparo', 3, 0.5)} />
      <Anello T={T} x={frankPos(T)[0] + 14} y={frankPos(T)[1] - 4} r={46} on={seg(T, ev('sparo', 4, 0.2), ev('sparo', 4, 0.6)) * (1 - seg(T, E('sparo') - 0.4, E('sparo')))} />

      {/* ---- vortice: l'aereo, il motore strappato che torna indietro */}
      <Mano T={T} t0={ev('vortice', 0, 1.2)} x={VORTEX[0] + 520} y={VORTEX[1] - 300} text="il vortice" size={60} until={ev('vortice', 1, 0.5)} />
      <MotoreIndietro T={T} />

      {/* ---- letto */}
      <Mano T={T} t0={ev('letto', 0, 0.4)} x={X.casa + 560} y={GROUND - 520} text="2 ottobre, di nuovo" size={54} until={ev('letto', 2)} />
      <Mano T={T} t0={ev('letto', 2, 0.2)} x={X.casa + 520} y={GROUND - 360} text="ride" size={56} until={ev('letto', 3)} />
      <Nodo T={T} t0={ev('letto', 4, 0.2)} x={3800} y={-430} icon="libro" name="il libro di Nonna Morte" s={ns * 1.1} ring={1} />
      <Mano T={T} t0={ev('letto', 3, 0.4)} x={3800} y={-650} text="perché?" size={64} />
    </g>
  );
};

/** Posizione di Frank: il prato della prima notte, le visioni, l'auto, la notte dello sparo. */
const frankPos = (T: number): [number, number] => {
  if (T < S('motore')) return [X.casa - 860, 350];
  if (T < S('libro')) return [X.studio - 120, 330];
  if (T < S('ordini')) return [X.scuola + 260, 140];
  if (T < S('gretchen')) return [X.scuola + 260, 160];
  if (T < S('notte')) return [X.cinema - 40, -40];
  return [X.nonna + 470, GROUND - 330];
};
const gretchenPos = (T: number): [number, number] => {
  if (T < S('gretchen')) return [X.scuola + 1180, 260];
  if (T < S('notte')) { const q = eio(seg(T, S('gretchen'), S('gretchen') + 1.4)); return [lerp(X.scuola + 1180, X.cinema - 380, q), lerp(260, 230, q)]; }
  const q = eio(seg(T, S('notte'), S('notte') + 1.5));
  return [lerp(X.cinema - 380, X.nonna + 60, q), lerp(230, GROUND - 300, q)];
};

/** Lo schermo del cinema: azzurro come le visioni; Frank si toglie la maschera (un cerchio con il segno rosso sull'occhio). */
const Schermo: React.FC<{ T: number }> = ({ T }) => {
  if (!inCap(T, 'gretchen') || T < ev('gretchen', 0, 0.6)) return null;
  const k = eo(seg(T, ev('gretchen', 0, 0.6), ev('gretchen', 0, 1.4))) * (1 - seg(T, ev('gretchen', 3), ev('gretchen', 3, 0.8)));
  const mask = seg(T, ev('gretchen', 1, 0.2), ev('gretchen', 1, 1.2));
  return (
    <g transform={`translate(${X.cinema} ${30})`} opacity={k}>
      <Glow id="dd16-scr" x={0} y={0} r={420} t={T} color={COPY} amp={0.06} rate={3} opacity={0.4} />
      <rect x={-300} y={-170} width={600} height={340} rx={10} fill="#0E1430" stroke={COPY} strokeWidth={6} />
      {/* il fascio del proiettore */}
      <path d={`M-300 170 L-560 ${GROUND - 60} L-460 ${GROUND - 60} Z`} fill={COPY} opacity={0.08} />
      <g transform={`translate(0 ${-mask * 60}) scale(2.4)`} opacity={1 - mask * 0.85}><Icona k="orecchie" /></g>
      <g transform="translate(0 30)">
        <circle r={86} fill="#1C2040" stroke={COPY} strokeWidth={6} opacity={mask} />
        <circle cx={32} cy={-14} r={14} fill={RED} opacity={mask} />
        <path d="M18 -14 h28" stroke={DARK} strokeWidth={5} opacity={mask} />
      </g>
    </g>
  );
};

/** L'aereo della mamma nel cielo (ultima notte) e poi verso il vortice all'alba, dove perde il motore. */
const AereoMamma: React.FC<{ T: number }> = ({ T }) => {
  let x = 0, y = 0, engine = true, show = false, k = 1;
  if (inCap(T, 'notte') && T < ev('notte', 2, 1)) {
    const p = seg(T, S('notte'), ev('notte', 2, 1));
    x = lerp(8000, 3200, p); y = -260; show = true;
  }
  const agT = ev('aggancio', 2, 0.9);
  if (inCap(T, 'aggancio') && T >= ev('aggancio', 2, -0.8) && T < ev('aggancio', 3, 0.5)) {
    const p = seg(T, ev('aggancio', 2, -0.8), agT + 2.5);
    x = lerp(VORTEX[0] + 2200, VORTEX[0] - 600, p); y = lerp(VORTEX[1] - 260, VORTEX[1] - 10, p); show = true; engine = T < agT; k = 1.5;
  }
  const tear = ev('vortice', 2, 1.5);
  if (inCap(T, 'vortice') && T >= ev('vortice', 2, -1)) {
    const p = seg(T, ev('vortice', 2, -1), tear + 2.5);
    x = lerp(7600, VORTEX[0] - 1200, p); y = lerp(-420, VORTEX[1] - 40, p); show = true; engine = T < tear; k = 1.6;
  }
  if (!show) return null;
  return (
    <g>
      <g transform={`translate(${x} ${y}) scale(${-k * zk(T)} ${k * zk(T)})`}><Aereo T={T} engine={engine} /></g>
      {inCap(T, 'notte') && <Mano T={T} t0={S('notte') + 0.8} x={x} y={y - 120} text="la mamma torna da Los Angeles" size={46} until={ev('notte', 2, 0.6)} />}
      {inCap(T, 'notte') && <g transform={`translate(${x + 40} ${y - 220})`}><Nodo T={T} t0={S('notte') + 0.4} x={0} y={0} icon="valigia" s={0.9} fade={1 - seg(T, ev('notte', 2), ev('notte', 2, 0.6))} r={44} /></g>}
    </g>
  );
};

/** Il motore strappato dall'aereo che torna indietro nel tempo, lungo il tratteggio giallo, fino alla prima notte. */
const MotoreIndietro: React.FC<{ T: number }> = ({ T }) => {
  const tear = ev('vortice', 2, 1.5);
  if (!inCap(T, 'vortice') || T < tear) return null;
  const p = eio(seg(T, tear + 0.3, ev('vortice', 3, 2.5)));
  const a = [VORTEX[0] - 300, VORTEX[1] + 40] as const, c = [2600, -700] as const, b = [HIT[0], HIT[1] - 600] as const;
  const [x, y] = qpt(a, c, b, p);
  return (
    <g>
      <Linea T={T} t0={tear + 0.3} id="dd16-ind" d={`M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`} color={TIME} w={12} dashed dur={2.5} />
      <g transform={`translate(${x} ${y}) rotate(${T * 200}) scale(1.3)`} opacity={1 - seg(T, ev('vortice', 3, 2.3), ev('vortice', 3, 2.8))}><Motore T={T} spin={3} glow={1} /></g>
      <Mano T={T} t0={ev('vortice', 3, 0.3)} x={2700} y={-520} text="all'indietro nel tempo" size={64} until={E('vortice')} />
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------------- LE REGOLE

const COPY_HIT = [HIT[0], HIT[1] + COPY_DY] as const;
const Regole: React.FC<{ T: number; ns: number }> = ({ T, ns }) => {
  if (T < S('copia') || T >= E('trappola') + 0.5) return null;
  const fadeAll = 1 - seg(T, E('trappola') - 0.3, E('trappola') + 0.3);
  return (
    <g opacity={fadeAll}>
      {/* ---- copia: il libro aperto, la strada che devia */}
      {inCap(T, 'copia') && <LibroAperto T={T} />}
      <Linea T={T} t0={ev('copia', 3)} id="dd16-dev" d={`M${-600} ${GROUND + 70} H${X.casa} C${X.casa + 1200} ${GROUND + 70} ${X.casa + 600} ${GROUND + COPY_DY + 70} ${X.casa + 2200} ${GROUND + COPY_DY + 70} H${X.collina - 600}`} color={COPY} w={22} dashed dur={2} fade={inCap(T, 'copia') ? 1 : 0} />
      <Linea T={T} t0={ev('copia', 3)} id="dd16-ver" d={`M${X.casa} ${GROUND + 70} H${9800}`} color={INK} w={18} dur={1} fade={inCap(T, 'copia') ? 1 : 0} />
      <Mano T={T} t0={ev('copia', 3, 0.8)} x={2700} y={-60} text="la strada che devia" size={80} color={COPY} until={E('copia')} />
      <Cartello T={T} t0={ev('copia', 2, 0.4)} x={4300} y={-1280} head="LA REGOLA" text="UNIVERSO TANGENTE = COPIA DEL MONDO" until={E('copia') - 0.3} />
      <Mano T={T} t0={ev('copia', 4, 0.2)} x={6200} y={-200} text="dura poche settimane" size={70} until={E('copia')} />
      <Tag T={T} t0={ev('copia', 4, 1.8)} x={4300} y={-880} text="LA STORIA DI DONNIE È QUI DENTRO" bg={COPY} until={E('copia')} />

      {/* ---- artefatto: la lente sui due tetti, il pezzo di troppo */}
      {inCap(T, 'artefatto') && <Lente T={T} />}
      <Cartello T={T} t0={ev('artefatto', 1, 0.6)} x={COPY_HIT[0] + 760} y={COPY_HIT[1] + 330} head="LA REGOLA" text="ARTEFATTO" until={E('artefatto') - 0.3} s={1.1} />
      <Mano T={T} t0={ev('artefatto', 0, 1)} x={HIT[0] + 640} y={HIT[1] - 240} text="mondo vero: niente motore" size={52} color={INK} until={E('artefatto')} />
      <Pezzo T={T} />
      <Anello T={T} x={COPY_HIT[0]} y={COPY_HIT[1]} r={150} on={seg(T, ev('artefatto', 4), ev('artefatto', 4, 0.5)) * (1 - seg(T, E('artefatto') - 0.4, E('artefatto')))} />

      {/* ---- crollo: le frecce che tirano giù anche il mondo vero */}
      {inCap(T, 'crollo') && [1500, 4400, 7300].map((x, i) => (
        <Linea key={x} T={T} t0={ev('crollo', 1, 0.3 + i * 0.3)} id={`dd16-tira${i}`} d={`M${x} ${GROUND + 80} Q${(x + VORTEX[0]) / 2} ${GROUND - 200} ${VORTEX[0] + (x - VORTEX[0]) * 0.15} ${GROUND + COPY_DY - 280}`} color={RED} w={26} dashed dur={1.2} />
      ))}
      <Cartello T={T} t0={ev('crollo', 0, 1.2)} x={VORTEX[0]} y={-1100} head="LA REGOLA" text="LA COPIA CROLLA: BUCO NERO" until={ev('crollo', 2)} />
      {inCap(T, 'crollo') && T >= ev('crollo', 2) && <Grande28 T={T} t0={ev('crollo', 2)} x={VORTEX[0] + 1300} y={-1000} s={ns * 0.45} sub="IL TEMPO PRIMA DEL CROLLO" />}

      {/* ---- ricevitore: Donnie al centro con i poteri */}
      <Ricevitore T={T} />

      {/* ---- viventi: i cerchi delle persone vicine e il domino */}
      {inCap(T, 'viventi') && <Domino T={T} ns={ns} />}
      <Cartello T={T} t0={ev('viventi', 0, 0.6)} x={5600} y={-760} head="LA REGOLA" text="MANIPOLATI VIVENTI" until={ev('viventi', 3, 0.3)} />

      {/* ---- morti: Frank fantasma che torna indietro */}
      <Morti T={T} ns={ns} />

      {/* ---- trappola */}
      <Trappola T={T} ns={ns} />
    </g>
  );
};

/** Il libro di Nonna Morte aperto nel cielo, con disegni a mano (le pagine che girano). */
const LibroAperto: React.FC<{ T: number }> = ({ T }) => {
  const k = eo(seg(T, S('copia') + 0.3, S('copia') + 1.3)) * (1 - seg(T, ev('copia', 2), ev('copia', 2, 1)));
  if (k <= 0) return null;
  const flip = mod(T * 0.8, 1);
  return (
    <g transform={`translate(${VORTEX[0]} ${-420}) scale(${1.2 * k})`}>
      <Glow id="dd16-lib" x={0} y={0} r={760} t={T} color="#FFE7B8" amp={0.04} rate={1.4} opacity={0.35} />
      <path d="M-640 -320 Q-320 -380 0 -320 Q320 -380 640 -320 V320 Q320 260 0 320 Q-320 260 -640 320 Z" fill="#5A3A2C" stroke={DARK} strokeWidth={10} />
      <path d="M-610 -300 Q-300 -350 0 -300 V300 Q-300 250 -610 300 Z" fill="#EFE6CC" stroke={DARK} strokeWidth={6} />
      <path d="M610 -300 Q300 -350 0 -300 V300 Q300 250 610 300 Z" fill="#E8DEC0" stroke={DARK} strokeWidth={6} />
      {/* disegni a mano: due linee del tempo, una che devia; un vortice; un motore */}
      <g fill="none" stroke="#5A4A3A" strokeWidth={6} strokeLinecap="round">
        <path d="M-560 -120 H-60" />
        <path d="M-480 -120 C-380 -120 -400 -260 -260 -260 H-80" strokeDasharray="16 12" />
        <path d="M-520 100 q60 -60 120 0 t120 0 t120 0" />
        {[0, 1, 2].map((i) => <ellipse key={i} cx={300} cy={-80} rx={160 - i * 45} ry={60 - i * 16} transform={`rotate(${T * 30 + i * 40} 300 -80)`} />)}
        <path d="M120 160 h260 M140 200 h180 M140 240 h220" opacity={0.6} />
      </g>
      <text x={-310} y={-200} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={44} fill="#5A3A2C">il tempo si guasta…</text>
      {/* pagina che gira */}
      <path d={`M0 -300 Q${300 - 600 * flip} ${-340 - 40 * Math.sin(flip * Math.PI)} ${610 - 1220 * flip} -300 V300 Q${300 - 600 * flip} ${260 - 40 * Math.sin(flip * Math.PI)} 0 300 Z`} fill="#F4ECD4" stroke={DARK} strokeWidth={4} opacity={0.85} />
    </g>
  );
};

/** La lente che passa sui due tetti (vero e copia) e si ferma sul motore della copia. */
const Lente: React.FC<{ T: number }> = ({ T }) => {
  const p = eio(seg(T, ev('artefatto', 0, 0.2), ev('artefatto', 1, 0.4)));
  const y = lerp(HIT[1] + 60, COPY_HIT[1], p);
  const x = HIT[0] + 40 * Math.sin(T * 1.3);
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={190} fill="rgba(238,240,247,0.06)" stroke={INK} strokeWidth={12} />
      <circle r={190} fill="none" stroke={TIME} strokeWidth={4} opacity={0.6} />
      <path d="M134 134 L300 300" stroke={INK} strokeWidth={30} strokeLinecap="round" />
      <path d="M134 134 L300 300" stroke="#5A3A2C" strokeWidth={18} strokeLinecap="round" />
    </g>
  );
};

/** Il pezzo di puzzle di troppo, accanto al motore della copia. */
const Pezzo: React.FC<{ T: number }> = ({ T }) => {
  const t0 = ev('artefatto', 3, 0.2);
  if (!inCap(T, 'artefatto') || T < t0) return null;
  const k = pop(T, t0);
  const wob = Math.sin((T - t0) * 9) * 8 * (1 - seg(T, t0 + 1, t0 + 2.5));
  return (
    <>
    <Mano T={T} t0={t0 + 0.4} x={COPY_HIT[0] - 560} y={COPY_HIT[1] + 160} text="un pezzo di troppo" size={52} />
    <g transform={`translate(${COPY_HIT[0] - 560} ${COPY_HIT[1] - 80}) rotate(${-12 + wob}) scale(${2.4 * k})`}>
      <path d="M-40 -40 H-12 Q-14 -58 0 -58 Q14 -58 12 -40 H40 V-12 Q58 -14 58 0 Q58 14 40 12 V40 H-40 Z" fill={ENGINE} stroke={DARK} strokeWidth={5} />
      <text y={14} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={34} fill={DARK}>+1</text>
    </g>
    </>
  );
};

/** Il contatore grande, nel mondo. */
const Grande28: React.FC<{ T: number; t0: number; y: number; s?: number; sub?: string; x?: number; q?: boolean }> = ({ T, t0, y, s = 1, sub, x = VORTEX[0], q }) => (
  <g transform={`translate(${x} ${y}) scale(${pop(T, t0) * s})`}>
    <rect x={-560} y={-150} width={1120} height={260} rx={40} fill={DARK} stroke={RED} strokeWidth={10} />
    <text y={60} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={170} letterSpacing="6" fill={RED} style={{ fontVariantNumeric: 'tabular-nums' }}>{q ? '?? : ??' : '28 GIORNI'}</text>
    {sub && <text y={190} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={56} letterSpacing="4" fill={INK} stroke={DARK} strokeWidth={10} paintOrder="stroke">{sub}</text>}
  </g>
);

/** Donnie ricevitore: il cerchio grande con l'alone e i quattro poteri che si accendono. */
const Ricevitore: React.FC<{ T: number }> = ({ T }) => {
  if (!inCap(T, 'ricevitore')) return null;
  const c = [2800, -420] as const;
  const t0 = S('ricevitore') + 0.4;
  const pw: [string, string, number][] = [['forza', 'pugno', ev('ricevitore', 2, 0.3)], ['visioni', 'occhio', ev('ricevitore', 2, 1.0)], ['acqua', 'onde', ev('ricevitore', 2, 1.8)], ['fuoco', 'fiamma', ev('ricevitore', 2, 2.4)], ['incubi', 'nuvola', ev('ricevitore', 4)]];
  return (
    <g>
      <Nodo T={T} t0={t0} x={c[0]} y={c[1]} icon="pantofole" s={zk(T) * 1.6} ring={1} />
      {/* le linee del futuro che escono dal cerchio, trasparenti come acqua */}
      {T >= ev('ricevitore', 2, 1.8) && Array.from({ length: 5 }, (_, i) => {
        const p = eo(seg(T, ev('ricevitore', 2, 1.8 + i * 0.1), ev('ricevitore', 2, 3)));
        return <path key={i} d={`M${c[0] + 100} ${c[1] - 40 + i * 20} q${300 * p} ${-80 + i * 40} ${700 * p} ${-40 + i * 30}`} fill="none" stroke="#BFD8FF" strokeWidth={18 - i * 2} strokeLinecap="round" opacity={0.35} />;
      })}
      {pw.map(([label, ic, tt], i) => {
        const a = -Math.PI / 2 + (i - 2) * 0.72;
        const px = c[0] + Math.cos(a) * 560, py = c[1] + Math.sin(a) * 470;
        if (T < tt) return null;
        return (
          <g key={label} transform={`translate(${px} ${py}) scale(${pop(T, tt) * zk(T) * 0.75})`}>
            <circle r={54} fill={i === 4 ? '#2A1A30' : '#1C2040'} stroke={i === 4 ? RED : TIME} strokeWidth={5} />
            <Potere k={ic} T={T} />
            <text y={96} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={40} fill={i === 4 ? '#FFB0A0' : TIME} stroke={DARK} strokeWidth={7} paintOrder="stroke">{label}</text>
          </g>
        );
      })}
      <Cartello T={T} t0={ev('ricevitore', 1, 0.4)} x={c[0]} y={c[1] + 390} head="LA REGOLA" text="RICEVITORE VIVENTE" until={E('ricevitore') - 0.3} />
    </g>
  );
};
const Potere: React.FC<{ k: string; T: number }> = ({ k, T }) => {
  switch (k) {
    case 'pugno': return <path d="M-22 18 V-10 Q-22 -22 -10 -22 H18 Q26 -22 26 -12 V14 Q26 26 12 26 H-14 Q-22 26 -22 18 Z M-10 -22 V-4 M2 -22 V-4 M14 -22 V-4" fill="#C9CDE8" stroke={DARK} strokeWidth={4} />;
    case 'occhio': return <g><path d="M-30 0 Q0 -26 30 0 Q0 26 -30 0 Z" fill="#EEF0F7" stroke={DARK} strokeWidth={4} /><circle r={10} fill={COPY} /><circle r={4} fill={DARK} /></g>;
    case 'onde': return <g fill="none" stroke="#BFD8FF" strokeWidth={5} strokeLinecap="round">{[0, 1, 2].map((i) => <path key={i} d={`M-28 ${-14 + i * 14} q14 ${-10 + Math.sin(T * 3 + i) * 3} 28 0 t28 0`} />)}</g>;
    case 'fiamma': return <path d="M0 28 Q-26 20 -22 -2 Q-18 -16 -6 -24 Q-8 -8 4 -4 Q2 -22 14 -30 Q30 -6 24 12 Q18 26 0 28 Z" fill="#FF8A2C" stroke={DARK} strokeWidth={4} />;
    case 'nuvola': return <path d="M-26 12 Q-34 -4 -16 -8 Q-12 -26 6 -20 Q20 -30 26 -12 Q38 -6 30 12 Z" fill="#4A3A5A" stroke="#FFB0A0" strokeWidth={4} />;
    default: return null;
  }
};

/** I manipolati viventi: le persone vicine accese sopra i loro luoghi, e il domino che cade fino alla collina. */
const Domino: React.FC<{ T: number; ns: number }> = ({ T, ns }) => {
  const people: [string, string, number][] = [['gesso', 'il professore', X.scuola], ['metronomo', 'la psicologa', X.studio], ['videocassetta', 'Cunningham', X.cunn], ['bicicletta', 'Gretchen', X.cinema], ['libro', 'Nonna Morte', X.nonna]];
  const t0 = ev('viventi', 0, 0.8);
  const tiles = 18;
  const td = ev('viventi', 2, -0.3);
  return (
    <g>
      <Nodo T={T} t0={S('viventi') + 0.3} x={X.casa + 400} y={-200} icon="pantofole" name="Donnie" s={ns} ring={1} />
      {people.map(([ic, name, x], i) => <Nodo key={ic} T={T} t0={t0 + i * 0.35} x={x} y={-200} icon={ic} name={name} s={ns * 0.9} ring={ic === 'videocassetta' && T >= ev('viventi', 3, 0.2) ? 1 : 0} />)}
      {/* la catena dell'ultima frase: il fuoco → Cunningham arrestato → la mamma sull'aereo */}
      <Nodo T={T} t0={ev('viventi', 3, 1.6)} x={X.collina - 500} y={-200} icon="valigia" name="la mamma" sub="sull'aereo" s={ns} ring={1} />
      <Linea T={T} t0={ev('viventi', 3, 0.6)} id="dd16-catena" d={`M${X.cunn} ${-330} Q${X.nonna} ${-800} ${X.collina - 500} ${-330}`} color={TIME} w={10} dashed dur={1.2} />
      {Array.from({ length: tiles }, (_, i) => {
        const x = X.casa + 300 + i * ((X.collina - X.casa - 600) / (tiles - 1));
        const tf = td + i * (CROMA / 3);
        const a = eio(seg(T, tf, tf + 0.25)) * 62;
        return (
          <g key={i} transform={`translate(${x} ${GROUND - 40}) rotate(${a}) scale(1.2)`} opacity={seg(T, t0 - 0.5, t0)}>
            <rect x={-40} y={-280} width={80} height={280} rx={10} fill={T >= tf ? TIME : '#EEF0F7'} stroke={DARK} strokeWidth={7} />
            <circle cx={0} cy={-200} r={11} fill={DARK} /><circle cx={0} cy={-80} r={11} fill={DARK} /><path d="M-40 -140 H40" stroke={DARK} strokeWidth={6} />
          </g>
        );
      })}
      <Mano T={T} t0={ev('viventi', 2, 0.4)} x={X.nonna} y={GROUND - 600} text="una dopo l'altra" size={60} until={ev('viventi', 3)} />
    </g>
  );
};

/** I manipolati morti: Frank fantasma, il tratteggio giallo dalla notte dello sparo alla prima notte. */
const Morti: React.FC<{ T: number; ns: number }> = ({ T, ns }) => {
  if (!inCap(T, 'morti')) return null;
  const a = [X.nonna + 470, GROUND - 330] as const, b = [X.casa - 860, 350] as const, c = [4300, -1300] as const;
  const t0 = ev('morti', 2, 0.6);
  const p = eio(seg(T, t0 + 0.4, t0 + 3));
  const [fx, fy] = qpt(a, c, b, p);
  return (
    <g>
      <Cartello T={T} t0={ev('morti', 0, 0.6)} x={4030} y={-1000} head="LA REGOLA" text="MANIPOLATI MORTI" until={E('morti') - 0.3} />
      <Mano T={T} t0={ev('morti', 2)} x={a[0] - 1500} y={a[1] - 260} text="la notte dello sparo" size={50} />
      <Mano T={T} t0={ev('morti', 2, 2.4)} x={b[0] + 1100} y={b[1] - 300} text="la prima notte" size={50} />
      <Linea T={T} t0={t0} id="dd16-morti" d={`M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`} color={TIME} w={14 * ns * 0.6} dashed dur={2.6} />
      <Nodo T={T} t0={S('morti') + 0.6} x={T < t0 + 0.4 ? a[0] : fx} y={T < t0 + 0.4 ? a[1] : fy} icon="orecchie" name="Frank" s={ns} ghost={1} />
      {/* l'occhio ferito: stesso segno rosso nei due punti, collegati dall'anello */}
      {T >= ev('morti', 3) && [a, b].map((q, i) => (
        <g key={i}>
          <circle cx={q[0] + 18 * ns} cy={q[1] - 6 * ns} r={12 * ns} fill={RED} />
          <Anello T={T} x={q[0]} y={q[1]} r={80 * ns} on={seg(T, ev('morti', 3, 0.2 + i * 0.3), ev('morti', 3, 0.7 + i * 0.3))} />
        </g>
      ))}
      <Mano T={T} t0={ev('morti', 4)} x={(a[0] + b[0]) / 2} y={GROUND - 200} text="la ferita della fine, già all'inizio" size={44} />
    </g>
  );
};

/** La trappola di sicurezza: le strade si chiudono, resta solo quella verso la collina e il vortice. */
const Trappola: React.FC<{ T: number; ns: number }> = ({ T, ns }) => {
  if (!inCap(T, 'trappola')) return null;
  const o = [X.nonna + 120, 300] as const;
  const roads: [number, number, boolean][] = [[-1500, -200, false], [-900, -900, false], [400, -1000, false], [1400, -500, true]];
  const tc = ev('trappola', 1, 0.3);
  return (
    <g>
      <Cartello T={T} t0={ev('trappola', 0, 0.5)} x={o[0] + 1100} y={-540} head="LA REGOLA" text="TRAPPOLA DI SICUREZZA" until={E('trappola') - 0.3} />
      {roads.map(([dx, dy, open], i) => {
        const shut = !open && T >= tc + i * CROMA;
        const d = `M${o[0]} ${o[1]} L${o[0] + dx} ${o[1] + dy}`;
        return (
          <g key={i}>
            <Linea T={T} t0={S('trappola') + 0.6 + i * 0.2} id={`dd16-tr${i}`} d={d} color={open && T >= ev('trappola', 3) ? TIME : INK} w={34} dur={0.6} />
            {shut && (
              <g transform={`translate(${o[0] + dx * 0.55} ${o[1] + dy * 0.55}) rotate(${(Math.atan2(dy, dx) * 180) / Math.PI + 90}) scale(${pop(T, tc + i * CROMA) * 1.6})`}>
                <rect x={-90} y={-22} width={180} height={44} rx={8} fill={RED} stroke={DARK} strokeWidth={6} />
                {[-60, -20, 20, 60].map((x) => <path key={x} d={`M${x - 14} 22 L${x + 14} -22`} stroke="#EEF0F7" strokeWidth={10} />)}
              </g>
            )}
          </g>
        );
      })}
      <Nodo T={T} t0={S('trappola') + 0.3} x={o[0]} y={o[1]} icon="bicicletta" name="Gretchen" s={ns} dead={1} />
      <Mano T={T} t0={ev('trappola', 3, 0.6)} x={o[0] + 1250} y={o[1] - 120} text="una sola strada: la collina" size={46} until={E('trappola')} />
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------------- IL FINALE

const Finale: React.FC<{ T: number; ns: number }> = ({ T, ns }) => {
  if (T < S('porta') || T >= STARTS.fine) return null;
  return (
    <g>
      <Porta T={T} ns={ns} />
      <Ritorno T={T} ns={ns} />
      {/* ride */}
      {inCap(T, 'ride') && (
        <g>
          <Mano T={T} t0={ev('ride', 1, 0.3)} x={X.casa + 470} y={GROUND - 520} text="resta lì apposta" size={44} until={ev('ride', 2)} />
          {T >= ev('ride', 2) && <Glow id="dd16-ride" x={X.casa + 108} y={GROUND - 166} r={120} t={T} color="#FFE7B8" amp={0.3} rate={9} opacity={0.6} />}
          <Cartello T={T} t0={ev('ride', 2, 0.4)} x={X.casa + 300} y={400} head="TEORIA" text="NON ERA PAZZO" until={E('ride') - 0.5} color={COPY} />
        </g>
      )}
      <Salvi T={T} ns={ns} />
      <Gesto T={T} />
      <Aperto T={T} ns={ns} />
      <Ventotto T={T} />
      <Seguito T={T} />
    </g>
  );
};

/** Il vortice come porta tra la copia (sopra) e il mondo vero (sotto); il motore che la attraversa. */
const Porta: React.FC<{ T: number; ns: number }> = ({ T, ns }) => {
  if (!inCap(T, 'porta')) return null;
  const t3 = ev('porta', 3);
  const p = eio(seg(T, t3, ev('porta', 4, 1.5)));
  const a = [VORTEX[0], VORTEX[1] - 500] as const, c = [VORTEX[0] - 400, VORTEX[1] + 200] as const, b = [HIT[0], HIT[1] - 60] as const;
  const [x, y] = p < 0.35 ? [lerp(a[0], VORTEX[0], p / 0.35), lerp(a[1], VORTEX[1], p / 0.35)] as const : qpt([VORTEX[0], VORTEX[1]], c, b, (p - 0.35) / 0.65);
  return (
    <g>
      <Nodo T={T} t0={ev('porta', 1, 0.2)} x={X.collina - 260} y={-80} icon="pantofole" name="Donnie" sub="sulla collina" s={ns} ring={1} />
      <Linea T={T} t0={ev('porta', 1, 0.8)} id="dd16-poteri" d={`M${X.collina - 400} ${-80} Q${6400} ${-700} ${VORTEX[0] + 450} ${VORTEX[1]}`} color={TIME} w={16} dur={1.2} />
      <Cartello T={T} t0={ev('porta', 2, 0.2)} x={4800} y={VORTEX[1] - 820} head="LA REGOLA" text="LA PORTA TRA I DUE MONDI" until={E('porta') - 0.3} />
      {T >= t3 && (
        <g>
          <Linea T={T} t0={t3} id="dd16-porta" d={`M${a[0]} ${a[1]} L${VORTEX[0]} ${VORTEX[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`} color={TIME} w={14} dashed dur={2.2} />
          <g transform={`translate(${x} ${y}) rotate(${T * 180}) scale(${1.4 * ns * 0.6})`}><Motore T={T} spin={3} glow={1} /></g>
        </g>
      )}
      <Tag T={T} t0={ev('porta', 4, 0.8)} x={HIT[0]} y={HIT[1] - 300} text="2 OTTOBRE" s={0.9} />
    </g>
  );
};

/** Il cerchio si chiude: il motore dell'aereo (sopra) e il motore nel tetto (sotto) sono lo stesso. */
const Ritorno: React.FC<{ T: number; ns: number }> = ({ T, ns }) => {
  if (!inCap(T, 'ritorno')) return null;
  const pl = [6600, -560] as const;
  return (
    <g>
      <g transform={`translate(${pl[0]} ${pl[1]}) scale(${-1.8} 1.8)`}><Aereo T={T} engine /></g>
      <Anello T={T} x={pl[0] + 50} y={pl[1] + 55} r={110} on={seg(T, ev('ritorno', 1, 0.3), ev('ritorno', 1, 0.8))} />
      <Anello T={T} x={HIT[0]} y={HIT[1]} r={160} on={seg(T, ev('ritorno', 1, 0.9), ev('ritorno', 1, 1.4))} />
      <Linea T={T} t0={ev('ritorno', 1, 1.2)} id="dd16-stesso" d={`M${pl[0] + 50} ${pl[1] + 55} Q${4200} ${-1400} ${HIT[0]} ${HIT[1]}`} color={RED} w={10} dashed dur={1.4} />
      <Mano T={T} t0={ev('ritorno', 1, 1.8)} x={3500} y={-280} text="lo stesso motore" size={52} color="#FFB0A0" />
      <Cartello T={T} t0={ev('ritorno', 1, 0.6)} x={5300} y={-1150} head="COLPO DI SCENA" text="È IL MOTORE DELLA MAMMA" color={RED} until={ev('ritorno', 2, 0.1)} />
      <Tag T={T} t0={ev('ritorno', 2, 0.3)} x={5200} y={-860} text="L'AEREO NON ERA ANCORA PARTITO" until={ev('ritorno', 3, 0.2)} />
      {/* il cerchio perfetto: un anello giallo che gira tra cielo e tetto */}
      {T >= ev('ritorno', 3, 0.2) && (
        <g>
          <ellipse cx={(pl[0] + HIT[0]) / 2} cy={(pl[1] + HIT[1]) / 2 - 300} rx={2900} ry={900} fill="none" stroke={TIME} strokeWidth={18} strokeDasharray="50 34" strokeDashoffset={-T * 140} opacity={seg(T, ev('ritorno', 3, 0.2), ev('ritorno', 3, 1))} />
          <Mano T={T} t0={ev('ritorno', 3, 0.8)} x={4000} y={-1260} text="cade · crea la copia · torna indietro" size={56} />
        </g>
      )}
    </g>
  );
};

/** Chi si salva: la copia si dissolve, le morti della copia si annullano. */
const Salvi: React.FC<{ T: number; ns: number }> = ({ T, ns }) => {
  if (!inCap(T, 'salvi')) return null;
  const t1 = ev('salvi', 1, 0.3), t2 = ev('salvi', 2, 0.2);
  return (
    <g>
      {[['bicicletta', 'Gretchen', X.cinema - 380], ['orecchie', 'Frank', X.nonna - 300]].map(([ic, name, x], i) => (
        <Nodo key={ic} T={T} t0={S('salvi') + 0.4} x={x as number} y={120} icon={ic as string} name={name as string} sub={T >= t2 + i * 0.4 ? 'vivo' + (i ? '' : 'a') : undefined} s={ns} dead={1 - seg(T, t2 + i * 0.4, t2 + i * 0.4 + 0.6)} />
      ))}
      <Mano T={T} t0={t1} x={4300} y={-900} text="le morti della copia si annullano" size={52} color={COPY} until={E('salvi')} />
      <Nodo T={T} t0={ev('salvi', 3)} x={X.casa + 1100} y={130} icon="pantofole" name="Donnie" s={ns} dead={1} />
      <Tag T={T} t0={ev('salvi', 2, 1.4)} x={4300} y={-420} text="IL MONDO VERO È SALVO" bg={TIME} />
    </g>
  );
};

/** Il gesto dell'ultima scena: la bicicletta davanti alla casa, i due saluti, il filo azzurro della copia. */
const Gesto: React.FC<{ T: number }> = ({ T }) => {
  if (!inCap(T, 'gesto')) return null;
  const pb = eio(seg(T, ev('gesto', 1), ev('gesto', 2, 0.6)));
  const bx = lerp(X.casa + 1500, X.casa + 880, pb);
  const t3 = ev('gesto', 3);
  return (
    <g>
      <g transform={`translate(${bx} ${GROUND - 40}) scale(1.8)`}><Icona k="bicicletta" T={T * (1 - seg(T, ev('gesto', 2, 0.4), ev('gesto', 2, 0.8)))} /></g>
      <Nodo T={T} t0={ev('gesto', 1, 0.2)} x={X.casa + 920} y={330} icon="bicicletta" name="Gretchen" s={zk(T) * 1.1} />
      <Nodo T={T} t0={ev('gesto', 2, 0.2)} x={X.casa + 360} y={330} icon="valigia" name="la mamma di Donnie" s={zk(T) * 1.1} />
      <Mano T={T} t0={ev('gesto', 2, 0.6)} x={X.casa + 640} y={560} text="non si sono mai conosciute" size={50} until={t3} />
      {T >= t3 && (
        <g>
          <g transform={`translate(${X.casa + 530} ${330}) scale(${pop(T, t3) * zk(T) * 0.9})`}><Saluto x={0} y={0} T={T} /></g>
          <g transform={`translate(${X.casa + 750} ${330}) scale(${pop(T, t3 + 0.4) * zk(T) * 0.9})`}><Saluto x={0} y={0} T={T} flip /></g>
          <Linea T={T} t0={t3 + 0.6} id="dd16-filo" d={`M${X.casa + 530} ${250} Q${X.casa + 640} ${170} ${X.casa + 750} ${250}`} color={COPY} w={8} dashed dur={1} />
        </g>
      )}
      <Cartello T={T} t0={ev('gesto', 4, 0.2)} x={X.casa + 640} y={610} head="TEORIA" text="UN RICORDO DELLA COPIA?" color={COPY} />
    </g>
  );
};

/** Due letture: il libro (la copia) o la mente di Donnie. */
const Aperto: React.FC<{ T: number; ns: number }> = ({ T, ns }) => {
  if (!inCap(T, 'aperto')) return null;
  return (
    <g>
      <Cartello T={T} t0={ev('aperto', 0, 0.6)} x={3300} y={-1400} head="TEORIA 1" text="IL LIBRO: LA COPIA ESISTE" color={COPY} />
      <Cartello T={T} t0={ev('aperto', 1, 0.4)} x={5100} y={-700} head="TEORIA 2" text="È TUTTO NELLA SUA MENTE" color="#E86A9A" />
      {T >= ev('aperto', 1, 0.4) && [0, 1, 2].map((i) => (
        <circle key={i} cx={6900 - 300 + i * 300} cy={-500 - i * 80} r={(70 + i * 40) * pop(T, ev('aperto', 1, 0.8 + i * 0.3))} fill="rgba(232,106,154,0.18)" stroke="#E86A9A" strokeWidth={10} strokeDasharray="26 18" />
      ))}
      {T >= ev('aperto', 2) && (
        <g transform={`translate(6400 -1350) scale(${pop(T, ev('aperto', 2)) * ns * 0.5})`}>
          <Glow id="dd16-q" x={0} y={-40} r={260} t={T} color={TIME} amp={0.08} rate={2} opacity={0.5} />
          <text y={70} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={300} fill={TIME} stroke={DARK} strokeWidth={20} paintOrder="stroke">?</text>
        </g>
      )}
      <Mano T={T} t0={ev('aperto', 3, 0.2)} x={4200} y={-150} text="finale aperto, apposta" size={52} />
    </g>
  );
};

/** Perché proprio 28: il contatore grande e i tre cartelli. */
const Ventotto: React.FC<{ T: number }> = ({ T }) => {
  if (!inCap(T, 'ventotto')) return null;
  const items: [number, string, string][] = [[ev('ventotto', 1, 0.3), 'LA SCENEGGIATURA', '28 GIORNI'], [ev('ventotto', 2, 0.3), 'LE RIPRESE', '28 GIORNI'], [ev('ventotto', 3, 0.1), 'IL CINEMA DI MEZZANOTTE', '28 MESI']];
  return (
    <g>
      <Grande28 T={T} t0={S('ventotto') + 0.5} y={-560} s={0.95} />
      {items.map(([t0, a, b], i) => T >= t0 ? (
        <g key={a} transform={`translate(${4400 + (i - 1) * 800} ${-140}) scale(${pop(T, t0)})`}>
          <rect x={-330} y={-150} width={660} height={300} rx={26} fill={DARK} stroke={TIME} strokeWidth={6} />
          <g transform="translate(0 -70) scale(1.4)">{i === 0 ? <Icona k="libro" /> : i === 1 ? <Cinepresa /> : <Insegna T={T} />}</g>
          <text y={34} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={i === 2 ? 40 : 50} fill={INK}>{a}</text>
          <text y={118} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={90} fill={RED}>{b}</text>
        </g>
      ) : null)}
    </g>
  );
};
const Cinepresa: React.FC = () => (
  <g strokeLinejoin="round">
    <rect x={-34} y={-12} width={52} height={36} rx={4} fill="#3A3E58" stroke={INK} strokeWidth={3.5} />
    <circle cx={-20} cy={-28} r={16} fill="#3A3E58" stroke={INK} strokeWidth={3.5} /><circle cx={10} cy={-28} r={16} fill="#3A3E58" stroke={INK} strokeWidth={3.5} />
    <path d="M18 0 L38 -10 V22 L18 12 Z" fill="#5A5E78" stroke={INK} strokeWidth={3.5} />
  </g>
);
const Insegna: React.FC<{ T: number }> = ({ T }) => (
  <g>
    <rect x={-36} y={-30} width={72} height={60} rx={6} fill="#2A1630" stroke={INK} strokeWidth={3.5} />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={-28 + i * 8} cy={-22} r={3} fill="#FFE08A" opacity={mod(i - Math.floor(T * 4), 2) ? 1 : 0.3} />)}
    <text y={14} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={18} fill="#FF5FA0">00:00</text>
  </g>
);

/** Il seguito: il libro di Nonna Morte si chiude, accanto un libro nuovo coperto da un telo. */
const Seguito: React.FC<{ T: number }> = ({ T }) => {
  if (!inCap(T, 'seguito')) return null;
  const out = seg(T, E('seguito') - 0.8, E('seguito'));
  const t1 = ev('seguito', 1, 0.3);
  const lift = seg(T, ev('seguito', 2, 0.6), ev('seguito', 2, 1.6));
  return (
    <g opacity={1 - out}>
      <g transform={`translate(${4000} ${-220}) scale(${3 * pop(T, S('seguito') + 0.3)})`}><Icona k="libro" /></g>
      {T >= t1 && (
        <g transform={`translate(${4700} ${-240}) scale(${pop(T, t1)})`}>
          <Glow id="dd16-new" x={0} y={0} r={400} t={T} color={TIME} amp={0.05} rate={2} opacity={0.4} />
          <rect x={-170} y={-230} width={340} height={460} rx={14} fill="#1A1C30" stroke={INK} strokeWidth={8} />
          <rect x={-140} y={-200} width={20} height={400} fill="#2A2E48" />
          {lift > 0 && <text y={16} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={58} fill={TIME} opacity={lift}>IL SEGUITO</text>}
          {/* il telo che copre il libro nuovo: si solleva e sparisce */}
          {lift < 1 && <g transform={`translate(0 ${-lift * 420})`} opacity={1 - lift}><rect x={-185} y={-245} width={370} height={490} rx={24} fill="#4A3A5A" stroke={DARK} strokeWidth={6} /><path d="M-185 -160 Q0 -110 185 -160 M-185 60 Q0 110 185 60" stroke="#6A5A7A" strokeWidth={8} fill="none" /></g>}
        </g>
      )}
      <Tag T={T} t0={ev('seguito', 3, 0.2)} x={4990} y={-60} text="FINE 2026?" bg={RED} fg={INK} />
      <Mano T={T} t0={ev('seguito', 3, 1.2)} x={4000} y={-420} text="e nuovi film…" size={52} />
    </g>
  );
};

export { inCap, E, S };
