// app/about/page.tsx
"use client";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="space-y-24 pb-32 max-w-4xl mx-auto pt-10">
      
      {/* HEADER */}
      <section className="space-y-6 text-center">
        <h1 className="text-5xl font-sans font-bold">About Me</h1>
        <p className="font-mono text-gray-500 max-w-2xl mx-auto">
          I'm a business student who fell in love with technology. I believe the best solutions come from understanding both the spreadsheet and the codebase.
        </p>
      </section>

      {/* THE JOURNEY (Vertical Timeline) */}
      <section className="space-y-8">
        <h2 className="text-3xl font-sans font-bold">The Journey</h2>
        <div className="relative border-l-2 border-indigo-100 ml-4 md:ml-0 md:pl-8 space-y-12">
          
          <div className="relative">
            <div className="absolute -left-[25px] md:-left-[41px] top-1 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-sm"></div>
            <h3 className="font-sans font-bold text-xl">Present - Building & Learning</h3>
            <p className="font-mono text-sm text-gray-400 mb-3 mt-1">Semarang, Indonesia</p>
            <p className="text-gray-600 leading-relaxed">
              Currently pursuing my degree at Universitas Negeri Semarang (UNNES) while actively building side projects. Learning about SQL, Next.js, and data analysis to bridge the gap between business management and tech execution.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-[25px] md:-left-[41px] top-1 w-4 h-4 bg-gray-300 rounded-full border-4 border-white shadow-sm"></div>
            <h3 className="font-sans font-bold text-xl">2024 - The Spark</h3>
            <p className="text-gray-600 leading-relaxed mt-3">
              Started exploring how technology can solve business problems. Participated in PKKMB FEB and joined local student networks. Realized that knowing how to code and build systems gives business students a massive edge.
            </p>
          </div>

        </div>
      </section>

      {/* HOBBIES (Polaroid Gallery) */}
      <section className="space-y-8 pt-10" id="hobbies">
        <h2 className="text-3xl font-sans font-bold">Offline Modes</h2>
        <p className="font-mono text-gray-500 text-sm">What I do when I'm not staring at a screen.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
          {[
            { title: "Reading", rotate: -4 },
            { title: "Cafe Hopping", rotate: 2 },
            { title: "Travel", rotate: -2 },
            { title: "Movies", rotate: 6 }
          ].map((hobby, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
              initial={{ rotate: hobby.rotate }}
              className="bg-white p-3 pb-12 shadow-md border border-gray-200 flex flex-col justify-end h-56 cursor-pointer transition-shadow hover:shadow-xl"
            >
              <div className="bg-gray-100 w-full h-full mb-4 rounded-sm border border-gray-200/50"></div>
              <p className="text-center font-[family-name:var(--font-handwriting)] text-2xl text-gray-700">{hobby.title}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="space-y-8 pt-10">
        <h2 className="text-3xl font-sans font-bold">Awards & Honors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="space-y-4 bg-white border-gray-200 hover:border-indigo-300">
            <h3 className="font-sans font-bold text-lg border-b border-gray-100 pb-2">Academic</h3>
            <ul className="space-y-3 font-mono text-sm text-gray-600">
              <li>• KIP Kuliah Awardee</li>
              <li>• FEB Dean's List 2025</li>
            </ul>
          </Card>

          <Card className="space-y-4 bg-white border-gray-200 hover:border-indigo-300">
            <h3 className="font-sans font-bold text-lg border-b border-gray-100 pb-2">Competitions</h3>
            <ul className="space-y-3 font-mono text-sm text-gray-600">
              <li>• 1st Place Business Plan</li>
              <li>• Finalist National Case</li>
            </ul>
          </Card>

          <Card className="space-y-4 bg-white border-gray-200 hover:border-indigo-300">
            <h3 className="font-sans font-bold text-lg border-b border-gray-100 pb-2">Organization</h3>
            <ul className="space-y-3 font-mono text-sm text-gray-600">
              <li>• Head of Research Div.</li>
              <li>• Event Coordinator</li>
            </ul>
          </Card>

        </div>
      </section>

    </div>
  );
}