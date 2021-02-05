import Component from '@ember/component';
import fetch from 'fetch';
import { computed } from '@ember/object'; // eslint-disable-line
import { timeout } from 'ember-concurrency';
import { getOwner } from '@ember/application';
import { Promise } from 'rsvp';
import { task } from 'ember-concurrency';
import layout from '../templates/components/labs-search';

const DEBOUNCE_MS = 100;

export default Component.extend({
  init() {
    this._super(...arguments);

    const {
      host = 'https://search-api-production.herokuapp.com',
      route = 'search',
      helpers = ['geosearch', 'city-map-street-search', 'city-map-alteration'],
    } = getOwner(this).resolveRegistration('config:environment')['labs-search'] || {};

    this.setProperties({
      typeTitleLookup: {
        lot: 'Lot',
      },
      currResults: [],
      host: host,
      route: route,
      helpers: helpers,
    })
  },

  classNames: ['labs-geosearch'],

  onSelect() {},

  onHoverResult() {},

  onHoverOut() {},

  onClear() {},

  results: computed('searchTerms', function() {
    const searchTerms = this.get('searchTerms');

    return this.get('debouncedResults').perform(searchTerms);
  }),

  resultsCount: computed('results.value', function() {
    const results = this.get('results.value');
    if (results) return results.length;
    return 0;
  }),

  endpoint: computed('searchTerms', function() {
    const searchTerms = this.get('searchTerms');
    const host = this.get('host');
    const route = this.get('route');
    const helpers = this.get('helpers').map(string => `helpers[]=${string}&`).join('');

    return `${host}/${route}?${helpers}q=${searchTerms}`;
  }),

  host: 'https://search-api.planninglabs.nyc',
  route: 'search',

  searchPlaceholder: 'Search...',
  searchTerms: '',
  layout: layout,
  selected: 0,
  _focused: false,

  loading: null,

  debouncedResults: task(function* (searchTerms) {
    if (searchTerms.length < 2) this.cancel();
    yield timeout(DEBOUNCE_MS);
    const URL = this.get('endpoint');

    this.set('loading', new Promise(function(resolve) {
      setTimeout(resolve, 500);
    }));

    const raw = yield fetch(URL);
    const resultList = yield raw.json();
    const mergedWithTitles = resultList.map((result, index) => {
      const mutatedResult = result;
      mutatedResult.id = index;
      mutatedResult.typeTitle = this.get(`typeTitleLookup.${result.type}`) || 'Result';
      return mutatedResult;
    });

    this.set('currResults', mergedWithTitles);
    this.set('loading', null);

    return mergedWithTitles;
  }).keepLatest(),

  keyPress(event) {
    const selected = this.get('selected');
    const { keyCode } = event;

    // enter
    if (keyCode === 13) {
      const results = this.get('results.value');
      if (results && results.get('length')) {
        const selectedResult = results.objectAt(selected);
        this.send('goTo', selectedResult);
      }
    }
  },

  keyUp(event) {
    const selected = this.get('selected');
    const resultsCount = this.get('resultsCount');
    const { keyCode } = event;

    const incSelected = () => { this.set('selected', selected + 1); };
    const decSelected = () => { this.set('selected', selected - 1); };

    if ([38, 40, 27].includes(keyCode)) {
      const results = this.get('results.value');

      // up
      if (keyCode === 38) {
        if (results) {
          if (selected > 0) decSelected();
        }
      }

      // down
      if (keyCode === 40) {
        if (results) {
          if (selected < resultsCount - 1) incSelected();
        }
      }

      // escape
      if (keyCode === 27) {
        this.send('clear');
        this.send('handleFocusOut');
      }
    }
  },

  actions: {
    clear() {
      this.set('searchTerms', '');
      this.get('onClear')();
    },

    goTo(result) {
      const el = document.querySelector('.map-search-input');
      const event = document.createEvent('HTMLEvents');
      event.initEvent('blur', true, false);
      el.dispatchEvent(event);
  
      this.setProperties({
        selected: 0,
        searchTerms: result.label,
        _focused: false,
        currResults: [],
      });
  
      this.get('onSelect')(result);
    },

    handleFocusIn() {
      this.set('_focused', true);
    },

    handleHoverResult(result) {
      this.get('onHoverResult')(result);
    },

    handleFocusOut() {
      this.set('_focused', false);
    },

    handleHoverOut() {
      this.get('onHoverOut')();
    },
  },
});
