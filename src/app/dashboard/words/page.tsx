
"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWordsBySupervisor, Word } from "@/lib/data";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function WordsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "sup1";
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    // This code now runs only on the client
    const initialWords = getWordsBySupervisor(userId);
    const storedWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');

    // Filter stored words by supervisorId and ensure they are parsed correctly
    const userAddedWords = storedWords
      .filter(w => w.supervisorId === userId)
      .map(w => ({...w, nextReview: new Date(w.nextReview)}));

    // Combine and remove duplicates, giving preference to user-added words
    const combined = [...initialWords, ...userAddedWords];
    const uniqueWords = Array.from(new Map(combined.map(item => [item['id'], item])).values());
    
    setWords(uniqueWords);
  }, [userId]);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Words</h1>
          <p className="text-muted-foreground">Manage your vocabulary list.</p>
        </div>
        <Button asChild>
            <Link href={`/dashboard/add-word?userId=${userId}`}>Add New Word</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vocabulary List</CardTitle>
          <CardDescription>
            A complete list of all words you have added.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  Image
                </TableHead>
                <TableHead>Word</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {words.map((word) => (
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
                  <TableCell className="font-medium">{word.word}</TableCell>
                  <TableCell>{word.definition}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                        </Button>
                         <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
