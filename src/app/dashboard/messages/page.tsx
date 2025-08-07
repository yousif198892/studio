
"use client";

import { useEffect, useState } from "react";
import {
  Message,
  SupervisorMessage,
  User,
  getMessages,
  getSupervisorMessagesForSupervisor,
} from "@/lib/data";
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
import { formatDistanceToNow } from "date-fns";
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
import { useSearchParams } from "next/navigation";
import {
  getUserByIdFromClient,
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

function AdminInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const allMessages = getMessages();
    setMessages(allMessages);
  }, []);

  const handleDelete = (messageId: string) => {
    // This logic remains the same for admin messages
    const updatedMessages = messages.filter((m) => m.id !== messageId);
    setMessages(updatedMessages);

    try {
      const storedMessages: Message[] = JSON.parse(
        localStorage.getItem("adminMessages") || "[]"
      );
      const updatedStoredMessages = storedMessages.filter(
        (m) => m.id !== messageId
      );
      localStorage.setItem(
        "adminMessages",
        JSON.stringify(updatedStoredMessages)
      );
      toast({
        title: "Success!",
        description: "Message deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete message from localStorage", error);
      toast({
        title: "Error",
        description: "Could not delete the message.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Admin Inbox</h1>
      <p className="text-muted-foreground">
        Messages from users requesting supervisor access.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Received Messages</CardTitle>
          <CardDescription>
            Review the requests below and create accounts for approved
            supervisors in the Admins tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length > 0 ? (
                messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div className="font-medium">{message.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {message.email}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p>{message.message}</p>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
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
                              delete the message from {message.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(message.id)}
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No messages have been received.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SupervisorInbox() {
  const searchParams = useSearchParams();
  const supervisorId = searchParams.get("userId");
  const [messagesByStudent, setMessagesByStudent] = useState<
    Record<string, SupervisorMessage[]>
  >({});
  const [students, setStudents] = useState<User[]>([]);

  useEffect(() => {
    if (supervisorId) {
      const studentList = getStudentsBySupervisorIdFromClient(supervisorId);
      setStudents(studentList);
      
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
      <h1 className="text-3xl font-bold font-headline">Student Messages</h1>
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

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      setUser(getUserByIdFromClient(userId) || null);
    }
    setLoading(false);
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  if (user.isMainAdmin) {
    return <AdminInbox />;
  }

  if (user.role === "supervisor") {
    return <SupervisorInbox />;
  }

  // Fallback for unexpected roles.
  return <div>You do not have access to this page.</div>;
}
