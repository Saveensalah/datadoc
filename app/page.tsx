"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  }, [query, execution.status, onQueryExecuted]);

  const handleClear = useCallback(() => {
    setQuery("");
  }, [setQuery]);

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

function ResizableWorkspace({
  children,
}: {
  children: [React.ReactNode, React.ReactNode];
}) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [editorWidth, setEditorWidth] = useState(58);
  const draggingRef = useRef(false);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const workspace = workspaceRef.current;
      if (!draggingRef.current || !workspace || workspace.clientWidth < 900) return;
      const bounds = workspace.getBoundingClientRect();
      const nextWidth = ((event.clientX - bounds.left) / bounds.width) * 100;
      setEditorWidth(Math.min(70, Math.max(30, nextWidth)));
    };
    const stopDragging = () => {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
    };
  }, []);

  return (
    <div
      ref={workspaceRef}
      className="relative grid grid-cols-1 gap-5 px-6 pb-8 lg:grid-cols-[minmax(0,var(--editor-width))_minmax(280px,1fr)] lg:gap-0"
      style={{ "--editor-width": `${editorWidth}%` } as React.CSSProperties}
    >
      <div className="min-w-0">
        {children[0]}
      </div>
      <div
        role="separator"
        aria-label="Resize editor and database panels"
        aria-orientation="vertical"
        onPointerDown={(event) => {
          if (workspaceRef.current && workspaceRef.current.clientWidth >= 900) {
            event.preventDefault();
            draggingRef.current = true;
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }
        }}
        className="absolute inset-y-0 left-[var(--editor-width)] hidden w-2 -translate-x-1/2 cursor-col-resize items-stretch justify-center lg:flex"
      >
        <span className="w-px bg-gray-300 dark:bg-gray-700" />
      </div>
      <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:pl-4">
        {children[1]}
      </div>
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
  const [splitView, setSplitView] = useState(true);

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
        splitView={splitView}
        onToggleSplitView={() => {
          setSplitView((enabled) => !enabled);
          setActivePage("editor");
        }}
        onNewSession={handleNewSession}
        expiresAt={expiresAt}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-y-auto min-w-0">
        {/* Spacer on mobile so hamburger button doesn't overlap header text */}
        <div className="h-14 lg:hidden" aria-hidden="true" />

        <Header darkMode={darkMode} onToggleDark={toggleDark} />

        <main id="main-content" tabIndex={-1}>
          {splitView ? (
            <ResizableWorkspace>
              <EditorPage
                key={sessionKey}
                query={query}
                setQuery={setQuery}
                onQueryExecuted={() => setDatabaseRefreshKey((key) => key + 1)}
              />
              <div>
                <DatabaseExplorer refreshKey={databaseRefreshKey} compact />
              </div>
            </ResizableWorkspace>
          ) : (
            <>
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
            </>
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
