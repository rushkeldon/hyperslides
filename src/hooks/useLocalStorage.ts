export function useLocalStorage() {
  function getItem( key : string ) : any {
    const item = localStorage.getItem( key );
    try {
      return item ? JSON.parse( item ) : null;
    } catch( error ) {
      console.error( `Error parsing JSON from localStorage key "${key}":`, error );
      return null;
    }
  }

  function setItem( key : string, value : any ) : void {
    try {
      localStorage.setItem( key, JSON.stringify( value ) );
    } catch( error ) {
      console.error( `Error stringifying value for localStorage key "${ key }":`, error );
    }
  }

  return {
    getItem,
    setItem,
    removeItem : ( key : string ) => localStorage.removeItem( key ),
    clear : () => localStorage.clear()
  };
}
