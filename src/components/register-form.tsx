

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "./logo";
import { validateRegistration } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { User } from "@/lib/data";
import { redirectToDashboard } from "@/lib/actions";

const initialState = {
  message: "",
  errors: {},
  success: false,
  formData: null
};

export function RegisterForm() {
  const [state, formAction] = useActionState(validateRegistration, initialState);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

   useEffect(() => {
      if (state.success && state.formData) {
        // The redirection is now handled inside the server action
        // so no client-side logic is needed here on success.
        // We just need to stop the loading spinner.
        setIsSubmitting(false);
      } else if (state.message && Object.keys(state.errors || {}).length > 0) {
        const firstErrorKey = Object.keys(state.errors || {})[0];
        const firstError = firstErrorKey ? (state.errors as any)[firstErrorKey][0] : state.message;
        toast({ title: t('toasts.error'), description: firstError, variant: "destructive" });
        setIsSubmitting(false);
      }
  }, [state, t, toast]);


  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <Logo className="h-20 w-20" />
        </div>
        <CardTitle className="text-2xl font-headline">{t('register.title')}</CardTitle>
        <CardDescription>
          {t('register.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
            <form action={(formData) => {
              setIsSubmitting(true);
              formAction(formData);
            }}>
              <div className="grid gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="student-name">{t('register.fullNameLabel')}</Label>
                  <Input id="student-name" name="name" placeholder={t('register.fullNamePlaceholder')} required />
                  {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="student-email">{t('register.emailLabel')}</Label>
                  <Input
                    id="student-email"
                    type="email"
                    name="email"
                    placeholder={t('register.emailPlaceholder')}
                    required
                  />
                  {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="student-password">{t('register.passwordLabel')}</Label>
                  <div className="relative">
                    <Input id="student-password" name="password" type={showPassword ? "text" : "password"} required/>
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {state.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supervisor-id">{t('register.supervisorIdLabel')}</Label>
                  <Input id="supervisor-id" name="supervisorId" placeholder={t('register.supervisorIdPlaceholder')} />
                  {state.errors?.supervisorId && <p className="text-sm text-destructive">{state.errors.supervisorId[0]}</p>}
                </div>
                 <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                    {isSubmitting ? (<><Loader2 className="me-2 h-4 w-4 animate-spin" /> {t('register.createAccountButton')}...</>) : t('register.createAccountButton')}
                </Button>
              </div>
            </form>
        <div className="mt-4 text-center text-sm">
          {t('register.haveAccount')}{" "}
          <Link href="/login" className="underline">
            {t('register.login')}
          </Link>
        </div>
        <div className="mt-4 text-center text-sm">
           <Link href="/contact-admin" className="underline text-muted-foreground">
            Want to become a supervisor? Message us!
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
