const { EventUserArchive } = require('../models/index');
const Sequelize = require('sequelize');

exports.addFeedback = async (request, response) => {
        try {
            const id_event = request.params.id;
            const id_user = request.user.id;
            var { text } = request.body;
            
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

exports.deleteFeedback = async (request, response) => {
    try {

        const id_event = request.params.id;
        const id_user = request.user.id;

        await EventUserArchive.destroy({
           where: {
               id_user: id_user,
               id_event: id_event
           } 
        });

        response.status(200).send({ message: 'Отзыв удален' });
        
    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.updateFeedback = async (request, response) => {
    try {

        const id_event = request.params.id;
        const id_user = request.user.id;
        var { text } = request.body;

        await EventUserArchive.update({
            feedback: text
        },
        {
            where: {
                id_event: id_event,
                id_user: id_user
            }
        });

        response.status(200).send({message: 'Отзыв обновлен'});
        
    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}
    