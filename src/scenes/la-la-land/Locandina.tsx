import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, Moon, NearMotes, Notes, Stars, SunRays } from '../../lib/elements';
import type { PosterProps } from '../../types';

// Copertina e finale di La La Land: una tastiera di pianoforte gigante che corre come una strada verso il sole
// (o verso la luna, nel finale) sopra lo skyline. Locandina originale: niente cielo viola con lampione né coppie.
// Piani: cielo e sole/luna (0,2) · skyline lontano (0,4) · palme (0,6) · tastiera-strada (0,9) · note e pulviscolo (1,5)

const K = '#1B1530';
const VP = { x: 540, y: 1150 }; // punto di fuga sul sole
const BOTTOM = 2000;
const HALF = 820; // mezza larghezza della strada al bordo basso

const r = rng(2016);
const SKY = Array.from({ length: 16 }, (_, i) => {
  const x = -80 + i * 78 + r() * 30, w = 50 + r() * 50, h = 60 + r() * 170;
  // varco al centro: il sole (o la luna) resta visibile sopra la strada
  return { x, w, h: Math.abs(x + w / 2 - 540) < 230 ? h * 0.3 : h, win: r() };
});

/** Quota del bordo del tasto k (0 = vicino) in prospettiva. */
const keyY = (k: number) => VP.y + (BOTTOM - VP.y) * (1.6 / (k + 1.6));
const halfAt = (y: number) => (HALF * (y - VP.y)) / (BOTTOM - VP.y);

