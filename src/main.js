/**
 * PUNTO DI INGRESSO — Global Car
 *
 * Il primo fotogramma è HTML (Modulo 5.5). La scena 3D del viaggio
 * si materializza dopo: è una sola, fissa, e copre tutta la home.
 */

import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';

import { webglDisponibile } from './utils/quality.js';
import { attivaEntrate, attivaIntestazione } from './scroll/reveal.js';

function avviaSito() {
  attivaIntestazione(document.querySelector('[data-intestazione]'));
  attivaEntrate(document.querySelectorAll('[data-rivela]'));

  const anno = document.querySelector('[data-anno]');
  if (anno) anno.textContent = String(new Date().getFullYear());

  const menuCompatto = document.querySelector('.menu-compatto');
  menuCompatto?.querySelectorAll('a').forEach((collegamento) => {
    collegamento.addEventListener('click', () => {
      menuCompatto.removeAttribute('open');
    });
  });

  avviaViaggio();
}

async function avviaViaggio() {
  const tela = document.querySelector('[data-scena-viaggio]');
  const contenitore = tela?.closest('.viaggio');
  if (!tela || !contenitore) return;

  if (!webglDisponibile()) {
    contenitore.dataset.ripiegoAttivo = 'true';
    return;
  }

  try {
    const { creaScenaViaggio } = await import('./scenes/viaggio-scene.js');
    const passaggi = document.querySelectorAll('[data-passaggio]');
    creaScenaViaggio(tela, passaggi);
  } catch (errore) {
    console.error('Scena 3D non disponibile:', errore);
    contenitore.dataset.ripiegoAttivo = 'true';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', avviaSito, { once: true });
} else {
  avviaSito();
}
