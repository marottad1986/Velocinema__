import React from 'react';
import { eio, eo, eob, lerp, mod, seg } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow, Smoke, Stars, flashAt } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/ritorno-al-futuro-parte-3.json';
import {
  DARK, FILL, FrameBox, Goggles, INK, Lc, Link, MOTES, Node, P55, P85, RAIL, RED, ROW, RX, Skate, Tag, TimeCar, Travel, YEL,
  fit, pop, setUi,
} from '../ritorno-al-futuro/Linee';
import type { Pal } from '../ritorno-al-futuro/Linee';
import { P1885 } from '../ritorno-al-futuro-parte-2/Linee2';

// Ritorno al futuro – Parte III come schema (formato "spiegato"): le stesse linee del tempo delle Parti 1 e 2, nello stesso
// stile delle epoche (notte viola anni '80; 1885 fotografia seppia; 1955 cartolina crema; 1985 neon). Stazioni dall'alto:
// 1885 il paese di legno (Doc, Marty, Buford, il duello), 1885 la ferrovia (la locomotiva, il ponte interrotto sul burrone,
// Clara), «+70 anni», 1955 la miniera e il cimitero con la lapide di Doc, «+30 anni», 1985 i binari al neon.
// Vocabolario fisso: cerchio con oggetto = personaggio, linea = legame con scritta a mano, tratteggio giallo = viaggio nel
// tempo, cartellino pieno = colpo di scena, anello rosso = il nodo da capire (la tomba, il debito di Buford).
// Gli eventi cadono sulla griglia della musica (72 bpm, crome), gli stessi istanti di scripts/audio/ritorno-al-futuro-parte-3.mjs.

const BANDS = [
  { key: 'paese', y0: 420, year: '1885', name: 'HILL VALLEY' },
  { key: 'ferrovia', y0: 1240, year: '1885', name: 'LA FERROVIA E IL BURRONE' },
  { key: 'miniera', y0: 2140, year: '1955', name: 'LA MINIERA E IL CIMITERO' },
  { key: 'binari', y0: 2960, year: '1985', name: 'I BINARI' },
] as const;
type BandKey = (typeof BANDS)[number]['key'];
export const BAND = Object.fromEntries(BANDS.map((b) => [b.key, b])) as Record<BandKey, (typeof BANDS)[number]>;
const PAL: Record<BandKey, Pal> = { paese: P1885, ferrovia: P1885, miniera: P55, binari: P85 };
const cy = (k: BandKey) => BAND[k].y0 + 400;
const Y = (k: BandKey, y: number) => BAND[k].y0 + y;
const cardAt = (y: number) => y < BAND.binari.y0 - 100;
const COPPER = '#C9873A';

