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
          position: 'absolute', left: 120, top: 262, display: 'flex', alignItems: 'center', gap: 14,
          padding: '10px 22px', borderRadius: 999, background: alpha(P.scuro, 0.72), color: P.chiaro,
          fontSize: 26, fontWeight: 800, letterSpacing: '0.12em',
        }}
      >
        <span>CAPITOLO {index + 1} DI {capitoli.length}</span>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: P.accento }} />
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtTime(T)} / {fmtTime(total)}</span>
      </div>

      {film.linea_tempo && !film.schema && <Timeline film={film} index={index} t={t} />}
      {!film.schema && <CharacterTags film={film} index={index} t={t} times={times} />}

      <h2
        style={{
          position: 'absolute', left: 120, top: Math.max(title.top, 380), margin: 0, width: Math.min(title.width ?? 840, 840), maxWidth: 840,
          fontFamily: DISPLAY, fontWeight: 800, fontSize: title.size ?? 104, lineHeight: 1,
          color: title.dark ? P.scuro : P.chiaro,
          textShadow: title.dark ? `0 3px 0 ${alpha(P.chiaro, 0.55)}` : `0 5px 0 ${P.scuro}`,
          opacity: pt, transform: `translateX(${(1 - pt) * 30}px)`,
        }}
      >
        {ch.titolo}
      </h2>

      {/* fascia dei sottotitoli: a destra resta libera la colonna delle icone delle app (like, commenti, condivisioni) */}
      <div style={{ position: 'absolute', left: 120, top: 1270, width: 780, height: 220 }}>
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
                position: 'absolute', left: 0, right: 0, bottom: 0, margin: '0 auto', width: 'fit-content', maxWidth: 780,
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

/**
 * Formato "spiegato": linea del tempo accanto all'etichetta (y 262). Gli anni già visitati dal racconto si accendono
 * capitolo dopo capitolo, quello del capitolo è evidenziato con l'accento; gli altri restano "????".
 */
const Timeline: React.FC<{ film: FilmData; index: number; t: number }> = ({ film, index, t }) => {
  const P = film.palette;
  const years = film.linea_tempo ?? [];
  const now = film.capitoli[index].anno;
  const seen = new Set(film.capitoli.slice(0, index).map((c) => c.anno));
  const pop = eo(seg(t, 0.2, 0.6));
  const x0 = 564, step = 116;
  return (
    <div style={{ position: 'absolute', left: 514, top: 262, width: 446, height: 52, borderRadius: 999, background: alpha(P.scuro, 0.72) }}>
      <div style={{ position: 'absolute', left: x0 - 514 + 6, right: 446 - (x0 - 514 + step * (years.length - 1)) + 6, top: 25, height: 3, background: alpha(P.chiaro, 0.3) }} />
      {years.map((y, i) => {
        const cur = y === now;
        const known = seen.has(y) || cur;
        const fresh = cur && !seen.has(y); // anno che compare per la prima volta in questo capitolo
        const o = fresh ? pop : 1;
        return (
          <span
            key={y}
            style={{
              position: 'absolute', left: x0 - 514 + i * step, top: 26, transform: `translate(-50%, -50%) scale(${cur ? 1 + 0.12 * (1 - pop) : 1})`,
              padding: '4px 10px', borderRadius: 999, background: cur ? P.accento : alpha(P.scuro, 0.9),
              color: cur ? P.scuro : P.chiaro, fontSize: 24, fontWeight: 800, letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums',
              opacity: known ? (cur ? 1 : 0.85) * o + (1 - o) * 0.35 : 0.35,
            }}
          >
            {known && o > 0.5 ? y : '????'}
          </span>
        );
      })}
    </div>
  );
};

/**
 * Formato "spiegato": cartellino «NOME = oggetto» quando un personaggio viene presentato (prima frase che lo nomina),
 * così si impara quale oggetto lo rappresenta. Sta sopra i sottotitoli, a sinistra.
 */
const CharacterTags: React.FC<{ film: FilmData; index: number; t: number; times: (readonly [number, number])[] }> = ({ film, index, t, times }) => {
  const P = film.palette;
  const ch = film.capitoli[index];
  const tags = (ch.personaggi ?? []).flatMap((nome) => {
    const def = film.personaggi?.find((p) => p.nome === nome);
    const key = nome.replace(/^(lo|la|il|l')\s*/i, '').toLowerCase();
    const i = ch.sottotitoli.findIndex((l) => l.toLowerCase().includes(key));
    if (!def || i < 0) return [];
    const a = times[i][0] + 0.25;
    const b = times[Math.min(i + 1, times.length - 1)][1] - 0.1;
    return [{ def, a, b }];
  });
  return (
    <>
      {tags.map(({ def, a, b }, k) => {
        const p = eo(seg(t, a, a + 0.35));
        const q = seg(t, b - 0.25, b);
        const o = p * (1 - q);
        return (
          <div
            key={def.nome}
            style={{
              position: 'absolute', left: 120, top: 1172 - k * 82, display: 'flex', alignItems: 'baseline', gap: 14,
              padding: '10px 22px 12px', borderRadius: 14, background: alpha(P.scuro, 0.82), borderLeft: `8px solid ${P.accento}`,
              color: P.chiaro, opacity: o, visibility: o > 0 ? 'visible' : 'hidden', transform: `translateX(${(1 - p) * -30}px)`,
            }}
          >
            <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '0.1em', color: P.accento }}>{def.nome.toUpperCase()}</span>
            <span style={{ fontSize: 30, fontWeight: 400 }}>= {def.oggetto}</span>
          </div>
        );
      })}
    </>
  );
};
