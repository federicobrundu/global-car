Sei l’agente di sviluppo per un progetto commerciale reale. Devi costruire **interamente** un sito vetrina 3D per **Global Car** (carrozzeria, Roma), pubblicabile su **GitHub Pages**, seguendo il metodo **3D Web Lab** descritto in:

`Documenti/3D-WEB-LAB-Manuale-Teorico.md`

**Non inventare un altro metodo.** Rispetta moduli 1–5 (setup, fondamenta 3D, struttura pagina, libreria effetti, mobile/velocità), appendici B (checklist), C (come chiedere), D (libreria prompt — adatta i testi al cliente).

### Regola obbligatoria sulle skill

Le skill del corso sono **solo** in questa cartella (leggile integralmente **prima** di scrivere codice nella fase indicata; non improvvisare):

`claude-skills-export/skills/`

**NON usare** `higgsfield-websites` (è React/Cloudflare/Higgsfield hosting — stack diverso da questo progetto).

**Skill da usare in questo ordine:**

| Fase | Leggi questo file SKILL.md |
|------|---------------------------|
| Direzione visiva e layout | `frontend-design`, `web-design-guidelines`, `extract-design-system` |
| Struttura 3D | `threejs-fundamentals`, `threejs-lighting`, `threejs-materials`, `threejs-interaction`, `threejs-animation` |
| Effetti e scroll | `ui-animation` |
| Caricamento modelli (se servono GLB) | `threejs-loaders`, `threejs-textures` |
| Post-processing (parsimonia, solo desktop) | `threejs-postprocessing` |
| Media con Higgsfield (MCP **user-higgsfield** o CLI secondo skill) | `higgsfield-generate` — per video hero / ambienti / image-to-video |
| Se serve trovare altre skill | `find-skills` |

Per ogni fase: apri il `SKILL.md`, applica le regole scritte lì, poi implementa.

### Contesto cliente

- **Nome:** Global Car (Global Car S.r.l.)
- **Città:** Roma (RM)
- **Sito attuale (contenuti e tono):** https://globalcarsrl.it/
- **Obiettivo commerciale del nuovo sito:** telefonate, richieste preventivo, contatto WhatsApp — il 3D **amplifica**, non sostituisce testo e CTA (Modulo 3).
- **Tre servizi da mettere in evidenza (priorità commerciale):**
  1. Verniciatura
  2. Riparazione sinistri
  3. Supporto gestione sinistri  
  (Puoi mantenere anche diagnostica/gomme/revisione come servizi secondari se coerente con il sito attuale.)

**Dati di contatto (usa questi, verifica coerenza con globalcarsrl.it):**

- Sede: Via Galatea 127, 00155 Roma (RM)
- Tel: 06 6220 8600
- WhatsApp: 392 1737 628
- Email: info@globalcarsrl.it
- Carroattrezzi: 393 984 0463
- P.IVA: 16798581001
- Social: Facebook, Instagram (link placeholder `#` se non forniti — commenta in README)

**Cartella di lavoro (unica root del sito):**

`Progetti/Sito Carrozzeria Luigi/`

**Asset già forniti (usa queste foto reali; comprimi prima dell’uso):**

`Progetti/Sito Carrozzeria Luigi/Immagini/`

Elenco file: Riparazione-Auto-6-1024x1024.png, Global-Car-Foto-About-Us.png, DSC4870-1-scaled.jpg, DSC4945-Modifica-scaled.jpg, Header-Motore.png, Foto-1-1.png, Foto-2.png, happy-men-in-auto-repair-service-768x512.jpg, engine-repair-2/3.png, ecc.

**Licenza:** sono materiali del cliente — non sostituirli con stock generico senza motivo.

### Stack tecnico (vincolante — Modulo 9 adattato a Cursor)

- **HTML semantico** + **CSS** + **JavaScript** + **Three.js** (no React obbligatorio per questo deliverable).
- **Dev server locale:** Vite (o equivalente) — mai aprire `index.html` con doppio clic per testare GLB/asset.
- **3D:** effetti generativi + hero interattiva; **opzionale** un GLB leggero solo se aggiunge valore senza superare budget mobile.
- **Higgsfield (MCP connesso):** generazione video/immagini per hero, texture HDR/IBL, eventuale image-to-video da foto reale — prompt in stile **Appendice D.5** del manuale.
- **Modulo 10:** se usi video Higgsfield legato allo scroll, estrai fotogrammi con **ffmpeg** (24–40 frame, WebP, serie mobile ridotta).
- **Prestazioni:** degradazione mobile Modulo 5; scena in pausa quando non visibile; `prefers-reduced-motion`.
- **SEO:** tutto il testo importante in HTML; JSON-LD `AutoRepair` / `LocalBusiness`; meta title/description in italiano.

