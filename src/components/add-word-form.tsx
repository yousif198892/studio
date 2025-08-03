
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
import { Word, Unit, getUnitsBySupervisor } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

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

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          جار إضافة الكلمة...
        </>
      ) : (
        "إضافة كلمة"
      )}
    </Button>
  );
}

export function AddWordForm() {
  const [state, formAction] = useActionState(addWord, initialState);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "sup1";
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    if (userId) {
        const supervisorUnits = getUnitsBySupervisor(userId);
        setUnits(supervisorUnits);
    }
  }, [userId]);


  useEffect(() => {
    if (state.success && state.newWord) {
      toast({
        title: "نجاح!",
        description: state.message,
      });

      // Save to localStorage
      try {
        const existingWords: Word[] = JSON.parse(localStorage.getItem('userWords') || '[]');
        const newWord: Word = {
          ...state.newWord,
          nextReview: new Date(state.newWord.nextReview)
        };
        const updatedWords = [...existingWords, newWord];
        localStorage.setItem('userWords', JSON.stringify(updatedWords));
      } catch (e) {
        console.error("Could not save to localStorage", e);
      }

      formRef.current?.reset();
      router.push(`/dashboard/words?userId=${userId}`);
    } else if (state.message && !state.success) {
      toast({
        title: "خطأ",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, router, userId]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="userId" value={userId || ''} />
      <div className="grid gap-2">
        <Label htmlFor="word">الكلمة</Label>
        <Input id="word" name="word" placeholder="مثال: سريع الزوال" required />
        {state?.errors?.word && (
          <p className="text-sm text-destructive">{state.errors.word[0]}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="definition">التعريف</Label>
        <Textarea
          id="definition"
          name="definition"
          placeholder="مثال: يدوم لفترة قصيرة جدًا."
          required
        />
        {state?.errors?.definition && (
          <p className="text-sm text-destructive">{state.errors.definition[0]}</p>
        )}
      </div>
       <div className="grid gap-2">
            <Label htmlFor="unitId">الوحدة</Label>
            <Select name="unitId">
                <SelectTrigger>
                    <SelectValue placeholder="اختر وحدة" />
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
        <Label htmlFor="image">صورة توضيحية</Label>
        <Input id="image" name="image" type="file" accept="image/*" required />
         {state?.errors?.image && (
          <p className="text-sm text-destructive">{state.errors.image[0]}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}
