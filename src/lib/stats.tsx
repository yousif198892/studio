

'use client';

import { getWeek, startOfWeek } from 'date-fns';
import { XpToast } from '@/components/xp-toast';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from './data';

// Represents the results for a single student from the previous week.
export type LastWeekWinner = {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  rank: number;
};

export type LearningStats = {
  timeSpentSeconds: number;
  totalWordsReviewed: number;
  xp: number;
  reviewedToday: {
    count: number;
    date: string;
    timeSpentSeconds: number;
    completedTests: string[];
  };
  activityLog: string[];
  spellingPractice: {
    count: number;
    date: string;
  };
  lastLoginDate: string;
  weekStartDate?: string; // ISO date string for start of the week
  // New fields for weekly results
  lastWeek?: {
    weekId: string; // e.g., "2024-28"
    winners: LastWeekWinner[];
  } | null;
  hasSeenLastWeekResults?: boolean;
};

export type XpEvent =
  | 'review_word'
  | 'spell_correct'
  | 'daily_login'
  | 'master_word'
  | 'grammar_test';

export const XP_AMOUNTS: Record<XpEvent, number> = {
    review_word: 5,
    spell_correct: 5,
    daily_login: 20,
    master_word: 10,
    grammar_test: 20
};

export const getInitialStats = (today: string): LearningStats => ({
    timeSpentSeconds: 0,
    totalWordsReviewed: 0,
    xp: 0,
    reviewedToday: { count: 0, date: today, timeSpentSeconds: 0, completedTests: [] },
    activityLog: [],
    spellingPractice: { count: 0, date: today },
    lastLoginDate: '1970-01-01',
    weekStartDate: startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(), // Monday
    lastWeek: null,
    hasSeenLastWeekResults: true,
});

async function getStudentsAndStatsBySupervisor(supervisorId: string): Promise<{user: User, stats: LearningStats}[]> {
    const studentQuery = query(collection(db, "users"), where("supervisorId", "==", supervisorId));
    const studentSnapshot = await getDocs(studentQuery);
    
    const studentsWithStats = await Promise.all(studentSnapshot.docs.map(async (doc) => {
        const user = { ...doc.data(), id: doc.id } as User;
        const stats = await getStatsForUser(user.id);
        return { user, stats };
    }));
    
    return studentsWithStats;
}

export const getStatsForUser = async (userId: string): Promise<LearningStats> => {
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
    const thisWeekId = `${today.getFullYear()}-${getWeek(today, { weekStartsOn: 1 })}`;

    const statsDocRef = doc(db, `users/${userId}/app-data/stats`);
    const statsSnap = await getDoc(statsDocRef);

    let stats: LearningStats;
    let currentUser: User | undefined;

    if (statsSnap.exists()) {
        stats = statsSnap.data() as LearningStats;
    } else {
        stats = getInitialStats(todayStr);
        await setDoc(statsDocRef, stats);
    }

    // --- Data Migration & Defaults ---
    if (typeof stats.xp !== 'number') stats.xp = 0;
    if (!stats.lastLoginDate) stats.lastLoginDate = '1970-01-01';
    if (!stats.weekStartDate) stats.weekStartDate = startOfThisWeek.toISOString();
    if (typeof stats.hasSeenLastWeekResults !== 'boolean') stats.hasSeenLastWeekResults = true;

    // --- Weekly Rollover Logic ---
    const lastWeekStartDate = new Date(stats.weekStartDate);
    const lastWeekId = `${lastWeekStartDate.getFullYear()}-${getWeek(lastWeekStartDate, { weekStartsOn: 1 })}`;
    
    if (thisWeekId !== lastWeekId && !stats.lastWeek?.weekId?.endsWith(lastWeekId)) {
        currentUser = await getUserById(userId);
        if (currentUser?.supervisorId) {
            const classmates = await getStudentsAndStatsBySupervisor(currentUser.supervisorId);
            const leaderboard = classmates
                .map(({ user, stats }) => ({ ...user, xp: stats.xp }))
                .sort((a, b) => b.xp - a.xp);

            const winners = leaderboard.slice(0, 3).map((player, index) => ({
                id: player.id,
                name: player.name,
                avatar: player.avatar,
                xp: player.xp,
                rank: index + 1,
            }));

            // Update stats for all students in the class
            for (const { user: student } of classmates) {
                const studentStatsRef = doc(db, `users/${student.id}/app-data/stats`);
                await setDoc(studentStatsRef, {
                    xp: 0,
                    weekStartDate: startOfThisWeek.toISOString(),
                    lastWeek: { weekId: lastWeekId, winners },
                    hasSeenLastWeekResults: false
                }, { merge: true });
            }
            
            // Reload stats for the current user after update
            const updatedStatsSnap = await getDoc(statsDocRef);
            if(updatedStatsSnap.exists()) {
                 stats = updatedStatsSnap.data() as LearningStats;
            }
        }
    }


    // --- Daily Data Reset Logic ---
    if (!stats.reviewedToday || stats.reviewedToday.date !== todayStr) {
        stats.reviewedToday = { count: 0, date: todayStr, timeSpentSeconds: 0, completedTests: [] };
    }
    if (!stats.spellingPractice || stats.spellingPractice.date !== todayStr) {
        stats.spellingPractice = { count: 0, date: todayStr };
    }
    if (!Array.isArray(stats.activityLog)) stats.activityLog = [];
    if (!Array.isArray(stats.reviewedToday.completedTests)) stats.reviewedToday.completedTests = [];
    if (typeof stats.reviewedToday.timeSpentSeconds !== 'number') stats.reviewedToday.timeSpentSeconds = 0;

    return stats;
}

