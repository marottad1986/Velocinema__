import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { BEBAS, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Flyers, Fog, Glow, NearMotes, Stars, StringLights } from '../../lib/elements';
import { Speciale } from '../../components/Speciale';
import type { PosterProps } from '../../types';
import { Abete, GIALLO, K, Ombra, StDefs, VELATURA } from './Comuni';

// Copertina e finale di Stranger Things, stagione 1. Locandina originale: niente ragazzi, niente mostro, niente logo
// (né il carattere serif rosso con il bordo luminoso). Copertina: strada nel bosco di notte, una bicicletta rovesciata
// con la ruota che gira ancora e una torcia accesa nell'erba; in fondo la recinzione illuminata del laboratorio.
// Finale: casa Byers nella neve la notte di Natale, con le lucine sul tetto e la stessa bici appoggiata alla
// staccionata (Will è tornato a casa).

const r = rng(2016);
const TREES_L = Array.from({ length: 7 }, (_, i) => ({ x: -120 + i * 70 + r() * 20, h: 380 + r() * 180, w: 170 + r() * 50 }));
const TREES_R = Array.from({ length: 7 }, (_, i) => ({ x: 680 + i * 70 + r() * 20, h: 380 + r() * 180, w: 170 + r() * 50 }));
const SNOW = Array.from({ length: 60 }, () => ({ x: r() * 1300 - 110, y: r() * 1300, s: 2 + r() * 5, v: 30 + r() * 60, ph: r() * 6 }));

