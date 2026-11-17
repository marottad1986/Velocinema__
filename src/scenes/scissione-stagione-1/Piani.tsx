import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow, Stars } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/scissione-stagione-1.json';

// Scissione (stagione 1) come schema (formato "spiegato"): IL PIANO DIVISO, uno spaccato verticale.
// Sopra, FUORI: la vita privata degli esterni, una notte d'inverno a Kier (la casa di Mark, quella della vicina,
// l'edificio di Lumon, basso e bianco, generico: mai quello della serie). In mezzo la terra, il pozzo dell'ascensore e
// la LINEA DELLA SCISSIONE (verde-acqua, l'unico colore acceso: il chip). Sotto, SOTTO: la pianta del piano segreto,
// disegnata come un progetto d'architetto (Macrodati con le quattro scrivanie a croce, i corridoi a labirinto,
// la stanza del benessere, l'ufficio di Cobel, la sala di controllo con le due manopole).
// Vocabolario: cerchio con oggetto = personaggio; anello caldo = esterno (sopra), anello verde-acqua = interno (sotto);
// la linea che li unisce è interrotta sulla scissione (due metà che non si conoscono); linea piena = nessun chip (Cobel);
// cartellino pieno = colpo di scena; anello rosso = il nodo da capire (Casey). Il tratteggio giallo non c'è: in questa
// serie non si viaggia nel tempo.
// Passo avanti (ASTICELLA.md): il cerchio che si SDOPPIA attraversando la linea (due metà che si separano con un
// taglio a zig-zag) e che si RIUNISCE (Petey); la pianta che si disegna da sola come un progetto.
// Coordinate = mondo; la camera porta il punto (x, y) al centro dello schermo (540, 900) con zoom z.
// Gli eventi cadono sulla griglia della musica (72 bpm, crome), gli stessi istanti dello spartito.

export const INK = '#EEF3F1';
export const MINT = '#5FE3C2'; // il chip, gli interni, la linea della scissione
export const WARM = '#F2C48A'; // gli esterni, le finestre accese
export const RED = '#E8553F';
const DIM = '#7E9A9C';
const DARK = '#081417';
const PLAN = '#0E2E33';
const WALL = '#DDEBE8';
type P = readonly [number, number];

const FUORI = { y0: 420, y1: 1010 };
const GROUND = 920;
const CUT = 1250;
const SOTTO = { y0: 1490, y1: 2420 };
const X0 = 130, X1 = 950;
const SHAFT = 780;

const ROOM = {
  lobby: { x0: 690, y0: 1520, x1: 870, y1: 1630, name: 'ASCENSORE' },
  mdr: { x0: 150, y0: 1530, x1: 560, y1: 1960, name: 'MACRODATI' },
  benessere: { x0: 150, y0: 2000, x1: 420, y1: 2400, name: 'BENESSERE' },
  cobel: { x0: 440, y0: 2000, x1: 680, y1: 2400, name: 'UFFICIO DI COBEL' },
  controllo: { x0: 700, y0: 2000, x1: 950, y1: 2400, name: 'SALA DI CONTROLLO' },
} as const;

const N = {
  markOut: [245, 600], gemma: [395, 545],
  markIn: [235, 1680], hellyIn: [475, 1680], irvingIn: [235, 1860], dylanIn: [475, 1860],
  casey: [285, 2215], cobel: [560, 2215], knobs: [825, 2130], dylanCtl: [825, 2300],
  petey: [560, 560], selvig: [420, 640],
  hellyOut: [880, 585], irvingOut: [540, 610], dylanOut: [610, 600], figlio: [450, 650],
  chip: [230, CUT], lobby: [780, 1575], door: [780, 860],
} as const;

// ---------------------------------------------------------------- tempi dal JSON, sulla griglia della musica

const STARTS: Record<string, number> = {};
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
const end = (ch: string) => STARTS[ch] + film.capitoli.find((c) => c.id === ch)!.durata;
const pop = (T: number, t0: number) => eob(seg(T, t0, t0 + 0.45), 1.7);

// ---------------------------------------------------------------- camera

type Shot = { at: number; x: number; y: number; z: number };
const TOP = (z = 1.1, dx = 0, dy = 0) => ({ x: 540 + dx, y: 700 + dy, z });
const LOW = (z = 1.1, dx = 0, dy = 0) => ({ x: 540 + dx, y: 1950 + dy, z });
const WIDE = { x: 540, y: 1420, z: 0.4 };
const SHOTS: Shot[] = [
  { at: at('scissione', 0), ...TOP(1.1, 10, 30) },
  { at: at('scissione', 0, 1.6), x: 600, y: 1350, z: 0.62 },
  { at: at('scissione', 1), x: 420, y: 1250, z: 1.15 },
  { at: at('scissione', 2), x: 540, y: 1220, z: 0.74 },
  { at: at('scissione', 3), x: 540, y: 1400, z: 0.47 },
  // l'ascensore: il dipendente scende, si sdoppia, risale
  { at: at('ascensore', 0), x: 690, y: 1000, z: 1.05 },
  { at: at('ascensore', 0, 1.2), x: 690, y: 1230, z: 1.1 },
  { at: at('ascensore', 1), x: 680, y: 1400, z: 0.95 },
  { at: at('ascensore', 2), x: 680, y: 1250, z: 0.85 },
  { at: at('ascensore', 3), x: 640, y: 1260, z: 0.82 },
  // Mark: la casa, la foto, l'interno sotto
  { at: at('mark', 0), ...TOP(1.2, -170, -20) },
  { at: at('mark', 1), x: 380, y: 1150, z: 0.66 },
  { at: at('mark', 2), x: 380, y: 1600, z: 0.92 },
  // l'ufficio: Macrodati, i numeri, il benessere
  { at: at('ufficio', 0), x: 360, y: 1770, z: 1.25 },
  { at: at('ufficio', 1), x: 560, y: 1790, z: 1.0 },
  { at: at('ufficio', 2), x: 380, y: 2190, z: 1.2 },
  // Helly: arriva, il video dell'esterna, chiusa sotto
  { at: at('helly', 0), x: 560, y: 1700, z: 0.95 },
  { at: at('helly', 1), x: 740, y: 770, z: 1.12 },
  { at: at('helly', 2), x: 760, y: 790, z: 1.25 },
  { at: at('helly', 2, 1.0), x: 600, y: 1240, z: 0.62 },
  { at: at('helly', 3), x: 470, y: 1720, z: 1.1 },
  // Petey: fuori, le due metà riunite, la mappa, muore
  { at: at('petey', 0), ...TOP(1.18, 0, -40) },
  { at: at('petey', 1), ...TOP(1.3, 20, -80) },
  { at: at('petey', 2), ...TOP(1.15, -80, -40) },
  { at: at('petey', 2, 1.3), x: 720, y: 1760, z: 1.05 },
  { at: at('petey', 3), ...TOP(1.2, -20, -60) },
  // Cobel: sotto è la capa, la linea piena sale fino alla casa accanto
  { at: at('cobel', 0), ...LOW(1.05, 20, 240) },
  { at: at('cobel', 1), x: 600, y: 1600, z: 0.6 },
  { at: at('cobel', 1, 0.9), x: 620, y: 1230, z: 0.95 },
  { at: at('cobel', 2), ...TOP(1.15, -150, -10) },
  { at: at('cobel', 3), ...TOP(1.25, -200, 0) },
  // il risveglio: la sala di controllo, Dylan sale fino a casa sua
  { at: at('risveglio', 0), ...LOW(1.05, 280, 230) },
  { at: at('risveglio', 0, 2.0), x: 700, y: 1500, z: 0.5 },
  { at: at('risveglio', 1), x: 560, y: 780, z: 1.12 },
  { at: at('risveglio', 2), x: 560, y: 1450, z: 0.47 },
  // il piano: le manopole, tre interni che salgono, Helly sul palco
  { at: at('fuori', 0), ...LOW(1.1, 290, 240) },
  { at: at('fuori', 1), x: 560, y: 1220, z: 0.6 },
  { at: at('fuori', 2), x: 780, y: 700, z: 1.12 },
  { at: at('fuori', 3), x: 790, y: 720, z: 1.25 },
  // Casey: la foto, la linea rossa fino al benessere, tutto si spegne, lo schema intero
  { at: at('casey', 0), ...TOP(1.2, -170, -40) },
  { at: at('casey', 1), x: 330, y: 1450, z: 0.6 },
  { at: at('casey', 1, 1.1), x: 360, y: 2170, z: 1.15 },
  { at: at('casey', 2), x: 420, y: 2110, z: 1.08 },
  { at: at('casey', 3), x: 620, y: 2150, z: 0.95 },
  { at: at('casey', 4), x: 520, y: 1520, z: 0.5 },
];
let UI_K = 1;
let WIDEV = false;
const fit = (size: number) => Math.max(size, Math.min(size * UI_K, WIDEV ? 100 : 130));
const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.1));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: Math.exp(lerp(Math.log(o.z), Math.log(s.z), p)) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 5, z: o.z * (1 + 0.012 * Math.sin(T * 0.2)) };
};

// ---------------------------------------------------------------- oggetti dei personaggi (scala: raggio 44)

