import React from 'react';
import { camera, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY, HAND } from '../../lib/fonts';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';

// L'incendio: finestra di un palazzo in fiamme di notte; scatola di fiammiferi "A. Laeddis" che entra in scena.
// Piani: cielo + bagliore (0,2) · skyline lontano (0,4) · fumo alto (0,45) · palazzo, strada, fiamme, fumo basso (0,65–0,7)
//        · marciapiede vicino, lampione, scatola di fiammiferi (1,1–1,15) · braci davanti alla camera (1,7)

const K = '#0A0F12';
const WIN_W = 110;
const WIN_H = 130;
const COLS = [190, 370, 560, 750];
const ROWS = [650, 830, 1010];
// finestra in fiamme (riga 1, colonna 2)
const FIRE = { x: 560, y: 830 };
const FC = { x: FIRE.x + WIN_W / 2, y: FIRE.y + WIN_H / 2 };
const STREET_Y = 1170;

const r = rng(1952);
const STARS = Array.from({ length: 18 }, () => ({ x: r() * 1180 - 50, y: 90 + r() * 420, s: 1.5 + r() * 2.5, rate: 1 + r() * 2.5, ph: r() * 6 }));
const EMBERS = Array.from({ length: 38 }, () => ({
  x0: FIRE.x + 10 + r() * (WIN_W - 20), sp: 0.16 + r() * 0.22, ph: r(), sway: 14 + r() * 36, s: 2 + r() * 3.5, drift: 40 + r() * 190, hot: r() > 0.45,
}));
const NEAR = Array.from({ length: 9 }, () => ({ x: r() * 1080, sp: 60 + r() * 70, ph: r() * 1600, rad: 18 + r() * 26, sway: r() * 6 }));
// finestre lontane dello skyline
const FAR_WIN = Array.from({ length: 26 }, () => ({ x: r() * 1300 - 110, y: 900 + r() * 220, on: r() > 0.55 }));

/** Lingua di fuoco: goccia con lati ondulati e punta che oscilla (funzione pura di t). */
const flame = (x: number, y: number, w: number, h: number, t: number, ph: number) => {
  const s1 = Math.sin(t * 6.3 + ph);
  const s2 = Math.sin(t * 4.1 + ph * 1.7);
  const s3 = Math.sin(t * 8.7 + ph * 0.6);
  const hh = h * (1 + 0.1 * s3);
  const tx = x + s1 * w * 0.5;
  return (
    `M${x - w} ${y} C${x - w * 1.15} ${y - hh * 0.35} ${x - w * 0.35 + s2 * w * 0.3} ${y - hh * 0.55} ${x - w * 0.25 + s2 * w * 0.2} ${y - hh * 0.72} ` +
    `Q${tx - w * 0.1} ${y - hh * 0.86} ${tx} ${y - hh} Q${x + w * 0.35 + s1 * w * 0.2} ${y - hh * 0.7} ${x + w * 0.55} ${y - hh * 0.5} ` +
    `C${x + w * 1.1} ${y - hh * 0.3} ${x + w * 1.05} ${y - hh * 0.1} ${x + w} ${y} Q${x} ${y + w * 0.35} ${x - w} ${y} Z`
  );
};
// lingue di fuoco della finestra: [dx, larghezza, altezza, fase]
const TONGUES: [number, number, number, number][] = [
  [-12, 24, 210, 0], [14, 36, 300, 1.3], [42, 44, 370, 2.6], [72, 46, 390, 3.9], [100, 38, 320, 5.1], [124, 26, 230, 0.7],
];

