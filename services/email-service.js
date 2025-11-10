const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

/**
 * Send email notification for new songs added to playlist
 */
const sendNewSongsNotification = async (playlistName, newSongs) => {
    try {
        const transporter = createTransporter();

        // Build email content
        const songList = newSongs.map((song, index) => 
            `${index + 1}. ${song.name} - ${song.artists}`
        ).join('\n');

        const mailOptions = {
            from: `"Spotify Notifications" <${process.env.EMAIL_USER}>`,
            to: process.env.NOTIFICATION_EMAIL,
            subject: `🎵 New Song${newSongs.length > 1 ? 's' : ''} Added to "${playlistName}"`,
            text: `
Hello!

${newSongs.length} new song${newSongs.length > 1 ? 's have' : ' has'} been added to your playlist "${playlistName}":

${songList}

Happy listening! 🎧

---
This is an automated notification from your Spotify Playlist Monitor.
            `,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background-color: #1DB954; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                        <h2 style="margin: 0;">🎵 New Song${newSongs.length > 1 ? 's' : ''} Added!</h2>
                    </div>
                    <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; color: #333;">
                            <strong>${newSongs.length}</strong> new song${newSongs.length > 1 ? 's have' : ' has'} been added to your playlist 
                            <strong>"${playlistName}"</strong>:
                        </p>
                        <ul style="list-style: none; padding: 0;">
                            ${newSongs.map(song => `
                                <li style="padding: 10px; margin: 5px 0; background-color: #f9f9f9; border-left: 4px solid #1DB954; border-radius: 4px;">
                                    <strong>${song.name}</strong><br>
                                    <span style="color: #666; font-size: 14px;">${song.artists}</span>
                                </li>
                            `).join('')}
                        </ul>
                        <p style="margin-top: 30px; color: #888; font-size: 14px;">
                            Happy listening! 🎧
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #aaa; font-size: 12px; text-align: center;">
                            This is an automated notification from your Spotify Playlist Monitor.
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Test email configuration
 */
const sendTestEmail = async () => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Spotify Notifications" <${process.env.EMAIL_USER}>`,
            to: process.env.NOTIFICATION_EMAIL,
            subject: '✅ Spotify Notification System - Test Email',
            text: 'Your email notification system is working correctly!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1DB954;">✅ Test Successful!</h2>
                    <p>Your Spotify notification system is configured correctly and ready to send notifications.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Test email failed:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendNewSongsNotification,
    sendTestEmail
};
