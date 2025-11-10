require('dotenv').config()
const express = require('express')
const cron = require('node-cron')
const connectToDb = require('./database/db')
const spotifyRoutes = require('./routes/spotify-routes')
const { checkMultiplePlaylists } = require('./services/playlist-polling-service')

const app = express();
const PORT = process.env.PORT || 3001;

// Global error handlers
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Don't exit on MongoDB timeout errors
    if (err.error && err.error.name === 'TimeoutError') {
        console.log('MongoDB timeout - continuing...');
        return;
    }
    process.exit(1);
});

// Basic health check route
app.get('/healthCheck', (req, res) => {
    res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// DB connection
connectToDb();

// middleware
app.use(express.json())

// CORS middleware for frontend integration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// Routes
app.use('/api/spotify', spotifyRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler - Express 5.x compatible
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Setup cron job for playlist monitoring
    if (process.env.MONITORED_PLAYLISTS) {
        const playlists = process.env.MONITORED_PLAYLISTS.split(',').map(id => id.trim());
        
        // Run every 5 minutes: */5 * * * *
        // Run every hour: 0 * * * *
        // Run every 30 minutes: */30 * * * *
        cron.schedule('*/5 * * * *', async () => {
            console.log('\n🔔 Running scheduled playlist check...');
            const results = await checkMultiplePlaylists(playlists);
            
            const newSongsCount = results.reduce((sum, r) => sum + (r.newSongs?.length || 0), 0);
            if (newSongsCount > 0) {
                console.log(`✅ Found ${newSongsCount} new song(s) across all playlists`);
            } else {
                console.log('✅ No new songs found');
            }
        });
        
        console.log(`🎵 Playlist monitoring active for: ${playlists.join(', ')}`);
        console.log('⏰ Checking every 5 minutes');
    }
})