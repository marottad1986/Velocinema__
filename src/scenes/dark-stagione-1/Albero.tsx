import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { HAND, SANS, STENCIL } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/dark-stagione-1.json';
import { Cards, Collar, Device, Letter, PocketWatch, RED, Raincoat, TINT, YELLOW, Yarn } from './Winden';

// Dark, stagione 1 come schema (formato "spiegato"): l'albero che si annoda. Due famiglie in colonna (Kahnwald a
// sinistra, Nielsen a destra), gli anni dall'alto in basso; a sinistra il passaggio della grotta, che collega gli anni.
// Ogni personaggio è un cerchio con il suo oggetto (mai figure). Il colpo di scena è un filo giallo «torna nel 1986» che
// fa di Mikkel e Michael la stessa persona e chiude un anello rosso: Michael → Jonas → Martha → Mikkel → Michael.
// Dietro, un quadrante d'orologio appena visibile che gira (il tempo che torna). Lo schema si costruisce frase dopo
// frase; ogni capitolo è lo stesso albero in un altro momento. Alla fine la camera mostra tutto l'albero.
// Coordinate = schermo (1080 × 1920): l'albero completo sta tra y 450 e 1260, sotto il titolo e sopra i sottotitoli.

const CHALK = '#E8E2D2';
const DIM = '#5E6E66';
const PASS_X = 130;
const Y = { 1953: 490, 1986: 640, cresce: 800, 2019: 975, 2052: 1185 };
const N = {
  ines: [340, Y[1986]], michael: [340, Y.cresce], jonas: [340, Y[2019]], straniero: [340, Y[2052]],
  martha: [600, Y[2019]], mikkel: [790, Y[2019]], scomparsi: [965, Y[2019]], noah: [965, Y[1986]], rovine: [790, Y[2052]],
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
/** Fine del capitolo (s assoluti): le scritte che servono a un solo capitolo si spengono qui. */
export const end = (ch: string) => STARTS[ch] + film.capitoli.find((c) => c.id === ch)!.durata;
const pop = (T: number, t0: number) => eob(seg(T, t0, t0 + 0.45), 1.7);

// ---------------------------------------------------------------- camera

type Shot = { at: number; x: number; y: number; z: number };
const WIDE = { x: 540, y: 860, z: 1 };
const SHOTS: Shot[] = [
  { at: at('winden', 0), x: 540, y: 900, z: 1.25 },
  { at: at('winden', 1), x: 900, y: 960, z: 1.45 },
  { at: at('winden', 2), x: 420, y: 900, z: 1.35 },
  { at: at('mikkel', 0), x: 830, y: 960, z: 1.3 },
  { at: at('mikkel', 1), x: 640, y: 960, z: 1.0 },
  { at: at('mikkel', 2), x: 400, y: 990, z: 1.15 },
  { at: at('trentatre', 0), x: 300, y: 820, z: 1.15 },
  { at: at('trentatre', 2), x: 360, y: 760, z: 1.05 },
  { at: at('michael', 0), x: 560, y: 820, z: 1.1 },
  { at: at('michael', 1), x: 400, y: 720, z: 1.35 },
  { at: at('michael', 2), x: 400, y: 880, z: 1.3 },
  { at: at('michael', 4), ...WIDE, y: 840, z: 1.05 },
  { at: at('noah', 0), x: 900, y: 700, z: 1.4 },
  { at: at('noah', 3), x: 880, y: 820, z: 1.25 },
  { at: at('straniero', 0), x: 440, y: 1080, z: 1.2 },
  { at: at('straniero', 2), x: 330, y: 1020, z: 1.1 },
  { at: at('straniero', 3), x: 460, y: 990, z: 1.05 },
  { at: at('scelta', 0), x: 420, y: 800, z: 1.15 },
  { at: at('scelta', 3), ...WIDE },
  { at: at('inizio', 0), x: 380, y: 1100, z: 1.3 },
  { at: at('inizio', 1), x: 260, y: 840, z: 1.05 },
  { at: at('inizio', 3), ...WIDE },
  { at: at('fine', 0), x: 640, y: 900, z: 1.05 },
  { at: at('fine', 1), x: 640, y: 1080, z: 1.15 },
  { at: at('fine', 3, 0.3), ...WIDE, z: 0.97 },
];
const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.0));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: lerp(o.z, s.z, p) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 4, z: o.z };
};

// ---------------------------------------------------------------- elementi

