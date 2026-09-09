"use client";

export type ResultTab = "table" | "raw";

interface ResultTabsProps {
  active: ResultTab;
  onChange: (tab: ResultTab) => void;
}

const TABS: { id: ResultTab; label: string }[] = [
  { id: "table", label: "Table" },
  { id: "raw",   label: "Raw Output" },
];

export default function ResultTabs({ active, onChange }: ResultTabsProps) {
  return (
    <div
      className="flex gap-1 border-b border-gray-100 dark:border-gray-800 px-4"
      role="tablist"
      aria-label="Result view"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`
              relative pb-2.5 pt-1 px-2 text-sm font-medium transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff174f] rounded-t
              ${
                isActive
                  ? "text-[#ff174f]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }
            `}
          >
            {tab.label}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#ff174f]"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
