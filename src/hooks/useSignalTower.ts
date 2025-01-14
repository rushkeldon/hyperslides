import signals from 'signals';
import * as logger from '../utils/logger.ts';

declare global {
  interface Window {
    signalTower: SignalTower;
  }
}

/**
 * SignalTower is a collection of signals that can be used to communicate between components and non-React code.
 * It also stores latest state per signal.
 * Signals can be dispatched with an arbitrary payloads / number and type of arguments.
 * We set the *memorize* flag to true which allows the signal to remember the last arguments that were dispatched
 *  and trigger any subsequently added listeners with the latest payload immediately when added.
 *
 * Signal methods include :
 * • add( listener : Function ) : void
 * • addOnce( listener : Function ) : void
 * • remove( listener : Function ) : void
 * • removeAll() : void
 * • dispatch( ...args : any[] ) : void
 *
 * Read more about signals at https://millermedeiros.github.io/js-signals/
 */

/**
 * Notes : though useSignalTower is named as a hook, it is not actually a hook.
 *   • it can be used as a hook, but it can also be used in any non-React code.
 * Usage patterns :
 * 1. when you only need the latest state on first render (because the data is non-volatile):
 *   const { appDataReceived } = useSignalTower();
 *   let appData;
 *   appDataReceived.addOnce( data => appData = data );
 *   // you are guaranteed the latest appData beyond this point
 *
 * 2. when you need to listen to the signal for every update and re-render when data changes:
 *   const { slideRequested } = useSignalTower();
 *   const [ slide, setSlide ] = useState<Slide | null>( null );
 *   useEffect( () => {
 *     slideRequested.add( setSlide );
 *     // on unmount the listener is removed (not totally necessary, but good hygiene)
 *     return () => slideRequested.remove( setSlide );
 *   }, [] );
 */

export type SignalTower = {
  appDataReceived: signals.Signal;
  slideRequested: signals.Signal;
  windowFocusChanged: signals.Signal;
}

export function getSignal( name : string, logLevel = 1 ) : signals.Signal {
  const signal = new signals.Signal();

  signal.memorize = true;

  if( logLevel > 0 ) {
    signal.add( ( ...args ) => {
      logLevel === 1 && logger.log( `signal dispatched : ${name}` );
      logLevel === 2 && logger.log( `signal dispatched : ${name}\n\twith args`, { ...args } );
    } );
  }

  return signal;
}

const signalTower = {
  appDataReceived : getSignal( 'appDataReceived', 2 ),
  slideRequested : getSignal( 'slideRequested', 2 ),
  windowFocusChanged : getSignal( 'windowFocusChanged', 2 ),
};

window.signalTower = signalTower;

export const useSignalTower = () : SignalTower => signalTower;
