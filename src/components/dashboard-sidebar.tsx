
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  PlusCircle,
  Settings,
  LogOut,
  Users,
  Layers,
  GraduationCap,
  BrainCircuit,
  MessageSquare,
  Shield,
  Trophy,
  Target,
  SpellCheck,
  Info,
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { type User } from "@/lib/data";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { signOut } from "firebase/auth";
import { getAuthInstance } from "@/lib/db";


const ChampionIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-trophy", className)}
    >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21A2.5 2.5 0 0 1 8 22h8a2.5 2.5 0 0 1-1.03-4.79c-.5-.23-.97-.66-.97-1.21v-2.34"/>
        <path d="M8 9H4v1h4"/>
        <path d="M16 9h4v1h-4"/>
        <path d="M12 6V2"/>
        <path d="M12 15a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4Z"/>
    </svg>
);


type DashboardSidebarProps = {
  user: User;
  unreadChatCount?: number;
  requestsCount?: number;
  wordsCount?: number;
  studentsCount?: number;
  classmatesCount?: number;
  adminsCount?: number;
  learningWordsCount?: number;
  masteredWordsCount?: number;
  chatConversationsCount?: number;
};

export function DashboardSidebar({ 
  user, 
  unreadChatCount = 0,
  requestsCount = 0,
  wordsCount = 0,
  studentsCount = 0,
  classmatesCount = 0,
  adminsCount = 0,
  learningWordsCount = 0,
  masteredWordsCount = 0,
  chatConversationsCount = 0,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const userRole = user.role;
  const { t } = useLanguage();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleSignOut = async () => {
    const auth = getAuthInstance();
    await signOut(auth);
    router.push('/login');
  };

  const menuItems = [
    {
      href: `/dashboard?userId=${user.id}`,
      label: t('sidebar.dashboard'),
      icon: <Home />,
      roles: ["student", "supervisor"],
    },
    {
        href: `/learn?userId=${user.id}`,
        label: t('sidebar.learn'),
        icon: <Target />,
        roles: ["student"],
    },
     {
        href: `/dashboard/learning-words?userId=${user.id}`,
        label: t('sidebar.learningWords'),
        icon: <GraduationCap />,
        roles: ["student"],
        totalCount: learningWordsCount,
    },
    {
        href: `/dashboard/mastered-words?userId=${user.id}`,
        label: t('sidebar.masteredWords'),
        icon: <Trophy />,
        roles: ["student"],
        totalCount: masteredWordsCount,
    },
    {
        href: `/dashboard/champion?userId=${user.id}`,
        label: t('sidebar.champion'),
        icon: <ChampionIcon />,
        roles: ["student"],
    },
    {
        href: `/dashboard/chat?userId=${user.id}`,
        label: t('sidebar.chat'),
        icon: <MessageSquare />,
        roles: ["student", "supervisor"],
        unreadCount: unreadChatCount,
    },
    {
        href: `/dashboard/classmates?userId=${user.id}`,
        label: t('sidebar.classmates'),
        icon: <Users />,
        roles: ["student"],
        totalCount: classmatesCount,
    },
    {
        href: `/dashboard/words?userId=${user.id}`,
        label: t('sidebar.myWords'),
        icon: <BookOpen />,
        roles: ["supervisor"],
        totalCount: wordsCount,
    },
    {
      href: `/dashboard/add-word?userId=${user.id}`,
      label: t('sidebar.addWord'),
      icon: <PlusCircle />,
      roles: ["supervisor"],
    },
    {
        href: `/dashboard/grammar?userId=${user.id}`,
        label: t('sidebar.grammar'),
        icon: <SpellCheck />,
        roles: ["student", "supervisor"],
    },
    {
        href: `/dashboard/students?userId=${user.id}`,
        label: t('sidebar.myStudents'),
        icon: <Users />,
        roles: ["supervisor"],
        totalCount: studentsCount,
    },
     {
      href: `/dashboard/messages?userId=${user.id}`,
      label: t('sidebar.requests'),
      icon: <Shield />,
      roles: ["supervisor"],
      requiresMainAdmin: true,
      totalCount: requestsCount,
    },
    {
      href: `/dashboard/admins?userId=${user.id}`,
      label: t('sidebar.admins'),
      icon: <Shield />,
      roles: ["supervisor"],
      requiresMainAdmin: true,
      totalCount: adminsCount,
    },
    {
      href: `/dashboard/profile?userId=${user.id}`,
      label: t('sidebar.profile'),
      icon: <Settings />,
      roles: ["student", "supervisor"],
    },
    {
      href: `/dashboard/about?userId=${user.id}`,
      label: t('sidebar.about'),
      icon: <Info />,
      roles: ["student", "supervisor"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item: any) => {
    if (!item.roles.includes(userRole)) {
      return false;
    }
    if (item.requiresMainAdmin && !user.isMainAdmin) {
      return false;
    }
    return true;
  });

  return (
    <Sidebar className="border-r" side="left">
        <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
                <Logo />
                <span className="font-bold text-lg font-headline">LinguaLeap</span>
            </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
            <SidebarMenu>
            {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href} className="w-full" onClick={handleLinkClick}>
                    <SidebarMenuButton
                    isActive={pathname === item.href.split('?')[0]}
                    className="w-full justify-start"
                    >
                    <div className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.label}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {(item.totalCount ?? 0) > 0 && (
                        <SidebarMenuBadge>{item.totalCount}</SidebarMenuBadge>
                        )}
                        {(item.unreadCount ?? 0) > 0 && (
                        <SidebarMenuBadge className="bg-destructive text-destructive-foreground">
                            {item.unreadCount}
                        </SidebarMenuBadge>
                        )}
                    </div>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 border-t">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary">
            <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} style={{ objectFit: 'contain' }}/>
                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <p className={cn("font-semibold text-sm truncate", user.isMainAdmin && "text-red-500")}>{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                {user?.email}
                </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
            </Button>
            </div>
        </SidebarFooter>
    </Sidebar>
  );
}
