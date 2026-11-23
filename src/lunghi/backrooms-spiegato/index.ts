import React from 'react';
import type { ParteProps, ScenaLunga } from '../registro';
import { Mondo, STARTS } from './Mondo';
import { Aggancio } from './Aggancio';
import { Chiusura } from './Chiusura';
import { MiniaturaB, MiniaturaC } from './Miniature';
import L from '../../../lunghi/backrooms-spiegato.json';

// Backrooms spiegato (video lungo nativo 16:9): tutti i tratti sono lo stesso mondo (Mondo.tsx) a tempi diversi.
const ids = (L.parti as { capitoli?: { id: string }[] }[]).flatMap((p) => (p.capitoli ?? []).map((c) => c.id));
const capitolo = (id: string): React.FC<ParteProps> => ({ t }) => React.createElement(Mondo, { T: STARTS[id] + t });

export const BACKROOMS_SPIEGATO: ScenaLunga = {
  aggancio: Aggancio,
  chiusura: Chiusura,
  capitoli: Object.fromEntries(ids.map((id) => [id, capitolo(id)])),
  episodio: () => null,
  miniature: { b: MiniaturaB, c: MiniaturaC },
};
