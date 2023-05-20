const Sequelize = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DATABASE_NAME, 
    process.env.DATABASE_USER, 
    process.env.DATABASE_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres',
    timezone: '+03:00',
    dialectOptions: { // for reading
       useUTC: false,
      //timezone: '+03:00',
    },
});
  
module.exports = sequelize;