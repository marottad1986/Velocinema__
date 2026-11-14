import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { GIALLO, HeartLine, K, heartPath } from './Comuni';

// Il film della sua rinascita: una sala cinematografica inventata, al buio. Dall'alto della sala vediamo lo schermo,
// le file di poltrone rosse, il fascio del proiettore con il pulviscolo. f1 «…un documentario, In un battito»: sullo
// schermo una linea gialla di battito corre da sinistra e diventa la linea di metà campo di un prato all'alba, e compare
// il titolo «IN UN BATTITO». f2 «…lontano dal campo»: la camera resta sulla sala. f3 «…arriva nelle sale il 16, 17 e 18
// novembre»: si accende sulla parete l'insegna luminosa con le date. Niente locandina ufficiale né fotogrammi del film.
// Piani: parete e soffitto (0,2) · schermo (0,35) · insegna (0,45) · poltrone lontane (0,6) · poltrone vicine (1,1) · pulviscolo (1,5)

export const Documentario: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1000);
  const L = cam.layer;
  const tLine = griglia(cues[0] + 0.6);
  const draw = eo(seg(t, tLine, tLine + 2.6));
  const field = eo(seg(t, tLine + 2.4, tLine + 3.6));
  const tTitle = griglia(cues[0] + 3.8);
  const title = eo(seg(t, tTitle, tTitle + 0.6));
  const tSign = griglia(cues[2] + 2.2);
  const sign = seg(t, tSign, tSign + 0.6);
  const flick = sign > 0 && sign < 1 ? (Math.sin(t * 60) > 0 ? 1 : 0.3) : sign;
  const sx0 = 150, sx1 = 930, sy0 = 700, sy1 = 1050; // schermo

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="do" />
        <Lin id="do-wall" stops={[[0, '#08060C'], [0.5, '#16101A'], [1, '#1E1218']]} />
        <Lin id="do-scr" stops={[[0, '#2A3A5A'], [0.55, '#E8A07A'], [0.75, '#F6C890'], [1, '#4A7A3A']]} />
        <linearGradient id="do-seat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B8323A" /><stop offset="1" stopColor="#5A1218" /></linearGradient>
        <linearGradient id="do-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF4D8" stopOpacity="0" /><stop offset=".6" stopColor="#FFF4D8" stopOpacity=".12" /><stop offset="1" stopColor="#FFF4D8" stopOpacity=".28" /></linearGradient>
        <clipPath id="do-clip"><rect x={sx0} y={sy0} width={sx1 - sx0} height={sy1 - sy0} /></clipPath>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — sala buia: parete, tende ai lati, luci di cortesia (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#do-wall)" />
          {[-140, 980].map((x, i) => (
            <g key={i}>
              <rect x={x} y="560" width="240" height="760" fill="#4A0E16" />
              {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M${x + 20 + k * 40} 560 V1320`} stroke="#2A060C" strokeWidth="10" />)}
            </g>
          ))}
          {[[80, 1180], [1000, 1180], [80, 1320], [1000, 1320]].map(([x, y], i) => (
            <g key={i}><Glow id={`do-c${i}`} x={x} y={y} r={60} t={t} color="#FFB870" amp={0.06} rate={2} ph={i} opacity={0.6} /><rect x={x - 8} y={y - 12} width="16" height="24" rx="4" fill="#FFD8A0" stroke={K} strokeWidth="3" /></g>
          ))}
        </g>
        {/* PIANO 1 — lo schermo: linea del battito che diventa il prato all'alba, poi il titolo (0,35) */}
        <g transform={L(0.35)}>
          <Glow id="do-sg" x={540} y={830} r={620} t={t} color="#F6C890" amp={0.03} rate={1.2} opacity={0.25 + 0.3 * field} />
          <rect x={sx0 - 16} y={sy0 - 16} width={sx1 - sx0 + 32} height={sy1 - sy0 + 32} fill="#05040A" stroke={K} strokeWidth="6" />
          <g clipPath="url(#do-clip)">
            <rect x={sx0} y={sy0} width={sx1 - sx0} height={sy1 - sy0} fill="#0A0A12" />
            <g opacity={field}>
              <rect x={sx0} y={sy0} width={sx1 - sx0} height={sy1 - sy0} fill="url(#do-scr)" />
              <Glow id="do-sun" x={540} y={940} r={260} t={t} color="#FFE8B0" amp={0.03} rate={1} opacity={0.8} />
              <path d={`M${sx0} 940 L${sx1} 940 L${sx1} ${sy1} L${sx0} ${sy1} Z`} fill="#4A8A3A" />
              {[970, 1006].map((y) => <rect key={y} x={sx0} y={y} width={sx1 - sx0} height="18" fill="#5A9A4A" opacity=".5" />)}
              <ellipse cx="540" cy="984" rx="160" ry="26" fill="none" stroke="#F4F6EC" strokeWidth="5" opacity=".8" />
            </g>
            <HeartLine d={heartPath(sx0, sx1, lerp(870, 984, field), [380, 700], lerp(120, 0, field), 80)} draw={draw} len={1200} width={8} glow={0.5} />
            <g opacity={title}>
              <text x="540" y="800" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="60" letterSpacing="0.08em" fill="#FFFFFF" stroke={K} strokeWidth="2">IN UN BATTITO</text>
              <text x="540" y="840" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="24" letterSpacing="0.12em" fill="#FFF0D0">UN DOCUMENTARIO DI GIOVANNI TROILO</text>
            </g>
          </g>
        </g>
        {/* PIANO 2 — insegna luminosa sulla parete: le date in sala (0,45) */}
        <g transform={L(0.45)}>
          <g transform={`translate(540 1088) scale(${lerp(0.92, 1, eob(sign, 1.6))})`} opacity={flick}>
            <Glow id="do-sign" x={0} y={0} r={360} t={t} color="#FFD84A" amp={0.04} rate={3} opacity={0.5 * sign} />
            <rect x="-330" y="-46" width="660" height="92" rx="46" fill="#14100C" stroke={GIALLO} strokeWidth="6" />
            <text x="0" y="18" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="44" letterSpacing="0.1em" fill={GIALLO}>16 · 17 · 18 NOVEMBRE</text>
          </g>
        </g>
        {/* PIANO 3 — file di poltrone lontane, vuote, illuminate dallo schermo (0,6) */}
        <g transform={L(0.6)}>
          {Array.from({ length: 4 }, (_, i) => {
            const y = 1180 + i * 46, s = 0.55 + i * 0.12, n = Math.ceil(1300 / (70 * s));
            return (
              <g key={i}>
                {Array.from({ length: n }, (_, k) => {
                  const x = -100 + k * 70 * s + (i % 2) * 20;
                  return <path key={k} d={`M${x} ${y} q0 ${-40 * s} ${28 * s} ${-42 * s} q${28 * s} 2 ${28 * s} ${42 * s} Z`} fill="url(#do-seat)" stroke={K} strokeWidth={3} />;
                })}
                <path d={`M-200 ${y} H1280`} stroke="#F6C890" strokeWidth="3" opacity={0.15 + 0.2 * field} />
              </g>
            );
          })}
        </g>
        {/* fascio del proiettore dall'alto dietro di noi verso lo schermo */}
        <g transform={L(0.8)}>
          <path d={`M${sx0} ${sy0} L${sx1} ${sy0} L${sx1} ${sy1} L760 2100 L320 2100 L${sx0} ${sy1} Z`} fill="url(#do-beam)" opacity={0.5} />
        </g>
        {/* PIANO 4 — poltrone vicine in primo piano, schienali alti (1,1) */}
        <g transform={L(1.1)}>
          {Array.from({ length: 2 }, (_, i) => {
            const y = 1640 + i * 200, s = 1.6 + i * 0.5, n = Math.ceil(1500 / (70 * s));
            return (
              <g key={i}>
                <rect x="-200" y={y - 10} width="1480" height="400" fill="#0A0608" />
                {Array.from({ length: n }, (_, k) => {
                  const x = -160 + k * 70 * s + (i % 2) * 40;
                  return (
                    <g key={k}>
                      <path d={`M${x} ${y} q0 ${-50 * s} ${30 * s} ${-52 * s} q${30 * s} 2 ${30 * s} ${52 * s} Z`} fill="url(#do-seat)" stroke={K} strokeWidth={6} />
                      <path d={`M${x + 8 * s} ${y - 40 * s} q${22 * s} -8 ${44 * s} 0`} stroke="#E8606A" strokeWidth={3} fill="none" opacity=".6" />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
        {/* PIANO 5 — pulviscolo nel fascio del proiettore (1,5) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 1020, x0: 200, x1: 880 }} bottom={{ y: 1900, x0: 320, x1: 760 }} n={50} color="#FFF4D8" seed={31} boost={0.15} />
          <NearMotes id="do-near" t={t} color="#FFF0D8" n={5} r0={50} r1={130} y0={1100} y1={1900} opacity={0.08} />
        </g>
      </g>
      <Finish id="do" tint="#3A1028" tintOpacity={0.1} />
    </svg>
  );
};
