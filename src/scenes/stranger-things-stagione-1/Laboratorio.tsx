import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Beam, Fog, Glow, NearMotes, Rain, Reflection } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Abete, K, Ombra, StDefs, VELATURA } from './Comuni';

// La bambina scappata dal laboratorio: il cancello del laboratorio segreto nel bosco, di notte sotto una pioggerella.
// Eventi: prima frase l'edificio di cemento con le finestre fredde si accende piano dietro la recinzione; seconda frase
// dal cancello con la sbarra alzata escono, una alla volta, piccole impronte di piedi nudi nel fango (Undici, mai
// disegnata); terza frase scatta l'allarme: il lampeggiante rosso sulla garitta gira e due riflettori cominciano a
// frugare il bosco (gli uomini del laboratorio la cercano).
// Piani: cielo con nuvole basse (0,22) · bosco lontano (0,36) · edificio del laboratorio e torri dei riflettori (0,48)
//        · recinzione, garitta, sbarra (0,66) · strada di fango con le impronte (0,9) · paletti e felci (1,2)
//        · pioggia vicina (1,5) · nebbia vicina (1,8)

const r = rng(1101);
const FAR = Array.from({ length: 16 }, (_, i) => ({ x: -200 + i * 96 + r() * 36, h: 220 + r() * 220, w: 110 + r() * 50 }));
const FERNS = Array.from({ length: 22 }, (_, i) => ({ x: i < 11 ? -40 + i * 30 : 760 + (i - 11) * 34, y: 1700 + r() * 220, s: 0.7 + r() * 0.6, a: (r() - 0.5) * 30 }));
/** Impronte di piedi nudi dal cancello verso il bordo sinistro: posizione, scala, piede sinistro o destro. */
const STEPS = Array.from({ length: 10 }, (_, i) => {
  const p = i / 9;
  return { x: lerp(565, 300, p) + (i % 2 ? 24 : -24) * lerp(0.6, 1.4, p), y: lerp(1086, 1720, p * p * 0.6 + p * 0.4), s: lerp(0.6, 1.5, p), left: i % 2 === 0 };
});

const Impronta: React.FC<{ x: number; y: number; s: number; left: boolean; o: number }> = ({ x, y, s, left, o }) => (
  <g transform={`translate(${x} ${y}) scale(${left ? -s * 1.5 : s * 1.5} ${s * 0.8}) rotate(${left ? 12 : 12})`} opacity={o}>
    <path d="M-9 -26 Q-14 -8 -12 8 Q-10 24 0 26 Q11 24 11 6 Q12 -10 6 -26 Q-1 -34 -9 -26 Z" fill="#46566C" stroke="#07060A" strokeWidth="5" />
    {[[-9, -38, 6], [0, -42, 5], [8, -40, 4.5], [14, -34, 4], [18, -26, 3.5]].map(([tx, ty, tr], i) => <circle key={i} cx={tx} cy={ty} r={tr} fill="#46566C" stroke="#07060A" strokeWidth="3" />)}
    <path d="M-6 -22 Q-9 -6 -7 10" stroke="#BCD0E4" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".85" />
  </g>
);

