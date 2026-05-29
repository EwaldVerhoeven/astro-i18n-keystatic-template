import type { BaseSectionProps } from './types';

export interface BlogPreviewProps extends BaseSectionProps {
  _type: 'blogPreview';
  title?: string;
  limit?: number;
}
