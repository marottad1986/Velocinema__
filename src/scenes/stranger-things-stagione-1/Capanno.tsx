import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Dust, Flyers, Fog, Glow, NearMotes, Reflection, Stars } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Abete, GIALLO, K, Lampadina, Ombra, SOTTO, StDefs, VELATURA } from './Comuni';

// La sera in cui Will sparisce: il capanno degli attrezzi dietro casa Byers, di notte, con la porta spalancata e la
// lampadina nuda accesa dentro. Eventi: prima frase la nebbia si dirada e il capanno emerge; seconda frase la porta a
// zanzariera della casa si spalanca e sbatte (Will è arrivato a casa, mai disegnato); terza frase la lampadina
// sfarfalla tre volte, sempre più forte, poi si spegne: dal capanno resta un bagliore freddo con spore che escono.
// Piani: cielo, luna e stelle (0,22) · abeti lontani nella nebbia (0,38) · casa con la veranda e abeti vicini (0,5)
//        · capanno, legnaia, bidone (0,66) · prato, ceppo con l'accetta, pozzanghera (0,9)
//        · tronco, staccionata, erba alta (1,2) · foglie (1,5) · nebbia vicina (1,8)

const r = rng(1983);
const FAR = Array.from({ length: 14 }, (_, i) => ({ x: -180 + i * 105 + r() * 40, h: 260 + r() * 200, w: 120 + r() * 50 }));
const NEAR = [
  { x: 380, h: 560, w: 210 }, { x: 960, h: 620, w: 230 }, { x: 1090, h: 520, w: 200 }, { x: 300, h: 430, w: 170 },
];
const GRASS = Array.from({ length: 70 }, (_, i) => ({ x: -60 + i * 17.5 + r() * 10, h: 90 + r() * 170, lean: (r() - 0.5) * 50, c: r() }));
const SHINGLES = Array.from({ length: 9 }, (_, i) => i);
const PLANKS = Array.from({ length: 11 }, (_, i) => 430 + i * 40);

/** Picco 0..1 a campana attorno a `c` (larghezza w). */
const bump = (t: number, c: number, w: number) => Math.max(0, 1 - Math.abs(t - c) / w);

