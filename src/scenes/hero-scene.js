/**
 * SCENA EROE — "superficie verniciata sotto luce da cabina"
 *
 * Famiglia 2 del Modulo 4: effetti generativi. Nessun modello 3D da scaricare,
 * nessuna texture esterna, nessun problema di licenza. Tutto generato dal
 * codice, quindi la densità si può abbassare sul mobile senza che l'effetto si
 * perda.
 *
 * Cosa rappresenta: una lamiera verniciata che ondula lentamente sotto le luci
 * di una cabina di verniciatura. È il servizio principale di Global Car reso
 * visivamente, non una decorazione astratta qualsiasi.
 *
 * Costi deliberatamente esclusi (Modulo 5.2): vetro e rifrazione, ombre
 * dinamiche, riflessi in tempo reale, post-effetti.
 */

import * as THREE from 'three';
import { smorza, movimentoRidotto } from '../utils/motion.js';
import { rilevaLivello, livelloInferiore, controllaPrestazioni } from '../utils/quality.js';

// ---- Parametri del blocco, dichiarati in cima (Modulo 4.1) ----
const CONFIG = {
  colori: {
    vernice: 0x1b222b,      // il blu-carbone della lamiera
    luceCalda: 0xffb020,    // key light: la plafoniera della cabina
    luceAccento: 0xff3b2f,  // rim light: l'accento del marchio
    particelle: 0xffd9a8,   // polvere calda nei fasci, non punti bianchi
  },
  camera: {
    // 42 gradi: vicino allo still life di prodotto (35), perché la scena è un
    // piano di posa, non un paesaggio
    campoVisivo: 42,
    posizione: [0, 1.15, 5],
    mira: [0, 0.35, 0],
  },
  superficie: {
    larghezza: 44,
    profondita: 30,
    ampiezzaOnda: 0.34,
    velocitaOnda: 0.14,
    metallicita: 0.95,
    rugosita: 0.18,
  },
  particelle: {
    raggio: 9,
    altezza: 5.5,
    dimensione: 0.055,
    velocitaSalita: 0.03,
  },
  // La nebbia dissolve il bordo lontano del piano: senza questo la scena legge
  // come un orizzonte, e un orizzonte con dei punti luminosi sembra spazio.
  nebbia: { colore: 0x0b0d10, vicino: 4, lontano: 16 },
  mouse: {
    // Smorzamento: l'inclinazione insegue il cursore, non lo copia
    velocitaSmorzamento: 2.2,
    inclinazioneMassima: 0.16,
  },
};

