
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

type DashboardSidebarProps = {
  user: User;
};

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const userRole = user.role;

  const menuItems = [
    {
      href: `/dashboard?userId=${user.id}`,
      label: "لوحة التحكم",
      icon: <Home />,
      roles: ["student", "supervisor"],
    },
    {
      href: `/learn?userId=${user.id}`,
      label: "تعلم",
      icon: <BookOpen />,
      roles: ["student"],
    },
    {
        href: `/dashboard/words?userId=${user.id}`,
        label: "كلماتي",
        icon: <BookOpen />,
        roles: ["supervisor"],
    },
    {
      href: `/dashboard/add-word?userId=${user.id}`,
      label: "إضافة كلمة",
      icon: <PlusCircle />,
      roles: ["supervisor"],
    },
     {
        href: `/dashboard/units?userId=${user.id}`,
        label: "وحداتي",
        icon: <Layers />,
        roles: ["supervisor"],
    },
    {
        href: `/dashboard/students?userId=${user.id}`,
        label: "طلابي",
        icon: <Users />,
        roles: ["supervisor"],
    },
    {
      href: `/dashboard/profile?userId=${user.id}`,
      label: "الملف الشخصي",
      icon: <Settings />,
      roles: ["student", "supervisor"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <Sidebar className="border-r" side="right">
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
                  className="w-full flex-row-reverse"
                >
                  <span>{item.label}</span>
                  {item.icon}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary">
          <Link href="/login">
            <Button variant="ghost" size="icon">
                <LogOut className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 overflow-hidden text-right">
            <p className="font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
           <Avatar>
            <AvatarImage src={user?.avatar} alt="User" />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
