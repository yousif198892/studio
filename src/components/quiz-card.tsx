
"use client";

import { Word } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizCardProps {
  word: Word;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export function QuizCard({ word, onCorrect, onIncorrect }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  useEffect(() => {
    // Shuffle options only when the word changes
    const shuffled = [...word.options].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    // Reset state for new word
    setSelectedOption(null);
    setIsAnswered(false);
  }, [word]);


  const handleSubmit = () => {
    if (!selectedOption) return;

    setIsAnswered(true);
    const isCorrect = selectedOption === word.correctOption;

    setTimeout(() => {
      if (isCorrect) {
        onCorrect();
      } else {
        onIncorrect();
      }
    }, 1500); // Wait 1.5 seconds before moving to the next card
  };

  const getOptionState = (option: string) => {
    if (!isAnswered) return "default";
    if (option === word.correctOption) return "correct";
    if (option === selectedOption && option !== word.correctOption) return "incorrect";
    return "default";
  };
  
  const getRadioIndicatorClass = (state: "correct" | "incorrect" | "default") => {
      switch(state) {
          case 'correct':
              return "text-green-500";
          case 'incorrect':
              return "text-destructive";
          default:
              return "text-primary";
      }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-4xl font-headline">
          {word.word}
        </CardTitle>
        <CardDescription className="text-center text-lg">
          {word.definition}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Image
            src={word.imageUrl}
            alt={`Image for ${word.word}`}
            width={300}
            height={200}
            className="rounded-lg object-cover"
          />
        </div>
        <RadioGroup
          value={selectedOption || ""}
          onValueChange={setSelectedOption}
          disabled={isAnswered}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shuffledOptions.map((option) => {
                const state = getOptionState(option);
              return (
                <Label
                  key={option}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all",
                    state === "correct" && "border-green-500 bg-green-500/10",
                    state === "incorrect" && "border-destructive bg-destructive/10",
                     !isAnswered && selectedOption === option && "border-primary bg-primary/10",
                  )}
                >
                  <RadioGroupItem value={option} id={option} className={getRadioIndicatorClass(state)} />
                  <span className="font-medium text-base">{option}</span>
                   {state === "correct" && <CheckCircle className="ml-auto h-5 w-5 text-green-500" />}
                   {state === "incorrect" && <XCircle className="ml-auto h-5 w-5 text-destructive" />}
                </Label>
              );
            })}
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption || isAnswered}
          className="w-full"
        >
          Check Answer
        </Button>
      </CardFooter>
    </Card>
  );
}
