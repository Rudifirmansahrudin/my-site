// app/create/page.tsx
"use client";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { motion } from "framer-motion";

// Dummy Data Proyek
const projects = [
  {
    id: 1,
    title: "Market Insight Dashboard",
    description: "A comprehensive dashboard for tracking market trends, analyzing competitor pricing, and visualizing business data for faster decision-making.",
    tech: ["Next.js", "Tailwind CSS", "Recharts", "Supabase"],
    demoLink: "#",
    repoLink: "#"
  },
  {
    id: 2,
    title: "Campus Thrift",
    description: "An e-commerce platform built specifically for university students to buy, sell, and trade pre-loved textbooks and dorm essentials safely.",
    tech: ["React", "Firebase", "Stripe API"],
    demoLink: "#",
    repoLink: "#"
  },
  {
    id: 3,
    title: "Automated Data Scraper",
    description: "A web scraping script designed to extract pricing data from various e-commerce websites and consolidate it into a clean, structured CSV.",
    tech: ["Python", "BeautifulSoup", "Pandas"],
    demoLink: "#",
    repoLink: "#"
  },
  {
    id: 4,
    title: "Freelance Client Portal",
    description: "A secure, minimalistic portal for clients to view project progress, download deliverables, and manage invoices in one place.",
    tech: ["Next.js", "Prisma", "PostgreSQL"],
    demoLink: "#",
    repoLink: "#"
  }
];

export default function CreatePage() {
  return (
    <div className="space-y-16 pb-24 max-w-5xl mx-auto pt-10">
      
      {/* HEADER */}
      <section className="space-y-4 text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-sans font-bold">Create</h1>
        <p className="font-mono text-gray-500 leading-relaxed">
          Things I've built, broken, and fixed. A collection of tools, dashboards, and applications bridging business needs with technical solutions.
        </p>
      </section>

      {/* PROJECT GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="h-full flex flex-col justify-between bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all group">
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-sans font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {project.title}
                  </h2>
                  {/* Link Icons (Opsional) */}
                  <div className="flex gap-3 text-gray-400">
                    <a href={project.repoLink} className="hover:text-gray-800 transition-colors" title="View Source">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </a>
                    <a href={project.demoLink} className="hover:text-indigo-600 transition-colors" title="Live Demo">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    </a>
                  </div>
                </div>
                
                <p className="font-mono text-sm text-gray-600 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex flex-wrap gap-2">
                {project.tech.map((t, i) => (
                  <Chip key={i}>{t}</Chip>
                ))}
              </div>

            </Card>
          </motion.div>
        ))}
      </section>

    </div>
  );
}