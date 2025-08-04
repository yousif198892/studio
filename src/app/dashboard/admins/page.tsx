
"use client";

import { createSupervisor } from "@/lib/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Copy } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { getAllUsers, User } from "@/lib/data";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

const initialState = {
  message: "",
  errors: {},
  success: false,
  newUser: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        "Create Supervisor Account"
      )}
    </Button>
  );
}

export default function AdminsPage() {
  const { t } = useLanguage();
  const [state, formAction] = useActionState(createSupervisor, initialState);
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const allUsers = getAllUsers();
    const supervisorUsers = allUsers.filter(u => u.role === 'supervisor' && !u.isMainAdmin);
    setSupervisors(supervisorUsers);
  }, []);

  useEffect(() => {
    if (state.success && state.newUser) {
      toast({
        title: t("toasts.success"),
        description: "Supervisor account created successfully!",
      });
      // Add new supervisor to the list
      setSupervisors(prev => [...prev, state.newUser!]);
      // Reset form
      formRef.current?.reset();
      setPassword("");
      // Reset state
      state.success = false;
      state.newUser = undefined;

    } else if (state.message && !state.success) {
      toast({
        title: t("toasts.error"),
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, t]);

  const generatePassword = () => {
    const newPassword = Math.random().toString(36).slice(-10);
    setPassword(newPassword);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Password copied to clipboard.",
      });
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Admins</h1>
      <p className="text-muted-foreground">
        Create and manage supervisor accounts.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
            <CardTitle>Create New Supervisor</CardTitle>
            <CardDescription>
                Enter the details for the new supervisor. A password will be
                generated for them.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form ref={formRef} action={formAction} className="space-y-4">
                <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Dr. Jane Doe"
                    required
                />
                {state.errors?.name && (
                    <p className="text-sm text-destructive">{state.errors.name[0]}</p>
                )}
                </div>
                <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    placeholder="supervisor@example.com"
                    required
                />
                {state.errors?.email && (
                    <p className="text-sm text-destructive">
                    {state.errors.email[0]}
                    </p>
                )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Generated Password</Label>
                    <div className="flex gap-2">
                        <Input
                        id="password"
                        name="password"
                        value={password}
                        readOnly
                        placeholder="Click 'Generate' to create a password"
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(password)} disabled={!password}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={generatePassword}
                        className="w-full mt-2"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate
                    </Button>
                    {state.errors?.password && (
                        <p className="text-sm text-destructive">{state.errors.password[0]}</p>
                    )}
                </div>
                <SubmitButton />
            </form>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Existing Supervisors</CardTitle>
                <CardDescription>A list of all supervisor accounts.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Supervisor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {supervisors.map((supervisor) => (
                            <TableRow key={supervisor.id}>
                                <TableCell>
                                    <div className="font-medium">{supervisor.name}</div>
                                    <div className="text-sm text-muted-foreground">{supervisor.email}</div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
