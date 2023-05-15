const Event = require('../models/event');
const EventPhoto = require('../models/EventPhoto');
const { Op } = require('sequelize');
const fs = require('fs');

exports.getFutureEvent = async (request, response)=>{
    console.log('getFutureEvent');
    try {
        const events = await Event.findAll({
            where:{
                isarchive: false,
            },
            include: [{
                model: EventPhoto,
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
                model: EventPhoto,
                attributes: ['name', 'is_archive'],
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

exports.findEvent = async (request, response)=>{
    var { text } = request.body

    text = text.split(' ').map(el => {return {
            name: {
                [Op.iLike]: '%' + el + '%'
            }
        };
    });

    try {
        const event = await Event.findAll({
            where:{
                [Op.and]:text
            },
            include: [{
                model: EventPhoto,
                attributes: ['name','is_archive']
            }]
        });
        response.status(200).json(event);
      } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.addEvent = async (request, response)=>{
    var data = JSON.parse(request.body.data);
    var photo = request.files.pic[0].filename;

    var { name, description, 
        datebegin, datefinal, address, type } = data;

    try{
        const newEvent = {
            name: name,
            description: description,
            address: address,
            datebegin: datebegin,
            datefinal: datefinal,
            type: type,
            isarchive: false,
        };

        const event = await Event.create(newEvent);

        const newPhoto = {
            name: photo,
            id_event: event.id,
            is_archive: false
        }

        await EventPhoto.create(newPhoto);

        response.status(200).json({message: 'Событие успешно добавлено'});

    }catch(err){
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.getEvent = async (request, response)=>{
    try {
        const id = request.params.id;
        const event = await Event.findOne({
            where: {
                id: id
            },
            include: [{
                model: EventPhoto,
                attributes: ['name','is_archive']
            }]
        });

        response.status(200).json(event);

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.updateEvent = async (request, response)=>{
    try {
        const id = request.params.id;
        const photo = request.files?.pic;

        const data = request.body.data ? JSON.parse(request.body.data) : undefined;

        if(data){
            await Event.update(data,{
                where: {
                    id: id
                }
            });
        }
        
        if(photo){
            const eventPhoto = await EventPhoto.findOne({
                where: {
                    id_event: id,
                    is_archive: false
                }
            });

            const oldPhoto = eventPhoto.name;
            eventPhoto.name = photo[0].filename;
            eventPhoto.save();

            fs.unlink('./uploads/' + oldPhoto, (err) => {
                if (err) throw err;
            });
        }

        response.status(200).json({message: 'Событие успешно обновлено'});

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.addPhotoRecord = async (request, response)=>{
    try {
        const id = request.params.id;
        var files = request.files?.pic;

        const insert = files.map(el => {
            return {
                name: el.filename,
                id_event: id,
                is_archive: true
            } 
        });

        await EventPhoto.bulkCreate(insert);

        response.status(200).json({message: 'Фото успешно добавлено'});

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.deleteEvent = async (request, response)=>{
    try {
        const id = request.params.id;

        const event = await Event.findOne({
           where: {
               id: id
           }
        });

        await event.destroy();

        response.status(200).json({message: 'Событие успешно удалено'});

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}