import React from 'react';
import { Composition, Folder } from 'remotion';
import { ChapterView, FPS, Film, PosterView, filmDuration } from './components/Film';
import { FILMS } from './films';
import { Catalogo } from './lib/Catalogo';
import { ProvaCopertina, ProvaStile } from './prove/ProveQuadri';

export const RemotionRoot: React.FC = () => (
  <>
    {FILMS.map((film) => (
      <Folder key={film.slug} name={film.slug}>
        <Composition
          id={film.slug}
          component={Film}
          defaultProps={{ slug: film.slug }}
          durationInFrames={filmDuration(film) * FPS}
          fps={FPS}
          width={1080}
          height={1920}
        />
        {/* Le props devono essere JSON: si passa lo slug, non l'oggetto film. Un capitolo alla volta, per le prove: id "<film>--<capitolo>" */}
        {film.data.capitoli.map((c, i) => (
          <Composition
            key={c.id}
            id={`${film.slug}--${c.id}`}
            component={ChapterView}
            defaultProps={{ slug: film.slug, index: i }}
            durationInFrames={c.durata * FPS}
            fps={FPS}
            width={1080}
            height={1920}
          />
        ))}
        <Composition id={`${film.slug}--copertina`} component={PosterView} defaultProps={{ slug: film.slug, end: false }} durationInFrames={film.data.copertina.durata * FPS} fps={FPS} width={1080} height={1920} />
        <Composition id={`${film.slug}--finale`} component={PosterView} defaultProps={{ slug: film.slug, end: true }} durationInFrames={film.data.finale.durata * FPS} fps={FPS} width={1080} height={1920} />
      </Folder>
    ))}
    {/* Prove di stile per la serie dei quadri */}
    <Folder name="prove">
      {[0, 1, 2].map((stile) => ['villaggio', 'venere', 'vortici'].map((scena) => (
        <Composition key={`${stile}-${scena}`} id={`prova-stile${stile + 1}-${scena}`} component={ProvaStile} defaultProps={{ stile, scena }} durationInFrames={3 * FPS} fps={FPS} width={1080} height={1920} />
      )))}
      {[0, 1, 2].map((variante) => (
        <Composition key={variante} id={`prova-copertina${variante + 1}`} component={ProvaCopertina} defaultProps={{ variante }} durationInFrames={4 * FPS} fps={FPS} width={1080} height={1920} />
      ))}
    </Folder>
    {/* Catalogo della libreria di elementi (src/lib/elements.tsx) */}
    <Folder name="libreria">
      <Composition id="libreria--esterni" component={Catalogo} defaultProps={{ page: 'esterni' as const }} durationInFrames={4 * FPS} fps={FPS} width={1080} height={1920} />
      <Composition id="libreria--interni" component={Catalogo} defaultProps={{ page: 'interni' as const }} durationInFrames={4 * FPS} fps={FPS} width={1080} height={1920} />
    </Folder>
  </>
);
