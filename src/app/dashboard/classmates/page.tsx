
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { User, PeerMessage, getPeerConversationsForStudent } from "@/lib/data";
import { getStudentsBySupervisorIdFromClient, getUserByIdFromClient } from "@/lib/client-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ClassmatesPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");
    const [classmates, setClassmates] = useState<User[]>([]);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchData = () => {
            if (userId) {
                const currentUser = getUserByIdFromClient(userId);
                if (currentUser && currentUser.supervisorId) {
                    const allStudents = getStudentsBySupervisorIdFromClient(currentUser.supervisorId);
                    // Filter out the current user to get only classmates
                    const foundClassmates = allStudents.filter(student => student.id !== userId);
                    setClassmates(foundClassmates);

                    // Get unread message counts for each classmate
                    const conversations = getPeerConversationsForStudent(userId);
                    const counts: Record<string, number> = {};
                    for (const classmateId in conversations) {
                        const unreadCount = conversations[classmateId].filter(m => !m.read && m.senderId === classmateId).length;
                        counts[classmateId] = unreadCount;
                    }
                    setUnreadCounts(counts);
                }
            }
        };
        fetchData();
        // Also listen to storage changes to update unread counts in real-time
        window.addEventListener('storage', fetchData);
        return () => window.removeEventListener('storage', fetchData);
    }, [userId]);
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">My Classmates</h1>
            <p className="text-muted-foreground">
                See other students from your class.
            </p>
            <Card>
                <CardHeader>
                    <CardTitle>Class List</CardTitle>
                    <CardDescription>
                        A list of all students learning under your supervisor. Go to the unified "Chat" page to message them.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {classmates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {classmates.map(classmate => {
                                return (
                                    <div key={classmate.id} className="p-4 border rounded-lg flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <Image 
                                                src={classmate.avatar}
                                                alt={classmate.name}
                                                width={40}
                                                height={40}
                                                className="rounded-full"
                                            />
                                            <div>
                                                <p className="font-semibold">{classmate.name}</p>
                                                <p className="text-sm text-muted-foreground">{classmate.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground py-12">
                            You don't have any classmates yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
