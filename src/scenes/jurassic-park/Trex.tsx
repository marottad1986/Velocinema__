import React from 'react';
import { camera, eio, mod, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Glow, GlassDrops, Lightning, NearMotes, Rain, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Fence, K, TRex } from './Comuni';

// Il T-rex: notte di pioggia vista da dentro la jeep ferma; sul cruscotto il bicchiere d'acqua con i cerchi che tremano
// a ogni passo; fuori i cavi della recinzione che si spezzano e cadono; torce, luci rosse; poi la jeep si rovescia.
// Il T-rex (generico, nel nostro stile) compare solo quando sfonda la recinzione, illuminato da lampi e torcia.
// Piani: cielo e lampi (0,2) · giungla (0,4) · recinzione (0,55) · impronta e torcia (0,7) · parabrezza e cruscotto (1,05) · pioggia vicina (1,6)

export const Trex: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  // passi: uno ogni 1,1 s a partire dalla frase dell'acqua che trema
  const steps = [0, 1, 2, 3, 4].map((k) => cues[1] + 0.2 + k * 1.1);
  const lastStep = steps.filter((s) => s <= t).pop();
  const since = lastStep === undefined ? 9 : t - lastStep;
  const quake = since < 0.5 ? Math.sin(since * 60) * (1 - since / 0.5) : 0;
  const broken = eio(seg(t, cues[2], cues[2] + 0.8)); // «abbatte il recinto»
  const roll = eio(seg(t, cues[4], cues[4] + 1.0)); // «rovescia la jeep»: la vista si inclina
  const flash = flashAt(t, [cues[2] + 0.1, cues[4] + 0.2]);
  const torch = seg(t, cues[5], cues[5] + 0.4); // una torcia: Grant porta via i bambini
  const enter = eio(seg(t, cues[2] - 0.5, cues[2] + 0.5)); // il T-rex sfonda il recinto
  const roar = seg(t, cues[2] + 0.5, cues[2] + 0.8) * (1 - seg(t, cues[2] + 2, cues[2] + 2.5)) + seg(t, cues[4], cues[4] + 0.3) * (1 - seg(t, cues[4] + 1, cues[4] + 1.4));
  const cam = camera(t, dur);
  const L = cam.layer;
  const shake = `translate(${quake * 10} ${quake * 6}) rotate(${roll * 32} 540 1100)`;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="tr" />
        <Lin id="tr-sky" stops={[[0, '#03070A'], [0.5, '#0A1614'], [1, '#14241E']]} />
        <Lin id="tr-mud" stops={[[0, '#2A3020'], [1, '#0E120C']]} />
        <Lin id="tr-dash" stops={[[0, '#2A2A26'], [1, '#0A0A08']]} />
        <Lin id="tr-water" stops={[[0, '#BFE4EC', 0.7], [1, '#7FB4C4', 0.8]]} />
      </defs>
      <g transform={`${cam.transform} ${shake}`}>
        {/* PIANO 0 — cielo nero e lampi */}
        <g transform={L(0.2)}>
          <rect x="-400" y="-400" width="1880" height="2800" fill="url(#tr-sky)" />
          <rect x="-400" y="-400" width="1880" height="2800" fill="#CFE2E8" opacity={flash * 0.3} />
          <Lightning x={820} y={520} h={380} flash={flash} seed={12} />
        </g>
        {/* PIANO 1 — giungla scura */}
        <g transform={L(0.4)}>
          {[-100, 150, 420, 700, 980, 1200].map((x, i) => <ellipse key={x} cx={x} cy={900 + (i % 2) * 40} rx="180" ry="240" fill="#0C1A12" />)}
          <Rain t={t} level="far" seed={4} color="#6E8A86" opacity={0.4} angle={14} />
        </g>
        {/* PIANO 2 — la recinzione che si spezza */}
        <g transform={L(0.55)}>
          <Fence x0={-60} x1={1140} y={1140} h={460} posts={5} broken={broken} sign={false} accent={P.accento} />
          {enter > 0 && (
            <g opacity={0.55 + 0.45 * Math.max(flash, torch * 0.6, 0.35)}>
              <TRex x={-300 + 620 * enter} y={1180} s={1.05} t={t} jaw={roar} />
            </g>
          )}
          {broken > 0 && broken < 1 && Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={540 + Math.cos(i) * 200 * broken} cy={900 + Math.sin(i * 1.7) * 140 * broken} r="6" fill="#FFE8A0" opacity={1 - broken} />
          ))}
        </g>
        {/* PIANO 3 — fango con l'impronta enorme e la torcia */}
        <g transform={L(0.7)}>
          <path d="M-400 1140 H1480 V2400 H-400 Z" fill="url(#tr-mud)" />
          <g transform="translate(760 1230)" opacity={seg(t, cues[3], cues[3] + 0.6)}>
            <path d="M0 40 Q-60 30 -50 -20 L-110 -110 L-70 -120 L-20 -50 L0 -150 L40 -150 L40 -50 L90 -110 L120 -90 L60 -10 Q60 40 0 40 Z" fill="#141810" stroke="#3A4030" strokeWidth="5" />
            <ellipse cx="0" cy="0" rx="40" ry="14" fill="#5A7A84" opacity=".6" />
          </g>
          {torch > 0 && (
            <g>
              <Beam id="tr-torch" x={140} y={1180} t={t} length={700} spread={150} color="#FFF4D0" angle={-20 + Math.sin(t * 3) * 10} opacity={0.4 * torch} />
              <Glow id="tr-torchg" x={140} y={1180} r={80} t={t} color="#FFF4D0" amp={0.1} rate={5} opacity={0.8 * torch} />
            </g>
          )}
        </g>
        {/* PIANO 4 — parabrezza bagnato e cruscotto con il bicchiere (accento sulla luce di emergenza) */}
        <g transform={L(1.05)}>
          <GlassDrops t={t} x={0} y={540} w={1080} h={640} seed={9} n={16} color="#9FC0C8" />
          <path d="M-400 -400 H-20 L140 1240 H-400 Z" fill="#050505" />
          <path d="M1480 -400 H1100 L940 1240 H1480 Z" fill="#050505" />
          <path d="M-400 1240 Q540 1180 1480 1240 V2400 H-400 Z" fill="url(#tr-dash)" stroke={K} strokeWidth="8" />
          <rect x="760" y="1190" width="120" height="40" rx="8" fill={P.accento} opacity={0.4 + 0.6 * (mod(t, 1) < 0.5 ? 1 : 0)} />
          <Glow id="tr-hazard" x={820} y={1210} r={120} t={t} color={P.accento} amp={0} opacity={mod(t, 1) < 0.5 ? 0.5 : 0.1} />
          {/* il bicchiere: a ogni passo, cerchi concentrici sull'acqua */}
          <g transform="translate(400 1150)">
            <path d="M-70 -120 L-56 60 H56 L70 -120 Z" fill="#DDEFF4" opacity=".35" stroke="#E8F4F8" strokeWidth="5" />
            <path d="M-66 -70 L-56 60 H56 L66 -70 Z" fill="url(#tr-water)" />
            <ellipse cx="0" cy={-70 + quake * 3} rx="66" ry="14" fill="#DDF2F8" stroke="#FFFFFF" strokeWidth="3" />
            {since < 1.2 && [0, 1, 2].map((k) => {
              const p = seg(since, k * 0.12, 0.7 + k * 0.12);
              return <ellipse key={k} cx="0" cy={-70 + quake * 3} rx={8 + 56 * p} ry={2 + 11 * p} fill="none" stroke="#5A8A9A" strokeWidth="3" opacity={(1 - p) * 0.9} />;
            })}
            <path d="M-56 -110 L-48 40" stroke="#FFFFFF" strokeWidth="6" opacity=".5" />
          </g>
        </g>
        <g transform={L(1.6)}>
          <Rain t={t} level="near" seed={19} color="#B8CCD0" opacity={0.45} angle={14} />
          <NearMotes id="tr-near" t={t} color="#B8CCD0" n={5} y0={1300} opacity={0.07} />
        </g>
      </g>
      <Finish id="tr" tint="#0F1F17" tintOpacity={0.13} />
    </svg>
  );
};
