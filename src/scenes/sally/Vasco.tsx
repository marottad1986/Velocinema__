import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes, Notes } from '../../lib/elements';
import { HAND } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { AMBER, CREAM, Disco45, K, RED, TINT_NIGHT } from './Comune';

// Il rocker che racconta le donne: sala prove vuota di sera. Amplificatore con la spia accesa, chitarra elettrica
// appoggiata, asta del microfono; su un baule da tour in primo piano un giradischi con un 45 giri e un quaderno di testi
// aperto; alla parete pannelli fonoassorbenti e un manifesto con uno stadio di luci (nessun volto).
// Piani: parete, pannelli, manifesto (0,25) · amplificatore, chitarra, asta (0,6) · baule, giradischi, quaderno (1,0)
//        · cavi, piatto della batteria, cassa che incornicia (1,3) · pulviscolo e particelle vicine (1,7)
// Eventi: cues[1] «ritratti di donne»: il faro passa dal rosso del rock all'ambra calda
//         · cues[2] «il suo primo disco… Jenny»: il 45 giri parte, l'etichetta si accende, salgono le note; sul quaderno
//           «Jenny» viene sottolineato · cues[4] «arriva Sally»: sul quaderno si scrive «Sally» in rosso.

const r = rng(1977);
const STADIUM = Array.from({ length: 70 }, (_, i) => {
  const row = i % 5, k = Math.floor(i / 5);
  return { x: 158 + k * 17 + (row % 2) * 8, y: 760 - row * 16 - Math.sin((k / 13) * Math.PI) * 26, ph: r() * 6 };
});
const PANELS = Array.from({ length: 20 }, (_, i) => ({ x: 560 + (i % 5) * 92, y: 640 + Math.floor(i / 5) * 104, rot: (i + Math.floor(i / 5)) % 2 }));

