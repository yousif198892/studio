// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// This function ensures that we only initialize Firebase once, and only on the client.
function getFirebaseApp(): FirebaseApp {
    if (getApps().length === 0) {
        // This check ensures this code only runs on the client
        if (typeof window === 'undefined') {
            // In a server-side context, return a dummy object or throw an error
            // For build purposes, we should avoid throwing an error. A more robust app
            // might have a separate server-side admin SDK initialization.
            // For now, this check prevents server-side execution.
            // This path should not be hit if components are structured correctly.
            throw new Error("Firebase cannot be initialized on the server.");
        }
        return initializeApp(firebaseConfig);
    } else {
        return getApp();
    }
}

// We only export the getter function.
// The actual db and auth instances will be created on-demand in db.ts.
export { getFirebaseApp };
