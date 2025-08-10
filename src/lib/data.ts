

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
  fontSize?: "sm" | "base" | "lg";
  isMainAdmin?: boolean;
  isSuspended?: boolean;
  trialExpiresAt?: string; // ISO date string for trial accounts
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
    timezone: "America/New_York",
    fontSize: "base",
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


// CHAT - Stays on localStorage for now to keep focus on word storage
export const getConversationsForStudent = (userId: string): { supervisor: Record<string, SupervisorMessage[]>, peer: Record<string, PeerMessage[]> } => {
    if (typeof window === 'undefined') return { supervisor: {}, peer: {} };
    
    // This is a synchronous placeholder. Ideally, chat would also be async.
    // For now, we are just reading from localStorage.
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]').concat(mockUsers);
    const currentUser = allUsers.find((u:User) => u.id === userId);

    const supervisorConversations: Record<string, SupervisorMessage[]> = {};
    const peerConversations: Record<string, PeerMessage[]> = {};
    
    const supervisorMessages: SupervisorMessage[] = JSON.parse(localStorage.getItem("supervisorMessages") || "[]").map((m: any) => ({...m, createdAt: new Date(m.createdAt)}));
    const peerMessages: PeerMessage[] = JSON.parse(localStorage.getItem("peerMessages") || "[]").map((m: any) => ({...m, createdAt: new Date(m.createdAt)}));


    if (currentUser?.role === 'student') {
        if (currentUser.supervisorId) {
            supervisorConversations[currentUser.supervisorId] = supervisorMessages
                .filter(m => m.studentId === userId && m.supervisorId === currentUser.supervisorId)
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }

        const studentPeerMessages = peerMessages.filter(m => m.senderId === userId || m.receiverId === userId);
        for (const msg of studentPeerMessages) {
            const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            if (!peerConversations[otherUserId]) {
                peerConversations[otherUserId] = [];
            }
            peerConversations[otherUserId].push(msg);
        }
    }

    if (currentUser?.role === 'supervisor') {
        const students = allUsers.filter((u: User) => u.role === 'student' && u.supervisorId === userId);
        for (const student of students) {
            supervisorConversations[student.id] = supervisorMessages
                .filter(m => m.studentId === student.id && m.supervisorId === userId)
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
    }
    
    for (const peerId in peerConversations) {
        peerConversations[peerId].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    return { supervisor: supervisorConversations, peer: peerConversations };
};


export const saveSupervisorMessage = (message: SupervisorMessage) => {
    if (typeof window === 'undefined') return;
    const allMessages = JSON.parse(localStorage.getItem('supervisorMessages') || '[]');
    allMessages.push(message);
    localStorage.setItem('supervisorMessages', JSON.stringify(allMessages));
}

export const savePeerMessage = (message: PeerMessage) => {
    if (typeof window === 'undefined') return;
    const allMessages = JSON.parse(localStorage.getItem('peerMessages') || '[]');
    allMessages.push(message);
    localStorage.setItem('peerMessages', JSON.stringify(allMessages));
};

// Re-exporting write functions
export { addUserDB, addWordDB, addMessageDB, deleteMessageDB, updateUserDB, deleteUserDB, deleteWordDB, updateWordDB, getWordByIdDB, getUserByEmailDB, getWordsBySupervisorDB };
