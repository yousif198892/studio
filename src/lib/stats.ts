
'use client';

export type LearningStats = {
  timeSpentSeconds: number; 
  totalWordsReviewed: number;
  xp: number; // New field for experience points
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
  lastLoginDate: string; // New field for daily login XP
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
    daily_login: 10,
    master_word: 10,
    grammar_test: 20
};

const getInitialStats = (today: string): LearningStats => ({
    timeSpentSeconds: 0,
    totalWordsReviewed: 0,
    xp: 0,
    reviewedToday: { count: 0, date: today, timeSpentSeconds: 0, completedTests: [] },
    activityLog: [],
    spellingPractice: { count: 0, date: today },
    lastLoginDate: '1970-01-01',
});

const getStatsForUser = (userId: string): LearningStats => {
    if (typeof window === 'undefined') return getInitialStats(new Date().toISOString().split('T')[0]);
    const storedStats = localStorage.getItem(`learningStats_${userId}`);
    const today = new Date().toISOString().split('T')[0];

    const stats: LearningStats = storedStats ? JSON.parse(storedStats) : getInitialStats(today);

    // --- Data Migration & Defaults ---
    if (typeof stats.xp !== 'number') stats.xp = 0;
    if (!stats.lastLoginDate) stats.lastLoginDate = '1970-01-01';
    if (!stats.reviewedToday || stats.reviewedToday.date !== today) {
        stats.reviewedToday = { count: 0, date: today, timeSpentSeconds: 0, completedTests: [] };
    }
    if (!stats.spellingPractice || stats.spellingPractice.date !== today) {
        stats.spellingPractice = { count: 0, date: today };
    }
    if (!Array.isArray(stats.activityLog)) stats.activityLog = [];
    if (!Array.isArray(stats.reviewedToday.completedTests)) stats.reviewedToday.completedTests = [];
    if (typeof stats.reviewedToday.timeSpentSeconds !== 'number') stats.reviewedToday.timeSpentSeconds = 0;
    
    return stats;
}

export const updateXp = (userId: string, event: XpEvent) => {
    if (!userId) return;
    
    const stats = getStatsForUser(userId);
    const amount = XP_AMOUNTS[event];

    if (event === 'daily_login') {
        const today = new Date().toISOString().split('T')[0];
        if (stats.lastLoginDate === today) {
            return; // Already awarded today
        }
        stats.lastLoginDate = today;
    }
    
    stats.xp += amount;
    
    localStorage.setItem(`learningStats_${userId}`, JSON.stringify(stats));
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
  
  const stats = getStatsForUser(userId);
  const today = new Date().toISOString().split('T')[0];

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
      updateXp(userId, 'grammar_test');
  }

  localStorage.setItem(`learningStats_${userId}`, JSON.stringify(stats));
};
