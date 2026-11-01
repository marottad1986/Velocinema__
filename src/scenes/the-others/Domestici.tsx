import React from 'react';
import { camera, eob, seg } from '../../lib/anim';
import { Fog, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Chiavi, Fiamma, K, OthersDefs, Ombra, Porta } from './Comuni';

// Tre domestici sconosciuti: il portone della villa nella nebbia, visto dal viale. Il portico di pietra con le colonne,
// la lunetta sopra la porta con la luce calda, la campanella sul muro, la ghiaia del viale.
// Eventi: prima frase le orme dei vecchi domestici si allontanano nella ghiaia e svaniscono nella nebbia; seconda frase
// la campanella suona (oscilla) e la nebbia si muove; terza frase, mentre la voce li nomina, compaiono sui gradini
// i loro oggetti: la valigia di cuoio col mazzo di chiavi (la governante Mills), il rastrello col cappello
// (il giardiniere), la lavagnetta col gessetto (Lydia, la ragazza muta). Nessuna persona.
// Piani: nebbia e muro lontano (0,3) · facciata con portico e porta (0,6) · gradini e oggetti (0,85)
//        · ghiaia con le orme e siepi (1,1) · rami e nebbia vicina (1,3–1,8)

const STEPS = Array.from({ length: 9 }, (_, i) => ({ x: 520 - i * 34 + (i % 2 ? 26 : -26), y: 1380 + i * 62, r: (i % 2 ? 12 : -12) - i * 2 }));

