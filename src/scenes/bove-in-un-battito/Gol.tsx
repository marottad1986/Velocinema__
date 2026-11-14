import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Confetti, Glow, NearMotes, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Ball, Crowd, GrassFront, K, Scoreboard, WATFORD } from './Comuni';

// Il gol dopo 506 giorni: di notte, dal limite dell'area, guardiamo dentro la porta. Oltre la rete la tribuna dietro la
// porta, piena di tifosi gialli, neri e rossi; sopra, il tabellone. f1 «…segna nei minuti di recupero»: il pallone parte
// dal basso, vola nell'angolo alto e gonfia la rete, la tribuna esplode, coriandoli e flash; il tabellone segna «90+».
// f2 «…primo gol dopo 506 giorni»: sul tabellone il contatore corre fino a «506 GIORNI». Nessun calciatore disegnato.
// Piani: tetto e fari (0,2) · tribuna dietro la porta (0,4) · rete di fondo (0,6) · pali e traversa (0,9) · coriandoli (1,5)

const BX0 = -60, BX1 = 760, BY0 = 850, BY1 = 1190; // rete di fondo
const PX = 860, PY0 = 770, PY1 = 1300; // palo destro e traversa in primo piano

export const Gol: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const tGol = griglia(cues[0] + 3.4);
  const shot = seg(t, tGol - 0.7, tGol);
  const hit = seg(t, tGol, tGol + 0.4);
  const bulge = eob(hit, 2) * (1 - 0.7 * seg(t, tGol + 0.5, tGol + 1.8));
  const joy = seg(t, tGol, tGol + 0.3);
  const flash = flashAt(t, [tGol + 0.05]);
  const tCount = griglia(cues[1] + 0.6);
  const count = Math.round(506 * eo(seg(t, tCount, tCount + 2.4)));
  const pop = eob(seg(t, tCount + 2.4, tCount + 2.8), 2);
  const shirts = [WATFORD.giallo, WATFORD.giallo, WATFORD.nero, WATFORD.rosso, '#F2EEE6', '#2A2A34'];
  const scarves = [[WATFORD.giallo, WATFORD.nero, WATFORD.rosso], [WATFORD.nero, WATFORD.giallo]];

  // pallone: dal basso a sinistra (vicino a noi) all'angolo alto della rete di fondo
  const IX = 600, IY = 910;
  const bx = t < tGol ? lerp(260, IX, eo(shot)) : IX + 6 * bulge;
  const by = t < tGol ? lerp(1560, IY, eo(shot)) - Math.sin(shot * Math.PI) * 140 : lerp(IY, 1150, eo(seg(t, tGol + 0.5, tGol + 1.4))) - 20 * bulge;
  const br = t < tGol ? lerp(90, 30, eo(shot)) : 30;

  const push = (x: number, y: number) => Math.max(0, 1 - Math.hypot(x - IX, (y - IY) * 1.2) / 260) * 60 * bulge;
  const mesh = () => {
    const out: React.ReactNode[] = [];
    for (let i = 0; i <= 20; i++) {
      const x = lerp(BX0, BX1, i / 20);
      let d = '';
      for (let j = 0; j <= 10; j++) { const y = lerp(BY0, BY1, j / 10), p = push(x, y); d += `${j ? 'L' : 'M'}${(x + (x - IX) * p * -0.003).toFixed(1)} ${(y - p * 0.4).toFixed(1)} `; }
      out.push(<path key={`v${i}`} d={d} />);
    }
    for (let j = 0; j <= 10; j++) {
      const y = lerp(BY0, BY1, j / 10);
      let d = '';
      for (let i = 0; i <= 20; i++) { const x = lerp(BX0, BX1, i / 20), p = push(x, y); d += `${i ? 'L' : 'M'}${(x + (x - IX) * p * -0.003).toFixed(1)} ${(y - p * 0.4).toFixed(1)} `; }
      out.push(<path key={`h${j}`} d={d} />);
    }
    return out;
  };

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="go" />
        <Lin id="go-sky" stops={[[0, '#06080E'], [0.7, '#141A2A'], [1, '#22283A']]} />
        <Lin id="go-grass" stops={[[0, '#3A7A36'], [1, '#1E4A20']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — notte, copertura della tribuna e fari (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1200" fill="url(#go-sky)" />
          <path d="M-200 620 L1280 610 V680 L-200 690 Z" fill="#08090E" />
          {Array.from({ length: 8 }, (_, i) => {
            const x = -40 + i * 165, y = 676;
            return (
              <g key={i}>
                <Glow id={`go-l${i}`} x={x} y={y} r={100} t={t} color="#F8FAFF" amp={0.04} rate={2.6} ph={i} opacity={0.8} />
                <rect x={x - 30} y={y - 11} width="60" height="22" rx="5" fill="#FAFCFF" stroke={K} strokeWidth="4" />
              </g>
            );
          })}
        </g>
        {/* PIANO 1 — la tribuna dietro la porta che esplode al gol, e il tabellone (0,4) */}
        <g transform={L(0.4)}>
          <rect x="-200" y="690" width="1480" height="520" fill="#14141E" />
          <Crowd t={t} y1={726} y0={1120} rows={10} shirts={shirts} scarves={scarves} seed={88} size0={10} size1={18} stand={lerp(0.6, 1, joy)} bounce={0.9 * joy} scarfUp={lerp(0.2, 1, joy)} flashes={joy} backdrop="#14141E" />
          <rect x="-200" y="1150" width="1480" height="40" fill="#0E0E16" />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-190 + i * 190} y="1154" width="182" height="32" fill={i % 2 ? WATFORD.nero : '#C8A814'} opacity=".95" />)}
        </g>
        {/* tabellone in alto a destra, sopra la traversa: 90+ e il contatore dei giorni */}
        <g transform={L(0.4)}>
          <g transform={`translate(750 690) scale(${lerp(0.94, 1, Math.max(eob(joy, 2), pop))}) translate(-750 -690)`}>
            <Glow id="go-sbg" x={750} y={690} r={240} t={t} color="#FFE6A0" amp={0.05} rate={3} opacity={0.25 + 0.4 * Math.max(joy, pop)} />
            <Scoreboard id="go-sb" x={560} y={630} w={380} h={118} t={t} on={0.5 + 0.5 * joy}
              lines={t >= tCount ? [{ text: `${count}`, size: 52 }, { text: 'GIORNI DALL\'ULTIMO GOL', size: 18, color: '#F2EEE6' }] : [{ text: '90+', size: 52 }, { text: 'RECUPERO', size: 20, color: '#F2EEE6' }]} />
          </g>
        </g>
        {/* PIANO 2 — dentro la porta: prato, rete di fondo e rete laterale (0,6) */}
        <g transform={L(0.6)}>
          <rect x="-200" y="1180" width="1480" height="900" fill="url(#go-grass)" />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x="-200" y={1200 + i * 60 + i * i * 8} width="1480" height={26 + i * 6} fill="#4A8A42" opacity=".35" />)}
          <path d={`M${BX0} ${BY1} H${BX1}`} stroke="#F4F6EC" strokeWidth="6" opacity=".7" />
          <Glow id="go-hit" x={IX} y={IY} r={240} t={t} color="#FFF0A0" amp={0.05} rate={3} opacity={0.6 * bulge} />
          <g stroke="#F2F2F6" strokeWidth="3" opacity=".75" fill="none">{mesh()}</g>
          {/* rete laterale: dal palo vicino alla rete di fondo */}
          <g stroke="#F2F2F6" strokeWidth="3" opacity=".55" fill="none">
            {Array.from({ length: 9 }, (_, i) => { const u = i / 8; return <path key={i} d={`M${lerp(PX, BX1, u)} ${lerp(PY0, BY0, u)} L${lerp(PX, BX1, u)} ${lerp(PY1, BY1, u)}`} />; })}
            {Array.from({ length: 9 }, (_, j) => { const v = j / 8; return <path key={`h${j}`} d={`M${PX} ${lerp(PY0, PY1, v)} L${BX1} ${lerp(BY0, BY1, v)}`} />; })}
          </g>
          {/* sostegni della rete */}
          <path d={`M${BX1} ${BY0} L${PX} ${PY0} M${BX1} ${BY0} V${BY1}`} stroke="#C8CCD6" strokeWidth="8" />
          {t >= tGol && <Ball x={bx} y={by} r={br} rot={hit * 200 + t * 30} shadow={false} />}
        </g>
        {/* PIANO 3 — traversa e palo destro in primo piano, grossi e lucidi (0,9) */}
        <g transform={L(0.9)}>
          <path d={`M-260 ${PY0} H${PX} V${PY1}`} stroke={K} strokeWidth="40" fill="none" strokeLinejoin="round" opacity=".35" transform="translate(6 8)" />
          <path d={`M-260 ${PY0} H${PX} V${PY1}`} stroke="#FFFFFF" strokeWidth="32" fill="none" strokeLinejoin="round" />
          <path d={`M-260 ${PY0} H${PX} V${PY1}`} stroke={K} strokeWidth="5" fill="none" strokeLinejoin="round" transform="translate(0 16)" opacity=".4" />
          <path d={`M-260 ${PY0 - 10} H${PX - 10} V${PY1}`} stroke="#E8F0FF" strokeWidth="5" fill="none" opacity=".8" />
          <ellipse cx={PX} cy={PY1 + 8} rx="50" ry="10" fill="#000" opacity=".4" />
          {/* il pallone in volo, prima di entrare (davanti alla porta) */}
          {t < tGol && shot > 0 && <Ball x={bx} y={by} r={br} rot={shot * 600} shadow={false} />}
          {t < tGol && shot > 0 && <path d={`M${bx - 70} ${by + 90} L${bx - 10} ${by + 12}`} stroke="#FFFFFF" strokeWidth="8" opacity=".35" strokeLinecap="round" />}
        </g>
        <g transform={L(1.25)}><GrassFront t={t} y={1800} /></g>
        {/* PIANO 4 — coriandoli gialli e neri dopo il gol, particelle vicine (1,5) */}
        <g transform={L(1.5)} opacity={joy}>
          <Confetti t={Math.max(0, t - tGol)} seed={52} n={46} colors={[WATFORD.giallo, WATFORD.nero, WATFORD.rosso, '#FFF4C8']} y0={500} y1={1900} speed={0.24} />
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="go-near" t={t} color="#FFF4D8" n={5} r0={50} r1={130} y0={900} y1={1900} opacity={0.08} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#FFFFFF" opacity={0.3 * flash} />
      <Finish id="go" tint="#1E2448" tintOpacity={0.1} />
    </svg>
  );
};
