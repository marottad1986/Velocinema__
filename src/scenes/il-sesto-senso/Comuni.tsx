import React from 'react';

// Elementi comuni di Il sesto senso: le case di Filadelfia in autunno, luce fredda azzurro-grigia; il rosso
// dell'accento (#D0342C) solo sugli oggetti toccati dall'aldilà (la maniglia della cantina, la porta della chiesa,
// il palloncino, la tenda, i numeri del volume, lo scialle) e sulle cose chiave. Mai persone: Malcolm, Cole, Anna, Lynn,
// Vincent e Kyra si raccontano con oggetti (targa del premio, porta, tenda, nastro, videocassetta, fede).
// Ogni oggetto ha materiale (gradiente con lato in luce e in ombra), bordo illuminato e dettagli da 4–6 px:
// chi lo usa passa un `id` unico e mette <SestoDefs id> nei <defs>.

export const K = '#090C10'; // contorni
export const ROSSO = '#D0342C';

/** Gradienti dei materiali comuni (una volta per scena, dentro <defs>). */
export const SestoDefs: React.FC<{ id: string }> = ({ id }) => (
  <>
    <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3A281C" /><stop offset=".45" stopColor="#6A4A32" /><stop offset="1" stopColor="#2A1C12" /></linearGradient>
    <linearGradient id={`${id}-woodv`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5A4030" /><stop offset="1" stopColor="#24180F" /></linearGradient>
    <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#C8CCC8" /><stop offset=".5" stopColor="#A6ACAA" /><stop offset="1" stopColor="#6E7676" /></linearGradient>
    <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6A4A1E" /><stop offset=".4" stopColor="#E8C878" /><stop offset=".6" stopColor="#B08838" /><stop offset="1" stopColor="#5A3E18" /></linearGradient>
    <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF2B8" /><stop offset=".35" stopColor="#E8B848" /><stop offset=".7" stopColor="#A87418" /><stop offset="1" stopColor="#F2D278" /></linearGradient>
    <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3A4248" /><stop offset=".45" stopColor="#A8B2B8" /><stop offset=".6" stopColor="#6E787E" /><stop offset="1" stopColor="#2A3036" /></linearGradient>
    <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2EEE2" /><stop offset="1" stopColor="#C8C2B0" /></linearGradient>
    <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".34" /><stop offset=".35" stopColor="#FFFFFF" stopOpacity="0" /><stop offset=".7" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="1" stopColor="#FFFFFF" stopOpacity=".14" /></linearGradient>
    <radialGradient id={`${id}-red`} cx=".35" cy=".3" r=".75"><stop offset="0" stopColor="#FF9A88" /><stop offset=".35" stopColor="#E0443A" /><stop offset=".8" stopColor="#8A1A16" /><stop offset="1" stopColor="#4A0C0A" /></radialGradient>
    <linearGradient id={`${id}-redcloth`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5A1412" /><stop offset=".3" stopColor="#B42A24" /><stop offset=".55" stopColor="#7E1C18" /><stop offset=".8" stopColor="#C2342C" /><stop offset="1" stopColor="#4A100E" /></linearGradient>
    <radialGradient id={`${id}-shadow`}><stop offset="0" stopColor="#000" stopOpacity=".55" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
    <radialGradient id={`${id}-flame`} cx=".5" cy=".7" r=".6"><stop offset="0" stopColor="#FFFBE8" /><stop offset=".45" stopColor="#FFD878" /><stop offset="1" stopColor="#E8963A" /></radialGradient>
    <radialGradient id={`${id}-frost`} cx=".5" cy="1" r="1"><stop offset="0" stopColor="#E8F6FF" stopOpacity=".85" /><stop offset=".5" stopColor="#BCDCF0" stopOpacity=".35" /><stop offset="1" stopColor="#BCDCF0" stopOpacity="0" /></radialGradient>
  </>
);

/** Ombra morbida a terra sotto un oggetto. */
export const Ombra: React.FC<{ id: string; x: number; y: number; rx: number; ry?: number; opacity?: number }> = ({ id, x, y, rx, ry = rx * 0.18, opacity = 1 }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id}-shadow)`} opacity={opacity} />
);

/** Fiamma di candela che tremola, con nucleo chiaro. Origine alla base della fiamma. */
export const Fiamma: React.FC<{ id: string; x: number; y: number; t: number; s?: number; ph?: number; bend?: number }> = ({ id, x, y, t, s = 1, ph = 0, bend = 0 }) => {
  const h = 46 + 6 * Math.sin(t * 7 + ph) + 3 * Math.sin(t * 13 + ph * 2);
  const w = 13 + 1.5 * Math.sin(t * 9 + ph);
  const tip = bend + 3 * Math.sin(t * 5 + ph);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M${-w} 0 Q${-w} ${-h * 0.45} ${tip} ${-h} Q${w} ${-h * 0.45} ${w} 0 Q0 ${w * 0.6} ${-w} 0 Z`} fill={`url(#${id}-flame)`} />
      <path d={`M${-w * 0.45} -2 Q${-w * 0.4} ${-h * 0.3} ${tip * 0.6} ${-h * 0.55} Q${w * 0.4} ${-h * 0.3} ${w * 0.45} -2 Z`} fill="#FFFFFF" opacity=".85" />
      <ellipse cx="0" cy="2" rx={w * 0.5} ry="4" fill="#5A7AC8" opacity=".6" />
    </g>
  );
};

