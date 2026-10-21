import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { HAND, STENCIL } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/dark-stagione-1.json';
import { Cards, K, Letter, Pines, Raincoat, TINT, Tower, YELLOW, Yarn } from './Winden';

// Dark, stagione 1 come schema (formato "spiegato"): un'unica parete delle indagini, come quelle della serie, che si
// riempie capitolo dopo capitolo. Fasce orizzontali per gli anni (1953 in alto, 1986, 2019, 2052 in basso), foto
// appese con le puntine che mostrano gli oggetti dei personaggi (mai figure), fili rossi per i legami, linea gialla
// tratteggiata per il passaggio nel tempo. La camera si sposta sulla parte di cui parla la voce; alla fine si allarga.
// Ogni capitolo è la stessa parete in un altro momento: un elemento compare quando la voce arriva alla sua frase.
// Coordinate della parete: 1600 × 2600. Luce di una lampada che segue la camera, pulviscolo, grana e vignettatura.

const W = 1900, H = 2500;
const ROWS = [
  { year: 1953, y0: 250, y1: 700 },
  { year: 1986, y0: 700, y1: 1250 },
  { year: 2019, y0: 1250, y1: 2050 },
  { year: 2052, y0: 2050, y1: 2460 },
];
const CAVE_X = 300;
const RED = '#C23A30';
const CHALK = '#ECE8DC';

// ---------------------------------------------------------------- tempi: secondo assoluto di una frase del JSON

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
/** Istante assoluto (s dall'inizio del video) della frase `cue` del capitolo `ch`, più `d` secondi. */
const at = (ch: string, cue: number, d = 0) => STARTS[ch] + CUES[ch][cue] + d;

// ---------------------------------------------------------------- camera: inquadrature per capitolo

type Shot = { at: number; x: number; y: number; z: number };
/** Inquadrature in secondi assoluti: il punto (x, y) della parete va al centro dello schermo (540, 900), zoom z. */
const SHOTS: Shot[] = [
  { at: at('winden', 0), x: 1640, y: 1480, z: 1.1 },
  { at: at('winden', 1), x: 640, y: 1880, z: 1.1 },
  { at: at('winden', 2), x: 1260, y: 1540, z: 1.15 },
  { at: at('winden', 3), x: 1220, y: 1720, z: 0.9 },
  { at: at('mikkel', 0), x: 640, y: 1540, z: 1.1 },
  { at: at('mikkel', 1), x: 1000, y: 1620, z: 0.6 },
  { at: at('mikkel', 2), x: 470, y: 1560, z: 0.95 },
  { at: at('mikkel', 3), x: 450, y: 1330, z: 0.8 },
  { at: at('trentatre', 0), x: 360, y: 1350, z: 0.85 },
  { at: at('trentatre', 1), x: 640, y: 1040, z: 0.46 },
  { at: at('trentatre', 3), x: 470, y: 930, z: 0.55 },
];
const camAt = (T: number) => {
  let cur = SHOTS[0];
  let out = { x: cur.x, y: cur.y, z: cur.z };
  for (let i = 1; i < SHOTS.length; i++) {
    const s = SHOTS[i];
    const p = eio(seg(T, s.at - 0.2, s.at + 1.0));
    out = { x: lerp(out.x, s.x, p), y: lerp(out.y, s.y, p), z: lerp(out.z, s.z, p) };
    cur = s;
  }
  // leggero respiro della camera
  return { x: out.x + Math.sin(T * 0.3) * 12, y: out.y + Math.cos(T * 0.25) * 8, z: out.z * (1 + 0.01 * Math.sin(T * 0.4)) };
};

// ---------------------------------------------------------------- elementi della parete

const pop = (T: number, t0: number) => eob(seg(T, t0, t0 + 0.45), 1.6);
const show = (T: number, t0: number) => seg(T, t0, t0 + 0.2);

/** Puntina rossa. */
const Pin: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <ellipse cx={x + 4} cy={y + 8} rx="12" ry="6" fill="#000" opacity=".35" />
    <circle cx={x} cy={y} r="13" fill="#D8463A" stroke={K} strokeWidth="3" />
    <circle cx={x - 4} cy={y - 4} r="4" fill="#FFB0A0" />
  </g>
);

