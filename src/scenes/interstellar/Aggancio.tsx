import React from 'react';
import { camera, eio, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { DISPLAY, HAND } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, Stars } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { GOLD, Ring } from './Spazio';

// La verità di Brand: l'astronave ad anello gira impazzita perdendo frammenti; la navetta si allinea, ruota con lei e
// la aggancia. Poi arriva una trasmissione dalla Terra: la lavagna del piano «salvare tutti» con l'equazione, che viene barrata,
// e al suo posto il simbolo del buco nero. Nessuna persona.
// Eventi: aggancio (fino a cue 1) · la rotazione rallenta (cue 1) · trasmissione dalla Terra (cue 1) · l'equazione viene
//         barrata: impossibile (cue 2) · compare il buco nero con il punto interrogativo (cue 3).
// Piani: stelle che ruotano (0,15) · Terra lontana (0,3) · astronave e navetta (0,55) · riquadro della trasmissione (0,8)
//        · frammenti vicini (1,3) · particelle (1,8)

const K = '#0A0F18';
const r = rng(77);
const BITS = Array.from({ length: 12 }, () => ({ a: r() * Math.PI * 2, d: 300 + r() * 500, s: 10 + r() * 22, sp: 0.2 + r() * 0.5 }));

export const Aggancio: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const dock = eio(seg(t, 0.2, cues[1] - 0.2));
  const slow = seg(t, cues[1] - 0.2, cues[1] + 1.2);
  // angolo di rotazione: veloce, poi rallenta (integrale semplice)
  const spinRate = lerp(2.4, 0.15, slow);
  const ang = t < cues[1] - 0.2 ? t * 2.4 : (cues[1] - 0.2) * 2.4 + (t - (cues[1] - 0.2)) * (2.4 + spinRate) / 2;
  const tx = eob(seg(t, cues[1], cues[1] + 0.6));
  const cross = eo(seg(t, cues[2] + 0.2, cues[2] + 0.8));
  const hole = eob(seg(t, cues[3], cues[3] + 0.6));
  const cx = 480, cy = 860; // più in basso e a sinistra: lascia libero il titolo e il riquadro della trasmissione
  const shA = ang * (180 / Math.PI);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ag" />
        <Lin id="ag-space" stops={[[0, '#02040A'], [0.5, '#0A1424'], [1, '#04070E']]} />
        <Lin id="ag-board" stops={[[0, '#2E3A34'], [1, '#1E2824']]} />
        <radialGradient id="ag-earth">
          <stop offset="0" stopColor="#C9A86A" />
          <stop offset=".7" stopColor="#8A7A5A" />
          <stop offset="1" stopColor="#3A3A3E" />
        </radialGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — stelle che ruotano, poi si fermano (0,15) */}
        <g transform={L(0.15)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#ag-space)" />
          <g transform={`rotate(${-shA * 0.15} ${cx} ${cy})`}>
            <Stars t={t} seed={12} n={90} x={-400} y={-400} w={1900} h={2600} color="#DCE8F2" size={0.8} />
          </g>
        </g>

        {/* PIANO 1 — la Terra lontana, polverosa (0,3) */}
        <g transform={L(0.3)}>
          <Glow id="ag-eg" x={160} y={1170} r={180} t={t} color="#C9A86A" amp={0.04} rate={1} opacity={0.35} />
          <circle cx="160" cy="1170" r="70" fill="url(#ag-earth)" stroke={K} strokeWidth="5" />
          <path d="M110 1150 q30 -20 60 0 q20 14 40 4" fill="none" stroke="#E8D4A8" strokeWidth="5" opacity=".6" />
        </g>

        {/* PIANO 2 — astronave che gira impazzita e navetta che aggancia (0,55) */}
        <g transform={L(0.55)}>
          <g transform={`rotate(${(shA * 0.15) % 360} ${cx} ${cy})`}>
            {/* rotazione dei moduli: un secondo anello che gira veloce attorno al mozzo */}
            <Ring x={cx} y={cy} r={232} t={ang} spin={1} tiltY={0.9} outline={K} lit="#EEF2F4" debris={1 - slow} />
          </g>
          {/* navetta: arriva, ruota con l'anello, si incastra nel mozzo */}
          <g transform={`translate(${lerp(140, cx, dock)} ${lerp(1240, cy, dock)}) rotate(${lerp(-30, shA * dock, dock)}) scale(${lerp(0.9, 0.5, dock)})`}>
            <path d="M-110 16 L-80 -26 H60 L118 8 L108 26 H-100 Z" fill="#C9D3DB" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M36 -22 L72 -8 V6 H36 Z" fill="#2A3A4E" stroke={K} strokeWidth="5" />
            <Glow id="ag-eng" x={-120} y={10} r={70} t={t} color="#8EB8D8" amp={0.3} rate={15} opacity={0.9 * (1 - dock)} />
          </g>
          <Glow id="ag-lock" x={cx} y={cy} r={160} t={t} color={GOLD} amp={0.2} rate={6} opacity={0.6 * seg(dock, 0.95, 1) * (1 - slow * 0.5)} />
        </g>

        {/* PIANO 3 — trasmissione dalla Terra: la lavagna del piano «salvare tutti» (0,8) */}
        <g transform={L(0.8)} opacity={tx}>
          <g transform={`translate(${lerp(800, 740, tx)} 1128) scale(${0.82 * tx})`}>
            <rect x="-250" y="-150" width="500" height="300" rx="16" fill="#0E1622" stroke="#8EB8D8" strokeWidth="6" />
            <text x="-226" y="-114" fontFamily={DISPLAY} fontWeight={800} fontSize="22" fill="#8EB8D8" letterSpacing="3">TRASMISSIONE · TERRA</text>
            <rect x="-220" y="-92" width="440" height="220" fill="url(#ag-board)" stroke="#5A4A38" strokeWidth="8" />
            <text x="-200" y="-50" fontFamily={HAND} fontSize="34" fill="#E8EEF0">Il piano: salvare tutti</text>
            <text x="-200" y="10" fontFamily={HAND} fontSize="38" fill="#E8EEF0">G·M / r² + ∫ … = ?</text>
            <path d={`M-200 ${0} L${lerp(-200, 120, cross)} ${lerp(0, 20, cross)}`} stroke="#E25A4A" strokeWidth="8" strokeLinecap="round" opacity={cross > 0 ? 1 : 0} />
            <text x="-200" y="78" fontFamily={HAND} fontSize="34" fill="#E25A4A" opacity={cross}>impossibile</text>
            <g transform={`translate(150 70) scale(${hole})`}>
              <circle r="38" fill="#020203" stroke={GOLD} strokeWidth="6" />
              <ellipse rx="64" ry="12" fill="none" stroke={GOLD} strokeWidth="5" />
              <text y="12" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="34" fill={GOLD}>?</text>
            </g>
          </g>
        </g>

        {/* PIANO 4 — frammenti dell'astronave che passano vicini (1,3) */}
        <g transform={L(1.3)} opacity={1 - slow * 0.7}>
          {BITS.map((b, i) => {
            const d = b.d + t * 60 * b.sp;
            const x = cx + Math.cos(b.a + t * b.sp) * d, y = cy + Math.sin(b.a + t * b.sp) * d * 1.2;
            return <rect key={i} x={x} y={y} width={b.s} height={b.s * 0.6} fill="#C9D3DB" stroke={K} strokeWidth="3" transform={`rotate(${t * 180 + i * 30} ${x} ${y})`} />;
          })}
        </g>
        {/* pezzo di scafo staccato che passa vicinissimo, dal basso */}
        <g transform={L(1.4)}>
          <g transform={`translate(${260 + t * 14} ${1800 - t * 10}) rotate(${-14 + t * 3})`}>
            <path d="M-320 -120 L240 -170 L330 60 L280 340 L-360 360 Z" fill="#9AA8B4" stroke={K} strokeWidth="10" strokeLinejoin="round" />
            <path d="M-300 -60 L250 -110 M-310 40 L290 0 M-60 -140 L-30 350" stroke="#5A6878" strokeWidth="6" />
            <path d="M-310 -112 L236 -160" stroke="#EEF2F4" strokeWidth="5" opacity=".7" />
            {[[-240, -80], [-120, -90], [0, -100], [120, -112], [-240, 20], [-120, 14], [0, 8], [120, 2]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" fill="#3A4858" />)}
            <path d="M330 60 L380 40 L360 90 Z M280 340 L330 320 L300 380 Z" fill="#C9D3DB" stroke={K} strokeWidth="5" />
          </g>
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="ag-near" t={t} color="#DCE8F2" n={6} vx={-30} vy={-6} opacity={0.15} />
        </g>
      </g>

      <Finish id="ag" tint="#3E6A8A" tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): aggancio da 0,2 a cue1 − 0,2 · rotazione che rallenta cue1 − 0,2 → +1,4 · trasmissione cue1
// · equazione barrata cue2 + 0,2 · buco nero con «?» cue3.
