import Component from '@ember/component';
import layout from '../templates/components/labs-bbl-lookup';
import carto from 'cartobox-promises-utility/utils/carto';

export default Component.extend({
  init() {
    this._super(...arguments);

    this.set('boroOptions', [
      { name: 'Manhattan (1)', code: '1' },
      { name: 'Bronx (2)', code: '2' },
      { name: 'Brooklyn (3)', code: '3' },
      { name: 'Queens (4)', code: '4' },
      { name: 'Staten Island (5)', code: '5' },
    ]);
  },

  classNames: ['bbl-lookup hide-for-print'],
  layout,

  validBlock: false,
  validLot: false,

  boro: '',

  block: '',

  lot: '',

  errorMessage: '',

  closed: true,

  flyTo: null,

  actions: {
    validate() {
      const boro = this.get('boro');
      const block = this.get('block');
      const lot = this.get('lot');
  
      const validBoro = (boro !== '');
      const validBlock = ((block !== '') && (parseInt(block, 10) < 100000) && (parseInt(block, 10) > 0));
      const validLot = ((lot !== '') && (parseInt(lot, 10) < 10000) && (parseInt(lot, 10) > 0));
  
      this.set('validBlock', validBoro && validBlock);
      this.set('validLot', validBoro && validBlock && validLot);
    },

    checkLot() {
      const { boro: { code }, block, lot } = this.getProperties('boro', 'block', 'lot');
  
      const SQL = `SELECT st_centroid(the_geom) as the_geom FROM mappluto_v1711 WHERE block= ${parseInt(block, 10)} AND lot = ${parseInt(lot, 10)} AND borocode = ${code}`;
      carto.SQL(SQL, 'geojson').then((response) => {
        if (response.features[0]) {
          this.set('errorMessage', '');
          this.setProperties({
            closed: true,
          });
          this.flyTo(response.features[0].geometry.coordinates, 18);
        } else {
          this.set('errorMessage', 'The Lot does not exist.');
        }
      });
    },

    checkBlock() {
      const { boro: { code }, block } = this.getProperties('boro', 'block');
  
      const SQL = `SELECT the_geom FROM mappluto_block_centroids WHERE block= ${parseInt(block, 10)} AND borocode = ${code}`;
      carto.SQL(SQL, 'geojson').then((response) => {
        if (response.features[0]) {
          this.set('errorMessage', '');
          this.setProperties({
            closed: true,
          });
          this.flyTo(response.features[0].geometry.coordinates, 16);
        } else {
          this.set('errorMessage', 'The Block does not exist.');
        }
      });
    },

    setBorocode(option) {
      this.set('boro', option);
      this.send('validate');
    },
  },
});
