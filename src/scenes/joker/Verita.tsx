import React from 'react';
import { camera, eio, eo, lerp, rng, seg } from '../../lib/anim';
import { Dust, GlassDrops, Glow, NearMotes, Rain } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { HAND, SANS, TYPEWRITER } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { JokerDefs, K, Ombra } from './Comuni';

// La verità sulla madre: l'archivio di un vecchio manicomio. Scaffali di metallo pieni di scatole e cartelle che si
// perdono nel buio, la finestra con le sbarre e la pioggia, una lampada a campana che oscilla; in primo piano il tavolo
// con lo schedario e la grande cartella «FLECK», l'oggetto chiave.
// Eventi: prima frase il cassetto dello schedario si apre e la cartella si apre sul tavolo (cue 0 + 0,6, le pagine dello
// spartito); seconda frase cala il timbro rosso «ADOZIONE» (cue 1 + 1,0, legno e timpano); terza frase da sotto la
// cartella scivola fuori il referto medico di Arthur bambino e la lampada sfarfalla. Nessuna persona.
// Piani: corridoio di scaffali e finestra con la pioggia (0,25) · scaffali vicini e lampada (0,5) · schedario (0,7)
//        · tavolo e cartella (0,95) · scatoloni in primo piano (1,2) · pulviscolo nel cono della lampada (1,5–1,8)

const r = rng(9);
const BOX = Array.from({ length: 32 }, (_, i) => ({ col: i % 8, row: Math.floor(i / 8), w: 60 + r() * 30, c: ['#C8B080', '#B89A68', '#D8C090', '#A88A58'][Math.floor(r() * 4)] }));

