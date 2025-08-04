
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

export let mockWords: Word[] = [
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
        options: ["Ubiquitous", "Rare", "Scarce", "Limited"],
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


// This is a workaround to simulate a persistent data layer.
// In a real app, you would use a database.
// This function can be called from both server and client.
export function getAllUsers(): User[] {
  // If on the client, merge with localStorage.
  if (typeof window !== 'undefined') {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    // Use a Map to ensure no duplicates from the mock list if they were also stored.
    const combinedUsers = [...mockUsers, ...storedUsers];
    const uniqueUsers = Array.from(new Map(combinedUsers.map(user => [user.id, user])).values());
    return uniqueUsers;
  }
  // On the server, we can only return the static list.
  // The login logic will need to handle this discrepancy.
  return mockUsers;
}


// Helper functions to simulate data fetching
export const getUserById = (id: string): User | undefined => {
    let allUsers: User[] = mockUsers;
     if (typeof window !== 'undefined') {
        allUsers = JSON.parse(localStorage.getItem('combinedUsers') || JSON.stringify(mockUsers));
    }
    return allUsers.find(u => u.id === id);
}

export const getStudentsBySupervisorId = (supervisorId: string): User[] => {
    let allUsers: User[] = mockUsers;
     if (typeof window !== 'undefined') {
        allUsers = JSON.parse(localStorage.getItem('combinedUsers') || JSON.stringify(mockUsers));
    }
    return allUsers.filter(u => u.role === 'student' && u.supervisorId === supervisorId);
}

export const getWordsForStudent = (studentId: string): Word[] => {
    const student = getUserById(studentId);
    if (!student || !student.supervisorId) return [];
    const supervisorWords = getWordsBySupervisor(student.supervisorId);
    // In a real app you might have student-specific word lists, but here we just use the supervisor's list
    return supervisorWords;
};
export const getWordsBySupervisor = (supervisorId: string): Word[] => {
    const baseWords = mockWords.filter(w => w.supervisorId === supervisorId);
    let allWords: Word[] = [...baseWords];

    if (typeof window !== 'undefined') {
        const storedWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
        const userAddedWords = storedWords.filter(w => w.supervisorId === supervisorId);
        allWords = [...userAddedWords, ...baseWords];
    }
    
    const uniqueWordsMap = new Map<string, Word>();
    allWords.forEach(word => {
        // Ensure the correct option is always in the options list and options are unique
        const sanitizedOptions = Array.from(new Set([...word.options, word.correctOption]));
        uniqueWordsMap.set(word.id, { ...word, options: sanitizedOptions });
    });

    return Array.from(uniqueWordsMap.values());
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
        
        // This is where the fix is: use a Map to ensure all units are unique by their ID.
        // It correctly merges the base units and the user-added units from localStorage.
        const combined = [...baseUnits, ...userAddedUnits];
        const uniqueUnits = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return uniqueUnits;
    }
    return baseUnits;
}

