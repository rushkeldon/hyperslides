/**
 * useSignalTower provides a data store with signals for communication between any components of a web app (React or otherwise).
 * While it is written as a React hook, it is not and can be used in non-React code.
 * Signals are like events, but faster and more type safe.
 * See https://millermedeiros.github.io/js-signals/ for more info.
 * window.signalTower is added for easy access globally.
 * The goal of this library is to be a Redux replacement - a full data store.
 * It has these features :
 * - unidirectional data flow
 * - signals for communication between components (React or otherwise)
 * - payloads are immutable - only dispatching a signal can change that signal's payload
 * - logging levels for each signal
 * - setting log level for all signals : setLogLevel( 2 );
 * - resetting all signals logging level to their original levels : setLogLevel();
 * - hydration of both signals and their payloads from a JSON string or object (as returned by getState)
 *   - note that hydration will not populate the signals' transform function, but they can be set one by one
 * - getState returns the last payload of all signals as an object or JSON string
 * - when a signal is created / added it can specify an initialPayload
 * - if the signal has a transform function declared then
 *   - the initialPayload is transformed before being stored
 *   - all listeners are passed the transformed payload
 **/

/**
 * Signals can be dispatched and/or subscribed to from anywhere in the app
 * subscribe / unsubscribe usage patterns by case :
 * case :
 *   - In a react component
 *   - The signal will only be dispatched once
 *   ```
 *   const { signalName } = useSignalTower();
 *   signalName.addOnce( ( payload ) => { // do stuff } );  // called once and then unsubscribed from the signal - called every re-render and lastPayload is passed immediately
 *   ```
 * case :
 *  - In a react component
 *  - The signal will be dispatched multiple times and the component needs to be re-rendered each time
 *  ```
 *  const { signalName } = useSignalTower();
 *  const [ state, setState ] = useState( signalName.lastPayload );
 *
 *  useEffect( () => {
 *    const namedFunction = ( payload ) => setState( payload ); // causes a re-render
 *    signalName.add( namedFunction );                          // subscribe to the signal
 *    // return a cleanup function
 *    return () => signalName.remove( namedFunction );          // unsubscribe from the signal when unmounting
 *  }, [] );  // empty dep array means only run once
 *  ```
 */

import signals from 'signals';
import * as logger from '../utils/logger.ts';

declare global {
  interface Window {
    signalTower : SignalTower;
  }
}

type ExtendedSignal = signals.Signal & {
  lastPayload? : any,
  logLevel? : number,
  transform? : ( payload : any ) => any
};

type SignalTowerMethods = {
  setLogLevel : ( logLevel : number ) => void;
  getState : ( isJSON? : boolean ) => object | string;
  hydrate : ( state : object | string ) => void;
  addSignal : ( name : string, options : SignalOptions ) => ExtendedSignal;
};

// the 'built-in' signals
type SignalTowerSignals = {
  hydrated : ExtendedSignal;
}

type SignalOptions = {
  logLevel? : number;
  initPayload? : any;
  transform? : ( payload : any ) => any;
};

export type SignalTower = {
  [ key : string ] : ExtendedSignal;
} & SignalTowerMethods & SignalTowerSignals;

let storedLoggingLevels : Record<string, number> = {};

const reservedNames = [
  'addSignal',
  'getState',
  'hydrate',
  'hydrated',
  'setLogLevel'
];
const noop = () => null;


const createSignal = ( name : string, logLevel, initPayload, transform ) : ExtendedSignal => {
  const signal : ExtendedSignal = new signals.Signal() as ExtendedSignal;
  const originalDispatch = signal.dispatch.bind( signal );

  signal.lastPayload = transform !== noop && typeof transform === 'function' ?
    transform( initPayload ) : initPayload;
  signal.logLevel = logLevel;
  storedLoggingLevels[ name ] = logLevel;
  signal.memorize = true;
  signal.transform = transform;

  signal.dispatch = ( ...args : any[] ) => {
    const dispatchArgs = args.length > 1 ? args : args[ 0 ];
    const payload = signal.transform !== noop && typeof signal.transform === 'function' ?
      signal.transform( dispatchArgs ) : dispatchArgs;

    signal.lastPayload = Object.freeze( payload );
    originalDispatch( payload );
    switch( signal.logLevel ) {
      case 1:
        logger.log( `signal dispatched : ${name}` );
        break;
      case 2:
        logger.log( `signal dispatched : ${name}\n\twith args`, { ...args } );
        break;
    }
  };
  return signal;
};


