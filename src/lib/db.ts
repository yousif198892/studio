

'use client';

import { DBSchema, openDB, IDBPDatabase } from 'idb';
import { User, Word, Message, SupervisorMessage, PeerMessage, mockUsers, mockMessages } from './data';
import { WordProgress } from './storage';

interface LinguaLeapDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string; 'by-supervisorId': string };
  };
  words: {
    key: string;
    value: Word;
    indexes: { 'by-supervisorId': string };
  };
  wordProgress: {
    key: [string, string]; // [studentId, wordId]
    value: WordProgress;
    indexes: { 'by-studentId': string };
  };
  adminMessages: {
    key: string;
    value: Message;
  };
  supervisorMessages: {
    key: string;
    value: SupervisorMessage;
    indexes: { 'by-studentId': string; 'by-supervisorId': string };
  };
  peerMessages: {
    key: string;
    value: PeerMessage;
    indexes: { 'by-senderId': string; 'by-receiverId': string };
  };
  learningStats: {
    key: string; // userId
    value: any;
  };
  keyValueStore: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<LinguaLeapDB>> | null = null;

function getDb(): Promise<IDBPDatabase<LinguaLeapDB>> {
  if (typeof window === 'undefined') {
    // This is a server-side context, return a dummy promise that will never resolve.
    // This prevents errors during server-side rendering, as IndexedDB is client-only.
    return new Promise(() => {});
  }
  
  if (!dbPromise) {
    dbPromise = openDB<LinguaLeapDB>('LinguaLeapDB', 1, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains('users')) {
            const usersStore = db.createObjectStore('users', { keyPath: 'id' });
            usersStore.createIndex('by-email', 'email', { unique: true });
            usersStore.createIndex('by-supervisorId', 'supervisorId');
            // Seed the database with mock users
            mockUsers.forEach(user => {
              transaction.objectStore('users').add(user);
            });
          }
          if (!db.objectStoreNames.contains('words')) {
            const wordsStore = db.createObjectStore('words', { keyPath: 'id' });
            wordsStore.createIndex('by-supervisorId', 'supervisorId');
          }
          if (!db.objectStoreNames.contains('wordProgress')) {
            const progressStore = db.createObjectStore('wordProgress', { keyPath: ['studentId', 'wordId'] });
            progressStore.createIndex('by-studentId', 'studentId');
          }
          if (!db.objectStoreNames.contains('adminMessages')) {
            const adminMessagesStore = db.createObjectStore('adminMessages', { keyPath: 'id' });
            // Seed with mock messages
            mockMessages.forEach(message => {
              transaction.objectStore('adminMessages').add(message);
            });
          }
          if (!db.objectStoreNames.contains('supervisorMessages')) {
            const supervisorMsgStore = db.createObjectStore('supervisorMessages', { keyPath: 'id' });
            supervisorMsgStore.createIndex('by-studentId', 'studentId');
            supervisorMsgStore.createIndex('by-supervisorId', 'supervisorId');
          }
          if (!db.objectStoreNames.contains('peerMessages')) {
            const peerMsgStore = db.createObjectStore('peerMessages', { keyPath: 'id' });
            peerMsgStore.createIndex('by-senderId', 'senderId');
            peerMsgStore.createIndex('by-receiverId', 'receiverId');
          }
          if (!db.objectStoreNames.contains('learningStats')) {
            db.createObjectStore('learningStats', { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains('keyValueStore')) {
            db.createObjectStore('keyValueStore', { keyPath: 'key' });
          }
        }
      },
    });
  }
  return dbPromise;
}

export const db = {
  users: {
    get: async (id: string) => (await getDb()).get('users', id),
    getAll: async () => (await getDb()).getAll('users'),
    put: async (user: User) => (await getDb()).put('users', user),
    delete: async (id: string) => (await getDb()).delete('users', id),
  },
  words: {
    get: async (id: string) => (await getDb()).get('words', id),
    getAll: async () => (await getDb()).getAll('words'),
    put: async (word: Word) => (await getDb()).put('words', word),
    delete: async (id: string) => (await getDb()).delete('words', id),
  },
  wordProgress: {
    get: async (key: [string, string]) => (await getDb()).get('wordProgress', key),
    getAllByStudent: async (studentId: string) => (await getDb()).getAllFromIndex('wordProgress', 'by-studentId', studentId),
    put: async (progress: WordProgress) => (await getDb()).put('wordProgress', progress),
    delete: async (key: [string, string]) => (await getDb()).delete('wordProgress', key),
  },
  adminMessages: {
    getAll: async () => (await getDb()).getAll('adminMessages'),
    put: async (message: Message) => (await getDb()).put('adminMessages', message),
    delete: async (id: string) => (await getDb()).delete('adminMessages', id),
  },
  supervisorMessages: {
    put: async (message: SupervisorMessage) => (await getDb()).put('supervisorMessages', message),
    getAll: async () => (await getDb()).getAll('supervisorMessages'),
  },
  peerMessages: {
    put: async (message: PeerMessage) => (await getDb()).put('peerMessages', message),
    getAll: async () => (await getDb()).getAll('peerMessages'),
  },
  learningStats: {
    get: async (userId: string) => (await getDb()).get('learningStats', `stats_${userId}`),
    put: async (userId: string, stats: any) => (await getDb()).put('learningStats', { key: `stats_${userId}`, value: stats }),
  },
  keyValueStore: {
    get: async (key: string) => (await getDb()).get('keyValueStore', key),
    put: async (key: string, value: any) => (await getDb()).put('keyValueStore', { key, value }),
    delete: async (key: string) => (await getDb()).delete('keyValueStore', key),
  },
};
