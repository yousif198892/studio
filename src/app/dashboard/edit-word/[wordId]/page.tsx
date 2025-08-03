
"use client";
import { EditWordForm } from "@/components/edit-word-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWordsBySupervisor, Word, mockWords } from "@/lib/data";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditWordPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const wordId = params.wordId as string;
  const userId = searchParams.get('userId') || 'sup1';
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wordId) {
      // Combine initial mock words and words from local storage
      const initialWords = getWordsBySupervisor(userId);
      const storedWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
      const userAddedWords = storedWords
        .filter(w => w.supervisorId === userId)
        .map(w => ({ ...w, nextReview: new Date(w.nextReview) }));
      const allWords = Array.from(new Map([...initialWords, ...userAddedWords].map(item => [item['id'], item])).values());
      
      const foundWord = allWords.find(w => w.id === wordId);
      setWord(foundWord || null);
      setLoading(false);
    }
  }, [wordId, userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!word) {
    return <div>Word not found.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Edit Word</h1>
      <p className="text-muted-foreground">
        Update the details for your vocabulary card.
      </p>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Editing: {word.word}</CardTitle>
          <CardDescription>
            Modify the fields below and save your changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditWordForm word={word} />
        </CardContent>
      </Card>
    </div>
  );
}
