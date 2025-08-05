
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStudentsBySupervisorId, getUserById, User } from "@/lib/data";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import Image from "next/image";
import { useLanguage } from "@/hooks/use-language";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
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


export default function StudentsPage() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { toast } = useToast();

  const userId = searchParams?.get('userId') as string || "sup1";
  const user = getUserById(userId);
  const [students, setStudents] = useState<User[]>([]);
  
  useEffect(() => {
    const studentList = getStudentsBySupervisorId(userId);
    setStudents(studentList);
  }, [userId])

  const handleDelete = (studentId: string) => {
    try {
      // Remove from component state
      setStudents(prev => prev.filter(s => s.id !== studentId));
      
      // Get all users to find the student to "remove"
      let allUsers: User[] = JSON.parse(localStorage.getItem("combinedUsers") || "[]");
      const studentIndex = allUsers.findIndex(u => u.id === studentId);

      if (studentIndex > -1) {
        // Instead of deleting, just detach from the supervisor
        allUsers[studentIndex].supervisorId = undefined;
        
        // Save the updated user list back to localStorage
        localStorage.setItem("combinedUsers", JSON.stringify(allUsers));
      }


      // Optional: Also clear student's specific progress
      localStorage.removeItem(`wordProgress_${studentId}`);
      localStorage.removeItem(`learningStats_${studentId}`);

      toast({
        title: "Success!",
        description: "Student has been removed.",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Could not remove the student.",
        variant: "destructive",
      });
    }
  }


  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">{t('studentsPage.title')}</h1>
        <p className="text-muted-foreground">{t('studentsPage.description', user?.name || '')}</p>
        <Card>
            <CardHeader>
                <CardTitle>{t('studentsPage.allStudents.title')}</CardTitle>
                <CardDescription>{t('studentsPage.allStudents.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                            <span className="sr-only">Image</span>
                        </TableHead>
                        <TableHead>{t('dashboard.supervisor.myStudents.name')}</TableHead>
                        <TableHead>{t('dashboard.supervisor.myStudents.email')}</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell className="hidden sm:table-cell">
                                    <Image
                                    alt="Student avatar"
                                    className="aspect-square rounded-full object-cover"
                                    height="64"
                                    src={student.avatar}
                                    width="64"
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{student.name}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell className="text-right">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete Student</span>
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently remove {student.name} from your supervision. Their account will not be deleted, but they will lose access to your words and their progress will be reset.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(student.id)}>
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
  )
}
