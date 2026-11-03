import React from 'react';
import { camera, eio, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Clouds, flashAt, Glow, Lightning, NearMotes, Rain, Reflection, Smoke, SunRays, WaveBand, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Ball, Chop, K, Raft } from './Comuni';

// Perso in mare: in mezzo all'oceano una tempesta strappa la vela della zattera (fr. 0) e il pallone con la faccia
// scivola in acqua (fr. 1). Gli spruzzi di chi nuota partono dalla zattera verso il pallone, legati da una corda (fr. 2);
// la zattera scarroccia e la corda si tende (fr. 3); la corda si allenta, gli spruzzi tornano indietro e il pallone si
// allontana (fr. 4). Il cielo si apre e all'orizzonte arriva una nave portacontainer (fr. 5). Nessuna figura: solo spruzzi.
// Piani: cielo e nuvole (0,2) · orizzonte e nave (0,35) · mare lontano (0,5) · zattera, corda, spruzzi, pallone (0,8)
//        · creste vicine e relitti (1,15) · cresta in primo piano (1,35) · pioggia e spruzzi davanti alla camera (1,7)

const r = rng(1100);
const GLINT = Array.from({ length: 26 }, () => ({ x: r() * 1300 - 110, y: 1260 + r() * 600, ph: r() * 6, s: 3 + r() * 5 }));
const DROPS = Array.from({ length: 9 }, () => ({ a: r() * Math.PI - Math.PI, v: 40 + r() * 50, ph: r() }));

/** Spruzzi di chi nuota: archi di schiuma e gocce che si ripetono (nessuna figura). */
const Splash: React.FC<{ x: number; y: number; t: number; k: number }> = ({ x, y, t, k }) => {
  if (k <= 0.01) return null;
  return (
    <g opacity={k}>
      <ellipse cx={x} cy={y + 8} rx={70} ry={14} fill="#E8F6F8" opacity=".5" />
      {[0, 1].map((i) => {
        const p = mod(t * 1.6 + i * 0.5, 1);
        return <ellipse key={i} cx={x} cy={y + 8} rx={30 + 70 * p} ry={7 + 14 * p} fill="none" stroke="#F2FBFC" strokeWidth={6 * (1 - p)} opacity={1 - p} />;
      })}
      {DROPS.map((d, i) => {
        const p = mod(t * 1.8 + d.ph, 1);
        const dx = Math.cos(d.a) * d.v * p * 1.4, dy = Math.sin(d.a) * d.v * p * 1.8 + 140 * p * p;
        return <circle key={i} cx={x + dx} cy={y + dy - 6} r={6 * (1 - p) + 2} fill="#F2FBFC" opacity={0.9 * (1 - p)} />;
      })}
      <path d={`M${x - 46} ${y} q20 -26 40 -4 q16 -22 40 2`} fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(t * 9)} />
    </g>
  );
};

