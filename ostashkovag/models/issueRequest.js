const sequelize = require('../utils/database');
const { Model, DataTypes } = require('sequelize');
const User = require('./user');

const IssueRequest = sequelize.define('IssueRequest', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allonNull: false
    },
    description: {
        type: DataTypes.STRING,
        allonNull: false
    },
    id_user: {
        type: DataTypes.INTEGER,
        allonNull: false
    },
    isClosed: {
        type: DataTypes.BOOLEAN,
        allonNull: false
    } 
}, {
    timestamps: false,
});

User.hasMany(IssueRequest, {foreignKey: 'id_user'});
IssueRequest.belongsTo(User, {foreignKey: 'id_user'});

sequelize.sync();

module.exports = IssueRequest;