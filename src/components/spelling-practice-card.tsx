
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Word } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Image from "next/image";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { updateStudentProgressInStorage } from "@/lib/storage";

interface SpellingPracticeCardProps {
  allWords: Word[];
  userId: string;
}

type FeedbackState = "idle" | "correct" | "incorrect";

export function SpellingPracticeCard({ allWords, userId }: SpellingPracticeCardProps) {
  const [learningWords, setLearningWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const { toast } = useToast();

  useEffect(() => {
    const words = allWords.filter((w) => w.strength >= 0);
    setLearningWords(words);
  }, [allWords]);

  const selectNewWord = useCallback(() => {
    if (learningWords.length === 0) {
      setCurrentWord(null);
      return;
    }
    const randomIndex = Math.floor(Math.random() * learningWords.length);
    setCurrentWord(learningWords[randomIndex]);
    setAnswer("");
    setFeedback("idle");
  }, [learningWords]);

  useEffect(() => {
    selectNewWord();
  }, [selectNewWord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord || !answer.trim()) return;

    if (answer.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setFeedback("correct");
      // Give a small boost to SRS strength for correct spelling
      const newStrength = (currentWord.strength || 0) + 0.5;
       updateStudentProgressInStorage(userId, currentWord.id, {
         strength: newStrength,
         nextReview: new Date(currentWord.nextReview || Date.now()),
       });
      setTimeout(() => {
        selectNewWord();
      }, 1500);
    } else {
      setFeedback("incorrect");
      // Show correct answer
       setTimeout(() => {
         setAnswer(currentWord.word);
         setTimeout(() => {
            selectNewWord();
         }, 2000);
       }, 1000);
    }
  };

  const getInputColor = () => {
    if (feedback === "correct") return "border-green-500 focus-visible:ring-green-500";
    if (feedback === "incorrect") return "border-destructive focus-visible:ring-destructive";
    return "";
  };

  if (learningWords.length === 0) {
    return null; // Don't show the card if there are no words to practice
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Spelling Practice</span>
          <Button variant="ghost" size="icon" onClick={selectNewWord}>
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">New Word</span>
          </Button>
        </CardTitle>
        <CardDescription>
          Type the word that matches the definition and image below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentWord ? (
          <>
            <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-secondary rounded-lg">
              <Image
                src={currentWord.imageUrl}
                alt={currentWord.word}
                width={100}
                height={100}
                className="rounded-md object-cover"
              />
              <p className="text-center md:text-left flex-1">{currentWord.definition}</p>
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Type the word..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className={cn("pr-8", getInputColor())}
                  readOnly={feedback !== 'idle'}
                />
                {feedback === "correct" && <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500"/>}
                {feedback === "incorrect" && <XCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive"/>}
              </div>
              <Button type="submit" disabled={feedback !== 'idle'}>Check</Button>
            </form>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>You have no words in your learning queue to practice.</p>
            <p>Start a review session to add some!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    