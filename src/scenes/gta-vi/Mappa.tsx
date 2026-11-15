import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY, HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Fog, Glow } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/gta-vi.json';

// GTA VI come schema (formato "spiegato", Videogiochi spiegati): una mappa illustrata di Leonida che si costruisce
// capitolo dopo capitolo, di sera, nei colori di un tramonto anni '80 (viola, rosa neon, azzurro, giallo).
// La sagoma è inventata da noi (una penisola qualsiasi, mai la mappa ufficiale del gioco): in alto la terraferma col
// monte Kalaga e Ambrosia, a ovest la baia di Port Gellhorn, al centro un lago e la palude di Grassrivers, sulla costa
// est Vice City (grattacieli, hotel con le insegne al neon, spiaggia), in fondo la fila di isole delle Leonida Keys.
// I posti di cui si conosce solo il nome sono spilli tratteggiati con il punto di domanda.
// Personaggi = cerchi con il loro oggetto (mai figure): Jason = piastrina militare, Lucia = chiave della cella.
// Niente armi né violenza: il colpo e i guai si raccontano con la banca, la borsa dei soldi, i lampeggianti.
// Sotto le Keys c'è la «bacheca» del gioco (capitolo 1 e 9): i cartellini V e VI, la strada, i trailer, il calendario.
// Coordinate = mondo; la camera porta il punto (x, y) al centro dello schermo (540, 900) con zoom z.
// Gli eventi cadono sulla griglia della musica (100 bpm, crome), gli stessi istanti dello spartito scripts/audio/gta-vi.mjs.

export const INK = '#FFF1F7';
export const PINK = '#FF4FA3';
export const CYAN = '#3FE3F2';
export const YEL = '#FFC93C';
export const RED = '#FF3B55';
export const BLUE = '#3D7BFF';
const DIM = '#A493C4';
const DARK = '#12071F';
const LAND = '#5C2F86';
const LAND2 = '#43246C';
const SWAMP = '#1C4146';
const SAND = '#F2C98A';
type P = readonly [number, number];

// ---------------------------------------------------------------- geografia (inventata)

const WEST: P[] = [[-200, 560], [40, 600], [150, 650], [214, 760], [166, 820], [214, 880], [238, 1000], [272, 1140], [334, 1340], [424, 1590], [536, 1790], [660, 1906]];
const EAST: P[] = [[1280, 560], [1020, 600], [905, 650], [862, 800], [878, 1000], [862, 1200], [890, 1330], [882, 1520], [834, 1680], [764, 1850], [700, 1912]];
const smooth = (pts: P[]) => {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    d += ` Q${x0} ${y0} ${(x0 + x1) / 2} ${(y0 + y1) / 2}`;
  }
  const l = pts[pts.length - 1];
  return d + ` L${l[0]} ${l[1]}`;
};
const LAND_D = `${smooth(WEST)} ${smooth([...EAST].reverse()).replace(/^M/, 'L')} L1280 -200 L-200 -200 Z`;
const COAST_D = `${smooth(WEST)} ${smooth([...EAST].reverse()).replace(/^M/, 'L')}`;
// le isole delle Keys, da est a ovest
const KEYS = [[668, 1968, 34, 16], [604, 2018, 44, 18], [520, 2062, 52, 20], [426, 2090, 48, 18], [334, 2104, 42, 17], [246, 2100, 36, 15], [168, 2082, 28, 13]] as const;
// barriera di sabbia davanti a Vice City (la spiaggia)
const BEACH_D = 'M930 1290 Q960 1300 962 1400 Q962 1520 922 1600 Q912 1610 906 1596 Q936 1500 934 1400 Q932 1320 916 1296 Z';
const LAKE_D = 'M560 980 Q640 950 690 1000 Q720 1060 670 1110 Q600 1150 548 1100 Q512 1040 560 980 Z';

export const PLACE = {
  vice: [800, 1420], keys: [430, 2060], grass: [565, 1725], port: [196, 836], ambrosia: [790, 470], kalaga: [470, 380], lake: [620, 1050],
} as const;
export const N = {
  jason: [250, 1840], brian: [120, 2230],
  lucia: [150, 1430], prison: [130, 1150], family: [390, 1530],
  bank: [770, 1290],
  cal: [500, 1740], boobie: [700, 1170], dre: [740, 880], raul: [400, 1250],
} as const;
const INTRO_Y = 2950; // la bacheca del gioco, sotto le Keys

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
/** 1 tra a e b (con entrata e uscita di 0,4 s). */
const focus = (T: number, a: number, b: number) => seg(T, a, a + 0.4) * (1 - seg(T, b, b + 0.4));

// ---------------------------------------------------------------- camera

type Shot = { at: number; x: number; y: number; z: number };
const WIDE = { x: 560, y: 1160, z: 0.47 };
const BOARD = (dy = 0, z = 1.15) => ({ x: 540, y: INTRO_Y + dy, z });
const SHOTS: Shot[] = [
  { at: at('mappa', 0), x: 560, y: 1200, z: 0.5 },
  { at: at('mappa', 0, 0.2), ...WIDE },
  { at: at('mappa', 1), x: 520, y: 1720, z: 0.62 },
  { at: at('mappa', 2), x: 500, y: 700, z: 0.66 },
  { at: at('mappa', 3), x: 560, y: 1140, z: 0.5 },
  // Vice City da vicino: la cartolina del 2006, le foto di Miami, il cerchio «qui la maggior parte del gioco»
  { at: at('vicecity', 0), x: 790, y: 1400, z: 1.1 },
  { at: at('vicecity', 1), x: 720, y: 1340, z: 0.92 },
  { at: at('vicecity', 2), x: 760, y: 1400, z: 0.78 },
  // Jason e Brian nelle Keys, poi Lucia e il carcere
  { at: at('coppia', 0), x: 300, y: 1960, z: 0.9 },
  { at: at('coppia', 1), x: 260, y: 2040, z: 0.88 },
  { at: at('coppia', 2), x: 250, y: 1320, z: 0.9 },
  { at: at('coppia', 3), x: 260, y: 1500, z: 0.86 },
  // il colpo in banca, il complotto, Bonnie e Clyde, la difesa a vicenda
  { at: at('colpo', 0), x: 560, y: 1480, z: 0.6 },
  { at: at('colpo', 1), ...WIDE },
  { at: at('colpo', 2), x: 330, y: 1640, z: 0.74 },
  // in due: lo scambio, le strade separate, il rapporto
  { at: at('insieme', 0), x: 300, y: 1640, z: 0.76 },
  { at: at('insieme', 1), x: 560, y: 1460, z: 0.56 },
  { at: at('insieme', 2), x: 300, y: 1640, z: 0.76 },
  // la bacheca: Criminal Profile e il fisico
  { at: at('profilo', 0), ...BOARD(-60) },
  { at: at('profilo', 1), ...BOARD(-20) },
  { at: at('profilo', 2), ...BOARD(250) },
  // gli altri personaggi intorno a Vice City
  { at: at('personaggi', 0), x: 420, y: 1760, z: 1.0 },
  { at: at('personaggi', 1), x: 700, y: 1200, z: 1.0 },
  { at: at('personaggi', 2), x: 700, y: 1020, z: 0.92 },
  { at: at('personaggi', 3), x: 520, y: 1160, z: 0.86 },
  // la satira: telefoni, giornale, telecamera; poi le attività sulla mappa
  { at: at('satira', 0), x: 560, y: 1000, z: 0.85 },
  { at: at('satira', 2), x: 660, y: 1200, z: 0.85 },
  { at: at('satira', 3), x: 600, y: 1450, z: 0.8 },
  // l'uscita e le edizioni, sulla bacheca; poi tutta la mappa con la coppia
  { at: at('uscita', 0), ...BOARD(-60) },
  { at: at('uscita', 1), ...BOARD(120) },
  { at: at('uscita', 2), ...BOARD(300) },
  { at: at('edizioni', 0), ...BOARD(-40) },
  { at: at('edizioni', 2), ...BOARD(200) },
  { at: at('edizioni', 3), x: 290, y: 1640, z: 0.8 },
];
let UI_K = 1;
let WIDEV = false;
const fit = (size: number) => Math.max(size, Math.min(size * UI_K, WIDEV ? 110 : 130));
const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.1));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: Math.exp(lerp(Math.log(o.z), Math.log(s.z), p)) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 5, z: o.z * (1 + 0.012 * Math.sin(T * 0.2)) };
};

// ---------------------------------------------------------------- oggetti dei personaggi

