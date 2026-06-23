# PiMedCal

Next.js bedside screening console for four pneumonia and sepsis risk instruments:

- SIRS, Sepsis & Septic Shock Criteria
- Clinical Pulmonary Infection Score (CPIS)
- Drug Resistance in Pneumonia (DRIP) Score
- Shorr Score for MRSA Pneumonia

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production

```bash
npm run build
npm start
```

The application uses the Next.js App Router. The React page shell is in `app/`, while the clinical calculation engine and brand assets are served from `public/`.
