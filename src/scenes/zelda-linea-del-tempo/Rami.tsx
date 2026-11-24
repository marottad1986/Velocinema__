import React from 'react';
import { eio, eo, lerp, mod, rng } from '../../lib/anim';
import { Clouds, Embers, Fireflies, Fog, Glow, Gulls, Lightning, SunRays, WaveBand, flashAt } from '../../lib/elements';
import { GOLD, INK, Fiamma, Tri } from './Schema';
import { CastelloGrande, type Par } from './Hyrule';
import { Cumulo } from './Origine';

// I tre mondi dopo il bivio, ognuno a tutto schermo (coordinate locali 1080×1920).
// - Il regno sigillato (rosso): cielo cremisi, luna di sangue, montagne nere, il castello nero sullo sperone con le
//   finestre rosse, crepe di lava, alberi morti, cenere. Sopra il castello la colonna di fiamma viola di Ganondorf, che
//   cresce quando i tre triangoli ci volano dentro; poi i sette saggi, sette luci d'oro, chiudono un grande sigillo.
// - Il regno sommerso (azzurro): giorno, il castello di Hyrule sulla collina; il mare sale dal basso e lo copre tutto;
//   sott'acqua i raggi di luce, le bolle, i pesci e le alghe; sopra le onde compaiono le isole e parte una barca a vela.
// - Il crepuscolo (ambra): cielo viola e arancio, un sole enorme che tramonta dietro il castello controluce, ombre tonde
//   che salgono; in cielo si apre un varco d'ombra con il bordo d'oro che risucchia la fiamma e poi la lascia tornare.

const rr = rng(909);
const ASH = Array.from({ length: 60 }, () => ({ x: rr() * 1080, y: rr() * 1920, v: 20 + rr() * 50, s: 2 + rr() * 3, ph: rr() * 6 }));
const BUB = Array.from({ length: 26 }, () => ({ x: 80 + rr() * 920, ph: rr(), s: 3 + rr() * 6 }));
const MOTE = Array.from({ length: 34 }, () => ({ x: rr() * 1080, ph: rr(), s: 4 + rr() * 8, v: 0.06 + rr() * 0.08 }));

/** Albero morto controluce. */
const Secco: React.FC<{ x: number; y: number; s?: number; c?: string; flip?: boolean }> = ({ x, y, s = 1, c = '#12060C', flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} stroke={c} strokeLinecap="round" fill="none">
    <path d="M0 0 Q-6 -120 10 -240" strokeWidth="22" />
    <path d="M6 -150 Q60 -200 90 -280 M8 -200 Q-50 -250 -70 -330 M10 -240 Q30 -300 20 -360 M70 -240 l40 -20 M-40 -270 l-40 -10" strokeWidth="10" />
  </g>
);

