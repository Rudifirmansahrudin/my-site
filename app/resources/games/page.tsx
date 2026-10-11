"use client";
import { useEffect, useState } from "react";
import TiltCard from "@/components/TiltCard";
import { createClient } from "@supabase/supabase-js";

// Proteksi: Kasih kunci dummy kalau .env.local belum kebaca biar web ga blank
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";
const supabase = createClient(supabaseUrl, supabaseKey);

// Tipe Data disesuaikan dengan kolom database lu yang baru
type Game = {
  id: number | string;
  created_at: string;
  title: string;
  category: string | null; 
  status: string | null;   
  cover_url: string | null;
  photo_url: string | null;
  description: string | null; 
  tagline: string | null;     
  highlights: string | null;  
  notes: string | null;       
  platforms: string | null;   
  sort_order?: number | null; // Tambahan buat ngatur urutan manual
};

type SectionKey = "ongoing" | "finished" | "wishlist" | "other";

// List Kategori + Subtitle Curhatan Lu
const SECTIONS: { key: SectionKey; label: string; desc: string; dot: string }[] = [
  { key: "ongoing", label: "Ongoing", desc: "Doain masalah hidup gua dikit biar bisa lanjutin", dot: "bg-emerald-500" },
  { key: "finished", label: "Finished", desc: "Sudah tamat atau ditaklukkan", dot: "bg-indigo-500" },
  { key: "wishlist", label: "Wishlist", desc: "Belum dimainkan, tapi masuk antrean", dot: "bg-amber-500" },
  { key: "other", label: "Other", desc: "Kategori belum diatur", dot: "bg-gray-400" },
];

function sectionOf(game: Game): SectionKey {
  // Ambil dari kolom status baru, kalau kosong ambil dari kolom category lama
  const c = (game.status || game.category || "").toLowerCase().replace(/[^a-z]/g, "");
  if (c === "ongoing" || c === "playing") return "ongoing";
  if (c === "finished" || c === "completed" || c === "conquered" || c === "done") return "finished";
  if (c === "wishlist" || c === "wish") return "wishlist";
  return "other";
}

