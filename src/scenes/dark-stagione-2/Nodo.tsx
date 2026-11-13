import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { HAND, SANS, STENCIL } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/dark-stagione-2.json';
import { Badge, Collar, Letter, RED, Raincoat, TINT, YELLOW, Yarn } from '../dark-stagione-1/Winden';

// Dark, stagione 2 come schema (formato "spiegato"): il nodo che si stringe. Tre fasce di anni dall'alto in basso
// (1921 della setta, 2019–2020 di Winden, 2053 delle rovine); a sinistra il passaggio nel tempo che le collega.
// Ogni personaggio è un cerchio con il suo oggetto (mai figure). Colpi di scena: il cartellino «Adam = Jonas da vecchio»,
// l'anello rosso madre-figlia di Charlotte ed Elisabeth, l'anello rosso Jonas → lettera → Michael, e alla fine un
// gomitolo blu che arriva da fuori dallo schema (un altro mondo). Dietro, una clessidra appena visibile che si capovolge.
// Coordinate = schermo (1080 × 1920): lo schema completo sta tra y 450 e 1260, sotto il titolo e sopra i sottotitoli.

const CHALK = '#E8E2D2';
const BLUE = '#5A9AE0';
const PASS_X = 120;
const Y = { 1921: 570, 2019: 770, 2020: 900, 2053: 1160 };
const N = {
  adam: [520, Y[1921]], noah: [800, Y[1921] + 20],
  michael: [300, Y[2019]], jonas: [400, Y[2020]], martha: [640, Y[2020]],
  charlotte: [880, Y[2019] + 40], lisa: [880, Y[2020] + 100], lisaAdulta: [880, Y[2053]],
  rovine: [440, Y[2053]], amici: [290, Y[2020] + 192], altra: [650, Y[2053] + 14],
} as const;
type P = readonly [number, number];

// ---------------------------------------------------------------- tempi dal JSON

export const STARTS: Record<string, number> = {};
export const CUES: Record<string, number[]> = {};
{
  let acc = film.copertina.durata;
  for (const c of film.capitoli) {
    STARTS[c.id] = acc;
    CUES[c.id] = subtitleTimes(c.sottotitoli, c.durata).map(([a]) => a);
    acc += c.durata;
  }
}
/** Istante assoluto della frase `cue` del capitolo `ch`, più `d` secondi. */
export const at = (ch: string, cue: number, d = 0) => STARTS[ch] + CUES[ch][cue] + d;
export const end = (ch: string) => STARTS[ch] + film.capitoli.find((c) => c.id === ch)!.durata;
const pop = (T: number, t0: number) => eob(seg(T, t0, t0 + 0.45), 1.7);

// ---------------------------------------------------------------- camera

type Shot = { at: number; x: number; y: number; z: number };
const WIDE = { x: 560, y: 860, z: 1 };
const SHOTS: Shot[] = [
  // visibile sullo schermo: y da cy − 340/z a cy + 390/z (tra il titolo e i sottotitoli)
  { at: at('futuro', 0), x: 520, y: 960, z: 1.0 },
  { at: at('padre', 0), x: 500, y: 870, z: 0.96 },
  { at: at('setta', 0), x: 520, y: 780, z: 1.0 },
  { at: at('adam', 0), x: 520, y: 790, z: 1.0 },
  { at: at('charlotte', 0), x: 680, y: 870, z: 1.0 },
  { at: at('piano', 0), ...WIDE, z: 0.92 },
  { at: at('martha', 0), x: 560, y: 840, z: 1.0 },
  { at: at('fine', 0), x: 500, y: 880, z: 1.0 },
  { at: at('mondo', 0), x: 600, y: 880, z: 1.0 },
  { at: at('mondo', 3, 0.3), ...WIDE, z: 0.92 },
];
const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.0));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: lerp(o.z, s.z, p) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 4, z: o.z };
};

// ---------------------------------------------------------------- elementi (stesso vocabolario della stagione 1)

