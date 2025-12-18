'use client'

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BrainCircuit, LineChart, ShieldCheck, Zap, Globe, Target, Github, ExternalLink } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  // Menggunakan URL Icon dari Instagram yang Anda berikan
  const OryphemIcon = "images/orpLogo.png"

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30 font-sans transition-colors duration-300">
      
      {/* Background Decor - Menggunakan warna Emerald/Hijau khas Oryphem */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 dark:bg-emerald-900/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-600/10 dark:bg-blue-900/15 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-md bg-background/60">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tighter  text-emerald-600 dark:text-emerald-400">Oryphem</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#ecosystem" className="hover:text-emerald-500 transition-colors">Ecosystem</Link>
            <Link href="#principle" className="hover:text-emerald-500 transition-colors">Principle</Link>
            <Link href="https://github.com/b4its/kivo" className="hover:text-emerald-500 transition-colors flex items-center gap-1">
              <Github className="w-4 h-4" /> Github
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="rounded-full hidden sm:flex border-emerald-500/20 hover:bg-emerald-500/5" asChild>
              <Link href="/login">Portal Login</Link>
            </Button>
            <ModeToggle />

          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        
        {/* Hero Section with Banner Integration */}
        <section className="relative pt-24 mb-24 text-center overflow-hidden rounded-[3rem] border border-border shadow-2xl">
          {/* Menggunakan OryphemBanner (1).jpg sebagai background hero */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/OryphemBanner (1).jpg" 
              alt="Oryphem Hero Banner" 
              className="w-full h-full object-cover opacity-20 dark:opacity-30 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/80 to-background" />
          </div>

          <div className="relative z-10 py-20 px-6">
            <Badge variant="outline" className="mb-6 py-1 px-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10">
              Beta Version
            </Badge>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              EMPOWERING YOUR <br />
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 bg-clip-text text-transparent ">
                Digital Evolution
              </span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              Membangun ekosistem solusi berbasis AI yang membantu bisnis bertumbuh dari ideasi hingga akselerasi finansial secara cerdas dan aman.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="rounded-full px-8 group bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20">
                Get Started For Free <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 border-emerald-500/20 hover:bg-emerald-500/5">
                View Documentation
              </Button>
            </div>
          </div>
        </section>

        {/* Core Principle Section */}
        <section id="principle" className="max-w-4xl mx-auto mb-32 p-12 text-center rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10">
          <p className="text-sm font-bold tracking-[0.3em] text-emerald-600 dark:text-emerald-400 mb-6">Our Commitment</p>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight  text-foreground/90 leading-tight">
            "We are committed to providing the most <span className="text-emerald-500 underline decoration-emerald-500/30 underline-offset-8">effective solution</span> to your problem."
          </h2>
        </section>

        {/* Bento Grid Ecosystem */}
        <section id="ecosystem" className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-32">
          
          {/* KIVO Card dengan Screenshot dari image_2025-12-08_00-39-10.jpg */}
          <Card className="md:col-span-7 bg-card border-border hover:border-emerald-500/50 transition-all duration-500 group shadow-lg overflow-hidden flex flex-col">
            <div className="relative aspect-video w-full overflow-hidden border-b border-border">
              <img 
                src="images/kivoPreview.png" 
                alt="Kivo Live Demo Screenshot" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <Badge className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-none">Business Validation</Badge>
                <Link href="https://kivoai.netlify.app/" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
              <CardTitle className="text-4xl font-black tracking-tighter ">Kivo</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Platform AI Agent untuk menemukan ide bisnis relevan dan memvalidasinya menjadi strategi Business Model Canvas.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button variant="secondary" className="w-full bg-muted/50 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold" asChild>
                <Link href="https://kivoai.netlify.app/">Experience AI Agent</Link>
              </Button>
            </CardContent>
          </Card>

          {/* KePin Card dengan skema warna hijau khas SmartFin */}
          <Card className="md:col-span-5 bg-card border-border hover:border-emerald-500/50 transition-all duration-500 shadow-lg flex flex-col justify-between">
            <CardHeader className="text-center pt-12">
              <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6 ring-4 ring-emerald-500/5 animate-pulse">
                <LineChart className="w-10 h-10 text-emerald-500" />
              </div>
              <Badge className="w-fit mx-auto mb-4 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-none">Smart Accounting</Badge>
              <CardTitle className="text-4xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400 ">KePin</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Sistem accounting cerdas berbasis Machine Learning untuk mencatat dan memprediksi laba real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50 mb-8 space-y-4">
                 <div className="flex items-center gap-3 text-sm font-semibold  text-foreground/80">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> Zero-Trust Security 
                 </div>
                 <div className="flex items-center gap-3 text-sm font-semibold  text-foreground/80">
                    <BrainCircuit className="w-5 h-5 text-emerald-500" /> ML Profit Prediction 
                 </div>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 group py-6 text-lg font-black  tracking-widest">
                Launch KePin <Target className="ml-2 w-5 h-5 group-hover:scale-125 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Visionary Section dengan Foto Baits Rika Saputra */}
        <section id="team" className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center border-t border-border pt-24">
            <div className="space-y-8">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight ">The Visionary Behind <br/> Oryphem</h2>
                <p className="text-muted-foreground text-lg leading-relaxed  border-l-4 border-emerald-500 pl-6 py-2">
                    "Oryphem tidak sekadar membangun aplikasi. Kami membangun fondasi bagi UMKM agar lebih berani bermimpi dengan data tervalidasi dan keuangan sehat."
                </p>
                <div className="flex items-center gap-5 p-5 bg-muted/50 rounded-3xl w-fit border border-border">
                    <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-black text-emerald-600 shadow-inner overflow-hidden border-2 border-emerald-500/20">
                      {/* Menggunakan Icon Logo sebagai avatar founder jika foto belum tersedia */}
                      <img src={OryphemIcon} alt="Baits Rika Saputra" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="font-black text-2xl leading-none mb-1">Baits Rika Saputra</p>
                        <p className="text-xs text-muted-foreground tracking-[0.3em] font-bold">Founder</p>
                        {/* <p className="text-[10px] text-emerald-500 font-bold mt-1 tracking-widest ">POLITEKNIK NEGERI SAMARINDA</p> */}
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
                <div className="p-10 rounded-[3rem] bg-card border border-border text-center shadow-lg hover:shadow-emerald-500/5 transition-all">
                    <p className="text-6xl font-black mb-1 tracking-tighter ">2025</p>
                    <p className="text-xs text-muted-foreground font-black tracking-[0.2em]">Founded</p>
                </div>
                <div className="p-10 rounded-[3rem] bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-center shadow-lg hover:shadow-emerald-500/10 transition-all">
                    <p className="text-6xl font-black text-emerald-600 dark:text-emerald-400 mb-1 tracking-tighter ">95%</p>
                    <p className="text-xs text-muted-foreground font-black tracking-[0.2em]">AI Accuracy</p>
                </div>
            </div>
        </section>
      </main>

      {/* Footer Branding sesuai permintaan */}
      <footer className="border-t border-border py-20 px-6 text-center text-muted-foreground bg-muted/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          <div className="flex items-center gap-4 opacity-80 hover:opacity-100 transition-all cursor-pointer">
            <img src={OryphemIcon} className="w-8 h-8 rounded-lg shadow-emerald-500/20 shadow-md" />
            <div className="text-2xl font-black tracking-tighter text-foreground  tracking-widest">Oryphem</div>
          </div>
          <p className="text-sm font-bold tracking-widest  opacity-70">
            © 2025 ORYPHEM TECHNOLOGIES. POWERED BY SMARTFIN: KePin & Kivo
          </p>
        </div>
      </footer>
    </div>
  )
}