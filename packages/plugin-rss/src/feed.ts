import rss from "@astrojs/rss";
import type { APIContext } from "astro";
// @ts-ignore - virtual module provided by @barodoc/core
import config from "virtual:barodoc/config";

export async function GET(context: APIContext) {
  const rssConfig = (config as any)._rss ?? {};
  const feedTitle = rssConfig.title ?? config.name ?? "Documentation";
  const feedDescription = rssConfig.description ?? "Latest updates";
  const site = context.site ?? (config.site ? new URL(config.site) : new URL("http://localhost:4321"));

  let items: { title: string; pubDate: Date; link: string; description?: string }[] = [];

  try {
    const { getCollection } = await import("astro:content");

    try {
      const blogs = await getCollection("blog");
      for (const post of blogs) {
        items.push({
          title: post.data.title,
          pubDate: post.data.date ? new Date(post.data.date) : new Date(),
          link: `/blog/${post.slug ?? post.id}`,
          description: post.data.description || post.data.excerpt || "",
        });
      }
    } catch {}

    try {
      const changelogs = await getCollection("changelog");
      for (const entry of changelogs) {
        items.push({
          title: `${entry.data.version}${entry.data.title ? ` - ${entry.data.title}` : ""}`,
          pubDate: new Date(entry.data.date),
          link: `/changelog#${entry.data.version}`,
        });
      }
    } catch {}
  } catch {}

  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: feedTitle,
    description: feedDescription,
    site: site.toString(),
    items,
  });
}