export function creaScenaEroe(tela) {
  let livello = rilevaLivello();
  const ridotto = movimentoRidotto();

  // ---- Renderer ----
  const renderer = new THREE.WebGLRenderer({
    canvas: tela,
    antialias: livello.nome !== 'basso',
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scena = new THREE.Scene();
  scena.fog = new THREE.Fog(
    CONFIG.nebbia.colore,
    CONFIG.nebbia.vicino,
    CONFIG.nebbia.lontano
  );

  const camera = new THREE.PerspectiveCamera(CONFIG.camera.campoVisivo, 1, 0.1, 120);
  camera.position.set(...CONFIG.camera.posizione);
  camera.lookAt(...CONFIG.camera.mira);

  // ---- Ambiente per i riflessi (IBL) ----
  // Invece di scaricare un file HDR, costruiamo una piccola scena di pannelli
  // luminosi — esattamente le softbox di una cabina di verniciatura — e la
  // trasformiamo in mappa ambiente. Su una superficie metallica è il parametro
  // che cambia la resa più di qualsiasi altro (Modulo 2.1).
  const generatorePmrem = new THREE.PMREMGenerator(renderer);
  const ambiente = generatorePmrem.fromScene(creaCabinaLuce(), 0.04);
  scena.environment = ambiente.texture;
  generatorePmrem.dispose();

  // ---- Luci ----
  // Regola di partenza del manuale: ambientale debole + direzionale principale
  // + illuminazione da immagine per i riflessi.
  scena.add(new THREE.AmbientLight(0xffffff, 0.22));

  const luceKey = new THREE.DirectionalLight(CONFIG.colori.luceCalda, 2.1);
  luceKey.position.set(-5, 7, 4);
  scena.add(luceKey);

  const luceAccento = new THREE.DirectionalLight(CONFIG.colori.luceAccento, 1.6);
  luceAccento.position.set(7, 2.2, -3);
  scena.add(luceAccento);

  if (livello.luciAggiuntive) {
    // Controluce freddo che stacca la superficie dal fondo
    const luceStacco = new THREE.DirectionalLight(0x6f8bb0, 0.8);
    luceStacco.position.set(0, 3, -8);
    scena.add(luceStacco);
  }

  // ---- Il gruppo che reagisce al mouse ----
  const gruppo = new THREE.Group();
  scena.add(gruppo);

  // ---- La superficie verniciata ----
  let superficie = creaSuperficie(livello.segmentiSuperficie);
  gruppo.add(superficie.mesh);

  // ---- Le particelle sospese ----
  let particelle = creaParticelle(livello.particelle);
  gruppo.add(particelle.punti);

  // ---- Stato del puntatore ----
  const puntatore = { x: 0, y: 0 };
  const puntatoreSmorzato = { x: 0, y: 0 };

  function alMovimentoPuntatore(evento) {
    puntatore.x = (evento.clientX / window.innerWidth) * 2 - 1;
    puntatore.y = (evento.clientY / window.innerHeight) * 2 - 1;
  }

  if (!ridotto) {
    window.addEventListener('pointermove', alMovimentoPuntatore, { passive: true });
  }

  // ---- Ridimensionamento ----
  function ridimensiona() {
    const larghezza = tela.clientWidth || window.innerWidth;
    const altezza = tela.clientHeight || window.innerHeight;
    camera.aspect = larghezza / altezza;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, livello.pixelRatioMassimo));
    renderer.setSize(larghezza, altezza, false);
  }

  ridimensiona();
  const osservatoreDimensioni = new ResizeObserver(ridimensiona);
  osservatoreDimensioni.observe(tela);

  // ---- Ciclo di disegno ----
  const orologio = new THREE.Clock();
  let inEsecuzione = false;
  let idFotogramma = null;

  function disegna() {
    idFotogramma = requestAnimationFrame(disegna);
    const delta = Math.min(orologio.getDelta(), 0.1);
    const tempo = orologio.elapsedTime;

    if (!ridotto) {
      superficie.aggiorna(tempo);
      particelle.aggiorna(delta, tempo);

      // Smorzamento indipendente dal frame rate
      puntatoreSmorzato.x = smorza(
        puntatoreSmorzato.x, puntatore.x, CONFIG.mouse.velocitaSmorzamento, delta
      );
      puntatoreSmorzato.y = smorza(
        puntatoreSmorzato.y, puntatore.y, CONFIG.mouse.velocitaSmorzamento, delta
      );

      gruppo.rotation.y = puntatoreSmorzato.x * CONFIG.mouse.inclinazioneMassima;
      gruppo.rotation.x = puntatoreSmorzato.y * CONFIG.mouse.inclinazioneMassima * 0.45;
    }

    renderer.render(scena, camera);
  }

  function avvia() {
    if (inEsecuzione) return;
    inEsecuzione = true;
    orologio.start();
    disegna();
  }

  function ferma() {
    if (!inEsecuzione) return;
    inEsecuzione = false;
    if (idFotogramma !== null) cancelAnimationFrame(idFotogramma);
    idFotogramma = null;
  }

  // Con movimento ridotto si disegna un solo fotogramma: la scena c'è, è ferma.
  if (ridotto) {
    renderer.render(scena, camera);
  } else {
    avvia();

    // Se la scena non regge nei primi secondi, si scende di gradino.
    controllaPrestazioni(() => {
      const nuovoLivello = livelloInferiore(livello);
      if (nuovoLivello.nome === livello.nome) return;
      livello = nuovoLivello;

      // Si ricostruiscono solo i due elementi la cui densità pesa
      gruppo.remove(superficie.mesh);
      superficie.smaltisci();
      superficie = creaSuperficie(livello.segmentiSuperficie);
      gruppo.add(superficie.mesh);

      gruppo.remove(particelle.punti);
      particelle.smaltisci();
      particelle = creaParticelle(livello.particelle);
      gruppo.add(particelle.punti);

      ridimensiona();
    });
  }

  function smaltisci() {
    ferma();
    osservatoreDimensioni.disconnect();
    window.removeEventListener('pointermove', alMovimentoPuntatore);
    superficie.smaltisci();
    particelle.smaltisci();
    ambiente.texture.dispose();
    renderer.dispose();
  }

  return { avvia, ferma, smaltisci, get livello() { return livello.nome; } };
}

/* ============================================================
   COSTRUZIONE DEGLI ELEMENTI
   ============================================================ */

/**
 * La superficie: un piano suddiviso, deformato da una somma di seni.
 * Non è rumore vero, ma a questa scala è indistinguibile e costa una frazione.
 */
