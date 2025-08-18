
"use client";

import { useSearchParams } from "next/navigation";
import type { User } from "@/lib/data";
import { getMessages, getWordsBySupervisor, getAllUsers, getUserById, getStudentsBySupervisorId, getSupervisorMessages, getPeerMessages, getStudentProgress } from "@/lib/firestore";
import type { WordProgress } from "@/lib/storage";
import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export function DashboardSidebarWrapper() {
  const searchParams = useSearchParams();
  const userId = searchParams?.get('userId');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for counts
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [wordsCount, setWordsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [classmatesCount, setClassmatesCount] = useState(0);
  const [adminsCount, setAdminsCount] = useState(0);
  const [learningWordsCount, setLearningWordsCount] = useState(0);
  const [masteredWordsCount, setMasteredWordsCount] = useState(0);
  const [chatConversationsCount, setChatConversationsCount] = useState(0);
  
  const fetchUserAndCounts = useCallback(async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      const foundUser = await getUserById(userId);
      if (!foundUser) {
        setLoading(false);
        return;
      }
      
      setUser(foundUser);
      
      // Calculate counts based on role
      if (foundUser.role === 'supervisor') {
          if (foundUser.isMainAdmin) {
              const messages = await getMessages();
              setRequestsCount(messages.length);
              const allUsers = await getAllUsers();
              const otherAdmins = allUsers.filter(u => u.role === 'supervisor' && !u.isMainAdmin).length;
              setAdminsCount(otherAdmins);
          }
          const words = await getWordsBySupervisor(userId);
          setWordsCount(words.length);
          
          const students = await getStudentsBySupervisorId(userId);
          setStudentsCount(students.length);
          setChatConversationsCount(students.length);
          
          const studentIds = students.map(s => s.id);
          let totalUnread = 0;
          for (const studentId of studentIds) {
              const messages = await getSupervisorMessages(studentId, userId);
              if (messages.some(m => !m.read && m.senderId === studentId)) {
                  totalUnread++;
              }
          }
          setUnreadChatCount(totalUnread);

      } else if (foundUser.role === 'student' && foundUser.supervisorId) {
           let supervisorUnreadCount = 0;
           const supervisorMessages = await getSupervisorMessages(userId, foundUser.supervisorId);
           if (supervisorMessages.some(m => !m.read && m.senderId === foundUser.supervisorId)) {
               supervisorUnreadCount = 1;
           }

           const classmates = (await getStudentsBySupervisorId(foundUser.supervisorId)).filter(s => s.id !== foundUser.id);
           setClassmatesCount(classmates.length);
           setChatConversationsCount(classmates.length + (foundUser.supervisorId ? 1 : 0));
           
           let peerUnreadCount = 0;
           for (const classmate of classmates) {
               const conversationId = [userId, classmate.id].sort().join('-');
               const peerMessages = await getPeerMessages(conversationId);
               if(peerMessages.some(m => !m.read && m.senderId === classmate.id)) {
                   peerUnreadCount++;
               }
           }
           setUnreadChatCount(supervisorUnreadCount + peerUnreadCount);
           
           const studentProgress = await getStudentProgress(foundUser.id);
           const learning = studentProgress.filter(p => p.strength >= 0).length;
           const mastered = studentProgress.filter(p => p.strength === -1).length;
           setLearningWordsCount(learning);
           setMasteredWordsCount(mastered);
      }
      setLoading(false);
    }, [userId]);


  useEffect(() => {
    fetchUserAndCounts();
    
    // This is a simplified listener. A real-world app might need a more robust
    // way to sync state across tabs, like using BroadcastChannel or Firestore real-time updates.
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'unreadCountNeedsUpdate' || event.key === 'users' || event.key === 'userWords' || event.key === 'adminMessages' || event.key === 'messagesNeedsUpdate') {
            fetchUserAndCounts();
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchUserAndCounts]);

  if (loading) {
    // Render a skeleton or placeholder for the sidebar
    return (
        <div className="w-64 h-screen bg-muted p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }
  
  if (!user) {
    return (
        <div className="w-64 h-screen bg-muted p-4">
            <p>Could not load user data.</p>
        </div>
    );
  }
  
  return (
    <DashboardSidebar 
        user={user} 
        unreadChatCount={unreadChatCount}
        requestsCount={requestsCount}
        wordsCount={wordsCount}
        studentsCount={studentsCount}
        classmatesCount={classmatesCount}
        adminsCount={adminsCount}
        learningWordsCount={learningWordsCount}
        masteredWordsCount={masteredWordsCount}
        chatConversationsCount={chatConversationsCount}
    />
  );
}
