
"use client";

import { addWord } from "@/lib/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Word, getWordsBySupervisor } from "@/lib/data";
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
  const [errors, setErrors] = useState<any>({});
  
  const userId = searchParams.get("userId") || "sup1";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const wordInput = formData.get("word") as string;
    const definitionInput = formData.get("definition") as string;
    const imageInput = formData.get("image") as File;
    const unitInput = formData.get("unit") as string;
    const lessonInput = formData.get("lesson") as string;

    // --- Client-side validation ---
    if (!wordInput) {
        setErrors({ word: ["Word is required."] });
        setIsPending(false);
        return;
    }
    if (getWordsBySupervisor(userId).some(w => w.word.toLowerCase() === wordInput.toLowerCase())) {
        toast({
            title: t('toasts.error'),
            description: "This word already exists in your collection.",
            variant: "destructive",
        });
        setIsPending(false);
        return;
    }
    if (!definitionInput) {
        setErrors({ definition: ["Definition is required."] });
        setIsPending(false);
        return;
    }
    if (!imageInput || imageInput.size === 0) {
        setErrors({ image: ["Image is required."] });
        setIsPending(false);
        return;
    }
    
    // --- Server action call ---
    const result = await addWord(formData);

    if (result.success && result.options && result.correctOption) {
        try {
            const imageDataUri = await toBase64(imageInput);

            const newWord: Word = {
                id: `word${Date.now()}`,
                word: wordInput,
                definition: definitionInput,
                unit: unitInput,
                lesson: lessonInput,
                imageUrl: imageDataUri,
                options: [...result.options, result.correctOption], // Combine incorrect and correct options
                correctOption: result.correctOption,
                supervisorId: userId,
                nextReview: new Date(),
                strength: 0,
            };

            const wordsFromStorage: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
            const updatedWords = [...wordsFromStorage, newWord];
            localStorage.setItem('userWords', JSON.stringify(updatedWords));
            
            toast({
                title: t('toasts.success'),
                description: t('toasts.addWordSuccess'),
            });
            
            formRef.current?.reset();
            router.push(`/dashboard/words?userId=${userId}`);

        } catch (e) {
             console.error("Could not save to localStorage or process image", e);
             toast({
                title: t('toasts.error'),
                description: "Failed to save the new word locally.",
                variant: "destructive",
             });
        }
    } else {
        const errorMessage = result.message || "An unknown error occurred.";
        setErrors(result.errors || {});
        toast({
            title: t('toasts.error'),
            description: errorMessage,
            variant: "destructive",
        });
    }

    setIsPending(false);
  };

  return (
    <form 
      ref={formRef} 
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input type="hidden" name="userId" value={userId || ''} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
            <Label htmlFor="unit">{t('addWord.form.unitLabel')}</Label>
            <Input id="unit" name="unit" placeholder={t('addWord.form.unitPlaceholder')} />
            {errors?.unit && (
            <p className="text-sm text-destructive">{errors.unit[0]}</p>
            )}
        </div>
        <div className="grid gap-2">
            <Label htmlFor="lesson">{t('addWord.form.lessonLabel')}</Label>
            <Input id="lesson" name="lesson" placeholder={t('addWord.form.lessonPlaceholder')} />
            {errors?.lesson && (
            <p className="text-sm text-destructive">{errors.lesson[0]}</p>
            )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="word">{t('addWord.form.wordLabel')}</Label>
        <Input id="word" name="word" placeholder={t('addWord.form.wordPlaceholder')} />
        {errors?.word && (
          <p className="text-sm text-destructive">{errors.word[0]}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="definition">{t('addWord.form.definitionLabel')}</Label>
        <Textarea
          id="definition"
          name="definition"
          placeholder={t('addWord.form.definitionPlaceholder')}
        />
        {errors?.definition && (
          <p className="text-sm text-destructive">{errors.definition[0]}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image">{t('addWord.form.imageLabel')}</Label>
        <Input id="image" name="image" type="file" accept="image/*" />
         {errors?.image && (
          <p className="text-sm text-destructive">{errors.image[0]}</p>
        )}
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
