import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, Gulls, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Ball, FloodTower, GIALLOROSSO, K, Pitch, Scoreboard, UmbrellaPine } from './Comuni';

// Un ragazzo della Roma: tramonto su un campo d'allenamento giovanile alla periferia di Roma. Pini a ombrello e una
// cupola lontana nel cielo arancione; in primo piano la panchina con un paio di scarpini piccoli e la borsa giallorossa
// (senza stemmi), coni e una porticina. f2 «Nel 2021…»: sullo sfondo si accendono i fari di un grande stadio e il
// tabellone scrive «SERIE A · 2021». Nessuna persona.
// Piani: cielo (0,2) · città e pini lontani (0,4) · stadio lontano (0,45) · campo (0,65) · panchina (0,85) · recinzione (1,2) · particelle (1,6)

const r0 = rng(2002);

/** Scarpino visto di lato (punta a destra), tacchetti sotto; `s` scala. */
const Boot: React.FC<{ x: number; y: number; s?: number; flip?: boolean; body?: string; lace?: string }> = ({ x, y, s = 1, flip, body = '#1B1D26', lace = '#F4F1E8' }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M-70 -8 Q-74 -52 -52 -60 L-20 -62 Q-6 -40 20 -34 Q62 -28 78 -10 Q84 4 70 8 L-64 8 Q-74 6 -70 -8 Z" fill={body} stroke={K} strokeWidth="7" strokeLinejoin="round" />
    <path d="M-64 8 H72" stroke="#F6F4EE" strokeWidth="6" />
    {[-52, -30, 20, 44, 62].map((sx) => <rect key={sx} x={sx - 5} y={9} width="10" height="11" rx="3" fill="#C8CCD6" stroke={K} strokeWidth="3" />)}
    {/* striscia laterale gialla (nessun marchio) e lacci */}
    <path d="M-40 -20 Q0 -24 40 -14" stroke={GIALLOROSSO.giallo} strokeWidth="8" fill="none" />
    {[-14, -2, 10].map((lx) => <path key={lx} d={`M${lx} -46 l10 6`} stroke={lace} strokeWidth="5" strokeLinecap="round" />)}
    <path d="M-60 -50 Q-56 -58 -46 -58" stroke="#4A4E60" strokeWidth="4" fill="none" />
  </g>
);

const Cone: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="4" rx="34" ry="8" fill="#000" opacity=".35" />
    <path d="M-30 0 Q0 -46 30 0 Z" fill="#F07A2A" stroke={K} strokeWidth="5" />
    <path d="M-14 -22 Q0 -30 14 -22" stroke="#FFD0A0" strokeWidth="4" fill="none" />
  </g>
);

