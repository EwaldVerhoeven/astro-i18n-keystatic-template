import type { BaseSectionProps } from './types';

export interface ContactFormProps extends BaseSectionProps {
  _type: 'contactForm';
  title?: string;
  description?: string;
  submitText: string;
  successRedirect?: string;
}
