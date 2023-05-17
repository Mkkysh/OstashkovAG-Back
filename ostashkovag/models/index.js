const User = require('./user');
const Event = require('./event');
const EventUserArchive = require('./eventFeedback');
const EventUserTracking = require('./eventTracker');
const EventPhoto = require('./eventPhoto');
const EventRequest = require('./eventRequest');
const IssueRequest = require('./issueRequest');
const New = require('./new');

Event.belongsToMany(User, {through: EventUserArchive,
    foreignKey: 'id_event'});

User.belongsToMany(Event, {through: EventUserArchive,
    foreignKey: 'id_user'});

Event.hasMany(EventPhoto, 
        {foreignKey: 'id_event',
        onDelete: 'RESTRICT'});

EventPhoto.belongsTo(Event, 
    {foreignKey: 'id_event'});

User.hasMany(EventRequest, 
        {foreignKey: 'id_user'});
EventRequest.belongsTo(User, 
        {foreignKey: 'id_user'});

User.hasMany(IssueRequest, 
        {foreignKey: 'id_user'});
IssueRequest.belongsTo(User, 
        {foreignKey: 'id_user'});

Event.belongsToMany(User, {through: EventUserTracking,
            foreignKey: 'id_event', otherKey: 'id_user'});
User.belongsToMany(Event, {through: EventUserTracking,
            foreignKey: 'id_user', otherKey: 'id_event'});

// (async () => {
//     const tmp = await Event.describe();
//     console.log(tmp);
// })();

module.exports = {
    User,
    Event,
    EventUserArchive,
    EventUserTracking,
    EventPhoto,
    EventRequest,
    IssueRequest,
    New
}