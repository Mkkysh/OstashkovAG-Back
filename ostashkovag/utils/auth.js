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
