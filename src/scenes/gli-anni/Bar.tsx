import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes, Neon, Notes, Wisps } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { Jukebox, K, ORANGE, TINT_DAY } from './Comune';

// Il ritorno al bar: interno di un vecchio bar di provincia. Bancone, macchina del caffè che fuma, scaffale di
// bottiglie, jukebox, flipper, vetrina con l'insegna al neon e un motorino fuori; un calendario sul muro.
// Piani: muro con scaffale e calendario (0,25) · vetrina con la strada e il motorino (0,35) · bancone e macchina
//        del caffè (0,55) · flipper e jukebox (0,75) · tavolino e sgabello in primo piano (1,2) · pulviscolo (1,7)
// Eventi: cues[0] la porta si apre: entra un fascio di luce · cues[2] la polvere si posa: tutto uguale
//         · cues[3] il calendario gira dal 1985 al 1995 (è cambiato lui) · cues[4] il jukebox si accende,
//         partono le note e i ricordi.

const r = rng(1985);
const BOTTLES = Array.from({ length: 12 }, (_, i) => ({ x: 352 + i * 40, h: 60 + r() * 40, c: ['#3A8A4A', '#C8803A', '#8A2A3A', '#D8C870', '#4A6AA8'][Math.floor(r() * 5)] }));

