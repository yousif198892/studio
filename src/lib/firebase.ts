
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Comprehensive check for all required environment variables
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error(`
    One or more Firebase environment variables are missing.
    Please ensure your .env file contains all the following, prefixed with NEXT_PUBLIC_:
    - NEXT_PUBLIC_FIREBASE_API_KEY
    - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    - NEXT_PUBLIC_FIREBASE_PROJECT_ID
    - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    - NEXT_PUBLIC_FIREBASE_APP_ID
    - NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  `);
}


// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with a stable persistence setting.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(/* settings */)
});

export { app, auth, db };
