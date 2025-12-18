"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Card, CardContent } from "@/components/ui/card"; // CardFooter dihapus jika tidak dipakai
import { Button } from "@/components/ui/button";
import { 
    Loader2, 
    FileText, 
    ExternalLink, 
    ScanSearch, 
    CheckCircle2, 
    TrendingUp, 
    Building2, 
    AlertCircle, 
    Table as TableIcon, 
    FileSpreadsheet,
    Trash2 
} from "lucide-react";

interface UploadItem {
  _id: { $oid: string } | string;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: { $date: { $numberLong: string } } | string;
}

interface FinancialDataRow {
    nama_akun: string;
    nilai_tahun_berjalan: number;
    nilai_tahun_lalu: number;
}

interface AnalysisResult {
    nama_entitas?: string;
    periode_laporan?: string;
    mata_uang?: string;
    total_aset?: number;
    total_liabilitas?: number;
    total_ekuitas?: number;
    laba_bersih?: number;
    data_keuangan?: FinancialDataRow[];
}

export default function AnalysePage() {
  const { user, loading: userLoading } = useAuth();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Loading per Item (Analisis & Delete)
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({});
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  
  const [results, setResults] = useState<Record<string, AnalysisResult>>({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  useEffect(() => {
    if (!user?.id) return;
    const fetchUploads = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/api/v1/uploads?user_id=${user.id}`);
        if (!res.ok) throw new Error("Gagal mengambil data");
        const data = await res.json();
        setUploads(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUploads();
  }, [user?.id, apiUrl]);


// --- FUNGSI HELPER: PARSER AGRESIF V4 ---
  const tryParseAndFixJson = (inputString: string) => {
    // 1. Bersihkan Markdown standard
    let clean = inputString.replace(/```json|```/g, "").trim();

    // 2. Brace Counting (Pastikan mengambil JSON utuh)
    const start = clean.indexOf('{');
    if (start === -1) throw new Error("Tidak ditemukan kurung kurawal pembuka JSON");

    let balance = 0;
    let end = -1;
    
    for (let i = start; i < clean.length; i++) {
        if (clean[i] === '{') balance++;
        else if (clean[i] === '}') balance--;

        if (balance === 0) {
            end = i;
            break;
        }
    }

    if (end !== -1) clean = clean.substring(start, end + 1);

    try {
        // Coba parse langsung (Happy Path)
        return JSON.parse(clean);
    } catch (e) {
        console.warn("JSON Parse gagal, menjalankan perbaikan V4...", e);
        
        let fixed = clean;

        // --- FIXES UTAMA (Urutan Sangat Penting) ---

        // FIX 1: Missing Colon (Kurang Titik Dua) - PENDEKATAN AGRESIF
        // Regex: Cari tanda kutip penutup, diikuti spasi (opsional), lalu diikuti tanda kutip pembuka atau angka/boolean.
        // Ganti dengan: ": "
        // Contoh: "key" "value"  -> "key": "value"
        // Contoh: "key" 123      -> "key": 123
        // Contoh: "key" true     -> "key": true
        // Perhatikan (?=...) adalah lookahead, dia mengecek tapi tidak mengambil karakter setelahnya.
        fixed = fixed.replace(/"\s+(?=["\d{tfn])/g, '": ');

        // FIX 2: Missing Comma (Kurang Koma antar Key-Value pair)
        // Regex: Cari angka/boolean/null/"value", diikuti spasi (opsional), lalu "next_key"
        // Contoh: 123 "next" -> 123, "next"
        // Contoh: "val" "next" -> "val", "next" (Hati-hati tabrakan dengan FIX 1, makanya urutan penting)
        
        // Kita perbaiki dulu value string ke key string: "value" "key" -> "value", "key"
        // Logikanya: Jika sudah ada titik dua sebelumnya, berarti ini adalah pemisah antar item.
        // Tapi regex sulit tau "sebelumnya". 
        // Kita gunakan asumsi: AI sering lupa koma setelah angka.
        fixed = fixed.replace(/(\d+|true|false|null)\s+"(?=\w+)/g, '$1, "');
        
        // FIX 3: Typo pada Key (misal _akun jadi nama_akun)
        fixed = fixed.replace(/"_akun"/g, '"nama_akun"');
        fixed = fixed.replace(/"nilaiahun_berjalan"/g, '"nilai_tahun_berjalan"');
        fixed = fixed.replace(/"nilai_t_lalu"/g, '"nilai_tahun_lalu"');

        // FIX 4: Bersihkan koma trailing (koma sebelum kurung tutup)
        fixed = fixed.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

        try {
            console.log("JSON Fixed Result:", fixed);
            return JSON.parse(fixed);
        } catch (finalErr) {
            // FALLBACK TERAKHIR: Jika masih gagal, coba regex paling brutal untuk titik dua
            try {
                // Paksa setiap string yang diikuti string lain dipisah dengan titik dua
                const bruteForce = clean.replace(/"\s+"/g, '": "'); 
                return JSON.parse(bruteForce);
            } catch (superFinal) {
                console.error("Gagal total memperbaiki JSON.\nInput:", clean, "\nFixed:", fixed);
                throw finalErr;
            }
        }
    }
  };

  // --- FUNGSI DELETE ---
  const handleDelete = async (fileId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus file ini?")) return;

    setDeletingIds((prev) => ({ ...prev, [fileId]: true }));

    try {
        const res = await fetch(`${apiUrl}/api/v1/upload/${fileId}`, {
            method: "DELETE",
        });

        if (res.ok) {
            // Update State Uploads (UI Optimistic Update)
            setUploads((prev) => prev.filter((item) => {
                const itemId = typeof item._id === 'string' ? item._id : item._id.$oid;
                return itemId !== fileId;
            }));
            
            // Hapus hasil analisis terkait jika ada
            setResults((prev) => {
                const newResults = { ...prev };
                delete newResults[fileId];
                return newResults;
            });
        } else {
            const errData = await res.json();
            alert(`Gagal menghapus: ${errData.error || "Unknown error"}`);
        }
    } catch (error) {
        console.error("Error deleting:", error);
        alert("Terjadi kesalahan koneksi saat menghapus.");
    } finally {
        setDeletingIds((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  // --- FUNGSI ANALYZE ---
  const handleAnalyze = async (fileId: string, filePath: string) => {
    setAnalyzingIds((prev) => ({ ...prev, [fileId]: true }));
    
    // Reset hasil sebelumnya saat tombol ditekan
    setResults((prev) => {
        const newResults = { ...prev };
        delete newResults[fileId];
        return newResults;
    });

    try {
        const response = await fetch(`${apiUrl}/api/v1/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file_path: filePath }),
        });

        if (!response.body) throw new Error("ReadableStream not supported");

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        let accumulatedJson = "";
        let buffer = "";

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            
            if (value) {
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || ""; 

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine === ":") continue; 
                    
                    let content = trimmedLine.replace(/^data:\s*/, "");
                    
                    // Cek Error dari Backend Rust
                    if (content.startsWith("ERR_")) {
                        throw new Error(content.replace("ERR_FMT: ", ""));
                    }

                    // Double unwrap karena proxy pattern
                    content = content.replace(/^data:\s*/, "");
                    if (content === "[DONE]") continue;

                    try {
                        const parsed = JSON.parse(content);
                        const delta = parsed.choices?.[0]?.delta?.content;
                        if (delta) accumulatedJson += delta;
                    } catch (e) { /* ignore chunk parse error */ }
                }
            }
        }

        // Parsing JSON Final dengan Auto-Fix
        try {
            const finalData = tryParseAndFixJson(accumulatedJson);
            setResults((prev) => ({ ...prev, [fileId]: finalData }));
        } catch (e) {
            console.error("Fatal JSON Error");
            alert("Gagal memparsing hasil AI (Format data rusak). Coba analisa ulang.");
        }

    } catch (error: any) {
        alert(`${error.message || "Terjadi kesalahan"}`);
    } finally {
        setAnalyzingIds((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 pr-4 border-b bg-background sticky top-0 z-10">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                   <BreadcrumbPage>Analyse Financials</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ModeToggle />
        </header>

        <main className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
             <h1 className="text-2xl font-bold tracking-tight">Analisis Laporan Keuangan</h1>
             <span className="text-sm text-muted-foreground">Total: {uploads.length} Dokumen</span>
          </div>

          {(loading || userLoading) && (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && uploads.length === 0 && (
            <div className="text-center p-10 border border-dashed rounded-xl">
              <p className="text-muted-foreground">Belum ada file.</p>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {uploads.map((item, idx) => {
              const itemId = typeof item._id === 'string' ? item._id : item._id.$oid;
              const isAnalyzing = analyzingIds[itemId];
              const isDeleting = deletingIds[itemId];
              const result = results[itemId];
              
              const isExcel = item.file_name.toLowerCase().endsWith(".xlsx") || item.file_name.toLowerCase().endsWith(".xls");
              const isSupported = isExcel || item.file_name.toLowerCase().endsWith(".csv") || item.file_name.toLowerCase().endsWith(".txt");

              return (
              <Card key={idx} className={`flex flex-col shadow-sm border overflow-hidden transition-opacity ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="p-6 border-b bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isExcel ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                            {isExcel ? <FileSpreadsheet className="h-6 w-6 text-green-600" /> : <FileText className="h-6 w-6 text-blue-600" />}
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm truncate max-w-[200px]" title={item.file_name}>
                                {item.file_name}
                            </h3>
                            <p className="text-xs text-muted-foreground capitalize">{item.file_type}</p>
                        </div>
                    </div>
                    
                    {/* BUTTON GROUP */}
                    <div className="flex gap-2 items-center">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8"
                            onClick={() => handleDelete(itemId)}
                            disabled={isDeleting || isAnalyzing}
                            title="Hapus File"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>

                        <Button variant="outline" size="sm" asChild className="h-8">
                            <a href={`${apiUrl}${item.file_path}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" /> Buka
                            </a>
                        </Button>

                        <Button 
                            size="sm" 
                            onClick={() => handleAnalyze(itemId, item.file_path)}
                            disabled={isAnalyzing || isDeleting}
                            className={`h-8 ${result ? "bg-green-600 hover:bg-green-700" : isSupported ? "bg-primary" : "bg-slate-400"}`}
                        >
                            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
                            <span className="ml-2">{isAnalyzing ? "..." : result ? "Ulang" : "Analisa"}</span>
                        </Button>
                    </div>
                </div>

                <CardContent className="p-0 flex-1 bg-slate-50 dark:bg-slate-950/50 min-h-[200px]">
                    {result ? (
                        <div className="p-4 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                             <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <Building2 className="h-5 w-5 text-blue-500 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-lg">{result.nama_entitas || "Entitas Tidak Terdeteksi"}</h4>
                                        <p className="text-sm text-muted-foreground">{result.periode_laporan} • {result.mata_uang}</p>
                                    </div>
                                </div>
                                <Separator className="my-3" />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Aset</p>
                                        <p className="font-semibold text-sm">{formatCurrency(result.total_aset)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Liabilitas</p>
                                        <p className="font-semibold text-sm">{formatCurrency(result.total_liabilitas)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Ekuitas</p>
                                        <p className="font-semibold text-sm">{formatCurrency(result.total_ekuitas)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Laba Bersih</p>
                                        <p className={`font-bold text-sm ${result.laba_bersih && result.laba_bersih < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                            {formatCurrency(result.laba_bersih)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* TABEL DATA KEUANGAN */}
                            {result.data_keuangan && result.data_keuangan.length > 0 && (
                                <div className="bg-white dark:bg-slate-900 rounded-lg border overflow-hidden">
                                    <div className="bg-muted/50 px-4 py-2 border-b flex items-center gap-2">
                                        <TableIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs font-semibold">Rincian Akun Keuangan</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-muted/20 border-b">
                                                <tr>
                                                    <th className="text-left py-2 px-4 font-medium text-muted-foreground">Nama Akun</th>
                                                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">Tahun Berjalan</th>
                                                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">Tahun Lalu</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.data_keuangan.map((row, rIdx) => (
                                                    <tr key={rIdx} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <td className="py-2 px-4 font-medium">{row.nama_akun}</td>
                                                        <td className="py-2 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                                                            {formatCurrency(row.nilai_tahun_berjalan)}
                                                        </td>
                                                        <td className="py-2 px-4 text-right font-mono text-muted-foreground">
                                                            {formatCurrency(row.nilai_tahun_lalu)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
                            {isAnalyzing ? (
                                <div className="text-center space-y-2">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                                    <p className="text-sm">Sedang memproses dokumen...</p>
                                </div>
                            ) : !isSupported ? (
                                <div className="text-center space-y-2">
                                    <AlertCircle className="h-8 w-8 mx-auto text-amber-500" />
                                    <p className="text-sm px-4">File ini tidak didukung untuk <br/>analisis teks keuangan.</p>
                                </div>
                            ) : (
                                <div className="text-center space-y-2 opacity-50">
                                    <TrendingUp className="h-10 w-10 mx-auto" />
                                    <p className="text-sm">Klik "Analisa" untuk memproses data.</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
              </Card>
            )})}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}