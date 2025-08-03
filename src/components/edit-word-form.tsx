
"use client";

import { useFormStatus } from "react-dom";
import { updateWord } from "@/lib/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useActionState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Word } from "@/lib/data";
import Image from "next/image";

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

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving Changes...
        </>
      ) : (
        "Save Changes"
      )}
    </Button>
  );
}

export function EditWordForm({ word }: { word: Word }) {
  const [state, formAction] = useActionState(updateWord, initialState);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.updatedWord) {
      toast({
        title: "Success!",
        description: state.message,
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
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, router, userId]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="wordId" value={word.id} />
      <input type="hidden" name="userId" value={userId || ''} />
      <div className="grid gap-2">
        <Label htmlFor="word">Word</Label>
        <Input id="word" name="word" defaultValue={word.word} placeholder="e.g., Ephemeral" required />
        {state?.errors?.word && (
          <p className="text-sm text-destructive">{state.errors.word[0]}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="definition">Definition</Label>
        <Textarea
          id="definition"
          name="definition"
          defaultValue={word.definition}
          placeholder="e.g., Lasting for a very short time."
          required
        />
        {state?.errors?.definition && (
          <p className="text-sm text-destructive">{state.errors.definition[0]}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image">Explanatory Image</Label>
        <p className="text-sm text-muted-foreground">Current Image:</p>
        <Image src={word.imageUrl} alt="Current image" width={100} height={100} className="rounded-md" />
        <Input id="image" name="image" type="file" accept="image/*" />
        <p className="text-xs text-muted-foreground">Leave blank to keep the current image.</p>
         {state?.errors?.image && (
          <p className="text-sm text-destructive">{state.errors.image[0]}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}
