
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
    const studentMessages = getSupervisorMessagesForStudent(studentId, supervisorId);
    const hasUnread = studentMessages.some(m => !m.read && m.senderId === supervisorId);
    if (!hasUnread) return;

    try {
      let allStoredMessages: SupervisorMessage[] = JSON.parse(localStorage.getItem('supervisorMessages') || '[]');
      let wasChanged = false;
      const updatedStoredMessages = allStoredMessages.map(m => {
        if (m.studentId === studentId && m.senderId === supervisorId && !m.read) {
          wasChanged = true;
          return { ...m, read: true };
        }
        return m;
      });

      if (wasChanged) {
        localStorage.setItem('supervisorMessages', JSON.stringify(updatedStoredMessages));
        // Force a storage event to trigger layout update
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error("Failed to update read status", e);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const currentStudent = getUserByIdFromClient(userId);
      setStudent(currentStudent || null);
      if (currentStudent?.supervisorId) {
        const currentSupervisor = getUserByIdFromClient(
          currentStudent.supervisorId
        );
        setSupervisor(currentSupervisor || null);
        const studentMessages = getSupervisorMessagesForStudent(userId, currentStudent.supervisorId);
        setMessages(studentMessages);
        
        // This should be called here to mark messages as read when the page loads.
        markMessagesAsRead(userId, currentStudent.supervisorId);
      }
    }
  }, [userId, markMessagesAsRead]);

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
    
    // Re-fetch messages from the source of truth to update UI
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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar>
            <AvatarImage src={supervisor.avatar} />
            <AvatarFallback>{supervisor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Chat with {supervisor.name}</CardTitle>
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
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
    
