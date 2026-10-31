import React from 'react';
import { camera, eio, eo, lerp, rng, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { HAND, SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { JokerDefs, K, Ombra, Tv } from './Comuni';

// La lettera della madre: il soggiorno povero di Penny, di sera. Carta da parati sbiadita, la poltrona consumata col
// centrino, la lampada a stelo con la luce calda, il televisore sul mobile, la finestra sulla città con la villa lontana;
// in primo piano il tavolino con i flaconi delle medicine, la tazza che fuma e la busta per Thomas Wayne (oggetto chiave).
// Eventi: prima frase la busta scritta a mano «Al signor Thomas Wayne» sul tavolino; seconda frase il televisore passa
// al manifesto «WAYNE SINDACO» e dalla finestra si accende la villa dei Wayne; terza frase la lettera si apre e viene
// verso la camera (cue 2, le pagine dello spartito) e la riga «nostro figlio Arthur» si sottolinea in rosso
// (cue 2 + 0,8, il glockenspiel). Nessuna persona.
// Piani: città dalla finestra (0,25) · parete, finestra, lampada (0,5) · poltrona e TV (0,7) · tavolino (0,95)
//        · la lettera aperta (1,05) · tenda in primo piano (1,25) · pulviscolo e vapore (1,5–1,8)

const r = rng(12);
const CITY = Array.from({ length: 14 }, (_, i) => ({ x: 640 + i * 30, h: 40 + r() * 100 }));

export const Madre: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const env = eo(seg(t, cues[0] + 0.4, cues[0] + 1.2));
  const villa = eo(seg(t, cues[1], cues[1] + 1));
  const open = eio(seg(t, cues[2], cues[2] + 0.8));
  const line = eo(seg(t, cues[2] + 0.8, cues[2] + 1.8));
  const tvFlick = Math.sin(t * 9) > 0.7 ? 0.85 : 1;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="md" />
        <JokerDefs id="md" />
        <Lin id="md-wall" stops={[[0, '#2A2A22'], [0.35, '#4A4A36'], [0.7, '#6A6446'], [1, '#4A4430']]} />
        <Lin id="md-night" stops={[[0, '#0A0E18'], [1, '#1E2638']]} />
        <Lin id="md-chair" x2={1} y2={0} stops={[[0, '#5A3A22'], [0.5, '#8A5A34'], [1, '#4A2E1A']]} />
        <Lin id="md-floor" stops={[[0, '#4A3424'], [1, '#1E140C']]} />
        <Lin id="md-table" stops={[[0, '#8A6440'], [1, '#4A3220']]} />
        <Lin id="md-paper" stops={[[0, '#FFFBEE'], [1, '#E8DCC0']]} />
        <Lin id="md-curtain" x2={1} y2={0} stops={[[0, '#3A2A1A'], [0.5, '#6A4A2A'], [1, '#2A1E12']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — la città di notte dalla finestra, la villa lontana (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#md-night)" />
          {CITY.map((b, i) => <rect key={i} x={b.x} y={960 - b.h} width="28" height={b.h} fill="#141A26" />)}
          {CITY.map((b, i) => i % 3 === 0 && <rect key={`w${i}`} x={b.x + 8} y={970 - b.h} width="8" height="10" fill="#F2C46A" opacity=".6" />)}
          {/* la villa dei Wayne su una collina */}
          <path d="M600 960 Q760 820 980 850 L1020 960 Z" fill="#141A26" />
          <g transform="translate(830 836)">
            <path d="M-80 0 V-50 L-40 -80 L0 -60 L40 -80 L80 -50 V0 Z" fill="#1E2434" stroke="#0A0E18" strokeWidth="3" />
            {[-60, -30, 0, 30, 60].map((x) => <rect key={x} x={x - 6} y="-40" width="12" height="16" fill="#F2D890" opacity={0.15 + 0.85 * villa} />)}
            {[-46, 46].map((x) => <rect key={x} x={x - 6} y="-64" width="12" height="12" fill="#F2D890" opacity={0.15 + 0.85 * villa} />)}
          </g>
          <Glow id="md-villa" x={830} y={810} r={200} t={t} color="#F2D890" amp={0.05} rate={1.5} opacity={0.7 * villa} />
        </g>

        {/* PIANO 1 — parete con la carta da parati, finestra, quadretto, lampada a stelo (0,5) */}
        <g transform={L(0.5)}>
          <path d="M-200 -200 H1280 V1200 H-200 Z M640 650 V960 H1010 V650 Z" fill="url(#md-wall)" fillRule="evenodd" />
          {Array.from({ length: 60 }, (_, i) => {
            const x = -160 + (i % 10) * 150 + (Math.floor(i / 10) % 2) * 75, y = 560 + Math.floor(i / 10) * 110;
            return (x < 620 || x > 1030 || y < 580 || y > 940) && <g key={i} opacity=".22"><path d={`M${x} ${y} q12 -18 24 0 q-12 18 -24 0`} fill="#A89A6A" /><circle cx={x + 12} cy={y} r="4" fill="#C8A86A" /></g>;
          })}
          <path d="M-200 1000 H1280" stroke="#3A3424" strokeWidth="14" />
          <path d="M-200 993 H1280" stroke="#8A7A58" strokeWidth="3" opacity=".6" />
          {/* finestra */}
          <rect x="630" y="640" width="390" height="320" fill="none" stroke="#C8B898" strokeWidth="22" />
          <rect x="630" y="640" width="390" height="320" fill="none" stroke={K} strokeWidth="6" />
          <path d="M825 640 V960 M630 800 H1020" stroke="#C8B898" strokeWidth="14" />
          <path d="M825 640 V960 M630 800 H1020" stroke={K} strokeWidth="3" />
          <rect x="610" y="958" width="430" height="24" fill="#B8A888" stroke={K} strokeWidth="6" />
          {/* quadretto con un pagliaccio dipinto (il sogno di Arthur) */}
          <g transform="translate(140 780) rotate(-3)">
            <rect x="-70" y="-80" width="140" height="160" fill="url(#md-chair)" stroke={K} strokeWidth="6" />
            <rect x="-54" y="-64" width="108" height="128" fill="#E8DCC0" stroke={K} strokeWidth="4" />
            <circle cx="0" cy="-6" r="28" fill="#F2EEE4" stroke={K} strokeWidth="3" />
            <circle cx="0" cy="-2" r="7" fill={P.accento} />
            <path d="M-14 10 q14 10 28 0" stroke={P.accento} strokeWidth="4" fill="none" />
            <path d="M-28 -24 q-14 -14 -4 -26 M28 -24 q14 -14 4 -26" stroke="#3E8A4A" strokeWidth="8" fill="none" />
          </g>
          {/* lampada a stelo con il paralume */}
          <rect x="464" y="770" width="12" height="470" fill="url(#md-steel)" />
          <path d="M420 1240 h100" stroke={K} strokeWidth="12" strokeLinecap="round" />
          <path d="M400 770 L430 680 H510 L540 770 Z" fill="#E8C890" stroke={K} strokeWidth="7" />
          <path d="M410 760 H530" stroke="#B8945A" strokeWidth="5" />
          <Glow id="md-lamp" x={470} y={790} r={360} t={t} color="#FFD898" amp={0.04} rate={2} opacity={0.55} />
        </g>

        {/* PIANO 2 — pavimento, poltrona col centrino e televisore sul mobile (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1180 H1280 V2200 H-200 Z" fill="url(#md-floor)" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M-200 ${1210 + i * 40} H1280`} stroke="#000" strokeWidth="3" opacity=".25" />)}
          <ellipse cx="540" cy="1260" rx="560" ry="70" fill="#7A2A22" opacity=".6" />
          <ellipse cx="540" cy="1260" rx="520" ry="56" fill="none" stroke="#C8A060" strokeWidth="5" opacity=".5" />
          {/* poltrona */}
          <g transform="translate(150 980)">
            <Ombra id="md" x={0} y={210} rx={220} ry={26} />
            <path d="M-170 200 V-80 Q-170 -200 0 -210 Q170 -200 170 -80 V200 Z" fill="url(#md-chair)" stroke={K} strokeWidth="9" />
            <path d="M-120 -170 Q0 -196 120 -170" stroke="#C88A5A" strokeWidth="6" fill="none" opacity=".5" />
            <path d="M-60 -200 L-20 -120 L40 -130 L60 -196 Q0 -210 -60 -200 Z" fill="#F2EEE4" stroke={K} strokeWidth="4" />
            {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-40 + i * 18} cy={-130 + (i % 2) * 6} r="5" fill="none" stroke="#C8C0A8" strokeWidth="2" />)}
            <rect x="-200" y="-20" width="80" height="220" rx="36" fill="url(#md-chair)" stroke={K} strokeWidth="8" />
            <rect x="120" y="-20" width="80" height="220" rx="36" fill="url(#md-chair)" stroke={K} strokeWidth="8" />
            <rect x="-130" y="40" width="260" height="90" rx="24" fill="#7A4A2A" stroke={K} strokeWidth="7" />
            <path d="M-30 60 l20 30 l14 -20" stroke="#4A2A14" strokeWidth="4" fill="none" />
          </g>
          {/* mobile e televisore */}
          <rect x="680" y="1010" width="360" height="200" fill="url(#md-chair)" stroke={K} strokeWidth="8" />
          <path d="M700 1110 H1020 M860 1010 V1210" stroke={K} strokeWidth="5" />
          {[780, 940].map((x) => <circle key={x} cx={x} cy={1060} r="7" fill="#C9A24A" stroke={K} strokeWidth="3" />)}
          <Tv id="md" x={880} y={912} s={0.55} glow={tvFlick}>
            <g opacity={1 - villa}>
              <rect x="-172" y="-118" width="258" height="234" fill="#2A3A5A" />
              {Array.from({ length: 6 }, (_, k) => <rect key={k} x={-150 + k * 40} y={-20 - k * 8} width="30" height={60 + k * 10} fill="#4A5A7A" />)}
            </g>
            <g opacity={villa}>
              <rect x="-172" y="-118" width="258" height="234" fill="#E8E0CC" />
              <rect x="-172" y="-118" width="258" height="70" fill="#2A3A6A" />
              <text x="-43" y="-70" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="44" fill="#F2EEE4">WAYNE</text>
              <text x="-43" y="10" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="46" fill="#2A3A6A">SINDACO</text>
              <path d="M-150 50 H64" stroke={P.accento} strokeWidth="12" />
              <path d="M-150 80 H64" stroke="#2A3A6A" strokeWidth="10" />
            </g>
          </Tv>
          <Glow id="md-tv" x={850} y={912} r={260} t={t} color="#C8D8F0" amp={0.1} rate={9} opacity={0.35 * tvFlick} />
        </g>

        {/* PIANO 3 — il tavolino con medicine, tazza e la busta (0,95) */}
        <g transform={L(0.95)}>
          <Ombra id="md" x={540} y={1250} rx={420} ry={30} />
          <path d="M150 1110 H930 L960 1150 H120 Z" fill="url(#md-table)" stroke={K} strokeWidth="8" />
          <path d="M120 1150 H960 V1176 H120 Z" fill="#4A3220" stroke={K} strokeWidth="7" />
          <path d="M170 1116 H900" stroke="#C8A070" strokeWidth="4" opacity=".6" />
          {[170, 910].map((x) => <path key={x} d={`M${x} 1176 V1250`} stroke={K} strokeWidth="16" />)}
          {/* flaconi delle medicine */}
          {[[210, 1112, '#E8A040'], [262, 1112, '#E8A040'], [234, 1112, '#F2EEE4']].map(([x, y, c], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <rect x="-20" y={-70 + i * 14} width="40" height={70 - i * 14} rx="6" fill={String(c)} opacity=".9" stroke={K} strokeWidth="4" />
              <rect x="-22" y={-86 + i * 14} width="44" height="18" rx="4" fill="#F2EEE4" stroke={K} strokeWidth="4" />
              <rect x="-14" y={-50 + i * 14} width="28" height="20" fill="#F2EEE4" opacity=".9" />
            </g>
          ))}
          {/* tazza che fuma */}
          <g transform="translate(820 1112)">
            <path d="M-34 -64 H34 L28 0 H-28 Z" fill="#E8E0CC" stroke={K} strokeWidth="5" />
            <path d="M34 -50 q24 2 18 24 q-6 16 -22 12" stroke={K} strokeWidth="5" fill="none" />
            <ellipse cx="0" cy="-64" rx="34" ry="8" fill="#5A3A20" stroke={K} strokeWidth="4" />
            <path d="M-20 -54 v40" stroke="#FFFFFF" strokeWidth="5" opacity=".5" />
          </g>
          {/* la busta per Thomas Wayne */}
          <g transform={`translate(540 ${1122 - 20 * env}) rotate(-5)`} opacity={(0.3 + 0.7 * env) * (1 - open)}>
            <rect x="-170" y="-64" width="340" height="128" rx="6" fill="url(#md-paper)" stroke={K} strokeWidth="6" />
            <path d="M-170 -64 L0 20 L170 -64" fill="none" stroke="#C8B898" strokeWidth="4" />
            <text x="-10" y="16" textAnchor="middle" fontFamily={HAND} fontSize="36" fill="#2A3A6A">Al signor Thomas Wayne</text>
            <rect x="110" y="-52" width="44" height="52" fill="#C8443A" stroke={K} strokeWidth="3" />
          </g>
        </g>

        {/* PIANO 4 — la lettera aperta che viene verso la camera (1,05) */}
        <g transform={L(1.05)} opacity={open}>
          <Glow id="md-letter" x={540} y={900} r={460} t={t} color="#FFE8B0" amp={0.04} rate={2} opacity={0.4 * open} />
          <g transform={`translate(540 ${lerp(1100, 920, open)}) rotate(${lerp(-5, 2, open)}) scale(${lerp(0.5, 1, open)})`}>
            <rect x="-260" y="-200" width="520" height="400" rx="6" fill="url(#md-paper)" stroke={K} strokeWidth="7" />
            <path d="M-260 -66 H260 M-260 66 H260" stroke="#D8CCAA" strokeWidth="3" />
            <text x="-210" y="-140" fontFamily={HAND} fontSize="38" fill="#2A3A6A">Caro Thomas,</text>
            {[-96, -52].map((y) => <path key={y} d={`M-210 ${y} H${180 - (y % 3) * 20}`} stroke="#5A6A9A" strokeWidth="5" strokeLinecap="round" opacity=".6" />)}
            <text x="-210" y="2" fontFamily={HAND} fontSize="44" fill="#2A3A6A">nostro figlio Arthur</text>
            <path d={`M-212 18 H${lerp(-212, 160, line)}`} stroke={P.accento} strokeWidth="9" strokeLinecap="round" />
            {[56, 100].map((y) => <path key={y} d={`M-210 ${y} H${200 - (y % 3) * 30}`} stroke="#5A6A9A" strokeWidth="5" strokeLinecap="round" opacity=".6" />)}
            <text x="150" y="168" fontFamily={HAND} fontSize="36" fill="#2A3A6A">Penny</text>
          </g>
        </g>

        {/* PIANO 5 — tenda in primo piano a destra (1,25) */}
        <g transform={L(1.25)}>
          <path d={`M1020 -200 H1300 V2200 H1060 Q${1040 + Math.sin(t * 0.8) * 10} 1600 1000 1200 Q${980 + Math.sin(t * 0.8 + 1) * 8} 700 1020 -200 Z`} fill="url(#md-curtain)" stroke={K} strokeWidth="9" />
          {[1080, 1140].map((x) => <path key={x} d={`M${x} -200 Q${x - 30} 900 ${x - 10} 2200`} stroke="#2A1E12" strokeWidth="6" fill="none" />)}
          <path d="M-200 1500 Q100 1440 360 1500 V2200 H-200 Z" fill="url(#md-chair)" stroke={K} strokeWidth="9" />
          <path d="M-180 1500 Q100 1452 340 1500" stroke="#C88A5A" strokeWidth="6" fill="none" opacity=".45" />
        </g>

        {/* PIANO 6 — vapore della tazza, pulviscolo nella luce della lampada (1,5–1,8) */}
        <g transform={L(0.95)}>
          <Wisps t={t} x={820} y={1040} color="#E8E0CC" n={3} h={160} opacity={0.5} />
        </g>
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 780, x0: 400, x1: 540 }} bottom={{ y: 1180, x0: 160, x1: 900 }} seed={6} n={24} color="#FFE0A0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="md-near" t={t} color="#FFE0A0" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="md" tint="#2A2416" tintOpacity={0.14} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): busta cue0 + 0,4 · TV e villa cue1 → + 1 · lettera aperta cue2 → + 0,8 · riga rossa cue2 + 0,8 → + 1,8.
