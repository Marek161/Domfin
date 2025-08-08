import { initializeApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import config from './firebaseConfig'

const app = initializeApp(config)

let analytics
try { analytics = getAnalytics(app) } catch { /* analytics wymaga https/host */ }

const db = getFirestore(app)
try { enableIndexedDbPersistence(db) } catch { /* offline cache opcjonalne */ }

// App Check –  klucz reCAPTCHA v3 (w konsoli Firebase)
try {
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(location.hostname)
  if (isLocal) { self.FIREBASE_APPCHECK_DEBUG_TOKEN = true }
  const siteKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY || 'RECAPTCHA_V3_SITE_KEY'
  initializeAppCheck(app, { provider: new ReCaptchaV3Provider(siteKey), isTokenAutoRefreshEnabled: true })
} catch { /* opcjonalne */ }

export { app, db, analytics }


