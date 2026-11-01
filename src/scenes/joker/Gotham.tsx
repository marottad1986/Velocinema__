import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Dust, Flyers, Glow, NearMotes, Neon, Reflection, Smoke } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { Completo, JokerDefs, K, Ombra, Palazzo, Sacchi, Scarpa, Tv } from './Comuni';

// Un clown a Gotham: una via sporca del 1981 vista di fronte, un negozio di televisori e radio con l'insegna al neon
// verde, i sacchi dello sciopero ammucchiati ai lati, il vapore che esce dal tombino, l'asfalto bagnato che riflette.
// Eventi: prima frase un taxi giallo attraversa la via e un topo corre lungo il marciapiede (città sporca e arrabbiata);
// seconda frase il cartello da clown («SALDI!», accento) cade appoggiato al muro, con la giacca rossa e una scarpa nella
// cassa; terza frase il grande televisore in vetrina passa dal disturbo a un palco con il microfono sotto il riflettore
// (il sogno della TV, cue 2 + 0,2 come il glockenspiel dello spartito). Nessuna persona.
// Piani: cielo di smog e grattacieli (0,25) · palazzi ai lati (0,45) · negozio con vetrina (0,65) · strada (0,85)
//        · sacchi in primo piano (1,2) · cartacce, vapore vicino e particelle (1,5–1,8)

const r = rng(1981);
const SKY = Array.from({ length: 9 }, (_, i) => ({ x: -160 + i * 160 + r() * 40, w: 90 + r() * 70, h: 260 + r() * 260 }));
const SKYWIN = Array.from({ length: 40 }, () => ({ i: Math.floor(r() * 9), dx: r(), dy: r(), on: r() > 0.55 }));

