import React from 'react';
import { camera, eio, eo, lerp, rng, seg } from '../../lib/anim';
import { Embers, Glow, NearMotes, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { Fence, Fern, JPDefs, JungleTree, K, RaptorHead } from './Comuni';

// Senza corrente: al tramonto, la recinzione altissima con il cartello 10.000 VOLT e le lampade sui pali; dietro, il
// cancello delle gabbie dei raptor; in primo piano a sinistra la centralina con la grande leva rossa (oggetto chiave).
// Eventi: prima frase la centralina con la scritta «RIAVVIO» che lampeggia; seconda frase il cancello delle gabbie si
// apre (cue 1 → + 1,2, il cancello dello spartito); terza frase dal buio spunta un raptor piumato (generico); quarta
// frase la leva si abbassa (cue 3 − 0,2, la serratura) e le lampade si accendono una dopo l'altra (cue 3 + 0,3 + 0,25·i);
// quinta frase la scossa: scintille sul cavo in alto e un berrettino da bambino che cade (cue 4 + 1,2, un solo lampo).
// Piani: cielo del tramonto (0,2) · giungla (0,4) · gabbie dei raptor (0,5) · recinzione con le lampade (0,65)
//        · centralina e leva (0,95) · felci (1,25) · scintille e particelle (1,5–1,8)

const r = rng(12);
const SPARKS = Array.from({ length: 14 }, () => ({ a: r() * Math.PI * 2, v: 60 + r() * 160, s: 4 + r() * 5 }));

export const Corrente: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const gate = eo(seg(t, cues[1], cues[1] + 1.2));
  const raptor = eo(seg(t, cues[2], cues[2] + 0.8));
  const lever = eo(seg(t, cues[3] - 0.2, cues[3] + 0.4));
  const lampOn = (i: number) => seg(t, cues[3] + 0.3 + i * 0.25, cues[3] + 0.45 + i * 0.25);
  const glow = seg(t, cues[3] + 0.3, cues[3] + 1.5);
  const zap = seg(t, cues[4] + 1.2, cues[4] + 2.0);
  const flash = flashAt(t, [cues[4] + 1.2], [0.8]);
  const cap = eio(seg(t, cues[4] + 1.3, cues[4] + 2.1));
  const blink = Math.sin(t * 8) > 0 ? 1 : 0.3;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cr" />
        <JPDefs id="cr" />
        <Lin id="cr-sky" stops={[[0, '#2A3448'], [0.3, '#6A5A6A'], [0.45, '#C88A6A'], [0.55, '#F2B87A'], [1, '#E8C890']]} />
        <Lin id="cr-ground" stops={[[0, '#5A4A30'], [1, '#22180E']]} />
        <Lin id="cr-box" x2={1} y2={0} stops={[[0, '#5A6A5A'], [0.45, '#A8B8A8'], [1, '#3A4A3A']]} />
        <Lin id="cr-cage" stops={[[0, '#2A2E2A'], [1, '#141614']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo del tramonto (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#cr-sky)" />
          <circle cx="900" cy="790" r="80" fill="#FFE0A0" opacity=".9" />
          <Glow id="cr-sun" x={900} y={790} r={360} t={t} color="#FFD090" amp={0.03} rate={1} opacity={0.5} />
        </g>
        {/* PIANO 1 — giungla (0,4) */}
        <g transform={L(0.4)}>
          {Array.from({ length: 8 }, (_, i) => <JungleTree key={i} x={-160 + i * 190} y={1040} h={140 + (i % 3) * 50} t={t} ph={i} leaf={['#2A4A30', '#1E3E28', '#33553A'][i % 3]} trunk="#1E160E" outline={false} />)}
        </g>
        {/* PIANO 2 — il cancello delle gabbie dei raptor che si apre, il raptor che spunta (0,5) */}
        <g transform={L(0.5)}>
          <path d="M-200 1040 H1280 V2200 H-200 Z" fill="url(#cr-ground)" />
          <rect x="-200" y="1130" width="1480" height="40" fill="#E8C030" stroke={K} strokeWidth="5" />
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-200 + i * 52} 1170 l26 -40 h24 l-26 40 Z`} fill={K} />)}
          {Array.from({ length: 16 }, (_, i) => <ellipse key={i} cx={(i * 233) % 1400 - 160} cy={1320 + ((i * 127) % 520)} rx={12 + (i % 4) * 7} ry={6 + (i % 3) * 3} fill="#4A3A24" stroke={K} strokeWidth="3" />)}
          <path d="M-200 1400 Q300 1360 600 1460 T1280 1420" stroke="#1A1E1A" strokeWidth="14" fill="none" />
          <rect x="520" y="760" width="420" height="300" fill="url(#cr-cage)" stroke={K} strokeWidth="8" />
          <rect x="500" y="736" width="460" height="34" fill="#3A3E3A" stroke={K} strokeWidth="6" />
          <text x="730" y="762" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="24" fill="#F2C14E">RAPTOR</text>
          <g opacity={raptor}><RaptorHead x={680} y={900} s={0.75} t={t} open={0.3} /></g>
          {[0, 1].map((side) => (
            <g key={side} transform={`translate(${side ? 940 : 520} 770) scale(${side ? -1 : 1} 1) skewY(${-12 * gate}) scale(${1 - 0.6 * gate} 1)`}>
              <rect x="0" y="0" width="210" height="290" fill="#4A4E4A" stroke={K} strokeWidth="6" />
              {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M${18 + k * 34} 0 V290`} stroke="#22261E" strokeWidth="9" />)}
              <path d="M0 145 H210" stroke="#22261E" strokeWidth="10" />
            </g>
          ))}
          {gate > 0 && gate < 1 && <rect x="500" y="1040" width="460" height="16" fill="#C8A060" opacity={0.6 * (1 - gate)} />}
        </g>

        {/* PIANO 3 — la recinzione con le lampade che si accendono (0,65) */}
        <g transform={L(0.65)}>
          <Fence id="cr" x0={-60} x1={1140} y={1120} h={480} posts={5} signX={700} accent={P.accento} glow={glow} />
          {[-60, 240, 540, 840, 1140].map((x, i) => (
            <g key={i}>
              <rect x={x - 20} y="630" width="40" height="26" rx="6" fill={lampOn(i) > 0.5 ? '#FFF4C0' : '#4A4E48'} stroke={K} strokeWidth="5" />
              <Glow id={`cr-l${i}`} x={x} y={650} r={160} t={t} color="#FFF4C0" amp={0.05} rate={3} opacity={0.6 * lampOn(i)} />
            </g>
          ))}
          {/* la scossa: scintille sul cavo in alto e il berrettino che cade */}
          <g transform="translate(700 640)">
            {zap > 0 && zap < 1 && SPARKS.map((s, i) => <circle key={i} cx={Math.cos(s.a) * s.v * zap} cy={Math.sin(s.a) * s.v * zap + 160 * zap * zap} r={s.s * 2} fill="#FFF8D0" opacity={1 - zap} />)}
            <path d="M-60 -20 L-20 10 L-40 30 L10 60 L-10 80 L40 110" fill="none" stroke="#E9F6FF" strokeWidth="12" opacity={zap > 0 && zap < 1 ? 1 - zap : 0} />
            <Glow id="cr-zap" x={0} y={0} r={320} t={t} color="#DFF4FF" amp={0} opacity={zap > 0 ? 1 - zap : 0} />
          </g>
          <g transform={`translate(${lerp(700, 640, cap)} ${lerp(660, 1090, cap)}) rotate(${cap * 260})`} opacity={seg(t, cues[4] + 1.25, cues[4] + 1.35)}>
            <path d="M-34 0 Q-32 -36 0 -38 Q32 -36 34 0 Z" fill="#4AA0E0" stroke={K} strokeWidth="5" />
            <path d="M20 -2 H62" stroke={K} strokeWidth="8" strokeLinecap="round" />
            <path d="M22 -2 H60" stroke="#4AA0E0" strokeWidth="4" strokeLinecap="round" />
          </g>
        </g>

        {/* PIANO 4 — la centralina con la grande leva rossa (0,95) */}
        <g transform={L(0.95)}>
          <g transform="translate(220 1000)">
            <rect x="-170" y="-260" width="340" height="420" rx="14" fill="url(#cr-box)" stroke={K} strokeWidth="9" />
            <path d="M-150 -244 H150" stroke="#E8F0E8" strokeWidth="5" opacity=".6" />
            <rect x="-140" y="-230" width="280" height="56" rx="6" fill="#141A14" stroke={K} strokeWidth="5" />
            <text x="0" y="-191" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="34" fill={lever > 0.5 ? '#6AF0A0' : '#F2C14E'} opacity={lever > 0.5 ? 1 : blink}>{lever > 0.5 ? 'CORRENTE ON' : 'RIAVVIO'}</text>
            {[-100, -50, 0, 50, 100].map((x, i) => <circle key={x} cx={x} cy={-130} r="14" fill={lampOn(i) > 0.5 ? '#6AF0A0' : '#5A2A28'} stroke={K} strokeWidth="4" />)}
            <rect x="-60" y="-80" width="120" height="200" rx="10" fill="#2A302A" stroke={K} strokeWidth="6" />
            <path d="M-40 -60 V100 M40 -60 V100" stroke="#4A504A" strokeWidth="6" />
            <g transform={`rotate(${lerp(-40, 40, lever)} 0 20)`}>
              <rect x="-12" y="-120" width="24" height="140" rx="10" fill="url(#cr-steel)" stroke={K} strokeWidth="5" />
              <rect x="-40" y="-150" width="80" height="44" rx="18" fill={P.accento} stroke={K} strokeWidth="6" />
              <path d="M-28 -140 H20" stroke="#FFFFFF" strokeWidth="5" opacity=".6" />
            </g>
            <text x="-120" y="146" fontFamily={SANS} fontWeight={800} fontSize="22" fill={K}>OFF</text>
            <text x="80" y="146" fontFamily={SANS} fontWeight={800} fontSize="22" fill={K}>ON</text>
            <path d="M170 -100 Q260 -60 300 120" stroke="#1A1E1A" strokeWidth="16" fill="none" />
          </g>
        </g>

        {/* PIANO 5 — felci in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <Fern x={-60} y={2000} s={2.4} t={t} ph={0} color="#2E6A44" />
          <Fern x={1140} y={2000} s={2.4} t={t} ph={1} color="#245A3A" flip />
          <Fern x={560} y={2140} s={1.7} t={t} ph={2} color="#3A7A50" />
        </g>

        {/* PIANO 6 — scintille, particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)} opacity={glow}>
          <Embers t={t} x={540} y={900} w={1000} h={500} seed={4} n={10} hot="#FFFFFF" warm="#BFE6FF" drift={30} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="cr-near" t={t} color="#FFE8C0" n={6} opacity={0.08} />
        </g>
        <rect x="-200" y="-200" width="1480" height="2400" fill="#E9F6FF" opacity={0.4 * flash} />
      </g>
      <Finish id="cr" tint="#1E4A30" tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): cancello cue1 → + 1,2 · raptor cue2 · leva cue3 − 0,2 · lampade cue3 + 0,3 + 0,25·i · scossa cue4 + 1,2.
