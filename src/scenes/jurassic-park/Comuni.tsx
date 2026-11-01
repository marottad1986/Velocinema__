import React from 'react';

// Elementi comuni di Jurassic Park: jeep del parco, recinzione elettrica, felci e alberi della giungla, goccia d'ambra,
// elicottero, uovo e dinosauri generici (brachiosauro, T-rex, raptor piumato) disegnati nel nostro stile, non come nel film.
// Mai persone. Nessun logo del film.

export const K = '#0F1F17'; // contorni

/** Gradienti dei materiali comuni (una volta per scena, dentro <defs>): lato in luce a sinistra, in ombra a destra. */
export const JPDefs: React.FC<{ id: string }> = ({ id }) => (
  <>
    <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3A3E3A" /><stop offset=".4" stopColor="#9AA29A" /><stop offset=".6" stopColor="#6A706A" /><stop offset="1" stopColor="#2E322E" /></linearGradient>
    <linearGradient id={`${id}-jeep`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFAEC" /><stop offset=".6" stopColor="#E2D9C2" /><stop offset="1" stopColor="#A89E86" /></linearGradient>
    <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#95A266" /><stop offset=".6" stopColor="#6E7A4A" /><stop offset="1" stopColor="#4A5432" /></linearGradient>
    <linearGradient id={`${id}-brachio`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9AB4A6" /><stop offset=".6" stopColor="#7E9A8E" /><stop offset="1" stopColor="#56706A" /></linearGradient>
    <linearGradient id={`${id}-trunk`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6A5438" /><stop offset=".45" stopColor="#4A3A28" /><stop offset="1" stopColor="#2A2016" /></linearGradient>
    <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8A6A44" /><stop offset=".5" stopColor="#6A4E30" /><stop offset="1" stopColor="#3E2C1A" /></linearGradient>
    <radialGradient id={`${id}-amber`} cx=".4" cy=".35"><stop offset="0" stopColor="#FFE6A0" /><stop offset=".55" stopColor="#F2A23A" /><stop offset="1" stopColor="#B85E14" /></radialGradient>
    <radialGradient id={`${id}-shadow`}><stop offset="0" stopColor="#000" stopOpacity=".55" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
  </>
);

/** Ombra morbida a terra. */
export const Ombra: React.FC<{ id: string; x: number; y: number; rx: number; ry?: number; opacity?: number }> = ({ id, x, y, rx, ry = rx * 0.18, opacity = 1 }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id}-shadow)`} opacity={opacity} />
);

/** Jeep elettrica del parco vista di lato (verde con fascia accento, nessun logo). `tilt` per inclinarla. */
export const Jeep: React.FC<{ id?: string; x: number; y: number; s?: number; accent: string; lights?: number; tilt?: number }> = ({ id, x, y, s = 1, accent, lights = 0, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`} strokeLinejoin="round">
    <ellipse cx="0" cy="44" rx="200" ry="16" fill={K} opacity=".3" />
    <path d="M-190 20 V-40 Q-186 -60 -160 -64 L-110 -120 H70 L120 -64 Q170 -60 186 -40 V20 Z" fill={id ? `url(#${id}-jeep)` : '#E9E2CF'} stroke={K} strokeWidth="8" />
    <path d="M-150 -64 V16 M60 -64 V16" stroke={K} strokeWidth="4" opacity=".5" />
    <rect x="-40" y="-52" width="26" height="8" rx="3" fill="#8A8676" />
    <path d="M-110 -120 L-130 -150 M-128 -150 h-20" stroke={K} strokeWidth="5" />
    <path d="M-188 -20 H184 V0 H-188 Z" fill={accent} />
    <path d="M-100 -110 H-10 V-64 H-140 Z M4 -110 H64 L104 -64 H4 Z" fill="#2E4A5A" stroke={K} strokeWidth="5" />
    <path d="M-96 -104 L-50 -70" stroke="#9FC0CC" strokeWidth="5" opacity=".6" />
    <path d="M-120 -124 H80" stroke={K} strokeWidth="8" strokeLinecap="round" />
    <rect x="166" y="-36" width="22" height="16" rx="4" fill={lights > 0 ? '#FFF6D0' : '#C9C2B2'} stroke={K} strokeWidth="3" />
    {lights > 0 && <path d="M188 -28 L560 -110 L560 60 Z" fill="#FFF6D0" opacity={0.18 * lights} />}
    <rect x="-192" y="-36" width="12" height="16" fill="#C2301E" stroke={K} strokeWidth="3" />
    {[-118, 118].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy="24" r="38" fill="#1C1E1C" stroke={K} strokeWidth="6" />
        <circle cx={wx} cy="24" r="15" fill="#9A9A90" stroke={K} strokeWidth="3" />
        {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M${wx} 24 l${Math.cos(k * 1.256) * 14} ${Math.sin(k * 1.256) * 14}`} stroke="#5A5A52" strokeWidth="3" />)}
      </g>
    ))}
    <path d="M-170 -50 Q-60 -56 160 -54" fill="none" stroke="#FFFFFF" strokeWidth="5" opacity=".6" />
  </g>
);

/** Recinzione elettrica alta: pali, cavi e cartello di pericolo; `broken` 0..1 fa cadere i cavi di un tratto. */
export const Fence: React.FC<{ id?: string; x0: number; x1: number; y: number; h?: number; posts?: number; broken?: number; sign?: boolean; signX?: number; accent: string; glow?: number }> = ({
  id, x0, x1, y, h = 520, posts = 5, broken = 0, sign = true, signX, accent, glow = 0,
}) => {
  const xs = Array.from({ length: posts }, (_, i) => x0 + ((x1 - x0) * i) / (posts - 1));
  const mid = Math.floor(posts / 2);
  return (
    <g strokeLinecap="round">
      {Array.from({ length: 9 }, (_, k) => {
        const yy = y - 40 - k * ((h - 80) / 8);
        return xs.slice(0, -1).map((xa, i) => {
          const xb = xs[i + 1];
          const snap = i === mid - 1 || i === mid ? broken : 0;
          const sag = 10 + snap * (h - 40 - k * 20);
          return <path key={`${k}-${i}`} d={`M${xa} ${yy} Q${(xa + xb) / 2} ${yy + sag} ${xb} ${yy + snap * 60}`} fill="none" stroke={glow > 0 ? '#BFE6FF' : '#2A2E2A'} strokeWidth={glow > 0 ? 4 : 3} opacity={glow > 0 ? 0.5 + 0.5 * glow : 0.9} />;
        });
      })}
      {xs.map((px, i) => (
        <g key={i}>
          <rect x={px - 16} y={y - h} width="32" height={h} fill={id ? `url(#${id}-steel)` : '#5A5E58'} stroke={K} strokeWidth="6" />
          <path d={`M${px - 10} ${y - h + 10} V${y - 10}`} stroke="#C8D0C8" strokeWidth="3" opacity=".35" />
          <rect x={px - 24} y={y - h - 14} width="48" height="18" fill="#3E423E" stroke={K} strokeWidth="5" />
          {Array.from({ length: 9 }, (_, k) => <circle key={k} cx={px} cy={y - 40 - k * ((h - 80) / 8)} r="5" fill={glow > 0 ? '#E9F6FF' : '#8A8E86'} />)}
        </g>
      ))}
      {sign && (
        <g transform={`translate(${signX ?? xs[1] + (xs[2] - xs[1]) / 2} ${y - h * 0.42})`}>
          <rect x="-90" y="-60" width="180" height="120" fill={accent} stroke={K} strokeWidth="7" />
          <path d="M-70 -40 H70 M-70 40 H70" stroke={K} strokeWidth="4" />
          <text x="0" y="-6" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="30" fill={K}>PERICOLO</text>
          <text x="0" y="28" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="26" fill={K}>10.000 VOLT</text>
        </g>
      )}
    </g>
  );
};

