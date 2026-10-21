import React from 'react';
import { camera, eio, eo, lerp, rng, seg } from '../../lib/anim';
import { DISPLAY } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, NearMotes, Stars, WaveBand, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { BlackHole, GOLD } from './Spazio';

// Il pianeta delle onde: mare basso e infinito sotto un cielo dove domina il buco nero; una navetta posata sull'acqua;
// all'orizzonte una «montagna» che si rivela un'onda gigantesca. Due quadranti mostrano il tempo: qui un'ora, sulla Terra
// gli anni che corrono. Nessuna persona.
// Eventi: compaiono i due quadranti (cue 1) · la montagna si alza: è un'onda (cue 2) · l'onda travolge tutto (cue 3)
//         · la navetta riparte, il quadrante della Terra segna +23 anni (cue 4).
// Piani: cielo e buco nero (0,2) · orizzonte con l'onda (0,4) · mare con la navetta (0,65) · quadranti (0,8)
//        · onde vicine (1,2) · spruzzi e particelle (1,5–1,8)

const K = '#0A0F18';
const r = rng(23);
const SPRAY = Array.from({ length: 30 }, () => ({ x: r() * 1300 - 100, vy: 200 + r() * 500, s: 6 + r() * 16, ph: r() }));

const Dial: React.FC<{ x: number; y: number; a: number; label: string; hot?: boolean }> = ({ x, y, a, label, hot }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r="66" fill="#0E1622" fillOpacity=".75" stroke={hot ? GOLD : '#DCE8F2'} strokeWidth="6" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -58 V-48" stroke="#DCE8F2" strokeWidth="4" transform={`rotate(${i * 30})`} />)}
    <path d="M0 6 V-50" stroke={hot ? GOLD : '#DCE8F2'} strokeWidth="6" strokeLinecap="round" transform={`rotate(${a})`} />
    <circle r="7" fill="#DCE8F2" />
    <text y="104" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="30" fill="#DCE8F2" letterSpacing="2">{label}</text>
  </g>
);

