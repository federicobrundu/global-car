/**
 * SCENA PERCORSO — camera che avanza in un corridoio di stazioni.
 *
 * Sostituisce la sequenza Ken Burns sulla foto dell'officina: quel movimento
 * non spiegava il processo. Qui lo scroll pilota la camera lungo quattro
 * "baie" illuminate, ognuna con una texture Higgsfield (atmosfera, non foto
 * del locale reale). Il testo resta HTML a fianco (Modulo 3).
 */

import * as THREE from 'three';
import { smorza, limita, progressoScorrimento, movimentoRidotto } from '../utils/motion.js';
import { rilevaLivello } from '../utils/quality.js';

const CONFIG = {
  stazioni: [
    'assets/generated/cabina-verniciatura.webp',
    'assets/generated/diagnostica-atmosfera.webp',
    'assets/generated/pannello-verniciato.webp',
    'assets/generated/corridoio-officina.webp',
  ],
  distanzaStazioni: 9,
  camera: {
    campoVisivo: 48,
    zInizio: 7.2,
    zFine: -28,
  },
  smorzamento: 3.2,
};

export function creaScenaPercorso(tela, sezione, passaggi) {
  const livello = rilevaLivello();
  const ridotto = movimentoRidotto();
  const base = import.meta.env.BASE_URL ?? '/';

  const renderer = new THREE.WebGLRenderer({
    canvas: tela,
    antialias: livello.nome !== 'basso',
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x101318, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scena = new THREE.Scene();
  scena.fog = new THREE.Fog(0x0b0d10, 14, 48);

  const camera = new THREE.PerspectiveCamera(CONFIG.camera.campoVisivo, 1, 0.1, 80);
  camera.position.set(0, 1.2, CONFIG.camera.zInizio);
  camera.lookAt(0, 1.15, CONFIG.camera.zInizio - 8);

  scena.add(new THREE.AmbientLight(0xffffff, 0.55));
  const luceKey = new THREE.DirectionalLight(0xffb020, 2.2);
  luceKey.position.set(-4, 8, 6);
  scena.add(luceKey);
  const luceAccento = new THREE.DirectionalLight(0xff3b2f, 1.2);
  luceAccento.position.set(5, 2, -4);
  scena.add(luceAccento);

  const pavimento = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 60),
    new THREE.MeshStandardMaterial({
      color: 0x12161b,
      metalness: 0.85,
      roughness: 0.28,
    })
  );
  pavimento.rotation.x = -Math.PI / 2;
  pavimento.position.set(0, 0, -12);
  scena.add(pavimento);

  const caricatore = new THREE.TextureLoader();
  const quante = CONFIG.stazioni.length;

  CONFIG.stazioni.forEach((relativo, indice) => {
    const z = -indice * CONFIG.distanzaStazioni;
    const gruppo = new THREE.Group();
    gruppo.position.set(0, 1.35, z);
    scena.add(gruppo);

    const cornice = new THREE.Mesh(
      new THREE.PlaneGeometry(6.2, 3.7),
      new THREE.MeshBasicMaterial({ color: 0xff3b2f })
    );
    cornice.position.z = -0.05;
    gruppo.add(cornice);

    const pannello = new THREE.Mesh(
      new THREE.PlaneGeometry(5.9, 3.45),
      new THREE.MeshBasicMaterial({ color: 0x2a323c })
    );
    gruppo.add(pannello);

    caricatore.load(
      `${base}${relativo}`,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        pannello.material.map = texture;
        pannello.material.needsUpdate = true;
      },
      undefined,
      () => {}
    );

    const faretti = new THREE.PointLight(0xffb020, 4.5, 14);
    faretti.position.set(-0.4, 1.6, 1.2);
    gruppo.add(faretti);
  });

  function ridimensiona() {
    const larghezza = tela.clientWidth || window.innerWidth;
    const altezza = tela.clientHeight || sezione.clientHeight || 600;
    camera.aspect = larghezza / Math.max(altezza, 1);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, livello.pixelRatioMassimo));
    renderer.setSize(larghezza, altezza, false);
  }

  ridimensiona();
  const osservatoreDimensioni = new ResizeObserver(ridimensiona);
  osservatoreDimensioni.observe(tela);

  let obiettivoZ = CONFIG.camera.zInizio;
  let zAttuale = CONFIG.camera.zInizio;
  let inEsecuzione = false;
  let idFotogramma = null;
  const orologio = new THREE.Clock();

  function aggiornaDaScroll() {
    const grezzo = progressoScorrimento(sezione);
    const progresso = limita((grezzo - 0.08) / 0.84, 0, 1);
    obiettivoZ = CONFIG.camera.zInizio + (CONFIG.camera.zFine - CONFIG.camera.zInizio) * progresso;

    const attivo = Math.min(quante - 1, Math.floor(progresso * quante));
    passaggi.forEach((passaggio, indice) => {
      passaggio.classList.toggle('e-attivo', indice === attivo);
    });
  }

  function disegna() {
    idFotogramma = requestAnimationFrame(disegna);
    const delta = Math.min(orologio.getDelta(), 0.1);
    zAttuale = smorza(zAttuale, obiettivoZ, CONFIG.smorzamento, delta);
    camera.position.z = zAttuale;
    camera.lookAt(0, 1.15, zAttuale - 7);
    renderer.render(scena, camera);
  }

  function avvia() {
    if (inEsecuzione || ridotto) return;
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
    passaggi.forEach((p, i) => p.classList.toggle('e-attivo', i === 0));
    camera.position.z = CONFIG.camera.zInizio;
    renderer.render(scena, camera);
  } else {
    window.addEventListener('scroll', aggiornaDaScroll, { passive: true });
    aggiornaDaScroll();
  }

  const visibilita = new IntersectionObserver(
    (voci) => {
      if (voci[0].isIntersecting) avvia();
      else ferma();
    },
    { threshold: 0.05 }
  );
  visibilita.observe(sezione);

  return {
    avvia,
    ferma,
    smaltisci() {
      ferma();
      visibilita.disconnect();
      osservatoreDimensioni.disconnect();
      window.removeEventListener('scroll', aggiornaDaScroll);
      renderer.dispose();
    },
  };
}
