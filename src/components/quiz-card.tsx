
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
  onOverrideCorrect: () => void;
};

export function QuizCard({ word, onCorrect, onIncorrect, onNextWord, onOverrideCorrect }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    // Defensive shuffling
    const options = Array.from(new Set([word.correctOption, ...word.options]));
    setShuffledOptions(options.sort(() => Math.random() - 0.5));
    
    // Reset state for new word
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [word]);

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;

    const correct = option === word.correctOption;
    setSelectedOption(option);
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      onCorrect();
    } else {
      onIncorrect();
    }
  };
  
  const totalWords = 7; // Corresponds to SRS intervals length
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
            const isCorrectAnswer = option === word.correctOption;
            const isSelected = option === selectedOption;

            return (
                <Button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered}
                className={cn("text-lg h-auto py-4 whitespace-normal", {
                    "bg-green-500 hover:bg-green-600 text-white": isAnswered && isCorrectAnswer,
                    "bg-red-500 hover:bg-red-600 text-white": isAnswered && isSelected && !isCorrectAnswer,
                    "bg-red-500 hover:bg-red-600 text-white opacity-70": isAnswered && !isSelected && !isCorrectAnswer
                })}
                variant={isAnswered && !isCorrectAnswer && !isSelected ? 'outline' : 'default'}
                >
                {option}
                </Button>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4 p-6 bg-secondary/50">
        {isAnswered && (
             <div className="flex flex-col sm:flex-row gap-2">
                {!isCorrect && (
                   <Button onClick={onOverrideCorrect} size="lg" className="w-full" variant="secondary">
                       I Know It
                   </Button>
                )}
                <Button onClick={onNextWord} size="lg" className="w-full">
                    {t('learn.nextWord')} <ArrowRight className="ms-2 h-5 w-5" />
                </Button>
             </div>
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
