import React from 'react';
import { Glow } from '../../lib/elements';

// Elementi comuni di Breaking Bad (stagione 1): il vecchio camper bianco e beige con le strisce marroni (il laboratorio
// nel deserto), la vetreria da chimica (beuta, provetta, pallone), il mucchio di cristalli che brilla (la droga purissima:
// l'accento giallo-oro va solo su questo e sugli oggetti chiave), cactus, cespugli e mesa del New Mexico.
// Mai persone: Walter, Jesse, Hank, Skyler, Tuco e gli spacciatori si raccontano con oggetti, luci e luoghi.
// Chi usa questi elementi passa un `id` unico per i gradienti e mette <BBDefs id> nei <defs>.

export const K = '#0E120E'; // contorni
export const ORO = '#F0B53A'; // accento
export const CRISTALLO = '#DDF2F4';

/** Gradienti dei materiali comuni (una volta per scena, dentro <defs>). */
export const BBDefs: React.FC<{ id: string }> = ({ id }) => (
  <>
    <linearGradient id={`${id}-rvbody`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FBF4E2" /><stop offset=".55" stopColor="#E6DAC0" /><stop offset="1" stopColor="#B8A888" /></linearGradient>
    <linearGradient id={`${id}-rvside`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".18" /><stop offset=".6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".22" /></linearGradient>
    <linearGradient id={`${id}-glassd`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6A8A94" /><stop offset=".5" stopColor="#2A3E46" /><stop offset="1" stopColor="#1A262C" /></linearGradient>
    <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5A6064" /><stop offset=".35" stopColor="#D8DEE0" /><stop offset=".6" stopColor="#9AA2A6" /><stop offset="1" stopColor="#3E4448" /></linearGradient>
    <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8A6038" /><stop offset="1" stopColor="#4A321C" /></linearGradient>
    <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FBF6EA" /><stop offset="1" stopColor="#DCD2BC" /></linearGradient>
    <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".5" /><stop offset=".25" stopColor="#FFFFFF" stopOpacity=".12" /><stop offset=".7" stopColor="#FFFFFF" stopOpacity=".04" /><stop offset="1" stopColor="#FFFFFF" stopOpacity=".35" /></linearGradient>
    <linearGradient id={`${id}-cactus`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6E9A5A" /><stop offset=".45" stopColor="#4E7A40" /><stop offset="1" stopColor="#2A4A24" /></linearGradient>
    <linearGradient id={`${id}-crys`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".5" stopColor={CRISTALLO} /><stop offset="1" stopColor="#8EC4CC" /></linearGradient>
    <radialGradient id={`${id}-shadow`}><stop offset="0" stopColor="#000" stopOpacity=".55" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
  </>
);

/** Ombra morbida a terra sotto un oggetto. */
export const Ombra: React.FC<{ id: string; x: number; y: number; rx: number; ry?: number; opacity?: number }> = ({ id, x, y, rx, ry = rx * 0.16, opacity = 1 }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id}-shadow)`} opacity={opacity} />
);

const Ruota: React.FC<{ id: string; x: number; y: number; r: number }> = ({ id, x, y, r }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#1A1C1C" stroke={K} strokeWidth="8" />
    <circle cx={x} cy={y} r={r * 0.55} fill={`url(#${id}-metal)`} stroke={K} strokeWidth="5" />
    <circle cx={x} cy={y} r={r * 0.16} fill="#2A2E30" stroke={K} strokeWidth="3" />
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return <circle key={i} cx={x + Math.cos(a) * r * 0.36} cy={y + Math.sin(a) * r * 0.36} r={r * 0.05} fill="#3A3E40" />;
    })}
    <path d={`M${x - r * 0.8} ${y - r * 0.45} A${r} ${r} 0 0 1 ${x - r * 0.1} ${y - r * 0.9}`} stroke="#4A4E50" strokeWidth="5" fill="none" />
  </g>
);

/**
 * Il camper: vecchio motorhome bianco e beige con strisce marroni, cabina con il letto sopra (cab-over) a destra,
 * finestrini, porta laterale con gradino, sfiato sul tetto. Origine a terra, al centro; largo ~820 a s=1.
 * `door` 0–1 apre la porta, `fog` 0–1 appanna i vetri di gas bianco, `lamp` accende una luce calda dentro.
 */
export const Camper: React.FC<{ id: string; x: number; y: number; s?: number; door?: number; fog?: number; lamp?: number; t?: number; fogColor?: string }> = ({
  id, x, y, s = 1, door = 0, fog = 0, lamp = 0, t = 0, fogColor = '#F2ECE4',
}) => {
  const winFill = lamp > 0 ? '#F6C870' : `url(#${id}-glassd)`;
  const win = (wx: number, wy: number, ww: number, wh: number, k: number) => (
    <g key={k}>
      <rect x={wx} y={wy} width={ww} height={wh} rx="10" fill={`url(#${id}-glassd)`} stroke={K} strokeWidth="6" />
      {lamp > 0 && <rect x={wx} y={wy} width={ww} height={wh} rx="10" fill={winFill} opacity={lamp * (0.85 + 0.1 * Math.sin(t * 7 + k))} />}
      <path d={`M${wx + 10} ${wy + wh - 12} L${wx + ww * 0.45} ${wy + 10}`} stroke="#FFFFFF" strokeWidth="5" opacity=".35" />
      <path d={`M${wx + ww / 2} ${wy} V${wy + wh}`} stroke={K} strokeWidth="4" />
      {fog > 0 && <rect x={wx + 3} y={wy + 3} width={ww - 6} height={wh - 6} rx="8" fill={fogColor} opacity={fog * (0.75 + 0.1 * Math.sin(t * 2 + k))} />}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
      <Ombra id={id} x={0} y={4} rx={470} ry={34} />
      {/* scaletta sul retro e portapacchi */}
      <path d="M-392 -440 V-150 M-372 -440 V-150" stroke="#5A5E60" strokeWidth="6" />
      {[-410, -360, -310, -260, -210].map((yy) => <path key={yy} d={`M-394 ${yy} H-370`} stroke="#5A5E60" strokeWidth="5" />)}
      {/* corpo */}
      <path d="M-380 -460 Q-380 -480 -360 -480 H250 Q300 -480 330 -440 L420 -440 Q440 -440 440 -420 V-310 L470 -250 Q480 -230 480 -200 V-90 Q480 -70 460 -70 H-380 Z" fill={`url(#${id}-rvbody)`} stroke={K} strokeWidth="10" />
      <path d="M-380 -460 Q-380 -480 -360 -480 H250 Q300 -480 330 -440 L420 -440 Q440 -440 440 -420 V-310 L470 -250 Q480 -230 480 -200 V-90 Q480 -70 460 -70 H-380 Z" fill={`url(#${id}-rvside)`} />
      <path d="M-370 -470 H250 Q290 -470 316 -440" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".8" />
      {/* strisce marroni e arancio */}
      <path d="M-380 -250 H330 L380 -290 H440" stroke="#6A3E1E" strokeWidth="22" fill="none" />
      <path d="M-380 -222 H340 L388 -262 H452" stroke="#B8682A" strokeWidth="10" fill="none" />
      <path d="M-380 -130 H480" stroke="#6A3E1E" strokeWidth="14" />
      {/* pannelli e rivetti */}
      {[-260, -120, 20, 160].map((px) => <path key={px} d={`M${px} -475 V-262`} stroke="#A89878" strokeWidth="3" opacity=".7" />)}
      {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={-370 + i * 30} cy={-100} r="3" fill="#8A7A5E" />)}
      {/* finestrini del vano abitabile */}
      {win(-340, -420, 150, 110, 1)}
      {win(-150, -420, 120, 110, 2)}
      {win(140, -420, 140, 110, 3)}
      {/* parabrezza e finestrino della cabina */}
      <path d="M340 -425 H420 V-315 L452 -255 H340 Z" fill={`url(#${id}-glassd)`} stroke={K} strokeWidth="7" />
      {fog > 0 && <path d="M344 -421 H416 V-315 L446 -259 H344 Z" fill={fogColor} opacity={fog * 0.8} />}
      <path d="M356 -270 L410 -410" stroke="#FFFFFF" strokeWidth="6" opacity=".3" />
      {/* porta laterale con il gradino */}
      <g>
        <rect x="-10" y="-430" width="120" height="340" fill="#1A1E1E" stroke={K} strokeWidth="7" />
        {lamp > 0 && <rect x="-10" y="-430" width="120" height="340" fill="#F6C870" opacity={lamp * 0.8 * door} />}
        {fog > 0 && <rect x="-6" y="-426" width="112" height="332" fill={fogColor} opacity={fog * 0.5 * door} />}
        <g transform={`translate(-10 0) scale(${1 - door * 0.82} 1) translate(10 0)`}>
          <rect x="-10" y="-430" width="120" height="340" fill={`url(#${id}-rvbody)`} stroke={K} strokeWidth="7" />
          <rect x="10" y="-405" width="80" height="80" rx="8" fill={`url(#${id}-glassd)`} stroke={K} strokeWidth="5" />
          {fog > 0 && <rect x="13" y="-402" width="74" height="74" rx="6" fill={fogColor} opacity={fog * 0.8} />}
          <path d="M-10 -250 H110" stroke="#6A3E1E" strokeWidth="22" />
          <rect x="88" y="-210" width="14" height="30" rx="4" fill={`url(#${id}-metal)`} stroke={K} strokeWidth="3" />
        </g>
        <rect x="-20" y="-82" width="140" height="18" fill={`url(#${id}-metal)`} stroke={K} strokeWidth="5" />
      </g>
      {/* sfiato sul tetto e condizionatore */}
      <rect x="-210" y="-520" width="90" height="42" rx="6" fill="#D8D0BC" stroke={K} strokeWidth="6" />
      <path d="M-200 -506 H-130 M-200 -494 H-130" stroke="#8A826E" strokeWidth="3" />
      <path d="M60 -480 L72 -512 H128 L140 -480 Z" fill="#C8C0AC" stroke={K} strokeWidth="6" />
      {/* paraurti, fanali, ruote */}
      <rect x="440" y="-110" width="50" height="34" rx="6" fill={`url(#${id}-metal)`} stroke={K} strokeWidth="5" />
      <rect x="462" y="-200" width="22" height="34" rx="4" fill="#FFF2C8" stroke={K} strokeWidth="4" />
      <rect x="-394" y="-200" width="18" height="40" fill="#C83A2A" stroke={K} strokeWidth="4" />
      <path d="M-300 -70 A80 80 0 0 1 -140 -70" fill="#1A1C1C" />
      <path d="M260 -70 A80 80 0 0 1 420 -70" fill="#1A1C1C" />
      <Ruota id={id} x={-220} y={-40} r={68} />
      <Ruota id={id} x={340} y={-40} r={68} />
      {lamp > 0 && <Glow id={`${id}-rvlamp`} x={-160} y={-360} r={340} t={t} color="#FFC870" amp={0.05} rate={5} opacity={0.5 * lamp} />}
    </g>
  );
};

