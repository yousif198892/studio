
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

export default function MasteredWordsPage() {
  const searchParams = useSearchParams();
  const [masteredWords, setMasteredWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId) {
      const allWords = getWordsForStudent(userId);
      const mastered = allWords.filter((w) => w.strength === -1);
      setMasteredWords(mastered);
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return <div>Loading mastered words...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Mastered Words</h1>
      <p className="text-muted-foreground">
        Congratulations! Here are all the words you've successfully learned.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Your Word Collection</CardTitle>
          <CardDescription>
            A list of all the words you have mastered.
          </CardDescription>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {masteredWords.length > 0 ? (
                masteredWords.map((word) => (
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
                    <TableCell>{word.unit}</TableCell>
                    <TableCell>{word.lesson}</TableCell>
                    <TableCell className="max-w-sm">
                      {word.definition}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    You haven't mastered any words yet. Keep learning!
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
