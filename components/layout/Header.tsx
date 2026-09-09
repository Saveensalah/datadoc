"use client";

interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export default function Header({ darkMode, onToggleDark }: HeaderProps) {
  return (
    <header className="flex items-start justify-between px-6 pt-7 pb-5 md:px-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
          DATA DOCK
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          A simple sandbox to practice SQL with PostgreSQL.
        </p>
      </div>

      <button
        onClick={onToggleDark}
        className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff174f]"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={darkMode ? "Light mode" : "Dark mode"}
      >
        {darkMode ? <IconSun /> : <IconMoon />}
      </button>
    </header>
  );
}
