import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Glow, NearMotes, Smoke, Stars } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs, Cespuglio, K, Ombra, ORO } from './Comuni';

// Il blitz dell'antidroga: una strada di periferia di Albuquerque di notte. Eventi: prima frase arrivano le luci rosse e
// blu delle auto della polizia (l'antidroga di Hank) e spazzano le facciate; seconda frase dal tetto della casa esce il
// fumo chimico del laboratorio clandestino e la finestra del garage si accende di giallo; terza frase la finestra del
// primo piano si spalanca, la tenda sventola fuori e un berretto di lana cade sul prato: qualcuno è scappato (Jesse).
// Piani: cielo con le stelle e i monti Sandia (0,25) · case lontane e lampioni (0,45) · la casa del blitz (0,65)
//        · auto della polizia, prato e cassetta postale (1,0) · recinzione e yucca in primo piano (1,3) · falene (1,6–1,8)

const r = rng(2202);
const FAR = Array.from({ length: 9 }, (_, i) => ({ x: -120 + i * 150 + r() * 30, w: 130 + r() * 30, h: 70 + r() * 40, lit: r() > 0.45 }));

/** Luce lampeggiante: 0–1 per il rosso e per il blu, alternati (circa 1,5 lampi al secondo per colore). */
const lamp = (t: number, ph: number) => {
  const p = mod(t * 1.5 + ph, 1);
  return { red: p < 0.5 ? Math.sin((p / 0.5) * Math.PI) : 0, blue: p >= 0.5 ? Math.sin(((p - 0.5) / 0.5) * Math.PI) : 0 };
};