// Komponen Cover: Menangani Cover Resmi & Fallback Inisial Otomatis
function Cover({ src, title }: { src: string | null; title: string }) {
  const [failed, setFailed] = useState(false);
  const show = !!src && !failed;

  // Generate Inisial (Contoh: "Red Dead Redemption" -> "RD")
  const initials = title
    .split(" ")
    .filter((w) => w.length > 0)
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-indigo-50 to-gray-100 overflow-hidden group border-b border-gray-100">
      {show ? (
        <>
          {/* Background Blur Effect */}
          <img
            src={src as string}
            alt=""
            aria-hidden="true"
            onError={() => setFailed(true)}
            className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-60 pointer-events-none"
          />
          {/* Main Image */}
          <img
            src={src as string}
            alt={title}
            onError={() => setFailed(true)}
            className="relative w-full h-full object-contain p-4 drop-shadow-md pointer-events-none transition-transform duration-500 group-hover:scale-105"
          />
        </>
      ) : (
        // Fallback: Tampilan Inisial ala "Cara Paling Malas"
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-gray-100 to-gray-50">
          <span className="text-5xl font-bold font-sans text-gray-300/80 tracking-tighter drop-shadow-sm group-hover:scale-110 transition-transform duration-500">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    async function fetchGames() {
      try {
        const { data, error } = await supabase
          .from("games")
          .select("*")
          // Urutkan berdasarkan angka sort_order terkecil dulu (1, 2, 3...)
          .order("sort_order", { ascending: true }) 
          // Kalau angkanya sama (misal sama-sama null atau 999), urutkan yang paling baru ditambah
          .order("created_at", { ascending: false });

        if (error) throw error;
        setGames((data as Game[]) || []);
      } catch (err: any) {
        console.error("Gagal narik data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (supabaseUrl !== "https://dummy.supabase.co") {
      fetchGames();
    } else {
      setError("File .env.local belum diatur kuncinya nih bro!");
      setLoading(false);
    }
  }, []);

  // Kunci scroll halaman saat lightbox foto dibuka
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox]);

  const grouped = SECTIONS.map((s) => ({
    ...s,
    items: games.filter((g) => sectionOf(g) === s.key),
  })).filter((s) => s.items.length > 0);

  return (
    <div className="max-w-5xl mx-auto py-32 px-6 min-h-screen">
      <h1 className="text-5xl font-bold mb-4 text-center font-sans tracking-tight">Gaming Vault</h1>
      <p className="text-center font-mono text-gray-500 mb-20 uppercase tracking-widest text-sm">
        Games I Play, Conquered, or Wish For
      </p>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-center font-mono animate-pulse text-indigo-600">Loading vault...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center font-mono max-w-2xl mx-auto border border-red-100">
          <p className="font-bold mb-2">Error system</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : games.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-2xl max-w-2xl mx-auto">
          <p className="text-gray-500 font-mono mb-2">Vault masih kosong.</p>
          <p className="text-sm text-gray-400">Masukin data game pertama lu dari tabel "games" di Supabase Dashboard.</p>
        </div>
      ) : (
        grouped.map((section) => (
          <section key={section.key} className="mb-20">
            {/* Heading kategori & Subtitle Curhatan Lu */}
            <div className="flex items-end justify-between border-b border-gray-200 pb-4 mb-10">
              <div>
                <h2 className="text-2xl font-bold font-sans tracking-tight flex items-center gap-3 text-gray-900">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${section.dot}`} />
                  {section.label}
                </h2>
                <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mt-2">{section.desc}</p>
              </div>
              <span className="font-mono text-sm text-gray-400">
                {String(section.items.length).padStart(2, "0")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {section.items.map((game) => {
                // Ambil notes (baru) atau description (lama)
                const textDesc = game.notes || game.description; 
                
                return (
                  <TiltCard key={game.id}>
                    <div className="bg-white border border-[#e8e4d9] rounded-2xl shadow-xl overflow-hidden flex flex-col h-full">
                      
                      <Cover src={game.cover_url} title={game.title} />

                      {/* Konten Text */}
                      <div className="p-6 flex flex-col gap-4 flex-grow">
                        <div>
                          {/* Platforms Badges */}
                          {game.platforms && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {game.platforms.split(',').map((p, i) => (
                                <span key={i} className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-widest font-mono">
                                  {p.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <h3 className="font-bold text-xl font-sans text-gray-900 leading-tight">{game.title}</h3>
                          
                          {/* Tagline */}
                          {game.tagline && (
                            <p className="text-indigo-600 font-medium text-sm mt-1 italic">"{game.tagline}"</p>
                          )}
                        </div>

                        {/* Highlights / Chips */}
                        {game.highlights && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {game.highlights.split(',').map((h, i) => (
                              <span key={i} className="text-[10px] font-bold border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                                {h.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Notes / Cerita Panjang Lu */}
                        {textDesc && (
                          <p className="text-sm text-gray-600 font-sans leading-relaxed flex-grow mt-2">
                            {textDesc}
                          </p>
                        )}

                        {/* Personal Capture Photo */}
                        {game.photo_url && (
                          <button
                            type="button"
                            onClick={() => setLightbox({ src: game.photo_url as string, title: game.title })}
                            className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-left cursor-zoom-in group/photo"
                          >
                            <span className="relative w-14 h-14 shrink-0 overflow-hidden rounded-xl border-2 border-white shadow-sm ring-1 ring-gray-200">
                              <img
                                src={game.photo_url}
                                alt={`Foto ${game.title}`}
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-110"
                              />
                            </span>
                            <span className="flex flex-col">
                              <span className="text-[9px] text-gray-400 font-mono uppercase tracking-widest">Personal Capture</span>
                              <span className="text-sm font-bold text-gray-700">Rudi's Gallery</span>
                              <span className="text-[10px] text-indigo-500 font-mono mt-0.5">Klik untuk perbesar</span>
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>
          </section>
        ))
      )}

      {/* Lightbox / Zoom-in Foto */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition-colors"
          >
            ✕
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] object-contain rounded-xl shadow-2xl cursor-default"
          />
        </div>
      )}
    </div>
  );
}
