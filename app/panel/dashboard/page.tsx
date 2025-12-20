"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // Import Link untuk navigasi
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { 
  FileText, 
  UploadCloud, 
  Loader2, 
  CheckCircle2, 
  FileWarning,
  BarChart3,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Asumsi Anda punya komponen Button, jika tidak bisa pakai class Tailwind

// --- Types ---
interface DashboardStats {
  total: number;
  analyzed: number;
  pending: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ total: 0, analyzed: 0, pending: 0 });
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id; 

  useEffect(() => {
    if (!userId) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:8000/api/v1/financial/stats?user_id=${userId}`);

        if (!response.ok) {
          throw new Error("Gagal mengambil data statistik");
        }

        const result = await response.json();

        if (result.status === "success" && result.data) {
          setStats({
            total: result.data.total || 0,
            analyzed: result.data.analyzed || 0,
            pending: result.data.pending || 0,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  // Kalkulasi persentase untuk progress bar
  const progressPercentage = stats.total > 0 ? Math.round((stats.analyzed / stats.total) * 100) : 0;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* --- HEADER --- */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 pr-6 border-b bg-background sticky top-0 z-10">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">KePin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ModeToggle />
        </header>

        {/* --- MAIN CONTENT --- */}
        <div className="flex flex-1 flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
          
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground mt-1">
              Pantau status dokumen finansial Anda secara real-time.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <FileWarning className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* STATS CARDS GRID */}
          <div className="grid gap-4 md:grid-cols-3">
            
            {/* CARD 1: TOTAL */}
            <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md hover:border-primary/50 group">
              <div className="p-6">
                <div className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Dokumen</h3>
                  <div className="p-2 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                    <UploadCloud className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
                  ) : (
                    <div className="text-3xl font-bold">{stats.total}</div>
                  )}
                  <span className="text-xs text-muted-foreground">files</span>
                </div>
              </div>
            </div>

            {/* CARD 2: ANALYZED */}
            <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md hover:border-green-500/50 group">
              <div className="p-6">
                <div className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <h3 className="text-sm font-medium text-muted-foreground">Sudah Dianalisis</h3>
                  <div className="p-2 bg-green-500/10 rounded-full group-hover:bg-green-500/20 transition-colors">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
                  ) : (
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.analyzed}</div>
                  )}
                  <span className="text-xs text-muted-foreground">selesai</span>
                </div>
              </div>
            </div>

            {/* CARD 3: PENDING */}
            <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md hover:border-amber-500/50 group">
              <div className="p-6">
                <div className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <h3 className="text-sm font-medium text-muted-foreground">Perlu Tindakan</h3>
                  <div className="p-2 bg-amber-500/10 rounded-full group-hover:bg-amber-500/20 transition-colors">
                    <FileWarning className="h-4 w-4 text-amber-500" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
                  ) : (
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
                  )}
                  <span className="text-xs text-muted-foreground">menunggu</span>
                </div>
              </div>
            </div>
          </div>

          {/* PROGRESS SECTION */}
          <div className="space-y-3">
             <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span>Efisiensi Pengolahan</span>
                </div>
                <span className="font-bold">{progressPercentage}% Selesai</span>
             </div>
             <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                />
             </div>
          </div>

          {/* MAIN ACTION AREA (Link ke /panel/upload) */}
          <div className="flex-1 min-h-[300px] flex flex-col">
            <Link 
              href="/panel/upload" 
              className="group relative flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/5 p-12 text-center transition-all hover:bg-accent hover:border-primary/50 hover:shadow-sm"
            >
              <div className="relative rounded-full bg-background p-4 shadow-sm ring-1 ring-foreground/5 transition-transform group-hover:scale-110 group-hover:shadow-md">
                <FileText className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                {/* Badge kecil di icon */}
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground shadow-sm">
                  +
                </div>
              </div>
              
              <h3 className="mt-4 text-xl font-semibold tracking-tight">
                Upload Dokumen Baru
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                Klik di sini untuk mengunggah dokumen keuangan (PDF/Excel) dan mulai proses analisis otomatis.
              </p>
              
              <Button className="mt-6 pointer-events-none" variant="default">
                <UploadCloud className="mr-2 h-4 w-4" />
                Mulai Upload
              </Button>
            </Link>
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}