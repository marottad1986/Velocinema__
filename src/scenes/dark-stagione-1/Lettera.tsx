import React from 'react';
import { camera, eo, eob, seg } from '../../lib/anim';
import { HAND } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes, Wisps } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Cards, K, Letter, RED, Raincoat, TINT, YELLOW, Yarn } from './Winden';

// Il colpo di scena: scrivania sotto la lampada; su un grande foglio gli oggetti dei personaggi diventano un albero di
// famiglia disegnato a matita: carte (Mikkel) = busta (Michael) → impermeabile (Jonas); gomitolo (Martha) sorella di
// Mikkel, quindi zia di Jonas. Alla fine il filo rosso chiude tutto in un cerchio. Nessuna persona.
// Eventi: l'impermeabile (cue 0) · carte «=» busta e freccia «padre» (cue 1) · la busta si apre (cue 2)
//         · gomitolo, «sorella» e «zia!» (cue 3) · il filo rosso disegna il cerchio (cue 4).
// Piani: parete in penombra (0,25) · scrivania (0,5) · foglio con gli oggetti e i segni (0,7) · lampada e tazza (1,2)
//        · pulviscolo e particelle (1,5–1,8)

const P = { mikkel: [330, 760], michael: [760, 760], jonas: [760, 990], martha: [330, 1080] } as const;

/** Linea a matita che si disegna (p 0..1). */
const Pencil: React.FC<{ d: string; p: number; color?: string; w?: number }> = ({ d, p, color = '#3A3428', w = 6 }) => (
  <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} opacity={p > 0 ? 1 : 0} />
);

