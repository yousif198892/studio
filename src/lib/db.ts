
'use client';

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { User, Word, Message, mockUsers, mockMessages } from './data';
import { WordProgress } from './storage';

interface LinguaLeapDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string };
  };
  words: {
    key: string;
    value: Word;
    indexes: { 'by-supervisorId': string };
  };
  adminMessages: {
    key: string;
    value: Message;
  };
  wordProgress: {
    key: string;
    value: WordProgress;
    indexes: { 'by-studentId': string };
  };
  landingPage: {
    key: string;
    value: { id: string; image: string };
  };
}

let dbPromise: Promise<IDBPDatabase<LinguaLeapDB>> | null = null;

const getDb = () => {
  if (typeof window === 'undefined') {
    // This is a server-side render, so we can't use IndexedDB.
    // Return a dummy object or handle appropriately.
    return null;
  }
  if (!dbPromise) {
    dbPromise = openDB<LinguaLeapDB>('lingua-leap-db', 2, {
      upgrade(db, oldVersion, newVersion, tx) {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
        if (oldVersion < 1) {
            const userStore = db.createObjectStore('users', { keyPath: 'id' });
            userStore.createIndex('by-email', 'email', { unique: true });

            const wordStore = db.createObjectStore('words', { keyPath: 'id' });
            wordStore.createIndex('by-supervisorId', 'supervisorId');

            db.createObjectStore('adminMessages', { keyPath: 'id' });

            const progressStore = db.createObjectStore('wordProgress', { keyPath: 'id' });
            progressStore.createIndex('by-studentId', 'studentId');
            
            db.createObjectStore('landingPage', { keyPath: 'id' });
            
            // Seed initial data
            mockUsers.forEach(user => {
                tx.objectStore('users').add(user);
            });
            mockMessages.forEach(message => {
                tx.objectStore('adminMessages').add(message);
            });
             console.log("Initial data seeded.");
        }
        if (oldVersion < 2) {
             if (!db.objectStoreNames.contains('landingPage')) {
                db.createObjectStore('landingPage', { keyPath: 'id' });
             }
        }
      },
    });
  }
  return dbPromise;
};


// --- User Functions ---
export async function getAllUsersDB(): Promise<User[]> {
    const db = getDb();
    if (!db) return mockUsers;
    return (await db).getAll('users');
}

export async function getUserByIdDB(id: string): Promise<User | undefined> {
    const db = getDb();
    if (!db) return mockUsers.find(u => u.id === id);
    return (await db).get('users', id);
}

export async function getUserByEmailDB(email: string): Promise<User | undefined> {
    const db = getDb();
    if (!db) return mockUsers.find(u => u.email === email);
    return (await db).getFromIndex('users', 'by-email', email);
}

export async function addUserDB(user: User): Promise<void> {
    const db = getDb();
    if (db) await (await db).put('users', user);
}

export async function updateUserDB(user: User): Promise<void> {
    const db = getDb();
    if (db) await (await db).put('users', user);
}

export async function deleteUserDB(id: string): Promise<void> {
    const db = getDb();
    if (db) await (await db).delete('users', id);
}

// --- Word Functions ---
export async function getWordsBySupervisorDB(supervisorId: string): Promise<Word[]> {
    const db = getDb();
    if (!db) return [];
    const words = await (await db).getAllFromIndex('words', 'by-supervisorId', supervisorId);
    return words.map(w => ({ ...w, nextReview: new Date(w.nextReview) }));
}

export async function addWordDB(word: Word): Promise<void> {
    const db = getDb();
    if (db) await (await db).put('words', word);
}

export async function getWordByIdDB(id: string): Promise<Word | undefined> {
    const db = getDb();
    if (!db) return undefined;
    const word = await (await db).get('words', id);
    if(word) return { ...word, nextReview: new Date(word.nextReview) };
    return undefined;
}


export async function updateWordDB(word: Word): Promise<void> {
    const db = getDb();
    if (db) await (await db).put('words', word);
}


export async function deleteWordDB(id: string): Promise<void> {
    const db = getDb();
    if (db) await (await db).delete('words', id);
}

// --- WordProgress Functions ---
export async function getStudentProgressDB(studentId: string): Promise<WordProgress[]> {
    const db = getDb();
    if (!db) return [];
    const progress = await (await db).getAllFromIndex('wordProgress', 'by-studentId', studentId);
    return progress.map(p => ({ ...p, nextReview: new Date(p.nextReview) }));
}

export async function saveStudentProgressDB(progress: WordProgress[]): Promise<void> {
    const db = getDb();
    if (!db) return;
    const tx = (await db).transaction('wordProgress', 'readwrite');
    await Promise.all([...progress.map(p => tx.store.put(p)), tx.done]);
}

// --- Message Functions ---
export async function getMessagesDB(): Promise<Message[]> {
    const db = getDb();
    if (!db) return mockMessages;
    const allMessages = await (await db).getAll('adminMessages');
    return allMessages.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addMessageDB(message: Message): Promise<void> {
    const db = getDb();
    if (db) await (await db).put('adminMessages', message);
}

export async function deleteMessageDB(id: string): Promise<void> {
    const db = getDb();
    if (db) await (await db).delete('adminMessages', id);
}

// --- Chat Message Functions ---
export async function getSupervisorMessagesDB(): Promise<any[]> {
    // This is a placeholder as chat is not being migrated to IndexedDB in this step
    return JSON.parse(localStorage.getItem('supervisorMessages') || '[]');
}
export async function saveSupervisorMessageDB(message: any): Promise<void> {
    const messages = await getSupervisorMessagesDB();
    messages.push(message);
    localStorage.setItem('supervisorMessages', JSON.stringify(messages));
}

export async function getPeerMessagesDB(): Promise<any[]> {
    return JSON.parse(localStorage.getItem('peerMessages') || '[]');
}

export async function savePeerMessageDB(message: any): Promise<void> {
    const messages = await getPeerMessagesDB();
    messages.push(message);
    localStorage.setItem('peerMessages', JSON.stringify(messages));
}


// --- Hero Image Functions ---
export async function setHeroImage(image: string): Promise<void> {
  const db = getDb();
  if (db) {
    try {
        await (await db).put('landingPage', { id: 'heroImage', image });
    } catch (error) {
        console.error("Failed to set hero image in IndexedDB", error);
    }
  }
}

export async function getHeroImage(): Promise<string | undefined> {
  const db = getDb();
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
