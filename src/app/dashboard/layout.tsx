
"use client";

import { redirect, usePathname, useSearchParams } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { User, getMessages, getSupervisorMessagesForSupervisor, Word, getWordsBySupervisor, getAllUsers, getWordsForStudent, getSupervisorMessagesForStudent } from "@/lib/data";
import { useEffect, useState } from "react";
import { getAllUsersFromClient, getStudentsBySupervisorIdFromClient, getUserByIdFromClient } from "@/lib/client-data";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for counts
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [wordsCount, setWordsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [adminsCount, setAdminsCount] = useState(0);
  const [learningWordsCount, setLearningWordsCount] = useState(0);
  const [masteredWordsCount, setMasteredWordsCount] = useState(0);


  useEffect(() => {
    // This function will run on the client side after hydration.
    const fetchUserAndCounts = () => {
      const userId = searchParams?.get('userId') as string;
      
      if (!userId) {
        setLoading(false);
        redirect("/login");
        return;
      }
      
      const foundUser = getUserByIdFromClient(userId);
      
      if (foundUser) {
        setUser(foundUser);
        
        // Calculate counts based on role
        if (foundUser.role === 'supervisor') {
            const allUsers = getAllUsersFromClient();
            if (foundUser.isMainAdmin) {
                const adminMessages = getMessages();
                setRequestsCount(adminMessages.length);
                const otherAdmins = allUsers.filter(u => u.role === 'supervisor' && !u.isMainAdmin).length;
                setAdminsCount(otherAdmins);
            }
            const supervisorMessages = getSupervisorMessagesForSupervisor(foundUser.id);
            const unread = supervisorMessages.filter(m => !m.read && m.senderId !== userId).length;
            setUnreadChatCount(unread);

            const words = getWordsBySupervisor(userId);
            setWordsCount(words.length);
            
            const students = getStudentsBySupervisorIdFromClient(userId);
            setStudentsCount(students.length);

        } else if (foundUser.role === 'student' && foundUser.supervisorId) {
             const studentMessages = getSupervisorMessagesForStudent(foundUser.id, foundUser.supervisorId);
             const unread = studentMessages.filter(m => !m.read && m.senderId !== foundUser.id).length;
             setUnreadChatCount(unread);

             const studentWords = getWordsForStudent(foundUser.id);
             const learning = studentWords.filter(w => w.strength >= 0).length;
             const mastered = studentWords.filter(w => w.strength === -1).length;
             setLearningWordsCount(learning);
             setMasteredWordsCount(mastered);
        }

      } else {
         console.error("User not found, redirecting to login.")
         setLoading(false);
         redirect("/login");
         return;
      }
      setLoading(false);
    }

    // Ensure this runs only on the client where localStorage is available.
    if (typeof window !== 'undefined') {
        fetchUserAndCounts();
    }

    // Add a listener to re-fetch counts on storage change
    const handleStorageChange = () => {
        fetchUserAndCounts();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, [searchParams, pathname]);

  if (loading) {
    return null; // Or a loading spinner
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
            adminsCount={adminsCount}
            learningWordsCount={learningWordsCount}
            masteredWordsCount={masteredWordsCount}
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
