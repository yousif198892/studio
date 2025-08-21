

"use client"
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { type Word } from "@/lib/data";
import { getWordsBySupervisor, deleteWordDB } from "@/lib/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
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
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WordAudioPlayer } from "@/components/word-audio-player";

export default function WordsPage() {
  const { t, translateContent } = useLanguage();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "sup2";
  const [words, setWords] = useState<Word[]>([]);
  const { toast } = useToast();

  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const fetchWords = useCallback(async () => {
    const supervisorWords = await getWordsBySupervisor(userId);
    setWords(supervisorWords || []);
  }, [userId]);

  useEffect(() => {
    fetchWords();
    
    const handleStorageChange = (event: StorageEvent) => {
        // This is a simplified listener. A real-world app might need a more robust
        // way to sync state across tabs, like using BroadcastChannel.
        if (event.key === 'userWords' || event.key === 'users') {
            fetchWords();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, [fetchWords]);

  const uniqueUnits = useMemo(() => {
    if (!Array.isArray(words)) return [];
    const units = new Set(words.map((word) => word.unit).filter(Boolean));
    return Array.from(units);
  }, [words]);

  const lessonsForSelectedUnit = useMemo(() => {
    if (!Array.isArray(words) || !selectedUnit) return [];
    const lessons = new Set(
      words
        .filter((word) => word.unit === selectedUnit)
        .map((word) => word.lesson)
        .filter(Boolean)
    );
    return Array.from(lessons);
  }, [words, selectedUnit]);

  const filteredWords = useMemo(() => {
     if (!Array.isArray(words)) return [];
    return words.filter((word) => {
      const unitMatch = !selectedUnit || word.unit === selectedUnit;
      const lessonMatch = !selectedLesson || word.lesson === selectedLesson;
      return unitMatch && lessonMatch;
    });
  }, [words, selectedUnit, selectedLesson]);

  const handleUnitChange = (unit: string) => {
      setSelectedUnit(unit === "all" ? null : unit);
      setSelectedLesson(null); // Reset lesson when unit changes
  }

  const handleLessonChange = (lesson: string) => {
      setSelectedLesson(lesson === "all" ? null : lesson);
  }

  const clearFilters = () => {
      setSelectedUnit(null);
      setSelectedLesson(null);
  }

  const handleDeleteWord = async (wordId: string) => {
    try {
        await deleteWordDB(wordId);
        
        // Manually refetch for immediate update
        fetchWords(); 

        toast({
            title: t('toasts.success'),
            description: t('toasts.deleteWordSuccess'),
        });
    } catch (e) {
        toast({
            title: t('toasts.error'),
            description: "Could not delete the word.",
            variant: "destructive"
        });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">{t('wordsPage.title')}</h1>
          <p className="text-muted-foreground">{t('wordsPage.description')} </p>
        </div>
        <Button asChild>
            <Link href={`/dashboard/add-word?userId=${userId}`}>{t('wordsPage.addNew')}</Link>
        </Button>
      </div>
      <div className="flex items-center space-x-2">
            <Select onValueChange={handleUnitChange} value={selectedUnit || "all"}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {uniqueUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {translateContent(unit)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleLessonChange} value={selectedLesson || "all"} disabled={!selectedUnit}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Lesson" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lessons</SelectItem>
                {lessonsForSelectedUnit.map((lesson) => (
                  <SelectItem key={lesson} value={lesson}>
                    {translateContent(lesson)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(selectedUnit || selectedLesson) && <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>}
        </div>

      {filteredWords.length > 0 ? (
         <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">{t('wordsPage.table.image')}</TableHead>
                  <TableHead>{t('wordsPage.table.word')}</TableHead>
                  <TableHead>{t('wordsPage.table.unit')}</TableHead>
                  <TableHead className="text-right">{t('wordsPage.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWords.map((word) => (
                  <TableRow key={word.id}>
                    <TableCell>
                      <Image
                        src={word.imageUrl}
                        alt={word.word}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                          <span className="font-medium">{word.word}</span>
                          <WordAudioPlayer word={word.word} />
                      </div>
                      <div className="text-xs text-muted-foreground max-w-sm">{word.definition}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{translateContent(word.unit)}</div>
                      <div className="text-xs text-muted-foreground">{translateContent(word.lesson)}</div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button asChild variant="outline" size="icon">
                            <Link href={`/dashboard/edit-word/${word.id}?userId=${userId}`}>
                                <Edit className="h-4 w-4"/>
                                <span className="sr-only">Edit</span>
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4"/>
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
                                <AlertDialogAction onClick={() => handleDeleteWord(word.id)}>
                                    {t('wordsPage.deleteDialog.continue')}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
         </div>
      ) : (
        <div className="text-center text-muted-foreground py-12">
            <p>{selectedUnit || selectedLesson ? "No words found for the selected filters." : "You have not added any words yet."}</p>
        </div>
      )}
    </div>
  );
}
