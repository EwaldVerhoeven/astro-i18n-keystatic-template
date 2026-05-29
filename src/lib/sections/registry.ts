// Single source of truth for section types.
// Each entry pairs a Keystatic-compatible schema with its Astro component.
// Adding a section: 1) create src/lib/sections/<name>.ts 2) create src/components/sections/<Name>.astro 3) add entry below.

import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import Hero from '@/components/sections/Hero.astro';
import RichText from '@/components/sections/RichText.astro';
import FeatureGrid from '@/components/sections/FeatureGrid.astro';
import CTA from '@/components/sections/CTA.astro';

interface RegistryEntry {
  label: string;
  component: AstroComponentFactory;
  // schema is intentionally `unknown` here — Keystatic's fields.object<...> doesn't
  // expose a stable type, but the keystatic.config.ts import resolves it concretely.
  schema: unknown;
}

export const sectionRegistry: Record<string, RegistryEntry> = {
  hero:        { label: 'Hero',         component: Hero,        schema: null },
  richText:    { label: 'Rich text',    component: RichText,    schema: null },
  featureGrid: { label: 'Feature grid', component: FeatureGrid, schema: null },
  cta:         { label: 'CTA',          component: CTA,         schema: null },
};

export type SectionType = keyof typeof sectionRegistry;
