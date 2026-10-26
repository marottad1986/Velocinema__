import React from 'react';
import { camera, eio, eo, eob, lerp, mod, rainPath, rng, seg, wavePath } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { DISPLAY, HAND, SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';

// La verità: il cappello cade dall'attaccapanni e appare un camice; cartella clinica «Paziente n. 67 – Andrew Laeddis»,
// foto della casa sul lago, timbro «Ultima prova».
// Piani: cielo oltre la finestra (0,12) · parete con finestra, diploma, orologio (0,25) · pavimento e fascio di luce (0,4–0,45)
//        · attaccapanni con cappello e camice (0,55) · scrivania e cartella (0,72) · sedia e pratiche in primo piano (1,25)
//        · pulviscolo davanti alla camera (1,7)

const K = '#0A1316';
const WIN = { x: 70, y: 548, w: 330, h: 336 };
const RACK = { x: 832, top: 476 };
const FILE = { x: 92, y: 922, w: 652, h: 322 };

// Tempi dai sottotitoli (subtitleTimes su 12 s): «Chuck è il dottor Sheehan» 0,15 s, «il suo psichiatra» 2,05 s,
// «e hanno recitato tutto per curarlo» 3,48 s, «Dolores… nel lago» 5,2 s, «Lui le ha sparato» 8,47 s, «Se non ricorda…» 9,9 s.
const HAT_FALL = [0.7, 1.55] as const;
const COAT_IN = [1.35, 2.1] as const;
const COVER = [3.55, 4.15] as const;
const PHOTO = [5.35, 6.1] as const;
const STAMP = 10.0;

const LINE1 = 'PAZIENTE N. 67';
const LINE2 = 'ANDREW LAEDDIS';

const r = rng(1952);
const MOTES = Array.from({ length: 30 }, () => ({ u: r(), v: r(), s: 2 + r() * 3.5, sp: 0.012 + r() * 0.03, ph: r() * 6 }));
const NEAR = Array.from({ length: 6 }, (_, i) => ({ x: r() * 1080, y: 540 + r() * 1200, rad: 45 + r() * 60, ph: i * 1.7 }));
const INK = Array.from({ length: 9 }, () => ({ a: r() * Math.PI * 2, d: 150 + r() * 60, s: 3 + r() * 5 }));

/** Cappello da sceriffo (falda, cupola, nastro): lo stesso motivo del capitolo dell'uragano. */
const Hat: React.FC<{ band: string }> = ({ band }) => (
  <g>
    <path d="M-104 0 Q0 -20 104 0 Q76 16 0 18 Q-76 16 -104 0 Z" fill="#141E26" stroke={K} strokeWidth="7" strokeLinejoin="round" />
    <path d="M-62 -6 L-52 -74 Q0 -96 52 -74 L62 -6 Z" fill="#1C2A34" stroke={K} strokeWidth="7" strokeLinejoin="round" />
    <path d="M-60 -26 H60" stroke={band} strokeWidth="13" />
    <path d="M-38 -68 Q0 -84 38 -68" fill="none" stroke="#4E7A85" strokeWidth="5" opacity=".75" />
    <path d="M-8 -90 Q0 -74 8 -90" fill="none" stroke={K} strokeWidth="5" />
  </g>
);

export const Verita: React.FC<SceneProps> = ({ t, dur, palette: P }) => {
  const cam = camera(t, dur, 540, 980);
  const L = cam.layer;

  // Cambi di luce (max 2): una nube copre la finestra a «Lui le ha sparato»; il timbro scuote appena la scena
  const cloud = seg(t, 8.35, 8.85) * (1 - seg(t, 9.7, 10.6));
  const light = 1 - 0.38 * cloud;
  const breathe = 0.5 + 0.5 * Math.sin(t * 1.3);

  // Cappello: si stacca dal gancio, compie un arco ruotando e rimbalza sul pavimento
  const hf = seg(t, HAT_FALL[0], HAT_FALL[1]);
  const hatX = lerp(RACK.x + 72, 930, eo(hf));
  const hatY = lerp(RACK.top + 52, 1262, hf * hf) - Math.sin(hf * Math.PI) * 30;
  const bounce = Math.sin(seg(t, HAT_FALL[1], HAT_FALL[1] + 0.45) * Math.PI) * 18 * (1 - seg(t, HAT_FALL[1], HAT_FALL[1] + 0.45));
  const hatRot = lerp(-8, 168, eio(hf)) + (t < HAT_FALL[0] ? Math.sin(t * 6) * 3 * seg(t, 0.3, 0.7) : 0);
  const landPuff = seg(t, HAT_FALL[1], HAT_FALL[1] + 0.9);

  // Camice: appare sul gancio con una piccola oscillazione smorzata
  const ci = seg(t, COAT_IN[0], COAT_IN[1]);
  const coatSwing = Math.sin((t - COAT_IN[0]) * 5) * 6 * (1 - eo(seg(t, COAT_IN[0], COAT_IN[0] + 2.4))) + Math.sin(t * 1.1) * 0.6;

  // Cartella: la copertina si apre (ribaltamento sul dorso), poi il testo viene battuto a macchina
  const cov = eio(seg(t, COVER[0], COVER[1]));
  const typeA = seg(t, 4.15, 4.85);
  const typeB = seg(t, 4.85, 5.45);
  const n1 = Math.floor(typeA * LINE1.length + 0.001);
  const n2 = Math.floor(typeB * LINE2.length + 0.001);
  const ph = eob(seg(t, PHOTO[0], PHOTO[1]), 1.4);

  // Timbro: scende dall'alto, batte, sobbalzo della scrivania e schizzi d'inchiostro
  const sp = seg(t, STAMP - 0.25, STAMP);
  const stampScale = lerp(2.2, 1, sp * sp);
  const hit = seg(t, STAMP, STAMP + 0.5);
  const jolt = t > STAMP ? Math.sin(hit * Math.PI * 4) * 5 * (1 - hit) : 0;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ve" />
        <Lin id="ve-sky" stops={[[0, '#7F9CA3'], [0.5, '#B7CBCF'], [1, '#DCE7E9']]} />
        <Lin id="ve-wall" stops={[[0, '#14232A'], [0.28, '#2A4048'], [0.6, '#4A6268'], [1, '#33484E']]} />
        <Lin id="ve-floor" stops={[[0, '#3A3A36'], [0.4, '#262724'], [1, '#0E0F0E']]} />
        <Lin id="ve-shaft" stops={[[0, '#E4F0F2', 0.36], [1, '#E4F0F2', 0]]} />
        <Lin id="ve-desk" stops={[[0, '#7A5A40'], [0.35, '#5A412E'], [1, '#3A2A1E']]} />
        <Lin id="ve-front" stops={[[0, '#3A2A1E'], [1, '#120C08']]} />
        <Lin id="ve-folder" x2={1} y2={0} stops={[[0, '#B9A170'], [0.6, '#D8C394'], [1, '#E8D7AC']]} />
        <Lin id="ve-paper" stops={[[0, '#F6F4EC'], [1, '#DEDAD0']]} />
        <Lin id="ve-coat" x2={1} y2={0} stops={[[0, '#AFC0C2'], [0.45, '#EEF4F4'], [1, '#FFFFFF']]} />
        <Lin id="ve-wood" x2={1} y2={0} stops={[[0, '#2A1E17'], [0.55, '#5A4332'], [1, '#7B5E45']]} />
        <Lin id="ve-radiator" x2={1} y2={0} stops={[[0, '#53676B'], [0.5, '#9AB0B3'], [1, '#3E5054']]} />
        <Lin id="ve-lake" stops={[[0, '#6E9AA2'], [1, '#2F5A63']]} />
        <GlowGradient id="ve-win" color="#DDEBEE" core={0.55} mid={0.2} />
        <GlowGradient id="ve-dust" color="#E9F0F2" core={0.9} mid={0.35} />
        <GlowGradient id="ve-puff" color="#C9D4D2" core={0.6} mid={0.2} />
        <GlowGradient id="ve-stamp" color="#FF6B2C" core={0.45} mid={0.14} />
        <GlowGradient id="ve-shadow" color="#000000" core={0.5} mid={0.25} />
        {/* inchiostro del timbro non uniforme: buchini color carta */}
        <pattern id="ve-ink" width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="18" height="18" fill={P.accento} />
          <circle cx="4" cy="4" r="1.6" fill="#F2EFE6" opacity=".7" />
          <circle cx="13" cy="9" r="1.2" fill="#F2EFE6" opacity=".6" />
          <circle cx="7" cy="14" r="1" fill="#F2EFE6" opacity=".7" />
        </pattern>
        <clipPath id="ve-winclip">
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} />
        </clipPath>
        <clipPath id="ve-photoclip">
          <rect x="14" y="14" width="196" height="146" />
        </clipPath>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo grigio oltre la finestra (0,12) */}
        <g transform={L(0.12)} clipPath="url(#ve-winclip)">
          <rect x={WIN.x - 60} y={WIN.y} width={WIN.w + 120} height={WIN.h} fill="url(#ve-sky)" />
          <ellipse cx={WIN.x + 120 + Math.sin(t * 0.3) * 20} cy={WIN.y + 90} rx="200" ry="50" fill="#93AEB4" opacity=".55" />
          {/* nube che passa davanti al sole */}
          <ellipse cx={lerp(WIN.x - 200, WIN.x + 520, seg(t, 7.6, 11.2))} cy={WIN.y + 120} rx="230" ry="90" fill="#6E878D" opacity={0.75 * cloud} />
          {/* isola e mare lontani */}
          <path d={`M${WIN.x - 60} ${WIN.y + 280} Q${WIN.x + 80} ${WIN.y + 230} ${WIN.x + 200} ${WIN.y + 262} Q${WIN.x + 300} ${WIN.y + 240} ${WIN.x + 400} ${WIN.y + 270} V${WIN.y + WIN.h} H${WIN.x - 60} Z`} fill="#5D7A7C" />
          <rect x={WIN.x - 60} y={WIN.y + 300} width={WIN.w + 120} height="80" fill="#6F959B" />
          <path d={wavePath(WIN.y + 320, 3, 60, WIN.x - 120, WIN.x + 460)} transform={`translate(${-mod(t * 14, 60)} 0)`} fill="none" stroke="#C9DDE0" strokeWidth="3" opacity=".5" />
          <path d={rainPath(16, 7, 34, 6, 420, 400)} transform={`translate(${WIN.x - 30} ${WIN.y - 400 + mod(t * 320, 400)})`} stroke="#F2F8F9" strokeWidth="2" opacity=".35" />
          <path d={rainPath(16, 7, 34, 6, 420, 400)} transform={`translate(${WIN.x - 30} ${WIN.y + mod(t * 320, 400)})`} stroke="#F2F8F9" strokeWidth="2" opacity=".35" />
        </g>

        {/* PIANO 1 — parete con finestra, diploma, orologio e interruttore (0,25) */}
        <g transform={L(0.25)}>
          <path d={`M-200 -200 H1280 V1180 H-200 Z M${WIN.x} ${WIN.y} V${WIN.y + WIN.h} H${WIN.x + WIN.w} V${WIN.y} Z`} fill="url(#ve-wall)" fillRule="evenodd" />
          {/* zoccolo di legno */}
          <rect x="-200" y="1060" width="1480" height="120" fill="#24343A" />
          <path d="M-200 1060 H1280" stroke={K} strokeWidth="7" />
          <path d="M-200 1068 H1280" stroke="#7E969B" strokeWidth="3" opacity=".45" />
          {/* alone della finestra sulla parete */}
          <ellipse cx={WIN.x + WIN.w / 2} cy={WIN.y + WIN.h / 2} rx={420 + breathe * 20} ry={360 + breathe * 16} fill="url(#ve-win)" opacity={light} />
          {/* telaio */}
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="none" stroke={K} strokeWidth="18" />
          <path d={`M${WIN.x + WIN.w / 2} ${WIN.y} V${WIN.y + WIN.h} M${WIN.x} ${WIN.y + WIN.h / 2} H${WIN.x + WIN.w}`} stroke={K} strokeWidth="12" />
          <path d={`M${WIN.x + 12} ${WIN.y + 12} H${WIN.x + WIN.w - 12}`} stroke="#E9F2F3" strokeWidth="3" opacity=".7" />
          {/* riflesso sul vetro */}
          <path d={`M${WIN.x + 30} ${WIN.y + 150} l70 -110 M${WIN.x + 196} ${WIN.y + 330} l60 -90`} stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity={0.35 * light} />
          <rect x={WIN.x - 26} y={WIN.y + WIN.h + 6} width={WIN.w + 52} height="22" fill="#6E8487" stroke={K} strokeWidth="7" />
          <path d={`M${WIN.x - 20} ${WIN.y + WIN.h + 10} H${WIN.x + WIN.w + 20}`} stroke="#D6E3E5" strokeWidth="3" />
          {/* tubo del riscaldamento sotto il soffitto */}
          <rect x="-200" y="120" width="1480" height="40" fill="#3D5054" stroke={K} strokeWidth="7" />
          <path d="M-200 130 H1280" stroke="#9FB6B9" strokeWidth="3" opacity=".55" />
          <rect x="420" y="110" width="30" height="60" rx="5" fill="#4C6064" stroke={K} strokeWidth="5" />
          {/* mensola con raccoglitori dell'archivio */}
          <rect x="600" y="352" width="420" height="18" fill="#4A3426" stroke={K} strokeWidth="6" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <g key={i} transform={`translate(${618 + i * 46} 352) rotate(${i === 6 ? 14 : 0})`}>
              <rect x="0" y={-96 + (i % 3) * 8} width="40" height={96 - (i % 3) * 8} rx="3" fill={i % 2 ? '#5E7470' : '#7A6A52'} stroke={K} strokeWidth="5" />
              <rect x="10" y={-70 + (i % 3) * 8} width="20" height="22" fill="#E3DED0" opacity=".85" />
            </g>
          ))}
          {/* diploma incorniciato */}
          <g transform="translate(470 610) rotate(-1.5)">
            <rect x="0" y="0" width="170" height="130" fill="#3E2C20" stroke={K} strokeWidth="7" />
            <rect x="14" y="14" width="142" height="102" fill="#E8E4D8" />
            <path d="M34 40 H136 M44 60 H126 M54 78 H116" stroke="#7C8486" strokeWidth="4" opacity=".7" />
            <circle cx="120" cy="96" r="10" fill="#B78F3A" />
          </g>
          {/* orologio a muro */}
          <g transform="translate(560 830)">
            <circle r="52" fill="#E3EAEA" stroke={K} strokeWidth="8" />
            <path d="M0 -40 V-34 M40 0 H34 M0 40 V34 M-40 0 H-34" stroke={K} strokeWidth="4" />
            <path d={`M0 0 L${Math.sin(1.9) * 26} ${-Math.cos(1.9) * 26}`} stroke={K} strokeWidth="6" strokeLinecap="round" />
            <path d={`M0 0 L${Math.sin(t * 0.5) * 36} ${-Math.cos(t * 0.5) * 36}`} stroke={K} strokeWidth="3" strokeLinecap="round" />
            <circle r="5" fill={K} />
            <path d="M-36 -26 A44 44 0 0 1 -6 -44" fill="none" stroke="#FFFFFF" strokeWidth="4" opacity=".8" />
          </g>
          {/* interruttore della luce con il suo cavo */}
          <g transform="translate(700 800)">
            <rect x="-18" y="-28" width="36" height="56" rx="5" fill="#C9D4D4" stroke={K} strokeWidth="5" />
            <rect x="-5" y="-12" width="10" height="20" rx="3" fill="#6E8285" />
            <path d="M0 -28 V-300" stroke="#0E1A1E" strokeWidth="4" />
          </g>
        </g>

        {/* PIANO 2 — pavimento e fascio di luce fredda con pulviscolo (0,42) */}
        <g transform={L(0.42)}>
          <rect x="-200" y="1180" width="1480" height="900" fill="url(#ve-floor)" />
          <path d="M-200 1180 H1280" stroke={K} strokeWidth="9" />
          <g stroke="#121311" strokeWidth="5" opacity=".7">
            <path d="M-200 1260 H1280 M-200 1380 H1280 M-200 1560 H1280 M-200 1820 H1280" />
            <path d="M200 1180 L60 1260 M600 1180 L560 1260 M960 1180 L1060 1260 M380 1260 L300 1380 M800 1260 L840 1380" />
          </g>
          {/* luce della finestra sul pavimento */}
          <path d="M520 1196 L860 1196 L1000 1270 L600 1270 Z" fill="#DDEBEE" opacity={0.16 * light} />
          {/* fascio */}
          <path d={`M${WIN.x + 10} ${WIN.y + 10} L${WIN.x + WIN.w} ${WIN.y + 10} L1000 1270 L600 1270 Z`} fill="url(#ve-shaft)" opacity={(0.95 + breathe * 0.15) * light} />
          {MOTES.map((m, i) => {
            const v = mod(m.v + t * m.sp, 1);
            const x0 = lerp(WIN.x + 10, 600, v);
            const x1 = lerp(WIN.x + WIN.w, 1000, v);
            const x = lerp(x0, x1, m.u) + Math.sin(t * 0.8 + m.ph) * 12;
            const y = lerp(WIN.y + 20, 1260, v);
            return <circle key={i} cx={x} cy={y} r={m.s} fill="#F2F8F9" opacity={(0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + m.ph))) * Math.sin(v * Math.PI) * light} />;
          })}
        </g>

        {/* PIANO 3 — attaccapanni con cappello e camice (0,55) */}
        <g transform={L(0.55)}>
          <ellipse cx={RACK.x} cy="1250" rx="130" ry="18" fill="url(#ve-shadow)" />
          <path d={`M${RACK.x} ${RACK.top} V1236 M${RACK.x - 90} 1250 L${RACK.x} 1196 L${RACK.x + 90} 1250 M${RACK.x} 1196 V1252`} stroke={K} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M${RACK.x} ${RACK.top} V1236`} stroke="url(#ve-wood)" strokeWidth="12" strokeLinecap="round" />
          <path d={`M${RACK.x + 3} ${RACK.top + 10} V1226`} stroke="#B08F6C" strokeWidth="3" opacity=".6" />
          {/* ganci */}
          <path d={`M${RACK.x} ${RACK.top + 30} q-60 -6 -74 -40 M${RACK.x} ${RACK.top + 30} q60 -6 74 -40 M${RACK.x} ${RACK.top + 60} q46 4 60 -22`} fill="none" stroke={K} strokeWidth="11" strokeLinecap="round" />
          <circle cx={RACK.x} cy={RACK.top} r="14" fill="#5A4332" stroke={K} strokeWidth="6" />

          {/* camice bianco, appeso al gancio */}
          <g opacity={seg(ci, 0, 0.3)} transform={`translate(0 ${lerp(-36, 0, eob(ci, 1.6))}) rotate(${coatSwing} ${RACK.x} ${RACK.top + 40})`}>
            {/* maniche che pendono, dietro al corpo */}
            <path d={`M${RACK.x - 112} ${RACK.top + 112} L${RACK.x - 150} ${RACK.top + 480} L${RACK.x - 108} ${RACK.top + 488} L${RACK.x - 88} ${RACK.top + 170} Z`} fill="#BCCBCC" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d={`M${RACK.x + 112} ${RACK.top + 112} L${RACK.x + 150} ${RACK.top + 480} L${RACK.x + 108} ${RACK.top + 488} L${RACK.x + 88} ${RACK.top + 170} Z`} fill="#F4F8F8" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d={`M${RACK.x} ${RACK.top + 40} L${RACK.x - 112} ${RACK.top + 112} L${RACK.x - 128} ${RACK.top + 560} H${RACK.x + 128} L${RACK.x + 112} ${RACK.top + 112} Z`} fill="url(#ve-coat)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
            {/* revers e abbottonatura */}
            <path d={`M${RACK.x - 46} ${RACK.top + 70} L${RACK.x} ${RACK.top + 220} L${RACK.x + 46} ${RACK.top + 70} M${RACK.x} ${RACK.top + 220} V${RACK.top + 560}`} fill="none" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            {[280, 360, 440].map((y) => (
              <circle key={y} cx={RACK.x - 14} cy={RACK.top + y} r="7" fill="#9AAAAD" stroke={K} strokeWidth="3" />
            ))}
            {/* taschino con penne e targhetta col nome */}
            <rect x={RACK.x + 30} y={RACK.top + 250} width="70" height="58" rx="4" fill="none" stroke={K} strokeWidth="5" />
            <path d={`M${RACK.x + 46} ${RACK.top + 250} V${RACK.top + 222} M${RACK.x + 62} ${RACK.top + 250} V${RACK.top + 230}`} stroke="#2C3E48" strokeWidth="7" strokeLinecap="round" />
            <rect x={RACK.x - 106} y={RACK.top + 236} width="98" height="30" rx="4" fill="#F7F9F9" stroke={K} strokeWidth="4" />
            <text x={RACK.x - 57} y={RACK.top + 256} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={13} fill="#15202B">DR. SHEEHAN</text>
            {/* bordo illuminato dalla finestra (sinistra) */}
            <path d={`M${RACK.x - 108} ${RACK.top + 120} L${RACK.x - 122} ${RACK.top + 550}`} stroke="#FFFFFF" strokeWidth="4" opacity=".8" />
          </g>

          {/* polvere quando il cappello tocca terra */}
          {landPuff > 0 && landPuff < 1 && (
            <>
              <ellipse cx={930 - 40 - landPuff * 60} cy={1262 - landPuff * 20} rx={30 + landPuff * 50} ry={14 + landPuff * 20} fill="url(#ve-puff)" opacity={1 - landPuff} />
              <ellipse cx={930 + 40 + landPuff * 60} cy={1262 - landPuff * 20} rx={30 + landPuff * 50} ry={14 + landPuff * 20} fill="url(#ve-puff)" opacity={1 - landPuff} />
            </>
          )}
          {/* ombra del cappello a terra */}
          <ellipse cx={hatX} cy="1268" rx={lerp(30, 100, hf)} ry="12" fill="#000" opacity={0.4 * hf} />
          {/* il cappello */}
          <g transform={`translate(${hatX} ${hatY - bounce}) rotate(${hatRot}) scale(.95)`}>
            <Hat band={P.accento} />
          </g>
        </g>

        {/* PIANO 4 — scrivania con la cartella clinica (0,72) */}
        <g transform={L(0.72, 0, jolt)}>
          {/* piano della scrivania in leggera prospettiva */}
          <path d="M-120 902 L780 890 L820 1262 L-120 1272 Z" fill="url(#ve-desk)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
          <path d="M-120 912 L780 900" stroke="#B08A62" strokeWidth="5" opacity=".7" />
          <path d="M780 890 L820 1262" stroke="#B08A62" strokeWidth="4" opacity=".5" />
          <path d="M-120 1272 L820 1262 L826 1300 L-120 1312 Z" fill="#2A1E15" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          {/* venature */}
          <path d="M-100 960 Q300 944 780 948 M-100 1080 Q300 1070 800 1074 M-100 1200 Q320 1190 820 1196" fill="none" stroke="#3A2A1E" strokeWidth="4" opacity=".5" />
          {/* luce della finestra sulla scrivania */}
          <path d="M240 900 L620 894 L800 1262 L420 1268 Z" fill="#E4F0F2" opacity={0.1 * light} />

          {/* la cartella */}
          <g transform={`rotate(-3 ${FILE.x + FILE.w / 2} ${FILE.y + FILE.h / 2})`}>
            <rect x={FILE.x + 8} y={FILE.y + 14} width={FILE.w} height={FILE.h} rx="8" fill="#000" opacity=".3" />
            <rect x={FILE.x} y={FILE.y} width={FILE.w} height={FILE.h} rx="8" fill="url(#ve-folder)" stroke={K} strokeWidth="9" />
            {/* linguetta */}
            <path d={`M${FILE.x + 420} ${FILE.y} v-30 q0 -8 8 -8 h150 q8 0 8 8 v30`} fill="#D8C394" stroke={K} strokeWidth="7" />
            {/* foglio interno */}
            <rect x={FILE.x + 22} y={FILE.y + 18} width={FILE.w - 44} height={FILE.h - 36} fill="url(#ve-paper)" stroke={K} strokeWidth="6" />
            <text x={FILE.x + 50} y={FILE.y + 76} fontFamily={DISPLAY} fontWeight={800} fontSize={46} fill="#15202B" letterSpacing="1">{LINE1.slice(0, n1)}</text>
            <text x={FILE.x + 50} y={FILE.y + 142} fontFamily={DISPLAY} fontWeight={800} fontSize={56} fill="#15202B" letterSpacing="1">{LINE2.slice(0, n2)}</text>
            {/* cursore della macchina da scrivere */}
            {t > 4.1 && t < 5.7 && Math.sin(t * 18) > -0.2 && (
              <rect x={FILE.x + 50 + (typeB > 0 ? n2 * 35 : n1 * 27.5)} y={typeB > 0 ? FILE.y + 100 : FILE.y + 42} width="6" height={typeB > 0 ? 48 : 40} fill="#15202B" />
            )}
            <path d={`M${FILE.x + 50} ${FILE.y + 168} H${FILE.x + 610}`} stroke="#15202B" strokeWidth="4" />
            <g stroke="#4E5C60" strokeWidth="6" strokeLinecap="round" opacity={0.45 * seg(t, 5.0, 5.6)}>
              <path d={`M${FILE.x + 50} ${FILE.y + 206} H${FILE.x + 360} M${FILE.x + 50} ${FILE.y + 240} H${FILE.x + 330} M${FILE.x + 50} ${FILE.y + 274} H${FILE.x + 380} M${FILE.x + 50} ${FILE.y + 308} H${FILE.x + 300}`} />
            </g>
            <text x={FILE.x + 300} y={FILE.y + 212} fontFamily={HAND} fontWeight={700} fontSize={30} fill="#3A5A8A" opacity={seg(t, 5.6, 6.0)}>Ashecliffe · reparto C</text>

            {/* foto della casa sul lago, fermata con una graffetta */}
            <g transform={`translate(${FILE.x + 424} ${lerp(FILE.y + 130, FILE.y + 168, ph)}) rotate(${lerp(-14, 5, ph)}) scale(.82)`} opacity={seg(t, PHOTO[0], PHOTO[0] + 0.2)}>
              <rect x="4" y="8" width="224" height="194" fill="#000" opacity=".25" />
              <rect x="0" y="0" width="224" height="194" fill="#F5F3EC" stroke={K} strokeWidth="6" />
              <g clipPath="url(#ve-photoclip)">
                <rect x="14" y="14" width="196" height="146" fill="#C9D9DB" />
                {/* bosco */}
                <path d="M14 96 l14 -40 l14 40 l12 -50 l14 50 l12 -34 l14 34 l16 -46 l14 46 l14 -30 l12 30 l14 -44 l14 44 l12 -36 l14 36 V100 H14 Z" fill="#3E5A56" />
                {/* casa */}
                <path d="M78 98 V70 L106 50 L134 70 V98 Z" fill="#E9EEEC" stroke={K} strokeWidth="4" strokeLinejoin="round" />
                <path d="M72 72 L106 46 L140 72" fill="none" stroke="#5A3A2A" strokeWidth="7" strokeLinecap="round" />
                <rect x="98" y="78" width="14" height="20" fill="#3A4A4E" />
                {/* pontile */}
                <path d="M140 100 H190" stroke="#5A4332" strokeWidth="5" />
                {/* lago con piccolo movimento d'acqua e riflesso che tremola */}
                <rect x="14" y="98" width="196" height="62" fill="url(#ve-lake)" />
                <g transform={`translate(${Math.sin(t * 2.2) * 2} 0)`} opacity=".45">
                  <path d="M80 102 H132 L128 116 H84 Z" fill="#E9EEEC" />
                  <path d="M86 118 H126" stroke="#E9EEEC" strokeWidth="3" opacity=".7" />
                </g>
                <path d={wavePath(124, 2.5, 40, -40, 260)} transform={`translate(${-mod(t * 16, 40)} 0)`} fill="none" stroke="#DCEBEE" strokeWidth="2.5" opacity=".7" />
                <path d={wavePath(142, 3, 50, -60, 260)} transform={`translate(${mod(t * 12, 50) - 50} 0)`} fill="none" stroke="#DCEBEE" strokeWidth="2.5" opacity=".55" />
              </g>
              <rect x="14" y="14" width="196" height="146" fill="#C9A86A" opacity=".12" />
              <text x="112" y="186" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={24} fill="#3A4A4E">il lago, 1952</text>
              {/* graffetta */}
              <path d="M30 -18 V40 Q30 52 42 52 Q54 52 54 40 V-8 Q54 -16 46 -16 Q38 -16 38 -8 V34" fill="none" stroke="#7E9194" strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* copertina che si ribalta sul dorso sinistro */}
            {cov < 1 && (
              <g transform={`translate(${FILE.x} 0) scale(${1 - cov} 1) translate(${-FILE.x} 0)`}>
                <rect x={FILE.x} y={FILE.y} width={FILE.w} height={FILE.h} rx="8" fill="url(#ve-folder)" stroke={K} strokeWidth="9" />
                <rect x={FILE.x + 200} y={FILE.y + 120} width="260" height="90" fill="#F2EBD6" stroke={K} strokeWidth="5" />
                <text x={FILE.x + 330} y={FILE.y + 160} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={24} fill="#15202B">CARTELLA</text>
                <text x={FILE.x + 330} y={FILE.y + 192} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={24} fill="#15202B">CLINICA</text>
                <rect x={FILE.x} y={FILE.y} width={FILE.w} height={FILE.h} rx="8" fill="#000" opacity={cov * 0.4} />
              </g>
            )}

            {/* timbro «Ultima prova» */}
            {t > STAMP - 0.25 && (
              <g transform={`translate(${FILE.x + 250} ${FILE.y + 258}) rotate(-9) scale(${stampScale})`} opacity={seg(t, STAMP - 0.25, STAMP - 0.15)}>
                <ellipse cx="0" cy="0" rx="230" ry="110" fill="url(#ve-stamp)" opacity={(1 - seg(t, STAMP + 0.1, STAMP + 1.4)) * 0.9 + 0.25} />
                <rect x="-196" y="-46" width="392" height="92" rx="10" fill="none" stroke="url(#ve-ink)" strokeWidth="9" />
                <rect x="-184" y="-34" width="368" height="68" rx="6" fill="none" stroke="url(#ve-ink)" strokeWidth="3" />
                <text x="0" y="17" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={46} fill="url(#ve-ink)" letterSpacing="1">ULTIMA PROVA</text>
              </g>
            )}
            {/* schizzi d'inchiostro */}
            {hit > 0 &&
              INK.map((d, i) => (
                <circle key={i} cx={FILE.x + 250 + Math.cos(d.a) * d.d * (0.8 + eo(hit) * 0.25)} cy={FILE.y + 258 + Math.sin(d.a) * d.d * 0.5} r={d.s} fill={P.accento} opacity={0.8 * seg(hit, 0, 0.1)} />
              ))}
          </g>

          {/* penna stilografica */}
          <path d="M600 1250 L760 1196" stroke="#15202B" strokeWidth="12" strokeLinecap="round" />
          <path d="M740 1203 L770 1193" stroke="#C9A040" strokeWidth="12" strokeLinecap="round" />
        </g>

        {/* PIANO 5 — sedia e pila di pratiche in primo piano (1,25) */}
        <g transform={L(1.25)}>
          {/* schienale della sedia a sinistra */}
          <path d="M-60 1520 Q140 1490 330 1530 L320 1600 Q140 1566 -60 1594 Z" fill="url(#ve-wood)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
          <path d="M-50 1528 Q140 1500 320 1538" fill="none" stroke="#B08F6C" strokeWidth="4" opacity=".7" />
          {[30, 120, 210, 290].map((x) => (
            <rect key={x} x={x} y={1590} width="34" height="400" fill="url(#ve-wood)" stroke={K} strokeWidth="8" />
          ))}
          {/* pila di cartelle a destra */}
          <g transform="translate(860 1640)">
            {[0, 1, 2, 3].map((i) => (
              <g key={i} transform={`translate(${(i % 2) * 14 - 6} ${-i * 46}) rotate(${(i % 2 ? 2 : -2) + i})`}>
                <rect x="-170" y="0" width="360" height="46" rx="5" fill={i === 3 ? '#D8C394' : i % 2 ? '#B9A170' : '#C9B080'} stroke={K} strokeWidth="8" />
                <path d="M-160 12 H178" stroke="#F2E6C6" strokeWidth="3" opacity=".6" />
              </g>
            ))}
            <rect x="-180" y="40" width="380" height="400" fill="#1A120C" stroke={K} strokeWidth="8" />
          </g>
        </g>

        {/* PIANO 6 — pulviscolo vicino alla camera (1,7) */}
        <g transform={L(1.7)}>
          {NEAR.map((n, i) => (
            <circle key={i} cx={n.x + Math.sin(t * 0.4 + n.ph) * 60} cy={n.y - mod(t * 14 + i * 90, 400) + 200} r={n.rad} fill="url(#ve-dust)" opacity={0.09 * light} />
          ))}
        </g>
      </g>

      <Finish id="ve" tint="#0E3A40" tintOpacity={0.13} />
    </svg>
  );
};
