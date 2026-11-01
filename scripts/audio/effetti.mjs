// Effetti sonori registrati: archivio di Craig Smith (USC Cinema / Sunset Editorial, "SSE Library" e "Red Library"),
// CC0, ospitato su archive.org. Scaricati alla prima esecuzione in campioni/effetti/ (cartella ignorata da git).
// Ogni voce del catalogo è un file intero; lo spartito sceglie la presa con da/durata (secondi nel file).
import { existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { readWav } from './wav.mjs';
import { SR } from './synth.mjs';

const CACHE = 'campioni/effetti';

/** id → [item di archive.org, file, picco del file in dB (RMS su 10 ms): serve a normalizzare i volumi]. */
export const CATALOGO = {
  tuono_classico: ['Red_Library_Nature_Rain', 'R30-28-Classic Thunder Clap.wav', -21],
  tuono_breve: ['Red_Library_Nature_Rain', 'R30-29-Classic Thunder Clap.wav', -21],
  tuono_secco: ['Red_Library_Nature_Rain', 'R30-30-Classic Thunder Clap.wav', -21],
  tuono_forte: ['Red_Library_Nature_Rain', 'R22-13-Classic Thunder Strike.wav', -10],
  tuono_lontano: ['SSE_Library_WEATHER', 'THUNDER/THUN_Thunderclap; strong; distant; could be explo_CS_USC.wav', -9],
  pioggia_vento: ['Red_Library_Nature_Rain', 'R10-04-Heavy Rain and Wind.wav', -8],
  vento_fischio: ['SSE_Library_WIND', 'GENERAL/WIND_Whistling wind; good rumble_CS_USC.wav', -10],
  vento_invernale: ['Red_Library_Nature_Wind', 'R27-28-Big Cold Winter Wind.wav', -21],
  vento_raffiche: ['Red_Library_Nature_Wind', 'R22-11-Blustery Wind Loop.wav', -6],
  vento_leggero: ['SSE_Library_WIND', 'GENERAL/WIND_Steady wind_CS_USC.wav', -30],
  serratura: ['SSE_Library_MECHANICAL', 'LOCK/MECHLock_Lock opens; could be door; gun or other small_CS_USC.wav', -16],
  metallo_cade: ['SSE_Library_METAL', 'IMPACT/METLImpt_Metal objects hitting and fall_CS_USC.wav', -16],
  cancello: ['Red_Library_Doors', 'R26-04-Castle Door or Gate.wav', -12],
  colpi_legno: ['Red_Library_Doors', 'R09-12-Wooden Thuds and Slams.wav', -12],
  martelletto: ['SSE_Library_TOOLS', 'HAND/TOOLHand_Gavel pounding short & long_CS_USC.wav', -13],
  tintinnio: ['Red_Library_Foley_Props_1', 'R15-86-Clinking and Bottle Down.wav', -16],
  monete: ['Red_Library_Foley_Props_1', 'R15-81-Metal Clanking Coins.wav', -16],
  pagine: ['Red_Library_Foley_Props_2', 'R17-54-Turning Magazine Pages.wav', -14],
  sedia: ['Red_Library_Foley_Props_2', 'R21-40a-Bed or Chair Movement.wav', -18],
  aereo: ['SSE_Library_AIRCRAFT', 'PROP/AEROProp_L5 airplane flying in and passing close by_CS_USC.wav', -9],
  motorino: ['Red_Library_Motorcycles', 'R16-61-Small Motorbike.wav', -25],
  fuoco: ['Red_Library_Fire', 'R09-67-Small Crackling Fire.wav', -19],
  fiammata: ['SSE_Library_FIRE', 'WHOOSH/FIREWhsh_Flare whoosh_CS_USC.wav', -8],
  telo: ['Red_Library_Foley_Props_3', 'R24-18-Tent or Tarp Whoosh.wav', -13],
  stoffa: ['Red_Library_Foley_Props_5', 'R27-32-Heavy Cloth Fluttering or Torch.wav', -11],
  // Interstellar
  razzo: ['SSE_Library_AIRCRAFT', 'ROCKET/AERORckt_Atlas missile launch_CS_USC.wav', -10],
  rombo: ['Red_Library_Nature_Rain', 'R27-29-Good Heavy Rumble.wav', -18],
  onde_tonanti: ['Red_Library_Water_1', 'R23-21-Thunderous Waves.wav', -22],
  vento_artico: ['SSE_Library_WIND', 'GENERAL/WIND_Cold Arctic wind_CS_USC.wav', -17],
  ghiaccio_frana: ['SSE_Library_NATURAL_DISASTER', 'AVALANCHE/NATDAval_Ice avalanche sliding & breaking up; weird_CS_USC.wav', -7],
  ghiaccio_crollo: ['SSE_Library_ICE', 'CRASH & DEBRIS/ICECrsh_Dropping large piece of ice onto cement;_CS_USC.wav', -18],
  esplosioni: ['Red_Library_Explosions', 'R11-54-Thunderous Blasts.wav', -21],
  metallo_colpi: ['SSE_Library_METAL', 'IMPACT/METLImpt_Metal hits against metal; foley_CS_USC.wav', -9],
  metallo_schianto: ['SSE_Library_METAL', 'CRASH & DEBRIS/METLCrsh_Large hard metal crash; optical_CS_USC.wav', -17],
  legno_cade: ['SSE_Library_WOOD', 'IMPACT/WOODImpt_Wooden object falls but does not break_CS_USC.wav', -12],
  portone_motore: ['SSE_Library_DOORS', 'ELECTRIC/DOORElec_Electric garage door motor open & close_CHS_USC.wav', -23],
  scatti: ['SSE_Library_MECHANICAL', 'CLICK/MECHClik_Metal clicks; several takes_CS_USC.wav', -14],
  passaggio: ['SSE_Library_SWOOSHES', 'WHOOSH/WHSH_Scifi swish by_CS_USC.wav', -10],
  disturbo: ['SSE_Library_COMMUNICATIONS', 'STATIC/COMStatic_Shortwave radio with electrical noises &_CS_USC.wav', -16],
  // The Truman Show
  radio_sintonia: ['SSE_Library_COMMUNICATIONS', 'RADIO/COMRadio_Small transistor radio scanning the dial_CHS_USC.wav', -16],
  vetro_lastra: ['SSE_Library_GLASS', 'CRASH & DEBRIS/GLASCrsh_Large pane of glass breaks; dull; sweetener_CS_USC.wav', -21],
  vetri: ['SSE_Library_GLASS', 'CRASH & DEBRIS/GLASCrsh_Small glass breaks_CS_USC.wav', -11],
  pioggia_dura: ['Red_Library_Nature_Rain', 'R22-21-Rain on Hard Surface.wav', -10],
  onde: ['Red_Library_Water_1', 'R09-77-Waves and Splashes.wav', -17],
  colpi_cavi: ['Red_Library_Impacts', 'R28-55-Thumps on Large Hollow Wooden Surface.wav', -14],
  porta_cigolio: ['Red_Library_Creaks', 'R09-16-Long Door Squeak.wav', -24],
  applauso: ['Red_Library_Crowds_Applause', 'R02-04-Steady Applause.wav', -21],
  applauso_breve: ['Red_Library_Crowds_Applause', 'R02-06-Medium Crowd Applause.wav', -21],
  // Frankenstein Junior
  ceramica: ['SSE_Library_CERAMICS', 'CRASH & DEBRIS/CERMCrsh_Pottery fall and breaks; several takes_CS_USC.wav', -14],
  sacchi: ['Red_Library_Impacts', 'R28-56-Sand Bags Dropped onto Wood Floor.wav', -17],
  legno_cigolio: ['Red_Library_Creaks', 'R04-51-Creaky Wood.wav', -19],
  porta_sbatte: ['Red_Library_Creaks', 'R09-19-Squeaky Door SLam.wav', -16],
  scariche: ['SSE_Library_ELECTRICITY', 'ARC/ELECArc_Electrical arcing and sparking_CS_USC.wav', -21],
  ronzio_tesla: ['SSE_Library_ELECTRICITY', 'BUZZ & HUM/ELECBuzz_Tesla coil hum_CHS_USC.wav', -22],
  scintille: ['SSE_Library_ELECTRICITY', 'SPARKS/ELECSprk_Tesla coil sparking and humming_CHS_USC.wav', -18],
  lupo: ['SSE_Library_ANIMALS', 'DOG WILD/ANMLWdog_Wolf howls with reverb_CS_USC.wav', -8],
  nitriti: ['Red_Library_Animals_Horses_1', 'R12-55-Small Horse Whinnies.wav', -23],
  nitriti_paura: ['Red_Library_Animals_Horses_1', 'R13-02-Scared Neighs.wav', -21],
  campana_grave: ['Red_Library_Bells_Horns_Whistles', 'R04-42-Deep Bell.wav', -20],
  campane_festa: ['Red_Library_Bells_Horns_Whistles', 'R28-05-Many Church Bells Ring.wav', -19],
  fiammifero: ['Red_Library_Foley_Props_1', 'R16-13-Match Being Struck and Lit.wav', -15],
  catene: ['SSE_Library_CHAINS', 'MOVEMENT/CHAINMvmt_Rattling chains or spurs; high metal clinks_CS_USC.wav', -10],
  carro: ['SSE_Library_VEHICLES', 'WAGON/VEHWagn_Large wood rattles; wagon hitting big bumps_CS_USC.wav', -12],
  torcia: ['Red_Library_Fire', 'R27-33-Torch Pulled Back and Forth.wav', -19],
  // La La Land
  campanello: ['Red_Library_Bells_Horns_Whistles', 'R04-36-Small Bell.wav', -20],
  campanello_negozio: ['Red_Library_Bells_Horns_Whistles', 'R04-62-Shop Bell.wav', -22],
  clacson: ['Red_Library_Bells_Horns_Whistles', 'R12-45-Car Horn Beeps.wav', -21],
  traffico_clacson: ['SSE_Library_VEHICLES', 'HORN/VEHHorn_Many car horns in traffic jam_CS_USC.wav', -20],
  tacchi: ['Red_Library_Footsteps_1', 'R10-16-High Heels on Wooden Floor.wav', -9],
  voci_caffe: ['SSE_Library_CROWDS', 'MISC/CRWDWalla-CAFE_Light cafe background walla; could be party;_CS_USC.wav', -8],
  voci_sala: ['SSE_Library_CROWDS', 'CONVERSATION/CRWDConv_Interior crowd walla; men & women; polite_CS_USC.wav', -14],
  fischio_vapore: ['Red_Library_Bells_Horns_Whistles', 'R20-28-Steam Whistle.wav', -23],
  treno_vapore: ['SSE_Library_TRAINS', 'STEAM/TRNSteam_Steam engine train starts and pulls away_CS_USC.wav', -10],
  gufo: ['Red_Library_Animals_Birds', 'R01-27-Great Horned Owl Hoot.wav', -19],
  ali: ['Red_Library_Animals_Birds', 'R21-40b-Bird Wings Flapping.wav', -14],
  ringhio: ['Red_Library_Animals_Dogs', 'R11-45-Growling Dog.wav', -18],
  sirena_nebbia: ['SSE_Library_HORNS', 'AIR POWERED/HORNAir_Fog horn with echo_CS_USC.wav', -18],
  macchina_scrivere: ['Red_Library_Communications', 'R20-10-Fast Typing on Manual Typewriter.wav', -18.6],
  giornale: ['Red_Library_Foley_Props_1', 'R15-04-Newspaper Being Opened.wav', -18],
  ronzio_neon: ['Red_Library_Sci-Fi', 'R21-41-Electric Light Hum.wav', -15],
  auto_epoca: ['SSE_Library_VEHICLES', 'CAR/VEHCar_Large 1946 buick with bad exhaust by slowly_CS_USC.wav', -6.4],
  risacca: ['SSE_Library_WATER', 'SURF/WATRSurf_Surf; medium distance; loopable_CS_USC.wav', -9],
};

const percorso = (id) => `${CACHE}/${CATALOGO[id][0]}/${CATALOGO[id][1].replace(/[/;?]/g, '_')}`;

/** Scarica gli effetti mancanti (curl, presente anche in Windows 10+). */
export const scaricaEffetti = (ids) => {
  const mancanti = ids.filter((id) => {
    if (!CATALOGO[id]) throw new Error(`Effetto sconosciuto: ${id}`);
    return !existsSync(percorso(id));
  });
  if (!mancanti.length) return;
  console.log(`Scarico ${mancanti.length} effetti sonori (archive.org, CC0) in ${CACHE}/ (solo la prima volta)…`);
  for (const id of mancanti) {
    const [item, file] = CATALOGO[id];
    const dest = percorso(id);
    mkdirSync(dest.slice(0, dest.lastIndexOf('/')), { recursive: true });
    const url = `https://archive.org/download/${item}/${file.split('/').map(encodeURIComponent).join('/')}`;
    const res = spawnSync('curl', ['-fsSL', '--retry', '3', '-o', dest, url], { stdio: 'inherit' });
    if (res.error) throw new Error(`curl non trovato: serve per scaricare gli effetti (${res.error.message})`);
    if (res.status !== 0) throw new Error(`Download fallito: ${url}`);
  }
};

const memoria = new Map();
const carica = (id) => {
  if (!memoria.has(id)) {
    const w = readWav(percorso(id));
    // mono (ultimo canale ignorato se stereo: le prese di questo archivio sono mono)
    memoria.set(id, { sr: w.sr, x: w.L });
  }
  return memoria.get(id);
};

/**
 * Suona un tratto di registrazione: da/durata in secondi nel file; t = istante nel film.
 * fadeIn/fadeOut in secondi; gain lineare rispetto al picco del file portato a -6 dB (gain 1 = colpo pieno); lp = passa-basso (Hz) per suoni attutiti o lontani;
 * rate = velocità (cambia anche il tono); largo = per i tappeti (vento, pioggia): il canale destro legge
 * lo stesso file spostato di largo secondi, così il suono si apre in stereo.
 */
export const clip = (mix, id, { t, da = 0, durata, gain = 1, pan = 0, rev = 0.15, fadeIn = 0.005, fadeOut = 0.05, lp = 0, rate = 1, largo = 0 }) => {
  if (globalThis.VELOCINEMA_STEM === 'musica') return; // scripts/livelli.mjs: misura della sola musica
  const { sr, x } = carica(id);
  const step = (sr / SR) * rate;
  const dur = durata ?? (x.length / sr - da);
  const len = Math.ceil((dur * SR) / rate);
  const read = (pos) => {
    const k = Math.floor(pos), f = pos - k;
    return k >= 0 && k + 1 < x.length ? x[k] + (x[k + 1] - x[k]) * f : 0;
  };
  const a = lp ? 1 - Math.exp((-2 * Math.PI * lp) / SR) : 1;
  const z = [0, 0, 0, 0]; // passa-basso a due poli per canale
  const s0 = Math.round(t * SR);
  const p0 = da * sr;
  const off = largo * sr;
  const g = gain * 10 ** ((-6 - CATALOGO[id][2]) / 20);
  const gl = g * Math.min(1, Math.SQRT2 * Math.cos(((pan + 1) * Math.PI) / 4));
  const gr = g * Math.min(1, Math.SQRT2 * Math.sin(((pan + 1) * Math.PI) / 4));
  for (let i = 0; i < len; i++) {
    const k = s0 + i;
    if (k < 0) continue;
    if (k >= mix.n) break;
    const u = i / SR;
    const env = Math.min(1, u / Math.max(1e-4, fadeIn / rate), (len - i) / SR / Math.max(1e-4, fadeOut / rate));
    const pos = p0 + i * step;
    let l = read(pos), r = largo ? read(pos + off >= x.length ? pos - off : pos + off) : l;
    if (lp) {
      z[0] += a * (l - z[0]); z[1] += a * (z[0] - z[1]); l = z[1];
      z[2] += a * (r - z[2]); z[3] += a * (z[2] - z[3]); r = z[3];
    }
    l *= env * gl; r *= env * gr;
    mix.L[k] += l; mix.R[k] += r;
    mix.rL[k] += l * rev; mix.rR[k] += r * rev;
  }
};
