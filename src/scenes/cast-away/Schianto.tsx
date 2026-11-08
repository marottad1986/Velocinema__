import React from 'react';
import { camera, eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Clouds, Glow, Lightning, NearMotes, Rain, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Chop, K, Parcel } from './Comuni';

// L'aereo precipita: notte di tempesta sull'oceano. L'aereo cargo del corriere (senza oblò, portellone merci) vola basso
// tra le nubi (fr. 0); un fulmine e il motore prende fuoco, fumo denso (fr. 1); picchiata e colonna d'acqua all'impatto
// (fr. 2); tra la schiuma si gonfia la zattera di salvataggio arancione con il tettuccio e la luce (fr. 3); intorno solo
// rottami e pacchi che galleggiano (fr. 4).
// Piani: cielo e lampi (0,2) · nubi (0,4) · aereo e fumo (0,55) · mare lontano (0,6) · impatto (0,7) · onde (0,8)
//        · zattera di salvataggio (0,9) · rottami e cresta vicina (1,1) · cresta in primo piano (1,3) · pioggia (1,6)

const r = rng(909);
const SPLASH = Array.from({ length: 28 }, () => ({ vx: (r() - 0.5) * 620, vy: 380 + r() * 520, rr: 6 + r() * 12 }));
const PUFFS = Array.from({ length: 12 }, (_, i) => ({ ph: i / 12, dx: (r() - 0.5) * 40, s: 0.8 + r() * 0.5 }));

