"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// ---------------------------------------------------------------------------
// SQL syntax highlighting
// Renders the SQL text with colour-coded tokens. We overlay a transparent
// textarea on top of the highlighted pre so the user can still type normally.
// ---------------------------------------------------------------------------

const SQL_KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET",
  "DELETE", "CREATE", "TABLE", "DROP", "ALTER", "ADD", "COLUMN", "INDEX",
  "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "UNIQUE", "NOT", "NULL",
  "DEFAULT", "AUTO_INCREMENT", "SERIAL", "CONSTRAINT", "CASCADE", "ON",
  "AND", "OR", "IN", "IS", "LIKE", "BETWEEN", "JOIN", "INNER", "OUTER",
  "LEFT", "RIGHT", "FULL", "CROSS", "NATURAL", "HAVING", "GROUP", "BY",
  "ORDER", "ASC", "DESC", "LIMIT", "OFFSET", "UNION", "ALL", "DISTINCT",
  "CASE", "WHEN", "THEN", "ELSE", "END", "AS", "WITH", "RECURSIVE",
  "EXISTS", "ANY", "SOME", "BEGIN", "COMMIT", "ROLLBACK", "TRANSACTION",
  "TRUNCATE", "VIEW", "TRIGGER", "PROCEDURE", "FUNCTION", "RETURNS",
  "RETURN", "DECLARE", "IF", "WHILE", "FOR", "DO", "CALL",
]);

const SQL_TYPES = new Set([
  "INT", "INTEGER", "BIGINT", "SMALLINT", "TINYINT", "FLOAT", "DOUBLE",
  "DECIMAL", "NUMERIC", "REAL", "CHAR", "VARCHAR", "TEXT", "NCHAR",
  "NVARCHAR", "BLOB", "CLOB", "DATE", "TIME", "DATETIME", "TIMESTAMP",
  "BOOLEAN", "BOOL", "JSON", "JSONB", "UUID", "SERIAL", "BIGSERIAL",
  "SMALLSERIAL",
]);

interface Token {
  type: "keyword" | "type" | "string" | "number" | "comment" | "punctuation" | "plain";
  value: string;
}

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < sql.length) {
    // Single-line comment
    if (sql[i] === "-" && sql[i + 1] === "-") {
      const end = sql.indexOf("\n", i);
      const val = end === -1 ? sql.slice(i) : sql.slice(i, end);
      tokens.push({ type: "comment", value: val });
      i += val.length;
      continue;
    }

    // Block comment
    if (sql[i] === "/" && sql[i + 1] === "*") {
      const end = sql.indexOf("*/", i + 2);
      const val = end === -1 ? sql.slice(i) : sql.slice(i, end + 2);
      tokens.push({ type: "comment", value: val });
      i += val.length;
      continue;
    }

    // String literal (single or double quote)
    if (sql[i] === "'" || sql[i] === '"') {
      const quote = sql[i];
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "\\" && j + 1 < sql.length) { j += 2; continue; }
        if (sql[j] === quote) { j++; break; }
        j++;
      }
      tokens.push({ type: "string", value: sql.slice(i, j) });
      i = j;
      continue;
    }

    // Number
    if (/[0-9]/.test(sql[i]) || (sql[i] === "." && /[0-9]/.test(sql[i + 1] ?? ""))) {
      let j = i;
      while (j < sql.length && /[0-9.]/.test(sql[j])) j++;
      tokens.push({ type: "number", value: sql.slice(i, j) });
      i = j;
      continue;
    }

    // Identifier or keyword
    if (/[a-zA-Z_]/.test(sql[i])) {
      let j = i;
      while (j < sql.length && /[a-zA-Z0-9_]/.test(sql[j])) j++;
      const word = sql.slice(i, j);
      const upper = word.toUpperCase();
      const type = SQL_KEYWORDS.has(upper)
        ? "keyword"
        : SQL_TYPES.has(upper)
        ? "type"
        : "plain";
      tokens.push({ type, value: word });
      i = j;
      continue;
    }

    // Punctuation / operators
    if (/[(),;.=<>!+\-*/]/.test(sql[i])) {
      tokens.push({ type: "punctuation", value: sql[i] });
      i++;
      continue;
    }

    // Whitespace and anything else — emit as plain
    tokens.push({ type: "plain", value: sql[i] });
    i++;
  }

  return tokens;
}

const TOKEN_COLORS: Record<Token["type"], string> = {
  keyword:     "text-[#c678dd] dark:text-[#c678dd] font-semibold",
  type:        "text-[#e5c07b] dark:text-[#e5c07b]",
  string:      "text-[#98c379] dark:text-[#98c379]",
  number:      "text-[#d19a66] dark:text-[#d19a66]",
  comment:     "text-[#7f848e] dark:text-[#7f848e] italic",
  punctuation: "text-[#abb2bf] dark:text-[#abb2bf]",
  plain:       "text-gray-800 dark:text-[#abb2bf]",
};

function HighlightedSql({ code }: { code: string }) {
  const tokens = tokenize(code);
  return (
    <>
      {tokens.map((tok, i) => (
        <span key={i} className={TOKEN_COLORS[tok.type]}>
          {tok.value}
        </span>
      ))}
      {/* Extra space so caret is visible on the last line */}
      {" "}
    </>
  );
}

// ---------------------------------------------------------------------------
// SqlEditor component
// ---------------------------------------------------------------------------

interface SqlEditorProps {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
}

export default function SqlEditor({ value, onChange, onRun }: SqlEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const [lineCount, setLineCount] = useState(1);

  // Keep line count in sync
  useEffect(() => {
    setLineCount(value.split("\n").length);
  }, [value]);

  // Sync scroll between textarea and highlight layer
  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl + Enter → run
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onRun();
        return;
      }

      // Tab → insert 4 spaces
      if (e.key === "Tab") {
        e.preventDefault();
        const el = e.currentTarget;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const next = value.substring(0, start) + "    " + value.substring(end);
        onChange(next);
        // Restore cursor
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + 4;
        });
      }
    },
    [value, onChange, onRun]
  );

  return (
    <div className="relative flex overflow-hidden rounded-b-xl bg-gray-50 dark:bg-[#1a1d27] border-t border-gray-100 dark:border-gray-800">
      {/* ── Line numbers ───────────────────────────────────────────── */}
      <div
        className="select-none py-4 pl-4 pr-3 text-right font-mono text-xs leading-6 text-gray-300 dark:text-gray-600 border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1d27] min-w-[3rem]"
        aria-hidden="true"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1}>{i + 1}</div>
        ))}
      </div>

      {/* ── Editor area ────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden">
        {/* Highlight layer (non-interactive, underneath the textarea) */}
        <pre
          ref={highlightRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-auto p-4 font-mono text-sm leading-6 whitespace-pre"
        >
          <HighlightedSql code={value} />
        </pre>

        {/* Actual editable textarea — transparent text so highlight shows through */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          rows={Math.max(lineCount, 10)}
          aria-label="SQL editor"
          className="relative w-full resize-none bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-gray-800 dark:caret-gray-100 outline-none overflow-auto"
          style={{ minHeight: "260px" }}
        />
      </div>
    </div>
  );
}
