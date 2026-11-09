import React from 'react';
import { eio, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { DISPLAY, SANS, STENCIL } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, NearMotes, Rain } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { BRASS, K, Pines, RED, Raincoat, TINT, Tower, YELLOW } from '../dark-stagione-1/Winden';

// Copertina e finale di Dark, stagione 3 (senza sigla). La copertina è anche la miniatura del post: è completa dal
// fotogramma 0 (nessuna entrata in dissolvenza) e nei primi secondi l'orologio oscilla, la lancetta scatta e la crepa si accende.
// Locandina originale: niente logo ufficiale, niente simbolo dei tre archi intrecciati, niente volti.
// Copertina: un grande orologio da taschino d'ottone (Tannhaus) appeso alla catena, con il vetro incrinato; la crepa
// prosegue in alto e in basso e divide il fondo in due Winden allo specchio: a sinistra bosco e torri della centrale in
// verde-grigio con l'impermeabile giallo appeso a un ramo (il mondo di Jonas), a destra la stessa veduta rovesciata e blu.
// Finale: i due mondi si richiudono in uno solo, caldo; l'orologio al centro con gli anni della stagione in cerchio.
// Piani: cielo (0,2) · torri e bosco lontano (0,4) · bosco vicino (0,7) · orologio (1,0) · pioggia e particelle (1,4–1,8)

