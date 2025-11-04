require('dotenv').config({ path: '../.env'})

const User = require('../models/User');
const Video = require('../models/Video');
const TokenBlackList = require('../models/TokenBlackList');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');

const deleteEverything = async () => {
    try {
        console.log('Starting cleanup...');

        // Get all videos to delete from Cloudinary
        const videos = await Video.find({}, 'publicId');
        console.log(`Found ${videos.length} videos to delete from Cloudinary`);

        // Delete videos from Cloudinary
        for (const video of videos) {
            if (video.publicId) {
                try {
                    await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
                    console.log(`Deleted video: ${video.publicId}`);
                } catch (error) {
                    console.error(`Failed to delete video ${video.publicId}:`, error);
                }
            }
        }

        // Get all users with profile photos
        const users = await User.find({}, 'profilePhotoPublicId');
        console.log(`Found ${users.length} users to check for profile photos`);

        // Delete profile photos from Cloudinary
        for (const user of users) {
            if (user.profilePhotoPublicId) {
                try {
                    await cloudinary.uploader.destroy(user.profilePhotoPublicId);
                    console.log(`Deleted profile photo: ${user.profilePhotoPublicId}`);
                } catch (error) {
                    console.error(`Failed to delete photo ${user.profilePhotoPublicId}:`, error);
                }
            }
        }

        // Delete all data from MongoDB
        await User.deleteMany({});
        console.log('Deleted all users');

        await Video.deleteMany({});
        console.log('Deleted all videos');

        await TokenBlackList.deleteMany({});
        console.log('Deleted all blacklisted tokens');

        console.log('✅ Cleanup completed successfully!');

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    }
};

// Connect to database and run cleanup
const runCleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        await deleteEverything();
        
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        
    } catch (error) {
        console.error('Database connection failed:', error);
    }
};

// Run the cleanup
runCleanup();
