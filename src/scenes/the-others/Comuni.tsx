import React from 'react';
import { Glow } from '../../lib/elements';

// Elementi comuni di The Others: la villa vittoriana nella nebbia (finestre con le tende chiuse), la lampada a petrolio
// (la sola luce della casa: l'ambra dell'accento va sulla sua fiamma e sugli oggetti chiave), la porta a pannelli con la
// chiave, la tenda pesante. Mai persone: Grace, i bambini, i domestici e i vivi si raccontano con oggetti e luci.
// Ogni oggetto ha materiale (gradiente con lato in luce e lato in ombra), bordo illuminato e dettagli da 4–6 px:
// chi lo usa passa un `id` unico per i gradienti e mette <OthersDefs id> nei <defs>.

export const K = '#0A0D0E'; // contorni
export const AMBRA = '#E8A848';

/** Gradienti dei materiali comuni (una volta per scena, dentro <defs>). */
export const OthersDefs: React.FC<{ id: string }> = ({ id }) => (
  <>
    <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7A807A" /><stop offset=".5" stopColor="#5E6460" /><stop offset="1" stopColor="#3C423F" /></linearGradient>
    <linearGradient id={`${id}-stone2`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5A605C" /><stop offset=".6" stopColor="#464C49" /><stop offset="1" stopColor="#2E3331" /></linearGradient>
    <linearGradient id={`${id}-roof`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A3032" /><stop offset="1" stopColor="#1A1E20" /></linearGradient>
    <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3A2618" /><stop offset=".45" stopColor="#6A4428" /><stop offset="1" stopColor="#2E1E12" /></linearGradient>
    <linearGradient id={`${id}-woodv`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5E3E24" /><stop offset="1" stopColor="#2E1E12" /></linearGradient>
    <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6A4A1E" /><stop offset=".4" stopColor="#E8C878" /><stop offset=".6" stopColor="#B08838" /><stop offset="1" stopColor="#5A3E18" /></linearGradient>
    <linearGradient id={`${id}-velvet`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1E2A24" /><stop offset=".3" stopColor="#3A4E40" /><stop offset=".55" stopColor="#24342C" /><stop offset=".8" stopColor="#3A4E40" /><stop offset="1" stopColor="#18221E" /></linearGradient>
    <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2EAD4" /><stop offset="1" stopColor="#D8CCAA" /></linearGradient>
    <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".32" /><stop offset=".35" stopColor="#FFFFFF" stopOpacity="0" /><stop offset=".7" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="1" stopColor="#FFFFFF" stopOpacity=".12" /></linearGradient>
    <linearGradient id={`${id}-chim`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFF4D8" stopOpacity=".5" /><stop offset=".3" stopColor="#FFFFFF" stopOpacity=".15" /><stop offset=".75" stopColor="#FFFFFF" stopOpacity=".05" /><stop offset="1" stopColor="#FFF4D8" stopOpacity=".4" /></linearGradient>
    <radialGradient id={`${id}-shadow`}><stop offset="0" stopColor="#000" stopOpacity=".55" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
    <radialGradient id={`${id}-flame`} cx=".5" cy=".7" r=".6"><stop offset="0" stopColor="#FFFBE8" /><stop offset=".45" stopColor="#FFD878" /><stop offset="1" stopColor={AMBRA} /></radialGradient>
  </>
);

/** Ombra morbida a terra sotto un oggetto. */
export const Ombra: React.FC<{ id: string; x: number; y: number; rx: number; ry?: number; opacity?: number }> = ({ id, x, y, rx, ry = rx * 0.18, opacity = 1 }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id}-shadow)`} opacity={opacity} />
);

/** Fiamma della lampada: goccia che tremola, con nucleo chiaro. Origine alla base della fiamma. */
export const Fiamma: React.FC<{ id: string; x: number; y: number; t: number; s?: number; ph?: number; bend?: number }> = ({ id, x, y, t, s = 1, ph = 0, bend = 0 }) => {
  const h = 46 + 6 * Math.sin(t * 7 + ph) + 3 * Math.sin(t * 13 + ph * 2);
  const w = 14 + 1.5 * Math.sin(t * 9 + ph);
  const tip = bend + 3 * Math.sin(t * 5 + ph);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M${-w} 0 Q${-w} ${-h * 0.45} ${tip} ${-h} Q${w} ${-h * 0.45} ${w} 0 Q0 ${w * 0.6} ${-w} 0 Z`} fill={`url(#${id}-flame)`} />
      <path d={`M${-w * 0.45} -2 Q${-w * 0.4} ${-h * 0.3} ${tip * 0.6} ${-h * 0.55} Q${w * 0.4} ${-h * 0.3} ${w * 0.45} -2 Z`} fill="#FFFFFF" opacity=".85" />
      <ellipse cx="0" cy="2" rx={w * 0.5} ry="4" fill="#5A7AC8" opacity=".6" />
    </g>
  );
};

/**
 * Lampada a petrolio: piede d'ottone, serbatoio di vetro col petrolio, bruciatore, tubo di vetro con la fiamma e alone.
 * Origine sotto il piede, al centro. `lit` 0–1 accende la fiamma; `flick` aggiunge un tremolio dell'alone.
 */
export const Lampada: React.FC<{ id: string; x: number; y: number; t: number; s?: number; lit?: number; glow?: number; ph?: number; bend?: number }> = ({ id, x, y, t, s = 1, lit = 1, glow = 1, ph = 0, bend = 0 }) => {
  const fl = 0.9 + 0.06 * Math.sin(t * 11 + ph) + 0.04 * Math.sin(t * 23 + ph);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
      <Glow id={`${id}-lg${Math.round(ph * 10)}`} x={0} y={-210} r={420} t={t} color="#FFC870" amp={0.05} rate={9} ph={ph} opacity={0.62 * lit * glow * fl} />
      <Ombra id={id} x={0} y={2} rx={110} ry={16} />
      {/* piede */}
      <path d="M-70 0 Q-70 -22 -40 -28 H40 Q70 -22 70 0 Z" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="6" />
      <path d="M-22 -28 Q-28 -60 -12 -78 H12 Q28 -60 22 -28 Z" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="5" />
      {/* serbatoio di vetro con il petrolio */}
      <path d="M-62 -100 Q-74 -150 -40 -170 H40 Q74 -150 62 -100 Q40 -76 0 -76 Q-40 -76 -62 -100 Z" fill="#7A5A2A" stroke={K} strokeWidth="6" />
      <path d="M-60 -120 Q0 -110 60 -120 Q58 -98 40 -86 Q0 -78 -40 -86 Q-58 -98 -60 -120 Z" fill="#C8902E" opacity=".85" />
      <path d="M-48 -150 Q-56 -120 -40 -98" stroke="#FFFFFF" strokeWidth="6" fill="none" opacity=".45" strokeLinecap="round" />
      {/* bruciatore con la rotella */}
      <path d="M-40 -170 H40 L34 -196 H-34 Z" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="5" />
      <circle cx="46" cy="-184" r="9" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="4" />
      {/* tubo di vetro: pancia e collo */}
      <path d="M-30 -196 Q-52 -236 -30 -270 Q-18 -290 -18 -320 V-380 H18 V-320 Q18 -290 30 -270 Q52 -236 30 -196 Z" fill={`url(#${id}-chim)`} stroke={K} strokeWidth="5" />
      <g opacity={lit}>
        <Fiamma id={id} x={0} y={-206} t={t} ph={ph} bend={bend} />
      </g>
      <path d="M-34 -232 Q-40 -260 -22 -280" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".6" strokeLinecap="round" />
      <path d="M-10 -310 V-372" stroke="#FFFFFF" strokeWidth="4" opacity=".5" strokeLinecap="round" />
      <path d="M-20 -380 H20" stroke={K} strokeWidth="5" />
    </g>
  );
};

