"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@supabase/supabase-js";

// Koneksi ke Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";
const supabase = createClient(supabaseUrl, supabaseKey);

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

// Hash konsisten dari judul (buat warna & variasi lebar buku)
const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return hash;
};

// Semua warna di sini cukup gelap buat teks putih (kontras >= ~4.5:1)
const PALETTE = [
  "#4338ca", // indigo (senada sama aksen navbar)
  "#0f766e", // teal
  "#b45309", // amber gelap
  "#be123c", // rose
  "#1d4ed8", // biru
  "#6d28d9", // ungu
  "#0e7490", // cyan gelap
  "#15803d", // hijau
  "#9a3412", // oranye bata
  "#334155", // slate
];
const getColor = (title: string) => PALETTE[hashString(title) % PALETTE.length];

// Ukuran kartu tooltip (dipakai buat hitung posisi)
const CARD_W = 208;
const CARD_H = 92;
const GAP = 12;

type Tip = { book: Book; left: number; top: number };

// Cari posisi kartu: utamakan di ATAS tumpukan (gak nutupin buku lain),
// kalau gak muat coba kanan, lalu kiri, terakhir di bawah.
function placeCard(bar: DOMRect, stack: DOMRect) {
  const vw = window.innerWidth;
  const clampX = (x: number) => Math.max(GAP, Math.min(x, vw - CARD_W - GAP));

  const aboveTop = stack.top - CARD_H - GAP;
  if (aboveTop >= GAP) {
    return { left: clampX(bar.left + bar.width / 2 - CARD_W / 2), top: aboveTop };
  }
  const midY = Math.max(GAP, bar.top + bar.height / 2 - CARD_H / 2);
  if (bar.right + GAP + CARD_W <= vw - GAP) return { left: bar.right + GAP, top: midY };
  if (bar.left - GAP - CARD_W >= GAP) return { left: bar.left - GAP - CARD_W, top: midY };
  return { left: clampX(bar.left + bar.width / 2 - CARD_W / 2), top: stack.bottom + GAP + 48 };
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(0.08);
  const [tip, setTip] = useState<Tip | null>(null);
  const [mounted, setMounted] = useState(false);
  const stackRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => setMounted(true), []);

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
      } catch (err) {
        console.error("Gagal narik data buku:", err);
        setError(err instanceof Error ? err.message : "Gagal memuat buku.");
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

  // Tooltip pakai posisi fixed, jadi tutup kalau halaman di-scroll / di-tap di luar
  useEffect(() => {
    if (!tip) return;
    const close = () => setTip(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [tip]);

  const showTip = useCallback((book: Book, year: string, el: HTMLElement) => {
    const stack = stackRefs.current[year];
    if (!stack) return;
    const pos = placeCard(el.getBoundingClientRect(), stack.getBoundingClientRect());
    setTip({ book, ...pos });
  }, []);

  const readingBooks = books.filter((b) => b.status?.toLowerCase() === "reading");
  const readBooks = books.filter((b) => ["finished", "read"].includes(b.status?.toLowerCase() ?? ""));

  const booksByYear = readBooks.reduce<Record<string, Book[]>>((acc, book) => {
    if (!book.read_date) return acc;
    const year = String(new Date(book.read_date).getFullYear());
    (acc[year] ||= []).push(book);
    return acc;
  }, {});

  const years = Object.keys(booksByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="space-y-16 pb-24">
      {/* Currently Reading */}
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
          // pt/pr ekstra: ruang buat badge yang nongol keluar pojok cover.
          // (overflow-x-auto otomatis memotong apa pun yang keluar dari kotaknya)
          <div className="flex gap-6 overflow-x-auto pt-5 pr-5 pb-3 pl-1">
            {readingBooks.map((book) => (
              <div key={book.id} className="relative shrink-0 w-36">
                {/* overflow-hidden HANYA di cover, bukan di wrapper badge */}
                <div
                  className="h-52 w-full overflow-hidden rounded-sm shadow-md bg-cover bg-center flex items-center justify-center p-4 text-center"
                  style={
                    book.cover_url
                      ? { backgroundImage: `url(${book.cover_url})`, backgroundColor: "#e5e7eb" }
                      : { backgroundColor: getColor(book.title) }
                  }
                  role="img"
                  aria-label={book.title}
                >
                  {!book.cover_url && (
                    <span className="font-sans font-bold text-sm text-white leading-snug">{book.title}</span>
                  )}
                </div>

                <span className="absolute -top-3 -right-3 z-10 rotate-12 rounded-full border border-yellow-400 bg-yellow-300 px-2 py-1 text-[10px] font-bold text-yellow-900 shadow-sm">
                  Reading
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stack Graph */}
      <section className="space-y-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-sans font-bold">Read Archive & Stack Graph</h2>
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-gray-500 mr-2">Zoom:</span>
            <button
              onClick={() => setZoom(Math.max(0.03, zoom - 0.02))}
              className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center transition-colors"
              aria-label="Perkecil"
            >-</button>
            <button
              onClick={() => setZoom(Math.min(0.2, zoom + 0.02))}
              className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center transition-colors"
              aria-label="Perbesar"
            >+</button>
          </div>
        </div>

        <div
          className="bg-[#f1f4f9] border border-gray-200 rounded-[14px] p-8 overflow-x-auto min-h-[300px]"
          onScroll={() => setTip(null)}
        >
          {years.length === 0 && !loading && (
            <div className="h-full flex items-center justify-center text-gray-400 font-mono text-sm">
              Belum ada buku yang diselesaikan.
            </div>
          )}

          {/* pt-32: ruang kosong di atas tumpukan buat kartu tooltip */}
          <div className="flex items-end justify-start gap-16 md:gap-28 min-w-max pt-32 pb-6 px-6">
            {years.map((year) => {
              const yearBooks = [...booksByYear[year]].sort(
                (a, b) => new Date(a.read_date!).getTime() - new Date(b.read_date!).getTime()
              );
              const totalPages = yearBooks.reduce((sum, b) => sum + (b.pages || 0), 0);

              return (
                <div key={year} className="flex flex-col items-center justify-end">
                  <div
                    ref={(el) => { stackRefs.current[year] = el; }}
                    className="relative flex flex-col-reverse items-center w-44 mb-6"
                  >
                    {yearBooks.map((book) => {
                      const hash = hashString(book.title);
                      const widthPercent = 88 + (hash % 12);
                      const offset = -4 + (hash % 9);
                      const height = Math.max(18, (book.pages || 200) * zoom);
                      const active = tip?.book.id === book.id;
                      const dimmed = tip !== null && !active;

                      return (
                        <div
                          key={book.id}
                          tabIndex={0}
                          role="button"
                          aria-label={`${book.title}${book.author ? `, ${book.author}` : ""}`}
                          onMouseEnter={(e) => showTip(book, year, e.currentTarget)}
                          onMouseLeave={() => setTip(null)}
                          onFocus={(e) => showTip(book, year, e.currentTarget)}
                          onBlur={() => setTip(null)}
                          onClick={(e) => (active ? setTip(null) : showTip(book, year, e.currentTarget))}
                          className={`relative flex items-center justify-center rounded-[2px] border border-black/15 shadow-sm cursor-pointer outline-none transition-[opacity,filter,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            active ? "z-10 ring-2 ring-white shadow-lg brightness-110" : ""
                          } ${dimmed ? "opacity-50" : ""}`}
                          style={{
                            backgroundColor: getColor(book.title),
                            width: `${widthPercent}%`,
                            height: `${height}px`,
                            left: `${offset}px`, // pakai left, bukan transform, biar gak nabrak efek lain
                            marginBottom: "-1px",
                          }}
                        >
                          <span className="text-white font-sans font-bold text-[11px] truncate px-3">
                            {book.title}
                          </span>
                        </div>
                      );
                    })}
                    <div className="w-[130%] h-1.5 bg-gray-300 rounded-full absolute -bottom-3"></div>
                  </div>

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

      {/* Tooltip: di-portal ke body, posisi fixed, jadi gak kepotong overflow & selalu paling depan */}
      {mounted && tip &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[9999] rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
            style={{ left: tip.left, top: tip.top, width: CARD_W }}
          >
            <p className="font-sans font-bold text-gray-900 leading-tight mb-1">{tip.book.title}</p>
            <p className="font-mono text-[10px] text-gray-500">{tip.book.author || "Unknown Author"}</p>
            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between font-mono text-[10px] text-gray-500">
              <span>{tip.book.pages || "?"} pages</span>
              <span>
                {tip.book.read_date
                  ? new Date(tip.book.read_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : ""}
              </span>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
