import React from 'react';
import { camera, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Notes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Fiamma, K, OthersDefs, Ombra, Tenda } from './Comuni';

// Rumori nella casa: la stanza della musica al buio, illuminata solo dalle due candele sui bracci del pianoforte.
// Il pianoforte verticale col coperchio dei tasti aperto e lo spartito; a sinistra il cavallo a dondolo dei bambini.
// Eventi: prima frase il cavallo a dondolo comincia a dondolare da solo (Anne dice di vedere un bambino, Victor);
// seconda frase le fiamme delle candele si piegano e la tenda della finestra si gonfia, come se qualcuno passasse;
// terza frase i tasti si abbassano da soli in fila e salgono le note. Nessuna persona.
// Piani: parete e finestra con la tenda (0,3) · pianoforte (0,65) · tasti e candele (0,65) · pavimento e tappeto (0,8)
//        · cavallo a dondolo (1,1) · sgabello in primo piano (1,3) · pulviscolo (1,5–1,8)

const WHITE = 36, KX0 = 232, KX1 = 848, KW = (KX1 - KX0) / WHITE;
const BLACK = [1, 2, 4, 5, 6]; // nei gruppi da 7 tasti bianchi, i neri dopo il 1°, 2°, 4°, 5°, 6°

export const Pianoforte: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const rock = seg(t, cues[0] + 0.3, cues[0] + 1) * Math.sin((t - cues[0]) * 2.6) * 9;
  const draft = Math.sin(Math.PI * seg(t, cues[1] + 0.1, cues[1] + 2.2));
  const playing = seg(t, cues[2] + 1.2, cues[2] + 1.6);
  const pressed = (i: number) => {
    if (playing <= 0) return 0;
    const k = Math.floor((t - cues[2] - 1.2) * 2.4); // crome a 72 bpm, come il pianoforte dello spartito
    const seq = [14, 18, 21, 16, 19, 23, 21, 18, 14, 16, 25, 21, 19, 18, 16, 14];
    const n = seq[((k % seq.length) + seq.length) % seq.length];
    return i === n || i === n - 7 ? 1 : 0;
  };
  const bend = 18 * draft;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pf" />
        <OthersDefs id="pf" />
        <Lin id="pf-wall" stops={[[0, '#0E1210'], [0.4, '#1E2620'], [0.7, '#2A3028'], [1, '#141812']]} />
        <Lin id="pf-floor" stops={[[0, '#2E2014'], [1, '#0C0806']]} />
        <Lin id="pf-ebony" x2={1} y2={0} stops={[[0, '#1A0E0A'], [0.4, '#4A2A1C'], [0.6, '#3A2014'], [1, '#140A06']]} />
        <Lin id="pf-night" stops={[[0, '#1A2630'], [1, '#3A4A50']]} />
        <Lin id="pf-ivory" stops={[[0, '#F2EAD4'], [1, '#C8BC9A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete, cornice vuota, finestra notturna con la tenda (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#pf-wall)" />
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-180 + i * 110} 600 V1060`} stroke="#3A4636" strokeWidth="18" opacity=".25" />)}
          <path d="M-200 1060 H1280" stroke="#3A2A1C" strokeWidth="24" />
          <rect x="900" y="640" width="230" height="420" fill="url(#pf-night)" stroke={K} strokeWidth="8" />
          <path d="M1015 640 V1060 M900 850 H1130" stroke="#2A302C" strokeWidth="9" />
          <Tenda id="pf" x={880} y={610} w={210 + 60 * draft} h={480} t={t} side="left" sway={4 + 10 * draft} folds={4} />
          <rect x="860" y="596" width="300" height="16" rx="8" fill="url(#pf-brass)" stroke={K} strokeWidth="4" />
          {/* cornice con un paesaggio scuro, nessuna persona */}
          <g transform="translate(120 760)">
            <rect x="-90" y="-110" width="180" height="220" fill="url(#pf-brass)" stroke={K} strokeWidth="6" />
            <rect x="-72" y="-92" width="144" height="184" fill="#2A3430" stroke={K} strokeWidth="3" />
            <path d="M-72 40 Q-20 0 20 30 T72 10 V92 H-72 Z" fill="#1A2420" />
            <circle cx="30" cy="-40" r="14" fill="#C8C8B0" opacity=".5" />
          </g>
        </g>

        {/* PIANO 1 — il pianoforte verticale con le candele (0,65) */}
        <g transform={L(0.65)}>
          <Glow id="pf-c1" x={262} y={810} r={300} t={t} color="#FFC870" amp={0.08} rate={8} opacity={0.75} />
          <Glow id="pf-c2" x={818} y={810} r={300} t={t} color="#FFC870" amp={0.08} rate={8} ph={2} opacity={0.75} />
          <Ombra id="pf" x={540} y={1262} rx={430} ry={34} />
          {/* cassa superiore */}
          <path d="M180 690 H900 V1000 H180 Z" fill="url(#pf-ebony)" stroke={K} strokeWidth="9" />
          <rect x="164" y="670" width="752" height="30" rx="6" fill="url(#pf-ebony)" stroke={K} strokeWidth="8" />
          <path d="M172 676 H908" stroke="#C88A5A" strokeWidth="4" opacity=".55" />
          {/* pannello traforato con la stoffa dietro */}
          <rect x="300" y="730" width="480" height="140" rx="10" fill="#4A1E1A" stroke={K} strokeWidth="6" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${330 + i * 52} 742 q20 30 0 60 q-20 30 0 56 M${330 + i * 52} 800 q26 -6 52 0`} stroke="#2A140C" strokeWidth="9" fill="none" />)}
          {/* leggio con lo spartito */}
          <rect x="360" y="880" width="360" height="22" fill="url(#pf-ebony)" stroke={K} strokeWidth="5" />
          <g transform="translate(540 890) rotate(-1)">
            <rect x="-150" y="-120" width="148" height="120" fill="url(#pf-paper)" stroke={K} strokeWidth="4" />
            <rect x="2" y="-120" width="148" height="120" fill="url(#pf-paper)" stroke={K} strokeWidth="4" />
            {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((l) => <path key={`${r}${l}`} d={`M-140 ${-104 + r * 26 + l * 4} H140`} stroke="#5A5040" strokeWidth="1.5" />))}
            {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={-130 + i * 12.5} cy={-100 + (i % 4) * 26 + ((i * 7) % 5) * 3} r="3" fill="#2A2418" />)}
          </g>
          {/* bracci delle candele */}
          {[[262, -1], [818, 1]].map(([cx, dir], i) => (
            <g key={i}>
              <path d={`M${cx - dir * 70} 900 Q${cx - dir * 20} 900 ${cx} 870`} stroke={K} strokeWidth="14" fill="none" />
              <path d={`M${cx - dir * 70} 900 Q${cx - dir * 20} 900 ${cx} 870`} stroke="#C8A050" strokeWidth="6" fill="none" />
              <ellipse cx={cx} cy={868} rx="30" ry="9" fill="url(#pf-brass)" stroke={K} strokeWidth="4" />
              <rect x={cx - 12} y="800" width="24" height="68" fill="#F2EAD4" stroke={K} strokeWidth="4" />
              <path d={`M${cx - 6} 804 V860`} stroke="#FFFFFF" strokeWidth="3" opacity=".6" />
              <path d={`M${cx + 6} 804 q2 10 -2 16`} stroke="#E8DCC0" strokeWidth="5" fill="none" />
              <Fiamma id="pf" x={cx} y={802} t={t} s={1.25} ph={i * 2} bend={bend} />
            </g>
          ))}
          {/* coperchio della tastiera aperto e tastiera */}
          <rect x="196" y="984" width="688" height="26" fill="url(#pf-ebony)" stroke={K} strokeWidth="6" />
          <rect x="210" y="1006" width="660" height="70" fill="#1A0E0A" stroke={K} strokeWidth="6" />
          {Array.from({ length: WHITE }, (_, i) => {
            const p = pressed(i);
            return <rect key={i} x={KX0 + i * KW} y={1010 + p * 8} width={KW - 1.5} height={60 - p * 4} fill={p ? '#FFD98A' : 'url(#pf-ivory)'} stroke={K} strokeWidth="2" />;
          })}
          {Array.from({ length: WHITE }, (_, i) => BLACK.includes(i % 7) && i > 0 && (
            <rect key={`b${i}`} x={KX0 + i * KW - KW * 0.3} y="1010" width={KW * 0.6} height="34" fill="#100806" stroke={K} strokeWidth="2" />
          ))}
          <path d="M214 1074 H866" stroke="#4A2A1C" strokeWidth="6" />
          {/* cassa inferiore, mensole, pedali */}
          <path d="M190 1076 H890 V1250 H190 Z" fill="url(#pf-ebony)" stroke={K} strokeWidth="9" />
          <rect x="250" y="1110" width="580" height="110" rx="8" fill="none" stroke="#5A3020" strokeWidth="6" />
          {[200, 856].map((x) => <path key={x} d={`M${x} 1080 q-10 50 0 90 q10 40 -4 80`} stroke="#5A3020" strokeWidth="10" fill="none" />)}
          {[500, 580].map((x) => <rect key={x} x={x - 14} y="1226" width="28" height="14" rx="6" fill="url(#pf-brass)" stroke={K} strokeWidth="3" />)}
          <path d="M196 1010 V1240" stroke="#C88A5A" strokeWidth="4" opacity=".4" />
          <Glow id="pf-keys" x={540} y={1040} r={340} t={t} color="#FFD27A" amp={0.12} rate={7} opacity={0.6 * playing} />
          <g opacity={playing}><Notes t={t} x={540} y={980} n={7} color="#E8A848" outline={K} rise={230} spread={460} size={1.1} speed={0.35} seed={7} /></g>
        </g>

        {/* PIANO 2 — pavimento e tappeto (0,8) */}
        <g transform={L(0.8)}>
          <path d="M-200 1262 H1280 V2200 H-200 Z" fill="url(#pf-floor)" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M-200 ${1280 + i * i * 9} H1280`} stroke="#000" strokeWidth="3" opacity=".3" />)}
          <ellipse cx="560" cy="1560" rx="520" ry="150" fill="#3A1A16" stroke={K} strokeWidth="6" />
          <ellipse cx="560" cy="1560" rx="460" ry="120" fill="none" stroke="#9A7A3A" strokeWidth="5" opacity=".55" />
          <ellipse cx="560" cy="1560" rx="300" ry="70" fill="none" stroke="#6A2A22" strokeWidth="14" />
        </g>

        {/* PIANO 3 — cavallo a dondolo dei bambini (1,1) */}
        <g transform={L(1.1)}>
          <Ombra id="pf" x={170} y={1752} rx={190} ry={20} />
          <g transform={`translate(170 1740) rotate(${rock}) scale(.85)`}>
            <path d="M-210 -20 Q0 40 210 -20" stroke={K} strokeWidth="26" fill="none" strokeLinecap="round" />
            <path d="M-210 -20 Q0 40 210 -20" stroke="url(#pf-wood)" strokeWidth="14" fill="none" strokeLinecap="round" />
            {[-110, 110].map((x) => <path key={x} d={`M${x} 2 L${x * 0.7} -120`} stroke={K} strokeWidth="14" />)}
            <path d="M-140 -110 Q-150 -190 -40 -190 H80 Q120 -190 130 -230 L150 -310 Q170 -340 210 -320 L240 -280 Q250 -260 230 -250 L180 -240 Q160 -180 140 -150 Q130 -110 90 -110 Z" fill="#E8DCC0" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            {[[-80, -160], [-20, -150], [40, -170], [-60, -130]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" fill="#5A4A3A" opacity=".6" />)}
            <path d="M130 -230 Q110 -300 150 -330 Q120 -290 110 -230 Z" fill="#3A2418" stroke={K} strokeWidth="5" />
            <path d="M-140 -150 Q-200 -140 -200 -60" stroke="#3A2418" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M-40 -190 Q-20 -150 20 -190" fill="#9A2A22" stroke={K} strokeWidth="6" />
            <circle cx="196" cy="-300" r="6" fill={K} />
            <path d="M186 -260 L120 -200" stroke="#9A2A22" strokeWidth="6" />
            <path d="M-120 -176 Q-60 -196 40 -186" stroke="#FFFFFF" strokeWidth="5" opacity=".5" fill="none" />
          </g>
        </g>

        {/* PIANO 4 — sgabello del pianoforte in primo piano a destra (1,3) */}
        <g transform={L(1.3)}>
          <Ombra id="pf" x={860} y={1880} rx={220} ry={24} />
          <rect x="660" y="1600" width="400" height="60" rx="20" fill="#5A1E1A" stroke={K} strokeWidth="9" />
          <path d="M680 1612 H1040" stroke="#C86A5A" strokeWidth="5" opacity=".5" />
          <rect x="680" y="1656" width="360" height="40" fill="url(#pf-wood)" stroke={K} strokeWidth="7" />
          {[700, 1010].map((x) => <path key={x} d={`M${x} 1696 Q${x + (x < 800 ? -20 : 20)} 1790 ${x} 1880`} stroke={K} strokeWidth="22" fill="none" strokeLinecap="round" />)}
        </g>

        {/* PIANO 5 — pulviscolo alla luce delle candele (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 760, x0: 200, x1: 880 }} bottom={{ y: 1260, x0: 120, x1: 960 }} seed={9} n={26} color="#FFE0A0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="pf-near" t={t} color="#E8D8B0" n={6} opacity={0.07} />
        </g>
      </g>
      <Finish id="pf" tint="#2A1E14" tintOpacity={0.13} />
    </svg>
  );
};