export const updateXp = async (userId: string, event: XpEvent) => {
    if (!userId) return { updated: false, amount: 0 };

    const stats = await getStatsForUser(userId);
    const amount = XP_AMOUNTS[event];
    const today = new Date().toLocaleDateString('en-CA');

    if (event === 'daily_login') {
        if (stats.lastLoginDate === today) {
            return { updated: false, amount: 0 }; // Already awarded today
        }
        stats.lastLoginDate = today;
    }

    stats.xp += amount;

    const statsDocRef = doc(db, `users/${userId}/app-data/stats`);
    await setDoc(statsDocRef, stats, { merge: true });

    return { updated: true, amount };
};


type UpdateStatsParams = {
  userId: string;
  reviewedCount?: number;
  durationSeconds?: number;
  testName?: string;
  spelledCount?: number;
  toast?: (props: any) => void;
  markAsSeen?: boolean;
};

export const updateLearningStats = async ({
  userId,
  reviewedCount = 0,
  durationSeconds = 0,
  testName,
  spelledCount = 0,
  toast,
  markAsSeen = false,
}: UpdateStatsParams) => {
  if (!userId) return;

  const stats = await getStatsForUser(userId);
  const today = new Date().toLocaleDateString('en-CA');

  // Update stats
  stats.totalWordsReviewed += reviewedCount;
  stats.timeSpentSeconds += durationSeconds;
  stats.reviewedToday.count += reviewedCount;
  stats.reviewedToday.timeSpentSeconds += durationSeconds;
  stats.spellingPractice.count += spelledCount;

  // Log activity
  if (!stats.activityLog.includes(today)) {
    stats.activityLog.push(today);
  }

  // Log completed test and award XP
  if (testName && !stats.reviewedToday.completedTests.includes(testName)) {
      stats.reviewedToday.completedTests.push(testName);
      stats.xp += XP_AMOUNTS.grammar_test;
      if (toast) {
           toast({
              description: <XpToast event="grammar_test" amount={XP_AMOUNTS.grammar_test} />,
              duration: 3000,
          });
      }
  }

  if (markAsSeen) {
      stats.hasSeenLastWeekResults = true;
  }

  const statsDocRef = doc(db, `users/${userId}/app-data/stats`);
  await setDoc(statsDocRef, stats, { merge: true });
};


// Helper function needed for stats rollover
async function getUserById(id: string): Promise<User | undefined> {
    if (!id) return undefined;
    const userDocRef = doc(db, 'users', id);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) return undefined;
    const data = userSnap.data();
    if (data.trialExpiresAt && data.trialExpiresAt instanceof Timestamp) {
        data.trialExpiresAt = data.trialExpiresAt.toDate().toISOString();
    }
    return { ...data, id: userSnap.id } as User;
}

