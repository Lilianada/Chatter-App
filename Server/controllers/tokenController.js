// controllers/tokenController.js

const crypto = require('crypto');
const Token = require('../models/Token'); // Assuming you have a token model

exports.generateToken = async function(purpose) {
    const tokenValue = crypto.randomBytes(20).toString('hex');
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24); 

    const token = new Token({
        token: tokenValue,
        expireAt: expirationDate,
        isUsed: false,
        purpose
    });

    await token.save(); // Save the token in the database
    return token;
};

exports.verifyToken = async function(tokenValue) {
    const token = await Token.findOne({
        token: tokenValue,
        isUsed: false,
        expireAt: { $gt: new Date() } // Check that the token is not expired
    });

    if (!token) {
        throw new Error('Invalid or expired token');
    }

    // Mark the token as used
    token.isUsed = true;
    await token.save();

    return token;
};