export const Laboratorio: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  // prima frase: le finestre del laboratorio si accendono una fila alla volta
  const winOn = (row: number) => eo(seg(t, 0.3 + row * 0.5, 0.9 + row * 0.5));
  // seconda frase: le impronte compaiono una alla volta, a tempo di croma
  const stepAt = (i: number) => griglia(cues[1] + 0.25 + i * 0.36, 2);
  // terza frase: l'allarme
  const tAlarm = griglia(cues[2] + 0.2);
  const alarm = eo(seg(t, tAlarm, tAlarm + 0.3));
  const spin = (t - tAlarm) * 2.6;
  const redPulse = alarm * (0.5 + 0.5 * Math.cos(spin));
  const searchOn = eo(seg(t, tAlarm + 0.4, tAlarm + 1.1));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="lb" />
        <StDefs id="lb" />
        <Lin id="lb-sky" stops={[[0, '#06080E'], [0.3, '#0E1522'], [0.55, '#1C2638'], [0.68, '#2A364A']]} />
        <Lin id="lb-mud" stops={[[0, '#2A2620'], [0.4, '#1E1A16'], [1, '#0C0A08']]} />
        <Lin id="lb-concrete" x2={1} y2={0} stops={[[0, '#5A6270'], [0.55, '#464E5A'], [1, '#2E343E']]} />
        <Lin id="lb-booth" x2={1} y2={0} stops={[[0, '#7A8290'], [0.5, '#5E6672'], [1, '#3A404A']]} />
        <pattern id="lb-link" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M0 0 L22 22 M22 0 L0 22" stroke="#8A96A6" strokeWidth="2" />
        </pattern>
        <clipPath id="lb-clip"><rect x="-300" y="660" width="1700" height="1500" /></clipPath>
        <radialGradient id="lb-red"><stop offset="0" stopColor="#FF5A4A" stopOpacity=".9" /><stop offset="1" stopColor="#FF5A4A" stopOpacity="0" /></radialGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo coperto (0,22) */}
        <g transform={L(0.22)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#lb-sky)" />
          <Fog id="lb-cl1" t={t} y={700} x={400} rx={600} ry={60} color="#2E3A50" opacity={0.7} speed={0.08} drift={60} />
          <Fog id="lb-cl2" t={t} y={790} x={800} rx={560} ry={50} color="#34405A" opacity={0.6} speed={0.1} ph={2} drift={70} />
          <Glow id="lb-skyred" x={730} y={900} r={520} t={t} color="#C8302A" amp={0} opacity={0.35 * redPulse} />
        </g>

        {/* PIANO 1 — bosco lontano senza contorni (0,36) */}
        <g transform={L(0.36, 0, -100)}>
          {FAR.map((f, i) => <Abete key={i} x={f.x} y={1100} h={f.h} w={f.w} color="#121C2C" seed={i + 40} />)}
          <rect x="-200" y="1090" width="1480" height="200" fill="#10182A" />
        </g>

        {/* PIANO 2 — edificio del laboratorio, torri dei riflettori (0,48) */}
        <g transform={L(0.48, 0, -90)}>
          {/* corpo basso di cemento con file di finestre fredde */}
          <path d="M150 870 H930 V1130 H150 Z" fill="url(#lb-concrete)" stroke="#1A1E26" strokeWidth="6" />
          <path d="M150 870 H930" stroke="#8A96A8" strokeWidth="4" opacity=".5" />
          <rect x="420" y="830" width="260" height="40" fill="#3E4652" stroke="#1A1E26" strokeWidth="6" />
          <path d="M470 830 V790 M476 802 h30 M640 830 V806" stroke="#1A1E26" strokeWidth="6" />
          <circle cx="470" cy="786" r="6" fill="#FF6A5A" opacity={0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2))} />
          {[0, 1, 2].map((row) => Array.from({ length: 12 }, (_, i) => {
            const lit = (i * 7 + row * 3) % 5 !== 0;
            return <rect key={`${row}-${i}`} x={178 + i * 62} y={900 + row * 70} width="36" height="34" fill={lit ? '#CFE4F0' : '#1E2430'} opacity={lit ? 0.25 + 0.65 * winOn(row) : 1} />;
          }))}
          <Glow id="lb-bld" x={540} y={980} r={420} t={t} color="#9CC8E0" amp={0.02} rate={1} opacity={0.22 * winOn(1)} />
          {/* torri dei riflettori */}
          {[110, 970].map((tx, i) => (
            <g key={tx}>
              <path d={`M${tx - 24} 1130 L${tx - 6} 880 M${tx + 24} 1130 L${tx + 6} 880 M${tx - 20} 1060 L${tx + 18} 980 M${tx + 20} 1060 L${tx - 18} 980 M${tx - 14} 950 L${tx + 12} 900`} stroke="#1A1E26" strokeWidth="6" />
              <rect x={tx - 30} y="856" width="60" height="30" rx="6" fill="#3A404A" stroke="#0E1016" strokeWidth="5" />
              <circle cx={tx} cy="871" r="11" fill="#F4F8FF" opacity={0.3 + 0.7 * searchOn} />
              <Glow id={`lb-tw${i}`} x={tx} y={871} r={90} t={t} color="#E8F0FF" amp={0.05} rate={3} opacity={0.8 * searchOn} />
            </g>
          ))}
          <Fog id="lb-f1" t={t} y={1120} rx={900} ry={70} color="#4A5A74" opacity={0.55} speed={0.2} drift={80} />
        </g>

        {/* fasci dei riflettori che frugano il bosco (dietro la recinzione) */}
        <g transform={L(0.55, 0, -90)} opacity={searchOn}>
          <Beam id="lb-b1" x={110} y={871} t={t} length={1100} spread={260} color="#DCE8FF" angle={28} sweep={16} sweepRate={0.9} opacity={0.4} />
          <Beam id="lb-b2" x={970} y={871} t={t + 1.7} length={1100} spread={260} color="#DCE8FF" angle={150} sweep={18} sweepRate={0.75} opacity={0.4} />
        </g>

        {/* PIANO 3 — recinzione con il filo spinato, garitta, sbarra alzata, cartello (0,66) */}
        <g transform={L(0.66, 0, -130)}>
          {/* rete a sinistra e a destra del varco */}
          {[[-140, 470], [830, 1240]].map(([x0, x1], i) => (
            <g key={i}>
              <rect x={x0} y="960" width={x1 - x0} height="240" fill="url(#lb-link)" opacity=".5" />
              <path d={`M${x0} 960 H${x1} M${x0} 1196 H${x1}`} stroke="#5A6472" strokeWidth="6" />
              {Array.from({ length: Math.ceil((x1 - x0) / 120) + 1 }, (_, k) => {
                const px = x0 + k * 120;
                return (
                  <g key={k}>
                    <rect x={px - 6} y="930" width="12" height="276" fill="#6A7482" stroke={K} strokeWidth="4" />
                    <path d={`M${px} 934 l26 -22`} stroke={K} strokeWidth="5" />
                  </g>
                );
              })}
              {/* filo spinato a spirale */}
              {Array.from({ length: Math.ceil((x1 - x0) / 28) }, (_, k) => (
                <ellipse key={k} cx={x0 + k * 28 + 14} cy="920" rx="20" ry="16" fill="none" stroke="#8A94A2" strokeWidth="2.5" opacity=".75" />
              ))}
            </g>
          ))}
          {/* cartello di divieto sulla rete di sinistra */}
          <rect x="130" y="1018" width="230" height="110" fill="#E8E2D2" stroke={K} strokeWidth="7" />
          <rect x="130" y="1018" width="230" height="36" fill="#B8352F" stroke={K} strokeWidth="7" />
          <text x="245" y="1046" textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="800" fontSize="24" fill="#F2E3C6" letterSpacing="2">ALT</text>
          <text x="245" y="1084" textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="800" fontSize="22" fill="#1A1E26">AREA RISERVATA</text>
          <text x="245" y="1112" textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="400" fontSize="17" fill="#3A404A">VIETATO L'ACCESSO</text>
          <rect x="130" y="1018" width="230" height="110" fill="#FF4A3A" opacity={0.25 * redPulse} />
          {/* garitta con la finestra accesa e il lampeggiante */}
          <Ombra id="lb" x={740} y={1206} rx={140} ry={14} />
          <path d="M650 990 H830 V1204 H650 Z" fill="url(#lb-booth)" stroke={K} strokeWidth="9" />
          <path d="M636 978 H844 V1000 H636 Z" fill="#2E343E" stroke={K} strokeWidth="7" />
          <rect x="672" y="1024" width="136" height="70" fill="#D8E8F2" stroke={K} strokeWidth="6" opacity=".9" />
          <rect x="672" y="1024" width="136" height="70" fill="url(#lb-glass)" />
          <path d="M740 1024 V1094" stroke={K} strokeWidth="5" />
          <path d="M688 1070 h40 v12 h-40 Z" fill="#5A606A" />
          <path d="M760 1060 q14 -14 28 0 v20 h-28 Z" fill="#3A3026" />
          <rect x="690" y="1110" width="44" height="94" fill="#3A404A" stroke={K} strokeWidth="5" />
          <circle cx="726" cy="1160" r="4" fill="#B0B8C4" />
          <Glow id="lb-booth" x={740} y={1060} r={170} t={t} color="#CFE4F0" amp={0.03} rate={2} opacity={0.45} />
          {/* lampeggiante rosso: cupola, specchio che gira, alone */}
          <rect x="722" y="960" width="36" height="18" fill="#2A2E36" stroke={K} strokeWidth="4" />
          <path d="M724 960 Q724 930 740 928 Q756 930 756 960 Z" fill={alarm > 0.05 ? '#FF5A4A' : '#5A2422'} stroke={K} strokeWidth="5" />
          <path d="M730 952 Q732 938 740 936" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity={0.3 + 0.5 * redPulse} />
          <Glow id="lb-redcore" x={740} y={946} r={110} t={t} color="#FF4A3A" amp={0} opacity={0.9 * redPulse} />
          {alarm > 0 && <Beam id="lb-redbeam" x={740} y={946} t={spin} length={900} spread={220} color="#FF4A3A" angle={0} spin={1} opacity={0.5 * alarm} />}
          {/* sbarra alzata a strisce */}
          <rect x="836" y="1100" width="40" height="104" fill="#5A6270" stroke={K} strokeWidth="6" />
          <g transform="translate(856 1110) rotate(-62)">
            <rect x="-6" y="-12" width="320" height="24" fill="#E8E2D2" stroke={K} strokeWidth="6" />
            {[40, 120, 200].map((sx) => <rect key={sx} x={sx} y="-9" width="40" height="18" fill="#B8352F" />)}
          </g>
          <Fog id="lb-f2" t={t} y={1200} rx={760} ry={60} color="#5A6A84" opacity={0.4} speed={0.24} ph={1} drift={90} />
        </g>

        {/* PIANO 4 — strada di fango con pozzanghere e le impronte di piedi nudi (0,9) */}
        <g transform={L(0.9)}>
          <path d="M-200 1074 Q540 1066 1280 1076 V2200 H-200 Z" fill="#141A16" />
          <path d="M470 1074 H660 L1000 2200 H-80 Z" fill="url(#lb-mud)" stroke={K} strokeWidth="6" />
          {/* solchi delle gomme */}
          <path d="M520 1076 Q430 1550 300 2200 M610 1076 Q700 1550 800 2200" stroke="#0C0A08" strokeWidth="14" fill="none" opacity=".6" />
          <path d="M534 1076 Q446 1550 320 2200 M596 1076 Q684 1550 780 2200" stroke="#3A342C" strokeWidth="3" fill="none" opacity=".6" />
          {/* pozzanghere che riflettono la garitta e il rosso dell'allarme */}
          {[[720, 1200, 90], [380, 1560, 150], [720, 1760, 170]].map(([px, py, rx], i) => (
            <g key={i}>
              <ellipse cx={px} cy={py} rx={rx} ry={rx * 0.18} fill="#1A2230" stroke={K} strokeWidth="4" />
              <Reflection t={t + i} x={px} y={py - rx * 0.1} color="#CFE4F0" n={3} w={rx * 0.9} gap={7} opacity={0.5} />
              <ellipse cx={px} cy={py} rx={rx * 0.9} ry={rx * 0.15} fill="#FF4A3A" opacity={0.22 * redPulse} />
              <circle cx={px - rx * 0.3 + (Math.sin(t * 3 + i * 2) * rx) / 3} cy={py} r={4 + ((t * 20 + i * 7) % 14)} fill="none" stroke="#9AB0C8" strokeWidth="2" opacity={0.5 - ((t * 20 + i * 7) % 14) / 30} />
            </g>
          ))}
          {/* impronte che escono dal cancello */}
          {STEPS.map((st, i) => (
            <Impronta key={i} x={st.x} y={st.y} s={st.s} left={st.left} o={eo(seg(t, stepAt(i), stepAt(i) + 0.25))} />
          ))}
        </g>

        {/* PIANO 5 — paletti di confine, felci e erba bagnata ai bordi (1,2) */}
        <g transform={L(1.2)}>
          {[[-30, 1300], [1020, 1260]].map(([px, py], i) => (
            <g key={i}>
              <rect x={px} y={py} width="70" height="900" fill="#3A3026" stroke={K} strokeWidth="9" />
              <path d={`M${px + 8} ${py + 10} V${py + 880}`} stroke="#7A6A56" strokeWidth="4" opacity=".5" />
              <rect x={px - 6} y={py + 90} width="82" height="44" fill="#E8E2D2" stroke={K} strokeWidth="6" />
              <rect x={px - 6} y={py + 90} width="82" height="44" fill="#FF4A3A" opacity={0.35 * redPulse} />
              <path d={`M${px + 4} ${py + 112} h62`} stroke="#B8352F" strokeWidth="10" />
            </g>
          ))}
          {FERNS.map((f, i) => (
            <g key={i} transform={`translate(${f.x} ${f.y}) rotate(${f.a + Math.sin(t * 1.1 + i) * 3}) scale(${f.s})`}>
              <path d="M0 0 Q10 -120 40 -220" stroke="#1E3424" strokeWidth="9" fill="none" strokeLinecap="round" />
              {Array.from({ length: 7 }, (_, k) => {
                const yy = -30 - k * 28, xx = 5 + k * 5;
                return <path key={k} d={`M${xx} ${yy} q-40 -6 -64 10 M${xx} ${yy} q40 -16 60 -2`} stroke={k % 2 ? '#24402C' : '#2C4A34'} strokeWidth="8" fill="none" strokeLinecap="round" />;
              })}
            </g>
          ))}
        </g>

        {/* PIANO 6 — pioggia su due livelli e nebbia vicina (1,5–1,8) */}
        <g transform={L(0.6)} clipPath="url(#lb-clip)">
          <Rain t={t} level="far" seed={21} color="#8EA4C0" opacity={0.28} y={640} h={1500} />
        </g>
        <g transform={L(1.5)} clipPath="url(#lb-clip)">
          <Rain t={t} level="near" seed={22} color="#B8CCE0" opacity={0.32} y={640} h={1500} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="lb-near" t={t} color="#8A9AB8" n={6} r0={90} r1={180} opacity={0.1} y0={760} />
        </g>
      </g>
      <Finish id="lb" tint={VELATURA} tintOpacity={0.12} />
    </svg>
  );
};
