
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
    isSuspended: false,
  },
];

// This is a workaround to simulate a persistent data layer.
// In a real application, you would use a database.
export function getAllUsers(): User[] {
    const usersMap = new Map<string, User>();

    // Load base users first to establish ground truth for critical properties.
    mockUsers.forEach(user => usersMap.set(user.id, { ...user }));

    if (typeof window !== 'undefined') {
        const storedItems: User[] = [
            ...JSON.parse(localStorage.getItem('users') || '[]'),
            ...JSON.parse(localStorage.getItem('combinedUsers') || '[]')
        ];
        
        storedItems.forEach((storedUser) => {
            const baseUser = usersMap.get(storedUser.id);
            
            if (baseUser) {
                // If the user exists in the base data, merge only non-critical properties.
                // This preserves the authoritative role and isMainAdmin status.
                const mergedUser = {
                    ...baseUser,
                    name: storedUser.name || baseUser.name,
                    avatar: storedUser.avatar || baseUser.avatar,
                    timezone: storedUser.timezone || baseUser.timezone,
                    fontSize: storedUser.fontSize || baseUser.fontSize,
                    isSuspended: 'isSuspended' in storedUser ? storedUser.isSuspended : baseUser.isSuspended,
                };
                usersMap.set(storedUser.id, mergedUser);
            } else {
                 // If it's a completely new user not in mock data, add them.
                usersMap.set(storedUser.id, { ...storedUser });
            }
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

const getSupervisorWordsFromStorage = (supervisorId: string): Word[] => {
    if (typeof window === 'undefined') return [];
    
    const storedWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
    return storedWords.filter(w => w.supervisorId === supervisorId);
}

// Simulates fetching student-specific word data, which might include their personal progress
const getStudentWordProgressFromStorage = (studentId: string): Word[] => {
    if (typeof window === 'undefined') return [];

    // In a real app, this might be a separate localStorage key like `studentProgress_${studentId}`
    // For this demo, we'll assume student progress is mixed into 'userWords' and filtered by an implicit owner.
    // However, our current structure doesn't store studentId on a word, so we rely on the supervisor's list.
    // The key is to merge the supervisor's master list with any student-specific progress.
    const storedWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');

    // This is a simplified model. A real app would have a better way to track student-specific states.
    return storedWords;
}


export const getWordsForStudent = (studentId: string): Word[] => {
    const student = getUserById(studentId);
    if (!student || !student.supervisorId) return [];

    // Get the master list of words from the supervisor
    const supervisorWords = getSupervisorWordsFromStorage(student.supervisorId);
    
    // Get all word progress data (which in our case is the shared list)
    const studentProgressWords = getStudentWordProgressFromStorage(studentId);

    // Merge the two. The student's progress on a word takes precedence.
    const mergedWords = new Map<string, Word>();

    // First, add all of the supervisor's words. These are the "master" copies.
    supervisorWords.forEach(sw => {
        mergedWords.set(sw.id, {
            ...sw,
            nextReview: new Date(sw.nextReview) // Ensure date is a Date object
        });
    });

    // Then, overlay any specific progress the student has made.
    studentProgressWords.forEach(spw => {
        // Only apply progress to words that actually belong to the student's supervisor
        if (mergedWords.has(spw.id)) {
             mergedWords.set(spw.id, {
                ...spw, // Student progress overrides the base word
                nextReview: new Date(spw.nextReview)
             });
        }
    });

    return Array.from(mergedWords.values());
};

export const getWordsBySupervisor = (supervisorId: string): Word[] => {
    return getSupervisorWordsFromStorage(supervisorId).map(word => ({
        ...word,
        nextReview: new Date(word.nextReview)
    }));
};
export const getWordForReview = (studentId: string): Word | undefined => {
    const words = getWordsForStudent(studentId);
    return words.filter(w => new Date(w.nextReview) <= new Date() && w.strength >= 0).sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())[0];
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
