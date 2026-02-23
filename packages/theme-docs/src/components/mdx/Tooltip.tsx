import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

interface TooltipProps {
  children: React.ReactNode;
  tip: string;
}

export function Tooltip({ children, tip }: TooltipProps) {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setContainer(document.body);
  }, []);

  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span className="bd-tooltip-trigger">{children}</span>
        </TooltipPrimitive.Trigger>
        {container && (
          <TooltipPrimitive.Portal container={container}>
            <TooltipPrimitive.Content
              className="bd-tooltip-content"
              sideOffset={6}
              style={{ zIndex: 99999 }}
            >
              {tip}
              <TooltipPrimitive.Arrow className="bd-tooltip-arrow" />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        )}
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