/** Mucchietto di cristalli sfaccettati che brillano (la droga di Walter). Origine alla base, al centro. */
export const Cristalli: React.FC<{ id: string; x: number; y: number; t: number; s?: number; n?: number; seed?: number; glint?: number }> = ({
  id, x, y, t, s = 1, n = 16, seed = 3, glint = 1,
}) => {
  const items = Array.from({ length: n }, (_, i) => {
    const k = ((seed * 131 + i * 977) % 1000) / 1000, k2 = ((seed * 71 + i * 613) % 1000) / 1000;
    const row = i % 3;
    return { cx: (k - 0.5) * (140 - row * 30), cy: -row * 22 - k2 * 12, w: 18 + k2 * 16, h: 26 + k * 22, a: (k - 0.5) * 50 };
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
      <Glow id={`${id}-crg${seed}`} x={0} y={-30} r={150} t={t} color={ORO} amp={0.1} rate={3} ph={seed} opacity={0.35 * glint} />
      {items.map((c, i) => (
        <g key={i} transform={`translate(${c.cx} ${c.cy}) rotate(${c.a})`}>
          <path d={`M0 ${-c.h} L${c.w / 2} ${-c.h * 0.35} L${c.w * 0.3} 0 H${-c.w * 0.3} L${-c.w / 2} ${-c.h * 0.35} Z`} fill={`url(#${id}-crys)`} stroke={K} strokeWidth="3" />
          <path d={`M0 ${-c.h} L${c.w * 0.1} 0`} stroke="#8EB8C0" strokeWidth="2" />
        </g>
      ))}
      {/* scintille che passano da un cristallo all'altro */}
      {[0, 1, 2].map((j) => {
        const c = items[(Math.floor(t * 1.3 + j * 5) + j * 3) % n];
        const p = (t * 1.3 + j * 0.33) % 1;
        const sc = Math.sin(p * Math.PI) * glint;
        return (
          <g key={j} transform={`translate(${c.cx} ${c.cy - c.h * 0.7}) scale(${sc})`} opacity={sc}>
            <path d="M0 -22 L4 -4 L22 0 L4 4 L0 22 L-4 4 L-22 0 L-4 -4 Z" fill="#FFFFFF" />
          </g>
        );
      })}
    </g>
  );
};

/** Beuta conica con liquido e bollicine. Origine alla base, al centro. */
export const Beuta: React.FC<{ id: string; x: number; y: number; t: number; s?: number; liquid?: string; level?: number; bubbles?: number; ph?: number }> = ({
  id, x, y, t, s = 1, liquid = '#7AC8D0', level = 0.45, bubbles = 1, ph = 0,
}) => {
  const ly = -10 - 150 * level, lw = 70 - (150 * level) * 0.33;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
      <Ombra id={id} x={0} y={2} rx={90} ry={12} />
      <path d={`M${-lw} ${ly} L-70 -10 Q-74 0 -60 0 H60 Q74 0 70 -10 L${lw} ${ly} Z`} fill={liquid} opacity=".85" />
      {bubbles > 0 && Array.from({ length: 5 }, (_, i) => {
        const p = (t * 0.9 + i * 0.21 + ph) % 1;
        return <circle key={i} cx={-30 + i * 15 + Math.sin(p * 8 + i) * 4} cy={-12 + (ly + 14) * p} r={3 + (i % 2) * 2} fill="#FFFFFF" opacity={0.7 * bubbles * (1 - p * 0.6)} />;
      })}
      <path d="M-18 -230 V-170 L-70 -10 Q-74 0 -60 0 H60 Q74 0 70 -10 L18 -170 V-230" fill={`url(#${id}-glass)`} stroke={K} strokeWidth="6" />
      <path d="M-24 -232 H24" stroke={K} strokeWidth="8" strokeLinecap="round" />
      <path d="M-50 -20 L-10 -150" stroke="#FFFFFF" strokeWidth="6" opacity=".55" strokeLinecap="round" />
      {[-60, -90, -120].map((yy) => <path key={yy} d={`M${(yy + 10) * 0.33 - 4} ${yy} h14`} stroke={K} strokeWidth="3" />)}
    </g>
  );
};

