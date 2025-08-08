
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
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, ArrowLeft } from "lucide-react";
import {
  getPeerMessagesForConversation,
  savePeerMessage,
  PeerMessage,
  User,
} from "@/lib/data";
import { getUserByIdFromClient } from "@/lib/client-data";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function PeerChatPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const classmateId = searchParams.get("classmateId");

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [classmate, setClassmate] = useState<User | null>(null);
  const [messages, setMessages] = useState<PeerMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const markMessagesAsRead = useCallback(() => {
    if (typeof window === "undefined" || !userId || !classmateId) return;

    try {
      let allStoredMessages: PeerMessage[] = JSON.parse(
        localStorage.getItem("peerMessages") || "[]"
      );
      let wasChanged = false;
      const updatedStoredMessages = allStoredMessages.map((m) => {
        if (m.receiverId === userId && m.senderId === classmateId && !m.read) {
          wasChanged = true;
          return { ...m, read: true };
        }
        return m;
      });

      if (wasChanged) {
        localStorage.setItem(
          "peerMessages",
          JSON.stringify(updatedStoredMessages)
        );
        window.dispatchEvent(new Event("storage")); // Notify other components
      }
    } catch (e) {
      console.error("Failed to update peer message read status", e);
    }
  }, [userId, classmateId]);


  const fetchAndSetData = useCallback(() => {
    if (userId && classmateId) {
      setCurrentUser(getUserByIdFromClient(userId) || null);
      setClassmate(getUserByIdFromClient(classmateId) || null);
      setMessages(getPeerMessagesForConversation(userId, classmateId));
      markMessagesAsRead();
    }
  }, [userId, classmateId, markMessagesAsRead]);

  useEffect(() => {
    fetchAndSetData();
    const handleStorageChange = () => fetchAndSetData();
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchAndSetData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !userId || !classmateId) return;

    const message: PeerMessage = {
      id: `peer_msg_${Date.now()}`,
      senderId: userId,
      receiverId: classmateId,
      content: newMessage,
      createdAt: new Date(),
      read: false,
    };

    savePeerMessage(message);
    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  if (!currentUser || !classmate) {
    return <div>Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-full">
         <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="outline" size="icon">
                <Link href={`/dashboard/classmates?userId=${userId}`}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold font-headline">Chat with {classmate.name}</h1>
                <p className="text-muted-foreground">
                    Conversation with your classmate.
                </p>
            </div>
      </div>
      <Card className="flex flex-col flex-1">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={classmate.avatar} />
              <AvatarFallback>{classmate.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{classmate.name}</CardTitle>
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
                  <AvatarImage src={classmate.avatar} />
                  <AvatarFallback>{classmate.name.charAt(0)}</AvatarFallback>
                </Avatar>
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
              {msg.senderId === userId && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
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
