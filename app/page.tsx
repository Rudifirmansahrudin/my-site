"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Koneksi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [bioLevel, setBioLevel] = useState(1); // 0: Short, 1: Medium, 2: Long
  const [stats, setStats] = useState({ booksRead: 0, pagesRead: 0, moviesReviewed: 0, projectsBuilt: 12 });
  const [now, setNow] = useState({ currentBook: "Loading...", latestMovie: "Loading..." });

  // Fetch Data Live dari Supabase
  useEffect(() => {
    async function fetchStats() {
      if (supabaseUrl === "https://dummy.supabase.co") return;

      // Ambil Buku
      const { data: books } = await supabase.from("books").select("status, pages, title").order("read_date", { ascending: false });
      if (books) {
        const finishedBooks = books.filter(b => b.status?.toLowerCase() === "finished" || b.status?.toLowerCase() === "read");
        const readingBooks = books.filter(b => b.status?.toLowerCase() === "reading");
        
        const totalPages = finishedBooks.reduce((sum, b) => sum + (b.pages || 0), 0);
        
        setStats(prev => ({ ...prev, booksRead: finishedBooks.length, pagesRead: totalPages }));
        if (readingBooks.length > 0) setNow(prev => ({ ...prev, currentBook: readingBooks[0].title }));
        else setNow(prev => ({ ...prev, currentBook: "Nggak ada (lagi sibuk ngoding)" }));
      }

      // Ambil Movies
      const { data: movies } = await supabase.from("movies").select("title").order("reviewed_at", { ascending: false }).limit(1);
      if (movies && movies.length > 0) {
        setStats(prev => ({ ...prev, moviesReviewed: movies.length })); // Hitungan kasar, idealnya count()
        setNow(prev => ({ ...prev, latestMovie: movies[0].title }));
      }
    }
    
    fetchStats();
  }, []);

  // Konten Bio Dinamis
  const bioContent = {
    0: "Business student blending strategic analysis, market trading, and code.",
    1: "I bridge the gap between market logic and tech. By day, I study business at FEB UNNES and build web apps; by night, I execute data-driven analysis in financial markets.",
    2: "I'm a business student at FEB UNNES actively engaging in foreign exchange, equity markets, and full-stack software development. I believe the most robust solutions emerge when you deeply understand both the economic numbers and the code that powers them."
  };

  return (
    <div className="space-y-32 pb-24">
      
      {/* 1. HERO SECTION */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-16 md:gap-8 pt-10">
        
        {/* Kiri: Teks & Bio */}
        <div className="w-full md:w-[55%] space-y-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold font-sans tracking-tight text-gray-900">Hello, I'm Rudi</h1>
            <p className="text-lg md:text-xl text-gray-600 mt-4 font-sans leading-relaxed">
              Business student translating complex market problems into elegant digital solutions.
            </p>
          </div>
          
          {/* Social Links (Lebih gelap & bergaris bawah) */}
          <div className="flex gap-6 font-mono text-sm uppercase tracking-widest font-bold text-gray-800">
            <a href="#" className="underline decoration-gray-300 hover:decoration-indigo-500 underline-offset-4 transition-all">LinkedIn</a>
            <a href="#" className="underline decoration-gray-300 hover:decoration-indigo-500 underline-offset-4 transition-all">GitHub</a>
            <a href="#" className="underline decoration-gray-300 hover:decoration-indigo-500 underline-offset-4 transition-all">Email</a>
          </div>

          {/* Interactive Bio Slider */}
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl mt-8 shadow-sm">
            <div className="flex justify-between font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-3 px-1">
              <button onClick={() => setBioLevel(0)} className={bioLevel === 0 ? "text-indigo-600 font-bold" : "hover:text-gray-700"}>Short</button>
              <button onClick={() => setBioLevel(1)} className={bioLevel === 1 ? "text-indigo-600 font-bold" : "hover:text-gray-700"}>Medium</button>
              <button onClick={() => setBioLevel(2)} className={bioLevel === 2 ? "text-indigo-600 font-bold" : "hover:text-gray-700"}>Long</button>
            </div>
            
            {/* Slider Track Custom */}
            <input 
              type="range" min="0" max="2" step="1" 
              value={bioLevel} onChange={(e) => setBioLevel(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-6"
            />
            
            <p className="font-sans text-gray-600 leading-relaxed text-[15px] min-h-[80px]">
              {bioContent[bioLevel as keyof typeof bioContent]}
            </p>
          </div>

          <Link href="/about" className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold rounded-full transition-colors shadow-md text-sm">
            Learn more about me
          </Link>
        </div>

        {/* Kanan: 3 Overlapping Polaroids (Jadi Link) */}
        <div className="w-full md:w-[45%] relative h-[320px] flex justify-center items-center">
          
          {/* Polaroid 1 (Kiri) */}
          <Link href="/postcards" className="absolute left-[5%] top-[10%] w-[160px] transform -rotate-6 hover:rotate-0 hover:z-40 hover:scale-105 transition-all duration-300 bg-white p-2.5 pb-8 rounded-sm shadow-xl border border-gray-100 z-10">
            <div className="w-full aspect-square bg-[#FBCFE8] rounded-sm overflow-hidden relative">
              {/* TODO: Ganti src gambar ini nanti */}
              <div className="absolute inset-0 flex items-center justify-center text-pink-500 text-xs font-mono opacity-50">Upload Foto 1</div>
            </div>
            <p className="text-center font-handwriting text-gray-700 mt-4 text-xl leading-none">Campus life</p>
          </Link>

          {/* Polaroid 2 (Kanan) */}
          <Link href="/create" className="absolute right-[5%] top-[5%] w-[160px] transform rotate-6 hover:rotate-0 hover:z-40 hover:scale-105 transition-all duration-300 bg-white p-2.5 pb-8 rounded-sm shadow-xl border border-gray-100 z-20">
            <div className="w-full aspect-square bg-[#FDE68A] rounded-sm overflow-hidden relative">
              {/* TODO: Ganti src gambar ini nanti */}
              <div className="absolute inset-0 flex items-center justify-center text-yellow-600 text-xs font-mono opacity-50">Upload Foto 2</div>
            </div>
            <p className="text-center font-handwriting text-gray-700 mt-4 text-xl leading-none">Building things</p>
          </Link>

          {/* Polaroid 3 (Tengah, Paling Depan) */}
          <Link href="/resources/books" className="absolute top-[25%] w-[170px] transform -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300 bg-white p-3 pb-10 rounded-sm shadow-2xl border border-gray-100 z-30">
            <div className="w-full aspect-square bg-[#DDD6FE] rounded-sm overflow-hidden relative">
              {/* TODO: Ganti src gambar ini nanti */}
              <div className="absolute inset-0 flex items-center justify-center text-purple-500 text-xs font-mono opacity-50">Upload Foto 3</div>
            </div>
            <p className="text-center font-handwriting text-gray-700 mt-4 text-2xl leading-none">Currently reading</p>
          </Link>

        </div>
      </section>

      {/* 2. STRIP "NOW" (Integrasi Live) */}
      <section className="bg-gray-900 text-white rounded-2xl p-6 flex flex-col md:flex-row gap-6 md:gap-12 shadow-lg items-start md:items-center justify-center">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Currently Reading</span>
          <span className="font-sans font-bold text-sm">{now.currentBook}</span>
        </div>
        <div className="hidden md:block w-px h-8 bg-gray-700"></div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Latest Movie Review</span>
          <span className="font-sans font-bold text-sm">{now.latestMovie}</span>
        </div>
      </section>

      {/* 3. WORK WITH ME (Warna Pastel) */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold font-sans tracking-tight text-gray-900">Work With Me</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] p-8 rounded-2xl shadow-sm transition-transform hover:-translate-y-1">
            <h3 className="font-bold text-lg font-sans text-gray-900 mb-3">Business Analysis</h3>
            <p className="text-sm font-sans text-gray-600 leading-relaxed">
              Translating raw data and market trends into actionable, structured strategies for modern operations.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#F5F3FF] border border-[#DDD6FE] p-8 rounded-2xl shadow-sm transition-transform hover:-translate-y-1">
            <h3 className="font-bold text-lg font-sans text-gray-900 mb-3">Tech Projects</h3>
            <p className="text-sm font-sans text-gray-600 leading-relaxed">
              Architecting and building practical, scalable web applications utilizing modern tech stacks and databases.
            </p>
          </div>

          {/* Card 3 (Pengganti Speaking) */}
          <div className="bg-[#FDF2F8] border border-[#FBCFE8] p-8 rounded-2xl shadow-sm transition-transform hover:-translate-y-1">
            <h3 className="font-bold text-lg font-sans text-gray-900 mb-3">Market & Trading</h3>
            <p className="text-sm font-sans text-gray-600 leading-relaxed">
              Executing data-driven technical analysis and navigating dynamic conditions in financial and crypto markets.
            </p>
          </div>
        </div>
      </section>

      {/* 4. BY THE NUMBERS (Live Data) */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold font-sans tracking-tight text-gray-900">By The Numbers</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl text-center flex flex-col gap-2 shadow-sm">
            <span className="text-4xl font-extrabold font-sans text-indigo-600">{stats.projectsBuilt}+</span>
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Projects Built</span>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl text-center flex flex-col gap-2 shadow-sm">
            <span className="text-4xl font-extrabold font-sans text-indigo-600">{stats.booksRead}</span>
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Books Read</span>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl text-center flex flex-col gap-2 shadow-sm">
            <span className="text-4xl font-extrabold font-sans text-indigo-600">{stats.pagesRead}</span>
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Pages Digested</span>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl text-center flex flex-col gap-2 shadow-sm">
            <span className="text-4xl font-extrabold font-sans text-indigo-600">999+</span>
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Cups of Coffee</span>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PROJECTS */}
      <section className="space-y-8">
        <div className="flex justify-between items-end border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold font-sans tracking-tight text-gray-900">Featured Projects</h2>
          <Link href="/create" className="font-mono text-xs text-indigo-600 hover:text-indigo-800 uppercase tracking-widest font-bold">
            View all →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skeleton Projects Sementara */}
          {[1, 2, 3].map((num) => (
            <div key={num} className="bg-gray-50 border border-gray-100 p-6 rounded-2xl shadow-sm">
              <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="font-bold text-sm font-sans text-gray-900 mb-2">Project Name {num}</h3>
              <p className="text-xs font-sans text-gray-500">A short description of this awesome project goes here.</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
