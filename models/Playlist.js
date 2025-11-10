const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    playlistId: {
        type: String,
        required: true,
        unique: true
    },
    playlistName: {
        type: String,
        required: true
    },
    owner: {
        type: String
    },
    totalSongs: {
        type: Number,
        required: true
    },
    tracks: [{
        trackId: String,
        name: String,
        artists: String,
        album: String,
        addedAt: Date,
        position: Number
    }],
    lastChecked: {
        type: Date,
        default: Date.now
    },
    spotifyUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries
playlistSchema.index({ playlistId: 1 });
playlistSchema.index({ lastChecked: -1 });

module.exports = mongoose.model('Playlist', playlistSchema);
