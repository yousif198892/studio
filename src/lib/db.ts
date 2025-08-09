
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
            upgrade(db) {
                if (!db.objectStoreNames.contains('landingPage')) {
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
    await (await db).put('landingPage', { id: 'heroImage', image });
  }
}

export async function getHeroImage(): Promise<string | undefined> {
  const db = getDbPromise();
  if (db) {
    const result = await (await db).get('landingPage', 'heroImage');
    return result?.image;
  }
  return undefined;
}
