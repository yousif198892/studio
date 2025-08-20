

'use client';

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
    Timestamp,
    orderBy,
    runTransaction,
} from 'firebase/firestore';
import { db } from './firebase'; // Import the initialized db instance
import type { User, Word, Message, SupervisorMessage, PeerMessage } from './data';
import type { WordProgress } from './storage';

// --- User Functions ---
export async function getNextSupervisorShortId(): Promise<string> {
    const counterRef = doc(db, "counters", "supervisorId");
    try {
        const newCount = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            if (!counterDoc.exists()) {
                transaction.set(counterRef, { count: 1 });
                return 1;
            }
            const newCount = counterDoc.data().count + 1;
            transaction.update(counterRef, { count: newCount });
            return newCount;
        });
        return `sup${newCount}`;
    } catch (e) {
        console.error("Transaction failed: ", e);
        throw e;
    }
}

export async function getAllUsers(): Promise<User[]> {
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

export async function getUserById(id: string): Promise<User | undefined> {
    if (!id) return undefined;
    const userDocRef = doc(db, 'users', id);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) return undefined;
    const data = userSnap.data();
    if (data.trialExpiresAt && data.trialExpiresAt instanceof Timestamp) {
        data.trialExpiresAt = data.trialExpiresAt.toDate().toISOString();
    }
    return { ...data, id: userSnap.id } as User;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
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

export async function getUserByShortId(shortId: string): Promise<User | undefined> {
    const q = query(collection(db, "users"), where("shortId", "==", shortId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return undefined;
    const userDoc = querySnapshot.docs[0];
    const data = userDoc.data();
     if (data.trialExpiresAt && data.trialExpiresAt instanceof Timestamp) {
        data.trialExpiresAt = data.trialExpiresAt.toDate().toISOString();
    }
    return { ...data, id: userDoc.id } as User;
}

export async function getStudentsBySupervisorId(supervisorId: string): Promise<User[]> {
    const q = query(collection(db, "users"), where("supervisorId", "==", supervisorId), where("role", "==", "student"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
}

export async function addUserDB(user: User): Promise<void> {
    const userDocRef = doc(db, 'users', user.id);
    const userData: { [key: string]: any } = { ...user };

    if (userData.trialExpiresAt && typeof userData.trialExpiresAt === 'string') {
        userData.trialExpiresAt = Timestamp.fromDate(new Date(userData.trialExpiresAt));
    } else if (!userData.trialExpiresAt) {
        delete userData.trialExpiresAt;
    }

    await setDoc(userDocRef, userData);
}

export async function updateUserDB(user: User): Promise<void> {
    const userDocRef = doc(db, 'users', user.id);
    const userData: { [key: string]: any } = { ...user };

    if (userData.trialExpiresAt && typeof userData.trialExpiresAt === 'string') {
        userData.trialExpiresAt = Timestamp.fromDate(new Date(userData.trialExpiresAt));
    } else if (userData.trialExpiresAt === undefined) {
         delete userData.trialExpiresAt;
    }

    await setDoc(userDocRef, userData, { merge: true });
}

export async function deleteUserDB(id: string): Promise<void> {
    await deleteDoc(doc(db, 'users', id));
}

// --- Word Functions ---
export async function getWordsBySupervisor(supervisorId: string): Promise<Word[]> {
    const q = query(collection(db, "words"), where("supervisorId", "==", supervisorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Word));
}

export async function addWordDB(word: Word): Promise<void> {
    const wordDocRef = doc(db, 'words', word.id);
    await setDoc(wordDocRef, word);
}

export async function getWordById(id: string): Promise<Word | undefined> {
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
export async function getStudentProgress(studentId: string): Promise<WordProgress[]> {
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

export async function saveStudentProgress(studentId: string, progress: WordProgress[]): Promise<void> {
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
export async function getMessages(): Promise<Message[]> {
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

export async function getSupervisorMessages(studentId: string, supervisorId: string): Promise<SupervisorMessage[]> {
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

export async function getPeerMessages(conversationId: string): Promise<PeerMessage[]> {
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

export async function saveSupervisorMessage(message: SupervisorMessage): Promise<void> {
    const collId = getSupervisorChatCollectionId(message.studentId, message.supervisorId);
    const docRef = doc(db, collId, message.id);
    const messageData = {
        ...message,
        createdAt: Timestamp.fromDate(message.createdAt)
    };
    await setDoc(docRef, messageData, { merge: true });
}

export async function savePeerMessage(message: PeerMessage): Promise<void> {
    const collId = getPeerChatCollectionId(message.conversationId);
    const docRef = doc(db, collId, message.id);
    const messageData = {
        ...message,
        createdAt: Timestamp.fromDate(message.createdAt)
    };
    await setDoc(docRef, messageData, { merge: true });
}

export async function updateSupervisorMessages(studentId: string, supervisorId: string, messages: SupervisorMessage[]): Promise<void> {
    const batch = writeBatch(db);
    const collId = getSupervisorChatCollectionId(studentId, supervisorId);
    messages.forEach(msg => {
        const docRef = doc(db, collId, msg.id);
        const messageData = { ...msg, createdAt: Timestamp.fromDate(msg.createdAt) };
        batch.set(docRef, messageData, { merge: true });
    });
    await batch.commit();
}

export async function updatePeerMessages(conversationId: string, messages: PeerMessage[]): Promise<void> {
    const batch = writeBatch(db);
    const collId = getPeerChatCollectionId(conversationId);
    messages.forEach(msg => {
        const docRef = doc(db, collId, msg.id);
        const messageData = { ...msg, createdAt: Timestamp.fromDate(msg.createdAt) };
        batch.set(docRef, messageData, { merge: true });
    });
    await batch.commit();
}

export async function deleteSupervisorMessage(message: SupervisorMessage): Promise<void> {
    const collId = getSupervisorChatCollectionId(message.studentId, message.supervisorId);
    await deleteDoc(doc(db, collId, message.id));
}

export async function deletePeerMessage(message: PeerMessage): Promise<void> {
    const collId = getPeerChatCollectionId(message.conversationId);
    await deleteDoc(doc(db, collId, message.id));
}

export async function getConversations(userId: string): Promise<{ supervisor: Record<string, SupervisorMessage[]>, peer: Record<string, PeerMessage[]> }> {
    const currentUser = await getUserById(userId);
    if (!currentUser) return { supervisor: {}, peer: {} };

    const supervisorConversations: Record<string, SupervisorMessage[]> = {};
    const peerConversations: Record<string, PeerMessage[]> = {};
    
    if (currentUser.role === 'student') {
        if (currentUser.supervisorId) {
            const messages = await getSupervisorMessages(userId, currentUser.supervisorId);
            supervisorConversations[currentUser.supervisorId] = messages
                .filter(m => !(m.deletedFor?.includes(userId)));
        }
        if (currentUser.supervisorId) {
            const allStudents = await getStudentsBySupervisorId(currentUser.supervisorId);
            for (const student of allStudents) {
                if (student.id === userId) continue;
                const conversationId = [userId, student.id].sort().join('-');
                const messages = await getPeerMessages(conversationId);
                peerConversations[student.id] = messages
                    .filter(m => !(m.deletedFor?.includes(userId)));
            }
        }
    }

    if (currentUser.role === 'supervisor') {
        const students = await getStudentsBySupervisorId(userId);
        for (const student of students) {
            const messages = await getSupervisorMessages(student.id, userId);
            supervisorConversations[student.id] = messages
                .filter(m => !(m.deletedFor?.includes(userId)));
        }
    }

    return { supervisor: supervisorConversations, peer: peerConversations };
};

export async function markSupervisorMessagesAsRead(currentUserId: string, otherUserId: string) {
    const currentUser = await getUserById(currentUserId);
    if (!currentUser) return;
    
    let studentId: string, supervisorId: string;
    if (currentUser.role === 'student') {
        studentId = currentUserId;
        supervisorId = otherUserId;
    } else {
        studentId = otherUserId;
        supervisorId = currentUserId;
    }

    const messages = await getSupervisorMessages(studentId, supervisorId);
    const messagesToUpdate = messages.map(m => (m.senderId !== currentUserId ? { ...m, read: true } : m));
    if (messagesToUpdate.length > 0) {
      await updateSupervisorMessages(studentId, supervisorId, messagesToUpdate);
    }
};

export async function markPeerMessagesAsRead(currentUserId: string, peerId: string) {
    const conversationId = [currentUserId, peerId].sort().join('-');
    const messages = await getPeerMessages(conversationId);
    const messagesToUpdate = messages.map(m => m.senderId === peerId ? { ...m, read: true } : m);
    if (messagesToUpdate.length > 0) {
      await updatePeerMessages(conversationId, messagesToUpdate);
    }
};


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

export async function getWordsForStudent(studentId: string): Promise<(Word & WordProgress)[]> {
    const student = await getUserById(studentId);
    if (!student?.supervisorId) return [];

    const supervisorWords = await getWordsBySupervisor(student.supervisorId);
    const studentProgress = await getStudentProgress(studentId);
    const studentProgressMap = new Map(studentProgress.map(p => [p.id, p]));

    const mergedWords = supervisorWords.map(supervisorWord => {
        const progress = studentProgressMap.get(supervisorWord.id);
        if (progress) {
            return {
                ...supervisorWord,
                ...progress,
                nextReview: new Date(progress.nextReview),
            };
        } else {
            // This is a new word for the student
            return {
                ...supervisorWord,
                id: supervisorWord.id,
                strength: 0,
                nextReview: new Date(),
                studentId: studentId
            };
        }
    });

    // Check if there are any new words to add to the student's progress subcollection
    const newProgressToSave = mergedWords.filter(w => !studentProgressMap.has(w.id)).map(w => ({
        id: w.id,
        strength: w.strength,
        nextReview: w.nextReview,
        studentId: studentId
    }));

    if (newProgressToSave.length > 0) {
        await saveStudentProgress(studentId, newProgressToSave);
    }

    return mergedWords;
}


export async function getWordForReview(studentId: string, unit?: string | null, lesson?: string | null): Promise<(Word & WordProgress) | null> {
  let allWords = await getWordsForStudent(studentId);

  let filteredWords = allWords;

  if (unit) {
      filteredWords = filteredWords.filter(word => word.unit === unit);
  }

  if (lesson) {
      filteredWords = filteredWords.filter(word => word.lesson === lesson);
  }

  const dueWords = filteredWords.filter(word => {
    return new Date(word.nextReview) <= new Date() && word.strength >= 0;
  });

  if (dueWords.length === 0) return null;

  // Sort by nextReview date to review the oldest due word first
  dueWords.sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());

  return dueWords[0];
};

