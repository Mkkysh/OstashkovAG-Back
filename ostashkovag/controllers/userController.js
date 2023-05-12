const User = require('../models/user');
const Event = require('../models/event');
const EventUserArchive = require('../models/eventFeedback');
const Sequelize = require('sequelize');

exports.addFeedback = async (request, response) => {
    const id_event = request.params.id;
    const id_user = response.locals.id;
    var { text } = request.body;

    try {
        
        const newFeedback = {
            feedback: text,
            date: Sequelize.literal('NOW()'),
            id_event: id_event,
            id_user: id_user
        }

        await EventUserArchive.create(newFeedback);

        response.status(200).send({
            message: 'Отзыв добавлен'
        });

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
      }
}