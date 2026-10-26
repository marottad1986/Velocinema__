import React from 'react';
import { camera, eio, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { Clouds, Glow, Gulls, NearMotes, Rain, SunRays, WaveBand, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';

// La pioggia: spiaggia di sole, una sola nuvola scarica pioggia su un cerchio di sabbia, ombrellone rovesciato
// e un asciugamano bagnato; tutto intorno è asciutto.
// Piani: cielo con sole, raggi e giunture (0,25) · mare con onde leggere (0,45) · gabbiani (0,5)
//        · spiaggia, nuvola appesa ai cavi, pioggia nel cerchio, ombrellone e asciugamano (0,65)
//        · staccionata da duna e erba ai bordi (1,2) · luccichii vicini (1,7)

const K = '#142235';
const HZ = 900;
const SAND_Y = 1030;
const r = rng(2709);
const SPOTS = Array.from({ length: 22 }, () => ({ u: r() * 2 - 1, v: r() * 2 - 1, ph: r(), rate: 0.9 + r() * 0.6 }));
const GRAINS = Array.from({ length: 70 }, () => ({ x: -200 + r() * 1480, y: SAND_Y + 40 + r() * 900, s: 2 + r() * 3 }));
const GRASS = Array.from({ length: 14 }, (_, i) => ({ x: 830 + i * 22 + r() * 12, h: 120 + r() * 140, lean: r() * 40 - 10, ph: r() * 6 }));

const cloudPath = 'M-200 60 Q-226 10 -170 -6 Q-170 -70 -100 -70 Q-70 -130 10 -118 Q70 -150 130 -96 Q200 -100 206 -30 Q244 -6 222 60 Z';

export const Pioggia: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  // La nuvola segue (cues[2]) e poi la pioggia si allarga a tutta la spiaggia (cues[3]).
  const FOLLOW = cues[2] ?? 2.64;
  const SPREAD = cues[3] ?? 4.5;
  const cx = 600 + 110 * eio(seg(t, FOLLOW, FOLLOW + 1.3));
  const sp = eio(seg(t, SPREAD, SPREAD + 1.6));
  const CY = 730; // sotto il titolo, anche quando la nuvola si allarga
  const RX = 220, RY = 46, RCY = 1190;
  const cs = lerp(1, 1.06, sp);
  const poly = [
    [lerp(cx - 170, -300, sp), lerp(CY + 50, -300, sp)],
    [lerp(cx + 170, 1380, sp), lerp(CY + 50, -300, sp)],
    [lerp(cx + RX + 10, 1380, sp), lerp(RCY + 10, 2200, sp)],
    [lerp(cx - RX - 10, -300, sp), lerp(RCY + 10, 2200, sp)],
  ];
  const clip = `M${poly.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} Z`;
  const sun = 1 - 0.7 * sp;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pg" />
        <Lin id="pg-sky" stops={[[0, '#3F95C8'], [0.35, '#79C4EA'], [0.7, '#BDE7F8'], [0.9, '#F4F1E6']]} />
        <Lin id="pg-sea" stops={[[0, '#6CBCE3'], [0.4, '#4FA3D1'], [1, '#2F7FB0']]} />
        <Lin id="pg-sand" stops={[[0, '#F6E6C2'], [0.4, '#EED7A8'], [1, '#D9BC86']]} />
        <Lin id="pg-cloud" stops={[[0, '#C3CDD8'], [0.5, '#8E9BAA'], [1, '#6C7A8B']]} />
        <Lin id="pg-towel" x2={1} y2={0} stops={[[0, '#4FA3D1'], [0.2, '#4FA3D1'], [0.2, '#F4F1E6'], [0.4, '#F4F1E6'], [0.4, '#4FA3D1'], [0.6, '#4FA3D1'], [0.6, '#F4F1E6'], [0.8, '#F4F1E6'], [0.8, '#4FA3D1']]} />
        <GlowGradient id="pg-wet" color="#9C7F52" core={0.95} mid={0.75} />
        <GlowGradient id="pg-glint" color="#FFFFFF" core={0.8} mid={0.3} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo con sole, raggi e giunture del set (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height={HZ + 260} fill="url(#pg-sky)" />
          <g opacity={sun}>
            <Glow id="pg-sun" x={950} y={320} r={420} t={t} color="#FFF4C8" amp={0.05} rate={1.2} opacity={0.8} />
            <SunRays id="pg-rays" x={950} y={320} t={t} color="#FFF4C8" n={7} length={1000} width={100} from={110} to={230} opacity={0.45} />
            <circle cx="950" cy="320" r="76" fill="#FFF3C4" stroke="#F7E09A" strokeWidth="6" />
          </g>
          <g stroke="#2F6E96" strokeWidth="3" opacity=".14">
            <path d="M780 600 H1300 M780 600 V1000 M1080 -200 V600" />
          </g>
          {/* il cielo si copre quando la pioggia si allarga */}
          <rect x="-200" y="-200" width="1480" height={HZ + 260} fill="#7E8C9C" opacity={0.5 * sp} />
          <Clouds id="pg-over" t={t} color="#9AA7B6" n={4} y={560} h={220} opacity={sp * 0.9} />
        </g>

        {/* PIANO 1 — mare con onde leggere (0,45) */}
        <g transform={L(0.45)}>
          <rect x="-200" y={HZ} width="1480" height="200" fill="url(#pg-sea)" />
          <path d={`M-200 ${HZ} H1280`} stroke="#E9F7FD" strokeWidth="4" opacity=".8" />
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} x={-150 + i * 90 + (i % 3) * 20} y={HZ + 14 + (i % 4) * 12} width={20 + (i % 3) * 10} height="3" rx="1.5" fill="#FFFFFF" opacity={(0.2 + 0.5 * Math.max(0, Math.sin(t * 2 + i))) * sun} />
          ))}
          <WaveLines t={t} ys={[HZ + 30, HZ + 60]} color="#E9F7FD" amp={4} w={220} speed={22} width={3} opacity={0.6} />
          <WaveBand t={t} y={SAND_Y - 26} fill="#8FD3F4" foam="#FFFFFF" amp={10} w={260} speed={36} bob={4} foamWidth={7} foamOpacity={0.9} />
        </g>

        {/* gabbiani (0,5) */}
        <g transform={L(0.5)}>
          <Gulls t={t} seed={12} n={3} y={740} h={90} color={K} size={0.75} period={11} />
        </g>

        {/* PIANO 2 — spiaggia, nuvola e cerchio di pioggia (0,65) */}
        <g transform={L(0.65)}>
          <path d={wavePathLocal(SAND_Y, t)} fill="url(#pg-sand)" />
          {GRAINS.map((g, i) => <circle key={i} cx={g.x} cy={g.y} r={g.s} fill="#C9A874" opacity=".5" />)}
          <path d="M-100 1340 q80 -10 160 0 M300 1420 q90 -12 180 0 M820 1360 q70 -10 140 0 M620 1500 q90 -10 180 0" fill="none" stroke="#D5B27E" strokeWidth="4" strokeLinecap="round" opacity=".7" />
          {/* secchiello e paletta, asciutti */}
          <g transform="translate(200 1236)" stroke={K} strokeWidth="6" strokeLinejoin="round">
            <path d="M-36 -60 H36 L28 0 H-28 Z" fill="#9ED8C4" />
            <path d="M-36 -60 Q0 -110 36 -60" fill="none" strokeWidth="4" />
            <path d="M50 4 L90 -90" strokeWidth="8" />
            <path d="M84 -90 l20 -40 l14 8 l-16 40 Z" fill="#8CC9E8" />
          </g>

          {/* sabbia bagnata: la scia del primo cerchio e il cerchio attuale */}
          <ellipse cx={600} cy={RCY} rx={RX + 10} ry={RY + 6} fill="url(#pg-wet)" opacity={0.55} />
          <ellipse cx={cx} cy={RCY} rx={RX + 20} ry={RY + 10} fill="url(#pg-wet)" opacity={0.75} />
          <rect x="-200" y={SAND_Y} width="1480" height="1000" fill="#A68A5C" opacity={0.3 * sp} />

          {/* ombrellone rovesciato (l'oggetto chiave) */}
          <g transform="translate(520 1196) rotate(-10)">
            <clipPath id="pg-umb">
              <path d="M-160 -30 Q0 90 160 -30 Q0 -6 -160 -30 Z" />
            </clipPath>
            <path d="M-6 -20 L110 -190" stroke={K} strokeWidth="14" strokeLinecap="round" />
            <path d="M-6 -20 L110 -190" stroke="#F4F1E6" strokeWidth="6" strokeLinecap="round" />
            <path d="M110 -190 q14 -20 -2 -34" fill="none" stroke={K} strokeWidth="8" strokeLinecap="round" />
            <path d="M-160 -30 Q0 90 160 -30 Q0 -6 -160 -30 Z" fill="#F2994A" />
            <g clipPath="url(#pg-umb)">
              {[-110, -10, 90].map((x) => <path key={x} d={`M0 -10 L${x} 120 L${x + 50} 120 Z`} fill="#F4F1E6" />)}
              <path d="M-160 -30 Q0 -6 160 -30 V-10 Q0 14 -160 -10 Z" fill={K} opacity=".2" />
            </g>
            <path d="M-160 -30 Q0 90 160 -30 Q0 -6 -160 -30 Z" fill="none" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            {/* acqua raccolta nella cupola */}
            <ellipse cx="0" cy="-14" rx={110} ry="10" fill="#8FD3F4" opacity=".7" />
          </g>
          {/* asciugamano fradicio */}
          <g transform="translate(700 1226)">
            <path d="M-110 -26 L120 -34 L150 28 L-90 36 Z" fill="url(#pg-towel)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <path d="M-110 -26 L120 -34 L150 28 L-90 36 Z" fill={K} opacity=".18" />
            <path d="M-60 20 q30 -10 60 0 M30 -10 q30 -8 60 0" fill="none" stroke="#E6F6FD" strokeWidth="4" opacity=".7" />
          </g>

          {/* pozzanghere: schizzi e increspature dove cadono le gocce */}
          {SPOTS.map((s, i) => {
            const p = mod(t * s.rate + s.ph, 1);
            const x = cx + s.u * RX * 0.9 * lerp(1, 3.6, sp);
            const y = RCY + s.v * RY * 0.9 * lerp(1, 6, sp);
            if (y < SAND_Y + 20) return null;
            return (
              <g key={i} opacity={1 - p}>
                <ellipse cx={x} cy={y} rx={6 + p * 34} ry={2 + p * 8} fill="none" stroke="#E6F6FD" strokeWidth="3" />
                <path d={`M${x - 4} ${y - 2} l-8 ${-18 * Math.sin(p * Math.PI)} M${x + 4} ${y - 2} l8 ${-18 * Math.sin(p * Math.PI)}`} stroke="#E6F6FD" strokeWidth="3" strokeLinecap="round" />
              </g>
            );
          })}

          {/* la pioggia, solo dentro il cerchio (poi dappertutto) */}
          <clipPath id="pg-clip">
            <path d={clip} />
          </clipPath>
          <g clipPath="url(#pg-clip)">
            <g opacity={1 - 0.65 * sp}>
            <Rain t={t} level="far" seed={21} color="#DCEAF4" opacity={0.85} angle={6} x={cx - 230} w={480} />
            <Rain t={t} level="far" seed={24} color="#DCEAF4" opacity={0.75} angle={6} x={cx - 230} w={480} />
            <Rain t={t} level="near" seed={22} color="#F2F8FC" opacity={0.85} angle={10} x={cx - 220} w={480} />
            <Rain t={t} level="near" seed={25} color="#F2F8FC" opacity={0.8} angle={10} x={cx - 220} w={480} />
            </g>
            {sp > 0 && (
              <g opacity={sp}>
                <Rain t={t} level="far" seed={26} color="#DCEAF4" opacity={0.7} angle={8} />
                <Rain t={t} level="near" seed={27} color="#F2F8FC" opacity={0.7} angle={12} />
              </g>
            )}
          </g>

          {/* la nuvola, appesa a due cavi del set */}
          {/* due cavi appesi a un'americana sotto il titolo (non lo attraversano) */}
          <g stroke={K} strokeWidth="3" opacity={0.45 * (1 - sp)}>
            <path d={`M${cx + 110} ${CY - 90} V545 M${cx + 175} ${CY - 50} V545`} />
            <path d={`M${cx + 60} 540 H${cx + 240}`} strokeWidth="10" />
          </g>
          <g transform={`translate(${cx} ${CY}) scale(${cs})`}>
            <ellipse cx="0" cy="70" rx="220" ry="18" fill="#6C7A8B" opacity=".4" />
            <path d={cloudPath} fill="url(#pg-cloud)" stroke={K} strokeWidth={8 / cs} strokeLinejoin="round" />
            <path d="M-150 -20 Q-110 -60 -70 -50 M0 -96 Q50 -116 100 -80" fill="none" stroke="#E2E8EE" strokeWidth={6 / cs} strokeLinecap="round" opacity=".8" />
            <path d="M-180 46 H200" stroke="#5B687A" strokeWidth={6 / cs} opacity=".5" />
          </g>
        </g>

        {/* PIANO 3 — staccionata da duna a sinistra, erba a destra (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1620 Q100 1600 380 1760 Q460 1820 480 1960 H-200 Z" fill="#D4B47C" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          {Array.from({ length: 9 }, (_, i) => {
            const x = -120 + i * 58, y = 1560 + i * 26;
            return <rect key={i} x={x} y={y} width="24" height="190" fill="#C9A884" stroke={K} strokeWidth="6" transform={`rotate(${4 + i} ${x} ${y})`} />;
          })}
          <path d="M-200 1610 L360 1800 M-200 1690 L360 1880" stroke={K} strokeWidth="6" opacity=".7" />
          <path d="M760 1960 Q840 1700 1000 1650 Q1120 1620 1280 1640 V1960 Z" fill="#D4B47C" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          {GRASS.map((g, i) => {
            const sway = Math.sin(t * 1.6 + g.ph) * 10;
            const by = 1690 + Math.abs(g.x - 1000) * 0.2;
            return <path key={i} d={`M${g.x} ${by} Q${g.x + g.lean * 0.5} ${by - g.h * 0.6} ${g.x + g.lean + sway} ${by - g.h}`} fill="none" stroke={i % 3 ? '#6DA26A' : '#A9C98A'} strokeWidth={i % 2 ? 7 : 5} strokeLinecap="round" />;
          })}
        </g>

        {/* PIANO 4 — luccichii vicini e gocce verso la camera dopo l'allargamento (1,7) */}
        <g transform={L(1.7)}>
          <NearMotes id="pg-near" t={t} color="#FFFFFF" n={6} opacity={0.1} />
          {sp > 0 && <Rain t={t} level="near" seed={23} color="#EAF4FB" opacity={0.35 * sp} angle={18} />}
        </g>
      </g>

      <Finish id="pg" tint="#8FD3F4" tintOpacity={0.1} />
    </svg>
  );
};

/** Bordo della sabbia leggermente ondulato (bagnasciuga). */
function wavePathLocal(y: number, t: number) {
  const s = Math.sin(t * 0.9) * 6;
  return `M-200 ${y + s} Q100 ${y - 14 + s} 400 ${y + s} Q700 ${y + 14 + s} 1000 ${y + s} Q1150 ${y - 8 + s} 1280 ${y + s} V2000 H-200 Z`;
}
