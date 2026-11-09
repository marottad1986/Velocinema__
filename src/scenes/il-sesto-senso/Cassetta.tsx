import React from 'react';
import { camera, eio, eo, lerp, rng, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K, Ombra, SestoDefs } from './Comuni';

// La verità nella cassetta: il soggiorno di casa Collins il giorno del funerale, luce grigia dalla finestra. Al centro
// il televisore a tubo sul mobile con il videoregistratore; accanto i gigli bianchi con il nastro nero; davanti la
// videocassetta di Kyra.
// Eventi: 1ª frase la videocassetta scivola nel videoregistratore e si accende la spia; 2ª frase lo schermo passa dal
// rumore a un'immagine: una scodella di minestra e accanto una bottiglia di detersivo da cui cadono gocce dentro la
// scodella (il veleno, senza persone); 3ª frase l'immagine si ferma con il segno di pausa, una luce calda entra dalla
// finestra (il padre ha capito e salva la sorellina). Nessuna persona.
// Piani: parete e finestra (0,3) · mobile con i gigli (0,5) · televisore e videoregistratore (0,7)
//        · bracciolo della poltrona e corona di fiori in primo piano (1,2) · pulviscolo (1,5–1,8)

const noise = (() => {
  const r = rng(77);
  return Array.from({ length: 140 }, () => ({ x: r(), y: r(), w: 6 + r() * 30, k: r() }));
})();

