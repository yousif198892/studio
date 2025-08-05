

"use client";

import { createSupervisor } from "@/lib/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Copy, Trash2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { User, getAllUsers } from "@/lib/data";


function CreateSupervisorButton() {
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
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [supervisors, setSupervisors] = useState<User[]>([]);

  useEffect(() => {
    const allUsers = getAllUsers();
    const allSupervisors = allUsers.filter(u => u.role === 'supervisor' && !u.isMainAdmin);
    setSupervisors(allSupervisors);
  }, []);

  const handleFormAction = async (formData: FormData) => {
    const result = await createSupervisor(null, formData);

    if (result.success && result.newUser) {
       toast({
        title: t("toasts.success"),
        description: "Supervisor account created successfully!",
      });
      
      try {
        const existingUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = [...existingUsers, result.newUser];
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        setSupervisors(prev => [...prev, result.newUser!]);
      } catch(e) {
        console.error("Could not save new supervisor to localStorage", e);
      }

      formRef.current?.reset();
      setPassword("");
    } else if (result.message) {
       toast({
        title: t("toasts.error"),
        description: result.message,
        variant: "destructive",
      });
    }
  }

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

  const handleDelete = (supervisorId: string) => {
    const updatedSupervisors = supervisors.filter(s => s.id !== supervisorId);
    setSupervisors(updatedSupervisors);

    try {
        let allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        allUsers = allUsers.filter(u => u.id !== supervisorId);
        localStorage.setItem('users', JSON.stringify(allUsers));

        let combinedUsers: User[] = JSON.parse(localStorage.getItem('combinedUsers') || '[]');
        combinedUsers = combinedUsers.filter(u => u.id !== supervisorId);
        localStorage.setItem('combinedUsers', JSON.stringify(combinedUsers));

        toast({
            title: "Success",
            description: "Supervisor deleted successfully.",
        });
    } catch(e) {
        console.error("Failed to delete supervisor from localStorage", e);
        toast({
            title: "Error",
            description: "Could not delete supervisor.",
            variant: "destructive"
        });
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Admins</h1>
      <p className="text-muted-foreground">
        Create and manage supervisor accounts.
      </p>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                <CardTitle>Create New Supervisor</CardTitle>
                <CardDescription>
                    Enter the details for the new supervisor. A password will be
                    generated for them.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <form ref={formRef} action={handleFormAction} className="space-y-4">
                    <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Full Name"
                        required
                    />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        placeholder="supervisor@example.com"
                        required
                    />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Generated Password</Label>
                        <div className="flex gap-2">
                            <Input
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
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
                    </div>
                    <CreateSupervisorButton />
                </form>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Existing Supervisors</CardTitle>
                    <CardDescription>
                        A list of all other supervisors in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {supervisors.map(supervisor => (
                                <TableRow key={supervisor.id}>
                                    <TableCell>{supervisor.name}</TableCell>
                                    <TableCell>{supervisor.email}</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon">
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Are you absolutely sure?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently
                                                    delete the supervisor account for {supervisor.name}.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(supervisor.id)}
                                                >
                                                    Continue
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
