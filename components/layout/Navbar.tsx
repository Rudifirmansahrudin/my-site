"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // TAMBAHAN: Untuk deteksi halaman aktif
import PageTransition from "@/components/PageTransition";

// Menu dropdown desktop: satu daftar, dipakai untuk Resources & About
const DROPDOWNS = [
  {
    label: "Resources",
    base: "/resources",
    align: "left",
    width: "w-40",
    items: [
      { label: "Books", href: "/resources/books" },
      { label: "Movies", href: "/resources/movies" },
      { label: "Gaming", href: "/resources/games" },
      { label: "Bookmarks", href: "/resources/bookmarks" },
      { label: "Media Kit", href: "/resources/media-kit" },
    ],
  },
  {
    label: "About",
    base: "/about",
    align: "right",
    width: "w-32",
    items: [
      { label: "Journey", href: "/about" },
      { label: "Hobbies", href: "/about#hobbies" },
      { label: "Wall", href: "/about/wall" },
    ],
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State untuk dropdown mobile
  const [resOpen, setResOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Dropdown desktop: terbuka lewat hover (mouse) ATAU tap/klik (layar sentuh, keyboard)
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastPointer = useRef("mouse");

  const pathname = usePathname(); // Deteksi URL saat ini

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white/90 backdrop-blur-md border-b ${scrolled ? "py-3 border-gray-200" : "py-6 border-transparent"}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo Text */}
        <Link href="/" className={`font-bold font-sans transition-all duration-300 ${scrolled ? "text-xl" : "text-3xl"}`}>
          Rudi
        </Link>
        
        {/* Hamburger Icon (Mobile) */}
        <button 
          className="md:hidden p-2 text-gray-600 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* Desktop Menu */}
        <div ref={menuRef} className="hidden md:flex items-center gap-8 font-mono text-[13px] tracking-widest uppercase">
          <Link href="/postcards" onClick={() => setOpenMenu(null)} className={`transition-colors ${pathname === "/postcards" ? "text-indigo-600 font-bold" : "hover:text-indigo-600"}`}>
            Postcards
          </Link>
          
          {/* Menu Speaking di-hide sementara */}
          {/* <Link href="/speaking" className="hover:text-indigo-600 transition-colors">Speaking</Link> */}
          
          <Link href="/create" onClick={() => setOpenMenu(null)} className={`transition-colors ${pathname === "/create" ? "text-indigo-600 font-bold" : "hover:text-indigo-600"}`}>
            Create
          </Link>
          
          <Link href="/writing" onClick={() => setOpenMenu(null)} className={`transition-colors ${pathname === "/writing" ? "text-indigo-600 font-bold" : "hover:text-indigo-600"}`}>
            Writing
          </Link>
      
          {/* Dropdown desktop: hover (mouse) + tap/klik (sentuh) + keyboard */}
          {DROPDOWNS.map((d) => {
            const open = openMenu === d.label;
            const active = pathname.startsWith(d.base);
            return (
              <div
                key={d.label}
                className="relative py-2"
                onPointerDown={(e) => {
                  lastPointer.current = e.pointerType;
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setOpenMenu(d.label);
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse") setOpenMenu((m) => (m === d.label ? null : m));
                }}
                onBlur={(e) => {
                  // fokus keyboard keluar dari menu ini -> tutup
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    setOpenMenu((m) => (m === d.label ? null : m));
                  }
                }}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  // mouse: hover sudah membuka, klik tetap terbuka. Sentuh: klik = buka/tutup.
                  onClick={() => setOpenMenu(lastPointer.current === "mouse" ? d.label : open ? null : d.label)}
                  className={`transition-colors flex cursor-pointer items-center gap-1 ${active ? "text-indigo-600 font-bold" : "hover:text-indigo-600"}`}
                >
                  {d.label} <span className="text-[9px]">▼</span>
                </button>
                <div
                  className={`absolute top-full ${d.align === "right" ? "right-0" : "left-0"} mt-0 ${d.width} bg-white border border-gray-100 rounded-lg shadow-xl transition-all flex flex-col py-2 ${
                    open ? "opacity-100 visible" : "opacity-0 invisible"
                  }`}
                >
                  {d.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenMenu(null)}
                      className="px-4 py-2 hover:bg-gray-50"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full h-screen bg-white/95 backdrop-blur-md border-b border-gray-200 py-6 px-6 flex flex-col gap-6 font-mono text-sm tracking-widest uppercase shadow-lg overflow-y-auto">
          <Link href="/postcards" onClick={() => setMobileMenuOpen(false)}>Postcards</Link>
          
          {/* Menu Speaking di-hide di mobile juga */}
          {/* <Link href="/speaking" onClick={() => setMobileMenuOpen(false)}>Speaking</Link> */}
          
          <Link href="/create" onClick={() => setMobileMenuOpen(false)}>Create</Link>
          <Link href="/writing" onClick={() => setMobileMenuOpen(false)}>Writing</Link>
          
          {/* Mobile Accordion: Resources */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setResOpen(!resOpen)} 
              className="flex justify-between items-center w-full text-left font-bold"
            >
              RESOURCES <span>{resOpen ? "▲" : "▼"}</span>
            </button>
            {resOpen && (
              <div className="flex flex-col gap-3 pl-4 border-l-2 border-indigo-100 text-gray-500">
                <Link href="/resources/books" onClick={() => setMobileMenuOpen(false)}>Books</Link>
                <Link href="/resources/movies" onClick={() => setMobileMenuOpen(false)}>Movies</Link>
                <Link href="/resources/games" onClick={() => setMobileMenuOpen(false)}>Gaming</Link>
                <Link href="/resources/bookmarks" onClick={() => setMobileMenuOpen(false)}>Bookmarks</Link>
                <Link href="/resources/media-kit" onClick={() => setMobileMenuOpen(false)}>Media Kit</Link>
              </div>
            )}
          </div>

          {/* Mobile Accordion: About */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setAboutOpen(!aboutOpen)} 
              className="flex justify-between items-center w-full text-left font-bold"
            >
              ABOUT <span>{aboutOpen ? "▲" : "▼"}</span>
            </button>
            {aboutOpen && (
              <div className="flex flex-col gap-3 pl-4 border-l-2 border-indigo-100 text-gray-500">
                <Link href="/about" onClick={() => setMobileMenuOpen(false)}>Journey</Link>
                <Link href="/about#hobbies" onClick={() => setMobileMenuOpen(false)}>Hobbies</Link>
                <Link href="/about/wall" onClick={() => setMobileMenuOpen(false)}>Wall</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
    <PageTransition />
    </>
  );
}
