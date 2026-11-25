import React from 'react';
import { Composition, Folder } from 'remotion';
import { Sigla, SIGLA_DURATA } from './Sigla';

const FPS = 30;

// Sigla «2M Studios» (src/sigla/Sigla.tsx): npx remotion studio src/sigla/index.ts
export const RootSigla: React.FC = () => (
  <Folder name="sigla">
    <Composition id="sigla-2m-studios" component={Sigla} durationInFrames={Math.round(SIGLA_DURATA * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="sigla-2m-studios-verticale" component={Sigla} durationInFrames={Math.round(SIGLA_DURATA * FPS)} fps={FPS} width={1080} height={1920} />
  </Folder>
);
