import React from 'react';
import { eo, lerp, mod, rng, seg } from '../../lib/anim';
import { RIGHTEOUS, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes } from '../../lib/elements';
import { CYAN, K, MAG, RED, TINT, YEL, cam, type ShotProps } from './comune';

// Il tachimetro dell'auto del tempo (strumento generico, in miglia orarie), di notte: emerge dal buio dopo un battito di
// nero (suspense), le spie si accendono una alla volta; la lancetta sale da 40 a 88, prima lenta poi sempre più veloce, lungo
// tutta l'inquadratura e tocca 88 nell'ultimo istante, quando parte il colpo del titolo. Più sale, più tutto vibra, le spie
// lampeggiano e la tacca dell'88 si accende di giallo; dal parabrezza in alto la strada a griglia corre verso la camera.
// Piani: strada e cielo dal parabrezza (0,3) · cruscotto (0,8) · tachimetro (1) · riflesso sul vetro dello strumento e
// particelle (1,5).

const r = rng(88);
const MOTES = Array.from({ length: 16 }, () => ({ x: r() * 1080, y: 250 + r() * 300, s: 2 + r() * 3 }));
const A0 = -225, A1 = 45; // angoli di 0 e 100 mph
const ang = (v: number) => lerp(A0, A1, v / 100);

