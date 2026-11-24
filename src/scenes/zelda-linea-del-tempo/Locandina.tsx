import React from 'react';
import { eo, eob, lerp, mod, seg } from '../../lib/anim';
import { CINZEL, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Clouds, Dust, Glow, Gulls } from '../../lib/elements';
import { Inchiostro, puntoSu, type Pt } from '../../lib/pergamena';
import type { PosterProps } from '../../types';
import { AMBER, BLUE, GOLD, INK, RED, Tri } from './Schema';
import { ArtHyrule } from './Hyrule';

// Copertina e finale di «Zelda, la linea del tempo» (Videogiochi spiegati, senza sigla: la copertina è anche la miniatura).
// Testata verde scuro da manoscritto con il titolo ZELDA in Cinzel color crema e l'ombra verde; sotto, la miniatura di giorno:
// colline, il castello con le torri a cono blu, una spada generica piantata nella roccia dentro un fascio di luce, e davanti,
// nell'erba fiorita, la linea d'inchiostro che arriva al bivio e si apre in tre sentieri (oro, azzurro, rosso).
// Niente persone, logo, carattere o oggetti uguali a quelli del gioco. Il fotogramma 0 è già completo.

const HEAD = 690;
const FORK: Pt = [360, 1385];
const PATHS: Pt[][] = [
  [FORK, [560, 1330], [820, 1300], [1140, 1290]],
  [FORK, [600, 1392], [880, 1392], [1140, 1390]],
  [FORK, [560, 1440], [820, 1480], [1140, 1490]],
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
        {/* il mondo di Hyrule (lo stesso del video), abbassato sotto la testata */}
        <g transform="translate(0 230)">
          <ArtHyrule T={t} par={() => ''} dark={0} open={1} pulled={0} dawn={calm} />
        </g>
        {calm > 0 && <rect y={HEAD - 40} width="1080" height="1300" fill="#E8804A" opacity={0.22 * calm} />}
        {/* i tre triangoli d'oro separati nel cielo, con i raggi */}
        {[[150, 860], [300, 820], [450, 860]].map(([x, y], i) => (
          <g key={i}>
            <path d={`M${x - 40} ${y + 30} L${x - 150} ${y + 560} H${x + 150} L${x + 40} ${y + 30} Z`} fill="#FFF2B0" opacity={0.14 * (1 - 0.6 * calm)} />
            <g transform={`translate(${x} ${y + Math.sin(t * 2 + i) * 6}) scale(1.25)`}><Tri T={t} id={`${id}-tri${i}`} glow={1} /></g>
          </g>
        ))}
        {/* il filo del tempo che arriva al bivio e si divide in tre fiumi di luce */}
        <Inchiostro id={`${id}-tr`} pts={[[-40, 1400], [180, 1392], [FORK[0], FORK[1]]]} p={1} t={t} color="#FFD866" w={18} nib={false} halo={1.4} />
        {PATHS.map((pts, i) => (
          <g key={i}>
            <Inchiostro id={`${id}-p${i}`} pts={pts} p={1} t={t} color={COLS[i]} w={18} nib={false} halo={1.4} />
            {(() => {
              const u = mod(t * 0.45 + i * 0.33, 1);
              const q = puntoSu(pts, u);
              return (
                <g transform={`translate(${q.x} ${q.y})`} opacity={Math.sin(u * Math.PI)}>
                  <circle r="30" fill={COLS[i]} opacity=".4" />
                  <circle r="10" fill="#FFFFFF" />
                </g>
              );
            })()}
          </g>
        ))}
        <Glow id={`${id}-fk`} x={FORK[0]} y={FORK[1]} r={90} t={t} color="#FFE08A" amp={0.15} rate={3} opacity={0.8} />
        <circle cx={FORK[0]} cy={FORK[1]} r="24" fill={GOLD} stroke={INK} strokeWidth="6" />
        <circle cx={FORK[0]} cy={FORK[1]} r="9" fill="#FFF8E0" />
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
