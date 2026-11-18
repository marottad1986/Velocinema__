import React from 'react';
import { eio, eo, eob, lerp, seg } from '../../lib/anim';
import { HAND, RIGHTEOUS, SANS } from '../../lib/fonts';
import { FxDefs } from '../../lib/fx';
import { Glow, Lightning, Stars, flashAt } from '../../lib/elements';
import { Binario } from '../../lib/binari';
import { ArtPiazza, DARK, INK, P55, Photo, RED, TimeCar, YEL } from '../../scenes/ritorno-al-futuro/Linee';
import { Almanac } from '../../scenes/ritorno-al-futuro-parte-2/Linee2';
import { Tomb } from '../../scenes/ritorno-al-futuro-parte-3/Linee3';
import { Finish16, H, Motes16, W } from '../fx16';
import type { ParteProps } from '../registro';

// Aggancio del video lungo (VIDEO-LUNGO.md): il fotogramma 0 è la miniatura YouTube completa.
// Miniatura: a sinistra «SPIEGATO SEMPLICE», «RITORNO / AL FUTURO» enorme al neon e «LA TRILOGIA»; a destra un grande
// quadrante d'orologio al neon con dentro la piazza del 1955 e la torre dell'orologio colpita dal fulmine; in basso il
// binario del tempo che attraversa tutto il fotogramma e, dopo lo scambio, si stacca in un ramo rosso. Notte anni '80.
// Poi (dalla 2ª frase) la scritta si fa da parte e sul binario si accendono le quattro epoche (1885, 1955, 1985, 2015);
// le tre frasi successive portano i tre richiami delle tre Parti, uno per frase: la foto che sbiadisce, l'almanacco che
// brilla, la lapide con il nome di Doc. Sull'ultima frase l'auto del tempo (generica) corre sul binario verso il 1985 e
// tutto si spegne verso il cartello della Parte 1.
// Piani: cielo con stelle (0,2) · quadrante (0,5) · cartolina e fulmine (0,7) · binario (1) · oggetti (1) · pulviscolo (1,3)

const NEON = '#5CF0FF';
const PINK = '#FF4FB0';
const O = [1500, 460] as const; // centro del quadrante
const R = 320;
const TY = 860; // il binario
const CROMA = 60 / 72 / 2;
const g = (s: number) => Math.round(s / CROMA) * CROMA;
const pop = (t: number, t0: number) => eob(seg(t, t0, t0 + 0.45), 1.7);
const ANNI = [['1885', 300], ['1955', 760], ['1985', 1220], ['2015', 1680]] as const;
const MAIN = `M-100 ${TY} H${W + 100}`;
/** Lo skyline di Hill Valley di notte, dietro il binario: palazzi bassi con le finestre accese e due insegne al neon. */
const PALAZZI = Array.from({ length: 22 }, (_, i) => ({ x: -40 + i * 92 + ((i * 37) % 30), w: 70 + ((i * 53) % 40), h: 60 + ((i * 71) % 130) }));
const RAMO = `M1000 ${TY} C1160 ${TY} 1180 ${TY + 150} 1340 ${TY + 150} H${W + 100}`;

