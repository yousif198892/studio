

"use client";

import { useEffect, useState, useActionState } from "react";
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
import { Trash2, Ban } from "lucide-react";
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
import { toggleSupervisorSuspension } from "@/lib/actions";
import { cn } from "@/lib/utils";


export default function AdminsPage() {
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const { toast } = useToast();

  const [_, toggleSuspensionAction] = useActionState(toggleSupervisorSuspension, { success: false, message: ""});

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
  
  const handleToggleSuspension = async (user: User) => {
    const formData = new FormData();
    formData.append('userId', user.id);
    const result = await toggleSupervisorSuspension(null, formData);

    if (result.success && result.updatedUser) {
        setSupervisors(supervisors.map(s => s.id === user.id ? result.updatedUser : s));
        
        // Update localStorage
        try {
          const storedUsers: User[] = JSON.parse(localStorage.getItem('combinedUsers') || '[]');
          const updatedUsers = storedUsers.map(u => u.id === result.updatedUser.id ? result.updatedUser : u);
          localStorage.setItem('combinedUsers', JSON.stringify(updatedUsers));
        } catch (error) {
            console.error("Failed to update user in localStorage", error);
        }

        toast({
            title: "Success!",
            description: `Supervisor ${user.name} has been ${result.updatedUser.isSuspended ? 'suspended' : 'unsuspended'}.`
        });
    } else {
         toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
        });
    }
  }


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
      <div className="grid grid-cols-1 gap-6">
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
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supervisors.map((supervisor) => (
                  <TableRow key={supervisor.id} className={cn(supervisor.isSuspended && "bg-muted/50")}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          src={supervisor.avatar}
                          alt={supervisor.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-medium">{supervisor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {supervisor.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {supervisor.isSuspended ? (
                          <span className="px-2 py-1 text-xs font-medium text-destructive-foreground bg-destructive rounded-full">Suspended</span>
                      ) : (
                          <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Active</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant={supervisor.isSuspended ? "outline" : "secondary"} size="icon">
                                <Ban className="h-4 w-4" />
                                <span className="sr-only">{supervisor.isSuspended ? "Unsuspend" : "Suspend"}</span>
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  This will {supervisor.isSuspended ? "reinstate" : "suspend"} the account for {supervisor.name}. They will {supervisor.isSuspended ? "be able to" : "no longer be able to"} log in.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleToggleSuspension(supervisor)}>
                                  Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

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
    </div>
  );
}
