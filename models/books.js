'use strict';
module.exports = (sequelize, DataTypes) => {
  const books = sequelize.define('books', {
    id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    author: DataTypes.STRING,
    genre: DataTypes.STRING,
    first_published: DataTypes.INTEGER
  }, {});
  books.associate = function(models) {
    // associations can be defined here
  };
  return books;
};