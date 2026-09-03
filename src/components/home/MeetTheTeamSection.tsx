"use client";

import React, { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    id: "alice",
    name: "Alice Johnson",
    role: "CEO & Founder",
    bio: "Alice has over 15 years of experience in strategic leadership and business development, driving tech transformations across enterprise organizations.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
    },
  },
  {
    id: "carter",
    name: "Carter Botosh",
    role: "Chief Financial Officer",
    bio: "Carter specializes in enterprise financial planning, strategic investments, and scalable resource allocation for next-gen technology solutions.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
    },
  },
  {
    id: "phillip",
    name: "Phillip Ekstrom",
    role: "Head of Technology",
    bio: "Phillip directs software engineering, cloud architecture, and mission-critical enterprise systems with world-class engineering rigor.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
    },
  },
  {
    id: "abram",
    name: "Abram Culhane",
    role: "Head of Operations",
    bio: "Abram leads operational excellence, hardware procurement, and high-performance talent acquisition strategies across all global deployments.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
    },
  },
  {
    id: "marcus",
    name: "Marcus Vance",
    role: "Lead Cloud Architect",
    bio: "Marcus designs high-availability hybrid cloud networks and infrastructure security protocols for high-growth enterprise systems.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
    },
  },
  {
    id: "elena",
    name: "Elena Rostova",
    role: "VP of Enterprise AI",
    bio: "Elena oversees business intelligence pipelines, automation workflows, and predictive analytics deployment across client ecosystems.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
    },
  },
];

export function MeetTheTeamSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeMemberId, setActiveMemberId] = useState<string>(teamMembers[0].id);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeMember =
    teamMembers.find((m) => m.id === activeMemberId) || teamMembers[0];

  const updateScrollState = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Approximate active index based on scroll position for dots
    const approxCardWidth = 300;
    const newIndex = Math.min(
      teamMembers.length,
      Math.max(0, Math.round(scrollLeft / approxCardWidth))
    );
    setActiveIndex(newIndex);
  };

  useEffect(() => {
    updateScrollState();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollState, { passive: true });
      window.addEventListener("resize", updateScrollState);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", updateScrollState);
      }
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    // Compute scroll amount dynamically based on container width
    const scrollAmount = container.clientWidth > 640 ? 340 : 290;
    const delta = direction === "left" ? -scrollAmount : scrollAmount;
    container.scrollBy({ left: delta, behavior: "smooth" });
  };

  const scrollToCard = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = (container.clientWidth > 640 ? 340 : 290) * index;
    container.scrollTo({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-6 mb-8 sm:mb-12 lg:mb-14">
        <div className="space-y-3 sm:space-y-4 max-w-2xl">
          {/* Top Pill Badge */}
          <div>
            <span className="inline-flex items-center justify-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full border border-primary/30 text-[11px] sm:text-xs font-bold tracking-wider text-brand-blue uppercase bg-brand-blue/8">
              EXPERTISE
            </span>
          </div>

          {/* Section Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-display font-extrabold tracking-tight text-primary leading-[1.18] sm:leading-[1.15]">
            Meet The Team
          </h2>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-start sm:self-end">
          <button
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll team members left"
            className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-brand-blue hover:bg-primary active:scale-95 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-brand-blue/25 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-blue disabled:active:scale-100"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
          </button>
          <button
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll team members right"
            className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-brand-blue hover:bg-primary active:scale-95 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-brand-blue/25 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-blue disabled:active:scale-100"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Cards Slider / Carousel with Edge-to-Edge Padding on Mobile */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth no-scrollbar scrollbar-none select-none snap-x snap-mandatory scroll-pl-4 sm:scroll-pl-6 lg:scroll-pl-8"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* 1. Active Featured Info Card */}
          <div className="w-[78vw] min-w-[260px] max-w-[300px] sm:w-[300px] md:w-[320px] h-[390px] sm:h-[430px] md:h-[450px] shrink-0 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] bg-brand-blue text-white p-6 sm:p-7 md:p-8 flex flex-col justify-between shadow-xl shadow-brand-blue/25 snap-start transition-all duration-300">
            {/* Top: Name & Role */}
            <div>
              <h3 className="text-xl sm:text-2xl md:text-[26px] font-display font-bold text-white tracking-tight leading-snug">
                {activeMember.name}
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm font-medium mt-1">
                {activeMember.role}
              </p>

              {/* Middle: Bio description */}
              <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed mt-4 sm:mt-6 md:mt-8 font-normal line-clamp-5 sm:line-clamp-none">
                {activeMember.bio}
              </p>
            </div>

            {/* Bottom: Social Icon Links */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4">
              {activeMember.socials.linkedin && (
                <a
                  href={activeMember.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${activeMember.name} LinkedIn`}
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all duration-200"
                >
                  {/* LinkedIn SVG */}
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>
              )}

              {activeMember.socials.twitter && (
                <a
                  href={activeMember.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${activeMember.name} Twitter / X`}
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all duration-200"
                >
                  {/* Twitter/X SVG */}
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}

              {activeMember.socials.instagram && (
                <a
                  href={activeMember.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${activeMember.name} Instagram`}
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all duration-200"
                >
                  {/* Instagram SVG */}
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-none stroke-current"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* 2. Photo Cards */}
          {teamMembers.map((member) => {
            const isSelected = member.id === activeMemberId;
            return (
              <div
                key={member.id}
                onClick={() => setActiveMemberId(member.id)}
                className={`group relative w-[78vw] min-w-[260px] max-w-[300px] sm:w-[300px] md:w-[320px] h-[390px] sm:h-[430px] md:h-[450px] shrink-0 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] overflow-hidden cursor-pointer snap-start transition-all duration-300 bg-surface-container-low ${
                  isSelected
                    ? "ring-4 ring-brand-blue ring-offset-2 scale-[0.99]"
                    : "hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                {/* Portrait Image */}
                <img
                  src={member.image}
                  alt={`${member.name} — ${member.role}`}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".fallback-avatar")) {
                      const fallback = document.createElement("div");
                      fallback.className =
                        "fallback-avatar w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900";
                      const initials = document.createElement("span");
                      initials.className =
                        "text-white font-display font-bold text-3xl sm:text-4xl";
                      initials.textContent = member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("");
                      fallback.appendChild(initials);
                      parent.appendChild(fallback);
                    }
                  }}
                />

                {/* Gradient overlay at the bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                {/* Bottom text overlay */}
                <div className="absolute bottom-5 sm:bottom-6 inset-x-3 sm:inset-x-4 text-center z-10 pointer-events-none">
                  <h4 className="text-base sm:text-lg md:text-xl font-display font-bold text-white tracking-tight drop-shadow-sm">
                    {member.name}
                  </h4>
                  <p className="text-[11px] sm:text-xs md:text-sm text-slate-300 font-medium mt-0.5 drop-shadow-sm">
                    {member.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Pagination Indicator Dots */}
        <div className="flex sm:hidden justify-center items-center gap-1.5 mt-4">
          {Array.from({ length: teamMembers.length + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToCard(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                activeIndex === idx
                  ? "w-6 h-2 bg-brand-blue"
                  : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
