const express = require('express');
const router = express.Router();

/* GET books home page. */
router.get('/', (req, res, next) => {
  res.render('all_books', { title: 'Express' });
});

module.exports = router;
