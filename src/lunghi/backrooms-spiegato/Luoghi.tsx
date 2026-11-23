import React from 'react';
import { clamp01, lerp, rng } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { neonAt } from '../../lib/liminale';

// I luoghi del mondo di Backrooms spiegato, in sezione (come una casa delle bambole tagliata): in superficie, di notte,
// la casa del forum, il negozio di mobili di Clark (con il seminterrato e la fessura), lo studio di Mary con il contorno
// tratteggiato della casa demolita, l'istituto Async (laboratorio sotterraneo con l'anello, sala monitor, stanzetta degli
// interrogatori) e il cinema; sotto la terra il Livello 0, una fila infinita di stanze gialle, e più giù i livelli della
// leggenda (parcheggio, tunnel). Coordinate del mondo: y = 0 è il livello della strada, y > 0 sotto terra.
// Nessuna persona: i personaggi sono cerchi con un oggetto (Mondo.tsx).

export const INK = '#1C170C';
export const PAPER = '#F4E9B8';
export const YEL = '#D8C46A';
export const YEL_D = '#8E7A30';
export const NEON = '#FFFBE6';
export const RED = '#E0443A';
export const NIGHT = '#0C0E18';
export const COPY = '#B8B2A0'; // il grigio delle copie
export const ASYNC = '#7FC6D8'; // il colore freddo di Async
export const SOIL = '#1E1810';

export const mix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp01(k))).toString(16).padStart(2, '0')).join('');
};

// ---------------------------------------------------------------------------------------------------------------- mappa

export const L0 = { top: 380, bot: 640 } as const; // Livello 0: soffitto e pavimento
export const L1 = { top: 820, bot: 1040 } as const; // Livello 1 (parcheggio)
export const L2 = { top: 1200, bot: 1340 } as const; // Livello 2 (tunnel)
export const X = {
  forum: 300, negozio: 2000, fessura: 2560, studio: 3350, casaMary: 3950, async: 5200, anello: 5000, monitor: 5500, stanzetta: 5980, cinema: 7000,
  tavola: 3696, kat: 2950, copiaNeg: 4400, copiaStudio: 4900, copiaStanza: 6000,
} as const;
/** Stanze del Livello 0 in sezione: inizio x e larghezza. */
const r0 = rng(2019);
export const STANZE: { x: number; w: number; door: number; lamp: number }[] = [];
for (let x = -1400; x < 9200;) {
  const w = 260 + Math.round(r0() * 260);
  STANZE.push({ x, w, door: 0.25 + r0() * 0.5, lamp: Math.floor(r0() * 1000) });
  x += w;
}
export const stanzaDi = (x: number) => STANZE.find((s) => x >= s.x && x < s.x + s.w) ?? STANZE[0];

// ---------------------------------------------------------------------------------------------------------------- pezzi

