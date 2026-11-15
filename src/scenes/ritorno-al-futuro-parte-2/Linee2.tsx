import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Embers, Fire, Glow, Stars, flashAt } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/ritorno-al-futuro-parte-2.json';
import {
  ArtCasa, ArtPiazza, Bow, DARK, DIM, FILL, FrameBox, Goggles, H, INK, Jacket, Lamp, Lc, Link, MOTES, Node, Note, Notebook,
  P55, P85, RAIL, RED, ROW, RX, Skate, Tag, TimeCar, Travel, YEL, fit, isWide, pop, setUi,
} from '../ritorno-al-futuro/Linee';
import type { P, Pal } from '../ritorno-al-futuro/Linee';

// Ritorno al futuro – Parte II come schema (formato "spiegato"): le stesse linee del tempo della Parte 1, nello stesso
// stile delle epoche (notte viola anni '80; 1955 cartolina crema a inchiostro seppia; 1985 al neon ciano e magenta), con
// due stazioni nuove: il 2015, chiaro e color menta come un dépliant del futuro, e il 1985 alternativo, al neon rosso,
// con il casinò di Biff al posto della torre dell'orologio. In cima il 1885, tratteggiato finché Doc non ci finisce.
// Il 1985 alternativo è un ramo: dalla linea degli anni, sotto il 1955, si stacca un binario rosso che porta alla sua
// stazione; quando l'almanacco brucia il binario rosso si spegne e il ramo sparisce.
// Vocabolario fisso: cerchio con oggetto = personaggio, linea = legame con scritta a mano, tratteggio giallo = viaggio nel
// tempo, cartellino pieno = colpo di scena, anello rosso = il nodo da capire. L'almanacco è l'oggetto chiave (oro).
// Gli eventi cadono sulla griglia della musica (72 bpm, crome), gli stessi istanti di scripts/audio/ritorno-al-futuro-parte-2.mjs.

/** 2015: dépliant del futuro, carta menta chiara e inchiostro petrolio, accenti arancioni. */
export const P15L: Pal = { ink: '#1D4B5C', fill: '#D3EBE7', fill2: '#BCDDD8', dim: '#7FA9A8', warm: '#FF7A3D', dark: '#2A5566', tree: '#7CC7B0', win1: '#9FD3E8', win2: '#C4E6F2', rug: '#A8CFCB', cloud: '#8FB9C0', paper: '#EAF5F2' };
/** 1985 alternativo: neon rosso su fondo bordeaux. */
export const PALT: Pal = { ink: '#FF5050', fill: '#2E0E18', fill2: '#3E1420', dim: '#A0405A', warm: '#FFC23A', dark: '#120408', tree: '#3A2A20', win1: '#4A1420', win2: '#5A1A28', rug: '#3A1020', cloud: '#3A1A20', paper: '#1C0810' };
/** 1885: fotografia seppia. */
export const P1885: Pal = { ink: '#4A2E1A', fill: '#E3CFA4', fill2: '#D6BC88', dim: '#9C7E58', warm: '#E8A040', dark: '#6A4A30', tree: '#8AA070', win1: '#C8B488', win2: '#D8C69C', rug: '#C4A878', cloud: '#A08A6A', paper: '#EADCB8' };
const GOLD = '#F2B544';

const BANDS = [
  { key: 'west', y0: 420, year: '1885', name: 'HILL VALLEY' },
  { key: 'piazza', y0: 1240, year: '1955', name: "LA PIAZZA DELL'OROLOGIO" },
  { key: 'casa', y0: 2140, year: '1985', name: 'CASA McFLY' },
  { key: 'alt', y0: 2960, year: '1985', name: 'ALTERNATIVO · IL CASINÒ DI BIFF' },
  { key: 'futuro', y0: 3880, year: '2015', name: 'HILL VALLEY' },
] as const;
type BandKey = (typeof BANDS)[number]['key'];
export const BAND = Object.fromEntries(BANDS.map((b) => [b.key, b])) as Record<BandKey, (typeof BANDS)[number]>;
const PAL: Record<BandKey, Pal> = { west: P1885, piazza: P55, casa: P85, alt: PALT, futuro: P15L };
const cy = (k: BandKey) => BAND[k].y0 + 400;
const Y = (k: BandKey, y: number) => BAND[k].y0 + y;
/** Le stazioni su carta chiara (1885, 1955, 2015) hanno le scritte d'inchiostro. */
const cardAt = (y: number) => (y > BAND.west.y0 - 100 && y < BAND.casa.y0 - 100) || y > BAND.futuro.y0 - 100;
const ALT_X = 1000; // il binario rosso del ramo alternativo, a destra

export const N = {
  marty85: [210, Y('casa', ROW)], doc85: [540, Y('casa', ROW)], jen85: [870, Y('casa', ROW)],
  martyF: [180, Y('futuro', ROW)], junior: [400, Y('futuro', ROW)], griff: [620, Y('futuro', ROW)], oldBiff: [860, Y('futuro', ROW)],
  biff55: [250, Y('piazza', ROW)], oldBiff55: [540, Y('piazza', ROW)], martyP: [540, Y('piazza', ROW)], ghost: [830, Y('piazza', ROW)],
  biffRich: [250, Y('alt', ROW)], george: [540, Y('alt', ROW)], lorraine: [830, Y('alt', ROW)],
  docWest: [540, Y('west', ROW)],
  book: [540, Y('futuro', 300)],
} as const;

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
export const at = (ch: string, cue: number, d = 0) => G0 + Math.round((STARTS[ch] + CUES[ch][cue] + d - G0) / CROMA) * CROMA;
export const end = (ch: string) => STARTS[ch] + film.capitoli.find((c) => c.id === ch)!.durata;

// ---------------------------------------------------------------- camera

