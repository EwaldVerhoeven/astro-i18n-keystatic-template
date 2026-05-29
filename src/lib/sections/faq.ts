import type { BaseSectionProps } from './types';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqProps extends BaseSectionProps {
  _type: 'faq';
  title?: string;
  items: FaqItem[];
}
