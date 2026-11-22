import React from 'react';
import type { ParteProps, ScenaLunga } from '../registro';
import { Mondo, STARTS } from './Paese';
import { Aggancio } from './Aggancio';
import { Chiusura } from './Chiusura';
import L from '../../../lunghi/donnie-darko-spiegato.json';

// Donnie Darko spiegato (video lungo nativo 16:9): tutti i capitoli sono lo stesso mondo (Paese.tsx) a tempi diversi.
const ids = (L.parti as { capitoli?: { id: string }[] }[]).flatMap((p) => (p.capitoli ?? []).map((c) => c.id));
const capitolo = (id: string): React.FC<ParteProps> => ({ t }) => React.createElement(Mondo, { T: STARTS[id] + t });

export const DONNIE_DARKO_SPIEGATO: ScenaLunga = {
  aggancio: Aggancio,
  chiusura: Chiusura,
  capitoli: Object.fromEntries(ids.map((id) => [id, capitolo(id)])),
  episodio: () => null,
};
