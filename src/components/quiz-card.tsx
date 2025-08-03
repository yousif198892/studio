"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Word } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";

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

  useEffect(() => {
    // Shuffling options on the client-side to avoid hydration mismatch
    setShuffledOptions([...word.options].sort(() => Math.random() - 0.5));
    setSelectedOption(null);
    setIsAnswered(false);
  }, [word]);


  const handleOptionClick = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    if (option === word.correctOption) {
      onCorrect();
    } else {
      onIncorrect();
    }
  };

  const getButtonVariant = (option: string) => {
    if (!isAnswered) return "outline";
    if (option === word.correctOption) return "default";
    if (option === selectedOption) return "destructive";
    return "outline";
  };
  
  const totalWords = 5; // Mock total words in session
  const progress = (word.strength / totalWords) * 100;


  return (
    <Card className="w-full overflow-hidden shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full">
            <Image
                src={word.imageUrl}
                alt={`Image for ${word.word}`}
                layout="fill"
                objectFit="cover"
                data-ai-hint="abstract vocabulary"
            />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-center text-muted-foreground mb-4 font-semibold">
          أي كلمة تعني: &ldquo;{word.definition}&rdquo;؟
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shuffledOptions.map((option) => (
            <Button
              key={option}
              onClick={() => handleOptionClick(option)}
              className={cn("text-lg h-auto py-4 whitespace-normal", {
                "bg-green-500 hover:bg-green-600 text-white": isAnswered && option === word.correctOption,
                "bg-red-500 hover:bg-red-600 text-white": isAnswered && selectedOption === option && option !== word.correctOption,
                "opacity-70": isAnswered && selectedOption !== option,
              })}
              variant={getButtonVariant(option)}
              disabled={isAnswered}
            >
              {option}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4 p-6 bg-secondary/50">
        {isAnswered && (
             <Button onClick={onNextWord} size="lg" className="w-full">
                الكلمة التالية <ArrowRight className="mr-2 h-5 w-5" />
            </Button>
        )}
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">قوة الكلمة</span>
                <span className="text-xs font-medium text-muted-foreground">{word.strength} / {totalWords}</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
        </div>
      </CardFooter>
    </Card>
  );
}
