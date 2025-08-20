

// This file contains placeholder data to simulate a database.
// In a real application, this data would come from a database like Firestore.
// This file now ONLY contains server-safe functions or data types.
import { redirect } from "next/navigation";


export type User = {
  id: string; // This is the Firebase Auth UID
  shortId?: string; // This is the shareable ID for supervisors (e.g., "sup1")
  name: string;
  email: string;
  role: "student" | "supervisor";
  avatar: string;
  supervisorId?: string; // For students, this will be the supervisor's Firebase Auth UID
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


// This function is safe because it's a server action that doesn't import firebase.
export async function redirectToDashboard(userId: string) {
    redirect(`/dashboard?userId=${userId}`);
}