export const Gotham: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const taxi = seg(t, cues[0] + 0.4, cues[0] + 3.2);
  const rat = seg(t, cues[0] + 1.2, cues[0] + 2.6);
  const sign = eob(seg(t, cues[1] + 0.2, cues[1] + 0.8));
  const signIn = seg(t, cues[1] + 0.2, cues[1] + 0.35);
  const dream = eo(seg(t, cues[2] + 0.2, cues[2] + 0.8));
  const noise = 1 - dream;
  const neonHum = 0.9 + 0.1 * Math.sin(t * 11) * (Math.sin(t * 2.3) > 0.8 ? 1 : 0.2);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="gt" />
        <JokerDefs id="gt" />
        <Lin id="gt-sky" stops={[[0, '#141418'], [0.3, '#2A2A24'], [0.5, '#4A4630'], [0.62, '#6A5E3A']]} />
        <Lin id="gt-far" stops={[[0, '#2A2C2A'], [1, '#3E3E34']]} />
        <Lin id="gt-road" stops={[[0, '#2A2A2C'], [0.4, '#1C1C20'], [1, '#0E0E12']]} />
        <Lin id="gt-walk" stops={[[0, '#5A5650'], [1, '#3A3834']]} />
        <Lin id="gt-shop" x2={1} y2={0} stops={[[0, '#2E3A34'], [0.5, '#3E5046'], [1, '#26302C']]} />
        <Lin id="gt-inside" stops={[[0, '#1A2420'], [1, '#2E3A2A']]} />
        <Lin id="gt-taxi" stops={[[0, '#F2C230'], [0.6, '#D8A018'], [1, '#8A6410']]} />
        <Lin id="gt-sign" x2={1} y2={0} stops={[[0, '#E8D040'], [0.5, '#F6E27A'], [1, '#C8A82A']]} />
        <Lin id="gt-awn" x2={1} y2={0} stops={[[0, '#7A2420'], [0.5, '#A8342C'], [1, '#6A1E1A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo di smog, grattacieli lontani (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#gt-sky)" />
          <Glow id="gt-haze" x={540} y={760} r={700} t={t} color="#C8A860" amp={0.03} rate={0.6} opacity={0.35} />
          {SKY.map((b, i) => <rect key={i} x={b.x} y={800 - b.h} width={b.w} height={b.h} fill="url(#gt-far)" />)}
          {SKYWIN.map((w, i) => w.on && <rect key={i} x={SKY[w.i].x + 10 + w.dx * (SKY[w.i].w - 26)} y={800 - SKY[w.i].h + 20 + w.dy * (SKY[w.i].h - 60)} width="8" height="12" fill="#F2C46A" opacity={0.5 + 0.3 * Math.sin(t * 0.8 + i)} />)}
          <Smoke id="gt-chim" t={t} x={260} y={540} color="#5A5848" n={8} rise={260} wind={260} r0={30} r1={120} speed={0.12} opacity={0.6} />
        </g>

        {/* PIANO 1 — palazzi ai lati della via (0,45) */}
        <g transform={L(0.45)}>
          <Palazzo id="gt" x={-200} y={1180} w={330} h={560} t={t} lit={0.4} seed={2} />
          <Palazzo id="gt" x={950} y={1180} w={330} h={760} t={t} lit={0.3} seed={5} dark />
        </g>

        {/* PIANO 2 — il negozio di TV e radio con la vetrina (0,65) */}
        <g transform={L(0.65)}>
          <Palazzo id="gt" x={110} y={1180} w={860} h={600} t={t} lit={0.45} seed={7} fire={false} />
          {/* poster dello sciopero e scritte sul muro */}
          {[[60, 760, -4], [1010, 780, 5]].map(([x, y, a], i) => (
            <g key={i} transform={`rotate(${a} ${x} ${y})`}>
              <rect x={x - 50} y={y - 66} width="100" height="132" fill="#D8CCAA" stroke={K} strokeWidth="4" />
              <rect x={x - 40} y={y - 54} width="80" height="40" fill={K} />
              <text x={x} y={y - 26} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="18" fill="#D8CCAA">SCIOPERO</text>
              <path d={`M${x - 36} ${y + 4} h72 M${x - 36} ${y + 22} h60 M${x - 36} ${y + 40} h66`} stroke="#5A4A3A" strokeWidth="5" />
            </g>
          ))}
          {/* insegna al neon */}
          <rect x="250" y="626" width="580" height="96" rx="10" fill="#141A18" stroke={K} strokeWidth="8" />
          <g opacity={neonHum}><Neon id="gt-neon" t={t} x={540} y={700} text="TV · RADIO" color="#6AF0A0" font={SANS} size={70} /></g>
          {/* tenda a strisce */}
          <path d="M200 740 H880 L920 800 H160 Z" fill="url(#gt-awn)" stroke={K} strokeWidth="8" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${240 + i * 85} 740 L${220 + i * 92} 800`} stroke="#E8D8B0" strokeWidth="22" opacity=".85" />)}
          <path d="M160 950 Q190 972 220 950 Q250 972 280 950 Q310 972 340 950 Q370 972 400 950 Q430 972 460 950 Q490 972 520 950 Q550 972 580 950 Q610 972 640 950 Q670 972 700 950 Q730 972 760 950 Q790 972 820 950 Q850 972 880 950 Q900 966 920 950" fill="#7A2420" stroke={K} strokeWidth="6" />
          {/* vetrina */}
          <rect x="180" y="800" width="560" height="390" fill="url(#gt-shop)" stroke={K} strokeWidth="10" />
          <rect x="196" y="816" width="528" height="360" fill="url(#gt-inside)" stroke={K} strokeWidth="5" />
          <Glow id="gt-win" x={480} y={1000} r={380} t={t} color={dream > 0.5 ? '#F2D890' : '#A8D8E8'} amp={0.06} rate={7} opacity={0.35 + 0.25 * dream} />
          {/* due TV piccole che fanno disturbo */}
          {[[262, 900], [262, 1060]].map(([x, y], i) => (
            <g key={i}>
              <Tv id="gt" x={x} y={y} s={0.27} antenna={false}>
                {Array.from({ length: 12 }, (_, k) => <rect key={k} x={-172} y={-118 + k * 20} width="258" height="10" fill="#C8D8E0" opacity={0.2 + 0.4 * Math.abs(Math.sin(t * 23 + k * 1.7 + i))} />)}
              </Tv>
            </g>
          ))}
          {/* la TV grande: dal disturbo al palco col microfono */}
          <Tv id="gt" x={530} y={1010} s={0.82} glow={1 + dream} antenna={false}>
            <g opacity={noise}>{Array.from({ length: 12 }, (_, k) => <rect key={k} x={-172} y={-118 + k * 20} width="258" height="10" fill="#C8D8E0" opacity={0.25 + 0.45 * Math.abs(Math.sin(t * 19 + k * 2.1))} />)}</g>
            <g opacity={dream}>
              <rect x="-172" y="-118" width="258" height="234" fill="#3A1418" />
              {Array.from({ length: 7 }, (_, k) => <path key={k} d={`M${-170 + k * 40} -118 q14 120 0 234`} stroke="#5A1E22" strokeWidth="16" fill="none" />)}
              <path d="M-43 -118 L-130 116 H44 Z" fill="#FFF0C0" opacity=".3" />
              <ellipse cx="-43" cy="100" rx="90" ry="16" fill="#FFF0C0" opacity=".5" />
              <path d="M-43 98 V0" stroke="#C8CCD0" strokeWidth="6" />
              <rect x="-54" y="-30" width="22" height="36" rx="11" fill="#C8CCD0" stroke={K} strokeWidth="4" />
              <path d="M-66 98 h46" stroke="#C8CCD0" strokeWidth="6" />
              {[-140, -100, 20, 60].map((sx, k) => <circle key={k} cx={sx} cy={-90 + (k % 2) * 16} r="5" fill="#FFF6D0" opacity={0.5 + 0.5 * Math.sin(t * 5 + k)} />)}
            </g>
          </Tv>
          <rect x="196" y="816" width="528" height="360" fill="url(#gt-glass)" />
          <path d="M220 830 L340 1170 M270 830 L390 1170" stroke="#FFFFFF" strokeWidth="6" opacity=".12" />
          {/* porta del negozio */}
          <rect x="760" y="800" width="150" height="390" fill="#2A1E16" stroke={K} strokeWidth="9" />
          <rect x="778" y="820" width="114" height="150" fill="#1A2420" stroke={K} strokeWidth="5" />
          <rect x="784" y="840" width="102" height="34" fill="#E8E0C8" stroke={K} strokeWidth="3" />
          <text x="835" y="864" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="20" fill={K}>CHIUSO</text>
          <circle cx="880" cy="1050" r="7" fill="#C9A24A" stroke={K} strokeWidth="3" />
        </g>

        {/* PIANO 3 — marciapiede e strada bagnata, taxi e topo (0,85) */}
        <g transform={L(0.85)}>
          <path d="M-200 1180 H1280 V1260 H-200 Z" fill="url(#gt-walk)" stroke={K} strokeWidth="7" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-120 + i * 170} 1180 l-20 80`} stroke={K} strokeWidth="4" opacity=".6" />)}
          <path d="M-200 1182 H1280" stroke="#9A968C" strokeWidth="4" opacity=".6" />
          <path d="M-200 1260 H1280 V2200 H-200 Z" fill="url(#gt-road)" />
          <path d="M-200 1262 H1280" stroke="#8A867C" strokeWidth="6" />
          <Reflection t={t} x={540} y={1300} color="#6AF0A0" n={7} w={220} gap={24} opacity={0.4 * neonHum} />
          <Reflection t={t + 1} x={470} y={1310} color={dream > 0.5 ? '#F2D890' : '#A8D8E8'} n={6} w={120} gap={26} opacity={0.3} />
          {/* tombino col vapore */}
          <ellipse cx="700" cy="1350" rx="90" ry="22" fill="#2A2A2E" stroke={K} strokeWidth="6" />
          {[-60, -30, 0, 30, 60].map((dx) => <path key={dx} d={`M${700 + dx} 1334 v32`} stroke={K} strokeWidth="4" />)}
          {/* il topo lungo il marciapiede */}
          {rat > 0 && rat < 1 && (
            <g transform={`translate(${lerp(-60, 1140, rat)} 1176)`}>
              <ellipse cx="0" cy="-14" rx="30" ry="15" fill="#3A3430" stroke={K} strokeWidth="4" />
              <circle cx="28" cy="-18" r="10" fill="#3A3430" stroke={K} strokeWidth="4" />
              <circle cx="22" cy="-28" r="6" fill="#5A4A44" stroke={K} strokeWidth="3" />
              <path d="M-30 -12 q-30 4 -46 -10" stroke="#5A4A44" strokeWidth="4" fill="none" />
              {[-14, 12].map((lx) => <path key={lx} d={`M${lx} -2 l${Math.sin(t * 40) * 6} 6`} stroke={K} strokeWidth="4" />)}
            </g>
          )}
          {/* il taxi che attraversa */}
          {taxi > 0 && taxi < 1 && (
            <g transform={`translate(${lerp(1500, -520, taxi)} 1262)`}>
              <Ombra id="gt" x={0} y={10} rx={240} ry={22} />
              <path d="M-230 0 V-70 Q-226 -90 -200 -94 L-120 -100 L-70 -160 H90 L150 -100 L220 -92 Q240 -88 240 -60 V0 Z" fill="url(#gt-taxi)" stroke={K} strokeWidth="8" />
              <path d="M-60 -150 H80 L130 -100 H-100 Z" fill="#2A3A44" stroke={K} strokeWidth="5" />
              <path d="M10 -150 V-100" stroke={K} strokeWidth="6" />
              <rect x="-30" y="-182" width="80" height="24" rx="4" fill="#F2E6B0" stroke={K} strokeWidth="5" />
              <text x="10" y="-163" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="16" fill={K}>TAXI</text>
              <path d="M-220 -50 H230" stroke={K} strokeWidth="4" />
              {Array.from({ length: 8 }, (_, k) => <rect key={k} x={-200 + k * 52} y="-48" width="26" height="14" fill={k % 2 ? K : '#F2E6B0'} />)}
              {[-140, 140].map((wx) => <g key={wx}><circle cx={wx} cy="0" r="40" fill="#1A1A1C" stroke={K} strokeWidth="6" /><circle cx={wx} cy="0" r="16" fill="#9AA2AA" /></g>)}
              <Glow id="gt-tl" x={-232} y={-50} r={90} t={t} color="#FFF0B0" amp={0} opacity={0.8} />
            </g>
          )}
          {/* il cartello da clown che cade appoggiato al muro, con la cassa */}
          <g transform={`translate(950 1250) rotate(${lerp(-80, -10, sign)}) scale(0.95)`} opacity={signIn}>
            <path d="M-20 0 L-20 -360 L-90 -360 L20 -480 L130 -360 L60 -360 L60 0 Z" fill="url(#gt-sign)" stroke={K} strokeWidth="9" />
            <path d="M-20 -340 V-10 M60 -340 V-10" stroke="#B89420" strokeWidth="4" />
            <text transform="translate(44 -196) rotate(-90)" fontFamily={SANS} fontWeight={900} fontSize="54" fill={P.accento} stroke={K} strokeWidth="2">SALDI!</text>
            <path d="M-6 -380 l30 -40 l30 40" stroke="#FFF6C0" strokeWidth="6" fill="none" opacity=".7" />
          </g>
          <g opacity={signIn}>
            <Ombra id="gt" x={880} y={1256} rx={140} ry={18} />
            <path d="M770 1256 L786 1140 H980 L996 1256 Z" fill="url(#gt-wood)" stroke={K} strokeWidth="9" />
            <path d="M780 1180 H990 M776 1216 H994" stroke={K} strokeWidth="5" />
            <g transform="translate(790 1146) rotate(-84)"><Completo id="gt" x={0} y={0} s={0.42} /></g>
            <Scarpa id="gt" x={940} y={1132} s={0.55} rot={-14} />
          </g>
        </g>

        {/* PIANO 4 — sacchi della spazzatura (1,2) */}
        <g transform={L(1.2)}>
          <Sacchi id="gt" x={30} y={1640} s={1.5} seed={1} />
          <Sacchi id="gt" x={1060} y={1660} s={1.6} seed={2} />
        </g>

        {/* PIANO 5 — vapore del tombino, cartacce nel vento, particelle (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Smoke id="gt-steam" t={t} x={760} y={1380} color="#C8C4B4" n={12} rise={620} wind={-180} r0={50} r1={190} speed={0.18} opacity={0.65} />
          <Flyers t={t} seed={4} n={6} color="#D8CCAA" outline={K} y0={900} y1={1500} speed={0.5} shape="paper" />
        </g>
        <g transform={L(1.8)}>
          <Dust t={t} top={{ y: 540, x0: 60, x1: 200 }} bottom={{ y: 1400, x0: 0, x1: 700 }} seed={8} n={20} color="#F2D890" />
          <NearMotes id="gt-near" t={t} color="#F2D890" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="gt" tint="#2E3A26" tintOpacity={0.14} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): taxi cue0 + 0,4 → 3,2 · topo cue0 + 1,2 · cartello cue1 + 0,2 · TV col palco cue2 + 0,2.