const Label: React.FC<{ x: number; y: number; text: string; p: number; color?: string; size?: number }> = ({ x, y, text, p, color = '#2E2A22', size = 40 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={size} fill={color} opacity={p} transform={`translate(0 ${(1 - p) * 8})`}>{text}</text>
);

export const Lettera: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const jonas = eob(seg(t, cues[0], cues[0] + 0.5));
  const eq = eo(seg(t, cues[1] + 0.3, cues[1] + 0.9));
  const arrow = eo(seg(t, cues[1] + 1.0, cues[1] + 1.8));
  const open = eo(seg(t, cues[2], cues[2] + 0.6));
  const martha = eob(seg(t, cues[3], cues[3] + 0.5));
  const sister = eo(seg(t, cues[3] + 0.4, cues[3] + 1.0));
  const aunt = eo(seg(t, cues[3] + 1.2, cues[3] + 2.0));
  const loop = eo(seg(t, cues[4], cues[4] + 1.6));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="le" />
        <Lin id="le-wall" stops={[[0, '#0E1412'], [0.5, '#1E2A26'], [1, '#2A2620']]} />
        <Lin id="le-desk" stops={[[0, '#5A4430'], [0.5, '#4A3626'], [1, '#2A1E14']]} />
        <Lin id="le-paper" stops={[[0, '#F2EDDC'], [1, '#D8CFB4']]} />
        <Lin id="le-lamp" x2={1} y2={0} stops={[[0, '#2E4A3E'], [0.5, '#4E6E5E'], [1, '#1E3028']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete in penombra (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#le-wall)" />
          <Glow id="le-wg" x={200} y={520} r={600} t={t} color="#F6D58A" amp={0.03} rate={1.2} opacity={0.18} />
        </g>

        {/* PIANO 1 — piano della scrivania (0,5) */}
        <g transform={L(0.5)}>
          <path d="M-200 560 H1280 V2200 H-200 Z" fill="url(#le-desk)" />
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M-200 ${620 + i * 110} Q540 ${600 + i * 110} 1280 ${630 + i * 110}`} fill="none" stroke="#3A2A1C" strokeWidth="4" opacity=".6" />)}
        </g>

        {/* PIANO 2 — foglio con gli oggetti e l'albero di famiglia a matita (0,7) */}
        <g transform={L(0.7)}>
          <path d="M90 610 L1000 594 L1010 1250 L80 1262 Z" fill="url(#le-paper)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <Glow id="le-pg" x={360} y={800} r={600} t={t} color="#FFF0C8" amp={0.04} rate={1.5} opacity={0.3} />
          {/* carte di Mikkel = busta di Michael */}
          <g transform={`translate(${P.mikkel[0]} ${P.mikkel[1]}) rotate(-6) scale(.62)`}><Cards fan={0.35} /></g>
          <Label x={P.mikkel[0]} y={P.mikkel[1] + 100} text="Mikkel" p={1} />
          <g transform={`translate(${P.michael[0]} ${P.michael[1]}) rotate(4)`}>
            <Glow id="le-lg" x={0} y={0} r={220} t={t} color={YELLOW} amp={0.1} rate={2.4} opacity={0.6 * open} />
            <Letter scale={0.55} open={open} />
          </g>
          <Label x={P.michael[0] + 165} y={P.michael[1] + 14} text="Michael" p={1} />
          <Label x={545} y={790} text="=" p={eq} color={RED} size={110} />
          {/* freccia: padre di Jonas */}
          <Pencil d={`M${P.michael[0]} ${P.michael[1] + 70} V960`} p={arrow} />
          <path d="M744 944 L760 966 L776 944" fill="none" stroke="#3A3428" strokeWidth="6" strokeLinecap="round" opacity={seg(arrow, 0.9, 1)} />
          <Label x={830} y={890} text="padre" p={arrow} size={34} />
          {/* impermeabile di Jonas */}
          <g transform={`translate(${P.jonas[0]} ${P.jonas[1]}) scale(${jonas})`}>
            <Raincoat id="le-rc" t={t} scale={0.36} wind={0.2} glow={0.6} wet={false} />
          </g>
          <Label x={P.jonas[0] + 120} y={P.jonas[1] + 140} text="Jonas" p={seg(jonas, 0.5, 1)} />
          {/* gomitolo di Martha: sorella di Mikkel → zia di Jonas */}
          <g transform={`translate(${P.martha[0]} ${P.martha[1]}) scale(${martha})`}><Yarn r={44} /></g>
          <Label x={P.martha[0] - 120} y={P.martha[1] + 14} text="Martha" p={seg(martha, 0.5, 1)} />
          <Pencil d={`M${P.mikkel[0]} ${P.mikkel[1] + 120} V${P.martha[1] - 60}`} p={sister} />
          <Label x={P.mikkel[0] + 80} y={960} text="sorella" p={sister} size={34} />
          <Pencil d={`M${P.martha[0] + 60} ${P.martha[1]} Q${545} ${P.martha[1] + 40} ${P.jonas[0] - 80} ${P.jonas[1] + 110}`} p={aunt} color={RED} />
          <Label x={540} y={1170} text="zia!" p={aunt} color={RED} size={44} />
          {/* il filo rosso chiude il cerchio */}
          <ellipse cx="545" cy="955" rx="430" ry="265" fill="none" stroke={RED} strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray={`${loop} 1`} opacity={loop > 0 ? 1 : 0} />
          <circle cx={545 + 430 * Math.cos(loop * Math.PI * 2)} cy={955 + 265 * Math.sin(loop * Math.PI * 2)} r="12" fill={RED} opacity={loop > 0 && loop < 1 ? 1 : 0} />
        </g>

        {/* PIANO 3 — lampada da scrivania in alto a sinistra, tazza e matita (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 300 L120 520" stroke={K} strokeWidth="26" strokeLinecap="round" />
          <path d="M60 470 L210 560 L130 640 L-10 560 Z" fill="url(#le-lamp)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <Glow id="le-bulb" x={140} y={600} r={200} t={t} color="#FFF0C8" amp={0.06} rate={2} opacity={0.7} />
          <g transform="translate(940 1330)">
            <path d="M-70 -90 H70 L60 40 Q0 60 -60 40 Z" fill="#E8E2D0" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M70 -60 Q120 -50 110 -10 Q100 20 64 16" fill="none" stroke={K} strokeWidth="9" />
            <ellipse cx="0" cy="-90" rx="70" ry="16" fill="#3A2416" stroke={K} strokeWidth="6" />
            <Wisps t={t} x={0} y={-110} color="#E8E2D0" n={3} h={160} width={5} opacity={0.4} />
          </g>
          {/* metà bassa: foto polaroid della grotta, mappa di Winden, chiavi */}
          <g transform="translate(330 1640) rotate(-8)">
            <rect x="-120" y="-130" width="240" height="270" fill="#F2EEE2" stroke={K} strokeWidth="8" />
            <rect x="-100" y="-110" width="200" height="190" fill="#1E2A26" />
            <path d="M-100 80 Q-60 -40 0 -50 Q60 -40 100 80 Z" fill="#3E4A44" />
            <path d="M-40 80 Q-40 0 0 -6 Q40 0 40 80 Z" fill="#0A0E0C" />
            <circle cx="0" cy="40" r="16" fill="#FFE6A0" opacity=".7" />
          </g>
          <g transform="translate(760 1700) rotate(6)">
            <path d="M-170 -110 L170 -120 L180 110 L-160 120 Z" fill="#CFC6A8" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M-170 -110 L-60 -114 L-50 116 M60 -118 L70 114" stroke="#A89E80" strokeWidth="4" />
            <path d="M-140 40 Q-60 -40 20 10 T150 -30" fill="none" stroke="#5E7A6E" strokeWidth="6" />
            <path d="M-120 -60 l20 -30 l20 30 Z M100 60 l20 -30 l20 30 Z" fill="#3E5A4C" />
            <circle cx="20" cy="10" r="10" fill={RED} />
          </g>
          <g transform="translate(560 1860) rotate(20)">
            <circle r="22" fill="none" stroke="#C9CED2" strokeWidth="8" />
            <path d="M20 0 H90 M70 0 V18 M84 0 V14" stroke="#C9CED2" strokeWidth="9" />
          </g>
          <g transform="translate(140 1350) rotate(-24)">
            <rect x="-160" y="-12" width="300" height="24" fill={YELLOW} stroke={K} strokeWidth="6" />
            <path d="M140 -12 L180 0 L140 12 Z" fill="#E8C8A0" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 4 — pulviscolo nel cono della lampada, particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 620, x0: 60, x1: 220 }} bottom={{ y: 1200, x0: 100, x1: 760 }} n={34} color="#FFF0C8" boost={0} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="le-near" t={t} color="#FFF0C8" n={5} vx={-20} vy={-6} opacity={0.07} />
        </g>
      </g>

      <Finish id="le" tint={TINT} tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): impermeabile cue0 · «=» cue1+0,3 e freccia cue1+1 · busta aperta cue2 · gomitolo cue3,
// «sorella» +0,4, «zia!» +1,2 · cerchio rosso da cue4 (1,6 s).
