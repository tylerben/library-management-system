const express = require('express');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const util = require('../util');
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

const router = express.Router();

/* GET loans home page. */
router.get('/', (req, res) => {
  Loan.findAll({
    include: [
      {
        model: Patron,
      },
      {
        model: Book,
      },
    ],
  }).then((loans) => {
    res.render('loans/loans', { loans, title: 'Library Manager | View Loans' });
  }).catch((err) => {
    res.send(500);
    throw err;
  });
});

/* GET overdue loans home page. */
router.get('/overdue', (req, res) => {
  Loan.findAll({
    where: {
      returned_on: null,
      return_by: {
        [Op.lt]: util.getToday(),
      },
    },
    include: [
      {
        model: Patron,
      },
      {
        model: Book,
      },
    ],
  }).then((loans) => {
    res.render('loans/loans', { loans, title: 'Library Manager | View Loans' });
  }).catch((err) => {
    res.send(500);
    throw err;
  });
});

/* GET checked out loans home page. */
router.get('/checked-out', (req, res) => {
  Loan.findAll({
    where: {
      returned_on: null,
    },
    include: [
      {
        model: Patron,
      },
      {
        model: Book,
      },
    ],
  }).then((loans) => {
    res.render('loans/loans', { loans, title: 'Library Manager | View Loans' });
  }).catch((err) => {
    res.send(500);
    throw err;
  });
});


/* GET add new loan page. */
router.get('/new', (req, res) => {
  const booksRequest = Book.findAll();
  const patronsRequest = Patron.findAll();
  const loan = Loan.build();
  loan.loaned_on = util.getToday();
  loan.return_by = util.oneWeekFromToday();

  Promise.all([booksRequest, patronsRequest])
    .then((data) => {
      const books = data[0];
      const patrons = data[1];
      res.render('loans/new_loan', {
        books,
        patrons,
        loan,
        title: 'Library Manager | New Loan',
      });
    });
});

/* POST create loan. */
router.post('/', (req, res) => {
  Loan.create(req.body).then(() => {
    res.redirect('/loans');
  }).catch((err) => {
    if (err.name === 'SequelizeValidationError') {
      const booksRequest = Book.findAll();
      const patronsRequest = Patron.findAll();
      const loan = Loan.build(req.body);      
      Promise.all([booksRequest, patronsRequest])
        .then((data) => {
          const books = data[0];
          const patrons = data[1];
          res.render('loans/new_loan', {
            books,
            patrons,
            loan,
            title: 'Library Manager | New Loan',
            errors: err.errors,
          });
        });
    } else {
      throw err;
    }
  }).catch((err) => {
    res.send(500);
    throw err;
  });
});

module.exports = router;
