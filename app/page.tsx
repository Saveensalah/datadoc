"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import EditorToolbar from "@/components/sql/EditorToolbar";
import SqlEditor from "@/components/sql/SqlEditor";
import QueryResult from "@/components/sql/QueryResult";
import type { NavPage } from "@/types/query";
import type { QueryExecution } from "@/types/query";
import { createNewSession, executeQuery, getCurrentSession } from "@/services/queryService";

// ── Placeholder pages ──────────────────────────────────────────────────────

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24 text-center px-6">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M3 9h18M9 3v18" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
      <p className="mt-1.5 max-w-xs text-sm text-gray-500 dark:text-gray-400">{description}</p>
      <span className="mt-4 inline-flex items-center rounded-full border border-dashed border-gray-200 dark:border-gray-700 px-3 py-1 text-xs text-gray-400 dark:text-gray-500">
        Coming soon
      </span>
    </div>
  );
}

// ── Initial SQL query ──────────────────────────────────────────────────────

const INITIAL_QUERY = "";

// ── Dark-mode hook ─────────────────────────────────────────────────────────

function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState(false);

  // Read persisted preference on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("qn-dark-mode");
      if (stored !== null) {
        setDark(stored === "true");
      } else {
        // Fall back to system preference
        setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    } catch {
      // localStorage unavailable (SSR guard)
    }
  }, []);

  // Apply/remove the "dark" class on <html> whenever state changes
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("qn-dark-mode", String(dark));
    } catch {
      // ignore
    }
  }, [dark]);

  const toggle = useCallback(() => setDark((d) => !d), []);
  return [dark, toggle];
}

// ── Editor page ────────────────────────────────────────────────────────────

function EditorPage() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [execution, setExecution] = useState<QueryExecution>({
    status: "idle",
    result: null,
    error: null,
  });

  const handleRun = useCallback(async () => {
    if (execution.status === "running") return;

    setExecution({ status: "running", result: null, error: null });
    try {
      const result = await executeQuery(query);
      setExecution({ status: "success", result, error: null });
    } catch (err) {
      setExecution({
        status: "error",
        result: null,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [query, execution.status]);

  const handleClear = useCallback(() => {
    setQuery("");
  }, []);

  return (
    <div className="flex flex-col gap-5 px-6 pb-8 md:px-8">
      {/* SQL Editor card */}
      <section aria-label="SQL Editor" className="rounded-xl shadow-sm overflow-hidden">
        <EditorToolbar
          isRunning={execution.status === "running"}
          onRun={handleRun}
          onClear={handleClear}
        />
        <SqlEditor value={query} onChange={setQuery} onRun={handleRun} />
      </section>

      {/* Query Result card */}
      <QueryResult execution={execution} />
    </div>
  );
}

// ── Root page ──────────────────────────────────────────────────────────────

export default function Home() {
  const [activePage, setActivePage] = useState<NavPage>("editor");
  const [darkMode, toggleDark] = useDarkMode();
  const [sessionKey, setSessionKey] = useState(0);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    getCurrentSession().then(({ expiresAt: sessionExpiresAt }) => {
      setExpiresAt(sessionExpiresAt);
    });
  }, []);

  const handleNewSession = useCallback(async () => {
    const session = await createNewSession();
    setActivePage("editor");
    setSessionKey((key) => key + 1);
    setExpiresAt(session.expiresAt);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#13151f]">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onNewSession={handleNewSession}
        expiresAt={expiresAt}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-y-auto min-w-0">
        {/* Spacer on mobile so hamburger button doesn't overlap header text */}
        <div className="h-14 lg:hidden" aria-hidden="true" />

        <Header darkMode={darkMode} onToggleDark={toggleDark} />

        <main id="main-content" tabIndex={-1}>
          {activePage === "editor" && <EditorPage key={sessionKey} />}
          {activePage === "database" && (
            <PlaceholderPage
              title="Database Explorer"
              description="Browse your PostgreSQL schema, tables, and columns here."
            />
          )}
          {activePage === "history" && (
            <PlaceholderPage
              title="Query History"
              description="Your previously executed queries will appear here."
            />
          )}
          {activePage === "examples" && (
            <PlaceholderPage
              title="Example Queries"
              description="Pre-built SQL examples to help you get started."
            />
          )}
        </main>
      </div>
    </div>
  );
}
