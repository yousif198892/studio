"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
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
import { useEffect } from "react";

const initialState = {
  message: "",
  errors: {},
};

export function RegisterForm() {
  const [studentState, studentFormAction] = useFormState(register, initialState);
  const [supervisorState, supervisorFormAction] = useFormState(register, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (studentState.message && Object.keys(studentState.errors).length === 0) {
      toast({ title: "Success!", description: studentState.message });
    } else if (studentState.message) {
      const errorMessage = studentState.errors?.supervisorId?.[0] || studentState.message;
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  }, [studentState, toast]);

   useEffect(() => {
    if (supervisorState.message && Object.keys(supervisorState.errors).length === 0) {
      toast({ title: "Success!", description: supervisorState.message });
    } else if (supervisorState.message) {
      toast({ title: "Error", description: supervisorState.message, variant: "destructive" });
    }
  }, [supervisorState, toast]);

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <Logo />
        </div>
        <CardTitle className="text-2xl font-headline">Join LinguaLeap</CardTitle>
        <CardDescription>
          Create your account to start your learning journey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="student">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="supervisor">Supervisor</TabsTrigger>
          </TabsList>
          <TabsContent value="student">
            <form action={studentFormAction}>
              <input type="hidden" name="role" value="student" />
              <div className="grid gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="student-name">Full Name</Label>
                  <Input id="student-name" name="name" placeholder="Max Robinson" required />
                  {studentState.errors?.name && <p className="text-sm text-destructive">{studentState.errors.name[0]}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    required
                  />
                  {studentState.errors?.email && <p className="text-sm text-destructive">{studentState.errors.email[0]}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input id="student-password" name="password" type="password" required/>
                  {studentState.errors?.password && <p className="text-sm text-destructive">{studentState.errors.password[0]}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supervisor-id">Supervisor ID</Label>
                  <Input id="supervisor-id" name="supervisorId" placeholder="Enter your supervisor's ID" />
                  {studentState.errors?.supervisorId && <p className="text-sm text-destructive">{studentState.errors.supervisorId[0]}</p>}
                </div>
                <Button type="submit" className="w-full mt-2">
                  Create an account
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="supervisor">
            <form action={supervisorFormAction}>
                <input type="hidden" name="role" value="supervisor" />
              <div className="grid gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="supervisor-name">Full Name</Label>
                  <Input id="supervisor-name" name="name" placeholder="Dr. Jane Smith" required />
                  {supervisorState.errors?.name && <p className="text-sm text-destructive">{supervisorState.errors.name[0]}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supervisor-email">Email</Label>
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
                  <Label htmlFor="supervisor-password">Password</Label>
                  <Input id="supervisor-password" name="password" type="password" required/>
                  {supervisorState.errors?.password && <p className="text-sm text-destructive">{supervisorState.errors.password[0]}</p>}
                </div>
                <Button type="submit" className="w-full mt-2">
                  Create a supervisor account
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
        <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-muted-foreground"></div>
            <span className="mx-4 text-xs uppercase text-muted-foreground">Or continue with</span>
            <div className="flex-grow border-t border-muted-foreground"></div>
        </div>
        <Button variant="outline" className="w-full">
          Sign up with Google
        </Button>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