export const N = {
  docW: [210, Y('paese', ROW)], martyW: [540, Y('paese', ROW)], buford: [840, Y('paese', ROW)],
  clara: [250, Y('ferrovia', ROW)], docR: [540, Y('ferrovia', ROW)], martyR: [830, Y('ferrovia', ROW)],
  marty55: [250, Y('miniera', ROW)], tomb: [760, Y('miniera', 330)],
  martyF: [250, Y('binari', ROW)], docT: [700, Y('binari', ROW)], claraT: [860, Y('binari', ROW)],
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
export const WIDE = { x: 540, y: Y('miniera', -100), z: 0.3 };
export const SHOTS: Shot[] = [
  { at: 0, ...band('miniera', 1.0) },
  { at: at('tomba', 1), x: 700, y: Y('ferrovia', 300), z: 0.42 },
  { at: at('tomba', 2), ...band('miniera', 1.05, 120, -20) },
  { at: at('tomba', 3), ...band('miniera', 1.1, 160, -40) },
  { at: at('viaggio', 0), ...band('miniera', 1.0, -40, 0) },
  { at: at('viaggio', 1, 0.6), x: 700, y: Y('ferrovia', 300), z: 0.42 },
  { at: at('viaggio', 2), ...band('paese', 1.0, 0, 0) },
  { at: at('viaggio', 3), ...band('paese', 1.1, 60, -40) },
  { at: at('buford', 0), ...band('paese', 1.0) },
  { at: at('buford', 2), ...band('paese', 1.0, 40, 40) },
  { at: at('locomotiva', 0), ...band('ferrovia', 1.0) },
  { at: at('locomotiva', 1), ...band('ferrovia', 1.05, -60, -40) },
  { at: at('locomotiva', 3), ...band('ferrovia', 1.0) },
  { at: at('clara', 0), ...band('ferrovia', 1.0, -40, 20) },
  { at: at('clara', 2), ...band('ferrovia', 1.05, 120, -40) },
  { at: at('clara', 3), ...band('ferrovia', 1.0) },
  { at: at('verita', 0), ...band('ferrovia', 1.05, -60, 40) },
  { at: at('verita', 3), x: 600, y: Y('paese', 760), z: 0.55 },
  { at: at('duello', 0), ...band('paese', 1.0, 140, 40) },
  { at: at('duello', 1), ...band('paese', 1.05, 160, 60) },
  { at: at('duello', 3), ...band('paese', 1.0, 40, 40) },
  { at: at('ponte', 0), ...band('ferrovia', 1.0) },
  { at: at('ponte', 2), ...band('ferrovia', 1.0, 0, 40) },
  { at: at('ponte', 3, 0.2), ...band('ferrovia', 0.95, 100, -20) },
  { at: at('ponte', 3, 1.4), x: 700, y: Y('miniera', 200), z: 0.36 },
  { at: at('futuro', 0), ...band('binari', 1.0) },
  { at: at('futuro', 2), x: 700, y: Y('miniera', 300), z: 0.34 },
  { at: at('futuro', 2, 1.6), ...band('binari', 1.0, 60, 40) },
  { at: at('futuro', 3, 0.9), ...WIDE },
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

/** Buford: un cappello da cowboy nero con la fascia rossa. */
const Hat: React.FC = () => (
  <g strokeLinejoin="round" strokeLinecap="round">
    <path d="M-44 12 Q0 26 44 12 Q30 2 22 4 Q22 -26 0 -26 Q-22 -26 -22 4 Q-30 2 -44 12 Z" fill="#1E1A18" stroke={INK} strokeWidth="4" />
    <path d="M-22 -2 Q0 4 22 -2" fill="none" stroke={RED} strokeWidth="6" />
    <path d="M-12 -22 Q0 -12 12 -22" fill="none" stroke="#4A403A" strokeWidth="3" />
  </g>
);
/** Clara: la campanella della scuola. */
const Bell: React.FC = () => (
  <g strokeLinejoin="round" strokeLinecap="round">
    <path d="M0 -40 V-26" stroke="#7A5A3A" strokeWidth="8" />
    <path d="M-26 18 Q-26 -24 0 -26 Q26 -24 26 18 Z" fill={COPPER} stroke={INK} strokeWidth="4" />
    <path d="M-32 18 H32" stroke={INK} strokeWidth="6" />
    <circle cx="0" cy="26" r="7" fill="#7A5A3A" stroke={INK} strokeWidth="3" />
    <path d="M-14 -12 Q-16 4 -12 12" fill="none" stroke="#FFE6B0" strokeWidth="3" opacity=".7" />
  </g>
);
/** La lapide di Doc. */
const Tomb: React.FC<{ T: number; lit: number; gone?: number }> = ({ T, lit, gone = 0 }) => (
  <g strokeLinejoin="round">
    {lit > 0 && <Glow id="r3-tomb" x={0} y={-30} r={170} t={T} color={RED} amp={0.1} rate={2} opacity={0.35 * lit * (1 - gone)} />}
    <path d="M-80 90 V-60 Q-80 -110 0 -110 Q80 -110 80 -60 V90 Z" fill="#B8AE9C" stroke={P55.ink} strokeWidth="7" />
    <path d="M-60 -50 Q-60 -90 0 -90 Q60 -90 60 -50" fill="none" stroke="#FFFFFF" strokeWidth="3" opacity=".4" />
    <g opacity={1 - gone}>
      <text y="-40" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="26" fill={P55.ink}>QUI GIACE</text>
      <text y="-4" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="38" fill={P55.ink}>DOC</text>
      <text y="32" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="26" fill={P55.ink}>1885</text>
      <text y="62" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="22" fill={RED}>per 80 dollari</text>
    </g>
    <path d="M-100 90 H100" stroke={P55.ink} strokeWidth="8" strokeLinecap="round" />
  </g>
);
/** La locomotiva a vapore (generica), vista di lato; `glow` = caldaia accesa. */
const Loco: React.FC<{ T: number; glow?: number }> = ({ T, glow = 0.5 }) => {
  const c = P1885;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Glow id="r3-boil" x={-60} y={-10} r={90} t={T} color="#FF8A2C" amp={0.15} rate={6} opacity={0.6 * glow} />
      <rect x="-140" y="-60" width="170" height="70" rx="30" fill="#3A3028" stroke={c.ink} strokeWidth="6" />
      <rect x="30" y="-110" width="90" height="120" rx="6" fill="#4A3A2E" stroke={c.ink} strokeWidth="6" />
      <rect x="48" y="-96" width="54" height="40" rx="4" fill="#E8B060" opacity={0.6 + 0.3 * glow} />
      <path d="M-120 -60 V-120 H-90 L-80 -60" fill="#2A221C" stroke={c.ink} strokeWidth="6" />
      <path d="M-128 -128 H-82" stroke={c.ink} strokeWidth="8" />
      <path d="M-170 10 L-140 -20 V10 Z" fill="#6A5040" stroke={c.ink} strokeWidth="5" />
      <path d="M-30 -60 V-80 H-10 V-60" fill={COPPER} stroke={c.ink} strokeWidth="5" />
      {[-110, -60, 0, 70].map((x, i) => (
        <g key={x} transform={`translate(${x} 22) rotate(${T * 300 + i * 40})`}>
          <circle r={i === 3 ? 32 : 24} fill="#2A221C" stroke={c.ink} strokeWidth="6" />
          <path d={`M-${i === 3 ? 26 : 18} 0 H${i === 3 ? 26 : 18} M0 -${i === 3 ? 26 : 18} V${i === 3 ? 26 : 18}`} stroke="#8A7A6A" strokeWidth="4" />
        </g>
      ))}
      <path d="M-110 22 H70" stroke={COPPER} strokeWidth="6" transform={`translate(${Math.sin(T * 5) * 8} 0)`} />
    </g>
  );
};

// ---------------------------------------------------------------- disegni delle stazioni

/** 1885, il paese di legno: emporio, saloon, hotel con le insegne, la strada di terra battuta, un abbeveratoio, colline. */
const ArtPaese: React.FC<{ T: number }> = ({ T }) => {
  const c = P1885, L = Lc(c);
  return (
    <g>
      <circle cx="860" cy="100" r="44" {...L} fill="#F2C870" strokeWidth="4" />
      <Glow id="r3-sun" x={860} y={100} r={140} t={T} color="#F2C870" amp={0.04} rate={1} opacity={0.4} />
      <path d="M100 250 Q240 160 400 220 Q560 140 720 210 Q860 170 980 220 V300 H100 Z" fill={c.fill2} opacity=".7" />
      {[[130, 'EMPORIO', 170], [330, 'SALOON', 200], [560, 'HOTEL', 230], [810, 'BANCA', 150]].map(([x, name, h], i) => {
        const X = x as number, Hh = h as number;
        return (
          <g key={i}>
            <path d={`M${X} 470 V${470 - Hh} H${X + 190} V470`} {...L} fill={i % 2 ? c.fill : c.fill2} strokeWidth="6" />
            <rect x={X + 20} y={470 - Hh - 40} width="150" height="44" {...L} fill="#EAD9B5" strokeWidth="5" />
            <text x={X + 95} y={470 - Hh - 10} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="22" letterSpacing="2" fill={c.ink}>{name as string}</text>
            <path d={`M${X + 70} 470 V${470 - 70} H${X + 120} V470`} {...L} fill={c.dark} strokeWidth="4" />
            {Array.from({ length: Math.floor(Hh / 70) - 1 }, (_, k) => <rect key={k} x={X + 24} y={470 - Hh + 20 + k * 60} width="40" height="34" {...L} fill="#F2D58A" strokeWidth="3" opacity=".85" />)}
            <path d={`M${X - 6} ${470 - 80} H${X + 196}`} {...L} strokeWidth="5" />
            {[X + 4, X + 186].map((px) => <path key={px} d={`M${px} ${470 - 80} V470`} {...L} strokeWidth="4" />)}
          </g>
        );
      })}
      <path d="M100 470 H980" {...L} strokeWidth="6" />
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={mod(140 + i * 90 + T * 30, 840) + 120} cy={500 + (i % 3) * 12} r={3 + (i % 2)} fill={c.dim} opacity=".6" />)}
      <rect x="470" y="478" width="90" height="34" rx="6" {...L} fill="#8A6A4A" strokeWidth="4" />
    </g>
  );
};

