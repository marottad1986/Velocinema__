import { loadFont as loadBricolage } from '@remotion/google-fonts/BricolageGrotesque';
import { loadFont as loadFigtree } from '@remotion/google-fonts/Figtree';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadCaveat } from '@remotion/google-fonts/Caveat';
import { loadFont as loadCreepster } from '@remotion/google-fonts/Creepster';
import { loadFont as loadSyncopate } from '@remotion/google-fonts/Syncopate';
import { loadFont as loadBigShouldersStencil } from '@remotion/google-fonts/BigShouldersStencil';
import { loadFont as loadBebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadCinzel } from '@remotion/google-fonts/Cinzel';
import { loadFont as loadInstrument } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';

export const DISPLAY = loadBricolage('normal', { weights: ['800'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const SANS = loadFigtree('normal', { weights: ['400', '800'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const ANTON = loadAnton('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] }).fontFamily;
/** Scrittura a mano (gesso, biglietti). */
export const HAND = loadCaveat('normal', { weights: ['700'], subsets: ['latin', 'latin-ext'] }).fontFamily;
/** Titolo horror anni '30 (Frankenstein Junior). */
export const CREEPSTER = loadCreepster('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily;
/** Titolo spaziale, maiuscole larghe (Interstellar). */
export const SYNCOPATE = loadSyncopate('normal', { weights: ['700'], subsets: ['latin'] }).fontFamily;
/** Titolo classico da libro antico (Harry Potter). */
export const CINZEL = loadCinzel('normal', { weights: ['700'], subsets: ['latin'] }).fontFamily;
/** Titolo a stampino, stretto e alto (Dark). */
export const STENCIL = loadBigShouldersStencil('normal', { weights: ['800'], subsets: ['latin'] }).fontFamily;
/** Titolo alto e condensato, da progetto (Inception). */
export const BEBAS = loadBebas('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] }).fontFamily;
/** Titolo serif elegante (serie dei quadri: copertina e finale). */
export const SERIF = loadInstrument('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] }).fontFamily;
loadInstrument('italic', { weights: ['400'], subsets: ['latin', 'latin-ext'] });
/** Titolo da teatro d'opera, grazie alte (Bohemian Rhapsody). */
export const PLAYFAIR = loadPlayfair('normal', { weights: ['900'], subsets: ['latin', 'latin-ext'] }).fontFamily;
