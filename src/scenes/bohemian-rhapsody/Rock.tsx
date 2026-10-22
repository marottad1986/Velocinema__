import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Fog, Glow, NearMotes, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { GOLD, Gong, Grand, K, TINT } from './Comune';

// Terza parte: la ribellione. Palco rock: amplificatori impilati con le lucine accese, batteria con piatti che vibrano,
// chitarra elettrica sull'asta, fasci colorati nel fumo; alla fine le luci si abbassano, resta un pianoforte nel buio e
// un grande gong che vibra.
// Piani: americana con i fari (0,25) · gong e fondale (0,4) · amplificatori, batteria, pianoforte (0,6)
//        · chitarra, monitor, bordo del palco (0,95) · cavi in primo piano (1,25) · fumo e particelle (1,7)
// Eventi: cues[0] esplode il rock: lampo, fasci che spazzano · cues[3] le luci si abbassano, faro sul pianoforte
//         · cues[4] colpo di gong (anelli dorati), poi buio.

const r = rng(5501);
const RIG = Array.from({ length: 8 }, (_, i) => ({ x: 90 + i * 128, c: ['#FF4A6A', '#4AA8FF', '#FFC84A', '#B84AFF'][i % 4], ph: r() * 6 }));
const AMP_LEDS = Array.from({ length: 6 }, () => r() * 6);

