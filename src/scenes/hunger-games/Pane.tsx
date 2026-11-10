import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Glow, NearMotes, Smoke, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { HGDefs, K } from './Comuni';

// Il ragazzo del pane: la carrozza ristorante del treno di lusso che porta i due ragazzi a Capitol City, al tramonto.
// Dal grande finestrino il paesaggio corre veloce; sulla tavola la pagnotta calda nel cestino (Peeta), i dolci di
// Capitol City, la bottiglia di liquore e il bicchiere (Haymitch). Eventi: 1ª frase la pagnotta si illumina di una
// luce calda e manda vapore (il pane regalato anni prima); 2ª frase la bottiglia si inclina e versa, il bicchiere si
// rovescia e rotola (il mentore che beve troppo). Il treno vibra di continuo, le lampade oscillano.
// Piani: paesaggio che corre fuori (0,2–0,5) · parete e finestrino (0,65) · tavola apparecchiata (1,0)
//        · tende di velluto e lampada in primo piano (1,25) · pulviscolo dorato vicino (1,6)

const r = rng(303);
const HILLS = Array.from({ length: 8 }, (_, i) => ({ x: i * 320, h: 60 + r() * 90 }));
const TREES = Array.from({ length: 14 }, () => ({ x: r() * 1600, h: 90 + r() * 80 }));
const POLES = Array.from({ length: 4 }, (_, i) => i * 420);

