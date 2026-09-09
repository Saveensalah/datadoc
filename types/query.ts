// ---------------------------------------------------------------------------
// QueryNest — shared TypeScript types
// These interfaces define the contract between the UI and the backend.
// When the real FastAPI endpoint is wired up, only queryService.ts needs
// to change — everything else consumes these types unchanged.
// ---------------------------------------------------------------------------

/** A single row is an array of primitive SQL values. */
export type QueryRow = (string | number | boolean | null)[];

/** The shape returned by POST /api/query */
export interface QueryResult {
  columns: string[];
  rows: QueryRow[];
  /** Execution time in milliseconds */
  executionTime: number;
}

/** UI execution state — drives loading / success / error rendering */
export type QueryStatus = "idle" | "running" | "success" | "error";

/** Full execution response including status metadata */
export interface QueryExecution {
  status: QueryStatus;
  result: QueryResult | null;
  error: string | null;
}

/** Navigation items shown in the sidebar */
export type NavPage = "editor" | "database" | "history" | "examples";
