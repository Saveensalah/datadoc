// ---------------------------------------------------------------------------
// QueryNest — Query Service
//
// This is the ONLY file that needs to change when the real FastAPI backend
// is available. Replace the `mockExecuteQuery` implementation with a real
// fetch call to POST /api/query and the rest of the UI stays untouched.
// ---------------------------------------------------------------------------

import type { QueryResult } from "@/types/query";

// ---------------------------------------------------------------------------
// Mock data — remove when connecting to the real API
// ---------------------------------------------------------------------------

const MOCK_RESULT: QueryResult = {
  columns: ["id", "name", "age", "course"],
  rows: [
    [1, "Rahul", 22, "Python"],
    [2, "Aisha", 24, "AI"],
    [3, "Karan", 21, "Web Development"],
  ],
  executionTime: 12,
};

/** Simulates network latency so the loading state is visible in the UI. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Execute a SQL query string and return a QueryResult.
 *
 * MOCK IMPLEMENTATION — always returns the same static dataset after a short
 * artificial delay.  To connect the real backend, replace this function body
 * with:
 *
 *   const res = await fetch("/api/query", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ query }),
 *   });
 *   if (!res.ok) throw new Error(await res.text());
 *   return res.json() as Promise<QueryResult>;
 */
export async function executeQuery(query: string): Promise<QueryResult> {
  // Validate that the query is not empty (works for both mock and real)
  if (!query.trim()) {
    throw new Error("Query cannot be empty.");
  }

  // --- MOCK: remove the two lines below when using the real API ---
  await delay(600); // simulate ~600ms round-trip
  return { ...MOCK_RESULT };
  // ----------------------------------------------------------------
}

/**
 * Export a query result to a CSV string.
 * This is a pure frontend utility — no API call needed.
 */
export function resultToCsv(result: QueryResult): string {
  const escape = (v: string | number | boolean | null): string => {
    if (v === null) return "";
    const str = String(v);
    // Wrap in quotes if the value contains a comma, quote, or newline
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const header = result.columns.map(escape).join(",");
  const body = result.rows
    .map((row) => row.map(escape).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCsv(result: QueryResult, filename = "query_result"): void {
  const csv = resultToCsv(result);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
