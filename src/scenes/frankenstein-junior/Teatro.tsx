import React from 'react';
import { camera, eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Embers, Glow, NearMotes, Notes, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Lo spettacolo: palcoscenico di un teatro anni '30 con sipario di velluto, insegna luminosa, due cilindri e due
// bastoni in scena (nessuna persona). Il riflettore esplode in una pioggia di scintille; poi cadono le catene.
// Eventi: note dalla buca dell'orchestra (cue 0) · si apre il sipario (cue 1) · cilindri e bastoni saltano in scena (cue 2)
//         · tip tap: bastoni e cilindri a tempo (cue 3) · esplode il riflettore, lampo (cue 4) · catene che cadono (cue 5).
// Piani: fondale (0,2) · boccascena, insegna e riflettori (0,45) · palco con cilindri e bastoni (0,65)
//        · sipario (0,75) · buca dell'orchestra e leggii in primo piano (1,2) · scintille, note, pulviscolo (1,5–1,8)

const K = '#0C0B0C';
const ACC = '#8EF0C8';
const r = rng(1974);
const BULBS = Array.from({ length: 22 }, (_, i) => i);
const SHARDS = Array.from({ length: 10 }, () => ({ vx: (r() - 0.6) * 300, vy: -40 - r() * 120, rot: r() * 360 }));

/** Cilindro (cappello). */
const TopHat: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <ellipse cx="0" cy="0" rx="70" ry="16" fill="#1A1A1C" stroke={K} strokeWidth="7" />
    <path d="M-44 0 V-96 Q0 -106 44 -96 V0 Z" fill="#202024" stroke={K} strokeWidth="7" />
    <rect x="-44" y="-26" width="88" height="16" fill="#3A3A40" />
    <path d="M-34 -90 V-10" stroke="#8C8C96" strokeWidth="5" opacity=".6" />
  </g>
);

/** Bastone da tip tap con pomolo. */
const Cane: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M0 0 V-190" stroke={K} strokeWidth="14" strokeLinecap="round" />
    <path d="M0 0 V-190" stroke="#2A2A2E" strokeWidth="8" strokeLinecap="round" />
    <path d="M0 -190 q0 -26 26 -26" fill="none" stroke="#E8E2D2" strokeWidth="12" strokeLinecap="round" />
    <path d="M0 -8 V0" stroke="#E8E2D2" strokeWidth="10" />
  </g>
);

/** Catena verticale fatta di maglie alternate. */
const Chain: React.FC<{ x: number; y0: number; y1: number }> = ({ x, y0, y1 }) => (
  <g fill="none" stroke="url(#te-chain)" strokeWidth="7">
    {Array.from({ length: Math.max(0, Math.floor((y1 - y0) / 22)) }, (_, i) => (
      i % 2 ? <ellipse key={i} cx={x} cy={y0 + i * 22} rx="4" ry="14" /> : <ellipse key={i} cx={x} cy={y0 + i * 22} rx="10" ry="14" stroke="#0C0B0C" strokeWidth="11" />
    ))}
    {Array.from({ length: Math.max(0, Math.floor((y1 - y0) / 22)) }, (_, i) => (i % 2 ? null : <ellipse key={`b${i}`} cx={x} cy={y0 + i * 22} rx="10" ry="14" />))}
  </g>
);

