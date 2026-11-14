import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Ball, Crowd, GIALLOROSSO, K, Scoreboard } from './Comuni';

// Un ragazzo della Roma: la vista dal tunnel degli spogliatoi verso il campo, la sera dell'esordio. Pareti e soffitto del
// tunnel incorniciano l'inquadratura; in fondo l'uscita piena di luce, oltre lo stadio pieno di tifosi giallorossi, i fari,
// il maxischermo. Sull'ultimo scalino, nella luce dell'uscita, un pallone con l'ombra lunga verso di noi
// (la figura del ragazzo è stata provata e scartata dall'utente). f2 «Nel 2021… esordisce in Serie A»: il maxischermo scrive
// «SERIE A · ESORDIO 2021», la luce dell'uscita si fa piena, la curva alza le sciarpe e partono i flash.
// Piani: stadio oltre l'uscita (0,3) · tunnel (0,6) · pallone (0,75) · bordi del tunnel (1,15) · polvere nella luce (1,5)

const r0 = rng(916);
const VX = 540, VY = 960; // punto di fuga
// uscita del tunnel
const OX0 = 300, OX1 = 780, OY0 = 640, OY1 = 1220;

export const Roma: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 980);
  const L = cam.layer;
  const tOn = griglia(cues[1] + 0.3);
  const on = eo(seg(t, tOn, tOn + 0.6));
  const pop = eob(seg(t, tOn, tOn + 0.5), 1.8);
  const light = 0.55 + 0.45 * on;
  const bob = 0;
  const shirts = [GIALLOROSSO.rosso, GIALLOROSSO.rosso, '#6A1622', GIALLOROSSO.giallo, '#2A2A34', '#F2EEE6'];
  const scarves = [[GIALLOROSSO.rosso, GIALLOROSSO.giallo], [GIALLOROSSO.giallo, GIALLOROSSO.rosso]];

  // tunnel: quattro trapezi dal bordo dell'inquadratura all'uscita
  const W = { l: -260, r: 1340, t: -260, b: 2180 };
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ro" />
        <clipPath id="ro-open"><rect x={OX0} y={OY0} width={OX1 - OX0} height={OY1 - OY0} /></clipPath>
        <Lin id="ro-sky" stops={[[0, '#120C22'], [1, '#3A2440']]} />
        <Lin id="ro-pitch" stops={[[0, '#7ABE5A'], [1, '#4A9A3A']]} />
        <linearGradient id="ro-wl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0A0A12" /><stop offset=".7" stopColor="#24222E" /><stop offset="1" stopColor="#5A5248" /></linearGradient>
        <linearGradient id="ro-wr" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#0A0A12" /><stop offset=".7" stopColor="#24222E" /><stop offset="1" stopColor="#5A5248" /></linearGradient>
        <Lin id="ro-ceil" stops={[[0, '#05050A'], [0.8, '#16141E'], [1, '#3A3430']]} />
        <Lin id="ro-floor" stops={[[0, '#C8B890'], [0.12, '#5A5048'], [0.5, '#1E1C22'], [1, '#08080C']]} />
        <linearGradient id="ro-spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF0C8" stopOpacity=".55" /><stop offset="1" stopColor="#FFF0C8" stopOpacity="0" /></linearGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — lo stadio oltre l'uscita: cielo, tribuna piena, maxischermo, prato luminoso (0,3) */}
        <g transform={L(0.3)}>
          <g clipPath="url(#ro-open)">
            <rect x={OX0 - 100} y={OY0 - 100} width={OX1 - OX0 + 200} height={OY1 - OY0 + 200} fill="url(#ro-sky)" />
            {/* tetto della tribuna di fronte con i fari */}
            <path d={`M${OX0 - 100} 740 L${OX1 + 100} 730 L${OX1 + 100} 770 L${OX0 - 100} 780 Z`} fill="#0C0A14" />
            {Array.from({ length: 6 }, (_, i) => (
              <g key={i}>
                <Glow id={`ro-fl${i}`} x={OX0 + 20 + i * 92} y={774} r={70} t={t} color="#FFF8E0" amp={0.05} rate={2.5} ph={i} opacity={0.9} />
                <rect x={OX0 + 4 + i * 92} y={766} width="32" height="14" rx="3" fill="#FFFDF0" />
              </g>
            ))}
            <rect x={OX0 - 100} y={780} width={OX1 - OX0 + 200} height={240} fill="#1A1420" />
            <Crowd t={t} y1={796} y0={1010} rows={9} x0={OX0 - 100} x1={OX1 + 100} shirts={shirts} scarves={scarves} seed={21} size0={7} size1={12} scarfUp={on} flashes={on} bounce={0.5 * on} backdrop="#1A1420" />
            {/* maxischermo nella tribuna */}
            <g transform={`translate(680 695) scale(${lerp(0.94, 1, pop)}) translate(-680 -695)`}>
              <Scoreboard id="ro-sb" x={566} y={652} w={190} h={88} t={t} on={0.55 + 0.45 * on}
                lines={on > 0.05 ? [{ text: 'SERIE A', size: 28 }, { text: 'ESORDIO 2021', size: 18, color: '#F2EEE6' }] : [{ text: 'ROMA', size: 30 }]} />
            </g>
            {/* cartelloni a bordo campo (fasce di colore, nessun marchio) e prato */}
            <rect x={OX0 - 100} y={1018} width={OX1 - OX0 + 200} height="22" fill="#2A1E3A" />
            {Array.from({ length: 6 }, (_, i) => <rect key={i} x={OX0 - 80 + i * 110} y={1020} width="104" height="18" fill={i % 2 ? '#7A1A28' : '#C8901E'} opacity=".85" />)}
            <rect x={OX0 - 100} y={1040} width={OX1 - OX0 + 200} height={OY1 - 1040 + 100} fill="url(#ro-pitch)" />
            {Array.from({ length: 5 }, (_, i) => <rect key={i} x={OX0 - 100} y={1040 + i * 44} width={OX1 - OX0 + 200} height="22" fill="#8ACC66" opacity=".35" />)}
            <path d={`M${OX0 - 100} 1110 L${OX1 + 100} 1100`} stroke="#F4F6EC" strokeWidth="6" opacity=".8" />
            {/* bagliore dell'uscita */}
            <rect x={OX0} y={OY0} width={OX1 - OX0} height={OY1 - OY0} fill="#FFF4D8" opacity={0.08 + 0.1 * on} />
          </g>
          <Glow id="ro-out" x={540} y={1060} r={520} t={t} color="#FFF0C8" amp={0.03} rate={1.5} opacity={0.35 + 0.25 * on} />
        </g>
        {/* PIANO 1 — il tunnel: soffitto, pareti, pavimento, scalini verso l'uscita (0,6) */}
        <g transform={L(0.6)}>
          {/* soffitto */}
          <path d={`M${W.l} ${W.t} H${W.r} L${OX1} ${OY0} H${OX0} Z`} fill="url(#ro-ceil)" />
          {/* pareti */}
          <path d={`M${W.l} ${W.t} L${OX0} ${OY0} V${OY1} L${W.l} ${W.b} Z`} fill="url(#ro-wl)" />
          <path d={`M${W.r} ${W.t} L${OX1} ${OY0} V${OY1} L${W.r} ${W.b} Z`} fill="url(#ro-wr)" />
          {/* pavimento */}
          <path d={`M${W.l} ${W.b} L${OX0} ${OY1} H${OX1} L${W.r} ${W.b} Z`} fill="url(#ro-floor)" />
          <path d={`M${OX0} ${OY1} H${OX1} L${OX1 + 260} 1500 H${OX0 - 260} Z`} fill="url(#ro-spill)" opacity={0.6 + 0.4 * on} />
          {/* scalini davanti all'uscita */}
          {[0, 1, 2].map((i) => {
            const y = OY1 + 14 + i * 26, k = 1 + i * 0.09;
            return <g key={i}><rect x={VX - (OX1 - OX0) / 2 * k} y={y} width={(OX1 - OX0) * k} height="10" fill="#E8D8B0" opacity={0.55 - i * 0.12} /><path d={`M${VX - (OX1 - OX0) / 2 * k} ${y} H${VX + (OX1 - OX0) / 2 * k}`} stroke={K} strokeWidth="3" opacity=".5" /></g>;
          })}
          {/* una lampada al neon in alto (sopra l'etichetta) e applique sulle pareti, lontane dal titolo */}
          <Glow id="ro-n0" x={VX} y={110} r={240} t={t} color="#DDE8FF" amp={0.04} rate={7} opacity={0.3} />
          <rect x={VX - 150} y={96} width="300" height="26" rx="13" fill="#EEF4FF" stroke={K} strokeWidth="3" />
          {[[150, 1060, 1], [930, 1060, -1], [240, 1010, 1], [840, 1010, -1]].map(([x, y, d], i) => (
            <g key={i}>
              <Glow id={`ro-w${i}`} x={x} y={y} r={i < 2 ? 130 : 80} t={t} color="#FFE8B8" amp={0.05} rate={3 + i} ph={i} opacity={0.55} />
              <path d={`M${x - 18 * d} ${y - (i < 2 ? 34 : 20)} L${x + 14 * d} ${y - (i < 2 ? 24 : 14)} L${x + 14 * d} ${y + (i < 2 ? 24 : 14)} L${x - 18 * d} ${y + (i < 2 ? 34 : 20)} Z`} fill="#FFF0D0" stroke={K} strokeWidth="4" />
            </g>
          ))}
          {/* giunti delle pareti e corrimano in prospettiva */}
          {[0.2, 0.42, 0.62, 0.8].map((u, i) => {
            const xl = lerp(W.l, OX0, u), xr = lerp(W.r, OX1, u), yt = lerp(W.t, OY0, u), yb = lerp(W.b, OY1, u);
            return <g key={i} stroke="#000" strokeWidth={lerp(8, 3, u)} opacity=".45"><path d={`M${xl} ${yt} V${yb}`} /><path d={`M${xr} ${yt} V${yb}`} /></g>;
          })}
          <path d={`M${W.l} ${1500} L${OX0} ${980}`} stroke="#8A8270" strokeWidth="12" />
          <path d={`M${W.r} ${1500} L${OX1} ${980}`} stroke="#8A8270" strokeWidth="12" />
          <path d={`M${W.l} ${1486} L${OX0} ${974}`} stroke="#FFF0C8" strokeWidth="3" opacity={0.4 + 0.3 * on} />
          <path d={`M${W.r} ${1486} L${OX1} ${974}`} stroke="#FFF0C8" strokeWidth="3" opacity={0.4 + 0.3 * on} />
          {/* tappeto di gomma al centro del pavimento, con le impronte dei tacchetti */}
          <path d={`M${VX - 120} ${OY1 + 90} H${VX + 120} L${VX + 380} 2000 H${VX - 380} Z`} fill="#2A0E14" opacity=".75" />
          <path d={`M${VX - 120} ${OY1 + 90} L${VX - 380} 2000 M${VX + 120} ${OY1 + 90} L${VX + 380} 2000`} stroke={GIALLOROSSO.giallo} strokeWidth="6" opacity=".6" />
          {Array.from({ length: 24 }, (_, i) => {
            const y = lerp(OY1 + 120, 1900, r0()), x = VX + (r0() - 0.5) * lerp(200, 600, (y - OY1) / 800);
            return <ellipse key={i} cx={x} cy={y} rx={lerp(3, 7, (y - OY1) / 800)} ry={lerp(2, 4, (y - OY1) / 800)} fill="#000" opacity=".35" />;
          })}
        </g>
        {/* PIANO 2 — il pallone sullo scalino più alto, nella luce dell'uscita, con l'ombra lunga verso di noi (0,75) */}
        <g transform={L(0.75)}>
          <path d="M500 1232 L580 1232 L700 1700 L380 1700 Z" fill="#000" opacity=".4" />
          <Glow id="ro-halo" x={540} y={1170} r={240} t={t} color="#FFF2C8" amp={0.05} rate={2} opacity={0.35 + 0.25 * on} />
          <Ball x={540} y={1190 - bob} r={46} rot={t * 6} />
          <path d="M498 1170 Q520 1140 552 1146" stroke="#FFF6D8" strokeWidth="5" fill="none" opacity={0.6 + 0.3 * on} />
        </g>
        {/* PIANO 3 — bordi del tunnel che escono dall'inquadratura (1,15) */}
        <g transform={L(1.15)}>
          <path d="M-260 -260 H80 L-40 2180 H-260 Z" fill="#06060A" />
          <path d="M80 -260 L-40 2180" stroke="#4A443C" strokeWidth="6" opacity=".6" />
          <path d="M1340 -260 H1000 L1120 2180 H1340 Z" fill="#06060A" />
          <path d="M1000 -260 L1120 2180" stroke="#4A443C" strokeWidth="6" opacity=".6" />
          <path d="M-260 1820 Q540 1760 1340 1820 V2200 H-260 Z" fill="#050508" />
        </g>
        {/* PIANO 4 — pulviscolo nel fascio di luce dell'uscita, particelle vicine (1,5) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 640, x0: 300, x1: 780 }} bottom={{ y: 1700, x0: 60, x1: 1020 }} n={46} color="#FFF0C8" seed={8} boost={0.2 * on} />
          <NearMotes id="ro-near" t={t} color="#FFF0C8" n={6} r0={40} r1={120} y0={900} y1={1900} opacity={0.1} />
        </g>
      </g>
      <Finish id="ro" tint="#2C1E3A" tintOpacity={0.1} />
    </svg>
  );
};
