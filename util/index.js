const moment = require('moment');

module.exports = {
  getToday() {
    console.log(moment().format('YYYY-MM-DD'));
    return moment().format('YYYY-MM-DD');
  },
};
