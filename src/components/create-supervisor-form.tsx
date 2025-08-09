
"use client";

import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useActionState, useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { User } from "@/lib/data";
import { createSupervisor } from "@/lib/actions";
import { db } from "@/lib/db";

const initialState: {
  message: string;
  errors?: any;
  success: boolean;
  newUser?: User;
} = {
  message: "",
  errors: {},
  success: false,
};


export function CreateSupervisorForm({ onSupervisorAdded }: { onSupervisorAdded: (user: User) => void }) {
  const [state, formAction] = useActionState(createSupervisor.bind(null, []), initialState);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    if (state.success && state.newUser) {
      toast({
        title: "Success!",
        description: "Supervisor account created.",
      });

      onSupervisorAdded(state.newUser);
      formRef.current?.reset();
      // Reset the state manually after processing
      state.success = false;
      
    } else if (state.message && !state.success && state.errors) {
       const firstError = Object.values(state.errors)[0]?.[0] || state.message;
       toast({
        title: "Error",
        description: firstError,
        variant: "destructive",
      });
    }
  }, [state, toast, onSupervisorAdded]);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
        const allUsers = await db.users.getAll();
        createSupervisor.bind(null, allUsers)(state, formData);
    });
  }


  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
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
