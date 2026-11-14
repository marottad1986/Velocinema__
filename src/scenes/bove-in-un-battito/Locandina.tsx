import React from 'react';
import type { PosterProps } from '../../types';

export const Copertina: React.FC<PosterProps> = ({ film }) => <div style={{ position: 'absolute', inset: 0, background: film.palette.scuro }} />;
export const Finale: React.FC<PosterProps> = ({ film }) => <div style={{ position: 'absolute', inset: 0, background: film.palette.scuro }} />;
