const { Event, EventPhoto, User, EventUserArchive } = require('../models/index');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const fs = require('fs');
const { log } = require('console');

exports.getEvents = async (request, response)=>{

    var {page, type, search, isarchive, 
        sortDir, date, sort} = request.query;
    page = !page ? 0 : page;
    const countEvents = 2;

    var filter = {};
    if (type) filter.type = type; 
    if (isarchive!==undefined) filter.isarchive = isarchive;
    
    var dateFilter = date ? [ 
        Sequelize.where(Sequelize.fn('DATE', 
            Sequelize.col('datebegin')), '<=', date),
        Sequelize.where(Sequelize.fn('DATE', 
            Sequelize.col('datefinal')), '>=', date) ] : [];

    if (search) search = search.split(' ').map(el => {return {
        name: {
            [Op.iLike]: '%' + el + '%'
            }}
    });
    else search = [];

    var order = []; if(sort) order.push(sort); else order.push('datebegin');
    if(sortDir) order.push(sortDir); else order.push('DESC');

    try {
        const {count, rows} = await Event.findAndCountAll({
            where: {...filter,
                [Op.and]: [...search, ...dateFilter]
            },
            include: [{
                model: EventPhoto,
                attributes: ['name'],
                where: {
                    is_archive: false
                }
            }],
            limit: countEvents,
            offset: page * countEvents,
            order: [
                order
            ],
            raw: true
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
        }}
    });

    try {
        const event = await Event.findAll({
            where:{
                [Op.and]:text,
            },
            attributes: ['name']
        });
        response.status(200).json(event);
      } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.addEvent = async (request, response)=>{
    
    try{
        var photo = request.files.pic[0].filename;
        var data = JSON.parse(request.body.data);

        var { name, description, 
            datebegin, datefinal, address, type } = data;
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
        console.log(err);

        try {
            fs.unlink('./uploads/' + photo, (err) => {
                console.log(err);
            });
        } catch (error) {
            console.log(err);
        }
        finally{
            response.status(500).json({ message: 'Ошибка сервера' });
        }
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
            },
            {
                model: User,
                attributes: ['name'],
                through: {
                    model: EventUserArchive,
                    attributes: ['feedback'],
                    as: 'user_feedback',
                },
            }],
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

exports.deletePhotoRecord = async (request, response)=>{
    try {
        
        const name = request.params.name;

        fs.unlink('./uploads/' + name, (err) => {
            if (err) return;
        });

        await EventPhoto.destroy({
           where: {
               name: name
           } 
        });

        response.status(200).json({message: 'Фото успешно удалено'});
        
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
           },
           include: [{
               model: EventPhoto,
               attributes: ['name']
           }] 
        });

        event.EventPhotos.forEach(element => {
            fs.unlink('./uploads/' + element.name, (err) => {
                if (err) return;
            });
        });

        await event.destroy();

        response.status(200).json({message: 'Событие успешно удалено'});

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}
