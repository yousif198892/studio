
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getWordsForStudent } from "@/lib/firestore";
import { type Word } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { WordAudioPlayer } from "@/components/word-audio-player";
import { RescheduleWordDialog } from "@/components/reschedule-word-dialog";
import { formatDistanceToNowStrict, isPast, differenceInHours } from "date-fns";
import { ar } from "date-fns/locale";
import { WordProgress } from "@/lib/storage";
import { useLanguage } from "@/hooks/use-language";

type LearningWord = Word & WordProgress;

export default function LearningWordsPage() {
  const searchParams = useSearchParams();
  const [allLearningWords, setAllLearningWords] = useState<LearningWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setNow] = useState(new Date()); // Used to trigger re-renders for time updates

  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const userId = searchParams.get("userId");
  const { t, language, translateContent } = useLanguage();

  const fetchWords = useCallback(async () => {
    if (userId) {
      const allWords = await getWordsForStudent(userId);
      const learning = allWords.filter((w) => w.strength >= 0);
      setAllLearningWords(learning || []);
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWords();
     // Set up an interval to update the "time left" every minute
    const interval = setInterval(() => setNow(new Date()), 60000);
    
    // Also add a listener for when progress changes in another tab
    const handleStorageChange = () => fetchWords();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchWords]);

  const handleWordRescheduled = useCallback(() => {
    // Re-fetch the words to update the list after rescheduling
    fetchWords();
  }, [fetchWords]);

  const uniqueUnits = useMemo(() => {
    const units = new Set(allLearningWords.map((word) => word.unit).filter(Boolean));
    return Array.from(units);
  }, [allLearningWords]);

  const lessonsForSelectedUnit = useMemo(() => {
    if (!selectedUnit) return [];
    const lessons = new Set(
      allLearningWords
        .filter((word) => word.unit === selectedUnit)
        .map((word) => word.lesson)
        .filter(Boolean)
    );
    return Array.from(lessons);
  }, [allLearningWords, selectedUnit]);

  const filteredWords = useMemo(() => {
    return allLearningWords.filter((word) => {
      const unitMatch = !selectedUnit || word.unit === selectedUnit;
      const lessonMatch = !selectedLesson || word.lesson === selectedLesson;
      return unitMatch && lessonMatch;
    }).sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
  }, [allLearningWords, selectedUnit, selectedLesson]);
  
  const formatTimeLeft = (date: Date) => {
    const locale = language === 'ar' ? { locale: ar } : {};
    if (isPast(date)) {
        return <span className="text-destructive font-semibold">{t('learningWordsPage.dueNow')}</span>;
    }
    const totalHours = differenceInHours(date, new Date());
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days > 0) {
        return t('learningWordsPage.timeLeft', `${days}${t('learningWordsPage.days')} ${hours}${t('learningWordsPage.hours')}`);
    }
    if (totalHours > 0) {
        return t('learningWordsPage.timeLeft', `${hours}${t('learningWordsPage.hours')}`);
    }
    return formatDistanceToNowStrict(date, { addSuffix: true, ...locale });
  }

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

  if (loading) {
    return <div>{t('learningWordsPage.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{t('learningWordsPage.title')}</h1>
      <p className="text-muted-foreground">
        {t('learningWordsPage.description')}
      </p>
      <Card>
        <CardHeader>
          <CardTitle>{t('learningWordsPage.cardTitle')}</CardTitle>
          <CardDescription>
            {t('learningWordsPage.cardDescription')}
          </CardDescription>
          <div className="flex items-center space-x-2 pt-4">
            <Select onValueChange={handleUnitChange} value={selectedUnit || "all"}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('learningWordsPage.filterUnit')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('learningWordsPage.allUnits')}</SelectItem>
                {uniqueUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {translateContent(unit)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleLessonChange} value={selectedLesson || "all"} disabled={!selectedUnit}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('learningWordsPage.filterLesson')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('learningWordsPage.allLessons')}</SelectItem>
                {lessonsForSelectedUnit.map((lesson) => (
                  <SelectItem key={lesson} value={lesson}>
                    {translateContent(lesson)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
             {(selectedUnit || selectedLesson) && <Button variant="ghost" onClick={clearFilters}>{t('learningWordsPage.clearFilters')}</Button>}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">{t('learningWordsPage.tableImage')}</TableHead>
                <TableHead>{t('learningWordsPage.tableWord')}</TableHead>
                <TableHead>{t('learningWordsPage.tableUnit')}</TableHead>
                <TableHead>{t('learningWordsPage.tableNextReview')}</TableHead>
                <TableHead className="text-right">{t('learningWordsPage.tableActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWords.length > 0 ? (
                filteredWords.map((word) => (
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
                    <TableCell>
                        <div className="text-sm">{formatTimeLeft(new Date(word.nextReview))}</div>
                    </TableCell>
                     <TableCell className="text-right">
                       {userId && (
                          <RescheduleWordDialog 
                            word={word} 
                            userId={userId} 
                            onWordRescheduled={handleWordRescheduled}
                          />
                       )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {t('learningWordsPage.noWords')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
