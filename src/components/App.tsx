import { useEffect, useState } from 'react';
import { useSignalTower } from '../hooks/useSignalTower.ts';
import { FromDirections, Slide } from '../types/Slide.ts';
import LinkBar from './LinkBar.tsx';
import SlideComponent from './SlideComponent.tsx';

function getOppositeDirection( direction: FromDirections ) : FromDirections {
  switch( direction ) {
    case FromDirections.LEFT:
      return FromDirections.RIGHT;
    case FromDirections.RIGHT:
      return FromDirections.LEFT;
    case FromDirections.TOP:
      return FromDirections.BOTTOM;
    case FromDirections.BOTTOM:
      return FromDirections.TOP;
    default:
      return FromDirections.NONE;
  }
}

export default function App({ data }) {
  const { slideRequested } = useSignalTower();
  const firstSlide : Slide = data.slides.find( ( slide : Slide ) => slide.id === data.startingSlideID );
  const [currentSlide, setCurrentSlide ] = useState<Slide | null>( firstSlide );
  const [nextSlide, setNextSlide ] = useState<Slide | null>( null );
  const [nextSlideFromDirection, setNextSlideFromDirection] = useState<FromDirections>( FromDirections.NONE );
  const [shouldSlidesTransition, setShouldSlidesTransition] = useState<boolean>( false );

  const nextSlideRequested = (slideID: string, fromDirection: FromDirections, isFromHistory: boolean = false) => {
    console.log( 'nextSlideRequested:' );
    console.log( `  slideID : ${slideID}` );
    console.log( `  fromDirection : ${fromDirection}` );
    console.log( `  isFromHistory : ${isFromHistory}` );
    if (isFromHistory) {
      const previousSlide = history.state?.slideID;
      if (previousSlide) {
        const slide = data.slides.find( ( slide : Slide ) => slide.id === previousSlide);
        setNextSlide(slide);
        setNextSlideFromDirection(fromDirection);
      } else {
        history.back();
      }
    } else {
      const slide = data.slides.find( ( slide : Slide ) => slide.id === slideID);
      history.pushState({ slideID, fromDirection }, '', `#${slideID}`);
      setNextSlide(slide);
      setNextSlideFromDirection(fromDirection);
    }
  };

  const currentSlideTransitioned = () => {
    setNextSlide( null );
    setCurrentSlide( nextSlide );
    setShouldSlidesTransition( false );
  };

  useEffect(() => {
    if( currentSlide && nextSlide ) {
      const nextSlideDiv = document.querySelector( `.slide[data-id="${nextSlide.id}"]` );
      const currentSlideDiv = document.querySelector( `.slide[data-id="${currentSlide?.id}"]` );
      const haveBothSlidesRendered = nextSlideDiv && currentSlideDiv;
      if( haveBothSlidesRendered ) {
        setShouldSlidesTransition( true );
      }
    }
  }, [currentSlide, nextSlide] );

  // add listeners
  useEffect(()=> {
    slideRequested.add( nextSlideRequested );

    const handlePopState = ( event: PopStateEvent ) => {
      const slideID = event.state?.slideID;
      let fromDirection = getOppositeDirection( event.state?.fromDirection );

      slideID && nextSlideRequested( slideID, fromDirection, true );
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      slideRequested.remove( nextSlideRequested );
    };
  }, [slideRequested]);

  const getLinkBars = () => <>
    { Boolean( currentSlide?.links?.left ) &&
      <LinkBar
        key="linkBarLeft"
        classNames={FromDirections.LEFT}
        fromDirection={FromDirections.LEFT}
        links={currentSlide?.links?.left}
      />
    }
    { Boolean( currentSlide?.links?.right ) &&
      <LinkBar
        key="linkBarRight"
        classNames={FromDirections.RIGHT}
        fromDirection={FromDirections.RIGHT}
        links={currentSlide?.links?.right}
      />
    }
    { Boolean( currentSlide?.links?.top ) &&
      <LinkBar
        key="linkBarTop"
        classNames={FromDirections.TOP}
        fromDirection={FromDirections.TOP}
        links={currentSlide?.links?.top}
      />
    }
    { Boolean( currentSlide?.links?.bottom ) &&
      <LinkBar
        key="linkBarBottom"
        classNames={ FromDirections.BOTTOM }
        fromDirection={ FromDirections.BOTTOM }
        links={ currentSlide?.links?.bottom }
      />
    }
  </>;

  return (
    <>
      { !nextSlide && getLinkBars() }
      { Boolean( currentSlide ) && <SlideComponent
        key={ currentSlide?.id }
        slide={ currentSlide as Slide }
        classNames={ shouldSlidesTransition ? `offstage-${ getOppositeDirection( nextSlideFromDirection ) }` : '' }
        onTransitionEnd={ currentSlideTransitioned }
      />
      }
      { Boolean( nextSlide ) && <SlideComponent
        key={ nextSlide?.id }
        slide={ nextSlide as Slide }
        classNames={ shouldSlidesTransition ? '' : `offstage-${ nextSlideFromDirection }` }
      />
      }
    </>
  )
}
