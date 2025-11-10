const express = require('express');
const { checkPlaylistForChanges } = require('../services/playlist-polling-service');
const router = express.Router();

// Manual check for new songs (for testing)
router.get('/playlist/:playlistId/check', async (req, res) => {
    try {
        const { playlistId } = req.params;
        const result = await checkPlaylistForChanges(playlistId);
        
        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                newSongs: result.newSongs || [],
                playlist: result.playlist,
                emailSent: result.emailSent,
                isFirstCheck: result.isFirstCheck || false
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking playlist',
            error: error.message
        });
    }
});

module.exports = router;