const S = { strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
/** Mark: la fede nuziale. */
export const Fede: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} {...S}>
    <ellipse cx="0" cy="4" rx="26" ry="14" fill="none" stroke={DARK} strokeWidth="14" />
    <ellipse cx="0" cy="4" rx="26" ry="14" fill="none" stroke="#D9A640" strokeWidth="9" />
    <path d="M-24 0 Q0 -14 24 0" fill="none" stroke="#FFE7A8" strokeWidth="3.5" />
    <path d="M-6 -22 L0 -32 L6 -22 L0 -14 Z" fill="#DDF4FF" stroke={DARK} strokeWidth="3" />
    <path d="M-16 -30 l-6 -6 M16 -30 l6 -6 M0 -38 v-6" stroke="#FFF6D8" strokeWidth="2.5" />
  </g>
);
/** Irving: il libretto delle regole (pagine a righe e una spunta). */
export const Regole: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} {...S}>
    <rect x="-24" y="-30" width="48" height="60" rx="4" fill="#E8EEF0" stroke={DARK} strokeWidth="4" />
    <rect x="-24" y="-30" width="10" height="60" fill="#2F6B6A" stroke={DARK} strokeWidth="3" />
    {[-16, -6, 4, 14].map((y) => <path key={y} d={`M-8 ${y} H16`} stroke="#6A8A8C" strokeWidth="3" />)}
    <path d="M2 18 l6 7 l12 -16" fill="none" stroke="#2F9C7A" strokeWidth="4.5" />
  </g>
);
/** Dylan: la coppa del premio. */
export const Coppa: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} {...S}>
    <path d="M-20 -26 H20 Q20 4 0 10 Q-20 4 -20 -26 Z" fill="#E8B84A" stroke={DARK} strokeWidth="4" />
    <path d="M-20 -20 Q-34 -20 -30 -6 Q-26 2 -14 2 M20 -20 Q34 -20 30 -6 Q26 2 14 2" fill="none" stroke={DARK} strokeWidth="4" />
    <path d="M-4 10 V20 H4 V10 M-14 20 H14 V28 H-14 Z" fill="#C8953A" stroke={DARK} strokeWidth="4" />
    <path d="M-12 -20 Q-12 -4 -2 2" fill="none" stroke="#FFF0C0" strokeWidth="3.5" />
  </g>
);
/** Casey: un fiore bianco (la stanza del benessere). */
export const Fiore: React.FC<{ s?: number; rot?: number }> = ({ s = 1, rot = 0 }) => (
  <g transform={`scale(${s})`} {...S}>
    <path d="M0 6 Q4 20 0 34" fill="none" stroke="#3E8A5E" strokeWidth="4" />
    <path d="M1 22 Q14 14 20 20 Q12 28 1 24" fill="#4FA070" stroke={DARK} strokeWidth="2.5" />
    <g transform={`translate(0 -6) rotate(${rot})`}>
      {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-14" rx="9" ry="14" fill="#F6F8F4" stroke={DARK} strokeWidth="3" transform={`rotate(${a})`} />)}
      <circle r="7" fill="#F2C14E" stroke={DARK} strokeWidth="2.5" />
    </g>
  </g>
);
/** Helly: la lettera di dimissioni. */
export const Lettera: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} {...S}>
    <path d="M-22 -30 H14 L24 -20 V30 H-22 Z" fill="#F4F2EA" stroke={DARK} strokeWidth="4" />
    <path d="M14 -30 V-20 H24" fill="#D8D4C8" stroke={DARK} strokeWidth="3" />
    {[-14, -5, 4].map((y) => <path key={y} d={`M-14 ${y} H14`} stroke="#8A9496" strokeWidth="3" />)}
    <path d="M-14 18 q5 -9 9 0 q4 8 9 -2 q3 -5 8 2" fill="none" stroke="#2A4A8A" strokeWidth="3" />
  </g>
);
/** Petey: la mappa piegata del piano. */
export const Mappa: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} {...S}>
    <path d="M-30 -22 L-10 -28 L10 -22 L30 -28 V24 L10 30 L-10 24 L-30 30 Z" fill="#E6DCC0" stroke={DARK} strokeWidth="4" />
    <path d="M-10 -28 V24 M10 -22 V30" stroke="#A89A78" strokeWidth="2.5" />
    <path d="M-22 16 Q-14 -6 0 4 Q12 12 18 -12" fill="none" stroke={RED} strokeWidth="3" strokeDasharray="4 5" />
    <path d="M14 -16 l8 8 M22 -16 l-8 8" stroke={RED} strokeWidth="3.5" />
  </g>
);
/** Cobel: il binocolo. */
export const Binocolo: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} {...S}>
    {[-15, 15].map((x) => (
      <g key={x}>
        <rect x={x - 11} y="-24" width="22" height="40" rx="6" fill="#2C3A40" stroke={DARK} strokeWidth="4" />
        <circle cx={x} cy="20" r="12" fill="#1A2428" stroke={DARK} strokeWidth="4" />
        <circle cx={x - 3} cy="17" r="4" fill="#BFE8F0" />
      </g>
    ))}
    <rect x="-6" y="-12" width="12" height="16" fill="#4A5A60" stroke={DARK} strokeWidth="3" />
  </g>
);
/** Un dipendente qualunque: il cartellino con la clip. */
export const Cartellino: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} {...S}>
    <rect x="-20" y="-24" width="40" height="52" rx="5" fill="#F0F4F2" stroke={DARK} strokeWidth="4" />
    <rect x="-8" y="-32" width="16" height="10" rx="3" fill="#9AB0B2" stroke={DARK} strokeWidth="3" />
    <rect x="-12" y="-14" width="24" height="18" rx="3" fill="#BFD8D4" />
    <path d="M-12 12 H12 M-12 20 H4" stroke="#6A8A8C" strokeWidth="3" />
  </g>
);
/** Il figlio di Dylan: una macchinina giocattolo. */
export const Macchinina: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} {...S}>
    <path d="M-30 10 V-2 L-18 -6 L-10 -20 H12 L22 -6 L30 -2 V10 Z" fill="#E86A4A" stroke={DARK} strokeWidth="4" />
    <path d="M-8 -16 H2 V-6 H-14 Z M6 -16 H10 L17 -6 H6 Z" fill="#BFE0F0" stroke={DARK} strokeWidth="2.5" />
    {[-17, 17].map((x) => <circle key={x} cx={x} cy="12" r="8" fill="#2A3034" stroke={DARK} strokeWidth="3" />)}
  </g>
);
/** Il chip: un quadratino con i piedini, verde-acqua. */
export const Chip: React.FC<{ s?: number; T: number }> = ({ s = 1, T }) => (
  <g transform={`scale(${s})`} {...S}>
    {[-14, -5, 4, 13].map((v) => (
      <g key={v} stroke={MINT} strokeWidth="3.5">
        <path d={`M${v} -24 v-9 M${v} 24 v9 M-24 ${v} h-9 M24 ${v} h9`} />
      </g>
    ))}
    <rect x="-24" y="-24" width="48" height="48" rx="6" fill="#123A3A" stroke={DARK} strokeWidth="4" />
    <rect x="-24" y="-24" width="48" height="48" rx="6" fill="none" stroke={MINT} strokeWidth="2.5" />
    <rect x="-11" y="-11" width="22" height="22" rx="3" fill={MINT} opacity={0.6 + 0.4 * Math.abs(Math.sin(T * 2.4))} />
    <path d="M-11 -11 L-4 -4 M11 11 L4 4" stroke={DARK} strokeWidth="2" />
  </g>
);

// ---------------------------------------------------------------- elementi dello schema

const R0 = 54;
type Half = 'esterno' | 'interno' | 'intero';
/**
 * Cerchio di un personaggio. `kind` sceglie l'anello (caldo = esterno, verde-acqua = interno, chiaro = senza chip).
 * `split` 0..1 sdoppia il cerchio: le due metà si separano con un taglio a zig-zag (quella sopra sale, quella sotto scende).
 */
const Node: React.FC<{
  T: number; t0: number; p: P; name: string; sub?: string; kind?: Half; ring?: number; r?: number; fade?: number; side?: 'below' | 'above';
  children?: React.ReactNode; size?: number; dead?: number; split?: number; off?: number; lock?: number; red?: boolean;
}> = ({ T, t0, p, name, sub, kind = 'intero', ring = 0, r = R0, fade = 1, side = 'below', children, size: size0 = 38, dead = 0, split = 0, off = 0, lock = 0, red }) => {
  if (T < t0 || fade <= 0) return null;
  const size = fit(size0);
  const s = pop(T, t0);
  const col = red ? RED : kind === 'esterno' ? WARM : kind === 'interno' ? MINT : INK;
  const ly = side === 'below' ? r + size + 6 : -r - (sub ? size * 0.95 + 18 : 18);
  const gap = split * 34;
  const zig = Array.from({ length: 9 }, (_, i) => `${-r - 4 + i * ((2 * r + 8) / 8)} ${i % 2 ? 7 : -7}`).join(' L');
  const clipT = `M${-r - 10} ${-r - 10} H${r + 10} V0 L${zig.split(' L').reverse().join(' L')} Z`;
  const clipB = `M${-r - 10} ${r + 10} H${r + 10} V0 L${zig.split(' L').reverse().join(' L')} Z`;
  const id = `sc-n${p[0]}${p[1]}`;
  const face = (
    <g>
      <circle r={r} fill="#10292E" stroke={ring > 0.5 ? (red ? RED : col) : col} strokeWidth={ring > 0.5 ? 7 : 4.5} />
      <circle r={r - 8} fill="none" stroke={col} strokeWidth="1.5" opacity=".35" />
      <g transform={`scale(${r / 46})`} opacity={1 - 0.6 * dead}>{children}</g>
    </g>
  );
  return (
    <g transform={`translate(${p[0]} ${p[1] + off})`} opacity={seg(T, t0, t0 + 0.15) * fade}>
      <g transform={`scale(${s})`}>
        {ring > 0 && <Glow id={`${id}g`} x={0} y={0} r={r * 2.4} t={T} color={red ? RED : col} amp={0.1} rate={2.4} opacity={0.5 * Math.min(1, ring)} />}
        {split <= 0 ? face : (
          <g>
            <defs>
              <clipPath id={`${id}t`}><path d={clipT} /></clipPath>
              <clipPath id={`${id}b`}><path d={clipB} /></clipPath>
            </defs>
            <g transform={`translate(${-split * 6} ${-gap})`} clipPath={`url(#${id}t)`}>{face}</g>
            <g transform={`translate(${split * 6} ${gap})`} clipPath={`url(#${id}b)`}>{face}</g>
            <path d={`M${zig}`.replace(/^M/, 'M')} fill="none" stroke={MINT} strokeWidth="3" opacity={Math.min(1, split * 3) * (1 - split * 0.6)} />
          </g>
        )}
        {dead > 0 && <path d={`M${-r * 0.55} ${-r * 0.55} L${r * 0.55} ${r * 0.55} M${r * 0.55} ${-r * 0.55} L${-r * 0.55} ${r * 0.55}`} stroke={DIM} strokeWidth="7" strokeLinecap="round" opacity={dead} />}
        {lock > 0 && (
          <g transform={`translate(${r * 0.72} ${r * 0.62}) scale(${eob(Math.min(1, lock), 1.8)})`} {...S}>
            <path d="M-11 -4 V-13 Q-11 -24 0 -24 Q11 -24 11 -13 V-4" fill="none" stroke={INK} strokeWidth="5" />
            <rect x="-16" y="-5" width="32" height="26" rx="5" fill={RED} stroke={DARK} strokeWidth="4" />
            <circle cy="7" r="3.5" fill={DARK} />
          </g>
        )}
      </g>
      {name && <text y={ly} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke" opacity={seg(T, t0 + 0.2, t0 + 0.5)}>{name}</text>}
      {sub && !WIDEV && <text y={ly + size * 0.85} textAnchor="middle" fontFamily={SANS} fontWeight={400} fontSize={size * 0.8} fill={kind === 'interno' ? '#A8EEDC' : kind === 'esterno' ? '#F6DDB8' : '#C8D6D4'} stroke={DARK} strokeWidth="5" paintOrder="stroke" opacity={seg(T, t0 + 0.3, t0 + 0.6)}>{sub}</text>}
    </g>
  );
};

/** Linea dello schema che si disegna (maschera). `flow` fa scorrere il tratteggio; `cut` la interrompe sulla scissione. */
const Link: React.FC<{ T: number; t0: number; a: P; b: P; c?: P; color?: string; dashed?: boolean; label?: string; arrow?: boolean; w?: number; lx?: number; ly?: number; size?: number; fade?: number; flow?: boolean; dur?: number; cut?: boolean }> = ({
  T, t0, a, b, c, color = INK, dashed = false, label, arrow = false, w = 6, lx = 0, ly = 0, size: size0 = 40, fade = 1, flow = false, dur = 0.6, cut = false,
}) => {
  const size = fit(size0);
  if (T < t0 || fade <= 0) return null;
  const p = eo(seg(T, t0, t0 + dur));
  const [mx, my] = c ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  const ang = (Math.atan2(b[1] - my, b[0] - mx) * 180) / Math.PI;
  const id = `sc-m${a[0]}${a[1]}${b[0]}${b[1]}`;
  const tx = 0.25 * a[0] + 0.5 * mx + 0.25 * b[0], ty = 0.25 * a[1] + 0.5 * my + 0.25 * b[1];
  return (
    <g opacity={fade}>
      <mask id={id} maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="9000">
        <path d={d} fill="none" stroke="#fff" strokeWidth={w + 10} pathLength={1} strokeDasharray={`${p} 1`} />
        {cut && <rect x="-2000" y={CUT - 34} width="6000" height="68" fill="#000" />}
      </mask>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dashed ? `${w * 3} ${w * 2.2}` : undefined} strokeDashoffset={flow ? -T * 60 : 0} strokeLinecap="round" mask={`url(#${id})`} />
      {arrow && p > 0.95 && <path d={`M${-w * 3.2} ${-w * 2.2} L0 0 L${-w * 3.2} ${w * 2.2}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`} />}
      {label && !WIDEV && (
        <text x={tx + lx} y={ty + ly} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={size} fill={color} stroke={DARK} strokeWidth="7" paintOrder="stroke" opacity={seg(T, t0 + 0.4, t0 + 0.8)}>{label}</text>
      )}
    </g>
  );
};