export const Schianto: React.FC<SceneProps> = ({ t, dur, palette: P, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const strike = griglia(cues[1] + 0.35); // il fulmine colpisce: il motore prende fuoco
  const IMPACT = griglia(cues[2] + 0.8); // «e precipita in mare»
  const flash = flashAt(t, [strike, IMPACT]);
  const fire = eo(seg(t, strike, strike + 0.5));
  // traiettoria: vola basso da destra, perde quota col motore in fiamme, poi picchiata fino al mare
  const fall = eio(seg(t, strike + 0.3, IMPACT));
  const px = lerp(700, 520, seg(t, 0, strike + 0.3)) - 220 * fall;
  const py = 820 + 270 * fall * fall + Math.sin(t * 2.4) * 8 * (1 - fall);
  const tilt = -4 - 24 * fall + Math.sin(t * 9) * 2.5 * fire;
  const gone = seg(t, IMPACT - 0.05, IMPACT + 0.1);
  // motore (coordinate della scena) da cui esce il fumo
  const ta = (tilt * Math.PI) / 180;
  const ex = px + 1.1 * (-60 * Math.cos(ta) - 58 * Math.sin(ta)), ey = py + 1.1 * (-60 * Math.sin(ta) + 58 * Math.cos(ta));
  const splash = seg(t, IMPACT, IMPACT + 1.2);
  const raftAt = griglia(cues[3] + 0.2);
  const raft = eob(seg(t, raftAt, raftAt + 0.9), 1.6); // la zattera si gonfia: si salva
  const canopy = eo(seg(t, raftAt + 0.6, raftAt + 1.3));
  const debris = seg(t, IMPACT + 0.4, IMPACT + 1.4);
  const sw = Math.sin(t * 2.2) * 14;
  const ix = 340; // punto dell'impatto

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sc" />
        <Lin id="sc-sky" stops={[[0, '#04080F'], [0.25, '#0B1726'], [0.45, '#17293D'], [0.55, '#24405A']]} />
        <Lin id="sc-far" stops={[[0, '#3C6A86'], [0.05, '#21445F'], [1, '#0E2236']]} />
        <Lin id="sc-sea" stops={[[0, '#3F7896'], [0.05, '#244D69'], [0.4, '#16324A'], [1, '#0B1B2A']]} />
        <Lin id="sc-near" stops={[[0, '#34698A'], [0.06, '#1B3B55'], [0.5, '#0E2236'], [1, '#06111C']]} />
        <Lin id="sc-front" stops={[[0, '#2C5A78'], [0.07, '#11283D'], [1, '#040B13']]} />
        <Lin id="sc-hull" stops={[[0, '#D3DCE4'], [0.55, '#A9B6C3'], [1, '#6E7E8D']]} />
        <Lin id="sc-tube" stops={[[0, '#FF8A5C'], [0.5, P.accento], [1, '#A9361C']]} />
        <radialGradient id="sc-fire">
          <stop offset="0" stopColor="#FFF0B0" stopOpacity="1" />
          <stop offset=".35" stopColor="#FFB040" stopOpacity=".85" />
          <stop offset="1" stopColor="#FF5A1F" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sc-puff">
          <stop offset="0" stopColor="#A3ACB4" stopOpacity="1" />
          <stop offset=".6" stopColor="#6E7882" stopOpacity=".9" />
          <stop offset="1" stopColor="#3A444E" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo e lampi */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#sc-sky)" />
          <rect x="-200" y="-200" width="1480" height="2400" fill="#CFE2F0" opacity={flash * 0.35} />
          <Lightning x={860} y={660} h={420} flash={flash} seed={4} width={9} />
          <Lightning x={180} y={700} h={360} flash={flash * 0.7} seed={9} width={6} />
        </g>

        {/* PIANO 1 — nubi di tempesta in due strati */}
        <g transform={L(0.4)}>
          <Clouds id="sc-cl2" t={t + 4} color="#0A1522" seed={8} n={3} y={-20} h={200} speed={0.5} opacity={0.95} />
          <Clouds id="sc-cl" t={t} color="#1D3149" seed={21} n={4} y={660} h={180} speed={0.7} opacity={0.85} />
        </g>
        <g transform={L(0.5)}><Rain t={t} level="far" seed={5} color="#7FA0BC" opacity={0.45} angle={24} /></g>

        {/* PIANO 2 — l'aereo cargo: fumo denso dal motore, luci di posizione, portellone merci */}
        <g transform={L(0.55)}>
          <g opacity={1 - gone} transform={`translate(${px} ${py}) rotate(${tilt}) scale(1.1)`}>
            {/* deriva e piani di coda */}
            <path d="M190 -40 L250 -150 H292 L272 -40 Z" fill="#8E9DAB" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <path d="M206 -110 H276" stroke="#B5543C" strokeWidth="10" />
            <path d="M200 -6 L290 30 H318 L270 -8 Z" fill="#7E8D9B" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            {/* fusoliera senza oblò */}
            <path d="M-300 -8 Q-322 -46 -262 -56 H230 Q296 -52 312 -22 Q292 6 230 10 H-262 Q-306 6 -300 -8 Z" fill="url(#sc-hull)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M-300 -22 Q-280 -40 -250 -44" fill="none" stroke="#25323D" strokeWidth="14" strokeLinecap="round" />
            <path d="M-286 -30 h22" stroke="#9FD3F0" strokeWidth="6" strokeLinecap="round" />
            {/* portellone merci e pannelli */}
            <rect x="-170" y="-48" width="96" height="50" rx="4" fill="#B7C3CF" stroke={K} strokeWidth="5" />
            <path d="M-160 -38 H-84 M-160 -26 H-84" stroke="#6E7E8D" strokeWidth="3" />
            {[-40, 40, 120, 190].map((x) => <path key={x} d={`M${x} -54 V8`} stroke="#6E7E8D" strokeWidth="3" opacity=".7" />)}
            <path d="M-250 -50 H200" stroke="#F2F6F9" strokeWidth="5" strokeLinecap="round" opacity=".7" />
            {/* ala con il motore */}
            <path d="M-30 -10 L-170 92 H-110 L60 -6 Z" fill="#8E9DAB" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <rect x="-150" y="40" width="86" height="36" rx="18" fill="#6E7E8D" stroke={K} strokeWidth="6" />
            <ellipse cx="-150" cy="58" rx="8" ry="16" fill="#25323D" />
            {/* motore in fiamme dopo il fulmine */}
            {fire > 0 && (
              <g>
                <ellipse cx="-40" cy="58" rx={170 * fire} ry={90 * fire} fill="url(#sc-fire)" />
                {[0, 1, 2].map((i) => (
                  <path key={i} d={`M${-70 + i * 10} 48 q${30 + 10 * Math.sin(t * 13 + i)} ${-8} ${70 + 20 * Math.sin(t * 9 + i * 2)} ${-4 + 6 * Math.sin(t * 11 + i)} q${-30} 14 ${-70 - 20 * Math.sin(t * 9 + i * 2)} 20 Z`} fill={['#FF6A2A', '#FFA040', '#FFE08A'][i]} opacity={fire} />
                ))}
              </g>
            )}
            {/* luci di posizione */}
            <circle cx="282" cy="-148" r="9" fill="#FF5A4A" opacity={mod(t, 0.8) < 0.3 ? 1 : 0.2} />
            <circle cx="-166" cy="90" r="8" fill="#7CFF8A" />
          </g>
          {fire > 0 && PUFFS.map((p, i) => {
            const k = mod(t * 0.9 + p.ph, 1);
            const age = Math.min(k, (t - strike) * 0.9);
            if (age < 0) return null;
            return <circle key={i} cx={ex + age * 380 + p.dx} cy={ey - age * 200 - 80 * fall * age} r={(30 + age * 110) * p.s} fill="url(#sc-puff)" opacity={0.9 * fire * (1 - age * 0.8) * (1 - gone)} />;
          })}
          <Glow id="sc-plane" x={px - 70} y={py + 60} r={220} t={t} color="#FF9A4A" amp={0.25} rate={9} opacity={0.55 * fire * (1 - gone)} />
        </g>

        {/* PIANO 3 — mare lontano a creste */}
        <g transform={L(0.6, 0, sw * 0.4)}>
          <Chop t={t} y={1080} fill="url(#sc-far)" amp={36} w={200} speed={80} bob={8} foam={0.8} foamColor="#B8D0E0" />
        </g>

        {/* PIANO 4 — impatto: colonna d'acqua alta, bagliore e spruzzi */}
        <g transform={L(0.7)}>
          {splash > 0 && splash < 1 && (
            <g>
              <Glow id="sc-boom" x={ix} y={1060} r={380} t={t} color="#FFB060" amp={0} opacity={0.8 * (1 - splash)} />
              {/* sbuffo d'acqua: getti a ventaglio con le punte frastagliate, velo di schiuma e anello alla base */}
              {[-0.5, -0.25, 0, 0.25, 0.5].map((a, i) => {
                const h = (430 - Math.abs(a) * 300) * Math.sin(Math.min(1, splash * 1.4) * Math.PI * 0.5) * (1 - seg(splash, 0.55, 1));
                const top = 1100 - h, tx = ix + a * 520 * eo(splash);
                return (
                  <path key={i} d={`M${ix + a * 90 - 46} 1110 Q${(ix + tx) / 2 - 40} ${(1110 + top) / 2} ${tx - 30} ${top + 30} l14 -34 l18 22 l14 -40 l16 30 l14 -24 l10 46 Q${(ix + tx) / 2 + 40} ${(1110 + top) / 2} ${ix + a * 90 + 46} 1110 Z`}
                    fill={i === 2 ? '#E6F2FA' : '#C2D8E8'} stroke="#F4FBFF" strokeWidth="5" strokeLinejoin="round" opacity={0.9 * (1 - splash * 0.6)} />
                );
              })}
              {Array.from({ length: 9 }, (_, i) => (
                <circle key={i} cx={ix + (i - 4) * 70 * eo(splash)} cy={1060 - 260 * Math.sin(splash * Math.PI) + (i % 3) * 30} r={60 + 40 * splash} fill="#DCEAF4" opacity={0.25 * (1 - splash)} />
              ))}
              <ellipse cx={ix} cy="1112" rx={120 + 260 * eo(splash)} ry={22 + 30 * eo(splash)} fill="none" stroke="#F4FBFF" strokeWidth={14 * (1 - splash) + 3} opacity={1 - splash * 0.7} />
              {SPLASH.map((s, i) => (
                <circle key={i} cx={ix + s.vx * splash} cy={1100 - s.vy * splash + 820 * splash * splash} r={s.rr * (1 - splash * 0.5)} fill="#E6F2FA" opacity={1 - splash} />
              ))}
            </g>
          )}
        </g>

        {/* PIANO 5 — onda media */}
        <g transform={L(0.8, 0, sw * 0.7)}>
          <Chop t={t} y={1180} fill="url(#sc-sea)" amp={70} w={320} speed={110} bob={14} ph={1} foam={1} />
        </g>

        {/* PIANO 6 — la zattera di salvataggio che si gonfia: due tubolari, tettuccio, luce che lampeggia (accento) */}
        <g transform={L(0.9, 0, sw * 0.8)}>
          {raft > 0 && (
            <g transform={`translate(${600 + Math.sin(t * 0.9) * 20} ${1150 + Math.sin(t * 2) * 18}) rotate(${Math.sin(t * 1.7) * 9}) scale(${raft * 1.1})`} strokeLinejoin="round">
              <Glow id="sc-raftg" x={0} y={-60} r={260} t={t} color="#FFB07A" amp={0.08} rate={2} opacity={0.35} />
              {/* tettuccio ad arco */}
              <g transform={`scale(1 ${Math.max(0.05, canopy)})`} style={{ transformOrigin: '0 -10px' }}>
                <path d="M-150 -10 Q-150 -170 0 -178 Q150 -170 150 -10 Z" fill="#D9542F" stroke={K} strokeWidth="8" />
                <path d="M-120 -40 Q-110 -150 0 -156" fill="none" stroke="#FFC9A8" strokeWidth="8" strokeLinecap="round" opacity=".7" />
                <path d="M-150 -60 Q0 -84 150 -60" fill="none" stroke="#E9EEF2" strokeWidth="12" opacity=".9" />
                <path d="M-40 -10 Q-40 -96 0 -100 Q40 -96 40 -10 Z" fill="#5A1E10" stroke={K} strokeWidth="5" />
                <rect x="-6" y="-200" width="12" height="24" fill="#33424E" stroke={K} strokeWidth="3" />
                <circle cx="0" cy="-206" r="10" fill="#FFF6C8" opacity={mod(t, 1) < 0.35 ? 1 : 0.25} />
                <Glow id="sc-beacon" x={0} y={-206} r={70} t={t} color="#FFF0A0" amp={0} opacity={mod(t, 1) < 0.35 ? 0.9 : 0.1} />
              </g>
              {/* tubolari */}
              <ellipse cx="0" cy="30" rx="200" ry="52" fill="url(#sc-tube)" stroke={K} strokeWidth="9" />
              <ellipse cx="0" cy="-4" rx="190" ry="48" fill="url(#sc-tube)" stroke={K} strokeWidth="9" />
              <path d="M-170 -22 Q-80 -46 20 -48" fill="none" stroke="#FFC9A8" strokeWidth="7" strokeLinecap="round" opacity=".85" />
              {/* cima di salvataggio a festoni con le valvole */}
              <path d="M-196 20 q24 26 48 0 q24 26 48 0 q24 26 48 0 q24 26 48 0 q24 26 48 0 q24 26 48 0 q24 26 48 0 q24 26 48 0" fill="none" stroke="#F4EFE2" strokeWidth="5" />
              {[-150, 0, 150].map((x) => <rect key={x} x={x - 8} y="-14" width="16" height="16" rx="4" fill="#33424E" stroke={K} strokeWidth="3" />)}
              {/* schiuma intorno */}
              <path d="M-240 60 q40 -16 80 0 t80 0 t80 0 t80 0 t80 0 t80 0" fill="none" stroke="#F4FBFF" strokeWidth="9" strokeLinecap="round" opacity=".85" />
            </g>
          )}
        </g>

        {/* PIANO 7 — rottami e pacchi del carico che affiorano, cresta vicina */}
        <g transform={L(1.1, 0, sw)}>
          {debris > 0 && (
            <g opacity={debris}>
              <g transform={`translate(${210 + Math.sin(t * 1.1) * 18} ${1270 + Math.sin(t * 2.2 + 1) * 16}) rotate(${-14 + Math.sin(t * 1.4) * 8})`}>
                <Parcel x={0} y={0} w={120} h={84} d={34} wet={0.8} />
              </g>
              <g transform={`translate(${860 + Math.sin(t * 1.3) * 14} ${1250 + Math.sin(t * 2 + 2) * 14}) rotate(${10 + Math.sin(t * 1.2) * 6})`}>
                <path d="M-90 -14 L80 -30 L96 6 L-80 22 Z" fill="#8E9DAB" stroke={K} strokeWidth="6" />
                <path d="M-70 -4 L70 -18" stroke="#B5543C" strokeWidth="6" />
              </g>
            </g>
          )}
          <Chop t={t} y={1370} fill="url(#sc-near)" amp={100} w={420} speed={140} bob={18} ph={2} foam={1} line="#081625" />
        </g>

        {/* PIANO 8 — cresta in primo piano che tocca i bordi, con un pacco che galleggia */}
        <g transform={L(1.3, 0, sw * 1.3)}>
          <g transform={`translate(${330 + Math.sin(t * 1.1) * 30} ${1640 + Math.sin(t * 2.2 + 1) * 26}) rotate(${-12 + Math.sin(t * 1.4) * 8})`}>
            <Parcel x={0} y={0} w={200} h={130} d={50} wet={1} />
          </g>
          <Chop t={t} y={1700} fill="url(#sc-front)" amp={150} w={600} speed={180} bob={26} ph={3} foam={1} line="#040B13" />
        </g>

        {/* PIANO 9 — pioggia vicina e spruzzi */}
        <g transform={L(1.6)}><Rain t={t} level="near" seed={17} color="#C8DCEA" opacity={0.5} angle={46} /></g>
        <g transform={L(1.8)}><NearMotes id="sc-near" t={t} color="#DCEBF5" n={8} vx={-90} vy={20} opacity={0.14} /></g>
      </g>
      <rect width="1080" height="1920" fill="#E4F2FA" opacity={flash * 0.1} />
      <Finish id="sc" tint="#0E2A3A" tintOpacity={0.13} />
    </svg>
  );
};
