# PROGETTO — Sito 3D Global Car

Documento di riferimento del progetto. Va riletto all'inizio di ogni sessione di lavoro.
Metodo: **3D Web Lab** (`Documenti/3D-WEB-LAB-Manuale-Teorico.md`).

---

## 1. Cliente e obiettivo

| Voce | Valore |
|---|---|
| Ragione sociale | Global Car S.r.l. |
| Settore | Carrozzeria / autoriparazione |
| Città | Roma (RM) |
| Sito attuale | https://globalcarsrl.it/ |
| Attiva dal | 2022 |

**Obiettivo commerciale del sito** (in ordine di priorità):

1. Generare **telefonate** (il titolare chiude al telefono)
2. Generare **richieste di preventivo** dal form
3. Generare contatti **WhatsApp** (canale ad alto tasso di lettura)

**Pubblico**: automobilisti di Roma est (zona Via Galatea / Tor Tre Teste / Centocelle), età 25-65, spesso in situazione di urgenza o post-sinistro. Navigano **da telefono**, frequentemente con connessione mobile.

**Conseguenza progettuale**: il telefono cliccabile e il WhatsApp devono essere raggiungibili in ogni momento su mobile, senza scroll. Il 3D amplifica il messaggio, non lo sostituisce (Modulo 3.1).

---

## 2. Servizi

**Primari** (quelli su cui si vende, con sezione dedicata):

1. **Verniciatura** — il servizio a maggior margine percepito, quello dove la qualità si vede
2. **Riparazione sinistri** — il volume
3. **Supporto gestione sinistri** — il differenziatore vero: pratica assicurativa gestita dalla carrozzeria

**Secondari** (griglia compatta, già presenti sul sito attuale):

- Diagnostica auto
- Riparazioni rapide
- Sostituzione gomme
- Revisione auto
- Carroattrezzi

---

## 3. Contatti (fonte: globalcarsrl.it)

| Canale | Valore | Uso nel sito |
|---|---|---|
| Sede legale | Via Galatea 127, 00155 Roma (RM) | footer, contatti, JSON-LD |
| Telefono | 06 6220 8600 | `tel:+390662208600` |
| WhatsApp | 392 1737 628 | `https://wa.me/393921737628` |
| Email | info@globalcarsrl.it | `mailto:` |
| PEC | globalcar2022@legalmail.it | footer |
| Carroattrezzi | 393 984 0463 | CTA emergenza |
| P.IVA | 16798581001 | footer |

Social: Facebook e Instagram esistono sul sito attuale ma gli URL esatti non sono stati forniti → segnaposto `#` documentati nel README.

---

## 4. Direzione visiva

**Concept**: *industrial premium*. L'officina come laboratorio di precisione, non come garage. Il riferimento emotivo è la cabina di verniciatura: fondo scuro, luce controllata, superficie che riflette.

**Perché**: la categoria (carrozzerie di zona) usa quasi sempre template chiari e generici con stock photo. Un fondo carbone con un solo accento saturo colloca Global Car in una fascia percepita diversa a costo zero (Modulo 2.6 — il posizionamento).

### Palette (tre colori + un accento, come da D.4)

```css
--carbon:    #0B0D10;  /* fondo base */
--surface:   #15191E;  /* card, sezioni alternate */
--surface-2: #1E242B;  /* bordi, hover */
--aluminium: #C9CFD6;  /* testo corpo */
--white:     #F5F7F9;  /* titoli */
--accent:    #FF3B2F;  /* UNICO accento: CTA, dettagli, luce rim 3D */
--accent-dim:#B32018;  /* stati premuti */
```

Luce calda `#FFB020` usata **solo** come luce nella scena 3D, non come colore di interfaccia.

### Tipografia

| Ruolo | Font | Note |
|---|---|---|
| Display / titoli | **Archivo** (variable, `wdth` espanso, 700-900) | grotesque tecnico, industriale |
| Corpo | **Karla** | leggibile, carattere non generico |

Vietati: Inter, Roboto, Arial, system-ui come font principali, Space Grotesk (scelta troppo battuta).

### Scala tipografica

`clamp()` fluido, rapporto ~1.25 su mobile e ~1.333 su desktop. Definita in `src/styles/base.css`.

---

## 5. Scelta 3D per sezione (Modulo 3.4 + 4)

| Sezione | 3D? | Perché |
|---|---|---|
| Header | No | Deve essere istantaneo e sempre leggibile |
| **Hero** | **Sì — Famiglia 2 (generativo)** | Nessun modello da scaricare, carica subito, infinitamente adattabile al mobile |
| Chi siamo | No | Serve respiro e foto reale |
| Servizi primari | No (solo micro-interazioni) | Il contenuto è informativo, il 3D distrarrebbe |
| **Cuore 3D — Il percorso** | **Sì — sequenza immagini (Modulo 10)** | Scroll fluido garantito anche su mobile, nessun problema di autoplay |
| Perché sceglierci | No | Testo e icone |
| Recensioni | No | Testo |
| Contatti | No | Zero attrito sulla conversione |
| Footer | No | — |

