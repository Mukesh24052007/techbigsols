"use client";

import React from "react";
import Link from "next/link";
import {
  Code,
  Terminal,
  FileSpreadsheet,
  Calculator,
  Database,
  Network,
  Cpu,
  CheckCircle2,
  ArrowRight,
  BarChart2,
  Table2,
  Server,
  BookOpen,
  FileText,
} from "lucide-react";
import { useQuoteModal } from "@/context/QuoteModalContext";
import { SYLLABUS_PATHS } from "@/data/syllabuses";
import { skillCourses, type SkillCourse } from "@/data/courses";

const courseIconMap: Record<string, React.ElementType> = {
  FileSpreadsheet,
  Calculator,
  Code,
  Terminal,
  Database,
  Server,
  Cpu,
  BarChart2,
  Table2,
  Network,
};

export function TechCoursesSection() {
  const { openQuoteModal } = useQuoteModal();

  return (
    <section className="py-20 bg-surface-container-low border-y border-slate-200" id="tech-courses">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wider">
            <span>Practical Learning • Industry Focused</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-primary">
            Master In-Demand Skills.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-action-orange">
              Boost Your Career & Business
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Certified technical training with real-time projects, live coding practice, transparent fees, and 100% placement support.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {skillCourses.map((course: SkillCourse) => {
            const IconComp = courseIconMap[course.iconName] ?? Code;
            const syllabusPath = SYLLABUS_PATHS[course.id];

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:border-brand-blue/40 relative"
              >
                {course.popular && (
                  <span className="absolute top-3 right-3 bg-action-orange text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-brand-blue mb-3 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-display font-bold text-primary">
                    {course.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mb-3">
                    {course.tagline}
                  </p>
                  <div className="space-y-1.5 border-t border-slate-100 pt-3 mb-4">
                    {course.topics.map((t, idx) => (
                      <p key={idx} className="text-xs text-slate-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{t}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-primary font-display">
                      {course.price}
                    </span>
                    <button
                      onClick={() => openQuoteModal(`Skill Course: ${course.name}`)}
                      className="text-xs font-bold text-brand-blue hover:text-action-orange transition-colors"
                    >
                      Enroll Now →
                    </button>
                  </div>

                  {/* Syllabus button — only rendered when a PDF is available */}
                  {syllabusPath ? (
                    <a
                      href={syllabusPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 border border-brand-blue/30 hover:border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white text-[11px] font-bold py-1.5 rounded-lg transition-all"
                    >
                      <FileText className="w-3 h-3" />
                      <span>View Syllabus</span>
                    </a>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-1.5 border border-slate-200 text-slate-400 text-[11px] py-1.5 rounded-lg cursor-default select-none">
                      <BookOpen className="w-3 h-3" />
                      <span>Syllabus Coming Soon</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Link to Complete Services Page */}
        <div className="text-center">
          <Link
            href="/services#software-development"
            className="inline-flex items-center gap-2 bg-brand-blue hover:bg-primary text-white text-xs sm:text-sm font-bold px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <span>Explore All Software Courses & Full Curriculum Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
