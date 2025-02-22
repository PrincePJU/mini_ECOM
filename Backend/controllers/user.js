const User = require('../models/user');
const { setUser } = require('../services/auth')
const { sendWelcomeEmail, sendPasswordResetEmail, sendPasswordResetNotificationEmail } = require('../utils/emailService');
const argon2 = require('argon2');
const crypto = require('crypto');
const { hashPassword } = require('../utils/password');
const { validatePassword, comparePasswords } = require('../utils/passwordValidation');

async function verifyPassword(plaintextPassword, hashedPassword) {
    try {
        const isMatch = await argon2.verify(hashedPassword, plaintextPassword);
        return isMatch;
    } catch (err) {
        console.error('Error verifying password:', err);
        throw err;
    }
}

async function handleUserSignup(req, res) {
    const { name, email, password, confirmPassword,longitude,latitude } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
    }

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return res.status(400).json({
            error: "Password validation failed",
            details: passwordValidation.errors
        });
    }

    // Check if passwords match
    if (!comparePasswords(password, confirmPassword)) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Generate a reset password token
        const confirmationToken = crypto.randomBytes(32).toString('hex');

        // Store the user data temporarily (pending confirmation)
        const user =await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            resetPasswordToken: confirmationToken, // Assign the token to the schema field
            isConfirmed: false, // Set confirmation status to false
            longitude,
            latitude,
            delivery_address:"OM"
        });

        // Send the welcome email with the reset password token
        await sendWelcomeEmail(email, name, confirmationToken);

        return res.status(200).json({ success: true, data: { user } });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: "Error during signup" });
    }
}


async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(500).json({ err: "Email and password are required" });
        
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.staus(404).json({"error":"user is not set!!"});
        }

        // Verify the password
        const isMatch = await verifyPassword(password, user.password);  // Compare with the stored hashed password

        // If the password doesn't match
        if (!isMatch) {
            return res.staus(404).json({"error":"password does not match!!"});
        }

        // Password matches, generate a token and send it in a cookie
        const token = setUser(user);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
     
        return res.status(200).json({ success: true, data: { user }, token: token });
    } catch (error) {
        console.error('Login error:', error);
        return res.staus(404).json({ err: "An error occurred during login" });
    }
}

// Backend Changes

// ForgotPassword Controller
async function handleForgotPassword(req, res) {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Email not found' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        const resetLink = `${process.env.REACT_APP_URL}/reset-password/${resetToken}`;
        await sendPasswordResetEmail(user.email, resetLink);

        res.status(200).json({ message: 'Reset link sent to your email' });
    } catch (error) {
        console.error('Error in handleForgotPassword:', error);
        res.status(500).json({ error: 'Error processing request' });
    }
}


// ResetPassword Controller
async function handleResetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;

    try {
        if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        user.password = await hashPassword(password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        await sendPasswordResetNotificationEmail(user.email);
        res.status(200).json({ message: 'Password successfully reset' });
    } catch (error) {
        console.error('Error in handleResetPassword:', error);
        res.status(500).json({ error: 'Error resetting password' });
    }
}

async function handleconfirmSignUp(req, res) {
    const { token } = req.params; // Extract token from request parameters

    try {
        const user = await User.findOne({ resetPasswordToken: token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.isConfirmed = true;
        user.resetPasswordToken = null;
        await user.save();

        res.status(200).json({ message: 'Sign-up confirmed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Controller for logging out
async function handleUserLogout(req, res) {
    try {
        // Clear the authentication token cookie
        res.clearCookie('token', {
            httpOnly: true, // Prevent JavaScript access to the cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict' // CSRF protection
        });

        // Respond with a success message
        return res.status(200).json({ success: true });
    } catch (error) {
        // Handle any errors that may occur during logout
        return res.status(500).json({ error: "Logout failed" });
    }
}

async function handleUpdateLocUser(req,res) {
    const { email, latitude, longitude,delivery_address } = req.body;

    try {
      // Validate the input
      if (!email || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: "Email, latitude, and longitude are required." });
      }
  
      // Find the user by email and update their location
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { latitude, longitude ,delivery_address},
        { new: true, runValidators: true } // Return the updated user and validate input
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: "User not founddddddd." });
      }
  
      res.status(200).json({ message: "Location updated successfully.", user: updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while updating the location." });
    }
};

module.exports = { handleUserSignup, handleUserLogin, handleForgotPassword, handleUpdateLocUser,handleResetPassword, handleUserLogout, handleconfirmSignUp };