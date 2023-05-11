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