export const Cassetta: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const ins = eio(seg(t, griglia(cues[0] + 0.6), griglia(cues[0] + 0.6) + 1.0));
  const on = seg(t, griglia(cues[0] + 1.6), griglia(cues[0] + 1.7));
  const img = eo(seg(t, griglia(cues[1] + 0.3), griglia(cues[1] + 0.3) + 0.6));
  const drop = (t - cues[1]) > 0.8 ? ((t - cues[1] - 0.8) * 1.4) % 1 : -1;
  const pause = seg(t, griglia(cues[2] + 0.4), griglia(cues[2] + 0.5));
  const warm = eo(seg(t, griglia(cues[2] + 0.4), griglia(cues[2] + 0.4) + 1.6));
  const SX = 350, SY = 800, SW = 380, SH = 290; // schermo
  const frame = Math.floor(t * 15);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ca" />
        <SestoDefs id="ca" />
        <Lin id="ca-wall" stops={[[0, '#1A1E22'], [0.4, '#3A3E40'], [0.75, '#4A4A46'], [1, '#262624']]} />
        <Lin id="ca-day" stops={[[0, '#A8B4BC'], [1, '#D8DCD8']]} />
        <Lin id="ca-floor" stops={[[0, '#4A3A2E'], [0.5, '#2A2018'], [1, '#0A0806']]} />
        <Lin id="ca-tv" x2={1} y2={0} stops={[[0, '#3A2414'], [0.4, '#7A5434'], [1, '#2A1A0C']]} />
        <Lin id="ca-black" x2={1} y2={0} stops={[[0, '#141618'], [0.5, '#3A3E42'], [1, '#101214']]} />
        <Lin id="ca-arm" x2={1} y2={0} stops={[[0, '#3A2A3A'], [0.5, '#6A4E62'], [1, '#2A1E2A']]} />
        <radialGradient id="ca-screen" cx=".5" cy=".45" r=".7"><stop offset="0" stopColor="#E8F0E8" /><stop offset="1" stopColor="#7A8A86" /></radialGradient>
        <radialGradient id="ca-curve" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".25" /><stop offset=".5" stopColor="#FFFFFF" stopOpacity="0" /></radialGradient>
        <linearGradient id="ca-sun" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE8B8" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFE8B8" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete e finestra con la luce grigia del giorno del funerale (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ca-wall)" />
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-160 + i * 104} 620 V1080`} stroke="#5A5650" strokeWidth="5" opacity=".25" />)}
          <rect x="800" y="640" width="200" height="380" fill="url(#ca-day)" stroke={K} strokeWidth="9" />
          <rect x="800" y="640" width="200" height="380" fill="#FFE2A8" opacity={0.5 * warm} />
          <path d="M900 640 V1020 M800 830 H1000" stroke="#5A5A56" strokeWidth="9" />
          <path d="M780 620 H830 Q824 830 840 1040 H770 Z M980 620 H1030 V1040 H990 Q978 830 980 620 Z" fill="#4A4A5A" stroke={K} strokeWidth="6" />
          <Glow id="ca-win" x={900} y={820} r={300} t={t} color={warm > 0 ? '#FFE8B8' : '#D8E0E4'} amp={0.03} rate={1} opacity={0.35 + 0.35 * warm} />
          <path d="M-200 1090 H1280" stroke="#2A2420" strokeWidth="16" />
        </g>

        {/* PIANO 1 — mobile con i gigli bianchi e il nastro nero (0,5) */}
        <g transform={L(0.5)}>
          <path d="M-200 1100 H1280 V2200 H-200 Z" fill="url(#ca-floor)" />
          <path d="M800 1020 L1040 1100 L600 1700 L380 1700 Z" fill="url(#ca-sun)" opacity={warm} />
          <Ombra id="ca" x={110} y={1180} rx={170} ry={18} />
          <rect x="-20" y="960" width="260" height="210" fill="url(#ca-wood)" stroke={K} strokeWidth="8" />
          <rect x="-34" y="944" width="288" height="22" fill="#5A3E2A" stroke={K} strokeWidth="6" />
          <g transform="translate(110 944)">
            <path d="M-36 0 Q-50 -60 -30 -100 H30 Q50 -60 36 0 Z" fill="#E8ECEC" stroke={K} strokeWidth="6" />
            {[[-70, -230, -30], [-10, -270, 0], [50, -240, 25], [-40, -180, -40], [70, -180, 40]].map(([x, y, r], i) => (
              <g key={i}>
                <path d={`M0 -100 Q${x * 0.4} ${(y - 100) / 2} ${x} ${y + 30}`} stroke="#3A5A2A" strokeWidth="6" fill="none" />
                <g transform={`translate(${x} ${y}) rotate(${r})`}>
                  {[0, 72, 144, 216, 288].map((a) => <path key={a} transform={`rotate(${a})`} d="M0 0 Q-12 -20 0 -44 Q12 -20 0 0 Z" fill="#F4F2EA" stroke={K} strokeWidth="4" />)}
                  <circle r="6" fill="#E8C060" />
                </g>
              </g>
            ))}
            {/* nastro nero */}
            <path d="M-36 -60 Q0 -50 36 -60 V-44 Q0 -34 -36 -44 Z" fill="#14100E" stroke={K} strokeWidth="3" />
            <path d="M0 -50 L-24 10 L-10 6 L-4 20 Z M0 -50 L22 8 L8 6 L4 20 Z" fill="#14100E" stroke={K} strokeWidth="3" />
          </g>
        </g>

        {/* PIANO 2 — il televisore a tubo e il videoregistratore (0,7) */}
        <g transform={L(0.7)} strokeLinejoin="round">
          <Ombra id="ca" x={540} y={1300} rx={330} ry={26} />
          {/* mobiletto */}
          <rect x="250" y="1150" width="580" height="150" fill="url(#ca-tv)" stroke={K} strokeWidth="9" />
          <path d="M256 1156 H824" stroke="#C89A6A" strokeWidth="4" opacity=".6" />
          {/* videoregistratore */}
          <rect x="330" y="1172" width="420" height="80" rx="6" fill="url(#ca-black)" stroke={K} strokeWidth="6" />
          <rect x="390" y="1194" width="200" height="22" rx="3" fill="#060606" stroke="#5A5E62" strokeWidth="3" />
          <rect x="620" y="1192" width="100" height="26" rx="3" fill="#0A1A12" stroke="#3A3E42" strokeWidth="3" />
          <text x="670" y="1212" fill="#5AE88A" opacity={on} fontFamily="monospace" fontWeight={700} fontSize="20" textAnchor="middle">{pause > 0 ? 'PAUSE' : on > 0 ? 'PLAY' : ''}</text>
          <circle cx="360" cy="1230" r="6" fill={on > 0 ? '#E83A3A' : '#3A1A1A'} />
          {/* la videocassetta che entra */}
          <g transform={`translate(${490} ${lerp(1330, 1205, ins)})`} opacity={1 - seg(ins, 0.85, 1)}>
            <rect x="-96" y="-18" width="192" height="110" rx="5" fill="#1A1A1C" stroke={K} strokeWidth="6" />
            <rect x="-70" y="10" width="140" height="44" fill="url(#ca-paper)" stroke={K} strokeWidth="3" />
            <path d="M-56 24 H40 M-56 38 H20" stroke="#3A3428" strokeWidth="4" />
            {[-40, 40].map((x) => <circle key={x} cx={x} cy="72" r="10" fill="#0A0A0A" stroke="#5A5A5A" strokeWidth="3" />)}
          </g>
          {/* televisore */}
          <rect x="280" y="740" width="520" height="400" rx="26" fill="url(#ca-tv)" stroke={K} strokeWidth="10" />
          <path d="M296 760 Q300 744 320 744 H760" stroke="#C89A6A" strokeWidth="5" fill="none" opacity=".6" />
          <rect x={SX - 12} y={SY - 12} width={SW + 24} height={SH + 24} rx="34" fill="#0A0A0A" stroke={K} strokeWidth="6" />
          <clipPath id="ca-clip"><rect x={SX} y={SY} width={SW} height={SH} rx="28" /></clipPath>
          <g clipPath="url(#ca-clip)">
            <rect x={SX} y={SY} width={SW} height={SH} fill="#0E1210" />
            {/* rumore dello schermo */}
            <g opacity={on * (1 - img)}>
              {noise.map((n, i) => {
                const k = (n.k + frame * 0.37) % 1;
                return <rect key={i} x={SX + ((n.x + frame * 0.13 * (i % 3)) % 1) * SW} y={SY + ((n.y + k) % 1) * SH} width={n.w} height="5" fill={k > 0.5 ? '#E8ECE8' : '#5A605C'} />;
              })}
            </g>
            {/* l'immagine: la scodella di minestra e la bottiglia di detersivo */}
            <g opacity={img}>
              <rect x={SX} y={SY} width={SW} height={SH} fill="url(#ca-screen)" />
              <rect x={SX} y={SY + SH * 0.62} width={SW} height={SH * 0.38} fill="#A8A08A" />
              <path d={`M${SX} ${SY + SH * 0.62} H${SX + SW}`} stroke="#6A6450" strokeWidth="4" />
              <g transform={`translate(${SX + 150} ${SY + 210})`}>
                <ellipse cx="0" cy="0" rx="82" ry="22" fill="#E8D8A0" stroke="#2A2A22" strokeWidth="5" />
                <path d="M-82 0 Q-70 54 0 58 Q70 54 82 0" fill="#F2F0E8" stroke="#2A2A22" strokeWidth="5" />
                <path d="M-50 -4 q20 -8 40 0 M10 2 q16 -6 30 2" stroke="#C8A050" strokeWidth="5" fill="none" />
                <path d="M60 -10 L130 -60" stroke="#C8C8C8" strokeWidth="7" strokeLinecap="round" />
              </g>
              {/* flacone di detersivo appoggiato sul tavolo, col beccuccio piegato sopra la scodella */}
              <g transform={`translate(${SX + 275} ${SY + 230})`}>
                <path d="M-34 0 V-120 Q-34 -142 -14 -148 V-166 H14 V-148 Q34 -142 34 -120 V0 Z" fill="#5AA8C8" stroke="#2A2A22" strokeWidth="5" />
                <path d="M-6 -166 Q-10 -200 -50 -196 L-74 -188" stroke="#2A2A22" strokeWidth="14" fill="none" strokeLinecap="round" />
                <path d="M-6 -166 Q-10 -200 -50 -196 L-74 -188" stroke="#E8E8E8" strokeWidth="7" fill="none" strokeLinecap="round" />
                <rect x="-24" y="-100" width="48" height="56" fill="#F2F0E8" stroke="#2A2A22" strokeWidth="3" />
                <path d="M-12 -84 L12 -58 M12 -84 L-12 -58" stroke="#2A2A22" strokeWidth="4" />
                <path d="M-24 -130 V-10" stroke="#FFFFFF" strokeWidth="4" opacity=".4" />
              </g>
              {/* le gocce che cadono nella scodella */}
              {drop >= 0 && pause === 0 && [0, 0.5].map((o) => {
                const d = (drop + o) % 1;
                return <ellipse key={o} cx={SX + 200} cy={SY + 46 + d * 150} rx="6" ry="9" fill="#7AC8E8" stroke="#2A2A22" strokeWidth="2" />;
              })}
              <path d={`M${SX} ${SY + 40} H${SX + SW}`} stroke="#FFFFFF" strokeWidth="3" opacity={0.15 + 0.1 * Math.sin(t * 9)} />
              {/* segno di pausa */}
              <g opacity={pause}>
                <rect x={SX + 20} y={SY + 20} width="16" height="40" fill="#FFFFFF" />
                <rect x={SX + 44} y={SY + 20} width="16" height="40" fill="#FFFFFF" />
              </g>
            </g>
            {/* righe del tubo */}
            {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${SX} ${SY + i * 10} H${SX + SW}`} stroke="#000" strokeWidth="2" opacity=".15" />)}
            <rect x={SX} y={SY} width={SW} height={SH} fill="url(#ca-curve)" />
          </g>
          <Glow id="ca-screenglow" x={SX + SW / 2} y={SY + SH / 2} r={380} t={t} color="#C8E0E8" amp={0.08} rate={10} opacity={0.45 * on} />
          {/* manopole e altoparlante */}
          <rect x={SX + SW + 26} y={SY + 10} width="34" height="270" rx="6" fill="#1A120A" stroke={K} strokeWidth="4" />
          {[0, 1].map((i) => <circle key={i} cx={SX + SW + 43} cy={SY + 40 + i * 60} r="13" fill="url(#ca-brass)" stroke={K} strokeWidth="4" />)}
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${SX + SW + 32} ${SY + 160 + i * 18} h22`} stroke="#0A0604" strokeWidth="5" />)}
          {/* antenna */}
          <path d="M540 740 L470 640 M540 740 L620 650" stroke={K} strokeWidth="7" strokeLinecap="round" />
          <path d="M540 740 L470 640 M540 740 L620 650" stroke="#A8B0B8" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* PIANO 3 — bracciolo della poltrona a sinistra e corona di fiori a destra, in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1520 Q-20 1460 160 1520 Q200 1540 190 1600 V2000 H-200 Z" fill="url(#ca-arm)" stroke={K} strokeWidth="10" />
          <path d="M-180 1530 Q-20 1476 150 1530" stroke="#A88AA0" strokeWidth="6" fill="none" opacity=".6" />
          {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-120 + i * 52} cy={1600} r="7" fill="#1A121A" />)}
          <g transform="translate(980 1620)">
            <path d="M-60 120 L-130 400 M60 120 L130 400 M0 160 V420" stroke={K} strokeWidth="18" strokeLinecap="round" />
            <path d="M-60 120 L-130 400 M60 120 L130 400 M0 160 V420" stroke="#5A3E2A" strokeWidth="9" strokeLinecap="round" />
            <circle r="170" fill="none" stroke="#2A4A22" strokeWidth="60" />
            <circle r="170" fill="none" stroke={K} strokeWidth="4" />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <circle key={i} cx={Math.cos(a) * 170} cy={Math.sin(a) * 170} r="26" fill="#F4F2EA" stroke={K} strokeWidth="5" />;
            })}
            <path d="M-120 120 L-160 260 L-120 240 L-110 280 L-80 140 Z" fill="#14100E" />
          </g>
        </g>

        {/* PIANO 4 — pulviscolo nella luce della finestra (1,5) e particelle vicine (1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 900, x0: 760, x1: 1000 }} bottom={{ y: 1500, x0: 420, x1: 900 }} seed={10} n={18} color="#F2ECDC" boost={0.2 * warm} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="ca-near" t={t} color="#E8E4DC" n={5} opacity={0.07} />
        </g>
      </g>
      <Finish id="ca" tint="#3A4048" tintOpacity={0.12} />
    </svg>
  );
};
