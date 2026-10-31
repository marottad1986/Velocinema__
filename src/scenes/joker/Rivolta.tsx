import React from 'react';
import { camera, eio, eo, lerp, rng, seg } from '../../lib/anim';
import { Embers, Fire, Glow, NearMotes, Smoke } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { ANTON, SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { JokerDefs, K, Ombra, Palazzo } from './Comuni';

// Gotham brucia: la via davanti a un cinema, di notte, durante la rivolta. Palazzi con le finestre in fiamme e il cielo
// arancione di fumo, l'auto della polizia rovesciata in mezzo alla strada con i lampeggianti che girano, bidoni che
// bruciano, maschere da clown e il manifesto «WAYNE SINDACO» a terra, l'insegna del cinema con le lampadine.
// Eventi: prima frase la rivolta (tamburi), la vetrina a sinistra si incrina a 1,2 s (i vetri dello spartito); seconda
// frase davanti al cinema si spezza la collana di perle e le perle rotolano sul selciato (cue 1 + 1, glockenspiel e gong:
// i Wayne); terza frase il fuoco si spegne e la scena svanisce nel bianco freddo del manicomio, dove resta solo una
// maschera da clown che sorride (il dubbio: se si fosse immaginato tutto). Nessuna persona.
// Piani: cielo di fumo e palazzi in fiamme (0,25) · cinema e negozi (0,5) · strada e auto rovesciata (0,75)
//        · perle e maschere a terra (0,95) · transenne e bidone in primo piano (1,2) · braci e particelle (1,5–1,8)

const r = rng(1981);
const PEARLS = Array.from({ length: 16 }, (_, i) => ({ dx: (r() - 0.5) * 520, dy: r() * 70, d: 0.6 + r() * 0.8, s: 12 + r() * 4, i }));

export const Rivolta: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const crack = seg(t, 1.2, 1.3);
  const snap = cues[1] + 1;
  const roll = (p: (typeof PEARLS)[number]) => eo(seg(t, snap, snap + p.d));
  const white = eio(seg(t, cues[2] + 0.4, cues[2] + 2.6));
  const fireK = 1 - eo(seg(t, cues[2], cues[2] + 1.2));
  const spin = t * 6;
  const red = Math.max(0, Math.cos(spin)), blue = Math.max(0, Math.cos(spin + Math.PI));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="rv" />
        <JokerDefs id="rv" />
        <Lin id="rv-sky" stops={[[0, '#0A0608'], [0.35, '#2A1410'], [0.6, '#6A2A14'], [0.8, '#A84A1E']]} />
        <Lin id="rv-road" stops={[[0, '#2A2420'], [1, '#0E0A08']]} />
        <Lin id="rv-car" stops={[[0, '#E8E8E0'], [0.5, '#B8B8B0'], [1, '#6A6A64']]} />
        <Lin id="rv-cinema" x2={1} y2={0} stops={[[0, '#3A1418'], [0.5, '#5A2228'], [1, '#2A0E12']]} />
        <Lin id="rv-white" stops={[[0, '#7A8A86'], [0.5, '#A8B6B2'], [1, '#8A9894']]} />
        <radialGradient id="rv-pearl" cx=".35" cy=".35"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".6" stopColor="#E8E4DA" /><stop offset="1" stopColor="#A8A498" /></radialGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo di fumo arancione, palazzi con le finestre in fiamme (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#rv-sky)" />
          <Smoke id="rv-sm1" t={t} x={200} y={820} color="#3A2420" n={10} rise={600} wind={300} r0={60} r1={240} speed={0.1} opacity={0.8} />
          <Smoke id="rv-sm2" t={t + 3} x={860} y={800} color="#2A1A18" n={10} rise={600} wind={-260} r0={60} r1={220} speed={0.11} opacity={0.8} />
          <Palazzo id="rv" x={-200} y={1060} w={360} h={430} t={t} lit={0.55} seed={4} dark />
          <Palazzo id="rv" x={900} y={1060} w={380} h={460} t={t} lit={0.5} seed={9} dark />
          {[[-60, 700], [1000, 720]].map(([x, y], i) => <Fire key={i} id={`rv-wf${i}`} t={t + i} x={x} y={y} scale={0.7 * fireK} outer="#C83A14" mid="#F28A2A" core="#FFE08A" outline={K} />)}
        </g>

        {/* PIANO 1 — il cinema con l'insegna a lampadine, il negozio con la vetrina che si incrina (0,5) */}
        <g transform={L(0.5)}>
          <rect x="560" y="700" width="460" height="400" fill="url(#rv-cinema)" stroke={K} strokeWidth="8" />
          <path d="M520 700 H1060 L1020 820 H560 Z" fill="#1A0E10" stroke={K} strokeWidth="8" />
          <text x="790" y="784" textAnchor="middle" fontFamily={ANTON} fontSize="62" fill="#F2D890" letterSpacing="6">CINEMA</text>
          {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={540 + i * 30} cy={712} r="7" fill="#FFF0B0" opacity={Math.sin(t * 7 + i) > 0 ? 1 : 0.3} />)}
          <Glow id="rv-mq" x={790} y={760} r={340} t={t} color="#F2D890" amp={0.05} rate={4} opacity={0.4} />
          {[620, 830].map((x) => <rect key={x} x={x} y="860" width="150" height="240" fill="#14080A" stroke={K} strokeWidth="6" />)}
          <rect x="650" y="880" width="90" height="120" fill="#E8DCC0" stroke={K} strokeWidth="4" />
          <text x="695" y="944" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="20" fill={K}>STASERA</text>
          {/* negozio a sinistra con la vetrina */}
          <rect x="60" y="760" width="460" height="340" fill="#2A2420" stroke={K} strokeWidth="8" />
          <rect x="90" y="800" width="400" height="260" fill="#3A2A20" stroke={K} strokeWidth="6" />
          <Glow id="rv-shop" x={290} y={930} r={260} t={t} color="#F28A2A" amp={0.1} rate={8} opacity={0.5 * fireK} />
          <g opacity={crack}>
            <path d="M300 930 L220 830 M300 930 L410 840 M300 930 L190 1010 M300 930 L440 1040 M300 930 L300 800 M250 870 L330 860 M360 980 L260 990" stroke="#F2EEE4" strokeWidth="5" fill="none" />
          </g>
          <path d="M60 760 H520" stroke="#6A5A4A" strokeWidth="5" />
          <text x="290" y="790" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="26" fill="#C8B898">GIOIELLERIA</text>
        </g>

        {/* PIANO 2 — la strada, l'auto della polizia rovesciata con i lampeggianti (0,75) */}
        <g transform={L(0.75)}>
          <path d="M-200 1100 H1280 V2200 H-200 Z" fill="url(#rv-road)" />
          <path d="M-200 1102 H1280" stroke="#6A5A4A" strokeWidth="6" />
          <ellipse cx="540" cy="1150" rx="560" ry="70" fill="#F28A2A" opacity={0.18 * fireK} />
          {/* auto rovesciata: le ruote verso il cielo */}
          <g transform="translate(470 1120) rotate(-8) scale(1.3)">
            <Ombra id="rv" x={0} y={20} rx={300} ry={26} />
            <path d="M-250 0 V-70 Q-246 -96 -210 -100 H210 Q246 -96 250 -70 V0 Z" fill="url(#rv-car)" stroke={K} strokeWidth="9" />
            <path d="M-170 0 L-120 70 H120 L170 0 Z" fill="#1A1C20" stroke={K} strokeWidth="8" />
            <path d="M-110 6 L-80 56 H80 L110 6 Z" fill="#2A3A4A" stroke={K} strokeWidth="5" />
            <path d="M-250 -50 H250" stroke="#1A2A5A" strokeWidth="26" />
            <text x="0" y="-42" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="30" fill="#E8E8E0">POLIZIA</text>
            {[-150, 150].map((x) => <g key={x}><circle cx={x} cy={-112} r="44" fill="#1A1A1C" stroke={K} strokeWidth="7" /><circle cx={x} cy={-112} r="16" fill="#9AA2AA" /></g>)}
            {/* lampeggianti sul tetto, ora sotto */}
            <rect x="-60" y="70" width="50" height="26" rx="6" fill="#E83A3A" stroke={K} strokeWidth="4" opacity={0.4 + 0.6 * red} />
            <rect x="10" y="70" width="50" height="26" rx="6" fill="#3A7AE8" stroke={K} strokeWidth="4" opacity={0.4 + 0.6 * blue} />
            <Glow id="rv-red" x={-35} y={84} r={380} t={t} color="#E83A3A" amp={0} opacity={0.32 * red * fireK} />
            <Glow id="rv-blue" x={35} y={84} r={380} t={t} color="#3A7AE8" amp={0} opacity={0.32 * blue * fireK} />
            <Fire id="rv-car-f" t={t} x={180} y={-60} scale={0.8 * fireK} outer="#C83A14" mid="#F28A2A" core="#FFE08A" outline={K} />
          </g>
        </g>

        {/* PIANO 3 — perle che si spargono, maschere e manifesto a terra (0,95) */}
        <g transform={L(0.95)}>
          {/* il manifesto WAYNE SINDACO calpestato */}
          <g transform="translate(180 1215) rotate(-10)">
            <rect x="-120" y="-40" width="240" height="80" fill="#E8E0CC" stroke={K} strokeWidth="5" />
            <rect x="-120" y="-40" width="240" height="30" fill="#2A3A6A" />
            <text x="0" y="-17" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="22" fill="#F2EEE4">WAYNE</text>
            <text x="0" y="24" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="26" fill="#2A3A6A">SINDACO</text>
            <path d="M-30 -40 Q0 -10 30 -40 Q20 10 -10 40" fill="#3A2E24" opacity=".5" />
          </g>
          {/* collana: intera fino allo strappo, poi le perle rotolano */}
          {t < snap ? (
            <path d="M760 1100 Q860 1170 960 1100" stroke="#F4F2EA" strokeWidth="26" strokeDasharray="0.1 30" strokeLinecap="round" fill="none" />
          ) : (
            PEARLS.map((p) => {
              const k = roll(p);
              return <circle key={p.i} cx={860 + p.dx * k} cy={1130 + p.dy * k + Math.abs(Math.sin(k * 9)) * -14 * (1 - k)} r={p.s} fill="url(#rv-pearl)" stroke={K} strokeWidth="2" />;
            })
          )}
          <Glow id="rv-pg" x={860} y={1130} r={220} t={t} color="#FFFFFF" amp={0.1} rate={5} opacity={0.6 * seg(t, snap, snap + 0.2) * (1 - 0.5 * seg(t, snap + 0.6, snap + 1.6))} />
          {/* maschere da clown a terra */}
          {[[400, 1240, -18], [640, 1252, 26]].map(([x, y, a], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a}) scale(0.7 0.55)`}>
              <ellipse rx="56" ry="68" fill="#F2EEE4" stroke={K} strokeWidth="6" />
              <ellipse cx="-20" cy="-10" rx="11" ry="8" fill={K} /><ellipse cx="20" cy="-10" rx="11" ry="8" fill={K} />
              <circle cy="14" r="12" fill={P.accento} />
              <path d="M-28 34 Q0 56 28 34" stroke={P.accento} strokeWidth="7" fill="none" />
            </g>
          ))}
        </g>

        {/* PIANO 4 — transenne a strisce e bidone che brucia in primo piano (1,2) */}
        <g transform={L(1.2)}>
          {[[-60, 1560, -6], [860, 1600, 8]].map(([x, y, a], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
              <rect x="-200" y="-40" width="420" height="80" fill="#F2EEE4" stroke={K} strokeWidth="9" />
              {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M${-180 + k * 70} -40 l40 80`} stroke={P.accento} strokeWidth="28" />)}
              <rect x="-200" y="-40" width="420" height="80" fill="none" stroke={K} strokeWidth="9" />
              <path d="M-160 40 L-200 600 M180 40 L220 600" stroke={K} strokeWidth="18" />
            </g>
          ))}
          <g transform="translate(560 1720)">
            <rect x="-110" y="-160" width="220" height="400" rx="14" fill="#3A3E3A" stroke={K} strokeWidth="9" />
            <path d="M-110 -100 H110 M-110 20 H110" stroke="#2A2E2A" strokeWidth="10" />
            <path d="M-100 -150 H100" stroke="#8A9288" strokeWidth="5" opacity=".6" />
            <Fire id="rv-bar" t={t} x={0} y={-160} scale={1.1 * fireK} outer="#C83A14" mid="#F28A2A" core="#FFE08A" outline={K} />
          </g>
        </g>

        {/* PIANO 5 — braci e particelle (1,5–1,8) */}
        <g transform={L(1.5)} opacity={fireK}>
          <Embers t={t} x={540} y={1500} w={1000} h={900} seed={6} n={26} hot="#FFE08A" warm="#F28A2A" drift={80} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="rv-near" t={t} color="#F2B860" n={6} opacity={0.09 * fireK} />
        </g>

        {/* il bianco del manicomio: tutto svanisce, resta solo la maschera che sorride */}
        <rect x="-200" y="-200" width="1480" height="2400" fill="url(#rv-white)" opacity={0.94 * white} />
        <g opacity={white}>
          <g transform={L(0.5)}>
            {[-80, 1120].map((x) => <rect key={x} x={x} y="-200" width="40" height="2400" fill="#6A7874" />)}
            <rect x="160" y="1100" width="760" height="10" fill="#6A7874" />
          </g>
          <g transform={`${L(0.95)} translate(540 ${lerp(1240, 960, white)}) scale(${lerp(0.7, 1.5, white)})`}>
            <ellipse rx="56" ry="68" fill="#F8F8F4" stroke={K} strokeWidth="6" />
            <path d="M-40 -40 q10 -14 24 -6 M40 -40 q-10 -14 -24 -6" stroke="#2A5A9A" strokeWidth="5" fill="none" />
            <ellipse cx="-20" cy="-10" rx="11" ry="8" fill={K} /><ellipse cx="20" cy="-10" rx="11" ry="8" fill={K} />
            <circle cy="14" r="12" fill={P.accento} stroke={K} strokeWidth="3" />
            <path d="M-32 32 Q0 64 32 32 Q0 48 -32 32 Z" fill={P.accento} stroke={K} strokeWidth="3" />
          </g>
        </g>
      </g>
      <Finish id="rv" tint="#2A1A14" tintOpacity={0.12 * (1 - white)} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): vetrina 1,2 · perle cue1 + 1 · fuoco che si spegne cue2 → + 1,2 · bianco cue2 + 0,4 → + 2,6.
