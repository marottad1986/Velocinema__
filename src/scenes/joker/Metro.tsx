import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Dust, Embers, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { JokerDefs, K, Ombra } from './Comuni';

// La notte in metropolitana: l'interno di un vagone di notte visto di fianco, la panca arancione lungo la parete, tre
// grandi finestrini sul buio della galleria, i neon sul soffitto, le maniglie. Oggetti dei tre uomini ricchi: la
// valigetta di pelle, la cravatta a righe, il giornale della Borsa.
// Eventi: prima frase la valigetta cade dalla rastrelliera e si apre, la cravatta finisce a terra, le maniglie
// oscillano forte (lo picchiano); seconda frase i tre neon scoppiano uno dopo l'altro (cue 1 + 0,6 / 1,05 / 1,5, i tre
// timpani; nessun lampo, la luce si spegne) e resta solo la luce rossa d'emergenza; terza frase il treno rallenta e si
// ferma in una stazione (il rombo dello spartito finisce a cue 2): nei finestrini il muro della stazione coperto di
// manifesti e maschere da clown, «SIAMO TUTTI CLOWN». Nessuna persona, nessuna arma in vista.
// Piani: galleria / stazione nei finestrini (0,25) · fiancata, soffitto e neon (0,5) · panca (0,7) · oggetti a terra (0,85)
//        · palo, maniglie e sedile in primo piano (1,2) · scintille e particelle vicine (1,5–1,8)

const r = rng(3);
const TUNNEL = Array.from({ length: 8 }, (_, i) => ({ x: i * 220, y: 800 + r() * 140 }));
const MASKS = Array.from({ length: 7 }, (_, i) => ({ x: 120 + i * 230 + r() * 40, y: 800 + (i % 2) * 70, rot: (r() - 0.5) * 24 }));

const Maschera: React.FC<{ x: number; y: number; s?: number; rot?: number; acc: string }> = ({ x, y, s = 1, rot = 0, acc }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M0 -62 V-92" stroke={K} strokeWidth="3" />
    <ellipse cx="0" cy="0" rx="54" ry="66" fill="#F2EEE4" stroke={K} strokeWidth="5" />
    <path d="M-40 -40 q10 -14 24 -6 M40 -40 q-10 -14 -24 -6" stroke="#2A5A9A" strokeWidth="6" fill="none" />
    <path d="M-34 -14 l-6 -22 M34 -14 l6 -22" stroke="#2A5A9A" strokeWidth="5" />
    <ellipse cx="-20" cy="-8" rx="11" ry="8" fill={K} /><ellipse cx="20" cy="-8" rx="11" ry="8" fill={K} />
    <circle cx="0" cy="14" r="13" fill={acc} stroke={K} strokeWidth="3" />
    <path d="M-32 32 Q0 62 32 32 Q0 46 -32 32 Z" fill={acc} stroke={K} strokeWidth="3" />
    <path d="M-30 -48 q16 -12 30 -10" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".7" />
  </g>
);

