"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList,
  BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { 
  Loader2, FileText, ExternalLink, PlayCircle,
  Building2, Table as TableIcon, FileSpreadsheet, Trash2, 
  Eye, FolderOpen, Zap, Brain, ChevronDown, Activity, 
  MoreHorizontal, TrendingUp, TrendingDown, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils"; // Pastikan Anda memiliki utility ini

// --- TIPE DATA ---
interface UploadItem {
  _id: string | { $oid: string };
  file_name: string;
  file_path: string;
  file_type: string;
}

type AnalyzeMode = 'fast' | 'normal' | 'deep';

// --- HELPER FUNCTIONS ---
const getSafeId = (id: any): string => {
  if (!id) return "";
  if (typeof id === 'string') return id;
  if (typeof id === 'object' && id.$oid) return id.$oid;
  return String(id);
};

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// --- SUB-KOMPONEN UI ---

// 1. Metric Card: Komponen untuk menampilkan angka statistik
const MetricCard = ({ label, value, type = "neutral" }: { label: string, value?: number, type?: "neutral" | "profit" | "loss" }) => {
  const isPositive = (value || 0) >= 0;
  
  let valueColor = "text-foreground";
  if (type === "profit") valueColor = isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
  
  return (
    <div className="flex flex-col p-3 rounded-lg bg-background border shadow-sm space-y-1">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className={cn("text-sm sm:text-base font-mono font-bold tracking-tight truncate", valueColor)}>
        {formatCurrency(value)}
      </div>
    </div>
  );
};

// 2. Analysis Badge: Menampilkan mode analisa dengan gaya visual yang berbeda
const AnalysisBadge = ({ mode }: { mode: string }) => {
  const configs: Record<string, { color: string, icon: any, label: string }> = {
    "Analisa Cepat": { color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400", icon: Zap, label: "Fast" },
    "Analisa Mendalam": { color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400", icon: Brain, label: "Deep" },
    "default": { color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400", icon: FileText, label: "Normal" }
  };

  const config = configs[mode] || configs["default"];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border", config.color)}>
      <Icon className="w-3 h-3" />
      <span>{mode || "Analisa Normal"}</span>
    </div>
  );
};

// 3. Result Display: Tampilan utama hasil
const AnalysisResultDisplay = ({ result }: { result: any }) => {
  const rincian = result.data_keuangan_lain || [];
  const MAX_DISPLAY = 3; // UX: Naikkan limit agar tidak terlalu sering klik "more"
  const isOverLimit = rincian.length > MAX_DISPLAY;
  const displayData = isOverLimit ? rincian.slice(0, MAX_DISPLAY) : rincian;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Result */}
      <div className="p-4 bg-card border-b flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h4 className="font-bold text-base leading-none">{result.nama_entitas || "Laporan Keuangan"}</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Periode: {result.periode_laporan} • {result.mata_uang}
            </p>
          </div>
          <AnalysisBadge mode={result.jenis_analisa} />
        </div>
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <MetricCard label="Total Aset" value={result.total_aset} />
          <MetricCard label="Ekuitas" value={result.total_ekuitas} />
          <MetricCard label="Liabilitas" value={result.total_liabilitas} />
          <MetricCard label="Laba Bersih" value={result.laba_bersih} type="profit" />
        </div>
      </div>

      {/* Rincian Table Area */}
      <div className="flex-1 bg-muted/20 p-4 space-y-3">
        {rincian.length > 0 ? (
          <div className="bg-background rounded-md border shadow-sm overflow-hidden">
            <div className="px-3 py-2 bg-muted/50 border-b flex justify-between items-center">
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                <TableIcon className="w-3 h-3" /> BREAKDOWN
              </span>
            </div>
            <table className="w-full text-xs">
              <tbody>
                {displayData.map((row: any, i: number) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors group">
                    <td className="p-2.5 text-muted-foreground group-hover:text-foreground transition-colors w-2/3">{row.keterangan}</td>
                    <td className="p-2.5 text-right font-mono font-medium">{formatCurrency(row.nilai)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {isOverLimit && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full py-2 text-[10px] font-medium text-primary hover:bg-primary/5 transition-colors border-t flex items-center justify-center gap-1">
                    Lihat {rincian.length - MAX_DISPLAY} data lainnya <ChevronDown className="w-3 h-3" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rincian Keuangan Lengkap</DialogTitle>
                    <DialogDescription>Detail ekstraksi data dari dokumen {result.nama_entitas}</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[300px] w-full border rounded-md p-2">
                    <table className="w-full text-sm">
                       <tbody>
                        {rincian.map((row: any, i: number) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="p-3 text-muted-foreground">{row.keterangan}</td>
                            <td className="p-3 text-right font-mono font-medium">{formatCurrency(row.nilai)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs italic opacity-60">
            Tidak ada rincian tambahan terdeteksi
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function AnalysePage() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [analyzingState, setAnalyzingState] = useState<Record<string, AnalyzeMode | null>>({});
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // ... (Fetch Data & Delete Logic sama seperti sebelumnya, disembunyikan untuk ringkas) ...
  // Anggap bagian logic fetch dan delete masih sama persis seperti kode Anda di atas
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [uRes, fRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/uploads?user_id=${user.id}`),
        fetch(`${apiUrl}/api/v1/financial-data?user_id=${user.id}`)
      ]);
      const uData: UploadItem[] = await uRes.json();
      const fData: any[] = await fRes.json();

      const mappedResults: Record<string, any> = {};
      uData.forEach((upload) => {
        const id = getSafeId(upload._id);
        const match = fData.find((r: any) => r.id_userupload === id);
        if (match) mappedResults[id] = match;
      });

      setUploads(Array.isArray(uData) ? uData : []);
      setResults(mappedResults);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, apiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (fileId: string) => {
    if (!confirm("Hapus file?")) return;
    try {
      await fetch(`${apiUrl}/api/v1/upload/${fileId}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      alert("Gagal menghapus file");
    }
  };

  const handleAnalyze = async (fileId: string, filePath: string, mode: AnalyzeMode) => {
    setAnalyzingState(prev => ({ ...prev, [fileId]: mode }));
    setResults(prev => { const n = {...prev}; delete n[fileId]; return n; });
    // ... logic streaming sama seperti kode asli ...
     const endpoints = {
        fast: "/api/v1/fast_analyze",    
        normal: "/api/v1/normal_analyze",        
        deep: "/api/v1/deep_analyze"       
    };

    try {
      const response = await fetch(`${apiUrl}${endpoints[mode]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            file_path: filePath, 
            user_id: user?.id, 
            id_userupload: fileId 
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            try {
                if (dataStr.startsWith("{") && dataStr.includes("id_userupload")) {
                  const dbObj = JSON.parse(dataStr);
                  setResults(prev => ({ ...prev, [fileId]: dbObj }));
                }
            } catch (jsonErr) {
                console.warn("Stream JSON parsing skip", jsonErr);
            }
          }
        }
      }
    } catch (e) {
      console.error("Analyze error:", e);
      alert(`Gagal melakukan analisis ${mode}`);
    } finally {
      setAnalyzingState(prev => ({ ...prev, [fileId]: null }));
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-50 dark:bg-black">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/80 backdrop-blur-sm px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">KePin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Panel</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Analyze</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ModeToggle />
        </header>

        <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Analisis</h1>
              <p className="text-muted-foreground mt-1">
                Kelola dan analisis laporan keuangan Anda dengan kecerdasan buatan.
              </p>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground bg-white dark:bg-muted border px-3 py-1.5 rounded-md shadow-sm">
                  {uploads.length} Dokumen Tersedia
                </span>
            </div>
          </div>

          <Separator />

          {loading ? (
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i} className="h-[300px] p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </div>
                    <Skeleton className="h-[150px] w-full rounded-md" />
                  </Card>
                ))}
             </div>
          ) : uploads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/5 hover:bg-muted/10 transition-colors">
              <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <FolderOpen className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold">Belum ada dokumen</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
                Unggah laporan keuangan (PDF/Excel) di menu Upload untuk memulai analisis AI.
              </p>
              <Button>
                Upload Dokumen Baru
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {uploads.map((file) => {
                const id = getSafeId(file._id);
                const isExcel = file.file_name.toLowerCase().match(/\.xls(x)?$/);
                const currentMode = analyzingState[id];
                const hasResult = !!results[id];
                
                return (
                  <Card key={id} className="group overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
                    {/* Card Header: File Info & Actions */}
                    <div className="p-4 bg-background border-b flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3 overflow-hidden">
                        <div className={cn(
                          "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center border shadow-sm",
                          isExcel ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                        )}>
                          {isExcel ? <FileSpreadsheet className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-semibold text-sm truncate" title={file.file_name}>
                            {file.file_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono uppercase mt-0.5">
                            {file.file_type} • ID: {id.slice(-4)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600" asChild>
                          <a href={`${apiUrl}${file.file_path}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Card Body: Analysis Area */}
                    <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/20 min-h-[250px] relative">
                      {hasResult ? (
                        <AnalysisResultDisplay result={results[id]} />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                          {currentMode ? (
                            <div className="flex flex-col items-center gap-4 animate-pulse">
                              <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
                                <Loader2 className="h-10 w-10 animate-spin text-blue-600 relative z-10" />
                              </div>
                              <div className="space-y-1">
                                <p className="font-medium text-sm">Sedang Menganalisis...</p>
                                <p className="text-xs text-muted-foreground">Mode: {currentMode} analysis</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4 max-w-[200px]">
                              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                                <Activity className="h-6 w-6 text-muted-foreground/50" />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Dokumen ini belum dianalisis. Pilih metode di bawah untuk melihat wawasan keuangan.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Action Buttons */}
                    <div className="p-3 border-t bg-background flex justify-between items-center gap-3">
                       <span className="text-[10px] text-muted-foreground font-medium pl-1">
                         {hasResult ? "Analisa selesai" : "Siap dianalisa"}
                       </span>
                       
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant={hasResult ? "outline" : "default"} disabled={!!currentMode} className="ml-auto gap-2 text-xs h-8">
                                {currentMode ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Proses...
                                  </>
                                ) : (
                                  <>
                                    {hasResult ? <ScanSearch className="h-3.5 w-3.5" /> : <PlayCircle className="h-3.5 w-3.5" />}
                                    {hasResult ? "Analisa Ulang" : "Mulai Analisa"}
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                  </>
                                )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="text-xs">Pilih Kedalaman Analisa</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => handleAnalyze(id, file.file_path, 'fast')} className="cursor-pointer gap-2">
                              <div className="h-8 w-8 rounded bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
                                <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-xs">Flash Analysis</span>
                                <span className="text-[10px] text-muted-foreground">Sangat cepat, data inti.</span>
                              </div>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => handleAnalyze(id, file.file_path, 'normal')} className="cursor-pointer gap-2 my-1">
                               <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-xs">Standard Analysis</span>
                                <span className="text-[10px] text-muted-foreground">Seimbang (Recommended).</span>
                              </div>
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleAnalyze(id, file.file_path, 'deep')} className="cursor-pointer gap-2">
                               <div className="h-8 w-8 rounded bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                                <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-xs">Deep Analysis</span>
                                <span className="text-[10px] text-muted-foreground">Analisa mendalam.</span>
                              </div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Icon helper import tambahan (pastikan import icon di atas sudah mencakup ini)
import { ScanSearch } from "lucide-react";