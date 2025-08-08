
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, Trash2 } from "lucide-react";
import {
  deleteSupervisorMessage,
  getSupervisorMessagesForStudent,
  saveSupervisorMessage,
  SupervisorMessage,
  User,
} from "@/lib/data";
import { getUserByIdFromClient } from "@/lib/client-data";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
import { ScrollArea } from "@/components/ui/scroll-area";

export default function StudentMessagesPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [student, setStudent] = useState<User | null>(null);
  const [supervisor, setSupervisor] = useState<User | null>(null);
  const [messages, setMessages] = useState<SupervisorMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const markMessagesAsRead = useCallback((studentId: string, supervisorId: string) => {
    if (typeof window === 'undefined') return;
    
    try {
        let allStoredMessages: SupervisorMessage[] = JSON.parse(localStorage.getItem('supervisorMessages') || '[]' );
        let wasChanged = false;
        const updatedStoredMessages = allStoredMessages.map(m => {
            if (m.studentId === studentId && m.supervisorId === supervisorId && m.senderId === supervisorId && !m.read) {
                wasChanged = true;
                return { ...m, read: true };
            }
            return m;
        });

        if (wasChanged) {
            localStorage.setItem('supervisorMessages', JSON.stringify(updatedStoredMessages));
            window.dispatchEvent(new Event('storage')); // Notify other tabs/components
        }
    } catch (e) {
        console.error("Failed to update read status", e);
    }
  }, []);

  const fetchAndSetData = useCallback(() => {
    if (userId) {
      const currentStudent = getUserByIdFromClient(userId);
      setStudent(currentStudent || null);
      if (currentStudent?.supervisorId) {
        const currentSupervisor = getUserByIdFromClient(currentStudent.supervisorId);
        setSupervisor(currentSupervisor || null);
        if (currentSupervisor) {
            const studentMessages = getSupervisorMessagesForStudent(userId, currentSupervisor.id);
            setMessages(studentMessages);
            if (userId && currentSupervisor.id) {
              markMessagesAsRead(userId, currentSupervisor.id);
            }
        }
      }
    }
  }, [userId, markMessagesAsRead]);

  useEffect(() => {
    fetchAndSetData();
     // Listen for storage changes to update chat in real-time
    const handleStorageChange = () => fetchAndSetData();
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchAndSetData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !userId || !supervisor?.id) return;

    const message: SupervisorMessage = {
      id: `sup_msg_${Date.now()}`,
      studentId: userId,
      supervisorId: supervisor.id,
      senderId: userId,
      content: newMessage,
      createdAt: new Date(),
      read: false, 
    };

    saveSupervisorMessage(message);
    
    const updatedMessages = getSupervisorMessagesForStudent(userId, supervisor.id);
    setMessages(updatedMessages);

    setNewMessage("");
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteSupervisorMessage(messageId);
    setMessages(prev => prev.filter(m => m.id !== messageId));
    toast({
        title: "Message Deleted",
        description: "Your message has been removed.",
    });
  }

  if (!student || !supervisor) {
    return <div>Loading chat...</div>;
  }
  
  const lastMessage = messages.length > 0 ? messages[messages.length-1] : null;

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold font-headline mb-1">Chat</h1>
      <p className="text-muted-foreground mb-6">
        Communicate with your supervisor.
      </p>
       <Card className="grid grid-cols-1 md:grid-cols-[300px_1fr] flex-1">
        <div className="flex flex-col border-r">
           <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-2">
               <button
                  className={cn("flex items-center gap-3 text-left p-2 rounded-lg w-full bg-secondary")}
                >
                <Avatar className="h-10 w-10">
                    <AvatarImage src={supervisor.avatar} />
                    <AvatarFallback>{supervisor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-semibold">{supervisor.name}</p>
                     <p className="text-xs text-muted-foreground truncate">
                        {lastMessage ? lastMessage.content : "No messages yet"}
                     </p>
                </div>
              </button>
            </CardContent>
          </ScrollArea>
        </div>
        <div className="flex flex-col h-[calc(100vh-10rem)]">
            <>
              <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={supervisor.avatar} />
                        <AvatarFallback>
                            {supervisor.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{supervisor.name}</CardTitle>
                        <CardDescription>Supervisor</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-2 group",
                      msg.senderId === userId ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.senderId !== userId && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={supervisor.avatar} />
                        <AvatarFallback>{supervisor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex items-center gap-2">
                       {msg.senderId === userId && (
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
                          msg.senderId === userId
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
                    {msg.senderId === userId && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
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
        </div>
      </Card>
    </div>
  );
}

    