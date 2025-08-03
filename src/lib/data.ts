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

export type Word = {
  id: string;
  word: string;
  definition: string;
  imageUrl: string;
  options: string[]; // This will include the correct word and 3 incorrect ones
  correctOption: string;
  supervisorId: string;
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
];

export const mockWords: Word[] = [
    {
        id: "word1",
        word: "Ephemeral",
        definition: "Lasting for a very short time.",
        imageUrl: "https://placehold.co/600x400.png",
        options: ["Ephemeral", "Permanent", "Eternal", "Enduring"],
        correctOption: "Ephemeral",
        supervisorId: "sup1",
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
    return mockWords.filter(w => w.supervisorId === student.supervisorId);
};
export const getWordsBySupervisor = (supervisorId: string): Word[] => mockWords.filter(w => w.supervisorId === supervisorId);
export const getWordForReview = (studentId: string): Word | undefined => {
    const words = getWordsForStudent(studentId);
    return words.filter(w => w.nextReview <= new Date()).sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime())[0];
};
