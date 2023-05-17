const sequelize = require('../utils/database');
const { Model, DataTypes } = require('sequelize');
const User = require('./user');

const EventRequest = sequelize.define('EventRequest', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    }
    
}, {
    timestamps: false,
});

User.hasMany(EventRequest, {foreignKey: 'id_user'});
EventRequest.belongsTo(User, {foreignKey: 'id_user'});

sequelize.sync();

EventRequest.sync({alter: true});

module.exports = EventRequest;