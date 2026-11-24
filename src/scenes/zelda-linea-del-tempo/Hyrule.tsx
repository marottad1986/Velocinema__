import React from 'react';
import { eo, lerp, mod, rng } from '../../lib/anim';
import { Clouds, Fire, Fireflies, Flyers, Fog, Glow, Gulls, Reflection, Smoke, SunRays, Embers } from '../../lib/elements';
import { INK, Spada } from './Schema';

// Hyrule a tutto schermo (coordinate locali 1080×1920): cielo profondo con il sole e i raggi, nuvole a due piani,
// montagne innevate lontane, colline con boschi, il castello grande sulla collina (pietra a corsi, torri a cono blu,
// stendardi, finestre accese), il borgo con i comignoli che fumano, il fiume con i riflessi e il ponte, il tempio con la
// spada nel piedistallo; davanti il prato fiorito con l'erba alta che esce dai bordi. Si scurisce in rosso quando Ganondorf
// conquista il regno (braci, fuochi sulle mura), si scalda all'alba della vittoria.

export type Par = (f: number) => string;
const r0 = rng(77);
const TREES = Array.from({ length: 38 }, (_, i) => ({ x: (i * 97 + r0() * 60) % 1080, y: 1060 + r0() * 90, r: 14 + r0() * 14, k: r0() }));
const FLOW = Array.from({ length: 90 }, () => ({ x: r0() * 1080, y: 1240 + r0() * 680, c: ['#FFF6E8', '#F6A8C4', '#F7D04A', '#9CCBF2', '#C8A0F0'][Math.floor(r0() * 5)], s: 3 + r0() * 4 }));
const GRASS = Array.from({ length: 120 }, () => ({ x: r0() * 1080, y: 1230 + r0() * 690, h: 14 + r0() * 26, ph: r0() * 6 }));

