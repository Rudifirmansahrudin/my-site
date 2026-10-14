"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // TAMBAHAN: Untuk deteksi halaman aktif

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State untuk dropdown mobile
  const [resOpen, setResOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const pathname = usePathname(); // Deteksi URL saat ini

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
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
        <div className="hidden md:flex items-center gap-8 font-mono text-[13px] tracking-widest uppercase">
          <Link href="/postcards" className={`transition-colors ${pathname === "/postcards" ? "text-indigo-600 font-bold" : "hover:text-indigo-600"}`}>
            Postcards
          </Link>
          
          {/* Menu Speaking di-hide sementara */}
          {/* <Link href="/speaking" className="hover:text-indigo-600 transition-colors">Speaking</Link> */}
          
          <Link href="/create" className={`transition-colors ${pathname === "/create" ? "text-indigo-600 font-bold" : "hover:text-indigo-600"}`}>
            Create
          </Link>
          
          <Link href="/writing" className={`transition-colors ${pathname === "/writing" ? "text-indigo-600 font-bold" : "hover:text-indigo-600"}`}>
            Writing
          </Link>
      
          {/* Dropdown Resources */}
          <div className="relative group cursor-pointer py-2">
            <span className={`transition-colors flex items-center gap-1 ${pathname.startsWith("/resources") ? "text-indigo-600 font-bold" : "hover:text-indigo-600"}`}>
              Resources <span className="text-[9px]">▼</span>
            </span>
            <div className="absolute top-full left-0 mt-0 w-40 bg-white border border-gray-100 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2">
              <Link href="/resources/books" className="px-4 py-2 hover:bg-gray-50">Books</Link>
              <Link href="/resources/movies" className="px-4 py-2 hover:bg-gray-50">Movies</Link>
              <Link href="/resources/games" className="px-4 py-2 hover:bg-gray-50">Gaming</Link>
              <Link href="/resources/bookmarks" className="px-4 py-2 hover:bg-gray-50">Bookmarks</Link>
              <Link href="/resources/media-kit" className="px-4 py-2 hover:bg-gray-50">Media Kit</Link>
            </div>
          </div>

          {/* Dropdown About */}
          <div className="relative group cursor-pointer py-2">
            <span className={`transition-colors flex items-center gap-1 ${pathname.startsWith("/about") ? "text-indigo-600 font-bold" : "hover:text-indigo-600"}`}>
              About <span className="text-[9px]">▼</span>
            </span>
            <div className="absolute top-full right-0 mt-0 w-32 bg-white border border-gray-100 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2">
              <Link href="/about" className="px-4 py-2 hover:bg-gray-50">Journey</Link>
              <Link href="/about#hobbies" className="px-4 py-2 hover:bg-gray-50">Hobbies</Link>
              <Link href="/about/wall" className="px-4 py-2 hover:bg-gray-50">Wall</Link>
            </div>
          </div>
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
  );
}