/** Felce: ventaglio di fronde che ondeggiano. */
export const Fern: React.FC<{ x: number; y: number; s?: number; t: number; ph?: number; color?: string; outline?: boolean; flip?: boolean }> = ({ x, y, s = 1, t, ph = 0, color = '#2E7D4F', outline = true, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    {[-70, -45, -20, 5, 30, 55].map((a, i) => {
      const aa = ((a + Math.sin(t * 1.4 + ph + i) * 4) * Math.PI) / 180;
      const L = 220 - Math.abs(a) * 0.8;
      const ex = Math.sin(aa) * L, ey = -Math.cos(aa) * L;
      return (
        <g key={i}>
          <path d={`M0 0 Q${ex * 0.4 - 30} ${ey * 0.6} ${ex} ${ey} Q${ex * 0.5 + 30} ${ey * 0.5} 0 0 Z`} fill={color} stroke={outline ? K : 'none'} strokeWidth="5" strokeLinejoin="round" />
          <path d={`M0 0 Q${ex * 0.45} ${ey * 0.55} ${ex} ${ey}`} fill="none" stroke="#7FC08F" strokeWidth="3" opacity=".6" />
        </g>
      );
    })}
  </g>
);

/** Albero della giungla: tronco largo con radici e chioma a cupole. */
export const JungleTree: React.FC<{ x: number; y: number; h?: number; t: number; ph?: number; leaf?: string; trunk?: string; outline?: boolean }> = ({
  x, y, h = 700, t, ph = 0, leaf = '#245F3C', trunk = '#4A3A28', outline = true,
}) => {
  const st = outline ? K : 'none';
  const sw = Math.sin(t * 0.9 + ph) * 6;
  return (
    <g strokeLinejoin="round">
      <path d={`M${x - 60} ${y} Q${x - 30} ${y - h * 0.5} ${x - 24 + sw} ${y - h} H${x + 24 + sw} Q${x + 30} ${y - h * 0.5} ${x + 60} ${y} Z`} fill={trunk} stroke={st} strokeWidth="7" />
      <path d={`M${x - 60} ${y} q-40 -10 -70 10 M${x + 60} ${y} q40 -10 70 10`} stroke={trunk} strokeWidth="18" strokeLinecap="round" fill="none" />
      {[[-170, -40, 170], [150, -20, 160], [-40, -150, 200], [60, 60, 150], [-120, 80, 140]].map(([dx, dy, r], i) => (
        <circle key={i} cx={x + dx + sw * 1.4} cy={y - h + dy} r={r} fill={leaf} stroke={st} strokeWidth="6" />
      ))}
      {[[-120, -80], [90, -60], [0, -200]].map(([dx, dy], i) => <path key={i} d={`M${x + dx - 60 + sw} ${y - h + dy} q60 -40 120 0`} fill="none" stroke="#5FA672" strokeWidth="5" opacity=".6" />)}
    </g>
  );
};

/** Goccia d'ambra con la zanzara dentro, illuminata. */
export const Amber: React.FC<{ id?: string; x: number; y: number; s?: number; accent: string }> = ({ id, x, y, s = 1, accent }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
    <path d="M0 -110 Q70 -60 80 10 Q80 90 0 104 Q-80 90 -80 10 Q-70 -60 0 -110 Z" fill={id ? `url(#${id}-amber)` : accent} stroke={K} strokeWidth="9" opacity=".95" />
    {[[-30, 50, 6], [36, 40, 4], [-10, 70, 5], [40, -20, 3]].map(([bx, by, br], i) => <circle key={i} cx={bx} cy={by} r={br} fill="#FFF0C8" opacity=".55" />)}
    <path d="M0 -84 Q48 -46 56 6 Q56 66 0 78 Q-56 66 -56 6 Q-48 -46 0 -84 Z" fill="#FFC56A" opacity=".6" />
    {/* zanzara */}
    <g stroke="#3A1E08" strokeWidth="4" fill="none">
      <path d="M-34 10 L-6 0 M34 14 L8 2 M-30 34 L-4 8 M30 38 L6 8 M-20 -30 L-4 -6 M20 -28 L4 -6" />
      <path d="M0 -14 L0 -50" strokeWidth="3" />
    </g>
    <ellipse cx="0" cy="8" rx="10" ry="22" fill="#3A1E08" />
    <circle cx="0" cy="-16" r="8" fill="#3A1E08" />
    <ellipse cx="-20" cy="-6" rx="22" ry="8" fill="#FFF0C8" opacity=".55" transform="rotate(-30 -20 -6)" />
    <ellipse cx="20" cy="-6" rx="22" ry="8" fill="#FFF0C8" opacity=".55" transform="rotate(30 20 -6)" />
    <path d="M-40 -50 Q-56 -20 -56 10" stroke="#FFF4D6" strokeWidth="8" fill="none" opacity=".8" />
  </g>
);

/** Elicottero generico visto di lato; `rotor` = angolo delle pale (passa t*velocità). */
export const Helicopter: React.FC<{ x: number; y: number; s?: number; t: number; tilt?: number; color?: string }> = ({ x, y, s = 1, t, tilt = 0, color = '#E9E2CF' }) => {
  const blade = Math.abs(Math.cos(t * 40)) * 300;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
      <path d={`M${-blade} -96 H${blade}`} stroke={K} strokeWidth="10" />
      <ellipse cx="0" cy="-96" rx="300" ry="10" fill="#FFFFFF" opacity=".12" />
      <path d="M0 -96 V-70" stroke={K} strokeWidth="10" />
      <path d="M-120 -10 Q-130 -70 -40 -76 H60 Q120 -70 130 -10 Q120 30 40 34 H-60 Q-120 30 -120 -10 Z" fill={color} stroke={K} strokeWidth="8" />
      <path d="M60 -66 Q116 -60 124 -12 H60 Z" fill="#3E5A6A" stroke={K} strokeWidth="5" />
      <path d="M-120 -20 L-330 -40 L-330 -10 L-120 10 Z" fill={color} stroke={K} strokeWidth="7" />
      <path d="M-330 -70 V20" stroke={K} strokeWidth="8" />
      <circle cx="-330" cy="-26" r={Math.abs(Math.sin(t * 50)) * 40 + 4} fill="none" stroke={K} strokeWidth="4" opacity=".6" />
      <path d="M-80 54 H90 M-60 34 V54 M60 34 V54" stroke={K} strokeWidth="8" />
      <path d="M-110 -6 H120" stroke="#2E7D4F" strokeWidth="10" />
    </g>
  );
};

