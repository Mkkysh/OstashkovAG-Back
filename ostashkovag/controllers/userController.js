const User = require('../models/user');
const Event = require('../models/event');
const EventUserArchive = require('../models/eventFeedback');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const auth = require('../utils/auth');

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

exports.getUsers = async (request, response) => {
    try{
        const users = await User.findAll();
        response.status(200).json(users);
    }
    catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.signup = async (request, response) => {
    var { name, email, password, phone} = request.body;
    try {

        checkUser = await User.findOne({
            where: {
                email: email
            }
        });
        
        if (checkUser) {
            response.status(500).json({ message: 'Пользователь уже сущесвует'});
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            phone: phone,
            role: 'user'
        });

        const tokens = await auth.generateTokens({id: user.id,
            email: user.email
        });

        user.refreshToken = tokens.refreshToken;
        user.save();

        response.cookie('refreshToken', tokens.refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpyOnly: true
        });

        response.status(200).json({
            message: 'Пользователь создан',
            tokens: tokens,
            user: user
        });

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}