
"use client"

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
import { getWordsForStudent, getUserById, getStudentsBySupervisorId } from "@/lib/firestore";
import { type Word, type User } from "@/lib/data";
import { KeyRound, Clock, BarChart, CalendarCheck, Trophy, CheckCircle, XCircle, SpellCheck, ChevronDown, Star, Loader2 } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { format, subDays, formatDistanceToNowStrict, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SpellingPracticeCard } from "@/components/spelling-practice-card";
import { type LearningStats, updateXp, XP_AMOUNTS, getStatsForUser } from "@/lib/stats.tsx";
import { useToast } from "@/hooks/use-toast";
import { XpToast } from "@/components/xp-toast";
import { WordProgress } from "@/lib/storage";

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

export default function Dashboard() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [wordsToReviewCount, setWordsToReviewCount] = useState(0);
  const [wordsLearningCount, setWordsLearningCount] = useState(0);
  const [wordsMasteredCount, setWordsMasteredCount] = useState(0);
  
  const [allStudentWords, setAllStudentWords] = useState<(Word & WordProgress)[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  
  const last7Days = getLast7Days();

  const fetchData = useCallback(async () => {
    if (userId) {
      setLoading(true);
      const foundUser = await getUserById(userId);
      setUser(foundUser || null);
      
      if (foundUser?.role === 'student') {
        const words = await getWordsForStudent(userId);
        setAllStudentWords(words);

        const toReview = words.filter(w => new Date(w.nextReview) <= new Date() && w.strength >= 0).length;
        const mastered = words.filter(w => w.strength === -1).length;
        const learning = words.length - mastered;

        setWordsToReviewCount(toReview);
        setWordsMasteredCount(mastered);
        setWordsLearningCount(learning);
        
        let currentStats = await getStatsForUser(userId);
        
        // Daily Login XP Check
        const { updated, amount } = await updateXp(userId, 'daily_login');
        if (updated) {
            toast({
                description: <XpToast event="daily_login" amount={amount} />,
                duration: 3000,
            });
            // Refetch stats to include the new XP from daily login
            currentStats = await getStatsForUser(userId);
        }
        
        setStats(currentStats);

      } else if (foundUser?.role === 'supervisor') {
          const studentList = await getStudentsBySupervisorId(userId);
          setStudents(studentList);
      }
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const availableUnits = useMemo(() => {
    return Array.from(new Set(allStudentWords.map(w => w.unit).filter(Boolean)));
  }, [allStudentWords]);
  
  const lessonsForSelectedUnit = useMemo(() => {
    if (!selectedUnit) return [];
    return Array.from(new Set(allStudentWords.filter(w => w.unit === selectedUnit).map(w => w.lesson).filter(Boolean)));
  }, [allStudentWords, selectedUnit]);
  
  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    setSelectedLesson(null);
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  if (loading || !user || (user.role === 'student' && !stats)) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">{t('dashboard.loading')}</p>
        </div>
    );
  }

  const isReviewButtonDisabled = !selectedUnit || !selectedLesson;

  if (user?.role === "student") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">{t('dashboard.student.welcome', user.name)}</h1>
        <p className="text-muted-foreground">{t('dashboard.student.description')}</p>
        
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('dashboard.student.reviewTitle')}
                    </CardTitle>
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{wordsToReviewCount}</div>
                    <p className="text-xs text-muted-foreground pb-2">{t('dashboard.student.reviewDescription')}</p>
                     <div className="space-y-2">
                        <Select onValueChange={handleUnitChange} disabled={availableUnits.length === 0}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableUnits.map(unit => (
                                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(value) => setSelectedLesson(value)} disabled={!selectedUnit}>
                             <SelectTrigger>
                                <SelectValue placeholder="Select a Lesson" />
                            </SelectTrigger>
                            <SelectContent>
                                {lessonsForSelectedUnit.map(lesson => (
                                    <SelectItem key={lesson} value={lesson}>{lesson}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isReviewButtonDisabled ? (
                            <Button className="w-full" disabled>
                                {t('dashboard.student.startReview')}
                            </Button>
                        ) : (
                            <Button asChild className="w-full">
                                <Link href={`/learn?userId=${user.id}&unit=${encodeURIComponent(selectedUnit || '')}&lesson=${encodeURIComponent(selectedLesson || '')}`}>
                                    {t('dashboard.student.startReview')}
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                         Total XP
                    </CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-500">{stats.xp.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('dashboard.student.xpDescription')}
                    </p>
                </CardContent>
            </Card>
            <Link href={`/dashboard/learning-words?userId=${user.id}`} className="hover:opacity-90 transition-opacity">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                         {t('dashboard.student.progressOverview.reviewedToday')}
                    </CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.reviewedToday.count}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('dashboard.student.learningQueue', wordsLearningCount)}
                    </p>
                </CardContent>
                </Card>
            </Link>
            <Link href={`/dashboard/mastered-words?userId=${user.id}`} className="hover:opacity-90 transition-opacity">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                           {t('dashboard.student.progressOverview.masteredWords')}
                        </CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{wordsMasteredCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {t('dashboard.student.greatWork')}
                        </p>
                    </CardContent>
                </Card>
            </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.student.progressOverview.title')}</CardTitle>
            <CardDescription>{t('dashboard.student.progressOverview.description')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
               <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
                  <Clock className="h-8 w-8 text-primary mb-2"/>
                  <p className="text-2xl font-bold">{formatTime(stats.reviewedToday.timeSpentSeconds)}</p>
                  <p className="text-sm text-muted-foreground text-center">{t('dashboard.student.progressOverview.timeSpentToday')}</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
                  <BarChart className="h-8 w-8 text-primary mb-2"/>
                  <p className="text-2xl font-bold">{stats.totalWordsReviewed}</p>
                  <p className="text-sm text-muted-foreground text-center">{t('dashboard.student.progressOverview.totalWordsReviewed')}</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
                  <CalendarCheck className="h-8 w-8 text-primary mb-2"/>
                  <p className="text-2xl font-bold">{stats.reviewedToday.count}</p>
                  <p className="text-sm text-muted-foreground text-center">{t('dashboard.student.progressOverview.reviewedToday')}</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
                  <Trophy className="h-8 w-8 text-primary mb-2"/>
                  <p className="text-2xl font-bold">{wordsMasteredCount}</p>
                  <p className="text-sm text-muted-foreground text-center">{t('dashboard.student.progressOverview.masteredWords')}</p>
              </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-5">
             <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>{t('dashboard.student.activity.title')}</CardTitle>
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
             <Card className="lg:col-span-2">
                 <CardHeader>
                   <CardTitle>{t('dashboard.student.tests.title')}</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                     {allTests.map(testName => (
                       <div key={testName} className="flex items-center gap-2">
                         <Checkbox 
                           id={`test-${testName}`} 
                           checked={stats.reviewedToday.completedTests.includes(testName)}
                           disabled 
                         />
                         <label
                           htmlFor={`test-${testName}`}
                           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                         >
                           {testName}
                         </label>
                       </div>
                     ))}
                 </CardContent>
             </Card>
         </div>

         <SpellingPracticeCard allWords={allStudentWords} userId={user.id} />
       </div>
     );
   }

   if (user?.role === "supervisor") {
     const isTrial = user.trialExpiresAt && !isPast(new Date(user.trialExpiresAt));
     
     return (
         <div className="space-y-6">
             <h1 className="text-3xl font-bold font-headline">{t('dashboard.supervisor.title')}</h1>
             <p className="text-muted-foreground">{t('dashboard.supervisor.welcome', user.name)}</p>

             {isTrial && user.trialExpiresAt && (
                 <Alert>
                     <Clock className="h-4 w-4" />
                     <AlertTitle>Trial Account</AlertTitle>
                     <AlertDescription>
                         Your trial period expires {formatDistanceToNowStrict(new Date(user.trialExpiresAt), { addSuffix: true })}.
                     </AlertDescription>
                 </Alert>
             )}

             <Card>
                 <CardHeader>
                     <CardTitle>{t('dashboard.supervisor.supervisorId.title')}</CardTitle>
                     <CardDescription>{t('dashboard.supervisor.supervisorId.description')}</CardDescription>
                 </CardHeader>
                 <CardContent className="flex items-center gap-4">
                     <KeyRound className="h-8 w-8 text-primary"/>
                     <Badge variant="outline" className="text-lg py-2 px-4">{user.shortId}</Badge>
                 </CardContent>
             </Card>
             <Card>
                 <CardHeader>
                     <CardTitle>{t('dashboard.supervisor.myStudents.title')}</CardTitle>
                     <CardDescription>{t('dashboard.supervisor.myStudents.description')}</CardDescription>
                 </CardHeader>
                 <CardContent>
                    {loading ? (
                         <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                         </div>
                    ) : (
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
                                 {students.length > 0 ? (
                                    students.map((student) => (
                                     <TableRow key={student.id}>
                                         <TableCell className="hidden sm:table-cell">
                                             <Image
                                             alt="Student avatar"
                                             className="aspect-square rounded-full object-contain"
                                             height="64"
                                             src={student.avatar}
                                             width="64"
                                             />
                                         </TableCell>
                                         <TableCell className="font-medium">{student.name}</TableCell>
                                         <TableCell>{student.email}</TableCell>
                                     </TableRow>
                                     ))
                                 ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">
                                            No students have registered with your ID yet.
                                        </TableCell>
                                    </TableRow>
                                 )}
                             </TableBody>
                         </Table>
                    )}
                 </CardContent>
             </Card>
         </div>
     )
   }

   return <div>{t('dashboard.loading')}</div>
 }

    