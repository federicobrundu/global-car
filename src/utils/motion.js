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

/** Progresso 0..1 sull'intera pagina: la linea del tempo del viaggio. */
export function progressoPagina() {
  const massimo = document.documentElement.scrollHeight - window.innerHeight;
  if (massimo <= 1) return 0;
  return limita(window.scrollY / massimo, 0, 1);
}

/**
 * Interpola tra fotogrammi chiave (p da 0 a 1) con smoothstep.
 * Ogni fotogramma è un oggetto di numeri o vettori [x,y,z].
 */
export function interpolaFotogrammi(fotogrammi, p) {
  const progresso = limita(p, 0, 1);
  let i = 0;
  while (i < fotogrammi.length - 1 && fotogrammi[i + 1].p <= progresso) i += 1;
  const a = fotogrammi[i];
  const b = fotogrammi[Math.min(i + 1, fotogrammi.length - 1)];
  if (a === b || a.p === b.p) return a;

  const t = (progresso - a.p) / (b.p - a.p);
  const s = t * t * (3 - 2 * t);
  const mix = (x, y) => x + (y - x) * s;

  const risultato = { p: progresso };
  for (const chiave of Object.keys(a)) {
    if (chiave === 'p') continue;
    const va = a[chiave];
    const vb = b[chiave];
    if (Array.isArray(va) && Array.isArray(vb)) {
      risultato[chiave] = va.map((n, k) => mix(n, vb[k]));
    } else if (typeof va === 'number' && typeof vb === 'number') {
      risultato[chiave] = mix(va, vb);
    } else {
      risultato[chiave] = s < 0.5 ? va : vb;
    }
  }
  return risultato;
}
