const multer = require('multer')

// Use memory storage for cloud deployment
const storage = multer.memoryStorage()

const imageFileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new Error(`Only Image allowed to upload`))
    }
}

const imageUpload = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024   // 10MB
    }
}).single('image')

module.exports = { imageUpload}