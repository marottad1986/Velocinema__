import type { SceneDef } from '../../types';
import { makeMondi } from './Mondi';

// Dark, stagione 3 come schema: ogni capitolo è lo stesso schema dei due mondi in un altro momento (Mondi.tsx).
// Titolo piccolo in alto, così lo schema intero sta tra il titolo e i sottotitoli.
const title = { top: 380, size: 60, width: 960 };
export const DARK_S3_SCENES: Record<string, SceneDef> = Object.fromEntries(
  ['altromondo', 'eva', 'bambino', 'sfera', 'claudia', 'origine', 'ponte', 'svanire', 'fine'].map((id) => [id, { Component: makeMondi(id), title }]),
);
