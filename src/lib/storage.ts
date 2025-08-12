

'use client';

import type { Word } from './data';
import { getStudentProgressDB, saveStudentProgressDB } from './db';

// This interface represents only the data that changes per student.
export interface WordProgress {
  id: string; // This will be the word ID
  studentId: string;
  strength: number;
  nextReview: Date;
}

/**
 * Saves a student's progress for a single word to IndexedDB.
 * @param studentId The ID of the student.
 * @param wordId The ID of the word.
 * @param newProgress An object containing the new strength and nextReview date.
 */
export const updateStudentProgressInStorage = async (studentId: string, wordId: string, newProgress: { strength: number, nextReview: Date }) => {
  if (typeof window === 'undefined') return;

  const existingProgress = await getStudentProgressDB(studentId);
  
  // Find the existing progress for this specific word
  const progressToUpdate = existingProgress.find(p => p.id === wordId);

  // Create the final record to save. If it doesn't exist, create a new one.
  const updatedProgress: WordProgress = {
    id: wordId, // The key for the object store is the word's ID
    studentId: studentId,
    strength: newProgress.strength,
    nextReview: newProgress.nextReview,
  };
  
  // Create a new list of all progress items for the student, with the current one updated/added.
  const allProgressForStudent = existingProgress.filter(p => p.id !== wordId);
  allProgressForStudent.push(updatedProgress);

  try {
    // Save the entire updated list for the student.
    // The DB function is designed to handle an array of progress items.
    await saveStudentProgressDB(allProgressForStudent);
  } catch (e) {
    console.error("Failed to update student progress in IndexedDB", e);
  }
};
