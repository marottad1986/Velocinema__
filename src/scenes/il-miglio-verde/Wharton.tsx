import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Smoke, flashAt } from '../../lib/elements';
import { Finish, FxDefs } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Corridor, GOLD, K, Swarm } from './Comuni';

// Il male passa a Percy: il corridoio verde di notte. Su «John soffia quel male dentro Percy» uno sciame nero esce dalla
// cella di John e attraversa il corridoio verso il berretto di Percy; su «spara a Wild Bill» due spari (due lampi), le
// lampade scoppiano una dopo l'altra, la pistola cade sul pavimento e fuma, i bossoli rotolano; su «resta muto e immobile per
// sempre» lo sciame esce di nuovo e si dissolve, il berretto resta immobile per terra. Nessuna persona.
// Piani: corridoio (0,35) · cella aperta di Wild Bill a sinistra (0,8) · pavimento con pistola, bossoli e berretto (1,05) ·
// fumo e pulviscolo (1,6)

export const Wharton: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const go = eio(seg(t, griglia(cues[0] + 0.6), griglia(cues[0] + 0.6) + 1.6)); // lo sciame attraversa
  const shot = griglia(cues[1] + 1.2);
  const flash = flashAt(t, [shot, shot + 0.42]);
  const burst = seg(t, shot, shot + 1.4);
  const drop = seg(t, shot + 0.5, shot + 0.85) ** 2; // la pistola cade a terra subito dopo i due spari
  const out = seg(t, griglia(cues[2] + 0.5), griglia(cues[2] + 0.5) + 2.6);
  const sx = lerp(980, 380, go);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs><FxDefs id="wh" /></defs>
      <g transform={cam.transform}>
        <g transform={L(0.35)}>
          <Corridor t={t} id="wh" door={0.15} lamps={0.85} burst={burst} dark={0.35} flicker={go > 0 && go < 1 ? 0.5 : 0} />
        </g>
        {/* la cella di Wild Bill a sinistra, con la porta a sbarre spalancata */}
        <g transform={L(0.8)}>
          <path d="M-200 420 H200 V1320 H-200 Z" fill="#0A0E0A" />
          <g transform="translate(200 0) skewY(10) scale(0.6 1)">
            <rect x="0" y="420" width="300" height="900" fill="none" stroke="#5A6058" strokeWidth="18" />
            {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${24 + i * 50} 420 V1320`} stroke="#6A7066" strokeWidth="16" strokeLinecap="round" />)}
            <path d="M0 760 H300" stroke="#6A7066" strokeWidth="18" />
          </g>
          <path d="M200 420 V1320" stroke={K} strokeWidth="24" />
          {/* lo sciame che entra, guidato dal male: dalla cella di John verso il berretto */}
          {go > 0 && go < 1 && (
            <g>
              <Glow id="wh-sw" x={sx} y={1040} r={240} t={t} color="#2A2A20" amp={0.1} rate={4} opacity={0.5} />
              {Array.from({ length: 70 }, (_, i) => {
                const a = i * 2.39996;
                const r = 30 + (i % 9) * 18;
                return <ellipse key={i} cx={sx + Math.cos(a + t * 5) * r * 1.4} cy={1040 + Math.sin(a + t * 6) * r * 0.6} rx="5" ry="3.5" fill="#0A0A08" />;
              })}
            </g>
          )}
        </g>
        {/* il pavimento: la pistola caduta che fuma, i bossoli, il berretto di Percy */}
        <g transform={L(1.05)}>
          <path d="M-200 1200 H1280 V2200 H-200 Z" fill="#245236" opacity=".85" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M-200 ${1270 + i * 120} H1280`} stroke="#14281A" strokeWidth="4" opacity=".6" />)}
          <g transform="translate(400 1215) rotate(-14)">
            <path d="M-80 0 Q-80 -56 0 -60 Q80 -56 80 0 Z" fill="#2E3A48" stroke={K} strokeWidth="6" />
            <path d="M-86 0 H86 Q60 30 -60 20 Z" fill="#1A1E24" stroke={K} strokeWidth="6" />
            <rect x="-16" y="-42" width="32" height="20" rx="4" fill="#C8A85A" stroke={K} strokeWidth="3" />
          </g>
          {/* la pistola: compare dopo i due lampi e cade a terra */}
          <g opacity={t >= shot + 0.5 ? 1 : 0} transform={`translate(${lerp(700, 680, drop)} ${lerp(1000, 1210, drop)}) rotate(${lerp(-6, 24, drop)})`}>
            <path d="M-90 -20 H70 V6 H-30 L-40 50 H-76 L-66 6 H-90 Z" fill="#3A3E44" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <path d="M-80 -12 H60" stroke="#B8C0C8" strokeWidth="3" opacity=".5" />
            <path d="M-50 6 Q-40 24 -24 6" fill="none" stroke={K} strokeWidth="4" />
            <rect x="-62" y="-30" width="30" height="12" fill="#2A2E34" stroke={K} strokeWidth="3" />
          </g>
          {flash > 0 && <Glow id="wh-muzzle" x={780} y={990} r={200} t={t} color="#FFE6A8" amp={0} rate={1} opacity={flash} />}
          {/* i bossoli che rotolano */}
          {[0, 1].map((i) => {
            const p = eo(seg(t, shot + i * 0.42 + 0.05, shot + i * 0.42 + 0.9));
            return p > 0 && <rect key={i} x={lerp(720, 860 + i * 70, p)} y={1000 + 220 * p - 120 * Math.sin(p * Math.PI)} width="10" height="22" rx="3" fill={GOLD} stroke={K} strokeWidth="3" transform={`rotate(${p * 400} ${lerp(720, 860 + i * 70, p)} ${1000 + 220 * p})`} />;
          })}
          <path d="M-200 1680 H1280 V2200 H-200 Z" fill="#060806" opacity=".5" />
        </g>
        {/* il male esce di nuovo e svanisce sopra il berretto */}
        <g transform={L(1.05)}>
          <Swarm x={420} y={1170} t={t} p={out} n={80} spread={180} rise={480} seed={9} />
        </g>
        <g transform={L(1.6)}>
          {drop > 0 && <Smoke id="wh-smoke" t={t - shot} x={760} y={1190} color="#A8A898" n={6} rise={240} wind={60} r0={14} r1={60} speed={0.3} opacity={0.55} />}
          <Dust t={t} top={{ y: 700, x0: 420, x1: 660 }} bottom={{ y: 1300, x0: 240, x1: 840 }} seed={51} n={20} color="#FFE6A8" boost={0.1} />
          <NearMotes id="wh-near" t={t} color="#FFE6A8" n={5} y0={1200} opacity={0.06} />
        </g>
      </g>
      {flash > 0 && <rect width="1080" height="1920" fill="#FFF0D0" opacity={flash * 0.5} />}
      <Finish id="wh" tint="#142018" tintOpacity={0.14} />
    </svg>
  );
};
