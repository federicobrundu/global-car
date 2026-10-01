/**
 * VIAGGIO — una sola scena 3D per tutta la home.
 *
 * Lo scroll della pagina è la linea del tempo (Modulo 3.3):
 * l'auto arriva, entra in cabina, viene lavorata, torna.
 * Ogni sezione HTML è uno stato; i movimenti stanno in mezzo.
 * Il testo resta HTML e sempre leggibile.
 */

import * as THREE from 'three';
import {
  smorza,
  movimentoRidotto,
  progressoPagina,
  interpolaFotogrammi,
  limita,
} from '../utils/motion.js';
import { rilevaLivello, livelloInferiore, controllaPrestazioni } from '../utils/quality.js';

const BASE = import.meta.env.BASE_URL ?? '/';

const FOTOGRAMMI = [
  // Hero: auto intera a destra, tre quarti. Camera gira intorno (idle).
  { p: 0, pos: [-0.55, 1.58, 8.3], look: [0.45, 0.92, 0.25], fov: 32, car: [2.15, 1.02, 0.45], rot: 0.1, luce: 1 },
  // Si allontana: l'officina è intorno, non un PNG appoggiato.
  { p: 0.1, pos: [-0.2, 1.85, 9.4], look: [0.7, 1.05, -2.6], fov: 38, car: [1.1, 1.0, -0.9], rot: 0.22, luce: 1.08 },
  // Entra in cabina — i servizi.
  { p: 0.22, pos: [0.1, 1.55, 3.2], look: [0.2, 1.2, -12], fov: 44, car: [0.3, 0.95, -4.6], rot: 0.08, luce: 1.18 },
  // Dentro la cabina — come lavoriamo (passaggio 1-2).
  { p: 0.38, pos: [0.15, 1.45, -5.5], look: [0, 1.2, -18], fov: 46, car: [0.12, 0.95, -11], rot: 0, luce: 1.28 },
  // Fondo cabina — lavorazione (passaggio 3).
  { p: 0.5, pos: [0.3, 1.4, -13.5], look: [0, 1.2, -24], fov: 46, car: [0.18, 0.95, -18], rot: -0.1, luce: 1.32 },
  // Svolta verso l'officina reale — chi siamo.
  { p: 0.64, pos: [3.4, 1.75, -8.2], look: [-0.5, 1.15, -11], fov: 42, car: [1.3, 0.98, -7], rot: -0.28, luce: 1.08 },
  // Campo largo — recensioni / perché.
  { p: 0.8, pos: [0.3, 2.5, 5.2], look: [0.4, 1.05, -8], fov: 40, car: [0.55, 1.0, -3], rot: 0.16, luce: 0.95 },
  // Chiusura: l'auto è di nuovo davanti, consegnata.
  { p: 1, pos: [-0.45, 1.55, 8.1], look: [0.4, 0.92, 0.2], fov: 32, car: [2.4, 1.02, 0.4], rot: 0.16, luce: 0.92 },
];

const FOTOGRAMMI_MOBILE = [
  { p: 0, pos: [0.05, 2.15, 8.4], look: [0, 1.15, 0.2], fov: 36, car: [0, 1.15, 0.5], rot: 0.08, luce: 1 },
  { p: 0.1, pos: [0.05, 2.0, 7.4], look: [0, 1.1, -3], fov: 40, car: [0, 1.05, -1], rot: 0.16, luce: 1.05 },
  { p: 0.24, pos: [0, 1.55, 2.6], look: [0, 1.15, -12], fov: 46, car: [0, 0.95, -5], rot: 0.06, luce: 1.18 },
  { p: 0.4, pos: [0, 1.42, -5.5], look: [0, 1.2, -18], fov: 48, car: [0, 0.95, -11], rot: 0, luce: 1.28 },
  { p: 0.52, pos: [0.2, 1.38, -13], look: [0, 1.2, -22], fov: 48, car: [0, 0.95, -17], rot: -0.08, luce: 1.32 },
  { p: 0.66, pos: [2.2, 1.7, -8], look: [-0.3, 1.15, -11], fov: 44, car: [0.7, 0.98, -8], rot: -0.22, luce: 1.08 },
  { p: 0.82, pos: [0.15, 2.2, 5], look: [0, 1.1, -7], fov: 40, car: [0, 1.02, -2], rot: 0.12, luce: 0.95 },
  { p: 1, pos: [0.05, 2.1, 8.2], look: [0, 1.12, 0.15], fov: 36, car: [0, 1.12, 0.4], rot: 0.14, luce: 0.9 },
];

