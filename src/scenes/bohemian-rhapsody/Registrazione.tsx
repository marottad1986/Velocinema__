import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { GOLD, K, TINT } from './Comune';

// Un coro fatto in tre: sala di regia anni '70. Oltre il vetro lo studio con tre microfoni in fila; davanti il mixer
// con cursori e lancette; a destra il registratore a bobine che gira; cuffie appese in primo piano.
// Piani: parete e pannelli (0,25) · studio oltre il vetro (0,4) · registratore e vetro (0,6) · mixer (0,85) · cuffie e cavi (1,25) · pulviscolo (1,7)
// Eventi: cues[1] i tre microfoni si accendono uno alla volta · cues[2] i cursori salgono e le lancette ballano,
//         il contatore delle voci sale · cues[3] il contatore arriva a 180 · cues[4] il nastro tra le bobine diventa trasparente.

const r = rng(2207);
const FADERS = Array.from({ length: 16 }, (_, i) => ({ x: 70 + i * 60, lo: 0.15 + r() * 0.2, hi: 0.55 + r() * 0.35, ph: r() * 6 }));
const PANELS = Array.from({ length: 12 }, (_, i) => ({ x: -120 + (i % 6) * 230, y: 40 + Math.floor(i / 6) * 200, c: r() }));

const Reel: React.FC<{ x: number; y: number; rad: number; rot: number }> = ({ x, y, rad, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={rad} fill="#2A2228" stroke={K} strokeWidth="8" />
    <circle r={rad * 0.82} fill="#5A3A2A" />
    <circle r={rad * 0.42} fill="#C8C0B8" stroke={K} strokeWidth="5" />
    {[0, 120, 240].map((a) => <ellipse key={a} cx="0" cy={-rad * 0.6} rx={rad * 0.16} ry={rad * 0.12} fill="#141014" transform={`rotate(${a})`} />)}
    <circle r={rad * 0.1} fill={K} />
    <path d={`M${-rad * 0.7} ${-rad * 0.3} A${rad * 0.76} ${rad * 0.76} 0 0 1 ${-rad * 0.2} ${-rad * 0.74}`} stroke="#E8DCD0" strokeWidth="4" fill="none" opacity=".35" />
  </g>
);

export const Registrazione: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c1 = cues[1] ?? 2.9, c2 = cues[2] ?? 6.7, c3 = cues[3] ?? 9.2, c4 = cues[4] ?? 11.8;
  const mics = [0, 1, 2].map((i) => eob(seg(t, c1 + 0.2 + i * 0.6, c1 + 0.6 + i * 0.6)));
  const level = eo(seg(t, c2, c2 + 1));
  const count = Math.round(lerp(1, 180, eo(seg(t, c2 + 0.2, c3 + 0.4))));
  const hit = eob(seg(t, c3 + 0.3, c3 + 0.7));
  const clear = eo(seg(t, c4, c4 + 1.2));
  const spin = t * (60 + 140 * level);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="re" />
        <Lin id="re-wall" stops={[[0, '#120A10'], [0.4, '#24141C'], [0.75, '#34202A'], [1, '#1A0E14']]} />
        <Lin id="re-studio" stops={[[0, '#2A2034'], [0.6, '#4A3446'], [1, '#5A3E40']]} />
        <Lin id="re-glass" x2={1} y2={1} stops={[[0, '#FFFFFF', 0.1], [0.4, '#FFFFFF', 0], [0.55, '#FFFFFF', 0.08], [1, '#FFFFFF', 0]]} />
        <Lin id="re-desk" stops={[[0, '#6A4A3A'], [0.3, '#4A2E24'], [1, '#1E120E']]} />
        <Lin id="re-machine" x2={1} y2={0} stops={[[0, '#5A5458'], [0.5, '#8A8288'], [1, '#3E383C']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con pannelli fonoassorbenti (zona calma per il titolo) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1600" fill="url(#re-wall)" />
          {PANELS.map((p, i) => (
            <rect key={i} x={p.x} y={p.y} width="200" height="170" rx="10" fill={p.c > 0.5 ? '#2E1A24' : '#28161E'} opacity=".7" />
          ))}
        </g>

        {/* PIANO 1 — lo studio oltre il vetro con i tre microfoni */}
        <g transform={L(0.4)}>
          <rect x="40" y="640" width="640" height="380" fill="url(#re-studio)" />
          <path d="M40 960 H680 V1020 H40 Z" fill="#3A2826" />
          <g stroke="#3A2832" strokeWidth="4" opacity=".6">
            {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${60 + i * 72} 640 V960`} />)}
          </g>
          {[180, 360, 540].map((x, i) => (
            <g key={i}>
              <Glow id={`re-mic${i}`} x={x} y={760} r={150} t={t} color="#FFD98A" amp={0.08} rate={2.5} ph={i} opacity={0.15 + 0.5 * mics[i]} />
              <path d={`M${x} 980 V790 M${x - 40} 980 H${x + 40}`} stroke={K} strokeWidth="8" strokeLinecap="round" />
              <rect x={x - 22} y="730" width="44" height="70" rx="20" fill={mics[i] > 0.5 ? '#D8C8B8' : '#8A7A70'} stroke={K} strokeWidth="6" />
              <path d={`M${x - 14} 748 H${x + 14} M${x - 14} 762 H${x + 14} M${x - 14} 776 H${x + 14}`} stroke={K} strokeWidth="3" />
              {/* cuffia sull'asta */}
              <path d={`M${x - 30} 860 q30 -40 60 0`} fill="none" stroke={K} strokeWidth="6" />
              <circle cx={x - 30} cy={866} r="10" fill="#3A2A2E" stroke={K} strokeWidth="4" />
              <circle cx={x + 30} cy={866} r="10" fill="#3A2A2E" stroke={K} strokeWidth="4" />
            </g>
          ))}
        </g>

        {/* PIANO 2 — vetro della regia, lampada REC, registratore a bobine */}
        <g transform={L(0.6)}>
          <rect x="30" y="630" width="660" height="400" fill="url(#re-glass)" stroke={K} strokeWidth="14" />
          <path d="M80 660 L200 1000 M150 660 L270 1000" stroke="#FFFFFF" strokeWidth="10" opacity=".05" />
          {/* lampada ON AIR / REC */}
          <g transform="translate(600 680)">
            <Glow id="re-rec" x={0} y={0} r={110} t={t} color="#FF4A4A" amp={0.2} rate={4} opacity={mics[0] * 0.6} />
            <rect x="-56" y="-22" width="112" height="44" rx="8" fill={mics[0] > 0.5 ? '#E0303A' : '#4A1A1E'} stroke={K} strokeWidth="6" />
            <text x="0" y="12" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="30" fill={mics[0] > 0.5 ? '#FFE8E0' : '#8A5A5A'}>REC</text>
          </g>
          {/* registratore a bobine */}
          <rect x="730" y="640" width="320" height="560" rx="14" fill="url(#re-machine)" stroke={K} strokeWidth="9" />
          <path d="M744 652 H1036" stroke="#D8D0D4" strokeWidth="3" opacity=".5" />
          <Reel x={830} y={760} rad={86} rot={spin} />
          <Reel x={950} y={960} rad={86} rot={spin * 1.1} />
          {/* nastro: a fine scena diventa trasparente e si vede attraverso */}
          <path d="M752 780 L760 1080 H1020 L1032 980" fill="none" stroke="#6A3A22" strokeWidth="10" opacity={lerp(1, 0.25, clear)} />
          <path d="M752 780 L760 1080 H1020 L1032 980" fill="none" stroke="#FFF3CF" strokeWidth="3" opacity={clear * 0.9} />
          <Glow id="re-tape" x={890} y={1080} r={170} t={t} color={GOLD} amp={0.1} rate={3} opacity={clear * 0.55} />
          <rect x="840" y="1060" width="100" height="40" rx="6" fill="#2A2228" stroke={K} strokeWidth="5" />
          {/* contatore delle voci */}
          <g transform="translate(796 905)">
            <Glow id="re-cnt" x={0} y={0} r={140} t={t} color={GOLD} amp={0.1} rate={3} opacity={0.15 + 0.5 * hit} />
            <rect x="-66" y="-28" width="132" height="56" rx="8" fill="#140A10" stroke={K} strokeWidth="6" />
            <text x="0" y="14" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="40" fill={GOLD} style={{ fontVariantNumeric: 'tabular-nums' }}
              transform={`scale(${1 + hit * 0.12 * (1 - seg(t, c3 + 0.7, c3 + 1.2))})`}>{String(count).padStart(3, '0')}</text>
          </g>
        </g>

        {/* PIANO 3 — mixer con cursori, manopole, lancette */}
        <g transform={L(0.85)}>
          <path d="M-200 1250 L-140 1120 H1220 L1280 1250 V1700 H-200 Z" fill="url(#re-desk)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
          <path d="M-136 1128 H1216" stroke="#B88A6A" strokeWidth="4" opacity=".5" />
          {/* lancette VU */}
          {[0, 1, 2, 3].map((i) => {
            const x = 180 + i * 240;
            const a = -40 + 80 * Math.min(1, lerp(0.1, 0.5, level) + 0.35 * level * Math.abs(Math.sin(t * (5 + i) + i)));
            return (
              <g key={i} transform={`translate(${x} 1190)`}>
                <Glow id={`re-vu${i}`} x={0} y={0} r={90} t={t} color="#FFE7A0" amp={0.05} rate={2} ph={i} opacity={0.3 + 0.3 * level} />
                <rect x="-74" y="-50" width="148" height="80" rx="8" fill="#F2E2B8" stroke={K} strokeWidth="6" />
                <path d="M-50 10 A60 60 0 0 1 50 10" fill="none" stroke="#6A5A4A" strokeWidth="3" />
                <path d="M30 -14 A60 60 0 0 1 50 10" fill="none" stroke="#C8303A" strokeWidth="5" />
                <path d="M0 26 V-36" stroke={K} strokeWidth="4" strokeLinecap="round" transform={`rotate(${a} 0 26)`} />
              </g>
            );
          })}
          {/* manopole */}
          {Array.from({ length: 32 }, (_, i) => (
            <circle key={i} cx={70 + (i % 16) * 60} cy={1270 + Math.floor(i / 16) * 44} r="13" fill={i % 5 === 0 ? '#C8303A' : '#D8D0C8'} stroke={K} strokeWidth="4" />
          ))}
          {/* cursori */}
          {FADERS.map((f, i) => {
            const p = lerp(f.lo, f.hi, level) + 0.04 * level * Math.sin(t * 2 + f.ph);
            const y = 1500 - p * 120;
            return (
              <g key={i}>
                <path d={`M${f.x} 1380 V1510`} stroke="#0A0608" strokeWidth="8" strokeLinecap="round" />
                <rect x={f.x - 18} y={y - 12} width="36" height="24" rx="4" fill={i === 7 || i === 8 ? GOLD : '#E8E0D8'} stroke={K} strokeWidth="4" />
              </g>
            );
          })}
        </g>

        {/* PIANO 4 — cuffie appese e cavi in primo piano */}
        <g transform={L(1.25)}>
          <path d="M-200 1640 H1280 V2200 H-200 Z" fill="#140A0E" />
          <path d="M-200 1640 H1280" stroke="#6A4A3A" strokeWidth="8" />
          <path d={`M60 -200 V1540`} stroke={K} strokeWidth="8" />
          <g transform={`translate(60 1580) rotate(${Math.sin(t * 0.9) * 4})`}>
            <path d="M-80 0 Q0 -140 80 0" fill="none" stroke={K} strokeWidth="18" />
            <path d="M-80 0 Q0 -140 80 0" fill="none" stroke="#5A3A3A" strokeWidth="8" />
            <rect x="-110" y="-10" width="56" height="90" rx="22" fill="#2A1A20" stroke={K} strokeWidth="8" />
            <rect x="54" y="-10" width="56" height="90" rx="22" fill="#2A1A20" stroke={K} strokeWidth="8" />
          </g>
          <path d={`M880 1660 C900 1800 1040 1760 1060 1900 S1180 2000 1300 1980`} stroke={K} strokeWidth="14" fill="none" />
          <path d={`M880 1660 C900 1800 1040 1760 1060 1900 S1180 2000 1300 1980`} stroke="#3A2A2E" strokeWidth="6" fill="none" />
          <path d="M-200 1820 C100 1760 300 1900 600 1840" stroke={K} strokeWidth="14" fill="none" />
        </g>

        {/* PIANO 5 — pulviscolo nella luce della regia */}
        <g transform={L(1.7)}>
          <Dust t={t} top={{ y: 560, x0: 300, x1: 500 }} bottom={{ y: 1200, x0: 150, x1: 700 }} n={20} color="#FFE8C8" boost={-0.3} />
          <NearMotes id="re-near" t={t} color="#FFE2C0" opacity={0.08} />
          {Array.from({ length: 6 }, (_, i) => {
            const p = mod(t * 0.3 + i / 6, 1);
            return <circle key={i} cx={890 + Math.sin(i * 2 + t) * 60} cy={1080 - p * 120} r={3} fill="#FFF3CF" opacity={clear * (1 - p)} />;
          })}
        </g>
      </g>

      <Finish id="re" tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};
