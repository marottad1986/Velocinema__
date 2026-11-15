import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow, Stars, flashAt } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/ritorno-al-futuro.json';

// Ritorno al futuro come schema (formato "spiegato"): le linee del tempo nello stile delle due epoche del film, su una
// notte anni '80 viola: le stazioni del 1955 sono cartoline stampate (carta crema, inchiostro seppia), quelle del 1985
// notti al neon (linee ciano, luci magenta), il 2015 un abbozzo grigio. Il tempo scende dall'alto in basso: in alto tre stazioni del 1955 (la strada con la casa di
// Lorraine, il ballo della scuola, la piazza con la torre dell'orologio), poi il salto di trent'anni, poi due stazioni del
// 1985 (il parcheggio del centro commerciale, casa McFly) e in fondo il 2015, solo tratteggiato finché Doc non ne arriva.
// Vocabolario fisso: cerchio con oggetto = personaggio (mai figure), linea = legame con scritta a mano, tratteggio giallo
// = viaggio nel tempo, cartellino pieno = colpo di scena, anello rosso = il nodo da capire (Lorraine che ama Marty).
// Oggetti: skateboard (Marty), occhialoni (Doc), furgone (i terroristi), quaderno (George), giubbotto (Biff),
// fiocco (Lorraine), biglietto col cuore (Jennifer). La foto di famiglia ha tre cerchi (fratello, sorella, Marty) che
// sbiadiscono e tornano. L'auto del tempo è un'auto generica nel nostro stile, non quella del film.
// Coordinate = mondo; la camera porta il punto (x, y) al centro dello schermo (540, 900) con zoom z.
// Gli eventi cadono sulla griglia della musica (72 bpm, crome), gli stessi istanti di scripts/audio/ritorno-al-futuro.mjs.
// Lo schema (`Schema`) si riusa nel video lungo della trilogia con una camera 16:9 propria.

export const INK = '#F4EEE2';
export const YEL = '#F5C23A';
export const RED = '#E8553F';
const DIM = '#A898D8';
const DARK = '#0E0A22';
const FILL = '#1E1646';
const FILL2 = '#2A1F5E';
const WARM = '#FFD98A';
const ATOM = '#9BE06A';
const PINK = '#F29AC0';
const H = 760; // il disegno occupa i primi 540 px della stazione, sotto c'è la fila dei personaggi
const ROW = 615;
type P = readonly [number, number];
const BANDS = [
  { key: 'strada', y0: 420, year: '1955', name: 'LA STRADA' },
  { key: 'ballo', y0: 1240, year: '1955', name: 'IL BALLO DELLA SCUOLA' },
  { key: 'piazza', y0: 2060, year: '1955', name: "LA PIAZZA DELL'OROLOGIO" },
  { key: 'parcheggio', y0: 2980, year: '1985', name: 'IL PARCHEGGIO' },
  { key: 'casa', y0: 3800, year: '1985', name: 'CASA McFLY' },
  { key: 'futuro', y0: 4620, year: '2015', name: 'IL FUTURO' },
] as const;
type BandKey = (typeof BANDS)[number]['key'];
export const BAND = Object.fromEntries(BANDS.map((b) => [b.key, b])) as Record<BandKey, (typeof BANDS)[number]>;
const cy = (k: BandKey) => BAND[k].y0 + 400;
const Y = (k: BandKey, y: number) => BAND[k].y0 + y;
export const N = {
  marty85: [210, Y('parcheggio', ROW)], doc85: [540, Y('parcheggio', ROW)], terr: [870, Y('parcheggio', ROW)],
  marty55: [540, Y('strada', ROW)], george: [830, Y('strada', ROW)], biff: [250, Y('strada', ROW)], lorraine: [250, Y('strada', ROW)],
  doc55: [620, Y('piazza', ROW)], martyP: [210, Y('piazza', ROW)],
  marty2: [200, Y('ballo', ROW)], george2: [410, Y('ballo', ROW)], lorraine2: [630, Y('ballo', ROW)], biff2: [850, Y('ballo', ROW)],
  photo: [810, Y('ballo', 330)],
  george3: [200, Y('casa', ROW)], marty4: [430, Y('casa', ROW)], jen: [660, Y('casa', ROW)], docC: [885, Y('casa', ROW)], biff3: [790, Y('casa', 420)],
  kids: [540, Y('futuro', ROW)],
} as const;
const RAIL = 56, RX = 1036; // la linea degli anni a sinistra; i viaggi nel tempo corrono sul bordo destro

// ---------------------------------------------------------------- tempi dal JSON, sulla griglia della musica

export const STARTS: Record<string, number> = {};
const CUES: Record<string, number[]> = {};
{
  let acc = film.copertina.durata;
  for (const c of film.capitoli) {
    STARTS[c.id] = acc;
    CUES[c.id] = subtitleTimes(c.sottotitoli, c.durata).map(([a]) => a);
    acc += c.durata;
  }
}
const CROMA = 60 / film.bpm / 2;
const G0 = film.copertina.durata;
/** Istante (assoluto) della frase `cue` del capitolo più `d`, arrotondato alla croma della musica. */
export const at = (ch: string, cue: number, d = 0) => G0 + Math.round((STARTS[ch] + CUES[ch][cue] + d - G0) / CROMA) * CROMA;
export const end = (ch: string) => STARTS[ch] + film.capitoli.find((c) => c.id === ch)!.durata;
const pop = (T: number, t0: number) => eob(seg(T, t0, t0 + 0.45), 1.7);

// ---------------------------------------------------------------- camera

type Shot = { at: number; x: number; y: number; z: number };
const band = (k: BandKey, z = 1.04, dx = 0, dy = 0) => ({ x: 540 + dx, y: cy(k) + dy, z });
export const WIDE = { x: 540, y: Y('parcheggio', 0), z: 0.24 };
export const SHOTS: Shot[] = [
  { at: 0, ...band('parcheggio', 1.0) },
  { at: at('marty', 1), ...band('parcheggio', 1.25, -170, 120) },
  { at: at('marty', 2), ...band('parcheggio', 1.25, 0, 120) },
  { at: at('marty', 3), ...band('parcheggio', 1.15, 0, -10) },
  { at: at('macchina', 0), ...band('parcheggio', 1.0, -40, 0) },
  { at: at('macchina', 1), ...band('parcheggio', 1.0, 40, 0) },
  { at: at('macchina', 2), ...band('parcheggio', 1.0, 60, 100) },
  { at: at('macchina', 3), ...band('parcheggio', 1.0, 60, 0) },
  // la camera sale lungo la scia gialla, trent'anni indietro
  { at: at('macchina', 3, 1.1), x: 760, y: Y('piazza', 400), z: 0.5 },
  { at: at('macchina', 3, 1.9), x: 760, y: Y('ballo', 300), z: 0.5 },
  { at: at('passato', 0), ...band('strada', 1.0) },
  { at: at('passato', 1), ...band('strada', 1.2, 60, 130) },
  { at: at('passato', 2), ...band('strada', 1.2, 200, 130) },
  { at: at('passato', 3), ...band('strada', 1.0, 0, 20) },
  { at: at('incidente', 0), ...band('strada', 1.05, 60, 20) },
  { at: at('incidente', 1), ...band('strada', 1.0, 0, 60) },
  { at: at('incidente', 2), ...band('strada', 1.0, 0, 0) },
  { at: at('incidente', 3), ...band('strada', 1.0, 0, 70) },
  // dalla strada alla piazza, dove abita il Doc del 1955, poi la foto
  { at: at('foto', 0), x: 600, y: Y('ballo', 400), z: 0.45 },
  { at: at('foto', 0, 1.3), ...band('piazza', 1.05, 0, 100) },
  { at: at('foto', 1), ...band('piazza', 1.15, 0, 60) },
  { at: at('foto', 2), x: N.photo[0] - 40, y: N.photo[1] + 10, z: 1.45 },
  { at: at('fulmine', 0), ...band('piazza', 1.0) },
  { at: at('fulmine', 1), x: 640, y: Y('piazza', 360), z: 1.0 },
  { at: at('fulmine', 2), x: 600, y: Y('piazza', 360), z: 1.0 },
  { at: at('fulmine', 3), ...band('piazza', 0.98, 40, -40) },
  { at: at('ballo', 0), ...band('ballo', 1.05, -60, 60) },
  { at: at('ballo', 1), ...band('ballo', 1.0, 20, 100) },
  { at: at('ballo', 2), ...band('ballo', 1.05, 80, 100) },
  { at: at('ballo', 3), ...band('ballo', 1.0, 80, 0) },
  { at: at('lettera', 0), ...band('piazza', 1.12, -60, 120) },
  { at: at('lettera', 1), ...band('piazza', 1.2, 150, 100) },
  { at: at('lettera', 2, -0.4), x: 560, y: Y('piazza', 200), z: 0.8 },
  // giù lungo la scia gialla, verso il 1985
  { at: at('lettera', 2, 0.9), x: 700, y: Y('parcheggio', 200), z: 0.6 },
  { at: at('lettera', 3), ...band('parcheggio', 1.05, 120, 60) },
  { at: at('cambiato', 0), x: 480, y: Y('parcheggio', 560), z: 1.15 },
  { at: at('cambiato', 1), ...band('casa', 1.0) },
  { at: at('cambiato', 2), x: 700, y: Y('casa', 700), z: 0.55 },
  { at: at('cambiato', 3), x: 540, y: Y('futuro', 210), z: 0.76 },
  { at: at('cambiato', 3, 1.7), ...WIDE },
];
/** Zoom attuale della camera: le scritte dello schema crescono quando la camera si allontana, così restano leggibili. */
let UI_K = 1;
let WIDEV = false;
export const setUi = (z: number) => {
  UI_K = Math.max(1, 0.85 / z);
  WIDEV = z < 0.3;
};
const fit = (size: number) => Math.max(size, Math.min(size * UI_K, WIDEV ? 90 : 120));
export const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.1));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: Math.exp(lerp(Math.log(o.z), Math.log(s.z), p)) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 5, z: o.z * (1 + 0.012 * Math.sin(T * 0.2)) };
};

// ---------------------------------------------------------------- oggetti dei personaggi (disegnati in ±40)