/** Cartellino pieno = colpo di scena o parola chiave. */
const Tag: React.FC<{ T: number; t0: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number; until?: number }> = ({
  T, t0, x, y, text, bg = MINT, fg = DARK, size: size0 = 34, rot = 0, until = 1e9,
}) => {
  const size = fit(size0);
  if (T < t0 || T > until + 0.5) return null;
  const w = text.length * size * 0.6 + size;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(T, t0)})`} opacity={1 - seg(T, until, until + 0.5)}>
      <rect x={-w / 2 + size * 0.12} y={-size * 0.95 + size * 0.12} width={w} height={size * 1.6} rx={size * 0.3} fill="#000" opacity=".35" />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.3} fill={bg} />
      <text y={size * 0.33} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};

/** Anello rosso = il nodo da capire. */
const Ring: React.FC<{ T: number; x: number; y: number; r: number; on: number }> = ({ T, x, y, r, on }) => {
  if (on <= 0) return null;
  const k = eob(Math.min(1, on), 1.6);
  return (
    <g opacity={Math.min(1, on)}>
      <circle cx={x} cy={y} r={r * k} fill="none" stroke={RED} strokeWidth="8" strokeDasharray={`${r * 0.5} ${r * 0.18}`} strokeDashoffset={-T * 40} />
      <circle cx={x} cy={y} r={r * k + 12} fill="none" stroke={RED} strokeWidth="2" opacity=".5" />
    </g>
  );
};

/** Neve dentro un riquadro: fiocchi tondi che scendono ondeggiando (far = piccoli e fitti, near = grandi e radi). */
export const Snow: React.FC<{ t: number; level?: 'far' | 'near'; seed?: number; n?: number; x?: number; y?: number; w?: number; h?: number; color?: string; wind?: number; opacity?: number }> = ({
  t, level = 'far', seed = 71, n, x = 0, y = 0, w = 1080, h = 1920, color = '#F2F6F8', wind = 18, opacity,
}) => {
  const r = rng(seed);
  const near = level === 'near';
  const count = n ?? (near ? 18 : 70);
  const op = opacity ?? (near ? 0.55 : 0.85);
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const bx = r() * w, ph = r(), sp = (near ? 150 : 55) * (0.7 + r() * 0.6), rad = near ? 5 + r() * 6 : 1.6 + r() * 2.4;
        const sw = (near ? 26 : 12) * (0.5 + r()), fr = 0.6 + r() * 0.8;
        const yy = mod(ph * h + t * sp, h);
        const xx = mod(bx + t * wind * (near ? 1.6 : 1) + Math.sin(t * fr + i) * sw, w);
        const edge = Math.min(1, yy / 40, (h - yy) / 40);
        return <circle key={i} cx={x + xx} cy={y + yy} r={rad} fill={color} opacity={op * edge * (near ? 0.7 + 0.3 * Math.sin(t * 2 + i) : 1)} />;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- FUORI: la notte d'inverno a Kier

const rr = rng(2022);
const STARS_TOWN = Array.from({ length: 16 }, (_, i) => ({ x: 140 + i * 52 + rr() * 20, h: 20 + rr() * 34, lit: rr() > 0.45 }));

/** Una casa a due piani con il tetto innevato; `win` = luce della finestra (0..1). */
const Casa: React.FC<{ T: number; x: number; w: number; h: number; win: number; id: string; curtain?: number; glint?: number }> = ({ T, x, w, h, win, id, curtain = 0, glint = 0 }) => {
  const top = GROUND - h;
  return (
    <g {...S}>
      {win > 0 && <Glow id={`${id}-w`} x={x + w * 0.32} y={top + h * 0.34} r={110} t={T} color={WARM} amp={0.08} rate={1.4} opacity={0.5 * win} />}
      <rect x={x} y={top} width={w} height={h} fill={`url(#sc-wall)`} stroke={INK} strokeWidth="5" />
      <path d={`M${x - 16} ${top + 4} L${x + w / 2} ${top - h * 0.42} L${x + w + 16} ${top + 4} Z`} fill="#2A3A48" stroke={INK} strokeWidth="5" />
      <path d={`M${x - 16} ${top + 4} L${x + w / 2} ${top - h * 0.42} L${x + w + 16} ${top + 4} L${x + w + 4} ${top - 6} L${x + w / 2} ${top - h * 0.42 + 12} L${x - 4} ${top - 6} Z`} fill="#F2F6F8" />
      {/* finestre: quella in alto a sinistra è accesa */}
      <rect x={x + w * 0.18} y={top + h * 0.2} width={w * 0.28} height={h * 0.28} fill={win > 0 ? '#F6D49A' : '#1E2C38'} opacity={win > 0 ? 0.35 + 0.65 * win : 1} stroke={INK} strokeWidth="4" />
      <path d={`M${x + w * 0.32} ${top + h * 0.2} V${top + h * 0.48} M${x + w * 0.18} ${top + h * 0.34} H${x + w * 0.46}`} stroke={DARK} strokeWidth="3" />
      {curtain > 0 && <path d={`M${x + w * 0.56} ${top + h * 0.2} h${w * 0.28 * curtain * 0.5} q-6 ${h * 0.14} 0 ${h * 0.28} h${-w * 0.28 * curtain * 0.5} Z`} fill="#8A6A5A" stroke={DARK} strokeWidth="2.5" />}
      <rect x={x + w * 0.56} y={top + h * 0.2} width={w * 0.28} height={h * 0.28} fill={glint > 0 ? '#3A3A30' : '#1E2C38'} stroke={INK} strokeWidth="4" />
      {glint > 0 && (
        <g transform={`translate(${x + w * 0.7} ${top + h * 0.34})`} opacity={glint}>
          <circle cx="-7" r="5" fill="#BFE8F0" />
          <circle cx="7" r="5" fill="#BFE8F0" />
          <path d={`M-14 0 h-${10 + 8 * Math.abs(Math.sin(T * 3))} M14 0 h${10 + 8 * Math.abs(Math.sin(T * 3))}`} stroke="#FFFFFF" strokeWidth="2.5" opacity={0.5 + 0.5 * Math.abs(Math.sin(T * 3))} />
        </g>
      )}
      <rect x={x + w * 0.4} y={GROUND - h * 0.36} width={w * 0.2} height={h * 0.36} fill="#3A2E2A" stroke={INK} strokeWidth="4" />
      <circle cx={x + w * 0.55} cy={GROUND - h * 0.18} r="3" fill={WARM} />
      <rect x={x + w * 0.66} y={top - h * 0.3} width="14" height={h * 0.2} fill="#3A4652" stroke={INK} strokeWidth="3" />
    </g>
  );
};

