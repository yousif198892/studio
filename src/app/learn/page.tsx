
"use client";

import { useState, useEffect } from "react";
import { getWordsForStudent, Word } from "@/lib/data";
import { QuizCard } from "@/components/quiz-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// SRS Intervals (in days)
const srsIntervals = [1, 2, 4, 8, 16, 32, 64];

export default function LearnPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "user1";

  const [reviewWords, setReviewWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  useEffect(() => {
    if (userId) {
      const allWords = getWordsForStudent(userId);
      const dueWords = allWords
        .filter(w => new Date(w.nextReview) <= new Date())
        .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
      
      setReviewWords(dueWords);
      setCurrentWordIndex(0);
      setSessionCompleted(dueWords.length === 0);
    }
  }, [userId]);

  const updateWordInStorage = (updatedWord: Word) => {
    try {
      const allWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
      const supervisorId = getUserSupervisorId();
      const supervisorWords = getWordsBySupervisor(supervisorId);
      const otherSupervisorWords = allWords.filter(w => w.supervisorId !== supervisorId);
      
      const wordIndex = supervisorWords.findIndex(w => w.id === updatedWord.id);
      
      if (wordIndex > -1) {
        supervisorWords[wordIndex] = updatedWord;
      } else {
        // This case handles if the word is a mock word not yet in localStorage
        supervisorWords.push(updatedWord);
      }
      
      localStorage.setItem('userWords', JSON.stringify([...otherSupervisorWords, ...supervisorWords]));

    } catch (e) {
      console.error("Failed to update word in localStorage", e);
    }
  };
  
  const handleNextWord = () => {
    if (currentWordIndex < reviewWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const handleRestartSession = () => {
     if (userId) {
      const allWords = getWordsForStudent(userId);
      const dueWords = allWords
        .filter(w => new Date(w.nextReview) <= new Date())
        .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
      
      setReviewWords(dueWords);
      setCurrentWordIndex(0);
      setSessionCompleted(dueWords.length === 0);
    }
  }

  const handleCorrect = () => {
    const word = reviewWords[currentWordIndex];
    if (!word) return;

    const newStrength = Math.min(word.strength + 1, srsIntervals.length - 1);
    const intervalDays = srsIntervals[newStrength];
    const newNextReview = new Date();
    newNextReview.setDate(newNextReview.getDate() + intervalDays);
    
    const updatedWord: Word = { ...word, strength: newStrength, nextReview: newNextReview };
    
    // Update state for immediate feedback
    const updatedReviewWords = [...reviewWords];
    updatedReviewWords[currentWordIndex] = updatedWord;
    setReviewWords(updatedReviewWords);

    updateWordInStorage(updatedWord);
  };

  const handleIncorrect = () => {
    const word = reviewWords[currentWordIndex];
    if (!word) return;
    
    const newStrength = Math.max(0, word.strength - 1);
    const intervalDays = srsIntervals[newStrength];
    const newNextReview = new Date();
    newNextReview.setDate(newNextReview.getDate() + intervalDays);

    const updatedWord: Word = { ...word, strength: newStrength, nextReview: newNextReview };

    // Update state for immediate feedback
    const updatedReviewWords = [...reviewWords];
    updatedReviewWords[currentWordIndex] = updatedWord;
    setReviewWords(updatedReviewWords);
    
    updateWordInStorage(updatedWord);
  };
  
  // Helper functions to avoid repeating logic from data.ts on client if possible
  const getUserSupervisorId = () => {
      const allUsers = JSON.parse(localStorage.getItem('combinedUsers') || '[]');
      const currentUser = allUsers.find((u: any) => u.id === userId);
      return currentUser?.supervisorId;
  }
  
  const getWordsBySupervisor = (supervisorId: string) => {
    const allWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
    return allWords.filter(w => w.supervisorId === supervisorId);
  }


  const currentWord = reviewWords[currentWordIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-secondary">
      {!sessionCompleted && currentWord ? (
        <div key={currentWord.id} className="w-full max-w-2xl animate-in fade-in-50 duration-500">
          <h1 className="text-3xl font-bold font-headline mb-4 text-center">{t('learn.title')}</h1>
          <QuizCard
            word={currentWord}
            onCorrect={handleCorrect}
            onIncorrect={handleIncorrect}
            onNextWord={handleNextWord}
          />
        </div>
      ) : (
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{t('learn.finishedTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{t('learn.finishedDescription1')}</p>
                <p className="text-muted-foreground mt-2">{t('learn.finishedDescription2')}</p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
                    <Button onClick={handleRestartSession}>
                        {t('learn.startNewSession')}
                        <ArrowRight className="ms-2 h-4 w-4" />
                    </Button>
                     <Button variant="outline" asChild>
                        <Link href={`/dashboard?userId=${userId}`}>
                            <LayoutDashboard className="me-2 h-4 w-4" />
                            Go to Dashboard
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
