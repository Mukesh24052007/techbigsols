"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  adminOfficeApi,
  type AdminOffice,
} from "@/lib/attendanceApi";
import {
  MapPin,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Crosshair,
  Building2,
  Users,
} from "lucide-react";

interface FormState {
  id?: number | string;
  name: string;
  lat: number | "";
  lng: number | "";
  radius_m: number;
  accuracy_max_m: number;
  shift_start: string;
  shift_end: string;
  grace_minutes: number;
  heartbeat_seconds: number;
  outside_tolerance_minutes: number;
}

const DEFAULT_FORM: FormState = {
  name: "",
  lat: 12.9715987,
  lng: 77.5945627,
  radius_m: 150,
  accuracy_max_m: 50,
  shift_start: "09:30",
  shift_end: "18:30",
  grace_minutes: 10,
  heartbeat_seconds: 60,
  outside_tolerance_minutes: 10,
};

export default function OfficeSettingsPage() {
  const { isAuthenticated } = useAdminAuth();
  const [offices, setOffices] = useState<AdminOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [locating, setLocating] = useState(false);
  const [currentLocationAccuracy, setCurrentLocationAccuracy] = useState<number | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM);

  const [savedLine, setSavedLine] = useState<{
    lat: number;
    lng: number;
    radius_m: number;
  } | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadOffices = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await adminOfficeApi.getOffices();
      const list = data?.offices || [];
      setOffices(list);

      // If no office is selected for editing, set form to first office or default
      if (list.length > 0 && !formData.id) {
        const first = list[0];
        setFormData({
          id: first.id,
          name: first.name,
          lat: Number(first.lat),
          lng: Number(first.lng),
          radius_m: Number(first.radius_m) || 150,
          accuracy_max_m: Number(first.accuracy_max_m) || 50,
          shift_start: (first.shift_start || "09:30").slice(0, 5),
          shift_end: (first.shift_end || "18:30").slice(0, 5),
          grace_minutes: Number(first.grace_minutes ?? 10),
          heartbeat_seconds: Number(first.heartbeat_seconds ?? 60),
          outside_tolerance_minutes: Number(first.outside_tolerance_minutes ?? 10),
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load offices.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [formData.id]);

  useEffect(() => {
    if (isAuthenticated) {
      void loadOffices();
    }
  }, [isAuthenticated, loadOffices]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setFormData((prev) => ({
          ...prev,
          lat: Number(latitude.toFixed(7)),
          lng: Number(longitude.toFixed(7)),
        }));
        setCurrentLocationAccuracy(Math.round(accuracy));
      },
      (err) => {
        setLocating(false);
        setErrorMsg(err.message || "Failed to retrieve current location.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );
  };

  const handleStartAdd = () => {
    setFormData({
      ...DEFAULT_FORM,
      name: "",
      lat: 12.9715987,
      lng: 77.5945627,
    });
    delete formData.id;
    setIsEditing(true);
    setSavedLine(null);
    setErrorMsg(null);
    setStatusMsg(null);
    setCurrentLocationAccuracy(null);
  };

  const handleStartEdit = (office: AdminOffice) => {
    setFormData({
      id: office.id,
      name: office.name,
      lat: Number(office.lat),
      lng: Number(office.lng),
      radius_m: Number(office.radius_m) || 150,
      accuracy_max_m: Number(office.accuracy_max_m) || 50,
      shift_start: (office.shift_start || "09:30").slice(0, 5),
      shift_end: (office.shift_end || "18:30").slice(0, 5),
      grace_minutes: Number(office.grace_minutes ?? 10),
      heartbeat_seconds: Number(office.heartbeat_seconds ?? 60),
      outside_tolerance_minutes: Number(office.outside_tolerance_minutes ?? 10),
    });
    setIsEditing(true);
    setSavedLine(null);
    setErrorMsg(null);
    setStatusMsg(null);
    setCurrentLocationAccuracy(null);
  };

  const handleDelete = async (office: AdminOffice) => {
    if (!confirm(`Are you sure you want to delete office "${office.name}"?`)) return;

    setDeletingId(office.id);
    setErrorMsg(null);
    setStatusMsg(null);

    try {
      const res = await adminOfficeApi.deleteOffice(office.id);
      setStatusMsg(res.message || "Office deleted successfully.");
      if (formData.id === office.id) {
        setIsEditing(false);
        setFormData(DEFAULT_FORM);
      }
      await loadOffices();
    } catch (err: unknown) {
      // Authoritative backend message on 409 or any error
      const msg = err instanceof Error ? err.message : "Failed to delete office.";
      setErrorMsg(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);

    const latNum = Number(formData.lat);
    const lngNum = Number(formData.lng);
    const radiusNum = Math.round(Number(formData.radius_m));
    const accNum = Math.round(Number(formData.accuracy_max_m));
    const graceNum = Math.round(Number(formData.grace_minutes));
    const hbNum = Math.round(Number(formData.heartbeat_seconds));
    const outTolNum = Math.round(Number(formData.outside_tolerance_minutes));

    // Client-side limits matching backend validation
    if (!formData.name.trim()) {
      setErrorMsg("Office name is required.");
      setSaving(false);
      return;
    }
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setErrorMsg("Latitude must be between -90 and 90.");
      setSaving(false);
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setErrorMsg("Longitude must be between -180 and 180.");
      setSaving(false);
      return;
    }
    if (latNum === 0 && lngNum === 0) {
      setErrorMsg("Latitude and longitude cannot both be 0.");
      setSaving(false);
      return;
    }
    if (radiusNum < 20 || radiusNum > 2000) {
      setErrorMsg("Radius must be between 20 and 2000 meters.");
      setSaving(false);
      return;
    }
    if (accNum < 10 || accNum > 200) {
      setErrorMsg("Maximum accuracy must be between 10 and 200 meters.");
      setSaving(false);
      return;
    }
    if (graceNum < 0 || graceNum > 60) {
      setErrorMsg("Grace minutes must be between 0 and 60.");
      setSaving(false);
      return;
    }
    if (hbNum < 10 || hbNum > 300) {
      setErrorMsg("Heartbeat interval must be between 10 and 300 seconds.");
      setSaving(false);
      return;
    }
    if (outTolNum < 1 || outTolNum > 120) {
      setErrorMsg("Outside tolerance must be between 1 and 120 minutes.");
      setSaving(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      lat: latNum,
      lng: lngNum,
      radius_m: radiusNum,
      accuracy_max_m: accNum,
      shift_start: formData.shift_start.length === 5 ? `${formData.shift_start}:00` : formData.shift_start,
      shift_end: formData.shift_end.length === 5 ? `${formData.shift_end}:00` : formData.shift_end,
      grace_minutes: graceNum,
      heartbeat_seconds: hbNum,
      outside_tolerance_minutes: outTolNum,
    };

    try {
      if (formData.id) {
        const res = await adminOfficeApi.updateOffice(formData.id, payload);
        setStatusMsg(res.message || "Office updated successfully.");
        if (res.office) {
          setSavedLine({
            lat: Number(res.office.lat),
            lng: Number(res.office.lng),
            radius_m: Number(res.office.radius_m),
          });
          setFormData((prev) => ({
            ...prev,
            lat: Number(res.office.lat),
            lng: Number(res.office.lng),
            radius_m: Number(res.office.radius_m),
          }));
        }
      } else {
        const res = await adminOfficeApi.createOffice(payload);
        setStatusMsg(res.message || "Office created successfully.");
        if (res.office) {
          setSavedLine({
            lat: Number(res.office.lat),
            lng: Number(res.office.lng),
            radius_m: Number(res.office.radius_m),
          });
          setFormData((prev) => ({
            ...prev,
            id: res.office.id,
            lat: Number(res.office.lat),
            lng: Number(res.office.lng),
            radius_m: Number(res.office.radius_m),
          }));
        }
      }
      await loadOffices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save office settings.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Office & Geofence Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure office locations, geofence radius, GPS accuracy limits, shift schedules, and presence tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void loadOffices()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleStartAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#0a4bb3] hover:bg-[#083d91] text-white shadow-md shadow-[#0a4bb3]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Office
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Read-only verification of what was saved */}
      {savedLine && (
        <div className="bg-blue-50 border border-blue-200 text-[#0a4bb3] rounded-2xl p-4 text-sm font-mono flex items-center justify-between">
          <span>
            Saved: {savedLine.lat}, {savedLine.lng}, radius {savedLine.radius_m} m
          </span>
          <span className="text-xs bg-white px-2 py-0.5 rounded border border-blue-200 font-sans">
            Verified from Server
          </span>
        </div>
      )}

      {/* Offices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#0a4bb3]" />
            <h2 className="text-base font-bold text-slate-800">Offices & Branches</h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {offices.length} {offices.length === 1 ? "Office" : "Offices"} Configured
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0a4bb3]" />
            <p className="text-xs">Loading office configurations…</p>
          </div>
        ) : offices.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-medium text-slate-600">No offices found.</p>
            <p className="text-xs text-slate-400 mt-1">Click &quot;Add Office&quot; to configure your primary branch.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Office Name</th>
                  <th className="px-5 py-3">Latitude</th>
                  <th className="px-5 py-3">Longitude</th>
                  <th className="px-5 py-3">Radius</th>
                  <th className="px-5 py-3">Accuracy Limit</th>
                  <th className="px-5 py-3">Employees</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offices.map((off) => (
                  <tr
                    key={off.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      formData.id === off.id && isEditing ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5 font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0a4bb3]" />
                      <span>{off.name}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{Number(off.lat).toFixed(7)}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{Number(off.lng).toFixed(7)}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">{off.radius_m} m</td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">{off.accuracy_max_m || 50} m</td>
                    <td className="px-5 py-3.5 text-slate-700">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        <Users className="w-3 h-3 text-slate-500" />
                        {off.employeeCount ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(off)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0a4bb3] hover:bg-blue-50 transition-colors"
                          title="Edit Office"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(off)}
                          disabled={deletingId === off.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Delete Office"
                        >
                          {deletingId === off.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Office Form (Add / Edit) */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0a4bb3]/10 text-[#0a4bb3] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {formData.id ? `Edit Office: ${formData.name || "Unnamed"}` : "Create New Office"}
                </h2>
                <p className="text-xs text-slate-500">Configure geofence coordinates and precision limits</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#0a4bb3] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-sm disabled:opacity-50"
            >
              {locating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
              <span>{locating ? "Acquiring GPS…" : "Use my current location"}</span>
            </button>
          </div>

          {currentLocationAccuracy !== null && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Current location coordinates applied. Reported GPS accuracy: ±{currentLocationAccuracy} m.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Office / Branch Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bangalore HQ"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Latitude (-90 to 90)
              </label>
              <input
                type="number"
                step="any"
                min="-90"
                max="90"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value === "" ? "" : parseFloat(e.target.value) })}
                placeholder="12.9715987"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Longitude (-180 to 180)
              </label>
              <input
                type="number"
                step="any"
                min="-180"
                max="180"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value === "" ? "" : parseFloat(e.target.value) })}
                placeholder="77.5945627"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Geofence Radius (20 to 2000 m)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="20"
                  max="2000"
                  value={formData.radius_m}
                  onChange={(e) => setFormData({ ...formData, radius_m: parseInt(e.target.value, 10) || 20 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
                  required
                />
                <span className="text-sm font-bold text-[#0a4bb3] w-16 text-right whitespace-nowrap">
                  {formData.radius_m} m
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Employees must be within {formData.radius_m} m to successfully check in.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Accuracy Limit (10 to 200 m)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={formData.accuracy_max_m}
                  onChange={(e) => setFormData({ ...formData, accuracy_max_m: parseInt(e.target.value, 10) || 10 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
                  required
                />
                <span className="text-sm font-bold text-[#0a4bb3] w-16 text-right whitespace-nowrap">
                  ±{formData.accuracy_max_m} m
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                GPS fixes with reported error worse than {formData.accuracy_max_m} m will be rejected.
              </p>
            </div>
          </div>
        </div>

        {/* Shift Timings & Grace Policies */}
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
                value={formData.shift_start}
                onChange={(e) => setFormData({ ...formData, shift_start: e.target.value })}
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
                value={formData.shift_end}
                onChange={(e) => setFormData({ ...formData, shift_end: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Grace Period (0 to 60 min)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={formData.grace_minutes}
                onChange={(e) => setFormData({ ...formData, grace_minutes: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
                required
              />
            </div>
          </div>
        </div>

        {/* Presence & Heartbeat Monitoring */}
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
                value={formData.heartbeat_seconds}
                onChange={(e) => setFormData({ ...formData, heartbeat_seconds: parseInt(e.target.value, 10) || 60 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
              >
                <option value={15}>Every 15 seconds</option>
                <option value={30}>Every 30 seconds</option>
                <option value={60}>Every 60 seconds (Standard)</option>
                <option value={120}>Every 2 minutes</option>
                <option value={300}>Every 5 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Left Premises Tolerance (1 to 120 min)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={formData.outside_tolerance_minutes}
                onChange={(e) => setFormData({ ...formData, outside_tolerance_minutes: parseInt(e.target.value, 10) || 10 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/20"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {formData.id && (
            <button
              type="button"
              onClick={handleStartAdd}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-[#0a4bb3] hover:bg-[#083d91] shadow-lg shadow-[#0a4bb3]/20 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving Changes…" : formData.id ? "Save Office Settings" : "Create Office"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
