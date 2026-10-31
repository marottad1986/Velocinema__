import React from 'react';
import { camera, eo, rng, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Rain, Reflection, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { ANTON, SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { JokerDefs, K, Palazzo, Tv } from './Comuni';

// In diretta: di notte, sotto la pioggia, la vetrina del negozio di televisori del primo capitolo: una parete di sei
// televisori che trasmettono tutti la stessa diretta, davanti a tutta la città. Sugli schermi lo studio con la poltrona.
// Eventi: prima frase su tutti gli schermi compare «JOKER» in sovrimpressione (cue 0 + 1, timpano); seconda frase le luci
// dello studio si abbassano e resta un solo occhio di bue sulla poltrona; terza frase lo sparo a cue 2 + 1,2 (timpano e
// gong): un solo lampo bianco su tutti gli schermi, poi disturbo e «COLLEGAMENTO INTERROTTO», l'insegna si spegne.
// Nessuna persona, nessuna arma in vista.
// Piani: palazzi di notte (0,3) · facciata del negozio (0,55) · parete di televisori (0,7) · marciapiede bagnato (0,9)
//        · tenda e pali in primo piano (1,2) · pioggia vicina e particelle (1,5–1,8)

const TVS = [[300, 760], [720, 760], [300, 990], [720, 990], [300, 1180], [720, 1180]] as const;
const r = rng(10);
const NOISE = Array.from({ length: 12 }, () => r());

export const Diretta: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const shot = cues[2] + 1.2;
  const name = eo(seg(t, cues[0] + 1, cues[0] + 1.5));
  const spot = eo(seg(t, cues[1], cues[1] + 1));
  const flash = flashAt(t, [shot], [1]);
  const cut = seg(t, shot + 0.3, shot + 0.5);
  const neon = cut > 0 ? (Math.sin(t * 30) > 0.6 ? 0.3 : 0.05) : 0.9 + 0.1 * Math.sin(t * 11);

  const Screen: React.FC<{ i: number }> = ({ i }) => (
    <g>
      {/* lo studio in diretta */}
      <g opacity={1 - cut}>
        <rect x="-172" y="-118" width="258" height="234" fill="#2A1A3A" />
        <rect x="-172" y="-118" width="258" height="234" fill="#000" opacity={0.6 * spot} />
        <path d="M-172 -118 H-140 V116 H-172 Z M86 -118 H54 V116 H86 Z" fill="#7A1A22" />
        <path d="M-43 -118 L-110 116 H24 Z" fill="#FFF0C0" opacity={0.12 + 0.25 * spot} />
        <ellipse cx="-43" cy="80" rx="70" ry="14" fill="#FFF0C0" opacity={0.25 + 0.3 * spot} />
        <path d="M-80 70 V0 Q-80 -24 -56 -24 H-30 Q-6 -24 -6 0 V70 Z" fill="#3A6A9A" stroke={K} strokeWidth="5" />
        <rect x="-92" y="20" width="98" height="30" rx="10" fill="#2A5A8A" stroke={K} strokeWidth="4" />
        <path d="M-150 60 H-100 V96 H-150 Z" fill="#6A4428" opacity={1 - spot} />
        <g opacity={name}>
          <rect x="-150" y="-104" width="214" height="44" fill="#0A0A0A" opacity=".75" />
          <text x="-43" y="-70" textAnchor="middle" fontFamily={ANTON} fontSize="38" fill={P.accento}>JOKER</text>
        </g>
        <circle cx="66" cy="-100" r="7" fill={P.accento} opacity={Math.sin(t * 4 + i) > 0 ? 1 : 0.3} />
      </g>
      {/* collegamento interrotto */}
      <g opacity={cut}>
        <rect x="-172" y="-118" width="258" height="234" fill="#1A1E22" />
        {Array.from({ length: 13 }, (_, k) => <rect key={k} x={-172} y={-118 + k * 18} width="258" height="9" fill="#C8D8E0" opacity={0.2 + 0.5 * Math.abs(Math.sin(t * 31 + k * 2.3 + i + NOISE[k] * 6))} />)}
        <rect x="-160" y="-22" width="234" height="44" fill="#0A0C10" opacity=".85" />
        <text x="-43" y="-2" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="18" fill="#F2EEE4">COLLEGAMENTO</text>
        <text x="-43" y="17" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="18" fill="#F2EEE4">INTERROTTO</text>
      </g>
      <rect x="-172" y="-118" width="258" height="234" fill="#FFFFFF" opacity={flash} />
    </g>
  );

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="dr" />
        <JokerDefs id="dr" />
        <Lin id="dr-sky" stops={[[0, '#06080C'], [0.5, '#121822'], [1, '#1E2430']]} />
        <Lin id="dr-shop" x2={1} y2={0} stops={[[0, '#141C18'], [0.5, '#22302A'], [1, '#121A16']]} />
        <Lin id="dr-walk" stops={[[0, '#3A3A3C'], [1, '#141416']]} />
        <Lin id="dr-awn" x2={1} y2={0} stops={[[0, '#5A1A18'], [0.5, '#7A2420'], [1, '#4A1412']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — palazzi di notte sotto la pioggia (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#dr-sky)" />
          <Palazzo id="dr" x={-200} y={1200} w={300} h={620} t={t} lit={0.25} seed={3} dark />
          <Palazzo id="dr" x={980} y={1200} w={300} h={640} t={t} lit={0.2} seed={6} dark />
          <Rain t={t} level="far" seed={4} color="#6A7A90" opacity={0.35} />
        </g>

        {/* PIANO 1 — facciata del negozio, insegna che si spegne, tenda (0,55) */}
        <g transform={L(0.55)}>
          <rect x="60" y="560" width="960" height="720" fill="url(#dr-shop)" stroke={K} strokeWidth="9" />
          <rect x="250" y="566" width="580" height="80" rx="10" fill="#0E1210" stroke={K} strokeWidth="7" />
          <text x="540" y="626" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="58" fill="none" stroke="#6AF0A0" strokeWidth="5" opacity={neon}>TV · RADIO</text>
          <Glow id="dr-neon" x={540} y={606} r={340} t={t} color="#6AF0A0" amp={0.04} rate={3} opacity={0.4 * neon} />
        </g>

        {/* PIANO 2 — la parete di sei televisori (0,7) */}
        <g transform={L(0.7)}>
          <rect x="90" y="650" width="900" height="620" fill="#0A0E0C" stroke={K} strokeWidth="7" />
          <path d="M90 880 H990 M90 1100 H990" stroke="#3A2A1C" strokeWidth="14" />
          {TVS.map(([x, y], i) => (
            <g key={i}>
              <Tv id="dr" x={x} y={y} s={0.66} antenna={false}>
                <Screen i={i} />
              </Tv>
              <Glow id={`dr-g${i}`} x={x - 20} y={y} r={220} t={t + i} color={cut > 0 ? '#C8D8E0' : spot > 0.5 ? '#FFF0C0' : '#B8A0E0'} amp={0.08} rate={6} opacity={0.25 + 0.5 * flash} />
            </g>
          ))}
          <rect x="90" y="650" width="900" height="620" fill="url(#dr-glass)" />
          <path d="M140 660 L340 1260 M200 660 L400 1260" stroke="#FFFFFF" strokeWidth="10" opacity=".06" />
        </g>

        {/* PIANO 3 — il marciapiede bagnato con i riflessi degli schermi (0,9) */}
        <g transform={L(0.9)}>
          <path d="M-200 1270 H1280 V2200 H-200 Z" fill="url(#dr-walk)" />
          <path d="M-200 1272 H1280" stroke="#8A867C" strokeWidth="6" />
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${-200 + i * 220} 1290 L${-300 + i * 260} 2200`} stroke="#000" strokeWidth="4" opacity=".4" />)}
          {[300, 720].map((x, i) => <Reflection key={x} t={t + i} x={x - 20} y={1310} color={cut > 0 ? '#C8D8E0' : '#B8A0E0'} n={8} w={220} gap={30} opacity={0.35 + 0.4 * flash} />)}
          <Reflection t={t + 2} x={540} y={1320} color="#6AF0A0" n={5} w={300} gap={34} opacity={0.3 * neon} />
          {/* una maschera da clown caduta sul marciapiede */}
          <g transform="translate(880 1600) rotate(22)">
            <ellipse rx="70" ry="84" fill="#F2EEE4" stroke={K} strokeWidth="6" />
            <ellipse cx="-24" cy="-12" rx="12" ry="9" fill={K} /><ellipse cx="24" cy="-12" rx="12" ry="9" fill={K} />
            <circle cy="16" r="15" fill={P.accento} stroke={K} strokeWidth="3" />
            <path d="M-34 42 Q0 66 34 42" stroke={P.accento} strokeWidth="8" fill="none" />
          </g>
        </g>

        {/* PIANO 4 — tenda strappata in alto e pali in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1700 Q100 1640 400 1700 V2200 H-200 Z" fill="#1A1A1C" stroke={K} strokeWidth="9" />
          <rect x="-50" y="560" width="40" height="1640" fill="url(#dr-steel)" />
          <rect x="1050" y="560" width="40" height="1640" fill="url(#dr-steel)" />
          <path d="M-200 1500 H1280" stroke="#2A2A2C" strokeWidth="12" opacity=".6" />
        </g>

        {/* PIANO 5 — pioggia vicina e particelle (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Rain t={t} level="near" seed={9} color="#9AAAC0" opacity={0.2} />
          <Dust t={t} top={{ y: 700, x0: 100, x1: 980 }} bottom={{ y: 1260, x0: 60, x1: 1020 }} seed={10} n={18} color="#C8D0E8" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="dr-near" t={t} color="#C8D0E8" n={6} opacity={0.08} />
        </g>
        <rect x="-200" y="-200" width="1480" height="2400" fill="#FFFFFF" opacity={flash * 0.25} />
      </g>
      <Finish id="dr" tint="#1A1A2A" tintOpacity={0.14} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): «JOKER» cue0 + 1 · occhio di bue cue1 → + 1 · sparo cue2 + 1,2 (lampo) · interrotto + 0,3.
