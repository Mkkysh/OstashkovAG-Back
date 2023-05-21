require('dotenv').config();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const User = require('../models/user');
const EventUserTracking = require('../models/eventTracker');
const Event = require('../models/event');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const transporter = (() =>{
return nodemailer.createTransport({
    service: "Mail.ru",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});
} )();

cron.schedule('0 10 * * * ',  async ()=>{
    try{
            const event = await Event.findAll({
            where: Sequelize.where(Sequelize.fn('DATE', 
                Sequelize.col('datebegin')), '=', 
                Sequelize.literal('CURRENT_DATE')),

            //attributes: [Sequelize.fn('DATE', Sequelize.col('datebegin')), Sequelize.literal('Now()')],
            include: [
                {
                    model: User,
                    through: {
                        model: EventUserTracking,
                        attributes: []
                    },
                    attributes: ['name', 'email'],
                    where: {
                        name:{
                            [Op.ne]: null
                        }
                    }
                }  
            ],
            raw: true, nest:true
        });

        console.log(Sequelize.where(Sequelize.fn('DATE', 
        Sequelize.col('datebegin')), '=', 
        Sequelize.literal('CURRENT_DATE')));

        console.log(event);


    event.forEach(async (el)=>{
        console.log(el.Users.email);
        transporter.sendMail({
           from: process.env.MAIL_USER,
           to: el.Users.email,
           subject: 'Событие',
           text: `Здравствуйте, ${el.Users.name}! Не пропустите событие сегодня! Событие: ${el.name}`, 
        });
    });

    } catch(err){
        console.log(err);
    }

});

module.exports = transporter

