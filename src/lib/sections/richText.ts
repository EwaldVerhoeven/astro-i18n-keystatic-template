import type { BaseSectionProps } from './types';
import type { DocumentAst } from './document';

export type { DocumentAst };

export interface RichTextProps extends BaseSectionProps {
  _type: 'richText';
  content: DocumentAst;
  maxWidth?: 'narrow' | 'default';
}
