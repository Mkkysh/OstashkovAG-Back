const Sequelize = require('sequelize');

const sequelize = new Sequelize('Ostashkov-ag', 
    'postgres', 'root', {
    host: 'localhost',
    dialect: 'postgres'
  });
  
module.exports = sequelize;