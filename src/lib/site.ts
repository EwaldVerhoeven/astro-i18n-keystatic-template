import { z } from 'astro/zod';
import rawSite from '@/content/globals/site.json';

// Site-wide globals live in src/content/globals/site.json. When Keystatic is on,
// the "Site settings" singleton edits this same file. We import it directly and
// validate at build time, which fits a flat singleton object better than Astro's
// file() content loader (that treats top-level keys as separate entries).
const siteSchema = z.object({
  siteName: z.string(),
  defaultOgImage: z.string().optional(),
  organization: z
    .object({
      name: z.string(),
      logo: z.string().optional(),
      url: z.string(),
      sameAs: z.array(z.string()).default([]),
    })
    .optional(),
  googleSiteVerification: z.string().optional(),
  analytics: z
    .object({
      provider: z.enum(['plausible', 'ga4', 'fathom', 'umami', 'none']),
      siteId: z.string().optional(),
    })
    .optional(),
});

export type SiteConfig = z.infer<typeof siteSchema>;

export const site: SiteConfig = siteSchema.parse(rawSite);
