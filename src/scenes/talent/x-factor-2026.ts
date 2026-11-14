// Dati della gara di X Factor 2026 (TALENT.md): squadre, concorrenti e cosa è successo a ogni Live.
// Fonte: https://it.wikipedia.org/wiki/X_Factor_(Italia)_(ventesima_edizione) (tabella delle eliminazioni).
// Dopo ogni Live si aggiungono SOLO i fatti già successi: `fuori` (numero del Live in cui è uscito), `entra` (Live da cui è
// in gara, per i ripescati) e la serata in LIVE (ballottaggio e voto di ogni giudice).

export type GiudiceId = 'gabbani' | 'jake' | 'paola' | 'irama';

export type Concorrente = {
  id: string;
  nome: string;
  squadra: GiudiceId;
  band?: boolean;
  /** Live in cui è stato eliminato. */
  fuori?: number;
  /** Ripescato: in gara dal Live indicato (con il pass). */
  entra?: number;
  /** Mai entrato ai Live (es. sconfitto al ripescaggio). */
  escluso?: boolean;
};

export type Giudice = { id: GiudiceId; nome: string; corto: string; colore: string; scuro: string };

export const GIUDICI: Giudice[] = [
  { id: 'gabbani', nome: 'Francesco Gabbani', corto: 'Gabbani', colore: '#FF7A66', scuro: '#7A2E24' },
  { id: 'jake', nome: 'Jake La Furia', corto: 'Jake', colore: '#A8E063', scuro: '#3E5A1E' },
  { id: 'paola', nome: 'Paola Iezzi', corto: 'Paola', colore: '#E08CFF', scuro: '#5A2A70' },
  { id: 'irama', nome: 'Irama', corto: 'Irama', colore: '#5CC8FF', scuro: '#1E4A66' },
];
export const giudice = (id: GiudiceId) => GIUDICI.find((g) => g.id === id)!;

/** Ordine sul palco: per squadra, come le presenta la voce. */
export const CONCORRENTI: Concorrente[] = [
  { id: 'giacomo', nome: 'Giacomo Calò', squadra: 'gabbani' },
  { id: 'alice', nome: 'Alice Fregoso', squadra: 'gabbani', fuori: 1 },
  { id: 'scraffs', nome: 'Scraffs', squadra: 'gabbani', band: true, fuori: 4 },
  { id: 'teo', nome: 'Teo Bok', squadra: 'gabbani', entra: 2 },
  { id: 'alia', nome: 'Alìa', squadra: 'jake', fuori: 4 },
  { id: 'alex', nome: 'Alex Fontana', squadra: 'jake' },
  { id: 'veronica', nome: 'Veronica Bruganelli', squadra: 'jake', fuori: 2 },
  { id: 'camilla', nome: 'Camilla Guerini', squadra: 'paola' },
  { id: 'manu', nome: 'Manu', squadra: 'paola', fuori: 4 },
  { id: 'maddog', nome: 'Mad-Dog', squadra: 'paola', band: true },
  { id: 'patrizia', nome: 'Patrizia Napolano', squadra: 'irama' },
  { id: 'lenanie', nome: 'Lenanie', squadra: 'irama', fuori: 3 },
  { id: 'distanze', nome: 'Le Distanze', squadra: 'irama', band: true },
  { id: 'timothee', nome: 'Timothée Bonnardel', squadra: 'paola', escluso: true },
];
export const concorrente = (id: string) => CONCORRENTI.find((c) => c.id === id)!;

/** Stato di un concorrente dopo il Live n (0 = squadre della Last Call, prima del primo Live). */
export const stato = (c: Concorrente, n: number): 'gara' | 'fuori' | 'assente' => {
  if (c.escluso) return 'assente';
  if (c.entra !== undefined && n < c.entra - 1) return 'assente'; // ripescato alla fine del Live entra-1
  if (c.fuori !== undefined && n >= c.fuori) return 'fuori';
  return 'gara';
};

/** Le serate: ballottaggio [a, b], eliminato e chi ha votato per eliminare chi. */
export const LIVE: Record<number, { data: string; ballottaggio: [string, string]; fuori: string; voti: Record<GiudiceId, string>; tema?: string; /** pareggio dei giudici: decide il Tilt (televoto lampo) */ tilt?: boolean; /** usciti subito, senza ballottaggio */ subito?: string[] }> = {
  1: { data: '22 OTTOBRE', ballottaggio: ['veronica', 'alice'], fuori: 'alice', voti: { gabbani: 'veronica', jake: 'alice', paola: 'alice', irama: 'alice' } },
  2: { data: '29 OTTOBRE', ballottaggio: ['veronica', 'lenanie'], fuori: 'veronica', voti: { gabbani: 'veronica', jake: 'lenanie', paola: 'veronica', irama: 'veronica' } },
  3: { data: '5 NOVEMBRE', ballottaggio: ['lenanie', 'manu'], fuori: 'lenanie', voti: { gabbani: 'lenanie', jake: 'lenanie', paola: 'lenanie', irama: 'manu' }, tema: 'anni Sessanta e Settanta' },
  4: { data: '12 NOVEMBRE', ballottaggio: ['alia', 'distanze'], fuori: 'alia', voti: { gabbani: 'distanze', jake: 'distanze', paola: 'alia', irama: 'alia' }, tilt: true, subito: ['manu', 'scraffs'], tema: 'Hell Factor, tripla eliminazione' },
};
