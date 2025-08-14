
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { User, getUserById, getStudentsBySupervisorId } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Trophy } from "lucide-react";
import { LearningStats } from "@/lib/stats";
import { cn } from "@/lib/utils";

type ClassmateWithXp = User & {
    xp: number;
};

const getStatsForUser = (userId: string): LearningStats => {
    if (typeof window === 'undefined') return { xp: 0 } as LearningStats;
    const storedStats = localStorage.getItem(`learningStats_${userId}`);
    return storedStats ? JSON.parse(storedStats) : { xp: 0 };
}


export default function ChampionPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");
    const [leaderboard, setLeaderboard] = useState<ClassmateWithXp[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (userId) {
                const currentUser = await getUserById(userId);
                if (currentUser && currentUser.supervisorId) {
                    const allStudents = await getStudentsBySupervisorId(currentUser.supervisorId);
                    
                    const userMap = new Map<string, User>();
                    allStudents.forEach(student => userMap.set(student.id, student));
                    userMap.set(currentUser.id, currentUser); // Ensure current user is in the map

                    const leaderboardDataPromises = Array.from(userMap.values()).map(async (student) => {
                         const stats = getStatsForUser(student.id);
                         return {
                             ...student,
                             xp: stats.xp || 0
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
        
    }, [userId]);

    const getRankContent = (rank: number) => {
        if (rank === 0) return <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-400" />;
        if (rank === 1) return <Trophy className="w-6 h-6 text-gray-400 fill-gray-300" />;
        if (rank === 2) return <Trophy className="w-6 h-6 text-orange-600 fill-orange-400" />;
        return <span className="text-lg font-bold w-6 text-center">{rank + 1}</span>;
    }
    
    if (loading) {
        return <div>Loading leaderboard...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Champion Leaderboard</h1>
            <p className="text-muted-foreground">
                See who's at the top of the class! Keep learning to earn more XP.
            </p>
            <Card>
                <CardHeader>
                    <CardTitle>Class Rankings</CardTitle>
                    <CardDescription>
                       Leaderboard of you and your classmates based on total XP gained.
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
                                        <p className="font-semibold text-lg">{classmate.name} {userId === classmate.id && "(You)"}</p>
                                        <p className="text-sm text-muted-foreground">{classmate.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-yellow-500 font-bold text-lg">
                                        <span>{classmate.xp.toLocaleString()}</span>
                                        <span>XP</span>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    ) : (
                         <div className="text-center text-muted-foreground py-12">
                            No classmates found to create a leaderboard.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
