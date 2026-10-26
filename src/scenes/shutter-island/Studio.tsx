import React from 'react';
import { camera, eio, eo, lerp, mod, rainPath, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';

// Lo studio del direttore: giradischi, pillole che cadono, pipa fumante, pioggia alla finestra.
// Piani: parete a pannelli, libreria e finestra con pioggia (0,25) · scrivania (0,55) · lampada, giradischi,
//        pipa, flacone e pillole (0,65) · bicchiere (0,9) · poltrona in primo piano (1,25) · pulviscolo vicino (1,7)

const K = '#0B1214';
const WIN = { x: 610, y: 590, w: 370, h: 410 };
const DESK_Y = 1090; // bordo posteriore del piano della scrivania (orizzonte)
const LAMP = { x: 210, y: 990 };
const REC = { x: 770, y: 1098, rx: 150, ry: 38 };
const BOTTLE = { x: 430, y: 1160 }; // perno del flacone che si rovescia

const r = rng(1957);
// libri della libreria
const BOOKS = Array.from({ length: 3 }, (_, s) => {
  const out: { x: number; w: number; h: number; c: string; lean: number }[] = [];
  let x = 50;
  while (x < 320) {
    const w = 18 + Math.floor(r() * 16);
    out.push({ x, w, h: 90 + r() * 46, c: ['#3E5A5E', '#5C4A3E', '#2C3E46', '#6B6A5A', '#4A3A40', '#7C8C86'][Math.floor(r() * 6)], lean: r() > 0.9 ? 8 : 0 });
    x += w + 2;
  }
  return { y: 800 + s * 150, books: out };
});
const DROPS = Array.from({ length: 16 }, () => ({ x: WIN.x + 16 + r() * (WIN.w - 32), sp: 0.12 + r() * 0.22, ph: r(), s: 4 + r() * 4, wob: r() * 6 }));
const BEADS = Array.from({ length: 40 }, () => ({ x: WIN.x + r() * WIN.w, y: WIN.y + r() * WIN.h, s: 1.5 + r() * 3 }));
const DUST = Array.from({ length: 22 }, () => ({ u: r(), v: r(), s: 2 + r() * 3.5, sp: 0.03 + r() * 0.04, ph: r() * 6 }));
const NEAR = Array.from({ length: 6 }, (_, i) => ({ x: r() * 1080, y: 600 + r() * 1200, rad: 40 + r() * 60, ph: i }));
// pillole: dove si fermano dopo essere uscite dal flacone
const PILLS = Array.from({ length: 7 }, (_, i) => ({ t0: 2.15 + i / 6, x: 500 + i * 22 + r() * 30, y: 1172 + r() * 34, rot: r() * 360, spin: 200 + r() * 300 }));

// punto sull'ellisse del disco
const onRec = (a: number, k = 1) => ({ x: REC.x + Math.cos(a) * REC.rx * k, y: REC.y + Math.sin(a) * REC.ry * k });
const arc = (a0: number, a1: number, k: number) => {
  const p0 = onRec(a0, k);
  const p1 = onRec(a1, k);
  return `M${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${(REC.rx * k).toFixed(1)} ${(REC.ry * k).toFixed(1)} 0 0 1 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
};

// filo di fumo sinuoso che sale dalla pipa
const smokeStrand = (x0: number, y0: number, t: number, k: number) => {
  let d = `M${x0} ${y0}`;
  for (let i = 1; i <= 14; i++) {
    const h = i * 22;
    const x = x0 + Math.sin(h * 0.028 + t * 1.4 + k * 2.1) * (6 + h * 0.14) + h * 0.12;
    d += ` L${x.toFixed(1)} ${(y0 - h).toFixed(1)}`;
  }
  return d;
};

export const Studio: React.FC<SceneProps> = ({ t, dur, palette: P }) => {
  const cam = camera(t, dur, 540, 1040);
  const L = cam.layer;

  // Un solo lampo alla finestra, sugli incubi (3ª frase): 4,6 s
  const flash = seg(t, 4.6, 4.66) * (1 - seg(t, 4.75, 5.4));
  const lampPulse = 0.5 + 0.5 * Math.sin(t * 2.2) * 0.8 + 0.1 * Math.sin(t * 7.3);

  // Disco: 33 giri ≈ 3,5 rad/s
  const spin = t * 3.5;

  // Flacone che si rovescia quando Cawley offre le pillole (2ª frase, ~1,75 s)
  const tip = eio(seg(t, 1.7, 2.15));
  const bottleRot = tip * 90 + Math.sin(seg(t, 2.15, 2.6) * Math.PI) * -6;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="st" />
        <Lin id="st-wall" stops={[[0, '#0A1214'], [0.3, '#142226'], [0.55, '#22302F'], [1, '#1A2424']]} />
        <Lin id="st-panel" x2={1} y2={0} stops={[[0, '#3A2C22'], [0.25, '#2A1F18'], [1, '#1A1410']]} />
        <Lin id="st-night" stops={[[0, '#0A161C'], [0.6, '#1A3540'], [1, '#2A4E58']]} />
        <Lin id="st-curtain" x2={1} y2={0} stops={[[0, '#1E3A3E'], [0.5, '#2E5256'], [1, '#16292C']]} />
        <Lin id="st-desk" stops={[[0, '#5A3E2A'], [0.5, '#4A3222'], [1, '#2E1F15']]} />
        <Lin id="st-front" x2={1} y2={0} stops={[[0, '#4A3222'], [0.35, '#3A271A'], [1, '#1E140D']]} />
        <Lin id="st-shelf" x2={1} y2={0} stops={[[0, '#4E3828'], [1, '#2A1E15']]} />
        <Lin id="st-shade" stops={[[0, '#2E6A5A'], [0.6, '#1E4A40'], [1, '#123028']]} />
        <Lin id="st-brass" x2={1} y2={0} stops={[[0, '#FFE08A'], [0.5, '#C99A3A'], [1, '#6E4E1A']]} />
        <Lin id="st-cone" stops={[[0, '#FFD98A', 0.45], [1, '#FFD98A', 0]]} />
        <Lin id="st-plinth" x2={1} y2={0} stops={[[0, '#6E4A30'], [0.5, '#4E3422'], [1, '#2E1E14']]} />
        <Lin id="st-glass" x2={1} y2={0} stops={[[0, '#9FB8B8', 0.5], [0.3, '#E6F0EE', 0.75], [1, '#5F7878', 0.45]]} />
        <Lin id="st-whisky" stops={[[0, '#C98A3A'], [1, '#6E4418']]} />
        <Lin id="st-amber" x2={1} y2={0} stops={[[0, '#2E1C10'], [0.4, '#6A4220'], [1, '#2A180C']]} />
        <Lin id="st-leather" x2={1} y2={0} stops={[[0, '#2A1A14'], [0.5, '#4A2E22'], [1, '#1C120E']]} />
        <GlowGradient id="st-warm" color="#FFD08A" core={0.85} mid={0.3} />
        <GlowGradient id="st-pool" color="#FFC76A" core={0.6} mid={0.22} />
        <GlowGradient id="st-smoke" color="#CBD6D6" core={0.8} mid={0.35} />
        <GlowGradient id="st-dust" color="#F4E6C4" core={0.9} mid={0.35} />
        <GlowGradient id="st-cold" color="#9CC3CA" core={0.5} mid={0.18} />
        <GlowGradient id="st-acc" color={P.accento} core={0.55} mid={0.18} />
        <clipPath id="st-winclip">
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} />
        </clipPath>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete a pannelli, libreria, finestra con la pioggia (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height={DESK_Y + 300} fill="url(#st-wall)" />
          {/* boiserie sotto la finestra e sui lati */}
          <rect x="-200" y="1010" width="1480" height="200" fill="url(#st-panel)" />
          <path d="M-200 1010 H1280" stroke={K} strokeWidth="8" />
          <path d="M-200 1018 H1280" stroke="#8C6C4E" strokeWidth="3" opacity=".45" />
          {/* finestra: notte, alberi che ondeggiano, pioggia e lampo */}
          <rect x={WIN.x - 20} y={WIN.y - 20} width={WIN.w + 40} height={WIN.h + 40} rx="6" fill="#2A1F18" stroke={K} strokeWidth="9" />
          <g clipPath="url(#st-winclip)">
            <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="url(#st-night)" />
            <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="#DCEFF5" opacity={flash * 0.75} />
            <circle cx={WIN.x + 280} cy={WIN.y + 90} r="90" fill="url(#st-cold)" />
            <g transform={`rotate(${Math.sin(t * 1.1) * 3} ${WIN.x + 80} ${WIN.y + WIN.h})`}>
              <path d={`M${WIN.x - 20} ${WIN.y + WIN.h} L${WIN.x + 40} ${WIN.y + 200} L${WIN.x + 70} ${WIN.y + 260} L${WIN.x + 100} ${WIN.y + 150} L${WIN.x + 140} ${WIN.y + 280} L${WIN.x + 170} ${WIN.y + WIN.h} Z`} fill="#0E1E22" />
            </g>
            <g transform={`rotate(${Math.sin(t * 0.9 + 1) * 2.5} ${WIN.x + 300} ${WIN.y + WIN.h})`}>
              <path d={`M${WIN.x + 200} ${WIN.y + WIN.h} L${WIN.x + 260} ${WIN.y + 250} L${WIN.x + 300} ${WIN.y + 190} L${WIN.x + 340} ${WIN.y + 270} L${WIN.x + 400} ${WIN.y + WIN.h} Z`} fill="#0E1E22" />
            </g>
            {/* luce lontana di un altro padiglione */}
            <rect x={WIN.x + 180} y={WIN.y + 330} width="14" height="18" fill="#FFD25C" opacity=".8" />
            <path d={rainPath(40, 12, 34, 8, 420, 460)} transform={`translate(${WIN.x} ${WIN.y - 460 + mod(t * 620, 460)})`} stroke="#9CC3CA" strokeWidth="2.5" opacity=".5" />
            <path d={rainPath(40, 12, 34, 8, 420, 460)} transform={`translate(${WIN.x} ${WIN.y + mod(t * 620, 460)})`} stroke="#9CC3CA" strokeWidth="2.5" opacity=".5" />
            <path d={`M${WIN.x + 250} ${WIN.y} L${WIN.x + 225} ${WIN.y + 80} L${WIN.x + 250} ${WIN.y + 76} L${WIN.x + 215} ${WIN.y + 190}`} fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinejoin="round" opacity={flash} />
            {/* gocce ferme sul vetro */}
            {BEADS.map((b, i) => (
              <circle key={i} cx={b.x} cy={b.y} r={b.s} fill="#BFD9DE" opacity=".45" />
            ))}
            {/* gocce che scorrono sul vetro lasciando una scia */}
            {DROPS.map((d, i) => {
              const p = mod(t * d.sp + d.ph, 1);
              const y = WIN.y - 20 + p * (WIN.h + 40);
              const x = d.x + Math.sin(p * 8 + d.wob) * 5;
              return (
                <g key={i}>
                  <path d={`M${x} ${y - 70 - d.s * 6} Q${x + 4} ${y - 30} ${x} ${y}`} stroke="#BFD9DE" strokeWidth={d.s * 0.6} fill="none" opacity=".35" strokeLinecap="round" />
                  <ellipse cx={x} cy={y} rx={d.s} ry={d.s * 1.3} fill="#D6EAEE" opacity=".75" />
                  <circle cx={x - d.s * 0.3} cy={y - d.s * 0.4} r={d.s * 0.3} fill="#FFFFFF" opacity=".8" />
                </g>
              );
            })}
          </g>
          <path d={`M${WIN.x + WIN.w / 2} ${WIN.y} V${WIN.y + WIN.h} M${WIN.x} ${WIN.y + WIN.h * 0.45} H${WIN.x + WIN.w}`} stroke="#2A1F18" strokeWidth="14" />
          <path d={`M${WIN.x + WIN.w / 2} ${WIN.y} V${WIN.y + WIN.h} M${WIN.x} ${WIN.y + WIN.h * 0.45} H${WIN.x + WIN.w}`} stroke={K} strokeWidth="14" opacity=".5" />
          <rect x={WIN.x - 36} y={WIN.y + WIN.h + 14} width={WIN.w + 72} height="22" fill="#4E3828" stroke={K} strokeWidth="7" />
          {/* tende ai lati */}
          <path d={`M${WIN.x - 70} ${WIN.y - 50} H${WIN.x + 10} Q${WIN.x - 10} ${WIN.y + 220} ${WIN.x + 20} ${WIN.y + 480} H${WIN.x - 80} Z`} fill="url(#st-curtain)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d={`M${WIN.x + WIN.w + 70} ${WIN.y - 50} H${WIN.x + WIN.w - 10} Q${WIN.x + WIN.w + 10} ${WIN.y + 220} ${WIN.x + WIN.w - 20} ${WIN.y + 480} H${WIN.x + WIN.w + 80} Z`} fill="url(#st-curtain)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d={`M${WIN.x - 40} ${WIN.y - 30} Q${WIN.x - 52} ${WIN.y + 220} ${WIN.x - 40} ${WIN.y + 460}`} fill="none" stroke="#5E8286" strokeWidth="4" opacity=".55" />
          <path d={`M${WIN.x - 90} ${WIN.y - 54} H${WIN.x + WIN.w + 90}`} stroke="#6E5236" strokeWidth="12" strokeLinecap="round" />
          {/* luce fredda della finestra sulla parete */}
          <ellipse cx={WIN.x + WIN.w / 2} cy={WIN.y + WIN.h / 2} rx="330" ry="330" fill="url(#st-cold)" opacity={0.35 + flash * 0.8} />

          {/* libreria */}
          <rect x="30" y="640" width="310" height="380" fill="url(#st-shelf)" stroke={K} strokeWidth="9" />
          <rect x="44" y="652" width="282" height="360" fill="#140E0A" />
          {BOOKS.map((s, si) => (
            <g key={si}>
              {s.books.map((b, i) => (
                <rect key={i} x={b.x} y={s.y - b.h} width={b.w} height={b.h} fill={b.c} stroke={K} strokeWidth="3" transform={b.lean ? `rotate(${b.lean} ${b.x} ${s.y})` : undefined} />
              ))}
              <path d={`M38 ${s.y} H332`} stroke={K} strokeWidth="10" />
              <path d={`M40 ${s.y + 4} H330`} stroke="#8C6C4E" strokeWidth="3" opacity=".5" />
            </g>
          ))}
          <path d="M335 646 V1016" stroke="#8C6C4E" strokeWidth="4" opacity=".5" />
          {/* diploma incorniciato */}
          <rect x="400" y="700" width="130" height="100" fill="#D8CFB8" stroke="#6E5236" strokeWidth="10" />
          <path d="M424 730 H506 M424 752 H496 M424 772 H486" stroke="#8C8270" strokeWidth="4" />
          <circle cx="500" cy="782" r="8" fill="#8E3A2A" />
        </g>

        {/* PIANO 1 — scrivania (0,55) */}
        <g transform={L(0.55)}>
          <path d={`M-200 ${DESK_Y} H1280 L1300 1230 H-220 Z`} fill="url(#st-desk)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M-200 1096 H1280" stroke="#8C6C4E" strokeWidth="3" opacity=".5" />
          {/* venature del legno */}
          <path d="M-100 1130 Q200 1120 500 1136 T1100 1128 M-140 1190 Q300 1176 700 1196 T1240 1186" fill="none" stroke="#3A271A" strokeWidth="3" opacity=".6" />
          <rect x="-220" y="1228" width="1520" height="700" fill="url(#st-front)" stroke={K} strokeWidth="9" />
          <path d="M-220 1236 H1300" stroke="#9C7A58" strokeWidth="4" opacity=".55" />
          <rect x="120" y="1290" width="330" height="150" rx="6" fill="none" stroke={K} strokeWidth="7" opacity=".7" />
          <rect x="620" y="1290" width="330" height="150" rx="6" fill="none" stroke={K} strokeWidth="7" opacity=".7" />
          <rect x="255" y="1352" width="60" height="18" rx="9" fill="url(#st-brass)" stroke={K} strokeWidth="5" />
          <rect x="755" y="1352" width="60" height="18" rx="9" fill="url(#st-brass)" stroke={K} strokeWidth="5" />
          {/* pozza di luce calda della lampada sul piano */}
          <ellipse cx={LAMP.x - 20} cy="1168" rx={330 + lampPulse * 14} ry="70" fill="url(#st-pool)" opacity={0.6 + lampPulse * 0.08} />
        </g>

        {/* PIANO 2 — oggetti sulla scrivania (0,65) */}
        <g transform={L(0.65)}>
          {/* oggetti ingranditi attorno al centro della scrivania */}
          <g transform="translate(560 1180) scale(1.25) translate(-560 -1180)">
          {/* lampada da tavolo con paralume verde */}
          <path d={`M${LAMP.x} ${LAMP.y + 10} L${LAMP.x - 150} 1170 H${LAMP.x + 270} Z`} fill="url(#st-cone)" opacity={0.65 + lampPulse * 0.1} />
          <ellipse cx={LAMP.x} cy="1158" rx="64" ry="16" fill="url(#st-brass)" stroke={K} strokeWidth="7" />
          <path d={`M${LAMP.x} 1150 V${LAMP.y + 10}`} stroke={K} strokeWidth="16" strokeLinecap="round" />
          <path d={`M${LAMP.x} 1150 V${LAMP.y + 10}`} stroke="#C99A3A" strokeWidth="8" strokeLinecap="round" />
          <path d={`M${LAMP.x + 30} ${LAMP.y + 14} V1040`} stroke={K} strokeWidth="4" />
          <circle cx={LAMP.x + 30} cy="1046" r="7" fill="url(#st-brass)" stroke={K} strokeWidth="3" />
          <circle cx={LAMP.x} cy={LAMP.y + 14} r={150 + lampPulse * 14} fill="url(#st-warm)" opacity={0.55 + lampPulse * 0.1} />
          <path d={`M${LAMP.x - 96} ${LAMP.y + 14} Q${LAMP.x - 90} ${LAMP.y - 44} ${LAMP.x} ${LAMP.y - 46} Q${LAMP.x + 90} ${LAMP.y - 44} ${LAMP.x + 96} ${LAMP.y + 14} Z`} fill="url(#st-shade)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d={`M${LAMP.x - 70} ${LAMP.y - 26} Q${LAMP.x - 20} ${LAMP.y - 44} ${LAMP.x + 30} ${LAMP.y - 40}`} fill="none" stroke="#8CC4B0" strokeWidth="4" opacity=".7" />
          <path d={`M${LAMP.x - 90} ${LAMP.y + 14} H${LAMP.x + 90}`} stroke="#FFE7A0" strokeWidth="6" />

          {/* portacenere con la pipa e pacchetto di sigarette */}
          <rect x="250" y="1070" width="62" height="86" rx="4" fill="#C9C2AA" stroke={K} strokeWidth="6" transform="translate(-36 0) rotate(-6 281 1156)" />
          <rect x="250" y="1100" width="62" height="26" fill="#3E5A5E" transform="translate(-36 0) rotate(-6 281 1156)" />
          <path d="M262 1072 v-22 M278 1070 v-28" stroke="#F2EEE2" strokeWidth="9" strokeLinecap="round" transform="translate(-36 0) rotate(-6 281 1156)" />
          <ellipse cx="320" cy="1182" rx="70" ry="18" fill="#3A4C50" stroke={K} strokeWidth="7" />
          <ellipse cx="320" cy="1178" rx="46" ry="10" fill="#1A2426" />
          <path d="M270 1176 H370" stroke="#A9BFC2" strokeWidth="3" opacity=".6" />
          {/* pipa */}
          <path d="M344 1170 Q334 1128 372 1124 H394 V1150 Q392 1172 370 1174 Z" fill="#5A3A22" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          <path d="M346 1166 Q300 1176 268 1168" stroke={K} strokeWidth="10" strokeLinecap="round" fill="none" />
          <ellipse cx="383" cy="1126" rx="11" ry="4" fill="#FFC46A" opacity={0.5 + 0.3 * Math.sin(t * 3)} />
          {/* fumo della pipa: fili sinuosi e volute che salgono nella luce */}
          {[0, 1, 2, 3].map((k) => {
            const p = mod(t * 0.22 + k / 4, 1);
            return (
              <path key={k} d={smokeStrand(383, 1118, t, k)} transform={`translate(${p * 30} ${-p * 220})`} fill="none" stroke="#D2DCDC" strokeWidth={5 + p * 8} strokeLinecap="round" strokeLinejoin="round" opacity={seg(p, 0, 0.12) * (1 - p) * 0.5} />
            );
          })}
          {Array.from({ length: 6 }, (_, i) => {
            const p = mod(t * 0.18 + i / 6, 1);
            return <circle key={i} cx={390 + p * 80 + Math.sin(p * 7 + i) * 24} cy={1060 - p * 360} r={20 + p * 60} fill="url(#st-smoke)" opacity={seg(p, 0, 0.2) * (1 - p) * 0.3} />;
          })}

          {/* flacone di pillole che si rovescia */}
          <ellipse cx={BOTTLE.x + 50} cy={BOTTLE.y + 4} rx={30 + tip * 40} ry="10" fill="#000" opacity=".35" />
          <g transform={`rotate(${bottleRot} ${BOTTLE.x} ${BOTTLE.y})`}>
            <rect x={BOTTLE.x - 54} y={BOTTLE.y - 92} width="54" height="92" rx="8" fill="url(#st-amber)" stroke={K} strokeWidth="6" />
            <rect x={BOTTLE.x - 54} y={BOTTLE.y - 66} width="54" height="40" fill="#E9E2CC" stroke={K} strokeWidth="4" />
            <path d={`M${BOTTLE.x - 44} ${BOTTLE.y - 52} H${BOTTLE.x - 10} M${BOTTLE.x - 44} ${BOTTLE.y - 40} H${BOTTLE.x - 18}`} stroke="#6E6A5A" strokeWidth="3" />
            <path d={`M${BOTTLE.x - 12} ${BOTTLE.y - 86} V${BOTTLE.y - 8}`} stroke="#E8B47A" strokeWidth="3" opacity=".6" />
            <rect x={BOTTLE.x - 48} y={BOTTLE.y - 108} width="42" height="18" rx="4" fill="#E9F0F2" stroke={K} strokeWidth="5" opacity={1 - seg(t, 1.9, 2.0)} />
          </g>
          {/* tappo caduto */}
          <g opacity={seg(t, 1.9, 2.0)} transform={`translate(${lerp(BOTTLE.x + 80, BOTTLE.x + 40, eo(seg(t, 1.9, 2.4)))} ${1150 - Math.sin(seg(t, 1.9, 2.4) * Math.PI) * 30}) rotate(${seg(t, 1.9, 2.4) * 200})`}>
            <rect x="-21" y="-9" width="42" height="18" rx="4" fill="#E9F0F2" stroke={K} strokeWidth="5" />
          </g>
          {/* giradischi */}
          <path d="M600 1080 H950 L966 1150 H584 Z" fill="url(#st-plinth)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <rect x="584" y="1148" width="382" height="40" fill="#2E1E14" stroke={K} strokeWidth="8" />
          <path d="M604 1086 H946" stroke="#B08A60" strokeWidth="3" opacity=".6" />
          <circle cx="620" cy="1168" r="8" fill="url(#st-brass)" stroke={K} strokeWidth="3" />
          <circle cx="930" cy="1168" r="8" fill="url(#st-brass)" stroke={K} strokeWidth="3" />
          <ellipse cx={REC.x} cy={REC.y + 6} rx={REC.rx + 12} ry={REC.ry + 6} fill="#3A4448" stroke={K} strokeWidth="6" />
          <ellipse cx={REC.x} cy={REC.y} rx={REC.rx} ry={REC.ry} fill="#0E1214" stroke={K} strokeWidth="5" />
          {[0.85, 0.7, 0.55].map((k) => (
            <ellipse key={k} cx={REC.x} cy={REC.y} rx={REC.rx * k} ry={REC.ry * k} fill="none" stroke="#263034" strokeWidth="3" />
          ))}
          {/* riflesso della lampada sul disco: fisso, con un luccichio che gira con il solco */}
          <path d={arc(Math.PI * 1.08, Math.PI * 1.42, 0.78)} fill="none" stroke="#E9F0F2" strokeWidth="6" strokeLinecap="round" opacity={0.45 + 0.15 * Math.sin(spin * 2)} />
          <path d={arc(Math.PI * 0.08, Math.PI * 0.32, 0.78)} fill="none" stroke="#E9F0F2" strokeWidth="4" strokeLinecap="round" opacity={0.25 + 0.1 * Math.sin(spin * 2 + 1)} />
          <path d={arc(spin, spin + 0.5, 0.62)} fill="none" stroke="#9FB8BC" strokeWidth="3" strokeLinecap="round" opacity=".55" />
          <ellipse cx={REC.x} cy={REC.y} rx={REC.rx * 0.28} ry={REC.ry * 0.28} fill="#C9B88A" stroke={K} strokeWidth="3" />
          <circle cx={onRec(spin, 0.18).x} cy={onRec(spin, 0.18).y} r="3.5" fill="#5A3A22" />
          <circle cx={REC.x} cy={REC.y} r="3" fill={K} />
          {/* braccio */}
          <circle cx="925" cy="1078" r="16" fill="url(#st-brass)" stroke={K} strokeWidth="6" />
          <path d={`M925 1078 L${878 + Math.sin(t * 3.5) * 1.5} 1030 L${818 + Math.sin(t * 3.5) * 1.5} 1100`} fill="none" stroke={K} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
          <path d={`M925 1078 L${878 + Math.sin(t * 3.5) * 1.5} 1030 L${818 + Math.sin(t * 3.5) * 1.5} 1100`} fill="none" stroke="#D8C08A" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          <rect x={806 + Math.sin(t * 3.5) * 1.5} y="1094" width="26" height="14" rx="3" fill="#2A3438" stroke={K} strokeWidth="4" />
          {/* pillole che escono, cadono e rotolano: l'elemento chiave in arancione (davanti al giradischi, così non vengono tagliate) */}
          {PILLS.map((p, i) => {
            const q = seg(t, p.t0, p.t0 + 0.7);
            if (q <= 0) return null;
            const mouth = { x: BOTTLE.x + 100, y: BOTTLE.y - 28 };
            const x = lerp(mouth.x, p.x, eo(q));
            const hop = Math.abs(Math.sin(q * Math.PI * 2.2)) * 50 * (1 - q) ** 1.5;
            const y = lerp(mouth.y, p.y, Math.min(1, q * 2.2)) - hop;
            const rot = p.rot + eo(q) * p.spin;
            return (
              <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`}>
                {q > 0.9 && <ellipse cx="0" cy="8" rx="26" ry="6" fill="#000" opacity=".3" transform={`rotate(${-rot.toFixed(1)})`} />}
                <path d="M0 -10 H-14 A10 10 0 0 0 -14 10 H0 Z" fill={P.accento} stroke={K} strokeWidth="4" />
                <path d="M0 -10 H14 A10 10 0 0 1 14 10 H0 Z" fill="#F2EEE2" stroke={K} strokeWidth="4" />
                <path d="M-16 -5 H-4" stroke="#FFC9A8" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            );
          })}
          <circle cx="560" cy="1190" r={110 * seg(t, 2.2, 2.8)} fill="url(#st-acc)" opacity={0.35 + 0.08 * Math.sin(t * 2.5)} />

          {/* note che salgono dal giradischi */}
          {[0, 1, 2].map((k) => {
            const p = mod(t / 2.6 + k / 3, 1);
            return (
              <path key={k} d="M0 0 v-38 l24 -7 v34 M0 0 a8 6 0 1 1 -1 0 M24 -11 a8 6 0 1 1 -1 0" transform={`translate(${720 + k * 60 + Math.sin(p * 5 + k) * 18} ${1040 - p * 230}) rotate(${Math.sin(p * 4 + k) * 12})`} fill="none" stroke="#C9D6D6" strokeWidth="5" strokeLinecap="round" opacity={Math.sin(p * Math.PI) * 0.55} />
            );
          })}
          </g>
        </g>

        {/* lampo che rischiara tutta la stanza */}
        <rect x="-200" y="-200" width="1480" height="2400" fill="#CFE7F0" opacity={flash * 0.12} />

        {/* PIANO 3 — bicchiere di whisky sul bordo della scrivania (0,9) */}
        <g transform={L(0.9)}>
          <ellipse cx="1010" cy="1214" rx="64" ry="12" fill="#000" opacity=".35" />
          <path d="M954 1110 L962 1210 H1058 L1066 1110 Z" fill="url(#st-glass)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          <path d={`M958 ${1160 + Math.sin(t * 1.3) * 1.5} L963 1208 H1057 L1062 ${1160 - Math.sin(t * 1.3) * 1.5} Z`} fill="url(#st-whisky)" opacity=".85" />
          <rect x="980" y="1148" width="26" height="24" rx="4" fill="#E6F0EE" opacity=".55" transform={`rotate(${12 + Math.sin(t) * 3} 993 1160)`} />
          <path d="M968 1120 L974 1200" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity=".8" />
          <ellipse cx="1010" cy="1110" rx="56" ry="9" fill="none" stroke={K} strokeWidth="5" />
        </g>

        {/* PIANO 4 — schienale della poltrona di pelle in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <path d="M-160 2100 V1560 Q-160 1440 -20 1430 H260 Q380 1440 390 1560 V2100 Z" fill="url(#st-leather)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
          <path d="M-140 1520 Q-120 1452 -20 1450 H250" fill="none" stroke="#8C5E46" strokeWidth="5" opacity=".6" />
          {Array.from({ length: 7 }, (_, i) => (
            <circle key={i} cx={-100 + i * 70} cy="1500" r="7" fill="url(#st-brass)" stroke={K} strokeWidth="3" />
          ))}
          <path d="M40 1560 Q60 1700 40 1860 M200 1560 Q220 1700 200 1860" fill="none" stroke="#1C120E" strokeWidth="6" />
          {/* gamba del tavolino a destra */}
          <rect x="930" y="1560" width="200" height="40" rx="8" fill="#3A271A" stroke={K} strokeWidth="9" />
          <rect x="980" y="1600" width="50" height="500" fill="url(#st-front)" stroke={K} strokeWidth="9" />
        </g>

        {/* PIANO 5 — pulviscolo vicino nella luce calda (1,7) */}
        <g transform={L(1.7)}>
          {DUST.map((d, i) => {
            const v = mod(d.v + t * d.sp, 1);
            const x = LAMP.x - 120 + d.u * 420 + Math.sin(t * 0.8 + d.ph) * 18;
            const y = 1180 - v * 420;
            return <circle key={i} cx={x} cy={y} r={d.s} fill="#FFE7B8" opacity={(0.3 + 0.4 * (0.5 + 0.5 * Math.sin(t * 2 + d.ph))) * Math.sin(v * Math.PI)} />;
          })}
          {NEAR.map((n, i) => (
            <circle key={i} cx={n.x + Math.sin(t * 0.4 + n.ph) * 60} cy={n.y - mod(t * 18 + i * 90, 400) + 200} r={n.rad} fill="url(#st-dust)" opacity=".08" />
          ))}
        </g>
      </g>

      <Finish id="st" tint="#0E3A40" tintOpacity={0.12} />
    </svg>
  );
};
