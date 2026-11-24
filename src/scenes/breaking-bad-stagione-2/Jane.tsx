import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Glow, NearMotes, Wisps } from '../../lib/elements';
import { HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs } from '../breaking-bad-stagione-1/Comuni';
import { BB2Defs, K, ORO, Mazzetta, Ombra } from './Comuni';

// Jane e il ricatto: il soggiorno dell'appartamento di Jesse di sera. Persone mai: Jesse e Jane sono le due tazze, la
// coperta sul divano, l'accendino e il cucchiaio annerito (la droga), il quaderno di disegni di Jane; Walter è il borsone
// di banconote. Eventi: prima frase l'accendino si accende sul tavolino accanto al cucchiaio, mentre il borsone dei soldi
// resta chiuso con la lampo tirata; seconda frase sul quaderno di Jane compare, scritto a mano, «PAGA O PARLO»; terza
// frase il borsone scivola dentro dalla porta, si apre e le mazzette si accendono d'oro: Walter paga.
// Piani: parete con la finestra blu e i quadri (0,25) · divano con la coperta e lampada (0,5) · tavolino con gli oggetti
//        (0,72) · porta e borsone a destra (0,72) · poltrona e pianta in primo piano (1,2) · fumo e particelle (1,6)

const r = rng(2208);
const CITY = Array.from({ length: 22 }, () => ({ x: r() * 300, y: r() * 200, on: r() > 0.4 }));

