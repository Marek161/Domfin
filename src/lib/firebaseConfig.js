// Konfiguracja Firebase dla DomFinanse
// 1) Preferuj zmienne środowiskowe Vite (plik .env.local – nie wersjonowany)
// 2) Jeśli zmienne nie istnieją, użyj wartości z fallbacku poniżej (tylko dev)
// Uwaga: Klucze frontendowe nie są sekretami – ogranicz domeny i włącz App Check.

const cfgFromEnv = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const fallback = {
  apiKey: "AIzaSyDsiUtlIYDRI-71-KmQqimAx2Ux2EZGpcY",
  authDomain: "domfinanse-92486.firebaseapp.com",
  projectId: "domfinanse-92486",
  storageBucket: "domfinanse-92486.firebasestorage.app",
  messagingSenderId: "110722598492",
  appId: "1:110722598492:web:b871d80ea81fdc4b4a4899",
  measurementId: "G-4W61QZK4HL",
}

// Złóż konfigurację: weź z env jeśli dostępne, w przeciwnym razie fallback
const config = Object.fromEntries(
  Object.entries(fallback).map(([k, v]) => [k, cfgFromEnv[k] || v])
)

export default config


