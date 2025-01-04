import signals from 'signals';
import * as logger from '../utils/logger.ts';

/**
 * SignalTower is a collection of signals that can be used to communicate between components and non-React code
 * Signals can be dispatched with an arbitrary number and type of arguments.
 * We set the memorize flag to true which allows the signal to remember the last arguments that were dispatched
 *  and trigger any subsequently added listeners with the latest arguments immediately when added.
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
  slideRequested : getSignal( 'slideRequested', 2 ),
  appDataReceived : getSignal( 'appDataReceived', 2 ),
  // add more signals needed by the application here
};

export const useSignalTower = () => signalTower;
