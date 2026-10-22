import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, Notes, Stars } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { GOLD, K, TINT } from './Comune';

// Una seconda vita: interno di un'auto vuota di notte. Cruscotto con l'autoradio e la cassetta che gira, lancette,
// parabrezza con le luci dei lampioni che scorrono, pupazzetto a molla sul cruscotto che oscilla a tempo; in fondo la città.
// Piani: cielo e stelle (0,2) · città (0,3) · lampioni che scorrono (0,5) · cruscotto, autoradio, pupazzetto (0,8)
//        · montanti, tetto, specchietto e volante (1,1–1,25) · riflessi e pulviscolo (1,7)
// Eventi: cues[0] luci basse, un fiore sul cruscotto (Mercury muore) · cues[1] il display della radio si accende
//         · cues[2] la cassetta parte e i lampioni scorrono · cues[3] il pupazzetto scuote la testa a tempo, l'auto sobbalza
//         · cues[4] la città si accende finestra dopo finestra e dalle case salgono le note.

const r = rng(8181);
const BUILDINGS = Array.from({ length: 14 }, (_, i) => ({ x: -160 + i * 100, w: 70 + r() * 50, h: 120 + r() * 230 }));
const WINDOWS = BUILDINGS.flatMap((b, bi) =>
  Array.from({ length: Math.floor(b.h / 40) * 2 }, (_, k) => ({ x: b.x + 14 + (k % 2) * (b.w - 40), y: 1010 - b.h + 20 + Math.floor(k / 2) * 40, d: r(), bi })),
);

