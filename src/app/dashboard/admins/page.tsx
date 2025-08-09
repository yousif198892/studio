

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
import { User, getAllUsers } from "@/lib/data";
import { CreateSupervisorForm } from "@/components/create-supervisor-form";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";


export default function AdminsPage() {
  const searchParams = useSearchParams();
  const mainAdminId = searchParams.get("userId");
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const { toast } = useToast();

  const fetchSupervisors = () => {
    const allUsers = getAllUsers();
    const otherSupervisors = allUsers.filter(
      (u) => u.role === "supervisor" && !u.isMainAdmin
    );
    setSupervisors(otherSupervisors);
  }

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const handleSupervisorAdded = (newUser: User) => {
    setSupervisors((prev) => [...prev, newUser]);
  };
  
  const handleToggleSuspension = (userToToggle: User) => {
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => u.id === userToToggle.id);
    
    if (userIndex === -1) {
        toast({ title: "Error", description: "Could not find user to update.", variant: "destructive" });
        return;
    }

    const updatedUser = {
      ...userToToggle,
      isSuspended: !userToToggle.isSuspended,
    };
    
    // In a real app, this would be a server action.
    // For now, we update the user in our "database" (localStorage).
    const storedUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const storedUserIndex = storedUsers.findIndex(u => u.id === userToToggle.id);
    
    if (storedUserIndex > -1) {
        storedUsers[storedUserIndex] = updatedUser;
        localStorage.setItem("users", JSON.stringify(storedUsers));
    }

    // Update state
    setSupervisors(supervisors.map(s => s.id === updatedUser.id ? updatedUser : s));

    toast({
        title: "Success!",
        description: `Supervisor ${userToToggle.name} has been ${updatedUser.isSuspended ? 'suspended' : 'unsuspended'}.`
    });
  }

  const handleDelete = (userId: string) => {
    // In a real app, this would be a server action.
    let storedUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    storedUsers = storedUsers.filter((u) => u.id !== userId);
    localStorage.setItem("users", JSON.stringify(storedUsers));
    
    const updatedSupervisors = supervisors.filter((s) => s.id !== userId);
    setSupervisors(updatedSupervisors);

    toast({
      title: "Success!",
      description: "Supervisor deleted successfully.",
    });
  };

  return (
    <div className="space-y-6">
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
