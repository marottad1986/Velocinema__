import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Glow, NearMotes, Neon, Rain, Reflection } from '../../lib/elements';
import { DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs } from '../breaking-bad-stagione-1/Comuni';
import { BB2Defs, K, ORO, Mazzetta, Ombra } from './Comuni';

// L'avvocato Saul: un piccolo centro commerciale di periferia di notte, dopo la pioggia. Persone mai: Badger è il paio di
// manette sulla panchina, Saul è il suo studio con l'insegna al neon e la pubblicità sulla panchina. Eventi: prima frase
// le luci rosse e blu di una volante spazzano le vetrine e l'asfalto bagnato (l'arresto); seconda frase si accende
// l'insegna al neon AVVOCATO e si illumina il cartellone della panchina; terza frase le manette si aprono, la ventiquattrore
// si apre piena di mazzette e nella lavatrice della lavanderia accanto girano le banconote: i soldi si ripuliscono.
// Piani: cielo viola e tetti lontani (0,22) · facciata con lo studio e la lavanderia (0,45) · parcheggio bagnato con i
//        riflessi (0,7) · panchina, manette e ventiquattrore in primo piano (1,2) · pioggia fine vicina (1,6)

const r = rng(2206);
const STARS = Array.from({ length: 40 }, () => ({ x: r() * 1300 - 100, y: r() * 560, s: 1 + r() * 2 }));