type Win = { x: number; y: number; w: number; h: number };
// Finestre della villa (coordinate con origine in basso al centro): ali a due piani, corpo centrale a tre piani.
const WINS: Win[] = [
  // ala sinistra
  { x: -362, y: -300, w: 62, h: 104 }, { x: -262, y: -300, w: 62, h: 104 },
  { x: -362, y: -160, w: 62, h: 104 }, { x: -262, y: -160, w: 62, h: 104 },
  // ala destra
  { x: 200, y: -300, w: 62, h: 104 }, { x: 300, y: -300, w: 62, h: 104 },
  { x: 200, y: -160, w: 62, h: 104 }, { x: 300, y: -160, w: 62, h: 104 },
  // corpo centrale: piano alto e piano nobile
  { x: -136, y: -400, w: 60, h: 100 }, { x: -30, y: -400, w: 60, h: 100 }, { x: 76, y: -400, w: 60, h: 100 },
  { x: -136, y: -270, w: 60, h: 100 }, { x: 76, y: -270, w: 60, h: 100 },
];
export const VILLA_WINDOWS = WINS;

/**
 * Villa vittoriana di pietra: corpo centrale con frontone e finestra tonda, due ali, tetti ripidi con comignoli,
 * portico con colonne e scalini, edera. Origine in basso al centro, larga 800 px e alta 600 px a scala 1.
 * `lit[i]` (0–1) accende la finestra i (luce calda dietro le tende); `open` (0–1) apre le tende di tutte le finestre.
 */
