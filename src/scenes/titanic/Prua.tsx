import React from 'react';
import { camera, eio, eo, mod, seg } from '../../lib/anim';
import { Dust, Glow, Gulls, NearMotes, SunRays, WaveLines } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Diamond, K } from './Comuni';

// Il disegno: al tramonto la prua che fende il mare, con il vento negli stralli e i gabbiani (le braccia aperte «come se
// volasse» le raccontano il vento e i gabbiani, nessuna figura); su «poi la disegna» un album da disegno aperto con le
// matite e il diamante, dove compare il tratto di un cuore; su «lo lascia nella cassaforte di Cal» la cassaforte si
// chiude sul foglio arrotolato (accento sul diamante). Nessuna persona.
// Piani: cielo al tramonto (0,2) · mare (0,35) · prua (0,6) / tavolo (0,6) · album e diamante (0,9) · cassaforte (1,1) · gabbiani (1,6)

export const Prua: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const draw = eio(seg(t, cues[1] - 0.2, cues[1] + 0.6)); // dalla prua all'album
  const sketch = eo(seg(t, cues[1] + 0.4, cues[2])); // il disegno prende forma
  const close = eo(seg(t, cues[2] + 0.6, cues[2] + 1.6)); // la cassaforte si chiude

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pr" />
        <Lin id="pr-sky" stops={[[0, '#3A3A6A'], [0.45, '#E87A5A'], [0.62, '#FFC890']]} />
        <Lin id="pr-sea" stops={[[0, '#C8705A'], [0.3, '#3A3E5A'], [1, '#141828']]} />
        <Lin id="pr-cabin" stops={[[0, '#4A3426'], [1, '#2A1C14']]} />
      </defs>
      <g transform={cam.transform}>
        {/* la prua al tramonto */}
        <g opacity={1 - draw}>
          <g transform={L(0.2)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#pr-sky)" />
            <circle cx="540" cy="900" r="90" fill="#FFE2A0" />
            <SunRays id="pr-rays" x={540} y={900} t={t} color="#FFE2B0" n={10} length={900} opacity={0.3} />
          </g>
          <g transform={L(0.35)}>
            <path d="M-200 920 H1280 V2200 H-200 Z" fill="url(#pr-sea)" />
            <WaveLines t={t} ys={[960, 1040, 1150, 1290]} color="#FFC8A0" amp={6} opacity={0.4} />
          </g>
          <g transform={L(0.6)}>
            {/* la prua vista da dietro, che punta verso il sole; ringhiera a V e strallo */}
            <path d="M-200 2200 L540 1000 L1280 2200 Z" fill="#8A6A48" stroke={K} strokeWidth="9" />
            <path d="M-120 2200 L540 1060 L1200 2200" stroke="#6A4E34" strokeWidth="6" fill="none" />
            <path d="M-60 1560 L540 1000 L1140 1560" stroke="#F4EEE2" strokeWidth="12" fill="none" />
            <path d="M-60 1620 L540 1080 L1140 1620" stroke="#D8D0C0" strokeWidth="6" fill="none" />
            <path d="M540 1000 L540 300" stroke={K} strokeWidth="4" />
            <path d={`M540 300 L${180 + Math.sin(t * 3) * 10} 1100`} stroke={K} strokeWidth="3" />
            {/* nastri al vento sulla ringhiera */}
            {[0, 1].map((i) => <path key={i} d={`M${300 + i * 480} ${1220 - i * 0} q${-60 + i * 120} ${-20 + 14 * Math.sin(t * 7 + i)} ${-120 + i * 240} ${-10 + 20 * Math.sin(t * 6 + i)}`} stroke="#F4EEE2" strokeWidth="8" fill="none" strokeLinecap="round" />)}
          </g>
        </g>
        {/* la cabina: album aperto, matite, diamante; poi la cassaforte */}
        <g opacity={draw}>
          <g transform={L(0.6)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#pr-cabin)" />
            <rect x="-200" y="1000" width="1480" height="1200" fill="#5A3E28" />
            <Glow id="pr-lamp" x={300} y={760} r={600} t={t} color="#FFD8A0" amp={0.05} rate={2} opacity={0.4} />
          </g>
          <g transform={L(0.9)}>
            <g transform="translate(470 1080) rotate(-4)">
              <rect x="-330" y="-240" width="330" height="440" fill="#F2EAD8" stroke={K} strokeWidth="6" />
              <rect x="0" y="-240" width="330" height="440" fill="#F6EEDC" stroke={K} strokeWidth="6" />
              {/* il tratto del disegno che si forma: un cuore e linee morbide, nessuna figura */}
              <path d="M60 -150 Q170 -200 280 -150 M70 100 Q170 70 270 110" stroke="#5A4A3A" strokeWidth="4" fill="none" strokeDasharray="600" strokeDashoffset={600 * (1 - sketch)} />
              <path d="M165 40 L120 -10 Q108 -40 135 -50 Q155 -55 165 -30 Q175 -55 195 -50 Q222 -40 210 -10 Z" fill="none" stroke="#2A5A9A" strokeWidth="5" strokeDasharray="300" strokeDashoffset={300 * (1 - sketch)} />
              <path d="M-280 -180 H-50 M-280 -140 H-90" stroke="#C8B898" strokeWidth="3" />
            </g>
            {[0, 1, 2].map((i) => <rect key={i} x={760 + i * 34} y={1260} width="18" height="150" rx="4" fill={['#3A3A3A', '#8A5A2A', '#C8402A'][i]} stroke={K} strokeWidth="3" transform={`rotate(${-20 + i * 8} ${770 + i * 34} 1330)`} />)}
            <Diamond x={240} y={1300} s={0.7} t={t} />
            <Glow id="pr-dia" x={240} y={1300} r={160} t={t} color="#4FB0E8" amp={0.12} rate={3} opacity={0.4} />
          </g>
          {/* la cassaforte di Cal che si chiude sul foglio arrotolato */}
          {close > 0 && (
            <g transform={L(1.1)} opacity={Math.min(1, close * 2)}>
              <g transform="translate(860 920)">
                <rect x="-130" y="-150" width="260" height="300" rx="10" fill="#3A3E40" stroke={K} strokeWidth="8" />
                <rect x="-104" y="-124" width="208" height="248" fill="#0A0E10" />
                <rect x="-70" y="10" width="140" height="40" rx="18" fill="#E8DCC0" stroke={K} strokeWidth="4" />
                <g transform={`translate(-130 -150) scale(${1 - close} 1)`}><rect x="0" y="0" width="260" height="300" rx="10" fill="#4A4E50" stroke={K} strokeWidth="7" /></g>
                <circle cx="70" cy="0" r="20" fill="#2A2E30" stroke="#C9A24A" strokeWidth="5" opacity={close} />
              </g>
            </g>
          )}
        </g>
        <g transform={L(1.6)}>
          {draw < 1 && <g opacity={1 - draw}><Gulls t={t} n={4} y={500} h={300} color={K} size={0.9} period={9} /></g>}
          <Dust t={t} top={{ y: 760, x0: 200, x1: 500 }} bottom={{ y: 1300, x0: 200, x1: 900 }} seed={6} n={18} color="#FFE2C0" />
          <NearMotes id="pr-near" t={t} color="#FFE2C0" n={5} opacity={0.07 + 0.02 * mod(t, 1)} />
        </g>
      </g>
      <Finish id="pr" tint="#3A1E1A" tintOpacity={0.08} />
    </svg>
  );
};
