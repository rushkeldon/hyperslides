import '../css/app.less';
import { useEffect, useState } from 'react';
import { useSignalTower } from '../hooks/useSignalTower.ts';
import { FromDirections, Slide } from '../types/Slide.ts';
import LinkBar from './LinkBar.tsx';
import SlideComponent from './SlideComponent.tsx';

export default function App({ data }) {

  const firstSlide : Slide = data.slides.find( slide => slide.id === data.startingSlideID );
  const [currentSlide, setCurrentSlide ] = useState<Slide>( firstSlide );
  const [nextSlide, setNextSlide ] = useState<Slide | null>( null );
  const [nextSlideFromDirection, setNextSlideFromDirection] = useState<FromDirections>( FromDirections.NONE );
  const [isNextSlideReady, setIsNextSlideReady] = useState<boolean>( false );
  const [isInTransition, setIsInTransition] = useState<boolean>( false );
  const signalTower = useSignalTower();

  const nextSlideRequested = (slideID: string, fromDirection: FromDirections, isFromHistory: boolean = false) => {
    if (isFromHistory) {
      // pop the current slide off the history stack and navigate to it
      const previousSlide = history.state?.slideID;
      if (previousSlide) {
        const slide = data.slides.find(slide => slide.id === previousSlide);
        setCurrentSlide(slide);
      } else {
        history.back();
      }
    } else {
      // push the next slide to the history stack and navigate to it
      const slide = data.slides.find(slide => slide.id === slideID);
      history.pushState({ slideID, fromDirection }, '', `#${slideID}`);
      setNextSlide(slide);
    }
    setNextSlideFromDirection(fromDirection);
    setIsInTransition(true);
  };

  const slidesTransitioned = () => {
    setCurrentSlide( nextSlide! );
    setNextSlide( null );
    setIsNextSlideReady( false );
    setIsInTransition( false );
  };

  useEffect(()=> {
    signalTower.slideRequested.add( nextSlideRequested );

    const handlePopState = (event: PopStateEvent) => {
      const slideID = event.state?.slideID;
      let fromDirection = event.state?.fromDirection;

      switch (fromDirection) {
        case FromDirections.LEFT:
          fromDirection = FromDirections.RIGHT;
          break;
        case FromDirections.RIGHT:
          fromDirection = FromDirections.LEFT;
          break;
        case FromDirections.TOP:
          fromDirection = FromDirections.BOTTOM;
          break;
        case FromDirections.BOTTOM:
          fromDirection = FromDirections.TOP;
          break;
        default:
          fromDirection = FromDirections.NONE;
      }

      if (slideID) {
        nextSlideRequested(slideID, fromDirection, true);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <>
      <LinkBar classNames={`${FromDirections.LEFT}${isInTransition ? ' offstage' : ''}`} fromDirection={FromDirections.LEFT} links={currentSlide?.links?.left}/>
      <LinkBar classNames={`${FromDirections.RIGHT}${isInTransition ? ' offstage' : ''}`} fromDirection={FromDirections.RIGHT} links={currentSlide?.links?.right}/>
      <LinkBar classNames={`${FromDirections.TOP}${isInTransition ? ' offstage' : ''}`} fromDirection={FromDirections.TOP} links={currentSlide?.links?.top}/>
      <LinkBar classNames={`${FromDirections.BOTTOM}${isInTransition ? ' offstage' : ''}`} fromDirection={FromDirections.BOTTOM} links={currentSlide?.links?.bottom}/>
      <SlideComponent classNames={'onstage'} slide={ currentSlide } />
      { Boolean( nextSlide ) &&
        <SlideComponent
          classNames={`${isNextSlideReady ? nextSlideFromDirection : 'offstage'}`}
          slide={ nextSlide as Slide }
          onTransitionEnd={slidesTransitioned}
          setIsNextSlideReady={setIsNextSlideReady}
        /> }
    </>
  )
}