const signalTower = {
    // sets or resets (-1) the logging level of all signals in the signalTower
    setLogLevel : ( logLevel : number = -1 ) => {
      Object.keys( signalTower ).forEach( ( key ) => {
        const signal = signalTower[ key ] as ExtendedSignal;
        if( signal.hasOwnProperty( 'logLevel' ) ) {
          signal.logLevel = logLevel !== -1 ? logLevel : storedLoggingLevels[ key ] ?? 0;
        }
      } );
    },
    // returns the lastPayload of all signals in the signalTower as an object or JSON string
    getState : ( isFormatJSON = false ) => {
      try {
        const state : Record<string, any> = {};

        Object.keys( signalTower ).forEach( ( key ) => {
          const signal = signalTower[ key ] as ExtendedSignal;
          if( signal.hasOwnProperty( 'lastPayload' ) ) {
            state[ key ] = {
              logLevel : signal.logLevel,
              lastPayload : signal.lastPayload
            };
          }
        } );

        return isFormatJSON ? JSON.stringify( state, null, 2 ) : state;
      } catch( e ) {
        logger.error( 'signalTower.getState error', e );
        throw new Error( 'Failed to get state from signalTower' );
      }
    },
    // hydrates signals and their payloads from a JSON string or object (as returned by getState)
    // note : does NOT hydrate the transform function - a transform function can be set on each signal
    hydrate : ( state : object | string ) => {
      try {
        const parsedState = typeof state === 'string' ? JSON.parse( state ) : state;

        Object.keys( parsedState ).forEach( ( key ) => {
          const signalInfo = parsedState[ key ];
          const signal : ExtendedSignal = signalTower.addSignal( key, {
            logLevel : signalInfo.logLevel,
            initPayload : signalInfo.lastPayload,
            transform : typeof state === 'object' &&
            typeof signalInfo.transform === 'function' ? signalInfo.transform : noop
          } );
          signal.dispatch( signalInfo.lastPayload );
        } );
      } catch( e ) {
        logger.error( 'signalTower.hydrate error', e );
        throw new Error( 'Failed to hydrate signalTower' );
      }
    },
    // adds a signal to the signalTower (if not pre-existing) and returns it (or the pre-existing signal)
    addSignal : ( name : string, options : SignalOptions ) : ExtendedSignal => {
      try {
        if( !name ) throw new Error( 'Signal name is required' );
        if( reservedNames.includes( name ) ) throw new Error( `Signal name ${name} is reserved` );
        if( signalTower[ name ] ) return signalTower[ name ];

        return signalTower[ name ] = createSignal( name, options.logLevel, options.initPayload, options.transform );
      } catch( e ) {
        logger.error( 'signalTower.addSignal error', e );
        throw new Error( `Failed to add signal: ${name}` );
      }
    },
    hydrated : createSignal( 'hydrated', 2, undefined, noop )
  }
;

window.signalTower = signalTower as SignalTower;
export const useSignalTower = () : SignalTower => signalTower as SignalTower;

/*region adding signals here to keep this file the signals one stop shop */

signalTower.addSignal( 'appDataReceived', { logLevel : 2 } );
signalTower.addSignal( 'slideRequested', { logLevel : 2 } );
signalTower.addSignal( 'windowFocusChanged', { logLevel : 2 } );

// Example of adding a signal with initPayload and transform options
signalTower.addSignal( 'colorArrayChanged', {
  logLevel : 2,
  initPayload : [ 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet' ],
  transform : ( arr : string[] ) : string[] => arr.sort()
} );

/*endregion */

