"use client";

import { useState, useEffect } from "react";
import type { NavPage } from "@/types/query";

// ---------------------------------------------------------------------------
// Icons — inline SVGs, zero extra deps
// ---------------------------------------------------------------------------

function IconDatabase() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v4c0 1.657 4.03 3 9 3s9-1.343 9-3V5" />
      <path d="M3 9v4c0 1.657 4.03 3 9 3s9-1.343 9-3V9" />
      <path d="M3 13v4c0 1.657 4.03 3 9 3s9-1.343 9-3v-4" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconTableDb() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 9v12" />
    </svg>
  );
}

function IconHistory() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function IconBookOpen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Nav item definition
// ---------------------------------------------------------------------------

interface NavItem {
  id: NavPage;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: "editor",   label: "Editor",         icon: <IconCode /> },
  { id: "database", label: "Database",        icon: <IconTableDb /> },
  { id: "history",  label: "Query History",   icon: <IconHistory /> },
  { id: "examples", label: "Example Queries", icon: <IconBookOpen /> },
];

// ---------------------------------------------------------------------------
// Session countdown — starts at 29:48 and counts down
// ---------------------------------------------------------------------------

const INITIAL_SECONDS = 29 * 60 + 48;

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ---------------------------------------------------------------------------
// Sidebar props
// ---------------------------------------------------------------------------

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}

// ---------------------------------------------------------------------------
// Sidebar content — shared by desktop and mobile drawer
// ---------------------------------------------------------------------------

function SidebarContent({
  activePage,
  onNavigate,
  onClose,
}: SidebarProps & { onClose?: () => void }) {
  const timer = useCountdown(INITIAL_SECONDS);

  return (
    <div className="flex h-full flex-col">
      {/* ── Brand ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff174f]/10 text-[#ff174f]">
            <IconDatabase />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">A SQL Playground</p>
            <p className="text-[11px] text-gray-400 leading-tight">Write. Run. Learn.</p>
          </div>
        </div>
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff174f] rounded"
            aria-label="Close menu"
          >
            <IconX />
          </button>
        )}
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 space-y-0.5" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activePage;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose?.();
              }}
              aria-current={isActive ? "page" : undefined}
              className={`
                group relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff174f]
                ${
                  isActive
                    ? "bg-[#3a0a18] text-[#ff174f]"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
                }
              `}
            >
              {/* Left accent bar for active item */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#ff174f]"
                  aria-hidden="true"
                />
              )}
              <span className={isActive ? "text-[#ff174f]" : "text-gray-500 group-hover:text-gray-300"}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ── Session ───────────────────────────────────────────────────── */}
      <div className="mx-3 mb-4 mt-2">
        <div className="border-t border-white/10 mb-4" />
        <button className="w-full flex items-center gap-3 rounded-xl p-3 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff174f] group">
          {/* Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff174f] to-[#a30031] text-sm font-bold text-white">
            S
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-gray-200 truncate">Guest Session</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {/* Green status dot */}
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
              <span className="text-[11px] text-emerald-400 font-medium">Active</span>
              <span className="text-[11px] text-gray-500">·</span>
              <span className="text-[11px] text-gray-400">
                Expires in{" "}
                <span className="font-mono text-gray-300">{timer}</span>
              </span>
            </div>
          </div>

          {/* Chevron */}
          <span className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0">
            <IconChevronRight />
          </span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Sidebar export — handles desktop + mobile drawer
// ---------------------------------------------------------------------------

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Mobile hamburger ──────────────────────────────────────────── */}
      <button
        className="fixed top-4 left-4 z-50 flex lg:hidden items-center justify-center h-9 w-9 rounded-lg bg-[#0f1117] border border-white/10 text-gray-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff174f]"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
      >
        <IconMenu />
      </button>

      {/* ── Mobile overlay ────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-[#0f1117] border-r border-white/10
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Navigation drawer"
      >
        <SidebarContent
          activePage={activePage}
          onNavigate={onNavigate}
          onClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-[280px] shrink-0 h-screen sticky top-0 bg-[#0f1117] border-r border-white/10"
        aria-label="Main navigation"
      >
        <SidebarContent activePage={activePage} onNavigate={onNavigate} />
      </aside>
    </>
  );
}
