const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Replace with your SMTP host
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASSWORD // Your email password or app-specific password
    }
});

async function sendEmail(to, subject, text, html) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = { sendEmail };