export const ArtSigillato: React.FC<{ T: number; par: Par; take: number; seal: number }> = ({ T, par, take, seal }) => {
  const fx = 540, fy = 640;
  const fl = flashAt(T, [T - mod(T, 3.1) + 0.8], [0.6]);
  return (
    <g>
      <defs>
        <linearGradient id="sg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#12040C" /><stop offset=".3" stopColor="#3A0A1C" /><stop offset=".52" stopColor="#8A1C2A" /><stop offset=".62" stopColor="#D2502E" /><stop offset=".7" stopColor="#5A1420" />
        </linearGradient>
        <linearGradient id="sg-gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A0E14" /><stop offset="1" stopColor="#0E0408" /></linearGradient>
      </defs>
      <g transform={par(0.15)}>
        <rect x="-300" y="-300" width="1680" height="2500" fill="url(#sg-sky)" />
        <Glow id="sg-moon" x={830} y={470} r={220} t={T} color="#FF6A4A" amp={0.06} rate={1.2} opacity={0.6} />
        <circle cx="830" cy="470" r="76" fill="#F0907A" />
        <circle cx="806" cy="452" r="16" fill="#D8705A" opacity=".7" /><circle cx="852" cy="494" r="11" fill="#D8705A" opacity=".7" />
        <Clouds id="sg-cl" t={T} color="#4A1424" seed={9} n={4} y={560} h={200} opacity={0.75} speed={0.2} />
        <Lightning x={180} y={480} h={420} flash={fl} seed={5} color="#FFB08A" width={8} />
      </g>
      <g transform={par(0.35)}>
        <path d="M-200 1120 L-40 900 L60 990 L180 820 L300 960 L420 860 L540 1000 L660 840 L800 980 L920 860 L1080 1000 L1280 900 V1300 H-200 Z" fill="#1E0810" />
        <path d="M-200 1180 L80 1040 L240 1100 L400 1010 L560 1120 L760 1030 L960 1110 L1280 1040 V1300 H-200 Z" fill="#2A0C16" />
      </g>
      {/* la colonna di fiamma di Ganondorf, che cresce con la Triforza intera */}
      <g transform={par(0.5)}>
        <Glow id="sg-fg" x={fx} y={fy} r={300 + 140 * take} t={T} color="#B050F0" amp={0.15} rate={4} opacity={0.55} />
        <g transform={`translate(${fx} ${fy + 120}) scale(${2.2 + 1.6 * eo(take)})`}><Fiamma T={T} /></g>
        {take > 0 && take < 1 && [[-300, -360], [0, -460], [300, -360]].map(([dx, dy], i) => (
          <g key={i} transform={`translate(${lerp(fx + dx, fx, eio(take))} ${lerp(fy + dy, fy, eio(take))}) scale(${1.1 * (1 - 0.8 * take)})`}><Tri T={T} id={`sg-t${i}`} glow={1} /></g>
        ))}
        {/* il sigillo dei sette saggi */}
        {seal > 0 && (
          <g>
            <circle cx={fx} cy={fy} r={250} fill="#FFE08A" opacity={0.08 * seal} />
            <circle cx={fx} cy={fy} r={250} fill="none" stroke="#2A1408" strokeWidth="20" pathLength={1} strokeDasharray={`${eo(seal)} 1`} opacity=".5" />
            <circle cx={fx} cy={fy} r={250} fill="none" stroke={GOLD} strokeWidth="12" pathLength={1} strokeDasharray={`${eo(seal)} 1`} />
            <circle cx={fx} cy={fy} r={214} fill="none" stroke="#FFF0B0" strokeWidth="5" strokeDasharray="14 16" strokeDashoffset={T * 40} opacity={seal} />
            {Array.from({ length: 7 }, (_, i) => {
              const a = (i / 7) * Math.PI * 2 - Math.PI / 2 + T * 0.3;
              const rad = lerp(420, 250, eo(seal));
              const x = fx + Math.cos(a) * rad, y = fy + Math.sin(a) * rad;
              return (
                <g key={i}>
                  {seal > 0.8 && <path d={`M${x} ${y} L${fx + Math.cos(a + 2 * Math.PI * 3 / 7) * rad} ${fy + Math.sin(a + 2 * Math.PI * 3 / 7) * rad}`} stroke="#FFE08A" strokeWidth="4" opacity={(seal - 0.8) * 3} />}
                  <circle cx={x} cy={y} r="34" fill={GOLD} opacity=".3" />
                  <circle cx={x} cy={y} r="15" fill="#FFF8DC" stroke={INK} strokeWidth="3" />
                </g>
              );
            })}
          </g>
        )}
      </g>
      {/* il castello nero sullo sperone, le crepe di lava */}
      <g transform={par(0.65)}>
        <path d="M200 1260 Q300 1120 420 1080 L460 1020 H640 L680 1080 Q800 1120 900 1260 Z" fill="#14060C" />
        <CastelloGrande T={T} x={550} y={1010} s={0.8} sil="#12060C" id="sg-c" />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={430 + i * 40} y={700 + (i % 2) * 40} width="10" height="16" rx="5" fill="#FF6A3A" opacity={0.6 + 0.3 * Math.sin(T * 3 + i)} />)}
      </g>
      <g transform={par(0.85)}>
        <rect x="-300" y="1240" width="1680" height="900" fill="url(#sg-gr)" />
        {[[100, 1300, 400, 1500, 300, 1800], [700, 1290, 600, 1520, 820, 1900], [960, 1360, 1040, 1600, 980, 1920]].map(([a, b, c, d, e, f], i) => (
          <g key={i}>
            <path d={`M${a} ${b} L${c} ${d} L${e} ${f}`} stroke="#FF5A2A" strokeWidth="16" fill="none" opacity={0.25 + 0.1 * Math.sin(T * 2 + i)} strokeLinejoin="round" />
            <path d={`M${a} ${b} L${c} ${d} L${e} ${f}`} stroke="#FFB060" strokeWidth="5" fill="none" strokeLinejoin="round" />
          </g>
        ))}
        <Embers t={T} x={540} y={1600} w={1100} h={900} n={40} hot="#FFB060" warm="#FF4A2A" />
      </g>
      <g transform={par(1.2)}>
        <Secco x={60} y={1960} s={1.5} />
        <Secco x={1040} y={1940} s={1.3} flip />
      </g>
      {ASH.map((a, i) => <circle key={i} cx={a.x + Math.sin(T + a.ph) * 20} cy={mod(a.y + T * a.v, 1920)} r={a.s} fill="#C8A0A0" opacity=".35" />)}
    </g>
  );
};

