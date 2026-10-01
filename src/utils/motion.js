/**
 * Utilità di movimento condivise.
 *
 * Qui sta la cosa che fa la differenza tra un sito amatoriale e uno
 * professionale: un oggetto che segue il mouse istantaneamente sembra un
 * difetto, lo stesso oggetto che insegue con un ritardo e si assesta
 * dolcemente sembra materia. Tecnicamente è interpolazione.
 */

/** Interpolazione lineare: avvicina `attuale` a `obiettivo` di una frazione. */
export function lerp(attuale, obiettivo, frazione) {
  return attuale + (obiettivo - attuale) * frazione;
}

/**
 * Interpolazione indipendente dal frame rate.
 * Senza questo, lo smorzamento è più rapido sui monitor a 144 Hz che a 60 Hz.
 */
export function smorza(attuale, obiettivo, velocita, delta) {
  return lerp(attuale, obiettivo, 1 - Math.exp(-velocita * delta));
}

export function limita(valore, minimo, massimo) {
  return Math.min(massimo, Math.max(minimo, valore));
}

/** Riporta `valore` da un intervallo a 0..1, con limiti. */
export function normalizza(valore, da, a) {
  if (a === da) return 0;
  return limita((valore - da) / (a - da), 0, 1);
}

/** L'utente ha chiesto al sistema operativo di ridurre le animazioni. */
export function movimentoRidotto() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Progresso di scorrimento di un elemento, da 0 a 1.
 * 0 = l'elemento sta entrando dal basso, 1 = è appena uscito in alto.
 */
export function progressoScorrimento(elemento) {
  const rettangolo = elemento.getBoundingClientRect();
  const altezzaFinestra = window.innerHeight;
  const totale = rettangolo.height + altezzaFinestra;
  const percorso = altezzaFinestra - rettangolo.top;
  return limita(percorso / totale, 0, 1);
}
