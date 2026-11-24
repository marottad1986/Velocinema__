import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Beam, Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs } from '../breaking-bad-stagione-1/Comuni';
import { BB2Defs, K, ORO, Ombra } from './Comuni';

// Il veleno e il campanello: il soggiorno polveroso della casupola nel deserto. Persone mai: Hector è la sua sedia a
// rotelle vuota con il campanello d'ottone sul bracciolo (l'accento oro), Tuco è il piatto di burritos. Eventi: prima
// frase il campanello suona una volta (piccolo sobbalzo e anelli di suono); seconda frase dalla capsula aperta cade una
// polvere bianca sul cibo; terza frase il campanello suona forte e di continuo, la sedia trema e il piatto scivola dal
// tavolo e si rovescia a terra: il nipote è avvertito.
// Piani: parete con finestra e tende (0,25) · televisore, mobile e ventilatore (0,45) · tavolo e sedia a rotelle (0,7)
//        · bordo del divano e lampada in primo piano (1,2) · pulviscolo nel fascio e particelle vicine (1,6)

const r = rng(2202);
const FLOWERS = Array.from({ length: 40 }, () => ({ x: r(), y: r(), s: 0.6 + r() * 0.6 }));

/** Campanello da banco d'ottone (cupola e pulsante). Origine alla base. `ring` 0–1 fa vibrare e mostra gli anelli. */
const Campana: React.FC<{ id: string; x: number; y: number; s?: number; t: number; ring: number; hits: number[] }> = ({ id, x, y, s = 1, t, ring, hits }) => {
  const last = hits.filter((h) => h <= t).pop();
  const since = last === undefined ? 9 : t - last;
  const press = since < 0.12 ? 1 - since / 0.12 : 0;
  const shake = since < 0.5 ? Math.sin(since * 90) * 5 * (1 - since / 0.5) : 0;
  return (
    <g transform={`translate(${x + shake} ${y}) scale(${s})`} strokeLinejoin="round">
      <Glow id={`${id}-bell`} x={0} y={-50} r={170} t={t} color={ORO} amp={0.06} rate={3} opacity={0.35 + 0.5 * ring} />
      <ellipse cx="0" cy="-6" rx="78" ry="16" fill="#4A3A1A" stroke={K} strokeWidth="6" />
      <path d="M-66 -10 Q-66 -96 0 -100 Q66 -96 66 -10 Z" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="8" />
      <path d="M-44 -30 Q-46 -80 -10 -90" stroke="#FFF2C0" strokeWidth="7" opacity=".7" fill="none" strokeLinecap="round" />
      <rect x="-8" y={-128 + press * 14} width="16" height="30" fill="#B8A060" stroke={K} strokeWidth="4" />
      <ellipse cx="0" cy={-130 + press * 14} rx="22" ry="8" fill={ORO} stroke={K} strokeWidth="4" />
      {/* anelli del suono */}
      {since < 0.9 && [0, 1].map((k) => {
        const p = seg(since, k * 0.15, 0.7 + k * 0.15);
        return p > 0 && p < 1 ? <path key={k} d={`M${-90 - 80 * p} ${-90 - 40 * p} Q0 ${-170 - 90 * p} ${90 + 80 * p} ${-90 - 40 * p}`} stroke={ORO} strokeWidth={8 * (1 - p)} fill="none" opacity={1 - p} /> : null;
      })}
    </g>
  );
};