type Shot = { at: number; x: number; y: number; z: number };
const band = (k: BandKey, z = 1.0, dx = 0, dy = 0) => ({ x: 540 + dx, y: cy(k) + dy, z });
export const WIDE = { x: 540, y: Y('casa', 300), z: 0.24 };
export const SHOTS: Shot[] = [
  { at: 0, ...band('casa', 1.0) },
  { at: at('futuro', 1), ...band('casa', 1.05, 0, -40) },
  { at: at('futuro', 2), ...band('casa', 1.0, 120, 40) },
  { at: at('futuro', 2, 1.6), x: 700, y: Y('alt', 600), z: 0.4 },
  { at: at('futuro', 3), ...band('futuro', 1.0) },
  { at: at('griff', 0), ...band('futuro', 1.05, 120, 60) },
  { at: at('griff', 2), ...band('futuro', 1.0, -40, 60) },
  { at: at('griff', 3), ...band('futuro', 1.0, 40, 40) },
  { at: at('almanacco', 0), ...band('futuro', 1.0, 0, 0) },
  { at: at('almanacco', 2), ...band('futuro', 1.05, 140, 0) },
  { at: at('almanacco', 3), ...band('futuro', 1.0, 100, 40) },
  { at: at('furto', 0), ...band('futuro', 1.0, -40, 20) },
  // il vecchio Biff sale fino al 1955 lungo la scia gialla
  { at: at('furto', 1, 0.6), x: 760, y: Y('casa', 500), z: 0.3 },
  { at: at('furto', 2), ...band('piazza', 1.0, 0, 40) },
  { at: at('furto', 3), x: 760, y: Y('casa', 500), z: 0.3 },
  { at: at('casino', 0), x: 700, y: Y('alt', 900), z: 0.5 },
  { at: at('casino', 1), ...band('alt', 1.0, 0, 40) },
  { at: at('casino', 2), ...band('alt', 1.05, 0, -40) },
  { at: at('casino', 3), ...band('alt', 1.0, 40, 60) },
  // il binario deviato: dal 1955 al ramo rosso
  { at: at('binario', 0), x: 580, y: Y('piazza', 640), z: 0.62 },
  { at: at('binario', 2), x: 700, y: Y('casa', 100), z: 0.36 },
  { at: at('data', 0), ...band('piazza', 1.0) },
  { at: at('data', 1), ...band('piazza', 1.1, 120, -40) },
  { at: at('data', 3), ...band('piazza', 1.0, 0, 40) },
  { at: at('fuoco', 0), ...band('piazza', 1.05, 120, 60) },
  { at: at('fuoco', 1), ...band('piazza', 1.05, -60, 60) },
  { at: at('fuoco', 2), ...band('piazza', 1.0, 100, 0) },
  { at: at('fuoco', 2, 1.6), x: 700, y: Y('casa', 300), z: 0.42 },
  { at: at('fuoco', 3), ...band('alt', 1.0, 0, 40) },
  { at: at('lettera', 0), ...band('piazza', 0.95, 0, -60) },
  { at: at('lettera', 1, 0.4), x: 700, y: Y('west', 760), z: 0.5 },
  { at: at('lettera', 2), ...band('piazza', 1.05, 60, 60) },
  { at: at('lettera', 3), ...band('west', 1.0, 0, 20) },
  { at: at('lettera', 3, 1.4), ...WIDE },
];
export const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.1));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: Math.exp(lerp(Math.log(o.z), Math.log(s.z), p)) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 5, z: o.z * (1 + 0.012 * Math.sin(T * 0.2)) };
};

// ---------------------------------------------------------------- oggetti nuovi

/** Griff: occhiali a specchio con i riflessi. */
const Shades: React.FC = () => (
  <g strokeLinejoin="round" strokeLinecap="round">
    <path d="M-42 -8 H42" stroke={INK} strokeWidth="5" />
    {[-19, 19].map((x) => (
      <g key={x}>
        <path d={`M${x - 18} -10 H${x + 18} L${x + 14} 12 Q${x} 20 ${x - 14} 12 Z`} fill="#8A3AD8" stroke={INK} strokeWidth="4" />
        <path d={`M${x - 10} -4 L${x + 2} 8 M${x + 4} -4 L${x + 10} 2`} stroke="#E8D8FF" strokeWidth="3" />
      </g>
    ))}
  </g>
);
/** Il vecchio Biff: un bastone da passeggio. */
const Cane: React.FC = () => (
  <g strokeLinejoin="round" strokeLinecap="round">
    <path d="M10 36 V-18 Q10 -36 -8 -36 Q-24 -36 -24 -22" fill="none" stroke="#3B2A1F" strokeWidth="14" />
    <path d="M10 36 V-18 Q10 -36 -8 -36 Q-24 -36 -24 -22" fill="none" stroke="#9A6A3A" strokeWidth="8" />
    <path d="M4 30 H16" stroke={INK} strokeWidth="5" />
  </g>
);
/** Il figlio di Marty: un cappellino girato all'indietro. */
const Cap: React.FC = () => (
  <g strokeLinejoin="round">
    <path d="M-30 10 Q-30 -26 0 -26 Q30 -26 30 10 Z" fill="#3AA0E0" stroke={INK} strokeWidth="4" />
    <path d="M-30 10 H-50 Q-52 2 -30 0" fill="#2A80C0" stroke={INK} strokeWidth="4" />
    <circle cx="0" cy="-26" r="5" fill={INK} />
  </g>
);
/** L'almanacco sportivo: un libro con la copertina dorata e le pagine piene di risultati. */
export const Almanac: React.FC<{ T: number; s?: number; glow?: number; burn?: number }> = ({ T, s = 1, glow = 1, burn = 0 }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
    {glow > 0 && <Glow id={`rf2-al${s}`} x={0} y={0} r={140} t={T} color={GOLD} amp={0.12} rate={3} opacity={0.55 * glow * (1 - burn)} />}
    <g opacity={1 - burn}>
      <rect x="-56" y="-74" width="112" height="148" rx="8" fill="#1A2E5A" stroke={INK} strokeWidth="5" />
      <rect x="-46" y="-64" width="92" height="40" rx="4" fill={GOLD} />
      <text y="-37" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="17" fill="#1A2E5A">ALMANACCO</text>
      <text y="-10" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="15" fill={GOLD}>SPORT</text>
      <text y="16" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="20" fill={INK}>1950</text>
      <text y="38" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="20" fill={INK}>2000</text>
      <path d="M-56 -74 V74" stroke={GOLD} strokeWidth="6" />
      <path d="M-30 56 H30" stroke={GOLD} strokeWidth="3" />
    </g>
  </g>
);
/** Monete che saltano (le scommesse). */
const Coins: React.FC<{ T: number; x: number; y: number; k: number }> = ({ T, x, y, k }) => (
  <g opacity={k}>
    {[0, 1, 2, 3, 4].map((i) => {
      const u = mod(T * 0.9 + i / 5, 1);
      return (
        <g key={i} transform={`translate(${x - 120 + i * 60} ${y - 40 - Math.sin(u * Math.PI) * 70})`}>
          <ellipse rx="16" ry={16 * Math.abs(Math.cos(T * 4 + i))} fill={GOLD} stroke="#7A5A10" strokeWidth="3" />
        </g>
      );
    })}
  </g>
);

// ---------------------------------------------------------------- disegni delle stazioni nuove

const rr = rng(2015);
const SKY15 = Array.from({ length: 6 }, (_, i) => ({ x: 130 + i * 140, w: 90 + ((i * 37) % 40), h: 200 + ((i * 59) % 160) }));
const FLY = Array.from({ length: 4 }, (_, i) => ({ y: 70 + i * 40, v: 70 + rr() * 60, ph: rr() * 900, dir: i % 2 ? -1 : 1 }));

