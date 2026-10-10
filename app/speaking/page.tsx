// app/speaking/page.tsx
"use client";
import { useState } from "react";
import speakingData from "@/content/speaking.json";
import { Chip } from "@/components/ui/Chip";
import { motion, AnimatePresence } from "framer-motion";

export default function SpeakingPage() {
  // Mengelompokkan data berdasarkan Tahun
  const groupedByYear = speakingData.reduce((acc: any, item) => {
    const year = new Date(item.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {});
  
  // Mengurutkan tahun dari yang paling baru
  const years = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  // State untuk melacak baris mana yang sedang dibuka (expanded)
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="space-y-16 pb-24 max-w-3xl mx-auto pt-10">
      
      <header className="space-y-4">
        <h1 className="text-5xl font-sans font-bold">Speaking & Experience</h1>
        <p className="font-mono text-gray-500">A timeline of my talks, organizational experience, and case competitions.</p>
      </header>

      <div className="space-y-12">
        {years.map(year => (
          <div key={year} className="relative">
            {/* Label Tahun (Sticky: menempel di atas saat discroll) */}
            <div className="sticky top-20 bg-white/90 backdrop-blur-sm z-10 py-2 border-b border-gray-100 mb-6">
              <h2 className="font-sans font-bold text-2xl text-gray-300">{year}</h2>
            </div>

            {/* Daftar Item di Tahun Tersebut */}
            <div className="space-y-4">
              {groupedByYear[year].map((item: any) => (
                <div 
                  key={item.id} 
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:border-indigo-300 transition-colors shadow-sm"
                >
                  {/* Bagian yang Selalu Tampil */}
                  <div
                    className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className="space-y-1 flex-1">
                      <h3 className="font-sans font-bold text-lg text-gray-900">{item.title}</h3>
                      <p className="font-mono text-sm text-gray-500">{item.event} • {item.org}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Chip>{item.type}</Chip>
                      <span className="font-mono text-xs text-gray-400 w-24 text-right">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {/* Ikon Panah (Chevron) */}
                      <span className={`text-gray-400 transition-transform duration-300 ${expandedId === item.id ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Bagian Deskripsi (Expanded) dengan Animasi */}
                  <AnimatePresence>
                    {expandedId === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#f1f4f9] px-5 py-4 font-mono text-sm text-gray-700 border-t border-gray-100"
                      >
                        <p className="leading-relaxed">{item.description}</p>
                        <div className="mt-4 font-bold text-[11px] text-indigo-500 uppercase tracking-widest">
                          Audience: {item.audience}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                </div>
              ))}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}