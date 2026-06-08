'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface Props {
  text: string;
  className?: string;
}

export const RefinedTypography = ({ text, className = "" }: Props) => {
  const words = text.split(" ");

  return (
    <div className={`flex flex-wrap gap-x-[0.3em] overflow-hidden ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 1.2,
            delay: i * 0.08,
            ease: [0.215, 0.61, 0.355, 1], // Custom "out-cubic" for a refined feel
          }}
          whileHover={{ 
            scaleY: 1.1,
            letterSpacing: "0.05em",
            transition: { duration: 0.4, ease: "circOut" }
          }}
          className="inline-block origin-bottom transition-[font-weight] hover:font-bold italic sm:not-italic"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};