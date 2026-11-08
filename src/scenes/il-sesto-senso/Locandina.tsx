import React from 'react';
import { camera, eio, eo, eob, lerp, seg } from '../../lib/anim';
import { CRIMSON, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Fog, Glow, NearMotes } from '../../lib/elements';
import { Speciale } from '../../components/Speciale';
import type { PosterProps } from '../../types';
import { Brina, K, Ombra, Porta, SestoDefs } from './Comuni';

// Copertina e finale di Il sesto senso. Locandina originale: niente bambino, niente uomo seduto, niente persone o logo.
// Copertina (è anche la miniatura del post: completa dal fotogramma 0): in fondo al corridoio buio di una vecchia casa
// di Filadelfia la porta chiusa della cantina con l'unica maniglia rossa; da sotto filtra una luce fredda azzurra e la
// brina sale sul legno; la maniglia gira piano da sola (l'aggancio dei primi secondi).
// Finale: lo stesso corridoio al mattino, la porta aperta su una luce bianca e calda, la brina che si scioglie.
// Piani: parete di fondo e porta (0,3–0,5) · pareti laterali e pavimento (0,6) · mobiletto e cornice (0,8)
//        · ringhiera della scala in primo piano (1,2) · pulviscolo (1,5–1,8)

const Sfondo: React.FC<{ id: string; t: number; dur: number; mattino: boolean }> = ({ id, t, dur, mattino }) => {
  const cam = camera(t, dur, 540, 1000);
  const L = cam.layer;
  // la maniglia gira da sola: due scatti piccoli, poi un quarto di giro e torna
  const turn = mattino ? 0 : 0.18 * eo(seg(t, 0.4, 0.9)) + 0.5 * eio(seg(t, 1.6, 2.4)) - 0.68 * eo(seg(t, 3.0, 3.6));
  const rattle = mattino ? 0 : Math.sin(t * 40) * (seg(t, 0.4, 0.6) - seg(t, 0.8, 1.0) + seg(t, 1.6, 1.8) - seg(t, 2.3, 2.5));
  const frost = mattino ? 0.25 * (1 - seg(t, 0, 3)) : lerp(0.55, 1, eio(seg(t, 0, 3.6)));
  const under = mattino ? 0 : 0.75 + 0.12 * Math.sin(t * 5) + 0.1 * Math.sin(t * 11.3);
  const DX = 375, DY = 1290, DW = 330, DH = 690; // la porta
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <SestoDefs id={id} />
        <Lin id={`${id}-back`} stops={mattino ? [[0, '#B8B4A8'], [0.45, '#D8D2C2'], [0.8, '#C8C0AC'], [1, '#8A8272']] : [[0, '#06080C'], [0.4, '#141C26'], [0.75, '#1E2A36'], [1, '#0E141A']]} />
        <Lin id={`${id}-wallL`} x2={1} y2={0} stops={mattino ? [[0, '#6A6456'], [1, '#A8A090']] : [[0, '#040608'], [0.7, '#101820'], [1, '#18222C']]} />
        <Lin id={`${id}-wallR`} x2={1} y2={0} stops={mattino ? [[0, '#B0A898'], [1, '#7A7262']] : [[0, '#1A2430'], [0.4, '#0E151C'], [1, '#040608']]} />
        <Lin id={`${id}-floor`} stops={mattino ? [[0, '#8A6A4A'], [0.5, '#5A4028'], [1, '#2A1C10']] : [[0, '#2A2420'], [0.5, '#16120E'], [1, '#060504']]} />
        <linearGradient id={`${id}-spill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mattino ? '#FFF4DC' : '#BFE0FF'} stopOpacity=".85" />
          <stop offset=".5" stopColor={mattino ? '#FFF4DC' : '#BFE0FF'} stopOpacity=".25" />
          <stop offset="1" stopColor={mattino ? '#FFF4DC' : '#BFE0FF'} stopOpacity="0" />
        </linearGradient>
        <Lin id={`${id}-doorN`} x2={1} y2={0} stops={[[0, '#5A6E80'], [0.35, '#3A4A5A'], [1, '#18222C']]} />
        <linearGradient id={`${id}-moon`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A8C8E8" stopOpacity=".45" />
          <stop offset="1" stopColor="#A8C8E8" stopOpacity="0" />
        </linearGradient>
        <Lin id={`${id}-rail`} x2={1} y2={0} stops={[[0, '#1A100A'], [0.45, '#5A3A24'], [0.6, '#3A2414'], [1, '#120A06']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — parete di fondo con la porta della cantina (0,35) */}
        <g transform={L(0.35)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill={`url(#${id}-back)`} />
          {/* carta da parati a righe e boiserie */}
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${250 + i * 52} 520 V1010`} stroke={mattino ? '#9A927E' : '#2A3846'} strokeWidth="10" opacity=".35" />)}
          <rect x="240" y="1010" width="600" height="280" fill={mattino ? '#9A8E78' : '#121A22'} />
          <path d="M240 1010 H840" stroke={mattino ? '#E8E0CC' : '#3A4856'} strokeWidth="10" />
          {[268, 720].map((x) => <rect key={x} x={x} y="1050" width="90" height="200" fill="none" stroke={mattino ? '#7A705C' : '#05080C'} strokeWidth="6" />)}
          <Glow id={`${id}-door`} x={DX + DW / 2} y={DY - 40} r={mattino ? 520 : 380} t={t} color={mattino ? '#FFF2D8' : '#9CC8F0'} amp={0.06} rate={3} opacity={mattino ? 0.8 : 0.42 * under} />
          <Porta id={id} x={DX} y={DY} w={DW} h={DH} turn={turn + rattle * 0.15} open={mattino ? 0.85 : 0} behind="#FFF8E8" paint={mattino ? undefined : `url(#${id}-doorN)`} knob={34} />
          {!mattino && <path d={`M${DX + 8} ${DY - DH + 10} V${DY - 12}`} stroke="#9CC8F0" strokeWidth="5" opacity=".55" />}
          {mattino && <Glow id={`${id}-open`} x={DX + DW / 2} y={DY - DH / 2} r={420} t={t} color="#FFFFFF" amp={0.04} rate={1.5} opacity={0.8} />}
          {/* luce fredda sotto la porta e brina che sale sul legno */}
          {!mattino && <rect x={DX + 6} y={DY - 8} width={DW - 12} height="10" fill="#DCF0FF" opacity={under} />}
          <Brina id={id} x={DX} y={DY - 6} w={DW} p={frost} />
          <Glow id={`${id}-knob`} x={DX + DW - 52} y={DY - DH + DH * 0.54} r={110} t={t} color="#FF5A48" amp={0.12} rate={2.4} opacity={mattino ? 0.35 : 0.6 + 0.4 * Math.abs(turn)} />
        </g>

        {/* PIANO 1 — pareti laterali in prospettiva e pavimento a listelli (0,6) */}
        <g transform={L(0.6)}>
          <path d="M-200 -200 H250 V1290 L-200 1700 Z" fill={`url(#${id}-wallL)`} />
          <path d="M830 -200 H1280 V1700 L830 1290 Z" fill={`url(#${id}-wallR)`} />
          <path d="M250 1290 L-200 1700 V2200 H1280 V1700 L830 1290 Z" fill={`url(#${id}-floor)`} />
          {Array.from({ length: 9 }, (_, i) => {
            const x0 = 250 + (i * 580) / 8, x1 = -200 + (i * 1480) / 8;
            return <path key={i} d={`M${x0} 1290 L${x1} 2200`} stroke="#000" strokeWidth="4" opacity=".4" />;
          })}
          {[1330, 1400, 1500, 1650, 1880].map((y) => <path key={y} d={`M-200 ${y} H1280`} stroke="#000" strokeWidth="3" opacity=".22" />)}
          {/* la luce che esce da sotto la porta e si allunga sul pavimento */}
          <path d={`M${DX + 6} 1290 H${DX + DW - 6} L${DX + DW + 160} 1700 H${DX - 160} Z`} fill={`url(#${id}-spill)`} opacity={mattino ? 0.8 : under * 0.8} />
          {/* finestra sul muro di sinistra: luce di luna che taglia il pavimento */}
          <path d="M40 640 L190 740 V1120 L40 1150 Z" fill={mattino ? '#F2EAD0' : '#2A4058'} stroke={K} strokeWidth="8" />
          <path d="M115 690 V1135 M40 900 L190 930" stroke={K} strokeWidth="7" />
          <path d="M40 640 L190 740 V1120 L40 1150 Z" fill={`url(#${id}-glass)`} />
          <path d="M20 620 L210 740 V1180 L150 1170 Q120 900 40 650 Z" fill="#2A1A20" stroke={K} strokeWidth="6" opacity={mattino ? 0.6 : 0.9} />
          {!mattino && <path d="M190 760 L190 1120 L640 1700 L420 1900 Z" fill={`url(#${id}-moon)`} opacity=".6" />}
          <path d="M250 1290 V-200 M830 1290 V-200" stroke={mattino ? '#5A5244' : '#000'} strokeWidth="10" opacity=".5" />
          {/* battiscopa */}
          <path d="M250 1290 L-200 1700 V1640 L250 1250 Z" fill={mattino ? '#5A4A38' : '#0A0E12'} stroke={K} strokeWidth="5" />
          <path d="M830 1290 L1280 1700 V1640 L830 1250 Z" fill={mattino ? '#5A4A38' : '#0A0E12'} stroke={K} strokeWidth="5" />
          <Fog id={`${id}-fog`} t={t} y={1330} rx={420} ry={60} color={mattino ? '#FFF6E4' : '#B4D4F0'} opacity={mattino ? 0.3 : 0.4} speed={0.5} drift={60} />
        </g>

        {/* PIANO 2 — cornice e lampada a muro a sinistra, mobiletto a destra (0,8) */}
        <g transform={L(0.8)}>
          <g transform="translate(975 800) skewY(22)">
            <rect x="-70" y="-110" width="140" height="190" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="6" />
            <rect x="-54" y="-94" width="108" height="158" fill={mattino ? '#8A9A8A' : '#1A2420'} stroke={K} strokeWidth="3" />
            <path d="M-54 30 Q-20 0 10 20 T54 0 V64 H-54 Z" fill={mattino ? '#5A6A54' : '#0E1612'} />
          </g>
          <g transform="translate(960 1180)">
            <Ombra id={id} x={0} y={210} rx={170} ry={22} />
            <path d="M-130 0 L130 -40 V180 L-130 210 Z" fill={`url(#${id}-wood)`} stroke={K} strokeWidth="8" />
            <path d="M-150 -6 L150 -50 L130 -40 L-130 0 Z" fill="#4A3020" stroke={K} strokeWidth="6" />
            <path d="M-110 40 L110 8 M-110 110 L110 80" stroke={K} strokeWidth="5" />
            {[60, 130].map((y) => <circle key={y} cx="-10" cy={y - 10} r="7" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="3" />)}
            {/* telefono a disco spento sul mobiletto */}
            <path d="M-60 -16 Q-60 -70 0 -76 Q60 -70 54 -30 Z" fill="#14181C" stroke={K} strokeWidth="6" />
            <circle cx="-2" cy="-44" r="18" fill="#3A4248" stroke={K} strokeWidth="4" />
            <path d="M-50 -82 Q0 -104 50 -86" stroke="#14181C" strokeWidth="22" strokeLinecap="round" fill="none" />
            <path d="M-46 -90 Q0 -108 40 -94" stroke={mattino ? '#E8E0CC' : '#4A5866'} strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        </g>

        {/* PIANO 3 — ringhiera della scala in primo piano a sinistra (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1350 L330 1960 H-200 Z" fill="#0A0604" />
          <path d="M-220 1300 L360 1940" stroke={K} strokeWidth="58" strokeLinecap="round" />
          <path d="M-220 1300 L360 1940" stroke={`url(#${id}-rail)`} strokeWidth="40" strokeLinecap="round" />
          <path d="M-210 1288 L360 1916" stroke={mattino ? '#C89A6A' : '#6A4A34'} strokeWidth="6" opacity=".7" />
          {Array.from({ length: 6 }, (_, i) => {
            const x = -120 + i * 90, y = 1410 + i * 99;
            return (
              <g key={i}>
                <rect x={x - 13} y={y} width="26" height="520" fill={`url(#${id}-rail)`} stroke={K} strokeWidth="6" />
                <ellipse cx={x} cy={y + 60} rx="20" ry="12" fill="#3A2414" stroke={K} strokeWidth="4" />
              </g>
            );
          })}
        </g>
        {/* PIANO 4 — pulviscolo nella luce fredda (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 1180, x0: 360, x1: 720 }} bottom={{ y: 1700, x0: 200, x1: 880 }} seed={7} n={22} color={mattino ? '#FFF4D8' : '#D8ECFF'} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id={`${id}-near`} t={t} color={mattino ? '#FFF6E0' : '#C8DCF0'} n={6} opacity={0.1} />
        </g>
      </g>
      <Finish id={id} tint={mattino ? '#E8D8B8' : '#22303E'} tintOpacity={mattino ? 0.08 : 0.14} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  // completa dal fotogramma 0 (è la miniatura): niente dissolvenze, solo un lieve respiro del titolo
  const breath = 1 + 0.008 * Math.sin(t * 1.6);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sfondo id="sc" t={t} dur={dur} mattino={false} />
      <div style={{ position: 'absolute', left: 120, top: 280, width: 840, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.chiaro, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI<Speciale nome={film.copertina.speciale} scale={1} /></p>
        <h1 style={{ margin: '6px 0 0', fontFamily: CRIMSON, fontWeight: 800, fontSize: 150, lineHeight: 0.9, letterSpacing: '-0.01em', color: P.chiaro,
          textShadow: `0 6px 0 ${P.scuro}, 0 0 40px ${P.scuro}`, transform: `scale(${breath})`, transformOrigin: 'left center' }}>
          Il <span style={{ color: P.accento }}>sesto</span> senso
        </h1>
        <p style={{ margin: '18px 0 0', fontSize: 38, fontWeight: 800, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}E0`, color: P.chiaro, fontFamily: SANS, fontSize: 40, fontWeight: 800, textAlign: 'center' }}>
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
      <Sfondo id="sf" t={t} dur={dur} mattino />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.chiaro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 1130, margin: 0, textAlign: 'center', fontFamily: CRIMSON, fontWeight: 800, fontSize: 150, lineHeight: 1,
        color: P.scuro, textShadow: `0 4px 0 ${P.chiaro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        The End
      </h1>
    </div>
  );
};
