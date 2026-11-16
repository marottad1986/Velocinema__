import React from 'react';
import { eio, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { RIGHTEOUS, SERIF } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes } from '../../lib/elements';
import { K, SEPIA, cam, type ShotProps } from './comune';

// 1885, il cimitero sulla collina fuori dal paese, al tramonto, in toni seppia e arancio. In primo piano la lapide di
// pietra; la sabbia portata dal vento la ricopre. A `ev` («Doc sta per morire») una folata spazza via la sabbia e scopre la
// scritta «QUI GIACE DOC · 1885»; un anello rosso (il pericolo, vocabolario dello schema) pulsa attorno al nome.
// Dietro: il sole basso tra le mese, croci di legno storte, una staccionata, un albero secco con un avvoltoio (animale
// generico, nel nostro stile). Niente persone.
// Piani: cielo e sole (0,2) · mese lontane (0,4) · croci, staccionata, albero (0,65) · lapide (0,9) · cespugli e
// rotolacampo in primo piano (1,3) · sabbia nel vento (1,6).

const r = rng(1885);
const SAND = Array.from({ length: 70 }, () => ({ x: r() * 1300, y: 700 + r() * 900, v: 160 + r() * 260, s: 2 + r() * 4, ph: r() }));

export const Lapide: React.FC<ShotProps> = ({ t, dur, id, ev = 1.3 }) => {
  const C = cam(t, dur, { z: 0.12, pan: 40, cx: 520, cy: 960 });
  const blow = eio(seg(t, ev, ev + 0.9));
  const gust = seg(t, ev - 0.1, ev + 0.3) * (1 - seg(t, ev + 0.8, ev + 1.6));
  const ring = eo(seg(t, ev + 0.6, ev + 1.0));
  const wing = Math.sin(t * 3) * 6;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <Lin id={`${id}-sky`} stops={[[0, '#1E1028'], [0.3, '#4A1E32'], [0.55, '#9A3E2E'], [0.72, '#E8843A'], [1, '#F6C070']]} />
        <Lin id={`${id}-ground`} stops={[[0, '#8A5A34'], [0.4, '#5E3A22'], [1, '#2A1810']]} />
        <clipPath id={`${id}-clip`}><path d="M-240 240 V-160 Q-240 -330 0 -330 Q240 -330 240 -160 V240 Z" /></clipPath>
        <Lin id={`${id}-stone`} x2={1} y2={0} stops={[[0, '#6A5448'], [0.55, '#9A8270'], [1, '#E2C29A']]} />
      </defs>
      <g transform={C.transform}>
        <g transform={C.L(0.2)}>
          <rect x="-200" width="1480" height="1920" fill={`url(#${id}-sky)`} />
          <Glow id={`${id}-sun`} x={760} y={900} r={420} t={t} color="#FFD27A" amp={0.03} rate={1} opacity={0.35 + 0.45 * blow} />
          <circle cx="760" cy="900" r="110" fill="#FFE2A0" />
          <ellipse cx={lerp(760, 1260, blow)} cy="890" rx="230" ry="70" fill="#5A2430" opacity=".92" />
          {[[180, 420, 280], [820, 360, 240], [480, 520, 180]].map(([x, y, w], i) => (
            <ellipse key={i} cx={x + t * 6} cy={y} rx={w} ry={w * 0.12} fill="#C8604A" opacity=".55" />
          ))}
        </g>
        {/* le mese lontane, senza contorni */}
        <g transform={C.L(0.4)}>
          <path d="M-200 980 V880 L-60 870 L-40 820 L180 815 L200 870 L340 880 L360 950 L560 960 L600 900 L640 895 L660 940 H1280 V980 Z" fill="#6A2E36" />
          <path d="M760 960 L790 860 L960 850 L990 900 L1120 905 L1140 960 Z" fill="#7A3A3A" />
          <path d="M-200 1000 H1280 V940 Q900 920 540 960 Q200 990 -200 950 Z" fill="#8A4A3A" />
        </g>
        {/* croci storte, staccionata, l'albero secco con l'avvoltoio */}
        <g transform={C.L(0.65)}>
          <path d="M-200 1010 Q300 960 1280 1000 V1920 H-200 Z" fill={`url(#${id}-ground)`} />
          {Array.from({ length: 14 }, (_, i) => <g key={i} transform={`translate(${-60 + i * 90} ${985 - Math.sin(i) * 6})`}><path d="M0 0 V-70" stroke="#3A2416" strokeWidth="9" /><path d="M-4 -70 L0 -78 L4 -70" fill="#3A2416" /></g>)}
          <path d="M-60 948 H1180 M-60 972 H1180" stroke="#3A2416" strokeWidth="7" />
          {[[180, 1050, -8], [360, 1030, 6], [860, 1060, -12]].map(([x, y, a], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
              <path d="M0 40 V-110 M-46 -70 H46" stroke="#4A2E1A" strokeWidth="18" strokeLinecap="round" />
              <path d="M0 40 V-110 M-46 -70 H46" stroke={K} strokeWidth="4" opacity=".5" />
              <ellipse cy="44" rx="60" ry="14" fill="#3A2214" opacity=".6" />
            </g>
          ))}
          <g transform="translate(880 1000)">
            <path d="M0 0 C-10 -120 10 -220 -10 -330 M-6 -200 C40 -230 80 -260 110 -320 M-8 -270 C-60 -300 -80 -340 -120 -360 M60 -260 L90 -250" fill="none" stroke="#2A1810" strokeWidth="20" strokeLinecap="round" />
            {/* l'avvoltoio appollaiato, ali che si sistemano */}
            <g transform="translate(100 -322)">
              <path d={`M-30 0 Q-6 ${-36 - wing} 26 -6 Q10 10 -30 0 Z`} fill="#2A1A1E" stroke={K} strokeWidth="4" />
              <path d="M18 -16 Q34 -34 40 -20 Q34 -12 22 -10" fill="#C88A7A" stroke={K} strokeWidth="3" />
              <path d="M40 -22 L50 -18 L40 -16" fill="#E8C070" />
            </g>
          </g>
          {/* un cactus a sinistra */}
          <g transform="translate(60 1020)">
            <path d="M0 0 V-170 Q0 -190 20 -190 Q40 -190 40 -170 V0 Z M40 -90 H70 V-140 Q70 -156 82 -156 Q94 -156 94 -140 V-70 H40 Z" fill="#4A6A3A" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          </g>
        </g>
        {/* la lapide */}
        <g transform={C.L(0.9)}>
          <g transform="translate(520 1020)">
            <ellipse cx="40" cy="250" rx="300" ry="40" fill="#1E1008" opacity=".55" />
            <path d="M-240 240 V-160 Q-240 -330 0 -330 Q240 -330 240 -160 V240 Z" fill={`url(#${id}-stone)`} stroke={K} strokeWidth="11" />
            <path d="M232 -160 Q232 -320 0 -322" fill="none" stroke="#FFD8A0" strokeWidth="6" opacity=".8" />
            {/* crepe, muschio, scheggiature */}
            <path d="M-200 -60 L-170 -20 L-186 40 M150 120 L180 160" fill="none" stroke="#3A2E2A" strokeWidth="5" />
            <path d="M-240 200 Q-200 170 -160 200 Q-120 170 -80 205" fill="#5A6A3A" opacity=".8" />
            <path d="M-200 -170 Q0 -290 200 -170" fill="none" stroke="#3A2E2A" strokeWidth="5" opacity=".6" />
            {/* la scritta incisa */}
            <text x="0" y="-150" textAnchor="middle" fontFamily={SERIF} fontSize="56" fill="#2A201C" letterSpacing="6">QUI GIACE</text>
            <text x="0" y="-20" textAnchor="middle" fontFamily={RIGHTEOUS} fontSize="150" fill="#2A201C">DOC</text>
            <text x="0" y="90" textAnchor="middle" fontFamily={SERIF} fontSize="64" fill="#2A201C" letterSpacing="8">1885</text>
            <path d="M-120 140 H120" stroke="#2A201C" strokeWidth="5" />
            <text x="0" y="-20" textAnchor="middle" fontFamily={RIGHTEOUS} fontSize="150" fill="none" stroke="#FFD8A0" strokeWidth="2" opacity=".4" transform="translate(3 -3)">DOC</text>
            {/* l'ombra della nuvola copre la lapide; a ev scivola via e il sole scopre la scritta */}
            <g clipPath={`url(#${id}-clip)`}>
              <rect x={-260 + 560 * blow} y="-340" width="900" height="600" fill="#140A10" opacity={0.82} />
              <rect x={-300 + 560 * blow} y="-340" width="60" height="600" fill="#140A10" opacity={0.4} />
            </g>
            {/* la sabbia ammucchiata alla base */}
            <path d="M-270 240 Q-200 170 -100 200 Q0 160 120 205 Q200 180 280 240 Z" fill="#B07A48" stroke={K} strokeWidth="6" />
            <ellipse cx="0" cy="-30" rx={210 + 8 * Math.sin(t * 6)} ry={110 + 6 * Math.sin(t * 6)} fill="none" stroke="#E8553F" strokeWidth="10" opacity={ring} />
          </g>
        </g>
        {/* primo piano: cespugli secchi ai bordi, il rotolacampo che passa */}
        <g transform={C.L(1.3)}>
          <path d="M-200 1260 Q200 1220 600 1270 Q900 1300 1280 1250 V1920 H-200 Z" fill="#2A1810" />
          {[[-20, 1250], [1080, 1240]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              {Array.from({ length: 9 }, (_, j) => <path key={j} d={`M0 0 Q${(j - 4) * 20} -80 ${(j - 4) * 34 + Math.sin(t * 2 + j) * 6} ${-140 - (j % 3) * 30}`} fill="none" stroke="#6A4A2A" strokeWidth="7" strokeLinecap="round" />)}
            </g>
          ))}
          {(() => {
            const u = mod(t * 0.35 + 0.1, 1.4) - 0.2;
            const x = lerp(-150, 1250, u), rot = u * 900;
            return (
              <g transform={`translate(${x} ${1230 - Math.abs(Math.sin(u * 14)) * 30}) rotate(${rot})`}>
                {Array.from({ length: 10 }, (_, j) => <ellipse key={j} rx="70" ry="26" fill="none" stroke="#8A6A3A" strokeWidth="5" transform={`rotate(${j * 18})`} />)}
              </g>
            );
          })()}
        </g>
        {/* sabbia nel vento: più forte durante la folata */}
        <g transform={C.L(1.6)}>
          {SAND.map((p, i) => {
            const x = mod(p.x + t * p.v * (1 + 3 * gust) + p.ph * 900, 1400) - 160;
            return <path key={i} d={`M${x} ${p.y} l${-p.s * (3 + 8 * gust)} ${p.s * 0.6}`} stroke="#F2C890" strokeWidth={p.s} strokeLinecap="round" opacity={0.35 + 0.4 * gust} />;
          })}
          <NearMotes id={`${id}-near`} t={t} color="#F2C890" opacity={0.08 + 0.12 * gust} vx={-120} />
        </g>
      </g>
      <Finish id={id} tint={SEPIA} tintOpacity={0.12} />
    </svg>
  );
};
