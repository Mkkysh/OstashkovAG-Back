const EventRequest = require('../models/eventRequest');
const User = require('../models/user');

exports.addEventRequest = async (request, response) => {
    try {
        
        const id_user = request.user.id;

        const { text } = request.body;
        const data = {
            text: text,
            id_user: id_user,
            status: 'в ожидании'
        }

        await EventRequest.create(data);

        response.status(200).json({message: 'Заявка добавлена'});

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.getEventRequest = async (request, response) => {
    try {

        const { status } = request.query;

        const filter = {};

        if(status) filter.status = status;

        console.log(filter);

        const eventRequest = await EventRequest.findAll({
            include: [{
                model: User,
                attributes: ['name']
            }],
            where: filter
        });

        response.status(200).json(eventRequest);
        
    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.updateStatus = async (request, response) => {
    try {
        
        const id = request.params.id;

        const { status } = request.body;

        await EventRequest.update({status: status},{
            where: {
                id: id
            }
        });

        response.status(200).json({message: 'Заявка обновлена'});

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

