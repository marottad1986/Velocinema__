import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Buio, Dust, Glow, NearMotes, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { ConjDefs, GOLD, K, Ombra, TINT_NOTTE } from './Comuni';

// Le prove per la Chiesa: il soggiorno della fattoria di notte trasformato in laboratorio, nel buio. Su «serve il
// permesso della Chiesa, che vuole prove» sul tavolino si accende la lettera con il sigillo di ceralacca e il rosario; su
// «macchine fotografiche e campanelli» i campanelli appesi al filo davanti alla porta suonano da soli uno dopo l'altro, le
// bobine del registratore girano e due flash scattano (il buio si apre per un istante su tutta la stanza); su «la strega
// attacca la loro figlia» dalla macchina istantanea esce una foto che si sviluppa: la finestra della cameretta di casa
// Warren, con una macchia nera che si allarga. Nessuna persona.
// Piani: parete e porta (0,3) · filo dei campanelli (0,5) · treppiedi e macchine (0,7) · tavolino, registratore, cavi (1,1) · polvere (1,6)

export const Prove: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const beat = 60 / 72;
  const tLet = griglia(cues[0] + 1.0);
  const letter = eo(seg(t, tLet, tLet + 0.6));
  const tBells = griglia(cues[1] + 0.3);
  const bells = [0, 1, 2, 3, 4].map((i) => {
    const a = tBells + i * beat * 0.5;
    return t > a && t < a + 1.4 ? Math.sin((t - a) * 24) * 22 * (1 - (t - a) / 1.4) : 0;
  });
  const tF1 = griglia(cues[1] + 1.9);
  const tF2 = tF1 + beat * 2;
  const flash = flashAt(t, [tF1, tF2]);
  const tPhoto = griglia(cues[2] + 0.4);
  const photo = eob(seg(t, tPhoto, tPhoto + 0.8), 1);
  const dev = seg(t, tPhoto + 0.6, tPhoto + 2.0);
  const stain = eo(seg(t, tPhoto + 1.4, tPhoto + 2.8));
  const reel = t * 160;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pv" />
        <ConjDefs id="pv" />
        <Lin id="pv-wall" stops={[[0, '#3A3A34'], [0.5, '#4E4C42'], [1, '#2A2A24']]} x2={1} y2={0} />
        <Lin id="pv-floor" stops={[[0, '#4A3828'], [1, '#1A120C']]} />
        <radialGradient id="pv-stain"><stop offset="0" stopColor="#000" stopOpacity=".95" /><stop offset=".7" stopColor="#000" stopOpacity=".7" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.3)}>
          <rect x="-300" y="-200" width="1700" height="1500" fill="url(#pv-wall)" />
          {/* la porta del corridoio, aperta sul buio */}
          <rect x="400" y="640" width="280" height="560" fill="#060708" />
          <path d="M392 1204 V632 H688 V1204" stroke="#C8C2B2" strokeWidth="18" fill="none" />
          <path d="M386 1204 V626 H694 V1204" stroke={K} strokeWidth="6" fill="none" />
          <path d="M-300 1200 H1400" stroke="#2A2018" strokeWidth="30" />
        </g>
        {/* il filo dei campanelli tirato davanti alla porta */}
        <g transform={L(0.5)}>
          <path d="M330 760 Q540 800 750 760" stroke="#C8B890" strokeWidth="4" fill="none" />
          <circle cx="330" cy="760" r="8" fill="#8A8A86" stroke={K} strokeWidth="3" />
          <circle cx="750" cy="760" r="8" fill="#8A8A86" stroke={K} strokeWidth="3" />
          {[400, 470, 540, 610, 680].map((x, i) => {
            const y = 760 + 40 * Math.sin(((x - 330) / 420) * Math.PI) * 0.95;
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${bells[i]})`}>
                {Math.abs(bells[i]) > 3 && <Glow id={`pv-b${i}`} x={0} y={50} r={70} t={t} color={GOLD} amp={0} opacity={0.5} />}
                <path d="M0 0 V24" stroke="#C8B890" strokeWidth="3" />
                <path d="M-22 64 Q-22 24 0 22 Q22 24 22 64 Z" fill="url(#pv-brass)" stroke={K} strokeWidth="4" />
                <circle cx="0" cy="68" r="6" fill="#6A4A1E" stroke={K} strokeWidth="2" />
              </g>
            );
          })}
        </g>
        {/* i treppiedi con le macchine fotografiche */}
        <g transform={L(0.7)}>
          {[[180, 1260, 1], [900, 1260, -1]].map(([x, y, d], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <Ombra id="pv" x={0} y={0} rx={120} ry={14} />
              <path d="M0 -360 L-90 0 M0 -360 L90 0 M0 -360 L0 0" stroke="#2A2A2A" strokeWidth="10" />
              <path d="M0 -360 L-90 0 M0 -360 L90 0" stroke="#8A8A86" strokeWidth="3" opacity=".5" />
              <g transform={`translate(0 -400) scale(${d} 1)`}>
                <rect x="-80" y="-60" width="160" height="100" rx="10" fill="#1A1A1E" stroke={K} strokeWidth="7" />
                <rect x="-70" y="-50" width="140" height="22" fill="#8A8A86" />
                <circle cx="20" cy="0" r="34" fill="#2A2A30" stroke={K} strokeWidth="6" />
                <circle cx="20" cy="0" r="20" fill="#3A4A6A" />
                <circle cx="12" cy="-8" r="6" fill="#FFFFFF" opacity=".6" />
                <rect x="-60" y="-88" width="50" height="30" fill="#D8D8D0" stroke={K} strokeWidth="4" />
                {flash > 0 && <Glow id={`pv-fl${i}`} x={-35} y={-74} r={200} t={t} color="#FFFFFF" amp={0} opacity={flash} />}
              </g>
            </g>
          ))}
        </g>
        {/* tavolino con la lettera e il rosario, il registratore a bobine, i cavi */}
        <g transform={L(1.1)}>
          <path d="M-300 1240 H1400 V2200 H-300 Z" fill="url(#pv-floor)" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M-300 ${1280 + i * 64} H1400`} stroke="#1A120C" strokeWidth="4" />)}
          <path d="M-100 1320 Q200 1290 340 1330 Q520 1380 700 1330 Q900 1290 1200 1340" stroke="#141414" strokeWidth="9" fill="none" />
          {/* il registratore a bobine */}
          <g transform="translate(300 1250)">
            <rect x="-150" y="-110" width="300" height="110" rx="10" fill="#4A4A44" stroke={K} strokeWidth="7" />
            {[-70, 70].map((x) => (
              <g key={x} transform={`translate(${x} -118) rotate(${reel})`}>
                <circle r="58" fill="#7A6A4A" stroke={K} strokeWidth="5" />
                <circle r="44" fill="#2A2018" />
                {[0, 120, 240].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 26} cy={Math.sin((a * Math.PI) / 180) * 26} r="10" fill="#7A6A4A" />)}
                <circle r="8" fill="#C8C8C0" />
              </g>
            ))}
            <path d="M-70 -60 H70" stroke="#3A2A18" strokeWidth="4" />
            <circle cx="110" cy="-30" r="9" fill="#E83A2A" />
            <Glow id="pv-rec" x={110} y={-30} r={50} t={t} color="#E83A2A" amp={0.4} rate={6} opacity={0.6} />
          </g>
          {/* il tavolino con la lettera sigillata e il rosario */}
          <g transform="translate(760 1300)">
            <Ombra id="pv" x={0} y={0} rx={170} ry={16} />
            <path d="M-150 -80 H150 V-60 H-150 Z" fill="url(#pv-wood)" stroke={K} strokeWidth="6" />
            <path d="M-130 -60 V0 M130 -60 V0" stroke="#3A2618" strokeWidth="14" />
            <g transform="translate(-30 -96) rotate(-6)">
              {letter > 0 && <Glow id="pv-let" x={0} y={0} r={150} t={t} color={GOLD} amp={0.06} rate={2} opacity={0.5 * letter} />}
              <rect x="-80" y="-20" width="160" height="40" fill="#F2EAD4" stroke={K} strokeWidth="4" transform="scale(1 .6)" />
              <circle cx="0" cy="0" r="12" fill="#A82A22" stroke={K} strokeWidth="3" />
            </g>
            <path d="M60 -90 Q100 -110 120 -84 Q100 -70 70 -84" stroke="#C8B890" strokeWidth="4" strokeDasharray="2 7" strokeLinecap="round" fill="none" />
            <path d="M120 -84 V-66 M112 -76 H128" stroke="#C8B890" strokeWidth="4" />
          </g>
          {/* la foto istantanea che esce e si sviluppa */}
          {photo > 0 && (
            <g transform={`translate(${lerp(820, 560, photo)} ${lerp(870, 1080, photo)}) rotate(${lerp(-20, 6, photo)}) scale(${lerp(0.3, 1.25, photo)})`}>
              <rect x="-100" y="-110" width="200" height="230" fill="#F2F0E8" stroke={K} strokeWidth="5" />
              <rect x="-84" y="-94" width="168" height="168" fill={dev < 0.5 ? '#2A2A2A' : '#3A3A44'} />
              <g opacity={dev}>
                <rect x="-84" y="-94" width="168" height="168" fill="#2A3448" />
                {/* la casa dei Warren di notte con la finestra della cameretta accesa */}
                <path d="M-60 74 V-10 L0 -60 L60 -10 V74 Z" fill="#8A8A8A" stroke={K} strokeWidth="3" />
                <rect x="-20" y="0" width="40" height="40" fill="#FFD890" />
                <path d="M0 0 V40 M-20 20 H20" stroke={K} strokeWidth="3" />
              </g>
              {stain > 0 && <ellipse cx="0" cy="18" rx={70 * stain} ry={60 * stain} fill="url(#pv-stain)" />}
            </g>
          )}
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 800, x0: 160, x1: 260 }} bottom={{ y: 1300, x0: 60, x1: 500 }} seed={85} n={18} color="#E8E8F0" boost={0.2 + flash} />
        </g>
        {/* il buio, che i flash aprono per un istante */}
        <Buio id="pv-b" t={t} darkness={0.84 * (1 - flash)} flicker={0.05} tint="#FFE8B0" tintOpacity={0.06}
          lights={[
            { x: 300, y: 1180, r: 360, power: 0.8 },
            { x: 540, y: 820, r: 300, power: 0.55 },
            { x: 730, y: 1200, r: 300, power: 0.4 + 0.5 * letter },
            { x: 560, y: 1080, r: 300 * photo, power: photo },
            { x: 180, y: 880, r: 240, power: 0.45 + 0.4 * seg(t, tBells, tBells + 0.5) },
            { x: 900, y: 880, r: 240, power: 0.45 + 0.4 * seg(t, tBells, tBells + 0.5) },
          ]} />
        <g transform={L(1.6)}>
          <NearMotes id="pv-near" t={t} color="#C8D8E8" n={5} y0={1100} opacity={0.06} />
        </g>
      </g>
      <Finish id="pv" tint={TINT_NOTTE} tintOpacity={0.1} />
    </svg>
  );
};