/** Castello grande dettagliato: muro di cinta merlato, quattro torri e il mastio, pietra a corsi, stendardi, finestre. */
export const CastelloGrande: React.FC<{ T: number; x: number; y: number; s?: number; dark?: number; sil?: string; id: string; fires?: number }> = ({ T, x, y, s = 1, dark = 0, sil, id, fires = 0 }) => {
  const lit = dark > 0.5 ? '#FF6A3A' : '#FFD970';
  const ln = sil ?? INK;
  const wall = sil ?? `url(#${id}-w)`;
  const wallD = sil ?? `url(#${id}-wd)`;
  const roof = sil ?? `url(#${id}-r)`;
  const bricks = (bx: number, by: number, w: number, h: number, k: string) =>
    !sil && (
      <g opacity=".35" key={k}>
        {Array.from({ length: Math.floor(h / 16) }, (_, i) => (
          <g key={i}>
            <path d={`M${bx + 3} ${by + 16 * (i + 1)} H${bx + w - 3}`} stroke="#9A8A70" strokeWidth="1.5" />
            {Array.from({ length: Math.floor(w / 26) }, (_, j) => <path key={j} d={`M${bx + 13 * (i % 2) + 26 * j + 8} ${by + 16 * i} v16`} stroke="#9A8A70" strokeWidth="1.5" />)}
          </g>
        ))}
      </g>
    );
  const tower = (tx: number, ty: number, w: number, h: number, i: number, banner = true) => (
    <g key={i}>
      <rect x={tx - w / 2} y={ty} width={w} height={h} fill={i % 2 ? wall : wallD} stroke={ln} strokeWidth="6" />
      {bricks(tx - w / 2, ty, w, h, `b${i}`)}
      {!sil && <rect x={tx - w / 2} y={ty} width={w * 0.28} height={h} fill="#FFFFFF" opacity=".18" />}
      {/* ballatoio merlato */}
      <rect x={tx - w / 2 - 8} y={ty - 6} width={w + 16} height="16" fill={wall} stroke={ln} strokeWidth="5" />
      <path d={`M${tx - w / 2 - 12} ${ty} L${tx} ${ty - w * 1.7} L${tx + w / 2 + 12} ${ty} Z`} fill={roof} stroke={ln} strokeWidth="6" strokeLinejoin="round" />
      {!sil && <path d={`M${tx - w * 0.15} ${ty - w * 1.45} L${tx - w / 2 - 4} ${ty - 2}`} stroke="#9CC4F2" strokeWidth="4" opacity=".7" />}
      {!sil && banner && (
        <g>
          <path d={`M${tx} ${ty - w * 1.7} V${ty - w * 1.7 - 46}`} stroke={INK} strokeWidth="4" />
          <path d={`M${tx} ${ty - w * 1.7 - 46} q18 ${4 + Math.sin(T * 5 + i) * 6} 40 ${2 + Math.sin(T * 5 + i + 1) * 8} l-6 10 l6 10 q-22 ${Math.sin(T * 5 + i) * 6} -40 0 Z`} fill={dark > 0.5 ? '#3A1028' : '#E8553F'} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        </g>
      )}
      {/* finestre */}
      {[0.22, 0.52].map((f, k) => (
        <g key={k}>
          {!sil && <Glow id={`${id}-g${i}${k}`} x={tx} y={ty + h * f + 14} r={30} t={T} color={lit} amp={0.12} rate={2 + i} opacity={0.6} />}
          <path d={`M${tx - 9} ${ty + h * f + 28} V${ty + h * f + 8} Q${tx} ${ty + h * f - 2} ${tx + 9} ${ty + h * f + 8} V${ty + h * f + 28} Z`} fill={sil ? '#FF6A3A' : lit} stroke={sil ? 'none' : INK} strokeWidth="3" opacity={sil ? 0.8 : 1} />
        </g>
      ))}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
      {!sil && (
        <defs>
          <linearGradient id={`${id}-w`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#F6EEDA" /><stop offset="1" stopColor="#CFC0A0" /></linearGradient>
          <linearGradient id={`${id}-wd`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E2D6BA" /><stop offset="1" stopColor="#B4A486" /></linearGradient>
          <linearGradient id={`${id}-r`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5A8AD8" /><stop offset=".55" stopColor="#3A64B0" /><stop offset="1" stopColor="#24427A" /></linearGradient>
        </defs>
      )}
      {!sil && <Glow id={`${id}-halo`} x={x} y={y - 140} r={330} t={T} color={dark > 0.5 ? '#E8503A' : '#FFF4C8'} amp={0.05} rate={1.2} opacity={0.35} />}
      {/* muro di cinta con i merli */}
      <rect x={x - 230} y={y - 70} width="460" height="130" fill={wall} stroke={ln} strokeWidth="6" />
      {bricks(x - 230, y - 70, 460, 130, 'mura')}
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={x - 230 + i * 29} y={y - 88} width="17" height="20" fill={wall} stroke={ln} strokeWidth="4" />)}
      {tower(x - 230, y - 150, 58, 210, 1)}
      {tower(x + 230, y - 150, 58, 210, 2)}
      {tower(x - 110, y - 250, 66, 200, 3)}
      {tower(x + 110, y - 250, 66, 200, 4)}
      {tower(x, y - 360, 90, 300, 5)}
      {/* portone con la grata */}
      {!sil && (
        <g>
          <path d={`M${x - 40} ${y + 60} V${y + 4} Q${x} ${y - 36} ${x + 40} ${y + 4} V${y + 60} Z`} fill="#4A2E1A" stroke={INK} strokeWidth="5" />
          {[-24, -8, 8, 24].map((dx) => <path key={dx} d={`M${x + dx} ${y - 14 + Math.abs(dx) * 0.5} V${y + 60}`} stroke="#2A1A10" strokeWidth="3" />)}
        </g>
      )}
      {fires > 0 && [[-170, -90], [150, -100], [-40, -380]].map(([dx, dy], i) => (
        <g key={i} opacity={fires}><Fire id={`${id}-f${i}`} t={T + i} x={x + dx} y={y + dy} scale={0.5 * fires} outline={INK} /></g>
      ))}
    </g>
  );
};

export const ArtHyrule: React.FC<{ T: number; par: Par; dark: number; open: number; pulled: number; dawn: number }> = ({ T, par, dark, open, pulled, dawn }) => {
  const tx = 220, ty = 1150; // il tempio
  return (
    <g>
      <defs>
        <linearGradient id="hy-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2E6AB8" /><stop offset=".3" stopColor="#5E9EDC" /><stop offset=".55" stopColor="#A8D6EE" /><stop offset=".62" stopColor="#E6F2EA" />
        </linearGradient>
        <linearGradient id="hy-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A0618" /><stop offset=".35" stopColor="#5A1430" /><stop offset=".6" stopColor="#B8402E" /><stop offset=".7" stopColor="#E8803A" stopOpacity=".9" /><stop offset="1" stopColor="#E8803A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hy-mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7C9CC8" /><stop offset="1" stopColor="#B8CCE0" /></linearGradient>
        <linearGradient id="hy-mt2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5E86B4" /><stop offset="1" stopColor="#9AB8D2" /></linearGradient>
        <linearGradient id="hy-hill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7CC25A" /><stop offset=".6" stopColor="#5AA048" /><stop offset="1" stopColor="#3E7E3A" /></linearGradient>
        <linearGradient id="hy-mead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#86C860" /><stop offset=".4" stopColor="#5E9E46" /><stop offset="1" stopColor="#2C5E2C" /></linearGradient>
        <linearGradient id="hy-river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A8D8F2" /><stop offset="1" stopColor="#3E86C8" /></linearGradient>
        <linearGradient id="hy-stone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#F0E6CE" /><stop offset="1" stopColor="#B8A888" /></linearGradient>
        <linearGradient id="hy-roof" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E0704A" /><stop offset="1" stopColor="#A8442E" /></linearGradient>
      </defs>
      {/* ---- cielo */}
      <g transform={par(0.15)}>
        <rect x="-300" y="-200" width="1680" height="1400" fill="url(#hy-sky)" />
        <rect x="-300" y="-200" width="1680" height="1400" fill="url(#hy-red)" opacity={dark} />
        <SunRays id="hy-rays" x={860} y={520} t={T} color={dark > 0.5 ? '#FF9A6A' : '#FFF2B0'} n={11} length={900} width={60} opacity={0.35 * (1 - 0.6 * dark)} />
        <Glow id="hy-sun" x={860} y={520} r={260} t={T} color={dark > 0.5 ? '#FF7A4A' : '#FFF4C0'} amp={0.06} rate={1.1} opacity={0.75} />
        <circle cx="860" cy="520" r="54" fill={dark > 0.5 ? '#FFB080' : '#FFFBE6'} />
        <Clouds id="hy-cl1" t={T} color={dark > 0.5 ? '#7A3048' : '#FFFFFF'} seed={23} n={4} y={560} h={120} opacity={0.55} speed={0.15} />
      </g>
      <g transform={par(0.25)}>
        {/* nuvole vicine, a cumulo, con l'ombra sotto */}
        {[[150, 760, 1], [700, 700, 0.8], [1000, 800, 0.7]].map(([cx, cy, k], i) => (
          <g key={i} transform={`translate(${cx + Math.sin(T * 0.2 + i) * 20} ${cy}) scale(${k})`} opacity={0.95}>
            {[[-90, 10, 60], [-30, -24, 80], [50, -10, 70], [110, 16, 52], [10, 24, 66]].map(([dx, dy, rr], j) => <circle key={j} cx={dx} cy={dy} r={rr} fill={dark > 0.5 ? '#6A2A40' : '#FFFFFF'} />)}
            <path d="M-150 30 Q0 70 160 30 Q120 72 0 78 Q-120 72 -150 30 Z" fill={dark > 0.5 ? '#3A1428' : '#C8DCEE'} />
          </g>
        ))}
        <Gulls t={T} seed={4} n={4} y={650} h={110} color={INK} size={0.8} period={16} />
      </g>
      {/* ---- montagne lontane */}
      <g transform={par(0.35)}>
        <path d="M-200 1080 L60 860 L180 960 L330 800 L470 940 L560 870 L700 990 L860 830 L1000 950 L1280 880 V1200 H-200 Z" fill="url(#hy-mt)" opacity=".85" />
        <path d="M310 818 L330 800 L352 820 L338 816 Z M840 848 L860 830 L884 852 L866 846 Z M40 878 L60 860 L82 880 L66 874 Z" fill="#FFFFFF" />
        <path d="M-200 1120 L120 980 L260 1050 L420 960 L600 1060 L820 980 L1280 1060 V1200 H-200 Z" fill="url(#hy-mt2)" />
        <Fog id="hy-fog1" t={T} y={1080} x={540} rx={760} ry={50} color="#E8F2F0" opacity={0.6} />
      </g>
      {/* ---- colline con i boschi */}
      <g transform={par(0.5)}>
        <path d="M-200 1150 Q150 1060 420 1110 Q620 1150 760 1060 Q920 980 1280 1060 V1400 H-200 Z" fill="url(#hy-hill)" stroke={INK} strokeWidth="6" />
        {TREES.map((tr, i) => (
          <g key={i}>
            <path d={`M${tr.x} ${tr.y + tr.r} v14`} stroke="#4A3020" strokeWidth="5" />
            <circle cx={tr.x} cy={tr.y} r={tr.r} fill={dark > 0.5 ? '#3A4A38' : tr.k > 0.5 ? '#3E8A40' : '#2E7438'} stroke={INK} strokeWidth="4" />
            <circle cx={tr.x - tr.r * 0.3} cy={tr.y - tr.r * 0.3} r={tr.r * 0.45} fill="#7CC05A" opacity={dark > 0.5 ? 0.2 : 0.75} />
          </g>
        ))}
      </g>
      {/* ---- il castello sulla collina */}
      <g transform={par(0.6)}>
        <path d="M480 1110 Q700 940 1000 1020 L1080 1180 H440 Z" fill="url(#hy-hill)" stroke={INK} strokeWidth="6" />
        <CastelloGrande T={T} x={740} y={1010} s={0.95} dark={dark} id="hy-c" fires={eo(dark)} />
        {dark > 0.3 && <Smoke id="hy-smk" t={T} x={740} y={700} color="#3A1A24" n={8} rise={300} wind={-160} r0={30} r1={110} speed={0.2} opacity={0.6 * dark} />}
        {dark > 0.3 && <Embers t={T} x={740} y={1000} w={420} h={600} n={30} />}
      </g>
      {/* ---- il borgo, il fiume, il ponte */}
      <g transform={par(0.72)}>
        <path d="M1080 1150 Q860 1180 760 1220 Q620 1270 560 1330 Q480 1420 300 1460 Q120 1500 -40 1600 V1680 Q160 1580 340 1530 Q560 1480 640 1380 Q720 1300 860 1250 Q960 1220 1080 1210 Z" fill="url(#hy-river)" stroke={INK} strokeWidth="5" />
        <Reflection t={T} x={620} y={1290} color="#FFFFFF" n={6} w={60} gap={22} opacity={0.6} />
        <Reflection t={T + 2} x={300} y={1480} color="#FFFFFF" n={5} w={70} gap={20} opacity={0.5} />
        {/* ponte di pietra ad arco */}
        <path d="M590 1300 Q650 1250 720 1286 L716 1312 Q650 1284 596 1326 Z" fill="url(#hy-stone)" stroke={INK} strokeWidth="5" />
        {[[880, 1170], [950, 1185], [1020, 1160], [380, 1190]].map(([hx, hy], i) => (
          <g key={i}>
            <rect x={hx - 26} y={hy - 30} width="52" height="38" fill="url(#hy-stone)" stroke={INK} strokeWidth="4" />
            <path d={`M${hx - 34} ${hy - 28} L${hx} ${hy - 58} L${hx + 34} ${hy - 28} Z`} fill={dark > 0.5 ? '#6A2A2A' : 'url(#hy-roof)'} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
            <rect x={hx + 12} y={hy - 56} width="9" height="16" fill="#8A6A50" stroke={INK} strokeWidth="2.5" />
            <rect x={hx - 8} y={hy - 18} width="12" height="14" fill={dark > 0.5 ? '#FF6A3A' : '#FFD970'} stroke={INK} strokeWidth="2" />
            <Smoke id={`hy-ch${i}`} t={T + i * 1.7} x={hx + 16} y={hy - 60} color="#E8E8F0" n={5} rise={90} wind={40} r0={6} r1={22} speed={0.25} opacity={0.5} />
          </g>
        ))}
      </g>
      {/* ---- il tempio con la spada nel piedistallo */}
      <g transform={par(0.8)}>
        <Glow id="hy-tg" x={tx} y={ty + 20} r={160} t={T} color="#FFF0A0" amp={0.1} rate={2} opacity={0.3 + 0.5 * open} />
        <path d={`M${tx - 150} ${ty + 80} H${tx + 150} L${tx + 140} ${ty + 60} H${tx - 140} Z`} fill="#A89A80" stroke={INK} strokeWidth="5" />
        <rect x={tx - 125} y={ty - 60} width="250" height="125" fill="url(#hy-stone)" stroke={INK} strokeWidth="6" />
        <path d={`M${tx - 150} ${ty - 58} L${tx} ${ty - 150} L${tx + 150} ${ty - 58} Z`} fill="#D6C8A8" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        <path d={`M${tx - 120} ${ty - 66} L${tx} ${ty - 140} L${tx + 120} ${ty - 66}`} fill="none" stroke="#FFF6E0" strokeWidth="3" opacity=".7" />
        <circle cx={tx} cy={ty - 96} r="18" fill="#EDE2C8" stroke={INK} strokeWidth="4" />
        {[-96, -56, 56, 96].map((dx) => (
          <g key={dx}>
            <rect x={tx + dx - 11} y={ty - 54} width="22" height="116" fill="#F4ECD8" stroke={INK} strokeWidth="4" />
            <path d={`M${tx + dx - 4} ${ty - 50} V${ty + 58}`} stroke="#C8B898" strokeWidth="3" />
          </g>
        ))}
        <path d={`M${tx - 40} ${ty + 64} V${ty - 4} Q${tx} ${ty - 40} ${tx + 40} ${ty - 4} V${ty + 64} Z`} fill="#1E160E" stroke={INK} strokeWidth="5" />
        <Glow id="hy-tg2" x={tx} y={ty + 30} r={50} t={T} color="#FFF0A0" amp={0.15} rate={3} opacity={0.5 + 0.5 * open} />
        <rect x={tx - 16} y={ty + 42} width="32" height="20" fill="#A8A296" stroke={INK} strokeWidth="3" />
        <g transform={`translate(${tx} ${ty + 12 - 50 * eo(pulled)})`}><g transform="scale(.7) rotate(-22)"><Spada /></g></g>
        {/* i battenti che si aprono */}
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M${tx + sd * 40} ${ty + 64} V${ty - 4} Q${tx + sd * 20} ${ty - 30} ${tx} ${ty - 32} V${ty + 64} Z`} fill={sd < 0 ? '#7A5A3A' : '#6A4A2E'} stroke={INK} strokeWidth="4"
            transform={`translate(${tx + sd * 40} 0) scale(${1 - 0.85 * open} 1) translate(${-(tx + sd * 40)} 0)`} />
        ))}
        {/* l'edera */}
        <path d={`M${tx - 125} ${ty - 40} q20 30 0 60 q-16 30 8 60`} stroke="#3E8A40" strokeWidth="6" fill="none" />
        {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={tx - 120 + (i % 2) * 12} cy={ty - 30 + i * 30} rx="9" ry="6" fill="#5AA048" stroke={INK} strokeWidth="2" />)}
      </g>
      {/* ---- il prato davanti */}
      <g transform={par(0.95)}>
        <path d="M-200 1250 Q300 1200 560 1250 Q820 1300 1280 1240 V2100 H-200 Z" fill="url(#hy-mead)" />
        <path d="M-200 1250 Q300 1200 560 1250 Q820 1300 1280 1240" fill="none" stroke={INK} strokeWidth="5" />
        {/* il sentiero che scende dal castello */}
        <path d="M720 1080 Q640 1180 600 1260 Q560 1360 640 1500 Q720 1640 600 1920" fill="none" stroke="#EAD8A8" strokeWidth="46" strokeLinecap="round" />
        <path d="M720 1080 Q640 1180 600 1260 Q560 1360 640 1500 Q720 1640 600 1920" fill="none" stroke="#C8B07A" strokeWidth="4" strokeDasharray="10 18" />
        {GRASS.map((g, i) => (
          <path key={i} d={`M${g.x} ${g.y} q${3 + Math.sin(T * 2 + g.ph) * 3} ${-g.h * 0.6} ${2 + Math.sin(T * 2 + g.ph) * 6} ${-g.h}`} stroke={dark > 0.5 ? '#2A4030' : '#2E6A2E'} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        ))}
        {FLOW.map((f, i) => <circle key={i} cx={f.x} cy={f.y} r={f.s} fill={f.c} stroke={INK} strokeWidth="1.5" />)}
      </g>
      {/* ---- primo piano: erba alta e fiori che escono dai bordi */}
      <g transform={par(1.25)}>
        {[[-20, 1960, 1.6], [130, 1990, 1.2], [960, 1970, 1.5], [1100, 1930, 1.7]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            {[-40, -24, -10, 4, 18, 32].map((a, k) => (
              <path key={k} d={`M${a * 0.6} 0 Q${a * 0.9 + Math.sin(T * 1.6 + i + k) * 6} -90 ${a * 1.8 + Math.sin(T * 1.6 + i + k) * 12} ${-150 - (k % 3) * 40}`} stroke={k % 2 ? '#2E6A2E' : '#1E4E22'} strokeWidth="10" fill="none" strokeLinecap="round" />
            ))}
            <path d={`M10 0 Q16 -110 ${24 + Math.sin(T * 1.4 + i) * 8} -200`} stroke="#1E4E22" strokeWidth="5" fill="none" />
            <g transform={`translate(${24 + Math.sin(T * 1.4 + i) * 8} -206)`}>
              {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-11" rx="7" ry="11" fill={i % 2 ? '#F2A8C0' : '#FFF6E8'} stroke={INK} strokeWidth="2" transform={`rotate(${a})`} />)}
              <circle r="6" fill="#F2C230" stroke={INK} strokeWidth="2" />
            </g>
          </g>
        ))}
        <Flyers t={T} seed={8} n={5} color="#F6B8CC" outline={INK} w={14} h={18} y0={900} y1={1700} speed={0.06} shape="leaf" />
      </g>
      <Fireflies id="hy-ff" t={T} seed={12} n={10} x={0} y={1150} w={1080} h={500} color={dark > 0.5 ? '#FF9A5A' : '#FFF4B0'} />
      {dawn > 0 && <rect x="-300" y="-200" width="1680" height="2400" fill="#FFC870" opacity={0.16 * dawn} />}
    </g>
  );
};
