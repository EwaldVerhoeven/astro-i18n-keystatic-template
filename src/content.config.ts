import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const sectionSchema = z.looseObject({
  _type: z.string(),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.json', base: 'src/content/pages' }),
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
    pubDate: z.date(),
    readTime: z.number().int().positive(),
    lang: z.enum(['nl', 'en']),
  }),
});

const globals = defineCollection({
  loader: file('src/content/globals/site.json'),
  schema: z.object({
    siteName: z.string(),
    defaultOgImage: z.string().optional(),
    organization: z.object({
      name: z.string(),
      logo: z.string().optional(),
      url: z.url(),
      sameAs: z.array(z.url()).default([]),
    }).optional(),
    googleSiteVerification: z.string().optional(),
    analytics: z.object({
      provider: z.enum(['plausible', 'ga4', 'fathom', 'umami', 'none']),
      siteId: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { pages, blog, globals };