const Node: React.FC<{ T: number; t0: number; p: P; name: string; sub?: string; ring?: number; side?: 'below' | 'right' | 'left'; r?: number; fade?: number; stroke?: string; children?: React.ReactNode }> = ({
  T, t0, p, name, sub, ring = 0, side = 'below', r = 52, fade = 1, stroke, children,
}) => {
  if (T < t0) return null;
  const s = pop(T, t0);
  const lx = side === 'right' ? r + 16 : side === 'left' ? -r - 16 : 0;
  const ly = side === 'below' ? r + 38 : 10;
  const anchor = side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle';
  return (
    <g transform={`translate(${p[0]} ${p[1]})`} opacity={seg(T, t0, t0 + 0.15) * fade}>
      <g transform={`scale(${s})`}>
        {ring > 0 && <Glow id={`no-g${p[0]}${p[1]}`} x={0} y={0} r={r * 2.4} t={T} color={YELLOW} amp={0.1} rate={2.4} opacity={0.45 * ring} />}
        <circle r={r + 6} fill="#000" opacity=".35" transform="translate(3 6)" />
        <circle r={r} fill="#22302B" stroke={stroke ?? (ring > 0.5 ? YELLOW : CHALK)} strokeWidth={ring > 0.5 ? 6 : 4} />
        <clipPath id={`no-c${p[0]}${p[1]}`}><circle r={r - 4} /></clipPath>
        <g clipPath={`url(#no-c${p[0]}${p[1]})`}>{children}</g>
      </g>
      {name && <text x={lx} y={ly} textAnchor={anchor} fontFamily={SANS} fontWeight={800} fontSize="28" fill={CHALK} opacity={seg(T, t0 + 0.2, t0 + 0.5)}>{name}</text>}
      {sub && <text x={lx} y={ly + 28} textAnchor={anchor} fontFamily={SANS} fontWeight={400} fontSize="21" fill="#A8B4AC" opacity={seg(T, t0 + 0.3, t0 + 0.6)}>{sub}</text>}
    </g>
  );
};

