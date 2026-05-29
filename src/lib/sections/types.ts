import type { Lang } from '@/i18n/utils';

export type HeadingLevel = 1 | 2;

export interface BaseSectionProps {
  lang: Lang;
  headingLevel: HeadingLevel;
}

export type SectionData = { _type: string } & Record<string, unknown>;
