
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
import { Logo } from "@/components/logo";
import { useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";
import { login } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const initialState = {
  message: "",
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="me-2 h-4 w-4 animate-spin" />
          {t('login.loginButton')}...
        </>
      ) : (
        t('login.loginButton')
      )}
    </Button>
  );
}


export function LoginForm() {
    const [state, formAction] = useActionState(login, initialState);
    const { toast } = useToast();
    const { t } = useLanguage();

    useEffect(() => {
        if (state?.message && Object.keys(state.errors || {}).length > 0) {
          toast({
            title: t('toasts.error'),
            description: t('toasts.loginError'),
            variant: "destructive",
          });
        }
    }, [state, toast, t]);


  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <Logo />
        </div>
        <CardTitle className="text-2xl font-headline">{t('login.welcome')}</CardTitle>
        <CardDescription>
          {t('login.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">{t('login.emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              required
            />
            {state.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">{t('login.passwordLabel')}</Label>
              <Link
                href="#"
                className="ms-auto inline-block text-sm underline"
              >
                {t('login.forgotPassword')}
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
            {state.errors?.password && (
                <p className="text-sm text-destructive">{state.errors.password[0]}</p>
            )}
          </div>
          <SubmitButton />
          <Button variant="outline" className="w-full">
            {t('login.loginWithGoogle')}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {t('login.noAccount')}{" "}
          <Link href="/register" className="underline">
            {t('login.signUp')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
