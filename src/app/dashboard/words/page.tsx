
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
    const combined = [...userAddedWords, ...initialWords];
    const uniqueWords = Array.from(new Map(combined.map(item => [item['id'], item])).values());
    
    setWords(uniqueWords);
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
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/dashboard/edit-word/${word.id}?userId=${userId}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the word
                                "{word.word}" from your list.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(word.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
