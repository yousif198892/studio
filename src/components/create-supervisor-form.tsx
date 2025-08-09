
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useActionState, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { User } from "@/lib/data";
import { validateSupervisorCreation } from "@/lib/actions";
import { db } from "@/lib/db";

const initialState: {
  message: string;
  errors?: any;
  success: boolean;
  formData?: FormData | null;
} = {
  message: "",
  errors: {},
  success: false,
  formData: null,
};


export function CreateSupervisorForm({ onSupervisorAdded }: { onSupervisorAdded: (user: User) => void }) {
  const [state, formAction] = useActionState(validateSupervisorCreation, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    async function createSupervisor() {
        if (state.success && state.formData) {
            try {
                const name = state.formData.get("name") as string;
                const email = state.formData.get("email") as string;
                const password = state.formData.get("password") as string;

                const allUsers = await db.users.getAll();
                if (allUsers.find(u => u.email === email)) {
                    toast({
                        title: "Error",
                        description: "Supervisor with this email already exists.",
                        variant: "destructive",
                    });
                    return;
                }
                
                const newUser: User = {
                    id: `sup${Date.now()}`,
                    name,
                    email,
                    password,
                    role: 'supervisor',
                    avatar: "https://placehold.co/100x100.png",
                    isSuspended: false,
                    isMainAdmin: false,
                };
                
                await db.users.put(newUser);
                
                toast({
                    title: "Success!",
                    description: "Supervisor account created.",
                });

                onSupervisorAdded(newUser);
                formRef.current?.reset();

            } catch (e) {
                 toast({
                    title: "Error",
                    description: "Could not create supervisor account.",
                    variant: "destructive",
                });
            } finally {
                setIsPending(false);
            }
        } else if (state.message && !state.success && state.errors) {
            const firstError = Object.values(state.errors)[0]?.[0] || state.message;
            toast({
                title: "Error",
                description: firstError,
                variant: "destructive",
            });
            setIsPending(false);
        }
    }
    createSupervisor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);


  return (
    <form ref={formRef} action={(formData) => {
      setIsPending(true);
      formAction(formData);
    }} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" placeholder="Jane Doe" required />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="jane@example.com" required />
        {state?.errors?.email && (
          <p className="text-sm text-destructive">{state.errors.email[0]}</p>
        )}
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
         {state?.errors?.password && (
          <p className="text-sm text-destructive">{state.errors.password[0]}</p>
        )}
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
