# RISORSE E LICENZE — Global Car

Ogni risorsa usata nel sito. Uso commerciale: materiale del cliente o codice originale.

---

## Foto del cliente (uso autorizzato per il sito Global Car)

| File originale (`Immagini/`) | File nel sito | Uso | Licenza |
|---|---|---|---|
| `Riparazione-Auto-6-1024x1024.png` | `public/assets/images/auto-hero.webp` | Soggetto hero (auto ritagliata) | Cliente. Visibile marchio Mercedes di terzi: già pubblicato sul sito attuale. |
| `DSC4945-Modifica-scaled.jpg` | `officina-lavoro.jpg`, sequenza Percorso, `og-global-car.jpg` | Officina reale, Open Graph | Cliente |
| `DSC4870-1-scaled.jpg` | `officina-interno.jpg` | Riserva / fallback | Cliente |
| `Global-Car-Immagini-1080x1080-1-1024x1024.png` | `officina-veicoli.jpg` | Riserva | Cliente |
| `Global-Car-Foto-About-Us.png` | `carrozziere.jpg` | Riserva chi siamo | Cliente |

Gli originali in `Immagini/` **non vengono modificati**. Sul sito si usano solo le copie ottimizzate.

Foto blog/stock presenti in `Immagini/` (climatizzatore, fluidi, ecc.) **non usate** in questa versione: non servono alle sezioni del vetrina 3D.

---

## Higgsfield

| Tentativo | Esito | Note |
|---|---|---|
| Video 8 s Seedance 2.5 (carrellata officina) | **Bloccato** | Account: piano inferiore a Plus. Messaggio: `Requires plus plan or higher`. |
| Immagine panorama IBL GPT Image 2.5 | **Bloccato** | `Requires basic plan or higher` (preflight costo 0,25 crediti riuscito, generazione no). |

Finché il piano Higgsfield non copre la generazione, **nessun asset sintetico** entra nel sito. La sequenza Percorso è una carrellata (Ken Burns) sulla foto reale `DSC4945`.

Quando Higgsfield sarà disponibile: salvare il video in `public/assets/video/percorso.mp4` e lanciare `npm run frames`.

---

## Codice e librerie

| Risorsa | Licenza | Uso |
|---|---|---|
| Three.js | MIT | Scena hero |
| Vite | MIT | Build |
| Font Archivo, Karla | SIL OFL (Google Fonts) | Tipografia |
| Codice del sito | originale, proprietà da trasferire al cliente a consegna | — |

---

## Link esterni

- Privacy: https://globalcarsrl.it/privacy-e-cookie-policy/
- Mappa: OpenStreetMap embed
- Recensione: Google Maps search su sede
