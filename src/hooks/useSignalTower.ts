import signals from 'signals';
import * as logger from '../utils/logger.ts';


export function getSignal( name : string, logLevel = 1 ) : signals.Signal {
  let signal = new signals.Signal();
  signal.memorize = true; // subsequent calls to add or addOnce will trigger the listener with the last arguments that were dispatched

  if( logLevel > 0 ) {
    signal.add( ( ...args ) : void => {
      logger.log( 'signal dispatched : ' + name );
      if( logLevel === 2 ) logger.log( '\twith args : ', { ...args } );
    } );
  }

  return signal;
}

const signalTower = {
  pageResized : getSignal( 'pageResized' ),
  slideRequested : getSignal( 'slideRequested' ),
};

export const useSignalTower = () => signalTower;