const S = { strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
/** Marty: uno skateboard visto di lato, con le ruote che girano. */
export const Skate: React.FC<{ T: number; s?: number }> = ({ T, s = 1 }) => (
  <g transform={`scale(${s}) rotate(-14)`} {...S}>
    <path d="M-40 -6 Q-44 -14 -36 -14 H36 Q44 -14 40 -6 Q36 2 28 2 H-28 Q-36 2 -40 -6 Z" fill={RED} stroke={INK} strokeWidth="4" />
    <path d="M-30 -9 H30" stroke="#FFFFFF" strokeWidth="2" opacity=".5" />
    <path d="M-22 2 V8 M22 2 V8" stroke={INK} strokeWidth="4" />
    {[-22, 22].map((x) => (
      <g key={x} transform={`translate(${x} 14) rotate(${T * 220})`}>
        <circle r="8" fill="#F2F2E8" stroke={INK} strokeWidth="3" />
        <path d="M-5 0 H5" stroke={DARK} strokeWidth="2" />
      </g>
    ))}
  </g>
);
/** Doc: occhialoni da laboratorio con la cinghia, le lenti che riflettono. */
export const Goggles: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} {...S}>
    <path d="M-42 -2 Q0 -12 42 -2" fill="none" stroke="#5E7898" strokeWidth="7" />
    {[-17, 17].map((x) => (
      <g key={x}>
        <circle cx={x} cy="2" r="15" fill="#2A5E96" stroke={INK} strokeWidth="4.5" />
        <circle cx={x} cy="2" r="9" fill="#9CD3FF" opacity=".55" />
        <path d={`M${x - 7} -4 Q${x - 2} -9 ${x + 4} -7`} stroke="#FFFFFF" strokeWidth="3" fill="none" />
      </g>
    ))}
    <path d="M-3 1 H3" stroke={INK} strokeWidth="5" />
  </g>
);
/** I terroristi: un furgone chiuso con i vetri scuri. */
export const Van: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} {...S}>
    <path d="M-40 14 V-14 Q-40 -20 -32 -20 H14 L30 -4 H38 Q42 -4 42 2 V14 Z" fill="#7A2E2A" stroke={INK} strokeWidth="4" />
    <path d="M16 -16 L28 -4 H16 Z" fill="#1A1E28" stroke={INK} strokeWidth="2.5" />
    <path d="M-34 -12 H8" stroke="#FFFFFF" strokeWidth="2" opacity=".4" />
    {[-24, 26].map((x) => <circle key={x} cx={x} cy="15" r="8" fill="#1A1E28" stroke={INK} strokeWidth="3.5" />)}
  </g>
);
/** George: un quaderno di racconti (aperto quando scrive). `book` > 0: diventa un libro rilegato. */
export const Notebook: React.FC<{ book?: number; s?: number }> = ({ book = 0, s = 1 }) => (
  <g transform={`scale(${s})`} {...S}>
    <path d="M-34 -24 H-2 V28 H-34 Z" fill={book > 0.5 ? '#C9563C' : '#E9E4D0'} stroke={INK} strokeWidth="4" />
    <path d="M2 -24 H34 V28 H2 Z" fill={book > 0.5 ? '#C9563C' : '#E9E4D0'} stroke={INK} strokeWidth="4" />
    {book <= 0.5 && [-14, -4, 6, 16].map((y) => <path key={y} d={`M-28 ${y} H-8 M8 ${y} H28`} stroke="#5E7898" strokeWidth="2.5" />)}
    {book > 0.5 && <path d="M8 -12 H28 M8 -4 H24" stroke={YEL} strokeWidth="3" />}
    {[-18, -8, 2, 12, 22].map((y) => <circle key={y} cx="0" cy={y} r="2.5" fill={INK} />)}
  </g>
);
/** Biff: un giubbotto di pelle col bavero alzato. */
export const Jacket: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} {...S}>
    <path d="M-12 -30 L-36 -18 L-40 30 H40 L36 -18 L12 -30 L0 -10 Z" fill="#2B2B33" stroke={INK} strokeWidth="4" />
    <path d="M-12 -30 L-6 -4 L0 -10 L6 -4 L12 -30" fill="#45454F" stroke={INK} strokeWidth="3" />
    <path d="M0 -10 V30" stroke={INK} strokeWidth="2.5" />
    <path d="M-30 -10 L-34 24 M30 -10 L34 24" stroke="#FFFFFF" strokeWidth="2" opacity=".35" />
    <path d="M-26 6 H-12 M12 6 H26" stroke="#9AA0AA" strokeWidth="3" />
  </g>
);
/** Lorraine: un fiocco per capelli. */
export const Bow: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} {...S}>
    <path d="M0 0 L-36 -20 Q-44 0 -36 20 Z M0 0 L36 -20 Q44 0 36 20 Z" fill={PINK} stroke={INK} strokeWidth="4" />
    <path d="M-6 4 L-16 34 M6 4 L16 34" stroke={PINK} strokeWidth="7" />
    <path d="M-28 -10 Q-20 0 -28 10 M28 -10 Q20 0 28 10" fill="none" stroke="#FFFFFF" strokeWidth="2.5" opacity=".5" />
    <circle r="9" fill="#E07AA8" stroke={INK} strokeWidth="3.5" />
  </g>
);
/** Jennifer: un biglietto piegato con un cuore. */
export const Note: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s}) rotate(-8)`} {...S}>
    <path d="M-32 -24 H32 V24 H-32 Z" fill="#F4EEDC" stroke={INK} strokeWidth="4" />
    <path d="M0 14 C-22 0 -14 -16 0 -6 C14 -16 22 0 0 14 Z" fill={RED} />
  </g>
);
/** Il plutonio: un contenitore con il simbolo atomico che brilla. */
const Canister: React.FC<{ T: number; full?: number }> = ({ T, full = 1 }) => (
  <g {...S}>
    <rect x="-22" y="-30" width="44" height="60" rx="8" fill="#2A3E2E" stroke={INK} strokeWidth="4" />
    <rect x="-16" y={-24 + 48 * (1 - full)} width="32" height={48 * full} rx="4" fill={ATOM} opacity={0.55 + 0.25 * Math.sin(T * 4)} />
    <circle r="6" fill={DARK} />
    {[0, 120, 240].map((a) => <path key={a} d="M0 -8 L-7 -20 A20 20 0 0 1 7 -20 Z" fill={DARK} transform={`rotate(${a})`} opacity=".85" />)}
    <path d="M-26 -34 H26" stroke={INK} strokeWidth="5" />
  </g>
);

/** L'auto del tempo: una coupé bassa e squadrata (generica), con il motore del tempo che si illumina sul retro. */
export const TimeCar: React.FC<{ T: number; glow?: number; s?: number; flip?: boolean; pole?: boolean; ink?: string }> = ({ T, glow = 0.3, s = 1, flip = false, pole = false, ink = INK }) => (
  <g transform={`scale(${flip ? -s : s} ${s})`} {...S}>
    <Glow id={`rf-car${s}${flip ? 'f' : ''}`} x={-70} y={-30} r={110} t={T} color={YEL} amp={0.15} rate={9} opacity={0.6 * glow} />
    <path d="M-120 10 L-118 -22 L-70 -30 L-30 -58 L40 -58 L78 -30 L120 -22 L124 10 Z" fill="#9EB6CF" stroke={ink} strokeWidth="6" />
    <path d="M-26 -52 L36 -52 L66 -30 H-58 Z" fill="#163A62" stroke={ink} strokeWidth="4" />
    <path d="M20 -52 V-30" stroke={ink} strokeWidth="4" />
    <path d="M-110 -16 H112" stroke="#FFFFFF" strokeWidth="3" opacity=".55" />
    <path d="M-40 -28 V8 M44 -28 V8" stroke="#5E7898" strokeWidth="3" />
    {/* il motore del tempo sul retro: tre bobine che brillano */}
    <rect x="-112" y="-46" width="44" height="20" rx="5" fill="#3A5878" stroke={ink} strokeWidth="4" />
    {[-104, -90, -76].map((x, i) => <circle key={x} cx={x} cy="-36" r="5" fill={YEL} opacity={0.4 + 0.6 * glow * (0.5 + 0.5 * Math.sin(T * 12 + i * 2))} />)}
    {pole && <path d="M-96 -46 L-118 -120" stroke={ink} strokeWidth="4" />}
    {pole && <path d="M-124 -126 Q-118 -134 -110 -126" fill="none" stroke={ink} strokeWidth="4" />}
    <path d="M114 -14 H124" stroke={WARM} strokeWidth="7" />
    <path d="M-124 -8 H-116" stroke={RED} strokeWidth="7" />
    {[-74, 76].map((x) => (
      <g key={x} transform={`translate(${x} 12)`}>
        <circle r="24" fill="#122236" stroke={ink} strokeWidth="6" />
        <g transform={`rotate(${T * 300})`}><path d="M-12 0 H12 M0 -12 V12" stroke="#9EB6CF" strokeWidth="4" /></g>
      </g>
    ))}
  </g>
);
/** L'auto del 1955: tonda, con le pinne e le cromature. */
const Car55: React.FC<{ T: number; s?: number; roll?: number; ink?: string }> = ({ T, s = 1, roll = 0, ink = INK }) => (
  <g transform={`scale(${s})`} {...S}>
    <path d="M-130 8 Q-134 -24 -100 -26 L-60 -30 Q-40 -64 10 -64 Q50 -64 72 -30 L118 -26 Q140 -22 136 8 Z" fill="#B9D7E8" stroke={ink} strokeWidth="6" />
    <path d="M-48 -32 Q-30 -56 6 -56 Q40 -56 58 -32 Z" fill="#163A62" stroke={ink} strokeWidth="4" />
    <path d="M4 -56 V-32" stroke={ink} strokeWidth="4" />
    <path d="M-124 -6 H130" stroke="#FFFFFF" strokeWidth="4" opacity=".7" />
    <path d="M110 -28 L132 -46 L128 -24" fill="#B9D7E8" stroke={ink} strokeWidth="4" />
    <circle cx="-126" cy="-10" r="7" fill={WARM} />
    <path d="M-140 4 H-118 M118 4 H142" stroke="#DDE6EE" strokeWidth="7" />
    {[-78, 80].map((x) => (
      <g key={x} transform={`translate(${x} 12)`}>
        <circle r="23" fill="#122236" stroke={ink} strokeWidth="6" />
        <circle r="10" fill="#DDE6EE" />
        <g transform={`rotate(${roll * 600 + T * 0})`}><path d="M-10 0 H10" stroke="#122236" strokeWidth="3" /></g>
      </g>
    ))}
  </g>
);

// ---------------------------------------------------------------- elementi dello schema

const Node: React.FC<{ T: number; t0: number; p: P; name: string; sub?: string; subFill?: string; ring?: number; r?: number; fade?: number; color?: string; side?: 'below' | 'above'; children?: React.ReactNode; size?: number; dead?: number; hit?: number }> = ({
  T, t0, p, name, sub, subFill = '#B5CBE2', ring = 0, r = 58, fade = 1, color = INK, side = 'below', children, size: size0 = 36, dead = 0, hit = 0,
}) => {
  if (T < t0 || fade <= 0) return null;
  const size = fit(size0);
  const s = pop(T, t0);
  const ly = side === 'below' ? r + size + 6 : -r - (sub ? size * 0.95 + 18 : 18);
  const hi = color === INK ? YEL : color;
  const card = p[1] < BAND.parcheggio.y0 - 100; // stazioni del 1955: carta crema
  const tFill = card ? P55.ink : INK, tStroke = card ? P55.paper : DARK;
  const shake = hit > 0 && hit < 1 ? Math.sin(T * 70) * 8 * (1 - hit) : 0;
  return (
    <g transform={`translate(${p[0] + shake} ${p[1]})`} opacity={seg(T, t0, t0 + 0.15) * fade}>
      <g transform={`scale(${s})`}>
        {ring > 0 && <Glow id={`rf-g${p[0]}${p[1]}`} x={0} y={0} r={r * 2.3} t={T} color={hi} amp={0.1} rate={2.4} opacity={0.5 * Math.min(1, ring)} />}
        <circle r={r + 4} fill="#000" opacity=".3" transform="translate(4 6)" />
        <circle r={r} fill={FILL} stroke={ring > 0.5 ? hi : color} strokeWidth={ring > 0.5 ? 7 : 4.5} />
        <circle r={r - 8} fill="none" stroke={DIM} strokeWidth="1.5" opacity=".6" />
        <g transform={`scale(${r / 46})`} opacity={1 - 0.6 * dead}>{children}</g>
        {dead > 0 && <path d={`M${-r * 0.55} ${-r * 0.55} L${r * 0.55} ${r * 0.55} M${r * 0.55} ${-r * 0.55} L${-r * 0.55} ${r * 0.55}`} stroke={RED} strokeWidth="8" strokeLinecap="round" opacity={dead} />}
      </g>
      {name && <text y={ly} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={tFill} stroke={tStroke} strokeWidth="6" paintOrder="stroke" opacity={seg(T, t0 + 0.2, t0 + 0.5)}>{name}</text>}
      {sub && !WIDEV && <text y={ly + size * 0.85} textAnchor="middle" fontFamily={SANS} fontWeight={subFill === '#B5CBE2' ? 400 : 800} fontSize={size * 0.72} fill={card ? (subFill === '#B5CBE2' ? P55.dark : '#9A6A00') : subFill} stroke={tStroke} strokeWidth="5" paintOrder="stroke" opacity={seg(T, t0 + 0.3, t0 + 0.6)}>{sub}</text>}
    </g>
  );
};

/** Linea dello schema che si disegna (maschera). `flow` fa scorrere il tratteggio. `cross` > 0 la barra con una X. */
const Link: React.FC<{ T: number; t0: number; a: P; b: P; c?: P; color?: string; dashed?: boolean; label?: string; arrow?: boolean; w?: number; lx?: number; ly?: number; size?: number; fade?: number; flow?: boolean; cross?: number }> = ({
  T, t0, a, b, c, color = INK, dashed = false, label, arrow = false, w = 6, lx = 0, ly = 0, size: size0 = 42, fade = 1, flow = false, cross = 0,
}) => {
  const size = fit(size0);
  if (T < t0 || fade <= 0) return null;
  const p = eo(seg(T, t0, t0 + 0.6));
  const [mx, my] = c ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  const ang = (Math.atan2(b[1] - my, b[0] - mx) * 180) / Math.PI;
  const id = `rf-m${a[0]}${a[1]}${b[0]}${b[1]}`.replace(/\./g, '');
  const tx = 0.25 * a[0] + 0.5 * mx + 0.25 * b[0], ty = 0.25 * a[1] + 0.5 * my + 0.25 * b[1];
  return (
    <g opacity={fade}>
      <mask id={id} maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="9000"><path d={d} fill="none" stroke="#fff" strokeWidth={w + 10} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
      <path d={d} fill="none" stroke={DARK} strokeWidth={w + 6} opacity=".55" strokeLinecap="round" mask={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dashed ? `${w * 3} ${w * 2.2}` : undefined} strokeDashoffset={flow ? -T * 60 : 0} strokeLinecap="round" mask={`url(#${id})`} />
      {arrow && p > 0.95 && <path d={`M${-w * 3.4} ${-w * 2.3} L0 0 L${-w * 3.4} ${w * 2.3}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`} />}
      {cross > 0 && <path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke={RED} strokeWidth="11" strokeLinecap="round" transform={`translate(${tx} ${ty}) scale(${eob(cross, 1.6)})`} />}
      {label && !WIDEV && (
        <text x={tx + lx} y={ty + ly} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={size} fill={ty < BAND.parcheggio.y0 - 100 && (color === INK || color === DIM) ? P55.ink : color} stroke={ty < BAND.parcheggio.y0 - 100 ? P55.paper : DARK} strokeWidth="7" paintOrder="stroke" opacity={seg(T, t0 + 0.4, t0 + 0.8)}>{label}</text>
      )}
    </g>
  );
};

