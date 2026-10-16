"use client";
// app/loading.tsx
// Tampil otomatis setiap pindah halaman, selama halaman tujuan masih memuat data.
import { useEffect, useState } from "react";
import { Caveat } from "next/font/google";

const hand = Caveat({ subsets: ["latin"], display: "swap" });

// Ganti / tambah kalimat sesuka lu. Berganti tiap ~1,8 detik.
const MESSAGES = [
  "Sabar cantikk 💗",
  "Lagi dandan dulu bentar ✨",
  "Dikit lagi kok, janji 🌸",
  "Lagi ngumpulin yang lucu-lucu 🍓",
];

const CSS = `
.sc-fade{animation:sc-fade .3s ease .2s both}
@keyframes sc-fade{from{opacity:0}to{opacity:1}}

.sc-heart{transform-origin:50% 100%;animation:sc-bounce 1.1s ease-in-out infinite;filter:drop-shadow(0 4px 0 rgba(238,130,188,.25))}
@keyframes sc-bounce{0%,100%{transform:translateY(0) scale(1.08,.92)}50%{transform:translateY(-26px) scale(.96,1.04)}}

.sc-shadow{animation:sc-shadow 1.1s ease-in-out infinite}
@keyframes sc-shadow{0%,100%{transform:scaleX(1);opacity:.18}50%{transform:scaleX(.55);opacity:.08}}

.sc-dot{animation:sc-dot 1s ease-in-out infinite}
@keyframes sc-dot{0%,80%,100%{transform:translateY(0);opacity:.55}40%{transform:translateY(-7px);opacity:1}}

.sc-msg{animation:sc-msg .4s ease both}
@keyframes sc-msg{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

@media (prefers-reduced-motion:reduce){.sc-heart,.sc-shadow,.sc-dot,.sc-msg{animation:none}}
`;

export default function Loading() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    // sc-fade: loader baru kelihatan setelah 0,2 detik, jadi pindah halaman yang cepat gak berkedip
    <div role="status" aria-live="polite" className="sc-fade flex min-h-[55vh] flex-col items-center justify-center gap-6">
      <style>{CSS}</style>

      {/* hati memantul */}
      <div className="flex flex-col items-center" aria-hidden>
        <svg className="sc-heart h-16 w-16" viewBox="0 0 24 24">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="#F9A8D4"
            stroke="#EE82BC"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sc-shadow mt-2 h-2 w-12 rounded-full bg-gray-900" />
      </div>

      {/* teks berganti-ganti */}
      <p key={i} className={`${hand.className} sc-msg text-3xl font-medium text-gray-700`}>
        {MESSAGES[i]}
      </p>

      {/* tiga titik: pink, ungu, kuning */}
      <div className="flex gap-2" aria-hidden>
        <span className="sc-dot h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#F9A8D4" }} />
        <span className="sc-dot h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#C4B5FD", animationDelay: "0.15s" }} />
        <span className="sc-dot h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#FCD34D", animationDelay: "0.3s" }} />
      </div>

      <span className="sr-only">Loading</span>
    </div>
  );
}