export const Jane: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tLight = griglia(cues[0] + 1.2);
  const tNote = griglia(cues[1] + 0.4);
  const tBag = griglia(cues[2] + 1.4);
  const flame = t > tLight ? 1 : 0;
  const note = seg(t, tNote, tNote + 1.2);
  const slide = eo(seg(t, tBag, tBag + 0.6));
  const open = eo(seg(t, tBag + 0.6, tBag + 1.0));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ja" />
        <BBDefs id="ja" />
        <BB2Defs id="ja" />
        <Lin id="ja-wall" stops={[[0, '#1A1E2A'], [0.4, '#3A3A4A'], [0.75, '#5A4A48'], [1, '#3A2E2A']]} />
        <Lin id="ja-floor" stops={[[0, '#6A4A34'], [0.5, '#4A3222'], [1, '#1A100A']]} />
        <Lin id="ja-night" stops={[[0, '#0E1636'], [1, '#2A3A6A']]} />
        <Lin id="ja-sofa" stops={[[0, '#4A5A6A'], [0.5, '#34404E'], [1, '#1A2028']]} />
        <Lin id="ja-bag" stops={[[0, '#3A3A3E'], [0.5, '#24242A'], [1, '#101014']]} />
        <Lin id="ja-hall" stops={[[0, '#F2E2B0'], [1, '#C8A868']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — parete, finestra sulla città di sera, quadri astratti di Jane (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#ja-wall)" />
          <g transform="translate(110 660)">
            <rect x="0" y="0" width="320" height="260" fill="url(#ja-night)" stroke={K} strokeWidth="9" />
            {CITY.map((c, i) => <rect key={i} x={10 + c.x * 0.95} y={110 + c.y * 0.7} width="12" height="16" fill={c.on ? '#F2C870' : '#1A2448'} opacity={c.on ? 0.6 + 0.3 * Math.sin(t + i) : 1} />)}
            <path d="M0 110 L60 90 V260 H0 Z M90 260 V70 H150 V260 M180 260 V120 H250 V260 M270 260 V60 H320" fill="#0A1024" opacity=".85" />
            <path d="M160 0 V260 M0 130 H320" stroke={K} strokeWidth="7" />
            <circle cx="250" cy="50" r="22" fill="#F2F0E0" />
          </g>
          {/* quadri di Jane: forme colorate */}
          <g transform="translate(560 640)">
            <rect x="0" y="0" width="200" height="150" fill="#E8DCC0" stroke={K} strokeWidth="7" />
            <circle cx="70" cy="70" r="40" fill="#D85A4A" /><path d="M100 120 Q140 40 180 110" stroke="#3A6AB8" strokeWidth="12" fill="none" />
          </g>
          <g transform="translate(800 700)">
            <rect x="0" y="0" width="140" height="190" fill="#E8DCC0" stroke={K} strokeWidth="7" />
            <path d="M20 160 L70 40 L120 160 Z" fill="#3A8A6A" /><circle cx="70" cy="90" r="16" fill="#F2C83A" />
          </g>
          <path d="M-200 1170 H1280" stroke="#1A120C" strokeWidth="20" />
        </g>

        {/* PIANO 1 — divano con la coperta e lampada a stelo (0,5) */}
        <g transform={L(0.5)}>
          <rect x="-200" y="1170" width="1480" height="900" fill="url(#ja-floor)" />
          {Array.from({ length: 10 }, (_, k) => <path key={k} d={`M${-200 + k * 160} 1170 L${-400 + k * 220} 2000`} stroke="#2A1A10" strokeWidth="4" opacity=".55" />)}
          <g transform="translate(400 1220)">
            <Ombra id="ja" x={0} y={8} rx={380} ry={26} />
            <path d="M-360 -230 Q-360 -270 -320 -270 H320 Q360 -270 360 -230 V0 H-360 Z" fill="url(#ja-sofa)" stroke={K} strokeWidth="9" />
            <rect x="-400" y="-180" width="90" height="180" rx="30" fill="url(#ja-sofa)" stroke={K} strokeWidth="8" />
            <rect x="310" y="-180" width="90" height="180" rx="30" fill="url(#ja-sofa)" stroke={K} strokeWidth="8" />
            <path d="M-300 -120 H300" stroke="#1A2028" strokeWidth="6" />
            {/* coperta a righe e cuscino */}
            <path d="M-80 -200 Q40 -230 160 -190 L190 -40 Q60 -10 -60 -40 Z" fill="#C8603A" stroke={K} strokeWidth="6" />
            {[0, 1, 2].map((k) => <path key={k} d={`M${-70 + k * 4} ${-160 + k * 40} Q50 ${-190 + k * 40} ${170 + k * 4} ${-150 + k * 40}`} stroke="#F2C870" strokeWidth="6" fill="none" />)}
            <rect x="-300" y="-250" width="130" height="100" rx="24" fill="#E8D8B0" stroke={K} strokeWidth="6" transform="rotate(-12 -235 -200)" />
          </g>
          <g transform="translate(900 1220)">
            <path d="M0 0 V-420" stroke="#2A2A2A" strokeWidth="10" />
            <path d="M-80 -420 L-50 -540 H50 L80 -420 Z" fill="#F2D890" stroke={K} strokeWidth="8" />
            <Glow id="ja-lamp" x={0} y={-450} r={420} t={t} color="#FFC870" amp={0.04} rate={2} opacity={0.55} />
          </g>
        </g>

        {/* PIANO 2 — il tavolino: accendino, cucchiaio, tazze, quaderno di Jane; il borsone che entra dalla porta (0,72) */}
        <g transform={L(0.72)}>
          {/* porta d'ingresso a destra, socchiusa sul pianerottolo */}
          <g transform="translate(1040 1260)">
            <rect x="-150" y="-560" width="220" height="560" fill="url(#ja-hall)" stroke={K} strokeWidth="9" />
            <path d="M-150 -560 L-60 -540 V-14 L-150 0 Z" fill="#5A3A26" stroke={K} strokeWidth="7" />
            <circle cx="-76" cy="-280" r="8" fill="#C8A060" />
            <Glow id="ja-hallg" x={-40} y={-280} r={320} t={t} color="#FFE0A0" amp={0.03} rate={1} opacity={0.45} />
          </g>
          <g transform="translate(470 1320)">
            <Ombra id="ja" x={0} y={8} rx={300} ry={24} />
            <rect x="-280" y="-70" width="560" height="36" rx="8" fill="#9A7448" stroke={K} strokeWidth="8" />
            <path d="M-250 -34 V0 M250 -34 V0" stroke="#5A3E24" strokeWidth="16" />
            {/* quaderno di disegni aperto */}
            <g transform="translate(-130 -76) rotate(-4)">
              <path d="M-120 0 L-110 -90 H0 L4 0 Z" fill="#F6F0E2" stroke={K} strokeWidth="5" />
              <path d="M4 0 L0 -90 H110 L120 0 Z" fill="#F6F0E2" stroke={K} strokeWidth="5" />
              <path d="M-90 -60 q20 -20 40 0 t40 0 M-80 -30 h50" stroke="#8A8A9A" strokeWidth="3" fill="none" />
              <text x="60" y="-50" textAnchor="middle" fontFamily={HAND} fontSize="25" fill="#B8281E" opacity={seg(note, 0, 0.5)}>PAGA</text>
              <text x="60" y="-18" textAnchor="middle" fontFamily={HAND} fontSize="25" fill="#B8281E" opacity={seg(note, 0.5, 1)}>O PARLO</text>
            </g>
            {/* due tazze */}
            <g transform="translate(60 -76)">
              <path d="M-26 0 L-30 -60 H30 L26 0 Z" fill="#E8E2D0" stroke={K} strokeWidth="5" />
              <path d="M30 -46 q22 4 18 24 q-4 14 -20 10" stroke={K} strokeWidth="5" fill="none" />
            </g>
            <g transform="translate(130 -74) rotate(70)">
              <path d="M-24 0 L-28 -54 H28 L24 0 Z" fill="#7AA8C8" stroke={K} strokeWidth="5" />
            </g>
            {/* cucchiaio annerito e accendino */}
            <g transform="translate(210 -76)">
              <ellipse cx="0" cy="-8" rx="24" ry="12" fill="#B8C0C4" stroke={K} strokeWidth="4" />
              <ellipse cx="0" cy="-10" rx="14" ry="6" fill="#2A1E14" />
              <path d="M22 -8 L70 -16" stroke="#B8C0C4" strokeWidth="8" strokeLinecap="round" />
            </g>
            <g transform="translate(-10 -76)">
              <rect x="-16" y="-50" width="32" height="50" rx="6" fill="#C83A2A" stroke={K} strokeWidth="4" />
              <rect x="-14" y="-62" width="28" height="14" fill="#B8C0C4" stroke={K} strokeWidth="3" />
              {flame > 0 && (
                <g>
                  <path d={`M0 -64 Q${-12 + Math.sin(t * 20) * 3} -84 0 ${-110 - Math.sin(t * 17) * 6} Q12 -84 0 -64 Z`} fill="#FFB040" />
                  <path d="M0 -66 Q-5 -80 0 -92 Q5 -80 0 -66 Z" fill="#FFF2C0" />
                  <Glow id="ja-fl" x={0} y={-84} r={140} t={t} color="#FFA040" amp={0.15} rate={14} opacity={0.6} />
                </g>
              )}
            </g>
          </g>
          {/* il borsone di Walter: scivola dentro dalla porta e si apre */}
          <g transform={`translate(${lerp(1100, 800, slide)} 1260)`}>
            <Ombra id="ja" x={0} y={8} rx={170} ry={18} />
            <path d="M-150 0 Q-160 -110 -110 -130 H110 Q160 -110 150 0 Z" fill="url(#ja-bag)" stroke={K} strokeWidth="8" />
            <path d="M-80 -130 Q0 -200 80 -130" stroke="#1A1A1E" strokeWidth="14" fill="none" />
            {open > 0 ? (
              <g>
                <path d={`M-110 -130 Q0 ${-130 - 40 * open} 110 -130`} fill="#0A0A0C" stroke={K} strokeWidth="5" />
                {[-60, 0, 60].map((mx, i) => <Mazzetta key={i} id="ja" x={mx} y={-140 - 8 * open - (i % 2) * 10} s={0.55} rot={-10 + i * 10} />)}
                <Glow id="ja-cashg" x={0} y={-150} r={220} t={t} color={ORO} amp={0.08} rate={3} opacity={0.45 * open} />
              </g>
            ) : (
              <path d="M-110 -128 H110" stroke="#8A8A8A" strokeWidth="5" strokeDasharray="6 4" />
            )}
            <rect x="96" y="-140" width="18" height="24" rx="3" fill="#C8C8C0" stroke={K} strokeWidth="3" />
          </g>
        </g>

        {/* PIANO 3 — poltrona a sinistra e pianta a destra in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1560 Q-60 1500 120 1540 Q200 1560 210 1660 V2100 H-200 Z" fill="#6A3A2A" stroke={K} strokeWidth="10" />
          <path d="M-180 1580 Q-40 1530 110 1560" stroke="#9A5A42" strokeWidth="8" fill="none" />
          <g transform="translate(1000 1960)">
            <path d="M-90 0 L-70 -160 H70 L90 0 Z" fill="#B8643A" stroke={K} strokeWidth="9" />
            {[-60, -20, 20, 60, 0].map((a, i) => (
              <path key={i} d={`M0 -160 Q${a * 2} ${-320 - i * 20} ${a * 3} ${-420 - (i % 2) * 40}`} stroke="#3A6A3A" strokeWidth="22" fill="none" strokeLinecap="round"
                transform={`rotate(${Math.sin(t * 0.8 + i) * 2} 0 -160)`} />
            ))}
          </g>
        </g>

        {/* PIANO 4 — fumo dell'accendino e particelle vicine (1,6) */}
        <g transform={L(1.6)}>
          {flame > 0 && <Wisps t={t - tLight} x={460} y={1180} color="#C8C8D0" n={3} h={260} opacity={0.4} />}
          <NearMotes id="ja-near" t={t} color="#F2D8A0" n={6} r0={70} r1={150} opacity={0.1} />
          {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={mod(i * 151 + t * 12, 1080)} cy={mod(i * 211 - t * 16, 800) + 700} r="2.5" fill="#F2E0B0" opacity=".35" />)}
        </g>
      </g>
      <Finish id="ja" tint="#2A2444" tintOpacity={0.12} />
    </svg>
  );
};
