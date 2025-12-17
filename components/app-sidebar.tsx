"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
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
} from "@/components/ui/sidebar";

// Konfigurasi Menu Navigasi
const navigationData = {
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "History", url: "#" },
        { title: "Starred", url: "#" },
        { title: "Settings", url: "#" },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        { title: "Genesis", url: "#" },
        { title: "Explorer", url: "#" },
        { title: "Quantum", url: "#" },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Introduction", url: "#" },
        { title: "Get Started", url: "#" },
        { title: "Tutorials", url: "#" },
        { title: "Changelog", url: "#" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "General", url: "#" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
      ],
    },
  ],
  navSecondary: [
    { title: "Support", url: "#", icon: LifeBuoy },
    { title: "Feedback", url: "#", icon: Send },
  ],
  projects: [
    { name: "Design Engineering", url: "#", icon: Frame },
    { name: "Sales & Marketing", url: "#", icon: PieChart },
    { name: "Travel", url: "#", icon: Map },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();

  // 1. State User (Default placeholder saat loading)
  const [user, setUser] = useState({
    name: "Loading...",
    email: "Checking session...",
    avatar: "https://github.com/shadcn.png", // Fallback avatar jika lokal tidak ada
  });

  // 2. Fungsi Fetch Profile dari Backend Axum
  const fetchUserProfile = useCallback(async () => {
    // Jangan fetch jika berada di halaman login/signup untuk menghindari bentrok logic
    if (pathname === "/login" || pathname === "/signup") return;

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/me", {
        method: "GET",
        credentials: "include", // PENTING: Mengirim cookie session otomatis
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          name: data.name || "User",
          email: data.email || "No Email",
          avatar: data.avatar || "https://github.com/shadcn.png",
        });
      } else if (response.status === 401) {
        // Jika session tidak valid (401), tendang ke login
        console.warn("Session expired or invalid. Redirecting...");
        router.push("/login");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      setUser({
        name: "Offline",
        email: "Server Error",
        avatar: "",
      });
    }
  }, [router, pathname]);

  // 3. Jalankan Fetch saat Sidebar dimuat
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return (
    <Sidebar variant="inset" {...props}>
      {/* Header Sidebar: Brand/Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-sidebar-foreground">Oryphem</span>
                  <span className="truncate text-xs text-muted-foreground">Keuangan Pintar</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Konten Sidebar: Navigasi Utama */}
      <SidebarContent>
        <NavMain items={navigationData.navMain} />
        <NavProjects projects={navigationData.projects} />
        <NavSecondary items={navigationData.navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* Footer Sidebar: Profile User yang di-fetch */}
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}