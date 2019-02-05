import View from './view.js';

let routerView;

View( 'router-view', {
  connected() {
    routerView = this;
  },

  async changePath( newPath, elementName ) {
    const viewModule       = await import( newPath );
    this.root.innerHTML    = '';
    const componentForPath = document.createElement( viewModule.default.name() );
    this.root.appendChild( componentForPath );
  }
});

export default class Router {
  constructor( routes ) {
    this.routes = routes;
    this.path   = this.getPath();

    this.handleFirstPath();

    window.onpopstate = e => {
      this.go( this.getPath() );
    }
  }

  getPath() {
    return window.location.hash.split('#/').pop() || '';
  }

  async handleFirstPath() {
    await customElements.whenDefined('router-view');
    this.go( this.path );
  }

  async go( path ) {
    this.path = `/${ path }`;
    history.pushState( null, null, `#${ this.path }` );
    const routeInfo = this.routes.find( route => route.path === this.path );
    routerView.changePath( routeInfo.component );
  }

  install( viewInstance ) {
    viewInstance.$router = this;
  }
}