const O = { stroke: INK, strokeWidth: 6, strokeLinejoin: 'round' as const };
const o = { stroke: INK, strokeWidth: 3.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

/** Finestra illuminata (o spenta). */
const Finestra: React.FC<{ x: number; y: number; w: number; h: number; on: number; c?: string }> = ({ x, y, w, h, on, c = '#F2D58A' }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={mix('#1A1C28', c, on)} {...o} />
    <path d={`M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}`} {...o} strokeWidth={2.5} />
  </g>
);

/** Neon a soffitto in sezione: barra con l'alone che scende. */
export const NeonSez: React.FC<{ x: number; y: number; w?: number; on: number; id: string }> = ({ x, y, w = 70, on, id }) => (
  <g>
    <defs>
      <linearGradient id={`${id}-c`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFF4B8" stopOpacity={0.5 * on} />
        <stop offset="1" stopColor="#FFF4B8" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d={`M${x - w / 2} ${y + 8} L${x - w * 1.4} ${y + 230} H${x + w * 1.4} L${x + w / 2} ${y + 8} Z`} fill={`url(#${id}-c)`} />
    <rect x={x - w / 2} y={y} width={w} height={9} rx={2} fill={mix('#9E8E58', NEON, on)} stroke={INK} strokeWidth={2.5} />
  </g>
);

/** Divano (negozio e copie). */
export const Divano: React.FC<{ x: number; y: number; c?: string; tag?: string; s?: number; storto?: number }> = ({ x, y, c = '#B0573A', tag, s = 1, storto = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) skewX(${storto * 14})`}>
    <path d="M-80 0 V-52 Q-80 -66 -66 -66 H66 Q80 -66 80 -52 V0" fill={mix(c, '#000000', 0.15)} {...o} />
    <rect x={-92} y={-38} width={184} height={30} rx={10} fill={c} {...o} />
    <rect x={-100} y={-50} width={22} height={46} rx={8} fill={c} {...o} />
    <rect x={78} y={-50} width={22} height={46} rx={8} fill={c} {...o} />
    <path d="M-84 -4 V6 M84 -4 V6" {...o} />
    {tag && (
      <g transform="translate(40 -70) rotate(8)">
        <path d="M0 -14 L40 -14 L50 0 L40 14 L0 14 Z" fill={PAPER} {...o} strokeWidth={2.5} />
        <circle cx={40} cy={0} r={3} fill={INK} />
        <text x={18} y={6} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={15} fill={INK}>{tag}</text>
      </g>
    )}
  </g>
);

/** Lampada a stelo. */
const Lampada: React.FC<{ x: number; y: number; on?: number }> = ({ x, y, on = 1 }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M0 0 V-120 M-16 0 H16" {...o} />
    <path d="M-24 -118 L-14 -150 H14 L24 -118 Z" fill={mix('#6A5A3A', '#F6DFA0', on)} {...o} />
  </g>
);

/** Letto (quello in vendita in cui dorme Clark). */
const Letto: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-90} y={-34} width={180} height={26} rx={6} fill="#E8E2CC" {...o} />
    <rect x={-96} y={-70} width={18} height={70} rx={4} fill="#7A5A3A" {...o} />
    <rect x={-74} y={-50} width={44} height={18} rx={8} fill="#F6F2E2" {...o} strokeWidth={2.5} />
    <path d="M-30 -36 Q20 -48 88 -36 V-14 H-30 Z" fill="#5A6E9A" {...o} />
  </g>
);

/** Cappello da pirata (la mascotte del negozio: mai una figura, solo il cappello). */
export const Cappello: React.FC<{ x: number; y: number; s?: number; rot?: number; c?: string }> = ({ x, y, s = 1, rot = 0, c = '#1E1A22' }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-70 10 Q-60 -40 -20 -46 Q0 -62 20 -46 Q60 -40 70 10 Q0 -6 -70 10 Z" fill={c} {...o} />
    <path d="M-66 4 Q0 -12 66 4" fill="none" stroke="#D8B04A" strokeWidth={4} />
    <g transform="translate(0 -24)">
      <circle r={11} fill="#F4F0E4" {...o} strokeWidth={2.5} />
      <circle cx={-4} cy={-1} r={2.6} fill={INK} /><circle cx={4} cy={-1} r={2.6} fill={INK} />
      <path d="M-14 12 L14 20 M14 12 L-14 20" stroke="#F4F0E4" strokeWidth={4} strokeLinecap="round" />
    </g>
  </g>
);

/** Insegna del negozio con il cappello da pirata. */
const Insegna: React.FC<{ x: number; y: number; T: number }> = ({ x, y, T }) => {
  const on = neonAt(T, 3, 11, 0.6);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-30 60 V0 M30 60 V0" {...O} strokeWidth={5} />
      <rect x={-200} y={-90} width={400} height={96} rx={14} fill="#2A1E16" {...O} />
      <rect x={-190} y={-80} width={380} height={76} rx={10} fill="none" stroke={mix('#5A3A2A', '#F2B04A', on)} strokeWidth={4} />
      <Cappello x={-140} y={-34} s={0.7} />
      <text x={40} y={-26} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={42} fill={mix('#6A4A30', '#F6C870', on)} letterSpacing="4">MOBILI</text>
      <text x={40} y={-2} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={18} fill={mix('#5A4A3A', '#F4E9B8', on)} letterSpacing="3">TUTTO DEVE ANDARE</text>
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------------- superficie

/** La casa da cui parte la discussione del 2019: una stanza con la scrivania e il vecchio computer acceso. */
export const CasaForum: React.FC<{ T: number; griglia: number }> = ({ T, griglia }) => {
  const x0 = X.forum - 330;
  return (
    <g>
      <path d={`M${x0 - 20} -300 L${X.forum} -470 L${x0 + 680} -300 Z`} fill="#3A2E3A" {...O} />
      <rect x={x0} y={-300} width={660} height={300} fill="#5A4E5E" {...O} />
      {/* interno in sezione */}
      <rect x={x0 + 30} y={-270} width={600} height={250} fill="#2A2430" {...o} />
      <path d={`M${x0 + 30} -20 H${x0 + 630}`} {...o} />
      <Finestra x={x0 + 60} y={-230} w={90} h={110} on={0.2} c="#7A8AC0" />
      {/* scrivania e computer */}
      <g transform={`translate(${X.forum + 90} -20)`}>
        <rect x={-150} y={-90} width={300} height={16} fill="#6A4A30" {...o} />
        <path d="M-136 -74 V0 M136 -74 V0" {...o} strokeWidth={6} />
        <rect x={-78} y={-198} width={156} height={104} rx={10} fill="#C8C0A8" {...o} />
        <rect x={-64} y={-186} width={128} height={72} rx={4} fill="#1A2A22" />
        <rect x={-64} y={-186} width={128} height={72} rx={4} fill="#8FE0A8" opacity={0.15 + 0.05 * Math.sin(T * 9)} />
        <path d="M-40 -90 H40 L30 -82 H-30 Z" fill="#A8A088" {...o} strokeWidth={2.5} />
        <rect x={-60} y={-80} width={120} height={10} rx={3} fill="#B8B098" {...o} strokeWidth={2.5} />
      </g>
      {/* il pavimento che diventa una griglia (noclip) */}
      {griglia > 0 && (
        <g opacity={griglia}>
          <rect x={x0 + 30} y={-24} width={600} height={34} fill="#0A1A14" />
          {Array.from({ length: 21 }, (_, k) => <path key={k} d={`M${x0 + 30 + k * 30} -24 V10`} stroke="#8FE0A8" strokeWidth={2} />)}
          <path d={`M${x0 + 30} -24 H${x0 + 630} M${x0 + 30} -7 H${x0 + 630} M${x0 + 30} 10 H${x0 + 630}`} stroke="#8FE0A8" strokeWidth={2} />
        </g>
      )}
    </g>
  );
};

/** Il negozio di mobili di Clark, con il seminterrato e la fessura luminosa nel muro. */
export const Negozio: React.FC<{ T: number; fessura: number; sfarfalla: number; luci: number }> = ({ T, fessura, sfarfalla, luci }) => {
  const x0 = X.negozio - 620, x1 = X.negozio + 640;
  const n = (i: number) => (sfarfalla > 0 ? lerp(1, neonAt(T, i, 21, 1), sfarfalla) : 1) * luci;
  return (
    <g>
      {/* edificio */}
      <rect x={x0} y={-360} width={x1 - x0} height={360} fill="#4A3A30" {...O} />
      <path d={`M${x0 - 20} -360 H${x1 + 20} V-386 H${x0 - 20} Z`} fill="#2E241E" {...O} />
      <Insegna x={X.negozio - 260} y={-470} T={T} />
      {/* salone in sezione */}
      <rect x={x0 + 30} y={-330} width={x1 - x0 - 60} height={310} fill={mix('#2A2018', '#6A5638', 0.5 + 0.5 * luci)} {...o} />
      {[x0 + 250, x0 + 640, x0 + 1030].map((lx, i) => <NeonSez key={i} x={lx} y={-328} w={90} on={n(i)} id={`neg-n${i}`} />)}
      <Divano x={x0 + 200} y={-20} tag="€ 499" />
      <Divano x={x0 + 470} y={-20} c="#5A7A6A" tag="€ 699" />
      <Lampada x={x0 + 610} y={-20} />
      <Letto x={x0 + 820} y={-20} />
      <Divano x={x0 + 1080} y={-20} c="#8A6A9A" tag="€ 399" />
      {/* seminterrato */}
      <rect x={x0 + 300} y={0} width={x1 - x0 - 300} height={230} fill={SOIL} {...O} />
      <rect x={x0 + 330} y={20} width={x1 - x0 - 360} height={190} fill={mix('#1E1810', '#4E4230', luci)} {...o} />
      {/* mattoni */}
      {Array.from({ length: 6 }, (_, r) => Array.from({ length: 12 }, (_, c) => (
        <rect key={`${r}-${c}`} x={x0 + 340 + c * 76 + (r % 2) * 38} y={30 + r * 30} width={70} height={24} rx={2} fill="none" stroke="#2E2418" strokeWidth={2} opacity={0.7} />
      )))}
      {/* scala */}
      <path d={`M${x0 + 330} 0 ${Array.from({ length: 7 }, (_, k) => `L${x0 + 330 + k * 26} ${k * 30} L${x0 + 356 + k * 26} ${k * 30}`).join(' ')} V210 H${x0 + 330} Z`} fill="#3A2E22" {...o} />
      {[0, 1].map((i) => <NeonSez key={i} x={x0 + 620 + i * 400} y={22} w={70} on={n(5 + i)} id={`neg-b${i}`} />)}
      {/* scatoloni */}
      {[[x0 + 560, 210, 70, 60], [x0 + 620, 210, 50, 40], [x0 + 600, 150, 56, 50]].map(([x, y, w, h], i) => (
        <g key={i}><rect x={x} y={y - h} width={w} height={h} fill="#A8844A" {...o} /><path d={`M${x} ${y - h + 12} H${x + w}`} {...o} strokeWidth={2} /></g>
      ))}
      {/* la fessura */}
      {fessura > 0 && <Fessura x={X.fessura} y={120} k={fessura} T={T} />}
    </g>
  );
};

/** La fessura luminosa nel muro (la porta verso il Livello 0). */
export const Fessura: React.FC<{ x: number; y: number; k: number; T: number; h?: number }> = ({ x, y, k, T, h = 150 }) => {
  const hh = h * k;
  const w = 10 + 6 * Math.sin(T * 3);
  return (
    <g>
      <ellipse cx={x} cy={y} rx={70 * k} ry={hh * 0.75} fill="#FFF4B8" opacity={0.18 * k} />
      <ellipse cx={x} cy={y} rx={34 * k} ry={hh * 0.62} fill="#FFF4B8" opacity={0.25 * k} />
      <path d={`M${x} ${y - hh / 2} Q${x - w} ${y - hh / 6} ${x - w / 3} ${y} Q${x + w} ${y + hh / 6} ${x} ${y + hh / 2} Q${x + w / 2} ${y} ${x} ${y - hh / 2} Z`} fill="#FFFBE6" stroke="#F2D06A" strokeWidth={3} />
    </g>
  );
};

/** Lo studio di Mary: divanetto, poltrona, la segreteria telefonica che lampeggia. */
export const Studio: React.FC<{ T: number; spia: number }> = ({ T, spia }) => {
  const x0 = X.studio - 300;
  return (
    <g>
      <rect x={x0} y={-300} width={600} height={300} fill="#3E4656" {...O} />
      <path d={`M${x0 - 16} -300 H${x0 + 616} V-322 H${x0 - 16} Z`} fill="#2A303C" {...O} />
      <rect x={x0 + 26} y={-276} width={548} height={256} fill="#5A6272" {...o} />
      <Finestra x={x0 + 420} y={-240} w={110} h={120} on={0.15} c="#8A9AC8" />
      {/* poltrona e divanetto */}
      <Divano x={x0 + 150} y={-20} c="#7A6A9A" s={0.8} />
      <g transform={`translate(${x0 + 330} -20)`}>
        <rect x={-40} y={-40} width={80} height={26} rx={8} fill="#A8723A" {...o} />
        <rect x={-46} y={-86} width={20} height={72} rx={8} fill="#A8723A" {...o} />
        <path d="M-36 -14 V0 M36 -14 V0" {...o} />
      </g>
      {/* tavolino con la segreteria telefonica */}
      <g transform={`translate(${x0 + 470} -20)`}>
        <rect x={-50} y={-56} width={100} height={12} fill="#6A4A30" {...o} />
        <path d="M-40 -44 V0 M40 -44 V0" {...o} />
        <rect x={-36} y={-84} width={72} height={28} rx={5} fill="#2A2A30" {...o} strokeWidth={2.5} />
        <circle cx={-18} cy={-70} r={6} fill="none" stroke="#8A8A90" strokeWidth={2} transform={`rotate(${T * 200 * spia} -18 -70)`} />
        <circle cx={6} cy={-70} r={6} fill="none" stroke="#8A8A90" strokeWidth={2} />
        <circle cx={26} cy={-74} r={5} fill={spia > 0 && Math.sin(T * 8) > 0 ? RED : '#5A2A2A'} />
      </g>
    </g>
  );
};

/** La casa d'infanzia di Mary, demolita: solo il contorno tratteggiato (e, se `vera` > 0, disegnata a linee piene). */
export const CasaMary: React.FC<{ k: number; vera?: number; x?: number; y?: number; s?: number; color?: string }> = ({ k, vera = 0, x = X.casaMary, y = 0, s = 1, color = '#C8BEA0' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={k} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" strokeDasharray={vera > 0.5 ? undefined : '14 10'}>
    <path d="M-170 0 V-190 L0 -300 L170 -190 V0" />
    <rect x={-40} y={-110} width={80} height={110} />
    <rect x={-130} y={-160} width={60} height={56} /><rect x={70} y={-160} width={60} height={56} />
    <path d="M90 -250 V-290 H120 V-232" />
    <path d="M-220 0 Q-200 -60 -180 0 M190 0 Q210 -80 240 0" />
  </g>
);

/** L'istituto Async: edificio grigio in superficie, laboratorio sotterraneo con l'anello, sala monitor, stanzetta. */
export const Async: React.FC<{ T: number; anello: number; tv: number; stanzetta: number }> = ({ T, anello, tv, stanzetta }) => {
  const x0 = X.async - 520, x1 = X.async + 1100;
  return (
    <g>
      {/* edificio in superficie */}
      <rect x={x0} y={-260} width={x1 - x0} height={260} fill="#3A4448" {...O} />
      {Array.from({ length: 9 }, (_, i) => <Finestra key={i} x={x0 + 50 + i * 170} y={-200} w={90} h={70} on={i % 3 === 1 ? 0.7 : 0.1} c="#BFE6F0" />)}
      <rect x={X.async - 150} y={-330} width={300} height={70} rx={8} fill="#1E2628" {...O} />
      <text x={X.async} y={-282} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={44} letterSpacing="10" fill={ASYNC}>ASYNC</text>
      {/* sotterraneo */}
      <rect x={x0} y={0} width={x1 - x0} height={300} fill="#151A1C" {...O} />
      {/* laboratorio con l'anello */}
      <rect x={x0 + 30} y={20} width={560} height={260} fill="#26303A" {...o} />
      <g transform={`translate(${X.anello} 150)`}>
        <circle r={100} fill="none" stroke="#5A6A72" strokeWidth={34} />
        <circle r={100} fill="none" stroke={INK} strokeWidth={4} />
        <circle r={117} fill="none" stroke={INK} strokeWidth={4} />
        <circle r={83} fill="none" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, k) => {
          const a = (k / 12) * Math.PI * 2 + T * 1.5 * anello;
          return <circle key={k} cx={Math.cos(a) * 100} cy={Math.sin(a) * 100} r={6} fill={mix('#3A4A52', ASYNC, anello)} />;
        })}
        {anello > 0 && (
          <g opacity={anello}>
            <circle r={78} fill="#FFF4B8" opacity={0.25 + 0.1 * Math.sin(T * 6)} />
            <circle r={52} fill="#FFFBE6" opacity={0.6} />
          </g>
        )}
        <rect x={-130} y={110} width={260} height={20} fill="#3A4448" {...o} />
      </g>
      {/* sala monitor con il televisore */}
      <rect x={x0 + 620} y={20} width={460} height={260} fill="#202A30" {...o} />
      <g transform={`translate(${X.monitor} 150)`}>
        <rect x={-140} y={-100} width={280} height={200} rx={20} fill="#8A8478" {...O} />
        <rect x={-112} y={-78} width={224} height={126} rx={10} fill="#101418" />
        {tv <= 0 && <rect x={-112} y={-78} width={224} height={126} rx={10} fill={ASYNC} opacity={0.12 + 0.04 * Math.sin(T * 20)} />}
        <rect x={-150} y={100} width={300} height={30} fill="#4A3E30" {...o} />
        <circle cx={110} cy={86} r={6} fill="#5A5048" />
      </g>
      {/* stanzetta degli interrogatori */}
      <rect x={x0 + 1110} y={20} width={460} height={260} fill={mix('#26303A', '#4A5660', stanzetta)} {...o} />
      <Stanzetta x={X.stanzetta + 50} y={280} T={T} k={stanzetta} />
    </g>
  );
};

/** L'interno della stanzetta degli interrogatori (vera o copia storta nel Livello 0). */
export const Stanzetta: React.FC<{ x: number; y: number; T: number; k: number; storto?: number; c?: string }> = ({ x, y, T, k, storto = 0, c = '#E8E4D8' }) => (
  <g transform={`translate(${x} ${y}) skewX(${storto * -10})`}>
    <path d="M0 -250 V-200" {...o} />
    <path d="M-40 -200 H40 L26 -224 H-26 Z" fill={mix('#5A5A52', c, k)} {...o} />
    <path d="M-120 -200 L-170 0 H170 L120 -200 Z" fill={c} opacity={0.12 * k} />
    {/* tavolo e due sedie */}
    <rect x={-110} y={-90} width={220} height={14} fill="#6A6A66" {...o} />
    <path d="M-96 -76 V-20 M96 -76 V-20" {...o} strokeWidth={6} />
    {[-1, 1].map((sd) => (
      <g key={sd} transform={`translate(${sd * 150} -20) scale(${sd} 1)`}>
        <path d="M-20 -60 V0 M20 -40 V0 M-24 -40 H22 M-20 -60 V-110" {...o} strokeWidth={5} />
      </g>
    ))}
    {/* specchio scuro */}
    <rect x={160} y={-190} width={60} height={110} fill="#1A1E22" {...o} />
    <path d="M170 -180 L190 -160" stroke="#5A6A72" strokeWidth={3} opacity={0.6} />
    <path d="M-300 -20 H300" {...o} strokeWidth={2} opacity={0.5 * (1 - 0 * T)} />
  </g>
);

/** Il cinema in fondo alla strada, con l'insegna del film. */
export const Cinema: React.FC<{ T: number; on: number }> = ({ T, on }) => {
  const x0 = X.cinema - 380;
  const blink = (i: number) => (Math.floor(T * 4 + i) % 3 === 0 ? 1 : 0.45);
  return (
    <g>
      <rect x={x0} y={-380} width={760} height={380} fill="#3A2630" {...O} />
      <rect x={x0 - 40} y={-300} width={840} height={130} rx={10} fill="#1E1418" {...O} />
      {Array.from({ length: 28 }, (_, i) => (
        <circle key={i} cx={x0 - 20 + i * 30} cy={-292} r={5} fill={mix('#5A3A2A', '#FFE0A0', on * blink(i))} />
      ))}
      <text x={X.cinema} y={-224} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={58} letterSpacing="8" fill={mix('#6A5A3A', '#F4E9B8', on)}>BACKROOMS</text>
      <text x={X.cinema} y={-186} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26} letterSpacing="5" fill={mix('#5A4A3A', YEL, on)}>DAL 27 MAGGIO 2026</text>
      <rect x={X.cinema - 90} y={-150} width={180} height={150} fill="#2A1A20" {...o} />
      <rect x={X.cinema - 80} y={-140} width={75} height={140} fill={mix('#3A2A20', '#F2C87A', 0.5 * on)} {...o} strokeWidth={2.5} />
      <rect x={X.cinema + 5} y={-140} width={75} height={140} fill={mix('#3A2A20', '#F2C87A', 0.5 * on)} {...o} strokeWidth={2.5} />
      {[-300, 220].map((dx) => (
        <g key={dx}><rect x={X.cinema + dx} y={-150} width={80} height={120} fill="#E8D8B0" {...o} /><rect x={X.cinema + dx + 10} y={-140} width={60} height={70} fill={YEL} /></g>
      ))}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------------- sotto terra

/** Il Livello 0 in sezione, come una casa delle bambole: per ogni stanza il soffitto a pannelli e la moquette in
 * prospettiva verso il fondo, il muro di fondo a righe con il battiscopa, macchie bagnate, prese e varchi verso le stanze
 * dietro, i muri tagliati tra una stanza e l'altra; `buio` 0–1 per stanza. */
export const Livello0: React.FC<{ T: number; x0: number; x1: number; buio: (x: number) => number; rotto?: number }> = ({ T, x0, x1, buio, rotto = 0 }) => {
  const top = L0.top, bot = L0.bot, PF = 46, PS = 30; // profondità del pavimento e del soffitto
  return (
    <g>
      <rect x={x0} y={top - 30} width={x1 - x0} height={bot - top + 60} fill="#2A2210" />
      {STANZE.filter((s) => s.x + s.w > x0 && s.x < x1).map((s, i) => {
        const b = buio(s.x + s.w / 2);
        const on = neonAt(T, s.lamp, 5, rotto) * (1 - b);
        const lum = 0.35 + 0.65 * on;
        const dk = (c: string, k = 1) => mix(mix(mix(c, '#3A3010', 1 - lum), '#0E0C06', b * 0.8), '#0E0C06', 1 - k);
        const ins = 26; // rientro del muro di fondo
        const bx0 = s.x + ins, bx1 = s.x + s.w - ins, by0 = top + PS, by1 = bot - PF;
        const cx = s.x + s.w / 2;
        const r = (k: number) => ((s.lamp * 9301 + k * 49297) % 233280) / 233280;
        const varco = r(1) > 0.45;
        const vx = bx0 + (bx1 - bx0 - 70) * r(2);
        return (
          <g key={s.x}>
            {/* soffitto in prospettiva */}
            <path d={`M${s.x} ${top} H${s.x + s.w} L${bx1} ${by0} H${bx0} Z`} fill={dk('#CFC08A', 0.9)} />
            {[0.25, 0.5, 0.75].map((f) => <path key={f} d={`M${s.x + s.w * f} ${top} L${bx0 + (bx1 - bx0) * f} ${by0}`} stroke={dk('#9E8E58')} strokeWidth={2} />)}
            {/* muro di fondo con le righe */}
            <rect x={bx0} y={by0} width={bx1 - bx0} height={by1 - by0} fill={dk(YEL)} />
            {Array.from({ length: Math.floor((bx1 - bx0) / 26) }, (_, k) => <path key={k} d={`M${bx0 + 13 + k * 26} ${by0} V${by1}`} stroke={dk('#B9A24C')} strokeWidth={2.5} opacity={0.55} />)}
            <rect x={bx0} y={by1 - 10} width={bx1 - bx0} height={10} fill={dk('#6E5A22')} />
            {/* varco verso la stanza dietro (più buia) */}
            {varco && (
              <g>
                <rect x={vx} y={by0 + 50} width={70} height={by1 - by0 - 50} fill={dk('#5E5124')} stroke={INK} strokeWidth={2.5} />
                <rect x={vx + 8} y={by0 + 58} width={54} height={by1 - by0 - 58} fill={dk('#8E7A30', 0.7)} />
              </g>
            )}
            {!varco && <rect x={cx + (r(3) - 0.5) * (bx1 - bx0 - 40)} y={by1 - 30} width={14} height={10} rx={2} fill={dk('#E8E0C0')} stroke={INK} strokeWidth={1.5} />}
            {/* moquette in prospettiva, con le macchie bagnate */}
            <path d={`M${bx0} ${by1} H${bx1} L${s.x + s.w} ${bot} H${s.x} Z`} fill={dk('#9C8A45')} />
            <ellipse cx={s.x + s.w * (0.3 + 0.4 * r(4))} cy={bot - PF * 0.4} rx={30 + 50 * r(5)} ry={9} fill={dk('#5E5124')} opacity={0.6} />
            {/* muri laterali tagliati (la sezione) */}
            <path d={`M${s.x} ${top} L${bx0} ${by0} V${by1} L${s.x} ${bot} Z`} fill={dk('#C9B45A', 0.85)} />
            <path d={`M${s.x + s.w} ${top} L${bx1} ${by0} V${by1} L${s.x + s.w} ${bot} Z`} fill={dk('#B9A24C', 0.8)} />
            <path d={`M${bx0} ${by0} H${bx1} V${by1} H${bx0} Z`} fill="none" stroke={INK} strokeWidth={2} opacity={0.5} />
            {on > 0.05 && (
              <g>
                <NeonSez x={cx} y={(top + by0) / 2 - 4} w={Math.min(110, s.w * 0.3)} on={on} id={`l0-${i}-${s.x}`} />
              </g>
            )}
            <rect x={s.x - 9} y={top} width={18} height={bot - top} fill="#1C170C" />
          </g>
        );
      })}
      <path d={`M${x0} ${top} H${x1} M${x0} ${bot} H${x1}`} stroke={INK} strokeWidth={8} />
    </g>
  );
};

/** I livelli della leggenda (solo nel capitolo della leggenda): il parcheggio infinito e i tunnel caldi. */
export const Livelli: React.FC<{ T: number; k1: number; k2: number; x0: number; x1: number; croce?: number }> = ({ T, k1, k2, x0, x1, croce = 0 }) => (
  <g>
    {k1 > 0 && (
      <g opacity={k1}>
        <rect x={x0} y={L1.top} width={x1 - x0} height={L1.bot - L1.top} fill="#4A4C50" {...O} />
        {Array.from({ length: Math.ceil((x1 - x0) / 420) }, (_, i) => {
          const px = x0 + 80 + i * 420;
          return (
            <g key={i}>
              <rect x={px} y={L1.top} width={50} height={L1.bot - L1.top} fill="#6A6C70" {...o} />
              <path d={`M${px + 120} ${L1.bot - 4} H${px + 360}`} stroke="#E8E0C0" strokeWidth={5} strokeDasharray="40 30" />
              <rect x={px + 200} y={L1.top + 6} width={80} height={8} fill={mix('#6A6C70', '#E8F0F0', neonAt(T, i, 9, 0.5))} />
            </g>
          );
        })}
      </g>
    )}
    {k2 > 0 && (
      <g opacity={k2}>
        <rect x={x0} y={L2.top} width={x1 - x0} height={L2.bot - L2.top} fill="#3A1E14" {...O} />
        {Array.from({ length: Math.ceil((x1 - x0) / 300) }, (_, i) => {
          const px = x0 + i * 300;
          return (
            <g key={i}>
              <path d={`M${px} ${L2.top + 34} H${px + 300} M${px} ${L2.top + 50} H${px + 300}`} stroke="#6A3A24" strokeWidth={10} />
              <circle cx={px + 150} cy={L2.top + 42} r={16} fill="#8A4A2A" stroke={INK} strokeWidth={3} />
              <path d={`M${px + 60} ${L2.bot - 10} q20 -${20 + 10 * Math.sin(T * 3 + i)} 40 0`} stroke="#E87A3A" strokeWidth={4} fill="none" opacity={0.6} />
              {/* occhi nel buio: creature generiche della leggenda */}
              {i % 3 === 1 && <g opacity={0.5 + 0.5 * Math.sin(T * 2 + i)}><circle cx={px + 230} cy={L2.top + 96} r={5} fill="#F2E06A" /><circle cx={px + 250} cy={L2.top + 96} r={5} fill="#F2E06A" /></g>}
            </g>
          );
        })}
      </g>
    )}
    {croce > 0 && (k1 > 0 || k2 > 0) && (
      <g opacity={croce} stroke={RED} strokeWidth={14} strokeLinecap="round">
        <path d={`M${x0 + 200} ${L1.top - 20} L${x1 - 200} ${L2.bot + 20}`} />
        <path d={`M${x0 + 200} ${L2.bot + 20} L${x1 - 200} ${L1.top - 20}`} />
      </g>
    )}
  </g>
);

/** La terra tra la superficie e il Livello 0: strati, sassi, radici. */
const rs = rng(77);
const SASSI = Array.from({ length: 180 }, () => ({ x: -1600 + rs() * 11000, y: 20 + rs() * 1400, r: 4 + rs() * 12 }));
export const Terra: React.FC<{ x0: number; x1: number }> = ({ x0, x1 }) => (
  <g>
    <defs>
      <linearGradient id="br-terra" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2A2116" />
        <stop offset=".35" stopColor="#1A140C" />
        <stop offset="1" stopColor="#0A0805" />
      </linearGradient>
    </defs>
    <rect x={x0} y={0} width={x1 - x0} height={1600} fill="url(#br-terra)" />
    {[60, 150, 260].map((y, i) => <path key={y} d={`M${x0} ${y} Q${(x0 + x1) / 2} ${y + 30 * (i % 2 ? 1 : -1)} ${x1} ${y}`} stroke="#3A2E1E" strokeWidth={3} fill="none" opacity={0.6} />)}
    {SASSI.filter((s) => s.x > x0 && s.x < x1).map((s, i) => <ellipse key={i} cx={s.x} cy={s.y} rx={s.r * 1.4} ry={s.r} fill="#2E2418" opacity={0.7} />)}
    <path d={`M${x0} 0 H${x1}`} stroke={INK} strokeWidth={8} />
  </g>
);

/** Scritta a mano (in coordinate del mondo). */
export const Mano: React.FC<{ x: number; y: number; text: string; size: number; color?: string; op?: number; anchor?: 'start' | 'middle' | 'end'; rot?: number }> = ({ x, y, text, size, color = YEL, op = 1, anchor = 'middle', rot = 0 }) => (
  <text x={x} y={y} textAnchor={anchor} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} fontFamily={HAND} fontWeight={700} fontSize={size} fill={color} stroke={NIGHT} strokeWidth={size * 0.16} paintOrder="stroke" opacity={op}>{text}</text>
);
