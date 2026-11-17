import React from 'react';
import { camera, eo, eio, lerp, seg } from '../../lib/anim';
import { Flyers, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Albero, Cane, ConjDefs, Fattoria, K, Ombra, TINT_GIORNO } from './Comuni';

// La fattoria nuova: la campagna del Rhode Island al tramonto d'autunno, 1971. Su «i Perron, una coppia con cinque
// figlie» la station wagon carica di valigie entra nel vialetto e si ferma; su «vecchia fattoria» si accendono la lampada
// del portico e due finestre; su «Sadie si rifiuta di entrare» il cane al cancello punta le zampe e abbaia verso la casa,
// e l'abbaino in alto, l'unica finestra che nessuno ha acceso, si illumina un attimo di freddo. Nessuna persona.
// Piani: cielo (0,2) · colline e bosco (0,4) · fattoria (0,6) · albero (0,75) · auto e vialetto (0,95) · steccato, erba e cane (1,2) · foglie (1,6)

export const Casa: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tArr = griglia(cues[0] + 0.2);
  const car = eio(seg(t, tArr, tArr + 2.6)); // l'auto entra e si ferma
  const bob = car < 1 ? Math.sin(t * 18) * 2 : 0;
  const tLamp = griglia(cues[1] + 0.6);
  const lamp = eo(seg(t, tLamp, tLamp + 0.25));
  const win2 = eo(seg(t, tLamp + 0.83, tLamp + 1.1));
  const tDog = griglia(cues[2] + 0.4);
  const brace = eo(seg(t, tDog - 0.4, tDog));
  // tre latrati a crome (72 bpm), poi un ringhio basso
  const bark = [0, 1, 2].reduce((m, i) => Math.max(m, Math.sin(Math.PI * seg(t, tDog + (i * 60) / 72 / 2, tDog + (i * 60) / 72 / 2 + 0.3))), 0);
  const cold = Math.sin(Math.PI * seg(t, tDog + 0.9, tDog + 2.4)); // l'abbaino che si accende di freddo
  const carX = lerp(-560, 300, car);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ca" />
        <ConjDefs id="ca" />
        <Lin id="ca-sky" stops={[[0, '#1C2440'], [0.3, '#4A3A5A'], [0.55, '#B8606A'], [0.68, '#E89A5A'], [0.78, '#F2C47A']]} />
        <Lin id="ca-field" stops={[[0, '#6A5A34'], [0.4, '#4A3E26'], [1, '#1E1A12']]} />
        <Lin id="ca-hill" stops={[[0, '#3A3446'], [1, '#2A2632']]} />
        <Lin id="ca-car" stops={[[0, '#7A2E22'], [0.5, '#5A2018'], [1, '#2A0E0A']]} />
        <Lin id="ca-panel" stops={[[0, '#8A5A30'], [1, '#4A2E16']]} />
      </defs>
      <g transform={cam.transform}>
        {/* cielo del tramonto con il sole basso dietro le colline */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#ca-sky)" />
          <Glow id="ca-sun" x={180} y={1080} r={520} t={t} color="#FFD898" amp={0.03} rate={0.8} opacity={0.7} />
          <circle cx="180" cy="1090" r="70" fill="#FFE8B8" opacity=".9" />
          {[[700, 760, 220], [260, 860, 160], [920, 900, 140]].map(([x, y, w], i) => (
            <path key={i} d={`M${x - w} ${y} Q${x - w / 2} ${y - 26} ${x} ${y - 10} Q${x + w / 2} ${y - 30} ${x + w} ${y} Z`} fill="#E8A07A" opacity=".45" transform={`translate(${Math.sin(t * 0.2 + i) * 10} 0)`} />
          ))}
        </g>
        {/* colline e bosco lontano */}
        <g transform={L(0.4)}>
          <path d="M-300 1110 Q0 1040 300 1090 Q600 1130 900 1060 Q1150 1020 1400 1080 V1400 H-300 Z" fill="url(#ca-hill)" />
          {Array.from({ length: 40 }, (_, i) => {
            const x = -260 + i * 42;
            const h = 40 + ((i * 37) % 50);
            return <path key={i} d={`M${x - 22} 1120 L${x} ${1120 - h} L${x + 22} 1120 Z`} fill="#26222C" />;
          })}
          <rect x="-300" y="1110" width="1700" height="400" fill="url(#ca-field)" />
          <path d="M-300 1130 H1400" stroke="#8A7A4A" strokeWidth="3" opacity=".4" />
        </g>
        {/* la fattoria */}
        <g transform={L(0.6)}>
          <Fattoria id="ca-f" x={430} y={1230} s={0.66} t={t} lit={[lamp * 0.9, win2 * 0.85, 0, win2 * 0.7, 0, 0]} wall={['#C8BEAA', '#7E7668']} />
          {/* l'abbaino che si accende di una luce fredda, da solo */}
          {cold > 0 && (
            <g>
              <rect x={430 - 50 * 0.66 - 23} y={1230 - 720 * 0.66} width={46} height={60} fill="#9FC8E8" opacity={cold * 0.8} />
              <Glow id="ca-cold" x={430 - 33} y={1230 - 690 * 0.66} r={110} t={t} color="#9FC8E8" amp={0.1} rate={9} opacity={cold * 0.6} />
            </g>
          )}
          {/* la lampada del portico */}
          <Glow id="ca-lamp" x={430 - 50 * 0.66} y={1230 - 270 * 0.66} r={170} t={t} color="#FFC870" amp={0.06} rate={3} opacity={0.75 * lamp} />
          <circle cx={430 - 50 * 0.66} cy={1230 - 270 * 0.66} r="8" fill={lamp > 0.5 ? '#FFF0C0' : '#5A5040'} stroke={K} strokeWidth="3" />
          {/* il vialetto di ghiaia */}
          <path d="M360 1236 Q300 1300 120 1400 L620 1400 Q480 1300 420 1236 Z" fill="#8A7A5E" opacity=".55" />
          <Cane id="ca" x={790} y={1262} s={0.95} t={t} bark={bark} brace={brace} flip />
          {/* cassetta delle lettere */}
          <path d="M640 1240 V1170" stroke={K} strokeWidth="10" />
          <rect x="616" y="1140" width="56" height="34" rx="12" fill="#5A6A6E" stroke={K} strokeWidth="5" />
          <path d="M672 1142 V1122 H686" stroke="#C83A2A" strokeWidth="5" fill="none" />
        </g>
        {/* l'albero nodoso davanti alla casa */}
        <g transform={L(0.75)}>
          <Albero id="ca" x={940} y={1250} s={0.54} t={t} sway={1} rim="#F2B07A" reach={0.6} />
        </g>
        {/* la station wagon carica di valigie che arriva nel vialetto */}
        <g transform={L(0.95)}>
          <g transform={`translate(${carX} ${1300 + bob}) scale(.8)`}>
            <Ombra id="ca" x={0} y={8} rx={300} ry={26} />
            {/* valigie e scatoloni sul portapacchi */}
            <rect x={-200} y={-250} width={110} height={60} rx={6} fill="#6A4A2A" stroke={K} strokeWidth="6" />
            <rect x={-80} y={-262} width={130} height={72} fill="#B8A07A" stroke={K} strokeWidth="6" />
            <path d="M-80 -226 H50" stroke="#8A7050" strokeWidth="5" />
            <rect x={60} y={-244} width={80} height={54} rx={6} fill="#3A5A6A" stroke={K} strokeWidth="6" />
            <path d="M-210 -188 H160" stroke={K} strokeWidth="8" />
            {/* carrozzeria */}
            <path d="M-290 -40 Q-290 -96 -250 -104 L-170 -110 L-130 -188 H150 Q190 -186 220 -120 L280 -108 Q300 -96 298 -40 Z" fill="url(#ca-car)" stroke={K} strokeWidth="8" />
            <path d="M-270 -64 H280" stroke="url(#ca-panel)" strokeWidth="26" />
            <path d="M-270 -64 H280" stroke={K} strokeWidth="2" opacity=".4" />
            {/* finestrini con il riflesso del tramonto */}
            <path d="M-118 -176 H-20 V-114 H-150 Z M0 -176 H90 V-114 H0 Z M110 -176 H150 Q176 -172 196 -120 L110 -114 Z" fill="#3A4A5A" stroke={K} strokeWidth="6" />
            <path d="M-110 -170 L-130 -120 M10 -170 L-4 -120" stroke="#F2C47A" strokeWidth="6" opacity=".55" />
            {/* fari e paraurti */}
            <rect x={272} y={-92} width={22} height={20} rx={4} fill="#FFE8B0" stroke={K} strokeWidth="4" />
            <path d="M-296 -36 H300" stroke="#B8B8B0" strokeWidth="10" />
            {/* ruote */}
            {[-180, 190].map((wx) => (
              <g key={wx} transform={`translate(${wx} -20) rotate(${car * 720})`}>
                <circle r={48} fill="#141414" stroke={K} strokeWidth="6" />
                <circle r={24} fill="#8A8A86" stroke={K} strokeWidth="4" />
                <path d="M-20 0 H20 M0 -20 V20" stroke="#5A5A56" strokeWidth="4" />
              </g>
            ))}
            {car > 0 && car < 1 && <circle cx={-320} cy={-20} r={40 + 30 * car} fill="#B8A07A" opacity={0.3 * (1 - car)} />}
          </g>
        </g>
        {/* primo piano: steccato di legno, erba secca, il cane che non vuole entrare */}
        <g transform={L(1.2)}>
          <path d="M-200 1560 Q300 1530 1300 1570 V2200 H-200 Z" fill="#2A2416" />
          {[-120, 40, 200, 860, 1020, 1180].map((x, i) => (
            <g key={x}>
              <rect x={x - 18} y={1440 - (i % 2) * 20} width={36} height={300} fill="url(#ca-oldwood)" stroke={K} strokeWidth="7" />
              <path d={`M${x - 18} ${1440 - (i % 2) * 20} L${x} ${1414 - (i % 2) * 20} L${x + 18} ${1440 - (i % 2) * 20}`} fill="#6E6250" stroke={K} strokeWidth="6" />
            </g>
          ))}
          <path d="M-200 1500 H230 M-200 1600 H230 M840 1500 H1300 M840 1600 H1300" stroke="#5A5040" strokeWidth="22" />
          <path d="M-200 1500 H230 M840 1500 H1300" stroke="#F2B07A" strokeWidth="3" opacity=".4" transform="translate(0 -10)" />
          {/* il cancello aperto */}
          <g transform="translate(840 1450) skewY(-10) scale(.55 1)">
            <rect x={0} y={0} width={300} height={170} fill="none" stroke="#6E6250" strokeWidth="16" />
            <path d="M0 0 L300 170 M100 0 V170 M200 0 V170" stroke="#6E6250" strokeWidth="12" />
          </g>
          
          {Array.from({ length: 34 }, (_, i) => {
            const x = -160 + i * 42;
            const h = 70 + ((i * 53) % 90);
            const w = Math.sin(t * 1.6 + i * 0.7) * 10;
            return <path key={i} d={`M${x} 1760 Q${x + 6} ${1760 - h / 2} ${x + w} ${1760 - h}`} stroke={i % 3 ? '#7A6A3A' : '#A08A4A'} strokeWidth="6" fill="none" strokeLinecap="round" />;
          })}
        </g>
        <g transform={L(1.6)}>
          <Flyers t={t} n={9} seed={1971} shape="leaf" color="#C86A2A" outline={K} w={34} h={44} y0={700} y1={1700} speed={0.09} />
          <NearMotes id="ca-near" t={t} color="#F2C47A" n={6} y0={1100} opacity={0.1} />
        </g>
      </g>
      <Finish id="ca" tint={TINT_GIORNO} tintOpacity={0.09} />
    </svg>
  );
};