/** L'edificio di Lumon: basso, lungo e bianco, con la fascia di finestre scure (generico, mai quello della serie). */
const Lumon: React.FC<{ T: number; stage: number; dark: number }> = ({ T, stage, dark }) => {
  const x0 = 615, x1 = 945, top = 760;
  return (
    <g {...S}>
      <rect x={x0} y={top} width={x1 - x0} height={GROUND - top} fill="url(#sc-lumon)" stroke={INK} strokeWidth="6" />
      <rect x={x0 + 8} y={top - 22} width={x1 - x0 - 16} height="22" fill="#C8D2D0" stroke={INK} strokeWidth="5" />
      <rect x={x0 + 18} y={top + 34} width={x1 - x0 - 36} height="46" fill="#14262C" stroke={INK} strokeWidth="4" />
      {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${x0 + 18 + (i + 1) * ((x1 - x0 - 36) / 12)} ${top + 34} V${top + 80}`} stroke="#5A7A7E" strokeWidth="3" />)}
      {Array.from({ length: 11 }, (_, i) => (
        <rect key={`l${i}`} x={x0 + 22 + i * ((x1 - x0 - 36) / 12)} y={top + 40} width={(x1 - x0 - 36) / 12 - 8} height="34" fill={MINT} opacity={(1 - dark) * (0.08 + 0.1 * ((i * 7) % 3))} />
      ))}
      {/* l'ingresso a vetri sopra il pozzo dell'ascensore */}
      <rect x={SHAFT - 38} y={GROUND - 78} width="76" height="78" fill="#BFD8D4" opacity=".35" stroke={INK} strokeWidth="5" />
      <path d={`M${SHAFT} ${GROUND - 78} V${GROUND}`} stroke={INK} strokeWidth="4" />
      <path d={`M${SHAFT - 70} ${GROUND - 92} H${SHAFT + 70}`} stroke={INK} strokeWidth="6" />
      {/* il palco della festa (capitolo 9): leggio, microfono e il fascio del riflettore */}
      {stage > 0 && (
        <g opacity={stage}>
          <path d={`M640 ${GROUND - 330} L${SHAFT - 70} ${GROUND - 40} H${SHAFT + 70} Z`} fill="url(#sc-spot)" />
          <rect x={SHAFT - 110} y={GROUND - 34} width="220" height="34" fill="#4A3A5A" stroke={INK} strokeWidth="5" />
          <path d={`M${SHAFT - 24} ${GROUND - 34} L${SHAFT - 16} ${GROUND - 92} H${SHAFT + 16} L${SHAFT + 24} ${GROUND - 34} Z`} fill="#6A5A3A" stroke={INK} strokeWidth="4" />
          <path d={`M${SHAFT + 10} ${GROUND - 92} q10 -20 -4 -34`} fill="none" stroke={INK} strokeWidth="3.5" />
          <circle cx={SHAFT + 6} cy={GROUND - 128} r="6" fill="#2A3034" stroke={INK} strokeWidth="2.5" />
        </g>
      )}
      <Glow id="sc-lamp" x={598} y={GROUND - 150} r={70} t={T} color={WARM} amp={0.12} rate={1.8} opacity={0.6 * (1 - dark)} />
      <path d={`M598 ${GROUND} V${GROUND - 146} q0 -10 12 -10`} fill="none" stroke={INK} strokeWidth="5" />
      <circle cx="598" cy={GROUND - 148} r="7" fill={WARM} opacity={1 - dark * 0.8} />
    </g>
  );
};

const Fuori: React.FC<{ T: number; lit: number; selvig: number; stage: number; dark: number }> = ({ T, lit, selvig, stage, dark }) => {
  const { y0, y1 } = FUORI;
  return (
    <g>
      <rect x={X0} y={y0} width={X1 - X0} height={y1 - y0} rx="18" fill="url(#sc-sky)" />
      <g clipPath="url(#sc-clipF)">
        <Stars t={T} seed={22} n={24} x={X0 + 10} y={y0 + 40} w={X1 - X0 - 20} h={240} size={1} color="#DCE8F0" />
        {/* le colline lontane e le luci della città */}
        <path d={`M${X0} ${GROUND - 120} Q${X0 + 200} ${GROUND - 200} ${X0 + 420} ${GROUND - 140} Q${X0 + 620} ${GROUND - 90} ${X1} ${GROUND - 170} V${GROUND} H${X0} Z`} fill="#1A2C3A" />
        {STARS_TOWN.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={GROUND - 110 - b.h} width="24" height={b.h + 40} fill="#22384A" />
            {b.lit && <rect x={b.x + 8} y={GROUND - 100 - b.h} width="7" height="7" fill={WARM} opacity={0.5 * (1 - dark)} />}
          </g>
        ))}
        {/* alberi spogli */}
        {[[540, 0.9], [585, 0.7]].map(([x, k], i) => (
          <g key={i} stroke="#C8D6D4" strokeWidth={4 * k} fill="none" {...S}>
            <path d={`M${x} ${GROUND} V${GROUND - 150 * k} M${x} ${GROUND - 90 * k} L${x - 30 * k} ${GROUND - 140 * k} M${x} ${GROUND - 110 * k} L${x + 34 * k} ${GROUND - 160 * k} M${x} ${GROUND - 140 * k} L${x - 18 * k} ${GROUND - 180 * k}`} />
          </g>
        ))}
        <Casa T={T} x={170} w={150} h={150} win={lit} id="sc-cm" />
        <Casa T={T} x={360} w={130} h={128} win={0.35 * (1 - dark)} id="sc-cs" curtain={selvig} glint={selvig} />
        <Lumon T={T} stage={stage} dark={dark} />
        {/* la neve per terra, con i cumuli */}
        <path d={`M${X0} ${GROUND} Q${X0 + 120} ${GROUND - 14} ${X0 + 260} ${GROUND - 4} Q${X0 + 480} ${GROUND + 8} ${X0 + 620} ${GROUND - 8} Q${X0 + 740} ${GROUND - 16} ${X1} ${GROUND} V${y1} H${X0} Z`} fill="url(#sc-snow)" stroke={INK} strokeWidth="4" />
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${X0 + 30 + i * 58} ${GROUND + 34 + (i % 3) * 18} q14 -8 28 0`} stroke="#9AB4C0" strokeWidth="3" fill="none" />)}
        {/* l'auto parcheggiata davanti a Lumon, con il tetto innevato */}
        <g transform={`translate(880 ${GROUND + 44})`} {...S}>
          <path d="M-46 10 V-6 L-30 -10 L-20 -28 H18 L30 -10 L46 -6 V10 Z" fill="#3A5260" stroke={INK} strokeWidth="4" />
          <path d="M-20 -28 H18 L22 -22 H-23 Z" fill="#F2F6F8" />
          {[-26, 26].map((x) => <circle key={x} cx={x} cy="12" r="9" fill="#1A2428" stroke={INK} strokeWidth="3" />)}
        </g>
        <Snow t={T} x={X0} y={y0} w={X1 - X0} h={y1 - y0} seed={11} n={60} />
        <Snow t={T} level="near" x={X0} y={y0} w={X1 - X0} h={y1 - y0} seed={12} n={10} />
      </g>
      {dark > 0 && <rect x={X0} y={y0} width={X1 - X0} height={y1 - y0} rx="18" fill={DARK} opacity={0.55 * dark} />}
      <rect x={X0} y={y0} width={X1 - X0} height={y1 - y0} rx="18" fill="none" stroke={WARM} strokeWidth="4" opacity=".7" />
    </g>
  );
};

// ---------------------------------------------------------------- la terra, il pozzo, la linea della scissione

