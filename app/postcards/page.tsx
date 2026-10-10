// app/postcards/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

// Fungsi untuk bikin posisi miring & geser konsisten berdasarkan ID
const hashNum = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
};

export default function PostcardsPage() {
  const [postcards, setPostcards] = useState<any[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [stampImg, setStampImg] = useState<string | null>(null);
  
  // Form State
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Ambil Data dari API saat halaman dimuat
  useEffect(() => {
    fetch("/api/postcards")
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setPostcards(data);
      });
  }, []);

  // Proses Submit Data
  const handleSend = async () => {
    if (!message || !name) return alert("Pesan dan nama wajib diisi ya!");
    setIsSubmitting(true);
    
    const res = await fetch("/api/postcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, name, url, email, stampImg })
    });

    setIsSubmitting(false);
    if (res.ok) {
      alert("Kartu pos terkirim! Menunggu persetujuan admin (itu kamu).");
      setMessage(""); setName(""); setUrl(""); setEmail(""); setStampImg(null);
    } else {
      alert("Gagal mengirim kartu pos. Coba lagi.");
    }
  };

  // --- Fungsi Menggambar Prangko ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true); draw(e);
  };
  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) canvasRef.current.getContext("2d")?.beginPath();
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    let clientX = e.type.includes('mouse') ? (e as React.MouseEvent).clientX : (e as React.TouchEvent).touches[0].clientX;
    let clientY = e.type.includes('mouse') ? (e as React.MouseEvent).clientY : (e as React.TouchEvent).touches[0].clientY;
    const x = clientX - rect.left; const y = clientY - rect.top;
    ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.strokeStyle = "#ef4444"; 
    ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  };
  const saveStamp = () => {
    if (canvasRef.current) {
      setStampImg(canvasRef.current.toDataURL("image/png"));
      setIsDrawingMode(false);
    }
  };

  return (
    <div className="space-y-24 pb-32">
      <section className="text-center max-w-2xl mx-auto pt-10">
        <h1 className="text-5xl font-sans font-bold mb-4">Postcards</h1>
        <p className="font-mono text-gray-500">Leave a note, draw a stamp, and pin it to the wall.</p>
      </section>

      {/* COMPOSER */}
      <section className="max-w-2xl mx-auto">
        <div className="bg-[#fdfbf7] border border-[#e8e4d9] p-8 rounded-sm shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <textarea 
                placeholder="Write your message here..."
                maxLength={500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-40 bg-transparent border-none resize-none focus:ring-0 font-[family-name:var(--font-handwriting)] text-3xl leading-relaxed text-gray-800 placeholder:text-gray-300"
              />
              <div className="space-y-3 font-mono text-sm">
                <input type="text" placeholder="Your Name *" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent border-b border-gray-300 px-2 py-1 focus:outline-none focus:border-indigo-600" />
                <input type="email" placeholder="Your Email (private, just in case)" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-b border-gray-300 px-2 py-1 focus:outline-none focus:border-indigo-600" />
                <input type="url" placeholder="Website / Social URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full bg-transparent border-b border-gray-300 px-2 py-1 focus:outline-none focus:border-indigo-600" />
              </div>
            </div>
            <div className="w-32 flex flex-col items-end">
              <div onClick={() => setIsDrawingMode(true)} className="w-24 h-28 border-2 border-dashed border-gray-300 bg-white/50 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center p-1 relative shadow-sm">
                {stampImg ? <img src={stampImg} alt="Stamp" className="w-full h-full object-contain mix-blend-multiply" /> : <span className="text-[10px] font-mono text-gray-400 text-center">Click to draw<br/>stamp</span>}
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-between items-center relative z-10">
            <span className="font-mono text-xs text-gray-400">{message.length}/500</span>
            <Button onClick={handleSend} disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send Postcard"}</Button>
          </div>
        </div>
      </section>

      {/* DRAWING MODAL */}
      {isDrawingMode && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full">
            <h3 className="font-sans font-bold text-lg">Draw Your Stamp</h3>
            <div className="border border-gray-200 bg-[#fdfbf7] p-2 shadow-inner">
              <canvas ref={canvasRef} width={128} height={128} className="bg-transparent cursor-crosshair touch-none" onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onMouseMove={draw} onTouchStart={startDrawing} onTouchEnd={stopDrawing} onTouchMove={draw} />
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button onClick={clearCanvas} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-sans font-bold text-sm">Clear</button>
              <button onClick={saveStamp} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-sans font-bold text-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* DINDING KARTU POS */}
      <section className="max-w-5xl mx-auto pt-20">
        <h2 className="text-center font-mono text-sm text-gray-400 uppercase tracking-widest mb-16">The Wall ({postcards.length} Collected)</h2>
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 px-4 relative min-h-[500px]">
          {postcards.map((card) => {
            const rotate = -6 + (hashNum(card.id) % 12);
            const y = -10 + (hashNum(card.id) % 20);
            
            return (
              <motion.div 
                key={card.id}
                whileHover={{ scale: 1.05, zIndex: 20 }}
                initial={{ rotate: rotate, y: y }}
                className="bg-[#fdfbf7] w-72 md:w-80 p-6 shadow-md border border-[#e8e4d9] flex flex-col justify-between cursor-pointer transition-shadow hover:shadow-2xl"
              >
                <p className="font-[family-name:var(--font-handwriting)] text-2xl text-gray-800 leading-relaxed min-h-[100px] break-words">
                  {card.message}
                </p>
                <div className="mt-6 flex justify-between items-end border-t border-gray-200/50 pt-4 relative">
                  <div>
                    <p className="font-mono text-sm font-bold text-gray-900">{card.name}</p>
                    <p className="font-mono text-[10px] text-gray-500">{new Date(card.created_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</p>
                  </div>
                  {card.stamp_path ? (
                    <img src={card.stamp_path} className="w-12 h-12 object-contain mix-blend-multiply opacity-80" />
                  ) : (
                    <div className="absolute right-0 bottom-4 w-14 h-14 border-[3px] border-red-500/30 rounded-full flex items-center justify-center rotate-[-15deg] pointer-events-none">
                      <span className="font-mono text-[9px] text-red-500/50 font-bold uppercase text-center">{card.country}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}