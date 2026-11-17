import React from 'react';
import { camera, eo, lerp, seg } from '../../lib/anim';
import { Glow, Lightning, NearMotes, Neon, Rain, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { Albero, ConjDefs, Fattoria, K, Ombra, TINT_NOTTE } from './Comuni';

// La madre posseduta: notte di pioggia. Su «si rifugiano in un motel» lontano, a sinistra in fondo alla strada, l'insegna
// del motel si accende tremolando; su «Bathsheba possiede Carolyn, che riporta due delle figlie nella vecchia casa» le luci
// posteriori di un'auto lasciano il motel lungo la strada e la station wagon si ferma storta davanti alla fattoria, i fari
// accesi nella pioggia, la portiera aperta, e la porta di casa si spalanca sul buio; su «per ucciderle, come le altre
// madri» un lampo, e le finestre della fattoria si spengono una dopo l'altra mentre l'albero si piega nel vento. Nessuna
// persona.
// Piani: cielo e lampo (0,15) · strada e motel lontano (0,35) · fattoria (0,55) · albero (0,7) · auto e fari (1,0) · pioggia vicina (1,5)

export const Possessione: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tMotel = griglia(cues[0] + 0.5);
  const motel = t > tMotel ? (t < tMotel + 0.8 ? (Math.sin(t * 40) > 0 ? 1 : 0.3) : 1) : 0;
  const tDrive = griglia(cues[1] - 1.0);
  const drive = seg(t, tDrive, tDrive + 1.6);
  const tCar = griglia(cues[1] + 0.6);
  const car = eo(seg(t, tCar, tCar + 1.2));
  const door = eo(seg(t, tCar + 1.2, tCar + 2.2));
  const tStrike = griglia(cues[2] + 0.3);
  const flash = flashAt(t, [tStrike, tStrike + 60 / 72 * 2]);
  const beat = 60 / 72;
  const off = (i: number) => 1 - eo(seg(t, tStrike + 0.4 + i * beat * 0.5, tStrike + 0.6 + i * beat * 0.5));
  const lit = [0.9 * off(0), 0.8 * off(2), 0.85 * off(1), 0.7 * off(3), 0.6 * off(4), 0];

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="po" />
        <ConjDefs id="po" />
        <Lin id="po-sky" stops={[[0, '#05070C'], [0.6, '#121A26'], [1, '#1E2632']]} />
        <Lin id="po-ground" stops={[[0, '#141A18'], [1, '#060808']]} />
        <linearGradient id="po-head" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF0C0" stopOpacity=".7" />
          <stop offset="1" stopColor="#FFF0C0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.15)}>
          <rect x="-300" y="-200" width="1700" height="1500" fill="url(#po-sky)" />
          <rect x="-300" y="-200" width="1700" height="1500" fill="#C8D8F0" opacity={0.35 * flash} />
          <Lightning x={860} y={640} h={420} flash={flash} seed={22} />
          <Rain t={t} level="far" seed={5} opacity={0.35} />
        </g>
        {/* la strada che viene dal motel lontano */}
        <g transform={L(0.35)}>
          <path d="M-300 1120 Q300 1090 700 1110 Q1000 1120 1400 1100 V1400 H-300 Z" fill="#10161A" />
          <path d="M-40 1100 Q200 1120 420 1170 Q520 1200 560 1240" stroke="#2A3036" strokeWidth="30" fill="none" />
          <g transform="translate(170 1062)">
            <rect x="-90" y="-10" width="200" height="60" fill="#2A2A30" stroke={K} strokeWidth="4" />
            {[0, 1, 2, 3].map((i) => <rect key={i} x={-76 + i * 48} y={4} width={28} height={22} fill="#FFD890" opacity={0.3 + 0.5 * motel * (i % 2)} />)}
            <path d="M120 50 V-120" stroke="#3A3A40" strokeWidth="8" />
          </g>
          <Neon id="po-neon" t={t} x={260} y={950} text="MOTEL" color="#FF5A6A" font={SANS} size={60} onAt={motel > 0 ? tMotel : 999} />
          {motel > 0 && <Glow id="po-ng" x={260} y={930} r={180} t={t} color="#FF5A6A" amp={0.1} rate={5} opacity={0.35 * motel} />}
          {/* le luci posteriori dell'auto che lascia il motel */}
          {drive > 0 && drive < 1 && (
            <g transform={`translate(${lerp(220, 520, drive)} ${lerp(1110, 1230, drive)})`}>
              <circle cx="-10" cy="0" r="6" fill="#FF3A2A" />
              <circle cx="10" cy="0" r="6" fill="#FF3A2A" />
              <Glow id="po-tl" x={0} y={0} r={40} t={t} color="#FF3A2A" amp={0} opacity={0.6} />
            </g>
          )}
        </g>
        <g transform={L(0.55)}>
          <Fattoria id="po-f" x={600} y={1230} s={0.6} t={t} lit={lit} door={door} night={1} wall={['#6A6E76', '#3A3E44']} />
          {door > 0 && <rect x={600 - 100 * 0.6} y={1230 - 250 * 0.6} width={60} height={126} fill="#000" opacity={door * 0.8} />}
        </g>
        <g transform={L(0.7)}>
          <Albero id="po" x={1000} y={1250} s={0.46} t={t} sway={2.2} reach={0.42} rim="#8A9AB8" />
        </g>
        {/* la station wagon ferma storta, fari accesi nella pioggia, portiera aperta */}
        <g transform={L(1.0)}>
          <path d="M-300 1250 Q400 1230 1400 1260 V2200 H-300 Z" fill="url(#po-ground)" />
          {car > 0 && (
            <g transform={`translate(${lerp(-400, 300, car)} 1330) rotate(-4) scale(.78)`}>
              <Ombra id="po" x={0} y={8} rx={300} ry={26} />
              <path d="M300 -80 L900 -260 L900 120 Z" fill="url(#po-head)" opacity={0.55} />
              <path d="M-290 -40 Q-290 -96 -250 -104 L-170 -110 L-130 -188 H150 Q190 -186 220 -120 L280 -108 Q300 -96 298 -40 Z" fill="#4A1E18" stroke={K} strokeWidth="8" />
              <path d="M-270 -64 H280" stroke="#5A3A20" strokeWidth="26" />
              <path d="M-118 -176 H-20 V-114 H-150 Z M110 -176 H150 Q176 -172 196 -120 L110 -114 Z" fill="#1A2230" stroke={K} strokeWidth="6" />
              {/* la portiera aperta */}
              <path d="M0 -176 L-40 -200 L-40 -60 L0 -40 Z" fill="#3A1610" stroke={K} strokeWidth="6" />
              <rect x={0} y={-176} width={90} height={136} fill="#0A0A0A" />
              <rect x={272} y={-92} width={22} height={20} rx={4} fill="#FFF8D8" stroke={K} strokeWidth="4" />
              <Glow id="po-hl" x={290} y={-82} r={90} t={t} color="#FFF0C0" amp={0.05} rate={3} opacity={0.8} />
              <path d="M-296 -36 H300" stroke="#8A8A86" strokeWidth="10" />
              {[-180, 190].map((wx) => (
                <g key={wx} transform={`translate(${wx} -20)`}>
                  <circle r={48} fill="#141414" stroke={K} strokeWidth="6" />
                  <circle r={22} fill="#6A6A66" stroke={K} strokeWidth="4" />
                </g>
              ))}
            </g>
          )}
          {/* pozzanghere che riflettono i fari */}
          <ellipse cx="760" cy="1420" rx="200" ry="20" fill="#2A3442" />
          <ellipse cx="760" cy="1420" rx="140" ry="10" fill="#FFF0C0" opacity={0.25 * car} />
          {Array.from({ length: 6 }, (_, i) => {
            const p = (t * 1.3 + i * 0.37) % 1;
            return <ellipse key={i} cx={640 + ((i * 53) % 240)} cy={1420} rx={6 + p * 30} ry={1 + p * 4} fill="none" stroke="#8A9AB0" strokeWidth="2" opacity={1 - p} />;
          })}
        </g>
        <g transform={L(1.5)}>
          <Rain t={t} level="near" seed={9} opacity={0.5} />
          <NearMotes id="po-near" t={t} color="#9FB0C8" n={5} y0={1100} opacity={0.06} />
        </g>
      </g>
      <Finish id="po" tint={TINT_NOTTE} tintOpacity={0.14} />
    </svg>
  );
};