const Terra: React.FC<{ T: number; cab: number; cutOn: number; cutX: number; dark: number }> = ({ T, cab, cutOn, cutX, dark }) => {
  const y0 = FUORI.y1 + 10, y1 = SOTTO.y0 - 10;
  const rk = rng(77);
  return (
    <g {...S}>
      <rect x={X0} y={y0} width={X1 - X0} height={y1 - y0} fill="url(#sc-earth)" />
      {[1090, 1170, 1340, 1420].map((y, i) => <path key={y} d={`M${X0} ${y} Q${X0 + 300} ${y + (i % 2 ? 14 : -14)} ${X0 + 520} ${y} T${X1} ${y}`} stroke="#2E3A34" strokeWidth="3" fill="none" />)}
      {Array.from({ length: 16 }, (_, i) => {
        const x = X0 + 20 + rk() * (X1 - X0 - 40), y = y0 + 30 + rk() * (y1 - y0 - 60), s = 6 + rk() * 10;
        return Math.abs(x - SHAFT) < 70 || Math.abs(y - CUT) < 30 ? null : <path key={i} d={`M${x - s} ${y} l${s * 0.6} ${-s * 0.8} l${s * 0.9} ${s * 0.1} l${s * 0.5} ${s * 0.7} Z`} fill="#3A463E" />;
      })}
      {/* tubi e cavi che scendono */}
      <path d={`M${SHAFT + 60} ${y0} V${y1}`} stroke="#4A5A56" strokeWidth="8" />
      <path d={`M${SHAFT + 76} ${y0} V${y1}`} stroke="#3A4A46" strokeWidth="4" />
      {/* il pozzo dell'ascensore */}
      <rect x={SHAFT - 44} y={GROUND} width="88" height={SOTTO.y0 + 80 - GROUND} fill="#0A1A1E" stroke={INK} strokeWidth="5" />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${SHAFT - 44} ${GROUND + 40 + i * 52} h88`} stroke="#22383C" strokeWidth="2" />)}
      <path d={`M${SHAFT} ${GROUND} V${SOTTO.y0 + 80}`} stroke="#3A5054" strokeWidth="2" strokeDasharray="6 8" />
      {/* la cabina */}
      <g transform={`translate(${SHAFT} ${cab})`}>
        <Glow id="sc-cab" x={0} y={0} r={90} t={T} color="#E8F4F0" amp={0.08} rate={2} opacity={0.35 * (1 - dark)} />
        <rect x="-34" y="-44" width="68" height="88" rx="4" fill="#C8D6D4" stroke={INK} strokeWidth="5" />
        <path d="M0 -40 V40" stroke="#5A7276" strokeWidth="3" />
        <rect x="-26" y="-36" width="52" height="10" fill="#E8F4F0" opacity={0.7 * (1 - dark)} />
        <path d={`M0 -44 V${GROUND - cab}`} stroke="#8AA0A2" strokeWidth="2" />
      </g>
      {/* la linea della scissione: si disegna da sinistra a destra (capitolo 1), poi resta e pulsa */}
      {cutOn > 0 && (
        <g>
          <rect x={-300} y={CUT - 50} width={Math.max(0, cutX + 300)} height="100" fill="url(#sc-cutglow)" opacity={0.75 * cutOn * (1 - 0.6 * dark)} />
          <path d={`M-300 ${CUT} H${cutX}`} stroke={MINT} strokeWidth="8" strokeDasharray="34 14" strokeDashoffset={-T * 30} opacity={cutOn * (1 - 0.5 * dark)} />
          <path d={`M-300 ${CUT} H${cutX}`} stroke="#E8FFF8" strokeWidth="2" opacity={0.8 * cutOn * (1 - 0.6 * dark)} />
          {/* le forbici sulla punta della linea mentre taglia */}
          {cutX < 1360 && (
            <g transform={`translate(${cutX} ${CUT}) rotate(${Math.sin(T * 18) * 12})`} {...S}>
              <circle cx="-26" cy="-14" r="11" fill="none" stroke={INK} strokeWidth="5" />
              <circle cx="-26" cy="14" r="11" fill="none" stroke={INK} strokeWidth="5" />
              <path d="M-16 -8 L24 6 M-16 8 L24 -6" stroke={INK} strokeWidth="6" />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- SOTTO: la pianta del piano segreto

/** I corridoi a labirinto tra Macrodati e l'ascensore (pianta, linee bianche). */
const MAZE = 'M580 1660 H680 V1720 H620 V1800 H760 V1700 H860 V1640 M640 1960 V1860 H720 V1920 H820 V1780 H900 V1960 M560 1760 H600 M860 1860 H940';
/** I muri della pianta: un solo tracciato per stanza, così si disegnano in ordine. */
const roomPath = (r: { x0: number; y0: number; x1: number; y1: number }, door: 'top' | 'right' | 'left' = 'top') => {
  const { x0, y0, x1, y1 } = r;
  const m = (x0 + x1) / 2;
  if (door === 'top') return `M${m - 30} ${y0} H${x0} V${y1} H${x1} V${y0} H${m + 30}`;
  if (door === 'right') return `M${x1} ${(y0 + y1) / 2 - 30} V${y0} H${x0} V${y1} H${x1} V${(y0 + y1) / 2 + 30}`;
  return `M${x0} ${(y0 + y1) / 2 - 30} V${y0} H${x1} V${y1} H${x0} V${(y0 + y1) / 2 + 30}`;
};
const NUM = rng(4242);
const SCREEN_NUMS = Array.from({ length: 4 }, () => Array.from({ length: 12 }, () => Math.floor(NUM() * 10)));

const Sotto: React.FC<{ T: number; draw: number; mapGlow: number; scary: number; knobs: number; knobsOff: number; dark: number; caseyLamp: number }> = ({ T, draw, mapGlow, scary, knobs, knobsOff, dark, caseyLamp }) => {
  const { y0, y1 } = SOTTO;
  const wall = (d: string, k: number, w = 9) => (
    <path d={d} fill="none" stroke={WALL} strokeWidth={w} pathLength={1} strokeDasharray={`${eo(seg(draw, k, k + 0.35))} 1`} {...S} />
  );
  const lab = (r: (typeof ROOM)[keyof typeof ROOM], k: number) => (
    <text x={r.x0 + 14} y={r.name === 'MACRODATI' ? r.y0 - 12 : r.y0 + 32} fontFamily={SANS} fontWeight={900} fontSize="20" letterSpacing="2.5" fill="#9FD8CA" opacity={seg(draw, k + 0.2, k + 0.4)}>{r.name}</text>
  );
  const desks = [N.markIn, N.hellyIn, N.irvingIn, N.dylanIn];
  return (
    <g>
      <rect x={X0} y={y0} width={X1 - X0} height={y1 - y0} rx="18" fill={PLAN} />
      <rect x={X0} y={y0} width={X1 - X0} height={y1 - y0} rx="18" fill="url(#sc-blue)" />
      {/* la moquette verde di Macrodati */}
      <rect x={ROOM.mdr.x0} y={ROOM.mdr.y0} width={ROOM.mdr.x1 - ROOM.mdr.x0} height={ROOM.mdr.y1 - ROOM.mdr.y0} fill="#1F5A44" opacity={0.75 * seg(draw, 0.15, 0.4)} />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${ROOM.mdr.x0 + 20} ${ROOM.mdr.y0 + 50 + i * 46} h${ROOM.mdr.x1 - ROOM.mdr.x0 - 40}`} stroke="#2A6E54" strokeWidth="2" opacity={seg(draw, 0.2, 0.45)} />)}
      {/* i muri delle stanze e dei corridoi */}
      {wall(roomPath(ROOM.lobby), 0)}
      {wall(roomPath(ROOM.mdr, 'right'), 0.1)}
      {wall(MAZE, 0.25, 7)}
      {wall(roomPath(ROOM.benessere), 0.35)}
      {wall(roomPath(ROOM.cobel), 0.45)}
      {wall(roomPath(ROOM.controllo), 0.55)}
      {(Object.keys(ROOM) as (keyof typeof ROOM)[]).map((k, i) => <g key={k}>{lab(ROOM[k], [0, 0.1, 0.35, 0.45, 0.55][i])}</g>)}
      {/* il tracciato della mappa di Petey (capitolo 6): i corridoi si illuminano */}
      {mapGlow > 0 && <path d={MAZE} fill="none" stroke={RED} strokeWidth="4" strokeDasharray="10 9" strokeDashoffset={-T * 40} opacity={mapGlow} />}
      {/* l'ascensore visto dall'alto */}
      <g transform={`translate(${N.lobby[0]} ${N.lobby[1]})`} opacity={seg(draw, 0.05, 0.3)} {...S}>
        <rect x="-34" y="-34" width="68" height="68" fill="#1A3A40" stroke={WALL} strokeWidth="5" />
        <path d="M-34 -34 L34 34 M34 -34 L-34 34" stroke={WALL} strokeWidth="3" opacity=".6" />
      </g>
      {/* Macrodati: il divisorio a croce e le quattro scrivanie con lo schermo */}
      <g opacity={seg(draw, 0.2, 0.45)} {...S}>
        <path d={`M355 1590 V1940 M170 1770 H540`} stroke={WALL} strokeWidth="6" />
        {desks.map((d, i) => {
          const sx = d[0] + (i % 2 ? -62 : 62) * 0, sy = d[1] + (i < 2 ? 46 : -46);
          return (
            <g key={i}>
              <rect x={d[0] - 62} y={d[1] - 40} width="124" height="80" rx="6" fill="#E4ECEA" opacity=".18" stroke={WALL} strokeWidth="3" />
              <g transform={`translate(${sx} ${sy})`}>
                <Glow id={`sc-scr${i}`} x={0} y={0} r={60} t={T + i} color={MINT} amp={0.1} rate={2} opacity={0.4 * (1 - dark)} />
                <rect x="-40" y="-12" width="80" height="24" rx="4" fill="#0A2224" stroke={MINT} strokeWidth="3" />
                {SCREEN_NUMS[i].slice(0, 6).map((n, j) => {
                  const bad = scary > 0 && (j + i) % 3 === 0;
                  const jx = bad ? Math.sin(T * 30 + j) * 2.5 * scary : 0;
                  const gone = bad ? seg(scary, 0.6, 1) : 0;
                  return (
                    <text key={j} x={-32 + j * 13 + jx} y={6 - gone * 30} fontFamily={SANS} fontWeight={800} fontSize="15" fill={bad && scary > 0.2 ? RED : MINT} opacity={(0.9 - gone) * (1 - dark * 0.7)}>{n}</text>
                  );
                })}
              </g>
            </g>
          );
        })}
      </g>
      {/* benessere: due poltrone, la pianta, il quadro di un prato, la lampada calda */}
      <g opacity={seg(draw, 0.4, 0.6)} {...S}>
        <Glow id="sc-wl" x={380} y={2060} r={130} t={T} color="#F6E2B0" amp={0.1} rate={1.2} opacity={0.45 * caseyLamp * (1 - dark)} />
        <circle cx="380" cy="2060" r="14" fill="#F6E2B0" stroke={WALL} strokeWidth="3" opacity={0.5 + 0.5 * caseyLamp} />
        {[[200, 2330], [370, 2330]].map(([x, y], i) => <rect key={i} x={x - 30} y={y - 26} width="60" height="52" rx="12" fill="#6A8A7C" stroke={WALL} strokeWidth="4" />)}
        <rect x="180" y="2040" width="120" height="70" fill="#7AB07A" stroke={WALL} strokeWidth="4" />
        <path d="M180 2090 Q220 2070 250 2085 Q275 2095 300 2080 V2110 H180 Z" fill="#4A8A5A" />
        <circle cx="270" cy="2058" r="9" fill="#F2E08A" />
        <g transform="translate(390 2380)">
          <path d="M0 0 Q-16 -30 -6 -44 M0 0 Q14 -26 10 -40 M0 0 V-46" stroke="#4FA070" strokeWidth="5" fill="none" />
          <path d="M-14 0 H14 L10 20 H-10 Z" fill="#8A6A4A" stroke={WALL} strokeWidth="3" />
        </g>
      </g>
      {/* l'ufficio di Cobel: scrivania, lampada, schedario */}
      <g opacity={seg(draw, 0.5, 0.7)} {...S}>
        <rect x="480" y="2290" width="160" height="60" rx="5" fill="#5A4A3A" stroke={WALL} strokeWidth="4" />
        <circle cx="500" cy="2306" r="9" fill={WARM} opacity={0.8 * (1 - dark)} />
        <rect x="630" y="2040" width="36" height="90" fill="#4A5A5E" stroke={WALL} strokeWidth="3" />
        {[2062, 2090, 2118].map((y) => <path key={y} d={`M640 ${y} h16`} stroke={WALL} strokeWidth="3" />)}
      </g>
      {/* la sala di controllo: il quadro con le due manopole */}
      <g opacity={seg(draw, 0.6, 0.8)} {...S}>
        <rect x="735" y="2070" width="180" height="110" rx="8" fill="#2A3A40" stroke={WALL} strokeWidth="4" />
        {[-45, 45].map((dx, i) => {
          const on = knobs * (1 - knobsOff);
          return (
            <g key={i} transform={`translate(${N.knobs[0] + dx} ${N.knobs[1]})`}>
              {on > 0 && <Glow id={`sc-k${i}`} x={0} y={0} r={70} t={T + i} color={MINT} amp={0.15} rate={4} opacity={0.6 * on} />}
              <circle r="26" fill={on > 0.5 ? MINT : '#4A5A5E'} stroke={WALL} strokeWidth="4" />
              <path d={`M0 0 L${Math.sin(-1.2 + 2.4 * on) * 20} ${-Math.cos(-1.2 + 2.4 * on) * 20}`} stroke={DARK} strokeWidth="6" />
              <circle r="5" fill={DARK} />
            </g>
          );
        })}
        {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={760 + i * 32} cy="2165" r="5" fill={i % 2 ? RED : MINT} opacity={(0.4 + 0.5 * Math.abs(Math.sin(T * 2 + i))) * (1 - dark)} />)}
      </g>
      {dark > 0 && <rect x={X0} y={y0} width={X1 - X0} height={y1 - y0} rx="18" fill={DARK} opacity={0.6 * dark} />}
      <rect x={X0} y={y0} width={X1 - X0} height={y1 - y0} rx="18" fill="none" stroke={MINT} strokeWidth="4" opacity=".7" />
    </g>
  );
};

/**
 * La lente sullo schermo di Macrodati (capitolo 4): una griglia di numeri ingranditi; un gruppo trema, diventa rosso
 * e vola nel cestino, che si chiude. Collegata con un tratto alla scrivania di Mark.
 */