export const Bar: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c0 = cues[0] ?? 0.1, c2 = cues[2] ?? 7.3, c3 = cues[3] ?? 10.2, c4 = cues[4] ?? 11.9;
  const door = eo(seg(t, c0, c0 + 1.5));
  const settle = seg(t, c2, c2 + 2);
  const flip = eob(seg(t, c3, c3 + 0.6));
  const juke = eo(seg(t, c4, c4 + 0.5));
  const year = flip > 0.5 ? '1995' : '1985';

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ba" />
        <Lin id="ba-wall" stops={[[0, '#2A1A1E'], [0.4, '#4A2E2A'], [0.75, '#5A3A30'], [1, '#3A2420']]} />
        <Lin id="ba-street" stops={[[0, '#F8C88A'], [1, '#E8905A']]} />
        <Lin id="ba-counter" stops={[[0, '#8A5A3A'], [0.2, '#6A4028'], [1, '#2A1810']]} />
        <Lin id="ba-top" x2={1} y2={0} stops={[[0, '#C8C0B8'], [0.5, '#F4ECDD'], [1, '#A8A098']]} />
        <Lin id="ba-floor" stops={[[0, '#5A4A3A'], [1, '#1A1410']]} />
        <Lin id="ba-machine" x2={1} y2={0} stops={[[0, '#8A8288'], [0.5, '#E8E0E4'], [1, '#6A6268']]} />
        <pattern id="ba-tiles" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="#3A2E28" />
          <rect width="40" height="40" fill="#5A4A3E" />
          <rect x="40" y="40" width="40" height="40" fill="#5A4A3E" />
        </pattern>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — muro con scaffale, specchio e calendario (calmo in alto per il titolo) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1600" fill="url(#ba-wall)" />
          <rect x="330" y="620" width="500" height="200" rx="8" fill="#2A2E3A" stroke={K} strokeWidth="8" />
          <path d="M330 640 L420 640 L340 720 Z" fill="#FFFFFF" opacity=".08" />
          <path d="M330 720 H830 M330 820 H830" stroke="#6A4A32" strokeWidth="10" />
          {BOTTLES.map((b, i) => (
            <g key={i} transform={`translate(${b.x} ${i % 2 ? 820 : 720})`}>
              <rect x="-10" y={-b.h} width="20" height={b.h} rx="6" fill={b.c} stroke={K} strokeWidth="4" opacity=".9" />
              <rect x="-5" y={-b.h - 16} width="10" height="18" fill={b.c} stroke={K} strokeWidth="3" />
            </g>
          ))}
          {/* calendario che passa dal 1985 al 1995 */}
          <g transform="translate(920 700)">
            <Glow id="ba-cal" x={0} y={30} r={130} t={t} color={ORANGE} amp={0.1} rate={3} opacity={0.5 * flip} />
            <rect x="-62" y="-20" width="124" height="104" rx="4" fill="#F4ECDD" stroke={K} strokeWidth="5" />
            <rect x="-62" y="-20" width="124" height="26" fill="#C8303A" stroke={K} strokeWidth="5" />
            <g transform={`scale(1 ${Math.abs(Math.cos(Math.min(flip, 1) * Math.PI))})`} style={{ transformOrigin: '920px 760px' }}>
              <text x="0" y="62" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="38" fill={flip > 0.5 ? ORANGE : K}>{year}</text>
            </g>
          </g>
        </g>

        {/* PIANO 1 — vetrina sulla strada con l'insegna e il lampione */}
        <g transform={L(0.35)}>
          <rect x="-10" y="620" width="300" height="460" fill="url(#ba-street)" />
          <rect x="-10" y="980" width="300" height="100" fill="#8A6A5A" />
          {/* lampione e marciapiede oltre la vetrina */}
          <path d="M60 1080 V760 Q60 730 90 730" stroke="#5A4A4A" strokeWidth="8" fill="none" />
          <circle cx="96" cy="736" r="10" fill="#FFF3CF" opacity=".8" />
          <rect x="-10" y="620" width="300" height="460" fill="none" stroke={K} strokeWidth="12" />
          <path d="M140 620 V700" stroke={K} strokeWidth="8" />
          <Neon id="ba-neon" t={t} x={140} y={770} text="BAR" color="#FF6A8A" font={SANS} size={80} onAt={-1} />
          {/* fascio di luce dalla porta */}
          <Beam id="ba-door" x={240} y={800} t={t} length={900} spread={lerp(60, 380, door)} angle={18} color="#FFE0A8" opacity={0.15 + 0.4 * door} />
        </g>

        {/* PIANO 2 — pavimento a scacchi, bancone, macchina del caffè */}
        <g transform={L(0.55)}>
          <rect x="-200" y="1080" width="1480" height="900" fill="#4A3C32" />
          {Array.from({ length: 9 }, (_, i) => {
            const y0 = 1080 + 900 * (((i + 1) / 9) ** 1.8), y1 = 1080 + 900 * ((i / 9) ** 1.8);
            return Array.from({ length: 14 }, (_, j) => {
              const xs = (y: number) => [540 + (j - 7) * 140 * ((y - 900) / 180) / 2, 540 + (j - 6) * 140 * ((y - 900) / 180) / 2];
              const [a0, b0] = xs(y1), [a1, b1] = xs(y0);
              return (i + j) % 2 ? <path key={`${i}-${j}`} d={`M${a0} ${y1} L${b0} ${y1} L${b1} ${y0} L${a1} ${y0} Z`} fill="#6A5848" /> : null;
            });
          })}
          <rect x="-200" y="1080" width="1480" height="900" fill="url(#ba-floor)" opacity=".55" />
          <path d="M300 900 H1280 V1140 H300 Z" fill="url(#ba-counter)" stroke={K} strokeWidth="9" />
          <path d="M280 880 H1280 V910 H280 Z" fill="url(#ba-top)" stroke={K} strokeWidth="7" />
          <g transform="translate(560 880)">
            <Wisps t={t} x={-30} y={-130} color="#F4ECDD" n={3} h={160} width={6} opacity={0.6} />
            <rect x="-110" y="-130" width="220" height="130" rx="12" fill="url(#ba-machine)" stroke={K} strokeWidth="8" />
            <rect x="-90" y="-110" width="180" height="40" rx="6" fill="#C8303A" stroke={K} strokeWidth="5" />
            {[-50, 50].map((x) => <path key={x} d={`M${x} -60 V-36 M${x - 14} -36 H${x + 14}`} stroke={K} strokeWidth="7" />)}
            <rect x="-70" y="-26" width="34" height="26" rx="4" fill="#F4ECDD" stroke={K} strokeWidth="4" />
          </g>
          {/* sgabelli del bancone */}
          {[400, 680, 960].map((x) => (
            <g key={x} transform={`translate(${x} 1230)`}>
              <ellipse cx="0" cy="-120" rx="56" ry="16" fill="#C8303A" stroke={K} strokeWidth="6" />
              <path d="M0 -110 V0 M-40 0 H40" stroke={K} strokeWidth="10" />
            </g>
          ))}
        </g>

        {/* PIANO 3 — flipper a sinistra e jukebox a destra */}
        <g transform={L(0.75)}>
          <g transform="translate(130 1270)">
            <path d="M-120 -40 L120 -40 L80 -200 L-80 -200 Z" fill="#2F6EA6" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M-104 -50 L104 -50 L70 -190 L-70 -190 Z" fill="#1A3A60" stroke={K} strokeWidth="4" />
            <path d="M-104 -50 L104 -50 L70 -190 L-70 -190 Z" fill="#FFFFFF" opacity=".08" />
            <path d="M-40 -66 L-8 -78 M40 -66 L8 -78" stroke={ORANGE} strokeWidth="8" strokeLinecap="round" />
            <circle cx={Math.sin(t * 2.3) * 40} cy={-120 + Math.cos(t * 3.1) * 40} r="7" fill="#E8E4EC" stroke={K} strokeWidth="2" />
            {[0, 1, 2].map((i) => <circle key={i} cx={-40 + i * 40} cy={-160 + (i % 2) * 20} r="12" fill={['#E0303A', ORANGE, '#7AD06A'][i]} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 5 + i * 2)) * (0.4 + 0.6 * juke)} stroke={K} strokeWidth="3" />)}
            <rect x="-90" y="-380" width="180" height="180" rx="10" fill="#1A2440" stroke={K} strokeWidth="8" />
            <Glow id="ba-pin" x={0} y={-290} r={150} t={t} color="#7AD0FF" amp={0.2} rate={4} opacity={0.3 + 0.3 * juke} />
            <rect x="-60" y="-360" width="120" height="40" rx="6" fill="#0E1222" stroke={K} strokeWidth="4" />
            <text x="0" y="-330" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="30" fill={ORANGE} opacity={0.6 + 0.4 * juke}>{String(10000 + Math.floor(t * 731) % 90000).padStart(6, '0')}</text>
            <path d="M-70 -300 Q0 -250 70 -300" stroke="#E86A8A" strokeWidth="6" fill="none" opacity=".8" />
            <path d="M-100 -40 V30 M100 -40 V30" stroke={K} strokeWidth="12" />
          </g>
          <Jukebox id="ba-juke" x={900} y={1280} s={0.95} t={t} on={0.2 + 0.8 * juke} />
          <Notes t={t - c4} x={860} y={1000} n={6} spread={200} rise={200} color={ORANGE} outline={K} size={0.9 * juke} speed={0.25} />
        </g>

        {/* PIANO 4 — tavolino con due bicchieri e carte, bordo della porta */}
        <g transform={L(1.2)}>
          <ellipse cx="560" cy="1660" rx="300" ry="60" fill="#6A4028" stroke={K} strokeWidth="10" />
          <path d="M560 1720 V2200" stroke={K} strokeWidth="30" />
          {[480, 620].map((x, i) => (
            <g key={i}>
              <path d={`M${x - 26} 1560 L${x - 20} 1640 H${x + 20} L${x + 26} 1560 Z`} fill="#D8E8F0" stroke={K} strokeWidth="6" opacity=".9" />
              <path d={`M${x - 22} 1600 H${x + 22}`} stroke={i ? '#C8803A' : '#E8D870'} strokeWidth="18" opacity=".7" />
            </g>
          ))}
          <g transform="translate(720 1650) rotate(12)">
            <rect x="-30" y="-40" width="60" height="84" rx="6" fill="#F4ECDD" stroke={K} strokeWidth="5" />
            <path d="M-14 -20 L0 -4 L14 -20 Z" fill="#C8303A" />
          </g>
          <path d="M1280 -200 H990 V2200 H1280 Z" fill="#2A1A14" stroke={K} strokeWidth="10" />
          <path d="M1010 -200 V2200" stroke="#5A3A2A" strokeWidth="6" />
        </g>
        <g transform={L(1.7)}>
          <Dust t={t} top={{ y: 800, x0: 240, x1: 320 }} bottom={{ y: 1400, x0: 300, x1: 900 }} n={26} color="#FFF0C8" boost={-0.1 - 0.4 * settle} />
          <NearMotes id="ba-near" t={t} color="#FFE2B0" opacity={0.08} />
        </g>
      </g>

      <Finish id="ba" tint={TINT_DAY} tintOpacity={0.1} />
    </svg>
  );
};
