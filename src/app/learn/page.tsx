
"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

import { QuizCard } from "@/components/quiz-card";
import { Button } from "@/components/ui/button";
import { getWordsForStudent, Word } from "@/lib/data";
import { useLanguage } from "@/hooks/use-language";
import { ClientOnly } from "@/components/client-only";

const SRS_INTERVALS = [1, 2, 4, 8, 16, 32, 64]; // in days

type LearningStats = {
  timeSpentSeconds: number;
  totalWordsReviewed: number;
  reviewedToday: {
    count: number;
    date: string; // YYYY-MM-DD
  };
};

export default function LearnPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "user1";
  const { t } = useLanguage();

  const [reviewWords, setReviewWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const sessionStartTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    sessionStartTimeRef.current = new Date();

    const handleBeforeUnload = () => {
      if (sessionStartTimeRef.current) {
        const sessionEndTime = new Date();
        const timeDiffSeconds = Math.round((sessionEndTime.getTime() - sessionStartTimeRef.current.getTime()) / 1000);
        updateTimeSpent(timeDiffSeconds);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Also save on component unmount (e.g., navigating away)
    };
  }, [userId]);


  useEffect(() => {
    const loadWords = () => {
      // This is now hardcoded to show no words.
      setReviewWords([]);
      setCurrentWord(null);
      setSessionFinished(true);
      setIsLoading(false);
    };
    loadWords();
  }, [userId]);

  const updateWordInStorage = (updatedWord: Word) => {
    try {
      const storageKey = `userWords_${userId}`;
      const allWords: Word[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const wordIndex = allWords.findIndex(w => w.id === updatedWord.id);
      
      if (wordIndex > -1) {
        allWords[wordIndex] = updatedWord;
      } else {
        allWords.push(updatedWord);
      }
      
      const uniqueWords = Array.from(new Map(allWords.map(item => [item.id, item])).values());
      localStorage.setItem(storageKey, JSON.stringify(uniqueWords));
    } catch (e) {
      console.error("Failed to update word in localStorage", e);
    }
  };

  const updateTimeSpent = (seconds: number) => {
     const storedStats = localStorage.getItem(`learningStats_${userId}`);
      let stats: LearningStats = storedStats ? JSON.parse(storedStats) : {
        timeSpentSeconds: 0,
        totalWordsReviewed: 0,
        reviewedToday: { count: 0, date: new Date().toISOString().split('T')[0] },
      };
      stats.timeSpentSeconds += seconds;
      localStorage.setItem(`learningStats_${userId}`, JSON.stringify(stats));
  };
  
  const incrementReviewCount = () => {
    const storedStats = localStorage.getItem(`learningStats_${userId}`);
    let stats: LearningStats = storedStats ? JSON.parse(storedStats) : {
      timeSpentSeconds: 0,
      totalWordsReviewed: 0,
      reviewedToday: { count: 0, date: new Date().toISOString().split('T')[0] },
    };
    
    const today = new Date().toISOString().split('T')[0];

    // Reset daily count if the date has changed
    if (stats.reviewedToday.date !== today) {
      stats.reviewedToday = { count: 1, date: today };
    } else {
      stats.reviewedToday.count += 1;
    }

    stats.totalWordsReviewed += 1;
    localStorage.setItem(`learningStats_${userId}`, JSON.stringify(stats));
  };


  const handleNextWord = () => {
    const currentIndex = reviewWords.findIndex(w => w.id === currentWord?.id);
    const nextIndex = currentIndex + 1;

    if (nextIndex < reviewWords.length) {
      setCurrentWord(reviewWords[nextIndex]);
    } else {
      setSessionFinished(true);
    }
  };

  const updateWordStrength = (word: Word, correct: boolean) => {
    const newStrength = correct ? Math.min(word.strength + 1, SRS_INTERVALS.length -1) : 0;
    const daysToAdd = SRS_INTERVALS[newStrength];
    const newNextReview = new Date();
    newNextReview.setDate(newNextReview.getDate() + daysToAdd);
    
    const updatedWord: Word = {
      ...word,
      strength: newStrength,
      nextReview: newNextReview,
    };
    
    updateWordInStorage(updatedWord);
  };
  
  const handleCorrect = () => {
    if (!currentWord) return;
    updateWordStrength(currentWord, true);
    incrementReviewCount();
  };

  const handleIncorrect = () => {
    if (!currentWord) return;
    updateWordStrength(currentWord, false);
    incrementReviewCount();
  };

  const handleOverrideCorrect = () => {
     if (!currentWord) return;
     updateWordStrength(currentWord, true);
     // Note: we don't call incrementReviewCount here again to avoid double counting
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">{t('dashboard.loading')}</div>
  }

  return (
    <ClientOnly>
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-secondary p-4 sm:p-6 md:p-8">
            <Link href={`/dashboard?userId=${userId}`} className="absolute top-4 right-4">
                <Button variant="ghost" size="icon">
                    <LayoutDashboard className="h-6 w-6" />
                </Button>
            </Link>
            <div className="w-full max-w-2xl">
                {sessionFinished ? (
                <div className="text-center bg-card p-8 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-bold font-headline mb-4">
                    {t('learn.finishedTitle')}
                    </h2>
                    <p className="text-muted-foreground mb-2">
                    {t('learn.finishedDescription1')}
                    </p>
                    <p className="text-muted-foreground mb-6">
                     {t('learn.finishedDescription2')}
                    </p>
                    <Button asChild>
                    <Link href={`/dashboard?userId=${userId}`}>
                        <ArrowLeft className="me-2 h-4 w-4" /> {t('learn.backToDashboard')}
                    </Link>
                    </Button>
                </div>
                ) : currentWord ? (
                <QuizCard
                    key={currentWord.id}
                    word={currentWord}
                    onCorrect={handleCorrect}
                    onIncorrect={handleIncorrect}
                    onNextWord={handleNextWord}
                    onOverrideCorrect={handleOverrideCorrect}
                />
                ) : (
                <div className="text-center">{t('dashboard.loading')}</div>
                )}
            </div>
        </div>
    </ClientOnly>
  );
}
