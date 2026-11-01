import React from 'react';
import { camera, eo, eob, lerp, mod, seg } from '../../lib/anim';
import { GlassDrops, Glow, NearMotes, Rain, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { JPDefs, K, Ombra } from './Comuni';

// Il sabotaggio: la sala di controllo di notte, sotto la tempesta. Al centro il grande monitor con la mappa del parco e
// le zone delle recinzioni (verdi); sotto, la scrivania disordinata del programmatore: tastiera, lattine, carte di
// caramelle; a destra la bomboletta da barba (oggetto chiave).
// Eventi: prima frase la scrivania del programmatore e i suoi schermi; seconda frase sul tavolo scivola una busta di
// soldi (pagato da un'azienda rivale); terza frase le zone della mappa diventano rosse una dopo l'altra (cue 2 + 0,12·i,
// l'allarme dello spartito); quarta frase il fondo della bomboletta si svita e mostra le provette azzurre (cue 3 + 0,2),
// poi la bomboletta sparisce (scappa); quinta frase sul monitor «RECINZIONI SPENTE» in rosso (cue 4). Nessuna persona.
// Piani: vetrata con la tempesta (0,25) · parete con gli schermi (0,45) · grande monitor con la mappa (0,6)
//        · scrivania, busta, bomboletta (0,85) · sedia e lattine in primo piano (1,2) · riflessi e particelle (1,5–1,8)

const ZONES = [[-120, -70, 70], [20, -90, 60], [120, -30, 64], [-50, 30, 70], [80, 70, 54], [-140, 80, 50]] as const;

export const Sabotaggio: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const off = (i: number) => seg(t, cues[2] + i * 0.12, cues[2] + i * 0.12 + 0.15);
  const alarm = t > cues[2] ? (mod(t, 0.8) < 0.4 ? 1 : 0.4) : 0;
  const cash = eob(seg(t, cues[1] + 0.3, cues[1] + 1.0));
  const can = eo(seg(t, cues[3], cues[3] + 0.8));
  const gone = eo(seg(t, cues[3] + 1.4, cues[3] + 2.2));
  const fence = seg(t, cues[4], cues[4] + 0.3);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sb" />
        <JPDefs id="sb" />
        <Lin id="sb-night" stops={[[0, '#05080A'], [1, '#14202A']]} />
        <Lin id="sb-wall" stops={[[0, '#0E1612'], [0.5, '#1A2620'], [1, '#22302A']]} />
        <Lin id="sb-desk" stops={[[0, '#5A5E58'], [0.1, '#3A3E3A'], [1, '#1A1E1C']]} />
        <Lin id="sb-mon" x2={1} y2={0} stops={[[0, '#22282A'], [0.5, '#3A4244'], [1, '#1A1E20']]} />
        <Lin id="sb-can" x2={1} y2={0} stops={[[0, '#6A7A84'], [0.4, '#E8F0F4'], [0.6, '#B8C4CC'], [1, '#4A545C']]} />
        <Lin id="sb-env" stops={[[0, '#E8D8A8'], [1, '#B8A070']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — la vetrata sulla tempesta (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#sb-night)" />
          <Rain t={t} level="far" seed={3} color="#5A7080" opacity={0.6} />
          {[180, 540, 900].map((x, i) => <path key={i} d={`M${x - 120} 1060 Q${x} ${980 - (i % 2) * 40} ${x + 120} 1060`} fill="#0A1410" />)}
        </g>

        {/* PIANO 1 — parete della sala con la vetrata e gli schermi piccoli (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-200 -200 H1280 V1300 H-200 Z M-120 560 V1000 H1200 V560 Z" fill="url(#sb-wall)" fillRule="evenodd" />
          {[-120, 200, 520, 840].map((x) => <rect key={x} x={x} y="556" width="16" height="450" fill="#2A3430" stroke={K} strokeWidth="4" />)}
          <GlassDrops t={t} x={-100} y={570} w={1280} h={420} seed={5} n={14} color="#9AB0C0" />
          {[[-40, 760], [880, 760]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width="220" height="150" rx="10" fill="url(#sb-mon)" stroke={K} strokeWidth="7" />
              <rect x={x + 14} y={y + 14} width="192" height="110" fill="#06140E" />
              {Array.from({ length: 6 }, (_, k) => <rect key={k} x={x + 26} y={y + 26 + k * 16} width={60 + ((k * 37 + i * 20 + Math.floor(t * 4)) % 110)} height="8" fill={i ? '#F2C14E' : '#6AF0A0'} opacity=".7" />)}
            </g>
          ))}
        </g>

        {/* PIANO 2 — il grande monitor con la mappa del parco e le zone (0,6) */}
        <g transform={L(0.6)}>
          <rect x="250" y="600" width="580" height="400" rx="18" fill="url(#sb-mon)" stroke={K} strokeWidth="9" />
          <rect x="274" y="622" width="532" height="320" rx="6" fill="#071410" />
          <g transform="translate(540 790)">
            <path d="M-230 -40 Q-200 -140 -60 -150 Q100 -160 200 -100 Q250 -20 210 80 Q120 150 -40 140 Q-200 130 -230 -40 Z" fill="#12301E" stroke="#3A8A5A" strokeWidth="4" />
            {ZONES.map(([x, y, rr], i) => {
              const red = off(i);
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r={rr} fill={red > 0.5 ? '#5A1410' : '#1A4A2A'} stroke={red > 0.5 ? '#E8483A' : '#6AF0A0'} strokeWidth="4" strokeDasharray="10 6" />
                  <circle cx={x} cy={y} r="10" fill={red > 0.5 ? '#E8483A' : '#6AF0A0'} opacity={red > 0.5 ? 0.5 + 0.5 * alarm : 1} />
                </g>
              );
            })}
          </g>
          <g opacity={fence}>
            <rect x="290" y="890" width="500" height="44" fill="#2A0A08" stroke="#E8483A" strokeWidth="4" />
            <text x="540" y="922" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="30" fill="#FF6A5A">RECINZIONI SPENTE</text>
          </g>
          <Glow id="sb-mon" x={540} y={800} r={420} t={t} color={t > cues[2] ? '#E8483A' : '#6AF0A0'} amp={0.05} rate={3} opacity={0.18 + 0.2 * alarm} />
          <rect x="230" y="1000" width="620" height="22" fill="#2A302C" stroke={K} strokeWidth="6" />
        </g>

        {/* PIANO 3 — la scrivania con tastiera, busta di soldi e la bomboletta (0,85) */}
        <g transform={L(0.85)}>
          <path d="M-200 1080 H1280 V1260 H-200 Z" fill="url(#sb-desk)" stroke={K} strokeWidth="8" />
          <path d="M-200 1086 H1280" stroke="#8A928A" strokeWidth="4" opacity=".6" />
          <path d="M-200 1260 H1280 V2200 H-200 Z" fill="#1A201C" />
          <rect x="-200" y="1260" width="1480" height="300" fill="#262C28" stroke={K} strokeWidth="8" />
          {[-140, 240, 620, 1000].map((x) => <g key={x}><rect x={x} y="1290" width="300" height="230" rx="8" fill="#2E3430" stroke={K} strokeWidth="6" /><rect x={x + 110} y="1320" width="80" height="16" rx="8" fill="url(#sb-steel)" stroke={K} strokeWidth="4" /><path d={`M${x + 10} 1300 H${x + 290}`} stroke="#5A625C" strokeWidth="3" /></g>)}
          {/* tastiera */}
          <g transform="translate(420 1150)">
            <rect x="-170" y="-34" width="340" height="68" rx="8" fill="#2A2E2C" stroke={K} strokeWidth="6" />
            {Array.from({ length: 30 }, (_, k) => <rect key={k} x={-158 + (k % 10) * 32} y={-26 + Math.floor(k / 10) * 20} width="26" height="16" rx="3" fill="#4A504C" />)}
          </g>
          {/* carte di caramelle e una lattina */}
          {[[130, 1120, 20], [220, 1200, -30], [660, 1210, 10]].map(([x, y, a], i) => <path key={i} d={`M${x - 20} ${y} l40 -6 l4 14 l-40 6 Z`} fill={['#E85A4A', '#F2C14E', '#4AA0E0'][i]} stroke={K} strokeWidth="3" transform={`rotate(${a} ${x} ${y})`} />)}
          <g transform="translate(60 1150)"><rect x="-26" y="-70" width="52" height="80" rx="8" fill="#C2301E" stroke={K} strokeWidth="5" /><path d="M-26 -50 H26" stroke="#F2EEE4" strokeWidth="6" /><path d="M-18 -64 V0" stroke="#FFFFFF" strokeWidth="4" opacity=".4" /></g>
          {/* la busta con i soldi che scivola sul tavolo */}
          <g transform={`translate(${lerp(-200, 220, cash)} 1210) rotate(${lerp(-20, -6, cash)})`} opacity={seg(cash, 0, 0.1)}>
            <rect x="-90" y="-50" width="180" height="100" rx="6" fill="url(#sb-env)" stroke={K} strokeWidth="6" />
            <path d="M-90 -50 L0 10 L90 -50" fill="none" stroke="#8A7040" strokeWidth="4" />
            {[-60, -30].map((dy) => <rect key={dy} x="-70" y={dy - 30} width="140" height="34" rx="4" fill="#7AAA6A" stroke={K} strokeWidth="4" />)}
            <text x="0" y="-56" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="26" fill="#1E3A1E">$</text>
          </g>
          {/* la bomboletta da barba: il fondo si svita e dentro ci sono le provette */}
          <g transform={`translate(${820 + 320 * gone} 1180)`} opacity={1 - gone}>
            <Ombra id="sb" x={0} y={10} rx={90} ry={12} />
            <g transform={`translate(0 ${40 * can})`}>
              <rect x="-50" y="-30" width="100" height="40" rx="8" fill="url(#sb-can)" stroke={K} strokeWidth="6" />
              {can > 0.3 && [-28, -8, 12, 32].map((x, i) => <g key={i}><rect x={x - 6} y={-130 + i * 4} width="14" height="100" rx="7" fill="#9AD8F0" opacity=".85" stroke={K} strokeWidth="3" /><rect x={x - 4} y={-60} width="10" height="26" fill="#4AA0E0" /></g>)}
            </g>
            <rect x="-50" y="-240" width="100" height="210" rx="14" fill="url(#sb-can)" stroke={K} strokeWidth="7" transform={`translate(0 ${-30 * can})`} />
            <rect x="-34" y="-280" width="68" height="44" rx="12" fill="#E8483A" stroke={K} strokeWidth="6" transform={`translate(0 ${-30 * can})`} />
            <path d="M-36 -220 V-60" stroke="#FFFFFF" strokeWidth="8" opacity=".6" transform={`translate(0 ${-30 * can})`} />
            <Glow id="sb-vials" x={0} y={-80} r={140} t={t} color="#9AD8F0" amp={0.08} rate={4} opacity={0.5 * can} />
          </g>
        </g>

        {/* PIANO 4 — schienale della sedia e cavi in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1560 Q-60 1480 200 1500 Q340 1520 360 1640 V2200 H-200 Z" fill="#2E3632" stroke={K} strokeWidth="10" />
          {[1600, 1700, 1800].map((y) => <path key={y} d={`M-180 ${y} Q80 ${y - 30} 330 ${y}`} stroke="#1E2420" strokeWidth="8" fill="none" />)}
          <path d="M-160 1540 Q0 1500 200 1520" stroke="#7A847E" strokeWidth="6" fill="none" />
          <ellipse cx="540" cy="1400" rx="300" ry="40" fill="#E8483A" opacity={0.12 * alarm} />
          <rect x="-200" y="1260" width="1480" height="300" fill="#E8483A" opacity={0.06 + 0.08 * alarm} />
          <path d="M-200 1262 H1280" stroke="#FF8A7A" strokeWidth="6" opacity={0.3 + 0.4 * alarm} />
          <g transform="translate(860 1760) rotate(-12)">
            <rect x="-260" y="-60" width="520" height="120" rx="12" fill="#2A2E2C" stroke={K} strokeWidth="9" />
            {Array.from({ length: 24 }, (_, k) => <rect key={k} x={-240 + (k % 12) * 40} y={-44 + Math.floor(k / 12) * 44} width="34" height="36" rx="5" fill="#4A504C" stroke={K} strokeWidth="2" />)}
            <path d="M-250 -54 H250" stroke="#8A928A" strokeWidth="4" opacity=".6" />
          </g>
          <path d="M1280 1500 Q1000 1600 900 1900" stroke="#2A2E2C" strokeWidth="20" fill="none" />
          <path d="M1280 1560 Q1050 1650 980 1950" stroke="#3A3E3A" strokeWidth="14" fill="none" />
        </g>

        {/* PIANO 5 — vapore di una tazza, riflessi rossi e particelle (1,5–1,8) */}
        <g transform={L(0.85)}><Wisps t={t} x={60} y={1080} color="#C8D0CC" n={2} h={100} opacity={0.25} /></g>
        <g transform={L(1.8)}>
          <NearMotes id="sb-near" t={t} color={t > cues[2] ? '#FF8A7A' : '#9AF0C0'} n={6} opacity={0.08} />
        </g>
        <rect x="-200" y="-200" width="1480" height="2400" fill="#E8483A" opacity={0.08 * alarm} />
      </g>
      <Finish id="sb" tint="#0F1F17" tintOpacity={0.14} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): busta cue1 + 0,3 · zone rosse cue2 + 0,12·i · bomboletta cue3 → + 0,8, sparisce + 1,4 · RECINZIONI SPENTE cue4.
