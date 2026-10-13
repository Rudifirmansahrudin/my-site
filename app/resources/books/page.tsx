"use client";
import { useState } from "react";
import booksData from "@/content/books.json";

// Fungsi acak konsisten berdasarkan id buku
const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
};

// 1. Palet warna pastel/light yang lembut dan estetik
const fallbackColors = [
  "#FCA5A5", // Light Red / Peach
  "#FCD34D", // Light Yellow
  "#86EFAC", // Light Green / Mint
  "#93C5FD", // Light Blue
  "#C4B5FD", // Light Purple
  "#F9A8D4"  // Light Pink
];

// 2. Fungsi pintar untuk mencegah warna sama bersebelahan (berdasarkan tumpukan)
const getSafeColor = (book: any, index: number, allBooks: any[]): string => {
  // Jika warna sudah didefinisikan di JSON, gunakan warna tersebut
  if (book.color) return book.color;

  // Tentukan indeks warna dasar dari hash ID
  let colorIdx = hashString(book.id) % fallbackColors.length;
  let finalColor = fallbackColors[colorIdx];

  // Jika ini bukan buku pertama di tumpukan, cek warna buku di bawahnya
  if (index > 0) {
    const prevBook = allBooks[index - 1];
    // Panggil getSafeColor secara rekursif untuk tahu warna pasti dari buku sebelumnya
    const prevColor = getSafeColor(prevBook, index - 1, allBooks);

    // Jika warna ternyata sama persis dengan buku di bawahnya, geser 1 index
    if (finalColor === prevColor) {
      finalColor = fallbackColors[(colorIdx + 1) % fallbackColors.length];
    }
  }
  
  return finalColor;
};

export default function BooksPage() {
  const [zoom, setZoom] = useState(0.08);

  const readingBooks = booksData.filter(b => b.status === "reading");
  const readBooks = booksData.filter(b => b.status === "read");

  const booksByYear = readBooks.reduce((acc: any, book) => {
    const year = new Date(book.finishedAt).getFullYear();
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
        <div className="flex gap-6 overflow-x-auto py-2">
          {readingBooks.map((book, index) => {
            // Panggil fungsi warna aman di sini
            const bookColor = getSafeColor(book, index, readingBooks);

            return (
              <div 
                key={book.id} 
                // Catatan: text-white diganti jadi text-gray-900 agar kontras dengan warna pastel
                className="relative w-36 h-52 rounded-sm shadow-md border border-gray-300 flex items-center justify-center p-4 text-center bg-cover bg-center text-gray-900" 
                style={{ backgroundColor: bookColor }}
              >
                <span className="font-sans font-bold text-sm drop-shadow-sm">{book.title}</span>
                <div className="absolute -top-3 -right-3 bg-yellow-300 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full rotate-12 shadow-sm border border-yellow-400">
                  Reading
                </div>
              </div>
            );
          })}
        </div>
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
              className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center"
            >-</button>
            <button 
              onClick={() => setZoom(Math.min(0.2, zoom + 0.02))} 
              className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center"
            >+</button>
          </div>
        </div>

        {/* Kotak Grafik Tumpukan */}
        <div className="bg-[#f1f4f9] border border-gray-200 rounded-[14px] p-8 overflow-x-auto">
          <div className="flex items-end justify-start gap-16 md:gap-28 min-w-max pt-12 pb-6 px-6">
            {years.map(year => {
              const yearBooks = booksByYear[year].sort((a: any, b: any) => new Date(a.finishedAt).getTime() - new Date(b.finishedAt).getTime());
              const totalPages = yearBooks.reduce((sum: number, b: any) => sum + b.pages, 0);

              return (
                <div key={year} className="flex flex-col items-center justify-end">
                  
                  {/* Tumpukan Buku */}
                  <div className="relative flex flex-col-reverse items-center w-44 mb-6">
                    {yearBooks.map((book: any, index: number) => {
                      const hash = hashString(book.id);
                      const widthPercent = 88 + (hash % 12); 
                      const offset = -4 + (hash % 9); 
                      const height = Math.max(18, book.pages * zoom); 
                      
                      // 3. Panggil fungsi pencegah warna ganda di tumpukan
                      const bookColor = getSafeColor(book, index, yearBooks);

                      return (
                        <div 
                          key={book.id}
                          className="group relative flex items-center justify-center border border-black/15 shadow-sm transition-transform hover:scale-105 cursor-pointer rounded-[2px]"
                          style={{
                            backgroundColor: bookColor,
                            width: `${widthPercent}%`,
                            height: `${height}px`,
                            transform: `translateX(${offset}px)`,
                            marginBottom: '-1px'
                          }}
                        >
                          {/* Catatan: Warna teks diubah ke text-gray-900 agar terbaca di atas warna pastel */}
                          <span className="text-gray-900 font-sans font-bold text-[11px] truncate px-3">
                            {book.title}
                          </span>

                          {/* Tooltip Hover */}
                          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-48 bg-white border border-gray-200 p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none text-left">
                            <p className="font-sans font-bold text-gray-900 leading-tight mb-1">{book.title}</p>
                            <p className="font-mono text-[10px] text-gray-500">{book.author}</p>
                            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between font-mono text-[9px] text-gray-400">
                              <span>{book.pages} pages</span>
                              <span>{new Date(book.finishedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {/* Garis Dasar Meja */}
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
