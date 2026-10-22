import React from 'react';

// Elementi comuni di Jurassic Park: jeep del parco, recinzione elettrica, felci e alberi della giungla, goccia d'ambra,
// elicottero, uovo. Mai persone né dinosauri vivi: si raccontano con tracce e oggetti. Nessun logo del film.

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
