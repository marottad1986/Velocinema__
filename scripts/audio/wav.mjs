// Lettura di file WAV (PCM 16/24/32 bit o float 32, mono o stereo) in Float32Array per canale.
import { readFileSync } from 'node:fs';

/** Restituisce { sr, L, R } (R === L per i file mono). */
export const readWav = (path) => {
  const b = readFileSync(path);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WAVE') throw new Error(`Non è un WAV: ${path}`);
  let p = 12, fmt = null, data = null;
  while (p + 8 <= b.length) {
    const id = b.toString('ascii', p, p + 4);
    const size = b.readUInt32LE(p + 4);
    if (id === 'fmt ') {
      let format = b.readUInt16LE(p + 8);
      if (format === 0xfffe) format = b.readUInt16LE(p + 32); // WAVE_FORMAT_EXTENSIBLE: sottotipo
      fmt = { format, ch: b.readUInt16LE(p + 10), sr: b.readUInt32LE(p + 12), bits: b.readUInt16LE(p + 22) };
    } else if (id === 'data') {
      data = { start: p + 8, size: Math.min(size, b.length - p - 8) };
    }
    p += 8 + size + (size & 1);
  }
  if (!fmt || !data) throw new Error(`WAV incompleto: ${path}`);
  const { format, ch, sr, bits } = fmt;
  const bps = bits / 8;
  const n = Math.floor(data.size / (bps * ch));
  const chans = Array.from({ length: Math.min(ch, 2) }, () => new Float32Array(n));
  const read =
    format === 3 && bits === 32 ? (o) => b.readFloatLE(o)
      : bits === 16 ? (o) => b.readInt16LE(o) / 32768
        : bits === 24 ? (o) => b.readIntLE(o, 3) / 8388608
          : bits === 32 ? (o) => b.readInt32LE(o) / 2147483648
            : bits === 8 ? (o) => (b[o] - 128) / 128
              : null;
  if (!read) throw new Error(`Formato WAV non gestito (${format}, ${bits} bit): ${path}`);
  for (let i = 0; i < n; i++) {
    const o = data.start + i * bps * ch;
    for (let c = 0; c < chans.length; c++) chans[c][i] = read(o + c * bps);
  }
  return { sr, L: chans[0], R: chans[1] ?? chans[0] };
};
