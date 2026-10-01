/**
 * LIVELLI DI QUALITÀ — la regola di degradazione del Modulo 5.
 *
 * Il principio: non esiste una versione unica del sito. Esiste una scala di
 * qualità, e il sito sceglie il gradino giusto per il dispositivo che lo sta
 * aprendo. Non si toglie l'effetto sul mobile: si toglie il costo mantenendo
 * l'effetto.
 *
 * Il criterio non è solo "è un telefono": sono larghezza schermo, core
 * disponibili e — la tecnica più affidabile — misurare i fotogrammi nei primi
 * secondi e abbassare la qualità se la scena non regge.
 */

// ---- Parametri dichiarati in cima, così il blocco è riusabile ----
const LIVELLI = {
  alto: {
    nome: 'alto',
    particelle: 9000,
    segmentiSuperficie: 160,
    pixelRatioMassimo: 2,
    luciAggiuntive: true,
    risoluzioneAmbiente: 256,
  },
  medio: {
    nome: 'medio',
    particelle: 4000,
    segmentiSuperficie: 110,
    pixelRatioMassimo: 1.75,
    luciAggiuntive: true,
    risoluzioneAmbiente: 128,
  },
  basso: {
    nome: 'basso',
    particelle: 1500,
    segmentiSuperficie: 64,
    pixelRatioMassimo: 1.5,
    luciAggiuntive: false,
    risoluzioneAmbiente: 128,
  },
};

const SOGLIA_FPS = 42; // sotto questa media nei primi secondi si scende di livello
const DURATA_MISURA_MS = 3000;

/** Sceglie il livello di partenza da larghezza schermo, core CPU e memoria. */
export function rilevaLivello() {
  const larghezza = window.innerWidth;
  const core = navigator.hardwareConcurrency ?? 4;
  const memoria = navigator.deviceMemory ?? 4;

  if (larghezza < 700 || core <= 4 || memoria <= 2) return LIVELLI.basso;
  if (larghezza < 1280 || core <= 8) return LIVELLI.medio;
  return LIVELLI.alto;
}

export function livelloInferiore(livello) {
  if (livello.nome === 'alto') return LIVELLI.medio;
  if (livello.nome === 'medio') return LIVELLI.basso;
  return LIVELLI.basso;
}

/**
 * Misura gli FPS nei primi secondi e chiama `alDegrado` se la scena non regge.
 * È la parte che distingue un lavoro professionale da una demo: il sito si
 * auto-regola invece di sperare che il dispositivo sia abbastanza potente.
 */
export function controllaPrestazioni(alDegrado) {
  let fotogrammi = 0;
  let inizio = null;
  let attivo = true;

  function conta(ora) {
    if (!attivo) return;
    if (inizio === null) inizio = ora;
    fotogrammi += 1;

    const trascorso = ora - inizio;
    if (trascorso >= DURATA_MISURA_MS) {
      const fpsMedi = (fotogrammi / trascorso) * 1000;
      attivo = false;
      if (fpsMedi < SOGLIA_FPS) alDegrado(fpsMedi);
      return;
    }
    requestAnimationFrame(conta);
  }

  requestAnimationFrame(conta);
  return () => {
    attivo = false;
  };
}

/** WebGL può mancare: nei browser interni ad alcune app social succede. */
export function webglDisponibile() {
  try {
    const tela = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (tela.getContext('webgl2') || tela.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

export { LIVELLI };
