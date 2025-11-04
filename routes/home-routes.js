const express = require('express');
const authMiddleware = require('../middlewares/auth-middleware')
const router = express.Router();

router.get('/welcome', authMiddleware, (req, res) => {
    const {userId, username, role} = req.userInfo
    res.json({
        message: 'Welcome to the home page !!!',
        user: {
            _id: userId,
            username,
            role
        }
    })
})

module.exports = router;