### Architettura pagina (Modulo 3.4)

Implementa almeno:

1. **Header** — logo/nome, anchor, CTA “Chiama ora” e “WhatsApp” sempre visibili su mobile.
2. **Hero 3D** — titolo “Global Car”, sottotitolo orientato a riparazioni rapide e sinistri; testo in HTML sopra canvas; leggibilità (velatura/scuro sulla scena).
3. **Chi siamo** — testo da sito attuale, foto reale.
4. **Servizi (3 card principali)** — verniciatura, riparazione sinistri, gestione sinistri + eventuale griglia secondaria.
5. **Sezione “Cuore 3D”** — scroll-linked: rotazione auto / sequenza fotogrammi / particelle officina (scegli **una** famiglia effetto, non quattro insieme — Modulo 4).
6. **Perché sceglierci** — 4 pillar (esperti, tempi, qualità, fornitori).
7. **Recensioni** — almeno quella Google citata sul sito (Romolo Cavassini) + link a lasciare recensione.
8. **Contatti** — form HTML (action `mailto:` o messaggio “invio via backend non incluso” + fallback tel/WhatsApp), mappa embed opzionale (OpenStreetMap iframe leggero).
9. **Footer** — indirizzo, P.IVA, privacy link verso policy esistente se possibile.

Se togli il 3D, il sito deve restare utilizzabile (Modulo 3.1).

### Flusso di lavoro (esegui in sequenza, non saltare passi)

**Fase 0 — Documentazione progetto**

1. Crea `PROGETTO.md` (convenzioni, palette, font, nomi sezioni, stack) — prompt **D.1 “Definire le convenzioni”**.
2. Crea `DECISIONI.md` — elenco decisioni prese (effetti scelti, cosa escluso, licenze asset).
3. Crea `RISORSE-LICENZE.md` — file in `Immagini/` + eventuali asset Higgsfield.

**Fase 1 — Analisi sito esistente**

- Applica mentalmente **D.4 “Analisi di partenza”** su https://globalcarsrl.it/ (gerarchia, tipografia, CTA).
- Proponi in `PROGETTO.md` la struttura sezioni con “3D sì/no” per ogni blocco (come **D.1**).

**Fase 2 — Design**

- Leggi skill `frontend-design` + `web-design-guidelines`.
- Direzione estetica: **industrial / automotive premium** — scuro o contrasto alto, accento colore brand Global Car (estrai da immagini/logo se presenti), tipografia distintiva (no Inter/Roboto default).
- Mobile-first.

**Fase 3 — Scaffold codice**

Struttura suggerita (adatta se serve, documenta in PROGETTO.md):

```
Progetti/Sito Carrozzeria Luigi/
  index.html
  PROGETTO.md
  DECISIONI.md
  RISORSE-LICENZE.md
  README.md
  package.json
  vite.config.js          # base: './' per GitHub Pages project site
  public/
  src/
    main.js
    styles/
    scenes/               # Three.js modulare
    scroll/
    utils/quality.js        # degradazione mobile
  assets/
    images/               # copia/compressione da Immagini/
    video/                # output Higgsfield
    frames/               # sequenza WebP desktop/mobile
```

**Fase 4 — Contenuti Higgsfield (MCP user-higgsfield)**

Usa MCP Higgsfield con prompt derivati da **D.5**:

1. **Video hero (8 s, 16:9):** carrellata lenta e **continua** in officina carrozzeria moderna, luce calda, atmosfera pulita professionale — **nessun taglio di montaggio** (per Modulo 10).
2. **Opzionale image-to-video:** da `Riparazione-Auto-6-1024x1024.png` o foto officina — rotazione lenta, sfondo neutro, **non alterare** forma/colori reali del veicolo (D.5).
3. **HDR/IBL (opzionale):** panorama officina/studio luce uniforme per riflessi PBR su eventuale mesh.