export const Tachimetro: React.FC<ShotProps> = ({ t, dur, id }) => {
  const C = cam(t, dur, { z: 0.14, pan: 0, cy: 860 });
  const p = seg(t, 0, dur) ** 2.2; // parte lenta e accelera: tocca 88 sul colpo
  const luce = eo(seg(t, 0.1, 1.4)); // il cruscotto emerge dal buio
  const v = lerp(40, 88, p) + Math.sin(t * 40) * 0.6 * p;
  const shake = p * p * 6;
  const sx = Math.sin(t * 67) * shake, sy = Math.cos(t * 59) * shake;
  const hot = seg(v, 80, 88);
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <Lin id={`${id}-sky`} stops={[[0, '#0B0620'], [0.6, '#3A1650'], [1, '#8A2E66']]} />
        <Lin id={`${id}-dash`} stops={[[0, '#2A2238'], [0.4, '#1A1426'], [1, '#08060E']]} />
        <radialGradient id={`${id}-face`}>
          <stop offset="0" stopColor="#1E1834" />
          <stop offset=".8" stopColor="#120E22" />
          <stop offset="1" stopColor="#06040C" />
        </radialGradient>
      </defs>
      <g transform={`translate(${sx} ${sy})`}>
      <g transform={C.transform}>
        {/* dal parabrezza: la strada a griglia che corre verso la camera */}
        <rect x="-200" width="1480" height="560" fill={`url(#${id}-sky)`} />
        <path d="M-200 470 H1280" stroke={MAG} strokeWidth="4" />
        <rect x="-200" y="470" width="1480" height="120" fill="#160A2A" />
        {[-6, -4, -2, 0, 2, 4, 6].map((k) => <path key={k} d={`M${540 + k * 20} 470 L${540 + k * 260} 600`} stroke={MAG} strokeWidth="3" opacity=".6" />)}
        {Array.from({ length: 5 }, (_, i) => {
          const u = mod(i / 5 + t * (0.8 + 2 * p), 1);
          return <path key={i} d={`M-200 ${470 + u * u * 130} H1280`} stroke={MAG} strokeWidth={2 + u * 3} opacity={0.3 + 0.5 * u} />;
        })}
        {Array.from({ length: 4 }, (_, i) => {
          const u = mod(i / 4 + t * (1 + 3 * p), 1);
          return <rect key={i} x={540 - (4 + u * 26) / 2} y={470 + u * u * 120} width={4 + u * 26} height={6 + u * 30} fill={YEL} opacity={0.5 + 0.5 * u} />;
        })}
        {MOTES.map((m, i) => <circle key={i} cx={m.x} cy={m.y} r={m.s} fill="#FFFFFF" opacity={0.3 + 0.3 * Math.sin(t * 4 + i)} />)}
        {/* il cruscotto: bordo imbottito, cuciture, strumenti piccoli, spie */}
        <path d="M-200 600 Q540 520 1280 600 V1920 H-200 Z" fill={`url(#${id}-dash)`} stroke={K} strokeWidth="10" />
        <path d="M-200 618 Q540 540 1280 618" fill="none" stroke="#5A4A6A" strokeWidth="3" strokeDasharray="14 10" />
        <path d="M-200 606 Q540 528 1280 606" fill="none" stroke="#FFFFFF" strokeWidth="3" opacity=".2" />
        {[[170, 1180, 'BENZINA', 0.3], [910, 1180, 'TEMP.', 0.55 + 0.35 * p]].map(([x, y, l, k], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r="96" fill={`url(#${id}-face)`} stroke="#8A8AA0" strokeWidth="8" />
            <circle r="96" fill="none" stroke={K} strokeWidth="3" />
            {Array.from({ length: 5 }, (_, j) => <path key={j} d="M0 -80 V-64" stroke="#CFC8E0" strokeWidth="4" transform={`rotate(${-60 + j * 30})`} />)}
            <path d="M0 0 V-70" stroke={RED} strokeWidth="6" strokeLinecap="round" transform={`rotate(${-60 + 120 * Number(k) + Math.sin(t * 30 + i) * 3 * p})`} />
            <circle r="10" fill="#CFC8E0" />
            <text y="54" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="22" fill="#CFC8E0">{l}</text>
          </g>
        ))}
        {[0, 1, 2, 3].map((i) => {
          const on = t > 0.3 + i * 0.25 && Math.sin(t * (6 + i * 3 + 10 * p) + i) > 0.2 - p; // le spie si accendono una alla volta
          return <circle key={i} cx={390 + i * 100} cy={1250} r="20" fill={on ? [RED, YEL, CYAN, RED][i] : '#2A2236'} stroke={K} strokeWidth="5" />;
        })}
        {/* il tachimetro */}
        <g transform="translate(520 860) scale(0.88)">
          <Glow id={`${id}-hg`} x={0} y={0} r={420} t={t} color={hot > 0.5 ? YEL : CYAN} amp={0.08} rate={10} opacity={0.18 + 0.5 * hot} />
          <circle r="320" fill="#3A3448" stroke={K} strokeWidth="12" />
          <circle r="296" fill="#8A8AA0" />
          <circle r="280" fill={`url(#${id}-face)`} />
          {/* zona rossa e tacche */}
          <path d={`M${Math.cos((ang(80) * Math.PI) / 180) * 250} ${Math.sin((ang(80) * Math.PI) / 180) * 250} A250 250 0 0 1 ${Math.cos((ang(100) * Math.PI) / 180) * 250} ${Math.sin((ang(100) * Math.PI) / 180) * 250}`} fill="none" stroke={RED} strokeWidth="16" opacity=".7" />
          {Array.from({ length: 51 }, (_, i) => {
            const vv = i * 2, a = ang(vv);
            const big = vv % 10 === 0;
            return <path key={i} d={`M${big ? 222 : 236} 0 H262`} stroke={vv === 88 ? YEL : '#E8E2F2'} strokeWidth={vv === 88 ? 10 : big ? 7 : 3} transform={`rotate(${a})`} opacity={vv === 88 ? 0.5 + 0.5 * hot : 1} />;
          })}
          {Array.from({ length: 11 }, (_, i) => {
            const a = (ang(i * 10) * Math.PI) / 180;
            return <text key={i} x={Math.cos(a) * 180} y={Math.sin(a) * 180 + 16} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="44" fill="#E8E2F2">{i * 10}</text>;
          })}
          {/* l'88 segnato a mano in giallo */}
          {(() => {
            const a = (ang(88) * Math.PI) / 180;
            return <text x={Math.cos(a) * 330} y={Math.sin(a) * 330 + 20} textAnchor="middle" fontFamily={RIGHTEOUS} fontSize={64 + 20 * hot} fill={YEL} opacity={0.6 + 0.4 * hot} stroke={K} strokeWidth="3">88</text>;
          })()}
          <text y="110" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="36" fill="#9A94B0" letterSpacing="6">MPH</text>
          {/* il contatore digitale sotto */}
          <rect x="-110" y="140" width="220" height="90" rx="10" fill="#0A0814" stroke="#5A5470" strokeWidth="5" />
          <text y="210" textAnchor="middle" fontFamily={RIGHTEOUS} fontSize="72" fill={hot > 0.9 ? YEL : RED}>{Math.floor(v).toString().padStart(2, '0')}</text>
          {/* la lancetta */}
          <g transform={`rotate(${ang(v)})`}>
            <path d="M-40 0 L250 -7 L270 0 L250 7 Z" fill="#FF6A4A" stroke={K} strokeWidth="5" strokeLinejoin="round" />
            <path d="M-30 -2 L240 -4" stroke="#FFD0B0" strokeWidth="3" />
          </g>
          <circle r="36" fill="#3A3448" stroke={K} strokeWidth="8" />
          <circle r="14" fill="#8A8AA0" />
          {/* riflesso sul vetro dello strumento */}
          <path d="M-250 -110 A280 280 0 0 1 -60 -270 L-30 -230 A240 240 0 0 0 -200 -90 Z" fill="#FFFFFF" opacity=".12" />
        </g>
        <g transform={C.L(1.5)}><NearMotes id={`${id}-near`} t={t} color="#CFC8E0" opacity={0.06 + 0.1 * p} vx={-80} /></g>
      </g>
      </g>
      {/* il buio da cui emerge, e il bagliore che cresce verso il colpo del titolo */}
      <rect width="1080" height="1920" fill="#05030E" opacity={0.92 * (1 - luce)} />
      <rect width="1080" height="1920" fill="#FFF6D8" opacity={0.35 * seg(t, dur - 0.5, dur)} />
      <Finish id={id} tint={TINT} tintOpacity={0.1} />
    </svg>
  );
};
