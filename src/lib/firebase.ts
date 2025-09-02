
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig"; // Import the config from the server-only file

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with a stable persistence setting.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(/* settings */)
});

export { app, auth, db };
