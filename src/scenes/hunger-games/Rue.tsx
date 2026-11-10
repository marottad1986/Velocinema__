import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Flyers, Glow, NearMotes, Notes, SunRays, Fog } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Arrow, HGDefs, K, Pine, PineRow, Sottobosco } from './Comuni';

// L'amica Rue: una radura del bosco nel pomeriggio, con i raggi del sole tra gli alberi. Sulla pietra le foglie
// medicinali, sull'erba la piccola fionda di Rue, a un ramo la rete di una trappola. Eventi: 1ª frase le foglie sulla
// pietra si illuminano di verde (Rue la cura); 2ª frase accanto alla fionda compare una freccia (le due diventano
// amiche), poi una lancia arriva dall'alto e si pianta nell'erba, la rete si strappa e la luce si raffredda; 3ª frase
// una freccia con l'impennaggio arancione si pianta nel tronco (Katniss la vendica) e dalla radura salgono piano le
// note di una canzone, con la luce che torna calda.
// Piani: cielo e bosco lontano nella luce (0,2–0,4) · radura, pietra, fionda, lancia (0,65) · tronco con la rete (0,85)
//        · felci e rami in primo piano (1,2) · polline nei raggi (1,6)

const r = rng(7171);
const GRASS = Array.from({ length: 60 }, () => ({ x: r() * 1300 - 110, y: 1180 + r() * 340, h: 20 + r() * 40, a: (r() - 0.5) * 0.6 }));

/** Foglia medicinale larga con la nervatura. */
const Foglia: React.FC<{ x: number; y: number; a: number; s: number; c: string }> = ({ x, y, a, s, c }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
    <path d="M0 0 Q-34 -40 0 -100 Q34 -40 0 0 Z" fill={c} stroke={K} strokeWidth="5" />
    <path d="M0 -4 V-92 M0 -30 l-14 -14 M0 -50 l14 -14 M0 -66 l-12 -12" stroke="#1E4A24" strokeWidth="3" fill="none" />
  </g>
);

