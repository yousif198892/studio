
"use client";

import { useState } from "react";
import { getWordForReview, Word } from "@/lib/data";
import { QuizCard } from "@/components/quiz-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

// In a real app, this would come from a session
const MOCK_USER_ID = "user1";

export default function LearnPage() {
  const [currentWord, setCurrentWord] = useState<Word | undefined>(
    () => getWordForReview(MOCK_USER_ID)
  );
  
  const [sessionCount, setSessionCount] = useState(0);
  const { t } = useLanguage();

  const handleNextWord = () => {
    // In a real app, you'd fetch the next word from your backend
    // based on the SRS algorithm. Here we just cycle for demonstration.
    setSessionCount(prev => prev + 1);
    setCurrentWord(getWordForReview(MOCK_USER_ID));
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
    <div className="flex flex-col items-center justify-center min-h-full p-4">
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
                <Button onClick={handleNextWord} className="mt-6">
                    {t('learn.startNewSession')}
                    <ArrowRight className="ms-2 h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
