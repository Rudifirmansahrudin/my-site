// components/layout/Navbar.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <Link href="/postcards" className="hover:text-indigo-600 transition-colors">Postcards</Link>
          <Link href="/speaking" className="hover:text-indigo-600 transition-colors">Speaking</Link>
          <Link href="/create" className="hover:text-indigo-600 transition-colors">Create</Link>
          <Link href="/writing" className="hover:text-indigo-600 transition-colors font-bold text-indigo-500">Writing</Link>
     
          {/* Dropdown Resources */}
          <div className="relative group cursor-pointer py-2">
            <span className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              Resources <span className="text-[9px]">▼</span>
            </span>
            <div className="absolute top-full left-0 mt-0 w-40 bg-white border border-gray-100 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2">
              <Link href="/resources/books" className="px-4 py-2 hover:bg-gray-50">Books</Link>
              <Link href="/resources/movies" className="px-4 py-2 hover:bg-gray-50">Movies</Link>
              
              {/* ---> TAMBAHAN MENU GAMING <--- */}
              <Link href="/resources/games" className="px-4 py-2 hover:bg-gray-50">Gaming</Link>
              
              <Link href="/resources/bookmarks" className="px-4 py-2 hover:bg-gray-50">Bookmarks</Link>
              <Link href="/resources/media-kit" className="px-4 py-2 hover:bg-gray-50">Media Kit</Link>
            </div>
          </div>

          {/* Dropdown About */}
          <div className="relative group cursor-pointer py-2">
            <span className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              About <span className="text-[9px]">▼</span>
            </span>
            <div className="absolute top-full right-0 mt-0 w-32 bg-white border border-gray-100 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2">
              <Link href="/about" className="px-4 py-2 hover:bg-gray-50">Journey</Link>
              <Link href="/about#hobbies" className="px-4 py-2 hover:bg-gray-50">Hobbies</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 py-4 px-6 flex flex-col gap-4 font-mono text-sm tracking-widest uppercase shadow-lg">
          <Link href="/postcards" onClick={() => setMobileMenuOpen(false)}>Postcards</Link>
          <Link href="/speaking" onClick={() => setMobileMenuOpen(false)}>Speaking</Link>
          <Link href="/create" onClick={() => setMobileMenuOpen(false)}>Create</Link>
          <Link href="/writing" onClick={() => setMobileMenuOpen(false)}>Writing</Link>
          
          {/* ---> TAMBAHAN MENU GAMING MOBILE <--- */}
          <Link href="/resources/games" onClick={() => setMobileMenuOpen(false)}>Gaming</Link>
          
          <Link href="/resources" onClick={() => setMobileMenuOpen(false)}>Resources</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
        </div>
      )}
    </nav>
  );
}