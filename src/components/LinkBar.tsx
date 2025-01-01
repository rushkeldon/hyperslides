import '../css/linkBar.less';
import { createRef, MouseEvent } from 'react';
import { useSignalTower } from '../hooks/useSignalTower.ts';
import { FromDirections } from '../types/Slide.ts';

// Extend the Window interface to include the signalTower property
declare global {
  interface Window {
    signalTower: any;
  }
}

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
  window.signalTower = signalTower;
  const ref = createRef<HTMLDivElement>();

  function startMouseOutMonitor(event: MouseEvent) {
    const target = event.target as HTMLDivElement;
    let mouseX = 0;
    let mouseY = 0;

    function updateMouseCoords( e : any ) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    window.addEventListener('mousemove', updateMouseCoords);

    function checkMouseOut() {
      if( !mouseX && !mouseY ) return requestAnimationFrame(checkMouseOut);
      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      if (!target.contains(elementUnderMouse) && target !== elementUnderMouse) {
        target.classList.remove('displayed');
        window.removeEventListener('mousemove', updateMouseCoords);
      } else {
        requestAnimationFrame(checkMouseOut);
      }
    }

    requestAnimationFrame(checkMouseOut);
  }

  return <div
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
        onClick={ () => {
            console.log( 'link clicked:', link, fromDirection );
            signalTower.slideRequested.dispatch(link, fromDirection);
          }
        }
      >
        {link}
      </div> )
    }
  </div>;
}