/** Jason: la piastrina militare appesa alla catenella a palline. */
export const DogTag: React.FC<{ T: number; s?: number; color?: string }> = ({ T, s = 1, color = YEL }) => {
  const sw = Math.sin(T * 1.6) * 4;
  return (
    <g transform={`scale(${s}) rotate(${sw})`} strokeLinejoin="round">
      {Array.from({ length: 13 }, (_, i) => {
        const a = (i / 12) * Math.PI;
        return <circle key={i} cx={-30 * Math.cos(a)} cy={-30 - 26 * Math.sin(a)} r="2.6" fill={INK} opacity=".85" />;
      })}
      <path d="M-24 -26 H24 Q32 -26 32 -18 V18 Q32 30 20 30 H-20 Q-32 30 -32 18 V-18 Q-32 -26 -24 -26 Z" fill="#B9BFCC" stroke={color} strokeWidth="4" />
      <path d="M-24 -20 H22 Q26 -20 26 -16 V16 Q26 24 18 24" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity=".6" />
      <circle cx="-20" cy="-14" r="4" fill={DARK} stroke={INK} strokeWidth="1.5" />
      {/* le righe incise (lettere stilizzate, illeggibili) */}
      {[-6, 4, 14].map((y, i) => <path key={y} d={`M-14 ${y} H${i === 2 ? 8 : 20}`} stroke="#5A5F6E" strokeWidth="3.4" strokeLinecap="round" strokeDasharray="4 3" />)}
      <path d="M32 -4 Q26 0 32 4" fill="none" stroke="#5A5F6E" strokeWidth="2" />
    </g>
  );
};
/** Lucia: la vecchia chiave della cella con la targhetta del carcere. */
export const CellKey: React.FC<{ T: number; s?: number; color?: string }> = ({ T, s = 1, color = YEL }) => (
  <g transform={`scale(${s}) rotate(${-30 + Math.sin(T * 1.4) * 3})`} strokeLinejoin="round" strokeLinecap="round">
    <circle cx="-22" cy="0" r="16" fill="none" stroke={color} strokeWidth="7" />
    <circle cx="-22" cy="0" r="16" fill="none" stroke="#FFF3C8" strokeWidth="2" opacity=".6" />
    <path d="M-6 0 H34" stroke={color} strokeWidth="8" />
    <path d="M22 0 V14 M30 0 V11 M14 0 V9" stroke={color} strokeWidth="6" />
    <path d="M-4 -3 H32" stroke="#FFF3C8" strokeWidth="2" opacity=".6" />
    {/* la targhetta appesa all'anello */}
    <path d="M-34 10 L-40 22" stroke={INK} strokeWidth="2" />
    <g transform="translate(-44 34) rotate(26)">
      <rect x="-15" y="-9" width="30" height="20" rx="4" fill="#E9E1D3" stroke={INK} strokeWidth="2.5" />
      <path d="M-9 -1 H9 M-9 5 H4" stroke="#7A6E5E" strokeWidth="2.4" />
    </g>
  </g>
);
/** I trafficanti delle Keys: un motoscafo veloce visto di lato, con la scia. */
const Boat: React.FC<{ T: number }> = ({ T }) => (
  <g strokeLinejoin="round" transform={`translate(0 ${Math.sin(T * 2.4) * 2})`}>
    <path d="M-40 4 H34 Q44 4 40 12 L32 18 H-34 Z" fill="#F4F1FA" stroke={INK} strokeWidth="3" />
    <path d="M-40 4 H34 Q44 4 40 12 L36 14 H-38 Z" fill={CYAN} opacity=".5" />
    <path d="M-16 4 L-6 -10 H14 L20 4 Z" fill="#26304A" stroke={INK} strokeWidth="3" />
    <path d="M-30 18 Q-50 22 -64 18 M-30 22 Q-46 28 -60 26" fill="none" stroke={INK} strokeWidth="2.5" opacity=".7" strokeDasharray={`${8 + Math.sin(T * 6) * 3} 5`} />
  </g>
);
/** Una casa: il tetto che i trafficanti danno a Jason. */
const House: React.FC<{ color?: string }> = ({ color = INK }) => (
  <g strokeLinejoin="round">
    <path d="M-30 -2 L0 -30 L30 -2" fill="none" stroke={color} strokeWidth="5" />
    <rect x="-24" y="-6" width="48" height="34" fill="#3D2A5E" stroke={color} strokeWidth="4" />
    <rect x="-8" y="8" width="16" height="20" fill={YEL} opacity=".85" />
    <rect x="12" y="2" width="9" height="9" fill={YEL} opacity=".6" />
    <path d="M14 -24 V-12" stroke={color} strokeWidth="4" />
  </g>
);
/** La famiglia di Lucia: una cornice con un cuore (nessun volto). */
const Frame: React.FC = () => (
  <g strokeLinejoin="round">
    <rect x="-28" y="-30" width="56" height="60" rx="4" fill="#5A3A2A" stroke={INK} strokeWidth="4" />
    <rect x="-20" y="-22" width="40" height="44" fill="#F6D9E6" />
    <path d="M0 12 Q-18 0 -14 -8 Q-10 -16 0 -8 Q10 -16 14 -8 Q18 0 0 12 Z" fill={PINK} stroke={DARK} strokeWidth="2" />
  </g>
);
/** La banca: facciata con le colonne e la scritta. */
const Bank: React.FC<{ alarm?: number; T: number }> = ({ alarm = 0, T }) => (
  <g strokeLinejoin="round">
    <path d="M-70 -40 L0 -78 L70 -40 Z" fill="#E9E3F2" stroke={INK} strokeWidth="5" />
    <rect x="-66" y="-40" width="132" height="12" fill="#CFC6DE" stroke={INK} strokeWidth="3" />
    {[-48, -16, 16, 48].map((x) => <rect key={x} x={x - 8} y="-28" width="16" height="58" fill="#F4F0FA" stroke={INK} strokeWidth="3" />)}
    <rect x="-74" y="30" width="148" height="12" fill="#CFC6DE" stroke={INK} strokeWidth="4" />
    <text y="-46" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="15" letterSpacing="3" fill={DARK}>BANCA</text>
    {alarm > 0 && (
      <g opacity={alarm}>
        <circle cx="0" cy="-60" r="9" fill={Math.sin(T * 14) > 0 ? RED : '#5A1020'} stroke={INK} strokeWidth="2" />
        {[0, 1].map((k) => <path key={k} d={`M${-26 - k * 14} -76 Q${-34 - k * 14} -60 ${-26 - k * 14} -44 M${26 + k * 14} -76 Q${34 + k * 14} -60 ${26 + k * 14} -44`} fill="none" stroke={RED} strokeWidth="4" strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(T * 14 + k)} />)}
      </g>
    )}
  </g>
);
/** La borsa dei soldi. */
const MoneyBag: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round">
    <path d="M-10 -26 Q0 -18 10 -26 L6 -16 H-6 Z" fill="#B88A4A" stroke={INK} strokeWidth="3" />
    <path d="M-6 -16 Q-34 0 -26 22 Q-20 32 0 32 Q20 32 26 22 Q34 0 6 -16 Z" fill="#C99B55" stroke={INK} strokeWidth="4" />
    <path d="M-8 -16 H8" stroke="#6A4A22" strokeWidth="4" />
    <text y="20" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="28" fill="#2E6B3A">$</text>
    <path d="M-18 4 Q-20 16 -12 24" fill="none" stroke="#FFF3C8" strokeWidth="2.5" opacity=".6" />
  </g>
);
/** Lampeggianti della polizia (rosso e blu che si alternano), con l'alone. */
const Siren: React.FC<{ T: number; id: string; s?: number; on?: number }> = ({ T, id, s = 1, on = 1 }) => {
  const ph = Math.sin(T * 9) > 0;
  return (
    <g transform={`scale(${s})`}>
      <Glow id={`${id}-r`} x={-14} y={0} r={60} t={T} color={RED} amp={0} opacity={(ph ? 0.85 : 0.15) * on} />
      <Glow id={`${id}-b`} x={14} y={0} r={60} t={T} color={BLUE} amp={0} opacity={(ph ? 0.15 : 0.85) * on} />
      <rect x="-26" y="-7" width="52" height="14" rx="6" fill="#20263A" stroke={INK} strokeWidth="2.5" />
      <rect x="-23" y="-5" width="21" height="10" rx="4" fill={ph ? '#FF8A9A' : '#6A1A28'} />
      <rect x="2" y="-5" width="21" height="10" rx="4" fill={ph ? '#26346A' : '#9AB8FF'} />
    </g>
  );
};
/** L'auto decappottabile azzurra vista di lato (piccola, per le strade). */
const Car: React.FC<{ color?: string; s?: number; T: number }> = ({ color = CYAN, s = 1, T }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round">
    <path d="M-46 4 L-40 -8 Q-22 -12 -10 -12 L4 -22 L10 -22 L4 -12 Q30 -12 44 -6 L48 4 Q48 10 40 10 H-42 Q-48 10 -46 4 Z" fill={color} stroke={DARK} strokeWidth="3.5" />
    <path d="M-36 -6 H34" stroke="#FFFFFF" strokeWidth="2" opacity=".6" />
    {[-28, 28].map((x) => (
      <g key={x} transform={`translate(${x} 10) rotate(${T * 400})`}>
        <circle r="9" fill="#1A1424" stroke={INK} strokeWidth="2" />
        <path d="M-5 0 H5 M0 -5 V5" stroke={INK} strokeWidth="2" />
      </g>
    ))}
    <rect x="42" y="-4" width="7" height="5" rx="1" fill="#FFF3C8" />
    <rect x="-48" y="-3" width="5" height="5" rx="1" fill={RED} />
  </g>
);
/** L'auto degli anni Trenta di Bonnie e Clyde (piccola, color sabbia). */
const OldCar: React.FC = () => (
  <g strokeLinejoin="round">
    <path d="M-44 8 V-4 Q-40 -10 -26 -10 L-18 -28 H18 L26 -10 Q40 -10 44 -2 V8 Z" fill="#C8B48A" stroke={INK} strokeWidth="3.5" />
    <path d="M-14 -24 H-2 V-12 H-22 Z M2 -24 H14 L20 -12 H2 Z" fill="#3A2E24" />
    {[-26, 26].map((x) => <g key={x}><circle cx={x} cy="10" r="11" fill="#1A1424" stroke={INK} strokeWidth="3" /><circle cx={x} cy="10" r="4" fill="#C8B48A" /></g>)}
    <path d="M-44 2 H-50 M44 2 H50" stroke={INK} strokeWidth="4" strokeLinecap="round" />
  </g>
);
/** Un telefono con un video che diventa virale: cuori e contatore. */
const Phone: React.FC<{ T: number; kind: number; views: number }> = ({ T, kind, views }) => (
  <g strokeLinejoin="round">
    <rect x="-38" y="-70" width="76" height="140" rx="14" fill="#1A1028" stroke={INK} strokeWidth="5" />
    <rect x="-30" y="-58" width="60" height="104" rx="5" fill={kind === 0 ? '#4A2A7A' : kind === 1 ? '#2A4A7A' : '#7A2A5A'} />
    {/* la scena nel video: tramonto e palma, oppure una strada con l'insegna */}
    {kind === 0 && <><circle cx="0" cy="-12" r="16" fill={YEL} opacity=".9" /><path d="M-30 10 H30 V46 H-30 Z" fill="#2A1A48" /><path d="M-30 8 H30" stroke={PINK} strokeWidth="3" /></>}
    {kind === 1 && <><path d="M-30 46 L-6 -20 H6 L30 46 Z" fill="#20283A" /><path d="M0 -14 V40" stroke={YEL} strokeWidth="3" strokeDasharray="6 6" strokeDashoffset={-T * 40} /></>}
    {kind === 2 && <><rect x="-20" y="-40" width="40" height="22" rx="4" fill="none" stroke={CYAN} strokeWidth="3" opacity={0.6 + 0.4 * Math.sin(T * 7)} /><path d="M-30 46 V10 H30 V46 Z" fill="#3A1A3A" /><path d="M-14 46 V22 H14 V46" fill="#1A0D24" /></>}
    <path d="M-8 -6 L10 4 L-8 14 Z" fill={INK} opacity=".85" />
    <rect x="-14" y="54" width="28" height="5" rx="2.5" fill={INK} opacity=".5" />
    <g transform="translate(24 -40)">
      <path d="M0 10 Q-14 0 -10 -6 Q-6 -12 0 -6 Q6 -12 10 -6 Q14 0 0 10 Z" fill={PINK} stroke={INK} strokeWidth="2" />
    </g>
    <text x="0" y="-80" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="22" fill={YEL} stroke={DARK} strokeWidth="5" paintOrder="stroke">{fmtViews(views)}</text>
  </g>
);
const fmtViews = (v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(1).replace('.', ',')} mln` : `${Math.round(v / 1000)} mila`);
/** La telecamera sulla divisa: un distintivo con l'obiettivo e la luce rossa che registra. */
const BodyCam: React.FC<{ T: number }> = ({ T }) => (
  <g strokeLinejoin="round">
    <path d="M0 -40 L12 -14 L40 -12 L18 6 L26 34 L0 18 L-26 34 L-18 6 L-40 -12 L-12 -14 Z" fill="#C9A24E" stroke={INK} strokeWidth="4" />
    <rect x="-22" y="-12" width="44" height="30" rx="6" fill="#1A1424" stroke={INK} strokeWidth="3" />
    <circle cx="-4" cy="3" r="9" fill="#2A3A5A" stroke={CYAN} strokeWidth="3" />
    <circle cx="-6" cy="0" r="3" fill="#FFFFFF" opacity=".7" />
    <circle cx="13" cy="-4" r="4" fill={Math.sin(T * 5) > 0 ? RED : '#5A1020'} />
  </g>
);
/** Uno schermo con il trailer (nessuna immagine del gioco: un tramonto a righe e il tasto play). */
const Screen: React.FC<{ T: number; label: string; k: number }> = ({ T, label, k }) => (
  <g strokeLinejoin="round">
    <rect x="-96" y="-62" width="192" height="118" rx="10" fill="#1A1028" stroke={INK} strokeWidth="5" />
    <rect x="-86" y="-52" width="172" height="98" rx="4" fill={['#5A2A7A', '#7A2A5A', '#2A4A7A'][k]} />
    <circle cx="0" cy="-4" r="30" fill={YEL} opacity=".85" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x="-40" y={-6 + i * 7} width="80" height="3" fill={['#5A2A7A', '#7A2A5A', '#2A4A7A'][k]} />)}
    <path d="M-86 24 H86 V46 H-86 Z" fill="#1A0D24" opacity=".8" />
    <path d={`M-86 46 H${-86 + 172 * mod(T * 0.12 + k * 0.3, 1)}`} stroke={PINK} strokeWidth="5" />
    <path d="M-12 -18 L16 -2 L-12 14 Z" fill={INK} />
    <path d="M-30 56 L-40 76 M30 56 L40 76" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    <text y="112" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="30" fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke">{label}</text>
  </g>
);
/** Foglio di calendario. `cross` 0..1 = barrato in rosso. */
const Sheet: React.FC<{ top: string; big: string; cross?: number; w?: number; color?: string }> = ({ top, big, cross = 0, w = 170, color = PINK }) => (
  <g strokeLinejoin="round">
    <rect x={-w / 2 + 6} y="-74" width={w} height="150" rx="10" fill="#000" opacity=".35" />
    <rect x={-w / 2} y="-80" width={w} height="150" rx="10" fill="#FBF5FA" stroke={INK} strokeWidth="4" />
    <path d={`M${-w / 2} -48 H${w / 2} V-70 Q${w / 2} -80 ${w / 2 - 10} -80 H${-w / 2 + 10} Q${-w / 2} -80 ${-w / 2} -70 Z`} fill={color} />
    {[-w / 4, w / 4].map((x) => <rect key={x} x={x - 5} y="-92" width="10" height="24" rx="5" fill="#C8C0D8" stroke={DARK} strokeWidth="2" />)}
    <text y="-56" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="22" letterSpacing="2" fill="#FFFFFF">{top}</text>
    <text y="34" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={big.length > 3 ? 54 : 74} fill={DARK}>{big}</text>
    {cross > 0 && <path d={`M${-w / 2 + 14} -38 L${-w / 2 + 14 + (w - 28) * Math.min(1, cross * 2)} ${-38 + 96 * Math.min(1, cross * 2)}${cross > 0.5 ? ` M${w / 2 - 14} -38 L${w / 2 - 14 - (w - 28) * (cross * 2 - 1)} ${-38 + 96 * (cross * 2 - 1)}` : ''}`} stroke={RED} strokeWidth="10" strokeLinecap="round" />}
  </g>
);

// ---------------------------------------------------------------- elementi dello schema

const Node: React.FC<{ T: number; t0: number; p: P; name: string; sub?: string; subFill?: string; ring?: number; r?: number; fade?: number; color?: string; side?: 'below' | 'above'; children?: React.ReactNode; size?: number }> = ({
  T, t0, p, name, sub, subFill = '#D8CCEA', ring = 0, r = 76, fade = 1, color = INK, side = 'below', children, size: size0 = 42,
}) => {
  if (T < t0 || fade <= 0) return null;
  const size = fit(size0);
  const s = pop(T, t0);
  const ly = side === 'below' ? r + size + 6 : -r - (sub ? size * 0.95 + 18 : 18);
  return (
    <g transform={`translate(${p[0]} ${p[1]})`} opacity={seg(T, t0, t0 + 0.15) * fade}>
      <g transform={`scale(${s})`}>
        {ring > 0 && <Glow id={`gv-g${p[0]}${p[1]}`} x={0} y={0} r={r * 2.4} t={T} color={YEL} amp={0.1} rate={2.4} opacity={0.5 * Math.min(1, ring)} />}
        <circle r={r} fill="#22123A" stroke={ring > 0.5 ? YEL : color} strokeWidth={ring > 0.5 ? 7 : 4.5} />
        <circle r={r - 8} fill="none" stroke={DIM} strokeWidth="1.5" opacity=".6" />
        <g transform={`scale(${r / 44})`}>{children}</g>
      </g>
      {name && <text y={ly} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke" opacity={seg(T, t0 + 0.2, t0 + 0.5)}>{name}</text>}
      {sub && !WIDEV && <text y={ly + size * 0.85} textAnchor="middle" fontFamily={SANS} fontWeight={subFill === '#D8CCEA' ? 400 : 800} fontSize={size * 0.72} fill={subFill} stroke={DARK} strokeWidth="5" paintOrder="stroke" opacity={seg(T, t0 + 0.3, t0 + 0.6)}>{sub}</text>}
    </g>
  );
};

/** Linea dello schema che si disegna (maschera). `flow` fa scorrere il tratteggio. */
const Link: React.FC<{ T: number; t0: number; a: P; b: P; c?: P; color?: string; dashed?: boolean; label?: string; arrow?: boolean; w?: number; lx?: number; ly?: number; size?: number; fade?: number; flow?: boolean }> = ({
  T, t0, a, b, c, color = INK, dashed = false, label, arrow = false, w = 6, lx = 0, ly = 0, size: size0 = 44, fade = 1, flow = false,
}) => {
  const size = fit(size0);
  if (T < t0 || fade <= 0) return null;
  const p = eo(seg(T, t0, t0 + 0.6));
  const [mx, my] = c ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  const ang = (Math.atan2(b[1] - my, b[0] - mx) * 180) / Math.PI;
  const id = `gv-m${a[0]}${a[1]}${b[0]}${b[1]}`;
  const tx = 0.25 * a[0] + 0.5 * mx + 0.25 * b[0], ty = 0.25 * a[1] + 0.5 * my + 0.25 * b[1];
  return (
    <g opacity={fade}>
      <mask id={id} maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="9000"><path d={d} fill="none" stroke="#fff" strokeWidth={w + 10} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dashed ? `${w * 3} ${w * 2.2}` : undefined} strokeDashoffset={flow ? -T * 60 : 0} strokeLinecap="round" mask={`url(#${id})`} />
      {arrow && p > 0.95 && <path d={`M${-w * 3.4} ${-w * 2.3} L0 0 L${-w * 3.4} ${w * 2.3}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`} />}
      {label && !WIDEV && (
        <text x={tx + lx} y={ty + ly} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={size} fill={color} stroke={DARK} strokeWidth="7" paintOrder="stroke" opacity={seg(T, t0 + 0.4, t0 + 0.8)}>{label}</text>
      )}
    </g>
  );
};

