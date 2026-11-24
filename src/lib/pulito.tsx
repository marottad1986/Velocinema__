import React from 'react';

/**
 * Mondo condiviso in modalità «pulito» (trailer verticali, TRAILER.md): dentro questo involucro non si disegna mai
 * testo, qualunque cosa contenga il mondo del lungo (scritte, cartelli, nodi con nome, contatori). Proposta dei revisori
 * musica e immagini approvata dall'editore il 23 nov 2026: con un `{!pulito && …}` dimenticato una scritta del lungo
 * finiva nel trailer. Le insegne che fanno parte del paesaggio (es. «SCUOLA» sulla facciata) restano se l'elemento
 * `<text>` o il suo gruppo porta `data-insegna`.
 * Uso nei mondi nuovi: `<SenzaTesto attivo={pulito}>…tutto il mondo…</SenzaTesto>`.
 */
let n = 0;
export const SenzaTesto: React.FC<{ attivo: boolean; children: React.ReactNode }> = ({ attivo, children }) => {
  const [id] = React.useState(() => `senza-testo-${n++}`);
  if (!attivo) return <>{children}</>;
  const sel = `[data-senza-testo="${id}"]`;
  const css = `${sel} text:not([data-insegna] text):not([data-insegna]), ${sel} foreignObject { display: none !important; }
${sel} :is(div, span, p, h1, h2, h3, h4, b, strong, em, i, small, label):not([data-insegna] *):not([data-insegna]) { color: transparent !important; text-shadow: none !important; -webkit-text-stroke: 0 !important; }`;
  return (
    <div data-senza-testo={id} style={{ display: 'contents' }}>
      <style>{css}</style>
      {children}
    </div>
  );
};