/** Nodo: cerchio con l'oggetto del personaggio, nome sotto (o a lato), anello giallo se è al centro del discorso. */
const Node: React.FC<{ T: number; t0: number; p: P; name: string; sub?: string; ring?: number; side?: 'below' | 'right' | 'left'; r?: number; fade?: number; children?: React.ReactNode }> = ({
  T, t0, p, name, sub, ring = 0, side = 'below', r = 54, fade = 1, children,
}) => {
  if (T < t0) return null;
  const s = pop(T, t0);
  const lx = side === 'right' ? r + 16 : side === 'left' ? -r - 16 : 0;
  const ly = side === 'below' ? r + 38 : 10;
  const anchor = side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle';
  return (
    <g transform={`translate(${p[0]} ${p[1]})`} opacity={seg(T, t0, t0 + 0.15) * fade}>
      <g transform={`scale(${s})`}>
        {ring > 0 && <Glow id={`al-g${p[0]}${p[1]}`} x={0} y={0} r={r * 2.4} t={T} color={YELLOW} amp={0.1} rate={2.4} opacity={0.45 * ring} />}
        <circle r={r + 6} fill="#000" opacity=".35" transform="translate(3 6)" />
        <circle r={r} fill="#22302B" stroke={ring > 0.5 ? YELLOW : CHALK} strokeWidth={ring > 0.5 ? 6 : 4} />
        <clipPath id={`al-c${p[0]}${p[1]}`}><circle r={r - 4} /></clipPath>
        <g clipPath={`url(#al-c${p[0]}${p[1]})`}>{children}</g>
      </g>
      <text x={lx} y={ly} textAnchor={anchor} fontFamily={SANS} fontWeight={800} fontSize="28" fill={CHALK} opacity={seg(T, t0 + 0.2, t0 + 0.5)}>{name}</text>
      {sub && <text x={lx} y={ly + 28} textAnchor={anchor} fontFamily={SANS} fontWeight={400} fontSize="21" fill="#A8B4AC" opacity={seg(T, t0 + 0.3, t0 + 0.6)}>{sub}</text>}
    </g>
  );
};

