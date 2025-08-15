

// This file contains placeholder data to simulate a database.
// In a real application, this data would come from a database like Firestore.

import { getStudentProgressDB, saveStudentProgressDB } from './db';
import { WordProgress } from './storage';
import { 
    getAllUsersDB,
    getUserByIdDB,
    getWordsBySupervisorDB,
    addWordDB,
    addUserDB,
    getMessagesDB,
    addMessageDB,
    deleteMessageDB,
    updateUserDB,
    deleteUserDB,
    deleteWordDB,
    updateWordDB,
    getWordByIdDB,
    getUserByEmailDB,
    getSupervisorMessagesDB,
    getPeerMessagesDB,
    savePeerMessageDB,
    saveSupervisorMessageDB,
    updatePeerMessagesDB,
    updateSupervisorMessagesDB,
} from './db';


export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for login simulation
  role: "student" | "supervisor";
  avatar: string;
  supervisorId?: string;
  timezone?: string;
  isMainAdmin?: boolean;
  isSuspended?: boolean;
  trialExpiresAt?: string; // ISO date string for trial accounts
  grade?: string;
  section?: string;
};

export type Word = {
  id: string;
  word: string;
  definition: string;
  unit: string;
  lesson: string;
  imageUrl: string;
  options: string[]; // This will include the correct word and 3 incorrect ones
  correctOption: string;
  supervisorId: string;
  // Student-specific progress is now stored separately
  nextReview?: Date; // Optional on the base word
  strength?: number; // Optional on the base word
};

export type Message = {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: Date;
}

export type SupervisorMessage = {
  id: string;
  studentId: string;
  supervisorId: string;
  senderId: string; // Will be either studentId or supervisorId
  content: string;
  createdAt: Date;
  read: boolean;
};

export type PeerMessage = {
    id: string;
    senderId: string;
    receiverId: string;
    conversationId: string; // e.g., "user1-user2" sorted alphabetically
    content: string;
    createdAt: Date;
    read: boolean;
};


export const mockMessages: Message[] = [
    {
        id: 'msg1',
        name: 'John Doe',
        email: 'j.doe@corp.com',
        message: "Hello, I am a teacher at a local high school and I would be very interested in using your platform for my students. Could you please provide me with supervisor access? Thank you!",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    }
];

export const mockUsers: User[] = [
  {
    id: "sup2",
    name: "Yousif",
    email: "warriorwithinyousif@gmail.com",
    password: "password123",
    role: "supervisor",
    avatar: "https://placehold.co/100x100.png",
    timezone: "Asia/Baghdad",
    isMainAdmin: true,
  },
];

export const mockWords: Word[] = [];


// --- NEW ASYNC FUNCTIONS ---

export async function getAllUsers(): Promise<User[]> {
    return await getAllUsersDB();
}

export async function getUserById(id: string): Promise<User | undefined> {
    return await getUserByIdDB(id);
}

export async function getWordsBySupervisor(supervisorId: string): Promise<Word[]> {
    return await getWordsBySupervisorDB(supervisorId);
}

export async function getWordsForStudent(studentId: string): Promise<(Word & WordProgress)[]> {
    const student = await getUserById(studentId);
    if (!student?.supervisorId) return [];

    const supervisorWords = await getWordsBySupervisor(student.supervisorId);
    const studentProgress = await getStudentProgressDB(studentId);
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
            return {
                ...supervisorWord,
                id: supervisorWord.id,
                strength: 0,
                nextReview: new Date(),
            };
        }
    });

    const allProgressToSave: WordProgress[] = mergedWords.map(w => ({
        id: w.id,
        strength: w.strength,
        nextReview: w.nextReview,
        studentId: studentId
    }));
    await saveStudentProgressDB(allProgressToSave);

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

  dueWords.sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
  
  return dueWords[0];
};

export async function getMessages(): Promise<Message[]> {
    return await getMessagesDB();
}

export async function getStudentsBySupervisorId(supervisorId: string): Promise<User[]> {
    const allUsers = await getAllUsers();
    return allUsers.filter(u => u.role === 'student' && u.supervisorId === supervisorId);
}


// CHAT - Migrated to IndexedDB
export async function getConversationsForStudent(userId: string): Promise<{ supervisor: Record<string, SupervisorMessage[]>, peer: Record<string, PeerMessage[]> }> {
    if (typeof window === 'undefined') return { supervisor: {}, peer: {} };
    
    const currentUser = await getUserById(userId);
    if (!currentUser) return { supervisor: {}, peer: {} };

    const supervisorConversations: Record<string, SupervisorMessage[]> = {};
    const peerConversations: Record<string, PeerMessage[]> = {};
    
    if (currentUser.role === 'student') {
        // Get convo with supervisor
        if (currentUser.supervisorId) {
            const messages = await getSupervisorMessagesDB(userId, currentUser.supervisorId);
            supervisorConversations[currentUser.supervisorId] = messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }

        // Get peer convos
        if (currentUser.supervisorId) {
            const allStudents = await getStudentsBySupervisorId(currentUser.supervisorId);
            for (const student of allStudents) {
                if (student.id === userId) continue;
                const conversationId = [userId, student.id].sort().join('-');
                const messages = await getPeerMessagesDB(conversationId);
                peerConversations[student.id] = messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            }
        }
    }

    if (currentUser.role === 'supervisor') {
        const students = await getStudentsBySupervisorId(userId);
        for (const student of students) {
            const messages = await getSupervisorMessagesDB(student.id, userId);
            supervisorConversations[student.id] = messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
    }

    return { supervisor: supervisorConversations, peer: peerConversations };
};


export const saveSupervisorMessage = async (message: SupervisorMessage) => {
    if (typeof window === 'undefined') return;
    await saveSupervisorMessageDB(message);
}

export const savePeerMessage = async (message: PeerMessage) => {
    if (typeof window === 'undefined') return;
    await savePeerMessageDB(message);
};

export const markSupervisorMessagesAsRead = async (currentUserId: string, otherUserId: string) => {
    if (typeof window === 'undefined') return;
    const currentUser = await getUserById(currentUserId);
    if (!currentUser) return;
    
    let studentId, supervisorId;
    if (currentUser.role === 'student') {
        studentId = currentUserId;
        supervisorId = otherUserId;
    } else {
        studentId = otherUserId;
        supervisorId = currentUserId;
    }

    const messages = await getSupervisorMessagesDB(studentId, supervisorId);
    const messagesToUpdate = messages.map(m => (m.senderId !== currentUserId ? { ...m, read: true } : m));
    if (messagesToUpdate.length > 0) {
      await updateSupervisorMessagesDB(messagesToUpdate);
    }
};

export const markPeerMessagesAsRead = async (currentUserId: string, peerId: string) => {
    if (typeof window === 'undefined') return;
    const conversationId = [currentUserId, peerId].sort().join('-');
    const messages = await getPeerMessagesDB(conversationId);
    const messagesToUpdate = messages.map(m => m.senderId === peerId ? { ...m, read: true } : m);
    if (messagesToUpdate.length > 0) {
      await updatePeerMessagesDB(messagesToUpdate);
    }
};


// Re-exporting write functions
export { 
    addUserDB, 
    addWordDB, 
    addMessageDB, 
    deleteMessageDB, 
    updateUserDB, 
    deleteUserDB, 
    deleteWordDB, 
    updateWordDB, 
    getWordByIdDB, 
    getUserByEmailDB, 
    getWordsBySupervisorDB 
};

    
