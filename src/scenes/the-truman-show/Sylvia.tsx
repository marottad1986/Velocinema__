import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Embers, Fireflies, Glow, Moon, NearMotes, Reflection, Stars, WaveBand, WaveLines, Wisps } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Sylvia: spiaggia di notte sotto le stelle — maglione rosso sulla sabbia, spilla rotonda «Come finirà?»,
// fuoco spento, faro lontano. Nessuna persona: solo oggetti. Ritagli di riviste come forme colorate astratte.
// Dettaglio da studio: una «stella» sfarfalla e si rivela un faretto appeso a un cavo («è tutto finto»);
// due fari d'auto spazzano la spiaggia e se ne vanno («arriva un uomo e la porta via»).
// Piani: cielo e stelle (0,2) · faro e luci lontane (0,45) · mare (0,55–0,7) · sabbia, maglione, spilla, falò (0,8)
//        · erba della duna e tronco (1,25) · lucciole e particelle (1,5–1,8)

const K = '#142235';
const RED = '#C8423A';
const r = rng(6107);
// ritagli: forme astratte colorate che arrivano e si dispongono in una griglia irregolare (mai un volto)
const CUTS = Array.from({ length: 8 }, (_, i) => ({
  x: 160 + (i % 4) * 92 + (r() - 0.5) * 20,
  y: 820 + Math.floor(i / 4) * 92 + (r() - 0.5) * 16,
  fx: -200 + r() * 1400, fy: 1700 + r() * 300,
  rot: (r() - 0.5) * 30,
  c: ['#F2C14E', '#4FA3D1', '#E8A0B4', '#7FD1B9', '#F4F1E6', '#9B8AD8', '#F2994A', '#E85B5B'][i],
  kind: i % 4,
}));

const cutShape = (kind: number) =>
  kind === 0 ? 'M-38 -30 H38 V30 H-38 Z' : kind === 1 ? 'M0 -40 L40 32 H-40 Z' : kind === 2 ? 'M-40 -24 L30 -36 L40 28 L-30 36 Z' : 'M-36 0 A36 30 0 1 0 36 0 A36 30 0 1 0 -36 0 Z';

