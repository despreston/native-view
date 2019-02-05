const plugins = [];

const defaults = {
  template:  '',
  bindings:  () => Object.create( null ),
  events:    Object.create( null ),
  connected: () => null
};

function generateClass( name, opts ) {
  return class ViewElement extends HTMLElement {

    static name() {
      return name;
    }

    constructor() {
      opts = { ...defaults, ...opts };

      if ( typeof opts.template !== 'string' ) {
        throw new Error('Need to include a template string');
      }

      if ( typeof opts.bindings !== 'function' ) {
        throw new Error('Bindings should be a function that returns an object.');
      }

      super();

      Object.assign( this, opts );

      this.resetTemplate( opts.template );
      this.root = this.attachShadow({ mode: 'open' });
      this.registerPlugins();
      this.resetEventHandlers();
    }

    registerPlugins() {
      plugins.forEach( plugin => plugin.install( this ) );
    }

    resetEventHandlers() {
      if ( typeof this.events !== 'object' ) {
        return;
      }

      Object.entries( this.events ).forEach( ( [ key, handler ] ) => {
        const [ type, selector ] = key.split( /\s+/ );

        if ( typeof handler === 'string' ) {
          handler = this[ handler ].bind( this );
        }

        const self = this;

        this.root.addEventListener( type, function( ev ) {
          let { target } = ev;

          while ( target && target !== this.root ) {
            if ( target.matches && target.matches( selector ) ) {
              handler.call( self, ev, target );
            }

            target = target.parentNode;
          }
        });
      });
    }

    resetTemplate( html ) {
      this.template = document.createElement('template');
      this.template.innerHTML = html;
    }

    render() {
      Object.entries( this.bindings() ).forEach( ( [ key, value ] ) => {
        const els = this.root.querySelectorAll( key );
        els.forEach( el => el.textContent = value );
      });
    }

    appendToRoot() {
      this.root.appendChild( this.template.content.cloneNode( true ) );
    }

    connectedCallback() {
      this.appendToRoot();

      if ( typeof this.connected === 'function' ) {
        this.connected();
      }

      this.render();
    }
  }
}

function View( name, opts ) {
  if ( !name || typeof name !== 'string' ) {
    throw new Error('Component must include a name in kebab-case');
  }

  const ctor = generateClass( name, opts );
  window.customElements.define( name, ctor );
  return ctor;
}

View.use = function( plugin ) {
  plugins.push( plugin );
}

export default View;
