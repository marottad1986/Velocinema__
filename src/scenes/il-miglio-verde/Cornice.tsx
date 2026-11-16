import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Dust, GlassDrops, Glow, NearMotes, Rain } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Cane, GOLD, K, Spool, TopHat } from './Comuni';

// Un vecchio che piange: una stanza di casa di riposo di notte. Un vecchio televisore acceso mostra un film in bianco e
// nero (un cappello a cilindro e un bastone che ballano); poltrona vuota con la coperta, sul tavolino occhiali,
// fazzoletti e una tazza; la pioggia sulla finestra. Su «gli ricorda John Coffey» sul tavolino si accende d'oro il
// rocchetto colorato (il ricordo); su «nel 1935» la stanza vira al seppia e il pulviscolo dorato sale. Nessuna persona.
// Piani: parete e finestra (0,25) · mobile con il televisore (0,6) · poltrona (0,9) · tavolino (1,1) · tenda (1,3) · pulviscolo (1,7)

export const Cornice: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const memory = eo(seg(t, griglia(cues[1] + 0.3), griglia(cues[1] + 0.3) + 1.2)); // il rocchetto si accende
  const sepia = eo(seg(t, griglia(cues[2]), griglia(cues[2]) + 2)); // verso il 1935
  const flick = 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7);
  // il cappello e il bastone ballano sullo schermo (passo a tempo, 72 bpm)
  const b = (t * 72) / 60;
  const hop = Math.abs(Math.sin(b * Math.PI)) * 18;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cr" />
        <Lin id="cr-wall" stops={[[0, '#1A2230'], [0.5, '#2A3446'], [1, '#141A24']]} />
        <Lin id="cr-night" stops={[[0, '#0A1220'], [0.6, '#1A2A40'], [1, '#2A3A50']]} />
        <Lin id="cr-screen" stops={[[0, '#C8CCD0'], [0.6, '#8A9098'], [1, '#5A6068']]} />
        <Lin id="cr-chair" x2={1} y2={0} stops={[[0, '#6A2E2A'], [1, '#3A1A18']]} />
        <Lin id="cr-floor" stops={[[0, '#2A2420'], [1, '#14100E']]} />
      </defs>
      <g transform={cam.transform}>
        {/* parete con la carta da parati e la finestra con la pioggia */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#cr-wall)" />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${-160 + i * 90} -200 V1300`} stroke="#3A4456" strokeWidth="3" opacity=".5" />)}
          {Array.from({ length: 16 }, (_, i) => Array.from({ length: 8 }, (_, j) => <circle key={`${i}-${j}`} cx={-115 + i * 90} cy={-120 + j * 180 + (i % 2) * 90} r="7" fill="#3A4456" opacity=".5" />))}
          <g>
            <rect x="660" y="520" width="340" height="460" fill="url(#cr-night)" />
            <svg x="660" y="520" width="340" height="460" viewBox="0 0 340 460">
              <Rain t={t} level="far" color="#8AA0C0" opacity={0.5} x={-100} y={-100} w={600} h={700} />
              {/* le luci lontane del parcheggio */}
              {[60, 140, 250].map((x, i) => <circle key={i} cx={x} cy={380 + (i % 2) * 20} r="6" fill="#FFD890" opacity={0.6 + 0.3 * Math.sin(t + i)} />)}
            </svg>
            <GlassDrops t={t} x={660} y={520} w={340} h={460} seed={4} />
            <path d="M660 520 H1000 V980 H660 Z M830 520 V980 M660 750 H1000" fill="none" stroke="#C8C0B0" strokeWidth="14" />
            <path d="M650 990 H1010" stroke="#C8C0B0" strokeWidth="20" />
          </g>
          {/* un quadretto appeso */}
          <g transform="translate(220 700)">
            <rect x="-90" y="-70" width="180" height="140" fill="#5A4430" stroke={K} strokeWidth="6" />
            <rect x="-70" y="-50" width="140" height="100" fill="#4A6A5A" />
            <path d="M-70 30 Q-20 -10 20 20 Q50 0 70 10 V50 H-70 Z" fill="#3A5A44" />
          </g>
        </g>
        {/* il mobile con il vecchio televisore acceso */}
        <g transform={L(0.6)}>
          <rect x="-200" y="1180" width="1480" height="900" fill="url(#cr-floor)" />
          <rect x="300" y="1060" width="480" height="140" fill="#5A3E28" stroke={K} strokeWidth="7" />
          <path d="M540 1060 V1200 M330 1130 H510 M570 1130 H750" stroke="#3A2818" strokeWidth="5" />
          <rect x="340" y="760" width="400" height="300" rx="26" fill="#4A4038" stroke={K} strokeWidth="9" />
          <rect x="368" y="788" width="280" height="244" rx="34" fill="url(#cr-screen)" stroke={K} strokeWidth="6" />
          {/* sullo schermo: palco in bianco e nero, il cappello e il bastone che ballano */}
          <svg x="368" y="788" width="280" height="244" viewBox="0 0 280 244">
            <rect width="280" height="244" fill="#9A9EA4" />
            <path d="M0 180 H280 V244 H0 Z" fill="#6A6E74" />
            {[40, 110, 180, 250].map((x) => <path key={x} d={`M${x} 0 V180`} stroke="#B8BCC2" strokeWidth="10" opacity=".5" />)}
            <TopHat x={110 + Math.sin(b * Math.PI / 2) * 30} y={150 - hop} s={0.6} rot={Math.sin(b * Math.PI) * 10} color="#1A1A1A" line="#E8E8E8" />
            <Cane x={175 - Math.sin(b * Math.PI / 2) * 24} y={190 - hop * 0.5} s={0.7} rot={Math.sin(b * Math.PI) * 18} />
            {Array.from({ length: 40 }, (_, i) => <rect key={i} x={(i * 47 + Math.floor(t * 24) * 13) % 280} y={(i * 31 + Math.floor(t * 24) * 7) % 244} width="2" height="2" fill="#FFFFFF" opacity=".5" />)}
          </svg>
          <rect x="368" y="788" width="280" height="244" rx="34" fill="#DDE6F0" opacity={0.08 * flick} />
          <Glow id="cr-tv" x={508} y={910} r={360} t={t} color="#C8D8F0" amp={0.1} rate={9} opacity={0.45 * flick} />
          {[0, 1].map((i) => <circle key={i} cx="692" cy={830 + i * 64} r="16" fill="#2A221C" stroke={K} strokeWidth="4" />)}
          <path d="M440 760 L400 680 M640 760 L690 680" stroke={K} strokeWidth="6" />
        </g>
        {/* la poltrona vuota con la coperta, illuminata dal televisore */}
        <g transform={L(0.9)}>
          <path d="M60 1100 Q50 880 200 870 H360 Q480 880 470 1100 V1360 H60 Z" fill="url(#cr-chair)" stroke={K} strokeWidth="9" />
          <path d="M20 1150 Q20 1080 90 1080 Q140 1090 140 1160 V1380 H20 Z" fill="#7A3A34" stroke={K} strokeWidth="8" />
          <path d="M390 1160 Q390 1080 450 1080 Q510 1090 510 1160 V1380 H390 Z" fill="#5A2622" stroke={K} strokeWidth="8" />
          <path d="M140 1180 H390 V1300 H140 Z" fill="#5A2622" stroke={K} strokeWidth="7" />
          <path d="M470 1080 Q480 900 380 880" stroke="#C8D8F0" strokeWidth="6" fill="none" opacity={0.35 * flick} />
          {/* la coperta a quadri */}
          <path d="M150 1170 Q260 1150 380 1180 L400 1420 Q260 1440 140 1410 Z" fill="#8A7A5A" stroke={K} strokeWidth="6" />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${170 + i * 60} 1170 L${165 + i * 62} 1420`} stroke="#5A4A34" strokeWidth="6" />)}
          {[0, 1, 2].map((i) => <path key={i} d={`M150 ${1230 + i * 60} Q260 ${1215 + i * 60} 390 ${1240 + i * 60}`} stroke="#5A4A34" strokeWidth="6" fill="none" />)}
          <path d="M60 1360 V1440 M470 1360 V1440" stroke={K} strokeWidth="14" />
        </g>
        {/* il tavolino: occhiali, fazzoletti, tazza e il rocchetto colorato del ricordo */}
        <g transform={L(1.1)}>
          <ellipse cx="820" cy="1220" rx="220" ry="40" fill="#6A4A30" stroke={K} strokeWidth="7" />
          <path d="M820 1260 V1500 M720 1500 H920" stroke={K} strokeWidth="14" />
          {/* la scatola dei fazzoletti con un fazzoletto stropicciato accanto */}
          <rect x="650" y="1150" width="110" height="64" fill="#8AB0C8" stroke={K} strokeWidth="5" />
          <path d="M690 1150 Q700 1110 720 1125 Q735 1100 740 1150" fill="#F4F4F0" stroke={K} strokeWidth="4" />
          <path d="M770 1230 q20 -26 40 -6 q10 -20 30 0 q-6 20 -36 20 Z" fill="#F4F4F0" stroke={K} strokeWidth="4" />
          {/* gli occhiali appoggiati */}
          <g transform="translate(880 1200)" stroke={K} strokeWidth="4" fill="#C8E0F0" fillOpacity=".3">
            <circle cx="-22" r="16" /><circle cx="22" r="16" /><path d="M-6 0 H6 M-38 0 L-56 -8 M38 0 L56 -8" fill="none" />
          </g>
          {/* la tazza */}
          <g transform="translate(960 1210)">
            <path d="M-28 0 V-44 H28 V0 Q0 12 -28 0 Z" fill="#E8E0D0" stroke={K} strokeWidth="5" />
            <path d="M28 -34 Q48 -34 46 -18 Q44 -6 28 -8" stroke={K} strokeWidth="5" fill="none" />
          </g>
          {/* il rocchetto: il ricordo che si accende */}
          <g opacity={0.75 + 0.25 * memory}>
            <Glow id="cr-mem" x={790} y={1180} r={200} t={t} color={GOLD} amp={0.1} rate={2.4} opacity={0.6 * memory} />
            <Spool x={790} y={1186} s={0.9} />
          </g>
        </g>
        {/* il tappeto, le pantofole e il bastone da passeggio dell'anziano, in primo piano */}
        <g transform={L(1.15)}>
          <ellipse cx="520" cy="1640" rx="620" ry="170" fill="#5A2E2A" stroke={K} strokeWidth="8" />
          <ellipse cx="520" cy="1640" rx="520" ry="128" fill="none" stroke="#C8A060" strokeWidth="10" />
          <ellipse cx="520" cy="1640" rx="360" ry="82" fill="none" stroke="#8A4A3A" strokeWidth="14" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-60 + i * 104} 1790 l-6 26`} stroke="#C8A060" strokeWidth="5" />)}
          <g transform="translate(560 1660) rotate(-8)">
            <path d="M-110 0 Q-110 -36 -60 -38 H10 Q40 -30 30 0 Q-20 16 -110 0 Z" fill="#3A4A6A" stroke={K} strokeWidth="6" />
            <path d="M-50 -36 Q-20 -10 20 -24" stroke="#7A8AAA" strokeWidth="6" fill="none" />
          </g>
          <g transform="translate(700 1710) rotate(6)">
            <path d="M-110 0 Q-110 -36 -60 -38 H10 Q40 -30 30 0 Q-20 16 -110 0 Z" fill="#3A4A6A" stroke={K} strokeWidth="6" />
            <path d="M-50 -36 Q-20 -10 20 -24" stroke="#7A8AAA" strokeWidth="6" fill="none" />
          </g>
        </g>
        {/* tenda pesante in primo piano a destra */}
        <g transform={L(1.3)}>
          <path d="M1280 -200 H960 Q1010 600 950 1300 Q1000 1700 960 2200 H1280 Z" fill="#3A2E3E" stroke={K} strokeWidth="8" />
          <path d="M1060 -200 Q1100 600 1050 1300" stroke="#2A2030" strokeWidth="14" fill="none" />
          <path d="M-200 1560 H1280 V2200 H-200 Z" fill="#0E0A08" opacity=".55" />
        </g>
        <g transform={L(1.7)}>
          <Dust t={t} top={{ y: 760, x0: 360, x1: 660 }} bottom={{ y: 1300, x0: 200, x1: 900 }} seed={5} n={22} color={sepia > 0.2 ? GOLD : '#C8D8F0'} boost={0.2 + sepia * 0.5} />
          <NearMotes id="cr-near" t={t} color="#C8D8F0" n={5} y0={1300} opacity={0.07} />
        </g>
      </g>
      {/* il passaggio al ricordo: velatura seppia */}
      <rect width="1080" height="1920" fill="#8A6A3A" opacity={0.28 * sepia} />
      <Finish id="cr" tint="#14202E" tintOpacity={0.1} />
    </svg>
  );
};
