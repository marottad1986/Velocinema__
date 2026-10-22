import React from 'react';
import { camera, eio, eo, eob, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Clouds, Glow, Lightning, NearMotes, Rain, WaveBand, WaveLines, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// L'aereo precipita: notte di tempesta sull'oceano, l'aereo cargo con le luci di posizione scende tra le nuvole
// squarciate dai fulmini e tocca il mare; un gommone arancione si gonfia tra la schiuma.
// Piani: cielo e lampi (0,2) · nubi (0,4) · aereo (0,55) · mare lontano (0,6) · onde (0,8–1,0) · gommone (0,9) · cresta (1,25) · pioggia vicina (1,6)

const r = rng(909);
const SPLASH = Array.from({ length: 22 }, () => ({ vx: (r() - 0.5) * 520, vy: 300 + r() * 420, rr: 6 + r() * 10 }));

export const Schianto: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const IMPACT = cues[2] + 0.9; // «e precipita in mare»
  const flash = flashAt(t, [cues[1] + 0.4, IMPACT - 0.05]);
  // traiettoria: vola inclinato, poi scende sempre più ripido fino al mare
  const fall = eio(seg(t, cues[1], IMPACT));
  const px = 920 - 520 * seg(t, 0, IMPACT) - 80 * fall;
  const py = 700 + 380 * fall * fall;
  const tilt = -6 - 22 * fall + Math.sin(t * 7) * 2 * fall;
  const gone = seg(t, IMPACT, IMPACT + 0.15);
  const splash = seg(t, IMPACT, IMPACT + 1.4);
  const raft = eob(seg(t, cues[3], cues[3] + 0.9), 1.6); // il gommone si gonfia: si salva
  const sw = Math.sin(t * 2.2) * 14;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sc" />
        <Lin id="sc-sky" stops={[[0, '#04080F'], [0.3, '#0B1726'], [0.52, '#17293D'], [0.62, '#1F3650']]} />
        <Lin id="sc-sea" stops={[[0, '#21445F'], [1, '#0B1B2A']]} />
        <Lin id="sc-front" stops={[[0, '#1B3B55'], [0.5, '#0E2236'], [1, '#06111C']]} />
        <radialGradient id="sc-fire">
          <stop offset="0" stopColor="#FFE08A" stopOpacity=".95" />
          <stop offset=".4" stopColor="#FF8A2C" stopOpacity=".6" />
          <stop offset="1" stopColor="#FF5A1F" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo e lampi */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#sc-sky)" />
          <rect x="-200" y="-200" width="1480" height="2400" fill="#CFE2F0" opacity={flash * 0.35} />
          <Lightning x={260} y={540} h={480} flash={flash} seed={4} width={8} />
        </g>

        {/* PIANO 1 — nubi di tempesta in due strati */}
        <g transform={L(0.4)}>
          <Clouds id="sc-cl" t={t} color="#1D3149" seed={21} n={4} y={600} h={160} speed={0.7} opacity={0.85} />
          <Clouds id="sc-cl2" t={t + 4} color="#0A1522" seed={8} n={3} y={-20} h={160} speed={0.5} opacity={0.95} />
        </g>
        <g transform={L(0.5)}><Rain t={t} level="far" seed={5} color="#7FA0BC" opacity={0.4} angle={24} /></g>

        {/* PIANO 2 — l'aereo cargo che precipita, con le luci di posizione */}
        <g transform={L(0.55)} opacity={1 - gone}>
          <g transform={`translate(${px} ${py}) rotate(${tilt}) scale(.8)`}>
            <path d="M-260 -10 Q-280 -40 -230 -46 H200 Q260 -44 280 -20 Q260 0 200 4 H-230 Z" fill="#A9B6C3" stroke={K} strokeWidth="7" />
            <path d="M-40 -14 L-150 70 H-100 L40 -10 Z" fill="#8E9DAB" stroke={K} strokeWidth="6" />
            <path d="M-200 -44 L-250 -120 H-210 L-150 -44 Z" fill="#8E9DAB" stroke={K} strokeWidth="6" />
            {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-150 + i * 40} y="-36" width="16" height="12" rx="3" fill="#FFE2A0" opacity={mod(t * 6 + i, 3) < 2.4 ? 1 : 0.2} />)}
            <circle cx="-240" cy="-118" r="8" fill="#FF5A4A" opacity={mod(t, 0.8) < 0.3 ? 1 : 0.2} />
            <circle cx="-150" cy="68" r="7" fill="#7CFF8A" />
            {/* motore in fiamme quando comincia la caduta */}
            <ellipse cx="-80" cy="34" rx={70 * fall} ry={40 * fall} fill="url(#sc-fire)" />
          </g>
          {fall > 0.05 && Array.from({ length: 8 }, (_, i) => {
            const p = mod(t * 1.2 + i / 8, 1);
            return <circle key={i} cx={px - 60 + p * 260} cy={py + 20 - p * 160} r={20 + p * 50} fill="#24323F" opacity={(1 - p) * 0.55 * fall} />;
          })}
          <Glow id="sc-plane" x={px} y={py} r={160} t={t} color="#FF9A4A" amp={0.2} rate={8} opacity={0.4 * fall} />
        </g>

        {/* PIANO 3 — mare lontano */}
        <g transform={L(0.6, 0, sw * 0.4)}>
          <WaveBand t={t} y={1080} fill="#18324A" foam="#8FB2CC" amp={44} w={220} speed={80} bob={8} foamWidth={4} foamOpacity={0.5} />
        </g>

        {/* PIANO 4 — impatto: colonna d'acqua e bagliore */}
        <g transform={L(0.7)}>
          {splash > 0 && splash < 1 && (
            <g>
              <Glow id="sc-boom" x={px} y={1100} r={320} t={t} color="#FFB060" amp={0} opacity={0.7 * (1 - splash)} />
              {SPLASH.map((s, i) => (
                <circle key={i} cx={px + s.vx * splash} cy={1100 - s.vy * splash + 700 * splash * splash} r={s.rr * (1 - splash * 0.5)} fill="#E6F2FA" opacity={1 - splash} />
              ))}
              <path d={`M${px - 140 * eo(splash)} 1110 Q${px} ${1100 - 320 * Math.sin(splash * Math.PI)} ${px + 140 * eo(splash)} 1110 Z`} fill="#CFE3F0" opacity={0.8 * (1 - splash)} />
            </g>
          )}
        </g>

        {/* PIANO 5 — onda media */}
        <g transform={L(0.8, 0, sw * 0.7)}>
          <WaveBand t={t} y={1180} fill="url(#sc-sea)" foam="#CFE3F0" amp={86} w={340} speed={120} bob={14} ph={1} foamWidth={7} foamOpacity={0.7} />
        </g>

        {/* PIANO 6 — il gommone arancione che si gonfia (accento) */}
        <g transform={L(0.9, 0, sw * 0.8)}>
          {raft > 0 && (
            <g transform={`translate(${560 + Math.sin(t * 0.9) * 20} ${1170 + Math.sin(t * 2) * 18}) rotate(${Math.sin(t * 1.7) * 9}) scale(${raft})`}>
              <Glow id="sc-raftg" x={0} y={-20} r={220} t={t} color="#FFB07A" amp={0.08} rate={2} opacity={0.3} />
              <ellipse cx="0" cy="0" rx="190" ry="64" fill={P.accento} stroke={K} strokeWidth="9" />
              <ellipse cx="0" cy="-8" rx="130" ry="34" fill="#9E3B1F" stroke={K} strokeWidth="5" />
              <path d="M-150 -10 Q-150 -70 -40 -78 L60 -76 Q150 -70 150 -10" fill="#D9542F" stroke={K} strokeWidth="7" opacity=".9" />
              <path d="M-160 -30 Q-90 -56 -10 -60" fill="none" stroke="#FFC9A8" strokeWidth="7" strokeLinecap="round" opacity=".8" />
              {[-140, -70, 0, 70, 140].map((x) => <circle key={x} cx={x} cy="40" r="6" fill="#F4EFE2" stroke={K} strokeWidth="3" />)}
            </g>
          )}
        </g>

        {/* PIANO 7 — onda vicina e cresta in primo piano */}
        <g transform={L(1.0, 0, sw)}>
          <WaveBand t={t} y={1360} fill="url(#sc-sea)" foam="#E6F2FA" amp={110} w={420} speed={150} bob={18} ph={2} foamWidth={9} foamOpacity={0.8} />
          <WaveLines t={t} ys={[1440, 1540]} color="#5E88A8" amp={14} w={300} speed={120} width={5} opacity={0.45} />
        </g>
        <g transform={L(1.25, 0, sw * 1.3)}>
          <WaveBand t={t} y={1680} fill="url(#sc-front)" foam="#F4FBFF" amp={170} w={620} speed={190} bob={26} ph={3} foamWidth={12} foamOpacity={0.85} />
          {/* rottame galleggiante: una cassa del carico */}
          <g transform={`translate(${860 + Math.sin(t * 1.1) * 30} ${1700 + Math.sin(t * 2.2 + 1) * 30}) rotate(${-12 + Math.sin(t * 1.4) * 8})`}>
            <rect x="-80" y="-50" width="160" height="100" fill="#A87B4A" stroke={K} strokeWidth="8" />
            <path d="M-80 -10 H80" stroke="#E9D6B0" strokeWidth="12" />
          </g>
        </g>

        {/* PIANO 8 — pioggia vicina e spruzzi */}
        <g transform={L(1.6)}><Rain t={t} level="near" seed={17} color="#C8DCEA" opacity={0.5} angle={46} /></g>
        <g transform={L(1.8)}><NearMotes id="sc-near" t={t} color="#DCEBF5" n={8} vx={-90} vy={20} opacity={0.14} /></g>
      </g>
      <rect width="1080" height="1920" fill="#E4F2FA" opacity={flash * 0.1} />
      <Finish id="sc" tint="#0E2A3A" tintOpacity={0.13} />
    </svg>
  );
};
