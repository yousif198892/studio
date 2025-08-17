
// This file contains placeholder data to simulate a database.
// In a real application, this data would come from a database like Firestore.

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
    getStudentProgressDB,
    saveStudentProgressDB,
    getSupervisorMessagesDB,
    getPeerMessagesDB,
    savePeerMessageDB,
    saveSupervisorMessageDB,
    updatePeerMessagesDB,
    updateSupervisorMessagesDB,
    deleteSupervisorMessageDB as deleteSupervisorMessageFromDB,
    deletePeerMessageDB as deletePeerMessageFromDB,
    getStudentsBySupervisorDB
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
  blockedUsers?: string[];
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
  isEdited?: boolean;
  deletedFor?: string[];
};

export type PeerMessage = {
    id: string;
    senderId: string;
    receiverId: string;
    conversationId: string; // e.g., "user1-user2" sorted alphabetically
    content: string;
    createdAt: Date;
    read: boolean;
    isEdited?: boolean;
    deletedFor?: string[];
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
    id: "sup1",
    name: "Ali Hassan",
    email: "ali.hassan@example.com",
    password: "password123",
    role: "supervisor",
    avatar: "https://placehold.co/100x100.png?text=AH",
    timezone: "Asia/Baghdad",
  },
  {
    id: "sup2",
    name: "Yousif",
    email: "warriorwithinyousif@gmail.com",
    password: "password123",
    role: "supervisor",
    avatar: "https://placehold.co/100x100.png?text=Y",
    timezone: "Asia/Baghdad",
    isMainAdmin: true,
  },
  {
    id: "user1",
    name: "Fatima Ahmed",
    email: "fatima.ahmed@example.com",
    password: "password123",
    role: "student",
    supervisorId: "sup1",
    avatar: "https://placehold.co/100x100.png?text=FA",
    grade: '5',
    section: 'A',
  },
  {
    id: "user2",
    name: "Mohammed Khan",
    email: "mohammed.khan@example.com",
    password: "password123",
    role: "student",
    supervisorId: "sup1",
    avatar: "https://placehold.co/100x100.png?text=MK",
    grade: '5',
    section: 'A',
  },
  {
    id: "user3",
    name: "Aisha Ibrahim",
    email: "aisha.ibrahim@example.com",
    password: "password123",
    role: "student",
    supervisorId: "sup1",
    avatar: "https://placehold.co/100x100.png?text=AI",
    grade: '6',
    section: 'B',
  },
   {
    id: "user4",
    name: "Zainab Ali",
    email: "zainab.ali@example.com",
    password: "password123",
    role: "student",
    supervisorId: "sup2",
    avatar: "https://placehold.co/100x100.png?text=ZA",
    grade: '7',
    section: 'C',
  },
  {
    id: "user5",
    name: "Omar Abdullah",
    email: "omar.abdullah@example.com",
    password: "password123",
    role: "student",
    supervisorId: "sup2",
    avatar: "https://placehold.co/100x100.png?text=OA",
    grade: '7',
    section: 'C',
  }
];