export const Rue: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const heal = eo(seg(t, griglia(cues[0] + 1.0), griglia(cues[0] + 1.0) + 0.8));
  const fr = eo(seg(t, griglia(cues[1] + 0.6), griglia(cues[1] + 0.6) + 0.5));
  const ts = griglia(cues[1] + 2.6);
  const spear = seg(t, ts - 0.3, ts);
  const torn = seg(t, ts, ts + 0.3);
  const cold = seg(t, ts, ts + 0.4) * (1 - seg(t, griglia(cues[2] + 2), griglia(cues[2] + 2) + 1.2));
  const ta = griglia(cues[2] + 0.5);
  const arrow = seg(t, ta - 0.25, ta);
  const song = eo(seg(t, griglia(cues[2] + 1.2), griglia(cues[2] + 1.2) + 0.8));
  const quiver = ta < t && t < ta + 0.5 ? Math.sin((t - ta) * 60) * 4 * (1 - (t - ta) / 0.5) : 0;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ru" />
        <HGDefs id="ru" />
        <Lin id="ru-sky" stops={[[0, '#2A4A3A'], [0.35, '#7A9A6A'], [0.55, '#E8D8A0'], [0.62, '#F2E4B0']]} />
        <Lin id="ru-ground" stops={[[0, '#7A8A3A'], [0.4, '#4A5E24'], [1, '#18200C']]} />
        <Lin id="ru-bark" x2={1} y2={0} stops={[[0, '#2A1C10'], [0.4, '#6A4A2C'], [0.7, '#7A5634'], [1, '#2A1A0E']]} />
        <Lin id="ru-stone" stops={[[0, '#A8A89A'], [0.5, '#7A7A6E'], [1, '#4A4A42']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo luminoso e raggi tra gli alberi (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ru-sky)" />
          <SunRays id="ru-rays" x={200} y={420} t={t} color="#FFF4C8" n={7} length={1300} width={110} from={110} to={160} opacity={0.4 * (1 - 0.6 * cold)} />
          <Glow id="ru-sun" x={200} y={420} r={360} t={t} color="#FFF4D0" amp={0.03} rate={1} opacity={0.55 * (1 - 0.5 * cold)} />
        </g>
        {/* PIANO 1 — bosco lontano (0,4) */}
        <g transform={L(0.4)}>
          <PineRow y={1170} n={18} h0={260} h1={420} fill="#5A7A52" seed={31} />
          <PineRow y={1200} n={16} h0={200} h1={320} fill="#3E5A38" seed={37} />
          <Fog id="ru-f" t={t} y={1170} rx={900} ry={60} color="#F2ECC8" opacity={0.4} speed={0.2} />
        </g>
        {/* PIANO 2 — la radura: pietra con le foglie, fionda, lancia (0,65) */}
        <g transform={L(0.65)}>
          <path d="M-200 1180 Q540 1160 1280 1180 V2200 H-200 Z" fill="url(#ru-ground)" />
          {/* macchie di sole sull'erba */}
          {[[300, 1230, 160], [620, 1280, 120]].map(([x, y, rx], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={rx * 0.2} fill="#F8F0B0" opacity={0.35 * (1 - 0.7 * cold)} />)}
          {/* la pietra con le foglie medicinali */}
          <path d="M150 1250 Q140 1160 230 1140 Q330 1120 400 1160 Q440 1200 420 1250 Z" fill="url(#ru-stone)" stroke={K} strokeWidth="9" />
          <path d="M180 1170 Q240 1140 330 1140" stroke="#E8E8DC" strokeWidth="5" fill="none" opacity=".6" />
          <Glow id="ru-hg" x={290} y={1120} r={180} t={t} color="#B8F0A0" amp={0.08} rate={4} opacity={0.65 * heal} />
          <Foglia x={250} y={1150} a={-30} s={0.8} c={heal > 0.5 ? '#6AC85A' : '#4A8A3E'} />
          <Foglia x={300} y={1145} a={10} s={0.9} c={heal > 0.5 ? '#7AD86A' : '#4E9440'} />
          <Foglia x={350} y={1150} a={40} s={0.75} c={heal > 0.5 ? '#6AC85A' : '#4A8A3E'} />
          {/* la piccola fionda di Rue sull'erba */}
          <g transform="translate(560 1235) rotate(-20)">
            <path d="M0 0 V-50 M0 -50 L-24 -96 M0 -50 L24 -96" stroke={K} strokeWidth="16" strokeLinecap="round" fill="none" />
            <path d="M0 0 V-50 M0 -50 L-24 -96 M0 -50 L24 -96" stroke="#8A5A30" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M-24 -96 Q0 -60 24 -96" stroke="#D8C8A8" strokeWidth="4" fill="none" />
          </g>
          {/* la freccia di Katniss accanto alla fionda: amiche */}
          <g opacity={fr}><Arrow x={470} y={1262} rot={-8} len={170} s={0.7} glow={fr} /></g>
          {/* la lancia che arriva dall'alto e si pianta nell'erba */}
          {spear > 0 && (
            <g transform={`translate(${lerp(1100, 760, spear)} ${lerp(700, 1250, spear)}) rotate(122)`}>
              <path d="M0 0 H300" stroke={K} strokeWidth="13" strokeLinecap="round" transform="rotate(180)" />
              <path d="M0 0 H300" stroke="#8A6440" strokeWidth="7" transform="rotate(180)" />
              <path d="M0 0 l14 -14 l44 14 l-44 14 Z" fill="#C8D0D4" stroke={K} strokeWidth="4" />
            </g>
          )}
          {torn > 0 && <ellipse cx={760} cy={1252} rx={60 * torn} ry={10 * torn} fill="#2A2410" opacity={0.5 * (1 - torn * 0.5)} />}
        </g>
        {/* PIANO 3 — il tronco a destra con la rete della trappola appesa al ramo (0,85) */}
        <g transform={L(0.85)}>
          <path d="M860 2100 Q880 1400 890 900 Q900 600 910 -200 H1080 Q1060 600 1050 900 Q1040 1400 1090 2100 Z" fill="url(#ru-bark)" stroke={K} strokeWidth="10" />
          {Array.from({ length: 12 }, (_, k) => <path key={k} d={`M${930 + (k % 3) * 34} ${-100 + k * 170} q12 40 -4 90`} stroke="#1A1008" strokeWidth="6" fill="none" />)}
          <path d="M1020 -200 Q1010 600 1010 1400" stroke="#A88A5A" strokeWidth="5" fill="none" opacity=".5" />
          {/* ramo con la rete */}
          <path d="M900 700 Q760 690 600 720" stroke={K} strokeWidth="30" fill="none" strokeLinecap="round" />
          <path d="M900 700 Q760 690 600 720" stroke="#5A3E24" strokeWidth="18" fill="none" strokeLinecap="round" />
          <g transform={`translate(700 712) rotate(${Math.sin(t * 1.3) * 3 + torn * 8})`}>
            <path d="M0 0 L-90 220 M0 0 L90 220 M0 0 L-30 240 M0 0 L30 240" stroke="#C8B48A" strokeWidth="4" fill="none" />
            {[60, 120, 180].map((yy) => <path key={yy} d={`M${-yy * 0.4} ${yy} Q0 ${yy + 20} ${yy * 0.4} ${yy}`} stroke="#C8B48A" strokeWidth="4" fill="none" />)}
            {/* il fondo della rete strappato che pende */}
            <path d={`M-90 220 Q-60 ${250 + 30 * torn} -40 ${300 + 60 * torn} M90 220 Q70 ${260 + 40 * torn} 40 ${310 + 70 * torn}`} stroke="#C8B48A" strokeWidth="4" fill="none" />
          </g>
          {/* la freccia della vendetta che si pianta nel tronco */}
          {arrow > 0 && (
            <g transform={`translate(${lerp(-300, 640, arrow)} ${lerp(1150, 1040, arrow) + quiver})`}>
              <Arrow x={0} y={0} rot={-7} len={260} s={1} glow={1} />
            </g>
          )}
          <Glow id="ru-ag" x={900} y={1000} r={120} t={t} color="#FFB060" amp={0.1} rate={6} opacity={0.5 * seg(t, ta, ta + 0.2) * (1 - seg(t, ta + 1, ta + 2))} />
        </g>
        {/* le note della canzone che salgono piano (restano sotto il titolo) */}
        <g transform={L(0.75)} opacity={song}>
          <Notes t={t} x={420} y={1200} n={7} color="#FFF4D0" outline="#3A4A2A" rise={480} spread={260} size={1.1} speed={0.16} seed={5} />
        </g>
        {/* PIANO 4 — felci ed erba alta in primo piano (1,2) */}
        <g transform={L(1.2)}>
          {GRASS.map((g, i) => (
            <path key={i} d={`M${g.x} ${g.y + 300} q${g.a * 40} ${-g.h * 0.6} ${g.a * 90 + Math.sin(t * 1.5 + i) * 4} ${-g.h * 1.4}`} stroke={i % 3 ? '#2E4A1E' : '#5A7A2E'} strokeWidth="6" fill="none" strokeLinecap="round" />
          ))}
          <Sottobosco id="ru" t={t} y0={1590} ground="#3E5A22" fern="#5A7A2E" stone="#9A9A8A" lit="#F8F0C0" seed={9} leaf="#9AB04A" />
          <Pine x={-120} y={1700} h={900} w={360} fill="#1E3018" outline={K} lit="#8AA86A" seed={88} />
        </g>
        {/* PIANO 5 — foglie che cadono e polline nei raggi (1,6) */}
        <g transform={L(1.6)}>
          <Flyers t={t} seed={17} n={5} color="#9AB04A" outline={K} w={26} h={34} y0={700} y1={1800} speed={0.07} shape="leaf" />
          <NearMotes id="ru-near" t={t} color="#FFF6D0" n={8} r0={50} r1={130} y0={700} y1={1900} opacity={0.12} />
        </g>
      </g>
      {/* luce che si raffredda quando colpiscono Rue */}
      <rect width="1080" height="1920" fill="#1E2A3A" opacity={0.28 * cold} />
      <Finish id="ru" tint="#1E3A2A" tintOpacity={0.1} />
    </svg>
  );
};
