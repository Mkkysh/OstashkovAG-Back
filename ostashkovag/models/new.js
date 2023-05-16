const sequelize = require('../utils/database');
const { Model, DataTypes } = require('sequelize');

const New = sequelize.define('New', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allonNull: false  
    },
    text: {
        type: DataTypes.STRING,
        allonNull: false
    },
    date: {
        type: DataTypes.DATE,
        allonNull: false
    },
    type: {
        type: DataTypes.STRING,
        allonNull: false
    }
},{
    timestamps: false
});

sequelize.sync();

module.exports = New;