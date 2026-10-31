import React from 'react';

// Elementi comuni di Joker: i palazzi di mattoni di Gotham con le scale antincendio, i sacchi della spazzatura dello
// sciopero, gli oggetti del clown (parrucca, scarpa, completo rosso), la pistola e il televisore.
// Mai persone (né il volto truccato): Arthur si racconta con i suoi oggetti, le luci e la città.
// Ogni oggetto ha materiale (gradiente con lato in luce e lato in ombra), bordo illuminato e dettagli da 4–6 px:
// chi lo usa passa un `id` unico per i gradienti.

export const K = '#0E0C10'; // contorni

/** Gradienti dei materiali comuni (una volta per scena, dentro <defs>). */
export const JokerDefs: React.FC<{ id: string }> = ({ id }) => (
  <>
    <linearGradient id={`${id}-brick`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5E3424" /><stop offset=".55" stopColor="#7A4630" /><stop offset="1" stopColor="#4A281C" /></linearGradient>
    <linearGradient id={`${id}-brick2`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4A3A30" /><stop offset=".5" stopColor="#5E4A3C" /><stop offset="1" stopColor="#3A2C24" /></linearGradient>
    <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4A3220" /><stop offset=".45" stopColor="#7A5434" /><stop offset="1" stopColor="#3E2A1A" /></linearGradient>
    <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2A2E33" /><stop offset=".45" stopColor="#9AA2AA" /><stop offset=".6" stopColor="#5A6168" /><stop offset="1" stopColor="#24282C" /></linearGradient>
    <linearGradient id={`${id}-red`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7E1E1A" /><stop offset=".45" stopColor="#C8362E" /><stop offset="1" stopColor="#6A1814" /></linearGradient>
    <linearGradient id={`${id}-bag`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A4448" /><stop offset=".5" stopColor="#1E2428" /><stop offset="1" stopColor="#101416" /></linearGradient>
    <linearGradient id={`${id}-bag2`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3E5440" /><stop offset=".5" stopColor="#24342A" /><stop offset="1" stopColor="#141E18" /></linearGradient>
    <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".28" /><stop offset=".35" stopColor="#FFFFFF" stopOpacity="0" /><stop offset=".7" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="1" stopColor="#FFFFFF" stopOpacity=".1" /></linearGradient>
    <radialGradient id={`${id}-shadow`}><stop offset="0" stopColor="#000" stopOpacity=".55" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
  </>
);

/** Ombra morbida a terra sotto un oggetto. */
export const Ombra: React.FC<{ id: string; x: number; y: number; rx: number; ry?: number; opacity?: number }> = ({ id, x, y, rx, ry = rx * 0.18, opacity = 1 }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id}-shadow)`} opacity={opacity} />
);

/** Palazzo di mattoni con cornicione, finestre con davanzale e tende, scala antincendio. Origine in basso a sinistra. */
export const Palazzo: React.FC<{ id: string; x: number; y: number; w: number; h: number; t: number; lit?: number; seed?: number; fire?: boolean; dark?: boolean }> = ({ id, x, y, w, h, t, lit = 0.35, seed = 1, fire = true, dark }) => {
  const cols = Math.max(2, Math.floor(w / 110)), rows = Math.max(2, Math.floor(h / 150));
  const on = (i: number) => ((i * 37 + seed * 11) % 13) / 13 < lit;
  const cw = (w - 40) / cols, rh = (h - 60) / rows;
  return (
    <g strokeLinejoin="round">
      <rect x={x} y={y - h} width={w} height={h} fill={`url(#${id}-${dark ? 'brick2' : 'brick'})`} stroke={K} strokeWidth="8" />
      {/* corsi di mattoni e qualche mattone più chiaro */}
      {Array.from({ length: Math.floor(h / 22) }, (_, i) => <path key={`m${i}`} d={`M${x} ${y - h + i * 22} H${x + w}`} stroke="#000" strokeWidth="2" opacity=".16" />)}
      {Array.from({ length: Math.floor(h / 22) * 2 }, (_, i) => ((i * 7 + seed) % 5 === 0 ? <rect key={`b${i}`} x={x + ((i * 53 + seed * 17) % Math.max(1, w - 40))} y={y - h + Math.floor(i / 2) * 22 + 3} width="34" height="16" fill="#C08060" opacity=".14" /> : null))}
      {/* cornicione */}
      <rect x={x - 10} y={y - h - 22} width={w + 20} height="26" fill="#4A3428" stroke={K} strokeWidth="6" />
      <path d={`M${x - 8} ${y - h - 20} H${x + w + 8}`} stroke="#B89A80" strokeWidth="4" opacity=".7" />
      {Array.from({ length: Math.floor(w / 40) }, (_, i) => <rect key={`d${i}`} x={x + 6 + i * 40} y={y - h + 4} width="18" height="12" fill="#3A2820" stroke={K} strokeWidth="3" />)}
      {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
        const i = r * cols + c;
        const wx = x + 24 + c * cw, wy = y - h + 44 + r * rh, ww = cw - 30, wh = rh - 54;
        const lit = on(i);
        return (
          <g key={`w${i}`}>
            <rect x={wx - 6} y={wy - 8} width={ww + 12} height="10" fill="#8A6A50" stroke={K} strokeWidth="3" />
            <rect x={wx} y={wy} width={ww} height={wh} fill={lit ? '#F2C46A' : '#161A20'} opacity={lit ? 0.85 + 0.15 * Math.sin(t * 0.7 + i) : 1} stroke={K} strokeWidth="4" />
            {lit && <path d={`M${wx} ${wy} h${ww * 0.45} q-10 ${wh * 0.5} 0 ${wh} h${-ww * 0.45} Z`} fill="#C8743A" opacity=".55" />}
            <path d={`M${wx + ww / 2} ${wy} V${wy + wh} M${wx} ${wy + wh / 2} H${wx + ww}`} stroke={K} strokeWidth="3" />
            <rect x={wx - 6} y={wy + wh} width={ww + 12} height="9" fill="#8A6A50" stroke={K} strokeWidth="3" />
          </g>
        );
      }))}
      {fire && (
        <g fill="none">
          {Array.from({ length: rows - 1 }, (_, r) => {
            const fy = y - h + 44 + (r + 1) * rh - 22;
            const fx0 = x + w * 0.3, fx1 = x + w * 0.78;
            return (
              <g key={`f${r}`}>
                <path d={`M${fx0} ${fy} H${fx1}`} stroke={K} strokeWidth="9" />
                <path d={`M${fx0} ${fy - 2} H${fx1}`} stroke="#5A6168" strokeWidth="3" />
                <path d={`M${fx0} ${fy} V${fy - 40} H${fx1} V${fy}`} stroke={K} strokeWidth="5" />
                {Array.from({ length: 7 }, (_, k) => <path key={k} d={`M${fx0 + ((fx1 - fx0) * (k + 0.5)) / 7} ${fy} V${fy - 40}`} stroke={K} strokeWidth="3" />)}
                <path d={`M${fx0 + 20} ${fy} L${fx1 - 30} ${fy - rh + 22}`} stroke={K} strokeWidth="6" />
                <path d={`M${fx0 + 20} ${fy} L${fx1 - 30} ${fy - rh + 22}`} stroke={K} strokeWidth="3" strokeDasharray="4 12" transform="translate(0 -12)" />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

/** Montagna di sacchi della spazzatura (lo sciopero), con nodi, riflessi e qualche cartaccia. Origine in basso al centro. */
export const Sacchi: React.FC<{ id: string; x: number; y: number; s?: number; seed?: number }> = ({ id, x, y, s = 1, seed = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    <Ombra id={id} x={0} y={4} rx={230} ry={30} />
    {[[-120, 0, 76], [-30, -6, 86], [70, 0, 74], [-80, -96, 64], [24, -104, 70], [-30, -180, 56], [120, -70, 48]].map(([bx, by, r], i) => (
      <g key={i}>
        <path d={`M${bx - r} ${by} Q${bx - r * 1.05} ${by - r * 1.2} ${bx - r * 0.2} ${by - r * 1.3} L${bx} ${by - r * 1.22} L${bx + r * 0.2} ${by - r * 1.3} Q${bx + r * 1.05} ${by - r * 1.2} ${bx + r} ${by} Q${bx} ${by + 10} ${bx - r} ${by} Z`} fill={`url(#${id}-${(i + seed) % 3 ? 'bag' : 'bag2'})`} stroke={K} strokeWidth="6" />
        <path d={`M${bx - 10} ${by - r * 1.26} l10 -22 l10 22`} fill="none" stroke={K} strokeWidth="5" />
        <path d={`M${bx - r * 0.6} ${by - r * 0.85} q${r * 0.3} -18 ${r * 0.6} -6`} stroke="#9AAAB0" strokeWidth="5" fill="none" opacity=".55" strokeLinecap="round" />
        <path d={`M${bx - r * 0.2} ${by - r * 1.1} q-6 ${r * 0.4} 4 ${r * 0.9} M${bx + r * 0.3} ${by - r} q8 ${r * 0.4} -2 ${r * 0.8}`} stroke="#000" strokeWidth="3" fill="none" opacity=".35" />
      </g>
    ))}
    {/* cartacce e una lattina */}
    <path d="M150 -10 l46 -10 l8 22 l-44 10 Z" fill="#D8CCAA" stroke={K} strokeWidth="4" />
    <path d="M158 -6 h30 M160 2 h24" stroke="#8A7A60" strokeWidth="3" />
    <g transform="translate(-200 -12) rotate(-70)"><rect x="-14" y="-24" width="28" height="48" rx="6" fill="#B8302A" stroke={K} strokeWidth="4" /><path d="M-14 -10 h28" stroke="#E8E0D0" strokeWidth="4" /></g>
  </g>
);

/** Parrucca da clown verde, riccia e voluminosa (riccioli a strati con riflessi). Origine al centro. */
export const Parrucca: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => {
  const curls: [number, number, number][] = [[-96, 10, 30], [-110, -24, 28], [-84, -50, 30], [-56, -70, 28], [-24, -82, 26], [10, -84, 26], [42, -76, 28], [72, -58, 30], [98, -30, 28], [108, 4, 30], [-70, 34, 26], [84, 36, 26], [-40, -40, 24], [0, -50, 24], [40, -40, 24]];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx="0" cy="-10" rx="80" ry="50" fill="#1E4A28" stroke={K} strokeWidth="6" />
      {curls.map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill={i % 3 === 0 ? '#2E6A3A' : '#3E8A4A'} stroke={K} strokeWidth="5" />
          <path d={`M${cx - r * 0.5} ${cy - r * 0.2} a${r * 0.5} ${r * 0.5} 0 1 1 ${r * 0.6} ${r * 0.5}`} fill="none" stroke="#1E4A28" strokeWidth="4" />
          <path d={`M${cx - r * 0.55} ${cy - r * 0.45} q${r * 0.3} ${-r * 0.3} ${r * 0.6} ${-r * 0.2}`} fill="none" stroke="#9AD8A0" strokeWidth="4" strokeLinecap="round" opacity=".6" />
        </g>
      ))}
    </g>
  );
};

/** Grande scarpa da clown rossa, lucida, con lacci e suola bianca. Origine sotto la suola, al centro. */
export const Scarpa: React.FC<{ id: string; x: number; y: number; s?: number; rot?: number }> = ({ id, x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round">
    <path d="M-70 -4 Q-82 -60 -36 -72 Q4 -78 26 -52 Q118 -66 132 -16 Q136 8 108 8 H-58 Q-74 8 -70 -4 Z" fill={`url(#${id}-red)`} stroke={K} strokeWidth="7" />
    <path d="M-66 4 H120 Q134 4 130 -6" stroke="#F2E6D0" strokeWidth="10" fill="none" />
    <path d="M-66 4 H120" stroke={K} strokeWidth="3" transform="translate(0 7)" />
    <path d="M40 -52 Q90 -64 118 -30" stroke="#F4A098" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".8" />
    <path d="M-30 -66 Q-6 -40 20 -54" stroke={K} strokeWidth="5" fill="none" />
    {[-22, -8, 6].map((lx) => <path key={lx} d={`M${lx} -62 l14 10`} stroke="#F2E6D0" strokeWidth="5" strokeLinecap="round" />)}
    <path d="M6 -56 q22 -22 30 -6 q-14 10 -30 6 q-6 22 -24 18" stroke="#F2E6D0" strokeWidth="5" fill="none" strokeLinecap="round" />
  </g>
);

/** Il completo rosso su una gruccia: giacca con revers e tasche, panciotto senape, camicia verde. Origine al gancio. */
export const Completo: React.FC<{ id: string; x: number; y: number; s?: number; sway?: number }> = ({ id, x, y, s = 1, sway = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${sway}) scale(${s})`} strokeLinejoin="round">
    <path d="M0 0 V22 M-8 0 q8 -18 16 0" stroke="#5A6168" strokeWidth="6" fill="none" />
    <path d="M-96 44 L0 22 L96 44" stroke="#8A6A44" strokeWidth="12" fill="none" />
    {/* giacca */}
    <path d="M-96 44 Q-128 64 -120 260 H-66 L-62 128 L-56 340 H56 L62 128 L66 260 H120 Q128 64 96 44 L32 32 L0 124 L-32 32 Z" fill={`url(#${id}-red)`} stroke={K} strokeWidth="8" />
    <path d="M-92 52 Q-116 70 -110 250" stroke="#F08A80" strokeWidth="5" fill="none" opacity=".55" />
    {/* camicia e panciotto */}
    <path d="M-32 32 L0 124 L32 32 L24 28 L0 64 L-24 28 Z" fill="#3E7A5A" stroke={K} strokeWidth="5" />
    <path d="M-28 74 L0 124 L28 74 L24 212 H-24 Z" fill="#D8A030" stroke={K} strokeWidth="6" />
    <path d="M-20 90 L0 124 M20 90 L0 124" stroke="#A8781E" strokeWidth="4" />
    {[140, 170, 200].map((by) => <circle key={by} cx="0" cy={by} r="5" fill={K} />)}
    {/* revers, tasche, fazzoletto */}
    <path d="M-32 32 L-50 120 L-20 96 M32 32 L50 120 L20 96" stroke={K} strokeWidth="5" fill="none" />
    <path d="M-100 220 H-66 M66 220 H100" stroke={K} strokeWidth="5" />
    <path d="M70 100 l18 -4 l4 14 l-18 4 Z" fill="#D8A030" stroke={K} strokeWidth="3" />
  </g>
);

/** Rivoltella vista di fianco, acciaio brunito con riflesso e calcio di legno. Origine all'impugnatura. */
export const Pistola: React.FC<{ id: string; x: number; y: number; s?: number; rot?: number }> = ({ id, x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round">
    <path d="M2 -4 L-20 64 Q-18 74 -6 74 H16 L30 8 Z" fill={`url(#${id}-wood)`} stroke={K} strokeWidth="6" />
    <path d="M-8 20 l8 4 M-12 34 l8 4 M-16 48 l8 4" stroke="#2A1A10" strokeWidth="3" />
    <rect x="0" y="-30" width="140" height="20" rx="4" fill={`url(#${id}-steel)`} stroke={K} strokeWidth="6" />
    <rect x="132" y="-36" width="8" height="8" fill="#3A3E44" stroke={K} strokeWidth="3" />
    <rect x="12" y="-42" width="64" height="42" rx="12" fill={`url(#${id}-steel)`} stroke={K} strokeWidth="6" />
    <path d="M28 -42 V0 M44 -42 V0 M60 -42 V0" stroke={K} strokeWidth="3" opacity=".6" />
    <path d="M8 -26 H130" stroke="#E8EEF2" strokeWidth="3" opacity=".7" strokeLinecap="round" />
    <path d="M4 -34 l-14 -12 l6 -4 l16 10" fill="#3A3E44" stroke={K} strokeWidth="4" />
    <path d="M22 4 q12 26 36 4" stroke={K} strokeWidth="6" fill="none" />
    <path d="M34 2 q2 12 10 12" stroke={K} strokeWidth="4" fill="none" />
  </g>
);

/** Televisore anni Ottanta in mobile di legno, vetro curvo con riflesso, manopole, antenna a V. Origine al centro dello schermo. */
export const Tv: React.FC<{ id: string; x: number; y: number; s?: number; children?: React.ReactNode; glow?: number; antenna?: boolean }> = ({ id, x, y, s = 1, children, glow = 1, antenna = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    {antenna && <path d="M-20 -150 L-110 -290 M20 -150 L100 -300" stroke="#9AA2AA" strokeWidth="6" strokeLinecap="round" />}
    {antenna && <ellipse cx="0" cy="-152" rx="46" ry="16" fill="#2A2E33" stroke={K} strokeWidth="5" />}
    <rect x="-210" y="-156" width="420" height="312" rx="28" fill={`url(#${id}-wood)`} stroke={K} strokeWidth="10" />
    <path d="M-196 -140 H196" stroke="#B88A5A" strokeWidth="4" opacity=".6" />
    <rect x="-184" y="-130" width="282" height="258" rx="34" fill="#2A2420" stroke={K} strokeWidth="6" />
    <rect x="-172" y="-118" width="258" height="234" rx="40" fill="#101418" />
    <g>{children}</g>
    <rect x="-172" y="-118" width="258" height="234" rx="40" fill="#BFE0FF" opacity={0.05 * glow} />
    <rect x="-172" y="-118" width="258" height="234" rx="40" fill={`url(#${id}-glass)`} />
    <path d="M-150 -96 Q-120 -110 -60 -108" stroke="#FFFFFF" strokeWidth="6" fill="none" opacity=".35" strokeLinecap="round" />
    <rect x="114" y="-128" width="80" height="256" rx="8" fill="#3A2A1C" stroke={K} strokeWidth="5" />
    {[0, 1].map((i) => <g key={i}><circle cx="154" cy={-80 + i * 76} r="22" fill="#2A2E33" stroke={K} strokeWidth="5" /><path d={`M154 ${-80 + i * 76} l10 -14`} stroke="#C8CCD0" strokeWidth="4" /></g>)}
    {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M128 ${50 + i * 14} H180`} stroke={K} strokeWidth="4" />)}
    <path d="M-150 156 L-166 206 M150 156 L166 206" stroke={K} strokeWidth="10" strokeLinecap="round" />
  </g>
);
