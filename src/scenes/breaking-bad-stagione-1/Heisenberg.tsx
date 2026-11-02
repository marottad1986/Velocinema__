import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Dust, flashAt, Flyers, Glow, NearMotes, Smoke } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { HAND } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { BBDefs, Cristalli, K, Ombra, ORO } from './Comuni';

// Il nome falso: Heisenberg: l'ufficio di Tuco, al piano di sopra di un capannone, di giorno. Eventi: prima frase sulla
// scrivania cade il sacchetto di droga rubato a Jesse, con un paio di occhiali da sole rotti accanto (il pestaggio); seconda frase
// accanto compare un secondo sacchetto, di cristalli grigi (l'esplosivo travestito da droga che porta Walter) e sul
// blocco degli appunti si scrive da sola la parola «HEISENBERG»; terza frase un lampo: il sacchetto esplode, i vetri
// della finestra saltano, fumo, fogli e schegge volano; quando il fumo si dirada sulla scrivania ci sono le mazzette
// (Tuco paga).
// Piani: città fuori dalla finestra (0,22) · parete con la finestra e lo scaffale delle bottiglie (0,45)
//        · scrivania con sacchetti, blocco, soldi (0,72) · divano e sedia in primo piano (1,2) · fumo, fogli, schegge (1,4–1,8)

const r = rng(9909);
const SHARDS = Array.from({ length: 26 }, () => ({ x: 380 + r() * 360, y: 700 + r() * 260, vx: (r() - 0.5) * 900, vy: -200 + r() * 500, a: r() * 360, s: 10 + r() * 22 }));
const BLD = Array.from({ length: 7 }, (_, i) => ({ x: 200 + i * 110 + r() * 20, h: 80 + r() * 120 }));

