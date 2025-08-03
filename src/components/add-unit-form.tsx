
"use client";

import { useFormStatus } from "react-dom";
import { addUnit } from "@/lib/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useActionState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Unit } from "@/lib/data";

const initialState: {
  message: string;
  errors?: any;
  success: boolean;
  newUnit?: Unit;
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
          Adding Unit...
        </>
      ) : (
        "Add Unit"
      )}
    </Button>
  );
}

export function AddUnitForm({ onUnitAdded }: { onUnitAdded: (unit: Unit) => void }) {
  const [state, formAction] = useActionState(addUnit, initialState);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "sup1";
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && state.newUnit) {
      toast({
        title: "Success!",
        description: state.message,
      });
      
      onUnitAdded(state.newUnit);
      formRef.current?.reset();
      // Reset the state manually after processing
      state.success = false;
      
    } else if (state.message && !state.success && state.errors) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, onUnitAdded]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="userId" value={userId || ''} />
      <div className="grid gap-2">
        <Label htmlFor="unitName">Unit Name</Label>
        <Input id="unitName" name="unitName" placeholder="e.g., Chapter 1 Verbs" required />
        {state?.errors?.unitName && (
          <p className="text-sm text-destructive">{state.errors.unitName[0]}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}
