import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg, wavePath } from '../../lib/anim';
import { ANTON, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import type { PosterProps } from '../../types';

// Finale: alba sul mare, faro lontano, cappello sugli scogli; "THE END" nel carattere della copertina;
// riquadro in alto con invito a mettere like e seguire la pagina.
// Piani: cielo e sole (0,2) · faro lontano (0,4) · mare dorato (0,65) · scogli col cappello (1,2) · pulviscolo (1,7)

const K = '#0B1418';
const r = rng(67);
const MOTES = Array.from({ length: 14 }, () => ({ x: r() * 1080, y: 700 + r() * 1100, s: 3 + r() * 5, ph: r() * 6 }));

const gull = (flap: number, s: number) => `M${-36 * s} 0 q${18 * s} ${-18 * flap * s} ${36 * s} 0 q${18 * s} ${-18 * flap * s} ${36 * s} 0`;

export const Finale: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const cam = camera(t, dur, 540, 1150);
  const L = cam.layer;
  const sun = { x: 720, y: 1150 };
  const card = eo(seg(t, 0.1, 0.5));
  const b1 = eob(seg(t, 0.5, 0.9), 1.8);
  const b2 = eob(seg(t, 0.7, 1.1), 1.8);
  const end = eob(seg(t, 0.3, 0.9), 1.3);
  const beat = 1 + Math.max(0, Math.sin((t - 1.4) * 4)) * 0.05 * seg(t, 1.4, 1.5);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="fi" />
          <Lin id="fi-sky" stops={[[0, '#1B2C40'], [0.3, '#47566E'], [0.48, '#C98A6A'], [0.58, '#F2B97A'], [0.6, '#F7D08A']]} />
          <Lin id="fi-sea" stops={[[0, '#C9A37A'], [0.08, '#5E8A8E'], [0.4, '#2C5A63'], [1, '#0E2A31']]} />
          <Lin id="fi-rock" stops={[[0, '#4C5E5C'], [1, '#141E21']]} />
          <Lin id="fi-ray" x2={0} y2={1} stops={[[0, '#FFE7A0', 0], [0.6, '#FFE7A0', 0.12], [1, '#FFE7A0', 0.35]]} />
          <GlowGradient id="fi-sun" color="#FFE2A0" core={1} mid={0.45} />
          <GlowGradient id="fi-mote" color="#FFF1CC" core={0.9} mid={0.3} />
        </defs>

        <g transform={cam.transform}>
          {/* cielo e sole con raggi (0,2) */}
          <g transform={L(0.2)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fi-sky)" />
            <g transform={`rotate(${t * 3} ${sun.x} ${sun.y})`} opacity={0.5 + Math.sin(t * 1.5) * 0.1}>
              {Array.from({ length: 9 }, (_, i) => (
                <path key={i} d={`M${sun.x} ${sun.y} L${sun.x - 34} ${sun.y - 1000} L${sun.x + 34} ${sun.y - 1000} Z`} transform={`rotate(${-80 + i * 20} ${sun.x} ${sun.y})`} fill="url(#fi-ray)" />
              ))}
            </g>
            <circle cx={sun.x} cy={sun.y} r={260 + Math.sin(t * 2) * 10} fill="url(#fi-sun)" />
            <circle cx={sun.x} cy={sun.y} r="90" fill="#FFF3D0" />
            <ellipse cx="260" cy="980" rx="340" ry="26" fill="#F2B97A" opacity=".55" />
            <ellipse cx="880" cy="900" rx="260" ry="18" fill="#E9A47A" opacity=".45" />
          </g>

          {/* faro lontano su uno scoglio (0,4) */}
          <g transform={L(0.4)}>
            <path d="M190 1152 Q230 1110 290 1112 Q350 1100 400 1152 Z" fill="#2E3E44" />
            <path d="M282 1120 L288 1020 H314 L320 1120 Z" fill="#E6D8C4" />
            <path d="M286 1060 H316" stroke="#B5562F" strokeWidth="10" />
            <rect x="290" y="1000" width="22" height="22" fill="#FFE7A0" />
            <path d="M286 1001 L301 988 L316 1001 Z" fill="#2E3E44" />
          </g>

          {/* mare dorato (0,65) */}
          <g transform={L(0.65)}>
            <rect x="-200" y="1148" width="1480" height="900" fill="url(#fi-sea)" />
            {Array.from({ length: 12 }, (_, i) => {
              const w = (110 - i * 7) * (0.55 + 0.45 * Math.sin(t * 3 + i * 1.3));
              return <rect key={i} x={sun.x + cam.pan * 0.45 - w / 2 + Math.sin(t + i) * 12} y={1160 + i * 24} width={w} height="6" rx="3" fill="#FFE2A0" opacity={0.75 - i * 0.05} />;
            })}
            <path d={wavePath(1250, 8, 260)} transform={`translate(${-mod(t * 40, 260)} 0)`} fill="none" stroke="#9CC3CA" strokeWidth="5" strokeLinecap="round" opacity=".5" />
            <path d={wavePath(1380, 12, 320)} transform={`translate(${-mod(t * 60, 320)} 0)`} fill="none" stroke="#9CC3CA" strokeWidth="5" strokeLinecap="round" opacity=".4" />
          </g>

          {/* gabbiani (0,6) */}
          <g transform={L(0.6)} fill="none" stroke="#2B3440" strokeLinecap="round">
            <path d={gull(0.9 + 0.6 * Math.sin(t * 7), 1.2)} transform={`translate(${lerp(420, 560, t / dur)} ${1060 + Math.sin(t * 2) * 14})`} strokeWidth="7" />
            <path d={gull(0.9 + 0.6 * Math.sin(t * 8 + 1), 0.9)} transform={`translate(${lerp(820, 1000, t / dur)} ${1060 + Math.sin(t * 2.4) * 10})`} strokeWidth="6" />
          </g>

          {/* scogli in primo piano con il cappello (1,2) */}
          <g transform={L(1.2)}>
            <path d={wavePath(1600, 18, 300, -400, 1600, 2200)} transform={`translate(${-mod(t * 90, 300)} ${Math.sin(t * 2) * 8})`} fill="#0F2A31" />
            <path d={wavePath(1600, 18, 300)} transform={`translate(${-mod(t * 90, 300)} ${Math.sin(t * 2) * 8})`} fill="none" stroke="#F2D7A8" strokeWidth="6" strokeLinecap="round" opacity=".6" />
            <path d="M-140 2000 L-60 1640 Q160 1560 380 1610 Q520 1570 640 1680 L720 2000 Z" fill="url(#fi-rock)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
            <path d="M-40 1650 Q160 1576 370 1618 M470 1600 Q560 1592 620 1660" fill="none" stroke="#F2C997" strokeWidth="6" strokeLinecap="round" opacity=".7" />
            <path d="M780 2000 L840 1760 Q960 1700 1120 1760 L1180 2000 Z" fill="url(#fi-rock)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
            <path d="M850 1764 Q960 1708 1100 1756" fill="none" stroke="#F2C997" strokeWidth="5" opacity=".6" />
            {/* cappello lasciato */}
            <g transform={`translate(300 1592) rotate(-6)`}>
              <path d="M-110 0 Q0 -20 110 0 Q80 16 0 18 Q-80 16 -110 0 Z" fill="#1A2630" stroke={K} strokeWidth="6" />
              <path d="M-66 -6 L-56 -78 Q0 -100 56 -78 L66 -6 Z" fill="#22303A" stroke={K} strokeWidth="6" />
              <path d="M-62 -26 H62" stroke={P.accento} strokeWidth="14" />
              <path d="M30 -84 Q50 -60 56 -10" fill="none" stroke="#F2C997" strokeWidth="4" opacity=".8" />
            </g>
          </g>

          {/* pulviscolo dorato davanti alla camera (1,7) */}
          <g transform={L(1.7)}>
            {MOTES.map((m, i) => (
              <circle key={i} cx={m.x + Math.sin(t * 0.6 + m.ph) * 30} cy={m.y - t * 20} r={m.s * 3} fill="url(#fi-mote)" opacity={0.25 + 0.25 * Math.sin(t * 2 + m.ph)} />
            ))}
          </g>
        </g>

        <Finish id="fi" tint="#0E3A40" tintOpacity={0.1} />
      </svg>

      {/* riquadro in alto */}
      <div
        style={{
          position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
          background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center',
          opacity: card, transform: `translateY(${(1 - card) * 24}px)`,
        }}
      >
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1 * beat})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>

      <h1
        style={{
          position: 'absolute', left: 0, right: 0, top: 760, margin: 0, textAlign: 'center', fontFamily: ANTON, fontWeight: 400,
          fontSize: 220, lineHeight: 1, color: P.chiaro, letterSpacing: '0.04em', textShadow: `0 8px 0 ${P.scuro}`,
          opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})`,
        }}
      >
        THE END
      </h1>
    </div>
  );
};
