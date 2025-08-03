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
          جارٍ تسجيل الدخول...
        </>
      ) : (
        "تسجيل الدخول"
      )}
    </Button>
  );
}


export function LoginForm() {
    const [state, formAction] = useActionState(login, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.message && Object.keys(state.errors || {}).length > 0) {
          toast({
            title: "خطأ",
            description: state.message,
            variant: "destructive",
          });
        }
    }, [state, toast]);


  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <Logo />
        </div>
        <CardTitle className="text-2xl font-headline">مرحبًا بعودتك!</CardTitle>
        <CardDescription>
          أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
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
              <Label htmlFor="password">كلمة المرور</Label>
              <Link
                href="#"
                className="mr-auto inline-block text-sm underline"
              >
                هل نسيت كلمة المرور؟
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
            {state.errors?.password && (
                <p className="text-sm text-destructive">{state.errors.password[0]}</p>
            )}
          </div>
          <SubmitButton />
          <Button variant="outline" className="w-full">
            تسجيل الدخول باستخدام جوجل
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="underline">
            التسجيل
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
