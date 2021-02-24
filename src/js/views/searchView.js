// import View from './View.js';

// import icons from 'url:../../img/icons.svg';
// import { Fraction } from 'fractional';

class SearchView {
  _parentEl = document.querySelector('.search');

  getQuery() {
    const query = this._parentEl.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  _clearInput() {
    this._parentEl.querySelector('.search__field').value = '';
  }

  addHandlerSearch(handler) {
    this._parentEl.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }
}
export default new SearchView();
//export an instance of class
