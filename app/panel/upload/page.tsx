"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation"; // Tambahkan Router
import { useAuth } from "@/context/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, File as FileIcon, Loader2, AlertCircle, X, CheckCircle2 } from "lucide-react";

function UploadForm() {
  const { user, loading: isFetchingUser } = useAuth();
  const router = useRouter(); // Init Router
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  
  const previewUrl = useMemo(() => {
    if (file && file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    if (selectedFile.size > MAX_SIZE) {
      setStatus("error");
      setMessage("Ukuran file melebihi batas 20MB.");
      return;
    }

    setFile(selectedFile);
    setStatus("idle");
    setMessage("");
  };

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file || !user?.id) return;

    setStatus("uploading");
    
    const formData = new FormData();
    formData.append("user_id", user.id); // Pastikan user.id ada dari context
    formData.append("file", file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const response = await fetch(`${apiUrl}/api/v1/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Upload berhasil! Mengalihkan...");
        
        // Redirect ke halaman analyse setelah 1.5 detik
        setTimeout(() => {
            router.push("/panel/browse"); 
        }, 1500);
        
      } else {
        throw new Error(result.message || "Gagal upload");
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Terjadi kesalahan koneksi.");
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl shadow-md border-t-4 border-t-primary mt-10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Upload className="h-6 w-6 text-primary" />
          Upload Data Dokumen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div 
          className={`relative group border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${
            file ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/40"
          }`}
        >
          {file ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
               <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleReset}>
                  <X className="h-4 w-4" />
               </Button>

              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-32 object-contain rounded-md mb-3 shadow-sm" />
              ) : (
                <FileIcon className="h-16 w-16 text-primary mx-auto mb-3" />
              )}
              
              <p className="font-semibold text-lg max-w-[250px] truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <label htmlFor="file-upload" className="cursor-pointer w-full text-center">
              <div className="bg-muted p-4 rounded-full w-fit mx-auto mb-4 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <Upload className="h-8 w-8" />
              </div>
              <p className="font-medium">Klik untuk memilih file</p>
              <p className="text-xs text-muted-foreground mt-1">CSV, PDF, XLSX, dan Gambar(Maks. 2MB)</p>
            </label>
          )}
          
          <Input
            id="file-upload"
            type="file"
            className="hidden" 
            onChange={handleFileChange}
            accept=".pdf,image/*"
            disabled={status === "uploading"}
          />
        </div>

        <div className="space-y-4">
          {status === "uploading" && (
            <div className="flex items-center gap-2 text-primary font-medium bg-primary/5 p-3 rounded-lg border border-primary/20">
              <Loader2 className="h-5 w-5 animate-spin" /> 
              Mengunggah...
            </div>
          )}
          
          {status === "success" && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 animate-in slide-in-from-top-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">{message}</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/20 animate-in shake">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-semibold">{message}</span>
            </div>
          )}
          
          <Button 
            onClick={handleUpload} 
            className="w-full text-lg h-12 shadow-lg transition-transform active:scale-[0.98]"
            disabled={!file || status === "uploading" || isFetchingUser || !user?.id}
          >
            {status === "uploading" ? "Mohon Tunggu..." : "Unggah Sekarang"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Page() {
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">KePin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Panel</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Upload</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ModeToggle />
        </header>

        <main className="flex flex-1 flex-col gap-4 p-6">
          <UploadForm />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}