export const Sylvia: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // «è tutto finto»: la stella-faretto sfarfalla e mostra il cavo
  const fake = seg(t, cues[2], cues[2] + 0.4) * (1 - seg(t, cues[3] + 0.6, cues[3] + 1.4));
  const fakeFlick = t > cues[2] && t < cues[2] + 0.5 ? (Math.sin((t - cues[2]) * 38) > 0 ? 1 : 0.3) : 1;
  // «arriva un uomo e la porta via»: fari d'auto che spazzano da destra a sinistra e svaniscono
  const car = seg(t, cues[3], cues[3] + 1.8);
  const carOn = Math.sin(car * Math.PI);
  // spilla: piccolo bagliore quando lei «parla» (cue 1–2)
  const pin = eob(seg(t, cues[1], cues[1] + 0.5));
  // maglione: la manica si solleva nel vento (cue 4)
  const sleeve = Math.sin(t * 2.2) * 4 + 10 * Math.sin(seg(t, cues[4], cues[4] + 1.6) * Math.PI);
  // ritagli che arrivano uno alla volta (cue 5)
  const cutP = (i: number) => eo(seg(t, cues[5] + i * 0.18, cues[5] + i * 0.18 + 0.7));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sy" />
        <Lin id="sy-sky" stops={[[0, '#0A1424'], [0.4, '#142235'], [0.7, '#23466A'], [1, '#2E5A80']]} />
        <Lin id="sy-sea" stops={[[0, '#2B5B84'], [1, '#132A44']]} />
        <Lin id="sy-sand" stops={[[0, '#6E7C8C'], [0.4, '#4F5D70'], [1, '#2A3446']]} />
        <Lin id="sy-sw" x2={1} y2={0} stops={[[0, '#E0584C'], [0.6, RED], [1, '#8E2C28']]} />
        <Lin id="sy-pin" x2={1} y2={1} stops={[[0, '#FFFFFF'], [0.6, '#F4F1E6'], [1, '#C9C3AE']]} />
        <Lin id="sy-front" stops={[[0, '#1E2A3C'], [1, '#0A1220']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno, stelle, luna, stella-faretto (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#sy-sky)" />
          <Stars t={t} seed={4} n={46} y={120} h={820} color="#E9F0F8" />
          <Stars t={t} seed={9} n={14} y={560} h={400} color="#FFF4D6" size={1.4} />
          <Moon id="sy-moon" x={880} y={640} r={52} t={t} color="#F4F1E6" halo="#CFE3F4" />
          {/* la stella finta: faretto appeso */}
          <path d="M700 -200 V700" stroke="#3A5272" strokeWidth="3" opacity={fake * 0.9} />
          <rect x="688" y="700" width="24" height="18" rx="4" fill="#2A3A52" opacity={fake} />
          <Glow id="sy-fake" x={700} y={724} r={60} t={t} color="#FFF4D6" amp={0.1} rate={5} opacity={0.7 * fakeFlick} />
          <circle cx="700" cy="724" r="6" fill="#FFFFFF" opacity={fakeFlick} />
        </g>

        {/* PIANO 1 — orizzonte: faro lontano a destra e luci della città a sinistra (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-200 1050 Q60 1010 300 1040 Q420 1030 520 1050 H-200 Z" fill="#1A2B42" />
          {[40, 90, 150, 210, 260, 330].map((x, i) => (
            <g key={i}>
              <Glow id={`sy-town${i}`} x={x} y={1032 - (i % 2) * 8} r={22} t={t} color="#FFD98A" amp={0.2} rate={1.5 + i * 0.4} ph={i} opacity={0.8} />
              <circle cx={x} cy={1032 - (i % 2) * 8} r="3" fill="#FFE7A0" />
            </g>
          ))}
          <path d="M880 1050 L960 1010 L1100 1030 V1050 Z" fill="#1A2B42" />
          <path d="M962 1012 L968 940 H984 L990 1012 Z" fill="#E9E3D2" />
          <path d="M966 960 H986" stroke={RED} strokeWidth="8" opacity=".7" />
          <Beam id="sy-lh" x={976} y={936} t={t} length={760} spread={120} color="#FFE7A0" angle={180} spin={0.9} opacity={0.45} />
          <Glow id="sy-lhg" x={976} y={936} r={60} t={t} color="#FFE7A0" amp={0.3} rate={0.9} opacity={0.8} />
        </g>

        {/* PIANO 2 — mare notturno con riflesso della luna (0,55–0,7) */}
        <g transform={L(0.55)}>
          <WaveBand t={t} y={1056} fill="url(#sy-sea)" amp={6} w={260} speed={14} bob={3} />
          <Reflection t={t} x={880} y={1070} color="#F4F1E6" n={9} w={110} gap={14} opacity={0.5} />
          <WaveLines t={t} ys={[1080, 1105]} color="#5F8FB8" amp={5} speed={18} width={3} opacity={0.5} />
        </g>
        <g transform={L(0.7)}>
          <WaveBand t={t} y={1130} fill="#1C3A5C" foam="#CFE3F4" amp={10} w={300} speed={24} bob={6} foamWidth={6} foamOpacity={0.7} />
        </g>

        {/* PIANO 3 — sabbia con oggetti (0,8) */}
        <g transform={L(0.8)}>
          <path d="M-200 1170 Q300 1150 600 1168 Q900 1180 1300 1160 V2200 H-200 Z" fill="url(#sy-sand)" />
          <path d="M-200 1170 Q300 1150 600 1168 Q900 1180 1300 1160" fill="none" stroke="#9FB6CC" strokeWidth="5" opacity=".5" />
          {/* fari d'auto che spazzano la sabbia */}
          <g opacity={carOn}>
            <Beam id="sy-car1" x={lerp(1300, -300, car)} y={1180} t={t} length={700} spread={260} color="#FFF4D6" angle={170} opacity={0.8} />
            <Beam id="sy-car2" x={lerp(1360, -240, car)} y={1196} t={t} length={700} spread={260} color="#FFF4D6" angle={168} opacity={0.65} />
          </g>
          {/* fuoco spento: cerchio di pietre, legni anneriti, braci e fumo */}
          <g transform="translate(880 1226)">
            <Glow id="sy-ember" x={0} y={-6} r={110} t={t} color="#F2994A" amp={0.2} rate={3} opacity={0.35 * (1 - seg(t, 0, dur) * 0.6)} />
            {[-70, -42, -12, 20, 50, 74].map((x, i) => <ellipse key={i} cx={x} cy={i % 2 ? 8 : 2} rx="18" ry="12" fill="#5C6878" stroke={K} strokeWidth="5" />)}
            <path d="M-44 -6 L40 -24 M-36 -22 L44 -2" stroke="#2A2420" strokeWidth="16" strokeLinecap="round" />
            <path d="M-44 -6 L40 -24 M-36 -22 L44 -2" stroke={K} strokeWidth="4" strokeLinecap="round" opacity=".6" />
            <circle cx="-6" cy="-12" r="6" fill="#F2994A" opacity={0.5 + 0.4 * Math.sin(t * 4)} />
            <circle cx="16" cy="-16" r="4" fill="#FFD98A" opacity={0.4 + 0.4 * Math.sin(t * 5 + 1)} />
          </g>
          <Wisps t={t} x={880} y={1204} color="#B9C8D8" n={3} h={220} width={6} opacity={0.6} />
          <Embers t={t} x={880} y={1214} w={60} h={260} n={10} seed={77} drift={-60} />
          {/* maglione rosso steso sulla sabbia (vista dall'alto, schiacciato in prospettiva) */}
          <ellipse cx="370" cy="1236" rx="230" ry="34" fill="#0A1220" opacity=".35" />
          <g transform="translate(370 1200) rotate(-5) scale(1 0.6)">
            <path d={`M-88 -78 L-150 -40 L${-232 - sleeve} ${50 - sleeve * 2} L${-196 - sleeve} ${84 - sleeve * 2} L-100 10 Z`} fill="url(#sy-sw)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d={`M${-232 - sleeve} ${50 - sleeve * 2} L${-196 - sleeve} ${84 - sleeve * 2}`} stroke="#8E2C28" strokeWidth="16" />
            <path d="M88 -78 L150 -40 L250 0 L236 40 L100 10 Z" fill="url(#sy-sw)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M250 0 L236 40" stroke="#8E2C28" strokeWidth="16" />
            <path d="M-100 -84 Q-40 -100 -30 -92 Q0 -60 30 -92 Q40 -100 100 -84 L108 110 Q0 124 -108 110 Z" fill="url(#sy-sw)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M-104 84 Q0 98 104 84 M-104 98 Q0 112 104 98" fill="none" stroke="#8E2C28" strokeWidth="5" />
            <path d="M-34 -92 Q0 -52 34 -92" fill="none" stroke="#8E2C28" strokeWidth="12" strokeLinecap="round" />
            {[-60, -20, 20, 60].map((x) => <path key={x} d={`M${x} -40 l12 18 l-12 18 l12 18`} fill="none" stroke="#F49A8C" strokeWidth="4" opacity=".55" />)}
            <path d="M-92 -74 Q-40 -88 -34 -84" fill="none" stroke="#F49A8C" strokeWidth="5" opacity=".8" />
          </g>
          {/* spilla rotonda «Come finirà?» */}
          <g transform={`translate(690 1214) rotate(-10) scale(${0.9 + 0.1 * pin})`}>
            <Glow id="sy-ping" x={0} y={0} r={120} t={t} color="#FFF4D6" amp={0.1} rate={2.5} opacity={0.25 + 0.35 * Math.sin(seg(t, cues[2], cues[2] + 1.5) * Math.PI)} />
            <ellipse cx="6" cy="40" rx="62" ry="10" fill="#0A1220" opacity=".35" />
            <circle r="64" fill="url(#sy-pin)" stroke={K} strokeWidth="8" />
            <circle r="52" fill="none" stroke={P.principale} strokeWidth="6" />
            <text y="-6" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="25" fill={K}>Come</text>
            <text y="22" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="25" fill={K}>finirà?</text>
            <path d="M-40 -30 Q-20 -48 10 -50" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
          </g>
          {/* conchiglie e impronte nella sabbia */}
          <path d="M150 1300 q14 -16 28 0 Z M900 1320 q10 -12 20 0 Z" fill="#D9D2C0" stroke={K} strokeWidth="4" />
          {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={620 + i * 70} cy={1290 + (i % 2) * 22} rx="14" ry="8" fill="#3A4658" opacity=".6" />)}
        </g>

        {/* ritagli di riviste che arrivano e si dispongono (0,8) */}
        <g transform={L(0.8)}>
          <g opacity={seg(t, cues[5] - 0.2, cues[5] + 0.3)} transform="rotate(-3 300 866)">
            <rect x="96" y="756" width="408" height="220" rx="6" fill="#F4F1E6" stroke={K} strokeWidth="6" opacity=".92" />
            <path d="M120 960 H480" stroke="#C9C3AE" strokeWidth="3" />
          </g>
          {CUTS.map((c, i) => {
            const p = cutP(i);
            if (p <= 0) return null;
            return (
              <path key={i} d={cutShape(c.kind)} fill={c.c} stroke={K} strokeWidth="5" strokeLinejoin="round"
                transform={`translate(${lerp(c.fx, c.x, p)} ${lerp(c.fy, c.y, p)}) rotate(${c.rot + (1 - p) * 220}) scale(${0.6 + 0.4 * p})`} />
            );
          })}
        </g>

        {/* PIANO 4 — duna con erba e tronco spiaggiato in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <path d="M-200 1990 V1440 Q60 1380 300 1470 Q520 1560 640 1720 Q560 1860 -200 1990 Z" fill="url(#sy-front)" stroke="#070D16" strokeWidth="9" strokeLinejoin="round" />
          <path d="M1280 1990 V1400 Q1060 1360 860 1480 Q680 1600 560 1760 Q700 1900 1280 1990 Z" fill="url(#sy-front)" stroke="#070D16" strokeWidth="9" strokeLinejoin="round" />
          {Array.from({ length: 9 }, (_, i) => {
            const x = i < 5 ? -40 + i * 60 : 840 + (i - 5) * 70;
            const y = i < 5 ? 1420 + Math.abs(i - 3) * 14 : 1420 + (i - 5) * 10;
            const sw = Math.sin(t * 1.6 + i) * 14;
            return <path key={i} d={`M${x} ${y + 40} Q${x + 6} ${y - 40} ${x + 30 + sw} ${y - 130} M${x + 10} ${y + 40} Q${x - 20} ${y - 30} ${x - 30 + sw} ${y - 100}`} fill="none" stroke="#3E5468" strokeWidth="7" strokeLinecap="round" />;
          })}
          <path d="M-200 1760 Q300 1700 1280 1780 V2100 H-200 Z" fill="#0C1422" stroke="#070D16" strokeWidth="9" />
          <path d="M520 1720 Q700 1690 960 1730 L966 1772 Q700 1736 514 1766 Z" fill="#4A4038" stroke="#070D16" strokeWidth="8" strokeLinejoin="round" />
          <path d="M540 1728 Q700 1702 930 1736" fill="none" stroke="#8FA6BC" strokeWidth="4" opacity=".5" />
        </g>

        {/* PIANO 5 — lucciole e particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Fireflies id="sy-ff" t={t} n={9} y={1300} h={500} color="#FFF0A0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="sy-near" t={t} color="#CFE3F4" n={6} vx={-30} vy={-8} opacity={0.1} />
        </g>
      </g>

      <Finish id="sy" tint="#142235" tintOpacity={0.13} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): spilla ≈ 1,6 · stella-faretto ≈ 3,6 · fari d'auto 5,2–7,0 · manica nel vento ≈ 6,8 · ritagli da ≈ 8,5.