/** 2015: la città del futuro come un dépliant: palazzi arrotondati, auto che volano su corsie nel cielo, il negozio
 *  dell'usato con la vetrina, un cartellone luminoso, la strada con le frecce. */
const Art2015: React.FC<{ T: number; lit: number }> = ({ T, lit }) => {
  const c = P15L, L = Lc(c);
  return (
    <g opacity={0.35 + 0.65 * lit}>
      {/* corsie del cielo */}
      {[90, 150].map((y) => <path key={y} d={`M110 ${y} H970`} stroke={c.dim} strokeWidth="3" strokeDasharray="20 14" />)}
      {FLY.map((f, i) => {
        const x = 110 + mod(f.ph + T * f.v * f.dir, 860);
        return (
          <g key={i} transform={`translate(${x} ${f.y}) scale(${f.dir} 1)`}>
            <path d="M-34 6 Q-30 -14 0 -16 Q30 -14 34 6 Z" {...L} fill={['#FF7A3D', '#3AA0E0', '#F2B544', '#9A6AE0'][i]} strokeWidth="4" />
            <path d="M-20 -6 Q0 -14 18 -6" {...L} strokeWidth="3" />
            <ellipse cx="0" cy="12" rx="26" ry="4" fill={c.dim} opacity=".6" />
          </g>
        );
      })}
      {/* palazzi */}
      {SKY15.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={470 - b.h} width={b.w} height={b.h} rx={i % 2 ? 40 : 12} {...L} fill={i % 2 ? c.fill2 : c.fill} strokeWidth="5" />
          {Array.from({ length: Math.floor(b.h / 46) - 1 }, (_, k) => <rect key={k} x={b.x + 14} y={490 - b.h + k * 46} width={b.w - 28} height="16" rx="6" fill={c.win1} opacity={0.6 + 0.3 * Math.sin(T * 1.5 + i + k)} />)}
        </g>
      ))}
      {/* il negozio con la vetrina (l'almanacco viene da qui) */}
      <rect x="380" y="300" width="320" height="170" rx="10" {...L} fill="#FFFFFF" strokeWidth="6" />
      <rect x="400" y="340" width="280" height="110" rx="6" {...L} fill={c.win2} strokeWidth="4" />
      <rect x="420" y="306" width="240" height="30" rx="6" fill={c.warm} />
      <text x="540" y="328" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="20" letterSpacing="3" fill="#FFFFFF">OGGETTI D'EPOCA</text>
      {[430, 500, 600].map((x, i) => <rect key={x} x={x} y={404 - i * 6} width={44 + i * 8} height={40 + i * 6} rx="4" fill={['#C9563C', '#5E7898', '#7CC7B0'][i]} opacity=".8" />)}
      {/* cartellone luminoso */}
      <rect x="800" y="210" width="140" height="80" rx="10" {...L} fill={c.ink} strokeWidth="5" />
      <text x="870" y="248" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="22" fill={c.warm} opacity={0.7 + 0.3 * Math.sin(T * 5)}>2015</text>
      <text x="870" y="274" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="14" fill={c.paper}>IL FUTURO È QUI</text>
      {/* la strada con le frecce luminose */}
      <path d="M100 470 H980" {...L} strokeWidth="6" />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${mod(150 + i * 160 + T * 60, 860) + 110} 505 l24 10 l-24 10`} {...L} stroke={c.warm} strokeWidth="5" />)}
    </g>
  );
};

/** 1985 alternativo: il casinò di Biff, una torre al neon rosso dove c'era la torre dell'orologio; fumo, insegne,
 *  un bidone che brucia, auto abbandonate. */
const ArtCasino: React.FC<{ T: number; lit: number; gone: number }> = ({ T, lit, gone }) => {
  const c = PALT, L = Lc(c);
  const blink = (k: number) => 0.6 + 0.4 * (Math.sin(T * 6 + k) > -0.3 ? 1 : 0);
  return (
    <g opacity={(0.35 + 0.65 * lit) * (1 - 0.8 * gone)}>
      <Stars t={T} seed={66} n={10} x={120} y={40} w={840} h={80} color="#FF8A8A" size={0.7} />
      {/* la torre del casinò */}
      <path d="M360 470 V200 Q360 150 410 140 H670 Q720 150 720 200 V470 Z" {...L} fill={c.fill} strokeWidth="7" />
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 }, (_, k) => (
        <rect key={`${r}${k}`} x={390 + k * 64} y={190 + r * 50} width="40" height="28" rx="4" fill={(r + k) % 3 ? c.win2 : c.warm} opacity={(r + k) % 3 ? 0.7 : 0.5 + 0.3 * Math.sin(T * 2 + r + k)} />
      )))}
      <rect x="400" y="70" width="280" height="58" rx="12" {...L} fill={c.dark} strokeWidth="5" />
      <Glow id="rf2-neon" x={540} y={100} r={180} t={T} color={c.ink} amp={0.1} rate={4} opacity={0.5 * blink(0)} />
      <text x="540" y="112" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="38" letterSpacing="6" fill={c.ink} opacity={blink(0)}>CASINÒ</text>
      {/* l'ingresso con la stella */}
      <path d="M480 470 V400 H600 V470" {...L} fill={c.dark} strokeWidth="5" />
      <path d="M540 360 l10 22 l24 2 l-18 16 l6 24 l-22 -13 l-22 13 l6 -24 l-18 -16 l24 -2 Z" fill={c.warm} opacity={blink(2)} />
      {/* le case scure ai lati */}
      {[[130, 300], [230, 340], [760, 320], [860, 280]].map(([x, top], i) => (
        <g key={i}>
          <rect x={x} y={top} width="90" height={470 - top} {...L} fill={c.fill2} strokeWidth="4" />
          <path d={`M${x + 20} ${top + 40} l20 20 M${x + 60} ${top + 60} l-14 22`} {...L} stroke={c.dim} strokeWidth="3" />
        </g>
      ))}
      {/* il bidone che brucia e il fumo */}
      <rect x="840" y="420" width="50" height="50" {...L} fill={c.dark} strokeWidth="4" />
      <Fire id="rf2-fire" t={T} x={865} y={420} scale={0.3} outline={c.dark} />
      {[0, 1, 2].map((k) => {
        const u = mod(T * 0.25 + k / 3, 1);
        return <circle key={k} cx={865 + Math.sin(T + k) * 20 - u * 40} cy={380 - u * 260} r={20 + u * 40} fill="#2A1A20" opacity={0.6 * (1 - u)} />;
      })}
      <path d="M100 470 H980" {...L} strokeWidth="6" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${130 + i * 100} 500 h50`} stroke={c.dim} strokeWidth="4" />)}
    </g>
  );
};

