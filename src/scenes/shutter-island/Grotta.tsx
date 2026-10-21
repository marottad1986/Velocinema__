import React from 'react';
import { camera, lerp, mod, rainPath, rng, seg, wavePath } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';

// La grotta: grotta con fuoco acceso, coperta e tazza; tempesta oltre l'apertura. Nessuna persona.
// Piani: cielo in tempesta (0,2) · mare e promontorio lontano (0,3) · pioggia oltre l'apertura (0,4–0,5)
//        · parete della grotta con l'apertura e ombre tremolanti (0,65) · pavimento, fuoco, coperta, tazza (0,8)
//        · massi e stalattiti in primo piano (1,2) · braci e fumo davanti alla camera (1,7)

const K = '#0A0E0F';
const FIRE = { x: 440, y: 1222 };
// apertura della grotta (foro nella parete)
const HOLE = 'M330 1150 Q300 1010 340 900 Q350 820 410 772 Q440 700 520 678 Q566 640 626 654 Q704 642 744 702 Q802 736 814 812 Q862 884 846 980 Q872 1060 852 1150 Z';
// gli oggetti a terra sono ingranditi attorno a questo punto (base sul pavimento)
const OBJ = { x: 540, y: 1268, s: 1.35 };
const FLOOR_Y = 1140;

const r = rng(1007);
const EMBERS = Array.from({ length: 30 }, () => ({ x0: FIRE.x - 40 + r() * 80, sp: 0.2 + r() * 0.25, ph: r(), sway: 10 + r() * 30, s: 2 + r() * 3, drift: 20 + r() * 160, hot: r() > 0.5 }));
const NEAR = Array.from({ length: 7 }, () => ({ x: r() * 1080, sp: 50 + r() * 60, ph: r() * 1700, rad: 16 + r() * 24 }));
const RAIN_H = 600;
const RAIN_FAR = rainPath(30, 23, 50, 14, 700, RAIN_H);
const RAIN_NEAR = rainPath(16, 41, 110, 30, 700, RAIN_H);

/** Lingua di fuoco: goccia con lati ondulati e punta che oscilla (funzione pura di t). */
const flame = (x: number, y: number, w: number, h: number, t: number, ph: number) => {
  const s1 = Math.sin(t * 6.3 + ph);
  const s2 = Math.sin(t * 4.1 + ph * 1.7);
  const s3 = Math.sin(t * 8.7 + ph * 0.6);
  const hh = h * (1 + 0.1 * s3);
  const tx = x + s1 * w * 0.5;
  return (
    `M${x - w} ${y} C${x - w * 1.15} ${y - hh * 0.35} ${x - w * 0.35 + s2 * w * 0.3} ${y - hh * 0.55} ${x - w * 0.25 + s2 * w * 0.2} ${y - hh * 0.72} ` +
    `Q${tx - w * 0.1} ${y - hh * 0.86} ${tx} ${y - hh} Q${x + w * 0.35 + s1 * w * 0.2} ${y - hh * 0.7} ${x + w * 0.55} ${y - hh * 0.5} ` +
    `C${x + w * 1.1} ${y - hh * 0.3} ${x + w * 1.05} ${y - hh * 0.1} ${x + w} ${y} Q${x} ${y + w * 0.35} ${x - w} ${y} Z`
  );
};
// lingue di fuoco: [dx, larghezza, altezza, fase]
const TONGUES: [number, number, number, number][] = [[-46, 24, 130, 0], [-20, 34, 200, 1.4], [8, 40, 240, 2.7], [34, 32, 180, 4.0], [56, 22, 120, 5.2]];

const Rain: React.FC<{ d: string; y: number; stroke: string; width: number; opacity: number }> = ({ d, y, stroke, width, opacity }) => (
  <g stroke={stroke} strokeWidth={width} strokeLinecap="round" opacity={opacity}>
    {[-1, 0, 1].map((k) => (
      <path key={k} d={d} transform={`translate(260 ${y + k * RAIN_H})`} />
    ))}
  </g>
);

