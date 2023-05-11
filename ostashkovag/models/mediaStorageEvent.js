const sequelize = require('../utils/database');
const MediaStorage = require('../models/mediaStorage');
const Event = require('../models/event');

const { Model, DataTypes } = require('sequelize');

const MediaStorageEvent = sequelize.define('MediaStorageEvent', {
    order_rows:{
        type: DataTypes.INTEGER,
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
    id_media:{
        type: DataTypes.INTEGER,
        primarykey: true,
        references: {
            model: MediaStorage,
            key: 'id'
        }
    }
}, {
    freezeTableName: true,
    timestamps: false
});

Event.belongsToMany(MediaStorage, {through: MediaStorageEvent,
    foreignKey: 'id_event'});

MediaStorage.belongsToMany(Event, {through: MediaStorageEvent, 
    foreignKey: 'id_media'});

sequelize.sync();

module.exports = MediaStorageEvent;