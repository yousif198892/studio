"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  PlusCircle,
  Settings,
  User,
  LogOut,
  Users,
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

type DashboardSidebarProps = {
  userRole: "student" | "supervisor";
};

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home />,
      roles: ["student", "supervisor"],
    },
    {
      href: "/learn",
      label: "Learn",
      icon: <BookOpen />,
      roles: ["student"],
    },
    {
        href: "/dashboard/words",
        label: "My Words",
        icon: <BookOpen />,
        roles: ["supervisor"],
    },
    {
      href: "/dashboard/add-word",
      label: "Add Word",
      icon: <PlusCircle />,
      roles: ["supervisor"],
    },
    {
        href: "/dashboard/students",
        label: "My Students",
        icon: <Users />,
        roles: ["supervisor"],
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: <Settings />,
      roles: ["student", "supervisor"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <Sidebar className="border-r">
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
                  isActive={pathname === item.href}
                  className="w-full"
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
            <AvatarImage src="https://placehold.co/100x100.png" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm truncate">Alex Johnson</p>
            <p className="text-xs text-muted-foreground truncate">
              alex@example.com
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