export const Campanello: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const hit1 = griglia(cues[0] + 0.5);
  const tPour = griglia(cues[1] + 0.8);
  const tAlarm = griglia(cues[2] + 0.4);
  const B = 60 / 96; // un battito
  const hits = [hit1, ...Array.from({ length: 8 }, (_, k) => tAlarm + k * B / 2)];
  const ring = seg(t, tAlarm, tAlarm + 0.2) * (1 - seg(t, tAlarm + 4 * B, tAlarm + 4 * B + 0.6));
  const pour = seg(t, tPour, tPour + 1.6);
  const tFall = tAlarm + 2 * B;
  const fall = seg(t, tFall, tFall + 0.45);
  const chairShake = ring > 0 ? Math.sin(t * 70) * 3 * ring : 0;
  const tvFlick = 0.75 + 0.15 * Math.sin(t * 9) + 0.1 * Math.sin(t * 23);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cm" />
        <BBDefs id="cm" />
        <BB2Defs id="cm" />
        <Lin id="cm-wall" stops={[[0, '#3A2A1E'], [0.35, '#6A4A2E'], [0.7, '#8A6440'], [1, '#5A3E26']]} />
        <Lin id="cm-floor" stops={[[0, '#5A3A22'], [0.5, '#3A2414'], [1, '#1A0E08']]} />
        <Lin id="cm-brass" x2={1} y2={0} stops={[[0, '#8A6420'], [0.35, '#F6D27A'], [0.6, '#D8A840'], [1, '#6A4A18']]} />
        <Lin id="cm-vinyl" x2={1} y2={0} stops={[[0, '#3A2A22'], [0.5, '#5A4436'], [1, '#2A1E18']]} />
        <Lin id="cm-tv" stops={[[0, '#9AD0E8'], [1, '#3A6A8A']]} />
        <Lin id="cm-sky" stops={[[0, '#F6D8A0'], [1, '#F2A860']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — parete con carta da parati a fiori, finestra con le tende e il deserto fuori (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#cm-wall)" />
          {FLOWERS.map((f, i) => (
            <g key={i} transform={`translate(${-150 + f.x * 1400} ${650 + f.y * 560}) scale(${f.s})`} opacity=".3">
              {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-10" rx="6" ry="10" fill="#C8905A" transform={`rotate(${a})`} />)}
              <circle r="5" fill="#E8B070" />
            </g>
          ))}
          <path d="M-200 1130 H1280" stroke="#2A1A10" strokeWidth="24" />
          {/* finestra */}
          <g transform="translate(860 700)">
            <rect x="-150" y="0" width="300" height="300" fill="url(#cm-sky)" stroke={K} strokeWidth="9" />
            <path d="M-150 230 L-80 190 L-20 210 L60 170 L150 200 V300 H-150 Z" fill="#C8784A" />
            <path d="M0 0 V300 M-150 150 H150" stroke={K} strokeWidth="7" />
            <Glow id="cm-win" x={0} y={150} r={360} t={t} color="#FFD090" amp={0.03} rate={0.6} opacity={0.6} />
            {/* tende a fiori che si muovono un poco */}
            <path d={`M-190 -20 H-90 Q${-110 + Math.sin(t) * 6} 160 ${-100 + Math.sin(t * 1.2) * 8} 340 H-190 Z`} fill="#A84A3A" stroke={K} strokeWidth="6" />
            <path d={`M190 -20 H90 Q${110 + Math.sin(t + 1) * 6} 160 ${100 + Math.sin(t * 1.1 + 1) * 8} 340 H190 Z`} fill="#A84A3A" stroke={K} strokeWidth="6" />
            <path d="M-170 0 V320 M-130 0 V330 M170 0 V320 M130 0 V330" stroke="#7A2E22" strokeWidth="4" />
            <path d="M-200 -24 H200" stroke="#5A3A22" strokeWidth="12" strokeLinecap="round" />
          </g>
        </g>

        {/* PIANO 1 — mobile con il televisore acceso, ventilatore che gira, crocefisso di legno (0,45) */}
        <g transform={L(0.45)}>
          <g transform="translate(250 1130)">
            <rect x="-170" y="-150" width="340" height="150" fill="url(#cm-floor)" stroke={K} strokeWidth="8" />
            <path d="M-150 -80 H150" stroke={K} strokeWidth="5" />
            <circle cx="-40" cy="-115" r="6" fill="#C8A060" /><circle cx="40" cy="-115" r="6" fill="#C8A060" />
            <rect x="-140" y="-400" width="280" height="250" rx="22" fill="#3A322A" stroke={K} strokeWidth="9" />
            <rect x="-120" y="-380" width="200" height="190" rx="30" fill="url(#cm-tv)" opacity={tvFlick} stroke={K} strokeWidth="6" />
            {Array.from({ length: 8 }, (_, k) => <path key={k} d={`M-110 ${-370 + k * 23} H70`} stroke="#FFFFFF" strokeWidth="2" opacity={0.15 + 0.1 * Math.sin(t * 30 + k)} />)}
            <circle cx="110" cy="-330" r="12" fill="#8A7A6A" stroke={K} strokeWidth="3" /><circle cx="110" cy="-290" r="12" fill="#8A7A6A" stroke={K} strokeWidth="3" />
            <path d="M-40 -400 L-90 -470 M40 -400 L90 -470" stroke="#8A8A86" strokeWidth="5" />
            <Glow id="cm-tvg" x={-20} y={-285} r={300} t={t} color="#7AC0E8" amp={0.1} rate={7} opacity={0.4} />
          </g>
          {/* ventilatore a colonna */}
          <g transform="translate(600 1130)">
            <path d="M0 0 V-300 M-50 0 H50" stroke="#5A5A56" strokeWidth="10" strokeLinecap="round" />
            <circle cx="0" cy="-360" r="80" fill="#C8C8C0" fillOpacity=".25" stroke={K} strokeWidth="6" />
            <g transform={`translate(0 -360) rotate(${(t * 900) % 360})`}>
              {[0, 120, 240].map((a) => <ellipse key={a} cx="0" cy="-36" rx="20" ry="38" fill="#8A9AA0" opacity=".75" transform={`rotate(${a})`} />)}
            </g>
            <circle cx="0" cy="-360" r="14" fill="#5A5A56" stroke={K} strokeWidth="4" />
            {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M0 -360 L${Math.cos(k) * 80} ${-360 + Math.sin(k) * 80}`} stroke={K} strokeWidth="2" opacity=".5" />)}
          </g>
        </g>

        {/* PIANO 2 — il tavolo con il piatto di burritos e la capsula, la sedia a rotelle con il campanello (0,7) */}
        <g transform={L(0.7)}>
          <rect x="-200" y="1130" width="1480" height="900" fill="url(#cm-floor)" />
          {Array.from({ length: 9 }, (_, k) => <path key={k} d={`M${-200 + k * 180} 1130 L${-500 + k * 260} 2000`} stroke="#2A1A0E" strokeWidth="4" opacity=".6" />)}
          <Beam id="cm-beam" x={860} y={850} angle={128} length={900} spread={420} t={t} color="#FFD8A0" opacity={0.22} />
          {/* tavolo */}
          <g transform="translate(250 1250)">
            <Ombra id="cm" x={0} y={10} rx={240} ry={24} />
            <path d="M-200 -110 H200 L190 -90 H-190 Z" fill="#8A5A34" stroke={K} strokeWidth="8" />
            <rect x="-230" y="-140" width="460" height="34" rx="6" fill="#B87A48" stroke={K} strokeWidth="8" />
            <path d="M-170 -90 V0 M170 -90 V0" stroke="#5A3A22" strokeWidth="18" />
            {/* tovaglietta a quadretti */}
            <rect x="-150" y="-152" width="230" height="16" fill="#C84A3A" stroke={K} strokeWidth="3" />
            {/* piatto con i burritos: scivola e cade */}
            <g transform={`translate(${lerp(-40, 150, eo(fall))} ${-160 + (fall > 0.6 ? lerp(0, 150, (fall - 0.6) / 0.4) : 0)}) rotate(${lerp(0, 120, fall)})`}>
              <ellipse cx="0" cy="0" rx="110" ry="22" fill="#F2EEE4" stroke={K} strokeWidth="6" />
              {fall < 0.7 && [-40, 10, 56].map((bx, i) => (
                <g key={i} transform={`translate(${bx} -16) rotate(${-8 + i * 6})`}>
                  <rect x="-40" y="-20" width="80" height="34" rx="16" fill="#E8C084" stroke={K} strokeWidth="5" />
                  <path d="M-30 -10 Q0 -18 30 -10" stroke="#C89050" strokeWidth="3" fill="none" />
                </g>
              ))}
              {/* la polvere bianca sul cibo */}
              {pour > 0.3 && fall < 0.7 && Array.from({ length: 14 }, (_, k) => <circle key={k} cx={-50 + (k * 37) % 110} cy={-34 - (k % 3) * 4} r="3" fill="#FFFFFF" opacity={0.9 * seg(pour, 0.3, 0.7)} />)}
            </g>
            {/* capsula aperta che versa */}
            <g transform={`translate(${lerp(30, -10, eo(seg(t, tPour - 0.6, tPour)))} ${lerp(-180, -260, eo(seg(t, tPour - 0.6, tPour)))}) rotate(${lerp(0, 130, eo(seg(t, tPour - 0.6, tPour)))})`}>
              <rect x="-14" y="-32" width="28" height="30" rx="12" fill="#C83A2A" stroke={K} strokeWidth="4" />
              <rect x="-14" y="-2" width="28" height="30" rx="12" fill="#F2EEE4" stroke={K} strokeWidth="4" />
            </g>
            {pour > 0 && pour < 1 && Array.from({ length: 12 }, (_, k) => {
              const p = mod(t * 2.4 + k / 12, 1);
              return <circle key={k} cx={-6 + Math.sin(k * 3) * 6} cy={-240 + p * 80} r="3" fill="#FFFFFF" opacity={0.9 * (1 - p)} />;
            })}
            {/* bicchiere e bottiglia di salsa */}
            <rect x="120" y="-220" width="40" height="70" rx="6" fill="#C8DCE4" fillOpacity=".4" stroke={K} strokeWidth="5" />
            <path d="M-170 -150 V-230 Q-170 -246 -158 -250 V-270 H-142 V-250 Q-130 -246 -130 -230 V-150 Z" fill="#B82A1A" stroke={K} strokeWidth="5" />
          </g>
          {/* burritos e piatto a terra dopo la caduta */}
          {fall >= 1 && (
            <g transform="translate(470 1300)">
              <path d="M-80 0 Q-60 -30 0 -26 Q60 -30 80 0" fill="#F2EEE4" stroke={K} strokeWidth="5" />
              <path d="M-40 4 L-60 30 M30 4 L54 26" stroke={K} strokeWidth="5" />
              <rect x="-150" y="10" width="70" height="28" rx="14" fill="#E8C084" stroke={K} strokeWidth="4" transform="rotate(-20 -115 24)" />
              <rect x="90" y="4" width="70" height="28" rx="14" fill="#E8C084" stroke={K} strokeWidth="4" transform="rotate(14 125 18)" />
            </g>
          )}
          {/* sedia a rotelle vuota di Hector */}
          <g transform={`translate(${760 + chairShake} 1300)`}>
            <Ombra id="cm" x={0} y={8} rx={240} ry={24} />
            {/* schienale e seduta in vinile */}
            <path d="M60 -520 Q90 -520 92 -490 L100 -230 H-150 Q-170 -230 -170 -250 V-270 Q-170 -290 -150 -290 H40 L30 -490 Q32 -520 60 -520 Z" fill="url(#cm-vinyl)" stroke={K} strokeWidth="9" />
            <path d="M44 -500 L56 -300" stroke="#8A6A56" strokeWidth="5" opacity=".7" />
            <path d="M-150 -276 H60" stroke="#8A6A56" strokeWidth="4" opacity=".6" />
            {/* telaio cromato */}
            <path d="M96 -500 L110 -560 Q114 -580 136 -576 M100 -230 L120 -60 M-150 -240 L-200 -80 L-260 -60 M-160 -240 V-140 L-210 -110" stroke="#D8DEE0" strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d="M96 -500 L110 -560 Q114 -580 136 -576 M100 -230 L120 -60 M-150 -240 L-200 -80 L-260 -60" stroke={K} strokeWidth="3" fill="none" opacity=".5" />
            {/* bracciolo con il campanello */}
            <path d="M-110 -390 H70" stroke="#2A1E18" strokeWidth="26" strokeLinecap="round" />
            <path d="M-100 -390 V-290 M50 -390 V-290" stroke="#D8DEE0" strokeWidth="10" />
            {/* ruota grande con i raggi e il corrimano */}
            <g transform="translate(40 -180)">
              <circle r="170" fill="none" stroke="#1A1A1A" strokeWidth="20" />
              <circle r="150" fill="none" stroke="#D8DEE0" strokeWidth="8" />
              <circle r="170" fill="none" stroke={K} strokeWidth="3" />
              {Array.from({ length: 18 }, (_, k) => <path key={k} d="M0 0 L0 -160" transform={`rotate(${k * 20 + chairShake * 2})`} stroke="#B8C0C4" strokeWidth="3" />)}
              <circle r="20" fill="#8A9094" stroke={K} strokeWidth="5" />
              <path d="M-120 -90 A150 150 0 0 1 -40 -144" stroke="#FFFFFF" strokeWidth="5" opacity=".6" fill="none" />
            </g>
            {/* ruotina davanti e poggiapiedi */}
            <circle cx="-220" cy="-34" r="34" fill="#1A1A1A" stroke={K} strokeWidth="6" />
            <circle cx="-220" cy="-34" r="10" fill="#8A9094" />
            <rect x="-300" y="-84" width="90" height="16" rx="4" fill="#3A3A3A" stroke={K} strokeWidth="4" />
            <Campana id="cm" x={-40} y={-404} s={0.95} t={t} ring={ring} hits={hits} />
          </g>
        </g>

        {/* PIANO 3 — tappeto, bracciolo del divano, bottiglia e lampada in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-100 1560 L1180 1540 L1300 1960 L-220 1990 Z" fill="#7A2E24" stroke={K} strokeWidth="8" />
          <path d="M-40 1600 L1140 1582 L1230 1910 L-150 1935 Z" fill="none" stroke="#D8A050" strokeWidth="8" strokeDasharray="30 16" />
          {[[200, 1720], [520, 1700], [840, 1720]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d="M0 -60 L70 0 L0 60 L-70 0 Z" fill="#C8783A" stroke="#4A1A12" strokeWidth="5" />
              <path d="M0 -26 L30 0 L0 26 L-30 0 Z" fill="#F2C870" />
            </g>
          ))}
          <g transform="translate(700 1840) rotate(-74)">
            <rect x="-30" y="-120" width="60" height="150" rx="14" fill="#5A7A3A" fillOpacity=".8" stroke={K} strokeWidth="6" />
            <rect x="-14" y="-160" width="28" height="44" fill="#4A6A2E" stroke={K} strokeWidth="5" />
            <rect x="-30" y="-70" width="60" height="50" fill="#F2E4C4" stroke={K} strokeWidth="4" />
          </g>
          <path d="M-200 1560 Q-20 1490 160 1540 Q260 1570 270 1680 V2100 H-200 Z" fill="#5A3A2A" stroke={K} strokeWidth="10" />
          <path d="M-180 1580 Q-20 1520 150 1560" stroke="#8A5A42" strokeWidth="8" fill="none" />
          {Array.from({ length: 6 }, (_, k) => <circle key={k} cx={-150 + k * 60} cy={1610 + (k % 2) * 10} r="6" fill="#3A2418" />)}
          <g transform="translate(1000 1900)">
            <path d="M0 0 V-420" stroke="#3A2A1A" strokeWidth="14" />
            <path d="M-110 -420 L-70 -560 H70 L110 -420 Z" fill="#E8C890" stroke={K} strokeWidth="9" />
            <Glow id="cm-lamp" x={0} y={-440} r={300} t={t} color="#FFC870" amp={0.04} rate={2} opacity={0.5} />
          </g>
        </g>

        {/* PIANO 4 — pulviscolo nel fascio della finestra e particelle vicine (1,6) */}
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 760, x0: 760, x1: 960 }} bottom={{ y: 1300, x0: 300, x1: 900 }} seed={22} n={26} color="#FFE8C0" />
          <NearMotes id="cm-near" t={t} color="#FFD8A0" n={6} r0={70} r1={150} opacity={0.12} />
        </g>
      </g>
      <Finish id="cm" tint="#4A3A1E" tintOpacity={0.12} />
    </svg>
  );
};
