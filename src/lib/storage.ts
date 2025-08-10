

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
 * @param wordProgress The progress object for a single word.
 */
export const updateStudentProgressInStorage = async (studentId: string, wordId: string, newProgress: { strength: number, nextReview: Date }) => {
  if (typeof window === 'undefined') return;
  
  const progress: WordProgress = {
    id: `${studentId}-${wordId}`, // Create a unique key for the student-word pair
    studentId: studentId,
    ...newProgress,
    // Add the wordId to the object itself if needed for querying, though the key is now unique
  }

  const existingProgress = await getStudentProgressDB(studentId);
  const progressToSave = existingProgress.find(p => p.id === wordId) || { id: wordId, studentId, strength: 0, nextReview: new Date() };

  const updatedProgress: WordProgress = {
      ...progressToSave,
      ...newProgress,
  };


  try {
    // In IndexedDB, a simple "put" will either add or update the record.
    // We are now saving the entire progress list for a student, not just one word.
    // This function should be updated to only save a single item.
    await saveStudentProgressDB([updatedProgress]);
  } catch (e) {
    console.error("Failed to update student progress in IndexedDB", e);
  }
};
