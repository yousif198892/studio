
"use client";

import { useFormStatus } from "react-dom";
import { addWord } from "@/lib/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useActionState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Word, getWordsBySupervisor } from "@/lib/data";
import { useLanguage } from "@/hooks/use-language";

const initialState: {
  message: string,
  errors?: any,
  success: boolean,
  newWord?: Word,
} = {
  message: "",
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('addWord.form.addingButton')}
        </>
      ) : (
        t('addWord.form.addButton')
      )}
    </Button>
  );
}

export function AddWordForm() {
  const [state, formAction] = useActionState(addWord, initialState);
  const { toast } = useToast();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  
  const userId = searchParams.get("userId") || "sup1";

  const handleFormAction = (formData: FormData) => {
    const wordInput = formData.get("word") as string;
    if (wordInput) {
        const existingWords = getWordsBySupervisor(userId);
        if (existingWords.some(w => w.word.toLowerCase() === wordInput.toLowerCase())) {
            toast({
                title: t('toasts.error'),
                description: "This word already exists in your collection.",
                variant: "destructive",
            });
            return;
        }
    }
    formAction(formData);
  }

  useEffect(() => {
    if (state.success && state.newWord) {
      toast({
        title: t('toasts.success'),
        description: t('toasts.addWordSuccess'),
      });

      // Save to localStorage
      try {
        const wordsFromStorage: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
        const newWord: Word = {
          ...state.newWord,
          nextReview: new Date(state.newWord.nextReview)
        };
        const updatedWords = [...wordsFromStorage, newWord];
        localStorage.setItem('userWords', JSON.stringify(updatedWords));
      } catch (e) {
        console.error("Could not save to localStorage", e);
      }

      formRef.current?.reset();
      router.push(`/dashboard/words?userId=${userId}`);
    } else if (state.message && !state.success) {
      const errorMessage = 
        state.errors?.word?.[0] ||
        state.errors?.definition?.[0] ||
        state.errors?.image?.[0] ||
        state.message;

      toast({
        title: t('toasts.error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [state, toast, router, userId, t]);

  return (
    <form ref={formRef} action={handleFormAction} className="space-y-4">
      <input type="hidden" name="userId" value={userId || ''} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
            <Label htmlFor="unit">{t('addWord.form.unitLabel')}</Label>
            <Input id="unit" name="unit" placeholder={t('addWord.form.unitPlaceholder')} />
            {state?.errors?.unit && (
            <p className="text-sm text-destructive">{state.errors.unit[0]}</p>
            )}
        </div>
        <div className="grid gap-2">
            <Label htmlFor="lesson">{t('addWord.form.lessonLabel')}</Label>
            <Input id="lesson" name="lesson" placeholder={t('addWord.form.lessonPlaceholder')} />
            {state?.errors?.lesson && (
            <p className="text-sm text-destructive">{state.errors.lesson[0]}</p>
            )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="word">{t('addWord.form.wordLabel')}</Label>
        <Input id="word" name="word" placeholder={t('addWord.form.wordPlaceholder')} required />
        {state?.errors?.word && (
          <p className="text-sm text-destructive">{state.errors.word[0]}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="definition">{t('addWord.form.definitionLabel')}</Label>
        <Textarea
          id="definition"
          name="definition"
          placeholder={t('addWord.form.definitionPlaceholder')}
          required
        />
        {state?.errors?.definition && (
          <p className="text-sm text-destructive">{state.errors.definition[0]}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image">{t('addWord.form.imageLabel')}</Label>
        <Input id="image" name="image" type="file" accept="image/*" required />
         {state?.errors?.image && (
          <p className="text-sm text-destructive">{state.errors.image[0]}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}
