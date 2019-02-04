let store = null;

const defaults = {
  template: '',
  bindings: () => Object.create( null )
};

function generateClass( opts ) {
  const copy = class ViewElement extends HTMLElement {
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
      this.resetEventHandlers();

      if ( store ) {
        store.subscribe( this.render.bind( this ) );
      }
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

        this.root.addEventListener( type, function( ev ) {
          let { target } = ev;

          while ( target && target !== this.root ) {
            if ( target.matches && target.matches( selector ) ) {
              handler.call( target, ev, target );
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

    connectedCallback() {
      this.root.appendChild( this.template.content.cloneNode( true ) );
      this.render();
    }
  }

  if ( opts.connectedCallback ) {
    copy.prototype.connectedCallback = opts.connectedCallback;
  }

  return copy;
}

function View( name, opts ) {
  if ( !name || typeof name !== 'string' ) {
    throw new Error('Component must include a name in kebab-case');
  }

  window.customElements.define( name, generateClass( opts ) );
}

View.setStore = function( storeInstance ) {
  store = storeInstance;
};

export default View;
