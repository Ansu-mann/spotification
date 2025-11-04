const jwt = require('jsonwebtoken');
const TokenBlackList = require('../models/TokenBlackList');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access Denied. No Token Provided. Please Login to continue'
            })
        }

        if (await TokenBlackList.findOne({ token })) {
            return res.status(401).json({
                success: false,
                message: 'Session Expired! Please Login again.'
            })
        }

        // decode the token
        const decodedTokenInfo = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.userInfo = decodedTokenInfo;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid Token! Please try again'
        })
    }
}

module.exports = authMiddleware;