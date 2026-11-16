import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { seg } from '../lib/anim';
import { SANS } from '../lib/fonts';
import { getPromo, tempiPromo } from './registro';

const alpha = (hex: string, a: number) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

/** Short promozionale: la scena (una sola immagine) e i sottotitoli in basso, come nei video verticali. */
export const Promo: React.FC<{ slug: string }> = ({ slug }) => {
  const P = getPromo(slug);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const tempi = tempiPromo(P.data);
  const cue = (id: string, n: number) => tempi.frasi[id][n][0];
  const C = P.data.palette;
  const righe = P.data.parti.flatMap((p, i) => p.sottotitoli.map((testo, n) => {
    const [a, b0] = tempi.frasi[p.id][n];
    // la frase di lancio resta fino alla fine della copertina (CLAUDE.md); entrata breve di ~0,3 s
    const b = i === 0 && n === p.sottotitoli.length - 1 ? tempi.inizio[P.data.parti[1]?.id] ?? b0 : b0;
    return { testo, a: i === 0 && n === 0 ? a - 0.15 : a, b, lancio: i === 0 };
  }));
  return (
    <AbsoluteFill style={{ background: C.scuro, overflow: 'hidden' }}>
      <P.Scena T={T} tempi={tempi} cue={cue} />
      {/* fascia dei sottotitoli: tra y 1270 e 1490, x 120–900 (a destra la colonna delle icone delle app) */}
      <div style={{ position: 'absolute', left: 120, top: 1270, width: 780, height: 220, fontFamily: SANS }}>
        {righe.map(({ testo, a, b, lancio }, i) => {
          const p = seg(T, a, a + (lancio ? 0.3 : 0.12));
          const q = seg(T, b - 0.08, b);
          const o = p * (1 - q);
          return (
            <p key={i} style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, margin: '0 auto', width: 'fit-content', maxWidth: 780,
              boxSizing: 'border-box', padding: '12px 26px 14px', borderRadius: 16, background: alpha(C.scuro, 0.82),
              color: C.chiaro, fontSize: 46, lineHeight: 1.25, fontWeight: 800, textAlign: 'center',
              opacity: o, visibility: o > 0 ? 'visible' : 'hidden', transform: `translateY(${(1 - p) * 10}px)`,
            }}>{testo}</p>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