/** Bicicletta rossa: in piedi (appoggiata) o rovesciata a terra; `spin` = angolo dei raggi della ruota. */
const Bici: React.FC<{ x: number; y: number; s: number; lying: boolean; spin: number }> = ({ x, y, s, lying, spin }) => {
  const wheel = (cx: number, a: number) => (
    <g transform={`translate(${cx} 0)`}>
      <circle r="92" fill="none" stroke={K} strokeWidth="16" />
      <circle r="92" fill="none" stroke="#3A3E46" strokeWidth="9" />
      <g transform={`rotate(${a})`}>{Array.from({ length: 12 }, (_, i) => <path key={i} d={`M0 0 L${Math.cos((i * Math.PI) / 6) * 86} ${Math.sin((i * Math.PI) / 6) * 86}`} stroke="#B8C0C8" strokeWidth="2.5" />)}</g>
      <circle r="10" fill="#8A929A" stroke={K} strokeWidth="4" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) ${lying ? 'rotate(8) scale(1 0.5)' : ''} scale(${s})`}>
      {wheel(-130, spin * 0.2)}
      {wheel(130, spin)}
      <path d="M-130 0 L-40 -110 L70 -110 L130 0 M-40 -110 L0 0 L70 -110 M0 0 L-130 0" fill="none" stroke={K} strokeWidth="18" strokeLinejoin="round" />
      <path d="M-130 0 L-40 -110 L70 -110 L130 0 M-40 -110 L0 0 L70 -110 M0 0 L-130 0" fill="none" stroke="#B8352F" strokeWidth="10" strokeLinejoin="round" />
      <path d="M-40 -110 L-50 -140 M-80 -146 H-20" stroke={K} strokeWidth="12" strokeLinecap="round" />
      <path d="M-86 -150 H-20" stroke="#2A2420" strokeWidth="14" strokeLinecap="round" />
      <path d="M70 -110 L80 -150 M60 -156 Q90 -170 110 -150" stroke={K} strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M60 -156 Q90 -170 110 -150" stroke="#9AA2AA" strokeWidth="5" fill="none" />
      <circle cx="0" cy="0" r="16" fill="#5A606A" stroke={K} strokeWidth="5" />
      <path d="M-60 -106 L46 -106" stroke="#F08A7A" strokeWidth="3" opacity=".6" />
    </g>
  );
};

const Sfondo: React.FC<{ id: string; t: number; dur: number; finale: boolean }> = ({ id, t, dur, finale }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const lampOn = finale ? 1 : 0.55 + 0.45 * (Math.sin(t * 5.1) > -0.6 ? 1 : 0.2);
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <StDefs id={id} />
        <Lin id={`${id}-sky`} stops={[[0, '#04060C'], [0.35, '#0C1424'], [0.6, '#1C2A44'], [0.75, '#2A3A58']]} />
        <Lin id={`${id}-road`} stops={[[0, '#3A4048'], [1, '#14161A']]} />
        <Lin id={`${id}-ground`} stops={finale ? [[0, '#C8D4E4'], [0.5, '#9AAAC2'], [1, '#5A6A84']] : [[0, '#1A2620'], [1, '#060A08']]} />
        <linearGradient id={`${id}-torch`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF0C0" stopOpacity=".7" /><stop offset=".7" stopColor="#FFE0A0" stopOpacity=".15" /><stop offset="1" stopColor="#FFE0A0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill={`url(#${id}-sky)`} />
          <Stars t={t} seed={finale ? 9 : 4} n={90} x={-100} y={40} w={1280} h={760} color="#E8EEF8" size={0.7} />
          {!finale && <Glow id={`${id}-lab`} x={540} y={1000} r={360} t={t} color="#CFE4F0" amp={0.03} rate={1} opacity={0.45} />}
          {finale && <Glow id={`${id}-moon`} x={860} y={820} r={260} t={t} color="#C8D6E8" amp={0.03} rate={0.8} opacity={0.4} />}
        </g>
        {!finale ? (
          <>
            {/* bosco ai lati della strada e la recinzione del laboratorio in fondo */}
            <g transform={L(0.4)}>
              {TREES_L.map((f, i) => <Abete key={`l${i}`} x={f.x} y={1060} h={f.h} w={f.w} color="#101A2C" seed={i} />)}
              {TREES_R.map((f, i) => <Abete key={`r${i}`} x={f.x + 60} y={1060} h={f.h} w={f.w} color="#101A2C" seed={i + 9} />)}
              <rect x="440" y="960" width="220" height="70" fill="none" stroke="#8A96A6" strokeWidth="3" opacity=".7" />
              {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${440 + i * 44} 950 V1030`} stroke="#5A6472" strokeWidth="5" />)}
              {[470, 630].map((x) => <circle key={x} cx={x} cy="940" r="7" fill="#F2F8FF" />)}
              <Fog id={`${id}-f1`} t={t} y={1040} rx={700} ry={70} color="#5A6A84" opacity={0.6} speed={0.2} drift={60} />
            </g>
            {/* strada che si perde nel bosco */}
            <g transform={L(0.7)}>
              <path d="M-200 1040 H1280 V2200 H-200 Z" fill={`url(#${id}-ground)`} />
              <path d="M500 1040 H600 L1160 2200 H-80 Z" fill={`url(#${id}-road)`} stroke={K} strokeWidth="6" />
              {Array.from({ length: 7 }, (_, i) => {
                const p = i / 6, y = lerp(1060, 1900, p * p), w = lerp(4, 22, p), h = lerp(14, 80, p);
                return <rect key={i} x={550 - w / 2 + p * 20} y={y} width={w} height={h} fill="#E8C860" opacity=".8" />;
              })}
              {/* lampione che sfarfalla a destra */}
              <path d="M960 1120 V800 Q960 770 920 770 H860" stroke={K} strokeWidth="14" fill="none" />
              <path d="M960 1120 V800 Q960 770 920 770 H860" stroke="#4A5058" strokeWidth="7" fill="none" />
              <path d="M830 764 H890 L880 790 H840 Z" fill="#3A4048" stroke={K} strokeWidth="5" />
              <Glow id={`${id}-lamp`} x={860} y={800} r={200} t={t} color="#FFD890" amp={0.04} rate={3} opacity={0.6 * lampOn} />
              <Beam id={`${id}-lampbeam`} x={860} y={792} t={t} length={420} spread={360} color="#FFE0A0" angle={90} opacity={0.22 * lampOn} />
              {/* la bicicletta rovesciata con la ruota che gira */}
              <Ombra id={id} x={430} y={1250} rx={300} ry={30} />
              <Bici x={430} y={1220} s={1.05} lying spin={t * 240} />
              {/* torcia accesa nell'erba */}
              <path d={`M150 1290 L700 1220 L720 1330 Z`} fill={`url(#${id}-torch)`} />
              <g transform="translate(150 1290) rotate(-6)">
                <rect x="-80" y="-18" width="84" height="36" rx="7" fill="#2A2E36" stroke={K} strokeWidth="6" />
                <path d="M4 -24 L30 -30 V30 L4 24 Z" fill="#5A606A" stroke={K} strokeWidth="5" />
                <ellipse cx="30" cy="0" rx="7" ry="28" fill="#FFF6D8" />
              </g>
              <Glow id={`${id}-tg`} x={176} y={1288} r={100} t={t} color="#FFF0C0" amp={0.05} rate={5} opacity={0.8} />
              {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-60 + i * 12} 1330 q${4 + (i % 3) * 4} -40 ${-6 + (i % 5) * 4} -${60 + (i % 4) * 16}`} stroke="#1E3424" strokeWidth="7" fill="none" strokeLinecap="round" />)}
            </g>
          </>
        ) : (
          <>
            {/* casa Byers nella neve con le lucine, la bici appoggiata alla staccionata */}
            <g transform={L(0.4, 0, 100)}>
              {[...TREES_L, ...TREES_R].map((f, i) => <Abete key={i} x={f.x + (i > 6 ? 60 : 0)} y={1080} h={f.h * 0.8} w={f.w} color="#16223A" seed={i + 30} />)}
              <rect x="-200" y="1060" width="1480" height="200" fill="#8A9AB4" />
            </g>
            <g transform={L(0.55, 0, 100)}>
              <Glow id={`${id}-hg`} x={560} y={1000} r={420} t={t} color="#FFC870" amp={0.03} rate={1.5} opacity={0.4} />
              <path d="M300 900 L560 790 L820 900 V1150 H300 Z" fill={`url(#${id}-siding)`} stroke={K} strokeWidth="8" />
              {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M300 ${930 + i * 28} H820`} stroke="#000" strokeWidth="3" opacity=".22" />)}
              <path d="M272 912 L560 780 L848 912" fill="none" stroke="#1C2028" strokeWidth="28" strokeLinejoin="round" />
              <path d="M276 900 L560 770 L844 900" fill="none" stroke="#E8EEF8" strokeWidth="14" strokeLinejoin="round" />
              <StringLights id={`${id}-sl1`} t={t} from={{ x: 290, y: 914 }} to={{ x: 560, y: 794 }} n={9} sag={10} r={7} wire="#141018" />
              <StringLights id={`${id}-sl2`} t={t + 2} from={{ x: 560, y: 794 }} to={{ x: 830, y: 914 }} n={9} sag={10} r={7} wire="#141018" />
              {[[340, 970], [440, 970], [690, 970]].map(([wx, wy], k) => (
                <g key={k}>
                  <rect x={wx} y={wy} width="76" height="86" fill="#FFC870" stroke={K} strokeWidth="6" />
                  <path d={`M${wx + 38} ${wy} V${wy + 86} M${wx} ${wy + 43} H${wx + 76}`} stroke={K} strokeWidth="4" />
                  <path d={`M${wx} ${wy + 86} H${wx + 76}`} stroke="#E8EEF8" strokeWidth="8" />
                </g>
              ))}
              <rect x="560" y="1030" width="80" height="120" fill="#5A2A22" stroke={K} strokeWidth="6" />
              <circle cx="600" cy="1070" r="22" fill="none" stroke="#2E5A34" strokeWidth="10" />
            </g>
            <g transform={L(0.75, 0, 100)}>
              <path d="M-200 1150 Q300 1130 600 1150 Q900 1170 1280 1140 V2200 H-200 Z" fill={`url(#${id}-ground)`} stroke="#3A4A64" strokeWidth="5" />
              <path d="M-200 1154 Q300 1134 600 1154 Q900 1174 1280 1144" stroke="#F2F6FC" strokeWidth="5" fill="none" opacity=".7" />
              {Array.from({ length: 8 }, (_, i) => (
                <g key={i}>
                  <rect x={-20 + i * 150} y={1180 - i * 2} width="20" height="110" fill="#3A3026" stroke={K} strokeWidth="5" />
                  <path d={`M${-24 + i * 150} ${1180 - i * 2} h28`} stroke="#F2F6FC" strokeWidth="7" />
                </g>
              ))}
              <path d="M-20 1210 L1100 1196 M-20 1250 L1100 1236" stroke="#3A3026" strokeWidth="12" />
              <path d="M-20 1204 L1100 1190" stroke="#F2F6FC" strokeWidth="5" />
              <Bici x={780} y={1300} s={0.9} lying={false} spin={0} />
              <path d="M650 1166 H790 M840 1176 Q880 1166 900 1180" stroke="#F2F6FC" strokeWidth="8" strokeLinecap="round" />
            </g>
            <g transform={L(0.6)}>
              {SNOW.map((f, i) => <circle key={i} cx={f.x + Math.sin(t * 0.8 + f.ph) * 18} cy={660 + mod(f.y + t * f.v, 1300)} r={f.s} fill="#F2F6FC" opacity=".85" />)}
            </g>
          </>
        )}
        <g transform={L(1.5)}>
          {!finale && <Flyers t={t} seed={13} n={5} color="#8A5A2A" outline={K} w={30} h={40} y0={900} y1={1800} speed={0.08} shape="leaf" />}
        </g>
        <g transform={L(1.8)}>
          <NearMotes id={`${id}-near`} t={t} color={finale ? '#E8EEF8' : '#9AAAC8'} n={7} r0={80} r1={180} opacity={0.1} />
        </g>
      </g>
      <Finish id={id} tint={VELATURA} tintOpacity={0.12} />
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
      <Sfondo id="sc0" t={t} dur={dur} finale={false} />
      <div style={{ position: 'absolute', left: 80, top: 290, width: 920, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: GIALLO, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>
          LA SERIE IN 2 MINUTI · STAGIONE {film.stagione}<Speciale nome={film.copertina.speciale} scale={eob(seg(t, 0.4, 0.8), 1.6)} />
        </p>
        <h1 style={{ margin: '10px 0 0', fontFamily: BEBAS, fontWeight: 400, fontSize: 210, lineHeight: 0.9, letterSpacing: '0.04em', color: P.chiaro,
          textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          Stranger Things
        </h1>
        <p style={{ margin: '20px 0 0', fontSize: 40, fontWeight: 800, opacity: dir, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>una serie di {film.regista} · {film.anno}</p>
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
      <Sfondo id="sc9" t={t} dur={dur} finale />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con la serie che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 690, margin: 0, textAlign: 'center', fontFamily: BEBAS, fontWeight: 400, fontSize: 190, lineHeight: 1,
        letterSpacing: '0.06em', color: P.chiaro, textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        The End
      </h1>
    </div>
  );
};