/** Viaggio nel tempo: un tratteggio giallo spesso che si disegna lungo un percorso, con la scia che scorre. */
const Travel: React.FC<{ T: number; t0: number; d: string; dur?: number; id: string; label?: string; lx?: number; ly?: number; fade?: number; labelUntil?: number }> = ({ T, t0, d, dur = 1.4, id, label, lx = 0, ly = 0, fade = 1, labelUntil = 1e9 }) => {
  if (T < t0 || fade <= 0) return null;
  const p = eio(seg(T, t0, t0 + dur));
  return (
    <g opacity={fade}>
      <mask id={id} maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="9000"><path d={d} fill="none" stroke="#fff" strokeWidth="60" pathLength={1} strokeDasharray={`${p} 1`} /></mask>
      <g mask={`url(#${id})`}>
        <path d={d} fill="none" stroke={YEL} strokeWidth="34" opacity=".16" strokeLinecap="round" />
        <path d={d} fill="none" stroke={DARK} strokeWidth="20" opacity=".55" strokeLinecap="round" />
        <path d={d} fill="none" stroke={YEL} strokeWidth="14" strokeDasharray="40 26" strokeDashoffset={-T * 120} strokeLinecap="round" />
      </g>
      {label && !WIDEV && <text x={lx} y={ly} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={fit(54)} fill={YEL} stroke={DARK} strokeWidth="8" paintOrder="stroke" opacity={seg(T, t0 + 0.6, t0 + 1.0) * (1 - seg(T, labelUntil, labelUntil + 0.4))}>{label}</text>}
    </g>
  );
};

/** Cartellino pieno = colpo di scena o parola chiave. */
const Tag: React.FC<{ T: number; t0: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number; until?: number }> = ({
  T, t0, x, y, text, bg = YEL, fg = DARK, size: size0 = 36, rot = 0, until = 1e9,
}) => {
  const size = fit(size0);
  if (T < t0 || T > until + 0.5) return null;
  const w = text.length * size * (text === text.toUpperCase() ? 0.7 : 0.56) + size * 1.2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(T, t0)})`} opacity={1 - seg(T, until, until + 0.5)}>
      <rect x={-w / 2 + size * 0.12} y={-size * 0.95 + size * 0.12} width={w} height={size * 1.6} rx={size * 0.3} fill="#000" opacity=".35" />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.3} fill={bg} />
      <text y={size * 0.33} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};

// ---------------------------------------------------------------- disegni delle stazioni (linee chiare su carta da progetto)

/** Le due epoche hanno due «carte»: il 1955 è una cartolina stampata (carta crema, inchiostro seppia, pastelli anni '50),
 *  il 1985 è una notte al neon (fondo viola scuro, linee ciano, luci magenta); il 2015 è solo un abbozzo grigio. */
type Pal = { ink: string; fill: string; fill2: string; dim: string; warm: string; dark: string; tree: string; win1: string; win2: string; rug: string; cloud: string; paper: string };
export const P55: Pal = { ink: '#3B2A1F', fill: '#EAD9B5', fill2: '#E0C796', dim: '#A68B66', warm: '#F2B544', dark: '#6B5240', tree: '#8CC2A6', win1: '#9CC8D8', win2: '#BCD9E0', rug: '#D2B07E', cloud: '#7D6B5A', paper: '#F3E6C8' };
export const P85: Pal = { ink: '#5CF0FF', fill: '#22184C', fill2: '#2E2062', dim: '#8C6BE0', warm: '#FF4FB0', dark: '#120C2A', tree: '#1E6A72', win1: '#3A2A7A', win2: '#4A3590', rug: '#3A2668', cloud: '#2B2050', paper: '#160E33' };
export const P15: Pal = { ink: '#B9C2D0', fill: '#262E40', fill2: '#2E3850', dim: '#6E7890', warm: '#E8EEF8', dark: '#161B26', tree: '#3A4A5A', win1: '#3A4660', win2: '#46546E', rug: '#2E3850', cloud: '#3A4458', paper: '#141A26' };
const PAL: Record<BandKey, Pal> = { strada: P55, ballo: P55, piazza: P55, parcheggio: P85, casa: P85, futuro: P15 };
const L = { fill: 'none', stroke: INK, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
const Lc = (c: Pal) => ({ fill: 'none', stroke: c.ink, strokeLinejoin: 'round', strokeLinecap: 'round' }) as const;
const rr = rng(1985);
const BUBBLES = Array.from({ length: 26 }, () => ({ x: 130 + rr() * 840, v: 18 + rr() * 26, s: 4 + rr() * 8, ph: rr() }));
const PICKETS = Array.from({ length: 12 }, (_, i) => 128 + i * 34);
const LEAVES = Array.from({ length: 9 }, (_, i) => ({ x: 720 + (i % 3) * 70 + rr() * 30, y: 70 + Math.floor(i / 3) * 62 + rr() * 20, r: 46 + rr() * 22 }));
const BOOKS = Array.from({ length: 11 }, (_, i) => ({ w: 16 + ((i * 7) % 10), h: 58 + ((i * 13) % 26) }));
const SKY = Array.from({ length: 7 }, (_, i) => ({ x: 150 + i * 120 + ((i * 37) % 30), w: 80 + ((i * 53) % 40), h: 180 + ((i * 71) % 220) }));

/** Lampione con l'alone che pulsa. */
const Lamp: React.FC<{ c: Pal; T: number; x: number; y: number; h: number; id: string; lit?: number }> = ({ c, T, x, y, h, id, lit = 1 }) => (
  <g>
    <Glow id={id} x={x} y={y - h} r={120} t={T} color={c.warm} amp={0.06} rate={1.7} opacity={0.45 * lit} />
    <path d={`M${x} ${y} V${y - h + 8}`} {...Lc(c)} strokeWidth="6" />
    <path d={`M${x - 22} ${y - h + 10} H${x + 22} L${x + 12} ${y - h - 16} H${x - 12} Z`} {...Lc(c)} fill={c.warm} fillOpacity={0.35 + 0.4 * lit} strokeWidth="4" />
    <path d={`M${x - 14} ${y} H${x + 14}`} {...Lc(c)} strokeWidth="6" />
  </g>
);

/** Cornice della stazione con il nome e l'anno; `on` = disegnata (prima: solo tratteggiata e tenue). */
const Frame: React.FC<{ k: BandKey; on: number; focus: number }> = ({ k, on, focus }) => {
  const b = BAND[k];
  const c = PAL[k];
  return (
    <g>
      <rect x="100" y={b.y0} width="880" height={H} rx="10" fill={c.paper} fillOpacity={0.15 + 0.85 * on} stroke={c.ink} strokeWidth={on > 0 ? 3 : 2.5} strokeDasharray={on > 0 ? undefined : '18 14'} opacity={0.35 + 0.55 * Math.max(on, 0.0)} />
      {[[100, b.y0], [980, b.y0], [100, b.y0 + H], [980, b.y0 + H]].map(([x, y], i) => (
        <path key={i} d={`M${x + (x < 500 ? 26 : -26)} ${y} H${x} V${y + (y === b.y0 ? 26 : -26)}`} {...Lc(c)} strokeWidth="6" opacity={0.4 + 0.6 * on} />
      ))}
      <text x={k === 'piazza' ? 956 : 124} y={b.y0 + 40} textAnchor={k === 'piazza' ? 'end' : 'start'} fontFamily={SANS} fontWeight={900} fontSize={fit(26)} letterSpacing="3" fill={focus > 0.5 ? YEL : '#F4EEE2'} stroke={DARK} strokeWidth="6" paintOrder="stroke" opacity={0.45 + 0.55 * on}>
        {b.year} · {b.name}
      </text>
    </g>
  );
};

/** 1955, la strada: la casa di Lorraine col portico, lo steccato, l'albero, il lampione e la strada. */
const ArtStrada: React.FC<{ c: Pal; T: number; carX: number; carRoll: number }> = ({ c, T, carX, carRoll }) => (
  <g>
    <Stars t={T} seed={55} n={22} x={120} y={60} w={840} h={150} color={c.ink} size={0.9} />
    <Glow id="rf-moon" x={640} y={110} r={90} t={T} color="#CFE6FF" amp={0.04} rate={1} opacity={0.35} />
    <circle cx="640" cy="110" r="30" fill="#DDEBFA" stroke={c.ink} strokeWidth="3" />
    {/* la casa */}
    <path d="M150 470 V260 L310 150 L470 260 V470 Z" {...Lc(c)} fill={c.fill2} strokeWidth="7" />
    <path d="M136 268 L310 140 L484 268" {...Lc(c)} strokeWidth="8" />
    <path d="M300 262 L310 254 L320 262" {...Lc(c)} strokeWidth="3" />
    {[[190, 300], [360, 300]].map(([x, y]) => (
      <g key={x}>
        <rect x={x} y={y} width="70" height="60" {...Lc(c)} fill={c.warm} fillOpacity={0.55 + 0.1 * Math.sin(T * 1.3 + x)} strokeWidth="4" />
        <path d={`M${x + 35} ${y} V${y + 60} M${x} ${y + 30} H${x + 70}`} {...Lc(c)} strokeWidth="3" />
      </g>
    ))}
    <rect x="276" y="380" width="64" height="90" {...Lc(c)} fill={c.dark} strokeWidth="5" />
    <circle cx="328" cy="428" r="4" fill={c.ink} />
    {/* il portico con le colonne */}
    <path d="M160 380 H460 M176 380 V470 M444 380 V470" {...Lc(c)} strokeWidth="5" />
    <path d="M150 470 H470" {...Lc(c)} strokeWidth="6" />
    {/* lo steccato */}
    {PICKETS.map((x) => <path key={x} d={`M${x} 498 V462 L${x + 8} 452 L${x + 16} 462 V498`} {...Lc(c)} fill={c.fill} strokeWidth="3" />)}
    <path d="M118 476 H540" {...Lc(c)} strokeWidth="3" />
    {/* l'albero di George */}
    <path d="M770 500 V230 M770 300 L700 240 M770 270 L840 220" {...Lc(c)} strokeWidth="12" />
    {LEAVES.map((l, i) => <circle key={i} cx={l.x + Math.sin(T * 0.8 + i) * 3} cy={l.y} r={l.r} fill={c.tree} fillOpacity=".75" stroke={c.ink} strokeWidth="3" />)}
    <Lamp c={c} T={T} x={600} y={500} h={240} id="rf-ls" />
    {/* la strada */}
    <path d="M100 500 H980" {...Lc(c)} strokeWidth="6" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${130 + i * 100} 524 h50`} stroke={c.dim} strokeWidth="4" />)}
    {/* l'auto del padre di Lorraine */}
    <g transform={`translate(${carX} 472)`}><Car55 ink={c.ink} T={T} s={0.9} roll={carRoll} /></g>
  </g>
);