/** 1885: un paese di legno nella valle (solo abbozzato finché Doc non ci arriva). */
const Art1885: React.FC<{ T: number; lit: number }> = ({ T, lit }) => {
  const c = P1885, L = Lc(c);
  const dash = lit > 0.5 ? undefined : '14 10';
  return (
    <g opacity={0.4 + 0.6 * lit}>
      <path d="M100 300 Q260 180 420 260 Q580 160 760 240 Q880 200 980 260" {...L} strokeWidth="4" strokeDasharray={dash} />
      <circle cx="830" cy="110" r="44" {...L} fill={lit > 0.5 ? '#F2C870' : 'none'} strokeWidth="4" strokeDasharray={dash} />
      {[[150, 'EMPORIO'], [400, 'HOTEL'], [650, 'FABBRO']].map(([x, name], i) => (
        <g key={i}>
          <path d={`M${x} 470 V320 H${(x as number) + 180} V470 M${x} 320 L${(x as number) + 20} 290 H${(x as number) + 160} L${(x as number) + 180} 320`} {...L} fill={lit > 0.5 ? c.fill2 : 'none'} strokeWidth="5" strokeDasharray={dash} />
          {lit > 0.5 && <text x={(x as number) + 90} y="312" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="20" letterSpacing="2" fill={c.ink}>{name}</text>}
          <path d={`M${(x as number) + 70} 470 V400 H${(x as number) + 110} V470`} {...L} strokeWidth="4" strokeDasharray={dash} />
        </g>
      ))}
      <path d="M100 470 H980" {...L} strokeWidth="5" strokeDasharray={dash} />
      {lit > 0.5 && Array.from({ length: 8 }, (_, i) => <circle key={i} cx={mod(130 + i * 120 + T * 25, 860) + 110} cy={490 + (i % 3) * 12} r={3 + (i % 2)} fill={c.dim} opacity=".6" />)}
      <text x="540" y="230" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="200" fill={c.ink} opacity={0.1 * (1 - lit)}>?</text>
    </g>
  );
};

// ---------------------------------------------------------------- lo schema

/** Cerchi e legami con le scritte nello stile della stazione in cui stanno (inchiostro sulle stazioni chiare). */
const Nd: React.FC<React.ComponentProps<typeof Node>> = (props) => <Node {...props} card={cardAt(props.p[1])} />;
const Ln: React.FC<React.ComponentProps<typeof Link>> = (props) => <Link {...props} card={cardAt((props.a[1] + props.b[1]) / 2)} />;

