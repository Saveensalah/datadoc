"use client";

interface StatusBadgeProps {
  /** "success" renders green dot, "error" renders red, "idle" renders grey */
  status: "success" | "error" | "idle";
  label: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const dotColor: Record<StatusBadgeProps["status"], string> = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    idle: "bg-gray-400",
  };

  const textColor: Record<StatusBadgeProps["status"], string> = {
    success: "text-emerald-600 dark:text-emerald-400",
    error: "text-red-600 dark:text-red-400",
    idle: "text-gray-500 dark:text-gray-400",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${textColor[status]}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotColor[status]}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
