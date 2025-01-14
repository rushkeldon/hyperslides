export type SlideData = {
  id?: string;
  url?: string;
  author?: string;
  value?: string;
}

export type SlideElement = {
  type: 'text' | 'youtube' | 'vimeo' | 'iframe' | 'googleslides' | 'codepen';
  data?: SlideData;
};

export enum FromDirections {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top',
  BOTTOM = 'bottom',
  NONE = 'none'
}

export type SlideLinks = {
  left?: string[];
  right?: string[];
  top?: string[];
  bottom?: string[];
};

export type Slide = {
  id: string;
  title?: string;
  linkLabel?: string;
  elements: SlideElement[];
  isBackLinked?: boolean;
  links?: SlideLinks;
}

/**
 * if a slide does not have links then isBackLinked is true
 * when isBackLinked the mirrored links get auto-populated
 */
