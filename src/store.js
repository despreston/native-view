export default class Store {

  constructor({ state = {}, debug = false }) {
    this.state        = this.resetState( state );
    this.debug        = debug;
    this._subscribers = [];
  }

  resetState( state ) {
    const self = this;

    return new Proxy( state, {
      set( state, key, value ) {
        state[ key ] = value;

        if ( self.debug ) {
          console.log(`State change: ${ key }: ${ value }`);
        }

        self.emitChange( self.state );

        return true;
      }
    });
  }

  subscribe( fn ) {
    this._subscribers.push( fn );
  }

  emitChange( newState ) {
    this._subscribers.forEach( sub => sub( newState ) );
  }

}