export function creaScenaViaggio(tela, passaggi) {
  let livello = rilevaLivello();
  const ridotto = movimentoRidotto();
  const caricatore = new THREE.TextureLoader();

  const renderer = new THREE.WebGLRenderer({
    canvas: tela,
    antialias: livello.nome !== 'basso',
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x0b0d10, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;

  const scena = new THREE.Scene();
  scena.fog = new THREE.Fog(0x0b0d10, 14, 42);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  camera.position.set(-0.55, 1.58, 8.3);

  const ambiente = creaAmbiente(renderer);
  scena.environment = ambiente;

  scena.add(new THREE.AmbientLight(0xffffff, 0.28));
  const luceKey = new THREE.DirectionalLight(0xffb020, 1.35);
  luceKey.position.set(-5, 7, 5);
  scena.add(luceKey);
  const luceAccento = new THREE.DirectionalLight(0xff3b2f, 1.5);
  luceAccento.position.set(6, 2.4, -2);
  scena.add(luceAccento);
  const luceCabina = new THREE.PointLight(0xffe0a8, 8, 22);
  luceCabina.position.set(0, 4.2, -16);
  scena.add(luceCabina);
  const luceAuto = new THREE.PointLight(0xffe8c8, 2.2, 8);
  scena.add(luceAuto);

  let superficie = creaSuperficie(livello.segmentiSuperficie);
  scena.add(superficie.mesh);

  let particelle = creaParticelle(livello.particelle);
  scena.add(particelle.punti);

  const auto = creaAuto(caricatore);
  scena.add(auto.gruppo);

  creaArchitettura(scena, caricatore);

  const puntatore = { x: 0, y: 0 };
  const puntatoreSmorzato = { x: 0, y: 0 };
  function alMovimento(evento) {
    puntatore.x = (evento.clientX / window.innerWidth) * 2 - 1;
    puntatore.y = (evento.clientY / window.innerHeight) * 2 - 1;
  }
  if (!ridotto) {
    window.addEventListener('pointermove', alMovimento, { passive: true });
  }

  const cameraPos = new THREE.Vector3();
  const cameraLook = new THREE.Vector3();
  const obiettivoPos = new THREE.Vector3(-0.55, 1.58, 8.3);
  const obiettivoLook = new THREE.Vector3(0.45, 0.92, 0.25);
  cameraPos.copy(obiettivoPos);
  cameraLook.copy(obiettivoLook);

  const autoPos = new THREE.Vector3();
  const obiettivoAuto = new THREE.Vector3(2.15, 1.02, 0.45);
  autoPos.copy(obiettivoAuto);
  let rotObiettivo = 0.12;
  let rotAttuale = 0.12;
  let fovObiettivo = 32;
  let progressoAttuale = 0;

  function fotogrammiAttivi() {
    return window.innerWidth < 992 ? FOTOGRAMMI_MOBILE : FOTOGRAMMI;
  }

  function statoDaScroll() {
    const p = progressoPagina();
    progressoAttuale = p;
    const stato = interpolaFotogrammi(fotogrammiAttivi(), p);
    obiettivoPos.set(...stato.pos);
    obiettivoLook.set(...stato.look);
    obiettivoAuto.set(...stato.car);
    rotObiettivo = stato.rot;
    fovObiettivo = stato.fov;
    luceKey.intensity = 1.35 * stato.luce;
    luceAccento.intensity = 0.85 * stato.luce;
    luceCabina.intensity = 3.5 + stato.luce * 2.2;

    if (passaggi?.length) {
      const locale = limita((p - 0.34) / 0.28, 0, 0.999);
      const attivo = p < 0.32 || p > 0.64 ? -1 : Math.min(passaggi.length - 1, Math.floor(locale * passaggi.length));
      passaggi.forEach((nodo, indice) => {
        nodo.classList.toggle('e-attivo', indice === attivo);
      });
    }
  }

  function ridimensiona() {
    const larghezza = tela.clientWidth || window.innerWidth;
    const altezza = tela.clientHeight || window.innerHeight;
    camera.aspect = larghezza / Math.max(altezza, 1);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, livello.pixelRatioMassimo));
    renderer.setSize(larghezza, altezza, false);
  }

  ridimensiona();
  const osservatoreDimensioni = new ResizeObserver(ridimensiona);
  osservatoreDimensioni.observe(tela.parentElement || tela);

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

      puntatoreSmorzato.x = smorza(puntatoreSmorzato.x, puntatore.x, 2.2, delta);
      puntatoreSmorzato.y = smorza(puntatoreSmorzato.y, puntatore.y, 2.2, delta);

      cameraPos.x = smorza(cameraPos.x, obiettivoPos.x, 2.6, delta);
      cameraPos.y = smorza(cameraPos.y, obiettivoPos.y, 2.6, delta);
      cameraPos.z = smorza(cameraPos.z, obiettivoPos.z, 2.6, delta);
      cameraLook.x = smorza(cameraLook.x, obiettivoLook.x, 2.8, delta);
      cameraLook.y = smorza(cameraLook.y, obiettivoLook.y, 2.8, delta);
      cameraLook.z = smorza(cameraLook.z, obiettivoLook.z, 2.8, delta);

      autoPos.x = smorza(autoPos.x, obiettivoAuto.x, 2.2, delta);
      autoPos.y = smorza(autoPos.y, obiettivoAuto.y, 2.2, delta);
      autoPos.z = smorza(autoPos.z, obiettivoAuto.z, 2.2, delta);
      rotAttuale = smorza(rotAttuale, rotObiettivo, 2.0, delta);

      camera.fov = smorza(camera.fov, fovObiettivo, 2.4, delta);
      camera.updateProjectionMatrix();

      const idleHero = Math.max(0, 1 - progressoAttuale * 7);
      const orbita = Math.sin(tempo * 0.42) * 0.55 * idleHero;
      const respiro = Math.sin(tempo * 0.45) * 0.05;
      camera.position.set(
        cameraPos.x + puntatoreSmorzato.x * 0.32 + orbita,
        cameraPos.y + respiro + puntatoreSmorzato.y * -0.14,
        cameraPos.z + Math.cos(tempo * 0.42) * 0.22 * idleHero
      );
      camera.lookAt(cameraLook.x, cameraLook.y, cameraLook.z);

      auto.gruppo.position.copy(autoPos);
      auto.gruppo.rotation.y = rotAttuale + Math.sin(tempo * 0.38) * (0.04 + idleHero * 0.08);
      auto.gruppo.position.y = autoPos.y + Math.sin(tempo * 0.9) * 0.02;
      luceAuto.position.set(autoPos.x + 0.6, autoPos.y + 2.1, autoPos.z + 2.2);
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

  if (ridotto) {
    statoDaScroll();
    camera.position.copy(obiettivoPos);
    camera.lookAt(obiettivoLook);
    auto.gruppo.position.copy(obiettivoAuto);
    auto.gruppo.rotation.y = rotObiettivo;
    renderer.render(scena, camera);
  } else {
    window.addEventListener('scroll', statoDaScroll, { passive: true });
    statoDaScroll();
    avvia();
    controllaPrestazioni(() => {
      const nuovo = livelloInferiore(livello);
      if (nuovo.nome === livello.nome) return;
      livello = nuovo;
      scena.remove(superficie.mesh);
      superficie.smaltisci();
      superficie = creaSuperficie(livello.segmentiSuperficie);
      scena.add(superficie.mesh);
      scena.remove(particelle.punti);
      particelle.smaltisci();
      particelle = creaParticelle(livello.particelle);
      scena.add(particelle.punti);
      ridimensiona();
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) ferma();
    else if (!ridotto) avvia();
  });

  return {
    avvia,
    ferma,
    smaltisci() {
      ferma();
      osservatoreDimensioni.disconnect();
      window.removeEventListener('scroll', statoDaScroll);
      window.removeEventListener('pointermove', alMovimento);
      superficie.smaltisci();
      particelle.smaltisci();
      renderer.dispose();
    },
  };
}

