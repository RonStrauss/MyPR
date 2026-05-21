# MyPR

Track your gym personal records (PRs). Built with React, Firebase Authentication, and Cloud Firestore.

**Default language:** Hebrew (עברית), with English available in Settings.

## Features

- Google sign-in (Firebase Auth)
- Add, edit, and delete PRs (exercise, weight, reps, date, notes)
- Preset CrossFit exercises plus custom exercise names
- Real-time sync via Firestore
- Mobile-first gym-style UI (dark theme, orange accents)
- Hebrew default with RTL; switch to English in Settings

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/RonStrauss/MyPR.git
cd MyPR
npm install
```

### 2. Firebase project

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Add a **Web app** and copy the config values.
3. Enable **Authentication** → **Google** sign-in only (disable Email/Password if it was enabled).
4. Create a **Firestore** database (production mode is fine once rules are deployed).
5. Install the [Firebase CLI](https://firebase.google.com/docs/cli) and link your project:

   ```bash
   npm install -g firebase-tools
   firebase login
   cp .firebaserc.example .firebaserc
   # Edit .firebaserc and set your project ID
   ```

6. Deploy security rules from `firestore.rules`:

   ```bash
   npm run firebase:deploy-rules
   ```

   Or paste the rules manually in Firestore → Rules.

### 3. Environment variables

Copy `.env.example` to `.env` and fill in your Firebase web app config:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Run locally

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### 5. Build for production

```bash
npm run build
```

Deploy the `dist/` folder to Firebase Hosting, Vercel, Netlify, or any static host.

## Firestore data model

```
users/{userId}/prs/{prId}
  - exercise: string
  - weightKg: number
  - reps: number
  - date: string (YYYY-MM-DD)
  - notes?: string
  - createdAt: timestamp
```

## Tech stack

- [Vite](https://vitejs.dev/) + React 19 + TypeScript
- [Firebase](https://firebase.google.com/) Auth & Firestore
- [react-i18next](https://react.i18next.com/) (he / en)
- [React Router](https://reactrouter.com/)
- [Lucide](https://lucide.dev/) icons

## License

MIT
