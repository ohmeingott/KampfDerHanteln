# Kampf der Hanteln

Remote-Training Session Manager im Neo-Brutalismus Stil. Steuert Trainingseinheiten fuer eine Gruppe, die parallel per Zoom verbunden ist.

## Features

- Google OAuth Login
- Teilnehmerpool verwalten (Personen hinzufuegen/entfernen, fuer Session auswaehlen)
- Uebungsbibliothek mit 17 vordefinierten Uebungen
- Drag & Drop Sortierung, Random-Auswahl, Shuffle
- Live-Session Timer mit TTS-Ansagen (Web Speech API)
- "Extreme"-Runden (~2x pro Session, 60s statt 40s)
- Physikalische Leistungsberechnung (Meter bewegt, kJ Arbeit)
- Langzeit-Statistiken: Teilnahmen, Streaks, Punkte-Leaderboard

## Setup

### 1. Firebase Projekt einrichten

1. Gehe zu [Firebase Console](https://console.firebase.google.com)
2. Erstelle ein neues Projekt (oder verwende ein bestehendes)
3. Gehe zu **Authentication** > **Sign-in method** > aktiviere **Google**
4. Gehe zu **Firestore Database** > **Create Database** (im Test-Modus starten)
5. Gehe zu **Project settings** > **Your apps** > **Web App hinzufuegen**
6. Kopiere die Firebase Config-Werte

### 2. Environment Variables

Erstelle eine `.env` Datei im Root-Verzeichnis:

```
VITE_FIREBASE_API_KEY=dein-api-key
VITE_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dein-projekt-id
VITE_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=dein-sender-id
VITE_FIREBASE_APP_ID=dein-app-id
```

### 3. Installieren & Starten

```bash
npm install
npm run dev
```

## Tech-Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS (Neo-Brutalismus Design)
- Zustand (State Management)
- Firebase Auth + Firestore
- @dnd-kit (Drag & Drop)
- Web Speech API (TTS)

## Deployment auf Vercel

1. Repo auf GitHub pushen
2. Auf [vercel.com](https://vercel.com) importieren
3. Environment Variables (aus `.env`) in Vercel eintragen
4. Deployen

**Wichtig:** In der Firebase Console unter **Authentication** > **Settings** > **Authorized domains** die Vercel-Domain hinzufuegen.
