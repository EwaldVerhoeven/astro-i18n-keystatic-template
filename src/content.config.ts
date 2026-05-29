import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const sectionSchema = z.looseObject({
  _type: z.string(),
});

const pages = defineCollection({
  // generateId forces a path-based id (e.g. "nl/home", "en/home"). Without it,
  // the loader would use the `slug` field as the id, colliding across languages.
  loader: glob({
    pattern: '**/*.json',
    base: 'src/content/pages',
    generateId: ({ entry }) => entry.replace(/\.json$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    lang: z.enum(['nl', 'en']),
    translationKey: z.string(),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().min(50),
      ogImage: z.string().optional(),
      canonical: z.url().optional(),
      noindex: z.boolean().default(false),
    }),
    sections: z.array(sectionSchema).default([]),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    readTime: z.number().int().positive(),
    lang: z.enum(['nl', 'en']),
  }),
});

// Site globals (Keystatic singleton) are consumed via a direct, validated JSON
// import in src/lib/site.ts — see the comment there. The file() content loader
// does not fit a flat singleton object, so globals is not a collection.
export const collections = { pages, blog };
