import React from 'react';
import { camera, eo, lerp, seg } from '../../lib/anim';
import { Buio, Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { ConjDefs, GOLD, K, Ombra, TINT_NOTTE } from './Comuni';

// L'esorcismo: la cantina della fattoria, a lume di candela. Al centro una sedia di legno vuota con le corde allentate;
// a terra il crocifisso, la boccetta dell'acqua santa e il libro aperto sulla cassa. Su «così Ed Warren esorcizza Carolyn da solo» un
// fumo nero si avvita sopra la sedia, sempre più forte, e le candele si piegano; su «la richiama con un bel ricordo di
// famiglia» la cornice con la fotografia di una spiaggia al sole si accende di luce calda; su «Carolyn torna in sé e la
// strega viene scacciata» la luce dell'alba entra dalla grata in alto, il fumo viene risucchiato verso l'alto e si
// dissolve, e il buio si apre su tutta la cantina. Nessuna persona: la madre è la sedia vuota, la strega è il fumo.
// Piani: muro di pietra e grata (0,3) · sedia, cassa, candele (0,65) · fumo (0,8) · oggetti a terra e scala (1,15) · polvere nella luce (1,6)

export const Esorcismo: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tFight = griglia(cues[0] + 0.6);
  const fight = eo(seg(t, tFight, tFight + 2.8));
  const tMem = griglia(cues[1] + 0.9);
  const mem = eo(seg(t, tMem, tMem + 1.0));
  const tDawn = griglia(cues[2] + 1.6);
  const dawn = eo(seg(t, tDawn, tDawn + 1.4));
  const smoke = fight * (1 - eo(seg(t, tDawn, tDawn + 1.8)));
  const suck = seg(t, tDawn, tDawn + 1.8);
  const bend = 14 * fight * (1 - dawn) * Math.sin(t * 3);
  const shake = fight * (1 - dawn) * Math.sin(t * 31) * 2;
  const candles = [[250, 1140], [330, 1170], [700, 1170]];

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="es" />
        <ConjDefs id="es" />
        <Lin id="es-wall" stops={[[0, '#3A3832'], [0.5, '#4E4A40'], [1, '#2A2824']]} x2={1} y2={0} />
        <Lin id="es-floor" stops={[[0, '#3A3228'], [1, '#14100C']]} />
        <Lin id="es-beam" stops={[[0, '#FFE8B0', 0.75], [1, '#FFE8B0', 0]]} />
        <radialGradient id="es-smoke"><stop offset="0" stopColor="#050505" stopOpacity=".95" /><stop offset=".6" stopColor="#0A0A0E" stopOpacity=".6" /><stop offset="1" stopColor="#0A0A0E" stopOpacity="0" /></radialGradient>
        <Lin id="es-sea" stops={[[0, '#7FC8F0'], [0.45, '#BFE6F8'], [0.5, '#2A8AC8'], [0.75, '#4AA8D8'], [0.76, '#F2D8A0'], [1, '#E8C080']]} />
        <pattern id="es-stone" width="200" height="120" patternUnits="userSpaceOnUse">
          <path d="M0 0 H200 M0 60 H200 M100 0 V60 M0 60 V120 M200 60 V120 M60 60 V120 M160 0 V60" stroke="#1E1C18" strokeWidth="6" />
          <path d="M8 8 H90 M108 68 H150" stroke="#8A8270" strokeWidth="3" opacity=".35" />
        </pattern>
      </defs>
      <g transform={`${cam.transform} translate(${shake} 0)`}>
        <g transform={L(0.3)}>
          <rect x="-300" y="-200" width="1700" height="1500" fill="url(#es-wall)" />
          <rect x="-300" y="-200" width="1700" height="1500" fill="url(#es-stone)" />
          {/* la grata in alto da cui entra l'alba */}
          <rect x="640" y="640" width="240" height="120" fill={dawn > 0 ? '#FFE8B0' : '#141820'} />
          {dawn > 0 && <rect x="640" y="640" width="240" height="120" fill="#FFFFFF" opacity={0.5 * dawn} />}
          {[680, 720, 760, 800, 840].map((x) => <path key={x} d={`M${x} 640 V760`} stroke={K} strokeWidth="10" />)}
          <rect x="630" y="630" width="260" height="140" fill="none" stroke={K} strokeWidth="10" />
          <path d="M-300 1200 H1400" stroke="#1E1A14" strokeWidth="24" />
        </g>
        {/* il fascio dell'alba */}
        {dawn > 0 && (
          <g transform={L(0.45)} opacity={dawn}>
            <path d="M640 760 L880 760 L760 1300 L300 1300 Z" fill="url(#es-beam)" opacity=".55" />
            <Glow id="es-dawn" x={760} y={700} r={420} t={t} color="#FFE8B0" amp={0.04} rate={1} opacity={0.6} />
          </g>
        )}
        {/* la sedia vuota con le corde, la cassa con il libro e la foto, le candele */}
        <g transform={L(0.65)}>
          <path d="M-300 1200 H1400 V1500 H-300 Z" fill="url(#es-floor)" />
          <g transform="translate(540 1230)">
            <Ombra id="es" x={0} y={0} rx={170} ry={18} />
            <path d="M-90 -230 V0 M90 -230 V0 M-80 -40 V0 M80 -40 V0" stroke="url(#es-wood)" strokeWidth="18" />
            <path d="M-90 -230 V0 M90 -230 V0" stroke={K} strokeWidth="4" opacity=".4" />
            <path d="M-100 -230 H100 V-196 H-100 Z" fill="url(#es-wood)" stroke={K} strokeWidth="6" />
            <path d="M-90 -480 V-230 M90 -480 V-230" stroke="url(#es-wood)" strokeWidth="18" />
            <path d="M-96 -480 H96 V-446 H-96 Z M-90 -380 H90 V-360 H-90 Z" fill="url(#es-wood)" stroke={K} strokeWidth="6" />
            {/* le corde allentate che pendono */}
            <path d="M-90 -300 Q-40 -270 0 -300 Q40 -330 90 -300" stroke="#C8B080" strokeWidth="8" fill="none" />
            <path d="M-90 -300 Q-110 -200 -96 -120 M90 -300 Q130 -220 120 -150 M-80 -60 Q-120 -30 -140 0" stroke="#C8B080" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M-90 -300 Q-40 -270 0 -300" stroke={K} strokeWidth="2" fill="none" opacity=".5" />
          </g>
          {/* la cassa con il libro aperto e la cornice con la spiaggia */}
          <g transform="translate(860 1250)">
            <Ombra id="es" x={0} y={0} rx={160} ry={16} />
            <rect x="-140" y="-150" width="280" height="150" fill="url(#es-oldwood)" stroke={K} strokeWidth="7" />
            <path d="M-140 -100 H140 M-140 -50 H140" stroke={K} strokeWidth="4" opacity=".5" />
            <g transform="translate(-50 -150)">
              <path d="M-70 0 L-60 -20 Q-30 -30 0 -18 Q30 -30 60 -20 L70 0 Z" fill="#F2EAD4" stroke={K} strokeWidth="5" />
              <path d="M0 -18 V0" stroke={K} strokeWidth="4" />
              {[-50, -40, -30, 20, 30, 40].map((x) => <path key={x} d={`M${x} -12 H${x + 6}`} stroke="#6A5A4A" strokeWidth="3" />)}
            </g>
          </g>
          {/* la fotografia della spiaggia: il ricordo felice della famiglia */}
          <g transform={`translate(860 1040) rotate(4) scale(${1 + 0.06 * mem})`}>
            {mem > 0 && <Glow id="es-mem" x={0} y={0} r={300} t={t} color={GOLD} amp={0.06} rate={2} opacity={0.75 * mem} />}
            <rect x="-110" y="-90" width="220" height="180" fill="url(#es-brass)" stroke={K} strokeWidth="7" />
            <rect x="-90" y="-70" width="180" height="140" fill="url(#es-sea)" />
            <circle cx="50" cy="-40" r="16" fill="#FFF0A0" />
            <path d="M-60 70 L-50 10 M-50 10 Q-90 6 -96 20 Q-50 -4 -4 20 Q-10 6 -50 10" stroke="#C8302A" strokeWidth="5" fill="#E85A4A" />
            <path d="M20 46 Q30 36 40 46 Q50 36 60 46" stroke="#FFFFFF" strokeWidth="3" fill="none" />
            <rect x="-90" y="-70" width="180" height="140" fill="url(#es-glass)" />
            <rect x="-90" y="-70" width="180" height="140" fill="#1A140E" opacity={0.55 * (1 - mem)} />
          </g>
          {/* candele */}
          {candles.map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <rect x="-14" y="-90" width="28" height="90" fill="#F2EAD4" stroke={K} strokeWidth="4" />
              <g transform={`translate(0 -92) rotate(${bend + i * 3})`}>
                <path d={`M-9 0 Q-9 -24 ${Math.sin(t * 8 + i) * 2} ${-40 - 6 * Math.sin(t * 13 + i) - 10 * dawn} Q9 -24 9 0 Q0 5 -9 0 Z`} fill="url(#es-flame)" />
              </g>
              <Glow id={`es-c${i}`} x={0} y={-110} r={130} t={t} color={GOLD} amp={0.1} rate={9} ph={i} opacity={0.5} />
            </g>
          ))}
        </g>
        {/* il fumo nero che si avvita sopra la sedia e poi viene risucchiato verso la grata */}
        {smoke > 0 && (
          <g transform={L(0.8)} opacity={smoke}>
            <Glow id="es-evil" x={lerp(540, 760, suck)} y={lerp(900, 700, suck)} r={340} t={t} color="#8A2A3A" amp={0.12} rate={4} opacity={0.6} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = t * 2.2 + i * 0.52;
              const rad = 90 + i * 9;
              const cx = lerp(540 + Math.cos(a) * rad, 760, suck * (0.5 + i * 0.04));
              const cy = lerp(940 - i * 14 + Math.sin(a) * 40, 700, suck * (0.5 + i * 0.04));
              return <circle key={i} cx={cx} cy={cy} r={70 + (i % 4) * 20} fill="url(#es-smoke)" />;
            })}
          </g>
        )}
        {/* primo piano: il crocifisso e la boccetta d'acqua santa a terra, la scala di legno */}
        <g transform={L(1.15)}>
          <path d="M-300 1290 H1400 V2200 H-300 Z" fill="#100C08" />
          <path d="M-300 1290 H1400" stroke="#3A3228" strokeWidth="10" />
          <path d="M-60 300 L200 1900 M80 260 L340 1900" stroke="url(#es-wood)" strokeWidth="26" />
          {[500, 700, 900, 1100, 1300, 1500, 1700].map((y) => {
            const k = (y - 300) / 1600;
            return <path key={y} d={`M${-60 + 260 * k} ${y} H${80 + 260 * k}`} stroke="url(#es-wood)" strokeWidth="20" />;
          })}
          <g transform="translate(640 1300) rotate(-24)">
            <path d="M-10 -70 H10 V-26 H46 V-6 H10 V70 H-10 V-6 H-46 V-26 H-10 Z" fill={dawn > 0.5 ? GOLD : '#8A6A3A'} stroke={K} strokeWidth="5" />
          </g>
          <g transform="translate(420 1310) rotate(70)">
            <path d="M-20 0 Q-26 -50 -12 -60 V-80 H12 V-60 Q26 -50 20 0 Z" fill="#A8C8E0" stroke={K} strokeWidth="5" opacity=".9" />
            <rect x="-14" y="-96" width="28" height="18" fill="#5A3A1A" stroke={K} strokeWidth="4" />
          </g>
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 780, x0: 660, x1: 860 }} bottom={{ y: 1300, x0: 300, x1: 780 }} seed={11} n={28} color="#FFF0C8" boost={0.6 * dawn} />
        </g>
        <Buio id="es-b" t={t} darkness={lerp(0.86, 0.25, dawn)} flicker={0.15 * (1 - dawn)} tint="#FFC870" tintOpacity={0.08}
          lights={[
            ...candles.map(([x, y]) => ({ x, y: y - 100, r: 300, power: 0.85 })),
            { x: 540, y: 1000, r: 420, power: 0.7 },
            { x: 860, y: 1040, r: 340 * mem, power: mem },
          ]} />
        <g transform={L(1.6)}>
          <NearMotes id="es-near" t={t} color="#FFE8C0" n={5} y0={1100} opacity={0.06} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#C8925A" opacity={0.09 * dawn} />
      <Finish id="es" tint={TINT_NOTTE} tintOpacity={0.1 * (1 - dawn)} />
    </svg>
  );
};
