"use client";

import { useFormStatus } from "react-dom";
import { addWord } from "@/lib/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const initialState = {
  message: "",
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding Word...
        </>
      ) : (
        "Add Word"
      )}
    </Button>
  );
}

export function AddWordForm() {
  const [state, formAction] = useActionState(addWord, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.errors && Object.keys(state.errors).length === 0) {
      toast({
        title: "Success!",
        description: state.message,
      });
    } else if (state.message) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="word">Word</Label>
        <Input id="word" name="word" placeholder="e.g., Ephemeral" required />
        {state.errors?.word && (
          <p className="text-sm text-destructive">{state.errors.word[0]}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="definition">Definition</Label>
        <Textarea
          id="definition"
          name="definition"
          placeholder="e.g., Lasting for a very short time."
          required
        />
        {state.errors?.definition && (
          <p className="text-sm text-destructive">{state.errors.definition[0]}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image">Explanatory Image</Label>
        <Input id="image" name="image" type="file" accept="image/*" required />
         {state.errors?.image && (
          <p className="text-sm text-destructive">{state.errors.image[0]}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}
