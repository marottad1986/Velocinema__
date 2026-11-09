import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { BEBAS, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Flyers, Fog, Glow, NearMotes, Stars, StringLights } from '../../lib/elements';
import { Speciale } from '../../components/Speciale';
import type { PosterProps } from '../../types';
import { Abete, BEAT, GIALLO, K, Ombra, SOTTO, StDefs, VELATURA } from './Comuni';

// Copertina e finale di Stranger Things, stagione 1. Locandina originale: niente ragazzi, niente mostro, niente logo
// (né il carattere serif rosso con il bordo luminoso). Copertina: strada nel bosco di notte, una bicicletta rovesciata
// con la ruota che gira ancora e una torcia accesa nell'erba; in fondo la recinzione illuminata del laboratorio.
// Finale: casa Byers nella neve la notte di Natale, con le lucine sul tetto e la stessa bici appoggiata alla
// staccionata (Will è tornato a casa).

const r = rng(2016);
const TREES_L = Array.from({ length: 7 }, (_, i) => ({ x: -120 + i * 70 + r() * 20, h: 380 + r() * 180, w: 170 + r() * 50 }));
const TREES_R = Array.from({ length: 7 }, (_, i) => ({ x: 680 + i * 70 + r() * 20, h: 380 + r() * 180, w: 170 + r() * 50 }));
const SNOW = Array.from({ length: 60 }, () => ({ x: r() * 1300 - 110, y: r() * 1300, s: 2 + r() * 5, v: 30 + r() * 60, ph: r() * 6 }));

