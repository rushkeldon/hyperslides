import { Slide, SlideDataIframe, SlideDataText, SlideDataVimeo, SlideDataYouTube } from '../types/Slide.ts';
import { useEffect } from 'react';

type SlideComponentProps = {
  classNames?: string;
  slide: Slide;
  setIsNextSlideReady?: (isReady: boolean) => void;
  onTransitionEnd?: () => void;
}

export default function SlideComponent( {
  classNames,
  slide,
  onTransitionEnd,
  setIsNextSlideReady
} : SlideComponentProps ) {

  useEffect(() => {
    setIsNextSlideReady && setIsNextSlideReady(true);
  }, [] );

  return <div className={`slide ${classNames}`}>
    {
      slide.elements.map( (element, index) => {
        switch (element.type) {
          case 'text':
            return <div onTransitionEnd={ onTransitionEnd } className="text">{(element.data as SlideDataText )?.value}</div>;
          case 'youtube':
            return <div onTransitionEnd={ onTransitionEnd } key={index} className="youtube">{(element.data as SlideDataYouTube )?.id}</div>;
          case 'vimeo':
            return <div onTransitionEnd={ onTransitionEnd } key={index} className="vimeo">{(element.data as SlideDataVimeo )?.id}</div>;
          case 'iframe':
            return <div onTransitionEnd={ onTransitionEnd } key={index} className="iframe">{(element.data as SlideDataIframe )?.url}</div>;
        }
      })
    }
  </div>;
}
