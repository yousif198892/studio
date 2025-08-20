

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type User } from "@/lib/data";
import { getUserById, getStudentsBySupervisorId, updateUserDB, getWordsForStudent } from "@/lib/firestore";
import Image from "next/image";
import { useLanguage } from "@/hooks/use-language";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, BarChart, CalendarCheck, CheckCircle, Clock, Star, Trophy, XCircle, MessageSquare } from "lucide-react";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format, subDays } from "date-fns";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { type LearningStats, getStatsForUser } from "@/lib/stats";

type StudentWithStats = User & {
    stats: LearningStats;
    wordsLearningCount: number;
    wordsMasteredCount: number;
}

const getLast7Days = () => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = subDays(new Date(), i);
    days.push({
      date: format(day, "yyyy-MM-dd"),
      dayInitial: format(day, "E")[0], // 'M', 'T', 'W', etc.
    });
  }
  return days.reverse();
};

const allTests = ["Present Simple", "Past Simple", "Present Continuous", "Comprehensive"];


export default function StudentsPage() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const last7Days = getLast7Days();
  const userId = searchParams.get('userId');
  
  const fetchData = useCallback(async () => {
    if (userId) {
        const currentUser = await getUserById(userId);
        setUser(currentUser || null);
        if (currentUser) {
            const studentList = await getStudentsBySupervisorId(userId);

            const studentsWithStatsPromises = studentList.map(async (student) => {
                const stats = await getStatsForUser(student.id);
                const words = await getWordsForStudent(student.id);
                const mastered = words.filter(w => w.strength === -1).length;
                const learning = words.length - mastered;

                return {
                    ...student,
                    stats,
                    wordsLearningCount: learning,
                    wordsMasteredCount: mastered,
                };
            });
            const studentsWithStats = await Promise.all(studentsWithStatsPromises);
            setStudents(studentsWithStats);
        }
    }
  }, [userId]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData])

  const handleDelete = async (studentId: string) => {
    try {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      
      const studentToUpdate = await getUserById(studentId);

      if (studentToUpdate) {
        studentToUpdate.supervisorId = undefined;
        await updateUserDB(studentToUpdate);
         
        toast({
            title: "Success!",
            description: "Student has been removed from your list.",
        });
      } else {
        throw new Error("Student not found.");
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Could not remove the student.",
        variant: "destructive",
      });
      // Re-fetch data to revert UI change on error
      fetchData();
    }
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };


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
                {students.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                       {students.map((student) => (
                           <AccordionItem value={student.id} key={student.id}>
                               <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                                    <div className="flex items-center gap-4 py-2 flex-1">
                                        <Image
                                            alt="Student avatar"
                                            className="aspect-square rounded-full object-contain"
                                            height="48"
                                            src={student.avatar}
                                            width="48"
                                        />
                                        <div className="text-left">
                                            <div className="font-medium">{student.name}</div>
                                            <div className="text-sm text-muted-foreground">{student.email}</div>
                                        </div>
                                    </div>
                                    <Button asChild variant="ghost" size="icon" className="mr-4" onClick={(e) => e.stopPropagation()}>
                                        <Link href={`/dashboard/chat?userId=${userId}&contactId=${student.id}`}>
                                            <MessageSquare className="h-5 w-5"/>
                                        </Link>
                                    </Button>
                               </AccordionTrigger>
                               <AccordionContent className="p-4 space-y-4">
                                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
                                          <Clock className="h-8 w-8 text-primary mb-2"/>
                                          <p className="text-2xl font-bold">{formatTime(student.stats.reviewedToday.timeSpentSeconds)}</p>
                                          <p className="text-sm text-muted-foreground">{t('dashboard.student.progressOverview.timeSpent')}</p>
                                      </div>
                                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
                                          <BarChart className="h-8 w-8 text-primary mb-2"/>
                                          <p className="text-2xl font-bold">{student.stats.totalWordsReviewed}</p>
                                          <p className="text-sm text-muted-foreground">{t('dashboard.student.progressOverview.wordsReviewed')}</p>
                                      </div>
                                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
                                          <CalendarCheck className="h-8 w-8 text-primary mb-2"/>
                                          <p className="text-2xl font-bold">{student.stats.reviewedToday.count}</p>
                                          <p className="text-sm text-muted-foreground">{t('dashboard.student.progressOverview.reviewedToday')}</p>
                                      </div>
                                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
                                          <Trophy className="h-8 w-8 text-primary mb-2"/>
                                          <p className="text-2xl font-bold">{student.wordsMasteredCount}</p>
                                          <p className="text-sm text-muted-foreground">{t('dashboard.student.progressOverview.masteredWords')}</p>
                                      </div>
                                   </div>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-md font-semibold mb-2 text-center">Last 7 Days Activity</h3>
                                            <div className="flex justify-around items-center p-4 rounded-lg bg-secondary">
                                                {last7Days.map(({ date, dayInitial }) => {
                                                const isActive = student.stats.activityLog.includes(date);
                                                return (
                                                    <div key={date} className="flex flex-col items-center gap-2">
                                                    <span className="text-sm font-medium text-muted-foreground">{dayInitial}</span>
                                                    {isActive ? (
                                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-6 w-6 text-muted-foreground/50" />
                                                    )}
                                                    </div>
                                                );
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                             <h3 className="text-md font-semibold mb-2 text-center">Tests Completed Today</h3>
                                             <div className="p-4 rounded-lg bg-secondary space-y-3">
                                                {allTests.map(testName => (
                                                <div key={testName} className="flex items-center gap-2">
                                                    <Checkbox 
                                                    id={`test-${student.id}-${testName}`}
                                                    checked={student.stats.reviewedToday.completedTests.includes(testName)}
                                                    disabled 
                                                    />
                                                    <label
                                                    htmlFor={`test-${student.id}-${testName}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                    {testName}
                                                    </label>
                                                </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove Student
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
                                    </div>
                               </AccordionContent>
                           </AccordionItem>
                       ))}
                    </Accordion>
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                        No students have registered with your ID yet.
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  )
}
