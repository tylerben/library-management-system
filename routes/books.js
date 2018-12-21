const express = require('express');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const util = require('../util');
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

const router = express.Router();

/* GET books home page. */
router.get('/p/:page', (req, res) => {
  const page = parseInt(req.params.page);
  const offset = (page * 10) - 10;
  Book.findAll().then((books) => {
    const totalPages = Math.ceil(books.length/10)+1;
    res.render('books/books', {
      books: books.splice(offset, 10),
      totalPages,
      activePage: page,
      pagination: true,
      title: 'View Books',
    });
  }).catch((err) => {
    res.send(500);
    throw err;
  });
});

/* GET books overdue page. */
router.get('/overdue/p/:page', (req, res) => {
  const page = parseInt(req.params.page);
  const offset = (page * 10) - 10;
  Book.findAll({
    include: [{
      model: Loan,
      where: {
        returned_on: null,
        return_by: {
          [Op.lt]: util.getToday(),
        }
      },
    }],
  }).then((books) => {
    const totalPages = Math.ceil(books.length/10)+1;
    res.render('books/books', { 
      books: books.splice(offset, 10),
      totalPages,
      activePage: page,
      pagination: true,
      title: 'View Overdue Books',
    });
  }).catch((err) => {
    res.send(500);
    throw err;
  });
});

/* GET books checked out page. */
router.get('/checked-out/p/:page', (req, res) => {
  const page = parseInt(req.params.page);
  const offset = (page * 10) - 10;
  Book.findAll({
    include: [{
      model: Loan,
      where: {
        returned_on: null
      },
    }],
  }).then((books) => {
    const totalPages = Math.ceil(books.length/10)+1;
    res.render('books/books', { 
      books: books.splice(offset, 10),
      totalPages,
      activePage: page,
      pagination: true,
      title: 'View Checked Out Books',
    });
  }).catch((err) => {
    res.send(500);
    throw err;
  });
});

/* GET books listing search page. */
router.post('/search', (req, res) => {
  const searchTerm = req.body.search_term.toLowerCase();
  Book.findAll({
    where: {
      [Op.or]: [
        {
          title: { [Op.like]: `%${searchTerm}%` },
        },
        {
          author: { [Op.like]: `%${searchTerm}%` },
        },
        {
          genre: { [Op.like]: `%${searchTerm}%` },
        },
        {
          first_published: { [Op.like]: `%${searchTerm}%` },
        },
      ],
    },
  }).then((books) => {
    const totalPages = Math.ceil(books.length/10)+1;
    res.render('books/books', {
      books,
      totalPages,
      activePage: 1,
      pagination: false,
      title: 'View Books',
    });
  }).catch((err) => {
    res.send(500);
    throw err;
  });
});

/* GET add new books page. */
router.get('/new', (req, res) => {
  res.render('books/new_book', { book: Book.build(), title: 'New Book' });
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

/* PUT update book. */
router.put('/:id/edit', (req, res, next) => {
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

/* GET return books home page. */
router.get('/:id/return', (req, res) => {
  Loan.findByPk(req.params.id, {
    include: [
      { model: Book },
      { model: Patron },
    ],
  }).then((loan) => {
    loan.returned_on = util.getToday();
    res.render('books/return_book', {
      loan,
      title: 'Return Book',
    });
  }).catch((err) => {
    res.send(500);
    throw err;
  });
});

/* PUT return books home page. */
router.put('/:id/return', (req, res) => {
  Loan.findByPk(req.params.id).then((loan) => {
    if (loan) {
      return loan.update(req.body);
    }
    res.send(404);
  }).then((loan) => {
    res.redirect('/loans');
  }).catch((err) => {
    if (err.name === 'SequelizeValidationError') {
      Loan.findByPk(req.params.id, {
        include: [
          { model: Book },
          { model: Patron },
        ],
      }).then((loan) => {
        loan.id = req.params.id;
        loan.returned_on = req.body.returned_on;
        res.render('books/return_book', {
          loan,
          title: 'Return Book',
          errors: err.errors,
        });
      }).catch((err) => {
        res.send(500);
        throw err;
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
