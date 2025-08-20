

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
import { WordProgress } from "@/lib/storage";
import { useLanguage } from "@/hooks/use-language";

type MasteredWord = Word & WordProgress;

export default function MasteredWordsPage() {
  const searchParams = useSearchParams();
  const [allMasteredWords, setAllMasteredWords] = useState<MasteredWord[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const userId = searchParams.get("userId");
  const { t, translateContent } = useLanguage();
  
  const fetchWords = useCallback(async () => {
    if (userId) {
      setLoading(true);
      const allWords = await getWordsForStudent(userId);
      const mastered = allWords.filter((w) => w.strength === -1);
      setAllMasteredWords(mastered || []);
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWords();
     const handleStorageChange = () => fetchWords();
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchWords]);

  const uniqueUnits = useMemo(() => {
    const units = new Set(allMasteredWords.map((word) => word.unit).filter(Boolean));
    return Array.from(units);
  }, [allMasteredWords]);

  const lessonsForSelectedUnit = useMemo(() => {
    if (!selectedUnit) return [];
    const lessons = new Set(
      allMasteredWords
        .filter((word) => word.unit === selectedUnit)
        .map((word) => word.lesson)
        .filter(Boolean)
    );
    return Array.from(lessons);
  }, [allMasteredWords, selectedUnit]);

  const filteredWords = useMemo(() => {
    return allMasteredWords.filter((word) => {
      const unitMatch = !selectedUnit || word.unit === selectedUnit;
      const lessonMatch = !selectedLesson || word.lesson === selectedLesson;
      return unitMatch && lessonMatch;
    });
  }, [allMasteredWords, selectedUnit, selectedLesson]);

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
    return <div>{t('masteredWordsPage.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{t('masteredWordsPage.title')}</h1>
      <p className="text-muted-foreground">
        {t('masteredWordsPage.description')}
      </p>
      <Card>
        <CardHeader>
          <CardTitle>{t('masteredWordsPage.cardTitle')}</CardTitle>
          <CardDescription>
            {t('masteredWordsPage.cardDescription')}
          </CardDescription>
           <div className="flex items-center space-x-2 pt-4">
            <Select onValueChange={handleUnitChange} value={selectedUnit || "all"}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('masteredWordsPage.filterUnit')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('masteredWordsPage.allUnits')}</SelectItem>
                {uniqueUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {translateContent(unit)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleLessonChange} value={selectedLesson || "all"} disabled={!selectedUnit}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('masteredWordsPage.filterLesson')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('masteredWordsPage.allLessons')}</SelectItem>
                {lessonsForSelectedUnit.map((lesson) => (
                  <SelectItem key={lesson} value={lesson}>
                    {translateContent(lesson)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
             {(selectedUnit || selectedLesson) && <Button variant="ghost" onClick={clearFilters}>{t('masteredWordsPage.clearFilters')}</Button>}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">{t('masteredWordsPage.tableImage')}</TableHead>
                <TableHead>{t('masteredWordsPage.tableWord')}</TableHead>
                <TableHead>{t('masteredWordsPage.tableUnit')}</TableHead>
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    {t('masteredWordsPage.noWords')}
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
