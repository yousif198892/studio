
"use client";

import { useSearchParams } from "next/navigation";
import { User, getMessages, getWordsBySupervisor, getWordsForStudent, getConversationsForStudent, getStudentsBySupervisorId, getAllUsers, getUserById } from "@/lib/data";
import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { DashboardSidebar } from "./dashboard-sidebar";

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
        // In a real app, you might redirect here, but in a component, we just show a loading/error state.
        return;
      }
      
      const foundUser = await getUserById(userId);
      
      if (foundUser) {
        setUser(foundUser);
        const allConversations = await getConversationsForStudent(userId);
        
        // Calculate counts based on role
        if (foundUser.role === 'supervisor') {
            if (foundUser.isMainAdmin) {
                const messages = await getMessages();
                setRequestsCount(messages.length);
                const allUsers = await getAllUsers();
                const otherAdmins = allUsers.filter(u => u.role === 'supervisor' && !u.isMainAdmin).length;
                setAdminsCount(otherAdmins);
            }
            const unreadConversations = Object.values(allConversations.supervisor)
                .filter(convo => convo.some(m => m.senderId !== userId && !m.read))
                .length;
            setUnreadChatCount(unreadConversations);

            const words = await getWordsBySupervisor(userId);
            setWordsCount(words.length);
            
            const students = await getStudentsBySupervisorId(userId);
            setStudentsCount(students.length);
            setChatConversationsCount(students.length);

        } else if (foundUser.role === 'student' && foundUser.supervisorId) {
             const supervisorUnreadConvos = Object.values(allConversations.supervisor)
                .filter(convo => convo.some(m => m.senderId !== userId && !m.read))
                .length;

             const peerUnreadConvos = Object.values(allConversations.peer)
                .filter(convo => convo.some(m => m.senderId !== userId && !m.read))
                .length;

             setUnreadChatCount(supervisorUnreadConvos + peerUnreadConvos);
             
             const studentWords = await getWordsForStudent(foundUser.id);
             const learning = studentWords.filter(w => w.strength >= 0).length;
             const mastered = studentWords.filter(w => w.strength === -1).length;
             setLearningWordsCount(learning);
             setMasteredWordsCount(mastered);

             const classmates = (await getStudentsBySupervisorId(foundUser.supervisorId)).filter(s => s.id !== foundUser.id);
             setClassmatesCount(classmates.length);
             setChatConversationsCount(classmates.length + (foundUser.supervisorId ? 1 : 0));
        }

      }
      setLoading(false);
    }, [userId]);


  useEffect(() => {
    fetchUserAndCounts();
    
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
    // In a real app, you'd handle this case, maybe showing a generic sidebar or an error.
    // For now, returning null or a minimal sidebar is fine.
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
