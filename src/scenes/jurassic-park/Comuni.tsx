import React from 'react';

// Elementi comuni di Jurassic Park: jeep del parco, recinzione elettrica, felci e alberi della giungla, goccia d'ambra,
// elicottero, uovo e dinosauri generici (brachiosauro, T-rex, raptor piumato) disegnati nel nostro stile, non come nel film.
// Mai persone. Nessun logo del film.

export const K = '#0F1F17'; // contorni

/** Jeep elettrica del parco vista di lato (verde con fascia accento, nessun logo). `tilt` per inclinarla. */
export const Jeep: React.FC<{ x: number; y: number; s?: number; accent: string; lights?: number; tilt?: number }> = ({ x, y, s = 1, accent, lights = 0, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`} strokeLinejoin="round">
    <ellipse cx="0" cy="44" rx="200" ry="16" fill={K} opacity=".3" />
    <path d="M-190 20 V-40 Q-186 -60 -160 -64 L-110 -120 H70 L120 -64 Q170 -60 186 -40 V20 Z" fill="#E9E2CF" stroke={K} strokeWidth="8" />
    <path d="M-188 -20 H184 V0 H-188 Z" fill={accent} />
    <path d="M-100 -110 H-10 V-64 H-140 Z M4 -110 H64 L104 -64 H4 Z" fill="#2E4A5A" stroke={K} strokeWidth="5" />
    <path d="M-96 -104 L-50 -70" stroke="#9FC0CC" strokeWidth="5" opacity=".6" />
    <path d="M-120 -124 H80" stroke={K} strokeWidth="8" strokeLinecap="round" />
    <rect x="166" y="-36" width="22" height="16" rx="4" fill={lights > 0 ? '#FFF6D0' : '#C9C2B2'} stroke={K} strokeWidth="3" />
    <rect x="-192" y="-36" width="12" height="16" fill="#C2301E" stroke={K} strokeWidth="3" />
    {[-118, 118].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy="24" r="38" fill="#1C1E1C" stroke={K} strokeWidth="6" />
        <circle cx={wx} cy="24" r="15" fill="#9A9A90" />
      </g>
    ))}
    <path d="M-170 -50 Q-60 -56 160 -54" fill="none" stroke="#FFFFFF" strokeWidth="5" opacity=".6" />
  </g>
);

/** Recinzione elettrica alta: pali, cavi e cartello di pericolo; `broken` 0..1 fa cadere i cavi di un tratto. */
export const Fence: React.FC<{ x0: number; x1: number; y: number; h?: number; posts?: number; broken?: number; sign?: boolean; accent: string; glow?: number }> = ({
  x0, x1, y, h = 520, posts = 5, broken = 0, sign = true, accent, glow = 0,
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
          <rect x={px - 16} y={y - h} width="32" height={h} fill="#5A5E58" stroke={K} strokeWidth="6" />
          <rect x={px - 24} y={y - h - 14} width="48" height="18" fill="#3E423E" stroke={K} strokeWidth="5" />
          {Array.from({ length: 9 }, (_, k) => <circle key={k} cx={px} cy={y - 40 - k * ((h - 80) / 8)} r="5" fill={glow > 0 ? '#E9F6FF' : '#8A8E86'} />)}
        </g>
      ))}
      {sign && (
        <g transform={`translate(${xs[1] + (xs[2] - xs[1]) / 2} ${y - h * 0.42})`}>
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
export const Amber: React.FC<{ x: number; y: number; s?: number; accent: string }> = ({ x, y, s = 1, accent }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
    <path d="M0 -110 Q70 -60 80 10 Q80 90 0 104 Q-80 90 -80 10 Q-70 -60 0 -110 Z" fill={accent} stroke={K} strokeWidth="9" opacity=".95" />
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
export const Brachio: React.FC<{ x: number; y: number; s?: number; t: number; reach?: number }> = ({ x, y, s = 1, t, reach = 0 }) => {
  const sway = Math.sin(t * 0.7) * 10;
  const hx = 330 + sway + 30 * reach, hy = -860 - 120 * reach;
  const chew = Math.max(0, Math.sin(t * 6)) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
      <path d={`M-200 -250 Q-420 -230 -560 -120 Q-430 -190 -200 -190 Z`} fill="#6E8A80" stroke={K} strokeWidth="8" />
      {[[-150, 0], [-60, 0], [90, 0], [170, 0]].map(([lx], i) => (
        <path key={i} d={`M${lx - 30} -250 V0 H${lx + 30} V-250 Z`} fill={i % 2 ? '#5E7A70' : '#6E8A80'} stroke={K} strokeWidth="8" />
      ))}
      <ellipse cx="0" cy="-280" rx="240" ry="120" fill="#7E9A8E" stroke={K} strokeWidth="9" />
      <path d="M-200 -240 Q0 -170 200 -250" fill="none" stroke="#A8C0B4" strokeWidth="8" opacity=".7" />
      <path d={`M150 -330 Q${200 + sway * 0.4} -600 ${hx - 20} ${hy + 40} L${hx + 20} ${hy + 60} Q${240 + sway * 0.4} -580 230 -250 Z`} fill="#7E9A8E" stroke={K} strokeWidth="8" />
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

/** T-rex di profilo, rivolto a destra, origine ai piedi; `jaw` 0..1 apre la bocca (ruggito), `step` muove le zampe. */
export const TRex: React.FC<{ x: number; y: number; s?: number; t: number; jaw?: number; flip?: boolean }> = ({ x, y, s = 1, t, jaw = 0, flip = false }) => {
  const breath = Math.sin(t * 1.6) * 4;
  const a = 26 * jaw;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} strokeLinejoin="round" strokeLinecap="round">
      {/* coda */}
      <path d={`M-140 -330 Q-380 -330 -640 ${-300 + breath} Q-380 -250 -120 -240 Z`} fill="#6E7A4A" stroke={K} strokeWidth="9" />
      {/* zampa dietro */}
      <path d="M-80 -260 Q-140 -140 -110 -60 L-140 0 H-40 L-60 -60 Q-20 -150 0 -230 Z" fill="#5A6640" stroke={K} strokeWidth="8" />
      {/* corpo */}
      <path d={`M-160 -330 Q-60 ${-450 + breath} 140 -420 Q230 -400 250 -330 Q230 -230 100 -220 Q-60 -200 -160 -260 Z`} fill="#7A8650" stroke={K} strokeWidth="9" />
      <path d="M-100 -260 Q40 -230 200 -300" fill="none" stroke="#C4BE8E" strokeWidth="18" opacity=".7" />
      {[-60, 0, 60, 120].map((sx) => <path key={sx} d={`M${sx} -410 q14 40 -6 80`} stroke="#4A5432" strokeWidth="10" fill="none" opacity=".7" />)}
      {/* zampa davanti */}
      <path d="M40 -250 Q0 -130 30 -60 L0 0 H110 L90 -60 Q110 -150 120 -240 Z" fill="#6E7A4A" stroke={K} strokeWidth="8" />
      {/* braccino */}
      <path d="M200 -320 q40 20 30 50 l14 6 M230 -270 l-4 16" stroke={K} strokeWidth="14" fill="none" />
      <path d="M200 -320 q40 20 30 50" stroke="#7A8650" strokeWidth="7" fill="none" />
      {/* collo e testa: mascella che si apre */}
      <path d="M180 -400 Q240 -470 300 -470 L330 -380 Q260 -350 220 -330 Z" fill="#7A8650" stroke={K} strokeWidth="8" />
      <g transform="translate(300 -470)">
        <g transform={`rotate(${a} 0 40)`}>
          <path d="M0 40 L210 70 Q230 90 200 104 L20 100 Z" fill="#6E7A4A" stroke={K} strokeWidth="8" />
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${40 + i * 24} ${72 + i * 3} l8 -16 l8 16`} fill="#F4EBD0" stroke={K} strokeWidth="3" />)}
          {jaw > 0.2 && <path d="M30 80 L190 92" stroke="#8E2A22" strokeWidth="10" />}
        </g>
        <path d="M-20 50 Q-30 -50 60 -60 Q190 -60 240 10 Q250 40 230 60 L10 60 Z" fill="#7A8650" stroke={K} strokeWidth="9" />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${30 + i * 26} 58 l9 18 l9 -18`} fill="#F4EBD0" stroke={K} strokeWidth="3" />)}
        <path d="M60 -40 Q100 -54 140 -40" stroke="#4A5432" strokeWidth="10" fill="none" />
        <circle cx="96" cy="-10" r="12" fill="#F2C14E" stroke={K} strokeWidth="4" />
        <circle cx="98" cy="-10" r="5" fill={K} />
        <circle cx="216" cy="12" r="5" fill={K} />
        <path d="M20 -30 Q60 -54 120 -52" stroke="#C4BE8E" strokeWidth="6" fill="none" opacity=".7" />
      </g>
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
