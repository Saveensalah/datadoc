"use client";

import { useCallback, useEffect, useState } from "react";
import { getDatabaseTables } from "@/services/queryService";
import type { DatabaseTable } from "@/types/query";

export default function DatabaseExplorer({
  refreshKey,
  compact = false,
}: {
  refreshKey: number;
  compact?: boolean;
}) {
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    try {
      setTables(await getDatabaseTables());
      setState("ready");
      setError("");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Unable to load database.");
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    const interval = window.setInterval(() => void load(), 30000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [load, refreshKey]);

  return (
    <section className={`${compact ? "mx-0 mb-0" : "mx-6 mb-8 md:mx-8"} rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm`}>
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <div>
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Database</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PostgreSQL tables in this session</p>
        </div>
        <button onClick={() => void load()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Refresh</button>
      </div>
      <div className="p-5">
        {state === "loading" && <p className="text-sm text-gray-500">Loading tables...</p>}
        {state === "error" && <p className="text-sm text-red-500">{error}</p>}
        {state === "ready" && tables.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No user tables in this session yet.</p>}
        {state === "ready" && tables.length > 0 && (
          <div className="space-y-2">
            {tables.map((table) => {
              const isOpen = expanded.has(table.name);
              return (
                <div key={table.name} className="rounded-lg border border-gray-100 dark:border-gray-800">
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200"
                    onClick={() => setExpanded((current) => {
                      const next = new Set(current);
                      if (next.has(table.name)) next.delete(table.name); else next.add(table.name);
                      return next;
                    })}
                    aria-expanded={isOpen}
                  >
                    <span className="text-gray-400">{isOpen ? "▾" : "▸"}</span>
                    {table.name}
                  </button>
                  {isOpen && (
                    <div className="border-t border-gray-100 px-8 py-2 dark:border-gray-800">
                      {table.columns.map((column) => (
                        <div key={column.name} className="flex justify-between py-1 font-mono text-xs">
                          <span className="text-gray-700 dark:text-gray-300">{column.name}</span>
                          <span className="text-gray-400">{column.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
