import type { BaseSectionProps } from './types';

export interface PricingPlan {
  name: string;
  price: string; // "€29" or "Custom" — display string
  priceAmount?: number; // numeric value for JSON-LD when applicable
  currency?: string; // ISO 4217 (e.g. "EUR") for JSON-LD
  interval?: 'month' | 'year' | 'once';
  description?: string;
  features: string[];
  ctaText: string;
  ctaUrl: string;
  highlighted?: boolean;
}

export interface PricingProps extends BaseSectionProps {
  _type: 'pricing';
  title?: string;
  plans: PricingPlan[];
}
