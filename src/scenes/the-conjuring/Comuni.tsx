import React from 'react';
import { rng } from '../../lib/anim';
import { Glow } from '../../lib/elements';

// Elementi comuni di The Conjuring (2013): la fattoria di legno del Rhode Island (assi orizzontali, portico, tetto a
// capanna), il grande albero nodoso davanti alla casa (l'albero della strega), gli orologi che si fermano alle 3:07,
// il carillon di legno, il cane generico, i corvi. Mai persone: i Perron, i Warren, Bathsheba e Rory si raccontano con
// oggetti, luci e tracce (impronte, coperte, corde, fumo). L'oro dell'accento (#F2B84B) solo sugli oggetti chiave: le
// lancette e i quadranti alle 3:07, il carillon, i lumi. Chi usa i materiali mette <ConjDefs id> nei <defs>.

export const K = '#0A0D10'; // contorni
export const GOLD = '#F2B84B'; // accento
export const MOON = '#C8D8E8';
export const TINT_NOTTE = '#1A2230';
export const TINT_GIORNO = '#C8925A';

/** Gradienti dei materiali comuni (una volta per scena, dentro <defs>). */
export const ConjDefs: React.FC<{ id: string }> = ({ id }) => (
  <>
    <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3A2618" /><stop offset=".45" stopColor="#6A4428" /><stop offset="1" stopColor="#2A1A10" /></linearGradient>
    <linearGradient id={`${id}-woodv`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5E3E24" /><stop offset="1" stopColor="#2A1A10" /></linearGradient>
    <linearGradient id={`${id}-oldwood`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4A4034" /><stop offset=".5" stopColor="#6E6250" /><stop offset="1" stopColor="#3A3228" /></linearGradient>
    <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6A4A1E" /><stop offset=".4" stopColor="#E8C878" /><stop offset=".6" stopColor="#B08838" /><stop offset="1" stopColor="#5A3E18" /></linearGradient>
    <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2EAD4" /><stop offset="1" stopColor="#D2C49E" /></linearGradient>
    <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".3" /><stop offset=".35" stopColor="#FFFFFF" stopOpacity="0" /><stop offset=".7" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="1" stopColor="#FFFFFF" stopOpacity=".12" /></linearGradient>
    <linearGradient id={`${id}-bark`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3A3430" /><stop offset=".35" stopColor="#5A524A" /><stop offset=".7" stopColor="#2E2A26" /><stop offset="1" stopColor="#1A1816" /></linearGradient>
    <radialGradient id={`${id}-shadow`}><stop offset="0" stopColor="#000" stopOpacity=".55" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
    <radialGradient id={`${id}-flame`} cx=".5" cy=".7" r=".6"><stop offset="0" stopColor="#FFFBE8" /><stop offset=".45" stopColor="#FFD878" /><stop offset="1" stopColor={GOLD} /></radialGradient>
  </>
);

/** Ombra morbida a terra sotto un oggetto. */
export const Ombra: React.FC<{ id: string; x: number; y: number; rx: number; ry?: number; opacity?: number }> = ({ id, x, y, rx, ry = rx * 0.18, opacity = 1 }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id}-shadow)`} opacity={opacity} />
);

// ---------------------------------------------------------------- la fattoria

/**
 * La fattoria dei Perron: due piani di assi orizzontali grigio-bianche, tetto a capanna scuro con il comignolo, portico
 * con le colonne e i gradini, cinque finestre più l'abbaino. Origine al centro della base (a terra), larghezza ~700 a s=1.
 * `lit[i]` 0..1 accende la finestra i (0–1 piano terra ai lati della porta, 2–4 primo piano, 5 abbaino); `door` 0..1 la
 * apre sul buio; `side` = luce dal lato sinistro (tramonto) o dalla luna.
 */
export const Fattoria: React.FC<{
  id: string; x: number; y: number; s?: number; t: number; lit?: number[]; door?: number; warm?: string; wall?: [string, string]; night?: number;
}> = ({ id, x, y, s = 1, t, lit = [], door = 0, warm = '#FFC870', wall = ['#B8B2A4', '#7A766C'], night = 0 }) => {
  const win = (wx: number, wy: number, i: number, w = 78, h = 120) => {
    const on = lit[i] ?? 0;
    return (
      <g key={i}>
        <rect x={wx - w / 2 - 12} y={wy - 10} width={w + 24} height={h + 20} fill="#E8E2D2" stroke={K} strokeWidth="5" />
        <rect x={wx - w / 2} y={wy} width={w} height={h} fill={night ? '#141A22' : '#2A3038'} />
        {on > 0 && <rect x={wx - w / 2} y={wy} width={w} height={h} fill={warm} opacity={on} />}
        {on > 0 && <rect x={wx - w / 2} y={wy + h * 0.55} width={w} height={h * 0.45} fill="#FFE8B0" opacity={on * 0.6} />}
        <path d={`M${wx} ${wy} V${wy + h} M${wx - w / 2} ${wy + h / 2} H${wx + w / 2}`} stroke={K} strokeWidth="6" />
        <rect x={wx - w / 2} y={wy} width={w} height={h} fill={`url(#${id}-glass)`} />
        <path d={`M${wx - w / 2 - 18} ${wy + h + 12} H${wx + w / 2 + 18}`} stroke={K} strokeWidth="8" />
        {/* persiane scure */}
        <rect x={wx - w / 2 - 40} y={wy - 6} width={24} height={h + 12} fill="#2E3A3A" stroke={K} strokeWidth="4" />
        <rect x={wx + w / 2 + 16} y={wy - 6} width={24} height={h + 12} fill="#2E3A3A" stroke={K} strokeWidth="4" />
      </g>
    );
  };
  const glowOn = lit.reduce((a, b) => a + b, 0);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={wall[0]} /><stop offset=".7" stopColor={wall[1]} /><stop offset="1" stopColor={wall[1]} /></linearGradient>
        <linearGradient id={`${id}-roof`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A2E34" /><stop offset="1" stopColor="#14171B" /></linearGradient>
      </defs>
      <Ombra id={id} x={0} y={8} rx={460} ry={34} />
      {/* ala laterale bassa */}
      <path d="M200 -330 H420 V0 H200 Z" fill={`url(#${id}-wall)`} stroke={K} strokeWidth="8" />
      <path d="M180 -330 L310 -430 L440 -330 Z" fill={`url(#${id}-roof)`} stroke={K} strokeWidth="8" />
      {win(330, -260, 6, 64, 100)}
      {/* corpo principale */}
      <path d="M-330 -560 H230 V0 H-330 Z" fill={`url(#${id}-wall)`} stroke={K} strokeWidth="9" />
      {Array.from({ length: 22 }, (_, i) => (
        <path key={i} d={`M-326 ${-540 + i * 25} H226`} stroke="#000" strokeWidth="2.5" opacity=".18" />
      ))}
      {/* tetto a capanna con il comignolo */}
      <path d="M150 -880 H210 V-600 H150 Z" fill="#5A3A2E" stroke={K} strokeWidth="7" />
      <path d="M140 -880 H220" stroke={K} strokeWidth="12" />
      <path d="M-370 -560 L-50 -860 L270 -560 Z" fill={`url(#${id}-roof)`} stroke={K} strokeWidth="9" />
      <path d="M-50 -860 L270 -560" stroke="#8A96A6" strokeWidth="4" opacity={0.25 + night * 0.25} />
      {/* abbaino */}
      {win(-50, -720, 5, 70, 90)}
      {/* finestre */}
      {win(-210, -470, 2)}
      {win(-50, -470, 3)}
      {win(110, -470, 4)}
      {win(-210, -230, 0)}
      {win(110, -230, 1)}
      {/* porta */}
      <rect x={-100} y={-250} width={100} height={210} fill="#050607" stroke={K} strokeWidth="6" />
      <g transform={`translate(-100 -250) scale(${1 - door * 0.75} 1)`}>
        <rect x={0} y={0} width={100} height={210} fill="#5A2A22" stroke={K} strokeWidth="6" />
        <rect x={14} y={16} width={72} height={70} fill="none" stroke={K} strokeWidth="4" opacity=".6" />
        <rect x={14} y={110} width={72} height={80} fill="none" stroke={K} strokeWidth="4" opacity=".6" />
        <circle cx={82} cy={110} r={6} fill="#C8A85A" />
      </g>
      {/* portico: tetto, colonne, gradini */}
      <path d="M-340 -300 H240 L210 -270 H-310 Z" fill="#3A3E44" stroke={K} strokeWidth="7" />
      {[-300, -150, 60, 200].map((cx) => (
        <rect key={cx} x={cx - 10} y={-272} width={20} height={240} fill="#D8D2C2" stroke={K} strokeWidth="5" />
      ))}
      <path d="M-330 -60 H230 V-30 H-330 Z" fill="#6A6458" stroke={K} strokeWidth="6" />
      <path d="M-130 -30 H30 V-14 H-130 Z M-150 -14 H50 V0 H-150 Z" fill="#7A7468" stroke={K} strokeWidth="5" />
      {/* ringhiera del portico */}
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M${-320 + i * 16} -60 V-130`} stroke="#C8C2B2" strokeWidth="5" opacity={i < 12 ? 1 : 0} />
      ))}
      <path d="M-330 -130 H-130 M50 -130 H230" stroke="#C8C2B2" strokeWidth="8" />
      {[70, 90, 110, 130, 150, 170, 190, 210].map((xx) => <path key={xx} d={`M${xx} -60 V-130`} stroke="#C8C2B2" strokeWidth="5" />)}
      {glowOn > 0 && <Glow id={`${id}-hw`} x={-50} y={-360} r={420} t={t} color={warm} amp={0.04} rate={3} opacity={Math.min(0.5, 0.18 * glowOn)} />}
    </g>
  );
};

// ---------------------------------------------------------------- l'albero della strega

type Ramo = { d: string; w: number; depth: number };
const rami = (seed: number, depth: number, len: number, w0: number) => {
  const r = rng(seed);
  const out: Ramo[] = [];
  const grow = (x: number, y: number, a: number, l: number, w: number, d: number) => {
    // ramo curvo: due segmenti con una piega nodosa
    const a1 = a + (r() - 0.5) * 0.5;
    const mx = x + Math.cos(a1) * l * 0.55;
    const my = y + Math.sin(a1) * l * 0.55;
    const a2 = a1 + (r() - 0.5) * 0.7;
    const ex = mx + Math.cos(a2) * l * 0.5;
    const ey = my + Math.sin(a2) * l * 0.5;
    out.push({ d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, w, depth: d });
    if (d <= 0) return;
    const n = d > 2 ? 2 : 2 + (r() > 0.5 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const spread = (i - (n - 1) / 2) * (0.75 + r() * 0.35);
      grow(ex, ey, a2 + spread, l * (0.62 + r() * 0.12), w * 0.62, d - 1);
    }
  };
  // tre rami principali che partono dal tronco
  grow(0, -520, -Math.PI / 2 - 0.85, len, w0, depth);
  grow(0, -560, -Math.PI / 2 + 0.75, len * 1.05, w0, depth);
  grow(0, -600, -Math.PI / 2 - 0.1, len * 0.85, w0 * 0.9, depth);
  return out;
};
const RAMI_CACHE: Record<number, Ramo[]> = {};
const ramiDi = (depth: number) => (RAMI_CACHE[depth] ??= rami(3071863, depth, 330, 54));

/**
 * Il grande albero nodoso e spoglio davanti alla fattoria (l'albero della strega): tronco largo con le radici che escono
 * dalla terra, tre rami principali che si dividono fino ai rametti come dita. Origine alla base del tronco, alto ~1150 a s=1.
 * `sway` fa ondeggiare i rametti nel vento; `rim` = colore del bordo illuminato (luna o tramonto) sul lato sinistro.
 */
export const Albero: React.FC<{ id: string; x: number; y: number; s?: number; t: number; sway?: number; rim?: string; fill?: string; rope?: number; reach?: number; depth?: number }> = ({
  id, x, y, s = 1, t, sway = 1, rim = MOON, fill, rope = 0, reach = 1, depth = 4,
}) => {
  const RAMI = ramiDi(depth);
  const tronco = 'M-70 0 Q-60 -200 -50 -330 Q-46 -460 -30 -560 L30 -560 Q46 -470 56 -330 Q66 -180 90 0 Z';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinecap="round" strokeLinejoin="round">
      <Ombra id={id} x={0} y={6} rx={300} ry={30} />
      {/* rami: prima i contorni, poi il legno, con l'oscillazione che cresce verso le punte */}
      {[0, 1].map((pass) => (
        <g key={pass} transform={`translate(0 -560) scale(${reach} 1) translate(0 560)`}>
          {RAMI.map((b, i) => {
            const k = (depth - b.depth) * 0.5 * sway;
            const rot = Math.sin(t * 0.9 + i * 0.37) * k;
            return (
              <path key={i} d={b.d} transform={`rotate(${rot.toFixed(2)} 0 -560)`} stroke={pass ? fill ?? `url(#${id}-bark)` : K}
                strokeWidth={pass ? Math.max(2, b.w) : Math.max(2, b.w) + 10} fill="none" />
            );
          })}
        </g>
      ))}
      {/* tronco e radici */}
      <path d={tronco} fill={fill ?? `url(#${id}-bark)`} stroke={K} strokeWidth="10" />
      <path d="M-70 -10 Q-160 -10 -240 30 M80 -10 Q170 -4 250 36 M-20 0 Q-40 30 -90 60 M40 0 Q70 34 130 62" stroke={K} strokeWidth="34" fill="none" />
      <path d="M-70 -10 Q-160 -10 -240 30 M80 -10 Q170 -4 250 36 M-20 0 Q-40 30 -90 60 M40 0 Q70 34 130 62" stroke={fill ?? '#3E3832'} strokeWidth="22" fill="none" />
      {/* nodi e crepe della corteccia */}
      <path d="M-30 -120 Q-10 -180 -24 -260 M20 -300 Q34 -360 16 -430 M-6 -60 Q4 -90 -2 -110" stroke="#000" strokeWidth="5" fill="none" opacity=".45" />
      <ellipse cx="14" cy="-220" rx="14" ry="22" fill="#14120F" stroke={K} strokeWidth="5" />
      <path d="M-50 -330 Q-46 -460 -30 -560" stroke={rim} strokeWidth="5" fill="none" opacity=".45" />
      {rope > 0 && (
        // un pezzo di corda sfilacciata su un ramo basso, che dondola
        <g transform={`translate(-250 -660) rotate(${Math.sin(t * 1.3) * 6 * rope})`}>
          <path d="M0 0 Q4 60 -2 120" stroke="#8A7A5A" strokeWidth="9" fill="none" />
          <path d="M-2 120 l-8 22 M-2 120 l2 26 M-2 120 l10 20" stroke="#8A7A5A" strokeWidth="4" />
          <path d="M-14 -4 H14" stroke="#6A5A3A" strokeWidth="12" />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- gli orologi

/** Ora mostrata da un orologio che corre veloce e poi si ferma alle 3:07: `p` 0..1 = avanzamento fino allo stop. */
export const oraVerso307 = (p: number, from = 1 + 50 / 60) => {
  const to = 3 + 7 / 60;
  const e = 1 - (1 - Math.min(1, Math.max(0, p))) ** 2;
  return from + (to - from) * e; // ore decimali
};

/**
 * Quadrante d'orologio (pendola, sveglia, orologio da muro): cerchio con le tacche, numeri romani facoltativi e lancette
 * all'ora decimale `h`. `stopped` 0..1 accende di oro le lancette ferme alle 3:07 (l'accento del film).
 */
export const Quadrante: React.FC<{ id: string; x: number; y: number; r: number; h: number; stopped?: number; face?: string; rim?: string; roman?: boolean; crack?: boolean }> = ({
  id, x, y, r, h, stopped = 0, face = '#EDE4CC', rim = `url(#${id}-brass)`, roman = false, crack = false,
}) => {
  const mA = ((h % 1) * 360) - 90;
  const hA = ((h % 12) / 12) * 360 - 90;
  const hand = (a: number, l: number, w: number) => {
    const rad = (a * Math.PI) / 180;
    return <path d={`M${-Math.cos(rad) * l * 0.15} ${-Math.sin(rad) * l * 0.15} L${Math.cos(rad) * l} ${Math.sin(rad) * l}`} strokeWidth={w} strokeLinecap="round" />;
  };
  const N = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  const col = stopped > 0.5 ? GOLD : '#1A1410';
  return (
    <g transform={`translate(${x} ${y})`}>
      {stopped > 0 && <Glow id={`${id}-q${Math.round(x)}`} x={0} y={0} r={r * 2.2} t={0} color={GOLD} amp={0} opacity={0.45 * stopped} />}
      <circle r={r + r * 0.12} fill={rim} stroke={K} strokeWidth={Math.max(4, r * 0.06)} />
      <circle r={r} fill={face} stroke={K} strokeWidth={Math.max(3, r * 0.03)} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return roman && r > 70 ? (
          <text key={i} x={Math.sin(a) * r * 0.78} y={-Math.cos(a) * r * 0.78 + r * 0.06} fontSize={r * 0.16} textAnchor="middle" fontFamily="serif" fill="#2A2018">{N[i]}</text>
        ) : (
          <path key={i} d={`M${Math.sin(a) * r * 0.82} ${-Math.cos(a) * r * 0.82} L${Math.sin(a) * r * 0.94} ${-Math.cos(a) * r * 0.94}`} stroke="#2A2018" strokeWidth={Math.max(2, r * 0.04)} />
        );
      })}
      <g stroke={col}>
        {hand(hA, r * 0.5, Math.max(4, r * 0.075))}
        {hand(mA, r * 0.78, Math.max(3, r * 0.05))}
      </g>
      <circle r={Math.max(3, r * 0.06)} fill={col} />
      {crack && <path d={`M${-r * 0.7} ${-r * 0.5} L${-r * 0.2} ${-r * 0.1} L${-r * 0.3} ${r * 0.3} M${-r * 0.2} ${-r * 0.1} L${r * 0.3} ${-r * 0.2}`} stroke="#FFFFFF" strokeWidth={Math.max(2, r * 0.02)} opacity=".7" fill="none" />}
      <circle r={r} fill={`url(#${id}-glass)`} />
    </g>
  );
};

