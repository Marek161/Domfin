# DomFinanse (React + CDN + Firebase)

Prosta aplikacja do zarządzania opłatami domowymi.

## Stos technologiczny (aktualny)
- React 18 (ESM)
- Vite (dev server, HMR, build)
- Firebase Web SDK: App, Firestore, Analytics, App Check (reCAPTCHA v3)
- CSS (własny, responsywny): `src/styles/global.css`

## Struktura plików (Vite)

```
.
├─ index.html                     # Vite
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ main.jsx                    # start React (createRoot)
│  ├─ App.jsx                     # root aplikacji (header + 2 zakładki)
│  ├─ app/
│  │  ├─ firebaseContext.jsx      # kontekst Firestore: CRUD + podsumowania
│  │  ├─ hooks.jsx                # useFetch (API porady) + createId
│  │  └─ ui.jsx                   # reużywalne UI (Card, Tabs, Formularz, Listy, Wykresy)
│  ├─ lib/
│  │  ├─ firebase.js              # inicjalizacja SDK, App Check (reCAPTCHA v3)
│  │  └─ firebaseConfig.js        # config z .env.local (fallback dev)
│  └─ styles/
│     └─ global.css               # stylowanie (dark, animacje, responsywność)
├─ vite.config.js
├─ package.json
├─ README.md
└─ _headers                       # nagłówki bezpieczeństwa ( opcjonalne )
```

## Funkcje
- Dodawanie, lista, usuwanie i oznaczanie opłat jako zapłacone
- Podsumowania (zapłacone / do zapłaty / razem), wykres kołowy i słupkowy
- Widżet „Porada dnia” (API) z obsługą ładowania/błędów i lokalnym fallbackiem
- Obsługa błędów: globalny overlay + React ErrorBoundary
- A11y: role ARIA dla zakładek, ukryte etykiety, obsługa klawiatury
- Responsywność: układy mobilne (< 680px) i mikro-animacje
- Zabezpieczenia: wymuszanie HTTPS, App Check, przykładowe nagłówki w `_headers`

