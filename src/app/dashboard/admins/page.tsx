

"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Trash2, Ban, Clock, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useToast } from "@/hooks/use-toast";
import { User, getAllUsers, updateUserDB, deleteUserDB } from "@/lib/data";
import { CreateSupervisorForm } from "@/components/create-supervisor-form";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatDistanceToNowStrict, isPast, add } from "date-fns";


export default function AdminsPage() {
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const { toast } = useToast();

  const fetchSupervisors = useCallback(async () => {
    const allUsers = await getAllUsers();
    if (Array.isArray(allUsers)) {
      const otherSupervisors = allUsers.filter(
        (u) => u.role === "supervisor" && !u.isMainAdmin
      );
      setSupervisors(otherSupervisors);
    }
  }, []);

  useEffect(() => {
    fetchSupervisors();
  }, [fetchSupervisors]);

  const handleSupervisorAdded = (newUser: User) => {
    setSupervisors((prev) => [...prev, newUser]);
  };
  
  const handleToggleSuspension = async (userToToggle: User) => {
    const updatedUser = {
      ...userToToggle,
      isSuspended: !userToToggle.isSuspended,
    };
    
    try {
        await updateUserDB(updatedUser);
        setSupervisors(supervisors.map(s => s.id === updatedUser.id ? updatedUser : s));
        toast({
            title: "Success!",
            description: `Supervisor ${userToToggle.name} has been ${updatedUser.isSuspended ? 'suspended' : 'unsuspended'}.`
        });
    } catch(e) {
        toast({ title: "Error", description: "Could not update user.", variant: "destructive" });
    }
  }

  const handleUpdateTrial = async (userId: string, action: 'extend1' | 'extend2' | 'convert') => {
      const supervisor = supervisors.find(s => s.id === userId);
      if (!supervisor) return;

      let updatedUser: User;
      let toastMessage = "";

      switch (action) {
          case 'extend1':
              updatedUser = { ...supervisor, trialExpiresAt: add(new Date(), { months: 1 }).toISOString() };
              toastMessage = `Trial for ${supervisor.name} extended by 1 month.`;
              break;
          case 'extend2':
              updatedUser = { ...supervisor, trialExpiresAt: add(new Date(), { months: 2 }).toISOString() };
              toastMessage = `Trial for ${supervisor.name} extended by 2 months.`;
              break;
          case 'convert':
              updatedUser = { ...supervisor, trialExpiresAt: undefined };
              toastMessage = `${supervisor.name} has been converted to a full account.`;
              break;
      }
      
      try {
        await updateUserDB(updatedUser);
        setSupervisors(supervisors.map(s => s.id === updatedUser.id ? updatedUser : s));
        toast({ title: "Success!", description: toastMessage });
      } catch (e) {
         toast({ title: "Error", description: "Could not update trial status.", variant: "destructive" });
      }
  }


  const handleDelete = async (userId: string) => {
    try {
        await deleteUserDB(userId);
        const updatedSupervisors = supervisors.filter((s) => s.id !== userId);
        setSupervisors(updatedSupervisors);
        toast({
          title: "Success!",
          description: "Supervisor deleted successfully.",
        });
    } catch(e) {
        toast({ title: "Error", description: "Could not delete supervisor.", variant: "destructive" });
    }
  };

  const getStatus = (supervisor: User) => {
      const isTrial = supervisor.trialExpiresAt;
      const trialDate = isTrial ? new Date(supervisor.trialExpiresAt!) : null;
      const trialExpired = trialDate && isPast(trialDate);

      if (supervisor.isSuspended) {
          return (
             <span className="px-2 py-1 text-xs font-medium text-destructive-foreground bg-destructive rounded-full">Suspended</span>
          );
      }
       if (trialExpired) {
          return (
             <span className="px-2 py-1 text-xs font-medium text-destructive-foreground bg-destructive rounded-full">Trial Expired</span>
          );
      }
      if (isTrial && trialDate) {
          return (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Trial</span>
                <span className="text-xs text-muted-foreground">
                    ({formatDistanceToNowStrict(trialDate, { addSuffix: true })} left)
                </span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Manage Trial</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Manage Trial</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUpdateTrial(supervisor.id, 'extend1')}>Extend Trial by 1 Month</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateTrial(supervisor.id, 'extend2')}>Extend Trial by 2 Months</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateTrial(supervisor.id, 'convert')}>Convert to Full Account</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
          )
      }
      return (
         <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Active</span>
      )
  }

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Supervisor</CardTitle>
            <CardDescription>
              Create a new account with supervisor privileges. You can also create temporary trial accounts.
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
                      {getStatus(supervisor)}
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
