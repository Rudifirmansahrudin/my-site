"use client";
import { useEffect, useState } from "react";
import TiltCard from "@/components/TiltCard";
import { createClient } from "@supabase/supabase-js";

// Proteksi: Kasih kunci dummy kalau .env.local belum kebaca biar web ga blank
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGames() {
      try {
        const { data, error } = await supabase
          .from("games")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        setGames(data || []);
      } catch (err: any) {
        console.error("Gagal narik data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    // Jangan nge-fetch kalau pakai kunci dummy
    if (supabaseUrl !== 'https://dummy.supabase.co') {
      fetchGames();
    } else {
      setError("File .env.local belum diatur kuncinya nih bro!");
      setLoading(false);
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-32 px-6 min-h-screen">
      <h1 className="text-5xl font-bold mb-4 text-center font-sans tracking-tight">Gaming Vault</h1>
      <p className="text-center font-mono text-gray-500 mb-16 uppercase tracking-widest text-sm">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {games.map((game) => (
            <TiltCard key={game.id}>
              <div className="bg-white border border-[#e8e4d9] p-5 rounded-2xl shadow-xl flex flex-col gap-5 h-full">
                {/* Visual Cover */}
                <div className="w-full h-72 overflow-hidden rounded-xl bg-gray-100 relative group">
                  {game.cover_url ? (
                    <img src={game.cover_url} alt={game.title} className="object-cover w-full h-full pointer-events-none transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 font-mono text-sm">No Cover</div>
                  )}
                  {/* Category Tag */}
                  <span className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {game.category}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-grow">
                  <h3 className="font-bold text-xl font-sans mb-3 text-gray-900">{game.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-4 font-sans leading-relaxed">{game.description}</p>
                </div>

                {/* Personal Capture Photo */}
                {game.photo_url && (
                  <div className="mt-2 pt-4 border-t border-gray-100 flex items-center gap-3">
                    <img src={game.photo_url} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-400 font-mono uppercase tracking-widest">Personal Capture</span>
                      <span className="text-xs font-bold text-gray-700">Rudi's Gallery</span>
                    </div>
                  </div>
                )}
              </div>
            </TiltCard>
          ))}
        </div>
      )}
    </div>
  );
}