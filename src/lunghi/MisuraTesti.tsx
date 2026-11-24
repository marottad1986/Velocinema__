import React, { useLayoutEffect } from 'react';
import { getInputProps, useCurrentFrame } from 'remotion';

/**
 * Misura dei testi per il controllo automatico dei lunghi (proposta dei revisori immagini e musica, approvata
 * dall'editore il 23 nov 2026). Solo quando la composizione riceve `misura: true` (scripts/lunghi/pacchetto.mjs):
 * a ogni fotogramma scrive nel registro del browser i rettangoli di ogni testo visibile (scritte, cartelli, titolo,
 * etichetta, sottotitoli), così il pacchetto trova quelli che si sovrappongono. Nel video normale non fa niente.
 */
export const MisuraTesti: React.FC = () => {
  const frame = useCurrentFrame();
  const attiva = (getInputProps() as { misura?: boolean }).misura === true;
  useLayoutEffect(() => {
    if (!attiva) return;
    const visibile = (el: Element) => {
      let o = 1;
      for (let e: Element | null = el; e; e = e.parentElement) {
        const s = getComputedStyle(e);
        if (s.display === 'none' || s.visibility === 'hidden') return 0;
        o *= Number(s.opacity);
      }
      return o;
    };
    // origine e scala dai due segnaposto agli angoli della composizione (la pagina di Remotion la sposta e la scala)
    const a = document.querySelector('[data-misura="0"]')?.getBoundingClientRect();
    const b = document.querySelector('[data-misura="1"]')?.getBoundingClientRect();
    if (!a || !b) return;
    const kx = (b.left - a.left) / 1920 || 1, ky = (b.top - a.top) / 1080 || 1;
    const testi: { testo: string; x: number; y: number; w: number; h: number; o: number }[] = [];
    const visti = new Set<Element>();
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      const svgText = el.closest('text');
      const foglia = svgText ?? el;
      if (visti.has(foglia)) continue;
      const proprio = svgText ? svgText.textContent ?? '' : Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('');
      if (!proprio.trim()) continue;
      visti.add(foglia);
      const q = foglia.getBoundingClientRect();
      const r = { left: (q.left - a.left) / kx, top: (q.top - a.top) / ky, right: (q.right - a.left) / kx, bottom: (q.bottom - a.top) / ky };
      const x0 = Math.max(0, r.left), y0 = Math.max(0, r.top), x1 = Math.min(1920, r.right), y1 = Math.min(1080, r.bottom);
      if (x1 - x0 < 4 || y1 - y0 < 4) continue;
      const o = visibile(foglia);
      if (o < 0.15) continue;
      testi.push({ testo: proprio.trim().slice(0, 40), x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(y1 - y0), o: Math.round(o * 100) / 100 });
    }
    console.log(`MISURA ${JSON.stringify({ frame, testi })}`);
  }, [frame, attiva]);
  if (!attiva) return null;
  const punto = { position: 'absolute', width: 1, height: 1, pointerEvents: 'none' } as const;
  return (
    <>
      <div data-misura="0" style={{ ...punto, left: 0, top: 0 }} />
      <div data-misura="1" style={{ ...punto, left: 1920, top: 1080 }} />
    </>
  );
};
