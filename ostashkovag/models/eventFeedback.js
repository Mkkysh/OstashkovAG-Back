const sequelize = require('../utils/database');
const { Model, DataTypes } = require('sequelize');
const Event = require('../models/event');
const User = require('../models/user');

const EventUserArchive = sequelize.define('EventUserArchive', {
    feedback:{
        type: DataTypes.STRING,
        allowNull: false
    },
    date:{
        type: DataTypes.DATE,
        allowNull: false
    },
    id_event:{
        type: DataTypes.INTEGER,
        primarykey: true,
        references: {
            model: Event,
            key: 'id'
        }
    },
    id_user:{
        type: DataTypes.INTEGER,
        primarykey: true,
        references: {
            model: User,
            key: 'user'
        }
    }
}, {
    freezeTableName: true,
    timestamps: false
});

Event.belongsToMany(User, {through: EventUserArchive,
    foreignKey: 'id_event'});

User.belongsToMany(Event, {through: EventUserArchive,
    foreignKey: 'id_user'});

sequelize.sync();

module.exports = EventUserArchive;