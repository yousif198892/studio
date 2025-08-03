
// This file contains placeholder data to simulate a database.
// In a real application, this data would come from a database like Firestore.

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
};

export type Unit = {
    id: string;
    name: string;
    supervisorId: string;
}

export type Word = {
  id: string;
  word: string;
  definition: string;
  imageUrl: string;
  options: string[]; // This will include the correct word and 3 incorrect ones
  correctOption: string;
  supervisorId: string;
  unitId: string;
  nextReview: Date;
  strength: number;
};

export const mockUsers: User[] = [
  {
    id: "user1",
    name: "Alex Johnson",
    email: "alex@example.com",
    password: "password123",
    role: "student",
    avatar: "https://placehold.co/100x100.png",
    supervisorId: "sup1",
    timezone: "America/New_York",
    fontSize: "base",
  },
  {
    id: "user2",
    name: "Maria Garcia",
    email: "maria@example.com",
    password: "password123",
    role: "student",
    avatar: "https://placehold.co/100x100.png",
    supervisorId: "sup1",
    timezone: "Europe/Madrid",
    fontSize: "lg",
  },
  {
    id: "sup1",
    name: "Dr. Evelyn Reed",
    email: "e.reed@example.com",
    password: "password123",
    role: "supervisor",
    avatar: "https://placehold.co/100x100.png",
    timezone: "America/Los_Angeles",
    fontSize: "base",
  },
  {
    id: "sup2",
    name: "Yousif",
    email: "warriorwithinyousif@gmail.com",
    password: "password123",
    role: "supervisor",
    avatar: "https://placehold.co/100x100.png",
    timezone: "America/New_York",
    fontSize: "base",
  }
];

export const mockUnits: Unit[] = [
    { id: "unit1", name: "Unit 1: Common Nouns", supervisorId: "sup1" },
    { id: "unit2", name: "Unit 2: Action Verbs", supervisorId: "sup1" },
    { id: "unit3", name: "Unit 3: Adjectives", supervisorId: "sup1" },
]

export const mockWords: Word[] = [
    {
        id: "word1",
        word: "Ephemeral",
        definition: "Lasting for a very short time.",
        imageUrl: "https://placehold.co/600x400.png",
        options: ["Ephemeral", "Permanent", "Eternal", "Enduring"],
        correctOption: "Ephemeral",
        supervisorId: "sup1",
        unitId: "unit3",
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        strength: 2,
    },
    {
        id: "word2",
        word: "Ubiquitous",
        definition: "Present, appearing, or found everywhere.",
        imageUrl: "https://placehold.co/600x400.png",
        options: ["Rare", "Scarce", "Ubiquitous", "Limited"],
        correctOption: "Ubiquitous",
        supervisorId: "sup1",
        unitId: "unit3",
        nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        strength: 3,
    },
    {
        id: "word3",
        word: "Mellifluous",
        definition: "A sound that is sweet and smooth, pleasing to hear.",
        imageUrl: "https://placehold.co/600x400.png",
        options: ["Mellifluous", "Cacophonous", "Harsh", "Grating"],
        correctOption: "Mellifluous",
        supervisorId: "sup1",
        unitId: "unit3",
        nextReview: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago (due for review)
        strength: 1,
    }
];

// Helper functions to simulate data fetching
export const getUserById = (id: string): User | undefined => mockUsers.find(u => u.id === id);
export const getStudentsBySupervisorId = (supervisorId: string): User[] => mockUsers.filter(u => u.role === 'student' && u.supervisorId === supervisorId);
export const getWordsForStudent = (studentId: string): Word[] => {
    const student = getUserById(studentId);
    if (!student || !student.supervisorId) return [];
    const supervisorWords = getWordsBySupervisor(student.supervisorId);
    // In a real app you might have student-specific word lists, but here we just use the supervisor's list
    return supervisorWords;
};
export const getWordsBySupervisor = (supervisorId: string): Word[] => {
    const baseWords = mockWords.filter(w => w.supervisorId === supervisorId);
    if (typeof window !== 'undefined') {
        const storedWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
        const userAddedWords = storedWords
            .filter(w => w.supervisorId === supervisorId);
        
        const combined = [...userAddedWords, ...baseWords];
        const uniqueWords = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return uniqueWords;
    }
    return baseWords;
};
export const getWordForReview = (studentId: string): Word | undefined => {
    const words = getWordsForStudent(studentId);
    return words.filter(w => new Date(w.nextReview) <= new Date()).sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())[0];
};

export const getUnitsBySupervisor = (supervisorId: string): Unit[] => {
    const baseUnits = mockUnits.filter(u => u.supervisorId === supervisorId);
     if (typeof window !== 'undefined') {
        const storedUnits: Unit[] = JSON.parse(localStorage.getItem('userUnits') || '[]');
        const userAddedUnits = storedUnits.filter(u => u.supervisorId === supervisorId);
        const combined = [...userAddedUnits, ...baseUnits];
        const uniqueUnits = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return uniqueUnits;
    }
    return baseUnits;
}
