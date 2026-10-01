/**
 * Estrae (o genera) la sequenza di fotogrammi per la sezione Percorso.
 *
 * Priorità:
 * 1. Se esiste un video in public/assets/video/percorso.mp4 → estrae i frame (Modulo 10).
 * 2. Altrimenti costruisce una carrellata lenta (Ken Burns) da una foto reale
 *    dell'officina, così il sito resta usabile senza Higgsfield.
 *
 *   npm run frames
 */

import { mkdir, access, readdir, unlink, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RADICE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VIDEO = join(RADICE, 'public', 'assets', 'video', 'percorso.mp4');
const FOTO = join(RADICE, 'Immagini', 'DSC4945-Modifica-scaled.jpg');
const USCITA = join(RADICE, 'public', 'assets', 'frames');

const SERIE = {
  desktop: { cartella: 'desktop', quantita: 30, larghezza: 1080, altezza: 608 },
  mobile: { cartella: 'mobile', quantita: 20, larghezza: 720, altezza: 405 },
};

function ffmpeg(args) {
  return new Promise((risolvi, rifiuta) => {
    const processo = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    processo.stderr.on('data', (dati) => {
      stderr += dati.toString();
    });
    processo.on('error', (errore) => {
      rifiuta(
        new Error(
          `ffmpeg non trovato nel PATH. Installalo e riapri il terminale. (${errore.message})`
        )
      );
    });
    processo.on('close', (codice) => {
      if (codice === 0) risolvi();
      else rifiuta(new Error(`ffmpeg è uscito con codice ${codice}\n${stderr.slice(-800)}`));
    });
  });
}

async function esiste(percorso) {
  try {
    await access(percorso);
    return true;
  } catch {
    return false;
  }
}

async function svuotaCartella(cartella) {
  await mkdir(cartella, { recursive: true });
  const contenuti = await readdir(cartella);
  await Promise.all(contenuti.map((nome) => unlink(join(cartella, nome))));
}

async function estraiDaVideo(serie) {
  const destinazione = join(USCITA, serie.cartella);
  await svuotaCartella(destinazione);

  // fps = quantita / durata: ffmpeg calcola la durata del video da solo
  // con fps=quantita/durata e -frames:v quantita si distribuiscono i frame.
  await ffmpeg([
    '-y',
    '-i',
    VIDEO,
    '-vf',
    `fps=${serie.quantita}/8,scale=${serie.larghezza}:-2:flags=lanczos`,
    '-frames:v',
    String(serie.quantita),
    '-c:v',
    'libwebp',
    '-quality',
    '80',
    join(destinazione, 'frame-%03d.webp'),
  ]);
}

async function kenBurnsDaFoto(serie) {
  const destinazione = join(USCITA, serie.cartella);
  await svuotaCartella(destinazione);

  const { quantita, larghezza, altezza } = serie;
  const originale = await readFile(FOTO);
  const meta = await sharp(originale).metadata();
  const rapporto = altezza / larghezza;

  for (let i = 0; i < quantita; i += 1) {
    const t = quantita === 1 ? 0 : i / (quantita - 1);
    const zoom = 1.08 + 0.22 * t;
    let taglioLarghezza = Math.round(meta.width / zoom);
    let taglioAltezza = Math.round(taglioLarghezza * rapporto);

    if (taglioAltezza > meta.height) {
      taglioAltezza = meta.height;
      taglioLarghezza = Math.round(taglioAltezza / rapporto);
    }

    const left = Math.round((meta.width - taglioLarghezza) * t * 0.85);
    const top = Math.round((meta.height - taglioAltezza) * 0.4);
    const numero = String(i + 1).padStart(3, '0');

    await sharp(originale)
      .extract({
        left: Math.max(0, left),
        top: Math.max(0, top),
        width: taglioLarghezza,
        height: taglioAltezza,
      })
      .resize(larghezza, altezza, { fit: 'cover' })
      .webp({ quality: 68, effort: 5 })
      .toFile(join(destinazione, `frame-${numero}.webp`));
  }
}

async function principale() {
  const daVideo = await esiste(VIDEO);
  const daFoto = await esiste(FOTO);

  if (!daVideo && !daFoto) {
    throw new Error('Né video percorso.mp4 né foto DSC4945 trovati.');
  }

  console.log(
    daVideo
      ? '\nEstrazione fotogrammi dal video Higgsfield (Modulo 10)\n'
      : '\nNessun video Higgsfield: sequenza da foto reale dell\'officina (Ken Burns)\n'
  );

  for (const serie of Object.values(SERIE)) {
    if (daVideo) await estraiDaVideo(serie);
    else await kenBurnsDaFoto(serie);
    const file = await readdir(join(USCITA, serie.cartella));
    console.log(`  ${serie.cartella.padEnd(10)} ${file.length} fotogrammi @ ${serie.larghezza}px`);
  }

  console.log('\nFatto. Frame in public/assets/frames/\n');
}

principale().catch((errore) => {
  console.error(errore.message);
  process.exit(1);
});
