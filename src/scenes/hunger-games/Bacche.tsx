import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { ANTON, SANS } from '../../lib/fonts';
import { Fog, Glow, NearMotes, SunRays } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Berries, Cornucopia, Dome, HGDefs, K, Pine, PineRow, Sottobosco, WhiteRose } from './Comuni';

// Le bacche velenose: l'alba sulla radura dell'arena, la Cornucopia lontana. In primo piano su una pietra il sacchetto
// di cuoio e due mucchietti di bacche velenose (Katniss e Peeta, mai disegnati). Eventi: 1ª frase in cielo il «2»
// della regola viene barrato e diventa «1» (i registi la ritirano); 2ª frase i due mucchietti di bacche si illuminano
// di viola e si avvicinano (la scelta di mangiarle insieme); 3ª frase la cupola si accende di fuochi d'artificio e della
// scritta «VINCITORI», le bacche si spengono; 4ª frase in primo piano sale e si apre una rosa bianca, quella del
// presidente Snow, in una luce fredda (la sfida e la vendetta).
// Piani: cielo e cupola (0,2) · bosco lontano (0,4) · radura e Cornucopia (0,6) · pietra con le bacche (0,95)
//        · rosa bianca e felci in primo piano (1,2) · polline e particelle vicine (1,6)

const r = rng(1111);
const FIREWORKS = Array.from({ length: 6 }, (_, i) => ({ x: 220 + r() * 640, y: 800 + r() * 160, c: ['#F08A2A', '#FFE08A', '#F4F0E8'][i % 3], d: i * (60 / 90 / 2) }));

/** Fuoco d'artificio: raggiera di scintille che si apre e cade. */
const Fuoco: React.FC<{ x: number; y: number; c: string; p: number }> = ({ x, y, c, p }) => {
  if (p <= 0 || p >= 1) return null;
  const rad = 30 + 110 * eo(p);
  return (
    <g opacity={1 - p * p}>
      <circle cx={x} cy={y} r={rad * 0.6} fill={c} opacity={0.12 * (1 - p)} />
      {Array.from({ length: 14 }, (_, k) => {
        const a = (k / 14) * Math.PI * 2;
        const ex = x + Math.cos(a) * rad, ey = y + Math.sin(a) * rad + 40 * p * p;
        return <path key={k} d={`M${x + Math.cos(a) * rad * 0.6} ${y + Math.sin(a) * rad * 0.6 + 30 * p * p} L${ex} ${ey}`} stroke={c} strokeWidth="5" strokeLinecap="round" />;
      })}
    </g>
  );
};

