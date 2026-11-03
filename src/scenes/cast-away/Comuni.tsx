import React from 'react';

// Elementi comuni di Cast Away: pallone con la faccia, pacco con le ali, palma, zattera, orologio da tasca.
// Mai personaggi: Chuck si racconta con gli oggetti. Nessun marchio (né del corriere né del pallone).

export const K = '#0E2A3A'; // contorni
export const RED = '#C8321F'; // impronta della mano sul pallone (sangue / vernice)

/** Pallone da pallavolo senza logo; `face` 0..1 fa comparire l'impronta rossa che sembra una faccia. */
export const Ball: React.FC<{ x: number; y: number; r?: number; rot?: number; face?: number; dirty?: number }> = ({ x, y, r = 70, rot = 0, face = 1, dirty = 0 }) => {
  const s = r / 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx="6" cy="64" rx="66" ry="12" fill={K} opacity=".25" />
      <circle r="70" fill="#F4EFE2" stroke={K} strokeWidth="8" />
      {/* pannelli curvi del pallone */}
      <g fill="none" stroke={K} strokeWidth="4" opacity=".75">
        <path d="M-66 -22 Q-10 -10 10 -68" />
        <path d="M-46 52 Q-4 0 58 -40" />
        <path d="M18 68 Q30 20 68 10" />
      </g>
      <path d="M-30 -56 Q-56 -36 -60 -6" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" opacity=".8" />
      <path d="M40 40 Q20 60 -10 66" fill="none" stroke="#C9C0AA" strokeWidth="10" strokeLinecap="round" opacity=".6" />
      {dirty > 0 && <circle r="70" fill="#8A7A5C" opacity={dirty * 0.35} />}
      {face > 0 && (
        <g opacity={face}>
          {/* palmo e dita: l'impronta che sembra una faccia */}
          <path d="M-28 -6 Q-30 30 -4 40 Q24 44 30 14 Q34 -10 18 -16 Q-6 -22 -28 -6 Z" fill={RED} opacity=".9" />
          <path d="M-30 -10 L-44 -46 M-14 -18 L-20 -60 M4 -20 L6 -62 M20 -14 L30 -50" stroke={RED} strokeWidth="13" strokeLinecap="round" opacity=".88" />
          <path d="M28 6 L52 -10" stroke={RED} strokeWidth="12" strokeLinecap="round" opacity=".85" />
          {/* occhi e bocca ripassati */}
          <circle cx="-12" cy="2" r="5" fill="#5A120A" />
          <circle cx="12" cy="2" r="5" fill="#5A120A" />
          <path d="M-12 22 Q0 30 12 22" fill="none" stroke="#5A120A" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

/** Ali stilizzate disegnate sul pacco (non è un marchio reale). */
export const Wings: React.FC<{ color: string; s?: number }> = ({ color, s = 1 }) => (
  <g transform={`scale(${s})`} fill={color} stroke={K} strokeWidth="3" strokeLinejoin="round">
    <path d="M-4 0 Q-30 -22 -62 -20 Q-46 -12 -50 -6 Q-36 -8 -38 0 Q-24 -2 -4 6 Z" />
    <path d="M4 0 Q30 -22 62 -20 Q46 -12 50 -6 Q36 -8 38 0 Q24 -2 4 6 Z" />
  </g>
);

/** Pacco di cartone in prospettiva, con nastro e le due ali disegnate sul fronte. */
export const Parcel: React.FC<{ x: number; y: number; w?: number; h?: number; d?: number; wings?: string; rot?: number; wet?: number }> = ({ x, y, w = 200, h = 140, d = 60, wings, rot = 0, wet = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} strokeLinejoin="round">
    <ellipse cx={w * 0.1} cy={h * 0.52} rx={w * 0.62} ry={14} fill={K} opacity=".22" />
    {/* lato e coperchio */}
    <path d={`M${w / 2} ${-h / 2} l${d} ${-d * 0.5} v${h} l${-d} ${d * 0.5} Z`} fill="#A87B4A" stroke={K} strokeWidth="7" />
    <path d={`M${-w / 2} ${-h / 2} l${d} ${-d * 0.5} h${w} l${-d} ${d * 0.5} Z`} fill="#D7AE78" stroke={K} strokeWidth="7" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#C69559" stroke={K} strokeWidth="8" />
    {/* nastro adesivo */}
    <path d={`M${-w / 2 + d / 2 + w * 0.42} ${-h / 2 - d * 0.25} l${-d / 2 + 4} ${d * 0.25} V${-h / 2 + 22}`} fill="none" stroke="#E9D6B0" strokeWidth="14" opacity=".9" />
    <path d={`M${-w / 2} ${-h / 2 + 4} H${w / 2}`} stroke="#E6C891" strokeWidth="5" opacity=".7" />
    <rect x={-w / 2 + 14} y={h / 2 - 40} width={w * 0.34} height={26} fill="#F2E8D2" stroke={K} strokeWidth="3" />
    <path d={`M${-w / 2 + 20} ${h / 2 - 30} h${w * 0.24} M${-w / 2 + 20} ${h / 2 - 22} h${w * 0.18}`} stroke="#8A7A5C" strokeWidth="3" />
    {wings && <g transform={`translate(${w * 0.12} ${-h * 0.08})`}><Wings color={wings} s={w / 200} /></g>}
    {wet > 0 && <rect x={-w / 2} y={h * 0.1} width={w} height={h * 0.4} fill="#6B4A28" opacity={wet * 0.35} />}
  </g>
);

/** Palma: tronco curvo ad anelli e foglie che ondeggiano. */
export const Palm: React.FC<{ x: number; y: number; h?: number; lean?: number; t: number; ph?: number; leaf?: string; trunk?: string; outline?: boolean }> = ({
  x, y, h = 520, lean = 120, t, ph = 0, leaf = '#2F7D5B', trunk = '#8B6A43', outline = true,
}) => {
  const sway = Math.sin(t * 1.3 + ph) * 8;
  const tx = x + lean + sway, ty = y - h;
  const st = outline ? K : 'none';
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${x - 16} ${y} Q${x + lean * 0.2} ${y - h * 0.6} ${tx - 8} ${ty} L${tx + 8} ${ty} Q${x + lean * 0.3 + 14} ${y - h * 0.6} ${x + 16} ${y} Z`} fill={trunk} stroke={st} strokeWidth="7" />
      {Array.from({ length: 7 }, (_, i) => {
        const p = (i + 1) / 8;
        const cx = x + (lean * 0.25) * p * 1.6 * (1 - p * 0.3) + sway * p;
        return <path key={i} d={`M${cx - 14} ${y - h * p} q14 8 28 0`} fill="none" stroke={outline ? '#5E4528' : trunk} strokeWidth="4" opacity=".7" />;
      })}
      {[-150, -110, -60, -20, 25, 70, 120, 160].map((a, i) => {
        const aa = a + Math.sin(t * 1.6 + ph + i) * 5;
        const rad = (aa * Math.PI) / 180;
        const L = 230 - Math.abs(Math.sin(rad)) * 40;
        const ex = tx + Math.cos(rad - Math.PI / 2) * L, ey = ty + Math.sin(rad - Math.PI / 2) * L * 0.55 + 70;
        const mx = tx + Math.cos(rad - Math.PI / 2) * L * 0.5, my = ty - 60 + Math.sin(rad - Math.PI / 2) * 30;
        return (
          <g key={i}>
            <path d={`M${tx} ${ty} Q${mx} ${my - 30} ${ex} ${ey} Q${mx} ${my + 10} ${tx} ${ty + 6} Z`} fill={leaf} stroke={st} strokeWidth="5" />
            <path d={`M${tx} ${ty + 2} Q${mx} ${my - 10} ${ex} ${ey}`} fill="none" stroke="#7BC08F" strokeWidth="3" opacity=".7" />
          </g>
        );
      })}
      <circle cx={tx - 10} cy={ty + 18} r="13" fill="#5B4127" stroke={st} strokeWidth="4" />
      <circle cx={tx + 12} cy={ty + 20} r="13" fill="#6B4E2E" stroke={st} strokeWidth="4" />
    </g>
  );
};

/** Profilo dell'isola con il picco roccioso (riempimento a gradiente passato da fuori). */
export const islandPath = (x: number, y: number, s = 1) =>
  `M${x - 520 * s} ${y} Q${x - 380 * s} ${y - 90 * s} ${x - 230 * s} ${y - 120 * s} Q${x - 120 * s} ${y - 160 * s} ${x - 60 * s} ${y - 330 * s} Q${x - 20 * s} ${y - 420 * s} ${x + 40 * s} ${y - 380 * s} Q${x + 110 * s} ${y - 300 * s} ${x + 170 * s} ${y - 180 * s} Q${x + 330 * s} ${y - 120 * s} ${x + 520 * s} ${y} Z`;

/** Zattera di tronchi con albero e vela fatta con il pannello di plastica. `sail` 0..1 la issa, `torn` la strappa. */
export const Raft: React.FC<{ t: number; sail?: number; torn?: number; ball?: boolean; accent?: string; flapAmp?: number }> = ({ t, sail = 1, torn = 0, ball = true, flapAmp = 6 }) => {
  const flap = Math.sin(t * 3) * flapAmp;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* tronchi */}
      {[-150, -100, -50, 0, 50, 100, 150].map((x, i) => (
        <g key={i}>
          <rect x={x - 24} y={-26} width="48" height="62" rx="20" fill={i % 2 ? '#8B6A43' : '#9B7A50'} stroke={K} strokeWidth="6" />
          <ellipse cx={x} cy={-18} rx="16" ry="6" fill="#C9A878" stroke={K} strokeWidth="3" />
        </g>
      ))}
      <path d="M-180 -4 H180 M-180 20 H180" stroke="#D9C49A" strokeWidth="6" />
      {/* albero e vela (pannello grigio-azzurro con i rivetti) */}
      <path d="M-20 -20 V-420" stroke={K} strokeWidth="12" />
      <path d="M-20 -20 V-420" stroke="#9B7A50" strokeWidth="6" />
      {sail > 0 && (
        <g transform={`translate(-14 ${-400 + (1 - sail) * 300}) scale(1 ${Math.max(0.05, sail)})`}>
          <path d={`M0 0 L${170 + flap} ${30} L${190 + flap * 1.4} 330 L0 340 Z`} fill="#A9C3CF" stroke={K} strokeWidth="8" />
          {torn > 0 && <path d={`M${110 + flap} 150 l40 30 l-20 40 l50 10`} fill="none" stroke={K} strokeWidth="6" opacity={torn} />}
          {torn > 0 && <path d={`M${140 + flap} 190 l60 40 l-10 60 Z`} fill="#0E2A3A" opacity={torn * 0.5} />}
          <path d={`M14 30 L${150 + flap} 54`} stroke="#DCE8EE" strokeWidth="5" opacity=".8" />
          {[60, 140, 220, 300].map((yy) => <circle key={yy} cx="16" cy={yy} r="5" fill={K} />)}
          <path d="M-10 336 L-6 -6" stroke="#E6D3A8" strokeWidth="5" strokeDasharray="10 12" />
        </g>
      )}
      {ball && <Ball x={120} y={-62} r={38} rot={-8 + Math.sin(t * 1.5) * 4} />}
      {ball && <path d="M100 -40 Q60 -10 40 0" stroke="#E6D3A8" strokeWidth="5" fill="none" />}
    </g>
  );
};

/** Orologio da tasca aperto: coperchio con una piccola foto (solo luce calda, nessun volto) e quadrante. */
export const PocketWatch: React.FC<{ x: number; y: number; s?: number; open?: number; t: number }> = ({ x, y, s = 1, open = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    <path d="M0 -92 q-16 -30 0 -40 q16 10 0 40" fill="none" stroke="#C9A24A" strokeWidth="7" />
    {/* coperchio con la foto */}
    <g transform={`translate(8 0) scale(${0.08 + 0.92 * open} 1) translate(-90 0)`}>
      <circle r="84" fill="#B38A30" stroke={K} strokeWidth="8" />
      <circle r="66" fill="#E9D7A8" stroke="#7A5A1C" strokeWidth="5" />
      <rect x="-40" y="-50" width="80" height="100" rx="8" fill="#B98C5B" stroke="#6A4A22" strokeWidth="4" opacity={open} />
      <circle cx="0" cy="-6" r="30" fill="#F1C98D" opacity={0.75 * open} />
      <circle cx="-14" cy="20" r="18" fill="#E7B074" opacity={0.6 * open} />
    </g>
    {/* cassa e quadrante */}
    <circle cx="96" r="88" fill="#D7B04E" stroke={K} strokeWidth="9" />
    <circle cx="96" r="70" fill="#F7F1E2" stroke="#8A6A22" strokeWidth="5" />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <path key={i} d={`M${96 + Math.sin(a) * 56} ${-Math.cos(a) * 56} L${96 + Math.sin(a) * 64} ${-Math.cos(a) * 64}`} stroke={K} strokeWidth={i % 3 ? 3 : 6} />;
    })}
    <path d={`M96 0 L${96 + Math.sin(t * 0.08) * 34} ${-Math.cos(t * 0.08) * 34}`} stroke={K} strokeWidth="6" strokeLinecap="round" />
    <path d={`M96 0 L${96 + Math.sin(Math.floor(t) * Math.PI / 30) * 54} ${-Math.cos(Math.floor(t) * Math.PI / 30) * 54}`} stroke="#B23A2A" strokeWidth="3" strokeLinecap="round" />
    <circle cx="96" r="6" fill={K} />
    <path d="M40 -44 Q60 -64 90 -66" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity=".7" />
  </g>
);

/** Mare mosso: fascia d'acqua con creste a punta (non sinusoidi), faccia più chiara sotto la cresta e schiuma sulle punte.
 *  Scorre di `speed` px/s e si ripete ogni `w` px; `foam` 0..1 dosa le creste bianche (tempesta = 1). */
export const Chop: React.FC<{ t: number; y: number; fill: string; face?: string; amp?: number; w?: number; speed?: number; bob?: number; ph?: number; foam?: number; foamColor?: string; line?: string }> = ({
  t, y, fill, face = '#FFFFFF', amp = 40, w = 300, speed = 60, bob = 10, ph = 0, foam = 1, foamColor = '#F2FBFC', line,
}) => {
  const x0 = -500, x1 = 1600;
  const off = -((t * speed + ph * w * 0.37) % w) - w;
  const dy = Math.sin(t * 1.7 + ph) * bob;
  let d = `M${x0} ${y}`;
  for (let x = x0; x < x1; x += w) {
    d += ` c${w * 0.32} 0 ${w * 0.44} ${-amp * 0.55} ${w * 0.5} ${-amp}`; // risale e si appuntisce
    d += ` c${w * 0.07} ${amp * 0.45} ${w * 0.22} ${amp} ${w * 0.5} ${amp}`; // ricade nel cavo
  }
  const crests = Array.from({ length: Math.ceil((x1 - x0) / w) }, (_, i) => x0 + i * w + w * 0.5);
  return (
    <g transform={`translate(${off} ${dy})`}>
      <path d={`${d} V${y + 1400} H${x0} Z`} fill={fill} />
      {/* faccia dell'onda: fascia chiara che segue la cresta */}
      <path d={d} fill="none" stroke={face} strokeWidth={amp * 0.35} strokeLinejoin="round" opacity=".12" transform={`translate(0 ${amp * 0.2})`} />
      {line && <path d={d} fill="none" stroke={line} strokeWidth="5" strokeLinejoin="round" />}
      {foam > 0.02 && crests.map((cx, i) => {
        const k = 0.75 + 0.25 * Math.sin(t * 2.3 + i * 1.9);
        return (
          <g key={i} opacity={foam * k}>
            <path d={`M${cx - w * 0.16} ${y - amp * 0.42} Q${cx - w * 0.05} ${y - amp * 1.08} ${cx + w * 0.03} ${y - amp * 0.98} Q${cx + w * 0.12} ${y - amp * 0.7} ${cx + w * 0.22} ${y - amp * 0.18} Q${cx + w * 0.06} ${y - amp * 0.5} ${cx - w * 0.16} ${y - amp * 0.42} Z`} fill={foamColor} />
            <circle cx={cx + w * 0.1} cy={y - amp * 1.15 - 8 * Math.abs(Math.sin(t * 3 + i))} r={amp * 0.07 + 2} fill={foamColor} opacity=".8" />
            <circle cx={cx - w * 0.02} cy={y - amp * 1.25 - 12 * Math.abs(Math.sin(t * 2.4 + i * 2))} r={amp * 0.05 + 2} fill={foamColor} opacity=".7" />
            <path d={`M${cx + w * 0.2} ${y - amp * 0.1} q${w * 0.08} ${amp * 0.25} ${w * 0.2} ${amp * 0.3}`} fill="none" stroke={foamColor} strokeWidth="4" strokeLinecap="round" opacity=".55" />
          </g>
        );
      })}
    </g>
  );
};
