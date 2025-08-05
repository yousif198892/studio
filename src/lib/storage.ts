
'use client';

import type { Word } from './data';

// This interface represents only the data that changes per student.
export interface WordProgress {
  id: string;
  strength: number;
  nextReview: Date;
}

/**
 * Retrieves a student's progress for all words from localStorage.
 * @param studentId The ID of the student.
 * @returns An array of WordProgress objects.
 */
export const getStudentProgressFromStorage = (studentId: string): WordProgress[] => {
  if (typeof window === 'undefined') return [];

  const storageKey = `wordProgress_${studentId}`;
  try {
    const storedData = localStorage.getItem(storageKey);
    if (!storedData) return [];
    
    const progressData: WordProgress[] = JSON.parse(storedData);
    // Ensure dates are correctly parsed
    return progressData.map(p => ({ ...p, nextReview: new Date(p.nextReview) }));
  } catch (e) {
    console.error("Failed to get student progress from localStorage", e);
    return [];
  }
};

/**
 * Saves a student's progress for a single word to localStorage.
 * @param studentId The ID of the student.
 * @param wordProgress The progress object for a single word.
 */
export const updateStudentProgressInStorage = (studentId: string, wordProgress: WordProgress) => {
  if (typeof window === 'undefined') return;

  const storageKey = `wordProgress_${studentId}`;
  try {
    const allProgress = getStudentProgressFromStorage(studentId);
    const progressIndex = allProgress.findIndex(p => p.id === wordProgress.id);

    if (progressIndex > -1) {
      allProgress[progressIndex] = wordProgress;
    } else {
      allProgress.push(wordProgress);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(allProgress));
  } catch (e) {
    console.error("Failed to update student progress in localStorage", e);
  }
};

/**
 * Saves a student's progress for multiple words to localStorage.
 * @param studentId The ID of the student.
 * @param allWordsProgress An array of all progress objects for the student.
 */
export const saveAllStudentProgressInStorage = (studentId: string, allWordsProgress: WordProgress[]) => {
    if (typeof window === 'undefined') return;
    const storageKey = `wordProgress_${studentId}`;
    try {
        localStorage.setItem(storageKey, JSON.stringify(allWordsProgress));
    } catch (e) {
        console.error("Failed to save all student progress in localStorage", e);
    }
}
