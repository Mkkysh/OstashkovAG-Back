const sequelize = require('../utils/database');
const { Model, DataTypes } = require('sequelize');

const MediaStorage = sequelize.define('MediaStorage', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
},{
    freezeTableName: true,
    timestamps: false,
});

sequelize.sync();

module.exports = MediaStorage;