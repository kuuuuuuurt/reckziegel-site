import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    timeframe: z.string(),
    order: z.number(),
    summary: z.string().optional(),
  }),
});

export const collections = { work };