export const mockWords: Word[] = [
    {
        id: "word1",
        word: "Apple",
        definition: "A round fruit with red or green skin and a whitish inside.",
        unit: "Unit 1",
        lesson: "Lesson 1: Fruits",
        imageUrl: "https://placehold.co/600x400.png",
        options: ["Apple", "Banana", "Orange", "Grape"],
        correctOption: "Apple",
        supervisorId: "sup1",
    },
    {
        id: "word2",
        word: "Book",
        definition: "A written or printed work consisting of pages glued or sewn together along one side and bound in covers.",
        unit: "Unit 1",
        lesson: "Lesson 2: Classroom",
        imageUrl: "https://placehold.co/600x400.png",
        options: ["Book", "Pen", "Table", "Chair"],
        correctOption: "Book",
        supervisorId: "sup1",
    },
    {
        id: "word3",
        word: "Cat",
        definition: "A small domesticated carnivorous mammal with soft fur, a short snout, and retractable claws.",
        unit: "Unit 2",
        lesson: "Lesson 1: Animals",
        imageUrl: "https://placehold.co/600x400.png",
        options: ["Cat", "Dog", "Bird", "Fish"],
        correctOption: "Cat",
        supervisorId: "sup1",
    },
     {
        id: "word4",
        word: "Dog",
        definition: "A domesticated carnivorous mammal that typically has a long snout, an acute sense of smell, and a barking, howling, or whining voice.",
        unit: "Unit 2",
        lesson: "Lesson 1: Animals",
        imageUrl: "https://placehold.co/600x400.png",
        options: ["Dog", "Lion", "Tiger", "Bear"],
        correctOption: "Dog",
        supervisorId: "sup1",
    },
    {
        id: "word5",
        word: "Car",
        definition: "A road vehicle, typically with four wheels, powered by an internal combustion engine or electric motor and able to carry a small number of people.",
        unit: "Unit 2",
        lesson: "Lesson 2: Transportation",
        imageUrl: "https://placehold.co/600x400.png",
        options: ["Car", "Bus", "Train", "Bicycle"],
        correctOption: "Car",
        supervisorId: "sup1",
    },
];


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
                studentId: studentId
            };
        }
    });

    const allProgressToSave: WordProgress[] = mergedWords.map(w => ({
        id: w.id,
        strength: w.strength,
        nextReview: w.nextReview,
        studentId: studentId
    }));
    await saveStudentProgressDB(studentId, allProgressToSave);

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
    return await getStudentsBySupervisorDB(supervisorId);
}


// CHAT - Migrated to Firestore
export async function getConversationsForStudent(userId: string): Promise<{ supervisor: Record<string, SupervisorMessage[]>, peer: Record<string, PeerMessage[]> }> {
    const currentUser = await getUserById(userId);
    if (!currentUser) return { supervisor: {}, peer: {} };

    const supervisorConversations: Record<string, SupervisorMessage[]> = {};
    const peerConversations: Record<string, PeerMessage[]> = {};
    
    if (currentUser.role === 'student') {
        if (currentUser.supervisorId) {
            const messages = await getSupervisorMessagesDB(userId, currentUser.supervisorId);
            supervisorConversations[currentUser.supervisorId] = messages
                .filter(m => !(m.deletedFor?.includes(userId)));
        }
        if (currentUser.supervisorId) {
            const allStudents = await getStudentsBySupervisorId(currentUser.supervisorId);
            for (const student of allStudents) {
                if (student.id === userId) continue;
                const conversationId = [userId, student.id].sort().join('-');
                const messages = await getPeerMessagesDB(conversationId);
                peerConversations[student.id] = messages
                    .filter(m => !(m.deletedFor?.includes(userId)));
            }
        }
    }

    if (currentUser.role === 'supervisor') {
        const students = await getStudentsBySupervisorId(userId);
        for (const student of students) {
            const messages = await getSupervisorMessagesDB(student.id, userId);
            supervisorConversations[student.id] = messages
                .filter(m => !(m.deletedFor?.includes(userId)));
        }
    }

    return { supervisor: supervisorConversations, peer: peerConversations };
};

export async function saveSupervisorMessage(message: SupervisorMessage) {
    await saveSupervisorMessageDB(message);
}

export async function savePeerMessage(message: PeerMessage) {
    await savePeerMessageDB(message);
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

    const messages = await getSupervisorMessagesDB(studentId, supervisorId);
    const messagesToUpdate = messages.map(m => (m.senderId !== currentUserId ? { ...m, read: true } : m));
    if (messagesToUpdate.length > 0) {
      await updateSupervisorMessagesDB(studentId, supervisorId, messagesToUpdate);
    }
};

export async function markPeerMessagesAsRead(currentUserId: string, peerId: string) {
    const conversationId = [currentUserId, peerId].sort().join('-');
    const messages = await getPeerMessagesDB(conversationId);
    const messagesToUpdate = messages.map(m => m.senderId === peerId ? { ...m, read: true } : m);
    if (messagesToUpdate.length > 0) {
      await updatePeerMessagesDB(conversationId, messagesToUpdate);
    }
};

export async function deleteSupervisorMessage(message: SupervisorMessage) {
    await deleteSupervisorMessageFromDB(message.studentId, message.supervisorId, message.id);
}

export async function deletePeerMessage(message: PeerMessage) {
    await deletePeerMessageFromDB(message.conversationId, message.id);
}

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

    