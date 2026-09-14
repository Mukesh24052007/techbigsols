import React from "react";

export function PngFlagIcon({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 30"
      className={`${className} rounded-[3px] shadow-sm shrink-0 border border-white/20`}
      aria-hidden="true"
    >
      <rect width="40" height="30" fill="#0c0d0e" />
      <polygon points="0,0 40,0 0,30" fill="#ce1126" />
      {/* Southern cross stars */}
      <circle cx="28" cy="23" r="1.1" fill="#ffffff" />
      <circle cx="28" cy="17" r="1.1" fill="#ffffff" />
      <circle cx="24.5" cy="20.5" r="1.1" fill="#ffffff" />
      <circle cx="31.5" cy="19.5" r="1.1" fill="#ffffff" />
      <circle cx="29" cy="21" r="0.7" fill="#ffffff" />
      {/* Stylized Bird of paradise */}
      <path d="M 10 9 C 14 8 18 12 19 14 C 15 13 11 12 9 10 Z" fill="#fcd116" />
      <circle cx="10" cy="9" r="1.5" fill="#fcd116" />
    </svg>
  );
}
