

'use client';

import { db } from './firebase';
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    deleteDoc, 
    writeBatch,
    query,
    where,
    documentId,
    Timestamp,
    orderBy,
    runTransaction,
    increment
} from 'firebase/firestore';

import { User, Word, Message, mockUsers, mockMessages, mockWords, SupervisorMessage, PeerMessage } from './data';
import { WordProgress } from './storage';

// --- Seeding Function ---
// This function will populate the database with initial data if it's empty.
async function seedDatabase() {
    console.log("Checking if database needs seeding...");
    const countersRef = doc(db, "counters", "userIds");
    const countersSnap = await getDoc(countersRef);

    if (!countersSnap.exists()) {
        console.log("Database is empty or counters are missing. Seeding data...");
        const batch = writeBatch(db);

        // Seed users
        mockUsers.forEach(user => {
            const userDocRef = doc(db, "users", user.id);
            const userData = { ...user };
            if (user.trialExpiresAt) {
                (userData as any).trialExpiresAt = Timestamp.fromDate(new Date(user.trialExpiresAt));
            }
            batch.set(userDocRef, userData);
        });

        // Seed words
        mockWords.forEach(word => {
            const wordDocRef = doc(db, "words", word.id);
            batch.set(wordDocRef, word);
        });

        // Seed messages
        mockMessages.forEach(message => {
            const messageDocRef = doc(db, "adminMessages", message.id);
            const messageData = { ...message, createdAt: Timestamp.fromDate(message.createdAt) };
            batch.set(messageDocRef, messageData);
        });
        
        // Seed counters
        const studentNumbers = mockUsers
            .filter(u => u.role === 'student' && u.id.startsWith('user'))
            .map(u => parseInt(u.id.replace('user', ''), 10))
            .filter(n => !isNaN(n));
        
        const supervisorNumbers = mockUsers
            .filter(u => u.role === 'supervisor' && u.id.startsWith('sup'))
            .map(u => parseInt(u.id.replace('sup', ''), 10))
            .filter(n => !isNaN(n));

        const lastStudentId = studentNumbers.length > 0 ? Math.max(...studentNumbers) : 0;
        const lastSupervisorId = supervisorNumbers.length > 0 ? Math.max(...supervisorNumbers) : 0;
        
        batch.set(countersRef, { student: lastStudentId, supervisor: lastSupervisorId });

        await batch.commit();
        console.log("Database seeded successfully.");
    } else {
        console.log("Database already contains data. No seeding needed.");
    }
}

// Call the seed function once when the module is loaded.
if (typeof window !== "undefined") {
    seedDatabase().catch(console.error);
}


// --- User Functions ---
export async function getNextUserIdDB(role: 'student' | 'supervisor'): Promise<number> {
    const counterRef = doc(db, "counters", "userIds");
    
    try {
        const newId = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            if (!counterDoc.exists()) {
                throw "Counter document does not exist!";
            }
            const newCount = counterDoc.data()[role] + 1;
            transaction.update(counterRef, { [role]: newCount });
            return newCount;
        });
        return newId;
    } catch (e) {
        console.error("Transaction failed: ", e);
        throw e;
    }
}

export async function getAllUsersDB(): Promise<User[]> {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    return userSnapshot.docs.map(doc => {
        const data = doc.data();
        if (data.trialExpiresAt && data.trialExpiresAt instanceof Timestamp) {
            data.trialExpiresAt = data.trialExpiresAt.toDate().toISOString();
        }
        return { ...data, id: doc.id } as User;
    });
}

export async function getUserByIdDB(id: string): Promise<User | undefined> {
    const userDocRef = doc(db, 'users', id);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) return undefined;
    const data = userSnap.data();
    if (data.trialExpiresAt && data.trialExpiresAt instanceof Timestamp) {
        data.trialExpiresAt = data.trialExpiresAt.toDate().toISOString();
    }
    return { ...data, id: userSnap.id } as User;
}

export async function getUserByEmailDB(email: string): Promise<User | undefined> {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return undefined;
    const userDoc = querySnapshot.docs[0];
    const data = userDoc.data();
    if (data.trialExpiresAt && data.trialExpiresAt instanceof Timestamp) {
        data.trialExpiresAt = data.trialExpiresAt.toDate().toISOString();
    }
    return { ...data, id: userDoc.id } as User;
}

export async function getStudentsBySupervisorDB(supervisorId: string): Promise<User[]> {
    const q = query(collection(db, "users"), where("supervisorId", "==", supervisorId), where("role", "==", "student"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
}

export async function addUserDB(user: User): Promise<void> {
    const userDocRef = doc(db, 'users', user.id);
    const userData = { ...user };
     if (user.trialExpiresAt) {
        (userData as any).trialExpiresAt = Timestamp.fromDate(new Date(user.trialExpiresAt));
    }
    await setDoc(userDocRef, userData);
}

export async function updateUserDB(user: User): Promise<void> {
    const userDocRef = doc(db, 'users', user.id);
     const userData = { ...user };
     if (user.trialExpiresAt) {
        (userData as any).trialExpiresAt = Timestamp.fromDate(new Date(user.trialExpiresAt));
    }
    await setDoc(userDocRef, userData, { merge: true });
}

export async function deleteUserDB(id: string): Promise<void> {
    await deleteDoc(doc(db, 'users', id));
}

// --- Word Functions ---
export async function getWordsBySupervisorDB(supervisorId: string): Promise<Word[]> {
    const q = query(collection(db, "words"), where("supervisorId", "==", supervisorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Word));
}

export async function addWordDB(word: Word): Promise<void> {
    const wordDocRef = doc(db, 'words', word.id);
    await setDoc(wordDocRef, word);
}

export async function getWordByIdDB(id: string): Promise<Word | undefined> {
    const wordDocRef = doc(db, 'words', id);
    const docSnap = await getDoc(wordDocRef);
    return docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } as Word : undefined;
}

export async function updateWordDB(word: Word): Promise<void> {
    const wordDocRef = doc(db, 'words', word.id);
    await setDoc(wordDocRef, word, { merge: true });
}

export async function deleteWordDB(id: string): Promise<void> {
    await deleteDoc(doc(db, 'words', id));
}

// --- WordProgress Functions ---
export async function getStudentProgressDB(studentId: string): Promise<WordProgress[]> {
    const progressCol = collection(db, `users/${studentId}/wordProgress`);
    const progressSnapshot = await getDocs(progressCol);
    return progressSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            nextReview: (data.nextReview as Timestamp).toDate(),
        } as WordProgress;
    });
}

