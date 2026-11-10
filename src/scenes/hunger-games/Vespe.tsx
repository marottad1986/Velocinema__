import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Embers, Fire, Fireflies, Fog, Glow, Moon, NearMotes, Stars } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Backpack, Bow, Dome, EMBER, HGDefs, K, Pine, PineRow } from './Comuni';

// Il nido di vespe: notte nel bosco dell'arena. A sinistra il tronco altissimo dove si è rifugiata Katniss (mai
// disegnata); da un ramo pende un grosso nido di vespe di carta grigia; sotto, a destra, il campo dei Favoriti con il
// fuoco, le lance piantate, i sacchi a pelo e un arco appoggiato. Eventi: 1ª frase il fuoco del campo divampa e le lance
// si stagliano (i Favoriti che la inseguono); 2ª frase su un albero vicino brilla la piccola fionda di Rue, poi il ramo
// si spezza, il nido precipita sul campo e lo sciame esplode tra le scintille.
// Piani: cielo, luna e cupola (0,2) · bosco lontano (0,4) · campo dei Favoriti (0,65) · tronco con il ramo e il nido (0,9)
//        · rami in primo piano (1,25) · lucciole e particelle vicine (1,6)

const r = rng(6262);
const WASPS = Array.from({ length: 46 }, () => ({ a: r() * 6.28, rr: 30 + r() * 220, sp: 2 + r() * 4, ph: r() * 6, h: r() }));

