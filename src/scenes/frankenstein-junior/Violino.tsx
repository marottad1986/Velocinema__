import React from 'react';

// Violino visto di fronte, manico in alto (centro della cassa in 0,0; alto circa 220 px a scala 1).
export const Violino: React.FC<{ outline: string; scale?: number }> = ({ outline: K, scale = 1 }) => (
  <g transform={`scale(${scale})`}>
    <rect x="-7" y="-150" width="14" height="96" rx="4" fill="#2A1E16" stroke={K} strokeWidth="5" />
    <path d="M0 -150 c-14 0 -16 -18 -4 -22 c10 -3 14 8 6 12" fill="none" stroke={K} strokeWidth="6" strokeLinecap="round" />
    <path d="M0 -60 C-30 -60 -46 -50 -46 -26 C-46 -10 -34 -4 -30 0 C-34 4 -50 14 -50 36 C-50 62 -26 74 0 74 C26 74 50 62 50 36 C50 14 34 4 30 0 C34 -4 46 -10 46 -26 C46 -50 30 -60 0 -60 Z" fill="#9A6236" stroke={K} strokeWidth="6" />
    <path d="M-30 -40 C-38 -30 -36 -16 -26 -10" fill="none" stroke="#D49A62" strokeWidth="4" opacity=".7" />
    <path d="M-16 4 q-6 12 0 26 M16 4 q6 12 0 26" fill="none" stroke={K} strokeWidth="4" strokeLinecap="round" />
    <path d="M-12 18 H12" stroke={K} strokeWidth="5" />
    <path d="M-8 44 L-6 70 H6 L8 44 Z" fill="#2A1E16" stroke={K} strokeWidth="3" />
    <path d="M-3 -150 V44 M3 -150 V44" stroke="#E8DCC0" strokeWidth="1.5" opacity=".8" />
  </g>
);
