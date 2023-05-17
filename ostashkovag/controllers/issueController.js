const IssueRequest = require('../models/issueRequest');
const User = require('../models/user');


exports.addIssueRequest = async (request, response) => {
    try {
        const id = request.user.id;
        const data = request.body;
        const issueRequest = await IssueRequest.create({...data, 
            id_user: id, isClosed: false});
        response.status(200).json({message: 'Заявка добавлена'});

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    } 
}

exports.getIssueRequest = async (request, response) => {
    try {
        var { isClosed } = request.query;

        const filter = {};

        if(isClosed != undefined) filter.isClosed = isClosed;
        
        const issueRequest = await IssueRequest.findAll({
           include: [{
               model: User,
               attributes: ['name']
           }],
           where: filter
        });

        response.status(200).json(issueRequest);

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.CloseIssue = async (request, response) => {
    try {

        const id = request.params.id;

        await IssueRequest.update({isClosed: true},{
            where: {
                id: id
            }
        });

        response.status(200).json({message: 'Заявка закрыта'});
        
    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Ошибка сервера' });     
    }
}