/** Pallone a fondo tondo su un anello. Origine alla base, al centro. */
export const Pallone: React.FC<{ id: string; x: number; y: number; t: number; s?: number; liquid?: string; ph?: number }> = ({ id, x, y, t, s = 1, liquid = '#E8A050', ph = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Ombra id={id} x={0} y={2} rx={80} ry={10} />
    <path d="M-50 -6 L-40 0 H40 L50 -6" stroke="#4A4E50" strokeWidth="8" fill="none" />
    <path d="M-62 -70 A62 62 0 0 0 62 -70 Z" fill={liquid} opacity=".85" />
    {Array.from({ length: 4 }, (_, i) => {
      const p = (t * 1.1 + i * 0.27 + ph) % 1;
      return <circle key={i} cx={-24 + i * 16} cy={-20 - 46 * p} r={3 + (i % 2) * 2} fill="#FFFFFF" opacity={0.7 * (1 - p)} />;
    })}
    <circle cx="0" cy="-66" r="64" fill={`url(#${id}-glass)`} stroke={K} strokeWidth="6" />
    <path d="M-14 -128 V-200 M14 -128 V-200" stroke={K} strokeWidth="6" />
    <rect x="-14" y="-200" width="28" height="72" fill={`url(#${id}-glass)`} />
    <path d="M-20 -202 H20" stroke={K} strokeWidth="8" strokeLinecap="round" />
    <path d="M-40 -96 Q-48 -64 -30 -36" stroke="#FFFFFF" strokeWidth="6" opacity=".55" fill="none" strokeLinecap="round" />
  </g>
);

/** Cactus a candelabro (saguaro) con le costole. Origine alla base. */
export const Cactus: React.FC<{ id: string; x: number; y: number; s?: number; flip?: boolean }> = ({ id, x, y, s = 1, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} strokeLinejoin="round" strokeLinecap="round">
    <Ombra id={id} x={10} y={2} rx={90} ry={12} />
    <path d="M-34 0 V-380 Q-34 -420 0 -420 Q34 -420 34 -380 V0 Z" fill={`url(#${id}-cactus)`} stroke={K} strokeWidth="9" />
    <path d="M-34 -170 H-80 Q-110 -170 -110 -200 V-290 Q-110 -316 -88 -316 Q-66 -316 -66 -290 V-214 H-34" fill={`url(#${id}-cactus)`} stroke={K} strokeWidth="8" />
    <path d="M34 -230 H72 Q100 -230 100 -260 V-330 Q100 -354 80 -354 Q60 -354 60 -330 V-270 H34" fill={`url(#${id}-cactus)`} stroke={K} strokeWidth="8" />
    {[-16, 0, 16].map((cx) => <path key={cx} d={`M${cx} -400 V-10`} stroke="#2A4A24" strokeWidth="3" opacity=".7" />)}
    <path d="M-88 -300 V-190 M80 -340 V-244" stroke="#2A4A24" strokeWidth="3" opacity=".7" />
    <path d="M-24 -390 V-40" stroke="#A8D08A" strokeWidth="4" opacity=".6" />
  </g>
);

/** Cespuglio secco del deserto (creosoto). */
export const Cespuglio: React.FC<{ x: number; y: number; s?: number; color?: string; seed?: number }> = ({ x, y, s = 1, color = '#7A7A44', seed = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinecap="round">
    {Array.from({ length: 9 }, (_, i) => {
      const a = -Math.PI / 2 + (i - 4) * 0.28 + ((seed * 37 + i * 11) % 10) / 60;
      const l = 60 + ((seed * 13 + i * 29) % 40);
      return <path key={i} d={`M0 0 Q${Math.cos(a) * l * 0.4} ${Math.sin(a) * l * 0.6} ${Math.cos(a) * l} ${Math.sin(a) * l}`} stroke="#4A3E24" strokeWidth="5" fill="none" />;
    })}
    {Array.from({ length: 7 }, (_, i) => (
      <ellipse key={i} cx={(i - 3) * 22} cy={-50 - (i % 3) * 16} rx="30" ry="20" fill={color} stroke={K} strokeWidth="4" />
    ))}
  </g>
);