/** Cartellino pieno = colpo di scena o parola chiave. */
const Tag: React.FC<{ T: number; t0: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number; until?: number }> = ({
  T, t0, x, y, text, bg = YEL, fg = DARK, size: size0 = 36, rot = 0, until = 1e9,
}) => {
  const size = fit(size0);
  if (T < t0 || T > until + 0.5) return null;
  const w = text.length * size * 0.56 + size;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(T, t0)})`} opacity={1 - seg(T, until, until + 0.5)}>
      <rect x={-w / 2 + size * 0.12} y={-size * 0.95 + size * 0.12} width={w} height={size * 1.6} rx={size * 0.3} fill="#000" opacity=".35" />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.3} fill={bg} />
      <text y={size * 0.33} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};

/** Nome di un luogo sulla mappa, a lettere spaziate. */
const PlaceName: React.FC<{ T: number; t0: number; x: number; y: number; text: string; size?: number; color?: string; fade?: number }> = ({ T, t0, x, y, text, size: size0 = 40, color = INK, fade = 1 }) => {
  if (T < t0) return null;
  const size = fit(size0);
  return (
    <text x={x} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} letterSpacing={size * 0.18} fill={color} stroke={DARK} strokeWidth={size * 0.2} paintOrder="stroke" opacity={seg(T, t0, t0 + 0.4) * fade}>{text}</text>
  );
};

/** Spillo sulla mappa; `unknown` = tratteggiato con il punto di domanda (si conosce solo il nome). */
const Pin: React.FC<{ T: number; t0: number; x: number; y: number; unknown?: boolean; color?: string }> = ({ T, t0, x, y, unknown = false, color = PINK }) => {
  if (T < t0) return null;
  const s = pop(T, t0);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="4" rx="18" ry="7" fill="#000" opacity=".35" />
      <path d="M0 0 Q-34 -40 -34 -64 A34 34 0 1 1 34 -64 Q34 -40 0 0 Z" fill={unknown ? '#2A1848' : color} stroke={unknown ? INK : DARK} strokeWidth="4" strokeDasharray={unknown ? '10 7' : undefined} />
      {unknown
        ? <text y="-50" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="44" fill={YEL}>?</text>
        : <circle cy="-64" r="12" fill={INK} />}
    </g>
  );
};

// ---------------------------------------------------------------- disegni della mappa

const rr = rng(2026);
const STARS = Array.from({ length: 40 }, () => ({ x: -300 + rr() * 1700, y: -200 + rr() * 3200, s: 1.5 + rr() * 2.5, ph: rr() * 6 }));
const WAVES = Array.from({ length: 70 }, () => ({ x: -300 + rr() * 1700, y: 100 + rr() * 2800, w: 30 + rr() * 50, ph: rr() * 6 }));
const PALMS = Array.from({ length: 12 }, (_, i) => ({ x: 700 + ((i * 47) % 250), y: 1510 + ((i * 31) % 40), h: 50 + ((i * 13) % 26), ph: rr() * 6 }));
const REEDS = Array.from({ length: 46 }, () => ({ x: 450 + rr() * 330, y: 1350 + rr() * 260, h: 18 + rr() * 22, ph: rr() * 6 }));
const TREES = Array.from({ length: 34 }, () => ({ x: 180 + rr() * 820, y: 230 + rr() * 330, s: 0.7 + rr() * 0.6 }));
const MOTES = Array.from({ length: 22 }, () => ({ x: rr() * 1080, y: rr() * 1920, v: 12 + rr() * 22, s: 2 + rr() * 4, ph: rr() * 6, c: rr() }));
const FLIES = Array.from({ length: 18 }, () => ({ x: 460 + rr() * 320, y: 1340 + rr() * 280, ph: rr() * 6 }));

/** Un percorso stradale (per le luci delle auto che scorrono). */
const ROAD_EAST = 'M960 220 Q900 500 840 700 Q820 900 830 1100 Q840 1250 850 1360 Q840 1560 760 1760 Q700 1900 668 1968';
const ROAD_KEYS = 'M668 1968 Q620 2010 604 2018 Q560 2040 520 2062 Q470 2080 426 2090 Q380 2100 334 2104 Q290 2104 246 2100 Q206 2094 168 2082';
const ROAD_WEST = 'M120 260 Q200 520 250 700 Q280 820 270 900 Q300 1100 480 1240 Q640 1300 760 1320';

/** Una palma (tronco curvo e ciuffo), base in (x, y). */
const Palm: React.FC<{ x: number; y: number; h: number; T: number; ph?: number; s?: number }> = ({ x, y, h, T, ph = 0, s = 1 }) => {
  const sw = Math.sin(T * 1.3 + ph) * 3;
  const tx = x + 8 * s + sw, ty = y - h * s;
  return (
    <g>
      <path d={`M${x} ${y} Q${x + 2 * s} ${y - h * s * 0.5} ${tx} ${ty}`} fill="none" stroke="#1A0D24" strokeWidth={5 * s} strokeLinecap="round" />
      {[-150, -110, -60, -20, 20, 70].map((a, i) => {
        const r = (a * Math.PI) / 180, L = (22 + (i % 2) * 6) * s;
        return <path key={i} d={`M${tx} ${ty} Q${tx + Math.cos(r) * L * 0.6} ${ty + Math.sin(r) * L * 0.6 - 8 * s} ${tx + Math.cos(r) * L} ${ty + Math.sin(r) * L + 6 * s}`} fill="none" stroke="#1A0D24" strokeWidth={4.5 * s} strokeLinecap="round" />;
      })}
    </g>
  );
};

/** Vice City: grattacieli sul mare, l'hotel anni '30 con le insegne al neon, la spiaggia con gli ombrelloni. */
const ViceCity: React.FC<{ T: number; neon: number; old: number }> = ({ T, neon, old }) => {
  const base = 1520;
  const towers = [[690, 120, 38], [732, 190, 46], [780, 150, 40], [822, 230, 50], [870, 170, 42], [906, 110, 34]] as const;
  return (
    <g>
      <Glow id="gv-vc" x={800} y={base - 120} r={260} t={T} color={PINK} amp={0.06} rate={1.8} opacity={0.35 + 0.35 * neon} />
      {/* grattacieli, con il lato in ombra e le finestre accese */}
      {towers.map(([x, h, w], i) => (
        <g key={i}>
          <rect x={x - w / 2} y={base - h} width={w} height={h} fill={`url(#gv-tw)`} stroke={DARK} strokeWidth="4" />
          <rect x={x + w * 0.15} y={base - h} width={w * 0.35} height={h} fill="#000" opacity=".25" />
          <path d={`M${x - w / 2 + 2} ${base - h + 2} V${base}`} stroke={i % 2 ? CYAN : PINK} strokeWidth="2" opacity=".7" />
          {Array.from({ length: Math.floor(h / 18) }, (_, r) => Array.from({ length: 3 }, (_, c) => {
            const on = mod(i * 7 + r * 3 + c * 5, 4) !== 0;
            return on ? <rect key={`${r}-${c}`} x={x - w / 2 + 6 + c * (w - 12) / 3} y={base - h + 8 + r * 18} width={(w - 12) / 3 - 4} height="8" fill={mod(r + c + i, 5) === 0 ? CYAN : YEL} opacity={0.55 + 0.35 * Math.sin(T * 0.7 + i + r)} /> : null;
          }))}
          {i === 3 && <path d={`M${x} ${base - h} V${base - h - 26}`} stroke={INK} strokeWidth="3" />}
          {i === 3 && <circle cx={x} cy={base - h - 28} r="4" fill={RED} opacity={0.4 + 0.6 * (Math.sin(T * 3) > 0 ? 1 : 0)} />}
        </g>
      ))}
      {/* l'hotel anni '30: bianco e rosa, con l'insegna verticale */}
      <g transform={`translate(620 ${base})`}>
        <rect x="-50" y="-96" width="100" height="96" fill="#F6E4EE" stroke={DARK} strokeWidth="4" />
        <rect x="10" y="-96" width="40" height="96" fill="#000" opacity=".15" />
        <rect x="-56" y="-104" width="112" height="12" fill={CYAN} stroke={DARK} strokeWidth="3" />
        <rect x="-22" y="-128" width="44" height="26" fill="#F6E4EE" stroke={DARK} strokeWidth="3" />
        {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={-42 + c * 22} y={-86 + r * 20} width="14" height="11" fill={mod(r * 3 + c, 4) ? YEL : '#3A2050'} stroke={DARK} strokeWidth="1.5" />))}
        <rect x="-10" y="-16" width="20" height="16" fill="#3A2050" />
        <rect x="-78" y="-120" width="20" height="96" rx="5" fill="#2A1238" stroke={PINK} strokeWidth="3" />
        {'HOTEL'.split('').map((ch, k) => (
          <text key={k} x="-68" y={-100 + k * 18} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="16" fill={neon > 0.5 ? '#FFD6EA' : '#6A3A5A'} stroke={PINK} strokeWidth={neon > 0.5 ? 1.5 : 0}>{ch}</text>
        ))}
        {neon > 0 && <Glow id="gv-hn" x={-68} y={-72} r={70} t={T} color={PINK} amp={0.1} rate={4} opacity={0.8 * neon} />}
      </g>
      {/* insegne al neon sui palazzi */}
      {neon > 0 && (
        <g opacity={neon}>
          <Glow id="gv-n1" x={780} y={base - 60} r={60} t={T} color={CYAN} amp={0.1} rate={5} opacity={0.7} />
          <rect x="756" y={base - 72} width="48" height="20" rx="8" fill="none" stroke={CYAN} strokeWidth="4" />
          <Glow id="gv-n2" x={870} y={base - 40} r={50} t={T} color={PINK} amp={0.12} rate={6} ph={1} opacity={0.7} />
          <path d={`M856 ${base - 30} q14 -24 28 0`} fill="none" stroke={PINK} strokeWidth="4" />
        </g>
      )}
      {/* il lungomare: strada con le luci e le palme */}
      <path d={`M560 ${base + 6} H960`} stroke="#1A0D24" strokeWidth="14" />
      <path d={`M560 ${base + 6} H960`} stroke={YEL} strokeWidth="2.5" strokeDasharray="14 12" strokeDashoffset={-T * 30} opacity=".7" />
      {PALMS.map((p, i) => <Palm key={i} x={p.x} y={p.y} h={p.h} T={T} ph={p.ph} s={0.9} />)}
      {/* la spiaggia con gli ombrelloni, sulla striscia di sabbia */}
      {[[934, 1350, PINK], [938, 1420, CYAN], [930, 1490, YEL], [918, 1560, PINK]].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0 0 V-18" stroke={DARK} strokeWidth="2.5" />
          <path d="M-14 -16 Q0 -30 14 -16 Z" fill={c as string} stroke={DARK} strokeWidth="2" />
        </g>
      ))}
      {/* la cartolina del 2002 copre la città in seppia finché la voce non dice «rifatta da capo» */}
      {old > 0 && <rect x="560" y={base - 260} width="420" height="300" fill="#C8A878" opacity={0.55 * old} />}
    </g>
  );
};

