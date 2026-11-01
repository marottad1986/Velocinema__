import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Glow, NearMotes, Reflection, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { JPDefs, K, Ombra, RaptorHead } from './Comuni';

// Raptor in cucina: la cucina del centro visitatori, piastrelle bianche e banconi d'acciaio, la cappa, i mestoli appesi;
// al centro la porta a battente con l'oblò (oggetto chiave); a sinistra un terminale a muro.
// Eventi: prima frase dietro l'oblò spunta la testa di un raptor piumato e la maniglia si abbassa da sola (cue 0 + 1,2,
// la serratura); seconda frase i mestoli urtati oscillano e una pentola cade dal bancone (cue 1 + 0,8, il metallo); terza
// frase il terminale si accende (cue 2, i bip); quarta frase sul terminale «PORTE BLOCCATE» e la spia della porta diventa
// rossa, con l'icona del telefono che torna (cue 3). Nessuna persona.
// Piani: parete con piastrelle e cappa (0,25) · porta con l'oblò e il terminale (0,45) · mestoli (0,6) · banconi (0,85)
//        · bancone in primo piano (1,2) · vapore e particelle (1,5–1,8)

export const Cucina: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const handle = seg(t, cues[0] + 1.2, cues[0] + 1.6) * (1 - seg(t, cues[0] + 2.4, cues[0] + 2.8));
  const peek = eio(seg(t, cues[0] + 0.5, cues[0] + 1.2)) * (1 - eio(seg(t, cues[2], cues[2] + 0.8)));
  const swing = Math.sin(t * 3) * 6 + (t > cues[1] ? 18 * Math.sin(t * 5) * Math.exp(-(t - cues[1]) * 1.2) : 0);
  const pot = eio(seg(t, cues[1] + 0.3, cues[1] + 0.8));
  const screen = eo(seg(t, cues[2], cues[2] + 0.8));
  const locked = seg(t, cues[3], cues[3] + 0.2);
  const doorPush = t < cues[3] ? Math.max(0, Math.sin((t - cues[0]) * 3)) * 3 * seg(t, cues[0] + 1.6, cues[0] + 2) : 0;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cu" />
        <JPDefs id="cu" />
        <Lin id="cu-wall" stops={[[0, '#2A3430'], [0.4, '#6A7A72'], [1, '#8A9A92']]} />
        <Lin id="cu-floor" stops={[[0, '#5A6A62'], [1, '#1E2622']]} />
        <Lin id="cu-door" x2={1} y2={0} stops={[[0, '#7A8A84'], [0.45, '#D8E0DC'], [1, '#5A6A64']]} />
        <Lin id="cu-hood" x2={1} y2={0} stops={[[0, '#4A524E'], [0.5, '#A8B0AC'], [1, '#3A423E']]} />
        <Lin id="cu-top" stops={[[0, '#E8F0EC'], [0.2, '#A8B4AE'], [1, '#5A6460']]} />
        <Lin id="cu-term" x2={1} y2={0} stops={[[0, '#2A302C'], [0.5, '#4A524E'], [1, '#22282A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con le piastrelle e la cappa (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#cu-wall)" />
          {Array.from({ length: 13 }, (_, r) => Array.from({ length: 16 }, (_, c) => <rect key={`${r}-${c}`} x={-200 + c * 96 + (r % 2) * 48} y={620 + r * 50} width="92" height="46" fill="#C8D4CE" opacity=".18" />))}
          <Glow id="cu-light" x={540} y={560} r={600} t={t} color="#E8F4F0" amp={0.03} rate={1.5} opacity={0.3} />
        </g>

        {/* PIANO 1 — la porta a battente con l'oblò e il raptor, il terminale a muro (0,45) */}
        <g transform={L(0.45)}>
          <rect x="370" y="600" width="340" height="560" fill="#1A2220" stroke={K} strokeWidth="9" />
          <g transform={`translate(${doorPush} 0)`}>
            <rect x="384" y="614" width="312" height="540" fill="url(#cu-door)" stroke={K} strokeWidth="7" />
            <path d="M400 640 H680" stroke="#FFFFFF" strokeWidth="5" opacity=".5" />
            <rect x="384" y="1030" width="312" height="40" fill="#5A6A64" stroke={K} strokeWidth="4" />
            {/* oblò con il raptor */}
            <circle cx="540" cy="780" r="96" fill="#0E1614" stroke={K} strokeWidth="10" />
            <clipPath id="cu-port"><circle cx="540" cy="780" r="88" /></clipPath>
            <g clipPath="url(#cu-port)">
              <rect x="440" y="680" width="200" height="200" fill="#14201C" />
              <g opacity={peek} transform={`translate(${lerp(140, 0, peek)} 0)`}>
                <RaptorHead x={470} y={770} s={0.62} t={t} open={0.25} />
              </g>
            </g>
            <circle cx="540" cy="780" r="96" fill="none" stroke="url(#cu-steel)" strokeWidth="14" />
            <path d="M478 726 Q500 704 530 700" stroke="#FFFFFF" strokeWidth="6" opacity=".45" fill="none" />
            {/* maniglia che si abbassa */}
            <g transform={`rotate(${30 * handle} 640 930)`}>
              <rect x="560" y="920" width="90" height="20" rx="10" fill="url(#cu-steel)" stroke={K} strokeWidth="5" />
            </g>
            <circle cx="640" cy="930" r="14" fill="url(#cu-steel)" stroke={K} strokeWidth="4" />
          </g>
          {/* spia sopra la porta */}
          <rect x="500" y="560" width="80" height="30" rx="8" fill={locked > 0.5 ? '#E8483A' : '#3A8A5A'} stroke={K} strokeWidth="5" />
          <Glow id="cu-led" x={540} y={575} r={110} t={t} color={locked > 0.5 ? '#E8483A' : '#6AF0A0'} amp={0.1} rate={5} opacity={0.6} />
          {/* terminale a muro */}
          <rect x="30" y="640" width="260" height="210" rx="12" fill="url(#cu-term)" stroke={K} strokeWidth="8" />
          <rect x="50" y="660" width="220" height="150" rx="6" fill={screen > 0.1 ? '#06140E' : '#101412'} />
          <g opacity={screen}>
            {[0, 1, 2].map((k) => <rect key={k} x="66" y={676 + k * 22} width={60 + ((k * 47 + Math.floor(t * 5)) % 120)} height="10" fill="#6AF0A0" opacity=".7" />)}
            <g opacity={locked}>
              <rect x="60" y="746" width="200" height="54" fill="#2A0A08" stroke="#E8483A" strokeWidth="3" />
              <text x="160" y="772" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="20" fill="#FF6A5A">PORTE BLOCCATE</text>
              <text x="160" y="794" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="16" fill="#6AF0A0">☎ TELEFONI OK</text>
            </g>
          </g>
          <Glow id="cu-term" x={160} y={735} r={160} t={t} color="#6AF0A0" amp={0.06} rate={4} opacity={0.2 * screen} />
        </g>

        {/* PIANO 2 — rastrelliera con i mestoli che oscillano, la cappa (0,6) */}
        <g transform={L(0.6)}>
          <path d="M760 600 H1120 L1080 680 H800 Z" fill="url(#cu-hood)" stroke={K} strokeWidth="7" />
          <rect x="760" y="720" width="380" height="16" fill="url(#cu-steel)" stroke={K} strokeWidth="5" />
          {[800, 870, 940, 1010, 1080].map((x, i) => (
            <g key={x} transform={`rotate(${swing * (i % 2 ? 1 : -0.8)} ${x} 728)`}>
              <path d={`M${x} 728 V${840 + (i % 3) * 30}`} stroke="url(#cu-steel)" strokeWidth="8" />
              {i % 2 ? <ellipse cx={x} cy={860 + (i % 3) * 30} rx="26" ry="18" fill="url(#cu-steel)" stroke={K} strokeWidth="5" /> : <rect x={x - 22} y={836 + (i % 3) * 30} width="44" height="40" rx="6" fill="url(#cu-steel)" stroke={K} strokeWidth="5" />}
            </g>
          ))}
        </g>

        {/* PIANO 3 — pavimento, banconi d'acciaio, la pentola che cade (0,85) */}
        <g transform={L(0.85)}>
          <path d="M-200 1160 H1280 V2200 H-200 Z" fill="url(#cu-floor)" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-200 + i * 160} 1170 L${-400 + i * 200} 2200`} stroke="#3A4A42" strokeWidth="3" opacity=".6" />)}
          <Reflection t={t} x={540} y={1190} color="#C8D8D0" n={6} w={200} gap={24} opacity={0.3} />
          {[[-200, 340], [740, 1280]].map(([a, b], i) => (
            <g key={i}>
              <Ombra id="cu" x={(a + b) / 2} y={1170} rx={(b - a) / 2} ry={18} />
              <rect x={a} y="980" width={b - a} height="190" fill="url(#cu-door)" stroke={K} strokeWidth="8" />
              <rect x={a - 10} y="960" width={b - a + 20} height="30" rx="4" fill="url(#cu-top)" stroke={K} strokeWidth="7" />
              {Array.from({ length: 3 }, (_, k) => <rect key={k} x={a + 30 + k * ((b - a - 60) / 3)} y="1010" width={(b - a - 60) / 3 - 20} height="130" rx="6" fill="none" stroke={K} strokeWidth="5" />)}
            </g>
          ))}
          {/* pentole sul bancone di destra, una cade */}
          <g transform="translate(860 960)"><rect x="-50" y="-70" width="100" height="70" rx="8" fill="url(#cu-steel)" stroke={K} strokeWidth="6" /><path d="M-60 -70 H60" stroke={K} strokeWidth="8" /><Wisps t={t} x={0} y={-74} color="#E8F0EC" n={2} h={110} opacity={0.4} /></g>
          <g transform={`translate(${lerp(980, 840, pot)} ${lerp(930, 1220, pot * pot)}) rotate(${pot * 150})`}>
            <rect x="-44" y="-40" width="88" height="60" rx="8" fill="url(#cu-steel)" stroke={K} strokeWidth="6" />
            <path d="M44 -20 H90" stroke={K} strokeWidth="10" strokeLinecap="round" />
          </g>
        </g>

        {/* PIANO 4 — il bancone in primo piano che incornicia (1,2) */}
        <g transform={L(1.2)}>
          <rect x="-200" y="1560" width="1480" height="640" fill="url(#cu-door)" stroke={K} strokeWidth="10" />
          <rect x="-220" y="1530" width="1520" height="44" rx="6" fill="url(#cu-top)" stroke={K} strokeWidth="9" />
          {[-100, 260, 620, 980].map((x) => <g key={x}><rect x={x} y="1620" width="300" height="240" rx="8" fill="none" stroke={K} strokeWidth="6" /><rect x={x + 110} y="1650" width="80" height="18" rx="9" fill="url(#cu-steel)" stroke={K} strokeWidth="4" /></g>)}
          <Reflection t={t} x={540} y={1546} color="#FFFFFF" n={4} w={500} gap={8} opacity={0.25} />
        </g>

        {/* PIANO 5 — particelle vicine (1,8) */}
        <g transform={L(1.8)}>
          <NearMotes id="cu-near" t={t} color="#E8F4F0" n={6} opacity={0.08} />
        </g>
        <rect x="-200" y="-200" width="1480" height="2400" fill="#E8483A" opacity={0.06 * locked} />
      </g>
      <Finish id="cu" tint="#0F1F17" tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): raptor cue0 + 0,5 · maniglia cue0 + 1,2 · mestoli cue1 · pentola cue1 + 0,3 → 0,8 · terminale cue2 · bloccate cue3.
