import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Embers, Fog, Glow, Lightning, NearMotes, Notes, Smoke, Stars, flamePath, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';

// L'assedio: il castello di notte assediato da decine di torce in fila sulla collina (solo fiamme e aste, nessuna
// persona). Dalla torre del laboratorio escono le note del violino, poi una grande scarica verde-acqua tra il parafulmine
// e il cielo; alla fine le torce si fermano e si spengono una a una.
// Eventi: le torce salgono (cue 0) · note dalla torre (cue 1) · scarica e lampo verde-acqua (cue 2)
//         · le torce si spengono con un filo di fumo (cue 3).
// Piani: cielo e stelle (0,2) · monti (0,35) · castello sulla rupe (0,5) · collina con il sentiero di torce (0,7)
//        · albero secco e staccionata in primo piano (1,2) · braci, nebbia, particelle (1,5–1,8)

const K = '#0B0C0E';
const ACC = '#8EF0C8';
const r = rng(1974);
// sentiero a zig-zag dalla valle al castello: le torce avanzano lungo il percorso
const PATH: [number, number][] = [[1120, 1500], [700, 1380], [260, 1290], [600, 1190], [820, 1120], [560, 1050]];
const at = (u: number): [number, number] => {
  const n = PATH.length - 1;
  const k = Math.min(n - 1, Math.floor(u * n));
  const p = u * n - k;
  return [lerp(PATH[k][0], PATH[k + 1][0], p), lerp(PATH[k][1], PATH[k + 1][1], p)];
};
const TORCHES = Array.from({ length: 22 }, (_, i) => ({ u0: i / 22 * 0.62, ph: r() * 6, out: 0.05 + r() * 1.6, dx: (r() - 0.5) * 30 }));

