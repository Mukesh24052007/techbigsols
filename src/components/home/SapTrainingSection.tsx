"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Coins,
  Truck,
  Boxes,
  Layers,
  ShieldAlert,
  Database,
  Cpu,
  Users,
  Factory,
  FlaskConical,
  Radio,
  Cog,
  BookOpen,
  FileText,
} from "lucide-react";
import { useQuoteModal } from "@/context/QuoteModalContext";
import { SYLLABUS_PATHS } from "@/data/syllabuses";
import { sapModulesList, sapPillars, SAP_INITIAL_VISIBLE, type SapModuleSummary, type SapPillar } from "@/data/sap";

const sapModuleIconMap: Record<string, React.ElementType> = {
  Coins,
  Truck,
  Boxes,
  Layers,
  Factory,
  FlaskConical,
  Radio,
  Cog,
  ShieldAlert,
  Database,
  Cpu,
  Users,
};

const sapPillarIconMap: Record<string, React.ElementType> = {
  Briefcase,
  Award,
  GraduationCap,
  CheckCircle2,
};

export function SapTrainingSection() {
  const { openQuoteModal } = useQuoteModal();
  const [showAll, setShowAll] = useState(false);

  const visibleModules = showAll ? sapModulesList : sapModulesList.slice(0, SAP_INITIAL_VISIBLE);
  const hiddenCount = sapModulesList.length - SAP_INITIAL_VISIBLE;

  return (
    <section className="py-20 lg:py-24 bg-surface-deep text-white relative overflow-hidden" id="sap-training">
      {/* Ambient Lighting */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-action-orange/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/30 border border-brand-blue/50 text-blue-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <span>Official Flagship Academy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.15]">
            Master SAP.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-amber-200 to-action-orange">
              Build Your Future.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Comprehensive training across all SAP modules with certification support and 100% employment assistance. Led by veteran consultants with real-time enterprise delivery.
          </p>
        </div>

        {/* 4 Core Pillars Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-12">
          {sapPillars.map((pillar: SapPillar) => {
            const IconComp = sapPillarIconMap[pillar.iconName] ?? CheckCircle2;
            return (
              <div key={pillar.iconName} className="bg-white/5 border border-white/10 p-4 rounded-xl text-center backdrop-blur-sm">
                <IconComp className="w-6 h-6 text-action-orange mx-auto mb-1.5" />
                <p className="text-xs font-bold text-white">{pillar.title}</p>
                <p className="text-[11px] text-slate-400">{pillar.subtitle}</p>
              </div>
            );
          })}
        </div>

        {/* SAP Modules Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 mb-4">
          {visibleModules.map((m: SapModuleSummary) => {
            const IconComp = sapModuleIconMap[m.iconName] ?? Cpu;
            const syllabusPath = SYLLABUS_PATHS[m.id];

            return (
              <div
                key={m.id}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-action-orange/50 rounded-2xl p-4 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-action-orange group-hover:scale-110 transition-transform">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                      {m.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-display font-bold text-white group-hover:text-blue-200 transition-colors">
                    {m.code}
                  </h3>
                  <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5 font-medium">
                    {m.name}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <p className="text-[10px] text-slate-400 line-clamp-1 flex-1">
                    {m.tag}
                  </p>
                  {syllabusPath ? (
                    <a
                      href={syllabusPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`View ${m.code} Syllabus PDF`}
                      className="flex items-center gap-1 text-[10px] font-bold text-action-orange hover:text-amber-300 transition-colors shrink-0"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Syllabus</span>
                    </a>
                  ) : (
                    <span
                      title="Syllabus PDF coming soon"
                      className="flex items-center gap-1 text-[10px] text-slate-600 shrink-0 cursor-default"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Soon</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View More / Show Less toggle */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-2 border border-white/20 hover:border-action-orange/60 hover:bg-white/5 text-slate-300 hover:text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>View {hiddenCount} More Modules</span>
              </>
            )}
          </button>
        </div>

        {/* Action Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/services#sap-enterprise"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-action-orange hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-action-orange/25 transition-all active:scale-95"
          >
            <span>View Complete SAP Syllabus & E2E Implementation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => openQuoteModal("SAP Training & Certification")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 px-7 py-3.5 rounded-xl font-bold text-sm transition-all"
          >
            <span>Enroll in SAP Course</span>
          </button>
        </div>
      </div>
    </section>
  );
}
