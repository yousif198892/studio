
// This file contains placeholder data to simulate a database.
// In a real application, this data would come from a database like Firestore.
// These functions are intended for CLIENT-SIDE USE ONLY.

import { mockUsers, type User } from './data';
import { db } from './db';


export async function getAllUsersFromClient(): Promise<User[]> {
  const userMap = new Map<string, User>();
  const defaultAvatar = 'https://placehold.co/100x100.png';

  // Start with mock users
  mockUsers.forEach((user) =>
    userMap.set(user.id, { ...user, avatar: user.avatar || defaultAvatar })
  );

  // Safely read from IndexedDB only on the client
  if (typeof window !== 'undefined') {
    try {
      const storedUsers = await db.users.getAll();
      storedUsers.forEach((user) =>
        userMap.set(user.id, { ...user, avatar: user.avatar || defaultAvatar })
      );
    } catch (e) {
      console.error('Failed to parse users from IndexedDB', e);
    }
  }

  return Array.from(userMap.values());
}


// Helper functions to simulate data fetching on the client
export const getUserByIdFromClient = async (id: string): Promise<User | undefined> => {
    const allUsers = await getAllUsersFromClient();
    return allUsers.find(u => u.id === id);
}

export const getStudentsBySupervisorIdFromClient = async (supervisorId: string): Promise<User[]> => {
    const allUsers = await getAllUsersFromClient();
    return allUsers.filter(u => u.role === 'student' && u.supervisorId === supervisorId);
}
