import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Buio, Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { ConjDefs, K, Ombra, TINT_NOTTE } from './Comuni';

// La cantina sbarrata: il sottoscala della fattoria al buio, esplorato da una torcia (il passo avanti del video: il
// `Buio` della libreria, la scena si vede solo dove arriva il cono). Su «giocando a nascondino» il fascio corre sulla carta
// da parati e sulla scala e trova il vecchio armadio, che scivola di lato; su «sbarrato da assi di legno» il fascio si
// ferma sulla porticina con le assi inchiodate e le assi saltano una dopo l'altra; su «cominciano le cose strane» la porta
// si apre da sola sul nero, sale un respiro di freddo azzurro e la torcia trema. Nessuna persona (la torcia è la camera).
// Piani: parete e carta da parati (0,3) · scala e sottoscala (0,55) · porta, assi, armadio (0,7) · pavimento e giocattoli (1,1) · polvere (1,6)

export const Cantina: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tFind = griglia(cues[0] + 1.6);
  const slide = eo(seg(t, tFind, tFind + 1.4)); // l'armadio scivola di lato
  const tBoards = griglia(cues[1] + 0.4);
  const beat = 60 / 72;
  const boards = [0, 1, 2].map((i) => eo(seg(t, tBoards + i * beat, tBoards + i * beat + 0.5)));
  const tOpen = griglia(cues[2] + 0.4);
  const open = eob(seg(t, tOpen, tOpen + 1.6), 0.6);
  const breath = seg(t, tOpen + 0.3, tOpen + 2.6);
  const shiver = t > tOpen + 0.2 && t < tOpen + 1.4 ? 0.5 : 0.08;
  // il fascio della torcia: esplora, trova l'armadio, poi resta sulla porta (la torcia viene dal basso, fuori campo)
  const aim = t < tFind ? lerp(-140, -72, eo(seg(t, 0, tFind))) + Math.sin(t * 1.4) * 6 : -78 + Math.sin(t * 0.9) * 2.5;
  const len = 1250;
  // posizione della porticina sotto la scala
  const DX = 440, DY = 840;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cn" />
        <ConjDefs id="cn" />
        <Lin id="cn-wall" stops={[[0, '#4A4A3E'], [0.5, '#6A6450'], [1, '#3E3A2E']]} />
        <Lin id="cn-floor" stops={[[0, '#5A4430'], [1, '#2A1E14']]} />
        <Lin id="cn-dark" stops={[[0, '#050608'], [1, '#0E1418']]} />
        <pattern id="cn-wp" width="120" height="160" patternUnits="userSpaceOnUse">
          <path d="M60 20 Q76 40 60 60 Q44 40 60 20 Z M0 100 Q16 120 0 140 Q-16 120 0 100 Z M120 100 Q136 120 120 140 Q104 120 120 100 Z" fill="#8A7E5A" opacity=".55" />
          <path d="M60 60 V90 M0 140 V170" stroke="#5A6A4A" strokeWidth="3" opacity=".5" />
        </pattern>
      </defs>
      <g transform={cam.transform}>
        {/* parete con la carta da parati vecchia, macchiata e scollata */}
        <g transform={L(0.3)}>
          <rect x="-300" y="-200" width="1700" height="1600" fill="url(#cn-wall)" />
          <rect x="-300" y="-200" width="1700" height="1600" fill="url(#cn-wp)" />
          <path d="M-300 1180 H1400" stroke="#2A2418" strokeWidth="40" />
          <path d="M-300 1160 H1400" stroke="#8A7A5A" strokeWidth="5" opacity=".5" />
          <path d="M820 520 Q860 600 830 700 Q900 640 880 540 Z" fill="#2E2A20" opacity=".6" />
          {/* una cornice storta con un paesaggio */}
          <g transform="translate(860 700) rotate(4)">
            <rect x="-90" y="-70" width="180" height="140" fill="#5A3E24" stroke={K} strokeWidth="7" />
            <rect x="-70" y="-50" width="140" height="100" fill="#7A8A7A" />
            <path d="M-70 20 Q-20 -20 20 10 Q50 -10 70 10 V50 H-70 Z" fill="#4A5A3E" />
          </g>
        </g>
        {/* la scala che sale e il sottoscala */}
        <g transform={L(0.55)}>
          <path d="M-200 300 L760 1180 H-200 Z" fill="#1E1810" />
          <path d="M-200 300 L760 1180" stroke="url(#cn-wood)" strokeWidth="60" />
          <path d="M-200 300 L760 1180" stroke={K} strokeWidth="8" transform="translate(0 -30)" />
          <path d="M-200 300 L760 1180" stroke={K} strokeWidth="8" transform="translate(0 30)" />
          {/* ringhiera con i pioli */}
          {Array.from({ length: 9 }, (_, i) => {
            const x = -120 + i * 100;
            const y = 300 + (x + 200) * (880 / 960) - 30;
            return <path key={i} d={`M${x} ${y} V${y - 260}`} stroke="url(#cn-wood)" strokeWidth="16" />;
          })}
          <path d="M-200 30 L760 910" stroke="#6A4428" strokeWidth="26" />
          <path d="M-200 30 L760 910" stroke="#C89A5A" strokeWidth="4" opacity=".5" transform="translate(0 -10)" />
        </g>
        {/* la porticina della cantina, le assi inchiodate e il vecchio armadio */}
        <g transform={L(0.7)}>
          {/* vano: nero, e quando la porta si apre si vede la scala che scende */}
          <rect x={DX} y={DY} width={220} height={330} fill="url(#cn-dark)" stroke={K} strokeWidth="10" />
          {open > 0 && (
            <g opacity={open}>
              {[0, 1, 2, 3].map((i) => <path key={i} d={`M${DX + 30 + i * 12} ${DY + 160 + i * 44} H${DX + 190 - i * 12}`} stroke="#3A3428" strokeWidth="10" />)}
              <Glow id="cn-cold" x={DX + 110} y={DY + 230} r={220} t={t} color="#7FA8C8" amp={0.12} rate={3} opacity={0.35 * open} />
            </g>
          )}
          {/* la porta che si apre verso l'interno (si stringe sul cardine sinistro) */}
          <g transform={`translate(${DX} ${DY}) scale(${1 - open * 0.82} 1)`}>
            <rect x={0} y={0} width={220} height={330} fill="url(#cn-oldwood)" stroke={K} strokeWidth="8" />
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M${i * 55} 0 V330`} stroke={K} strokeWidth="4" opacity=".5" />)}
            <circle cx={190} cy={170} r={10} fill="#8A7A5A" stroke={K} strokeWidth="4" />
          </g>
          {/* le tre assi inchiodate che saltano */}
          {[[-14, 60], [12, 160], [-8, 260]].map(([rot, y], i) => {
            const b = boards[i];
            return (
              <g key={i} transform={`translate(${DX + 110 + b * (i % 2 ? 160 : -160)} ${DY + y + b * 340}) rotate(${rot + b * (i % 2 ? 70 : -80)})`} opacity={1 - seg(b, 0.85, 1)}>
                <rect x={-150} y={-24} width={300} height={48} fill="url(#cn-wood)" stroke={K} strokeWidth="7" />
                <path d="M-140 -6 H140" stroke="#2A1A10" strokeWidth="3" opacity=".6" />
                <circle cx={-128} cy={0} r={6} fill="#B8B8B0" stroke={K} strokeWidth="3" />
                <circle cx={128} cy={0} r={6} fill="#B8B8B0" stroke={K} strokeWidth="3" />
              </g>
            );
          })}
          {/* il respiro freddo che esce dalla cantina */}
          {breath > 0 && Array.from({ length: 6 }, (_, i) => {
            const p = (breath + i * 0.16) % 1;
            return <ellipse key={i} cx={DX + 110 + Math.sin(i * 2 + t) * 30} cy={DY + 300 - p * 360} rx={60 + p * 120} ry={30 + p * 40} fill="#A8C8E0" opacity={0.18 * Math.sin(p * Math.PI) * Math.min(1, breath * 3)} />;
          })}
          {/* il vecchio armadio, spostato per giocare a nascondino, che scivola di lato */}
          <g transform={`translate(${lerp(DX - 20, DX + 330, slide)} ${DY - 80})`}>
            <Ombra id="cn" x={150} y={420} rx={190} ry={22} />
            <rect x={0} y={0} width={300} height={420} fill="url(#cn-wood)" stroke={K} strokeWidth="9" />
            <path d="M-12 0 H312 V-30 H-12 Z" fill="#4A2E1A" stroke={K} strokeWidth="7" />
            <rect x={24} y={30} width={118} height={330} fill="none" stroke={K} strokeWidth="5" opacity=".6" />
            <rect x={158} y={30} width={118} height={330} fill="none" stroke={K} strokeWidth="5" opacity=".6" />
            <circle cx={136} cy={200} r={7} fill="#C8A060" stroke={K} strokeWidth="3" />
            <circle cx={164} cy={200} r={7} fill="#C8A060" stroke={K} strokeWidth="3" />
            <path d="M10 10 V400" stroke="#C89A5A" strokeWidth="4" opacity=".5" />
            {[30, 270].map((x) => <rect key={x} x={x - 14} y={420} width={28} height={26} fill="#2A1A10" stroke={K} strokeWidth="5" />)}
          </g>
          {/* graffi sul pavimento lasciati dall'armadio */}
          <path d={`M${DX} ${DY + 360} H${lerp(DX, DX + 330, slide)}`} stroke="#C8A878" strokeWidth="4" opacity={0.5 * slide} strokeDasharray="30 14" />
        </g>
        {/* pavimento di assi e giocattoli lasciati dal gioco (una trottola, una palla, un cubo) */}
        <g transform={L(1.1)}>
          <path d="M-300 1250 H1400 V2200 H-300 Z" fill="url(#cn-floor)" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-300 ${1290 + i * 60} H1400`} stroke="#1E140C" strokeWidth="4" />)}
          <g transform={`translate(240 1238) rotate(${Math.sin(t * 2) * 4})`}>
            <path d="M-40 -60 Q0 -86 40 -60 L0 0 Z" fill="#B83A2A" stroke={K} strokeWidth="6" />
            <path d="M0 -84 V-104" stroke={K} strokeWidth="8" />
            <path d="M-34 -64 Q0 -74 34 -64" stroke="#F2E8D0" strokeWidth="6" fill="none" />
          </g>
          <circle cx="880" cy="1222" r="38" fill="#3A6A9A" stroke={K} strokeWidth="6" />
          <path d="M846 1210 Q880 1190 914 1210" stroke="#F2E8D0" strokeWidth="6" fill="none" />
          <g transform="translate(110 1226) rotate(-8)">
            <rect x="-30" y="-30" width="60" height="60" fill="#E8C060" stroke={K} strokeWidth="6" />
            <text x="0" y="14" fontSize="36" textAnchor="middle" fontFamily="serif" fontWeight="700" fill="#5A3A1A">A</text>
          </g>
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 1500, x0: 480, x1: 600 }} bottom={{ y: 900, x0: 300, x1: 800 }} seed={207} n={26} color="#FFE6B0" boost={0.25} />
        </g>
        {/* il buio: la scena si vede solo nel cono della torcia (dal basso, fuori campo) e nella luce fredda della cantina */}
        <Buio id="cn-b" t={t} darkness={0.9} flicker={shiver} tint="#FFD890" tintOpacity={0.16}
          lights={[
            { x: 540, y: 2000, r: 260, angle: aim, length: len, spread: 34 },
            { x: DX + 110, y: DY + 220, r: 260 * open, power: 0.5 * open },
          ]} />
        <g transform={L(1.6)}>
          <NearMotes id="cn-near" t={t} color="#C8D8E8" n={5} y0={1100} opacity={0.06} />
        </g>
      </g>
      <Finish id="cn" tint={TINT_NOTTE} tintOpacity={0.12} />
    </svg>
  );
};
