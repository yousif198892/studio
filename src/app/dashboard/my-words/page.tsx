
"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWordsForStudent, Word, Unit, getUnitsBySupervisor, getUserById } from "@/lib/data";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, RotateCcw, Loader2, Volume2, Wind } from "lucide-react";
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateSpeech } from "@/ai/flows/text-to-speech-flow";

export default function MyWordsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "user1";
  const [words, setWords] = useState<Word[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
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
        const learnedWords = studentWords.filter(w => w.strength > 0);
        setWords(learnedWords);
        const supervisorUnits = getUnitsBySupervisor(student.supervisorId);
        setUnits(supervisorUnits);
      }
    }
  }, [userId]);

  const handlePlayAudio = async (word: string, speed: number) => {
    const audioKey = `${word}-${speed}`;
    if (loadingAudio === audioKey || currentlyPlaying === audioKey) return;

    setLoadingAudio(audioKey);
    try {
      const { audioDataUri } = await generateSpeech({ text: word, speed });
      
      if (audioRef.current) {
        audioRef.current.src = audioDataUri;
        audioRef.current.play();
        setCurrentlyPlaying(audioKey);
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
      const student = getUserById(userId);
      if (!student?.supervisorId) return;

      const allWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
      const supervisorId = student.supervisorId;
      const otherSupervisorWords = allWords.filter(w => w.supervisorId !== supervisorId);
      const supervisorWords = allWords.filter(w => w.supervisorId === supervisorId);
      
      const wordIndex = supervisorWords.findIndex(w => w.id === updatedWord.id);
      
      if (wordIndex > -1) {
        supervisorWords[wordIndex] = updatedWord;
      }
      
      localStorage.setItem('userWords', JSON.stringify([...otherSupervisorWords, ...supervisorWords]));

    } catch (e) {
      console.error("Failed to update word in localStorage", e);
    }
  };

  const handleReset = (wordToReset: Word) => {
    const updatedWord = {
        ...wordToReset,
        strength: 0,
        nextReview: new Date(),
    };

    // Remove from component state as it's no longer "learned"
    setWords(words.filter(w => w.id !== wordToReset.id));

    // Update in localStorage
    updateWordInStorage(updatedWord);

    toast({ title: t('toasts.success'), description: t('toasts.resetWordSuccess', wordToReset.word) });
  };


  const handleReschedule = (word: Word, days: number) => {
    const newNextReview = new Date();
    newNextReview.setDate(newNextReview.getDate() + days);

    const updatedWord: Word = { ...word, nextReview: newNextReview };

    const updatedWords = words.map(w => w.id === word.id ? updatedWord : w);
    setWords(updatedWords);

    updateWordInStorage(updatedWord);
    toast({ title: t('toasts.success'), description: t('toasts.rescheduleSuccess', word.word) });
  };
  
  const getUnitName = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.name : "N/A";
  }

  const reviewOptions = [
    { label: "Tomorrow", days: 1 },
    { label: "After 2 days", days: 2 },
    { label: "After 3 days", days: 3 },
    { label: "After a week", days: 7 },
    { label: "After 2 weeks", days: 14 },
    { label: "After a month", days: 30 },
  ];

  const getDaysUntilReview = (nextReviewDate: Date) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Normalize current date to midnight
      
      const reviewDate = new Date(nextReviewDate);
      reviewDate.setHours(0, 0, 0, 0); // Normalize review date to midnight
      
      const diffTime = reviewDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
  }

  return (
    <div className="space-y-6">
      <audio ref={audioRef} />
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('dashboard.student.learnedTitle')}</h1>
        <p className="text-muted-foreground">{t('wordsPage.myLearnedWordsDesc')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('wordsPage.table.title')}</CardTitle>
          <CardDescription>
            {t('dashboard.student.learnedDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  {t('wordsPage.table.image')}
                </TableHead>
                <TableHead>{t('wordsPage.table.word')}</TableHead>
                <TableHead>{t('wordsPage.table.definition')}</TableHead>
                <TableHead>{t('wordsPage.table.unit')}</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {words.map((word) => {
                const daysUntilReview = getDaysUntilReview(word.nextReview);
                return (
                  <TableRow key={word.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt="Word image"
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={word.imageUrl}
                        width="64"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{word.word}</span>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handlePlayAudio(word.word, 1.0)} 
                            disabled={!!loadingAudio}
                            aria-label="Play normal speed"
                          >
                            {loadingAudio === `${word.word}-1.0` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handlePlayAudio(word.word, 0.75)} 
                            disabled={!!loadingAudio}
                            aria-label="Play slow speed"
                          >
                            {loadingAudio === `${word.word}-0.75` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wind className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{word.definition}</TableCell>
                    <TableCell>{getUnitName(word.unitId)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Reschedule Review</DropdownMenuLabel>
                          {reviewOptions.map(opt => (
                              <DropdownMenuItem 
                                key={opt.days} 
                                onClick={() => handleReschedule(word, opt.days)}
                                className={cn({
                                    'text-destructive focus:bg-destructive/10 focus:text-destructive': daysUntilReview === opt.days
                                })}
                              >
                                  {opt.label}
                              </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                      <RotateCcw className="mr-2 h-4 w-4" />
                                      Reset Progress
                                  </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>{t('wordsPage.resetDialog.title')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      {t('wordsPage.resetDialog.description', word.word)}
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel>{t('wordsPage.deleteDialog.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleReset(word)}>{t('wordsPage.resetDialog.continue')}</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