export const Aggancio: React.FC<ParteProps> = ({ t, dur, cues }) => {
  // ---- tempi (sulla croma a 72 bpm, come lo spartito)
  const via = eio(seg(t, cues[1] - 0.3, cues[1] + 0.9)); // la scritta si fa da parte
  const anni = (i: number) => g(cues[1] + 0.9 + i * 0.42);
  const foto = g(cues[2] + 0.1);
  const libro = g(cues[3] + 0.1);
  const tomba = g(cues[4] + 0.1);
  const corsa = eio(seg(t, g(cues[5] + 0.2), g(cues[5] + 2.4)));
  const cartello = g(cues[5] + 2.0);
  const buio = seg(t, dur - 0.9, dur);
  const sparisce = Math.max(buio, seg(t, g(cues[5] + 0.2), g(cues[5] + 1.0)));
  // fulmine: uno sul fotogramma 0 (la miniatura lo mostra già acceso), poi uno per frase della domanda
  const bolts = [0, g(1.6), g(cues[1] + 0.4)];
  const flash = Math.max(t < 0.25 ? 0.5 : 0, flashAt(t, bolts.filter((b) => b > 0).filter((b) => t >= b - 0.1).slice(-1)));
  const fadeFoto = seg(t, foto + 0.8, foto + 2.0);
  // il quadrante si allontana un poco e si sposta in alto a destra quando la scritta esce, per far posto ai tre oggetti
  const dz = lerp(1, 0.78, via);
  const dx = lerp(0, 120, via), dy = lerp(0, -40, via);
  // lancette che corrono all'indietro
  const giro = -t * 40 - 600 * via;

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="ag" />
          <radialGradient id="ag-bg" cx=".72" cy=".42" r=".8">
            <stop offset="0" stopColor="#3A2470" />
            <stop offset=".55" stopColor="#1C1240" />
            <stop offset="1" stopColor="#0A0618" />
          </radialGradient>
          <pattern id="ag-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 H0 V40" fill="none" stroke="#33255E" strokeWidth="1" /></pattern>
          <clipPath id="ag-dial"><circle cx="0" cy="0" r={R - 34} /></clipPath>
          <linearGradient id="ag-left" x1="0" x2="1">
            <stop offset="0" stopColor="#0A0618" stopOpacity=".85" />
            <stop offset=".55" stopColor="#0A0618" stopOpacity=".4" />
            <stop offset="1" stopColor="#0A0618" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#ag-bg)" />
        <rect width={W} height={H} fill="url(#ag-grid)" opacity=".5" transform={`translate(${-t * 4} 0)`} />
        <Stars t={t} seed={1985} n={60} x={0} y={0} w={W} h={700} color="#F4EEE2" size={1} />

        {/* ---- il quadrante con la piazza del 1955 e il fulmine */}
        <g transform={`translate(${O[0] + dx} ${O[1] + dy}) scale(${dz})`}>
          <Glow id="ag-dg" x={0} y={0} r={R * 1.5} t={t} color={PINK} amp={0.06} rate={1.6} opacity={0.35} />
          <circle r={R} fill="#140C30" stroke={PINK} strokeWidth="10" />
          <circle r={R} fill="none" stroke="#FFD0EC" strokeWidth="3" />
          <circle r={R - 22} fill="none" stroke={NEON} strokeWidth="4" strokeDasharray="3 18" />
          <g clipPath="url(#ag-dial)">
            <rect x={-R} y={-R} width={R * 2} height={R * 2} fill="#2A1F5E" />
            <g transform="translate(-405 -190) scale(0.75)"><ArtPiazza c={P55} T={t} storm={0.9} minutes={604} /></g>
            {/* il cielo di tempesta sopra la piazza */}
            <rect x={-R} y={-R} width={R * 2} height="110" fill="#1C1240" opacity=".55" />
            <Lightning x={-60} y={-R + 10} h={190} flash={flash} seed={7} width={9} />
            {flash > 0 && <circle r={R} fill="#DDEFFF" opacity={0.35 * flash} />}
          </g>
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M0 ${-R + 8} V${-R + (i % 3 ? 26 : 40)}`} stroke={NEON} strokeWidth={i % 3 ? 4 : 9} transform={`rotate(${i * 30})`} />)}
          <g opacity=".9">
            <path d="M0 16 V-170" stroke={NEON} strokeWidth="12" strokeLinecap="round" transform={`rotate(${giro / 12 + 300})`} />
            <path d="M0 22 V-250" stroke={YEL} strokeWidth="7" strokeLinecap="round" transform={`rotate(${giro})`} />
            <circle r="16" fill={YEL} stroke={DARK} strokeWidth="4" />
          </g>
          {/* due scie del viaggio nel tempo che girano attorno al quadrante */}
          {[0, 1].map((i) => (
            <path key={i} d={`M${Math.cos(i * 2.6) * (R + 40)} ${Math.sin(i * 2.6) * (R + 40)} A${R + 40} ${R + 40} 0 0 1 ${Math.cos(i * 2.6 + 1.6) * (R + 40)} ${Math.sin(i * 2.6 + 1.6) * (R + 40)}`}
              fill="none" stroke={YEL} strokeWidth="10" strokeDasharray="30 20" strokeDashoffset={-t * 120} strokeLinecap="round" opacity=".85" transform={`rotate(${t * 18})`} />
          ))}
        </g>

        {/* ---- lo skyline di Hill Valley */}
        <g opacity={0.9}>
          {PALAZZI.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={TY - 20 - b.h} width={b.w} height={b.h + 20} fill="#160E33" stroke="#3A2A7A" strokeWidth="3" />
              {Array.from({ length: Math.floor(b.h / 34) }, (_, k) => (
                <rect key={k} x={b.x + 12 + ((k + i) % 2) * (b.w / 2 - 12)} y={TY - b.h + k * 34} width="16" height="12" fill={k % 3 === 0 ? PINK : '#FFD98A'} opacity={(0.25 + 0.3 * Math.sin(t * 1.3 + i * 2 + k)) * 0.9} />
              ))}
            </g>
          ))}
          <rect x="0" y={TY - 30} width={W} height="40" fill="#0C0820" opacity=".7" />
        </g>
        {/* ---- il binario del tempo, con il ramo rosso */}
        <Binario id="ag-ramo" d={RAMO} t={t} rail="#FF6A5A" sleeper="#5A2030" opacity={0.9} lit={0.5} glow="#FF3030" />
        <Binario id="ag-main" d={MAIN} t={t} rail={INK} sleeper="#7A5E8E" lit={corsa > 0 ? 0.6 : 0} glow={YEL} />
        {ANNI.map(([y, x], i) => {
          const k = pop(t, anni(i));
          return t >= anni(i) ? (
            <g key={y} transform={`translate(${x} ${TY}) scale(${k})`} opacity={1 - buio}>
              <rect x="-70" y="-30" width="140" height="60" rx="14" fill={DARK} stroke={YEL} strokeWidth="5" />
              <text y="15" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="40" fill={YEL}>{y}</text>
            </g>
          ) : null;
        })}

        {/* ---- i tre richiami: la foto, l'almanacco, la lapide */}
        {t >= foto && (
          <g transform={`translate(330 520) scale(${1.25 * pop(t, foto)})`} opacity={1 - sparisce}>
            <Photo T={t} fadeBro={fadeFoto} fadeSis={seg(t, foto + 1.2, foto + 2.4)} fadeMe={0.5 * seg(t, foto + 1.8, foto + 2.8)} />
          </g>
        )}
        {t >= libro && (
          <g transform={`translate(800 500) rotate(-6) scale(${1.3 * pop(t, libro)})`} opacity={1 - sparisce}>
            <Almanac T={t} glow={1} />
          </g>
        )}
        {t >= tomba && (
          <g transform={`translate(1200 560) scale(${1.15 * pop(t, tomba)})`} opacity={1 - sparisce}>
            <Tomb T={t} lit={1} />
          </g>
        )}
        {[[foto, 330, 'non nato?'], [libro, 800, 'la città cambia'], [tomba, 1200, 'il nome di Doc']].map(([t0, x, s]) => (
          t >= (t0 as number) + 0.4 ? (
            <text key={s as string} x={x as number} y={720} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="46" fill={YEL} stroke={DARK} strokeWidth="8" paintOrder="stroke" opacity={seg(t, (t0 as number) + 0.4, (t0 as number) + 0.8) * (1 - sparisce)}>{s as string}</text>
          ) : null
        ))}

        {/* ---- nella miniatura l'auto del tempo è già sul binario, con la scia: nei primi secondi parte e sparisce a destra */}
        {t < 3.2 && (() => {
          const p = eio(seg(t, 0.8, 3.2));
          return (
            <g transform={`translate(${lerp(820, W + 260, p)} ${TY - 40})`}>
              <path d={`M-140 18 H${-140 - 380 - 300 * p}`} stroke={YEL} strokeWidth="12" strokeDasharray="34 20" strokeDashoffset={-t * 220} strokeLinecap="round" opacity=".85" />
              <TimeCar T={t} glow={0.6 + 0.4 * p} s={0.95} />
            </g>
          );
        })()}
        {/* ---- l'auto del tempo corre verso il 1985 */}
        {corsa > 0 && (
          <g transform={`translate(${lerp(-200, 1220, corsa)} ${TY - 40})`}>
            <path d={`M-140 18 H${-140 - 500 * Math.min(1, corsa * 2)}`} stroke={YEL} strokeWidth="12" strokeDasharray="34 20" strokeDashoffset={-t * 220} strokeLinecap="round" opacity=".85" />
            <TimeCar T={t} glow={0.4 + 0.6 * corsa} s={0.85} />
          </g>
        )}
        {t >= cartello && (
          <text x={1220} y={TY - 150} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="52" letterSpacing="4" fill={INK} stroke={DARK} strokeWidth="10" paintOrder="stroke" opacity={seg(t, cartello, cartello + 0.4)}>HILL VALLEY · 1985</text>
        )}

        {/* velatura a sinistra dietro il titolo */}
        <rect width={1100} height={H} fill="url(#ag-left)" opacity={1 - via} />
        <Motes16 T={t} color="#F4EEE2" />
        {flash > 0 && <rect width={W} height={H} fill="#DDEFFF" opacity={0.08 * flash} />}
        <Finish16 id="ag" tint="#1A1238" tintOpacity={0.08} />
        {buio > 0 && <rect width={W} height={H} fill="#0C0820" opacity={buio * 0.9} />}
      </svg>

      {/* ---- la scritta della miniatura */}
      <div style={{ position: 'absolute', left: 96, top: 150, width: 1150, opacity: 1 - via, transform: `translateX(${-via * 80}px)` }}>
        <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 10, background: YEL, color: DARK, fontFamily: SANS, fontWeight: 900, fontSize: 34, letterSpacing: '0.16em' }}>SPIEGATO SEMPLICE</div>
        <div style={{
          marginTop: 18, fontFamily: RIGHTEOUS, fontSize: 196, lineHeight: 0.98, color: '#F4EEE2',
          textShadow: `0 10px 0 ${DARK}, 0 0 36px rgba(255,79,176,.75), 0 0 80px rgba(92,240,255,.4)`,
        }}>RITORNO<br />AL FUTURO</div>
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 70, height: 8, borderRadius: 4, background: RED }} />
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, letterSpacing: '0.2em', color: NEON, textShadow: `0 5px 0 ${DARK}, 0 0 24px rgba(92,240,255,.6)` }}>LA TRILOGIA</div>
        </div>
      </div>
    </>
  );
};
