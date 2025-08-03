
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "./logo";
import { register } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const initialState = {
  message: "",
  errors: {},
};

function StudentSubmitButton() {
    const { pending } = useFormStatus();
    const { t } = useLanguage();
    return (
        <Button type="submit" className="w-full mt-2" disabled={pending}>
            {pending ? (<><Loader2 className="me-2 h-4 w-4 animate-spin" /> {t('register.createAccountButton')}...</>) : t('register.createAccountButton')}
        </Button>
    )
}

function SupervisorSubmitButton() {
    const { pending } = useFormStatus();
    const { t } = useLanguage();
    return (
        <Button type="submit" className="w-full mt-2" disabled={pending}>
             {pending ? (<><Loader2 className="me-2 h-4 w-4 animate-spin" /> {t('register.createSupervisorAccountButton')}...</>) : t('register.createSupervisorAccountButton')}
        </Button>
    )
}


export function RegisterForm() {
  const [studentState, studentFormAction] = useActionState(register, initialState);
  const [supervisorState, supervisorFormAction] = useActionState(register, initialState);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (studentState.message && Object.keys(studentState.errors || {}).length === 0) {
      toast({ title: t('toasts.success'), description: t('toasts.registerSuccess') });
      // Redirect is now handled in the server action
    } else if (studentState.message || (studentState.errors && Object.keys(studentState.errors).length > 0)) {
       const firstErrorKey = Object.keys(studentState.errors || {})[0];
       const firstError = firstErrorKey ? (studentState.errors as any)[firstErrorKey][0] : studentState.message;

      toast({ title: t('toasts.error'), description: firstError, variant: "destructive" });
    }
  }, [studentState, toast, t]);

   useEffect(() => {
    if (supervisorState.message && Object.keys(supervisorState.errors || {}).length === 0) {
      toast({ title: t('toasts.success'), description: t('toasts.registerSuccess') });
       // Redirect is now handled in the server action
    } else if (supervisorState.message || (supervisorState.errors && Object.keys(supervisorState.errors).length > 0)) {
       const firstErrorKey = Object.keys(supervisorState.errors || {})[0];
       const firstError = firstErrorKey ? (supervisorState.errors as any)[firstErrorKey][0] : supervisorState.message;
       
      toast({ title: t('toasts.error'), description: firstError, variant: "destructive" });
    }
  }, [supervisorState, toast, t]);

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
        <Tabs defaultValue="student">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">{t('register.studentTab')}</TabsTrigger>
            <TabsTrigger value="supervisor">{t('register.supervisorTab')}</TabsTrigger>
          </TabsList>
          <TabsContent value="student">
            <form action={studentFormAction}>
              <input type="hidden" name="role" value="student" />
              <div className="grid gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="student-name">{t('register.fullNameLabel')}</Label>
                  <Input id="student-name" name="name" placeholder={t('register.fullNamePlaceholder')} required />
                  {studentState.errors?.name && <p className="text-sm text-destructive">{studentState.errors.name[0]}</p>}
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
                  {studentState.errors?.email && <p className="text-sm text-destructive">{studentState.errors.email[0]}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="student-password">{t('register.passwordLabel')}</Label>
                  <Input id="student-password" name="password" type="password" required/>
                  {studentState.errors?.password && <p className="text-sm text-destructive">{studentState.errors.password[0]}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supervisor-id">{t('register.supervisorIdLabel')}</Label>
                  <Input id="supervisor-id" name="supervisorId" placeholder={t('register.supervisorIdPlaceholder')} />
                  {studentState.errors?.supervisorId && <p className="text-sm text-destructive">{studentState.errors.supervisorId[0]}</p>}
                </div>
                <StudentSubmitButton />
              </div>
            </form>
          </TabsContent>
          <TabsContent value="supervisor">
            <form action={supervisorFormAction}>
                <input type="hidden" name="role" value="supervisor" />
              <div className="grid gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="supervisor-name">{t('register.fullNameLabel')}</Label>
                  <Input id="supervisor-name" name="name" placeholder="Dr. Jane Smith" required />
                  {supervisorState.errors?.name && <p className="text-sm text-destructive">{supervisorState.errors.name[0]}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supervisor-email">{t('register.emailLabel')}</Label>
                  <Input
                    id="supervisor-email"
                    type="email"
                    name="email"
                    placeholder="j.smith@example.com"
                    required
                  />
                  {supervisorState.errors?.email && <p className="text-sm text-destructive">{supervisorState.errors.email[0]}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supervisor-password">{t('register.passwordLabel')}</Label>
                  <Input id="supervisor-password" name="password" type="password" required/>
                  {supervisorState.errors?.password && <p className="text-sm text-destructive">{supervisorState.errors.password[0]}</p>}
                </div>
                <SupervisorSubmitButton />
              </div>
            </form>
          </TabsContent>
        </Tabs>
        <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-muted-foreground"></div>
            <span className="mx-4 text-xs uppercase text-muted-foreground">{t('register.orContinueWith')}</span>
            <div className="flex-grow border-t border-muted-foreground"></div>
        </div>
        <Button variant="outline" className="w-full">
          {t('register.registerWithGoogle')}
        </Button>
        <div className="mt-4 text-center text-sm">
          {t('register.haveAccount')}{" "}
          <Link href="/login" className="underline">
            {t('register.login')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
