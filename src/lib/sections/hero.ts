import type { BaseSectionProps } from './types';

export interface HeroImage {
  src: string;
  alt: string;
}

export interface HeroProps extends BaseSectionProps {
  _type: 'hero';
  headline: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  image?: HeroImage;
  variant?: 'default' | 'centered';
}

// Keystatic schema is defined in keystatic.config.ts and re-uses these
// property names verbatim. Keep this interface in sync with the schema there.
