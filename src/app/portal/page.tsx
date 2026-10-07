"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/context/UserAuthContext";

/**
 * /portal — redirect to the user's personal dashboard at /portal/[userId].
 * Keeps backwards compatibility with any existing bookmarks or links.
 */
export default function PortalRoot() {
  const { user, isLoading } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user?.userId) {
      router.replace(`/portal/${user.userId}`);
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin w-7 h-7 text-[#f39200]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  );
}