/** 1955, il ballo: palestra decorata a fondo marino, palco con batteria e contrabbasso, sfera a specchi, bolle. */
const ArtBallo: React.FC<{ c: Pal; T: number; lights: number }> = ({ c, T, lights }) => (
  <g>
    {/* festoni ondulati */}
    {[70, 104].map((y, k) => (
      <path key={y} d={Array.from({ length: 12 }, (_, i) => `${i ? 'Q' : 'M'}${i ? `${110 + i * 80 - 40} ${y + 26 + k * 6} ` : ''}${110 + i * 80} ${y}`).join(' ')} {...Lc(c)} stroke={k ? '#7FC7E8' : PINK} strokeWidth="5" />
    ))}
    {/* la sfera a specchi */}
    <path d="M540 56 V82" {...Lc(c)} strokeWidth="3" />
    <Glow id="rf-ball" x={540} y={110} r={130} t={T} color="#CFE6FF" amp={0.12} rate={3} opacity={0.35 + 0.25 * lights} />
    <circle cx="540" cy="110" r="28" fill="#9CB8D4" stroke={c.ink} strokeWidth="4" />
    {[-14, 0, 14].map((d) => <path key={d} d={`M${526} ${110 + d} H554 M${540 + d} 84 V136`} stroke={DARK} strokeWidth="1.5" opacity=".5" />)}
    {Array.from({ length: 6 }, (_, i) => {
      const a = T * 0.8 + i;
      return <circle key={i} cx={540 + Math.cos(a) * (160 + i * 40)} cy={260 + Math.sin(a * 1.3) * 110} r="5" fill="#FFFFFF" opacity={0.3 + 0.3 * Math.sin(T * 5 + i)} />;
    })}
    {/* lo striscione del ballo */}
    <rect x="460" y="140" width="390" height="60" rx="8" {...Lc(c)} fill="#1F6A86" strokeWidth="4" />
    <text x="655" y="181" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="27" letterSpacing="2" fill={c.ink}>INCANTO SOTTO IL MARE</text>
    {/* pesci di cartone appesi */}
    {[[620, 250], [700, 238], [930, 252]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(T * 1.2 + i) * 8})`}>
        <path d={`M0 -${y - 216} V-12`} {...Lc(c)} strokeWidth="2" />
        <path d="M-26 0 Q0 -20 22 0 Q0 20 -26 0 Z M22 0 L36 -12 V12 Z" {...Lc(c)} fill="#F0A24A" strokeWidth="3" />
      </g>
    ))}
    {/* il palco con le tende */}
    <path d="M110 160 Q150 260 120 470 M440 160 Q400 260 430 470" stroke="#B0414C" strokeWidth="18" fill="none" opacity=".85" />
    <path d="M110 380 H450 V470 H110" {...Lc(c)} fill={c.fill2} strokeWidth="6" />
    {/* batteria e contrabbasso */}
    <circle cx="200" cy="340" r="40" {...Lc(c)} fill="#E9E4D0" fillOpacity=".25" strokeWidth="5" />
    <path d="M180 300 H220 M150 300 L130 280 M250 290 L280 270" {...Lc(c)} strokeWidth="4" />
    <ellipse cx="240" cy="300" rx="22" ry="6" {...Lc(c)} fill={c.fill} strokeWidth="3" />
    <path d="M340 380 Q312 330 330 300 Q312 270 340 240 Q366 270 352 300 Q370 330 346 380 Z" {...Lc(c)} fill="#9A5B32" strokeWidth="4" />
    <path d="M343 240 V190" {...Lc(c)} strokeWidth="4" />
    <path d="M410 380 V250 M398 250 H422" {...Lc(c)} strokeWidth="4" />
    <circle cx="410" cy="242" r="9" {...Lc(c)} fill={c.dim} strokeWidth="3" />
    {/* la pista a scacchi in prospettiva */}
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${540 + (i - 4) * 70} 470 L${540 + (i - 4) * 130} 540`} stroke={c.dim} strokeWidth="2.5" />)}
    <path d="M100 470 H980 M100 502 H980" stroke={c.dim} strokeWidth="2.5" />
    {/* le bolle che salgono */}
    {BUBBLES.map((b, i) => {
      const y = 520 - mod(T * b.v + b.ph * 500, 420);
      return <circle key={i} cx={b.x + Math.sin(T * 1.5 + i) * 10} cy={y} r={b.s} fill="none" stroke="#BFE6FF" strokeWidth="2" opacity={0.25 + 0.3 * seg(y, 100, 300)} />;
    })}
  </g>
);

/** 1955, la piazza: il tribunale con la torre dell'orologio, due lampioni, la strada; `hand` = minuti segnati. */
const ArtPiazza: React.FC<{ c: Pal; T: number; storm: number; minutes: number }> = ({ c, T, storm, minutes }) => (
  <g>
    <Stars t={T} seed={56} n={16} x={560} y={60} w={400} h={120} color={c.ink} size={0.8} />
    {/* nuvole di temporale */}
    {[[620, 90], [800, 70], [930, 110]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x + Math.sin(T * 0.5 + i) * 24 + storm * 20 * Math.sin(T * 0.9 + i)} ${y}) scale(${1 + 0.4 * storm})`} opacity={0.35 + 0.5 * storm}>
        <path d="M-80 20 Q-90 -10 -50 -12 Q-40 -40 0 -34 Q30 -50 56 -20 Q90 -20 84 20 Z" fill={storm > 0.5 ? c.dark : c.cloud} stroke={c.ink} strokeWidth="3" />
      </g>
    ))}
    {/* il tribunale */}
    <path d="M150 470 V300 H630 V470 Z" {...Lc(c)} fill={c.fill2} strokeWidth="7" />
    <path d="M136 300 L390 236 L644 300 Z" {...Lc(c)} fill={c.fill} strokeWidth="7" />
    {[190, 260, 330, 450, 520, 590].map((x) => <path key={x} d={`M${x} 316 V456`} {...Lc(c)} strokeWidth="7" />)}
    {[190, 260, 330, 450, 520, 590].map((x) => <path key={`h${x}`} d={`M${x - 12} 316 H${x + 12} M${x - 12} 456 H${x + 12}`} {...Lc(c)} strokeWidth="4" />)}
    <rect x="362" y="370" width="56" height="100" rx="26" {...Lc(c)} fill={c.dark} strokeWidth="5" />
    {[480, 494, 508].map((y, i) => <path key={y} d={`M${120 - i * 14} ${y - 10} H${660 + i * 14}`} {...Lc(c)} strokeWidth="4" />)}
    {/* la torre dell'orologio */}
    <path d="M330 250 V70 H450 V250" {...Lc(c)} fill={c.fill2} strokeWidth="7" />
    <path d="M318 70 L390 10 L462 70 Z" {...Lc(c)} fill={c.fill} strokeWidth="6" />
    <path d="M390 10 V-20" {...Lc(c)} strokeWidth="4" />
    <Glow id="rf-clk" x={390} y={150} r={90} t={T} color={c.warm} amp={0.05} rate={1.5} opacity={0.3} />
    <circle cx="390" cy="150" r="46" fill="#F3EBD2" stroke={c.ink} strokeWidth="6" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -40 V-33" stroke={DARK} strokeWidth="3.5" transform={`translate(390 150) rotate(${i * 30})`} />)}
    <path d="M0 4 V-24" stroke={DARK} strokeWidth="6" strokeLinecap="round" transform={`translate(390 150) rotate(${(minutes / 60) * 30})`} />
    <path d="M0 4 V-36" stroke={DARK} strokeWidth="4" strokeLinecap="round" transform={`translate(390 150) rotate(${minutes * 6})`} />
    <circle cx="390" cy="150" r="5" fill={DARK} />
    {/* alberi ai lati */}
    {[[110, 400], [680, 410]].map(([x, y], i) => (
      <g key={i}>
        <path d={`M${x + 24} 470 V${y}`} {...Lc(c)} strokeWidth="9" />
        <circle cx={x + 24 + Math.sin(T + i) * 2} cy={y - 30} r="46" fill={c.tree} fillOpacity=".75" stroke={c.ink} strokeWidth="3" />
      </g>
    ))}
    <Lamp c={c} T={T} x={760} y={500} h={210} id="rf-lp1" />
    <Lamp c={c} T={T} x={950} y={500} h={210} id="rf-lp2" />
    <path d="M100 500 H980" {...Lc(c)} strokeWidth="6" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${130 + i * 100} 524 h50`} stroke={c.dim} strokeWidth="4" />)}
  </g>
);

