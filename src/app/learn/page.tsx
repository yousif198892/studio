
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
    console.log(`Correct: ${word?.word}`);
    // Here you would update the word's SRS data (increase strength, schedule next review)
  };

  const handleIncorrect = () => {
    const word = reviewWords[currentWordIndex];
    console.log(`Incorrect: ${word?.word}`);
    // Here you would update the word's SRS data (decrease strength, schedule review sooner)
  };

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