export const Domestici: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const ring = seg(t, cues[1] + 0.3, cues[1] + 0.5) * Math.exp(-Math.max(0, t - cues[1] - 0.4) * 1.1);
  const bell = 22 * ring * Math.sin((t - cues[1]) * 14);
  const o1 = eob(seg(t, cues[2] + 0.4, cues[2] + 1.0));
  const o2 = eob(seg(t, cues[2] + 1.2, cues[2] + 1.8));
  const o3 = eob(seg(t, cues[2] + 2.0, cues[2] + 2.6));
  const prints = (i: number) => seg(t, 5 / 12 + (i * 5) / 24, 5 / 12 + 0.3 + (i * 5) / 24) * (1 - seg(t, cues[1] + 0.5 + i * 0.1, cues[1] + 1.6 + i * 0.1));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="dm" />
        <OthersDefs id="dm" />
        <Lin id="dm-sky" stops={[[0, '#1A2226'], [0.4, '#3A484A'], [1, '#6A7874']]} />
        <Lin id="dm-gravel" stops={[[0, '#5A5E56'], [1, '#22241F']]} />
        <Lin id="dm-leather" x2={1} y2={0} stops={[[0, '#4A2A16'], [0.45, '#8A5A30'], [1, '#3A2010']]} />
        <Lin id="dm-slate" stops={[[0, '#3A4446'], [1, '#1E2426']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo di nebbia (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#dm-sky)" />
          <Fog id="dm-f0" t={t} y={700} rx={800} ry={160} color="#8A9894" opacity={0.4} speed={0.15} />
        </g>

        {/* PIANO 1 — facciata di pietra, portico, lunetta accesa, porta e campanella (0,6) */}
        <g transform={L(0.6)}>
          <rect x="-200" y="560" width="1480" height="700" fill="url(#dm-stone)" />
          <linearGradient id="dm-veil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A3436" stopOpacity=".95" /><stop offset="1" stopColor="#2A3436" stopOpacity="0" /></linearGradient>
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M-200 ${580 + i * 24} H1280`} stroke="#000" strokeWidth="2" opacity=".15" />)}
          {Array.from({ length: 60 }, (_, i) => <path key={`v${i}`} d={`M${-200 + (i % 15) * 100 + (Math.floor(i / 15) % 2) * 50} ${580 + Math.floor(i / 15) * 24 * 7} v24`} stroke="#000" strokeWidth="2" opacity=".12" />)}
          {/* finestre con le tende chiuse ai lati */}
          {[60, 900].map((wx) => (
            <g key={wx}>
              <rect x={wx} y="720" width="120" height="200" fill="#0E1214" stroke={K} strokeWidth="6" />
              <path d={`M${wx} 720 h56 q-8 100 0 200 h-56 Z M${wx + 120} 720 h-56 q8 100 0 200 h56 Z`} fill="#1E2A24" />
              <path d={`M${wx + 60} 720 V920 M${wx} 820 H${wx + 120}`} stroke="#5A605C" strokeWidth="5" />
              <rect x={wx - 12} y="920" width="144" height="16" fill="#8A908A" stroke={K} strokeWidth="5" />
              <rect x={wx - 12} y="704" width="144" height="16" fill="#8A908A" stroke={K} strokeWidth="5" />
            </g>
          ))}
          {/* lunetta sopra la porta */}
          <path d="M400 790 A140 90 0 0 1 680 790 Z" fill="#FFC870" opacity=".85" stroke={K} strokeWidth="7" />
          {[-60, -30, 0, 30, 60].map((a) => <path key={a} d={`M540 790 L${540 + Math.sin((a * Math.PI) / 180) * 140} ${790 - Math.cos((a * Math.PI) / 180) * 90}`} stroke={K} strokeWidth="5" />)}
          <Glow id="dm-fan" x={540} y={770} r={240} t={t} color="#FFC870" amp={0.06} rate={5} opacity={0.85} />
          <Porta id="dm" x={395} y={1200} w={290} h={396} withKey={false} />
          {/* colonne e architrave del portico */}
          {[230, 770].map((cx) => (
            <g key={cx}>
              <rect x={cx} y="680" width="80" height="520" fill={`url(#dm-stone)`} stroke={K} strokeWidth="8" />
              {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${cx + 14 + i * 13} 700 V1180`} stroke="#000" strokeWidth="3" opacity=".2" />)}
              <path d={`M${cx + 6} 690 V1190`} stroke="#B8C0B8" strokeWidth="4" opacity=".5" />
              <rect x={cx - 14} y="1176" width="108" height="30" fill="#8A908A" stroke={K} strokeWidth="6" />
              <rect x={cx - 14} y="670" width="108" height="26" fill="#8A908A" stroke={K} strokeWidth="6" />
            </g>
          ))}
          <rect x="190" y="640" width="700" height="40" fill="#7A807A" stroke={K} strokeWidth="7" />
          <path d="M194 646 H886" stroke="#C8CEC6" strokeWidth="4" opacity=".5" />
          {/* campanella: staffa, molla, cordone */}
          <g transform="translate(720 760)">
            <path d="M0 0 H40 V20" stroke={K} strokeWidth="9" fill="none" />
            <path d="M0 0 H40 V20" stroke="#5A6168" strokeWidth="4" fill="none" />
            <g transform={`translate(40 24) rotate(${bell})`}>
              <path d="M-26 50 Q-26 6 0 4 Q26 6 26 50 Z" fill={`url(#dm-brass)`} stroke={K} strokeWidth="5" />
              <rect x="-30" y="48" width="60" height="8" rx="4" fill={`url(#dm-brass)`} stroke={K} strokeWidth="4" />
              <circle cx={Math.sin(t * 20) * 6 * ring} cy="58" r="6" fill="#3A2A10" stroke={K} strokeWidth="3" />
              <path d="M-12 14 Q-18 30 -16 46" stroke="#FFFFFF" strokeWidth="4" opacity=".5" fill="none" />
            </g>
            {/* archi del suono */}
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M${74 + k * 16} ${30 + k * 0} q${12 + k * 4} 24 0 ${48 + k * 8}`} stroke="#E8E2D2" strokeWidth="5" fill="none" strokeLinecap="round" opacity={ring * (0.9 - k * 0.2)} />
            ))}
          </g>
          <rect x="-200" y="555" width="1480" height="110" fill="url(#dm-veil)" />
          <Fog id="dm-f1" t={t} y={1150} rx={700} ry={70} color="#A8B4AE" opacity={0.35} speed={0.3 + ring} ph={1} drift={60} />
        </g>

        {/* PIANO 2 — gradini e gli oggetti dei tre domestici (0,85) */}
        <g transform={L(0.85)}>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={170 - i * 50} y={1206 + i * 44} width={740 + i * 100} height="44" fill={i === 1 ? '#6A706C' : '#5E6460'} stroke={K} strokeWidth="6" />
              <path d={`M${174 - i * 50} ${1210 + i * 44} H${906 + i * 50}`} stroke="#A8AEA8" strokeWidth="4" opacity=".5" />
            </g>
          ))}
          {/* 1 — valigia di cuoio con il mazzo di chiavi della governante */}
          <g transform={`translate(300 ${1338 + 30 * (1 - o1)}) scale(${0.85 + 0.15 * o1})`} opacity={Math.min(1, o1)}>
            <Ombra id="dm" x={0} y={4} rx={150} ry={16} />
            <rect x="-130" y="-150" width="260" height="150" rx="14" fill="url(#dm-leather)" stroke={K} strokeWidth="8" />
            <path d="M-50 -150 Q-50 -196 0 -196 Q50 -196 50 -150" stroke={K} strokeWidth="14" fill="none" />
            <path d="M-50 -150 Q-50 -196 0 -196 Q50 -196 50 -150" stroke="#6A4020" strokeWidth="7" fill="none" />
            <path d="M-130 -96 H130" stroke={K} strokeWidth="5" />
            {[-80, 80].map((x) => <rect key={x} x={x - 14} y="-110" width="28" height="30" rx="4" fill="url(#dm-brass)" stroke={K} strokeWidth="4" />)}
            <path d="M-120 -140 Q-100 -146 -60 -144" stroke="#C88A5A" strokeWidth="5" opacity=".6" fill="none" />
            {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={-118 + i * 21} cy="-8" r="3" fill="#C8A060" />)}
            <Chiavi id="dm" x={90} y={-150} s={0.6} rot={-30} />
          </g>
          {/* 2 — rastrello appoggiato alla colonna col cappello del giardiniere */}
          <g transform={`translate(840 ${1250 + 30 * (1 - o2)})`} opacity={Math.min(1, o2)}>
            <g transform="rotate(-10) scale(.62)">
              <rect x="-8" y="-560" width="16" height="560" fill="url(#dm-wood)" stroke={K} strokeWidth="5" />
              <rect x="-70" y="-596" width="140" height="22" fill="#5A6168" stroke={K} strokeWidth="5" />
              {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-62 + i * 17.7} -574 v36`} stroke={K} strokeWidth="7" strokeLinecap="round" />)}
              {/* cappello di feltro appeso al manico */}
              <g transform="translate(0 -360) rotate(10)">
                <ellipse cx="0" cy="0" rx="90" ry="22" fill="#4A4232" stroke={K} strokeWidth="6" />
                <path d="M-54 -2 Q-56 -70 0 -74 Q56 -70 54 -2 Z" fill="#5E5440" stroke={K} strokeWidth="6" />
                <path d="M-54 -16 Q0 -6 54 -16 V-2 Q0 8 -54 -2 Z" fill="#2A2418" />
                <path d="M-40 -50 Q-30 -66 0 -68" stroke="#8A7E60" strokeWidth="4" fill="none" opacity=".7" />
              </g>
            </g>
          </g>
          {/* 3 — lavagnetta col gessetto di Lydia */}
          <g transform={`translate(620 ${1330 + 30 * (1 - o3)}) rotate(-6) scale(${0.85 + 0.15 * o3})`} opacity={Math.min(1, o3)}>
            <Ombra id="dm" x={0} y={4} rx={110} ry={12} />
            <rect x="-100" y="-150" width="200" height="150" rx="6" fill="url(#dm-wood)" stroke={K} strokeWidth="7" />
            <rect x="-82" y="-132" width="164" height="114" fill="url(#dm-slate)" stroke={K} strokeWidth="4" />
            <path d="M-64 -100 q20 -10 40 0 t40 0 M-64 -66 q14 -8 30 0" stroke="#E8E2D2" strokeWidth="4" fill="none" opacity=".75" strokeLinecap="round" />
            <rect x="30" y="-26" width="40" height="10" rx="4" fill="#F2EEE4" stroke={K} strokeWidth="3" transform="rotate(-10 50 -20)" />
          </g>
          <Glow id="dm-o1" x={300} y={1260} r={180} t={t} color="#FFD898" amp={0.1} rate={3} opacity={0.4 * seg(t, cues[2] + 0.4, cues[2] + 0.8) * (1 - seg(t, cues[2] + 1.4, cues[2] + 2.4))} />
          <Glow id="dm-o3" x={620} y={1260} r={160} t={t} color="#E8F0F0" amp={0.1} rate={3} opacity={0.35 * seg(t, cues[2] + 2.0, cues[2] + 2.4)} />
        </g>

        {/* PIANO 3 — viale di ghiaia con le orme che se ne vanno; siepi (1,1) */}
        <g transform={L(1.1)}>
          <path d="M-200 1340 H1280 V2200 H-200 Z" fill="url(#dm-gravel)" />
          {Array.from({ length: 70 }, (_, i) => {
            const v = (i * 0.618) % 1, w = ((i * 0.382) % 1);
            return <circle key={i} cx={-100 + w * 1280} cy={1360 + v * 700} r={2 + v * 4} fill="#9A9C92" opacity=".4" />;
          })}
          {STEPS.map((p, i) => (
            <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.r}) scale(${1.4 + i * 0.1})`} opacity={prints(i)}>
              <ellipse cx="0" cy="-10" rx="16" ry="26" fill="#121410" />
              <ellipse cx="0" cy="24" rx="12" ry="12" fill="#1A1C18" />
            </g>
          ))}
          {[[-140, 1440, 380], [860, 1440, 400]].map(([hx, hy, hw], i) => (
            <g key={i}>
              <path d={`M${hx} ${hy} q${hw * 0.25} -90 ${hw * 0.5} -20 q${hw * 0.25} -90 ${hw * 0.5} 20 v600 h${-hw} Z`} fill="#16241C" stroke={K} strokeWidth="8" />
              {Array.from({ length: 8 }, (_, k) => <circle key={k} cx={hx + 30 + ((k * 47) % (hw - 60))} cy={hy + 20 + ((k * 61) % 300)} r="18" fill="#22362A" />)}
            </g>
          ))}
          <Fog id="dm-f2" t={t} y={1700} rx={800} ry={120} color="#A8B4AE" opacity={0.35} speed={0.2} ph={2} />
        </g>

        {/* PIANO 4b — lanterna posata sulla ghiaia in basso a sinistra (1,2) */}
        <g transform={L(1.2)}>
          <Glow id="dm-lan" x={150} y={1640} r={300} t={t} color="#FFC870" amp={0.06} rate={8} opacity={0.6} />
          <g transform="translate(150 1800) scale(1.1)">
            <Ombra id="dm" x={0} y={4} rx={70} ry={12} />
            <path d="M-46 -196 Q0 -236 46 -196" stroke={K} strokeWidth="8" fill="none" />
            <rect x="-40" y="-196" width="80" height="24" rx="6" fill="#2A2E2E" stroke={K} strokeWidth="6" />
            <path d="M-34 -172 Q-48 -100 -34 -26 H34 Q48 -100 34 -172 Z" fill="#FFE8B0" opacity=".35" stroke={K} strokeWidth="6" />
            <Fiamma id="dm" x={0} y={-60} t={t} s={1} ph={0.6} />
            {[-36, 0, 36].map((x) => <path key={x} d={`M${x} -172 Q${x * 1.35} -100 ${x} -26`} stroke="#2A2E2E" strokeWidth="6" fill="none" />)}
            <rect x="-44" y="-30" width="88" height="30" rx="6" fill="#2A2E2E" stroke={K} strokeWidth="6" />
          </g>
        </g>
        {/* PIANO 4 — ramo che entra dall'alto a destra (1,3) */}
        <g transform={L(1.3)} strokeLinecap="round" fill="none">
          <path d="M1200 600 Q1000 640 900 720 Q860 760 820 770" stroke={K} strokeWidth="24" />
          <path d="M1000 650 Q960 600 900 590 M900 720 Q880 680 840 680" stroke={K} strokeWidth="11" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="dm-near" t={t} color="#C8D4CE" n={7} r0={80} r1={170} opacity={0.12} />
        </g>
      </g>
      <Finish id="dm" tint="#3A4744" tintOpacity={0.12} />
    </svg>
  );
};

