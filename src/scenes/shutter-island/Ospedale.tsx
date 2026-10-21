import React from 'react';
import { camera, eio, lerp, mod, rainPath, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';

// Ashecliffe: cancello dell'ospedale che si apre, torretta con faro di ricerca, recinzioni di notte.
// Piani: cielo e luna (0,2) · nubi e alberi lontani (0,3–0,4) · ospedale (0,55) · torretta, terreno e viale (0,6)
//        · cancello e recinzione (0,85) · pozzanghere e pali in primo piano (1,0–1,25) · pioggia e nebbia vicina (1,6–1,7)

const K = '#0A1418';
const GROUND_Y = 1110; // base dell'ospedale (orizzonte)
const GATE_Y = 1262; // base del cancello
const LAMP = { x: 214, y: 676 }; // faro di ricerca sulla torretta

const r = rng(1954);
const MOTES = Array.from({ length: 7 }, (_, i) => ({ y: 760 + r() * 1000, rad: 100 + r() * 120, speed: 24 + r() * 30, ph: i * 240 }));
const SPLASH = Array.from({ length: 14 }, () => ({ x: 120 + r() * 860, y: 1300 + r() * 520, ph: r(), sp: 0.9 + r() * 0.8 }));

// Finestre dell'ospedale: alcune si accendono una a una (tempi crescenti), altre restano buie
const WINDOWS = (() => {
  const out: { x: number; y: number; w: number; h: number; on: number }[] = [];
  const add = (x0: number, y0: number, cols: number, rows: number, dx: number, dy: number, w: number, h: number) => {
    for (let row = 0; row < rows; row++) for (let c = 0; c < cols; c++) out.push({ x: x0 + c * dx, y: y0 + row * dy, w, h, on: 99 });
  };
  add(276, 866, 4, 2, 50, 104, 28, 44); // ala sinistra
  add(498, 790, 3, 3, 66, 86, 34, 48); // padiglione centrale
  add(724, 866, 5, 2, 46, 104, 26, 44); // ala destra
  const order = out.map((_, i) => ({ i, k: r() })).sort((a, b) => a.k - b.k);
  order.slice(0, 15).forEach((o, n) => (out[o.i].on = 0.7 + n * 0.48));
  return out;
})();

// Foglia del cancello in pseudo-prospettiva: cardine fisso in hx, si apre verso l'interno di un angolo a (rad)
const leaf = (hx: number, dir: number, a: number) => {
  const W = 210;
  const N = 7;
  const pt = (u: number) => {
    const s = Math.sin(a) * u;
    return { x: hx + dir * W * u * Math.cos(a) / (1 + s * 0.35), top: 920 + 46 * s, bot: GATE_Y - 16 * s };
  };
  const e = pt(1);
  let bars = '';
  let tips = '';
  for (let i = 0; i <= N; i++) {
    const p = pt(i / N);
    bars += `M${p.x.toFixed(1)} ${p.top.toFixed(1)} V${p.bot.toFixed(1)} `;
    tips += `M${(p.x - 9).toFixed(1)} ${(p.top + 2).toFixed(1)} L${p.x.toFixed(1)} ${(p.top - 22).toFixed(1)} L${(p.x + 9).toFixed(1)} ${(p.top + 2).toFixed(1)} Z `;
  }
  const rail = (f: number) => `M${hx} ${lerp(920, GATE_Y, f)} L${e.x.toFixed(1)} ${lerp(e.top, e.bot, f).toFixed(1)}`;
  // ricciolo decorativo a metà foglia
  const m = pt(0.5);
  const curl = `M${pt(0.15).x.toFixed(1)} ${lerp(pt(0.15).top, pt(0.15).bot, 0.2).toFixed(1)} Q${m.x.toFixed(1)} ${(m.top + 10).toFixed(1)} ${pt(0.85).x.toFixed(1)} ${lerp(pt(0.85).top, pt(0.85).bot, 0.2).toFixed(1)}`;
  return { bars, tips, rails: `${rail(0.06)} ${rail(0.5)} ${rail(0.96)}`, curl, edge: e };
};

export const Ospedale: React.FC<SceneProps> = ({ t, dur, palette: P }) => {
  const cam = camera(t, dur, 540, 1040);
  const L = cam.layer;

  // Faro di ricerca: spazza avanti e indietro nella nebbia
  const theta = 17 + 21 * Math.sin(t * 0.72 - 0.9); // gradi, positivo = verso il basso
  const th = (theta * Math.PI) / 180;
  const hitX = theta > 8 ? LAMP.x + (GROUND_Y - LAMP.y) / Math.tan(th) : 2000;
  const hit = seg(theta, 12, 22) * (hitX < 1250 ? 1 : 0);

  // Lucchetto che scatta e cade, poi il cancello si apre
  const unlock = seg(t, 0.6, 0.85);
  const fall = seg(t, 1.0, 1.45);
  const lockY = lerp(1104, 1236, fall * fall) - Math.sin(seg(t, 1.45, 1.8) * Math.PI) * 14;
  const lockRot = fall * 70 + Math.sin(t * 7) * 6 * (1 - seg(t, 0.2, 1.0));
  const open = eio(seg(t, 1.5, 5.2));
  const a = open * 1.35;
  const lf = leaf(330, 1, a);
  const rt = leaf(750, -1, a);

  const lanternPulse = 0.5 + 0.5 * Math.sin(t * 2.4);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="os" />
        <Lin id="os-sky" stops={[[0, '#070F14'], [0.3, '#0F2129'], [0.5, '#1C3740'], [0.58, '#2A4A52'], [0.65, '#18303A']]} />
        <Lin id="os-ground" stops={[[0, '#22363A'], [0.3, '#172629'], [1, '#070E10']]} />
        <Lin id="os-path" stops={[[0, '#4B5E5F'], [0.5, '#2E3D3F'], [1, '#141E20']]} />
        <Lin id="os-brick" x2={1} y2={0} stops={[[0, '#3A302E'], [0.6, '#5C4A45'], [1, '#7E6860']]} />
        <Lin id="os-brick2" x2={1} y2={0} stops={[[0, '#4A3C38'], [0.5, '#6E5A53'], [1, '#93796F']]} />
        <Lin id="os-roof" stops={[[0, '#2B3B40'], [1, '#162227']]} />
        <Lin id="os-stone" x2={1} y2={0} stops={[[0, '#3B4A4B'], [0.55, '#6D7E7D'], [1, '#93A4A2']]} />
        <Lin id="os-beam" x2={1} y2={0} stops={[[0, '#FFF1C4', 0.75], [0.35, '#FFF1C4', 0.32], [1, '#FFF1C4', 0]]} />
        <Lin id="os-iron" x2={1} y2={0} stops={[[0, '#0E181B'], [0.4, '#33464A'], [1, '#0A1215']]} />
        <Lin id="os-post" x2={1} y2={0} stops={[[0, '#1C2A2D'], [0.6, '#4C5F61'], [1, '#6E8486']]} />
        <GlowGradient id="os-moon" color="#D6E7EA" core={0.5} mid={0.16} />
        <GlowGradient id="os-warm" color="#FFC45C" core={0.85} mid={0.28} />
        <GlowGradient id="os-white" color="#FFF4D0" core={0.9} mid={0.35} />
        <GlowGradient id="os-fog" color="#B9D2D6" core={1} mid={0.6} />
        <GlowGradient id="os-cloud" color="#1F3A44" core={1} mid={0.7} />
        <GlowGradient id="os-acc" color={P.accento} core={0.7} mid={0.22} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo con luna velata (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#os-sky)" />
          <circle cx="880" cy="560" r={240 + Math.sin(t * 1.1) * 12} fill="url(#os-moon)" />
          <circle cx="880" cy="560" r="54" fill="#E4EEF0" />
          <path d="M826 560 a54 54 0 0 0 108 0 a54 42 0 0 1 -108 0" fill="#B9CCD0" opacity=".6" />
          <circle cx="896" cy="546" r="10" fill="#C9D9DC" />
          <circle cx="864" cy="576" r="7" fill="#C9D9DC" />
        </g>

        {/* PIANO 1 — nubi che passano davanti alla luna (0,3) */}
        <g transform={L(0.3, mod(t * 26, 900) - 300)} opacity=".95">
          <ellipse cx="420" cy="560" rx="360" ry="70" fill="url(#os-cloud)" />
          <ellipse cx="1300" cy="620" rx="300" ry="60" fill="url(#os-cloud)" />
          <ellipse cx="-300" cy="600" rx="300" ry="60" fill="url(#os-cloud)" />
        </g>

        {/* PIANO 1b — alberi lontani senza contorno + nebbia lontana (0,4) */}
        <g transform={L(0.4)}>
          <path d="M-200 1110 V1010 L-150 940 L-110 1000 L-70 920 L-30 990 L10 900 L50 985 L90 950 L130 1010 L170 960 L210 1110 Z" fill="#11242A" />
          <path d="M860 1110 L900 980 L930 1020 L970 930 L1010 1000 L1050 940 L1090 990 L1130 920 L1170 980 L1280 960 V1110 Z" fill="#11242A" />
          <ellipse cx={540 + Math.sin(t * 0.3) * 80} cy="1080" rx="760" ry="70" fill="url(#os-fog)" opacity=".2" />
        </g>

        {/* PIANO 2 — l'ospedale (0,55) */}
        <g transform={L(0.55)}>
          {/* comignoli con fumo */}
          <rect x="300" y="740" width="30" height="60" fill="#3A302E" stroke={K} strokeWidth="5" />
          <rect x="880" y="740" width="30" height="60" fill="#3A302E" stroke={K} strokeWidth="5" />
          {Array.from({ length: 6 }, (_, i) => {
            const p = mod(t * 0.28 + i / 6, 1);
            return <circle key={i} cx={895 - p * 120} cy={730 - p * 150} r={18 + p * 50} fill="url(#os-fog)" opacity={seg(p, 0, 0.15) * (1 - p) * 0.45} />;
          })}
          {/* ali laterali con tetto a mansarda */}
          <path d="M240 822 L268 782 H470 V822 Z M700 822 V782 H930 L962 822 Z" fill="url(#os-roof)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          <rect x="250" y="820" width="222" height={GROUND_Y - 820} fill="url(#os-brick)" stroke={K} strokeWidth="6" />
          <rect x="698" y="820" width="256" height={GROUND_Y - 820} fill="url(#os-brick)" stroke={K} strokeWidth="6" />
          {/* padiglione centrale con frontone e cupola */}
          <rect x="470" y="740" width="230" height={GROUND_Y - 740} fill="url(#os-brick2)" stroke={K} strokeWidth="7" />
          <path d="M456 744 L585 668 L714 744 Z" fill="url(#os-roof)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <circle cx="585" cy="716" r="16" fill="#D9E3E2" stroke={K} strokeWidth="5" />
          <path d="M585 716 V706 M585 716 L592 720" stroke={K} strokeWidth="3" />
          <rect x="560" y="628" width="50" height="46" fill="url(#os-stone)" stroke={K} strokeWidth="5" />
          <path d="M552 630 Q585 586 618 630 Z" fill="#22323A" stroke={K} strokeWidth="5" strokeLinejoin="round" />
          <path d="M585 594 V574" stroke={K} strokeWidth="4" />
          {/* cornicioni e bordi illuminati dalla luna (a destra) */}
          <path d="M250 900 H472 M698 900 H954 M470 878 H700" stroke={K} strokeWidth="4" opacity=".55" />
          <path d="M268 784 H468 M702 784 H928 L958 820 M590 670 L710 742" fill="none" stroke="#B8CBCB" strokeWidth="3" opacity=".6" />
          <path d="M951 824 V1106 M697 744 V1106" stroke="#B9A79E" strokeWidth="3" opacity=".5" />
          {/* finestre che si accendono una a una */}
          {WINDOWS.map((w, i) => {
            const on = seg(t, w.on, w.on + 0.25);
            return (
              <g key={i}>
                <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="#1E2B33" stroke={K} strokeWidth="4" />
                {on > 0 && <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="#FFD25C" opacity={on} />}
                {on > 0 && <circle cx={w.x + w.w / 2} cy={w.y + w.h / 2} r={w.w * 1.6} fill="url(#os-warm)" opacity={on * (0.4 + 0.08 * Math.sin(t * 2 + i))} />}
                <path d={`M${w.x + w.w / 2} ${w.y} V${w.y + w.h} M${w.x} ${w.y + w.h / 2} H${w.x + w.w}`} stroke={K} strokeWidth="2.5" opacity=".8" />
              </g>
            );
          })}
          {/* portone illuminato */}
          <path d={`M562 ${GROUND_Y} V1062 a23 23 0 0 1 46 0 V${GROUND_Y} Z`} fill="#FFD25C" stroke={K} strokeWidth="5" />
          <circle cx="585" cy="1080" r={70 + Math.sin(t * 1.7) * 5} fill="url(#os-warm)" opacity=".5" />
          <path d={`M548 ${GROUND_Y} H622`} stroke={K} strokeWidth="6" />
        </g>

        {/* PIANO 3 — terreno, viale e torretta di guardia con faro (0,6) */}
        <g transform={L(0.6)}>
          <rect x="-200" y={GROUND_Y - 6} width="1480" height="1100" fill="url(#os-ground)" />
          <path d={`M556 ${GROUND_Y} H614 L760 1500 L900 2100 H180 L320 1500 Z`} fill="url(#os-path)" />
          <path d={`M556 ${GROUND_Y} L320 1500 M614 ${GROUND_Y} L760 1500`} stroke="#0C1517" strokeWidth="4" opacity=".6" />
          {/* riflesso bagnato del portone sul viale */}
          {Array.from({ length: 6 }, (_, i) => {
            const w = (40 - i * 5) * (0.6 + 0.4 * Math.sin(t * 3 + i * 1.9));
            return <rect key={i} x={585 - w / 2} y={1124 + i * 16} width={w} height="4" rx="2" fill="#FFD25C" opacity={0.45 - i * 0.06} />;
          })}
          {/* macchia del faro sul terreno */}
          <ellipse cx={hitX} cy={GROUND_Y + 30} rx="150" ry="34" fill="url(#os-white)" opacity={hit * 0.55} />

          {/* fascio del faro che attraversa la nebbia */}
          <g transform={`translate(${LAMP.x} ${LAMP.y}) rotate(${theta})`}>
            <path d="M0 -10 L1300 -150 L1300 150 L0 10 Z" fill="url(#os-beam)" />
            {[0, 1, 2, 3, 4].map((k) => {
              const x = mod(k * 260 + t * 55, 1300);
              return <ellipse key={k} cx={x} cy={Math.sin(t * 0.8 + k) * 20} rx={70 + x * 0.06} ry={26 + x * 0.05} fill="url(#os-fog)" opacity={0.22 * (1 - x / 1300)} />;
            })}
          </g>

          {/* torretta */}
          <path d="M70 1170 L96 720 H186 L212 1170 Z" fill="url(#os-stone)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M84 900 H200 M78 1040 H206" stroke={K} strokeWidth="4" opacity=".5" />
          <path d="M184 724 L208 1166" stroke="#C3D2D0" strokeWidth="4" opacity=".55" />
          <rect x="128" y="1080" width="30" height="90" fill="#141E22" stroke={K} strokeWidth="5" />
          <rect x="52" y="646" width="178" height="80" fill="#2A3A3F" stroke={K} strokeWidth="8" />
          <rect x="68" y="660" width="40" height="40" fill="#FFD25C" stroke={K} strokeWidth="5" />
          <rect x="120" y="660" width="40" height="40" fill="#1E2B33" stroke={K} strokeWidth="5" />
          <circle cx="88" cy="680" r="60" fill="url(#os-warm)" opacity=".35" />
          <path d="M36 650 L141 596 L246 650 Z" fill="#162227" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M141 598 L240 648" stroke="#B8CBCB" strokeWidth="3" opacity=".6" />
          <path d="M44 726 H238" stroke={K} strokeWidth="10" />
          {/* proiettore */}
          <g transform={`rotate(${theta} ${LAMP.x} ${LAMP.y})`}>
            <rect x={LAMP.x - 30} y={LAMP.y - 20} width="44" height="40" rx="6" fill="#3D4F54" stroke={K} strokeWidth="6" />
            <rect x={LAMP.x + 10} y={LAMP.y - 22} width="10" height="44" fill="#FFF4D0" stroke={K} strokeWidth="4" />
          </g>
          <circle cx={LAMP.x + 14} cy={LAMP.y} r={80 + Math.sin(t * 3) * 6} fill="url(#os-white)" opacity=".8" />
        </g>

        {/* nebbia media sulla base dell'ospedale (0,7) */}
        <g transform={L(0.7, Math.sin(t * 0.35 + 2) * -90)}>
          <ellipse cx="540" cy="1150" rx="800" ry="60" fill="url(#os-fog)" opacity=".26" />
        </g>

        {/* pioggia lontana, sottile e lenta (0,75) */}
        <g transform={L(0.75)} stroke="#8FB4BA" strokeWidth="2" opacity=".35">
          <path d={rainPath(110, 31, 30, 6, 1300, 2000)} transform={`translate(0 ${mod(t * 520, 2000) - 2000})`} />
          <path d={rainPath(110, 31, 30, 6, 1300, 2000)} transform={`translate(0 ${mod(t * 520, 2000)})`} />
        </g>

        {/* PIANO 4 — cancello e recinzione con filo spinato (0,85) */}
        <g transform={L(0.85)}>
          {/* recinzione a maglie ai lati */}
          {[-1, 1].map((s) => {
            const x0 = s < 0 ? -200 : 830;
            const x1 = s < 0 ? 250 : 1280;
            let mesh = '';
            for (let x = x0; x < x1; x += 36) mesh += `M${x} 1000 l${-40} 262 M${x} 1000 l40 262 `;
            return (
              <g key={s}>
                <path d={mesh} stroke="#2E4246" strokeWidth="2.5" opacity=".7" />
                <path d={`M${x0} 1000 H${x1} M${x0} ${GATE_Y} H${x1}`} stroke={K} strokeWidth="6" />
                {(s < 0 ? [-60, 80, 210] : [880, 1010, 1140]).map((px) => (
                  <g key={px}>
                    <path d={`M${px} 960 V${GATE_Y + 6}`} stroke={K} strokeWidth="10" />
                    <path d={`M${px} 966 l${s * -26} -26`} stroke={K} strokeWidth="6" />
                  </g>
                ))}
                {/* spirale di filo spinato */}
                {Array.from({ length: 13 }, (_, i) => (
                  <ellipse key={i} cx={x0 + 20 + i * 36} cy="968" rx="24" ry="20" fill="none" stroke="#1A272A" strokeWidth="4" />
                ))}
              </g>
            );
          })}

          {/* foglie del cancello che si aprono */}
          {[lf, rt].map((g, i) => (
            <g key={i} fill="none" stroke={K} strokeLinecap="round">
              <path d={g.bars} strokeWidth="8" />
              <path d={g.rails} strokeWidth="10" />
              <path d={g.curl} strokeWidth="6" />
              <path d={g.tips} fill="#1A272A" strokeWidth="3" />
            </g>
          ))}
          {/* luce della luna sulle sbarre (sottile, lato destro) */}
          <path d={lf.bars} transform="translate(3 0)" stroke="#8FA8AC" strokeWidth="2" opacity=".35" />

          {/* lucchetto arancione: scatta e cade a terra */}
          <circle cx="540" cy={lockY + 18} r={60 + Math.sin(t * 3) * 5} fill="url(#os-acc)" opacity={0.5 - fall * 0.2} />
          <g transform={`rotate(${lockRot} 540 ${lockY})`}>
            <path d={`M524 ${lockY + 6} v-${20 + unlock * 14} a16 16 0 0 1 32 0 v${unlock > 0.5 ? -4 : 20}`} fill="none" stroke="#1A262A" strokeWidth="8" />
            <rect x="516" y={lockY + 2} width="48" height="42" rx="9" fill={P.accento} stroke={K} strokeWidth="6" />
            <circle cx="540" cy={lockY + 20} r="5" fill={K} />
            <path d={`M522 ${lockY + 9} h14`} stroke="#FFC9A8" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* pilastri con lanterne */}
          {[250, 750].map((x) => (
            <g key={x}>
              <rect x={x} y="840" width="80" height={GATE_Y - 834} fill="url(#os-stone)" stroke={K} strokeWidth="9" />
              <rect x={x - 12} y="816" width="104" height="30" fill="#566868" stroke={K} strokeWidth="8" />
              <path d={`M${x + 8} 920 H${x + 72} M${x + 8} 1020 H${x + 72} M${x + 8} 1120 H${x + 72}`} stroke={K} strokeWidth="4" opacity=".45" />
              <path d={`M${x + 70} 850 V${GATE_Y - 6}`} stroke="#C3D2D0" strokeWidth="4" opacity=".5" />
              <circle cx={x + 40} cy="784" r={90 + lanternPulse * 14} fill="url(#os-warm)" opacity={0.5 + lanternPulse * 0.15} />
              <rect x={x + 22} y="760" width="36" height="50" rx="6" fill="#FFE7A0" stroke={K} strokeWidth="6" />
              <path d={`M${x + 16} 762 L${x + 40} 740 L${x + 64} 762 Z`} fill={K} />
              <path d={`M${x + 34} 770 V800 M${x + 46} 770 V800`} stroke={K} strokeWidth="3" />
            </g>
          ))}
          {/* arco di ferro sopra il cancello */}
          <path d="M330 870 Q540 760 750 870" fill="none" stroke={K} strokeWidth="12" />
          <path d="M330 894 Q540 800 750 894" fill="none" stroke={K} strokeWidth="6" />
          <path d="M400 848 V876 M470 824 V864 M540 815 V858 M610 824 V864 M680 848 V876" stroke={K} strokeWidth="5" />
        </g>

        {/* PIANO 5 — pozzanghere sul terreno bagnato (1,0) */}
        <g transform={L(1.0)}>
          <ellipse cx="420" cy="1420" rx="190" ry="34" fill="#0B1619" />
          <ellipse cx="420" cy="1420" rx="190" ry="34" fill="none" stroke="#5E7F84" strokeWidth="3" opacity=".6" />
          <rect x="330" y="1408" width="24" height="18" fill="#FFD25C" opacity={0.3 + lanternPulse * 0.15} />
          <ellipse cx="760" cy="1580" rx="230" ry="40" fill="#0B1619" />
          <ellipse cx="760" cy="1580" rx="230" ry="40" fill="none" stroke="#5E7F84" strokeWidth="3" opacity=".6" />
          <rect x="840" y="1566" width="28" height="22" fill="#FFD25C" opacity={0.3 + lanternPulse * 0.15} />
          {/* gocce che rimbalzano: cerchi che si allargano */}
          {SPLASH.map((s, i) => {
            const p = mod(t * s.sp + s.ph, 1);
            return <ellipse key={i} cx={s.x} cy={s.y} rx={4 + p * 34} ry={1 + p * 7} fill="none" stroke="#9CC3CA" strokeWidth="3" opacity={(1 - p) * 0.6} />;
          })}
        </g>

        {/* PIANO 6 — pali di cemento e filo spinato in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <path d="M-40 1600 Q540 1700 1120 1590" fill="none" stroke="#1A262A" strokeWidth="7" />
          <path d="M-40 1700 Q540 1800 1120 1690" fill="none" stroke="#1A262A" strokeWidth="7" />
          {Array.from({ length: 16 }, (_, i) => {
            const x = 30 + i * 66;
            const y1 = 1600 + Math.sin((i / 15) * Math.PI) * 100 - (i > 12 ? 10 : 0);
            return <path key={i} d={`M${x - 12} ${y1 - 12} l24 24 M${x + 12} ${y1 - 12} l-24 24`} stroke="#1A262A" strokeWidth="5" />;
          })}
          {[{ x: -70, top: 1380 }, { x: 990, top: 1360 }].map((p) => (
            <g key={p.x}>
              <rect x={p.x} y={p.top} width="120" height={2100 - p.top} fill="url(#os-post)" stroke={K} strokeWidth="10" />
              <path d={`M${p.x + 96} ${p.top + 10} V2080`} stroke="#AFC3C4" strokeWidth="4" opacity=".5" />
              <path d={`M${p.x + 20} ${p.top + 120} h40 M${p.x + 30} ${p.top + 260} h30`} stroke={K} strokeWidth="5" />
              <rect x={p.x - 8} y={p.top - 20} width="136" height="26" fill="#3E5052" stroke={K} strokeWidth="8" />
            </g>
          ))}
        </g>

        {/* PIANO 7 — pioggia vicina, spessa e veloce, e nebbia davanti alla camera (1,6–1,7) */}
        <g transform={L(1.6)} stroke="#B4D2D7" strokeWidth="4" strokeLinecap="round" opacity=".42">
          <path d={rainPath(34, 77, 80, 14, 1300, 2000)} transform={`translate(0 ${mod(t * 1500, 2000) - 2000})`} />
          <path d={rainPath(34, 77, 80, 14, 1300, 2000)} transform={`translate(0 ${mod(t * 1500, 2000)})`} />
        </g>
        <g transform={L(1.7)}>
          {MOTES.map((m, i) => (
            <circle key={i} cx={mod(m.ph - t * m.speed, 1500) - 200} cy={m.y + Math.sin(t * 0.7 + i) * 30} r={m.rad} fill="url(#os-fog)" opacity=".1" />
          ))}
        </g>
      </g>

      <Finish id="os" tint="#0E3A40" />
    </svg>
  );
};
