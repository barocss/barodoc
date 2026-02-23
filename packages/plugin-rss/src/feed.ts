import rss from "@astrojs/rss";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const site = context.site ?? new URL("https://localhost");

  let items: { title: string; pubDate: Date; link: string; description?: string }[] = [];

  try {
    const { getCollection } = await import("astro:content");
    
    try {
      const blogs = await getCollection("blog");
      for (const post of blogs) {
        items.push({
          title: post.data.title,
          pubDate: post.data.date ? new Date(post.data.date) : new Date(),
          link: `/blog/${post.slug}`,
          description: post.data.description || post.data.excerpt || "",
        });
      }
    } catch {
      // blog collection doesn't exist
    }

    try {
      const changelogs = await getCollection("changelog");
      for (const entry of changelogs) {
        items.push({
          title: `${entry.data.version}${entry.data.title ? ` - ${entry.data.title}` : ""}`,
          pubDate: new Date(entry.data.date),
          link: `/changelog#${entry.data.version}`,
        });
      }
    } catch {
      // changelog collection doesn't exist
    }
  } catch {
    // no collections available
  }

  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: "Barodoc",
    description: "Latest updates",
    site: site.toString(),
    items,
  });
}
