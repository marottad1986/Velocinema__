import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Drips, Glow, NearMotes, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs, K, Ombra, ORO } from './Comuni';

// La vasca e l'acido: il corridoio al piano terra della casa di Jesse, visto dal soggiorno. Eventi: prima frase sul
// soffitto si allarga una macchia scura e cominciano a cadere gocce che fumano (al piano di sopra Jesse sta usando
// l'acido); seconda frase si accende la luce sul bidone di plastica blu rimasto nell'angolo, quello giusto, mai
// usato; terza frase il soffitto cede: la vasca da bagno corrosa precipita, si spacca sul pavimento e una melma scura
// che fuma si allarga, tra calcinacci e polvere.
// Piani: parete del fondo con la porta (0,3) · pareti del corridoio e soffitto (0,5) · vasca, bidone, tanica (0,72)
//        · stipiti e divano in primo piano (1,2) · polvere e calcinacci vicini (1,5–1,8)

const r = rng(6606);
const DEBRIS = Array.from({ length: 22 }, () => ({ x: 380 + r() * 360, vx: (r() - 0.5) * 300, s: 10 + r() * 22, a: r() * 360, d: r() * 0.25 }));
const MOTES = Array.from({ length: 26 }, () => ({ x: 300 + r() * 520, y: r(), s: 2 + r() * 4, sp: 0.15 + r() * 0.2 }));