export const Villa: React.FC<{ id: string; x: number; y: number; t: number; s?: number; lit?: number[]; open?: number; door?: number }> = ({ id, x, y, t, s = 1, lit = [], open = 0, door = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    <Ombra id={id} x={0} y={6} rx={470} ry={34} />
    {/* comignoli */}
    {[[-330, -470], [316, -470], [-70, -600], [52, -600]].map(([cx, cy], i) => (
      <g key={`c${i}`}>
        <rect x={cx} y={cy} width="34" height={i < 2 ? 70 : 80} fill={`url(#${id}-stone2)`} stroke={K} strokeWidth="6" />
        <rect x={cx - 6} y={cy - 12} width="46" height="14" fill="#3A403E" stroke={K} strokeWidth="5" />
      </g>
    ))}
    {/* tetti delle ali */}
    <path d="M-418 -332 L-372 -440 H-176 L-160 -332 Z" fill={`url(#${id}-roof)`} stroke={K} strokeWidth="8" />
    <path d="M418 -332 L372 -440 H176 L160 -332 Z" fill={`url(#${id}-roof)`} stroke={K} strokeWidth="8" />
    {[-400, -380, -360].map((yy, i) => <path key={`rl${i}`} d={`M${-408 + i * 12} ${yy + 50} H${-172}`} stroke="#000" strokeWidth="3" opacity=".3" />)}
    {[-400, -380, -360].map((yy, i) => <path key={`rr${i}`} d={`M${408 - i * 12} ${yy + 50} H${172}`} stroke="#000" strokeWidth="3" opacity=".3" />)}
    {/* ali */}
    <rect x="-400" y="-332" width="236" height="332" fill={`url(#${id}-stone)`} stroke={K} strokeWidth="8" />
    <rect x="164" y="-332" width="236" height="332" fill={`url(#${id}-stone2)`} stroke={K} strokeWidth="8" />
    {/* corpo centrale e frontone */}
    <path d="M-176 -440 L0 -560 L176 -440 Z" fill={`url(#${id}-roof)`} stroke={K} strokeWidth="8" />
    <rect x="-176" y="-450" width="352" height="450" fill={`url(#${id}-stone)`} stroke={K} strokeWidth="8" />
    <path d="M-150 -452 L0 -540 L150 -452 Z" fill={`url(#${id}-stone2)`} stroke={K} strokeWidth="6" />
    <circle cx="0" cy="-486" r="22" fill="#141A1C" stroke={K} strokeWidth="5" />
    <path d="M-22 -486 H22 M0 -508 V-464" stroke="#5E6460" strokeWidth="4" />
    {/* corsi di pietra, cornici marcapiano e cantonali */}
    {Array.from({ length: 15 }, (_, i) => <path key={`k${i}`} d={`M-400 ${-20 - i * 22} H400`} stroke="#000" strokeWidth="2" opacity=".14" />)}
    {[-336, -206].map((yy) => <path key={yy} d={`M-404 ${yy} H404`} stroke="#9AA09A" strokeWidth="6" opacity=".55" />)}
    {[-400, -176, 164, 380].map((qx) => Array.from({ length: 8 }, (_, i) => <rect key={`q${qx}${i}`} x={qx + (i % 2 ? 0 : 0)} y={-40 - i * 40} width={i % 2 ? 20 : 30} height="20" fill="#8A908A" opacity=".35" />))}
    <path d="M-396 -330 V-4" stroke="#B8C0B8" strokeWidth="4" opacity=".45" />
    {/* finestre: telaio di pietra, vetri a ghigliottina, tende pesanti chiuse (o aperte) */}
    {WINS.map((wd, i) => {
      const l = lit[i] ?? 0;
      const g = 1 - open * 0.78; // larghezza di ogni tenda (metà finestra quando chiusa)
      return (
        <g key={`w${i}`}>
          <rect x={wd.x - 8} y={wd.y - 14} width={wd.w + 16} height="12" fill="#8A908A" stroke={K} strokeWidth="4" />
          <rect x={wd.x} y={wd.y} width={wd.w} height={wd.h} fill={open > 0 ? '#9AA6A4' : '#0E1214'} stroke={K} strokeWidth="5" />
          {open > 0 && <rect x={wd.x} y={wd.y} width={wd.w} height={wd.h} fill="#D8E2DE" opacity={open * 0.55} />}
          {l > 0 && <rect x={wd.x} y={wd.y} width={wd.w} height={wd.h} fill="#FFC870" opacity={l * (0.85 + 0.15 * Math.sin(t * 6 + i))} />}
          <path d={`M${wd.x} ${wd.y} h${(wd.w / 2) * g} q${-6} ${wd.h * 0.5} 0 ${wd.h} h${(-wd.w / 2) * g} Z`} fill={l > 0 ? '#7A3A1E' : '#1A2420'} opacity={l > 0 ? 0.75 : 1} />
          <path d={`M${wd.x + wd.w} ${wd.y} h${(-wd.w / 2) * g} q6 ${wd.h * 0.5} 0 ${wd.h} h${(wd.w / 2) * g} Z`} fill={l > 0 ? '#7A3A1E' : '#1A2420'} opacity={l > 0 ? 0.75 : 1} />
          <path d={`M${wd.x + wd.w / 2} ${wd.y} V${wd.y + wd.h} M${wd.x} ${wd.y + wd.h * 0.5} H${wd.x + wd.w}`} stroke="#5A605C" strokeWidth="4" />
          <rect x={wd.x} y={wd.y} width={wd.w} height={wd.h} fill="none" stroke={K} strokeWidth="5" />
          <rect x={wd.x - 10} y={wd.y + wd.h} width={wd.w + 20} height="10" fill="#8A908A" stroke={K} strokeWidth="4" />
        </g>
      );
    })}
    {/* portico: colonne, architrave, frontoncino, porta e scalini */}
    <rect x="-60" y="-150" width="120" height="150" fill="#1A1210" stroke={K} strokeWidth="6" />
    <g transform={`translate(-52 -142) scale(${1 - door * 0.7} 1)`}>
      <rect x="0" y="0" width="104" height="142" fill={`url(#${id}-wood)`} stroke={K} strokeWidth="5" />
      {[[10, 10], [56, 10], [10, 78], [56, 78]].map(([px, py], i) => <rect key={i} x={px} y={py} width="38" height="54" fill="none" stroke="#1E140C" strokeWidth="4" />)}
      <circle cx="86" cy="76" r="6" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="3" />
    </g>
    {door > 0 && <rect x="-44" y="-140" width={90 * door} height="140" fill="#FFC870" opacity={0.75 * door} />}
    {[-96, 70].map((cx) => (
      <g key={cx}>
        <rect x={cx} y="-178" width="26" height="178" fill={`url(#${id}-stone)`} stroke={K} strokeWidth="6" />
        <rect x={cx - 6} y="-188" width="38" height="12" fill="#8A908A" stroke={K} strokeWidth="4" />
      </g>
    ))}
    <rect x="-116" y="-206" width="232" height="22" fill="#8A908A" stroke={K} strokeWidth="6" />
    <path d="M-120 -206 L0 -246 L120 -206 Z" fill={`url(#${id}-stone2)`} stroke={K} strokeWidth="6" />
    {[0, 1, 2].map((i) => <rect key={`s${i}`} x={-130 - i * 18} y={-4 + i * 12} width={260 + i * 36} height="12" fill="#6A706C" stroke={K} strokeWidth="4" />)}
    {/* edera sull'ala sinistra */}
    {Array.from({ length: 22 }, (_, i) => {
      const ix = -400 + ((i * 37) % 120), iy = -20 - ((i * 53) % 280);
      return <circle key={`e${i}`} cx={ix} cy={iy} r={16 + (i % 3) * 6} fill={i % 2 ? '#1E3226' : '#2A4232'} stroke={K} strokeWidth="3" />;
    })}
  </g>
);

/**
 * Tenda pesante di velluto con le pieghe, appesa in alto (x, y) larga w e alta h. `pull` 0–1 la raccoglie verso
 * il lato `side` (la tenda si stringe); `sway` la fa ondeggiare in fondo.
 */
export const Tenda: React.FC<{ id: string; x: number; y: number; w: number; h: number; t: number; pull?: number; side?: 'left' | 'right'; sway?: number; folds?: number }> = ({ id, x, y, w, h, t, pull = 0, side = 'left', sway = 0, folds = 5 }) => {
  const ww = w * (1 - pull * 0.72);
  const x0 = side === 'left' ? x : x + w - ww;
  const sw = sway * Math.sin(t * 0.9);
  return (
    <g strokeLinejoin="round">
      <path d={`M${x0} ${y} H${x0 + ww} Q${x0 + ww + 6 + sw} ${y + h * 0.6} ${x0 + ww + sw * 2} ${y + h} H${x0 + sw * 2} Q${x0 - 6 + sw} ${y + h * 0.6} ${x0} ${y} Z`} fill={`url(#${id}-velvet)`} stroke={K} strokeWidth="8" />
      {Array.from({ length: folds }, (_, i) => {
        const fx = x0 + (ww * (i + 0.5)) / folds;
        return (
          <g key={i}>
            <path d={`M${fx} ${y + 20} Q${fx - 10 + sw} ${y + h * 0.55} ${fx + sw * 2} ${y + h - 6}`} stroke="#0E1612" strokeWidth="6" fill="none" opacity=".75" />
            <path d={`M${fx + ww / folds / 3} ${y + 30} Q${fx + ww / folds / 3 - 8 + sw} ${y + h * 0.55} ${fx + ww / folds / 3 + sw * 2} ${y + h - 10}`} stroke="#6A8A74" strokeWidth="4" fill="none" opacity=".35" />
          </g>
        );
      })}
      <path d={`M${x0 + sw * 2} ${y + h - 18} H${x0 + ww + sw * 2}`} stroke="#B08838" strokeWidth="8" opacity=".7" />
    </g>
  );
};

/**
 * Porta a sei pannelli in legno scuro con stipite, cardini, maniglia d'ottone e serratura con la chiave.
 * Origine in basso a sinistra. `key` 0–1 fa girare la chiave di un quarto di giro; `open` 0–1 la socchiude (luce dietro).
 */
export const Porta: React.FC<{ id: string; x: number; y: number; w?: number; h?: number; turn?: number; withKey?: boolean; open?: number; behind?: string }> = ({ id, x, y, w = 300, h = 620, turn = 0, withKey = true, open = 0, behind = '#FFC870' }) => (
  <g strokeLinejoin="round">
    {/* stipite */}
    <rect x={x - 30} y={y - h - 30} width={w + 60} height={h + 30} fill={`url(#${id}-woodv)`} stroke={K} strokeWidth="8" />
    <rect x={x} y={y - h} width={w} height={h} fill="#0A0806" stroke={K} strokeWidth="6" />
    {open > 0 && <rect x={x} y={y - h} width={w} height={h} fill={behind} opacity={0.7 * open} />}
    <g transform={`translate(${x} ${y - h}) scale(${1 - open * 0.55} 1)`}>
      <rect x="0" y="0" width={w} height={h} fill={`url(#${id}-wood)`} stroke={K} strokeWidth="8" />
      {[0, 1, 2].map((r) => [0, 1].map((c) => {
        const pw = (w - 66) / 2, u = h - 90, hs = [u * 0.4, u * 0.2, u * 0.4];
        const ph = hs[r], py = 24 + (r > 0 ? hs[0] + 21 : 0) + (r > 1 ? hs[1] + 21 : 0);
        const px = 22 + c * (pw + 22);
        return (
          <g key={`${r}${c}`}>
            <rect x={px} y={py} width={pw} height={ph} fill="none" stroke="#1E140C" strokeWidth="7" />
            <rect x={px + 10} y={py + 10} width={pw - 20} height={ph - 20} fill="#000" opacity=".12" />
            <path d={`M${px + 4} ${py + ph - 4} V${py + 4} H${px + pw - 4}`} stroke="#A07850" strokeWidth="3" fill="none" opacity=".6" />
          </g>
        );
      }))}
      {/* cardini */}
      {[0.12, 0.85].map((k) => <rect key={k} x="-8" y={h * k} width="20" height="50" fill="#3A3E40" stroke={K} strokeWidth="4" />)}
      {/* maniglia e bocchetta della serratura */}
      <g transform={`translate(${w - 46} ${h * 0.52})`}>
        <rect x="-18" y="-60" width="36" height="120" rx="8" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="5" />
        <circle cx="0" cy="-26" r="16" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="5" />
        <path d="M0 18 m-6 0 a6 6 0 1 1 12 0 l4 22 h-20 Z" fill="#0A0806" />
        {withKey && (
          <g transform={`translate(0 24) rotate(${turn * 90})`}>
            <rect x="-4" y="-4" width="8" height="8" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="2" />
            <g>
              <rect x="-5" y="0" width="10" height="46" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="3" />
              <circle cx="0" cy="62" r="18" fill="none" stroke={K} strokeWidth="11" />
              <circle cx="0" cy="62" r="18" fill="none" stroke="#D8B868" strokeWidth="6" />
            </g>
          </g>
        )}
      </g>
    </g>
  </g>
);

/** Mazzo di chiavi d'ottone su un anello (appeso o a terra). Origine all'anello. */
export const Chiavi: React.FC<{ id: string; x: number; y: number; s?: number; rot?: number; swing?: number; t?: number }> = ({ id, x, y, s = 1, rot = 0, swing = 0, t = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot + swing * Math.sin(t * 2.2)}) scale(${s})`} strokeLinejoin="round">
    <circle cx="0" cy="0" r="26" fill="none" stroke={K} strokeWidth="10" />
    <circle cx="0" cy="0" r="26" fill="none" stroke="#C8A050" strokeWidth="5" />
    {[-34, -10, 14, 36].map((a, i) => (
      <g key={i} transform={`rotate(${a}) translate(0 26)`}>
        <circle cx="0" cy="14" r="13" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="4" />
        <circle cx="0" cy="14" r="4" fill={K} />
        <rect x="-4" y="26" width="8" height={60 + i * 8} fill={`url(#${id}-brass)`} stroke={K} strokeWidth="3" />
        <path d={`M4 ${70 + i * 8} h10 v8 h-6 v6 h6 v8 h-10`} fill={`url(#${id}-brass)`} stroke={K} strokeWidth="3" />
      </g>
    ))}
  </g>
);
