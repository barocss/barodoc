import type { ReactNode } from "react";

type CalloutType = "info" | "warning" | "tip" | "danger" | "note";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children?: ReactNode;
}

const styles: Record<CalloutType, { container: string; iconBg: string; icon: string; title: string }> = {
  info: {
    container: "bg-blue-50/70 dark:bg-blue-500/10 border-l-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-500/20",
    icon: "text-blue-600 dark:text-blue-400",
    title: "text-blue-900 dark:text-blue-200",
  },
  note: {
    container: "bg-gray-50/70 dark:bg-gray-500/10 border-l-gray-400",
    iconBg: "bg-gray-100 dark:bg-gray-500/20",
    icon: "text-gray-600 dark:text-gray-400",
    title: "text-gray-900 dark:text-gray-200",
  },
  warning: {
    container: "bg-orange-50/70 dark:bg-orange-500/10 border-l-orange-500",
    iconBg: "bg-orange-100 dark:bg-orange-500/20",
    icon: "text-orange-600 dark:text-orange-400",
    title: "text-orange-900 dark:text-orange-200",
  },
  tip: {
    container: "bg-green-50/70 dark:bg-green-500/10 border-l-green-500",
    iconBg: "bg-green-100 dark:bg-green-500/20",
    icon: "text-green-600 dark:text-green-400",
    title: "text-green-900 dark:text-green-200",
  },
  danger: {
    container: "bg-red-50/70 dark:bg-red-500/10 border-l-red-500",
    iconBg: "bg-red-100 dark:bg-red-500/20",
    icon: "text-red-600 dark:text-red-400",
    title: "text-red-900 dark:text-red-200",
  },
};

const icons: Record<CalloutType, ReactNode> = {
  info: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  note: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  tip: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  danger: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const defaultTitles: Record<CalloutType, string> = {
  info: "Info",
  note: "Note",
  warning: "Warning",
  tip: "Tip",
  danger: "Danger",
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const style = styles[type];
  const icon = icons[type];
  const displayTitle = title || defaultTitles[type];

  return (
    <div className={`not-prose my-5 rounded-lg border-l-4 overflow-hidden ${style.container}`}>
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-md ${style.iconBg}`}>
            <div className={style.icon}>{icon}</div>
          </div>
          <div className="flex-1 min-w-0">
            {displayTitle && (
              <p className={`font-semibold text-[13px] mb-1 ${style.title}`}>{displayTitle}</p>
            )}
            <div className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed [&>p]:m-0 [&>p+p]:mt-1.5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
