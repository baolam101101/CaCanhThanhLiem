"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";

const STORAGE_KEY = "tl_sidebar_collapsed";

interface AdminShellProps {
  role: string;
  displayName: string;
  children: React.ReactNode;
}

export function AdminShell({ role, displayName, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "true") setCollapsed(true);
    } catch {}
  }, []);

  const handleToggle = (value: boolean) => {
    setCollapsed(value);
    try { localStorage.setItem(STORAGE_KEY, String(value)); } catch {}
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">
      <AdminSidebar
        role={role}
        displayName={displayName}
        collapsed={collapsed}
        onToggleCollapse={handleToggle}
      />
      <div
        className="flex-1 min-w-0 flex flex-col transition-all duration-300"
      >
        {/*
          Mobile header offset — root cause fix for content being hidden
          behind the fixed mobile top bar.

          AdminSidebar renders a `position: fixed` top bar (height 56px /
          h-14) ONLY on mobile (md:hidden), as a sibling of <main> inside
          this same flex column. A `position: fixed` element is removed
          from normal document flow entirely, so nothing pushes <main>
          down automatically — it starts at y=0 and the fixed bar
          visually overlaps its first ~56px.

          The correct fix is to reserve that exact space here, in the
          same flex column that contains <main>, using the same height
          value as the fixed bar (h-14 = 56px) and only on mobile
          (hidden on md+ where the sidebar is static/non-fixed and no
          offset is needed).
        */}
        <div className="md:hidden h-14 shrink-0" aria-hidden />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
