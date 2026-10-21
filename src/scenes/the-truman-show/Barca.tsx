import React from 'react';
import { camera, eio, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Clouds, Glow, Lightning, NearMotes, Rain, WaveBand, WaveLines, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';

// La barca: piccola barca a vela "Santa Maria" in una tempesta enorme, onde alte, fulmini, vela tesa;
// nel cielo si intravede la griglia dei riflettori, che si accende quando il regista scatena la tempesta.
// Piani: cielo (0,2) · griglia riflettori (0,3) · nubi (0,4) · pioggia lontana e mare lontano (0,5–0,6)
//        · onda media (0,75) · barca (0,85) · onda vicina (1,0) · cresta e salvagente in primo piano (1,25) · pioggia vicina e spruzzi (1,6–1,8)

const K = '#142235';
const ON_AT = 5.5; // «Il regista dello show scatena una tempesta»
const FLASHES = [7.82, 8.9]; // «Onde, fulmini. La barca si rovescia.»
const CAPSIZE = [7.9, 8.9];
const RECOVER = [9.8, 10.7]; // «Truman resiste.»

// incroci della griglia dove pendono i riflettori
const LAMPS = Array.from({ length: 7 }, (_, i) => ({ x: 60 + i * 160, y: 640, d: [3, 1, 5, 0, 6, 2, 4][i] }));
const sprayR = rng(808);
const SPRAY = Array.from({ length: 16 }, () => ({ vx: (sprayR() - 0.3) * 260, vy: 220 + sprayR() * 200, ph: sprayR(), r: 5 + sprayR() * 7 }));

const Boat: React.FC<{ accent: string }> = ({ accent }) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {/* sartiame */}
    <path d="M0 -440 L205 -22 M0 -440 L-190 -22" stroke={K} strokeWidth="3" opacity=".8" />
    {/* fiocco (crema) e randa (accento) tesi dal vento */}
    <path d="M10 -405 Q110 -210 188 -34 L10 -42 Z" fill="#F4F1E6" stroke={K} strokeWidth="7" />
    <path d="M30 -330 Q90 -200 140 -60" fill="none" stroke="#C9D3DA" strokeWidth="4" />
    <path d="M-8 -425 Q-140 -230 -178 -54 L-8 -54 Z" fill={accent} stroke={K} strokeWidth="8" />
    <path d="M-12 -300 L-130 -300 M-12 -190 L-160 -190" stroke="#C46A22" strokeWidth="4" opacity=".7" />
    <path d="M-30 -380 Q-110 -240 -140 -90" fill="none" stroke="#FFC48E" strokeWidth="5" opacity=".7" />
    {/* albero, boma, bandierina */}
    <path d="M0 -20 V-440" stroke={K} strokeWidth="10" />
    <path d="M-8 -54 H-190" stroke={K} strokeWidth="9" />
    <path d="M0 -440 L-46 -428 L0 -416 Z" fill="#F4F1E6" stroke={K} strokeWidth="4" />
    {/* cabina */}
    <path d="M-120 -18 L-108 -58 H22 L36 -18 Z" fill="#E4DCC8" stroke={K} strokeWidth="6" />
    <rect x="-92" y="-48" width="28" height="18" rx="5" fill="#8FD3F4" stroke={K} strokeWidth="4" />
    <rect x="-46" y="-48" width="28" height="18" rx="5" fill="#8FD3F4" stroke={K} strokeWidth="4" />
    {/* scafo */}
    <path d="M-200 -20 H220 Q190 50 128 64 H-152 Q-190 44 -200 -20 Z" fill="#F4F1E6" stroke={K} strokeWidth="8" />
    <path d="M-194 6 H206" stroke="#4FA3D1" strokeWidth="10" />
    <path d="M-150 54 H124" stroke="#B9C6CF" strokeWidth="6" />
    <text x="20" y="44" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="30" fill={K} letterSpacing="2">SANTA MARIA</text>
  </g>
);

