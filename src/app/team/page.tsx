"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { RefinedTypography } from '@/components/layout/RefinedTypography';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Dr. Sarah Johnson",
    role: "Editor-in-Chief",
    bio: "Award-winning journalist with over 15 years of experience covering politics and international affairs. Former correspondent for major international news organizations.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
  },
  {
    name: "Michael Chen",
    role: "Senior Editor",
    bio: "Expert in economic policy analysis and business journalism. Previously served as financial analyst at leading investment firms before transitioning to journalism.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
  },
  {
    name: "Amara Okafor",
    role: "Politics Editor",
    bio: "Distinguished political analyst specializing in African governance and policy. Regular contributor to international think tanks and policy journals.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop"
  },
  {
    name: "David Thompson",
    role: "Sports Editor",
    bio: "Veteran sports journalist with deep expertise in Nigerian and international sports. Former professional athlete turned award-winning sports writer.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
  }
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      {/* Minimalist Hero Section */}
      <div className="relative border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <span className="text-red-700 text-xs font-black uppercase tracking-[0.3em] mb-6 block">
              Our Collective
            </span>
            <RefinedTypography 
              text="The Minds Behind The Odyssey" 
              className="text-5xl md:text-8xl font-serif font-bold text-slate-900 mb-8 leading-[0.9]"
            />
            <p className="text-xl md:text-2xl text-slate-500 font-serif italic max-w-2xl leading-relaxed">
              Dedicated to reporting facts and valuing the truth through rigorous journalistic standards.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Leadership Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-16 items-start mb-32">
            <div className="lg:col-span-7 relative">
              <div className="aspect-[16/10] overflow-hidden bg-slate-100 grayscale hover:grayscale-0 transition-all duration-1000">
                <Image
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop"
                  alt="Leadership"
                  fill
                  className="object-cover scale-105"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 border border-red-700/10 -z-10"></div>
            </div>
            <div className="lg:col-span-5 pt-4">
              <h2 className="text-4xl font-serif font-bold text-slate-900 mb-8 leading-tight">
                A Tradition of Unbiased Inquiry.
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed font-sans">
                Our leadership team brings decades of combined experience from some of the world's most respected news organizations. We are dedicated to delivering accurate, unbiased journalism that informs and empowers our readers.
              </p>
              <div className="grid grid-cols-2 gap-8 border-t border-gray-200 pt-8">
                <div>
                  <div className="text-3xl font-serif font-bold text-red-700">15+</div>
                  <div className="text-xs uppercase font-black tracking-widest text-slate-400 mt-1">Years Experience</div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-bold text-red-700">50+</div>
                  <div className="text-xs uppercase font-black tracking-widest text-slate-400 mt-1">Journalism Awards</div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Cards Grid */}
          <div className="mb-32">
            <div className="flex items-end justify-between mb-16 border-b border-gray-900 pb-8">
              <h2 className="text-5xl font-serif font-bold text-slate-900">The Editorial Board</h2>
              <div className="h-0.5 w-24 bg-red-700"></div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="relative overflow-hidden mb-6">
                    <div className="aspect-[4/5] relative">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                      />
                      {/* Hover Bio Reveal */}
                      <motion.div 
                        className="absolute inset-0 bg-red-700/90 p-8 flex flex-col justify-end translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"
                      >
                        <p className="text-white text-sm font-serif leading-relaxed line-clamp-6">
                          {member.bio}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-red-700 text-xs font-black uppercase tracking-widest">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <motion.div 
            whileHover={{ scale: 0.99 }}
            className="bg-slate-950 p-16 text-center border-t-4 border-red-700"
          >
            <h2 className="text-4xl font-serif font-bold text-white mb-6">Forge The Future with Us.</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto font-serif">
              We seek bold voices who value journalistic integrity above all else.
            </p>
            <a
              href="mailto:careers@presidencyodyssey.com"
              className="inline-block px-12 py-4 bg-red-700 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-red-800 transition-colors"
            >
              Join The Registry
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}