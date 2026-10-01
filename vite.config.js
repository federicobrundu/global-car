import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const radice = dirname(fileURLToPath(import.meta.url));

/**
 * Configurazione Vite — Global Car
 *
 * IMPORTANTE per GitHub Pages:
 * - project site (es. utente.github.io/global-car/) → base: '/global-car/'
 * - user site     (es. utente.github.io)           → base: '/'
 *
 * Il valore si imposta con la variabile d'ambiente VITE_BASE in fase di build.
 * Default `./` : funziona su GitHub Pages (project site e user site) senza
 * conoscere il nome del repository.
 */
const base = process.env.VITE_BASE ?? './';

export default defineConfig({
  base,
  build: {
    outDir: 'dist',
    assetsInlineLimit: 2048,
    rollupOptions: {
      input: {
        main: resolve(radice, 'index.html'),
        storia: resolve(radice, 'storia.html'),
        diagnostica: resolve(radice, 'diagnostica.html'),
        riparazioni: resolve(radice, 'riparazioni-rapide.html'),
        gomme: resolve(radice, 'gomme.html'),
        revisione: resolve(radice, 'revisione.html'),
        blog: resolve(radice, 'blog.html'),
        contatti: resolve(radice, 'contatti.html'),
      },
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
  server: {
    open: true,
    port: 5173,
  },
});
