import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Chiavi, K, Lampada, OthersDefs, Ombra, Porta, Tenda } from './Comuni';

// I fantasmi sono loro: la camera dei bambini di notte, nel 1945. Due lettini rifatti ai lati della finestra con le
// tende chiuse, il comodino con la lampada; a terra, al centro, un cuscino caduto.
// Eventi: prima frase la lampada a petrolio si affievolisce e il cuscino a terra resta nella sua luce; seconda frase la
// lampada si spegne e, alla fine della frase, un solo lampo bianco (lo sparo, mai mostrato); terza frase la porta a
// destra si socchiude, la luce calda di una lampada entra sul pavimento fino ai lettini e il mazzo di chiavi della
// governante pende dalla maniglia (i domestici che volevano farle capire). Nessuna persona.
// Piani: parete e finestra chiusa (0,3) · lettini, comodino, porta (0,6) · pavimento e cuscino (0,85)
//        · bordo del letto in primo piano (1,2) · pulviscolo (1,5–1,8)

export const Verita: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const dim = 1 - 0.45 * seg(t, cues[0] + 0.5, cues[1]) - 0.55 * eio(seg(t, cues[1] + 0.2, cues[1] + 0.9));
  const shot = cues[1] + (cues[2] - cues[1]) * 0.72;
  const flash = flashAt(t, [shot], [1]);
  const door = eo(seg(t, cues[2] + 0.4, cues[2] + 1.8));
  const night = 1 - dim;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ve" />
        <OthersDefs id="ve" />
        <Lin id="ve-wall" stops={[[0, '#0C1014'], [0.4, '#1E262A'], [0.75, '#2A3236'], [1, '#161C1E']]} />
        <Lin id="ve-floor" stops={[[0, '#3A2A1A'], [0.5, '#22180E'], [1, '#0A0604']]} />
        <Lin id="ve-sheet" stops={[[0, '#ECEAE0'], [1, '#A8ACA2']]} />
        <Lin id="ve-iron" x2={1} y2={0} stops={[[0, '#1A1E20'], [0.5, '#6A7276'], [1, '#1A1E20']]} />
        <linearGradient id="ve-spill" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD890" stopOpacity=".75" />
          <stop offset=".7" stopColor="#FFD890" stopOpacity=".2" />
          <stop offset="1" stopColor="#FFD890" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete e finestra con le tende chiuse, un filo di luna (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ve-wall)" />
          {Array.from({ length: 50 }, (_, i) => {
            const x = -160 + (i % 10) * 150 + (Math.floor(i / 10) % 2) * 75, y = 600 + Math.floor(i / 10) * 110;
            return y < 1100 && <circle key={i} cx={x} cy={y} r="10" fill="none" stroke="#3A4A50" strokeWidth="3" opacity=".35" />;
          })}
          <rect x="380" y="640" width="320" height="420" fill="#0A1018" stroke={K} strokeWidth="8" />
          <Tenda id="ve" x={360} y={610} w={182} h={480} t={t} side="left" folds={4} />
          <Tenda id="ve" x={538} y={610} w={182} h={480} t={t} side="right" folds={4} />
          <Glow id="ve-moon" x={540} y={700} r={260} t={t} color="#9AB0C8" amp={0.03} rate={0.7} opacity={0.2 + 0.3 * night} />
          <rect x="340" y="596" width="400" height="16" rx="8" fill="url(#ve-brass)" stroke={K} strokeWidth="4" />
          <path d="M-200 1150 H1280" stroke="#2A1E14" strokeWidth="18" />
        </g>

        {/* PIANO 1 — lettini, comodino con la lampada, porta a destra (0,6) */}
        <g transform={L(0.6)}>
          <path d="M-200 1150 H1280 V2200 H-200 Z" fill="url(#ve-floor)" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M-200 ${1170 + i * i * 10} H1280`} stroke="#000" strokeWidth="3" opacity=".3" />)}
          {/* porta che si socchiude */}
          <Porta id="ve" x={840} y={1160} w={210} h={500} withKey={false} open={door * 0.6} behind="#FFD890" />
          <g opacity={door}><Chiavi id="ve" x={1012} y={930} s={0.7} swing={8} t={t} /></g>
          {[[60, 1], [720, -1]].map(([bx, d], i) => (
            <g key={i}>
              <Ombra id="ve" x={bx + 150} y={1330} rx={220} ry={22} />
              <path d={`M${bx + (d > 0 ? 20 : 280)} 1320 V990 Q${bx + 150} 940 ${bx + (d > 0 ? 280 : 20)} 990 V1320`} stroke={K} strokeWidth="16" fill="none" />
              <path d={`M${bx + (d > 0 ? 20 : 280)} 1320 V990 Q${bx + 150} 940 ${bx + (d > 0 ? 280 : 20)} 990 V1320`} stroke="url(#ve-iron)" strokeWidth="7" fill="none" />
              {[80, 150, 220].map((x) => <path key={x} d={`M${bx + x} 975 V1130`} stroke={K} strokeWidth="6" />)}
              <path d={`M${bx} 1130 H${bx + 300} V1260 Q${bx + 150} 1280 ${bx} 1260 Z`} fill="url(#ve-sheet)" stroke={K} strokeWidth="7" />
              <path d={`M${bx} 1180 H${bx + 300} V1300 Q${bx + 150} 1320 ${bx} 1300 Z`} fill="#4A3A5A" stroke={K} strokeWidth="7" />
              {/* un cuscino solo: l'altro è a terra */}
              {i === 1 && <path d={`M${bx + 70} 1140 Q${bx + 60} 1096 ${bx + 110} 1092 H${bx + 200} Q${bx + 246} 1096 ${bx + 236} 1140 Q${bx + 150} 1150 ${bx + 70} 1140 Z`} fill="#F2F0E6" stroke={K} strokeWidth="6" />}
            </g>
          ))}
          {/* comodino e lampada che si spegne */}
          <rect x="455" y="1080" width="170" height="170" fill="url(#ve-wood)" stroke={K} strokeWidth="7" />
          <rect x="445" y="1066" width="190" height="22" rx="5" fill="url(#ve-wood)" stroke={K} strokeWidth="6" />
          <Lampada id="ve" x={540} y={1068} t={t} s={0.6} lit={dim} glow={dim} ph={0.4} />
        </g>

        {/* PIANO 2 — luce calda dalla porta e il cuscino caduto (0,85) */}
        <g transform={L(0.85)}>
          <path d={`M860 1170 L1050 1170 L${lerp(1000, 760, door)} 1300 L${lerp(900, 380, door)} 1290 Z`} fill="url(#ve-spill)" opacity={door} />
          <g transform="translate(560 1236) rotate(-6) scale(.78)">
            <Ombra id="ve" x={0} y={30} rx={200} ry={24} />
            <path d="M-170 24 Q-190 -40 -120 -54 H120 Q190 -40 170 24 Q0 44 -170 24 Z" fill="#F2F0E6" stroke={K} strokeWidth="8" />
            <path d="M-130 -20 Q0 -40 130 -20" stroke="#B8BCB0" strokeWidth="5" fill="none" />
            <path d="M-60 -10 Q-20 10 30 -6 M40 6 Q80 -10 110 4" stroke="#C8CCC0" strokeWidth="4" fill="none" />
            <path d="M-150 -30 Q-110 -50 -60 -48" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".7" />
          </g>
          <Glow id="ve-pil" x={560} y={1220} r={240} t={t} color="#FFD890" amp={0.04} rate={2} opacity={0.35 * Math.max(dim, door)} />
        </g>

        {/* PIANO 3 — sponda di ferro di un letto in primo piano in basso (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-100 1680 Q300 1620 700 1700" stroke={K} strokeWidth="26" fill="none" />
          <path d="M-100 1680 Q300 1620 700 1700" stroke="url(#ve-iron)" strokeWidth="12" fill="none" />
          {[40, 180, 320, 460, 600].map((x) => <path key={x} d={`M${x} ${1660 + Math.abs(x - 300) * 0.06} V2000`} stroke={K} strokeWidth="14" />)}
          <circle cx="-60" cy="1676" r="26" fill="url(#ve-brass)" stroke={K} strokeWidth="6" />
        </g>

        {/* PIANO 4 — pulviscolo (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 900, x0: 480, x1: 600 }} bottom={{ y: 1500, x0: 300, x1: 900 }} seed={10} n={24} color="#FFE0A0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="ve-near" t={t} color="#C8D0D8" n={6} opacity={0.07} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#020406" opacity={0.3 * night * (1 - door * 0.5)} />
      <rect width="1080" height="1920" fill="#FFFFFF" opacity={0.85 * flash} />
      <Finish id="ve" tint="#1E2A3A" tintOpacity={0.13} />
    </svg>
  );
};
