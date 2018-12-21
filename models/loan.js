module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define('Loan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    book_id: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: { msg: 'A book is required'}
      },
    },
    patron_id: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: { msg: 'A patron is required' },
      },
    },
    loaned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        isDate: { msg: 'A loan start date is required' },
      },
    },
    return_by: {
      type: DataTypes.DATEONLY,
      validate: {
        isDate: { msg: 'A return date is required' },
      },
    },
    returned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        isDate: { msg: 'A returned on date is required' },
      },
    }
  }, {
    timestamps: false,
  });
  Loan.associate = (models) => {
    // associations can be defined here
    Loan.belongsTo(models.Book, {
      foreignKey: 'book_id',
    });
    Loan.belongsTo(models.Patron, {
      foreignKey: 'patron_id',
    });
  };
  return Loan;
};
