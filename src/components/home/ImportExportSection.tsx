"use client";

import React, { useState } from "react";
import {
  Globe2,
  Ship,
  Plane,
  Truck,
  PackageCheck,
  CreditCard,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Warehouse,
  Boxes,
  Phone,
  Sparkles,
  FileCheck,
  Anchor,
} from "lucide-react";
import { useQuoteModal } from "@/context/QuoteModalContext";

export function ImportExportSection() {
  const { openQuoteModal } = useQuoteModal();
  const [activeTab, setActiveTab] = useState<"all" | "shipment" | "operations" | "delivery">("all");

  const coreCapabilities = [
    {
      icon: Globe2,
      badge: "Global Sourcing",
      iconColor: "text-brand-blue",
      iconBg: "bg-brand-blue/15 border-brand-blue/30",
      title: "Abroad Procurement & Sourcing",
      desc: "Direct import of commercial goods, industrial machinery, IT components, and consumer commodities from partner networks across China, UAE, Southeast Asia, Europe, and the Americas.",
      category: "shipment",
    },
    {
      icon: Ship,
      badge: "End-to-End Freight",
      iconColor: "text-action-orange",
      iconBg: "bg-action-orange/15 border-action-orange/30",
      title: "Shipment Activities Management",
      desc: "Complete overseas logistics coordination: multi-modal ocean cargo (FCL & LCL), priority air freight, route optimization, port handling, and 24/7 real-time consignment tracking.",
      category: "shipment",
    },
    {
      icon: Boxes,
      badge: "Dock & Yard",
      iconColor: "text-brand-blue",
      iconBg: "bg-brand-blue/15 border-brand-blue/30",
      title: "Precision Loading & Unloading",
      desc: "Certified heavy crane and forklift cargo handling at dockyards and warehouses. Specialized palletization, fragile goods protection, and zero-breakage offloading standards.",
      category: "operations",
    },
    {
      icon: Truck,
      badge: "Last-Mile Fleet",
      iconColor: "text-action-orange",
      iconBg: "bg-action-orange/15 border-action-orange/30",
      title: "Doorstep Customer Delivery",
      desc: "Reliable distribution fleet ensuring prompt dispatch from ports and central hubs directly to customer warehouses, retail points, and business premises throughout Chennai & Pan-India.",
      category: "delivery",
    },
    {
      icon: CreditCard,
      badge: "Financial Security",
      iconColor: "text-brand-blue",
      iconBg: "bg-brand-blue/15 border-brand-blue/30",
      title: "Payment Pickup & Settlement",
      desc: "Transparent cash on delivery (COD), secure cheque collections, and real-time wire payment reconciliation with strict verification and immediate merchant account settlements.",
      category: "delivery",
    },
    {
      icon: TrendingUp,
      badge: "Strategic Advisory",
      iconColor: "text-action-orange",
      iconBg: "bg-action-orange/15 border-action-orange/30",
      title: "International Business Development",
      desc: "Strategic cross-border trade advisory, international vendor negotiation, duty tariff optimization, customs compliance documentation (B/L, HS Codes), and export expansion.",
      category: "operations",
    },
  ];

  const shipmentGallery = [
    {
      title: "Ocean Cargo Freight",
      subtitle: "Large-Scale Container Shipping",
      tag: "Sea Transit",
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
      accent: "border-brand-blue/50",
    },
    {
      title: "Air Express Cargo",
      subtitle: "Time-Critical Air Shipments",
      tag: "Air Transit",
      image: "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&w=800&q=80",
      accent: "border-action-orange/50",
    },
    {
      title: "Palletized Warehousing",
      subtitle: "Automated Goods Storage & Safety",
      tag: "Warehouse",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      accent: "border-brand-blue/50",
    },
    {
      title: "Interstate Transport Fleet",
      subtitle: "Heavy Logistics & Delivery Fleet",
      tag: "Nationwide Transit",
      image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
      accent: "border-action-orange/50",
    },
    {
      title: "Customer Handover & COD",
      subtitle: "Verified Delivery & Payment Pickup",
      tag: "Doorstep Handover",
      image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80",
      accent: "border-brand-blue/50",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Abroad Sourcing & Deal Finalization",
      desc: "Identify verified manufacturers abroad, evaluate product specifications, negotiate wholesale contracts, and structure international trade finance.",
      icon: Globe2,
    },
    {
      step: "02",
      title: "Shipment & Customs Clearance",
      desc: "Coordinate ocean or air freight charters, process bill of lading & tariff classifications, and secure fast-track port authority approvals.",
      icon: Ship,
    },
    {
      step: "03",
      title: "Dock Loading & Unloading",
      desc: "Supervise heavy mechanical offloading, container de-stuffing, quality inspection, and climate-safe transfer into staging warehouses.",
      icon: Boxes,
    },
    {
      step: "04",
      title: "Delivery & Payment Pickup",
      desc: "Execute scheduled last-mile transport directly to client doors, verify consignment integrity, and safely collect & reconcile payment.",
      icon: PackageCheck,
    },
  ];

  const statHighlights = [
    { icon: Globe2, value: "15+ Nations", label: "Sourcing Corridors", color: "text-brand-blue", border: "hover:border-brand-blue/50" },
    { icon: Ship, value: "100% Insured", label: "Sea & Air Transit", color: "text-action-orange", border: "hover:border-action-orange/50" },
    { icon: Boxes, value: "Zero Damage", label: "Loading & Unloading", color: "text-brand-blue", border: "hover:border-brand-blue/50" },
    { icon: PackageCheck, value: "Direct Handover", label: "Delivery & Payment", color: "text-action-orange", border: "hover:border-action-orange/50" },
  ];

  const filteredCapabilities =
    activeTab === "all"
      ? coreCapabilities
      : coreCapabilities.filter((c) => c.category === activeTab);

  return (
    <section
      id="import-export"
      className="py-20 lg:py-28 bg-gradient-to-b from-slate-900 via-surface-deep to-slate-950 text-white relative overflow-hidden border-b border-slate-800"
    >
      {/* Ambient background glows — brand tokens only */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-80 h-80 bg-action-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-20">

        {/* ── HEADER ── */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/20 border border-brand-blue/40 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-action-orange" />
            <span>International Trade & Freight Logistics</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight">
            IMPORT <span className="text-action-orange">/</span> EXPORT
          </h2>

          <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl max-w-3xl mx-auto">
            <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed">
              <span className="text-action-orange font-bold">TECHBIG Solutions</span> owns{" "}
              <strong className="text-white">IMPORT / EXPORT</strong> of various goods from{" "}
              <span className="text-blue-300 font-semibold">abroad countries</span>, manages all{" "}
              <span className="text-white font-semibold">shipment activities</span>,{" "}
              <span className="text-slate-300">loading & unloading</span>,{" "}
              <span className="text-slate-300">customer delivery</span>,{" "}
              <span className="text-slate-300">payment pickup</span>, and{" "}
              <span className="text-slate-300">business development</span>.
            </p>
          </div>

          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            A single-window international logistics powerhouse bridging global suppliers with domestic enterprises — from overseas customs clearance to your final doorstep handover.
          </p>
        </div>

        {/* ── STAT HIGHLIGHTS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statHighlights.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className={`bg-white/5 border border-white/10 rounded-2xl p-5 text-center backdrop-blur-md ${s.border} transition-all duration-300`}
              >
                <Icon className={`w-6 h-6 ${s.color} mx-auto mb-3`} />
                <p className="text-xl font-extrabold text-white">{s.value}</p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* ── GALLERY GRID ── */}
        <div>
          {/* Sub-header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-action-orange text-xs font-bold uppercase tracking-wider mb-2">
                <Anchor className="w-3.5 h-3.5" />
                <span>Operations In-Action</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Global Shipment & Cargo Fleet in Motion
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Sea vessels, airport freight, warehouses, and doorstep transport — all owned and operated by TechBig.
              </p>
            </div>
            <button
              onClick={() => openQuoteModal("Import / Export")}
              className="inline-flex items-center gap-2 bg-brand-blue hover:bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md self-start md:self-auto shrink-0 active:scale-95"
            >
              <span>Get Freight Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Asymmetric 5-card grid: 2 tall left + 3 right */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* First card — tall featured */}
            <div className="lg:col-span-1 lg:row-span-2 group relative rounded-2xl overflow-hidden border border-white/10 bg-slate-800/50 hover:border-brand-blue/50 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <div className="relative h-72 lg:h-full min-h-[280px] w-full overflow-hidden">
                <img
                  src={shipmentGallery[0].image}
                  alt={shipmentGallery[0].title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-blue/80 text-white border border-brand-blue/60 backdrop-blur-md">
                  {shipmentGallery[0].tag}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h4 className="text-lg font-bold text-white group-hover:text-action-orange transition-colors">{shipmentGallery[0].title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">{shipmentGallery[0].subtitle}</p>
              </div>
            </div>

            {/* Remaining 4 cards in a 2×2 grid */}
            {shipmentGallery.slice(1).map((item, idx) => (
              <div
                key={idx}
                className={`group relative rounded-2xl overflow-hidden border border-white/10 bg-slate-800/50 hover:${item.accent} transition-all duration-300 shadow-md hover:shadow-xl`}
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 bg-black/50 text-white`}>
                    {item.tag}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-bold text-white group-hover:text-action-orange transition-colors">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CORE CAPABILITIES GRID ── */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Comprehensive Trade & Operational Services
            </h3>
            <p className="text-sm text-slate-400">
              TechBig Solutions owns and executes every stage of the international supply chain with full accountability.
            </p>

            <div className="inline-flex flex-wrap justify-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mt-4">
              {[
                { id: "all", label: "All Operations" },
                { id: "shipment", label: "Shipment & Sourcing" },
                { id: "operations", label: "Loading & Trade" },
                { id: "delivery", label: "Delivery & Payment" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "all" | "shipment" | "operations" | "delivery")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-action-orange text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCapabilities.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4 gap-3">
                      <div className={`w-11 h-11 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center border shrink-0 group-hover:scale-105 transition-transform`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-slate-300 text-right leading-tight">
                        {item.badge}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white mb-2 group-hover:text-action-orange transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>Guaranteed SLA Handover</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-action-orange" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── WORKFLOW STEPS ── */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-action-orange text-xs font-bold uppercase tracking-wider">
              Step-by-Step Execution Journey
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
              How TechBig Manages Your Import / Export Cycle
            </h3>
            <p className="text-xs text-slate-400">
              Transparent and legally certified — from foreign origin ports to final payment collection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {workflowSteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isOrange = idx % 2 !== 0;
              return (
                <div
                  key={idx}
                  className="relative bg-slate-900/60 border border-white/10 rounded-2xl p-6 hover:border-brand-blue/40 transition-all flex flex-col gap-4 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-white/15 font-mono leading-none">
                      {step.step}
                    </span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isOrange ? "bg-action-orange/15 border-action-orange/30 text-action-orange" : "bg-brand-blue/15 border-brand-blue/30 text-brand-blue"} group-hover:scale-105 transition-transform`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-white mb-1.5 group-hover:text-action-orange transition-colors">
                      {step.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mt-auto">
                    <CheckCircle2 className="w-3 h-3 text-action-orange" />
                    <span>Active Supervision</span>
                  </div>

                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2.5 w-5 h-px bg-white/20 -translate-y-1/2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-action-orange text-xs font-bold uppercase tracking-wider">
              Step-by-Step Execution Journey
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
              How TechBig Manages Your Import / Export Cycle
            </h3>
            <p className="text-xs text-slate-400">
              Transparent and legally certified — from foreign origin ports to final payment collection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {workflowSteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isOrange = idx % 2 !== 0;
              return (
                <div
                  key={idx}
                  className="relative bg-slate-900/60 border border-white/10 rounded-2xl p-6 hover:border-brand-blue/40 transition-all flex flex-col gap-4 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-white/15 font-mono leading-none">
                      {step.step}
                    </span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isOrange ? "bg-action-orange/15 border-action-orange/30 text-action-orange" : "bg-brand-blue/15 border-brand-blue/30 text-brand-blue"} group-hover:scale-105 transition-transform`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-white mb-1.5 group-hover:text-action-orange transition-colors">
                      {step.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mt-auto">
                    <CheckCircle2 className="w-3 h-3 text-action-orange" />
                    <span>Active Supervision</span>
                  </div>

                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2.5 w-5 h-px bg-white/20 -translate-y-1/2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="bg-gradient-to-r from-primary to-brand-blue rounded-3xl p-8 sm:p-10 border border-white/20 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-action-orange" />
              <span>Direct Enterprise Partnership</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              Ready to Import Goods or Expand Export Channels?
            </h3>
            <p className="text-xs sm:text-sm text-white/75">
              Speak directly with our trade specialists in Ambattur, Chennai. Get customized shipment quotes, customs clearances, and secure payment pick-up terms.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => openQuoteModal("Import / Export")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-action-orange hover:bg-secondary-container text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <span>Consult on Import / Export</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="tel:+918122196279"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 px-6 py-3.5 rounded-xl font-bold text-sm transition-all"
            >
              <Phone className="w-4 h-4 text-action-orange" />
              <span>Call (+91) 81221 96279</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
