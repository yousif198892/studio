
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { type User } from "@/lib/data";
import { getUserById, getStudentsBySupervisorId } from "@/lib/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Trophy } from "lucide-react";
import { type LearningStats, getStatsForUser, type LastWeekWinner, updateLearningStats } from "@/lib/stats.tsx";
import { cn } from "@/lib/utils";
import { endOfWeek, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useLanguage } from "@/hooks/use-language";
import { WinnersCircle } from "@/components/winners-circle";

type ClassmateWithXp = User & {
    xp: number;
};

export default function ChampionPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");
    const [leaderboard, setLeaderboard] = useState<ClassmateWithXp[]>([]);
    const [loading, setLoading] = useState(true);
    const [weekEndsIn, setWeekEndsIn] = useState("");
    const { t, language } = useLanguage();
    const [lastWeekResults, setLastWeekResults] = useState<LastWeekWinner[] | null>(null);
    const [showWinners, setShowWinners] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            if (userId) {
                const currentUser = await getUserById(userId);
                 const stats = await getStatsForUser(userId);

                if (!stats.hasSeenLastWeekResults && stats.lastWeek?.winners) {
                    setLastWeekResults(stats.lastWeek.winners);
                    setShowWinners(true);
                }

                if (currentUser && currentUser.supervisorId) {
                    const allStudents = await getStudentsBySupervisorId(currentUser.supervisorId);
                    
                    const userMap = new Map<string, User>();
                    allStudents.forEach(student => userMap.set(student.id, student));
                    if(currentUser) {
                        userMap.set(currentUser.id, currentUser);
                    }

                    const leaderboardDataPromises = Array.from(userMap.values()).map(async (student) => {
                         const studentStats = await getStatsForUser(student.id);
                         return {
                             ...student,
                             xp: studentStats.xp || 0
                         }
                    });

                    const leaderboardData = await Promise.all(leaderboardDataPromises);
                    
                    leaderboardData.sort((a, b) => b.xp - a.xp);
                    setLeaderboard(leaderboardData);
                }
                 setLoading(false);
            }
        };
        fetchData();

        const endOfThisWeek = endOfWeek(new Date(), { weekStartsOn: 1 });
        const locale = language === 'ar' ? { locale: ar } : {};
        setWeekEndsIn(formatDistanceToNow(endOfThisWeek, { addSuffix: true, ...locale }));

        const timer = setInterval(() => {
             setWeekEndsIn(formatDistanceToNow(endOfThisWeek, { addSuffix: true, ...locale }));
        }, 60000); // Update every minute

        return () => clearInterval(timer);
        
    }, [userId, language]);
    
    const handleCloseWinnersCircle = () => {
        setShowWinners(false);
        if (userId) {
            updateLearningStats({ userId, markAsSeen: true });
        }
    }


    const getRankContent = (rank: number) => {
        if (rank === 0) return <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-400" />;
        if (rank === 1) return <Trophy className="w-6 h-6 text-gray-400 fill-gray-300" />;
        if (rank === 2) return <Trophy className="w-6 h-6 text-orange-600 fill-orange-400" />;
        return <span className="text-lg font-bold w-6 text-center">{rank + 1}</span>;
    }
    
    if (loading) {
        return <div>{t('championPage.loading')}</div>;
    }

    return (
        <div className="space-y-6">
            {lastWeekResults && userId && (
                 <WinnersCircle 
                    isOpen={showWinners}
                    onClose={handleCloseWinnersCircle}
                    winners={lastWeekResults}
                    currentUserId={userId}
                />
            )}
            <h1 className="text-3xl font-bold font-headline">{t('championPage.title')}</h1>
            <p className="text-muted-foreground">
                {t('championPage.description')}
            </p>
            <Card>
                <CardHeader>
                    <CardTitle>{t('championPage.weeklyRankings')}</CardTitle>
                    <CardDescription>
                       {t('championPage.leaderboardDescription', weekEndsIn)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {leaderboard.length > 0 ? (
                        <ol className="space-y-4">
                            {leaderboard.map((classmate, index) => (
                                <li 
                                    key={classmate.id} 
                                    className={cn(
                                        "p-4 border rounded-lg flex items-center gap-4 transition-all",
                                        userId === classmate.id && "bg-secondary border-primary",
                                        index === 0 && "border-yellow-500 border-2",
                                        index === 1 && "border-gray-400 border-2",
                                        index === 2 && "border-orange-600 border-2",
                                    )}
                                >
                                    <div className="flex items-center justify-center w-8">
                                       {getRankContent(index)}
                                    </div>

                                    <Image 
                                        src={classmate.avatar}
                                        alt={classmate.name}
                                        width={48}
                                        height={48}
                                        className="rounded-full"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg">{classmate.name} {userId === classmate.id && t('championPage.you')}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-yellow-500 font-bold text-lg">
                                        <span>{classmate.xp.toLocaleString()}</span>
                                        <span>{t('championPage.xp')}</span>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    ) : (
                         <div className="text-center text-muted-foreground py-12">
                            {t('championPage.noClassmates')}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
