import React from 'react';
import { camera, eo, eob, lerp, mod, rainPath, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';

// La cella vuota: cella chiusa a chiave, branda, scarpe sotto la branda, lampo dalla finestra con sbarre.
// Piani: parete di fondo + finestra (0,25) · fascio di luce e pavimento (0,45–0,5) · tubo, branda, porta (0,65)
//        · sbarre, catena e secchio in primo piano (1,25) · pulviscolo davanti alla camera (1,7)

const K = '#0A1215';
const WIN = { x: 420, y: 580, w: 240, h: 230 };
const BARS = [480, 540, 600];
const FLOOR_Y = 1090;
// macchia di luce sul pavimento (trapezio) proiettata dalla finestra
const PATCH = { tl: 450, tr: 650, bl: 370, br: 710, top: 1100, bottom: 1262 };
const onPatch = (bx: number) => {
  const f = (bx - WIN.x) / WIN.w;
  return { top: lerp(PATCH.tl, PATCH.tr, f), bottom: lerp(PATCH.bl, PATCH.br, f) };
};

const r = rng(67);
const DUST = Array.from({ length: 26 }, () => ({ u: r(), v: r(), s: 2 + r() * 4, sp: 0.02 + r() * 0.04, ph: r() * 6 }));
const NEAR = Array.from({ length: 6 }, (_, i) => ({ x: r() * 1080, y: 500 + r() * 1300, rad: 40 + r() * 60, ph: i }));

// mattoni della parete
const bricks = (() => {
  let d = '';
  for (let row = 0; row < 9; row++) {
    const y = 200 + row * 100;
    d += `M-200 ${y} H1280 `;
    for (let c = -1; c < 8; c++) {
      const x = c * 180 + (row % 2) * 90;
      d += `M${x} ${y} V${y + 100} `;
    }
  }
  return d;
})();

export const Cella: React.FC<SceneProps> = ({ t, dur, palette: P }) => {
  const cam = camera(t, dur, 540, 980);
  const L = cam.layer;

  // Due soli lampi (QUALITA §2): a 3,0 s e a 7,8 s
  const flash = seg(t, 3.0, 3.06) * (1 - seg(t, 3.15, 3.75)) + 0.75 * seg(t, 7.8, 7.86) * (1 - seg(t, 7.95, 8.5));
  const breathe = 0.5 + 0.5 * Math.sin(t * 1.4);

  // Lucchetto: piccolo scatto all'inizio
  const lockRot = Math.sin(t * 9) * 6 * (1 - eo(seg(t, 0.5, 1.8))) * seg(t, 0.3, 0.5);

  // Scarpe: evidenziate quando la voce dice «E le scarpe?» (7ª frase, ~ metà-fine capitolo)
  const shoesAt = dur * 0.7;
  const sp = eob(seg(t, shoesAt, shoesAt + 0.5), 1.7);
  const shoeGlow = seg(t, shoesAt, shoesAt + 0.4);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ce" />
        <Lin id="ce-wall" stops={[[0, '#121C20'], [0.25, '#24363B'], [0.5, '#34494D'], [1, '#22323A']]} />
        <Lin id="ce-night" stops={[[0, '#0B161C'], [0.6, '#1D3A44'], [1, '#2C5560']]} />
        <Lin id="ce-floor" stops={[[0, '#2C3B3F'], [0.4, '#1E2A2E'], [1, '#0B1316']]} />
        <Lin id="ce-shaft" stops={[[0, '#DCEBEE', 0.32], [1, '#DCEBEE', 0]]} />
        <Lin id="ce-door" x2={1} y2={0} stops={[[0, '#6F8584'], [0.5, '#4F6464'], [1, '#2F3F41']]} />
        <Lin id="ce-mattress" stops={[[0, '#C7D2CF'], [1, '#8C9B98']]} />
        <Lin id="ce-blanket" x2={1} y2={0} stops={[[0, '#3E5A5E'], [1, '#5C7A7C']]} />
        <Lin id="ce-brass" x2={1} y2={0} stops={[[0, '#FFE08A'], [0.5, '#D9A940'], [1, '#8E6A22']]} />
        <Lin id="ce-iron" x2={1} y2={0} stops={[[0, '#1A262A'], [0.35, '#3A4C50'], [1, '#0B1316']]} />
        <Lin id="ce-bucket" x2={1} y2={0} stops={[[0, '#56686B'], [0.3, '#B9C8CA'], [0.55, '#6E8285'], [1, '#2B3A3D']]} />
        <Lin id="ce-pipe" stops={[[0, '#3D5054'], [0.4, '#7C9497'], [1, '#1B272A']]} />
        <GlowGradient id="ce-moon" color="#BFD9DE" core={0.5} mid={0.18} />
        <GlowGradient id="ce-dust" color="#E9F0F2" core={0.9} mid={0.35} />
        <GlowGradient id="ce-shoe" color="#FF8A4C" core={0.55} mid={0.2} />
        <GlowGradient id="ce-shadow" color="#000000" core={0.55} mid={0.3} />
        <clipPath id="ce-winclip">
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} />
        </clipPath>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete di fondo con finestra (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height={FLOOR_Y + 220} fill="url(#ce-wall)" />
          <path d={bricks} stroke="#0F181B" strokeWidth="5" opacity=".45" />
          {/* alone di luce lunare sulla parete */}
          <ellipse cx={WIN.x + WIN.w / 2} cy={WIN.y + WIN.h / 2} rx={360 + breathe * 20} ry={320 + breathe * 20} fill="url(#ce-moon)" />
          {/* crepe e segni sul muro */}
          <path d="M150 600 l30 60 l-20 40 l40 70 M180 660 l40 -10" fill="none" stroke="#0B1316" strokeWidth="5" strokeLinecap="round" />
          <path d="M860 300 l-20 50 l30 40" fill="none" stroke="#0B1316" strokeWidth="4" strokeLinecap="round" />
          <g stroke="#9DB2B4" strokeWidth="4" strokeLinecap="round" opacity=".55">
            <path d="M236 760 v46 M252 760 v46 M268 760 v46 M284 760 v46 M226 796 l70 -30" />
            <path d="M320 760 v46 M336 760 v46" />
          </g>
          {/* macchia d'umidità */}
          <path d="M640 220 q20 120 -10 220 q40 -60 50 -220 z" fill="#0F1A1D" opacity=".5" />

          {/* finestra: cielo notturno con pioggia e lampo */}
          <rect x={WIN.x - 18} y={WIN.y - 18} width={WIN.w + 36} height={WIN.h + 36} rx="6" fill="#1A2629" stroke={K} strokeWidth="9" />
          <g clipPath="url(#ce-winclip)">
            <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="url(#ce-night)" />
            <path d={`M400 ${WIN.y + 150} Q470 ${WIN.y + 110} 540 ${WIN.y + 140} Q610 ${WIN.y + 100} 690 ${WIN.y + 150} V${WIN.y + WIN.h} H400 Z`} fill="#132A31" />
            <path d={rainPath(30, 9, 40, 10, 300, 300)} transform={`translate(${WIN.x + 40 - mod(t * 60, 60)} ${WIN.y - 300 + mod(t * 700, 300)})`} stroke="#9CC3CA" strokeWidth="3" opacity=".6" />
            <path d={rainPath(30, 9, 40, 10, 300, 300)} transform={`translate(${WIN.x + 40 - mod(t * 60, 60)} ${WIN.y + mod(t * 700, 300)})`} stroke="#9CC3CA" strokeWidth="3" opacity=".6" />
            <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="#EAF6FA" opacity={flash * 0.85} />
            <path d="M590 590 L562 664 L590 660 L555 760" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinejoin="round" opacity={flash} />
          </g>
          {BARS.map((x) => (
            <g key={x}>
              <path d={`M${x} ${WIN.y - 10} V${WIN.y + WIN.h + 10}`} stroke={K} strokeWidth="18" />
              <path d={`M${x - 5} ${WIN.y} V${WIN.y + WIN.h}`} stroke="#8FA8AC" strokeWidth="3" opacity=".7" />
            </g>
          ))}
          <path d={`M${WIN.x} ${WIN.y + WIN.h / 2} H${WIN.x + WIN.w}`} stroke={K} strokeWidth="16" />
          <rect x={WIN.x - 30} y={WIN.y + WIN.h + 12} width={WIN.w + 60} height="22" fill="#5D7174" stroke={K} strokeWidth="7" />
          <path d={`M${WIN.x - 24} ${WIN.y + WIN.h + 16} H${WIN.x + WIN.w + 24}`} stroke="#B9CDD0" strokeWidth="3" />
        </g>

        {/* PIANO 1 — pavimento, macchia di luce con l'ombra delle sbarre, pozzanghera (0,45) */}
        <g transform={L(0.45)}>
          <rect x="-200" y={FLOOR_Y} width="1480" height={1920 - FLOOR_Y + 200} fill="url(#ce-floor)" />
          <path d={`M-200 ${FLOOR_Y} H1280`} stroke={K} strokeWidth="9" />
          <g stroke="#0E171A" strokeWidth="5" opacity=".7">
            <path d="M540 1090 L540 2100 M340 1090 L-100 2100 M740 1090 L1180 2100 M140 1090 L-700 2100 M940 1090 L1780 2100" />
            <path d="M-200 1180 H1280 M-200 1320 H1280 M-200 1540 H1280 M-200 1860 H1280" />
          </g>
          {/* luce della luna sul pavimento + ombra delle sbarre */}
          <path d={`M${PATCH.tl} ${PATCH.top} L${PATCH.tr} ${PATCH.top} L${PATCH.br} ${PATCH.bottom} L${PATCH.bl} ${PATCH.bottom} Z`} fill="#CFE3E7" opacity={0.18 + breathe * 0.04 + flash * 0.5} />
          <g stroke={K} opacity={0.45 + flash * 0.45}>
            {BARS.map((x) => {
              const p = onPatch(x);
              return <path key={x} d={`M${p.top} ${PATCH.top} L${p.bottom} ${PATCH.bottom}`} strokeWidth={lerp(12, 22, 0.5)} />;
            })}
            <path d={`M${lerp(PATCH.tl, PATCH.bl, 0.5)} ${(PATCH.top + PATCH.bottom) / 2} L${lerp(PATCH.tr, PATCH.br, 0.5)} ${(PATCH.top + PATCH.bottom) / 2}`} strokeWidth="14" />
          </g>
          {/* tombino di scolo */}
          <g transform="translate(330 1640)">
            <ellipse cx="0" cy="0" rx="150" ry="40" fill="#0A1215" stroke="#3D5054" strokeWidth="8" />
            <path d="M-110 -18 H110 M-130 0 H130 M-110 18 H110" stroke="#33454A" strokeWidth="9" />
            <path d="M-120 -26 Q0 -44 120 -26" fill="none" stroke="#7C9497" strokeWidth="3" opacity=".6" />
          </g>
          {/* pozzanghera che riflette la finestra */}
          <ellipse cx="760" cy="1236" rx="130" ry="26" fill="#0D1A1E" />
          <ellipse cx="760" cy="1236" rx="130" ry="26" fill="none" stroke="#6E8C90" strokeWidth="3" opacity=".6" />
          <rect x="730" y="1222" width="40" height="18" fill="#9FC2C8" opacity={0.25 + flash * 0.6} />
        </g>

        {/* fascio di luce dalla finestra (0,4), sfuma a zero verso il basso */}
        <g transform={L(0.4)}>
          <path d={`M${WIN.x} ${WIN.y + WIN.h} L${WIN.x + WIN.w} ${WIN.y + WIN.h} L${PATCH.br + 20} ${PATCH.bottom} L${PATCH.bl - 20} ${PATCH.bottom} Z`} fill="url(#ce-shaft)" opacity={0.75 + breathe * 0.15 + flash * 0.8} />
          {/* pulviscolo nel fascio */}
          {DUST.map((d, i) => {
            const v = mod(d.v + t * d.sp, 1);
            const y = lerp(WIN.y + WIN.h, PATCH.bottom - 20, v);
            const x0 = lerp(WIN.x, PATCH.bl, v);
            const x1 = lerp(WIN.x + WIN.w, PATCH.br, v);
            const x = lerp(x0, x1, d.u) + Math.sin(t * 0.8 + d.ph) * 14;
            return <circle key={i} cx={x} cy={y} r={d.s} fill="#E9F0F2" opacity={(0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + d.ph)) + flash * 0.4) * Math.sin(v * Math.PI)} />;
          })}
        </g>

        {/* PIANO 2 — tubo, goccia, branda, scarpe, porta (0,65) */}
        <g transform={L(0.65)}>
          {/* tubo sul soffitto */}
          <rect x="-200" y="168" width="1480" height="54" fill="url(#ce-pipe)" stroke={K} strokeWidth="8" />
          <rect x="290" y="156" width="40" height="78" rx="6" fill="#4C6064" stroke={K} strokeWidth="6" />
          <rect x="740" y="156" width="40" height="78" rx="6" fill="#4C6064" stroke={K} strokeWidth="6" />
          <path d="M-200 180 H1280" stroke="#B5CACD" strokeWidth="3" opacity=".6" />
          {/* gocce che cadono dal tubo nella pozzanghera */}
          {[0, 1, 2].map((k) => {
            const period = 2.4;
            const p = mod(t + k * 0.8, period) / period;
            const fall = seg(p, 0.15, 0.55);
            const y = lerp(226, 1228, fall * fall);
            const rip = seg(p, 0.55, 1);
            return (
              <g key={k}>
                {fall > 0 && fall < 1 && <ellipse cx="760" cy={y} rx="6" ry="10" fill="#B9D6DB" opacity=".85" />}
                {p < 0.15 && <ellipse cx="760" cy="230" rx={3 + p * 25} ry={4 + p * 35} fill="#B9D6DB" opacity=".8" />}
                {rip > 0 && <ellipse cx="760" cy="1236" rx={10 + rip * 110} ry={2 + rip * 20} fill="none" stroke="#B9D6DB" strokeWidth="3" opacity={(1 - rip) * 0.8} />}
              </g>
            );
          })}

          {/* porta d'acciaio chiusa */}
          <rect x="790" y="560" width="300" height="540" rx="6" fill="url(#ce-door)" stroke={K} strokeWidth="10" />
          <path d="M796 566 V1094" stroke="#B5C8C8" strokeWidth="4" opacity=".7" />
          <rect x="850" y="620" width="170" height="104" rx="6" fill="#132026" stroke={K} strokeWidth="8" />
          <path d="M893 620 V724 M936 620 V724 M979 620 V724" stroke={K} strokeWidth="9" />
          {[600, 760, 920, 1060].map((y) => (
            <g key={y}>
              <circle cx="820" cy={y} r="7" fill="#1A2629" />
              <circle cx="1060" cy={y} r="7" fill="#1A2629" />
            </g>
          ))}
          <path d="M790 820 H1090" stroke={K} strokeWidth="6" opacity=".6" />
          {/* lucchetto */}
          <g transform={`rotate(${lockRot} 840 870)`}>
            <path d="M816 900 v-34 a24 24 0 0 1 48 0 v34" fill="none" stroke="#202C30" strokeWidth="11" />
            <rect x="804" y="894" width="72" height="66" rx="12" fill="url(#ce-brass)" stroke={K} strokeWidth="8" />
            <circle cx="840" cy="922" r="8" fill={K} />
            <path d="M840 926 V944" stroke={K} strokeWidth="6" />
            <path d="M812 902 h20" stroke="#FFF5CF" strokeWidth="4" strokeLinecap="round" opacity=".9" />
          </g>

          {/* ombra della branda */}
          <ellipse cx="300" cy="1214" rx="300" ry="34" fill="url(#ce-shadow)" />
          {/* branda */}
          <path d="M70 1030 V1206 M530 1030 V1206" stroke={K} strokeWidth="18" strokeLinecap="round" />
          <path d="M70 1030 V870" stroke={K} strokeWidth="14" strokeLinecap="round" />
          <rect x="60" y="1018" width="480" height="30" rx="6" fill="#33454A" stroke={K} strokeWidth="9" />
          <rect x="70" y="962" width="460" height="64" rx="18" fill="url(#ce-mattress)" stroke={K} strokeWidth="9" />
          <path d="M120 972 V1016 M190 972 V1016 M260 972 V1016 M330 972 V1016 M400 972 V1016 M470 972 V1016" stroke="#7E8E8B" strokeWidth="4" opacity=".7" />
          <path d="M84 966 H516" stroke="#EEF5F4" strokeWidth="4" opacity=".75" />
          <rect x="90" y="924" width="150" height="54" rx="22" fill="#D6DFDD" stroke={K} strokeWidth="8" />
          {/* coperta piegata ai piedi */}
          <rect x="380" y="936" width="140" height="42" rx="10" fill="url(#ce-blanket)" stroke={K} strokeWidth="8" />
          <path d="M386 956 H514" stroke="#2C4246" strokeWidth="4" />
          {/* buio sotto la branda: le scarpe si leggono «sotto il letto», non davanti */}
          <path d="M80 1048 H520 L526 1208 H74 Z" fill="#04080A" opacity=".55" />
          <path d="M80 1050 H520" stroke="#04080A" strokeWidth="14" opacity=".5" />
          {/* scarpe sotto la branda */}
          <ellipse cx="300" cy="1196" rx={150 * (0.6 + shoeGlow * 0.5)} ry="34" fill="url(#ce-shoe)" opacity={0.25 + shoeGlow * 0.6} />
          <g transform={`translate(300 1196) scale(${lerp(0.94, 1, sp) * (1 + Math.sin(t * 3) * 0.006)}) translate(-300 -1196)`}>
            <path d="M190 1196 h92 q28 0 28 -26 v-6 h-74 q-12 -22 -46 -14 z" fill={P.accento} stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <path d="M318 1204 h92 q28 0 28 -26 v-6 h-74 q-12 -22 -46 -14 z" fill={P.accento} stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <path d="M200 1176 q16 -8 30 -4 M328 1184 q16 -8 30 -4" stroke="#FFC9A8" strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
          {/* tazza di latta */}
          <g transform="translate(650 1180)">
            <path d="M-26 -50 H26 L22 0 H-22 Z" fill="#8FA2A5" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <path d="M26 -40 q22 4 18 22 q-4 12 -20 10" fill="none" stroke={K} strokeWidth="6" />
            <path d="M-18 -44 V-6" stroke="#E2ECEE" strokeWidth="4" opacity=".8" />
          </g>
        </g>

        {/* lampo che illumina la stanza intera */}
        <rect x="-200" y="-200" width="1480" height="2400" fill="#CFE7F0" opacity={flash * 0.16} />

        {/* PIANO 3 — sbarre, catena e secchio in primo piano (1,25) */}
        <g transform={L(1.25)}>
          {/* catena che pende dall'alto a sinistra */}
          <g transform={`rotate(${Math.sin(t * 0.9) * 2} 930 -100)`}>
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse key={i} cx="930" cy={-60 + i * 56} rx={i % 2 ? 9 : 18} ry="32" fill="none" stroke="#1C282C" strokeWidth="11" />
            ))}
            <ellipse cx="930" cy={-60 + 6 * 56} rx="18" ry="32" fill="none" stroke="#8FA4A7" strokeWidth="3" opacity=".6" />
          </g>
          {/* sbarre della cella ai bordi */}
          {[-40, 60, 1010, 1110].map((x) => (
            <g key={x}>
              <rect x={x} y="-200" width="54" height="2400" fill="url(#ce-iron)" stroke={K} strokeWidth="9" />
              <path d={`M${x + 16} -200 V2200`} stroke="#9DB5B9" strokeWidth="4" opacity=".55" />
            </g>
          ))}
          <rect x="-60" y="1660" width="260" height="46" fill="url(#ce-iron)" stroke={K} strokeWidth="9" />
          <rect x="960" y="1660" width="200" height="46" fill="url(#ce-iron)" stroke={K} strokeWidth="9" />
          {/* secchio */}
          <g transform="translate(820 1800)">
            <ellipse cx="0" cy="130" rx="190" ry="30" fill="#000" opacity=".35" />
            <path d="M-150 -110 H150 L120 130 H-120 Z" fill="url(#ce-bucket)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
            <ellipse cx="0" cy="-110" rx="150" ry="28" fill="#2B3A3D" stroke={K} strokeWidth="10" />
            <path d="M-150 -110 Q0 -300 150 -110" fill="none" stroke={K} strokeWidth="9" />
            <path d="M-136 -40 H136 M-128 40 H128" stroke={K} strokeWidth="6" opacity=".7" />
            <path d="M-90 -90 L-74 110" stroke="#F1F6F7" strokeWidth="8" strokeLinecap="round" opacity={0.6 + flash * 0.4} />
          </g>
        </g>

        {/* PIANO 4 — pulviscolo vicino alla camera (1,7) */}
        <g transform={L(1.7)}>
          {NEAR.map((n, i) => (
            <circle key={i} cx={n.x + Math.sin(t * 0.4 + n.ph) * 60} cy={n.y - mod(t * 18 + i * 90, 400) + 200} r={n.rad} fill="url(#ce-dust)" opacity={0.1 + flash * 0.1} />
          ))}
        </g>
      </g>

      <Finish id="ce" tint="#0E3A40" tintOpacity={0.13} />
    </svg>
  );
};
