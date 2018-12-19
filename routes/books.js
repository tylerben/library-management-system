const express = require('express');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const util = require('../util');
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

const router = express.Router();

/* GET books home page. */
router.get('/', (req, res) => {
  Book.findAll().then((books) => {
    res.render('books/books', { books, title: 'Library Manager | View Books' });
  }).catch((err) => {
    res.send(500);
    throw err;
  });
});

/* GET books overdue page. */
router.get('/overdue', (req, res) => {
  Book.findAll({
    include: [{
      model: Loan,
      where: {
        returned_on: null,
        return_by: {
          [Op.gte]: util.getToday(),
        }
      },
    }],
  }).then((books) => {
    res.render('books/books', { books, title: 'Library Manager | View Overdue Books' });
  }).catch((err) => {
    res.send(500);
    throw err;
  });
});

/* GET books checked out page. */
router.get('/checked-out', (req, res) => {
  Book.findAll({
    include: [{
      model: Loan,
      where: {
        returned_on: null
      },
    }],
  }).then((books) => {
    res.render('books/books', { books, title: 'Library Manager | View Overdue Books' });
  }).catch((err) => {
    res.send(500);
    throw err;
  });
});

/* GET add new books page. */
router.get('/new', (req, res) => {
  res.render('books/new_book', { book: Book.build(), title: 'Library Manager | New Book' });
});

/* POST create book. */
router.post('/', (req, res) => {
  Book.create(req.body).then(() => {
    res.redirect('/books');
  }).catch((err) => {
    if (err.name === 'SequelizeValidationError') {
      res.render('books/new_book', {
        book: Book.build(req.body),
        errors: err.errors,
      });
    } else {
      throw err;
    }
  }).catch((err) => {
    res.send(500);
    throw err;
  });
});

/* GET individual book aka book details page. */
router.get('/:id', (req, res) => {

  const loansRequest = Loan.findAll({
    where: { book_id: req.params.id },
    include: [{
      model: Patron
    }],
  });

  const bookRequest = Book.findByPk(req.params.id);

  Promise.all([loansRequest, bookRequest])
    .then((results) => {
      if (results) {        
        const loans = results[0];
        const book = results[1];        
        res.render('books/book_detail', { book, title: book.title, loans });
      } else {
        res.send(404);
      }
    })
    .catch((err) => {
      res.send(500);
      throw err;
    });
});

/* PUT update article. */
router.put('/:id', (req, res, next) => {
  Book.findByPk(req.params.id).then((book) => {
    if (book) {
      return book.update(req.body);
    }
    res.send(404);
  }).then((book) => {
    res.redirect('/books');
  }).catch((err) => {
    if (err.name === 'SequelizeValidationError') {
      const book = Book.build(req.body);
      book.id = req.params.id;      
      res.render('books/book_detail', {
        book, 
        title: book.title,
        errors: err.errors,
      });
    } else {
      throw err;
    }
  }).catch((err) => {
    res.send(500);
  });   
});

module.exports = router;