/** Foto appesa (polaroid) con un oggetto dentro e una scritta a mano sotto. */
const Photo: React.FC<{ T: number; t0: number; x: number; y: number; w?: number; h?: number; rot?: number; label?: string; dark?: string; children?: React.ReactNode; glow?: number }> = ({
  T, t0, x, y, w = 260, h = 300, rot = 0, label, dark = '#1E2622', children, glow = 0,
}) => {
  const p = pop(T, t0);
  if (T < t0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${p})`} opacity={show(T, t0)}>
      {glow > 0 && <Glow id={`pw-g${x}${y}`} x={0} y={0} r={w} t={T} color={YELLOW} amp={0.08} rate={2.4} opacity={0.35 * glow} />}
      <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} fill="#000" opacity=".4" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#EEEAE0" stroke={K} strokeWidth="4" />
      <rect x={-w / 2 + 16} y={-h / 2 + 16} width={w - 32} height={h - 90} fill={dark} />
      <g transform={`translate(0 ${-35})`}>{children}</g>
      {label && <text x="0" y={h / 2 - 24} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="44" fill="#2A2620">{label}</text>}
      <Pin x={0} y={-h / 2 + 8} />
    </g>
  );
};

/** Bigliettino di carta con testo a mano. */
const Note: React.FC<{ T: number; t0: number; x: number; y: number; text: string; rot?: number; size?: number; color?: string; paper?: string }> = ({ T, t0, x, y, text, rot = 0, size = 40, color = '#2A2620', paper = '#E9DFA8' }) => {
  if (T < t0) return null;
  const p = pop(T, t0);
  const w = text.length * size * 0.42 + 40;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${p})`} opacity={show(T, t0)}>
      <rect x={-w / 2 + 6} y={-size * 0.75 + 8} width={w} height={size * 1.5} fill="#000" opacity=".35" />
      <rect x={-w / 2} y={-size * 0.75} width={w} height={size * 1.5} fill={paper} stroke={K} strokeWidth="3" />
      <text x="0" y={size * 0.3} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={size} fill={color}>{text}</text>
      <Pin x={0} y={-size * 0.75 + 4} />
    </g>
  );
};

