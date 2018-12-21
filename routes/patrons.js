const express = require('express');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const util = require('../util');
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

const router = express.Router();

/* GET Patrons home page. */
router.get('/', (req, res) => {
  Patron.findAll()
    .then((patrons) => {
      res.render('patrons/patrons', { patrons, title: 'Library Manager | View Patrons'})
    })
    .catch((err) => {
      res.send(500);
      throw err;
  });
});

/* GET add new patron page. */
router.get('/new', (req, res) => {
  Patron.findAll()
    .then((patrons) => {
      res.render('patrons/new_patron', { patron: Patron.build(), title: 'Library Manager | New Patron' });
    })
    .catch((err) => {
      res.send(500);
      throw err;
    });
});

/* POST create patron. */
router.post('/', (req, res) => {
  Patron.create(req.body).then(() => {
    res.redirect('/patrons');
  }).catch((err) => {
    if (err.name === 'SequelizeValidationError') {
      Patron.findAll()
        .then((patrons) => {
          res.render('patrons/new_patron', { 
            patron: Patron.build(req.body), 
            title: 'Library Manager | New Patron',
            errors: err.errors 
          });
        })
        .catch((err) => {
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

// /* GET individual book aka book details page. */
// router.get('/:id', (req, res) => {

//   const loansRequest = Loan.findAll({
//     where: { book_id: req.params.id },
//     include: [{
//       model: Patron
//     }],
//   });

//   const bookRequest = Book.findByPk(req.params.id);

//   Promise.all([loansRequest, bookRequest])
//     .then((results) => {
//       if (results) {        
//         const loans = results[0];
//         const book = results[1];        
//         res.render('books/book_detail', { book, title: book.title, loans });
//       } else {
//         res.send(404);
//       }
//     })
//     .catch((err) => {
//       res.send(500);
//       throw err;
//     });
// });

// /* PUT update article. */
// router.put('/:id', (req, res, next) => {
//   Book.findByPk(req.params.id).then((book) => {
//     if (book) {
//       return book.update(req.body);
//     }
//     res.send(404);
//   }).then((book) => {
//     res.redirect('/books');
//   }).catch((err) => {
//     if (err.name === 'SequelizeValidationError') {
//       const book = Book.build(req.body);
//       book.id = req.params.id;      
//       res.render('books/book_detail', {
//         book, 
//         title: book.title,
//         errors: err.errors,
//       });
//     } else {
//       throw err;
//     }
//   }).catch((err) => {
//     res.send(500);
//   });   
// });

module.exports = router;
