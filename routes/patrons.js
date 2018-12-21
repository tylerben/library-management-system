const express = require('express');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const util = require('../util');
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;

const router = express.Router();

/* GET Patrons home page. */
router.get('/p/:page', (req, res) => {
  const page = parseInt(req.params.page);
  const offset = (page * 10) - 10;
  Patron.findAll()
    .then((patrons) => {
      const totalPages = Math.ceil(patrons.length/10)+1;
      res.render('patrons/patrons', { 
        patrons: patrons.splice(offset, 10),
        totalPages,
        activePage: page,
        pagination: true,
        title: 'View Patrons',
      });
    })
    .catch((err) => {
      res.send(500);
      throw err;
  });
});

/* GET patrons search page. */
router.post('/search', (req, res) => {
  const searchTerm = req.body.search_term.toLowerCase();
  Patron.findAll({
    where: {
      [Op.or]: [
        {
          first_name: { [Op.like]: `%${searchTerm}%` },
        },
        {
          last_name: { [Op.like]: `%${searchTerm}%` },
        },
        {
          address: { [Op.like]: `%${searchTerm}%` },
        },
        {
          email: { [Op.like]: `%${searchTerm}%` },
        },
        {
          library_id: { [Op.like]: `%${searchTerm}%` },
        },
        {
          zip_code: { [Op.like]: `%${searchTerm}%` },
        },
      ],
    },
  }).then((patrons) => {
    res.render('patrons/patrons', {
      patrons,
      pagination: false,
      title: 'View Patrons',
    });
  }).catch((err) => {
    res.send(500);
    throw err;
  });
});

/* GET add new patron page. */
router.get('/new', (req, res) => {
  Patron.findAll()
    .then((patrons) => {
      res.render('patrons/new_patron', { patron: Patron.build(), title: 'New Patron' });
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
            title: 'New Patron',
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

/* GET individual patron aka patron details page. */
router.get('/:id', (req, res) => {
  const loansRequest = Loan.findAll({
    where: { patron_id: req.params.id },
    include: [
      { model: Patron },
      { model: Book },
    ],
  });
  const patronRequest = Patron.findByPk(req.params.id);

  Promise.all([loansRequest, patronRequest])
    .then((results) => {
      if (results) {        
        const loans = results[0];
        const patron = results[1];        
        res.render('patrons/patron_detail', { patron, title: `${patron.first_name} ${patron.last_name}`, loans });
      } else {
        res.send(404);
      }
    })
    .catch((err) => {
      res.send(500);
      throw err;
    });
});

/* PUT update patron. */
router.put('/:id', (req, res, next) => {
  Patron.findByPk(req.params.id).then((patron) => {
    if (patron) {
      return patron.update(req.body);
    }
    res.send(404);
  }).then((patron) => {
    res.redirect('/patrons');
  }).catch((err) => {
    if (err.name === 'SequelizeValidationError') {
      const loansRequest = Loan.findAll({
        where: { patron_id: req.params.id },
        include: [
          { model: Patron },
          { model: Book },
        ],
      });
      const patronRequest = Patron.findByPk(req.params.id);
      Promise.all([loansRequest, patronRequest])
        .then((results) => {
          if (results) {        
            const loans = results[0];
            const patron = Patron.build(req.body);
            patron.id = req.params.id;         
            res.render('patrons/patron_detail', { 
              patron, 
              title: `${patron.first_name} ${patron.last_name}`, 
              loans,
              errors: err.errors,
            });
          } else {
            res.send(404);
          }
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
  });   
});

module.exports = router;
