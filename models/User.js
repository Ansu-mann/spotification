const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    bio: {
        type: String
    },
    gender: {
        type: String,
        lowercase: true,
        enum: ['male', 'female']
    },
    profilePhotoUrl: {
        type: String
    },
    profilePhotoPublicId: {
        type: String
    }
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema);