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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// --- TAMBAHAN IMPORT UI ---
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Loader2, FileText, ExternalLink, ScanSearch, 
  Building2, Table as TableIcon, FileSpreadsheet, Trash2, CheckCircle2,
  Eye, FolderOpen, Zap, Brain, ChevronDown, Activity
} from "lucide-react";

// --- TIPE DATA ---
interface UploadItem {
  _id: string | { $oid: string };
  file_name: string;
  file_path: string;
  file_type: string;
}

// Tipe baru untuk mode analisa
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
  return new Intl.NumberFormat("id-ID").format(value);
};

// --- SUB-KOMPONEN ---
const StatBox = ({ label, value, className = "" }: { label: string, value?: number, className?: string }) => (
  <div className="p-2 border rounded bg-muted/20">
    <p className="text-[10px] text-muted-foreground font-bold uppercase">{label}</p>
    <p className={`text-sm font-mono font-bold ${className}`}>{formatCurrency(value)}</p>
  </div>
);

const AnalysisResultDisplay = ({ result }: { result: any }) => {
  const rincian = result.data_keuangan_lain || [];
  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm border-l-4 border-l-blue-600">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            <h4 className="font-bold text-lg">{result.nama_entitas || "Hasil Analisis"}</h4>
          </div>
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Analisa Mendalam
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {result.periode_laporan} | {result.mata_uang} ({result.satuan_angka || "Nilai Penuh"})
        </p>
        <Separator className="my-3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox label="Aset" value={result.total_aset} />
          <StatBox label="Liabilitas" value={result.total_liabilitas} />
          <StatBox label="Ekuitas" value={result.total_ekuitas} />
          <StatBox label="Laba Bersih" value={result.laba_bersih} className={result.laba_bersih < 0 ? "text-red-500" : "text-green-600"} />
        </div>
      </div>
      {rincian.length > 0 && (
        <div className="border rounded-lg overflow-hidden text-[11px] bg-card">
          <div className="bg-muted/50 p-2 font-bold border-b flex items-center gap-2">
             <TableIcon className="h-3 w-3"/> RINCIAN DATA LAINNYA
          </div>
          <table className="w-full">
            <tbody>
              {rincian.map((row: any, i: number) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/10">
                  <td className="p-2 text-muted-foreground">{row.keterangan}</td>
                  <td className="p-2 text-right font-mono font-bold text-blue-600">
                    {formatCurrency(row.nilai)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default function AnalysePage() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  
  // PERUBAHAN 1: State untuk melacak ID file DAN Mode yang sedang berjalan
  const [analyzingState, setAnalyzingState] = useState<Record<string, AnalyzeMode | null>>({});
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

  // PERUBAHAN 2: Fungsi Analyze menerima parameter 'mode'
  const handleAnalyze = async (fileId: string, filePath: string, mode: AnalyzeMode) => {
    // Set status analyzing spesifik mode
    setAnalyzingState(prev => ({ ...prev, [fileId]: mode }));
    
    // Reset hasil lama jika ada (agar user melihat proses baru)
    setResults(prev => { const n = {...prev}; delete n[fileId]; return n; });

    // Tentukan Endpoint berdasarkan Mode
    const endpoints = {
        fast: "/api/v1/fast_analyze",    // Contoh endpoint Python/gRPC
        normal: "/api/v1/normal_analyze",       // Endpoint standar yang lama
        deep: "/api/v1/deep_analyze"     // Endpoint Deep Reasoning
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
            
            // Handle JSON Final Result
            // Tambahkan try-catch ringan untuk keamanan parsing stream
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
      // Reset status analyzing
      setAnalyzingState(prev => ({ ...prev, [fileId]: null }));
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 sticky top-0 bg-background z-10">
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
                  <BreadcrumbPage>Browse</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ModeToggle />
        </header>

        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Analisa Laporan</h1>
            <p className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">
              Total: {uploads.length} Dokumen
            </p>
          </div>

          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">Memuat data...</p>
            </div>
          ) : uploads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center border-2 border-dashed rounded-2xl bg-muted/5 p-8 animate-in fade-in zoom-in duration-300">
              <div className="bg-background shadow-sm border p-5 rounded-full mb-5">
                <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-semibold text-foreground italic">
                "saat ini tidak ada data file yang tersedia"
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                Unggah file laporan keuangan Anda (PDF atau Excel) di menu upload untuk memulai proses analisis otomatis.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {uploads.map((file) => {
                const id = getSafeId(file._id);
                const isExcel = file.file_name.toLowerCase().endsWith(".xlsx") || file.file_name.toLowerCase().endsWith(".xls");
                
                // Ambil mode yang sedang berjalan untuk file ini (jika ada)
                const currentMode = analyzingState[id]; 
                
                return (
                  <Card key={id} className="overflow-hidden border-t-4 border-t-primary shadow-md transition-all hover:shadow-lg">
                    <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {isExcel ? <FileSpreadsheet className="text-green-600 h-5 w-5 shrink-0" /> : <FileText className="text-blue-600 h-5 w-5 shrink-0" />}
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-bold text-sm truncate pr-2" title={file.file_name}>
                            {file.file_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">{file.file_type}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(id)} className="text-destructive h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        <Button variant="outline" size="sm" className="h-8 hidden sm:flex" asChild>
                          <a href={`${apiUrl}${file.file_path}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" /> Lihat
                          </a>
                        </Button>

                        {/* --- 3: DROPDOWN MENU --- */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" className="h-8 gap-2" disabled={!!currentMode}>
                              {currentMode ? (
                                <>
                                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                                  <span className="capitalize">{currentMode}...</span>
                                </>
                              ) : (
                                <>
                                  {results[id] ? <ScanSearch className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}
                                  {results[id] ? "Ulangi" : "Analisa"}
                                  <ChevronDown className="h-3 w-3 opacity-50" />
                                </>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Pilih Metode Analisa</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {/* Opsi 1: Fast */}
                            <DropdownMenuItem onClick={() => handleAnalyze(id, file.file_path, 'fast')}>
                              <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                              <div className="flex flex-col">
                                <span>Analisa Cepat</span>
                                <span className="text-[10px] text-muted-foreground">Cepat, dalam hitungan milisecond </span>
                              </div>
                            </DropdownMenuItem>

                            {/* Opsi 2: Normal */}
                            <DropdownMenuItem onClick={() => handleAnalyze(id, file.file_path, 'normal')}>
                              <FileText className="mr-2 h-4 w-4 text-blue-500" />
                              <div className="flex flex-col">
                                <span>Analisa Normal</span>
                                <span className="text-[10px] text-muted-foreground">Normal, dalam hitungan detik</span>
                              </div>
                            </DropdownMenuItem>

                            {/* Opsi 3: Deep */}
                            <DropdownMenuItem onClick={() => handleAnalyze(id, file.file_path, 'deep')}>
                              <Brain className="mr-2 h-4 w-4 text-purple-500" />
                              <div className="flex flex-col">
                                <span>Analisa Mendalam</span>
                                <span className="text-[10px] text-muted-foreground">Detail & Presisi</span>
                              </div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                      </div>
                    </div>
                    <CardContent className="p-0 min-h-[150px] bg-slate-50/30 dark:bg-slate-900/10">
                      {results[id] ? (
                        <AnalysisResultDisplay result={results[id]} />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                           {/* Tampilan Loading Spesifik Mode */}
                           {currentMode ? (
                             <div className="flex flex-col items-center gap-2">
                               <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                               <p className="text-xs animate-pulse font-medium capitalize">Sedang menjalankan {currentMode} analysis...</p>
                               <p className="text-[10px] text-muted-foreground">Mohon tunggu, AI sedang membaca dokumen.</p>
                             </div>
                           ) : (
                             <p className="text-xs italic">Belum ada hasil analisis. Pilih metode di atas untuk memulai.</p>
                           )}
                        </div>
                      )}
                    </CardContent>
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