export const Schema: React.FC<{ T: number; cam?: { y: number; z: number } }> = ({ T, cam = camAt(T) }) => {
  const bandAt: Record<BandKey, number> = {
    casa: 0, futuro: at('futuro', 2, 1.0), piazza: at('furto', 1, 1.6), alt: at('casino', 0, 0.6), west: at('lettera', 3),
  };
  const off = (ch: string) => 1 - seg(T, end(ch) - 0.4, end(ch) + 0.3);
  // eventi principali
  const toss = eio(seg(T, at('almanacco', 2, 0.1), at('almanacco', 2, 0.8)));
  const grab = seg(T, at('almanacco', 3, 0.3), at('almanacco', 3, 0.8));
  const handed = eio(seg(T, at('furto', 2, 0.6), at('furto', 2, 1.4)));
  const jail = seg(T, at('griff', 3, 0.6), at('griff', 3, 1.0));
  const taken = eio(seg(T, at('fuoco', 1, 0.6), at('fuoco', 1, 1.3)));
  const burnT = at('fuoco', 2, 0.1);
  const burn = seg(T, burnT + 0.4, burnT + 1.6);
  const healed = seg(T, at('fuoco', 2, 0.9), at('fuoco', 2, 1.8));
  const boltT = at('lettera', 0, 0.6);
  const flash = flashAt(T, [boltT]);
  const carGone = T >= boltT + 0.3;
  const storm = seg(T, at('data', 2), at('data', 2, 1)) + (T > at('lettera', 0) - 1 ? 1 : 0);
  const westLit = seg(T, at('lettera', 3, 0.1), at('lettera', 3, 0.7));
  const altOn = seg(T, bandAt.alt, bandAt.alt + 0.6) * (1 - healed);

  // i viaggi: 1985 → 2015; il vecchio Biff 2015 → 1955 → 2015; 2015 → 1985 alternativo; alternativo → 1955; Doc → 1885
  const goF = `M${N.doc85[0] + 70} ${Y('casa', 520)} Q${RX} ${Y('casa', 520)} ${RX} ${Y('casa', 760)} L${RX} ${Y('futuro', 200)} Q${RX} ${Y('futuro', 330)} ${N.martyF[0] + 520} ${Y('futuro', 380)}`;
  const biffUp = `M${N.oldBiff[0]} ${N.oldBiff[1] - 70} Q${RX - 10} ${N.oldBiff[1] - 100} ${RX - 10} ${Y('futuro', 100)} L${RX - 10} ${Y('piazza', 700)} Q${RX - 10} ${Y('piazza', ROW)} ${N.oldBiff55[0] + 70} ${N.oldBiff55[1]}`;
  const biffDown = `M${N.oldBiff55[0] + 70} ${N.oldBiff55[1] + 30} Q${RX - 40} ${N.oldBiff55[1] + 30} ${RX - 40} ${Y('piazza', 800)} L${RX - 40} ${Y('futuro', 60)} Q${RX - 40} ${Y('futuro', ROW)} ${N.oldBiff[0] + 70} ${N.oldBiff[1]}`;
  const toAlt = `M${N.martyF[0]} ${N.martyF[1] - 70} Q${RAIL + 40} ${N.martyF[1] - 80} ${RAIL + 40} ${Y('futuro', 100)} L${RAIL + 40} ${Y('alt', 700)} Q${RAIL + 40} ${Y('alt', 470)} 300 ${Y('alt', 470)}`;
  const toPast = `M${N.lorraine[0] + 70} ${N.lorraine[1]} Q${RX} ${N.lorraine[1]} ${RX} ${Y('alt', 300)} L${RX} ${Y('piazza', 700)} Q${RX} ${Y('piazza', ROW)} ${N.ghost[0] + 70} ${N.ghost[1] - 40}`;
  const docBack = `M760 ${Y('piazza', 175)} Q${RX} ${Y('piazza', 120)} ${RX} ${Y('piazza', -60)} L${RX} ${Y('west', 700)} Q${RX} ${Y('west', ROW)} ${N.docWest[0] + 70} ${N.docWest[1]}`;

  const bookPos = (() => {
    // l'almanacco: vetrina del 2015 → cestino → mano del vecchio Biff → 1955 al giovane Biff → a Marty → fuoco
    if (T < at('almanacco', 2)) return { x: N.book[0], y: N.book[1], s: 1.3, k: pop(T, at('almanacco', 0, 0.2)) };
    if (T < at('furto', 1, 0.6)) {
      const tx = lerp(N.book[0], 920, toss), ty = lerp(N.book[1], Y('futuro', 430), toss) - Math.sin(toss * Math.PI) * 120;
      return { x: lerp(tx, N.oldBiff[0] - 10, grab), y: lerp(ty, N.oldBiff[1] - 120, grab), s: lerp(1.3, 0.8, Math.max(toss, grab)), k: 1 };
    }
    if (T < at('fuoco', 1, 0.6)) return { x: lerp(N.oldBiff55[0] - 10, N.biff55[0] + 10, handed), y: N.biff55[1] - 120, s: 0.8, k: seg(T, at('furto', 2, 0.1), at('furto', 2, 0.4)) };
    return { x: lerp(N.biff55[0] + 10, 700, taken), y: lerp(N.biff55[1] - 120, Y('piazza', 470), taken), s: lerp(0.8, 1.2, taken), k: 1 };
  })();

  return (
    <g>
      {/* la linea degli anni, con il ramo rosso del 1985 alternativo */}
      <path d={`M${RAIL} 380 V${Y('piazza', 780)}`} {...Lc(P85)} stroke={INK} strokeWidth="5" />
      <path d={`M${RAIL} ${Y('piazza', 780)} l-14 18 l28 18 l-28 18 l28 18 l-14 12`} fill="none" stroke={INK} strokeWidth="4" />
      <path d={`M${RAIL} ${Y('casa', -20)} V${Y('futuro', -60)}`} fill="none" stroke={INK} strokeWidth="5" />
      <path d={`M${RAIL} ${Y('futuro', -60)} l-14 18 l28 18 l-28 18 l28 18 l-14 12 V${Y('futuro', 800)}`} fill="none" stroke={INK} strokeWidth="4" />
      {altOn > 0 && (
        <g opacity={altOn}>
          <path d={`M${RAIL} ${Y('piazza', 760)} C${RAIL + 200} ${Y('piazza', 800)} ${ALT_X} ${Y('piazza', 820)} ${ALT_X} ${Y('casa', 100)} V${Y('alt', 0)}`} fill="none" stroke={RED} strokeWidth="9" strokeDasharray="30 18" strokeDashoffset={-T * 60} />
          <text x={ALT_X - 20} y={Y('casa', 60)} textAnchor="end" fontFamily={HAND} fontWeight={700} fontSize={fit(44)} fill={RED} stroke={DARK} strokeWidth="7" paintOrder="stroke">il binario deviato</text>
        </g>
      )}
      {(['west', 'piazza', 'casa', 'futuro'] as BandKey[]).map((k) => (
        <g key={k} transform={`translate(${RAIL} ${BAND[k].y0 + 10})`}>
          <rect x="-40" y="-26" width="80" height="52" rx="10" fill={Math.abs(cam.y - cy(k)) < 400 ? YEL : FILL} stroke={INK} strokeWidth="3" />
          <text y="11" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="28" fill={Math.abs(cam.y - cy(k)) < 400 ? DARK : INK}>{BAND[k].year}</text>
        </g>
      ))}

      {/* le stazioni */}
      {BANDS.map((b) => {
        const lit = b.key === 'alt' ? altOn : seg(T, bandAt[b.key], bandAt[b.key] + 0.6);
        const near = cam.z < 0.6 ? 1 : 1 - 0.7 * seg(Math.abs(cam.y - cy(b.key)), 430, 760);
        const sketch = b.key === 'west' || b.key === 'futuro' || b.key === 'alt';
        return (
          <g key={b.key} opacity={near}>
            <FrameBox b={b} c={PAL[b.key]} on={sketch ? lit : lit} focus={Math.abs(cam.y - cy(b.key)) < 300 ? 1 : 0} right={b.key === 'piazza'} />
            <g transform={`translate(0 ${b.y0})`} opacity={sketch ? 1 : 0.1 + 0.9 * lit}>
              {b.key === 'piazza' && <ArtPiazza c={P55} T={T} storm={Math.min(1, storm)} minutes={600 + 4 * seg(T, at('data', 2), boltT)} />}
              {b.key === 'casa' && <ArtCasa c={P85} T={T} bubbles={0} book={1} />}
              {b.key === 'futuro' && <Art2015 T={T} lit={lit} />}
              {b.key === 'alt' && <ArtCasino T={T} lit={seg(T, bandAt.alt, bandAt.alt + 0.6)} gone={healed} />}
              {b.key === 'west' && <Art1885 T={T} lit={westLit} />}
            </g>
          </g>
        );
      })}

      {/* ---- capitolo 1: Marty, Doc, Jennifer; il viaggio al 2015; il figlio nei guai */}
      <Nd T={T} t0={at('futuro', 0, 0.1)} p={N.marty85} name="Marty" sub="17 anni"><Skate T={T} /></Nd>
      <Nd T={T} t0={at('futuro', 0, 1.6)} p={N.doc85} name="Doc" sub="lo scienziato"><Goggles /></Nd>
      <Ln T={T} t0={at('futuro', 0, 2.0)} a={[N.marty85[0] + 62, N.marty85[1] - 10]} b={[N.doc85[0] - 62, N.doc85[1] - 10]} c={[375, N.marty85[1] - 90]} label="amici" ly={-12} fade={off('futuro')} />
      <Tag T={T} t0={at('futuro', 1, 0.2)} x={540} y={Y('casa', 470)} text="MACCHINA DEL TEMPO" size={34} until={at('futuro', 2, 0.3)} />
      <Nd T={T} t0={at('futuro', 2, 0.1)} p={N.jen85} name="Jennifer" sub="la sua ragazza" color="#F29AC0"><Note /></Nd>
      <Travel T={T} t0={at('futuro', 2, 0.5)} d={goF} id="rf2-goF" dur={1.4} label="30 anni avanti" lx={RX - 140} ly={Y('alt', 300)} labelUntil={at('futuro', 3, 0.4)} fade={1 - 0.75 * seg(T, end('futuro'), end('futuro') + 0.6)} />
      <Nd T={T} t0={at('futuro', 3, 0.1)} p={N.junior} name="il figlio" sub="di Marty" ring={seg(T, at('futuro', 3, 0.3), at('futuro', 3, 0.6)) * (1 - jail)} color={RED}><Cap /></Nd>
      <Tag T={T} t0={at('futuro', 3, 0.6)} x={N.junior[0]} y={N.junior[1] - 140} text="nei guai!" bg={RED} fg="#FFFFFF" size={34} rot={-3} until={end('futuro') - 0.2} />

      {/* ---- capitolo 2: Griff, la rapina, Marty al posto del figlio, Griff in prigione */}
      <Nd T={T} t0={at('griff', 0, 0.1)} p={N.griff} name="Griff" sub="un teppista" color={RED} dead={0}><Shades /></Nd>
      <Tag T={T} t0={at('griff', 0, 0.7)} x={N.griff[0]} y={N.griff[1] - 150} text="una rapina" bg={RED} fg="#FFFFFF" size={32} until={at('griff', 2, 0.2)} />
      <Ln T={T} t0={at('griff', 1, 0.2)} a={[N.griff[0] - 60, N.griff[1] - 14]} b={[N.junior[0] + 60, N.junior[1] - 14]} c={[510, N.griff[1] - 80]} color={RED} arrow label="lo vuole con sé" ly={-12} size={36} fade={1 - seg(T, at('griff', 2, 0.3), at('griff', 2, 0.7))} />
      <Nd T={T} t0={at('griff', 2, 0.1)} p={N.martyF} name="Marty" sub="al posto del figlio"><Skate T={T} /></Nd>
      <Ln T={T} t0={at('griff', 2, 0.5)} a={[N.martyF[0] + 60, N.martyF[1] - 20]} b={[N.griff[0] - 40, N.griff[1] - 56]} c={[400, N.martyF[1] - 200]} arrow label="dice di no" ly={-12} size={40} fade={off('griff')} />
      {jail > 0 && (
        <g transform={`translate(${N.griff[0]} ${N.griff[1]})`} opacity={jail}>
          <rect x="-70" y="-70" width="140" height="140" rx="10" fill="none" stroke={P15L.ink} strokeWidth="6" />
          {[-42, -14, 14, 42].map((x) => <path key={x} d={`M${x} -70 V70`} stroke={P15L.ink} strokeWidth="7" />)}
        </g>
      )}
      <Tag T={T} t0={at('griff', 3, 0.8)} x={N.griff[0]} y={N.griff[1] - 150} text="in prigione" size={32} until={end('griff') - 0.2} />
      <Tag T={T} t0={at('griff', 3, 1.4)} x={N.junior[0]} y={N.junior[1] - 140} text="salvo!" size={34} rot={3} until={end('griff') - 0.2} />

      {/* ---- capitolo 3: l'almanacco, le scommesse, il cestino, il vecchio Biff */}
      {T >= at('almanacco', 0, 0.2) && T < at('fuoco', 2, 1.8) && (
        <g transform={`translate(${bookPos.x} ${bookPos.y}) scale(${bookPos.k * bookPos.s})`} opacity={T > burnT ? 1 - burn : 1}>
          <Almanac T={T} burn={T > burnT ? burn : 0} />
        </g>
      )}
      <Tag T={T} t0={at('almanacco', 0, 1.0)} x={N.book[0]} y={N.book[1] - 150} text="50 anni di risultati" size={34} until={at('almanacco', 1, 0.3)} />
      <Coins T={T} x={N.book[0]} y={N.book[1] - 110} k={seg(T, at('almanacco', 1, 0.1), at('almanacco', 1, 0.4)) * (1 - seg(T, at('almanacco', 2), at('almanacco', 2, 0.3)))} />
      <Tag T={T} t0={at('almanacco', 1, 0.5)} x={N.book[0]} y={N.book[1] + 150} text="si vince sempre" size={32} until={at('almanacco', 2, 0.1)} />
      {T >= at('almanacco', 2) && T < end('almanacco') + 0.5 && (
        <g transform={`translate(920 ${Y('futuro', 470)})`} opacity={off('almanacco')}>
          <path d="M-40 -60 H40 L32 0 H-32 Z" fill="#CFE0E0" stroke={P15L.ink} strokeWidth="5" strokeLinejoin="round" />
          <path d="M-46 -64 H46" stroke={P15L.ink} strokeWidth="7" strokeLinecap="round" />
          {[-16, 0, 16].map((x) => <path key={x} d={`M${x} -50 V-8`} stroke={P15L.dim} strokeWidth="3" />)}
        </g>
      )}
      <Tag T={T} t0={at('almanacco', 2, 0.6)} x={800} y={Y('futuro', 330)} text="buttato via" size={30} until={at('almanacco', 3, 0.2)} />
      <Nd T={T} t0={at('almanacco', 3, 0.1)} p={N.oldBiff} name="Biff" sub="ormai vecchio" color={RED}><Cane /></Nd>
      <Tag T={T} t0={at('almanacco', 3, 0.9)} x={N.oldBiff[0] - 60} y={N.oldBiff[1] - 160} text="il bullo!" bg={RED} fg="#FFFFFF" size={32} rot={-3} until={end('almanacco') - 0.2} />

      {/* ---- capitolo 4: Jennifer, il furto, il viaggio al 1955, l'almanacco al giovane Biff */}
      <Tag T={T} t0={at('furto', 0, 0.3)} x={N.martyF[0] + 120} y={N.martyF[1] - 150} text="a riprendere Jennifer" size={30} until={at('furto', 1, 0.3)} />
      <Travel T={T} t0={at('furto', 1, 0.5)} d={biffUp} id="rf2-up" dur={1.2} label="il vecchio Biff nel 1955" lx={RX - 200} ly={Y('alt', 300)} labelUntil={at('furto', 2, 0.2)} fade={1 - 0.8 * seg(T, end('furto'), end('furto') + 0.6)} />
      <Nd T={T} t0={at('furto', 2, 0.1)} p={N.biff55} name="Biff" sub="da ragazzo" color={RED} fade={1 - seg(T, at('fuoco', 3), at('fuoco', 3, 0.5))}><Jacket /></Nd>
      <Nd T={T} t0={at('furto', 1, 1.6)} p={N.oldBiff55} name="il vecchio Biff" color={RED} fade={1 - seg(T, at('furto', 3, 0.4), at('furto', 3, 0.9))}><Cane /></Nd>
      <Ln T={T} t0={at('furto', 2, 0.5)} a={[N.oldBiff55[0] - 60, N.oldBiff55[1] - 14]} b={[N.biff55[0] + 60, N.biff55[1] - 14]} c={[395, N.biff55[1] - 70]} color={GOLD} arrow w={8} label="glielo dà" ly={-14} size={40} fade={off('furto')} />
      <Travel T={T} t0={at('furto', 3, 0.1)} d={biffDown} id="rf2-down" dur={1.2} fade={1 - 0.8 * seg(T, end('furto'), end('furto') + 0.6)} />
      <Tag T={T} t0={at('furto', 3, 1.2)} x={N.oldBiff[0] - 120} y={N.oldBiff[1] - 160} text="nessuno se ne accorge" size={30} until={end('furto') - 0.1} />

      {/* ---- capitolo 5: il 1985 alternativo */}
      <Travel T={T} t0={at('casino', 0, 0.1)} d={toAlt} id="rf2-alt" dur={1.2} label="di nuovo nel 1985" lx={RAIL + 200} ly={Y('futuro', -40)} labelUntil={at('casino', 1, 0.2)} fade={1 - 0.8 * seg(T, end('casino'), end('casino') + 0.6)} />
      <Nd T={T} t0={at('casino', 1, 0.1)} p={N.biffRich} name="Biff" sub="ricchissimo" color={RED} ring={(1 - healed) * seg(T, at('casino', 1, 0.3), at('casino', 1, 0.6))} fade={1 - seg(T, at('fuoco', 3, 0.8), at('fuoco', 3, 1.3))}><Jacket /></Nd>
      <Coins T={T} x={N.biffRich[0] + 10} y={N.biffRich[1] - 90} k={seg(T, at('casino', 1, 0.3), at('casino', 1, 0.6)) * (1 - healed)} />
      <Tag T={T} t0={at('casino', 2, 0.3)} x={540} y={Y('alt', 300)} text="al posto della torre" bg={RED} fg="#FFFFFF" size={34} rot={-2} until={end('casino') - 0.2} />
      <Nd T={T} t0={at('casino', 3, 0.1)} p={N.george} name="George" sub="il padre di Marty" dead={seg(T, at('casino', 3, 0.5), at('casino', 3, 0.8)) * (1 - healed)} fade={1 - seg(T, at('fuoco', 3, 0.8), at('fuoco', 3, 1.3)) * 0}><Notebook /></Nd>
      <Nd T={T} t0={at('casino', 3, 1.0)} p={N.lorraine} name="Lorraine" sub="la madre" color="#F29AC0" fade={1 - healed}><Bow /></Nd>
      <Ln T={T} t0={at('casino', 3, 1.3)} a={[N.biffRich[0] + 40, N.biffRich[1] - 56]} b={[N.lorraine[0] - 40, N.lorraine[1] - 56]} c={[540, N.biffRich[1] - 230]} color={GOLD} dashed label="sposata con Biff" ly={-14} size={38} fade={(1 - healed) * (1 - seg(T, end('binario'), end('binario') + 0.4))} />

      {/* ---- capitolo 6: il binario deviato */}
      <Tag T={T} t0={at('binario', 0, 0.8)} x={560} y={Y('piazza', 330)} text="nel 1955 il tempo ha cambiato strada" bg={RED} fg="#FFFFFF" size={34} until={at('binario', 2, 0.2)} />
      {T >= at('binario', 1, 0.1) && T < end('binario') + 0.4 && (() => {
        const k = eob(seg(T, at('binario', 1, 0.1), at('binario', 1, 0.6)), 1.6);
        const x = 520, y = Y('piazza', 830);
        return (
          <g transform={`translate(${x} ${y}) scale(${k * 3})`} opacity={off('binario')}>
            {/* lo scambio dei binari: la leva e i due binari che si separano */}
            <path d="M-80 0 H0 L90 -40 M0 0 L90 40" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
            <path d="M0 0 L90 40" fill="none" stroke={RED} strokeWidth="8" strokeLinecap="round" />
            {[-70, -40, -10, 30, 60].map((dx) => <path key={dx} d={`M${dx} -14 V14`} stroke={INK} strokeWidth="5" />)}
            <path d="M-30 30 L-10 -10" stroke={GOLD} strokeWidth="7" strokeLinecap="round" />
            <circle cx="-10" cy="-10" r="8" fill={RED} />
          </g>
        );
      })()}
      <Tag T={T} t0={at('binario', 1, 0.6)} x={560} y={Y('piazza', 640)} text="come un treno deviato" size={34} until={at('binario', 3, 0.1)} />
      <Ln T={T} t0={at('binario', 3, 0.2)} a={[ALT_X - 70, Y('alt', 60)]} b={[ALT_X - 70, Y('piazza', 560)]} c={[ALT_X - 220, Y('casa', 200)]} color={YEL} arrow w={10} label="tornare al 1955" lx={-60} size={50} fade={off('binario')} />

      {/* ---- capitolo 7: la data, la notte del ballo e del fulmine, il Marty del primo viaggio */}
      <Tag T={T} t0={at('data', 0, 0.3)} x={540} y={Y('piazza', 470)} text="in che giorno?" size={36} until={at('data', 1, 0.2)} />
      {T >= at('data', 1, 0.2) && T < end('data') + 0.5 && (
        <g transform={`translate(820 ${Y('piazza', 230)}) rotate(5) scale(${pop(T, at('data', 1, 0.2))})`} opacity={off('data')}>
          <rect x="-90" y="-110" width="180" height="220" rx="8" fill="#000" opacity=".35" transform="translate(6 8)" />
          <rect x="-90" y="-110" width="180" height="220" rx="8" fill="#FFFFFF" stroke={P55.ink} strokeWidth="5" />
          <rect x="-90" y="-110" width="180" height="56" rx="8" fill={RED} />
          <text y="-72" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="28" fill="#FFFFFF">NOVEMBRE</text>
          <text y="40" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="110" fill={P55.ink}>12</text>
          <text y="92" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="30" fill={P55.ink}>1955</text>
        </g>
      )}
      <Tag T={T} t0={at('data', 2, 0.3)} x={540} y={Y('piazza', 470)} text="la notte del fulmine" bg={RED} fg="#FFFFFF" size={34} until={at('data', 3, 0.2)} />
      <Travel T={T} t0={at('data', 3, 0.1)} d={toPast} id="rf2-past" dur={1.2} fade={1 - 0.8 * seg(T, end('fuoco'), end('fuoco') + 0.6)} />
      {T >= at('data', 3, 1.0) && T < end('fuoco') + 0.4 && (
        <g transform={`translate(${N.ghost[0]} ${N.ghost[1]})`} opacity={seg(T, at('data', 3, 1.0), at('data', 3, 1.4)) * off('fuoco')}>
          <circle r="54" fill="none" stroke={P55.ink} strokeWidth="4" strokeDasharray="10 8" />
          <g opacity=".55" transform="scale(1.1)"><Skate T={T} /></g>
          <text y="96" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={fit(30)} fill={P55.ink} stroke={P55.paper} strokeWidth="6" paintOrder="stroke">l'altro Marty</text>
        </g>
      )}

      {/* ---- capitolo 8: non farsi vedere, l'almanacco ripreso e bruciato, il 1985 che torna normale */}
      <Nd T={T} t0={at('fuoco', 0, 0.1)} p={N.martyP} name="Marty" sub="tornato dal futuro" fade={1 - seg(T, end('lettera') - 0.6, end('lettera'))}><Skate T={T} /></Nd>
      <Ln T={T} t0={at('fuoco', 0, 0.6)} a={[N.martyP[0] + 60, N.martyP[1] - 10]} b={[N.ghost[0] - 60, N.ghost[1] - 10]} c={[685, N.martyP[1] - 90]} color={RED} dashed label="non farsi vedere" ly={-12} size={36} cross={seg(T, at('fuoco', 0, 1.0), at('fuoco', 0, 1.3))} fade={off('fuoco')} />
      <Ln T={T} t0={at('fuoco', 1, 0.1)} a={[N.martyP[0] - 60, N.martyP[1] - 14]} b={[N.biff55[0] + 60, N.biff55[1] - 14]} c={[395, N.martyP[1] - 90]} color={YEL} arrow w={8} label="glielo strappa" ly={-14} size={38} fade={off('fuoco')} />
      {T >= burnT && T < burnT + 3.2 && (
        <g>
          <Fire id="rf2-burn" t={T} x={700} y={Y('piazza', 500)} scale={0.9 * eob(seg(T, burnT, burnT + 0.5), 1.4) * (1 - seg(T, burnT + 2.4, burnT + 3.2))} outline={P55.ink} />
          <Embers t={T} x={700} y={Y('piazza', 480)} w={60} h={300} seed={7} n={18} />
        </g>
      )}
      <Tag T={T} t0={at('fuoco', 2, 0.4)} x={700} y={Y('piazza', 230)} text="bruciato!" bg={RED} fg="#FFFFFF" size={40} rot={-3} until={end('fuoco') - 0.2} />
      <Tag T={T} t0={at('fuoco', 3, 0.3)} x={N.george[0]} y={N.george[1] - 150} text="George è vivo" size={34} until={end('fuoco') - 0.1} />

      {/* ---- capitolo 9: il fulmine sulla macchina con Doc, la lettera, il 1885 */}
      {!carGone && T >= at('data', 0) && (
        <g transform={`translate(${720 + Math.sin(T * 1.3) * 60} ${Y('piazza', 175) + Math.sin(T * 2.1) * 10}) rotate(${Math.sin(T * 1.7) * 6}) scale(.6)`}>
          <TimeCar T={T} glow={0.6} s={1} ink={P55.ink} />
        </g>
      )}
      {T >= boltT && T < boltT + 1.1 && (() => {
        const k = 1 - seg(T, boltT + 0.4, boltT + 1.1);
        const cx = 720 + Math.sin(boltT * 1.3) * 60;
        const d = `M930 ${Y('piazza', 70)} L860 ${Y('piazza', 100)} L890 ${Y('piazza', 112)} L800 ${Y('piazza', 140)} L830 ${Y('piazza', 150)} L${cx} ${Y('piazza', 175)}`;
        return (
          <g opacity={k * (0.75 + 0.25 * Math.sin(T * 60))}>
            <Glow id="rf2-bolt" x={cx} y={Y('piazza', 175)} r={240} t={T} color="#FFF6B0" amp={0.2} rate={30} opacity={0.9} />
            <path d={d} fill="none" stroke={P55.ink} strokeWidth="34" strokeLinejoin="round" strokeLinecap="round" />
            <path d={d} fill="none" stroke="#FFF6B0" strokeWidth="22" strokeLinejoin="round" strokeLinecap="round" />
          </g>
        );
      })()}
      <Tag T={T} t0={at('lettera', 1, 0.2)} x={600} y={Y('piazza', 170)} text="sparita!" bg={RED} fg="#FFFFFF" size={40} rot={3} until={at('lettera', 2, 0.1)} />
      <Tag T={T} t0={at('lettera', 1, 0.9)} x={N.martyP[0]} y={N.martyP[1] - 150} text="bloccato nel 1955" size={32} until={at('lettera', 2, 0.6)} />
      <Travel T={T} t0={at('lettera', 1, 0.4)} d={docBack} id="rf2-west" dur={1.2} label="70 anni indietro" lx={RX - 160} ly={Y('west', 900)} labelUntil={at('lettera', 2, 0.3)} />
      {T >= at('lettera', 2, 0.1) && (
        <g transform={`translate(760 ${Y('piazza', 470)}) rotate(-6) scale(${1.6 * pop(T, at('lettera', 2, 0.1))})`} opacity={1 - seg(T, end('lettera') - 0.4, end('lettera'))}>
          <rect x="-56" y="-36" width="112" height="72" fill="#F4EEDC" stroke={P55.ink} strokeWidth="4" />
          <path d="M-56 -36 L0 6 L56 -36" fill="none" stroke="#8A7A66" strokeWidth="3" />
          <circle cx="34" cy="16" r="12" fill={RED} />
          <text x="-14" y="26" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="20" fill={P55.ink}>da Doc · 1885</text>
        </g>
      )}
      <Nd T={T} t0={at('lettera', 3, 0.4)} p={N.docWest} name="Doc" sub="nel 1885: sta bene" subFill={YEL} ring={1}><Goggles /></Nd>
      <Tag T={T} t0={at('lettera', 3, 0.8)} x={540} y={Y('west', 180)} text="1885!" size={56} rot={-3} />

      {flash > 0 && <rect x="-3000" y="-3000" width="7000" height="14000" fill="#FFF6D8" opacity={0.35 * flash} />}
    </g>
  );
};

