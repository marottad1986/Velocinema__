import React from 'react';
import { camera, eob, eo, lerp, mod, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Flyers, Glow, Lightning, NearMotes, Neon, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Le Figi: vetrina di un'agenzia di viaggi — manifesto con un aereo colpito da un fulmine e la scritta
// «Potrebbe succedere a te!» (oggetto chiave, accento); mappamondo con le Figi cerchiate; biglietti esauriti.
// Dettaglio da studio: nell'angolo della vetrina una piccola telecamera con la spia rossa che lampeggia.
// Piani: facciata e tenda (0,25) · fondo della vetrina con luce calda (0,45) · manifesti, mappamondo, biglietti (0,65)
//        · vetro con riflessi e cornice (0,8) · marciapiede, vaso e lampione in primo piano (1,25) · foglie e pulviscolo (1,5–1,8)

const K = '#142235';
const MARK = '#D2453A';

export const Figi: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // cerchio sulle Figi (cue 1), timbro ESAURITO (cue 2), fulmine sul manifesto (cue 3), scritta (cue 4)
  const circle = eo(seg(t, cues[1] + 0.2, cues[1] + 1.2));
  const stamp = eob(seg(t, cues[2] + 0.15, cues[2] + 0.45));
  const flash = flashAt(t, [cues[3] + 0.15, cues[3] + 0.75], [1, 0.7]);
  const slogan = eob(seg(t, cues[4], cues[4] + 0.5));
  const rec = Math.sin(t * 5) > 0 ? 1 : 0.2;
  const spin = mod(t * 30, 60); // meridiani che scorrono
  const sheen = mod(t * 0.12, 1);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fj" />
        <Lin id="fj-wall" stops={[[0, '#FBF7EC'], [0.4, '#F4F1E6'], [0.75, '#E9E2CF'], [1, '#D8CFB8']]} />
        <Lin id="fj-shop" stops={[[0, '#FFE2B8'], [0.5, '#F6CF9A'], [1, '#D9A974']]} />
        <Lin id="fj-sky" stops={[[0, '#2D4A6E'], [0.6, '#4B6E92'], [1, '#8FB0CC']]} />
        <Lin id="fj-fiji" stops={[[0, '#8FD3F4'], [0.6, '#BFE6F6'], [1, '#F4E2B0']]} />
        <Lin id="fj-globe" x2={1} y2={0} stops={[[0, '#9ED6F2'], [0.55, P.principale], [1, '#2E6F99']]} />
        <Lin id="fj-glass" x2={1} y2={1} stops={[[0, '#FFFFFF', 0], [0.45, '#FFFFFF', 0.35], [0.55, '#FFFFFF', 0], [1, '#FFFFFF', 0]]} />
        <Lin id="fj-walk" stops={[[0, '#C9C2B0'], [1, '#8E8878']]} />
        <Lin id="fj-pot" x2={1} y2={0} stops={[[0, '#F4F1E6'], [1, '#B9B2A0']]} />
        <clipPath id="fj-win"><rect x="110" y="660" width="860" height="580" /></clipPath>
        <clipPath id="fj-post"><rect x="162" y="712" width="356" height="406" /></clipPath>
        <clipPath id="fj-gl"><circle cx="790" cy="930" r="98" /></clipPath>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — facciata pastello calma dietro il titolo, tenda a righe (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#fj-wall)" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M-200 ${120 + i * 56} H1280`} stroke="#E4DCC6" strokeWidth="3" opacity=".5" />)}
        </g>
        <g transform={L(0.4)}>
          <path d="M60 540 H1020 L1060 640 H20 Z" fill="#F4F1E6" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M${60 + i * 120} 540 H${120 + i * 120} L${20 + (i * 120 + 60) * (1040 / 960)} 640 H${20 + i * 130} Z`} fill={P.principale} />
          ))}
          {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${20 + i * 80} 640 q40 44 80 0`} fill={i % 2 ? P.principale : '#F4F1E6'} stroke={K} strokeWidth="6" />)}
          <text x="540" y="606" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="44" fill={K} letterSpacing="6">AGENZIA VIAGGI</text>
        </g>

        {/* PIANO 1 — interno della vetrina con luce calda e pulviscolo (0,45) */}
        <g transform={L(0.45)} clipPath="url(#fj-win)">
          <rect x="60" y="660" width="960" height="600" fill="url(#fj-shop)" />
          <Glow id="fj-lamp" x={560} y={700} r={420} t={t} color="#FFF1CF" amp={0.05} rate={1.5} opacity={0.8} />
          <path d="M560 660 L380 1240 H760 Z" fill="#FFF6DE" opacity=".25" />
          <Dust t={t} top={{ y: 680, x0: 520, x1: 600 }} bottom={{ y: 1220, x0: 380, x1: 760 }} n={22} color="#FFFFFF" />
          {/* mensola */}
          <path d="M60 1150 H1020" stroke="#B8875A" strokeWidth="22" />
        </g>

        {/* PIANO 2 — manifesti, mappamondo, biglietti (0,65) */}
        <g transform={L(0.65)}>
          {/* manifesto chiave: aereo colpito da un fulmine (accento sulla cornice) */}
          <Glow id="fj-pg" x={340} y={915} r={300} t={t} color={P.accento} amp={0.06} rate={2} opacity={0.25 + slogan * 0.3} />
          <rect x="140" y="690" width="400" height="450" rx="8" fill={P.accento} stroke={K} strokeWidth="9" />
          <g clipPath="url(#fj-post)">
            <rect x="150" y="700" width="380" height="430" fill="url(#fj-sky)" />
            <rect x="150" y="700" width="380" height="430" fill="#EAF6FF" opacity={flash * 0.6} />
            <ellipse cx="260" cy="760" rx="140" ry="40" fill="#22385A" opacity=".8" />
            <ellipse cx="440" cy="740" rx="130" ry="44" fill="#22385A" opacity=".8" />
            <Lightning x={400} y={730} h={150} flash={Math.max(flash, 0.8 * seg(t, cues[3] + 0.15, cues[3] + 0.3))} seed={5} color="#FFF6B0" width={12} />
            {/* aereo in picchiata */}
            <g transform={`translate(${380 + flash * 6} ${900 + Math.sin(t * 2) * 6}) rotate(${22 + flash * 6})`}>
              <path d="M-110 0 Q-100 -16 60 -14 L100 -4 Q108 0 100 6 L60 14 Q-100 16 -110 0 Z" fill="#F4F1E6" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              <path d="M-10 -10 L-50 -70 H-26 L30 -10 Z M-10 10 L-40 60 H-18 L30 10 Z M-96 -6 L-120 -40 H-104 L-80 -8 Z" fill="#DCD6C4" stroke={K} strokeWidth="5" strokeLinejoin="round" />
              {[-60, -40, -20, 0, 20].map((x) => <circle key={x} cx={x} cy="-3" r="4" fill={P.principale} />)}
              <path d="M70 -6 Q90 -26 80 -44 M84 4 Q110 -6 116 -28" fill="none" stroke="#6C7A8A" strokeWidth="8" strokeLinecap="round" opacity=".7" />
            </g>
            {/* scritta */}
            <g transform={`translate(340 1078) scale(${0.6 + 0.4 * slogan})`} opacity={0.35 + 0.65 * slogan}>
              <rect x="-168" y="-52" width="336" height="92" rx="8" fill="#F4F1E6" stroke={K} strokeWidth="5" />
              <text y="-14" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="30" fill={K}>POTREBBE</text>
              <text y="24" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="30" fill={MARK}>SUCCEDERE A TE!</text>
            </g>
          </g>

          {/* piccolo manifesto delle Figi con palme che ondeggiano */}
          <rect x="590" y="700" width="160" height="180" rx="6" fill="url(#fj-fiji)" stroke={K} strokeWidth="6" />
          <path d="M594 846 Q670 826 746 846 V876 H594 Z" fill="#F4E2B0" />
          <circle cx="710" cy="740" r="18" fill="#FFE07A" />
          {[0, 1].map((i) => {
            const sw = Math.sin(t * 1.8 + i * 1.3) * 8;
            const bx = 630 + i * 60;
            return (
              <g key={i}>
                <path d={`M${bx} 850 Q${bx + 4} 800 ${bx + 10 + sw} 770`} fill="none" stroke="#8A6A44" strokeWidth="6" strokeLinecap="round" />
                {[-60, -20, 20, 60].map((a) => <path key={a} d={`M${bx + 10 + sw} 770 q${a * 0.5} ${-14 + Math.abs(a) * 0.2} ${a * 0.8} ${Math.abs(a) * 0.35}`} fill="none" stroke="#3E9C6A" strokeWidth="7" strokeLinecap="round" />)}
              </g>
            );
          })}
          <text x="670" y="868" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="22" fill={K}>FIGI</text>

          {/* mappamondo che gira con le Figi cerchiate */}
          <path d="M790 1030 V1125 M740 1140 H840" stroke="#8A6A44" strokeWidth="12" strokeLinecap="round" />
          <path d="M680 930 A110 110 0 0 1 900 930" fill="none" stroke="#8A6A44" strokeWidth="8" />
          <circle cx="790" cy="930" r="98" fill="url(#fj-globe)" stroke={K} strokeWidth="8" />
          <g clipPath="url(#fj-gl)">
            {Array.from({ length: 6 }, (_, i) => {
              const x = 692 + i * 60 - spin;
              return <ellipse key={i} cx={790} cy={930} rx={Math.abs(x - 790) * 1.0 + 2} ry="98" fill="none" stroke="#2E6F99" strokeWidth="3" opacity=".5" />;
            })}
            <path d="M692 900 H888 M700 960 H880" stroke="#2E6F99" strokeWidth="3" opacity=".5" />
            <path d={`M${720 - spin * 0.5} 880 q30 -20 60 0 q10 30 -20 40 q-30 0 -40 -40 Z`} fill="#9CD3A0" stroke={K} strokeWidth="4" />
            <path d="M800 960 q14 -8 22 2 q-6 12 -22 -2 Z" fill="#9CD3A0" stroke={K} strokeWidth="3" />
          </g>
          <path d="M748 880 Q790 860 832 880" fill="none" stroke="#FFFFFF" strokeWidth="5" opacity=".6" />
          {/* cerchio a pennarello sulle Figi */}
          <ellipse cx="812" cy="958" rx="34" ry="24" fill="none" stroke={MARK} strokeWidth="7" strokeLinecap="round"
            pathLength={1} strokeDasharray="1.1 1" strokeDashoffset={1.1 - circle * 1.1} transform="rotate(-12 812 958)" />

          {/* biglietti esauriti con timbro */}
          <g transform="translate(560 1080) rotate(-4)">
            {[2, 1, 0].map((i) => (
              <g key={i} transform={`translate(${i * 14} ${-i * 10})`}>
                <rect x="-70" y="-30" width="160" height="70" rx="6" fill="#F4F1E6" stroke={K} strokeWidth="5" />
                <path d="M40 -30 V40" stroke={K} strokeWidth="3" strokeDasharray="6 6" />
                <path d="M-56 -10 H20 M-56 6 H0" stroke="#9AA6AE" strokeWidth="5" />
              </g>
            ))}
            {stamp > 0 && (
              <g transform={`translate(20 0) rotate(-14) scale(${lerp(1.8, 1, Math.min(1, stamp))})`} opacity={Math.min(1, stamp * 1.5)}>
                <rect x="-92" y="-26" width="184" height="52" rx="6" fill="none" stroke={MARK} strokeWidth="6" />
                <text y="14" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="34" fill={MARK}>ESAURITO</text>
              </g>
            )}
          </g>
          {/* insegna al neon nella vetrina */}
          <Neon id="fj-neon" t={t} x={860} y={760} text="VOLI" color="#7FD3F4" font="Bricolage Grotesque" size={58} onAt={0.6} />
        </g>

        {/* PIANO 3 — vetro con riflessi, cornice e telecamera nascosta (0,8) */}
        <g transform={L(0.8)}>
          <g clipPath="url(#fj-win)">
            <rect x={lerp(-500, 1100, sheen)} y="560" width="420" height="800" fill="url(#fj-glass)" transform={`skewX(-20)`} />
            <path d="M200 1240 L420 660 M260 1240 L480 660" stroke="#FFFFFF" strokeWidth="10" opacity=".15" />
            <rect x="110" y="660" width="860" height="580" fill="#FFFFFF" opacity=".06" />
          </g>
          <rect x="100" y="650" width="880" height="600" fill="none" stroke={K} strokeWidth="14" />
          <rect x="112" y="662" width="856" height="576" fill="none" stroke="#F4F1E6" strokeWidth="4" opacity=".7" />
          {/* telecamera nascosta in alto a destra */}
          <rect x="920" y="672" width="40" height="26" rx="5" fill="#2A3A52" stroke={K} strokeWidth="4" />
          <circle cx="928" cy="685" r="7" fill="#0A1220" stroke="#5F86A6" strokeWidth="2" />
          <Glow id="fj-rec" x={952} y={680} r={20} t={t} color="#FF3B30" amp={0} opacity={rec * 0.9} />
          <circle cx="952" cy="680" r="4" fill="#FF3B30" opacity={0.3 + rec * 0.7} />
          {/* zoccolo sotto la vetrina */}
          <rect x="80" y="1250" width="920" height="70" fill="#4FA3D1" stroke={K} strokeWidth="8" />
          <path d="M80 1262 H1000" stroke="#9ED6F2" strokeWidth="4" />
        </g>

        {/* PIANO 4 — marciapiede, vaso con siepe e lampione in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <path d="M-200 1320 H1280 V2200 H-200 Z" fill="url(#fj-walk)" />
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${-100 + i * 300} 1320 L${-260 + i * 340} 2000`} stroke="#7E786A" strokeWidth="4" opacity=".6" />)}
          <path d="M-200 1480 H1280" stroke="#7E786A" strokeWidth="4" opacity=".5" />
          {/* vaso con cespuglio a sinistra */}
          <path d="M-80 1440 L-50 1720 H190 L220 1440 Z" fill="url(#fj-pot)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M-90 1440 H230" stroke={K} strokeWidth="14" />
          <circle cx="0" cy="1380" r="90" fill="#6FBF86" stroke={K} strokeWidth="8" />
          <circle cx="120" cy="1360" r="80" fill="#7FCB94" stroke={K} strokeWidth="8" />
          <circle cx="60" cy="1300" r="70" fill="#8FD6A0" stroke={K} strokeWidth="8" />
          <path d="M20 1270 q30 -16 60 0" fill="none" stroke="#C9F0D2" strokeWidth="5" />
          {/* lampione a destra che esce dal bordo */}
          <path d="M1010 2000 V1040" stroke={K} strokeWidth="34" />
          <path d="M1010 2000 V1040" stroke="#3C5670" strokeWidth="20" />
          <path d="M1000 1040 V1700" stroke="#7FA0BC" strokeWidth="4" />
          <path d="M970 1060 H1050 L1040 1010 H980 Z" fill="#3C5670" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <circle cx="1010" cy="1580" r="40" fill="none" stroke={K} strokeWidth="8" />
        </g>

        {/* PIANO 5 — foglie che volano e particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Flyers t={t} n={5} shape="leaf" color="#9CD3A0" outline={K} y0={1200} y1={1800} speed={0.1} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="fj-near" t={t} color="#FFF6DE" n={6} opacity={0.16} />
        </g>
      </g>

      <rect width="1080" height="1920" fill="#EAF6FF" opacity={flash * 0.08} />
      <Finish id="fj" tint="#8FD3F4" tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): neon ≈ 0,6 · cerchio sulle Figi ≈ 2,1–3,1 · timbro ESAURITO ≈ 4,1 · fulmini ≈ 6,2 e 6,8 · scritta ≈ 8,35.
