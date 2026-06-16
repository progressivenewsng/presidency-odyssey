"use client";
 
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from '../../assets/logo.jpg'
import logoNBG from '../../assets/logoNBG.png'
import { getAllNews } from "@/lib/data";
 
export default function Header() {
  const pathname = usePathname();
  const isAdminLogin = pathname.includes('/admin');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

 
  // If it's admin login, only show the simplified logo
  if (isAdminLogin) {
    return (
      <header className="w-full bg-white">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center space-y-4">
            <Link href="/" className="group flex flex-col items-center text-center">
              <h1 className="text-5xl font-serif font-black tracking-tighter text-gray-900 md:text-7xl">
                PRESIDENCY <span className="text-red-700"><Image  src={logoNBG} alt="Logo" className="inline object-contain" width={200} height={100}/></span>
              </h1>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.4em] text-gray-400">
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
        const allNews = await getAllNews();
        const filtered = allNews.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
        setIsDropdownOpen(true);
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
    { name: "Team", href: "/team" },
    ...categories.map(cat => ({ name: cat.name, href: `/category/${cat.slug}` }))
  ];

  return (
    <header className="w-full bg-white">
      {/* Top Bar: Date & Minimal Links */}
      <div className="py-3 hidden md:block border-b border-gray-50">
        <div className="container mx-auto px-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
          <div className="flex items-center space-x-2">
            <Image 
              src={logo} 
              alt="Logo" 
              width={100} 
              height={100} 
              className="object-contain"
            />
            <span>{today}</span>
          </div>
          
          {/* Search Bar */}
          <div className="relative" ref={searchRef}>
            <div className="flex items-center border border-gray-100 rounded-sm px-3 bg-gray-50 focus-within:border-red-700 transition-all duration-200 focus-within:bg-white">
              <svg className="w-3.5 h-3.5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search Stories..." 
                className="bg-transparent border-none focus:ring-0 text-[10px] w-48 placeholder:text-gray-400 font-bold uppercase tracking-widest h-8 outline-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setIsDropdownOpen(true)}
              />
            </div>

            {isDropdownOpen && searchResults.length > 0 && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 shadow-2xl z-100 rounded-sm py-1">
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
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center space-y-4">
          {/* Center Logo */}
          <Link href="/" className="group flex flex-col items-center text-center">
            <h1 className="text-5xl font-serif font-black tracking-tighter text-gray-900 md:text-7xl">
              PRESIDENCY <span className="text-red-700"><Image  src={logoNBG} alt="Logo" className="inline object-contain" width={200} height={100}/></span>
            </h1>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.4em] text-gray-400">
              Reporting Facts • Valuing Truth
            </p>
          </Link>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-t border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[12px] font-bold uppercase tracking-widest text-gray-700 hover:text-red-700 transition-all duration-300 hover:scale-105"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}