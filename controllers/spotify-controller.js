const axios = require('axios');

// Get Spotify Access Token using Client Credentials Flow
const getSpotifyAccessToken = async () => {
    try {
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error('Spotify credentials not found in environment variables');
        }

        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('Error getting Spotify access token:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Spotify');
    }
};

// Get total number of songs in a Spotify playlist
const getPlaylistSongCount = async (req, res) => {
    try {
        const { playlistId } = req.params;

        if (!playlistId) {
            return res.status(400).json({
                success: false,
                message: 'Playlist ID is required'
            });
        }

        // Get access token
        const accessToken = await getSpotifyAccessToken();

        // Get playlist details from Spotify
        const response = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlistId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                params: {
                    fields: 'name,tracks.total,owner.display_name,description,external_urls.spotify'
                }
            }
        );

        const playlistData = response.data;

        return res.status(200).json({
            success: true,
            message: 'Playlist information retrieved successfully',
            data: {
                playlistId: playlistId,
                playlistName: playlistData.name,
                totalSongs: playlistData.tracks.total,
                owner: playlistData.owner.display_name,
                description: playlistData.description,
                spotifyUrl: playlistData.external_urls.spotify
            }
        });

    } catch (error) {
        console.error('Error fetching playlist:', error.response?.data || error.message);
        
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found. Please check the playlist ID.'
            });
        }

        if (error.response?.status === 401) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed with Spotify'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve playlist information',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get all tracks from a playlist (with pagination)
const getPlaylistTracks = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        if (!playlistId) {
            return res.status(400).json({
                success: false,
                message: 'Playlist ID is required'
            });
        }

        // Get access token
        const accessToken = await getSpotifyAccessToken();

        // Get playlist tracks from Spotify
        const response = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                params: {
                    limit: Math.min(parseInt(limit), 100), // Spotify max is 100
                    offset: parseInt(offset),
                    fields: 'total,items(track(name,artists(name),album(name),duration_ms,external_urls.spotify))'
                }
            }
        );

        const tracks = response.data.items.map((item, index) => ({
            position: parseInt(offset) + index + 1,
            name: item.track.name,
            artists: item.track.artists.map(artist => artist.name).join(', '),
            album: item.track.album.name,
            duration: Math.floor(item.track.duration_ms / 1000), // in seconds
            spotifyUrl: item.track.external_urls.spotify
        }));

        return res.status(200).json({
            success: true,
            message: 'Playlist tracks retrieved successfully',
            data: {
                total: response.data.total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                tracks: tracks
            }
        });

    } catch (error) {
        console.error('Error fetching playlist tracks:', error.response?.data || error.message);
        
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found. Please check the playlist ID.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve playlist tracks',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getPlaylistSongCount,
    getPlaylistTracks
};
