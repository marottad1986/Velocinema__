import React from 'react';
import { camera, eio, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes, Smoke, StringLights, Wisps } from '../../lib/elements';
import type { SceneProps } from '../../types';

// I provini: bancone del caffè negli studi cinematografici, tazza fumante, copione con timbro "NO".
// Piani: cielo e teatri di posa oltre la vetrata (0,2–0,3) · parete con la vetrata e lampade (0,45)
//        · retrobanco con macchina dell'espresso (0,6) · bancone con tazza, copioni e timbro (1,0)
//        · zuccheriera e pianta in primo piano (1,25) · pulviscolo e particelle (1,7)
// Eventi: un altro copione cade sulla pila (cue 1 ≈ 2,9 s), il campanello suona (cue 2 ≈ 4,7 s),
//         il timbro "NO" si abbatte sul copione (cue 3 ≈ 6,65 s).

const K = '#1B1530';
const r = rng(2016);
const INK = '#C8453B';
const SPLAT = Array.from({ length: 9 }, () => ({ a: r() * Math.PI * 2, d: 90 + r() * 70, s: 4 + r() * 6 }));
const WIN = { x0: 110, x1: 970, y0: 590, y1: 1040 };

/** Copione schiacciato in prospettiva sul bancone (coordinate locali: foglio 300×400). */
const Script: React.FC<{ title?: boolean; page?: string }> = ({ title, page = '#F2C14E' }) => (
  <g>
    <rect x="-150" y="-200" width="300" height="400" rx="6" fill="#000" opacity=".25" transform="translate(10 14)" />
    <rect x="-150" y="-200" width="300" height="400" rx="6" fill={page} stroke={K} strokeWidth="9" />
    <rect x="-142" y="-192" width="284" height="384" rx="4" fill="none" stroke="#FFF2C4" strokeWidth="4" opacity=".6" />
    {[-150, -40, 70].map((y) => <circle key={y} cx="-118" cy={y} r="9" fill={K} />)}
    {title && <text x="12" y="-90" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="46" fill={K}>PROVINO</text>}
    {[-30, 0, 30, 60, 90, 120, 150].map((y, i) => <path key={y} d={`M-80 ${y} H${i % 3 === 2 ? 40 : 110}`} stroke={K} strokeWidth="6" opacity=".45" strokeLinecap="round" />)}
  </g>
);

