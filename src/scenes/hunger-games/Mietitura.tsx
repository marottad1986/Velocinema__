import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { ANTON, SANS } from '../../lib/fonts';
import { Fog, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Arrow, Bow, EMBER, HGDefs, K, Shack } from './Comuni';

// La sorella estratta: la piazza del Distretto 12 in una mattina grigia, il giorno della Mietitura. Sul palco la grande
// boccia di vetro piena di biglietti piegati, il microfono, gli stendardi dorati di Capitol City e il tabellone.
// Eventi: 1ª frase un biglietto sale dalla boccia, si apre e sul tabellone compare «PRIMROSE EVERDEEN»; 2ª frase in
// primo piano l'arco e la faretra appoggiati alla transenna si illuminano (Katniss, la cacciatrice); 3ª frase il nome
// sul tabellone viene barrato e compare in arancione «KATNISS EVERDEEN · VOLONTARIA».
// Piani: cielo grigio e tetti (0,25) · stendardi e tabellone (0,45) · palco con boccia e microfono (0,65)
//        · transenne con l'arco e la faretra (1,2) · cenere e polvere vicine (1,6)

const r = rng(1212);
const SLIPS = Array.from({ length: 34 }, () => ({ x: (r() - 0.5) * 220, y: r() * 120, a: (r() - 0.5) * 70, s: 0.8 + r() * 0.4 }));
const ASH = Array.from({ length: 30 }, () => ({ x: r() * 1300 - 110, s: 2 + r() * 3, sp: 0.03 + r() * 0.04, ph: r() }));

/** Biglietto piegato (rettangolo con la piega). */
const Slip: React.FC<{ x: number; y: number; a: number; s: number }> = ({ x, y, a, s }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
    <rect x="-22" y="-12" width="44" height="24" fill="#F2EADA" stroke="#6A6458" strokeWidth="2" />
    <path d="M-22 -12 L0 2 L22 -12" fill="none" stroke="#A89E8A" strokeWidth="2" />
  </g>
);

