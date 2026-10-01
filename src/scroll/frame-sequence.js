/**
 * SEQUENZA DI FOTOGRAMMI LEGATA ALLO SCORRIMENTO — Modulo 10.
 *
 * Perché non un video: quando colleghi la posizione della pagina al punto del
 * video, il browser deve saltare avanti e indietro nel filmato. La maggior parte
 * dei fotogrammi non esiste come immagine intera ma come differenza rispetto ai
 * precedenti, quindi va ricostruita. Il risultato è il classico movimento a
 * scatti che tutti attribuiscono a "telefono lento".
 *
 * Con una sequenza di immagini ogni posizione corrisponde a un fotogramma già
 * pronto: lo scorrimento è fluido in avanti e indietro, non ci sono regole di
 * riproduzione automatica da rispettare, e il controllo è totale.
 *
 * La sequenza è più leggera del video SOLO se si applicano tutte e tre le regole
 * insieme: pochi fotogrammi, risoluzione adeguata allo spazio reale, formato
 * moderno con compressione aggressiva.
 */

import { limita, progressoScorrimento, movimentoRidotto } from '../utils/motion.js';

// ---- Parametri del blocco ----
const CONFIG = {
  desktop: { cartella: 'desktop', quantita: 30, larghezza: 1080 },
  mobile: { cartella: 'mobile', quantita: 20, larghezza: 720 },
  sogliaMobile: 820,
  base: 'assets/frames',
  estensione: 'webp',
};

/**
 * @param {HTMLCanvasElement} tela
 * @param {HTMLElement} sezione contenitore che definisce il percorso di scroll
 * @param {NodeListOf<HTMLElement>} passaggi blocchi di testo da evidenziare
 */
