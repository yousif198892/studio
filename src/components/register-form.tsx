
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
import { validateRegistration, redirectToDashboard } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { db } from "@/lib/db";
import { User } from "@/lib/data";

const initialState = {
  message: "",
  errors: {},
  success: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    const { t } = useLanguage();

    return (
        <Button type="submit" className="w-full mt-2" disabled={pending}>
            {pending ? (<><Loader2 className="me-2 h-4 w-4 animate-spin" /> {t('register.createAccountButton')}...</>) : t('register.createAccountButton')}
        </Button>
    )
}

export function RegisterForm() {
  const [state, formAction] = useActionState(validateRegistration, initialState);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

   useEffect(() => {
    async function handleRegistration() {
      if (state.success && formData) {
        setIsSubmitting(true);
        try {
            const name = formData.get("name") as string;
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            const supervisorId = formData.get("supervisorId") as string;
            
            // Final client-side check
            const allUsers = await db.users.getAll();
            if (allUsers.some(u => u.email === email)) {
                toast({ title: t('toasts.error'), description: t('toasts.userExists'), variant: "destructive" });
                return;
            }
            const supervisorExists = allUsers.some(u => u.id === supervisorId && u.role === 'supervisor');
            if (!supervisorExists) {
                toast({ title: t('toasts.error'), description: t('toasts.invalidSupervisorId'), variant: "destructive" });
                return;
            }

            const newUser: User = {
                id: `user${Date.now()}`,
                name,
                email,
                password,
                role: 'student',
                avatar: "https://placehold.co/100x100.png",
                supervisorId: supervisorId,
            };
            
            await db.users.put(newUser);
            toast({ title: t('toasts.success'), description: t('toasts.registerSuccess') });
            await redirectToDashboard(newUser.id);

        } catch (e) {
            toast({ title: t('toasts.error'), description: "Registration failed. Please try again.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
      } else if (state.message && Object.keys(state.errors || {}).length > 0) {
        const firstErrorKey = Object.keys(state.errors || {})[0];
        const firstError = firstErrorKey ? (state.errors as any)[firstErrorKey][0] : state.message;
        toast({ title: t('toasts.error'), description: firstError, variant: "destructive" });
      }
    }
    
    handleRegistration();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, formData]);


  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const currentFormData = new FormData(event.currentTarget);
      setFormData(currentFormData);
      formAction(currentFormData);
  }

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <Logo />
        </div>
        <CardTitle className="text-2xl font-headline">{t('register.title')}</CardTitle>
        <CardDescription>
          {t('register.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
            <form onSubmit={handleFormSubmit}>
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
