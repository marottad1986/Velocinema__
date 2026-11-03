import React from 'react';
import { camera, eo, eob, lerp, mod, seg } from '../../lib/anim';
import { CINZEL, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, Moon, NearMotes, Reflection, Smoke, Stars, SunRays, WaveLines } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { Castle, K, Letter, Owl, SmallTrain } from './Comuni';

// Copertina e finale di Harry Potter e la pietra filosofale. Locandina originale: niente logo con il fulmine, niente stemmi,
// niente persone. Copertina: notte stellata sul castello e sul lago, una lettera con il sigillo che vola e un gufo bianco.
// Finale: il castello all'alba visto dal lago, gufi in volo e il treno rosso che si allontana sul ponte.

// Copertina: il titolo sta sul cielo (290–600); il castello, più piccolo, sotto il titolo a destra con la luna a sinistra;
// sulla riva il treno sul viadotto, nel lago il riflesso e le barchette; in primo piano la lettera che vola.
const CC = { x: 640, y: 1110, s: 0.56 };

const Copertina_: React.FC<{ t: number; dur: number; accent: string }> = ({ t, dur, accent }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const fly = eo(seg(t, 0, dur));
  const castle = (k: string) => <Castle key={k} x={CC.x} y={CC.y} s={CC.s} t={t} lit={1} fill="#262452" roof="#34306A" rock="#14122E" rim={-1} />;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="hc" />
        <Lin id="hc-sky" stops={[[0, '#05061A'], [0.35, '#16184A'], [0.6, '#3A3470']]} />
        <Lin id="hc-lake" stops={[[0, '#1A2046'], [0.4, '#0C1028'], [1, '#05060E']]} />
        <clipPath id="hc-water"><rect x="-200" y="1150" width="1480" height="900" /></clipPath>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#hc-sky)" />
          <Stars t={t} seed={41} n={80} y={-100} h={1100} size={1.2} />
          <Moon id="hc-moon" x={210} y={820} r={56} t={t} color="#F4F0DC" halo="#C8C4F0" />
        </g>
        {/* riva lontana con il viadotto e il treno illuminato */}
        <g transform={L(0.32)}>
          <path d="M-200 1090 Q60 1030 220 1060 Q340 1080 460 1050 V1160 H-200 Z" fill="#1A1C44" stroke={K} strokeWidth="4" />
          <path d="M-200 1080 H460" stroke="#2A2C58" strokeWidth="9" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-190 + i * 80} 1084 v40 M${-190 + i * 80} 1124 q40 -36 80 0`} fill="none" stroke="#2A2C58" strokeWidth="6" />)}
          <g transform={`translate(${-60 + fly * 120} 1076)`}>
            <Smoke id="hc-smoke" t={t} x={250} y={-34} color="#8A8CB8" n={6} rise={80} wind={-150} r0={6} r1={24} speed={0.5} opacity={0.6} />
            <SmallTrain x={0} y={0} s={0.7} cars={3} />
          </g>
        </g>
        <g transform={L(0.4)}>
          <path d="M300 1160 Q420 1110 520 1100 L860 1095 Q1040 1110 1280 1150 V1170 H300 Z" fill="#0E0C22" />
          <Glow id="hc-cg" x={CC.x} y={900} r={380} t={t} color="#FFD27A" amp={0.04} rate={1} opacity={0.25} />
          {castle('c')}
        </g>
        <g transform={L(0.6)}>
          <rect x="-200" y="1150" width="1480" height="900" fill="url(#hc-lake)" />
          <g clipPath="url(#hc-water)" opacity={0.22}>
            <g transform={`translate(${Math.sin(t * 1.3) * 4} ${2 * 1150 + 40}) scale(1 -1)`}>{castle('r')}</g>
          </g>
          {[480, 560, 640, 720, 800].map((x, i) => <Reflection key={x} t={t + i} x={x} y={1170} color="#FFD27A" n={6} w={24} gap={18} opacity={0.35} />)}
          <Reflection t={t} x={210} y={1170} color="#F4F0DC" n={9} w={70} opacity={0.4} />
          <WaveLines t={t} ys={[1200, 1290, 1420, 1600]} color="#2A2E5A" amp={5} w={200} speed={14} opacity={0.6} />
          <Fog id="hc-fog" t={t} y={1170} color="#4A4E8A" rx={900} ry={50} opacity={0.35} />
        </g>
        {/* barchette con le lanterne sotto la frase di lancio */}
        <g transform={L(0.85)}>
          {[0, 1, 2].map((i) => {
            const x = 150 + i * 330 + fly * 40, y = 1640 - i * 40;
            return (
              <g key={i} transform={`translate(${x} ${y + Math.sin(t * 1.6 + i) * 4}) scale(${0.9 - i * 0.12})`}>
                <Reflection t={t + i} x={30} y={30} color={accent} n={4} w={30} gap={14} opacity={0.5} />
                <path d="M-90 0 H110 Q90 40 60 44 H-60 Q-90 30 -90 0 Z" fill="#4A3424" stroke={K} strokeWidth="6" />
                <path d="M80 0 V-90" stroke={K} strokeWidth="6" />
                <rect x="66" y="-120" width="28" height="34" rx="6" fill={accent} stroke={K} strokeWidth="4" />
                <Glow id={`hc-lan${i}`} x={80} y={-104} r={70} t={t} color="#FFD27A" amp={0.12} rate={3 + i} opacity={0.8} />
              </g>
            );
          })}
          <Owl x={260 + 340 * fly} y={760 - 60 * fly} s={0.6} t={t} fly={1} />
        </g>
        {/* la lettera con il sigillo (accento) in primo piano */}
        <g transform={L(1.1)}>
          <Glow id="hc-letg" x={560} y={1250} r={240} t={t} color={accent} amp={0.08} rate={2} opacity={0.4} />
          <Letter x={560} y={1250 + Math.sin(t * 2) * 12} s={1.6} rot={-6 + Math.sin(t * 1.5) * 4} seal={accent} />
        </g>
        {/* canne ai lati */}
        <g transform={L(1.3)}>
          {Array.from({ length: 16 }, (_, i) => {
            const x = i < 8 ? -100 + i * 34 : 920 + (i - 8) * 32, h = 220 + ((i * 53) % 200), b = Math.sin(t * 1.4 + i) * 10;
            return <path key={i} d={`M${x} 1960 Q${x + b * 0.5} ${1960 - h * 0.5} ${x + b} ${1960 - h}`} stroke={i % 2 ? '#26244A' : '#33305C'} strokeWidth="11" fill="none" strokeLinecap="round" />;
          })}
        </g>
        <g transform={L(1.6)}><NearMotes id="hc-near" t={t} color="#FFE8B8" n={6} y0={1300} opacity={0.1} /></g>
      </g>
      <Finish id="hc" tint="#1E1A3A" tintOpacity={0.1} />
    </svg>
  );
};

// Finale: il castello all'alba, piccolo sotto il riquadro; il sole basso a sinistra sull'orizzonte; a destra il treno sul
// viadotto che si allontana; «The End» sul lago, dove il castello si specchia; gufi in volo.
const CF = { x: 560, y: 1150, s: 0.52 };

const Finale_: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const go = eo(seg(t, 0, dur));
  const castle = (k: string) => <Castle key={k} x={CF.x} y={CF.y} s={CF.s} t={t} lit={0.4} fill="#4A4070" roof="#5A4A80" rock="#3A3460" windowColor="#FFE8B0" rim={-1} rimColor="#FFD8A8" />;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="hf" />
        <Lin id="hf-sky" stops={[[0, '#3A3A70'], [0.35, '#C88A9A'], [0.6, '#F6D0A0']]} />
        <Lin id="hf-lake" stops={[[0, '#E8B0A0'], [0.3, '#7A7AA8'], [1, '#2A2A50']]} />
        <clipPath id="hf-water"><rect x="-200" y="1180" width="1480" height="900" /></clipPath>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#hf-sky)" />
          <SunRays id="hf-rays" x={170} y={1120} t={t} color="#FFE8C0" n={10} length={1100} opacity={0.3} />
          <Glow id="hf-sun" x={170} y={1120} r={340} t={t} color="#FFF0D0" amp={0.04} rate={1} opacity={0.9} />
          <circle cx="170" cy="1120" r="72" fill="#FFE4A8" /><circle cx="170" cy="1120" r="52" fill="#FFF4DC" />
        </g>
        {/* a destra il viadotto con il treno che si allontana */}
        <g transform={L(0.32)}>
          <path d="M640 1130 Q800 1070 960 1090 Q1120 1100 1280 1080 V1190 H640 Z" fill="#5A4A78" stroke={K} strokeWidth="4" />
          <path d="M620 1100 H1280" stroke="#3A2E58" strokeWidth="10" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${630 + i * 80} 1104 v50 M${630 + i * 80} 1154 q40 -44 80 0`} fill="none" stroke="#3A2E58" strokeWidth="7" />)}
          <g transform={`translate(${690 + 170 * go} 1096)`}>
            <Smoke id="hf-smoke" t={t} x={232} y={-34} color="#F4F0E8" n={7} rise={140} wind={-260} r0={8} r1={40} speed={0.4} opacity={0.75} />
            <SmallTrain x={0} y={0} s={0.75} cars={3} lit={0.3} />
          </g>
        </g>
        <g transform={L(0.4)}>
          <path d="M260 1190 Q360 1150 440 1140 L700 1136 Q800 1150 880 1190 Z" fill="#3A3460" />
          {castle('c')}
        </g>
        <g transform={L(0.6)}>
          <rect x="-200" y="1180" width="1480" height="900" fill="url(#hf-lake)" />
          <g clipPath="url(#hf-water)" opacity={0.25}>
            <g transform={`translate(${Math.sin(t * 1.3) * 4} ${2 * 1180 + 40}) scale(1 -1)`}>{castle('r')}</g>
          </g>
          <Reflection t={t} x={170 - cam.pan * 0.3} y={1200} color="#FFF0D0" n={10} w={110} opacity={0.55} />
          <WaveLines t={t} ys={[1220, 1320, 1460, 1640]} color="#F4D8C0" amp={5} w={220} speed={16} opacity={0.45} />
        </g>
        <g transform={L(0.8)}>
          {[0, 1, 2].map((i) => {
            const p = mod(t * 0.12 + i * 0.3, 1);
            return <Owl key={i} x={-100 + p * 1300} y={1000 - i * 70 - Math.sin(p * Math.PI) * 90} s={0.4 + i * 0.08} t={t} fly={1} ph={i} />;
          })}
        </g>
        {/* canne in primo piano, controluce */}
        <g transform={L(1.3)}>
          {Array.from({ length: 16 }, (_, i) => {
            const x = i < 8 ? -100 + i * 34 : 920 + (i - 8) * 32, h = 220 + ((i * 53) % 200), b = Math.sin(t * 1.4 + i) * 10;
            return <path key={i} d={`M${x} 1960 Q${x + b * 0.5} ${1960 - h * 0.5} ${x + b} ${1960 - h}`} stroke={i % 2 ? '#2A2448' : '#3A3060'} strokeWidth="11" fill="none" strokeLinecap="round" />;
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
      <div style={{ position: 'absolute', left: 120, top: 290, width: 840, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI</p>
        <h1 style={{ margin: '14px 0 0', fontFamily: CINZEL, fontWeight: 700, fontSize: 112, lineHeight: 1, color: P.chiaro,
          textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          Harry Potter
        </h1>
        <p style={{ margin: '6px 0 0', fontFamily: CINZEL, fontWeight: 700, fontSize: 52, color: P.accento, textShadow: `0 4px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6) }}>e la pietra filosofale</p>
        <p style={{ margin: '20px 0 0', fontSize: 38, fontWeight: 800, opacity: dir, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
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
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 1250, margin: 0, textAlign: 'center', fontFamily: CINZEL, fontWeight: 700, fontSize: 150, lineHeight: 1,
        color: P.chiaro, textShadow: `0 7px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        The End
      </h1>
    </div>
  );
};
