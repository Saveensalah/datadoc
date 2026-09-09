"use client";

import { useState } from "react";
import type { QueryExecution } from "@/types/query";
import ResultTabs, { type ResultTab } from "./ResultTabs";
import ResultTable from "./ResultTable";
import { downloadCsv } from "@/services/queryService";

// ── Icons ─────────────────────────────────────────────────────────────────

function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconAlertCircle() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────

interface QueryResultProps {
  execution: QueryExecution;
}

export default function QueryResult({ execution }: QueryResultProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>("table");
  const { status, result, error } = execution;

  // ── Idle state ──────────────────────────────────────────────────────────
  if (status === "idle") {
    return (
      <section
        aria-label="Query Result"
        className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
      >
        <ResultHeader execution={execution} onExport={() => {}} />
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-600">
          <IconGrid />
          <p className="mt-3 text-sm">Run a query to see results here.</p>
        </div>
      </section>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <section
        aria-label="Query Result"
        className="rounded-xl border border-red-100 dark:border-red-900/40 bg-white dark:bg-gray-900 shadow-sm"
      >
        <ResultHeader execution={execution} onExport={() => {}} />
        <div className="flex items-start gap-3 px-5 py-5">
          <span className="mt-0.5 text-red-500 shrink-0">
            <IconAlertCircle />
          </span>
          <pre className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap font-mono">
            {error ?? "An unknown error occurred."}
          </pre>
        </div>
      </section>
    );
  }

  // ── Success state ────────────────────────────────────────────────────────
  return (
    <section
      aria-label="Query Result"
      className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
    >
      <ResultHeader
        execution={execution}
        onExport={() => result && downloadCsv(result)}
      />

      {result && (
        <>
          <ResultTabs active={activeTab} onChange={setActiveTab} />

          <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
            {activeTab === "table" ? (
              <ResultTable result={result} />
            ) : (
              <RawOutput result={JSON.stringify(
                { columns: result.columns, rows: result.rows },
                null,
                2
              )} />
            )}
          </div>
        </>
      )}
    </section>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ResultHeader({
  execution,
  onExport,
}: {
  execution: QueryExecution;
  onExport: () => void;
}) {
  const { status, result } = execution;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
      {/* Left */}
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
        <span className="text-gray-400 dark:text-gray-500">
          <IconGrid />
        </span>
        <span className="text-sm font-semibold">Query Result</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {status === "success" && result && (
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500">
              <IconCheckCircle />
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Query executed successfully.
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-0.5">
              ({result.executionTime} ms)
            </span>
          </div>
        )}

        {status === "success" && result && (
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff174f]"
            aria-label="Export results as CSV"
          >
            <IconDownload />
            Export
            <IconChevronDown />
          </button>
        )}
      </div>
    </div>
  );
}

function RawOutput({ result }: { result: string }) {
  return (
    <div className="overflow-x-auto p-4">
      <pre className="font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre leading-6">
        {result}
      </pre>
      <div className="px-0 py-3 border-t border-gray-100 dark:border-gray-800 mt-3">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          JSON representation of query result
        </span>
      </div>
    </div>
  );
}