export function creaSequenzaPercorso(tela, sezione, passaggi) {
  const serie = window.innerWidth < CONFIG.sogliaMobile ? CONFIG.mobile : CONFIG.desktop;
  const contesto = tela.getContext('2d', { alpha: false });
  if (!contesto) return null;

  const immagini = new Array(serie.quantita).fill(null);
  let caricate = 0;
  let indiceDisegnato = -1;
  let inAttesaDiFotogramma = false;
  let visibile = false;
  let smaltita = false;

  const percorsoBase = import.meta.env.BASE_URL ?? '/';

  function urlFotogramma(indice) {
    const numero = String(indice + 1).padStart(3, '0');
    return `${percorsoBase}${CONFIG.base}/${serie.cartella}/frame-${numero}.${CONFIG.estensione}`;
  }

  // ---- Caricamento progressivo ----
  // Prima il fotogramma iniziale, che è quello che si vede subito; gli altri
  // mentre il visitatore legge le sezioni precedenti.
  function caricaFotogramma(indice) {
    return new Promise((risolvi) => {
      const immagine = new Image();
      immagine.decoding = 'async';
      immagine.onload = () => {
        immagini[indice] = immagine;
        caricate += 1;
        risolvi(true);
      };
      immagine.onerror = () => risolvi(false);
      immagine.src = urlFotogramma(indice);
    });
  }

  async function caricaTutto() {
    const primoDisponibile = await caricaFotogramma(0);

    // Se il primo fotogramma non esiste, la sequenza non è ancora stata
    // generata: si lascia il fondo del CSS e non si insiste.
    if (!primoDisponibile) {
      tela.dataset.sequenzaAssente = 'true';
      return;
    }

    ridimensiona();
    disegna(0);

    // Gli altri a blocchi di quattro, per non saturare le connessioni
    for (let i = 1; i < serie.quantita; i += 4) {
      const gruppo = [];
      for (let j = i; j < Math.min(i + 4, serie.quantita); j += 1) {
        gruppo.push(caricaFotogramma(j));
      }
      await Promise.all(gruppo);
    }
  }

  // ---- Disegno ----
  function ridimensiona() {
    const rapportoPixel = Math.min(window.devicePixelRatio, 2);
    const larghezza = tela.clientWidth;
    const altezza = tela.clientHeight;
    if (larghezza === 0 || altezza === 0) return;

    tela.width = Math.round(larghezza * rapportoPixel);
    tela.height = Math.round(altezza * rapportoPixel);
    indiceDisegnato = -1; // forza il ridisegno
  }

  /** Copre la tela mantenendo le proporzioni, come `object-fit: cover`. */
  function disegna(indice) {
    const immagine = immagini[indice] ?? trovaPiuVicina(indice);
    if (!immagine) return;

    const scala = Math.max(
      tela.width / immagine.naturalWidth,
      tela.height / immagine.naturalHeight
    );
    const larghezza = immagine.naturalWidth * scala;
    const altezza = immagine.naturalHeight * scala;

    contesto.drawImage(
      immagine,
      (tela.width - larghezza) / 2,
      (tela.height - altezza) / 2,
      larghezza,
      altezza
    );
    indiceDisegnato = indice;
  }

  /** Finché il caricamento è in corso si mostra il fotogramma più vicino. */
  function trovaPiuVicina(indice) {
    for (let distanza = 1; distanza < serie.quantita; distanza += 1) {
      if (immagini[indice - distanza]) return immagini[indice - distanza];
      if (immagini[indice + distanza]) return immagini[indice + distanza];
    }
    return null;
  }

  // ---- Collegamento allo scorrimento ----
  function aggiorna() {
    inAttesaDiFotogramma = false;
    if (smaltita || !visibile || caricate === 0) return;

    // La pagina diventa la linea del tempo dell'animazione.
    // Si usa la porzione centrale del percorso, così la sequenza non parte
    // prima che la sezione sia davvero in vista.
    const grezzo = progressoScorrimento(sezione);
    const progresso = limita((grezzo - 0.12) / 0.76, 0, 1);

    const indice = Math.round(progresso * (serie.quantita - 1));
    if (indice !== indiceDisegnato) disegna(indice);

    evidenziaPassaggio(progresso);
  }

  /** Ogni sezione di testo ha il suo momento di quiete (Modulo 3.3). */
  function evidenziaPassaggio(progresso) {
    if (passaggi.length === 0) return;
    const attivo = Math.min(
      passaggi.length - 1,
      Math.floor(progresso * passaggi.length)
    );
    passaggi.forEach((passaggio, indice) => {
      passaggio.classList.toggle('e-attivo', indice === attivo);
    });
  }

  function alloScorrimento() {
    if (inAttesaDiFotogramma) return;
    inAttesaDiFotogramma = true;
    requestAnimationFrame(aggiorna);
  }

  // ---- Visibilità: niente lavoro quando la sezione non è a schermo ----
  const osservatore = new IntersectionObserver(
    (voci) => {
      visibile = voci[0].isIntersecting;
      if (visibile) alloScorrimento();
    },
    { rootMargin: '150px 0px' }
  );
  osservatore.observe(sezione);

  const osservatoreDimensioni = new ResizeObserver(() => {
    ridimensiona();
    alloScorrimento();
  });
  osservatoreDimensioni.observe(tela);

  window.addEventListener('scroll', alloScorrimento, { passive: true });

  caricaTutto();

  // Con movimento ridotto la sequenza resta ferma sul primo fotogramma e il
  // primo passaggio è evidenziato: il contenuto c'è tutto, senza movimento.
  if (movimentoRidotto()) {
    window.removeEventListener('scroll', alloScorrimento);
    osservatore.disconnect();
    passaggi.forEach((passaggio, indice) => {
      passaggio.classList.toggle('e-attivo', indice === 0);
    });
  }

  return {
    smaltisci() {
      smaltita = true;
      window.removeEventListener('scroll', alloScorrimento);
      osservatore.disconnect();
      osservatoreDimensioni.disconnect();
    },
  };
}
