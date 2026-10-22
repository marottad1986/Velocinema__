import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadInstrument } from '@remotion/google-fonts/InstrumentSerif';
import { eo, seg } from '../lib/anim';
import { SANS } from '../lib/fonts';
import { Quadro, proietta, vistaAt, type Chiave, type Opera } from '../lib/quadro';
import { ChapterOverlay } from '../components/ChapterOverlay';
import { getFilm } from '../films';
import type { FilmData } from '../types';

// Prove di stile per la serie dei quadri (non fanno parte del video): 3 stili di annotazione × 3 scene, 3 copertine.

const SERIF = loadInstrument('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] }).fontFamily;
loadInstrument('italic', { weights: ['400'], subsets: ['latin', 'latin-ext'] });

const OPERA: Opera = { src: 'quadri/notte-stellata/originale.jpg', aspect: 3840 / 3041 };
type Pt = { x: number; y: number };
const P = { luna: { x: 0.898, y: 0.178 }, venere: { x: 0.344, y: 0.513 }, vortice: { x: 0.48, y: 0.33 }, vortice2: { x: 0.67, y: 0.48 }, campanile: { x: 0.564, y: 0.65 } };

// ---------------------------------------------------------------- testi di prova (tono nuovo)

const TESTI: Record<string, { titolo: string; frasi: string[] }> = {
  villaggio: { titolo: 'Un paese inventato', frasi: ['Dalla finestra della clinica, il paese non si vedeva.', 'Van Gogh lo aggiunge a memoria, con un campanile appuntito', 'che ricorda le chiese olandesi della sua infanzia.'] },
  venere: { titolo: 'Non è una stella', frasi: ['La stella più luminosa, accanto al cipresso, è il pianeta Venere.', 'Van Gogh scrive al fratello Theo di averla vista all’alba, grandissima.', 'Gli astronomi confermano: in quei giorni era visibile prima del sorgere del sole.'] },
  vortici: { titolo: 'Il cielo in movimento', frasi: ['Al centro, il cielo si avvolge in due grandi spirali.', 'Van Gogh non dipinge il vento: dipinge il movimento.', 'Alcuni fisici hanno misurato questi vortici:', 'somigliano in modo sorprendente alla turbolenza vera dell’aria e dell’acqua.'] },
};

// ---------------------------------------------------------------- disegni (monolinea, colore del tratto a scelta)

const Chiese: React.FC<{ c: string; w?: number }> = ({ c, w = 3.5 }) => {
  const L = { stroke: c, strokeWidth: w, fill: 'none', strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  return (
    <g>
      <path d="M95 30 L118 130 H72 Z M72 130 h46 v70 h-46 Z M72 150 L42 168 V200 H72" {...L} />
      <path d="M90 160 h12 v20 h-12 Z" {...L} />
      <path d="M230 120 h80 v80 h-80 Z M245 120 V82 h50 V120 M262 120 v-20 a8 8 0 0 1 16 0 v20" {...L} />
      <path d="M170 40 V210" {...L} strokeDasharray="4 10" strokeWidth={w * 0.7} />
      <text x="85" y="232" textAnchor="middle" fontFamily={SANS} fontSize="24" fill={c}>Olanda</text>
      <text x="270" y="232" textAnchor="middle" fontFamily={SANS} fontSize="24" fill={c}>Provenza</text>
    </g>
  );
};

const Pianeti: React.FC<{ c: string; w?: number }> = ({ c, w = 3.5 }) => {
  const L = { stroke: c, strokeWidth: w, fill: 'none', strokeLinecap: 'round' as const };
  return (
    <g>
      <circle cx="70" cy="110" r="34" {...L} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i * Math.PI) / 4;
        return <path key={i} d={`M${70 + 44 * Math.cos(a)} ${110 + 44 * Math.sin(a)} L${70 + 56 * Math.cos(a)} ${110 + 56 * Math.sin(a)}`} {...L} />;
      })}
      <circle cx="70" cy="110" r="96" {...L} strokeDasharray="3 9" strokeWidth={w * 0.7} />
      <circle cx="160" cy="76" r="12" {...L} fill={c} />
      <circle cx="70" cy="110" r="220" {...L} strokeDasharray="3 9" strokeWidth={w * 0.7} />
      <circle cx="288" cy="110" r="22" {...L} />
      <path d="M266 110 h44" {...L} strokeWidth={w * 0.6} />
    </g>
  );
};