export const Pane: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const shake = Math.sin(t * 31) * 1.2 + Math.sin(t * 17) * 0.8;
  const tb = griglia(cues[0] + 1.2);
  const bread = eo(seg(t, tb, tb + 0.8));
  const tg = griglia(cues[1] + 2.4);
  const pour = eo(seg(t, tg - 0.6, tg));
  const tip = eo(seg(t, tg, tg + 0.35));
  const roll = eo(seg(t, tg + 0.35, tg + 1.6));
  const spill = eo(seg(t, tg + 0.2, tg + 1.4));
  const fallB = eo(seg(t, tg + 0.3, tg + 0.7)); // la bottiglia cade distesa
  const sway = Math.sin(t * 1.7) * 3;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pn" />
        <HGDefs id="pn" />
        <Lin id="pn-sky" stops={[[0, '#3A2A4A'], [0.45, '#C86A4A'], [0.75, '#F2B060'], [1, '#F8D890']]} />
        <Lin id="pn-wall" stops={[[0, '#2A1418'], [0.5, '#4A1E24'], [1, '#1E0E10']]} />
        <Lin id="pn-wood" x2={1} y2={0} stops={[[0, '#3A2014'], [0.5, '#7A4A28'], [1, '#2A160C']]} />
        <Lin id="pn-cloth" stops={[[0, '#F4ECDC'], [0.6, '#D8CCB4'], [1, '#A8987A']]} />
        <Lin id="pn-velvet" x2={1} y2={0} stops={[[0, '#2A0A10'], [0.4, '#7A1A26'], [0.7, '#9A2A34'], [1, '#3A0E14']]} />
        <Lin id="pn-bottle" x2={1} y2={0} stops={[[0, '#3A2A10'], [0.4, '#A8742A'], [0.6, '#D8A040'], [1, '#4A3010']]} />
        <radialGradient id="pn-bread" cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#F8C878" />
          <stop offset=".6" stopColor="#C8823A" />
          <stop offset="1" stopColor="#7A4418" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        <g transform={`translate(0 ${shake})`}>
          {/* PIANO 0 — fuori dal finestrino: cielo al tramonto, città lontana, colline e alberi che corrono */}
          <g transform={L(0.2)}>
            <rect x="-200" y="500" width="1480" height="700" fill="url(#pn-sky)" />
            <Glow id="pn-sun" x={720} y={900} r={260} t={t} color="#FFE0A0" amp={0.03} rate={1} opacity={0.8} />
            <circle cx="720" cy="900" r="50" fill="#FFF0C0" />
            {/* Capitol City lontana sull'orizzonte */}
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} d={`M${820 + i * 18} 960 V${960 - 30 - ((i * 37) % 50)} l7 -14 l7 14 V960 Z`} fill="#8A5A4A" opacity=".8" />
            ))}
          </g>
          <g transform={L(0.3)}>
            {HILLS.map((h, i) => {
              const x = mod(h.x - t * 260, 2560) - 400;
              return <path key={i} d={`M${x} 980 q160 ${-h.h} 320 0 Z`} fill="#6A4A5A" />;
            })}
            <rect x="-200" y="978" width="1480" height="60" fill="#5A3E4A" />
          </g>
          <g transform={L(0.5)}>
            {TREES.map((tr, i) => {
              const x = mod(tr.x - t * 900, 1700) - 200;
              return (
                <g key={i}>
                  <path d={`M${x} 1040 l26 ${-tr.h} l26 ${tr.h} Z`} fill="#2A2A30" />
                  <path d={`M${x + 34} ${1040 - tr.h * 0.5} h-90`} stroke="#F8D890" strokeWidth="3" opacity=".25" />
                </g>
              );
            })}
            {POLES.map((px, i) => {
              const x = mod(px - t * 1500, 1680) - 200;
              return <path key={i} d={`M${x} 1060 V700 M${x - 30} 730 H${x + 30}`} stroke="#1A1418" strokeWidth="10" />;
            })}
            {/* linee di velocità */}
            {Array.from({ length: 7 }, (_, i) => {
              const x = mod(i * 260 - t * 2200, 1820) - 300;
              return <path key={`v${i}`} d={`M${x} ${760 + i * 40} h${180 + (i % 3) * 60}`} stroke="#FFF4D8" strokeWidth="3" opacity=".35" strokeLinecap="round" />;
            })}
          </g>

          {/* PIANO 1 — parete della carrozza con il finestrino (0,65) */}
          <g transform={L(0.65)}>
            <path d="M-200 -200 H1280 V2200 H-200 Z M190 680 H890 Q910 680 910 700 V1060 Q910 1080 890 1080 H190 Q170 1080 170 1060 V700 Q170 680 190 680 Z" fill="url(#pn-wall)" fillRule="evenodd" />
            {/* cornice del finestrino */}
            <rect x="170" y="680" width="740" height="400" rx="20" fill="none" stroke="#C8A050" strokeWidth="16" />
            <rect x="170" y="680" width="740" height="400" rx="20" fill="none" stroke={K} strokeWidth="5" />
            <path d="M540 680 V1080" stroke="#C8A050" strokeWidth="12" />
            <path d="M540 680 V1080" stroke={K} strokeWidth="3" />
            {/* riflesso sul vetro */}
            <path d="M220 730 L330 730 L240 1020 L200 1020 Z M600 730 L650 730 L580 980 L560 980 Z" fill="#FFFFFF" opacity=".08" />
            {/* boiserie e applique */}
            {[60, 1020].map((ax, i) => (
              <g key={i}>
                <path d={`M${ax - 18} 760 h36 l-8 40 h-20 Z`} fill="#C8A050" stroke={K} strokeWidth="5" />
                <path d={`M${ax - 26} 760 Q${ax} 700 ${ax + 26} 760 Z`} fill="#FFE8B0" stroke={K} strokeWidth="5" />
                <Glow id={`pn-ap${i}`} x={ax} y={750} r={130} t={t} color="#FFD890" amp={0.06} rate={5} ph={i} opacity={0.6} />
              </g>
            ))}
            <path d="M-200 1100 H1280" stroke="#C8A050" strokeWidth="8" />
            {Array.from({ length: 6 }, (_, k) => <rect key={k} x={-120 + k * 240} y={1120} width="200" height="120" rx="10" fill="none" stroke="#6A2A30" strokeWidth="5" />)}
          </g>

          {/* PIANO 2 — la tavola apparecchiata (1,0) */}
          <g transform={`${L(1.0)} translate(0 -50)`}>
            <path d="M-200 1150 H1280 L1320 1300 H-240 Z" fill="url(#pn-cloth)" stroke={K} strokeWidth="9" />
            <path d="M-240 1300 H1320 V1360 Q1100 1400 860 1360 Q620 1400 400 1360 Q160 1400 -240 1360 Z" fill="#E8DCC4" stroke={K} strokeWidth="8" />
            <path d="M-200 1160 H1280" stroke="#FFFFFF" strokeWidth="5" opacity=".6" />
            {/* alzata con i dolci colorati di Capitol City */}
            <g transform="translate(560 1200)">
              <path d="M-6 0 V-160 M-90 -60 H80 M-60 -150 H50" stroke="#C8A050" strokeWidth="8" />
              <ellipse cx="-4" cy="-60" rx="96" ry="14" fill="#E8D8B0" stroke={K} strokeWidth="5" />
              <ellipse cx="-4" cy="-150" rx="64" ry="10" fill="#E8D8B0" stroke={K} strokeWidth="5" />
              {[[-62, '#E88AB0'], [-26, '#8AD0E8'], [12, '#B8E88A'], [48, '#E8C06A']].map(([dx, c], i) => (
                <g key={i}><rect x={Number(dx) - 14} y={-92} width="28" height="26" rx="6" fill={String(c)} stroke={K} strokeWidth="4" /><circle cx={Number(dx)} cy={-96} r="6" fill="#F4F0E8" stroke={K} strokeWidth="2" /></g>
              ))}
              {[[-34, '#E8A0D0'], [16, '#A0E0C8']].map(([dx, c], i) => <rect key={i} x={Number(dx) - 14} y={-182} width="28" height="26" rx="6" fill={String(c)} stroke={K} strokeWidth="4" />)}
            </g>
            {/* il cestino con la pagnotta (Peeta) */}
            <Glow id="pn-bg" x={260} y={1180} r={260} t={t} color="#FFB060" amp={0.08} rate={4} opacity={0.2 + 0.6 * bread} />
            <g transform="translate(260 1250)">
              <path d="M-150 -40 Q-150 40 0 46 Q150 40 150 -40 Z" fill="#8A5A2A" stroke={K} strokeWidth="8" />
              {Array.from({ length: 7 }, (_, k) => <path key={k} d={`M${-130 + k * 44} -36 Q${-120 + k * 44} 10 ${-110 + k * 42} 38`} stroke="#5A3618" strokeWidth="5" fill="none" />)}
              <path d="M-150 -40 Q0 -60 150 -40" stroke="#C88A4A" strokeWidth="10" fill="none" />
              <path d="M-90 -40 Q-80 -50 -60 -48" stroke={K} strokeWidth="0" />
              {/* pagnotta */}
              <path d="M-118 -44 Q-120 -150 0 -160 Q120 -150 118 -44 Q0 -30 -118 -44 Z" fill="url(#pn-bread)" stroke={K} strokeWidth="8" />
              {[-50, 0, 50].map((cx) => <path key={cx} d={`M${cx - 26} -120 Q${cx} -100 ${cx + 26} -128`} stroke="#5A3010" strokeWidth="7" fill="none" strokeLinecap="round" />)}
              <path d="M-90 -110 Q-60 -150 -10 -150" stroke="#FFE8B0" strokeWidth="6" fill="none" opacity={0.5 + 0.4 * bread} strokeLinecap="round" />
              {/* crosta bruciacchiata su un lato: il pane bruciato */}
              <path d="M70 -140 Q116 -120 116 -60 Q96 -90 70 -140 Z" fill="#3A2010" opacity=".75" />
            </g>
            <g opacity={bread}>
              <Wisps t={t} x={230} y={1100} color="#FFF4E0" n={3} h={170} width={6} opacity={0.7} />
              <Wisps t={t + 0.7} x={290} y={1096} color="#FFF4E0" n={2} h={150} width={5} opacity={0.6} />
            </g>
            {/* bottiglia di liquore e bicchiere (Haymitch) */}
            <g transform={`translate(${860 + 40 * fallB} ${1240 - 40 * fallB}) rotate(${-38 * pour - 52 * fallB})`}>
              <path d="M-40 0 V-170 Q-40 -200 -16 -214 V-270 H16 V-214 Q40 -200 40 -170 V0 Z" fill="url(#pn-bottle)" stroke={K} strokeWidth="8" />
              <rect x="-20" y="-288" width="40" height="22" fill="#2A1A10" stroke={K} strokeWidth="5" />
              <rect x="-32" y="-130" width="64" height="70" fill="#F2E8D8" stroke={K} strokeWidth="5" />
              <path d="M-20 -110 H20 M-14 -90 H14" stroke="#7A5A3A" strokeWidth="5" />
              <path d="M-28 -160 V-20" stroke="#FFF2C0" strokeWidth="6" opacity=".5" />
            </g>
            {/* il bicchiere che si rovescia e rotola */}
            <g transform={`translate(${720 - 200 * roll} ${1230 + 4 * tip}) rotate(${lerp(0, -90, tip) - 360 * roll})`}>
              <path d="M-30 0 L-38 -90 H38 L30 0 Z" fill="#DCEAF0" fillOpacity=".35" stroke={K} strokeWidth="6" />
              <path d="M-33 -40 H33 L30 0 H-30 Z" fill="#C8862A" opacity={0.85 * (1 - tip)} />
              <path d="M-24 -80 L-20 -10" stroke="#FFFFFF" strokeWidth="4" opacity=".6" />
            </g>
            {/* macchia di liquore sulla tovaglia */}
            <ellipse cx={640} cy={1252} rx={90 * spill} ry={16 * spill} fill="#B8742A" opacity={0.6 * spill} />
            {/* il liquore che cola dal collo della bottiglia distesa */}
            {fallB >= 1 && [0, 1, 2].map((k) => {
              const p = ((t * 1.6 + k / 3) % 1);
              return <ellipse key={k} cx={628} cy={1206 + p * 40} rx="5" ry="8" fill="#C8862A" stroke={K} strokeWidth="2" opacity={1 - p * 0.6} />;
            })}
            {/* posate e piatto */}
            <ellipse cx="400" cy="1320" rx="0" ry="0" />
            <path d="M440 1240 l10 70 M470 1240 l-6 70" stroke="#B8B8BC" strokeWidth="6" strokeLinecap="round" />
          </g>

          {/* PIANO 3 — tende di velluto che incorniciano e la lampada a sospensione (1,25) */}
          <g transform={L(1.25)}>
            <path d="M-200 -200 H180 Q120 300 170 700 Q130 1100 60 1500 Q0 1700 -200 1800 Z" fill="url(#pn-velvet)" stroke={K} strokeWidth="10" />
            <path d="M1280 -200 H900 Q960 300 910 700 Q950 1100 1020 1500 Q1080 1700 1280 1800 Z" fill="url(#pn-velvet)" stroke={K} strokeWidth="10" />
            {[40, 100].map((fx) => <path key={fx} d={`M${fx} -200 Q${fx - 30} 600 ${fx - 60} 1500`} stroke="#3A0A12" strokeWidth="8" fill="none" />)}
            {[980, 1040].map((fx) => <path key={fx} d={`M${fx} -200 Q${fx + 30} 600 ${fx + 60} 1500`} stroke="#3A0A12" strokeWidth="8" fill="none" />)}
            {/* cordoni dorati */}
            <path d="M150 760 Q90 800 40 760" stroke="#E8C060" strokeWidth="12" fill="none" />
            <path d="M930 760 Q990 800 1040 760" stroke="#E8C060" strokeWidth="12" fill="none" />
            <path d="M40 760 v60 M1040 760 v60" stroke="#E8C060" strokeWidth="10" />
            {/* bordo della tavola in primo piano */}
            <path d="M-200 1560 H1280 V2200 H-200 Z" fill="#1A0C0C" />
            <path d="M-200 1560 H1280" stroke="#6A3A2A" strokeWidth="10" />
            {/* valigia di cuoio sul sedile, a sinistra */}
            <g transform="translate(250 1760) rotate(-4)">
              <rect x="-170" y="-150" width="340" height="190" rx="18" fill="#7A4A26" stroke={K} strokeWidth="9" />
              <path d="M-170 -96 H170" stroke="#4A2A14" strokeWidth="7" />
              <path d="M-50 -150 Q-50 -196 0 -196 Q50 -196 50 -150" fill="none" stroke={K} strokeWidth="14" />
              <rect x="-110" y="-110" width="26" height="30" rx="4" fill="#C8A050" stroke={K} strokeWidth="4" />
              <rect x="84" y="-110" width="26" height="30" rx="4" fill="#C8A050" stroke={K} strokeWidth="4" />
              <path d="M-150 -140 Q-60 -146 40 -142" stroke="#C8925A" strokeWidth="5" fill="none" />
            </g>
            {/* tazzina e piattino in primo piano */}
            <g transform={`translate(700 1700) rotate(${sway * 0.2})`}>
              <ellipse cx="0" cy="0" rx="130" ry="26" fill="#F4ECDC" stroke={K} strokeWidth="8" />
              <path d="M70 -86 Q126 -84 108 -44 Q96 -24 62 -30" fill="none" stroke={K} strokeWidth="9" />
              <path d="M-80 -110 Q-76 -14 0 -8 Q76 -14 80 -110 Z" fill="#F4ECDC" stroke={K} strokeWidth="8" />
              <ellipse cx="0" cy="-110" rx="80" ry="16" fill="#5A3418" stroke={K} strokeWidth="7" />
              <path d="M-78 -80 Q0 -66 78 -80" stroke="#C8A050" strokeWidth="7" fill="none" />
              <path d="M-60 -96 Q-58 -50 -34 -24" stroke="#FFFFFF" strokeWidth="6" fill="none" />
            </g>
          </g>
          <g transform={L(1.6)}>
            <Smoke id="pn-st" t={t} x={700} y={1590} color="#FFF4E0" n={6} rise={180} wind={-60} r0={14} r1={50} speed={0.35} opacity={0.4} />
            <NearMotes id="pn-near" t={t} color="#FFE0A0" n={7} r0={50} r1={130} opacity={0.12} />
          </g>
        </g>
      </g>
      <Finish id="pn" tint="#C89A3A" tintOpacity={0.08} />
    </svg>
  );
};

