
"use client";

import { getAiWordOptions } from "@/lib/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type Word } from "@/lib/data";
import { getWordsBySupervisor, addWordDB } from "@/lib/firestore";
import { useLanguage } from "@/hooks/use-language";

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export function AddWordForm() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  
  const userId = searchParams.get("userId") || "sup1";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const wordInput = formData.get("word") as string;
    const definitionInput = formData.get("definition") as string;
    const imageInput = formData.get("image") as File;
    const unitInput = formData.get("unit") as string;
    const lessonInput = formData.get("lesson") as string;

    // --- Client-side validation ---
    if (!wordInput || !definitionInput || !imageInput || imageInput.size === 0) {
        toast({
            title: t('toasts.error'),
            description: "Please fill out all required fields (Word, Definition, Image).",
            variant: "destructive",
        });
        setIsPending(false);
        return;
    }

    try {
        const supervisorWords = await getWordsBySupervisor(userId);
        if (supervisorWords.some(w => w.word.toLowerCase() === wordInput.toLowerCase())) {
            toast({
                title: t('toasts.error'),
                description: "This word already exists in your collection.",
                variant: "destructive",
            });
            setIsPending(false);
            return;
        }

        const imageDataUri = await toBase64(imageInput);

        // --- Server action call for AI part only ---
        const result = await getAiWordOptions({
            word: wordInput,
            definition: definitionInput,
            imageDataUri: imageDataUri
        });

        if (result.success && result.options) {
            // Assemble the full word object on the client
            const newWord: Word = {
                id: `word${Date.now()}`,
                word: wordInput,
                definition: definitionInput,
                unit: unitInput,
                lesson: lessonInput,
                imageUrl: imageDataUri,
                options: [...result.options, wordInput], // AI options + correct option
                correctOption: wordInput,
                supervisorId: userId,
            };

            // Save to Firestore
            await addWordDB(newWord);
            
            toast({
                title: t('toasts.success'),
                description: t('toasts.addWordSuccess'),
            });
            
            formRef.current?.reset();
            router.push(`/dashboard/words?userId=${userId}`);
            router.refresh(); // Force a refresh to show the new word

        } else {
            const errorMessage = result.message || "An unknown error occurred.";
            toast({
                title: t('toasts.error'),
                description: errorMessage,
                variant: "destructive",
            });
        }
    } catch (e: any) {
         console.error("An unexpected error occurred:", e);
         toast({
            title: t('toasts.error'),
            description: e.message || "An unexpected error occurred. Please check the console.",
            variant: "destructive",
         });
    } finally {
        setIsPending(false);
    }
  };

  return (
    <form 
      ref={formRef} 
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
            <Label htmlFor="unit">{t('addWord.form.unitLabel')}</Label>
            <Input id="unit" name="unit" placeholder={t('addWord.form.unitPlaceholder')} />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="lesson">{t('addWord.form.lessonLabel')}</Label>
            <Input id="lesson" name="lesson" placeholder={t('addWord.form.lessonPlaceholder')} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="word">{t('addWord.form.wordLabel')}</Label>
        <Input id="word" name="word" placeholder={t('addWord.form.wordPlaceholder')} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="definition">{t('addWord.form.definitionLabel')}</Label>
        <Textarea
          id="definition"
          name="definition"
          placeholder={t('addWord.form.definitionPlaceholder')}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image">{t('addWord.form.imageLabel')}</Label>
        <Input id="image" name="image" type="file" accept="image/*" required />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
            <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('addWord.form.addingButton')}
            </>
        ) : (
            t('addWord.form.addButton')
        )}
        </Button>
    </form>
  );
}
