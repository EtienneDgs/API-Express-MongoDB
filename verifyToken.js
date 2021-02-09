const jwt = require('jsonwebtoken');
const blackListedTokens = require('./app.js').blackListedTokens;

module.exports = function (req, res, next) {
    console.log('blackListedTokens : ', blackListedTokens);
    const token = req.header('auth-token');

    const found = blackListedTokens.find(element => element === token);
    if (found) {
        return res.status(401).send('Please Login');
    }

    if (!token) {
        return res.status(401).send('Access Denied');
    }

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};