
"use client";

import { useFormStatus } from "react-dom";
import { addUnit } from "@/lib/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useActionState, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Unit } from "@/lib/data";
import { useLanguage } from "@/hooks/use-language";

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
  const { t } = useLanguage();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('unitsPage.addUnit.form.addingButton')}
        </>
      ) : (
        t('unitsPage.addUnit.form.addButton')
      )}
    </Button>
  );
}

export function AddUnitForm({ onUnitAdded }: { onUnitAdded: (unit: Unit) => void }) {
  const { t } = useLanguage();
  const [state, formAction] = useActionState(addUnit, initialState);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const userId = searchParams.get("userId") || "sup1";

  useEffect(() => {
    if (state.success && state.newUnit) {
      toast({
        title: t('toasts.success'),
        description: t('toasts.addUnitSuccess'),
      });
      
      onUnitAdded(state.newUnit);
      formRef.current?.reset();
      // Reset the state manually after processing
      state.success = false;
      
    } else if (state.message && !state.success && state.errors) {
       const errorMessage = state.errors?.unitName?.[0] === 'Unit with this name already exists.' ? t('toasts.addUnitExists') : state.message;
      toast({
        title: t('toasts.error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [state, toast, onUnitAdded, t]);

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="userId" value={userId || ''} />
      <div className="grid gap-2">
        <Label htmlFor="unitName">{t('unitsPage.addUnit.form.nameLabel')}</Label>
        <Input id="unitName" name="unitName" placeholder={t('unitsPage.addUnit.form.namePlaceholder')} required />
        {state?.errors?.unitName && (
          <p className="text-sm text-destructive">{state.errors.unitName[0]}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}
