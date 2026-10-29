import React from 'react';
import { camera, eo, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Confetti, Dust, flashAt, Fog, Glow, NearMotes, Smoke } from '../../lib/elements';
import type { SceneProps } from '../../types';

// La band: palco da concerto con fasci di luce colorati e tastiere, visto da sotto il palco.
// Nessuna persona (né musicisti né pubblico): solo strumenti, luci e attrezzatura del tour.
// Piani: fondale con parete di LED (0,25) · americana con i fari (0,4) · palco e strumenti (0,65) ·
//        transenna e monitor da palco (1,2) · flight case del tour, cavi e scaletta (1,35) ·
//        coriandoli e particelle vicine (1,5–1,8)

const K = '#1B1530';
const STAGE_Y = 1170;
const r = rng(8181);
const LAMPS = [
  { x: 120, c: '#FF5EA8', a: 80, ph: 0 },
  { x: 300, c: '#4EC9E8', a: 95, ph: 1.4 },
  { x: 460, c: '#9B7FE0', a: 85, ph: 2.6 },
  { x: 620, c: '#FF5EA8', a: 95, ph: 3.3 },
  { x: 780, c: '#4EC9E8', a: 85, ph: 4.1 },
  { x: 960, c: '#9B7FE0', a: 100, ph: 5.0 },
];
// città del tour sugli adesivi dei flight case
const TOUR = ['TOKYO', 'LONDON', 'NEW YORK', 'PARIS', 'BERLIN', 'CHICAGO'];
const STICK = ['#FF5EA8', '#4EC9E8', '#F2C14E', '#9B7FE0', '#F6F1E9', '#FF8A5C'];

