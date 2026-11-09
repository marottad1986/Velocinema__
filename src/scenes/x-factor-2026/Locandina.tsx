import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Beam, Glow, NearMotes } from '../../lib/elements';
import { ANTON, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import type { PosterProps } from '../../types';
import { Americana, Asta, Foschia, ORO, Parete, Pavimento, RiflessoAsta, Spia, TalentDefs, TINTA, Torre } from '../talent/Studio';
import { CONCORRENTI, GIUDICI, stato } from '../talent/x-factor-2026';

// Copertina e finale di X Factor 2026 (recupero fino al Live 3). Locandina nostra: niente logo del programma (né la «X»
// stilizzata), niente scenografia vera, niente persone. Copertina (è anche la miniatura, completa al fotogramma 0): in
// primo piano il grande microfono dorato della gara, dietro la fila delle aste dei concorrenti nei colori delle squadre,
// tre spente (gli eliminati); tre fasci che spazzano la fila «cercando» chi resta. Finale: lo stesso palco con le dieci
// aste rimaste accese.

const DOPO = 3;
const FILA = CONCORRENTI.filter((c) => stato(c, DOPO) !== 'assente');

const Sfondo: React.FC<{ id: string; t: number; dur: number; finale?: boolean }> = ({ id, t, dur, finale }) => {
  const cam = camera(t, dur, 540, 1150);
  const L = cam.layer;
  const colori = GIUDICI.map((g) => g.colore);
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <TalentDefs id={id} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.25)}>
          <Parete id={id} t={t} top={780} bottom={1130} colori={colori} luce={0.85} />
          <Americana id={id} t={t} y={120} colori={['#FFF2D0', ORO]} />
          <Torre id={id} t={t} x={-10} y={820} colori={[ORO, '#C8B8FF', '#FFF2D0']} />
          <Torre id={id} t={t} x={1090} y={820} colori={['#FFF2D0', '#C8B8FF', ORO]} flip />
        </g>
        <g transform={L(0.45)}>
          <Pavimento id={id} t={t} y={1130} bordo={1640} colori={colori} />
          {/* tre fasci che cercano tra le aste */}
          {[0, 1, 2].map((k) => (
            <Beam key={k} id={`${id}-sw${k}`} x={[120, 540, 960][k]} y={860} t={t + k * 1.7} length={520} spread={200} angle={90 + [-14, 0, 14][k]} sweep={22} sweepRate={0.9 + k * 0.15}
              color={k === 1 ? ORO : '#FFF2D0'} opacity={0.42} />
          ))}
          {FILA.map((c, k) => {
            const g = GIUDICI.find((x) => x.id === c.squadra)!;
            const x = 70 + (k * 940) / (FILA.length - 1);
            const fuori = stato(c, DOPO) === 'fuori';
            const y = 1265 + Math.abs(k - (FILA.length - 1) / 2) * -6;
            return (
              <g key={c.id}>
                <RiflessoAsta t={t} x={x} y={y + 2} s={0.26} colore={g.colore} o={fuori ? 0 : 1} />
                <Asta id={id} t={t} x={x} y={y} s={0.26} colore={g.colore} luce={fuori ? 0 : 1} fuori={fuori ? 1 : 0} cartellino={false} pass={c.entra ? 1 : 0} band={c.band} ph={k} />
              </g>
            );
          })}
          <Foschia id={`${id}-fo`} t={t} y={1290} />
        </g>
        {/* il grande microfono dorato in primo piano */}
        <g transform={L(0.8)}>
          <Glow id={`${id}-hero`} x={500} y={1080} r={420} t={t} color={ORO} amp={0.06} rate={2} opacity={finale ? 0.35 : 0.6} />
          <Asta id={id} t={t} x={540} y={1780} s={1.12} colore={ORO} oro luce={1} cartellino={false} ph={0.5} />
        </g>
        <g transform={L(1.2)}>
          <Spia id={id} x={110} y={1900} s={1.3} colore={ORO} />
          <Spia id={id} x={970} y={1900} s={1.3} colore={ORO} flip />
        </g>
        <g transform={L(1.7)}>
          <NearMotes id={`${id}-near`} t={t} color="#FFE8B0" n={7} r0={50} r1={130} opacity={0.12} />
        </g>
      </g>
      <Finish id={id} tint={TINTA} tintOpacity={0.12} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  // completa dal fotogramma 0 (è la miniatura); la fascia della frase di lancio entra da 0,4 s (CLAUDE.md, «Formato»)
  const line = eo(seg(t, 0.4, 0.7));
  const breath = 1 + 0.008 * Math.sin(t * 1.6);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sfondo id="xc" t={t} dur={dur} />
      <div style={{ position: 'absolute', left: 120, top: 280, width: 840, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.chiaro, textShadow: `0 2px 0 ${P.scuro}` }}>TALENT SPIEGATI</p>
        <h1 style={{ margin: '4px 0 0', fontFamily: ANTON, fontWeight: 400, fontSize: 150, lineHeight: 0.95, color: P.chiaro, whiteSpace: 'nowrap',
          textShadow: `0 7px 0 ${P.scuro}, 0 0 50px ${P.scuro}`, transform: `scale(${breath})`, transformOrigin: 'left center' }}>
          X FACTOR <span style={{ color: P.accento }}>2026</span>
        </h1>
        <p style={{ margin: '14px 0 0', fontFamily: DISPLAY, fontWeight: 800, fontSize: 70, lineHeight: 1, color: P.chiaro, textShadow: `0 5px 0 ${P.scuro}` }}>
          Chi è ancora in gara
        </p>
        <span style={{ display: 'inline-block', marginTop: 22, padding: '10px 22px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 32, fontWeight: 800, letterSpacing: '0.12em' }}>
          PRIMA DEL LIVE 4
        </span>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}E0`, color: P.chiaro, fontFamily: SANS, fontSize: 40, fontWeight: 800, textAlign: 'center',
        opacity: line, visibility: line > 0 ? 'visible' : 'hidden', transform: `translateY(${(1 - line) * 14}px)` }}>
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
      <Sfondo id="xf" t={t} dur={dur} finale />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è servito?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con chi vorresti in finale.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 120, width: 840, top: 690, margin: 0, textAlign: 'center', fontFamily: ANTON, fontWeight: 400, fontSize: 100, lineHeight: 1, whiteSpace: 'nowrap',
        color: P.accento, textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        10 ANCORA IN GARA
      </h1>
    </div>
  );
};
