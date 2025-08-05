
"use client"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getWordsForStudent, Word, getUserById } from "@/lib/data";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, RotateCcw, Loader2, Volume2, Trophy } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateSpeech } from "@/ai/flows/text-to-speech-flow";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, differenceInHours, differenceInDays } from "date-fns";

export default function MyWordsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "user1";
  const [words, setWords] = useState<Word[]>([]);
  const { t } = useLanguage();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      const student = getUserById(userId);
      if (student?.supervisorId) {
        const studentWords = getWordsForStudent(userId);
        const learnedWords = studentWords.filter(w => w.strength >= 0); // Only show words in SRS
        setWords(learnedWords);
      }
    }
  }, [userId]);

  const handlePlayAudio = async (word: Word) => {
    const wordId = word.id;
    if (loadingAudio) return;

    setLoadingAudio(wordId);
    try {
      const { audioDataUri } = await generateSpeech({ text: word.word });
      
      if (audioRef.current) {
        audioRef.current.src = audioDataUri;
        audioRef.current.play();
        setCurrentlyPlaying(wordId);
        audioRef.current.onended = () => {
          setCurrentlyPlaying(null);
        };
      }
    } catch (error) {
      console.error("Failed to generate or play speech:", error);
      toast({
        title: t('toasts.error'),
        description: "Failed to generate audio for the word.",
        variant: "destructive",
      });
    } finally {
      setLoadingAudio(null);
    }
  };


  const updateWordInStorage = (updatedWord: Word) => {
    try {
        const storageKey = `userWords_${userId}`;
        let allWords: Word[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const wordIndex = allWords.findIndex(w => w.id === updatedWord.id);
        
        if (wordIndex > -1) {
            allWords[wordIndex] = updatedWord;
        } else {
           allWords.push(updatedWord);
        }

        const uniqueWords = Array.from(new Map(allWords.map(item => [item.id, item])).values());
        localStorage.setItem(storageKey, JSON.stringify(uniqueWords));

    } catch (e) {
        console.error("Failed to update word in localStorage", e);
        toast({ title: t('toasts.error'), description: 'Failed to save changes.' });
    }
  };

  const handleReset = (wordToReset: Word) => {
    const updatedWord = {
        ...wordToReset,
        strength: 0,
        nextReview: new Date(),
    };

    const updatedWords = words.map(w => w.id === wordToReset.id ? updatedWord : w);
    setWords(updatedWords);

    updateWordInStorage(updatedWord);

    toast({ title: t('toasts.success'), description: t('toasts.resetWordSuccess', wordToReset.word) });
  };


  const handleReschedule = (word: Word, options: { days?: number, minutes?: number }) => {
    const newNextReview = new Date();
    if (options.days) {
      newNextReview.setDate(newNextReview.getDate() + options.days);
    }
    if (options.minutes) {
        newNextReview.setMinutes(newNextReview.getMinutes() + options.minutes);
    }

    const updatedWord: Word = { ...word, nextReview: newNextReview };

    const updatedWords = words.map(w => w.id === word.id ? updatedWord : w);
    setWords(updatedWords);

    updateWordInStorage(updatedWord);
    toast({ title: t('toasts.success'), description: t('toasts.rescheduleSuccess', word.word) });
  };
  
  const handleWontForget = (wordToMaster: Word) => {
    const updatedWord = {
        ...wordToMaster,
        strength: -1, // Special value for mastered words
    };

    // Remove from this page's state
    setWords(words.filter(w => w.id !== wordToMaster.id));

    // Update in localStorage
    updateWordInStorage(updatedWord);

    toast({ title: t('toasts.success'), description: t('toasts.wontForgetText', wordToMaster.word) });
  }

  const reviewOptions = [
    { label: "In 5 minutes", minutes: 5 },
    { label: "Tomorrow", days: 1 },
    { label: "After 2 days", days: 2 },
    { label: "After 3 days", days: 3 },
    { label: "After a week", days: 7 },
    { label: "After 2 weeks", days: 14 },
    { label: "After a month", days: 30 },
  ];

  const getReviewText = (nextReviewDate: Date) => {
    const now = new Date();
    const reviewDate = new Date(nextReviewDate);

    if (reviewDate <= now) {
      return t('wordsPage.table.reviewOverdue');
    }

    const hoursLeft = differenceInHours(reviewDate, now);
    if (hoursLeft <= 0) { // Should be overdue but as a fallback
        return t('wordsPage.table.reviewOverdue');
    }
    if (hoursLeft < 24) {
        return `${hoursLeft}H left`;
    }

    const daysLeft = differenceInDays(reviewDate, now);
    return `${daysLeft}D left`;
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} />
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('wordsPage.title')}</h1>
        <p className="text-muted-foreground">{t('wordsPage.myLearnedWordsDesc')}</p>
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {words.map((word) => (
                <Card key={word.id} className="flex flex-col shadow-md transition-all duration-300 ease-in-out hover:shadow-xl">
                    <CardHeader className="p-0">
                        <div className="aspect-video relative bg-muted rounded-t-lg">
                            <Image
                                src={word.imageUrl}
                                alt={`Image for ${word.word}`}
                                fill
                                className="object-contain rounded-t-lg p-2"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold font-headline">{word.word}</h3>
                                 <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handlePlayAudio(word)} 
                                disabled={!!loadingAudio}
                                aria-label="Play audio"
                                className="h-6 w-6"
                                >
                                {loadingAudio === word.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleReset(word)}>
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            <span>Reset Progress</span>
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                                    <Trophy className="mr-2 h-4 w-4" />
                                                    <span>{t('wordsPage.wontForgetButton')}</span>
                                                </div>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>{t('wordsPage.wontForgetDialog.title')}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t('wordsPage.wontForgetDialog.description', word.word)}
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>{t('wordsPage.deleteDialog.cancel')}</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleWontForget(word)}>{t('wordsPage.wontForgetDialog.continue')}</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel>Review Later</DropdownMenuLabel>
                                        {reviewOptions.map(opt => (
                                            <DropdownMenuItem key={opt.label} onClick={() => handleReschedule(word, { days: opt.days, minutes: opt.minutes })}>
                                                <span>{opt.label}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenuPortal>
                            </DropdownMenu>
                        </div>
                        <p className="text-sm text-muted-foreground min-h-[40px]">{word.definition}</p>
                         <div className="flex justify-between items-center pt-2">
                            <Badge variant="secondary">{`Strength: ${word.strength}`}</Badge>
                            <span className="text-xs text-muted-foreground">{getReviewText(word.nextReview)}</span>
                        </div>
                    </CardContent>
                </Card>
            )
          )}
      </div>
    </div>
  );
}
