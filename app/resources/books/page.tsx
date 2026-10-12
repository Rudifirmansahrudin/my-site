"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Koneksi ke Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";
const supabase = createClient(supabaseUrl, supabaseKey);

// Tipe Data Buku menyesuaikan kolom Supabase
type Book = {
  id: number | string;
  created_at: string;
  title: string;
  author: string | null;
  status: string | null;
  cover_url: string | null;
  pages: number | null;
  read_date: string | null;
  notes: string | null;
  sort_order: number | null;
};

// Fungsi acak konsisten berdasarkan teks (buat nentuin lebar buku & warna)
const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
};

// Palet warna estetik untuk cover / punggung buku otomatis
const getColor = (title: string) => {
  const colors = [
    '#EF476F', '#F78C6B', '#06D6A0', '#118AB2', '#073B4C', 
    '#8E44AD', '#E67E22', '#2ECC71', '#34495E', '#D35400'
  ];
  return colors[hashString(title) % colors.length];
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(0.08); // Skala tinggi buku

  useEffect(() => {
    async function fetchBooks() {
      try {
        const { data, error } = await supabase
          .from("books")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("read_date", { ascending: false });

        if (error) throw error;
        setBooks((data as Book[]) || []);
      } catch (err: any) {
        console.error("Gagal narik data buku:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (supabaseUrl !== "https://dummy.supabase.co") {
      fetchBooks();
    } else {
      setError("File .env.local belum diatur kuncinya nih bro!");
      setLoading(false);
    }
  }, []);

  // Filter buku berdasarkan status
  const readingBooks = books.filter(b => b.status?.toLowerCase() === "reading");
  const readBooks = books.filter(b => b.status?.toLowerCase() === "finished" || b.status?.toLowerCase() === "read");

  // Kelompokkan buku berdasarkan tahun selesainya (read_date)
  const booksByYear = readBooks.reduce((acc: any, book) => {
    if (!book.read_date) return acc;
    const year = new Date(book.read_date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(book);
    return acc;
  }, {});

  const years = Object.keys(booksByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="space-y-16 pb-24">
      
      {/* Bagian Atas: Rak "Currently Reading" */}
      <section className="space-y-4">
        <h1 className="text-4xl font-sans font-bold">Books</h1>
        <h2 className="text-xl font-sans font-bold text-gray-700">Currently Reading</h2>
        
        {loading ? (
          <div className="flex h-40 items-center">
            <p className="text-indigo-600 font-mono animate-pulse">Memuat perpustakaan...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg font-mono text-sm border border-red-100">
            {error}
          </div>
        ) : readingBooks.length === 0 ? (
          <p className="text-gray-400 font-mono text-sm border-2 border-dashed border-gray-200 p-8 rounded-xl max-w-md">
            Lagi nggak baca buku apa-apa.
          </p>
        ) : (
          <div className="flex gap-6 overflow-x-auto py-2">
            {readingBooks.map(book => {
              const bgStyle = book.cover_url 
                ? { backgroundImage: `url(${book.cover_url})`, backgroundColor: '#f3f4f6' }
                : { backgroundColor: getColor(book.title) };

              return (
                <div 
                  key={book.id} 
                  className="relative shrink-0 w-36 h-52 rounded-sm shadow-md border border-gray-300 flex items-center justify-center p-4 text-center bg-cover bg-center overflow-hidden group" 
                  style={bgStyle}
                >
                  {/* Kalau nggak ada cover, tampilin judulnya di kotak warna */}
                  {!book.cover_url && (
                    <span className="font-sans font-bold text-sm text-white drop-shadow-md z-10">{book.title}</span>
                  )}
                  
                  {/* Label Reading Kuning */}
                  <div className="absolute -top-3 -right-3 z-20 bg-yellow-300 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full rotate-12 shadow-sm border border-yellow-400">
                    Reading
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bagian Bawah: Grafik Tumpukan Buku */}
      <section className="space-y-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-sans font-bold">Read Archive & Stack Graph</h2>
          
          {/* Kontrol Zoom */}
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-gray-500 mr-2">Zoom:</span>
            <button 
              onClick={() => setZoom(Math.max(0.03, zoom - 0.02))} 
              className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center transition-colors"
            >-</button>
            <button 
              onClick={() => setZoom(Math.min(0.2, zoom + 0.02))} 
              className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center transition-colors"
            >+</button>
          </div>
        </div>

        {/* Kotak Grafik Tumpukan */}
        <div className="bg-[#f1f4f9] border border-gray-200 rounded-[14px] p-8 overflow-x-auto min-h-[300px]">
          {years.length === 0 && !loading && (
            <div className="h-full flex items-center justify-center text-gray-400 font-mono text-sm">
              Belum ada buku yang diselesaikan.
            </div>
          )}

          <div className="flex items-end justify-start gap-16 md:gap-28 min-w-max pt-12 pb-6 px-6">
            {years.map(year => {
              // Urutkan dari yang paling lama dibaca sampai paling baru di tahun itu (biar numpuknya pas)
              const yearBooks = booksByYear[year].sort((a: any, b: any) => 
                new Date(a.read_date).getTime() - new Date(b.read_date).getTime()
              );
              const totalPages = yearBooks.reduce((sum: number, b: any) => sum + (b.pages || 0), 0);

              return (
                <div key={year} className="flex flex-col items-center justify-end">
                  
                  {/* Tumpukan Buku (Dirender dari bawah ke atas pakai flex-col-reverse) */}
                  <div className="relative flex flex-col-reverse items-center w-44 mb-6">
                    {yearBooks.map((book: any) => {
                      const hash = hashString(book.title);
                      const widthPercent = 88 + (hash % 12); // Lebar bervariasi 88-100%
                      const offset = -4 + (hash % 9); // Geser horizontal tipis -4px s/d +4px
                      const height = Math.max(18, (book.pages || 200) * zoom); // Tinggi proporsional

                      return (
                        <div 
                          key={book.id}
                          // MAGIC CLASS: hover:z-50 bikin dia gak ketiban elemen lain saat disorot!
                          className="group relative flex items-center justify-center border border-black/15 shadow-sm transition-all hover:scale-105 hover:z-50 cursor-pointer rounded-[2px]"
                          style={{
                            backgroundColor: getColor(book.title), // Warna otomatis
                            width: `${widthPercent}%`,
                            height: `${height}px`,
                            transform: `translateX(${offset}px)`,
                            marginBottom: '-1px'
                          }}
                        >
                          {/* Judul di Punggung Buku */}
                          <span className="text-white font-sans font-bold text-[11px] truncate px-3 drop-shadow-sm">
                            {book.title}
                          </span>

                          {/* Tooltip Hover yang Gak Ketiban */}
                          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-48 bg-white border border-gray-200 p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none">
                            <p className="font-sans font-bold text-gray-900 leading-tight mb-1">{book.title}</p>
                            <p className="font-mono text-[10px] text-gray-500">{book.author || "Unknown Author"}</p>
                            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between font-mono text-[9px] text-gray-400">
                              <span>{book.pages || '?'} pages</span>
                              <span>{book.read_date ? new Date(book.read_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : ''}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {/* Garis Dasar Meja (Shelf) */}
                    <div className="w-[130%] h-1.5 bg-gray-300 rounded-full absolute -bottom-3"></div>
                  </div>

                  {/* Label Tahun di Bawah */}
                  <div className="text-center font-mono text-xs text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                    <span className="font-bold text-gray-900 text-sm mr-2">{year}</span>
                    <span className="text-gray-400">|</span>
                    <span className="ml-2">{yearBooks.length} books ({totalPages}p)</span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