/** 1985, il parcheggio: il centro commerciale coi due pini, i lampioni, le strisce dei posti auto. */
const ArtParcheggio: React.FC<{ c: Pal; T: number }> = ({ c, T }) => (
  <g>
    <Stars t={T} seed={85} n={18} x={120} y={56} w={840} h={70} color={c.ink} size={0.8} />
    <path d="M170 330 V140 H910 V330" {...Lc(c)} fill={c.fill2} strokeWidth="7" />
    <path d="M150 140 H930" {...Lc(c)} strokeWidth="8" />
    <rect x="330" y="160" width="420" height="52" rx="8" {...Lc(c)} fill={c.dark} strokeWidth="4" />
    <text x="540" y="196" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="28" letterSpacing="3" fill={c.warm}>CENTRO COMMERCIALE</text>
    {[200, 300, 780, 880].map((x) => <rect key={x} x={x} y="232" width="64" height="98" {...Lc(c)} fill={c.warm} fillOpacity={0.16 + 0.06 * Math.sin(T + x)} strokeWidth="3" />)}
    <path d="M430 330 V246 H650 V330 M540 246 V330" {...Lc(c)} strokeWidth="4" />
    {/* i due pini */}
    {[128, 952].map((x, i) => (
      <g key={x} transform={`translate(${x} 0)`}>
        <path d="M0 360 V300" {...Lc(c)} strokeWidth="8" />
        <path d="M0 110 L-44 200 H-20 L-58 270 H-26 L-70 320 H70 L26 270 H58 L20 200 H44 Z" fill={c.tree} stroke={c.ink} strokeWidth="4" strokeLinejoin="round" transform={`rotate(${Math.sin(T * 0.7 + i) * 1.2} 0 320)`} />
      </g>
    ))}
    <path d="M100 360 H980" {...Lc(c)} strokeWidth="5" />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${180 + i * 100} 380 L${150 + i * 110} 540`} stroke={c.dim} strokeWidth="4" />)}
    <Lamp c={c} T={T} x={330} y={400} h={150} id="rf-pk1" />
    <Lamp c={c} T={T} x={750} y={400} h={150} id="rf-pk2" />
  </g>
);

/** 1985, casa McFly: soggiorno con la libreria, il divano, la lampada; dalla finestra il vialetto con l'auto. */
const ArtCasa: React.FC<{ c: Pal; T: number; bubbles: number; book: number }> = ({ c, T, bubbles, book }) => (
  <g>
    {/* la finestra sul vialetto */}
    <rect x="620" y="90" width="330" height="250" rx="6" {...Lc(c)} fill={c.win1} strokeWidth="7" />
    <rect x="620" y="250" width="330" height="90" fill={c.win2} />
    <path d="M785 90 V340 M620 215 H950" {...Lc(c)} strokeWidth="5" />
    <Glow id="rf-sun" x={900} y={130} r={110} t={T} color={c.warm} amp={0.05} rate={1.2} opacity={0.5} />
    <g transform="translate(790 300)"><Car55 ink={c.ink} T={T} s={0.62} /></g>
    {Array.from({ length: 9 }, (_, i) => {
      const y = 300 - mod(T * (16 + i * 3) + i * 40, 160);
      return <circle key={i} cx={760 + ((i * 47) % 140) + Math.sin(T * 2 + i) * 8} cy={y} r={5 + (i % 3) * 3} fill="#FFFFFF" fillOpacity=".25" stroke="#FFFFFF" strokeWidth="2" opacity={bubbles * 0.8} />;
    })}
    {/* la libreria con il libro di George */}
    <rect x="130" y="90" width="300" height="250" {...Lc(c)} fill={c.fill} strokeWidth="6" />
    {[170, 250].map((y) => <path key={y} d={`M130 ${y} H430`} {...Lc(c)} strokeWidth="5" />)}
    {[90, 170, 250].map((y0, row) => {
      let x = 142;
      return BOOKS.map((b, i) => {
        const bx = x; x += b.w + 3;
        if (bx + b.w > 420) return null;
        const hh = Math.min(b.h, 74);
        const hi = row === 1 && i === 4;
        return <rect key={`${row}${i}`} x={bx} y={y0 + 80 - hh} width={b.w} height={hh} fill={hi ? (book > 0.5 ? '#C9563C' : '#5E7898') : ['#5E7898', '#3E6A90', '#7A8FA8'][(i + row) % 3]} stroke={hi && book > 0.5 ? YEL : c.ink} strokeWidth={hi && book > 0.5 ? 4 : 2} />;
      });
    })}
    {/* la lampada e il divano */}
    <Glow id="rf-lamp" x={520} y={250} r={110} t={T} color={c.warm} amp={0.06} rate={1.6} opacity={0.4} />
    <path d="M520 470 V280 M492 470 H548" {...Lc(c)} strokeWidth="5" />
    <path d="M486 280 H554 L538 236 H502 Z" {...Lc(c)} fill={c.warm} fillOpacity=".55" strokeWidth="4" />
    <path d="M150 470 V400 Q150 380 172 380 H420 Q442 380 442 400 V470 Z" {...Lc(c)} fill="#6C4A6E" strokeWidth="6" />
    <path d="M140 420 H452 V470 H140 Z" {...Lc(c)} fill="#7E5A80" strokeWidth="5" />
    <path d="M296 380 V420" {...Lc(c)} strokeWidth="3" />
    <path d="M100 470 H980" {...Lc(c)} strokeWidth="6" />
    <path d="M200 500 H880 L940 540 H140 Z" fill={c.rug} fillOpacity=".6" stroke={c.dim} strokeWidth="3" />
  </g>
);

/** 2015: solo una città tratteggiata e un grande punto di domanda (è il seguito), finché Doc non ne arriva. */
const ArtFuturo: React.FC<{ c: Pal; T: number; lit: number }> = ({ c, T, lit }) => (
  <g opacity={0.45 + 0.55 * lit}>
    {SKY.map((b, i) => (
      <g key={i}>
        <rect x={b.x} y={470 - b.h} width={b.w} height={b.h} fill={c.fill2} fillOpacity={0.5 * lit} stroke={c.ink} strokeWidth="3" strokeDasharray={lit > 0.5 ? undefined : '12 10'} />
        {lit > 0.3 && Array.from({ length: Math.floor(b.h / 50) }, (_, k) => <rect key={k} x={b.x + 14} y={480 - b.h + k * 50} width={b.w - 28} height="14" fill={c.warm} opacity={0.2 + 0.25 * Math.sin(T * 2 + i + k)} />)}
      </g>
    ))}
    <text x="540" y="300" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="230" fill={c.ink} opacity={0.12 * (1 - lit) + 0.04}>?</text>
    <path d="M100 470 H980" {...Lc(c)} strokeWidth="5" strokeDasharray={lit > 0.5 ? undefined : '16 12'} />
  </g>
);

/** La foto di famiglia: tre cerchi (fratello, sorella, Marty) che sbiadiscono uno alla volta e poi tornano. */
const Photo: React.FC<{ T: number; fadeBro: number; fadeSis: number; fadeMe: number; s?: number }> = ({ T, fadeBro, fadeSis, fadeMe, s = 1 }) => {
  const f = [fadeBro, fadeSis, fadeMe];
  const names = ['fratello', 'sorella', 'Marty'];
  return (
    <g transform={`scale(${s}) rotate(4)`}>
      <rect x="-128" y="-108" width="256" height="226" fill="#000" opacity=".35" transform="translate(6 8)" />
      <rect x="-128" y="-108" width="256" height="226" fill="#F4EEDC" stroke={INK} strokeWidth="5" />
      <rect x="-112" y="-92" width="224" height="150" fill="#5D88B4" />
      <path d="M-112 30 Q-40 0 40 24 Q80 34 112 20 V58 H-112 Z" fill="#4C7A4E" />
      {[-70, 0, 70].map((x, i) => (
        <g key={i} transform={`translate(${x} -20)`} opacity={1 - 0.92 * f[i]}>
          <circle r="30" fill={FILL} stroke={INK} strokeWidth="3.5" />
          {i === 0 && <path d="M-18 6 Q-18 -16 0 -16 Q18 -16 18 6 Z M10 6 H28" fill="#D9483A" stroke={INK} strokeWidth="3" />}
          {i === 1 && <path d="M-16 -8 L0 0 L-16 8 Z M16 -8 L0 0 L16 8 Z" fill="#F2C94C" stroke={INK} strokeWidth="3" />}
          {i === 2 && <Skate T={T} s={0.5} />}
        </g>
      ))}
      {names.map((n, i) => <text key={n} x={-70 + i * 70} y="92" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="26" fill="#2A3A4A" opacity={1 - 0.85 * f[i]}>{n}</text>)}
    </g>
  );
};

// ---------------------------------------------------------------- lo schema

/** `cam`: dove guarda la camera (y del mondo e zoom), per attenuare le stazioni lontane; il video lungo passa la sua. */
export const Schema: React.FC<{ T: number; cam?: { y: number; z: number } }> = ({ T, cam = camAt(T) }) => {
  const bandAt: Record<BandKey, number> = {
    parcheggio: 0, strada: at('macchina', 3, 1.2), piazza: at('foto', 0, 0.6), ballo: at('foto', 2), casa: at('cambiato', 1), futuro: at('cambiato', 2),
  };
  const off = (ch: string) => 1 - seg(T, end(ch) - 0.4, end(ch) + 0.3);
  const inCh = (ch: string) => T >= STARTS[ch] - 0.2 && T < end(ch) + 0.2;
  // eventi principali
  const speed = eo(seg(T, at('macchina', 0, 0.2), at('macchina', 0, 1.6)));
  const fuel = 1 - 0.0 * T;
  const shots1 = at('macchina', 3, 0.1);
  const docDead = seg(T, shots1 + 0.3, shots1 + 0.6) * (1 - seg(T, at('cambiato', 0, 0.4), at('cambiato', 0, 0.9)));
  const depart = eio(seg(T, at('macchina', 3, 0.8), at('macchina', 3, 1.6)));
  const carGone = T >= at('macchina', 3, 1.6) && T < at('lettera', 2, 1.0);
  const car55 = eo(seg(T, at('incidente', 0, 0.1), at('incidente', 1, 0.1)));
  const hit = seg(T, at('incidente', 1, 0), at('incidente', 1, 0.5));
  const crossed = seg(T, at('incidente', 2, 0.6), at('incidente', 2, 0.9));
  const fadeBro = seg(T, at('foto', 3, 0.0), at('foto', 3, 1.3)) * (1 - seg(T, at('ballo', 3, 0.5), at('ballo', 3, 1.3)));
  const fadeSis = seg(T, at('foto', 3, 0.8), at('foto', 3, 2.0)) * (1 - seg(T, at('ballo', 3, 0.5), at('ballo', 3, 1.3)));
  const fadeMe = 0.45 * seg(T, at('foto', 3, 1.6), at('foto', 3, 2.6)) * (1 - seg(T, at('ballo', 3, 0.3), at('ballo', 3, 1.0)));
  const cable = eo(seg(T, at('fulmine', 3, 0.3), at('fulmine', 3, 1.6)));
  const storm = seg(T, at('fulmine', 0, 0), at('fulmine', 0, 1)) * (1 - seg(T, at('lettera', 3), at('lettera', 3, 0.6)));
  const boltT = at('lettera', 2, 0.2);
  const flash = flashAt(T, [boltT]);
  const surge = seg(T, boltT, boltT + 0.2) * (1 - seg(T, boltT + 0.9, boltT + 1.4));
  const minutes = T < at('fulmine', 2) ? 600 + 3 * (T - at('fulmine', 2)) : lerp(600, 604, seg(T, at('fulmine', 2), boltT)) ;
  const pCar = eio(seg(T, at('lettera', 2, -0.6), at('lettera', 2, 0.4)));
  const punch = seg(T, at('ballo', 2, 0.5), at('ballo', 2, 0.65));
  const torn = seg(T, at('lettera', 1, 1.0), at('lettera', 1, 1.4));
  const shots2 = at('lettera', 3, 0.6);
  const rise = seg(T, at('cambiato', 0, 0.2), at('cambiato', 0, 0.8));
  const bookOn = seg(T, at('cambiato', 1, 0.6), at('cambiato', 1, 0.8));
  const lit2015 = seg(T, at('cambiato', 2, 0.1), at('cambiato', 2, 0.9));
  const fireAt = (t0: number) => (T >= t0 && T < t0 + 1.0 ? [0, CROMA / 2, CROMA].map((k) => seg(T, t0 + k, t0 + k + 0.05) * (1 - seg(T, t0 + k + 0.1, t0 + k + 0.25))) : [0, 0, 0]);
  const muzzle = Math.max(...fireAt(shots1), ...fireAt(shots2));
  const shooting = (T >= shots1 && T < shots1 + 0.9) || (T >= shots2 && T < shots2 + 0.9);

  // il viaggio verso il 1955 (dal parcheggio, su per il bordo destro, fino alla strada) e il ritorno dalla piazza
  const go = `M720 ${Y('parcheggio', 440)} Q${RX} ${Y('parcheggio', 440)} ${RX} ${Y('parcheggio', 200)} L${RX} ${Y('strada', 520)} Q${RX} ${Y('strada', 460)} ${N.marty55[0] + 50} ${N.marty55[1] - 50}`;
  const back = `M${880} ${Y('piazza', 470)} Q${RX} ${Y('piazza', 470)} ${RX} ${Y('piazza', 600)} L${RX} ${Y('parcheggio', 330)} Q${RX} ${Y('parcheggio', 430)} ${830} ${Y('parcheggio', 430)}`;
  const fromFuture = `M${N.kids[0] + 60} ${Y('futuro', 540)} Q${1010} ${Y('futuro', 260)} ${N.docC[0]} ${N.docC[1] + 70}`;
  // posizione dell'auto del tempo
  const carPk = { x: lerp(480, 1240, depart), y: Y('parcheggio', 440) };
  const car55X = lerp(-260, 540, car55);

  return (
    <g>
      {/* la linea degli anni */}
      <path d={`M${RAIL} 380 V${Y('piazza', 780)}`} {...L} strokeWidth="5" />
      <path d={`M${RAIL} ${Y('piazza', 780)} l-14 18 l28 18 l-28 18 l28 18 l-14 12`} {...L} strokeWidth="4" />
      <path d={`M${RAIL} ${Y('parcheggio', -20)} V5400`} {...L} strokeWidth="5" />
      <text x={RAIL + 4} y={Y('piazza', 850)} fontFamily={HAND} fontWeight={700} fontSize={fit(46)} fill={DIM} transform={`rotate(-90 ${RAIL + 4} ${Y('piazza', 850)})`} textAnchor="middle">+30 anni</text>
      {(['strada', 'parcheggio', 'futuro'] as BandKey[]).map((k) => {
        const era = k === 'strada' ? inCh('passato') || inCh('incidente') || inCh('foto') || inCh('fulmine') || inCh('ballo') || (inCh('lettera') && T < at('lettera', 2, 1)) : k === 'parcheggio' ? T < at('macchina', 3, 1.2) || T > at('lettera', 2, 1) : T > at('cambiato', 2);
        return (
          <g key={k} transform={`translate(${RAIL} ${BAND[k].y0 + 10})`}>
            <rect x="-40" y="-26" width="80" height="52" rx="10" fill={era ? YEL : FILL} stroke={INK} strokeWidth="3" />
            <text y="12" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="30" fill={era ? DARK : INK} transform="rotate(-90)">{''}</text>
            <text y="11" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="28" fill={era ? DARK : INK}>{BAND[k].year}</text>
          </g>
        );
      })}

      {/* le stazioni */}
      {BANDS.map((b) => {
        const on = seg(T, bandAt[b.key], bandAt[b.key] + 0.6);
        const focusOn = Math.abs(cam.y - cy(b.key)) < 300 ? 1 : 0;
        // le stazioni lontane dall'inquadratura restano più scure (nel campo lungo tutte accese)
        const near = cam.z < 0.6 ? 1 : 1 - 0.55 * seg(Math.abs(cam.y - cy(b.key)), 430, 760);
        return (
          <g key={b.key} opacity={near}>
            <Frame k={b.key} on={b.key === 'futuro' ? 0 : on} focus={focusOn} />
            <g transform={`translate(0 ${b.y0})`} opacity={b.key === 'futuro' ? 1 : 0.1 + 0.9 * on}>
              {b.key === 'strada' && <ArtStrada c={P55} T={T} carX={car55X} carRoll={car55} />}
              {b.key === 'ballo' && <ArtBallo c={P55} T={T} lights={seg(T, at('ballo', 0), at('ballo', 0, 1))} />}
              {b.key === 'piazza' && <ArtPiazza c={P55} T={T} storm={storm} minutes={minutes} />}
              {b.key === 'parcheggio' && <ArtParcheggio c={P85} T={T} />}
              {b.key === 'casa' && <ArtCasa c={P85} T={T} bubbles={seg(T, at('cambiato', 1, 0.8), at('cambiato', 1, 1.3))} book={bookOn} />}
              {b.key === 'futuro' && <ArtFuturo c={P15} T={T} lit={lit2015} />}
            </g>
          </g>
        );
      })}

      {/* ---- capitolo 1: Hill Valley 1985, Marty, Doc e l'auto */}
      <Tag T={T} t0={at('marty', 0, 0.3)} x={540} y={Y('parcheggio', 100)} text="HILL VALLEY · 1985" size={42} until={at('marty', 1, 0.2)} />
      {!carGone && (
        <g transform={`translate(${T >= at('lettera', 2, 1.0) ? 640 : carPk.x} ${carPk.y})`}>
          {T < at('lettera', 2, 1.0) && depart > 0 && depart < 1 && <path d={`M${-130 - 400 * depart} 6 H-130`} stroke={YEL} strokeWidth="10" strokeDasharray="30 18" strokeDashoffset={-T * 200} opacity=".8" />}
          <TimeCar T={T} glow={0.25 + 0.75 * Math.max(speed * (T < at('macchina', 1, 1) ? 1 : 0.6), surge)} s={1.3} />
        </g>
      )}
      <Node T={T} t0={at('marty', 1, 0.1)} p={N.marty85} name="Marty" sub="17 anni" fade={T > at('macchina', 3, 1.0) && T < at('lettera', 3, 0) ? 0 : 1}><Skate T={T} /></Node>
      <Node T={T} t0={at('marty', 2, 0.1)} p={N.doc85} name="Doc" sub="lo scienziato" dead={docDead} hit={seg(T, shots1, shots1 + 0.8) + seg(T, shots2, shots2 + 0.8)}><Goggles /></Node>
      <Link T={T} t0={at('marty', 2, 0.6)} a={[N.marty85[0] + 66, N.marty85[1]]} b={[N.doc85[0] - 66, N.doc85[1]]} c={[375, N.marty85[1] - 90]} label="amici" ly={-12} fade={off('macchina')} />
      <Tag T={T} t0={at('marty', 3, 0.3)} x={480} y={Y('parcheggio', 300)} text="MACCHINA DEL TEMPO" size={36} until={end('marty') - 0.2} />

      {/* ---- capitolo 2: 88 miglia orarie, il plutonio, i terroristi, la fuga */}
      {T >= at('macchina', 0, 0.1) && T < at('macchina', 3, 0.6) && (() => {
        const v = Math.round(88 * speed);
        return (
          <g transform={`translate(330 ${Y('parcheggio', 290)}) scale(${pop(T, at('macchina', 0, 0.1))})`} opacity={off('macchina')}>
            <circle r="74" fill="#0F2A4C" stroke={INK} strokeWidth="6" />
            <path d="M-52 30 A60 60 0 1 1 52 30" fill="none" stroke={DIM} strokeWidth="6" />
            <path d={`M0 0 L0 -54`} stroke={v >= 88 ? YEL : INK} strokeWidth="6" strokeLinecap="round" transform={`rotate(${-130 + 260 * speed})`} />
            <text y="40" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="44" fill={v >= 88 ? YEL : INK}>{v}</text>
            <text y="112" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={fit(40)} fill={YEL} stroke={DARK} strokeWidth="6" paintOrder="stroke">miglia orarie</text>
          </g>
        );
      })()}
      <Tag T={T} t0={at('macchina', 0, 1.4)} x={330} y={Y('parcheggio', 175)} text="≈ 140 km/h" size={32} until={at('macchina', 1)} />
      {T >= at('macchina', 1, 0.1) && T < at('macchina', 3, 0.6) && (
        <g transform={`translate(790 ${Y('parcheggio', 290)}) scale(${1.3 * pop(T, at('macchina', 1, 0.1))})`} opacity={off('macchina')}>
          <Glow id="rf-pu" x={0} y={0} r={90} t={T} color={ATOM} amp={0.15} rate={5} opacity={0.6} />
          <Canister T={T} full={fuel} />
          <text y="-52" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={fit(34)} fill={ATOM} stroke={DARK} strokeWidth="6" paintOrder="stroke">plutonio</text>
        </g>
      )}
      <Node T={T} t0={at('macchina', 2, 0.1)} p={N.terr} name="i terroristi" color={RED} r={54} size={32} fade={T < at('cambiato', 0, 1.2) ? 1 : 1 - seg(T, at('cambiato', 0, 1.2), at('cambiato', 0, 1.6))}><Van /></Node>
      <Link T={T} t0={at('macchina', 2, 0.5)} a={[790, Y('parcheggio', 345)]} b={[N.terr[0] - 30, N.terr[1] - 62]} c={[820, Y('parcheggio', 450)]} color={RED} dashed label="rubato a loro" lx={-60} ly={0} size={38} fade={off('macchina')} />
      {shooting && muzzle > 0 && (
        <g opacity={muzzle}>
          {[-24, 0, 24].map((dy, i) => <path key={i} d={`M${N.terr[0] - 62} ${N.terr[1] + dy * 0.3} L${N.doc85[0] + 50} ${N.doc85[1] + dy}`} stroke={RED} strokeWidth="5" strokeDasharray="16 12" />)}
          <circle cx={N.terr[0] - 64} cy={N.terr[1]} r="22" fill={WARM} />
        </g>
      )}
      <Travel T={T} t0={at('macchina', 3, 1.0)} d={go} id="rf-go" dur={1.6} label="30 anni indietro" lx={RX - 150} ly={Y('piazza', 300)} labelUntil={at('passato', 0, 0.6)} fade={1 - 0.75 * seg(T, at('passato', 2), at('passato', 2, 0.6))} />

      {/* ---- capitolo 3: 1955, niente plutonio, George e Biff */}
      <Node T={T} t0={at('macchina', 3, 2.6) > at('passato', 0) ? at('passato', 0) : at('macchina', 3, 2.6)} p={N.marty55} name="Marty" r={56} size={34} hit={hit} ring={seg(T, at('incidente', 3, 0.2), at('incidente', 3, 0.6)) * off('foto')} color={hit > 0 ? INK : INK}><Skate T={T} /></Node>
      <Tag T={T} t0={at('passato', 0, 0.9)} x={540} y={Y('strada', 120)} text="1955" size={70} until={at('passato', 1, 0.1)} />
      {T >= at('passato', 1, 0.1) && (
        <g transform={`translate(${N.marty55[0] + 170} ${N.marty55[1] - 50}) scale(${1.5 * pop(T, at('passato', 1, 0.1))})`} opacity={1 - seg(T, at('passato', 2, 0.3), at('passato', 2, 0.8))}>
          <Canister T={T} full={0} />
          <text y="-50" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={fit(36)} fill={RED} stroke={DARK} strokeWidth="6" paintOrder="stroke">vuoto</text>
          <path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke={RED} strokeWidth="8" strokeLinecap="round" opacity={seg(T, at('passato', 1, 0.6), at('passato', 1, 0.8))} />
        </g>
      )}
      <Node T={T} t0={at('passato', 2, 0.1)} p={N.george} name="George" sub="suo padre, da ragazzo" r={56} size={34} fade={1 - seg(T, end('fulmine') - 0.3, end('fulmine') + 0.3)}><Notebook /></Node>
      <Node T={T} t0={at('passato', 3, 0.1)} p={N.biff} name="Biff" sub="il bullo" r={54} size={32} color={RED} fade={1 - seg(T, at('incidente', 1, -0.4), at('incidente', 1, 0.1))}><Jacket /></Node>
      <Link T={T} t0={at('passato', 3, 0.6)} a={[N.biff[0] + 50, N.biff[1] - 40]} b={[N.george[0] - 50, N.george[1] - 40]} c={[540, N.biff[1] - 230]} color={RED} arrow label="lo prende in giro" ly={-10} size={40} fade={1 - seg(T, at('incidente', 0, -0.2), at('incidente', 0, 0.3))} />

      {/* ---- capitolo 4: l'incidente, Lorraine si innamora di Marty */}
      <Link T={T} t0={at('incidente', 0, 0.9)} a={[N.marty55[0] + 60, N.marty55[1] - 10]} b={[N.george[0] - 62, N.george[1] - 10]} c={[705, N.marty55[1] - 90]} arrow label="lo spinge via" ly={-14} size={36} fade={off('incidente')} />
      {hit > 0 && hit < 1 && <g transform={`translate(${N.marty55[0]} ${N.marty55[1] - 80}) scale(${eob(hit, 1.8)})`}><path d="M0 -50 L12 -16 L48 -22 L22 4 L40 36 L4 20 L-16 50 L-18 14 L-52 10 L-22 -10 Z" fill={WARM} stroke={INK} strokeWidth="4" opacity={1 - hit} /></g>}
      <Node T={T} t0={at('incidente', 1, 0.6)} p={N.lorraine} name="Lorraine" sub="la sua futura mamma" side="below" r={56} size={34} color={PINK} fade={1 - seg(T, end('fulmine') - 0.3, end('fulmine') + 0.3)}><Bow /></Node>
      <Link T={T} t0={at('incidente', 1, 1.0)} a={[N.lorraine[0] + 60, N.lorraine[1]]} b={[N.marty55[0] - 62, N.marty55[1]]} c={[375, N.lorraine[1] - 70]} color={PINK} arrow label="lo cura" ly={-14} size={38} fade={1 - seg(T, end('fulmine') - 0.3, end('fulmine') + 0.3)} />
      <Link T={T} t0={at('incidente', 2, 0.1)} a={[N.lorraine[0] + 30, N.lorraine[1] - 58]} b={[N.george[0] - 30, N.george[1] - 58]} c={[540, Y('strada', 120)]} color={DIM} dashed label="doveva curare George" ly={-24} size={36} cross={crossed} fade={off('incidente')} />
      {T >= at('incidente', 3, 0.1) && (() => {
        const k = eob(seg(T, at('incidente', 3, 0.1), at('incidente', 3, 0.6)), 1.6);
        const fade = 1 - seg(T, end('fulmine') - 0.3, end('fulmine') + 0.3);
        const mx = (N.lorraine[0] + N.marty55[0]) / 2, my = N.lorraine[1] + 25;
        return (
          <g opacity={fade}>
            <ellipse cx={mx} cy={my} rx={265 * k} ry={150 * k} fill="none" stroke={RED} strokeWidth="8" />
            <g transform={`translate(${mx} ${my - 150}) scale(${k * (1 + 0.08 * Math.sin(T * 7))})`}><path d="M0 22 C-38 0 -24 -28 0 -10 C24 -28 38 0 0 22 Z" fill={RED} stroke={INK} strokeWidth="4" /></g>
          </g>
        );
      })()}
      <Tag T={T} t0={at('incidente', 3, 0.7)} x={600} y={Y('strada', 190)} text="si innamora di Marty!" bg={RED} fg="#FFFFFF" size={40} rot={-3} until={end('incidente') - 0.2} />

      {/* ---- capitolo 5: il Doc del 1955, la foto che sbiadisce */}
      <Node T={T} t0={at('foto', 0, 1.0)} p={N.doc55} name="Doc" sub="giovane, nel 1955" r={58} size={34}><Goggles /></Node>
      <Node T={T} t0={at('foto', 0, 0.9)} p={N.martyP} name="Marty" r={50} size={30} fade={1 - seg(T, end('lettera') - 0.6, end('lettera'))}><Skate T={T} /></Node>
      <Link T={T} t0={at('foto', 0, 1.3)} a={[N.martyP[0] + 56, N.martyP[1]]} b={[N.doc55[0] - 64, N.doc55[1]]} c={[415, N.martyP[1] - 90]} arrow label="gli racconta tutto" ly={-12} size={38} fade={off('foto')} />
      <Tag T={T} t0={at('foto', 1, 0.9)} x={540} y={Y('piazza', 380)} text="se non si mettono insieme, Marty non nascerà" bg={RED} fg="#FFFFFF" size={30} until={at('foto', 2, 0.2)} />
      {T >= at('foto', 2, 0.1) && (
        <g transform={`translate(${N.photo[0]} ${N.photo[1]}) scale(${0.95 * pop(T, at('foto', 2, 0.1))})`}>
          <Photo T={T} fadeBro={fadeBro} fadeSis={fadeSis} fadeMe={fadeMe} />
        </g>
      )}
      <Tag T={T} t0={at('foto', 3, 0.6)} x={N.photo[0] - 20} y={N.photo[1] - 150} text="spariscono!" bg={RED} fg="#FFFFFF" size={38} rot={-4} until={end('foto') - 0.1} />

      {/* ---- capitolo 6: il fulmine, il volantino, il cavo */}
      <Tag T={T} t0={at('fulmine', 0, 0.5)} x={430} y={Y('piazza', 380)} text="serve un fulmine" size={40} until={at('fulmine', 1, 0.2)} />
      {T >= at('fulmine', 1, 0.1) && (
        <g transform={`translate(760 ${Y('piazza', 235)}) rotate(6) scale(${pop(T, at('fulmine', 1, 0.1))})`} opacity={1 - seg(T, end('fulmine') - 0.4, end('fulmine'))}>
          <rect x="-96" y="-118" width="192" height="236" fill="#000" opacity=".35" transform="translate(6 8)" />
          <rect x="-96" y="-118" width="192" height="236" fill="#F4EEDC" stroke={INK} strokeWidth="4" />
          <text y="-82" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="22" fill="#2A3A4A">SALVIAMO</text>
          <text y="-58" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="22" fill="#2A3A4A">LA TORRE!</text>
          <path d="M-30 50 V-20 H30 V50 M-38 -20 L0 -44 L38 -20" fill="#C9D6E2" stroke="#2A3A4A" strokeWidth="3" />
          <circle cy="0" r="14" fill="#F4EEDC" stroke="#2A3A4A" strokeWidth="3" />
          <path d="M44 -40 L24 -6 H40 L22 30" fill="none" stroke="#D9483A" strokeWidth="5" />
          <text y="84" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="18" fill="#2A3A4A">fulmine: sabato, 22:04</text>
          <text y="104" textAnchor="middle" fontFamily={SANS} fontWeight={400} fontSize="14" fill="#2A3A4A">volantino del 1985</text>
        </g>
      )}
      <Link T={T} t0={at('fulmine', 2, 0.5)} a={[660, Y('piazza', 200)]} b={[440, Y('piazza', 150)]} c={[560, Y('piazza', 110)]} color={INK} arrow label="sabato sera" lx={30} ly={-24} size={40} fade={1 - seg(T, at('fulmine', 3), at('fulmine', 3, 0.4))} />
      {cable > 0 && (
        <g>
          <mask id="rf-cab" maskUnits="userSpaceOnUse" x="0" y="1000" width="1200" height="1400"><rect x="300" y="1000" width={700 * cable} height="1400" fill="#fff" /></mask>
          <path d={`M430 ${Y('piazza', 150)} Q600 ${Y('piazza', 230)} 760 ${Y('piazza', 292)} Q855 ${Y('piazza', 340)} 950 ${Y('piazza', 292)}`} fill="none" stroke={surge > 0 ? '#FFFFFF' : P55.ink} strokeWidth={surge > 0 ? 10 : 7} mask="url(#rf-cab)" />
          {surge > 0 && <path d={`M430 ${Y('piazza', 150)} Q600 ${Y('piazza', 230)} 760 ${Y('piazza', 292)} Q855 ${Y('piazza', 340)} 950 ${Y('piazza', 292)}`} fill="none" stroke="#BFE6FF" strokeWidth="40" opacity={0.6 * surge} />}
          <text x="610" y={Y('piazza', 254)} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={fit(40)} fill={INK} stroke={DARK} strokeWidth="7" paintOrder="stroke" opacity={seg(T, at('fulmine', 3, 1.0), at('fulmine', 3, 1.4)) * (1 - seg(T, end('fulmine') - 0.4, end('fulmine')))}>il cavo di Doc</text>
        </g>
      )}
      {T >= at('fulmine', 3, 1.2) && T < at('lettera', 2, 0.9) && (
        <g transform={`translate(${lerp(230, 860, pCar)} ${Y('piazza', 470)}) scale(.62)`} opacity={seg(T, at('fulmine', 3, 1.2), at('fulmine', 3, 1.6))}>
          <TimeCar T={T} glow={0.3 + 0.7 * Math.max(pCar, surge)} s={1} pole ink={P55.ink} />
        </g>
      )}

      {/* ---- capitolo 7: il ballo, Biff, il pugno, i fratelli tornano */}
      <Node T={T} t0={at('ballo', 0, 0.1)} p={N.marty2} name="Marty" side="below" r={46} size={28} fade={1 - seg(T, at('ballo', 1, 0.3), at('ballo', 1, 0.8))}><Skate T={T} /></Node>
      <Node T={T} t0={at('ballo', 0, 0.3)} p={N.george2} name="George" r={56} size={32} ring={seg(T, at('ballo', 2, 0.6), at('ballo', 2, 1.0))}><Notebook /></Node>
      <Node T={T} t0={at('ballo', 0, 0.6)} p={N.lorraine2} name="Lorraine" r={54} size={32} color={PINK}><Bow /></Node>
      <Link T={T} t0={at('ballo', 0, 0.5)} a={[N.marty2[0] + 48, N.marty2[1] - 20]} b={[N.george2[0] - 60, N.george2[1] - 20]} c={[280, N.marty2[1] - 90]} arrow label="lo convince" ly={-12} size={34} fade={1 - seg(T, at('ballo', 1, 0.3), at('ballo', 1, 0.8))} />
      <Link T={T} t0={at('ballo', 0, 1.1)} a={[N.george2[0] + 58, N.george2[1] - 20]} b={[N.lorraine2[0] - 60, N.lorraine2[1] - 20]} c={[505, N.george2[1] - 110]} color={WARM} dashed arrow label="la invita al ballo" ly={-16} size={36} fade={1 - seg(T, at('ballo', 3, 0.0), at('ballo', 3, 0.4))} />
      <Node T={T} t0={at('ballo', 1, 0.1)} p={N.biff2} name="Biff" side="below" r={54} size={32} color={RED} dead={seg(T, at('ballo', 2, 0.6), at('ballo', 2, 0.9))} hit={punch} fade={off('ballo')}><Jacket /></Node>
      <Link T={T} t0={at('ballo', 1, 0.4)} a={[N.biff2[0] - 58, N.biff2[1] - 10]} b={[N.lorraine2[0] + 60, N.lorraine2[1] - 10]} c={[740, N.biff2[1] - 90]} color={RED} arrow w={8} label="prepotente" ly={-14} size={38} fade={1 - seg(T, at('ballo', 2, 0.5), at('ballo', 2, 0.9))} />
      {T >= at('ballo', 2, 0.3) && (() => {
        const k = eob(seg(T, at('ballo', 2, 0.3), at('ballo', 2, 0.6)), 1.8);
        return (
          <g opacity={off('ballo')}>
            <Link T={T} t0={at('ballo', 2, 0.1)} a={[N.george2[0] + 30, N.george2[1] - 56]} b={[N.biff2[0] - 36, N.biff2[1] - 58]} c={[625, N.george2[1] - 300]} color={YEL} arrow w={10} />
            <g transform={`translate(${N.biff2[0] - 10} ${N.biff2[1] - 110}) scale(${k}) rotate(${-8})`}>
              <path d="M0 -70 L18 -24 L66 -36 L32 4 L62 46 L8 28 L-18 70 L-24 22 L-72 18 L-30 -12 Z" fill={YEL} stroke={INK} strokeWidth="5" />
              <text y="12" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="38" fill={DARK}>POW!</text>
            </g>
          </g>
        );
      })()}
      <Tag T={T} t0={at('ballo', 2, 0.9)} x={500} y={Y('ballo', 330)} text="che coraggio!" size={36} rot={-3} until={at('ballo', 3, 0.2)} />
      {T >= at('ballo', 3, 0.2) && (() => {
        const k = eob(seg(T, at('ballo', 3, 0.2), at('ballo', 3, 0.7)), 1.6);
        const mx = (N.george2[0] + N.lorraine2[0]) / 2, my = N.george2[1] - 20;
        return (
          <g>
            <path d={`M${N.george2[0] + 58} ${N.george2[1]} Q${mx} ${my - 40} ${N.lorraine2[0] - 58} ${N.lorraine2[1]}`} fill="none" stroke={PINK} strokeWidth="8" />
            <g transform={`translate(${mx} ${my - 34}) scale(${k * (1 + 0.08 * Math.sin(T * 7))})`}><path d="M0 22 C-38 0 -24 -28 0 -10 C24 -28 38 0 0 22 Z" fill={RED} stroke={INK} strokeWidth="4" /></g>
          </g>
        );
      })()}
      <Tag T={T} t0={at('ballo', 3, 1.4)} x={N.photo[0] - 10} y={N.photo[1] - 150} text="tornano!" size={40} rot={-4} until={end('ballo') - 0.1} />

      {/* ---- capitolo 8: la lettera strappata, il fulmine, il ritorno nel 1985 */}
      <Link T={T} t0={at('lettera', 0, 0.2)} a={[N.martyP[0] + 56, N.martyP[1] - 10]} b={[N.doc55[0] - 64, N.doc55[1] - 10]} c={[415, N.martyP[1] - 110]} color={RED} arrow label="ti spareranno!" ly={-12} size={38} fade={1 - seg(T, at('lettera', 1, 0.0), at('lettera', 1, 0.4))} />
      <Tag T={T} t0={at('lettera', 0, 1.6)} x={N.doc55[0] + 20} y={N.doc55[1] - 170} text="non voglio sapere il futuro" size={30} rot={2} until={at('lettera', 1, 0.3)} />
      {T >= at('lettera', 1, 0.1) && T < end('lettera') && (() => {
        const k = pop(T, at('lettera', 1, 0.1));
        const fly = eio(seg(T, at('lettera', 1, 0.1), at('lettera', 1, 0.7)));
        const x = lerp(N.martyP[0] + 60, N.doc55[0] + 180, fly), y = lerp(N.martyP[1] - 90, N.doc55[1] - 40, fly);
        return (
          <g transform={`translate(${x} ${y}) scale(${1.7 * k})`} opacity={1 - seg(T, at('lettera', 2, 0), at('lettera', 2, 0.4))}>
            {[-1, 1].map((sd) => (
              <g key={sd} transform={`translate(${sd * 34 * torn} ${12 * torn}) rotate(${sd * 18 * torn})`}>
                <clipPath id={`rf-lt${sd}`}><rect x={sd < 0 ? -60 : 0} y="-40" width="60" height="80" /></clipPath>
                <g clipPath={`url(#rf-lt${sd})`}>
                  <rect x="-50" y="-32" width="100" height="64" fill="#F4EEDC" stroke={INK} strokeWidth="4" />
                  <path d="M-50 -32 L0 4 L50 -32" fill="none" stroke="#8A97A6" strokeWidth="3" />
                  <text y="22" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="18" fill="#2A3A4A">per Doc</text>
                </g>
              </g>
            ))}
            {torn > 0 && <path d="M0 -40 L-6 -20 L4 -4 L-4 14 L2 40" fill="none" stroke={RED} strokeWidth="4" opacity={1 - torn * 0.5} />}
          </g>
        );
      })()}
      <Tag T={T} t0={at('lettera', 1, 1.4)} x={N.doc55[0] + 180} y={N.doc55[1] - 125} text="strappata!" bg={RED} fg="#FFFFFF" size={34} rot={-3} until={at('lettera', 2, 0.1)} />
      {/* il fulmine sulla torre (l'unico lampo della scena) */}
      {T >= boltT && T < boltT + 1.1 && (() => {
        const k = 1 - seg(T, boltT + 0.4, boltT + 1.1);
        const flick = 0.75 + 0.25 * Math.sin(T * 60);
        const d = `M760 ${Y('piazza', 95)} L660 ${Y('piazza', 60)} L690 ${Y('piazza', 46)} L560 ${Y('piazza', 20)} L590 ${Y('piazza', 6)} L470 ${Y('piazza', -6)} L494 ${Y('piazza', -16)} L392 ${Y('piazza', -20)}`;
        return (
          <g opacity={k * flick}>
            <Glow id="rf-bolt" x={392} y={Y('piazza', -10)} r={260} t={T} color="#DDF0FF" amp={0.2} rate={30} opacity={0.9} />
            <path d={d} fill="none" stroke="#BFE6FF" strokeWidth="80" opacity=".4" strokeLinejoin="round" strokeLinecap="round" />
            <path d={d} fill="none" stroke={P55.ink} strokeWidth="34" strokeLinejoin="round" strokeLinecap="round" />
            <path d={d} fill="none" stroke="#FFF6B0" strokeWidth="22" strokeLinejoin="round" strokeLinecap="round" />
          </g>
        );
      })()}
      <Travel T={T} t0={at('lettera', 2, 0.6)} d={back} id="rf-back" dur={1.4} label="di nuovo nel 1985" lx={RX - 170} ly={Y('piazza', 870)} labelUntil={at('lettera', 3, 0.4)} fade={1 - 0.65 * seg(T, end('lettera'), end('lettera') + 0.6)} />
      <Tag T={T} t0={at('lettera', 3, 0.1)} x={540} y={Y('parcheggio', 120)} text="troppo tardi!" bg={RED} fg="#FFFFFF" size={40} rot={-3} until={end('lettera') - 0.2} />

      {/* ---- capitolo 9: Doc si rialza, la famiglia cambiata, Doc dal 2015 */}
      {rise > 0 && (
        <g opacity={1 - seg(T, at('cambiato', 1, 0), at('cambiato', 1, 0.4))}>
          <Tag T={T} t0={at('cambiato', 0, 0.6)} x={N.doc85[0]} y={Y('parcheggio', 300)} text="giubbotto antiproiettile" bg={YEL} size={30} rot={2} />
          <g transform={`translate(${N.doc85[0] - 175} ${N.doc85[1] - 95}) scale(${1.5 * pop(T, at('cambiato', 0, 0.9))}) rotate(-8)`}>
            <rect x="-50" y="-32" width="100" height="64" fill="#F4EEDC" stroke={INK} strokeWidth="4" />
            <path d="M0 -36 L-6 -16 L4 0 L-4 18 L2 36" fill="none" stroke="#C9A36A" strokeWidth="8" opacity=".9" />
            <text y="10" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="20" fill="#2A3A4A">riattaccata</text>
          </g>
        </g>
      )}
      <Node T={T} t0={at('cambiato', 1, 0.3)} p={N.george3} name="George" sub="sicuro di sé, scrittore" subFill={YEL} side="below" r={58} size={32} ring={1}><Notebook book={bookOn} /></Node>
      <Node T={T} t0={at('cambiato', 1, 0.5)} p={N.marty4} name="Marty" r={52} size={30}><Skate T={T} /></Node>
      <Node T={T} t0={at('cambiato', 1, 1.0)} p={N.biff3} name="Biff" sub="gli lava l'auto" side="below" r={52} size={30} color={DIM}><Jacket /></Node>
      <Node T={T} t0={at('cambiato', 2, 0.9)} p={N.docC} name="Doc" sub="dal 2015" subFill={YEL} r={52} size={30} ring={1}><Goggles /></Node>
      <Travel T={T} t0={at('cambiato', 2, 0.2)} d={fromFuture} id="rf-fut" dur={1.0} />
      <Node T={T} t0={at('cambiato', 3, 0.1)} p={N.jen} name="Jennifer" sub="la sua ragazza" side="below" r={48} size={28} color={PINK}><Note /></Node>
      {T >= at('cambiato', 3, 0.5) && (() => {
        const k = eob(seg(T, at('cambiato', 3, 0.5), at('cambiato', 3, 1.0)), 1.6);
        const [kx, ky] = N.kids;
        return (
          <g>
            {[-110, 110].map((dx, i) => (
              <g key={dx} transform={`translate(${kx + dx} ${ky}) scale(${pop(T, at('cambiato', 3, 0.5) + i * 0.2)})`}>
                <circle r="56" fill={FILL} stroke={INK} strokeWidth="4.5" />
                <text y="26" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="74" fill={YEL}>?</text>
              </g>
            ))}
            <text x={kx} y={ky + 110} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={fit(34)} fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke" opacity={seg(T, at('cambiato', 3, 0.8), at('cambiato', 3, 1.1))}>i loro figli</text>
            <ellipse cx={kx} cy={ky} rx={260 * k} ry={110 * k} fill="none" stroke={RED} strokeWidth="9" />
          </g>
        );
      })()}
      <Tag T={T} t0={at('cambiato', 3, 1.1)} x={N.kids[0]} y={N.kids[1] - 170} text="nei guai!" bg={RED} fg="#FFFFFF" size={50} rot={-3} />

      {/* lampo del fulmine (l'unico della scena) */}
      {flash > 0 && <rect x="-3000" y="-3000" width="7000" height="12000" fill="#DDEFFF" opacity={0.35 * flash} />}
    </g>
  );
};