export const Band: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur, 540, 1040);
  const L = cam.layer;
  // le luci del palco si accendono quando Sebastian entra nella band (2ª frase); coriandoli al successo (4ª)
  const on = eo(seg(t, cues[1], cues[1] + 0.4));
  const flash = flashAt(t, [cues[1], cues[3]], [0.8, 1]);
  const conf = seg(t, cues[3], cues[3] + 0.4);
  const beat = Math.max(0, Math.sin(t * 2 * Math.PI * 2)) ** 3; // 120 bpm

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bd" />
        <Lin id="bd-back" stops={[[0, '#08061A'], [0.3, '#140F30'], [0.6, '#221A48'], [1, '#160F2E']]} />
        <Lin id="bd-stage" stops={[[0, '#2A2448'], [0.5, '#1E1A36'], [1, '#100C20']]} />
        <Lin id="bd-front" stops={[[0, '#1A1430'], [1, '#0A0818']]} />
        <Lin id="bd-amp" stops={[[0, '#2E2A40'], [1, '#16121E']]} />
        <Lin id="bd-truss" x2={1} y2={0} stops={[[0, '#4A4668'], [0.5, '#9A96B8'], [1, '#4A4668']]} />
        <Lin id="bd-key" x2={1} y2={0} stops={[[0, '#A87A20'], [0.4, P.accento], [0.7, '#FFE6A0'], [1, '#A87A20']]} />
        <Lin id="bd-flash" stops={[[0, '#F6F1FF', 0], [0.12, '#F6F1FF', 1], [1, '#F6F1FF', 1]]} />
        <Lin id="bd-floor" stops={[[0, '#140F2A'], [0.4, '#0E0A20'], [1, '#07051A']]} />
        <Lin id="bd-drum" x2={1} y2={0} stops={[[0, '#3A2A5E'], [0.5, '#6B4FA0'], [1, '#2A1E46']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — fondale e parete di LED (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#bd-back)" />
          <rect x="60" y="680" width="960" height="400" rx="10" fill="#0E0A20" stroke={K} strokeWidth="8" />
          {Array.from({ length: 10 }, (_, row) =>
            Array.from({ length: 24 }, (_, col) => {
              const x = 90 + col * 39, y = 704 + row * 37;
              const w = 0.5 + 0.5 * Math.sin(col * 0.5 - t * 3 + row * 0.3);
              const c = (col + row) % 3 === 0 ? '#FF5EA8' : (col + row) % 3 === 1 ? '#4EC9E8' : '#9B7FE0';
              return <circle key={`${row}-${col}`} cx={x} cy={y} r="8" fill={c} opacity={0.08 + on * 0.55 * w * w} />;
            }),
          )}
          <Glow id="bd-ledg" x={540} y={880} r={560} t={t} color="#9B7FE0" amp={0.06} rate={4 * Math.PI} opacity={0.15 + 0.25 * on} />
        </g>

        {/* PIANO 1 — americana con i fari e fasci colorati (0,4) */}
        <g transform={L(0.4)}>
          <g opacity={on}>
            {LAMPS.map((l, i) => (
              <Beam key={i} id={`bd-b${i}`} x={l.x} y={620} t={t + l.ph} length={760} spread={300} color={l.c} angle={l.a} sweep={16} sweepRate={0.9 + (i % 3) * 0.25} opacity={0.32 + 0.12 * beat} />
            ))}
          </g>
          {/* traliccio */}
          <rect x="-200" y="575" width="1480" height="40" fill="none" stroke="url(#bd-truss)" strokeWidth="8" />
          <path d={Array.from({ length: 38 }, (_, i) => `M${-200 + i * 40} 579 L${-160 + i * 40} 611`).join(' ')} stroke="#7A76A0" strokeWidth="4" />
          <path d="M-200 575 H1280 M-200 615 H1280" stroke={K} strokeWidth="4" opacity=".6" />
          {LAMPS.map((l, i) => (
            <g key={i}>
              <path d={`M${l.x} 615 V630`} stroke={K} strokeWidth="8" />
              <rect x={l.x - 26} y="626" width="52" height="40" rx="8" fill="#2A2640" stroke={K} strokeWidth="6" />
              <ellipse cx={l.x} cy="666" rx="20" ry="7" fill={on > 0.2 ? l.c : '#3A3450'} />
              <Glow id={`bd-lg${i}`} x={l.x} y={668} r={70} t={t} color={l.c} amp={0.1} rate={6} ph={l.ph} opacity={0.8 * on} />
            </g>
          ))}
        </g>

        {/* PIANO 2 — palco e strumenti, senza musicisti (0,65) */}
        <g transform={L(0.65)}>
          <rect x="-220" y="1060" width="1520" height={STAGE_Y - 1060} fill="url(#bd-stage)" stroke={K} strokeWidth="8" />
          <rect x="-220" y={STAGE_Y} width="1520" height="100" fill="url(#bd-front)" stroke={K} strokeWidth="8" />
          <path d={`M-220 ${STAGE_Y + 8} H1300`} stroke="#6A5A9A" strokeWidth="3" opacity=".6" />
          {/* pozze di luce colorata sul palco */}
          {LAMPS.map((l, i) => (
            <ellipse key={i} cx={l.x + Math.sin((t + l.ph) * (0.9 + (i % 3) * 0.25)) * 180} cy="1120" rx="120" ry="24" fill={l.c} opacity={0.18 * on} />
          ))}

          {/* pedana della batteria */}
          <rect x="380" y="1000" width="320" height="64" fill="#2A2448" stroke={K} strokeWidth="8" />
          <path d="M380 1010 H700" stroke="#6A5A9A" strokeWidth="3" opacity=".6" />
          <circle cx="540" cy="940" r="70" fill="url(#bd-drum)" stroke={K} strokeWidth="8" />
          <circle cx="540" cy="940" r="54" fill="#1A1438" stroke={K} strokeWidth="4" />
          <path d="M440 1000 V860 M640 1000 V850" stroke={K} strokeWidth="6" />
          <ellipse cx="440" cy="858" rx="60" ry="10" fill="#C8B070" stroke={K} strokeWidth="4" transform={`rotate(${-8 + beat * 4} 440 858)`} />
          <ellipse cx="640" cy="848" rx="66" ry="10" fill="#C8B070" stroke={K} strokeWidth="4" transform={`rotate(${8 - beat * 4} 640 848)`} />
          <rect x="460" y="900" width="60" height="40" rx="6" fill="url(#bd-drum)" stroke={K} strokeWidth="5" />
          <rect x="566" y="872" width="56" height="40" rx="6" fill="url(#bd-drum)" stroke={K} strokeWidth="5" />

          {/* casse ai lati */}
          {[60, 900].map((x, k) => (
            <g key={k}>
              <rect x={x} y="900" width="150" height="250" rx="8" fill="url(#bd-amp)" stroke={K} strokeWidth="8" />
              <rect x={x + 16} y="916" width="118" height="100" rx="6" fill="#0E0A18" stroke={K} strokeWidth="4" />
              <circle cx={x + 75} cy="1090" r={44 + beat * 4} fill="#0E0A18" stroke="#4A4668" strokeWidth="6" />
              <circle cx={x + 75} cy="1090" r="14" fill="#2E2A40" />
              <circle cx={x + 120} cy="930" r="5" fill="#FF5E7A" opacity={0.5 + 0.5 * beat} />
            </g>
          ))}

          {/* chitarra sul supporto */}
          <g transform="rotate(-10 270 1150)">
            <path d="M254 1150 L270 1110 L286 1150" fill="none" stroke={K} strokeWidth="6" />
            <path d="M270 1100 C230 1100 222 1060 240 1040 C220 1020 226 990 252 984 L288 984 C314 990 320 1020 300 1040 C318 1060 310 1100 270 1100 Z" fill="#C04A6A" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <path d="M270 990 V820" stroke={K} strokeWidth="14" strokeLinecap="round" />
            <path d="M270 990 V820" stroke="#6A3E2A" strokeWidth="7" strokeLinecap="round" />
            <rect x="260" y="800" width="20" height="30" rx="4" fill="#2A1E20" stroke={K} strokeWidth="4" />
            <circle cx="270" cy="1050" r="12" fill="#1A1020" />
          </g>

          {/* aste dei microfoni vuote */}
          {[380, 720].map((x, k) => (
            <g key={k}>
              <path d={`M${x} 1150 V940 L${x + (k ? -40 : 40)} 910`} fill="none" stroke={K} strokeWidth="7" strokeLinecap="round" />
              <path d={`M${x - 24} 1152 h48`} stroke={K} strokeWidth="8" strokeLinecap="round" />
              <rect x={x + (k ? -54 : 30)} y="896" width="24" height="16" rx="6" fill="#4A4668" stroke={K} strokeWidth="4" transform={`rotate(${k ? 30 : -30} ${x + (k ? -42 : 42)} 904)`} />
            </g>
          ))}

          {/* tastiere su supporto a due piani: l'oggetto chiave, in oro */}
          <Glow id="bd-keyg" x={540} y={1060} r={260} t={t} color={P.accento} amp={0.06} rate={3} opacity={0.25 + 0.35 * on} />
          <path d="M420 1160 L540 1040 L660 1160 M420 1040 L540 1160 L660 1040" fill="none" stroke={K} strokeWidth="9" strokeLinecap="round" />
          {[{ y: 1000, w: 380 }, { y: 1052, w: 420 }].map((k, i) => (
            <g key={i}>
              <rect x={540 - k.w / 2} y={k.y} width={k.w} height="36" rx="6" fill="url(#bd-key)" stroke={K} strokeWidth="7" />
              <rect x={540 - k.w / 2 + 30} y={k.y + 14} width={k.w - 60} height="18" fill="#F6F1E9" stroke={K} strokeWidth="3" />
              {Array.from({ length: Math.floor((k.w - 60) / 16) }, (_, j) => (
                [1, 2, 4, 5, 6].includes(j % 7) ? <rect key={j} x={540 - k.w / 2 + 38 + j * 16} y={k.y + 14} width="8" height="10" fill={K} /> : null
              ))}
              <circle cx={540 + k.w / 2 - 16} cy={k.y + 9} r="4" fill="#FF5E7A" opacity={0.5 + 0.5 * beat} />
              <path d={`M${540 - k.w / 2 + 12} ${k.y + 5} h${k.w * 0.4}`} stroke="#FFF4C8" strokeWidth="3" strokeLinecap="round" opacity=".8" />
            </g>
          ))}

          {/* fumo di scena sul palco */}
          <Fog id="bd-fog1" t={t} y={1130} x={540} rx={700} ry={70} color="#C8B8F0" drift={80} speed={0.3} opacity={0.28} />
          <Smoke id="bd-sm1" t={t} x={-40} y={1140} color="#C8B8F0" n={7} rise={180} wind={360} r0={60} r1={170} speed={0.14} opacity={0.4} />
          <Smoke id="bd-sm2" t={t} x={1120} y={1140} color="#C8B8F0" n={7} rise={180} wind={-360} r0={60} r1={170} speed={0.13} opacity={0.4} />
        </g>

        {/* lampo bianco delle luci stroboscopiche */}
        <rect x="-200" y="500" width="1480" height="1740" fill="url(#bd-flash)" opacity={flash * 0.22} />

        {/* PIANO 3 — transenna sotto il palco e monitor da palco (1,2) */}
        <g transform={L(1.2)}>
          <rect x="-200" y="1300" width="1480" height="800" fill="url(#bd-floor)" />
          {/* monitor da palco inclinati sul bordo */}
          {[250, 830].map((x, k) => (
            <g key={k}>
              <path d={`M${x - 120} 1310 L${x - 100} 1240 H${x + 100} L${x + 120} 1310 Z`} fill="url(#bd-amp)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
              <path d={`M${x - 84} 1252 H${x + 84} L${x + 96} 1298 H${x - 96} Z`} fill="#0E0A18" stroke="#4A4668" strokeWidth="4" />
              <circle cx={x + 96} cy="1262" r="5" fill="#7CF07C" opacity={0.4 + 0.6 * beat * on} />
            </g>
          ))}
          {/* transenna di metallo che esce dai bordi */}
          <path d="M-200 1530 H1280" stroke={K} strokeWidth="22" strokeLinecap="round" />
          <path d="M-200 1530 H1280" stroke="url(#bd-truss)" strokeWidth="12" />
          <path d="M-200 1524 H1280" stroke="#E8E4FF" strokeWidth="3" opacity={0.25 + 0.4 * on} />
          <path d="M-200 1700 H1280" stroke={K} strokeWidth="16" />
          <path d="M-200 1700 H1280" stroke="#4A4668" strokeWidth="8" />
          {Array.from({ length: 30 }, (_, i) => (
            <path key={i} d={`M${-190 + i * 50} 1536 V1760`} stroke={K} strokeWidth="10" />
          ))}
          {Array.from({ length: 30 }, (_, i) => (
            <path key={i} d={`M${-190 + i * 50} 1540 V1756`} stroke="#5A5678" strokeWidth="4" />
          ))}
          {/* riflessi colorati delle luci sul metallo */}
          {LAMPS.map((l, i) => (
            <ellipse key={i} cx={l.x + Math.sin((t + l.ph) * (0.9 + (i % 3) * 0.25)) * 160} cy="1528" rx="70" ry="5" fill={l.c} opacity={0.55 * on} />
          ))}
        </g>

        {/* PIANO 3b — flight case del tour, cavi e scaletta in primo piano (1,35) */}
        <g transform={L(1.35)}>
          {[{ x: -120, w: 420, y: 1640, rot: -3 }, { x: 760, w: 460, y: 1620, rot: 2 }].map((c, k) => (
            <g key={k} transform={`rotate(${c.rot} ${c.x + c.w / 2} ${c.y + 160})`}>
              <rect x={c.x} y={c.y} width={c.w} height="420" rx="14" fill="#1E1A2E" stroke={K} strokeWidth="9" />
              <path d={`M${c.x} ${c.y + 20} H${c.x + c.w} M${c.x} ${c.y + 400} H${c.x + c.w}`} stroke="#8A86A8" strokeWidth="6" opacity=".7" />
              {[c.x + 14, c.x + c.w - 14].map((cx, j) => <rect key={j} x={cx - 14} y={c.y - 6} width="28" height="40" rx="5" fill="#9A96B8" stroke={K} strokeWidth="4" />)}
              {TOUR.slice(k * 3, k * 3 + 3).map((name, j) => {
                const sx = c.x + 40 + j * (c.w - 80) / 3, sy = c.y + 60 + (j % 2) * 70;
                return (
                  <g key={j} transform={`rotate(${(j - 1) * 7} ${sx + 55} ${sy + 25})`}>
                    <rect x={sx} y={sy} width="120" height="52" rx="8" fill={STICK[(k * 3 + j) % STICK.length]} stroke={K} strokeWidth="4" />
                    <text x={sx + 60} y={sy + 35} textAnchor="middle" fontFamily="Figtree" fontWeight={900} fontSize={name.length > 6 ? 19 : 24} fill={K}>{name}</text>
                  </g>
                );
              })}
            </g>
          ))}
          {/* scaletta incollata col nastro */}
          <g transform="rotate(-6 540 1820)">
            <rect x="440" y="1720" width="200" height="260" fill="#F6F1E9" stroke={K} strokeWidth="5" />
            <rect x="500" y="1708" width="80" height="26" fill="#E8D8A0" opacity=".85" />
            <text x="540" y="1770" textAnchor="middle" fontFamily="Figtree" fontWeight={900} fontSize="26" fill={K}>SET LIST</text>
            {[0, 1, 2, 3, 4].map((j) => <path key={j} d={`M466 ${1800 + j * 30} h${j % 2 ? 120 : 148}`} stroke={K} strokeWidth="6" opacity=".55" strokeLinecap="round" />)}
          </g>
          {/* cavi che serpeggiano a terra */}
          <path d="M-200 1890 C100 1840 260 1930 420 1880 S760 1850 1280 1900" fill="none" stroke={K} strokeWidth="16" strokeLinecap="round" />
          <path d="M-200 1890 C100 1840 260 1930 420 1880 S760 1850 1280 1900" fill="none" stroke="#3A3456" strokeWidth="7" strokeLinecap="round" />
        </g>

        {/* PIANO 4 — coriandoli, pulviscolo nei fasci, particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)} opacity={on}>
          <Dust t={t} top={{ y: 660, x0: 200, x1: 880 }} bottom={{ y: 1140, x0: 60, x1: 1020 }} seed={818} n={34} color="#E8E0FF" />
        </g>
        <g transform={L(1.6)} opacity={conf}>
          <Confetti t={t - cues[3]} seed={819} n={80} colors={['#FF5EA8', '#4EC9E8', '#9B7FE0', '#F6F1E9']} y0={-100} y1={1900} speed={0.2} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="bd-near" t={t} seed={820} color="#D8C8FF" opacity={0.09} />
        </g>
      </g>

      <Finish id="bd" tint="#2C2456" tintOpacity={0.13} />
    </svg>
  );
};
