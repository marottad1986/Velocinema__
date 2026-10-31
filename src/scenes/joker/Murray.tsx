import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Beam, Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { ANTON, HAND, SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { JokerDefs, K, Ombra } from './Comuni';

// L'invito in TV: lo studio del talk show visto dal pubblico. Fondale con la città di notte, sipario ai lati, la
// scritta dello show con le lampadine, il grande schermo appeso, la scrivania del presentatore con microfono e tazza,
// la poltrona vuota dell'ospite, l'applausometro, «IN ONDA» rosso; in primo piano la telecamera dello studio.
// Eventi: prima frase le lampadine intorno alla scritta si accendono una dopo l'altra e i riflettori si aprono; seconda
// frase sullo schermo compare il piccolo palco di un locale con un microfono solo (cue 1, il disturbo dello spartito) e
// a cue 1 + 1,4 la scritta «JOKER» in sovrimpressione (accento, timpano); terza frase l'applausometro sale (cue 2 − 0,4,
// gli applausi) e sulla scrivania compare il biglietto d'invito (cue 2 + 1). Nessuna persona.
// Piani: fondale con la città (0,25) · sipario, scritta, schermo (0,5) · scrivania e poltrona (0,75) · biglietto (0,85)
//        · telecamera in primo piano (1,25) · pulviscolo nei fasci (1,5–1,8)

const BULBS = Array.from({ length: 22 }, (_, i) => {
  const k = i / 22;
  const per = 2 * (440 + 90);
  const d = k * per;
  return d < 440 ? { x: 320 + d, y: 640 } : d < 530 ? { x: 760, y: 640 + (d - 440) } : d < 970 ? { x: 760 - (d - 530), y: 730 } : { x: 320, y: 730 - (d - 970) };
});

export const Murray: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const lights = eo(seg(t, 0.2, cues[0] + 1.2));
  const clip = eo(seg(t, cues[1], cues[1] + 0.5));
  const static_ = seg(t, cues[1], cues[1] + 0.25) * (1 - seg(t, cues[1] + 0.25, cues[1] + 0.5));
  const caption = eob(seg(t, cues[1] + 1.4, cues[1] + 1.9), 1.6);
  const meter = eo(seg(t, cues[2] - 0.4, cues[2] + 1));
  const invite = eob(seg(t, cues[2] + 1, cues[2] + 1.6), 1.5);
  const onAir = Math.sin(t * 4) > -0.2 ? 1 : 0.5;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="mu" />
        <JokerDefs id="mu" />
        <Lin id="mu-back" stops={[[0, '#0E0A16'], [0.4, '#1E1636'], [0.75, '#3A2A5A'], [1, '#4A3A5A']]} />
        <Lin id="mu-curtain" x2={1} y2={0} stops={[[0, '#4A0E14'], [0.5, '#8A1E26'], [1, '#3A0A10']]} />
        <Lin id="mu-floor" stops={[[0, '#3A2A3A'], [1, '#120C14']]} />
        <Lin id="mu-desk" x2={1} y2={0} stops={[[0, '#4A2E1A'], [0.5, '#8A5A34'], [1, '#3A2414']]} />
        <Lin id="mu-chair" x2={1} y2={0} stops={[[0, '#1E3A5A'], [0.5, '#3A6A9A'], [1, '#16304A']]} />
        <Lin id="mu-cam" x2={1} y2={0} stops={[[0, '#1A1C20'], [0.5, '#4A4E56'], [1, '#141618']]} />
        <Lin id="mu-card" stops={[[0, '#FFF8E0'], [1, '#E8D8B0']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — fondale dipinto con la città di notte (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#mu-back)" />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-120 + i * 110} y={1060 - (90 + ((i * 53) % 160))} width="90" height={90 + ((i * 53) % 160) + 40} fill="#1A1430" />)}
          {Array.from({ length: 30 }, (_, i) => <rect key={`w${i}`} x={-100 + (i % 12) * 110 + ((i * 17) % 50)} y={1000 - ((i * 37) % 120)} width="10" height="12" fill="#F2D890" opacity={0.3 + 0.5 * lights} />)}
          <circle cx="880" cy="820" r="40" fill="#E8E0C8" opacity={0.5 + 0.4 * lights} />
        </g>

        {/* PIANO 1 — sipario ai lati, la scritta dello show con le lampadine, lo schermo, applausometro, IN ONDA (0,5) */}
        <g transform={L(0.5)}>
          {[[-200, 160], [920, 1280]].map(([a, b], i) => (
            <g key={i}>
              <path d={`M${a} 540 H${b} V1240 H${a} Z`} fill="url(#mu-curtain)" stroke={K} strokeWidth="8" />
              {Array.from({ length: 5 }, (_, k) => <path key={k} d={`M${a + 30 + k * 70} 540 Q${a + 10 + k * 70 + Math.sin(t + k) * 4} 900 ${a + 30 + k * 70} 1240`} stroke="#3A0A10" strokeWidth="8" fill="none" />)}
            </g>
          ))}
          <path d="M-200 540 H1280 V600 Q540 640 -200 600 Z" fill="url(#mu-curtain)" stroke={K} strokeWidth="8" />
          {/* scritta dello show con le lampadine */}
          <rect x="320" y="640" width="440" height="90" rx="10" fill="#1A1020" stroke={K} strokeWidth="7" />
          <text x="540" y="704" textAnchor="middle" fontFamily={ANTON} fontSize="54" fill="#F2D890" opacity={0.4 + 0.6 * lights} letterSpacing="2">LO SHOW DI MURRAY</text>
          {BULBS.map((b, i) => {
            const on = lights * 22 > i ? (Math.sin(t * 6 + i * 0.9) > -0.3 ? 1 : 0.55) : 0.15;
            return <g key={i}><circle cx={b.x} cy={b.y} r="9" fill="#FFF0B0" opacity={on} stroke={K} strokeWidth="2" />{on > 0.5 && <circle cx={b.x} cy={b.y} r="18" fill="#FFE080" opacity={0.25 * on} />}</g>;
          })}
          {/* il grande schermo appeso */}
          <path d="M440 740 V770 M640 740 V770" stroke={K} strokeWidth="5" />
          <rect x="330" y="770" width="420" height="250" rx="12" fill="#1A1C20" stroke={K} strokeWidth="9" />
          <rect x="348" y="786" width="384" height="218" fill="#0A0C10" />
          <g opacity={clip}>
            <rect x="348" y="786" width="384" height="218" fill="#2A1A24" />
            <path d="M348 964 H732 V1004 H348 Z" fill="#4A2A1E" />
            <path d="M540 786 L440 964 H640 Z" fill="#FFF0C0" opacity=".25" />
            <ellipse cx="540" cy="964" rx="70" ry="12" fill="#FFF0C0" opacity=".45" />
            <path d="M540 964 V884" stroke="#C8CCD0" strokeWidth="5" />
            <rect x="531" y="860" width="18" height="30" rx="9" fill="#C8CCD0" stroke={K} strokeWidth="3" />
            <path d="M520 964 h40" stroke="#C8CCD0" strokeWidth="5" />
            {[380, 420, 680, 710].map((x, k) => <circle key={x} cx={x} cy={990 + (k % 2) * 6} r="10" fill="#140C14" />)}
          </g>
          {Array.from({ length: 10 }, (_, k) => <rect key={k} x={348} y={786 + k * 22} width="384" height="11" fill="#C8D8E0" opacity={static_ * 0.6 * Math.abs(Math.sin(t * 40 + k))} />)}
          <g transform={`translate(540 ${846}) scale(${caption})`} opacity={seg(caption, 0, 0.3)}>
            <rect x="-120" y="-38" width="240" height="70" fill="#0A0A0A" opacity=".75" />
            <text x="0" y="22" textAnchor="middle" fontFamily={ANTON} fontSize="64" fill={P.accento} stroke="#F2E6D0" strokeWidth="2">JOKER</text>
          </g>
          <Glow id="mu-scr" x={540} y={895} r={300} t={t} color={caption > 0.5 ? P.accento : '#C8D8F0'} amp={0.05} rate={5} opacity={0.25 * (0.3 + clip)} />
          {/* IN ONDA */}
          <rect x="140" y="640" width="150" height="56" rx="8" fill={onAir > 0.6 ? P.accento : '#5A1A18'} stroke={K} strokeWidth="6" />
          <text x="215" y="679" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="28" fill="#FFF0E0">IN ONDA</text>
          <Glow id="mu-onair" x={215} y={668} r={130} t={t} color={P.accento} amp={0.05} rate={4} opacity={0.5 * onAir} />
          {/* applausometro */}
          <rect x="820" y="760" width="80" height="320" rx="12" fill="#1A1020" stroke={K} strokeWidth="7" />
          {Array.from({ length: 10 }, (_, k) => {
            const on = meter * 10 > k;
            const c = k > 7 ? P.accento : k > 4 ? '#F2C230' : '#6AC86A';
            return <rect key={k} x="834" y={1050 - k * 30} width="52" height="22" rx="4" fill={on ? c : '#2A2030'} stroke={K} strokeWidth="3" />;
          })}
          <text x="860" y="1112" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="20" fill="#F2E6D0">APPLAUSI</text>
        </g>

        {/* PIANO 2 — palco, scrivania del presentatore, poltrona dell'ospite (0,75) */}
        <g transform={L(0.75)}>
          <path d="M-200 1180 H1280 V2200 H-200 Z" fill="url(#mu-floor)" />
          <path d="M-200 1182 H1280" stroke="#8A6A8A" strokeWidth="5" opacity=".6" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-200 + i * 180} 1190 L${-400 + i * 230} 2200`} stroke="#5A3A5A" strokeWidth="3" opacity=".5" />)}
          <ellipse cx="540" cy="1200" rx="460" ry="40" fill="#F2D890" opacity={0.12 * lights} />
          {/* scrivania */}
          <Ombra id="mu" x={400} y={1206} rx={300} ry={24} />
          <path d="M140 1060 H660 L640 1200 H160 Z" fill="url(#mu-desk)" stroke={K} strokeWidth="9" />
          <rect x="120" y="1040" width="560" height="28" rx="6" fill="#6A4428" stroke={K} strokeWidth="7" />
          <path d="M130 1046 H670" stroke="#D8A878" strokeWidth="4" opacity=".6" />
          {[260, 400, 540].map((x) => <rect key={x} x={x - 50} y="1090" width="100" height="90" rx="6" fill="none" stroke="#3A2414" strokeWidth="5" />)}
          {/* microfono da tavolo e tazza */}
          <path d="M190 1040 V990 L150 960" stroke="#3A3E44" strokeWidth="8" fill="none" />
          <rect x="124" y="936" width="26" height="40" rx="12" fill="#9AA2AA" stroke={K} strokeWidth="4" transform="rotate(-30 137 956)" />
          <path d="M160 1040 h60" stroke={K} strokeWidth="8" />
          <g transform="translate(600 1040)"><path d="M-24 -50 H24 L20 0 H-20 Z" fill="#F2EEE4" stroke={K} strokeWidth="5" /><path d="M24 -40 q18 2 14 18 q-4 10 -16 8" stroke={K} strokeWidth="4" fill="none" /><text x="0" y="-18" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="16" fill={P.accento}>M</text></g>
          {/* poltrona dell'ospite, vuota */}
          <g transform="translate(860 1190)">
            <Ombra id="mu" x={0} y={10} rx={150} ry={18} />
            <path d="M-120 0 V-170 Q-120 -230 -50 -230 H50 Q120 -230 120 -170 V0 Z" fill="url(#mu-chair)" stroke={K} strokeWidth="8" />
            <rect x="-140" y="-110" width="280" height="80" rx="24" fill="#2A5A8A" stroke={K} strokeWidth="7" />
            <path d="M-100 -210 Q-60 -222 0 -220" stroke="#8AB8E8" strokeWidth="5" fill="none" opacity=".5" />
            <path d="M-100 0 v20 M100 0 v20" stroke={K} strokeWidth="10" />
          </g>
        </g>

        {/* PIANO 3 — il biglietto d'invito sulla scrivania (0,85) */}
        <g transform={L(0.85)}>
          <g transform={`translate(380 ${lerp(940, 990, invite)}) rotate(${lerp(-30, -6, invite)}) scale(${invite})`} opacity={seg(invite, 0, 0.2)}>
            <Glow id="mu-inv" x={0} y={0} r={200} t={t} color="#FFF0C0" amp={0.06} rate={3} opacity={0.5} />
            <rect x="-150" y="-60" width="300" height="120" rx="8" fill="url(#mu-card)" stroke={K} strokeWidth="6" />
            <rect x="-138" y="-48" width="276" height="96" rx="4" fill="none" stroke={P.accento} strokeWidth="3" />
            <text x="0" y="-10" textAnchor="middle" fontFamily={ANTON} fontSize="36" fill={K}>INVITO</text>
            <text x="0" y="30" textAnchor="middle" fontFamily={HAND} fontSize="28" fill="#2A3A6A">ospite: Arthur</text>
          </g>
        </g>

        {/* PIANO 4 — la telecamera dello studio in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <g transform="translate(-60 1520)">
            <rect x="-120" y="-240" width="460" height="300" rx="24" fill="url(#mu-cam)" stroke={K} strokeWidth="10" />
            <rect x="340" y="-190" width="140" height="200" rx="16" fill="#26282E" stroke={K} strokeWidth="9" />
            <circle cx="480" cy="-90" r="90" fill="#1A1C20" stroke={K} strokeWidth="10" />
            <circle cx="480" cy="-90" r="56" fill="#2A3A5A" stroke={K} strokeWidth="6" />
            <path d="M450 -120 q20 -14 40 -6" stroke="#9AB8E8" strokeWidth="6" fill="none" opacity=".7" />
            <rect x="200" y="-226" width="60" height="30" rx="6" fill={onAir > 0.6 ? P.accento : '#5A1A18'} stroke={K} strokeWidth="5" />
            <text x="40" y="-140" fontFamily={SANS} fontWeight={800} fontSize="40" fill="#C8CCD0">TV 3</text>
            <path d="M-100 -220 H320" stroke="#7A7E86" strokeWidth="6" opacity=".7" />
            <rect x="80" y="60" width="80" height="700" fill="url(#mu-cam)" stroke={K} strokeWidth="9" />
            <path d="M-120 60 H340" stroke={K} strokeWidth="14" />
          </g>
          {/* file di poltrone vuote del pubblico */}
          {[0, 1].map((row) => Array.from({ length: 7 }, (_, i) => {
            const x = -140 + i * 200 + row * 100, y = 1700 + row * 170;
            return (
              <g key={`${row}-${i}`}>
                <path d={`M${x - 80} ${y + 200} V${y} Q${x - 80} ${y - 50} ${x - 30} ${y - 50} H${x + 30} Q${x + 80} ${y - 50} ${x + 80} ${y} V${y + 200} Z`} fill="url(#mu-curtain)" stroke={K} strokeWidth="8" />
                <path d={`M${x - 60} ${y - 26} Q${x - 50} ${y - 40} ${x - 20} ${y - 40}`} stroke="#E86A6A" strokeWidth="5" fill="none" opacity=".45" />
              </g>
            );
          }))}
          <path d="M1280 2200 Q1100 1700 1180 1400" stroke="#1A1C20" strokeWidth="26" fill="none" />
        </g>

        {/* PIANO 5 — fasci dei riflettori con pulviscolo, particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)} opacity={lights}>
          <Beam id="mu-b1" x={100} y={520} t={t} length={900} spread={300} color="#FFF0C0" angle={60} sweep={3} opacity={0.18} />
          <Beam id="mu-b2" x={980} y={520} t={t} length={900} spread={300} color="#FFF0C0" angle={120} sweep={3} sweepRate={0.5} opacity={0.18} />
          <Dust t={t} top={{ y: 560, x0: 120, x1: 960 }} bottom={{ y: 1200, x0: 100, x1: 1000 }} seed={8} n={26} color="#FFF0C0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="mu-near" t={t} color="#FFF0C0" n={6} opacity={0.08} />
        </g>
        <rect x="-200" y="-200" width="1480" height="2400" fill="#000" opacity={0.4 * (1 - lights)} />
      </g>
      <Finish id="mu" tint="#2A1A30" tintOpacity={0.14} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): luci 0,2 → cue0 + 1,2 · video cue1 · «JOKER» cue1 + 1,4 · applausometro cue2 − 0,4 · invito cue2 + 1.
