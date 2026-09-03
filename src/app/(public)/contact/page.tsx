"use client";

import React, { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { faqsData } from "@/data/services";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ChevronDown,
  Building2,
  Headphones,
  ShieldCheck,
  MessageSquare
} from "lucide-react";

export default function ContactPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "IT Services & Infrastructure",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      showToast("Thank you! Your message has been sent to our enterprise team.", "success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        service: "IT Services & Infrastructure",
        message: "",
      });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1200);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <main className="flex-1 w-full bg-surface pb-20">
      {/* 1. Header Banner */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-surface-container-low border-b border-slate-200/60 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-bold uppercase tracking-wider">
            Direct Communication & Support
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-primary">
            Contact TechBigSolutions
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Reach out to our solution architects, hardware procurement team, and 24/7 technical helpdesk. We respond to all inquiries within 2 hours.
          </p>
        </div>
      </section>

      {/* 2. Contact Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary mb-2">
                Let&apos;s Start a Conversation
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Whether you need turnkey hardware procurement, enterprise cloud migration, or dedicated technical recruitment, our specialists are ready to help.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Card 1: Office */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Headquarters</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    TechBigSolutions Pvt. Ltd.<br />
                    100 Feet Road, Indiranagar Tech Hub<br />
                    Bangalore, Karnataka 560038, India
                  </p>
                </div>
              </div>

              {/* Card 2: Phone */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-action-orange flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Phone & SLA Lines</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Direct Corporate Line: <span className="font-semibold text-slate-800">+91 80 4123 4567</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    24/7 Emergency Support: <span className="font-semibold text-slate-800">+91 98765 43210</span>
                  </p>
                </div>
              </div>

              {/* Card 3: Email */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Email Channels</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    General Inquiries: <span className="font-semibold text-brand-blue">contact@techbigsolutions.in</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Procurement & Sales: <span className="font-semibold text-brand-blue">sales@techbigsolutions.in</span>
                  </p>
                </div>
              </div>

              {/* Card 4: Hours */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Operational Hours</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Corporate Office: Monday - Saturday (9:00 AM - 7:00 PM IST)
                  </p>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                    Network Operations Center (NOC): 24/7/365
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
              <div className="mb-6">
                <h3 className="text-2xl font-display font-bold text-primary mb-1">
                  Send Us an Inquiry
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Fill out the form below and an enterprise solution manager will be assigned to your case immediately.
                </p>
              </div>

              {submitted ? (
                <div className="py-12 text-center space-y-4 bg-emerald-50 rounded-2xl p-8 border border-emerald-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Message Delivered!</h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Thank you for reaching out. We have logged your request and sent a confirmation to your email.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Aditi Nair"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="aditi@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="Apex Technologies"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Service Interest
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                      <option value="IT Services & Infrastructure">System Sales & IT Services</option>
                      <option value="Recruitment & HR Services">Recruitment & Technical HR</option>
                      <option value="Training & Support">Corporate Training & Support</option>
                      <option value="Business Consulting">Business Consulting & Digital Roadmap</option>
                      <option value="Hardware Procurement">Hardware & Accessories Bulk Order</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Message & Requirements *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please describe your technology requirements, project scope, or team staffing goals..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-action-orange hover:bg-secondary-container text-white py-4 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Inquiry Message <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FAQ Accordion Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24" id="faq">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-bold uppercase tracking-wider">
            Help & Knowledge Base
          </div>
          <h2 className="text-3xl font-display font-extrabold text-primary">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600">
            Answers to common questions regarding our service agreements, hardware deliveries, and support SLAs.
          </p>
        </div>

        <div className="space-y-3">
          {faqsData.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? "transform rotate-180 text-brand-blue" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