/** Uovo di dinosauro: `crack` 0..1 lo crepa e lo apre (resta solo il guscio, nessun animale). */
export const Egg: React.FC<{ x: number; y: number; s?: number; crack?: number; open?: number; spots?: string }> = ({ x, y, s = 1, crack = 0, open = 0, spots = '#B89A6A' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    <ellipse cx="0" cy="58" rx="56" ry="10" fill={K} opacity=".25" />
    {open < 1 ? (
      <g>
        <path d="M0 -70 Q52 -60 54 10 Q52 60 0 64 Q-52 60 -54 10 Q-52 -60 0 -70 Z" fill="#F4ECD8" stroke={K} strokeWidth="7" />
        {[[-20, -20], [18, 6], [-10, 30], [26, -36]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={6 + (i % 2) * 3} fill={spots} opacity=".7" />)}
        {crack > 0 && <path d={`M-40 -6 l14 -10 l10 12 l14 -14 l12 12 l${14 * crack} -10`} fill="none" stroke={K} strokeWidth="4" />}
        <path d="M-30 -44 Q-44 -20 -44 6" stroke="#FFFFFF" strokeWidth="6" fill="none" opacity=".7" />
      </g>
    ) : null}
    {open > 0 && (
      <g>
        <path d="M-54 10 Q-52 60 0 64 Q52 60 54 10 l-12 -12 l-12 12 l-12 -14 l-12 12 l-12 -12 l-12 12 Z" fill="#F4ECD8" stroke={K} strokeWidth="7" />
        <g transform={`translate(${-30 - 40 * open} ${-40 - 30 * open}) rotate(${-40 * open})`}>
          <path d="M-24 30 Q-22 -26 24 -30 Q30 0 24 30 l-10 -10 l-10 10 l-10 -10 Z" fill="#F4ECD8" stroke={K} strokeWidth="6" />
        </g>
      </g>
    )}
  </g>
);

// ---------------------------------------------------------------- dinosauri generici (nel nostro stile, non come nel film)

/** Brachiosauro di profilo, rivolto a destra, origine ai piedi. `reach` 0..1 alza la testa verso le foglie, `chew` mastica. */
export const Brachio: React.FC<{ id?: string; x: number; y: number; s?: number; t: number; reach?: number }> = ({ id, x, y, s = 1, t, reach = 0 }) => {
  const skin = id ? `url(#${id}-brachio)` : '#7E9A8E';
  const sway = Math.sin(t * 0.7) * 10;
  const hx = 330 + sway + 30 * reach, hy = -860 - 120 * reach;
  const chew = Math.max(0, Math.sin(t * 6)) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
      <path d={`M-200 -250 Q-420 -230 -560 -120 Q-430 -190 -200 -190 Z`} fill="#6E8A80" stroke={K} strokeWidth="8" />
      {[[-150, 0], [-60, 0], [90, 0], [170, 0]].map(([lx], i) => (
        <path key={i} d={`M${lx - 30} -250 V0 H${lx + 30} V-250 Z`} fill={i % 2 ? '#5E7A70' : '#6E8A80'} stroke={K} strokeWidth="8" />
      ))}
      <ellipse cx="0" cy="-280" rx="240" ry="120" fill={skin} stroke={K} strokeWidth="9" />
      {[-120, -40, 40, 120].map((sx) => <path key={sx} d={`M${sx} -390 q12 30 -4 60`} stroke="#56706A" strokeWidth="6" fill="none" opacity=".6" />)}
      <path d="M-200 -240 Q0 -170 200 -250" fill="none" stroke="#A8C0B4" strokeWidth="8" opacity=".7" />
      <path d={`M150 -330 Q${200 + sway * 0.4} -600 ${hx - 20} ${hy + 40} L${hx + 20} ${hy + 60} Q${240 + sway * 0.4} -580 230 -250 Z`} fill={skin} stroke={K} strokeWidth="8" />
      <path d={`M190 -330 Q${230 + sway * 0.4} -600 ${hx + 4} ${hy + 60}`} fill="none" stroke="#A8C0B4" strokeWidth="6" opacity=".7" />
      <g transform={`translate(${hx} ${hy})`}>
        <path d={`M-40 30 Q-50 -20 0 -30 Q60 -30 80 0 Q90 ${20 + chew} 40 ${30 + chew} Q0 40 -40 30 Z`} fill="#7E9A8E" stroke={K} strokeWidth="7" />
        <path d="M-6 -30 Q10 -56 30 -30" fill="#6E8A80" stroke={K} strokeWidth="6" />
        <circle cx="20" cy="-6" r="7" fill={K} />
        <path d={`M44 ${16 + chew} q20 -10 34 6`} stroke="#3E8A54" strokeWidth="8" fill="none" />
      </g>
    </g>
  );
};

