import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { cn } from "../../lib/utils";

// Accordion item structure
interface AccordionItemData {
  title: string;
  content: React.ReactNode;
  icon?: string;
}

interface DocAccordionProps {
  items: AccordionItemData[];
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
  className?: string;
}

export function DocAccordion({ 
  items,
  type = "single", 
  collapsible = true,
  defaultValue,
  className 
}: DocAccordionProps) {
  const renderItems = () => 
    items.map((item, index) => {
      const value = `item-${index}`;
      return (
        <AccordionItem 
          key={value} 
          value={value}
          className="border-b border-[var(--color-border)] last:border-b-0"
        >
          <div className="flex items-start gap-3 px-4">
            {item.icon && (
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-bg-secondary)] text-lg shrink-0 mt-3">
                {item.icon}
              </span>
            )}
            <div className="flex-1">
              <AccordionTrigger className="text-left">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="text-[var(--color-text-secondary)]">
                {item.content}
              </AccordionContent>
            </div>
          </div>
        </AccordionItem>
      );
    });

  if (type === "single") {
    return (
      <Accordion 
        type="single" 
        collapsible={collapsible}
        defaultValue={defaultValue as string}
        className={cn("not-prose my-6 rounded-xl border border-[var(--color-border)] overflow-hidden", className)}
      >
        {renderItems()}
      </Accordion>
    );
  }

  return (
    <Accordion 
      type="multiple" 
      defaultValue={defaultValue as string[]}
      className={cn("not-prose my-6 rounded-xl border border-[var(--color-border)] overflow-hidden", className)}
    >
      {renderItems()}
    </Accordion>
  );
}

// Alias for backwards compatibility
export const SimpleAccordion = DocAccordion;

export default DocAccordion;
