import { useState, type ReactNode } from "react";

interface AccordionProps {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Accordion({ title, icon, defaultOpen = false, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="accordion-item border border-[var(--bd-border)] rounded-xl overflow-hidden bg-[var(--bd-bg)] my-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--bd-bg-subtle)] transition-colors"
        aria-expanded={isOpen}
      >
        {icon && (
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--bd-bg-subtle)] text-lg shrink-0">
            {icon}
          </span>
        )}
        <span className="flex-1 font-medium text-[var(--bd-text)]">{title}</span>
        <svg
          className={`w-5 h-5 text-[var(--bd-text-secondary)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`accordion-content overflow-hidden transition-all duration-200 ease-out ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 pt-1 text-sm text-[var(--bd-text-secondary)] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

interface AccordionGroupProps {
  children: ReactNode;
}

export function AccordionGroup({ children }: AccordionGroupProps) {
  return (
    <div className="not-prose accordion-group space-y-2 my-6">
      {children}
    </div>
  );
}

export default Accordion;