/** T-rex di profilo, rivolto a destra, origine ai piedi: busto inclinato in avanti, coda tesa come contrappeso, coscia
 *  muscolosa con stinco piegato e piede a tre dita, braccino a due dita, cranio profondo. `jaw` 0..1 apre la mascella. */
export const TRex: React.FC<{ id?: string; x: number; y: number; s?: number; t: number; jaw?: number; flip?: boolean }> = ({ id, x, y, s = 1, t, jaw = 0, flip = false }) => {
  const skin = id ? `url(#${id}-skin)` : '#7A8650';
  const b = Math.sin(t * 1.6) * 4;
  const a = 24 * jaw;
  const far = '#4E5A36';
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} strokeLinejoin="round" strokeLinecap="round">
      {/* zampa lontana, più scura */}
      <path d="M-70 -330 Q30 -350 40 -260 Q34 -200 0 -186 Q-50 -220 -90 -270 Z" fill={far} stroke={K} strokeWidth="7" />
      <path d="M-6 -196 L22 -186 L-24 -66 L-50 -76 Z" fill={far} stroke={K} strokeWidth="7" />
      <path d="M-56 -70 L-20 -62 L46 -16 L56 0 H-64 Z" fill={far} stroke={K} strokeWidth="7" />
      {/* coda tesa e lunga */}
      <path d={`M-40 -400 Q-320 -400 -680 ${-330 + b} Q-330 -318 -60 -290 Z`} fill={skin} stroke={K} strokeWidth="9" />
      {/* busto inclinato in avanti */}
      <path d={`M-120 -390 Q0 ${-470 + b} 170 -440 Q250 -420 290 -380 L300 -330 Q250 -270 150 -248 Q20 -228 -100 -280 Q-150 -320 -120 -390 Z`} fill={skin} stroke={K} strokeWidth="9" />
      <path d="M-90 -290 Q40 -250 200 -290" stroke="#C8C08E" strokeWidth="22" fill="none" opacity=".55" />
      {[-80, -20, 40, 100, 160].map((sx, i) => <path key={sx} d={`M${sx} ${-438 + i * 2} q10 34 -4 66`} stroke="#3E4A2A" strokeWidth="8" fill="none" opacity=".35" />)}
      <path d="M-60 -432 Q60 -462 200 -434" stroke="#B4C080" strokeWidth="6" fill="none" opacity=".6" />
      {/* collo e cranio profondo */}
      <path d="M200 -430 Q260 -470 320 -480 L360 -400 Q300 -360 260 -330 Z" fill={skin} stroke={K} strokeWidth="8" />
      <g transform="translate(300 -470)">
        <g transform={`rotate(${a} 30 50)`}>
          <path d="M20 46 L220 50 Q228 70 200 84 L40 86 Q14 76 20 46 Z" fill={far} stroke={K} strokeWidth="8" />
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${54 + i * 22} 50 l7 -14 l7 14`} fill="#F4EBD0" stroke={K} strokeWidth="3" />)}
          {jaw > 0.2 && <path d="M50 64 L190 66" stroke="#8E2A22" strokeWidth="12" />}
        </g>
        <path d="M0 50 Q-20 -40 70 -64 Q170 -76 236 -20 Q252 10 240 48 L20 52 Z" fill={skin} stroke={K} strokeWidth="9" />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${40 + i * 24} 48 l8 16 l8 -16`} fill="#F4EBD0" stroke={K} strokeWidth="3" />)}
        <path d="M70 -46 Q110 -64 150 -50" stroke="#3E4A2A" strokeWidth="12" fill="none" />
        <circle cx="112" cy="-24" r="12" fill="#F2C14E" stroke={K} strokeWidth="4" />
        <circle cx="114" cy="-24" r="5" fill={K} />
        <circle cx="222" cy="-2" r="5" fill={K} />
        <path d="M30 -30 Q80 -60 150 -62" stroke="#C8C08E" strokeWidth="6" fill="none" opacity=".7" />
        <path d="M40 10 Q100 0 160 16" stroke="#3E4A2A" strokeWidth="5" fill="none" opacity=".4" />
      </g>
      {/* braccino a due dita */}
      <path d="M232 -320 q30 18 26 46" stroke={K} strokeWidth="16" fill="none" />
      <path d="M232 -320 q30 18 26 46" stroke="#7A8650" strokeWidth="8" fill="none" />
      <path d="M258 -274 l16 8 M258 -274 l6 16" stroke={K} strokeWidth="5" />
      {/* zampa vicina: coscia muscolosa, stinco piegato, piede a tre dita */}
      <path d="M-50 -350 Q90 -380 120 -270 Q118 -190 76 -170 Q10 -200 -50 -260 Q-80 -310 -50 -350 Z" fill={skin} stroke={K} strokeWidth="9" />
      <path d="M-20 -330 Q70 -350 96 -280" stroke="#C8C08E" strokeWidth="8" fill="none" opacity=".5" />
      <path d="M60 -182 L100 -168 L50 -56 L18 -66 Z" fill={skin} stroke={K} strokeWidth="8" />
      <path d="M10 -64 L52 -54 L136 -14 L148 0 H0 Z" fill={skin} stroke={K} strokeWidth="8" />
      {[60, 100, 140].map((cx) => <path key={cx} d={`M${cx} -4 l14 4 l-14 4`} fill="#F4EBD0" stroke={K} strokeWidth="3" />)}
    </g>
  );
};

