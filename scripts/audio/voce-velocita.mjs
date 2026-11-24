// "voce_velocita" di una parte (capitolo, copertina, finale, tratto di un lungo, parte di un promo): velocità di
// ElevenLabs solo per quella clip (proposta «Velocità della voce per capitolo», approvata dall'editore il 22 nov 2026).
// Usato da scripts/genera-voce.mjs e scripts/strumenti/ascolta-voce.mjs. undefined se la parte non la indica.
export const velocitaDi = (film, id) => {
  const trovati = [];
  const visita = (o) => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(visita);
    if (o.id === id) trovati.push(o);
    Object.values(o).forEach(visita);
  };
  visita(film.capitoli ?? film.parti ?? []);
  if (id === 'copertina' && film.copertina) trovati.push(film.copertina);
  if (id === 'finale' && film.finale) trovati.push(film.finale);
  return trovati.find((o) => o.voce_velocita !== undefined)?.voce_velocita;
};
