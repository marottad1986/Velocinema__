import React from 'react';
import { eo, eob, lerp, seg } from '../../lib/anim';
import { DISPLAY, FELL, SANS } from '../../lib/fonts';
import { Fog, Glow, NearMotes, Stars } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Speciale } from '../../components/Speciale';
import type { PosterProps } from '../../types';
import { Albero, Carillon, ConjDefs, Fattoria, GOLD, K, Quadrante, TINT_GIORNO, TINT_NOTTE } from './Comuni';

// Copertina e finale di The Conjuring: locandina originale, niente persone, sagome, strega, bambola o locandina ufficiale.
// Notte di nebbia: la fattoria con una sola finestra accesa (l'abbaino) e il grande albero nodoso; in primo piano, sul
// davanzale di legno, l'orologio da muro con il vetro incrinato fermo alle 3:07 con le lancette d'oro e il carillon che si
// socchiude da solo. Il fotogramma 0 è già completo (è la miniatura): etichetta, titolo, regista, orologio alle 3:07; la
// frase di lancio entra da 0,4 s. Nel finale è l'alba: la nebbia si alza, l'orologio riparte e il carillon è chiuso.

const Art: React.FC<{ t: number; id: string; dawn?: number }> = ({ t, id, dawn = 0 }) => {
  const lid = dawn ? 0 : 0.15 + 0.5 * eo(seg(t, 0.9, 2.2));
  const h = dawn ? 7 + 12 / 60 + t / 60 : 3 + 7 / 60;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <ConjDefs id={id} />
        <Lin id={`${id}-sky`} stops={dawn
          ? [[0, '#2A3448'], [0.55, '#8A7A88'], [0.8, '#E8B48A'], [1, '#F2D0A0']]
          : [[0, '#04060C'], [0.5, '#101828'], [0.8, '#26324A'], [1, '#34405A']]} />
        <Lin id={`${id}-sill`} stops={[[0, '#5A3E26'], [0.4, '#3A2618'], [1, '#160E08']]} />
      </defs>
      <g transform={`translate(540 1000) scale(${1.05 + 0.015 * Math.sin(t * 0.5)}) translate(-540 -1000)`}>
        <rect x="-100" y="-100" width="1280" height="1500" fill={`url(#${id}-sky)`} />
        {!dawn && <Stars t={t} seed={31} n={30} y={0} h={600} color="#C8D0E0" />}
        <Glow id={`${id}-moon`} x={760} y={860} r={380} t={t} color={dawn ? '#FFE0B0' : '#9FB8D0'} amp={0.03} rate={1} opacity={0.45} />
        <path d="M-100 1180 Q300 1150 700 1170 Q1000 1185 1180 1160 V1500 H-100 Z" fill={dawn ? '#3A4038' : '#0E1416'} />
        <Fattoria id={`${id}-f`} x={540} y={1215} s={0.47} t={t} lit={dawn ? [0, 0, 0, 0, 0, 0] : [0, 0, 0, 0, 0, 0.95 + 0.05 * Math.sin(t * 9)]}
          night={dawn ? 0 : 1} wall={dawn ? ['#B8B2A4', '#7A766C'] : ['#5A5E66', '#30343A']} warm="#FFB860" />
        <Albero id={id} x={930} y={1220} s={0.42} t={t} sway={1.2} reach={0.5} rim={dawn ? '#F2C090' : '#9FB8D0'} />
        <Fog id={`${id}-fog1`} t={t} y={1190} rx={900} ry={70} color={dawn ? '#F2E0C8' : '#7A8AA0'} opacity={dawn ? 0.2 : 0.35} />
        <Fog id={`${id}-fog2`} t={t} y={1240} rx={700} ry={60} color={dawn ? '#F2E0C8' : '#8A9AB0'} opacity={dawn ? 0.15 : 0.3} ph={2} />
        {/* il davanzale in primo piano con l'orologio fermo e il carillon */}
        <path d="M-100 1250 H1180 V1290 H-100 Z" fill={`url(#${id}-sill)`} stroke={K} strokeWidth="8" />
        <path d="M-100 1252 H1180" stroke="#C89A5A" strokeWidth="4" opacity=".5" />
        {/* la parete di legno a pannelli sotto il davanzale, scaldata dal lume */}
        <path d="M-100 1290 H1180 V2000 H-100 Z" fill={dawn ? '#3A2A1C' : '#1E140C'} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={-60 + i * 300} y={1340} width={250} height={520} rx={8} fill={dawn ? '#4A3424' : '#2A1C10'} stroke={K} strokeWidth="8" />
            <rect x={-36 + i * 300} y={1364} width={202} height={472} rx={6} fill="none" stroke="#C89A5A" strokeWidth="4" opacity=".25" />
          </g>
        ))}
        <path d="M-100 1290 H1180 V1330 H-100 Z" fill="#000" opacity=".55" />
        {/* il lume sul davanzale, che scalda la parete dal basso */}
        <g transform="translate(560 1252)">
          <path d="M-26 0 Q-34 -26 -18 -42 H18 Q34 -26 26 0 Z" fill={`url(#${id}-brass)`} stroke={K} strokeWidth="5" />
          <path d="M-12 -42 Q-26 -70 -10 -96 V-112 H10 V-96 Q26 -70 12 -42 Z" fill="#FFFFFF" opacity=".25" stroke={K} strokeWidth="4" />
          {!dawn && <path d={`M-7 -52 Q-7 -70 ${Math.sin(t * 7) * 2} ${-84 - 4 * Math.sin(t * 11)} Q7 -70 7 -52 Z`} fill={`url(#${id}-flame)`} />}
        </g>
        {!dawn && <Glow id={`${id}-lume`} x={560} y={1200} r={520} t={t} color={GOLD} amp={0.06} rate={8} opacity={0.45} />}
        {/* le tende pesanti ai lati, dall'alto in basso */}
        <path d="M-100 -100 H90 Q60 600 110 1300 Q70 1700 100 2000 H-100 Z" fill="#3A1E22" stroke={K} strokeWidth="10" />
        <path d="M40 0 Q10 600 60 1300 Q30 1700 50 2000" stroke="#5A2E32" strokeWidth="14" fill="none" />
        <path d="M1180 -100 H990 Q1020 600 970 1300 Q1010 1700 980 2000 H1180 Z" fill="#3A1E22" stroke={K} strokeWidth="10" />
        <path d="M1040 0 Q1070 600 1020 1300 Q1050 1700 1030 2000" stroke="#5A2E32" strokeWidth="14" fill="none" />
        <g transform="translate(290 1120)">
          <path d="M0 -150 V-178" stroke={K} strokeWidth="6" />
          <circle cx="0" cy="-182" r="7" fill="#8A8A86" />
          <Quadrante id={id} x={0} y={0} r={118} h={h} stopped={dawn ? 0 : 1} roman crack />
        </g>
        <Carillon id={id} x={800} y={1252} s={0.9} t={t} open={lid} glow={dawn ? 0 : lid} />
      </g>
      <NearMotes id={`${id}-near`} t={t} color={dawn ? '#FFE8C0' : '#C8D8E8'} n={6} y0={1000} opacity={0.08} />
      <Finish id={id} tint={dawn ? TINT_GIORNO : TINT_NOTTE} tintOpacity={dawn ? 0.08 : 0.14} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  const breath = 1 + 0.008 * Math.sin(t * 1.6);
  const line = eo(seg(t, 0.4, 0.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t} id="tc" />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 760, background: `linear-gradient(${P.scuro}F0, ${P.scuro}00)` }} />
      <div style={{ position: 'absolute', left: 120, top: 280, width: 840, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.chiaro, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI<Speciale nome={film.copertina.speciale} scale={1} /></p>
        <p style={{ margin: '22px 0 0', fontFamily: FELL, fontSize: 64, lineHeight: 1, color: GOLD, textShadow: `0 3px 0 ${P.scuro}` }}>L'evocazione</p>
        <h1 style={{ margin: '4px 0 0', fontFamily: FELL, fontWeight: 400, fontSize: 168, lineHeight: 0.86, color: P.chiaro,
          textShadow: `0 6px 0 ${P.scuro}, 0 0 46px #9FB8D055`, transform: `scale(${breath})`, transformOrigin: 'left center' }}>
          The<br />Conjuring
        </h1>
        <p style={{ margin: '20px 0 0', fontSize: 38, fontWeight: 800, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1440, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 42, fontWeight: 800, textAlign: 'center',
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
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
  const end = eob(seg(t, 0.3, 0.9), 1.3);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t + 4} id="te" dawn={1} />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 780, margin: 0, textAlign: 'center', fontFamily: FELL, fontWeight: 400, fontSize: 150, lineHeight: 1,
        color: P.chiaro, textShadow: `0 4px 0 ${P.scuro}, 0 0 30px ${P.accento}88`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        Fine
      </h1>
    </div>
  );
};
