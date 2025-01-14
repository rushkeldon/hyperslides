import { CSSProperties, TransitionEvent, useEffect, useState } from 'react';
import { Slide } from '../types/Slide.ts';
import '../css/slide.less';
import { checkIframeAllowed } from '../utils/utils.ts';
import NoIframePanel from './NoIframePanel.tsx';

type SlideComponentProps = {
  classNames?: string;
  slide: Slide;
  onTransitionEnd?: (e : TransitionEvent) => void;
}

export default function SlideComponent( {
  classNames = '',
  slide,
  onTransitionEnd
} : SlideComponentProps ) {

  const [ iframesDisallowed, setIframesDisallowed ] = useState<string[]>( [] );
  let elementCount = slide.elements.length;

  useEffect( () => {
    const checkIframeURLs = async () => {
      const urls = slide.elements
        .filter( element => element.type === 'iframe' )
        .map( element => element.data?.url || '' );

      const urlCheckResults : boolean[] = await Promise.all( urls.map( checkIframeAllowed ) );
      setIframesDisallowed( urls.filter( ( _, index ) => !urlCheckResults[index] ) );
    };

    checkIframeURLs();
  }, [slide.elements])

  return <div
    data-id={slide.id}
    className={`slide ${ classNames ? classNames : '' }`}
    style={{ '--element-count': elementCount } as CSSProperties}
    onTransitionEnd={ onTransitionEnd }
  >
    {
      slide.elements.map( (element, index) => {
        switch (element.type) {
          case 'text':
            return <div
              className="slide-element text"
              onTransitionEnd={ onTransitionEnd }
              key={index}
            >
              <p>{element.data?.value || 'slide.elements.data has no value property'}</p>
            </div>;
          case 'youtube':
            return <div
              className="slide-element youtube"
              onTransitionEnd={ onTransitionEnd }
              key={index}
            >
              <iframe
                src={`https://www.youtube.com/embed/${element.data?.id}`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>;
          case 'vimeo':
            return <div
              className="slide-element vimeo"
              onTransitionEnd={ onTransitionEnd }
              key={index}
            >
              <iframe src={`https://player.vimeo.com/video/${element.data?.id}`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>;
          case 'googleslides':
            return <div
              className="slide-element googledoc"
              onTransitionEnd={ onTransitionEnd }
              key={index}
            >
              <iframe src={`https://docs.google.com/presentation/d/${element.data?.id}/embed?start=true`}></iframe>
            </div>;
          case 'iframe':
            return <div
              className="slide-element iframe"
              onTransitionEnd={ onTransitionEnd }
              key={index}
            >
              {!iframesDisallowed.includes( element.data?.url || '' ) && <iframe
                src={element.data?.url}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>}
              { iframesDisallowed.includes( element.data?.url || '' ) && <>
                <NoIframePanel url={element.data?.url}/>
              </>}
            </div>;
          case 'codepen':
            return <div
              className="slide-element codepen"
              onTransitionEnd={ onTransitionEnd }
              key={index}
            >
              <iframe src={`https://codepen.io/${element.data?.author}/embed/${element.data?.id}?theme-id=dark&default-tab=result`} allowFullScreen></iframe>
            </div>;
        }
      } )
    }
  </div>;
}
