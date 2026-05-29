import type { BaseSectionProps } from './types';
import type { DocumentRendererProps } from '@keystatic/core/renderer';

// Keystatic document AST format — matches exactly what DocumentRenderer expects.
// The same JSON shape is produced whether Keystatic admin is on or off.
export type DocumentAst = DocumentRendererProps['document'];

export interface RichTextProps extends BaseSectionProps {
  _type: 'richText';
  content: DocumentAst;
  maxWidth?: 'narrow' | 'default';
}
