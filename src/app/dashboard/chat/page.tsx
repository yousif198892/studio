
"use client";

import { useEffect, useState, useRef } from "react";
import {
  SupervisorMessage,
  User,
  getSupervisorMessagesForSupervisor,
  saveSupervisorMessage,
  deleteSupervisorMessage,
  deleteConversation,
} from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import {
  getStudentsBySupervisorIdFromClient,
  getUserByIdFromClient,
} from "@/lib/client-data";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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

export default function SupervisorChatPage() {
  const searchParams = useSearchParams();
  const supervisorId = searchParams.get("userId");
  const studentToSelect = searchParams.get("studentId");
  const [messagesByStudent, setMessagesByStudent] = useState<
    Record<string, SupervisorMessage[]>
  >({});
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

      const allStudents = getStudentsBySupervisorIdFromClient(supervisorId);
      setStudents(allStudents);

      if (studentToSelect) {
        const student = allStudents.find(s => s.id === studentToSelect);
        if (student) {
            setSelectedStudent(student);
            markMessagesAsRead(student.id, grouped);
        }
      } else if (!selectedStudent && allStudents.length > 0) {
        setSelectedStudent(allStudents[0]);
        markMessagesAsRead(allStudents[0].id, grouped);
      }
    }
  }, [supervisorId, studentToSelect]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesByStudent, selectedStudent]);

  const markMessagesAsRead = (
    studentId: string,
    currentMessages: Record<string, SupervisorMessage[]>
  ) => {
    if (!supervisorId) return;
    const studentMessages = currentMessages[studentId] || [];
    const hasUnread = studentMessages.some(m => !m.read && m.senderId === studentId);
    if (!hasUnread) return;

    const updatedMessages = studentMessages.map((m) => {
        if (m.senderId === studentId) { // Only mark messages FROM the student as read
            return { ...m, read: true };
        }
        return m;
    });

    setMessagesByStudent((prev) => ({
      ...prev,
      [studentId]: updatedMessages,
    }));

    try {
      let allStoredMessages: SupervisorMessage[] = JSON.parse(
        localStorage.getItem("supervisorMessages") || "[]"
      );
      const updatedStoredMessages = allStoredMessages.map((m) => {
        if (m.supervisorId === supervisorId && m.studentId === studentId && m.senderId === studentId) {
          return { ...m, read: true };
        }
        return m;
      });
      localStorage.setItem(
        "supervisorMessages",
        JSON.stringify(updatedStoredMessages)
      );
       window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error("Failed to update message read status in localStorage", e);
    }
  };

  const handleSelectStudent = (student: User) => {
    setSelectedStudent(student);
    markMessagesAsRead(student.id, messagesByStudent);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !supervisorId || !selectedStudent?.id) return;

    const message: SupervisorMessage = {
      id: `sup_msg_${Date.now()}`,
      studentId: selectedStudent.id,
      supervisorId: supervisorId,
      senderId: supervisorId,
      content: newMessage,
      createdAt: new Date(),
      read: true, // Supervisor's own message is already "read" by them
    };

    saveSupervisorMessage(message);

    const updatedStudentMessages = [
      ...(messagesByStudent[selectedStudent.id] || []),
      message,
    ];
    setMessagesByStudent((prev) => ({
      ...prev,
      [selectedStudent.id]: updatedStudentMessages,
    }));

    setNewMessage("");
  };
  
  const handleDeleteMessage = (messageId: string) => {
    if (!selectedStudent) return;
    deleteSupervisorMessage(messageId);
    
    // Update state
    const updatedMessages = (messagesByStudent[selectedStudent.id] || []).filter(m => m.id !== messageId);
    setMessagesByStudent(prev => ({
      ...prev,
      [selectedStudent.id]: updatedMessages
    }));

    toast({
        title: "Message Deleted",
        description: "The message has been removed.",
    });
  }

  const handleDeleteConversation = (studentId: string) => {
    if (!supervisorId) return;
    deleteConversation(studentId, supervisorId);

    // Update state by clearing messages for that student
    setMessagesByStudent(prev => {
        const newMessages = {...prev};
        delete newMessages[studentId];
        return newMessages;
    });

    toast({
        title: "Conversation Cleared",
        description: "The conversation history with this student has been removed.",
    });
  }

  const supervisor = supervisorId ? getUserByIdFromClient(supervisorId) : null;
  const currentConversation = selectedStudent
    ? messagesByStudent[selectedStudent.id] || []
    : [];

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold font-headline mb-1">Student Chat</h1>
      <p className="text-muted-foreground mb-6">
        Read and reply to messages from your students.
      </p>
      <Card className="grid grid-cols-1 md:grid-cols-[300px_1fr] flex-1">
        <div className="flex flex-col border-r">
          <CardHeader>
            <CardTitle>Your Students</CardTitle>
            <CardDescription>Select a student to chat with.</CardDescription>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-2">
              {students.length > 0 ? (
                students.map((student) => {
                  const studentMessages = messagesByStudent[student.id] || [];
                  const unreadCount = studentMessages.filter(
                    (m) => !m.read && m.senderId === student.id
                  ).length;
                  const lastMessage = studentMessages.length > 0 ? studentMessages[studentMessages.length-1] : null;

                  return (
                    <div key={student.id} className="flex items-center gap-1 group">
                        <button
                        className={cn(
                            "flex items-center gap-3 text-left p-2 rounded-lg w-full transition-colors",
                            selectedStudent?.id === student.id
                            ? "bg-secondary"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => handleSelectStudent(student)}
                        >
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                            {lastMessage ? lastMessage.content : "No messages yet"}
                            </p>
                        </div>
                        {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
                        </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-12 px-4">
                  You do not have any students yet.
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </div>
        <div className="flex flex-col h-[calc(100vh-8rem)]">
          {selectedStudent ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={selectedStudent.avatar} />
                        <AvatarFallback>
                            {selectedStudent.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{selectedStudent.name}</CardTitle>
                    </div>
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete your entire conversation with {selectedStudent.name}. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteConversation(selectedStudent.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentConversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-2 group",
                      msg.senderId === supervisorId
                        ? "justify-end"
                        : "justify-start"
                    )}
                  >
                    {msg.senderId !== supervisorId && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedStudent.avatar} />
                        <AvatarFallback>
                          {selectedStudent.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex items-center gap-2">
                       {msg.senderId === supervisorId && (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Trash2 className="h-4 w-4 text-destructive"/>
                               </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                               <AlertDialogHeader>
                                   <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                   <AlertDialogDescription>
                                       This will permanently delete this message. This action cannot be undone.
                                   </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                   <AlertDialogCancel>Cancel</AlertDialogCancel>
                                   <AlertDialogAction onClick={() => handleDeleteMessage(msg.id)}>Delete</AlertDialogAction>
                               </AlertDialogFooter>
                           </AlertDialogContent>
                       </AlertDialog>
                      )}
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2 max-w-sm",
                          msg.senderId === supervisorId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-75 mt-1 text-right">
                          {format(new Date(msg.createdAt), "p")}
                        </p>
                      </div>
                    </div>
                    {msg.senderId === supervisorId && supervisor && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={supervisor.avatar} />
                        <AvatarFallback>
                          {supervisor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
              <CardFooter className="pt-4 border-t">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <p>Select a student to start chatting</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

    