export async function saveStudentProgressDB(studentId: string, progress: WordProgress[]): Promise<void> {
    const batch = writeBatch(db);
    progress.forEach(p => {
        const docRef = doc(db, `users/${studentId}/wordProgress`, p.id);
        const progressData = {
            ...p,
            nextReview: Timestamp.fromDate(p.nextReview),
        };
        batch.set(docRef, progressData);
    });
    await batch.commit();
}

// --- Admin Message Functions ---
export async function getMessagesDB(): Promise<Message[]> {
    const messagesCol = collection(db, 'adminMessages');
    const q = query(messagesCol, orderBy("createdAt", "desc"));
    const messageSnapshot = await getDocs(q);
    return messageSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as Message;
    });
}

export async function addMessageDB(message: Message): Promise<void> {
    const messageData = { ...message, createdAt: Timestamp.fromDate(message.createdAt) };
    const docRef = doc(db, "adminMessages", message.id);
    await setDoc(docRef, messageData);
}

export async function deleteMessageDB(id: string): Promise<void> {
    await deleteDoc(doc(db, 'adminMessages', id));
}


// --- Chat Message Functions ---
function getSupervisorChatCollectionId(studentId: string, supervisorId: string): string {
    return `supervisor-chats/${studentId}-${supervisorId}/messages`;
}

function getPeerChatCollectionId(conversationId: string): string {
    return `peer-chats/${conversationId}/messages`;
}

export async function getSupervisorMessagesDB(studentId: string, supervisorId: string): Promise<SupervisorMessage[]> {
    const collId = getSupervisorChatCollectionId(studentId, supervisorId);
    const q = query(collection(db, collId), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as SupervisorMessage;
    });
}

export async function getPeerMessagesDB(conversationId: string): Promise<PeerMessage[]> {
    const collId = getPeerChatCollectionId(conversationId);
    const q = query(collection(db, collId), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as PeerMessage;
    });
}

export async function saveSupervisorMessageDB(message: SupervisorMessage): Promise<void> {
    const collId = getSupervisorChatCollectionId(message.studentId, message.supervisorId);
    const docRef = doc(db, collId, message.id);
    const messageData = {
        ...message,
        createdAt: Timestamp.fromDate(message.createdAt)
    };
    await setDoc(docRef, messageData, { merge: true });
}

export async function savePeerMessageDB(message: PeerMessage): Promise<void> {
    const collId = getPeerChatCollectionId(message.conversationId);
    const docRef = doc(db, collId, message.id);
    const messageData = {
        ...message,
        createdAt: Timestamp.fromDate(message.createdAt)
    };
    await setDoc(docRef, messageData, { merge: true });
}

export async function updateSupervisorMessagesDB(studentId: string, supervisorId: string, messages: SupervisorMessage[]): Promise<void> {
    const batch = writeBatch(db);
    const collId = getSupervisorChatCollectionId(studentId, supervisorId);
    messages.forEach(msg => {
        const docRef = doc(db, collId, msg.id);
        const messageData = { ...msg, createdAt: Timestamp.fromDate(msg.createdAt) };
        batch.set(docRef, messageData, { merge: true });
    });
    await batch.commit();
}

export async function updatePeerMessagesDB(conversationId: string, messages: PeerMessage[]): Promise<void> {
    const batch = writeBatch(db);
    const collId = getPeerChatCollectionId(conversationId);
    messages.forEach(msg => {
        const docRef = doc(db, collId, msg.id);
        const messageData = { ...msg, createdAt: Timestamp.fromDate(msg.createdAt) };
        batch.set(docRef, messageData, { merge: true });
    });
    await batch.commit();
}

export async function deleteSupervisorMessageDB(studentId: string, supervisorId: string, id: string): Promise<void> {
    const collId = getSupervisorChatCollectionId(studentId, supervisorId);
    await deleteDoc(doc(db, collId, id));
}

export async function deletePeerMessageDB(conversationId: string, id: string): Promise<void> {
    const collId = getPeerChatCollectionId(conversationId);
    await deleteDoc(doc(db, collId, id));
}


// --- Landing Page Hero Image ---
export async function setHeroImage(image: string): Promise<void> {
    const docRef = doc(db, 'app-config', 'landingPage');
    await setDoc(docRef, { heroImage: image });
}

export async function getHeroImage(): Promise<string | undefined> {
    const docRef = doc(db, 'app-config', 'landingPage');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().heroImage;
    }
    return undefined;
}
