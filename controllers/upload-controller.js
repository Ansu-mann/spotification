const User = require('../models/User');
const { uploadImageToCloud } = require('../helpers/uploader')
const { updateUserProfile } = require('../controllers/update-user-profile')
const cloudinary = require('../config/cloudinary')

const updateUserProfile_and_Picture = async (req, res) => {

    let newProfilePhotoId = null;
    try {

        if (!req.file) {
            return updateUserProfile(req, res);
        }

        let { fullname, bio, gender, username, email } = req.body;
        username = username?.toLowerCase();
        gender = gender?.toLowerCase();
        const userId = req.userInfo.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Username validation functions
        const userNameContainsSymbols = (username) => {
            return /[^a-z0-9._]/.test(username);
        }

        const startsWithNumber = (username) => {
            return /^[0-9]/.test(username);
        }

        // Validate username format if username is being updated
        if (username && username !== user.username) {
            if ((username !== username.toLowerCase()) || (userNameContainsSymbols(username)) || (startsWithNumber(username))) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid username! Please enter a valid username'
                })
            }
        }

        // Validate fullname length if fullname is being updated
        if (fullname) {
            if (fullname.length > 30) {
                return res.status(400).json({
                    success: false,
                    message: 'Fullname must be less than 30 characters'
                })
            }
            if (fullname.length < 3) {
                return res.status(400).json({
                    success: false,
                    message: 'Fullname must be atleast 3 characters long'
                })
            }
        }

        try {
            if (username && username !== user.username) {
                const existingUser = await User.findOne({ username });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Username already taken! Please choose another one'
                    })
                }
            }
        } catch (error) {
            console.error('Error checking username', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking username'
            })
        }

        try {
            if (email && email !== user.email) {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email already exists! Please provide another email'
                    })
                }
            }
        } catch (error) {
            console.error('Error checking email', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking email'
            })
        }

        //upload new profile photo
        const { url, publicId } = await uploadImageToCloud(req.file.buffer, req.file.originalname);
        newProfilePhotoId = publicId

        let UserProfileData, oldProfilePhotoId;

        //store existing profile photo
        oldProfilePhotoId = user.profilePhotoPublicId

        UserProfileData = await User.findByIdAndUpdate(userId, {
            fullname, bio, gender, username, email, profilePhotoUrl: url, profilePhotoPublicId: publicId
        }, { new: true });

        if (oldProfilePhotoId) {
            try {
                // delete existing profile photo using the stored value
                await cloudinary.uploader.destroy(oldProfilePhotoId);
            } catch (error) {
                console.error('Failed to delete old photo !');
            }
        }

        return res.status(200).json({
            success: true,
            message: 'User details updated successfully',
            UserProfileData
        })

    } catch (error) {
        console.error('Error in updateUserProfile_and_Picture', error);

        if (newProfilePhotoId) {
            try {
                await cloudinary.uploader.destroy(newProfilePhotoId);
            } catch (error) {
                console.error('cleanUp Failed', error);
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Unable to upload profile picture'
        })
    }
}

module.exports = { updateUserProfile_and_Picture }