const Amp: React.FC<{ x: number; y: number; t: number; on: number }> = ({ x, y, t, on }) => (
  <g transform={`translate(${x} ${y})`}>
    {[0, 1, 2].map((k) => (
      <g key={k} transform={`translate(0 ${-k * 150})`}>
        <rect x="-110" y="-150" width="220" height="146" rx="8" fill="#1A1216" stroke={K} strokeWidth="8" />
        <rect x="-96" y="-136" width="192" height="118" rx="4" fill="#2A2026" />
        <g stroke="#3A3036" strokeWidth="3">
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M-96 ${-130 + i * 17} H96`} />)}
        </g>
        <path d="M-104 -144 H104" stroke="#8A7A80" strokeWidth="3" opacity=".5" />
      </g>
    ))}
    <rect x="-110" y="-480" width="220" height="40" rx="6" fill="#2A2026" stroke={K} strokeWidth="7" />
    {AMP_LEDS.map((ph, i) => (
      <circle key={i} cx={-80 + i * 32} cy={-460} r="6" fill={i === 0 ? '#FF4A4A' : '#E9B949'} opacity={0.2 + 0.8 * on * (0.5 + 0.5 * Math.sin(t * 6 + ph))} />
    ))}
  </g>
);

export const Rock: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c0 = cues[0] ?? 0.15, c3 = cues[3] ?? 7.1, c4 = cues[4] ?? 10.3;
  const gongAt = c4 + 1.2;
  const boom = eob(seg(t, c0 + 0.2, c0 + 0.6));
  const calm = eo(seg(t, c3, c3 + 1.5));
  const rock = boom * (1 - calm);
  const flash = flashAt(t, [c0 + 0.25, gongAt], [1, 0.6]);
  const dark = eo(seg(t, gongAt + 0.8, dur));
  const beat = Math.pow(Math.abs(Math.sin(t * Math.PI * 2.4)), 6) * rock;
  const cym = Math.sin(t * 40) * 3 * rock;
  const pianoSpot = calm * (1 - 0.6 * dark);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ro" />
        <Lin id="ro-back" stops={[[0, '#06040A'], [0.5, '#140A18'], [1, '#22101E']]} />
        <Lin id="ro-floor" stops={[[0, '#2A1A1E'], [0.5, '#1A1014'], [1, '#08060A']]} />
        <Lin id="ro-drum" x2={1} y2={0} stops={[[0, '#5A0E22'], [0.5, '#A8203A'], [1, '#4A0A1A']]} />
        <Lin id="ro-chrome" x2={1} y2={0} stops={[[0, '#6A6066'], [0.5, '#E8E0E4'], [1, '#5A5056']]} />
        <Lin id="ro-gtr" x2={1} y2={0} stops={[[0, '#2A2C6A'], [0.5, '#4A5AB8'], [1, '#1E2050']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — fondale nero e americana con i fari colorati (calma in alto per il titolo) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1600" fill="url(#ro-back)" />
          <path d="M-100 620 H1180 M-100 650 H1180" stroke="#2A2228" strokeWidth="8" />
          {Array.from({ length: 20 }, (_, i) => <path key={i} d={`M${-100 + i * 64} 620 L${-68 + i * 64} 650`} stroke="#2A2228" strokeWidth="4" />)}
          {RIG.map((l, i) => (
            <g key={i} transform={`translate(${l.x} 660)`}>
              <Glow id={`ro-rig${i}`} x={0} y={14} r={70} t={t} color={l.c} amp={0.2} rate={5} ph={l.ph} opacity={0.15 + 0.6 * rock} />
              <rect x="-18" y="-6" width="36" height="34" rx="6" fill="#2A2228" stroke={K} strokeWidth="5" />
              <circle cx="0" cy="22" r="10" fill={l.c} opacity={0.3 + 0.7 * rock} />
            </g>
          ))}
        </g>

        {/* PIANO 1 — il gong in fondo */}
        <g transform={L(0.4)}>
          <Gong id="ro-gong" x={540} y={850} r={150} t={t} hit={t - gongAt} glow={0.12 + 0.2 * calm} />
        </g>

        {/* fasci colorati nel fumo */}
        <g transform={L(0.5)} opacity={rock}>
          {RIG.map((l, i) => (
            <Beam key={i} id={`ro-b${i}`} x={l.x} y={680} t={t + l.ph} length={760} spread={220} angle={90 + (i % 2 ? 1 : -1) * 18} sweep={26} sweepRate={2.2 + (i % 3) * 0.4} color={l.c} opacity={0.32 + 0.25 * beat} />
          ))}
        </g>

        {/* PIANO 2 — amplificatori, batteria, pianoforte a coda a destra */}
        <g transform={L(0.6)}>
          <rect x="-200" y="1140" width="1480" height="400" fill="url(#ro-floor)" />
          <path d="M-200 1140 H1280" stroke={K} strokeWidth="8" />
          <Amp x={110} y={1150} t={t} on={rock + 0.2 * calm} />
          <Amp x={970} y={1150} t={t} on={rock + 0.2 * calm} />
          {/* batteria */}
          <g transform={`translate(540 1140) scale(${1 + beat * 0.015})`} opacity={1 - 0.5 * dark}>
            <ellipse cx="0" cy="-96" rx="96" ry="96" fill="url(#ro-drum)" stroke={K} strokeWidth="9" />
            <circle cx="0" cy="-96" r="62" fill="#F4ECDD" stroke={K} strokeWidth="6" />
            <circle cx="0" cy="-96" r="28" fill="none" stroke={GOLD} strokeWidth="6" opacity={0.5 + 0.5 * beat} />
            <rect x="-170" y="-170" width="70" height="60" rx="8" fill="url(#ro-drum)" stroke={K} strokeWidth="7" />
            <rect x="100" y="-170" width="70" height="60" rx="8" fill="url(#ro-drum)" stroke={K} strokeWidth="7" />
            <path d="M-210 0 L-210 -230 M210 0 L210 -260" stroke={K} strokeWidth="8" />
            <ellipse cx="-210" cy={-232 + cym} rx="80" ry="12" fill="url(#ro-chrome)" stroke={K} strokeWidth="5" transform={`rotate(${-8 + cym} -210 -232)`} />
            <ellipse cx="210" cy={-262 - cym} rx="90" ry="13" fill="url(#ro-chrome)" stroke={K} strokeWidth="5" transform={`rotate(${10 - cym} 210 -262)`} />
          </g>
          {/* pianoforte a coda nel faro finale */}
          <ellipse cx="800" cy="1210" rx={260} ry="40" fill="#FFE7A0" opacity={0.3 * pianoSpot} />
          <Beam id="ro-pspot" x={760} y={600} t={t} length={640} spread={420} angle={86} color="#FFE7A0" opacity={0.5 * pianoSpot} />
          <g opacity={0.35 + 0.65 * Math.max(pianoSpot, 0.2)}>
            <Grand id="ro-grand" x={800} y={1220} s={0.55} t={t} lit={pianoSpot} />
          </g>
        </g>

        {/* lampo */}
        <rect x="-200" y="-200" width="1480" height="2400" fill="#FFF0E0" opacity={flash * 0.14} />

        {/* PIANO 3 — chitarra sull'asta, monitor, bordo del palco */}
        <g transform={L(0.95)}>
          <rect x="-200" y="1300" width="1480" height="800" fill="#0A060A" />
          <path d="M-200 1300 H1280" stroke="#5A3A3A" strokeWidth="8" />
          {[200, 880].map((x, i) => (
            <g key={i} transform={`translate(${x} 1300)`}>
              <path d="M-90 0 L-70 -80 H70 L90 0 Z" fill="#1A1216" stroke={K} strokeWidth="7" strokeLinejoin="round" />
              <rect x="-50" y="-66" width="100" height="50" rx="4" fill="#2A2026" />
              <circle cx="60" cy="-60" r="5" fill="#4AFF7A" opacity={0.3 + 0.7 * rock} />
            </g>
          ))}
          {/* chitarra sull'asta */}
          <g transform="translate(400 1290) rotate(-6)">
            <path d="M-40 0 L0 -120 L40 0 M0 -120 V-150" stroke={K} strokeWidth="7" fill="none" />
            <rect x="-11" y="-520" width="22" height="330" fill="#3A2418" stroke={K} strokeWidth="6" />
            <rect x="-22" y="-560" width="44" height="50" rx="8" fill="url(#ro-gtr)" stroke={K} strokeWidth="6" />
            <path d="M0 -230 C-90 -230 -105 -160 -72 -118 C-135 -86 -125 40 0 50 C125 40 135 -86 72 -118 C105 -160 90 -230 0 -230 Z" fill="url(#ro-gtr)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <rect x="-40" y="-130" width="80" height="22" rx="4" fill={K} />
            <path d="M-4 -520 V30 M4 -520 V30" stroke="#8A7A70" strokeWidth="2" transform={`translate(${Math.sin(t * 50) * 1.5 * rock} 0)`} />
            <Glow id="ro-gtrg" x={0} y={-120} r={180} t={t} color="#FF6A8A" amp={0.2} rate={6} opacity={0.35 * rock} />
          </g>
        </g>

        {/* PIANO 4 — cavi e scaletta in primo piano */}
        <g transform={L(1.25)}>
          <path d="M-200 1700 C100 1640 300 1780 600 1700 S1000 1640 1300 1720" stroke={K} strokeWidth="18" fill="none" />
          <path d="M-200 1700 C100 1640 300 1780 600 1700 S1000 1640 1300 1720" stroke="#2A2026" strokeWidth="8" fill="none" />
          <g transform="translate(760 1820) rotate(6)">
            <rect x="-90" y="-60" width="180" height="140" fill="#F4ECDD" stroke={K} strokeWidth="6" />
            {[0, 1, 2, 3].map((j) => <path key={j} d={`M-70 ${-36 + j * 28} H${50 - j * 12}`} stroke="#3A2A2E" strokeWidth="6" strokeLinecap="round" />)}
            <rect x="-30" y="-74" width="60" height="22" fill="#C8B8A0" opacity=".8" />
          </g>
        </g>

        {/* PIANO 5 — fumo di scena e particelle */}
        <g transform={L(1.7)}>
          <Fog id="ro-fog1" t={t} y={1150} color="#C8A0C8" rx={800} ry={130} opacity={0.18 + 0.15 * rock} />
          <Fog id="ro-fog2" t={t} y={1000} color="#A0A8D8" rx={700} ry={110} speed={0.4} ph={2} opacity={0.12 + 0.1 * rock} />
          <NearMotes id="ro-near" t={t} color="#FFD0E0" opacity={0.06 + 0.06 * rock} vx={-60} />
          {Array.from({ length: 18 }, (_, i) => {
            const p = mod(t * 0.4 + i / 18, 1);
            return <circle key={i} cx={(i * 137) % 1080} cy={1300 - p * 800} r={3 + (i % 3)} fill={RIG[i % 8].c} opacity={rock * (1 - p) * 0.7} />;
          })}
        </g>

        {/* buio finale dopo il gong */}
        <rect x="-200" y="-200" width="1480" height="2400" fill="#000" opacity={dark * 0.55} />
      </g>

      <Finish id="ro" tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};
