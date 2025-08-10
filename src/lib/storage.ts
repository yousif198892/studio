

'use client';

import type { Word } from './data';
import { saveStudentProgressDB } from './db';

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
    id: wordId,
    studentId: studentId,
    ...newProgress
  }

  try {
    // In IndexedDB, a simple "put" will either add or update the record.
    await saveStudentProgressDB([progress]);
  } catch (e) {
    console.error("Failed to update student progress in IndexedDB", e);
  }
};
