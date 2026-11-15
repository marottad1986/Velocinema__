import React from 'react';
import { eo, eob, mod, seg } from '../../lib/anim';
import { DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow, Reflection } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { CYAN, PINK, RED, BLUE, YEL } from './Mappa';

// Copertina e finale di GTA VI (Videogiochi spiegati, senza sigla: la copertina è anche la miniatura).
// Locandina originale, niente logo, caratteri, immagini o mappe del gioco, niente persone né armi: il lungomare di una
// Florida inventata al tramonto. Sole a righe sul mare, palme scure ai lati, un hotel anni '30 bianco e rosa con
// l'insegna verticale al neon, un fenicottero nell'acqua bassa, una decappottabile azzurra ferma sul lungomare bagnato,
// lampeggianti rossi e blu lontani in fondo alla strada. Il titolo «GTA VI» nel nostro carattere, a righe rosa come un neon.
// Fotogramma 0 già completo (titolo, etichetta, riga sotto): la frase di lancio entra da 0,4 s.

const DARK = '#12071F';
const HORIZON = 1060;
const ROAD = 1215;

const Palm: React.FC<{ x: number; y: number; h: number; t: number; s?: number; flip?: boolean }> = ({ x, y, h, t, s = 1, flip = false }) => {
  const sw = Math.sin(t * 1.1 + x) * 6;
  const k = flip ? -1 : 1;
  const tx = x + 60 * k * s + sw, ty = y - h;
  return (
    <g>
      <path d={`M${x} ${y} Q${x + 10 * k * s} ${y - h * 0.55} ${tx} ${ty}`} fill="none" stroke="#14081E" strokeWidth={22 * s} strokeLinecap="round" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${x + (tx - x) * (i / 9) - 10} ${y - h * (i / 9) * 0.98} h20`} stroke="#2A1640" strokeWidth={3 * s} opacity=".7" />)}
      {[-170, -135, -100, -60, -25, 10, 45].map((a, i) => {
        const r = ((a + Math.sin(t * 1.3 + i) * 4) * Math.PI) / 180, L = (150 + (i % 3) * 30) * s;
        const ex = tx + Math.cos(r) * L, ey = ty + Math.sin(r) * L + 50 * s;
        return <path key={i} d={`M${tx} ${ty} Q${tx + Math.cos(r) * L * 0.5} ${ty + Math.sin(r) * L * 0.5 - 40 * s} ${ex} ${ey}`} fill="none" stroke="#14081E" strokeWidth={20 * s} strokeLinecap="round" />;
      })}
      <circle cx={tx} cy={ty + 6} r={14 * s} fill="#14081E" />
    </g>
  );
};

const Art: React.FC<{ t: number; id: string; calm?: number }> = ({ t, id, calm = 0 }) => {
  const sign = 1 - 0.85 * (Math.sin(t * 23) > 0.93 ? 1 : 0) * (1 - calm); // l'insegna sfarfalla ogni tanto
  const ph = Math.sin(t * 9) > 0;
  const siren = 1 - calm;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#140726" />
          <stop offset=".35" stopColor="#3A1460" />
          <stop offset=".62" stopColor="#B0306E" />
          <stop offset="1" stopColor="#FF8A5A" />
        </linearGradient>
        <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF0A0" />
          <stop offset=".55" stopColor="#FFB04A" />
          <stop offset="1" stopColor={PINK} />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5A1E6A" />
          <stop offset="1" stopColor="#1E0A34" />
        </linearGradient>
        <linearGradient id={`${id}-road`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E1030" />
          <stop offset=".3" stopColor="#140A22" />
          <stop offset="1" stopColor="#0A0414" />
        </linearGradient>
        <linearGradient id={`${id}-hotel`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FCEAF2" />
          <stop offset=".6" stopColor="#F2C8DC" />
          <stop offset="1" stopColor="#C88AB0" />
        </linearGradient>
      </defs>
      {/* cielo e sole a righe */}
      <rect width="1080" height={HORIZON} fill={`url(#${id}-sky)`} />
      {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={(i * 337) % 1080} cy={40 + ((i * 211) % 460)} r={1.5 + (i % 3)} fill="#FFFFFF" opacity={0.25 + 0.25 * Math.sin(t * 2 + i)} />)}
      <Glow id={`${id}-sg`} x={430} y={HORIZON - 80} r={520} t={t} color="#FF7A6A" amp={0.04} rate={1.2} opacity={0.7} />
      <clipPath id={`${id}-sc`}><rect x="0" y="0" width="1080" height={HORIZON} /></clipPath>
      <g clipPath={`url(#${id}-sc)`}>
        <circle cx="430" cy={HORIZON - 40} r="250" fill={`url(#${id}-sun)`} />
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x="150" y={HORIZON - 150 + i * 24 + mod(t * 10, 24)} width="560" height={3 + i * 1.8} fill="#B0306E" />)}
      </g>
      {/* skyline lontano, senza contorni */}
      {[[0, 140, 90], [90, 210, 70], [160, 170, 60], [890, 190, 80], [970, 250, 110]].map(([x, h, w], i) => <rect key={i} x={x} y={HORIZON - h} width={w} height={h} fill="#4A1A5A" opacity=".85" />)}
      {/* il mare con i riflessi del sole */}
      <rect y={HORIZON} width="1080" height={ROAD - HORIZON} fill={`url(#${id}-sea)`} />
      <Reflection t={t} x={430} y={HORIZON + 14} color="#FFC07A" n={7} w={300} gap={20} opacity={0.6} />
      {/* l'hotel anni '30 */}
      <g transform={`translate(760 ${ROAD - 10})`}>
        <rect x="-170" y="-470" width="340" height="470" fill={`url(#${id}-hotel)`} stroke={DARK} strokeWidth="8" />
        <rect x="-190" y="-490" width="380" height="30" fill={CYAN} stroke={DARK} strokeWidth="6" />
        <rect x="-60" y="-570" width="120" height="82" fill="#FCEAF2" stroke={DARK} strokeWidth="6" />
        {[-40, -14, 12, 38].map((x) => <path key={x} d={`M${x} -560 V-500`} stroke="#C88AB0" strokeWidth="5" />)}
        <path d="M-170 -300 H170 M-170 -140 H170" stroke="#C88AB0" strokeWidth="5" />
        {Array.from({ length: 6 }, (_, r) => Array.from({ length: 5 }, (_, c) => {
          const lit = mod(r * 3 + c * 7, 5) > 0;
          return <rect key={`${r}${c}`} x={-140 + c * 60} y={-430 + r * 66} width="40" height="34" fill={lit ? YEL : '#3A2050'} stroke={DARK} strokeWidth="4" opacity={lit ? 0.85 + 0.15 * Math.sin(t + r + c) : 1} />;
        }))}
        <rect x="-36" y="-70" width="72" height="70" fill="#3A2050" stroke={DARK} strokeWidth="5" />
        <path d="M-80 -70 H80" stroke={PINK} strokeWidth="8" />
        {/* l'insegna verticale al neon */}
        <rect x="-250" y="-450" width="64" height="300" rx="14" fill="#2A1238" stroke={DARK} strokeWidth="6" />
        <Glow id={`${id}-hn`} x={-218} y={-300} r={190} t={t} color={PINK} amp={0.05} rate={3} opacity={0.7 * sign} />
        <rect x="-246" y="-446" width="56" height="292" rx="12" fill="none" stroke={PINK} strokeWidth="4" opacity={0.6 * sign} />
        {'HOTEL'.split('').map((ch, k) => (
          <text key={k} x="-218" y={-398 + k * 56} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="48" fill={sign > 0.5 ? '#FFE0EF' : '#6A3A5A'} stroke={PINK} strokeWidth={sign > 0.5 ? 3 : 0}>{ch}</text>
        ))}
      </g>
      {/* il fenicottero nell'acqua bassa */}
      {(() => {
        const bob = Math.sin(t * 1.6) * 4;
        return (
          <g transform="translate(250 1150)">
            {[0, 1].map((k) => { const u = mod(t * 0.5 + k / 2, 1); return <ellipse key={k} cx="10" cy="40" rx={30 + u * 50} ry={6 + u * 8} fill="none" stroke="#FFC0DA" strokeWidth="3" opacity={0.6 * (1 - u)} />; })}
            <path d="M0 -40 L-6 40 M14 -40 L22 10 L8 40" fill="none" stroke="#E86A9A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M-50 -70 Q-46 -110 10 -108 Q60 -104 54 -70 Q44 -40 0 -40 Q-40 -40 -50 -70 Z" fill="#FF7AB0" stroke={DARK} strokeWidth="6" />
            <path d="M-30 -80 Q0 -96 30 -80" fill="none" stroke="#FFC0DA" strokeWidth="5" />
            <path d="M-56 -76 L-90 -66 L-56 -62" fill="#FF7AB0" stroke={DARK} strokeWidth="5" strokeLinejoin="round" />
            <path d={`M44 -90 Q80 -120 60 -160 Q40 -200 64 -${222 + bob} `} fill="none" stroke="#FF7AB0" strokeWidth="14" strokeLinecap="round" />
            <path d={`M44 -90 Q80 -120 60 -160 Q40 -200 64 -${222 + bob}`} fill="none" stroke={DARK} strokeWidth="18" strokeLinecap="round" opacity="0" />
            <g transform={`translate(70 ${-226 - bob})`}>
              <circle r="16" fill="#FF7AB0" stroke={DARK} strokeWidth="5" />
              <path d="M12 -4 Q36 0 34 22 L24 14 Q22 4 10 6 Z" fill="#F4EEE4" stroke={DARK} strokeWidth="4" strokeLinejoin="round" />
              <path d="M30 14 L34 22 L24 16 Z" fill={DARK} />
              <circle cx="4" cy="-4" r="3.5" fill={DARK} />
            </g>
          </g>
        );
      })()}
      {/* il lungomare: muretto, strada bagnata */}
      <rect y={ROAD - 14} width="1080" height="16" fill="#F2C8DC" stroke={DARK} strokeWidth="5" />
      <rect y={ROAD} width="1080" height={1920 - ROAD} fill={`url(#${id}-road)`} />
      <path d={`M0 ${ROAD + 130} H1080`} stroke={YEL} strokeWidth="6" strokeDasharray="70 50" opacity=".7" />
      {/* lampeggianti lontani in fondo alla strada */}
      <g transform={`translate(1010 ${ROAD + 70})`} opacity={0.4 + 0.6 * siren}>
        <Glow id={`${id}-pr`} x={-14} y={0} r={130} t={t} color={RED} amp={0} opacity={(ph ? 0.9 : 0.15) * siren} />
        <Glow id={`${id}-pb`} x={14} y={0} r={130} t={t} color={BLUE} amp={0} opacity={(ph ? 0.15 : 0.9) * siren} />
        <rect x="-26" y="-7" width="52" height="14" rx="6" fill="#20263A" />
        <rect x="-23" y="-5" width="21" height="10" rx="4" fill={ph && siren > 0 ? '#FF8A9A' : '#6A1A28'} />
        <rect x="2" y="-5" width="21" height="10" rx="4" fill={!ph && siren > 0 ? '#9AB8FF' : '#26346A'} />
      </g>
      {/* riflessi delle luci sull'asfalto bagnato: l'insegna, le finestre, il sole */}
      <Reflection t={t} x={542} y={ROAD + 280} color={PINK} n={9} w={46} gap={26} opacity={0.55} />
      <Reflection t={t} x={760} y={ROAD + 300} color={YEL} n={8} w={220} gap={28} opacity={0.3} />
      <Reflection t={t} x={430} y={ROAD + 320} color="#FFB04A" n={7} w={260} gap={30} opacity={0.25} />
      <Reflection t={t} x={540} y={ROAD + 160} color={PINK} n={6} w={70} gap={22} opacity={0.5} />
      <Reflection t={t} x={1000} y={ROAD + 110} color={siren > 0.5 && ph ? RED : BLUE} n={6} w={60} gap={20} opacity={0.4 * siren} />
      {/* la decappottabile azzurra, ferma, con i fari accesi */}
      <g transform={`translate(380 ${ROAD + 120})`}>
        <ellipse cx="0" cy="54" rx="270" ry="22" fill="#000" opacity=".45" />
        <path d="M200 -10 L560 -60 L560 60 L200 20 Z" fill="#FFF3C8" opacity={0.1 + 0.03 * Math.sin(t * 3)} />
        <path d="M-250 20 L-236 -26 Q-160 -40 -90 -40 L-40 -96 L-20 -96 L-50 -40 Q90 -40 200 -22 L238 10 Q244 40 214 46 H-226 Q-256 46 -250 20 Z" fill={CYAN} stroke={DARK} strokeWidth="9" strokeLinejoin="round" />
        <path d="M-226 -14 H190" stroke="#FFFFFF" strokeWidth="5" opacity=".6" />
        <path d="M-150 -40 Q-150 -66 -120 -66 Q-96 -66 -96 -40" fill="#2A1840" stroke={DARK} strokeWidth="6" />
        <path d="M-60 -18 H120" stroke={DARK} strokeWidth="4" opacity=".5" />
        {[-150, 140].map((x) => (
          <g key={x} transform={`translate(${x} 44)`}>
            <circle r="44" fill="#14081E" stroke={DARK} strokeWidth="6" />
            <circle r="24" fill="#B9BFCC" stroke={DARK} strokeWidth="4" />
            {[0, 60, 120].map((a) => <path key={a} d="M-20 0 H20" stroke={DARK} strokeWidth="3" transform={`rotate(${a})`} />)}
          </g>
        ))}
        <rect x="216" y="-6" width="26" height="16" rx="4" fill="#FFF3C8" />
        <rect x="-256" y="2" width="16" height="16" rx="3" fill={RED} />
        <Glow id={`${id}-tl`} x={-250} y={10} r={50} t={t} color={RED} amp={0.1} rate={3} opacity={0.6} />
      </g>
      {/* le palme ai lati, in primo piano */}
      <Palm x={40} y={1300} h={760} t={t} s={1.1} />
      <Palm x={1060} y={1260} h={640} t={t} s={0.95} flip />
      {/* gocce di pioggia leggera dopo il temporale / particelle di luce */}
      {Array.from({ length: 18 }, (_, i) => {
        const u = mod(t * 0.15 + i / 18, 1);
        return <circle key={i} cx={(i * 263 + Math.sin(t + i) * 30) % 1080} cy={1900 - u * 900} r={3 + (i % 4)} fill={i % 2 ? PINK : CYAN} opacity={0.35 * Math.sin(u * Math.PI)} />;
      })}
      <Finish id={id} tint="#2A1450" tintOpacity={0.08} />
    </svg>
  );
};

