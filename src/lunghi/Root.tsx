import React from 'react';
import { Composition, Folder } from 'remotion';
import { FPS, Lungo, TrattoView } from './Lungo';
import { LUNGHI } from './registro';
import { durataTotale, tratti } from './tempi';

// Composizioni dei video lunghi orizzontali (1920×1080), separate da quelle dei video verticali (src/Root.tsx).
// "<slug>" = tutto il video; "<slug>--<tratto>" = un tratto solo, per le prove.
export const RootLunghi: React.FC = () => (
  <>
    {LUNGHI.map((L) => {
      const tr = tratti(L.data, L.episodi);
      return (
        <Folder key={L.slug} name={L.slug}>
          <Composition id={L.slug} component={Lungo} defaultProps={{ slug: L.slug }} durationInFrames={Math.round(durataTotale(tr) * FPS)} fps={FPS} width={1920} height={1080} />
          {tr.map((x, i) => (
            <Composition key={x.id} id={`${L.slug}--${x.id}`} component={TrattoView} defaultProps={{ slug: L.slug, indice: i, offset: 0 }}
              durationInFrames={Math.round(x.dur * FPS)} fps={FPS} width={1920} height={1080} />
          ))}
        </Folder>
      );
    })}
  </>
);
