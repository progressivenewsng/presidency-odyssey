'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface NewsCarouselProps {
  children: React.ReactNode[];
  direction?: 'horizontal' | 'vertical';
  heightClass?: string;
}

export default function NewsCarousel({ children, direction = 'horizontal', heightClass }: NewsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(true);

  const checkScrollLimits = () => {
    if (containerRef.current) {
      if (direction === 'vertical') {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        setShowPrev(scrollTop > 5);
        setShowNext(scrollTop + clientHeight < scrollHeight - 5);
      } else {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        setShowPrev(scrollLeft > 5);
        setShowNext(scrollLeft + clientWidth < scrollWidth - 5);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      checkScrollLimits();
      container.addEventListener('scroll', checkScrollLimits);
      
      const observer = new ResizeObserver(() => {
        checkScrollLimits();
      });
      observer.observe(container);
      
      return () => {
        container.removeEventListener('scroll', checkScrollLimits);
        observer.disconnect();
      };
    }
  }, [children, direction]);

  const handleScroll = (dir: 'prev' | 'next') => {
    if (containerRef.current) {
      if (direction === 'vertical') {
        const { clientHeight } = containerRef.current;
        const scrollAmount = dir === 'prev' ? -clientHeight * 0.7 : clientHeight * 0.7;
        containerRef.current.scrollBy({
          top: scrollAmount,
          behavior: 'smooth',
        });
      } else {
        const { clientWidth } = containerRef.current;
        const scrollAmount = dir === 'prev' ? -clientWidth * 0.75 : clientWidth * 0.75;
        containerRef.current.scrollBy({
          left: scrollAmount,
          behavior: 'smooth',
        });
      }
    }
  };

  const isVertical = direction === 'vertical';

  return (
    <div className={`relative w-full ${isVertical ? 'py-6' : ''}`}>
      {/* Navigation Buttons for Horizontal */}
      {!isVertical && showPrev && (
        <button
          onClick={() => handleScroll('prev')}
          className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-red-50 text-gray-800 hover:text-red-700 p-2.5 rounded-full shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 focus:outline-none hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {!isVertical && showNext && (
        <button
          onClick={() => handleScroll('next')}
          className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-red-50 text-gray-800 hover:text-red-700 p-2.5 rounded-full shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 focus:outline-none hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* Navigation Buttons for Vertical */}
      {isVertical && showPrev && (
        <button
          onClick={() => handleScroll('prev')}
          className="absolute top-0 left-1/2 -translate-x-1/2 z-30 bg-white hover:bg-red-50 text-gray-800 hover:text-red-700 p-2 rounded-full shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 focus:outline-none hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Scroll up"
        >
          <ChevronUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {isVertical && showNext && (
        <button
          onClick={() => handleScroll('next')}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 bg-white hover:bg-red-50 text-gray-800 hover:text-red-700 p-2 rounded-full shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 focus:outline-none hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Scroll down"
        >
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Carousel Scroll Container */}
      <div
        ref={containerRef}
        className={
          isVertical
            ? `flex flex-col overflow-y-auto scrollbar-none snap-y snap-mandatory gap-4 scroll-smooth px-1 ${heightClass || 'h-[460px] lg:h-[500px]'}`
            : 'flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-6 pb-4 scroll-smooth px-1'
        }
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className={`snap-start shrink-0 select-none ${isVertical ? 'w-full' : ''}`}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
