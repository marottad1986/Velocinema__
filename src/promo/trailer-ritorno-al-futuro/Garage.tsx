import React from 'react';
import { eo, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Fog, Glow, NearMotes, Reflection, Smoke } from '../../lib/elements';
import { TimeCar } from '../../scenes/ritorno-al-futuro/Linee';
import { CYAN, K, MAG, TINT, YEL, cam, type ShotProps } from './comune';

// Il garage di Doc, di notte: l'auto del tempo (la coupé squadrata generica dello schema, con le tre bobine gialle sul
// retro; mai l'auto del film) è collegata con due grossi cavi a un generatore. A `ev` (0,8 s) le bobine si accendono:
// alone giallo che cresce, scariche tra le bobine, vapore freddo che esce da sotto l'auto, il neon del muro che sfarfalla.
// Piani: muro con il pannello degli attrezzi (0,25) · scaffali e tubo al neon (0,5) · auto e generatore (0,75) ·
// pavimento lucido con il riflesso (0,75) · pneumatici e catena in primo piano (1,3) · vapore e particelle (1,6).

const r = rng(88);
const SPARK = Array.from({ length: 16 }, () => ({ a: r() * Math.PI * 2, d: 40 + r() * 140, ph: r(), s: 3 + r() * 4 }));

export const Garage: React.FC<ShotProps> = ({ t, dur, id, ev = 0.8 }) => {
  const C = cam(t, dur, { z: 0.09, pan: -45, cy: 950 });
  const on = eo(seg(t, ev, ev + 0.5));
  const neon = t < ev ? 0.85 : t < ev + 0.5 ? (Math.sin(t * 70) > 0 ? 1 : 0.25) : 1;
  const CX = 560, CY = 1080, S = 3.1; // l'auto
  const coil = { x: CX - 90 * S, y: CY - 36 * S };
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <Lin id={`${id}-wall`} stops={[[0, '#150F2A'], [0.45, '#2A2246'], [0.8, '#33284A'], [1, '#1C1530']]} />
        <Lin id={`${id}-floor`} stops={[[0, '#2A2240'], [0.5, '#1A1430'], [1, '#0C0818']]} />
        <Lin id={`${id}-metal`} stops={[[0, '#FFFFFF', 0.45], [0.35, '#FFFFFF', 0.05], [0.7, '#0E0A22', 0.15], [1, '#0E0A22', 0.5]]} />
        <pattern id={`${id}-peg`} width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="18" cy="18" r="4" fill="#0E0A1C" opacity=".6" /></pattern>
      </defs>
      <g transform={C.transform}>
        <g transform={C.L(0.25)}>
          <rect x="-200" width="1480" height="1920" fill={`url(#${id}-wall)`} />
          {/* il pannello degli attrezzi: sagome di chiavi, martello, seghetto */}
          <rect x="110" y="380" width="560" height="380" fill="#4A3A5E" stroke={K} strokeWidth="8" />
          <rect x="110" y="380" width="560" height="380" fill={`url(#${id}-peg)`} />
          <g stroke={K} strokeWidth="6" strokeLinecap="round" fill="#9AA6B8">
            <path d="M170 430 V600" /><circle cx="170" cy="430" r="18" fill="none" />
            <path d="M240 440 V620" /><circle cx="240" cy="440" r="22" fill="none" />
            <path d="M330 420 V640 M300 420 H360" />
            <path d="M420 430 L420 660 M400 430 H470 L470 470 H420" fill="none" />
            <path d="M520 420 L620 420 L620 470 L520 470 Z" fill="#C24A3A" /><path d="M570 470 V680" />
          </g>
          <path d="M130 700 H650" stroke="#0E0A1C" strokeWidth="10" opacity=".5" />
          {/* la saracinesca chiusa a destra, a doghe */}
          <rect x="740" y="300" width="460" height="760" fill="#3A3150" stroke={K} strokeWidth="8" />
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M740 ${340 + i * 52} H1200`} stroke="#241C38" strokeWidth="6" />)}
          <path d="M760 310 V1050" stroke="#FFFFFF" strokeWidth="3" opacity=".12" />
        </g>
        {/* tubo al neon sul muro e mensola con le taniche */}
        <g transform={C.L(0.5)}>
          <Glow id={`${id}-neon`} x={420} y={300} r={340} t={t} color={CYAN} amp={0.05} rate={5} opacity={0.35 * neon} />
          <rect x="200" y="285" width="440" height="22" rx="11" fill={CYAN} opacity={0.5 + 0.5 * neon} stroke={K} strokeWidth="5" />
          <path d="M210 296 H630" stroke="#FFFFFF" strokeWidth="5" opacity={0.6 * neon} />
          <rect x="780" y="820" width="360" height="22" fill="#5A3A2A" stroke={K} strokeWidth="6" />
          {[[820, '#C24A3A'], [900, '#2E8A6A'], [980, '#C9A24A']].map(([x, c]) => (
            <g key={String(x)} transform={`translate(${x} 820)`}><rect x="-30" y="-92" width="60" height="92" rx="6" fill={String(c)} stroke={K} strokeWidth="5" /><rect x="-10" y="-108" width="20" height="18" fill="#2A2232" stroke={K} strokeWidth="4" /></g>
          ))}
        </g>
        {/* la lampada industriale che pende dal soffitto e illumina l'auto */}
        <g transform={C.L(0.6)}>
          <path d="M600 0 V330" stroke={K} strokeWidth="6" />
          <Beam id={`${id}-lb`} x={600} y={380} t={t} length={820} spread={900} color="#FFE7B0" angle={90} opacity={0.28} />
          <path d="M520 380 L560 320 H640 L680 380 Z" fill="#2E5A5A" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <ellipse cx="600" cy="382" rx="78" ry="12" fill="#FFF0C0" />
          <Glow id={`${id}-lg`} x={600} y={390} r={160} t={t} color="#FFE7B0" amp={0.04} rate={3} opacity={0.6} />
        </g>
        {/* pavimento lucido, riflesso dell'auto capovolto, macchia d'olio */}
        <g transform={C.L(0.75)}>
          <rect x="-200" y="1160" width="1480" height="760" fill={`url(#${id}-floor)`} />
          <path d="M-200 1160 H1280" stroke="#4A3E66" strokeWidth="6" />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-100 + i * 420} 1160 L${-400 + i * 560} 1920`} stroke="#0C0818" strokeWidth="5" opacity=".6" />)}
          <g transform={`translate(${CX} ${CY + 175}) scale(1 -0.55)`} opacity=".22"><TimeCar T={t} glow={on} s={S} /></g>
          <Reflection t={t} x={coil.x} y={1200} color={YEL} n={8} w={160} gap={24} opacity={0.5 * on} />
          <Reflection t={t} x={420} y={1180} color={CYAN} n={6} w={260} gap={26} opacity={0.25 * neon} />
          <ellipse cx="300" cy="1280" rx="120" ry="20" fill="#06040C" opacity=".6" />
        </g>
        {/* il generatore e i cavi */}
        <g transform={C.L(0.75)}>
          <path d={`M170 1110 C220 1220 ${coil.x - 40} 1230 ${coil.x - 10} ${coil.y + 30}`} fill="none" stroke="#0A0612" strokeWidth="18" strokeLinecap="round" />
          <path d={`M200 1090 C260 1180 ${coil.x} 1180 ${coil.x + 30} ${coil.y + 40}`} fill="none" stroke="#2A1A3A" strokeWidth="14" strokeLinecap="round" />
          <g transform="translate(140 1040)">
            <rect x="-90" y="-110" width="180" height="180" rx="10" fill="#5A6A7A" stroke={K} strokeWidth="9" />
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M-70 ${-80 + i * 24} H10`} stroke={K} strokeWidth="6" />)}
            <circle cx="50" cy="-60" r="22" fill="#1A1424" stroke={K} strokeWidth="6" />
            <path d="M50 -60 L62 -74" stroke={RED_} strokeWidth="5" transform={`rotate(${-80 + 160 * on} 50 -60)`} />
            <circle cx="50" cy="0" r="10" fill={on > 0.5 ? '#7CF07C' : '#2A4A2A'} stroke={K} strokeWidth="4" />
            <path d="M-88 -108 H88" stroke="#FFFFFF" strokeWidth="3" opacity=".3" />
          </g>
          {/* l'auto: alone delle bobine che cresce, scariche */}
          <Glow id={`${id}-coil`} x={coil.x} y={coil.y} r={180 + 160 * on} t={t} color={YEL} amp={0.12} rate={14} opacity={0.15 + 0.7 * on} />
          <ellipse cx={CX} cy={CY + 90} rx={420} ry={26} fill="#000" opacity=".5" />
          <g transform={`translate(${CX} ${CY})`}>
            <TimeCar T={t} glow={0.15 + 0.85 * on} s={S} ink={K} />
            <g transform={`scale(${S})`} strokeLinejoin="round">
              {/* lamiera metallica: luce dall'alto, ombra in basso */}
              <path d="M-120 10 L-118 -22 L-70 -30 L-30 -58 L40 -58 L78 -30 L120 -22 L124 10 Z" fill={`url(#${id}-metal)`} />
              <path d="M-116 -21 L-70 -29 L-30 -57 L40 -57 L78 -29 L119 -21" fill="none" stroke="#FFFFFF" strokeWidth="1.6" opacity=".7" />
              {/* riflesso della lampada sul vetro */}
              <path d="M-18 -50 L-4 -50 L-20 -32 L-34 -32 Z M2 -50 L8 -50 L-8 -32 L-14 -32 Z" fill="#FFFFFF" opacity=".35" />
              {/* il macchinario del tempo sul retro: prese d'aria, tubi, fascio di cavi */}
              {[0, 1, 2, 3].map((i) => <path key={i} d={`M-117 ${-16 + i * 6} H-96`} stroke={K} strokeWidth="1.6" />)}
              <path d="M-100 -26 Q-108 -10 -104 6 M-86 -26 Q-90 -8 -84 6" fill="none" stroke="#C8962E" strokeWidth="3" strokeLinecap="round" />
              <path d="M-100 -26 Q-108 -10 -104 6 M-86 -26 Q-90 -8 -84 6" fill="none" stroke={K} strokeWidth="1" />
              <rect x="-62" y="-26" width="10" height="4" fill="#C9D2DC" stroke={K} strokeWidth="1" />
              <path d="M-60 -14 H-48 M30 -14 H42" stroke={K} strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="-110" cy="-50" r="3" fill={YEL} opacity={0.3 + 0.7 * on} />
            </g>
          </g>
          {/* fari accesi */}
          <Beam id={`${id}-hb`} x={CX + 122 * S} y={CY - 14 * S} t={t} length={520} spread={260} color="#FFE7B0" angle={4} opacity={0.15 + 0.35 * on} />
          {on > 0.05 && SPARK.map((p, i) => {
            const u = mod(t * 2.2 + p.ph, 1);
            const x = coil.x + Math.cos(p.a) * p.d * u, y = coil.y + Math.sin(p.a) * p.d * u * 0.7;
            return <circle key={i} cx={x} cy={y} r={p.s * (1 - u)} fill={i % 2 ? '#FFF6B0' : YEL} opacity={on * (1 - u)} />;
          })}
          {on > 0.05 && [0, 1].map((k) => {
            const j = Math.floor(t * 12 + k * 5);
            const rr = rng(j);
            const pts = Array.from({ length: 6 }, (_, i) => `${coil.x - 70 + i * 28} ${coil.y - 30 - rr() * 60}`).join(' L');
            return <path key={k} d={`M${pts}`} fill="none" stroke="#FFF6B0" strokeWidth="5" opacity={on * 0.9} strokeLinejoin="round" />;
          })}
        </g>
        {/* vapore freddo da sotto l'auto */}
        <g transform={C.L(1.1)} opacity={on}>
          {[-330, -110, 110, 330].map((dx, i) => (
            <Smoke key={dx} id={`${id}-v${i}`} t={t + i * 0.37} x={CX + dx} y={CY + 100} color="#E6EEF8" n={7} rise={90} wind={dx > 0 ? 260 : -260} r0={20} r1={200} speed={0.5} opacity={0.55} />
          ))}
          <Fog id={`${id}-fog`} t={t} y={CY + 110} color="#DDE6F2" rx={620} ry={70} drift={40} opacity={0.45} />
        </g>
        {/* primo piano: pila di pneumatici a sinistra, catena che pende a destra */}
        <g transform={C.L(1.3)}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(-30 ${1500 - i * 110})`}>
              <ellipse rx="190" ry="62" fill="#120C1A" stroke={K} strokeWidth="10" />
              <ellipse rx="90" ry="28" fill="#06040A" />
              <path d="M-160 -30 Q0 -70 160 -30" fill="none" stroke={MAG} strokeWidth="4" opacity=".35" />
            </g>
          ))}
          {Array.from({ length: 16 }, (_, i) => (
            <ellipse key={i} cx={1010 + Math.sin(t * 1.3) * (i * 0.8)} cy={240 + i * 44} rx="12" ry="22" fill="none" stroke="#7A7090" strokeWidth="7" transform={`rotate(${i % 2 ? 90 : 0} ${1010 + Math.sin(t * 1.3) * (i * 0.8)} ${240 + i * 44})`} />
          ))}
        </g>
        <g transform={C.L(1.6)}><NearMotes id={`${id}-near`} t={t} color="#DDE6F2" opacity={0.08 + 0.08 * on} /></g>
      </g>
      {/* un lampo giallo all'accensione */}
      <rect width="1080" height="1920" fill="#FFF6B0" opacity={0.35 * (seg(t, ev, ev + 0.05) * (1 - seg(t, ev + 0.05, ev + 0.4)))} />
      <Finish id={id} tint={TINT} tintOpacity={0.1} />
    </svg>
  );
};

const RED_ = '#E8553F';
