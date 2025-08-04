
"use client";

import { useState, useEffect } from "react";
import { getWordForReview, Word } from "@/lib/data";
import { QuizCard } from "@/components/quiz-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useSearchParams } from "next/navigation";

export default function LearnPage() {
  const [currentWord, setCurrentWord] = useState<Word | undefined>();
  const [sessionCount, setSessionCount] = useState(0);
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "user1";

  useEffect(() => {
    setCurrentWord(getWordForReview(userId));
  }, [sessionCount, userId]);

  const handleNextWord = () => {
    // In a real app, you'd fetch the next word from your backend
    // based on the SRS algorithm. Here we just cycle for demonstration.
    setSessionCount(prev => prev + 1);
  };
  
  const handleCorrect = () => {
    console.log(`Correct: ${currentWord?.word}`);
    // Here you would update the word's SRS data (increase strength, schedule next review)
  };

  const handleIncorrect = () => {
    console.log(`Incorrect: ${currentWord?.word}`);
    // Here you would update the word's SRS data (decrease strength, schedule review sooner)
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-secondary">
      {currentWord ? (
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
                <Button onClick={() => setSessionCount(prev => prev + 1)} className="mt-6">
                    {t('learn.startNewSession')}
                    <ArrowRight className="ms-2 h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
