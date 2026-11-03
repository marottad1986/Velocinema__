import React from 'react';
import { camera, eo, eob, lerp, mod, rainPath, rng, seg, wavePath } from '../../lib/anim';
import { ANTON, SANS } from '../../lib/fonts';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import type { PosterProps } from '../../types';

// Copertina: notte e tempesta; cancello di ferro dell'ospedale in primo piano con il lucchetto arancione aperto;
// dietro, l'isola con una finestra accesa. Stile locandina originale.
// Piani: cielo e nubi (0,2–0,3) · isola con faro (0,5) · mare (0,7) · cancello (1,2) · pioggia vicina (1,6)

const K = '#070D10';
const r = rng(2010);
const DROPS = Array.from({ length: 6 }, () => ({ x: r() * 1080, ph: r(), rad: 16 + r() * 22 }));
const GATE_BARS = Array.from({ length: 11 }, (_, i) => -10 + i * 110).filter((x) => Math.abs(x - 540) > 60);

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const cam = camera(t, dur, 540, 1200);
  const L = cam.layer;
  const sweep = Math.cos(t * 1.1 + 0.6);
  const pulse = Math.abs(sweep);
  const lamp = { x: 815, y: 1010 }; // tra due sbarre del cancello, così il faro si vede
  // un solo lampo, a 1,6 s
  const flash = seg(t, 1.6, 1.66) * (1 - seg(t, 1.75, 2.3));
  const lockSwing = Math.sin(t * 2.4) * 7 * (1 - seg(t, 0, dur) * 0.5);

  // testi
  const tag = eo(seg(t, 0.05, 0.45));
  const l1 = eob(seg(t, 0.15, 0.7), 1.4);
  const l2 = eob(seg(t, 0.3, 0.85), 1.4);
  const dir = eo(seg(t, 0.7, 1.1));
  const tagline = eo(seg(t, 1.2, 1.7));

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="co" />
          <Lin id="co-sky" stops={[[0, '#05090C'], [0.35, '#0F222B'], [0.58, '#1E3E47'], [0.64, '#2A5059'], [0.7, '#14262E']]} />
          <Lin id="co-sea" stops={[[0, '#245A63'], [0.3, '#143640'], [1, '#050C0F']]} />
          <Lin id="co-rock" x2={1} y2={0} stops={[[0, '#1A2A2E'], [0.7, '#2E4644'], [1, '#4A6560']]} />
          <Lin id="co-iron" x2={1} y2={0} stops={[[0, '#0B1316'], [0.4, '#33464B'], [0.6, '#22323A'], [1, '#070D10']]} />
          <Lin id="co-beam" x2={1} y2={0} stops={[[0, '#FFE7A0', 0], [0.7, '#FFE7A0', 0.2], [1, '#FFE7A0', 0.65]]} />
          <Lin id="co-lock" x2={1} y2={0} stops={[[0, '#FF9A5C'], [0.5, P.accento], [1, '#B8431A']]} />
          <GlowGradient id="co-lamp" color="#FFD98A" />
          <GlowGradient id="co-warm" color="#FFC45C" core={0.85} mid={0.3} />
          <GlowGradient id="co-cloud" color="#1B3540" core={1} mid={0.7} />
          <GlowGradient id="co-drop" color="#CFE3E8" core={0.7} mid={0.25} />
          <GlowGradient id="co-lockglow" color={P.accento} core={0.6} mid={0.2} />
        </defs>

        <g transform={cam.transform}>
          {/* cielo e nubi (0,2–0,3) */}
          <g transform={L(0.2)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#co-sky)" />
            <rect x="-200" y="-200" width="1480" height="2400" fill="#CFE7F0" opacity={flash * 0.35} />
            <path d="M880 760 L850 860 L884 856 L838 980" fill="none" stroke="#F4FBFF" strokeWidth="7" strokeLinejoin="round" opacity={flash} />
          </g>
          <g transform={L(0.3, Math.sin(t * 0.4) * 30)}>
            <ellipse cx="200" cy="820" rx="460" ry="120" fill="url(#co-cloud)" />
            <ellipse cx="860" cy="700" rx="420" ry="110" fill="url(#co-cloud)" />
            <path d={rainPath(50, 3, 60, 18, 1300, 1400)} transform={`translate(${-mod(t * 50, 100)} ${mod(t * 380, 280) - 280})`} stroke="#8DB5BC" strokeWidth="3" strokeLinecap="round" opacity=".3" />
          </g>

          {/* isola con ospedale e faro (0,5) */}
          <g transform={L(0.5)}>
            <g transform={`translate(${lamp.x} ${lamp.y}) scale(${sweep} 1) translate(${-lamp.x} ${-lamp.y})`} opacity={0.3 + 0.45 * pulse}>
              <path d={`M${lamp.x} ${lamp.y - 6} L-300 880 L-300 1140 L${lamp.x} ${lamp.y + 6} Z`} fill="url(#co-beam)" />
            </g>
            <path d="M180 1172 Q260 1060 380 1070 Q470 1000 580 1030 Q690 1000 790 1050 Q890 1070 960 1172 Z" fill="url(#co-rock)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <path d="M790 1050 Q890 1070 960 1172" fill="none" stroke="#9FBDBB" strokeWidth="4" opacity=".6" />
            <path d="M380 1070 V1010 L470 980 L560 1010 V1070 Z" fill="#26383E" stroke={K} strokeWidth="5" strokeLinejoin="round" />
            <path d="M394 1030 h20 v26 h-20 z M526 1030 h20 v26 h-20 z" fill="#1A282D" />
            <rect x="462" y="1030" width="22" height="28" fill="#FFD25C" />
            <circle cx="473" cy="1044" r={46 + Math.sin(t * 3) * 4} fill="url(#co-warm)" opacity=".55" />
            <path d="M797 1100 L805 1030 H825 L833 1100 Z" fill="#DCE5E8" stroke={K} strokeWidth="5" strokeLinejoin="round" />
            <path d="M801 1060 H829" stroke="#B5562F" strokeWidth="10" />
            <circle cx={lamp.x} cy={lamp.y} r={50 + pulse * 30} fill="url(#co-lamp)" opacity={0.5 + pulse * 0.3} />
            <rect x="803" y="998" width="24" height="26" fill="#FFE7A0" stroke={K} strokeWidth="4" />
            <path d="M799 999 L815 984 L831 999 Z" fill={K} />
          </g>

          {/* mare in tempesta (0,7) */}
          <g transform={L(0.7)}>
            <rect x="-200" y="1168" width="1480" height="900" fill="url(#co-sea)" />
            <path d={wavePath(1215, 10, 240)} transform={`translate(${-mod(t * 60, 240)} 0)`} fill="none" stroke="#6FA7AF" strokeWidth="5" strokeLinecap="round" opacity=".55" />
            <path d={wavePath(1290, 14, 300)} transform={`translate(${-mod(t * 90, 300)} ${Math.sin(t * 2) * 6})`} fill="none" stroke="#8FC0C7" strokeWidth="6" strokeLinecap="round" opacity=".5" />
            {Array.from({ length: 4 }, (_, i) => (
              <rect key={i} x={473 + cam.pan * 0.2 - (20 - i * 4) / 2} y={1184 + i * 16} width={(20 - i * 4) * (0.6 + 0.4 * Math.sin(t * 5 + i))} height="4" rx="2" fill="#FFD25C" opacity={0.45 - i * 0.08} />
            ))}
          </g>

          {/* cancello di ferro in primo piano (1,2) */}
          <g transform={L(1.2)}>
            <path d="M-120 960 Q540 820 1200 960" fill="none" stroke="url(#co-iron)" strokeWidth="34" />
            <path d="M-120 946 Q540 806 1200 946" fill="none" stroke="#7E979B" strokeWidth="4" opacity=".55" />
            {GATE_BARS.map((x) => {
              const top = 960 - 140 * (1 - ((x - 540) / 660) ** 2) + 110; // punte sotto la riga del regista anche con lo zoom finale
              return (
                <g key={x}>
                  <rect x={x - 9} y={top} width="18" height={2100 - top} fill="url(#co-iron)" stroke={K} strokeWidth="6" />
                  <path d={`M${x - 20} ${top + 4} L${x} ${top - 46} L${x + 20} ${top + 4} Z`} fill="#22323A" stroke={K} strokeWidth="6" strokeLinejoin="round" />
                  <path d={`M${x - 5} ${top + 10} V2100`} stroke="#8AA3A7" strokeWidth="3" opacity={0.35 + flash * 0.4} />
                </g>
              );
            })}
            <rect x="-120" y="1540" width="1320" height="34" fill="url(#co-iron)" stroke={K} strokeWidth="7" />
            <rect x="-120" y="1800" width="1320" height="34" fill="url(#co-iron)" stroke={K} strokeWidth="7" />
            {/* volute decorative */}
            {[220, 860].map((x) => (
              <path key={x} d={`M${x - 70} 1540 q0 -70 70 -70 q70 0 70 70 M${x - 40} 1540 q0 -36 40 -36 q40 0 40 36`} fill="none" stroke="#1A2629" strokeWidth="12" />
            ))}
            {/* montanti centrali e catena */}
            <rect x="514" y="880" width="22" height="1240" fill="url(#co-iron)" stroke={K} strokeWidth="6" />
            <rect x="544" y="880" width="22" height="1240" fill="url(#co-iron)" stroke={K} strokeWidth="6" />
            <path d="M470 1112 Q540 1150 610 1112" fill="none" stroke="#3A4C50" strokeWidth="12" strokeDasharray="22 10" />
            {/* lucchetto arancione aperto, al centro */}
            <g transform={`rotate(${lockSwing} 540 1130)`}>
              <circle cx="540" cy="1230" r={150 + Math.sin(t * 2.6) * 10} fill="url(#co-lockglow)" opacity=".55" />
              {/* arco sganciato e ruotato: il lucchetto è aperto */}
              <g transform="rotate(-28 504 1186)">
                <path d="M504 1186 v-62 a40 40 0 0 1 80 0 v26" fill="none" stroke={K} strokeWidth="24" strokeLinecap="round" />
                <path d="M504 1186 v-62 a40 40 0 0 1 80 0 v26" fill="none" stroke="#B9C9CC" strokeWidth="13" strokeLinecap="round" />
                <path d="M512 1170 v-46 a32 32 0 0 1 22 -30" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity=".8" />
              </g>
              <rect x="476" y="1180" width="128" height="112" rx="20" fill="url(#co-lock)" stroke={K} strokeWidth="9" />
              <circle cx="540" cy="1226" r="13" fill={K} />
              <path d="M540 1232 V1260" stroke={K} strokeWidth="9" strokeLinecap="round" />
              <path d="M488 1192 h34" stroke="#FFD2B0" strokeWidth="5" strokeLinecap="round" />
            </g>
          </g>

          {/* pioggia vicina e gocce davanti alla camera (1,6) */}
          <g transform={L(1.6)}>
            <path d={rainPath(28, 21, 140, 40)} transform={`translate(${-mod(t * 120, 240)} ${mod(t * 1100, 600) - 300})`} stroke="#CFE3E8" strokeWidth="5" strokeLinecap="round" opacity=".45" />
            {DROPS.map((d, i) => {
              const p = mod(t * 0.3 + d.ph, 1);
              return <circle key={i} cx={d.x} cy={lerp(300, 1900, p)} r={d.rad} fill="url(#co-drop)" opacity={Math.sin(p * Math.PI) * 0.35} />;
            })}
          </g>
        </g>

        <Finish id="co" tint="#0E3A40" tintOpacity={0.13} />
      </svg>

      {/* testi della locandina */}
      <div style={{ position: 'absolute', left: 120, top: 290, width: 840, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, opacity: tag }}>IL FILM IN 2 MINUTI</p>
        <h1 style={{ margin: '18px 0 0', fontFamily: ANTON, fontWeight: 400, fontSize: 250, lineHeight: 0.86, letterSpacing: '0.01em', textShadow: `0 8px 0 ${P.scuro}` }}>
          <span style={{ display: 'block', opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 60}px)` }}>SHUTTER</span>
          <span style={{ display: 'block', opacity: seg(t, 0.3, 0.55), transform: `translateY(${(1 - l2) * 60}px)` }}>ISLAND</span>
        </h1>
        <p style={{ margin: '26px 0 0', fontSize: 40, fontWeight: 800, opacity: dir, letterSpacing: '0.04em' }}>
          un film di {film.regista} · {film.anno}
        </p>
      </div>
      <p
        style={{
          position: 'absolute', left: 120, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
          borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 40, fontWeight: 800, textAlign: 'center',
          opacity: tagline, transform: `translateY(${(1 - tagline) * 14}px)`,
        }}
      >
        {film.copertina.frase_lancio}
      </p>
    </div>
  );
};