const r = rng(1955);
export const MOTES = Array.from({ length: 22 }, () => ({ x: r() * 1080, y: r() * 1920, s: 1.5 + r() * 3, v: 4 + r() * 10, ph: r() * 6 }));

export const makeLinee = (chapterId: string): React.FC<SceneProps> => {
  const Scene: React.FC<SceneProps> = ({ t }) => {
    const T = STARTS[chapterId] + t;
    const c = camAt(T);
    setUi(c.z);
    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="rf" />
          <radialGradient id="rf-bg" cx=".5" cy=".46" r=".8">
            <stop offset="0" stopColor="#2E1E5C" />
            <stop offset=".6" stopColor="#1C1240" />
            <stop offset="1" stopColor="#0C0820" />
          </radialGradient>
          <linearGradient id="rf-scrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0C0820" stopOpacity=".96" />
            <stop offset=".82" stopColor="#0C0820" stopOpacity=".88" />
            <stop offset="1" stopColor="#0C0820" stopOpacity="0" />
          </linearGradient>
          <pattern id="rf-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 H0 V40" fill="none" stroke="#33255E" strokeWidth="1" />
          </pattern>
          <pattern id="rf-grid2" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M200 0 H0 V200" fill="none" stroke="#5A2E78" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#rf-bg)" />
        <g transform={`translate(540 900) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
          <rect x="-4000" y="-4000" width="9080" height="13000" fill="url(#rf-grid)" opacity=".55" />
          <rect x="-4000" y="-4000" width="9080" height="13000" fill="url(#rf-grid2)" opacity=".5" />
          <Schema T={T} />
        </g>
        <rect width="1080" height="575" fill="url(#rf-scrim)" />
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={INK} opacity={0.1 + 0.07 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Finish id="rf" tint="#1A1238" tintOpacity={0.1} />
      </svg>
    );
  };
  return Scene;
};
