import React from 'react';
import { eo, eob, lerp, mod, seg } from '../../lib/anim';
import { CINZEL, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Clouds, Dust, Glow, Gulls } from '../../lib/elements';
import { Inchiostro, puntoSu, type Pt } from '../../lib/pergamena';
import type { PosterProps } from '../../types';
import { AMBER, BLUE, GOLD, INK, RED, Spada } from './Schema';

// Copertina e finale di «Zelda, la linea del tempo» (Videogiochi spiegati, senza sigla: la copertina è anche la miniatura).
// Testata verde scuro da manoscritto con il titolo ZELDA in Cinzel color crema e l'ombra verde; sotto, la miniatura di giorno:
// colline, il castello con le torri a cono blu, una spada generica piantata nella roccia dentro un fascio di luce, e davanti,
// nell'erba fiorita, la linea d'inchiostro che arriva al bivio e si apre in tre sentieri (oro, azzurro, rosso).
// Niente persone, logo, carattere o oggetti uguali a quelli del gioco. Il fotogramma 0 è già completo.

const HEAD = 690;
const FORK: Pt = [420, 1300];
const PATHS: Pt[][] = [
  [FORK, [600, 1250], [820, 1215], [1140, 1200]],
  [FORK, [640, 1318], [880, 1322], [1140, 1320]],
  [FORK, [600, 1370], [820, 1420], [1140, 1430]],
];
const COLS = [GOLD, '#5AA8F0', '#E8553F'];

