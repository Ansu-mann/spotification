const mongoose = require('mongoose');

const connectToDb = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not set');
        }
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB is connected successfully!`);

    } catch (error) {
        console.error(`MongoDB connection failed:`, error.message);
        // Don't exit immediately in production, allow for retry
        if (process.env.NODE_ENV === 'production') {
            console.log('Retrying database connection in 5 seconds...');
            setTimeout(connectToDb, 5000);
        } else {
            process.exit(1);
        }
    }
}

module.exports = connectToDb;