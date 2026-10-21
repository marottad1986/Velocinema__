import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { Flyers, Glow, NearMotes, Smoke, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Il riflettore: mattina in strada, un riflettore da studio con l'etichetta "SIRIUS" è appena caduto dal cielo
// e sta in mezzo all'asfalto, vetro incrinato, fumo leggero.
// Piani: cielo con un pannello che manca (0,25) · villette in fondo alla via (0,45) · strada in prospettiva (0,6)
//        · riflettore caduto, schegge, polvere e fumo (0,7) · villette ai lati e lampioni (0,8)
//        · foglie (1,1) · aiuole e idrante ai bordi (1,25) · polvere vicina (1,7)

const K = '#142235';
const W = '#FBF9F1';
const HZ = 900;
const r = rng(1803);
const SHARDS = Array.from({ length: 18 }, () => ({ a: -Math.PI * (0.05 + r() * 0.9), d: 80 + r() * 260, s: 6 + r() * 10, rot: r() * 360, ph: r() * 6 }));
const PUFFS = Array.from({ length: 12 }, (_, i) => ({ a: Math.PI + (i / 11) * Math.PI, v: 0.7 + r() * 0.6 }));

/** Riflettore da studio coricato (origine al punto d'appoggio). */
const Spotlight: React.FC<{ t: number; glint: number; lamp: number }> = ({ t, glint, lamp }) => (
  <g>
    {/* cavo strappato */}
    <path d="M-176 -64 C-270 -40 -300 40 -470 24" fill="none" stroke={K} strokeWidth="14" strokeLinecap="round" />
    <path d="M-176 -64 C-270 -40 -300 40 -470 24" fill="none" stroke="#3B4A5E" strokeWidth="6" strokeLinecap="round" />
    {/* staffa a U piegata */}
    <path d="M-96 -40 C-110 -250 40 -260 46 -40" fill="none" stroke={K} strokeWidth="26" strokeLinecap="round" />
    <path d="M-96 -40 C-110 -250 40 -260 46 -40" fill="none" stroke="#5C6C80" strokeWidth="14" strokeLinecap="round" />
    <path d="M-86 -150 C-60 -224 10 -226 30 -170" fill="none" stroke="#A9B6C4" strokeWidth="4" strokeLinecap="round" opacity=".8" />
    {/* corpo */}
    <rect x="-180" y="-176" width="306" height="176" rx="34" fill="url(#rf-metal)" stroke={K} strokeWidth="9" />
    {Array.from({ length: 6 }, (_, i) => (
      <path key={i} d={`M${-160 + i * 18} -160 V-16`} stroke={K} strokeWidth="5" opacity=".55" />
    ))}
    <path d="M-150 -164 H100" stroke="#C9D3DE" strokeWidth="5" opacity=".7" strokeLinecap="round" />
    {/* targhetta SIRIUS */}
    <g>
      <clipPath id="rf-plate">
        <rect x="-100" y="-128" width="150" height="62" rx="6" />
      </clipPath>
      <rect x="-100" y="-128" width="150" height="62" rx="6" fill="#F2994A" stroke={K} strokeWidth="5" />
      <text x="-25" y="-88" textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="34" fill={K} letterSpacing="2">SIRIUS</text>
      <text x="-25" y="-72" textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="700" fontSize="11" fill={K} opacity=".8">9 CANIS MAJOR</text>
      <g clipPath="url(#rf-plate)">
        <path d={`M${lerp(-140, 80, glint)} -140 l30 0 l-40 90 l-30 0 Z`} fill="#FFFFFF" opacity={glint > 0 && glint < 1 ? 0.75 : 0} />
      </g>
    </g>
    {/* cornice frontale, alette e vetro incrinato */}
    <path d="M118 -184 L178 -230 L190 -196 L134 -160 Z" fill="#4A596C" stroke={K} strokeWidth="6" strokeLinejoin="round" />
    <ellipse cx="128" cy="-88" rx="52" ry="102" fill="#2A3646" stroke={K} strokeWidth="9" />
    <ellipse cx="134" cy="-88" rx="38" ry="82" fill="url(#rf-lens)" />
    <ellipse cx="134" cy="-88" rx="38" ry="82" fill="#FFF4C8" opacity={0.25 + 0.6 * lamp} />
    <g stroke={K} strokeWidth="3" fill="none" strokeLinecap="round">
      <path d="M140 -110 L118 -150 M140 -110 L160 -136 M140 -110 L112 -84 L104 -60 M140 -110 L158 -70 L150 -30 M140 -110 L130 -40" />
      <path d="M124 -128 L150 -122 L156 -96 M118 -96 L146 -86" opacity=".7" />
    </g>
    <path d="M110 -150 Q118 -170 132 -164" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity=".8" />
    <circle cx={140 + Math.sin(t * 9) * 1.5} cy="-110" r="5" fill="#FFFFFF" opacity={0.5 + 0.5 * lamp} />
  </g>
);

const SideHouse: React.FC<{ x: number; y: number; s: number; roof: string; flip?: boolean }> = ({ x, y, s, roof, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} stroke={K} strokeWidth={8 / s} strokeLinejoin="round">
    <rect x="-160" y="-220" width="320" height="220" fill={W} />
    <rect x="60" y="-220" width="100" height="220" fill={K} opacity=".07" stroke="none" />
    <path d="M-190 -210 L0 -350 L190 -210 Z" fill={roof} />
    <rect x="-120" y="-170" width="76" height="70" fill="#CDEBF8" />
    <rect x="44" y="-170" width="76" height="70" fill="#CDEBF8" />
    <path d="M-82 -170 V-100 M82 -170 V-100" strokeWidth={5 / s} />
    <rect x="-30" y="-124" width="60" height="124" fill={roof} />
  </g>
);

export const Riflettore: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  // Cade con «cade un riflettore da studio» (cues[1]); impatto 0,38 s dopo. Riflesso sull'etichetta con «Sirius» (cues[2]).
  const TF = cues[1] ?? 1.82;
  const TI = TF + 0.38;
  const TG = (cues[2] ?? 3.43) + 0.2;
  const fall = seg(t, TF, TI);
  const landed = t >= TI;
  const dropY = landed ? -Math.sin(seg(t, TI, TI + 0.32) * Math.PI) * 22 : lerp(-1400, 0, fall * fall);
  const rot = landed ? -8 : lerp(-50, -8, fall);
  const shake = landed ? (1 - seg(t, TI, TI + 0.5)) * Math.sin(t * 70) * 12 : 0;
  const flash = flashAt(t, [TI + 0.02]);
  const lamp = landed ? lerp(1, 0.35, seg(t, TI, TI + 2.5)) * (0.85 + 0.15 * Math.sin(t * 23)) : 1;
  const glint = seg(t, TG, TG + 0.6);
  const gap = seg(t, TF - 0.1, TF + 0.1);
  const SX = 540, SY = 1150;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="rf" />
        <Lin id="rf-sky" stops={[[0, '#4C9DCC'], [0.3, '#7CC4EA'], [0.62, '#BCE5F7'], [0.8, '#F4F1E6']]} />
        <Lin id="rf-road" stops={[[0, '#AEB5BE'], [0.5, '#8E97A2'], [1, '#6F7A87']]} />
        <Lin id="rf-walk" stops={[[0, '#EDE6D3'], [1, '#D6CDB6']]} />
        <Lin id="rf-lawn" stops={[[0, '#A8DCA0'], [1, '#5FA572']]} />
        <Lin id="rf-metal" stops={[[0, '#7D8EA3'], [0.35, '#55657A'], [1, '#2A3646']]} />
        <Lin id="rf-lens" x2={1} y2={1} stops={[[0, '#FFFBEA'], [0.5, '#E6E9DA'], [1, '#B9C7CC']]} />
        <GlowGradient id="rf-dust" color="#D6CDB8" core={1} mid={0.6} />
      </defs>

      <g transform={`translate(${shake} ${shake * 0.4})`}>
        <g transform={cam.transform}>
          {/* PIANO 0 — cielo di mattina con un pannello che si apre (0,25) */}
          <g transform={L(0.25)}>
            <rect x="-200" y="-200" width="1480" height={HZ + 260} fill="url(#rf-sky)" />
            <Glow id="rf-sun" x={180} y={760} r={420} t={t} color="#FFF4D2" amp={0.04} rate={1} opacity={0.55} />
            <g stroke="#2F6E96" strokeWidth="3" opacity=".14">
              <path d="M780 560 H1300 M780 560 V1000 M980 -200 V560" />
            </g>
            {/* il punto da cui è caduto: un pannello del cielo che manca, con la griglia del set dietro */}
            <g opacity={gap}>
              <rect x="840" y="600" width="96" height="34" fill={K} />
              <path d="M846 612 H930 M870 600 V634 M900 600 V634" stroke="#3B4A5E" strokeWidth="3" />
              <path d={`M888 634 q${Math.sin(t * 2.4) * 12} 30 ${Math.sin(t * 2.4) * 6} 64`} fill="none" stroke={K} strokeWidth="4" strokeLinecap="round" />
            </g>
          </g>

          {/* PIANO 1 — villette in fondo alla via (0,45) */}
          <g transform={L(0.45)}>
            {[180, 360, 720, 900].map((x, i) => (
              <g key={x}>
                <rect x={x - 70} y={HZ - 80} width="140" height="80" fill={W} stroke={K} strokeWidth="3" />
                <path d={`M${x - 82} ${HZ - 76} L${x} ${HZ - 132} L${x + 82} ${HZ - 76} Z`} fill={['#8CC9E8', '#9ED8C4', '#4FA3D1', '#8CC9E8'][i]} stroke={K} strokeWidth="3" strokeLinejoin="round" />
                <rect x={x - 12} y={HZ - 40} width="24" height="40" fill="#8CC9E8" />
              </g>
            ))}
            {[60, 270, 470, 610, 810, 1020].map((x) => (
              <g key={x}>
                <rect x={x - 4} y={HZ - 50} width="8" height="50" fill="#8A7A62" />
                <circle cx={x} cy={HZ - 64} r="34" fill="#7FC287" />
              </g>
            ))}
            <rect x="-200" y={HZ - 4} width="1480" height="40" fill="#9FD49C" />
          </g>

          {/* PIANO 2 — strada in prospettiva (0,6) */}
          <g transform={L(0.6)}>
            <path d={`M-400 ${HZ} H1480 V2000 H-400 Z`} fill="url(#rf-lawn)" />
            <path d={`M440 ${HZ} H640 L1500 2000 H-420 Z`} fill="url(#rf-walk)" stroke={K} strokeWidth="4" />
            <path d={`M490 ${HZ} H590 L1300 2000 H-220 Z`} fill="url(#rf-road)" stroke={K} strokeWidth="5" />
            {[0.05, 0.16, 0.3, 0.48, 0.7].map((v, i) => {
              const y0 = HZ + v * v * 1100 + 6, y1 = HZ + (v + 0.06) ** 2 * 1100 + 6;
              const w0 = 3 + v * 14, w1 = 3 + (v + 0.06) * 14;
              return <path key={i} d={`M${540 - w0} ${y0} L${540 + w0} ${y0} L${540 + w1} ${y1} L${540 - w1} ${y1} Z`} fill="#F4F1E6" opacity=".85" />;
            })}
            {/* crepe nuove nell'asfalto, dopo l'impatto */}
            <g opacity={seg(t, TI, TI + 0.15)} stroke={K} strokeWidth="4" fill="none" strokeLinecap="round">
              <path d={`M${SX - 60} ${SY + 6} l-60 26 l-40 -4 l-50 30 M${SX + 40} ${SY + 8} l70 30 l30 -10 l60 26 M${SX - 10} ${SY + 10} l-10 50 l20 36`} />
            </g>
            <ellipse cx={SX} cy={SY + 6} rx={240} ry={34} fill={K} opacity={landed ? 0.28 : 0.28 * fall} />
          </g>

          {/* PIANO 3 — il riflettore caduto (0,7) */}
          <g transform={L(0.7)}>
            {/* polvere sollevata dall'impatto */}
            {landed &&
              PUFFS.map((p, i) => {
                const q = seg(t, TI, TI + 1.8);
                return (
                  <circle key={i} cx={SX + Math.cos(p.a) * 300 * eo(q) * p.v} cy={SY - 20 + Math.sin(p.a) * 70 * eo(q) * p.v} r={lerp(30, 120, eo(q))} fill="url(#rf-dust)" opacity={(1 - q) * 0.85} />
                );
              })}
            {/* scie della caduta */}
            {fall > 0 && fall < 1 && (
              <g stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity=".7">
                {[-120, -40, 60, 140].map((dx, i) => (
                  <path key={i} d={`M${SX + dx} ${SY - 200 + dropY - 260 - i * 30} v${-200 - i * 40}`} />
                ))}
              </g>
            )}
            {(fall > 0 || landed) && (
              <g transform={`translate(${SX} ${SY + dropY}) rotate(${rot})`}>
                <Spotlight t={t} glint={glint} lamp={lamp} />
              </g>
            )}
            {/* alone residuo della lampada */}
            {landed && <Glow id="rf-lamp" x={SX + 120} y={SY - 110} r={200} t={t} color="#FFF4C8" amp={0.1} rate={9} opacity={0.9 * lamp} />}
            {/* schegge di vetro che schizzano e restano a terra luccicando */}
            {landed &&
              SHARDS.map((s, i) => {
                const q = eo(seg(t, TI, TI + 0.6));
                const x = SX + 130 + Math.cos(s.a) * s.d * q * 1.6;
                const y = SY - 40 + Math.sin(s.a) * 90 * Math.sin(q * Math.PI) + 40 * q + (i % 3) * 14 * q;
                return (
                  <g key={i} transform={`translate(${x} ${y}) rotate(${s.rot + (1 - q) * 300})`}>
                    <path d={`M0 ${-s.s} L${s.s * 0.8} ${s.s * 0.5} L${-s.s * 0.6} ${s.s * 0.4} Z`} fill="#E6F6FD" stroke={K} strokeWidth="2.5" />
                    <circle r={s.s * 0.35} fill="#FFFFFF" opacity={Math.max(0, Math.sin(t * 3 + s.ph))} />
                  </g>
                );
              })}
            {/* fumo leggero */}
            {landed && (
              <g opacity={seg(t, TI, TI + 0.8)}>
                <Smoke id="rf-smoke" t={t} x={SX + 40} y={SY - 150} color="#A9B4C0" n={10} rise={420} wind={200} r0={40} r1={150} speed={0.3} opacity={0.9} />
              </g>
            )}
          </g>

          {/* PIANO 4 — villette ai lati e lampioni identici (0,8) */}
          <g transform={L(0.8)}>
            <SideHouse x={30} y={1080} s={0.85} roof="#4FA3D1" />
            <SideHouse x={1060} y={1080} s={0.85} roof="#9ED8C4" flip />
            {[270, 820].map((x) => (
              <g key={x} stroke={K} strokeLinejoin="round">
                <rect x={x - 8} y="800" width="16" height="300" fill="#E9E4D6" strokeWidth="5" />
                <path d={`M${x - 30} 800 L${x - 20} 754 H${x + 20} L${x + 30} 800 Z`} fill="#FFF6D8" strokeWidth="5" />
                <path d={`M${x - 34} 754 H${x + 34} L${x} 728 Z`} fill={K} strokeWidth="3" />
              </g>
            ))}
            {/* staccionate */}
            {[[-200, 220], [860, 1280]].map(([a, b], k) => (
              <g key={k}>
                <rect x={a} y="1060" width={b - a} height="12" fill={W} stroke={K} strokeWidth="4" />
                {Array.from({ length: Math.floor((b - a) / 36) }, (_, i) => (
                  <path key={i} d={`M${a + i * 36 + 6} 1110 V1040 l10 -14 l10 14 V1110 Z`} fill={W} stroke={K} strokeWidth="4" strokeLinejoin="round" />
                ))}
              </g>
            ))}
          </g>

          {/* PIANO 5 — foglie che rotolano sull'asfalto (1,1) */}
          <g transform={L(1.1)}>
            <Flyers t={t} seed={57} n={5} color="#A8D08D" outline={K} w={30} h={42} y0={1220} y1={1620} speed={0.11} shape="leaf" />
          </g>

          {/* PIANO 6 — aiuole, idrante e cordolo ai bordi (1,25) */}
          <g transform={L(1.25)}>
            <path d="M-200 1560 Q-40 1500 120 1560 Q200 1600 220 1700 L260 1960 H-200 Z" fill="#6DB37A" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M-200 1600 q60 -60 120 0 q60 -60 120 0 q60 -60 120 0" fill="#4F9A66" stroke={K} strokeWidth="7" />
            {[[-60, 1580], [20, 1610], [110, 1590]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="10" fill={i === 1 ? '#F7E08A' : '#F4A7B9'} stroke={K} strokeWidth="3" />)}
            <path d="M1280 1540 Q1100 1520 980 1600 Q900 1660 880 1960 H1280 Z" fill="#6DB37A" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            {/* idrante */}
            <g transform="translate(1010 1620)" stroke={K} strokeWidth="7" strokeLinejoin="round">
              <rect x="-34" y="-130" width="68" height="140" rx="10" fill="#8CC9E8" />
              <path d="M-40 -130 Q0 -186 40 -130 Z" fill="#8CC9E8" />
              <rect x="-56" y="-96" width="22" height="30" fill="#E8EEF2" />
              <rect x="34" y="-96" width="22" height="30" fill="#E8EEF2" />
              <path d="M-20 -120 V0" stroke="#E6F6FD" strokeWidth="5" opacity=".8" />
            </g>
          </g>

          {/* PIANO 7 — polvere vicina alla camera (1,7) */}
          <g transform={L(1.7)}>
            <NearMotes id="rf-near" t={t} color="#F4F1E6" n={7} opacity={0.1 + 0.15 * (landed ? 1 - seg(t, TI, TI + 3) : 0)} />
          </g>
        </g>
      </g>

      <rect width="1080" height="1920" fill="#FFFFFF" opacity={flash * 0.35} />
      <Finish id="rf" tint="#8FD3F4" tintOpacity={0.1} />
    </svg>
  );
};