export const Caffe: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const DROP = cues[1] ?? 2.9;
  const BELL = cues[2] ?? 4.72;
  const STAMP = cues[3] ?? 6.65;

  // copione che cade sulla pila
  const drop = seg(t, DROP - 0.35, DROP);
  const dropY = lerp(-520, 0, drop * drop);
  const dropSettle = eob(seg(t, DROP, DROP + 0.35));
  // campanello
  const bell = t >= BELL ? Math.exp(-(t - BELL) * 3.2) : 0;
  const bellHit = seg(t, BELL - 0.12, BELL) * (1 - seg(t, BELL, BELL + 0.12));
  // timbro: entra da destra, si abbatte, si rialza
  const tin = eio(seg(t, STAMP - 1.4, STAMP - 0.3));
  const down = seg(t, STAMP - 0.3, STAMP);
  const up = eo(seg(t, STAMP + 0.45, STAMP + 1.1));
  const away = eio(seg(t, STAMP + 0.8, STAMP + 1.8));
  const sx = lerp(1280, 460, tin) + 900 * away;
  const sy = lerp(-360, -200, tin) + 200 * down * down - 180 * up;
  const tilt = lerp(-25, 0, tin) + 12 * up;
  const mark = seg(t, STAMP, STAMP + 0.04);
  const shake = t > STAMP && t < STAMP + 0.3 ? Math.sin((t - STAMP) * 90) * 6 * (1 - (t - STAMP) / 0.3) : 0;
  const splat = seg(t, STAMP, STAMP + 0.45);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cf" />
        <Lin id="cf-sky" stops={[[0, '#B9AEE0'], [0.45, '#E9D6E0'], [0.8, '#FBE7BF'], [1, '#FFF1CF']]} />
        <Lin id="cf-stage" stops={[[0, '#E9DCCB'], [1, '#C9B8A8']]} />
        <Lin id="cf-wall" stops={[[0, '#2E2450'], [0.35, '#45366F'], [0.8, '#5A4787'], [1, '#4A3A72']]} />
        <Lin id="cf-back" stops={[[0, '#7A5A48'], [1, '#4A3428']]} />
        <Lin id="cf-top" stops={[[0, '#C99A6E'], [0.4, '#A87A54'], [1, '#7E5A3E']]} />
        <Lin id="cf-front" stops={[[0, '#5A3E30'], [0.5, '#45302A'], [1, '#2A1E1E']]} />
        <Lin id="cf-chrome" x2={1} y2={0} stops={[[0, '#8E8AA0'], [0.4, '#F0ECF6'], [0.6, '#C9C4D6'], [1, '#6E6884']]} />
        <GlowGradient id="cf-pool" color="#FFE7B0" core={0.55} mid={0.22} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo del mattino e teatri di posa oltre la vetrata (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="400" width="1480" height="800" fill="url(#cf-sky)" />
          <Glow id="cf-sun" x={240} y={660} r={300} t={t} color="#FFF0C4" amp={0.05} rate={1.3} opacity={0.8} />
          <circle cx="240" cy="660" r="54" fill="#FFF5D8" />
          {/* teatro di posa col tetto a botte */}
          <path d="M60 1060 V820 Q340 690 620 820 V1060 Z" fill="url(#cf-stage)" stroke="#8E7E92" strokeWidth="5" />
          <path d="M60 820 Q340 690 620 820" fill="none" stroke="#FFF6E2" strokeWidth="6" opacity=".8" />
          <text x="340" y="980" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="150" fill="#A895B8" opacity=".9">7</text>
          <rect x="420" y="960" width="120" height="100" fill="#9C8CA8" />
          {/* torre dell'acqua */}
          <path d="M560 1000 L590 760 M680 1000 L650 760 M570 900 L670 840 M570 840 L670 900" stroke="#8E7E92" strokeWidth="6" />
          <path d="M540 760 V670 Q620 630 700 670 V760 Z" fill="#E2D2C0" stroke="#8E7E92" strokeWidth="5" />
          <path d="M530 670 Q620 610 710 670" fill="#B9A6BC" stroke="#8E7E92" strokeWidth="5" />
          <text x="620" y="728" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="30" fill="#9C8CA8">STUDI</text>
        </g>

        {/* PIANO 1 — cartellone degli studi con le lampadine (0,3) */}
        <g transform={L(0.3)}>
          <rect x="660" y="775" width="300" height="110" rx="8" fill="#3C2E5E" stroke={K} strokeWidth="6" />
          <text x="810" y="822" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="40" fill="#F6F1E9">PROVINI</text>
          <text x="810" y="864" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="30" fill="#E8B4C4">OGGI · TEATRO 7</text>
          <StringLights id="cf-b1" t={t} from={{ x: 668, y: 767 }} to={{ x: 952, y: 767 }} n={10} sag={0} r={6} colors={['#FFE7A0', '#FFF6DC']} />
          <StringLights id="cf-b2" t={t + 1.3} from={{ x: 668, y: 881 }} to={{ x: 952, y: 881 }} n={10} sag={0} r={6} colors={['#FFF6DC', '#FFE7A0']} />
          <path d="M730 887 V1060 M890 887 V1060" stroke="#5A4C6E" strokeWidth="10" />
        </g>

        {/* PIANO 2 — parete con la vetrata, lampade a sospensione (0,45) */}
        <g transform={L(0.45)}>
          <path fillRule="evenodd" d={`M-200 -200 H1280 V1300 H-200 Z M${WIN.x0} ${WIN.y0} H${WIN.x1} V${WIN.y1} H${WIN.x0} Z`} fill="url(#cf-wall)" />
          <rect x={WIN.x0} y={WIN.y0} width={WIN.x1 - WIN.x0} height={WIN.y1 - WIN.y0} fill="none" stroke={K} strokeWidth="22" />
          <rect x={WIN.x0 + 10} y={WIN.y0 + 10} width={WIN.x1 - WIN.x0 - 20} height={WIN.y1 - WIN.y0 - 20} fill="none" stroke="#7E6AA8" strokeWidth="6" />
          <path d={`M540 ${WIN.y0} V${WIN.y1} M${WIN.x0} 760 H${WIN.x1}`} stroke={K} strokeWidth="14" />
          {/* riflessi sul vetro */}
          <path d="M180 1020 L330 620 M230 1020 L360 680 M640 1020 L780 640" stroke="#FFFFFF" strokeWidth="10" opacity=".14" />
          {/* scritta adesiva sul vetro */}
          <text x="325" y="725" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="44" fill="#F6F1E9" stroke={K} strokeWidth="3" paintOrder="stroke" opacity=".85">CAFFÈ DEGLI STUDI</text>
          {/* lampade a sospensione a destra (lontane dal titolo) */}
          {[780, 960].map((x, i) => {
            const sw = Math.sin(t * 0.9 + i) * 3;
            return (
              <g key={x} transform={`rotate(${sw} ${x} -200)`}>
                <path d={`M${x} -200 V${470 + i * 30}`} stroke={K} strokeWidth="5" />
                <Glow id={`cf-lamp${i}`} x={x} y={530 + i * 30} r={170} t={t} color="#FFD98A" amp={0.04} rate={2.2} ph={i} opacity={0.6} />
                <path d={`M${x - 56} ${520 + i * 30} Q${x} ${440 + i * 30} ${x + 56} ${520 + i * 30} Z`} fill="#C9A23E" stroke={K} strokeWidth="6" strokeLinejoin="round" />
                <ellipse cx={x} cy={522 + i * 30} rx="30" ry="8" fill="#FFF3C4" />
              </g>
            );
          })}
          {/* lavagna del menù a sinistra, sotto la vetrata */}
        </g>

        {/* fascio del mattino dalla vetrata con pulviscolo (0,5) */}
        <g transform={L(0.5)}>
          <Beam id="cf-beam" x={300} y={640} t={t} length={720} spread={520} angle={64} color="#FFE9B8" opacity={0.42} sweep={1.5} sweepRate={0.4} />
          <Dust t={t} top={{ y: 700, x0: 260, x1: 420 }} bottom={{ y: 1220, x0: 380, x1: 860 }} n={30} color="#FFF4D6" />
        </g>

        {/* PIANO 3 — retrobanco con macchina dell'espresso e tazze (0,6) */}
        <g transform={L(0.6)}>
          <rect x="-200" y="1040" width="1480" height="40" fill="url(#cf-back)" stroke={K} strokeWidth="7" />
          <path d="M-200 1046 H1280" stroke="#C99A6E" strokeWidth="4" opacity=".7" />
          {/* macchina dell'espresso */}
          <g transform="translate(840 1040) scale(.85)">
            <rect x="-120" y="-150" width="240" height="150" rx="14" fill="url(#cf-chrome)" stroke={K} strokeWidth="7" />
            <rect x="-120" y="-176" width="240" height="30" rx="8" fill="#6B4FA0" stroke={K} strokeWidth="6" />
            <circle cx="-60" cy="-100" r="18" fill="#F6F1E9" stroke={K} strokeWidth="5" />
            <path d="M-60 -100 l10 -8" stroke={K} strokeWidth="4" />
            <path d="M20 -60 H80 V-44 H20 Z M50 -44 V-28" fill="#4E4766" stroke={K} strokeWidth="5" />
            <path d="M-100 -130 V-20" stroke="#FFFFFF" strokeWidth="6" opacity=".5" />
          </g>
          <Smoke id="cf-steam" t={t} x={760} y={1010} color="#F6F1E9" n={7} rise={180} wind={-60} r0={14} r1={60} speed={0.45} opacity={0.65} />
          {/* tazze impilate e barattoli */}
          {[0, 1, 2].map((k) => <path key={k} d={`M${120} ${1040 - k * 30} h70 l-8 28 h-54 Z`} fill="#F6F1E9" stroke={K} strokeWidth="5" />)}
          <rect x="240" y="960" width="60" height="80" rx="8" fill="#B59A7A" stroke={K} strokeWidth="5" />
          <rect x="310" y="980" width="50" height="60" rx="8" fill="#8FCFB5" stroke={K} strokeWidth="5" />
        </g>

        {/* PIANO 4 — bancone con copioni, timbro, campanello e tazza (1,0) */}
        <g transform={`${L(1.0)} translate(0 ${shake * 0.4})`}>
          <path d="M-200 1110 H1280 V1330 H-200 Z" fill="url(#cf-top)" stroke={K} strokeWidth="9" />
          <path d="M-200 1118 H1280" stroke="#F2CFA0" strokeWidth="5" opacity=".7" />
          <ellipse cx="600" cy="1220" rx="380" ry="70" fill="url(#cf-pool)" opacity=".8" />
          <path d="M-200 1330 H1280 V2000 H-200 Z" fill="url(#cf-front)" stroke={K} strokeWidth="9" />
          {[-80, 80, 240, 400, 560, 720, 880, 1040].map((x) => <path key={x} d={`M${x} 1340 V2000`} stroke={K} strokeWidth="5" opacity=".6" />)}
          {[-60, 100, 260, 420, 580, 740, 900, 1060].map((x) => <path key={x} d={`M${x} 1350 V2000`} stroke="#7A5A48" strokeWidth="4" opacity=".5" />)}
          <path d="M-200 1760 H1280" stroke="#C9A23E" strokeWidth="18" strokeLinecap="round" />
          <path d="M-200 1754 H1280" stroke="#FFE7A0" strokeWidth="4" opacity=".7" />

          {/* pila di copioni: quello che cade arriva con la seconda frase */}
          <g transform="translate(390 1222) scale(1 .42) rotate(-10)">
            <g transform="translate(-14 26)"><Script page="#E8DCC4" /></g>
            <g transform="translate(-6 12)"><Script page="#EFE4CC" /></g>
            {drop > 0 && (
              <g transform={`translate(${lerp(40, 0, dropSettle)} ${dropY}) rotate(${lerp(14, 0, dropSettle)})`}>
                <Script title page="#F2C14E" />
                {/* il timbro NO */}
                {mark > 0 && (
                  <g transform="translate(20 70) rotate(-14)" opacity={0.9 * mark}>
                    <rect x="-110" y="-62" width="220" height="124" rx="12" fill="none" stroke={INK} strokeWidth="12" />
                    <text x="0" y="40" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="118" fill={INK}>NO</text>
                  </g>
                )}
              </g>
            )}
          </g>
          {/* schizzi d'inchiostro dal colpo */}
          {splat > 0 && splat < 1 && SPLAT.map((s, i) => (
            <circle key={i} cx={420 + Math.cos(s.a) * s.d * eo(splat)} cy={1240 + Math.sin(s.a) * s.d * 0.4 * eo(splat)} r={s.s * (1 - splat)} fill={INK} />
          ))}

          {/* campanello del bancone */}
          <g transform={`translate(160 1190) rotate(${Math.sin(t * 40) * 6 * bell} 0 0)`}>
            <ellipse cx="0" cy="14" rx="66" ry="14" fill="#000" opacity=".25" />
            <rect x="-62" y="-4" width="124" height="18" rx="6" fill="#4E4766" stroke={K} strokeWidth="6" />
            <path d="M-50 -4 Q-50 -66 0 -66 Q50 -66 50 -4 Z" fill="url(#cf-chrome)" stroke={K} strokeWidth="7" />
            <path d={`M0 -66 V${-84 + bellHit * 8}`} stroke={K} strokeWidth="8" />
            <circle cx="0" cy={-88 + bellHit * 8} r="10" fill="#C9C4D6" stroke={K} strokeWidth="5" />
            <path d="M-30 -48 Q-24 -60 -10 -62" fill="none" stroke="#FFFFFF" strokeWidth="5" opacity=".8" />
          </g>
          {bell > 0.05 && (
            <g fill="none" stroke="#FFF6DC" strokeWidth="7" strokeLinecap="round" opacity={bell}>
              {[0, 1, 2].map((k) => {
                const R = 90 + k * 26 + (1 - bell) * 40;
                return <path key={k} d={`M${160 - R * 0.7} ${1150 - R * 0.6} A${R} ${R} 0 0 1 ${160 + R * 0.7} ${1150 - R * 0.6}`} />;
              })}
            </g>
          )}

          {/* tazza fumante col piattino */}
          <g transform="translate(760 1214)">
            <ellipse cx="0" cy="18" rx="120" ry="26" fill="#000" opacity=".25" />
            <ellipse cx="0" cy="8" rx="112" ry="24" fill="#F6F1E9" stroke={K} strokeWidth="7" />
            <path d="M-70 -110 Q-72 -10 -40 4 Q0 14 40 4 Q72 -10 70 -110 Z" fill="#F6F1E9" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M70 -86 Q120 -86 112 -50 Q104 -20 62 -26" fill="none" stroke={K} strokeWidth="16" />
            <path d="M70 -86 Q120 -86 112 -50 Q104 -20 62 -26" fill="none" stroke="#F6F1E9" strokeWidth="7" />
            <ellipse cx="0" cy="-110" rx="70" ry="16" fill="#5A3A28" stroke={K} strokeWidth="7" />
            <ellipse cx="-12" cy="-112" rx="30" ry="6" fill="#B07A4E" opacity=".8" />
            <path d="M-70 -72 Q0 -60 70 -72" fill="none" stroke="#6B4FA0" strokeWidth="14" />
            <path d="M-56 -100 Q-58 -40 -36 -8" fill="none" stroke="#FFFFFF" strokeWidth="6" opacity=".7" strokeLinecap="round" />
          </g>
          <Wisps t={t} x={760} y={1094} color="#FFFFFF" n={3} h={260} width={8} opacity={0.75} />
          <Smoke id="cf-cup" t={t} x={760} y={1080} color="#FFF8EC" n={6} rise={220} wind={30} r0={18} r1={70} speed={0.38} opacity={0.6} />
          {/* cucchiaino e bustine di zucchero */}
          <path d="M560 1290 L660 1262" stroke={K} strokeWidth="12" strokeLinecap="round" />
          <path d="M560 1290 L660 1262" stroke="#D9D4E4" strokeWidth="5" strokeLinecap="round" />
          <rect x="930" y="1240" width="60" height="30" rx="4" fill="#F6F1E9" stroke={K} strokeWidth="5" transform="rotate(12 960 1255)" />
          <rect x="960" y="1270" width="60" height="30" rx="4" fill="#E79AB0" stroke={K} strokeWidth="5" transform="rotate(-8 990 1285)" />

          {/* il timbro (di legno, col tampone d'inchiostro) */}
          <g transform={`translate(${sx} ${1238 + sy}) rotate(${tilt})`}>
            <path d="M-70 0 H70 V-36 H-70 Z" fill="#7E5A3E" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <rect x="-72" y="-6" width="144" height="12" fill={INK} stroke={K} strokeWidth="5" />
            <path d="M-18 -36 V-110 H18 V-36 Z" fill="#A87A54" stroke={K} strokeWidth="7" />
            <ellipse cx="0" cy="-130" rx="40" ry="30" fill="#C99A6E" stroke={K} strokeWidth="7" />
            <path d="M-20 -142 Q-6 -156 12 -150" fill="none" stroke="#F2CFA0" strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 5 — zuccheriera e pianta in primo piano ai bordi (1,25) */}
        <g transform={L(1.25)}>
          <g transform="translate(1040 1420)">
            <path d="M-80 0 V-170 Q-80 -190 -60 -190 H60 Q80 -190 80 -170 V0 Z" fill="#E9F0F2" opacity=".55" stroke={K} strokeWidth="9" />
            <path d="M-80 -60 H80 V0 H-80 Z" fill="#F6F1E9" stroke={K} strokeWidth="7" />
            <path d="M-60 -190 V-230 H60 V-190" fill="#D9D4E4" stroke={K} strokeWidth="8" />
            <path d="M-56 -170 V-20" stroke="#FFFFFF" strokeWidth="7" opacity=".8" />
          </g>
          <g transform={`rotate(${Math.sin(t * 0.8) * 2} -40 1900)`}>
            {[[-40, 1900, -60, 1280], [-20, 1900, 120, 1360], [-60, 1900, 200, 1520], [-80, 1900, -10, 1500]].map(([x0, y0, x1, y1], i) => (
              <path key={i} d={`M${x0} ${y0} Q${(x0 + x1) / 2 + 80} ${(y0 + y1) / 2} ${x1} ${y1} Q${(x0 + x1) / 2 - 40} ${(y0 + y1) / 2 + 40} ${x0} ${y0} Z`} fill={i % 2 ? '#3E6A4E' : '#4E7E5A'} stroke={K} strokeWidth="8" strokeLinejoin="round" />
            ))}
          </g>
          <rect x="-200" y="1800" width="460" height="200" fill="#C46A44" stroke={K} strokeWidth="9" />
        </g>

        {/* sgabelli del bancone, in basso (1,35) */}
        <g transform={L(1.35)}>
          {[330, 860].map((x) => (
            <g key={x}>
              <path d={`M${x - 70} 1700 L${x - 110} 2000 M${x + 70} 1700 L${x + 110} 2000`} stroke={K} strokeWidth="22" strokeLinecap="round" />
              <path d={`M${x - 70} 1700 L${x - 110} 2000 M${x + 70} 1700 L${x + 110} 2000`} stroke="#C9C4D6" strokeWidth="10" strokeLinecap="round" />
              <path d={`M${x - 92} 1860 H${x + 92}`} stroke="#C9A23E" strokeWidth="12" strokeLinecap="round" />
              <path d={`M${x - 150} 1660 Q${x} 1610 ${x + 150} 1660 V1690 Q${x} 1730 ${x - 150} 1690 Z`} fill="#6B4FA0" stroke={K} strokeWidth="9" strokeLinejoin="round" />
              <path d={`M${x - 120} 1654 Q${x} 1626 ${x + 120} 1654`} fill="none" stroke="#A58AD0" strokeWidth="6" strokeLinecap="round" />
            </g>
          ))}
        </g>

        {/* PIANO 6 — particelle vicine (1,7) */}
        <g transform={L(1.7)}>
          <NearMotes id="cf-near" t={t} color="#FFF0D0" n={7} opacity={0.12} />
        </g>
      </g>

      <Finish id="cf" tint="#F2C14E" tintOpacity={0.12} />
    </svg>
  );
};
