const express = require('express')
const authMiddleware = require('../middlewares/auth-middleware')
const adminMiddleware = require('../middlewares/admin-middleware')
const router = express.Router()

router.get('/admin', authMiddleware, adminMiddleware, (req, res) => {
    res.json({
        message: 'Welcome to the Admin Page'
    })
})

module.exports = router