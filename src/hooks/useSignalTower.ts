import signals from 'signals';
import * as logger from '../utils/logger.ts';

/**
 * SignalTower is a collection of signals that can be used to communicate between components and non-React code
 * signals can be dispatched with an arbitrary number and type of arguments
 * signal.memorize is a signals.js feature that allows the signal to remember the last arguments that were dispatched
 * and trigger the listener with the last arguments when a new listener is added.
 * signal methods include :
 * • add( listener : Function ) : void
 * • addOnce( listener : Function ) : void
 * • remove( listener : Function ) : void
 * • removeAll() : void
 * • dispatch( ...args : any[] ) : void
 *
 * Read more about signals at https://millermedeiros.github.io/js-signals/
 */


export function getSignal( name : string, logLevel = 1 ) : signals.Signal {
  let signal = new signals.Signal();

  signal.memorize = true;

  if( logLevel > 0 ) {
    signal.add( ( ...args ) : void => {
      logger.log( 'signal dispatched : ' + name );
      if( logLevel === 2 ) logger.log( '\twith args : ', { ...args } );
    } );
  }

  return signal;
}

const signalTower = {
  slideRequested : getSignal( 'slideRequested' ),
  // add more signals needed by the application here
};

export const useSignalTower = () => signalTower;