// ---------------------------------------------------------------- il carillon

/**
 * Il carillon di legno trovato sotto l'albero: scatola con intarsi, coperchio con uno specchietto dentro, un disco che
 * gira con una stellina d'ottone (nessuna ballerina: niente figure), la chiavetta di carica sul fianco. Origine al centro
 * della base; `open` 0..1 apre il coperchio; `spin` = angolo del disco; `glow` accende di oro lo specchio.
 */
export const Carillon: React.FC<{ id: string; x: number; y: number; s?: number; t: number; open?: number; glow?: number; dirt?: number }> = ({ id, x, y, s = 1, t, open = 0, glow = 0, dirt = 0 }) => {
  const spin = open > 0.2 ? t * 90 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
      <Ombra id={id} x={0} y={4} rx={150} ry={18} />
      {glow > 0 && <Glow id={`${id}-cg`} x={0} y={-120} r={260} t={t} color={GOLD} amp={0.08} rate={2.5} opacity={0.6 * glow} />}
      {/* coperchio: chiuso è un listello; aperto mostra lo specchio dentro */}
      <g transform={`translate(0 -96)`}>
        <g transform={`scale(1 ${Math.cos((open * 100 * Math.PI) / 180) || 0.001}) `}>
          <rect x={-120} y={-26} width={240} height={26} rx={6} fill={`url(#${id}-wood)`} stroke={K} strokeWidth="6" />
        </g>
        {open > 0.05 && (
          <g transform={`translate(0 0) scale(1 ${Math.sin((open * 100 * Math.PI) / 180)})`}>
            <rect x={-116} y={-150} width={232} height={150} rx={8} fill="#4A2E1A" stroke={K} strokeWidth="6" />
            <rect x={-92} y={-132} width={184} height={116} rx={10} fill="#8A9AA8" stroke={K} strokeWidth="5" />
            <rect x={-92} y={-132} width={184} height={116} rx={10} fill={`url(#${id}-glass)`} />
            <path d="M-70 -40 L-20 -120 M-40 -30 L10 -110" stroke="#FFFFFF" strokeWidth="5" opacity=".5" />
            {glow > 0 && <rect x={-92} y={-132} width={184} height={116} rx={10} fill={GOLD} opacity={0.35 * glow} />}
          </g>
        )}
      </g>
      {/* scatola */}
      <path d="M-120 -96 H120 V-6 Q120 0 112 0 H-112 Q-120 0 -120 -6 Z" fill={`url(#${id}-wood)`} stroke={K} strokeWidth="7" />
      <rect x={-96} y={-80} width={192} height={60} rx={6} fill="none" stroke="#C8A060" strokeWidth="4" opacity=".7" />
      <path d="M-60 -50 Q0 -78 60 -50 Q0 -22 -60 -50 Z" fill="#C8A060" opacity=".55" />
      <circle cx="0" cy="-50" r="8" fill={GOLD} stroke={K} strokeWidth="3" />
      {/* il disco che gira con la stellina */}
      {open > 0.2 && (
        <g transform="translate(0 -100)">
          <ellipse rx={60} ry={12} fill="#C8A060" stroke={K} strokeWidth="4" />
          <g transform={`scale(${Math.cos((spin * Math.PI) / 180) * 0.8 + 0.2} 1)`}>
            <path d="M0 -60 L9 -34 L36 -34 L14 -18 L22 8 L0 -8 L-22 8 L-14 -18 L-36 -34 L-9 -34 Z" fill={GOLD} stroke={K} strokeWidth="4" transform="translate(0 -6) scale(.8)" />
          </g>
        </g>
      )}
      {/* chiavetta di carica */}
      <g transform={`translate(126 -50) rotate(${open > 0.2 ? t * 120 : 0})`}>
        <path d="M0 0 H14" stroke={`url(#${id}-brass)`} strokeWidth="6" />
        <path d="M14 -16 Q30 -24 30 0 Q30 24 14 16 Z" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="3" />
      </g>
      <path d="M-114 -90 H110" stroke="#E8C898" strokeWidth="4" opacity=".5" />
      {dirt > 0 && <path d="M-128 -10 Q-60 -40 0 -18 Q70 -44 130 -8 V6 H-128 Z" fill="#2A1E14" opacity={dirt} />}
    </g>
  );
};

