import React from 'react';
import { camera, eo, eob, lerp, mod, seg } from '../../lib/anim';
import { CINZEL, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, Moon, NearMotes, Reflection, Smoke, Stars, SunRays, WaveLines } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { Castle, K, Letter, Owl } from './Comuni';

// Copertina e finale di Harry Potter e la pietra filosofale. Locandina originale: niente logo con il fulmine, niente stemmi,
// niente persone. Copertina: notte stellata sul castello e sul lago, una lettera con il sigillo che vola e un gufo bianco.
// Finale: il castello all'alba visto dal lago, gufi in volo e il treno rosso che si allontana sul ponte.

const Copertina_: React.FC<{ t: number; dur: number; accent: string }> = ({ t, dur, accent }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const fly = eo(seg(t, 0, dur));
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="hc" />
        <Lin id="hc-sky" stops={[[0, '#05061A'], [0.4, '#16184A'], [0.6, '#3A3470']]} />
        <Lin id="hc-lake" stops={[[0, '#16184A'], [1, '#05060E']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#hc-sky)" />
          <Stars t={t} seed={41} n={70} y={-100} h={1000} size={1.2} />
          <Moon id="hc-moon" x={860} y={760} r={56} t={t} color="#F4F0DC" halo="#C8C4F0" />
        </g>
        <g transform={L(0.4)}>
          <path d="M-200 1080 Q100 1020 260 930 L760 920 Q900 990 1280 1080 V1120 H-200 Z" fill="#100E26" />
          <Castle x={520} y={930} s={0.9} t={t} lit={1} fill="#141236" />
          <Glow id="hc-cg" x={520} y={780} r={420} t={t} color="#FFD27A" amp={0.04} rate={1} opacity={0.25} />
        </g>
        <g transform={L(0.6)}>
          <rect x="-200" y="1080" width="1480" height="900" fill="url(#hc-lake)" />
          {[220, 380, 520, 660, 800].map((x, i) => <Reflection key={x} t={t + i} x={x} y={1100} color="#FFD27A" n={5} w={28} gap={18} opacity={0.35} />)}
          <WaveLines t={t} ys={[1140, 1220, 1320]} color="#2A2E5A" amp={5} w={200} speed={14} opacity={0.6} />
          <Fog id="hc-fog" t={t} y={1100} color="#4A4E8A" rx={900} ry={50} opacity={0.4} />
        </g>
        <g transform={L(0.85)}>
          <Owl x={260 + 300 * fly} y={760 - 80 * fly} s={0.8} t={t} fly={1} />
        </g>
        {/* la lettera con il sigillo (accento) in primo piano */}
        <g transform={L(1.1)}>
          <Glow id="hc-letg" x={560} y={1220} r={260} t={t} color={accent} amp={0.08} rate={2} opacity={0.4} />
          <Letter x={560} y={1220 + Math.sin(t * 2) * 12} s={1.9} rot={-6 + Math.sin(t * 1.5) * 4} seal={accent} />
        </g>
        <g transform={L(1.6)}><NearMotes id="hc-near" t={t} color="#FFE8B8" n={6} y0={1300} opacity={0.1} /></g>
      </g>
      <Finish id="hc" tint="#1E1A3A" tintOpacity={0.1} />
    </svg>
  );
};

const Finale_: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const go = eo(seg(t, 0, dur));
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="hf" />
        <Lin id="hf-sky" stops={[[0, '#3A3A70'], [0.35, '#C88A9A'], [0.55, '#F6D0A0']]} />
        <Lin id="hf-lake" stops={[[0, '#E8B0A0'], [0.3, '#5A6A9A'], [1, '#1A1A3A']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#hf-sky)" />
          <SunRays id="hf-rays" x={300} y={1000} t={t} color="#FFE8C0" n={10} length={1100} opacity={0.3} />
          <Glow id="hf-sun" x={300} y={1000} r={320} t={t} color="#FFF0D0" amp={0.04} rate={1} opacity={0.8} />
        </g>
        <g transform={L(0.4)}>
          <path d="M-200 1060 Q100 1010 260 920 L760 910 Q900 980 1280 1060 V1100 H-200 Z" fill="#3A3460" />
          <Castle x={560} y={920} s={0.85} t={t} lit={0.4} fill="#4A4070" windowColor="#FFE8B0" />
          {/* ponte con il treno rosso che si allontana */}
          <path d="M-200 1000 H500" stroke="#2A2448" strokeWidth="14" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-160 + i * 120} 1000 q60 50 120 0`} fill="none" stroke="#2A2448" strokeWidth="8" />)}
          <g transform={`translate(${380 - 520 * go} 990) scale(.4)`}>
            <rect x="0" y="-120" width="500" height="100" rx="12" fill="#C02A30" stroke={K} strokeWidth="10" />
            <rect x="500" y="-90" width="160" height="70" fill="#C02A30" stroke={K} strokeWidth="10" />
            <Smoke id="hf-smoke" t={t} x={580} y={-120} color="#F4F0E8" n={6} rise={200} wind={300} r0={20} r1={70} speed={0.3} opacity={0.7} />
          </g>
        </g>
        <g transform={L(0.6)}>
          <rect x="-200" y="1060" width="1480" height="900" fill="url(#hf-lake)" />
          <Reflection t={t} x={300 - cam.pan * 0.3} y={1080} color="#FFF0D0" n={10} w={110} opacity={0.5} />
          <WaveLines t={t} ys={[1120, 1220, 1360, 1540]} color="#F4D8C0" amp={5} w={220} speed={16} opacity={0.45} />
        </g>
        <g transform={L(0.8)}>
          {[0, 1, 2].map((i) => {
            const p = mod(t * 0.12 + i * 0.3, 1);
            return <Owl key={i} x={-100 + p * 1300} y={1200 - i * 90 - Math.sin(p * Math.PI) * 120} s={0.45 + i * 0.1} t={t} fly={1} ph={i} />;
          })}
        </g>
        <g transform={L(1.6)}><NearMotes id="hf-near" t={t} color="#FFF0D0" n={6} y0={1300} opacity={0.1} /></g>
      </g>
      <Finish id="hf" tint="#E8B04A" tintOpacity={0.08} />
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
      <div style={{ position: 'absolute', left: 70, top: 290, width: 940, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI</p>
        <h1 style={{ margin: '14px 0 0', fontFamily: CINZEL, fontWeight: 700, fontSize: 112, lineHeight: 1, color: P.chiaro,
          textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          Harry Potter
        </h1>
        <p style={{ margin: '6px 0 0', fontFamily: CINZEL, fontWeight: 700, fontSize: 52, color: P.accento, textShadow: `0 4px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6) }}>e la pietra filosofale</p>
        <p style={{ margin: '20px 0 0', fontSize: 38, fontWeight: 800, opacity: dir, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 60, right: 60, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 960, boxSizing: 'border-box', padding: '12px 26px 14px',
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
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 740, margin: 0, textAlign: 'center', fontFamily: CINZEL, fontWeight: 700, fontSize: 150, lineHeight: 1,
        color: P.chiaro, textShadow: `0 7px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        The End
      </h1>
    </div>
  );
};