export const Assedio: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const march = eo(seg(t, 0, cues[3])) * 0.3;
  const violin = seg(t, cues[1], cues[1] + 0.4) * (1 - seg(t, cues[2] + 0.4, cues[2] + 1.0));
  const zap = seg(t, cues[2] + 0.1, cues[2] + 1.6);
  const zapOn = zap > 0 && zap < 1 ? 1 : 0;
  const flash = flashAt(t, [cues[2] + 0.1, cues[2] + 0.9], [1, 0.7]);
  const calm = seg(t, cues[3], dur);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="as" />
        <Lin id="as-sky" stops={[[0, '#05060A'], [0.3, '#10141B'], [0.55, '#212833'], [0.68, '#2E3743']]} />
        <Lin id="as-mtn" stops={[[0, '#1E242C'], [1, '#12161B']]} />
        <Lin id="as-rock" x2={1} y2={0} stops={[[0, '#1A1E24'], [0.6, '#2C333C'], [1, '#3E4652']]} />
        <Lin id="as-wall" x2={1} y2={0} stops={[[0, '#2A3038'], [0.6, '#3E4650'], [1, '#262B32']]} />
        <Lin id="as-hill" stops={[[0, '#1A1E22'], [1, '#0A0C0E']]} />
        <Lin id="as-front" stops={[[0, '#121417'], [1, '#050607']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno con stelle (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#as-sky)" />
          <Stars t={t} seed={33} n={40} y={60} h={700} color="#E8ECEF" />
          <rect x="-200" y="-200" width="1480" height="2320" fill="#CFF5E6" opacity={flash * 0.28} />
          <Fog id="as-cl" t={t} y={560} x={300} rx={600} ry={50} color="#1C2229" opacity={0.9} speed={0.2} drift={60} />
        </g>

        {/* PIANO 1 — catena di monti (0,35) */}
        <g transform={L(0.35)}>
          <path d="M-200 960 L-20 820 L140 900 L300 780 L480 880 L640 800 L820 900 L1000 820 L1280 940 V1300 H-200 Z" fill="url(#as-mtn)" />
          <path d="M300 780 L340 820 M640 800 L680 840 M1000 820 L1040 850" stroke="#4E5864" strokeWidth="4" opacity=".7" />
        </g>

        {/* PIANO 2 — castello sulla rupe con la torre del laboratorio (0,5) */}
        <g transform={L(0.5, 0, 70)}>
          <path d="M240 1100 Q300 940 380 900 L420 820 H700 L740 900 Q820 960 880 1100 Z" fill="url(#as-rock)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          <path d="M700 820 L740 900 Q820 960 880 1100" fill="none" stroke="#7E8894" strokeWidth="4" opacity=".6" />
          <g stroke={K} strokeWidth="7" strokeLinejoin="round">
            <path d="M380 830 V690 H740 V830 Z" fill="url(#as-wall)" />
            <path d="M380 690 h30 v-24 h30 v24 h30 v-24 h30 v24 h30 v-24 h30 v24 h30 v-24 h30 v24 h30 v-24 h30 v24 h30 v-24 h30 v24" fill="none" />
            <path d="M330 830 V610 H410 V830 Z" fill="url(#as-wall)" />
            <path d="M320 612 L370 520 L420 612 Z" fill="#1A1E24" />
            {/* torre del laboratorio, più alta */}
            <path d="M660 830 V560 H760 V830 Z" fill="url(#as-wall)" />
            <path d="M650 562 h120 v-22 h-120 Z" fill="#2A3038" />
          </g>
          <path d="M710 540 V470" stroke={K} strokeWidth="8" />
          <circle cx="710" cy="466" r="8" fill="#9AA2A9" stroke={K} strokeWidth="4" />
          {/* finestre */}
          {[[440, 750], [520, 750], [600, 750], [370, 680]].map(([x, y], i) => (
            <g key={i}>
              <Glow id={`as-w${i}`} x={x} y={y} r={34} t={t} color="#F0D9A8" amp={0.15} rate={2 + i * 0.4} opacity={0.5} />
              <rect x={x - 9} y={y - 14} width="18" height="28" rx="9" fill="#F4E2B4" opacity=".8" />
            </g>
          ))}
          <Glow id="as-lab" x={710} y={640} r={110 + 120 * zapOn} t={t} color={zapOn ? ACC : '#F0D9A8'} amp={0.2} rate={8} opacity={0.6 + 0.3 * zapOn} />
          <rect x="690" y="610" width="40" height="64" rx="20" fill={zapOn ? '#E6FFF6' : '#F4E2B4'} stroke={K} strokeWidth="5" />
          {/* scarica dal parafulmine */}
          {zapOn > 0 && (
            <g>
              <Glow id="as-zap" x={710} y={460} r={220} t={t} color={ACC} amp={0.3} rate={18} opacity={0.8 * (1 - zap)} />
              <Lightning x={710} y={-120} h={590} flash={1 - zap * 0.6} seed={Math.floor(t * 10)} color="#F2FFF9" width={9} />
              <Lightning x={710} y={-120} h={590} flash={0.5 * (1 - zap)} seed={Math.floor(t * 10) + 3} color={ACC} width={18} />
            </g>
          )}
        </g>

        {/* PIANO 3 — collina con il sentiero e la fila di torce (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1130 Q200 1040 540 1060 Q860 1080 1280 1020 V2200 H-200 Z" fill="url(#as-hill)" stroke={K} strokeWidth="6" />
          <path d={`M${PATH.map((p) => p.join(' ')).join(' L')}`} fill="none" stroke="#2A3038" strokeWidth="26" strokeLinejoin="round" strokeLinecap="round" opacity=".8" />
          {TORCHES.map((tc, i) => {
            const [x, y] = at(Math.min(1, tc.u0 + march));
            const off = seg(t, cues[3] + tc.out * 0.8, cues[3] + tc.out * 0.8 + 0.3);
            const s = lerp(1.2, 0.55, (1300 - y) / -250 > 0 ? 0 : (1500 - y) / 450);
            const bob = Math.sin(t * 6 + tc.ph) * 4 * (1 - calm);
            const tilt = lerp(0, 28, off);
            return (
              <g key={i} transform={`translate(${x + tc.dx} ${y + bob}) scale(${s}) rotate(${tilt})`}>
                <path d="M0 0 V-70" stroke="#3A2E24" strokeWidth="7" strokeLinecap="round" />
                <path d="M0 0 V-70" stroke={K} strokeWidth="11" strokeLinecap="round" opacity=".4" />
                {off < 1 && (
                  <g opacity={1 - off}>
                    <Glow id={`as-tg${i}`} x={0} y={-90} r={80} t={t + tc.ph} color="#F3C98A" amp={0.2} rate={9} opacity={0.6} />
                    <path d={flamePath(0, -66, 14, 50, t, tc.ph)} fill="#E8A456" stroke={K} strokeWidth="3" />
                    <path d={flamePath(0, -66, 7, 28, t, tc.ph + 1)} fill="#FFE6A8" />
                  </g>
                )}
                {off > 0 && <Smoke id={`as-sm${i}`} t={t + tc.ph} x={0} y={-74} n={4} rise={100} wind={20} r0={8} r1={30} speed={0.7} color="#9AA2A9" opacity={0.6 * off} />}
              </g>
            );
          })}
        </g>

        {/* PIANO 4 — albero secco e staccionata in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1700 Q200 1620 600 1690 Q900 1740 1280 1660 V2200 H-200 Z" fill="url(#as-front)" stroke={K} strokeWidth="8" />
          <g stroke="#262B31" strokeLinecap="round" fill="none">
            <path d="M-20 1720 Q0 1300 40 1000 Q60 860 30 700" strokeWidth="40" />
            <path d="M30 1100 Q120 1000 240 980 M50 900 Q140 820 180 700 M30 780 Q-40 700 -60 600 M180 700 Q220 660 260 660 M240 980 Q300 970 330 930" strokeWidth="16" />
          </g>
          {[760, 880, 1000, 1120].map((x, i) => (
            <g key={x}>
              <path d={`M${x} ${1690 - i * 6} V${1540 - i * 6}`} stroke="#2A2420" strokeWidth="20" strokeLinecap="round" />
              <path d={`M${x} ${1690 - i * 6} V${1540 - i * 6}`} stroke={K} strokeWidth="26" strokeLinecap="round" opacity=".3" />
            </g>
          ))}
          <path d="M740 1580 L1140 1556 M740 1640 L1140 1616" stroke="#2A2420" strokeWidth="14" />
        </g>

        {/* PIANO 5 — note, braci delle torce, nebbia, particelle (1,5–1,8) */}
        <g transform={L(0.5, 0, 70)} opacity={violin}>
          <Notes t={t} x={710} y={600} n={6} color="#E8DDBF" outline={K} rise={300} spread={240} speed={0.35} size={0.8} />
        </g>
        <g transform={L(1.4)} opacity={1 - calm}>
          <Embers t={t} x={600} y={1300} w={700} h={400} n={24} seed={12} hot="#FFE6A8" warm="#E8A456" drift={60} />
        </g>
        <g transform={L(1.5)}>
          <Fog id="as-fog" t={t} y={1460} x={540} rx={900} ry={90} color="#3A424C" opacity={0.35} speed={0.3} drift={100} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="as-near" t={t} color="#DDE2E6" n={6} vx={-30} vy={-8} opacity={0.07} />
        </g>
      </g>

      <Finish id="as" tint="#5E6B75" tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): torce in marcia da 0 a cue3 · note dalla torre cue1 → cue2 + 1 · scarica e lampi cue2 + 0,1
// e cue2 + 0,9 · torce che si spengono da cue3 (sfasate fino a ~1,3 s).
