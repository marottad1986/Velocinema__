// Funzioni pure del tempo: ogni fotogramma dipende solo da t (rendering deterministico).

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** Avanzamento 0..1 di t nell'intervallo [a, b]. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const eo = (p: number) => 1 - (1 - p) ** 3;
export const eio = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
/** Ease-out con rimbalzo (back). */
export const eob = (p: number, s = 1.7) => 1 + (s + 1) * (p - 1) ** 3 + s * (p - 1) ** 2;
/** Resto sempre positivo. */
export const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Generatore pseudo-casuale con seme (stessi numeri a ogni render). */
export const rng = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

/**
 * Camera standard di QUALITA.md: pan laterale ±40 px e zoom 1,04 → 1,09 su tutta la scena.
 * `layer(f)` restituisce la traslazione di un piano con fattore di parallasse f.
 */
export const camera = (t: number, dur: number, cx = 540, cy = 1000) => {
  const p = eio(seg(t, 0, dur));
  const pan = lerp(-40, 40, p);
  const zoom = lerp(1.04, 1.09, p);
  return {
    pan,
    zoom,
    transform: `translate(${cx} ${cy}) scale(${zoom}) translate(${-cx} ${-cy})`,
    layer: (f: number, dx = 0, dy = 0) => `translate(${(-pan * f + dx).toFixed(2)} ${dy.toFixed(2)})`,
  };
};

/** Percorso di onda ripetibile (periodo `w`), da x0 a x1, alla quota y. */
export const wavePath = (y: number, amp: number, w: number, x0 = -400, x1 = 1560, close?: number) => {
  let d = `M${x0} ${y}`;
  for (let x = x0; x < x1; x += w) d += ` q${w / 4} ${-amp} ${w / 2} 0 q${w / 4} ${amp} ${w / 2} 0`;
  if (close !== undefined) d += ` V${close} H${x0} Z`;
  return d;
};

/** Gocce di pioggia come un unico path (seme fisso). */
export const rainPath = (n: number, seed: number, len: number, dx: number, w = 1300, h = 1500) => {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = r() * w - 110;
    const y = r() * h;
    d += `M${x.toFixed(0)} ${y.toFixed(0)} l${-dx} ${len} `;
  }
  return d;
};

export const fmtTime = (s: number) => {
  const k = Math.max(0, Math.floor(s));
  return `${Math.floor(k / 60)}:${String(k % 60).padStart(2, '0')}`;
};