/** Candela di cera con la fiamma; origine alla base. */
export const Candela: React.FC<{ id: string; x: number; y: number; t: number; h?: number; s?: number; ph?: number; lit?: number; bend?: number }> = ({ id, x, y, t, h = 120, s = 1, ph = 0, lit = 1, bend = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    <rect x="-16" y={-h} width="32" height={h} fill="#EEE6D2" stroke={K} strokeWidth="5" />
    <path d={`M-8 ${-h + 6} V-8`} stroke="#FFFFFF" strokeWidth="4" opacity=".6" />
    <path d={`M10 ${-h} q4 16 -2 26`} stroke="#DDD2B8" strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d={`M0 ${-h} v-10`} stroke={K} strokeWidth="3" />
    <g opacity={lit}><Fiamma id={id} x={0} y={-h - 8} t={t} ph={ph} s={0.9} bend={bend} /></g>
  </g>
);

/** Maniglia a pomolo rossa (la maniglia della cantina): sfera lucida con riflesso e rosetta d'ottone. */
export const Pomolo: React.FC<{ id: string; x: number; y: number; r?: number; turn?: number; spento?: number }> = ({ id, x, y, r = 30, turn = 0, spento = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx="0" cy="0" r={r * 1.35} fill={`url(#${id}-brass)`} stroke={K} strokeWidth="5" />
    {/* la sfera con una nervatura in rilievo e una tacca d'ottone: girando si vede ruotare */}
    <g transform={`rotate(${turn * 90})`}>
      <circle cx="0" cy="0" r={r} fill={`url(#${id}-red)`} stroke={K} strokeWidth="6" />
      {spento > 0 && <circle cx="0" cy="0" r={r} fill={`url(#${id}-brass)`} opacity={spento} stroke={K} strokeWidth="6" />}
      <path d={`M${-r * 0.92} 0 H${r * 0.92}`} stroke={K} strokeWidth={r * 0.32} strokeLinecap="round" />
      <path d={`M${-r * 0.88} 0 H${r * 0.88}`} stroke="#E8C878" strokeWidth={r * 0.16} strokeLinecap="round" />
      <circle cx={r * 0.62} cy="0" r={r * 0.14} fill="#FFF2C8" stroke={K} strokeWidth="2" />
    </g>
    <ellipse cx={-r * 0.32} cy={-r * 0.42} rx={r * 0.3} ry={r * 0.16} fill="#FFFFFF" opacity=".7" transform={`rotate(-30 ${-r * 0.32} ${-r * 0.42})`} />
  </g>
);

/**
 * Porta a pannelli di legno verniciato con stipite e pomolo rosso. Origine in basso a sinistra.
 * `turn` gira il pomolo, `open` 0–1 la apre verso l'interno (si stringe) e lascia passare la luce `behind`.
 */
export const Porta: React.FC<{ id: string; x: number; y: number; w?: number; h?: number; turn?: number; open?: number; behind?: string; paint?: string; knob?: number; spento?: number; dx?: number }> = ({ id, x, y, w = 330, h = 700, turn = 0, open = 0, behind = '#BCD8F0', paint, knob = 26, spento = 0, dx = 0 }) => (
  <g strokeLinejoin="round">
    <rect x={x - 34} y={y - h - 34} width={w + 68} height={h + 34} fill={`url(#${id}-woodv)`} stroke={K} strokeWidth="9" />
    <path d={`M${x - 24} ${y} V${y - h - 24} H${x + w + 24}`} stroke="#9A8064" strokeWidth="4" fill="none" opacity=".55" />
    <rect x={x} y={y - h} width={w} height={h} fill="#05070A" stroke={K} strokeWidth="6" />
    {open > 0 && <rect x={x} y={y - h} width={w} height={h} fill={behind} opacity={0.85 * open} />}
    <g transform={`translate(${x} ${y - h}) scale(${1 - open * 0.8} 1)`}>
      <rect x="0" y="0" width={w} height={h} fill={paint ?? `url(#${id}-paint)`} stroke={K} strokeWidth="9" />
      {[0, 1].map((c) => [0, 1, 2].map((r) => {
        const pw = (w - 72) / 2, hs = [h * 0.3, h * 0.16, h * 0.34];
        const py = 30 + (r > 0 ? hs[0] + 24 : 0) + (r > 1 ? hs[1] + 24 : 0);
        const px = 24 + c * (pw + 24);
        return (
          <g key={`${r}${c}`}>
            <rect x={px} y={py} width={pw} height={hs[r]} fill="#000" opacity=".1" stroke="#3E4444" strokeWidth="6" />
            <path d={`M${px + 4} ${py + hs[r] - 4} V${py + 4} H${px + pw - 4}`} stroke="#FFFFFF" strokeWidth="3" fill="none" opacity=".45" />
          </g>
        );
      }))}
      {[0.1, 0.86].map((k) => <rect key={k} x="-8" y={h * k} width="18" height="52" fill="#3A3E40" stroke={K} strokeWidth="4" />)}
      <Pomolo id={id} x={w - 52 + dx} y={h * 0.54} r={knob} turn={turn} spento={spento} />
      <rect x={w - 60} y={h * 0.54 + 44} width="16" height="26" rx="4" fill="#1A1A1A" stroke={K} strokeWidth="3" />
    </g>
  </g>
);

/** Brina che si allarga da un bordo: rametti di ghiaccio sottili e un velo chiaro. `p` 0–1 la fa crescere. */
export const Brina: React.FC<{ id: string; x: number; y: number; w: number; p: number; up?: boolean; seed?: number }> = ({ id, x, y, w, p, up = true, seed = 3 }) => {
  const n = 14;
  const dir = up ? -1 : 1;
  return (
    <g opacity={Math.min(1, p * 1.4)}>
      <ellipse cx={x + w / 2} cy={y} rx={w * 0.6} ry={160 * p + 10} fill={`url(#${id}-frost)`} opacity=".7" />
      {Array.from({ length: n }, (_, i) => {
        const bx = x + (w * (i + 0.5)) / n + Math.sin(i * 7.3 + seed) * 10;
        const L = (60 + 70 * Math.abs(Math.sin(i * 3.1 + seed))) * p;
        const a = Math.sin(i * 5.7 + seed) * 0.5;
        const ex = bx + Math.sin(a) * L, ey = y + dir * Math.cos(a) * L;
        const mx = (bx + ex) / 2, my = (y + ey) / 2;
        return (
          <g key={i} stroke="#E6F4FF" strokeLinecap="round" fill="none" opacity=".55">
            <path d={`M${bx} ${y} L${ex} ${ey}`} strokeWidth="3" />
            <path d={`M${mx} ${my} l${-14 * p} ${dir * 14 * p} M${mx} ${my} l${14 * p} ${dir * 12 * p}`} strokeWidth="2" />
          </g>
        );
      })}
    </g>
  );
};
