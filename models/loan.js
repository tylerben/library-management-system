module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define('Loan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    book_id: DataTypes.INTEGER,
    patron_id: DataTypes.INTEGER,
    loaned_on: DataTypes.DATE,
    return_by: DataTypes.DATE,
    returned_on: DataTypes.DATE,
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