function creaAuto(caricatore) {
  const gruppo = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.35, 3.35),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      alphaTest: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  mesh.renderOrder = 2;
  gruppo.add(mesh);

  const ombra = new THREE.Mesh(
    new THREE.CircleGeometry(1.7, 32),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    })
  );
  ombra.rotation.x = -Math.PI / 2;
  ombra.position.set(0.1, -1.02, 0.15);
  gruppo.add(ombra);

  caricatore.load(
    `${BASE}assets/images/auto-hero.webp`,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.premultiplyAlpha = true;
      mesh.material.map = texture;
      mesh.material.opacity = 1;
      mesh.material.transparent = true;
      mesh.material.alphaTest = 0.08;
      mesh.material.needsUpdate = true;
    }
  );
  return { gruppo };
}

function creaArchitettura(scena, caricatore) {
  const cabina = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 15.5),
    new THREE.MeshBasicMaterial({ color: 0x14181d })
  );
  cabina.position.set(0, 3.4, -32);
  scena.add(cabina);
  caricatore.load(`${BASE}assets/generated/cabina-verniciatura.webp`, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    cabina.material.map = texture;
    cabina.material.needsUpdate = true;
  });

  const laterale = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 10),
    new THREE.MeshStandardMaterial({ color: 0x161b22, metalness: 0.7, roughness: 0.35 })
  );
  laterale.position.set(-8.5, 2.4, -12);
  laterale.rotation.y = Math.PI / 2.4;
  scena.add(laterale);

  const laterale2 = laterale.clone();
  laterale2.position.set(8.5, 2.4, -12);
  laterale2.rotation.y = -Math.PI / 2.4;
  scena.add(laterale2);

  const pannello = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 3.6),
    new THREE.MeshBasicMaterial({ color: 0x1a1f26 })
  );
  pannello.position.set(5.6, 1.7, -9);
  pannello.rotation.y = -0.45;
  scena.add(pannello);
  caricatore.load(`${BASE}assets/generated/pannello-verniciato.webp`, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    pannello.material.map = texture;
    pannello.material.needsUpdate = true;
  });

  const officina = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 4.8),
    new THREE.MeshBasicMaterial({ color: 0x1a1f26 })
  );
  officina.position.set(-5.4, 1.9, -11);
  officina.rotation.y = 0.55;
  scena.add(officina);
  caricatore.load(`${BASE}assets/images/officina-lavoro.jpg`, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    officina.material.map = texture;
    officina.material.needsUpdate = true;
  });
}