const Turbolenza: React.FC<{ c: string; w?: number }> = ({ c, w = 3.5 }) => {
  const L = { stroke: c, strokeWidth: w, fill: 'none', strokeLinecap: 'round' as const };
  const spirale = (cx: number, cy: number, r: number, giri = 2.2) => {
    let d = '';
    for (let i = 0; i <= 60; i++) {
      const u = i / 60, a = u * giri * Math.PI * 2, rr = r * (1 - u * 0.85);
      d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a) * 0.8).toFixed(1)} `;
    }
    return d;
  };
  return (
    <g>
      <path d="M10 40 Q90 10 170 40 T330 40 M10 200 Q90 230 170 200 T330 200" {...L} strokeWidth={w * 0.7} />
      <path d={spirale(120, 120, 70)} {...L} />
      <path d={spirale(235, 110, 42)} {...L} />
      <path d={spirale(290, 165, 20, 1.6)} {...L} />
      <path d={spirale(60, 175, 18, 1.6)} {...L} />
    </g>
  );
};

// ---------------------------------------------------------------- tre stili di annotazione

type Ann = { kind: 'freccia'; to: Pt; from: Pt; label: string; sub?: string } | { kind: 'anello'; c: Pt; r: number; label: string; sub?: string; side?: 1 | -1 } | { kind: 'spirale'; c: Pt; r: number };
type Inset = { at: Pt; disegno: React.FC<{ c: string; w?: number }>; titolo: string; nota: string };

const spiralPath = (c: Pt, r: number, from = -90, giro = 300) => {
  let d = '';
  for (let i = 0; i <= 40; i++) {
    const u = i / 40, a = ((from + giro * u) * Math.PI) / 180, rr = r * (1 - 0.15 * u);
    d += `${i ? 'L' : 'M'}${(c.x + rr * Math.cos(a)).toFixed(1)} ${(c.y + rr * Math.sin(a)).toFixed(1)} `;
  }
  return d;
};

/** Stile 1 — editoriale: linee sottili dritte con punto, etichette tipografiche, riquadri scuri con disegni a linea bianca. */
const Editoriale: React.FC<{ t: number; ann: Ann[]; inset: Inset; accento: string }> = ({ t, ann, inset, accento }) => {
  const p = eo(seg(t, 0.3, 1.0));
  const ip = eo(seg(t, 0.8, 1.4));
  return (
    <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      {ann.map((a, i) => {
        if (a.kind === 'spirale') return <path key={i} d={spiralPath(a.c, a.r)} fill="none" stroke="#FFF" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" pathLength={1} opacity={p} />;
        const anchor = a.kind === 'freccia' ? a.to : { x: a.c.x + (a.side ?? 1) * a.r * 0.71, y: a.c.y - a.r * 0.71 };
        const lab = a.kind === 'freccia' ? a.from : { x: anchor.x + (a.side ?? 1) * 120, y: anchor.y - 120 };
        const right = lab.x >= anchor.x;
        return (
          <g key={i} opacity={p}>
            {a.kind === 'anello' && <circle cx={a.c.x} cy={a.c.y} r={a.r} fill="none" stroke="#FFF" strokeWidth="3" strokeDasharray="10 8" />}
            <path d={`M${anchor.x} ${anchor.y} L${lab.x} ${lab.y} h${right ? 40 : -40}`} stroke="#FFF" strokeWidth="3" fill="none" />
            <circle cx={anchor.x} cy={anchor.y} r="9" fill="#FFF" stroke="#000" strokeOpacity=".4" strokeWidth="3" />
            <text x={lab.x + (right ? 54 : -54)} y={lab.y - 6} textAnchor={right ? 'start' : 'end'} fontFamily={SANS} fontWeight={800} fontSize="30" letterSpacing="4" fill={accento}
              stroke="#000" strokeOpacity=".5" strokeWidth="6" paintOrder="stroke">{a.label.toUpperCase()}</text>
            {a.sub && <text x={lab.x + (right ? 54 : -54)} y={lab.y + 34} textAnchor={right ? 'start' : 'end'} fontFamily={SANS} fontSize="32" fill="#FFF"
              stroke="#000" strokeOpacity=".5" strokeWidth="6" paintOrder="stroke">{a.sub}</text>}
          </g>
        );
      })}
      <g opacity={ip} transform={`translate(${inset.at.x - 200} ${inset.at.y - 170 + (1 - ip) * 20})`}>
        <rect width="400" height="340" rx="22" fill="#0A1020" fillOpacity=".82" stroke="#FFF" strokeOpacity=".25" strokeWidth="2" />
        <text x="28" y="50" fontFamily={SANS} fontWeight={800} fontSize="24" letterSpacing="4" fill={accento}>{inset.titolo.toUpperCase()}</text>
        <g transform="translate(30 70) scale(1)"><inset.disegno c="#FFF" w={3} /></g>
        <text x="28" y="315" fontFamily={SANS} fontSize="26" fill="#FFF" opacity=".85">{inset.nota}</text>
      </g>
    </svg>
  );
};

/** Stile 2 — taccuino d'artista: tratti a inchiostro chiaro, corsivo serif, schede color seppia con disegno a penna. */
const Taccuino: React.FC<{ t: number; ann: Ann[]; inset: Inset }> = ({ t, ann, inset }) => {
  const p = eo(seg(t, 0.3, 1.1));
  const ip = eo(seg(t, 0.8, 1.4));
  const ink = '#F6EBD2';
  const label = (x: number, y: number, s: string, anchor: 'start' | 'end' | 'middle' = 'middle', size = 60) => (
    <text x={x} y={y} textAnchor={anchor} fontFamily={SERIF} fontStyle="italic" fontSize={size} fill={ink} stroke="#0A0F1E" strokeOpacity=".55" strokeWidth="8" paintOrder="stroke">{s}</text>
  );
  return (
    <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      {ann.map((a, i) => {
        if (a.kind === 'spirale') return <path key={i} d={spiralPath(a.c, a.r)} fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 2`} opacity=".9" />;
        if (a.kind === 'anello') {
          return (
            <g key={i}>
              <ellipse cx={a.c.x} cy={a.c.y} rx={a.r * 1.04} ry={a.r} fill="none" stroke={ink} strokeWidth="4" pathLength={1} strokeDasharray={`${p} 2`} transform={`rotate(-8 ${a.c.x} ${a.c.y})`} />
              <g opacity={p}>{label(a.c.x, a.c.y - a.r - 40, a.label)}</g>
            </g>
          );
        }
        const c = { x: (a.from.x + a.to.x) / 2 + 40, y: (a.from.y + a.to.y) / 2 - 40 };
        const ang = Math.atan2(a.to.y - c.y, a.to.x - c.x);
        const head = (k: number) => `M${a.to.x - 26 * Math.cos(ang - k * 0.45)} ${a.to.y - 26 * Math.sin(ang - k * 0.45)} L${a.to.x} ${a.to.y}`;
        return (
          <g key={i}>
            <path d={`M${a.from.x} ${a.from.y} Q${c.x} ${c.y} ${a.to.x} ${a.to.y}`} fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 2`} />
            <path d={`${head(1)} ${head(-1)}`} fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" opacity={p > 0.95 ? 1 : 0} />
            <g opacity={p}>{label(a.from.x, a.from.y - 24, a.label)}</g>
          </g>
        );
      })}
      <g opacity={ip} transform={`translate(${inset.at.x} ${inset.at.y}) rotate(-2) translate(-200 -175)`}>
        <rect x="8" y="10" width="400" height="350" fill="#000" opacity=".3" />
        <rect width="400" height="350" fill="#EADCC0" />
        <rect width="400" height="350" fill="none" stroke="#B9A57E" strokeWidth="2" />
        <g transform="translate(30 40)"><inset.disegno c="#4A3423" w={3} /></g>
        <text x="200" y="320" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="38" fill="#4A3423">{inset.nota}</text>
      </g>
    </svg>
  );
};

/** Stile 3 — ibrido: frecce disegnate a mano sottili, etichette su targhette, schede bianche pulite. */
const Ibrido: React.FC<{ t: number; ann: Ann[]; inset: Inset; accento: string; scuro: string }> = ({ t, ann, inset, accento, scuro }) => {
  const p = eo(seg(t, 0.3, 1.0));
  const ip = eo(seg(t, 0.8, 1.4));
  const tag = (x: number, y: number, s: string) => {
    const w = s.length * 19 + 40;
    return (
      <g transform={`translate(${x - w / 2} ${y - 30})`}>
        <rect width={w} height="60" rx="30" fill={accento} />
        <text x={w / 2} y="40" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="32" fill={scuro}>{s}</text>
      </g>
    );
  };
  return (
    <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      {ann.map((a, i) => {
        if (a.kind === 'spirale') return <path key={i} d={spiralPath(a.c, a.r)} fill="none" stroke="#FFF" strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 2`} />;
        if (a.kind === 'anello') return (
          <g key={i}>
            <circle cx={a.c.x} cy={a.c.y} r={a.r} fill="none" stroke="#FFF" strokeWidth="5" pathLength={1} strokeDasharray={`${p} 2`} />
            <g opacity={p}>{tag(a.c.x, a.c.y - a.r - 50, a.label)}</g>
          </g>
        );
        const c = { x: (a.from.x + a.to.x) / 2 - 50, y: (a.from.y + a.to.y) / 2 + 30 };
        const ang = Math.atan2(a.to.y - c.y, a.to.x - c.x);
        const head = (k: number) => `M${a.to.x - 28 * Math.cos(ang - k * 0.5)} ${a.to.y - 28 * Math.sin(ang - k * 0.5)} L${a.to.x} ${a.to.y}`;
        return (
          <g key={i}>
            <path d={`M${a.from.x} ${a.from.y} Q${c.x} ${c.y} ${a.to.x} ${a.to.y}`} fill="none" stroke="#FFF" strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 2`} />
            <path d={`${head(1)} ${head(-1)}`} fill="none" stroke="#FFF" strokeWidth="5" strokeLinecap="round" opacity={p > 0.95 ? 1 : 0} />
            <g opacity={p}>{tag(a.from.x, a.from.y - 40, a.label)}</g>
          </g>
        );
      })}
      <g opacity={ip} transform={`translate(${inset.at.x - 200} ${inset.at.y - 175 + (1 - ip) * 20})`}>
        <rect x="0" y="8" width="400" height="350" rx="18" fill="#000" opacity=".3" />
        <rect width="400" height="350" rx="18" fill="#FBF8F1" />
        <text x="28" y="48" fontFamily={SANS} fontWeight={800} fontSize="24" letterSpacing="3" fill={scuro} opacity=".6">{inset.titolo.toUpperCase()}</text>
        <g transform="translate(30 66)"><inset.disegno c={scuro} w={3.5} /></g>
        <text x="200" y="322" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="28" fill={scuro}>{inset.nota}</text>
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- scene di prova

const SCENE: Record<string, { v: Chiave['v']; ann: (at: (p: Pt) => Pt, px: (f: number) => number) => Ann[]; inset: Inset; frase: number }> = {
  villaggio: {
    v: { x: 0.6, y: 0.7, h: 0.45 },
    ann: (at) => [{ kind: 'freccia', to: at(P.campanile), from: { x: 460, y: 830 }, label: 'campanile «olandese»', sub: 'a punta, non a vela' }],
    inset: { at: { x: 300, y: 1080 }, disegno: Chiese, titolo: 'Olanda · Provenza', nota: 'a punta · a vela' },
    frase: 1,
  },
  venere: {
    v: { x: 0.37, y: 0.5, h: 0.6 },
    ann: (at, px) => [{ kind: 'anello', c: at(P.venere), r: px(0.08), label: 'Venere', sub: 'un pianeta', side: 1 }],
    inset: { at: { x: 760, y: 1060 }, disegno: Pianeti, titolo: 'Sole · Venere · Terra', nota: 'visibile all’alba, a est' },
    frase: 1,
  },
  vortici: {
    v: { x: 0.52, y: 0.4, h: 0.75 },
    ann: (at, px) => [{ kind: 'spirale', c: at(P.vortice), r: px(0.085) }, { kind: 'spirale', c: at(P.vortice2), r: px(0.055) }, { kind: 'freccia', to: { x: at(P.vortice).x - px(0.085), y: at(P.vortice).y + 30 }, from: { x: 230, y: 1100 }, label: 'due spirali', sub: 'il cielo si avvolge' }],
    inset: { at: { x: 760, y: 1060 }, disegno: Turbolenza, titolo: 'Turbolenza', nota: 'vortici dentro vortici' },
    frase: 3,
  },
};

export const ProvaStile: React.FC<{ stile: number; scena: string }> = ({ stile, scena }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const film = getFilm('notte-stellata');
  const S = SCENE[scena];
  const testo = TESTI[scena];
  const s = 1920 / (S.v.h * 1000);
  const at = (p: Pt) => proietta(OPERA, S.v, p);
  const px = (f: number) => f * 1000 * s;
  const idx = film.data.capitoli.findIndex((c) => c.id === scena);
  const data: FilmData = { ...film.data, capitoli: film.data.capitoli.map((c, i) => (i === idx ? { ...c, titolo: testo.titolo, sottotitoli: testo.frasi } : c)) };
  const Pal = film.data.palette;
  const ann = S.ann(at, px);
  // sottotitolo mostrato: quello della frase scelta, a metà del suo tempo
  const w = testo.frasi.map((l) => l.length + 6), tot = w.reduce((a, b) => a + b, 0);
  let cur = 0.15;
  for (let k = 0; k < S.frase; k++) cur += (w[k] / tot) * (data.capitoli[idx].durata - 0.35);
  const tSub = cur + 0.8;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Quadro opera={OPERA} t={0} chiavi={[{ t: 0, v: S.v }]}
        sopra={stile === 0 ? <Editoriale t={t} ann={ann} inset={S.inset} accento={Pal.accento} />
          : stile === 1 ? <Taccuino t={t} ann={ann} inset={S.inset} />
          : <Ibrido t={t} ann={ann} inset={S.inset} accento={Pal.accento} scuro={Pal.scuro} />} />
      <ChapterOverlay film={data} index={idx} t={Math.max(t, tSub)} chapterStart={60} title={{ top: 400, size: 104 }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- tre copertine

export const ProvaCopertina: React.FC<{ variante: number }> = ({ variante }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const P0 = getFilm('notte-stellata').data.palette;
  const k = eo(seg(t, 0.1, 0.8));
  if (variante === 0) {
    // Al museo: il quadro in cornice su una parete scura, targhetta sotto
    const W = 860, Hh = W / OPERA.aspect, TOP = 540;
    return (
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, #2A3550 0%, #121826 55%, #07090F 100%)' }}>
        <div style={{ position: 'absolute', left: 540 - 300, top: 380, width: 600, height: 500, background: 'radial-gradient(ellipse, rgba(255,240,200,.18), transparent 70%)' }} />
        <div style={{ position: 'absolute', left: (1080 - W) / 2 - 22, top: TOP - 22, width: W + 44, height: Hh + 44, background: 'linear-gradient(135deg,#8C6A2E,#D9B66A 40%,#7A5A22)', boxShadow: '0 30px 60px rgba(0,0,0,.6)' }} />
        <div style={{ position: 'absolute', left: (1080 - W) / 2, top: TOP, width: W, height: Hh, overflow: 'hidden' }}>
          <Img src={staticFile(OPERA.src)} style={{ width: W, height: Hh, objectFit: 'cover', transform: `scale(${1 + 0.03 * t})` }} />
        </div>
        <p style={{ position: 'absolute', top: 280, left: 0, right: 0, textAlign: 'center', margin: 0, fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.35em', color: P0.accento, opacity: k }}>IL QUADRO IN 2 MINUTI</p>
        <h1 style={{ position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center', margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 150, lineHeight: 1, color: '#F4ECD8', opacity: k }}>Notte stellata</h1>
        <div style={{ position: 'absolute', top: TOP + Hh + 50, left: 270, width: 540, padding: '18px 0', background: '#E9E2CF', textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,.4)' }}>
          <p style={{ margin: 0, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#1A1A1A' }}>Vincent van Gogh</p>
          <p style={{ margin: '6px 0 0', fontFamily: SANS, fontSize: 26, color: '#333' }}>1889 · olio su tela · MoMA, New York</p>
        </div>
        <p style={{ position: 'absolute', top: 1420, left: 80, right: 80, textAlign: 'center', margin: 0, fontFamily: SERIF, fontStyle: 'italic', fontSize: 58, color: '#F4ECD8', opacity: eo(seg(t, 1, 1.6)) }}>Perché questo cielo sembra muoversi?</p>
      </AbsoluteFill>
    );
  }
  if (variante === 1) {
    // Dettaglio a tutto schermo con titolo grande
    return (
      <AbsoluteFill>
        <Quadro opera={OPERA} t={t} chiavi={[{ t: 0, v: { x: 0.6, y: 0.33, h: 0.62 } }, { t: 4, v: { x: 0.58, y: 0.34, h: 0.55 } }]} />
        <AbsoluteFill style={{ background: 'linear-gradient(rgba(5,10,25,.75), rgba(5,10,25,0) 45%, rgba(5,10,25,0) 60%, rgba(5,10,25,.7))' }} />
        <p style={{ position: 'absolute', top: 290, left: 80, margin: 0, fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.35em', color: P0.accento, opacity: k }}>IL QUADRO IN 2 MINUTI</p>
        <h1 style={{ position: 'absolute', top: 340, left: 72, margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 230, lineHeight: 0.88, color: '#FFF8E6', opacity: k, textShadow: '0 6px 30px rgba(0,0,0,.5)' }}>Notte<br />stellata</h1>
        <p style={{ position: 'absolute', top: 780, left: 80, margin: 0, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#FFF8E6', opacity: eo(seg(t, 0.5, 1)) }}>Vincent van Gogh · 1889</p>
        <p style={{ position: 'absolute', top: 1390, left: 80, right: 80, margin: 0, fontFamily: SERIF, fontStyle: 'italic', fontSize: 60, color: '#FFF8E6', opacity: eo(seg(t, 1, 1.6)) }}>Il cielo più famoso della storia dell’arte, spiegato in due minuti.</p>
      </AbsoluteFill>
    );
  }
  // Striscia: il quadro intero in alto, titolo grande sotto, una domanda agganciata a Venere
  const top = 300, Hh = 1080 / OPERA.aspect;
  const venus = { x: P.venere.x * 1080, y: top + P.venere.y * Hh };
  const p = eo(seg(t, 1.2, 2));
  return (
    <AbsoluteFill style={{ background: P0.scuro }}>
      <div style={{ position: 'absolute', left: 0, top, width: 1080, height: Hh, overflow: 'hidden' }}>
        <Img src={staticFile(OPERA.src)} style={{ width: 1080, height: Hh, objectFit: 'cover', transform: `scale(${1.02 + 0.02 * t})` }} />
      </div>
      <p style={{ position: 'absolute', top: 250, left: 60, margin: 0, fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: '0.35em', color: P0.accento }}>IL QUADRO IN 2 MINUTI</p>
      <h1 style={{ position: 'absolute', top: top + Hh + 40, left: 60, margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 150, lineHeight: 0.92, color: P0.chiaro, opacity: k }}>Notte stellata</h1>
      <p style={{ position: 'absolute', top: top + Hh + 200, left: 64, margin: 0, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: P0.chiaro, opacity: 0.85 }}>Vincent van Gogh · 1889</p>
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <circle cx={venus.x} cy={venus.y} r="70" fill="none" stroke="#FFF" strokeWidth="4" pathLength={1} strokeDasharray={`${p} 2`} />
        <path d={`M${venus.x + 60} ${venus.y + 60} Q${venus.x + 200} ${venus.y + 200} ${venus.x + 330} ${venus.y + 230}`} fill="none" stroke="#FFF" strokeWidth="4" pathLength={1} strokeDasharray={`${p} 2`} />
        <text x={venus.x + 345} y={venus.y + 245} fontFamily={SERIF} fontStyle="italic" fontSize="56" fill="#FFF" opacity={p}>non è una stella</text>
      </svg>
      <p style={{ position: 'absolute', top: 1435, left: 60, right: 60, margin: 0, fontFamily: SERIF, fontStyle: 'italic', fontSize: 50, color: P0.chiaro, opacity: eo(seg(t, 1.6, 2.2)) }}>Sette segreti nascosti in un cielo di notte.</p>
    </AbsoluteFill>
  );
};
