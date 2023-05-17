const sequelize = require('../utils/database');
const { Model, DataTypes } = require('sequelize');

const User = sequelize.define('User', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allonNull: false
    },
    email: {
        type: DataTypes.STRING,
        allonNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allonNull: false
    },
    password: {
        type: DataTypes.STRING,
        allonNull: false
    },
    role: {
        type: DataTypes.STRING,
        allonNull: false
    },
    photo:{
        type: DataTypes.STRING
    },
    refreshToken: {
        type: DataTypes.STRING
    }
},{
    timestamps: false,
});

// sequelize.sync();

// User.sync({alter: true});

module.exports = User;