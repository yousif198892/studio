

// This file contains placeholder data to simulate a database.
// In a real application, this data would come from a database like Firestore.
// These functions are intended for SERVER-SIDE USE. For client-side data fetching,
// use `src/lib/client-data.ts`.

import { getStudentProgressFromStorage, saveAllStudentProgressInStorage, WordProgress } from './storage';


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
  nextReview: Date;
  strength: number; // -1 means mastered, 0 is new, >0 is SRS level
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

export function getAllUsers(): User[] {
  const userMap = new Map<string, User>();
  const defaultAvatar = "https://placehold.co/100x100.png";

  mockUsers.forEach(user => userMap.set(user.id, { ...user, avatar: user.avatar || defaultAvatar }));
  
  // In a server context, we can only access the mock data.
  // The full user list including localStorage users is passed from the client for actions.

  return Array.from(userMap.values());
}


// Helper functions to simulate data fetching
export const getUserById = (id: string, allUsers: User[]): User | undefined => {
    return allUsers.find(u => u.id === id);
}

const getSupervisorWordsFromStorage = (): Word[] => {
    if (typeof window === 'undefined') return [];
    
    // This is the master list of all words added by supervisors
    const storedWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
    return storedWords.map(word => ({
        ...word,
        nextReview: new Date(word.nextReview)
    }));
}


export const getWordsForStudent = (studentId: string): Word[] => {
    if (typeof window === 'undefined') return [];
    
    // This function is client-side only because it needs the student's supervisorId.
    // We import a client-side user getter.
    const { getUserByIdFromClient } = require('./client-data');


    const student = getUserByIdFromClient(studentId);
    if (!student?.supervisorId) return [];

    const supervisorWords = getWordsBySupervisor(student.supervisorId);
    const studentProgress = getStudentProgressFromStorage(studentId);
    const studentProgressMap = new Map(studentProgress.map(p => [p.id, p]));

    const mergedWords = supervisorWords.map(supervisorWord => {
        const progress = studentProgressMap.get(supervisorWord.id);
        if (progress) {
            // If student has progress, merge it with the supervisor's word data
            return {
                ...supervisorWord,
                strength: progress.strength,
                nextReview: new Date(progress.nextReview),
            };
        } else {
            // If student has no progress, it's a new word for them
            return {
                ...supervisorWord,
                strength: 0,
                nextReview: new Date(),
            };
        }
    });

    // Save back to student's progress to persist new words, but only the progress part.
    const allProgressToSave: WordProgress[] = mergedWords.map(w => ({
        id: w.id,
        strength: w.strength,
        nextReview: w.nextReview,
    }));

    saveAllStudentProgressInStorage(studentId, allProgressToSave);

    return mergedWords;
};

export const getWordForReview = (studentId: string): Word | null => {
  if (typeof window === 'undefined') return null;

  const allWords = getWordsForStudent(studentId);
  const dueWords = allWords.filter(word => {
    return new Date(word.nextReview) <= new Date() && word.strength >= 0;
  });

  if (dueWords.length === 0) return null;

  // Simple logic: return the word with the earliest review date
  dueWords.sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
  
  return dueWords[0];
};


export const getWordsBySupervisor = (supervisorId: string): Word[] => {
    const allWords = getSupervisorWordsFromStorage();
    return allWords.filter(w => w.supervisorId === supervisorId);
};

export const getMessages = (): Message[] => {
    const baseMessages = mockMessages;
    if (typeof window !== 'undefined') {
        const storedMessages: Message[] = JSON.parse(localStorage.getItem('adminMessages') || '[]');
        const allMessages = [...baseMessages, ...storedMessages];
        const uniqueMessages = Array.from(new Map(allMessages.map(item => [item.id, item])).values());
        return uniqueMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return baseMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// --- Supervisor Message Functions ---

const getSupervisorMessagesFromStorage = (): SupervisorMessage[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem('supervisorMessages');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

export const getSupervisorMessagesForStudent = (studentId: string, supervisorId: string): SupervisorMessage[] => {
    const allMessages = getSupervisorMessagesFromStorage();
    return allMessages
        .filter(m => m.studentId === studentId && m.supervisorId === supervisorId)
        .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export const getSupervisorMessagesForSupervisor = (supervisorId: string): SupervisorMessage[] => {
    const allMessages = getSupervisorMessagesFromStorage();
    return allMessages
        .filter(m => m.supervisorId === supervisorId)
        .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export const saveSupervisorMessage = (message: SupervisorMessage) => {
    if (typeof window === 'undefined') return;
    const allMessages = getSupervisorMessagesFromStorage();
    allMessages.push(message);
    localStorage.setItem('supervisorMessages', JSON.stringify(allMessages));
}

    