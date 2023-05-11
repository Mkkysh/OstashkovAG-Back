const Event = require('../models/event');
const MediaStorage = require('../models/mediaStorage');
const MediaStorageEvent = require('../models/mediaStorageEvent');

exports.getFutureEvent = async (request, response)=>{
    try {
        const events = await Event.findAll({
            where:{
                isarchive: false,
            },
            include: [{
                model: MediaStorage,
                through: { 
                    where: {
                        order_rows: 1
                    },
                    attributes: ['order_rows']
                 },
                 attributes: ['name']
            }]
        });
        response.status(200).json(events);
      } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
      }
}

exports.getPastEvent = async (request, response)=>{

    var {page, type} = request.query;
    page = !page ? 0 : page;
    const countEvents = 3;

    conditions = {
        isarchive: true,
    };
    if (type) conditions.type = type;

    try {
        const {count, rows} = await Event.findAndCountAll({
            where: conditions,
            distinct: true,
            include: [{
                model: MediaStorage,
                through: { 
                    attributes: ['order_rows']
                 },
                 attributes: ['name']
            }],
            limit: countEvents,
            offset: page * countEvents,
            order: [
                ['datebegin', 'DESC']
            ]
        });

        countPages = Math.ceil(count / countEvents);

        response.status(200).json({events: rows, 
            countPages: countPages});
      } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}