export const makeLinee2 = (chapterId: string): React.FC<SceneProps> => {
  const Scene: React.FC<SceneProps> = ({ t }) => {
    const T = STARTS[chapterId] + t;
    const c = camAt(T);
    setUi(c.z);
    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="r2" />
          <radialGradient id="r2-bg" cx=".5" cy=".46" r=".8">
            <stop offset="0" stopColor="#2E1E5C" />
            <stop offset=".6" stopColor="#1C1240" />
            <stop offset="1" stopColor="#0C0820" />
          </radialGradient>
          <linearGradient id="r2-scrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0C0820" stopOpacity=".96" />
            <stop offset=".82" stopColor="#0C0820" stopOpacity=".88" />
            <stop offset="1" stopColor="#0C0820" stopOpacity="0" />
          </linearGradient>
          <pattern id="r2-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 H0 V40" fill="none" stroke="#33255E" strokeWidth="1" /></pattern>
          <pattern id="r2-grid2" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M200 0 H0 V200" fill="none" stroke="#5A2E78" strokeWidth="2" /></pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#r2-bg)" />
        <g transform={`translate(540 900) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
          <rect x="-4000" y="-4000" width="9080" height="14000" fill="url(#r2-grid)" opacity=".55" />
          <rect x="-4000" y="-4000" width="9080" height="14000" fill="url(#r2-grid2)" opacity=".5" />
          <Schema T={T} cam={c} />
        </g>
        <rect width="1080" height="575" fill="url(#r2-scrim)" />
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={INK} opacity={0.1 + 0.07 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Finish id="r2" tint="#1A1238" tintOpacity={0.1} />
      </svg>
    );
  };
  return Scene;
};

export { cardAt, isWide, DIM, Lamp, H };
