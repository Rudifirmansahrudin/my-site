// app/page.tsx
"use client";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Dummy Data untuk Bio
const bioData = {
  short: "Business student who builds.",
  medium: "I'm a Business student at Universitas Negeri Semarang who loves translating business problems into tech solutions.",
  long: "I'm a Business student at Universitas Negeri Semarang focusing on management and business analysis. I actively build tech projects, bridging the gap between business needs and engineering execution. When I'm not studying or coding, I enjoy exploring new tools and reading."
};

// Dummy Data untuk Work With Me
const workWithMe = [
  { title: "Business Analysis", desc: "Translating data and market trends into actionable strategies." },
  { title: "Tech Projects", desc: "Building practical tools and web applications." },
  { title: "Sharing & Speaking", desc: "Talking about the intersection of business and technology." }
];

// Dummy Data untuk Stats
const stats = [
  { label: "Projects Built", value: 12 },
  { label: "Books Read", value: 45 },
  { label: "Articles Written", value: 8 },
  { label: "Cups of Coffee", value: 999 }
];

// Komponen animasi angka stat
function StatCard({ label, value }: { label: string; value: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <Card className="flex flex-col items-center justify-center text-center py-8">
      <div ref={ref} className="text-4xl font-sans font-bold text-indigo-600 mb-2">
        {isInView ? (
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {value}+
          </motion.span>
        ) : "0"}
      </div>
      <p className="font-mono text-sm text-gray-500 uppercase tracking-wider">{label}</p>
    </Card>
  );
}

export default function Home() {
  const [bioLevel, setBioLevel] = useState<"short" | "medium" | "long">("medium");

  return (
    <div className="space-y-32 pb-20 overflow-hidden">
      
      {/* 1. Hero Section & Polaroid */}
      <section className="relative pt-20 flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Kiri: Teks & Bio */}
        <div className="w-full md:w-1/2 space-y-6 z-10">
          <h1 className="text-5xl md:text-7xl font-sans font-bold tracking-tight">
            Hello, I'm Rudi
          </h1>
          
          {/* Social Icons (Dummy text for now) */}
          <div className="flex gap-4 font-mono text-sm text-gray-500">
            <a href="#" className="hover:text-indigo-600">LinkedIn</a>
            <a href="#" className="hover:text-indigo-600">GitHub</a>
            <a href="#" className="hover:text-indigo-600">Email</a>
          </div>

          {/* Bio Slider */}
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center font-mono text-xs text-gray-400">
              <span>Short</span>
              <span>Medium</span>
              <span>Long</span>
            </div>
            <input 
              type="range" 
              min="0" max="2" 
              value={bioLevel === "short" ? 0 : bioLevel === "medium" ? 1 : 2}
              onChange={(e) => {
                const val = e.target.value;
                setBioLevel(val === "0" ? "short" : val === "1" ? "medium" : "long");
              }}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <motion.p 
              key={bioLevel}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-gray-700 leading-relaxed min-h-[80px]"
            >
              {bioData[bioLevel]}
            </motion.p>
          </div>

          <Button>Learn more about me</Button>
        </div>

        {/* Kanan: Polaroid (Bisa di drag) */}
        <div className="w-full md:w-1/2 h-[400px] relative">
          <motion.div 
            drag 
            dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
            whileHover={{ scale: 1.05 }}
            whileDrag={{ scale: 1.1, cursor: "grabbing" }}
            initial={{ rotate: -6 }}
            className="absolute top-10 left-10 md:left-20 bg-white p-3 pb-12 shadow-xl border border-gray-200 rounded-sm cursor-grab z-20 w-48 h-56 flex flex-col justify-end"
          >
            <div className="bg-gray-200 w-full h-full mb-2"></div> {/* Placeholder Foto */}
            <p className="text-center font-mono text-xs text-gray-500">Campus life</p>
          </motion.div>

          <motion.div 
            drag 
            dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
            whileHover={{ scale: 1.05 }}
            whileDrag={{ scale: 1.1, cursor: "grabbing" }}
            initial={{ rotate: 8 }}
            className="absolute top-32 right-10 md:right-20 bg-white p-3 pb-12 shadow-xl border border-gray-200 rounded-sm cursor-grab z-10 w-48 h-56 flex flex-col justify-end"
          >
            <div className="bg-gray-200 w-full h-full mb-2"></div> {/* Placeholder Foto */}
            <p className="text-center font-mono text-xs text-gray-500">Building things</p>
          </motion.div>
        </div>
      </section>

      {/* 2. Work With Me */}
      <section className="space-y-8">
        <h2 className="text-3xl font-sans font-bold">Work With Me</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workWithMe.map((item, idx) => (
            <Card key={idx} className="space-y-3">
              <h3 className="font-sans font-bold text-lg">{item.title}</h3>
              <p className="font-mono text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Stats Matrix */}
      <section className="space-y-8">
        <h2 className="text-3xl font-sans font-bold">By The Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, idx) => (
            <StatCard key={idx} label={stat.label} value={stat.value} />
          ))}
        </div>
      </section>

      {/* 4. Featured Projects (Sederhana dulu) */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-sans font-bold">Featured Projects</h2>
          <span className="font-mono text-sm text-indigo-600 cursor-pointer hover:underline">View all →</span>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-4 snap-x">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="min-w-[300px] md:min-w-[400px] h-64 snap-center flex flex-col justify-between">
              <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="font-sans font-bold">Project Name {item}</h3>
              <p className="font-mono text-xs text-gray-500">A short description of this awesome project goes here.</p>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}