/** Testa di velociraptor piumato (come dicono i paleontologi, non come nel film), di profilo verso destra. */
export const RaptorHead: React.FC<{ x: number; y: number; s?: number; t: number; open?: number }> = ({ x, y, s = 1, t, open = 0 }) => {
  const blink = (t % 3.1) < 0.12 ? 0.2 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
      {/* collo e piume */}
      <path d="M-120 140 Q-110 40 -40 0 L20 30 Q-20 80 -30 150 Z" fill="#6A4A30" stroke={K} strokeWidth="7" />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-110 + i * 16} ${130 - i * 22} q-30 -10 -40 10`} stroke="#C98A4A" strokeWidth="7" fill="none" />)}
      <g transform={`rotate(${14 * open} 20 30)`}>
        <path d="M20 30 L150 44 Q156 56 140 60 L30 56 Z" fill="#5A3E28" stroke={K} strokeWidth="6" />
      </g>
      <path d="M-50 20 Q-50 -40 20 -44 Q120 -40 160 20 Q164 36 150 40 L20 40 Z" fill="#7A5236" stroke={K} strokeWidth="8" />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${40 + i * 18} 40 l6 12 l6 -12`} fill="#F4EBD0" stroke={K} strokeWidth="2" />)}
      {/* cresta di piume */}
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${-40 + i * 16} ${-30 - i * 2} q-20 -40 -50 -40`} stroke="#C98A4A" strokeWidth="8" fill="none" />)}
      <ellipse cx="44" cy="-10" rx="12" ry={12 * blink} fill="#F2C14E" stroke={K} strokeWidth="4" />
      <ellipse cx="46" cy="-10" rx="3" ry={9 * blink} fill={K} />
      <path d="M0 -30 Q40 -44 90 -30" stroke="#A8784E" strokeWidth="6" fill="none" opacity=".8" />
    </g>
  );
};
