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

export function RegisterForm() {
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
            <div className="grid gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="student-name">Full Name</Label>
                <Input id="student-name" placeholder="Max Robinson" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="student-email">Email</Label>
                <Input
                  id="student-email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="student-password">Password</Label>
                <Input id="student-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supervisor-id">Supervisor ID</Label>
                <Input id="supervisor-id" placeholder="Enter your supervisor's ID" />
              </div>
              <Button type="submit" className="w-full mt-2">
                Create an account
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="supervisor">
            <div className="grid gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="supervisor-name">Full Name</Label>
                <Input id="supervisor-name" placeholder="Dr. Jane Smith" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supervisor-email">Email</Label>
                <Input
                  id="supervisor-email"
                  type="email"
                  placeholder="j.smith@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supervisor-password">Password</Label>
                <Input id="supervisor-password" type="password" />
              </div>
              <Button type="submit" className="w-full mt-2">
                Create a supervisor account
              </Button>
            </div>
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