// ---------------------------------------------------------------- oggetti degli altri personaggi e della bacheca

/** Cal Hampton, l'amico paranoico: un binocolo. */
const Binoculars: React.FC = () => (
  <g strokeLinejoin="round">
    {[-15, 15].map((x) => (
      <g key={x}>
        <rect x={x - 12} y="-24" width="24" height="34" rx="6" fill="#2A2438" stroke={INK} strokeWidth="3.5" />
        <circle cx={x} cy="16" r="13" fill="#1A1424" stroke={INK} strokeWidth="3.5" />
        <circle cx={x} cy="16" r="7" fill={CYAN} opacity=".7" />
        <circle cx={x - 3} cy="13" r="2.5" fill="#FFFFFF" opacity=".8" />
      </g>
    ))}
    <rect x="-4" y="-16" width="8" height="18" fill="#3A3448" stroke={INK} strokeWidth="2.5" />
  </g>
);
/** Boobie Ike, l'impero di affari: un'insegna al neon con il dollaro. */
const DollarSign: React.FC<{ T: number }> = ({ T }) => (
  <g strokeLinejoin="round">
    <rect x="-32" y="-28" width="64" height="56" rx="10" fill="#1A0D24" stroke={INK} strokeWidth="3.5" />
    <text y="18" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="48" fill="none" stroke={YEL} strokeWidth={4 + Math.sin(T * 9) * 0.6}>$</text>
    <path d="M-20 -36 V-28 M20 -36 V-28" stroke={INK} strokeWidth="3" />
  </g>
);
/** Dre'Quan Priest e Only Raw Records: un disco in vinile che gira. */
const Vinyl: React.FC<{ T: number }> = ({ T }) => (
  <g transform={`rotate(${T * 120})`}>
    <circle r="32" fill="#14101C" stroke={INK} strokeWidth="3.5" />
    {[26, 20, 14].map((r) => <circle key={r} r={r} fill="none" stroke="#3A3448" strokeWidth="1.5" />)}
    <circle r="10" fill={PINK} />
    <circle r="2.5" fill={INK} />
    <path d="M-24 -14 A28 28 0 0 1 -6 -27" fill="none" stroke="#FFFFFF" strokeWidth="2.5" opacity=".5" />
  </g>
);
/** Raul Bautista, il rapinatore di banche: la manopola di una cassaforte. */
const SafeDial: React.FC<{ T: number }> = ({ T }) => (
  <g strokeLinejoin="round">
    <rect x="-32" y="-32" width="64" height="64" rx="6" fill="#4A5060" stroke={INK} strokeWidth="3.5" />
    <circle r="20" fill="#2A2E3A" stroke={INK} strokeWidth="3" />
    <g transform={`rotate(${Math.sin(T * 1.2) * 120})`}>
      {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -17 V-12" stroke={INK} strokeWidth="2" transform={`rotate(${i * 30})`} />)}
      <path d="M0 0 V-14" stroke={YEL} strokeWidth="4" strokeLinecap="round" />
    </g>
    <path d="M24 -8 V8" stroke={INK} strokeWidth="5" strokeLinecap="round" />
  </g>
);
/** Il giornale con la notizia assurda (il meme del Florida Man). */
const Newspaper: React.FC = () => (
  <g strokeLinejoin="round">
    <rect x="-70" y="-90" width="140" height="180" fill="#F2ECDE" stroke={INK} strokeWidth="4" />
    <text y="-62" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="17" letterSpacing="1" fill={DARK}>LEONIDA NEWS</text>
    <path d="M-60 -54 H60" stroke={DARK} strokeWidth="2" />
    <text y="-28" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="21" fill={RED}>UOMO DELLA</text>
    <text y="-6" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="21" fill={RED}>FLORIDA…</text>
    <rect x="-58" y="6" width="54" height="44" fill="#C8BCA8" />
    <path d="M-50 44 Q-40 20 -30 30 Q-20 14 -10 44 Z" fill="#3A6A3A" />
    {[10, 22, 34, 46, 62, 74].map((y) => <path key={y} d={`M${y < 50 ? 4 : -58} ${y} H58`} stroke="#8A8070" strokeWidth="3" />)}
  </g>
);
/** Paracadute che scende. */
const Parachute: React.FC = () => (
  <g strokeLinejoin="round">
    <path d="M-50 0 Q-50 -50 0 -54 Q50 -50 50 0 Q38 -10 25 0 Q12 -10 0 0 Q-12 -10 -25 0 Q-38 -10 -50 0 Z" fill={PINK} stroke={INK} strokeWidth="3.5" />
    <path d="M-25 0 Q-20 -30 0 -54 M25 0 Q20 -30 0 -54" fill="none" stroke={INK} strokeWidth="2" opacity=".6" />
    <path d="M-50 0 L-6 48 M-25 0 L-3 48 M25 0 L3 48 M50 0 L6 48" stroke={INK} strokeWidth="1.8" />
    <rect x="-9" y="46" width="18" height="16" rx="3" fill={YEL} stroke={INK} strokeWidth="2.5" />
  </g>
);
/** Pallone da basket. */
const Ball: React.FC = () => (
  <g>
    <circle r="26" fill="#E8762A" stroke={INK} strokeWidth="3.5" />
    <path d="M-26 0 H26 M0 -26 V26 M-18 -18 Q0 0 -18 18 M18 -18 Q0 0 18 18" fill="none" stroke={DARK} strokeWidth="2.5" />
  </g>
);
/** Maschera da sub con le bolle. */
const DiveMask: React.FC<{ T: number }> = ({ T }) => (
  <g strokeLinejoin="round">
    <path d="M-34 -14 Q-34 -24 -24 -24 H24 Q34 -24 34 -14 V8 Q34 16 24 16 H8 L0 8 L-8 16 H-24 Q-34 16 -34 8 Z" fill={CYAN} stroke={INK} strokeWidth="3.5" opacity=".9" />
    <path d="M-26 -16 H-4 V8 H-26 Z M4 -16 H26 V8 H4 Z" fill="#1E5A6A" />
    <path d="M36 -10 V-50 Q36 -60 44 -60" fill="none" stroke={YEL} strokeWidth="6" strokeLinecap="round" />
    {[0, 1, 2].map((k) => { const u = mod(T * 0.6 + k / 3, 1); return <circle key={k} cx={44 + Math.sin(u * 9) * 5} cy={-64 - u * 60} r={3 + u * 4} fill="none" stroke={INK} strokeWidth="2" opacity={1 - u} />; })}
  </g>
);
/** Icona tonda della bacheca: un cerchio con un disegno dentro e il nome sotto. */
const Icon: React.FC<{ T: number; t0: number; x: number; y: number; label: string; children: React.ReactNode; until?: number; color?: string }> = ({ T, t0, x, y, label, children, until = 1e9, color = INK }) => {
  if (T < t0 || T > until + 0.5) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${pop(T, t0)})`} opacity={1 - seg(T, until, until + 0.5)}>
      <circle r="62" fill="#22123A" stroke={color} strokeWidth="5" />
      <g transform="scale(1.3)">{children}</g>
      <text y="104" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="34" fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke">{label}</text>
    </g>
  );
};
const Plate: React.FC = () => (
  <g><ellipse rx="30" ry="22" fill="#F4F0FA" stroke={DARK} strokeWidth="3" /><ellipse rx="18" ry="12" fill="#E8B04A" /><path d="M-40 -18 V18 M40 -18 V18" stroke={INK} strokeWidth="4" strokeLinecap="round" /></g>
);
const Dumbbell: React.FC = () => (
  <g><rect x="-26" y="-4" width="52" height="8" fill="#B9BFCC" stroke={DARK} strokeWidth="2" />{[-30, 22].map((x) => <rect key={x} x={x} y="-18" width="8" height="36" rx="2" fill="#3A3448" stroke={INK} strokeWidth="2.5" />)}{[-38, 30].map((x) => <rect key={x} x={x} y="-12" width="8" height="24" rx="2" fill="#3A3448" stroke={INK} strokeWidth="2.5" />)}</g>
);
const Moon: React.FC = () => (
  <g><path d="M8 -26 A26 26 0 1 0 26 8 A20 20 0 1 1 8 -26 Z" fill={YEL} stroke={INK} strokeWidth="3" /><text x="18" y="-14" fontFamily={SANS} fontWeight={900} fontSize="16" fill={INK}>z</text><text x="28" y="-28" fontFamily={SANS} fontWeight={900} fontSize="12" fill={INK}>z</text></g>
);
const Hanger: React.FC = () => (
  <g fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round"><path d="M0 -14 Q0 -26 8 -26 Q14 -26 14 -20 Q14 -14 6 -12 L0 -10 L-34 12 H34 Z" /><path d="M-26 12 L-20 30 H20 L26 12" stroke={PINK} strokeWidth="5" /></g>
);
const Scissors: React.FC = () => (
  <g fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round"><circle cx="-12" cy="18" r="9" /><circle cx="12" cy="18" r="9" /><path d="M-6 11 L18 -26 M6 11 L-18 -26" /></g>
);
/** La scatola del gioco aperta: il posto del disco è vuoto, dentro c'è il foglietto con il codice. */
const GameBox: React.FC<{ open: number }> = ({ open }) => (
  <g strokeLinejoin="round">
    <rect x="-150" y="-100" width="140" height="190" rx="8" fill="#2A1238" stroke={INK} strokeWidth="5" transform={`skewY(${-6 * open})`} />
    <rect x="-136" y="-86" width="112" height="162" rx="4" fill="url(#gv-sung)" opacity=".7" transform={`skewY(${-6 * open})`} />
    <rect x="10" y="-100" width="140" height="190" rx="8" fill="#1A1028" stroke={INK} strokeWidth="5" />
    <circle cx="80" cy="-5" r="52" fill="none" stroke={DIM} strokeWidth="4" strokeDasharray="10 8" />
    <text x="80" y="5" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="26" fill={DIM}>vuoto</text>
    <g transform={`translate(80 ${60 - 30 * open}) rotate(-6)`}>
      <rect x="-56" y="-18" width="112" height="36" rx="4" fill="#FBF5FA" stroke={DARK} strokeWidth="2.5" />
      <text y="8" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="18" letterSpacing="2" fill={DARK}>CODICE ▸</text>
    </g>
  </g>
);
/** La scatola regalo del Vintage Vice City Pack. */
const Gift: React.FC<{ T: number; open: number }> = ({ T, open }) => (
  <g strokeLinejoin="round">
    <Glow id="gv-gift" x={0} y={-30} r={230} t={T} color={PINK} amp={0.08} rate={2} opacity={0.5 * open} />
    {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2 + T * 0.5; return <path key={i} d={`M${Math.cos(a) * 110} ${-60 + Math.sin(a) * 70} l${Math.cos(a) * 26 * open} ${Math.sin(a) * 26 * open}`} stroke={i % 2 ? YEL : CYAN} strokeWidth="5" strokeLinecap="round" opacity={open} />; })}
    <rect x="-110" y="-40" width="220" height="140" rx="8" fill="#F6E4EE" stroke={INK} strokeWidth="5" />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-110 + i * 44} -40 L${-80 + i * 44} 100`} stroke={CYAN} strokeWidth="12" opacity=".35" />)}
    <rect x="-16" y="-40" width="32" height="140" fill={PINK} stroke={INK} strokeWidth="3" />
    <g transform={`translate(0 ${-40 - 60 * open}) rotate(${-14 * open})`}>
      <rect x="-122" y="-34" width="244" height="40" rx="8" fill="#F6E4EE" stroke={INK} strokeWidth="5" />
      <rect x="-16" y="-34" width="32" height="40" fill={PINK} stroke={INK} strokeWidth="3" />
      <path d="M0 -34 Q-40 -76 -54 -50 Q-56 -34 0 -34 Q40 -76 54 -50 Q56 -34 0 -34 Z" fill={PINK} stroke={INK} strokeWidth="3" />
    </g>
    <g transform="translate(0 40)">
      <rect x="-96" y="-30" width="192" height="60" rx="10" fill="#1A0D24" stroke={PINK} strokeWidth="3" />
      <text y="-4" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="20" letterSpacing="3" fill={PINK}>VINTAGE</text>
      <text y="20" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="20" letterSpacing="3" fill={CYAN}>VICE CITY PACK</text>
    </g>
  </g>
);

