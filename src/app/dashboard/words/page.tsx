
"use client"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getWordsBySupervisor, Word } from "@/lib/data";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2, Volume2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
} from "@/components/ui/alert-dialog"
import { useLanguage } from "@/hooks/use-language";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { generateSpeech } from "@/ai/flows/text-to-speech-flow";
import { useToast } from "@/hooks/use-toast";

export default function WordsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "sup1";
  const [words, setWords] = useState<Word[]>([]);
  const { t } = useLanguage();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);

  useEffect(() => {
    const supervisorWords = getWordsBySupervisor(userId);
    setWords(supervisorWords);
  }, [userId]);

  const handleDelete = (wordId: string) => {
    // Remove from component state
    const updatedWords = words.filter(w => w.id !== wordId);
    setWords(updatedWords);

    // Remove from localStorage
    const storedWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
    const updatedStoredWords = storedWords.filter(w => w.id !== wordId);
    localStorage.setItem('userWords', JSON.stringify(updatedStoredWords));
  }
  
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


  return (
    <div className="space-y-6">
      <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">{t('wordsPage.title')}</h1>
          <p className="text-muted-foreground">{t('wordsPage.description')} </p>
        </div>
        <Button asChild>
            <Link href={`/dashboard/add-word?userId=${userId}`}>{t('wordsPage.addNew')}</Link>
        </Button>
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
                <p className="text-sm text-muted-foreground mt-1 min-h-[40px]">{word.definition}</p>
                <div className="flex gap-2 pt-2">
                    {word.unit && <Badge variant="outline">{t('addWord.form.unitLabel')}: {word.unit}</Badge>}
                    {word.lesson && <Badge variant="outline">{t('addWord.form.lessonLabel')}: {word.lesson}</Badge>}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                <Button variant="outline" size="icon" asChild>
                  <Link href={`/dashboard/edit-word/${word.id}?userId=${userId}`}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('wordsPage.deleteDialog.title')}</AlertDialogTitle>
                      <AlertDialogDescription>
                       {t('wordsPage.deleteDialog.description', word.word)}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('wordsPage.deleteDialog.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(word.id)}>{t('wordsPage.deleteDialog.continue')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}
