

"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { User, addUserDB, getAllUsers } from "@/lib/data";
import { z } from "zod";
import { Checkbox } from "./ui/checkbox";
import { add } from "date-fns";

const createSupervisorSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  isTrial: z.boolean().optional(),
});

function generateShortID(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


export function CreateSupervisorForm({ onSupervisorAdded }: { onSupervisorAdded: (user: User) => void }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const validatedFields = createSupervisorSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        isTrial: formData.get("isTrial") === 'on',
    });

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
        toast({ title: "Error", description: firstError || "Validation failed.", variant: "destructive" });
        setIsPending(false);
        return;
    }

    const { name, email, password, isTrial } = validatedFields.data;

     try {
        const newUser: User = {
            id: `sup_${generateShortID()}`,
            name,
            email,
            password,
            role: 'supervisor',
            avatar: "https://placehold.co/100x100.png",
            isSuspended: false,
            isMainAdmin: false,
            trialExpiresAt: isTrial ? add(new Date(), { months: 1 }).toISOString() : undefined,
        };
        
        await addUserDB(newUser);
        
        toast({
            title: "Success!",
            description: "Supervisor account created.",
        });

        onSupervisorAdded(newUser);
        formRef.current?.reset();
        setShowPassword(false);

    } catch (e) {
         toast({
            title: "Error",
            description: "Could not create supervisor account. Email may already be in use.",
            variant: "destructive",
        });
    } finally {
        setIsPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" placeholder="Jane Doe" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="jane@example.com" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
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
      <div className="flex items-center space-x-2">
        <Checkbox id="isTrial" name="isTrial" />
        <label
          htmlFor="isTrial"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Create as 1-Month Trial Account
        </label>
      </div>
       <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Supervisor"
          )}
        </Button>
    </form>
  );
}
