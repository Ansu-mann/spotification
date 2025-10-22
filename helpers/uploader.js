const cloudinary = require('../config/cloudinary')

const uploadImageToCloud = async (fileBuffer, originalName) => {
    try{
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    public_id: `Image_${Date.now()}_${originalName.split('.')[0]}`
                },
                (error, result) => {
                    if (error) {
                        reject(error)
                    }else {
                        resolve ({
                            url: result.secure_url,
                            publicId: result.public_id
                        })
                    }
                }
            ).end(fileBuffer);
        })
    }catch(error){
        console.error(`Error uploading to cloud, uploadImageToCloud`, error);
        throw error
    }
}

module.exports = { uploadImageToCloud };