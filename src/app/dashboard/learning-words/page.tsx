
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getWordsForStudent, Word } from "@/lib/data";
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

export default function LearningWordsPage() {
  const searchParams = useSearchParams();
  const [allLearningWords, setAllLearningWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const userId = searchParams.get("userId");

  const fetchWords = useCallback(() => {
    if (userId) {
      const allWords = getWordsForStudent(userId);
      const learning = allWords.filter((w) => w.strength >= 0);
      setAllLearningWords(learning);
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const handleWordRescheduled = () => {
    // Re-fetch the words to update the list after rescheduling
    fetchWords();
  }

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
    });
  }, [allLearningWords, selectedUnit, selectedLesson]);
  
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
    return <div>Loading your words...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Words in Learning</h1>
      <p className="text-muted-foreground">
        This is your active queue. Keep reviewing these words to master them!
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Queue</CardTitle>
          <CardDescription>
            A list of all the words you are currently learning. Filter by unit
            and lesson below.
          </CardDescription>
          <div className="flex items-center space-x-2 pt-4">
            <Select onValueChange={handleUnitChange} value={selectedUnit || "all"}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {uniqueUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
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
                    {lesson}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
             {(selectedUnit || selectedLesson) && <Button variant="ghost" onClick={clearFilters}>Clear</Button>}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Word</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Lesson</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            <span>{word.word}</span>
                            <WordAudioPlayer word={word.word} />
                        </div>
                    </TableCell>
                    <TableCell>{word.unit}</TableCell>
                    <TableCell>{word.lesson}</TableCell>
                    <TableCell className="max-w-sm">
                      {word.definition}
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
                  <TableCell colSpan={6} className="h-24 text-center">
                    No words found for the selected filters.
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