export const Bacche: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const t0 = griglia(cues[0] + 0.5);
  const strike = eo(seg(t, t0, t0 + 0.4));
  const one = eob(seg(t, t0 + 0.5, t0 + 0.9), 1.5);
  const t1 = griglia(cues[1] + 1.4);
  const glow = eo(seg(t, t1, t1 + 0.6));
  const near = eo(seg(t, t1 + 0.4, t1 + 1.6));
  const t2 = griglia(cues[2] + 0.4);
  const win = eob(seg(t, t2, t2 + 0.5), 1.5);
  const t3 = griglia(cues[3] + 0.3);
  const rose = eo(seg(t, t3, t3 + 1.2));
  const cold = seg(t, t3, t3 + 1.0);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bc" />
        <HGDefs id="bc" />
        <Lin id="bc-sky" stops={[[0, '#1E2438'], [0.32, '#5A4A6A'], [0.5, '#E89A7A'], [0.6, '#F8D8A0']]} />
        <Lin id="bc-ground" stops={[[0, '#6A7040'], [0.4, '#3E4A26'], [1, '#141A0C']]} />
        <Lin id="bc-rock" stops={[[0, '#9A9890'], [0.5, '#6A6860'], [1, '#3A3832']]} />
        <Lin id="bc-pouch" x2={1} y2={0} stops={[[0, '#5A3418'], [0.5, '#9A6436'], [1, '#4A2810']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo dell'alba, cupola, la regola e i fuochi d'artificio (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#bc-sky)" />
          <SunRays id="bc-rays" x={540} y={1120} t={t} color="#FFE8B8" n={9} length={700} opacity={0.3} />
          <Glow id="bc-sun" x={540} y={1120} r={480} t={t} color="#FFE0A8" amp={0.03} rate={1} opacity={0.65} />
          <Dome y0={40} y1={1150} size={80} color="#FFF4E0" opacity={0.1} t={t} flash={0.25 * win * (1 - seg(t, t2 + 1, t2 + 2.5))} />
          {/* la regola proiettata sulla cupola: 2 barrato, poi 1 */}
          <g opacity={1 - win}>
            <Glow id="bc-rg" x={540} y={780} r={160} t={t} color="#9FE0FF" amp={0.08} rate={8} opacity={0.4} />
            <text x="480" y="850" textAnchor="middle" fontFamily={ANTON} fontSize="170" fill="#CFF0FF" stroke="#2A5A7A" strokeWidth="4" opacity={1 - 0.5 * one}>2</text>
            <path d={`M420 830 L${420 + 130 * strike} ${830 - 120 * strike}`} stroke="#E84A3A" strokeWidth="14" strokeLinecap="round" />
            <text x="620" y="850" textAnchor="middle" fontFamily={ANTON} fontSize={170 * one} fill="#FFFFFF" stroke="#2A5A7A" strokeWidth="4" opacity={one}>1</text>
          </g>
          {/* fuochi d'artificio e la scritta VINCITORI */}
          {FIREWORKS.map((f, i) => <Fuoco key={i} x={f.x} y={f.y} c={f.c} p={seg(t, t2 + f.d, t2 + f.d + 1.4)} />)}
          {FIREWORKS.slice(0, 3).map((f, i) => <Fuoco key={`b${i}`} x={1080 - f.x} y={f.y + 20} c={f.c} p={seg(t, t2 + 1.8 + f.d, t2 + 3.2 + f.d)} />)}
          <g opacity={win * (1 - 0.6 * cold)} transform={`translate(540 800) scale(${0.7 + 0.3 * win}) translate(-540 -800)`}>
            <Glow id="bc-wg" x={540} y={790} r={260} t={t} color="#FFC070" amp={0.06} rate={6} opacity={0.5} />
            <text x="540" y="830" textAnchor="middle" fontFamily={ANTON} fontSize="120" fill="#FFF4E0" stroke="#7A3A10" strokeWidth="5" letterSpacing="4">VINCITORI</text>
            <text x="540" y="878" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="36" letterSpacing="8" fill="#FFF4E0" stroke="#3A1A08" strokeWidth="6" paintOrder="stroke">DISTRETTO 12</text>
          </g>
        </g>
        {/* PIANO 1 — bosco lontano nella nebbia del mattino (0,4) */}
        <g transform={L(0.4)}>
          <PineRow y={1150} n={20} h0={170} h1={300} fill="#5A6058" seed={47} />
          <PineRow y={1180} n={18} h0={130} h1={230} fill="#3E4A3A" seed={53} />
          <Fog id="bc-f1" t={t} y={1160} rx={900} ry={70} color="#F8E0C0" opacity={0.55} speed={0.2} />
        </g>
        {/* PIANO 2 — la radura con la Cornucopia lontana (0,6) */}
        <g transform={L(0.6)}>
          <path d="M-200 1170 Q540 1150 1280 1170 V2200 H-200 Z" fill="url(#bc-ground)" />
          <Cornucopia id="bc" x={840} y={1175} s={0.34} t={t} load={0.6} pack={0} />
        </g>
        {/* PIANO 3 — la pietra con il sacchetto e i due mucchietti di bacche (0,95) */}
        <g transform={L(0.95)}>
          <path d="M140 1290 Q120 1190 260 1170 Q480 1140 700 1160 Q830 1180 820 1290 Z" fill="url(#bc-rock)" stroke={K} strokeWidth="9" />
          <path d="M170 1200 Q300 1170 480 1166" stroke="#D8D4C8" strokeWidth="5" fill="none" opacity=".7" />
          {/* sacchetto di cuoio aperto */}
          <g transform="translate(270 1190)">
            <path d="M-60 0 Q-70 -70 -30 -90 L30 -90 Q70 -70 60 0 Z" fill="url(#bc-pouch)" stroke={K} strokeWidth="7" />
            <path d="M-34 -88 Q0 -70 34 -88" stroke="#2A1A0C" strokeWidth="6" fill="none" />
            <path d="M-20 -88 Q-30 -120 -10 -130 M20 -88 Q34 -116 50 -110" stroke="#C8A070" strokeWidth="5" fill="none" />
          </g>
          {/* due mucchietti di bacche che si illuminano e si avvicinano */}
          <Glow id="bc-bg" x={540} y={1160} r={200} t={t} color="#C8A8FF" amp={0.1} rate={5} opacity={0.6 * glow * (1 - 0.7 * win)} />
          <Berries x={lerp(440, 500, near)} y={1180} s={0.95} n={9} seed={3} glow={glow * (1 - win)} />
          <Berries x={lerp(660, 590, near)} y={1180} s={0.95} n={9} seed={11} glow={glow * (1 - win)} />
          {/* foglie del rametto */}
          <path d="M720 1170 q30 -26 60 -20" stroke="#3A4A28" strokeWidth="5" fill="none" />
          <path d="M752 1156 q12 -26 34 -12 q-12 20 -34 12 Z" fill="#3A5A2A" stroke={K} strokeWidth="3" />
        </g>
        {/* PIANO 4 — la rosa bianca di Snow e le felci in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <Sottobosco id="bc" t={t} y0={1600} ground="#4A5226" fern="#6A7A34" stone="#A8A090" lit="#FFE0B0" seed={31} leaf="#A87A3A" />
          <Pine x={-80} y={1680} h={860} w={360} fill="#1E2A18" outline={K} lit="#A8A06A" seed={91} />
          <Glow id="bc-rg2" x={890} y={1120} r={260} t={t} color="#DCE8FF" amp={0.06} rate={3} opacity={0.6 * rose} />
          <g opacity={rose}>
            <WhiteRose x={880} y={1660 + 200 * (1 - rose)} s={1.6} rot={-6} bloom={rose} />
          </g>
        </g>
        {/* PIANO 5 — polline e particelle vicine (1,6) */}
        <g transform={L(1.6)}>
          <NearMotes id="bc-near" t={t} color="#FFF0D0" n={8} r0={50} r1={140} y0={900} y1={1900} opacity={0.12} />
        </g>
      </g>
      {/* la luce fredda della sfida */}
      <rect width="1080" height="1920" fill="#2A3A5A" opacity={0.22 * cold} />
      <Finish id="bc" tint="#1E3A2A" tintOpacity={0.1} />
    </svg>
  );
};
