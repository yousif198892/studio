
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { type User } from "@/lib/data";
import { addUserDB, getNextSupervisorShortId, getUserByEmail } from "@/lib/firestore";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { add } from "date-fns";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

const createSupervisorSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  isTrial: z.boolean().optional(),
});


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
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            toast({ title: "Error", description: "This email is already associated with an account.", variant: "destructive" });
            setIsPending(false);
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        let newUser: User | null = null;
        try {
            const shortId = await getNextSupervisorShortId();
            
            const baseUser: Partial<User> = {
                id: firebaseUser.uid,
                shortId,
                name,
                email,
                role: 'supervisor',
                avatar: "https://placehold.co/100x100.png",
                isSuspended: false,
                isMainAdmin: false,
                timezone: "Asia/Baghdad",
            };

            if (isTrial) {
                baseUser.trialExpiresAt = add(new Date(), { months: 1 }).toISOString();
            }
            
            newUser = baseUser as User;
            await addUserDB(newUser);

        } catch (dbError) {
             toast({
                title: "Database Error",
                description: "User was created in Authentication, but failed to save to database. Please delete the user from Firebase Authentication and try again.",
                variant: "destructive",
            });
            console.error("Firestore user creation failed: ", dbError);
            setIsPending(false);
            return;
        }
        
        toast({
            title: "Success!",
            description: "Supervisor account created.",
        });

        if (newUser) {
            onSupervisorAdded(newUser);
        }
        formRef.current?.reset();
        setShowPassword(false);

    } catch (e: any) {
        let errorMessage = "Could not create supervisor account.";
        if (e.code === 'auth/email-already-in-use') {
            errorMessage = "This email is already registered. If the user should be a supervisor but isn't, delete their Auth record and try again.";
        }
         toast({
            title: "Error",
            description: errorMessage,
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