Salva file in `assets/video/` e `assets/images/generated/`. Annota crediti stimati in `DECISIONI.md`.

Poi **D.5 sequenza Modulo 10:** ffmpeg → 30 frame @ 1200px WebP q80 + 20 frame @ 800px mobile; implementa canvas scroll-linked con precaricamento e progress bar.

**Fase 5 — Implementazione Three.js**

- Leggi e applica `threejs-fundamentals`, `threejs-lighting`, `threejs-interaction`, `ui-animation`.
- Hero: mouse follow con **smoothing** (Modulo 3.2).
- Scroll: smorzamento sul valore scroll (Modulo 3.3).
- `IntersectionObserver`: pausa render quando canvas non visibile.
- Qualità a 3 livelli (`utils/quality.js`) — prompt **D.3 degradazione mobile**.

**Fase 6 — Ottimizzazione**

- Comprimi tutte le immagini (target &lt; 300 KB hero se possibile).
- Peso totale pagina iniziale ragionevole su 4G; checklist **Appendice B**.
- Esegui revisione **D.6 “Controllo finale”** (solo elenco problemi, poi correggi).

**Fase 7 — GitHub + GitHub Pages**

1. In `Progetti/Sito Carrozzeria Luigi/`: `git init`, `.gitignore` (node_modules, .env).
2. Chiedi all’utente **solo se manca:** URL repo GitHub remoto (es. `https://github.com/federicobrundu/global-car.git`) e se Pages sarà **user site** (`username.github.io`) o **project site** (`username.github.io/repo-name/`).
3. Configura `vite.config.js` con `base: '/NOME-REPO/'` per project site, oppure `base: '/'` per user site.
4. Script build: `npm run build` → output in `dist/`.
5. Pubblicazione Pages (scegli una strategia e documenta in README):
   - **Opzione A (consigliata):** branch `gh-pages` con solo contenuto di `dist/` (usa `gh-pages` npm package o azione GitHub).
   - **Opzione B:** GitHub Action che builda e deploya `dist` su Pages.
6. Dopo push: istruzioni in README per attivare Pages (Settings → Pages → branch `gh-pages` o GitHub Actions).
7. **Non fare push** senza che l’utente abbia fornito remote/credenziali; prepara tutto e lascia comandi pronti.

**Fase 8 — Consegna**

- `README.md` per il cliente: come modificare testi (italiano semplice, **D.6 documentazione cliente**).
- Verifica link tel: `tel:+390662208600`, WhatsApp: `https://wa.me/393921737628`.
- Elenco file e come avviare `npm install && npm run dev`.

### Regole operative (Modulo 1 e C)

- Una modifica significativa per volta quando debugghi.
- Sintomo + console error intero per bug (**D.3**).
- Non riscrivere file interi se basta un patch.
- Commenti codice in **italiano** dove spiegano logica non ovvia.
- Lingua sito: **italiano**.

### Criteri di accettazione (tutti obbligatori)

- [ ] Sito completo nella cartella `Progetti/Sito Carrozzeria Luigi/`
- [ ] Hero 3D o sequenza scroll funzionante + fallback statico
- [ ] Mobile degradato ma fluido; `prefers-reduced-motion` rispettato
- [ ] CTA telefono/WhatsApp funzionanti
- [ ] Testo SEO in HTML + LocalBusiness JSON-LD
- [ ] PROGETTO.md, DECISIONI.md, RISORSE-LICENZE.md compilati
- [ ] `npm run build` senza errori
- [ ] README con deploy GitHub Pages
- [ ] Skill del corso lette e rispettate (non stack higgsfield-websites)

### Prima azione ora

1. Leggi `Documenti/3D-WEB-LAB-Manuale-Teorico.md` (almeno Moduli 3, 4, 5, 9, 10 e Appendici B, D).
2. Leggi `frontend-design/SKILL.md` e `threejs-fundamentals/SKILL.md`.
3. Crea PROGETTO.md con proposta sezioni + scelta effetto 3D per Global Car.
4. Chiedi all’utente **solo** l’URL del repository GitHub e il tipo di GitHub Pages (user vs project) se non li trovi nel workspace.
5. Procedi con scaffold Vite + prima versione hero senza attendere altro.

---

## FINE PROMPT
