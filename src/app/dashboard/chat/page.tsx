
"use client";

import { useEffect, useState } from "react";
import {
  SupervisorMessage,
  User,
  getSupervisorMessagesForSupervisor,
} from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "next/navigation";
import {
  getStudentsBySupervisorIdFromClient,
} from "@/lib/client-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function SupervisorChatPage() {
  const searchParams = useSearchParams();
  const supervisorId = searchParams.get("userId");
  const [messagesByStudent, setMessagesByStudent] = useState<
    Record<string, SupervisorMessage[]>
  >({});
  const [students, setStudents] = useState<User[]>([]);

  useEffect(() => {
    if (supervisorId) {
      const allMessages = getSupervisorMessagesForSupervisor(supervisorId);
      
      const grouped = allMessages.reduce((acc, msg) => {
        const studentId = msg.studentId;
        if (!acc[studentId]) {
          acc[studentId] = [];
        }
        acc[studentId].push(msg);
        return acc;
      }, {} as Record<string, SupervisorMessage[]>);
      
      setMessagesByStudent(grouped);
      
      // Get all students and filter them to only include those who have sent messages
      const allStudents = getStudentsBySupervisorIdFromClient(supervisorId);
      const studentsWhoMessaged = allStudents.filter(student => grouped[student.id]);
      setStudents(studentsWhoMessaged);
    }
  }, [supervisorId]);

  const handleAccordionToggle = (studentId: string) => {
    const studentMessages = messagesByStudent[studentId] || [];
    if (studentMessages.every(m => m.read)) return; // No unread messages

    const updatedMessages = studentMessages.map(m => ({ ...m, read: true }));

    // Update component state for immediate feedback
    setMessagesByStudent(prev => ({
      ...prev,
      [studentId]: updatedMessages,
    }));

    // Update localStorage
    try {
      let allStoredMessages: SupervisorMessage[] = JSON.parse(localStorage.getItem('supervisorMessages') || '[]');
      
      const updatedStoredMessages = allStoredMessages.map(m => {
        if (m.supervisorId === supervisorId && m.studentId === studentId) {
          return { ...m, read: true };
        }
        return m;
      });
      
      localStorage.setItem('supervisorMessages', JSON.stringify(updatedStoredMessages));
    } catch (e) {
      console.error("Failed to update message read status in localStorage", e);
    }
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Student Chat</h1>
      <p className="text-muted-foreground">
        Read messages from your students below.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Your Inbox</CardTitle>
          <CardDescription>
            Messages are grouped by student. Click to expand.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {students.map((student) => {
                const studentMessages = messagesByStudent[student.id] || [];
                const unreadCount = studentMessages.filter(m => !m.read).length;
                return (
                  <AccordionItem value={student.id} key={student.id}>
                    <AccordionTrigger 
                        className="hover:bg-muted/50 px-4 rounded-md"
                        onClick={() => handleAccordionToggle(student.id)}
                    >
                      <div className="flex items-center gap-4 py-2 flex-1">
                        <Image
                          alt="Student avatar"
                          className="aspect-square rounded-full object-cover"
                          height="48"
                          src={student.avatar}
                          width="48"
                        />
                        <div className="text-left">
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {studentMessages.length > 0
                              ? `Last message: ${formatDistanceToNow(
                                  new Date(studentMessages[studentMessages.length - 1].createdAt),
                                  { addSuffix: true }
                                )}`
                              : "No messages yet"}
                          </div>
                        </div>
                      </div>
                      {unreadCount > 0 && <Badge>{unreadCount} New</Badge>}
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 bg-secondary/50 rounded-b-md">
                        {studentMessages.length > 0 ? [...studentMessages].reverse().map(msg => (
                            <div key={msg.id} className="flex flex-col">
                                <p className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(msg.createdAt), {addSuffix: true})}
                                </p>
                                <p>{msg.content}</p>
                            </div>
                        )) : <p className="text-muted-foreground text-center py-4">No messages from this student.</p>}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground py-12">No students have sent you messages yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