export const Mietitura: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const t0 = griglia(cues[0] + 1.0);
  const rise = eo(seg(t, t0, t0 + 0.8)); // il biglietto sale dalla boccia
  const open = eob(seg(t, t0 + 0.8, t0 + 1.2), 1.4); // si apre
  const name1 = eo(seg(t, t0 + 1.0, t0 + 1.4));
  const gone = eo(seg(t, t0 + 1.0, t0 + 1.5)); // il biglietto sale al tabellone e diventa il nome
  const t1 = griglia(cues[1] + 0.4);
  const bow = eo(seg(t, t1, t1 + 0.6));
  const t2 = griglia(cues[2] + 0.2);
  const strike = eo(seg(t, t2, t2 + 0.35));
  const name2 = eob(seg(t, t2 + 0.3, t2 + 0.8), 1.6);
  const flagWave = (k: number) => Math.sin(t * 1.8 + k) * 10;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="mi" />
        <HGDefs id="mi" />
        <Lin id="mi-sky" stops={[[0, '#3A424C'], [0.35, '#6A727A'], [0.6, '#9AA0A2']]} />
        <Lin id="mi-ground" stops={[[0, '#5A5A58'], [0.5, '#3A3A3A'], [1, '#141414']]} />
        <Lin id="mi-banner" stops={[[0, '#C8A040'], [0.5, '#E8C060'], [1, '#8A6420']]} x2={1} y2={0} />
        <Lin id="mi-stage" stops={[[0, '#6A5A48'], [1, '#2A2018']]} />
        <Lin id="mi-board" stops={[[0, '#1A1E24'], [1, '#0C0E12']]} />
        <radialGradient id="mi-glass" cx=".35" cy=".35" r=".75">
          <stop offset="0" stopColor="#F4FAFF" stopOpacity=".55" />
          <stop offset=".5" stopColor="#B8D0DC" stopOpacity=".22" />
          <stop offset="1" stopColor="#6A8A9A" stopOpacity=".45" />
        </radialGradient>
        <Lin id="mi-post" x2={1} y2={0} stops={[[0, '#7A5A3A'], [0.5, '#5A4028'], [1, '#2A1C12']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo grigio del mattino, tetti del distretto (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#mi-sky)" />
          <Fog id="mi-cl" t={t} y={700} rx={900} ry={120} color="#C8CCCC" opacity={0.3} speed={0.1} />
                    {[[-60, 1060, 230], [170, 1060, 200], [880, 1060, 220], [1110, 1060, 210]].map(([x, y, w], i) => (
            <Shack key={i} x={x} y={y} w={w} h={120} wall="#6A6A66" roof="#7A8086" outline={false} seed={i + 3} />
          ))}
        </g>

        {/* PIANO 1 — stendardi dorati e tabellone sopra il palco (0,45) */}
        <g transform={L(0.45)}>
          {[150, 930].map((bx, i) => (
            <g key={i}>
              <path d={`M${bx - 70} 660 H${bx + 70} V${1050} l${-70 + flagWave(i) * 0.3} -40 l${-70 + flagWave(i) * 0.3} 40 Z`} fill="url(#mi-banner)" stroke={K} strokeWidth="7" />
              {Array.from({ length: 10 }, (_, k) => { const a = (k / 10) * 6.283; return <path key={k} d={`M${bx + Math.cos(a - 0.18) * 30} ${800 + Math.sin(a - 0.18) * 30} L${bx + Math.cos(a) * 56} ${800 + Math.sin(a) * 56} L${bx + Math.cos(a + 0.18) * 30} ${800 + Math.sin(a + 0.18) * 30} Z`} fill="#6A4612" />; })}
              <circle cx={bx} cy="800" r="30" fill="#6A4612" />
              <circle cx={bx} cy="800" r="18" fill="#E8C060" />
              <path d={`M${bx - 60} 680 V1030`} stroke="#FFF2C0" strokeWidth="4" opacity=".5" />
            </g>
          ))}
          {/* tabellone */}
          <rect x="240" y="645" width="600" height="250" rx="8" fill="url(#mi-board)" stroke={K} strokeWidth="9" />
          <rect x="252" y="657" width="576" height="226" fill="none" stroke="#5A6068" strokeWidth="3" />
          <text x="540" y="694" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="26" letterSpacing="6" fill="#C8CCD0">DISTRETTO 12 · RAGAZZA</text>
          <g opacity={name1}>
            <text x="540" y={784 - 34 * name2} textAnchor="middle" fontFamily={ANTON} fontSize={lerp(64, 36, name2)} fill="#F2E8D8" letterSpacing="2" opacity={1 - 0.45 * name2}>PRIMROSE EVERDEEN</text>
            <path d={`M${330 + 80 * name2} ${762 - 24 * name2} H${330 + 80 * name2 + 420 * strike * (1 - 0.38 * name2)}`} stroke={EMBER} strokeWidth="7" strokeLinecap="round" />
          </g>
          <g opacity={name2} transform={`translate(540 820) scale(${0.6 + 0.4 * name2}) translate(-540 -820)`}>
            <text x="540" y="830" textAnchor="middle" fontFamily={ANTON} fontSize="62" fill={EMBER} letterSpacing="2">KATNISS EVERDEEN</text>
            <text x="540" y="872" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="26" letterSpacing="8" fill="#F2E8D8">VOLONTARIA</text>
          </g>
          <Glow id="mi-bg" x={540} y={800} r={300} t={t} color="#FFB060" amp={0.05} rate={3} opacity={0.35 * name2} />
          {/* tralicci del tabellone */}
          <path d="M300 890 V1100 M780 890 V1100" stroke="#2A2E34" strokeWidth="16" />
        </g>

        {/* PIANO 2 — il palco con la boccia dei biglietti e il microfono (0,65) */}
        <g transform={L(0.65)}>
          <path d="M-200 1090 Q540 1070 1280 1090 V2200 H-200 Z" fill="url(#mi-ground)" />
          <g transform="translate(0 120)">
          {/* palco */}
          <path d="M60 1140 H1020 L1060 1280 H20 Z" fill="url(#mi-stage)" stroke={K} strokeWidth="9" />
          <path d="M60 1146 H1020" stroke="#B89A7A" strokeWidth="5" />
          {Array.from({ length: 9 }, (_, k) => <path key={k} d={`M${120 + k * 105} 1150 L${100 + k * 110} 1278`} stroke="#1A120C" strokeWidth="4" opacity=".5" />)}
          {/* drappo dorato sul fronte del palco */}
          <path d="M40 1200 Q300 1240 540 1200 Q780 1240 1040 1200" fill="none" stroke="#C8A040" strokeWidth="14" />
          <path d="M40 1200 Q300 1240 540 1200 Q780 1240 1040 1200" fill="none" stroke={K} strokeWidth="3" opacity=".6" />
          {/* boccia di vetro sul piedistallo */}
          <g transform="translate(400 1140)">
            <path d="M-40 0 L-26 -90 H26 L40 0 Z" fill="#8A7A62" stroke={K} strokeWidth="7" />
            <ellipse cx="0" cy="-90" rx="60" ry="14" fill="#A89A7A" stroke={K} strokeWidth="6" />
            <g transform="translate(0 -230)">
              <ellipse cx="0" cy="40" rx="150" ry="130" fill="#2A2E30" opacity=".25" />
              {SLIPS.map((sl, i) => <Slip key={i} x={sl.x} y={sl.y + 10} a={sl.a} s={sl.s} />)}
              <ellipse cx="0" cy="40" rx="150" ry="130" fill="url(#mi-glass)" stroke={K} strokeWidth="8" />
              <ellipse cx="0" cy="-80" rx="96" ry="22" fill="#DCE8EE" fillOpacity=".25" stroke={K} strokeWidth="6" />
              <path d="M-110 -10 Q-118 50 -80 110" stroke="#FFFFFF" strokeWidth="9" fill="none" opacity=".55" strokeLinecap="round" />
              <path d="M90 -30 Q104 0 100 30" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".4" strokeLinecap="round" />
            </g>
          </g>
          {/* il biglietto estratto: sale, si apre */}
          {rise > 0 && gone < 1 && (
            <g opacity={1 - gone} transform={`translate(${400 + 120 * rise + 20 * gone} ${1000 - 120 * rise - 110 * gone}) rotate(${lerp(20, -4, rise)}) scale(${1 - 0.4 * gone})`}>
              <Glow id="mi-slipg" x={0} y={0} r={110} t={t} color="#FFF4D8" amp={0.06} rate={4} opacity={0.6 * rise * (1 - 0.6 * strike)} />
              <rect x={-30 - 40 * open} y={-16 - 14 * open} width={60 + 80 * open} height={32 + 28 * open} fill="#F8F2E4" stroke={K} strokeWidth="4" />
              {open > 0.5 && <path d="M-50 -6 H50 M-50 8 H30" stroke="#3A3428" strokeWidth="5" opacity={seg(open, 0.5, 1)} strokeLinecap="round" />}
            </g>
          )}
          {/* microfono */}
          <g transform="translate(720 1140)">
            <path d="M-50 0 L0 -14 L50 0" stroke={K} strokeWidth="9" fill="none" />
            <path d="M0 -14 V-250" stroke="#3A3E44" strokeWidth="10" />
            <path d="M0 -250 l30 -30" stroke="#3A3E44" strokeWidth="8" />
            <rect x="20" y="-320" width="34" height="56" rx="16" fill="#5A6068" stroke={K} strokeWidth="6" transform="rotate(45 37 -292)" />
            <path d="M-4 -240 V-30" stroke="#8A9098" strokeWidth="3" opacity=".6" />
          </g>
          </g>
        </g>

        {/* PIANO 3 — transenne di legno con le corde, arco e faretra appoggiati (1,2) */}
        <g transform={L(1.2)}>
          {[-40, 330, 750, 1120].map((px, i) => (
            <g key={i}>
              <rect x={px - 22} y={1470} width="44" height="560" fill="url(#mi-post)" stroke={K} strokeWidth="8" />
              <ellipse cx={px} cy={1470} rx="22" ry="8" fill="#9A7A5A" stroke={K} strokeWidth="5" />
            </g>
          ))}
          {[1530, 1640].map((ry, k) => (
            <path key={k} d={`M-200 ${ry} Q145 ${ry + 50} 330 ${ry} Q540 ${ry + 50} 750 ${ry} Q935 ${ry + 50} 1280 ${ry}`} stroke="#C8B48A" strokeWidth="9" fill="none" />
          ))}
          {[1530, 1640].map((ry, k) => (
            <path key={k} d={`M-200 ${ry} Q145 ${ry + 50} 330 ${ry} Q540 ${ry + 50} 750 ${ry} Q935 ${ry + 50} 1280 ${ry}`} stroke={K} strokeWidth="2.5" strokeDasharray="10 8" fill="none" opacity=".5" />
          ))}
          {/* arco e faretra di Katniss appoggiati al palo di destra */}
          <Glow id="mi-bowg" x={710} y={1700} r={260} t={t} color="#FFB060" amp={0.08} rate={4} opacity={0.15 + 0.55 * bow} />
          <g transform="translate(750 1830) rotate(12)">
            <rect x="-40" y="-260" width="80" height="260" rx="14" fill="#5A3A22" stroke={K} strokeWidth="8" />
            <path d="M-40 -200 H40 M-40 -60 H40" stroke="#2A1A10" strokeWidth="6" />
            {[-22, 0, 22].map((ax, k) => <Arrow key={k} x={ax} y={-250} rot={-90 + ax * 0.3} len={20} s={1.1} glow={bow} />)}
          </g>
          <Bow id="mi" x={670} y={1680} s={0.9} rot={-10} />
        </g>

        {/* PIANO 4 — cenere che cade e polvere vicina (1,6) */}
        <g transform={L(1.6)}>
          {ASH.map((a, i) => {
            const p = mod(t * a.sp + a.ph, 1);
            return <circle key={i} cx={a.x + Math.sin(t * 0.8 + i) * 30} cy={660 + p * 1300} r={a.s} fill="#E8E8E4" opacity={0.55 * Math.sin(p * Math.PI)} />;
          })}
          <NearMotes id="mi-near" t={t} color="#DADAD4" n={6} r0={60} r1={150} opacity={0.1} />
        </g>
      </g>
      <Finish id="mi" tint="#2A3038" tintOpacity={0.12} />
    </svg>
  );
};
