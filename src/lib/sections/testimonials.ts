import type { BaseSectionProps } from './types';

export interface Testimonial {
  quote: string;
  authorName: string;
  authorRole?: string;
  authorOrg?: string;
  authorPhoto?: { src: string; alt: string };
  rating?: 1 | 2 | 3 | 4 | 5;
}

export interface TestimonialsProps extends BaseSectionProps {
  _type: 'testimonials';
  title?: string;
  items: Testimonial[];
  layout?: 'grid' | 'single';
}
