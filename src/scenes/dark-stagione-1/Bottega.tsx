import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, GlassDrops, Glow, NearMotes, Rain } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { BRASS, Device, K, PocketWatch, RED, Raincoat, TINT } from './Winden';

// Il misterioso straniero: bottega dell'orologiaio Tannhaus, piena di orologi che ticchettano. Sul bancone uno zaino di
// tela aperto con dentro l'apparecchio di ottone; accanto un orologio da taschino. Sul muro la mappa del bosco; fuori
// dalla vetrina la pioggia. Nessuna persona.
// Eventi: lo zaino si illumina (cue 0) · l'apparecchio si accende piano, l'orologio da taschino brilla (cue 1)
//         · sulla mappa una X rossa sulla grotta (cue 2) · dallo zaino spunta un impermeabile giallo sbiadito, tutte le
//         lancette corrono in avanti: è Jonas, dal futuro (cue 3).
// Piani: parete con gli orologi e la vetrina (0,3) · mappa e pendoli (0,5) · bancone con zaino, apparecchio e orologio (0,7)
//        · lente d'ingrandimento e ingranaggi in primo piano (1,2) · pulviscolo e particelle (1,5–1,8)

const r = rng(1888);
const CLOCKS = Array.from({ length: 9 }, (_, i) => ({
  x: 120 + (i % 3) * 150 + r() * 40, y: 700 + Math.floor(i / 3) * 135 + r() * 20, rr: 40 + r() * 22, ph: r() * 12, c: ['#6A4A32', '#4A5A52', '#7A6040'][i % 3],
}));

