
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Word } from "@/lib/data";
import Image from "next/image";
import { useLanguage } from "@/hooks/use-language";
import { db } from "@/lib/db";
import { z } from "zod";

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const updateWordSchema = z.object({
  word: z.string().min(1, "Word is required."),
  definition: z.string().min(1, "Definition is required."),
  unit: z.string().optional(),
  lesson: z.string().optional(),
});

export function EditWordForm({ word: initialWord }: { word: Word }) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  
  const userId = searchParams.get("userId");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const validatedFields = updateWordSchema.safeParse({
        word: formData.get("word"),
        definition: formData.get("definition"),
        unit: formData.get("unit"),
        lesson: formData.get("lesson"),
    });

    if (!validatedFields.success) {
      const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
      toast({
        title: t('toasts.error'),
        description: firstError || "Validation failed.",
        variant: "destructive",
      });
      setIsPending(false);
      return;
    }

    const { word, definition, unit, lesson } = validatedFields.data;
    const imageFile = formData.get("image") as File | null;

    try {
      let imageDataUri: string | undefined = undefined;
      if (imageFile && imageFile.size > 0) {
        imageDataUri = await toBase64(imageFile);
      }

      const wordFromDb = await db.words.get(initialWord.id);
      if (!wordFromDb) throw new Error("Word not found in database.");

      const updatedWord: Word = {
          ...wordFromDb,
          word,
          definition,
          unit: unit || "",
          lesson: lesson || "",
          imageUrl: imageDataUri || wordFromDb.imageUrl,
      };

      await db.words.put(updatedWord);

      toast({
        title: t('toasts.success'),
        description: t('toasts.updateWordSuccess'),
      });

      // Manually trigger a storage event to notify other components like the words page
      window.dispatchEvent(new Event('storage'));
      router.push(`/dashboard/words?userId=${userId}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ message: `Failed to update word: ${errorMessage}`, success: false });
    } finally {
      setIsPending(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="wordId" value={initialWord.id} />
      <input type="hidden" name="userId" value={userId || ''} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
            <Label htmlFor="unit">{t('addWord.form.unitLabel')}</Label>
            <Input id="unit" name="unit" defaultValue={initialWord.unit} placeholder={t('addWord.form.unitPlaceholder')} />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="lesson">{t('addWord.form.lessonLabel')}</Label>
            <Input id="lesson" name="lesson" defaultValue={initialWord.lesson} placeholder={t('addWord.form.lessonPlaceholder')} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="word">{t('addWord.form.wordLabel')}</Label>
        <Input id="word" name="word" defaultValue={initialWord.word} placeholder={t('addWord.form.wordPlaceholder')} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="definition">{t('addWord.form.definitionLabel')}</Label>
        <Textarea
          id="definition"
          name="definition"
          defaultValue={initialWord.definition}
          placeholder={t('addWord.form.definitionPlaceholder')}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image">{t('addWord.form.imageLabel')}</Label>
        <p className="text-sm text-muted-foreground">{t('editWord.form.currentImage')}</p>
        <Image src={initialWord.imageUrl} alt="Current image" width={100} height={100} className="rounded-md" />
        <Input id="image" name="image" type="file" accept="image/*" />
        <p className="text-xs text-muted-foreground">{t('editWord.form.imageHelper')}</p>
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('editWord.form.savingButton')}
          </>
        ) : (
          t('editWord.form.saveButton')
        )}
      </Button>
    </form>
  );
}
