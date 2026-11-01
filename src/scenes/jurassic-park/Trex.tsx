import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Beam, GlassDrops, Glow, Lightning, NearMotes, Rain, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Fence, JPDefs, JungleTree, K, TRex } from './Comuni';

// Il T-rex: di notte, sotto la pioggia, la vista da dentro la jeep ferma: il parabrezza con le gocce, il cruscotto e,
// grande al centro, il bicchiere d'acqua (oggetto chiave). Fuori la recinzione del T-rex con i cavi spenti.
// Eventi: seconda frase a ogni passo (cue 1 + 0,2 + 1,1·k, come i passi dello spartito) l'acqua del bicchiere fa cerchi
// e il bicchiere trema; terza frase lampo, i cavi si spezzano e il T-rex (generico, nel nostro stile) sfonda la
// recinzione e ruggisce (cue 2 + 0,5); quarta frase una valigetta da avvocato vola via nel fango (nessuna persona);
// quinta frase secondo lampo e la vista si rovescia (la jeep dei bambini); sesta frase il fascio di una torcia (Grant).
// Piani: cielo e lampi (0,2) · giungla (0,4) · recinzione (0,55) · T-rex (0,65) · valigetta nel fango (0,75)
//        · parabrezza, cruscotto e bicchiere (1,05) · pioggia vicina e gocce (1,5–1,8)

