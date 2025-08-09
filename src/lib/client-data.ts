

// This file contains placeholder data to simulate a database.
// In a real application, this data would come from a database like Firestore.
// These functions are intended for CLIENT-SIDE USE ONLY.

import { type User } from './data';
import { db } from './db';


export async function getAllUsersFromClient(): Promise<User[]> {
  // This function now exclusively fetches from IndexedDB,
  // which is seeded on its initial creation.
  return await db.users.getAll();
}


// Helper functions to simulate data fetching on the client
export const getUserByIdFromClient = async (id: string): Promise<User | undefined> => {
    return await db.users.get(id);
}

export const getStudentsBySupervisorIdFromClient = async (supervisorId: string): Promise<User[]> => {
    const allUsers = await getAllUsersFromClient();
    return allUsers.filter(u => u.role === 'student' && u.supervisorId === supervisorId);
}