function creaSuperficie(segmenti) {
  const geometria = new THREE.PlaneGeometry(
    CONFIG.superficie.larghezza,
    CONFIG.superficie.profondita,
    segmenti,
    Math.round(segmenti * 0.6)
  );

  const materiale = new THREE.MeshStandardMaterial({
    color: CONFIG.colori.vernice,
    metalness: CONFIG.superficie.metallicita,
    roughness: CONFIG.superficie.rugosita,
  });

  const mesh = new THREE.Mesh(geometria, materiale);
  // Orizzontale: è il piano di posa di uno studio, non un paesaggio in fuga
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -1.1;

  // Si conservano le posizioni di partenza: la deformazione si applica a quelle
  const posizioni = geometria.attributes.position;
  const originali = Float32Array.from(posizioni.array);

  function aggiorna(tempo) {
    const t = tempo * CONFIG.superficie.velocitaOnda;
    const ampiezza = CONFIG.superficie.ampiezzaOnda;

    for (let i = 0; i < posizioni.count; i += 1) {
      const indice = i * 3;
      const x = originali[indice];
      const y = originali[indice + 1];

      // Tre onde di frequenza e direzione diverse: il risultato non si ripete
      // in modo percepibile.
      const onda =
        Math.sin(x * 0.28 + t * 1.6) * 0.5 +
        Math.sin(y * 0.36 - t * 1.15) * 0.34 +
        Math.sin((x + y) * 0.19 + t * 0.78) * 0.26;

      posizioni.array[indice + 2] = onda * ampiezza;
    }

    posizioni.needsUpdate = true;
    // Le normali vanno ricalcolate, altrimenti i riflessi restano fermi
    geometria.computeVertexNormals();
  }

  aggiorna(0);

  return {
    mesh,
    aggiorna,
    smaltisci() {
      geometria.dispose();
      materiale.dispose();
    },
  };
}

/** Le particelle: nebbia di vernice sospesa nei fasci di luce. */
function creaParticelle(quantita) {
  const geometria = new THREE.BufferGeometry();
  const posizioni = new Float32Array(quantita * 3);
  const velocita = new Float32Array(quantita);
  const sfasamenti = new Float32Array(quantita);

  const { raggio, altezza } = CONFIG.particelle;

  for (let i = 0; i < quantita; i += 1) {
    const indice = i * 3;
    // Distribuzione in disco: più densa al centro, dove guarda la camera
    const angolo = Math.random() * Math.PI * 2;
    const distanza = Math.sqrt(Math.random()) * raggio;

    posizioni[indice] = Math.cos(angolo) * distanza;
    posizioni[indice + 1] = Math.random() * altezza - 1.5;
    posizioni[indice + 2] = Math.sin(angolo) * distanza * 0.75;

    velocita[i] = 0.4 + Math.random() * 0.9;
    sfasamenti[i] = Math.random() * Math.PI * 2;
  }

  geometria.setAttribute('position', new THREE.BufferAttribute(posizioni, 3));

  const materiale = new THREE.PointsMaterial({
    color: CONFIG.colori.particelle,
    size: CONFIG.particelle.dimensione,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.28, // tenui: è polvere nei fasci di luce, non un cielo stellato
    depthWrite: false, // niente ordinamento: le particelle non si occludono
    blending: THREE.AdditiveBlending,
    fog: true, // sparisce in lontananza come il resto della scena
  });

  const punti = new THREE.Points(geometria, materiale);
  const attributo = geometria.attributes.position;
  const limiteAlto = altezza - 1.5;

  function aggiorna(delta, tempo) {
    for (let i = 0; i < quantita; i += 1) {
      const indice = i * 3;

      // Salita lenta, con rientro dal basso quando esce in alto
      attributo.array[indice + 1] +=
        CONFIG.particelle.velocitaSalita * velocita[i] * delta * 10;
      if (attributo.array[indice + 1] > limiteAlto) {
        attributo.array[indice + 1] = -1.5;
      }

      // Deriva laterale: l'aria della cabina non è ferma
      attributo.array[indice] +=
        Math.sin(tempo * 0.35 + sfasamenti[i]) * delta * 0.09;
    }
    attributo.needsUpdate = true;
  }

  return {
    punti,
    aggiorna,
    smaltisci() {
      geometria.dispose();
      materiale.dispose();
    },
  };
}

/**
 * La "cabina di luce" usata come sorgente dei riflessi.
 * Sono pannelli emissivi in una scatola: lo stesso principio di una fotografia
 * panoramica usata come illuminazione, ma generato dal codice e quindi senza
 * nessun file da scaricare.
 */
function creaCabinaLuce() {
  const cabina = new THREE.Scene();

  const scatola = new THREE.Mesh(
    new THREE.BoxGeometry(22, 12, 22),
    new THREE.MeshBasicMaterial({ color: 0x1d242d, side: THREE.BackSide })
  );
  cabina.add(scatola);

  // Pannello con posizione, dimensione, colore e intensità
  const pannelli = [
    { pos: [0, 5.8, 0], scala: [12, 0.1, 9], colore: 0xffffff, intensita: 5.5 },
    { pos: [-8, 2, 2], scala: [0.1, 7, 9], colore: 0xffd9a0, intensita: 3.2 },
    { pos: [8, 1.5, -1], scala: [0.1, 6, 8], colore: 0xff6a5a, intensita: 2.4 },
    { pos: [0, 0.5, -9], scala: [12, 5, 0.1], colore: 0x9fc0ff, intensita: 1.4 },
  ];

  for (const pannello of pannelli) {
    const materiale = new THREE.MeshBasicMaterial({ color: pannello.colore });
    materiale.color.multiplyScalar(pannello.intensita);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materiale);
    mesh.position.set(...pannello.pos);
    mesh.scale.set(...pannello.scala);
    cabina.add(mesh);
  }

  return cabina;
}
