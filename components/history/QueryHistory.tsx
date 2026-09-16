"use client";

import { useCallback, useEffect, useState } from "react";
import { getQueryHistory } from "@/services/queryService";
import type { QueryHistoryItem } from "@/types/query";

export default function QueryHistory({ onSelect }: { onSelect: (sql: string) => void }) {
  const [items, setItems] = useState<QueryHistoryItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setState("loading");
    try { setItems(await getQueryHistory()); setState("ready"); }
    catch (err) { setState("error"); setError(err instanceof Error ? err.message : "Unable to load history."); }
  }, []);
  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [load]);

  return (
    <section className="mx-6 mb-8 rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 md:mx-8">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <div><h2 className="font-semibold text-gray-800 dark:text-gray-100">Query History</h2><p className="mt-1 text-xs text-gray-500">Queries from this session</p></div>
        <button onClick={() => void load()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Refresh</button>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {state === "loading" && <p className="p-5 text-sm text-gray-500">Loading history...</p>}
        {state === "error" && <p className="p-5 text-sm text-red-500">{error}</p>}
        {state === "ready" && items.length === 0 && <p className="p-5 text-sm text-gray-500">No queries executed in this session.</p>}
        {items.map((item) => (
          <button key={item.id} onClick={() => onSelect(item.sql)} className="block w-full px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <div className="flex items-start gap-2"><span className={item.status === "success" ? "text-emerald-500" : "text-red-500"}>{item.status === "success" ? "✓" : "✕"}</span><pre className="min-w-0 flex-1 whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-gray-200">{item.sql}</pre></div>
            <div className="mt-2 pl-5 text-xs text-gray-400">{item.status === "error" ? item.error : `${item.executionTime} ms`} · {new Date(item.timestamp).toLocaleString()}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
