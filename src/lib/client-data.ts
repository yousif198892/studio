// This file contains placeholder data to simulate a database.
// In a real application, this data would come from a database like Firestore.
// These functions are intended for CLIENT-SIDE USE ONLY.

import { mockUsers, type User } from './data';


export function getAllUsersFromClient(): User[] {
  const userMap = new Map<string, User>();
  const defaultAvatar = 'https://placehold.co/100x100.png';

  // Start with mock users
  mockUsers.forEach((user) =>
    userMap.set(user.id, { ...user, avatar: user.avatar || defaultAvatar })
  );

  // Safely read from localStorage only on the client
  if (typeof window !== 'undefined') {
    try {
      const storedUsers: User[] = JSON.parse(
        localStorage.getItem('users') || '[]'
      );
      storedUsers.forEach((user) =>
        userMap.set(user.id, { ...user, avatar: user.avatar || defaultAvatar })
      );
    } catch (e) {
      console.error('Failed to parse users from localStorage', e);
    }
  }

  return Array.from(userMap.values());
}


// Helper functions to simulate data fetching on the client
export const getUserByIdFromClient = (id: string): User | undefined => {
    const allUsers = getAllUsersFromClient();
    return allUsers.find(u => u.id === id);
}

export const getStudentsBySupervisorIdFromClient = (supervisorId: string): User[] => {
    const allUsers = getAllUsersFromClient();
    return allUsers.filter(u => u.role === 'student' && u.supervisorId === supervisorId);
}
