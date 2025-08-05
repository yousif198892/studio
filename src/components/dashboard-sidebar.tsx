

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
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { type User } from "@/lib/data";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

type DashboardSidebarProps = {
  user: User;
};

export function DashboardSidebar({ user }: DashboardSidebarProps) {
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
      href: `/dashboard/my-words?userId=${user.id}`,
      label: t('dashboard.student.learnedTitle'),
      icon: <GraduationCap />,
      roles: ["student"],
    },
    {
      href: `/dashboard/mastered-words?userId=${user.id}`,
      label: t('sidebar.masteredWords'),
      icon: <Trophy />,
      roles: ["student"],
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
        href: `/dashboard/messages?userId=${user.id}`,
        label: 'Messages',
        icon: <MessageSquare />,
        roles: ["supervisor"],
        requiresMainAdmin: true,
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
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href.split('?')[0]}
                  className="w-full justify-start"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
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
