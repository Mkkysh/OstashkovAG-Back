const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const auth = require('../utils/auth');
const { EventUserTracking, EventUserArchive, 
    Event, User} = require('../models/index');
const { raw } = require('express');
const fs = require('fs');

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
            email: user.email,
            role: user.role
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

exports.login = async (request, response) => {
    try {
        const { email, password } = request.body;

        const user = await User.findOne({
            where: {
                email: email
            }
        });

        if (!user) {
            response.status(404).json({ message: 'Пользователь не найден' });
            return;
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            response.status(404).json({ message: 'Неверный пароль' });
            return;
        }

        const tokens = auth.generateTokens({id: user.id,
            email: user.email,
            role: user.role
        });

        user.refreshToken = tokens.refreshToken;
        user.save();

        response.cookie('refreshToken', tokens.refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpyOnly: true
        });

        response.status(200).json({
            message: 'Пользователь вошел',
            tokens: tokens,
            user: user
        });

    } catch (err) {
        
    }
}

exports.logout = async (request, response) => {
    try {
        const {refreshToken} = request.cookies;

        const user = await User.findOne({
           where: {
               refreshToken: refreshToken
           }
       });
        user.refreshToken = Sequelize.literal('NULL');
        user.save();
        response.clearCookie('refreshToken').status(200).json({
            user: user
        });

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.refresh = async (request, response) => {
    try {
        
        const {refreshToken} = request.cookies;

        if(!refreshToken){
            response.status(401).json({ message: 'Нет токена' });
            return;
        }

        const userData = await auth.verifyRefreshToken(refreshToken);
        const token = await User.findOne({
            where: {
                refreshToken: refreshToken
            }
        });

        if(!userData || !token){
            response.status(401).json({ message: 'Неавторизованный доступ' });
            return;
        }

        const user = await User.findOne({
            where: {
                id: userData.id
            }
        });

        const tokens = auth.generateTokens({id: user.id,
            email: user.email,
            role: user.role
        });

        user.refreshToken = tokens.refreshToken;
        user.save();

        response.cookie('refreshToken', tokens.refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpyOnly: true
        });

        response.status(200).json({
            message: 'Перезапись токена',
            tokens: tokens,
            user: user
        });

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.addTracking = async (request, response) => {
    try {
        const id_event = request.params.id;
        const id_user = request.user.id;
        
        await EventUserTracking.create({
            id_event: id_event,
            id_user: id_user
        });

        response.status(200).json({message: 'Трекинг добавлен'});

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.deleteTracking = async (request, response) => {
    try {

        const id_event = request.params.id;
        const id_user = request.user.id;

        await EventUserTracking.destroy({
           where: {
               id_event: id_event,
               id_user: id_user
           } 
        });
        
        response.status(200).json({message: 'Трекинг удален'});

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.getTracking = async (request, response) => {
    try {
        
        id_user = request.user.id;

        const tracking = await Event.findAll({
           include: [
               {
                model: User,
                through: EventUserTracking,
                where: {
                    id: id_user
                }
            },
           ]
        });


        response.status(200).json(tracking);

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.addPhoto = async (request, response) => {
    try {

        var photo = request.files.pic[0].filename;
        const id = request.user.id;

        await User.update({
            photo: photo
        },
        {
            where: {
                id: id
            }
        });

        response.status(200).json({message: 'Фото добавлено'});
        
    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.updateData = async (request, response) => {
    try {
        const id = request.user.id;
        const photo = request.files?.pic;

        const data = request.body.data ? JSON.parse(request.body.data) : undefined;

        if(data){
            await User.update(data,{
                where: {
                    id: id
                }
            });
        }

        console.log("photo");
        
        if(photo){
            const user = await User.findOne({
                where: {
                    id: id
                }
            });

            const oldPhoto = user.photo;
            user.photo = photo[0].filename;
            user.save();

            fs.unlink('./uploads/' + oldPhoto, (err) => {
                if (err) throw err;
            });
        }

        response.status(200).json({message: 'Данные пользователя обновлены'});

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.getUser = async (request, response) => {
    try {

        const id = request.user.id;

        const user = await User.findOne({
            where: {
                id: id
            } 
        });

        response.status(200).json(user);
        
    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}