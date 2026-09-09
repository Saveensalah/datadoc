"use client";

import Button from "@/components/ui/Button";
import DatabaseSelector from "@/components/ui/DatabaseSelector";

// ── Icons ─────────────────────────────────────────────────────────────────

function IconCode() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────

interface EditorToolbarProps {
  isRunning: boolean;
  onRun: () => void;
  onClear: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function EditorToolbar({ isRunning, onRun, onClear }: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-t-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
      {/* Left: title */}
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
        <span className="text-gray-400 dark:text-gray-500">
          <IconCode />
        </span>
        <span className="text-sm font-semibold">SQL Editor</span>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        <DatabaseSelector />

        {/* Run */}
        <Button
          variant="primary"
          size="sm"
          loading={isRunning}
          onClick={onRun}
          leftIcon={<IconPlay />}
          title="Run query (Ctrl + Enter)"
          aria-label="Run SQL query"
        >
          Run
          {!isRunning && (
            <kbd className="ml-1 hidden sm:inline-flex items-center rounded border border-white/20 bg-white/10 px-1 py-px font-mono text-[10px] text-white/70">
              Ctrl+↵
            </kbd>
          )}
        </Button>

        {/* Clear */}
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          leftIcon={<IconTrash />}
          aria-label="Clear SQL editor"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
