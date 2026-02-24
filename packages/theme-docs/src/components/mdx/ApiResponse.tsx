import type { ReactNode } from "react";

interface ApiResponseProps {
  status: number;
  description?: string;
  children?: ReactNode;
}

const statusColors: Record<number, string> = {
  200: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  201: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  204: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  400: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  401: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  403: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  404: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  500: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export function ApiResponse({ status, description, children }: ApiResponseProps) {
  const statusColor = statusColors[status] || "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400";

  return (
    <div className="my-4 px-2">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 text-xs font-bold rounded ${statusColor}`}>{status}</span>
        {description && <span className="text-sm text-[var(--bd-text-secondary)]">{description}</span>}
      </div>
      <div className="border border-[var(--bd-border)] rounded-lg overflow-hidden px-2">{children}</div>
    </div>
  );
}
