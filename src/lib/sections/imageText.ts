import type { BaseSectionProps } from './types';

export interface ImageTextProps extends BaseSectionProps {
  _type: 'imageText';
  title: string;
  body: string;
  image: { src: string; alt: string };
  imagePosition?: 'left' | 'right';
  ctaText?: string;
  ctaUrl?: string;
}