/** 1885, la ferrovia: colline, binari che corrono verso destra, il ponte di legno interrotto sul burrone, la locomotiva. */
const ArtFerrovia: React.FC<{ T: number; push: number; fall: number; carOn: boolean; carX: number }> = ({ T, push, fall, carOn, carX }) => {
  const c = P1885, L = Lc(c);
  const locoX = lerp(260, 640, push);
  return (
    <g>
      <path d="M100 230 Q260 150 420 210 Q600 130 760 200 Q880 170 980 210 V300 H100 Z" fill={c.fill2} opacity=".7" />
      {/* il burrone a destra */}
      <path d="M760 470 L800 540 H980 V470 Z" fill={c.dark} opacity=".8" />
      <path d="M760 470 L790 540 M980 470 V540" {...L} strokeWidth="5" />
      {/* il ponte di legno, interrotto */}
      {[620, 670, 720, 770].map((x) => <path key={x} d={`M${x} 470 V${x > 740 ? 540 : 520} M${x - 20} 520 L${x + 20} 470`} {...L} strokeWidth="5" />)}
      <path d="M560 470 H800" {...L} strokeWidth="8" />
      <path d="M800 470 l20 -6 l-6 14" {...L} stroke={RED} strokeWidth="5" />
      <text x="880" y="520" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="28" fill="#F2D58A" stroke={c.dark} strokeWidth="5" paintOrder="stroke">burrone</text>
      {/* i binari */}
      <path d="M100 470 H800" {...L} strokeWidth="6" />
      {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M${110 + i * 38} 462 v16`} stroke={c.ink} strokeWidth="5" />)}
      {/* la locomotiva che spinge e il fumo */}
      <g transform={`translate(${locoX + fall * 60} ${430 + fall * 260}) rotate(${fall * 40})`} opacity={1 - fall * 0.6}>
        <Smoke id="r3-smoke" t={T} x={-100} y={-130} color="#D9CCB4" n={7} rise={180} wind={-160} r0={18} r1={60} opacity={0.75} />
        <Loco T={T} glow={0.4 + 0.6 * push} />
      </g>
      {carOn && <g transform={`translate(${carX} 440) scale(.5)`}><TimeCar T={T} glow={0.4 + 0.6 * push} s={1} ink={c.ink} /></g>}
    </g>
  );
};

/** 1955, la miniera e il cimitero: la collina con l'ingresso puntellato, il carrello, le croci, la lapide di Doc. */
const ArtMiniera: React.FC<{ T: number; carIn: number }> = ({ T, carIn }) => {
  const c = P55, L = Lc(c);
  return (
    <g>
      <path d="M100 470 V220 Q240 110 420 170 Q520 200 560 300 V470 Z" {...L} fill={c.fill2} strokeWidth="6" />
      <path d="M220 470 V330 Q300 270 380 330 V470 Z" {...L} fill={c.dark} strokeWidth="7" />
      <path d="M210 330 H390 M230 330 V470 M370 330 V470" {...L} stroke="#8A6A4A" strokeWidth="12" />
      <text x="300" y="316" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="22" letterSpacing="2" fill={c.ink}>MINIERA</text>
      {carIn > 0 && <g transform="translate(300 450) scale(.5)" opacity={carIn}><TimeCar T={T} glow={0.3} s={1} ink={c.ink} /></g>}
      {/* il cimitero */}
      {[[600, 420], [660, 440], [880, 430], [940, 445]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y + 30} V${y - 20} M${x - 14} ${y - 6} H${x + 14}`} {...L} strokeWidth="6" />
      ))}
      <path d="M560 470 H980" {...L} strokeWidth="5" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${580 + i * 44} 470 l-8 -16 M${590 + i * 44} 470 l6 -14`} stroke={c.tree} strokeWidth="4" />)}
      <Stars t={T} seed={77} n={10} x={560} y={50} w={400} h={80} color={c.ink} size={0.7} />
    </g>
  );
};

/** 1985, i binari al neon: il passaggio a livello con le luci che lampeggiano, il treno che arriva. */
const ArtBinari: React.FC<{ T: number; train: number }> = ({ T, train }) => {
  const c = P85, L = Lc(c);
  const blink = Math.sin(T * 8) > 0 ? 1 : 0.2;
  return (
    <g>
      <Stars t={T} seed={85} n={16} x={120} y={50} w={840} h={120} color={INK} size={0.8} />
      <path d="M100 300 H980" stroke={c.dim} strokeWidth="3" strokeDasharray="20 14" />
      {[150, 300, 820, 920].map((x, i) => <rect key={x} x={x} y={300 - 90 - (i % 2) * 50} width="80" height={90 + (i % 2) * 50} {...L} fill={c.fill} strokeWidth="4" />)}
      <path d="M100 470 H980" {...L} strokeWidth="6" />
      {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${110 + i * 40} 462 v16`} stroke={c.ink} strokeWidth="4" />)}
      {/* il passaggio a livello */}
      <path d="M540 470 V300" {...L} strokeWidth="6" />
      <path d="M500 330 L580 370 M580 330 L500 370" {...L} strokeWidth="8" />
      {[-30, 30].map((dx, i) => (
        <g key={dx}>
          <Glow id={`r3-x${i}`} x={540 + dx} y={410} r={60} t={T} color={c.warm} amp={0} opacity={0.7 * (i ? blink : 1.2 - blink)} />
          <circle cx={540 + dx} cy="410" r="16" fill={c.warm} opacity={i ? blink : 1.2 - blink} stroke={c.ink} strokeWidth="4" />
        </g>
      ))}
      {/* il fanale del treno che arriva da destra */}
      {train > 0 && (
        <g transform={`translate(${lerp(1200, 660, train)} 420)`}>
          <Glow id="r3-head" x={-60} y={0} r={200} t={T} color="#FFF6B0" amp={0.1} rate={8} opacity={0.7} />
          <rect x="-60" y="-80" width="320" height="110" rx="12" fill="#2A2050" stroke={c.ink} strokeWidth="6" />
          <circle cx="-40" cy="-30" r="18" fill="#FFF6B0" />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- lo schema

const Nd: React.FC<React.ComponentProps<typeof Node>> = (props) => <Node {...props} card={cardAt(props.p[1])} />;
const Ln: React.FC<React.ComponentProps<typeof Link>> = (props) => <Link {...props} card={cardAt((props.a[1] + props.b[1]) / 2)} />;

export const Schema: React.FC<{ T: number; cam?: { y: number; z: number } }> = ({ T, cam = camAt(T) }) => {
  const bandAt: Record<BandKey, number> = { miniera: 0, paese: at('viaggio', 1, 1.6), ferrovia: at('locomotiva', 0), binari: at('ponte', 3, 1.4) };
  const off = (ch: string) => 1 - seg(T, end(ch) - 0.4, end(ch) + 0.3);
  const leak = T >= at('viaggio', 3, 0.1) && T < end('buford');
  const push = eio(seg(T, at('ponte', 0, 0.2), at('ponte', 3, 1.0)));
  const fall = eio(seg(T, at('ponte', 3, 0.9), at('ponte', 3, 2.2)));
  const carRail = T >= at('locomotiva', 1, 0.2) && T < at('ponte', 3, 1.0);
  const carRailX = lerp(470, 860, push);
  const carPaese = T >= at('viaggio', 2, 0.1) && T < at('locomotiva', 1, 0.2);
  const carMine = T < at('viaggio', 1, 0.6) ? 1 : 0;
  const shot = at('duello', 2, 0.1);
  const flash = flashAt(T, [shot]);
  const train85 = eio(seg(T, at('futuro', 0, 0.2), at('futuro', 0, 1.2)));
  const wreck = seg(T, at('futuro', 0, 1.1), at('futuro', 0, 1.3));
  const heartBreak = seg(T, at('verita', 1, 0.2), at('verita', 1, 0.6));
  const love = seg(T, at('clara', 1, 0.1), at('clara', 1, 0.5)) * (1 - heartBreak) + seg(T, at('ponte', 2, 0.3), at('ponte', 2, 0.7));
  const tombGone = seg(T, at('duello', 3, 0.5), at('duello', 3, 1.2));

  const toWest = `M${N.marty55[0] + 70} ${N.marty55[1] - 40} Q${RX} ${N.marty55[1] - 40} ${RX} ${Y('miniera', 200)} L${RX} ${Y('paese', 700)} Q${RX} ${Y('paese', ROW)} ${N.martyW[0] + 70} ${N.martyW[1]}`;
  const docThere = `M${N.marty55[0] - 20} ${N.marty55[1] - 70} Q${RAIL + 40} ${N.marty55[1] - 120} ${RAIL + 40} ${Y('miniera', 100)} L${RAIL + 40} ${Y('paese', 760)} Q${RAIL + 40} ${Y('paese', ROW)} ${N.docW[0] - 66} ${N.docW[1]}`;
  const toHome = `M${carRailX - 40} ${Y('ferrovia', 430)} Q${RX} ${Y('ferrovia', 430)} ${RX} ${Y('ferrovia', 700)} L${RX} ${Y('binari', 300)} Q${RX} ${Y('binari', 440)} 760 ${Y('binari', 440)}`;
  const docTrain = `M${RAIL + 40} ${Y('paese', 300)} L${RAIL + 40} ${Y('binari', 420)} Q${RAIL + 40} ${Y('binari', 520)} 300 ${Y('binari', 520)} L${N.docT[0] - 60} ${Y('binari', 520)} Q${N.docT[0] - 20} ${Y('binari', 520)} ${N.docT[0] - 20} ${N.docT[1] - 62}`;

  return (
    <g>
      {/* la linea degli anni */}
      <path d={`M${RAIL} 380 V${Y('ferrovia', 780)}`} fill="none" stroke={INK} strokeWidth="5" />
      <path d={`M${RAIL} ${Y('ferrovia', 780)} l-14 18 l28 18 l-28 18 l28 18 l-14 12`} fill="none" stroke={INK} strokeWidth="4" />
      <path d={`M${RAIL} ${Y('miniera', -20)} V${Y('miniera', 780)} l-14 18 l28 18 l-28 18 l28 18 l-14 12 V${Y('binari', 800)}`} fill="none" stroke={INK} strokeWidth="5" />
      <text x={RAIL + 4} y={Y('ferrovia', 850)} fontFamily={HAND} fontWeight={700} fontSize={fit(46)} fill="#A898D8" transform={`rotate(-90 ${RAIL + 4} ${Y('ferrovia', 850)})`} textAnchor="middle">+70 anni</text>
      {(['paese', 'miniera', 'binari'] as BandKey[]).map((k) => (
        <g key={k} transform={`translate(${RAIL} ${BAND[k].y0 + 10})`}>
          <rect x="-40" y="-26" width="80" height="52" rx="10" fill={Math.abs(cam.y - cy(k)) < 400 ? YEL : FILL} stroke={INK} strokeWidth="3" />
          <text y="11" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="28" fill={Math.abs(cam.y - cy(k)) < 400 ? DARK : INK}>{BAND[k].year}</text>
        </g>
      ))}

      {BANDS.map((b) => {
        const lit = seg(T, bandAt[b.key], bandAt[b.key] + 0.6);
        const near = cam.z < 0.6 ? 1 : 1 - 0.7 * seg(Math.abs(cam.y - cy(b.key)), 430, 760);
        return (
          <g key={b.key} opacity={near}>
            <FrameBox b={b} c={PAL[b.key]} on={lit} focus={Math.abs(cam.y - cy(b.key)) < 300 ? 1 : 0} />
            <g transform={`translate(0 ${b.y0})`} opacity={0.15 + 0.85 * lit}>
              {b.key === 'paese' && <ArtPaese T={T} />}
              {b.key === 'ferrovia' && <ArtFerrovia T={T} push={push} fall={fall} carOn={carRail} carX={carRailX} />}
              {b.key === 'miniera' && <ArtMiniera T={T} carIn={carMine} />}
              {b.key === 'binari' && <ArtBinari T={T} train={train85} />}
            </g>
          </g>
        );
      })}

      {/* ---- capitolo 1: Marty nel 1955, Doc nel 1885, la tomba */}
      <Nd T={T} t0={at('tomba', 0, 0.1)} p={N.marty55} name="Marty" sub="bloccato nel 1955"><Skate T={T} /></Nd>
      <Travel T={T} t0={at('tomba', 1, 0.1)} d={docThere} id="r3-doc" dur={1.2} label="Doc è qui" lx={RAIL + 160} ly={Y('ferrovia', 300)} labelUntil={at('tomba', 2)} fade={1 - 0.7 * seg(T, end('tomba'), end('tomba') + 0.6)} />
      <Nd T={T} t0={at('tomba', 1, 1.0)} p={N.docW} name="Doc" sub="lo scienziato"><Goggles /></Nd>
      {T >= at('tomba', 2, 0.1) && (
        <g transform={`translate(${N.tomb[0]} ${N.tomb[1]}) scale(${1.1 * pop(T, at('tomba', 2, 0.1))})`}>
          <Tomb T={T} lit={seg(T, at('tomba', 3), at('tomba', 3, 0.4))} gone={tombGone} />
        </g>
      )}
      {T >= at('tomba', 3, 0.2) && T < at('duello', 3, 1.2) && (
        <ellipse cx={N.tomb[0]} cy={N.tomb[1]} rx={170 * eob(seg(T, at('tomba', 3, 0.2), at('tomba', 3, 0.6)), 1.6)} ry={150 * eob(seg(T, at('tomba', 3, 0.2), at('tomba', 3, 0.6)), 1.6)} fill="none" stroke={RED} strokeWidth="9" opacity={off('tomba')} />
      )}
      <Tag T={T} t0={at('tomba', 3, 0.7)} x={N.tomb[0]} y={N.tomb[1] - 170} text="la tomba di Doc!" bg={RED} fg="#FFFFFF" size={36} rot={-3} until={end('tomba') - 0.2} />

      {/* ---- capitolo 2: la macchina nella miniera, il viaggio, il serbatoio bucato */}
      <Tag T={T} t0={at('viaggio', 0, 0.4)} x={300} y={Y('miniera', 270)} text="nascosta qui" size={32} until={at('viaggio', 1, 0.4)} />
      <Travel T={T} t0={at('viaggio', 1, 0.5)} d={toWest} id="r3-west" dur={1.3} label="70 anni indietro" lx={RX - 160} ly={Y('ferrovia', 300)} labelUntil={at('viaggio', 2, 0.3)} fade={1 - 0.7 * seg(T, end('viaggio'), end('viaggio') + 0.6)} />
      <Nd T={T} t0={at('viaggio', 2, 0.1)} p={N.martyW} name="Marty" sub="arrivato nel 1885"><Skate T={T} /></Nd>
      {carPaese && (
        <g transform={`translate(540 ${Y('paese', 460)}) scale(.5)`}>
          <TimeCar T={T} glow={0.2} s={1} ink={P1885.ink} />
        </g>
      )}
      {leak && Array.from({ length: 3 }, (_, i) => {
        const u = mod(T * 0.9 + i / 3, 1);
        return <ellipse key={i} cx={470} cy={Y('paese', 470) + u * 40} rx="6" ry="9" fill="#4A8AA8" opacity={1 - u} />;
      })}
      <Tag T={T} t0={at('viaggio', 3, 0.2)} x={540} y={Y('paese', 300)} text="niente benzina" bg={RED} fg="#FFFFFF" size={36} rot={-3} until={end('viaggio') - 0.2} />

      {/* ---- capitolo 3: Doc vivo, Buford, il debito, ripartire */}
      <Ln T={T} t0={at('buford', 0, 0.3)} a={[N.martyW[0] - 62, N.martyW[1] - 10]} b={[N.docW[0] + 62, N.docW[1] - 10]} c={[375, N.martyW[1] - 90]} arrow label="lo ritrova vivo" ly={-12} size={36} fade={off('buford')} />
      <Nd T={T} t0={at('buford', 1, 0.1)} p={N.buford} name="Buford Tannen" sub="un bandito" color={RED} dead={0}><Hat /></Nd>
      <Ln T={T} t0={at('buford', 2, 0.2)} a={[N.buford[0] - 40, N.buford[1] - 56]} b={[N.docW[0] + 40, N.docW[1] - 56]} c={[540, N.docW[1] - 260]} color={RED} arrow w={8} label="lo ucciderà" ly={-14} size={40} fade={off('buford')} />
      <Tag T={T} t0={at('buford', 3, 0.2)} x={540} y={Y('paese', 160)} text="sfida a duello: accetta" bg={RED} fg="#FFFFFF" size={34} until={end('buford') - 0.2} />

      {/* ---- capitolo 4: la locomotiva */}
      <Tag T={T} t0={at('locomotiva', 0, 0.3)} x={540} y={Y('ferrovia', 120)} text="88 miglia per viaggiare" size={34} until={at('locomotiva', 1, 0.2)} />
      <Ln T={T} t0={at('locomotiva', 1, 0.8)} a={[340, Y('ferrovia', 380)]} b={[450, Y('ferrovia', 380)]} color={YEL} arrow w={10} label="spinge" ly={-20} size={40} fade={off('locomotiva')} />
      <Tag T={T} t0={at('locomotiva', 2, 0.2)} x={540} y={Y('ferrovia', 120)} text="come una carrozzina spinta" size={34} until={at('locomotiva', 3, 0.2)} />
      <Tag T={T} t0={at('locomotiva', 3, 0.2)} x={540} y={Y('ferrovia', 120)} text="lunedì: il giorno della tomba" bg={RED} fg="#FFFFFF" size={34} until={end('locomotiva') - 0.2} />

      {/* ---- capitolo 5: Clara, il burrone, l'amore */}
      <Nd T={T} t0={at('clara', 0, 0.3)} p={N.clara} name="Clara" sub="la nuova maestra" color="#F29AC0" ring={seg(T, at('clara', 3, 0.2), at('clara', 3, 0.6)) * off('clara')}><Bell /></Nd>
      <Nd T={T} t0={at('clara', 0, 0.1)} p={N.docR} name="Doc"><Goggles /></Nd>
      <Ln T={T} t0={at('clara', 0, 0.9)} a={[N.docR[0] - 62, N.docR[1] - 10]} b={[N.clara[0] + 62, N.clara[1] - 10]} c={[395, N.docR[1] - 90]} arrow label="la salva" ly={-12} size={36} fade={1 - seg(T, at('clara', 1), at('clara', 1, 0.4))} />
      {love > 0 && (
        <g transform={`translate(395 ${N.clara[1] - 50}) scale(${love * (1 + 0.08 * Math.sin(T * 7))})`}>
          <path d="M0 22 C-38 0 -24 -28 0 -10 C24 -28 38 0 0 22 Z" fill={RED} stroke={INK} strokeWidth="4" />
        </g>
      )}
      {heartBreak > 0 && heartBreak < 1 || (T > at('verita', 1, 0.6) && T < at('ponte', 2, 0.3)) ? (
        <g transform={`translate(395 ${N.clara[1] - 50})`} opacity={T > at('ponte', 2, 0.3) ? 0 : 1}>
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${sd * 10 * heartBreak} ${6 * heartBreak}) rotate(${sd * 14 * heartBreak})`}>
              <clipPath id={`r3-h${sd}`}><rect x={sd < 0 ? -40 : 0} y="-40" width="40" height="80" /></clipPath>
              <path d="M0 22 C-38 0 -24 -28 0 -10 C24 -28 38 0 0 22 Z" fill="#8A6A6A" stroke={INK} strokeWidth="4" clipPath={`url(#r3-h${sd})`} />
            </g>
          ))}
        </g>
      ) : null}
      <Tag T={T} t0={at('clara', 2, 0.3)} x={880} y={Y('ferrovia', 420)} text="doveva morire qui" bg={RED} fg="#FFFFFF" size={30} rot={-3} until={end('clara') - 0.2} />

      {/* ---- capitolo 6: la verità, Clara non crede, Doc crolla, Buford lo cattura */}
      <Tag T={T} t0={at('verita', 0, 0.3)} x={540} y={Y('ferrovia', 300)} text="vengo dal futuro" size={36} until={at('verita', 1, 0.3)} />
      <Tag T={T} t0={at('verita', 2, 0.2)} x={N.docR[0] + 60} y={N.docR[1] - 150} text="crolla" bg="#8A6A6A" fg="#FFFFFF" size={32} rot={4} until={at('verita', 3, 0.3)} />
      <Ln T={T} t0={at('verita', 3, 0.3)} a={[N.buford[0] - 20, N.buford[1] + 70]} b={[N.docR[0] + 50, N.docR[1] - 60]} c={[980, Y('ferrovia', 100)]} color={RED} arrow w={8} label="lo cattura" lx={140} size={40} fade={off('verita')} />
      <Tag T={T} t0={at('verita', 3, 1.0)} x={700} y={Y('paese', 280)} text="duello!" bg={RED} fg="#FFFFFF" size={44} rot={-4} until={end('verita') - 0.1} />

      {/* ---- capitolo 7: il duello, la piastra di ferro, il pugno, l'arresto */}
      <Ln T={T} t0={at('duello', 0, 0.2)} a={[N.martyW[0] + 62, N.martyW[1]]} b={[N.buford[0] - 62, N.buford[1]]} color={RED} dashed label="duello" ly={-20} size={40} fade={off('duello')} />
      {T >= at('duello', 1, 0.4) && T < end('duello') + 0.4 && (
        <g transform={`translate(${N.martyW[0] + 10} ${N.martyW[1] - 130}) scale(${pop(T, at('duello', 1, 0.4))})`} opacity={off('duello')}>
          <path d="M-46 -40 H46 V40 H-46 Z" fill="#6A6A70" stroke={P1885.ink} strokeWidth="6" />
          <circle r="20" fill="none" stroke="#3A3A40" strokeWidth="6" />
          <path d="M-36 -30 L-20 -30" stroke="#FFFFFF" strokeWidth="4" opacity=".5" />
          <text y="72" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="30" fill={P1885.ink} stroke={P1885.paper} strokeWidth="5" paintOrder="stroke">piastra di ferro</text>
        </g>
      )}
      {T >= shot && T < shot + 1.6 && (() => {
        const k = eob(seg(T, shot, shot + 0.3), 1.8);
        return (
          <g transform={`translate(${N.martyW[0] + 10} ${N.martyW[1] - 130}) scale(${k})`} opacity={1 - seg(T, shot + 1.0, shot + 1.6)}>
            <path d="M0 -60 L14 -20 L56 -28 L26 4 L48 40 L6 22 L-18 58 L-20 16 L-60 12 L-26 -12 Z" fill={YEL} stroke={P1885.ink} strokeWidth="5" />
            <text y="10" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="30" fill={DARK}>CLANG!</text>
          </g>
        );
      })()}
      {T >= at('duello', 2, 1.2) && (() => {
        const k = eob(seg(T, at('duello', 2, 1.2), at('duello', 2, 1.5)), 1.8);
        return (
          <g transform={`translate(${N.buford[0] - 30} ${N.buford[1] - 110}) scale(${k})`} opacity={off('duello')}>
            <path d="M0 -50 L12 -16 L48 -22 L22 4 L40 36 L4 20 L-16 50 L-18 14 L-52 10 L-22 -10 Z" fill={YEL} stroke={P1885.ink} strokeWidth="5" />
            <text y="10" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="28" fill={DARK}>POW!</text>
          </g>
        );
      })()}
      {T >= at('duello', 3, 0.2) && (
        <g transform={`translate(${N.buford[0]} ${N.buford[1]})`} opacity={seg(T, at('duello', 3, 0.2), at('duello', 3, 0.6))}>
          <rect x="-70" y="-70" width="140" height="140" rx="10" fill="none" stroke={P1885.ink} strokeWidth="6" />
          {[-42, -14, 14, 42].map((x) => <path key={x} d={`M${x} -70 V70`} stroke={P1885.ink} strokeWidth="7" />)}
        </g>
      )}
      <Tag T={T} t0={at('duello', 3, 0.6)} x={N.docW[0] + 40} y={N.docW[1] - 150} text="Doc è salvo" size={34} until={end('duello') + 0.2} />

      {/* ---- capitolo 8: il ponte, Clara sul treno, Doc resta, Marty a 88 miglia */}
      <Nd T={T} t0={at('ponte', 1, 0.1)} p={N.martyR} name="Marty" sub="sull'auto"><Skate T={T} /></Nd>
      <Tag T={T} t0={at('ponte', 1, 0.5)} x={N.clara[0] + 60} y={N.clara[1] - 150} text="ora gli crede" size={30} until={at('ponte', 2, 0.3)} />
      <Tag T={T} t0={at('ponte', 2, 0.6)} x={395} y={N.clara[1] - 150} text="Doc resta con lei" size={34} until={end('ponte') - 0.1} />
      <Travel T={T} t0={at('ponte', 3, 0.9)} d={toHome} id="r3-home" dur={1.3} label="di nuovo nel 1985" lx={RX - 170} ly={Y('miniera', 300)} labelUntil={at('futuro', 0, 0.2)} fade={1 - 0.7 * seg(T, end('ponte') + 1, end('ponte') + 1.6)} />
      <Tag T={T} t0={at('ponte', 3, 1.0)} x={760} y={Y('ferrovia', 200)} text="88!" size={60} rot={-4} until={end('ponte')} />

      {/* ---- capitolo 9: l'auto distrutta, la gara evitata, Doc col treno del tempo */}
      {T >= at('ponte', 3, 2.0) && (
        <g transform={`translate(760 ${Y('binari', 440)}) scale(.55)`} opacity={1 - 0.5 * wreck}>
          <TimeCar T={T} glow={0.2 * (1 - wreck)} s={1} />
          {wreck > 0 && <path d="M-120 -90 L120 40 M120 -90 L-120 40" stroke={RED} strokeWidth="18" strokeLinecap="round" opacity={wreck} />}
        </g>
      )}
      <Tag T={T} t0={at('futuro', 0, 1.3)} x={760} y={Y('binari', 300)} text="distrutta" bg={RED} fg="#FFFFFF" size={34} rot={-3} until={at('futuro', 1, 0.4)} />
      <Nd T={T} t0={at('futuro', 1, 0.1)} p={N.martyF} name="Marty" sub="niente più sfide" subFill={YEL}><Skate T={T} /></Nd>
      <Tag T={T} t0={at('futuro', 1, 0.6)} x={N.martyF[0] + 60} y={N.martyF[1] - 150} text="niente gara: niente incidente" size={30} until={at('futuro', 2, 0.6)} />
      <Travel T={T} t0={at('futuro', 2, 0.1)} d={docTrain} id="r3-train" dur={1.4} label="dal passato" lx={RAIL + 170} ly={Y('miniera', 400)} labelUntil={at('futuro', 3, 0.3)} />
      <Nd T={T} t0={at('futuro', 2, 1.4)} p={N.docT} name="Doc" sub="con la famiglia" subFill={YEL} ring={1}><Goggles /></Nd>
      <Nd T={T} t0={at('futuro', 2, 1.7)} p={N.claraT} name="Clara" color="#F29AC0"><Bell /></Nd>
      <Tag T={T} t0={at('futuro', 3, 0.3)} x={540} y={Y('binari', 180)} text="il futuro non è ancora scritto" size={36} rot={-2} />

      {flash > 0 && <rect x="-3000" y="-3000" width="7000" height="12000" fill="#FFF6D8" opacity={0.3 * flash} />}
    </g>
  );
};