/** La bacheca sotto le Keys: Criminal Profile e fisico (capitolo 6), uscita (9), edizioni (10). */
const Board: React.FC<{ T: number }> = ({ T }) => {
  const y = INTRO_Y;
  const prof = focus(T, at('profilo', 0), end('profilo') - 0.3);
  const usc = focus(T, at('uscita', 0), end('uscita') - 0.3);
  const ediz = focus(T, at('edizioni', 0), at('edizioni', 3, 0.2));
  return (
    <g>
      {/* il tramonto a righe sull'orizzonte del mare, dietro la bacheca */}
      <Glow id="gv-sun" x={540} y={y + 520} r={560} t={T} color={PINK} amp={0.05} rate={1.4} opacity={0.45} />
      <clipPath id="gv-sunc"><rect x="0" y={y + 200} width="1080" height="380" /></clipPath>
      <g clipPath="url(#gv-sunc)">
        <circle cx="540" cy={y + 560} r="300" fill="url(#gv-sung)" opacity=".85" />
        {Array.from({ length: 7 }, (_, i) => <rect key={i} x="200" y={y + 420 + i * 22 + mod(T * 8, 22)} width="680" height={3 + i * 1.6} fill="#1A0B34" />)}
      </g>
      <path d={`M-300 ${y + 580} H1400`} stroke={PINK} strokeWidth="4" opacity=".8" />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${160 + i * 30} ${y + 610 + i * 24} H${920 - i * 30}`} stroke={YEL} strokeWidth="5" opacity={0.5 - i * 0.07} strokeDasharray={`${40 + i * 10} 30`} strokeDashoffset={-T * 20} />)}
      {[60, 1020].map((x, i) => <Palm key={x} x={x} y={y + 600} h={170} T={T} ph={i} s={1.6} />)}

      {/* ---- capitolo 6: il Criminal Profile */}
      {prof > 0 && (
        <g opacity={prof}>
          <g opacity={1 - seg(T, at('profilo', 2), at('profilo', 2, 0.5))}>
          <g transform={`translate(540 ${y - 130}) scale(${pop(T, at('profilo', 0, 0.1))})`}>
            <rect x="-300" y="-170" width="600" height="320" rx="16" fill="#1A1028" stroke={INK} strokeWidth="5" />
            <rect x="-300" y="-170" width="600" height="64" rx="16" fill={RED} />
            <rect x="-300" y="-120" width="600" height="14" fill={RED} />
            <text y="-126" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="36" letterSpacing="5" fill="#FFFFFF">CRIMINAL PROFILE</text>
            <rect x="-270" y="-84" width="110" height="130" rx="6" fill="#2A2438" stroke={DIM} strokeWidth="3" />
            <text x="-215" y="0" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="60" fill={DIM}>?</text>
            {([['furti', 0.75, YEL], ['inseguimenti', 0.55, CYAN], ['violenza inutile', 0.35, RED]] as const).map(([lab, v, c], i) => {
              const fill = v * eo(seg(T, at('profilo', 0, 0.6 + i * 0.3), at('profilo', 0, 1.4 + i * 0.3))) + (i === 2 ? 0.4 * eo(seg(T, at('profilo', 1, 0.1), at('profilo', 1, 0.8))) : 0);
              return (
                <g key={lab} transform={`translate(-130 ${-56 + i * 66})`}>
                  <text x="0" y="0" fontFamily={SANS} fontWeight={800} fontSize="26" fill={INK}>{lab}</text>
                  <rect x="0" y="10" width="380" height="20" rx="10" fill="#2A2438" />
                  <rect x="0" y="10" width={380 * Math.min(1, fill)} height="20" rx="10" fill={c} />
                </g>
              );
            })}
          </g>
          {/* il mondo e la storia reagiscono: due frecce che escono dal profilo */}
          <Link T={T} t0={at('profilo', 1, 0.4)} a={[300, y + 30]} b={[160, y + 200]} c={[180, y + 60]} color={YEL} arrow w={7} label="il mondo reagisce" lx={-10} ly={110} size={38} />
          <Link T={T} t0={at('profilo', 1, 0.7)} a={[780, y + 30]} b={[920, y + 200]} c={[900, y + 60]} color={YEL} arrow w={7} label="e la storia" lx={20} ly={110} size={38} />
          {T >= at('profilo', 1, 0.6) && <g transform={`translate(160 ${y + 250}) scale(${1.6 * pop(T, at('profilo', 1, 0.6))})`}><Siren T={T} id="gv-ps" /></g>}
          {T >= at('profilo', 1, 0.9) && <g transform={`translate(920 ${y + 250}) scale(${pop(T, at('profilo', 1, 0.9))})`}><rect x="-44" y="-30" width="88" height="60" rx="6" fill="#F2ECDE" stroke={INK} strokeWidth="3" /><path d="M-32 -14 H32 M-32 0 H32 M-32 14 H14" stroke="#8A8070" strokeWidth="4" /></g>}
          </g>
          {/* il fisico: cibo, palestra, sonno; poi vestiti e capelli */}
          <Icon T={T} t0={at('profilo', 2, 0.2)} x={240} y={y + 400} label="cibo"><Plate /></Icon>
          <Icon T={T} t0={at('profilo', 2, 0.5)} x={540} y={y + 400} label="palestra"><Dumbbell /></Icon>
          <Icon T={T} t0={at('profilo', 2, 0.8)} x={840} y={y + 400} label="sonno"><Moon /></Icon>
          <Icon T={T} t0={at('profilo', 3, 0.2)} x={390} y={y + 230} label="vestiti" color={PINK}><Hanger /></Icon>
          <Icon T={T} t0={at('profilo', 3, 0.5)} x={690} y={y + 230} label="capelli" color={PINK}><Scissors /></Icon>
        </g>
      )}

      {/* ---- capitolo 9: la data, il preload, la scatola senza disco */}
      {usc > 0 && (
        <g opacity={usc}>
          <g opacity={1 - seg(T, at('uscita', 2), at('uscita', 2, 0.5))}>
          <g transform={`translate(330 ${y - 130}) scale(${1.4 * pop(T, at('uscita', 0, 0.1))})`}>
            <Glow id="gv-cal" x={0} y={0} r={170} t={T} color={YEL} amp={0.1} rate={2.4} opacity={0.6} />
            <Sheet top="GIOVEDÌ · NOVEMBRE" big="19" w={190} color={PINK} />
          </g>
          <Tag T={T} t0={at('uscita', 0, 0.6)} x={740} y={y - 210} text="PlayStation 5" bg={CYAN} size={40} />
          <Tag T={T} t0={at('uscita', 0, 0.9)} x={740} y={y - 120} text="Xbox Series" bg={CYAN} size={40} />
          {T >= at('uscita', 0, 1.4) && (
            <g transform={`translate(740 ${y - 30}) scale(${pop(T, at('uscita', 0, 1.4))})`}>
              <rect x="-80" y="-30" width="160" height="60" rx="12" fill="#2A2438" stroke={DIM} strokeWidth="3" />
              <text y="12" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="34" fill={DIM}>PC</text>
              <path d="M-70 -24 L70 24" stroke={RED} strokeWidth="8" strokeLinecap="round" />
            </g>
          )}
          </g>
          {T >= at('uscita', 1, 0.1) && (() => {
            const p = eo(seg(T, at('uscita', 1, 0.3), at('uscita', 1, 2.6)));
            return (
              <g transform={`translate(540 ${y + 150}) scale(${pop(T, at('uscita', 1, 0.1))})`}>
                <text y="-40" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="36" fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke">preload dal 10 novembre</text>
                <rect x="-300" y="-14" width="600" height="44" rx="22" fill="#2A2438" stroke={INK} strokeWidth="4" />
                <rect x="-294" y="-8" width={588 * p} height="32" rx="16" fill="url(#gv-bar)" />
                <path d="M-14 -88 V-62 M-26 -74 L-14 -62 L-2 -74" transform="translate(-260 0)" fill="none" stroke={CYAN} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <text y="82" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="52" fill={YEL} stroke={DARK} strokeWidth="7" paintOrder="stroke">oltre 200 GB</text>
              </g>
            );
          })()}
          {T >= at('uscita', 2, 0.1) && <g transform={`translate(540 ${y + 400}) scale(${1.15 * pop(T, at('uscita', 2, 0.1))})`}><GameBox open={eo(seg(T, at('uscita', 2, 0.4), at('uscita', 2, 1.2)))} /></g>}
        </g>
      )}

      {/* ---- capitolo 10: il Vintage Vice City Pack, niente microtransazioni */}
      {ediz > 0 && (
        <g opacity={ediz}>
          {T >= at('edizioni', 0, 0.1) && <g transform={`translate(540 ${y - 110}) scale(${1.35 * pop(T, at('edizioni', 0, 0.1))})`}><Gift T={T} open={eo(seg(T, at('edizioni', 0, 0.8), at('edizioni', 0, 1.6)))} /></g>}
          <Tag T={T} t0={at('edizioni', 0, 1.2)} x={540} y={y + 140} text="digitale, entro il 20 novembre" size={40} />
          <text x="540" y={y + 230} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="50" fill={PINK} stroke={DARK} strokeWidth="8" paintOrder="stroke" opacity={seg(T, at('edizioni', 1, 0.2), at('edizioni', 1, 0.6))}>ispirato a Tommy Vercetti</text>
          {T >= at('edizioni', 2, 0.1) && (
            <g transform={`translate(540 ${y + 400}) scale(${pop(T, at('edizioni', 2, 0.1))})`}>
              <circle r="74" fill="#E8B04A" stroke={INK} strokeWidth="6" />
              <circle r="58" fill="none" stroke="#B8802A" strokeWidth="4" />
              <text y="22" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="70" fill="#8A5A1A">$</text>
              <path d="M-90 -90 L90 90" stroke={RED} strokeWidth="16" strokeLinecap="round" />
              <text x="120" y="10" fontFamily={SANS} fontWeight={900} fontSize="38" fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke">niente</text>
              <text x="120" y="50" fontFamily={SANS} fontWeight={900} fontSize="30" fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke">microtransazioni</text>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

const Schema: React.FC<{ T: number }> = ({ T }) => {
  const drawn = eo(seg(T, at('mappa', 0, -0.3), at('mappa', 0, 0.7)));
  const filled = seg(T, at('mappa', 0, -0.1), at('mappa', 0, 0.7));
  const neon = Math.max(seg(T, at('mappa', 0, 1.2), at('mappa', 0, 1.6)), seg(T, at('vicecity', 0, 0.1), at('vicecity', 0, 0.5)));
  const old = focus(T, at('vicecity', 0, 0.2), at('vicecity', 1, 0.1));
  const keys = seg(T, at('mappa', 1, 0.1), at('mappa', 1, 1.0));
  const swamp = seg(T, at('mappa', 1, 0.5), at('mappa', 1, 1.2));
  const plot = seg(T, at('colpo', 1, 0.1), at('colpo', 1, 0.8));
  const alarm = focus(T, at('colpo', 0, 0.9), end('colpo'));
  const gone = (ch: string) => 1 - seg(T, end(ch) - 0.1, end(ch) + 0.4);
  // i due protagonisti si accendono quando la voce parla di loro
  const ringJ = focus(T, at('coppia', 0), at('coppia', 2)) + focus(T, at('colpo', 2), end('insieme')) + focus(T, at('edizioni', 3), end('edizioni') + 2);
  const ringL = focus(T, at('coppia', 2), end('coppia')) + focus(T, at('colpo', 2), end('insieme')) + focus(T, at('edizioni', 3), end('edizioni') + 2);
  return (
    <g>
      {/* il mare: stelle riflesse e onde */}
      {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.s} fill={INK} opacity={0.15 + 0.2 * Math.sin(T * 1.5 + s.ph)} />)}
      {WAVES.map((w, i) => <path key={`w${i}`} d={`M${w.x + Math.sin(T * 0.6 + w.ph) * 10} ${w.y} q${w.w / 4} -6 ${w.w / 2} 0 t${w.w / 2} 0`} fill="none" stroke={CYAN} strokeWidth="2.5" opacity={0.18 + 0.1 * Math.sin(T + w.ph)} />)}

      {/* la terra di Leonida: si disegna all'inizio del primo capitolo */}
      {drawn > 0 && (
        <g>
          <mask id="gv-coastm" maskUnits="userSpaceOnUse" x="-400" y="-400" width="2000" height="3000">
            <path d={COAST_D} fill="none" stroke="#fff" strokeWidth="40" pathLength={1} strokeDasharray={`${drawn} 1`} />
          </mask>
          <path d={LAND_D} fill="url(#gv-land)" opacity={filled} />
          <path d={LAND_D} fill="url(#gv-dots)" opacity={0.5 * filled} />
          <path d={COAST_D} fill="none" stroke="#7A4AA8" strokeWidth="26" opacity={0.6 * filled} />
          <g opacity={filled}>
            {TREES.map((t, i) => <g key={i} transform={`translate(${t.x} ${t.y}) scale(${t.s})`}><path d="M0 -26 L14 4 H-14 Z" fill="#2E5A4E" stroke={DARK} strokeWidth="2.5" /><path d="M0 4 V12" stroke={DARK} strokeWidth="3" /></g>)}
            <path d="M330 470 L430 300 L500 380 L560 290 L660 470 Z" fill="#4A3270" stroke={DARK} strokeWidth="4" strokeLinejoin="round" />
            <path d="M430 300 L452 336 L470 324 M560 290 L580 322 L600 312" fill="none" stroke={INK} strokeWidth="3" opacity=".7" />
            <path d="M-200 200 H1300" stroke={DIM} strokeWidth="4" strokeDasharray="22 14" opacity=".7" />
            <path d={LAKE_D} fill="#2A5AA8" stroke={CYAN} strokeWidth="3" opacity=".9" />
            {[0, 1, 2].map((k) => <path key={k} d={`M${580 + k * 30} ${1040 + k * 18} q10 -4 20 0`} stroke={INK} strokeWidth="2" fill="none" opacity=".5" />)}
            {[ROAD_EAST, ROAD_KEYS, ROAD_WEST].map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" stroke="#1A0D24" strokeWidth="12" strokeLinecap="round" />
                <path d={d} fill="none" stroke={i === 1 ? CYAN : '#E8B86A'} strokeWidth="3" strokeLinecap="round" opacity=".75" />
                <path d={d} fill="none" stroke="#FFF3C8" strokeWidth="7" strokeLinecap="round" pathLength={1} strokeDasharray="0.004 0.06" strokeDashoffset={-T * 0.02 * (i === 2 ? -1 : 1)} />
              </g>
            ))}
          </g>
          <g mask="url(#gv-coastm)">
            <path d={COAST_D} fill="none" stroke={CYAN} strokeWidth="14" opacity=".25" />
            <path d={COAST_D} fill="none" stroke={CYAN} strokeWidth="5" />
          </g>
          <path d={BEACH_D} fill={SAND} stroke={DARK} strokeWidth="3" opacity={filled} />
        </g>
      )}
      <PlaceName T={T} t0={at('mappa', 0, 0.4)} x={420} y={950} text="LEONIDA" size={64} color={YEL} fade={1 - seg(T, at('mappa', 2), at('mappa', 2, 0.4))} />
      <Tag T={T} t0={at('mappa', 0, 0.8)} x={420} y={1040} text="6 zone" size={44} until={at('mappa', 1)} />

      {/* Vice City (la principale) */}
      {filled > 0 && <g opacity={filled}><ViceCity T={T} neon={neon} old={old} /></g>}
      <Pin T={T} t0={at('mappa', 0, 1.6)} x={PLACE.vice[0]} y={PLACE.vice[1] - 230} color={PINK} />
      <PlaceName T={T} t0={at('mappa', 0, 1.6)} x={800} y={1630} text="VICE CITY" size={44} color={PINK} />
      <Tag T={T} t0={at('mappa', 0, 2.0)} x={780} y={1720} text="la Miami del gioco" bg={PINK} fg="#FFFFFF" size={36} until={at('mappa', 1, 0.2)} />

      {/* le Keys: le isole si colorano e il ponte le unisce */}
      {filled > 0 && KEYS.map(([x, y, rx, ry], i) => {
        const on = seg(keys, i / 9, i / 9 + 0.35);
        return (
          <g key={i} opacity={filled}>
            <ellipse cx={x} cy={y} rx={rx + 8} ry={ry + 6} fill={CYAN} opacity={0.2 + 0.25 * on} />
            <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={SAND} stroke={DARK} strokeWidth="3" />
            <ellipse cx={x - rx * 0.2} cy={y - ry * 0.2} rx={rx * 0.6} ry={ry * 0.5} fill="#5AA06A" opacity={0.6 + 0.4 * on} />
            {on > 0.5 && <Palm x={x + 4} y={y} h={34} T={T} ph={i} s={0.9} />}
          </g>
        );
      })}
      {keys > 0 && (
        <g opacity={keys}>
          <path d="M600 2140 l6 -26 h20 l8 26 Z" fill="#F4F1FA" stroke={DARK} strokeWidth="2.5" />
          <path d="M616 2114 V2070 L640 2108 Z" fill={INK} stroke={DARK} strokeWidth="2" transform={`rotate(${Math.sin(T) * 2} 616 2114)`} />
        </g>
      )}
      <PlaceName T={T} t0={at('mappa', 1, 0.3)} x={440} y={2190} text="LEONIDA KEYS" size={40} color={CYAN} />

      {/* Grassrivers: la palude, con canne, nebbia, lucciole, un alligatore e l'idroscivolante */}
      <g transform="translate(565 1725) scale(.55) translate(-610 -1480)">
      {filled > 0 && (
        <g opacity={filled}>
          <path d="M450 1340 Q560 1300 700 1350 Q800 1400 770 1520 Q740 1640 620 1650 Q500 1650 470 1540 Q430 1440 450 1340 Z" fill={SWAMP} opacity={0.55 + 0.35 * swamp} />
          {[[520, 1400, 60, 18], [640, 1440, 70, 20], [560, 1560, 80, 22], [690, 1580, 50, 15]].map(([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#1E5A6A" stroke={CYAN} strokeWidth="2" opacity={0.5 + 0.4 * swamp} />)}
          {REEDS.map((r, i) => <path key={i} d={`M${r.x} ${r.y} q${2 + Math.sin(T * 1.5 + r.ph) * 3} ${-r.h / 2} ${Math.sin(T * 1.5 + r.ph) * 5} ${-r.h}`} stroke="#6AA05A" strokeWidth="3" fill="none" opacity={0.5 + 0.5 * swamp} />)}
          {REEDS.filter((_, i) => i % 3 === 0).map((r, i) => <ellipse key={`c${i}`} cx={r.x + Math.sin(T * 1.5 + r.ph) * 5} cy={r.y - r.h} rx="3" ry="7" fill="#7A4A2A" opacity={0.5 + 0.5 * swamp} />)}
        </g>
      )}
      {swamp > 0 && (
        <g opacity={swamp}>
          <Fog id="gv-fog" t={T} y={1500} x={600} rx={220} ry={70} color="#BFE8E0" drift={30} opacity={0.35} />
          {(() => {
            const gx = 600 + Math.sin(T * 0.4) * 20, gy = 1560;
            return (
              <g>
                {[0, 1].map((k) => { const u = mod(T * 0.5 + k / 2, 1); return <ellipse key={k} cx={gx} cy={gy + 6} rx={30 + u * 40} ry={8 + u * 10} fill="none" stroke={CYAN} strokeWidth="2" opacity={0.6 * (1 - u)} />; })}
                <path d={`M${gx - 40} ${gy + 4} Q${gx - 20} ${gy - 8} ${gx + 10} ${gy - 4} Q${gx + 36} ${gy - 2} ${gx + 44} ${gy + 4} Z`} fill="#3A6A3A" stroke={DARK} strokeWidth="3" />
                {[-22, -8].map((dx) => <g key={dx}><circle cx={gx + dx} cy={gy - 6} r="6" fill="#3A6A3A" stroke={DARK} strokeWidth="2" /><circle cx={gx + dx} cy={gy - 7} r="3" fill={YEL} /></g>)}
              </g>
            );
          })()}
          {FLIES.map((f, i) => <circle key={i} cx={f.x + Math.sin(T * 0.8 + f.ph) * 14} cy={f.y + Math.cos(T * 0.6 + f.ph) * 10} r="3.5" fill="#FFF08A" opacity={0.3 + 0.5 * Math.max(0, Math.sin(T * 2 + f.ph))} />)}
          <g transform={`translate(${520 + Math.sin(T * 0.3) * 10} 1430)`}>
            <path d="M-26 6 H24 L18 14 H-22 Z" fill="#E9E3F2" stroke={DARK} strokeWidth="2.5" />
            <circle cx="-22" cy="-6" r="13" fill="none" stroke={DARK} strokeWidth="3" />
            <path d="M-22 -18 V6" stroke={INK} strokeWidth="3" transform={`rotate(${T * 900} -22 -6)`} />
          </g>
        </g>
      )}
      </g>
      <PlaceName T={T} t0={at('mappa', 1, 0.7)} x={600} y={1900} text="GRASSRIVERS" size={40} color="#7ADBB0" />

      {/* i tre posti di cui si sa solo il nome */}
      {([[PLACE.port, 'PORT GELLHORN', 0], [PLACE.ambrosia, 'AMBROSIA', 1], [PLACE.kalaga, 'MONTE KALAGA', 2]] as const).map(([p, name, k]) => {
        const t0 = at('mappa', 2, 0.2 + k * 0.5);
        return (
          <g key={name}>
            <Pin T={T} t0={t0} x={p[0]} y={p[1]} unknown />
            <PlaceName T={T} t0={t0 + 0.2} x={p[0] + (k === 0 ? 60 : 0)} y={p[1] + 60} text={name} size={34} />
          </g>
        );
      })}
      {/* tre volte la mappa di Red Dead Redemption 2 */}
      {T >= at('mappa', 3, 0.1) && (() => {
        const p = eo(seg(T, at('mappa', 3, 0.1), at('mappa', 3, 0.7)));
        const grow = eo(seg(T, at('mappa', 3, 1.0), at('mappa', 3, 1.9)));
        const fade = 1 - seg(T, end('mappa') - 0.3, end('mappa') + 0.3);
        return (
          <g opacity={fade}>
            <rect x={420} y={1000} width={280 * p} height={300 * p} fill={DIM} opacity=".3" stroke={INK} strokeWidth="6" strokeDasharray="20 12" />
            <text x="560" y="1140" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={fit(54)} fill={INK} stroke={DARK} strokeWidth="9" paintOrder="stroke" opacity={seg(T, at('mappa', 3, 0.5), at('mappa', 3, 0.9))}>Red Dead</text>
            <text x="560" y="1210" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={fit(54)} fill={INK} stroke={DARK} strokeWidth="9" paintOrder="stroke" opacity={seg(T, at('mappa', 3, 0.5), at('mappa', 3, 0.9))}>Redemption 2</text>
            {grow > 0 && <rect x={lerp(420, 318, grow)} y={lerp(1000, 860, grow)} width={lerp(280, 485, grow)} height={lerp(300, 520, grow)} fill="none" stroke={YEL} strokeWidth="10" strokeDasharray="30 16" strokeDashoffset={-T * 40} />}
          </g>
        );
      })()}
      <Tag T={T} t0={at('mappa', 3, 1.6)} x={200} y={1300} text="× 3" size={90} until={end('mappa') - 0.2} />

      {/* ---- capitolo 2: Vice City, la cartolina del 2006, le foto di Miami */}
      {T >= at('vicecity', 0, 0.3) && (() => {
        const p = pop(T, at('vicecity', 0, 0.3));
        const away = eio(seg(T, at('vicecity', 1, 0.1), at('vicecity', 1, 0.9)));
        if (away >= 1) return null;
        return (
          <g transform={`translate(${lerp(580, 140, away)} ${lerp(1240, 1060, away)}) rotate(${lerp(-8, -40, away)}) scale(${p})`} opacity={1 - away}>
            <rect x="-150" y="-100" width="300" height="200" rx="6" fill="#F2E2C4" stroke={INK} strokeWidth="5" />
            <rect x="-134" y="-84" width="160" height="150" fill="#D9B98A" stroke="#7A5A3A" strokeWidth="3" />
            {[[-120, 50], [-96, 80], [-70, 60], [-44, 95]].map(([x, h], i) => <rect key={i} x={x} y={66 - h} width="22" height={h} fill="#9A7A52" />)}
            <circle cx="0" cy="-40" r="18" fill="#E8A86A" />
            <path d="M40 -70 H130 M40 -40 H120 M40 -10 H110" stroke="#9A8A72" strokeWidth="3" />
            <rect x="96" y="-90" width="40" height="44" fill="none" stroke="#9A6A5A" strokeWidth="3" strokeDasharray="5 3" />
            <text x="80" y="60" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="56" fill="#7A3A2A">2006</text>
          </g>
        );
      })()}
      <Tag T={T} t0={at('vicecity', 0, 0.8)} x={760} y={1700} text="dopo vent'anni" size={40} until={at('vicecity', 1, 0.2)} />
      {T >= at('vicecity', 1, 0.3) && [0, 1, 2].map((k) => {
        // le foto di Miami «dal vero», appuntate intorno alla città, con il lampo del flash
        const t0 = at('vicecity', 1, 0.3 + k * 0.4);
        const [x, y, r] = [[600, 1220, -8], [930, 1190, 7], [620, 1700, 4]][k];
        const f = Math.max(0, 1 - (T - t0) / 0.25);
        return T >= t0 ? (
          <g key={k} transform={`translate(${x} ${y}) rotate(${r}) scale(${pop(T, t0)})`} opacity={gone('vicecity')}>
            <rect x="-62" y="-56" width="124" height="120" fill="#FBF5FA" stroke={INK} strokeWidth="4" />
            <rect x="-52" y="-46" width="104" height="82" fill={['#3A5A9A', '#9A4A7A', '#2A7A8A'][k]} />
            <circle cx={[-20, 18, 0][k]} cy={-18} r="12" fill={YEL} opacity=".9" />
            <path d={['M-52 36 L-30 6 L-10 20 L14 -6 L52 36 Z', 'M-52 36 V10 H-30 V-10 H-10 V0 H16 V-24 H34 V36 Z', 'M-52 20 Q0 4 52 20 V36 H-52 Z'][k]} fill="#1A1028" />
            <circle cx="0" cy="0" r={120} fill="#FFFFFF" opacity={0.6 * f} />
          </g>
        ) : null;
      })}
      <Tag T={T} t0={at('vicecity', 1, 1.4)} x={760} y={1700} text="Miami, studiata dal vero" size={38} until={at('vicecity', 2, 0.2)} />
      {T >= at('vicecity', 2, 0.1) && (
        <g opacity={gone('vicecity')}>
          <ellipse cx="790" cy="1420" rx={300 * eo(seg(T, at('vicecity', 2, 0.1), at('vicecity', 2, 0.8)))} ry={250 * eo(seg(T, at('vicecity', 2, 0.1), at('vicecity', 2, 0.8)))} fill="none" stroke={YEL} strokeWidth="10" strokeDasharray="30 16" strokeDashoffset={-T * 40} />
          <Tag T={T} t0={at('vicecity', 2, 0.6)} x={740} y={1730} text="qui gran parte del gioco" size={40} />
        </g>
      )}

      {/* ---- capitolo 3: Jason e Brian nelle Keys, Lucia e il carcere */}
      <Node T={T} t0={at('coppia', 0, 0.1)} p={N.jason} name="Jason Duval" sub="ex soldato" subFill={YEL} ring={ringJ}><DogTag T={T} /></Node>
      <Link T={T} t0={at('coppia', 0, 0.6)} a={[N.jason[0] + 50, N.jason[1] + 60]} b={[470, 2030]} c={[400, 1990]} color={CYAN} arrow w={6} label="lavora per i trafficanti" lx={120} ly={50} size={40} fade={gone('coppia')} />
      <Node T={T} t0={at('coppia', 1, 0.1)} p={N.brian} name="Brian Heder" sub="trafficante" r={60} size={36} fade={gone('coppia')}><House /></Node>
      <Link T={T} t0={at('coppia', 1, 0.4)} a={[N.jason[0] - 40, N.jason[1] + 70]} b={[N.brian[0] + 10, N.brian[1] - 60]} c={[130, 2000]} color={YEL} arrow w={6} label="vive gratis da lui" lx={-60} ly={40} size={40} fade={gone('coppia')} />
      {T >= at('coppia', 2, 0.1) && (() => {
        // il carcere di Leonida: le sbarre si alzano, Lucia esce
        const s = pop(T, at('coppia', 2, 0.1));
        const open = eio(seg(T, at('coppia', 2, 0.8), at('coppia', 2, 1.6)));
        const [x, y] = N.prison;
        return (
          <g transform={`translate(${x} ${y}) scale(${s})`} opacity={gone('coppia')}>
            <rect x="-110" y="-90" width="220" height="170" rx="8" fill="#4A4258" stroke={INK} strokeWidth="5" />
            {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M-110 ${-62 + i * 28} H110`} stroke="#2A2438" strokeWidth="2" />)}
            <rect x="-50" y="-56" width="100" height="88" fill="#1A1028" stroke={INK} strokeWidth="4" />
            <circle cx="20" cy="-30" r="12" fill={YEL} opacity=".8" />
            {[-30, -10, 10, 30].map((bx) => <rect key={bx} x={bx - 4} y={-56 - open * 80} width="8" height="88" fill="#8A8AA0" stroke={DARK} strokeWidth="2" />)}
            <text y="122" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="40" fill={INK} stroke={DARK} strokeWidth="7" paintOrder="stroke">carcere di Leonida</text>
          </g>
        );
      })()}
      <Node T={T} t0={at('coppia', 2, 0.4)} p={N.lucia} name="Lucia Caminos" sub="appena uscita" subFill={YEL} ring={ringL}><CellKey T={T} /></Node>
      <Tag T={T} t0={at('coppia', 2, 0.9)} x={390} y={1350} text="da Liberty City" bg={CYAN} size={34} until={at('coppia', 3, 0.2)} />
      <Node T={T} t0={at('coppia', 3, 0.2)} p={N.family} name="la sua famiglia" r={54} size={34} fade={gone('coppia')}><Frame /></Node>
      <Link T={T} t0={at('coppia', 3, 0.4)} a={[N.lucia[0] + 20, N.lucia[1] + 140]} b={[N.family[0], N.family[1] - 50]} color={PINK} w={6} label="l'ha difesa" lx={20} ly={-40} size={38} fade={gone('coppia')} />

      {/* ---- capitolo 4: il colpo in banca, il complotto, Bonnie e Clyde, si proteggono */}
      {T >= at('colpo', 0, 0.1) && (
        <g transform={`translate(${N.bank[0]} ${N.bank[1]}) scale(${1.3 * pop(T, at('colpo', 0, 0.1))})`} opacity={gone('colpo')}>
          <Glow id="gv-bank" x={0} y={-20} r={150} t={T} color={alarm > 0 ? RED : YEL} amp={0.1} rate={alarm > 0 ? 9 : 2} opacity={0.5} />
          <Bank T={T} alarm={alarm} />
        </g>
      )}
      <Link T={T} t0={at('colpo', 0, 0.2)} a={[N.jason[0] + 70, N.jason[1] - 30]} b={[N.bank[0] - 90, N.bank[1] + 40]} c={[560, 1800]} color={YEL} dashed flow arrow w={8} fade={gone('colpo')} />
      <Link T={T} t0={at('colpo', 0, 0.4)} a={[N.lucia[0] + 70, N.lucia[1] - 10]} b={[N.bank[0] - 100, N.bank[1] - 10]} c={[420, 1200]} color={YEL} dashed flow arrow w={8} label="colpo facile" lx={-20} ly={-24} size={42} fade={gone('colpo')} />
      {T >= at('colpo', 0, 0.6) && <g transform={`translate(${N.bank[0] + 120} ${N.bank[1] + 70}) scale(${1.4 * pop(T, at('colpo', 0, 0.6))})`} opacity={gone('colpo')}><MoneyBag /></g>}
      <Tag T={T} t0={at('colpo', 0, 1.0)} x={N.bank[0] - 20} y={N.bank[1] - 170} text="va storto!" bg={RED} fg="#FFFFFF" size={50} rot={-4} until={at('colpo', 1, 0.3)} />
      {plot > 0 && (() => {
        const pts: P[] = [PLACE.vice, PLACE.grass, PLACE.port, PLACE.ambrosia, PLACE.kalaga, PLACE.keys, PLACE.lake];
        const fade = 1 - seg(T, at('colpo', 2, 0.2), at('colpo', 2, 0.8));
        return (
          <g opacity={fade}>
            {pts.map((a, i) => pts.slice(i + 1).filter((_, j) => (i + j) % 2 === 0).map((b, j) => (
              <path key={`${i}-${j}`} d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} stroke={RED} strokeWidth="5" strokeDasharray="16 12" strokeDashoffset={-T * 50} opacity={0.75 * seg(plot, (i + j) / 14, (i + j) / 14 + 0.3)} />
            )))}
            <ellipse cx="560" cy="1180" rx={lerp(900, 560, eo(plot))} ry={lerp(1500, 1000, eo(plot))} fill="none" stroke={RED} strokeWidth="18" opacity={plot} />
            <ellipse cx="560" cy="1180" rx={lerp(900, 560, eo(plot)) + 20} ry={lerp(1500, 1000, eo(plot)) + 20} fill="none" stroke={RED} strokeWidth="40" opacity={0.18 * plot} />
          </g>
        );
      })()}
      <Tag T={T} t0={at('colpo', 1, 0.6)} x={560} y={1050} text="un complotto" bg={RED} fg="#FFFFFF" size={80} rot={-3} until={at('colpo', 2, 0.4)} />
      {T >= at('colpo', 2, 0.1) && (() => {
        // la coppia: la linea rosa con il cuore, l'auto di Bonnie e Clyde, poi gli scudi
        const p = eo(seg(T, at('colpo', 2, 0.1), at('colpo', 2, 0.8)));
        const [ax, ay] = [N.lucia[0] + 30, N.lucia[1] + 66], [bx, by] = [N.jason[0] - 10, N.jason[1] - 70];
        const mx = 330, my = 1640;
        const hx = 0.25 * ax + 0.5 * mx + 0.25 * bx, hy = 0.25 * ay + 0.5 * my + 0.25 * by;
        const shield = pop(T, at('colpo', 3, 0.2));
        return (
          <g>
            <path d={`M${ax} ${ay} Q${mx} ${my} ${bx} ${by}`} fill="none" stroke={PINK} strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
            <g transform={`translate(${hx} ${hy}) scale(${1.4 * pop(T, at('colpo', 2, 0.6)) * (1 + 0.06 * Math.sin(T * 6))})`}>
              <path d="M0 14 Q-24 0 -18 -10 Q-12 -20 0 -10 Q12 -20 18 -10 Q24 0 0 14 Z" fill={PINK} stroke={INK} strokeWidth="3" />
            </g>
            <g opacity={gone('colpo')}>
              <g transform={`translate(620 1570) scale(${1.6 * pop(T, at('colpo', 2, 0.4))})`}><OldCar /></g>
              <Tag T={T} t0={at('colpo', 2, 0.7)} x={630} y={1460} text="come Bonnie e Clyde" size={38} until={at('colpo', 3, 0.1)} />
              {T >= at('colpo', 3, 0.2) && [N.jason, N.lucia].map(([x, y], k) => (
                <g key={k} transform={`translate(${x + 95} ${y - 40}) scale(${shield})`}>
                  <path d="M0 -30 L26 -20 V4 Q26 24 0 34 Q-26 24 -26 4 V-20 Z" fill={CYAN} stroke={INK} strokeWidth="4" />
                  <path d="M-10 2 L-2 10 L12 -8" fill="none" stroke={DARK} strokeWidth="5" strokeLinecap="round" />
                </g>
              ))}
              <Tag T={T} t0={at('colpo', 3, 0.5)} x={640} y={1460} text="si proteggono a vicenda" bg={CYAN} size={38} />
            </g>
          </g>
        );
      })()}

      {/* ---- capitolo 5: lo scambio, le strade separate, il rapporto */}
      {T >= at('insieme', 0, 0.1) && T < end('insieme') + 0.5 && (() => {
        const fade = gone('insieme');
        const sw = pop(T, at('insieme', 0, 0.1));
        const spin = eio(seg(T, at('insieme', 0, 0.6), at('insieme', 0, 1.4))) * 180;
        return (
          <g opacity={fade}>
            <g transform={`translate(${N.lucia[0] + 210} 1640) scale(${1.3 * sw}) rotate(${spin})`}>
              <circle r="42" fill={YEL} stroke={INK} strokeWidth="4" />
              <path d="M-20 -8 A22 22 0 0 1 18 -12 M18 -12 L18 -26 M18 -12 L4 -12 M20 8 A22 22 0 0 1 -18 12 M-18 12 L-18 26 M-18 12 L-4 12" fill="none" stroke={DARK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        );
      })()}
      <Tag T={T} t0={at('insieme', 0, 0.5)} x={460} y={1500} text="quando vuoi" size={38} until={at('insieme', 1)} />
      {T >= at('insieme', 1, 0.1) && (() => {
        // le due strade: Jason verso nord, Lucia verso le Keys; poi tornano insieme a Vice City
        const u = eio(seg(T, at('insieme', 1, 0.1), at('insieme', 1, 2.2)));
        const back = eio(seg(T, at('insieme', 1, 1.6), at('insieme', 2, 0.2)));
        const fade = 1 - seg(T, at('insieme', 2, 0.2), at('insieme', 2, 0.6));
        const A: P = [800, 1360], B: P = [520, 760], C: P = [520, 2060];
        const k = u * (1 - back);
        const pos = (to: P): P => [lerp(A[0], to[0], k), lerp(A[1], to[1], k)];
        const [jx, jy] = pos(B), [lx, ly] = pos(C);
        return (
          <g opacity={fade}>
            <path d={`M${A[0]} ${A[1]} Q700 1000 ${B[0]} ${B[1]}`} fill="none" stroke={YEL} strokeWidth="7" strokeDasharray="20 14" strokeDashoffset={-T * 50} />
            <path d={`M${A[0]} ${A[1]} Q760 1800 ${C[0]} ${C[1]}`} fill="none" stroke={PINK} strokeWidth="7" strokeDasharray="20 14" strokeDashoffset={-T * 50} />
            <g transform={`translate(${jx} ${jy}) scale(1.4)`}><circle r="36" fill="#22123A" stroke={YEL} strokeWidth="5" /><DogTag T={T} s={0.8} /></g>
            <g transform={`translate(${lx} ${ly}) scale(1.4)`}><circle r="36" fill="#22123A" stroke={PINK} strokeWidth="5" /><CellKey T={T} s={0.8} /></g>
            <Tag T={T} t0={at('insieme', 1, 0.6)} x={560} y={1180} text="separati o insieme" size={52} />
          </g>
        );
      })()}
      {T >= at('insieme', 2, 0.1) && (() => {
        const v = 0.35 + 0.5 * eo(seg(T, at('insieme', 2, 0.4), at('insieme', 2, 1.4))) - 0.2 * eo(seg(T, at('insieme', 2, 1.6), at('insieme', 2, 2.2)));
        return (
          <g transform={`translate(520 1230) scale(${1.2 * pop(T, at('insieme', 2, 0.1))})`} opacity={gone('insieme')}>
            <rect x="-150" y="-60" width="300" height="120" rx="16" fill="#1A1028" stroke={INK} strokeWidth="4" />
            <text y="-18" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="28" fill={INK}>il vostro rapporto</text>
            <rect x="-120" y="6" width="240" height="26" rx="13" fill="#2A2438" />
            <rect x="-120" y="6" width={240 * v} height="26" rx="13" fill={PINK} />
            <path transform="translate(-136 19) scale(.9)" d="M0 10 Q-14 0 -10 -6 Q-6 -12 0 -6 Q6 -12 10 -6 Q14 0 0 10 Z" fill={PINK} stroke={INK} strokeWidth="2" />
          </g>
        );
      })()}
      <Tag T={T} t0={at('insieme', 3, 0.3)} x={600} y={1790} text="attività di coppia: facoltative" bg={CYAN} size={36} until={end('insieme') - 0.2} />

      {/* ---- capitolo 7: gli altri personaggi */}
      <Node T={T} t0={at('personaggi', 0, 0.2)} p={N.cal} name="Cal Hampton" sub="l'amico paranoico" r={64} size={38} fade={gone('personaggi')}><Binoculars /></Node>
      <Link T={T} t0={at('personaggi', 0, 0.6)} a={[N.cal[0] - 60, N.cal[1] + 40]} b={[N.jason[0] + 60, N.jason[1] - 30]} color={INK} w={5} label="amico di Jason" ly={-26} size={34} fade={gone('personaggi')} />
      <Node T={T} t0={at('personaggi', 1, 0.2)} p={N.boobie} name="Boobie Ike" sub="un impero di affari" r={64} size={38} fade={gone('personaggi')}><DollarSign T={T} /></Node>
      <Node T={T} t0={at('personaggi', 2, 0.2)} p={N.dre} name="Dre'Quan Priest" r={64} size={38} fade={gone('personaggi')}><Vinyl T={T} /></Node>
      <Link T={T} t0={at('personaggi', 2, 0.5)} a={[N.boobie[0] - 10, N.boobie[1] - 72]} b={[N.dre[0] + 10, N.dre[1] + 110]} color={PINK} w={6} fade={gone('personaggi')} />
      <Tag T={T} t0={at('personaggi', 2, 0.8)} x={(N.boobie[0] + N.dre[0]) / 2 - 190} y={(N.boobie[1] + N.dre[1]) / 2 + 30} text="Only Raw Records" bg={PINK} fg="#FFFFFF" size={34} rot={-3} until={end('personaggi') - 0.2} />
      <Node T={T} t0={at('personaggi', 3, 0.2)} p={N.raul} name="Raul Bautista" sub="rapinatore di banche" r={64} size={38} fade={gone('personaggi')}><SafeDial T={T} /></Node>

      {/* ---- capitolo 8: la presa in giro dell'America di oggi, poi le attività */}
      {([[380, 900, 0], [740, 1000, 1]] as const).map(([x, y, k]) => {
        const t0 = at('satira', k === 0 ? 0 : 1, 0.2);
        if (T < t0) return null;
        const views = 1000 * Math.pow(1000, Math.min(1, (T - t0) / 4)) * (k + 1);
        return (
          <g key={k} transform={`translate(${x} ${y}) scale(${1.5 * pop(T, t0)}) rotate(${(k - 0.5) * 10})`} opacity={1 - seg(T, at('satira', 3, 0.1), at('satira', 3, 0.5))}>
            <Phone T={T} kind={k} views={views} />
            {[0, 1, 2].map((h) => { const u = mod(T * 0.7 + h / 3 + k * 0.2, 1); return <path key={h} transform={`translate(${30 + Math.sin(u * 8 + h) * 10} ${-60 - u * 90}) scale(${0.6 + u * 0.3})`} d="M0 10 Q-14 0 -10 -6 Q-6 -12 0 -6 Q6 -12 10 -6 Q14 0 0 10 Z" fill={PINK} opacity={1 - u} />; })}
          </g>
        );
      })}
      {T >= at('satira', 1, 0.6) && <g transform={`translate(560 1330) rotate(-5) scale(${1.4 * pop(T, at('satira', 1, 0.6))})`} opacity={1 - seg(T, at('satira', 3, 0.1), at('satira', 3, 0.5))}><Newspaper /></g>}
      <Tag T={T} t0={at('satira', 0, 0.6)} x={560} y={720} text="l'America di oggi" bg={PINK} fg="#FFFFFF" size={44} until={at('satira', 3)} />
      {T >= at('satira', 2, 0.1) && (
        <g transform={`translate(800 1360) scale(${1.9 * pop(T, at('satira', 2, 0.1))})`} opacity={1 - seg(T, at('satira', 3, 0.1), at('satira', 3, 0.5))}>
          <BodyCam T={T} />
        </g>
      )}
      {T >= at('satira', 3, 0.1) && (() => {
        const t0 = at('satira', 3, 0.1);
        const fall = mod((T - t0) / 3, 1);
        return (
          <g opacity={gone('satira')}>
            <g transform={`translate(${300 + Math.sin(T) * 20} ${1250 + fall * 160}) scale(${2.2 * pop(T, t0)})`}><Parachute /></g>
            <g transform={`translate(760 ${1250 - Math.abs(Math.sin(T * 4)) * 60}) scale(${2.2 * pop(T, t0 + 0.4)})`}><Ball /></g>
            <g transform={`translate(880 1660) scale(${2.2 * pop(T, t0 + 0.8)})`}><DiveMask T={T} /></g>
          </g>
        );
      })()}

      {/* ---- capitoli 6, 9 e 10: la bacheca */}
      <Board T={T} />
      {T >= at('edizioni', 3, 0.4) && (
        <g>
          <ellipse cx={(N.jason[0] + N.lucia[0]) / 2} cy={(N.jason[1] + N.lucia[1]) / 2} rx="220" ry="330" fill="none" stroke={RED} strokeWidth="12" strokeDasharray="30 18" strokeDashoffset={-T * 40} opacity={seg(T, at('edizioni', 3, 0.4), at('edizioni', 3, 0.9))} />
          <Tag T={T} t0={at('edizioni', 3, 0.8)} x={(N.jason[0] + N.lucia[0]) / 2 + 80} y={(N.jason[1] + N.lucia[1]) / 2} text="insieme?" bg={RED} fg="#FFFFFF" size={90} rot={-4} />
        </g>
      )}
    </g>
  );
};

