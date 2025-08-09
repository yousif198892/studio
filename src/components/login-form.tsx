

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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { redirectToDashboard } from "@/lib/actions";
import { getAllUsers } from "@/lib/data";

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});


export function LoginForm() {
    const { toast } = useToast();
    const { t } = useLanguage();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsPending(true);

        try {
            const formData = new FormData(event.currentTarget);
            const validatedFields = loginSchema.safeParse({
                email: formData.get("email"),
                password: formData.get("password"),
            });

            if (!validatedFields.success) {
                const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
                toast({
                    title: t('toasts.error'),
                    description: firstError || "Validation failed.",
                    variant: "destructive"
                });
                setIsPending(false);
                return;
            }

            const { email, password } = validatedFields.data;
            const allUsers = getAllUsers();
            const user = allUsers.find((u) => u.email === email);

            if (!user || user.password !== password) {
                 toast({
                    title: t('toasts.error'),
                    description: "Invalid email or password.",
                    variant: "destructive"
                });
                setIsPending(false);
                return;
            }

            if (user.isSuspended) {
                 toast({
                    title: t('toasts.error'),
                    description: "This account has been suspended.",
                    variant: "destructive"
                });
                setIsPending(false);
                return;
            }
            
            // This function will throw a NEXT_REDIRECT error which is handled by Next.js
            await redirectToDashboard(user.id);

        } catch (error) {
            // This catch block will only handle unexpected errors, not the redirect.
            if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
              throw error;
            }
            console.error("An unexpected error occurred during login:", error);
            toast({
                title: t('toasts.error'),
                description: "An unexpected error occurred during login.",
                variant: "destructive"
            });
        } finally {
            // This might not run on successful redirect, which is fine.
            setIsPending(false);
        }
    }


  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <Logo className="h-16 w-16" />
        </div>
        <CardTitle className="text-2xl font-headline">{t('login.welcome')}</CardTitle>
        <CardDescription>
          {t('login.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">{t('login.emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              required
            />
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
            <div className="relative">
              <Input id="password" name="password" type={showPassword ? "text" : "password"} required />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
           <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
                <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {t('login.loginButton')}...
                </>
            ) : (
                t('login.loginButton')
            )}
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
