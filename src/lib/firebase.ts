
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// This function ensures that we only initialize Firebase once.
function getFirebaseApp(): FirebaseApp {
    if (getApps().length === 0) {
        const app = initializeApp(firebaseConfig);
        // Enable persistence only on the client.
        if (typeof window !== 'undefined') {
            try {
                const db = getFirestore(app);
                enableIndexedDbPersistence(db);
            } catch (err: any) {
                if (err.code == 'failed-precondition') {
                    console.warn('Firebase persistence failed. This could be due to multiple tabs open.');
                } else if (err.code == 'unimplemented') {
                    console.warn('Firebase persistence is not available in this browser.');
                }
            }
        }
        return app;
    } else {
        return getApp();
    }
}

// We only export the getter function.
// The actual db and auth instances will be created on-demand in db.ts.
export { getFirebaseApp };
