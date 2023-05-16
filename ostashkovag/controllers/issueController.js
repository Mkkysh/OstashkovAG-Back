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