export const ArtSommerso: React.FC<{ T: number; par: Par; flood: number; isles: number; sail: number }> = ({ T, par, flood, isles, sail }) => {
  const sea = lerp(1960, 700, eio(flood));
  const bx = lerp(380, 1180, eio(sail));
  return (
    <g>
      <defs>
        <linearGradient id="ss-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A86D8" /><stop offset=".3" stopColor="#8AC8F0" /><stop offset=".5" stopColor="#E6F4F2" /></linearGradient>
        <linearGradient id="ss-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E8AC8" stopOpacity=".42" /><stop offset=".45" stopColor="#1E5E98" stopOpacity=".55" /><stop offset="1" stopColor="#0A2448" stopOpacity=".82" /></linearGradient>
        <linearGradient id="ss-hill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7CC25A" /><stop offset="1" stopColor="#3E7E3A" /></linearGradient>
        <linearGradient id="ss-ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#CFF0FF" stopOpacity=".35" /><stop offset="1" stopColor="#CFF0FF" stopOpacity="0" /></linearGradient>
      </defs>
      <g transform={par(0.15)}>
        <rect x="-300" y="-300" width="1680" height="2500" fill="url(#ss-sky)" />
        <SunRays id="ss-rays" x={280} y={380} t={T} color="#FFF6C8" n={10} length={900} width={60} opacity={0.35} />
        <Glow id="ss-sun" x={280} y={380} r={240} t={T} color="#FFF6C8" amp={0.05} rate={1} opacity={0.8} />
        <circle cx="280" cy="380" r="56" fill="#FFFDF0" />
        <Cumulo x={760} y={470} s={0.9} T={T} />
        <Clouds id="ss-cl" t={T} color="#FFFFFF" seed={31} n={3} y={520} h={80} opacity={0.6} speed={0.15} />
        <Gulls t={T} seed={7} n={4} y={480} h={120} color={INK} size={0.8} period={14} />
      </g>
      {/* Hyrule com'era: colline, il castello */}
      <g transform={par(0.5)}>
        <path d="M-200 1000 L120 860 L300 940 L500 820 L720 930 L900 850 L1280 960 V1300 H-200 Z" fill="#8AA8C8" opacity=".8" />
        <path d="M-200 1220 Q200 1080 540 1130 Q860 1180 1280 1080 V2200 H-200 Z" fill="url(#ss-hill)" stroke={INK} strokeWidth="6" />
        <CastelloGrande T={T} x={540} y={1120} s={0.95} id="ss-c" />
        {Array.from({ length: 22 }, (_, i) => {
          const x = (i * 157) % 1080 + (i % 4) * 9, y = 1180 + ((i * 53) % 90), r = 18 + ((i * 7) % 16);
          return (
            <g key={i}>
              <path d={`M${x} ${y + r} v16`} stroke="#4A3020" strokeWidth="5" />
              <circle cx={x} cy={y} r={r} fill={i % 3 ? '#2E7438' : '#3E8A40'} stroke={INK} strokeWidth="4" />
              <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.42} fill="#7CC05A" />
            </g>
          );
        })}
        {[[180, 1150], [880, 1140]].map(([hx, hy], i) => (
          <g key={`h${i}`}>
            <rect x={hx - 26} y={hy - 30} width="52" height="38" fill="#F0E6CE" stroke={INK} strokeWidth="4" />
            <path d={`M${hx - 34} ${hy - 28} L${hx} ${hy - 58} L${hx + 34} ${hy - 28} Z`} fill="#C85A3A" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          </g>
        ))}
      </g>
      {/* il mare che sale */}
      <g>
        <rect x="-300" y={sea + 10} width="1680" height={2000} fill="url(#ss-sea)" />
        <clipPath id="ss-wclip"><rect x="-300" y={sea - 40} width="1680" height="70" /></clipPath>
        <g clipPath="url(#ss-wclip)">
          <g transform={`translate(0 ${sea - 640})`}>
            <WaveBand t={T} y={640} fill="#3A96D2" foam="#E8F8FF" amp={14} w={180} speed={40} bob={6} foamWidth={7} foamOpacity={0.8} />
          </g>
        </g>
        {flood > 0.4 && (
          <g opacity={Math.min(1, (flood - 0.4) * 2.5)}>
            {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${100 + i * 220 + Math.sin(T * 0.5 + i) * 30} ${sea + 30} L${20 + i * 220} 1920 H${140 + i * 220} Z`} fill="url(#ss-ray)" />)}
            {BUB.map((b, i) => {
              const u = mod(T * 0.25 + b.ph, 1);
              return <circle key={i} cx={b.x + Math.sin(T * 2 + i) * 8} cy={lerp(1900, sea + 40, u)} r={b.s} fill="none" stroke="#DDF6FF" strokeWidth="2.5" opacity={0.8 * (1 - u)} />;
            })}
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${mod(T * (40 + i * 12) + i * 400, 1300) - 100} ${1000 + i * 160}) scale(${1.4 - i * 0.2})`}>
                <path d="M0 0 q14 -12 30 0 q-16 12 -30 0 Z M0 0 l-12 -10 v20 Z" fill={['#F2A040', '#F26A6A', '#F2D040'][i]} stroke={INK} strokeWidth="2" />
              </g>
            ))}
            {[[120, 1860, 90], [520, 1880, 120], [900, 1850, 100]].map(([x, y, r], i) => <ellipse key={`r${i}`} cx={x} cy={y} rx={r} ry={r * 0.5} fill="#1E3A52" stroke={INK} strokeWidth="4" />)}
            {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${40 + i * 110} 1920 q${16 + Math.sin(T * 1.5 + i) * 14} -80 ${Math.sin(T * 1.5 + i) * 20} -170`} stroke="#2E8A5A" strokeWidth="10" fill="none" strokeLinecap="round" />)}
          </g>
        )}
        {/* le isole all'orizzonte e la barca a vela */}
        {isles > 0 && [[160, 0.8], [700, 1.2], [960, 0.7]].map(([ix, s], i) => (
          <g key={i} transform={`translate(${ix} ${sea + 2}) scale(${(s as number) * eo(isles)})`}>
            <path d="M-80 6 Q-50 -50 0 -54 Q56 -50 80 6 Z" fill="#6AB04E" stroke={INK} strokeWidth="4" />
            <path d="M-10 -50 Q0 -86 8 -100 M8 -100 q-30 -6 -44 14 M8 -100 q30 -6 40 18 M8 -100 q-6 -24 -30 -30" stroke="#2E7438" strokeWidth="6" fill="none" strokeLinecap="round" />
          </g>
        ))}
        {flood > 0.85 && (
          <g transform={`translate(${bx} ${sea - 4 + Math.sin(T * 2) * 5}) rotate(${Math.sin(T * 1.6) * 4}) scale(1.6)`}>
            <path d="M-50 0 H50 L36 24 H-36 Z" fill="#7A4A2A" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
            <path d="M0 0 V-96" stroke={INK} strokeWidth="5" />
            <path d="M4 -92 Q56 -56 46 -6 H4 Z" fill="#E8553F" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
            <path d="M-4 -80 Q-34 -50 -30 -8 H-4 Z" fill="#F6EEDA" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          </g>
        )}
      </g>
    </g>
  );
};

export const ArtCrepuscolo: React.FC<{ T: number; par: Par; banish: number; back: number }> = ({ T, par, banish, back }) => {
  const px = 540, py = 600; // il varco
  const fx = lerp(lerp(540, px, eio(banish)), 620, eio(back));
  const fy = lerp(lerp(860, py, eio(banish)), 900, eio(back));
  const fs = banish > 0.95 && back <= 0 ? 0.2 : 1.6;
  const open = Math.min(1, banish * 1.6) * (1 - 0.3 * back);
  return (
    <g>
      <defs>
        <linearGradient id="cr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E1036" /><stop offset=".25" stopColor="#4A2458" /><stop offset=".42" stopColor="#B04A5A" /><stop offset=".55" stopColor="#F0904A" /><stop offset=".62" stopColor="#FFD27A" />
        </linearGradient>
      </defs>
      <g transform={par(0.15)}>
        <rect x="-300" y="-300" width="1680" height="2500" fill="url(#cr-sky)" />
        {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={(i * 131) % 1080} cy={300 + (i * 53) % 360} r={1.5 + (i % 3)} fill="#FFF0E0" opacity={0.3 + 0.4 * Math.sin(T * 2 + i)} />)}
        <Glow id="cr-sun" x={540} y={1140} r={520} t={T} color="#FFB45A" amp={0.05} rate={1} opacity={0.8} />
        <circle cx="540" cy="1140" r="250" fill="#FFC870" />
        <circle cx="540" cy="1140" r="250" fill="none" stroke="#FFE6A8" strokeWidth="8" opacity=".7" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x="290" y={1060 + i * 34} width="500" height={6 + i * 2} fill="#E88A4A" opacity=".5" />)}
      </g>
      {/* il varco d'ombra nel cielo */}
      {open > 0 && (
        <g transform={par(0.3)} opacity={open}>
          <Glow id="cr-pg" x={px} y={py} r={300} t={T} color="#7A3AB0" amp={0.15} rate={3} opacity={0.6} />
          {Array.from({ length: 5 }, (_, i) => (
            <ellipse key={i} cx={px} cy={py} rx={(230 - i * 38) * eo(open)} ry={(120 - i * 20) * eo(open)} fill={i === 4 ? '#0A0412' : 'none'} stroke={i === 0 ? GOLD : i % 2 ? '#4A2468' : '#2A1040'} strokeWidth={i === 0 ? 10 : 18} strokeDasharray={i === 0 ? undefined : '60 24'} strokeDashoffset={T * (60 + i * 20) * (i % 2 ? 1 : -1)} />
          ))}
        </g>
      )}
      <g transform={par(0.4)}>
        <path d="M-200 1220 Q160 1120 380 1170 Q560 1210 740 1150 Q940 1090 1280 1180 V1400 H-200 Z" fill="#3A1A3A" />
      </g>
      {/* la fiamma: cacciata nel varco, poi torna */}
      <g transform={`translate(${fx} ${fy}) scale(${fs})`}>
        <Glow id="cr-fg" x={0} y={0} r={90} t={T} color="#B050F0" amp={0.15} rate={4} opacity={0.6} />
        <Fiamma T={T} />
      </g>
      <g transform={par(0.6)}>
        <path d="M-200 1300 Q300 1200 540 1260 Q800 1320 1280 1240 V1500 H-200 Z" fill="#24102C" />
        <CastelloGrande T={T} x={540} y={1220} s={0.95} sil="#1A0C24" id="cr-c" />
      </g>
      <g transform={par(0.85)}>
        <rect x="-300" y="1400" width="1680" height="800" fill="#140818" />
        <path d="M-300 1420 Q300 1360 540 1400 Q860 1450 1380 1380 V1500 H-300 Z" fill="#1E0C24" />
      </g>
      {MOTE.map((m, i) => {
        const u = mod(T * m.v + m.ph, 1);
        return <circle key={i} cx={m.x + Math.sin(T + i) * 20} cy={1800 - u * 1300} r={m.s * (1 - u * 0.4)} fill="#0E0614" opacity={0.75 * Math.sin(u * Math.PI)} />;
      })}
      <g transform={par(1.25)}>
        {[[-20, 1960, 1.7], [140, 1990, 1.3], [940, 1980, 1.5], [1100, 1940, 1.8]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            {[-40, -24, -10, 4, 18, 32].map((a, k) => (
              <path key={k} d={`M${a * 0.6} 0 Q${a * 0.9 + Math.sin(T * 1.6 + i + k) * 6} -90 ${a * 1.8 + Math.sin(T * 1.6 + i + k) * 12} ${-150 - (k % 3) * 40}`} stroke="#0A040E" strokeWidth="10" fill="none" strokeLinecap="round" />
            ))}
          </g>
        ))}
      </g>
      <Fireflies id="cr-ff" t={T} seed={19} n={14} x={0} y={1250} w={1080} h={500} color="#FFD27A" />
      <Fog id="cr-fog" t={T} y={1280} x={540} rx={700} ry={50} color="#F0A0A0" opacity={0.25} />
      <Embers t={T} x={540} y={1400} w={900} h={500} n={0} />
    </g>
  );
};
