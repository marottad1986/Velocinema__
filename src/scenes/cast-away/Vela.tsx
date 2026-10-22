import React from 'react';
import { camera, eio, eo, eob, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Clouds, Glow, Gulls, NearMotes, Reflection, WaveBand, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Palm, Raft } from './Comuni';

// La vela: spiaggia al mattino, un grande pannello di plastica portato dalla marea; poco lontano una zattera di tronchi
// legati con corde e una vela fatta col pannello; bandierina che indica il vento; la barriera di onde all'orizzonte.
// Piani: cielo (0,2) · mare e barriera (0,45) · battigia (0,7) · zattera e pannello (0,85) · bandierina e palme (1,2) · spruzzi (1,7)

const r = rng(8080);
const SPRAY = Array.from({ length: 16 }, () => ({ vx: (r() - 0.5) * 300, vy: 160 + r() * 200, rr: 5 + r() * 7, ph: r() }));

export const Vela: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const arrive = eo(seg(t, 0, cues[1])); // il pannello arriva con la marea
  const build = eob(seg(t, cues[2], cues[2] + 0.7), 1.6); // la zattera è pronta
  const sail = eio(seg(t, cues[2] + 0.5, cues[2] + 1.6)); // il pannello diventa vela
  const wind = eio(seg(t, cues[3] + 0.3, cues[3] + 1.2)); // il vento gira: ora soffia verso il mare
  const go = eio(seg(t, cues[4], dur)); // parte, oltre le onde
  const rx = 560 + 120 * go, ry = 1190 - 190 * go, rs = 1 - 0.45 * go;
  const crash = go > 0.55 ? seg(go, 0.55, 0.9) : 0;
  const wash = mod(t * 0.3, 1);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ve" />
        <Lin id="ve-sky" stops={[[0, '#5AAEDC'], [0.35, '#9AD6EC'], [0.55, '#E2F2EE'], [0.6, '#FFF4DC']]} />
        <Lin id="ve-sea" stops={[[0, '#2F95A6'], [0.6, '#56BDB8'], [1, '#9FE2D6']]} />
        <Lin id="ve-sand" stops={[[0, '#F7EACB'], [0.6, '#EED8A8'], [1, '#D9BC88']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo del mattino */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#ve-sky)" />
          <Glow id="ve-sun" x={180} y={640} r={320} t={t} color="#FFF4D8" amp={0.04} rate={1} opacity={0.7} />
          <circle cx="180" cy="640" r="60" fill="#FFF8E6" />
          <Clouds id="ve-cl" t={t} color="#FFFFFF" seed={44} n={3} y={720} h={160} speed={0.6 + 0.6 * wind} opacity={0.85} />
        </g>

        {/* PIANO 1 — mare e barriera di onde */}
        <g transform={L(0.45)}>
          <rect x="-200" y="980" width="1480" height="300" fill="url(#ve-sea)" />
          <Reflection t={t} x={180 - cam.pan * 0.2} y={990} color="#FFF8E6" n={6} w={90} opacity={0.45} />
          <WaveBand t={t} y={1004} fill="#EAF7F4" amp={16} w={150} speed={70} bob={5} foam="#FFFFFF" foamWidth={4} foamOpacity={0.9} />
          <WaveLines t={t} ys={[1050, 1090]} color="#E2F6F2" amp={6} w={200} speed={24} opacity={0.6} />
        </g>
        <g transform={L(0.55)}><Gulls t={t} y={800} h={160} color={K} n={3} /></g>

        {/* PIANO 2 — battigia */}
        <g transform={L(0.7)}>
          <path d="M-200 1100 Q400 1080 1280 1110 V2200 H-200 Z" fill="url(#ve-sand)" stroke={K} strokeWidth="7" />
          <path d={`M-200 ${1110 + wash * 30} Q400 ${1090 + wash * 30} 1280 ${1120 + wash * 30}`} fill="none" stroke="#FFFFFF" strokeWidth="8" opacity={0.8 * (1 - wash)} />
        </g>

        {/* PIANO 3 — il pannello portato dal mare, poi la zattera con la vela (accento sulle corde) */}
        <g transform={L(0.85)}>
          {sail < 0.98 && (
            <g transform={`translate(${980 - 220 * arrive} ${1060 + 80 * arrive + Math.sin(t * 2) * 6 * (1 - arrive)}) rotate(${-74 + Math.sin(t * 1.5) * 3 * (1 - arrive)})`} opacity={1 - sail}>
              <rect x="-60" y="-150" width="120" height="300" rx="10" fill="#A9C3CF" stroke={K} strokeWidth="8" />
              {[-110, -40, 30, 100].map((y) => <circle key={y} cx="-44" cy={y} r="6" fill={K} />)}
              <path d="M-40 -130 V120" stroke="#DCE8EE" strokeWidth="6" opacity=".8" />
            </g>
          )}
          {build > 0 && (
            <g transform={`translate(${rx} ${ry + Math.sin(t * 2.4) * 8 * go}) scale(${rs * Math.min(1, build)}) rotate(${Math.sin(t * 2.2) * 5 * go})`}>
              <Glow id="ve-raftg" x={0} y={-160} r={260} t={t} color="#FFF4D8" amp={0.05} rate={1.4} opacity={0.3} />
              <Raft t={t} sail={sail} ball />
              <path d="M-180 -4 H180 M-180 20 H180" stroke={P.accento} strokeWidth="4" opacity=".9" />
            </g>
          )}
          {crash > 0 && crash < 1 && SPRAY.map((s, i) => (
            <circle key={i} cx={rx + s.vx * crash} cy={ry - s.vy * crash + 300 * crash * crash} r={s.rr} fill="#FFFFFF" opacity={1 - crash} />
          ))}
        </g>

        {/* PIANO 4 — bandierina del vento, attrezzi e palme che incorniciano */}
        <g transform={L(1.2)}>
          <Palm x={-80} y={1700} h={880} lean={220} t={t} ph={0.3} />
          <Palm x={1180} y={1600} h={700} lean={-200} t={t} ph={1.8} />
          <g transform="translate(250 1190)">
            <path d="M0 0 V-300" stroke={K} strokeWidth="12" strokeLinecap="round" />
            <path d="M0 0 V-300" stroke="#9B7A50" strokeWidth="6" strokeLinecap="round" />
            {/* la bandierina sventola verso terra, poi verso il mare */}
            <g transform={`translate(0 -290) scale(${1 - 2 * wind} 1)`}>
              <path d={`M0 0 Q${50} ${-14 + Math.sin(t * 8) * 6} ${110} ${Math.sin(t * 8 + 1) * 8} Q${50} ${40 + Math.sin(t * 8) * 6} 0 46 Z`} fill="#F4EFE2" stroke={K} strokeWidth="5" />
            </g>
          </g>
          <path d="M60 1360 l160 -20 M90 1330 l40 40 M140 1326 l40 40" stroke="#E6D3A8" strokeWidth="8" strokeLinecap="round" />
          <path d="M760 1400 q60 -40 140 -10 q60 20 140 -20" fill="none" stroke="#3E6B4A" strokeWidth="12" strokeLinecap="round" />
          {/* tronchi avanzati e matassa di corda in primo piano */}
          {[[420, 1640, -8], [520, 1700, 4], [460, 1760, -2]].map(([x, y, a], i) => (
            <g key={i} transform={`rotate(${a} ${x} ${y})`}>
              <rect x={x - 170} y={y - 26} width="340" height="52" rx="24" fill={i % 2 ? '#8B6A43' : '#9B7A50'} stroke={K} strokeWidth="7" />
              <ellipse cx={x + 160} cy={y} rx="14" ry="22" fill="#C9A878" stroke={K} strokeWidth="4" />
            </g>
          ))}
          <g fill="none" stroke="#E6D3A8" strokeWidth="9">
            {[60, 46, 32].map((rr) => <ellipse key={rr} cx="880" cy="1720" rx={rr * 1.6} ry={rr * 0.7} />)}
          </g>
        </g>
        <g transform={L(1.7)}><NearMotes id="ve-near" t={t} color="#FFFFFF" n={5} y0={1300} vx={-60 - 60 * wind} opacity={0.1} /></g>
      </g>
      <Finish id="ve" tint="#F2B85A" tintOpacity={0.1} />
    </svg>
  );
};