export const Blitz: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const arrive = eo(seg(t, griglia(cues[0] + 0.2), griglia(cues[0] + 0.2) + 1.0));
  const smoke = eo(seg(t, griglia(cues[1] + 0.1), griglia(cues[1] + 0.1) + 1.4));
  const tOpen = griglia(cues[2] + 0.3);
  const open = eo(seg(t, tOpen, tOpen + 0.35));
  // berretto: cade dal davanzale (y 900) al prato (y 1300) con un rimbalzo
  const fall = seg(t, tOpen + 0.2, tOpen + 1.0);
  const bounce = seg(t, tOpen + 1.0, tOpen + 1.4);
  const capY = fall < 1 ? lerp(890, 1300, fall * fall) : 1300 - Math.sin(bounce * Math.PI) * 30;
  const capX = lerp(850, 760, eo(seg(t, tOpen + 0.2, tOpen + 1.4)));
  const capRot = lerp(0, 200, eo(seg(t, tOpen + 0.2, tOpen + 1.4)));
  const l1 = lamp(t, 0), l2 = lamp(t, 0.37);
  const red = arrive * Math.max(l1.red, l2.red * 0.8), blue = arrive * Math.max(l1.blue, l2.blue * 0.8);
  const curtain = open * (0.6 + 0.4 * Math.sin(t * 5)) ;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bz" />
        <BBDefs id="bz" />
        <Lin id="bz-sky" stops={[[0, '#04070E'], [0.35, '#0C1626'], [0.6, '#1A2A3E'], [0.72, '#2E3A4A']]} />
        <Lin id="bz-stucco" x2={1} y2={0} stops={[[0, '#9A8C74'], [0.5, '#7E705A'], [1, '#4E4434']]} />
        <Lin id="bz-roof" stops={[[0, '#3A302A'], [1, '#22201C']]} />
        <Lin id="bz-lawn" stops={[[0, '#2A3222'], [0.5, '#1A2016'], [1, '#0A0E08']]} />
        <Lin id="bz-road" stops={[[0, '#2A2C30'], [1, '#121416']]} />
        <Lin id="bz-car" stops={[[0, '#3A3E44'], [0.5, '#1E2226'], [1, '#0E1012']]} />
        <Lin id="bz-win" stops={[[0, '#FFE6A0'], [1, '#E8A040']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno, stelle, monti Sandia (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#bz-sky)" />
          <Stars t={t} seed={22} n={60} y={0} h={700} color="#DDE6F0" size={2.4} />
          <path d="M-200 1010 L40 900 L200 930 L380 840 L520 880 L700 800 L860 860 L1040 820 L1280 900 V1100 H-200 Z" fill="#1A2232" />
          <path d="M380 840 L420 870 M700 800 L760 850 M1040 820 L1080 850" stroke="#3A4A62" strokeWidth="4" opacity=".6" />
          <Glow id="bz-city" x={540} y={1060} r={700} t={t} color="#E8A060" amp={0.02} rate={0.5} opacity={0.25} />
        </g>

        {/* PIANO 1 — case lontane con finestre accese e lampioni (0,45) */}
        <g transform={L(0.45)}>
          {FAR.map((f, i) => (
            <g key={i}>
              <rect x={f.x} y={1080 - f.h} width={f.w} height={f.h + 40} fill="#232A34" />
              <path d={`M${f.x - 10} ${1080 - f.h} H${f.x + f.w + 10}`} stroke="#2E3640" strokeWidth="8" />
              {f.lit && <rect x={f.x + f.w * 0.3} y={1080 - f.h + 24} width="30" height="22" fill="#E8B060" opacity=".75" />}
            </g>
          ))}
          {[120, 980].map((lx, i) => (
            <g key={i}>
              <path d={`M${lx} 1110 V860 Q${lx} 840 ${lx + 30} 840`} stroke="#2A3038" strokeWidth="8" fill="none" />
              <Glow id={`bz-sl${i}`} x={lx + 34} y={850} r={120} t={t} color="#FFB860" amp={0.04} rate={3} ph={i} opacity={0.7} />
              <circle cx={lx + 34} cy={850} r="8" fill="#FFE0A0" />
            </g>
          ))}
        </g>

        {/* PIANO 2 — la casa del laboratorio: intonaco, garage, finestra del primo piano (0,65) */}
        <g transform={L(0.65)}>
          <Ombra id="bz" x={640} y={1250} rx={460} ry={30} />
          {/* fumo chimico dal tetto, piegato dal vento verso destra */}
          <g opacity={0.25 + 0.75 * smoke}>
            <Smoke id="bz-sm" t={t} x={560} y={700} color="#D8DED0" n={8} rise={130} wind={340} r0={40} r1={130} speed={0.35} opacity={0.9} />
          </g>
          <rect x="530" y="690" width="50" height="80" fill="url(#bz-stucco)" stroke={K} strokeWidth="7" />
          {/* piano terra con il garage */}
          <rect x="300" y="960" width="700" height="290" fill="url(#bz-stucco)" stroke={K} strokeWidth="9" />
          <path d="M280 960 H1020 L1000 935 H300 Z" fill="url(#bz-roof)" stroke={K} strokeWidth="7" />
          <rect x="340" y="1040" width="260" height="210" fill="#5A4E3E" stroke={K} strokeWidth="7" />
          {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M340 ${1080 + i * 36} H600`} stroke={K} strokeWidth="4" opacity=".6" />)}
          {/* finestrella del garage dove c'è il laboratorio */}
          <rect x="680" y="1030" width="110" height="80" fill="#1A1E1E" stroke={K} strokeWidth="6" />
          <rect x="680" y="1030" width="110" height="80" fill="url(#bz-win)" opacity={0.2 + 0.7 * smoke} />
          <Glow id="bz-lab" x={735} y={1070} r={160} t={t} color={ORO} amp={0.08} rate={4} opacity={0.55 * smoke} />
          <path d="M735 1030 V1110 M680 1070 H790" stroke={K} strokeWidth="4" />
          <rect x="860" y="1060" width="90" height="190" fill="#3A2A1E" stroke={K} strokeWidth="6" />
          <circle cx="935" cy="1160" r="6" fill="#C8A060" />
          {/* primo piano della casa */}
          <rect x="420" y="760" width="500" height="200" fill="url(#bz-stucco)" stroke={K} strokeWidth="9" />
          <path d="M400 760 H940 L900 720 H440 Z" fill="url(#bz-roof)" stroke={K} strokeWidth="7" />
          <path d="M430 768 H910" stroke="#C8B898" strokeWidth="4" opacity=".6" />
          {/* raffrescatore sul tetto e parabola */}
          <rect x="760" y="660" width="110" height="70" fill="url(#bz-metal)" stroke={K} strokeWidth="6" />
          {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M772 ${672 + k * 12} H858`} stroke={K} strokeWidth="3" opacity=".6" />)}
          <path d="M470 720 L480 690" stroke={K} strokeWidth="5" />
          <ellipse cx="490" cy="680" rx="26" ry="16" fill="#9AA0A4" stroke={K} strokeWidth="5" transform="rotate(-30 490 680)" />
          <rect x="480" y="810" width="120" height="100" fill="#1E2430" stroke={K} strokeWidth="6" />
          <path d="M540 810 V910" stroke={K} strokeWidth="4" />
          {/* la finestra della fuga: buia, poi spalancata con la tenda che esce */}
          <g>
            <rect x="760" y="800" width="130" height="110" fill="#0E1014" stroke={K} strokeWidth="7" />
            <rect x="764" y="804" width="122" height="102" fill="#F2C870" opacity={0.15 + 0.55 * open} />
            {/* anta che si apre verso l'esterno */}
            <g transform={`translate(890 800) scale(${1 - open * 0.75} 1) translate(-890 -800)`}>
              <rect x="825" y="800" width="65" height="110" fill="#2A3240" stroke={K} strokeWidth="6" />
              <path d="M835 896 L880 812" stroke="#FFFFFF" strokeWidth="4" opacity=".25" />
            </g>
            {/* tenda che sventola fuori */}
            <path d={`M770 806 Q${790 + curtain * 40} ${840 + curtain * 10} ${780 + curtain * 120} ${880 + curtain * 30} Q${770 + curtain * 60} ${900} 770 906 Z`} fill="#D8D0E0" stroke={K} strokeWidth="4" opacity={0.3 + 0.7 * open} />
            <rect x="750" y="904" width="150" height="14" fill="#B8AC90" stroke={K} strokeWidth="4" />
          </g>
          {/* riflessi rossi e blu sulla facciata */}
          <path d="M420 720 H920 V935 H1000 V1250 H300 V935 H420 Z" fill="#FF3A3A" opacity={0.22 * red} />
          <path d="M420 720 H920 V935 H1000 V1250 H300 V935 H420 Z" fill="#3A6AFF" opacity={0.22 * blue} />
        </g>

        {/* PIANO 3 — prato, strada, auto della polizia, berretto caduto (1,0) */}
        <g transform={L(1.0)}>
          <path d="M-200 1250 H1280 V1420 H-200 Z" fill="url(#bz-lawn)" />
          <path d="M-200 1420 H1280 V2200 H-200 Z" fill="url(#bz-road)" />
          <path d="M-200 1420 H1280" stroke="#4A4C50" strokeWidth="10" />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-160 + i * 260} y="1640" width="140" height="14" fill="#C8B060" opacity=".55" />)}
          <Cespuglio x={260} y={1300} s={0.9} seed={3} color="#3A4A2A" />
          <Cespuglio x={1020} y={1310} s={1.0} seed={7} color="#3A4A2A" />
          {/* cassetta postale */}
          <g>
            <rect x="160" y="1270" width="12" height="150" fill="#3A3E40" stroke={K} strokeWidth="4" />
            <path d="M126 1270 V1226 Q126 1200 166 1200 Q206 1200 206 1226 V1270 Z" fill="#5A6066" stroke={K} strokeWidth="6" />
            <rect x="204" y="1210" width="8" height="34" fill="#C83A2A" stroke={K} strokeWidth="3" />
          </g>
          {/* il berretto di lana che cade dalla finestra */}
          {t > tOpen + 0.15 && (
            <g transform={`translate(${capX} ${capY}) rotate(${capRot}) scale(1.3)`}>
              <Ombra id="bz" x={0} y={8} rx={50} ry={8} opacity={fall >= 1 ? 1 : 0} />
              <path d="M-40 0 Q-42 -46 0 -50 Q42 -46 40 0 Z" fill="#6A6E74" stroke={K} strokeWidth="6" />
              <rect x="-44" y="-10" width="88" height="18" rx="6" fill="#4A4E54" stroke={K} strokeWidth="5" />
              {[-24, -8, 8, 24].map((x) => <path key={x} d={`M${x} -10 V-40`} stroke="#4A4E54" strokeWidth="3" />)}
            </g>
          )}
          {/* auto della polizia, di sbieco, con la barra di luci */}
          <g transform={`translate(${lerp(-300, 0, arrive) + 110} -230) translate(0 1600) scale(0.85) translate(0 -1600)`}>
            <Ombra id="bz" x={250} y={1610} rx={380} ry={34} />
            <path d="M-120 1600 V1500 Q-120 1470 -90 1466 L60 1460 L140 1380 Q160 1366 190 1366 H400 Q430 1366 450 1390 L520 1462 Q600 1470 610 1500 V1600 Z" fill="url(#bz-car)" stroke={K} strokeWidth="9" />
            <path d="M-110 1520 H600" stroke="#F2F2EE" strokeWidth="26" />
            <path d="M160 1386 L120 1456 H270 V1386 Z M290 1386 V1456 H470 L420 1396 Q410 1386 396 1386 Z" fill="#2A3A4E" stroke={K} strokeWidth="5" />
            <path d="M300 1400 L330 1446" stroke="#FFFFFF" strokeWidth="5" opacity=".25" />
            <rect x="-120" y="1500" width="36" height="22" rx="4" fill="#FFF2C8" stroke={K} strokeWidth="3" />
            {[40, 460].map((wx) => (
              <g key={wx}>
                <circle cx={wx} cy={1600} r="60" fill="#121414" stroke={K} strokeWidth="8" />
                <circle cx={wx} cy={1600} r="30" fill="url(#bz-metal)" stroke={K} strokeWidth="4" />
              </g>
            ))}
            {/* barra di luci */}
            <rect x="200" y="1338" width="180" height="28" rx="8" fill="#1A1A1A" stroke={K} strokeWidth="5" />
            <rect x="206" y="1342" width="80" height="20" rx="5" fill="#FF3A3A" opacity={0.25 + 0.75 * red} />
            <rect x="294" y="1342" width="80" height="20" rx="5" fill="#3A7AFF" opacity={0.25 + 0.75 * blue} />
            <Glow id="bz-red" x={246} y={1352} r={340} t={t} color="#FF3A3A" amp={0} opacity={0.8 * red} />
            <Glow id="bz-blue" x={334} y={1352} r={340} t={t} color="#3A7AFF" amp={0} opacity={0.8 * blue} />
          </g>
        </g>

        {/* PIANO 4 — recinzione a rete, yucca e seconda auto in primo piano che incorniciano (1,3) */}
        <g transform={L(1.3)}>
          <g transform={`translate(${lerp(400, 0, arrive)} 0)`}>
            <Ombra id="bz" x={1000} y={1830} rx={360} ry={30} />
            <path d="M700 1820 V1730 Q700 1700 730 1694 L840 1688 L910 1600 Q930 1586 960 1586 H1300 V1820 Z" fill="url(#bz-car)" stroke={K} strokeWidth="10" />
            <path d="M710 1750 H1300" stroke="#F2F2EE" strokeWidth="28" />
            <path d="M930 1606 L890 1676 H1060 V1606 Z" fill="#2A3A4E" stroke={K} strokeWidth="6" />
            <rect x="1000" y="1556" width="200" height="30" rx="8" fill="#1A1A1A" stroke={K} strokeWidth="5" />
            <rect x="1006" y="1560" width="90" height="22" rx="5" fill="#FF3A3A" opacity={0.25 + 0.75 * l2.red * arrive} />
            <rect x="1102" y="1560" width="90" height="22" rx="5" fill="#3A7AFF" opacity={0.25 + 0.75 * l2.blue * arrive} />
            <Glow id="bz-red2" x={1050} y={1570} r={300} t={t} color="#FF3A3A" amp={0} opacity={0.7 * l2.red * arrive} />
            <Glow id="bz-blue2" x={1146} y={1570} r={300} t={t} color="#3A7AFF" amp={0} opacity={0.7 * l2.blue * arrive} />
            <circle cx="840" cy="1830" r="66" fill="#121414" stroke={K} strokeWidth="9" />
            <circle cx="840" cy="1830" r="32" fill="url(#bz-metal)" stroke={K} strokeWidth="5" />
          </g>
          {/* yucca */}
          <g transform="translate(70 1880)">
            {Array.from({ length: 13 }, (_, i) => {
              const a = -Math.PI / 2 + (i - 6) * 0.2;
              const l = 300 + (i % 3) * 50;
              return <path key={i} d={`M0 0 L${Math.cos(a) * l - 10} ${Math.sin(a) * l} L${Math.cos(a) * l + 10} ${Math.sin(a) * l + 6} Z`} fill={i % 2 ? '#2E4426' : '#3E5A30'} stroke={K} strokeWidth="5" />;
            })}
          </g>
        </g>

        {/* PIANO 5 — falene attorno alle luci e particelle vicine (1,6–1,8) */}
        <g transform={L(1.6)}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = t * (2 + i * 0.3) + i;
            return <circle key={i} cx={1010 + Math.cos(a) * (40 + i * 6)} cy={860 + Math.sin(a * 1.3) * (30 + i * 4)} r="3" fill="#FFE8C0" opacity=".8" />;
          })}
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="bz-near" t={t} color="#AFC4E8" n={6} r0={70} r1={150} opacity={0.12} />
        </g>
      </g>
      <Finish id="bz" tint="#142235" tintOpacity={0.14} />
    </svg>
  );
};
