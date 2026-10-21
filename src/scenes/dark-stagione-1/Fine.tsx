import React from 'react';
import { camera, eio, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes, Smoke, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Collar, Device, K, Pines, Raincoat, TINT, Tower, YELLOW } from './Winden';

// Come finisce la stagione. Prima parte, nella grotta: l'apparecchio di ottone si accende e un anello di luce bianca si
// allarga; invece di chiudersi, il passaggio diventa un cerchio che gira. A destra la sedia di ferro: il colletto di Noah
// e l'impermeabile di Jonas finiscono lì, le lampadine si accendono, lampo. Seconda parte: Winden nel 2052, alberi spogli,
// cenere che cade, le torri della centrale crollate e una grande sfera nera sopra le rovine; a terra l'impermeabile.
// Nessuna persona.
// Eventi: l'apparecchio si accende (cue 0) · l'anello si apre (cue 1) · il cerchio gira con le frecce (cue 2)
//         · impermeabile sulla sedia, lampo (cue 3) · il 2052 (da cue 3 + 1,4).
// Piani: cielo/volta (0,25) · bosco o rovine lontane (0,45) · apparecchio, sedia, sfera (0,7) · rocce o tronchi (1,2)
//        · cenere e particelle (1,5–1,8)

const r = rng(2052);
const ASH = Array.from({ length: 70 }, () => ({ x: r() * 1300 - 110, y: r() * 2000, s: 2 + r() * 4, v: 40 + r() * 60, ph: r() * 6 }));