export const Incendio: React.FC<SceneProps> = ({ t, dur, palette: P }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  // Tremolio del fuoco: somma di sinusoidi lente (nessun lampo)
  const fl = 0.8 + 0.1 * Math.sin(t * 7.1) + 0.06 * Math.sin(t * 12.7 + 1) + 0.04 * Math.sin(t * 3.3 + 2);
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
  const grow = lerp(0.85, 1.05, seg(t, 0, dur));

  // Scatola di fiammiferi: entra da destra quando la voce dice «Andrew Laeddis» (~4,4 s)
  const bp = eob(seg(t, 4.2, 5.0), 1.3);
  const bx = lerp(1460, 740, bp);
  const brot = lerp(26, -6, bp);
  const landed = seg(t, 4.85, 5.0);
  const puff = seg(t, 4.85, 5.9);

  const winFill = (x: number, y: number) => {
    const d = Math.hypot(x + WIN_W / 2 - FC.x, y + WIN_H / 2 - FC.y);
    return Math.max(0, 1 - d / 520);
  };

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="in" />
        <Lin id="in-sky" stops={[[0, '#060C10'], [0.28, '#0E1E25'], [0.46, '#22292B'], [0.58, '#3D2E27'], [0.66, '#1A2226']]} />
        <Lin id="in-facade" x2={1} y2={0} stops={[[0, '#3E4744'], [0.45, '#6D7470'], [0.62, '#7E7D74'], [1, '#4A4F4B']]} />
        <Lin id="in-left" x2={1} y2={0} stops={[[0, '#1A2428'], [1, '#2E3B3E']]} />
        <Lin id="in-right" x2={1} y2={0} stops={[[0, '#3A3A36'], [0.4, '#2A3133'], [1, '#172024']]} />
        <Lin id="in-street" stops={[[0, '#2A2C2B'], [0.5, '#1A2124'], [1, '#0E1518']]} />
        <Lin id="in-near" stops={[[0, '#262A2A'], [0.3, '#161D20'], [1, '#070C0E']]} />
        <Lin id="in-room" stops={[[0, '#FFF1C2'], [0.4, '#FFB54A'], [1, '#E2541E']]} />
        <Lin id="in-soot" stops={[[0, '#0B0C0C', 0], [0.5, '#0B0C0C', 0.45], [1, '#0B0C0C', 0.8]]} />
        <Lin id="in-pole" x2={1} y2={0} stops={[[0, '#0E1518'], [0.45, '#3A4A4E'], [1, '#0A1013']]} />
        <Lin id="in-cone" stops={[[0, '#CFE6EA', 0.3], [1, '#CFE6EA', 0]]} />
        <Lin id="in-paper" stops={[[0, '#F6F0E2'], [1, '#D8CDB6']]} />
        <Lin id="in-striker" stops={[[0, '#6B4532'], [1, '#3A2418']]} />
        <GlowGradient id="in-fire" color="#FF8A3C" core={0.85} mid={0.32} />
        <GlowGradient id="in-hot" color="#FFD27A" core={0.95} mid={0.4} />
        <GlowGradient id="in-skyglow" color="#D0602E" core={0.6} mid={0.24} />
        <GlowGradient id="in-lamp" color="#CFE6EA" core={0.7} mid={0.22} />
        <GlowGradient id="in-smoke" color="#2E2D2C" core={0.95} mid={0.7} />
        <GlowGradient id="in-smoke2" color="#4A4440" core={0.95} mid={0.65} />
        <GlowGradient id="in-smokelit" color="#B8643A" core={0.75} mid={0.3} />
        <GlowGradient id="in-ember" color="#FFB04A" core={0.9} mid={0.35} />
        <GlowGradient id="in-accent" color={P.accento} core={0.6} mid={0.22} />
        <GlowGradient id="in-ash" color="#B9A99A" core={0.7} mid={0.3} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo con il bagliore dell'incendio (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#in-sky)" />
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#E9F0F2" opacity={0.1 + 0.45 * (0.5 + 0.5 * Math.sin(t * s.rate + s.ph))} />
          ))}
          <ellipse cx="660" cy="700" rx={560 + pulse * 30} ry={360 + pulse * 20} fill="url(#in-skyglow)" opacity={0.85 * fl} />
        </g>

        {/* PIANO 1 — skyline lontano senza contorno (0,4) */}
        <g transform={L(0.4)}>
          <path d="M-200 1180 V930 H-60 V880 H40 V960 H130 V860 H170 V820 H200 V860 H260 V1180 Z M820 1180 V900 H900 V840 H960 V900 H1040 V950 H1120 V870 H1200 V1180 Z" fill="#14232A" />
          {FAR_WIN.filter((w) => w.on && (w.x < 250 || w.x > 830)).map((w, i) => (
            <rect key={i} x={w.x} y={w.y} width="10" height="14" fill="#E8B65A" opacity={0.35 + 0.15 * Math.sin(t * 0.8 + i)} />
          ))}
        </g>

        {/* PIANO 1b — fumo alto e scuro che sale oltre il tetto (0,45) */}
        <g transform={L(0.45)}>
          {Array.from({ length: 12 }, (_, i) => {
            const p = mod(t * 0.09 + i / 12, 1);
            const cx = 690 + p * 420 + Math.sin(p * 5 + i) * 30;
            const cy = 650 - p * 560;
            const rad = 70 + p * 190;
            const o = seg(p, 0, 0.12) * (1 - p) * 0.9;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={rad} fill="url(#in-smoke)" opacity={o} />
                <circle cx={cx - rad * 0.15} cy={cy + rad * 0.35} r={rad * 0.7} fill="url(#in-smokelit)" opacity={o * 0.55 * fl} />
              </g>
            );
          })}
        </g>

        {/* PIANO 2 — il palazzo in fiamme, i vicini e la strada (0,65) */}
        <g transform={L(0.65)}>
          {/* palazzo di sinistra, in ombra */}
          <rect x="-220" y="700" width="350" height="500" fill="url(#in-left)" stroke={K} strokeWidth="8" />
          {[-150, -40].map((x) => [760, 900, 1040].map((y, j) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="70" height="96" fill={x === -40 && j === 1 ? '#E8B65A' : '#121B1F'} stroke={K} strokeWidth="5" />
          )))}
          <path d="M126 704 V1196" stroke="#C88A5A" strokeWidth="4" opacity={0.35 * fl} />

          {/* palazzo di destra con serbatoio d'acqua sul tetto */}
          <rect x="950" y="770" width="360" height="430" fill="url(#in-right)" stroke={K} strokeWidth="8" />
          <path d="M954 774 V1196" stroke="#D89A66" strokeWidth="4" opacity={0.5 * fl} />
          {[800, 930, 1060].map((y) => (
            <rect key={y} x="1000" y={y} width="70" height="90" fill="#1A2327" stroke={K} strokeWidth="5" />
          ))}
          <path d="M1010 770 L1000 690 M1100 770 L1110 690 M1005 730 H1105" stroke={K} strokeWidth="6" />
          <path d="M990 690 V610 Q1055 590 1120 610 V690 Z" fill="#3A3430" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <path d="M984 612 L1055 560 L1126 612 Z" fill="#26211F" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <path d="M996 640 H1114 M996 668 H1114" stroke={K} strokeWidth="4" opacity=".6" />
          <path d="M994 614 V688" stroke="#D89A66" strokeWidth="4" opacity={0.45 * fl} />

          {/* facciata principale: gradiente laterale + bagliore che pulsa */}
          <rect x="130" y="590" width="820" height="590" fill="url(#in-facade)" stroke={K} strokeWidth="10" />
          {/* corsi di mattoni */}
          <path d={Array.from({ length: 14 }, (_, i) => `M134 ${630 + i * 40} H946`).join(' ')} stroke="#2E3433" strokeWidth="3" opacity=".35" />
          {/* cornicione e camini */}
          <rect x="110" y="566" width="860" height="34" fill="#2A302F" stroke={K} strokeWidth="8" />
          <path d="M116 570 H964" stroke="#E7A877" strokeWidth="4" opacity={0.55 * fl} />
          <rect x="230" y="500" width="60" height="68" fill="#3A403E" stroke={K} strokeWidth="7" />
          <rect x="820" y="512" width="54" height="56" fill="#3A403E" stroke={K} strokeWidth="7" />
          <rect x="222" y="492" width="76" height="14" fill="#2A302F" stroke={K} strokeWidth="5" />
          <rect x="812" y="504" width="70" height="14" fill="#2A302F" stroke={K} strokeWidth="5" />

          {/* finestre: vetri scuri che riflettono il fuoco */}
          {ROWS.map((y) =>
            COLS.map((x) => {
              if (x === FIRE.x && y === FIRE.y) return null;
              const k = winFill(x, y);
              const above = x === FIRE.x && y === ROWS[0];
              return (
                <g key={`${x}-${y}`}>
                  <rect x={x - 8} y={y + WIN_H} width={WIN_W + 16} height="14" fill="#3A403E" stroke={K} strokeWidth="5" />
                  <rect x={x} y={y} width={WIN_W} height={WIN_H} fill={above ? '#3A1E14' : '#141D22'} stroke={K} strokeWidth="7" />
                  {above && <rect x={x} y={y} width={WIN_W} height={WIN_H} fill="url(#in-room)" opacity={0.25 + 0.2 * fl} />}
                  <rect x={x} y={y} width={WIN_W} height={WIN_H} fill="#FF9A4C" opacity={k * 0.45 * fl} />
                  <path d={`M${x + WIN_W / 2} ${y} V${y + WIN_H} M${x} ${y + WIN_H / 2} H${x + WIN_W}`} stroke={K} strokeWidth="6" />
                  <path d={`M${x + 12} ${y + 10} l22 0 M${x + 12} ${y + 10} l0 22`} stroke="#FFD9A8" strokeWidth="3" opacity={0.2 + k * 0.6} />
                </g>
              );
            }),
          )}

          {/* scala antincendio sulla colonna di sinistra */}
          <g stroke={K} strokeWidth="5" fill="none">
            {[ROWS[0] + WIN_H + 26, ROWS[1] + WIN_H + 26].map((y) => (
              <g key={y}>
                <path d={`M160 ${y} H330 M160 ${y - 34} H330 M160 ${y - 34} V${y} M330 ${y - 34} V${y}`} />
                {Array.from({ length: 8 }, (_, i) => (
                  <path key={i} d={`M${181 + i * 21} ${y - 34} V${y}`} strokeWidth="3" />
                ))}
              </g>
            ))}
            <path d={`M190 ${ROWS[1] + WIN_H + 26} L310 ${ROWS[0] + WIN_H + 26}`} strokeWidth="7" />
            <path d={`M190 ${ROWS[2] + WIN_H + 26} L310 ${ROWS[1] + WIN_H + 26}`} strokeWidth="7" />
          </g>
          <path d={`M164 ${ROWS[1] + WIN_H + 22} H326`} stroke="#E7A877" strokeWidth="3" opacity={0.5 * fl} />

          {/* pluviale con staffe */}
          <path d="M925 600 V1170" stroke={K} strokeWidth="16" />
          <path d="M921 600 V1170" stroke="#9AA5A2" strokeWidth="4" opacity=".5" />
          {[700, 880, 1060].map((y) => (
            <path key={y} d={`M912 ${y} H940`} stroke={K} strokeWidth="8" />
          ))}

          {/* annerimento sopra la finestra in fiamme */}
          <path d={`M${FIRE.x - 10} ${FIRE.y} Q${FIRE.x - 60} ${FIRE.y - 160} ${FIRE.x - 20} ${ROWS[0] - 40} H${FIRE.x + WIN_W + 30} Q${FIRE.x + WIN_W + 70} ${FIRE.y - 150} ${FIRE.x + WIN_W + 10} ${FIRE.y} Z`} fill="url(#in-soot)" />

          {/* bagliore arancione che pulsa sulla facciata */}
          <ellipse cx={FC.x} cy={FC.y} rx={(420 + pulse * 40) * grow} ry={(380 + pulse * 30) * grow} fill="url(#in-fire)" opacity={0.6 * fl} />

          {/* la finestra in fiamme: stanza incandescente, telaio rotto */}
          <rect x={FIRE.x - 8} y={FIRE.y + WIN_H} width={WIN_W + 16} height="14" fill="#3A403E" stroke={K} strokeWidth="5" />
          <rect x={FIRE.x} y={FIRE.y} width={WIN_W} height={WIN_H} fill="url(#in-room)" stroke={K} strokeWidth="8" />
          <rect x={FIRE.x} y={FIRE.y} width={WIN_W} height={WIN_H} fill="#FFF3C8" opacity={(fl - 0.7) * 1.2} />
          <path d={`M${FIRE.x} ${FIRE.y + 40} l26 -10 l-8 30 M${FIRE.x + WIN_W} ${FIRE.y + 80} l-22 6 l10 -24 M${FIRE.x + WIN_W / 2} ${FIRE.y} v26 l-10 12`} fill="none" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          {/* tenda bruciata che pende */}
          <path d={`M${FIRE.x + 6} ${FIRE.y + 6} q10 40 -2 70 q12 -10 18 -60 z`} fill="#2A140C" />

          {/* marciapiede, strada bagnata con riflessi del fuoco */}
          <rect x="-220" y={STREET_Y} width="1520" height="30" fill="#4A4B47" stroke={K} strokeWidth="6" />
          <path d={`M-220 ${STREET_Y + 4} H1300`} stroke="#D8A27A" strokeWidth="3" opacity={0.45 * fl} />
          <rect x="-220" y={STREET_Y + 30} width="1520" height="760" fill="url(#in-street)" />
          {Array.from({ length: 6 }, (_, i) => {
            const w = (90 - i * 12) * (0.6 + 0.4 * Math.sin(t * 3.2 + i * 1.9));
            return <rect key={i} x={FC.x - w / 2 + Math.sin(t * 1.4 + i) * 8} y={STREET_Y + 38 + i * 9} width={w} height="4" rx="2" fill="#FFB25C" opacity={(0.55 - i * 0.07) * fl} />;
          })}
          {/* idrante */}
          <g transform={`translate(430 ${STREET_Y})`}>
            <path d="M-16 0 V-48 Q0 -64 16 -48 V0 Z" fill="#7A2E22" stroke={K} strokeWidth="5" />
            <path d="M-26 -34 H26" stroke={K} strokeWidth="9" strokeLinecap="round" />
            <path d="M10 -50 V-4" stroke="#FFB27F" strokeWidth="3" opacity={0.6 * fl} />
          </g>
        </g>

        {/* fumo basso: volute che escono dalla finestra e lambiscono la facciata (0,7) */}
        <g transform={L(0.7)}>
          {Array.from({ length: 10 }, (_, i) => {
            const p = mod(t * 0.28 + i / 10, 1);
            const cx = FC.x + 10 + p * 170 + Math.sin(p * 5 + i) * 24 + cam.pan * 0.05;
            const cy = FIRE.y - 40 - p * 430;
            const rad = 34 + p * 92;
            const o = seg(p, 0, 0.15) * (1 - p) * 0.8;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={rad} fill="url(#in-smoke2)" opacity={o} />
                <circle cx={cx - 6} cy={cy + rad * 0.3} r={rad * 0.75} fill="url(#in-smokelit)" opacity={o * 0.8 * fl} />
              </g>
            );
          })}
        </g>

        {/* fiamme che escono dalla finestra (0,65) */}
        <g transform={L(0.65)}>
          <circle cx={FC.x} cy={FIRE.y + 20} r={200 * fl * grow} fill="url(#in-hot)" opacity=".55" />
          {TONGUES.map(([dx, w, h, ph], i) => (
            <path key={`a${i}`} d={flame(FIRE.x + dx, FIRE.y + WIN_H + 4, w * grow, h * grow, t, ph)} fill="#D9481C" stroke={K} strokeWidth="5" strokeLinejoin="round" />
          ))}
          {TONGUES.map(([dx, w, h, ph], i) => (
            <path key={`b${i}`} d={flame(FIRE.x + dx, FIRE.y + WIN_H, w * 0.75 * grow, h * 0.75 * grow, t * 1.1, ph + 0.8)} fill="#FF9A3C" />
          ))}
          {TONGUES.map(([dx, w, h, ph], i) => (
            <path key={`c${i}`} d={flame(FIRE.x + dx, FIRE.y + WIN_H - 4, w * 0.5 * grow, h * 0.48 * grow, t * 1.25, ph + 1.6)} fill="#FFD25C" />
          ))}
          <path d={flame(FC.x, FIRE.y + WIN_H - 6, 34, 170 * grow, t * 1.4, 0.4)} fill="#FFF3C8" />
          {/* davanzale davanti alla base delle fiamme */}
          <rect x={FIRE.x - 14} y={FIRE.y + WIN_H} width={WIN_W + 28} height="16" fill="#3A403E" stroke={K} strokeWidth="6" />
          <path d={`M${FIRE.x - 10} ${FIRE.y + WIN_H + 4} H${FIRE.x + WIN_W + 10}`} stroke="#FFC48A" strokeWidth="3" opacity={0.8 * fl} />

          {/* scintille e braci che salgono */}
          {EMBERS.map((e, i) => {
            const p = mod(t * e.sp + e.ph, 1);
            const x = e.x0 + p * e.drift + Math.sin(t * 2.2 + e.ph * 12) * e.sway * p;
            const y = FIRE.y + 40 - p * 640;
            return <circle key={i} cx={x} cy={y} r={e.s * (1 - p * 0.5)} fill={e.hot ? '#FFE08A' : '#FF8A3C'} opacity={Math.sin(p * Math.PI) * (0.55 + 0.45 * Math.sin(t * 9 + i))} />;
          })}
        </g>

        {/* PIANO 3 — marciapiede vicino, pozzanghera, lampione (1,15) */}
        <g transform={L(1.15)}>
          <path d="M-260 1240 H1340 V2200 H-260 Z" fill="url(#in-near)" />
          <path d="M-260 1240 H1340" stroke={K} strokeWidth="10" />
          <path d="M-260 1248 H1340" stroke="#C99572" strokeWidth="4" opacity={0.4 * fl} />
          <path d="M-260 1420 H1340 M-260 1680 H1340 M200 1240 L120 2200 M760 1240 L860 2200" stroke="#0A1012" strokeWidth="6" opacity=".7" />
          {/* pozzanghera che riflette il fuoco */}
          <ellipse cx="470" cy="1560" rx="230" ry="44" fill="#0B1316" />
          <ellipse cx="470" cy="1560" rx="230" ry="44" fill="none" stroke="#5E7275" strokeWidth="4" opacity=".5" />
          {Array.from({ length: 4 }, (_, i) => {
            const w = (120 - i * 22) * (0.6 + 0.4 * Math.sin(t * 2.6 + i * 2.3));
            return <rect key={i} x={470 - w / 2 + 40} y={1534 + i * 14} width={w} height="5" rx="2.5" fill="#FF9A4C" opacity={(0.5 - i * 0.08) * fl} />;
          })}

          {/* lampione a sinistra che incornicia, luce fredda */}
          <path d="M166 796 L226 796 L330 1240 L60 1240 Z" fill="url(#in-cone)" />
          <circle cx="196" cy="790" r={170 + Math.sin(t * 1.7) * 8} fill="url(#in-lamp)" opacity=".75" />
          <rect x="44" y="760" width="44" height="1300" fill="url(#in-pole)" stroke={K} strokeWidth="9" />
          <path d="M66 770 Q70 730 130 730 H200" fill="none" stroke={K} strokeWidth="14" strokeLinecap="round" />
          <path d="M170 742 L222 742 L236 790 H156 Z" fill="#20292C" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <ellipse cx="196" cy="792" rx="34" ry="10" fill="#EAF6F8" />
          <path d="M30 1236 H102 V1280 H30 Z" fill="#1B2427" stroke={K} strokeWidth="8" />
          <path d="M80 770 V1230" stroke="#E7A877" strokeWidth="4" opacity={0.45 * fl} />

          {/* fiammifero bruciato con filo di fumo */}
          <g opacity={landed}>
            <path d="M480 1232 L600 1212" stroke="#8A6F55" strokeWidth="9" strokeLinecap="round" />
            <path d="M480 1232 L600 1212" stroke={K} strokeWidth="13" strokeLinecap="round" opacity=".35" />
            <ellipse cx="476" cy="1233" rx="13" ry="10" fill="#1A1210" stroke={K} strokeWidth="4" />
            <circle cx="476" cy="1232" r="4" fill="#FF8A3C" opacity={0.5 + 0.4 * Math.sin(t * 5)} />
            <path d={`M476 1220 q-14 -30 4 -60 q16 -30 -2 -64`} fill="none" stroke="#9AA6A6" strokeWidth="4" strokeLinecap="round" strokeDasharray="22 16" strokeDashoffset={t * 30} opacity=".45" />
          </g>

          {/* scatola di fiammiferi "A. Laeddis" — elemento chiave in accento */}
          <ellipse cx={bx + 10} cy="1262" rx={230 * (0.4 + 0.6 * landed)} ry="20" fill="#000" opacity={0.45 * landed} />
          <circle cx={bx} cy="1160" r={260 + Math.sin(t * 2) * 12} fill="url(#in-accent)" opacity={0.45 * landed} />
          <g transform={`translate(${bx} 1160) rotate(${brot})`}>
            {/* spessore: lato superiore e striscia per accendere */}
            <path d="M-190 -92 L-156 -116 H226 L190 -92 Z" fill="#FBF6EA" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <path d="M190 -92 L226 -116 V72 L190 96 Z" fill="url(#in-striker)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <path d="M200 -88 L216 -98 M200 -60 L216 -70 M200 -32 L216 -42 M200 -4 L216 -14 M200 24 L216 14 M200 52 L216 42" stroke="#2A1810" strokeWidth="4" />
            {/* fiammiferi che spuntano dal cassetto socchiuso */}
            <g transform="translate(-120 -104)">
              {[0, 24, 48, 72].map((x, i) => (
                <g key={x}>
                  <path d={`M${x} 0 V-34`} stroke="#C9A97F" strokeWidth="9" strokeLinecap="round" />
                  <ellipse cx={x} cy="-38" rx="9" ry="12" fill={i === 2 ? '#7A2E22' : '#A83A26'} stroke={K} strokeWidth="4" />
                </g>
              ))}
            </g>
            {/* faccia frontale */}
            <rect x="-190" y="-92" width="380" height="188" rx="10" fill="url(#in-paper)" stroke={K} strokeWidth="9" />
            <rect x="-166" y="-70" width="332" height="144" rx="8" fill={P.accento} stroke={K} strokeWidth="6" />
            <rect x="-152" y="-58" width="304" height="120" rx="5" fill="none" stroke="#FFE2CC" strokeWidth="3" opacity=".7" />
            <text x="0" y="-26" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="24" letterSpacing="5" fill={K}>
              FIAMMIFERI
            </text>
            <text x="0" y="44" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="80" fill="#FFF6EA" stroke={K} strokeWidth="2" paintOrder="stroke">
              A. Laeddis
            </text>
            {/* bordo illuminato dal fuoco (in alto a sinistra) */}
            <path d="M-184 -86 H150" stroke="#FFE3B8" strokeWidth="4" opacity={0.6 + 0.3 * fl} />
            <path d="M-184 -86 V60" stroke="#FFE3B8" strokeWidth="4" opacity={0.4 + 0.2 * fl} />
          </g>
          {/* sbuffo di cenere quando la scatola si ferma */}
          {puff > 0 && puff < 1 && [-1, 1].map((s) =>
            [0, 1, 2].map((k) => (
              <circle key={`${s}${k}`} cx={bx + s * (150 + puff * (90 + k * 40))} cy={1250 - puff * (20 + k * 14)} r={14 + puff * 30} fill="url(#in-ash)" opacity={(1 - puff) * 0.6} />
            )),
          )}
        </g>

        {/* PIANO 4 — braci grandi davanti alla camera (1,7) */}
        <g transform={L(1.7)}>
          {NEAR.map((n, i) => {
            const y = 2000 - mod(t * n.sp + n.ph, 1900);
            return <circle key={i} cx={n.x + Math.sin(t * 0.9 + i) * 40 * n.sway} cy={y} r={n.rad} fill="url(#in-ember)" opacity={0.28 + 0.12 * Math.sin(t * 4 + i)} />;
          })}
        </g>
      </g>

      <Finish id="in" tint="#0E3A40" tintOpacity={0.11} />
    </svg>
  );
};
