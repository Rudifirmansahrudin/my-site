"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { coverSwatch, hashString, TINT, TINT_EDGE } from "@/lib/palette";

type Book = {
  id: number | string;
  created_at: string;
  title: string;
  author: string | null;
  status: string | null;
  cover_url: string | null;
  cover_color: string | null; // 'purple' | 'pink' | 'yellow' | 'white' (opsional)
  pages: number | null;
  read_date: string | null;
  notes: string | null;
  sort_order: number | null;
};

const CARD_W = 208;
const CARD_H = 92;
const GAP = 12;

type Tip = { book: Book; left: number; top: number };

// Posisi kartu: utamakan di ATAS tumpukan, kalau gak muat kanan, kiri, lalu bawah.
function placeCard(bar: DOMRect, stack: DOMRect) {
  const vw = window.innerWidth;
  const clampX = (x: number) => Math.max(GAP, Math.min(x, vw - CARD_W - GAP));

  const aboveTop = stack.top - CARD_H - GAP;
  if (aboveTop >= GAP) return { left: clampX(bar.left + bar.width / 2 - CARD_W / 2), top: aboveTop };

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

    if (isSupabaseConfigured) {
      fetchBooks();
    } else {
      setError("File .env.local belum diisi (NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY).");
      setLoading(false);
    }
  }, []);

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
    setTip({ book, ...placeCard(el.getBoundingClientRect(), stack.getBoundingClientRect()) });
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
            <p className="text-gray-500 font-mono animate-pulse">Memuat perpustakaan...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-[#F2A9C9] bg-[#FBD3E5] p-4 font-mono text-sm text-gray-900">
            {error}
          </div>
        ) : readingBooks.length === 0 ? (
          <p className="max-w-md rounded-xl border-2 border-dashed border-gray-200 p-8 font-mono text-sm text-gray-500">
            Lagi nggak baca buku apa-apa.
          </p>
        ) : (
          // pt/pr ekstra: ruang buat badge yang nongol keluar pojok cover
          <div className="flex gap-6 overflow-x-auto pt-5 pr-5 pb-3 pl-1">
            {readingBooks.map((book) => {
              const sw = coverSwatch(book.title, book.cover_color);
              // badge kuning, tapi pink kalau cover-nya kuning biar tetap kelihatan
              const badgeBg = sw.key === "yellow" ? "#FBD3E5" : "#FFF0A8";
              return (
                <div key={book.id} className="relative shrink-0 w-36">
                  <div
                    className="flex h-52 w-full items-center justify-center overflow-hidden rounded-sm bg-cover bg-center p-4 text-center shadow-md"
                    style={
                      book.cover_url
                        ? { backgroundImage: `url("${book.cover_url}")`, backgroundColor: "#F3F4F6" }
                        : { backgroundColor: sw.bg, border: `1px solid ${sw.edge}` }
                    }
                    role="img"
                    aria-label={book.title}
                  >
                    {!book.cover_url && (
                      <span className="font-sans text-sm font-bold leading-snug text-gray-900">{book.title}</span>
                    )}
                  </div>
                  <span
                    className="absolute -top-3 -right-3 z-10 rotate-12 rounded-full border border-gray-900/25 px-2 py-1 text-[10px] font-bold text-gray-900 shadow-sm"
                    style={{ backgroundColor: badgeBg }}
                  >
                    Reading
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Stack Graph */}
      <section className="space-y-6 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-sans font-bold">Read Archive & Stack Graph</h2>
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="mr-2 text-gray-500">Zoom:</span>
            <button
              onClick={() => setZoom(Math.max(0.03, zoom - 0.02))}
              className="flex h-8 w-8 items-center justify-center rounded bg-[#DCD0FA] font-bold text-gray-900 transition-colors hover:bg-[#C9B8F5]"
              aria-label="Perkecil"
            >-</button>
            <button
              onClick={() => setZoom(Math.min(0.2, zoom + 0.02))}
              className="flex h-8 w-8 items-center justify-center rounded bg-[#DCD0FA] font-bold text-gray-900 transition-colors hover:bg-[#C9B8F5]"
              aria-label="Perbesar"
            >+</button>
          </div>
        </div>

        <div
          className="min-h-[300px] overflow-x-auto rounded-[14px] border p-8"
          style={{ backgroundColor: TINT, borderColor: TINT_EDGE }}
          onScroll={() => setTip(null)}
        >
          {years.length === 0 && !loading && (
            <div className="flex h-full items-center justify-center font-mono text-sm text-gray-500">
              Belum ada buku yang diselesaikan.
            </div>
          )}

          <div className="flex min-w-max items-end justify-start gap-16 px-6 pt-32 pb-6 md:gap-28">
            {years.map((year) => {
              const yearBooks = [...booksByYear[year]].sort(
                (a, b) => new Date(a.read_date!).getTime() - new Date(b.read_date!).getTime()
              );
              const totalPages = yearBooks.reduce((sum, b) => sum + (b.pages || 0), 0);

              return (
                <div key={year} className="flex flex-col items-center justify-end">
                  <div
                    ref={(el) => { stackRefs.current[year] = el; }}
                    className="relative mb-6 flex w-44 flex-col-reverse items-center"
                  >
                    {yearBooks.map((book) => {
                      const sw = coverSwatch(book.title, book.cover_color);
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
                          className={`relative flex cursor-pointer items-center justify-center rounded-[2px] shadow-sm outline-none transition-[opacity,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-gray-900 ${
                            active ? "z-10 shadow-lg ring-2 ring-gray-900/70" : ""
                          } ${dimmed ? "opacity-50" : ""}`}
                          style={{
                            backgroundColor: sw.bg,
                            border: `1px solid ${sw.edge}`,
                            width: `${widthPercent}%`,
                            height: `${height}px`,
                            left: `${offset}px`,
                            marginBottom: "-1px",
                          }}
                        >
                          <span className="truncate px-3 font-sans text-[11px] font-bold text-gray-900">
                            {book.title}
                          </span>
                        </div>
                      );
                    })}
                    <div className="absolute -bottom-3 h-1.5 w-[130%] rounded-full bg-gray-300"></div>
                  </div>

                  <div className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-center font-mono text-xs text-gray-600 shadow-sm">
                    <span className="mr-2 text-sm font-bold text-gray-900">{year}</span>
                    <span className="text-gray-400">|</span>
                    <span className="ml-2">{yearBooks.length} books ({totalPages}p)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tooltip: portal ke body, fixed, selalu paling depan & gak kepotong */}
      {mounted && tip &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[9999] rounded-lg border bg-white p-3 shadow-xl"
            style={{ left: tip.left, top: tip.top, width: CARD_W, borderColor: TINT_EDGE }}
          >
            <p className="mb-1 font-sans font-bold leading-tight text-gray-900">{tip.book.title}</p>
            <p className="font-mono text-[10px] text-gray-500">{tip.book.author || "Unknown Author"}</p>
            <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 font-mono text-[10px] text-gray-500">
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
