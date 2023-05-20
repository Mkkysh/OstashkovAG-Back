const { response } = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.generateTokens = (payload) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m'
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d'
    });

    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    }
}

verifyAccessToken = (token) => {
    try{
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        return decoded;
    }
    catch(err){
        return null;
    }
}

exports.verifyRefreshToken = (token) => {
    try{
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        return decoded;
    }
    catch(err){
        return null;
    }
}

exports.verifyToken = (request, response, next) => {
    try {
        const header = request.headers['authorization'];
        const accessToken = header.split(' ')[1];
        if (!accessToken) {
            return response.status(401).send({ message: 'Неавторизованный доступ' });
        }
        const decoded = verifyAccessToken(accessToken);
        if (!decoded) {
            return response.status(401).send({ message: 'Неавторизованный доступ' });
        }
        request.user = decoded;
        next();
    }
    catch(err){
        console.log(err);
        return response.status(401).send({ message: 'Неавторизованный доступ' });
    }
}

exports.verifyAdminToken = (request, response, next) => {
    try {
        const header = request.headers['authorization'];
        const accessToken = header.split(' ')[1];
        if (!accessToken) {
            return response.status(401).send({ message: 'Неавторизованный доступ' });
        }
        const decoded = verifyAccessToken(accessToken);
        if (!decoded) {
            return response.status(401).send({ message: 'Неавторизованный доступ' });
        }

        if (decoded.role !== 'admin') {
            return response.status(401).send({ message: 'Неавторизованный доступ' });
        }

        request.user = decoded;
        next();
    }
    catch(err){
        console.log(err);
        return response.status(401).send({ message: 'Неавторизованный доступ' });
    }
}