const LENTE_N = Array.from({ length: 21 }, () => Math.floor(NUM() * 10));
const Lente: React.FC<{ T: number; t0: number; until: number }> = ({ T, t0, until }) => {
  if (T < t0 || T > until + 0.5) return null;
  const k = pop(T, t0) * (1 - seg(T, until, until + 0.5));
  const cx = 760, cy = 1790, w = 330, h = 220;
  const bad = (i: number) => [3, 4, 10, 11, 17].includes(i);
  const shake = seg(T, t0 + 2 * CROMA, t0 + 2 * CROMA + 0.4);
  const fly = eio(seg(T, t0 + 7 * CROMA - 0.8, t0 + 7 * CROMA));
  const bin: P = [cx + 110, cy + 175];
  return (
    <g opacity={Math.min(1, k)} {...S}>
      <path d={`M${N.markIn[0] + 70} ${N.markIn[1] + 30} L${cx - w / 2} ${cy - 40}`} stroke={MINT} strokeWidth="3" strokeDasharray="8 8" opacity=".7" />
      <g transform={`translate(${cx} ${cy}) scale(${k})`}>
        <Glow id="sc-lente" x={0} y={0} r={240} t={T} color={MINT} amp={0.08} rate={2} opacity={0.35} />
        <rect x={-w / 2 - 14} y={-h / 2 - 14} width={w + 28} height={h + 28} rx="20" fill="#C8D6D4" stroke={DARK} strokeWidth="6" />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="10" fill="#071A1C" stroke={DARK} strokeWidth="4" />
        <path d={`M${-w / 2 + 10} ${-h / 2 + 30} H${w / 2 - 10}`} stroke={MINT} strokeWidth="2" opacity=".5" />
        <text x={-w / 2 + 14} y={-h / 2 + 22} fontFamily={SANS} fontWeight={800} fontSize="15" fill={MINT} opacity=".8">FILE 07 · 64%</text>
        {LENTE_N.map((n, i) => {
          const x = -w / 2 + 34 + (i % 7) * 44, y = -h / 2 + 76 + Math.floor(i / 7) * 54;
          const b = bad(i);
          const jx = b ? Math.sin(T * 34 + i) * 4 * shake * (1 - fly) : 0, jy = b ? Math.cos(T * 29 + i) * 3 * shake * (1 - fly) : 0;
          const tx = b ? lerp(x, bin[0] - cx, fly) : x, ty = b ? lerp(y, bin[1] - cy - 10, fly) - Math.sin(fly * Math.PI) * 60 : y;
          const sz = b ? 34 * (1 + 0.25 * shake) * (1 - 0.7 * fly) : 30;
          return <text key={i} x={tx + jx} y={ty + jy} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={sz} fill={b && shake > 0.3 ? RED : MINT} opacity={b ? 1 - seg(fly, 0.85, 1) : 0.85}>{n}</text>;
        })}
        {/* il cestino */}
        <g transform={`translate(${bin[0] - cx} ${bin[1] - cy})`}>
          <path d="M-34 -18 H34 L28 34 H-28 Z" fill="#9AB0B2" stroke={DARK} strokeWidth="5" />
          <path d="M-14 -10 V26 M0 -10 V26 M14 -10 V26" stroke={DARK} strokeWidth="3" />
          <rect x="-40" y="-30" width="80" height="12" rx="4" fill="#C8D6D4" stroke={DARK} strokeWidth="4" transform={`rotate(${-30 * (1 - seg(fly, 0.9, 1)) * Math.min(1, shake * 2)} -40 -24)`} />
        </g>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- lo schema

const r = rng(9);
const MOTES = Array.from({ length: 22 }, () => ({ x: r() * 1080, y: r() * 1920, s: 1.5 + r() * 3, v: 4 + r() * 10, ph: r() * 6 }));

/** Posizione della cabina: in alto (ingresso), giù (atrio del piano), con le corse dei capitoli 2 e 5. */
const cabAt = (T: number) => {
  const up = GROUND - 44, down = SOTTO.y0 + 40;
  const moves: [number, number, number, number][] = [
    [at('ascensore', 0, 0.3), at('ascensore', 1, -0.1), up, down],
    [at('ascensore', 2, 0), at('ascensore', 2, 1.4), down, up],
    [at('helly', 0, 0), at('helly', 0, 1.2), up, down],
    [at('helly', 0, 1.6), at('helly', 1, 0.2), down, up],
  ];
  let y = up;
  for (const [a, b, f, t] of moves) if (T >= a) y = lerp(f, t, eio(seg(T, a, b)));
  return y;
};

export const Schema: React.FC<{ T: number }> = ({ T }) => {
  const focus = (t0: number, t1: number) => seg(T, t0, t0 + 0.3) * (1 - seg(T, t1, t1 + 0.4));
  const off = (ch: string) => 1 - seg(T, end(ch) - 0.4, end(ch) + 0.3);
  // il finale: Dylan viene fermato, le manopole si spengono e tutto il fuori torna buio
  const tOff = at('casey', 3, 0.3);
  const dark = seg(T, tOff, tOff + 0.5) * (1 - 0.6 * seg(T, at('casey', 4, 0), at('casey', 4, 0.8)));
  const cutX = lerp(-300, 1400, eio(seg(T, at('scissione', 2, 0), at('scissione', 2, 1.6))));
  const cutOn = T >= at('scissione', 2, 0) ? 1 : 0;
  const draw = seg(T, at('scissione', 0, 1.4), at('scissione', 0, 3.4));
  // le due metà "senza porta": a turno si accende una sola (capitolo 1, frase 4)
  const alt = T >= at('scissione', 3, 0) && T < end('scissione') ? (Math.floor((T - at('scissione', 3, 0)) / (2 * CROMA * 2)) % 2) : -1;
  const dimF = alt === 1 ? 0.5 : 0, dimS = alt === 0 ? 0.5 : 0;
  const cab = cabAt(T);
  const lit = 1 - 0.6 * seg(T, tOff, tOff + 0.5);

  // ---- il dipendente qualunque del capitolo 2: scende con la cabina, si sdoppia sulla linea
  const g0 = at('ascensore', 0, 0.1);
  const gSplit = eo(seg(T, at('ascensore', 0, 1.3), at('ascensore', 0, 1.3) + 0.6));
  const gFade = 1 - seg(T, end('ascensore') - 0.3, end('ascensore') + 0.3);

  // ---- Petey: le due metà si riuniscono (capitolo 6)
  const pJoin = eio(seg(T, at('petey', 1, 0.2), at('petey', 1, 1.4)));
  const pDead = seg(T, at('petey', 3, 0.6), at('petey', 3, 1.0));

  // ---- capitolo 8 e 9: gli interni che salgono fuori
  const dUp = eio(seg(T, at('risveglio', 1, -0.6), at('risveglio', 1, 0.6)));
  const dDown = eio(seg(T, at('risveglio', 2, 0.6), at('risveglio', 2, 1.4)));
  const wake = eio(seg(T, at('fuori', 1, 0), at('fuori', 1, 1.3)));
  const knobs = Math.max(eo(seg(T, at('risveglio', 0, 0.2), at('risveglio', 0, 0.6))) * (1 - seg(T, at('risveglio', 2, 0.6), at('risveglio', 2, 1.0))), eo(seg(T, at('fuori', 0, 0.2), at('fuori', 0, 0.6))));
  const knobsOff = seg(T, tOff, tOff + 0.3);
  const back = eio(seg(T, tOff, tOff + 0.9)); // gli interni tornano giù quando le manopole si spengono

  return (
    <g>
      {/* le intestazioni delle due metà */}
      {[
        { y: FUORI.y0 - 58, text: 'FUORI · LA VITA DEGLI ESTERNI', col: WARM },
        { y: SOTTO.y0 - 58, text: 'SOTTO · IL LAVORO DEGLI INTERNI', col: MINT },
      ].map((h, i) => (
        <g key={i} opacity={seg(T, at('scissione', i === 0 ? 0 : 2, 0.2), at('scissione', i === 0 ? 0 : 2, 0.6))}>
          <rect x={X0} y={h.y - 30} width={h.text.length * 17.5 + 30} height="44" rx="6" fill={DARK} opacity=".85" />
          <text x={X0 + 15} y={h.y + 2} fontFamily={SANS} fontWeight={900} fontSize="26" letterSpacing="2.5" fill={h.col}>{h.text}</text>
        </g>
      ))}
      <g opacity={1 - dimF}><Fuori T={T} lit={lit} selvig={focus(at('cobel', 3, 0), end('cobel'))} stage={focus(at('fuori', 3, 0), end('fuori') + 0.4)} dark={dark} /></g>
      <Terra T={T} cab={cab} cutOn={cutOn} cutX={cutX} dark={dark} />
      <g opacity={1 - dimS}>
        <Sotto T={T} draw={draw} mapGlow={focus(at('petey', 2, 0.4), end('petey') - 0.2)} scary={seg(T, at('ufficio', 1, 0.2), at('ufficio', 1, 1.6)) * (1 - seg(T, end('ufficio'), end('ufficio') + 0.5))}
          knobs={knobs} knobsOff={knobsOff} dark={dark} caseyLamp={focus(at('ufficio', 2, 0), end('ufficio')) + focus(at('casey', 1, 0.3), at('casey', 3, 0.3))} />
      </g>

      {/* ---- capitolo 1: Lumon, il chip, la linea */}
      <Tag T={T} t0={at('scissione', 0, 0.3)} x={780} y={700} text="LUMON" bg={INK} size={40} rot={-2} until={at('scissione', 1, -0.2)} />
      <Tag T={T} t0={at('scissione', 0, 1.8)} x={540} y={SOTTO.y0 + 60} text="IL PIANO SEGRETO" size={38} rot={2} until={at('scissione', 1, 0)} />
      {(() => {
        const t0 = at('scissione', 1, 0.2);
        if (T < t0) return null;
        const s = pop(T, t0) * (1.3 - 0.45 * eio(seg(T, at('scissione', 2, 0), at('scissione', 3, 0))));
        return (
          <g transform={`translate(${N.chip[0]} ${N.chip[1]}) scale(${s})`}>
            <Glow id="sc-chipg" x={0} y={0} r={130} t={T} color={MINT} amp={0.12} rate={3} opacity={0.6} />
            <circle r="62" fill="#10292E" stroke={MINT} strokeWidth="5" />
            <Chip T={T} s={1.2} />
          </g>
        );
      })()}
      <Tag T={T} t0={at('scissione', 1, 0.5)} x={560} y={CUT - 120} text="UN CHIP NEL CERVELLO" size={36} rot={-2} until={at('scissione', 2, 0.2)} />
      <Tag T={T} t0={at('scissione', 3, 0.3)} x={600} y={CUT - 4} text="LA SCISSIONE" size={60} rot={-2} until={end('scissione') - 0.2} />

      {/* ---- capitolo 2: il dipendente qualunque scende, si sdoppia, l'esterno risale */}
      {T >= g0 && gFade > 0 && (() => {
        const inside = T < at('ascensore', 2, 0) ? cab : SOTTO.y0 + 40;
        const outY = T < at('ascensore', 2, 0) ? Math.max(cab, 0) : cab;
        const splitDone = gSplit >= 1;
        const off = seg(T, at('ascensore', 0, 0.2), at('ascensore', 1, -0.3));
        return (
          <g>
            {!splitDone && <Node T={T} t0={g0} p={[SHAFT, Math.min(cab, CUT)]} name="" split={gSplit} ring={0} fade={gFade} kind="intero"><Cartellino /></Node>}
            {splitDone && (
              <>
                <Node T={T} t0={g0} p={[SHAFT - 140, T < at('ascensore', 2, 0) ? CUT - 150 : outY]} name="ESTERNO" sub={T >= at('ascensore', 2, 0) ? 'la persona di sempre' : 'spento'} kind="esterno" ring={focus(at('ascensore', 2, 0.6), end('ascensore'))} fade={gFade * (T < at('ascensore', 2, 0) ? 0.45 : 1)}><Cartellino /></Node>
                <Node T={T} t0={g0} p={[SHAFT - 140, inside + 60]} name="INTERNO" sub="conosce solo l'ufficio" kind="interno" ring={focus(at('ascensore', 1, 0), at('ascensore', 2, 0))} fade={gFade * (T < at('ascensore', 2, 0) ? 1 : 0.45)}><Cartellino /></Node>
              </>
            )}
            {void off}
          </g>
        );
      })()}
      <Tag T={T} t0={at('ascensore', 0, 1.0)} x={560} y={CUT - 70} text="SI SPEGNE" bg={INK} size={34} rot={-3} until={at('ascensore', 1, 0)} />
      <Link T={T} t0={at('ascensore', 3, 0.1)} a={[SHAFT - 140, GROUND - 100]} b={[SHAFT - 140, SOTTO.y0 + 60]} c={[SHAFT - 230, CUT]} dashed cut color={DIM} w={5} fade={off('ascensore')} />
      <Tag T={T} t0={at('ascensore', 3, 0.3)} x={420} y={CUT + 2} text="NON RICORDA NIENTE" bg={RED} fg={INK} size={36} rot={-2} until={end('ascensore') - 0.2} />

      {/* ---- Mark: esterno sopra, interno sotto */}
      {(() => {
        const ringO = focus(at('mark', 0), at('mark', 1)) + focus(at('casey', 0), at('casey', 3, 0.3));
        const woke = wake * (1 - back); // capitolo 9: nel corpo dell'esterno si sveglia l'interno
        return (
          <>
            <Node T={T} t0={at('mark', 0, 0.1)} p={N.markOut} name="Mark" sub={T < end('mark') ? 'ex professore di storia' : woke > 0.5 ? 'sveglio fuori' : 'esterno'} kind={woke > 0.5 ? 'interno' : 'esterno'} ring={ringO}><Fede /></Node>
            <Node T={T} t0={at('mark', 1, 0.6)} p={N.markIn} name="Mark" sub={T < end('ufficio') ? 'interno' : undefined} side="above" kind="interno" ring={focus(at('mark', 2), end('mark')) + focus(at('ufficio', 0), at('ufficio', 1))} fade={1 - 0.6 * woke}><Fede /></Node>
          </>
        );
      })()}
      {(() => {
        // la foto di Gemma, con il nastro nero (capitolo 3); torna nel capitolo 10
        const on = Math.max(off('mark') * seg(T, at('mark', 0, 0.5), at('mark', 0, 0.9)), seg(T, at('casey', 0, 0.2), at('casey', 0, 0.6)));
        if (on <= 0) return null;
        const s = 1 + 0.15 * focus(at('casey', 0, 0.2), at('casey', 1, 0.6));
        return (
          <g transform={`translate(${N.gemma[0]} ${N.gemma[1]}) rotate(4) scale(${s})`} opacity={on} {...S}>
            <rect x="-48" y="-58" width="96" height="116" rx="5" fill="#8A6A3A" stroke={INK} strokeWidth="5" />
            <rect x="-38" y="-48" width="76" height="96" fill="#DCE6EA" />
            <path d="M-38 20 Q-10 -6 10 12 Q24 24 38 6 V48 H-38 Z" fill="#7AA08A" />
            <circle cx="16" cy="-22" r="12" fill="#F2C14E" />
            <path d="M-30 -40 l10 10 l10 -10" fill="none" stroke="#7A8A9A" strokeWidth="3" />
            {T < end('mark') + 0.5 && <path d="M30 -58 L48 -58 L48 -40 Z" fill="#1A1A1A" />}
            <text y="96" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={fit(36)} fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke">Gemma</text>
          </g>
        );
      })()}
      <Tag T={T} t0={at('mark', 0, 1.6)} x={600} y={FUORI.y0 + 30} text="UN INCIDENTE D'AUTO" bg={RED} fg={INK} size={32} rot={-2} until={at('mark', 1, 0.2)} />
      <Link T={T} t0={at('mark', 1, 0.3)} a={[N.markOut[0], N.markOut[1] + 70]} b={[N.markIn[0], N.markIn[1] - 80]} c={[150, 1250]} dashed cut color={INK} w={5} arrow label="8 ore al giorno" lx={150} ly={-260} size={38} fade={off('mark')} />
      <Tag T={T} t0={at('mark', 2, 0.3)} x={470} y={SOTTO.y0 - 10} text="NON SA NIENTE DI LEI" bg={INK} size={32} rot={-2} until={end('mark') - 0.2} />

      {/* ---- l'ufficio: Irving, Dylan, i numeri, Casey */}
      <Node T={T} t0={at('ufficio', 0, 1.2)} p={N.irvingIn} name="Irving" sub={T < end('ufficio') ? 'segue ogni regola' : undefined} kind="interno" ring={focus(at('ufficio', 0, 1.2), at('ufficio', 1))} fade={1 - 0.6 * wake * (1 - back)}><Regole /></Node>
      <Node T={T} t0={at('ufficio', 0, 2.4)} p={N.dylanIn} name="Dylan" sub={T < end('ufficio') ? 'vuole i premi' : undefined} kind="interno" ring={focus(at('ufficio', 0, 2.4), at('ufficio', 1)) + focus(at('risveglio', 1, -0.6), at('risveglio', 2))} off={0} fade={1 - dUp * (1 - dDown) * 0.7 - seg(T, at('fuori', 0, 0), at('fuori', 0, 0.3)) + seg(T, at('casey', 3, 0.3), at('casey', 3, 0.8))}><Coppa /></Node>
      <Lente T={T} t0={at('ufficio', 1, 0.1)} until={at('ufficio', 2, 0.1)} />
      <Tag T={T} t0={at('ufficio', 1, 0.6)} x={760} y={1590} text="NUMERI CHE METTONO ANSIA" bg={RED} fg={INK} size={26} rot={-2} until={at('ufficio', 2, 0)} />
      <Node T={T} t0={at('ufficio', 2, 0.3)} p={N.casey} name="Casey" sub={T < end('ufficio') ? 'consulente del benessere' : undefined} kind="interno" ring={focus(at('ufficio', 2, 0.3), end('ufficio'))} red={T >= at('casey', 1, 0.2)}><Fiore rot={Math.sin(T) * 6} /></Node>

      {/* ---- Helly: arriva, la sua esterna dice di no, resta chiusa */}
      {(() => {
        const t0 = at('helly', 0, 1.1);
        const arrive = eio(seg(T, t0, t0 + 0.8));
        const p: P = [lerp(N.lobby[0], N.hellyIn[0], arrive), lerp(N.lobby[1], N.hellyIn[1], arrive)];
        const woke = wake * (1 - back);
        return (
          <>
            <Node T={T} t0={t0} p={p} name="Helly" sub={T < end('helly') ? 'la nuova collega' : undefined} side="above" kind="interno" ring={focus(at('helly', 0, 1.6), at('helly', 1)) + focus(at('helly', 3), end('helly'))} lock={seg(T, at('helly', 3, 0.3), at('helly', 3, 0.6)) * off('helly')} fade={1 - 0.6 * woke}><Lettera /></Node>
            <Link T={T} t0={at('helly', 0, 2.2)} a={[N.hellyIn[0] + 60, N.hellyIn[1] - 20]} b={[N.lobby[0] - 50, N.lobby[1] + 10]} c={[620, 1620]} dashed arrow color={INK} w={5} label="vuole andarsene" lx={30} ly={56} size={34} fade={off('helly')} />
          </>
        );
      })()}
      {(() => {
        // l'esterna di Helly e il suo video: uno schermo con il NO
        const t0 = at('helly', 1, 0.2);
        const no = seg(T, at('helly', 2, 0.3), at('helly', 2, 0.6));
        const woke = wake * (1 - back);
        const pos: P = [lerp(N.hellyOut[0], SHAFT, focus(at('fuori', 2, 0), end('fuori') + 0.5)), lerp(N.hellyOut[1], GROUND - 150, focus(at('fuori', 3, 0), end('fuori') + 0.5))];
        return (
          <>
            <Node T={T} t0={t0} p={pos} name="Helly" sub={T < end('helly') ? 'esterna' : woke > 0.5 && T < at('fuori', 2, 0) ? 'sveglia fuori' : undefined} kind={woke > 0.5 ? 'interno' : 'esterno'} ring={focus(at('helly', 1, 0.2), at('helly', 3)) + focus(at('fuori', 2, 0), end('fuori'))} side={T >= at('fuori', 3, 0) && T < end('fuori') + 0.4 ? 'above' : 'below'}><Lettera /></Node>
            {T >= at('helly', 2, 0) && T < end('helly') + 0.5 && (
              <g transform={`translate(${N.hellyOut[0] - 150} ${N.hellyOut[1] + 40}) scale(${pop(T, at('helly', 2, 0))})`} opacity={off('helly')} {...S}>
                <rect x="-70" y="-50" width="140" height="100" rx="10" fill="#1A2A30" stroke={INK} strokeWidth="5" />
                <rect x="-58" y="-38" width="116" height="76" rx="5" fill={no > 0 ? '#3A1A1A' : '#2A4A50'} />
                <path d="M-58 30 H58" stroke={INK} strokeWidth="2" opacity=".4" />
                <circle cx="-44" cy="-26" r="6" fill={RED} opacity={0.5 + 0.5 * Math.abs(Math.sin(T * 4))} />
                <text y="20" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="56" fill={RED} opacity={no} transform={`scale(${eob(no, 2)})`}>NO</text>
                <path d="M-20 50 L-34 74 M20 50 L34 74 M-44 74 H44" stroke={INK} strokeWidth="5" />
              </g>
            )}
            <Link T={T} t0={at('helly', 2, 0.6)} a={[N.hellyOut[0] - 150, N.hellyOut[1] + 120]} b={[N.hellyIn[0] + 50, N.hellyIn[1] - 90]} c={[560, 1250]} color={RED} w={6} arrow cut dashed label="un video" lx={110} ly={-30} size={36} fade={off('helly')} />
          </>
        );
      })()}
      <Tag T={T} t0={at('helly', 3, 0.4)} x={540} y={SOTTO.y0 - 50} text="SENZA VIA D'USCITA" bg={RED} fg={INK} size={34} rot={-2} until={end('helly') - 0.2} />

      {/* ---- Petey: fuori, le metà riunite, la mappa, muore */}
      {(() => {
        const t0 = at('petey', 0, 0.3);
        const fade = 1 - 0.65 * seg(T, end('petey'), end('petey') + 0.6) - 0.35 * seg(T, at('fuori', 0, 0), at('fuori', 0, 0.5));
        return (
          <Node T={T} t0={t0} p={N.petey} name="Petey" sub={T < at('petey', 3, 0.6) ? (T < at('petey', 1, 1.2) ? "l'ex capo della squadra" : 'riunito') : undefined} kind={pJoin >= 1 ? 'intero' : 'esterno'} split={T < at('petey', 1, 0.2) ? 0.6 : 0.6 * (1 - pJoin)} ring={focus(at('petey', 1, 1.2), at('petey', 2))} dead={pDead} fade={fade}><Mappa /></Node>
        );
      })()}
      <Link T={T} t0={at('petey', 2, 0.1)} a={[N.petey[0] - 60, N.petey[1] + 10]} b={[N.markOut[0] + 64, N.markOut[1] - 10]} c={[400, 470]} arrow color={WARM} w={6} label="una mappa" ly={-24} size={36} fade={off('petey')} />
      {(() => {
        const t0 = at('petey', 2, 0.4);
        if (T < t0 || T > end('petey') + 0.5) return null;
        return (
          <g transform={`translate(${N.markOut[0] + 74} ${N.markOut[1] - 74}) rotate(-8) scale(${pop(T, t0)})`} opacity={off('petey')}>
            <circle r="40" fill="#10292E" stroke={WARM} strokeWidth="4" />
            <Mappa s={0.8} />
          </g>
        );
      })()}
      <Tag T={T} t0={at('petey', 3, 0.7)} x={560} y={FUORI.y0 + 10} text="MUORE" bg={INK} size={36} rot={-2} until={end('petey') - 0.2} />

      {/* ---- Cobel: la capa sotto, nessun chip, la vicina sopra */}
      <Node T={T} t0={at('cobel', 0, 0.2)} p={N.cobel} name="Cobel" sub={T < end('cobel') ? 'la capa del piano' : undefined} kind="intero" ring={focus(at('cobel', 0, 0.2), at('cobel', 2))}><Binocolo /></Node>
      <Link T={T} t0={at('cobel', 1, 0.2)} a={[N.cobel[0] - 20, N.cobel[1] - 64]} b={[N.selvig[0] + 10, N.selvig[1] + 70]} c={[640, 1250]} color={INK} w={10} dur={1.2} label="nessun chip" lx={-190} ly={-36} size={46} fade={off('cobel')} />
      {(() => {
        const t0 = at('cobel', 1, 0.8);
        if (T < t0) return null;
        const k = seg(T, t0, t0 + 0.3);
        return (
          <g opacity={k * off('cobel')} transform={`translate(640 ${CUT})`}>
            <Glow id="sc-spark" x={0} y={0} r={60} t={T} color={INK} amp={0.3} rate={9} opacity={0.6} />
            <path d="M-26 0 H26 M0 -26 V26 M-18 -18 L18 18 M18 -18 L-18 18" stroke={INK} strokeWidth="4" />
          </g>
        );
      })()}
      <Node T={T} t0={at('cobel', 2, 0.2)} p={N.selvig} name="Selvig" sub={T < end('cobel') ? 'la vicina gentile' : undefined} kind="intero" ring={focus(at('cobel', 2, 0.2), end('cobel'))} fade={1 - seg(T, end('cobel'), end('cobel') + 0.6)}><Binocolo /></Node>
      {(() => {
        const t0 = at('cobel', 3, 0.3);
        if (T < t0) return null;
        const p = eo(seg(T, t0, t0 + 0.6));
        return (
          <g opacity={off('cobel')}>
            <path d={`M455 ${GROUND - 85} L${lerp(455, 230, p)} ${lerp(GROUND - 85, GROUND - 100, p)}`} stroke={RED} strokeWidth="5" strokeDasharray="12 10" strokeDashoffset={-T * 40} />
            {p >= 1 && <Tag T={T} t0={t0 + 0.6} x={330} y={GROUND + 52} text="LO SPIA" bg={RED} fg={INK} size={34} rot={-3} until={end('cobel') - 0.2} />}
          </g>
        );
      })()}

      {/* ---- il risveglio: la sala di controllo, Dylan sale a casa e vede suo figlio */}
      <Tag T={T} t0={at('risveglio', 0, 0.4)} x={825} y={2250} text="IL RISVEGLIO" size={34} rot={-2} until={at('risveglio', 1, -0.4)} />
      <Link T={T} t0={at('risveglio', 0, 0.9)} a={[N.knobs[0], N.knobs[1] - 50]} b={[N.dylanOut[0] + 20, N.dylanOut[1] + 70]} c={[1010, 1300]} dashed flow arrow color={MINT} w={8} dur={1.0} fade={off('risveglio')} />
      {(() => {
        const t0 = at('risveglio', 1, -0.6);
        if (T < t0) return null;
        const p: P = [lerp(N.dylanIn[0], N.dylanOut[0], dUp), lerp(N.dylanIn[1], N.dylanOut[1], dUp)];
        const q: P = [lerp(p[0], N.dylanIn[0], dDown), lerp(p[1], N.dylanIn[1], dDown)];
        return <Node T={T} t0={t0} p={q} name="Dylan" sub={dUp > 0.8 && dDown < 0.2 ? 'sveglio a casa' : undefined} kind="interno" ring={1} fade={1 - seg(T, at('risveglio', 2, 1.2), at('risveglio', 2, 1.5))}><Coppa /></Node>;
      })()}
      <Node T={T} t0={at('risveglio', 1, 1.6)} p={N.figlio} name="suo figlio" kind="esterno" r={42} size={30} ring={focus(at('risveglio', 1, 1.6), at('risveglio', 2))} fade={1 - seg(T, at('risveglio', 2, 0.4), at('risveglio', 2, 0.9))}><Macchinina /></Node>
      <Tag T={T} t0={at('risveglio', 2, 0.2)} x={560} y={CUT - 4} text="UN'IDEA" bg={INK} size={56} rot={-2} until={end('risveglio') - 0.1} />

      {/* ---- il piano: Dylan alle manopole, tre interni che salgono fuori */}
      <Node T={T} t0={at('fuori', 0, 0.1)} p={N.dylanCtl} name="Dylan" sub={T < end('fuori') ? 'tiene accese le manopole' : undefined} kind="interno" ring={focus(at('fuori', 0, 0.1), at('fuori', 1)) + focus(at('casey', 3, 0), at('casey', 3, 0.8))} lock={0} dead={seg(T, tOff, tOff + 0.3)}><Coppa /></Node>
      {[
        { from: N.markIn, to: N.markOut, c: [140, 1250] as P },
        { from: N.hellyIn, to: N.hellyOut, c: [960, 1250] as P },
        { from: N.irvingIn, to: N.irvingOut, c: [560, 1250] as P },
      ].map((w, i) => (
        <Link key={i} T={T} t0={at('fuori', 1, 0.1 + i * 0.15)} a={w.from} b={w.to} c={w.c} dashed flow color={MINT} w={7} dur={1.2} fade={1 - seg(T, at('fuori', 2, 0.6), at('fuori', 3, 0))} />
      ))}
      <Node T={T} t0={at('fuori', 1, 1.0)} p={N.irvingOut} name="Irving" sub={T < end('fuori') ? 'sveglio fuori' : undefined} kind="interno" r={46} size={30} ring={0} fade={1 - back}><Regole /></Node>
      <Tag T={T} t0={at('fuori', 2, 0.3)} x={600} y={FUORI.y0 + 20} text="FIGLIA DEL CAPO DI LUMON" bg={WARM} size={30} rot={-2} until={end('fuori') - 0.2} />
      <Tag T={T} t0={at('fuori', 3, 0.5)} x={790} y={GROUND + 40} text="RACCONTA TUTTO" bg={MINT} size={30} rot={2} until={end('fuori') - 0.1} />

      {/* ---- Casey è Gemma: la linea rossa dalla foto al benessere; si spegne tutto */}
      <Link T={T} t0={at('casey', 1, 0.1)} a={[N.gemma[0] - 10, N.gemma[1] + 70]} b={[N.casey[0] + 10, N.casey[1] - 70]} c={[120, 1500]} color={RED} w={8} dur={1.0} arrow label="è lei" lx={-30} ly={-40} size={44} />
      <Tag T={T} t0={at('casey', 1, 1.3)} x={300} y={2090} text="CASEY È GEMMA" bg={RED} fg={INK} size={30} rot={-3} until={at('casey', 2, 0)} />
      <Ring T={T} x={N.casey[0]} y={N.casey[1]} r={92} on={focus(at('casey', 1, 0.8), end('casey') + 1)} />
      <Tag T={T} t0={at('casey', 2, 0.1)} x={420} y={1985} text="GEMMA È VIVA!" bg={RED} fg={INK} size={52} rot={-3} until={at('casey', 4, 0)} />
      <Tag T={T} t0={tOff + 0.1} x={825} y={2035} text="DYLAN FERMATO" bg={INK} size={30} rot={2} until={at('casey', 4, 0)} />
      {(() => {
        const t0 = at('casey', 4, 0.6);
        if (T < t0) return null;
        return <text x={1000} y={N.casey[1] + 40} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={150 * UI_K} fill={RED} stroke={DARK} strokeWidth="9" paintOrder="stroke" opacity={seg(T, t0, t0 + 0.3)} transform={`rotate(${Math.sin(T * 3) * 4} 1000 ${N.casey[1]})`}>?</text>;
      })()}
    </g>
  );
};

export const makePiani = (chapterId: string): React.FC<SceneProps> => {
  const Scene: React.FC<SceneProps> = ({ t }) => {
    const T = STARTS[chapterId] + t;
    const c = camAt(T);
    UI_K = Math.max(1, 1 / c.z);
    WIDEV = c.z < 0.5;
    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="sc" />
          <radialGradient id="sc-bg" cx=".5" cy=".46" r=".8">
            <stop offset="0" stopColor="#14343A" />
            <stop offset=".6" stopColor="#0B2024" />
            <stop offset="1" stopColor="#050E10" />
          </radialGradient>
          <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0A1420" />
            <stop offset=".45" stopColor="#16283A" />
            <stop offset=".8" stopColor="#2A4258" />
            <stop offset="1" stopColor="#3A5468" />
          </linearGradient>
          <linearGradient id="sc-snow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E8F0F4" />
            <stop offset=".4" stopColor="#B8CAD4" />
            <stop offset="1" stopColor="#7A90A0" />
          </linearGradient>
          <linearGradient id="sc-wall" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5A6E7E" />
            <stop offset="1" stopColor="#3A4A5A" />
          </linearGradient>
          <linearGradient id="sc-lumon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#E4ECEA" />
            <stop offset=".6" stopColor="#C2CECC" />
            <stop offset="1" stopColor="#8EA0A2" />
          </linearGradient>
          <linearGradient id="sc-earth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1E2A26" />
            <stop offset=".5" stopColor="#161E1C" />
            <stop offset="1" stopColor="#0E1615" />
          </linearGradient>
          <linearGradient id="sc-cutglow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MINT} stopOpacity="0" />
            <stop offset=".5" stopColor={MINT} stopOpacity=".5" />
            <stop offset="1" stopColor={MINT} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sc-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1A4A50" stopOpacity=".7" />
            <stop offset="1" stopColor="#081C20" stopOpacity=".7" />
          </linearGradient>
          <linearGradient id="sc-spot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF4D8" stopOpacity=".7" />
            <stop offset="1" stopColor="#FFF4D8" stopOpacity=".05" />
          </linearGradient>
          <linearGradient id="sc-scrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#050E10" stopOpacity=".96" />
            <stop offset=".82" stopColor="#050E10" stopOpacity=".9" />
            <stop offset="1" stopColor="#050E10" stopOpacity="0" />
          </linearGradient>
          <clipPath id="sc-clipF"><rect x={X0} y={FUORI.y0} width={X1 - X0} height={FUORI.y1 - FUORI.y0} rx="18" /></clipPath>
          <pattern id="sc-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 H0 V40" fill="none" stroke="#163236" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#sc-bg)" />
        <g transform={`translate(540 900) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
          <rect x="-4000" y="-4000" width="9080" height="13000" fill="url(#sc-grid)" opacity=".6" />
          <Schema T={T} />
        </g>
        <rect width="1080" height="575" fill="url(#sc-scrim)" />
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={INK} opacity={0.1 + 0.07 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Finish id="sc" tint="#0E2A30" tintOpacity={0.12} />
      </svg>
    );
  };
  return Scene;
};
