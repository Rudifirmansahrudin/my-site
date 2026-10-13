"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Koneksi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";
const supabase = createClient(supabaseUrl, supabaseKey);

type Project = {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  sort_order: number;
};

// Ikon sederhana berbasis SVG
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

export default function CreatePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("sort_order", { ascending: true });

        if (error) throw error;
        setProjects((data as Project[]) || []);
      } catch (err: any) {
        console.error("Gagal narik data proyek:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (supabaseUrl !== "https://dummy.supabase.co") {
      fetchProjects();
    } else {
      setError("File .env.local belum diatur kuncinya nih bro!");
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-16 pb-24 max-w-5xl mx-auto">
      
      {/* Header Section */}
      <header className="space-y-6 text-center pt-10">
        <h1 className="text-4xl md:text-5xl font-extrabold font-sans tracking-tight text-gray-900">Create</h1>
        <p className="max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-sans text-gray-600">
          Things I've built, broken, and fixed. A collection of tools, dashboards, and applications bridging business needs with technical solutions.
        </p>
      </header>

      {/* State Handlers */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="font-mono text-indigo-600 animate-pulse">Menyusun rak proyek...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center font-mono max-w-2xl mx-auto border border-red-100">
          <p className="font-bold mb-2">Error system</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-2xl max-w-2xl mx-auto">
          <p className="text-gray-500 font-mono mb-2">Belum ada karya.</p>
          <p className="text-sm text-gray-400">Silakan tambahkan proyek di Supabase.</p>
        </div>
      ) : (
        /* Projects Grid */
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="group flex flex-col justify-between bg-white border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all duration-300 p-8 rounded-2xl h-full"
            >
              
              {/* Bagian Atas: Judul & Deskripsi */}
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h2 className="text-xl font-bold font-sans text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {project.title}
                  </h2>
                  
                  {/* Links (GitHub & Live URL) */}
                  <div className="flex items-center gap-3 text-gray-400">
                    {project.github_url && (
                      <Link 
                        href={project.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-gray-900 transition-colors"
                        aria-label="GitHub Repository"
                      >
                        <GithubIcon />
                      </Link>
                    )}
                    {project.live_url && (
                      <Link 
                        href={project.live_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-indigo-600 transition-colors"
                        aria-label="Live Project"
                      >
                        <ExternalLinkIcon />
                      </Link>
                    )}
                  </div>
                </div>
                
                <p className="font-sans text-gray-600 leading-relaxed text-sm md:text-base">
                  {project.description}
                </p>
              </div>

              {/* Bagian Bawah: Tech Stack */}
              <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-gray-100">
                {project.tech_stack.map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="font-mono text-[10px] uppercase tracking-wider font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md"
                  >
                    {tech}
                  </span>
                ))}
              </div>

            </div>
          ))}
        </section>
      )}

    </div>
  );
}