const Art: React.FC<{ t: number; id: string; calm?: number }> = ({ t, id, calm = 0 }) => {
  const z = 1 + 0.025 * Math.min(t, 6) / 6;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={calm ? '#6A5A9A' : '#5EB0E4'} />
          <stop offset=".5" stopColor={calm ? '#E89A6A' : '#A8DAF0'} />
          <stop offset="1" stopColor={calm ? '#F8D08A' : '#E8F4EC'} />
        </linearGradient>
        <linearGradient id={`${id}-hill`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#74B852" />
          <stop offset="1" stopColor="#3E7E3A" />
        </linearGradient>
        <linearGradient id={`${id}-mead`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6AAE4A" />
          <stop offset=".5" stopColor="#4E9040" />
          <stop offset="1" stopColor="#2E6A2E" />
        </linearGradient>
        <linearGradient id={`${id}-head`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E1A12" />
          <stop offset=".7" stopColor="#16261A" />
          <stop offset="1" stopColor="#1E3A24" />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF6D0" stopOpacity="0" />
          <stop offset=".6" stopColor="#FFF6D0" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFF6D0" stopOpacity=".15" />
        </linearGradient>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F4EAD2" />
          <stop offset="1" stopColor="#C2B090" />
        </linearGradient>
        <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#CFC8B8" />
          <stop offset="1" stopColor="#8A8478" />
        </linearGradient>
      </defs>
      <g transform={`translate(540 1300) scale(${z}) translate(-540 -1300)`}>
        <rect y={HEAD - 40} width="1080" height={1960 - HEAD} fill={`url(#${id}-sky)`} />
        <Glow id={`${id}-sun`} x={180} y={HEAD + 90} r={220} t={t} color="#FFF2B8" amp={0.05} rate={1.2} opacity={0.7} />
        <Clouds id={`${id}-cl`} t={t} color="#FFFFFF" seed={7} n={3} y={HEAD + 40} h={110} opacity={0.75} />
        <Gulls t={t + 4} seed={3} n={3} y={HEAD + 90} h={80} color={INK} size={0.7} period={14} />
        {/* montagne innevate */}
        <path d={`M0 1080 L170 900 L300 1010 L470 860 L640 1040 L760 980 L1080 1060 V1120 H0 Z`} fill="#8FB0C8" />
        <path d="M150 921 L170 900 L192 921 L178 916 Z M446 884 L470 860 L496 886 L478 880 Z" fill="#FFFFFF" />
        {/* la collina del castello */}
        <path d="M540 1150 Q760 1000 1080 1040 V1220 H540 Z" fill={`url(#${id}-hill)`} stroke={INK} strokeWidth="6" />
        <g transform="translate(830 1050) scale(1.08)">
          <rect x="-110" y="-40" width="220" height="90" fill={`url(#${id}-wall)`} stroke={INK} strokeWidth="5" />
          {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-110 + i * 22} y="-52" width="12" height="14" fill={`url(#${id}-wall)`} stroke={INK} strokeWidth="3" />)}
          <path d="M-22 50 V14 Q0 -8 22 14 V50 Z" fill="#5A3A22" stroke={INK} strokeWidth="4" />
          {[[-92, -120, 40, 92], [92, -120, 40, 92], [0, -196, 54, 160]].map(([x, y, w, h], i) => (
            <g key={i}>
              <rect x={x - w / 2} y={y} width={w} height={h} fill={`url(#${id}-wall)`} stroke={INK} strokeWidth="5" />
              <path d={`M${x - w / 2 - 8} ${y + 2} L${x} ${y - w * 1.5} L${x + w / 2 + 8} ${y + 2} Z`} fill="#3A64B0" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
              <path d={`M${x} ${y - w * 1.5} V${y - w * 1.5 - 30}`} stroke={INK} strokeWidth="3" />
              <path d={`M${x} ${y - w * 1.5 - 30} l26 ${6 + Math.sin(t * 5 + i) * 4} l-26 10 Z`} fill="#E8553F" stroke={INK} strokeWidth="2" />
              <rect x={x - 6} y={y + 18} width="12" height="20" rx="6" fill={calm ? '#FFC060' : '#FFD66A'} stroke={INK} strokeWidth="2" />
            </g>
          ))}
        </g>
        <path d="M820 1106 Q720 1150 660 1190" stroke="#E8D6A8" strokeWidth="16" fill="none" strokeLinecap="round" />
        {/* colline davanti e alberi */}
        <path d="M0 1130 Q260 1050 520 1110 Q760 1160 1080 1110 V1960 H0 Z" fill={`url(#${id}-mead)`} stroke={INK} strokeWidth="6" />
        {[[90, 1080, 34], [150, 1100, 26], [1010, 1080, 30]].map(([x, y, r], i) => (
          <g key={i}>
            <path d={`M${x} ${y + r} V${y + r + 22}`} stroke={INK} strokeWidth="6" />
            <circle cx={x} cy={y} r={r} fill="#3E8A40" stroke={INK} strokeWidth="5" />
            <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.4} fill="#6AB050" />
          </g>
        ))}
        {/* la spada nella roccia dentro il fascio di luce */}
        <path d={`M300 ${HEAD - 40} H560 L600 1240 H260 Z`} fill={`url(#${id}-beam)`} opacity={(1 - 0.7 * calm) * (0.85 + 0.15 * Math.sin(t * 2))} />
        <Dust t={t} top={{ y: HEAD, x0: 320, x1: 540 }} bottom={{ y: 1220, x0: 280, x1: 580 }} seed={7} n={22} color="#FFF6D0" />
        <Glow id={`${id}-sw`} x={430} y={1060} r={170} t={t} color="#FFF4C0" amp={0.12} rate={2.2} opacity={0.55 * (1 - 0.5 * calm)} />
        <g transform="translate(430 1052) scale(3.2) rotate(-22)"><Spada /></g>
        <path d="M300 1245 L338 1170 H522 L560 1245 Z" fill={`url(#${id}-stone)`} stroke={INK} strokeWidth="7" strokeLinejoin="round" />
        <path d="M340 1215 l40 -6 M430 1226 l50 -10" stroke={INK} strokeWidth="3.5" opacity=".6" />
        <path d="M312 1238 q-14 -24 6 -34 M548 1238 q14 -22 -4 -32" stroke="#4E8A3A" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* la linea del tempo che arriva da sinistra e si divide in tre sentieri */}
        <Inchiostro id={`${id}-tr`} pts={[[-40, 1310], [200, 1296], [FORK[0], FORK[1]]]} p={1} t={t} color="#F4ECD8" w={16} nib={false} halo={1} />
        {PATHS.map((pts, i) => (
          <g key={i}>
            <Inchiostro id={`${id}-p${i}`} pts={pts} p={1} t={t} color={COLS[i]} w={16} nib={false} halo={1} />
            {[0, 1, 2].map((k) => {
              const q = puntoSu(pts, k === 0 ? 0.33 : k === 1 ? 0.62 : 0.9);
              return <circle key={k} cx={q.x} cy={q.y} r="13" fill="#FFF8E0" stroke={INK} strokeWidth="4" />;
            })}
            {/* la scintilla che corre sul sentiero */}
            {(() => {
              const u = mod(t * 0.45 + i * 0.33, 1);
              const q = puntoSu(pts, u);
              return (
                <g transform={`translate(${q.x} ${q.y})`} opacity={Math.sin(u * Math.PI)}>
                  <circle r="26" fill={COLS[i]} opacity=".35" />
                  <circle r="9" fill="#FFFFFF" />
                </g>
              );
            })()}
          </g>
        ))}
        <circle cx={FORK[0]} cy={FORK[1]} r="22" fill={GOLD} stroke={INK} strokeWidth="6" />
        <circle cx={FORK[0]} cy={FORK[1]} r="8" fill="#FFF8E0" />
        {/* il prato in primo piano, fino al bordo basso */}
        {Array.from({ length: 70 }, (_, i) => {
          const x = (i * 157) % 1080 + (i % 3) * 5, y = 1480 + ((i * 89) % 420);
          return <path key={i} d={`M${x} ${y} q${4 + Math.sin(t * 2 + i) * 4} -14 ${3 + Math.sin(t * 2 + i) * 7} -26`} stroke="#2E6A2E" strokeWidth="4" fill="none" strokeLinecap="round" />;
        })}
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={`f${i}`} cx={(i * 211) % 1080} cy={1460 + ((i * 131) % 440)} r={5 + (i % 3)} fill={['#F4F0E4', '#F2A8C0', GOLD, '#9AC8F0'][i % 4]} stroke={INK} strokeWidth="1.8" />
        ))}
        {/* ciuffi d'erba alta e fiori con lo stelo in primo piano, ai bordi */}
        {[[60, 1930, 1.4], [200, 1960, 1.1], [900, 1940, 1.3], [1040, 1910, 1.5], [520, 1990, 1.0]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            {[-40, -24, -10, 4, 18, 32].map((a, k) => (
              <path key={k} d={`M${a * 0.6} 0 Q${a * 0.9 + Math.sin(t * 1.6 + i + k) * 6} -90 ${a * 1.8 + Math.sin(t * 1.6 + i + k) * 12} ${-150 - (k % 3) * 40}`} stroke={k % 2 ? '#2E6A2E' : '#22522A'} strokeWidth="10" fill="none" strokeLinecap="round" />
            ))}
            <path d={`M10 0 Q16 -110 ${24 + Math.sin(t * 1.4 + i) * 8} -200`} stroke="#22522A" strokeWidth="5" fill="none" />
            <g transform={`translate(${24 + Math.sin(t * 1.4 + i) * 8} -206)`}>
              {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-11" rx="7" ry="11" fill={i % 2 ? '#F2A8C0' : '#F4F0E4'} stroke={INK} strokeWidth="2" transform={`rotate(${a})`} />)}
              <circle r="6" fill={GOLD} stroke={INK} strokeWidth="2" />
            </g>
          </g>
        ))}
        {/* farfalle */}
        {[0, 1].map((i) => {
          const fx = 260 + i * 520 + Math.sin(t * 0.7 + i * 2) * 70, fy = 1560 - i * 80 + Math.sin(t * 1.3 + i) * 30;
          const w = 0.4 + 0.6 * Math.abs(Math.sin(t * 9 + i));
          return (
            <g key={i} transform={`translate(${fx} ${fy})`}>
              <ellipse cx={-9 * w} cy="-4" rx={10 * w} ry="8" fill={i ? '#9AC8F0' : '#F2C230'} stroke={INK} strokeWidth="2" />
              <ellipse cx={9 * w} cy="-4" rx={10 * w} ry="8" fill={i ? '#9AC8F0' : '#F2C230'} stroke={INK} strokeWidth="2" />
              <path d="M0 -10 V6" stroke={INK} strokeWidth="3" />
            </g>
          );
        })}
      </g>
      {/* la testata verde da manoscritto */}
      <rect width="1080" height={HEAD} fill={`url(#${id}-head)`} />
      <path d={`M0 ${HEAD - 14} H1080`} stroke="#C9962E" strokeWidth="5" />
      <path d={`M0 ${HEAD - 4} H1080`} stroke={INK} strokeWidth="6" />
      {Array.from({ length: 27 }, (_, i) => (
        <circle key={i} cx={20 + i * 40} cy={HEAD - 34} r="5" fill={['#F2C230', '#F4F0E4', '#6ACB6A', '#5AA8F0'][i % 4]} opacity={0.6 + 0.4 * Math.sin(t * 3 + i)} />
      ))}
      {calm > 0 && <rect width="1080" height="1920" fill="#3A1E4A" opacity={0.12 * calm} />}
      <Finish id={id} tint="#3A5A20" tintOpacity={0.06} />
    </svg>
  );
};