// ---------------------------------------------------------------- il cane

/**
 * Cane generico seduto, di profilo verso destra (Sadie: un cane qualsiasi nel nostro stile, mai quello del film). Origine
 * a terra sotto le zampe; `bark` 0..1 apre la bocca e alza il muso; `brace` lo fa puntare all'indietro.
 */
export const Cane: React.FC<{ id: string; x: number; y: number; s?: number; t: number; bark?: number; brace?: number; flip?: boolean }> = ({ id, x, y, s = 1, t, bark = 0, brace = 0, flip = false }) => {
  const tail = Math.sin(t * 3) * 6 * (1 - brace);
  const head = -bark * 10 - brace * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${-brace * 6})`} strokeLinejoin="round" strokeLinecap="round">
      <Ombra id={id} x={0} y={4} rx={120} ry={14} />
      {/* coda */}
      <path d={`M-70 -40 Q-130 ${-60 + tail} -126 ${-110 + tail}`} stroke={K} strokeWidth="22" fill="none" />
      <path d={`M-70 -40 Q-130 ${-60 + tail} -126 ${-110 + tail}`} stroke="#8A5A32" strokeWidth="12" fill="none" />
      {/* corpo seduto */}
      <path d="M-90 0 Q-100 -90 -40 -130 Q10 -160 40 -120 Q60 -60 50 0 Z" fill="#8A5A32" stroke={K} strokeWidth="7" />
      <path d="M-60 -20 Q-80 -80 -30 -110" stroke="#B88A5A" strokeWidth="8" fill="none" opacity=".6" />
      {/* zampe anteriori puntate */}
      <path d="M20 -100 L40 0 M42 -100 L66 -2" stroke={K} strokeWidth="24" />
      <path d="M20 -100 L40 0 M42 -100 L66 -2" stroke="#9A6A3E" strokeWidth="14" />
      <ellipse cx="46" cy="-2" rx="16" ry="7" fill="#6A4424" stroke={K} strokeWidth="4" />
      <ellipse cx="72" cy="-2" rx="16" ry="7" fill="#6A4424" stroke={K} strokeWidth="4" />
      {/* collare rosso scuro */}
      <path d="M20 -150 Q44 -132 62 -150" stroke="#8A2A22" strokeWidth="12" fill="none" />
      <circle cx="44" cy="-132" r="7" fill={GOLD} stroke={K} strokeWidth="3" />
      {/* testa con il muso */}
      <g transform={`translate(40 -170) rotate(${head})`}>
        <path d="M-40 10 Q-44 -40 0 -50 Q36 -52 50 -26 L96 -16 Q104 -2 92 6 L50 10 Q20 30 -40 10 Z" fill="#9A6A3E" stroke={K} strokeWidth="7" />
        <path d={`M50 8 L92 ${6 + bark * 18} Q80 ${18 + bark * 18} 48 16 Z`} fill="#3A1A12" stroke={K} strokeWidth="5" opacity={bark > 0.05 ? 1 : 0} />
        <ellipse cx="98" cy="-12" rx="9" ry="7" fill="#1A0E0A" />
        <circle cx="34" cy="-26" r="7" fill="#1A0E0A" />
        <circle cx="36" cy="-28" r="2.5" fill="#FFFFFF" />
        {/* orecchio */}
        <path d="M-10 -44 Q-40 -30 -34 20 Q-14 10 6 -40 Z" fill="#6A4424" stroke={K} strokeWidth="6" />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- corvi

/** Corvo appollaiato di profilo (verso destra), che ogni tanto gira la testa. Origine sotto le zampe. */
export const Corvo: React.FC<{ x: number; y: number; s?: number; t: number; ph?: number; flip?: boolean }> = ({ x, y, s = 1, t, ph = 0, flip = false }) => {
  const look = Math.sin(t * 0.8 + ph) > 0.6 ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -s : s) * look} ${s})`} strokeLinejoin="round">
      <path d="M-46 -30 Q-30 -66 10 -64 Q34 -62 36 -40 Q30 -14 -10 -10 Q-40 -10 -70 4 Q-60 -14 -46 -30 Z" fill="#14161A" stroke={K} strokeWidth="4" />
      <circle cx="26" cy="-70" r="16" fill="#14161A" stroke={K} strokeWidth="4" />
      <path d="M40 -72 L62 -66 L40 -62 Z" fill="#3A3A3A" stroke={K} strokeWidth="3" />
      <circle cx="30" cy="-74" r="3" fill="#E8D8A0" />
      <path d="M-2 -10 V2 M10 -12 V2" stroke="#3A3A3A" strokeWidth="4" />
      <path d="M-30 -50 Q0 -60 20 -48" stroke="#4A5A6A" strokeWidth="3" fill="none" opacity=".6" />
    </g>
  );
};
