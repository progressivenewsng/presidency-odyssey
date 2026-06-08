'use client';

import React, { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

export const RefinedButton = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLButtonElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * 0.35);
    y.set((clientY - centerY) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative px-8 py-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-medium overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] group"
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
      />
      <span className="relative z-10 flex items-center gap-2">
        {children}
        <motion.span
          initial={{ x: -2, opacity: 0.5 }}
          animate={{ x: 2, opacity: 1 }}
          transition={{ 
            repeat: Infinity, 
            repeatType: "mirror", 
            duration: 2,
            ease: [0.45, 0, 0.55, 1] 
          }}
        >
          →
        </motion.span>
      </span>
    </motion.button>
  );
};