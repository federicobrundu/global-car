import { defineConfig } from 'vite';

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
    // Three.js in un chunk separato: cambia raramente, resta in cache del browser
    rollupOptions: {
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