/** Legame che si disegna in 0,6 s: curva quadratica (c = punto di controllo), scritta a mano a metà. */
const Link: React.FC<{ T: number; t0: number; a: P; b: P; c?: P; color?: string; dashed?: boolean; label?: string; arrow?: boolean; w?: number; lx?: number; ly?: number; size?: number; fade?: number; flow?: boolean }> = ({
  T, t0, a, b, c, color = CHALK, dashed = false, label, arrow = false, w = 5, lx = 0, ly = 0, size = 34, fade = 1, flow = false,
}) => {
  if (T < t0) return null;
  const p = eo(seg(T, t0, t0 + 0.6));
  const [mx, my] = c ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  const ang = (Math.atan2(b[1] - my, b[0] - mx) * 180) / Math.PI;
  const id = `al-m${a[0]}${a[1]}${b[0]}${b[1]}`;
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

/** Etichetta piena (cartellino) che salta fuori: per i colpi di scena. */
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

/** Ingresso della grotta in miniatura (lungo il passaggio). */
const Cave: React.FC<{ T: number; t0: number; y: number; lit: number }> = ({ T, t0, y, lit }) => {
  if (T < t0) return null;
  return (
    <g transform={`translate(${PASS_X} ${y}) scale(${pop(T, t0)})`}>
      <path d="M-46 26 Q-40 -26 0 -32 Q40 -26 46 26 Z" fill="#3A443E" stroke={CHALK} strokeWidth="3" />
      <path d="M-16 26 Q-16 -4 0 -8 Q16 -4 16 26 Z" fill="#0A0C0B" />
      <ellipse cx="0" cy="14" rx="11" ry="13" fill="#FFD99A" opacity={lit * (0.7 + 0.3 * Math.sin(T * 3))} />
    </g>
  );
};

const CapIcon = () => (
  <g transform="scale(.55)">
    <path d="M-80 20 Q-66 -50 0 -56 Q66 -50 80 20 Q0 40 -80 20 Z" fill="#FFFFFF" stroke="#000" strokeWidth="6" />
    <path d="M-16 -30 h32 M0 -46 v32" stroke={RED} strokeWidth="9" />
  </g>
);
const MissingIcon = () => (
  <g>
    <text x="-12" y="18" textAnchor="middle" fontFamily={STENCIL} fontWeight={800} fontSize="56" fill="#D8D2C0">?</text>
    <text x="16" y="26" textAnchor="middle" fontFamily={STENCIL} fontWeight={800} fontSize="40" fill="#A8A290">?</text>
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
const ChairIcon: React.FC<{ T: number; on: number }> = ({ T, on }) => (
  <g transform="scale(.7)">
    <path d="M-30 50 V-6 M30 50 V-6 M-38 -6 H38" stroke="#C9CED2" strokeWidth="6" />
    <path d="M-28 -6 V-48 Q0 -58 28 -48 V-6" fill="#6A706C" stroke="#000" strokeWidth="4" />
    {[-36, -18, 0, 18, 36].map((x, i) => <circle key={x} cx={x} cy={-62 + Math.abs(x) * 0.3} r="6" fill={on > 0.5 && Math.sin(T * 9 + i) > -0.6 ? '#FFF6D8' : '#5A5E5C'} />)}
  </g>
);

// ---------------------------------------------------------------- l'albero al tempo T

const r = rng(1986);
export const MOTES = Array.from({ length: 22 }, () => ({ x: r() * 1080, y: r() * 1920, s: 1.5 + r() * 2.5, v: 5 + r() * 12, ph: r() * 6 }));

export const Tree: React.FC<{ T: number }> = ({ T }) => {
  const passage = eo(seg(T, at('trentatre', 0, 0.2), at('trentatre', 1, 0.6)));
  const loop = eio(seg(T, at('michael', 4, 0.4), at('michael', 4, 2.0)));
  const ring = eio(seg(T, at('inizio', 2), at('inizio', 2, 1.4)));
  const lettera = eo(seg(T, at('michael', 3), at('michael', 3, 0.6)));
  const device = seg(T, at('inizio', 0, 0.2), at('inizio', 0, 1));
  const noJonas = seg(T, at('scelta', 2), at('scelta', 2, 0.4)) * (1 - seg(T, at('scelta', 2, 1.5), at('scelta', 2, 2.1)));
  const yearAt: Record<number, number> = { 2019: at('winden', 0), 1986: at('trentatre', 2, 0.1), 1953: at('trentatre', 2, 0.9), 2052: at('fine', 1) };
  const focus = (t0: number, t1: number) => seg(T, t0, t0 + 0.3) * (1 - seg(T, t1, t1 + 0.4));
  const off = (ch: string) => 1 - seg(T, end(ch) - 0.4, end(ch) + 0.3);

  return (
    <g>
      {/* fasce degli anni: nome a sinistra e riga sottile */}
      {([1953, 1986, 2019, 2052] as const).map((yr) => {
        const t0 = yearAt[yr];
        if (T < t0) return null;
        const y = Y[yr] - (yr === 2019 ? 88 : yr === 2052 ? 70 : 60);
        return (
          <g key={yr} opacity={seg(T, t0, t0 + 0.5)}>
            <path d={`M200 ${y} H${200 + 840 * eo(seg(T, t0, t0 + 0.8))}`} stroke="#3A4A44" strokeWidth="2" />
            <text x="1030" y={y - 10} textAnchor="end" fontFamily={STENCIL} fontWeight={800} fontSize="34" fill="#7A8A82">{yr}</text>
          </g>
        );
      })}
      <text x="340" y="468" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="22" letterSpacing="6" fill={DIM} opacity={seg(T, at('michael', 1), at('michael', 1, 0.5))}>KAHNWALD</text>
      <text x="790" y="468" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="22" letterSpacing="6" fill={DIM} opacity={seg(T, at('michael', 1), at('michael', 1, 0.5))}>NIELSEN</text>

      {/* il passaggio della grotta: colonna gialla tratteggiata a sinistra, «33 anni» tra un anno e l'altro */}
      {passage > 0 && (
        <path d={`M${PASS_X} ${Y[2019]} V${lerp(Y[2019], Y[1953], passage)}`} stroke={YELLOW} strokeWidth="9" strokeDasharray="20 14" strokeDashoffset={-T * 40} strokeLinecap="round" />
      )}
      <Cave T={T} t0={at('mikkel', 2)} y={Y[2019]} lit={0.4 + 0.6 * passage} />
      <Cave T={T} t0={at('trentatre', 1, 0.2)} y={Y[1986]} lit={0.8} />
      <Cave T={T} t0={at('trentatre', 1, 0.7)} y={Y[1953]} lit={0.8} />
      <text x={PASS_X} y={Y[2019] + 62} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="28" fill={YELLOW} opacity={seg(T, at('mikkel', 2, 0.3), at('mikkel', 2, 0.6))}>la grotta</text>
      {[0, 1].map((k) => (
        <Tag key={k} T={T} t0={at('trentatre', 3, 0.1 + k * 0.3)} x={PASS_X + 6} y={[(Y[2019] + Y[1986]) / 2 + 10, (Y[1986] + Y[1953]) / 2 + 10][k]} text="33 anni" size={22} />
      ))}
      {/* «nessun inizio»: il passaggio si chiude ad anello */}
      {ring > 0 && (
        <g>
          <path d={`M${PASS_X} ${Y[1953] - 40} C${PASS_X - 120} ${Y[1953] - 40} ${PASS_X - 120} ${Y[2019] + 60} ${PASS_X} ${Y[2019] + 60}`} fill="none" stroke={YELLOW} strokeWidth="9" pathLength={1} strokeDasharray={`${ring} 1`} />
          <Tag T={T} t0={at('inizio', 2, 0.8)} x={PASS_X - 92} y={(Y[1953] + Y[2019]) / 2} text="nessun inizio" size={26} rot={-90} />
        </g>
      )}

      {/* legami (sotto i nodi) */}
      <Link T={T} t0={at('winden', 3, 0.4)} a={[N.michael[0], N.michael[1] + 58]} b={[N.jonas[0], N.jonas[1] - 60]} label="padre" lx={52} arrow />
      <Link T={T} t0={at('mikkel', 0, 0.5)} a={[N.mikkel[0] + 58, N.mikkel[1]]} b={[N.scomparsi[0] - 56, N.scomparsi[1]]} dashed label="anche lui" ly={-20} size={28} />
      <Link T={T} t0={at('mikkel', 1, 0.6)} a={[N.martha[0] + 58, N.martha[1]]} b={[N.mikkel[0] - 58, N.mikkel[1]]} label="fratelli" ly={-22} size={28} />
      <Link T={T} t0={at('mikkel', 1, 1.4)} a={[N.jonas[0] + 58, N.jonas[1]]} b={[N.martha[0] - 58, N.martha[1]]} color="#E07060" dashed
        label={T < at('michael', 4) ? 'gli piace' : ''} ly={-22} size={28} />
      <Link T={T} t0={at('mikkel', 2, 0.3)} a={[N.mikkel[0], N.mikkel[1] + 60]} b={[PASS_X + 30, Y[2019] + 40]} c={[460, Y[2019] + 190]} color={YELLOW} label="sparito qui" ly={50} size={30} arrow
        fade={off('trentatre')} />
      {/* il colpo di scena: Mikkel torna nel 1986 e diventa Michael */}
      <Link T={T} t0={at('michael', 0, 0.2)} a={[N.mikkel[0], N.mikkel[1] - 60]} b={[N.michael[0] + 62, N.michael[1] - 6]} c={[760, Y.cresce - 60]} color={YELLOW} dashed w={7} flow label="torna nel 1986" ly={-26} arrow />
      <Link T={T} t0={at('michael', 1, 0.4)} a={[N.ines[0], N.ines[1] + 58]} b={[N.michael[0], N.michael[1] - 60]} label="adotta" lx={-60} arrow />
      <Tag T={T} t0={at('michael', 1, 1.0)} x={N.michael[0] + 150} y={N.michael[1] - 66} text="= Mikkel" size={28} />
      {/* l'anello rosso: Michael → Jonas → Martha → Mikkel → Michael */}
      {loop > 0 && (
        <path d={`M${N.michael[0]} ${N.michael[1]} L${N.jonas[0]} ${N.jonas[1]} L${N.martha[0]} ${N.martha[1]} L${N.mikkel[0]} ${N.mikkel[1]} Q${760} ${Y.cresce - 60} ${N.michael[0]} ${N.michael[1]}`}
          fill={RED} fillOpacity={0.1 * loop} stroke={RED} strokeWidth="10" strokeLinejoin="round" pathLength={1} strokeDasharray={`${loop} 1`} opacity=".85" />
      )}
      <Tag T={T} t0={at('michael', 4, 0.2)} x={(N.jonas[0] + N.martha[0]) / 2} y={N.jonas[1] - 40} text="zia!" bg={RED} fg="#FFFFFF" size={30} rot={-4} />

      {/* Noah, la sedia, i bambini rapiti */}
      <Link T={T} t0={at('noah', 3, 0.1)} a={[N.noah[0], N.noah[1] + 60]} b={[N.scomparsi[0], N.scomparsi[1] - 60]} color={RED} w={6} label="li rapisce" lx={-78} arrow />
      {/* lo straniero: vuole chiudere il passaggio; è Jonas adulto, dal futuro */}
      <Link T={T} t0={at('straniero', 2, 0.2)} a={[N.straniero[0] - 58, N.straniero[1]]} b={[PASS_X + 20, Y[2019] + 44]} c={[PASS_X + 10, N.straniero[1]]} color={YELLOW} w={6} label="chiudere!" lx={-20} ly={40} size={30} arrow fade={off('inizio')} />
      <Link T={T} t0={at('straniero', 3, 0.2)} a={[N.straniero[0], N.straniero[1] - 60]} b={[N.jonas[0], N.jonas[1] + 64]} color={YELLOW} dashed w={7} flow label="è lui, da adulto" lx={-120} ly={-6} size={30} arrow />
      {/* la scelta: Jonas va nel 1986; riportare Mikkel? no */}
      <Link T={T} t0={at('scelta', 0, 0.1)} a={[N.jonas[0] + 40, N.jonas[1] - 44]} b={[N.ines[0] + 120, N.ines[1] + 10]} c={[520, 760]} color={YELLOW} dashed w={6} flow label="va nel 1986" lx={-70} ly={50} size={28} arrow
        fade={off('scelta')} />
      <Link T={T} t0={at('scelta', 1, 0.2)} a={[N.michael[0] + 64, N.michael[1] + 20]} b={[N.mikkel[0] - 20, N.mikkel[1] - 64]} c={[640, 900]} color="#E07060" dashed w={6} label="a casa?" lx={30} ly={-10} size={28} arrow
        fade={off('scelta')} />
      {T >= at('scelta', 2, 0.1) && (
        <g transform={`translate(600 860) scale(${pop(T, at('scelta', 2, 0.1))})`} opacity={off('scelta')}>
          <path d="M-34 -34 L34 34 M34 -34 L-34 34" stroke={RED} strokeWidth="12" strokeLinecap="round" />
        </g>
      )}
      <Tag T={T} t0={at('scelta', 3, 0.3)} x={680} y={Y.cresce - 4} text="è già successo" bg={CHALK} size={28} rot={-2} until={end('scelta') - 0.4} />
      {/* la fine: Noah prende Jonas, la sedia lo manda nel 2052 */}
      <Link T={T} t0={at('fine', 0, 0.2)} a={[N.noah[0] - 60, N.noah[1] + 10]} b={[N.jonas[0] + 60, N.jonas[1] - 20]} c={[700, 560]} color={RED} w={6} label="catturato" lx={40} ly={-14} size={30} arrow />
      <Link T={T} t0={at('fine', 1, 0.1)} a={[N.jonas[0] + 50, N.jonas[1] + 40]} b={[N.rovine[0] - 62, N.rovine[1] - 6]} c={[560, 1160]} color={YELLOW} dashed w={7} flow label="2052" ly={-24} size={32} arrow />
      <Tag T={T} t0={at('inizio', 3, 0.1)} x={760} y={Y[1953] + 12} text="futuro → passato" bg={CHALK} size={24} rot={2} until={end('inizio') - 0.4} />
      <Tag T={T} t0={at('inizio', 3, 1.0)} x={760} y={Y[1953] + 62} text="passato → futuro" bg={CHALK} size={24} rot={-1} until={end('inizio') - 0.4} />

      {/* nodi */}
      <Node T={T} t0={at('winden', 1, 0.1)} p={N.scomparsi} name="scomparsi" r={46} ring={focus(at('winden', 1), at('winden', 2)) + focus(at('noah', 3), at('straniero', 0))}><MissingIcon /></Node>
      <Node T={T} t0={at('winden', 2, 0.1)} p={N.jonas} name="Jonas" ring={focus(at('winden', 2), at('winden', 3, 1)) + focus(at('fine', 0), at('fine', 2))} fade={1 - 0.8 * noJonas} side="below">
        <g transform="translate(0 -40)"><Raincoat id="al-rc" t={T} scale={0.22} wind={0.3} wet={false} /></g>
      </Node>
      <Node T={T} t0={at('winden', 3, 0.1)} p={N.michael} name="Michael" sub={T < at('michael', 2) ? 'padre di Jonas' : 'cresciuto nel 1986'} side="right"
        ring={focus(at('winden', 3), at('mikkel', 0)) + focus(at('michael', 1), at('michael', 4, 1))}>
        <Letter scale={0.24} open={lettera} />
      </Node>
      <Node T={T} t0={at('mikkel', 0, 0.1)} p={N.mikkel} name="Mikkel" sub="10 anni" ring={focus(at('mikkel', 0), at('mikkel', 3, 1)) + focus(at('michael', 0), at('michael', 1))}><Cards fan={0.4} scale={0.38} /></Node>
      <Node T={T} t0={at('mikkel', 1, 0.5)} p={N.martha} name="Martha" ring={focus(at('michael', 4), at('noah', 0))}><Yarn r={28} /></Node>
      <Node T={T} t0={at('michael', 1, 0.1)} p={N.ines} name="Ines" sub="infermiera" side="right"><CapIcon /></Node>
      <Node T={T} t0={at('noah', 0, 0.1)} p={N.noah} name="Noah" sub="la sedia del bunker" side="left" ring={focus(at('noah', 0), at('noah', 3, 1.2))}>
        <g transform="translate(0 -6)"><Collar scale={0.5} /></g>
        <g transform="translate(0 20)" opacity={seg(T, at('noah', 2), at('noah', 2, 0.3))}><ChairIcon T={T} on={seg(T, at('noah', 2), at('noah', 2, 0.3))} /></g>
      </Node>
      <Node T={T} t0={at('straniero', 0, 0.1)} p={N.straniero} name="lo straniero" sub="viene dal futuro" side="right" ring={focus(at('straniero', 0), at('straniero', 3, 1.2)) + focus(at('inizio', 0), at('inizio', 1, 0.5))}>
        <g transform="translate(0 30)"><Device id="al-dev" t={T} on={device} scale={0.3} /></g>
      </Node>
      <Node T={T} t0={at('straniero', 1, 0.2)} p={[N.straniero[0] + 92, N.straniero[1] - 56]} name="" r={30}><PocketWatch t={T} scale={0.28} /></Node>
      <text x={N.straniero[0] + 132} y={N.straniero[1] - 64} fontFamily={HAND} fontWeight={700} fontSize="26" fill="#D8D2C0" opacity={seg(T, at('straniero', 1, 0.5), at('straniero', 1, 0.9)) * off('straniero')}>apparecchio di Tannhaus</text>
      <Node T={T} t0={at('fine', 2, 0.1)} p={N.rovine} name="Winden distrutta" side="right" ring={focus(at('fine', 1, 0.5), at('fine', 3))}><RuinIcon T={T} /></Node>
      {T >= at('fine', 1, 0.6) && (
        <g transform={`translate(${N.rovine[0] - 70} ${N.rovine[1] + 40}) rotate(-70) scale(${pop(T, at('fine', 1, 0.6))})`}><Raincoat id="al-rc52" t={0} scale={0.14} wind={0} wet={false} /></g>
      )}
    </g>
  );
};

export const makeAlbero = (chapterId: string): React.FC<SceneProps> => {
  const Scene: React.FC<SceneProps> = ({ t }) => {
    const T = STARTS[chapterId] + t;
    const c = camAt(T);
    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="al" />
          <radialGradient id="al-bg" cx=".5" cy=".44" r=".75">
            <stop offset="0" stopColor="#22302B" />
            <stop offset=".6" stopColor="#141B18" />
            <stop offset="1" stopColor="#080B0A" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#al-bg)" />
        {/* quadrante d'orologio appena visibile che gira dietro l'albero: il tempo che torna */}
        <g transform={`translate(540 860) rotate(${T * 3})`} opacity=".12">
          <circle r="520" fill="none" stroke={CHALK} strokeWidth="3" />
          <circle r="480" fill="none" stroke={CHALK} strokeWidth="1.5" strokeDasharray="2 16" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -520 V-490" stroke={CHALK} strokeWidth={i % 3 ? 3 : 7} transform={`rotate(${i * 30})`} />)}
        </g>
        <g transform={`translate(540 860) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
          <Tree T={T} />
        </g>
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={CHALK} opacity={0.12 + 0.08 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Finish id="al" tint={TINT} tintOpacity={0.08} />
      </svg>
    );
  };
  return Scene;
};
