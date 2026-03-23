// UI Components - exported for custom overrides
export { ThemeToggle } from "./ThemeToggle.tsx";
export { Search } from "./Search.tsx";

// shadcn/ui components
export * from "./ui/index.ts";

// MDX Components (shadcn/ui based)
export { DocCard, DocCardGroup } from "./mdx/DocCard.tsx";
export { DocCallout } from "./mdx/DocCallout.tsx";
export { DocTabs } from "./mdx/DocTabs.tsx";
export { DocAccordion, SimpleAccordion } from "./mdx/DocAccordion.tsx";

// New MDX Components
export { Callout } from "./mdx/Callout.tsx";
export { CodeGroup } from "./mdx/CodeGroup.tsx";
export { Badge } from "./mdx/Badge.tsx";
export { Frame } from "./mdx/Frame.tsx";
export { Columns, Column } from "./mdx/Columns.tsx";
export { Tooltip } from "./mdx/Tooltip.tsx";
export { FileTree, TreeFile, TreeFolder } from "./mdx/FileTree.tsx";
export { ParamField, ParamFieldGroup } from "./mdx/ParamField.tsx";
export { ResponseField, ResponseFieldGroup } from "./mdx/ResponseField.tsx";
export { Expandable, ExpandableList, ExpandableItem } from "./mdx/Expandable.tsx";
export { Icon, CheckIcon, XIcon, InfoIcon, WarningIcon } from "./mdx/Icon.tsx";
export { Steps, Step } from "./mdx/Steps.tsx";
export { Mermaid } from "./mdx/Mermaid.tsx";
export { ImageZoom } from "./mdx/ImageZoom.tsx";
export { Video } from "./mdx/Video.tsx";
export { ApiPlayground } from "./mdx/ApiPlayground.tsx";
export { ApiEndpoint } from "./mdx/ApiEndpoint.tsx";
export { Card, CardGroup } from "./mdx/Card.tsx";
export { CodeItem } from "./mdx/CodeItem.tsx";
export { ApiParams } from "./mdx/ApiParams.tsx";
export { ApiParam } from "./mdx/ApiParam.tsx";
export { ApiResponse } from "./mdx/ApiResponse.tsx";

export { VersionSwitcher } from "./VersionSwitcher.tsx";

// SaaS-style landing blocks (MDX / Astro)
export {
  LandingHero,
  LandingLogoStrip,
  LandingStats,
  LandingFeatures,
  LandingTestimonials,
  LandingPricing,
  LandingFaq,
  LandingCta,
  LandingFooter,
} from "./landing/index.ts";
export type {
  LandingHeroProps,
  LandingLogoStripProps,
  LandingLogoStripItem,
  LandingStatsProps,
  LandingStatItem,
  LandingFeaturesProps,
  LandingFeatureItem,
  LandingTestimonialsProps,
  LandingTestimonialItem,
  LandingPricingProps,
  LandingPricingPlan,
  LandingFaqProps,
  LandingFaqItem,
  LandingCtaProps,
  LandingFooterProps,
  LandingFooterLink,
} from "./landing/index.ts";
export type {
  LandingFrontmatter,
  LandingHeroFm,
  LandingLogoStripFm,
  LandingStatsFm,
  LandingFeaturesFm,
  LandingTestimonialsFm,
  LandingPricingFm,
  LandingFaqFm,
  LandingCtaFm,
  LandingFooterFm,
} from "../landing/types.ts";

// Legacy exports for backwards compatibility
export { Tabs, Tab } from "./mdx/Tabs.tsx";
export { Accordion, AccordionGroup } from "./mdx/Accordion.tsx";
export { Table, TableHeader, TableBody, TableRow, TableCell } from "./mdx/Table.tsx";
export { Comparison, ComparisonItem } from "./mdx/Comparison.tsx";
export { Toast, ToastIcon, ToastDemo } from "./mdx/Toast.tsx";