### Hero — specifica dell'effetto

**Concept**: superficie verniciata sotto luce da cabina.

- Una **superficie metallica ondulata** (piano deformato da rumore) con `metalness` alto e `roughness` basso: è la lamiera verniciata. È il servizio principale reso visivamente.
- **Particelle sospese** (nebbia di vernice / polvere nei fasci di luce), densità adattiva.
- Illuminazione: ambientale debole + direzionale calda come key + **rim light rossa** sull'accento (Modulo 2.1).
- **Reazione al mouse ritardata e smorzata** (interpolazione, Modulo 3.2): l'inclinazione insegue il cursore, non lo copia.
- Sopra la scena, in **HTML normale**: H1, sottotitolo, due CTA.
- La foto della **Mercedes A45 isolata** (`Riparazione-Auto-6-1024x1024.png`) sovrapposta come livello con parallasse leggera.
- Leggibilità: gradiente scuro dal basso + la scena è progettata con la zona del testo intenzionalmente vuota (la terza soluzione di Modulo 3.2, la più elegante).

**Esclusi deliberatamente**: vetro/rifrazione, ombre dinamiche, riflessi in tempo reale, più di un post-effetto. Motivo: costo su mobile (Modulo 5.2).

### Cuore 3D — specifica

Sequenza di fotogrammi legata allo scroll (Modulo 10) che mostra il percorso **sinistro → riparazione → consegna**. Sorgente: video generato con Higgsfield (carrellata continua, nessun taglio). Due serie: desktop 30 frame @1200px WebP, mobile 20 frame @800px. Fallback: primo fotogramma come immagine statica.

---

## 6. Stack e convenzioni

### Stack

- HTML semantico, CSS moderno (custom properties, `clamp`, container query dove utile), JavaScript ES modules
- **Three.js** per la scena 3D
- **Vite** come dev server e bundler
- Nessun framework UI, nessun React (deliverable statico per GitHub Pages)

### Struttura cartelle

```
Sito Carrozzeria Luigi/
├─ index.html
├─ package.json
├─ vite.config.js
├─ PROGETTO.md            ← questo file
├─ DECISIONI.md
├─ RISORSE-LICENZE.md
├─ README.md
├─ public/                 copiata as-is nella build
│  ├─ assets/
│  │  ├─ images/           foto cliente ottimizzate
│  │  ├─ generated/        output Higgsfield
│  │  └─ frames/           sequenza scroll (desktop/ e mobile/)
│  ├─ favicon.svg
│  └─ robots.txt
├─ src/
│  ├─ main.js              entry: orchestrazione moduli
│  ├─ styles/
│  │  ├─ base.css          reset, variabili, tipografia
│  │  ├─ layout.css        header, sezioni, footer
│  │  └─ components.css    card, bottoni, form
│  ├─ scenes/
│  │  └─ hero-scene.js     scena Three.js hero
│  ├─ scroll/
│  │  ├─ frame-sequence.js canvas scroll-linked (Modulo 10)
│  │  └─ reveal.js         entrate sezioni
│  └─ utils/
│     ├─ quality.js        livelli qualità + misura FPS
│     └─ motion.js         lerp, clamp, prefers-reduced-motion
└─ Immagini/               ORIGINALI del cliente, non toccare
```

### Denominazione

- File e cartelle: `kebab-case`
- Classi CSS: `blocco__elemento--variante` (BEM semplificato)
- Variabili JS: `camelCase`; costanti di configurazione `SCREAMING_SNAKE_CASE` in cima al file
- ID sezioni (ancore): `#chi-siamo`, `#servizi`, `#percorso`, `#perche-noi`, `#recensioni`, `#contatti`

### Regole non negoziabili

1. Il testo che conta sta **nell'HTML**, mai dentro la scena 3D (SEO + accessibilità, Modulo 2.5)
2. Ogni animazione ha un percorso `prefers-reduced-motion: reduce`
3. La scena si mette **in pausa** quando non è visibile (`IntersectionObserver`)
4. Si animano solo `transform` e `opacity`; mai `width`/`height`/`top`/`left`; mai `transition: all`
5. Ogni blocco 3D espone i suoi parametri **in cima al file**, così è riusabile (Modulo 4.1)
6. Commenti in italiano dove spiegano una scelta non ovvia

### Budget prestazioni (Modulo 5)

| Metrica | Obiettivo |
|---|---|
| Primo contenuto visibile | HTML immediato, scena dopo |
| Peso iniziale (senza sequenza) | < 600 KB |
| Immagine singola | < 300 KB |
| Sequenza desktop completa | < 2 MB |
| Sequenza mobile completa | < 900 KB |
| FPS target | 60 desktop, ≥ 30 mobile fascia media |

---

## 7. Pubblicazione

- **GitHub Pages**, build Vite in `dist/`
- `base` in `vite.config.js` da allineare al tipo di Pages (project site → `/nome-repo/`)
- Strategia: workflow GitHub Actions che builda e pubblica `dist`
- Dominio: resta intestato al cliente (Modulo 3.5) — su Pages si userà l'URL di progetto fino a eventuale dominio custom
