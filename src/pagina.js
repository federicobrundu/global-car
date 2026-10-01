/**
 * Entry delle pagine interne (storia, servizi, blog, contatti).
 * La hero 3D pesante resta sulla home: qui usiamo atmosfera Higgsfield + HTML.
 */

import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pagine.css';

import { attivaEntrate, attivaIntestazione } from './scroll/reveal.js';

const VOCI = [
  {
    href: './index.html#servizi',
    label: 'Servizi',
    figli: [
      { href: './index.html#servizi', label: 'Verniciatura e sinistri' },
      { href: './diagnostica.html', label: 'Diagnostica auto' },
      { href: './riparazioni-rapide.html', label: 'Riparazioni rapide' },
      { href: './gomme.html', label: 'Sostituzione gomme' },
      { href: './revisione.html', label: 'Revisione auto' },
    ],
  },
  { href: './storia.html', label: 'La nostra storia' },
  { href: './index.html#percorso', label: 'Come lavoriamo' },
  { href: './blog.html', label: 'Blog' },
  { href: './contatti.html', label: 'Contatti' },
];

function montaNavigazione() {
  const lista = document.querySelector('.navigazione__lista');
  if (lista) {
    lista.innerHTML = VOCI.map((voce) => {
      if (!voce.figli) {
        return `<li><a href="${voce.href}">${voce.label}</a></li>`;
      }
      const sotto = voce.figli
        .map((figlio) => `<li><a href="${figlio.href}">${figlio.label}</a></li>`)
        .join('');
      return `<li class="navigazione__voce"><a href="${voce.href}">${voce.label}</a><ul class="navigazione__sotto">${sotto}</ul></li>`;
    }).join('');
  }

  const compatto = document.querySelector('.menu-compatto__lista');
  if (compatto) {
    const piatte = VOCI.flatMap((voce) => voce.figli ?? [voce]);
    compatto.innerHTML = [
      '<li><a href="./index.html">Home</a></li>',
      ...piatte.map((voce) => `<li><a href="${voce.href}">${voce.label}</a></li>`),
    ].join('');
  }
}

function avvia() {
  montaNavigazione();
  attivaIntestazione(document.querySelector('[data-intestazione]'));
  attivaEntrate(document.querySelectorAll('[data-rivela]'));

  const anno = document.querySelector('[data-anno]');
  if (anno) anno.textContent = String(new Date().getFullYear());

  const menu = document.querySelector('.menu-compatto');
  menu?.querySelectorAll('a').forEach((collegamento) => {
    collegamento.addEventListener('click', () => menu.removeAttribute('open'));
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', avvia, { once: true });
} else {
  avvia();
}