export const makeLinee3 = (chapterId: string): React.FC<SceneProps> => {
  const Scene: React.FC<SceneProps> = ({ t }) => {
    const T = STARTS[chapterId] + t;
    const c = camAt(T);
    setUi(c.z);
    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="r3" />
          <radialGradient id="r3-bg" cx=".5" cy=".46" r=".8">
            <stop offset="0" stopColor="#2E1E5C" />
            <stop offset=".6" stopColor="#1C1240" />
            <stop offset="1" stopColor="#0C0820" />
          </radialGradient>
          <linearGradient id="r3-scrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0C0820" stopOpacity=".96" />
            <stop offset=".82" stopColor="#0C0820" stopOpacity=".88" />
            <stop offset="1" stopColor="#0C0820" stopOpacity="0" />
          </linearGradient>
          <pattern id="r3-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 H0 V40" fill="none" stroke="#33255E" strokeWidth="1" /></pattern>
          <pattern id="r3-grid2" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M200 0 H0 V200" fill="none" stroke="#5A2E78" strokeWidth="2" /></pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#r3-bg)" />
        <g transform={`translate(540 900) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
          <rect x="-4000" y="-4000" width="9080" height="12000" fill="url(#r3-grid)" opacity=".55" />
          <rect x="-4000" y="-4000" width="9080" height="12000" fill="url(#r3-grid2)" opacity=".5" />
          <Schema T={T} cam={c} />
        </g>
        <rect width="1080" height="575" fill="url(#r3-scrim)" />
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={INK} opacity={0.1 + 0.07 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Finish id="r3" tint="#1A1238" tintOpacity={0.1} />
      </svg>
    );
  };
  return Scene;
};

export { Tomb, Loco, eo };
