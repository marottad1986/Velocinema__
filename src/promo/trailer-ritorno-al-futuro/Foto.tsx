import React from 'react';
import { eio, mod, rng, seg } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, StringLights } from '../../lib/elements';
import { Skate } from '../../scenes/ritorno-al-futuro/Linee';
import { CREAM, K, SEPIA, TINT, cam, type ShotProps } from './comune';

// 1955, il ballo della scuola a tema marino: sul tavolo, appoggiata a una coppa di punch, la foto di famiglia con i tre
// cerchi (fratello = berretto, sorella = fiocco, Marty = skateboard) come nello schema. Dietro, la sala sfocata: tende del
// palco, rete da pesca con pesci di carta, lucine e la palla a specchi con i riflessi che girano sulle pareti.
// A `ev` (la voce dice «sparisce») il cerchio di Marty sbiadisce fino a quasi sparire, con un tremolio; gli altri due restano.
// Piani: sala e tende (0,2) · rete, lucine e palla a specchi (0,45) · tavolo, coppa e foto (0,75) · bordo della tovaglia e
// garofano (1,2) · bolle e coriandoli (1,6).

const r = rng(1955);
const BUBBLES = Array.from({ length: 22 }, () => ({ x: r() * 1080, v: 30 + r() * 50, s: 6 + r() * 16, ph: r() }));
const CONF = Array.from({ length: 26 }, () => ({ x: 120 + r() * 840, y: 1040 + r() * 160, a: r() * 180, c: ['#F29AC0', '#9BE0D0', '#F5D27A', '#B9C8F2'][Math.floor(r() * 4)] }));
const BOKEH = Array.from({ length: 18 }, () => ({ x: r() * 1080, y: 280 + r() * 560, s: 20 + r() * 40, c: ['#F29AC0', '#9BE0D0', '#F5D27A'][Math.floor(r() * 3)], ph: r() * 6 }));

