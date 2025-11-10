const axios = require('axios');
const Playlist = require('../models/Playlist');
const { sendNewSongsNotification } = require('./email-service');

/**
 * Get Spotify Access Token
 */
const getSpotifyAccessToken = async () => {
    try {
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error('Spotify credentials not found');
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
        console.error('Error getting Spotify token:', error.message);
        throw error;
    }
};

/**
 * Fetch all tracks from a Spotify playlist
 */
const fetchAllPlaylistTracks = async (playlistId, accessToken) => {
    const allTracks = [];
    let offset = 0;
    const limit = 100; // Max allowed by Spotify

    try {
        // First, get playlist info
        const playlistResponse = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlistId}`,
            {
                headers: { 'Authorization': `Bearer ${accessToken}` },
                params: { fields: 'name,owner.display_name,tracks.total,external_urls.spotify' }
            }
        );

        const playlistInfo = {
            name: playlistResponse.data.name,
            owner: playlistResponse.data.owner.display_name,
            total: playlistResponse.data.tracks.total,
            spotifyUrl: playlistResponse.data.external_urls.spotify
        };

        // Fetch all tracks with pagination
        while (true) {
            const response = await axios.get(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                    params: {
                        limit,
                        offset,
                        fields: 'items(track(id,name,artists(name),album(name)),added_at),total'
                    }
                }
            );

            const items = response.data.items;
            
            items.forEach((item, index) => {
                if (item.track && item.track.id) {
                    allTracks.push({
                        trackId: item.track.id,
                        name: item.track.name,
                        artists: item.track.artists.map(a => a.name).join(', '),
                        album: item.track.album.name,
                        addedAt: new Date(item.added_at),
                        position: offset + index + 1
                    });
                }
            });

            offset += limit;
            if (offset >= response.data.total) break;
        }

        return { playlistInfo, tracks: allTracks };

    } catch (error) {
        console.error('Error fetching playlist tracks:', error.message);
        throw error;
    }
};

/**
 * Check for new songs and send notification
 */
const checkPlaylistForChanges = async (playlistId) => {
    try {
        console.log(`🔍 Checking playlist ${playlistId} for changes...`);

        // Get Spotify access token
        const accessToken = await getSpotifyAccessToken();

        // Fetch current playlist data from Spotify
        const { playlistInfo, tracks } = await fetchAllPlaylistTracks(playlistId, accessToken);

        // Find stored playlist in database
        let storedPlaylist = await Playlist.findOne({ playlistId });

        if (!storedPlaylist) {
            // First time checking this playlist - store it
            storedPlaylist = new Playlist({
                playlistId,
                playlistName: playlistInfo.name,
                owner: playlistInfo.owner,
                totalSongs: playlistInfo.total,
                tracks,
                spotifyUrl: playlistInfo.spotifyUrl,
                lastChecked: new Date()
            });
            await storedPlaylist.save();
            console.log(`✅ Playlist "${playlistInfo.name}" stored for the first time (${tracks.length} songs)`);
            return { 
                success: true, 
                message: 'Playlist stored for first time', 
                newSongs: [],
                isFirstCheck: true 
            };
        }

        // Compare tracks to find new ones
        const storedTrackIds = new Set(storedPlaylist.tracks.map(t => t.trackId));
        const newTracks = tracks.filter(track => !storedTrackIds.has(track.trackId));

        if (newTracks.length > 0) {
            console.log(`🎵 Found ${newTracks.length} new song(s) in "${playlistInfo.name}"!`);

            // Send email notification
            const emailResult = await sendNewSongsNotification(playlistInfo.name, newTracks);

            // Update stored playlist
            storedPlaylist.totalSongs = playlistInfo.total;
            storedPlaylist.tracks = tracks;
            storedPlaylist.lastChecked = new Date();
            await storedPlaylist.save();

            return {
                success: true,
                message: `Found ${newTracks.length} new song(s)`,
                newSongs: newTracks,
                emailSent: emailResult.success,
                playlist: playlistInfo
            };
        } else {
            console.log(`✅ No changes in "${playlistInfo.name}"`);
            
            // Update last checked time
            storedPlaylist.lastChecked = new Date();
            await storedPlaylist.save();

            return {
                success: true,
                message: 'No new songs',
                newSongs: [],
                playlist: playlistInfo
            };
        }

    } catch (error) {
        console.error('❌ Error checking playlist:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Check multiple playlists
 */
const checkMultiplePlaylists = async (playlistIds) => {
    const results = [];
    
    for (const playlistId of playlistIds) {
        const result = await checkPlaylistForChanges(playlistId);
        results.push({ playlistId, ...result });
    }
    
    return results;
};

module.exports = {
    checkPlaylistForChanges,
    checkMultiplePlaylists
};
