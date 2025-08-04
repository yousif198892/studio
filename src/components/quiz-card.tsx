
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

export function QuizCard({ word, onCorrect, onIncorrect, onNextWord }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    // The word.options array is now guaranteed to contain the correctOption and be unique from the data source.
    // We just need to shuffle it.
    setShuffledOptions([...word.options].sort(() => Math.random() - 0.5));
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
            return (
                <Button
                key={index}
                onClick={() => handleOptionClick(option)}
                className={cn("text-lg h-auto py-4 whitespace-normal", {
                    "bg-green-500 hover:bg-green-600 text-white": isAnswered && option === word.correctOption,
                    "bg-red-500 hover:bg-red-600 text-white": isAnswered && option === selectedOption && option !== word.correctOption,
                    "opacity-70": isAnswered && option !== selectedOption && option !== word.correctOption,
                })}
                variant={'outline'}
                disabled={isAnswered}
                >
                {option}
                </Button>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4 p-6 bg-secondary/50">
        {isAnswered && (
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