export const Heisenberg: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const drop = seg(t, griglia(cues[0] + 0.3), griglia(cues[0] + 0.3) + 0.4);
  const bag2 = eob(seg(t, griglia(cues[1] + 0.1), griglia(cues[1] + 0.1) + 0.5), 1.6);
  const name = seg(t, griglia(cues[1] + 0.8), griglia(cues[1] + 0.8) + 1.4);
  const tBoom = griglia(cues[2] + 0.5);
  const boom = t >= tBoom;
  const fl = flashAt(t, [tBoom]);
  const blast = seg(t, tBoom, tBoom + 1.2);
  const smoke = boom ? 1 - 0.6 * seg(t, tBoom + 1.0, dur) : 0;
  const cash = eob(seg(t, tBoom + 1.3, tBoom + 1.8), 1.5);
  const sh = boom && t < tBoom + 0.5 ? Math.sin(t * 70) * 12 * (1 - seg(t, tBoom, tBoom + 0.5)) : 0;
  const nome = 'HEISENBERG';

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="hb" />
        <BBDefs id="hb" />
        <Lin id="hb-out" stops={[[0, '#7AB0D8'], [0.6, '#C8DCE4'], [1, '#E8D8B8']]} />
        <Lin id="hb-wall" stops={[[0, '#2A241C'], [0.4, '#5A4A34'], [0.75, '#6A5638'], [1, '#3A3020']]} />
        <Lin id="hb-desk" stops={[[0, '#6A4A2A'], [1, '#3A2814']]} />
        <Lin id="hb-sofa" stops={[[0, '#8A2A24'], [1, '#4A1410']]} />
        <radialGradient id="hb-fire"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".3" stopColor="#FFE08A" /><stop offset=".7" stopColor="#F28A2A" stopOpacity=".8" /><stop offset="1" stopColor="#C83A1A" stopOpacity="0" /></radialGradient>
      </defs>

      <g transform={cam.transform}>
        <g transform={`translate(${sh} ${sh * 0.4})`}>
          {/* PIANO 0 — la città di giorno fuori dalla finestra (0,22) */}
          <g transform={L(0.22)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#hb-out)" />
            {BLD.map((b, i) => (
              <g key={i}>
                <rect x={b.x} y={1000 - b.h} width="96" height={b.h} fill="#B89A7A" />
                {Array.from({ length: Math.floor(b.h / 40) }, (_, k) => <rect key={k} x={b.x + 20} y={1000 - b.h + 16 + k * 40} width="56" height="14" fill="#8A7A6A" />)}
              </g>
            ))}
            <path d="M160 1000 L300 880 L460 940 L620 860 L800 930 L960 870 V1000 Z" fill="#9AA0B0" opacity=".5" />
          </g>

          {/* PIANO 1 — parete con la finestra, scaffale con bottiglie, poster (0,45) */}
          <g transform={L(0.45)}>
            <Glow id="hb-win" x={600} y={850} r={440} t={t} color="#FFE0A8" amp={0.05} rate={1.2} opacity={0.45} />
            <path d="M320 1000 L120 1250 H760 L880 1000 Z" fill="#FFE0A8" opacity=".1" />
            <Dust t={t} top={{ y: 1000, x0: 340, x1: 860 }} bottom={{ y: 1240, x0: 140, x1: 740 }} n={26} color="#FFF0C8" seed={31} />
            <path d="M-200 -200 H1280 V2200 H-200 Z M300 690 V1010 H900 V690 Z" fill="url(#hb-wall)" fillRule="evenodd" />
            <rect x="300" y="690" width="600" height="320" fill="none" stroke={K} strokeWidth="12" />
            {/* vetri: interi, poi esplosi */}
            {!boom ? (
              <g>
                {[0, 1, 2].map((k) => <rect key={k} x={306 + k * 198} y="696" width="190" height="308" fill="#DDEEF6" opacity=".25" />)}
                <path d="M340 980 L420 720 M560 980 L620 760" stroke="#FFFFFF" strokeWidth="6" opacity=".4" />
              </g>
            ) : (
              <g>
                <path d="M306 696 L380 696 L340 760 L306 820 Z M900 696 L820 696 L870 790 L900 760 Z M306 1004 L360 1004 L320 950 Z" fill="#DDEEF6" opacity=".35" stroke={K} strokeWidth="3" />
              </g>
            )}
            {[500, 700].map((x) => <path key={x} d={`M${x} 690 V1010`} stroke={K} strokeWidth="10" />)}
            {/* scaffale con bottiglie */}
            <rect x="-120" y="900" width="340" height="16" fill="#3A2614" stroke={K} strokeWidth="5" />
            {[-90, -30, 30, 90, 150].map((x, i) => (
              <g key={x}>
                <path d={`M${x - 16} 900 V840 Q${x - 16} 820 ${x - 6} 812 V780 H${x + 6} V812 Q${x + 16} 820 ${x + 16} 840 V900 Z`} fill={['#6A3A1A', '#2A5A3A', '#C8A040', '#5A2A2A', '#3A3A5A'][i]} stroke={K} strokeWidth="4" />
                <path d={`M${x - 8} 846 V890`} stroke="#FFFFFF" strokeWidth="3" opacity=".35" />
              </g>
            ))}
            {/* orologio e calendario con un'auto */}
            <circle cx="1000" cy="780" r="50" fill="#F2E8D0" stroke={K} strokeWidth="7" />
            <path d="M1000 780 V748 M1000 780 L1022 790" stroke={K} strokeWidth="5" />
            <rect x="940" y="880" width="130" height="170" fill="#E8D8B0" stroke={K} strokeWidth="6" />
            <path d="M956 960 q30 -30 60 0 h30 v20 h-100 Z" fill="#C83A2A" stroke={K} strokeWidth="4" />
            <circle cx="976" cy="984" r="10" fill="#2A2A2A" />
            <circle cx="1036" cy="984" r="10" fill="#2A2A2A" />
          </g>

          {/* PIANO 2 — la scrivania con i due sacchetti, il blocco e poi i soldi (0,72) */}
          <g transform={L(0.72)}>
            <path d="M-200 1240 H1280 V2200 H-200 Z" fill="#2A1E14" />
            <g transform="translate(540 1180) scale(1.2) translate(-540 -1180)">
            <path d="M120 1080 H960 L1020 1170 H60 Z" fill="url(#hb-desk)" stroke={K} strokeWidth="9" />
            <path d="M130 1086 H950" stroke="#B88A58" strokeWidth="4" opacity=".7" />
            <rect x="60" y="1170" width="960" height="90" fill="#4A3218" stroke={K} strokeWidth="8" />
            {[200, 540, 880].map((x) => <rect key={x} x={x - 50} y="1196" width="100" height="16" rx="6" fill="#2A1A0C" />)}
            {/* posacenere e telefono */}
            <ellipse cx="930" cy="1110" rx="40" ry="12" fill="#5A5E60" stroke={K} strokeWidth="4" />
            <path d="M900 1104 l50 -8" stroke="#F2E8D8" strokeWidth="5" />
            {/* sacchetto di Jesse che cade sul tavolo */}
            <g transform={`translate(330 ${lerp(900, 1120, drop * drop)})`} opacity={drop > 0 ? 1 : 0}>
              <Ombra id="hb" x={0} y={6} rx={110} ry={12} opacity={drop >= 1 ? 1 : 0} />
              <path d="M-90 0 Q-100 -70 -60 -90 H60 Q100 -70 90 0 Z" fill="#E8F2F4" stroke={K} strokeWidth="6" opacity=".85" />
              <Cristalli id="hb" x={0} y={-6} t={t} s={0.7} n={12} seed={2} glint={0.6} />
              <path d="M-60 -90 H60" stroke="#C83A2A" strokeWidth="8" />
            </g>
            {/* occhiali da sole rotti */}
            <g transform="translate(200 1124) rotate(-8)" opacity={drop >= 1 ? 1 : 0}>
              <circle cx="-26" cy="0" r="20" fill="#1A1A1A" stroke={K} strokeWidth="4" />
              <circle cx="26" cy="0" r="20" fill="#1A1A1A" stroke={K} strokeWidth="4" />
              <path d="M-6 0 H6 M-46 0 L-70 -6 M46 0 L70 -10" stroke={K} strokeWidth="5" />
              <path d="M18 -12 L34 10 M26 -16 L22 18" stroke="#8A8A8A" strokeWidth="2" />
            </g>
            {/* sacchetto di Walter: cristalli grigi, l'esplosivo */}
            {!boom && (
              <g transform={`translate(600 1120) scale(${bag2})`} opacity={bag2 > 0 ? 1 : 0}>
                <Ombra id="hb" x={0} y={6} rx={110} ry={12} />
                <Glow id="hb-bag" x={0} y={-40} r={150} t={t} color={ORO} amp={0.12} rate={5} opacity={0.45} />
                <path d="M-90 0 Q-100 -80 -60 -100 H60 Q100 -80 90 0 Z" fill="#B8B8B4" stroke={K} strokeWidth="6" />
                {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-60 + i * 13} ${-20 - (i % 3) * 20} l10 -18 l10 18 Z`} fill="#8A8E90" stroke={K} strokeWidth="2" />)}
                <path d="M-60 -100 H60" stroke={ORO} strokeWidth="8" />
              </g>
            )}
            {/* blocco degli appunti con il nome */}
            <g transform="translate(760 1132) skewX(-20)">
              <rect x="-90" y="-60" width="180" height="56" fill="url(#hb-paper)" stroke={K} strokeWidth="4" />
              <text x="-80" y="-20" fontFamily={HAND} fontSize="30" fill="#1E2A5A">{nome.slice(0, Math.floor(name * nome.length))}</text>
            </g>
            {/* bruciatura dopo l'esplosione e mazzette di Tuco */}
            {boom && <ellipse cx="600" cy="1120" rx="150" ry="30" fill="#140C08" opacity={0.85} />}
            {cash > 0 && [0, 1, 2, 3, 4].map((k) => (
              <g key={k} transform={`translate(${520 + (k % 3) * 70} ${1120 - Math.floor(k / 3) * 30}) scale(${cash})`}>
                <rect x="-36" y="-26" width="72" height="30" rx="4" fill="#A8C08A" stroke={K} strokeWidth="4" />
                <rect x="-8" y="-26" width="16" height="30" fill={ORO} stroke={K} strokeWidth="3" />
              </g>
            ))}
            </g>
          </g>

          {/* lampo, palla di fuoco e fumo dell'esplosione */}
          {boom && (
            <g transform={`${L(0.72)} translate(540 1180) scale(1.2) translate(-540 -1180)`}>
              <circle cx="600" cy="1060" r={lerp(80, 400, eo(blast))} fill="url(#hb-fire)" opacity={Math.min(1, 1.6 * (1 - blast))} />
              <g opacity={smoke}>
                <Smoke id="hb-sm" t={t} x={600} y={1060} color="#5A5450" n={9} rise={360} wind={-60} r0={70} r1={190} speed={0.4} opacity={0.85} />
              </g>
              {SHARDS.map((s, i) => {
                const p = seg(t, tBoom, tBoom + 1.4);
                const x = s.x + s.vx * p, y = s.y + s.vy * p + 700 * p * p;
                return <path key={i} d={`M0 0 L${s.s} ${s.s * 0.3} L${s.s * 0.3} ${s.s}`} fill={i % 3 ? '#DDEEF6' : '#F2E8D0'} stroke={K} strokeWidth="2" transform={`translate(${x} ${y}) rotate(${s.a + p * 400})`} opacity={1 - seg(p, 0.7, 1)} />;
              })}
            </g>
          )}

          {/* PIANO 3 — bracciolo del divano rosso e sedia da ufficio in primo piano (1,2) */}
          <g transform={L(1.2)}>
            <path d="M-200 1980 V1560 Q-200 1480 -110 1480 H140 Q220 1480 220 1560 V1980 Z" fill="url(#hb-sofa)" stroke={K} strokeWidth="10" />
            <path d="M-180 1500 H160" stroke="#C85A4A" strokeWidth="6" opacity=".6" />
            {[1600, 1720, 1840].map((y) => <circle key={y} cx="60" cy={y} r="8" fill="#3A0E0A" />)}
            <g transform="translate(900 1960)">
              <path d="M-160 -560 Q-170 -640 -100 -660 H100 Q170 -640 160 -560 L140 -260 H-140 Z" fill="#1E1E1E" stroke={K} strokeWidth="10" />
              <path d="M-130 -600 Q-120 -640 -80 -644" stroke="#5A5A5A" strokeWidth="6" fill="none" />
              <rect x="-200" y="-260" width="400" height="70" rx="20" fill="#2A2A2A" stroke={K} strokeWidth="9" />
              <path d="M0 -190 V0" stroke="url(#hb-metal)" strokeWidth="30" />
            </g>
          </g>

          {/* PIANO 4 — fogli che volano dopo lo scoppio e particelle (1,4–1,8) */}
          {boom && (
            <g transform={L(1.4)} opacity={1 - seg(t, tBoom + 2.5, tBoom + 3.5)}>
              <Flyers t={t - tBoom} seed={23} n={8} color="#F2EEE4" outline={K} w={60} h={44} y0={800} y1={1600} speed={0.35} shape="paper" />
            </g>
          )}
          <g transform={L(1.8)}>
            <NearMotes id="hb-near" t={t} color={boom ? '#8A8480' : '#F2E0C0'} n={7} r0={70} r1={170} opacity={boom ? 0.2 : 0.1} />
          </g>
        </g>
      </g>
      <rect width="1080" height="1920" fill="#FFF4D8" opacity={0.8 * fl} />
      <Finish id="hb" tint="#C88A3A" tintOpacity={0.1} />
    </svg>
  );
};
