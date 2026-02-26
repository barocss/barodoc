/**
 * Ambient declaration for Astro virtual modules.
 * Resolved at runtime when the feed runs inside an Astro app.
 */
declare module "astro:content" {
  type CollectionEntry<T = Record<string, unknown>> = {
    id: string;
    slug: string;
    data: T;
    body: string;
  };
  export function getCollection<T = Record<string, unknown>>(
    collection: string
  ): Promise<Array<CollectionEntry<T>>>;
}
