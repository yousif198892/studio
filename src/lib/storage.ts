
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
 * Saves a student's progress for a single word to Firestore.
 * @param studentId The ID of the student.
 * @param wordId The ID of the word.
 * @param newProgress An object containing the new strength and nextReview date.
 */
export const updateStudentProgressInStorage = async (studentId: string, wordId: string, newProgress: { strength: number, nextReview: Date }) => {
  if (!studentId || !wordId) return;

  const progressRecord: WordProgress = {
    id: wordId,
    studentId: studentId,
    strength: newProgress.strength,
    nextReview: newProgress.nextReview,
  };

  try {
    // Save the single progress record to Firestore.
    // The db function handles putting this in a subcollection for the user.
    await saveStudentProgressDB(studentId, [progressRecord]);
  } catch (e) {
    console.error("Failed to update student progress in Firestore", e);
  }
};
