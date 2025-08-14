
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getWordForReview, Word } from "@/lib/data";
import { QuizCard } from "@/components/quiz-card";
import { Button } from "@/components/ui/button";
import { updateStudentProgressInStorage } from "@/lib/storage";
import { ClientOnly } from "@/components/client-only";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updateLearningStats, updateXp, XP_AMOUNTS } from "@/lib/stats";
import { WordProgress } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { XpToast } from "@/components/xp-toast";


export type ScheduleOption = 'tomorrow' | 'twoDays' | 'week' | 'twoWeeks' | 'month' | 'mastered';

type ReviewWord = Word & WordProgress;

export default function LearnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [word, setWord] = useState<ReviewWord | null>(null);
  const [sessionFinished, setSessionFinished] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  const userId = searchParams.get("userId");
  const unitFilter = searchParams.get("unit");
  const lessonFilter = searchParams.get("lesson");

  const loadNextWord = useCallback(async () => {
    if (userId) {
      const nextWord = await getWordForReview(userId, unitFilter, lessonFilter);
      setWord(nextWord);
      if (!nextWord) {
        setSessionFinished(true);
      }
    }
  }, [userId, unitFilter, lessonFilter]);

  const handleUpdateStats = useCallback((reviewedCount: number, durationSeconds: number) => {
    if (userId) {
      updateLearningStats({ userId, reviewedCount, durationSeconds });
    }
  }, [userId]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    loadNextWord();

    const cleanup = () => {
        if (userId && startTimeRef.current) {
          const endTime = Date.now();
          const durationSeconds = Math.round((endTime - startTimeRef.current) / 1000);
          
          if (durationSeconds > 0) {
            handleUpdateStats(0, durationSeconds);
          }
          
          startTimeRef.current = null;
        }
    }

    window.addEventListener('beforeunload', cleanup);

    return () => {
        cleanup();
        window.removeEventListener('beforeunload', cleanup);
    };
  }, [userId, loadNextWord, handleUpdateStats]);


  const handleCorrect = async (option: ScheduleOption) => {
    if (!word || !userId) return;

    let newStrength = word.strength >= 0 ? word.strength + 1 : 1;
    const nextReview = new Date();
    let xpEvent: 'master_word' | 'review_word' = 'review_word';

    switch (option) {
        case 'tomorrow':
            nextReview.setDate(nextReview.getDate() + 1);
            break;
        case 'twoDays':
            nextReview.setDate(nextReview.getDate() + 2);
            break;
        case 'week':
             nextReview.setDate(nextReview.getDate() + 7);
            break;
        case 'twoWeeks':
            nextReview.setDate(nextReview.getDate() + 14);
            break;
        case 'month':
            nextReview.setMonth(nextReview.getMonth() + 1);
            break;
        case 'mastered':
            newStrength = -1; // Mark as mastered
            xpEvent = 'master_word';
            break;
    }
    
    await updateStudentProgressInStorage(userId, word.id, { strength: newStrength, nextReview });
    handleUpdateStats(1, 0); // Only update review count, not time
    
    updateXp(userId, xpEvent);
    toast({
      description: <XpToast event={xpEvent} amount={XP_AMOUNTS[xpEvent]} />,
      duration: 3000,
    });
    
    loadNextWord();
  };

  const handleIncorrect = async () => {
    if (!word || !userId) return;

    const newStrength = Math.max(0, word.strength - 1);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + 1); // Schedule for tomorrow
    
    await updateStudentProgressInStorage(userId, word.id, { strength: newStrength, nextReview });
    handleUpdateStats(1, 0); // Only update review count, not time
    
    updateXp(userId, 'review_word');
    toast({
      description: <XpToast event="review_word" amount={XP_AMOUNTS["review_word"]} />,
      duration: 3000,
    });
    
    loadNextWord();
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        User not found. Please log in again.
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-secondary">
        <div className="w-full max-w-2xl">
           <Button variant="secondary" size="icon" asChild className="absolute top-4 left-4 rounded-full">
               <Link href={`/dashboard?userId=${userId}`}>
                   <ArrowLeft className="h-5 w-5" />
                   <span className="sr-only">{t('learn.backToDashboard')}</span>
               </Link>
           </Button>

          {sessionFinished ? (
            <div className="text-center p-8 bg-card rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold font-headline mb-4">{t('learn.sessionFinished.title')}</h2>
              <p className="text-muted-foreground mb-6">{t('learn.sessionFinished.description')}</p>
              <Button asChild>
                <Link href={`/dashboard?userId=${userId}`}>
                  {t('learn.backToDashboard')}
                </Link>
              </Button>
            </div>
          ) : word ? (
            <QuizCard
              key={word.id}
              word={word}
              onCorrect={handleCorrect}
              onIncorrect={handleIncorrect}
            />
          ) : (
            <div className="text-center">
              <p>{t('dashboard.loading')}</p>
            </div>
          )}
        </div>
      </div>
    </ClientOnly>
  );
}
