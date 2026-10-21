import React from 'react';
import { camera, eio, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { DISPLAY, HAND } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, Lightning, NearMotes, Rain, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Abby Normal: deposito di barattoli sotto vetro al chiaro di luna; fuori dalla finestra un patibolo vuoto sotto
// la pioggia. Il barattolo del grande scienziato cade e va in frantumi; al suo posto arriva quello con l'etichetta
// «ABNORMAL». Nessuna persona.
// Eventi: lampo che mostra il patibolo (cue 1) · luce sul barattolo «Delbrück» (cue 2) · il barattolo cade e si rompe,
//         secondo lampo (cue 3) · arriva il barattolo ABNORMAL con l'etichetta verde-acqua (cue 4).
// Piani: parete e finestra con patibolo (0,2) · scaffali con barattoli (0,5) · piedistallo e barattolo (0,7)
//        · pavimento con cocci (0,85) · carriola e pala in primo piano (1,2) · pulviscolo e particelle (1,5–1,8)

const K = '#0C0D10';
const ACC = '#8EF0C8';
const r = rng(1974);
const SHARDS = Array.from({ length: 12 }, () => ({ vx: (r() - 0.5) * 460, vy: -60 - r() * 160, rot: r() * 360, s: 10 + r() * 18 }));
const SHELF = Array.from({ length: 6 }, (_, i) => ({ x: 120 + i * 150, h: 120 + r() * 30, tint: r() > 0.5 ? '#9FB0A6' : '#AEB6BE' }));

/** Barattolo con cervello ed etichetta. */
const Jar: React.FC<{ label?: string; sub?: string; labelFill?: string; w?: number; h?: number }> = ({ label, sub, labelFill = '#E2DCC8', w = 190, h = 210 }) => (
  <g>
    <rect x={-w / 2} y={-h} width={w} height={h} rx="22" fill="#A9B8AE" opacity=".38" stroke={K} strokeWidth="8" />
    <path d={`M${-w * 0.3} ${-h * 0.42} q0 -${h * 0.3} ${w * 0.3} -${h * 0.3} q${w * 0.3} 0 ${w * 0.28} ${h * 0.22} q0 ${h * 0.18} -${w * 0.28} ${h * 0.18} q-${w * 0.3} ${h * 0.04} -${w * 0.3} -${h * 0.1} Z`} fill="#C9B0A8" stroke={K} strokeWidth="6" />
    <path d={`M${-w * 0.18} ${-h * 0.56} q${w * 0.1} -${h * 0.06} ${w * 0.18} 0 q${w * 0.1} ${h * 0.06} ${w * 0.2} -${h * 0.03} M${-w * 0.16} ${-h * 0.46} q${w * 0.14} ${h * 0.05} ${w * 0.3} -${h * 0.02}`} fill="none" stroke="#7A5E58" strokeWidth="4" />
    <rect x={-w / 2 - 8} y={-h - 26} width={w + 16} height="30" rx="6" fill="#3A3D42" stroke={K} strokeWidth="7" />
    <path d={`M${-w / 2 + 16} ${-h + 20} v${h - 50}`} stroke="#FFFFFF" strokeWidth="6" opacity=".35" />
    {label && (
      <g>
        <rect x={-w / 2 + 10} y={-h * 0.3} width={w - 20} height={sub ? 62 : 46} rx="4" fill={labelFill} stroke={K} strokeWidth="5" />
        <text x="0" y={-h * 0.3 + 32} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="21" fill={K}>{label}</text>
        {sub && <text x="0" y={-h * 0.3 + 54} textAnchor="middle" fontFamily={HAND} fontSize="20" fill="#3A342C">{sub}</text>}
      </g>
    )}
  </g>
);

export const Cervello: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const flash = flashAt(t, [cues[1] + 0.1, cues[3] + 0.55], [1, 0.6]);
  const spot = seg(t, cues[2], cues[2] + 0.6);
  // caduta del barattolo Delbrück: vacilla, cade, si rompe
  const wobble = seg(t, cues[3] - 0.2, cues[3] + 0.25);
  const fall = seg(t, cues[3] + 0.25, cues[3] + 0.55);
  const broke = t > cues[3] + 0.55;
  const shardP = eo(seg(t, cues[3] + 0.55, cues[3] + 1.3));
  // barattolo ABNORMAL che arriva sul piedistallo dallo scaffale
  const swap = eio(seg(t, cues[4] - 0.4, cues[4] + 0.6));
  const tag = eob(seg(t, cues[4] + 0.5, cues[4] + 1.0));
  const sway = Math.sin(t * 1.3) * 6;
  const pedX = 560, pedY = 1080;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ce" />
        <Lin id="ce-wall" stops={[[0, '#0E1013'], [0.4, '#22262B'], [0.75, '#2E3339'], [1, '#1A1D21']]} />
        <Lin id="ce-night" stops={[[0, '#0A0C10'], [0.6, '#1E252E'], [1, '#2E3742']]} />
        <Lin id="ce-wood" stops={[[0, '#4A3E32'], [1, '#2A231C']]} />
        <Lin id="ce-ped" x2={1} y2={0} stops={[[0, '#2A2D31'], [0.5, '#5A5F64'], [1, '#2E3135']]} />
        <Lin id="ce-floor" stops={[[0, '#2A2D31'], [1, '#0C0D0F']]} />
        <Lin id="ce-front" stops={[[0, '#2A2420'], [1, '#0C0A08']]} />
        <Lin id="ce-metal" x2={1} y2={0} stops={[[0, '#3A3F44'], [0.5, '#8C949C'], [1, '#3A3F44']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete e finestra sul patibolo sotto la pioggia (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#ce-wall)" />
          <g>
            <rect x="830" y="300" width="200" height="300" fill="url(#ce-night)" />
            <rect x="830" y="300" width="200" height="300" fill="#DCE4EA" opacity={flash * 0.6} />
            <clipPath id="ce-win"><rect x="830" y="300" width="200" height="300" /></clipPath>
            <g clipPath="url(#ce-win)">
              <Lightning x={980} y={290} h={200} flash={flash} seed={9} width={6} />
              {/* patibolo vuoto con il cappio che oscilla */}
              <g fill="#07080A">
                <path d="M780 600 L800 520 H1000 L1010 600 Z" />
                <rect x="820" y="380" width="14" height="150" />
                <rect x="814" y="378" width="120" height="14" />
                <path d="M834 410 L866 392" stroke="#07080A" strokeWidth="10" />
              </g>
              <g transform={`rotate(${sway} 910 392)`}>
                <path d="M910 392 V448" stroke="#07080A" strokeWidth="5" />
                <ellipse cx="910" cy="462" rx="12" ry="16" fill="none" stroke="#07080A" strokeWidth="5" />
              </g>
              <Rain t={t} level="far" seed={7} x={720} w={360} y={200} h={500} color="#8A98A6" opacity={0.6} />
            </g>
            <rect x="830" y="300" width="200" height="300" fill="none" stroke={K} strokeWidth="12" />
            <path d="M930 300 V600 M830 450 H1030" stroke={K} strokeWidth="9" />
            <path d="M830 300 V600 M1030 300 V600" stroke="#4E555B" strokeWidth="4" />
          </g>
          <Beam id="ce-moon" x={930} y={450} t={t} length={1000} spread={360} color="#C9D3DB" angle={120} opacity={0.2} />
        </g>

        {/* PIANO 1 — scaffali con barattoli (0,5) */}
        <g transform={L(0.5)}>
          <rect x="40" y="690" width="1000" height="18" fill="url(#ce-wood)" stroke={K} strokeWidth="6" />
          <rect x="40" y="920" width="1000" height="18" fill="url(#ce-wood)" stroke={K} strokeWidth="6" />
          {SHELF.map((j, i) => (
            <g key={i}>
              <g transform={`translate(${j.x} 690) scale(0.55)`}><Jar w={150} h={j.h * 1.4} /></g>
              {i !== 2 && <g transform={`translate(${j.x + 70} 920) scale(0.55)`}><Jar w={150} h={(j.h + 20) * 1.4} /></g>}
            </g>
          ))}
          {/* posto vuoto sul ripiano basso: da qui parte il barattolo ABNORMAL */}
          <rect x="374" y="930" width="80" height="6" fill="#1A1714" opacity={swap} />
        </g>

        {/* PIANO 2 — piedistallo sotto il fascio di luna, barattoli che si scambiano (0,7) */}
        <g transform={L(0.7)}>
          <Glow id="ce-spot" x={pedX} y={pedY - 120} r={300} t={t} color="#DCE4EA" amp={0.05} rate={1.4} opacity={0.15 + 0.4 * spot} />
          <path d={`M${pedX - 110} ${pedY} H${pedX + 110} L${pedX + 80} ${pedY + 40} V1240 H${pedX - 80} V${pedY + 40} Z`} fill="url(#ce-ped)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d={`M${pedX - 104} ${pedY + 6} H${pedX + 104}`} stroke="#C9CFD4" strokeWidth="4" opacity=".7" />
          <rect x={pedX - 120} y="1232" width="240" height="24" rx="4" fill="#2A2D31" stroke={K} strokeWidth="7" />
          {/* barattolo Delbrück: vacilla e cade a destra */}
          {!broke && (
            <g transform={`translate(${pedX + fall * 200} ${pedY + eio(fall) * 160}) rotate(${Math.sin(wobble * Math.PI * 4) * 8 * (1 - fall) + fall * 95})`}>
              <Jar label="H. DELBRÜCK" sub="scienziato e santo" />
            </g>
          )}
          {/* barattolo ABNORMAL: dallo scaffale al piedistallo */}
          <g transform={`translate(${lerp(414, pedX, swap)} ${lerp(928, pedY, swap) - Math.sin(swap * Math.PI) * 120}) scale(${lerp(0.55, 1, swap)})`} opacity={broke ? 1 : 0}>
            <Glow id="ce-tag" x={0} y={-60} r={170} t={t} color={ACC} amp={0.12} rate={3} opacity={0.6 * tag} />
            <Jar label="ANORMALE" labelFill={swap > 0.9 ? ACC : '#E2DCC8'} />
          </g>
        </g>

        {/* PIANO 3 — pavimento con cocci e pozza (0,85) */}
        <g transform={L(0.85)}>
          <path d="M-200 1250 H1280 V2200 H-200 Z" fill="url(#ce-floor)" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-160 + i * 160} 1250 L${-260 + i * 190} 1700`} stroke="#0A0B0D" strokeWidth="4" opacity=".6" />)}
          <path d="M-200 1330 H1280 M-200 1450 H1280" stroke="#0A0B0D" strokeWidth="4" opacity=".6" />
          {broke && (
            <g>
              <ellipse cx="800" cy="1320" rx={160 * shardP} ry={26 * shardP} fill="#8EA6A0" opacity=".35" />
              <path d="M760 1300 q-20 -30 10 -46 q30 -16 46 6 q20 24 -6 40 q-30 14 -50 0 Z" fill="#C9B0A8" stroke={K} strokeWidth="6" />
              {SHARDS.map((s, i) => (
                <path key={i} d={`M0 ${-s.s} L${s.s * 0.6} ${s.s * 0.4} L${-s.s * 0.5} ${s.s * 0.5} Z`} fill="#C9D8DE" stroke={K} strokeWidth="3" opacity=".9"
                  transform={`translate(${790 + s.vx * shardP} ${1300 + s.vy * Math.sin(shardP * Math.PI) + 20 * shardP}) rotate(${s.rot + 300 * shardP})`} />
              ))}
            </g>
          )}
        </g>

        {/* PIANO 4 — carriola con pala e telo, casse in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <g transform="translate(-40 1480)">
            <rect x="0" y="0" width="300" height="220" fill="url(#ce-wood)" stroke={K} strokeWidth="9" />
            <path d="M0 70 H300 M0 140 H300 M0 0 L300 220" stroke={K} strokeWidth="6" opacity=".7" />
            <text x="150" y="120" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="30" fill="#8A7A64" opacity=".8">FRAGILE</text>
          </g>
          <g transform="translate(720 1520)">
            <path d="M-60 0 H300 L250 140 H-20 Z" fill="url(#ce-metal)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M-50 10 Q120 -60 290 10" fill="#5A5E58" stroke={K} strokeWidth="7" />
            <circle cx="40" cy="190" r="56" fill="#2A2D31" stroke={K} strokeWidth="10" />
            <path d="M250 140 L400 240" stroke={K} strokeWidth="18" strokeLinecap="round" />
            <path d="M120 -10 L60 -260" stroke="#5A4A38" strokeWidth="16" strokeLinecap="round" />
            <path d="M40 -250 h40 l-10 -60 h-20 Z" fill="url(#ce-metal)" stroke={K} strokeWidth="6" />
          </g>
        </g>

        {/* PIANO 5 — pulviscolo nel fascio di luna e particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 460, x0: 830, x1: 1030 }} bottom={{ y: 1240, x0: 260, x1: 760 }} n={26} color="#DCE4EA" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="ce-near" t={t} color="#DCE4EA" n={6} vx={-25} vy={-8} opacity={0.08} />
        </g>
      </g>

      <Finish id="ce" tint="#5E6B75" tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): lampo sul patibolo cue1 + 0,1 · luce sul barattolo cue2 · caduta cue3 + 0,25 e rottura + 0,55
// (secondo lampo) · barattolo ABNORMAL cue4 − 0,4 → + 0,6, etichetta verde-acqua + 0,5.
