"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import EditorToolbar from "@/components/sql/EditorToolbar";
import SqlEditor from "@/components/sql/SqlEditor";
import QueryResult from "@/components/sql/QueryResult";
import DatabaseExplorer from "@/components/database/DatabaseExplorer";
import QueryHistory from "@/components/history/QueryHistory";
import ExampleQueries from "@/components/examples/ExampleQueries";
import type { NavPage } from "@/types/query";
import type { QueryExecution } from "@/types/query";
import { createNewSession, executeQuery, getCurrentSession } from "@/services/queryService";

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

function EditorPage({
  query,
  setQuery,
  onQueryExecuted,
}: {
  query: string;
  setQuery: (query: string) => void;
  onQueryExecuted: () => void;
}) {
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
      onQueryExecuted();
    } catch (err) {
      setExecution({
        status: "error",
        result: null,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [query, execution.status, onQueryExecuted, setQuery]);

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
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [databaseRefreshKey, setDatabaseRefreshKey] = useState(0);

  useEffect(() => {
    getCurrentSession().then(({ expiresAt: sessionExpiresAt }) => {
      setExpiresAt(sessionExpiresAt);
    });
  }, []);

  const handleNewSession = useCallback(async () => {
    const session = await createNewSession();
    setActivePage("editor");
    setQuery("");
    setSessionKey((key) => key + 1);
    setExpiresAt(session.expiresAt);
    setDatabaseRefreshKey((key) => key + 1);
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
          {activePage === "editor" && (
            <EditorPage
              key={sessionKey}
              query={query}
              setQuery={setQuery}
              onQueryExecuted={() => setDatabaseRefreshKey((key) => key + 1)}
            />
          )}
          {activePage === "database" && (
            <DatabaseExplorer refreshKey={databaseRefreshKey} />
          )}
          {activePage === "history" && (
            <QueryHistory
              onSelect={(sql) => {
                setQuery(sql);
                setActivePage("editor");
              }}
            />
          )}
          {activePage === "examples" && (
            <ExampleQueries
              onUse={(sql) => {
                setQuery(sql);
                setActivePage("editor");
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
