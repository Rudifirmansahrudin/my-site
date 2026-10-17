"use client";
// components/PageTransition.tsx
// Layar loader yang menutupi halaman SETIAP pindah halaman (dan saat pertama kali buka situs),
// minimal selama MIN_MS supaya animasinya sempat tampil penuh.
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import CuteLoader from "@/components/CuteLoader";

const MIN_MS = 1000; // lama minimal loader tampil (ubah sesuka lu: 600–1200 enak)
const MAX_MS = 8000; // pengaman: tutup paksa kalau ada yang macet

type Phase = "in" | "out" | "off";

const CSS = `
.pt-in{animation:pt-in .12s ease both}
@keyframes pt-in{from{opacity:0}to{opacity:1}}
.pt-out{animation:pt-out .35s ease both}
@keyframes pt-out{from{opacity:1}to{opacity:0}}
@media (prefers-reduced-motion:reduce){.pt-in,.pt-out{animation:none}}
`;

export default function PageTransition() {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const run = useRef({ active: true, startedAt: 0, fromPath: null as string | null });
  const [phase, setPhase] = useState<Phase>("in"); // "in" sejak awal: menutupi halaman saat pertama dibuka
  const [fresh, setFresh] = useState(false); // fade-in hanya untuk pindah halaman, bukan saat buka pertama

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const r = run.current;
    r.startedAt = Date.now(); // hitungan untuk buka pertama

    const begin = () => {
      r.active = true;
      r.startedAt = Date.now();
      r.fromPath = pathRef.current;
      setFresh(true);
      setPhase("in");
    };

    // Klik link internal ke halaman lain
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return; // link keluar
      if (url.pathname === window.location.pathname) return; // halaman sama (mis. #hobbies)
      begin();
    };

    // Tombol back / forward browser
    const onPop = () => {
      if (window.location.pathname !== pathRef.current) begin();
    };

    // Tutup loader kalau: sudah cukup lama, halaman sudah berganti, dan halaman baru selesai memuat
    const tick = setInterval(() => {
      if (!r.active) return;
      const elapsed = Date.now() - r.startedAt;
      const pathChanged = r.fromPath === null || pathRef.current !== r.fromPath;
      const stillLoading = document.querySelector("[data-route-loading]") !== null;
      if (elapsed >= MAX_MS || (elapsed >= MIN_MS && pathChanged && !stillLoading)) {
        r.active = false;
        setPhase("out");
      }
    }, 100);

    document.addEventListener("click", onClick, true); // capture: jalan sebelum Next memproses klik
    window.addEventListener("popstate", onPop);
    return () => {
      clearInterval(tick);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  // Setelah fade-out selesai, copot dari layar
  useEffect(() => {
    if (phase !== "out") return;
    const t = setTimeout(() => setPhase("off"), 350);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "off") return null;

  return (
    <>
      <style>{CSS}</style>
      {/* z-40 < navbar (z-50): navbar tetap kelihatan dan bisa diklik */}
      <div
        className={`fixed inset-0 z-40 bg-white ${
          phase === "out" ? "pt-out pointer-events-none" : fresh ? "pt-in" : ""
        }`}
      >
        <CuteLoader variant="screen" />
      </div>
    </>
  );
}
