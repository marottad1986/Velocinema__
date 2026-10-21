import React from 'react';
import { camera, eo, eob, rng, seg } from '../../lib/anim';
import { DISPLAY } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, GlassDrops, Glow, NearMotes, Rain } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Letter, Pines, Raincoat, TINT, Tower, YELLOW } from './Winden';

// Una città con un segreto: Winden dalla finestra della camera di Jonas, in un giorno di pioggia. Tetti bagnati, bosco
// tutto intorno, le torri della centrale che fumano; su un lampione un manifesto «SCOMPARSO» (nessun volto, solo «?»).
// Sul davanzale la busta chiusa di Michael; appeso all'anta l'impermeabile giallo di Jonas.
// Eventi: la centrale «si accende» (cue 1) · i manifesti si moltiplicano (cue 2) · l'impermeabile si illumina (cue 3)
//         · la busta si illumina (cue 4).
// Piani: cielo (0,25) · bosco e torri (0,4) · tetti e lampione (0,6) · finestra, davanzale, impermeabile (1,15)
//        · gocce sul vetro e particelle (1,5–1,8)

const r = rng(2019);
const HOUSES = Array.from({ length: 9 }, (_, i) => ({ x: -160 + i * 160 + r() * 40, w: 130 + r() * 50, h: 90 + r() * 80, lit: r() > 0.45, c: ['#2E3B36', '#34443D', '#283430'][i % 3] }));

