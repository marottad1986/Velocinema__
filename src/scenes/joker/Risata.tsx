import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { JokerDefs, K, Ombra } from './Comuni';

// La risata che non si ferma: l'interno di un autobus di notte visto di fianco, una fila di finestrini con la città che
// corre fuori, i sedili verdi consumati, i corrimano, le plafoniere al neon. Sul sedile centrale il cartoncino
// plastificato che spiega la malattia (una faccina che ride e righe di testo), l'oggetto chiave in rosso.
// Eventi: prima frase il cartoncino si illumina sotto la plafoniera; seconda frase le plafoniere vanno a scatti, come una
// risata che non si ferma; terza frase l'autobus frena (si ferma il motore dello spartito), le maniglie oscillano in
// avanti, e a cue 2 + 0,4 (timpano) il cartoncino si strappa in due con l'impronta sporca di una scarpa: lo prendono in
// giro e lo picchiano, senza mostrare nessuno.
// Piani: città fuori dai finestrini (0,25) · fiancata, finestrini e pubblicità (0,5) · sedili (0,7) · cartoncino (0,8)
//        · palo e schienali in primo piano (1,2) · pulviscolo e particelle vicine (1,5–1,8)

const r = rng(1981);
const LIGHTS = Array.from({ length: 16 }, () => ({ x: r() * 1500, y: 740 + r() * 200, s: 6 + r() * 12, c: ['#F2C46A', '#D2382E', '#8AC8E0', '#F2E6B0'][Math.floor(r() * 4)] }));
const BLD = Array.from({ length: 10 }, (_, i) => ({ x: i * 160, w: 120 + r() * 50, h: 120 + r() * 200 }));

