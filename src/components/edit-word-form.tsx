
"use client";

import { useFormStatus } from "react-dom";
import { updateWord } from "@/lib/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useActionState, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Word, Unit, getUnitsBySupervisor } from "@/lib/data";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useLanguage } from "@/hooks/use-language";

const initialState: {
    message: string,
    errors?: any,
    success: boolean,
    updatedWord?: Partial<Word> & { id: string }
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
          {t('editWord.form.savingButton')}
        </>
      ) : (
        t('editWord.form.saveButton')
      )}
    </Button>
  );
}

export function EditWordForm({ word }: { word: Word }) {
  const [state, formAction] = useActionState(updateWord, initialState);
  const { toast } = useToast();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    if (userId) {
        const supervisorUnits = getUnitsBySupervisor(userId);
        setUnits(supervisorUnits);
    }
  }, [userId]);


  useEffect(() => {
    if (state.success && state.updatedWord) {
      toast({
        title: t('toasts.success'),
        description: t('toasts.updateWordSuccess'),
      });

      // Update localStorage
      try {
        const storedWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
        const updatedWords = storedWords.map(w => {
            if (w.id === state.updatedWord?.id) {
                // Merge existing word with updated fields
                return {
                    ...w,
                    word: state.updatedWord.word || w.word,
                    definition: state.updatedWord.definition || w.definition,
                    imageUrl: state.updatedWord.imageUrl || w.imageUrl,
                    unitId: state.updatedWord.unitId || w.unitId,
                };
            }
            return w;
        });
        localStorage.setItem('userWords', JSON.stringify(updatedWords));
      } catch (e) {
          console.error("Failed to update word in localStorage", e);
      }

      router.push(`/dashboard/words?userId=${userId}`);
    } else if (state.message && !state.success) {
      toast({
        title: t('toasts.error'),
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, router, userId, t]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="wordId" value={word.id} />
      <input type="hidden" name="userId" value={userId || ''} />
      <div className="grid gap-2">
        <Label htmlFor="word">{t('addWord.form.wordLabel')}</Label>
        <Input id="word" name="word" defaultValue={word.word} placeholder={t('addWord.form.wordPlaceholder')} required />
        {state?.errors?.word && (
          <p className="text-sm text-destructive">{state.errors.word[0]}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="definition">{t('addWord.form.definitionLabel')}</Label>
        <Textarea
          id="definition"
          name="definition"
          defaultValue={word.definition}
          placeholder={t('addWord.form.definitionPlaceholder')}
          required
        />
        {state?.errors?.definition && (
          <p className="text-sm text-destructive">{state.errors.definition[0]}</p>
        )}
      </div>
       <div className="grid gap-2">
            <Label htmlFor="unitId">{t('addWord.form.unitLabel')}</Label>
            <Select name="unitId" defaultValue={word.unitId}>
                <SelectTrigger>
                    <SelectValue placeholder={t('addWord.form.selectUnit')} />
                </SelectTrigger>
                <SelectContent>
                    {units.map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {state?.errors?.unitId && (
                <p className="text-sm text-destructive">{state.errors.unitId[0]}</p>
            )}
       </div>
      <div className="grid gap-2">
        <Label htmlFor="image">{t('addWord.form.imageLabel')}</Label>
        <p className="text-sm text-muted-foreground">{t('editWord.form.currentImage')}</p>
        <Image src={word.imageUrl} alt="Current image" width={100} height={100} className="rounded-md" />
        <Input id="image" name="image" type="file" accept="image/*" />
        <p className="text-xs text-muted-foreground">{t('editWord.form.imageHelper')}</p>
         {state?.errors?.image && (
          <p className="text-sm text-destructive">{state.errors.image[0]}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}
