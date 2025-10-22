const UserProfile = require('../models/UserProfile')
const { uploadImageToCloud } = require('../helpers/uploader')
const { updateUserProfile } = require('../controllers/update-user-profile')
const cloudinary = require('../config/cloudinary')

const updateUserProfile_and_Picture = async (req, res) => {

    let newProfilePhotoId = null;
    try {

        if (!req.file) {
            return updateUserProfile(req, res);
        }

        const { name, bio, gender } = req.body;
        const userId = req.userInfo.userId;
        const userName = req.userInfo.username;

        const user = await UserProfile.findOne({ userId: userId });

        //upload new profile photo
        const { url, publicId } = await uploadImageToCloud(req.file.buffer, req.file.originalname);
        newProfilePhotoId = publicId

        let UserProfileData, oldProfilePhotoId;

        if (user) {
            //store existing profile photo
            oldProfilePhotoId = user.profilePhotoPublicId

            UserProfileData = await UserProfile.findByIdAndUpdate(user.id, {
                name, bio, gender, userId, userName, profilePhotoUrl: url, profilePhotoPublicId: publicId
            }, { new: true });

            try {
                // delete existing profile photo using the stored value
                await cloudinary.uploader.destroy(oldProfilePhotoId);
            } catch (error) {
                console.error('Failed to delete old photo !');
            }

        } else {
            UserProfileData = await UserProfile.create({
                name, bio, gender, userId, userName, profilePhotoUrl: url, profilePhotoPublicId: publicId
            });
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