const sequelize = require('../utils/database');
const { Model, DataTypes } = require('sequelize');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    datebegin:{
        type: DataTypes.DATE,
        allowNull: false
    },
    datefinal:{
        type: DataTypes.DATE,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isarchive: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    timestamps: false,
});

// sequelize.sync();

// Event.sync({alter: true});

module.exports = Event;