/** Nido di vespe: bozzolo di carta grigia a strati, con l'ingresso scuro. Origine al punto in cui è appeso. */
const Nido: React.FC<{ x: number; y: number; rot?: number; s?: number; crack?: number }> = ({ x, y, rot = 0, s = 1, crack = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round">
    <path d="M0 0 V24" stroke={K} strokeWidth="10" />
    <path d="M-10 20 Q-110 60 -96 160 Q-80 250 0 266 Q80 250 96 160 Q110 60 10 20 Z" fill="#9A9488" stroke={K} strokeWidth="9" />
    {[60, 100, 140, 180, 220].map((yy, k) => (
      <path key={k} d={`M${-90 + k * 4} ${yy} Q0 ${yy + 22} ${90 - k * 4} ${yy}`} stroke="#6A6458" strokeWidth="6" fill="none" />
    ))}
    <path d="M-70 70 Q-84 140 -60 210" stroke="#D8D2C4" strokeWidth="7" fill="none" opacity=".6" />
    <ellipse cx="10" cy="236" rx="22" ry="14" fill="#1A1610" stroke={K} strokeWidth="5" />
    {crack > 0 && <path d={`M-40 40 l20 30 l-14 24 l26 30`} stroke={K} strokeWidth="5" fill="none" opacity={crack} />}
  </g>
);

export const Vespe: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const roar = eo(seg(t, griglia(cues[0] + 0.6), griglia(cues[0] + 0.6) + 0.6));
  const ts = griglia(cues[1] + 0.8);
  const sling = eo(seg(t, ts, ts + 0.4)) * (1 - seg(t, ts + 2.4, ts + 3));
  const tc = griglia(cues[1] + 2.2);
  const crack = seg(t, tc - 0.4, tc);
  const fall = seg(t, tc, tc + 0.55);
  const fy = lerp(0, 380, fall * fall);
  const hit = seg(t, tc + 0.55, tc + 0.7);
  const swarm = eo(seg(t, tc + 0.55, tc + 1.6));
  const shake = hit > 0 && hit < 1 ? Math.sin(t * 60) * 6 * (1 - hit) : 0;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ve" />
        <HGDefs id="ve" />
        <Lin id="ve-sky" stops={[[0, '#04070A'], [0.35, '#0C1A1E'], [0.55, '#183028'], [0.62, '#24382C']]} />
        <Lin id="ve-ground" stops={[[0, '#22301E'], [0.4, '#141E12'], [1, '#060806']]} />
        <Lin id="ve-bark" x2={1} y2={0} stops={[[0, '#1A120C'], [0.35, '#4A3420'], [0.6, '#5A4028'], [1, '#140E08']]} />
      </defs>
      <g transform={`${cam.transform} translate(0 ${shake})`}>
        {/* PIANO 0 — cielo notturno, luna e cupola (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ve-sky)" />
          <Stars t={t} seed={3} n={40} y={60} h={700} color="#DDEFEA" size={0.8} />
          <Moon id="ve-moon" x={860} y={690} r={50} t={t} color="#E8F0E8" halo="#C8E0D8" />
          <Dome y0={40} y1={1100} size={80} color="#9FE0E0" opacity={0.08} t={t} />
        </g>
        {/* PIANO 1 — bosco lontano (0,4) */}
        <g transform={L(0.4)}>
          <PineRow y={1120} n={18} h0={200} h1={340} fill="#0E1A14" seed={21} />
          <Fog id="ve-f1" t={t} y={1110} rx={900} ry={60} color="#3A5A4A" opacity={0.4} speed={0.2} />
          {/* l'albero di Rue, sulla destra, con la piccola fionda appesa */}
          <Pine x={1000} y={1200} h={620} w={300} fill="#0A140E" outline={K} lit="#2A4A3A" seed={77} />
          <g transform="translate(930 800) scale(1.5)">
            <Glow id="ve-sl" x={0} y={20} r={110} t={t} color="#FFE0A0" amp={0.1} rate={6} opacity={0.75 * sling} />
            <path d="M0 -30 V0" stroke="#3A2A1A" strokeWidth="4" />
            <path d="M-16 40 L0 0 L16 40 M0 40 V80" stroke="#7A5430" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M-16 40 Q0 64 16 40" stroke="#D8C8A8" strokeWidth="3" fill="none" />
          </g>
        </g>
        {/* PIANO 2 — il campo dei Favoriti con il fuoco (0,65) */}
        <g transform={L(0.65)}>
          <path d="M-200 1170 Q540 1150 1280 1170 V2200 H-200 Z" fill="url(#ve-ground)" />
          <Glow id="ve-cg" x={720} y={1150} r={360 + 80 * roar} t={t} color="#FF9A50" amp={0.1} rate={6} opacity={0.35 + 0.3 * roar} />
          {/* lance piantate e appoggiate */}
          {[[560, -14], [600, 6], [880, 12], [920, -8]].map(([sx, a], i) => (
            <g key={i} transform={`translate(${sx} 1230) rotate(${a})`}>
              <path d="M0 0 V-260" stroke={K} strokeWidth="12" strokeLinecap="round" />
              <path d="M0 0 V-260" stroke="#8A6440" strokeWidth="6" />
              <path d="M0 -258 l-14 -10 l14 -44 l14 44 Z" fill="#C8D0D4" stroke={K} strokeWidth="4" />
              <path d="M2 -300 l6 26" stroke="#FFFFFF" strokeWidth="3" opacity={0.5 + 0.4 * roar} />
            </g>
          ))}
          {/* sacchi a pelo e zaini */}
          {[[640, 1260, '#4A3A5A'], [820, 1270, '#3A4A5A']].map(([x, y, c], i) => (
            <g key={i}><rect x={Number(x) - 80} y={Number(y) - 26} width="160" height="44" rx="22" fill={String(c)} stroke={K} strokeWidth="6" /><path d={`M${Number(x) - 60} ${Number(y) - 4} H${Number(x) + 60}`} stroke="#000" strokeWidth="4" opacity=".3" /></g>
          ))}
          <Backpack x={500} y={1260} s={0.55} color="#3A4A3A" />
          {/* l'arco appoggiato a un tronco caduto */}
          <path d="M920 1250 H1100" stroke={K} strokeWidth="44" strokeLinecap="round" />
          <path d="M920 1250 H1100" stroke="#4A3420" strokeWidth="32" strokeLinecap="round" />
          <Bow id="ve" x={980} y={1170} s={0.42} rot={-60} />
          {/* il fuoco */}
          <path d="M680 1240 l80 -18 M690 1222 l70 22" stroke="#3A2414" strokeWidth="14" strokeLinecap="round" />
          <Fire id="ve-fire" t={t} x={720} y={1232} scale={0.5 + 0.18 * roar} outline={K} />
          <Embers t={t} x={720} y={1180} w={80} h={260 + 200 * hit} n={18 + Math.round(20 * hit)} seed={9} />
          {/* lo sciame di vespe che esplode sul campo */}
          {swarm > 0 && WASPS.map((w, i) => {
            const a = w.a + t * w.sp * (i % 2 ? 1 : -1);
            const rad = w.rr * swarm;
            const wx = 720 + Math.cos(a) * rad, wy = 1150 + Math.sin(a) * rad * 0.5 - w.h * 120 * swarm;
            return (
              <g key={i} transform={`translate(${wx} ${wy}) rotate(${(a * 180) / Math.PI})`}>
                <ellipse cx="0" cy="0" rx="9" ry="5" fill="#E8B830" stroke={K} strokeWidth="2.5" />
                <path d="M-2 -5 V5 M3 -4 V4" stroke={K} strokeWidth="2.5" />
                <ellipse cx="0" cy="-7" rx="6" ry="4" fill="#E8F4FF" opacity={0.5 + 0.5 * Math.sin(t * 50 + i)} />
              </g>
            );
          })}
        </g>
        {/* PIANO 3 — il tronco altissimo, il ramo e il nido (0,9) */}
        <g transform={L(0.9)}>
          <path d="M-60 2100 Q-30 1400 -10 900 Q0 600 20 -200 H150 Q150 600 140 900 Q120 1400 160 2100 Z" fill="url(#ve-bark)" stroke={K} strokeWidth="10" />
          {Array.from({ length: 14 }, (_, k) => <path key={k} d={`M${10 + (k % 3) * 30} ${-100 + k * 150} q14 40 -4 90`} stroke="#120C06" strokeWidth="6" fill="none" />)}
          <path d="M120 -200 Q120 600 116 1400" stroke="#8A6A44" strokeWidth="5" fill="none" opacity=".5" />
          {/* il ramo verso destra con il punto segato */}
          <path d="M120 730 Q400 690 640 700 Q700 704 760 690" stroke={K} strokeWidth="34" fill="none" strokeLinecap="round" />
          <path d="M120 730 Q400 690 640 700 Q700 704 760 690" stroke="#4A3420" strokeWidth="22" fill="none" strokeLinecap="round" />
          <path d="M130 722 Q400 682 640 692" stroke="#8A6A44" strokeWidth="5" fill="none" opacity=".6" />
          <path d="M600 680 l-6 34" stroke={EMBER} strokeWidth="6" opacity={crack} />
          {/* il nido appeso, che precipita */}
          <Nido x={700} y={704 + fy} rot={fall * 30} s={0.85} crack={crack} />
          {/* aghi di pino sul ramo */}
          {Array.from({ length: 7 }, (_, k) => <path key={k} d={`M${360 + k * 50} ${712 - k * 2} l-20 -36 m20 36 l18 -38`} stroke="#1E3A24" strokeWidth="6" strokeLinecap="round" />)}
        </g>
        {/* PIANO 4 — rami di pino che incorniciano in basso (1,25) */}
        <g transform={L(1.25)}>
          <path d="M-200 1560 Q300 1500 640 1560 Q900 1520 1280 1580 V2200 H-200 Z" fill="#050806" stroke={K} strokeWidth="8" />
          {Array.from({ length: 12 }, (_, k) => <path key={k} d={`M${-100 + k * 110} 1560 l-30 -60 m30 60 l20 -70 m-20 70 l50 -50`} stroke="#0E1A10" strokeWidth="8" strokeLinecap="round" />)}
        </g>
        {/* PIANO 5 — lucciole e particelle vicine (1,6) */}
        <g transform={L(1.6)}>
          <Fireflies id="ve-ff" t={t} n={10} x={0} y={900} w={1080} h={500} color="#E8F08A" />
          <NearMotes id="ve-near" t={t} color="#FFB060" n={5} r0={50} r1={130} y0={1100} opacity={0.08} />
        </g>
      </g>
      <Finish id="ve" tint="#0F1A12" tintOpacity={0.12} />
    </svg>
  );
};

