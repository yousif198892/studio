
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
import { useLanguage } from "@/hooks/use-language";

export default function EditWordPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const wordId = params.wordId as string;
  const userId = searchParams.get('userId') || 'sup1';
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wordId) {
      const allWords = getWordsBySupervisor(userId);
      const foundWord = allWords.find(w => w.id === wordId);
      setWord(foundWord || null);
      setLoading(false);
    }
  }, [wordId, userId]);

  if (loading) {
    return <div>{t('dashboard.loading')}</div>;
  }

  if (!word) {
    return <div>Word not found.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{t('editWord.title')}</h1>
      <p className="text-muted-foreground">
        {t('editWord.description')}
      </p>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t('editWord.cardTitle', word.word)}</CardTitle>
          <CardDescription>
            {t('editWord.cardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditWordForm word={word} />
        </CardContent>
      </Card>
    </div>
  );
}
