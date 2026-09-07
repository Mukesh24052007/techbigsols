"use client";

import React from "react";
import type { ModuleKey } from "@/types";
import { MODULE_LABELS } from "@/types";

interface ModulePlaceholderProps {
  moduleKey: ModuleKey;
  description?: string;
  children?: React.ReactNode;
}

export function ModulePlaceholder({ moduleKey, description, children }: ModulePlaceholderProps) {
  const title = MODULE_LABELS[moduleKey];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        {description && <p className="text-slate-500 mt-1">{description}</p>}
      </div>

      {/* Content area */}
      {children ?? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
          <p className="text-slate-400 text-base font-medium">{title}</p>
          <p className="text-slate-300 text-sm mt-2">
            This module is under construction. Content will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
