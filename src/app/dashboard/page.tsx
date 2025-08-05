
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStudentsBySupervisorId, getWordsForStudent, getUserById, User } from "@/lib/data";
import { BookOpen, Target, Users, KeyRound, Trophy, Clock, BarChart, CalendarCheck, Star, BrainCircuit, GraduationCap } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

type LearningStats = {
  timeSpentSeconds: number;
  totalWordsReviewed: number;
  reviewedToday: {
    count: number;
    date: string; // YYYY-MM-DD
  };
};

export default function Dashboard() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<LearningStats>({
    timeSpentSeconds: 0,
    totalWordsReviewed: 0,
    reviewedToday: { count: 0, date: new Date().toISOString().split('T')[0] },
  });

  useEffect(() => {
    const userId = searchParams?.get('userId') as string;
    if (userId) {
      const foundUser = getUserById(userId);
      setUser(foundUser);

      // Load stats from localStorage
      const storedStats = localStorage.getItem(`learningStats_${userId}`);
      if (storedStats) {
        const parsedStats: LearningStats = JSON.parse(storedStats);
        const today = new Date().toISOString().split('T')[0];
        // Reset 'reviewed today' if the date is old
        if (parsedStats.reviewedToday.date !== today) {
          parsedStats.reviewedToday = { count: 0, date: today };
          localStorage.setItem(`learningStats_${userId}`, JSON.stringify(parsedStats));
        }
        setStats(parsedStats);
      } else {
        // Initialize if no stats are found
        const initialStats: LearningStats = {
          timeSpentSeconds: 0,
          totalWordsReviewed: 0,
          reviewedToday: { count: 0, date: new Date().toISOString().split('T')[0] },
        };
        localStorage.setItem(`learningStats_${userId}`, JSON.stringify(initialStats));
        setStats(initialStats);
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
    const words = getWordsForStudent(user.id);
    const wordsToReview = words.filter(w => new Date(w.nextReview) <= new Date() && w.strength >= 0).length;
    const wordsLearned = words.filter(w => w.strength >= 0).length;
    const wordsMastered = words.filter(w => w.strength === -1).length;

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">{t('dashboard.student.welcome', user.name)}</h1>
        <p className="text-muted-foreground">{t('dashboard.student.description')}</p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Cards removed as per request */}
        </div>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.student.progressOverview.title')}</CardTitle>
            <CardDescription>{t('dashboard.student.progressOverview.description')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
                  <Clock className="h-8 w-8 text-primary mb-2"/>
                  <p className="text-2xl font-bold">{formatTime(stats.timeSpentSeconds)}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.student.progressOverview.timeSpent')}</p>
              </div>
               <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
                  <BarChart className="h-8 w-8 text-primary mb-2"/>
                  <p className="text-2xl font-bold">{stats.totalWordsReviewed}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.student.progressOverview.wordsReviewed')}</p>
              </div>
               <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
                  <CalendarCheck className="h-8 w-8 text-primary mb-2"/>
                  <p className="text-2xl font-bold">{stats.reviewedToday.count}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.student.progressOverview.reviewedToday')}</p>
              </div>
               <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
                  <Star className="h-8 w-8 text-primary mb-2"/>
                  <p className="text-2xl font-bold">{wordsMastered}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.student.progressOverview.masteredWords')}</p>
              </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role === "supervisor") {
    const students = getStudentsBySupervisorId(user.id);
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
