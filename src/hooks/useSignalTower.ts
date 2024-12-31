import { useEffect } from 'react';
import signals from 'signals';
import * as logger from '../utils/logger.ts';


interface ExtendedSignal extends signals.Signal {
  originalDispatch: (...args: any[]) => void;
}

const dispatchQueue: { signal: ExtendedSignal, args: any[] }[] = [];

export function getSignal( name : string, logLevel = 1 ) : signals.Signal {
  let signal : ExtendedSignal = new signals.Signal() as ExtendedSignal;
  signal.memorize = true; // subsequent calls to add or addOnce will trigger the listener with the last arguments that were dispatched

  signal.originalDispatch = signal.dispatch.bind(signal);

  signal.dispatch = (...args: any[]) => {
    dispatchQueue.push({signal, args});
  };

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

export const useSignalTower = () => {
  useEffect(() => {
    const flushQueue = () => {
      while (dispatchQueue.length > 0) {
        const { signal, args } = dispatchQueue.shift()!;
        signal.originalDispatch(...args);
      }
    };

    flushQueue();
  }, []);

  return signalTower;
};
