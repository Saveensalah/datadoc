"use client";

import { SQL_EXAMPLES } from "@/data/examples";

const categories = ["Basic SQL", "Intermediate SQL", "Joins", "Advanced SQL"] as const;

export default function ExampleQueries({ onUse }: { onUse: (sql: string) => void }) {
  return (
    <div className="mx-6 mb-8 space-y-7 md:mx-8">
      <div><h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Example Queries</h2><p className="mt-1 text-sm text-gray-500">Choose an example to load it into the editor. Nothing runs automatically.</p></div>
      {categories.map((category) => (
        <section key={category}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">{category}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {SQL_EXAMPLES.filter((example) => example.category === category).map((example) => (
              <article key={example.title} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between gap-3"><h4 className="font-semibold text-gray-800 dark:text-gray-100">{example.title}</h4>{example.setup && <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Setup</span>}</div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{example.description}</p>
                <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-gray-50 p-3 font-mono text-xs leading-5 text-gray-700 dark:bg-gray-800 dark:text-gray-200">{example.sql}</pre>
                <button onClick={() => onUse(example.sql)} className="mt-3 rounded-lg bg-[#ff174f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#e01446]">Use Example</button>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
