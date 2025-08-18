

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
import { getUserById, updateUserDB, User, getNextSupervisorShortId, addUserDB } from "@/lib/data";
import { isPast } from "date-fns";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getAuthInstance } from "@/lib/db";

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
    const mainAdminEmail = "warriorwithinyousif@gmail.com";
    const defaultPassword = "password123";

    const handleLogin = async (userId: string) => {
        let user = await getUserById(userId);
        if (!user) {
             toast({ title: t('toasts.error'), description: "No user data found in database.", variant: "destructive"});
             setIsPending(false);
             return;
        }
        
        // Check for trial expiration
        if (user.role === 'supervisor' && user.trialExpiresAt && isPast(new Date(user.trialExpiresAt))) {
            if (!user.isSuspended) {
                user.isSuspended = true;
                await updateUserDB(user);
                toast({
                    title: "Trial Expired",
                    description: "Your trial period has ended. Please contact an administrator.",
                    variant: "destructive"
                });
                setIsPending(false);
                return;
            }
        }

        if (user.isSuspended) {
            toast({ title: t('toasts.error'), description: "This account has been suspended.", variant: "destructive"});
            setIsPending(false);
            return;
        }
        
        // The redirect will happen here, so we don't set isPending to false.
        // The component will unmount on successful redirect.
        await redirectToDashboard(user.id);
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsPending(true);

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
        const auth = getAuthInstance();
        
        let userIdToLogin: string | null = null;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            userIdToLogin = userCredential.user.uid;
        } catch (error: any) {
             if ((error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') && email === mainAdminEmail && password === defaultPassword) {
                try {
                    const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const shortId = await getNextSupervisorShortId();
                    const mainAdminData: User = {
                        id: newUserCredential.user.uid,
                        name: "Yousif",
                        email: mainAdminEmail,
                        role: "supervisor",
                        avatar: "https://placehold.co/100x100.png?text=Y",
                        timezone: "Asia/Baghdad",
                        isMainAdmin: true,
                        isSuspended: false,
                        shortId: shortId,
                    };
                    await addUserDB(mainAdminData);
                    userIdToLogin = newUserCredential.user.uid;
                } catch (creationError: any) {
                     toast({ title: t('toasts.error'), description: `Failed to auto-create admin account: ${creationError.message}`, variant: "destructive" });
                }
             } else {
                console.error("Firebase Auth Error: ", error);
                let errorMessage = "An unexpected error occurred. Please try again.";
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    errorMessage = "Invalid email or password. Please check your credentials or sign up if you don't have an account.";
                }
                toast({ title: t('toasts.error'), description: errorMessage, variant: "destructive" });
            }
        }

        if (userIdToLogin) {
            await handleLogin(userIdToLogin);
        } else {
            setIsPending(false);
        }
    }


  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <Logo className="h-20 w-20" />
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
