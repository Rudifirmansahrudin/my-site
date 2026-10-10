// app/resources/movies/page.tsx
"use client";
import moviesData from "@/content/movies.json";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { motion } from "framer-motion";

export default function MoviesPage() {
  return (
    <div className="space-y-16 pb-24 max-w-5xl mx-auto pt-10">
      
      {/* HEADER */}
      <section className="space-y-4 text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-sans font-bold">Movies</h1>
        <p className="font-mono text-gray-500 leading-relaxed">
          Films and documentaries that shape how I see business, technology, and design.
        </p>
      </section>

      {/* MOVIE GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {moviesData.map((movie, idx) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group"
          >
            <Card className="h-full flex flex-col sm:flex-row gap-6 p-6 bg-[#fdfbf7] border border-[#e8e4d9] hover:border-indigo-300 hover:shadow-xl transition-all">
              
              {/* KIRI: Poster Film dengan Efek 3D */}
              <div className="w-full sm:w-1/3 flex-shrink-0 relative perspective-1000">
                {/* Bayangan Poster di Belakang */}
                <div className="absolute inset-0 bg-black/20 rounded-md blur-md transform group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"></div>
                
                <motion.img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="relative z-10 w-full h-auto aspect-[2/3] object-cover rounded-md shadow-sm border border-gray-200"
                  // Efek 3D pas kursor diarahin ke kartunya
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: 10, 
                    rotateX: 5,
                    x: -5,
                    y: -5
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </div>

              {/* KANAN: Detail & Review */}
              <div className="w-full sm:w-2/3 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h2 className="text-2xl font-sans font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {movie.title}
                    </h2>
                    <div className="bg-indigo-100 text-indigo-700 font-bold font-mono text-[10px] px-2 py-1 rounded whitespace-nowrap">
                      {movie.rating}
                    </div>
                  </div>
                  
                  <p className="font-mono text-xs text-gray-400 uppercase tracking-wider border-b border-gray-200/50 pb-3">
                    Dir. {movie.director} • {movie.year}
                  </p>
                  
                  <p className="font-sans text-gray-700 leading-relaxed text-sm mt-3">
                    {movie.review}
                  </p>
                </div>

                <div className="pt-2">
                  <Chip>{movie.theme}</Chip>
                </div>
              </div>

            </Card>
          </motion.div>
        ))}
      </section>

    </div>
  );
}