export const Fine: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const on = eo(seg(t, cues[0] + 0.3, cues[0] + 1.2));
  const ring = eio(seg(t, cues[1], cues[1] + 1.4));
  const loop = seg(t, cues[2], cues[2] + 0.4);
  const move = eio(seg(t, cues[3] + 0.1, cues[3] + 0.9));
  const chairOn = seg(t, cues[3] + 0.6, cues[3] + 1.0);
  const flash = flashAt(t, [cues[3] + 1.2], [1]);
  const B = seg(t, cues[3] + 1.3, cues[3] + 1.9); // 2052
  const sphere = eo(seg(t, cues[4], cues[4] + 1.2));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fi" />
        <Lin id="fi-vault" stops={[[0, '#060807'], [0.5, '#141814'], [1, '#22261F']]} />
        <Lin id="fi-floor" stops={[[0, '#2A2E28'], [1, '#0A0C0A']]} />
        <Lin id="fi-rock" x2={1} y2={0} stops={[[0, '#0C0E0C'], [1, '#24281F']]} />
        <Lin id="fi-sky" stops={[[0, '#1A1814'], [0.4, '#4A4234'], [0.62, '#7A6A50'], [1, '#5A4E3C']]} />
        <Lin id="fi-ground" stops={[[0, '#4A4234'], [1, '#14120E']]} />
        <Lin id="fi-tower" x2={1} y2={0} stops={[[0, '#6A6458'], [1, '#3A362E']]} />
        <Lin id="fi-iron" x2={1} y2={0} stops={[[0, '#4A4E4C'], [0.5, '#7A807C'], [1, '#2E3230']]} />
        <radialGradient id="fi-ring">
          <stop offset=".86" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset=".93" stopColor="#FFF6D8" stopOpacity=".9" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fi-sphere">
          <stop offset="0" stopColor="#000000" />
          <stop offset=".8" stopColor="#050505" />
          <stop offset=".9" stopColor="#3A3448" />
          <stop offset="1" stopColor="#3A3448" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ───────── PRIMA PARTE: la grotta ───────── */}
      <g opacity={1 - B}>
        <g transform={cam.transform}>
          <g transform={L(0.25)}><rect x="-200" y="-200" width="1480" height="2320" fill="url(#fi-vault)" /></g>
          <g transform={L(0.45)}>
            <path d="M-200 700 Q540 560 1280 700 V1200 H-200 Z" fill="#1A1E1A" />
            {[[200, 700, 80], [420, 650, 60], [700, 650, 70], [900, 690, 90]].map(([x, y, h], i) => <path key={i} d={`M${x - 26} ${y - 20} L${x} ${y + h} L${x + 26} ${y - 20} Z`} fill="#24281F" stroke={K} strokeWidth="6" />)}
          </g>
          <g transform={L(0.7)}>
            <path d="M-200 1160 Q540 1130 1280 1160 V2200 H-200 Z" fill="url(#fi-floor)" />
            {/* anello di luce e cerchio che gira */}
            <ellipse cx="420" cy="980" rx={lerp(60, 330, ring)} ry={lerp(60, 330, ring)} fill="url(#fi-ring)" opacity={ring > 0 ? 1 : 0} />
            <g transform={`translate(420 980) rotate(${loop * t * 90})`} opacity={loop}>
              <circle r="280" fill="none" stroke={YELLOW} strokeWidth="10" strokeDasharray="120 60" />
              {[0, 120, 240].map((a) => <path key={a} d="M290 -24 L312 6 L334 -24" fill="none" stroke={YELLOW} strokeWidth="10" strokeLinecap="round" transform={`rotate(${a}) translate(-20 0)`} />)}
            </g>
            <g transform="translate(420 1180)"><Device id="fi-dv" t={t} on={on} scale={0.9} /></g>
            {/* sedia di ferro a destra con le lampadine */}
            <g transform="translate(860 1200)">
              <path d="M-80 0 V-170 M80 0 V-170" stroke={K} strokeWidth="12" />
              <rect x="-90" y="-190" width="180" height="32" rx="6" fill="url(#fi-iron)" stroke={K} strokeWidth="7" />
              <path d="M-80 -190 V-360 Q0 -390 80 -360 V-190" fill="url(#fi-iron)" stroke={K} strokeWidth="8" />
              {[-90, -45, 0, 45, 90].map((x, i) => (
                <g key={x}>
                  <Glow id={`fi-cb${i}`} x={x} y={-420 + Math.abs(x) * 0.4} r={60} t={t} color="#FFF4D0" amp={0.2} rate={12} ph={i} opacity={0.8 * chairOn} />
                  <circle cx={x} cy={-420 + Math.abs(x) * 0.4} r="14" fill={chairOn > 0.5 ? '#FFF8E0' : '#5A5E5C'} stroke={K} strokeWidth="4" />
                </g>
              ))}
              <g transform="translate(0 -250)" opacity={seg(t, cues[3], cues[3] + 0.3)}><Collar scale={0.7} /></g>
            </g>
            {/* l'impermeabile va dalla roccia alla sedia */}
            <g transform={`translate(${lerp(150, 860, move)} ${lerp(860, 990, move)}) rotate(${move * 8})`}>
              <Raincoat id="fi-rc" t={t} scale={0.42} wind={0.4} glow={0.4} wet={false} />
            </g>
          </g>
          <g transform={L(1.2)}>
            <path d="M-200 400 H40 Q110 800 50 1200 Q10 1600 100 2200 H-200 Z" fill="url(#fi-rock)" stroke={K} strokeWidth="10" />
            <path d="M1280 400 H1040 Q990 900 1040 1300 Q1070 1700 1000 2200 H1280 Z" fill="url(#fi-rock)" stroke={K} strokeWidth="10" />
            {[[240, 1760, 120], [800, 1840, 140]].map(([x, y, rr], i) => <ellipse key={i} cx={x} cy={y} rx={rr} ry={rr * 0.5} fill="#1A1E1A" stroke={K} strokeWidth="9" />)}
          </g>
          <g transform={L(0.7)}>
            <Dust t={t} top={{ y: 760, x0: 280, x1: 560 }} bottom={{ y: 1200, x0: 200, x1: 640 }} n={30} color="#FFF1C2" boost={0.3 * on - 0.3} />
          </g>
        </g>
      </g>

      {/* ───────── SECONDA PARTE: Winden nel 2052 ───────── */}
      <g opacity={B}>
        <g transform={cam.transform}>
          <g transform={L(0.25)}>
            <rect x="-200" y="-200" width="1480" height="2320" fill="url(#fi-sky)" />
            <Glow id="fi-haze" x={540} y={1000} r={700} t={t} color="#B8A07A" amp={0.03} rate={0.8} opacity={0.35} />
          </g>
          <g transform={L(0.45)}>
            {/* torri crollate e fumanti */}
            <g transform="translate(330 1080)">
              <Tower id="fi-t1" t={t} w={240} h={260} fill="url(#fi-tower)" steam="#4A4438" steamOpacity={0.6} />
              <path d="M-90 -260 L-40 -220 L0 -270 L40 -210 L90 -260 V-250 H-90 Z" fill="#3A362E" />
            </g>
            <g transform="translate(560 1100) rotate(12)">
              <path d="M-100 0 C-60 -60 -60 -110 -70 -150 L-20 -120 L20 -170 L60 -110 L80 -130 C70 -80 70 -40 110 0 Z" fill="url(#fi-tower)" />
              <Smoke id="fi-t2" t={t} x={0} y={-140} color="#3A3428" n={6} rise={300} wind={-200} r0={30} r1={120} speed={0.14} opacity={0.6} />
            </g>
            <path d="M-200 1100 L100 1090 L140 1060 L200 1090 L700 1110 L760 1070 L820 1100 L1280 1090 V1300 H-200 Z" fill="#2A261E" />
            {/* sfera nera sopra le rovine */}
            <g transform={`translate(760 ${lerp(860, 800, sphere)}) scale(${lerp(0.4, 1, sphere)})`} opacity={sphere}>
              <circle r="170" fill="url(#fi-sphere)" />
              <circle r="150" fill="#000" />
              <path d="M-110 -80 Q-60 -130 10 -140" fill="none" stroke="#5A5468" strokeWidth="5" opacity=".6" />
            </g>
          </g>
          <g transform={L(0.7)}>
            <path d="M-200 1160 Q540 1130 1280 1170 V2200 H-200 Z" fill="url(#fi-ground)" />
            <Pines t={0} y={1180} n={6} h={300} seed={52} color="#1A1712" sway={0} x0={-100} x1={1180} />
            {/* alberi spogli */}
            {[[120, 1200], [980, 1220]].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`} stroke={K} strokeLinecap="round" fill="none">
                <path d="M0 0 V-420" strokeWidth="24" />
                <path d="M0 -200 L-90 -300 M0 -280 L80 -370 M0 -360 L-50 -440 M-60 -266 L-90 -330 M50 -340 L90 -350" strokeWidth="12" />
              </g>
            ))}
            {/* l'impermeabile a terra, coperto di cenere */}
            <g transform="translate(560 1215) rotate(-80)">
              <Raincoat id="fi-rc2" t={0} scale={0.5} wind={0} glow={0.5} wet={false} />
            </g>
            <ellipse cx="560" cy="1240" rx="200" ry="26" fill="#5A5444" opacity=".5" />
          </g>
          <g transform={L(1.2)}>
            <path d="M-200 1500 Q200 1420 500 1520 Q800 1600 1280 1480 V2200 H-200 Z" fill="#14120E" stroke={K} strokeWidth="10" />
            <path d="M-80 1560 L120 1480 L260 1600 M760 1580 L900 1500 L1040 1560" fill="none" stroke="#3A362E" strokeWidth="14" strokeLinecap="round" />
          </g>
          {/* cenere che cade */}
          <g transform={L(1.5)}>
            {ASH.map((a, i) => (
              <circle key={i} cx={a.x + Math.sin(t + a.ph) * 20} cy={mod(a.y + t * a.v, 2000) - 40} r={a.s} fill="#C9C0AE" opacity={0.6} />
            ))}
          </g>
          <g transform={L(1.8)}>
            <NearMotes id="fi-near" t={t} color="#C9C0AE" n={6} vx={-15} vy={25} opacity={0.1} />
          </g>
        </g>
      </g>

      <rect width="1080" height="1920" fill="#FFFFFF" opacity={flash * 0.6} />
      <Finish id="fi" tint={B > 0.5 ? '#5A4E3C' : TINT} tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): apparecchio cue0+0,3 · anello cue1 · cerchio che gira cue2 · impermeabile sulla sedia
// cue3+0,1, lampadine cue3+0,6, lampo cue3+1,2 · 2052 da cue3+1,3 · sfera nera cue4.
