import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { Beam, Dust, Fog, Glow, NearMotes, Neon, Notes, Smoke } from '../../lib/elements';
import { DISPLAY } from '../../lib/fonts';
import type { SceneProps } from '../../types';

// Il jazz club: insegna al neon JAZZ, contrabbasso, sassofono, batteria, faro sul palco.
// Piani: parete di mattoni e neon (0,25) · tende e faro (0,45) · palco e strumenti (0,65) ·
//        tavolini con candele in primo piano (1,2) · particelle vicine (1,7)

const K = '#1B1530';
const r = rng(4021);
const STAGE_Y = 1150; // bordo anteriore del palco
const SPOT = { x: 1010, y: 560 };

// mattoni della parete (solo sotto il titolo)
const BRICKS = (() => {
  const out: { x: number; y: number; w: number; c: number }[] = [];
  for (let row = 0; row < 15; row++) {
    const y = 560 + row * 40;
    for (let x = -200 + (row % 2) * 45; x < 1280; x += 90) out.push({ x, y, w: 86, c: r() });
  }
  return out;
})();

export const Jazz: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // il faro sul palco si accende quando Sebastian spiega il jazz (2ª frase)
  const spotOn = eo(seg(t, cues[1], cues[1] + 0.5));
  const spotFlick = t < cues[1] + 0.3 ? (Math.sin((t - cues[1]) * 50) > 0 ? 1 : 0.4) : 1;
  const sp = spotOn * spotFlick;
  // luccichio che scorre sul sassofono
  const glint = mod(t * 0.45, 1);
  const cym = Math.sin(t * 5.2) * 2.5;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="jz" />
        <Lin id="jz-wall" stops={[[0, '#0D0A1C'], [0.3, '#1A1430'], [0.55, '#2A1E3A'], [1, '#1E1628']]} />
        <Lin id="jz-curtain" x2={1} y2={0} stops={[[0, '#3A1A3E'], [0.35, '#5A2A58'], [0.7, '#3A1A3E'], [1, '#240F28']]} />
        <Lin id="jz-stage" stops={[[0, '#6A4528'], [0.5, '#4E321E'], [1, '#2A1A10']]} />
        <Lin id="jz-front" stops={[[0, '#2A1A22'], [1, '#120C18']]} />
        <Lin id="jz-wood" x2={1} y2={0} stops={[[0, '#7A3E1E'], [0.45, '#B0642E'], [1, '#5A2C14']]} />
        <Lin id="jz-gold" x2={1} y2={0} stops={[[0, '#9A6E1A'], [0.4, P.accento], [0.7, '#FFE6A0'], [1, '#A87A20']]} />
        <Lin id="jz-chrome" x2={1} y2={0} stops={[[0, '#6E6A80'], [0.5, '#E6E2F0'], [1, '#5A5670']]} />
        <Lin id="jz-drum" x2={1} y2={0} stops={[[0, '#4A2A5E'], [0.5, '#7A4FA0'], [1, '#3A2050']]} />
        <Lin id="jz-table" stops={[[0, '#6A4450'], [0.5, '#4A2E3A'], [1, '#24141E']]} />
        <Lin id="jz-floor" stops={[[0, '#2A1A2E'], [0.4, '#1E1424'], [1, '#0E0A16']]} />
        <GlowGradient id="jz-pool" color="#FFF0C8" core={0.7} mid={0.25} />
        <GlowGradient id="jz-shade" color="#000000" core={0.6} mid={0.3} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete di mattoni e insegna al neon (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#jz-wall)" />
          {BRICKS.map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width={b.w} height="36" rx="3" fill={b.c > 0.7 ? '#4A2E3E' : b.c > 0.35 ? '#3E2636' : '#33202E'} opacity={0.35 + 0.5 * seg(b.y, 560, 760)} />
          ))}
          {/* lampade da parete calde */}
          <Glow id="jz-wl1" x={90} y={700} r={150} t={t} color="#FFB86A" amp={0.04} rate={1.5} opacity={0.5} />
          <path d="M70 700 h40 l-8 -34 h-24 Z" fill="#C88A3A" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          {/* insegna al neon: si accende all'inizio */}
          <rect x="455" y="610" width="470" height="210" rx="18" fill="#140E22" stroke={K} strokeWidth="8" opacity=".8" />
          <Neon id="jz-neon" t={t} x={690} y={775} text="JAZZ" color="#FF5EA8" font={DISPLAY} size={160} onAt={0.4} />
          <path d="M480 640 h420" stroke="#FF5EA8" strokeWidth="5" strokeLinecap="round" opacity={0.6 * seg(t, 0.9, 1.0)} />
          <path d="M480 802 h420" stroke="#9B7FE0" strokeWidth="5" strokeLinecap="round" opacity={0.6 * seg(t, 1.0, 1.1)} />
          <Glow id="jz-nfloor" x={690} y={1000} r={360} t={t} color="#FF5EA8" amp={0.03} rate={3} opacity={0.18 * seg(t, 0.4, 0.9)} />
        </g>

        {/* PIANO 1 — tende ai lati del palco e faro (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-200 520 H170 Q120 800 190 1160 H-200 Z" fill="url(#jz-curtain)" stroke={K} strokeWidth="8" />
          <path d="M40 540 Q20 820 70 1150 M120 540 Q90 820 140 1150" fill="none" stroke="#7A3E72" strokeWidth="5" opacity=".6" />
          <path d="M1280 520 H930 Q980 760 960 1160 H1280 Z" fill="url(#jz-curtain)" stroke={K} strokeWidth="8" />
          <path d="M1030 540 Q1060 820 1040 1150 M1120 540 Q1140 820 1120 1150" fill="none" stroke="#7A3E72" strokeWidth="5" opacity=".6" />
          {/* faro sul palco */}
          <Beam id="jz-beam" x={SPOT.x - 30} y={SPOT.y + 30} t={t} length={820} spread={460} color="#FFF0C8" angle={128} sweep={1.5} sweepRate={0.5} opacity={0.5 * sp} />
          <g transform={`rotate(38 ${SPOT.x} ${SPOT.y})`}>
            <rect x={SPOT.x - 50} y={SPOT.y - 34} width="100" height="68" rx="10" fill="#2A2440" stroke={K} strokeWidth="7" />
            <ellipse cx={SPOT.x - 50} cy={SPOT.y} rx="12" ry="34" fill={sp > 0.1 ? '#FFF6DA' : '#3A3450'} stroke={K} strokeWidth="5" />
          </g>
          <Glow id="jz-spg" x={SPOT.x - 60} y={SPOT.y + 40} r={110} t={t} color="#FFF0C8" amp={0.05} rate={4} opacity={0.8 * sp} />
        </g>

        {/* PIANO 2 — palco e strumenti (0,65) */}
        <g transform={L(0.65)}>
          <path d={`M-200 1070 H1280 L1290 ${STAGE_Y} H-210 Z`} fill="url(#jz-stage)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M-200 1100 H1280 M-200 1126 H1280" stroke="#3A2414" strokeWidth="3" opacity=".7" />
          <rect x="-210" y={STAGE_Y} width="1500" height="90" fill="url(#jz-front)" stroke={K} strokeWidth="8" />
          <path d={`M-210 ${STAGE_Y + 8} H1290`} stroke="#8A5A3A" strokeWidth="3" opacity=".6" />
          {/* pozza di luce del faro */}
          <ellipse cx="520" cy="1112" rx="300" ry="50" fill="url(#jz-pool)" opacity={0.9 * sp} />

          {/* fumo nel fascio del faro */}
          <g opacity={0.35 + 0.65 * sp}>
            <Smoke id="jz-sm1" t={t} x={600} y={1060} color="#D8CCE8" n={8} rise={420} wind={180} r0={50} r1={170} speed={0.12} opacity={0.4} />
            <Fog id="jz-fog1" t={t} y={900} x={640} rx={360} ry={110} color="#E6DAF0" drift={60} speed={0.25} opacity={0.18} />
          </g>

          {/* contrabbasso */}
          <g transform={`rotate(-6 250 1080)`}>
            <path d="M246 640 V860" stroke={K} strokeWidth="26" strokeLinecap="round" />
            <path d="M246 640 V860" stroke="#2A1A12" strokeWidth="14" strokeLinecap="round" />
            <path d="M234 600 q12 -26 24 0 v40 h-24 Z" fill="url(#jz-wood)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <path d="M226 612 h-12 M226 630 h-12 M266 612 h12 M266 630 h12" stroke={K} strokeWidth="7" strokeLinecap="round" />
            <path d="M246 850 C170 850 160 905 186 945 C150 975 130 1030 160 1075 C190 1115 300 1115 330 1075 C360 1030 340 975 306 945 C332 905 322 850 246 850 Z" fill="url(#jz-wood)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M206 960 q-10 20 6 40 M286 960 q10 20 -6 40" fill="none" stroke={K} strokeWidth="6" strokeLinecap="round" />
            <path d="M246 870 V1060" stroke="#F0E6D0" strokeWidth="2" opacity=".7" />
            <path d="M238 870 V1060 M254 870 V1060" stroke="#F0E6D0" strokeWidth="2" opacity=".5" />
            <rect x="226" y="1012" width="40" height="12" rx="3" fill="#2A1A12" stroke={K} strokeWidth="4" />
            <path d="M246 1100 V1140" stroke={K} strokeWidth="8" />
            <path d="M176 900 Q200 870 236 866" fill="none" stroke="#E8A46A" strokeWidth="5" opacity=".6" />
          </g>

          {/* batteria */}
          <g>
            {/* piatti con oscillazione */}
            <path d="M720 1080 V880 M960 1080 V860" stroke={K} strokeWidth="8" />
            <path d="M720 1080 V880 M960 1080 V860" stroke="#9A96B0" strokeWidth="3" />
            <ellipse cx="720" cy="876" rx="78" ry="12" fill="url(#jz-gold)" stroke={K} strokeWidth="5" transform={`rotate(${-8 + cym} 720 876)`} opacity=".9" />
            <ellipse cx="960" cy="856" rx="88" ry="13" fill="url(#jz-gold)" stroke={K} strokeWidth="5" transform={`rotate(${10 - cym} 960 856)`} opacity=".9" />
            {/* tom e rullante */}
            <rect x="752" y="928" width="96" height="62" rx="8" fill="url(#jz-drum)" stroke={K} strokeWidth="7" />
            <ellipse cx="800" cy="928" rx="48" ry="10" fill="#E8E2F0" stroke={K} strokeWidth="5" />
            <rect x="680" y="1010" width="96" height="46" rx="6" fill="url(#jz-chrome)" stroke={K} strokeWidth="6" />
            <ellipse cx="728" cy="1010" rx="48" ry="10" fill="#E8E2F0" stroke={K} strokeWidth="5" />
            {/* grancassa */}
            <circle cx="860" cy="1030" r="100" fill="url(#jz-drum)" stroke={K} strokeWidth="9" />
            <circle cx="860" cy="1030" r="80" fill="#E6DCEA" stroke={K} strokeWidth="5" />
            <circle cx="860" cy="1030" r="80" fill="#FF5EA8" opacity={0.12 * seg(t, 0.4, 0.9)} />
            <text x="860" y="1046" textAnchor="middle" fontFamily={DISPLAY} fontSize="42" fill="#5A3A80">JAZZ</text>
            <path d="M800 990 a80 80 0 0 1 60 -38" fill="none" stroke="#FFFFFF" strokeWidth="5" opacity=".5" strokeLinecap="round" />
            {/* bacchette appoggiate */}
            <path d="M740 932 L842 900 M748 944 L850 920" stroke="#E8C890" strokeWidth="7" strokeLinecap="round" />
          </g>

          {/* sassofono su supporto: l'oggetto chiave, in oro */}
          <g>
            <path d="M520 1140 L560 1080 L600 1140 M560 1080 V1040" fill="none" stroke={K} strokeWidth="9" strokeLinecap="round" />
            <Glow id="jz-saxg" x={545} y={960} r={210} t={t} color={P.accento} amp={0.06} rate={2.4} opacity={0.25 + 0.3 * sp} />
            <path d="M580 760 Q520 770 528 820 L536 1000 Q540 1060 590 1062 Q640 1060 630 1000 L622 960" fill="none" stroke={K} strokeWidth="44" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M580 760 Q520 770 528 820 L536 1000 Q540 1060 590 1062 Q640 1060 630 1000 L622 960" fill="none" stroke="url(#jz-gold)" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M596 960 Q600 900 660 892 L670 940 Q630 944 624 990 Z" fill="url(#jz-gold)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <ellipse cx="664" cy="916" rx="12" ry="26" fill="#6A4A10" stroke={K} strokeWidth="5" transform="rotate(-10 664 916)" />
            <path d="M580 760 L612 744" stroke={K} strokeWidth="12" strokeLinecap="round" />
            {[820, 860, 900, 940, 980].map((y, i) => (
              <circle key={i} cx={548 - (y - 820) * 0.02} cy={y} r="9" fill="#FFE6A0" stroke={K} strokeWidth="4" />
            ))}
            {/* riflesso che scorre lungo il corpo */}
            <path d="M540 820 L546 1000" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity={0.35 + 0.35 * sp} />
            <circle cx={lerp(541, 548, glint)} cy={lerp(800, 1030, glint)} r={10 + 4 * Math.sin(t * 6)} fill="#FFFFFF" opacity={Math.sin(glint * Math.PI) * (0.5 + 0.5 * sp)} />
          </g>

          {/* microfono vintage e leggio */}
          <path d="M420 1140 V860" stroke={K} strokeWidth="9" />
          <path d="M420 1140 V860" stroke="#9A96B0" strokeWidth="3" />
          <path d="M396 1142 h48" stroke={K} strokeWidth="10" strokeLinecap="round" />
          <rect x="404" y="812" width="32" height="54" rx="14" fill="url(#jz-chrome)" stroke={K} strokeWidth="6" />
          <path d="M410 826 h20 M410 838 h20 M410 850 h20" stroke="#4A4660" strokeWidth="3" />
          <path d="M360 1140 L378 1010 L396 1140" fill="none" stroke={K} strokeWidth="6" />
          <rect x="340" y="980" width="80" height="50" fill="#F2EADA" stroke={K} strokeWidth="5" transform="rotate(-8 380 1005)" />
          <path d="M350 996 h56 M350 1008 h50 M350 1020 h44" stroke="#8A7A9A" strokeWidth="3" transform="rotate(-8 380 1005)" />

          {/* note che salgono dal sassofono */}
          <Notes t={t} x={640} y={880} seed={88} n={4} color={P.chiaro} outline={K} rise={300} spread={160} size={0.8} speed={0.2} />
        </g>

        {/* PIANO 3 — tavolini con candele in primo piano, che escono dai bordi (1,2) */}
        <g transform={L(1.2)}>
          <rect x="-200" y="1240" width="1480" height="800" fill="url(#jz-floor)" />
          <ellipse cx="540" cy="1300" rx="520" ry="70" fill="url(#jz-pool)" opacity={0.25 * sp} />
          <g transform="translate(0 -110)">
          {/* tavolino sinistro */}
          <path d="M60 1560 V2000" stroke={K} strokeWidth="34" />
          <ellipse cx="60" cy="1520" rx="270" ry="56" fill="url(#jz-table)" stroke={K} strokeWidth="10" />
          <ellipse cx="60" cy="1512" rx="250" ry="44" fill="none" stroke="#6A4A5A" strokeWidth="4" opacity=".6" />
          <Glow id="jz-c1" x={110} y={1460} r={180} t={t} color="#FFB86A" amp={0.12} rate={7} opacity={0.6} />
          <path d="M84 1500 V1440 Q110 1424 136 1440 V1500 Z" fill="#B0442E" stroke={K} strokeWidth="6" opacity=".9" />
          <ellipse cx="110" cy="1452" rx={7 + Math.sin(t * 9) * 1.5} ry="16" fill="#FFE08A" />
          <path d="M-60 1500 L-50 1400 H0 L10 1500 Z" fill="#C8D4E8" stroke={K} strokeWidth="6" opacity=".55" />
          <path d="M-52 1450 H2" stroke="#E8A040" strokeWidth="26" opacity=".6" />
          {/* tavolino destro */}
          <path d="M1010 1620 V2000" stroke={K} strokeWidth="34" />
          <ellipse cx="1010" cy="1580" rx="280" ry="58" fill="url(#jz-table)" stroke={K} strokeWidth="10" />
          <ellipse cx="1010" cy="1572" rx="260" ry="46" fill="none" stroke="#6A4A5A" strokeWidth="4" opacity=".6" />
          <Glow id="jz-c2" x={930} y={1520} r={170} t={t} color="#FFB86A" amp={0.12} rate={6.3} ph={1.5} opacity={0.6} />
          <path d="M906 1560 V1500 Q930 1484 954 1500 V1560 Z" fill="#B0442E" stroke={K} strokeWidth="6" opacity=".9" />
          <ellipse cx="930" cy="1512" rx={7 + Math.sin(t * 8 + 1) * 1.5} ry="16" fill="#FFE08A" />
          {/* calice */}
          <path d="M1060 1560 V1500 M1036 1440 Q1036 1500 1060 1500 Q1084 1500 1084 1440 Z M1040 1562 h40" fill="none" stroke="#C8D4E8" strokeWidth="6" strokeLinecap="round" opacity=".8" />
          <path d="M1040 1456 Q1060 1486 1080 1456 Z" fill="#8A2A4A" opacity=".8" />
          {/* schienale di sedia al centro, in basso */}
          <path d="M420 2000 V1760 Q420 1700 480 1700 H600 Q660 1700 660 1760 V2000" fill="none" stroke={K} strokeWidth="26" strokeLinecap="round" />
          <path d="M420 2000 V1760 Q420 1700 480 1700 H600 Q660 1700 660 1760 V2000" fill="none" stroke="#4A2E3E" strokeWidth="12" strokeLinecap="round" />
          </g>
        </g>

        {/* PIANO 3b — bordo del tavolo più vicino, con lampada, bicchiere e biglietto del cinema (1,45) */}
        <g transform={L(1.45)}>
          <path d="M-200 1760 Q540 1700 1280 1760 V2100 H-200 Z" fill="url(#jz-table)" stroke={K} strokeWidth="12" />
          <path d="M-200 1774 Q540 1716 1280 1774" fill="none" stroke="#C88A6A" strokeWidth="5" opacity={0.35 + 0.35 * sp} />
          {/* lampada da tavolo a sinistra */}
          <Glow id="jz-tl" x={190} y={1640} r={260} t={t} color="#FFC870" amp={0.05} rate={2.2} opacity={0.7} />
          <path d="M190 1740 V1640" stroke={K} strokeWidth="14" />
          <ellipse cx="190" cy="1742" rx="56" ry="14" fill="#8A5A2E" stroke={K} strokeWidth="7" />
          <path d="M120 1650 L150 1570 H230 L260 1650 Z" fill="#C0442E" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M124 1648 H256" stroke="#FFE0A0" strokeWidth="6" />
          {/* bicchiere con riflesso */}
          <path d="M800 1730 L790 1600 H880 L870 1730 Z" fill="#C8D4E8" stroke={K} strokeWidth="7" opacity=".7" />
          <path d="M794 1650 H876" stroke="#E8A040" strokeWidth="44" opacity=".55" />
          <path d="M806 1612 V1716" stroke="#FFFFFF" strokeWidth="5" opacity=".6" strokeLinecap="round" />
          {/* biglietto del cinema lasciato sul tavolo */}
          <g transform="rotate(-8 520 1790)">
            <path d="M420 1760 H620 V1782 a12 12 0 0 0 0 24 V1828 H420 V1806 a12 12 0 0 0 0 -24 Z" fill={P.accento} stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <path d="M574 1764 V1824" stroke={K} strokeWidth="3" strokeDasharray="6 6" />
            <text x="496" y="1806" textAnchor="middle" fontFamily="Figtree" fontWeight={900} fontSize="30" fill={K}>CINEMA</text>
          </g>
        </g>

        {/* PIANO 4 — pulviscolo nel faro e particelle vicine (1,7) */}
        <g transform={L(1.5)} opacity={0.3 + 0.7 * sp}>
          <Dust t={t} top={{ y: 620, x0: 900, x1: 960 }} bottom={{ y: 1110, x0: 300, x1: 760 }} seed={402} n={30} color="#FFF0C8" />
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="jz-near" t={t} seed={404} color="#E8D8F0" opacity={0.1} />
        </g>
      </g>

      <Finish id="jz" tint="#2C2456" tintOpacity={0.13} />
    </svg>
  );
};