const Link: React.FC<{ T: number; t0: number; a: P; b: P; c?: P; color?: string; dashed?: boolean; label?: string; arrow?: boolean; w?: number; lx?: number; ly?: number; size?: number; fade?: number; flow?: boolean }> = ({
  T, t0, a, b, c, color = CHALK, dashed = false, label, arrow = false, w = 5, lx = 0, ly = 0, size = 30, fade = 1, flow = false,
}) => {
  if (T < t0) return null;
  const p = eo(seg(T, t0, t0 + 0.6));
  const [mx, my] = c ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  const ang = (Math.atan2(b[1] - my, b[0] - mx) * 180) / Math.PI;
  const id = `no-m${a[0]}${a[1]}${b[0]}${b[1]}`;
  return (
    <g opacity={fade}>
      {dashed ? (
        <>
          <mask id={id} maskUnits="userSpaceOnUse" x="-500" y="-500" width="2080" height="2920"><path d={d} fill="none" stroke="#fff" strokeWidth={w + 6} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
          <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray="16 12" strokeDashoffset={flow ? -T * 40 : 0} strokeLinecap="round" mask={`url(#${id})`} />
        </>
      ) : (
        <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
      )}
      {arrow && p > 0.95 && <path d="M-18 -12 L0 0 L-18 12" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`} />}
      {label && (
        <text x={0.25 * a[0] + 0.5 * mx + 0.25 * b[0] + lx} y={0.25 * a[1] + 0.5 * my + 0.25 * b[1] + ly} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={size}
          fill={color === CHALK ? '#D8D2C0' : color} opacity={seg(T, t0 + 0.35, t0 + 0.7)}>{label}</text>
      )}
    </g>
  );
};

const Tag: React.FC<{ T: number; t0: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number; until?: number }> = ({ T, t0, x, y, text, bg = YELLOW, fg = '#0B0F0E', size = 30, rot = 0, until = 1e9 }) => {
  if (T < t0 || T > until + 0.5) return null;
  const w = text.length * size * 0.56 + 36;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(T, t0)})`} opacity={1 - seg(T, until, until + 0.5)}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx="10" fill={bg} />
      <text y={size * 0.33} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};

/** Clessidra d'ottone (Adam). */
const Hourglass: React.FC<{ T: number; scale?: number }> = ({ T, scale = 1 }) => {
  const sand = mod(T * 0.15, 1);
  return (
    <g transform={`scale(${scale})`}>
      <rect x="-46" y="-70" width="92" height="14" rx="4" fill="#C9A458" stroke="#000" strokeWidth="4" />
      <rect x="-46" y="56" width="92" height="14" rx="4" fill="#C9A458" stroke="#000" strokeWidth="4" />
      <path d="M-36 -56 Q-36 -10 -6 0 Q-36 10 -36 56 H36 Q36 10 6 0 Q36 -10 36 -56 Z" fill="#CFE6EE" fillOpacity=".35" stroke="#E8E2D2" strokeWidth="4" />
      <path d={`M-28 ${-50 + 40 * sand} Q0 ${-30 + 40 * sand} 28 ${-50 + 40 * sand} L6 -4 H-6 Z`} fill="#E8C878" />
      <path d={`M-30 54 Q0 ${54 - 40 * sand} 30 54 Z`} fill="#E8C878" />
      <path d="M0 -2 V50" stroke="#E8C878" strokeWidth="2" />
    </g>
  );
};
/** Lavagnetta col gessetto (Elisabeth). */
const Slate: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <g transform={`scale(${scale})`}>
    <rect x="-50" y="-38" width="100" height="76" rx="6" fill="#2A3A34" stroke="#8A6A44" strokeWidth="8" />
    <path d="M-34 -16 q10 -10 20 0 t20 0 M-34 8 h40" stroke="#E8E2D2" strokeWidth="4" fill="none" />
    <rect x="22" y="14" width="20" height="8" rx="2" fill="#F2EEE4" />
  </g>
);
const RuinIcon: React.FC<{ T: number }> = ({ T }) => (
  <g>
    <rect x="-60" y="-60" width="120" height="120" fill="#4A4234" />
    <path d="M-44 40 C-36 10 -36 -6 -40 -20 L-26 -12 L-16 -26 L-6 -10 C-8 10 -6 26 4 40 Z" fill="#2A261E" />
    <path d="M14 40 L20 -4 L30 6 L40 -10 L46 40 Z" fill="#221E18" />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={-50 + ((i * 29) % 100)} cy={-50 + mod(i * 31 + T * 20, 100)} r="2.5" fill="#E0D8C8" />)}
  </g>
);
const Scar: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <path d="M-18 -6 Q0 6 18 -4" stroke="#E07060" strokeWidth="5" fill="none" strokeLinecap="round" />
    {[-10, 0, 10].map((dx) => <path key={dx} d={`M${dx} -6 v12`} stroke="#E07060" strokeWidth="3" strokeLinecap="round" />)}
  </g>
);
const Cross: React.FC<{ T: number; t0: number; x: number; y: number }> = ({ T, t0, x, y }) =>
  T < t0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${pop(T, t0)})`}>
      <path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke={RED} strokeWidth="11" strokeLinecap="round" />
    </g>
  );

// ---------------------------------------------------------------- lo schema al tempo T

const r = rng(2053);
export const MOTES = Array.from({ length: 22 }, () => ({ x: r() * 1080, y: r() * 1920, s: 1.5 + r() * 2.5, v: 5 + r() * 12, ph: r() * 6 }));

export const Schema: React.FC<{ T: number }> = ({ T }) => {
  const yearAt: Record<string, number> = { 2053: at('futuro', 0), 2020: at('futuro', 0, 0.3), 1921: at('setta', 0) };
  const passage = eo(seg(T, at('setta', 1, 0.2), at('setta', 1, 1.2)));
  const focus = (t0: number, t1: number) => seg(T, t0, t0 + 0.3) * (1 - seg(T, t1, t1 + 0.4));
  const off = (ch: string) => 1 - seg(T, end(ch) - 0.4, end(ch) + 0.3);
  const knot = eio(seg(T, at('piano', 0), at('piano', 0, 1.6)));
  const doom = seg(T, at('fine', 0), at('fine', 0, 0.6));
  const loopLisa = eio(seg(T, at('charlotte', 3), at('charlotte', 3, 1.4)));
  const loopMichael = eio(seg(T, at('padre', 3, 0.2), at('padre', 3, 1.6)));
  const lettera = eo(seg(T, at('padre', 1, 0.2), at('padre', 1, 0.8)));
  const scarJ = seg(T, at('futuro', 1, 0.3), at('futuro', 1, 0.7));
  const scar = seg(T, at('adam', 1, 0.1), at('adam', 1, 0.5));
  const shake = doom > 0 && doom < 1 ? Math.sin(T * 50) * 4 * (1 - doom) : 0;

  return (
    <g>
      {/* fasce degli anni */}
      {([[1921, '1921'], [2020, '2019 · 2020'], [2053, '2053']] as const).map(([yr, label]) => {
        const t0 = yearAt[yr];
        if (T < t0) return null;
        const y = (yr === 2020 ? Y[2019] : Y[yr]) - 88;
        const dim = yr === 2020 ? 1 - 0.5 * doom : 1;
        return (
          <g key={yr} opacity={seg(T, t0, t0 + 0.5) * dim} transform={`translate(${yr === 2020 ? shake : 0} 0)`}>
            <path d={`M190 ${y} H${190 + 850 * eo(seg(T, t0, t0 + 0.8))}`} stroke="#3A4A44" strokeWidth="2" />
            <text x="1030" y={y + 36} textAnchor="end" fontFamily={STENCIL} fontWeight={800} fontSize="34" fill="#A8B8B0">{label}</text>
          </g>
        );
      })}

      {/* il passaggio nel tempo: colonna gialla tratteggiata a sinistra */}
      {passage > 0 && <path d={`M${PASS_X} ${Y[2053]} V${lerp(Y[2053], Y[1921], passage)}`} stroke={YELLOW} strokeWidth="9" strokeDasharray="20 14" strokeDashoffset={-T * 40} strokeLinecap="round" />}
      <text x={PASS_X} y={Y[1921] - 40} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="26" fill={YELLOW} opacity={seg(T, at('setta', 1, 0.8), at('setta', 1, 1.2))}>viaggi nel tempo</text>

      {/* il nodo: tutto lo schema si stringe intorno al 27 giugno 2020 */}
      {knot > 0 && (
        <g opacity={off('piano') * 0.9 + 0.1 * knot}>
          <ellipse cx="560" cy="860" rx={lerp(560, 470, knot)} ry={lerp(420, 360, knot)} fill="none" stroke={YELLOW} strokeWidth="7" strokeDasharray="18 12" strokeDashoffset={-T * 30} />
          <path d={`M300 860 C${lerp(300, 520, knot)} 700 ${lerp(820, 600, knot)} 1020 820 860 C${lerp(820, 600, knot)} 700 ${lerp(300, 520, knot)} 1020 300 860`} fill="none" stroke={YELLOW} strokeWidth="6" opacity={0.6 * knot} />
        </g>
      )}
      <Tag T={T} t0={at('piano', 0, 0.8)} x={600} y={1040} text="il nodo" size={30} rot={-3} until={at('piano', 2)} />
      <Tag T={T} t0={at('piano', 1, 0.3)} x={640} y={1100} text="la fine deve arrivare" bg={CHALK} size={24} rot={2} until={end('piano') - 0.4} />
      <Tag T={T} t0={at('piano', 2, 0.4)} x={600} y={1040} text="27 giugno 2020" bg={RED} fg="#FFFFFF" size={28} rot={-2} until={end('piano') - 0.4} />

      {/* legami */}
      <Link T={T} t0={at('futuro', 0, 0.4)} a={[N.jonas[0] - 40, N.jonas[1] + 50]} b={[N.rovine[0] - 50, N.rovine[1] - 40]} c={[300, 1080]} color={YELLOW} dashed w={7} flow label="bloccato" lx={-60} size={30} arrow fade={off('futuro')} />
      <Link T={T} t0={at('futuro', 3, 0.1)} a={[N.rovine[0] + 50, N.rovine[1] - 40]} b={[N.jonas[0] + 40, N.jonas[1] + 52]} c={[520, 1060]} color={YELLOW} dashed w={7} flow label="fugge indietro" lx={10} ly={60} size={28} arrow fade={off('futuro')} />
      <Link T={T} t0={at('setta', 2, 0.3)} a={[N.noah[0] - 56, N.noah[1]]} b={[N.adam[0] + 56, N.adam[1]]} label="lo serve" ly={-22} size={28} />
      <Link T={T} t0={at('adam', 2, 0.1)} a={[N.jonas[0], N.jonas[1] - 56]} b={[N.adam[0] - 30, N.adam[1] + 54]} c={[380, 680]} color={YELLOW} dashed w={7} flow arrow />
      <Link T={T} t0={at('charlotte', 1, 0.2)} a={[N.noah[0] + 30, N.noah[1] + 52]} b={[N.charlotte[0], N.charlotte[1] - 54]} label="padre" lx={-44} arrow />
      <Link T={T} t0={at('charlotte', 2, 0.1)} a={[N.charlotte[0], N.charlotte[1] + 54]} b={[N.lisa[0], N.lisa[1] - 50]} label="figlia" lx={46} arrow />
      <Link T={T} t0={at('charlotte', 2, 0.8)} a={[N.lisa[0], N.lisa[1] + 50]} b={[N.lisaAdulta[0], N.lisaAdulta[1] - 54]} color={YELLOW} dashed w={6} flow label="da grande" lx={-74} size={26} arrow />
      <Link T={T} t0={at('charlotte', 2, 1.4)} a={[N.lisaAdulta[0] + 56, N.lisaAdulta[1] - 20]} b={[N.charlotte[0] + 56, N.charlotte[1] + 10]} c={[1070, 1000]} color={RED} w={6} label="madre" lx={18} size={30} arrow />
      {loopLisa > 0 && (
        <path d={`M${N.charlotte[0]} ${N.charlotte[1]} L${N.lisa[0]} ${N.lisa[1]} L${N.lisaAdulta[0]} ${N.lisaAdulta[1]} Q1070 1000 ${N.charlotte[0]} ${N.charlotte[1]}`}
          fill={RED} fillOpacity={0.1 * loopLisa} stroke={RED} strokeWidth="9" strokeLinejoin="round" pathLength={1} strokeDasharray={`${loopLisa} 1`} opacity=".85" />
      )}
      <Link T={T} t0={at('padre', 0, 0.2)} a={[N.jonas[0] - 50, N.jonas[1] - 20]} b={[N.michael[0], N.michael[1] + 54]} c={[300, 880]} color={YELLOW} dashed w={6} flow label="torna indietro" lx={-40} ly={30} size={26} arrow />
      <Link T={T} t0={at('padre', 1, 0.6)} a={[N.jonas[0] + 10, N.jonas[1] - 56]} b={[N.michael[0] + 56, N.michael[1]]} c={[420, 760]} label="la lettera" lx={50} ly={-10} size={26} arrow />
      <Tag T={T} t0={at('padre', 2, 0.2)} x={N.michael[0] + 30} y={N.michael[1] - 86} text="non l'ha ancora scritta" bg={CHALK} size={22} until={end('padre') - 0.4} />
      {loopMichael > 0 && (
        <path d={`M${N.jonas[0]} ${N.jonas[1]} Q420 760 ${N.michael[0]} ${N.michael[1]} Q300 880 ${N.jonas[0]} ${N.jonas[1]}`} fill={RED} fillOpacity={0.1 * loopMichael} stroke={RED} strokeWidth="9" pathLength={1} strokeDasharray={`${loopMichael} 1`} opacity=".85" />
      )}
      <Tag T={T} t0={at('padre', 3, 0.8)} x={200} y={Y[2020] + 40} text="l'ha causato lui" bg={RED} fg="#FFFFFF" size={24} rot={-4} until={end('padre') - 0.4} />
      <Link T={T} t0={at('martha', 0, 0.4)} a={[N.jonas[0] + 54, N.jonas[1]]} b={[N.martha[0] - 54, N.martha[1]]} color="#E07060" dashed label="la ama" ly={-22} size={28} />
      <Link T={T} t0={at('martha', 1, 0.1)} a={[N.adam[0] + 30, N.adam[1] + 54]} b={[N.martha[0] - 10, N.martha[1] - 56]} c={[640, 700]} color={RED} w={6} arrow />
      <Link T={T} t0={at('martha', 2, 0.2)} a={[N.jonas[0] + 30, N.jonas[1] - 50]} b={[N.adam[0] + 10, N.adam[1] + 56]} c={[520, 760]} color={YELLOW} dashed w={6} flow label="diventerà lui" lx={70} ly={10} size={26} arrow fade={off('martha')} />
      {/* la fine del mondo e il rifugio: tra i pochi che si salvano c'è la piccola Elisabeth, che da grande guiderà i sopravvissuti */}
      <Tag T={T} t0={at('fine', 0, 0.2)} x={620} y={Y[2020] + 190} text="la fine del mondo" bg={RED} fg="#FFFFFF" size={30} rot={-2} until={end('fine') - 0.4} />
      {T >= at('fine', 1, 0.1) && (
        <g opacity={seg(T, at('fine', 1, 0.1), at('fine', 1, 0.4))}>
          <rect x="170" y={Y[2020] + 150} width="240" height="84" rx="8" fill="none" stroke={CHALK} strokeWidth="4" strokeDasharray="10 8" />
          <text x="290" y={Y[2020] + 140} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="26" fill="#D8D2C0">il rifugio</text>
        </g>
      )}
      {[0, 1, 2].map((k) => T >= at('fine', 1, 0.3 + k * 0.15) && (
        <g key={k} transform={`translate(${220 + k * 70} ${Y[2020] + 192}) scale(${pop(T, at('fine', 1, 0.3 + k * 0.15))})`}>
          <circle r={24} fill="#22302B" stroke={k === 0 ? YELLOW : CHALK} strokeWidth="4" />
          {k === 0 && <Slate scale={0.34} />}
        </g>
      ))}
      <Link T={T} t0={at('fine', 1, 0.6)} a={[N.lisa[0] - 46, N.lisa[1] + 20]} b={[246, Y[2020] + 186]} color={YELLOW} dashed w={4} arrow fade={off('fine')} />
      <Tag T={T} t0={at('fine', 2, 0.3)} x={250} y={Y[2020] + 268} text="sopravvissuti" bg={CHALK} size={24} />
      {/* un altro mondo: il gomitolo blu arriva da fuori e porta via Jonas */}
      <Link T={T} t0={at('mondo', 1, 0.1)} a={[N.altra[0] - 40, N.altra[1] - 44]} b={[N.jonas[0] + 44, N.jonas[1] + 40]} c={[480, 1040]} color={BLUE} w={7} label="via con sé" ly={40} size={28} arrow />
      <Tag T={T} t0={at('mondo', 2, 0.2)} x={560} y={Y[2020] + 150} text="un altro mondo" bg={BLUE} fg="#FFFFFF" size={28} rot={3} />
      <Tag T={T} t0={at('futuro', 2, 0.3)} x={720} y={Y[2020] + 150} text="27 giugno 2020: la fine" bg={RED} fg="#FFFFFF" size={26} rot={-2} until={end('futuro') - 0.4} />
      <Tag T={T} t0={at('adam', 2, 0.6)} x={640} y={Y[1921] + 150} text="Adam = Jonas da vecchio" size={26} rot={-2} />
      <Tag T={T} t0={at('setta', 3, 0.2)} x={700} y={Y[1921] - 70} text="fermare il giro" bg={CHALK} size={24} until={end('setta') - 0.4} />

      {/* nodi */}
      <Node T={T} t0={at('futuro', 0, 0.1)} p={N.jonas} name="Jonas" ring={focus(at('futuro', 0), at('futuro', 1)) + focus(at('adam', 2), at('adam', 3, 1)) + focus(at('mondo', 1), at('mondo', 3))}>
        <g transform="translate(0 -40)"><Raincoat id="no-rc" t={T} scale={0.22} wind={0.3} wet={false} /></g>
      </Node>
      <Scar x={N.jonas[0] + 52} y={N.jonas[1] - 34} o={scarJ} />
      <Node T={T} t0={at('futuro', 0, 0.6)} p={N.rovine} name="Winden distrutta" ring={focus(at('futuro', 1), at('futuro', 2))}><RuinIcon T={T} /></Node>
      <Node T={T} t0={at('setta', 0, 0.2)} p={N.adam} name="Adam" sub="capo della setta" ring={focus(at('setta', 0), at('setta', 2)) + focus(at('adam', 0), at('adam', 3, 1))}>
        <Hourglass T={T} scale={0.55} />
      </Node>
      <Scar x={N.adam[0] + 52} y={N.adam[1] - 34} o={scar} />
      <Node T={T} t0={at('setta', 2, 0.1)} p={N.noah} name="Noah" sub="finto prete" side="right" ring={focus(at('setta', 2), at('setta', 3)) + focus(at('charlotte', 1), at('charlotte', 2))}>
        <g transform="translate(0 -6)"><Collar scale={0.5} /></g>
      </Node>
      <Node T={T} t0={at('charlotte', 0, 0.1)} p={N.charlotte} name="Charlotte" sub="polizia" side="left" ring={focus(at('charlotte', 0), at('charlotte', 1))}>
        <Badge scale={0.6} />
      </Node>
      {T >= at('charlotte', 0, 0.4) && T < at('charlotte', 1, 0.4) && <text x={N.charlotte[0] + 70} y={N.charlotte[1] + 20} fontFamily={STENCIL} fontWeight={800} fontSize="56" fill="#D8D2C0">?</text>}
      <Node T={T} t0={at('charlotte', 2, 0.1)} p={N.lisa} name="Elisabeth" sub="bambina" side="left" r={44}><Slate scale={0.62} /></Node>
      <Node T={T} t0={at('charlotte', 2, 0.9)} p={N.lisaAdulta} name="Elisabeth" sub="da grande" side="left" ring={focus(at('charlotte', 2, 0.9), at('charlotte', 3, 1.2)) + focus(at('fine', 2, 0.1), end('fine'))}><Slate scale={0.72} /></Node>
      <Node T={T} t0={at('padre', 0, 0.3)} p={N.michael} name="Michael" sub="padre di Jonas" side="left" ring={focus(at('padre', 0), at('padre', 3, 1.2))}>
        <Letter scale={0.24} open={lettera} />
      </Node>
      <Node T={T} t0={at('martha', 0, 0.1)} p={N.martha} name="Martha" ring={focus(at('martha', 0), at('martha', 1))}><Yarn r={28} /></Node>
      <Cross T={T} t0={at('martha', 1, 0.6)} x={N.martha[0]} y={N.martha[1]} />
      <Node T={T} t0={at('mondo', 0, 0.1)} p={N.altra} name="altra Martha" side="below" stroke={BLUE} ring={focus(at('mondo', 0), at('mondo', 2))}>
        <g>
          <circle r="28" fill={BLUE} stroke="#000" strokeWidth="6" />
          {[-0.6, -0.2, 0.2, 0.6].map((k, i) => <path key={i} d={`M${-25} ${k * 28} Q0 ${k * 28 - 14} 25 ${k * 28 + 4}`} fill="none" stroke="#2A5A9A" strokeWidth="3" />)}
        </g>
      </Node>
    </g>
  );
};

export const makeNodo = (chapterId: string): React.FC<SceneProps> => {
  const Scene: React.FC<SceneProps> = ({ t }) => {
    const T = STARTS[chapterId] + t;
    const c = camAt(T);
    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="no" />
          <linearGradient id="no-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0C110F" /><stop offset=".8" stopColor="#0C110F" stopOpacity=".92" /><stop offset="1" stopColor="#0C110F" stopOpacity="0" /></linearGradient>
          <radialGradient id="no-bg" cx=".5" cy=".44" r=".75">
            <stop offset="0" stopColor="#22302B" />
            <stop offset=".6" stopColor="#141B18" />
            <stop offset="1" stopColor="#080B0A" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#no-bg)" />
        {/* clessidra appena visibile dietro lo schema, che ogni tanto si capovolge: il tempo che ricomincia */}
        <g transform={`translate(540 860) rotate(${180 * Math.floor(T / 20) + 180 * eio(seg(mod(T, 20), 18, 20))})`} opacity=".08">
          <path d="M-300 -480 H300 M-300 480 H300" stroke={CHALK} strokeWidth="10" />
          <path d="M-240 -460 Q-240 -80 -30 0 Q-240 80 -240 460 H240 Q240 80 30 0 Q240 -80 240 -460 Z" fill="none" stroke={CHALK} strokeWidth="5" />
        </g>
        <g transform={`translate(540 860) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
          <Schema T={T} />
        </g>
        <rect width="1080" height="530" fill="url(#no-top)" />
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={CHALK} opacity={0.12 + 0.08 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Finish id="no" tint={TINT} tintOpacity={0.08} />
      </svg>
    );
  };
  return Scene;
};
