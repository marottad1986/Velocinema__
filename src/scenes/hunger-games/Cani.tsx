import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Fog, Glow, Moon, NearMotes, Stars, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Berries, Cornucopia, Dome, HGDefs, K, PineRow } from './Comuni';

// I cani mostruosi: notte nella radura, la Cornucopia alla luce della luna. In primo piano, su una pietra, un fazzoletto
// con le bacche velenose. Eventi: 1ª frase le bacche luccicano e un colpo di cannone illumina il bosco (la rivale che
// le ha mangiate muore); 2ª frase nel buio si accendono uno dopo l'altro gli occhi rossi e i cani enormi escono dagli
// alberi verso il corno; 3ª frase dalla cima del corno cade una spada che rimbalza sul metallo (Cato fatto cadere tra
// i cani), i cani si stringono sotto.
// Piani: cielo, luna e cupola (0,2) · bosco (0,4) · radura, corno e cani (0,65) · pietra con le bacche (1,0)
//        · erba in primo piano (1,25) · nebbia e particelle vicine (1,6)

const r = rng(1010);
const DOGS = [
  { x: 90, y: 1170, s: 0.62, f: false, d: 0.0 },
  { x: 980, y: 1160, s: 0.6, f: true, d: 0.25 },
  { x: 330, y: 1200, s: 0.7, f: false, d: 0.5 },
  { x: 780, y: 1150, s: 0.66, f: true, d: 0.7 },
];
const EYES = Array.from({ length: 7 }, () => ({ x: r() * 1000 + 40, y: 1080 + r() * 60, d: r() }));

