import React from 'react';
import { camera, eio, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { HAND } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Fire, Glow, NearMotes, Stars, Wisps } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Si può fare!: studio del castello; la libreria ruota su sé stessa e scopre una scala a chiocciola che scende
// verso il laboratorio (luce verde-acqua dal basso). Candela nel portacandele a muro; sulla scrivania il diario
// «Come l'ho fatto» e un mozzicone di candela che si consuma fino all'alba. Nessuna persona.
// Eventi: candela tirata → la libreria si apre (cue 0) · «Rimetti a posto la candela!»: si richiude di colpo e si riapre
//         (cue 1) · luce dal laboratorio (cue 2) · diario che si apre (cue 3) · notte → alba, pagine che girano (cue 4)
//         · «Si può fare!»: bagliore verde-acqua dal diario (cue 5).
// Piani: parete e finestra (0,2) · vano segreto con scala (0,4) · libreria e candela a muro (0,65)
//        · scrivania con diario (0,95) · poltrona e tenda in primo piano (1,25) · pulviscolo e particelle (1,5–1,8)

const K = '#0D0E10';
const ACC = '#8EF0C8';
const r = rng(1818);
const BOOKS = Array.from({ length: 5 }, (_, row) => {
  const out: { x: number; w: number; h: number; c: string; tilt: number }[] = [];
  let x = 0;
  while (x < 480) {
    const w = 22 + r() * 26;
    if (x + w > 480) break;
    out.push({ x, w, h: 80 + r() * 36, c: ['#4A3A2E', '#3A4038', '#5A4A3A', '#2E3238', '#5E5246', '#463A40'][Math.floor(r() * 6)], tilt: r() > 0.9 ? 8 : 0 });
    x += w + 2;
  }
  return out;
});