/** Filo tra due punti, con un po' di pancia, che si tende in 0,6 s; scritta a gesso a metà. */
const Thread: React.FC<{ T: number; t0: number; a: [number, number]; b: [number, number]; color?: string; dashed?: boolean; label?: string; sag?: number; width?: number; arrow?: boolean; lx?: number; ly?: number }> = ({
  T, t0, a, b, color = RED, dashed = false, label, sag = 40, width = 6, arrow = false, lx = 0, ly = 0,
}) => {
  if (T < t0) return null;
  const p = eo(seg(T, t0, t0 + 0.6));
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + sag;
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  // punta della freccia orientata sull'ultimo tratto
  const ang = (Math.atan2(b[1] - my, b[0] - mx) * 180) / Math.PI;
  return (
    <g>
      <path d={d} fill="none" stroke="#000" strokeOpacity=".35" strokeWidth={width} transform="translate(4 8)" pathLength={1} strokeDasharray={`${p} 1`} />
      {dashed ? (
        <g>
          <mask id={`th-m${a[0]}${a[1]}${b[0]}${b[1]}`}><path d={d} fill="none" stroke="#fff" strokeWidth={width + 4} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
          <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray="22 16" strokeLinecap="round" mask={`url(#th-m${a[0]}${a[1]}${b[0]}${b[1]})`} />
        </g>
      ) : (
        <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
      )}
      {arrow && p > 0.95 && <path d="M-26 -16 L0 0 L-26 16" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`} />}
      {label && (
        <text x={(a[0] + b[0]) / 2 + lx} y={(a[1] + b[1]) / 2 + sag * 0.5 - 18 + ly} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="50" fill={color === RED ? '#FF9A8A' : color} opacity={seg(T, t0 + 0.4, t0 + 0.8)}>{label}</text>
      )}
    </g>
  );
};

/** Ingresso della grotta (dentro una foto). */
const CaveIcon: React.FC<{ T: number; lit?: number }> = ({ T, lit = 0.5 }) => (
  <g>
    <path d="M-110 70 Q-100 -40 -20 -70 Q60 -80 110 70 Z" fill="#3A443E" stroke={K} strokeWidth="5" />
    <path d="M-40 70 Q-40 -10 0 -16 Q40 -10 40 70 Z" fill="#0A0C0B" />
    <ellipse cx="0" cy="40" rx="30" ry="34" fill="#FFD99A" opacity={lit * (0.7 + 0.3 * Math.sin(T * 3))} />
    <path d="M-80 70 V20 M80 70 V20 M-80 30 H80" stroke="#9AA8A0" strokeWidth="3" opacity=".7" />
  </g>
);

/** Manifesto dei bambini scomparsi (dentro una foto). */
const MissingIcon: React.FC = () => (
  <g>
    <rect x="-70" y="-90" width="140" height="170" fill="#D8D2C0" />
    <text x="0" y="-60" textAnchor="middle" fontFamily={STENCIL} fontWeight={800} fontSize="26" fill={RED}>SCOMPARSI</text>
    <text x="-30" y="30" textAnchor="middle" fontFamily={STENCIL} fontWeight={800} fontSize="80" fill="#4A4438">?</text>
    <text x="30" y="50" textAnchor="middle" fontFamily={STENCIL} fontWeight={800} fontSize="60" fill="#4A4438">?</text>
  </g>
);

// ---------------------------------------------------------------- la parete intera al tempo T

const r = rng(1953);
const SPOTS = Array.from({ length: 60 }, () => ({ x: r() * W, y: r() * H, rr: 20 + r() * 90, o: 0.03 + r() * 0.05 }));
const MOTES = Array.from({ length: 26 }, () => ({ x: r() * 1080, y: r() * 1920, s: 2 + r() * 3, v: 6 + r() * 14, ph: r() * 6 }));

const Wall: React.FC<{ T: number }> = ({ T }) => {
  // fasce degli anni: compaiono quando il racconto ci arriva
  const rowAt: Record<number, number> = { 2019: at('winden', 0), 1986: at('trentatre', 2, 0.4), 1953: at('trentatre', 2, 1.1), 2052: 1e9 };
  const passage = eo(seg(T, at('trentatre', 0, 0.2), at('trentatre', 0, 1.6)));
  const caveUp = (k: number) => at('trentatre', 1, 0.3 + k * 0.5);
  const minus = at('trentatre', 3, 0.2);
  return (
    <g>
      {/* intonaco scuro con macchie */}
      <rect x={-1200} y={-1200} width={W + 2400} height={H + 2400} fill="url(#pw-wall)" />
      {SPOTS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.rr} fill={i % 3 ? '#000' : '#4A5A50'} opacity={s.o} />)}

      {/* fasce degli anni: spago orizzontale e nastro di carta con l'anno */}
      {ROWS.map((row) => {
        const t0 = rowAt[row.year];
        const on = seg(T, t0, t0 + 0.6);
        return (
          <g key={row.year}>
            <rect x={-1200} y={row.y0} width={W + 2400} height={row.y1 - row.y0} fill="#000" opacity={0.25 * (1 - on)} />
            <path d={`M20 ${row.y0} H${20 + (W - 40) * eo(on)}`} stroke="#B8B09A" strokeWidth="4" opacity=".6" />
            {T >= t0 && (
              <g transform={`translate(110 ${row.y0 + 70}) rotate(-4) scale(${pop(T, t0)})`}>
                <rect x="-95" y="-40" width="190" height="80" fill="#D8CFA8" opacity=".95" />
                <text x="0" y="24" textAnchor="middle" fontFamily={STENCIL} fontWeight={800} fontSize="66" fill="#1A1A16">{row.year}</text>
              </g>
            )}
          </g>
        );
      })}

      {/* in alto: Winden con la centrale */}
      <Photo T={T} t0={at('winden', 0, 0.1)} x={1650} y={1560} w={420} h={300} rot={-1.5} label="Winden · la centrale" dark="#26342E">
        <g transform="translate(0 80)">
          <Pines t={T} y={0} n={7} h={110} seed={5} color="#14201B" x0={-170} x1={170} sway={1} />
          <g transform="translate(60 0)"><Tower id="pw-t1" t={T} w={90} h={130} fill="#7E8A84" steamOpacity={0.55} /></g>
          <g transform="translate(140 0)"><Tower id="pw-t2" t={T + 2} w={70} h={100} fill="#6E7A74" steamOpacity={0.5} /></g>
        </g>
      </Photo>

      {/* il passaggio: linea gialla che sale dalla grotta del 2019 */}
      {passage > 0 && (
        <g>
          <path d={`M${CAVE_X} 1600 V${lerp(1600, 470, passage)}`} stroke="#000" strokeOpacity=".35" strokeWidth="16" transform="translate(5 8)" />
          <path d={`M${CAVE_X} 1600 V${lerp(1600, 470, passage)}`} stroke={YELLOW} strokeWidth="16" strokeDasharray="34 22" strokeDashoffset={-T * 60} strokeLinecap="round" />
          <Glow id="pw-pass" x={CAVE_X} y={lerp(1600, 470, passage)} r={140} t={T} color={YELLOW} amp={0.15} rate={5} opacity={0.6 * (1 - seg(T, at('trentatre', 2), at('trentatre', 3)))} />
        </g>
      )}
      {[0, 1].map((k) => T >= minus + k * 0.3 && (
        <g key={k} transform={`translate(${CAVE_X + 130} ${[1250, 720][k]}) scale(${pop(T, minus + k * 0.3)})`}>
          <rect x="-90" y="-38" width="180" height="76" rx="38" fill="#14140F" stroke={YELLOW} strokeWidth="5" />
          <text y="16" textAnchor="middle" fontFamily={STENCIL} fontWeight={800} fontSize="46" fill={YELLOW}>−33 anni</text>
        </g>
      ))}

      {/* 2019: grotta, Jonas, Michael, Martha, Mikkel, i bambini scomparsi */}
      <Photo T={T} t0={at('mikkel', 2)} x={CAVE_X} y={1600} w={280} h={300} rot={2} label="la grotta" glow={1 - seg(T, at('trentatre', 1), at('trentatre', 2))}>
        <CaveIcon T={T} lit={0.4 + 0.6 * passage} />
      </Photo>
      <Photo T={T} t0={at('trentatre', 1, 0.3)} x={CAVE_X} y={980} w={260} h={280} rot={-2} label="la grotta" dark="#26302A"><g transform="scale(.9)"><CaveIcon T={T + 1} lit={0.8} /></g></Photo>
      <Photo T={T} t0={caveUp(1)} x={CAVE_X} y={470} w={260} h={280} rot={3} label="la grotta" dark="#2A2A22"><g transform="scale(.9)"><CaveIcon T={T + 2} lit={0.8} /></g></Photo>

      <Photo T={T} t0={at('winden', 1, 0.1)} x={640} y={1890} w={260} h={300} rot={4} label="scomparsi" dark="#2A2620"><MissingIcon /></Photo>

      <Photo T={T} t0={at('winden', 2, 0.1)} x={1260} y={1500} w={270} h={320} rot={-3} label="Jonas" glow={seg(T, at('winden', 2), at('winden', 2, 0.5)) * (1 - seg(T, at('winden', 3, 1), at('winden', 3, 2)))}>
        <g transform="translate(0 -70)"><Raincoat id="pw-rc" t={T} scale={0.42} wind={0.3} wet={false} /></g>
      </Photo>
      <Photo T={T} t0={at('winden', 3, 0.1)} x={1260} y={1900} w={270} h={250} rot={2} label="Michael" dark="#3A3228">
        <g transform="translate(0 10)"><Letter scale={0.5} /></g>
      </Photo>
      <Thread T={T} t0={at('winden', 3, 0.6)} a={[1260, 1780]} b={[1260, 1670]} sag={0} label="padre" lx={-100} ly={30} arrow />

      <Photo T={T} t0={at('mikkel', 0, 0.1)} x={640} y={1500} w={260} h={300} rot={3} label="Mikkel" dark="#22304A">
        <Cards fan={0.4} scale={0.62} />
      </Photo>
      <Thread T={T} t0={at('mikkel', 0, 0.6)} a={[640, 1660]} b={[640, 1735]} sag={0} width={7} />
      <Photo T={T} t0={at('mikkel', 1, 0.6)} x={950} y={1520} w={250} h={290} rot={-2} label="Martha" dark="#3A2422">
        <Yarn r={52} />
      </Photo>
      <Thread T={T} t0={at('mikkel', 1, 0.9)} a={[775, 1460]} b={[820, 1460]} sag={0} label="fratello" ly={-60} width={7} />
      <Thread T={T} t0={at('mikkel', 1, 1.6)} a={[1078, 1540]} b={[1122, 1540]} sag={0} label="le piace" ly={-140} width={7} />
      {/* Mikkel sparisce vicino alla grotta, poi «in un altro anno?» */}
      <Thread T={T} t0={at('mikkel', 2, 0.4)} a={[508, 1540]} b={[CAVE_X + 145, 1560]} sag={0} color={YELLOW} label="sparito qui" ly={-40} arrow width={8} />
      <g opacity={1 - passage}>
        <Thread T={T} t0={at('mikkel', 3, 0.3)} a={[CAVE_X, 1440]} b={[CAVE_X + 30, 1150]} sag={0} color={YELLOW} dashed width={10} arrow />
        <Note T={T} t0={at('mikkel', 3, 0.8)} x={CAVE_X + 300} y={1170} text="un altro anno?" rot={-4} size={46} />
      </g>
    </g>
  );
};

export const makeParete = (chapterId: string): React.FC<SceneProps> => {
  const Scene: React.FC<SceneProps> = ({ t }) => {
    const T = STARTS[chapterId] + t;
    const c = camAt(T);
    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="pw" />
          <Lin id="pw-wall" stops={[[0, '#1C2420'], [0.5, '#232C27'], [1, '#1A201C']]} />
          <radialGradient id="pw-lamp" cx=".5" cy=".46" r=".6">
            <stop offset="0" stopColor="#FFE8B8" stopOpacity=".22" />
            <stop offset=".5" stopColor="#FFE8B8" stopOpacity=".08" />
            <stop offset="1" stopColor="#000" stopOpacity=".35" />
          </radialGradient>
        </defs>
        <g transform={`translate(540 940) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
          <Wall T={T} />
        </g>
        {/* luce della lampada che segue lo sguardo, pulviscolo nella luce */}
        <rect width="1080" height="1920" fill="url(#pw-lamp)" />
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 40 - c.x * 0.05, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={CHALK} opacity={0.18 + 0.12 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Finish id="pw" tint={TINT} tintOpacity={0.1} />
      </svg>
    );
  };
  return Scene;
};