export const Roma: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const tOn = griglia(cues[1] + 0.3);
  const on = eo(seg(t, tOn, tOn + 0.5));
  const pop = eob(seg(t, tOn + 0.2, tOn + 0.7), 1.6);
  const sun = 1 - 0.15 * seg(t, 0, dur);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ro" />
        <Lin id="ro-sky" stops={[[0, '#2A1E44'], [0.3, '#7A3A5A'], [0.5, '#E2774A'], [0.62, '#F6B860']]} />
        <Lin id="ro-bag" x2={0} y2={1} stops={[[0, '#A82838'], [1, '#6A1622']]} />
        <Lin id="ro-bench" x2={1} y2={0} stops={[[0, '#C88A4A'], [0.7, '#9A6232'], [1, '#6A3E1E']]} />
        <Lin id="ro-dome" x2={1} y2={0} stops={[[0, '#E8A070'], [0.5, '#B8705A'], [1, '#7A4A4A']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo al tramonto, sole basso (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ro-sky)" />
          <Glow id="ro-sun" x={300} y={1010} r={560 * sun} t={t} color="#FFD890" amp={0.03} rate={1} opacity={0.85} />
          <circle cx="300" cy="1020" r="70" fill="#FFE8B0" opacity=".9" />
          {/* nuvole lunghe e basse, sotto la zona del titolo */}
          {[[180, 760, 260], [760, 820, 320], [420, 880, 220]].map(([x, y, w], i) => (
            <path key={i} d={`M${x - w} ${y} q${w * 0.3} -26 ${w * 0.6} -10 q${w * 0.4} -30 ${w * 0.8} -4 q${w * 0.4} 4 ${w * 0.6} 14 Z`} fill="#F2A27A" opacity=".45" />
          ))}
          <Gulls t={t} seed={5} n={5} y={700} h={160} color="#3A2238" size={0.8} />
        </g>
        {/* PIANO 1 — Roma lontana: cupola, campanili, pini a ombrello (0,4) */}
        <g transform={L(0.4)}>
          <path d="M-200 1060 Q200 1040 520 1056 T1280 1050 V1120 H-200 Z" fill="#6A3A4E" />
          {/* cupola lontana con lanterna, lato al sole chiaro */}
          <g transform="translate(560 1000)">
            <rect x="-70" y="-10" width="140" height="70" fill="#8A5060" />
            <path d="M-80 -6 Q-80 -120 0 -132 Q80 -120 80 -6 Z" fill="url(#ro-dome)" />
            {[-50, -25, 0, 25, 50].map((x) => <path key={x} d={`M${x * 0.9} -8 Q${x * 0.6} -90 0 -130`} stroke="#6A3A4A" strokeWidth="3" fill="none" opacity=".6" />)}
            <rect x="-12" y="-170" width="24" height="40" fill="#8A5060" />
            <path d="M-14 -170 Q0 -190 14 -170 Z" fill="#B8705A" />
          </g>
          <rect x="250" y="960" width="28" height="100" fill="#7A4456" />
          <path d="M246 962 L264 924 L282 962 Z" fill="#7A4456" />
          {[[-30, 1080, 230, 300], [130, 1076, 190, 240], [400, 1086, 150, 200]].map(([x, y, h, w], i) => (
            <UmbrellaPine key={i} x={x} y={y} h={h} w={w} fill="#3A2238" lean={i % 2 ? 14 : -10} />
          ))}
        </g>
        {/* PIANO 2 — il grande stadio lontano: fari che si accendono e tabellone «SERIE A · 2021» (0,45) */}
        <g transform={L(0.45)}>
          <path d="M600 1090 Q600 990 820 978 Q1040 990 1040 1090 Z" fill="#5A3048" />
          <path d="M600 1090 Q600 990 820 978 Q1040 990 1040 1090" fill="none" stroke="#FFC890" strokeWidth="4" opacity={0.35 + 0.4 * on} />
          {[1010, 1030, 1050, 1070].map((y, i) => <path key={i} d={`M${616 + i * 4} ${y} Q820 ${y - 22} ${1024 - i * 4} ${y}`} stroke="#3A1E30" strokeWidth="5" fill="none" />)}
          {Array.from({ length: 14 }, (_, i) => <rect key={i} x={630 + i * 28} y={1000 + (i % 2) * 4} width="10" height="8" fill="#FFF4D0" opacity={0.15 + 0.7 * on * ((i * 7) % 3 ? 1 : 0.5)} />)}
          {[[610, 1070], [1030, 1070]].map(([x, y], i) => (
            <g key={i}>
              <Glow id={`ro-fl${i}`} x={x} y={y - 250} r={70 + 130 * on} t={t} color="#FFF4D0" amp={0.05} rate={3} ph={i} opacity={0.25 + 0.6 * on} />
              <FloodTower x={x} y={y} h={290} s={0.45} on={on} outline="#2A1828" pole="#3A2236" />
            </g>
          ))}
          <path d="M640 1060 Q820 980 1000 1060" fill="#FFF4D0" opacity={0.25 * on} />
          <g transform={`translate(820 860) scale(${lerp(0.9, 1, pop)}) translate(-820 -860)`} opacity={0.35 + 0.65 * on}>
            <Scoreboard id="ro-sb" x={660} y={800} w={320} h={110} t={t} on={on} legs={110} lines={[{ text: 'SERIE A · 2021', size: 40 }]} />
          </g>
        </g>
        {/* PIANO 3 — il campo d'allenamento, porticina e coni (0,65) */}
        <g transform={L(0.65)}>
          <Pitch id="ro-p" y0={1090} light="#6A8A3A" dark="#56783A" lines="#F4E8D0" lineOpacity={0.6} x0={60} x1={1020} />
          {/* luce radente del tramonto sul prato */}
          <path d="M-200 1090 L700 1090 L-200 1500 Z" fill="#FFC070" opacity=".18" />
          {/* porticina a sinistra con la rete */}
          <g transform="translate(150 1130)">
            <path d="M0 0 V-120 H230 V0" fill="none" stroke="#F6F4EE" strokeWidth="11" strokeLinejoin="round" />
            <path d="M0 -120 L40 -90 H270 L230 -120 M270 -90 V10" fill="none" stroke="#D8D4CC" strokeWidth="6" />
            {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${12 + i * 30} -116 V-4`} stroke="#F6F4EE" strokeWidth="2" opacity=".55" />)}
            {Array.from({ length: 4 }, (_, i) => <path key={`h${i}`} d={`M4 ${-100 + i * 26} H226`} stroke="#F6F4EE" strokeWidth="2" opacity=".55" />)}
          </g>
          <Cone x={480} y={1150} s={0.7} />
          <Cone x={620} y={1170} s={0.75} />
          <Cone x={760} y={1192} s={0.8} />
          <Ball x={880} y={1192} r={26} rot={20} />
        </g>
        {/* PIANO 4 — panchina con gli scarpini piccoli e la borsa giallorossa (0,85) */}
        <g transform={`${L(0.85)} translate(520 1180) scale(1.32) translate(-520 -1240)`}>
          <Glow id="ro-bk" x={520} y={1150} r={260} t={t} color="#FFD8A0" amp={0.04} rate={1.4} opacity={0.4} />
          <ellipse cx="520" cy="1272" rx="330" ry="26" fill="#000" opacity=".35" />
          {/* gambe e seduta della panchina */}
          {[260, 780].map((x) => <rect key={x} x={x - 12} y={1190} width="24" height="80" fill="#3A3E4A" stroke={K} strokeWidth="6" />)}
          <rect x="200" y="1170" width="640" height="34" rx="6" fill="url(#ro-bench)" stroke={K} strokeWidth="8" />
          <path d="M210 1176 H830" stroke="#F2C890" strokeWidth="4" opacity=".7" />
          {/* gli scarpini: oggetto chiave, piccoli (da bambino) */}
          <Glow id="ro-bt" x={470} y={1130} r={150} t={t} color="#FFE6A0" amp={0.06} rate={2} opacity={0.45} />
          <Boot x={420} y={1150} s={0.72} />
          <Boot x={540} y={1152} s={0.72} flip body="#22242E" />
          {/* borsa giallorossa a terra, a destra (nessuno stemma) */}
          <g transform="translate(700 1268)">
            <path d="M-100 0 Q-110 -86 -60 -96 H60 Q110 -86 100 0 Z" fill="url(#ro-bag)" stroke={K} strokeWidth="8" />
            <path d="M-104 -40 Q0 -48 104 -40" stroke={GIALLOROSSO.giallo} strokeWidth="16" fill="none" />
            <path d="M-50 -96 Q0 -150 50 -96" stroke="#2A1A1E" strokeWidth="10" fill="none" />
            <path d="M-70 -84 Q-40 -90 -10 -88" stroke="#E86070" strokeWidth="5" fill="none" opacity=".7" />
            <rect x="-14" y="-74" width="28" height="12" rx="4" fill="#C8CCD6" stroke={K} strokeWidth="3" />
          </g>
          {/* bottiglia d'acqua accanto */}
          <g transform="translate(300 1266)">
            <rect x="-14" y="-74" width="28" height="74" rx="8" fill="#A8D8E8" stroke={K} strokeWidth="5" opacity=".95" />
            <rect x="-9" y="-88" width="18" height="16" rx="3" fill="#F6F4EE" stroke={K} strokeWidth="4" />
            <path d="M-6 -62 V-14" stroke="#FFFFFF" strokeWidth="4" opacity=".7" />
          </g>
        </g>
        {/* PIANO 5 — recinzione a maglie e erba alta che incorniciano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1560 Q300 1500 540 1520 T1280 1540 V2200 H-200 Z" fill="#2E3A1E" />
          {Array.from({ length: 26 }, (_, i) => {
            const x = -120 + i * 52 + r0() * 20, h = 60 + r0() * 90;
            return <path key={i} d={`M${x} 1600 q${6 + Math.sin(t * 1.5 + i) * 6} ${-h * 0.6} ${10 + Math.sin(t * 1.5 + i) * 10} ${-h}`} stroke="#4A5A26" strokeWidth="9" fill="none" strokeLinecap="round" />;
          })}
          {/* sacca a rete piena di palloni, in basso a sinistra, e cinesini sparsi */}
          <g transform="translate(150 1600)">
            <ellipse cx="0" cy="96" rx="170" ry="26" fill="#000" opacity=".4" />
            {[[-70, 40], [40, 46], [-20, -30], [80, -20], [-100, -40]].map(([bx, by], i) => <Ball key={i} x={bx} y={by} r={58} rot={i * 40} shadow={false} />)}
            <g stroke="#E8E4D8" strokeWidth="4" opacity=".75" fill="none">
              {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-170 + i * 40} 100 Q${-150 + i * 36} -40 ${-60 + i * 16} -120`} />)}
              {Array.from({ length: 5 }, (_, i) => <path key={`h${i}`} d={`M-170 ${80 - i * 40} Q0 ${50 - i * 46} 170 ${80 - i * 40}`} />)}
            </g>
            <path d="M-60 -120 Q0 -150 50 -118" stroke="#2A2C38" strokeWidth="10" fill="none" />
          </g>
          {[[640, 1640], [860, 1600], [1000, 1700]].map(([x, y], i) => (
            <g key={i}><ellipse cx={x} cy={y} rx="44" ry="12" fill="#F2C030" stroke={K} strokeWidth="5" /><ellipse cx={x} cy={y - 4} rx="16" ry="5" fill="#2E3A1E" /></g>
          ))}
        </g>
        {/* PIANO 6 — polvere dorata controluce e particelle vicine (1,6) */}
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 760, x0: 100, x1: 700 }} bottom={{ y: 1500, x0: 0, x1: 1000 }} n={40} color="#FFE2A8" seed={7} />
          <NearMotes id="ro-near" t={t} color="#FFD8A0" n={6} r0={50} r1={130} y0={1100} y1={1900} opacity={0.12} />
        </g>
      </g>
      <Finish id="ro" tint="#E8913A" tintOpacity={0.1} />
    </svg>
  );
};
