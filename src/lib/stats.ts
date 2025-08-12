
'use client';

type LearningStats = {
  timeSpentSeconds: number; 
  totalWordsReviewed: number;
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
};

type UpdateStatsParams = {
  userId: string;
  reviewedCount?: number;
  durationSeconds?: number;
  testName?: string;
  spelledCount?: number;
};

export const updateLearningStats = ({
  userId,
  reviewedCount = 0,
  durationSeconds = 0,
  testName,
  spelledCount = 0,
}: UpdateStatsParams) => {
  if (!userId) return;
  
  const storedStats = localStorage.getItem(`learningStats_${userId}`);
  const today = new Date().toISOString().split('T')[0];

  const stats: LearningStats = storedStats
    ? JSON.parse(storedStats)
    : {
        timeSpentSeconds: 0,
        totalWordsReviewed: 0,
        reviewedToday: { count: 0, date: today, timeSpentSeconds: 0, completedTests: [] },
        activityLog: [],
        spellingPractice: { count: 0, date: today },
      };

  // Reset daily stats if the date has changed
  if (stats.reviewedToday.date !== today) {
    stats.reviewedToday = { count: 0, date: today, timeSpentSeconds: 0, completedTests: [] };
  }
  
  if (!stats.spellingPractice || stats.spellingPractice.date !== today) {
    stats.spellingPractice = { count: 0, date: today };
  }


  // Ensure properties exist
  if (typeof stats.reviewedToday.timeSpentSeconds !== 'number') {
    stats.reviewedToday.timeSpentSeconds = 0;
  }
  if (!Array.isArray(stats.reviewedToday.completedTests)) {
    stats.reviewedToday.completedTests = [];
  }
   if (!Array.isArray(stats.activityLog)) {
    stats.activityLog = [];
  }

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
  
  // Log completed test
  if (testName && !stats.reviewedToday.completedTests.includes(testName)) {
      stats.reviewedToday.completedTests.push(testName);
  }

  localStorage.setItem(`learningStats_${userId}`, JSON.stringify(stats));
};