const StripedTitle: React.FC<{ id: string }> = ({ id }) => (
  <svg viewBox="0 0 840 260" width="840" height="260" style={{ position: 'absolute', left: 120, top: 322 }}>
    <defs>
      <pattern id={`${id}-st`} width="14" height="14" patternUnits="userSpaceOnUse">
        <rect width="14" height="14" fill={PINK} />
        <rect width="14" height="5" fill="#FFE6F2" />
      </pattern>
    </defs>
    <text x="420" y="220" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="250" letterSpacing="8" fill="none" stroke={PINK} strokeWidth="34" opacity=".25">GTA VI</text>
    <text x="420" y="220" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="250" letterSpacing="8" fill={DARK} stroke={DARK} strokeWidth="18">GTA VI</text>
    <text x="420" y="220" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="250" letterSpacing="8" fill={`url(#${id}-st)`} stroke="#FFFFFF" strokeWidth="4">GTA VI</text>
  </svg>
);

export const Copertina: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  const line = eo(seg(t, 0.4, 0.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t} id="gc" />
      <div style={{ position: 'absolute', left: 120, top: 262, width: 840, textAlign: 'center' }}>
        <span style={{ display: 'inline-block', padding: '10px 26px', borderRadius: 999, background: P.accento, color: P.scuro, fontFamily: SANS, fontSize: 32, fontWeight: 800, letterSpacing: '0.2em' }}>VIDEOGIOCHI SPIEGATI</span>
      </div>
      <StripedTitle id="gc" />
      <p style={{ position: 'absolute', left: 120, width: 840, top: 590, margin: 0, textAlign: 'center', fontFamily: SANS, fontSize: 30, fontWeight: 800, color: CYAN, textShadow: `0 3px 0 ${P.scuro}` }}>
        un gioco di {film.regista} · esce il 19 novembre 2026
      </p>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1420, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}E0`, color: P.chiaro, fontFamily: SANS, fontSize: 44, fontWeight: 800, textAlign: 'center',
        opacity: line, transform: `translateY(${(1 - line) * 16}px)` }}>
        {film.copertina.frase_lancio}
      </p>
    </div>
  );
};

export const Finale: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  const card = eo(seg(t, 0.1, 0.5));
  const b1 = eob(seg(t, 0.5, 0.9), 1.8);
  const b2 = eob(seg(t, 0.7, 1.1), 1.8);
  const line = eo(seg(t, 0.4, 0.8));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t + 4} id="ge" calm={1} />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '34px 40px 30px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 68, lineHeight: 1 }}>Ti è servito?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 28 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 40, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 40, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '24px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il gioco che vorresti.</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1420, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 44, fontWeight: 800, textAlign: 'center', lineHeight: 1.25,
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.finale.voce}
      </p>
    </div>
  );
};
