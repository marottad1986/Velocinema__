import { loadFont as loadBricolage } from '@remotion/google-fonts/BricolageGrotesque';
import { loadFont as loadFigtree } from '@remotion/google-fonts/Figtree';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadCaveat } from '@remotion/google-fonts/Caveat';

export const DISPLAY = loadBricolage('normal', { weights: ['800'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const SANS = loadFigtree('normal', { weights: ['400', '800'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const ANTON = loadAnton('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] }).fontFamily;
/** Scrittura a mano (gesso, biglietti). */
export const HAND = loadCaveat('normal', { weights: ['700'], subsets: ['latin', 'latin-ext'] }).fontFamily;