export const makeMappa = (chapterId: string): React.FC<SceneProps> => {
  const Scene: React.FC<SceneProps> = ({ t }) => {
    const T = STARTS[chapterId] + t;
    const c = camAt(T);
    UI_K = Math.max(1, 0.85 / c.z);
    WIDEV = c.z < 0.42;
    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="gv" />
          <radialGradient id="gv-bg" cx=".5" cy=".5" r=".85">
            <stop offset="0" stopColor="#2A1450" />
            <stop offset=".55" stopColor="#1A0B34" />
            <stop offset="1" stopColor="#0B0418" />
          </radialGradient>
          <linearGradient id="gv-land" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={LAND2} />
            <stop offset=".55" stopColor={LAND} />
            <stop offset="1" stopColor="#4A2A72" />
          </linearGradient>
          <linearGradient id="gv-tw" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5A3A8A" />
            <stop offset="1" stopColor="#2A1848" />
          </linearGradient>
          <linearGradient id="gv-scrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0B0418" stopOpacity=".95" />
            <stop offset=".82" stopColor="#0B0418" stopOpacity=".85" />
            <stop offset="1" stopColor="#0B0418" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gv-bar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={CYAN} />
            <stop offset="1" stopColor={PINK} />
          </linearGradient>
          <linearGradient id="gv-sung" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE680" />
            <stop offset=".5" stopColor="#FFB04A" />
            <stop offset="1" stopColor={PINK} />
          </linearGradient>
          <pattern id="gv-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="2" fill="#8A5ABA" opacity=".55" />
            <circle cx="16" cy="16" r="1.4" fill="#2A1048" opacity=".6" />
          </pattern>
          <pattern id="gv-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0 H0 V60" fill="none" stroke="#3A1F66" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#gv-bg)" />
        <g transform={`translate(540 900) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
          <rect x="-4000" y="-4000" width="9080" height="13000" fill="url(#gv-grid)" opacity=".55" />
          <Schema T={T} />
        </g>
        <rect width="1080" height="500" fill="url(#gv-scrim)" />
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={m.c < 0.5 ? PINK : CYAN} opacity={0.12 + 0.08 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Finish id="gv" tint="#2A1450" tintOpacity={0.1} />
      </svg>
    );
  };
  return Scene;
};