const TitleBlock: React.FC<{ film: PosterProps['film'] }> = ({ film }) => {
  const P = film.palette;
  return (
    <div style={{ position: 'absolute', left: 120, top: 262, width: 840, fontFamily: SANS, textAlign: 'center' }}>
      <p style={{ margin: '0 auto', width: 'fit-content', padding: '6px 26px 8px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 30, fontWeight: 800, letterSpacing: '0.16em' }}>VIDEOGIOCHI SPIEGATI</p>
      <h1 style={{ margin: '4px 0 0', fontFamily: CINZEL, fontWeight: 700, fontSize: 196, lineHeight: 1, letterSpacing: '0.04em', color: P.chiaro, textShadow: `5px 8px 0 ${P.principale}, 0 0 40px rgba(242,194,48,.35)` }}>ZELDA</h1>
      <p style={{ margin: '2px 0 0', fontFamily: CINZEL, fontWeight: 700, fontSize: 50, letterSpacing: '0.18em', color: P.accento }}>LA LINEA DEL TEMPO</p>
    </div>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  const line = eo(seg(t, 0.4, 0.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t} id="zc" />
      <TitleBlock film={film} />
      <p style={{ position: 'absolute', left: 120, width: 840, top: 588, margin: 0, textAlign: 'center', fontFamily: SANS, fontSize: 28, fontWeight: 800, letterSpacing: '0.04em', color: '#C9D8C0' }}>una saga {film.regista} · dal {film.anno}</p>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1500, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}E6`, color: P.chiaro, fontFamily: SANS, fontSize: 46, fontWeight: 800, textAlign: 'center', lineHeight: 1.2,
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.copertina.frase_lancio}
      </p>
    </div>
  );
};

export const Finale: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  const card = eo(seg(t, 0.1, 0.5));
  const b1 = eob(seg(t, 0.5, 0.9), 1.8);
  const b2 = eob(seg(t, 0.7, 1.1), 1.8);
  const line = eo(seg(t, 0.4, 0.8));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t + 3} id="ze" calm={1} />
      <div style={{ position: 'absolute', left: 120, top: 290, width: 840, boxSizing: 'border-box', padding: '34px 40px 30px', borderRadius: 32,
        background: `${P.scuro}E0`, border: `3px solid #C9962E`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 68, lineHeight: 1 }}>Ti è servito?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 28 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 40, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 40, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '24px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il gioco che vorresti.</p>
        <p style={{ margin: '14px 0 0', fontSize: 26, fontWeight: 400, opacity: 0.8 * seg(t, 1.2, 1.6) }}>Le spiegazioni complete sono su YouTube</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1500, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}E0`, color: P.chiaro, fontFamily: SANS, fontSize: 44, fontWeight: 800, textAlign: 'center', lineHeight: 1.25,
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.finale.voce}
      </p>
    </div>
  );
};

export { lerp, BLUE, AMBER, RED };