/** Chitarra elettrica generica: centro del corpo in (0,0), manico verso -y. */
const Chitarra: React.FC<{ glint: number }> = ({ glint }) => (
  <g>
    <Lin id="sv-gtr" x2={1} y2={0} stops={[[0, '#5A1A22'], [0.45, '#9A2A34'], [1, '#4A1218']]} />
    {/* manico e paletta */}
    <rect x="-16" y="-520" width="32" height="420" fill="#6A4A2A" stroke={K} strokeWidth="7" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-16 ${-500 + i * 32} H16`} stroke="#C8B89A" strokeWidth="3" />)}
    <path d="M-22 -520 L-30 -600 Q0 -620 30 -606 L22 -520 Z" fill="#2A1A14" stroke={K} strokeWidth="7" strokeLinejoin="round" />
    {[-570, -548, -590].map((y, i) => <circle key={i} cx={i % 2 ? 34 : -34} cy={y} r="7" fill="#C8C8D0" stroke={K} strokeWidth="3" />)}
    {/* corpo a doppia spalla mancante */}
    <path d="M-60 -110 C-110 -170 -150 -90 -120 -30 C-170 20 -150 140 -60 160 C0 176 70 172 110 140 C160 96 150 10 112 -24 C140 -80 110 -170 64 -122 C30 -90 -30 -86 -60 -110 Z"
      fill="url(#sv-gtr)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
    <path d="M-100 -40 C-130 0 -120 100 -60 130" fill="none" stroke="#E8707A" strokeWidth="5" opacity={0.35 + 0.4 * glint} strokeLinecap="round" />
    {/* battipenna, pick-up, ponte, manopole */}
    <path d="M-40 -90 Q-90 -40 -70 30 Q-30 90 30 60 Q60 20 40 -60 Z" fill="#1E1418" opacity=".55" />
    {[-50, 10].map((y) => <rect key={y} x="-40" y={y} width="80" height="26" rx="6" fill="#2A2A30" stroke={K} strokeWidth="5" />)}
    <rect x="-38" y="70" width="76" height="16" rx="3" fill="#B8B8C0" stroke={K} strokeWidth="4" />
    {[[70, 70], [92, 100], [60, 120]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="11" fill="#D8C8A0" stroke={K} strokeWidth="4" />)}
    <g stroke="#E8E4DA" strokeWidth="1.6" opacity=".8">{[-9, -3, 3, 9].map((x) => <path key={x} d={`M${x} -520 V78`} />)}</g>
  </g>
);

export const Vasco: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c1 = griglia(cues[1] ?? 2.8), c2 = griglia(cues[2] ?? 5.6), c4 = griglia(cues[4] ?? 11.4);
  const warm = eo(seg(t, c1, c1 + 0.9));
  const play = seg(t, c2, c2 + 0.6);
  // rotazione del 45 giri: parte a c2 e accelera fino a 45 giri/min (0,75 giri/s)
  const spin = t < c2 ? 0 : t < c2 + 0.8 ? 0.75 * (t - c2) ** 2 / 1.6 : 0.75 * (t - c2 - 0.4);
  const under = eo(seg(t, c2 + 0.4, c2 + 1.1));
  const write = seg(t, c4, c4 + 1.3);
  const sallyGlow = eo(seg(t, c4 + 0.2, c4 + 1.2));
  const pilot = 0.75 + 0.25 * Math.sin(t * 5);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sv" />
        <Lin id="sv-wall" stops={[[0, '#0C1020'], [0.35, '#1A2036'], [0.7, '#262A44'], [1, '#141828']]} />
        <Lin id="sv-floor" stops={[[0, '#2A1E1A'], [1, '#120C0A']]} />
        <Lin id="sv-amp" x2={1} y2={0} stops={[[0, '#2A2A30'], [0.5, '#3E3E46'], [1, '#1C1C22']]} />
        <Lin id="sv-case" stops={[[0, '#3A3A42'], [0.5, '#24242C'], [1, '#121218']]} />
        <Lin id="sv-casetop" stops={[[0, '#4A4A54'], [1, '#2E2E36']]} />
        <Lin id="sv-plinth" stops={[[0, '#8A6A4A'], [1, '#5A3E26']]} />
        <Lin id="sv-paper" x2={1} y2={0} stops={[[0, '#E8DCC6'], [0.5, CREAM], [1, '#DCCDB2']]} />
        <Lin id="sv-poster" stops={[[0, '#141A34'], [0.6, '#2A2450'], [1, '#4A2A4A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete scura (calma sotto il titolo), pannelli fonoassorbenti, manifesto con lo stadio di luci */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#sv-wall)" />
          {PANELS.map((p, i) => (
            <g key={i}>
              <rect x={p.x} y={p.y} width="84" height="96" rx="6" fill="#20243A" stroke="#0A0E1A" strokeWidth="4" />
              {[0, 1, 2, 3].map((j) => (p.rot
                ? <path key={j} d={`M${p.x + 10 + j * 20} ${p.y + 10} V${p.y + 86}`} stroke="#2E3450" strokeWidth="6" strokeLinecap="round" />
                : <path key={j} d={`M${p.x + 10} ${p.y + 14 + j * 22} H${p.x + 74}`} stroke="#2E3450" strokeWidth="6" strokeLinecap="round" />))}
            </g>
          ))}
          {/* manifesto: uno stadio di notte fatto solo di luci */}
          <g transform="rotate(-2 280 700)">
            <rect x="120" y="640" width="320" height="200" rx="4" fill="url(#sv-poster)" stroke={K} strokeWidth="7" />
            {STADIUM.map((s, i) => <circle key={i} cx={s.x} cy={s.y + 40} r="3.2" fill={i % 7 === 0 ? AMBER : '#F3E9DC'} opacity={0.45 + 0.45 * Math.sin(t * 2.2 + s.ph)} />)}
            <path d="M150 820 Q280 780 410 820" fill="none" stroke="#6A5A8A" strokeWidth="4" opacity=".7" />
            {[0, 1, 2].map((i) => <path key={i} d={`M${200 + i * 80} 830 L${170 + i * 100} 650`} stroke="#F3E9DC" strokeWidth="10" opacity={0.08 + 0.05 * Math.sin(t * 1.5 + i)} strokeLinecap="round" />)}
            <rect x="128" y="646" width="10" height="10" fill="#B8B0A0" /><rect x="422" y="646" width="10" height="10" fill="#B8B0A0" />
          </g>
          {/* presa e interruttore, battiscopa */}
          <rect x="980" y="1010" width="34" height="44" rx="4" fill="#2E3248" stroke={K} strokeWidth="4" />
          <rect x="-200" y="1092" width="1480" height="18" fill="#0E1220" />
        </g>

        {/* PIANO 1 — pavimento, amplificatore, chitarra, asta del microfono */}
        <g transform={L(0.6)}>
          <rect x="-200" y="1100" width="1480" height="400" fill="url(#sv-floor)" />
          {/* amplificatore */}
          <ellipse cx="300" cy="1104" rx="200" ry="16" fill="#000" opacity=".45" />
          <path d="M240 790 Q300 760 360 790" fill="none" stroke={K} strokeWidth="10" strokeLinecap="round" />
          <rect x="130" y="790" width="340" height="310" rx="14" fill="url(#sv-amp)" stroke={K} strokeWidth="9" />
          <rect x="146" y="806" width="308" height="62" rx="6" fill="#C8B48A" stroke={K} strokeWidth="5" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <circle cx={176 + i * 44} cy="838" r="13" fill="#1A1A1E" stroke={K} strokeWidth="3" />
              <path d={`M${176 + i * 44} 838 l${Math.cos(i * 1.3) * 10} ${Math.sin(i * 1.3) * 10 - 4}`} stroke="#E8E4DA" strokeWidth="3" strokeLinecap="round" />
            </g>
          ))}
          <Glow id="sv-pilot" x={430} y={838} r={70} t={t} color={warm > 0.5 ? AMBER : '#FF4A4A'} amp={0.1} rate={5} opacity={0.6 * pilot} />
          <circle cx="430" cy="838" r="9" fill={warm > 0.5 ? AMBER : '#FF4A4A'} stroke={K} strokeWidth="3" />
          <rect x="150" y="882" width="300" height="200" rx="8" fill="#1A1A20" stroke={K} strokeWidth="6" />
          <g stroke="#34343E" strokeWidth="3">
            {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${158 + i * 24} 888 L${158 + i * 24 - 40} 1076`} />)}
            {Array.from({ length: 13 }, (_, i) => <path key={`b${i}`} d={`M${118 + i * 24} 888 L${158 + i * 24} 1076`} />)}
          </g>
          <rect x="150" y="882" width="300" height="200" rx="8" fill="none" stroke={K} strokeWidth="6" />
          <path d="M136 800 V1090" stroke="#6A6A78" strokeWidth="4" opacity=".6" />
          {[150, 430].map((x) => <rect key={x} x={x} y="1096" width="26" height="12" fill={K} />)}

          {/* asta del microfono, a destra */}
          <path d="M880 1100 L840 1150 M880 1100 L930 1150 M880 1100 V860" stroke="#1E1E24" strokeWidth="11" strokeLinecap="round" />
          <path d="M880 1100 V860" stroke="#7A7A88" strokeWidth="3" opacity=".7" />
          <path d="M880 870 L770 760" stroke="#1E1E24" strokeWidth="9" strokeLinecap="round" />
          <circle cx="880" cy="870" r="12" fill="#2A2A32" stroke={K} strokeWidth="4" />
          <g transform="translate(762 752) rotate(-45)">
            <rect x="-18" y="-10" width="36" height="70" rx="10" fill="#2A2A32" stroke={K} strokeWidth="6" />
            <ellipse cx="0" cy="-26" rx="26" ry="30" fill="#8A8A96" stroke={K} strokeWidth="6" />
            <g stroke="#4A4A56" strokeWidth="2.5">{[-14, -4, 6, 16].map((d) => <path key={d} d={`M-22 ${-26 + d * 0.9} H22`} />)}</g>
            <path d="M-14 -46 q10 -8 22 -2" fill="none" stroke="#E8E8F0" strokeWidth="4" strokeLinecap="round" opacity=".7" />
          </g>
          {/* chitarra appoggiata all'amplificatore */}
          <ellipse cx="630" cy="1104" rx="110" ry="14" fill="#000" opacity=".4" />
          <g transform="translate(610 1030) rotate(-30) scale(0.7)">
            <Chitarra glint={warm} />
          </g>
        </g>

        {/* fascio del faro: rosso del rock, poi ambra calda quando si parla di donne */}
        <g transform={L(0.7)}>
          <Beam id="sv-beam-r" x={1040} y={660} t={t} length={980} spread={360} color="#E84A4A" angle={128} sweep={3} sweepRate={0.5} opacity={0.32 * (1 - warm)} />
          <Beam id="sv-beam-a" x={1040} y={660} t={t} length={980} spread={360} color="#FFD08A" angle={128} sweep={3} sweepRate={0.5} opacity={0.36 * warm} />
          <Dust t={t} seed={7} n={22} top={{ y: 680, x0: 940, x1: 1040 }} bottom={{ y: 1180, x0: 420, x1: 760 }} color="#FFE6C0" />
        </g>

        {/* PIANO 2 — baule da tour con il giradischi e il quaderno dei testi */}
        <g transform={L(1.0)}>
          <path d="M60 1090 H1020 L1060 1246 H20 Z" fill="url(#sv-casetop)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M20 1246 H1060 V1760 H20 Z" fill="url(#sv-case)" stroke={K} strokeWidth="9" />
          {/* profili in alluminio, angolari, maniglia, chiusure */}
          <path d="M20 1262 H1060 M20 1744 H1060" stroke="#9A9AA8" strokeWidth="10" />
          <path d="M66 1094 H1014" stroke="#B8B8C8" strokeWidth="4" opacity=".6" />
          {[[20, 1246], [1000, 1246], [20, 1700], [1000, 1700]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width="60" height="60" rx="8" fill="#B8B8C4" stroke={K} strokeWidth="5" />
              <circle cx={x + 30} cy={y + 30} r="7" fill="#6A6A78" />
            </g>
          ))}
          {[300, 780].map((x) => (
            <g key={x}>
              <rect x={x - 40} y="1290" width="80" height="54" rx="6" fill="#A8A8B4" stroke={K} strokeWidth="5" />
              <path d={`M${x - 18} 1318 H${x + 18}`} stroke={K} strokeWidth="6" strokeLinecap="round" />
            </g>
          ))}
          <path d="M440 1470 Q540 1430 640 1470" fill="none" stroke="#1A1A20" strokeWidth="18" strokeLinecap="round" />
          <path d="M440 1470 Q540 1430 640 1470" fill="none" stroke="#5A5A66" strokeWidth="5" strokeLinecap="round" />
          {/* adesivi consumati sul baule: solo forme, niente scritte di marchi */}
          <rect x="140" y="1400" width="120" height="70" rx="10" fill="#8A2A34" opacity=".6" transform="rotate(-6 200 1435)" />
          <circle cx="860" cy="1460" r="46" fill="#C8A04A" opacity=".45" />

          {/* giradischi */}
          <g transform="translate(22 0)">
          <path d="M150 1112 H510 L522 1222 H138 Z" fill="url(#sv-plinth)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <path d="M138 1222 H522 V1240 H138 Z" fill="#3E2A18" stroke={K} strokeWidth="5" />
          <ellipse cx="318" cy="1168" rx="146" ry="42" fill="#2A2A30" stroke={K} strokeWidth="6" />
          <Disco45 x={318} y={1166} rx={128} ry={36} spin={spin} lit={play} />
          <Glow id="sv-label" x={318} y={1166} r={140} t={t} color={AMBER} amp={0.06} rate={3} opacity={0.35 * play} />
          {/* braccio */}
          <circle cx="480" cy="1132" r="16" fill="#B8B8C4" stroke={K} strokeWidth="5" />
          <path d={`M480 1132 L${lerp(470, 410, play)} ${lerp(1196, 1180, play)} L${lerp(440, 372, play)} ${lerp(1200, 1176, play)}`} fill="none" stroke="#D8D8E0" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M480 1132 L${lerp(470, 410, play)} ${lerp(1196, 1180, play)} L${lerp(440, 372, play)} ${lerp(1200, 1176, play)}`} fill="none" stroke={K} strokeWidth="2" opacity=".5" />
          <circle cx="186" cy="1206" r="8" fill={play > 0.5 ? '#7AE07A' : '#3A4A3A'} stroke={K} strokeWidth="3" />

          </g>
          {/* quaderno dei testi aperto */}
          <g transform="translate(770 1160) scale(0.9) translate(-770 -1160) rotate(-3 770 1160)">
            <ellipse cx="772" cy="1236" rx="230" ry="16" fill="#000" opacity=".35" />
            <path d="M580 1104 L770 1096 L772 1230 L566 1236 Z" fill="url(#sv-paper)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <path d="M770 1096 L956 1106 L974 1234 L772 1230 Z" fill="url(#sv-paper)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <g stroke="#A8B8D0" strokeWidth="2">
              {[0, 1, 2, 3, 4].map((j) => <path key={j} d={`M${584 - j * 3} ${1126 + j * 22} L${764} ${1122 + j * 22}`} />)}
              {[0, 1, 2, 3, 4].map((j) => <path key={`r${j}`} d={`M778 ${1122 + j * 22} L${958 + j * 3} ${1128 + j * 22}`} />)}
            </g>
            <path d="M770 1096 L772 1230" stroke="#9A8A72" strokeWidth="4" />
            {/* pagina sinistra: Jenny, già scritta, e qualche riga cancellata */}
            <text x="600" y="1162" fontFamily={HAND} fontSize="50" fill="#2A3050">Jenny</text>
            <path d={`M598 1172 h${130 * under}`} stroke={AMBER} strokeWidth="5" strokeLinecap="round" />
            <path d="M600 1196 h110 M600 1218 h70" stroke="#5A6080" strokeWidth="3" strokeLinecap="round" opacity=".6" />
            <path d="M680 1212 l40 -12 M684 1200 l40 14" stroke="#5A6080" strokeWidth="3" opacity=".5" />
            {/* pagina destra: Sally, scritta in rosso quando arriva */}
            <Glow id="sv-sally" x={866} y={1170} r={150} t={t} color={RED} amp={0.05} rate={2} opacity={0.45 * sallyGlow} />
            <clipPath id="sv-write"><rect x="780" y="1100" width={190 * write} height="130" /></clipPath>
            <text x="790" y="1190" fontFamily={HAND} fontSize="66" fill={RED} clipPath="url(#sv-write)">Sally</text>
            {/* penna che segue la scrittura */}
            <g transform={`translate(${lerp(790, 960, write)} ${1180 - Math.sin(write * 30) * 6 * (write > 0 && write < 1 ? 1 : 0)}) rotate(-35)`}>
              <rect x="-6" y="-120" width="14" height="118" rx="5" fill="#1E2A4A" stroke={K} strokeWidth="4" />
              <path d="M-6 -2 L1 14 L8 -2 Z" fill="#C8C8D0" stroke={K} strokeWidth="3" />
              <rect x="-6" y="-120" width="14" height="22" rx="4" fill={AMBER} stroke={K} strokeWidth="3" />
            </g>
          </g>
          <Notes t={t - c2} x={340} y={1100} n={6} spread={260} rise={360} color={AMBER} outline={K} size={0.85 * play} speed={0.24} />
        </g>

        {/* PIANO 3 — primo piano che incornicia: cassa acustica a sinistra, piatto della batteria a destra, cavi */}
        <g transform={L(1.3)}>
          <rect x="-260" y="760" width="250" height="1300" rx="10" fill="#14141A" stroke={K} strokeWidth="10" />
          <path d="M-20 780 V2040" stroke="#4A4A56" strokeWidth="5" opacity=".7" />
          {[960, 1280, 1600].map((y) => <circle key={y} cx="-120" cy={y} r="120" fill="#0C0C10" stroke="#2A2A34" strokeWidth="8" />)}
          <g transform={`translate(1110 1560) rotate(${-8 + Math.sin(t * 1.3) * 1.2})`}>
            <ellipse cx="0" cy="0" rx="250" ry="46" fill="#B8903A" stroke={K} strokeWidth="9" />
            {[0.75, 0.5, 0.25].map((k) => <ellipse key={k} cx="0" cy="0" rx={250 * k} ry={46 * k} fill="none" stroke="#8A6A2A" strokeWidth="3" />)}
            <path d="M-210 -16 Q-100 -40 40 -36" fill="none" stroke="#FFE8A8" strokeWidth="6" strokeLinecap="round" opacity={0.4 + 0.3 * warm} />
            <ellipse cx="0" cy="0" rx="22" ry="8" fill="#6A5020" stroke={K} strokeWidth="4" />
          </g>
          <path d="M1010 2000 V1580" stroke="#2A2A30" strokeWidth="14" />
          <g fill="none" strokeLinecap="round">
            <path d="M-40 1840 Q200 1760 380 1860 T760 1830 T1120 1880" stroke="#0A0A0E" strokeWidth="22" />
            <path d="M-40 1840 Q200 1760 380 1860 T760 1830 T1120 1880" stroke="#3A3A46" strokeWidth="6" />
            <path d="M100 1940 Q300 1880 520 1930" stroke="#0A0A0E" strokeWidth="18" />
          </g>
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="sv-near" t={t} color="#FFE6C0" opacity={0.08 + 0.04 * warm} />
          {Array.from({ length: 10 }, (_, i) => {
            const p = mod(t * 0.04 + i / 10, 1);
            return <circle key={i} cx={760 + Math.sin(i * 2.1 + t * 0.4) * 180} cy={760 + p * 460} r={3} fill="#FFE6C0" opacity={0.45 * Math.sin(p * Math.PI) * (0.4 + 0.6 * warm)} />;
          })}
        </g>
      </g>

      <Finish id="sv" tint={TINT_NIGHT} tintOpacity={0.12} />
    </svg>
  );
};
