"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Command,
  LifeBuoy,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navigationData = {
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "Upload", url: "/panel/upload" },
        { title: "Browse", url: "/panel/browse" },
        { title: "Settings", url: "#" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "General", url: "#" },
        { title: "Team", url: "#" },
      ],
    },
  ],
  navSecondary: [
    { title: "Support", url: "#", icon: LifeBuoy },
    { title: "Feedback", url: "#", icon: Send },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();

  // Inisialisasi State dengan tipe yang jelas
  const [user, setUser] = useState({
    id: "",
    name: "Loading...",
    email: "Checking session...",
    avatar: "https://github.com/shadcn.png",
  });

  const fetchUserProfile = useCallback(async () => {
    // Abaikan fetch jika berada di halaman auth
    if (pathname === "/login" || pathname === "/signup") return;

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          // Mengubah ObjectId atau ID apapun menjadi string aman
          id: data.id ? String(data.id) : "", 
          name: data.name || "User",
          email: data.email || "No Email",
          avatar: data.avatar || "https://github.com/shadcn.png",
        });
      } else if (response.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      setUser(prev => ({
        ...prev,
        name: "Offline",
        email: "Server Unreachable",
      }));
    }
  }, [router, pathname]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/panel/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-sidebar-foreground">Oryphem</span>
                  <span className="truncate text-xs text-muted-foreground">Keuangan Pintar</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navigationData.navMain} />
        <NavSecondary items={navigationData.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        {/* Pastikan data user dikirim ke NavUser */}
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}