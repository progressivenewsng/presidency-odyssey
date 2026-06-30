"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from '../../assets/logo2.jpg'
import logoNBG from '../../assets/logoNBG.png'

export default function Header() {
  const pathname = usePathname();
  const isAdminLogin = pathname.includes('/admin');

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  // If it's admin login, only show the simplified logo
  if (isAdminLogin) {
    return (
      <header className="w-full bg-white">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center space-y-4">
            <Link href="/" className="group flex flex-col items-center text-center">
              <h1 className="text-3xl font-serif font-black tracking-tighter text-gray-900 md:text-5xl lg:text-7xl">
                PRESIDENCY <span className="text-red-700"><Image  src={logoNBG} alt="Logo" className="inline object-contain w-24 h-12 md:w-32 md:h-16 lg:w-48 lg:h-24" width={200} height={100}/></span>
              </h1>
              <p className="mt-3 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-400">
                Reporting Facts • Valuing Truth
              </p>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const [categories, setCategories] = useState<{name: string, slug: string}[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories.map((cat: any) => ({ name: cat.name, slug: cat.slug })));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };
  fetchCategories();
}, []);

  useEffect(() => {
    const fetchAndFilter = async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await response.json();
          setSearchResults(data.results || []);
          setIsDropdownOpen(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setIsDropdownOpen(false);
      }
    };

    const timer = setTimeout(fetchAndFilter, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    ...categories.map(cat => ({ name: cat.name, href: `/category/${cat.slug}` })),
    { name: "Team", href: "/team" },
  ];

  return (
    <header className="w-full bg-white">
      {/* Top Bar: Date & Minimal Links */}
      <div className="py-2 md:py-3 border-b border-gray-50">
        <div className="container mx-auto px-4 flex justify-between items-center text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-gray-500">
          <div className="flex items-center space-x-2">
            <Image
              src={logo}
              alt="Logo"
              width={40}
              height={40}
              className="object-contain w-8 h-8 md:w-12 md:h-12"
            />
            <span className="hidden sm:inline">{today}</span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="relative hidden md:block" ref={searchRef}>
            <div className="flex items-center border border-gray-100 rounded-sm px-3 bg-gray-50 focus-within:border-red-700 transition-all duration-200 focus-within:bg-white">
              <svg className="w-3.5 h-3.5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search Stories..."
                className="bg-transparent border-none focus:ring-0 text-[10px] w-32 md:w-48 placeholder:text-gray-400 font-bold uppercase tracking-widest h-8 outline-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setIsDropdownOpen(true)}
              />
            </div>

            {isDropdownOpen && searchResults.length > 0 && (
              <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white border border-gray-100 shadow-2xl z-100 rounded-sm py-1">
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/${item.slug}`}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setSearchQuery("");
                      }}
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <span className="text-[9px] text-red-700 font-black uppercase tracking-tighter mb-1 block">{item.category}</span>
                      <h4 className="text-[11px] font-serif font-bold text-gray-900 leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Search Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Mobile Search Bar */}
        {isDropdownOpen && (
          <div className="md:hidden px-4 py-2 border-t border-gray-100">
            <input
              type="text"
              placeholder="Search Stories..."
              className="w-full border border-gray-200 rounded-sm px-3 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-red-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-gray-100 shadow-lg rounded-sm py-1">
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/${item.slug}`}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setSearchQuery("");
                      }}
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <span className="text-[9px] text-red-700 font-black uppercase tracking-tighter mb-1 block">{item.category}</span>
                      <h4 className="text-[11px] font-serif font-bold text-gray-900 leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="flex flex-col items-center space-y-4">
          {/* Center Logo */}
          <Link href="/" className="group flex flex-col items-center text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-black tracking-tighter text-gray-900">
              PRESIDENCY <span className="text-red-700"><Image  src={logoNBG} alt="Logo" className="inline object-contain w-20 h-10 sm:w-24 sm:h-12 md:w-32 md:h-16 lg:w-48 lg:h-24" width={200} height={100}/></span>
            </h1>
            <p className="mt-3 text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.35em] md:tracking-[0.4em] text-gray-400">
              ....WE REPORT THE FACTS, WE VALUE THE TRUTH
            </p>
          </Link>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-t border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <div className="hidden md:flex h-14 items-center justify-center space-x-6 lg:space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[11px] lg:text-[12px] font-bold uppercase tracking-widest text-gray-700 hover:text-red-700 transition-all duration-300 hover:scale-105"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <button
              className="w-full h-14 flex items-center justify-center space-x-2 text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="text-[11px] font-bold uppercase tracking-widest">Menu</span>
              <svg className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isMobileMenuOpen && (
              <div className="border-t border-gray-100 bg-white">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-700 hover:text-red-700 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}