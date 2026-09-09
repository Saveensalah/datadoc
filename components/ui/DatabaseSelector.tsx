"use client";

import { useState, useRef, useEffect } from "react";

interface Database {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface DatabaseSelectorProps {
  selected?: string;
  onChange?: (id: string) => void;
}

// PostgreSQL elephant icon — inline SVG, no extra deps
function PgIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="12" cy="5" rx="7" ry="3" stroke="#336791" strokeWidth="1.5" />
      <path
        d="M5 5v9c0 1.657 3.134 3 7 3s7-1.343 7-3V5"
        stroke="#336791"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M5 9.5c0 1.657 3.134 3 7 3s7-1.343 7-3"
        stroke="#336791"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}

const DATABASES: Database[] = [
  { id: "postgresql", label: "PostgreSQL", icon: <PgIcon /> },
];

export default function DatabaseSelector({
  selected = "postgresql",
  onChange,
}: DatabaseSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = DATABASES.find((d) => d.id === selected) ?? DATABASES[0];

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff174f]"
      >
        {current.icon}
        <span>{current.label}</span>
        {/* Chevron */}
        <svg
          className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select database"
          className="absolute left-0 top-full z-50 mt-1 min-w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1"
        >
          {DATABASES.map((db) => (
            <li
              key={db.id}
              role="option"
              aria-selected={db.id === selected}
              onClick={() => {
                onChange?.(db.id);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {db.icon}
              {db.label}
              {db.id === selected && (
                <svg
                  className="ml-auto h-3.5 w-3.5 text-[#ff174f]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
