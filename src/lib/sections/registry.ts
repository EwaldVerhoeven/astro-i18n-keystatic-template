// Single source of truth for section types.
// Each entry pairs a Keystatic-compatible schema with its Astro component.
// Adding a section: 1) create src/lib/sections/<name>.ts 2) create src/components/sections/<Name>.astro 3) add entry below.

import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import Hero from '@/components/sections/Hero.astro';
import RichText from '@/components/sections/RichText.astro';
import FeatureGrid from '@/components/sections/FeatureGrid.astro';
import CTA from '@/components/sections/CTA.astro';
import FAQ from '@/components/sections/FAQ.astro';
import Testimonials from '@/components/sections/Testimonials.astro';
import BlogPreview from '@/components/sections/BlogPreview.astro';
import Pricing from '@/components/sections/Pricing.astro';
import ImageText from '@/components/sections/ImageText.astro';
import LogoWall from '@/components/sections/LogoWall.astro';
import ContactForm from '@/components/sections/ContactForm.astro';

interface RegistryEntry {
  label: string;
  component: AstroComponentFactory;
  // schema is intentionally `unknown` here — Keystatic's fields.object<...> doesn't
  // expose a stable type, but the keystatic.config.ts import resolves it concretely.
  schema: unknown;
}

export const sectionRegistry: Record<string, RegistryEntry> = {
  hero: { label: 'Hero', component: Hero, schema: null },
  richText: { label: 'Rich text', component: RichText, schema: null },
  featureGrid: { label: 'Feature grid', component: FeatureGrid, schema: null },
  cta: { label: 'CTA', component: CTA, schema: null },
  faq: { label: 'FAQ', component: FAQ, schema: null },
  testimonials: { label: 'Testimonials', component: Testimonials, schema: null },
  blogPreview: { label: 'Blog preview', component: BlogPreview, schema: null },
  pricing: { label: 'Pricing', component: Pricing, schema: null },
  imageText: { label: 'Image + text', component: ImageText, schema: null },
  logoWall: { label: 'Logo wall', component: LogoWall, schema: null },
  contactForm: { label: 'Contact form', component: ContactForm, schema: null },
};

export type SectionType = keyof typeof sectionRegistry;
