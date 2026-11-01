import React from 'react';
import { camera, eio, eo, eob, lerp, seg } from '../../lib/anim';
import { Drips, Fireflies, Fog, Glow, NearMotes, Rain, Stars } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Fern, JPDefs, Jeep, JungleTree, K, Ombra } from './Comuni';

// La notte nella giungla: sotto la pioggia, una jeep impantanata con i fari accesi nel fango; in primo piano la pozza
// di fango dove scivola la bomboletta con gli embrioni (oggetto chiave); a destra un albero enorme con un grande ramo.
// Eventi: seconda frase nei fari si apre il collare di un piccolo dinosauro generico (velenoso) e poco dopo i fari si
// spengono (cue 1 → + 0,8: il programmatore non c'è più, nessuna persona); terza frase la bomboletta scivola nel fango e
// sparisce (cue 2 → + 1,6); quarta frase sul ramo compare un cappello da esploratore (Grant e i bambini sull'albero), la
// pioggia cala e spuntano le stelle e le lucciole.
// Piani: cielo (0,2) · giungla lontana (0,4) · fango, jeep e dinosauro (0,7) · albero con il ramo (0,9)
//        · pozza con la bomboletta (1,0) · felci (1,25) · pioggia vicina e particelle (1,5–1,8)

export const Notte: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const frill = eob(seg(t, cues[1] - 0.4, cues[1] + 0.2));
  const lightsOut = seg(t, cues[1], cues[1] + 0.8);
  const lights = 1 - lightsOut;
  const slide = eo(seg(t, cues[2], cues[2] + 1.6));
  const calm = eio(seg(t, cues[3], dur));
  const hat = eob(seg(t, cues[3] + 0.2, cues[3] + 0.8));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="nt" />
        <JPDefs id="nt" />
        <Lin id="nt-sky" stops={[[0, '#04080A'], [0.6, '#0A1612'], [1, '#14221C']]} />
        <Lin id="nt-mud" stops={[[0, '#3A2E1E'], [1, '#14100A']]} />
        <Lin id="nt-pool" stops={[[0, '#4A3A26'], [1, '#2A2014']]} />
        <Lin id="nt-can" x2={1} y2={0} stops={[[0, '#6A7A84'], [0.4, '#E8F0F4'], [0.6, '#B8C4CC'], [1, '#4A545C']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo: pioggia, poi stelle (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#nt-sky)" />
          <g opacity={calm}><Stars t={t} seed={8} n={50} x={-100} y={150} w={1280} h={500} color="#E8F0F8" size={1.1} /></g>
          <g opacity={1 - calm}><Rain t={t} level="far" seed={3} color="#5A7080" opacity={0.55} /></g>
        </g>
        {/* PIANO 1 — giungla lontana (0,4) */}
        <g transform={L(0.4)}>
          {Array.from({ length: 8 }, (_, i) => <JungleTree key={i} x={-160 + i * 190} y={1000} h={220 + (i % 3) * 70} t={t * (2 - calm)} ph={i} leaf={['#0E2218', '#14281E', '#0A1C14'][i % 3]} trunk="#0A140E" outline={false} />)}
          <Fog id="nt-fog" t={t} y={980} rx={800} ry={70} color="#3A5048" opacity={0.4} />
        </g>

        {/* PIANO 2 — fango, la jeep impantanata con i fari, il piccolo dinosauro col collare (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 980 H1280 V2200 H-200 Z" fill="url(#nt-mud)" />
          {[1040, 1100, 1180].map((y, i) => <path key={y} d={`M-200 ${y} Q540 ${y - 16} 1280 ${y}`} stroke="#1A140C" strokeWidth={5 + i * 2} fill="none" opacity=".6" />)}
          <path d="M600 1040 L1100 900 L1100 1200 Z" fill="#FFF6D0" opacity={0.16 * lights} />
          <g transform="translate(400 1060)">
            <Ombra id="nt" x={0} y={44} rx={220} ry={20} />
            <Jeep id="nt" x={0} y={0} s={1.15} accent={P.accento} lights={lights} tilt={-6} />
            {[-130, 130].map((x) => <ellipse key={x} cx={x} cy={56} rx="60" ry="16" fill="#3A2E1E" />)}
          </g>
          {/* il piccolo dinosauro con il collare, nei fari */}
          <g transform="translate(720 1060) scale(1.3)" opacity={0.3 + 0.7 * lights}>
            <path d="M-80 0 Q-90 -60 -20 -70 Q40 -74 60 -40 L50 0 Z" fill="#4A6A3A" stroke={K} strokeWidth="6" />
            <path d="M-80 -30 Q-160 -20 -200 0" stroke="#4A6A3A" strokeWidth="18" fill="none" strokeLinecap="round" />
            <path d="M-40 0 V30 M20 0 V30" stroke={K} strokeWidth="12" />
            <g transform="translate(60 -70)">
              <g transform={`scale(${0.2 + frill})`} opacity={seg(frill, 0, 0.2)}>
                <path d="M0 0 L-70 -50 L-40 -90 L0 -70 L40 -100 L80 -60 L60 -10 Z" fill="#E8B03A" stroke={K} strokeWidth="5" />
                {[-40, 0, 40].map((a) => <path key={a} d={`M10 -10 L${a} -80`} stroke="#C2301E" strokeWidth="5" />)}
              </g>
              <path d="M-10 0 Q0 -30 40 -26 Q70 -20 72 0 Q60 14 20 12 Z" fill="#5A7A44" stroke={K} strokeWidth="6" />
              <circle cx="36" cy="-10" r="7" fill="#F2E05A" stroke={K} strokeWidth="3" />
            </g>
          </g>
          <Glow id="nt-hl" x={640} y={1030} r={260} t={t} color="#FFF6D0" amp={0.04} rate={2} opacity={0.4 * lights} />
        </g>

        {/* PIANO 3 — l'albero enorme con il ramo e il cappello (0,9) */}
        <g transform={L(0.9)}>
          <path d="M900 1260 Q880 900 920 520 H1100 Q1080 900 1120 1260 Z" fill="url(#nt-trunk)" stroke={K} strokeWidth="10" />
          <path d="M940 1200 Q930 900 950 560" stroke="#6A5438" strokeWidth="6" fill="none" opacity=".6" />
          <path d="M930 760 Q700 720 420 760 Q400 780 430 796 Q700 770 940 820 Z" fill="url(#nt-trunk)" stroke={K} strokeWidth="9" />
          {[[560, 750], [700, 736], [480, 760]].map(([x, y], i) => <g key={i}>{[-1, 1].map((d) => <ellipse key={d} cx={x + d * 30} cy={y - 30} rx="50" ry="24" fill="#14281E" stroke={K} strokeWidth="5" transform={`rotate(${d * 20} ${x} ${y})`} />)}</g>)}
          <Drips t={t} x={600} y0={800} y1={1000} n={3} period={1.2 + calm} color="#9AB0B8" ripple={0} />
          <g transform={`translate(660 ${lerp(680, 730, hat)})`} opacity={seg(hat, 0, 0.2)}>
            <ellipse cx="0" cy="0" rx="80" ry="18" fill="#8A6A44" stroke={K} strokeWidth="6" />
            <path d="M-48 -2 Q-44 -56 0 -58 Q44 -56 48 -2 Z" fill="#9A7A50" stroke={K} strokeWidth="6" />
            <path d="M-46 -16 H46" stroke="#4A3220" strokeWidth="10" />
          </g>
        </g>

        {/* PIANO 4 — la pozza di fango con la bomboletta che scivola e sparisce (1,0) */}
        <g transform={L(1.0)}>
          <ellipse cx="300" cy="1220" rx="360" ry="60" fill="url(#nt-pool)" stroke={K} strokeWidth="6" />
          <path d="M60 1210 Q300 1190 540 1214" stroke="#7A6A50" strokeWidth="4" fill="none" opacity=".6" />
          {[0, 1, 2].map((k) => { const p = (t * 0.6 + k / 3) % 1; return <ellipse key={k} cx={240 + k * 80} cy={1222} rx={10 + 60 * p} ry={3 + 12 * p} fill="none" stroke="#9A8A6A" strokeWidth="3" opacity={(1 - p) * 0.6 * (1 - calm)} />; })}
          <g transform={`translate(${lerp(520, 260, slide)} ${lerp(1170, 1230, slide)}) rotate(${lerp(70, 110, slide)})`} opacity={1 - seg(slide, 0.75, 1)}>
            <rect x="-30" y="-110" width="60" height="140" rx="10" fill="url(#nt-can)" stroke={K} strokeWidth="6" />
            <rect x="-20" y="-136" width="40" height="30" rx="8" fill="#E8483A" stroke={K} strokeWidth="5" />
            <path d="M-18 -96 V10" stroke="#FFFFFF" strokeWidth="6" opacity=".6" />
          </g>
          <ellipse cx="300" cy="1250" rx="360" ry="30" fill="url(#nt-mud)" opacity=".8" />
          {/* radici dell'albero e sassi nel fango */}
          {[[1000, 1250, -300], [1060, 1260, -120], [1100, 1240, 160]].map(([x, y, d], i) => <path key={i} d={`M${x} ${y} q${d * 0.4} 60 ${d} 160`} stroke="url(#nt-trunk)" strokeWidth={34 - i * 6} fill="none" strokeLinecap="round" />)}
          {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={(i * 211) % 1300 - 120} cy={1330 + ((i * 97) % 500)} rx={14 + (i % 3) * 8} ry={8 + (i % 2) * 4} fill="#4A3E2C" stroke={K} strokeWidth="3" />)}
          {[[200, 1560, 220], [760, 1700, 180]].map(([x, y, w], i) => <ellipse key={i} cx={x} cy={y} rx={w} ry={w * 0.14} fill="#2A3A40" opacity={0.6} />)}
        </g>

        {/* PIANO 5 — felci bagnate in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <Fern x={-60} y={2000} s={2.4} t={t} ph={0} color="#1E5A36" />
          <Fern x={1140} y={2000} s={2.3} t={t} ph={1} color="#1A4E30" flip />
          <Fern x={560} y={2140} s={1.6} t={t} ph={2} color="#24603C" />
        </g>

        {/* PIANO 6 — pioggia vicina che cala, lucciole quando smette (1,5–1,8) */}
        <g transform={L(1.5)}>
          <g opacity={1 - calm}><Rain t={t} level="near" seed={6} color="#9AB0B8" opacity={0.3} /></g>
          <g opacity={calm}><Fireflies id="nt-ff" t={t} seed={4} n={14} x={0} y={900} w={1080} h={500} color="#E8F08A" /></g>
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="nt-near" t={t} color="#C8D8C0" n={5} opacity={0.07} />
        </g>
      </g>
      <Finish id="nt" tint="#0F1F17" tintOpacity={0.14} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): collare cue1 − 0,4 · fari spenti cue1 → + 0,8 · bomboletta cue2 → + 1,6 · cappello e stelle cue3.
