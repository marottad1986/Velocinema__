import React from 'react';
import { clamp01, fmtTime, seg, eo } from '../lib/anim';
import { DISPLAY, SANS } from '../lib/fonts';
import type { FilmData, TitleSpec } from '../types';

const alpha = (hex: string, a: number) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

/** Tempi dei sottotitoli in proporzione alla lunghezza delle frasi. */
export const subtitleTimes = (lines: string[], dur: number) => {
  const w = lines.map((l) => l.length + 6);
  const total = w.reduce((a, b) => a + b, 0);
  const span = dur - 0.35;
  let cur = 0.15;
  return w.map((x) => {
    const a = cur;
    cur += (x / total) * span;
    return [a, cur] as const;
  });
};

type Props = {
  film: FilmData;
  index: number; // indice del capitolo (0-based)
  t: number; // secondi dall'inizio del capitolo
  chapterStart: number; // secondi dall'inizio del video
  title: TitleSpec;
};

export const ChapterOverlay: React.FC<Props> = ({ film, index, t, chapterStart, title }) => {
  const { palette: P, capitoli } = film;
  const ch = capitoli[index];
  const total = film.copertina.durata + capitoli.reduce((a, c) => a + c.durata, 0) + film.finale.durata;
  const T = chapterStart + t;
  const chaptersStart = film.copertina.durata;

  // Barra a capitoli
  let acc = chaptersStart;
  const segs = capitoli.map((c) => {
    const s = acc;
    acc += c.durata;
    return { dur: c.durata, fill: clamp01((T - s) / c.durata) };
  });

  // Titolo: entra da destra
  const pt = eo(seg(t, 0.1, 0.55));
  const times = subtitleTimes(ch.sottotitoli, ch.durata);

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: SANS }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, display: 'flex', gap: 4 }}>
        {segs.map((s, i) => (
          <div key={i} style={{ flex: `${s.dur} 1 0`, height: 16, background: alpha(P.scuro, 0.55), position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${s.fill * 100}%`, background: P.accento }} />
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute', left: 50, top: 262, display: 'flex', alignItems: 'center', gap: 14,
          padding: '10px 22px', borderRadius: 999, background: alpha(P.scuro, 0.72), color: P.chiaro,
          fontSize: 26, fontWeight: 800, letterSpacing: '0.12em',
        }}
      >
        <span>CAPITOLO {index + 1} DI {capitoli.length}</span>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: P.accento }} />
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtTime(T)} / {fmtTime(total)}</span>
      </div>

      <h2
        style={{
          position: 'absolute', left: 80, top: Math.max(title.top, 380), margin: 0, width: title.width,
          fontFamily: DISPLAY, fontWeight: 800, fontSize: title.size ?? 104, lineHeight: 1,
          color: title.dark ? P.scuro : P.chiaro,
          textShadow: title.dark ? `0 3px 0 ${alpha(P.chiaro, 0.55)}` : `0 5px 0 ${P.scuro}`,
          opacity: pt, transform: `translateX(${(1 - pt) * 30}px)`,
        }}
      >
        {ch.titolo}
      </h2>

      <div style={{ position: 'absolute', left: 60, top: 1270, width: 960, height: 220 }}>
        {ch.sottotitoli.map((line, i) => {
          const [a, b] = times[i];
          const p = seg(t, a, a + 0.12);
          const q = seg(t, b - 0.08, b);
          const o = p * (1 - q);
          // Le frasi restano sempre montate: smontarle lasciava "fantasmi" del riquadro nei render paralleli.
          return (
            <p
              key={i}
              style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, margin: '0 auto', width: 'fit-content', maxWidth: 960,
                boxSizing: 'border-box', padding: '12px 26px 14px', borderRadius: 16, background: alpha(P.scuro, 0.82),
                color: P.chiaro, fontSize: 46, lineHeight: 1.25, fontWeight: 800, textAlign: 'center',
                opacity: o, visibility: o > 0 ? 'visible' : 'hidden', transform: `translateY(${(1 - p) * 10}px)`,
              }}
            >
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
};
