import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { ANTON, SANS, DISPLAY } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Embers, Fire, Fog, Glow, Gulls, NearMotes, Reflection, SunRays, WaveBand, WaveLines } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { Amber, Fern, Helicopter, JungleTree, K } from './Comuni';

// Copertina e finale di Jurassic Park. Locandina originale: niente logo (scheletro nel cerchio), niente dinosauri né persone.
// Copertina: il grande cancello di legno al tramonto con due torce, la giungla dietro, il binario che entra; in primo piano
// la goccia d'ambra con la zanzara.
// Finale: il mare al tramonto visto dall'elicottero, l'isola nella nebbia che si allontana, uno stormo di pellicani.

const Copertina_: React.FC<{ t: number; dur: number; accent: string }> = ({ t, dur, accent }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="jc" />
        <Lin id="jc-sky" stops={[[0, '#1A2A3A'], [0.3, '#6A4A4A'], [0.5, '#D8784A'], [0.58, '#F6B868']]} />
        <Lin id="jc-wood" x2={1} y2={0} stops={[[0, '#4A3420'], [0.5, '#7A5A36'], [1, '#3A2818']]} />
        <Lin id="jc-ground" stops={[[0, '#3A3A22'], [1, '#141408']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#jc-sky)" />
          <SunRays id="jc-rays" x={540} y={1000} t={t} color="#FFD8A0" n={12} length={1200} opacity={0.3} />
          <Glow id="jc-sun" x={540} y={1000} r={360} t={t} color="#FFE0B0" amp={0.04} rate={1} opacity={0.7} />
        </g>
        <g transform={L(0.4)}>
          {[-120, 120, 380, 700, 960, 1200].map((x, i) => <JungleTree key={x} x={x} y={1080} h={280 + (i % 2) * 80} t={t} ph={i} outline={false} leaf="#1A3022" trunk="#1A2018" />)}
          <Fog id="jc-fog" t={t} y={1060} color="#E8A070" rx={800} ry={60} opacity={0.35} />
        </g>
        {/* il cancello di legno con le torce */}
        <g transform={L(0.6)}>
          <path d="M-200 1080 H1280 V1500 H-200 Z" fill="url(#jc-ground)" />
          <path d="M420 1080 L660 1080 L900 1500 H180 Z" fill="#5A4A30" />
          <path d="M500 1080 L380 1500 M580 1080 L700 1500" stroke="#2A2014" strokeWidth="6" />
          {[200, 880].map((x) => (
            <g key={x}>
              <rect x={x - 50} y="640" width="100" height="440" fill="url(#jc-wood)" stroke={K} strokeWidth="8" />
              {[700, 800, 900, 1000].map((y) => <path key={y} d={`M${x - 50} ${y} H${x + 50}`} stroke="#2A1C10" strokeWidth="5" />)}
              <path d={`M${x - 70} 640 L${x} 590 L${x + 70} 640 Z`} fill="#3A2818" stroke={K} strokeWidth="7" />
            </g>
          ))}
          <path d="M150 680 H930 V760 H150 Z" fill="url(#jc-wood)" stroke={K} strokeWidth="8" />
          <path d="M150 700 Q540 650 930 700" fill="none" stroke="#2A1C10" strokeWidth="5" />
          {/* ante aperte */}
          <path d="M250 800 L380 840 V1080 L250 1080 Z M830 800 L700 840 V1080 L830 1080 Z" fill="#5A4028" stroke={K} strokeWidth="7" />
          {[0, 1, 2].map((i) => <path key={i} d={`M${262 + i * 40} ${808 + i * 12} V1080 M${818 - i * 40} ${808 + i * 12} V1080`} stroke="#2A1C10" strokeWidth="5" />)}
          {[120, 960].map((x, i) => (
            <g key={x}>
              <path d={`M${x} 900 V720`} stroke={K} strokeWidth="14" />
              <path d={`M${x - 24} 720 H${x + 24} L${x + 16} 690 H${x - 16} Z`} fill="#3A2818" stroke={K} strokeWidth="5" />
              <Fire id={`jc-fire${i}`} t={t + i} x={x} y={694} scale={0.55} outline={K} />
              <Glow id={`jc-torch${i}`} x={x} y={650} r={200} t={t} color="#FFB060" amp={0.15} rate={8 + i} opacity={0.6} />
              <Embers t={t} x={x} y={640} w={40} h={400} seed={30 + i} n={12} drift={60} />
            </g>
          ))}
        </g>
        {/* goccia d'ambra in primo piano */}
        <g transform={L(1.0)}>
          <Glow id="jc-amberg" x={540} y={1250} r={260} t={t} color="#FFB040" amp={0.08} rate={1.6} opacity={0.6} />
          <Amber x={540} y={1250} s={1.1} accent={accent} />
        </g>
        <g transform={L(1.25)}>
          <Fern x={20} y={1920} s={2.8} t={t} ph={0.5} color="#1E3A26" />
          <Fern x={1060} y={1920} s={2.8} t={t} ph={2} color="#1E3A26" flip />
        </g>
        <g transform={L(1.6)}><NearMotes id="jc-near" t={t} color="#FFD8A0" n={6} y0={1300} opacity={0.1} /></g>
      </g>
      <Finish id="jc" tint="#1E4A30" tintOpacity={0.1} />
    </svg>
  );
};

const Finale_: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const away = eo(seg(t, 0, dur));
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="jf" />
        <Lin id="jf-sky" stops={[[0, '#2A3A5A'], [0.35, '#B8706A'], [0.5, '#F6B868']]} />
        <Lin id="jf-sea" stops={[[0, '#E8A070'], [0.25, '#4A7A8A'], [1, '#1A3A4A']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#jf-sky)" />
          <Glow id="jf-sun" x={760} y={1000} r={320} t={t} color="#FFE0B0" amp={0.04} rate={1} opacity={0.8} />
          <circle cx="760" cy="1000" r="70" fill="#FFF0D0" />
        </g>
        <g transform={L(0.35)}>
          <rect x="-200" y="1000" width="1480" height="1000" fill="url(#jf-sea)" />
          <Reflection t={t} x={760 - cam.pan * 0.2} y={1010} color="#FFE0B0" n={10} w={120} opacity={0.5} />
          <g transform={`translate(${220} ${1000}) scale(${1 - 0.3 * away})`}>
            <path d="M-220 0 Q-160 -80 -60 -90 Q0 -170 60 -120 Q140 -100 220 0 Z" fill="#1E3028" />
          </g>
          <Fog id="jf-fog" t={t} x={220} y={980} color="#F2D8C0" rx={300} ry={50} drift={30} opacity={0.6} />
          <WaveLines t={t} ys={[1100, 1220, 1380, 1560]} color="#F2C9A0" amp={6} w={240} speed={20} opacity={0.45} />
        </g>
        <g transform={L(0.5)}><Helicopter x={lerp(700, 940, seg(t, 0, dur))} y={lerp(975, 950, seg(t, 0, dur))} s={0.2} t={t} tilt={-6} /></g>
        <g transform={L(0.9)}>
          <WaveBand t={t} y={1460} fill="#3A6A7A" foam="#F2E0C8" amp={18} w={300} speed={0.5} />
          <WaveBand t={t} y={1640} fill="#2A5060" foam="#F2E0C8" amp={22} w={340} speed={0.7} ph={1} />
          <WaveBand t={t} y={1820} fill="#1E3E4C" foam="#F2E0C8" amp={26} w={380} speed={0.9} ph={2} />
        </g>
        <g transform={L(0.7)}><Gulls t={t} y={1040} h={180} color="#1E2028" n={6} size={1.3} period={12} /></g>
        <g transform={L(1.6)}><NearMotes id="jf-near" t={t} color="#FFE0B0" n={6} y0={1300} opacity={0.1} /></g>
      </g>
      <Finish id="jf" tint="#1E4A30" tintOpacity={0.08} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const tag = eo(seg(t, 0.05, 0.45));
  const l1 = eob(seg(t, 0.15, 0.7), 1.4);
  const dir = eo(seg(t, 0.6, 1.0));
  const line = eo(seg(t, 1.1, 1.6));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Copertina_ t={t} dur={dur} accent={P.accento} />
      <div style={{ position: 'absolute', left: 120, top: 290, width: 840, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI</p>
        <h1 style={{ margin: '14px 0 0', fontFamily: ANTON, fontWeight: 400, fontSize: 170, lineHeight: 0.95, letterSpacing: '0.01em', color: P.chiaro, whiteSpace: 'nowrap',
          textShadow: `0 8px 0 ${P.scuro}`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          JURASSIC PARK
        </h1>
        <p style={{ margin: '20px 0 0', fontSize: 40, fontWeight: 800, opacity: dir, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 40, fontWeight: 800, textAlign: 'center',
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.copertina.frase_lancio}
      </p>
    </div>
  );
};

export const Finale: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const card = eo(seg(t, 0.1, 0.5));
  const b1 = eob(seg(t, 0.5, 0.9), 1.8);
  const b2 = eob(seg(t, 0.7, 1.1), 1.8);
  const end = eob(seg(t, 0.3, 0.9), 1.3);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Finale_ t={t} dur={dur} />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 760, margin: 0, textAlign: 'center', fontFamily: ANTON, fontWeight: 400, fontSize: 200, lineHeight: 1,
        color: P.chiaro, textShadow: `0 8px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        THE END
      </h1>
    </div>
  );
};
