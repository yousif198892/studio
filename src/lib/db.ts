
'use client';

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { User, Word, Message, mockUsers, mockMessages, mockWords, SupervisorMessage, PeerMessage } from './data';
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
  supervisorMessages: {
    key: string;
    value: SupervisorMessage;
    indexes: { 'by-conversation': ['studentId', 'supervisorId'] };
  };
  peerMessages: {
    key: string;
    value: PeerMessage;
    indexes: { 'by-conversation': 'conversationId' };
  };
  landingPage: {
    key: string;
    value: { id: string; image: string };
  };
}

let dbPromise: Promise<IDBPDatabase<LinguaLeapDB>> | null = null;

const getDb = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!dbPromise) {
    const dbName = 'lingua-leap-db';
    const dbVersion = 7; // Incremented version to force upgrade

    dbPromise = openDB<LinguaLeapDB>(dbName, dbVersion, {
      upgrade(db, oldVersion, newVersion, tx) {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}...`);
        
        // Re-check all stores in case of a fresh install or version upgrade
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('by-email', 'email', { unique: true });
          mockUsers.forEach(user => tx.objectStore('users').add(user));
        }
        if (!db.objectStoreNames.contains('words')) {
          const wordStore = db.createObjectStore('words', { keyPath: 'id' });
          wordStore.createIndex('by-supervisorId', 'supervisorId');
          mockWords.forEach(word => tx.objectStore('words').add(word));
        }
        if (!db.objectStoreNames.contains('adminMessages')) {
          const messageStore = db.createObjectStore('adminMessages', { keyPath: 'id' });
          mockMessages.forEach(message => tx.objectStore('adminMessages').add(message));
        }
        if (!db.objectStoreNames.contains('wordProgress')) {
          const progressStore = db.createObjectStore('wordProgress', { keyPath: 'id' });
          progressStore.createIndex('by-studentId', 'studentId');
        }
        if (!db.objectStoreNames.contains('landingPage')) {
          db.createObjectStore('landingPage', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('supervisorMessages')) {
          const store = db.createObjectStore('supervisorMessages', { keyPath: 'id' });
          store.createIndex('by-conversation', ['studentId', 'supervisorId']);
        }
        if (!db.objectStoreNames.contains('peerMessages')) {
          const store = db.createObjectStore('peerMessages', { keyPath: 'id' });
          store.createIndex('by-conversation', 'conversationId');
        }
        
        // Populate mock data on upgrade if stores are empty
        tx.objectStore('users').count().then(count => {
          if (count === 0) mockUsers.forEach(user => tx.objectStore('users').add(user));
        });
        tx.objectStore('words').count().then(count => {
          if (count === 0) mockWords.forEach(word => tx.objectStore('words').add(word));
        });
        tx.objectStore('adminMessages').count().then(count => {
          if (count === 0) mockMessages.forEach(message => tx.objectStore('adminMessages').add(message));
        });

        console.log("Database upgrade complete.");
      },
       blocked() {
        alert('Database is blocked. Please close other tabs with this app open.');
      },
      blocking() {
        alert('Database is blocked by an old version. Please refresh the page.');
      },
      terminated() {
        alert('Database connection terminated unexpectedly. Please reload the page.');
      }
    });
  }
  return dbPromise;
};

// Function to clear the database
export async function resetDatabase() {
    if (typeof window === 'undefined') return;
    
    // Close the database connection if it's open
    if (dbPromise) {
        const db = await dbPromise;
        db.close();
        dbPromise = null;
    }

    // Delete the database
    await window.indexedDB.deleteDatabase('lingua-leap-db');
    console.log("Database has been reset.");
}


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
    if (!db) return mockWords.filter(w => w.supervisorId === supervisorId);
    return (await db).getAllFromIndex('words', 'by-supervisorId', supervisorId);
}

export async function addWordDB(word: Word): Promise<void> {
    const db = getDb();
    if (db) await (await db).put('words', word);
}

export async function getWordByIdDB(id: string): Promise<Word | undefined> {
    const db = getDb();
    if (!db) return undefined;
    return (await db).get('words', id);
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
    return (await db).getAllFromIndex('wordProgress', 'by-studentId', studentId);
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
export async function getSupervisorMessagesDB(studentId: string, supervisorId: string): Promise<SupervisorMessage[]> {
    const db = getDb();
    if (!db) return [];
    return (await db).getAllFromIndex('supervisorMessages', 'by-conversation', IDBKeyRange.only([studentId, supervisorId]));
}

export async function getPeerMessagesDB(conversationId: string): Promise<PeerMessage[]> {
    const db = getDb();
    if (!db) return [];
    return (await db).getAllFromIndex('peerMessages', 'by-conversation', conversationId);
}

export async function saveSupervisorMessageDB(message: SupervisorMessage): Promise<void> {
    const db = getDb();
    if (db) await (await db).put('supervisorMessages', message);
}

export async function savePeerMessageDB(message: PeerMessage): Promise<void> {
    const db = getDb();
    if (db) await (await db).put('peerMessages', message);
}

export async function updateSupervisorMessagesDB(messages: SupervisorMessage[]): Promise<void> {
    const db = getDb();
    if (!db) return;
    const tx = (await db).transaction('supervisorMessages', 'readwrite');
    await Promise.all([...messages.map(m => tx.store.put(m)), tx.done]);
}

export async function updatePeerMessagesDB(messages: PeerMessage[]): Promise<void> {
    const db = getDb();
    if (!db) return;
    const tx = (await db).transaction('peerMessages', 'readwrite');
    await Promise.all([...messages.map(m => tx.store.put(m)), tx.done]);
}

export async function deleteSupervisorMessageDB(id: string): Promise<void> {
    const db = getDb();
    if(db) await (await db).delete('supervisorMessages', id);
}

export async function deletePeerMessageDB(id: string): Promise<void> {
    const db = getDb();
    if(db) await (await db).delete('peerMessages', id);
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
