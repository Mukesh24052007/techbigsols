"use client";

import React, { useState, useEffect } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { TOKEN_KEY } from "@/lib/axios";
import {
  Settings,
  MapPin,
  Clock,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
} from "lucide-react";

interface OfficeData {
  id?: number | string;
  name: string;
  lat: number;
  lng: number;
  radius_m: number;
  shift_start: string;
  shift_end: string;
  grace_minutes: number;
  heartbeat_seconds: number;
  outside_tolerance_minutes: number;
}

export default function OfficeSettingsPage() {
  const { isAuthenticated } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [office, setOffice] = useState<OfficeData>({
    id: 2,
    name: "TBS HQ Bangalore",
    lat: 12.9716,
    lng: 77.5946,
    radius_m: 150,
    shift_start: "09:30",
    shift_end: "18:30",
    grace_minutes: 10,
    heartbeat_seconds: 60,
    outside_tolerance_minutes: 10,
  });

  useEffect(() => {
    async function loadOffice() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : "";
        const res = await fetch("/api/admin/attendance/offices", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const json = await res.json();
          const first = json.data?.offices?.[0];
          if (first) {
            setOffice({
              id: first.id,
              name: first.name,
              lat: Number(first.lat),
              lng: Number(first.lng),
              radius_m: Number(first.radius_m),
              shift_start: (first.shift_start || "09:30").slice(0, 5),
              shift_end: (first.shift_end || "18:30").slice(0, 5),
              grace_minutes: Number(first.grace_minutes || 10),
              heartbeat_seconds: Number(first.heartbeat_seconds || 60),
              outside_tolerance_minutes: Number(first.outside_tolerance_minutes || 10),
            });
          }
        }
      } catch {
        // use default
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      void loadOffice();
    }
  }, [isAuthenticated]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);
    setErrorMsg(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : "";
      const res = await fetch("/api/admin/attendance/offices", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...office,
          shift_start: `${office.shift_start}:00`,
          shift_end: `${office.shift_end}:00`,
        }),
      });

      if (res.ok) {
        setSaveStatus("Office configuration and geofence settings updated successfully!");
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        const json = await res.json();
        setErrorMsg(json.message || "Failed to save settings.");
      }
    } catch {
      setErrorMsg("Network error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Office & Geofence Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure office location coordinates, geofence radius, shift schedules, and presence tracking rules.
        </p>
      </div>

      {saveStatus && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{saveStatus}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center">
          <RefreshCw className="w-8 h-8 text-[#0a4bb3] animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading office settings…</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Card 1: Office Location & Geofence */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#0a4bb3]/10 text-[#0a4bb3] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Geofence & Location</h2>
                <p className="text-xs text-slate-500">GPS boundary required for attendance check-ins</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Office / Branch Name
                </label>
                <input
                  type="text"
                  value={office.name}
                  onChange={(e) => setOffice({ ...office, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={office.lat}
                  onChange={(e) => setOffice({ ...office, lat: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={office.lng}
                  onChange={(e) => setOffice({ ...office, lng: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Geofence Radius (Meters)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="25"
                    value={office.radius_m}
                    onChange={(e) => setOffice({ ...office, radius_m: parseInt(e.target.value) || 150 })}
                    className="flex-1 accent-[#0a4bb3]"
                  />
                  <span className="text-sm font-bold text-[#0a4bb3] w-20 text-right">
                    {office.radius_m} m
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Employees must be within {office.radius_m} meters of the office coordinates to check in.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Shift Timings */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Shift Schedule & Grace Policy</h2>
                <p className="text-xs text-slate-500">Working hours and lateness calculation rules</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Shift Start Time
                </label>
                <input
                  type="time"
                  value={office.shift_start}
                  onChange={(e) => setOffice({ ...office, shift_start: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Shift End Time
                </label>
                <input
                  type="time"
                  value={office.shift_end}
                  onChange={(e) => setOffice({ ...office, shift_end: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={office.grace_minutes}
                  onChange={(e) => setOffice({ ...office, grace_minutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Employees arriving after {office.shift_start} + {office.grace_minutes} min are marked as <strong>Late</strong>.
            </p>
          </div>

          {/* Card 3: Presence & Heartbeat */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Presence & Heartbeat Intervals</h2>
                <p className="text-xs text-slate-500">Live premises monitoring and signal intervals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Heartbeat Signal Interval
                </label>
                <select
                  value={office.heartbeat_seconds}
                  onChange={(e) => setOffice({ ...office, heartbeat_seconds: parseInt(e.target.value) || 60 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
                >
                  <option value={30}>Every 30 seconds</option>
                  <option value={60}>Every 60 seconds (Standard)</option>
                  <option value={120}>Every 2 minutes</option>
                  <option value={300}>Every 5 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Left Premises Tolerance
                </label>
                <select
                  value={office.outside_tolerance_minutes}
                  onChange={(e) => setOffice({ ...office, outside_tolerance_minutes: parseInt(e.target.value) || 10 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes (Recommended)</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-[#0a4bb3] hover:bg-[#083d91] shadow-lg shadow-[#0a4bb3]/20 transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Saving Changes…" : "Save Office Settings"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
