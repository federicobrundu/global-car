/**
 * PUNTO DI INGRESSO — Global Car
 *
 * Ordine di priorità del caricamento (Modulo 5.5): il primo fotogramma deve
 * essere HTML. Titolo e testo sono già visibili quando questo file gira; la
 * scena 3D si materializza dopo, e la sequenza del percorso arriva per ultima
 * perché è nella terza schermata e non deve bloccare la prima.
 */

import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';

import { webglDisponibile } from './utils/quality.js';
import { attivaEntrate, attivaParallasse, attivaIntestazione } from './scroll/reveal.js';
import { creaSequenzaPercorso } from './scroll/frame-sequence.js';

function avviaSito() {
  // ---- Cose immediate, senza costi ----
  attivaIntestazione(document.querySelector('[data-intestazione]'));
  attivaEntrate(document.querySelectorAll('[data-rivela]'));
  attivaParallasse(document.querySelector('[data-eroe-veicolo]'));

  const anno = document.querySelector('[data-anno]');
  if (anno) anno.textContent = String(new Date().getFullYear());

  const menuCompatto = document.querySelector('.menu-compatto');
  menuCompatto?.querySelectorAll('a').forEach((collegamento) => {
    collegamento.addEventListener('click', () => {
      menuCompatto.removeAttribute('open');
    });
  });

  // ---- Scena 3D della hero ----
  avviaScenaEroe();

  // ---- Sequenza del percorso ----
  avviaSequenzaPercorso();
}

/**
 * La scena 3D si carica in modo differito: Three.js è la dipendenza più pesante
 * del progetto e non deve stare sul percorso critico del primo render.
 */
async function avviaScenaEroe() {
  const tela = document.querySelector('[data-scena-eroe]');
  const contenitore = tela?.closest('.eroe__scena');
  if (!tela || !contenitore) return;

  // Nessun WebGL (succede nei browser interni ad alcune app social):
  // si mostra il ripiego statico e si evita di scaricare Three.js.
  if (!webglDisponibile()) {
    contenitore.dataset.ripiegoAttivo = 'true';
    return;
  }

  try {
    const { creaScenaEroe } = await import('./scenes/hero-scene.js');
    const scena = creaScenaEroe(tela);

    // La scena si ferma quando non è visibile: è la differenza tra un telefono
    // che resta freddo e uno che scalda (Modulo 2.5).
    const osservatore = new IntersectionObserver(
      (voci) => {
        if (voci[0].isIntersecting) scena.avvia();
        else scena.ferma();
      },
      { threshold: 0.01 }
    );
    osservatore.observe(contenitore);

    // Anche con la scheda in secondo piano non serve disegnare
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) scena.ferma();
      else if (contenitore.getBoundingClientRect().bottom > 0) scena.avvia();
    });
  } catch (errore) {
    // Se il modulo 3D non parte, il sito resta perfettamente utilizzabile:
    // è il principio del Modulo 3.1.
    console.error('Scena 3D non disponibile:', errore);
    contenitore.dataset.ripiegoAttivo = 'true';
  }
}

function avviaSequenzaPercorso() {
  const tela = document.querySelector('[data-sequenza-percorso]');
  const sezione = document.querySelector('#percorso');
  if (!tela || !sezione) return;

  const passaggi = sezione.querySelectorAll('[data-passaggio]');
  creaSequenzaPercorso(tela, sezione, passaggi);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', avviaSito, { once: true });
} else {
  avviaSito();
}
