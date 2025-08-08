

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { type User } from "@/lib/data";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

type DashboardSidebarProps = {
  user: User;
  unreadChatCount?: number;
  unreadRequestsCount?: number;
};

export function DashboardSidebar({ user, unreadChatCount = 0, unreadRequestsCount = 0 }: DashboardSidebarProps) {
  const pathname = usePathname();
  const userRole = user.role;
  const { t } = useLanguage();

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
        label: 'Learning Words',
        icon: <GraduationCap />,
        roles: ["student"],
    },
    {
        href: `/dashboard/mastered-words?userId=${user.id}`,
        label: 'Mastered Words',
        icon: <Trophy />,
        roles: ["student"],
    },
    {
        href: `/dashboard/student-messages?userId=${user.id}`,
        label: 'Chat',
        icon: <MessageSquare />,
        roles: ["student"],
        badgeCount: unreadChatCount,
    },
    {
        href: `/dashboard/words?userId=${user.id}`,
        label: t('sidebar.myWords'),
        icon: <BookOpen />,
        roles: ["supervisor"],
    },
    {
      href: `/dashboard/add-word?userId=${user.id}`,
      label: t('sidebar.addWord'),
      icon: <PlusCircle />,
      roles: ["supervisor"],
    },
    {
        href: `/dashboard/students?userId=${user.id}`,
        label: t('sidebar.myStudents'),
        icon: <Users />,
        roles: ["supervisor"],
    },
    {
        href: `/dashboard/chat?userId=${user.id}`,
        label: 'Chat',
        icon: <MessageSquare />,
        roles: ["supervisor"],
        requiresMainAdmin: false,
        badgeCount: unreadChatCount,
    },
     {
      href: `/dashboard/messages?userId=${user.id}`,
      label: 'Requests',
      icon: <Shield />,
      roles: ["supervisor"],
      requiresMainAdmin: true,
      badgeCount: unreadRequestsCount,
    },
    {
      href: `/dashboard/admins?userId=${user.id}`,
      label: 'Admins',
      icon: <Shield />,
      roles: ["supervisor"],
      requiresMainAdmin: true,
    },
    {
      href: `/dashboard/profile?userId=${user.id}`,
      label: t('sidebar.profile'),
      icon: <Settings />,
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
              <Link href={item.href} className="flex-1">
                <SidebarMenuButton
                  isActive={pathname === item.href.split('?')[0]}
                  className="w-full justify-start"
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </SidebarMenuButton>
              </Link>
              {item.badgeCount > 0 && (
                 <Badge variant="destructive" className="ml-auto">
                    {item.badgeCount}
                </Badge>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary">
          <Avatar>
            <AvatarImage src={user?.avatar} alt="User" />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className={cn("font-semibold text-sm truncate", user.isMainAdmin && "text-red-500")}>{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <Link href="/login">
            <Button variant="ghost" size="icon">
                <LogOut className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