export const Metro: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const drop = seg(t, cues[0] + 0.8, cues[0] + 1.2);
  const open = eob(seg(t, cues[0] + 1.2, cues[0] + 1.6));
  const fight = seg(t, cues[0] + 0.6, cues[0] + 1) * (1 - seg(t, cues[1] + 1.6, cues[1] + 2.4));
  const pop = [0.6, 1.05, 1.5].map((d) => t > cues[1] + d);
  const sparkT = [0.6, 1.05, 1.5].map((d) => seg(t, cues[1] + d, cues[1] + d + 0.6));
  const lit = pop.filter((p) => !p).length / 3;
  const emergency = pop[2] ? 0.6 + 0.4 * Math.sin(t * 4) : 0;
  // il treno: corre fino a cue 2, poi rallenta e si ferma in stazione
  const stopP = seg(t, cues[2] - 0.6, cues[2] + 1.2);
  const run = t < cues[2] - 0.6 ? t * 1400 : (cues[2] - 0.6) * 1400 + 1800 * 1.4 * (stopP - stopP * stopP / 2);
  const station = eo(seg(t, cues[2] - 0.6, cues[2] + 1.2));
  const stationX = lerp(1500, 0, station);
  const shakeY = Math.sin(t * 31) * 3 * (1 - station);
  const swing = Math.sin(t * 2.4) * (5 + 20 * fight) + (t > cues[2] - 0.6 ? 14 * Math.exp(-(t - cues[2]) * 1.4) * Math.sin((t - cues[2]) * 5) : 0);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="mt" />
        <JokerDefs id="mt" />
        <Lin id="mt-ceil" stops={[[0, '#14181A'], [0.6, '#2A302E'], [1, '#3A403C']]} />
        <Lin id="mt-car" stops={[[0, '#6A6E66'], [0.4, '#A8AC9E'], [1, '#7A7E72']]} />
        <Lin id="mt-low" stops={[[0, '#8A8E80'], [1, '#4A4E44']]} />
        <Lin id="mt-bench" stops={[[0, '#F08A3A'], [0.5, '#D8642A'], [1, '#9A3E18']]} />
        <Lin id="mt-floor" stops={[[0, '#4A4A44'], [1, '#141410']]} />
        <Lin id="mt-tile" stops={[[0, '#C8D0B8'], [1, '#8A9A80']]} />
        <Lin id="mt-leather" x2={1} y2={0} stops={[[0, '#3A2214'], [0.5, '#6A4026'], [1, '#2E1A0E']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — galleria buia con le luci che corrono, poi la stazione con i manifesti (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="#06080A" />
          {TUNNEL.map((l, i) => {
            const x = mod(l.x - run * 0.9, 1760) - 340;
            return <g key={i}><rect x={x} y={l.y} width={station < 1 ? 160 * (1 - station) + 20 : 20} height="10" rx="5" fill="#F2C46A" opacity=".6" /><rect x={x + 80} y="740" width="16" height="300" fill="#1A1E20" /></g>;
          })}
          <g transform={`translate(${stationX} 0)`}>
            <rect x="-200" y="730" width="1480" height="320" fill="url(#mt-tile)" />
            {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-200 + i * 50} 730 V1050`} stroke="#9AA890" strokeWidth="2" />)}
            {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M-200 ${750 + i * 50} H1280`} stroke="#9AA890" strokeWidth="2" />)}
            <rect x="-200" y="744" width="1480" height="36" fill="#2E5A4A" />
            <text x="540" y="772" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="28" fill="#F2E6D0" letterSpacing="8">BEDFORD AV</text>
            {[[60, 4], [330, -3], [620, 2], [880, -4]].map(([x, a], i) => (
              <g key={i} transform={`rotate(${a} ${x} 900)`}>
                <rect x={x - 100} y="796" width="200" height="220" fill="#E8DCC0" stroke={K} strokeWidth="5" />
                <Maschera x={x} y={886} s={0.7} acc={P.accento} />
                <text x={x} y="991" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="24" fill={K}>SIAMO TUTTI</text>
                <text x={x} y="1011" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="24" fill={P.accento}>CLOWN</text>
              </g>
            ))}
            {MASKS.map((m, i) => <Maschera key={i} x={m.x - 100} y={m.y + 40} s={0.42} rot={m.rot + Math.sin(t * 2 + i) * 4} acc={P.accento} />)}
            <Glow id="mt-st" x={540} y={800} r={600} t={t} color="#F2E8C0" amp={0.03} rate={2} opacity={0.35} />
          </g>
        </g>

        {/* PIANO 1 — soffitto con i neon, fiancata del vagone e cornici dei finestrini (0,5) */}
        <g transform={`${L(0.5)} translate(0 ${shakeY})`}>
          <path d="M-200 -200 H1280 V650 H-200 Z" fill="url(#mt-ceil)" />
          {[60, 420, 780].map((x, i) => (
            <g key={x}>
              <rect x={x} y="640" width="260" height="10" rx="4" fill={pop[i] ? '#3A3E3A' : '#F4F8E8'} />
              <Glow id={`mt-n${i}`} x={x + 130} y={656} r={380} t={t} color="#E8F4E0" amp={0.03} rate={2} opacity={pop[i] ? 0 : 0.42 * (Math.sin(t * 17 + i) > 0.9 ? 0.6 : 1)} />
            </g>
          ))}
          <path d="M-200 650 H1280 V740 H-200 Z M-200 1030 H1280 V1300 H-200 Z" fill="url(#mt-car)" stroke={K} strokeWidth="7" />
          {[-150, 210, 570, 930].map((x) => (
            <g key={x}>
              <rect x={x} y="736" width="300" height="300" rx="36" fill="none" stroke="#5A5E56" strokeWidth="24" />
              <rect x={x} y="736" width="300" height="300" rx="36" fill="none" stroke={K} strokeWidth="5" />
              <path d={`M${x + 30} 756 L${x + 120} 1016`} stroke="#FFFFFF" strokeWidth="8" opacity=".08" />
            </g>
          ))}
          {/* rastrelliera per i bagagli */}
          <path d="M-200 690 H1280" stroke="url(#mt-steel)" strokeWidth="12" />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${-190 + i * 95} 690 v28`} stroke="#5A5E56" strokeWidth="5" />)}
          {/* mappa della linea */}
          <rect x="400" y="1044" width="280" height="50" rx="6" fill="#F2EEE4" stroke={K} strokeWidth="5" />
          <path d="M420 1069 H660" stroke="#2E7A5A" strokeWidth="8" />
          {[430, 480, 530, 580, 630].map((x, i) => <circle key={x} cx={x} cy={1069} r="8" fill={i === 4 ? P.accento : '#F2EEE4'} stroke={K} strokeWidth="4" />)}
          {/* luce rossa d'emergenza */}
          <rect x="510" y="664" width="60" height="30" rx="8" fill={pop[2] ? P.accento : '#5A2A28'} stroke={K} strokeWidth="5" />
          <Glow id="mt-em" x={540} y={680} r={620} t={t} color={P.accento} amp={0} opacity={0.75 * emergency} />
        </g>

        {/* PIANO 2 — la panca arancione e il pavimento (0,7) */}
        <g transform={`${L(0.7)} translate(0 ${shakeY})`}>
          <path d="M-200 1250 H1280 V2200 H-200 Z" fill="url(#mt-floor)" />
          <path d="M-200 1252 H1280" stroke="#7A7A70" strokeWidth="5" />
          {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={-180 + (i % 15) * 100} cy={1290 + Math.floor(i / 15) * 60} r="4" fill="#000" opacity=".3" />)}
          <rect x="-200" y="1100" width="1480" height="70" rx="16" fill="url(#mt-bench)" stroke={K} strokeWidth="8" />
          <path d="M-200 1110 H1280" stroke="#FFC08A" strokeWidth="5" opacity=".55" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-130 + i * 190} 1100 v70`} stroke="#9A3E18" strokeWidth="6" />)}
          <path d="M-200 1170 H1280 V1250 H-200 Z" fill="#3A3A34" stroke={K} strokeWidth="6" />
          {/* il giornale della Borsa sulla panca */}
          <g transform="translate(190 1092) rotate(-4)">
            <path d="M-110 0 L-100 -40 H100 L110 0 Z" fill="#E8E2D0" stroke={K} strokeWidth="5" />
            <text x="0" y="-14" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="22" fill={K}>BORSA</text>
            <path d="M-80 -30 h30 M50 -30 h30" stroke="#8A8A8A" strokeWidth="4" />
          </g>
        </g>

        {/* PIANO 3 — la valigetta che cade e si apre, la cravatta a terra (0,85) */}
        <g transform={L(0.85)}>
          {/* la valigetta: dalla rastrelliera al pavimento */}
          <g transform={`translate(${lerp(700, 690, drop)} ${lerp(660, 1196, drop * drop)}) rotate(${lerp(0, 8, drop)})`}>
            <Ombra id="mt" x={0} y={60} rx={150 * drop} ry={14} opacity={drop} />
            {/* fogli sparsi */}
            {[[-150, 50, -20], [150, 56, 14], [-60, 64, 6]].map(([x, y, a], i) => (
              <g key={i} transform={`translate(${x * open} ${y - 40 * (1 - open)}) rotate(${a * open})`} opacity={open}>
                <rect x="-50" y="-12" width="100" height="24" fill="#F2EEE4" stroke={K} strokeWidth="3" />
                <path d="M-40 -2 h60 M-40 6 h40" stroke="#8A8A8A" strokeWidth="3" />
              </g>
            ))}
            <rect x="-120" y="-30" width="240" height="90" rx="12" fill="url(#mt-leather)" stroke={K} strokeWidth="7" />
            <g transform={`rotate(${-50 * open} -120 -30)`}>
              <rect x="-120" y="-60" width="240" height="34" rx="10" fill="url(#mt-leather)" stroke={K} strokeWidth="7" />
              <path d="M-40 -60 V-82 H40 V-60" stroke={K} strokeWidth="8" fill="none" />
            </g>
            {[-70, 70].map((x) => <rect key={x} x={x - 14} y="-36" width="28" height="18" rx="3" fill="#E8C060" stroke={K} strokeWidth="4" />)}
            <path d="M-110 -20 H100" stroke="#A87A50" strokeWidth="4" opacity=".6" />
          </g>
          {/* la cravatta a righe */}
          <g transform="translate(330 1210) rotate(-78)" opacity={seg(t, cues[0] + 0.9, cues[0] + 1.2)}>
            <path d="M-16 -110 L16 -110 L26 60 L0 100 L-26 60 Z" fill="#2A4A8A" stroke={K} strokeWidth="5" />
            <path d="M-22 -110 h44 l-8 26 h-28 Z" fill="#2A4A8A" stroke={K} strokeWidth="5" />
            {[-70, -30, 10, 50].map((y) => <path key={y} d={`M-18 ${y} L18 ${y + 22}`} stroke="#E8C060" strokeWidth="7" />)}
          </g>
          {/* scintille dei neon che scoppiano */}
          {sparkT.map((p, i) => p > 0 && p < 1 && <g key={i}><Embers t={t * 3} x={190 + i * 360} y={620 + p * 400} w={160} h={300} seed={i + 5} n={10} hot="#FFF4C0" warm="#F2C46A" drift={60} /></g>)}
        </g>

        {/* PIANO 4 — palo, maniglie che oscillano, sedile in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 620 H1280" stroke="url(#mt-steel)" strokeWidth="20" />
          {[40, 300, 560, 820, 1080].map((x, i) => (
            <g key={x} transform={`rotate(${swing * (i % 2 ? 1 : 0.8)} ${x} 620)`}>
              <path d={`M${x} 620 V700`} stroke="#5A5E56" strokeWidth="8" />
              <circle cx={x} cy={736} r="34" fill="none" stroke={K} strokeWidth="16" />
              <circle cx={x} cy={736} r="34" fill="none" stroke="#C8CCC4" strokeWidth="8" />
            </g>
          ))}
          <path d="M920 -200 V2200" stroke={K} strokeWidth="40" />
          <path d="M920 -200 V2200" stroke="url(#mt-steel)" strokeWidth="30" />
          <path d="M-200 1560 Q-200 1500 -140 1500 H460 Q520 1500 520 1560 V1640 H-200 Z" fill="url(#mt-bench)" stroke={K} strokeWidth="10" />
          <path d="M-180 1520 H480" stroke="#FFC08A" strokeWidth="6" opacity=".5" />
          <path d="M-200 1640 H520 V2200 H-200 Z" fill="#9A3E18" stroke={K} strokeWidth="10" />
          {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M${-100 + i * 160} 1500 V1640`} stroke="#9A3E18" strokeWidth="8" />)}
        </g>

        {/* PIANO 5 — pulviscolo e particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 660, x0: 80, x1: 1000 }} bottom={{ y: 1240, x0: 40, x1: 1040 }} seed={5} n={22} color={pop[2] ? '#F4A098' : '#F4F8E8'} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="mt-near" t={t} color="#F4F8E8" n={6} opacity={0.07} />
        </g>
        {/* buio quando i neon scoppiano, con la luce rossa d'emergenza */}
        <rect x="-200" y="-200" width="1480" height="2400" fill="#000" opacity={0.45 * (1 - lit) * (1 - 0.5 * station)} />
        <rect x="-200" y="-200" width="1480" height="2400" fill={P.accento} opacity={0.2 * emergency * (1 - station)} />
        <g transform={L(0.5)}><Glow id="mt-em2" x={540} y={680} r={700} t={t} color={P.accento} amp={0} opacity={0.45 * emergency * (1 - station)} /></g>
      </g>
      <Finish id="mt" tint="#1E2E2A" tintOpacity={0.14} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): valigetta cue0 + 0,8 · neon cue1 + 0,6 / 1,05 / 1,5 · arrivo in stazione cue2 − 0,6 → + 1,2.