const mix = (a: string, b: string, p: number) => {
  const ca = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const cb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${ca.map((v, i) => Math.round(lerp(v, cb[i], p)).toString(16).padStart(2, '0')).join('')}`;
};

export const Libreria: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // candela tirata (1) o rimessa a posto (0)
  const pulled = Math.max(seg(t, cues[0] + 0.3, cues[0] + 0.5) * (1 - seg(t, cues[1], cues[1] + 0.15)), seg(t, cues[1] + 0.9, cues[1] + 1.1));
  // apertura della libreria: 0 chiusa, 1 aperta (ruotata di ~75°)
  const open = Math.max(
    eio(seg(t, cues[0] + 0.6, cues[0] + 1.5)) * (1 - eo(seg(t, cues[1] + 0.1, cues[1] + 0.35))),
    eio(seg(t, cues[1] + 1.2, cues[1] + 2.0)),
  );
  const ang = open * 75;
  const cosA = Math.cos((ang * Math.PI) / 180);
  const labGlow = seg(t, cues[2] - 0.3, cues[2] + 0.6) * open;
  const book = eob(seg(t, cues[3], cues[3] + 0.7), 1.2);
  const dawn = eio(seg(t, cues[4], cues[5]));
  const flip = seg(t, cues[4] + 0.3, cues[5] - 0.2);
  const eureka = seg(t, cues[5], cues[5] + 0.4) * (1 - 0.5 * seg(t, cues[5] + 0.6, dur));
  const stub = lerp(1, 0.3, seg(t, cues[3], cues[5]));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="li" />
        <Lin id="li-wall" stops={[[0, '#141210'], [0.35, '#2A2420'], [0.7, '#3A322B'], [1, '#221D19']]} />
        <Lin id="li-wood" x2={1} y2={0} stops={[[0, '#3A2C20'], [0.5, '#5A4632'], [1, '#33271C']]} />
        <Lin id="li-side" x2={1} y2={0} stops={[[0, '#2A2018'], [1, '#4A3A2A']]} />
        <Lin id="li-hole" stops={[[0, '#050606'], [0.6, '#0E1412'], [1, '#1A2A24']]} />
        <Lin id="li-desk" stops={[[0, '#5A4632'], [0.3, '#3E3024'], [1, '#1A140F']]} />
        <Lin id="li-page" x2={1} y2={0} stops={[[0, '#D8D0BC'], [0.5, '#F2ECDC'], [1, '#D0C8B2']]} />
        <Lin id="li-front" stops={[[0, '#2A1E1A'], [1, '#0C0908']]} />
        <Lin id="li-sky" stops={[[0, mix('#0A0E14', '#6E7C8A', dawn)], [0.6, mix('#18202A', '#C9BBA2', dawn)], [1, mix('#222C36', '#E6D6B8', dawn)]]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete a pannelli e finestra: la notte diventa alba (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#li-wall)" />
          {[-100, 160, 420, 680, 940].map((x) => <rect key={x} x={x} y="1000" width="220" height="260" rx="8" fill="none" stroke="#120F0D" strokeWidth="6" opacity=".7" />)}
          <g>
            <path d="M870 560 V300 Q950 220 1030 300 V560 Z" fill="url(#li-sky)" stroke={K} strokeWidth="10" />
            <g opacity={1 - dawn}><Stars t={t} seed={8} n={8} x={880} y={290} w={140} h={250} color="#E8ECEF" /></g>
            <path d="M950 250 V560 M870 420 H1030" stroke={K} strokeWidth="8" />
            <Glow id="li-win" x={950} y={420} r={260} t={t} color={mix('#9AA8B6', '#F3DDA8', dawn)} amp={0.04} rate={1} opacity={0.2 + 0.35 * dawn} />
          </g>
        </g>

        {/* PIANO 1 — vano segreto dietro la libreria: scala a chiocciola e luce del laboratorio (0,4) */}
        <g transform={L(0.4)}>
          <rect x="290" y="590" width="500" height="650" fill="url(#li-hole)" />
          <Glow id="li-lab" x={540} y={1240} r={420} t={t} color={ACC} amp={0.12} rate={4} opacity={0.15 + 0.55 * labGlow} />
          {Array.from({ length: 7 }, (_, i) => {
            const y = 760 + i * 70;
            const w = 300 - i * 18;
            return <path key={i} d={`M540 ${y} L${540 + (i % 2 ? w : -w) * 0.8} ${y + 30} L${540 + (i % 2 ? w : -w) * 0.8} ${y + 50} L540 ${y + 22} Z`} fill={mix('#2A2E2C', '#5A7A6C', labGlow * (i / 7))} stroke={K} strokeWidth="5" />;
          })}
          <rect x="526" y="700" width="28" height="560" fill="#1E2422" stroke={K} strokeWidth="5" />
        </g>

        {/* PIANO 2 — libreria girevole e candela nel portacandele a muro (0,65) */}
        <g transform={L(0.65)}>
          {/* cornice fissa */}
          <path d="M250 1260 V560 H830 V1260" fill="none" stroke="url(#li-wood)" strokeWidth="40" />
          <path d="M230 1260 V540 H850 V1260" fill="none" stroke={K} strokeWidth="6" />
          <path d="M210 540 H870" stroke={K} strokeWidth="14" />
          {/* pannello che ruota sul perno centrale */}
          <g transform={`translate(540 0) scale(${cosA} 1) translate(-540 0)`}>
            <rect x="290" y="590" width="500" height="650" fill="url(#li-wood)" stroke={K} strokeWidth="9" />
            {BOOKS.map((row, ri) => (
              <g key={ri} transform={`translate(300 ${600 + ri * 128})`}>
                {row.map((b, i) => (
                  <g key={i} transform={`rotate(${b.tilt} ${b.x} 118)`}>
                    <rect x={b.x} y={118 - b.h} width={b.w} height={b.h} rx="3" fill={b.c} stroke={K} strokeWidth="4" />
                    <path d={`M${b.x + 4} ${128 - b.h} H${b.x + b.w - 4} M${b.x + 4} ${108} H${b.x + b.w - 4}`} stroke="#B9A27A" strokeWidth="3" opacity=".6" />
                  </g>
                ))}
                <rect x="-10" y="118" width="500" height="12" fill="#2A2018" stroke={K} strokeWidth="4" />
              </g>
            ))}
          </g>
          {/* spessore del pannello quando è ruotato */}
          {open > 0.02 && <rect x={540 + 250 * cosA} y="590" width={Math.max(4, 50 * Math.sin((ang * Math.PI) / 180))} height="650" fill="url(#li-side)" stroke={K} strokeWidth="6" />}
          {/* portacandele a muro: la candela si inclina quando viene tirata */}
          <g transform="translate(910 840)">
            <path d="M-30 30 H30 L20 50 H-20 Z" fill="#6B5A46" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <path d="M0 50 V100 M-24 100 H24" stroke={K} strokeWidth="10" />
            <g transform={`rotate(${pulled * -28} 0 30)`}>
              <rect x="-14" y="-80" width="28" height="110" rx="4" fill="#E8E2D2" stroke={K} strokeWidth="6" />
              <path d="M-6 -70 v80" stroke="#FFFFFF" strokeWidth="4" opacity=".6" />
              <Fire id="li-wf" t={t} x={0} y={-82} scale={0.22} outer="#C9A874" mid="#F0D9A8" core="#FFF6E0" outline={K} />
            </g>
          </g>
        </g>

        {/* PIANO 3 — scrivania con il diario e il mozzicone di candela (0,95) */}
        <g transform={L(0.95)}>
          <path d="M-200 1260 H1280 V2200 H-200 Z" fill="#14100D" />
          <path d="M-60 1250 H1140 L1180 1330 H-100 Z" fill="url(#li-desk)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M-56 1256 H1136" stroke="#9A8064" strokeWidth="4" />
          <path d="M-100 1330 H1180 V1700 H-100 Z" fill="#241B14" stroke={K} strokeWidth="9" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={-40 + i * 400} y="1370" width="340" height="150" rx="8" fill="#2E231A" stroke={K} strokeWidth="7" />
              <path d={`M${-34 + i * 400} 1376 H${294 + i * 400}`} stroke="#6B5440" strokeWidth="3" opacity=".7" />
              <path d={`M${100 + i * 400} 1446 q30 -16 60 0`} fill="none" stroke="#B9A27A" strokeWidth="8" strokeLinecap="round" />
            </g>
          ))}
          {/* calamaio e penna */}
          <g transform="translate(110 1262)">
            <path d="M-40 0 Q-46 -50 -20 -56 H20 Q46 -50 40 0 Z" fill="#1E2226" stroke={K} strokeWidth="6" />
            <path d="M-16 -50 q10 -6 24 -2" stroke="#9AA2A9" strokeWidth="4" fill="none" />
            <path d="M6 -56 Q40 -160 110 -200 Q60 -140 20 -54 Z" fill="#E8E2D2" stroke={K} strokeWidth="5" strokeLinejoin="round" />
          </g>
          {/* candela sulla scrivania che si consuma */}
          <g transform="translate(860 1262)">
            <ellipse cx="0" cy="0" rx="60" ry="14" fill="#6B5A46" stroke={K} strokeWidth="6" />
            <rect x="-18" y={-120 * stub} width="36" height={120 * stub} rx="4" fill="#E8E2D2" stroke={K} strokeWidth="6" />
            <path d={`M-18 ${-120 * stub + 10} q-6 20 0 34`} fill="none" stroke="#F4F0E4" strokeWidth="6" />
            <Fire id="li-df" t={t + 1.3} x={0} y={-120 * stub - 2} scale={0.26} outer="#C9A874" mid="#F0D9A8" core="#FFF6E0" outline={K} />
          </g>
          <Wisps t={t} x={860} y={1262 - 120 * stub - 60} color="#CFC6B4" n={2} h={160} width={4} opacity={0.4} />
          {/* diario: chiuso, poi aperto con pagine che girano */}
          <g transform={`translate(480 ${1240 - 40 * book})`}>
            <Glow id="li-eu" x={0} y={-60} r={360} t={t} color={ACC} amp={0.15} rate={6} opacity={0.75 * eureka} />
            <ellipse cx="0" cy="22" rx="280" ry="20" fill="#000" opacity=".3" />
            {book < 0.5 ? (
              <g>
                <rect x="-150" y="-60" width="300" height="80" rx="8" fill="#4A2E24" stroke={K} strokeWidth="8" />
                <text x="0" y="-12" textAnchor="middle" fontFamily={HAND} fontSize="34" fill="#D8C49A">Come l'ho fatto</text>
              </g>
            ) : (
              <g>
                <path d="M-270 10 Q-140 -40 0 -10 Q140 -40 270 10 L270 -120 Q140 -160 0 -130 Q-140 -160 -270 -120 Z" fill="#4A2E24" stroke={K} strokeWidth="8" strokeLinejoin="round" />
                <path d="M-254 -2 Q-130 -46 0 -18 V-140 Q-130 -168 -254 -126 Z" fill="url(#li-page)" stroke={K} strokeWidth="6" />
                <path d="M254 -2 Q130 -46 0 -18 V-140 Q130 -168 254 -126 Z" fill="url(#li-page)" stroke={K} strokeWidth="6" />
                {/* schizzi tecnici sulle pagine (bobine, frecce, formule) */}
                <g fill="none" stroke="#5A5248" strokeWidth="3" opacity=".8">
                  <path d="M-220 -110 h60 v40 h-60 Z M-150 -100 l40 10 M-210 -60 q30 -20 60 0 q30 20 60 0" />
                  <path d="M60 -120 v60 M50 -110 h20 M50 -96 h20 M50 -82 h20 M50 -68 h20 M120 -110 l60 30 l-60 20" />
                </g>
                <text x="-150" y="-36" textAnchor="middle" fontFamily={HAND} fontSize="24" fill="#3A342C" transform="rotate(-6 -150 -36)">tensione!</text>
                <text x="150" y="-30" textAnchor="middle" fontFamily={HAND} fontSize="24" fill="#3A342C" transform="rotate(5 150 -30)">+ fulmine</text>
                {/* pagina che gira */}
                {flip > 0 && flip < 1 && [0, 1, 2].map((i) => {
                  const p = seg(flip, i / 3, (i + 1) / 3);
                  if (p <= 0 || p >= 1) return null;
                  return <path key={i} d={`M0 -18 Q${lerp(130, -130, p)} ${-46 - Math.sin(p * Math.PI) * 60} ${lerp(254, -254, p) * Math.cos(p * Math.PI * 0.2)} ${-2 - Math.sin(p * Math.PI) * 80} V${-126 - Math.sin(p * Math.PI) * 80} Q${lerp(130, -130, p)} ${-168 - Math.sin(p * Math.PI) * 60} 0 -140 Z`} fill="#F2ECDC" stroke={K} strokeWidth="5" />;
                })}
                <path d="M0 -140 V-18" stroke={K} strokeWidth="5" />
              </g>
            )}
          </g>
        </g>

        {/* PIANO 4 — poltrona e tenda in primo piano che incorniciano (1,25) */}
        <g transform={L(1.25)}>
          <path d="M-200 1980 V1440 Q-40 1380 120 1440 Q200 1480 200 1560 V1980 Z" fill="url(#li-front)" stroke={K} strokeWidth="10" />
          <path d="M-200 1460 Q-40 1400 110 1452" fill="none" stroke="#6B4A3A" strokeWidth="6" opacity=".7" />
          {Array.from({ length: 4 }, (_, i) => <circle key={i} cx={-120 + i * 70} cy={1500 + (i % 2) * 6} r="7" fill="#8A6A4A" />)}
          <path d={`M1280 -200 H1060 Q1000 400 ${1040 + Math.sin(t * 0.8) * 8} 900 Q1080 1400 1020 1980 H1280 Z`} fill="#2A1C1A" stroke={K} strokeWidth="10" />
          <path d={`M1080 -200 Q1030 400 ${1066 + Math.sin(t * 0.8) * 8} 900 Q1100 1400 1050 1980`} fill="none" stroke="#5A3A32" strokeWidth="6" opacity=".7" />
        </g>

        {/* PIANO 5 — pulviscolo nella luce della candela e particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 600, x0: 300, x1: 780 }} bottom={{ y: 1240, x0: 260, x1: 820 }} n={22} color={mix('#E8DCC0', '#C9F7E4', labGlow)} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="li-near" t={t} color="#E8DCC0" n={6} vx={-25} vy={-8} opacity={0.08} />
        </g>
      </g>

      <Finish id="li" tint="#5E6B75" tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): candela tirata cue0 + 0,3 · libreria aperta cue0 + 0,6 → +1,5 · richiusa di colpo cue1 + 0,1
// · riaperta cue1 + 1,2 · luce del laboratorio cue2 · diario cue3 · alba e pagine cue4 → cue5 · bagliore cue5.
