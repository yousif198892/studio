
"use client";

import { useEffect, useState } from "react";
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
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { getAllUsers, User } from "@/lib/data";
import { CreateSupervisorForm } from "@/components/create-supervisor-form";
import Image from "next/image";

export default function AdminsPage() {
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const allUsers = getAllUsers();
    const otherSupervisors = allUsers.filter(
      (u) => u.role === "supervisor" && !u.isMainAdmin
    );
    setSupervisors(otherSupervisors);
  }, []);

  const handleSupervisorAdded = (newUser: User) => {
    setSupervisors((prev) => [...prev, newUser]);
  };

  const handleDelete = (userId: string) => {
    // In a real app, this would be a server action.
    const updatedSupervisors = supervisors.filter((s) => s.id !== userId);
    setSupervisors(updatedSupervisors);

    try {
      // Remove from 'users' in localStorage if they were created dynamically
      const storedUsers: User[] = JSON.parse(
        localStorage.getItem("users") || "[]"
      );
      const updatedStoredUsers = storedUsers.filter((u) => u.id !== userId);
      localStorage.setItem("users", JSON.stringify(updatedStoredUsers));

      // Also update 'combinedUsers' for consistency
      const combinedUsers: User[] = JSON.parse(
        localStorage.getItem("combinedUsers") || "[]"
      );
      const updatedCombinedUsers = combinedUsers.filter(
        (u) => u.id !== userId
      );
      localStorage.setItem(
        "combinedUsers",
        JSON.stringify(updatedCombinedUsers)
      );

      toast({
        title: "Success!",
        description: "Supervisor deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete supervisor from localStorage", error);
      toast({
        title: "Error",
        description: "Could not delete the supervisor.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Admins</h1>
      <p className="text-muted-foreground">
        Create and manage supervisor accounts.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Existing Supervisors</CardTitle>
              <CardDescription>
                A list of all non-main supervisor accounts.
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
                  {supervisors.map((supervisor) => (
                    <TableRow key={supervisor.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <Image src={supervisor.avatar} alt={supervisor.name} width={32} height={32} className="rounded-full" />
                            <span className="font-medium">{supervisor.name}</span>
                        </div>
                      </TableCell>
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
                                delete the account for {supervisor.name}.
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
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create New Supervisor</CardTitle>
              <CardDescription>
                Create a new account with supervisor privileges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateSupervisorForm onSupervisorAdded={handleSupervisorAdded} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
