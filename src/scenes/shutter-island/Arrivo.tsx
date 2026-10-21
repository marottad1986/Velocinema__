import React from 'react';
import { camera, eio, lerp, mod, rng, seg, wavePath } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';

// L'arrivo: traghetto nella nebbia verso l'isola con faro e ospedale.
// Piani: cielo (0,2) · nubi/promontori (0,3–0,45) · isola (0,5) · mare + traghetto (0,65–0,7)
//        · onde vicine e pontile (1,0–1,25) · nebbia e spruzzi davanti alla camera (1,6–1,9)

const K = '#0B1418'; // contorno
const r = rng(1954);
const STARS = Array.from({ length: 28 }, () => ({ x: r() * 1180 - 50, y: 120 + r() * 640, s: 2 + r() * 3, rate: 1 + r() * 2.5, ph: r() * 6 }));
const MOTES = Array.from({ length: 7 }, (_, i) => ({ y: 700 + r() * 1100, rad: 90 + r() * 120, speed: 30 + r() * 40, ph: i * 260 }));

const gull = (flap: number, s = 1) => {
  const a = -18 * flap * s;
  return `M${-36 * s} 0 q${18 * s} ${a} ${36 * s} 0 q${18 * s} ${a} ${36 * s} 0`;
};

export const Arrivo: React.FC<SceneProps> = ({ t, dur, palette: P }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  // Faro: fascio rotante e alone che pulsa con il passaggio del fascio
  const a = t * 0.9;
  const sweep = Math.cos(a);
  const pulse = Math.abs(sweep);
  const lamp = { x: 935, y: 755 };

  // Traghetto
  const fx = lerp(370, 450, eio(seg(t, 0, dur)));
  const fy = 1250 + Math.sin(t * 1.6) * 6;
  const roll = Math.sin(t * 1.6 + 0.8) * 1.4;

  // Luna (cielo, fattore 0,2) e riflesso sul mare (fattore 0,65): compenso la differenza di parallasse
  const moon = { x: 845, y: 470 };
  const reflX = moon.x + cam.pan * (0.65 - 0.2);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ar" />
        <Lin id="ar-sky" stops={[[0, '#081118'], [0.32, '#132A34'], [0.5, '#24474F'], [0.56, '#3A646B'], [0.62, '#1E3D46']]} />
        <Lin id="ar-sea" stops={[[0, '#2C6670'], [0.25, '#1B4650'], [1, '#08171C']]} />
        <Lin id="ar-rock" x2={1} y2={0} stops={[[0, '#22363A'], [0.6, '#3A5652'], [1, '#5C7A72']]} />
        <Lin id="ar-tower" x2={1} y2={0} stops={[[0, '#9FB2B6'], [0.5, '#E2EAEC'], [1, '#FFFFFF']]} />
        <Lin id="ar-bldg" x2={1} y2={0} stops={[[0, '#6E7F7C'], [1, '#B5C3BF']]} />
        <Lin id="ar-hull" x2={1} y2={0} stops={[[0, '#121D24'], [0.7, '#1E2F38'], [1, '#2E4550']]} />
        <Lin id="ar-cabin" x2={1} y2={0} stops={[[0, '#A9B8BC'], [0.6, '#DCE5E8'], [1, '#F6F9FA']]} />
        <Lin id="ar-beam" x2={1} y2={0} stops={[[0, '#FFE7A0', 0], [0.7, '#FFE7A0', 0.25], [1, '#FFE7A0', 0.7]]} />
        <Lin id="ar-wood" x2={1} y2={0} stops={[[0, '#2A1E17'], [0.55, '#5A4332'], [1, '#7B5E45']]} />
        <Lin id="ar-near" stops={[[0, '#123039'], [1, '#050D10']]} />
        <GlowGradient id="ar-moonglow" color="#DDEBEE" core={0.55} mid={0.18} />
        <GlowGradient id="ar-lampglow" color="#FFD98A" />
        <GlowGradient id="ar-warm" color="#FFC45C" core={0.8} mid={0.25} />
        <GlowGradient id="ar-red" color="#FF6B4A" core={0.8} mid={0.2} />
        <GlowGradient id="ar-fog" color="#B9D2D6" core={1} mid={0.6} />
        <GlowGradient id="ar-smoke" color="#C3D0D3" core={0.95} mid={0.55} />
        <GlowGradient id="ar-cloud" color="#22404B" core={1} mid={0.7} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ar-sky)" />
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#E9F0F2" opacity={0.15 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.rate + s.ph))} />
          ))}
          <circle cx={moon.x} cy={moon.y} r={230 + Math.sin(t * 1.2) * 12} fill="url(#ar-moonglow)" />
          <circle cx={moon.x} cy={moon.y} r="62" fill="#EEF4F5" />
          <path d={`M${moon.x - 62} ${moon.y} a62 62 0 0 0 124 0 a62 50 0 0 1 -124 0`} fill="#C9D8DC" opacity=".6" />
          <circle cx={moon.x + 18} cy={moon.y - 16} r="12" fill="#D2DFE2" />
          <circle cx={moon.x - 22} cy={moon.y + 14} r="8" fill="#D2DFE2" />
          <circle cx={moon.x + 8} cy={moon.y + 26} r="5" fill="#D2DFE2" />
        </g>

        {/* PIANO 1 — nubi lontane (0,3) */}
        <g transform={L(0.3, Math.sin(t * 0.25) * 30)} opacity=".9">
          <ellipse cx="160" cy="300" rx="420" ry="120" fill="url(#ar-cloud)" />
          <ellipse cx="700" cy="230" rx="460" ry="110" fill="url(#ar-cloud)" />
          <ellipse cx="1100" cy="640" rx="380" ry="80" fill="url(#ar-cloud)" opacity=".7" />
        </g>

        {/* PIANO 1b — promontori lontani senza contorno (0,4) + nebbia lontana */}
        <g transform={L(0.4)}>
          <path d="M-200 1068 L-200 990 Q-60 940 60 975 Q170 930 300 985 Q380 1010 440 1068 Z" fill="#1B3540" />
          <path d="M-200 1068 L-200 1020 Q0 1000 160 1030 Q260 1040 320 1068 Z" fill="#163039" />
          <ellipse cx={300 + Math.sin(t * 0.3) * 80} cy="1040" rx="720" ry="70" fill="url(#ar-fog)" opacity=".22" />
        </g>

        {/* PIANO 2 — l'isola con ospedale e faro (0,5) */}
        <g transform={L(0.5)}>
          {/* fascio del faro, dietro all'isola */}
          <g transform={`translate(${lamp.x} ${lamp.y}) scale(${sweep} 1) translate(${-lamp.x} ${-lamp.y})`} opacity={0.35 + 0.45 * pulse}>
            <path d={`M${lamp.x} ${lamp.y - 6} L-260 610 L-260 900 L${lamp.x} ${lamp.y + 6} Z`} fill="url(#ar-beam)" />
          </g>
          <path d="M460 1070 Q500 965 585 935 Q640 878 720 886 Q800 846 880 864 Q965 852 1012 930 Q1062 992 1100 1070 Z" fill="url(#ar-rock)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          {/* bordo illuminato dalla luna */}
          <path d="M880 864 Q965 852 1012 930 Q1062 992 1100 1070" fill="none" stroke="#A9C6C4" strokeWidth="4" opacity=".7" />
          {/* alberi */}
          <path d="M600 940 q20 -46 40 0 z M628 936 q16 -36 32 0 z M820 880 q18 -40 36 0 z M845 878 q14 -30 28 0 z" fill="#14262A" />
          {/* ospedale */}
          <path d="M560 990 V912 L605 896 L650 912 V990 Z" fill="url(#ar-bldg)" stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <path d="M650 990 V878 L675 850 L700 878 V990 Z" fill="url(#ar-bldg)" stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <path d="M700 990 V912 L745 896 L790 912 V990 Z" fill="url(#ar-bldg)" stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <circle cx="675" cy="890" r="8" fill="#E9F0F2" stroke={K} strokeWidth="3" />
          {[572, 596, 620, 712, 736, 760].map((x, i) => (
            <g key={x}>
              <rect x={x} y="925" width="14" height="18" fill={i === 1 || i === 4 ? '#FFD25C' : '#2C3E48'} />
              <rect x={x} y="955" width="14" height="18" fill={i === 5 ? '#FFD25C' : '#2C3E48'} />
            </g>
          ))}
          <rect x="666" y="918" width="18" height="26" fill="#FFD25C" />
          <circle cx="675" cy="931" r={40 + pulse * 6} fill="url(#ar-warm)" opacity=".45" />
          {/* recinzione */}
          <path d="M540 1002 H820 M555 990 V1012 M590 990 V1012 M625 990 V1012 M660 990 V1012 M695 990 V1012 M730 990 V1012 M765 990 V1012 M800 990 V1012" stroke={K} strokeWidth="3" />
          {/* faro */}
          <path d="M905 878 L914 770 H956 L965 878 Z" fill="url(#ar-tower)" stroke={K} strokeWidth="5" strokeLinejoin="round" />
          <path d="M911 812 H959 M908 848 H962" stroke="#B5562F" strokeWidth="13" />
          <circle cx={lamp.x} cy={lamp.y} r={70 + pulse * 40} fill="url(#ar-lampglow)" opacity={0.45 + pulse * 0.35} />
          <rect x="912" y="738" width="46" height="34" fill="#FFE7A0" stroke={K} strokeWidth="4" />
          <path d="M906 740 L935 716 L964 740 Z" fill={K} />
          <circle cx={lamp.x} cy={lamp.y} r={8 + pulse * 4} fill="#FFFFFF" />
        </g>

        {/* nebbia media sulla base dell'isola (0,55) */}
        <g transform={L(0.55, Math.sin(t * 0.35 + 2) * -90)}>
          <ellipse cx="620" cy="1070" rx="760" ry="60" fill="url(#ar-fog)" opacity=".3" />
        </g>

        {/* PIANO 3 — mare (0,65) */}
        <g transform={L(0.65)}>
          <rect x="-200" y="1066" width="1480" height="1000" fill="url(#ar-sea)" />
          {/* riflesso della luna */}
          {Array.from({ length: 11 }, (_, i) => {
            const w = (70 - i * 4) * (0.55 + 0.45 * Math.sin(t * 3 + i * 1.7));
            return <rect key={i} x={reflX - w / 2 + Math.sin(t * 1.3 + i) * 10} y={1084 + i * 26} width={w} height="5" rx="2.5" fill="#E9F0F2" opacity={0.5 - i * 0.03} />;
          })}
          {/* riflesso del faro: trattini che tremolano */}
          {Array.from({ length: 5 }, (_, i) => {
            const w = (34 - i * 5) * (0.6 + 0.4 * Math.sin(t * 4 + i * 2.1));
            return <rect key={i} x={lamp.x + cam.pan * 0.15 - w / 2} y={1082 + i * 18} width={w} height="4" rx="2" fill="#FFE7A0" opacity={(0.2 + pulse * 0.45) * (1 - i * 0.15)} />;
          })}
          <path d={wavePath(1310, 10, 300)} transform={`translate(${-mod(t * 60, 300)} 0)`} fill="none" stroke="#4E8890" strokeWidth="5" strokeLinecap="round" opacity=".5" />
          <path d={wavePath(1440, 12, 340)} transform={`translate(${-mod(t * 75, 340) - 120} 0)`} fill="none" stroke="#3F7880" strokeWidth="5" strokeLinecap="round" opacity=".45" />
          <path d={wavePath(1130, 6, 220)} transform={`translate(${-mod(t * 30, 220)} 0)`} fill="none" stroke="#5E9AA3" strokeWidth="4" strokeLinecap="round" opacity=".55" />
          <path d={wavePath(1190, 8, 260)} transform={`translate(${-mod(t * 45, 260)} 0)`} fill="none" stroke="#5E9AA3" strokeWidth="4" strokeLinecap="round" opacity=".45" />
        </g>

        {/* PIANO 3b — il traghetto con scia e fumo (0,7) */}
        <g transform={L(0.7)}>
          {/* scia a V dietro la poppa */}
          {[0, 1, 2, 3].map((k) => {
            const p = mod(t * 0.5 + k / 4, 1);
            return (
              <path
                key={k}
                d={`M${fx - 230} ${fy + 6} Q${fx - 230 - 260 * p} ${fy + 6 + 40 * p} ${fx - 230 - 520 * p} ${fy + 14 + 70 * p}`}
                fill="none" stroke="#E4F2F4" strokeWidth={12 - p * 7} strokeLinecap="round" opacity={(1 - p) * 0.9}
              />
            );
          })}
          <path d={`M${fx - 250} ${fy + 26} Q${fx - 420} ${fy + 44} ${fx - 640} ${fy + 70}`} fill="none" stroke="#9CC3CA" strokeWidth="7" strokeLinecap="round" strokeDasharray="40 30" strokeDashoffset={-t * 80} opacity=".6" />
          {/* onda di prua */}
          <path d={`M${fx + 250} ${fy + 4} q30 ${-14 - Math.sin(t * 4) * 4} 60 0`} fill="none" stroke="#E9F0F2" strokeWidth="7" strokeLinecap="round" opacity=".8" />

          {/* fumo dal fumaiolo: volute che salgono e si allargano */}
          {Array.from({ length: 10 }, (_, i) => {
            const p = mod(t * 0.32 + i / 10, 1);
            return (
              <circle key={i} cx={fx + 105 - p * 300} cy={fy - 290 - p * 210 + Math.sin(p * 6 + i) * 10} r={30 + p * 85} fill="url(#ar-smoke)" opacity={seg(p, 0, 0.15) * (1 - p) * 0.85} />
            );
          })}

          <g transform={`translate(${fx} ${fy}) rotate(${roll}) scale(.85)`}>
            {/* fumaiolo */}
            <path d="M88 -210 L96 -340 H166 L172 -210 Z" fill="#1A2A33" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M93 -300 H169" stroke={P.principale} strokeWidth="22" />
            <path d="M160 -336 L166 -214" stroke="#5E7F88" strokeWidth="4" opacity=".7" />
            {/* albero di prua con fanale */}
            <path d="M262 -95 V-300" stroke={K} strokeWidth="8" />
            <circle cx="262" cy="-300" r="34" fill="url(#ar-warm)" opacity={0.6 + Math.sin(t * 2) * 0.15} />
            <circle cx="262" cy="-300" r="9" fill="#FFF3C8" stroke={K} strokeWidth="4" />
            {/* cabina */}
            <rect x="-250" y="-210" width="420" height="120" rx="12" fill="url(#ar-cabin)" stroke={K} strokeWidth="9" />
            <rect x="-170" y="-282" width="190" height="76" rx="8" fill="url(#ar-cabin)" stroke={K} strokeWidth="9" />
            {[-145, -95, -45].map((x) => (
              <rect key={x} x={x} y="-264" width="36" height="34" rx="4" fill="#2C3E48" stroke={K} strokeWidth="5" />
            ))}
            {[-220, -150, -80, -10, 60, 120].map((x, i) => (
              <g key={x}>
                <rect x={x} y="-185" width="46" height="46" rx="6" fill={i === 3 ? '#2C3E48' : '#FFD25C'} stroke={K} strokeWidth="6" />
                {i !== 3 && <circle cx={x + 23} cy="-162" r="46" fill="url(#ar-warm)" opacity=".3" />}
              </g>
            ))}
            {/* salvagente */}
            <circle cx="140" cy="-232" r="20" fill="none" stroke="#E9F0F2" strokeWidth="12" />
            <circle cx="140" cy="-232" r="20" fill="none" stroke={K} strokeWidth="3" />
            {/* bordo illuminato */}
            <path d="M-245 -205 H160 M-165 -278 H15" stroke="#FFFFFF" strokeWidth="4" opacity=".8" />
            {/* parapetto */}
            <path d="M-300 -96 H300 M-280 -130 V-96 M-200 -130 V-96 M200 -130 V-96 M280 -130 V-96 M-300 -130 H-250 M170 -130 H300" fill="none" stroke={K} strokeWidth="6" />
            {/* scafo */}
            <path d="M-340 -96 H350 L300 4 H-300 Z" fill="url(#ar-hull)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
            <path d="M-328 -62 H336" stroke={P.accento} strokeWidth="16" />
            <path d="M-300 -86 H330" stroke="#5E7F88" strokeWidth="4" opacity=".8" />
            <circle cx="-250" cy="-30" r="12" fill="#2C3E48" stroke={K} strokeWidth="4" />
            <circle cx="-190" cy="-30" r="12" fill="#2C3E48" stroke={K} strokeWidth="4" />
            {/* riflesso dello scafo sull'acqua */}
            <path d="M-290 14 H290" stroke="#0A1A20" strokeWidth="12" opacity=".5" strokeLinecap="round" />
            <path d="M-250 30 H200" stroke={P.accento} strokeWidth="6" opacity=".22" strokeDasharray="60 30" strokeDashoffset={t * 40} />
          </g>
        </g>

        {/* gabbiani (0,6) */}
        <g transform={L(0.6)} fill="none" stroke={K} strokeLinecap="round">
          <path d={gull(0.9 + 0.6 * Math.sin(t * 7), 1.3)} transform={`translate(${lerp(80, 760, mod(t / 14, 1))} ${640 + Math.sin(t * 1.8) * 20})`} strokeWidth="7" />
          <path d={gull(0.9 + 0.6 * Math.sin(t * 8 + 1), 1.05)} transform={`translate(${lerp(-60, 620, mod(t / 12 + 0.3, 1))} ${700 + Math.sin(t * 2.2 + 1) * 16})`} strokeWidth="6" />
          <path d={gull(0.9 + 0.6 * Math.sin(t * 9 + 2), 0.8)} transform={`translate(${lerp(300, 900, mod(t / 16 + 0.6, 1))} ${590 + Math.sin(t * 2.5 + 2) * 12})`} strokeWidth="5" />
        </g>

        {/* PIANO 4 — onde vicine (1,0) */}
        <g transform={L(1.0)}>
          <path d={wavePath(1590, 22, 320, -400, 1600, 2200)} transform={`translate(${-mod(t * 110, 320)} ${Math.sin(t * 1.8) * 10})`} fill="url(#ar-near)" />
          <path d={wavePath(1590, 22, 320, -400, 1600)} transform={`translate(${-mod(t * 110, 320)} ${Math.sin(t * 1.8) * 10})`} fill="none" stroke="#9CC3CA" strokeWidth="7" strokeLinecap="round" opacity=".6" />
        </g>

        {/* PIANO 5 — pontile in primo piano che incornicia (1,25) */}
        <g transform={L(1.25)}>
          <path d="M-60 1600 Q60 1650 160 1585" fill="none" stroke="#3A2C22" strokeWidth="10" strokeLinecap="round" />
          <path d="M160 1585 Q240 1625 330 1640" fill="none" stroke="#3A2C22" strokeWidth="10" strokeLinecap="round" />
          {[
            { x: -80, top: 1520 },
            { x: 120, top: 1560 },
            { x: 300, top: 1625 },
          ].map((p) => (
            <g key={p.x}>
              <rect x={p.x} y={p.top} width="80" height={2100 - p.top} fill="url(#ar-wood)" stroke={K} strokeWidth="10" />
              <path d={`M${p.x + 64} ${p.top + 8} V2000`} stroke="#C9B08F" strokeWidth="4" opacity=".55" />
              <path d={`M${p.x + 14} ${p.top + 60} h30 M${p.x + 24} ${p.top + 150} h34`} stroke={K} strokeWidth="5" />
              <ellipse cx={p.x + 40} cy={p.top} rx="40" ry="10" fill="#7B5E45" stroke={K} strokeWidth="6" />
            </g>
          ))}
          {/* lanterna sul pontile */}
          <circle cx="160" cy="1500" r={150 + Math.sin(t * 2.6) * 10} fill="url(#ar-warm)" opacity=".55" />
          <path d="M160 1560 V1530" stroke={K} strokeWidth="6" />
          <rect x="138" y="1470" width="44" height="60" rx="8" fill="#FFE7A0" stroke={K} strokeWidth="7" />
          <path d="M132 1470 H188 L160 1446 Z" fill={K} />
          <path d="M150 1480 V1520 M170 1480 V1520" stroke={K} strokeWidth="4" />
          {/* boa di segnalazione a destra */}
          <g transform={`translate(${980} ${1700 + Math.sin(t * 1.8 + 1) * 12}) rotate(${Math.sin(t * 1.8) * 5})`}>
            <circle cx="0" cy="-150" r={70 + Math.sin(t * 3) * 6} fill="url(#ar-red)" opacity=".6" />
            <path d="M-70 0 L-40 -120 H40 L70 0 Z" fill="#1E3F48" stroke={K} strokeWidth="10" strokeLinejoin="round" />
            <path d="M-55 -50 H55" stroke="#E9F0F2" strokeWidth="14" />
            <path d="M28 -116 L52 -4" stroke="#7FB3BB" strokeWidth="4" opacity=".7" />
            <path d="M0 -120 V-140" stroke={K} strokeWidth="8" />
            <circle cx="0" cy="-150" r="14" fill="#FF8A6A" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 6 — nebbia e spruzzi davanti alla camera (1,6–1,9) */}
        <g transform={L(1.7)}>
          {MOTES.map((m, i) => (
            <circle key={i} cx={mod(m.ph - t * m.speed, 1500) - 200} cy={m.y + Math.sin(t * 0.7 + i) * 30} r={m.rad} fill="url(#ar-fog)" opacity=".12" />
          ))}
        </g>
      </g>

      <Finish id="ar" tint="#0E3A40" />
    </svg>
  );
};
