"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  initials: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Dr. Sarah Johnson",
    role: "Editor-in-Chief",
    bio: "Award-winning journalist with over 15 years of experience covering politics and international affairs. Former correspondent for major international news organizations.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
    initials: "SJ",
  },
  {
    name: "Michael Chen",
    role: "Senior Editor",
    bio: "Expert in economic policy analysis and business journalism. Previously served as financial analyst at leading investment firms before transitioning to journalism.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
    initials: "MC",
  },
  {
    name: "Amara Okafor",
    role: "Politics Editor",
    bio: "Distinguished political analyst specialising in African governance and policy. Regular contributor to international think tanks and policy journals.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=800&fit=crop",
    initials: "AO",
  },
  {
    name: "David Thompson",
    role: "Sports Editor",
    bio: "Veteran sports journalist with deep expertise in Nigerian and international sports. Former professional athlete turned award-winning sports writer.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop",
    initials: "DT",
  },
];

function MemberCard({
  member,
  index,
}: {
  member: TeamMember;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Portrait */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
        {/* Image */}
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover transition-all duration-700 ease-out"
          style={{
            filter: hovered ? "grayscale(0%) brightness(0.88)" : "grayscale(35%) brightness(1)",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
          sizes="(max-width: 768px) 100vw, 25vw"
        />

        {/* Permanent bottom gradient for name visibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.3) 35%, transparent 60%)",
          }}
        />

        {/* Name + role always visible at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 px-5 pb-5 transition-all duration-500"
          style={{
            transform: hovered ? "translateY(-90px)" : "translateY(0)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "#E8786A", letterSpacing: "0.18em" }}
          >
            {member.role}
          </p>
          <h3
            className="font-serif text-xl font-bold text-white leading-tight"
          >
            {member.name}
          </h3>
        </div>

        {/* Bio panel — slides up from bottom, only covers lower third */}
        <div
          className="absolute bottom-0 left-0 right-0 px-5 pt-4 pb-5 transition-all duration-500 ease-out"
          style={{
            background: "rgba(10, 10, 10, 0.93)",
            borderTop: "1.5px solid #C8102E",
            transform: hovered ? "translateY(0)" : "translateY(100%)",
            backdropFilter: "blur(6px)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "#C8102E", letterSpacing: "0.18em" }}
          >
            {member.role}
          </p>
          <h3 className="font-serif text-base font-bold text-white mb-2 leading-snug">
            {member.name}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "#A09A94", fontWeight: 300 }}>
            {member.bio}
          </p>
        </div>

        {/* Red left rule accent on hover */}
        <div
          className="absolute top-0 left-0 bottom-0 transition-all duration-300"
          style={{
            width: "3px",
            background: "#C8102E",
            transform: hovered ? "scaleY(1)" : "scaleY(0)",
            transformOrigin: "bottom",
          }}
        />
      </div>
    </motion.div>
  );
}

export default function TeamPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen" style={{  color: "#F0EBE3" }}>


      {/* ── HERO ────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ minHeight: "560px" }}>

        {/* Full-bleed background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&h=800&fit=crop"
            alt="Newsroom"
            fill
            className="object-cover"
            style={{ filter: "grayscale(60%) brightness(0.28)" }}
            priority
          />
        </div>

        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.3) 100%)",
          }}
        />

        {/* Red vertical accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0"
          style={{ width: "4px", background: "#C8102E" }}
        />

        {/* Content */}
        <div className="relative z-10 px-16 py-24 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div style={{ width: "40px", height: "1.5px", background: "#C8102E" }} />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#C8102E", letterSpacing: "0.28em" }}
              >
                The Masthead
              </span>
            </div>

            <h1
              className="font-serif font-black text-white leading-none mb-8"
              style={{ fontSize: "clamp(52px, 7vw, 88px)", letterSpacing: "-0.02em" }}
            >
              The Minds
              <br />
              <span className="italic" style={{ color: "#C8102E" }}>Behind</span>
              <br />
              the Odyssey
            </h1>

            <p
              className="text-base leading-relaxed max-w-lg"
              style={{
                color: "#7A7470",
                fontWeight: 300,
                borderLeft: "2px solid #C8102E",
                paddingLeft: "1rem",
              }}
            >
              Dedicated to reporting facts and valuing the truth — through
              rigorous journalistic standards and decades of earned experience
              across Africa and the world.
            </p>
          </motion.div>
        </div>

      </section>

      {/* ── LEADERSHIP FEATURE ─────────────────────────────────── */}
      <section
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr", minHeight: "480px" }}
      >
        {/* Text side */}
        <div
          className="flex flex-col justify-center px-16 py-20"
        >
          <LeadershipText />
        </div>

        {/* Image side */}
        <div className="relative overflow-hidden" style={{ minHeight: "480px" }}>
          <Image
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=700&fit=crop"
            alt="Executive leadership"
            fill
            className="object-cover transition-all duration-1000"
            style={{ filter: "grayscale(25%)" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, rgba(17,17,17,0.5) 0%, transparent 50%)",
            }}
          />
          {/* Caption */}
          <div
            className="absolute bottom-8 right-8"
            style={{
              borderLeft: "2px solid #C8102E",
              paddingLeft: "12px",
            }}
          >
            <p className="text-white font-serif font-bold text-base">Executive Leadership</p>
            <p className="text-xs uppercase tracking-widest" style={{ color: "#C8102E", letterSpacing: "0.16em" }}>
              Committed to Integrity
            </p>
          </div>
        </div>
      </section>

      {/* ── TEAM GRID ───────────────────────────────────────────── */}
      <section className="px-12 py-20">
        {/* Section header */}
        <div
          className="flex items-baseline justify-between mb-14 pb-6"
          style={{ borderBottom: "0.5px solid #2A2420" }}
        >
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "#C8102E", letterSpacing: "0.26em" }}
            >
              Editorial Board
            </p>
            <h2
              className="font-serif font-bold text-black"
              style={{ fontSize: "36px", letterSpacing: "-0.01em" }}
            >
              Meet the Team
            </h2>
          </div>
          <p
            className="text-xs font-semibold uppercase tracking-widest hidden md:block"
            style={{ color: "#3A3430", letterSpacing: "0.16em" }}
          >
            Hover any portrait
          </p>
        </div>

        {/* 4-column portrait grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <MemberCard key={member.name} member={member} index={index} />
          ))}
        </div>
      </section>

    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function LeadershipText() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="flex items-center gap-4 mb-8">
        <div style={{ width: "32px", height: "1.5px", background: "#C8102E" }} />
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "#C8102E", letterSpacing: "0.24em" }}
        >
          Our Leadership
        </span>
      </div>

      <h2
        className="font-serif font-bold text-black leading-tight mb-6"
        style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
      >
        A tradition of
        <br />
        unbiased inquiry.
      </h2>

      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: "#6B6560", fontWeight: 300, maxWidth: "400px" }}
      >
        Our leadership team brings decades of combined experience from some of
        the world's most respected news organisations — dedicated to delivering
        accurate, unbiased journalism that informs and empowers.
      </p>

      <p
        className="text-sm leading-relaxed"
        style={{ color: "#6B6560", fontWeight: 300, maxWidth: "400px" }}
      >
        With expertise spanning politics, economics, sports, and national
        relations, every story meets the highest standards of journalistic
        integrity and depth.
      </p>
    </motion.div>
  );
}