function creaSuperficie(segmenti) {
  const geometria = new THREE.PlaneGeometry(48, 56, segmenti, Math.round(segmenti * 0.55));
  const materiale = new THREE.MeshStandardMaterial({
    color: 0x12161c,
    metalness: 0.42,
    roughness: 0.48,
  });
  const mesh = new THREE.Mesh(geometria, materiale);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0, -10);
  const posizioni = geometria.attributes.position;
  const originali = Float32Array.from(posizioni.array);

  function aggiorna(tempo) {
    const t = tempo * 0.14;
    for (let i = 0; i < posizioni.count; i += 1) {
      const indice = i * 3;
      const x = originali[indice];
      const y = originali[indice + 1];
      posizioni.array[indice + 2] =
        (Math.sin(x * 0.28 + t * 1.6) * 0.5 +
          Math.sin(y * 0.36 - t * 1.15) * 0.34 +
          Math.sin((x + y) * 0.19 + t * 0.78) * 0.26) * 0.1;
    }
    posizioni.needsUpdate = true;
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

function creaParticelle(quantita) {
  const geometria = new THREE.BufferGeometry();
  const posizioni = new Float32Array(quantita * 3);
  const velocita = new Float32Array(quantita);
  const sfasamenti = new Float32Array(quantita);
  for (let i = 0; i < quantita; i += 1) {
    const indice = i * 3;
    const angolo = Math.random() * Math.PI * 2;
    const distanza = Math.sqrt(Math.random()) * 10;
    posizioni[indice] = Math.cos(angolo) * distanza;
    posizioni[indice + 1] = Math.random() * 6 - 0.4;
    posizioni[indice + 2] = Math.sin(angolo) * distanza * 1.4 - 8;
    velocita[i] = 0.4 + Math.random() * 0.9;
    sfasamenti[i] = Math.random() * Math.PI * 2;
  }
  geometria.setAttribute('position', new THREE.BufferAttribute(posizioni, 3));
  const materiale = new THREE.PointsMaterial({
    color: 0xffd9a8,
    size: 0.05,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: true,
  });
  const punti = new THREE.Points(geometria, materiale);
  const attributo = geometria.attributes.position;

  function aggiorna(delta, tempo) {
    for (let i = 0; i < quantita; i += 1) {
      const indice = i * 3;
      attributo.array[indice + 1] += 0.03 * velocita[i] * delta * 10;
      if (attributo.array[indice + 1] > 5.4) attributo.array[indice + 1] = -0.4;
      attributo.array[indice] += Math.sin(tempo * 0.35 + sfasamenti[i]) * delta * 0.09;
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

function creaAmbiente(renderer) {
  const generatore = new THREE.PMREMGenerator(renderer);
  const cabina = new THREE.Scene();
  cabina.add(new THREE.Mesh(
    new THREE.BoxGeometry(22, 12, 22),
    new THREE.MeshBasicMaterial({ color: 0x1d242d, side: THREE.BackSide })
  ));
  const pannelli = [
    { pos: [0, 5.8, 0], scala: [12, 0.1, 9], colore: 0xffffff, intensita: 2.2 },
    { pos: [-8, 2, 2], scala: [0.1, 7, 9], colore: 0xffd9a0, intensita: 1.6 },
    { pos: [8, 1.5, -1], scala: [0.1, 6, 8], colore: 0xff6a5a, intensita: 1.2 },
  ];
  for (const pannello of pannelli) {
    const materiale = new THREE.MeshBasicMaterial({ color: pannello.colore });
    materiale.color.multiplyScalar(pannello.intensita);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materiale);
    mesh.position.set(...pannello.pos);
    mesh.scale.set(...pannello.scala);
    cabina.add(mesh);
  }
  const mappa = generatore.fromScene(cabina, 0.04);
  generatore.dispose();
  return mappa.texture;
}
