import View from '../index.js';

const template = `
  <button id="load-first-page">Load First Page</button>
`;

export default View( 'another-view', {
  template,

  events: {
    'click #load-first-page': 'loadPage'
  },

  loadPage() {
    this.$router.go('');
  }
});