export const SecondaVita: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c1 = cues[1] ?? 2, c2 = cues[2] ?? 5.3, c3 = cues[3] ?? 8.1, c4 = cues[4] ?? 10.6;
  const radio = eo(seg(t, c1, c1 + 0.6));
  const drive = eo(seg(t, c2, c2 + 1.2));
  const bang = seg(t, c3, c3 + 0.3);
  const beat = Math.pow(Math.abs(Math.sin(t * Math.PI * 2.2)), 4);
  const nod = bang * Math.sin(t * Math.PI * 4.4) * 26 + (1 - bang) * Math.sin(t * 2) * 4;
  const bounce = bang * beat * 8;
  const city = (d: number) => seg(t, c4 + d * 1.6, c4 + d * 1.6 + 0.2);
  const travel = t * 30 + drive * (t - c2) * 520;
  const spin = drive * t * 300;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sv" />
        <Lin id="sv-sky" stops={[[0, '#04040E'], [0.5, '#141434'], [0.8, '#3A2A50'], [1, '#5A3A50']]} />
        <Lin id="sv-dash" stops={[[0, '#2A1E22'], [0.3, '#1A1216'], [1, '#08060A']]} />
        <Lin id="sv-roof" stops={[[0, '#0A060A'], [1, '#1A1216']]} />
        <Lin id="sv-glass" x2={1} y2={1} stops={[[0, '#FFFFFF', 0.06], [0.45, '#FFFFFF', 0], [0.6, '#FFFFFF', 0.05], [1, '#FFFFFF', 0]]} />
      </defs>

      <g transform={cam.transform}>
        <g transform={`translate(0 ${bounce})`}>
          {/* PIANO 0 — cielo notturno */}
          <g transform={L(0.2)}>
            <rect x="-200" y="-200" width="1480" height="1500" fill="url(#sv-sky)" />
            <Stars t={t} seed={88} n={30} y={560} h={260} color="#E8E0F0" size={0.8} />
          </g>
          {/* PIANO 1 — skyline con le finestre che si accendono */}
          <g transform={L(0.3)}>
            {BUILDINGS.map((b, i) => <rect key={i} x={b.x} y={1010 - b.h} width={b.w} height={b.h + 40} fill="#0E0C1E" />)}
            {WINDOWS.map((w, i) => {
              const on = Math.max(w.d > 0.75 ? 1 : 0, city(w.d));
              return <rect key={i} x={w.x} y={w.y} width="14" height="18" fill={GOLD} opacity={on * (0.6 + 0.3 * Math.sin(t + i))} />;
            })}
            <Glow id="sv-cityg" x={540} y={1000} r={600} t={t} color="#E9B949" amp={0.03} rate={1} opacity={0.15 + 0.25 * city(0.5)} />
            <Notes t={t - c4} x={540} y={900} n={8} spread={900} rise={320} color={GOLD} outline={K} size={0.8 * seg(t, c4, c4 + 0.5)} speed={0.25} />
          </g>
          {/* PIANO 2 — strada e lampioni che scorrono */}
          <g transform={L(0.5)}>
            <path d="M-200 1050 H1280 V1200 H-200 Z" fill="#141018" />
            {Array.from({ length: 6 }, (_, i) => {
              const p = mod(travel / 900 + i / 6, 1);
              const x = lerp(560, -260, p) + (i % 2 ? 0 : 0);
              const s = lerp(0.3, 1.6, p * p);
              return (
                <g key={i} transform={`translate(${x} ${lerp(1000, 960, p)}) scale(${s})`} opacity={seg(p, 0, 0.15)}>
                  <path d="M0 0 V-160 Q0 -180 30 -180" stroke="#2A2230" strokeWidth="8" fill="none" />
                  <Glow id={`sv-lamp${i}`} x={30} y={-172} r={80} t={t} color="#FFD08A" amp={0} opacity={0.7} />
                  <circle cx="30" cy="-172" r="8" fill="#FFE7B0" />
                </g>
              );
            })}
            {[0, 1, 2, 3].map((i) => {
              const p = mod(travel / 300 + i / 4, 1);
              return <path key={i} d={`M${lerp(540, 300, p)} ${lerp(1060, 1200, p)} l${lerp(-6, -40, p)} ${lerp(6, 30, p)}`} stroke="#C8B890" strokeWidth={lerp(3, 12, p)} opacity={0.7} />;
            })}
          </g>

          {/* PIANO 3 — cruscotto con autoradio, lancette, pupazzetto e fiore */}
          <g transform={L(0.8)}>
            <path d="M-200 1120 Q540 1030 1280 1120 V2200 H-200 Z" fill="url(#sv-dash)" stroke={K} strokeWidth="10" />
            <path d="M-200 1126 Q540 1038 1280 1126" fill="none" stroke="#5A4448" strokeWidth="5" opacity=".6" />
            {/* autoradio */}
            <g transform="translate(560 1260)">
              <Glow id="sv-radio" x={0} y={-10} r={240} t={t} color="#FFB060" amp={0.06} rate={2.2} opacity={0.15 + 0.5 * radio} />
              <rect x="-200" y="-90" width="400" height="180" rx="12" fill="#1A1216" stroke={K} strokeWidth="9" />
              <rect x="-170" y="-66" width="180" height="56" rx="6" fill={radio > 0.3 ? '#FFB060' : '#3A2A22'} stroke={K} strokeWidth="5" />
              <path d="M-150 -38 H-20" stroke="#5A2A10" strokeWidth="6" strokeDasharray="10 8" opacity={radio} />
              <rect x="-150" y="-50" width="8" height="28" fill="#C8303A" transform={`translate(${lerp(0, 120, radio)} 0)`} />
              {/* cassetta */}
              <rect x="30" y="-66" width="150" height="70" rx="6" fill="#2A2228" stroke={K} strokeWidth="5" />
              <rect x="44" y="-58" width="122" height="52" rx="4" fill={drive > 0.1 ? '#E8DCC8' : '#5A5052'} stroke={K} strokeWidth="3" />
              {[78, 132].map((cx, i) => (
                <g key={i} transform={`translate(${cx} -32) rotate(${spin})`}>
                  <circle r="14" fill="#F4ECDD" stroke={K} strokeWidth="4" />
                  <path d="M0 -10 V10 M-10 0 H10" stroke={K} strokeWidth="3" />
                </g>
              ))}
              {[-140, -80, -20, 40, 100, 160].map((x, i) => <rect key={i} x={x - 20} y="22" width="40" height="40" rx="6" fill="#3A3036" stroke={K} strokeWidth="4" />)}
              <circle cx="-160" cy="42" r="10" fill={GOLD} opacity={0.3 + 0.7 * radio} />
            </g>
            {/* quadranti */}
            {[160, 310].map((x, i) => (
              <g key={i} transform={`translate(${x} 1200)`}>
                <Glow id={`sv-g${i}`} x={0} y={0} r={110} t={t} color="#7AC8FF" amp={0.05} rate={1.5} opacity={0.2 + 0.3 * radio} />
                <circle r="60" fill="#0E0A10" stroke={K} strokeWidth="8" />
                <circle r="60" fill="none" stroke="#7AC8FF" strokeWidth="3" opacity=".5" />
                <path d="M0 0 V-46" stroke="#FF6A4A" strokeWidth="5" strokeLinecap="round" transform={`rotate(${-110 + (i ? 60 + 20 * drive : 40 + 110 * drive + bang * beat * 15)})`} />
              </g>
            ))}
            {/* fiore sul cruscotto */}
            <g transform="translate(400 1092) rotate(-70)">
              <path d="M0 0 Q30 -20 70 -10" stroke="#3A5A2E" strokeWidth="6" fill="none" />
              <circle cx="78" cy="-10" r="16" fill="#C8303A" stroke={K} strokeWidth="5" />
            </g>
            {/* pupazzetto a molla che scuote la testa */}
            <g transform="translate(830 1070)">
              <ellipse cx="0" cy="10" rx="44" ry="12" fill="#000" opacity=".4" />
              <path d="M-26 0 Q-30 -60 0 -70 Q30 -60 26 0 Z" fill="#C8A040" stroke={K} strokeWidth="6" />
              <path d="M0 -70 v-14" stroke="#8A8288" strokeWidth="5" />
              <g transform={`rotate(${nod} 0 -84)`}>
                <ellipse cx="0" cy="-120" rx="44" ry="38" fill="#D8B050" stroke={K} strokeWidth="7" />
                <path d="M-40 -136 Q-62 -112 -48 -90 M40 -136 Q62 -112 48 -90" stroke={K} strokeWidth="7" fill="#8A5A2A" />
                <circle cx="-14" cy="-124" r="5" fill={K} />
                <circle cx="14" cy="-124" r="5" fill={K} />
                <ellipse cx="0" cy="-104" rx="10" ry="7" fill={K} />
              </g>
              <Glow id="sv-pup" x={0} y={-100} r={140} t={t} color={GOLD} amp={0.15} rate={6} opacity={0.4 * bang} />
            </g>
          </g>

          {/* vetro del parabrezza */}
          <rect x="-200" y="540" width="1480" height="560" fill="url(#sv-glass)" />

          {/* PIANO 4 — tetto, montanti, specchietto, volante */}
          <g transform={L(1.1)}>
            <path d="M-200 -200 H1280 V560 Q540 500 -200 560 Z" fill="url(#sv-roof)" stroke={K} strokeWidth="10" />
            <path d="M-200 552 Q540 492 1280 552" fill="none" stroke="#3A2E34" strokeWidth="6" />
            <path d="M-200 540 L40 560 L-120 1160 H-200 Z" fill="#100A0E" stroke={K} strokeWidth="10" />
            <path d="M1280 540 L1040 560 L1200 1160 H1280 Z" fill="#100A0E" stroke={K} strokeWidth="10" />
            {/* specchietto con deodorante che oscilla */}
            <path d="M540 520 V580" stroke={K} strokeWidth="10" />
            <rect x="420" y="580" width="240" height="70" rx="24" fill="#1A1216" stroke={K} strokeWidth="8" />
            <rect x="436" y="592" width="208" height="46" rx="16" fill="#2A2A3E" />
            <g transform={`rotate(${Math.sin(t * 2.4) * 10 + bang * beat * 12} 540 650)`}>
              <path d="M540 650 V700" stroke="#C8B8A0" strokeWidth="3" />
              <path d="M540 700 L515 740 L530 740 L510 780 H570 L550 740 L565 740 Z" fill="#3A8A4A" stroke={K} strokeWidth="5" strokeLinejoin="round" />
            </g>
          </g>
          <g transform={L(1.25)}>
            <g transform="translate(110 1620) rotate(-12)">
              <circle r="300" fill="none" stroke={K} strokeWidth="56" />
              <circle r="300" fill="none" stroke="#2A2026" strokeWidth="38" />
              <path d="M-280 0 H280 M0 0 V280" stroke={K} strokeWidth="50" />
              <path d="M-280 0 H280 M0 0 V280" stroke="#2A2026" strokeWidth="32" />
              <circle r="80" fill="#1A1216" stroke={K} strokeWidth="10" />
              <path d="M-260 -110 A280 280 0 0 1 -110 -260" stroke="#6A5A60" strokeWidth="6" fill="none" />
            </g>
          </g>
        </g>

        {/* PIANO 5 — riflessi dei lampioni sul vetro e pulviscolo */}
        <g transform={L(1.7)}>
          {Array.from({ length: 3 }, (_, i) => {
            const p = mod(travel / 700 + i / 3, 1);
            return <path key={i} d={`M${lerp(1100, -100, p)} 560 l-120 540`} stroke="#FFE0B0" strokeWidth="30" opacity={0.08 * drive * Math.sin(p * Math.PI)} />;
          })}
          <NearMotes id="sv-near" t={t} color="#FFD8B0" opacity={0.06} vx={-80} />
        </g>
      </g>

      <Finish id="sv" tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};
