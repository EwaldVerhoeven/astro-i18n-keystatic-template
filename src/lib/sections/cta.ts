import type { BaseSectionProps } from './types';

export interface CtaProps extends BaseSectionProps {
  _type: 'cta';
  title: string;
  description?: string;
  primaryText: string;
  primaryUrl: string;
  secondaryText?: string;
  secondaryUrl?: string;
  variant?: 'default' | 'inverted';
}