export const Risata: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const card = eo(seg(t, cues[0] + 0.6, cues[0] + 1.4));
  // risata: le luci a scatti con un ritmo irregolare tra la seconda e la terza frase
  const fit = t > cues[1] && t < cues[2] ? (Math.sin(t * 21) + Math.sin(t * 13.7) > 0.4 ? 1 : 0.35) : 1;
  const brake = seg(t, cues[2], cues[2] + 0.5);
  const run = t < cues[2] ? t : cues[2] + 0.25 * (1 - (1 - brake) ** 2); // la città rallenta e si ferma
  const swing = t < cues[2] ? Math.sin(t * 2.2) * 4 : 18 * Math.exp(-(t - cues[2]) * 1.6) * Math.cos((t - cues[2]) * 5);
  const tear = eob(seg(t, cues[2] + 0.4, cues[2] + 0.9));
  const print = seg(t, cues[2] + 0.4, cues[2] + 0.48);
  const dim = t > cues[2] + 0.4 ? 0.7 : 1;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="rs" />
        <JokerDefs id="rs" />
        <Lin id="rs-night" stops={[[0, '#0A0E14'], [0.6, '#16202A'], [1, '#2A2A24']]} />
        <Lin id="rs-ceil" stops={[[0, '#141A18'], [0.5, '#24302C'], [1, '#34423C']]} />
        <Lin id="rs-wall" stops={[[0, '#4A5A52'], [0.5, '#3A4842'], [1, '#26302C']]} />
        <Lin id="rs-seat" stops={[[0, '#4A8A6A'], [0.5, '#2E6A50'], [1, '#1E4A38']]} />
        <Lin id="rs-seat2" stops={[[0, '#3A7A5A'], [1, '#183A2C']]} />
        <Lin id="rs-floor" stops={[[0, '#3A3A34'], [1, '#141410']]} />
        <Lin id="rs-card" stops={[[0, '#FFF8E6'], [1, '#E8DCC0']]} />
        <Lin id="rs-ad" x2={1} y2={0} stops={[[0, '#C8B890'], [1, '#E8D8B0']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — la città di notte che corre fuori (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#rs-night)" />
          {BLD.map((b, i) => {
            const x = mod(b.x - run * 260, 1600) - 260;
            return <g key={i}><rect x={x} y={950 - b.h} width={b.w} height={b.h + 40} fill="#1A2028" />{[0, 1, 2].map((k) => <rect key={k} x={x + 16 + k * 34} y={970 - b.h} width="14" height="18" fill="#F2C46A" opacity={(i + k) % 3 ? 0.15 : 0.7} />)}</g>;
          })}
          {LIGHTS.map((l, i) => <circle key={i} cx={mod(l.x - run * 620, 1500) - 200} cy={l.y} r={l.s} fill={l.c} opacity=".7" />)}
          {LIGHTS.slice(0, 6).map((l, i) => <rect key={`s${i}`} x={mod(l.x - run * 620, 1500) - 260} y={l.y - 3} width={brake < 1 ? 90 * (1 - brake) : 0} height="6" fill={l.c} opacity=".35" />)}
        </g>

        {/* PIANO 1 — soffitto, plafoniere, fiancata con i finestrini e le pubblicità (0,5) */}
        <g transform={L(0.5)}>
          <path d="M-200 -200 H1280 V610 H-200 Z" fill="url(#rs-ceil)" />
          {[60, 420, 780].map((x) => (
            <g key={x}>
              <rect x={x} y="598" width="260" height="10" rx="4" fill="#E8F0D8" opacity={0.3 + 0.7 * fit * dim} />
              <Glow id={`rs-l${x}`} x={x + 130} y={600} r={360} t={t} color="#E8F4D8" amp={0.03} rate={2} opacity={0.4 * fit * dim} />
            </g>
          ))}
          {/* pannelli pubblicitari sopra i finestrini */}
          <rect x="-200" y="610" width="1480" height="84" fill="#26302C" stroke={K} strokeWidth="6" />
          {[[-150, 'GOTHAM SQUARE'], [250, 'CORSO DI MAGIA'], [650, 'RIDI CON MURRAY']].map(([x, txt], i) => (
            <g key={i}>
              <rect x={Number(x)} y="620" width="340" height="62" rx="6" fill="url(#rs-ad)" stroke={K} strokeWidth="5" />
              <text x={Number(x) + 170} y="661" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="26" fill="#3A2A1E">{txt}</text>
            </g>
          ))}
          {/* fiancata e finestrini */}
          <path d="M-200 694 H1280 V730 H-200 Z M-200 966 H1280 V1300 H-200 Z" fill="url(#rs-wall)" stroke={K} strokeWidth="7" />
          {[-170, 170, 510, 850].map((x) => (
            <g key={x}>
              <rect x={x} y="726" width="300" height="240" rx="22" fill="none" stroke="#7A8A80" strokeWidth="20" />
              <rect x={x} y="726" width="300" height="240" rx="22" fill="none" stroke={K} strokeWidth="5" />
              <path d={`M${x + 20} 736 L${x + 110} 956 M${x + 60} 736 L${x + 150} 956`} stroke="#FFFFFF" strokeWidth="7" opacity=".08" />
              <path d={`M${x + 150} 726 V966`} stroke="#5A6A60" strokeWidth="10" />
            </g>
          ))}
          {/* graffi sul vetro e il cordino della fermata */}
          <path d="M560 800 l40 20 l-10 14 l50 6 M600 880 q20 -10 40 4" stroke="#B8C8C0" strokeWidth="3" fill="none" opacity=".45" />
          <path d="M-200 706 H1280" stroke="#C8A44A" strokeWidth="5" />
          {[120, 460, 800].map((x) => <rect key={x} x={x} y="698" width="30" height="16" rx="4" fill="#B8302A" stroke={K} strokeWidth="3" />)}
        </g>

        {/* PIANO 2 — i sedili, pavimento (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1250 H1280 V2200 H-200 Z" fill="url(#rs-floor)" />
          <path d="M-200 1252 H1280" stroke="#6A6A60" strokeWidth="5" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-200 + i * 130} 1240 l-40 960`} stroke="#000" strokeWidth="3" opacity=".2" />)}
          {[-110, 270, 650, 1030].map((x, i) => (
            <g key={x}>
              <Ombra id="rs" x={x} y={1258} rx={190} ry={20} />
              <path d={`M${x - 150} 1140 V920 Q${x - 150} 880 ${x - 110} 880 H${x + 110} Q${x + 150} 880 ${x + 150} 920 V1140 Z`} fill="url(#rs-seat)" stroke={K} strokeWidth="8" />
              {[0, 1, 2].map((k) => <path key={k} d={`M${x - 120} ${930 + k * 60} H${x + 120}`} stroke="#1E4A38" strokeWidth="6" />)}
              <path d={`M${x - 136} 904 Q${x - 130} 892 ${x - 100} 892 H${x + 60}`} stroke="#9AD8B4" strokeWidth="5" fill="none" opacity=".5" />
              <rect x={x - 165} y="1130" width="330" height="70" rx="22" fill="url(#rs-seat2)" stroke={K} strokeWidth="8" />
              <path d={`M${x - 120} 1200 V1256 M${x + 120} 1200 V1256`} stroke="url(#rs-steel)" strokeWidth="18" />
              {i === 0 && <path d={`M${x - 60} 1000 q20 -14 40 0 q-10 20 -40 0`} fill="#C8B890" stroke={K} strokeWidth="3" />}
              {i === 3 && <g transform={`translate(${x - 40} 1120) rotate(-6)`}><rect x="-70" y="-24" width="140" height="40" fill="#D8CCAA" stroke={K} strokeWidth="4" /><path d="M-60 -12 h90 M-60 0 h70" stroke="#5A4A3A" strokeWidth="4" /></g>}
            </g>
          ))}
        </g>

        {/* PIANO 3 — il cartoncino della malattia sul sedile centrale, poi strappato (0,8) */}
        <g transform={L(0.8)}>
          <Glow id="rs-card" x={460} y={1040} r={240} t={t} color="#FFF4D0" amp={0.05} rate={3} opacity={0.3 * card * fit} />
          {[-1, 1].map((side) => (
            <g key={side} transform={`translate(${460 + side * 70 * tear} ${1040 + 40 * tear}) rotate(${-6 + side * 16 * tear})`}>
              <clipPath id={`rs-half${side}`}><path d={side < 0 ? 'M-200 -200 H4 L-8 -40 L10 0 L-6 40 L6 200 H-200 Z' : 'M200 -200 H4 L-8 -40 L10 0 L-6 40 L6 200 H200 Z'} /></clipPath>
              <g clipPath={`url(#rs-half${side})`} transform="scale(1.35)">
                <rect x="-130" y="-86" width="260" height="172" rx="14" fill="url(#rs-card)" stroke={K} strokeWidth="6" />
                <rect x="-118" y="-74" width="236" height="148" rx="8" fill="none" stroke="#C8C0A8" strokeWidth="3" />
                <circle cx="-66" cy="-6" r="40" fill="#FFF8E6" stroke={P.accento} strokeWidth="7" />
                <circle cx="-80" cy="-18" r="5" fill={K} /><circle cx="-52" cy="-18" r="5" fill={K} />
                <path d="M-90 2 Q-66 32 -42 2 Z" fill={P.accento} stroke={K} strokeWidth="3" />
                <text x="44" y="-48" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="20" fill="#3A2A1E">SCUSATE</text>
                {[-26, -2, 22, 46].map((y, k) => <path key={y} d={`M-6 ${y} H${96 - (k % 2) * 22}`} stroke="#5A4A3A" strokeWidth="6" strokeLinecap="round" />)}
                <path d="M-122 -80 L-60 -80" stroke="#FFFFFF" strokeWidth="5" opacity=".8" strokeLinecap="round" />
                {/* impronta sporca della scarpa */}
                <g opacity={print * 0.85} transform="translate(30 10) rotate(-20)">
                  <path d="M-30 -60 Q0 -76 26 -60 Q34 -20 22 0 Q30 30 20 56 Q0 68 -18 56 Q-30 30 -22 0 Q-36 -20 -30 -60 Z" fill="#3A2E24" opacity=".75" />
                  {[-44, -26, -8, 10, 30, 46].map((y) => <path key={y} d={`M-20 ${y} H18`} stroke="#E8DCC0" strokeWidth="4" opacity=".5" />)}
                </g>
              </g>
            </g>
          ))}
        </g>

        {/* PIANO 4 — palo giallo e maniglie che oscillano, schienali in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 600 H1280" stroke="url(#rs-steel)" strokeWidth="22" />
          {[40, 300, 560, 820, 1080].map((x, i) => (
            <g key={x} transform={`rotate(${swing + Math.sin(t * 2 + i) * 2} ${x} 600)`}>
              <path d={`M${x} 600 V690`} stroke="#3A3A34" strokeWidth="10" />
              <path d={`M${x - 30} 690 h60 l-10 60 h-40 Z`} fill="#E8E0C8" stroke={K} strokeWidth="6" />
              <path d={`M${x - 16} 706 h32 l-6 32 h-20 Z`} fill="#26302C" />
            </g>
          ))}
          <path d="M930 -200 V2200" stroke="#D8A030" strokeWidth="34" />
          <path d="M920 -200 V2200" stroke="#F6D880" strokeWidth="6" opacity=".7" />
                    {[-60, 420].map((x) => (
            <g key={x}>
              <path d={`M${x} 2200 V1560 Q${x} 1500 ${x + 60} 1500 H${x + 400} Q${x + 460} 1500 ${x + 460} 1560 V2200 Z`} fill="url(#rs-seat)" stroke={K} strokeWidth="10" />
              <path d={`M${x + 30} 1580 H${x + 430} M${x + 30} 1660 H${x + 430}`} stroke="#1E4A38" strokeWidth="8" />
              <path d={`M${x + 20} 1540 Q${x + 30} 1514 ${x + 80} 1514 H${x + 300}`} stroke="#9AD8B4" strokeWidth="6" fill="none" opacity=".45" />
              <rect x={x + 40} y="1470" width="380" height="34" rx="16" fill="url(#rs-steel)" stroke={K} strokeWidth="6" />
            </g>
          ))}
        </g>

        {/* PIANO 5 — pulviscolo nella luce, particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 600, x0: 120, x1: 960 }} bottom={{ y: 1200, x0: 60, x1: 1020 }} seed={2} n={26} color="#E8F0D0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="rs-near" t={t} color="#E8F0D0" n={6} opacity={0.08} />
        </g>
        <rect x="-200" y="-200" width="1480" height="2400" fill="#000" opacity={(1 - fit) * 0.25} />
      </g>
      <Finish id="rs" tint="#1E2E26" tintOpacity={0.14} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): cartoncino cue0 + 0,6 · luci a scatti cue1 → cue2 · frenata cue2 · strappo e impronta cue2 + 0,4.
