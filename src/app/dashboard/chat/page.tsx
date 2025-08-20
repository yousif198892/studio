
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  type SupervisorMessage,
  type User,
  type PeerMessage,
} from "@/lib/data";
import { 
    getUserById, 
    getStudentsBySupervisorId,
    saveSupervisorMessage,
    savePeerMessage,
    deleteSupervisorMessage,
    deletePeerMessage,
    updateUserDB,
    getConversations,
    markSupervisorMessagesAsRead,
    markPeerMessagesAsRead,
 } from "@/lib/firestore";
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
import { Send, MoreHorizontal, Pencil, Trash2, Ban } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


type ConversationPartner = User & {
  lastMessage: SupervisorMessage | PeerMessage | null;
  unreadCount: number;
  type: 'supervisor' | 'peer';
};

type AllConversations = { 
  supervisor: Record<string, SupervisorMessage[]>, 
  peer: Record<string, PeerMessage[]> 
};

type MessageType = 'supervisor' | 'peer';

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
  const { t } = useLanguage();

  const [allConversations, setAllConversations] = useState<AllConversations>({ supervisor: {}, peer: {} });

  const [editingMessage, setEditingMessage] = useState<(SupervisorMessage | PeerMessage | null)>(null);
  const [editedContent, setEditedContent] = useState("");


  const loadData = useCallback(async (isInitialLoad = false) => {
    if (!userId) return;
    
    const user = await getUserById(userId);
    setCurrentUser(user);
    if (!user) return;

    if(user.blockedUsers?.includes(selectedContact?.id || '')) {
      setSelectedContact(null);
    }
    
    const convos = await getConversations(userId);
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
    
    const sortedPartners = partners
      .sort((a,b) => {
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
        const updatedContact = sortedPartners.find(p => p.id === selectedContact.id);
        if (updatedContact) {
            handleSelectContact(updatedContact, false);
        } else {
            setSelectedContact(null);
            setMessages([]);
        }
    }
    
  }, [userId, contactToSelect, selectedContact]);


  useEffect(() => {
    const init = async () => {
        await loadData(true);
    }
    init();
    
    // Periodically poll for new messages
    const intervalId = setInterval(() => loadData(false), 5000); 
    
    return () => clearInterval(intervalId);
  }, [userId, contactToSelect]);

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
            await markSupervisorMessagesAsRead(userId, contact.id);

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
            await markPeerMessagesAsRead(userId, contact.id);
            
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
        setConversations(prev => prev.map(c => c.id === contact.id ? { ...c, unreadCount: 0 } : c));
    }
  };


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !selectedContact || !currentUser) return;
    
    const timestamp = new Date();
    let sentMessage: SupervisorMessage | PeerMessage | undefined = undefined;
    const messageType: MessageType = currentUser.role === 'supervisor' || selectedContact.type === 'supervisor' ? 'supervisor' : 'peer';
    
    setNewMessage("");

    if (messageType === 'supervisor') {
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
        await savePeerMessage(sentMessage);
    }

    setMessages(prev => [...prev, sentMessage!]);
    setAllConversations(prev => {
      const newAllConvos = { ...prev };
      const otherUserId = selectedContact.id;

      if(messageType === 'supervisor') {
        if (!newAllConvos.supervisor[otherUserId]) newAllConvos.supervisor[otherUserId] = [];
        newAllConvos.supervisor[otherUserId].push(sentMessage as SupervisorMessage);
      } else {
        if (!newAllConvos.peer[otherUserId]) newAllConvos.peer[otherUserId] = [];
        newAllConvos.peer[otherUserId].push(sentMessage as PeerMessage);
      }
      return newAllConvos;
    });

    setConversations(prev => prev.map(c => {
        if (c.id === selectedContact.id) {
            return { ...c, lastMessage: sentMessage! };
        }
        return c;
    }).sort((a,b) => {
        const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return timeB - timeA;
    }));
  };

  const handleStartEdit = (message: SupervisorMessage | PeerMessage) => {
    setEditingMessage(message);
    setEditedContent(message.content);
  }

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditedContent("");
  }

  const handleSaveEdit = async () => {
    if (!editingMessage || !editedContent.trim()) return;

    const updatedMessage = { 
        ...editingMessage, 
        content: editedContent.trim(),
        isEdited: true 
    };

    if ('supervisorId' in updatedMessage) {
        await saveSupervisorMessage(updatedMessage);
    } else {
        await savePeerMessage(updatedMessage);
    }
    
    setMessages(prev => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m));
    handleCancelEdit();
  }

  const handleDeleteMessage = async (message: SupervisorMessage | PeerMessage, scope: 'me' | 'everyone') => {
    if (!userId) return;

    if (scope === 'everyone') {
        if ('supervisorId' in message) {
            await deleteSupervisorMessage(message);
        } else {
            await deletePeerMessage(message);
        }
        setMessages(prev => prev.filter(m => m.id !== message.id));
    } else { // 'me'
        const updatedMessage = {
            ...message,
            deletedFor: [...(message.deletedFor || []), userId]
        };
        if ('supervisorId' in updatedMessage) {
            await saveSupervisorMessage(updatedMessage);
        } else {
            await savePeerMessage(updatedMessage);
        }
         setMessages(prev => prev.filter(m => m.id !== message.id));
    }
  };

  const handleToggleBlockUser = async () => {
    if (!currentUser || !selectedContact) return;
    const isBlocked = currentUser.blockedUsers?.includes(selectedContact.id);

    const updatedBlockedUsers = isBlocked
        ? (currentUser.blockedUsers || []).filter(id => id !== selectedContact.id)
        : [...(currentUser.blockedUsers || []), selectedContact.id];

    const updatedUser = { ...currentUser, blockedUsers: updatedBlockedUsers };
    
    await updateUserDB(updatedUser);
    setCurrentUser(updatedUser);
    toast({ title: t('toasts.success'), description: isBlocked ? 'User unblocked' : 'User blocked.' });

    await loadData();
  }


  if (!currentUser) {
    return <div>{t('chatPage.loading')}</div>
  }
  
  const title = currentUser.role === 'supervisor' ? t('chatPage.supervisorTitle') : t('chatPage.studentTitle');
  const description = currentUser.role === 'supervisor' ? t('chatPage.supervisorDescription') : t('chatPage.studentDescription');

  const isContactBlocked = selectedContact ? currentUser?.blockedUsers?.includes(selectedContact.id) : false;
  const isCurrentUserBlocked = selectedContact ? selectedContact.blockedUsers?.includes(currentUser.id) : false;


  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold font-headline mb-1">{title}</h1>
      <p className="text-muted-foreground mb-6">{description}</p>
      <Card className="grid grid-cols-1 md:grid-cols-[300px_1fr] flex-1">
        <div className="flex flex-col border-r">
          <CardHeader>
            <CardTitle>{t('chatPage.conversations')}</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-2">
              {conversations.length > 0 ? (
                conversations.map((convo) => {
                    const isBlockedByCurrentUser = currentUser?.blockedUsers?.includes(convo.id);
                    return (
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
                                <p className="font-semibold truncate flex items-center gap-2">
                                    <span>{convo.name}</span>
                                    {isBlockedByCurrentUser && <Ban className="h-4 w-4 text-destructive" />}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                {convo.lastMessage ? convo.lastMessage.content : t('chatPage.noMessages')}
                                </p>
                            </div>
                            {convo.unreadCount > 0 && <Badge>{convo.unreadCount}</Badge>}
                            </button>
                        </div>
                    );
                })
              ) : (
                <div className="text-center text-muted-foreground py-12 px-4">
                  {t('chatPage.noConversations')}
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
                        <CardDescription className="capitalize">
                            {t(selectedContact.type === 'supervisor' ? 'chatPage.contactType.supervisor' : 'chatPage.contactType.peer')}
                        </CardDescription>
                    </div>
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Ban className={cn("h-5 w-5", isContactBlocked && "text-destructive")} />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {isContactBlocked ? t('chatPage.unblockDialog.title') : t('chatPage.blockDialog.title')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {isContactBlocked 
                                    ? t('chatPage.unblockDialog.description', selectedContact.name)
                                    : t('chatPage.blockDialog.description', selectedContact.name)
                                }
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('chatPage.blockDialog.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleToggleBlockUser}>
                                {isContactBlocked ? t('chatPage.unblockDialog.unblockButton') : t('chatPage.blockDialog.blockButton')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </CardHeader>
              <ScrollArea className="flex-1">
                <CardContent className="p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex items-end gap-2 group w-full", msg.senderId === userId ? "justify-end" : "justify-start")}>
                        {msg.senderId !== userId && (
                        <Avatar className="h-8 w-8 self-end mb-2">
                            <AvatarImage src={selectedContact.avatar} style={{ objectFit: 'contain' }}/>
                            <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        )}
                        
                        <div className="flex flex-col gap-1 items-end">
                            {editingMessage?.id === msg.id ? (
                                <div className="w-full max-w-sm space-y-2">
                                    <Input value={editedContent} onChange={(e) => setEditedContent(e.target.value)} autoFocus />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>{t('chatPage.deleteDialog.cancel')}</Button>
                                        <Button size="sm" onClick={handleSaveEdit}>{t('profile.personalInfo.save')}</Button>
                                    </div>
                                </div>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className={cn("rounded-lg px-4 py-2 max-w-sm break-words cursor-pointer", msg.senderId === userId ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                        <p className="text-sm">{msg.content}</p>
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align={msg.senderId === userId ? 'end' : 'start'}>
                                        {msg.senderId === userId && (
                                            <>
                                            <DropdownMenuItem onClick={() => handleStartEdit(msg)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                <span>{t('chatPage.messageActions.edit')}</span>
                                            </DropdownMenuItem>
                                            
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>{t('chatPage.messageActions.delete')}</span>
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('chatPage.deleteDialog.title')}</AlertDialogTitle>
                                                    </AlertDialogHeader>
                                                    <AlertDialogDescription>{t('chatPage.deleteDialog.descriptionForMe')}</AlertDialogDescription>
                                                    <AlertDialogDescription>{t('chatPage.deleteDialog.descriptionForEveryone')}</AlertDialogDescription>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>{t('chatPage.deleteDialog.cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteMessage(msg, 'me')}>{t('chatPage.deleteDialog.deleteForMe')}</AlertDialogAction>
                                                        <AlertDialogAction onClick={() => handleDeleteMessage(msg, 'everyone')} className="bg-destructive hover:bg-destructive/90">{t('chatPage.deleteDialog.deleteForEveryone')}</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            </>
                                        )}
                                        <DropdownMenuItem onClick={handleToggleBlockUser}>
                                            <Ban className="mr-2 h-4 w-4" />
                                            <span>{t('chatPage.messageActions.block')}</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                             <p className="text-xs opacity-75 mt-1 text-right">
                                {msg.isEdited && <span className="italic">{t('chatPage.edited')} </span>}
                                {format(new Date(msg.createdAt), "p")}
                            </p>
                        </div>
                        
                        {msg.senderId === userId && currentUser && (
                        <Avatar className="h-8 w-8 self-end mb-2">
                            <AvatarImage src={currentUser.avatar} style={{ objectFit: 'contain' }}/>
                            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>
              </ScrollArea>
              <CardFooter className="pt-4 border-t">
                {isContactBlocked ? (
                    <div className="w-full text-center text-sm text-muted-foreground">{t('chatPage.blockedMessage')}</div>
                ) : isCurrentUserBlocked ? (
                     <div className="w-full text-center text-sm text-muted-foreground">{selectedContact.name} {t('chatPage.blockedContact')}</div>
                ) : (
                    <div className="flex w-full items-center space-x-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('chatPage.typeMessage')}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                        >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">{t('chatPage.send')}</span>
                        </Button>
                    </div>
                )}
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <p>{t('chatPage.selectConversation')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