export const Teatro: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const curtain = eio(seg(t, cues[1], cues[1] + 1.4));
  const appear = eob(seg(t, cues[2], cues[2] + 0.6), 2);
  const tapOn = seg(t, cues[3] - 0.1, cues[3] + 0.2) * (1 - seg(t, cues[5], cues[5] + 0.3));
  const beat = mod(t * 2.6, 1);
  const hop = Math.sin(beat * Math.PI) * 30 * tapOn;
  const boom = seg(t, cues[4], cues[4] + 0.2);
  const flash = flashAt(t, [cues[4]]);
  const lamp2 = 1 - seg(t, cues[4], cues[4] + 0.1);
  const sparkP = seg(t, cues[4], cues[4] + 1.6);
  const chains = eo(seg(t, cues[5] - 0.1, cues[5] + 0.6));
  const knocked = eo(seg(t, cues[5] + 0.3, cues[5] + 0.8));
  const notes = seg(t, 0, 0.5) * (1 - 0.6 * seg(t, cues[4], cues[4] + 0.5));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="te" />
        <Lin id="te-back" stops={[[0, '#0A0A0C'], [0.4, '#1C1C22'], [0.8, '#2A2A30'], [1, '#18181C']]} />
        <Lin id="te-arch" x2={1} y2={0} stops={[[0, '#221E1A'], [0.5, '#3E352A'], [1, '#221E1A']]} />
        <Lin id="te-velvet" x2={1} y2={0} stops={[[0, '#3A1E22'], [0.3, '#6A3A40'], [0.6, '#4A262C'], [1, '#2A1418']]} />
        <Lin id="te-floor" stops={[[0, '#5A4A3A'], [0.5, '#3E3226'], [1, '#2A2018']]} />
        <Lin id="te-sign" stops={[[0, '#2A2A30'], [1, '#141418']]} />
        <Lin id="te-pit" stops={[[0, '#141216'], [1, '#060506']]} />
        <Lin id="te-chain" x2={1} y2={0} stops={[[0, '#4A5056'], [0.5, '#B7BEC6'], [1, '#4A5056']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — fondale scuro con una luna dipinta (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#te-back)" />
          <circle cx="760" cy="860" r="90" fill="#3A3A42" opacity=".8" />
          <path d="M140 1180 Q300 1060 460 1120 Q640 1020 820 1110 Q920 1080 960 1180 Z" fill="#24242A" />
        </g>

        {/* PIANO 1 — boccascena, insegna con lampadine, riflettori (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-200 -200 H1280 V1260 H980 V720 Q540 640 100 720 V1260 H-200 Z" fill="url(#te-arch)" stroke={K} strokeWidth="10" />
          <path d="M100 720 Q540 640 980 720" fill="none" stroke="#C9B48A" strokeWidth="6" opacity=".6" />
          {[60, 1020].map((x) => <path key={x} d={`M${x} 740 V1240`} stroke="#5A4A38" strokeWidth="18" />)}
          {/* insegna */}
          <g transform="translate(540 604)">
            <rect x="-390" y="-40" width="780" height="80" rx="10" fill="url(#te-sign)" stroke={K} strokeWidth="9" />
            {BULBS.map((i) => {
              const top = i < 11, k = top ? i : i - 11;
              const on = 0.45 + 0.55 * (Math.floor(t * 6 + i) % 2);
              return <circle key={i} cx={-360 + k * 72} cy={top ? -27 : 27} r="6" fill="#F6E4B4" opacity={on} />;
            })}
            <Glow id="te-sg" x={0} y={0} r={420} t={t} color="#F3DDA8" amp={0.06} rate={3} opacity={0.25} />
            <text x="0" y="14" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="36" fill="#F4EEDD" letterSpacing="4">PUTTIN' ON THE RITZ</text>
          </g>
          {/* riflettori appesi: il destro esplode */}
          {[260, 820].map((x, i) => {
            const on = i === 1 ? lamp2 : 1;
            return (
              <g key={x}>
                <g transform={`translate(${x} 740) rotate(${i ? 30 : -30})`}>
                  <rect x="-30" y="-24" width="60" height="70" rx="8" fill="#2A2A2E" stroke={K} strokeWidth="7" />
                  <ellipse cx="0" cy="46" rx="30" ry="10" fill={on > 0.5 ? '#FFF4D6' : '#3A3A40'} stroke={K} strokeWidth="5" />
                </g>
                <Beam id={`te-beam${i}`} x={x + (i ? -24 : 24)} y={780} t={t} length={560} spread={260} color="#FFF4D6" angle={i ? 112 : 68} sweep={3} sweepRate={1.1 + i * 0.3} opacity={0.4 * on * (0.3 + 0.7 * curtain)} />
              </g>
            );
          })}
          {/* esplosione del riflettore destro */}
          {boom > 0 && sparkP < 1 && (
            <g>
              <Glow id="te-boom" x={820} y={780} r={260} t={t} color={ACC} amp={0.2} rate={20} opacity={0.9 * (1 - sparkP)} />
              <path d="M820 780 l40 -60 l-10 50 l60 -20 l-50 40 l60 20 l-60 0 l20 50 l-40 -40 l-30 50 l0 -50 l-50 20 l30 -40 l-50 -30 l60 10 Z" fill="#F2FFF9" stroke={K} strokeWidth="5" opacity={1 - seg(sparkP, 0, 0.3)} />
              {SHARDS.map((s, i) => (
                <path key={i} d="M0 -10 L8 6 L-8 6 Z" fill="#DCE4EA" stroke={K} strokeWidth="3" transform={`translate(${820 + s.vx * eo(sparkP)} ${780 + s.vy * Math.sin(sparkP * Math.PI) + 400 * sparkP * sparkP}) rotate(${s.rot + 400 * sparkP})`} />
              ))}
            </g>
          )}
        </g>

        {/* PIANO 2 — palco con cilindri e bastoni (0,65) */}
        <g transform={L(0.65)}>
          <path d="M60 1180 H1020 L1080 1270 H0 Z" fill="url(#te-floor)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${100 + i * 110} 1180 L${40 + i * 125} 1270`} stroke="#2A2018" strokeWidth="4" opacity=".7" />)}
          <path d="M60 1186 H1020" stroke="#B9A27A" strokeWidth="4" opacity=".7" />
          {/* macchie di luce dei riflettori sul palco */}
          <ellipse cx="420" cy="1220" rx="180" ry="26" fill="#FFF4D6" opacity={0.18 * curtain} />
          <ellipse cx="660" cy="1220" rx="180" ry="26" fill="#FFF4D6" opacity={0.18 * curtain * lamp2} />
          {/* cilindri e bastoni: entrano, ballano, poi le catene li buttano giù */}
          {[[420, -1], [660, 1]].map(([x, d], i) => (
            <g key={i} opacity={appear > 0 ? 1 : 0} transform={`translate(0 ${(1 - appear) * 60})`}>
              <TopHat x={x + d * 14 * knocked} y={1140 - hop * (i ? 1 - beat : beat) - 40 * knocked * (1 - knocked) * 4} rot={d * (8 * Math.sin(t * 5.2) * tapOn + 70 * knocked)} />
              <Cane x={x + d * 90} y={1214} rot={d * (12 + 18 * Math.sin(beat * Math.PI * 2) * tapOn) + d * 60 * knocked} />
              {/* segni del tip tap sul pavimento */}
              {tapOn > 0 && beat < 0.25 && <path d={`M${x + d * 90 - 30} 1226 l-14 10 M${x + d * 90 + 30} 1226 l14 10 M${x + d * 90} 1230 v14`} stroke="#F4EEDD" strokeWidth="5" strokeLinecap="round" opacity={1 - beat * 4} />}
            </g>
          ))}
          {/* catene che cadono dall'alto e si ammucchiano sul palco */}
          {chains > 0 && (
            <g>
              {[470, 610].map((x, i) => <Chain key={x} x={x + (i ? 20 : -20) * chains} y0={-200} y1={lerp(-200, 1190, chains)} />)}
              <g opacity={seg(t, cues[5] + 0.4, cues[5] + 0.6)}>
                {Array.from({ length: 11 }, (_, i) => (
                  <ellipse key={i} cx={430 + i * 22} cy={1206 + Math.sin(i * 1.3) * 8} rx={i % 2 ? 6 : 14} ry={i % 2 ? 12 : 8} fill="none" stroke="url(#te-chain)" strokeWidth="7" />
                ))}
              </g>
            </g>
          )}
        </g>

        {/* lampo dell'esplosione */}
        <rect x="-200" y="-200" width="1480" height="2320" fill="#E8F4EE" opacity={flash * 0.35} />

        {/* PIANO 3 — sipario di velluto che si apre (0,75) */}
        <g transform={L(0.75)}>
          {[-1, 1].map((d) => {
            const w = lerp(470, 150, curtain);
            const x0 = d < 0 ? 70 : 1010;
            const sway = Math.sin(t * 1.4 + d) * 6;
            return (
              <g key={d}>
                <path d={`M${x0} 690 H${x0 - d * -w} Q${x0 - d * -w + d * -20 + sway} 960 ${x0 - d * -w + d * 30} 1240 H${x0} Z`} fill="url(#te-velvet)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
                {[0.25, 0.5, 0.75].map((k) => <path key={k} d={`M${x0 - d * -w * k} 700 Q${x0 - d * -w * k + sway} 960 ${x0 - d * -w * k + d * 10} 1236`} fill="none" stroke="#2A1418" strokeWidth="6" opacity=".8" />)}
                <path d={`M${x0 - d * -w * 0.6} 700 Q${x0 - d * -w * 0.6 + sway} 960 ${x0 - d * -w * 0.6 + d * 10} 1236`} fill="none" stroke="#9A5A62" strokeWidth="4" opacity=".6" />
              </g>
            );
          })}
          <path d="M40 680 Q300 760 540 690 Q780 760 1040 680 V650 H40 Z" fill="url(#te-velvet)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M60 690 Q300 766 540 700" fill="none" stroke="#C9B48A" strokeWidth="5" opacity=".7" />
        </g>

        {/* PIANO 4 — buca dell'orchestra con leggii e luci di ribalta (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1330 H1280 V2200 H-200 Z" fill="url(#te-pit)" stroke={K} strokeWidth="9" />
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i}>
              <Glow id={`te-foot${i}`} x={-60 + i * 130} y={1330} r={60} t={t} color="#F3DDA8" amp={0.1} rate={2 + i * 0.3} opacity={0.6} />
              <path d={`M${-90 + i * 130} 1340 h60 v-14 h-60 Z`} fill="#2A2A2E" stroke={K} strokeWidth="5" />
            </g>
          ))}
          {[120, 420, 720, 1000].map((x, i) => (
            <g key={x} transform={`translate(${x} 1560) rotate(${(i % 2 ? 1 : -1) * 6})`}>
              <path d="M0 0 V260 M-40 260 H40" stroke="#2A2A2E" strokeWidth="10" />
              <path d="M-90 -100 H90 L80 0 H-80 Z" fill="#1E1E22" stroke={K} strokeWidth="7" />
              <path d="M-70 -86 H70 L62 -14 H-62 Z" fill="#E8E2D2" opacity=".85" />
              {[0, 1, 2, 3].map((k) => <path key={k} d={`M-60 ${-74 + k * 16} H60`} stroke="#5A5650" strokeWidth="2" />)}
              <Glow id={`te-pl${i}`} x={0} y={-110} r={80} t={t} color="#F3DDA8" amp={0.1} rate={3} opacity={0.4} />
            </g>
          ))}
        </g>

        {/* PIANO 5 — note, scintille, pulviscolo (1,5–1,8) */}
        <g transform={L(1.5)} opacity={notes}>
          <Notes t={t} x={540} y={1480} n={7} color="#F4EEDD" outline={K} rise={420} spread={700} speed={0.3} size={1} />
        </g>
        <g transform={L(1.5)} opacity={sparkP > 0 && sparkP < 1 ? 1 : 0}>
          <Embers t={t * 3} x={820} y={820} w={120} h={-500} n={22} seed={9} hot="#F2FFF9" warm={ACC} drift={-200} />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 780, x0: 230, x1: 290 }} bottom={{ y: 1220, x0: 260, x1: 600 }} n={18} color="#FFF4D6" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="te-near" t={t} color="#F3DDA8" n={6} vx={-25} vy={-8} opacity={0.07} />
        </g>
      </g>

      <Finish id="te" tint="#5E6B75" tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): note da subito · sipario cue1 → +1,4 · cilindri e bastoni cue2 · tip tap cue3 → cue5
// · esplosione del riflettore e lampo cue4 · catene cue5 − 0,1 → +0,6, cilindri rovesciati + 0,3.
