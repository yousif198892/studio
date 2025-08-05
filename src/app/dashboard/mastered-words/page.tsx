
"use client"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { getWordsForStudent, Word, getUserById } from "@/lib/data";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Loader2, Volume2, RotateCcw } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { generateSpeech } from "@/ai/flows/text-to-speech-flow";
import { Badge } from "@/components/ui/badge";

export default function MasteredWordsPage() {
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
        const masteredWords = studentWords.filter(w => w.strength === -1);
        setWords(masteredWords);
      }
    }
  }, [userId]);
  
  const updateWordInStorage = (updatedWord: Word) => {
    try {
        const storageKey = `userWords_${userId}`;
        let allWords: Word[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const wordIndex = allWords.findIndex(w => w.id === updatedWord.id);
        
        if (wordIndex !== -1) {
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

  const handleRestore = (wordToRestore: Word) => {
    const updatedWord = {
        ...wordToRestore,
        strength: 0, // Back to the beginning of SRS
        nextReview: new Date(),
    };
    
    // Remove from this page's state
    setWords(words.filter(w => w.id !== wordToRestore.id));

    // Update in localStorage
    updateWordInStorage(updatedWord);

    toast({ title: t('toasts.success'), description: t('toasts.restoreWordSuccess', wordToRestore.word) });
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} />
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('masteredWordsPage.title')}</h1>
        <p className="text-muted-foreground">{t('masteredWordsPage.description')}</p>
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
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>{t('masteredWordsPage.restoreDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('masteredWordsPage.restoreDialog.description', word.word)}
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>{t('wordsPage.deleteDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRestore(word)}>{t('masteredWordsPage.restoreDialog.continue')}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        <p className="text-sm text-muted-foreground min-h-[40px]">{word.definition}</p>
                         <div className="flex justify-between items-center pt-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">{t('masteredWordsPage.badge')}</Badge>
                        </div>
                    </CardContent>
                </Card>
            )
          )}
      </div>
    </div>
  );
}
