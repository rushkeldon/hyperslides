import '../css/linkBar.less';
import { useSignalTower } from '../hooks/useSignalTower.ts';
import { FromDirections } from '../types/Slide.ts';

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

  return <div className={`link-bar ${classNames}`}>
    {
      links?.map( link => <div key={link}
        tabIndex={0}
        className="link"
        onClick={() => { signalTower.slideRequested.dispatch(link, fromDirection); }}
      >
        {link}
      </div> )
    }
  </div>;
}
