
export type SlideDataText = {
  value: string;
};

export type SlideDataYouTube = {
  id: string;
};

export type SlideDataVimeo = {
  id: string;
};

export type SlideDataIframe = {
  url: string;
}

export type SlideElement = {
  type: 'text' | 'youtube' | 'vimeo' | 'iframe';
  data?: SlideDataText | SlideDataYouTube | SlideDataVimeo | SlideDataIframe;
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
  id: string | number;
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
