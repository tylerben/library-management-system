const moment = require('moment');

module.exports = {
  getToday() {
    return moment().format('YYYY-MM-DD');
  },
  oneWeekFromToday() {
    return moment().add(7, 'days').format('YYYY-MM-DD');
  },
};