export const Capanno: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  // prima frase: la nebbia si apre
  const reveal = eo(seg(t, 0, cues[0] + 2.2));
  // seconda frase: la porta a zanzariera si spalanca e poi ricade
  const tDoor = griglia(cues[1] + 0.5);
  const doorOpen = eob(seg(t, tDoor, tDoor + 0.45)) * (1 - 0.7 * eo(seg(t, tDoor + 0.9, tDoor + 1.9)));
  // terza frase: tre sfarfallii (al massimo 3 al secondo) e poi la lampadina si spegne
  const f1 = griglia(cues[2] + 0.3, 4), f2 = griglia(cues[2] + 0.9, 4), f3 = griglia(cues[2] + 1.4, 4);
  const tOff = griglia(cues[2] + 2.1);
  const hum = 0.93 + 0.07 * Math.sin(t * 7.3);
  const dips = 1 - 0.45 * bump(t, f1, 0.12) - 0.65 * bump(t, f2, 0.12) - 0.85 * bump(t, f3, 0.14);
  const bulb = t < tOff ? Math.max(0.08, hum * dips) : Math.max(0, 1 - seg(t, tOff, tOff + 0.08));
  const swing = t > cues[2] ? 5 * Math.sin((t - cues[2]) * 3.2) * seg(t, cues[2], cues[2] + 0.8) : 1.2 * Math.sin(t * 0.9);
  // dopo lo spegnimento: bagliore freddo e spore che escono dalla porta
  const cold = eo(seg(t, tOff + 0.05, tOff + 0.5)) * (1 - 0.35 * seg(t, tOff + 0.6, dur));
  const spores = seg(t, tOff, tOff + 0.3);

  const warm = (o: number) => o * bulb;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cp" />
        <StDefs id="cp" />
        <Lin id="cp-sky" stops={[[0, '#05080F'], [0.3, '#0C1424'], [0.55, '#1A2840'], [0.7, '#2C3C58']]} />
        <Lin id="cp-lawn" stops={[[0, '#1E2A28'], [0.35, '#141E1C'], [1, '#080C0C']]} />
        <Lin id="cp-inside" stops={[[0, '#6A4A26'], [0.5, '#4A321C'], [1, '#22170E']]} />
        <Lin id="cp-insideC" stops={[[0, '#2A4A66'], [0.5, '#16283C'], [1, '#0A121C']]} />
        <linearGradient id="cp-spill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD27A" stopOpacity=".55" />
          <stop offset=".6" stopColor="#FFD27A" stopOpacity=".16" />
          <stop offset="1" stopColor="#FFD27A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cp-spillC" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={SOTTO} stopOpacity=".45" />
          <stop offset="1" stopColor={SOTTO} stopOpacity="0" />
        </linearGradient>
        <Lin id="cp-veil" stops={[[0, '#3A4A62', 0], [0.15, '#3A4A62', 1], [1, '#3A4A62', 1]]} />
        <radialGradient id="cp-spore"><stop offset="0" stopColor="#D8EEF8" stopOpacity=".95" /><stop offset="1" stopColor="#D8EEF8" stopOpacity="0" /></radialGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno, stelle e luna bassa dietro gli abeti (0,22) */}
        <g transform={L(0.22)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#cp-sky)" />
          <Stars t={t} seed={11} n={80} x={-100} y={60} w={1280} h={640} color="#DDE6F5" size={0.7} />
          <Glow id="cp-moonhalo" x={880} y={700} r={300} t={t} color="#B8C8E0" amp={0.03} rate={0.7} opacity={0.5} />
          <circle cx="880" cy="700" r="52" fill="#E4EAF2" />
          <path d="M852 684 a10 8 0 1 0 1 0 M900 716 a14 10 0 1 0 1 0" fill="#C8D0DC" />
          <Fog id="cp-cl" t={t} y={735} x={760} rx={420} ry={26} color="#3A4A64" opacity={0.75} speed={0.1} drift={50} />
        </g>

        {/* PIANO 1 — bosco lontano di abeti, senza contorni, e nebbia (0,38) */}
        <g transform={L(0.38)}>
          {FAR.map((f, i) => <Abete key={i} x={f.x} y={1130} h={f.h} w={f.w} color="#16223A" seed={i} />)}
          <rect x="-200" y="1100" width="1480" height="200" fill="#121C2E" />
          <Fog id="cp-f1" t={t} y={1090} rx={900} ry={80} color="#5A6E8A" opacity={0.5} speed={0.18} drift={80} />
        </g>

        {/* PIANO 2 — retro di casa Byers con la veranda illuminata, abeti vicini (0,5) */}
        <g transform={L(0.5)}>
          {NEAR.map((f, i) => <Abete key={i} x={f.x} y={1180} h={f.h} w={f.w} color="#0E1626" seed={i + 20} />)}
          {/* casa: parete di assi orizzontali, tetto spiovente */}
          <path d="M-160 760 L120 660 L360 780 V1190 H-160 Z" fill="url(#cp-siding)" stroke={K} strokeWidth="8" />
          {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M-160 ${812 + i * 30} H360`} stroke="#000" strokeWidth="3" opacity=".22" />)}
          <path d="M-190 770 L120 650 L390 790" fill="none" stroke="#1C2028" strokeWidth="30" strokeLinejoin="round" />
          <path d="M120 652 L388 788" stroke="#6A7A92" strokeWidth="4" opacity=".55" />
          {/* finestra del piano di sopra, accesa */}
          <rect x="0" y="830" width="96" height="110" fill="#FFCF7A" stroke={K} strokeWidth="7" />
          <rect x="0" y="830" width="96" height="110" fill="url(#cp-glass)" />
          <path d="M48 830 V940 M0 885 H96" stroke={K} strokeWidth="5" />
          <path d="M6 836 Q30 870 22 936 M90 836 Q70 880 76 936" stroke="#C47A3A" strokeWidth="9" fill="none" opacity=".7" />
          <Glow id="cp-win1" x={48} y={885} r={150} t={t} color="#FFC870" amp={0.05} rate={3} opacity={0.45} />
          {/* veranda: tettoia, pilastrini, lampada e porta a zanzariera */}
          <path d="M60 1000 H380 L400 1030 H40 Z" fill="#262C36" stroke={K} strokeWidth="7" />
          {[70, 360].map((px) => <rect key={px} x={px} y="1030" width="14" height="150" fill="#5A6070" stroke={K} strokeWidth="4" />)}
          <rect x="40" y="1172" width="360" height="22" fill="#3A3226" stroke={K} strokeWidth="5" />
          <Glow id="cp-porch" x={300} y={1048} r={190} t={t} color="#FFC870" amp={0.04} rate={2.5} opacity={0.6} />
          <circle cx="300" cy="1046" r="11" fill={GIALLO} stroke={K} strokeWidth="4" />
          {/* vano della porta (luce calda del corridoio) e anta a zanzariera che si spalanca */}
          <rect x="180" y="1040" width="76" height="132" fill="#E8A858" stroke={K} strokeWidth="6" />
          <rect x="180" y="1040" width="76" height="132" fill="#7A4A22" opacity={0.55 * (1 - doorOpen)} />
          <g transform={`translate(180 1040) scale(${lerp(1, -0.55, doorOpen)} 1)`}>
            <rect x="0" y="0" width="76" height="132" fill="#2A2E36" fillOpacity=".55" stroke="#8A7A62" strokeWidth="6" />
            <path d="M0 66 H76" stroke="#8A7A62" strokeWidth="5" />
            <path d="M8 8 L68 58 M8 74 L68 124" stroke="#9AA8B8" strokeWidth="1.5" opacity=".35" />
          </g>
          <path d="M180 1172 H256 L330 1194 H120 Z" fill="#FFC070" opacity={0.75 * doorOpen} />
          <path d="M150 1194 H330 L420 1300 H40 Z" fill="url(#cp-spill)" opacity={0.9 * doorOpen} />
          <Glow id="cp-doorglow" x={218} y={1110} r={160} t={t} color="#FFB860" amp={0.05} rate={4} opacity={0.75 * doorOpen} />
          {/* finestra del piano terra */}
          <rect x="-120" y="1050" width="90" height="100" fill="#3A2A22" stroke={K} strokeWidth="7" />
          <rect x="-114" y="1056" width="78" height="88" fill="#E8B46A" opacity=".55" />
          <path d="M-75 1050 V1150" stroke={K} strokeWidth="5" />
          <Fog id="cp-f2" t={t} y={1185} rx={780} ry={60} color="#6A7E98" opacity={0.42} speed={0.22} ph={1} drift={100} />
        </g>

        {/* PIANO 3 — il capanno con la porta spalancata e la lampadina dentro (0,66) */}
        <g transform={L(0.66)}>
          <Ombra id="cp" x={720} y={1246} rx={360} ry={30} />
          {/* tetto laterale (in fuga verso destra) */}
          <path d="M650 702 L772 676 L1018 886 L892 914 Z" fill="url(#cp-roof)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          {SHINGLES.map((i) => {
            const p = (i + 1) / 10;
            return <path key={i} d={`M${lerp(650, 892, p)} ${lerp(702, 914, p)} L${lerp(772, 1018, p)} ${lerp(676, 886, p)}`} stroke="#0C0F16" strokeWidth="3" opacity=".7" />;
          })}
          <path d="M656 698 L776 673" stroke="#8A9AB8" strokeWidth="4" opacity=".5" />
          {/* parete laterale in ombra */}
          <path d="M870 912 L992 884 V1208 L870 1242 Z" fill="url(#cp-plankside)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          {[900, 930, 960].map((x) => <path key={x} d={`M${x} ${912 - (x - 870) * 0.23} V${1242 - (x - 870) * 0.28}`} stroke="#000" strokeWidth="3" opacity=".35" />)}
          {/* finestrella laterale con il riflesso della luna */}
          <path d="M904 960 L962 948 V1010 L904 1022 Z" fill="#1C2A3C" stroke={K} strokeWidth="5" />
          <path d="M910 966 L956 956" stroke="#9AB0D0" strokeWidth="3" opacity=".6" />
          {/* facciata di assi verticali */}
          <path d="M430 912 L650 716 L870 912 V1242 H430 Z" fill="url(#cp-plank)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          {PLANKS.map((x) => <path key={x} d={`M${x} ${Math.max(912 - (x <= 650 ? (x - 430) : (870 - x)) * 0.89, 720)} V1242`} stroke="#1A120A" strokeWidth="3.5" opacity=".55" />)}
          {[452, 538, 812].map((x, i) => <circle key={i} cx={x} cy={960 + i * 70} r="3.5" fill="#1A120A" />)}
          {/* scossaline del timpano con bordo chiaro */}
          <path d="M408 924 L650 704 L892 924" fill="none" stroke="#3A2A1E" strokeWidth="22" strokeLinejoin="round" />
          <path d="M650 706 L888 920" stroke="#B0A08A" strokeWidth="4" opacity=".45" />
          <path d="M412 916 L650 698" stroke="#E8B870" strokeWidth="4" opacity={warm(0.25)} />
          {/* finestrella frontale con la luce della lampadina */}
          <rect x="462" y="990" width="74" height="74" fill="#2A2018" stroke={K} strokeWidth="6" />
          <rect x="467" y="995" width="64" height="64" fill="#FFCC6E" opacity={warm(0.75) + 0.05} />
          <rect x="467" y="995" width="64" height="64" fill={SOTTO} opacity={0.35 * cold} />
          <path d="M499 990 V1064 M462 1027 H536" stroke={K} strokeWidth="4" />
          <path d="M470 1000 L486 1040" stroke="#FFFFFF" strokeWidth="3" opacity=".25" />
          {/* tubo di gomma arrotolato su un chiodo */}
          <path d="M800 1050 l0 -6" stroke={K} strokeWidth="6" />
          <ellipse cx="800" cy="1084" rx="36" ry="32" fill="none" stroke="#2E4A34" strokeWidth="12" />
          <ellipse cx="800" cy="1088" rx="26" ry="24" fill="none" stroke="#3E6046" strokeWidth="8" />
          <path d="M770 1108 Q780 1160 760 1200" fill="none" stroke="#2E4A34" strokeWidth="9" strokeLinecap="round" />

          {/* interno visto dalla porta: pareti, scaffale, sega, rastrello, fucile */}
          <g>
            <rect x="562" y="962" width="196" height="280" fill="url(#cp-inside)" />
            <rect x="562" y="962" width="196" height="280" fill="#05070C" opacity={0.82 * (1 - bulb)} />
            <rect x="562" y="962" width="196" height="280" fill="url(#cp-insideC)" opacity={0.85 * cold} />
            {/* parete di fondo e pareti laterali in prospettiva */}
            <path d="M562 962 L598 990 V1200 L562 1242 Z M758 962 L722 990 V1200 L758 1242 Z" fill="#000" opacity=".3" />
            <path d="M598 990 H722 M598 1200 H722" stroke="#1A120A" strokeWidth="4" opacity=".6" />
            {/* scaffale con barattoli */}
            <rect x="604" y="1108" width="112" height="8" fill="#2A1C10" stroke={K} strokeWidth="3" />
            {[[612, 18, '#7A5A3A'], [636, 24, '#5A6A7A'], [666, 16, '#8A3A2A'], [688, 22, '#6A6A5A']].map(([x, h, c], i) => (
              <rect key={i} x={x as number} y={1108 - (h as number)} width="18" height={h as number} fill={c as string} stroke={K} strokeWidth="3" />
            ))}
            {/* sega appesa */}
            <path d="M610 1010 L690 1004 L690 1022 Q650 1034 610 1030 Z" fill="#8A929A" stroke={K} strokeWidth="4" />
            <path d="M690 1002 h22 v24 h-22" fill="#5A3A22" stroke={K} strokeWidth="4" />
            {/* rastrello sulla parete destra */}
            <path d="M738 980 L742 1196" stroke="#6A4A2A" strokeWidth="7" />
            <path d="M726 978 H756 M730 978 v14 M738 978 v14 M746 978 v14 M754 978 v14" stroke="#7A828A" strokeWidth="4" />
            {/* fucile da caccia appoggiato allo stipite sinistro: calcio di legno, castello, canna */}
            <path d="M592 1234 L600 1150" stroke={K} strokeWidth="30" strokeLinecap="round" />
            <path d="M592 1234 L600 1150" stroke="#8A5A30" strokeWidth="20" strokeLinecap="round" />
            <path d="M586 1228 L593 1160" stroke="#C88A50" strokeWidth="4" strokeLinecap="round" opacity={0.3 + 0.6 * bulb} />
            <path d="M600 1150 L604 1110" stroke={K} strokeWidth="18" />
            <path d="M600 1150 L604 1110" stroke="#4A4E56" strokeWidth="10" />
            <path d="M606 1136 q10 4 6 14" stroke={K} strokeWidth="4" fill="none" />
            <path d="M604 1110 L618 990" stroke={K} strokeWidth="13" strokeLinecap="round" />
            <path d="M604 1110 L618 990" stroke="#6A727C" strokeWidth="6" strokeLinecap="round" />
            <path d="M602 1104 L615 994" stroke="#D8E0E8" strokeWidth="2" opacity={0.25 + 0.6 * bulb} />
            {/* pavimento di assi */}
            <path d="M562 1242 L598 1200 H722 L758 1242 Z" fill="#2A1C10" />
            <path d="M620 1200 L606 1242 M660 1200 V1242 M700 1200 L714 1242" stroke="#140C06" strokeWidth="3" />
            {/* lampadina nuda */}
            <Glow id="cp-in" x={660} y={1080} r={210} t={t} color="#FFD27A" amp={0.04} rate={8} opacity={0.75 * bulb} />
            <Lampadina id="cp-lamp" x={660} y={964} len={34} t={t} lit={bulb} s={0.8} swing={swing} />
            <Dust t={t} top={{ y: 1040, x0: 620, x1: 700 }} bottom={{ y: 1230, x0: 580, x1: 740 }} seed={7} n={14} color="#FFE8B0" boost={bulb} />
            {/* il bagliore freddo del Sottosopra, dopo lo spegnimento */}
            <Glow id="cp-cold" x={660} y={1130} r={220} t={t} color={SOTTO} amp={0.08} rate={2.2} opacity={0.6 * cold} />
          </g>
          {/* telaio della porta */}
          <path d="M562 1242 V962 H758 V1242" fill="none" stroke={K} strokeWidth="10" />
          <path d="M556 958 H764" stroke="#3A2A1E" strokeWidth="12" />
          {/* anta spalancata verso di noi, vernice rossa scrostata */}
          <path d="M562 962 L474 990 L474 1266 L562 1242 Z" fill="url(#cp-redwood)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          {[500, 530].map((x) => <path key={x} d={`M${x} ${990 - (x - 474) * 0.32 + 4} V${1266 - (x - 474) * 0.27}`} stroke="#2A0E0C" strokeWidth="3" opacity=".6" />)}
          <path d="M478 1010 L558 1222 M478 1010 L558 984 M478 1240 L558 1222" stroke="#3A1614" strokeWidth="9" />
          <path d="M490 1060 q8 14 2 30 M520 1140 q10 10 4 26" stroke="#9A7A62" strokeWidth="4" opacity=".55" />
          <path d="M558 1000 h8 v12 h-8 M558 1200 h8 v12 h-8" fill="#5A5A5A" stroke={K} strokeWidth="3" />
          <path d="M474 994 L474 1262" stroke="#E8B870" strokeWidth="4" opacity={warm(0.35)} />

          {/* legnaia lungo la parete laterale */}
          {Array.from({ length: 12 }, (_, i) => {
            const row = Math.floor(i / 4), col = i % 4;
            const lx = 904 + col * 30 + (row % 2) * 14, ly = 1206 - row * 30 - col * 6;
            return (
              <g key={i}>
                <circle cx={lx} cy={ly} r="16" fill="#7A5A3A" stroke={K} strokeWidth="5" />
                <circle cx={lx} cy={ly} r="8" fill="none" stroke="#5A3E24" strokeWidth="3" />
              </g>
            );
          })}
          {/* bidone di latta con il coperchio */}
          <Ombra id="cp" x={360} y={1250} rx={70} ry={10} />
          <path d="M318 1138 H402 L396 1248 H324 Z" fill="url(#cp-metal)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          {[1168, 1200, 1230].map((y) => <path key={y} d={`M${320 + (y - 1138) * 0.05} ${y} H${400 - (y - 1138) * 0.05}`} stroke={K} strokeWidth="3" opacity=".6" />)}
          <path d="M310 1130 Q360 1110 410 1130 V1140 H310 Z" fill="#6A727A" stroke={K} strokeWidth="6" />
          <path d="M350 1118 h20" stroke={K} strokeWidth="6" strokeLinecap="round" />
        </g>

        {/* PIANO 4 — prato bagnato, luce che esce dalla porta, ceppo con l'accetta, pozzanghera (0,9) */}
        <g transform={L(0.9)}>
          <path d="M-200 1236 Q540 1222 1280 1240 V2200 H-200 Z" fill="url(#cp-lawn)" />
          <path d="M572 1238 L752 1238 L960 1560 L330 1560 Z" fill="url(#cp-spill)" opacity={0.85 * bulb} />
          <path d="M572 1238 L752 1238 L960 1560 L330 1560 Z" fill="url(#cp-spillC)" opacity={0.75 * cold} />
          {/* pozzanghera con il riflesso della porta */}
          <ellipse cx="700" cy="1500" rx="150" ry="26" fill="#0A1018" stroke={K} strokeWidth="5" />
          <ellipse cx="700" cy="1496" rx="132" ry="16" fill="#1A2638" />
          <Reflection t={t} x={680} y={1490} color="#FFD27A" n={4} w={110} gap={7} opacity={0.9 * bulb} />
          <Reflection t={t} x={680} y={1490} color={SOTTO} n={4} w={110} gap={7} opacity={0.8 * cold} />
          {/* ceppo con l'accetta */}
          <Ombra id="cp" x={250} y={1440} rx={120} ry={16} />
          <path d="M160 1340 Q250 1322 340 1340 L332 1440 Q250 1456 168 1440 Z" fill="url(#cp-bark)" stroke={K} strokeWidth="8" />
          <ellipse cx="250" cy="1340" rx="90" ry="20" fill="#9A7A52" stroke={K} strokeWidth="7" />
          <ellipse cx="250" cy="1340" rx="56" ry="12" fill="none" stroke="#7A5A3A" strokeWidth="3" />
          <ellipse cx="250" cy="1340" rx="26" ry="6" fill="none" stroke="#7A5A3A" strokeWidth="3" />
          <path d="M268 1336 L330 1226" stroke="#6A4A2A" strokeWidth="13" strokeLinecap="round" />
          <path d="M266 1332 L326 1226" stroke="#9A7A52" strokeWidth="3" opacity=".6" />
          <path d="M226 1338 Q236 1300 266 1290 L300 1318 Q282 1344 254 1356 Z" fill="url(#cp-metal)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <path d="M232 1334 Q240 1306 262 1296" stroke="#E4ECF4" strokeWidth="4" fill="none" opacity=".8" />
          {/* foglie cadute sul prato */}
          {Array.from({ length: 18 }, (_, i) => {
            const lx = (i * 211) % 1180 - 40, ly = 1300 + ((i * 97) % 520);
            return <ellipse key={i} cx={lx} cy={ly} rx="16" ry="7" transform={`rotate(${(i * 47) % 180} ${lx} ${ly})`} fill={i % 3 ? '#6A4A26' : '#8A5A2A'} stroke={K} strokeWidth="3" />;
          })}
          <Fog id="cp-f3" t={t} y={1290} rx={820} ry={70} color="#7A8EA8" opacity={0.3} speed={0.16} ph={2.5} drift={100} />
        </g>

        {/* PIANO 5 — tronco a sinistra, staccionata a destra, erba alta lungo il bordo (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-120 300 H40 Q30 1200 62 1920 H-120 Z" fill="url(#cp-bark)" stroke={K} strokeWidth="10" />
          {[700, 900, 1120, 1380, 1600].map((y, i) => <path key={y} d={`M${-20 + i * 6} ${y} q20 40 4 90`} stroke="#000" strokeWidth="5" fill="none" opacity=".55" />)}
          <path d="M34 700 Q28 1200 54 1900" stroke="#4A5A78" strokeWidth="4" fill="none" opacity=".5" />
          {/* staccionata di assi */}
          {[830, 960, 1090].map((px, i) => (
            <g key={px}>
              <rect x={px} y={1420 - i * 26} width="34" height="560" fill="#3A3026" stroke={K} strokeWidth="7" />
              <path d={`M${px + 4} ${1422 - i * 26} V1900`} stroke="#7A6A56" strokeWidth="3" opacity=".5" />
            </g>
          ))}
          <path d="M800 1490 L1130 1430 M800 1610 L1130 1550" stroke="#3A3026" strokeWidth="26" />
          <path d="M800 1478 L1130 1418" stroke="#7A6A56" strokeWidth="3" opacity=".5" />
          {/* erba alta che incornicia il basso */}
          {GRASS.map((g, i) => {
            const sway = Math.sin(t * 1.3 + i * 0.7) * 8;
            return <path key={i} d={`M${g.x} 1940 Q${g.x + g.lean * 0.4} ${1940 - g.h * 0.6} ${g.x + g.lean + sway} ${1940 - g.h - 120}`} stroke={g.c > 0.5 ? '#1A2A22' : '#24382C'} strokeWidth={10 + g.c * 6} fill="none" strokeLinecap="round" />;
          })}
        </g>

        {/* PIANO 6 — foglie che cadono e spore che escono dal capanno (1,5) */}
        <g transform={L(1.5)}>
          <Flyers t={t} seed={23} n={6} color="#8A5A2A" outline={K} w={30} h={40} y0={760} y1={1800} speed={0.09} shape="leaf" />
          {spores > 0 && Array.from({ length: 16 }, (_, i) => {
            const p = seg(t, tOff + i * 0.04, tOff + 1.6 + i * 0.04);
            const sx = 660 + Math.sin(i * 2.3) * 60 + (i % 2 ? 1 : -1) * p * (40 + i * 6);
            const sy = 1150 - p * (120 + (i % 5) * 40) + Math.sin(t * 2 + i) * 8;
            return <circle key={i} cx={sx} cy={sy} r={5 + (i % 4) * 3} fill="url(#cp-spore)" opacity={spores * (0.4 + 0.6 * Math.sin(Math.PI * Math.min(1, p * 1.2)))} />;
          })}
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="cp-near" t={t} color="#9AAAC8" n={7} r0={80} r1={170} opacity={0.1} y0={760} />
        </g>

        {/* velo di nebbia che si apre nella prima frase */}
        <rect x="-200" y="420" width="1480" height="1640" fill="url(#cp-veil)" opacity={0.75 * (1 - reveal)} />
      </g>
      <Finish id="cp" tint={VELATURA} tintOpacity={0.12} />
    </svg>
  );
};