export const Verita: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const drawer = eo(seg(t, cues[0] + 0.2, cues[0] + 0.7));
  const open = eio(seg(t, cues[0] + 0.6, cues[0] + 1.6));
  const stamp = seg(t, cues[1] + 0.82, cues[1] + 1.0);
  const stamped = t > cues[1] + 1.0;
  const lift = seg(t, cues[1] + 1.15, cues[1] + 1.5);
  const report = eo(seg(t, cues[2] + 0.2, cues[2] + 1.2));
  const swing = Math.sin(t * 1.4) * 9;
  const flick = t > cues[2] && Math.sin(t * 19) + Math.sin(t * 7.3) > 1.1 ? 0.35 : 1;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="vr" />
        <JokerDefs id="vr" />
        <Lin id="vr-back" stops={[[0, '#0E1412'], [0.5, '#1E2A26'], [1, '#2A3632']]} />
        <Lin id="vr-shelf" x2={1} y2={0} stops={[[0, '#3A4440'], [0.5, '#6A7670'], [1, '#2E3632']]} />
        <Lin id="vr-cab" x2={1} y2={0} stops={[[0, '#4A5A52'], [0.45, '#8A9A90'], [1, '#3A463E']]} />
        <Lin id="vr-table" stops={[[0, '#6A4A30'], [1, '#3A2818']]} />
        <Lin id="vr-folder" stops={[[0, '#E8CC90'], [1, '#C8A868']]} />
        <Lin id="vr-paper" stops={[[0, '#FFFBEE'], [1, '#E8DCC0']]} />
        <Lin id="vr-rainwin" stops={[[0, '#2A3A4A'], [1, '#4A5A6A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — corridoio di scaffali che si perde nel buio, finestra con le sbarre e la pioggia (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#vr-back)" />
          {[0, 1, 2].map((k) => {
            const s = 1 - k * 0.22, x0 = 540 - 420 * s, x1 = 540 + 420 * s;
            return <g key={k} opacity={0.35 + k * 0.1}>{[x0, x1].map((x) => <rect key={x} x={x - 30 * s} y={1100 - 600 * s} width={60 * s} height={600 * s} fill="#2A3430" />)}</g>;
          })}
          <rect x="600" y="660" width="220" height="260" fill="url(#vr-rainwin)" stroke={K} strokeWidth="9" />
          <svg x="600" y="660" width="220" height="260" viewBox="0 0 240 300"><Rain t={t} level="far" color="#9AB0C0" opacity={0.7} /></svg>
          <GlassDrops t={t} x={608} y={668} w={204} h={244} seed={3} n={8} color="#C8D8E0" />
          {[644, 688, 732, 776].map((x) => <path key={x} d={`M${x} 660 V920`} stroke="#1A1E1E" strokeWidth="12" />)}
          <path d="M600 790 H820" stroke="#1A1E1E" strokeWidth="10" />
          <rect x="590" y="916" width="240" height="20" fill="#4A5450" stroke={K} strokeWidth="5" />
          <Glow id="vr-win" x={710} y={790} r={260} t={t} color="#8AA8C0" amp={0.04} rate={1.2} opacity={0.3} />
        </g>

        {/* PIANO 1 — lo scaffale vicino con scatole e cartelle, la lampada a campana che oscilla (0,5) */}
        <g transform={L(0.5)}>
          <rect x="-200" y="640" width="760" height="600" fill="#141A18" />
          {[0, 1, 2, 3].map((row) => <g key={row}><rect x="-200" y={740 + row * 100} width="760" height="16" fill="url(#vr-shelf)" stroke={K} strokeWidth="4" /></g>)}
          {[-180, 540].map((x) => <rect key={x} x={x} y="640" width="22" height="620" fill="url(#vr-shelf)" stroke={K} strokeWidth="4" />)}
          {BOX.map((b, i) => {
            const x = -170 + b.col * 88, y = 740 + b.row * 100;
            return b.row % 2 ? (
              <g key={i}><rect x={x} y={y - 70} width={b.w * 0.9} height="70" fill={b.c} stroke={K} strokeWidth="3" /><rect x={x + 12} y={y - 54} width="30" height="16" fill="#F2E6D0" /></g>
            ) : (
              <g key={i}>{[0, 1, 2, 3].map((k) => <rect key={k} x={x + k * 18} y={y - 84 + (k % 2) * 6} width="16" height={84 - (k % 2) * 6} fill={['#C8B080', '#A88A58', '#D8C090', '#8A7048'][(k + i) % 4]} stroke={K} strokeWidth="2" />)}</g>
            );
          })}
          {/* lampada a campana */}
          <g transform={`rotate(${swing} 420 360)`}>
            <path d="M420 360 V660" stroke="#2A2A2A" strokeWidth="5" />
            <path d="M360 720 Q364 664 420 660 Q476 664 480 720 Z" fill="#3A5A44" stroke={K} strokeWidth="6" />
            <path d="M372 710 Q380 676 420 672" stroke="#8ABA9A" strokeWidth="4" fill="none" opacity=".6" />
            <ellipse cx="420" cy="722" rx="28" ry="10" fill="#FFF4C8" opacity={flick} />
            <path d="M370 724 L160 1220 H900 L470 724 Z" fill="#FFF0B0" opacity={0.1 * flick} />
            <Glow id="vr-lamp" x={420} y={740} r={420} t={t} color="#F4E8B0" amp={0.05} rate={3} opacity={0.55 * flick} />
          </g>
        </g>

        {/* PIANO 2 — lo schedario di metallo col cassetto che si apre (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1200 H1280 V2200 H-200 Z" fill="#1A1814" />
          <g transform="translate(990 980) scale(0.85)">
            <Ombra id="vr" x={0} y={0} rx={200} ry={20} />
            <rect x="-150" y="-460" width="300" height="460" fill="url(#vr-cab)" stroke={K} strokeWidth="8" />
            {[0, 1, 2, 3].map((k) => (
              <g key={k} transform={`translate(${k === 1 ? -40 * drawer : 0} 0)`}>
                <rect x="-136" y={-446 + k * 112} width="272" height="100" fill="url(#vr-cab)" stroke={K} strokeWidth="6" />
                <rect x="-40" y={-420 + k * 112} width="80" height="26" fill="#F2E6D0" stroke={K} strokeWidth="3" />
                <text x="0" y={-401 + k * 112} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="18" fill={K}>{['A–E', 'F–J', 'K–O', 'P–Z'][k]}</text>
                <rect x="-36" y={-382 + k * 112} width="72" height="16" rx="8" fill="url(#vr-steel)" stroke={K} strokeWidth="3" />
              </g>
            ))}
            <path d="M-130 -452 H130" stroke="#C8D8D0" strokeWidth="4" opacity=".5" />
          </g>
        </g>

        {/* PIANO 3 — il piano del tavolo visto dall'alto con la cartella FLECK, il timbro, il referto (0,95) */}
        <g transform={L(0.95)}>
          <path d="M-200 960 H1280 V1300 H-200 Z" fill="url(#vr-table)" stroke={K} strokeWidth="8" />
          <path d="M-200 966 H1280" stroke="#B88A5A" strokeWidth="5" opacity=".6" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M-200 ${1000 + i * 50} q400 ${i % 2 ? 10 : -10} 1480 0`} stroke="#3A2414" strokeWidth="3" fill="none" opacity=".5" />)}
          {/* la cartella aperta: due pagine e la copertina che gira sul dorso */}
          <Ombra id="vr" x={540} y={1236} rx={360} ry={26} />
          <rect x="540" y="970" width="340" height="250" rx="6" fill="url(#vr-folder)" stroke={K} strokeWidth="6" />
          <rect x="552" y="984" width="310" height="222" fill="url(#vr-paper)" stroke={K} strokeWidth="3" />
          <text x="707" y="1028" textAnchor="middle" fontFamily={TYPEWRITER} fontSize="30" fill={K}>FLECK, PENNY</text>
          {[1060, 1088, 1116, 1186].map((y, k) => <path key={y} d={`M580 ${y} H${830 - (k % 2) * 40}`} stroke="#7A6A4A" strokeWidth="5" strokeLinecap="round" />)}
          {stamped && (
            <g transform="translate(707 1140) rotate(-10)">
              <rect x="-130" y="-34" width="260" height="68" fill="none" stroke={P.accento} strokeWidth="8" />
              <text x="0" y="16" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="46" fill={P.accento}>ADOZIONE</text>
            </g>
          )}
          {/* la copertina: chiusa sulla pagina destra, gira sul dorso a sinistra */}
          <g transform={`translate(540 0) scale(${lerp(1, -1, open)} 1) translate(-540 0)`}>
            <rect x="540" y="966" width="350" height="258" rx="8" fill={open < 0.5 ? 'url(#vr-folder)' : '#C8A868'} stroke={K} strokeWidth="7" />
            {open < 0.5 && (
              <g>
                <rect x="760" y="990" width="110" height="40" rx="4" fill="#F2E6D0" stroke={K} strokeWidth="4" />
                <text x="815" y="1018" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="26" fill={K}>FLECK</text>
                <path d="M560 1200 H870" stroke="#E8D8A8" strokeWidth="4" opacity=".6" />
              </g>
            )}
          </g>
          <g opacity={seg(open, 0.5, 0.7)}>
            <rect x="200" y="970" width="340" height="250" rx="6" fill="url(#vr-folder)" stroke={K} strokeWidth="6" />
            <rect x="218" y="984" width="310" height="222" fill="url(#vr-paper)" stroke={K} strokeWidth="3" />
            <g transform="translate(300 1070) rotate(-6)">
              <rect x="-62" y="-72" width="124" height="144" fill="#F2EEE4" stroke={K} strokeWidth="5" />
              <rect x="-52" y="-62" width="104" height="100" fill="#7A6A54" />
              <path d="M-52 38 L-16 0 L12 22 L52 -24 V38 Z" fill="#5A4A3A" />
              <circle cx="24" cy="-34" r="13" fill="#C8B898" />
              <rect x="-24" y="-82" width="48" height="16" fill="#E8E0B0" opacity=".85" />
            </g>
            {[1010, 1040, 1070, 1100, 1130, 1160].map((y, k) => <path key={y} d={`M390 ${y} H${510 - (k % 3) * 18}`} stroke="#7A6A4A" strokeWidth="5" strokeLinecap="round" />)}
            <text x="300" y="1190" textAnchor="middle" fontFamily={HAND} fontSize="24" fill="#5A4A3A">ricovero 1958</text>
          </g>
          {/* il referto che scivola fuori sulla pagina sinistra */}
          <g transform={`translate(${lerp(540, 380, report)} ${lerp(1260, 1086, report)}) rotate(${lerp(6, -5, report)})`} opacity={seg(t, cues[2] + 0.1, cues[2] + 0.3)}>
            <rect x="-180" y="-110" width="360" height="220" fill="url(#vr-paper)" stroke={K} strokeWidth="6" />
            <text x="0" y="-68" textAnchor="middle" fontFamily={TYPEWRITER} fontSize="30" fill={K}>REFERTO MEDICO</text>
            <text x="-150" y="-26" fontFamily={TYPEWRITER} fontSize="24" fill="#3A3A3A">Arthur, 5 anni:</text>
            <text x="-150" y="8" fontFamily={TYPEWRITER} fontSize="24" fill="#3A3A3A">lividi, ferite</text>
            <text x="-150" y="42" fontFamily={TYPEWRITER} fontSize="24" fill="#3A3A3A">alla testa</text>
            <path d="M90 50 l24 24 m0 -24 l-24 24" stroke={P.accento} strokeWidth="7" />
          </g>
          {/* il timbro che cala sulla pagina destra */}
          <g transform={`translate(707 ${lerp(700, 1130, stamp) - 360 * lift})`} opacity={stamp > 0 && lift < 1 ? 1 : 0}>
            <rect x="-28" y="-150" width="56" height="100" rx="22" fill="url(#vr-wood)" stroke={K} strokeWidth="6" />
            <rect x="-90" y="-54" width="180" height="44" rx="6" fill="#3A3A3A" stroke={K} strokeWidth="6" />
          </g>
        </g>

        {/* PIANO 4 — scatoloni d'archivio in primo piano ai lati (1,2) */}
        <g transform={L(1.2)}>
          {[[-150, 1500, 380], [880, 1460, 360]].map(([x, y, w], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height="800" fill={['#A88A58', '#9A7A48'][i]} stroke={K} strokeWidth="10" />
              <path d={`M${x} ${y + 60} H${x + w}`} stroke={K} strokeWidth="6" />
              <rect x={x + w / 2 - 70} y={y + 90} width="140" height="70" fill="#F2E6D0" stroke={K} strokeWidth="5" />
              <text x={x + w / 2} y={y + 136} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="28" fill={K}>{['1958', '1960'][i]}</text>
              <path d={`M${x + 20} ${y + 8} H${x + w - 20}`} stroke="#D8B888" strokeWidth="5" opacity=".6" />
            </g>
          ))}
        </g>

        {/* PIANO 5 — pulviscolo nel cono della lampada, particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 740, x0: 370, x1: 470 }} bottom={{ y: 1200, x0: 380, x1: 900 }} seed={9} n={26} color="#F4E8B0" boost={flick} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="vr-near" t={t} color="#F4E8B0" n={6} opacity={0.08} />
        </g>
        <rect x="-200" y="-200" width="1480" height="2400" fill="#000" opacity={(1 - flick) * 0.3} />
      </g>
      <Finish id="vr" tint="#1E2A26" tintOpacity={0.15} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): cassetto cue0 + 0,2 · cartella aperta cue0 + 0,6 → 1,6 · timbro cue1 + 1,0 · referto cue2 + 0,2.
