import View from '../index.js';

const template = `
  <input type="text" id="name-input" placeholder="Change the name" />
  <div id="name"></div>
  <button id="load-second-page">Load Second Page</button>
`;

export default View( 'app-index', {
  template,

  bindings() {
    return {
      '#name': this.$store.state.name
    }
  },

  events: {
    'input #name-input':       'setName',
    'click #load-second-page': 'loadPage'
  },

  setName( e ) {
    this.$store.state.name = e.target.value;
  },

  loadPage() {
    this.$router.go('another');
  }
});