export const Barca: React.FC<SceneProps> = ({ t, dur, palette: P }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const flash = flashAt(t, FLASHES);

  // la griglia dei riflettori si accende a cascata
  const lampOn = (d: number) => seg(t, ON_AT + d * 0.09, ON_AT + d * 0.09 + 0.12);
  const gridVis = 0.28 + 0.4 * seg(t, ON_AT, ON_AT + 0.8) + flash * 0.5;

  // barca: rollio, poi si rovescia e si raddrizza
  const cap = eio(seg(t, CAPSIZE[0], CAPSIZE[1])) * (1 - eio(seg(t, RECOVER[0], RECOVER[1])));
  const storm = 1 + 0.6 * seg(t, ON_AT, ON_AT + 1.5);
  const roll = Math.sin(t * 1.7) * 13 * storm - 74 * cap + Math.sin(t * 9) * 2 * cap;
  const bob = Math.sin(t * 2.1) * 22 * storm + cap * 40;
  const bx = 600 + Math.sin(t * 0.9) * 26;

  const sw = Math.sin(t * 2.2) * 14;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bc" />
        <Lin id="bc-sky" stops={[[0, '#060D18'], [0.32, '#0E1B2D'], [0.55, '#1A3049'], [0.7, '#24405D'], [1, '#1B3550']]} />
        <Lin id="bc-sea" stops={[[0, '#2B5274'], [1, '#0F2236']]} />
        <Lin id="bc-sea2" stops={[[0, '#336389'], [1, '#132A42']]} />
        <Lin id="bc-front" stops={[[0, '#1E3C5A'], [0.5, '#102238'], [1, '#081322']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo e lampo */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#bc-sky)" />
          <rect x="-200" y="-200" width="1480" height="2320" fill="#CFE7F4" opacity={flash * 0.4} />
          <Lightning x={880} y={560} h={460} flash={flash} seed={9} width={8} />
          <Lightning x={230} y={600} h={380} flash={seg(t, FLASHES[1], FLASHES[1] + 0.01) * flash} seed={23} width={6} />
        </g>

        {/* PIANO 1 — griglia dei riflettori dello studio che si intravede, poi si accende */}
        <g transform={L(0.3)}>
          <g stroke="#3A5878" strokeLinecap="round" opacity={gridVis}>
            <path d="M-200 560 H1280 M-200 600 H1280" strokeWidth="6" />
            {Array.from({ length: 24 }, (_, i) => (
              <path key={i} d={`M${-200 + i * 64} 560 L${-168 + i * 64} 600 L${-136 + i * 64} 560`} strokeWidth="3" fill="none" />
            ))}
            {LAMPS.map((l, i) => <path key={i} d={`M${l.x} 600 V${l.y - 18}`} strokeWidth="5" />)}
          </g>
          {LAMPS.map((l, i) => {
            const on = lampOn(l.d);
            return (
              <g key={i}>
                {on > 0 && <Beam id={`bc-beam${i}`} x={l.x} y={l.y + 14} t={t} length={520} spread={200} color="#DCEFFF" angle={90 + (i - 3) * 4} sweep={2} sweepRate={0.8 + i * 0.1} opacity={0.22 * on} />}
                {on > 0 && <Glow id={`bc-lg${i}`} x={l.x} y={l.y + 10} r={80} t={t} color="#EAF6FF" amp={0.05} rate={3 + i} opacity={0.75 * on} />}
                <path d={`M${l.x - 22} ${l.y - 18} H${l.x + 22} L${l.x + 30} ${l.y + 14} H${l.x - 30} Z`} fill="#1B2C40" stroke="#0A1420" strokeWidth="4" opacity={0.5 + 0.5 * Math.max(on, gridVis)} />
                <ellipse cx={l.x} cy={l.y + 14} rx="26" ry="7" fill={on > 0 ? '#F4FBFF' : '#2C4560'} opacity={0.4 + 0.6 * on} />
              </g>
            );
          })}
        </g>

        {/* PIANO 2 — nubi di tempesta */}
        <g transform={L(0.4)}>
          <Clouds id="bc-cl" t={t} color="#2A4260" seed={14} n={4} y={720} h={110} speed={0.5} opacity={0.75} />
          <Clouds id="bc-cl2" t={t + 3} color="#101E30" seed={6} n={3} y={-40} h={120} speed={0.4} opacity={0.9} />
        </g>

        {/* PIANO 3 — pioggia lontana e mare lontano */}
        <g transform={L(0.5)}>
          <Rain t={t} level="far" seed={12} color="#7FA6C4" opacity={0.35} angle={26} />
        </g>
        <g transform={L(0.6, 0, sw * 0.4)}>
          <WaveBand t={t} y={1040} fill="#1D3A57" foam="#9FC4DC" amp={48} w={220} speed={70} bob={8} foamWidth={4} foamOpacity={0.5} />
        </g>

        {/* PIANO 4 — onda media con schiuma */}
        <g transform={L(0.75, 0, sw * 0.7)}>
          <WaveBand t={t} y={1130} fill="url(#bc-sea)" foam="#D6E9F4" amp={90} w={360} speed={110} bob={14} ph={1} foamWidth={7} foamOpacity={0.7} />
          <WaveLines t={t} ys={[1190, 1240]} color="#5F8FB4" amp={10} w={240} speed={90} opacity={0.5} />
        </g>

        {/* PIANO 5 — la barca Santa Maria */}
        <g transform={L(0.85)}>
          <Glow id="bc-boatglow" x={bx} y={1000} r={360} t={t} color="#9CCBEA" amp={0.06} rate={1.5} opacity={0.18 + 0.25 * seg(t, ON_AT, ON_AT + 1) + flash * 0.3} />
          <g transform={`translate(${bx} ${1150 + bob}) rotate(${roll})`}>
            <Boat accent={P.accento} />
          </g>
          {/* spruzzi a ogni urto d'onda */}
          {SPRAY.map((s, i) => {
            const p = mod(t * 0.9 + s.ph, 1);
            return <circle key={i} cx={bx + 180 + s.vx * p} cy={1150 + bob - s.vy * p + 300 * p * p} r={s.r * (1 - p * 0.4)} fill="#E6F3FA" opacity={Math.sin(p * Math.PI) * 0.85} />;
          })}
        </g>

        {/* PIANO 6 — onda vicina che copre la chiglia */}
        <g transform={L(1.0, 0, sw)}>
          <WaveBand t={t} y={1245} fill="url(#bc-sea2)" foam="#E9F5FB" amp={115} w={440} speed={150} bob={18} ph={2} foamWidth={9} foamOpacity={0.8} />
          <WaveLines t={t} ys={[1320, 1420, 1540]} color="#6E9EC2" amp={14} w={300} speed={120} width={5} opacity={0.45} />
        </g>

        {/* PIANO 7 — cresta enorme in primo piano e salvagente */}
        <g transform={L(1.25, 0, sw * 1.3)}>
          <WaveBand t={t} y={1620} fill="url(#bc-front)" foam="#F4FBFF" amp={170} w={640} speed={190} bob={26} ph={3} foamWidth={12} foamOpacity={0.85} />
          <g transform={`translate(${170 + Math.sin(t * 1.3) * 30} ${1640 + Math.sin(t * 2.1 + 3) * 34}) rotate(${t * 25})`}>
            <circle r="78" fill="none" stroke={K} strokeWidth="50" />
            <circle r="78" fill="none" stroke="#F4F1E6" strokeWidth="36" />
            <circle r="78" fill="none" stroke="#4FA3D1" strokeWidth="36" strokeDasharray="61 61" />
            <circle r="78" fill="none" stroke="#FFFFFF" strokeWidth="6" opacity=".5" strokeDasharray="30 460" />
          </g>
          <path d={`M${1000 + Math.sin(t) * 20} ${1700 + Math.sin(t * 2) * 30} q40 -30 90 -10`} fill="none" stroke="#D6E9F4" strokeWidth="8" strokeLinecap="round" opacity=".6" />
        </g>

        {/* PIANO 8 — pioggia vicina e spruzzi davanti alla camera */}
        <g transform={L(1.6)}>
          <Rain t={t} level="near" seed={31} color="#C8DCEA" opacity={0.5} angle={50} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="bc-near" t={t} color="#DCEBF5" n={8} vx={-90} vy={20} opacity={0.14} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#E4F2FA" opacity={flash * 0.12} />
      <Finish id="bc" tint="#142235" tintOpacity={0.13} />
    </svg>
  );
};