export const Bottega: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const pack = eo(seg(t, cues[0], cues[0] + 0.5));
  const dev = eo(seg(t, cues[1], cues[1] + 1));
  const mark = seg(t, cues[2], cues[2] + 0.7);
  const reveal = eob(seg(t, cues[3] + 0.4, cues[3] + 1.0));
  const rush = seg(t, cues[3] + 0.4, dur);
  // ore che corrono in avanti dopo la rivelazione
  const hand = (k: number) => (Math.floor(t) * 6 + k * 40) + rush * rush * 2400;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bt" />
        <Lin id="bt-wall" stops={[[0, '#1A1612'], [0.4, '#3A2E24'], [0.7, '#4A3C2E'], [1, '#2A2018']]} />
        <Lin id="bt-street" stops={[[0, '#0E1416'], [1, '#2A3A3A']]} />
        <Lin id="bt-counter" stops={[[0, '#7A5A3A'], [0.06, '#5A4028'], [1, '#1E140C']]} />
        <Lin id="bt-canvas" x2={1} y2={0} stops={[[0, '#7A7458'], [0.5, '#9A9270'], [1, '#5A543E']]} />
        <Lin id="bt-map" stops={[[0, '#E2D8B8'], [1, '#C8BC98']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con gli orologi, vetrina sulla strada bagnata (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#bt-wall)" />
          <rect x="680" y="600" width="340" height="440" fill="url(#bt-street)" />
          <clipPath id="bt-win"><rect x="680" y="600" width="340" height="440" /></clipPath>
          <g clipPath="url(#bt-win)">
            <Glow id="bt-lamp" x={900} y={700} r={200} t={t} color="#F6D58A" amp={0.06} rate={1.6} opacity={0.6} />
            <path d="M900 1040 V720 Q920 700 940 712" fill="none" stroke={K} strokeWidth="10" />
            <path d="M700 980 L760 940 H880 L940 980" fill="#2A3A3A" stroke={K} strokeWidth="4" />
            <Rain t={t} level="far" seed={12} color="#A8C0C0" opacity={0.45} />
            <GlassDrops t={t} x={680} y={600} w={340} h={440} n={8} color="#C9D9D2" />
          </g>
          <rect x="680" y="600" width="340" height="440" fill="none" stroke={K} strokeWidth="14" />
          <path d="M850 600 V1040" stroke={K} strokeWidth="9" />
          <path d="M720 640 Q760 620 800 640" fill="none" stroke="#FFFFFF" strokeWidth="6" opacity=".25" />
        </g>

        {/* PIANO 1 — mappa del bosco e orologi alla parete (0,5) */}
        <g transform={L(0.5)}>
          {CLOCKS.map((c, i) => (
            <g key={i} transform={`translate(${c.x} ${c.y})`}>
              <circle r={c.rr + 10} fill={c.c} stroke={K} strokeWidth="7" />
              <circle r={c.rr} fill="#EEE6D2" stroke={K} strokeWidth="4" />
              <path d={`M0 0 V${-c.rr * 0.55}`} stroke={K} strokeWidth="5" strokeLinecap="round" transform={`rotate(${hand(i) / 12 + c.ph * 30})`} />
              <path d={`M0 0 V${-c.rr * 0.8}`} stroke={RED} strokeWidth="3" strokeLinecap="round" transform={`rotate(${hand(i) + c.ph * 30})`} />
              <circle r="4" fill={K} />
            </g>
          ))}
          {/* mappa con la grotta, poi la X rossa */}
          <g transform="translate(560 740) rotate(3)">
            <rect x="-90" y="-80" width="180" height="150" fill="url(#bt-map)" stroke={K} strokeWidth="6" />
            <path d="M-70 40 Q-30 -20 20 10 T80 -30" fill="none" stroke="#5E7A6E" strokeWidth="5" />
            {[[-50, -30], [-20, -50], [50, 30], [70, -50]].map(([x, y], i) => <path key={i} d={`M${x - 12} ${y + 12} l12 -24 l12 24 Z`} fill="#3E5A4C" />)}
            <path d="M0 10 q0 -18 14 -18 q14 0 14 18 Z" fill={K} />
            <path d={`M-6 -16 L${lerp(-6, 34, seg(mark, 0, 0.5))} ${lerp(-16, 24, seg(mark, 0, 0.5))}`} stroke={RED} strokeWidth="8" strokeLinecap="round" opacity={mark > 0 ? 1 : 0} />
            <path d={`M34 -16 L${lerp(34, -6, seg(mark, 0.5, 1))} ${lerp(-16, 24, seg(mark, 0.5, 1))}`} stroke={RED} strokeWidth="8" strokeLinecap="round" opacity={mark > 0.5 ? 1 : 0} />
          </g>
          {/* pendolo grande */}
          <g transform="translate(560 900)">
            <rect x="-50" y="-40" width="100" height="250" rx="12" fill="#5A3E28" stroke={K} strokeWidth="7" />
            <path d={`M0 -20 L${Math.sin(t * Math.PI) * 30} 150`} stroke={BRASS} strokeWidth="5" />
            <circle cx={Math.sin(t * Math.PI) * 30} cy="160" r="18" fill={BRASS} stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 2 — bancone con lo zaino aperto, l'apparecchio e l'orologio da taschino (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1080 H1280 V2200 H-200 Z" fill="url(#bt-counter)" stroke={K} strokeWidth="10" />
          {[1220, 1400].map((y) => <path key={y} d={`M-200 ${y} H1280`} stroke={K} strokeWidth="6" opacity=".7" />)}
          {[200, 540, 880].map((x) => (
            <g key={x}><rect x={x - 100} y="1260" width="200" height="110" fill="none" stroke="#2A1C10" strokeWidth="6" /><circle cx={x} cy="1315" r="10" fill={BRASS} stroke={K} strokeWidth="4" /></g>
          ))}
          {/* zaino di tela */}
          <g transform="translate(700 1086)">
            <Glow id="bt-pg" x={0} y={-120} r={300} t={t} color="#FFF1C2" amp={0.06} rate={2} opacity={0.3 * pack} />
            {/* impermeabile giallo sbiadito che spunta dallo zaino */}
            <g transform={`translate(-80 ${lerp(-60, -310, reveal)}) rotate(-12)`} opacity={seg(t, cues[3] + 0.4, cues[3] + 0.6)}>
              <g opacity=".85"><Raincoat id="bt-rc" t={0} scale={0.32} wind={0} glow={0.6 * reveal} wet={false} /></g>
            </g>
            <g transform="translate(70 -150)"><Device id="bt-dv" t={t} on={dev * 0.6} scale={0.62} /></g>
            <path d="M-160 0 Q-170 -160 -120 -190 H140 Q180 -160 170 0 Z" fill="url(#bt-canvas)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M-120 -190 Q0 -150 140 -190" fill="none" stroke="#4A4430" strokeWidth="6" />
            <rect x="-70" y="-110" width="140" height="70" rx="10" fill="#8A8262" stroke={K} strokeWidth="6" />
            <path d="M-160 -40 Q-230 -60 -220 -140" fill="none" stroke="#5A543E" strokeWidth="18" strokeLinecap="round" />
          </g>
          {/* orologio da taschino di Tannhaus */}
          <g transform="translate(330 1020) rotate(-10)">
            <Glow id="bt-wg" x={0} y={0} r={160} t={t} color={BRASS} amp={0.1} rate={2.4} opacity={0.5 * dev} />
            <PocketWatch t={t + rush * rush * 40} scale={0.5} />
          </g>
          <path d="M330 1070 Q260 1080 220 1060" fill="none" stroke={BRASS} strokeWidth="4" />
        </g>

        {/* PIANO 3 — lente d'ingrandimento a destra, ingranaggi sul bordo del bancone (1,2) */}
        <g transform={L(1.2)}>
          <path d="M1280 1300 L1080 1100" stroke={K} strokeWidth="22" strokeLinecap="round" />
          <circle cx="1010" cy="1040" r="110" fill="#DCE8E8" opacity=".25" stroke={K} strokeWidth="16" />
          <path d="M950 990 Q980 960 1020 960" fill="none" stroke="#FFFFFF" strokeWidth="8" opacity=".5" />
          {[[120, 1640, 90, 12], [300, 1760, 60, 9], [60, 1860, 70, 10]].map(([x, y, rr, n], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${t * (i % 2 ? -20 : 20) + rush * rush * 600})`}>
              <circle r={rr} fill={BRASS} stroke={K} strokeWidth="8" />
              {Array.from({ length: n }, (_, k) => <rect key={k} x={-10} y={-rr - 18} width="20" height="22" fill={BRASS} stroke={K} strokeWidth="5" transform={`rotate(${(k * 360) / n})`} />)}
              <circle r={rr * 0.35} fill="#2A1C10" stroke={K} strokeWidth="6" />
            </g>
          ))}
        </g>

        {/* PIANO 4 — pulviscolo nella luce della vetrina, particelle vicine (1,5–1,8) */}
        <g transform={L(0.6)}>
          <Dust t={t} top={{ y: 620, x0: 700, x1: 1000 }} bottom={{ y: 1080, x0: 380, x1: 900 }} n={30} color="#F6E4B8" boost={0} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="bt-near" t={t} color="#F6E4B8" n={5} vx={-20} vy={-6} opacity={0.07} />
        </g>
      </g>

      <Finish id="bt" tint={TINT} tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): zaino cue0 · apparecchio e orologio cue1 · X sulla mappa cue2 · impermeabile e lancette
// che corrono da cue3+0,4.
