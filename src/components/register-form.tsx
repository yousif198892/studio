

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
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { User, addUserDB, getAllUsers, getUserByEmailDB, getUserById } from "@/lib/data";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const registerSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('Invalid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    supervisorId: z.string().min(1, 'Supervisor ID is required.'),
    grade: z.string().min(1, 'Grade is required.'),
    section: z.string().min(1, 'Section is required.'),
  });

export function RegisterForm() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const validatedFields = registerSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        supervisorId: formData.get("supervisorId"),
        grade: formData.get("grade"),
        section: formData.get("section"),
    });

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
        toast({ title: t('toasts.error'), description: firstError || "Validation failed.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    const { name, email, password, supervisorId, grade, section } = validatedFields.data;

    try {
        const existingUser = await getUserByEmailDB(email);
        if(existingUser) {
            toast({ title: t('toasts.error'), description: t('toasts.userExists'), variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        const supervisor = await getUserById(supervisorId);
        if (!supervisor || supervisor.role !== 'supervisor') {
            toast({ title: t('toasts.error'), description: t('toasts.invalidSupervisorId'), variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        const allUsers = await getAllUsers();
        const studentNumbers = allUsers
            .filter(u => u.role === 'student' && u.id.startsWith('user'))
            .map(u => parseInt(u.id.replace('user', ''), 10))
            .filter(n => !isNaN(n));
        
        const newIdNumber = studentNumbers.length > 0 ? Math.max(...studentNumbers) + 1 : 1;

        const newUser: User = {
            id: `user${newIdNumber}`,
            name,
            email,
            password,
            role: 'student',
            avatar: "https://placehold.co/100x100.png",
            supervisorId,
            timezone: "Asia/Baghdad",
            grade,
            section
        };
        
        await addUserDB(newUser);

        toast({ title: t('toasts.success'), description: "Account created successfully!"});

        router.push(`/welcome?userId=${newUser.id}`);

    } catch (error) {
        toast({ title: t('toasts.error'), description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  }


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
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="student-name">{t('register.fullNameLabel')}</Label>
                  <Input id="student-name" name="name" placeholder={t('register.fullNamePlaceholder')} required />
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
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="grade">Grade</Label>
                        <Select name="grade">
                          <SelectTrigger>
                            <SelectValue placeholder="Select Grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 6 }, (_, i) => i + 1).map(grade => (
                                <SelectItem key={grade} value={String(grade)}>{grade}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="section">Section</Label>
                        <Select name="section">
                          <SelectTrigger>
                            <SelectValue placeholder="Select Section" />
                          </SelectTrigger>
                          <SelectContent>
                             {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                                <SelectItem key={letter} value={letter}>{letter}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
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
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supervisor-id">{t('register.supervisorIdLabel')}</Label>
                  <Input id="supervisor-id" name="supervisorId" placeholder={t('register.supervisorIdPlaceholder')} required />
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
