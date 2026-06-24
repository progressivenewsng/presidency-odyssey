"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Headline {
  id: string;
  slug: string;
  title: string;
}

export default function FlashStory() {
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeadlines = async () => {
      try {
        const response = await fetch('/api/headlines');
        const data = await response.json();
        setHeadlines(data.headlines || []);
      } catch (error) {
        console.error('Failed to fetch headlines:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeadlines();
  }, []);

  if (loading || headlines.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-red-700 border-b border-red-800 overflow-hidden hover:bg-white transition-colors duration-300">
      <div className="flex items-center">
        {/* Flash Story Label */}
        <div className="bg-red-900 hover:bg-red-700 px-4 py-2 shrink-0 transition-colors duration-300 flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-white font-black text-xs uppercase tracking-widest">
            Flash Story
          </span>
        </div>
        
        {/* Marquee Container */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex animate-marquee whitespace-nowrap group">
            {/* Duplicate headlines for seamless loop */}
            {[...headlines, ...headlines, ...headlines].map((headline, index) => (
              <Link
                key={`${headline.id}-${index}`}
                href={`/${headline.slug}`}
                className="inline-block px-8 py-2 text-white font-serif font-bold text-sm hover:text-red-700 group-hover:text-red-700 transition-colors"
              >
                {headline.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
