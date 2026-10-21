import React from 'react';
import { camera, eio, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Embers, Glow, Lightning, NearMotes, Rain, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';

// È vivo!: laboratorio nella torre durante il temporale. Tavolo operatorio su colonna telescopica che sale
// verso il lucernario aperto, bobine con archi elettrici, quadro con leve e quadranti.
// Nessun corpo disegnato: si vedono solo il tavolo vuoto e le cinghie di cuoio che si tendono e saltano.
// Eventi: sale tra i fulmini (cue 1) · torna giù (cue 2) · corrente che muore (cue 3) · cinghie tese (cue 4)
//         · scoppio delle cinghie e corrente piena con lampo (cue 5).
// Piani: parete e lucernario (0,2) · scaffali e tubi (0,45) · bobine, tavolo, quadro (0,7)
//        · interruttore a coltello e cavi in primo piano (1,2) · scintille e particelle (1,5–1,8)

const K = '#0B0D10';
const ACC = '#8EF0C8';
const r = rng(1931);
const JARS = Array.from({ length: 7 }, (_, i) => ({ x: 40 + i * 74, h: 60 + r() * 50, w: 44 + r() * 18, tint: r() > 0.5 ? '#A9B8AE' : '#B7BEC6' }));
const STONES = Array.from({ length: 30 }, (_, i) => ({ x: -160 + (i % 6) * 250 + (Math.floor(i / 6) % 2) * 125, y: 40 + Math.floor(i / 6) * 230, w: 230, h: 220 }));

/** Arco elettrico a zig-zag tra due punti, ridisegnato 12 volte al secondo (seme fisso per scatto). */
const arcPath = (x0: number, y0: number, x1: number, y1: number, t: number, seed: number, jag = 40) => {
  const rr = rng(seed * 97 + Math.floor(t * 12));
  let d = `M${x0} ${y0}`;
  for (let i = 1; i < 8; i++) {
    const p = i / 8;
    d += ` L${(lerp(x0, x1, p) + (rr() - 0.5) * jag).toFixed(0)} ${(lerp(y0, y1, p) + (rr() - 0.5) * jag).toFixed(0)}`;
  }
  return `${d} L${x1} ${y1}`;
};

/** Bobina di Tesla: cilindro avvolto con sfera in cima. */
const Coil: React.FC<{ x: number; y: number; h: number; id: string; power: number; t: number }> = ({ x, y, h, id, power, t }) => (
  <g>
    <Glow id={`${id}-g`} x={x} y={y - h - 40} r={150} t={t} color={ACC} amp={0.2} rate={9} opacity={0.15 + 0.6 * power} />
    <rect x={x - 70} y={y - 40} width="140" height="40" rx="6" fill="#2A2E33" stroke={K} strokeWidth="9" />
    <rect x={x - 40} y={y - h} width="80" height={h - 40} fill={`url(#cr-coil)`} stroke={K} strokeWidth="9" />
    {Array.from({ length: Math.floor((h - 60) / 22) }, (_, i) => <path key={i} d={`M${x - 40} ${y - 60 - i * 22} q40 10 80 0`} fill="none" stroke="#3A2A1C" strokeWidth="5" />)}
    <path d={`M${x + 26} ${y - h + 10} V${y - 50}`} stroke="#E8C9A0" strokeWidth="5" opacity=".6" />
    <ellipse cx={x} cy={y - h - 30} rx="62" ry="34" fill="url(#cr-ball)" stroke={K} strokeWidth="9" />
    <path d={`M${x - 30} ${y - h - 46} q24 -10 50 -4`} fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity=".7" />
  </g>
);

export const Creazione: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // corrente: piena, si spegne quando Frederick si arrende, torna piena con il lampo finale
  const power = Math.max(1 - seg(t, cues[3] + 0.2, cues[3] + 1.0), seg(t, cues[5], cues[5] + 0.15));
  const flicker = power * (0.75 + 0.25 * Math.sin(t * 37) * Math.sin(t * 13));
  // tavolo: sale verso il lucernario, poi torna giù
  const up = eio(seg(t, cues[1] + 0.2, cues[1] + 2.2)) * (1 - eio(seg(t, cues[2], cues[2] + 1.3)));
  const tableY = lerp(1060, 600, up);
  // cinghie: si tendono (cue 4) e saltano poco prima della frase finale
  const tense = seg(t, cues[4], cues[4] + 1.4);
  const snap = seg(t, cues[5] - 0.25, cues[5] + 0.6);
  const rattle = tense * (1 - seg(t, cues[5] - 0.25, cues[5])) * Math.sin(t * 55) * 6;
  const flash = flashAt(t, [cues[1] + 0.9, cues[5]], [0.8, 1]);
  const needle = lerp(-62, 58, power) + Math.sin(t * 23) * 6 * power;
  const tx0 = 330, tx1 = 750;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cr" />
        <Lin id="cr-wall" stops={[[0, '#0E1013'], [0.35, '#1B1F24'], [0.65, '#2A2F35'], [1, '#1A1D21']]} />
        <Lin id="cr-storm" stops={[[0, '#050608'], [0.55, '#1A2028'], [1, '#2E3742']]} />
        <Lin id="cr-floor" stops={[[0, '#2A2E33'], [0.4, '#1C1F23'], [1, '#0C0E10']]} />
        <Lin id="cr-coil" x2={1} y2={0} stops={[[0, '#5A4128'], [0.6, '#9A7448'], [1, '#6B4E31']]} />
        <Lin id="cr-ball" x2={1} y2={0} stops={[[0, '#6E767E'], [0.5, '#D8DEE3'], [1, '#7C858D']]} />
        <Lin id="cr-steel" x2={1} y2={0} stops={[[0, '#4A5158'], [0.5, '#A7B0B8'], [1, '#585F66']]} />
        <Lin id="cr-slab" stops={[[0, '#C8CED3'], [0.4, '#8D959C'], [1, '#4E555B']]} />
        <Lin id="cr-panel" x2={1} y2={0} stops={[[0, '#22262B'], [0.6, '#363C43'], [1, '#2A2F35']]} />
        <Lin id="cr-leather" x2={1} y2={0} stops={[[0, '#4A3424'], [0.5, '#7A5638'], [1, '#4A3424']]} />
        <Lin id="cr-front" stops={[[0, '#1A1D21'], [1, '#08090B']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete di pietra e lucernario aperto sul temporale (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#cr-wall)" />
          {STONES.map((s, i) => <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx="18" fill="none" stroke="#0A0B0D" strokeWidth="5" opacity=".55" />)}
          <g>
            <circle cx="820" cy="330" r="190" fill="url(#cr-storm)" />
            <rect x="630" y="140" width="380" height="380" fill="#DDE6EE" opacity={flash * 0.6} clipPath="url(#cr-win)" />
            <clipPath id="cr-win"><circle cx="820" cy="330" r="186" /></clipPath>
            <g clipPath="url(#cr-win)">
              <Lightning x={760} y={140} h={380} flash={flash} seed={11} color="#F4FBFF" width={8} />
              <ellipse cx={760 + Math.sin(t * 0.4) * 40} cy="250" rx="200" ry="60" fill="#3A444F" opacity=".7" />
              <ellipse cx={900 - Math.sin(t * 0.3) * 40} cy="400" rx="180" ry="50" fill="#2A323C" opacity=".8" />
              <Rain t={t} level="far" seed={5} x={600} w={460} y={-60} h={700} color="#9AA8B4" opacity={0.6} />
            </g>
            <circle cx="820" cy="330" r="190" fill="none" stroke={K} strokeWidth="24" />
            <circle cx="820" cy="330" r="190" fill="none" stroke="#5B636B" strokeWidth="6" />
            <path d="M820 140 V520 M630 330 H1010 M686 196 L954 464 M954 196 L686 464" stroke={K} strokeWidth="10" />
            <circle cx="820" cy="330" r="40" fill="#2A2F35" stroke={K} strokeWidth="8" />
          </g>
          <Glow id="cr-winglow" x={820} y={330} r={320} t={t} color="#AFC3D3" amp={0.05} rate={1} opacity={0.18 + flash * 0.5} />
        </g>

        {/* PIANO 1 — scaffali con barattoli e tubi lungo la parete (0,45) */}
        <g transform={L(0.45)}>
          <g transform="translate(-40 640)">
            <rect x="0" y="0" width="560" height="16" fill="#3A332B" stroke={K} strokeWidth="5" />
            {JARS.map((j, i) => (
              <g key={i}>
                <rect x={j.x} y={-j.h} width={j.w} height={j.h} rx="8" fill={j.tint} opacity=".35" stroke="#596068" strokeWidth="4" />
                <rect x={j.x - 2} y={-j.h - 10} width={j.w + 4} height="12" rx="3" fill="#4A4F55" />
                <path d={`M${j.x + 8} ${-j.h + 10} v${j.h - 24}`} stroke="#FFFFFF" strokeWidth="4" opacity=".35" />
              </g>
            ))}
          </g>
          <path d="M-200 560 H260 Q300 560 300 600 V1240" fill="none" stroke="#3E454C" strokeWidth="18" />
          <path d="M-200 552 H260" fill="none" stroke="#7E8890" strokeWidth="4" opacity=".6" />
          <path d="M1280 600 H1000 Q960 600 960 640 V760" fill="none" stroke="#3E454C" strokeWidth="18" />
        </g>

        {/* PIANO 2 — pavimento, bobine, tavolo, quadro comandi (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1250 H1280 V2200 H-200 Z" fill="url(#cr-floor)" />
          <path d="M-200 1250 H1280" stroke="#4B535B" strokeWidth="5" />
          {[1320, 1420, 1560].map((y) => <path key={y} d={`M-200 ${y} H1280`} stroke="#0A0B0D" strokeWidth="4" opacity=".6" />)}
          {/* quadro comandi a sinistra */}
          <g transform="translate(-30 820)">
            <rect x="0" y="0" width="230" height="420" rx="10" fill="url(#cr-panel)" stroke={K} strokeWidth="9" />
            <path d="M228 10 V410" stroke="#6E7880" strokeWidth="4" opacity=".7" />
            {[0, 1].map((i) => (
              <g key={i} transform={`translate(${70 + i * 100} 90)`}>
                <circle r="44" fill="#D8D4C6" stroke={K} strokeWidth="7" />
                {[-60, -30, 0, 30, 60].map((a) => <path key={a} d="M0 -36 V-28" stroke={K} strokeWidth="4" transform={`rotate(${a})`} />)}
                <path d="M0 0 V-34" stroke={i ? K : '#3A6E5C'} strokeWidth="5" strokeLinecap="round" transform={`rotate(${needle * (i ? 0.8 : 1)})`} />
                <circle r="6" fill={K} />
              </g>
            ))}
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <circle cx={50 + i * 44} cy="200" r="13" fill={i === 1 ? ACC : '#F3DDA8'} opacity={0.25 + 0.75 * (i % 2 ? flicker : power * (0.5 + 0.5 * Math.sin(t * 5 + i)))} stroke={K} strokeWidth="5" />
              </g>
            ))}
            {[0, 1, 2].map((i) => <path key={i} d={`M${50 + i * 64} 330 l${power > 0.5 ? 0 : 20} -70`} stroke="#9AA2A9" strokeWidth="12" strokeLinecap="round" />)}
            <path d="M40 300 H200" stroke={K} strokeWidth="6" />
          </g>
          {/* bobine */}
          <Coil x={190} y={1250} h={430} id="cr-c1" power={power} t={t} />
          <Coil x={900} y={1250} h={470} id="cr-c2" power={power} t={t} />
          {/* colonna telescopica e tavolo */}
          <g>
            <rect x="500" y={tableY + 40} width="80" height={1250 - tableY - 40} fill="url(#cr-steel)" stroke={K} strokeWidth="9" />
            <rect x="514" y={(tableY + 1250) / 2} width="52" height={(1250 - tableY) / 2} fill="url(#cr-steel)" stroke={K} strokeWidth="6" />
            <rect x="440" y="1222" width="200" height="34" rx="6" fill="#2A2E33" stroke={K} strokeWidth="9" />
            <g transform={`translate(${rattle} ${-Math.abs(rattle) * 0.5})`}>
              <ellipse cx="540" cy={tableY + 70} rx="260" ry="18" fill="#000" opacity=".25" />
              <rect x={tx0 - 20} y={tableY} width={tx1 - tx0 + 40} height="44" rx="10" fill="url(#cr-slab)" stroke={K} strokeWidth="9" />
              <path d={`M${tx0} ${tableY + 8} H${tx1}`} stroke="#F2F5F7" strokeWidth="5" opacity=".7" />
              {/* lenzuolo piegato sul bordo (nessun corpo) */}
              <path d={`M${tx1 - 10} ${tableY + 4} q30 0 34 30 q4 40 -10 80 l-30 -6 q10 -40 2 -70 Z`} fill="#E6E2D6" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              {/* tre cinghie di cuoio: si tendono e saltano */}
              {[400, 540, 680].map((x, i) => {
                const lift = tense * 18 * (1 - snap) + Math.sin(t * 40 + i) * 3 * tense * (1 - snap);
                const fly = eo(snap);
                return (
                  <g key={i}>
                    {snap <= 0 ? (
                      <path d={`M${x - 36} ${tableY + 40} Q${x - 30} ${tableY - 22 - lift} ${x} ${tableY - 24 - lift} Q${x + 30} ${tableY - 22 - lift} ${x + 36} ${tableY + 40}`} fill="none" stroke="url(#cr-leather)" strokeWidth="18" strokeLinecap="round" />
                    ) : (
                      <>
                        <path d={`M${x - 36} ${tableY + 40} q${-8 - 14 * fly} ${lerp(-60, 30, fly)} ${-14 - 10 * fly} ${lerp(-50, 70, fly)}`} fill="none" stroke="url(#cr-leather)" strokeWidth="18" strokeLinecap="round" />
                        <path d={`M${x + 36} ${tableY + 40} q${8 + 14 * fly} ${lerp(-60, 30, fly)} ${14 + 10 * fly} ${lerp(-50, 70, fly)}`} fill="none" stroke="url(#cr-leather)" strokeWidth="18" strokeLinecap="round" />
                      </>
                    )}
                    <rect x={x - 12 + (i - 1) * 90 * eo(snap)} y={tableY - 30 - (snap > 0 ? 260 * eo(snap) - 420 * snap * snap : lift)} width="24" height="16" rx="3" fill="none" stroke="#C9CFD4" strokeWidth="5" opacity={snap > 0 ? 1 - snap : 1} transform={`rotate(${snap * 400 * (i - 1)} ${x} ${tableY - 22})`} />
                  </g>
                );
              })}
              {/* scintille ai bordi quando c'è corrente */}
              <circle cx={tx0 - 20} cy={tableY + 22} r={10} fill={ACC} opacity={flicker * 0.9} />
              <circle cx={tx1 + 20} cy={tableY + 22} r={10} fill={ACC} opacity={flicker * 0.9} />
            </g>
          </g>
          {/* archi elettrici dalle sfere al tavolo (accento) */}
          {power > 0.05 && (
            <g fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={flicker}>
              <path d={arcPath(190, 820, tx0 - 20, tableY + 22, t, 1)} stroke={ACC} strokeWidth="14" opacity=".35" />
              <path d={arcPath(190, 820, tx0 - 20, tableY + 22, t, 1)} stroke="#F2FFF9" strokeWidth="5" />
              <path d={arcPath(900, 750, tx1 + 20, tableY + 22, t, 2)} stroke={ACC} strokeWidth="14" opacity=".35" />
              <path d={arcPath(900, 750, tx1 + 20, tableY + 22, t, 2)} stroke="#F2FFF9" strokeWidth="5" />
              {t > cues[5] && <path d={arcPath(190, 820, 900, 750, t, 3, 70)} stroke="#F2FFF9" strokeWidth="6" />}
            </g>
          )}
          <Glow id="cr-tableglow" x={540} y={tableY + 20} r={300} t={t} color={ACC} amp={0.15} rate={11} opacity={0.08 + 0.3 * flicker + 0.4 * seg(t, cues[5], cues[5] + 0.3)} />
        </g>

        {/* lampo che illumina tutta la stanza */}
        <rect x="-200" y="-200" width="1480" height="2320" fill="#D8E4EC" opacity={flash * 0.22} />

        {/* PIANO 3 — interruttore a coltello e cavi in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1700 Q200 1620 560 1720 Q860 1800 1280 1700" fill="none" stroke="#141619" strokeWidth="40" strokeLinecap="round" />
          <path d="M-200 1760 Q260 1700 600 1790 Q900 1870 1280 1790" fill="none" stroke="#1E2125" strokeWidth="30" strokeLinecap="round" />
          <path d="M-200 1690 Q200 1610 560 1710" fill="none" stroke="#4E555B" strokeWidth="6" opacity=".6" />
          <g transform="translate(10 1360)">
            <rect x="0" y="0" width="320" height="560" rx="12" fill="url(#cr-front)" stroke={K} strokeWidth="10" />
            <rect x="60" y="90" width="200" height="240" rx="8" fill="#2A2E33" stroke={K} strokeWidth="8" />
            <text x="160" y="72" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="26" fill="#9AA2A9">ALTA TENSIONE</text>
            <g transform={`rotate(${lerp(40, -10, power)} 160 300)`}>
              <path d="M140 300 V140 M180 300 V140" stroke="#B7BEC6" strokeWidth="14" strokeLinecap="round" />
              <rect x="120" y="116" width="80" height="34" rx="10" fill="#1A1A1A" stroke={K} strokeWidth="6" />
            </g>
            <circle cx="160" cy="300" r="16" fill="#4E555B" stroke={K} strokeWidth="6" />
            <Glow id="cr-sw" x={160} y={150} r={90} t={t} color={ACC} amp={0.3} rate={13} opacity={0.4 * flicker} />
          </g>
          <g transform="translate(1000 1300)">
            <rect x="0" y="0" width="160" height="640" fill="url(#cr-front)" stroke={K} strokeWidth="10" />
            {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="24" y={40 + i * 110} width="40" height="70" rx="6" fill="#2A2E33" stroke={K} strokeWidth="5" />)}
          </g>
        </g>

        {/* PIANO 4 — scintille e particelle vicine alla camera (1,5–1,8) */}
        <g transform={L(1.5)} opacity={0.2 + 0.8 * power}>
          <Embers t={t} x={540} y={tableY + 30} w={480} h={500} n={22} seed={33} hot="#F2FFF9" warm={ACC} drift={60} />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 520, x0: 700, x1: 940 }} bottom={{ y: 1240, x0: 520, x1: 1040 }} n={20} color="#C9D3DB" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="cr-near" t={t} color="#CFE0E8" n={6} vx={-28} vy={-10} opacity={0.08} />
        </g>
      </g>

      <Finish id="cr" tint="#5E6B75" tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): tavolo sale cue1 + 0,2 → +2,2 · primo lampo cue1 + 0,9 · tavolo giù cue2 → +1,3
// · corrente che muore cue3 + 0,2 → +1,0 · cinghie tese cue4 → +1,4 · cinghie che saltano cue5 − 0,25 · lampo e corrente piena cue5.
