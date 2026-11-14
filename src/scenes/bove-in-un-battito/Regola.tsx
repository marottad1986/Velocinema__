import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { HAND, SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { GIALLO, K } from './Comuni';

// Perché non può giocare in Italia: lo studio di un medico sportivo la sera, sotto una lampada da tavolo. Sulla scrivania
// il certificato di idoneità agonistica con la casella vuota; f1 «…non possono dargli il via libera»: cala il timbro rosso
// «NON IDONEO». Sulla parete una bacheca di sughero con la sagoma dell'Italia; f2 «Così, come il danese Christian
// Eriksen… può giocare solo all'estero»: compare il ritaglio di giornale bianco e rosso su Eriksen e una freccia gialla
// tratteggiata esce dall'Italia verso nord, fino al cartellino «ESTERO». Nessuna persona.
// Piani: parete (0,25) · bacheca (0,45) · lampada (0,6) · scrivania e certificato (0,85) · primo piano (1,2) · pulviscolo (1,5)

// sagoma semplificata dell'Italia (stivale), centrata in (0, 0), alta circa 300
const _ITALIA_UNUSED = 'M-40 -150 Q-10 -162 30 -150 Q52 -144 60 -126 Q44 -112 34 -96 Q30 -70 46 -44 Q70 -10 100 18 Q120 34 140 46 Q150 60 134 66 Q118 64 112 78 Q122 96 116 114 Q104 128 96 112 Q90 92 76 80 Q60 66 44 50 Q20 26 0 0 Q-20 -24 -34 -52 Q-48 -80 -60 -108 Q-70 -132 -40 -150 Z';

export const Regola: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const tStamp = griglia(cues[0] + 4.6);
  const down = seg(t, tStamp - 0.35, tStamp);
  const up = seg(t, tStamp + 0.3, tStamp + 1.1);
  const stampY = lerp(-260, 0, eo(down));
  const away = eo(up); // dopo il colpo il timbro torna di lato sulla scrivania
  const sX = lerp(650, 930, away), sY = lerp(1160 + stampY * 0.8, 1110, away) - Math.sin(away * Math.PI) * 160;
  const ink = eo(seg(t, tStamp, tStamp + 0.15));
  const tClip = griglia(cues[1] + 1.4);
  const clip = eob(seg(t, tClip, tClip + 0.5), 1.6);
  const tArrow = griglia(cues[1] + 4.2);
  const arrow = eo(seg(t, tArrow, tArrow + 1.2));
  const tag = eob(seg(t, tArrow + 1.0, tArrow + 1.5), 1.8);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="re" />
        <Lin id="re-wall" stops={[[0, '#1A1C26'], [0.5, '#2A2C3A'], [1, '#22242E']]} />
        <linearGradient id="re-cork" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#C89A62" /><stop offset="1" stopColor="#8A6238" /></linearGradient>
        <linearGradient id="re-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6A4228" /><stop offset=".4" stopColor="#4A2C18" /><stop offset="1" stopColor="#2A180C" /></linearGradient>
        <linearGradient id="re-paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF8E8" /><stop offset="1" stopColor="#E8DCC4" /></linearGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — parete scura dello studio, cono di luce della lampada (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#re-wall)" />
          <Glow id="re-wl" x={700} y={900} r={620} t={t} color="#FFD8A0" amp={0.03} rate={1.4} opacity={0.35} />
          {/* diploma incorniciato e scaffale con faldoni */}
          <rect x="90" y="700" width="170" height="130" fill="#E8DCC4" stroke={K} strokeWidth="8" />
          <rect x="108" y="718" width="134" height="94" fill="none" stroke="#B8A888" strokeWidth="3" />
          {[740, 760, 780].map((y) => <path key={y} d={`M124 ${y} H226`} stroke="#9A8A6A" strokeWidth="3" />)}
          <rect x="70" y="1010" width="230" height="16" fill="#3A2A1E" stroke={K} strokeWidth="5" />
          {[['#3A5A8A', 0], ['#8A3A3A', 1], ['#3A7A5A', 2], ['#C8A040', 3], ['#5A4A7A', 4]].map(([c, i]) => (
            <rect key={i as number} x={84 + (i as number) * 40} y={890 + ((i as number) % 2) * 10} width="34" height={120 - ((i as number) % 2) * 10} fill={c as string} stroke={K} strokeWidth="4" />
          ))}
        </g>
        {/* PIANO 1 — bacheca di sughero: cartellino ITALIA, ritaglio su Eriksen, freccia verso ESTERO (0,45) */}
        <g transform={L(0.45)}>
          <rect x="350" y="640" width="620" height="300" rx="8" fill="url(#re-cork)" stroke={K} strokeWidth="10" />
          <rect x="362" y="652" width="596" height="276" fill="none" stroke="#6A4628" strokeWidth="5" />
          {[[380, 676], [940, 690], [400, 910], [930, 905], [640, 920], [700, 670]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#5A3A20" />)}
          {/* cartellino ITALIA col tricolore */}
          <g transform="translate(540 800) rotate(-4)">
            <rect x="-96" y="-44" width="192" height="88" rx="8" fill="#F4EEE0" stroke={K} strokeWidth="6" />
            <rect x="-96" y="-44" width="64" height="20" fill="#2E8A4A" /><rect x="-32" y="-44" width="64" height="20" fill="#F4F4F4" /><rect x="32" y="-44" width="64" height="20" fill="#C8262E" />
            <rect x="-96" y="-44" width="192" height="88" rx="8" fill="none" stroke={K} strokeWidth="6" />
            <text x="0" y="28" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="36" fill="#14100C" letterSpacing="0.06em">ITALIA</text>
            <circle cx="0" cy="-44" r="9" fill="#C83A3A" stroke={K} strokeWidth="4" />
          </g>
          {/* freccia gialla tratteggiata che si disegna da ITALIA a ESTERO */}
          {Array.from({ length: 16 }, (_, i) => {
            const u = i / 15;
            if (u > arrow) return null;
            const x = (1 - u) ** 2 * 610 + 2 * (1 - u) * u * 660 + u * u * 760, y = (1 - u) ** 2 * 752 + 2 * (1 - u) * u * 620 + u * u * 712;
            return <circle key={i} cx={x} cy={y} r="7" fill={GIALLO} stroke={K} strokeWidth="2.5" />;
          })}
          {arrow > 0.98 && <path d="M748 690 L790 722 L744 734 Z" fill={GIALLO} stroke={K} strokeWidth="4" strokeLinejoin="round" />}
          <Glow id="re-ar" x={850} y={730} r={120} t={t} color="#FFE07A" amp={0.08} rate={3} opacity={0.6 * tag} />
          <g transform={`translate(855 735) scale(${tag}) rotate(4)`}>
            <rect x="-80" y="-30" width="160" height="60" rx="8" fill={GIALLO} stroke={K} strokeWidth="6" />
            <text x="0" y="12" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="32" fill="#14100C" letterSpacing="0.08em">ESTERO</text>
            <circle cx="0" cy="-30" r="9" fill="#C83A3A" stroke={K} strokeWidth="4" />
          </g>
          {/* ritaglio di giornale su Eriksen, bianco e rosso (colori della Danimarca), niente foto */}
          <g transform={`translate(820 862) rotate(5) scale(${clip})`} opacity={seg(t, tClip, tClip + 0.15)}>
            <rect x="-110" y="-56" width="220" height="112" fill="#F4EEE0" stroke={K} strokeWidth="6" />
            <rect x="-110" y="-56" width="220" height="34" fill="#C8262E" />
            <path d="M-56 -56 V-22 M-110 -39 H110" stroke="#FFFFFF" strokeWidth="9" />
            <text x="0" y="14" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="32" fill="#14100C">ERIKSEN</text>
            {[30, 44].map((y) => <path key={y} d={`M-90 ${y} H${y === 44 ? 30 : 90}`} stroke="#8A8270" strokeWidth="5" />)}
            <circle cx="0" cy="-56" r="8" fill="#2A5AC8" stroke={K} strokeWidth="4" />
          </g>
        </g>
        {/* PIANO 2 — la lampada da tavolo a braccio, con l'alone (0,6) */}
        <g transform={L(0.6)}>
          <path d="M200 980 L230 860 L340 800" stroke="#2A2C34" strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d="M200 980 L230 860 L340 800" stroke="#5A5E6A" strokeWidth="5" fill="none" />
          <path d="M310 770 L420 820 L380 880 L280 830 Z" fill="#2A4A3A" stroke={K} strokeWidth="7" />
          <Glow id="re-lamp" x={390} y={870} r={220} t={t} color="#FFE6B0" amp={0.04} rate={2.2} opacity={0.9} />
          <path d="M350 860 L820 1200 L200 1200 Z" fill="#FFE6B0" opacity=".12" />
        </g>
        {/* PIANO 3 — la scrivania con il certificato e il timbro (0,85) */}
        <g transform={L(0.85)}>
          <path d="M-200 970 H1280 V2200 H-200 Z" fill="url(#re-desk)" />
          <path d="M-200 972 H1280" stroke="#9A6A42" strokeWidth="5" />
          {[1060, 1200, 1420, 1600].map((y) => <path key={y} d={`M-200 ${y} Q540 ${y + 18} 1280 ${y - 6}`} stroke="#3A2214" strokeWidth="4" fill="none" opacity=".6" />)}
          {/* certificato */}
          <g transform="translate(590 1010) scale(0.78) rotate(-4)">
            <path d="M-260 -40 L250 -60 L270 330 L-240 350 Z" fill="#000" opacity=".35" transform="translate(12 14)" />
            <path d="M-260 -40 L250 -60 L270 330 L-240 350 Z" fill="url(#re-paper)" stroke={K} strokeWidth="7" />
            <g transform="rotate(-2.5)">
              <text x="0" y="10" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="24" fill="#2A2A34">CERTIFICATO DI IDONEITÀ</text>
              <text x="0" y="42" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="20" fill="#5A5A64">ATTIVITÀ SPORTIVA AGONISTICA</text>
              {[90, 124, 158, 192].map((y) => <path key={y} d={`M-200 ${y} H200`} stroke="#B8B0A0" strokeWidth="3" />)}
              <text x="-200" y="118" fontFamily={HAND} fontSize="30" fill="#3A4A8A">calcio</text>
              {/* casella vuota del giudizio */}
              <rect x="40" y="220" width="160" height="70" fill="none" stroke="#8A8270" strokeWidth="4" strokeDasharray="10 8" />
              <text x="-200" y="262" fontFamily={SANS} fontWeight={800} fontSize="20" fill="#5A5A64">GIUDIZIO</text>
              {/* impronta del timbro */}
              <g transform="translate(70 200) rotate(-10)" opacity={ink}>
                <rect x="-150" y="-50" width="300" height="100" rx="10" fill="none" stroke="#C8262E" strokeWidth="9" />
                <text x="0" y="18" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="50" fill="#C8262E" letterSpacing="0.06em">NON IDONEO</text>
              </g>
            </g>
          </g>
          {/* il timbro che cala */}
          <g transform={`translate(${sX} ${sY}) scale(0.8)`}>
            <ellipse cx="0" cy="32" rx="120" ry="16" fill="#000" opacity={0.4 * (1 - Math.min(1, Math.abs(stampY) / 260)) * (1 - Math.sin(away * Math.PI))} />
            <rect x="-110" y="-30" width="220" height="40" rx="6" fill="#3A2A22" stroke={K} strokeWidth="7" />
            <rect x="-100" y="6" width="200" height="22" fill="#C8262E" stroke={K} strokeWidth="5" />
            <path d="M-30 -30 L-24 -120 H24 L30 -30 Z" fill="#5A3A28" stroke={K} strokeWidth="7" />
            <ellipse cx="0" cy="-140" rx="46" ry="32" fill="#6A4430" stroke={K} strokeWidth="7" />
            <path d="M-24 -150 Q0 -166 24 -150" stroke="#A8724A" strokeWidth="5" fill="none" />
          </g>
          {/* tampone dell'inchiostro, penna e occhiali */}
          <rect x="150" y="1060" width="150" height="100" rx="10" fill="#2A2A34" stroke={K} strokeWidth="7" />
          <rect x="164" y="1072" width="122" height="76" rx="6" fill="#8A1A22" />
          <path d="M150 1230 L380 1180" stroke="#14141C" strokeWidth="16" strokeLinecap="round" />
          <path d="M362 1184 L388 1178" stroke={GIALLO} strokeWidth="16" strokeLinecap="round" />
        </g>
        {/* PIANO 4 — bordo della scrivania e tazza in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <g transform="translate(150 1700)">
            <path d="M-80 -120 H80 L70 40 Q0 60 -70 40 Z" fill="#E8E4DC" stroke={K} strokeWidth="9" />
            <path d="M80 -90 Q140 -80 130 -30 Q120 10 74 0" stroke={K} strokeWidth="10" fill="none" />
            <ellipse cx="0" cy="-120" rx="80" ry="18" fill="#3A2214" stroke={K} strokeWidth="7" />
          </g>
          <path d="M-200 1880 H1280 V2200 H-200 Z" fill="#1A0E06" />
        </g>
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 860, x0: 300, x1: 460 }} bottom={{ y: 1500, x0: 140, x1: 800 }} n={30} color="#FFE6B0" seed={21} />
          <NearMotes id="re-near" t={t} color="#FFE6B0" n={5} r0={50} r1={130} y0={900} y1={1900} opacity={0.07} />
        </g>
      </g>
      <Finish id="re" tint="#1E2A3A" tintOpacity={0.1} />
    </svg>
  );
};