export const Trex: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const steps = [0, 1, 2, 3, 4].map((k) => cues[1] + 0.2 + k * 1.1);
  const last = steps.filter((s) => s <= t).pop();
  const since = last === undefined ? 9 : t - last;
  const thump = last === undefined ? 0 : Math.exp(-since * 5);
  const broken = eio(seg(t, cues[2], cues[2] + 0.8));
  const enter = eio(seg(t, cues[2] - 0.5, cues[2] + 0.5));
  const roar = seg(t, cues[2] + 0.5, cues[2] + 0.8) * (1 - seg(t, cues[2] + 2, cues[2] + 2.5)) + seg(t, cues[4], cues[4] + 0.3) * (1 - seg(t, cues[4] + 1, cues[4] + 1.4));
  const flash = flashAt(t, [cues[2] + 0.1, cues[4] + 0.2]);
  const brief = eo(seg(t, cues[3] + 0.2, cues[3] + 1.2));
  const roll = eio(seg(t, cues[4], cues[4] + 1.0));
  const torch = seg(t, cues[5], cues[5] + 0.4);
  const shake = thump * 6 + (roll > 0 && roll < 1 ? Math.sin(t * 40) * 6 : 0);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="tx" />
        <JPDefs id="tx" />
        <Lin id="tx-sky" stops={[[0, '#04080A'], [0.6, '#0E1A1E'], [1, '#1A2A2A']]} />
        <Lin id="tx-mud" stops={[[0, '#2A2418'], [1, '#100C08']]} />
        <Lin id="tx-dash" stops={[[0, '#3A3E36'], [0.2, '#24282A'], [1, '#101412']]} />
        <Lin id="tx-glass" x2={1} y2={0} stops={[[0, '#C8E8F0', 0.55], [0.35, '#FFFFFF', 0.25], [0.7, '#C8E8F0', 0.15], [1, '#C8E8F0', 0.5]]} />
        <Lin id="tx-water" stops={[[0, '#9AC8D8', 0.75], [1, '#4A7A90', 0.85]]} />
      </defs>

      <g transform={cam.transform}>
        <g transform={`rotate(${-38 * roll} 540 1000) translate(0 ${shake})`}>
          <clipPath id="tx-win"><path d="M-400 -400 H1480 V1120 Q540 1060 -400 1120 Z" /></clipPath>
          <g clipPath="url(#tx-win)">
          {/* PIANO 0 — cielo e lampi (0,2) */}
          <g transform={L(0.2)}>
            <rect x="-400" y="-400" width="1880" height="2800" fill="url(#tx-sky)" />
            <rect x="-400" y="-400" width="1880" height="2800" fill="#DCE8F0" opacity={0.4 * flash} />
            <Lightning x={900} y={520} h={360} flash={flash} seed={9} width={7} />
            <Rain t={t} level="far" seed={2} color="#5A7080" opacity={0.5} />
          </g>
          {/* PIANO 1 — giungla nera (0,4) */}
          <g transform={L(0.4)}>
            {Array.from({ length: 8 }, (_, i) => <JungleTree key={i} x={-160 + i * 200} y={1080} h={260 + (i % 3) * 60} t={t * 2} ph={i} leaf="#0E1E16" trunk="#0A140E" outline={false} />)}
            <path d="M-400 1060 H1480 V2400 H-400 Z" fill="url(#tx-mud)" />
          </g>
          {/* PIANO 2 — la recinzione che si spezza (0,55) */}
          <g transform={L(0.55)}>
            <Fence id="tx" x0={-60} x1={1140} y={1080} h={460} posts={5} broken={broken} sign={false} accent={P.accento} />
            {broken > 0 && broken < 1 && Array.from({ length: 10 }, (_, i) => <circle key={i} cx={540 + Math.cos(i) * 200 * broken} cy={860 + Math.sin(i * 1.7) * 140 * broken} r="6" fill="#FFE8A0" opacity={1 - broken} />)}
          </g>
          {/* PIANO 3 — il T-rex che sfonda e ruggisce (0,65) */}
          <g transform={L(0.65)}>
            <TRex id="tx" x={lerp(-760, 120, enter)} y={1160} s={1.05} t={t} jaw={roar} />
            <Glow id="tx-eye" x={lerp(-760, 120, enter) + 432} y={1160 - 490} r={60} t={t} color="#F2C14E" amp={0.1} rate={4} opacity={0.5} />
          </g>
          {/* PIANO 4 — la valigetta dell'avvocato che vola nel fango (0,75) */}
          <g transform={L(0.75)} opacity={seg(brief, 0, 0.1)}>
            <g transform={`translate(${lerp(700, 980, brief)} ${lerp(900, 1000, brief) - Math.sin(brief * Math.PI) * 220}) rotate(${brief * 300}) scale(1.3)`}>
              <rect x="-50" y="-34" width="100" height="68" rx="8" fill="url(#tx-wood)" stroke={K} strokeWidth="5" />
              <path d="M-20 -34 V-48 H20 V-34" stroke={K} strokeWidth="5" fill="none" />
              <rect x="-8" y="-6" width="16" height="12" fill="#E8C060" />
            </g>
          </g>

          </g>
          {/* PIANO 5 — parabrezza con le gocce, cruscotto e il bicchiere d'acqua (1,05) */}
          <g transform={L(1.05)}>
            <GlassDrops t={t} x={-100} y={560} w={1280} h={560} seed={7} n={18} color="#C8E0E8" />
            <path d="M-400 -400 H1480 V560 Q540 500 -400 560 Z" fill="#0E1210" stroke={K} strokeWidth="10" />
            <path d="M-400 560 Q540 500 1480 560" stroke="#3A3E36" strokeWidth="14" fill="none" />
            <rect x="-400" y="530" width="300" height="1900" fill="#14181A" transform="rotate(8 -100 530)" />
            <rect x="1180" y="530" width="300" height="1900" fill="#14181A" transform="rotate(-8 1180 530)" />
            <path d="M-400 1140 Q540 1080 1480 1140 V2400 H-400 Z" fill="url(#tx-dash)" stroke={K} strokeWidth="10" />
            <path d="M-300 1130 Q540 1074 1380 1130" stroke="#6A7068" strokeWidth="5" fill="none" />
            {/* radio, cassettino e pomello */}
            <rect x="380" y="1300" width="320" height="110" rx="10" fill="#1E2220" stroke={K} strokeWidth="7" />
            <rect x="400" y="1320" width="180" height="40" rx="4" fill="#3A6A4A" opacity={0.5 + 0.3 * Math.sin(t * 3)} />
            {[620, 670].map((x) => <circle key={x} cx={x} cy={1345} r="16" fill="url(#tx-steel)" stroke={K} strokeWidth="4" />)}
            <rect x="760" y="1420" width="420" height="160" rx="12" fill="#1A1E1C" stroke={K} strokeWidth="7" />
            <rect x="930" y="1480" width="80" height="20" rx="10" fill="url(#tx-steel)" stroke={K} strokeWidth="4" />
            <rect x="-120" y="1420" width="380" height="160" rx="12" fill="#1A1E1C" stroke={K} strokeWidth="7" />
            <path d="M-100 1440 H240" stroke="#4A504C" strokeWidth="4" />
            {[[200, 1240], [880, 1240]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="56" fill="#1A1E1C" stroke={K} strokeWidth="7" /><path d={`M${x} ${y} l${Math.cos(i + t * 0.1) * 40} ${-30}`} stroke={P.accento} strokeWidth="6" /><circle cx={x} cy={y} r="8" fill="#9AA29A" /></g>)}
            {/* il bicchiere d'acqua */}
            <g transform={`translate(${540 + thump * 4 * Math.sin(t * 60)} 1110)`}>
              <ellipse cx="0" cy="8" rx="100" ry="14" fill="#000" opacity=".4" />
              <path d="M-80 -240 L-64 0 H64 L80 -240 Z" fill="url(#tx-glass)" stroke={K} strokeWidth="7" />
              <clipPath id="tx-cupclip"><path d="M-78 -238 L-64 -2 H64 L78 -238 Z" /></clipPath>
              <g clipPath="url(#tx-cupclip)">
                <g transform={`rotate(${38 * roll} 0 -80)`}>
                  <rect x="-200" y="-150" width="400" height="300" fill="url(#tx-water)" />
                  <path d="M-200 -150 H200" stroke="#E8F8FF" strokeWidth="5" />
                </g>
              </g>
              {[0, 1, 2].map((k) => {
                const rr = (since * 1.2 + k * 0.25) % 1;
                return since < 1.1 ? <ellipse key={k} cx="0" cy="-150" rx={8 + 64 * rr} ry={2 + 12 * rr} fill="none" stroke="#FFFFFF" strokeWidth="3" opacity={(1 - rr) * 0.9} /> : null;
              })}
              <path d="M-56 -224 L-48 -20" stroke="#FFFFFF" strokeWidth="8" opacity=".6" strokeLinecap="round" />
              <Glow id="tx-cup" x={0} y={-140} r={180} t={t} color="#B8E0EC" amp={0.05} rate={2} opacity={0.25} />
            </g>
          </g>
          {/* PIANO 6 — la torcia di Grant (1,2) */}
          <g transform={L(1.2)} opacity={torch}>
            <Beam id="tx-torch" x={-60} y={700} t={t} length={1200} spread={360} color="#FFF4C8" angle={20} sweep={8} sweepRate={1.4} opacity={0.5} />
          </g>
        </g>

        {/* PIANO 7 — pioggia vicina (1,6) */}
        <g transform={L(1.6)}>
          <Rain t={t} level="near" seed={4} color="#B8C8D0" opacity={0.18} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="tx-near" t={t} color="#C8D8E0" n={5} opacity={0.07} />
        </g>
        <rect x="-200" y="-200" width="1480" height="2400" fill="#000" opacity={0.3 * roll} />
      </g>
      <Finish id="tx" tint="#0F1F17" tintOpacity={0.14} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): passi cue1 + 0,2 + 1,1·k · recinto cue2 → + 0,8, ruggito cue2 + 0,5 · valigetta cue3 + 0,2 · jeep rovesciata cue4 · torcia cue5.
