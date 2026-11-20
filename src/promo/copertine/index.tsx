import React from 'react';
import { registerRoot, Still } from 'remotion';
import { CopertinaCanale } from './CopertinaCanale';

// Immagini fisse verticali (1080×1920) per pubblicizzare il canale YouTube.
// npx remotion still src/promo/copertine/index.tsx copertina-canale-youtube out/copertina-canale-youtube.png
const Root: React.FC = () => (
  <Still id="copertina-canale-youtube" component={CopertinaCanale} width={1080} height={1920} />
);
registerRoot(Root);
