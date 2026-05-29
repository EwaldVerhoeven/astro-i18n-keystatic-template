import type { BaseSectionProps } from './types';

export interface Logo {
  src: string;
  alt: string;
  url?: string;
}

export interface LogoWallProps extends BaseSectionProps {
  _type: 'logoWall';
  title?: string;
  logos: Logo[];
  grayscale?: boolean;
}
