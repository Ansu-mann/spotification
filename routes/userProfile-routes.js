const express = require('express');
const { updateUserProfile_and_Picture } = require('../controllers/upload-controller');
const authMiddleware = require('../middlewares/auth-middleware')
const { imageUpload } = require('../middlewares/multer-middleware')
const router = express.Router();

router.patch('/edit', authMiddleware, imageUpload, updateUserProfile_and_Picture)

module.exports = router;