export const Onde: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const dials = Math.max(seg(t, cues[1] - 0.2, cues[1] + 0.4) * (1 - seg(t, cues[2] + 1.6, cues[3]) * 0.6), seg(t, cues[4] - 0.2, cues[4] + 0.3));
  const rise = eio(seg(t, cues[2] - 0.6, cues[3]));
  const crash = seg(t, cues[3], cues[3] + 1.0);
  const lift = eo(seg(t, cues[4] - 0.2, dur));
  const years = Math.round(23 * seg(t, cues[4] - 0.2, dur - 1.0));
  const waveTop = lerp(1040, 560, rise) + crash * 300;
  const shipY = lerp(1150, 900, lift);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="on" />
        <Lin id="on-sky" stops={[[0, '#0A1220'], [0.4, '#2A3A4E'], [0.6, '#5A6E82'], [0.66, '#7A8E9E']]} />
        <Lin id="on-sea" stops={[[0, '#6E8A9A'], [0.4, '#4A6678'], [1, '#22343F']]} />
        <Lin id="on-wave" stops={[[0, '#C9D8E0'], [0.2, '#6E8A9A'], [0.7, '#3E5A6A'], [1, '#2A4050']]} />
        <Lin id="on-ship" x2={1} y2={0} stops={[[0, '#9AA8B4'], [0.5, '#EEF2F4'], [1, '#8A98A4']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo e buco nero (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#on-sky)" />
          <Stars t={t} seed={4} n={30} y={0} h={500} color="#DCE8F2" size={0.8} />
          <BlackHole id="on-bh" x={680} y={700} r={66} t={t} tilt={-8} glow={0.8} />
        </g>

        {/* PIANO 1 — orizzonte: la «montagna» che si rivela un'onda (0,4) */}
        <g transform={L(0.4)}>
          <path d="M-200 1060 Q540 1050 1280 1060 V1300 H-200 Z" fill="url(#on-sea)" />
          <path d={`M-200 1062 C100 1062 160 ${waveTop + 40} 420 ${waveTop} C680 ${waveTop - 20} 860 ${waveTop + 60} 1280 ${waveTop + 30} V1062 Z`} fill="url(#on-wave)" stroke={K} strokeWidth="6" />
          <path d={`M-200 1062 C100 1062 160 ${waveTop + 40} 420 ${waveTop} C680 ${waveTop - 20} 860 ${waveTop + 60} 1280 ${waveTop + 30}`} fill="none" stroke="#EEF4F6" strokeWidth={4 + 8 * rise} opacity={0.4 + 0.5 * rise} />
          <Fog id="on-mist" t={t} y={1050} x={540} rx={900} ry={50} color="#B8C8D4" opacity={0.5} speed={0.3} drift={60} />
        </g>

        {/* PIANO 2 — mare basso con la navetta (0,65) */}
        <g transform={L(0.65)}>
          <WaveBand t={t} y={1120} fill="#4E6A7C" foam="#C9D8E0" amp={6} w={300} speed={20} bob={3} foamOpacity={0.5} />
          <WaveLines t={t} ys={[1150, 1190, 1240]} color="#9AB4C4" amp={4} speed={14} width={3} opacity={0.5} />
          <g transform={`translate(560 ${shipY}) rotate(${lerp(0, -8, lift)})`}>
            <ellipse cx="0" cy="40" rx={140 * (1 - lift * 0.5)} ry="14" fill="#22343F" opacity={0.5 * (1 - lift)} />
            <path d="M-120 20 L-90 -30 H70 L130 10 L120 30 H-110 Z" fill="url(#on-ship)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M40 -26 L80 -10 V6 H40 Z" fill="#2A3A4E" stroke={K} strokeWidth="5" />
            <path d="M-70 -30 V-50 H-30 V-30" fill="#C9D3DB" stroke={K} strokeWidth="5" />
            {lift > 0 && <Glow id="on-eng" x={-120} y={14} r={70} t={t} color="#8EB8D8" amp={0.3} rate={15} opacity={0.9} />}
          </g>
        </g>

        {/* PIANO 3 — due quadranti: qui un'ora, sulla Terra anni (0,8) */}
        <g transform={L(0.8)} opacity={dials}>
          <Dial x={220} y={760} a={t * 6} label="QUI" />
          <Dial x={860} y={940} a={t * 900} label={years > 0 ? `TERRA +${years} ANNI` : 'TERRA'} hot />
        </g>

        {/* l'onda travolge: velo d'acqua */}
        <rect x="-200" y="-200" width="1480" height="2320" fill="#9AB4C4" opacity={0.55 * Math.sin(crash * Math.PI)} />

        {/* PIANO 4 — onde vicine alla camera (1,2) */}
        <g transform={L(1.2)}>
          <WaveBand t={t} y={1600} fill="#3E5A6A" foam="#DCE8F0" amp={18} w={420} speed={50} bob={10} foamWidth={8} />
          <WaveBand t={t} y={1760} fill="#2A4050" foam="#C9D8E0" amp={24} w={520} speed={70} bob={12} ph={1} foamWidth={8} />
        </g>

        {/* PIANO 5 — spruzzi e particelle (1,5–1,8) */}
        <g transform={L(1.5)} opacity={crash > 0 ? 1 - seg(crash, 0.6, 1) * 0.6 : 0}>
          {SPRAY.map((s, i) => {
            const p = (crash + s.ph * 0.4) % 1;
            return <circle key={i} cx={s.x + Math.sin(i) * 40 * p} cy={1500 - s.vy * Math.sin(p * Math.PI)} r={s.s} fill="#EEF4F6" opacity={0.7 * (1 - p)} />;
          })}
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="on-near" t={t} color="#DCE8F0" n={7} vx={-30} vy={-6} opacity={0.08} />
        </g>
      </g>

      <Finish id="on" tint="#3E6A8A" tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): quadranti cue1 · onda che si alza da cue2 − 0,6 a cue3 · onda che travolge cue3 → +1
// · navetta che riparte e +23 anni da cue4 − 0,2.
