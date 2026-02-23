import { defineCollection, z } from "astro:content";

const docsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    related: z.array(z.string()).optional(),
    category: z.string().optional(),
    api_reference: z.boolean().optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    lastUpdated: z.date().optional(),
  }),
});

export const collections = {
  docs: docsCollection,
};
