const mongoose = require('mongoose');
const User = require('./User')

const UserProfileSchema = new mongoose.Schema({
    name: {
        type: String
    },
    bio: {
        type: String
    },
    gender: {
        type: String,
        lowercase: true,
        enum: ['male', 'female']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    userName: {
        type: mongoose.Schema.Types.String,
        ref: User
    },
    profilePhotoUrl: {
        type: String,
        required: true
    },
    profilePhotoPublicId: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('UserProfile', UserProfileSchema)