export const Grotta: React.FC<SceneProps> = ({ t, dur, palette: P }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;

  // Tremolio del fuoco (continuo, nessun lampo)
  const fl = 0.8 + 0.1 * Math.sin(t * 7.1) + 0.06 * Math.sin(t * 12.7 + 1) + 0.04 * Math.sin(t * 3.3 + 2);
  const sway = Math.sin(t * 5.3) * 0.6 + Math.sin(t * 8.9 + 1) * 0.4;
  // Due soli lampi lontani oltre l'apertura: 2,4 s e 7,0 s («E Chuck?»)
  const flash = seg(t, 2.4, 2.46) * (1 - seg(t, 2.55, 3.1)) + 0.7 * seg(t, 7.0, 7.06) * (1 - seg(t, 7.15, 7.7));

  // ombra tremolante: scala verticale e inclinazione col fuoco attorno al punto d'appoggio
  const shadow = (bx: number, by: number, dir: number) =>
    `translate(${bx} ${by}) skewX(${dir * (8 + sway * 6)}) scale(${1 + sway * 0.04} ${0.92 + (fl - 0.8) * 1.2}) translate(${-bx} ${-by})`;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="gr" />
        <Lin id="gr-sky" stops={[[0, '#081218'], [0.35, '#15303A'], [0.52, '#2E555D'], [0.58, '#3C6670']]} />
        <Lin id="gr-sea" stops={[[0, '#2C5E66'], [0.4, '#183A42'], [1, '#0A1A1F']]} />
        <Lin id="gr-wall" stops={[[0, '#0A1012'], [0.3, '#1A2224'], [0.55, '#2C2B28'], [0.75, '#3A3129'], [1, '#1E1D1B']]} />
        <Lin id="gr-floor" stops={[[0, '#4A3E32'], [0.35, '#2E2822'], [1, '#0C0D0D']]} />
        <Lin id="gr-near" stops={[[0, '#2A2420'], [1, '#080A0A']]} />
        <Lin id="gr-stal" x2={1} y2={0} stops={[[0, '#2C2622'], [0.55, '#14181A'], [1, '#080B0C']]} />
        <Lin id="gr-rock" x2={1} y2={0} stops={[[0, '#6A5644'], [0.5, '#3E3630'], [1, '#1C1C1B']]} />
        <Lin id="gr-blanket" x2={1} y2={0} stops={[[0, '#4F8890'], [0.5, '#2F5E66'], [1, '#183A40']]} />
        <Lin id="gr-mug" x2={1} y2={0} stops={[[0, '#D8E2E3'], [0.4, '#8FA2A5'], [1, '#3E4E52']]} />
        <Lin id="gr-log" stops={[[0, '#7A5A40'], [1, '#3A2818']]} />
        <radialGradient id="gr-warm" gradientUnits="userSpaceOnUse" cx={FIRE.x} cy={FIRE.y - 60} r="760">
          <stop offset="0" stopColor="#FF9A4C" stopOpacity=".9" />
          <stop offset=".4" stopColor="#E0743A" stopOpacity=".4" />
          <stop offset="1" stopColor="#E0743A" stopOpacity="0" />
        </radialGradient>
        <GlowGradient id="gr-fire" color="#FFB060" core={0.9} mid={0.35} />
        <GlowGradient id="gr-ember" color="#FFB04A" core={0.9} mid={0.35} />
        <GlowGradient id="gr-smoke" color="#5A5650" core={0.8} mid={0.45} />
        <GlowGradient id="gr-steam" color="#E6ECEC" core={0.7} mid={0.3} />
        <GlowGradient id="gr-cloud" color="#1C3640" core={1} mid={0.7} />
        <GlowGradient id="gr-lh" color="#FFE7A0" core={0.9} mid={0.3} />
        <GlowGradient id="gr-shadow" color="#000000" core={0.6} mid={0.35} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo in tempesta oltre l'apertura (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#gr-sky)" />
          <ellipse cx={520 + Math.sin(t * 0.4) * 40} cy="760" rx="300" ry="90" fill="url(#gr-cloud)" />
          <ellipse cx={760 - Math.sin(t * 0.35) * 50} cy="860" rx="260" ry="70" fill="url(#gr-cloud)" opacity=".8" />
          <rect x="-200" y="-200" width="1480" height="2400" fill="#D6ECF2" opacity={flash * 0.55} />
          <path d="M700 660 L676 760 L702 756 L664 880 L690 876 L650 990" fill="none" stroke="#F4FBFF" strokeWidth="6" strokeLinejoin="round" opacity={flash} />
        </g>

        {/* PIANO 1 — mare in burrasca e promontorio con un faro lontano (0,3) */}
        <g transform={L(0.3)}>
          <path d="M640 1062 Q720 1010 800 1022 Q860 990 960 1030 L960 1062 Z" fill="#14272E" />
          <path d="M792 1024 V996 H804 V1024 Z" fill="#14272E" />
          <circle cx="798" cy="992" r={20 + 16 * Math.abs(Math.cos(t * 1.1))} fill="url(#gr-lh)" opacity={0.3 + 0.6 * Math.abs(Math.cos(t * 1.1))} />
          <rect x="-200" y="1060" width="1480" height="400" fill="url(#gr-sea)" />
          <path d={wavePath(1080, 8, 120)} transform={`translate(${-mod(t * 50, 120)} 0)`} fill="none" stroke="#7FB0B8" strokeWidth="4" strokeLinecap="round" opacity=".5" />
          <path d={wavePath(1110, 12, 160)} transform={`translate(${-mod(t * 80, 160)} 0)`} fill="none" stroke="#9CC3CA" strokeWidth="5" strokeLinecap="round" opacity=".55" />
          <path d={wavePath(1135, 14, 200)} transform={`translate(${-mod(t * 110, 200) - 60} 0)`} fill="none" stroke="#D7ECEF" strokeWidth="5" strokeLinecap="round" opacity=".5" />
        </g>

        {/* PIANO 2 — pioggia oltre l'apertura: lontana sottile e lenta (0,4), vicina spessa e veloce (0,5) */}
        <g transform={L(0.4)}>
          <Rain d={RAIN_FAR} y={mod(t * 380, RAIN_H) + 300} stroke="#9CC3CA" width={3} opacity={0.4} />
        </g>
        <g transform={L(0.5)}>
          <Rain d={RAIN_NEAR} y={mod(t * 900, RAIN_H) + 300} stroke="#CFE3E8" width={5} opacity={0.5} />
        </g>

        {/* PIANO 3 — parete della grotta con l'apertura (0,65) */}
        <g transform={L(0.65)}>
          <path d={`M-260 -200 H1340 V1300 H-260 Z ${HOLE}`} fill="url(#gr-wall)" fillRule="evenodd" />
          {/* massi incastrati nella parete, con bordo caldo verso il fuoco */}
          <g stroke={K} strokeWidth="4" strokeLinejoin="round" opacity=".85">
            <path d="M-60 700 Q40 640 150 690 Q200 760 160 840 Q60 880 -40 840 Z" fill="#2A2826" />
            <path d="M40 1040 Q120 990 220 1030 Q260 1090 230 1150 H30 Q0 1090 40 1040 Z" fill="#302C28" />
            <path d="M900 700 Q980 650 1080 690 Q1120 780 1060 830 Q960 850 910 800 Z" fill="#262625" />
            <path d="M940 1000 Q1020 960 1120 990 V1150 H930 Q910 1060 940 1000 Z" fill="#33302B" />
          </g>
          <g fill="none" stroke="#E79A62" strokeWidth="4" strokeLinecap="round">
            <path d="M150 690 Q200 760 160 840" opacity={0.5 * fl} />
            <path d="M220 1030 Q260 1090 230 1150" opacity={0.7 * fl} />
            <path d="M940 1000 Q912 1060 930 1150" opacity={0.6 * fl} />
            <path d="M910 800 Q890 750 900 700" opacity={0.35 * fl} />
          </g>
          {/* luce calda del fuoco sulla roccia, pulsa col tremolio */}
          <path d={`M-260 -200 H1340 V1300 H-260 Z ${HOLE}`} fill="url(#gr-warm)" fillRule="evenodd" opacity={0.75 + (fl - 0.8) * 2} />
          {/* stratificazioni e crepe */}
          <g fill="none" stroke="#0A0D0E" strokeLinecap="round" opacity=".55">
            <path d="M-100 820 Q100 780 260 830 M-80 1000 Q120 960 300 1010 M880 860 Q1000 820 1200 860 M900 1040 Q1020 1000 1200 1050" strokeWidth="6" />
            <path d="M160 650 l30 60 l-16 50 l34 70 M960 640 l-26 50 l20 60" strokeWidth="5" />
          </g>
          {/* ombre tremolanti proiettate dal fuoco */}
          <path d="M200 1150 Q150 980 210 820 Q250 760 290 840 Q330 980 300 1150 Z" fill="#040606" opacity={0.45 + (fl - 0.8) * 0.8} transform={shadow(250, 1150, -1)} />
          <path d="M830 1150 Q840 930 950 860 Q1080 820 1120 960 L1120 1150 Z" fill="#040606" opacity={0.48 + (fl - 0.8) * 0.8} transform={shadow(880, 1150, 1)} />
          {/* bordo dell'apertura: luce fredda dall'esterno (più forte col lampo) e luce calda all'interno */}
          <path d={HOLE} fill="none" stroke={K} strokeWidth="12" strokeLinejoin="round" />
          <path d="M342 1120 Q312 1010 350 902 Q360 826 416 780 Q446 710 524 688 Q568 652 626 664 Q700 652 738 710 Q794 742 804 814" fill="none" stroke="#9CC3CA" strokeWidth="5" opacity={0.5 + flash * 0.5} />
          <path d="M322 1140 Q290 960 330 860" fill="none" stroke="#FFB27F" strokeWidth="5" opacity={0.5 * fl} />
          {/* gocce che cadono dal bordo dell'apertura */}
          {[{ x: 470, y: 700, ph: 0 }, { x: 620, y: 652, ph: 0.9 }, { x: 760, y: 720, ph: 1.7 }].map((d, k) => {
            const p = mod(t + d.ph, 2.2) / 2.2;
            const fall = seg(p, 0.2, 0.6);
            const y = lerp(d.y + 6, FLOOR_Y + 10, fall * fall);
            return (
              <g key={k}>
                {p < 0.2 && <ellipse cx={d.x} cy={d.y + 4} rx={2 + p * 20} ry={3 + p * 28} fill="#B9D6DB" opacity=".8" />}
                {fall > 0 && fall < 1 && <ellipse cx={d.x} cy={y} rx="5" ry="9" fill="#B9D6DB" opacity=".8" />}
              </g>
            );
          })}
        </g>

        {/* PIANO 4 — pavimento, fuoco, coperta, tazza e legna (0,8) */}
        <g transform={L(0.8)}>
          <path d={`M-260 ${FLOOR_Y} Q300 ${FLOOR_Y - 20} 540 ${FLOOR_Y} Q800 ${FLOOR_Y + 14} 1340 ${FLOOR_Y - 10} V2200 H-260 Z`} fill="url(#gr-floor)" />
          <path d={`M-260 ${FLOOR_Y} Q300 ${FLOOR_Y - 20} 540 ${FLOOR_Y} Q800 ${FLOOR_Y + 14} 1340 ${FLOOR_Y - 10}`} fill="none" stroke={K} strokeWidth="8" />
          <ellipse cx={FIRE.x} cy={FIRE.y + 40} rx={640 * fl} ry={190 * fl} fill="url(#gr-fire)" opacity=".55" />
          {/* pozza d'acqua vicino all'apertura che riflette il cielo e il lampo */}
          <ellipse cx="640" cy="1168" rx="120" ry="16" fill="#1A3038" />
          <ellipse cx="640" cy="1168" rx="120" ry="16" fill="#CFE7F0" opacity={0.12 + flash * 0.6} />
          <path d="M560 1164 H620 M660 1172 H700" stroke="#9CC3CA" strokeWidth="3" opacity=".6" />

          <g transform={`translate(${OBJ.x} ${OBJ.y}) scale(${OBJ.s}) translate(${-OBJ.x} ${-OBJ.y})`}>
          {/* ombre a terra (si allungano lontano dal fuoco) */}
          <ellipse cx="860" cy="1262" rx={150 + sway * 8} ry="20" fill="url(#gr-shadow)" />
          <ellipse cx="200" cy="1266" rx={120 + sway * 8} ry="16" fill="url(#gr-shadow)" />

          {/* legna accatastata a sinistra */}
          <g>
            {[[130, 1240], [190, 1240], [250, 1240], [160, 1194], [220, 1194], [190, 1148]].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="28" fill="url(#gr-log)" stroke={K} strokeWidth="6" />
                <circle cx={x} cy={y} r="14" fill="none" stroke="#2A1C12" strokeWidth="3" />
                <path d={`M${x + 8} ${y - 24} a26 26 0 0 1 18 18`} fill="none" stroke="#FFC48A" strokeWidth="3" opacity={0.6 * fl} />
              </g>
            ))}
          </g>

          {/* coperta stesa su un masso a destra, bordo illuminato dal fuoco */}
          <path d="M690 1262 Q680 1150 760 1118 Q850 1090 930 1124 Q980 1160 972 1262 Z" fill="url(#gr-rock)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M700 1180 Q712 1126 770 1110 Q850 1088 920 1116 L934 1170 Q900 1200 880 1186 Q850 1214 820 1196 Q790 1222 760 1200 Q730 1220 700 1196 Z" fill="url(#gr-blanket)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <path d="M724 1150 Q800 1124 912 1140 M712 1176 Q800 1150 926 1162" fill="none" stroke="#C9D8DC" strokeWidth="6" opacity=".75" />
          <path d="M770 1118 Q790 1150 780 1204 M850 1100 Q866 1140 852 1196" fill="none" stroke="#132E33" strokeWidth="4" opacity=".7" />
          <path d="M706 1186 Q712 1132 770 1114" fill="none" stroke="#FFC48A" strokeWidth="4" opacity={0.7 * fl} />

          {/* tazza di latta con vapore */}
          <g transform="translate(620 1252)">
            <ellipse cx="0" cy="4" rx="44" ry="8" fill="#000" opacity=".4" />
            <path d="M-30 -62 H30 L26 0 H-26 Z" fill="url(#gr-mug)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <ellipse cx="0" cy="-62" rx="30" ry="7" fill="#2A3436" stroke={K} strokeWidth="5" />
            <path d="M30 -50 q24 4 20 24 q-4 14 -22 12" fill="none" stroke={K} strokeWidth="7" />
            <path d="M-22 -54 V-8" stroke="#FFD7A8" strokeWidth="4" opacity={0.7 * fl} />
            {[0, 1, 2].map((k) => {
              const p = mod(t * 0.35 + k / 3, 1);
              return <circle key={k} cx={Math.sin(p * 6 + k) * 10} cy={-74 - p * 120} r={10 + p * 22} fill="url(#gr-steam)" opacity={Math.sin(p * Math.PI) * 0.5} />;
            })}
          </g>

          {/* fumo che sale verso l'apertura */}
          {Array.from({ length: 8 }, (_, i) => {
            const p = mod(t * 0.22 + i / 8, 1);
            return (
              <circle key={i} cx={FIRE.x + p * 220 + Math.sin(p * 5 + i) * 26} cy={FIRE.y - 200 - p * 380} r={30 + p * 80} fill="url(#gr-smoke)" opacity={seg(p, 0, 0.15) * (1 - p) * 0.45} />
            );
          })}

          {/* fuoco: braci a terra, ceppi incrociati, fiamme, cerchio di pietre */}
          <circle cx={FIRE.x} cy={FIRE.y - 70} r={170 * fl} fill="url(#gr-fire)" opacity=".7" />
          <path d={`M${FIRE.x - 90} ${FIRE.y + 6} L${FIRE.x + 80} ${FIRE.y - 30} M${FIRE.x - 80} ${FIRE.y - 30} L${FIRE.x + 90} ${FIRE.y + 6}`} stroke={K} strokeWidth="34" strokeLinecap="round" />
          <path d={`M${FIRE.x - 90} ${FIRE.y + 6} L${FIRE.x + 80} ${FIRE.y - 30} M${FIRE.x - 80} ${FIRE.y - 30} L${FIRE.x + 90} ${FIRE.y + 6}`} stroke="#5A4030" strokeWidth="22" strokeLinecap="round" />
          {TONGUES.map(([dx, w, h, ph], i) => (
            <path key={`a${i}`} d={flame(FIRE.x + dx, FIRE.y, w, h, t, ph)} fill="#D9481C" stroke={K} strokeWidth="5" strokeLinejoin="round" />
          ))}
          {TONGUES.map(([dx, w, h, ph], i) => (
            <path key={`b${i}`} d={flame(FIRE.x + dx, FIRE.y - 4, w * 0.75, h * 0.74, t * 1.1, ph + 0.8)} fill={P.accento} />
          ))}
          {TONGUES.map(([dx, w, h, ph], i) => (
            <path key={`c${i}`} d={flame(FIRE.x + dx, FIRE.y - 6, w * 0.5, h * 0.48, t * 1.25, ph + 1.6)} fill="#FFD25C" />
          ))}
          <path d={flame(FIRE.x + 6, FIRE.y - 8, 22, 90, t * 1.4, 0.4)} fill="#FFF3C8" />
          {/* pietre del focolare (davanti alle fiamme) */}
          {[-110, -66, -20, 26, 72, 116].map((dx, i) => (
            <g key={dx}>
              <ellipse cx={FIRE.x + dx} cy={FIRE.y + 18 + Math.abs(dx) * -0.08} rx="30" ry="20" fill="#4A4642" stroke={K} strokeWidth="6" />
              <path d={`M${FIRE.x + dx - 20} ${FIRE.y + 6 + Math.abs(dx) * -0.08} q20 -10 40 0`} fill="none" stroke="#FFB27F" strokeWidth="3" opacity={(0.7 - i * 0.02) * fl} />
            </g>
          ))}
          {/* braci che salgono */}
          {EMBERS.map((e, i) => {
            const p = mod(t * e.sp + e.ph, 1);
            const x = e.x0 + p * e.drift + Math.sin(t * 2.4 + e.ph * 12) * e.sway * p;
            const y = FIRE.y - 60 - p * 480;
            return <circle key={i} cx={x} cy={y} r={e.s * (1 - p * 0.5)} fill={e.hot ? '#FFE08A' : '#FF8A3C'} opacity={Math.sin(p * Math.PI) * (0.55 + 0.45 * Math.sin(t * 9 + i))} />;
          })}
          </g>
        </g>

        {/* PIANO 5 — massi e stalattiti in primo piano che incorniciano (1,2) */}
        <g transform={L(1.2)}>
          {/* stalattiti in alto (a destra grandi, a sinistra sopra la zona del titolo) */}
          <path d="M700 -200 H1300 V560 Q1220 520 1180 640 Q1150 520 1100 470 Q1060 600 1030 700 Q1000 560 960 420 Q920 500 890 560 Q860 400 820 300 Q780 360 760 380 Q740 200 700 -200 Z" fill="url(#gr-stal)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M-220 -200 H420 Q380 60 340 120 Q300 60 280 200 Q250 120 200 90 Q160 220 130 250 Q100 160 60 140 Q20 200 -220 220 Z" fill="url(#gr-stal)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M770 360 Q800 330 820 300 M900 548 Q930 500 960 420 M1036 690 Q1060 600 1100 470" fill="none" stroke="#C8875A" strokeWidth="4" opacity={0.45 * fl} />
          {/* goccia che pende dalla stalattite più lunga */}
          <ellipse cx="1030" cy={706 + 6 * Math.sin(t * 2)} rx="6" ry="9" fill="#B9D6DB" opacity=".8" />
          {/* massi a terra */}
          <path d="M-260 2200 L-240 1380 Q-120 1300 60 1350 Q200 1380 270 1500 Q300 1600 260 2200 Z" fill="url(#gr-near)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
          <path d="M800 2200 Q780 1520 880 1400 Q980 1310 1120 1340 Q1260 1360 1320 1460 V2200 Z" fill="url(#gr-near)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
          <path d="M-200 1374 Q-80 1320 60 1360 Q180 1390 240 1480" fill="none" stroke="#D08C5C" strokeWidth="5" opacity={0.55 * fl} />
          <path d="M840 1450 Q900 1380 980 1350" fill="none" stroke="#D08C5C" strokeWidth="5" opacity={0.45 * fl} />
        </g>

        {/* PIANO 6 — braci grandi e calore davanti alla camera (1,7) */}
        <g transform={L(1.7)}>
          {NEAR.map((n, i) => {
            const y = 2000 - mod(t * n.sp + n.ph, 1700);
            return <circle key={i} cx={n.x + Math.sin(t * 0.8 + i) * 50} cy={y} r={n.rad} fill="url(#gr-ember)" opacity={0.25 + 0.1 * Math.sin(t * 4 + i)} />;
          })}
        </g>
      </g>

      <Finish id="gr" tint="#0E3A40" tintOpacity={0.11} />
    </svg>
  );
};