/** Cane enorme e generico, di profilo verso destra (f = verso sinistra), schiena irta, occhi rossi. Origine alle zampe. */
const Cane: React.FC<{ x: number; y: number; s: number; f: boolean; t: number; ph: number }> = ({ x, y, s, f, t, ph }) => {
  const g = t * 6 + ph;
  const breathe = Math.sin(g * 0.5) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${f ? -s : s} ${s})`} strokeLinejoin="round" strokeLinecap="round">
      {[[-80, 0], [-50, Math.PI], [70, Math.PI], [100, 0]].map(([lx, a], i) => (
        <path key={i} d={`M${lx} -70 L${lx + Math.sin(g + a) * 10} -30 L${lx + Math.sin(g + a) * 14 + 6} 0`} stroke="#050506" strokeWidth="22" fill="none" />
      ))}
      <path d={`M-130 -80 Q-150 -130 -110 -150 L-60 ${-170 + breathe} Q0 -190 70 -170 L120 -150 Q150 -160 170 -150 L210 -130 L220 -110 L180 -100 L150 -96 Q120 -60 80 -60 L-90 -56 Q-140 -50 -130 -80 Z`} fill="#0A0A0C" stroke={K} strokeWidth="8" />
      {/* pelo irto sulla schiena */}
      {Array.from({ length: 9 }, (_, k) => <path key={k} d={`M${-100 + k * 22} ${-166 + Math.abs(k - 4) * 2} l8 -22 l8 20`} fill="#0A0A0C" stroke={K} strokeWidth="4" />)}
      {/* orecchie, coda */}
      <path d="M140 -152 l10 -40 l16 34 Z" fill="#0A0A0C" stroke={K} strokeWidth="5" />
      <path d={`M-128 -110 Q-180 ${-150 + Math.sin(g) * 8} -200 -110`} stroke="#0A0A0C" strokeWidth="16" fill="none" />
      {/* riflesso della luna sul dorso */}
      <path d={`M-128 -96 Q-146 -132 -110 -150 L-60 ${-170 + breathe} Q0 -190 70 -170 L120 -150 Q150 -160 170 -150 L210 -130`} stroke="#9AB0C8" strokeWidth="7" fill="none" opacity=".75" />
      {/* zanne e occhio rosso */}
      <path d="M190 -104 l6 12 l6 -12 M206 -110 l5 10 l5 -11" stroke="#E8E4D8" strokeWidth="3" fill="#E8E4D8" />
      <circle cx="170" cy="-136" r="7" fill="#FF3A2A" />
    </g>
  );
};

export const Cani: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1000);
  const L = cam.layer;
  const tb = griglia(cues[0] + 0.8);
  const glint = seg(t, tb, tb + 0.3) * (1 - seg(t, tb + 1.4, tb + 2));
  const tc = griglia(cues[0] + 2.6);
  const cannon = flashAt(t, [tc], [0.85]);
  const te = griglia(cues[1] + 0.3);
  const eyes = (d: number) => eo(seg(t, te + d * 1.6, te + d * 1.6 + 0.3));
  const dogs = (d: number) => eo(seg(t, te + 1.0 + d * 1.4, te + 1.0 + d * 1.4 + 1.2));
  const ts = griglia(cues[2] + 1.6);
  const fall = seg(t, ts, ts + 0.5);
  const bounce = seg(t, ts + 0.5, ts + 0.9);
  const sx = lerp(560, 520, fall) - 50 * bounce;
  const sy = lerp(660, 1150, fall * fall) - Math.sin(bounce * Math.PI) * 60;
  const close = eo(seg(t, ts + 0.5, ts + 1.6));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ca" />
        <HGDefs id="ca" />
        <Lin id="ca-sky" stops={[[0, '#03050A'], [0.35, '#0A1420'], [0.55, '#14242C'], [0.62, '#1A2A2E']]} />
        <Lin id="ca-ground" stops={[[0, '#1E2A22'], [0.4, '#121A14'], [1, '#050705']]} />
        <Lin id="ca-cloth" stops={[[0, '#E8E0D0'], [1, '#A89A88']]} />
        <Lin id="ca-rock" stops={[[0, '#5A6068'], [1, '#2A2E34']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno, luna e cupola (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ca-sky)" />
          <Stars t={t} seed={23} n={40} y={60} h={700} color="#DDEFEA" size={0.8} />
          <Moon id="ca-moon" x={880} y={720} r={56} t={t} color="#E8F0F2" halo="#B8D0E0" />
          <Dome y0={40} y1={1100} size={80} color="#9FD0E0" opacity={0.08} t={t} />
        </g>
        {/* PIANO 1 — il bosco, il lampo del cannone, gli occhi nel buio (0,4) */}
        <g transform={L(0.4)}>
          <Glow id="ca-cn" x={180} y={1050} r={300} t={t} color="#FFF0D0" amp={0} opacity={cannon} />
          <PineRow y={1120} n={20} h0={200} h1={340} fill="#060C0A" seed={29} />
          {EYES.map((e, i) => (
            <g key={i} opacity={eyes(e.d) * (1 - dogs(e.d) * 0.7)}>
              <Glow id={`ca-e${i}`} x={e.x} y={e.y} r={30} t={t + i} color="#FF3A2A" amp={0.2} rate={5} opacity={0.6} />
              <circle cx={e.x - 9} cy={e.y} r="5" fill="#FF4A3A" />
              <circle cx={e.x + 9} cy={e.y} r="5" fill="#FF4A3A" />
            </g>
          ))}
          <Fog id="ca-f1" t={t} y={1120} rx={900} ry={60} color="#3A4A50" opacity={0.45} speed={0.2} />
        </g>
        {/* PIANO 2 — la radura, la Cornucopia, i cani (0,65) */}
        <g transform={L(0.65)}>
          <path d="M-200 1140 Q540 1120 1280 1140 V2200 H-200 Z" fill="url(#ca-ground)" />
          <ellipse cx="460" cy="1180" rx="520" ry="90" fill="#8AA0B0" opacity=".08" />
          <Glow id="ca-hg" x={430} y={940} r={380} t={t} color="#C8D8E0" amp={0.03} rate={1} opacity={0.25} />
          <Cornucopia id="ca" x={150} y={1150} s={0.9} t={t} night load={0.8} pack={0} />
          {/* la spada che cade dalla cima del corno e rimbalza */}
          {fall > 0 && (
            <g transform={`translate(${sx} ${sy}) rotate(${lerp(-30, 250, fall) + 40 * bounce})`}>
              <path d="M0 0 H-150" stroke={K} strokeWidth="14" strokeLinecap="round" />
              <path d="M0 0 H-150" stroke="#C8D0D8" strokeWidth="8" strokeLinecap="round" />
              <path d="M-140 0 l-14 -6 l-4 6 l4 6 Z" fill="#E8F0F4" stroke={K} strokeWidth="3" />
              <path d="M10 -22 V22" stroke={K} strokeWidth="12" strokeLinecap="round" />
              <path d="M10 -22 V22" stroke="#C8A050" strokeWidth="6" strokeLinecap="round" />
              <path d="M10 0 H44" stroke="#3A2A1A" strokeWidth="12" strokeLinecap="round" />
            </g>
          )}
          {fall >= 1 && bounce < 1 && (
            <g opacity={1 - bounce}>
              {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M520 1150 l${Math.cos(k) * 40 * (0.5 + bounce)} ${-Math.abs(Math.sin(k)) * 40 * (0.5 + bounce)}`} stroke="#FFF0C0" strokeWidth="4" strokeLinecap="round" />)}
            </g>
          )}
          {/* i cani che escono dagli alberi e si stringono sotto il corno */}
          {DOGS.map((d, i) => {
            const a = dogs(d.d);
            const tx = lerp(d.f ? 1260 : -180, d.x, a) + (d.f ? -1 : 1) * 60 * close;
            return <g key={i} opacity={a}><Cane x={tx} y={d.y} s={d.s} f={d.f} t={t} ph={i * 1.3} /></g>;
          })}
        </g>
        {/* PIANO 3 — la pietra con il fazzoletto e le bacche (1,0) */}
        <g transform={L(1.0)}>
          <path d="M700 1270 Q690 1190 790 1176 Q920 1166 990 1210 Q1020 1250 1000 1272 Z" fill="url(#ca-rock)" stroke={K} strokeWidth="8" />
          <path d="M720 1200 Q800 1180 900 1182" stroke="#9AA4AC" strokeWidth="4" fill="none" />
          <path d="M760 1196 L940 1180 L960 1220 L770 1236 Z" fill="url(#ca-cloth)" stroke={K} strokeWidth="5" />
          <path d="M770 1216 L950 1200" stroke="#C84A3A" strokeWidth="3" strokeDasharray="8 6" />
          <Glow id="ca-bg" x={860} y={1180} r={120} t={t} color="#C8A8FF" amp={0.1} rate={6} opacity={0.6 * glint} />
          <Berries x={860} y={1206} s={0.9} n={10} seed={8} glow={glint} />
          {/* rametto con le foglie */}
          <path d="M930 1196 q30 -20 54 -10" stroke="#2A3A20" strokeWidth="5" fill="none" />
          <path d="M960 1186 q10 -20 26 -10 q-10 16 -26 10 Z" fill="#2A4A24" stroke={K} strokeWidth="3" />
        </g>
        {/* PIANO 4 — erba alta in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <path d="M-200 1580 Q540 1540 1280 1590 V2200 H-200 Z" fill="#030503" stroke={K} strokeWidth="8" />
          {Array.from({ length: 40 }, (_, k) => (
            <path key={k} d={`M${-150 + k * 36} 1590 q${8 + (k % 3) * 4} -60 ${(k % 2 ? 16 : -10) + Math.sin(t * 1.4 + k) * 4} -${90 + (k % 4) * 30}`} stroke="#0E1A12" strokeWidth="8" fill="none" strokeLinecap="round" />
          ))}
        </g>
        {/* PIANO 5 — nebbia e particelle vicine (1,6) */}
        <g transform={L(1.6)}>
          <Fog id="ca-f2" t={t} y={1500} rx={900} ry={120} color="#2A3A40" opacity={0.4} speed={0.15} />
          <NearMotes id="ca-near" t={t} color="#B8C8D0" n={6} r0={60} r1={140} y0={900} opacity={0.08} />
        </g>
      </g>
      <Finish id="ca" tint="#0F1A12" tintOpacity={0.12} />
    </svg>
  );
};
