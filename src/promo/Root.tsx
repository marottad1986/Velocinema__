import React from 'react';
import { Composition, Folder } from 'remotion';
import { Promo } from './Promo';
import { PROMO, tempiPromo } from './registro';

export const FPS = 30;

// Composizioni degli Short promozionali (1080×1920): npx remotion studio src/promo/index.ts
export const RootPromo: React.FC = () => (
  <Folder name="promo">
    {PROMO.map((p) => (
      <Composition key={p.slug} id={p.slug} component={Promo} defaultProps={{ slug: p.slug }}
        durationInFrames={Math.round(tempiPromo(p.data).fine * FPS)} fps={FPS} width={1080} height={1920} />
    ))}
  </Folder>
);
