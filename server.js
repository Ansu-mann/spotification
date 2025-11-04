require('dotenv').config()
const express = require('express')
const connectToDb = require('./database/db')
const authRoutes = require('./routes/auth-routes')
const homeRoutes = require('./routes/home-routes')
const adminRoutes = require('./routes/admin-routes')
const userProfile = require('./routes/userProfile-routes')

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
app.use('/api/auth', authRoutes)
app.use('/api/home', homeRoutes)
app.use('/api', adminRoutes)
app.use('/api/user', userProfile)

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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
})