export const Saul: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tCops = griglia(cues[0] + 0.4);
  const tNeon = griglia(cues[1] + 0.6);
  const tOpen = griglia(cues[2] + 0.5);
  const cops = seg(t, tCops, tCops + 0.4) * (1 - seg(t, tCops + 3.2, tCops + 3.8));
  const redOn = Math.sin(t * 11) > 0;
  const sweep = Math.sin(t * 2.2);
  const board = eo(seg(t, tNeon + 0.4, tNeon + 0.8));
  const open = eo(seg(t, tOpen, tOpen + 0.5));
  const cuffs = eo(seg(t, tOpen - 0.3, tOpen + 0.1));
  const wash = seg(t, tOpen, tOpen + 0.6);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sa" />
        <BBDefs id="sa" />
        <BB2Defs id="sa" />
        <Lin id="sa-sky" stops={[[0, '#0A0816'], [0.4, '#1E1638'], [0.6, '#3A2650'], [0.7, '#5A3A5A']]} />
        <Lin id="sa-wall" stops={[[0, '#C8B898'], [1, '#8A7A60']]} />
        <Lin id="sa-asph" stops={[[0, '#2A2A34'], [0.5, '#18181E'], [1, '#08080C']]} />
        <Lin id="sa-glass" stops={[[0, '#F2D8A0'], [1, '#C89A58']]} />
        <Lin id="sa-laund" stops={[[0, '#C8F0F2'], [1, '#7AC0C8']]} />
        <Lin id="sa-brief" stops={[[0, '#6A3E22'], [1, '#3A2010']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo viola di periferia con qualche stella, tetti e un palo della luce (0,22) */}
        <g transform={L(0.22)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#sa-sky)" />
          {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y + 40} r={s.s} fill="#E8E0F8" opacity={0.4 + 0.4 * Math.sin(t * 2 + i)} />)}
          <path d="M-200 700 H60 V650 H200 V690 H420 V640 H600 V700 H860 V660 H1280 V760 H-200 Z" fill="#14101E" />
        </g>

        {/* PIANO 1 — la facciata: lo studio dell'avvocato e la lavanderia, con le insegne (0,45) */}
        <g transform={L(0.45)}>
          <rect x="-200" y="690" width="1480" height="480" fill="url(#sa-wall)" stroke={K} strokeWidth="8" />
          <rect x="-200" y="690" width="1480" height="40" fill="#6A5A48" stroke={K} strokeWidth="6" />
          {/* studio dell'avvocato (sinistra) */}
          <rect x="60" y="760" width="440" height="110" fill="#1A1420" stroke={K} strokeWidth="6" />
          <Neon id="sa-neon" t={t} x={280} y={845} text="AVVOCATO" color="#FF6A4A" font={DISPLAY} size={76} onAt={tNeon} />
          <rect x="80" y="900" width="400" height="260" fill="url(#sa-glass)" stroke={K} strokeWidth="8" />
          {/* dentro: carta da parati a pergamena, scrivania, bandiera arrotolata */}
          {Array.from({ length: 5 }, (_, k) => <path key={k} d={`M${100 + k * 76} 920 h60 v90 h-60 Z`} fill="#F6E8C0" stroke="#B89A60" strokeWidth="3" />)}
          {Array.from({ length: 5 }, (_, k) => [0, 1, 2, 3].map((j) => <path key={`${k}${j}`} d={`M${108 + k * 76} ${936 + j * 18} h44`} stroke="#B89A60" strokeWidth="2" />))}
          <rect x="140" y="1060" width="280" height="100" fill="#5A3A22" stroke={K} strokeWidth="6" />
          <path d="M280 900 V1160" stroke={K} strokeWidth="6" />
          <rect x="300" y="1000" width="16" height="60" fill="#C8A060" />
          <Glow id="sa-off" x={280} y={1030} r={300} t={t} color="#FFD890" amp={0.03} rate={1} opacity={0.4} />
          {/* lavanderia (destra) */}
          <rect x="580" y="760" width="440" height="110" fill="#1A1420" stroke={K} strokeWidth="6" />
          <Neon id="sa-neon2" t={t} x={800} y={840} text="LAVANDERIA" color="#5AE8F0" font={SANS} size={58} />
          <rect x="600" y="900" width="400" height="260" fill="url(#sa-laund)" stroke={K} strokeWidth="8" />
          {[0, 1, 2].map((k) => {
            const cx = 680 + k * 120, cy = 1050;
            const isIt = k === 1;
            return (
              <g key={k}>
                <rect x={cx - 52} y={cy - 80} width="104" height="190" rx="8" fill="#E8EEF0" stroke={K} strokeWidth="6" />
                <circle cx={cx} cy={cy + 10} r="40" fill="#3A5A6A" stroke={K} strokeWidth="7" />
                <circle cx={cx} cy={cy + 10} r="30" fill="#7AB0C8" opacity=".6" />
                {/* nella lavatrice di mezzo girano le banconote */}
                <g transform={`translate(${cx} ${cy + 10}) rotate(${(t * (isIt ? 200 + 400 * wash : 120)) % 360})`}>
                  {isIt && wash > 0 ? [0, 120, 240].map((a) => <rect key={a} x="-14" y="-22" width="28" height="14" fill="#A8C08A" stroke={K} strokeWidth="2" transform={`rotate(${a})`} />)
                    : [0, 180].map((a) => <ellipse key={a} cx="0" cy="-14" rx="16" ry="8" fill="#E8E2D0" transform={`rotate(${a})`} />)}
                </g>
                <rect x={cx - 40} y={cy - 70} width="80" height="16" rx="3" fill="#B8C0C4" />
                {isIt && <circle cx={cx + 28} cy={cy - 62} r="5" fill={wash > 0 ? '#3AF07A' : '#5A5A5A'} />}
              </g>
            );
          })}
          <path d="M530 760 V1170" stroke="#4A3A2A" strokeWidth="30" />
          {/* luci della volante che spazzano la facciata */}
          {cops > 0 && <rect x="-200" y="690" width="1480" height="480" fill={redOn ? '#FF2A2A' : '#2A5AFF'} opacity={0.4 * cops * (0.6 + 0.4 * sweep)} />}
        </g>

        {/* PIANO 2 — parcheggio bagnato con le strisce e i riflessi (0,7) */}
        <g transform={L(0.7)}>
          <rect x="-200" y="1170" width="1480" height="900" fill="url(#sa-asph)" />
          {[-60, 240, 540, 840, 1140].map((x) => <path key={x} d={`M${x} 1200 L${x - 120} 1520`} stroke="#E8E2C8" strokeWidth="8" opacity=".5" />)}
          <Reflection t={t} x={280} y={1200} color="#FF6A4A" n={9} w={300} gap={26} opacity={0.55 * (t > tNeon ? 1 : 0.05)} />
          <Reflection t={t} x={800} y={1200} color="#5AE8F0" n={9} w={260} gap={26} opacity={0.4} />
          {cops > 0 && <Reflection t={t} x={540 + sweep * 260} y={1220} color={redOn ? '#FF3A3A' : '#3A6AFF'} n={8} w={160} gap={28} opacity={0.8 * cops} />}
          {/* pozzanghere */}
          {[[180, 1430, 170], [760, 1460, 210]].map(([x, y, w], i) => <ellipse key={i} cx={x} cy={y} rx={w} ry={w * 0.16} fill="#3A3450" opacity=".6" />)}
        </g>

        {/* PIANO 3 — la panchina con la pubblicità dell'avvocato, le manette, la ventiquattrore (1,2) */}
        <g transform={L(1.2)}>
          <g transform="translate(400 1830)">
            <Ombra id="sa" x={0} y={10} rx={460} ry={30} />
            {/* schienale con il cartellone */}
            <rect x="-420" y="-360" width="840" height="200" rx="10" fill="#F2E4C4" stroke={K} strokeWidth="10" />
            <rect x="-410" y="-350" width="820" height="180" fill="#2A4A8A" />
            <rect x="-410" y="-350" width="820" height="180" fill="#FFFFFF" opacity={0.25 * board} />
                        <text x="-120" y="-236" textAnchor="middle" fontFamily={DISPLAY} fontWeight="800" fontSize="62" fill={ORO}>CHIAMA L'AVVOCATO!</text>
            <Glow id="sa-board" x={0} y={-260} r={500} t={t} color="#FFF0C0" amp={0.04} rate={2} opacity={0.35 * board} />
            {/* seduta e gambe */}
            <rect x="-440" y="-150" width="880" height="40" rx="8" fill="#6A4A30" stroke={K} strokeWidth="9" />
            <path d="M-380 -110 V60 M380 -110 V60" stroke="#3A3A3A" strokeWidth="20" />
            {/* manette sulla panchina: si aprono */}
            <g transform="translate(-220 -170)">
              <circle cx="-40" cy="0" r="30" fill="none" stroke="#C8D0D4" strokeWidth="10" />
              <g transform={`rotate(${-40 * cuffs} 40 0)`}><circle cx="40" cy="0" r="30" fill="none" stroke="#C8D0D4" strokeWidth="10" strokeDasharray={cuffs > 0.5 ? '150 40' : '0'} /></g>
              <path d="M-10 0 h20" stroke="#8A9094" strokeWidth="8" />
              <circle cx="-40" cy="0" r="30" fill="none" stroke={K} strokeWidth="3" />
            </g>
            {/* ventiquattrore piena di mazzette */}
            <g transform="translate(300 -150)">
              <rect x="-150" y="-110" width="300" height="110" rx="10" fill="url(#sa-brief)" stroke={K} strokeWidth="8" />
              <path d="M-40 -110 V-130 H40 V-110" stroke="#3A2010" strokeWidth="10" fill="none" />
              {open > 0 && (
                <g>
                  <g transform={`translate(0 -110) scale(1 ${-open})`}><rect x="-150" y="0" width="300" height="100" rx="10" fill="#4A2A14" stroke={K} strokeWidth="7" /></g>
                  {[-90, -10, 70].map((mx, i) => <Mazzetta key={i} id="sa" x={mx} y={-120 - 6 * i} s={0.55} rot={-6 + i * 6} />)}
                  <Glow id="sa-cashg" x={0} y={-130} r={150} t={t} color={ORO} amp={0.08} rate={3} opacity={0.3 * open} />
                </g>
              )}
              <rect x="-20" y="-70" width="40" height="18" rx="3" fill={ORO} stroke={K} strokeWidth="3" />
            </g>
          </g>
          {/* cestino e palo della fermata a destra */}
          <path d="M1010 2000 V1200" stroke="#5A5A5A" strokeWidth="22" />
          <rect x="950" y="1180" width="120" height="80" rx="8" fill="#E8E2D0" stroke={K} strokeWidth="7" />
          <text x="1010" y="1236" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="40" fill="#2A4A8A">BUS</text>
        </g>

        {/* PIANO 4 — pioggerella fine e particelle vicine (1,6) */}
        <g transform={L(1.6)}>
          <Rain t={t} level="far" seed={26} opacity={0.25} />
          <NearMotes id="sa-near" t={t} color="#C8B8F0" n={6} r0={70} r1={150} opacity={0.1} />
          {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={mod(i * 151 + t * 14, 1080)} cy={mod(i * 211 + t * 40, 900) + 700} r="2.5" fill="#E8E0F8" opacity=".35" />)}
        </g>
      </g>
      <Finish id="sa" tint="#142235" tintOpacity={0.13} />
    </svg>
  );
};
