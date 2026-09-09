"use client";

import React, { useState } from "react";
import { useQuoteModal } from "@/context/QuoteModalContext";
import { useToast } from "@/context/ToastContext";
import { X, Send, Phone, Mail, CheckCircle2 } from "lucide-react";

export function QuoteModal() {
  const { isQuoteModalOpen, closeQuoteModal, selectedService } = useQuoteModal();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: selectedService,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sync selected service if changed externally
  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, service: selectedService }));
  }, [selectedService]);

  if (!isQuoteModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast("Your inquiry has been received! Our team will contact you within 2 hours.", "success");
      setTimeout(() => {
        setIsSubmitted(false);
        closeQuoteModal();
      }, 2500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={closeQuoteModal}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-2xl rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200 overflow-hidden z-10 min-h-dvh sm:min-h-0 sm:my-6 mx-0 sm:mx-4 animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-brand-blue text-white p-6 sm:p-8 relative">
          <button
            onClick={closeQuoteModal}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold uppercase tracking-wider mb-3">
            Accelerate Your Growth
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold">Request a Consultation</h2>
          <p className="text-white/80 text-sm mt-1 max-w-md">
            Speak directly with our enterprise technology specialists. Get tailored proposals and SLA timelines.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 bg-white">
          {isSubmitted ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Thank You!</h3>
              <p className="text-slate-600 max-w-md text-sm">
                We have received your requirements for <strong className="text-brand-blue">{formData.service}</strong>. An enterprise solution architect will connect with you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-2">
                  Select Service Area
                </label>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    "SAP Training",
                    "Skill Courses",
                    "Hardware Service",
                    "Travel Booking",
                    "Import / Export",
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, service: s })}
                      className={`text-xs font-medium py-2.5 px-3 rounded-lg border text-center transition-all ${formData.service === s
                          ? "bg-brand-blue text-white border-brand-blue shadow-sm font-semibold"
                          : "bg-white text-slate-700 border-slate-300 hover:border-brand-blue/60"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 81221 96279"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Center (Ambattur)</label>
                  <input
                    type="text"
                    placeholder="Chennai"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Requirement / Module Details</label>
                <textarea
                  rows={3}
                  placeholder="Specify SAP module, software course, device issue, or travel dates..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-brand-blue" /> Call / WhatsApp: +91 8122196279
                  </span>
                  <span className="hidden sm:inline text-slate-400">•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-brand-blue" /> techbigsolutions@gmail.com
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto sm:self-end bg-action-orange hover:bg-secondary-container text-white px-8 py-3 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Request <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
