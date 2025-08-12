

"use client";

import { redirect, useSearchParams } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { User, getMessages, Word, getWordsBySupervisor, getWordsForStudent, getConversationsForStudent, getStudentsBySupervisorId, getAllUsers, getUserById } from "@/lib/data";
import { useEffect, useState, useCallback } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        redirect("/login");
        return;
      }
      
      setLoading(true);
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
            const supervisorUnread = Object.values(allConversations.supervisor).flat().filter(m => m.senderId !== userId && !m.read).length;
            setUnreadChatCount(supervisorUnread);

            const words = await getWordsBySupervisor(userId);
            setWordsCount(words.length);
            
            const students = await getStudentsBySupervisorId(userId);
            setStudentsCount(students.length);
            setChatConversationsCount(students.length);

        } else if (foundUser.role === 'student' && foundUser.supervisorId) {
             const supervisorUnread = Object.values(allConversations.supervisor).flat().filter(m => m.senderId !== userId && !m.read).length;
             const peerUnread = Object.values(allConversations.peer).flat().filter(m => m.senderId !== userId && !m.read).length;
             setUnreadChatCount(supervisorUnread + peerUnread);
             
             const studentWords = await getWordsForStudent(foundUser.id);
             const learning = studentWords.filter(w => w.strength >= 0).length;
             const mastered = studentWords.filter(w => w.strength === -1).length;
             setLearningWordsCount(learning);
             setMasteredWordsCount(mastered);

             const classmates = (await getStudentsBySupervisorId(foundUser.supervisorId)).filter(s => s.id !== foundUser.id);
             setClassmatesCount(classmates.length);
             setChatConversationsCount(classmates.length + (foundUser.supervisorId ? 1 : 0));
        }

      } else {
         console.error("User not found, will redirect.");
         redirect("/login");
      }
      setLoading(false);
    }, [userId]);


  useEffect(() => {
    fetchUserAndCounts();
    window.addEventListener('storage', fetchUserAndCounts);
    return () => {
      window.removeEventListener('storage', fetchUserAndCounts);
    };
  }, [fetchUserAndCounts]);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading...</p>
        </div>
    );
  }
  
  if (!user) {
    // This state can be hit briefly before redirect triggers.
    return null;
  }
  
  return (
      <SidebarProvider>
        <div className="flex min-h-screen">
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
          <div className="flex-1 flex flex-col">
            <DashboardHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
  );
}

    