const Scena: React.FC<{ t: number; dur: number; night: boolean; id: string }> = ({ t, dur, night, id }) => {
  const cam = camera(t, dur, 540, 1300);
  const L = cam.layer;
  const ink = night ? '#2C2456' : '#F2C14E';
  // onda di tasti premuti che corre verso l'orizzonte
  const run = t * 5;

  const keys = [];
  for (let k = 0; k < 26; k++) {
    const y0 = keyY(k + 1), y1 = keyY(k);
    const h0 = halfAt(y0), h1 = halfAt(y1);
    const press = Math.max(0, 1 - Math.abs(mod(run - k, 13) - 0.5));
    const lit = night ? `rgba(242,193,78,${0.25 + press * 0.5})` : `rgba(255,255,255,${0.15 + press * 0.35})`;
    keys.push(
      <g key={k}>
        <path d={`M${VP.x - h1} ${y1} L${VP.x + h1} ${y1} L${VP.x + h0} ${y0} L${VP.x - h0} ${y0} Z`} fill={night ? '#D9D2E6' : '#FBF6EC'} stroke={K} strokeWidth={Math.max(1.5, 8 * (y1 - VP.y) / (BOTTOM - VP.y))} />
        <path d={`M${VP.x - h1} ${y1} L${VP.x + h1} ${y1} L${VP.x + h0} ${y0} L${VP.x - h0} ${y0} Z`} fill={lit} />
        {/* tasto nero sul bordo, schema 2–3 come una tastiera vera */}
        {[0, 1, 3, 4, 5].includes(k % 7) && (() => {
          const yb = y0 + (y1 - y0) * 0.15, yt = y0 - (y1 - y0) * 0.15;
          const hb = halfAt(yb), ht = halfAt(yt);
          return <path d={`M${VP.x - hb} ${yb} L${VP.x + hb * 0.15} ${yb} L${VP.x + ht * 0.15} ${yt} L${VP.x - ht} ${yt} Z`} fill="#16122A" stroke={K} strokeWidth="2" />;
        })()}
      </g>,
    );
  }

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        {night ? (
          <Lin id={`${id}-sky`} stops={[[0, '#0E0B22'], [0.35, '#1C1838'], [0.55, '#3A2E6E'], [0.6, '#5B4A94']]} />
        ) : (
          <Lin id={`${id}-sky`} stops={[[0, '#F28C6B'], [0.3, '#F6A86A'], [0.5, '#F7C66A'], [0.6, '#FFE29A']]} />
        )}
        <Lin id={`${id}-city`} stops={night ? [[0, '#241D4A'], [1, '#15112C']] : [[0, '#B4567A'], [1, '#7A3A6A']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill={`url(#${id}-sky)`} />
          {night ? (
            <>
              <Stars t={t} n={45} h={900} y={80} color="#F6F1E9" />
              <Moon id={`${id}-moon`} x={VP.x} y={VP.y - 150} r={90} t={t} color="#F6F1E9" halo="#C9B8F0" />
            </>
          ) : (
            <>
              <SunRays id={`${id}-rays`} x={VP.x} y={VP.y - 40} t={t} n={11} width={80} opacity={0.6} color="#FFF3C8" />
              <Glow id={`${id}-sun`} x={VP.x} y={VP.y - 40} r={360} t={t} color="#FFF0B8" amp={0.05} rate={1.4} opacity={0.8} />
              <circle cx={VP.x} cy={VP.y - 40} r="140" fill="#FFF3C8" />
            </>
          )}
        </g>
        {/* skyline senza contorni, con finestre accese di notte */}
        <g transform={L(0.4)}>
          {SKY.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={VP.y - b.h} width={b.w} height={b.h + 40} fill={`url(#${id}-city)`} />
              {night && Array.from({ length: Math.floor(b.h / 40) }, (_, j) => (
                <rect key={j} x={b.x + 10 + (j % 2) * (b.w / 2 - 6)} y={VP.y - b.h + 16 + j * 34} width="8" height="12" fill="#F2C14E"
                  opacity={0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * (1 + b.win) + i + j))} />
              ))}
            </g>
          ))}
          <rect x="-200" y={VP.y} width="1480" height="60" fill={night ? '#15112C' : '#7A3A6A'} />
        </g>
        {/* palme ai lati che ondeggiano */}
        <g transform={L(0.6)}>
          {[{ x: 60, h: 270, s: 1 }, { x: 1010, h: 250, s: -1 }].map((p, i) => {
            const sway = Math.sin(t * 1.2 + i) * 4;
            const top = { x: p.x + p.s * 30, y: VP.y - p.h };
            return (
              <g key={i} transform={`rotate(${sway} ${p.x} ${VP.y + 40})`}>
                <path d={`M${p.x - 10} ${VP.y + 40} Q${p.x + p.s * 40} ${VP.y - p.h * 0.5} ${top.x} ${top.y} L${top.x + 12} ${top.y} Q${p.x + p.s * 52} ${VP.y - p.h * 0.5} ${p.x + 12} ${VP.y + 40} Z`} fill={night ? '#120E26' : '#3A1E44'} />
                {[-150, -110, -60, -20, 20, 60, 110, 150].map((a, j) => (
                  <path key={j} d={`M${top.x} ${top.y} q${Math.cos(((a - 90) * Math.PI) / 180) * 80} ${Math.sin(((a - 90) * Math.PI) / 180) * 80 - 30} ${Math.cos(((a - 90) * Math.PI) / 180) * 170} ${Math.sin(((a - 90) * Math.PI) / 180) * 170 + 40}`}
                    fill="none" stroke={night ? '#120E26' : '#3A1E44'} strokeWidth="16" strokeLinecap="round" transform={`rotate(${Math.sin(t * 2 + j) * 3} ${top.x} ${top.y})`} />
                ))}
              </g>
            );
          })}
        </g>
        {/* la tastiera-strada */}
        <g transform={L(0.9)}>{keys}</g>
        <g transform={L(1.1)}>
          <Notes t={t} x={300} y={1500} n={5} seed={7} color="#F2C14E" outline={K} rise={700} spread={260} size={1.3} />
          <Notes t={t} x={800} y={1450} n={5} seed={9} color={night ? '#F6F1E9' : '#6B4FA0'} outline={K} rise={650} spread={240} size={1.1} />
        </g>
        <g transform={L(1.6)}>
          <NearMotes id={`${id}-near`} t={t} color={night ? '#C9B8F0' : '#FFF3C8'} opacity={0.14} />
        </g>
      </g>
      <Finish id={id} tint={ink} tintOpacity={night ? 0.13 : 0.1} />
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
      <Scena t={t} dur={dur} night={false} id="lc" />
      <div style={{ position: 'absolute', left: 80, top: 290, width: 920, fontFamily: SANS, color: P.scuro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.principale, opacity: tag }}>IL FILM IN 2 MINUTI</p>
        <h1 style={{ margin: '14px 0 0', fontFamily: DISPLAY, fontWeight: 800, fontSize: 200, lineHeight: 0.9, letterSpacing: '-0.02em', color: P.chiaro,
          textShadow: `0 7px 0 ${P.scuro}`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          La La Land
        </h1>
        <p style={{ margin: '24px 0 0', fontSize: 40, fontWeight: 800, opacity: dir }}>un film di {film.regista} · {film.anno}</p>
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
      <Scena t={t} dur={dur} night id="lf" />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Il prossimo film arriva presto.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 720, margin: 0, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 800, fontSize: 190, lineHeight: 1,
        color: P.accento, textShadow: `0 7px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        The End
      </h1>
    </div>
  );
};
