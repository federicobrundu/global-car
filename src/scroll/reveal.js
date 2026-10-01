/**
 * Entrate delle sezioni durante lo scorrimento.
 *
 * Una sola entrata per contenitore: se il blocco entra, il suo contenuto è già
 * visibile quando arriva. Animare contenitore e figli insieme è l'anti-pattern
 * più comune e si vede.
 */

import { movimentoRidotto } from '../utils/motion.js';

const CLASSE_VISIBILE = 'e-visibile';

export function attivaEntrate(elementi) {
  // Con movimento ridotto tutto è già visibile, niente osservatori.
  if (movimentoRidotto()) {
    elementi.forEach((elemento) => elemento.classList.add(CLASSE_VISIBILE));
    return () => {};
  }

  const osservatore = new IntersectionObserver(
    (voci) => {
      for (const voce of voci) {
        if (!voce.isIntersecting) continue;
        voce.target.classList.add(CLASSE_VISIBILE);
        // Una volta entrato non serve più osservarlo
        osservatore.unobserve(voce.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  elementi.forEach((elemento) => osservatore.observe(elemento));
  return () => osservatore.disconnect();
}

/**
 * Parallasse leggera sull'auto della hero.
 * Si muove meno della pagina, così sembra più lontana. Solo `transform`.
 */
export function attivaParallasse(elemento, fattore = 0.12) {
  if (movimentoRidotto() || !elemento) return () => {};

  let inAttesa = false;

  function aggiorna() {
    inAttesa = false;
    const scorrimento = window.scrollY;
    // Oltre l'altezza della prima schermata non serve più calcolare
    if (scorrimento > window.innerHeight * 1.2) return;
    elemento.style.transform = `translate3d(0, ${scorrimento * fattore}px, 0)`;
  }

  function alloScorrimento() {
    if (inAttesa) return;
    inAttesa = true;
    requestAnimationFrame(aggiorna);
  }

  window.addEventListener('scroll', alloScorrimento, { passive: true });
  aggiorna();

  return () => window.removeEventListener('scroll', alloScorrimento);
}

/** L'intestazione diventa opaca dopo i primi pixel di scorrimento. */
export function attivaIntestazione(intestazione) {
  if (!intestazione) return () => {};

  let staccata = false;

  function controlla() {
    const deveEssereStaccata = window.scrollY > 24;
    if (deveEssereStaccata === staccata) return;
    staccata = deveEssereStaccata;
    intestazione.classList.toggle('e-staccata', staccata);
  }

  window.addEventListener('scroll', controlla, { passive: true });
  controlla();

  return () => window.removeEventListener('scroll', controlla);
}
