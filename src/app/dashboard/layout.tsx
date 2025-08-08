
"use client";

import { redirect, usePathname, useSearchParams } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Message, SupervisorMessage, User, getMessages, getSupervisorMessagesForSupervisor, Word, getWordsBySupervisor, getAllUsers } from "@/lib/data";
import { useEffect, useState } from "react";
import { getAllUsersFromClient, getStudentsBySupervisorIdFromClient, getUserByIdFromClient } from "@/lib/client-data";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname(); // Add pathname to track navigation
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for counts
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [wordsCount, setWordsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [adminsCount, setAdminsCount] = useState(0);


  useEffect(() => {
    const fetchUserAndCounts = () => {
      // In a real app, this would come from a session or a more robust user management system.
      const userId = searchParams?.get('userId') as string;
      
      if (!userId) {
        redirect("/login");
        return;
      }
      
      const foundUser = getUserByIdFromClient(userId);
      const allUsers = getAllUsersFromClient();
      
      if (foundUser) {
        setUser(foundUser);
        
        // Calculate counts based on role
        if (foundUser.role === 'supervisor') {
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
             const { getSupervisorMessagesForStudent } = require('@/lib/data');
             const studentMessages = getSupervisorMessagesForStudent(userId, foundUser.supervisorId);
             const unread = studentMessages.filter(m => !m.read && m.senderId !== userId).length;
             setUnreadChatCount(unread);
        }

      } else {
         console.error("User not found, redirecting to login.")
         redirect("/login");
      }
      setLoading(false);
    }
    fetchUserAndCounts();
  }, [searchParams, pathname]); // Re-run effect when pathname changes

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
