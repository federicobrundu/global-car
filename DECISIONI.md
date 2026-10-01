# DECISIONI — Sito 3D Global Car

Elenco crescente di scelte già fatte e **non più in discussione**. Serve a non girare in tondo
(Modulo 1.2). Se una decisione va cambiata, si riscrive qui con la data e il motivo.

---

## Stack e impianto

| # | Decisione | Motivo |
|---|---|---|
| 1 | HTML/CSS/JS + Three.js, **nessun framework** | Sito vetrina statico; React aggiungerebbe complessità senza ritorno (Modulo 1.4) |
| 2 | Vite come dev server e bundler | Anteprima live con ricarica automatica, indispensabile (Modulo 1.5); build statica adatta a Pages |
| 3 | Pubblicazione su **GitHub Pages** | Richiesta del committente per la fase di test; piano gratuito, certificato incluso (Modulo 9.4) |
| 4 | Skill `higgsfield-websites` **non usata** | Prescrive React 19 + TanStack + Cloudflare Worker: stack incompatibile con questo deliverable |
| 5 | Three.js caricato come dipendenza npm, non da CDN | Build riproducibile e versione bloccata |

## Design

| # | Decisione | Motivo |
|---|---|---|
| 6 | Tema **scuro** (carbone `#0B0D10`) | Differenzia dalla categoria, che è tutta su fondo bianco; valorizza la scena 3D |
| 7 | **Un solo accento**: rosso segnale `#FF3B2F` | Regola della palette ridotta (D.4); il rosso è coerente con automotive e con l'urgenza del post-sinistro |
| 8 | Font **Archivo** (display) + **Karla** (corpo) | Industriali e distintivi; esclusi Inter/Roboto/Space Grotesk per evitare l'estetica generica |
| 9 | Luce calda `#FFB020` solo nella scena 3D | Serve all'atmosfera della cabina di verniciatura, non all'interfaccia |

## 3D ed effetti

| # | Decisione | Motivo |
|---|---|---|
| 10 | Hero + home = **un solo viaggio 3D** (camera e auto collegate allo scroll) | Il PNG statico e il pannello Ken Burns non raccontavano l'azienda; lo scroll è la linea del tempo (Modulo 3.3) |
| 11 | **Nessun modello GLB** in questa versione | Global Car non ha file 3D propri; l'auto è la foto ritagliata del cliente, in scena come piano con alpha |
| 12 | Cuore 3D = **ingresso in cabina** durante Come lavoriamo, stessa scena della hero | Un secondo canvas staccato spezzava il racconto |
| 13 | **Scartati**: vetro/rifrazione, ombre dinamiche, riflessi real-time, più di un post-effetto | Sono le voci più care del budget prestazioni (Modulo 5.2) e il pubblico è su mobile |
| 14 | Un solo effetto pesante per schermata | Evita l'errore tipico del Modulo 4.7 |
| 15 | Zona del testo hero tenuta **intenzionalmente vuota** nella composizione della scena | È la soluzione di leggibilità più elegante delle tre (Modulo 3.2), senza velature pesanti |

## Contenuti

| # | Decisione | Motivo |
|---|---|---|
| 16 | Si usano **solo le foto fornite dal cliente** per rappresentare officina, personale e lavori | Un'immagine generata non può rappresentare un luogo reale come se fosse una foto (Modulo 9.2 — pratica commerciale scorretta) |
| 17 | Higgsfield usato **solo** per: atmosfera/sfondo astratto, ambiente di illuminazione, sequenza del "percorso" dichiarata come illustrativa | Perimetro lecito: sfondi, atmosfere, texture |
| 18 | Testi riscritti a partire da quelli di globalcarsrl.it, senza inventare affermazioni | Nessuna dichiarazione non verificata sull'attività (Modulo 7.2) |
| 19 | I tre servizi primari sono verniciatura, riparazione sinistri, gestione sinistri | Indicazione diretta del committente |
| 20 | Recensione Google di Romolo Cavassini riportata testualmente | È pubblica sul sito attuale; attribuzione mantenuta |
| 21 | La Mercedes A45 della foto cliente è usata come soggetto hero | È materiale già pubblicato dal cliente; marchio di terzi visibile → annotato in RISORSE-LICENZE.md |

## Prestazioni e accessibilità

| # | Decisione | Motivo |
|---|---|---|
| 22 | Tre livelli di qualità (alto/medio/basso) scelti per larghezza schermo + core CPU + **misura FPS nei primi secondi** | È la tecnica più affidabile (Modulo 5.3) |
| 23 | `devicePixelRatio` limitato a 2 su desktop e 1.5 su mobile | I post-effetti e il fill rate scalano con la risoluzione (Modulo 5.2) |
| 24 | Render in pausa fuori viewport via `IntersectionObserver` | Evita il telefono che scalda, difetto invisibile nel preventivo e fortissimo nella percezione (Modulo 2.5) |
| 25 | `prefers-reduced-motion: reduce` disattiva parallasse, scroll-linked e rotazioni | Requisito di accessibilità e in crescita anche legale (Modulo 3.3) |
| 26 | Immagine statica di ripiego se WebGL non è disponibile | Copre i browser interni ai social (Modulo 5.5) |

## Pubblicazione

| # | Decisione | Motivo |
|---|---|---|
| 27 | Deploy via **GitHub Actions** su Pages, non commit manuale di `dist/` | Niente artefatti di build nel repository; pubblicazione automatica a ogni push |
| 28 | `vite.config.js` con `base` configurabile | Project site e user site hanno percorsi diversi; va deciso prima del primo deploy |
| 29 | Form contatti senza backend: `mailto:` + CTA telefono/WhatsApp come canali primari | GitHub Pages serve solo file statici; nessun server per processare POST |

---

## Crediti Higgsfield consumati

Da aggiornare a ogni generazione (va nel preventivo come costo di produzione, Modulo 9.2).

| Data | Asset | Modello | Note |
|---|---|---|---|
| 2026-10-01 | Video 8 s carrellata officina | Seedance 2.5 | **Non generato**: richiede piano Plus |
| 2026-10-01 | 6 atmosfere (cabina, nebbia, diagnostica, pannello, gomma, corridoio) | GPT Image 2.5 | Generate con piano Basic. Uso: texture 3D percorso + hero interne. Non rappresentano il locale reale. |

**Percorso:** scena Three.js (camera lungo quattro stazioni). Le texture sono illustrative, non foto dell'officina. Le foto reali restano in Chi siamo / Storia.

---

## In sospeso — serve una risposta dal committente

| # | Domanda | Blocca cosa |
|---|---|---|
| A | URL del repository GitHub | il `git remote` e il primo deploy |
| B | Pages di tipo **project** (`utente.github.io/repo/`) o **user** (`utente.github.io`) | il valore di `base` in `vite.config.js` |
| C | URL esatti di Facebook e Instagram | i link social nel footer (ora segnaposto) |
| D | Logo vettoriale di Global Car | ora si usa un lettering tipografico |
