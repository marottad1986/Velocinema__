import { loadFont as loadBricolage } from '@remotion/google-fonts/BricolageGrotesque';
import { loadFont as loadFigtree } from '@remotion/google-fonts/Figtree';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadCaveat } from '@remotion/google-fonts/Caveat';
import { loadFont as loadCreepster } from '@remotion/google-fonts/Creepster';
import { loadFont as loadSyncopate } from '@remotion/google-fonts/Syncopate';
import { loadFont as loadInstrument } from '@remotion/google-fonts/InstrumentSerif';

export const DISPLAY = loadBricolage('normal', { weights: ['800'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const SANS = loadFigtree('normal', { weights: ['400', '800'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const ANTON = loadAnton('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] }).fontFamily;
/** Scrittura a mano (gesso, biglietti). */
export const HAND = loadCaveat('normal', { weights: ['700'], subsets: ['latin', 'latin-ext'] }).fontFamily;
/** Titolo horror anni '30 (Frankenstein Junior). */
export const CREEPSTER = loadCreepster('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily;
/** Titolo spaziale, maiuscole larghe (Interstellar). */
export const SYNCOPATE = loadSyncopate('normal', { weights: ['700'], subsets: ['latin'] }).fontFamily;
/** Titolo serif elegante (serie dei quadri: copertina e finale). */
export const SERIF = loadInstrument('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] }).fontFamily;
loadInstrument('italic', { weights: ['400'], subsets: ['latin', 'latin-ext'] });
