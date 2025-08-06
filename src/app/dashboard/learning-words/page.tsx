
"use client";

import { useEffect, useState } from "react";
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

export default function LearningWordsPage() {
  const searchParams = useSearchParams();
  const [learningWords, setLearningWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId) {
      const allWords = getWordsForStudent(userId);
      const learning = allWords.filter((w) => w.strength >= 0);
      setLearningWords(learning);
      setLoading(false);
    }
  }, [searchParams]);

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
            A list of all the words you are currently learning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Word</TableHead>
                <TableHead>Definition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {learningWords.length > 0 ? (
                learningWords.map((word) => (
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
                    <TableCell className="font-medium">{word.word}</TableCell>
                    <TableCell className="max-w-sm">
                      {word.definition}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    You have no words in your learning queue. Add some!
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
