import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { SANS } from '../lib/fonts';
import { Overlay16 } from './Overlay16';
import { getLungo } from './registro';
import { cuesDi, durataTotale, tratti, type Tratto } from './tempi';

export const FPS = 30;
/** La voce e i sottotitoli dell'aggancio partono da qui: il fotogramma 0 è la miniatura, senza testo (CLAUDE.md). */
export const INIZIO_AGGANCIO = 0.4;

/** Tempo nella stagione, come nel video verticale («m:ss / 2:00»): il lungo non dichiara mai la sua durata totale. */
const tempoEpisodio = (tr: Tratto[], x: Tratto, t: number): [number, number] => {
  const ep = tr.filter((y) => 'parte' in y && y.parte === x.parte);
  const inizio = ep[0].start;
  return [x.start - inizio + t, ep.reduce((a, y) => a + y.dur, 0)];
};

/** Un tratto del video lungo (aggancio, cartello, capitolo, riassunto, chiusura), con i suoi elementi fissi. */
export const TrattoView: React.FC<{ slug: string; indice: number; offset?: number }> = ({ slug, indice, offset = 0 }) => {
  const L = getLungo(slug);
  const tr = tratti(L.data, L.episodi);
  const x = tr[indice];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + offset;
  const P = L.data.palette;
  return (
    <AbsoluteFill style={{ background: P.scuro, overflow: 'hidden' }}>
      <Scena L={L} x={x} t={t} />
      {x.tipo === 'capitolo-episodio' && (
        <Overlay16 P={P} t={t} dur={x.dur} tempo={tempoEpisodio(tr, x, t)} etichetta={`${x.parte.nome} · CAPITOLO ${x.n} DI ${x.di}`} titolo={x.capitolo.titolo} righe={x.capitolo.sottotitoli} />
      )}
      {x.tipo === 'capitolo' && (
        <Overlay16 P={P} t={t} dur={x.dur} etichetta={`${x.parte.nome} · ${x.n} DI ${x.di}`} titolo={x.capitolo.titolo} righe={x.capitolo.sottotitoli} />
      )}
      {x.tipo === 'aggancio' && <Overlay16 P={P} t={t} dur={x.dur} righe={x.parte.sottotitoli} inizio={INIZIO_AGGANCIO} />}
      {x.tipo === 'chiusura' && <Overlay16 P={P} t={t} dur={x.dur} righe={x.parte.sottotitoli} />}
    </AbsoluteFill>
  );
};

const Scena: React.FC<{ L: ReturnType<typeof getLungo>; x: Tratto; t: number }> = ({ L, x, t }) => {
  const S = L.scene;
  if (x.tipo === 'carta' || x.tipo === 'capitolo-episodio' || x.tipo === 'riassunto') {
    // T dell'episodio = secondi dall'inizio del suo video verticale (copertina compresa)
    const tr = tratti(L.data, L.episodi);
    const inizio = tr.find((y) => y.tipo === 'carta' && y.parte === x.parte)!.start;
    const Ep = S.episodio;
    return <Ep film={x.parte.film} T={x.start - inizio + t} parte={x.parte} riassunto={x.film.finale.voce ?? ''} />;
  }
  if (x.tipo === 'capitolo') {
    const C = S.capitoli[x.capitolo.id];
    if (C) return <C t={t} dur={x.dur} cues={cuesDi(x.capitolo.sottotitoli, x.dur)} />;
  }
  if (x.tipo === 'aggancio' && S.aggancio) return <S.aggancio t={t} dur={x.dur} cues={cuesDi(x.parte.sottotitoli, x.dur - INIZIO_AGGANCIO).map((c) => c + INIZIO_AGGANCIO)} />;
  if (x.tipo === 'chiusura' && S.chiusura) return <S.chiusura t={t} dur={x.dur} cues={cuesDi(x.parte.sottotitoli, x.dur)} />;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: SANS, fontSize: 40, color: '#E4E7E1', opacity: 0.6 }}>[scena da disegnare: {x.id}]</p>
    </AbsoluteFill>
  );
};

/** Tutto il video lungo. Le parti che continuano la stessa scena (un episodio) restano un'unica sequenza per tratto. */
export const Lungo: React.FC<{ slug: string }> = ({ slug }) => {
  const L = getLungo(slug);
  const tr = tratti(L.data, L.episodi);
  return (
    <AbsoluteFill style={{ background: L.data.palette.scuro }}>
      {tr.map((x, i) => (
        <Sequence key={x.id} from={Math.round(x.start * FPS)} durationInFrames={Math.round(x.dur * FPS)}>
          <TrattoView slug={slug} indice={i} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
