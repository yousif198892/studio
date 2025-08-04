
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Word } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

type QuizCardProps = {
  word: Word;
  onCorrect: () => void;
  onIncorrect: () => void;
  onNextWord: () => void;
};

type ButtonVariant = "default" | "correct" | "incorrect" | "muted";


export function QuizCard({ word, onCorrect, onIncorrect, onNextWord }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    // Reset state when a new word is passed in
    const allOptions = [word.correctOption, ...word.options];
    const uniqueOptions = Array.from(new Set(allOptions));
    setShuffledOptions(uniqueOptions.sort(() => Math.random() - 0.5));
    setSelectedOption(null);
    setIsAnswered(false);
  }, [word]);


  const handleOptionClick = (option: string) => {
    if (isAnswered) return;

    const isCorrect = option === word.correctOption;
    setSelectedOption(option);
    setIsAnswered(true);

    if (isCorrect) {
      onCorrect();
      setTimeout(() => {
        onNextWord();
      }, 1000); // Wait 1 second before moving to the next word
    } else {
      onIncorrect();
    }
  };
  
  const getButtonVariant = (option: string): ButtonVariant => {
    if (!isAnswered) {
        return "default";
    }
    if (option === word.correctOption) {
        return "correct";
    }
    if (option === selectedOption) {
        return "incorrect";
    }
    return "muted";
  }
  
  const totalWords = 5; // Mock total words in session
  const progress = (word.strength / totalWords) * 100;


  return (
    <Card className="w-full overflow-hidden shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full bg-muted">
            <Image
                src={word.imageUrl}
                alt={`Image for ${word.word}`}
                fill
                style={{objectFit: 'contain'}}
                data-ai-hint="abstract vocabulary"
            />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-center text-muted-foreground mb-4 font-semibold">
          {t('learn.question', word.definition)}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shuffledOptions.map((option, index) => {
             const variant = getButtonVariant(option);
            return (
                <Button
                key={index}
                onClick={() => handleOptionClick(option)}
                className={cn("text-lg h-auto py-4 whitespace-normal", {
                    "bg-green-500 hover:bg-green-600 text-white": variant === 'correct',
                    "bg-red-500 hover:bg-red-600 text-white": variant === 'incorrect',
                    "bg-muted hover:bg-muted/80": variant === 'muted',
                })}
                variant={variant === 'default' ? 'outline' : 'default'}
                disabled={isAnswered}
                >
                {option}
                </Button>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4 p-6 bg-secondary/50">
        {isAnswered && selectedOption !== word.correctOption && (
             <Button onClick={onNextWord} size="lg" className="w-full">
                {t('learn.nextWord')} <ArrowRight className="ms-2 h-5 w-5" />
            </Button>
        )}
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">{t('learn.wordStrength')}</span>
                <span className="text-xs font-medium text-muted-foreground">{word.strength} / {totalWords}</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
        </div>
      </CardFooter>
    </Card>
  );
}
