const sequelize = require('../utils/database');
const { Model, DataTypes } = require('sequelize');
const Event = require('./event');

const EventPhoto = sequelize.define('EventPhoto', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allonNull: false
    },
    id_event:{
        type: DataTypes.INTEGER,
        allonNull: false
    },
    is_archive: {
        type: DataTypes.BOOLEAN
    }
},{
    timestamps: false,
});

Event.hasMany(EventPhoto, 
        {foreignKey: 'id_event',
        onDelete: 'RESTRICT'});

EventPhoto.belongsTo(Event, {foreignKey: 'id_event'});

sequelize.sync();

module.exports = EventPhoto;