export const Foto: React.FC<ShotProps> = ({ t, dur, id, ev = 3.8 }) => {
  const C = cam(t, dur, { z: 0.12, pan: 30, cx: 560, cy: 860 });
  const fade = eio(seg(t, ev, ev + 1.4));
  const flick = t > ev && t < ev + 1.4 ? 0.75 + 0.25 * Math.sin(t * 40) : 1;
  const marty = (1 - 0.85 * fade) * flick;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <Lin id={`${id}-hall`} stops={[[0, '#0E1A3A'], [0.35, '#1A3A5E'], [0.7, '#2A5A72'], [1, '#14304A']]} />
        <Lin id={`${id}-cloth`} stops={[[0, '#F6C6D6'], [0.5, '#E8A8C0'], [1, '#B87090']]} />
        <Lin id={`${id}-cur`} x2={1} y2={0} stops={[[0, '#5A1E3A'], [0.5, '#8A2E52'], [1, '#4A1830']]} />
        <Lin id={`${id}-ph`} stops={[[0, '#CFE6E8'], [1, '#A8CCD6']]} />
        <Lin id={`${id}-glass`} stops={[[0, '#FFFFFF', 0.55], [0.5, '#F2B0C8', 0.35], [1, '#C86A8A', 0.55]]} />
      </defs>
      <g transform={C.transform}>
        {/* la sala, sfocata: tende del palco ai lati, macchie di luce della palla a specchi che girano */}
        <g transform={C.L(0.2)}>
          <rect x="-200" width="1480" height="1920" fill={`url(#${id}-hall)`} />
          <path d="M-200 220 Q-60 600 -80 1200 H140 Q90 700 180 220 Z" fill={`url(#${id}-cur)`} opacity=".85" />
          <path d="M1280 220 Q1140 600 1160 1200 H940 Q990 700 900 220 Z" fill={`url(#${id}-cur)`} opacity=".85" />
          <path d="M-200 200 H1280 V280 Q1080 320 900 280 Q700 330 540 280 Q380 330 180 280 Q0 320 -200 280 Z" fill="#8A2E52" stroke={K} strokeWidth="6" />
          {Array.from({ length: 16 }, (_, i) => {
            const a = t * 0.6 + (i * Math.PI * 2) / 16;
            const x = 540 + Math.cos(a) * (300 + (i % 4) * 90), y = 640 + Math.sin(a * 1.3) * 200;
            return <circle key={i} cx={x} cy={y} r={6 + (i % 3) * 3} fill="#FFFFFF" opacity={0.35 + 0.3 * Math.sin(t * 5 + i)} />;
          })}
          {BOKEH.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.s} fill={b.c} opacity={0.18 + 0.1 * Math.sin(t * 2 + b.ph)} />)}
        </g>
        {/* la rete con i pesci di carta, le lucine, la palla a specchi */}
        <g transform={C.L(0.45)}>
          <path d="M120 300 Q540 470 960 300" fill="none" stroke="#C9B48A" strokeWidth="4" opacity=".6" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${170 + i * 95} ${320 + Math.sin(i / 8 * Math.PI) * 150} V${360 + Math.sin(i / 8 * Math.PI) * 150}`} stroke="#C9B48A" strokeWidth="3" opacity=".6" />)}
          {[[260, 420, '#F5A05A'], [420, 470, '#9BE0D0'], [660, 470, '#F29AC0'], [820, 420, '#F5D27A']].map(([x, y, c], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(t * 1.5 + i) * 10})`}>
              <path d="M-34 0 Q0 -26 30 0 Q0 26 -34 0 Z M30 0 L52 -18 V18 Z" fill={String(c)} stroke={K} strokeWidth="5" strokeLinejoin="round" />
              <circle cx="-16" cy="-4" r="4" fill={K} />
            </g>
          ))}
          <StringLights id={`${id}-sl`} t={t} from={[-40, 560]} to={[1120, 560]} n={14} sag={120} colors={['#F29AC0', '#9BE0D0', '#F5D27A', '#FFFFFF']} />
          <g transform="translate(540 250)">
            <path d="M0 -60 V0" stroke={K} strokeWidth="4" />
            <Glow id={`${id}-ball`} x={0} y={50} r={130} t={t} color="#E6F4FF" amp={0.1} rate={4} opacity={0.5} />
            <circle cy="50" r="52" fill="#9AB0C8" stroke={K} strokeWidth="6" />
            {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M-50 ${20 + i * 14} H50`} stroke={K} strokeWidth="2" opacity=".6" />)}
            {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-40 + i * 16 + mod(t * 20, 16)} 4 V96`} stroke={K} strokeWidth="2" opacity=".5" />)}
            <circle cx="-18" cy="30" r="10" fill="#FFFFFF" opacity={0.6 + 0.4 * Math.sin(t * 8)} />
          </g>
        </g>
        {/* il tavolo: tovaglia rosa, coppa del punch, la foto appoggiata, il biglietto del ballo */}
        <g transform={C.L(0.75)}>
          <path d="M-200 1010 H1280 V1920 H-200 Z" fill={`url(#${id}-cloth)`} stroke={K} strokeWidth="8" />
          <path d="M-200 1016 H1280" stroke="#FFFFFF" strokeWidth="4" opacity=".55" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-120 + i * 110} 1010 Q${-90 + i * 110} 1200 ${-130 + i * 110} 1420`} fill="none" stroke="#B87090" strokeWidth="4" opacity=".55" />)}
          {CONF.map((c, i) => <rect key={i} x={c.x} y={c.y} width="16" height="9" fill={c.c} transform={`rotate(${c.a} ${c.x} ${c.y})`} opacity=".9" />)}
          {/* la coppa del punch dietro la foto */}
          <g transform="translate(820 930)">
            <ellipse cy="120" rx="80" ry="16" fill="#000" opacity=".25" />
            <path d="M-110 -120 Q-100 20 0 30 Q100 20 110 -120 Z" fill={`url(#${id}-glass)`} stroke={K} strokeWidth="7" />
            <ellipse cy="-120" rx="110" ry="22" fill="#F29AC0" opacity=".8" stroke={K} strokeWidth="6" />
            <path d="M0 30 V100 M-60 112 H60" stroke={K} strokeWidth="8" strokeLinecap="round" />
            <path d="M-90 -100 Q-82 -20 -40 10" fill="none" stroke="#FFFFFF" strokeWidth="6" opacity=".6" />
            <path d="M60 -130 L120 -230" stroke="#C8962E" strokeWidth="7" strokeLinecap="round" />
          </g>
          {/* la foto */}
          <g transform="translate(500 860) rotate(-5)">
            <rect x="-250" y="-200" width="500" height="430" fill="#000" opacity=".35" transform="translate(16 18)" />
            <rect x="-250" y="-200" width="500" height="430" fill={CREAM} stroke={K} strokeWidth="8" />
            <rect x="-220" y="-170" width="440" height="320" fill={`url(#${id}-ph)`} stroke={SEPIA} strokeWidth="4" />
            <path d="M-220 80 Q0 40 220 90 V150 H-220 Z" fill="#8FBF8A" opacity=".8" />
            <path d="M-200 -150 L-120 -150 L-200 -70 Z" fill="#FFFFFF" opacity=".25" />
            {/* i tre cerchi: fratello, sorella, Marty */}
            {[-140, 0, 140].map((x, i) => (
              <g key={x} transform={`translate(${x} -10)`} opacity={i === 2 ? marty : 1}>
                <circle r="62" fill={['#F3D6C8', '#F6E0EC', '#D8E8F6'][i]} stroke={SEPIA} strokeWidth="6" strokeDasharray={i === 2 && fade > 0.3 ? '14 10' : undefined} />
                {i === 0 && <path d="M-34 10 Q-34 -28 0 -28 Q34 -28 34 10 Z M18 10 H54" fill="#D9483A" stroke={K} strokeWidth="5" />}
                {i === 1 && <path d="M-34 -18 L0 0 L-34 18 Z M34 -18 L0 0 L34 18 Z" fill="#F2C94C" stroke={K} strokeWidth="5" strokeLinejoin="round" />}
                {i === 2 && <g transform="scale(1.1)"><Skate T={t} s={1} /></g>}
              </g>
            ))}
            <text y="196" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="48" fill="#2A3A4A">noi tre</text>
            <text x="200" y="196" textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize="20" fill={SEPIA} opacity=".6">1985</text>
          </g>
          {/* l'anello rosso del nodo, quando il cerchio sbiadisce */}
          <g transform="translate(500 860) rotate(-5) translate(140 -10)" opacity={seg(t, ev + 0.3, ev + 0.7)}>
            <circle r={86 + 6 * Math.sin(t * 6)} fill="none" stroke="#E8553F" strokeWidth="9" />
          </g>
        </g>
        {/* primo piano: il garofano sul bordo e il bordo di pizzo della tovaglia */}
        <g transform={C.L(1.2)}>
          <g transform="translate(120 1180) rotate(-20)">
            <path d="M0 0 L180 60" stroke="#2E7A4A" strokeWidth="12" strokeLinecap="round" />
            <path d="M120 40 Q150 0 190 20" fill="#3E8A5A" stroke={K} strokeWidth="5" />
            {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={Math.cos(i * 0.7) * 34} cy={Math.sin(i * 0.7) * 34} r="30" fill={i % 2 ? '#F2F2F2' : '#E8E0EA'} stroke={K} strokeWidth="5" />)}
            <circle r="22" fill="#F29AC0" stroke={K} strokeWidth="5" />
          </g>
        </g>
        {/* bolle che salgono (il tema marino) e particelle vicine */}
        <g transform={C.L(1.6)}>
          {BUBBLES.map((b, i) => {
            const y = 1300 - mod(t * b.v + b.ph * 1100, 1100);
            return <circle key={i} cx={b.x + Math.sin(t * 2 + i) * 14} cy={y} r={b.s} fill="none" stroke="#E6F4FF" strokeWidth="3" opacity={0.45} />;
          })}
          <NearMotes id={`${id}-near`} t={t} color="#F6D0E0" opacity={0.08} />
        </g>
      </g>
      <Finish id={id} tint={TINT} tintOpacity={0.1} />
    </svg>
  );
};
