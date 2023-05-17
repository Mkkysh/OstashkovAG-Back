const Sequelize = require('sequelize');
const { New } = require('../models/index');

exports.addNew = async (request, response) => {
    try {
        var {title, text, type} = request.body;
        const dataNew = {
            title: title,
            text: text,
            type: type,
            date: Sequelize.literal('NOW()')
        };

        const Nnew = await New.create(dataNew);
        response.status(200).json({message: 'Новость добавлена'});

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.updateNew = async (request, response) => {
    try {
        const id = request.params.id;
        const data = request.body;

        await New.update(data,{
            where: {
                id: id
            }       
        });

        response.status(200).json({message: 'Новость обновлена'});

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.getNews = async (request, response) => {
    try {   

        const news = await New.findAll({
            order: [
                ['date', 'DESC']
            ],
            limit: 10
        });

        response.status(200).json(news);
        
    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.deleteNew = async (request, response) => {
    try {
        const id = request.params.id;

        await New.destroy({
            where: {
                id: id
            }
        });

        response.status(200).json({message: 'Новость удалена'});

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}