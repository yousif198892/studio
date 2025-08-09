
'use client';

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface LinguaLeapDB extends DBSchema {
  landingPage: {
    key: string;
    value: { id: string; image: string };
  };
}

let dbPromise: Promise<IDBPDatabase<LinguaLeapDB>> | null = null;

const getDbPromise = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    if (!dbPromise) {
        dbPromise = openDB<LinguaLeapDB>('lingua-leap-db', 1, {
            upgrade(db, oldVersion) {
                if (oldVersion < 1) {
                    db.createObjectStore('landingPage', { keyPath: 'id' });
                }
            },
        });
    }
    return dbPromise;
}

export async function setHeroImage(image: string): Promise<void> {
  const db = getDbPromise();
  if (db) {
    try {
        await (await db).put('landingPage', { id: 'heroImage', image });
    } catch (error) {
        console.error("Failed to set hero image in IndexedDB", error);
    }
  }
}

export async function getHeroImage(): Promise<string | undefined> {
  const db = getDbPromise();
  if (db) {
    try {
        const result = await (await db).get('landingPage', 'heroImage');
        return result?.image;
    } catch (error) {
        console.error("Failed to get hero image from IndexedDB", error);
        return undefined;
    }
  }
  return undefined;
}
