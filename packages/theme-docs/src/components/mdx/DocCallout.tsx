import * as React from "react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { Info, AlertTriangle, Lightbulb, AlertCircle, FileText } from "lucide-react";
import { cn } from "../../lib/utils";

type CalloutType = "info" | "warning" | "tip" | "danger" | "note";

interface DocCalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const variantMap: Record<CalloutType, "info" | "warning" | "success" | "destructive" | "default"> = {
  info: "info",
  warning: "warning",
  tip: "success",
  danger: "destructive",
  note: "default",
};

const iconMap: Record<CalloutType, React.ReactNode> = {
  info: <Info className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  tip: <Lightbulb className="h-4 w-4" />,
  danger: <AlertCircle className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
};

const defaultTitles: Record<CalloutType, string> = {
  info: "Info",
  warning: "Warning",
  tip: "Tip",
  danger: "Danger",
  note: "Note",
};

export function DocCallout({ type = "info", title, children }: DocCalloutProps) {
  const displayTitle = title || defaultTitles[type];

  return (
    <Alert variant={variantMap[type]} className="not-prose my-6">
      <div className="flex items-start gap-4">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
          type === "info" && "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
          type === "warning" && "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400",
          type === "tip" && "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400",
          type === "danger" && "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400",
          type === "note" && "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
        )}>
          {iconMap[type]}
        </div>
        <div className="flex-1 pt-0.5">
          <AlertTitle className="text-sm font-semibold mb-1">{displayTitle}</AlertTitle>
          <AlertDescription className="text-sm leading-relaxed [&>p]:m-0 [&>p+p]:mt-2">
            {children}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

export default DocCallout;
