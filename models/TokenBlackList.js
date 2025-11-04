const mongoose = require('mongoose')

const TokenBlackListSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '7d'
    }
})

module.exports = mongoose.model('TokenBlackList', TokenBlackListSchema);