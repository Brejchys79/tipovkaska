# Tipovačka (Vite + React + Firebase + Netlify)

## Lokální spuštění
```bash
npm install
npm run dev
```
Aplikace poběží na http://localhost:5173

## Deploy na Netlify
- `netlify.toml` a `_redirects` jsou připravené.
- Stačí propojit repozitář v Netlify a nastavit build: `npm run build`, publish: `dist`.

## Struktura Firestore
- `matches`: { teamA, teamB, isSpecial, result, scorer, createdAt }
- `tips`: documentId = `${user}_${matchId}`, data: { user, matchId, score, scorer, createdAt }

## Bodování
- 5 bodů za přesný výsledek.
- 3 body za správného vítěze (pokud není přesný výsledek).
- 3 body za správného střelce.
- Bonus +3 body navíc pro „Zápas kola“ při přesném tipu.