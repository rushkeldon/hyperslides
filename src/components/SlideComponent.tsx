import { CSSProperties } from 'react';
import { Slide, SlideDataIframe, SlideDataText, SlideDataVimeo, SlideDataYouTube } from '../types/Slide.ts';
import '../css/slide.less';

type SlideComponentProps = {
  classNames?: string;
  slide: Slide;
  onTransitionEnd?: () => void;
}

export default function SlideComponent( {
  classNames,
  slide,
  onTransitionEnd
} : SlideComponentProps ) {

  let data : SlideDataText | SlideDataYouTube | SlideDataVimeo | SlideDataIframe | undefined;
  let elementCount = slide.elements.length;

  return <div
    data-id={slide.id}
    className={`slide ${classNames}`}
    style={{ '--element-count': elementCount } as CSSProperties}
  >
    {
      slide.elements.map( (element, index) => {
        switch (element.type) {
          case 'text':
            data = element.data as SlideDataText;
            return <div
              className="slide-element text"
              onTransitionEnd={ onTransitionEnd }
              key={index}
            >
              <p>{data?.value || 'slide.elements.data has no value property'}</p>
            </div>;
          case 'youtube':
            data = element.data as SlideDataYouTube;
            return <div
              className="slide-element youtube"
              onTransitionEnd={ onTransitionEnd }
              key={index}
            >
              <iframe
                src={`https://www.youtube.com/embed/${data?.id}`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>;
          case 'vimeo':
            data = element.data as SlideDataVimeo;
            return <div
              className="slide-element vimeo"
              onTransitionEnd={ onTransitionEnd }
              key={index}
            >
              <iframe src={`https://player.vimeo.com/video/${data?.id}`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>;
          case 'iframe':
            data = element.data as SlideDataIframe;
            return <div
              className="slide-element iframe"
              onTransitionEnd={ onTransitionEnd }
              key={index}
            >
              <iframe
                src={data?.url}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>;
        }
      })
    }
  </div>;
}
