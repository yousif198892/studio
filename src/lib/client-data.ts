

// This file contains placeholder data to simulate a database.
// In a real application, this data would come from a database like Firestore.
// These functions are intended for CLIENT-SIDE USE ONLY.

import { type User, mockUsers, getAllUsers as getAllMockUsers, getStudentsBySupervisorId } from './data';

// This function now combines mock users with users stored in localStorage
// This is the primary function to get all users on the client-side.
export function getAllUsersFromClient(): User[] {
  const userMap = new Map<string, User>();
  const defaultAvatar = "https://placehold.co/100x100.png";

  // Start with mock users
  mockUsers.forEach(user => userMap.set(user.id, { ...user, avatar: user.avatar || defaultAvatar }));
  
  // Add/overwrite with users from localStorage
  if (typeof window !== 'undefined') {
    const storedUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    storedUsers.forEach(user => userMap.set(user.id, { ...user, avatar: user.avatar || defaultAvatar }));
  }
  
  return Array.from(userMap.values());
}


// Helper functions to simulate data fetching on the client
export const getUserByIdFromClient = (id: string): User | undefined => {
    return getAllUsersFromClient().find(u => u.id === id);
}

export const getStudentsBySupervisorIdFromClient = (supervisorId: string): User[] => {
    const allUsers = getAllUsersFromClient();
    return allUsers.filter(u => u.role === 'student' && u.supervisorId === supervisorId);
}
