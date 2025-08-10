
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
import { add } from "date-fns";

interface SpellingPracticeCardProps {
  allWords: Word[];
  userId: string;
}

type FeedbackState = "idle" | "correct" | "incorrect";

export function SpellingPracticeCard({ allWords, userId }: SpellingPracticeCardProps) {
  const [practiceWords, setPracticeWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const { toast } = useToast();

  useEffect(() => {
    // Only include words that have been reviewed at least once (strength > 0)
    const words = allWords.filter((w) => w.strength && w.strength > 0);
    setPracticeWords(words);
  }, [allWords]);

  const selectNewWord = useCallback(() => {
    if (practiceWords.length === 0) {
      setCurrentWord(null);
      return;
    }
    const randomIndex = Math.floor(Math.random() * practiceWords.length);
    setCurrentWord(practiceWords[randomIndex]);
    setAnswer("");
    setFeedback("idle");
  }, [practiceWords]);

  useEffect(() => {
    // Select a word when the component loads or when the list of practice words changes
    if (practiceWords.length > 0) {
        selectNewWord();
    } else {
        setCurrentWord(null);
    }
  }, [practiceWords, selectNewWord]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord || !answer.trim() || feedback !== 'idle') return;

    if (answer.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setFeedback("correct");
      // Schedule for 2 days later
      const nextReview = add(new Date(), { days: 2 });
       updateStudentProgressInStorage(userId, currentWord.id, {
         strength: currentWord.strength || 1, // Keep strength, but ensure it's at least 1
         nextReview: nextReview,
       });
       toast({
         title: "Correct!",
         description: `Next review for "${currentWord.word}" is in 2 days.`,
       })
      setTimeout(() => {
        selectNewWord();
      }, 1500);
    } else {
      setFeedback("incorrect");
      // Schedule for tomorrow
       const nextReview = add(new Date(), { days: 1 });
       updateStudentProgressInStorage(userId, currentWord.id, {
         strength: Math.max(0, (currentWord.strength || 1) - 1), // Decrease strength on incorrect
         nextReview: nextReview,
       });
       toast({
        title: "Incorrect",
        description: `"${currentWord.word}" will be reviewed again tomorrow.`,
        variant: "destructive"
       });
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

  if (practiceWords.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Spelling Practice</CardTitle>
                <CardDescription>
                Type the word that matches the definition and image below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="text-center text-muted-foreground py-8">
                    <p>You have no reviewed words to practice spelling for yet.</p>
                    <p>Complete a review session to get started!</p>
                </div>
            </CardContent>
        </Card>
    );
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
            <p>Loading spelling practice...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
