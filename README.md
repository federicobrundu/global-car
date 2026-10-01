# Global Car — sito vetrina 3D

Sito della carrozzeria **Global Car S.r.l.** (Via Galatea 127, Roma).  
Costruito con il metodo **3D Web Lab**: HTML, CSS, JavaScript, Three.js. Pubblicazione su GitHub Pages.

Sito attuale del cliente: https://globalcarsrl.it/

---

## Come vederlo sul computer

Serve Node.js (già installato se compare `node -v`).

1. Apri un terminale in questa cartella.
2. Installa le dipendenze (solo la prima volta):

```bash
npm install
```

3. Avvia l’anteprima:

```bash
npm run dev
```

Si apre il browser su `http://localhost:5173`. Ogni salvataggio aggiorna la pagina da solo.

**Non aprire `index.html` con un doppio clic**: i file 3D e gli asset non caricrebbero.

Altri comandi:

| Comando | Cosa fa |
|---|---|
| `npm run build` | Prepara i file per il web (cartella `dist/`) |
| `npm run preview` | Mostra la versione di produzione in locale |
| `npm run ottimizza-immagini` | Comprime le foto del cliente (gli originali restano intatti) |
| `npm run frames` | Crea la sequenza di fotogrammi per “Come lavoriamo” |

---

## Come modificare testi e foto (per il titolare)

Non serve programmare.

- **Testi, telefono, WhatsApp, indirizzo**: apri `index.html` con un editor. Cerca la frase da cambiare e sostituiscila. Non toccare le parti tra `<script` e le classi CSS.
- **Foto**: sostituisci i file in `public/assets/images/` **mantenendo lo stesso nome** (es. `officina-lavoro.jpg`). Poi, se la foto è pesante, lancia `npm run ottimizza-immagini` dopo aver messo l’originale in `Immagini/` e aggiornato lo script, oppure esporta tu un JPEG sotto i 300 KB.
- **Cosa non toccare**: cartelle `src/scenes/`, `src/utils/`, `node_modules/`. Se qualcosa si rompe, chiama chi ha costruito il sito.

Telefono cliccabile: `06 6220 8600`  
WhatsApp: `392 1737 628`

---

## GitHub Pages — pubblicazione

Il sito è **statico**: GitHub Pages lo può ospitare gratis.

### Cosa serve da te (una volta)

1. Crea un repository su GitHub (es. `global-car`).
2. In questa cartella:

```bash
git init
git add .
git commit -m "Primo sito 3D Global Car"
git branch -M main
git remote add origin https://github.com/TUO-UTENTE/global-car.git
git push -u origin main
```

3. Su GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
   Non usare “Deploy from a branch”: pubblicherebbe l’HTML grezzo (pagina bianca, senza CSS).
   Il ramo del repository è `master`; il workflow parte sia da `master` sia da `main`.

Il workflow in `.github/workflows/deploy-pages.yml` costruisce il sito e lo pubblica a ogni push su `main`.

- **Project site** (consigliato): `https://TUO-UTENTE.github.io/global-car/`  
  Il `base` di Vite è `./`, quindi funziona senza cambiare configurazione.
- **User site** (`TUO-UTENTE.github.io`): stesso workflow.

**Non fare push** finché il remote non è stato creato da te. Dominio del cliente: resta intestato a Global Car; Pages è solo per la demo.

---

## Higgsfield

L’MCP è collegato, ma **questo account non può ancora generare** (video: piano Plus; immagini: piano Basic).  
Quando il piano sarà attivo: metti il video 8 s (carrellata continua, nessun taglio) in `public/assets/video/percorso.mp4` e lancia `npm run frames`.

---

## Documenti di progetto

| File | Contenuto |
|---|---|
| `PROGETTO.md` | Convenzioni, palette, stack, scelta 3D |
| `DECISIONI.md` | Scelte già prese |
| `RISORSE-LICENZE.md` | Foto, licenze, tentativi Higgsfield |
| `Documenti/3D-WEB-LAB-Manuale-Teorico.md` | Metodo del corso (cartella superiore) |
