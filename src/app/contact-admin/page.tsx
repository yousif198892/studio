
"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ContactAdminPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        // Simulate sending a message
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Message Sent!",
                description: "Thank you for your message. We will get back to you shortly.",
            });
            (e.target as HTMLFormElement).reset();
        }, 1500);
    }

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Contact Administrator</CardTitle>
          <CardDescription>
            If you wish to become a supervisor, please send a message to the
            administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Your Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="animate-spin" /> : "Send Message"}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
                <Link href="/login" className="underline">
                    Back to Login
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
