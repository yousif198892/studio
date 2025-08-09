
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWordsForStudent } from "@/lib/data";
import { getUserByIdFromClient, getStudentsBySupervisorIdFromClient } from "@/lib/client-data";
import { User } from "@/lib/data";
import { KeyRound, Clock, BarChart, CalendarCheck, Trophy, CheckCircle, XCircle } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";

type LearningStats = {
  timeSpentSeconds: number; // total time
  totalWordsReviewed: number;
  reviewedToday: {
    count: number;
    date: string; // YYYY-MM-DD
    timeSpentSeconds: number; // time spent today
    completedTests: string[];
  };
  activityLog: string[]; // ['2024-07-21', '2024-07-22']
};

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

export default function Dashboard() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [stats, setStats] = useState<LearningStats>({
    timeSpentSeconds: 0,
    totalWordsReviewed: 0,
    reviewedToday: { count: 0, date: new Date().toISOString().split('T')[0], timeSpentSeconds: 0, completedTests: [] },
    activityLog: [],
  });
  const [wordsToReviewCount, setWordsToReviewCount] = useState(0);
  const [wordsLearningCount, setWordsLearningCount] = useState(0);
  const [wordsMasteredCount, setWordsMasteredCount] = useState(0);
  const last7Days = getLast7Days();


  useEffect(() => {
    const userId = searchParams?.get('userId') as string;
    if (userId) {
      const foundUser = getUserByIdFromClient(userId);
      setUser(foundUser);
      
      if (foundUser?.role === 'student') {
        const words = getWordsForStudent(userId);
        const toReview = words.filter(w => new Date(w.nextReview) <= new Date() && w.strength >= 0).length;
        const mastered = words.filter(w => w.strength === -1).length;
        const learning = words.length - mastered;

        setWordsToReviewCount(toReview);
        setWordsMasteredCount(mastered);
        setWordsLearningCount(learning);

        const storedStats = localStorage.getItem(`learningStats_${userId}`);
        if (storedStats) {
          const parsedStats: LearningStats = JSON.parse(storedStats);
          const today = new Date().toISOString().split('T')[0];
          
          if (!parsedStats.reviewedToday || parsedStats.reviewedToday.date !== today) {
            parsedStats.reviewedToday = { count: 0, date: today, timeSpentSeconds: 0, completedTests: [] };
          }
           if (typeof parsedStats.reviewedToday.timeSpentSeconds !== 'number') {
            parsedStats.reviewedToday.timeSpentSeconds = 0;
          }
           if (!Array.isArray(parsedStats.reviewedToday.completedTests)) {
            parsedStats.reviewedToday.completedTests = [];
          }
          if (!Array.isArray(parsedStats.activityLog)) {
            parsedStats.activityLog = [];
          }
          
          localStorage.setItem(`learningStats_${userId}`, JSON.stringify(parsedStats));
          setStats(parsedStats);
        } else {
          // Initialize stats if they don't exist
          const initialStats: LearningStats = {
            timeSpentSeconds: 0,
            totalWordsReviewed: 0,
            reviewedToday: { count: 0, date: new Date().toISOString().split('T')[0], timeSpentSeconds: 0, completedTests: [] },
            activityLog: [],
          };
          localStorage.setItem(`learningStats_${userId}`, JSON.stringify(initialStats));
          setStats(initialStats);
        }

      } else if (foundUser?.role === 'supervisor') {
          const studentList = getStudentsBySupervisorIdFromClient(userId);
          setStudents(studentList);
      }
    }
  }, [searchParams]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  if (!user) {
    return <div>{t('dashboard.loading')}</div>;
  }

  if (user?.role === "student") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">{t('dashboard.student.welcome', user.name)}</h1>
        <p className="text-muted-foreground">{t('dashboard.student.description')}</p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.student.progressOverview.timeSpent')}
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(stats.reviewedToday.timeSpentSeconds)}</div>
                <p className="text-xs text-muted-foreground">
                  Today's learning time
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                      Words Reviewed
                  </CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{stats.totalWordsReviewed}</div>
                   <p className="text-xs text-muted-foreground">
                      {wordsLearningCount} in learning queue
                  </p>
              </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Reviewed Today
                    </CardTitle>
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.reviewedToday.count}</div>
                    <p className="text-xs text-muted-foreground">
                      {wordsToReviewCount} words pending
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Mastered Words
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{wordsMasteredCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Keep up the great work!
                    </p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Last 7 Days Activity</CardTitle>
                </CardHeader>
                 <CardContent>
                    <div className="flex justify-around items-center p-4 rounded-lg bg-secondary">
                        {last7Days.map(({ date, dayInitial }) => {
                        const isActive = stats.activityLog.includes(date);
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
                </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.student.reviewTitle')}</CardTitle>
                <CardDescription>{t('dashboard.student.reviewDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                 <Link href={`/learn?userId=${user.id}`}>
                    <Button className="w-full">Start Review Session</Button>
                </Link>
              </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  if (user?.role === "supervisor") {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">{t('dashboard.supervisor.title')}</h1>
            <p className="text-muted-foreground">{t('dashboard.supervisor.welcome', user.name)}</p>
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.supervisor.supervisorId.title')}</CardTitle>
                    <CardDescription>{t('dashboard.supervisor.supervisorId.description')}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <KeyRound className="h-8 w-8 text-primary"/>
                    <Badge variant="outline" className="text-lg py-2 px-4">{user.id}</Badge>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.supervisor.myStudents.title')}</CardTitle>
                    <CardDescription>{t('dashboard.supervisor.myStudents.description')}</CardDescription>
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
  }

  return <div>{t('dashboard.loading')}</div>
}

    