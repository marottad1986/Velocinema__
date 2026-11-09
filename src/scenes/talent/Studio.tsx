import React from 'react';
import { clamp01, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Beam, Dust, Fog, Glow } from '../../lib/elements';
import { SANS } from '../../lib/fonts';

// Vocabolario visivo fisso dei talent spiegati (TALENT.md): lo studio inventato da noi (mai la scenografia vera né il
// logo del programma), l'asta col microfono = concorrente, la poltrona / la lampada = giudice, il microfono dorato =
// conduttrice, il telefono = televoto, il pass dorato = ripescaggio, il tabellone = chi è in gara. Niente persone.
// Tutto è funzione pura di t; ogni componente con gradienti riceve un `id` unico nella scena.

export const K = '#07050C'; // contorni
export const ORO = '#FFC53D'; // accento: solo l'oggetto chiave della frase
export const SPENTO = '#4A4656';
export const TINTA = '#2A1E4A'; // velatura viola notte

export const alpha = (hex: string, a: number) => hex + Math.round(clamp01(a) * 255).toString(16).padStart(2, '0');
const mix = (a: string, b: string, p: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp01(p))).toString(16).padStart(2, '0')).join('');
};

/** Gradienti comuni: metallo cromato, pavimento lucido, parete, griglia dei led. */
export const TalentDefs: React.FC<{ id: string }> = ({ id }) => (
  <>
    <linearGradient id={`${id}-chrome`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#3A3846" />
      <stop offset=".35" stopColor="#E8E6F0" />
      <stop offset=".55" stopColor="#8A8898" />
      <stop offset="1" stopColor="#24222E" />
    </linearGradient>
    <linearGradient id={`${id}-chrome-off`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#24222C" />
      <stop offset=".4" stopColor="#6A6876" />
      <stop offset="1" stopColor="#1A1820" />
    </linearGradient>
    <radialGradient id={`${id}-grille`} cx=".38" cy=".32" r=".75">
      <stop offset="0" stopColor="#F4F2FA" />
      <stop offset=".45" stopColor="#A8A6B6" />
      <stop offset="1" stopColor="#3A3846" />
    </radialGradient>
    <radialGradient id={`${id}-grille-off`} cx=".38" cy=".32" r=".75">
      <stop offset="0" stopColor="#7A7884" />
      <stop offset="1" stopColor="#24222C" />
    </radialGradient>
    <radialGradient id={`${id}-gold`} cx=".35" cy=".3" r=".8">
      <stop offset="0" stopColor="#FFF4C8" />
      <stop offset=".45" stopColor={ORO} />
      <stop offset="1" stopColor="#8A5A10" />
    </radialGradient>
    <linearGradient id={`${id}-goldbar`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#8A5A10" />
      <stop offset=".4" stopColor="#FFE9A0" />
      <stop offset="1" stopColor="#A86E14" />
    </linearGradient>
    <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#05040A" />
      <stop offset=".3" stopColor="#0E0A1E" />
      <stop offset=".62" stopColor="#1C1238" />
      <stop offset="1" stopColor="#120C24" />
    </linearGradient>
    <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#241A3E" />
      <stop offset=".25" stopColor="#120E22" />
      <stop offset="1" stopColor="#040308" />
    </linearGradient>
    <linearGradient id={`${id}-desk`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2E2444" />
      <stop offset=".2" stopColor="#1A1428" />
      <stop offset="1" stopColor="#08060E" />
    </linearGradient>
    <linearGradient id={`${id}-amp`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#2E2A36" />
      <stop offset=".5" stopColor="#1A1820" />
      <stop offset="1" stopColor="#0C0B10" />
    </linearGradient>
    <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity=".75" />
    </linearGradient>
    {/* griglia dei led: la parete si vede "a puntini" */}
    <pattern id={`${id}-led`} width="18" height="18" patternUnits="userSpaceOnUse">
      <rect width="18" height="18" fill="#06040C" />
      <circle cx="9" cy="9" r="5.2" fill="#000" fillOpacity="0" />
    </pattern>
    <mask id={`${id}-ledmask`}>
      <rect x="-3000" y="-2000" width="8000" height="6000" fill="#000" />
      <pattern id={`${id}-ledholes`} width="18" height="18" patternUnits="userSpaceOnUse">
        <circle cx="9" cy="9" r="4.6" fill="#FFF" />
      </pattern>
      <rect x="-3000" y="-2000" width="8000" height="6000" fill={`url(#${id}-ledholes)`} />
    </mask>
    <radialGradient id={`${id}-pool`}>
      <stop offset="0" stopColor="#FFFFFF" stopOpacity=".9" />
      <stop offset=".5" stopColor="#FFFFFF" stopOpacity=".3" />
      <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
    </radialGradient>
  </>
);

// ─────────────────────────────── LO STUDIO ───────────────────────────────

/**
 * Parete di fondo con il grande schermo di led (lontano). `blobs`: macchie di colore che scorrono sullo schermo
 * (i colori delle squadre); `scritta`: testo a puntini sullo schermo (es. la data del Live). x0/x1 per i palchi larghi.
 */
export const Parete: React.FC<{
  id: string; t: number; x0?: number; x1?: number; top?: number; bottom?: number; colori: string[]; luce?: number;
  scritta?: string; scrittaY?: number; scrittaColore?: string; scrittaO?: number; scrittaSize?: number;
}> = ({ id, t, x0 = -300, x1 = 1380, top = 600, bottom = 1100, colori, luce = 1, scritta, scrittaY = 820, scrittaColore = '#FFFFFF', scrittaO = 1, scrittaSize = 150 }) => {
  const w = x1 - x0;
  const n = Math.max(3, Math.round(w / 420));
  return (
    <g>
      <rect x={x0 - 400} y="-400" width={w + 800} height="2000" fill={`url(#${id}-wall)`} />
      {/* pannelli scuri della parete sopra lo schermo: zona calma dietro il titolo */}
      {Array.from({ length: Math.ceil((w + 800) / 240) }, (_, i) => (
        <path key={i} d={`M${x0 - 400 + i * 240} 0 V${top - 30}`} stroke="#1A1430" strokeWidth="3" opacity=".7" />
      ))}
      <rect x={x0 - 400} y={top - 34} width={w + 800} height="14" fill="#1E1834" />
      {/* lo schermo di led */}
      <clipPath id={`${id}-ledclip`}><rect x={x0} y={top} width={w} height={bottom - top} /></clipPath>
      <g mask={`url(#${id}-ledmask)`} clipPath={`url(#${id}-ledclip)`}>
        <rect x={x0} y={top} width={w} height={bottom - top} fill="#140E26" />
        {Array.from({ length: n }, (_, i) => {
          const c = colori[i % colori.length];
          const cx = x0 + ((i + 0.5) / n) * w + Math.sin(t * 0.5 + i * 1.7) * 90;
          const cy = lerp(top, bottom, 0.5) + Math.sin(t * 0.7 + i) * 90;
          return <ellipse key={i} cx={cx} cy={cy} rx={300} ry={220} fill={c} opacity={0.42 * luce * (0.8 + 0.2 * Math.sin(t * 1.3 + i))} />;
        })}
        {/* onda chiara che scorre */}
        <rect x={x0 + mod(t * 260, w + 600) - 300} y={top} width="160" height={bottom - top} fill="#FFFFFF" opacity={0.12 * luce} />
        {scritta && (
          <text x={(x0 + x1) / 2} y={scrittaY} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={scrittaSize} letterSpacing="8" fill={scrittaColore} opacity={scrittaO}>
            {scritta}
          </text>
        )}
      </g>
      {/* cornice dello schermo e luce che cola sul pavimento */}
      <rect x={x0} y={top} width={w} height={bottom - top} fill="none" stroke="#2A2244" strokeWidth="10" />
      <rect x={x0} y={bottom} width={w} height="24" fill="#0A0814" />
    </g>
  );
};

/** Americana con i fari in cima (molto in alto, sopra il titolo: scura e sottile). */
export const Americana: React.FC<{ id: string; t: number; y?: number; x0?: number; x1?: number; colori: string[] }> = ({ id, t, y = 150, x0 = -300, x1 = 1380, colori }) => {
  const n = Math.round((x1 - x0) / 180);
  return (
    <g>
      <path d={`M${x0} ${y} H${x1} M${x0} ${y + 34} H${x1}`} stroke="#2A2638" strokeWidth="8" />
      {Array.from({ length: Math.round((x1 - x0) / 34) }, (_, i) => (
        <path key={i} d={`M${x0 + i * 34} ${y} l17 34`} stroke="#2A2638" strokeWidth="4" />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + 90 + i * 180;
        const c = colori[i % colori.length];
        return (
          <g key={i}>
            <path d={`M${x} ${y + 34} v18`} stroke="#2A2638" strokeWidth="6" />
            <rect x={x - 22} y={y + 50} width="44" height="54" rx="8" fill="#16141E" stroke={K} strokeWidth="4" />
            <ellipse cx={x} cy={y + 104} rx="18" ry="6" fill={c} opacity={0.75 + 0.25 * Math.sin(t * 2 + i)} />
          </g>
        );
      })}
    </g>
  );
};

/** Pavimento nero lucido del palco, con il bordo a led e i riflessi delle luci. */
export const Pavimento: React.FC<{ id: string; t: number; y?: number; x0?: number; x1?: number; colori: string[]; bordo?: number }> = ({ id, t, y = 1100, x0 = -300, x1 = 1380, colori, bordo = 1480 }) => {
  const w = x1 - x0;
  return (
    <g>
      <rect x={x0 - 400} y={y} width={w + 800} height={2200 - y} fill={`url(#${id}-floor)`} />
      {/* doghe del palco in prospettiva */}
      {Array.from({ length: Math.round(w / 120) + 8 }, (_, i) => {
        const xs = x0 - 400 + i * 120 + 60;
        const cx = (x0 + x1) / 2;
        return <path key={i} d={`M${xs} ${y} L${cx + (xs - cx) * 1.9} ${bordo}`} stroke="#2E2448" strokeWidth="2" opacity=".55" />;
      })}
      {[0.18, 0.42, 0.7].map((k, i) => <path key={i} d={`M${x0 - 400} ${lerp(y, bordo, k)} H${x1 + 400}`} stroke="#2E2448" strokeWidth="2" opacity=".4" />)}
      {/* bordo del palco con la striscia di led */}
      <rect x={x0 - 400} y={bordo} width={w + 800} height="22" fill="#0E0A18" />
      {Array.from({ length: Math.round((w + 800) / 36) }, (_, i) => {
        const c = colori[Math.floor(i / 6) % colori.length];
        return <rect key={i} x={x0 - 400 + i * 36 + 6} y={bordo + 7} width="22" height="8" rx="3" fill={c} opacity={0.55 + 0.45 * Math.sin(t * 3 - i * 0.35)} />;
      })}
      <rect x={x0 - 400} y={bordo + 22} width={w + 800} height={2200 - bordo} fill="#030206" />
    </g>
  );
};

/** Torre di americana ai lati del palco con tre fari colorati (le luci partono da qui, sotto il titolo). */
export const Torre: React.FC<{ id: string; t: number; x: number; y: number; h?: number; colori: string[]; flip?: boolean }> = ({ id, t, x, y, h = 460, colori, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <path d={`M-26 0 V${h} M26 0 V${h}`} stroke="#2A2638" strokeWidth="9" />
    {Array.from({ length: Math.round(h / 40) }, (_, i) => <path key={i} d={`M-26 ${i * 40} L26 ${i * 40 + 40}`} stroke="#2A2638" strokeWidth="5" />)}
    {[0, 1, 2].map((k) => (
      <g key={k} transform={`translate(30 ${40 + k * 120}) rotate(${-20 + k * 14})`}>
        <rect x="0" y="-26" width="64" height="52" rx="8" fill="#16141E" stroke={K} strokeWidth="5" />
        <ellipse cx="64" cy="0" rx="8" ry="22" fill={colori[k % colori.length]} opacity={0.8 + 0.2 * Math.sin(t * 2 + k)} />
      </g>
    ))}
    <Glow id={`${id}-tw${Math.round(x)}`} x={90} y={160} r={160} t={t} color={colori[0]} amp={0.05} rate={1.5} opacity={0.35} />
  </g>
);

/** File di poltroncine vuote della platea, di spalle, in primo piano in basso (incorniciano, niente pubblico). */
export const Platea: React.FC<{ id: string; t: number; y: number; file?: number; colore?: string; luce?: string }> = ({ id, t, y, file = 2, colore = '#3A1830', luce = '#B89AFF' }) => (
  <g>
    {Array.from({ length: file }, (_, f) => {
      const yy = y + f * 170, sc = 1 + f * 0.28, w = 190 * sc;
      const n = Math.ceil(1500 / w) + 1;
      return (
        <g key={f}>
          {Array.from({ length: n }, (_, i) => {
            const x = -260 + i * w + (f % 2) * w * 0.5;
            return (
              <g key={i} transform={`translate(${x} ${yy}) scale(${sc})`}>
                <path d="M-80 0 Q-86 -120 -60 -150 Q0 -168 60 -150 Q86 -120 80 0 Z" fill={colore} stroke={K} strokeWidth="8" />
                <path d="M-60 -150 Q0 -168 60 -150" stroke={luce} strokeWidth="5" opacity=".55" fill="none" />
                <path d="M-40 -130 Q0 -140 40 -130 M-44 -90 Q0 -98 44 -90" stroke={K} strokeWidth="4" opacity=".5" fill="none" />
                <rect x="-94" y="-40" width="20" height="60" rx="8" fill="#1A0E18" stroke={K} strokeWidth="5" />
              </g>
            );
          })}
        </g>
      );
    })}
  </g>
);

/** Fascio di luce dall'alto su un punto del palco, con la pozza sul pavimento e il pulviscolo. */
export const Faro: React.FC<{ id: string; t: number; x: number; y: number; da: { x: number; y: number }; colore: string; o?: number; largo?: number; polvere?: boolean }> = ({
  id, t, x, y, da, colore, o = 1, largo = 220, polvere = true,
}) => {
  if (o <= 0.01) return null;
  const ang = (Math.atan2(y - da.y, x - da.x) * 180) / Math.PI;
  const len = Math.hypot(x - da.x, y - da.y);
  return (
    <g opacity={o}>
      <Beam id={`${id}-b`} x={da.x} y={da.y} t={t} length={len * 1.05} spread={largo} angle={ang} color={colore} opacity={0.5} />
      <ellipse cx={x} cy={y} rx={largo * 0.95} ry={largo * 0.2} fill={`url(#${id.split('-')[0]}-pool)`} opacity=".22" />
      <ellipse cx={x} cy={y} rx={largo * 0.95} ry={largo * 0.2} fill={colore} opacity=".3" />
      {polvere && <Dust t={t} seed={id.length * 7 + Math.round(x)} n={14} top={{ y: da.y + 80, x0: da.x - 20, x1: da.x + 20 }} bottom={{ y, x0: x - largo / 2, x1: x + largo / 2 }} color="#FFF6E8" />}
    </g>
  );
};

/** Foschia bassa sul palco (due strati). */
export const Foschia: React.FC<{ id: string; t: number; y: number; x?: number; color?: string; o?: number }> = ({ id, t, y, x = 540, color = '#B8A8E8', o = 1 }) => (
  <g opacity={o}>
    <Fog id={`${id}-f1`} t={t} y={y} x={x} color={color} rx={900} ry={90} drift={120} speed={0.25} opacity={0.16} />
    <Fog id={`${id}-f2`} t={t} y={y + 70} x={x + 200} color={color} rx={700} ry={60} drift={90} speed={0.33} ph={2} opacity={0.12} />
  </g>
);

// ─────────────────────────────── IL CONCORRENTE: L'ASTA ───────────────────────────────

const parti = (nome: string) => {
  if (nome.length <= 11 || !nome.includes(' ')) return [nome];
  const i = nome.indexOf(' ', Math.floor(nome.length / 2) - 3);
  const k = i > 0 ? i : nome.indexOf(' ');
  return [nome.slice(0, k), nome.slice(k + 1)];
};

/** Cartellino col nome alla base dell'asta (o sul tavolo). `fuori`: grigio e barrato, con «FUORI · LIVE n». */
export const Cartellino: React.FC<{ x: number; y: number; nome: string; colore: string; w?: number; fuori?: number; nota?: string; s?: number; o?: number; oro?: boolean }> = ({
  x, y, nome, colore, w = 290, fuori = 0, nota, s = 1, o = 1, oro,
}) => {
  const righe = parti(nome);
  const size = Math.min(38, (w - 40) / (Math.max(...righe.map((r) => r.length)) * 0.6));
  const h = righe.length * size * 1.08 + 30 + (nota ? 34 : 0);
  const c = mix(colore, SPENTO, fuori);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x={-w / 2} y={0} width={w} height={h} rx="16" fill="#0E0A18" stroke={oro ? ORO : c} strokeWidth="5" />
      <rect x={-w / 2} y={0} width="14" height={h} rx="7" fill={oro ? ORO : c} />
      {righe.map((r, i) => (
        <text key={i} x={7} y={22 + size * 0.86 + i * size * 1.08} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size}
          fill={mix('#F6F2EA', '#8A8694', fuori)}>
          {r}
        </text>
      ))}
      {fuori > 0 && righe.map((r, i) => {
        const lw = r.length * size * 0.56;
        return <path key={i} d={`M${7 - lw / 2 - 6} ${22 + size * 0.55 + i * size * 1.08} h${(lw + 12) * eo(fuori)}`} stroke="#E8505B" strokeWidth="5" strokeLinecap="round" />;
      })}
      {nota && (
        <text x={7} y={h - 14} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={22} letterSpacing="3" fill={fuori > 0 ? '#E8505B' : oro ? ORO : c}>
          {nota}
        </text>
      )}
    </g>
  );
};

/** Ampli delle band, accanto all'asta: tela della griglia, manopole, spia accesa. */
export const Ampli: React.FC<{ id: string; x: number; y: number; s?: number; colore: string; luce?: number }> = ({ id, x, y, s = 1, colore, luce = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="4" rx="100" ry="14" fill="#000" opacity=".55" />
    <rect x="-86" y="-170" width="172" height="170" rx="10" fill={`url(#${id}-amp)`} stroke={K} strokeWidth="7" />
    <rect x="-74" y="-126" width="148" height="112" rx="6" fill="#16141C" stroke={K} strokeWidth="4" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-74 + i * 18} -126 l18 112 M${-56 + i * 18} -126 l-18 112`} stroke="#2A2632" strokeWidth="3" opacity=".8" />)}
    <circle cx="0" cy="-70" r="40" fill="none" stroke="#0A0910" strokeWidth="5" opacity=".7" />
    <rect x="-80" y="-164" width="160" height="30" rx="4" fill="#24202C" />
    {[-56, -30, -4, 22].map((kx) => <circle key={kx} cx={kx} cy="-149" r="8" fill="#C8C4D0" stroke={K} strokeWidth="3" />)}
    <circle cx="56" cy="-149" r="7" fill={luce > 0.3 ? colore : '#3A3640'} />
    {luce > 0.3 && <circle cx="56" cy="-149" r="16" fill={colore} opacity={0.35 * luce} />}
    <path d="M-30 -170 Q0 -192 30 -170" stroke={K} strokeWidth="8" fill="none" />
    <path d="M-82 -6 H82" stroke={colore} strokeWidth="3" opacity={0.6 * luce} />
  </g>
);

/** Pass dorato appeso all'asta con il cordino (ripescaggio). */
export const Pass: React.FC<{ id: string; x: number; y: number; t: number; s?: number; brillo?: number }> = ({ id, x, y, t, s = 1, brillo = 1 }) => {
  const sw = Math.sin(t * 1.6) * 6;
  return (
    <g transform={`translate(${x} ${y}) rotate(${sw}) scale(${s})`}>
      <path d="M0 0 L-20 70 M0 0 L20 70" stroke="#C83A3A" strokeWidth="5" />
      <Glow id={`${id}-pg`} x={0} y={130} r={150} t={t} color={ORO} amp={0.1} rate={4} opacity={0.55 * brillo} />
      <rect x="-50" y="64" width="100" height="136" rx="12" fill={`url(#${id}-goldbar)`} stroke={K} strokeWidth="6" />
      <rect x="-14" y="72" width="28" height="9" rx="4" fill={K} />
      <text x="0" y="146" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="30" letterSpacing="2" fill={K}>PASS</text>
      <path d="M-36 166 H36 M-36 180 H20" stroke={K} strokeWidth="5" opacity=".5" />
      <path d={`M${-40 + mod(t * 60, 140)} 70 l20 0 l-24 126 l-20 0 Z`} fill="#FFFFFF" opacity={0.35 * brillo} />
    </g>
  );
};

/**
 * Asta col microfono: il concorrente. (x, y) = punto del pavimento sotto la base. `luce` 0–1 (faro della squadra),
 * `fuori` 0–1 (spegnimento: asta grigia, cartellino barrato), `band` aggiunge l'ampli, `pass` 0–1 il pass dorato.
 */
export const Asta: React.FC<{
  id: string; t: number; x: number; y: number; s?: number; nome?: string; colore: string; luce?: number; fuori?: number;
  nota?: string; band?: boolean; pass?: number; oro?: boolean; ph?: number; cartellino?: boolean; w?: number;
}> = ({ id, t, x, y, s = 1, nome, colore, luce = 1, fuori = 0, nota, band, pass = 0, oro, ph = 0, cartellino = true, w = 290 }) => {
  const on = luce * (1 - fuori);
  const metal = fuori > 0.5 ? `url(#${id}-chrome-off)` : `url(#${id}-chrome)`;
  const grille = fuori > 0.5 ? `url(#${id}-grille-off)` : oro ? `url(#${id}-gold)` : `url(#${id}-grille)`;
  const c = oro ? ORO : colore;
  const tilt = -10 + Math.sin(t * 0.7 + ph) * 0.6;
  return (
    <g>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* pozza di luce sul pavimento e riflesso */}
        <ellipse cx="0" cy="6" rx="230" ry="46" fill={c} opacity={0.32 * on} />
        <ellipse cx="0" cy="6" rx="130" ry="24" fill="#FFFFFF" opacity={0.18 * on} />
        <ellipse cx="0" cy="4" rx="120" ry="16" fill="#000" opacity=".6" />
        {band && <Ampli id={id} x={150} y={2} s={0.78} colore={colore} luce={on} />}
        {/* cavo che scende lungo l'asta e si arrotola sul pavimento */}
        <path d="M10 -488 Q22 -300 14 -120 Q8 -20 40 -6 Q120 22 150 0 Q190 -24 120 -30 Q60 -30 70 4 Q80 30 200 26" stroke={K} strokeWidth="7" fill="none" />
        <path d="M10 -488 Q22 -300 14 -120 Q8 -20 40 -6 Q120 22 150 0" stroke="#3A3848" strokeWidth="2.5" fill="none" />
        {/* treppiede */}
        <path d="M0 -80 L-118 0 M0 -80 L118 0 M0 -80 L18 18" stroke={K} strokeWidth="16" strokeLinecap="round" />
        <path d="M0 -80 L-118 0 M0 -80 L118 0 M0 -80 L18 18" stroke={metal} strokeWidth="8" strokeLinecap="round" />
        {[-118, 118, 18].map((fx, i) => <ellipse key={i} cx={fx} cy={i === 2 ? 18 : 0} rx="16" ry="7" fill="#0A0910" stroke={K} strokeWidth="3" />)}
        <rect x="-16" y="-104" width="32" height="34" rx="6" fill="#24222C" stroke={K} strokeWidth="5" />
        {/* asta cromata con la ghiera */}
        <rect x="-8" y="-470" width="16" height="380" fill={metal} stroke={K} strokeWidth="5" />
        <rect x="-14" y="-292" width="28" height="30" rx="5" fill="#24222C" stroke={K} strokeWidth="4" />
        <path d="M14 -278 l20 -6" stroke={K} strokeWidth="6" strokeLinecap="round" />
        <path d="M5 -460 V-110" stroke={c} strokeWidth="3" opacity={0.7 * on} />
        {/* pinza e microfono */}
        <g transform={`translate(0 -470) rotate(${tilt})`}>
          <rect x="-18" y="-26" width="36" height="30" rx="6" fill="#1E1C26" stroke={K} strokeWidth="5" />
          <path d="M-15 -10 L-19 -150 Q-20 -160 -10 -162 H10 Q20 -160 19 -150 L15 -10 Z" fill="#14121A" stroke={K} strokeWidth="6" />
          <path d="M7 -18 L11 -148" stroke="#5A5868" strokeWidth="4" opacity=".8" />
          <rect x="-23" y="-176" width="46" height="18" rx="4" fill={metal} stroke={K} strokeWidth="4" />
          <circle cx="0" cy="-212" r="44" fill={grille} stroke={K} strokeWidth="7" />
          {/* rete della griglia */}
          {[-30, -15, 0, 15, 30].map((g) => (
            <path key={g} d={`M${g} ${-212 - Math.sqrt(44 * 44 - g * g) + 3} V${-212 + Math.sqrt(44 * 44 - g * g) - 3}`} stroke={K} strokeWidth="2" opacity=".35" />
          ))}
          {[-30, -15, 0, 15, 30].map((g) => (
            <path key={`h${g}`} d={`M${-Math.sqrt(44 * 44 - g * g) + 3} ${-212 + g} H${Math.sqrt(44 * 44 - g * g) - 3}`} stroke={K} strokeWidth="2" opacity=".35" />
          ))}
          <path d="M-44 -212 H44" stroke={K} strokeWidth="5" opacity=".6" />
          <ellipse cx="-14" cy="-232" rx="12" ry="8" fill="#FFFFFF" opacity={0.25 + 0.55 * on} />
        </g>
      </g>
      {/* alone sulla griglia */}
      {on > 0.02 && <Glow id={`${id}-h${Math.round(x)}`} x={x - 37 * s} y={y - 680 * s} r={150 * s} t={t} color={c} amp={0.06} rate={2.2} ph={ph} opacity={0.55 * on} />}
      {pass > 0.01 && <g opacity={eo(pass)}><Pass id={`${id}-p${Math.round(x)}`} x={x + 18 * s} y={y - 452 * s} t={t} s={s * 0.9} brillo={pass} /></g>}
      {cartellino && nome && <Cartellino x={x} y={y + 30 * s} nome={nome} colore={colore} fuori={fuori} nota={nota} s={s} w={w} oro={oro} />}
    </g>
  );
};

// ─────────────────────────────── I GIUDICI ───────────────────────────────

/** Poltrona girevole vuota, vista di spalle (il giudice), con la lampada colorata sul bracciolo. */
export const Poltrona: React.FC<{ id: string; t: number; x: number; y: number; s?: number; colore: string; luce?: number; ph?: number }> = ({ id, t, x, y, s = 1, colore, luce = 1, ph = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow id={`${id}-pl${Math.round(x)}`} x={0} y={-200} r={300} t={t} color={colore} amp={0.05} rate={1.8} ph={ph} opacity={0.5 * luce} />
    {/* schienale alto imbottito */}
    <path d="M-150 -40 Q-170 -300 -120 -420 Q0 -470 120 -420 Q170 -300 150 -40 Z" fill="#1A1424" stroke={K} strokeWidth="10" />
    <path d="M-150 -40 Q-170 -300 -120 -420 Q0 -470 120 -420 Q170 -300 150 -40 Z" fill={colore} opacity={0.12 + 0.1 * luce} />
    {[-80, 0, 80].map((kx) => <path key={kx} d={`M${kx} -410 Q${kx * 1.08} -230 ${kx} -60`} stroke={K} strokeWidth="5" opacity=".6" />)}
    {[-60, 60].flatMap((kx) => [-320, -200].map((ky) => <circle key={`${kx}${ky}`} cx={kx} cy={ky} r="7" fill={K} opacity=".7" />))}
    {/* bordo illuminato */}
    <path d="M-120 -420 Q0 -470 120 -420" stroke={colore} strokeWidth="8" opacity={0.4 + 0.6 * luce} fill="none" strokeLinecap="round" />
    <path d="M150 -40 Q170 -300 120 -420" stroke={colore} strokeWidth="5" opacity={0.3 + 0.5 * luce} fill="none" />
    {/* braccioli e base */}
    <rect x="-190" y="-170" width="60" height="150" rx="24" fill="#120E1A" stroke={K} strokeWidth="8" />
    <rect x="130" y="-170" width="60" height="150" rx="24" fill="#120E1A" stroke={K} strokeWidth="8" />
    <rect x="-170" y="-50" width="340" height="60" rx="20" fill="#120E1A" stroke={K} strokeWidth="8" />
    <rect x="-18" y="10" width="36" height="80" fill="url(#__)" stroke={K} strokeWidth="6" />
    <rect x="-16" y="10" width="32" height="80" fill="#3A3846" />
  </g>
);

/** Sedia della Last Call: poltroncina da palco vista di tre quarti, con lo schienale imbottito e le gambe cromate. */
export const Sedia: React.FC<{ id: string; t: number; x: number; y: number; s?: number; colore?: string; luce?: number }> = ({ id, t, x, y, s = 1, colore = ORO, luce = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="6" rx="190" ry="34" fill={colore} opacity={0.3 * luce} />
    <ellipse cx="0" cy="4" rx="120" ry="16" fill="#000" opacity=".6" />
    {[-90, 90, -60, 60].map((lx, i) => <path key={i} d={`M${lx * 0.8} -170 L${lx} ${i < 2 ? 0 : -14}`} stroke={`url(#${id}-chrome)`} strokeWidth="10" />)}
    <path d="M-110 -190 Q0 -215 110 -190 L100 -160 Q0 -180 -100 -160 Z" fill="#1E1428" stroke={K} strokeWidth="7" />
    <path d="M-104 -194 Q-120 -330 -80 -400 Q0 -430 80 -400 Q120 -330 104 -194 Z" fill="#241634" stroke={K} strokeWidth="8" />
    <path d="M-80 -400 Q0 -430 80 -400" stroke={colore} strokeWidth="7" fill="none" opacity={0.3 + 0.7 * luce} strokeLinecap="round" />
    <path d="M-60 -380 Q-70 -300 -64 -210 M0 -392 V-206 M60 -380 Q70 -300 64 -210" stroke={K} strokeWidth="4" opacity=".55" />
    <path d="M-104 -194 Q-120 -330 -80 -400" stroke={colore} strokeWidth="4" opacity={0.5 * luce} fill="none" />
    <Glow id={`${id}-sd${Math.round(x)}`} x={0} y={-300} r={220} t={t} color={colore} amp={0.05} rate={2} opacity={0.35 * luce} />
  </g>
);

/**
 * Lampada da tavolo del giudice (voto al ballottaggio): testa orientabile che punta `mira`; quando `voto` > 0 la testa si
 * accende e parte un fascio verso l'asta votata. Il nome del giudice NON sta qui (zona coperta dalle app): sta sul
 * gettone del voto, sopra l'asta.
 */
export const Lampada: React.FC<{ id: string; t: number; x: number; y: number; colore: string; mira?: { x: number; y: number }; voto?: number; s?: number }> = ({
  id, t, x, y, colore, mira, voto = 0, s = 1,
}) => {
  const ang = mira ? (Math.atan2(mira.y - (y - 150 * s), mira.x - x) * 180) / Math.PI : -90;
  const len = mira ? Math.hypot(mira.x - x, mira.y - (y - 150 * s)) : 0;
  return (
    <g>
      {mira && voto > 0.01 && (
        <Beam id={`${id}-lb${Math.round(x)}`} x={x} y={y - 150 * s} t={t} length={len * eo(voto)} spread={90} angle={ang} color={colore} opacity={0.6 * voto} />
      )}
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx="0" cy="0" rx="70" ry="16" fill="#000" opacity=".6" />
        <rect x="-60" y="-26" width="120" height="26" rx="10" fill="#1E1A28" stroke={K} strokeWidth="6" />
        <path d="M0 -26 L-20 -110 L0 -150" stroke={K} strokeWidth="16" fill="none" strokeLinejoin="round" />
        <path d="M0 -26 L-20 -110 L0 -150" stroke="#5A5868" strokeWidth="6" fill="none" strokeLinejoin="round" />
        <g transform={`translate(0 -150) rotate(${ang + 90})`}>
          <path d="M-40 -10 L-26 -70 H26 L40 -10 Z" fill="#24202E" stroke={K} strokeWidth="7" />
          <ellipse cx="0" cy="-70" rx="27" ry="9" fill={voto > 0.3 ? '#FFFFFF' : '#3A3644'} stroke={K} strokeWidth="4" />
          <ellipse cx="0" cy="-70" rx="20" ry="6" fill={colore} opacity={0.3 + 0.7 * voto} />
          <path d="M-30 -14 L-20 -62" stroke={colore} strokeWidth="4" opacity=".8" />
        </g>
      </g>
      <Glow id={`${id}-lg${Math.round(x)}`} x={x} y={y - 150 * s} r={120 * s} t={t} color={colore} amp={0.08} rate={3} opacity={0.15 + 0.6 * voto} />
    </g>
  );
};

/** Gettone del voto sopra l'asta: cerchio nel colore del giudice con il suo nome. */
export const Gettone: React.FC<{ x: number; y: number; nome: string; colore: string; o?: number }> = ({ x, y, nome, colore, o = 1 }) => {
  if (o <= 0.01) return null;
  const p = eo(clamp01(o));
  const size = Math.min(30, 150 / (nome.length * 0.6));
  return (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * p})`} opacity={p}>
      <rect x="-86" y="-32" width="172" height="64" rx="32" fill={colore} stroke={K} strokeWidth="6" />
      <text x="0" y={size * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={K}>{nome}</text>
    </g>
  );
};

// ─────────────────────────────── TELEVOTO ───────────────────────────────

/** Telefono del televoto: barre che crescono, la più corta lampeggia (o vince la più lunga). */
export const Telefono: React.FC<{ id: string; t: number; x: number; y: number; s?: number; barre: { v: number; colore: string; nome?: string; segno?: number }[]; rot?: number; titolo?: string }> = ({
  id, t, x, y, s = 1, barre, rot = -8, titolo = 'VOTA',
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <Glow id={`${id}-tg`} x={0} y={0} r={360} t={t} color="#8A7AFF" amp={0.04} rate={1.5} opacity={0.45} />
    <rect x="-180" y="-330" width="360" height="660" rx="50" fill="#0E0C14" stroke={K} strokeWidth="10" />
    <rect x="-162" y="-310" width="324" height="620" rx="36" fill="#1A1430" />
    <rect x="-162" y="-310" width="324" height="620" rx="36" fill="#4B2E83" opacity=".35" />
    <rect x="-44" y="-298" width="88" height="20" rx="10" fill="#0E0C14" />
    <text x="0" y="-222" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="44" letterSpacing="6" fill="#F6F2EA">{titolo}</text>
    {barre.map((b, i) => {
      const n = barre.length;
      const bw = Math.min(70, 240 / n - 14);
      const bx = -120 + (i + 0.5) * (240 / n) - bw / 2;
      const h = 340 * clamp01(b.v);
      const blink = b.segno ? 0.5 + 0.5 * Math.sin(t * 14) : 1;
      return (
        <g key={i}>
          <rect x={bx} y={190 - 340} width={bw} height={340} rx="10" fill="#0E0A1A" opacity=".7" />
          <rect x={bx} y={190 - h} width={bw} height={h} rx="10" fill={b.colore} opacity={b.segno ? lerp(1, blink, b.segno) : 1} stroke={K} strokeWidth="4" />
          {b.segno ? <rect x={bx - 8} y={190 - h - 8} width={bw + 16} height={h + 16} rx="14" fill="none" stroke={ORO} strokeWidth="6" opacity={b.segno * blink} /> : null}
          {b.nome && <text x={bx + bw / 2} y={240} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="28" fill="#F6F2EA">{b.nome}</text>}
        </g>
      );
    })}
    <path d="M-150 -300 L-60 -300 L-150 200 Z" fill="#FFFFFF" opacity=".05" />
  </g>
);

// ─────────────────────────────── IN PRIMO PIANO ───────────────────────────────

/** Telecamera da studio sul cavalletto, in primo piano a lato: incornicia la scena. */
export const Telecamera: React.FC<{ id: string; t: number; x: number; y: number; s?: number; flip?: boolean }> = ({ id, t, x, y, s = 1, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M0 0 L-160 420 M0 0 L160 420 M0 0 L20 440" stroke={K} strokeWidth="26" strokeLinecap="round" />
    <path d="M0 0 L-160 420 M0 0 L160 420 M0 0 L20 440" stroke="#2A2834" strokeWidth="14" strokeLinecap="round" />
    <rect x="-40" y="-40" width="80" height="60" rx="10" fill="#1A1822" stroke={K} strokeWidth="8" />
    <rect x="-250" y="-250" width="420" height="210" rx="24" fill="#22202C" stroke={K} strokeWidth="10" />
    <rect x="-250" y="-250" width="420" height="40" rx="20" fill="#34303E" />
    <rect x="170" y="-220" width="140" height="150" rx="12" fill="#14121A" stroke={K} strokeWidth="10" />
    <ellipse cx="310" cy="-145" rx="22" ry="70" fill="#0A0910" stroke={K} strokeWidth="6" />
    <ellipse cx="312" cy="-145" rx="12" ry="46" fill="#2A3A5A" />
    <ellipse cx="314" cy="-165" rx="5" ry="16" fill="#FFFFFF" opacity=".5" />
    <rect x="-230" y="-200" width="140" height="110" rx="8" fill="#0A0910" stroke={K} strokeWidth="6" />
    <rect x="-222" y="-192" width="124" height="94" rx="4" fill="#3A2C6A" opacity=".8" />
    {/* spia rossa "in onda" che lampeggia piano */}
    <circle cx="120" cy="-226" r="12" fill="#E8303A" opacity={0.6 + 0.4 * Math.sin(t * 3)} />
    <Glow id={`${id}-tally`} x={120} y={-226} r={50} t={t} color="#FF3A3A" amp={0.2} rate={3} opacity={0.6} />
    <path d="M-250 -60 L-380 120" stroke={K} strokeWidth="16" strokeLinecap="round" />
    <path d="M-250 -60 L-380 120" stroke="#3A3846" strokeWidth="6" strokeLinecap="round" />
  </g>
);

/** Spia da palco (cassa inclinata) sul bordo, in primo piano. */
export const Spia: React.FC<{ id: string; x: number; y: number; s?: number; colore: string; flip?: boolean }> = ({ id, x, y, s = 1, colore, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M-160 0 L-130 -150 L160 -110 L170 0 Z" fill={`url(#${id}-amp)`} stroke={K} strokeWidth="10" />
    <path d="M-124 -132 L150 -96 L156 -16 L-140 -16 Z" fill="#16141C" stroke={K} strokeWidth="5" />
    {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-130 + i * 29} -128 l-6 110`} stroke="#2A2632" strokeWidth="4" />)}
    <path d="M-130 -150 L160 -110" stroke={colore} strokeWidth="4" opacity=".6" />
  </g>
);

/** Cavi neri sul pavimento in primo piano. */
export const Cavi: React.FC<{ y: number; seed?: number }> = ({ y, seed = 5 }) => {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: 3 }, (_, i) => {
        const a = y + r() * 80, b = y + 40 + r() * 120;
        return (
          <g key={i}>
            <path d={`M-300 ${a} Q200 ${b} 500 ${a + 30} T1400 ${b}`} stroke={K} strokeWidth="16" fill="none" />
            <path d={`M-300 ${a - 4} Q200 ${b - 4} 500 ${a + 26} T1400 ${b - 4}`} stroke="#2A2838" strokeWidth="4" fill="none" />
          </g>
        );
      })}
    </g>
  );
};

/** Riflesso dell'asta sul pavimento lucido (a trattini tremolanti, mai un palo pieno). */
export const RiflessoAsta: React.FC<{ t: number; x: number; y: number; s?: number; colore: string; o?: number }> = ({ t, x, y, s = 1, colore, o = 1 }) => (
  <g opacity={0.35 * o}>
    {Array.from({ length: 7 }, (_, i) => (
      <rect key={i} x={x - 6 * s + Math.sin(t * 3 + i) * 4} y={y + (16 + i * 30) * s} width={12 * s} height={16 * s} rx={4} fill={i < 2 ? colore : '#8A88A0'} opacity={1 - i / 7} />
    ))}
  </g>
);

/** Ombreggiatura nera in basso (sotto i sottotitoli: oggetti in primo piano più scuri). */
export const OmbraBasso: React.FC<{ id: string; y?: number }> = ({ id, y = 1450 }) => (
  <rect x="-300" y={y} width="1680" height={2000 - y} fill={`url(#${id}-shade)`} />
);
