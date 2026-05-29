import type { BaseSectionProps } from './types';

export interface Feature {
  title: string;
  description: string;
  icon?: string; // path to SVG/image asset
}

export interface FeatureGridProps extends BaseSectionProps {
  _type: 'featureGrid';
  eyebrow?: string;
  title?: string;
  columns?: 2 | 3 | 4;
  features: Feature[];
}
