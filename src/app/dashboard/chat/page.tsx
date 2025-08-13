
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
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

type ConversationPartner = User & {
  lastMessage: SupervisorMessage | PeerMessage | null;
  unreadCount: number;
  type: 'supervisor' | 'peer';
};

type AllConversations = { 
  supervisor: Record<string, SupervisorMessage[]>, 
  peer: Record<string, PeerMessage[]> 
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

  const [allConversations, setAllConversations] = useState<AllConversations>({ supervisor: {}, peer: {} });

  const loadData = useCallback(async (isInitialLoad = false) => {
    if (!userId) return;
    
    const user = await getUserById(userId);
    setCurrentUser(user);
    if (!user) return;
    
    const convos = await getConversationsForStudent(userId);
    setAllConversations(convos);

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

        if (user.supervisorId) {
            const classmates = await getStudentsBySupervisorId(user.supervisorId);
            const peerIds = new Set(Object.keys(convos.peer));
            classmates.forEach(c => peerIds.add(c.id));
            
            for (const peerId of peerIds) {
                 if (peerId === userId) continue;
                 const peer = classmates.find(c => c.id === peerId) || await getUserById(peerId);
                 if (peer) {
                    const peerConvo = convos.peer[peerId] || [];
                    const lastMessage = peerConvo.length > 0 ? peerConvo[peerConvo.length - 1] : null;
                    const unreadCount = peerConvo.filter(m => m.senderId === peerId && !m.read).length;
                    
                    const existingPartner = partners.find(p => p.id === peer.id);
                    if (!existingPartner) {
                        partners.push({
                            ...peer,
                            lastMessage,
                            unreadCount,
                            type: 'peer'
                        });
                    }
                 }
            }
        }
    }
    
    const sortedPartners = partners.sort((a,b) => {
        const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return timeB - timeA;
    });
    
    setConversations(sortedPartners);

    if (isInitialLoad && contactToSelect) {
        const contact = sortedPartners.find(p => p.id === contactToSelect);
        if (contact) {
            handleSelectContact(contact);
        }
    } else if (selectedContact) {
       // Reselect the contact to refresh messages if needed
        const updatedContact = sortedPartners.find(p => p.id === selectedContact.id);
        if (updatedContact) {
            handleSelectContact(updatedContact, false); // Don't trigger another layout update
        }
    }
    
  }, [userId, contactToSelect]);


  useEffect(() => {
    const init = async () => {
        await loadData(true);
    }
    init();
  }, [loadData]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        if(event.key?.startsWith('supervisorMessages') || event.key?.startsWith('peerMessages') || event.key === 'users') {
           loadData();
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSelectContact = async (contact: ConversationPartner, notifyLayout = true) => {
    if (!userId || !currentUser) return;
    
    setSelectedContact(contact);
    
    let messagesToSet: (SupervisorMessage | PeerMessage)[] = [];
    let hadUnread = false;
    
    if (contact.type === 'supervisor') {
        const conversationKey = currentUser.role === 'supervisor' ? contact.id : userId;
        messagesToSet = allConversations.supervisor[contact.id] || [];
        
        if (messagesToSet.some(m => !m.read && m.senderId !== userId)) {
            hadUnread = true;
            // 1. Update DB
            await markSupervisorMessagesAsRead(userId, contact.id);

            // 2. Update local state for immediate UI feedback
            setAllConversations(prev => {
                const newSupervisorConvos = { ...prev.supervisor };
                newSupervisorConvos[contact.id] = newSupervisorConvos[contact.id].map(m => ({ ...m, read: true }));
                return { ...prev, supervisor: newSupervisorConvos };
            });
            messagesToSet = messagesToSet.map(m => ({ ...m, read: true }));
        }

    } else { // peer
        const conversationKey = contact.id;
        messagesToSet = allConversations.peer[conversationKey] || [];

        if (messagesToSet.some(m => !m.read && m.senderId !== userId)) {
            hadUnread = true;
            // 1. Update DB
            await markPeerMessagesAsRead(userId, contact.id);
            
            // 2. Update local state
            setAllConversations(prev => {
                const newPeerConvos = { ...prev.peer };
                newPeerConvos[conversationKey] = newPeerConvos[conversationKey].map(m => ({ ...m, read: true }));
                return { ...prev, peer: newPeerConvos };
            });
            messagesToSet = messagesToSet.map(m => ({ ...m, read: true }));
        }
    }
    
    setMessages(messagesToSet.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    
    if(hadUnread) {
        // 3. Update conversation list UI state
        setConversations(prev => prev.map(c => c.id === contact.id ? { ...c, unreadCount: 0 } : c));
        // 4. Notify layout to update its count
        if (notifyLayout) {
             localStorage.setItem('unreadCountNeedsUpdate', 'true');
             localStorage.removeItem('unreadCountNeedsUpdate');
        }
    }
  };


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !selectedContact || !currentUser) return;
    
    const timestamp = new Date();
    let sentMessage: SupervisorMessage | PeerMessage;
    
    // Optimistic UI updates
    setNewMessage("");

    if (currentUser.role === 'supervisor' || selectedContact.type === 'supervisor') {
        const studentId = currentUser.role === 'student' ? userId : selectedContact.id;
        const supervisorId = currentUser.role === 'supervisor' ? userId : selectedContact.id;
        sentMessage = {
          id: `sup_msg_${Date.now()}`,
          studentId: studentId,
          supervisorId: supervisorId,
          senderId: userId,
          content: newMessage,
          createdAt: timestamp,
          read: false,
        };
        
        setAllConversations(prev => {
          const newConvos = { ...prev.supervisor };
          const conversationKey = currentUser.role === 'supervisor' ? selectedContact.id : supervisorId;
          newConvos[conversationKey] = [...(newConvos[conversationKey] || []), sentMessage as SupervisorMessage];
          return { ...prev, supervisor: newConvos };
        });

        await saveSupervisorMessage(sentMessage);
    } else { // peer to peer
        const conversationId = [userId, selectedContact.id].sort().join('-');
        sentMessage = {
            id: `peer_msg_${Date.now()}`,
            senderId: userId,
            receiverId: selectedContact.id,
            conversationId,
            content: newMessage,
            createdAt: timestamp,
            read: false,
        };
        
        setAllConversations(prev => {
          const newConvos = { ...prev.peer };
          newConvos[selectedContact.id] = [...(newConvos[selectedContact.id] || []), sentMessage as PeerMessage];
          return { ...prev, peer: newConvos };
        });

        await savePeerMessage(sentMessage);
    }
    
    setMessages(prev => [...prev, sentMessage]);
    setConversations(prev => prev.map(c => {
        if (c.id === selectedContact.id) {
            return { ...c, lastMessage: sentMessage };
        }
        return c;
    }).sort((a,b) => {
        const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return timeB - timeA;
    }));

    // Notify other tabs
    const storageKey = sentMessage.type === 'supervisor' ? `supervisorMessages-${sentMessage.studentId}-${sentMessage.supervisorId}` : `peerMessages-${sentMessage.conversationId}`;
    localStorage.setItem(storageKey, 'updated');
    localStorage.removeItem(storageKey);
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
                            <AvatarImage src={convo.avatar} style={{ objectFit: 'contain' }} />
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
                        <AvatarImage src={selectedContact.avatar} style={{ objectFit: 'contain' }} />
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
                          <AvatarImage src={selectedContact.avatar} style={{ objectFit: 'contain' }}/>
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
                          <AvatarImage src={currentUser.avatar} style={{ objectFit: 'contain' }}/>
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