const BLUE = '#5A9AE0';
const W = { x: 540, y: 1010 }; // centro dell'orologio
const r = rng(1986);
const CRACK = (() => {
  // la crepa: una linea spezzata dall'alto in basso che passa per il centro dell'orologio
  const pts: [number, number][] = [];
  for (let y = 660; y <= 1980; y += 60) pts.push([540 + (y === W.y ? 0 : (r() - 0.5) * 34), y]);
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y}`).join(' L');
})();

/** Una Winden di notte (metà sinistra del fotogramma, x 0–540): cielo, torri, bosco, impermeabile su un ramo. */
const Veduta: React.FC<{ t: number; id: string; gid: string; L: (f: number) => string; coat?: boolean }> = ({ t, id, gid, L, coat = true }) => (
  <g>
    <g transform={L(0.2)}>
      <rect x="-200" y="-200" width="1000" height="2400" fill={`url(#${gid}-sky)`} />
      <Glow id={`${id}-moon`} x={150} y={700} r={260} t={t} color="#C8D8D0" amp={0.04} rate={1} opacity={0.3} />
      <circle cx="150" cy="700" r="46" fill="#DDE6E0" opacity=".55" />
    </g>
    <g transform={L(0.4)}>
      <g transform="translate(250 1250)"><Tower id={`${id}-t1`} t={t} w={190} h={400} fill={`url(#${gid}-tower)`} outline={K} sw={6} steamOpacity={0.5} /></g>
      <g transform="translate(70 1250)"><Tower id={`${id}-t2`} t={t + 2} w={170} h={330} fill={`url(#${gid}-tower)`} outline={K} sw={6} steamOpacity={0.45} /></g>
      {[260, 300].map((x, i) => <circle key={x} cx={x} cy={1120 - i * 20} r="5" fill="#F2C070" opacity={0.5 + 0.4 * Math.sin(t * 2 + i)} />)}

      <Pines t={t} y={1262} n={10} h={170} seed={21} color="#26362F" x0={-120} x1={620} sway={2} />
    </g>
    <g transform={L(0.7)}>
      <path d="M-200 1290 Q200 1240 620 1300 V2200 H-200 Z" fill={`url(#${gid}-ground)`} />
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${60 + i * 80} ${1330 + (i % 3) * 40} h${50 + (i % 2) * 40}`} stroke="#8AA49A" strokeWidth="4" strokeLinecap="round" opacity={0.25 + 0.15 * Math.sin(t * 3 + i)} />)}
      <Pines t={t} y={1520} n={2} h={640} seed={7} color="#0E1613" outline={K} x0={-300} x1={80} sway={3} sw={5} />
    </g>
    {(
      <g transform={L(0.9)}>
        <path d="M-40 640 Q60 660 150 640 Q190 632 214 650" fill="none" stroke="#1A1410" strokeWidth="18" strokeLinecap="round" />
        <path d="M-40 640 Q60 660 150 640" fill="none" stroke={K} strokeWidth="4" />
        {coat && <g transform="translate(150 650)"><Raincoat id={`${id}-rc`} t={t} scale={0.52} wind={0.8} glow={0.6} /></g>}
      </g>
    )}
  </g>
);

const Scena: React.FC<{ t: number; dur: number; id: string; merge?: number; watchScale?: number; watchY?: number }> = ({ t, dur, id, merge = 0, watchScale = 2.3, watchY = W.y }) => {
  const p = eio(seg(t, 0, dur));
  const pan = lerp(-24, 24, p);
  const zoom = lerp(1.03, 1.07, p);
  const L = (f: number) => `translate(${(-pan * f).toFixed(2)} 0)`;
  const swing = Math.sin(t * 2.2) * 3.2; // l'orologio oscilla come un pendolo
  const glowCrack = 0.55 + 0.45 * eo(seg(t, 0.8, 1.6)) - 0.2 * seg(t, 2.6, 3.6);
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <Lin id={`${id}-sky`} stops={[[0, '#0A100E'], [0.35, '#22342C'], [0.58, '#5A7468'], [0.7, '#3A5048'], [1, '#18221E']]} />
        <Lin id={`${id}-tower`} x2={1} y2={0} stops={[[0, '#9AA8A0'], [0.5, '#6A7A72'], [1, '#34403A']]} />
        <Lin id={`${id}-ground`} stops={[[0, '#3A4C44'], [0.4, '#22302A'], [1, '#0A0F0D']]} />
        <clipPath id={`${id}-left`}><rect x="-200" y="-200" width="740" height="2400" /></clipPath>
        <clipPath id={`${id}-right`}><rect x="540" y="-200" width="740" height="2400" /></clipPath>
        <radialGradient id={`${id}-glass`} cx=".4" cy=".35" r=".7"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".35" /><stop offset=".5" stopColor="#FFFFFF" stopOpacity=".06" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform={`translate(540 1000) scale(${zoom}) translate(-540 -1000)`}>
        {/* il mondo di Jonas a sinistra; a destra lo stesso mondo rovesciato, come allo specchio, in blu */}
        <g clipPath={`url(#${id}-left)`}><Veduta t={t} id={`${id}-a`} gid={id} L={L} /></g>
        <g clipPath={`url(#${id}-right)`}>
          <g transform="translate(1080 0) scale(-1 1)"><Veduta t={t + 3} id={`${id}-b`} gid={id} L={(f) => `translate(${(pan * f).toFixed(2)} 0)`} coat={false} /></g>
          <rect x="540" y="-200" width="740" height="2400" fill="#1C4A8A" opacity={0.32 * (1 - merge)} />
          {merge < 0.5 && (
            <g transform={`translate(930 650) scale(${1})`} opacity={1 - 2 * merge}>
              {/* nell'altro mondo, al posto dell'impermeabile, il gomitolo blu di Martha appeso al ramo */}
              <path d="M0 -10 V20" stroke={K} strokeWidth="4" />
              <circle cy="64" r="44" fill={BLUE} stroke={K} strokeWidth="8" />
              {[-0.6, -0.2, 0.2, 0.6].map((k, i) => <path key={i} d={`M-40 ${64 + k * 44} Q0 ${64 + k * 44 - 22} 40 ${64 + k * 44 + 6}`} fill="none" stroke="#2A5A9A" strokeWidth="5" />)}
              <path d="M-20 34 Q-4 54 24 32" fill="none" stroke="#A8CCF4" strokeWidth="5" />
            </g>
          )}
        </g>
        {merge > 0 && <rect x="-200" y="-200" width="1480" height="2400" fill="#E8B04A" opacity={0.12 * merge} />}
        {/* la crepa tra i due mondi */}
        <g opacity={1 - merge}>
          <path d={CRACK} fill="none" stroke="#000" strokeWidth="14" opacity=".6" />
          <path d={CRACK} fill="none" stroke="#FFF2C8" strokeWidth={4 + 3 * glowCrack} opacity={0.5 + 0.5 * glowCrack} />
          <Glow id={`${id}-cr`} x={540} y={watchY} r={460} t={t} color={YELLOW} amp={0.06} rate={2} opacity={0.35 * glowCrack} />
        </g>
        <g transform={L(1.4)}><Rain t={t} level="far" seed={5} color="#B8C8C4" opacity={0.35} /></g>
        {/* l'orologio da taschino appeso alla catena */}
        <g transform={`translate(${W.x} -40) rotate(${swing}) translate(${-W.x} 40)`}>
          <path d={`M${W.x} -40 V${watchY - 92 * watchScale - 120}`} stroke={BRASS} strokeWidth="10" strokeDasharray="14 8" />
          <path d={`M${W.x} -40 V${watchY - 92 * watchScale - 120}`} stroke={K} strokeWidth="2" opacity=".5" />
          <g transform={`translate(${W.x} ${watchY})`}>
            <Glow id={`${id}-w`} x={0} y={0} r={140 * watchScale} t={t} color="#F2D48A" amp={0.05} rate={2} opacity={0.4} />
            <Orologio t={t} s={watchScale} crack={1 - merge} gid={id} />
          </g>
        </g>
        <g transform={L(1.8)}><Rain t={t} level="near" seed={9} color="#D8E4E0" opacity={0.4} /></g>
        <NearMotes id={`${id}-near`} t={t} color="#E8E2D2" n={6} opacity={0.08} />
      </g>
      <Finish id={id} tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};

/** Orologio da taschino grande, con quadrante a numeri, lancetta dei secondi e vetro incrinato al centro. */
const Orologio: React.FC<{ t: number; s: number; crack: number; gid: string }> = ({ t, s, crack, gid }) => {
  const tick = Math.floor(t * 2) * 6; // scatti di mezzo secondo: il movimento si vede subito
  return (
    <g transform={`scale(${s})`}>
      <circle r="100" fill="#000" opacity=".45" transform="translate(4 8)" />
      <circle r="96" fill={BRASS} stroke={K} strokeWidth="6" />
      <circle r="96" fill="none" stroke="#F2D48A" strokeWidth="3" strokeDasharray="4 5" transform="scale(.96)" />
      <path d="M0 -96 V-112 M-14 -122 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0" fill="none" stroke={K} strokeWidth="6" />
      <rect x="-10" y="-112" width="20" height="16" rx="3" fill={BRASS} stroke={K} strokeWidth="3" />
      <circle r="80" fill="#F2ECDC" stroke={K} strokeWidth="4" />
      {Array.from({ length: 60 }, (_, i) => <path key={i} d={`M0 -76 V${i % 5 ? -72 : -66}`} stroke={K} strokeWidth={i % 5 ? 1.5 : 3.5} transform={`rotate(${i * 6})`} />)}
      {['XII', 'III', 'VI', 'IX'].map((n, i) => {
        const a = (i * Math.PI) / 2;
        return <text key={n} x={Math.sin(a) * 52} y={-Math.cos(a) * 52 + 7} textAnchor="middle" fontFamily="serif" fontWeight={700} fontSize="20" fill={K}>{n}</text>;
      })}
      <circle cy="30" r="15" fill="none" stroke={K} strokeWidth="2" />
      <path d="M0 30 V18" stroke={RED} strokeWidth="2" transform={`rotate(${tick} 0 30)`} />
      <path d="M0 0 V-38" stroke={K} strokeWidth="6" strokeLinecap="round" transform="rotate(-62)" />
      <path d="M0 0 V-58" stroke={K} strokeWidth="4" strokeLinecap="round" transform="rotate(48)" />
      <path d="M0 10 V-68" stroke={RED} strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${tick})`} />
      <circle r="5" fill={K} />
      <circle r="80" fill={`url(#${gid}-glass)`} />
      {crack > 0 && (
        <g opacity={crack}>
          <path d="M-4 -80 L4 -50 L-6 -24 L5 0 L-4 26 L6 52 L-2 80" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M5 0 L30 -14 L46 -10 M-6 -24 L-28 -34 M-4 26 L-30 40 L-44 36 M6 52 L24 62" fill="none" stroke="#FFFFFF" strokeWidth="1.6" opacity=".8" />
        </g>
      )}
      <path d="M-58 -40 Q-40 -64 -12 -72" fill="none" stroke="#FFFFFF" strokeWidth="5" opacity=".55" strokeLinecap="round" />
    </g>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const shadow = `0 6px 0 ${P.scuro}, 0 0 40px ${P.scuro}`;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scena t={t} dur={dur} id="dc3" />
      {/* tutto già in posizione al fotogramma 0: la copertina è la miniatura */}
      <div style={{ position: 'absolute', left: 120, top: 280, width: 840, fontFamily: SANS, textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, textShadow: `0 2px 0 ${P.scuro}, 0 0 18px ${P.scuro}` }}>SPIEGATO SEMPLICE · SERIE</p>
        <h1 style={{ margin: '6px 0 0', fontFamily: STENCIL, fontWeight: 800, fontSize: 260, lineHeight: 0.9, letterSpacing: '0.12em', color: P.chiaro, textShadow: shadow }}>
          DARK
        </h1>
        <p style={{ margin: '6px 0 0', fontFamily: STENCIL, fontWeight: 800, fontSize: 72, letterSpacing: '0.3em', color: P.accento, textShadow: shadow }}>STAGIONE {film.stagione}</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}E0`, color: P.chiaro, fontFamily: SANS, fontSize: 42, fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>
        {(film.copertina.frase_lancio ?? '').split(': ').map((x, i, a) => <React.Fragment key={i}>{x}{i < a.length - 1 ? ':' : ''}{i < a.length - 1 && <br />}</React.Fragment>)}
      </p>
    </div>
  );
};

/** Gli anni della stagione in cerchio intorno all'orologio. */
const Anello: React.FC<{ t: number; years: number[]; accent: string; ink: string; dark: string }> = ({ t, years, accent, ink, dark }) => {
  const close = eio(seg(t, 0.2, 1.4));
  const R = 270, cx = 540, cy = 1040;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={accent} strokeWidth="10" strokeLinecap="round" pathLength={1} strokeDasharray={`${close} 1`} transform={`rotate(-90 ${cx} ${cy})`} />
      {years.map((y, i) => {
        const a = -Math.PI / 2 + (i / years.length) * Math.PI * 2;
        const k = eio(seg(t, 0.1 + i * 0.1, 1.1 + i * 0.1));
        const x = lerp(160 + i * 190, cx + Math.cos(a) * R, k), yy = lerp(760, cy + Math.sin(a) * R, k);
        const first = i === 0;
        return (
          <g key={y} transform={`translate(${x} ${yy})`}>
            <rect x="-76" y="-30" width="152" height="60" rx="30" fill={first ? accent : dark} stroke={accent} strokeWidth="5" />
            <text y="13" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="36" fill={first ? dark : ink}>{y}</text>
          </g>
        );
      })}
    </svg>
  );
};

export const Finale: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const card = eo(seg(t, 0.1, 0.5));
  const b1 = eob(seg(t, 0.5, 0.9), 1.8);
  const b2 = eob(seg(t, 0.7, 1.1), 1.8);
  const line = eo(seg(t, 0.4, 0.8));
  const merge = eio(seg(t, 0, 1.6)); // i due mondi si richiudono in uno solo
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scena t={t + 4} dur={dur} id="de3" merge={merge} watchScale={1.2} watchY={1040} />
      <div style={{ position: 'absolute', inset: 0, background: `${P.scuro}55` }} />
      <Anello t={t} years={film.linea_tempo ?? []} accent={P.accento} ink={P.chiaro} dark={P.scuro} />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '34px 40px 30px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 68, lineHeight: 1 }}>Ti è servito?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 28 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 40, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 40, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '24px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con la spiegazione che vorresti.</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 44, fontWeight: 800, textAlign: 'center', lineHeight: 1.25,
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.finale.voce}
      </p>
    </div>
  );
};
