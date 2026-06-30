"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import dg from "../../assets/dg.jpg";

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
      <section ref={heroRef} className="relative overflow-hidden" style={{ minHeight: "min(400px, 60vh)" }}>

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
        <div className="relative z-10 px-4 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20 lg:py-24 max-w-4xl mx-auto lg:mx-0 ">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div style={{ width: "32px", height: "1.5px", background: "#C8102E" }} />
              <span
                className="text-[10px] sm:text-xs font-bold uppercase tracking-widest"
                style={{ color: "#C8102E", letterSpacing: "0.28em" }}
              >
                The Masthead
              </span>
            </div>

            <h1
              className="font-serif font-black text-white leading-none mb-6 sm:mb-8"
              style={{ fontSize: "clamp(32px, 7vw, 88px)", letterSpacing: "-0.02em" }}
            >
              The Minds
              <br />
              <span className="italic" style={{ color: "#C8102E" }}>Behind</span>
              <br />
              the Odyssey
            </h1>

            <p
              className="text-sm sm:text-base leading-relaxed max-w-lg"
              style={{
                color: "#7A7470",
                fontWeight: 300,
                borderLeft: "2px solid #C8102E",
                paddingLeft: "1rem",
              }}
            >
              Dedicated to reporting facts and valuing the truth — through
              rigorous journalistic standards and earned experience
              across Nigeria.
            </p>
          </motion.div>
        </div>

      </section>

      {/* ── LEADERSHIP FEATURE ─────────────────────────────────── */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2"
        style={{ minHeight: "min(400px, 50vh)" }}
      >
        {/* Text side */}
        <div
          className="flex-2 flex-col justify-center px-8 sm:px-12 md:px-16 py-12 sm:py-16 md:py-20"
        >
          <LeadershipText />
        </div>

        {/* Image side */}
        <div className=" bg-indigo-400 flex-1 relative overflow-hidden w-full" style={{ height: "600px"}}>
          <Image
            src={dg}
            alt="Executive leadership"
            fill
            className="transition-all duration-1000 object-contain"
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
            className="absolute bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8"
            style={{
              borderLeft: "2px solid #C8102E",
              paddingLeft: "12px",
            }}
          >
            <p className="text-white font-serif font-bold text-sm sm:text-base">Mr. Folorunso S. Aluko</p>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold" style={{ color: "#C8102E", letterSpacing: "0.16em" }}>
              EDITOR-IN-CHIEF
            </p>
          </div>
        </div>
      </section>

      {/* ── TEAM GRID ───────────────────────────────────────────── */}
      <section className="px-4 sm:px-8 md:px-12 py-12 sm:py-16 md:py-20">
        {/* Section header */}
        <div
          className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-8 sm:mb-14 pb-4 sm:pb-6"
          style={{ borderBottom: "0.5px solid #2A2420" }}
        >
          <div>
            <p
              className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3"
              style={{ color: "#C8102E", letterSpacing: "0.26em" }}
            >
              Editorial Board
            </p>
            <h2
              className="font-serif font-bold text-black"
              style={{ fontSize: "clamp(24px, 4vw, 36px)", letterSpacing: "-0.01em" }}
            >
              Meet the Team
            </h2>
          </div>
          <p
            className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest hidden sm:block mt-2 sm:mt-0"
            style={{ color: "#3A3430", letterSpacing: "0.16em" }}
          >
            Hover any portrait
          </p>
        </div>

        {/* 4-column portrait grid */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {teamMembers.map((member, index) => (
            <MemberCard key={member.name} member={member} index={index} />
          ))}
        </div> */}
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
      <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
        <div style={{ width: "32px", height: "1.5px", background: "#C8102E" }} />
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "#C8102E", letterSpacing: "0.24em" }}
        >
          Our Leadership
        </span>
      </div>

      <h2
        className="flex font-serif font-bold text-black leading-tight mb-6 justify-center lg:justify-start"
        style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
      >
        A tradition of
        <br />
        unbiased inquiry.
      </h2>

      <p
        className="flex text-sm leading-relaxed mb-4 justify-center lg:justify-start"
        style={{ color: "#6B6560", fontWeight: 300,  }}
      >
        Folorunso S. Aluko is a seasoned Political Scientist, Psephologist, Leadership Expert, Public Administrator and Kingdom Steward with distinguished experience across academia, governance, public policy, political strategy, ICT-driven public sector reform and human capital development. He serves as Director General and Chief Executive Officer of the Progressive Governors Forum, Abuja, where he provides strategic leadership, institutional coordination and policy support for governance and political engagement in Nigeria.
      </p>

      <p
        className="flex text-sm leading-relaxed justify-center lg:justify-start"
        style={{ color: "#6B6560", fontWeight: 300,}}
      >
         He is also Chair of the Board of The Development Chronicles and Editor-in-Chief of The Presidency Odyssey, contributing meaningfully to national discourse, leadership development and governance-focused public communication. A former academic and public-sector leader, Pastor Aluko is committed to integrity, service, ethical leadership and national development. He is also President of Covenant Leadership Ministry International.
      </p>
    </motion.div>
  );
}