export const Acido: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const stain = eo(seg(t, griglia(cues[0] + 0.1), griglia(cues[1] + 1.5)));
  const drum = eo(seg(t, griglia(cues[1] + 0.2), griglia(cues[1] + 0.2) + 0.5));
  const tFall = griglia(cues[2] + 0.4);
  const fall = seg(t, tFall, tFall + 0.45);
  const landed = t >= tFall + 0.45;
  const tubY = lerp(560, 1150, fall * fall);
  const crack = eo(seg(t, tFall - 0.6, tFall));
  const ooze = eo(seg(t, tFall + 0.45, tFall + 1.6));
  const sh = t > tFall + 0.45 && t < tFall + 0.8 ? Math.sin(t * 80) * 8 * (1 - seg(t, tFall + 0.45, tFall + 0.8)) : 0;
  const hole = t >= tFall;
  const bulb = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 5.3);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ac" />
        <BBDefs id="ac" />
        <Lin id="ac-back" stops={[[0, '#2A2418'], [0.5, '#5A4A30'], [1, '#3A3020']]} />
        <Lin id="ac-wallL" x2={1} y2={0} stops={[[0, '#2A2218'], [1, '#6A5A3C']]} />
        <Lin id="ac-wallR" x2={1} y2={0} stops={[[0, '#7A6A48'], [1, '#2A2218']]} />
        <Lin id="ac-ceil" stops={[[0, '#1E1A14'], [1, '#4A4030']]} />
        <Lin id="ac-floor" stops={[[0, '#4A3826'], [0.5, '#2E2216'], [1, '#120C08']]} />
        <Lin id="ac-tub" x2={1} y2={0} stops={[[0, '#C8C4B8'], [0.4, '#F2EEE4'], [1, '#8A867A']]} />
        <radialGradient id="ac-goo" cx=".5" cy=".4" r=".6"><stop offset="0" stopColor="#6A4A28" /><stop offset=".7" stopColor="#3A2814" /><stop offset="1" stopColor="#24180C" /></radialGradient>
        <radialGradient id="ac-stain"><stop offset="0" stopColor="#120C04" stopOpacity="1" /><stop offset=".6" stopColor="#3A2810" stopOpacity=".8" /><stop offset="1" stopColor="#5A4220" stopOpacity="0" /></radialGradient>
      </defs>

      <g transform={cam.transform}>
        <g transform={`translate(0 ${sh})`}>
          {/* PIANO 0 — parete di fondo con la porta e una finestrella (0,3) */}
          <g transform={L(0.3)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="#1A1610" />
            <rect x="340" y="720" width="440" height="460" fill="url(#ac-back)" stroke={K} strokeWidth="6" />
            <rect x="480" y="850" width="140" height="330" fill="#2A1E12" stroke={K} strokeWidth="6" />
            <circle cx="600" cy="1020" r="7" fill="#C8A060" />
            <rect x="660" y="860" width="80" height="70" fill="#1E2A3A" stroke={K} strokeWidth="5" />
            <Glow id="ac-win" x={700} y={895} r={90} t={t} color="#8AA8D8" amp={0.03} rate={1} opacity={0.4} />
          </g>

          {/* PIANO 1 — pareti del corridoio, soffitto con la macchia e il buco, applique (0,5) */}
          <g transform={L(0.5)}>
            <path d="M-200 560 L340 720 V1180 L-200 1500 Z" fill="url(#ac-wallL)" stroke={K} strokeWidth="6" />
            <path d="M1280 560 L780 720 V1180 L1280 1500 Z" fill="url(#ac-wallR)" stroke={K} strokeWidth="6" />
            <path d="M-200 560 L340 720 H780 L1280 560 V420 H-200 Z" fill="url(#ac-ceil)" stroke={K} strokeWidth="6" />
            {/* quadretto storto e interruttore */}
            <g transform="translate(120 860) skewY(16)">
              <rect x="-60" y="-50" width="120" height="90" fill="#5A4A30" stroke={K} strokeWidth="5" />
              <rect x="-48" y="-38" width="96" height="66" fill="#3A5A6A" />
              <path d="M-48 20 L-10 -10 L20 10 L48 -20 V28 H-48 Z" fill="#6A8A5A" />
            </g>
            {/* applique sulla parete destra */}
            <g transform="translate(900 860)">
              <Glow id="ac-bulb" x={0} y={0} r={260} t={t} color="#FFC870" amp={0.04} rate={9} opacity={0.6 * bulb} />
              <path d="M-30 -40 L30 -40 L20 20 H-20 Z" fill="#E8D8A8" stroke={K} strokeWidth="5" opacity=".95" />
              <circle cx="0" cy="12" r="14" fill="#FFF0C0" />
            </g>
            {/* macchia di acido che si allarga sul soffitto e gocce */}
            <ellipse cx="560" cy="645" rx={60 + 210 * stain} ry={16 + 44 * stain} fill="url(#ac-stain)" />
            <ellipse cx="560" cy="648" rx={20 + 90 * stain} ry={6 + 16 * stain} fill="#5A4420" opacity={0.8 * stain} />
            {!hole && stain > 0.2 && <Drips t={t} x={560} y0={660} y1={1160} n={2} period={1.1} color="#8A6A3A" ripple={30} />}
            {!hole && stain > 0.5 && <Drips t={t} x={500} y0={655} y1={1160} n={1} period={1.5} color="#8A6A3A" ripple={24} />}
            {/* crepe e buco */}
            <g opacity={crack}>
              <path d="M560 640 L470 600 L420 610 M560 640 L650 590 L700 600 M560 640 L520 690 M560 640 L640 680" stroke={K} strokeWidth="5" fill="none" />
            </g>
            {hole && (
              <g>
                <path d="M350 650 L400 600 L470 620 L520 580 L600 600 L680 570 L750 620 L790 670 L700 700 L620 680 L540 710 L440 690 Z" fill="#0A0806" stroke={K} strokeWidth="7" />
                {/* tubi e assi spezzate che pendono */}
                <path d="M420 690 L400 760 M700 700 L730 780" stroke="#7A5A34" strokeWidth="18" strokeLinecap="round" />
                <path d="M600 690 Q620 740 590 780" stroke="url(#ac-metal)" strokeWidth="12" fill="none" />
                <Drips t={t} x={590} y0={790} y1={1160} n={2} period={0.9} color="#6A4A28" ripple={30} />
              </g>
            )}
          </g>

          {/* PIANO 2 — pavimento, bidone giusto, tanica di acido, la vasca che cade (0,72) */}
          <g transform={L(0.72)}>
            <path d="M-200 1500 L340 1180 H780 L1280 1500 V2200 H-200 Z" fill="url(#ac-floor)" />
            {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${340 + i * 55} 1180 L${-200 + i * 185} 2200`} stroke="#1A120A" strokeWidth="4" opacity=".7" />)}
            {/* bidone di plastica blu: quello che andava usato */}
            <g transform="translate(900 1270)">
              <Glow id="ac-drum" x={0} y={-150} r={240} t={t} color={ORO} amp={0.05} rate={2} opacity={0.5 * drum} />
              <Ombra id="ac" x={0} y={0} rx={130} ry={16} />
              <path d="M-90 0 V-290 A90 22 0 0 1 90 -290 V0 A90 22 0 0 1 -90 0 Z" fill="#2E6AB0" stroke={K} strokeWidth="8" />
              <path d="M-90 0 V-290 A90 22 0 0 1 90 -290 V0" fill="url(#ac-rvside)" />
              <ellipse cx="0" cy="-290" rx="90" ry="22" fill="#4A86C8" stroke={K} strokeWidth="6" />
              <ellipse cx="40" cy="-292" rx="14" ry="5" fill="#1E4A80" stroke={K} strokeWidth="3" />
              {[-210, -100].map((y) => <path key={y} d={`M-90 ${y} A90 22 0 0 0 90 ${y}`} stroke="#1E4A80" strokeWidth="10" fill="none" />)}
              <path d="M-66 -280 V-10" stroke="#8AB8E8" strokeWidth="8" opacity=".6" />
              <rect x="-50" y="-180" width="80" height="54" fill="#F2F0E8" stroke={K} strokeWidth="4" />
              <path d="M-40 -164 h60 M-40 -150 h44 M-40 -136 h52" stroke="#5A5A5A" strokeWidth="3" />
              <path d="M-90 0 V-290 A90 22 0 0 1 90 -290 V0 A90 22 0 0 1 -90 0 Z" fill="none" stroke={ORO} strokeWidth="8" opacity={drum} />
            </g>
            {/* melma che si allarga e fuma */}
            {landed && (
              <g>
                <ellipse cx="560" cy="1200" rx={140 + 300 * ooze} ry={30 + 70 * ooze} fill="url(#ac-goo)" stroke={K} strokeWidth="5" />
                <ellipse cx="520" cy="1185" rx={60 + 90 * ooze} ry={10 + 16 * ooze} fill="#8A6A40" opacity=".6" />
                {[0, 1, 2, 3].map((k) => {
                  const p = mod(t * 0.8 + k * 0.25, 1);
                  return <circle key={k} cx={400 + k * 90} cy={1200 - p * 6} r={6 + p * 10} fill="none" stroke="#A88A5A" strokeWidth="3" opacity={(1 - p) * ooze} />;
                })}
                <Wisps t={t} x={480} y={1190} color="#C8B898" n={3} h={200} opacity={0.5 * ooze} />
                <Wisps t={t + 1.3} x={640} y={1200} color="#C8B898" n={3} h={220} opacity={0.5 * ooze} />
              </g>
            )}
            {/* tanica di acido con il simbolo di pericolo */}
            <g transform="translate(250 1290)">
              <Ombra id="ac" x={0} y={0} rx={100} ry={14} />
              <path d="M-70 0 V-170 Q-70 -186 -54 -186 H30 L50 -210 H70 V0 Z" fill="#DDE2DA" stroke={K} strokeWidth="7" />
              <rect x="-50" y="-140" width="96" height="96" fill="#F2F0E8" stroke={K} strokeWidth="4" />
              <g transform="translate(-2 -92) rotate(45)">
                <rect x="-30" y="-30" width="60" height="60" fill="#F28A1A" stroke={K} strokeWidth="4" />
              </g>
              <text x="-2" y="-76" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="40" fill={K}>!</text>
              <text x="-2" y="-28" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="20" fill="#C82A1A">ACIDO</text>
            </g>
            {/* la vasca: cade dal buco e si spacca */}
            {t >= tFall && (
              <g transform={`translate(560 ${tubY}) rotate(${landed ? 6 : lerp(-4, 6, fall)})`}>
                {landed && <Ombra id="ac" x={0} y={10} rx={260} ry={26} />}
                <path d="M-230 -150 H230 Q240 -150 236 -130 L214 -20 Q206 10 170 10 H-170 Q-206 10 -214 -20 L-236 -130 Q-240 -150 -230 -150 Z" fill="url(#ac-tub)" stroke={K} strokeWidth="9" />
                <path d="M-232 -150 H232" stroke="#FFFFFF" strokeWidth="6" opacity=".7" />
                {/* bordo corroso, macchie e piedini */}
                <path d="M-120 -150 L-100 -120 L-80 -150 M60 -150 L90 -110 L110 -150" fill="#3A2814" stroke={K} strokeWidth="4" />
                <path d="M-150 -80 Q-90 -40 -40 -90 Q20 -50 80 -96" stroke="#6A4A28" strokeWidth="10" fill="none" opacity=".7" />
                {landed && <path d="M-20 -150 L10 -90 L-10 -40 L20 10" stroke={K} strokeWidth="7" fill="none" />}
                {[-180, 180].map((fx) => <path key={fx} d={`M${fx - 18} 6 q18 34 36 0`} fill="url(#ac-metal)" stroke={K} strokeWidth="5" />)}
                <circle cx="190" cy="-120" r="10" fill="url(#ac-metal)" stroke={K} strokeWidth="3" />
              </g>
            )}
            {/* calcinacci che cadono e rimbalzano */}
            {t >= tFall && DEBRIS.map((d, i) => {
              const p = seg(t, tFall + d.d, tFall + d.d + 0.9);
              const y = p < 0.6 ? lerp(640, 1180, (p / 0.6) ** 2) : 1180 - Math.sin(((p - 0.6) / 0.4) * Math.PI) * 30;
              return <rect key={i} x={d.x + d.vx * p} y={y - d.s} width={d.s} height={d.s * 0.7} fill={i % 3 ? '#B8A888' : '#7A5A34'} stroke={K} strokeWidth="3" transform={`rotate(${d.a + p * 200} ${d.x + d.vx * p} ${y})`} />;
            })}
          </g>

          {/* PIANO 3 — stipite della porta del soggiorno e divano in primo piano (1,2) */}
          <g transform={L(1.2)}>
            <rect x="-160" y="-200" width="220" height="2400" fill="#2A1E12" stroke={K} strokeWidth="10" />
            <path d="M50 -200 V2200" stroke="#8A6A44" strokeWidth="6" opacity=".7" />
            <rect x="1010" y="-200" width="240" height="2400" fill="#2A1E12" stroke={K} strokeWidth="10" />
            <path d="M1020 -200 V2200" stroke="#8A6A44" strokeWidth="6" opacity=".7" />
            {/* schienale del divano */}
            <path d="M-100 1960 V1720 Q-100 1660 -40 1660 H1120 Q1180 1660 1180 1720 V1960 Z" fill="#5A3424" stroke={K} strokeWidth="10" />
            <path d="M-80 1680 H1160" stroke="#8A5A40" strokeWidth="6" opacity=".7" />
            {[260, 560, 860].map((x) => <path key={x} d={`M${x} 1680 V1960`} stroke="#3A2014" strokeWidth="6" />)}
            {/* lattine e scatola di pizza sul divano */}
            <rect x="180" y="1600" width="50" height="70" rx="6" fill="#C83A2A" stroke={K} strokeWidth="5" />
            <path d="M600 1660 L640 1600 H860 L840 1660 Z" fill="#D8B888" stroke={K} strokeWidth="6" />
          </g>

          {/* PIANO 4 — polvere che scende nel fascio della lampada (1,5–1,8) */}
          <g transform={L(1.5)}>
            {MOTES.map((m, i) => {
              const y = 640 + mod(m.y + t * m.sp, 1) * 700;
              return <circle key={i} cx={m.x + Math.sin(t + i) * 10} cy={y} r={m.s} fill="#E8D8B8" opacity={0.25 + 0.5 * (hole ? 1 : 0.3)} />;
            })}
          </g>
          <g transform={L(1.8)}>
            <NearMotes id="ac-near" t={t} color="#E8D8B8" n={7} r0={70} r1={170} opacity={0.1 + (hole ? 0.08 : 0)} vy={30} />
          </g>
        </g>
      </g>
      <Finish id="ac" tint="#4A3A1E" tintOpacity={0.12} />
    </svg>
  );
};
