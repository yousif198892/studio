

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
  isMainAdmin?: boolean;
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
  lesson?: string;
  nextReview: Date;
  strength: number;
};

export type Message = {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: Date;
}

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
    name: "Yousif",
    email: "warriorwithinyousif@gmail.com",
    password: "password123",
    role: "supervisor",
    avatar: "https://placehold.co/100x100.png",
    timezone: "America/New_York",
    fontSize: "base",
    isMainAdmin: true,
  },
  {
    id: "sup2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    password: "password123",
    role: "supervisor",
    avatar: "https://placehold.co/100x100.png",
    timezone: "Europe/London",
    fontSize: "base",
    isMainAdmin: false,
  },
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
        lesson: "Lesson 1",
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
        lesson: "Lesson 2",
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
        lesson: "Lesson 1",
        nextReview: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago (due for review)
        strength: 1,
    }
];


// This is a workaround to simulate a persistent data layer.
// In a real application, you would use a database.
// This function can be called from both server and client.
export function getAllUsers(): User[] {
    const usersMap = new Map<string, User>();

    // Load base users first to establish ground truth for critical properties.
    mockUsers.forEach(user => usersMap.set(user.id, { ...user }));

    // If on the client, merge with localStorage, but preserve authoritative properties.
    if (typeof window !== 'undefined') {
        const storedItems: User[] = [
            ...JSON.parse(localStorage.getItem('users') || '[]'),
            ...JSON.parse(localStorage.getItem('combinedUsers') || '[]')
        ];
        
        storedItems.forEach((storedUser) => {
            const baseUser = usersMap.get(storedUser.id);
            
            // Start with the stored user's properties (like updated name or avatar)
            const mergedUser = { ...storedUser };

            // Forcefully re-apply critical properties from the base data if it exists.
            if (baseUser) {
                mergedUser.role = baseUser.role;
                mergedUser.isMainAdmin = baseUser.isMainAdmin;
            }
            
            usersMap.set(storedUser.id, mergedUser);
        });
    }

    return Array.from(usersMap.values());
}


// Helper functions to simulate data fetching
export const getUserById = (id: string): User | undefined => {
    const allUsers = getAllUsers();
    return allUsers.find(u => u.id === id);
}

export const getStudentsBySupervisorId = (supervisorId: string): User[] => {
    let allUsers: User[] = getAllUsers();
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
