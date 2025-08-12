
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  SupervisorMessage,
  User,
  getConversationsForStudent,
  saveSupervisorMessage,
  savePeerMessage,
  getStudentsBySupervisorId,
  getUserById,
  markSupervisorMessagesAsRead,
  markPeerMessagesAsRead,
  PeerMessage,
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
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

type ConversationPartner = User & {
  lastMessage: SupervisorMessage | PeerMessage | null;
  unreadCount: number;
  type: 'supervisor' | 'peer';
};

export default function ChatPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const contactToSelect = searchParams.get("contactId");
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<ConversationPartner[]>([]);
  const [selectedContact, setSelectedContact] = useState<ConversationPartner | null>(null);
  const [messages, setMessages] = useState<(SupervisorMessage | PeerMessage)[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const loadConversations = useCallback(async () => {
    if (!userId) return;

    const user = await getUserById(userId);
    setCurrentUser(user);
    if (!user) return;

    const convos = await getConversationsForStudent(userId);
    const partners: ConversationPartner[] = [];

    if (user.role === 'supervisor') {
      const students = await getStudentsBySupervisorId(userId);
      for (const student of students) {
        const studentConvo = convos.supervisor[student.id] || [];
        const lastMessage = studentConvo.length > 0 ? studentConvo[studentConvo.length - 1] : null;
        const unreadCount = studentConvo.filter(m => m.senderId === student.id && !m.read).length;
        partners.push({
          ...student,
          lastMessage,
          unreadCount,
          type: 'supervisor'
        });
      }
    } else if (user.role === 'student') {
        // Supervisor conversation
        if (user.supervisorId) {
            const supervisor = await getUserById(user.supervisorId);
            if (supervisor) {
                const supervisorConvo = convos.supervisor[supervisor.id] || [];
                const lastMessage = supervisorConvo.length > 0 ? supervisorConvo[supervisorConvo.length - 1] : null;
                const unreadCount = supervisorConvo.filter(m => m.senderId === supervisor.id && !m.read).length;
                partners.push({
                     ...supervisor,
                     lastMessage,
                     unreadCount,
                     type: 'supervisor'
                 });
            }
        }

        // Peer conversations
        for (const peerId in convos.peer) {
            const peer = await getUserById(peerId);
            if (peer) {
                const peerConvo = convos.peer[peerId];
                const lastMessage = peerConvo.length > 0 ? peerConvo[peerConvo.length - 1] : null;
                const unreadCount = peerConvo.filter(m => m.senderId === peerId && !m.read).length;
                partners.push({
                    ...peer,
                    lastMessage,
                    unreadCount,
                    type: 'peer'
                });
            }
        }
    }
    
    partners.sort((a,b) => (b.lastMessage?.createdAt || 0) > (a.lastMessage?.createdAt || 0) ? 1 : -1);
    setConversations(partners);

    if (contactToSelect && (!selectedContact || selectedContact.id !== contactToSelect)) {
      const contact = partners.find(p => p.id === contactToSelect);
      if (contact) handleSelectContact(contact);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, contactToSelect]);

  useEffect(() => {
    loadConversations();
    const handleStorage = () => loadConversations();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSelectContact = async (contact: ConversationPartner) => {
    if (!userId || !currentUser) return;
    setSelectedContact(contact);
    
    const convos = await getConversationsForStudent(userId);
    let messagesToSet: (SupervisorMessage | PeerMessage)[] = [];
    let hadUnread = false;

    if (contact.type === 'supervisor') {
        const contactId = currentUser.role === 'supervisor' ? contact.id : currentUser.supervisorId!;
        messagesToSet = convos.supervisor[contactId] || [];
        hadUnread = messagesToSet.some(m => !m.read && m.senderId !== userId);
        if (hadUnread) await markSupervisorMessagesAsRead(userId, contactId);
    } else { // peer
        messagesToSet = convos.peer[contact.id] || [];
        hadUnread = messagesToSet.some(m => !m.read && m.senderId !== userId);
        if (hadUnread) await markPeerMessagesAsRead(userId, contact.id);
    }
    
    setMessages(messagesToSet);
    
    if(hadUnread) {
        // Trigger layout to refetch counts for the sidebar
        window.dispatchEvent(new Event('storage'));
    }
    
    // Visually update the unread count on the selected contact without a full reload
    setConversations(prev => prev.map(c => c.id === contact.id ? { ...c, unreadCount: 0 } : c));
  };


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !selectedContact || !currentUser) return;
    
    let sentMessage: SupervisorMessage | PeerMessage | null = null;

    if (currentUser.role === 'supervisor' || selectedContact.type === 'supervisor') {
        const studentId = currentUser.role === 'student' ? userId : selectedContact.id;
        const supervisorId = currentUser.role === 'supervisor' ? userId : selectedContact.id;
        sentMessage = {
          id: `sup_msg_${Date.now()}`,
          studentId: studentId,
          supervisorId: supervisorId,
          senderId: userId,
          content: newMessage,
          createdAt: new Date(),
          read: false,
        };
        await saveSupervisorMessage(sentMessage);
    } else { // peer to peer
        const conversationId = [userId, selectedContact.id].sort().join('-');
        sentMessage = {
            id: `peer_msg_${Date.now()}`,
            senderId: userId,
            receiverId: selectedContact.id,
            conversationId,
            content: newMessage,
            createdAt: new Date(),
            read: false,
        };
        await savePeerMessage(sentMessage);
    }
    
    if (sentMessage) {
      setMessages(prev => [...prev, sentMessage!]);
    }
    
    setNewMessage("");

    // This triggers a re-render of messages and counts in other tabs
    window.dispatchEvent(new Event('storage'));
  };

  if (!currentUser) {
    return <div>Loading...</div>
  }
  
  const title = currentUser.role === 'supervisor' ? "Student Chats" : "Chat";
  const description = currentUser.role === 'supervisor' ? "Read and reply to messages from your students." : "Conversations with your supervisor and classmates.";

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold font-headline mb-1">{title}</h1>
      <p className="text-muted-foreground mb-6">{description}</p>
      <Card className="grid grid-cols-1 md:grid-cols-[300px_1fr] flex-1">
        <div className="flex flex-col border-r">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-2">
              {conversations.length > 0 ? (
                conversations.map((convo) => (
                    <div key={convo.id} className="flex items-center gap-1 group">
                        <button
                        className={cn(
                            "flex items-center gap-3 text-left p-2 rounded-lg w-full transition-colors",
                            selectedContact?.id === convo.id
                            ? "bg-secondary"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => handleSelectContact(convo)}
                        >
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={convo.avatar} />
                            <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-semibold truncate">{convo.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                            {convo.lastMessage ? convo.lastMessage.content : "No messages yet"}
                            </p>
                        </div>
                        {convo.unreadCount > 0 && <Badge>{convo.unreadCount}</Badge>}
                        </button>
                    </div>
                  ))
              ) : (
                <div className="text-center text-muted-foreground py-12 px-4">
                  No conversations started yet.
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </div>
        <div className="flex flex-col h-[calc(100vh-10rem)]">
          {selectedContact ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={selectedContact.avatar} />
                        <AvatarFallback>
                            {selectedContact.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{selectedContact.name}</CardTitle>
                        <CardDescription className="capitalize">{selectedContact.type}</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1">
                <CardContent className="p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-end gap-2 group",
                        msg.senderId === userId
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      {msg.senderId !== userId && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={selectedContact.avatar} />
                          <AvatarFallback>
                            {selectedContact.name.charAt(0)}
                          </AvatarFallback>
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
                      
                      {msg.senderId === userId && currentUser && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={currentUser.avatar} />
                          <AvatarFallback>
                            {currentUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>
              </ScrollArea>
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
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
