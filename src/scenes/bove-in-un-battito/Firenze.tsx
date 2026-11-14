import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Confetti, Glow, NearMotes, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Ball, Crowd, K, Pitch, Scoreboard, VIOLA } from './Comuni';

// In prestito a Firenze: dentro uno stadio inventato, di sera, dalla curva viola alle spalle della porta. Di fronte la
// tribuna piena e il tabellone; davanti a noi la porta vista da dietro, con la rete; sotto, le teste dei tifosi della
// curva con le sciarpe viola. f2 «il 27 ottobre… primo gol… cinque a uno»: il pallone arriva dal campo e gonfia la rete
// verso di noi, la curva salta e alza le sciarpe, il tabellone passa da 3–1 a 4–1 (il gol di Bove al 52'; il 5-1 finale arriva dopo), coriandoli viola. Nessun volto, nessuno stemma.
// Piani: tetto e fari (0,2) · tribuna di fronte (0,4) · campo (0,6) · porta e rete (0,85) · curva in primo piano (1,2) · coriandoli (1,6)

const VIOLA_CH = '#8A62C8';

export const Firenze: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const tGol = griglia(cues[1] + 2.4);
  const shot = seg(t, tGol - 0.8, tGol);
  const hit = seg(t, tGol, tGol + 0.4);
  const bulge = eob(hit, 2) * (1 - 0.7 * seg(t, tGol + 0.5, tGol + 1.8));
  const joy = seg(t, tGol, tGol + 0.3) * (1 - 0.4 * seg(t, tGol + 3, dur));
  const sb = eo(seg(t, tGol + 0.15, tGol + 0.55));
  const flash = flashAt(t, [tGol + 0.05]);
  const shirts = [VIOLA, VIOLA, '#4A3270', VIOLA_CH, '#F2EEE6', '#2A2A34'];
  const scarves = [[VIOLA, '#F2EEF8'], ['#F2EEF8', VIOLA]];

  // pallone: dal dischetto lontano verso l'angolo alto della rete, poi ricade nella rete gonfia
  const bx = t < tGol ? lerp(560, 640, eo(shot)) : lerp(640, 600, hit);
  const by = t < tGol ? lerp(1180, 900, eo(shot)) - Math.sin(shot * Math.PI) * 80 : lerp(900, 1180, eo(seg(t, tGol + 0.3, tGol + 1.2)));
  const br = t < tGol ? lerp(14, 40, shot ** 1.6) : lerp(44, 34, hit);

  // rete vista da dietro: si gonfia verso di noi attorno al punto d'impatto (640, 900)
  const net = () => {
    const out: React.ReactNode[] = [];
    const X0 = 200, X1 = 880, Y0 = 760, Y1 = 1240;
    const push = (x: number, y: number) => {
      const d = Math.hypot(x - 640, (y - 900) * 1.2);
      return Math.max(0, 1 - d / 320) * 70 * bulge;
    };
    for (let i = 0; i <= 17; i++) {
      const x = lerp(X0, X1, i / 17);
      let d = '';
      for (let j = 0; j <= 12; j++) {
        const y = lerp(Y0, Y1, j / 12), p = push(x, y);
        d += `${j ? 'L' : 'M'}${(x + (x - 640) * p * 0.004).toFixed(1)} ${(y + p * 0.5).toFixed(1)} `;
      }
      out.push(<path key={`v${i}`} d={d} />);
    }
    for (let j = 0; j <= 12; j++) {
      const y = lerp(Y0, Y1, j / 12);
      let d = '';
      for (let i = 0; i <= 17; i++) {
        const x = lerp(X0, X1, i / 17), p = push(x, y);
        d += `${i ? 'L' : 'M'}${(x + (x - 640) * p * 0.004).toFixed(1)} ${(y + p * 0.5).toFixed(1)} `;
      }
      out.push(<path key={`h${j}`} d={d} />);
    }
    return out;
  };

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fi" />
        <Lin id="fi-sky" stops={[[0, '#0A0816'], [0.6, '#1E1636'], [1, '#3A2A5A']]} />
        <Lin id="fi-roof" stops={[[0, '#05050A'], [1, '#14121E']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno e copertura scura della tribuna di fronte, fila di fari (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1200" fill="url(#fi-sky)" />
          <g transform="translate(0 80)">
          <path d="M-200 560 Q540 600 1280 560 V640 H-200 Z" fill="url(#fi-roof)" />
          <path d="M-200 562 Q540 602 1280 562" stroke="#8A80B0" strokeWidth="4" fill="none" opacity=".5" />
          {Array.from({ length: 9 }, (_, i) => {
            const x = -80 + i * 155, y = 618 + Math.sin((i / 8) * Math.PI) * 18;
            return (
              <g key={i}>
                <Glow id={`fi-l${i}`} x={x} y={y} r={100} t={t} color="#FFF6DC" amp={0.05} rate={2.4} ph={i} opacity={0.8} />
                <rect x={x - 30} y={y - 12} width="60" height="24" rx="5" fill="#FFFBEA" stroke={K} strokeWidth="4" />
              </g>
            );
          })}
          </g>
        </g>
        {/* PIANO 1 — la tribuna di fronte, piena di tifosi, e il tabellone (0,4) */}
        <g transform={`${L(0.4)} translate(0 60)`}>
          <rect x="-200" y="636" width="1480" height="400" fill="#16121E" />
          <Crowd t={t} y1={680} y0={1000} rows={12} shirts={shirts} scarves={scarves} seed={33} size0={8} size1={14} scarfUp={0.3 + 0.7 * joy} flashes={0.4 + 0.6 * joy} bounce={0.6 * joy} backdrop="#16121E" />
          <g opacity={0.5 + 0.5 * sb} transform={`translate(800 646) scale(${lerp(0.94, 1, eob(sb, 1.8))}) translate(-800 -646)`}>
            <Glow id="fi-sbg" x={800} y={646} r={220} t={t} color="#D8C0FF" amp={0.05} rate={3} opacity={0.5 * sb} />
            <Scoreboard id="fi-sb" x={670} y={598} w={260} h={98} t={t} on={0.35 + 0.65 * sb}
              lines={sb > 0.05 ? [{ text: '4 – 1', size: 44 }, { text: 'FIORENTINA · ROMA', size: 20, color: '#E8D8FF' }] : [{ text: '3 – 1', size: 44 }, { text: 'FIORENTINA · ROMA', size: 20, color: '#E8D8FF' }]} />
          </g>
          {/* cartelloni a bordo campo: fasce di colore, nessun marchio */}
          <rect x="-200" y="1030" width="1480" height="30" fill="#1E1A2A" />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-190 + i * 190} y="1034" width="180" height="22" fill={i % 2 ? '#4A3270' : '#2E2448'} opacity=".95" />)}
        </g>
        {/* PIANO 2 — il campo con i fasci dei fari (0,6) */}
        <g transform={L(0.6)}>
          <Pitch id="fi-p" y0={1120} light="#3E8A3A" dark="#317632" x0={-300} x1={1380} lineOpacity={0.6} />
          <Beam id="fi-b1" x={120} y={620} t={t} length={700} spread={360} color="#FFF6DC" angle={70} sweep={1} opacity={0.14} />
          <Beam id="fi-b2" x={960} y={620} t={t} length={700} spread={360} color="#FFF6DC" angle={110} sweep={1} opacity={0.14} />
          {/* area di rigore: linee che vengono verso di noi */}
          <path d="M100 1250 L250 1100 H830 L980 1250" stroke="#EEF2E6" strokeWidth="6" fill="none" opacity=".7" />
          {/* il pallone in volo dal campo (prima dell'impatto è oltre la rete) */}
          {t < tGol && <Ball x={bx} y={by} r={br} rot={shot * 500} shadow={false} />}
        </g>
        {/* PIANO 3 — la porta vista da dietro: pali, traversa, rete che si gonfia verso di noi (0,85) */}
        <g transform={L(0.85)}>
          <Glow id="fi-hit" x={640} y={900} r={260} t={t} color="#E8D0FF" amp={0.05} rate={3} opacity={0.6 * bulge} />
          <g stroke="#F2F2F6" strokeWidth="3" opacity=".7" fill="none">{net()}</g>
          {/* pallone dentro la rete, dopo l'impatto */}
          {t >= tGol && <Ball x={bx} y={by} r={br} rot={hit * 200 + t * 40} shadow={false} />}
          {/* pali e traversa (davanti alla rete per chi guarda da dietro: li vediamo oltre la rete, quindi più sottili e luminosi) */}
          <path d="M200 1250 V760 H880 V1250" stroke="#FFFFFF" strokeWidth="18" fill="none" strokeLinejoin="round" />
          <path d="M200 1250 V760 H880 V1250" stroke={K} strokeWidth="24" fill="none" strokeLinejoin="round" opacity=".35" transform="translate(4 4)" />
          <path d="M200 1250 V760 H880 V1250" stroke="#FFFFFF" strokeWidth="16" fill="none" strokeLinejoin="round" />
          {/* sostegni posteriori della rete verso di noi */}
          <path d="M200 760 L130 1300 M880 760 L950 1300" stroke="#C8CCD6" strokeWidth="9" />
        </g>
        {/* PIANO 4 — la curva in primo piano: teste dei tifosi di spalle e sciarpe viola (1,2) */}
        <g transform={L(1.2)}>
          <rect x="-200" y="1420" width="1480" height="700" fill="#0E0B16" />
          <rect x="-200" y="1400" width="1480" height="26" fill="#2A2438" stroke={K} strokeWidth="6" />
          <Crowd t={t} y1={1470} y0={1860} rows={4} shirts={shirts} scarves={scarves} seed={45} size0={30} size1={46} scarfUp={0.4 + 0.6 * joy} bounce={0.9 * joy} backdrop="#0E0B16" back />
        </g>
        {/* PIANO 5 — coriandoli viola dopo il gol e particelle vicine (1,6) */}
        <g transform={L(1.6)} opacity={joy}>
          <Confetti t={Math.max(0, t - tGol)} seed={33} n={44} colors={[VIOLA_CH, '#F2EEF8', VIOLA, '#C8B0F0']} y0={500} y1={1900} speed={0.24} />
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="fi-near" t={t} color="#D8C8FF" n={6} r0={50} r1={130} y0={900} y1={1900} opacity={0.1} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#F4F0FF" opacity={0.3 * flash} />
      <Finish id="fi" tint="#2C2456" tintOpacity={0.12} />
    </svg>
  );
};
