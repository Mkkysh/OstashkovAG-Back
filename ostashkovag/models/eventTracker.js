const sequelize = require('../utils/database');
const { Model, DataTypes } = require('sequelize');
const Event = require('../models/event');
const User = require('../models/user');

const EventUserTracking = sequelize.define('EventUserTracking', {
    id_event: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Event,
            key: 'id'
        }
    },
    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: User,
            key: 'id'
        }
    }
},
{
    timestamps: false,
});

// Event.belongsToMany(User, {through: EventUserTracking,
//     foreignKey: 'id_event'});
// User.belongsToMany(Event, {through: EventUserTracking,
//     foreignKey: 'id_user'});

// sequelize.sync();

// EventUserTracking.sync({alter: true});

module.exports = EventUserTracking;