export const Wilson: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  // tempesta: piena all'inizio, si placa tra la 3ª e la 5ª frase
  const storm = 1 - eio(seg(t, cues[2], cues[4] + 0.6));
  const tear = griglia(cues[0] + 1.0); // la vela si squarcia sul secondo lampo
  const torn = eo(seg(t, tear, tear + 0.35));
  const flash = flashAt(t, [griglia(cues[0] + 0.25), tear]);
  const slip = griglia(cues[1] + 0.35);
  const fall = seg(t, slip, slip + 0.9);
  const swim = eio(seg(t, cues[2], cues[3]));
  const drift = eio(seg(t, cues[3], cues[4]));
  const letGo = griglia(cues[4] + 0.2);
  const back = eio(seg(t, letGo, cues[5] + 0.4));
  const shipAt = griglia(cues[5] + 0.3);
  const ship = eo(seg(t, shipAt, shipAt + 1.6));

  // zattera (piano 0,8): beccheggia forte in tempesta e scarroccia a sinistra quando la corda si tende
  const roll = 4 + 7 * storm;
  const rx = 380 - 70 * drift, ry = 1215 + Math.sin(t * 1.7) * (8 + 10 * storm);
  const rot = Math.sin(t * 1.25) * roll;
  // punto della corda sulla zattera (angolo di poppa a destra)
  const kx = rx + 205, ky = ry - 4;

  // pallone: sulla zattera, cade in acqua, poi la corrente lo porta verso l'orizzonte
  const away = eio(seg(t, cues[2] + 0.4, dur));
  const bob = Math.sin(t * 1.9) * (6 + 6 * storm);
  const bx0 = rx + 140, by0 = ry - 74;
  const bx1 = 640, by1 = 1222;
  const fx = fall < 1 ? lerp(bx0, bx1, eo(fall)) : bx1;
  const fy = fall < 1 ? lerp(by0, by1, fall * fall) - Math.sin(fall * Math.PI) * 60 : by1;
  const bx = fx + 170 * away, by = fy - 132 * away + bob;
  const br = 52 - 24 * away;

  // spruzzi di chi nuota: dalla zattera verso il pallone, fermi quando la corda è tesa, poi di nuovo alla zattera
  const sxOut = lerp(kx + 30, 700, swim), syOut = lerp(1230, 1190, swim);
  const sx = lerp(sxOut, kx + 40, back), sy = lerp(syOut, 1236, back);
  const swimming = seg(t, cues[2] - 0.1, cues[2] + 0.3) * (1 - seg(t, cues[5] + 0.2, cues[5] + 0.8));
  const taut = Math.max(0, swim * (1 - seg(t, letGo, letGo + 0.5)));
  const ropeSag = 70 * (1 - taut) + 6;

  // brandello di vela strappato via dal vento
  const flyP = seg(t, tear, tear + 2.2);
  const flyX = 600 - 520 * eo(flyP), flyY = 760 - 120 * Math.sin(flyP * Math.PI) + 330 * flyP * flyP;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="wi" />
        <Lin id="wi-storm" stops={[[0, '#0B1520'], [0.45, '#1A2B3A'], [0.7, '#2B4153'], [0.86, '#3E5669']]} />
        <Lin id="wi-clear" stops={[[0, '#16294A'], [0.5, '#3A5878'], [0.72, '#A7AAA4'], [0.86, '#F2D9A2']]} />
        <Lin id="wi-sea" stops={[[0, '#1E5F74'], [0.5, '#164A5E'], [1, '#0B2A3A']]} />
        <Lin id="wi-mid" stops={[[0, '#3A8FA2'], [0.06, '#1D6276'], [1, '#0E3448']]} />
        <Lin id="wi-band" stops={[[0, '#3F97AA'], [0.05, '#21697D'], [0.3, '#154B5E'], [1, '#0B2A3A']]} />
        <Lin id="wi-near" stops={[[0, '#2F8296'], [0.06, '#1A5568'], [0.4, '#103A4C'], [1, '#08202E']]} />
        <Lin id="wi-front" stops={[[0, '#2A7488'], [0.07, '#123E50'], [1, '#04131C']]} />
        <Lin id="wi-plank" stops={[[0, '#9B7A50'], [1, '#6E5232']]} x2={1} y2={0} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo: tempesta che si apre su una luce calda all'orizzonte */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#wi-clear)" />
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#wi-storm)" opacity={storm} />
          <SunRays id="wi-rays" x={600} y={990} t={t} color="#FFE6B0" n={11} length={1000} from={-160} to={-20} opacity={0.32 * (1 - storm)} />
          <Glow id="wi-sun" x={600} y={995} r={420} t={t} color="#FFE2A6" amp={0.05} rate={0.8} opacity={0.75 * (1 - storm) + 0.1} />
          <Clouds id="wi-cl1" t={t} color="#0A141C" n={4} y={120} h={240} speed={0.5} opacity={0.85 * storm + 0.2} />
          <Clouds id="wi-cl2" t={t + 3} color="#26394A" seed={9} n={4} y={600} h={260} speed={0.7} opacity={0.75 * storm + 0.15} />
          <Lightning x={880} y={660} h={330} flash={flash} seed={4} width={8} />
          <rect x="-200" y="-200" width="1480" height="1400" fill="#DDEBF2" opacity={flash * 0.35} />
          <Rain t={t} level="far" opacity={0.35 * storm} angle={34} />
        </g>

        {/* PIANO 1 — orizzonte; dalla 6ª frase la nave portacontainer con il fumo */}
        <g transform={L(0.35)}>
          <rect x="-200" y="1000" width="1480" height="400" fill="url(#wi-sea)" />
          <Reflection t={t} x={600 - cam.pan * 0.3} y={1012} color="#FFE6B0" n={9} w={150} opacity={0.6 * (1 - storm)} />
          {ship > 0 && (
            <g opacity={ship} transform={`translate(${lerp(860, 700, ship)} 1003) scale(1.25)`}>
              <Smoke id="wi-smoke" t={t} x={92} y={-92} color="#C9CED2" n={7} rise={170} wind={-190} r0={10} r1={40} speed={0.32} opacity={0.75} />
              <path d="M-150 0 L-132 -34 H150 L166 0 Z" fill="#33424E" stroke={K} strokeWidth="4" />
              <path d="M-132 -20 H150" stroke="#B5543C" strokeWidth="6" />
              {[-118, -84, -50, -16, 18, 52].map((x, i) => (
                <g key={x}>
                  <rect x={x} y={-62 - (i % 2) * 12} width="32" height={28 + (i % 2) * 12} fill={['#B5543C', '#3E7DA0', '#C9A24A', '#5D8A5A'][i % 4]} stroke={K} strokeWidth="2" />
                  <rect x={x} y={-90 - (i % 2) * 12} width="32" height="28" fill={['#3E7DA0', '#C9A24A', '#B5543C'][i % 3]} stroke={K} strokeWidth="2" opacity={i % 3 === 1 ? 0 : 1} />
                </g>
              ))}
              <rect x="94" y="-88" width="40" height="54" fill="#E6ECEF" stroke={K} strokeWidth="3" />
              {[0, 1, 2].map((i) => <rect key={i} x={99 + i * 12} y="-80" width="8" height="8" fill="#FFE08A" />)}
              <rect x="104" y="-112" width="14" height="26" fill="#33424E" stroke={K} strokeWidth="3" />
              <Glow id="wi-shipl" x={113} y={-76} r={60} t={t} color="#FFE08A" amp={0.2} rate={3} opacity={0.7} />
            </g>
          )}
        </g>

        {/* PIANO 2 — mare lontano: creste che corrono, più alte in tempesta */}
        <g transform={L(0.5)}>
          <Chop t={t} y={1060} fill="url(#wi-mid)" amp={10 + 26 * storm} w={170} speed={40 + 40 * storm} bob={4 + 6 * storm} foam={0.3 + 0.6 * storm} foamColor="#D8EEF2" />
          <WaveLines t={t} ys={[1100, 1130]} color="#BFE6EE" amp={6 + 8 * storm} w={200} speed={30} width={3} opacity={0.45} />
        </g>

        {/* PIANO 3 — zattera, corda, spruzzi e pallone (accento: l'impronta rossa) */}
        <g transform={L(0.8)}>
          <Chop t={t} y={1190} fill="url(#wi-band)" amp={22 + 40 * storm} w={260} speed={45 + 40 * storm} bob={8} ph={1} foam={0.25 + 0.75 * storm} />
          {/* la zattera con la vela che si squarcia */}
          <g transform={`translate(${rx} ${ry}) rotate(${rot}) scale(1.15)`}>
            <Raft t={t} sail={1} torn={torn} ball={t < slip} flapAmp={6 + 16 * storm} />
            {torn > 0 && (
              <path d={`M60 ${-300} l50 40 l-30 30 l70 50 l-40 40 l60 30 L150 -150 L180 -330 Z`} fill="#122A38" stroke={K} strokeWidth="6" strokeLinejoin="round" opacity={0.85 * torn} />
            )}
            {torn > 0 && (
              <g transform={`translate(${150 + Math.sin(t * 7) * 10} -230)`} opacity={torn}>
                <path d={`M0 0 L${40 + Math.sin(t * 9) * 16} ${30 + Math.cos(t * 8) * 10} L${10 + Math.sin(t * 6) * 8} 80 Z`} fill="#A9C3CF" stroke={K} strokeWidth="6" />
              </g>
            )}
          </g>
          {/* bordo d'acqua davanti alla zattera: i tronchi pescano nell'onda */}
          <Chop t={t} y={1268} fill="url(#wi-band)" amp={12 + 18 * storm} w={210} speed={50 + 40 * storm} bob={6} ph={3} foam={0.2 + 0.6 * storm} />
          {/* pallone in acqua, con alone caldo perché l'occhio lo segua mentre si allontana */}
          {t >= slip && (
            <g>
              <Glow id="wi-ballg" x={bx} y={by} r={br * 3.2} t={t} color="#FFD3B8" amp={0.06} rate={1.5} opacity={0.45} />
              {fall >= 1 && <ellipse cx={bx} cy={by + br * 0.72} rx={br * 1.6} ry={br * 0.2} fill="#E8F6F8" opacity=".45" />}
              <Ball x={bx} y={by} r={br} rot={Math.sin(t * 1.3) * 16 + away * 70} face={1} dirty={0.4} />
              {fall >= 1 && <path d={`M${bx - br * 1.3} ${by + br * 0.6} q${br * 0.65} ${-br * 0.25} ${br * 1.3} 0 t${br * 1.3} 0`} fill="none" stroke="#F2FBFC" strokeWidth="5" strokeLinecap="round" opacity=".8" />}
              {fall > 0 && fall < 1 && <Splash x={bx1} y={by1 + 10} t={t} k={0.6} />}
            </g>
          )}
          {/* corda legata alla zattera: tesa verso gli spruzzi, poi allentata in acqua */}
          {swimming > 0 && (
            <path d={`M${kx} ${ky} Q${(kx + sx) / 2} ${(ky + sy) / 2 + ropeSag} ${sx} ${sy}`} fill="none" stroke="#E6D3A8" strokeWidth={taut > 0.6 ? 7 : 6} strokeLinecap="round" opacity={swimming} />
          )}
          <Splash x={sx} y={sy} t={t} k={swimming} />
          {/* brandello di vela portato via dal vento */}
          {flyP > 0 && flyP < 1 && (
            <g transform={`translate(${flyX} ${flyY}) rotate(${flyP * 540})`} opacity={1 - seg(flyP, 0.8, 1)}>
              <path d="M-40 -26 L44 -18 L30 30 L-34 22 Z" fill="#A9C3CF" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              <circle cx="-26" cy="-10" r="5" fill={K} />
            </g>
          )}
        </g>

        {/* PIANO 4 — creste vicine e un'asse del relitto che galleggia */}
        <g transform={L(1.15)}>
          <Chop t={t} y={1440} fill="url(#wi-near)" amp={40 + 70 * storm} w={380} speed={60 + 50 * storm} bob={12 + 10 * storm} ph={2} foam={0.3 + 0.7 * storm} line="#0A2633" />
          <g transform={`translate(${170 + Math.sin(t * 0.9) * 20} ${1520 + Math.sin(t * 1.6) * 16}) rotate(${-8 + Math.sin(t * 1.3) * 6})`}>
            <rect x="-120" y="-16" width="240" height="34" rx="10" fill="url(#wi-plank)" stroke={K} strokeWidth="7" />
            <path d="M-100 -2 H96 M-60 8 H40" stroke="#5E4528" strokeWidth="4" opacity=".7" />
            <circle cx="88" cy="1" r="5" fill={K} />
            <path d="M-150 22 q30 -12 60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke="#E8F6F8" strokeWidth="6" strokeLinecap="round" opacity=".8" />
          </g>
          <WaveLines t={t} ys={[1560, 1640]} color="#5FA2B6" amp={12 + 10 * storm} w={340} speed={55} width={5} opacity={0.5} />
        </g>

        {/* PIANO 5 — cresta in primo piano che tocca i bordi, con schiuma e riflessi */}
        <g transform={L(1.35)}>
          <Chop t={t} y={1720} fill="url(#wi-front)" amp={60 + 90 * storm} w={480} speed={80 + 60 * storm} bob={16 + 12 * storm} ph={4} foam={0.35 + 0.65 * storm} line="#061822" />
          <WaveLines t={t} ys={[1790, 1860]} color="#3E8296" amp={14} w={380} speed={70} width={6} opacity={0.5} />
          {GLINT.map((g, i) => (
            <path key={i} d={`M${g.x - g.s * 3} ${g.y} H${g.x + g.s * 3}`} stroke="#FFF2D6" strokeWidth={g.s * 0.8} strokeLinecap="round" opacity={(1 - storm) * (0.25 + 0.5 * Math.max(0, Math.sin(t * 3 + g.ph)))} />
          ))}
        </g>

        {/* PIANO 6 — pioggia vicina e spruzzi davanti alla camera */}
        <g transform={L(1.7)}>
          <Rain t={t} level="near" opacity={0.55 * storm} angle={60} />
          <NearMotes id="wi-spray" t={t} color="#E8F6F8" n={7} y0={900} y1={1900} vx={-260} opacity={0.18 * storm + 0.05} />
        </g>
      </g>
      <Finish id="wi" tint={storm > 0.5 ? '#0E2A3A' : '#2A9D8F'} tintOpacity={0.08 + 0.06 * storm} />
    </svg>
  );
};
