
'use client';

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface LinguaLeapDB extends DBSchema {
  landingPage: {
    key: string;
    value: { id: string; image: string };
  };
  assets: {
    key: string;
    value: { id: string; data: string };
  }
}

let dbPromise: Promise<IDBPDatabase<LinguaLeapDB>> | null = null;
const signatureImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQcAAABACAYAAADe9TsfAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAv5SURBVHhe7Z1tcttoGIZtTybv9zM/yWfyT/JgOwoiEAEiBAFpW7WqW9X3zGz2h2lq6hF/0m+yJ//85S9/+Z//+Z8Z+r//+79h/M//+Z/D+Pd///cM/z//8z8z/L/++usM/13x8PDw8PDw8PCkHqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG8GqG-AASUVORK5CYII=";


const getDbPromise = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    if (!dbPromise) {
        dbPromise = openDB<LinguaLeapDB>('lingua-leap-db', 2, {
            upgrade(db, oldVersion, newVersion, tx) {
                if (oldVersion < 1) {
                    db.createObjectStore('landingPage', { keyPath: 'id' });
                }
                if (oldVersion < 2) {
                    const assetStore = db.createObjectStore('assets', { keyPath: 'id' });
                    assetStore.put({ id: 'signatureImage', data: signatureImage });
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

export async function getAsset(id: string): Promise<string | undefined> {
    const db = getDbPromise();
    if (db) {
        const result = await (await db).get('assets', id);
        return result?.data;
    }
    return undefined;
}
