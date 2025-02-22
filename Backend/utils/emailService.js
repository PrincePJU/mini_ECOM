const nodemailer = require('nodemailer');

// Create a transporter using SMTP
// Verify required environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  console.error('Missing required email environment variables');
  throw new Error('EMAIL_USER and EMAIL_APP_PASSWORD must be set in environment');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Using Gmail directly instead of env variable
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  debug: false, // Disable debug logging
  logger: false // Disable logger
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP Verification Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});

// Send welcome email
async function sendWelcomeEmail(userEmail, name, resetPasswordToken) {
  try {
      // Construct the confirmation URL
      const confirmationUrl = `${process.env.REACT_APP_URL}/confirm-signup/${resetPasswordToken}`;

      // Send the email with the confirmation button
      await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: userEmail,
          subject: 'Confirm Your Sign-In',
          html: `
              <h1>Welcome ${name}!</h1>
              <p>Thank you for signing up. Please confirm your email address by clicking the button below:</p>
              <a href="${confirmationUrl}" style="
                  display: inline-block;
                  padding: 10px 20px;
                  font-size: 16px;
                  color: white;
                  background-color: #007BFF;
                  text-decoration: none;
                  border-radius: 5px;
              ">Confirm Sign-In</a>
              <p>If you did not sign up, please ignore this email.</p>
          `,
      });
  } catch (error) {
      console.error('Error sending welcome email:', {
          error: error.message,
          code: error.code,
          response: error.response,
      });
      throw error;
  }
}


// Send password reset email
async function sendPasswordResetEmail(userEmail, resetToken) {
  // Verify APP_URL is set
  if (!process.env.APP_URL) {
    throw new Error('APP_URL must be set in environment');
  }

  try {
    const resetLink = `${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <div style="margin: 20px 0;">
          <a href="${resetLink}" 
             style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          ${resetLink}
        </p>
      `
    });
  } catch (error) {
    console.error('Error sending password reset email:', {
      error: error.message,
      code: error.code,
      response: error.response,
      user: process.env.EMAIL_USER // Log email user for verification
    });
    throw error;
  }
}

async function sendPasswordResetNotificationEmail(userEmail) {
  try {
      await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: userEmail,
          subject: 'Your Password Has Been Reset',
          html: `
              <h1>Password Reset Successfully</h1>
              <p>Hello,</p>
              <p>Your password has been successfully reset. If you did not perform this action, please contact our support team immediately.</p>
              <p>Thank you!</p>
          `
      });
  } catch (error) {
      console.error('Error sending password reset notification:', error);
      throw new Error('Could not send password reset notification');
  }
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,sendPasswordResetNotificationEmail
};