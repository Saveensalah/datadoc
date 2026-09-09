"use client";

import type { QueryResult } from "@/types/query";

interface ResultTableProps {
  result: QueryResult;
}

export default function ResultTable({ result }: ResultTableProps) {
  const { columns, rows } = result;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            {columns.map((col) => (
              <th
                key={col}
                scope="col"
                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 first:rounded-tl last:rounded-tr whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-4 py-2.5 text-gray-700 dark:text-gray-200 whitespace-nowrap"
                >
                  {cell === null ? (
                    <span className="italic text-gray-400 dark:text-gray-600">NULL</span>
                  ) : (
                    String(cell)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Row count */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {rows.length} row{rows.length !== 1 ? "s" : ""} returned
        </span>
      </div>
    </div>
  );
}
