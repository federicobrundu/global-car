/**
 * Prepara le immagini del cliente per il web.
 *
 * Le foto arrivano sempre da qualche megabyte l'una. Vanno ridotte e convertite
 * in formati moderni prima di entrare nel sito: le texture e le immagini sono la
 * causa numero uno dei tempi di caricamento lunghi (Modulo 5.2).
 *
 * Gli originali in `Immagini/` non vengono mai modificati.
 *
 *   npm run ottimizza-immagini
 */

import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RADICE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGINE = join(RADICE, 'Immagini');
const DESTINAZIONE = join(RADICE, 'public', 'assets', 'images');

/**
 * Ogni voce dichiara: file di partenza, nome finale, larghezza massima e
 * formato. La larghezza è quella dello spazio reale che l'immagine occupa,
 * non quella dell'originale.
 */
const LAVORAZIONI = [
  {
    // WebP e non PNG: serve la trasparenza (è il soggetto sovrapposto alla
    // hero) ma il PNG su una fotografia pesa quattro volte tanto.
    origine: 'Riparazione-Auto-6-1024x1024.png',
    destinazione: 'auto-hero.webp',
    larghezza: 1024,
    formato: 'webp',
    qualita: 82,
  },
  {
    origine: 'DSC4945-Modifica-scaled.jpg',
    destinazione: 'officina-lavoro.jpg',
    larghezza: 1200,
    formato: 'jpeg',
    qualita: 78,
  },
  {
    origine: 'DSC4870-1-scaled.jpg',
    destinazione: 'officina-interno.jpg',
    larghezza: 1200,
    formato: 'jpeg',
    qualita: 78,
  },
  {
    origine: 'Global-Car-Immagini-1080x1080-1-1024x1024.png',
    destinazione: 'officina-veicoli.jpg',
    larghezza: 1024,
    formato: 'jpeg',
    qualita: 78,
  },
  {
    origine: 'Global-Car-Foto-About-Us.png',
    destinazione: 'carrozziere.jpg',
    larghezza: 800,
    formato: 'jpeg',
    qualita: 80,
  },
  // Immagine per le condivisioni su WhatsApp e social
  {
    origine: 'DSC4945-Modifica-scaled.jpg',
    destinazione: 'og-global-car.jpg',
    larghezza: 1200,
    altezza: 630,
    ritaglia: true,
    formato: 'jpeg',
    qualita: 80,
  },
];

function formattaPeso(byte) {
  return `${(byte / 1024).toFixed(0)} KB`;
}

async function lavora(voce) {
  const percorsoOrigine = join(ORIGINE, voce.origine);
  const percorsoDestinazione = join(DESTINAZIONE, voce.destinazione);

  let elaborazione = sharp(await readFile(percorsoOrigine));

  if (voce.ritaglia) {
    elaborazione = elaborazione.resize(voce.larghezza, voce.altezza, {
      fit: 'cover',
      position: 'center',
    });
  } else {
    elaborazione = elaborazione.resize(voce.larghezza, null, {
      withoutEnlargement: true,
    });
  }

  if (voce.formato === 'png') {
    elaborazione = elaborazione.png({ compressionLevel: 9, palette: true });
  } else if (voce.formato === 'jpeg') {
    // `mozjpeg` comprime sensibilmente meglio a parità di qualità percepita
    elaborazione = elaborazione.flatten({ background: '#0b0d10' }).jpeg({
      quality: voce.qualita ?? 78,
      mozjpeg: true,
    });
  } else {
    // `alphaQuality` alto preserva il bordo del ritaglio senza aloni
    elaborazione = elaborazione.webp({
      quality: voce.qualita ?? 80,
      alphaQuality: 90,
      effort: 5,
    });
  }

  await writeFile(percorsoDestinazione, await elaborazione.toBuffer());

  const originale = await stat(percorsoOrigine);
  const finale = await stat(percorsoDestinazione);
  const risparmio = (1 - finale.size / originale.size) * 100;

  console.log(
    `  ${voce.destinazione.padEnd(26)} ${formattaPeso(originale.size).padStart(8)} → ` +
      `${formattaPeso(finale.size).padStart(8)}  (-${risparmio.toFixed(0)}%)`
  );
}

async function principale() {
  await mkdir(DESTINAZIONE, { recursive: true });
  console.log('\nOttimizzazione immagini del cliente:\n');

  for (const voce of LAVORAZIONI) {
    try {
      await lavora(voce);
    } catch (errore) {
      console.error(`  ✗ ${voce.origine}: ${errore.message}`);
    }
  }

  console.log('\nFatto. Originali intatti in Immagini/\n');
}

principale();
