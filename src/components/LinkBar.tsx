import '../css/linkBar.less';
import { createRef, CSSProperties, MouseEvent } from 'react';
import { useSignalTower } from '../hooks/useSignalTower.ts';
import { FromDirections, Slide } from '../types/Slide.ts';

type LinkBarProps = {
  classNames?: string;
  fromDirection: FromDirections
  links: string[] | undefined;
};

export default function LinkBar({
  classNames,
  fromDirection,
  links,
} : LinkBarProps) {
  const signalTower = useSignalTower();
  const ref = createRef<HTMLDivElement>();
  const { appDataReceived } = useSignalTower();
  let appData;
  appDataReceived.addOnce( data => appData = data );

  function startMouseOutMonitor(event: MouseEvent) {
    const target = event.target as HTMLDivElement;
    let mousePoint = { x: 0, y: 0 };

    const updateMouseCoords = ( e : any ) => mousePoint = { x: e.clientX, y: e.clientY };
    window.addEventListener('mousemove', updateMouseCoords);

    function checkMouseOut() {
      if( !mousePoint.x && !mousePoint.y ) return requestAnimationFrame(checkMouseOut);
      const elementUnderMouse = document.elementFromPoint(mousePoint.x, mousePoint.y);
      if (!target.contains(elementUnderMouse) && target !== elementUnderMouse) {
        target.classList.remove('displayed');
        window.removeEventListener('mousemove', updateMouseCoords);
      } else {
        requestAnimationFrame(checkMouseOut);
      }
    }

    requestAnimationFrame(checkMouseOut);
  }

  function getLinkLabel(link: string) : string {
    if( !appData ) return link;
    const targetSlide = appData.slides.find( ( slide : Slide ) => slide.id === link );
    return targetSlide?.linkLabel || link;
  }

  return <div
    style={{
      '--link-bar-bg-color': appData?.style?.linkBarBGColor,
      '--link-bar-text-color': appData?.style?.linkBarTextColor
    } as CSSProperties}
    ref={ref}
    className={`link-bar ${classNames}`}
    onMouseOver={ (e) => {
        (e.target as HTMLDivElement ).classList.add('displayed');
        startMouseOutMonitor( e as MouseEvent );
      }
    }
  >
    {
      links?.map( link => <div
        key={link}
        tabIndex={0}
        className="link"
        onClick={ () => signalTower.slideRequested.dispatch( link, fromDirection ) }
      >
        {getLinkLabel(link)}
      </div> )
    }
  </div>;
}
