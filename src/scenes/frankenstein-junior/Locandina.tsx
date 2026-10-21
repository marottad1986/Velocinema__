import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { CREEPSTER, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, Lightning, NearMotes, Rain, Smoke, Stars, SunRays, flashAt } from '../../lib/elements';
import type { PosterProps } from '../../types';

// Copertina e finale di Frankenstein Junior. Locandina originale: niente volti, niente Creatura né protagonista.
// Copertina: notte di temporale quasi in bianco e nero; castello sulla rupe con un fulmine verde-acqua che colpisce
// il parafulmine; in primo piano un tavolo da laboratorio con leve e bobine, cilindro e bastone da tip tap.
// Finale: lo stesso castello all'alba, parafulmine che fuma, cilindro e bastone appoggiati sui gradini.
// Piani: cielo (0,2) · monti (0,35) · castello (0,5) · collina (0,7) · tavolo o gradini (1,15) · particelle (1,6)

const K = '#0B0C0E';
const ACC = '#8EF0C8';
const COILS = [180, 300];

const Scena: React.FC<{ t: number; dur: number; end?: boolean }> = ({ t, dur, end }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const flash = end ? 0 : flashAt(t, [1.1, 2.6], [1, 0.8]);
  const bolt = end ? 0 : Math.max(seg(t, 1.1, 1.15) * (1 - seg(t, 1.3, 1.7)), 0.8 * seg(t, 2.6, 2.65) * (1 - seg(t, 2.8, 3.2)));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={end ? 'fe' : 'fc'} />
        <Lin id="fp-sky" stops={end
          ? [[0, '#8C96A2'], [0.35, '#C9C2B4'], [0.55, '#E8D8BC'], [0.62, '#F2E4C8']]
          : [[0, '#040508'], [0.35, '#141922'], [0.55, '#2A323D'], [0.62, '#3A4450']]} />
        <Lin id="fp-mtn" stops={end ? [[0, '#7E8692'], [1, '#5E6670']] : [[0, '#1E242C'], [1, '#12161B']]} />
        <Lin id="fp-rock" x2={1} y2={0} stops={end ? [[0, '#4E5660'], [0.6, '#6E7680'], [1, '#8C949C']] : [[0, '#1A1E24'], [0.6, '#2C333C'], [1, '#46505B']]} />
        <Lin id="fp-wall" x2={1} y2={0} stops={end ? [[0, '#5A626C'], [0.6, '#7E8690'], [1, '#565E68']] : [[0, '#2A3038'], [0.6, '#3E4650'], [1, '#262B32']]} />
        <Lin id="fp-hill" stops={end ? [[0, '#4A525A'], [1, '#2A3036']] : [[0, '#161A1E'], [1, '#08090B']]} />
        <Lin id="fp-table" stops={[[0, '#5A5F64'], [0.3, '#3A3E43'], [1, '#16181B']]} />
        <Lin id="fp-coil" x2={1} y2={0} stops={[[0, '#5A4128'], [0.6, '#9A7448'], [1, '#6B4E31']]} />
        <Lin id="fp-ball" x2={1} y2={0} stops={[[0, '#6E767E'], [0.5, '#D8DEE3'], [1, '#7C858D']]} />
        <Lin id="fp-step" stops={[[0, '#9A9C9E'], [1, '#5A5D61']]} />
      </defs>

      <g transform={cam.transform}>
        {/* cielo (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#fp-sky)" />
          {end ? (
            <SunRays id="fp-sun" x={820} y={1000} t={t} color="#FFF4D6" n={9} length={1100} width={80} opacity={0.4} />
          ) : (
            <>
              <Stars t={t} seed={7} n={20} y={60} h={500} color="#E8ECEF" />
              <rect x="-200" y="-200" width="1480" height="2320" fill="#CFF5E6" opacity={flash * 0.25} />
              <Fog id="fp-cl1" t={t} y={700} x={300} rx={600} ry={60} color="#1C2229" opacity={0.95} speed={0.3} drift={80} />
              <Fog id="fp-cl2" t={t} y={820} x={860} rx={500} ry={50} color="#232A33" opacity={0.9} speed={0.25} ph={2} drift={60} />
            </>
          )}
        </g>
        {/* monti (0,35) */}
        <g transform={L(0.35, 0, 120)}>
          <path d="M-200 1060 L-20 940 L160 1010 L320 900 L500 990 L660 920 L840 1000 L1020 930 L1280 1040 V1400 H-200 Z" fill="url(#fp-mtn)" />
        </g>
        {/* castello sulla rupe, parafulmine e fulmine (0,5) */}
        <g transform={L(0.5, 0, 150)}>
          <path d="M200 1180 Q280 1020 360 980 L400 900 H720 L760 980 Q860 1040 920 1180 Z" fill="url(#fp-rock)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          <path d="M720 900 L760 980 Q860 1040 920 1180" fill="none" stroke={end ? '#D8DEE3' : '#7E8894'} strokeWidth="4" opacity=".7" />
          <g stroke={K} strokeWidth="7" strokeLinejoin="round">
            <path d="M380 910 V770 H760 V910 Z" fill="url(#fp-wall)" />
            <path d="M380 770 h30 v-24 h30 v24 h30 v-24 h30 v24 h30 v-24 h30 v24 h30 v-24 h30 v24 h30 v-24 h30 v24 h30 v-24 h30 v24 h20" fill="none" />
            <path d="M320 910 V680 H410 V910 Z" fill="url(#fp-wall)" />
            <path d="M308 682 L365 580 L422 682 Z" fill={end ? '#3E464E' : '#1A1E24'} />
            <path d="M670 910 V620 H780 V910 Z" fill="url(#fp-wall)" />
            <path d="M658 622 h134 v-24 h-134 Z" fill={end ? '#4E5660' : '#2A3038'} />
          </g>
          <path d="M725 598 V510" stroke={K} strokeWidth="9" />
          <circle cx="725" cy="506" r="9" fill="#9AA2A9" stroke={K} strokeWidth="4" />
          {[[460, 830], [540, 830], [620, 830], [365, 750], [725, 700]].map(([x, y], i) => (
            <g key={i}>
              {!end && <Glow id={`fp-w${i}`} x={x} y={y} r={36} t={t} color={i === 4 ? ACC : '#F0D9A8'} amp={0.15} rate={2 + i * 0.4} opacity={0.6} />}
              <rect x={x - 10} y={y - 15} width="20" height="30" rx="10" fill={end ? '#5A626C' : i === 4 ? '#E6FFF6' : '#F4E2B4'} opacity=".9" />
            </g>
          ))}
          {bolt > 0 && (
            <g>
              <Glow id="fp-zap" x={725} y={506} r={260} t={t} color={ACC} amp={0.3} rate={18} opacity={0.9 * bolt} />
              <Lightning x={760} y={-200} h={706} flash={bolt} seed={21} color={ACC} width={20} />
              <Lightning x={760} y={-200} h={706} flash={bolt} seed={21} color="#F2FFF9" width={8} />
            </g>
          )}
          {end && <Smoke id="fp-smoke" t={t} x={725} y={500} n={6} rise={240} wind={-120} r0={10} r1={50} speed={0.4} color="#E8E4DC" opacity={0.7} />}
        </g>
        {/* collina (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1200 Q240 1140 540 1170 Q860 1190 1280 1140 V2200 H-200 Z" fill="url(#fp-hill)" stroke={K} strokeWidth="6" />
          {!end && <Fog id="fp-fog" t={t} y={1220} x={540} rx={900} ry={70} color="#3A424C" opacity={0.45} speed={0.3} drift={90} />}
        </g>
        {/* primo piano: tavolo da laboratorio (copertina) o gradini (finale), cilindro e bastone (1,15) */}
        <g transform={L(1.15)}>
          {end ? (
            <g>
              {[0, 1, 2].map((i) => <rect key={i} x={-200 + i * 40} y={1600 + i * 70} width={1480 - i * 80} height="70" fill="url(#fp-step)" stroke={K} strokeWidth="8" />)}
              <g transform="translate(720 1600) rotate(-8)">
                <ellipse cx="0" cy="0" rx="90" ry="20" fill="#1A1A1C" stroke={K} strokeWidth="8" />
                <path d="M-56 0 V-120 Q0 -132 56 -120 V0 Z" fill="#202024" stroke={K} strokeWidth="8" />
                <rect x="-56" y="-34" width="112" height="20" fill="#3A3A40" />
              </g>
              <path d="M840 1600 L960 1270" stroke={K} strokeWidth="16" strokeLinecap="round" />
              <path d="M960 1270 q10 -30 40 -20" fill="none" stroke="#E8E2D2" strokeWidth="14" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <path d="M-200 1480 H1280 L1280 1560 H-200 Z" fill="url(#fp-table)" stroke={K} strokeWidth="10" />
              <path d="M-200 1488 H1280" stroke="#B7BEC6" strokeWidth="5" opacity=".7" />
              <path d="M-200 1560 H1280 V2200 H-200 Z" fill="#0C0D0F" />
              {COILS.map((x, i) => (
                <g key={x}>
                  <rect x={x - 34} y="1250" width="68" height="230" fill="url(#fp-coil)" stroke={K} strokeWidth="8" />
                  {Array.from({ length: 9 }, (_, k) => <path key={k} d={`M${x - 34} ${1270 + k * 22} q34 8 68 0`} fill="none" stroke="#3A2A1C" strokeWidth="4" />)}
                  <ellipse cx={x} cy="1236" rx="54" ry="28" fill="url(#fp-ball)" stroke={K} strokeWidth="8" />
                  <Glow id={`fp-cg${i}`} x={x} y={1230} r={110} t={t + i} color={ACC} amp={0.25} rate={11} opacity={0.35 + 0.4 * bolt} />
                </g>
              ))}
              <path d={`M234 1236 l10 -20 l12 18 l10 -22 l12 20`} fill="none" stroke="#F2FFF9" strokeWidth="5" opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 17))} />
              {/* leva */}
              <g transform="translate(470 1480)">
                <rect x="-50" y="-40" width="100" height="40" rx="6" fill="#2A2E33" stroke={K} strokeWidth="7" />
                <path d="M0 -30 L60 -170" stroke="#B7BEC6" strokeWidth="14" strokeLinecap="round" />
                <circle cx="60" cy="-176" r="18" fill="#1A1A1A" stroke={K} strokeWidth="6" />
              </g>
              {/* cilindro e bastone */}
              <g transform="translate(790 1480) rotate(-4)">
                <ellipse cx="0" cy="0" rx="100" ry="22" fill="#1A1A1C" stroke={K} strokeWidth="8" />
                <path d="M-62 0 V-140 Q0 -152 62 -140 V0 Z" fill="#202024" stroke={K} strokeWidth="8" />
                <rect x="-62" y="-38" width="124" height="22" fill="#3A3A40" />
                <path d="M-48 -130 V-14" stroke="#8C8C96" strokeWidth="6" opacity=".6" />
              </g>
              <path d="M640 1484 L1000 1220" stroke={K} strokeWidth="18" strokeLinecap="round" />
              <path d="M640 1484 L1000 1220" stroke="#2A2A2E" strokeWidth="10" strokeLinecap="round" />
              <path d="M1000 1220 q16 -30 46 -18" fill="none" stroke="#E8E2D2" strokeWidth="16" strokeLinecap="round" />
            </g>
          )}
        </g>
        <g transform={L(1.6)}>
          {!end && <Rain t={t} level="near" seed={4} color="#B9C3CC" opacity={0.3} />}
          <NearMotes id={end ? 'fe-near' : 'fc-near'} t={t} color={end ? '#FFF4D6' : '#DDE2E6'} n={6} vx={-25} vy={-8} opacity={0.08} />
        </g>
      </g>
      <Finish id={end ? 'fe' : 'fc'} tint="#5E6B75" tintOpacity={0.12} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const tag = eo(seg(t, 0.05, 0.45));
  const l1 = eob(seg(t, 0.15, 0.7), 1.4);
  const dir = eo(seg(t, 0.6, 1.0));
  const line = eo(seg(t, 1.3, 1.8));
  const jolt = seg(t, 1.1, 1.14) * (1 - seg(t, 1.2, 1.4));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scena t={t} dur={dur} />
      <div style={{ position: 'absolute', left: 80, top: 290, width: 920, fontFamily: SANS }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI</p>
        <h1 style={{ margin: '18px 0 0', fontFamily: CREEPSTER, fontWeight: 400, fontSize: 168, lineHeight: 0.92, letterSpacing: '0.01em', color: P.chiaro,
          textShadow: `0 7px 0 ${P.scuro}, 0 0 ${40 * jolt}px ${P.accento}`, opacity: seg(t, 0.15, 0.4), transform: `translate(${Math.sin(t * 90) * 6 * jolt}px, ${(1 - l1) * 50}px)` }}>
          Frankenstein Junior
        </h1>
        <p style={{ margin: '24px 0 0', fontSize: 40, fontWeight: 800, opacity: dir, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
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
      <Scena t={t} dur={dur} end />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Il prossimo film arriva presto.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 1150, margin: 0, textAlign: 'center', fontFamily: CREEPSTER, fontWeight: 400, fontSize: 190, lineHeight: 1,
        color: P.chiaro, textShadow: `0 7px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        The End
      </h1>
    </div>
  );
};
