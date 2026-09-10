// ---------------------------------------------------------------------------
// Data Dock — Query Service
//
// Connects the frontend SQL editor to the FastAPI backend.
// ---------------------------------------------------------------------------

import type { QueryResult } from "@/types/query";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Execute a SQL query and return the result.
 */
export async function executeQuery(query: string): Promise<QueryResult> {
  if (!query.trim()) {
    throw new Error("Query cannot be empty.");
  }

  const response = await fetch("http://127.0.0.1:8000/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sql: query,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    columns: data.columns ?? [],
    rows: data.rows ?? [],
    executionTime: 0,
  };
}

/**
 * Export a query result to a CSV string.
 * This is a pure frontend utility — no API call needed.
 */
export function resultToCsv(result: QueryResult): string {
  const escape = (v: string | number | boolean | null): string => {
    if (v === null) return "";

    const str = String(v);

    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }

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
export function downloadCsv(
  result: QueryResult,
  filename = "query_result"
): void {
  const csv = resultToCsv(result);

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `${filename}.csv`;

  link.click();

  URL.revokeObjectURL(url);
}