const Poster: React.FC<{ x: number; y: number; p: number; rot: number }> = ({ x, y, p, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${p})`} opacity={p}>
    <rect x="-46" y="-60" width="92" height="120" fill="#ECE6D6" stroke={K} strokeWidth="5" />
    <text x="0" y="-36" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="17" fill="#B8443A">SCOMPARSO</text>
    <rect x="-28" y="-26" width="56" height="58" fill="#C9C2B0" />
    <text x="0" y="22" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="48" fill="#4A4438">?</text>
    <path d="M-30 44 H30 M-24 52 H24" stroke="#8A8270" strokeWidth="4" />
  </g>
);

export const Citta: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const plant = seg(t, cues[1], cues[1] + 0.8);
  const posters = [0, 1, 2].map((k) => eob(seg(t, cues[2] + k * 0.3, cues[2] + 0.4 + k * 0.3)));
  const coat = eo(seg(t, cues[3], cues[3] + 0.6));
  const letter = eo(seg(t, cues[4], cues[4] + 0.6));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ci" />
        <Lin id="ci-sky" stops={[[0, '#141C1A'], [0.35, '#34433E'], [0.55, '#5A6B63'], [0.7, '#6E7D74']]} />
        <Lin id="ci-tower" x2={1} y2={0} stops={[[0, '#7E8A84'], [0.55, '#5E6B65'], [1, '#3E4944']]} />
        <Lin id="ci-roof" stops={[[0, '#3A4A44'], [1, '#1E2824']]} />
        <Lin id="ci-frame" x2={1} y2={0} stops={[[0, '#2A2420'], [0.5, '#3E342C'], [1, '#1E1A16']]} />
        <Lin id="ci-sill" stops={[[0, '#5A4A3C'], [0.2, '#3E3228'], [1, '#14100C']]} />
        <Lin id="ci-wall" stops={[[0, '#22201C'], [1, '#0C0B0A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo coperto, pioggia lontana (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#ci-sky)" />
          <Fog id="ci-f0" t={t} y={760} x={500} rx={900} ry={120} color="#8A9A92" opacity={0.3} speed={0.2} />
          <Rain t={t} level="far" seed={5} color="#A8BDB4" opacity={0.3} />
        </g>

        {/* PIANO 1 — bosco e torri della centrale (0,4) */}
        <g transform={L(0.4)}>
          <Pines t={t} y={1050} n={14} h={220} seed={7} color="#1E2B26" sway={2} />
          <g transform="translate(500 1010)">
            <Glow id="ci-pg" x={0} y={-120} r={300} t={t} color="#E8F0C8" amp={0.06} rate={1.4} opacity={0.15 + 0.3 * plant} />
            <Tower id="ci-t1" t={t} w={220} h={330} fill="url(#ci-tower)" steamOpacity={0.4 + 0.25 * plant} />
          </g>
          <g transform="translate(670 1020)">
            <Tower id="ci-t2" t={t + 3} w={170} h={260} fill="url(#ci-tower)" steamOpacity={0.35 + 0.25 * plant} />
          </g>
          {/* luci rosse in cima alle torri */}
          {[[500, 684], [670, 764]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" fill="#FF5A4A" opacity={0.3 + 0.7 * (Math.sin(t * 3 + i) > 0 ? 1 : 0.2)} />)}
          <Fog id="ci-f1" t={t} y={1040} x={540} rx={800} ry={60} color="#9AAAA2" opacity={0.35} speed={0.25} ph={1} />
        </g>

        {/* PIANO 2 — tetti bagnati con finestre accese, lampione con i manifesti (0,6) */}
        <g transform={L(0.6)}>
          {HOUSES.map((h, i) => (
            <g key={i} transform={`translate(${h.x} ${1180 - h.h})`}>
              <path d={`M-10 30 L${h.w / 2} -50 L${h.w + 10} 30 Z`} fill="url(#ci-roof)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              <path d={`M${h.w * 0.15} 6 L${h.w / 2} -38`} stroke="#8FA39A" strokeWidth="4" opacity=".5" />
              <rect x="0" y="28" width={h.w} height={h.h + 40} fill={h.c} stroke={K} strokeWidth="6" />
              {h.lit && <Glow id={`ci-hw${i}`} x={h.w / 2} y={70} r={90} t={t} color="#F6D58A" amp={0.1} rate={1.5} ph={i} opacity={0.5} />}
              <rect x={h.w / 2 - 18} y="52" width="36" height="40" fill={h.lit ? '#F6D58A' : '#1A2420'} stroke={K} strokeWidth="4" />
            </g>
          ))}
          <g transform="translate(250 1220)">
            <path d="M0 0 V-330" stroke={K} strokeWidth="14" />
            <path d="M0 -330 Q30 -350 60 -330" fill="none" stroke={K} strokeWidth="10" />
            <Glow id="ci-lamp" x={60} y={-312} r={140} t={t} color="#F6D58A" amp={0.08} rate={2} opacity={0.6} />
            <path d="M44 -330 h32 l-6 22 h-20 Z" fill="#F6D58A" stroke={K} strokeWidth="5" />
            <Poster x={0} y={-150} p={1} rot={-3} />
          </g>
          <Poster x={400} y={1080} p={posters[0]} rot={4} />
          <Poster x={560} y={1110} p={posters[1]} rot={-5} />
          <Poster x={110} y={1090} p={posters[2]} rot={6} />
        </g>

        {/* PIANO 3 — la finestra della camera: cornice ai bordi, davanzale con la busta, impermeabile appeso (1,15) */}
        <g transform={L(1.15)}>
          <GlassDrops t={t} x={70} y={640} w={940} h={580} n={14} color="#C9D9D2" />
          <path d="M-200 -200 H1280 V2200 H-200 Z M40 220 V1260 H1040 V220 Z" fill="url(#ci-frame)" fillRule="evenodd" stroke={K} strokeWidth="10" />
          <path d="M44 226 V1256" stroke="#6A5A4A" strokeWidth="5" opacity=".6" />
          <path d="M-200 1250 H1280 V1340 H-200 Z" fill="url(#ci-sill)" stroke={K} strokeWidth="10" />
          <path d="M-200 1262 H1280" stroke="#9A8670" strokeWidth="5" opacity=".6" />
          <rect x="-200" y="1340" width="1480" height="860" fill="url(#ci-wall)" />
          {/* termosifone sotto la finestra */}
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={220 + i * 72} y="1430" width="54" height="300" rx="20" fill="#2A2824" stroke={K} strokeWidth="7" />)}
          <path d="M200 1420 H880" stroke={K} strokeWidth="10" />
          {/* busta sul davanzale */}
          <g transform="translate(890 1196) rotate(-5)">
            <Glow id="ci-lg" x={0} y={0} r={240} t={t} color={YELLOW} amp={0.1} rate={2.6} opacity={0.55 * letter} />
            <Letter scale={0.62} />
          </g>
          {/* impermeabile appeso all'anta destra */}
          <g transform="translate(900 600)">
            <Raincoat id="ci-rc" t={t} scale={1.05} wind={0.4} glow={0.3 + 0.7 * coat} />
          </g>
          {/* tazza e libro sul davanzale */}
          <g transform="translate(520 1250)">
            <rect x="-70" y="-26" width="150" height="26" fill="#4E5A6A" stroke={K} strokeWidth="5" />
            <rect x="-60" y="-50" width="130" height="24" fill="#7A5A3E" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 4 — pioggia vicina sul vetro e particelle (1,5–1,8) */}
        <g transform={L(1.5)}>
          <clipPath id="ci-glass"><rect x="40" y="220" width="1000" height="1040" /></clipPath>
          <g clipPath="url(#ci-glass)"><Rain t={t} level="near" seed={9} color="#C9D9D2" opacity={0.3} /></g>
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="ci-near" t={t} color="#C9D9D2" n={6} vx={-30} vy={8} opacity={0.08} />
        </g>
      </g>

      <Finish id="ci" tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): centrale cue1 · manifesti da cue2 (0,3 s l'uno) · impermeabile cue3 · busta cue4.
