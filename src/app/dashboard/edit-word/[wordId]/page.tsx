
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
    // This now runs only on the client, preventing hydration errors
    if (wordId) {
      const allWords = getWordsBySupervisor(userId);
      const foundWord = allWords.find(w => w.id === wordId);
      setWord(foundWord || null);
      setLoading(false);
    }
  }, [wordId, userId]);

  if (loading) {
    return <div>جار التحميل...</div>;
  }

  if (!word) {
    return <div>لم يتم العثور على الكلمة.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">تعديل الكلمة</h1>
      <p className="text-muted-foreground">
        قم بتحديث تفاصيل بطاقة المفردات الخاصة بك.
      </p>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>تعديل: {word.word}</CardTitle>
          <CardDescription>
            قم بتعديل الحقول أدناه واحفظ تغييراتك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditWordForm word={word} />
        </CardContent>
      </Card>
    </div>
  );
}
