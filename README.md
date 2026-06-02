# Alertio — Guide de déploiement

Plateforme intelligente de recherche d'emploi : offres France Travail fraîches (< 14j), matching par score ROME/compétences/NAF, notifications push web + iOS + Android.

---

## Architecture

```
@alertio/core        Moteur de matching, ROME, scheduler (TypeScript, zéro dépendance)
api/                 Vercel serverless functions (Node.js + Firebase Admin)
apps/web/            Next.js 14 + Capacitor (iOS / Android)
Firestore            Base de données temps réel
Firebase Auth        Authentification
Firebase FCM         Notifications push
Firebase Scheduler   Jobs + alertes toutes les 10 minutes
```

---

## Prérequis

- Node.js 20+
- Compte [Vercel](https://vercel.com) (gratuit)
- Compte [Firebase](https://console.firebase.google.com) (gratuit Spark plan suffit pour démarrer)
- Compte [France Travail IO](https://francetravail.io) (gratuit, inscription développeur)
- Pour mobile : Xcode 15+ (iOS) et/ou Android Studio (Android)

---

## Étape 1 — Firebase

### 1.1 Créer le projet

1. [Firebase Console](https://console.firebase.google.com) → **Créer un projet**
2. Nom : `alertio-prod`
3. Désactiver Google Analytics (optionnel)

### 1.2 Activer les services

**Authentication**
- Console → Authentication → Sign-in method
- Activer : **Email/Password** et **Google**

**Firestore**
- Console → Firestore Database → Créer une base de données
- Choisir la région la plus proche (ex: `europe-west1`)
- Démarrer en **mode production** (les rules du repo s'occupent de tout)

**Cloud Messaging**
- Console → Project Settings → Cloud Messaging
- Copier la **Server key** (utilisée par l'Admin SDK)
- Dans l'onglet **Web Push certificates** → Générer une paire de clés
- Copier la **VAPID key** → `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

### 1.3 Clés client (web app)

Console → Project Settings → General → Your apps → **Add app** → Web

Copier les valeurs pour `.env.local` :
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### 1.4 Clés Admin SDK (backend)

Console → Project Settings → Service accounts → **Generate new private key**

Télécharger le JSON. En extraire :
```
FIREBASE_PROJECT_ID      → project_id
FIREBASE_CLIENT_EMAIL    → client_email
FIREBASE_PRIVATE_KEY     → private_key (conserver les \n)
```

### 1.5 Déployer les règles et index Firestore

```bash
npm install -g firebase-tools
firebase login
firebase use alertio-prod
firebase deploy --only firestore
```

---

## Étape 2 — France Travail API

1. Aller sur [francetravail.io](https://francetravail.io/data/api/offres-emploi)
2. **S'inscrire** comme développeur
3. Créer une application → activer le scope `api_offresdemploiv2 o2dsoffre`
4. Récupérer **Client ID** et **Client Secret**

```
FRANCE_TRAVAIL_CLIENT_ID
FRANCE_TRAVAIL_CLIENT_SECRET
```

---

## Étape 3 — Variables d'environnement

Copier `.env.example` → `.env.local` à la racine du projet :

```bash
cp .env.example .env.local
```

Remplir toutes les valeurs. Générer le `CRON_SECRET` :

```bash
openssl rand -hex 32
```

---

## Étape 4 — Déploiement Vercel

Vercel sert l'app web et les API HTTP. Le scheduler n'est plus déclenché par Vercel.

### 4.1 Installer et lier

```bash
npm install -g vercel
vercel login
vercel link    # depuis la racine du repo
```

### 4.2 Ajouter les variables d'env sur Vercel

```bash
# Répéter pour chaque variable du .env.example
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY
vercel env add FRANCE_TRAVAIL_CLIENT_ID
vercel env add FRANCE_TRAVAIL_CLIENT_SECRET
vercel env add CRON_SECRET
vercel env add ALLOWED_ORIGIN
# + toutes les NEXT_PUBLIC_*
```

Ou via le dashboard Vercel → Settings → Environment Variables.

### 4.3 Déployer

```bash
vercel --prod
```

---

## Étape 4 bis — Firebase Scheduler

Le job planifié `syncJobs` tourne toutes les 10 minutes via Firebase Functions Scheduler.

### 4.4 Installer et déployer la Function

```bash
cd functions
npm install
cp .env.example .env
# Remplir FRANCE_TRAVAIL_CLIENT_ID et FRANCE_TRAVAIL_CLIENT_SECRET
firebase deploy --only functions:syncJobs
```

### 4.5 Vérifier le scheduler

Firebase Console → Functions → `syncJobs` → Logs.

Déclenchement manuel possible, sans attendre 10 minutes :

```bash
firebase functions:shell
syncJobs()
```

Réponse attendue :
```json
{
  "status": "SUCCESS",
  "stats": { "jobsFetched": 150, "jobsNew": 45, "notificationsSent": 3 }
}
```

---

## Étape 5 — Service Worker FCM

Le fichier `public/firebase-messaging-sw.js` contient des `REPLACE_ME`.
Remplacer avec les vraies valeurs Firebase **avant** le build :

```js
// apps/web/public/firebase-messaging-sw.js — lignes 12-18
firebase.initializeApp({
  apiKey:            "AIzaSy...",
  authDomain:        "alertio-prod.firebaseapp.com",
  projectId:         "alertio-prod",
  storageBucket:     "alertio-prod.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123",
});
```

> Ces clés sont publiques (Firebase les expose côté client). Pas besoin de les cacher.

---

## Étape 6 — Build web

```bash
cd apps/web
npm install
npm run build
npm run start   # tester en local
```

---

## Étape 7 — Build mobile (Capacitor)

### 7.1 Prérequis

```bash
cd apps/web
npm install
```

### 7.2 Build statique + sync Capacitor

```bash
CAPACITOR_BUILD=true npm run build   # génère /out
npx cap sync                         # copie dans ios/ et android/
```

### 7.3 iOS

1. Ajouter `GoogleService-Info.plist` dans `ios/App/App/`
   (télécharger depuis Firebase Console → Project Settings → iOS app)

2. Ouvrir Xcode :
```bash
npx cap open ios
```

3. Dans Xcode :
   - Signer l'app (Apple Developer account requis)
   - Activer la capability **Push Notifications**
   - Activer **Background Modes** → Remote notifications
   - Build & Run

### 7.4 Android

1. Ajouter `google-services.json` dans `android/app/`
   (télécharger depuis Firebase Console → Project Settings → Android app)

2. Ouvrir Android Studio :
```bash
npx cap open android
```

3. Build → Run on device / emulator

---

## Étape 8 — Premier utilisateur

1. Aller sur `https://alertio.vercel.app`
2. Créer un compte
3. Aller sur `/profile`
4. Ajouter au moins un **code ROME** (ex: `M1805` pour développeur)
5. Ajouter des compétences (ex: `React`, `Node.js`)
6. Sauvegarder
7. Attendre le prochain scheduler Firebase (max 10 min) ou le déclencher manuellement

---

## Structure du repo

```
alertio/
├── packages/core/          @alertio/core — matching engine partagé
│   ├── src/
│   │   ├── types.ts        Contrats TypeScript centraux
│   │   ├── matchingEngine.ts  Score 0–100
│   │   ├── romeTree.ts     Arbre ROME + proximité
│   │   ├── jobFetcher.ts   API France Travail + OAuth
│   │   ├── jobNormalizer.ts  Raw → Job typé
│   │   ├── deduplicator.ts   Dédup Firestore
│   │   └── scheduler.ts    Pipeline scheduler complet
│   └── tests/              43 tests Vitest
│
├── api/                    Vercel serverless functions
│   ├── _lib/
│   │   ├── firebase.ts     Admin SDK singleton
│   │   ├── auth.ts         Middleware JWT + helpers
│   │   └── stores.ts       Implémentations Firestore
│   ├── jobs/index.ts       GET /api/jobs
│   ├── jobs/[id].ts        GET /api/jobs/:id
│   ├── profile/[uid].ts    GET/PUT /api/profile/:uid
│   ├── notifications/index.ts  GET/PATCH /api/notifications
│   └── cron/sync.ts        POST /api/cron/sync manuel/interne
│
├── functions/              Firebase Functions
│   └── src/index.ts        syncJobs toutes les 10 minutes
│
├── apps/web/               Next.js 14 + Capacitor
│   ├── src/
│   │   ├── pages/          index · login · dashboard · profile · jobs/[id]
│   │   ├── hooks/          useAuth · useJobs · useNotifications
│   │   ├── components/     JobCard · JobFilters
│   │   └── lib/            firebase · api
│   ├── public/             firebase-messaging-sw.js · manifest.json
│   ├── capacitor.config.ts iOS + Android
│   └── next.config.js
│
├── firestore.rules         Règles de sécurité Firestore
├── firestore.indexes.json  Index composites
├── firebase.json           Config Firebase CLI + Functions
├── vercel.json             Routes + headers
└── .env.example            Toutes les variables documentées
```

---

## Commandes utiles

```bash
# Tests (core)
cd packages/core && npm test

# Typecheck (API)
cd api && npx tsc --noEmit

# Typecheck (Firebase Functions)
cd functions && npm run typecheck

# Typecheck (web)
cd apps/web && npx tsc --noEmit

# Dev local
cd apps/web && npm run dev

# Déployer rules Firestore
firebase deploy --only firestore

# Déployer le scheduler Firebase
firebase deploy --only functions:syncJobs

# Déclencher le scheduler manuellement via l'endpoint interne
curl -X POST https://alertio.vercel.app/api/cron/sync \
  -H "Authorization: Bearer $CRON_SECRET"

# Logs Vercel en temps réel
vercel logs --follow

# Logs Firebase Functions
firebase functions:log --only syncJobs
```

---

## Troubleshooting

**Le scheduler ne se déclenche pas**
→ Vérifier que `syncJobs` est bien déployée : `firebase deploy --only functions:syncJobs`.
→ Vérifier les logs Firebase Functions : `firebase functions:log --only syncJobs`.
→ Vérifier que `FRANCE_TRAVAIL_CLIENT_ID` et `FRANCE_TRAVAIL_CLIENT_SECRET` sont définis pour Firebase Functions.

**Firestore permission denied**
→ Vérifier que les règles sont bien déployées : `firebase deploy --only firestore:rules`
→ Vérifier que le token Firebase est bien passé en `Authorization: Bearer <token>`.

**Notifications push non reçues**
→ Vérifier que le service worker est servi sur `/firebase-messaging-sw.js` (pas dans `/src`).
→ Vérifier la VAPID key dans `useNotifications.ts`.
→ Sur iOS : les push nécessitent un compte Apple Developer et un vrai device.

**Score toujours 0**
→ Le profil utilisateur doit avoir au moins un `romeCode` renseigné.
→ Vérifier que `/api/profile/:uid` retourne bien le profil avec les codes ROME.

**API France Travail 401**
→ Les tokens OAuth expirent toutes les 24h — le cache `_tokenCache` gère le refresh automatiquement.
→ Vérifier `FRANCE_TRAVAIL_CLIENT_ID` et `FRANCE_TRAVAIL_CLIENT_SECRET` dans Firebase Functions.