/** Bicicletta rossa: in piedi (appoggiata) o rovesciata a terra; `spin` = angolo dei raggi della ruota. */
const Bici: React.FC<{ x: number; y: number; s: number; lying: boolean; spin: number }> = ({ x, y, s, lying, spin }) => {
  const wheel = (cx: number, a: number) => (
    <g transform={`translate(${cx} 0)`}>
      <circle r="92" fill="none" stroke={K} strokeWidth="16" />
      <circle r="92" fill="none" stroke="#3A3E46" strokeWidth="9" />
      <g transform={`rotate(${a})`}>{Array.from({ length: 12 }, (_, i) => <path key={i} d={`M0 0 L${Math.cos((i * Math.PI) / 6) * 86} ${Math.sin((i * Math.PI) / 6) * 86}`} stroke="#B8C0C8" strokeWidth="2.5" />)}</g>
      <circle r="10" fill="#8A929A" stroke={K} strokeWidth="4" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) ${lying ? 'rotate(8) scale(1 0.5)' : ''} scale(${s})`}>
      {wheel(-130, spin * 0.2)}
      {wheel(130, spin)}
      <path d="M-130 0 L-40 -110 L70 -110 L130 0 M-40 -110 L0 0 L70 -110 M0 0 L-130 0" fill="none" stroke={K} strokeWidth="18" strokeLinejoin="round" />
      <path d="M-130 0 L-40 -110 L70 -110 L130 0 M-40 -110 L0 0 L70 -110 M0 0 L-130 0" fill="none" stroke="#B8352F" strokeWidth="10" strokeLinejoin="round" />
      <path d="M-40 -110 L-50 -140 M-80 -146 H-20" stroke={K} strokeWidth="12" strokeLinecap="round" />
      <path d="M-86 -150 H-20" stroke="#2A2420" strokeWidth="14" strokeLinecap="round" />
      <path d="M70 -110 L80 -150 M60 -156 Q90 -170 110 -150" stroke={K} strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M60 -156 Q90 -170 110 -150" stroke="#9AA2AA" strokeWidth="5" fill="none" />
      <circle cx="0" cy="0" r="16" fill="#5A606A" stroke={K} strokeWidth="5" />
      <path d="M-60 -106 L46 -106" stroke="#F08A7A" strokeWidth="3" opacity=".6" />
    </g>
  );
};

const Sfondo: React.FC<{ id: string; t: number; dur: number; finale: boolean }> = ({ id, t, dur, finale }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const lampOn = finale ? 1 : 0.55 + 0.45 * (Math.sin(t * 5.1) > -0.6 ? 1 : 0.2);
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <StDefs id={id} />
        <Lin id={`${id}-sky`} stops={[[0, '#04060C'], [0.35, '#0C1424'], [0.6, '#1C2A44'], [0.75, '#2A3A58']]} />
        <Lin id={`${id}-road`} stops={[[0, '#3A4048'], [1, '#14161A']]} />
        <Lin id={`${id}-ground`} stops={finale ? [[0, '#C8D4E4'], [0.5, '#9AAAC2'], [1, '#5A6A84']] : [[0, '#1A2620'], [1, '#060A08']]} />
        <linearGradient id={`${id}-torch`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF0C0" stopOpacity=".7" /><stop offset=".7" stopColor="#FFE0A0" stopOpacity=".15" /><stop offset="1" stopColor="#FFE0A0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill={`url(#${id}-sky)`} />
          <Stars t={t} seed={finale ? 9 : 4} n={90} x={-100} y={40} w={1280} h={760} color="#E8EEF8" size={0.7} />
          {!finale && <Glow id={`${id}-lab`} x={540} y={1000} r={360} t={t} color="#CFE4F0" amp={0.03} rate={1} opacity={0.45} />}
          {finale && <Glow id={`${id}-moon`} x={860} y={820} r={260} t={t} color="#C8D6E8" amp={0.03} rate={0.8} opacity={0.4} />}
        </g>
        {/* finale */}
        {(
          <>
            {/* casa Byers nella neve con le lucine, la bici appoggiata alla staccionata */}
            <g transform={L(0.4, 0, 140)}>
              {[...TREES_L, ...TREES_R].map((f, i) => <Abete key={i} x={f.x + (i > 6 ? 60 : 0)} y={1080} h={f.h * 0.8} w={f.w} color="#16223A" seed={i + 30} />)}
              <rect x="-200" y="1060" width="1480" height="200" fill="#8A9AB4" />
            </g>
            <g transform={L(0.55, 0, 140)}>
              <Glow id={`${id}-hg`} x={560} y={1000} r={420} t={t} color="#FFC870" amp={0.03} rate={1.5} opacity={0.4} />
              <path d="M300 900 L560 790 L820 900 V1150 H300 Z" fill={`url(#${id}-siding)`} stroke={K} strokeWidth="8" />
              {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M300 ${930 + i * 28} H820`} stroke="#000" strokeWidth="3" opacity=".22" />)}
              <path d="M272 912 L560 780 L848 912" fill="none" stroke="#1C2028" strokeWidth="28" strokeLinejoin="round" />
              <path d="M276 900 L560 770 L844 900" fill="none" stroke="#E8EEF8" strokeWidth="14" strokeLinejoin="round" />
              <StringLights id={`${id}-sl1`} t={t} from={{ x: 290, y: 914 }} to={{ x: 560, y: 794 }} n={9} sag={10} r={7} wire="#141018" />
              <StringLights id={`${id}-sl2`} t={t + 2} from={{ x: 560, y: 794 }} to={{ x: 830, y: 914 }} n={9} sag={10} r={7} wire="#141018" />
              {[[340, 970], [440, 970], [690, 970]].map(([wx, wy], k) => (
                <g key={k}>
                  <rect x={wx} y={wy} width="76" height="86" fill="#FFC870" stroke={K} strokeWidth="6" />
                  <path d={`M${wx + 38} ${wy} V${wy + 86} M${wx} ${wy + 43} H${wx + 76}`} stroke={K} strokeWidth="4" />
                  <path d={`M${wx} ${wy + 86} H${wx + 76}`} stroke="#E8EEF8" strokeWidth="8" />
                </g>
              ))}
              <rect x="560" y="1030" width="80" height="120" fill="#5A2A22" stroke={K} strokeWidth="6" />
              <circle cx="600" cy="1070" r="22" fill="none" stroke="#2E5A34" strokeWidth="10" />
            </g>
            <g transform={L(0.75, 0, 140)}>
              <path d="M-200 1150 Q300 1130 600 1150 Q900 1170 1280 1140 V2200 H-200 Z" fill={`url(#${id}-ground)`} stroke="#3A4A64" strokeWidth="5" />
              <path d="M-200 1154 Q300 1134 600 1154 Q900 1174 1280 1144" stroke="#F2F6FC" strokeWidth="5" fill="none" opacity=".7" />
              {Array.from({ length: 8 }, (_, i) => (
                <g key={i}>
                  <rect x={-20 + i * 150} y={1180 - i * 2} width="20" height="110" fill="#3A3026" stroke={K} strokeWidth="5" />
                  <path d={`M${-24 + i * 150} ${1180 - i * 2} h28`} stroke="#F2F6FC" strokeWidth="7" />
                </g>
              ))}
              <path d="M-20 1210 L1100 1196 M-20 1250 L1100 1236" stroke="#3A3026" strokeWidth="12" />
              <path d="M-20 1204 L1100 1190" stroke="#F2F6FC" strokeWidth="5" />
              <Bici x={780} y={1300} s={0.9} lying={false} spin={0} />
              <path d="M650 1166 H790 M840 1176 Q880 1166 900 1180" stroke="#F2F6FC" strokeWidth="8" strokeLinecap="round" />
            </g>
            <g transform={L(1.2)}>
              <Abete x={-20} y={2000} h={520} w={360} color="#0E1A28" seed={4} />
              <Abete x={1100} y={2000} h={600} w={380} color="#0E1A28" seed={7} />
              {[[-20, 1560, 160], [1100, 1480, 170]].map(([x, y, w], i) => <path key={i} d={`M${x - w * 0.6} ${y} Q${x} ${y - 40} ${x + w * 0.6} ${y}`} stroke="#E8EEF8" strokeWidth="12" fill="none" strokeLinecap="round" />)}
              <path d="M200 1960 Q420 1800 640 1880 Q820 1940 900 1960 Z" fill="#DCE4F0" stroke="#5A6A84" strokeWidth="5" />
            </g>
            <g transform={L(0.6)}>
              {SNOW.map((f, i) => <circle key={i} cx={f.x + Math.sin(t * 0.8 + f.ph) * 18} cy={660 + mod(f.y + t * f.v, 1300)} r={f.s} fill="#F2F6FC" opacity=".85" />)}
            </g>
          </>
        )}
        <g transform={L(1.5)}>
          {!finale && <Flyers t={t} seed={13} n={5} color="#8A5A2A" outline={K} w={30} h={40} y0={900} y1={1800} speed={0.08} shape="leaf" />}
        </g>
        <g transform={L(1.8)}>
          <NearMotes id={`${id}-near`} t={t} color={finale ? '#E8EEF8' : '#9AAAC8'} n={7} r0={80} r1={180} opacity={0.1} />
        </g>
      </g>
      <Finish id={id} tint={VELATURA} tintOpacity={0.12} />
    </svg>
  );
};

// ---- copertina: è anche la miniatura del post (fotogramma 0 già completo) e l'aggancio dei primi secondi.
// Tunnel di abeti su una strada di notte; al centro la bici rossa rovesciata con la ruota che gira ancora (rallenta),
// la torcia accesa nell'erba che la illumina, il lampione a destra. In fondo al bosco filtra la luce fredda del
// Sottosopra. Aggancio: a 3 battiti lampione e torcia sfarfallano, a 4 battiti si spengono; il bagliore freddo cresce e
// le spore vengono verso la camera (la voce: «un bambino sparisce nel nulla»).
const T_FLICK = 3 * BEAT; // 1,875 s
const T_OFF = 4 * BEAT; // 2,5 s
const T_BACK = 5.5 * BEAT; // 3,44 s: il lampione torna, debole
const SPORE = Array.from({ length: 26 }, () => ({ a: r() * Math.PI * 2, d: r(), s: 4 + r() * 9, v: 0.12 + r() * 0.2, ph: r() * 6 }));
const LEAVES = Array.from({ length: 14 }, () => ({ x: 200 + r() * 700, y: 1120 + r() * 520, rot: r() * 360, s: 0.7 + r() * 0.8, c: r() }));
const GRASS = Array.from({ length: 46 }, (_, i) => ({ x: -60 + i * 26 + r() * 10, h: 70 + r() * 110, b: (r() - 0.5) * 50 }));

/** Luce della torcia e del lampione nei primi secondi: piena, sfarfalla, spenta, poi il lampione torna debole. */
const luci = (t: number) => {
  if (t < T_FLICK) return { torch: 1, lamp: 1 };
  if (t < T_OFF) {
    const k = Math.floor((t - T_FLICK) * 16);
    const on = [1, 0.2, 1, 0.1, 0.9, 0.05, 0.7, 0, 0.5, 0][k % 10] ?? 0;
    return { torch: on, lamp: Math.min(1, on * 1.1) };
  }
  if (t < T_BACK) return { torch: 0, lamp: 0 };
  const k = Math.floor((t - T_BACK) * 14);
  return { torch: 0, lamp: [0.3, 0, 0.5, 0.2, 0.55][Math.min(k, 4)] };
};

const BoscoCopertina: React.FC<{ id: string; t: number; dur: number }> = ({ id, t, dur }) => {
  const cam = camera(t, dur, 540, 1150);
  const L = cam.layer;
  const { torch, lamp } = luci(t);
  const cold = 0.55 + 0.45 * eo(seg(t, T_FLICK, T_OFF + 0.6)); // il Sottosopra che cresce
  const spin = 600 * 2.6 * (1 - Math.exp(-t / 2.6)); // la ruota che gira e rallenta (gradi)
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <StDefs id={id} />
        <Lin id={`${id}-sky`} stops={[[0, '#03050B'], [0.32, '#081020'], [0.5, '#122038'], [0.58, '#1E3452']]} />
        <linearGradient id={`${id}-road`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3C4452" /><stop offset=".25" stopColor="#262C36" /><stop offset="1" stopColor="#101318" /></linearGradient>
        <linearGradient id={`${id}-ground`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1C2C2A" /><stop offset=".4" stopColor="#101A16" /><stop offset="1" stopColor="#05080A" /></linearGradient>
        <linearGradient id={`${id}-torch`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF0C0" stopOpacity=".75" /><stop offset=".65" stopColor="#FFE0A0" stopOpacity=".18" /><stop offset="1" stopColor="#FFE0A0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-shaft`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={SOTTO} stopOpacity=".55" /><stop offset="1" stopColor={SOTTO} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-spore`}><stop offset="0" stopColor="#E2F2FA" stopOpacity=".95" /><stop offset="1" stopColor="#E2F2FA" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 1 — cielo calmo dietro il titolo, stelle, la luce fredda in fondo al bosco (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill={`url(#${id}-sky)`} />
          <Stars t={t} seed={4} n={70} x={-100} y={40} w={1280} h={700} color="#E8EEF8" size={0.6} />
          <Glow id={`${id}-cold`} x={540} y={1050} r={520} t={t} color={SOTTO} amp={0.04} rate={1.3} opacity={0.5 * cold} />
          <Glow id={`${id}-cold2`} x={540} y={1060} r={220} t={t} color="#D8EEF8" amp={0.06} rate={2.1} opacity={0.55 * cold} />
        </g>
        {/* PIANO 2 — bosco lontano con i fasci freddi tra i tronchi (0,35) */}
        <g transform={L(0.35)}>
          {[-14, -5, 6, 15].map((a, i) => (
            <path key={i} d={`M${540 + a * 3} 1060 L${540 + a * 22 - 60} 640 L${540 + a * 22 + 60} 640 Z`} fill={`url(#${id}-shaft)`} opacity={(0.22 + 0.08 * Math.sin(t * 1.7 + i)) * cold} />
          ))}
          {Array.from({ length: 16 }, (_, i) => {
            const x = -80 + i * 82 + (i % 3) * 12;
            if (x > 470 && x < 610) return null;
            return <Abete key={i} x={x} y={1075} h={300 + ((i * 37) % 120)} w={150} color="#0B1424" seed={i + 2} />;
          })}
          <Fog id={`${id}-f0`} t={t} y={1060} rx={760} ry={60} color="#6A88A8" opacity={0.45 + 0.2 * cold} speed={0.18} drift={50} />
        </g>
        {/* PIANO 3 — abeti medi che fanno da tunnel (0,5) */}
        <g transform={L(0.5)}>
          {[[40, 470, 280], [180, 420, 220], [300, 350, 170], [780, 350, 170], [900, 420, 220], [1040, 470, 280]].map(([x, h, w], i) => (
            <Abete key={i} x={x} y={1110} h={h} w={w} color={i % 2 ? '#081020' : '#060C18'} seed={i + 20} />
          ))}
          {/* bordo freddo sugli abeti verso il centro */}
          {[[300, 350, 170], [780, 350, 170]].map(([x, h, w], i) => (
            <path key={i} d={`M${x} ${1110 - h} L${x + (i ? -1 : 1) * w * 0.48} 1080`} stroke={SOTTO} strokeWidth="3" opacity={0.35 * cold} />
          ))}
        </g>
        {/* PIANO 4 — strada, bici, torcia, lampione (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1080 H1280 V2200 H-200 Z" fill={`url(#${id}-ground)`} />
          <path d="M505 1080 H575 L1180 2200 H-100 Z" fill={`url(#${id}-road)`} />
          <path d="M505 1080 L-100 2200 M575 1080 L1180 2200" stroke="#5E6672" strokeWidth="6" opacity=".7" />
          {/* riflesso freddo sull'asfalto umido */}
          <path d="M520 1085 H560 L640 1500 H440 Z" fill={SOTTO} opacity={0.1 * cold} />
          {Array.from({ length: 6 }, (_, i) => {
            const p = (i + 0.4) / 6, y = lerp(1095, 1880, p * p), w = lerp(4, 20, p), h = lerp(16, 90, p);
            return <rect key={i} x={540 - w / 2} y={y} width={w} height={h} fill="#B8A266" opacity=".75" />;
          })}
          {/* crepe e toppe dell'asfalto */}
          <path d="M700 1500 l40 30 l-10 40 l50 26 M340 1660 l-30 50 l20 30" stroke="#0A0C10" strokeWidth="5" fill="none" opacity=".7" />
          <path d="M420 1380 h120 v26 h-120 Z" fill="#1E232A" opacity=".8" />
          {/* lampione a destra */}
          <path d="M930 1180 V760 Q930 726 892 726 H812" stroke={K} strokeWidth="16" fill="none" />
          <path d="M930 1180 V760 Q930 726 892 726 H812" stroke="#4A5058" strokeWidth="8" fill="none" />
          <path d="M924 1180 V770" stroke="#8A929C" strokeWidth="2.5" opacity=".6" />
          <path d="M778 718 H846 L834 748 H790 Z" fill="#3A4048" stroke={K} strokeWidth="5" />
          <ellipse cx="812" cy="750" rx="20" ry="6" fill={lamp > 0.05 ? '#FFF2C8' : '#3A3E46'} />
          <Glow id={`${id}-lamp`} x={812} y={760} r={210} t={t} color="#FFD890" amp={0.04} rate={3} opacity={0.65 * lamp} />
          <Beam id={`${id}-lampbeam`} x={812} y={752} t={t} length={430} spread={330} color="#FFE0A0" angle={90} opacity={0.24 * lamp} />
          <ellipse cx="812" cy="1180" rx="170" ry="26" fill="#FFE0A0" opacity={0.12 * lamp} />
          {/* foglie sull'asfalto */}
          {LEAVES.map((f, i) => (
            <path key={i} d="M0 -14 Q11 0 0 14 Q-11 0 0 -14 Z M0 -12 V12" transform={`translate(${f.x} ${f.y}) rotate(${f.rot}) scale(${f.s * lerp(0.6, 1.4, (f.y - 1120) / 520)})`}
              fill={f.c > 0.5 ? '#7A4A22' : '#5A3418'} stroke={K} strokeWidth="2.5" />
          ))}
          {/* fascio della torcia che attraversa la strada e prende la bici */}
          <path d="M196 1262 L880 1120 L900 1330 Z" fill={`url(#${id}-torch)`} opacity={torch} />
          {/* la bicicletta rovesciata con la ruota che gira */}
          <Ombra id={id} x={540} y={1272} rx={370} ry={38} />
          <Bici x={540} y={1236} s={1.4} lying spin={spin} />
          {/* bordo caldo sulla bici dove la prende la torcia */}
          <path d="M394 1172 L472 1141 L564 1141" stroke="#FFE6B0" strokeWidth="4" fill="none" opacity={0.55 * torch} />
          {/* torcia accesa nell'erba a sinistra */}
          <g transform="translate(180 1268) rotate(-10)">
            <rect x="-96" y="-22" width="100" height="44" rx="8" fill="#2A2E36" stroke={K} strokeWidth="7" />
            <path d="M-80 -22 V22 M-64 -22 V22 M-48 -22 V22" stroke="#4A505A" strokeWidth="3" />
            <rect x="-40" y="-30" width="18" height="10" rx="3" fill="#B8352F" stroke={K} strokeWidth="4" />
            <path d="M4 -28 L34 -36 V36 L4 28 Z" fill="#5A606A" stroke={K} strokeWidth="6" />
            <ellipse cx="34" cy="0" rx="8" ry="33" fill={torch > 0.05 ? '#FFF6D8' : '#4A4E56'} stroke={K} strokeWidth="3" />
          </g>
          <Glow id={`${id}-tg`} x={214} y={1262} r={120} t={t} color="#FFF0C0" amp={0.05} rate={5} opacity={0.85 * torch} />
          {GRASS.slice(0, 14).map((g, i) => <path key={i} d={`M${g.x} 1300 q${g.b * 0.5} ${-g.h * 0.6} ${g.b} ${-g.h}`} stroke="#1E3424" strokeWidth="7" fill="none" strokeLinecap="round" />)}
        </g>
        {/* PIANO 5 — primo piano: tronchi ai bordi ed erba alta in basso (1,15) */}
        <g transform={L(1.15)}>
          <path d="M-120 -100 H40 Q20 900 70 2100 H-120 Z" fill={`url(#${id}-bark)`} stroke={K} strokeWidth="10" />
          <path d="M36 200 Q24 900 62 1900" stroke="#5A6A84" strokeWidth="4" fill="none" opacity={0.35 + 0.25 * cold} />
          <path d="M1200 -100 H1050 Q1072 900 1030 2100 H1200 Z" fill={`url(#${id}-bark)`} stroke={K} strokeWidth="10" />
          <path d="M1054 200 Q1068 900 1036 1900" stroke="#5A6A84" strokeWidth="4" fill="none" opacity={0.35 + 0.25 * cold} />
          {[[-10, 520], [10, 980], [1060, 700], [1046, 1300]].map(([x, y], i) => <path key={i} d={`M${x} ${y} q20 10 30 40`} stroke="#0A0806" strokeWidth="6" fill="none" />)}
          {/* ciuffi d'erba e felci solo negli angoli, la strada al centro resta libera */}
          {GRASS.filter((g) => g.x < 300 || g.x > 800).map((g, i) => {
            const sway = Math.sin(t * 1.4 + i) * 6;
            const y = 1930 - ((i * 53) % 70);
            const dir = g.x < 540 ? 1 : -1;
            return <path key={i} d={`M${g.x} ${y} q${dir * 10 + sway} ${-g.h * 1.2} ${dir * (40 + Math.abs(g.b)) + sway * 2} ${-g.h * 1.7}`} stroke={i % 3 ? '#0C1A12' : '#16301E'} strokeWidth="12" fill="none" strokeLinecap="round" />;
          })}
          {[[150, 1930, 1], [960, 1930, -1]].map(([x, y, d], k) => (
            <g key={k} transform={`translate(${x} ${y}) scale(${d} 1) rotate(${Math.sin(t * 1.1 + k) * 2})`}>
              {[-60, -35, -12].map((a, j) => (
                <g key={j} transform={`rotate(${a})`}>
                  <path d="M0 0 Q30 -160 10 -330" stroke="#0A160E" strokeWidth="9" fill="none" />
                  {Array.from({ length: 9 }, (_, n) => <path key={n} d={`M${16 - n * 0.6} ${-30 - n * 33} q36 -6 ${60 - n * 5} -30 M${14 - n * 0.6} ${-30 - n * 33} q-30 -10 ${-48 + n * 4} -34`} stroke={j === 1 ? '#13281A' : '#0C1C12'} strokeWidth="8" fill="none" strokeLinecap="round" />)}
                </g>
              ))}
            </g>
          ))}
        </g>
        {/* PIANO 6 — spore che escono dal bosco e vengono verso la camera, foglie che cadono (1,6) */}
        <g transform={L(1.6)}>
          {SPORE.map((p, i) => {
            const k = mod(t * p.v + p.d, 1);
            const ease = k * k;
            const x = 540 + Math.cos(p.a) * ease * 620 + Math.sin(t * 0.9 + p.ph) * 14;
            const y = 1060 + Math.sin(p.a) * ease * 380 + ease * 260;
            if (y < 700) return null;
            const fade = Math.sin(Math.PI * k);
            return <circle key={i} cx={x} cy={y} r={p.s * (0.5 + ease * 1.8)} fill={`url(#${id}-spore)`} opacity={fade * (0.35 + 0.55 * cold)} />;
          })}
          <Flyers t={t} seed={13} n={5} color="#8A5A2A" outline={K} w={30} h={40} y0={900} y1={1800} speed={0.08} shape="leaf" />
        </g>
        <g transform={L(1.9)}>
          <NearMotes id={`${id}-near`} t={t} color="#A8C4DA" n={7} r0={80} r1={180} y0={800} opacity={0.1} />
        </g>
      </g>
      <Finish id={id} tint={VELATURA} tintOpacity={0.12} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  // Fotogramma 0 già completo (miniatura del post): nessuna dissolvenza su etichetta e titolo.
  // La frase di lancio non sta nella miniatura: entra da 0,4 s in 0,3 s e poi resta.
  const lancio = eo(seg(t, 0.4, 0.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <BoscoCopertina id="sc0" t={t} dur={dur} />
      <div style={{ position: 'absolute', left: 120, top: 290, width: 840, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '0.3em', color: GIALLO, textShadow: `0 2px 0 ${P.scuro}` }}>
          STAGIONE {film.stagione} IN 2 MINUTI<Speciale nome={film.copertina.speciale} scale={1} />
        </p>
        <h1 style={{ margin: '10px 0 0', fontFamily: BEBAS, fontWeight: 400, fontSize: 220, lineHeight: 0.88, letterSpacing: '0.04em', color: P.chiaro,
          textShadow: `0 6px 0 ${P.scuro}, 0 0 40px ${P.scuro}` }}>
          Stranger Things
        </h1>
        <p style={{ margin: '18px 0 0', fontSize: 40, fontWeight: 800, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>una serie di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}E0`, color: P.chiaro, fontFamily: SANS, fontSize: 42, fontWeight: 800, textAlign: 'center',
        opacity: lancio, transform: `translateY(${(1 - lancio) * 16}px)` }}>
        {film.copertina.frase_lancio}
      </p>
    </div>
  );
};

export const Finale: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const card = eo(seg(t, 0.1, 0.5));
  const b1 = eob(seg(t, 0.5, 0.9), 1.8);
  const b2 = eob(seg(t, 0.7, 1.1), 1.8);
  const end = eob(seg(t, 0.3, 0.9), 1.3);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sfondo id="sc9" t={t} dur={dur} finale />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con la serie che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 650, margin: 0, textAlign: 'center', fontFamily: BEBAS, fontWeight: 400, fontSize: 130, lineHeight: 0.95,
        letterSpacing: '0.06em', color: P.chiaro, textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        Fine della<br />stagione {film.stagione}
      </h1>
    </div>
  );
};
