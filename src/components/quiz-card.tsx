
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
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Star, Calendar } from "lucide-react";
import { WordAudioPlayer } from "./word-audio-player";
import type { ScheduleOption } from "@/app/learn/page";
import { useLanguage } from "@/hooks/use-language";

interface QuizCardProps {
  word: Word;
  onCorrect: (option: ScheduleOption) => void;
  onIncorrect: () => void;
}

type ViewState = 'question' | 'feedback' | 'schedule';

export function QuizCard({ word, onCorrect, onIncorrect }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>('question');
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const { t } = useLanguage();
  
  const isNewWord = word.strength === 0;

  useEffect(() => {
    // Shuffle options only when the word changes
    const shuffled = [...word.options].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    // Reset state for new word
    setSelectedOption(null);
    setViewState('question');
    setIsCorrect(false);
  }, [word]);


  const handleSubmit = () => {
    if (!selectedOption) return;

    const correct = selectedOption === word.correctOption;
    setIsCorrect(correct);
    setViewState('feedback'); // Show feedback first

    setTimeout(() => {
      if (correct) {
        setViewState('schedule'); // Move to scheduling view
      } else {
        onIncorrect(); // If incorrect, move to next word
      }
    }, 1500); // Wait 1.5 seconds before showing schedule or next card
  };

  const getOptionState = (option: string) => {
    if (viewState !== 'feedback') return "default";
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

  const handleScheduleSelect = (option: ScheduleOption) => {
    onCorrect(option);
  }

  const renderQuestionView = () => (
    <>
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
          disabled={viewState !== 'question'}
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
                    viewState === 'question' && selectedOption === option && "border-primary bg-primary/10",
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
          disabled={!selectedOption || viewState !== 'question'}
          className="w-full"
        >
          {t('quizCard.checkAnswer')}
        </Button>
      </CardFooter>
    </>
  );

  const renderScheduleView = () => (
      <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
        <div className="flex justify-center mb-4">
            <Image
                src={word.imageUrl}
                alt={`Image for ${word.word}`}
                width={150}
                height={100}
                className="rounded-lg object-cover"
            />
        </div>
        <h3 className="text-xl font-semibold">{t('quizCard.schedule.title')}</h3>
        <p className="text-muted-foreground">{t('quizCard.schedule.description')}</p>
        <div className="w-full space-y-2">
           <Button onClick={() => handleScheduleSelect('tomorrow')} variant="outline" className="w-full justify-start">
               <Calendar className="mr-2 h-4 w-4" />
               {t('quizCard.schedule.tomorrow')}
           </Button>
            <Button 
                onClick={() => handleScheduleSelect('twoDays')} 
                variant={isNewWord ? 'default' : 'outline'} 
                className="w-full justify-start relative"
            >
               <Calendar className="mr-2 h-4 w-4" />
               {t('quizCard.schedule.inTwoDays')}
               {isNewWord && <span className="absolute right-2 text-xs bg-primary-foreground/20 text-white py-0.5 px-1.5 rounded-full">{t('quizCard.schedule.recommended')}</span>}
           </Button>
           <Button 
                onClick={() => handleScheduleSelect('week')} 
                variant={!isNewWord ? 'default' : 'outline'}
                className="w-full justify-start relative"
            >
               <Calendar className="mr-2 h-4 w-4" />
                {t('quizCard.schedule.inAWeek')}
                {!isNewWord && <span className="absolute right-2 text-xs bg-primary-foreground/20 text-white py-0.5 px-1.5 rounded-full">{t('quizCard.schedule.recommended')}</span>}
           </Button>
           <Button onClick={() => handleScheduleSelect('twoWeeks')} variant="outline" className="w-full justify-start">
               <Calendar className="mr-2 h-4 w-4" />
                {t('quizCard.schedule.inTwoWeeks')}
           </Button>
           <Button onClick={() => handleScheduleSelect('month')} variant="outline" className="w-full justify-start">
               <Calendar className="mr-2 h-4 w-4" />
                {t('quizCard.schedule.inAMonth')}
           </Button>
            <Button onClick={() => handleScheduleSelect('mastered')} variant="secondary" className="w-full justify-start">
               <Star className="mr-2 h-4 w-4" />
                {t('quizCard.schedule.mastered')}
           </Button>
        </div>
      </CardContent>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-4xl font-headline flex items-center justify-center gap-4">
          <span>{word.definition}</span>
          <WordAudioPlayer word={word.word} />
        </CardTitle>
      </CardHeader>
      
      {viewState === 'schedule' ? renderScheduleView() : renderQuestionView()}

    </Card>
  );
}
