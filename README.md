# Atlante 2

Osservatorio educativo sugli effetti delle armi nucleari: simulatore su mappa, enciclopedia, archivio degli ordigni, storia e dati, archivio iconografico. Stime per ordini di grandezza, non previsioni.

Evoluzione dello studio originale realizzato con Grok (conservato intatto in `pre_asssets/grok-workspace/`).

## Avvio

```bash
npm install
npm run dev        # http://127.0.0.1:5187
npm run build      # typecheck + build in dist/
npm run check:physics   # confronto dei raggi con i casi di riferimento
```

## Struttura

- `src/lib/physics/core.ts`: onda d'urto (Brode 1986), pressione dinamica e vento, arrivo del fronte, palla di fuoco, calore con trasmissione atmosferica, radiazione pronta, crateri, nube, magnitudo sismica, orizzonte EMP.
- `src/lib/physics/fallout.ts`: pennacchio gaussiano con rateo H+1 calibrato su Glasstone (1 Mt di fissione), decadimento t^-1,2, dose in una finestra temporale, curve di livello.
- `src/lib/model/effects.ts`: assembla gli effetti di una detonazione (anelli, contorni, funzioni puntuali, tabelle di lookup).
- `src/lib/model/harm.ts`: vittime su griglia di popolazione (GeoNames come dischi o profili di Clark più fondo rurale), curve probit per riparo, più detonazioni combinate e fallout integrato nel riferimento del pennacchio. Gira in un Web Worker (`src/workers/harm.worker.ts`).
- `src/data/`: ordigni, dossier, foto, città, casi di studio, enciclopedia (`encyclopedia.ts`), galleria (`gallery.json`).
- `src/components/`: simulatore (mappa, controlli, risultati, cronologia), viste di consultazione.

## Dati e licenze

- Città: GeoNames cities15000, CC-BY. Le voci annidate (città, quartieri, distretti) sono deduplicate in `src/data/cities.ts`.
- Mappe: tessere pubbliche Esri; meteo e quota: Open-Meteo.
- Immagini: pubblico dominio o licenze libere, con credito e fonte nella galleria.
